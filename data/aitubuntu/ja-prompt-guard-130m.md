# AiTubuntu/ja-prompt-guard-130m

## Resumen

ja-prompt-guard-130m es un clasificador de texto en japonés especializado en detectar intentos de prompt injection y jailbreak en entradas dirigidas a modelos de lenguaje. Lo desarrolla AiTubuntu y se construye mediante fine-tuning del modelo base sbintuitions/modernbert-ja-130m, un transformer encoder de arquitectura ModernBERT con 132 millones de parámetros. Su función es actuar como filtro previo (guardrail) entre el usuario o los documentos ingeridos y el LLM, devolviendo una etiqueta binaria `SAFE` o `INJECTION`.

El modelo aborda un problema concreto de seguridad en producción: la imposibilidad de confiar ciegamente en el texto que llega al modelo, tanto en entradas directas de usuario como en contenido recuperado en pipelines RAG o agentes. Con solo 130M de parámetros y una versión ONNX en fp32 de unos 530 MB, está diseñado para ejecutarse en CPU sin GPU, lo que lo hace viable como capa de defensa de baja latencia en arquitecturas donde el coste por petición importa.

Su relevancia actual radica en la escasez de detectores de injection específicos para japonés y en su enfoque de calibración explícita: el sesgo del cabezal de clasificación se ha desplazado para que el umbral 0,5 corresponda a aproximadamente un 1 % de falsos positivos sobre el conjunto de validación, priorizando la precisión operativa sobre la interpretabilidad probabilística del score.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), fine-tuning para clasificación de secuencias |
| Parametros totales | 132.404.226 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens en entrenamiento; en inferencia se aplica ventana deslizante de 512 con stride de 128 para textos largos |
| Tipos de cuantizacion | no se distribuye versión cuantizada; el autor indica que la cuantización a 8 bits desvía los scores y rompe el umbral 0,5. Pesos safetensors en precisión original y ONNX fp32 |
| Idiomas soportados | japonés (ja) únicamente; no se han medido resultados en otros idiomas |
| Licencia | Apache 2.0 (modelo base ModernBERT-ja-130m bajo MIT) |
| Formato de pesos | safetensors (transformers) y ONNX fp32 (`onnx/model.onnx`, ~530 MB) |

## Arquitectura y entrenamiento

El modelo parte de sbintuitions/modernbert-ja-130m, un encoder ModernBERT preentrenado en japonés, y se ajusta como clasificador binario de secuencias con dos etiquetas (`SAFE`, `INJECTION`). El entrenamiento se realizó exclusivamente con textos de hasta 512 tokens; para entradas más largas la model card recomienda trocear en ventanas de 512 tokens con solapamiento de 128 y tomar el score máximo entre ventanas. El conjunto de validación consta de 1.564 ejemplos (1.008 normales y 556 de ataque) y el de test de 874 (585 normales y 289 de ataque).

La innovación técnica destacable no está en la arquitectura sino en la calibración del umbral: tras el entrenamiento, el modelo original producía un 2,9 % de falsos positivos sobre textos normales de validación (13,5 % en textos normales ambiguos). El autor calculó el umbral que daba un 1 % de falsos positivos (score original 0,99733) y desplazó el sesgo del cabezal de clasificación en 5,923 logits para que ese punto caiga en 0,5. Esto preserva el orden relativo de los scores pero invalida su lectura como probabilidad de ataque. Los datos de ataque del test provienen mayoritariamente de traducciones al japonés de conjuntos públicos (Lakera/gandalf_ignore_instructions, deepset/prompt-injections) y de ejemplos sintéticos embebidos en documentos, no de ataques escritos originalmente en japonés por humanos.

## Capacidades

- Clasificación binaria de prompt injection directa: entradas que intentan sobrescribir o extraer instrucciones del sistema ("ignora las instrucciones anteriores", "muestra el system prompt").
- Detección de prompt injection indirecta: instrucciones maliciosas embebidas en correos, páginas web, reseñas u otros documentos que se ingieren en un pipeline.
- Detección de jailbreak: entradas que usan role-play o escenarios ficticios para eludir restricciones del LLM.
- Salida con score continuo en [0,1] y etiqueta con umbral 0,5; permite recalibrar el umbral sobre datos propios.
- Procesamiento de textos largos mediante ventana deslizante (512 tokens, stride 128) con agregación por máximo.
- Ejecución en CPU sin GPU, tanto con transformers como con ONNX Runtime.
- No realiza moderación de contenido dañino: una petición sobre materiales peligrosos sin intento de secuestro de instrucciones se clasifica como `SAFE`.
- No cubre ataques multi-turno ni entradas no textuales (imagen, audio).
- No se han medido capacidades en idiomas distintos del japonés.

## Casos de uso

