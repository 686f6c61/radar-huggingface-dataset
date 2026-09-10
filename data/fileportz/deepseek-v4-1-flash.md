# Fileportz/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado en HuggingFace por el usuario Fileportz, con generación de texto autorregresiva y procesamiento nativo de imágenes. Según su model card, el backbone declara 552 000 millones de parámetros y soporta contextos de hasta un millón de tokens. El repositorio real de safetensors, sin embargo, contiene 484 619 644 114 parámetros (~484,6B), una discrepancia que conviene tener presente al planificar el despliegue.

La propuesta técnica se centra en la compresión agresiva de la caché KV: emplea una arquitectura Causal Encoder-Decoder (CED) de 40 capas, atención dispersa comprimida CSA2 con tres modos estáticos (Full, Reindex y Reuse), un indexador jerárquico disperso y caché KV principal en FP4. El resultado declarado es una huella de 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash y 437 veces menor que la de DeepSeek-V1. La activación por token es de 8B durante el prefill y 16B durante el decode, lo que reduce el coste en cargas con mucho input.

El modelo resulta relevante para flujos agénticos con entradas masivas (documentos largos, repositorios de código, vídeo-texto) donde el cuello de botella es la caché KV y no el coste de cómputo del decoder. Incorpora además un ajuste de esfuerzo de razonamiento continuo (entero de 1 a 100) que permite intercambiar coste de inferencia por precisión. No obstante, el repositorio no procede de la organización oficial deepseek-ai, tiene cero descargas y cero likes, y la model card está truncada antes de publicar cifras de benchmarks, por lo que su validación independiente está pendiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED): transformer de 40 capas, 20 de encoder causal y 20 de decoder, con capas MoE |
| Parámetros totales | 552 000 millones declarados por el autor; 484 619 644 114 (~484,6B) según los safetensors del repositorio |
| Parámetros activos | 8B por token en prefill y 16B por token en decode; 1 experto compartido y 384 expertos enrutados por capa MoE, con 6 expertos enrutados activos por token |
| Longitud de contexto | Hasta 1 000 000 de tokens |
| Tipos de cuantización | Pesos en 8-bit / FP8 (según los tags del repositorio); caché KV principal en FP4 (formato E2M1 con una escala E4M3 por cada 16 canales); GGUF no disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (tamaño del repositorio: 510,3 GB) |

## Arquitectura y entrenamiento

DeepSeek-V4.1-Flash se organiza como un Causal Encoder-Decoder de 40 capas en total: 20 capas de encoder causal seguidas de 20 capas de decoder. La particularidad del diseño CED es que la caché KV global del decoder se proyecta a partir de los estados ocultos finales del encoder, en lugar de derivarse de los estados ocultos de cada capa del decoder. Esto permite activar solo 8B parámetros por token en prefill y 16B en decode. Sobre esa base se añaden varios componentes: SWA Bounded Replay, que reconstruye los estados KV de ventana deslizante ausentes replicando únicamente los *n*_win tokens más recientes (evita persistir SWA KV en SSD y reduce la caché KV persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash); Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atención uno de tres modos estáticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar índices Top-K de atención dispersa; un Hierarchical Sparse Indexer que restringe las capas de indexado posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste de los indexadores profundos con independencia de la longitud de contexto; Single-Pass mHC, una revisión del mezclado del flujo residual con un kernel Mega-mHC; Engram conditional memory, con 196B parámetros accedidos de forma dispersa mediante búsqueda basada en token; y DSpark, un esquema de decodificación especulativa con generación de borradores semiautorregresiva y verificación planificada por confianza.

La parte multimodal combina un encoder de visión DeepSeek-ViT, entrenado desde cero con 2D-RoPE y reducción de resolución mediante pixel-unshuffle 3×3, con un proyector MLP de dos capas que convierte las imágenes en embeddings visuales procesados conjuntamente con los embeddings de texto desde el inicio del preentrenamiento del modelo de lenguaje. El preentrenamiento se realizó desde cero sobre un corpus multimodal de 45 billones (45T) de tokens, con entrenamiento de atención dispersa a una longitud de secuencia de 64K y extensión de contexto hasta 1M de tokens a partir del token 34T. El postentrenamiento sigue el paradigma estándar SFT → RL → destilación on-policy (OPD) sin modificaciones algorítmicas; los cambios se concentran en el pipeline de datos, con síntesis automática a gran escala de tareas y entornos agénticos y escalado progresivo de datos, tareas y rollouts. El modelo expone un ajuste de esfuerzo de razonamiento continuo (entero de 1 a 100).

## Capacidades

