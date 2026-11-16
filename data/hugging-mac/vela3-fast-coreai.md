# hugging-mac/vela3-fast-CoreAI

## Resumen

Vela3-fast Core AI es una conversión experimental del modelo `vllm-sr/vela3-fast` al formato Core AI de Apple, publicada por el usuario `hugging-mac`. No se trata de un modelo generativo al uso: el artefacto distribuido contiene únicamente el denominado *decision backbone* validado, que resuelve tareas de elección entre opciones (clasificación zero-shot con dos alternativas ordenadas) y preguntas de sí/no (`noul`). El modelo no genera texto; produce probabilidades relativas sobre las opciones suministradas.

La relevancia de esta publicación es fundamentalmente técnica: demuestra la conversión de un modelo de decisión a Core AI, el runtime de Apple para ejecutar redes neuronales en Apple Silicon, con inferencia validada en CPU y una interfaz tensorial explícita documentada. El repositorio ocupa 1,5 GB y conserva los pesos originales en FP32 sin cuantización, entrenamiento ni ajuste fino adicional.

Es importante subrayar que se trata de un subconjunto experimental, no de la totalidad del modelo Vela3-fast. No incluye los adaptadores de router, span, relación, NER, evidencia ni los de dominio/factcheck/feedback del modelo original, y no soporta más de dos opciones ni contextos superiores a 128 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de decisión (decision backbone) convertida a formato Core AI; no se detalla la arquitectura interna del transformer subyacente |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 128 tokens en total (entrada, pregunta, opciones y marcadores); entradas más largas lanzan error, no se truncan |
| Tipos de cuantizacion | ninguno; pesos FP32 originales sin cuantización |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core AI (`model.aimodel`), con `tokenizer.json` y `decision.json`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto es una conversión del modelo base `vllm-sr/vela3-fast` al formato Core AI de Apple. La inferencia se ejecuta mediante el runtime Core AI, con tokenización y formateo de respuesta en el lado del host (Python o Swift). La interfaz tensorial está documentada explícitamente: entrada `main` con `input_ids` (int32, `[1,128]`), `attention_mask` (int32, `[1,128]`), `option_positions` (int32, `[1,2]`, posiciones de los dos marcadores `[O]`) y `pool_mask` (float32, `[1,128]`, desde `[SEG_user]` hasta el final del cuerpo excluyendo EOS); salida `logits` (float32, `[1,2]`). No hay estado recurrente ni caché KV persistente, y las entradas se rellenan por la derecha hasta 128 tokens.

No se proporcionan datos sobre el entrenamiento original del modelo base: ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO. La conversión no aplica entrenamiento ni ajuste fino: se limita a transformar los pesos FP32 originales al formato Core AI. La innovación técnica destacable es la validación de paridad numérica: el script `smoke.py` compara seis casos con las probabilidades de referencia del modelo original, verifica igualdad exacta de los tensores de entrada respecto a la codificación upstream y comprueba el rechazo de cinco categorías de peticiones inválidas.

## Capacidades

- Clasificación de elección (`choice`): recibe dos opciones ordenadas y devuelve sus probabilidades y la opción seleccionada.
- Clasificación binaria (`noul`): opciones fijas `no`/`yes`, devuelve `p(yes)`.
- Clasificación zero-shot con etiquetas arbitrarias definidas en tiempo de inferencia (por ejemplo, `coding` frente a `cooking`).
- Ejecución en CPU validada sobre Apple Silicon con el runtime Core AI.
- Invocación nativa desde Python (paquete `vela_coreai` con `coreai-core==1.0.0b3`) y desde Swift (`CoreAI`, `AIModel`, `loadFunction(named: "main")`).
- No genera texto: la salida es exclusivamente probabilística sobre las opciones suministradas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No soporta visión, audio ni modalidades adicionales.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.

## Casos de uso

