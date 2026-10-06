# mradermacher/Temper-1-0.5B-GGUF

## Resumen

Temper-1-0.5B-GGUF es la version cuantizada en formato GGUF del modelo temper-ai/Temper-1-0.5B, un modelo denso de aproximadamente 494 millones de parametros (0,5B) orientado a codigo, con especial atencion al lenguaje Rust segun las etiquetas declaradas en el repositorio. La cuantizacion la ha realizado mradermacher, un autor conocido por publicar conversiones GGUF de terceros para su uso con llama.cpp y herramientas compatibles. El modelo base pertenece a temper-ai y se distribuye bajo licencia Apache 2.0.

La arquitectura de partida es un transformer de tipo Qwen2, tal y como indican las etiquetas del repositorio (`qwen2`), aunque no se detallan en la informacion disponible ni la longitud de contexto ni la composicion del dataset de entrenamiento. Al tratarse de un modelo de 0,5B parametros, su interes principal no es competir en calidad bruta con modelos grandes, sino ofrecer una opcion extremadamente ligera que puede ejecutarse en CPU, en dispositivos de borde o en GPUs de gama baja con un consumo de memoria inferior a 1 GB en cuantizaciones de 4 bits.

Este repositorio en concreto aporta un conjunto de 12 cuantizaciones (desde Q2_K hasta f16), lo que permite ajustar el equilibrio entre tamano, velocidad y calidad en funcion del hardware disponible. El modelo esta etiquetado como conversacional y compatible con endpoints, y su unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen2 (segun etiquetas del repositorio) |
| Parametros totales | 494.032.768 (~0,49B) |
| Parametros activos | No aplica (no se describe como modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se publica en safetensors para transformers |
| Tamano del repositorio | 5,4 GB (suma de todas las cuantizaciones) |
| Fecha de publicacion | 2026-10-05 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el proceso de entrenamiento del modelo base en los datos proporcionados. La unica referencia tecnica disponible es la etiqueta `qwen2`, que situa la arquitectura dentro de la familia Qwen2, es decir, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y atencion con sesgo QKV. Los parametros totales confirmados por los pesos en safetensors son 494.032.768, coherentes con un modelo denso de escala 0,5B.

Las etiquetas `rust` y `code` sugieren que el modelo ha sido ajustado o especializado para generacion y comprension de codigo, con enfasis en Rust, pero no se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, atencion con ventana deslizante u otras).

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Generacion y asistencia sobre codigo, con orientacion especifica a Rust segun las etiquetas `code` y `rust`.
- Uso como modelo base para fine-tuning posterior, dado su tamano reducido y su licencia permisiva.
- Compatibilidad con inferencia en endpoints (etiqueta `endpoints_compatible`).
- Ejecucion local mediante llama.cpp y derivados gracias al formato GGUF.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito (thinking mode).
- Cobertura multilingue limitada al ingles declarado; no se documentan otros idiomas.

## Casos de uso

- Autocompletado de codigo en el editor: por su tamano de 0,5B en cuantizacion Q4_K_M (0,5 GB), puede cargarse como servidor local de completado en un IDE y ofrecer sugerencias de fragmentos Rust con latencia baja incluso sin GPU.
- Asistente de codigo en entornos sin conexion: al ejecutarse integramente en CPU, es adecuado para estaciones de trabajo aisladas o entornos con restricciones de red donde no se puede llamar a una API externa.
- Prototipado rapido de pipelines de IA generativa: sirve como modelo de pruebas para validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de OpenAI antes de escalar a modelos mayores.
- Generacion de fragmentos y esqueletos de codigo Rust: util para producir plantillas, estructuras de `struct`/`impl`, ejemplos de uso de crates o conversiones de pseudocodigo a Rust en tareas de baja complejidad.
- Educacion y demostraciones: su huella de memoria inferior a 1 GB permite desplegarlo en aulas, portatiles modestos o Raspberry Pi para explicar el funcionamiento de un LLM en local.
- Filtrado y clasificacion ligera de texto tecnico: al ser barato de ejecutar, puede emplearse en tareas de etiquetado, resumen corto o triaje previo de consultas antes de enviarlas a un modelo mayor.
- Base para ajuste fino especifico de dominio: con 494M de parametros y licencia Apache 2.0, es viable reentrenarlo o aplicar LoRA en una unica GPU consumer para especializarlo en un subconjunto concreto del lenguaje Rust.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de generacion de codigo, y tampoco se aportan datos de perplexity mas alla del grafico generico sobre tipos de cuantizacion enlazado en la model card.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K y Q3_K_S en torno a 0,4 GB; Q4_K_S y Q4_K_M en torno a 0,5 GB; Q5_K_S y Q5_K_M en torno a 0,5 GB; Q6_K y Q8_0 en torno a 0,6 GB; f16 en torno a 1,1 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con memoria compartida. Tambien puede ejecutarse solo en CPU.
- No requiere aceleradores de gama profesional (A100, H100) para inferencia; usarlos no aportaria ventaja practica dado el tamano del modelo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores GGUF compatibles con la API de OpenAI, y el propio ecosistema transformers si se usa el modelo base en safetensors.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 0,49B en cuantizaciones de 4 bits, es esperable una velocidad alta en hardware moderno, pero no se aportan mediciones concretas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Temper-1-0.5B (este repositorio, GGUF) | 494M | No disponible | Apache 2.0 | Codigo, Rust, ingles | GGUF en HuggingFace |
| Qwen2.5-Coder-0.5B | ~0,5B | 32.768 tokens (segun su model card) | Apache 2.0 | Codigo multilingue | Safetensors y GGUF de terceros |
| Qwen2-0.5B | ~0,5B | 32.768 tokens (segun su model card) | Apache 2.0 | Proposito general | Safetensors y GGUF de terceros |
| SmolLM2-360M | 362M | 8.192 tokens (segun su model card) | Apache 2.0 | Proposito general, ingles | Safetensors y GGUF |

Nota: los datos de los modelos comparativos proceden de sus respectivas model cards publicas y se incluyen solo como referencia de categoria; no se dispone de comparaciones de rendimiento directas con Temper-1-0.5B.

## Limitaciones y advertencias

- Con 494M de parametros, la capacidad de razonamiento, la coherencia en conversaciones largas y la precision en tareas de codigo complejas seran limitadas en comparacion con modelos de 7B o superiores.
- Riesgo elevado de alucinacion, especialmente en generacion de APIs inexistentes, funciones inventadas o dependencias de Rust que no existen.
- No se documenta la longitud de contexto soportada; conviene verificar experimentalmente el comportamiento en secuencias largas antes de usarlo en produccion.
- Unico idioma declarado: ingles. El rendimiento en castellano no esta garantizado ni documentado.
- No hay evidencia de soporte de tool calling, function calling ni flujos de agente multi-paso.
- Ausencia de resultados de benchmarks publicados, lo que dificulta la evaluacion objetiva frente a alternativas.
- Sin datos sobre sesgos del modelo base ni sobre el dataset de entrenamiento, por lo que no se puede evaluar su comportamiento en dominios sensibles.
- La licencia Apache 2.0 permite uso comercial, pero se aplica al modelo base y a esta cuantizacion; conviene revisar tambien las condiciones del modelo original en temper-ai/Temper-1-0.5B por si hubiera anadido terminos adicionales.
- No se han publicado cuantizaciones ponderadas con imatrix para este modelo; el propio autor indica que podrian no estar disponibles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Temper-1-0.5B-GGUF
- Modelo base: https://huggingface.co/temper-ai/Temper-1-0.5B
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#Temper-1-0.5B-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