- Generación de texto autorregresiva sobre contextos de hasta un millón de tokens.
- Procesamiento nativo de imágenes y texto de forma conjunta (pipeline declarado: image-text-to-text), mediante encoder de visión DeepSeek-ViT y proyector MLP.
- Razonamiento con esfuerzo continuamente controlable: un entero de 1 a 100 permite ajustar el coste de inferencia frente a la precisión.
- Tareas agénticas: la model card describe síntesis automática de tareas y entornos agénticos durante el postentrenamiento y publica una figura de rendimiento en benchmarks agénticos.
- Razonamiento multi-paso y decodificación especulativa mediante DSpark (borradores semiautorregresivos con verificación planificada por confianza).
- Decodificación eficiente con caché KV extremadamente reducida: 890 bytes por token a nivel global.
- Memoria condicional Engram de 196B parámetros con acceso disperso por búsqueda basada en token.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible (el repositorio no declara lista de idiomas).
- Modo thinking explícito: no disponible como etiqueta separada; el control de esfuerzo de razonamiento (1-100) es la palanca declarada.

## Casos de uso

- Análisis de documentación técnica extensa: con 1M tokens de contexto y una caché KV de 890 bytes por token, es viable cargar manuales completos, normativas o expedientes enteros sin truncado ni recuperación externa, manteniendo el coste de memoria acotado.
- Agentes autónomos sobre repositorios de código: la combinación de contexto largo, prefill a 8B parámetros activos y postentrenamiento orientado a tareas agénticas permite indexar un repositorio completo y ejecutar ciclos de edición-verificación con múltiples pasos.
- Extracción y razonamiento sobre documentos escaneados: al aceptar entrada image-text-to-text, puede procesar facturas, informes con gráficos o capturas directamente, sin una fase OCR separada, y devolver texto estructurado.
- Asistencia técnica multi-turno con historial largo: la caché KV persistente reducida a 1/8 de DeepSeek-V4-Flash facilita mantener sesiones largas en servidores con memoria limitada, un escenario habitual en atención al cliente.
- Automatización de flujos de trabajo de oficina con entrada mixta: interpretación de hojas de cálculo, presentaciones o diagramas junto a instrucciones textuales, con el nivel de esfuerzo de razonamiento ajustado por tarea para controlar coste.
- Investigación y síntesis bibliográfica: ingestión de decenas de artículos en una sola ventana de contexto y generación de resúmenes comparativos o tablas de resultados, aprovechando el modo de razonamiento configurable para tareas de mayor exigencia.
- Prototipado de pipelines multimodales en investigación: al publicarse en transformers con safetensors, sirve como base para experimentos de compresión de caché KV, atención dispersa o decodificación especulativa, comparando sus cifras contra generaciones anteriores de DeepSeek.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye una sección de resultados de evaluación y una figura de rendimiento agéntico, pero el texto recuperado se interrumpe al inicio de esa sección y no contiene cifras concretas. Los únicos datos cuantitativos publicados son de eficiencia, no de calidad:

| Métrica declarada | Valor |
|---|---|
| Caché KV global por token | 890 bytes |
| Reducción de caché KV global frente a DeepSeek-V4-Flash | ~4× |
| Reducción de caché KV global frente a DeepSeek-V1 | ~437× |
| Caché KV persistente frente a DeepSeek-V4-Flash | ~1/8 |
| Parámetros activos en prefill | 8B por token |
| Parámetros activos en decode | 16B por token |
| Tokens de preentrenamiento | 45T (contexto extendido a 1M a partir de 34T) |
| Longitud de secuencia en entrenamiento de atención dispersa | 64K |

La model card indica además que todas las puntuaciones dentro de una diferencia de 0,3 se consideran equivalentes en su marco de evaluación interno, pero no se reproduce ningún valor de MMLU, HumanEval, GSM8K ni de benchmarks agénticos.

## Requisitos de hardware

