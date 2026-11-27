# netprojects/SenseNova-Loop-9B-LayerFit-MLX-4bit

## Resumen

SenseNova-Loop-9B-LayerFit-MLX-4bit es una cuantizacion de 4 bits del modelo SenseNova-Loop-9B de SenseNova, adaptada especificamente para Apple Silicon mediante la libreria MLX. El modelo original es un transformer con bucles (looped transformer) de aproximadamente 8.960 millones de parametros, disenado para tareas de razonamiento, y esta construido sobre una base arquitectonica que el autor etiqueta como qwen3_5, con bloques de atencion lineal y un cabezal de decodificacion especulativa MTP (multi-token prediction). Esta version concreta la publica NetProjects, un tercero no afiliado a SenseNova, bajo licencia Apache-2.0.

La innovacion principal de esta build es LayerFit, una tecnica de cuantizacion por capas que, en lugar de asignar el mismo numero de bits a todas las capas, mide la sensibilidad de cada componente (atencion, bloques de atencion lineal, MLP, embeddings y cabezal de salida) y distribuye el presupuesto de bits donde mas impacto tiene. Segun la model card, esto produce un 89,1 % de acuerdo top-1 con el modelo bf16 frente al 87,5 % de la cuantizacion estandar de 4 bits, y reduce el error KL un 20 % (0,0860 frente a 0,1081) con el mismo tamano en disco.

