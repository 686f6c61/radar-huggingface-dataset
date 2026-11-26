# rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-MLX-8bit

## Resumen

Swift-1.5-Qwen3.8-27B-VectorCut-MLX-8bit es una cuantizacion en 8 bits (8,627 bpw, ~28 GB) para Apple Silicon mediante MLX del modelo `rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-BF16`, un derivado afinado de Qwen3.8-27B publicado por Rare Vector Labs. El modelo es multimodal (image-text-to-text), con encoder de vision y cabeza MTP (multi-token prediction) preservadas, y se distribuye bajo la licencia propietaria Swift Open License v1.0.

El interes tecnico del release esta en su pipeline de cuantizacion "VectorCut" con `group_size=64`, que segun el autor mantiene intactos los 15 tensores MTP y los 333 tensores del encoder de vision en BF16, algo que muchas cuantizaciones de modelos "uncensored" degradan. Esto permite ejecutar el modelo en oMLX a velocidad nativa sobre hardware Apple, sin perder capacidades visuales ni la decodificacion especulativa que aporta la cabeza MTP.

Con 27.356.728.560 parametros totales y un repo de 29,5 GB, el modelo esta pensado para equipos con Apple Silicon de gama alta (unificated memory de 32 GB o mas). La ficha no dispone de datos de benchmarks publicados ni de especificaciones de contexto o composicion del dataset de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.8-27B, con encoder de vision y cabeza MTP (multi-token prediction) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (8,627 bpw, group_size=64); variantes MLX 4-bit y 6-bit en la misma familia |
| Idiomas soportados | multilingual, en, zh, ja, ko, pt, ru, ar, fr, de, es |
| Licencia | swift-open-license-1.0 (derivada de Swift Open License v1.0 y Apache 2.0 de Qwen3.8-27B) |
| Formato de pesos | safetensors (MLX), 8-bit |
| Tamano del repo | 29,5 GB |
| Libreria | mlx |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal derivado de Qwen3.8-27B, con un encoder de vision (333 tensores) y una cabeza MTP de 15 tensores que se conservan intactos en la cuantizacion. El pipeline "VectorCut" aplica una ablacion quirurgica sobre los tensores de la MLP con compuerta (105 tensores modificados de 1199 totales), manteniendo el resto de pesos sin cambios respecto al maestro BF16. La auditoria SHA-256 reportada por el autor confirma `VISION_TENSORS_IDENTICAL: 333 / 333`, `MTP_TENSORS_IDENTICAL: 15 / 15` y `PROTECTED_CHANGED: 0`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original. La etiqueta "uncensored" sugiere un afinado orientado a reducir rechazos, pero no se detalla la metodologia. La cabeza MTP preservada sugiere soporte de decodificacion especulativa nativa, aunque no se documentan los detalles de implementacion.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento y respuesta a instrucciones (modelo afinado sobre Qwen3.8-27B).
- Capacidades de vision: entrada image-text-to-text con encoder preservado en BF16.
- Decodificacion especulativa via cabeza MTP preservada (15 tensores intactos).
- Soporte multilingue: en, zh, ja, ko, pt, ru, ar, fr, de, es.
- Comportamiento "uncensored" segun el autor (no se detalla el alcance).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Analisis de imagenes en local sobre Apple Silicon: el encoder de vision se mantiene en BF16, por lo que se puede usar para describir, clasificar o extraer informacion de imagenes en un Mac Studio o MacBook Pro de gama alta, sin enviar datos a la nube.
- Asistente conversacional privado: con 27B parametros y licencia propietaria, encaja en despliegues on-device donde la confidencialidad es critica (sanidad, legal, investigacion interna) y no se quiere depender de APIs externas.
- Procesamiento de documentos con imagen y texto: al ser image-text-to-text, puede emplearse para tareas de OCR asistido, resumen de capturas o extraccion de datos de formularios escaneados en pipelines locales.
- Generacion de codigo en local: hereda las capacidades de Qwen3.8-27B para tareas de programacion, util en entornos con restricciones de conectividad o de politica de datos.
- Investigacion sobre cuantizacion y ablacion: el pipeline VectorCut y la auditoria SHA-256 lo convierten en una referencia para estudiar el impacto de la cuantizacion selectiva (vision y MTP en BF16, MLP gated en 8 bits) en la calidad final.
- Experimentacion con decodificacion especulativa: la cabeza MTP intacta permite medir el speedup real en oMLX frente a variantes que la eliminan.
- Despliegue multilingue en Apple Silicon: cubre diez idiomas y puede usarse para traduccion asistida o atencion al cliente en mercados con esos idiomas, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: ~28 GB para la variante 8-bit; ~21 GB para la 6-bit; ~15 GB para la 4-bit; ~55 GB para el maestro BF16.
- Hardware objetivo: Apple Silicon con memoria unificada suficiente (32 GB o mas para la 8-bit; 24 GB o mas para la 4-bit).
- GPU recomendadas: no aplica en el sentido tradicional; el modelo esta empaquetado para MLX y oMLX sobre chips Apple (M-series). Para CUDA habria que reconvertir los pesos, lo cual no se documenta.
- Cabe en consumer GPU: si, en el ecosistema Apple Silicon; no se proporcionan datos para GPUs NVIDIA o AMD.
- Opciones de despliegue: oMLX (runtime recomendado por el autor); MLX como libreria subyacente. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor afirma "full native speed" en oMLX gracias a la preservacion de MTP, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-VectorCut-MLX-8bit | 27,36B | no disponible | si (encoder BF16) | swift-open-license-1.0 | MLX safetensors 8-bit |
| rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-BF16 | 27,36B | no disponible | si | swift-open-license-1.0 | safetensors BF16 |
| Qwen/Qwen3.8-27B (base upstream) | no disponible en la informacion | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia `swift-open-license-1.0` es propietaria y no equivale a Apache 2.0; es necesario revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial.
- El modelo se distribuye como derivado de `ukisai/Swift-1.5-Qwen3.8-27b`, que a su vez deriva de Qwen3.8-27B; las obligaciones de atribucion de ambos upstreams aplican.
- La etiqueta "uncensored" implica que el modelo puede generar contenido que otros modelos rechazarian; no se documenta el alcance ni los filtros aplicados.
- No hay datos publicados de benchmarks, por lo que no se puede verificar la calidad frente al maestro BF16 ni frente a otras cuantizaciones.
- La cuantizacion 8-bit con `group_size=64` puede introducir degradaciones en tareas de razonamiento largo o generacion de codigo; no se aportan mediciones.
- El modelo esta empaquetado exclusivamente para MLX/oMLX; no hay soporte documentado para CUDA, ROCm ni CPU generica.
- Riesgo de alucinacion: no se documenta; aplica el riesgo habitual de los modelos de 27B en tareas de conocimiento factual.
- Idiomas: aunque se listan diez, no se especifica el nivel de competencia por idioma ni si el afinado "uncensored" afecta al multilingue.
- Contexto: la longitud de contexto no se indica en la informacion disponible, lo que impide planificar casos de uso con documentos largos.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-MLX-8bit
- Modelo base BF16: https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-BF16
- Variante MLX 6-bit: https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-MLX-6bit
- Variante MLX 4-bit: https://huggingface.co/rarevector/Swift-1.5-Qwen3.8-27B-VectorCut-MLX-4bit
- Upstream intermedio: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Upstream base: https://huggingface.co/Qwen/Qwen3.8-27B
- Organizacion del autor: https://huggingface.co/RareVector
- Apoyo al autor: https://ko-fi.com/rarevector