- VRAM estimada para los pesos: en el formato 8-bit / FP8 distribuido (510,3 GB de repositorio), se necesitan aproximadamente 485-510 GB solo para pesos; en BF16 el requisito sería del orden de 970 GB; en una hipotética cuantización a 4 bits, unos 245 GB.
- Caché KV: 890 bytes por token a nivel global, lo que equivale a unos 890 MB para una secuencia de 1M tokens, más la caché de ventana deslizante gestionada mediante SWA Bounded Replay.
- GPU recomendadas: despliegue multi-GPU obligatorio. Un nodo de 8×H200 (141 GB cada una, 1128 GB totales) ofrece margen suficiente para los pesos en FP8 más activaciones y caché. Un nodo de 8×H100 de 80 GB (640 GB) queda ajustado para los pesos en FP8 y deja poco espacio para activaciones y caché a contexto largo. No se dispone de datos de despliegue con A100.
- GPU de consumo: no cabe. Incluso en cuantizaciones agresivas de 4 bits el requisito (~245 GB) supera la VRAM de cualquier GPU consumer; una RTX 4090 con 24 GB no puede alojar el modelo ni siquiera con offloading parcial razonable.
- Opciones de despliegue: la librería declarada en el repositorio es transformers, y los tags incluyen `endpoints_compatible`, lo que sugiere compatibilidad con HuggingFace Inference Endpoints. El soporte de vLLM, SGLang, TGI, llama.cpp u Ollama no está confirmado en la información disponible; dada la arquitectura propietaria (CSA2, CED, DSpark) es probable que requiera kernels específicos y no baste con motores genéricos.
- Latencia y throughput estimados: no disponibles. La model card aporta factores de reducción de caché KV y de parámetros activos, pero ninguna medida de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Caché KV global por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (Fileportz) | 552B declarados / 484,6B en safetensors | 1M tokens | 890 bytes | MIT | HuggingFace, repositorio de terceros con 0 descargas |
| DeepSeek-V4-Flash | No disponible | No disponible | ~4× la de V4.1-Flash (factor declarado) | No disponible | No disponible en la información proporcionada |
| DeepSeek-V1 | No disponible | No disponible | ~437× la de V4.1-Flash (factor declarado) | No disponible | No disponible en la información proporcionada |

La model card solo ofrece comparaciones relativas de caché KV frente a generaciones anteriores de DeepSeek; no se aportan parámetros, contextos, licencias ni cifras de calidad de esos modelos en la información disponible. No se dispone de comparativas con alternativas de otros fabricantes (Qwen, Llama, Mistral, Gemini, GPT) dentro del material proporcionado.

## Limitaciones y advertencias

- Procedencia no oficial: el repositorio pertenece al usuario Fileportz, no a la organización deepseek-ai. La model card enlaza a recursos de DeepSeek (web, chat, cuenta de HuggingFace, informe técnico), pero no hay confirmación de que la publicación esté autorizada por DeepSeek. Conviene verificar la integridad de los pesos antes de usarlos en producción.
- Discrepancia de parámetros: la model card declara 552B en el backbone, mientras que los safetensors contienen 484,6B. La diferencia podría corresponder a la memoria Engram de 196B u otros componentes no materializados como parámetros densos, pero la model card no lo aclara.
- Benchmarks no publicados: la sección de evaluación está truncada y no contiene cifras. No hay evidencia cuantitativa de calidad, y el repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria.
- Riesgo de alucinación: no se documentan tasas de alucinación ni resultados de evaluaciones de veracidad. Como en cualquier modelo generativo, la salida debe validarse, especialmente en dominios factuales o con entrada de imágenes.
- Idiomas: el repositorio no declara lista de idiomas ni cobertura multilingüe. Se desconoce el comportamiento fuera del inglés y del chino.
- Contexto largo: aunque el modelo soporta 1M de tokens, no se publican resultados de evaluación específicos de contexto largo (por ejemplo, recuperación en posiciones intermedias), un riesgo habitual en ventanas de este tamaño.
- Licencia: el repositorio declara licencia MIT, lo que permitiría uso comercial. Sin embargo, si los pesos derivan de un modelo de DeepSeek con licencia propia, la aplicabilidad de MIT a este repositorio de terceros es dudosa y debería revisarse legalmente antes de un uso comercial. Los modelos DeepSeek suelen publicarse bajo licencias específicas con condiciones adicionales, no bajo MIT.
- Cuantización: los pesos se distribuyen en 8-bit / FP8, lo que puede degradar ligeramente la calidad frente a los pesos originales en BF16. No se documentan evaluaciones comparativas entre precisiones.
- Requisitos de infraestructura: no es desplegable en hardware de consumo y exige un nodo multi-GPU de gama alta, con soporte de motores de inferencia no confirmado.
- Madurez: fecha de creación y actualización del repositorio el 10 de septiembre de 2026, sin historial de revisiones ni issues públicos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Fileportz/DeepSeek-V4.1-Flash
- Informe técnico referenciado en la model card (ruta relativa al repositorio): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Web oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organización DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Cuenta de X/Twitter de DeepSeek: https://twitter.com/deepseek_ai
- Nota: las búsquedas web realizadas no han devuelto ningún resultado relevante sobre este modelo; los únicos resultados devueltos corresponden a SIHL, una empresa de medios de impresión, sin relación con el modelo.