El resultado es un paquete de 6,4 GB que cabe en un Mac con 16 GB de memoria unificada y que conserva la torre de vision en bfloat16, ademas del cabezal MTP para decodificacion especulativa. Es relevante para desarrolladores que quieran ejecutar localmente en Apple Silicon un modelo de razonamiento de ~9B con entrada de imagen y modo thinking, sin depender de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer), base qwen3_5, atencion lineal y MTP draft head |
| Parametros totales | 8.956.949.376 (~8,96B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (LayerFit por capas); existen builds 3-bit, 6-bit, 8-bit y bf16 del mismo autor |
| Idiomas soportados | No disponible (la model card menciona "held-out passages in several languages" sin enumerar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), vision.safetensors en bfloat16 |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucles, en la que un mismo bloque de capas se reutiliza varias veces, lo que permite aumentar la profundidad efectiva sin incrementar proporcionalmente el numero de parametros. Incorpora bloques de atencion lineal junto con atencion estandar, un cabezal MTP (multi-token prediction) para decodificacion especulativa y una torre de vision para entrada de imagenes. La model card etiqueta la base como qwen3_5, lo que sugiere una derivacion o inspiracion en la familia Qwen 3.5. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

En cuanto a la cuantizacion, esta build aplica LayerFit: un procedimiento de busqueda por capa que mide la degradacion de cada componente a baja precision y asigna los bits de forma no uniforme dentro de un presupuesto fijo de tamano. Los routers de bucle y las normalizaciones se mantienen en float32, y la torre de vision y el cabezal MTP quedan sin cuantizar (bfloat16). La receta exacta se publica en `layerfit-recipe.json`. El autor reporta mediciones realizadas el 27 de noviembre de 2026 en un MacBook Pro M5 Max.

## Capacidades

- Generacion de texto conversacional y razonamiento, con modo thinking activable mediante `enable_thinking=True`.
- Entrada de imagen: la torre de vision se conserva en bfloat16 y permite pasar una o varias imagenes (limite por defecto de ~1 megapixel por imagen, ampliable a 16,7 MP con `--max-pixels 0`).
- Decodificacion especulativa mediante el cabezal MTP draft head, que acelera la generacion en el runtime especifico.
- Soporte multilingue parcial: la model card menciona pasajes de evaluacion en varios idiomas, aunque no se enumeran los idiomas soportados.
- Ejecucion local en Apple Silicon mediante MLX, con servidor compatible (`mlx_lm.server`).
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta explicitamente soporte de agentes o razonamiento multi-paso mas alla del modo thinking.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener conversaciones multi-turno directamente en un portatil con 16 GB de memoria unificada, sin GPU dedicada, usando `mlx_lm.server` como backend compatible con la API de chat.
- Analisis de imagenes en local: gracias a la torre de vision en bfloat16, se pueden describir fotografias, capturas o diagramas desde la linea de comandos con `generate_vision.py`, util para tareas de accesibilidad o catalogacion sin subir datos a la nube.
- Razonamiento asistido con modo thinking: para problemas de logica, matematicas o planificacion donde se requiere una cadena de razonamiento explicita, activando `enable_thinking=True` se obtiene una respuesta mas elaborada a costa de mayor latencia.
- Prototipado rapido de aplicaciones de IA en Apple Silicon: investigadores que desarrollan en Mac pueden validar prompts, plantillas de chat y flujos de inferencia antes de desplegar en infraestructura mayor, aprovechando la paridad de API con mlx-lm.
- Generacion de texto en entornos con requisitos de privacidad: al ejecutarse completamente en local, es adecuado para procesar documentos sensibles (informes medicos, contratos) sin que los datos salgan del dispositivo.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye la receta LayerFit y builds alternativas (3, 6, 8 bits y bf16), lo que permite a investigadores medir el impacto de la cuantizacion por capas frente a la uniforme en sus propios conjuntos de prueba.
- Servicio de inferencia ligero en flotas de Mac: con 6,4 GB en disco y 16 GB de RAM recomendados, se puede desplegar en estaciones de trabajo macOS para tareas de generacion de texto de baja concurrencia.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card comparan la build LayerFit 4-bit con la build estandar 4-bit del mismo autor, ambas del mismo tamano:

| Metrica | 4-bit estandar | LayerFit 4-bit |
|---|---|---|
| Acuerdo top-1 con bf16 | 87,5 % | 89,1 % |
| Error KL | 0,1081 | 0,0860 (20 % menor) |
| GSM8K (30 preguntas, sin thinking) | 29/30 | 28/30 |

El harness empleado compara pesos del modelo de lenguaje contra la build bf16 del autor, con pasajes reservados en varios idiomas y GSM8K con thinking desactivado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) del modelo base en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16 GB de RAM en Mac para la build 4-bit (6,4 GB en disco); la build 3-bit requiere 8 GB (ajustado) o 16 GB.
- GPU recomendadas: Apple Silicon (el autor midio en un MacBook Pro M5 Max). No es compatible con CUDA ni con GPUs NVIDIA/AMD.
- Cabe en consumer hardware: si, en Macs con al menos 16 GB de memoria unificada.
- Opciones de despliegue: `mlx-lm` >= 0.32 (Python >= 3.11) para texto y servidor; runtime `sensenova-loop-mlx` v0.3.0 para entrada de imagen y decodificacion MTP.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-LayerFit-MLX-4bit | ~8,96B | No disponible | Apache-2.0 | MLX (Apple Silicon) | Cuantizacion LayerFit 4-bit, vision y MTP incluidos |
| SenseNova-Loop-9B (base) | ~8,96B | No disponible | Apache-2.0 | Pesos originales | Modelo de referencia sin cuantizar |
| SenseNova-Loop-9B-MLX-4bit (estandar, mismo autor) | ~8,96B | No disponible | Apache-2.0 | MLX | Cuantizacion uniforme 4-bit; 87,5 % top-1 y KL 0,1081 |
| SenseNova-Loop-9B-MLX-3bit / 6bit / 8bit / bf16 | ~8,96B | No disponible | Apache-2.0 | MLX | Otras builds del mismo autor con distinto presupuesto de bits |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo cuantizado a 4 bits: aunque LayerFit reduce la degradacion, existe perdida de precision frente al bf16 original (89,1 % de acuerdo top-1, no el 100 %).
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- La longitud de contexto no esta publicada, lo que dificulta planificar casos de uso con documentos largos.
- Los idiomas soportados no se enumeran; el rendimiento fuera del ingles y el chino podria ser inferior.
- Solo funciona en Apple Silicon mediante MLX; no es desplegable en CUDA, ROCm ni CPU convencional.
- La entrada de imagen esta limitada por defecto a ~1 megapixel; subir a 16,7 MP exige mucha mas memoria.
- La decodificacion MTP y la vision requieren el runtime externo `sensenova-loop-mlx` v0.3.0, no solo `mlx-lm`.
- Build de un tercero (NetProjects) no afiliado a SenseNova; aunque la licencia es Apache-2.0, la calidad y el soporte dependen del autor de la conversion.
- LayerFit es una marca registrada de NetProjects; la receta esta publicada pero conviene revisar `NOTICE` para detalles de la conversion.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/SenseNova-Loop-9B-LayerFit-MLX-4bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build 3-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-LayerFit-MLX-3bit
- Build 6-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- Runtime sensenova-loop-mlx v0.3.0: https://github.com/internet-projects/sensenova-loop-mlx/releases/tag/v0.3.0
- NetProjects: https://netprojects.com
