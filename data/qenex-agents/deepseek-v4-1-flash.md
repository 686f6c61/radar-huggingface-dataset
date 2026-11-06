# QENEX-Agents/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado por QENEX-Agents en Hugging Face, con 763.205.315.794 parametros totales segun los pesos en safetensors. La model card describe un backbone MoE de 552B parametros, soporte nativo de imagenes y texto, y una ventana de contexto de hasta un millon de tokens. Su propuesta central es la compresion agresiva de la cache KV: segun el autor, reduce la huella por token a unos 890 bytes, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash y unas 437 veces menos que DeepSeek-V1.

La arquitectura se denomina Causal Encoder-Decoder (CED): 40 capas de Transformer organizadas como 20 capas de encoder causal seguidas de 20 de decoder, donde la cache KV global del decoder se proyecta desde los estados ocultos finales del encoder en lugar de derivarse de cada capa del decoder. Esto permite activar solo 8B parametros por token en prefill y 16B en decode, lo que abarata cargas de trabajo con entradas muy largas, tipicas de agentes. Incorpora ademas Compressed Sparse Attention 2 (CSA2), cache KV principal en FP4, memoria condicional Engram de 196B parametros y decodificacion especulativa DSpark.

El modelo es relevante porque combina contexto de 1M tokens, entrada multimodal y un coste de inferencia reducido por token, orientado a flujos agenticos y de atencion sobre documentos e imagenes extensos. La licencia declarada es MIT. No obstante, la ficha de Hugging Face muestra 0 descargas y 0 likes, y no se han publicado resultados completos de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED), Transformer de 40 capas (20 encoder causal + 20 decoder), MoE con 1 experto compartido y 384 expertos enrutados por capa |
| Parametros totales | 763.205.315.794 (pesos safetensors); la model card indica 552B en el backbone, mas 196B de memoria Engram |
| Parametros activos | 8B por token en prefill; 16B por token en decode; 6 expertos enrutados activados por token |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (tag del repo) y cache KV principal en FP4 (formato E2M1 con una escala E4M3 por cada 16 canales) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Causal Encoder-Decoder con 40 capas de Transformer divididas en 20 capas de encoder causal y 20 de decoder. La innovacion clave es que la cache KV global del decoder se proyecta desde los estados ocultos finales del encoder, en lugar de calcularse a partir de los estados de cada capa del decoder. Segun el autor, esto reduce la activacion a 8B parametros por token en prefill y 16B en decode. La tecnica SWA Bounded Replay reconstruye los estados KV de ventana deslizante que faltan replicando solo los ultimos n_win tokens, lo que evita persistir esa cache en SSD y deja la cache KV persistente en aproximadamente 1/8 de la de DeepSeek-V4-Flash.

La atencion usa Compressed Sparse Attention 2 (CSA2), que asigna a cada capa uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar los indices Top-K de atencion dispersa. En el decoder, un Hierarchical Sparse Indexer restringe las capas de indexacion posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexador con independencia de la longitud de contexto. Junto con la cache KV principal en FP4, la huella global queda en unos 890 bytes por token. Se anaden Single-Pass mHC con el kernel Mega-mHC, memoria condicional Engram (196B parametros, acceso disperso por lookup de token) y decodificacion especulativa DSpark con generacion de borradores semiautoregresiva y verificacion programada por confianza.

