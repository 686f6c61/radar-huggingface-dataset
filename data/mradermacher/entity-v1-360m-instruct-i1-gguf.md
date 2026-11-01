# mradermacher/entity-v1-360m-instruct-i1-GGUF

## Resumen

Entity-v1-360m-instruct-i1-GGUF es una versión cuantizada en formato GGUF del modelo shashwatIDR/entity-v1-360m-instruct, publicada por mradermacher. El modelo original es un transformer de 361.821.120 parámetros (aproximadamente 360M) afinado para instrucciones y conversación (chat), con licencia Apache 2.0 y soporte exclusivo del idioma inglés. Esta versión GGUF emplea cuantizaciones ponderadas con imatrix (metodología i1 de mradermacher), lo que permite ejecutar el modelo en hardware modesto, incluyendo CPU y GPU de consumo, con tamaños de archivo que van desde 0,3 GB en las cuantizaciones más agresivas hasta 0,5 GB en Q6_K.

El interés de esta ficha reside en que el modelo base es de dominio público, muy ligero y está orientado a tareas conversacionales, lo que lo convierte en un candidato razonable para prototipos rápidos, entornos con recursos limitados o despliegues en el borde. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy escasa: la model card del cuantizador no incluye detalles técnicos del modelo original, y no se han publicado resultados de evaluación en la información proporcionada.

Esta ficha documenta exclusivamente lo que puede verificarse a partir de los metadatos de HuggingFace y de la model card del repositorio GGUF. Cualquier dato no confirmado se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_S, i1-IQ3_XS, i1-Q2_K, i1-Q3_K_S, i1-IQ3_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más un archivo imatrix |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |
| Tamano del repositorio | 5,7 GB (incluye todas las cuantizaciones) |
| Modelo base | shashwatIDR/entity-v1-360m-instruct |
| Fecha de creacion | 2026-10-31 |
| Descargas | 659 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de que se trata de un transformer de 361,8M de parámetros. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención, la longitud de contexto nativa ni la composición del dataset de entrenamiento. El modelo base está etiquetado como "fine-tuned" y "chat", lo que indica que fue sometido a algún proceso de ajuste instruccional, pero no se documenta si se empleó RLHF, DPO, SFT supervisado u otra metodología.

La innovación técnica destacable de esta publicación es el proceso de cuantización: mradermacher aplica cuantizaciones ponderadas con imatrix (marcadas como "i1"), una técnica que calibra los factores de cuantización usando una matriz de importancia derivada de datos de calibración, lo que típicamente mejora la perplejidad frente a cuantizaciones estáticas del mismo tamaño. La model card indica que las cuantizaciones i1 se generaron con la versión de quantize_version 2 y output_tensor_quantised 1, e incluye el archivo imatrix para que terceros puedan generar sus propias cuantizaciones. No se dispone de información sobre innovaciones arquitectónicas del modelo base (atención lineal, decodificación especulativa, SSM híbrido, etc.).

## Capacidades

- Generación de texto conversacional y respuestas a instrucciones en inglés, según las etiquetas "chat" y "conversational" del repositorio.
- Ajuste instruccional (instruct): el nombre del modelo base indica que responde a comandos en formato instrucción.
- Capacidad multilingüe: únicamente inglés; no se declara soporte de otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio, matemáticas avanzadas, código): no disponibles en la información proporcionada.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: al ocupar entre 0,3 y 0,5 GB en GGUF, el modelo puede cargarse en cuestión de segundos en un portátil y usarse para validar prompts, flujos de diálogo y formatos de respuesta antes de invertir en un modelo mayor.
- Despliegue en el borde (edge computing): su tamaño reducido permite ejecutarlo en dispositivos con poca memoria, como Raspberry Pi o mini-PC, para tareas de chat local sin conexión a la nube.
- Clasificación y etiquetado ligero de texto en inglés: puede emplearse para tareas de extracción o reformateo de texto dentro de pipelines, siempre que se validen los resultados por su limitada capacidad de razonamiento.
- Generación de respuestas en aplicaciones de bajo coste: adecuado para entornos donde el coste por token o la latencia de red son críticos, como demos educativas o entornos de laboratorio.
- Filtrado y preprocesado de conversaciones: puede usarse como primer eslabón para reformatear o resumir entradas de usuario antes de pasarlas a un modelo mayor en una arquitectura en cascada.
- Experimentación con cuantizaciones: el repositorio incluye el archivo imatrix y múltiples niveles de cuantización, lo que permite comparar calidad y velocidad entre variantes (por ejemplo, IQ4_XS frente a Q4_K_M) en un mismo hardware.
- Base para fine-tuning ulterior: al estar bajo licencia Apache 2.0 y en formato GGUF, puede servir como punto de partida para ajustes específicos de dominio en inglés, aunque el fine-tuning requeriría volver a los pesos originales en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,3 GB y 0,5 GB según la cuantización elegida (IQ1_S/IQ2_* en torno a 0,3 GB; Q4_K_M en torno a 0,4 GB; Q6_K en torno a 0,5 GB). El archivo imatrix ocupa 0,1 GB y no es necesario para inferencia.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente; el modelo está pensado para hardware de consumo y CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio está etiquetado como "endpoints_compatible". También puede ejecutarse en CPU pura.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (360M de parámetros) se espera una latencia muy baja en hardware de consumo, pero no se aportan cifras verificables.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| entity-v1-360m-instruct (este) | 361,8M | no disponible | Apache 2.0 | GGUF (i1) y safetensors | Inglés, chat |
| Modelos de ~360M comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas verificables en la información proporcionada |

## Limitaciones y advertencias

- Idiomas: solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Capacidad limitada: con 361,8M de parámetros, es esperable un rendimiento bajo en razonamiento complejo, matemáticas y código, aunque no se han publicado evaluaciones que lo confirmen.
- Riesgo de alucinación: no se documentan medidas de mitigación ni datos de evaluación de fidelidad; en un modelo de este tamaño el riesgo es alto.
- Contexto: se desconoce la longitud de contexto nativa, lo que impide planificar conversaciones multi-turno largas con garantías.
- Cuantizaciones agresivas: las variantes IQ1_S e IQ2_* están marcadas por el propio autor como "for the desperate" o de baja calidad; para uso real se recomienda IQ4_XS, Q4_K_M o Q6_K.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base es de un autor tercero (shashwatIDR) y no se documentan las condiciones adicionales que este pudiera imponer; conviene verificar el repositorio original antes de un despliegue comercial.
- Ausencia de benchmarks: no hay datos publicados que permitan comparar su calidad con alternativas, por lo que cualquier decisión de producción debería basarse en evaluaciones propias.
- Fecha de creación: el repositorio figura creado el 2026-10-31, dato que conviene contrastar con el estado real del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/entity-v1-360m-instruct-i1-GGUF
- Modelo base: https://huggingface.co/shashwatIDR/entity-v1-360m-instruct
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/entity-v1-360m-instruct-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#entity-v1-360m-instruct-i1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de
