# slvrfivo/qwen3-4b-writing-eval-v1-merged

## Resumen

Qwen3-4B Korean Writing Scoring QLoRA v1 es un ajuste fino supervisado del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario slvrfivo para la evaluacion de escritura en coreano del National Institute of Korean Language (NIKL) en el marco de la competicion AI말평 de 2026. El modelo recibe un enunciado de redaccion y una redaccion argumentativa completa en coreano, y devuelve un objeto JSON estricto con puntuaciones enteras de 1 a 5 y justificaciones en coreano para tres dimensiones: contenido, organizacion y expresion.

Tecnicamente se trata de un QLoRA de 4 bits en formato NF4 sobre el modelo base de 4.022.468.096 parametros, entrenado con 2.000 muestras durante una sola epoca y exportado como pesos BF16 independientes tras fusionar el adaptador. No es un modelo de proposito general: es un artefacto de competicion con un formato de salida fijo y un sesgo deliberado hacia la tarea de puntuacion.

Su relevancia radica en que documenta un caso completo de ajuste fino orientado a metrica, con objetivo de entropia cruzada ponderado por rol de token, evaluacion local reproducible y resultados en un conjunto de test oculto (RMSE 0.6213, Spearman 0.5697), ademas de participacion en la fase de evaluacion humana experta del certamen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino QLoRA 4-bit NF4 fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4; exportacion en BF16; cuantizaciones GGUF/AWQ no publicadas |
| Idiomas soportados | Coreano (ko) |
| Licencia | no disponible para el artefacto; modelo base Apache-2.0; codigo fuente Apache-2.0 |
| Formato de pesos | safetensors (BF16 fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.022 millones de parametros. Sobre el se aplico QLoRA con cuantizacion 4-bit NF4, entrenando un adaptador que posteriormente se fusiono en pesos BF16 independientes. El entrenamiento uso 2.000 muestras y una sola epoca; el autor no especifica la composicion exacta del dataset mas alla de que proviene del entorno de la competicion.

La innovacion principal es el objetivo de lenguaje causal ponderado por rol de token: los tokens de prompt reciben peso 0.00, los de estructura JSON 0.25, los de puntuacion 10.00 y los de justificacion 0.05. Esta ponderacion heuristica concentra el gradiente en la prediccion de la nota numerica. El autor advierte explicitamente que no se ejecuto una ablacion con perdida uniforme, por lo que la mejora frente a zero-shot debe atribuirse al conjunto del ajuste QLoRA y no de forma aislada al esquema ponderado. La generacion final usa `repetition_penalty=1.05` para mitigar degeneraciones repetitivas observadas en un subconjunto de salidas del modelo fusionado.

## Capacidades

- Generacion de texto en coreano con formato de salida JSON estricto y validable.
- Puntuacion de redacciones argumentativas en tres dimensiones: contenido, organizacion y expresion, con enteros de 1 a 5.
- Generacion de justificaciones breves en coreano para cada dimension puntuada.
- Conversacional y compatible con plantillas de chat del modelo base Qwen3-Instruct.
- Soporte de tool calling y function calling heredado del modelo base (no validado especificamente para esta tarea).
- Capacidades multilingues del modelo base, aunque el ajuste fino esta orientado exclusivamente al coreano.
- Compatible con text-generation-inference y endpoints compatibles segun los tags del repositorio.

## Casos de uso

- Evaluacion automatizada de redacciones en certamenes de lengua coreana: el modelo reproduce el formato exacto de la competicion AI말평, con JSON de tres dimensiones y justificaciones, lo que permite integrarlo en un pipeline de correccion por lotes con validacion de esquema.
- Precorreccion y triaje en plataformas educativas coreanas: dado su RMSE de 0.6213 en test oculto, puede usarse como primera pasada para priorizar que redacciones requieren revision humana, reduciendo carga del evaluador.
- Investigacion sobre objetivos ponderados por token: el repositorio de origen incluye configuracion de entrenamiento, evaluador y registro de experimentos, lo que lo convierte en una referencia reproducible para estudiar perdidas ponderadas en tareas de regresion ordinal.
- Generacion de retroalimentacion preliminar al estudiante: las justificaciones por dimension permiten devolver comentarios estructurados en coreano, siempre con la advertencia de que no equivalen a feedback humano detallado.
- Benchmarking de modelos de evaluacion educativa: sirve como linea base ajustada frente a Qwen3-4B zero-shot (RMSE 1.1612, Spearman 0.2753) en experimentos comparativos.
- Despliegue ligero en infraestructura modesta: con 4.022 millones de parametros en BF16, cabe en una unica GPU de 24 GB y se sirve con vLLM en un solo comando, lo que facilita prototipos y demos internas.
- Analisis de sesgo en puntuacion automatica: la regresion hacia puntuaciones centrales documentada por el autor permite estudiar el comportamiento de modelos ajustados en los extremos de la escala.

## Benchmarks y rendimiento

Validacion local:

| Modelo | RMSE medio (↓) | Spearman medio (↑) |
|---|---:|---:|
| Baseline estadistico de media | 0.7870 | indefinido* |
| Qwen3-4B zero-shot | 1.1612 | 0.2753 |
| Qwen3-4B QLoRA v1 ponderado (seleccionado) | 0.6384 | 0.5237 |
| Qwen3-4B QLoRA v1b balanceado por clase | 0.6452 | 0.5189 |

\*El baseline estadistico redondeado es constante, por lo que la correlacion de Spearman no esta definida.

Test oculto oficial:

| Metrica | Valor |
|---|---:|
| RMSE | 0.6213 |
| Spearman | 0.5697 |
| LLM Judge | 3.0337 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para pesos, mas cache KV y overhead; en la practica 10-12 GB para inferencia con contexto moderado.
- VRAM estimada en 4-bit (si se cuantiza manualmente): alrededor de 3-4 GB para pesos, aunque no se publican artefactos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para serving concurrente con vLLM; L40S o RTX 6000 Ada para produccion moderada.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB) en BF16; en GPUs de 8 GB requeriria cuantizacion adicional no publicada.
- Opciones de despliegue: vLLM (`vllm serve slvrfivo/qwen3-4b-writing-eval-v1-merged --dtype bfloat16`), transformers con la plantilla de chat del modelo base, text-generation-inference. No se publican pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Importante: si el sistema de serving sobrescribe `generation_config.json`, hay que pasar `repetition_penalty=1.05` explicitamente para reproducir el ajuste de la competicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| slvrfivo/qwen3-4b-writing-eval-v1-merged | 4.022 M | no disponible | Puntuacion de redaccion en coreano (QLoRA) | no disponible | Hugging Face, 7 descargas |
| Qwen/Qwen3-4B-Instruct-2507 | 4.022 M | no disponible | Instruccion general | Apache-2.0 | Hugging Face, ampliamente disponible |
| Qwen3-4B zero-shot (mismo base, sin ajuste) | 4.022 M | no disponible | Instruccion general evaluada en la tarea | Apache-2.0 | Uso directo del base |

