# sahadevnirala/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado por el usuario sahadevnirala en Hugging Face bajo licencia MIT. Segun la model card, se trata de un modelo con arquitectura Causal Encoder-Decoder (CED) de 40 capas (20 de encoder causal y 20 de decoder), disenado para procesar imagenes y texto de forma nativa y generar texto de forma autorregresiva. El repositorio declara 763.205.315.794 parametros totales en los ficheros safetensors, si bien la model card menciona un backbone de 552B parametros mas un modulo de memoria condicional Engram de 196B.

La propuesta tecnica central es la compresion agresiva de la KV cache. Mediante Compressed Sparse Attention 2 (CSA2), cacheo de KV principal en FP4 y SWA Bounded Replay, el modelo reduce la huella de KV cache global a unos 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash y 437 veces menor que la de DeepSeek-V1 segun la figura de la model card. Esto lo orienta a cargas de trabajo agenticas con entradas muy largas, donde el coste de prefill y el almacenamiento de contexto dominan.

El modelo soporta contextos de hasta un millon de tokens, se entrena desde cero sobre 45T tokens multimodales y emplea decodificacion especulativa DSpark. No obstante, conviene senalar que el repositorio tiene cero descargas y cero likes en el momento de redactar esta ficha, y que no se han podido verificar de forma independiente los datos declarados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED), transformer MoE de 40 capas (20 encoder causal + 20 decoder) |
| Parametros totales | 763.205.315.794 (safetensors); backbone de 552B + Engram de 196B segun model card |
| Parametros activos | 8B por token en prefill; 16B por token en decode |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (tag del repo); KV cache principal en FP4 (formato E2M1 con escala E4M3 cada 16 canales); 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura CED separa el modelo en un encoder causal de 20 capas y un decoder de 20 capas. La innovacion clave es que la KV cache global del decoder se proyecta a partir de los estados ocultos finales del encoder, en lugar de derivarse de los estados de cada capa del decoder. Esto permite activar solo 8B parametros por token durante el prefill y 16B durante el decode. La capa MoE emplea 1 experto compartido y 384 expertos enrutados, activando 6 expertos enrutados por token. El modulo Engram (196B parametros) actua como memoria condicional de acceso disperso mediante lookup basado en tokens.

CSA2 asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex, Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar los indices Top-K de atencion dispersa. En el decoder, un indexador jerarquico restringe las capas de indexacion posteriores a un pool de candidatos construido por la primera capa en modo Full, acotando el coste del indexador con independencia de la longitud de contexto. SWA Bounded Replay reconstruye los estados KV de ventana deslizante ausentes replicando solo los ultimos n_win tokens, evitando persistir esa KV en SSD. Se anade decodificacion especulativa DSpark con generacion de borradores semi-autorregresiva y verificacion programada por confianza, ademas de Single-Pass mHC con un kernel Mega-mHC.

El preentrenamiento se realiza desde cero sobre 45T tokens multimodales, con la atencion dispersa entrenada a 64K de longitud de secuencia y el contexto extendido a 1M tokens a partir de los 34T tokens. El post-entrenamiento sigue el paradigma SFT → RL → destilacion on-policy (OPD) sin modificaciones algoritmicas, con el esfuerzo puesto en la sintesis automatizada a gran escala de tareas y entornos agenticos. El encoder visual DeepSeek-ViT se entrena desde cero con 2D-RoPE y downsampling pixel-unshuffle 3x3, y un proyector MLP de dos capas convierte las imagenes en embeddings visuales procesados conjuntamente con el texto desde el inicio del preentrenamiento.

## Capacidades

- Generacion de texto autorregresiva con razonamiento controlable: el modelo expone un ajuste de esfuerzo de razonamiento continuo en el rango entero 1-100 que intercambia coste de inferencia por precision.
- Procesamiento multimodal nativo de imagenes y texto (pipeline image-text-to-text), con encoder visual propio.
- Contexto ultralargo de hasta 1M tokens, adecuado para documentos extensos, repositorios de codigo y trayectorias agenticas largas.
- Razonamiento multi-paso y soporte para flujos agenticos, con entrenamiento especifico en tareas y entornos agenticos sintetizados.
- Decodificacion especulativa integrada (DSpark) para acelerar la generacion.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir un monorepo o un conjunto amplio de ficheros y responder preguntas transversales sobre la arquitectura, dependencias y deuda tecnica sin trocear el codigo.
- Agentes autonomos de larga duracion: la combinacion de bajo coste de prefill (8B activos) y KV cache de 890 bytes por token permite mantener trayectorias de muchos pasos con historial extenso sin disparar el consumo de memoria.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre tablas escaneadas, diagramas y capturas junto con el texto circundante en un unico contexto.
- Revision de contratos y documentacion legal: el contexto de 1M tokens permite cargar expedientes completos y contrastar clausulas entre documentos, con el ajuste de esfuerzo de razonamiento elevado para reducir errores.
- Atencion al cliente con historial largo: gestion de conversaciones multi-turno con contexto acumulado, aprovechando la compresion de KV para servir muchas sesiones concurrentes por GPU.
- Generacion asistida de codigo en pipelines: integracion via transformers y despliegue con servidores compatibles con la API de endpoints, usando el modo de razonamiento bajo para tareas de autocompletado y alto para refactorizaciones complejas.
- Investigacion sobre eficiencia de atencion: el modelo sirve como referencia reproducible para estudiar CSA2, FP4 en KV cache y decodificacion especulativa en entornos de investigacion, dada su licencia MIT.