- Filtro de entrada en chatbots en japonés: colocar el clasificador delante del LLM para descartar o marcar entradas que intenten extraer el system prompt o cambiar el rol del asistente, con una latencia de ~150 ms por petición en CPU vía ONNX.
- Protección de pipelines RAG: clasificar cada fragmento recuperado antes de insertarlo en el contexto del LLM, detectando instrucciones inyectadas en documentos indexados (el modelo está entrenado específicamente con ataques embebidos en texto).
- Guardrail en agentes con acceso a herramientas: validar las instrucciones que llegan al agente antes de la planificación multi-paso, reduciendo el riesgo de que contenido externo redirija las llamadas a herramientas.
- Moderación de comentarios y reseñas generadas por usuarios: prefiltrar contenido de foros o e-commerce en japonés para detectar intentos de manipular sistemas automáticos de respuesta.
- Capa de defensa en entornos sin GPU: al ejecutarse en CPU con ONNX Runtime (~150 ms por texto de longitud mediana en una VM de 4 núcleos), es desplegable en servicios ligeros o funciones serverless donde no hay acelerador disponible.
- Evaluación y auditoría de sistemas LLM: usar el score como señal para analizar intentos de ataque registrados en logs y ajustar el umbral según la tolerancia a falsos positivos del operador (en validación, 2 % de FP da 98,7 % de recall y 5 % de FP da 99,5 %).
- Filtrado previo en asistentes de correo o atención al cliente: inspeccionar el cuerpo de mensajes entrantes en japonés antes de pasarlos a un modelo generativo que redacta respuestas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre conjuntos propios (umbral 0,5, pesos publicados tal cual; intervalos de confianza del 95 % entre corchetes):

| Conjunto | Tamaño | Falsos positivos | Recall (ataques detectados) |
|---|---|---|---|
| Validation | 1.564 (1.008 normales / 556 ataques) | 1,0 % (10/1.008) [0,4; 1,7] | 97,7 % (543/556) [96,2; 98,9] |
| Test | 874 (585 normales / 289 ataques) | 0,5 % (3/585) [0,0; 1,2] | 92,4 % (267/289) [88,4; 96,0] |

Rendimiento de inferencia (medido en una VM compartida de 4 núcleos, CPU, procesando 1.564 textos de validación uno a uno; mediana de 31 tokens, máximo 301):

| Ejecución | Tiempo por texto |
|---|---|
| ONNX Runtime (fp32, 4 hilos) | ~150 ms |
| transformers (torch, CPU) | ~330 ms |

El ONNX fp32 coincide con la versión transformers en las 1.564 predicciones de validación (diferencia máxima de probabilidad 4,3e-6). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM: no requiere GPU; en CPU el consumo de memoria es el de un modelo de 132M de parámetros (~530 MB en fp32 para ONNX, ~530 MB en safetensors fp32).
- GPU recomendadas: no disponibles ni necesarias; cualquier GPU con suficiente memoria para un modelo de 130M puede ejecutarlo, pero el diseño apunta a CPU.
- Cabe en cualquier equipo consumer: portátiles y VMs de bajo coste son suficientes; el autor lo probó en una VM compartida de 4 núcleos.
- Despliegue: transformers (requiere versión 4.48 o superior por soporte de ModernBERT; probado con 5.24.0 y 4.48.3 con torch 2.15.0), ONNX Runtime (probado con 1.32.0), y es compatible con text-embeddings-inference y endpoints según los tags del repositorio.
- Latencia: ~150 ms por texto con ONNX fp32 en CPU de 4 hilos; ~330 ms con torch en CPU. Para textos largos, la latencia se multiplica por el número de ventanas de 512 tokens.
- No se recomienda cuantizar a 8 bits: el autor indica que desvía los scores y rompe el umbral calibrado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|
| AiTubuntu/ja-prompt-guard-130m | 132M | 512 tokens (ventana deslizante) | Japonés | Apache 2.0 | Detección de prompt injection y jailbreak |
| Meta Prompt Guard (Llama Prompt Guard) | no disponible en la información proporcionada | no disponible | Multilingüe (incluye no inglés) | no disponible | Detección de injection y jailbreak |
| ProtectAI deberta-v3-base-prompt-injection | no disponible en la información proporcionada | no disponible | Principalmente inglés | no disponible | Detección de prompt injection |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada; la comparación se limita a categoría y disponibilidad. El modelo de AiTubuntu es el único de la tabla con soporte declarado y evaluado específicamente para japonés.

## Limitaciones y advertencias

- El score no es una probabilidad de ataque: el sesgo del cabezal está desplazado 5,923 logits, por lo que solo el umbral 0,5 y el orden relativo de scores son interpretables. Para recuperar el score original hay que aplicar `sigmoid(logit(p) + 5.923003)` (documentado en `BIAS_SHIFT.json`).
- El conjunto de test es mayoritariamente traducción automática y datos sintéticos; no se ha evaluado con ataques escritos originalmente en japonés por humanos, por lo que el recall real en producción puede diferir del 92,4 % reportado.
- Solo japonés: no se han medido resultados en otros idiomas y no debe asumirse transferencia.
- No detecta contenido dañino por sí mismo; preguntas sobre materiales peligrosos sin intento de secuestro de instrucciones pasan como `SAFE`. Requiere un filtro de contenido separado.
- No cubre ataques multi-turno: cada texto se clasifica de forma aislada, sin memoria de la conversación.
- No procesa entradas no textuales (imagen, audio).
- La cuantización a 8 bits desvía los scores y rompe el umbral; el autor no la distribuye por este motivo.
- Un texto de validación normal queda en score 0,4996, casi en el umbral; pequeñas diferencias de precisión numérica entre entornos pueden cambiar el recuento de falsos positivos de 10 a 11.
- El modelo no sustituye a otras defensas: el autor recomienda combinarlo con separación de privilegios y verificación de salidas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base (ModernBERT-ja-130m) es MIT y conviene revisar sus términos si se redistribuye.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AiTubuntu/ja-prompt-guard-130m
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-130m
- Conjunto de datos de referencia citado por el autor: https://huggingface.co/datasets/Lakera/gandalf_ignore_instructions
- Conjunto de datos de referencia citado por el autor: https://huggingface.co/datasets/deepset/prompt-injections