El preentrenamiento se realizo desde cero sobre un corpus multimodal de 45T tokens, con atencion dispersa entrenada a longitud de secuencia de 64K y extension de contexto a 1M tokens a partir de los 34T tokens. El postentrenamiento sigue el paradigma SFT, RL y destilacion on-policy (OPD) sin modificaciones algoritmicas; los cambios se concentran en el pipeline de datos, con sintesis automatizada a gran escala de tareas y entornos agenticos. El modelo admite un ajuste de esfuerzo de razonamiento continuo entre 1 y 100. La parte multimodal consta de un encoder visual DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling 3x3 pixel-unshuffle, mas un proyector MLP de dos capas que convierte las imagenes en embeddings procesados junto al texto desde el inicio del preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva con razonamiento controlable mediante un parametro entero de esfuerzo de razonamiento entre 1 y 100.
- Procesamiento nativo de imagenes y texto (pipeline image-text-to-text), con encoder visual DeepSeek-ViT y proyector MLP.
- Contexto de hasta 1M tokens, adecuado para documentos, repositorios o historiales de conversacion muy largos.
- Capacidades agenticas reforzadas mediante sintesis automatizada de tareas y entornos durante el postentrenamiento.
- Decodificacion especulativa DSpark para acelerar la generacion.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no confirmado; el control de esfuerzo de razonamiento sugiere razonamiento configurable, pero no se detalla un modo separado.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir un arbol de codigo extenso y responder preguntas sobre dependencias, cambios o arquitectura sin trocear el contenido, lo que reduce la perdida de contexto entre fragmentos.
- Agentes autonomos de larga duracion: el coste reducido de prefill (8B parametros activos por token) y la cache KV comprimida a 890 bytes por token permiten mantener sesiones agenticas con muchas iteraciones y entradas crecientes sin disparar el uso de memoria.
- Atencion sobre documentos escaneados y mixtos: al procesar imagenes y texto de forma conjunta desde el preentrenamiento, puede extraer informacion de PDFs con tablas, diagramas y captions en una sola pasada.
- Revision de contratos y documentacion tecnica: el contexto de 1M tokens permite cargar varios documentos legales o manuales y hacer preguntas cruzadas, con el esfuerzo de razonamiento ajustado segun la criticidad de la consulta.
- Asistencia a investigacion cientifica: ingesta de articulos con figuras y ecuaciones, resumen comparativo entre papers y extraccion de resultados, aprovechando la entrada multimodal y el contexto largo.
- Automatizacion de soporte tecnico multi-turno: conversaciones largas con historial extenso e imagenes de capturas de pantalla o errores, manteniendo coherencia gracias a la ventana de 1M tokens y al control del esfuerzo de razonamiento.
- Generacion de codigo en pipelines: el modelo puede integrarse en flujos de CI/CD para revision de parches o generacion de tests; conviene validar el soporte real de tool calling antes de desplegarlo en produccion.

## Benchmarks y rendimiento

La model card menciona una figura con resultados en benchmarks agenticos y una seccion de "Evaluation Results" para el modelo base, pero los valores numericos no estan incluidos en la informacion proporcionada. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 763.205.315.794 parametros, en FP8 se requieren aproximadamente 763 GB solo para pesos; en FP4, unos 382 GB. La cache KV es comparativamente pequena (890 bytes por token), de modo que 1M tokens de contexto ocupan del orden de 0,9 GB.
- GPU recomendadas: para FP8 se necesitan nodos multi-GPU, por ejemplo 8x H100 80GB o 8x A100 80GB; en FP4 podria reducirse a 4-8 GPU de 80 GB segun el backend y el margen de memoria.
- Cabe en consumer GPU: no. Ni siquiera una RTX 4090 (24 GB) puede alojar los pesos completos; solo seria viable con cuantizaciones muy agresivas y offloading, no documentadas en la informacion disponible.
- Opciones de despliegue: transformers es la libreria declarada. vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible, y la arquitectura CED con CSA2 y FP4 KV probablemente requiere soporte especifico del backend.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763B totales (552B backbone + 196B Engram); 8B/16B activos | 1M tokens | MIT | Cache KV de 890 bytes/token; multimodal |
| DeepSeek-V4-Flash | No disponible | No disponible | No disponible | Referencia del autor: V4.1-Flash usa ~1/4 de su cache KV por token |
| DeepSeek-V1 | No disponible | No disponible | No disponible | Referencia del autor: V4.1-Flash usa ~1/437 de su cache KV por token |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo de gran escala, es esperable en tareas de recuperacion factual.
- Sesgos conocidos: no documentados en la model card; no hay informacion sobre composicion del corpus mas alla de los 45T tokens multimodales.
- Idiomas soportados: no disponibles, lo que impide garantizar calidad en castellano u otras lenguas.
- Licencia MIT: permite uso comercial, pero conviene verificar los terminos de los pesos y de cualquier componente de terceros incluido en el repositorio.
- Repositorio con 0 descargas y 0 likes y creado recientemente: no hay evidencia de uso en produccion ni validacion independiente de las cifras declaradas.
- El autor del repositorio en Hugging Face es QENEX-Agents, mientras que la model card referencia la organizacion deepseek-ai y enlaces a DeepSeek; conviene confirmar la procedencia oficial antes de un despliegue.
- Requisitos de hardware muy elevados: no es desplegable en GPU de consumo y exige infraestructura multi-GPU.
- Soporte de tool calling, agentes multi-paso e idiomas no confirmado explicitamente en la informacion disponible.
- La arquitectura CED, CSA2 y la cache KV en FP4 pueden no estar soportadas por los backends de inferencia habituales, lo que limita las opciones de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/QENEX-Agents/DeepSeek-V4.1-Flash
- Informe tecnico (referenciado en la model card): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organizacion DeepSeek en Hugging Face: https://huggingface.co/deepseek-ai
- Web oficial: https://www.deepseek.com/
- Chat: https://chat.deepseek.com/
- Twitter/X: https://twitter.com/deepseek_ai