## Benchmarks y rendimiento

La model card incluye una seccion de resultados de evaluacion para el modelo base, pero el contenido proporcionado se interrumpe antes de mostrar las tablas de puntuaciones. No se han facilitado cifras concretas de MMLU, HumanEval, GSM8K ni de los benchmarks agenticos referenciados en la figura.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para pesos completos: con 763.205.315.794 parametros, en FP8 (1 byte por parametro) los pesos ocupan aproximadamente 763 GB, por encima de cualquier GPU individual; se requiere un nodo multi-GPU o multi-nodo.
- VRAM en cuantizacion de 4 bits: en torno a 380-400 GB solo para pesos, todavia fuera del alcance de GPUs consumer.
- GPU recomendadas: obligatorio un despliegue multi-GPU con H100 (80 GB), H200 o A100 (80 GB). Como referencia, en FP8 harian falta al menos 10 GPU de 80 GB solo para pesos, mas margen para KV cache y activaciones.
- GPU consumer: no cabe en ninguna GPU consumer (RTX 4090, 5090, etc.) ni en configuraciones multi-GPU de consumo por el volumen de pesos.
- Opciones de despliegue: transformers (libreria declarada); el tag endpoints_compatible sugiere compatibilidad con servidores de inferencia con API tipo OpenAI. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles. La model card afirma mejoras de coste por la activacion de solo 8B parametros en prefill y 16B en decode, y una KV cache de 890 bytes por token, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash (este repo) | 763B totales (552B backbone + 196B Engram) | 1M | MIT | KV cache de 890 B/token; 8B activos en prefill, 16B en decode |
| DeepSeek-V4-Flash | no disponible | no disponible | no disponible | Referencia de la model card: este modelo reduce su KV cache a ~1/4 |
| DeepSeek-V1 | no disponible | no disponible | no disponible | Referencia de la model card: reduccion de KV cache de 437x |

No se dispone de datos de parametros, contexto ni rendimiento de DeepSeek-V4-Flash ni de DeepSeek-V1 en la informacion proporcionada mas alla de las ratios de KV cache citadas. No se han identificado otras alternativas comparables con datos verificables.

## Limitaciones y advertencias

- Repositorio sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta, lo que impide confirmar que los pesos publicados correspondan a la arquitectura descrita.
- Discrepancia en el recuento de parametros: los safetensors declaran 763.205.315.794 parametros, mientras que la model card describe 552B de backbone mas 196B de Engram (748B); conviene verificar el contenido real del repo antes de usarlo.
- Resultados de benchmarks no disponibles: la seccion de evaluacion de la model card esta truncada en la informacion recibida, por lo que no es posible contrastar el rendimiento declarado.
- Idiomas soportados no especificados: no hay lista de idiomas en la model card, con riesgo de comportamiento degradado fuera de los idiomas dominantes del corpus de entrenamiento.
- Riesgo de alucinacion inherente a los modelos generativos de gran escala; no se documentan tasas de error ni evaluaciones de fidelidad.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion en la informacion disponible.
- Coste de despliegue muy elevado: incluso en FP8 requiere un nodo multi-GPU de alta gama, lo que limita su uso a organizaciones con infraestructura dedicada.
- Licencia MIT: permite uso comercial y modificacion sin restricciones adicionales, pero al ser una publicacion de un tercero bajo el identificador sahadevnirala, la procedencia de los pesos no esta avalada por el repositorio oficial de DeepSeek AI.
- El ajuste de esfuerzo de razonamiento (1-100) implica que valores altos incrementan el coste de inferencia de forma proporcional; debe calibrarse por caso de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/sahadevnirala/DeepSeek-V4.1-Flash
- Technical Report (referenciado en la model card): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Homepage de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Twitter de DeepSeek AI: https://twitter.com/deepseek_ai
