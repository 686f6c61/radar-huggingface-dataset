# Nsmith15/consapia-router-light-GGUF

## Resumen

Consapia router (light) es un modelo de lenguaje de 1.711.376.384 parámetros (aproximadamente 1,7 mil millones) afinado a partir de HuggingFaceTB/SmolLM2-1.7B-Instruct por el usuario Nsmith15. Su función es muy concreta: recibe una pregunta del usuario y la transforma en un plan JSON compuesto por entre 2 y 6 sub-tareas tipadas, es decir, actúa como enrutador o descomponedor de consultas dentro de un pipeline mayor denominado Consapia. No es un modelo conversacional generalista, sino un componente especializado de orquestación.

La relevancia de este modelo reside en su tamaño reducido y su formato de distribución. Al estar cuantizado en Q4_K_M con calibración mediante importance matrix (imatrix) y dividido en partes de 512 MB para su uso con wllama, está pensado para ejecutarse en entornos con recursos limitados, incluidos navegadores o dispositivos de borde. La licencia Apache 2.0 y su compatibilidad con llama.cpp facilitan su integración en aplicaciones que necesitan un enrutador ligero sin depender de infraestructura de GPU dedicada.

No obstante, la información pública disponible es escasa: el repositorio no incluye datos sobre benchmarks, idiomas soportados, composición del dataset de afinado ni detalles del proceso de entrenamiento. La model card se limita a describir el formato de pesos y la función del modelo, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2-1.7B-Instruct; detalles de capas y atención no disponibles) |
| Parámetros totales | 1.711.376.384 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (calibrada con importance matrix); otras variantes no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dividido en partes de 512 MB para wllama) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-1.7B-Instruct, un transformer decoder-only de 1,7 mil millones de parámetros desarrollado por Hugging Face. Sobre esa base se ha realizado un ajuste fino orientado a una tarea específica: la generación de planes JSON estructurados con entre 2 y 6 sub-tareas tipadas a partir de una única pregunta de entrada. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF, DPO o supervisión directa.

La innovación técnica destacable está en el proceso de cuantización: se ha aplicado Q4_K_M con calibración mediante importance matrix, lo que permite preservar mejor la calidad de los pesos al reducir la precisión. Además, el modelo se distribuye fragmentado en partes de 512 MB y se acompaña de un manifiesto `consapia-gguf.json` que enumera todas las partes necesarias para su carga. Este formato está diseñado específicamente para wllama, un binding de llama.cpp para WebAssembly, lo que sugiere un objetivo de despliegue en navegador o en entornos JavaScript.

## Capacidades

- Generación de planes JSON estructurados: convierte una pregunta en un objeto JSON con entre 2 y 6 sub-tareas tipadas.
- Enrutamiento de consultas: clasifica y descompone la intención del usuario en tareas accionables.
- Salida estructurada: el formato JSON facilita su consumo programático por parte de otros componentes del pipeline.
- Compatibilidad con llama.cpp y wllama: puede ejecutarse en entornos nativos y en WebAssembly.
- Capacidades conversacionales heredadas de SmolLM2-1.7B-Instruct, aunque no son el objetivo principal del ajuste.
- Soporte de tool calling, agentes multi-paso o modos de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Orquestación de pipelines de agentes: el modelo recibe la consulta inicial de un usuario y genera un plan de sub-tareas que un orquestador puede distribuir entre distintos modelos o herramientas especializadas. Su tamaño reducido permite ejecutarlo como primer eslabón con baja latencia.
- Enrutamiento en aplicaciones de búsqueda aumentada (RAG): dado que produce un JSON con sub-tareas tipadas, puede decidir qué consultas requieren recuperación de documentos, qué consultas requieren cálculo y cuáles requieren generación directa, antes de invocar los componentes correspondientes.
- Despliegue en navegador con wllama: al estar fragmentado en partes de 512 MB y cuantizado en Q4_K_M, puede cargarse en aplicaciones web que ejecutan inferencia local sin servidor, útil para asistentes con privacidad por diseño.
- Prototipado rápido de sistemas multi-agente: un equipo puede integrar este enrutador en un pipeline de desarrollo para validar la descomposición de tareas antes de invertir en modelos mayores.
- Filtrado y preprocesado de consultas en atención al cliente: el modelo puede transformar una queja o petición del usuario en un conjunto de sub-tareas tipadas (por ejemplo, consultar pedido, verificar política de devolución, redactar respuesta) que un sistema posterior resuelve.
- Evaluación de la calidad de descomposición de tareas: al ser un modelo pequeño y de licencia permisiva, resulta adecuado como línea base para comparar estrategias de planificación en investigación sobre agentes.
- Enrutamiento en dispositivos de borde: su tamaño permite ejecutarlo en hardware con poca memoria, actuando como clasificador previo que decide si una consulta necesita un modelo mayor en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 1,1 GB para los pesos (tamaño del repo), más overhead de contexto y estado de inferencia; se recomienda al menos 2 GB de memoria disponible.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con 2 GB o más de VRAM debería poder alojarlo, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con 2 GB o más de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: llama.cpp (formato nativo), wllama (WebAssembly, objetivo declarado), y cualquier runtime compatible con GGUF. vLLM, TGI u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Consapia router light (este modelo) | 1,7 B | No disponible | Apache 2.0 | GGUF Q4_K_M | Enrutamiento y descomposición en JSON |
| SmolLM2-1.7B-Instruct | 1,7 B | No disponible en esta ficha | Apache 2.0 | Safetensors, GGUF | Conversación general |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens (según documentación pública del modelo base) | Apache 2.0 | Safetensors, GGUF | Conversación, código, matemáticas |
| Llama-3.2-1B-Instruct | 1,2 B | 128.000 tokens (según documentación pública del modelo base) | Llama 3.2 Community License | Safetensors, GGUF | Conversación general y tool calling |

La comparación directa es limitada porque Consapia router light no es un modelo conversacional generalista, sino un componente especializado. Frente a SmolLM2-1.7B-Instruct, del que deriva, la diferencia está en el ajuste fino para salida JSON estructurada y en la cuantización calibrada con imatrix. Frente a Qwen2.5-1.5B-Instruct y Llama-3.2-1B-Instruct, la ventaja potencial es la especialización en descomposición de tareas y el formato listo para wllama; la desventaja es la ausencia de datos publicados sobre calidad, idiomas y contexto.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay métricas publicadas que permitan evaluar la calidad de los planes JSON generados ni compararlos con alternativas.
- Idiomas no especificados: se desconoce si el ajuste fino se realizó en inglés, castellano u otros idiomas, lo que impide garantizar un rendimiento multilingüe.
- Contexto no documentado: se desconoce la longitud máxima de entrada; preguntas largas podrían truncarse o degradar la salida.
- Especialización estrecha: el modelo está ajustado para una única tarea (generar planes de 2 a 6 sub-tareas); su uso fuera de ese dominio puede producir resultados pobres.
- Riesgo de alucinación en la estructura: al generar JSON, puede producir claves o tipos de sub-tarea no válidos si la pregunta de entrada es ambigua o está fuera de distribución.
- Dependencia de un manifiesto: la carga requiere usar el archivo `consapia-gguf.json` y todas las partes; un manejo incorrecto de los fragmentos puede impedir la inferencia.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los archivos LICENSE y NOTICE del modelo base SmolLM2 por posibles términos adicionales.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Fecha de creación futura en los metadatos (2026-11-21): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Nsmith15/consapia-router-light-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- wllama: https://github.com/ngxson/wllama