- Enrutamiento ligero de consultas en aplicaciones macOS: clasificar una pregunta del usuario entre dos categorías predefinidas (por ejemplo, soporte técnico frente a facturación) antes de derivarla al servicio adecuado, aprovechando la inferencia en CPU y el bajo coste del modelo.
- Filtro de verificación binaria en pipelines de datos: usar el modo `noul` para decidir si un fragmento de texto pertenece a un dominio concreto (por ejemplo, «¿trata esto sobre software?») como paso de limpieza previo a un modelo mayor.
- Clasificación zero-shot de tickets o correos: definir en tiempo de ejecución dos etiquetas candidatas y obtener la probabilidad relativa de cada una, útil para triaje en herramientas internas sobre Apple Silicon.
- Validación de prototipos de modelos de decisión en el ecosistema Apple: servir como banco de pruebas para verificar la paridad entre la implementación Python y la invocación nativa Swift antes de integrar un modelo mayor.
- Demostración técnica de conversión a Core AI: emplear el repositorio como referencia reproducible (interfaz tensorial, fixtures, scripts de smoke test) para equipos que quieran portar sus propios modelos de clasificación al runtime de Apple.
- Clasificación local con requisitos de privacidad: al ejecutarse en CPU sobre el dispositivo con un modelo de 1,5 GB, permite clasificar texto sensible sin enviarlo a un servidor externo, siempre que la consulta quepa en 128 tokens.
- Pre-filtrado en sistemas de retrieval: decidir con `p(yes)` si un documento recuperado es relevante para una consulta antes de pasarlo a un modelo generativo de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, latencia ni throughput; únicamente indica que la ejecución en CPU está validada y que no se reclama rendimiento en GPU ni en ANE (la validación automática de dispositivo no finalizó por presión de recursos en el host de pruebas).

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario validado; la inferencia se ejecuta en CPU. El repositorio ocupa 1,5 GB en disco con pesos FP32.
- GPU recomendadas: no disponible; no se reclama ni valida rendimiento en GPU.
- Compatibilidad con GPU de consumo: no confirmada. El ejemplo Swift fuerza `options: .cpuOnly` y el adaptador Python usa explícitamente modo CPU.
- Aceleración por Neural Engine (ANE): no validada ni reclamada por el autor.
- Requisitos de sistema: macOS con runtime Core AI (el ejemplo se valida en macOS 27.2.1), Python 3.12.13 y `coreai-core==1.0.0b3`; para Swift, Xcode 27 o el SDK de macOS 27 como mínimo.
- Dependencias: el ejemplo con `uv` no requiere PyTorch, transformers ni los safetensors originales.
- Opciones de despliegue: paquete Python `vela_coreai` (asíncrono, una inferencia simultánea por instancia) e invocación nativa Swift mediante `CoreAI`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| vela3-fast-CoreAI (este) | no disponible | 128 tokens | Elección binaria / sí-no | Apache 2.0 | Core AI (Apple), CPU |
| vllm-sr/vela3-fast (base) | no disponible | no disponible (incluye adaptadores adicionales) | Suite completa de decisión y routing | no disponible en la información | safetensors (upstream) |
| Modelos de clasificación zero-shot tipo NLI (p. ej. DeBERTa-NLI) | variable | típicamente 512 tokens | Clasificación zero-shot multi-etiqueta | variable (habitualmente MIT o Apache 2.0) | PyTorch, ONNX, GGUF |

La comparación con clasificadores zero-shot convencionales es limitada: este artefacto restringe la salida a dos opciones y 128 tokens, mientras que los modelos NLI estándar aceptan secuencias más largas y más etiquetas. No se dispone de datos de rendimiento comparativo para establecer diferencias de precisión.

## Limitaciones y advertencias

- Es un subconjunto experimental, no el modelo Vela3-fast completo: faltan los adaptadores de router, span, relación, NER, evidencia, dominio, factcheck y feedback.
- Solo admite exactamente dos opciones; más alternativas no están soportadas por este artefacto.
- Límite estricto de 128 tokens en el total de la entrada; las entradas más largas lanzan error en lugar de truncarse.
- Las probabilidades son relativas a las opciones suministradas, no puntuaciones de confianza calibradas; no deben interpretarse como certeza absoluta.
- Una sola pregunta por inferencia y tamaño de lote 1; cada instancia admite una petición a la vez.
- No se proporciona registro completo en `hugging_mac_sdk` ni aceptación para producción.
- El ejemplo Swift no incluye tokenizador ni SDK completo para texto arbitrario: solo demuestra la invocación nativa con entradas previamente tokenizadas.
- Tokenizar únicamente el cuerpo de la entrada no produce entradas válidas; es necesario respetar las reglas de codificación de `vela_coreai.py` (marcadores `[O]`, `[SEG_user]`, EOS).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas por descalibración o por dominios alejados de los datos de entrenamiento originales, no documentados.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas: solo inglés y chino; el rendimiento en castellano no está validado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni aceptación de producción; conviene evaluar la paridad numérica con el modelo base antes de desplegar.
- El modelo base upstream no documenta en esta información sus propios datos de entrenamiento, sesgos ni limitaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hugging-mac/vela3-fast-CoreAI
- Modelo base: https://huggingface.co/vllm-sr/vela3-fast
- README en chino simplificado: https://huggingface.co/hugging-mac/vela3-fast-CoreAI/blob/main/README.zh-CN.md
- Paquete Core AI para Python (`coreai-core`): no disponible enlace directo en la información
- Documentación de Core AI de Apple: no disponible enlace directo en la información
