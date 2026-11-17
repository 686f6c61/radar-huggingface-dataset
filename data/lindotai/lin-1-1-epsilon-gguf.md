# LindotAI/Lin-1.1-Epsilon-GGUF

## Resumen

Lin-1.1-Epsilon-GGUF es la distribucion en formato GGUF del modelo Lin-1.1-Epsilon, un modelo de generacion de texto de 494.032.768 parametros (aproximadamente 0,5B) especializado en generacion de codigo Rust. Lo desarrolla LindotAI y se presenta como un ajuste fino (fine-tuning) del modelo base Qwen2.5-Coder-0.5B-Instruct, del que hereda la arquitectura transformer densa. El repositorio contiene unicamente las cuantizaciones ligeras del modelo original en precision completa, pensadas para ejecucion local en equipos con recursos limitados.

El modelo resuelve el caso de uso de asistencia a la programacion en Rust con un coste computacional minimo: al partir de una base de 0,5B de parametros, puede ejecutarse en CPU o en GPU de gama baja, y las cuantizaciones Q4_K_M y Q8_0 ocupan entre 0,4 y 0,5 GB en disco. Esto lo hace adecuado para entornos de desarrollo locales, portatiles y pipelines de CI donde no se dispone de aceleradores de gran capacidad.

La relevancia actual del repositorio es limitada pero concreta: es la via practica para desplegar el modelo con llama.cpp u Ollama sin depender de infraestructura de servidor. La model card remite al repositorio del modelo base para benchmarks y detalles de entrenamiento, que no se incluyen en esta ficha por no estar disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tuning de Qwen2.5-Coder-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); pesos originales en el modelo base |
| Tamano del repositorio | 0,9 GB |
| Especialidad | Generacion de codigo Rust |
| Compatibilidad de endpoints | si (tag `endpoints_compatible`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer denso de aproximadamente 0,5B de parametros, derivado de Qwen2.5-Coder-0.5B-Instruct mediante fine-tuning. La model card no detalla la composicion del dataset de ajuste, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; esa informacion se remite al repositorio del modelo base (LindotAI/Lin-1.1-Epsilon), que no esta incluida en los datos disponibles.

La innovacion tecnica del repositorio es la publicacion de cuantizaciones GGUF listas para llama.cpp y Ollama, con dos variantes: Q4_K_M (aproximadamente 0,4 GB, orientada a portatiles) y Q8_0 (aproximadamente 0,5 GB, la mas cercana a los pesos evaluados). No se documentan innovaciones arquitectonicas adicionales como atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion de codigo en Rust: funcion principal del modelo, segun los tags del repositorio (`code`, `rust`).
- Generacion de texto conversacional: el tag `conversational` y la herencia de un modelo Instruct indican soporte de dialogos de instruccion.
- Respuesta a prompts de programacion: la model card incluye un ejemplo de uso para escribir una funcion Rust que invierta un `Vec<i32>` in situ.
- Ejecucion local: compatible con llama.cpp (via `llama-cli`) y Ollama (via `ollama run hf.co/...`).
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con infraestructura de inferencia tipo Hugging Face Endpoints.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia local de programacion en Rust: un desarrollador puede lanzar el modelo con Ollama o llama.cpp en su portatil y obtener sugerencias de funciones Rust sin conexion ni coste de API, gracias a los 0,4-0,5 GB de las cuantizaciones.
- Autocompletado y generacion de funciones en editores: integrado en un plugin de editor mediante llama.cpp, el modelo puede generar funciones Rust a partir de un prompt descriptivo, con temperatura 0,2 recomendada para respuestas unicas.
- Generacion de candidatos en pipelines de test: la model card recomienda temperatura 0,8 cuando se muestrean varias respuestas y se compilan y prueban; encaja en un flujo que genera N candidatos y valida con `cargo test`.
- Educacion y aprendizaje de Rust: el modelo puede explicar y producir ejemplos de codigo Rust en un entorno local controlado, sin enviar codigo a servicios externos.
- Prototipado rapido en entornos con recursos limitados: en maquinas sin GPU dedicada, la cuantizacion Q4_K_M permite inferencia en CPU con un consumo de memoria muy bajo.
- Pruebas de integracion en CI: el modelo puede desplegarse en un runner con llama.cpp para generar fragmentos de codigo o tests de ejemplo en tareas de validacion automatizada, siempre con compilacion y test posterior.
- Evaluacion comparativa de fine-tunes pequenos: util como referencia ligera para medir la calidad de ajustes especializados en Rust frente al modelo base Qwen2.5-Coder-0.5B-Instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explicitamente al repositorio del modelo base (LindotAI/Lin-1.1-Epsilon) para consultar benchmarks y detalles, pero esos datos no forman parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: Q4_K_M aproximadamente 0,4 GB de pesos; Q8_0 aproximadamente 0,5 GB. Con overhead de contexto y runtime, el consumo real sera algo superior, pero en cualquier caso inferior a 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; el modelo cabe en GPUs de gama baja e integradas. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas.
- Ejecucion en CPU: viable gracias al tamano reducido; la cuantizacion Q4_K_M esta pensada para portatiles.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/LindotAI/Lin-1.1-Epsilon-GGUF:Q8_0`), y endpoints compatibles segun el tag del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| Lin-1.1-Epsilon-GGUF | 494 M | no disponible | Codigo Rust | Apache 2.0 | GGUF |
| Qwen2.5-Coder-0.5B-Instruct (modelo base) | ~0,5B | no disponible en esta ficha | Codigo general | Apache 2.0 (segun el modelo base de Qwen) | safetensors, GGUF |
| LindotAI/Lin-1.1-Epsilon | 494 M | no disponible | Codigo Rust | Apache 2.0 | no disponible en esta ficha |

La comparativa se limita al linaje directo del modelo porque no se dispone de datos de benchmarks ni de especificaciones de contexto para establecer comparaciones cuantitativas con alternativas de la misma categoria. Cualquier comparacion de rendimiento requeriria los benchmarks del modelo base, no incluidos aqui.

## Limitaciones y advertencias

- El modelo tiene 0,5B de parametros: su capacidad de razonamiento y de codigo esta acotada por ese tamano, muy por debajo de modelos de 7B o superiores.
- La model card advierte explicitamente de que el codigo generado debe compilarse y probarse siempre; no debe asumirse su correccion.
- Riesgo de alucinacion en APIs, crates y firmas de funciones de Rust no vistas en entrenamiento; verificacion manual obligatoria.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- No se especifican los idiomas soportados; el uso fuera de ingles o de prompts en Rust puede degradar la calidad.
- La longitud de contexto no esta documentada en la informacion disponible; no debe asumirse un contexto largo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y aviso de licencia.
- La fecha de creacion del repositorio es 2026-11-17, posterior al conocimiento de la mayoria de herramientas; conviene verificar compatibilidad con versiones recientes de llama.cpp y Ollama.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LindotAI/Lin-1.1-Epsilon-GGUF
- Modelo base: https://huggingface.co/LindotAI/Lin-1.1-Epsilon
- Cuantizaciones preview: https://huggingface.co/LindotAI/Lin-1-Epsilon-GGUF
- Modelo del que deriva la base: Qwen2.5-Coder-0.5B-Instruct (no se proporciona enlace directo en la informacion disponible)