Frente al modelo base, el ajuste mejora el RMSE de 1.1612 a 0.6384 y el Spearman de 0.2753 a 0.5237 en validacion local, a costa de especializarse en un unico formato de salida y un unico idioma. No se dispone de informacion sobre otros modelos publicos comparables especificamente entrenados para puntuacion de redaccion en coreano.

## Limitaciones y advertencias

- Ajustado a una rubrica y distribucion de prompts especificas de competicion; el rendimiento fuera de ese dominio y rubrica es desconocido.
- El conjunto de entrenamiento contiene solo 2.000 redacciones, lo que limita la generalizacion.
- Las predicciones muestran regresion hacia puntuaciones centrales; las notas 1 y 5 son mas dificiles de predecir que 3 y 4.
- No validado como sistema de evaluacion educativa de proposito general ni para decisiones de alto impacto.
- Las justificaciones generadas no equivalen a retroalimentacion humana detallada y no deben presentarse como tal.
- El beneficio del objetivo ponderado por token no esta aislado: no se ejecuto una ablacion con perdida uniforme.
- Riesgo de degeneracion repetitiva en generacion; requiere `repetition_penalty=1.05` si el serving no respeta la configuracion guardada.
- Licencia del artefacto no disponible: verificar condiciones antes de cualquier uso comercial. Los datos de competicion no se redistribuyen y estan sujetos a sus propios terminos.
- Idioma limitado al coreano en la practica, pese a las capacidades multilingues del modelo base.
- Riesgo de alucinacion en las justificaciones y en la coherencia entre nota y rationale no cuantificado en la informacion disponible.
- Artefacto de investigacion con 7 descargas y 0 likes: sin validacion independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/slvrfivo/qwen3-4b-writing-eval-v1-merged
- Repositorio de codigo fuente, configuracion de entrenamiento y pipeline de exportacion: https://github.com/slvrfivo/ai-writing-eval
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Prompts oficiales de la competicion (referenciados en la model card): `prompts/official/writing_scoring_2026-07-20/` dentro del repositorio de GitHub
- Configuracion de generacion de la submission: `configs/submission_generation.json` dentro del repositorio de GitHub
