# reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT-GGUF

## Resumen

Qwen3-1.7B-Coder-Distilled-SFT-GGUF es la version cuantizada en formato GGUF del modelo reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT, desarrollado por Reaperdoesntrun (Convergent Intelligence LLC, Research Division). Se construye a partir de Qwen/Qwen3-1.7B mediante un proceso en dos etapas: destilacion de conocimiento desde Qwen3-Coder-30B-A3B-Instruct sobre 6.122 muestras STEM con cadena de pensamiento, seguida de un ajuste fino supervisado (SFT) sobre aproximadamente 54.607 pares de inferencia logica proposicional del dataset KonstantinDob/logic_inference_dataset.

El objetivo del modelo es ofrecer razonamiento estructurado (descomposicion secuencial, seguimiento de estado y logica proposicional) en un tamano de 1,7B parametros que pueda ejecutarse en dispositivos de borde. El modelo base cuenta con 2.031.739.904 parametros reales segun safetensors. Esta version GGUF esta pensada para despliegue local mediante llama.cpp y runtimes compatibles, con cuantizaciones que van desde F16 (~3,8 GB) hasta Q4_K_M (~1,2 GB).

La relevancia actual radica en la posibilidad de ejecutar razonamiento logico estructurado en hardware modesto (movil, Raspberry Pi, portatiles sin GPU dedicada) con una licencia Apache 2.0 permisiva. No obstante, el propio autor advierte que no es un generador de codigo pese al profesor Coder, ni un verificador formal de pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los ejemplos de uso emplean n_ctx=1024) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo fuente) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-1.7B. El entrenamiento se realizo en dos etapas segun la model card. La primera etapa consistio en destilacion desde Qwen3-Coder-30B-A3B-Instruct sobre 6.122 muestras STEM con cadena de pensamiento, empleando entropia cruzada ponderada por prueba (2,5x a 1,5x en tokens de derivacion) mas divergencia KL con temperatura T=2,0. El profesor Coder transfiere patrones de descomposicion estructurada (logica secuencial, seguimiento de estado, razonamiento composicional) a traves del paisaje softmax.

La segunda etapa aplico SFT sobre KonstantinDob/logic_inference_dataset, con aproximadamente 54.607 pares de logica proposicional en formato LOGICINFERENCE, basado en el paper LogicInference de Santiago Ontanon (Google Research). El modelo aprende a realizar la inferencia primero y concluir despues. La model card menciona marcos matematicos propietarios (Discrepancy Calculus, Topological Knowledge Distillation) documentados en la ficha del modelo fuente, que supuestamente informan el pipeline de entrenamiento; estos no se detallan en la informacion disponible de esta version GGUF.

## Capacidades

- Razonamiento logico proposicional: inferencia sobre premisas y conclusiones en formato LOGICINFERENCE.
- Razonamiento STEM estructurado con cadenas de pensamiento (derivaciones paso a paso en matematicas, fisica y logica).
- Generacion de texto conversacional mediante plantilla `### Instruction:` / `### Response:`.
- Razonamiento multi-paso con descomposicion secuencial heredada del profesor Coder.
- Soporte de ejecucion en llama.cpp, llama-cpp-python, Ollama y LM Studio.
- Capacidad de operar con temperatura 0,0 para respuestas deterministas en tareas logicas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de vision, audio ni modo thinking explicito.
- Capacidades multilingues limitadas al ingles segun el campo `language`.

## Casos de uso

- Verificacion de argumentos logicos en educacion: el modelo puede evaluar silogismos y argumentos proposicionales paso a paso, util para herramientas de ensenanza de logica formal en entornos con recursos limitados.
- Tutoria STEM en dispositivos de borde: con la cuantizacion Q4_K_M (~1,2 GB) puede ejecutarse en moviles o Raspberry Pi para resolver problemas de matematicas y fisica con derivaciones estructuradas, sin conexion a red.
- Preprocesamiento de razonamiento en pipelines: puede generar cadenas de inferencia que alimenten a un modelo mayor o a un sistema de validacion, actuando como primer filtro logico en arquitecturas multi-modelo.
- Asistente offline de logica y argumentacion: integrado via Ollama o LM Studio en un portatil, permite consultas sobre validez de razonamientos sin depender de servicios en la nube.
- Generacion de datos sinteticos de logica: util para aumentar datasets de entrenamiento de inferencia proposicional, dado su ajuste especifico en formato LOGICINFERENCE.
- Prototipado rapido en investigacion: su tamano y licencia Apache 2.0 permiten experimentar con destilacion y SFT en hardware de consumo, sirviendo como referencia reproducible del pipeline de dos etapas.
- Despliegue en entornos aislados (air-gapped): al ser GGUF y ejecutable con llama.cpp, puede operar en sistemas sin acceso a internet para tareas de razonamiento estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB con Q4_K_M, 1,4 GB con Q5_K_M, 2,1 GB con Q8_0 y 3,8 GB con F16 (mas overhead de contexto).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; tambien funciona en CPU. No se especifican modelos concretos como A100 o H100 en la informacion disponible.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 4 GB en adelante con Q4_K_M). Tambien en dispositivos de borde y moviles.
- Opciones de despliegue: llama.cpp (CLI y Python via llama-cpp-python), Ollama, LM Studio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-Coder-Distilled-SFT-GGUF (este) | 2,03B | no disponible | Apache 2.0 | GGUF | Destilado + SFT en logica proposicional |
| Qwen/Qwen3-1.7B | 1,7B (nominal) | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base sin destilacion ni SFT especifico |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30B totales (3B activos, MoE) | no disponible | no disponible | safetensors | Profesor del proceso de destilacion; mucho mayor |
| reaperdoesntknow/Qwen3-1.7B-Coder-Distilled | 2,03B | no disponible | Apache 2.0 | safetensors | Solo etapa 1 (destilacion), sin SFT de logica |

## Limitaciones y advertencias

- Modelo de 1,7B con capacidad limitada: inferencias multi-paso con muchos cuantificadores pueden exceder su capacidad, segun el propio autor.
- No es un generador de codigo pese al profesor Coder; el autor lo advierte explicitamente.
- No es un verificador formal de pruebas: no debe usarse como oraculo de correccion logica en produccion sin validacion externa.
- Riesgo de alucinacion inherente a modelos pequenos; el autor recomienda verificar siempre las salidas criticas.
- Solo soporta ingles segun el campo `language`; no se documenta rendimiento en castellano ni otros idiomas.
- Longitud de contexto no especificada; los ejemplos usan n_ctx=1024, lo que sugiere ventanas cortas en la practica.
- Licencia Apache 2.0 permite uso comercial, pero las afirmaciones sobre marcos matematicos propietarios (Discrepancy Calculus, Topological Knowledge Distillation) no estan documentadas en detalle en esta version GGUF.
- Sin datos de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT-GGUF
- Modelo fuente (full precision): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- Modelo etapa 1: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled
- Modelo relacionado (Instruct teacher + legal SFT): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor Coder: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Dataset de inferencia logica: https://huggingface.co/datasets/KonstantinDob/logic_inference_dataset
- Paper LogicInference (Ontanon): https://openreview.net/pdf?id=HAGeIS_Lcg9
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
- Convergent Intelligence LLC: https://convergentintel.com
