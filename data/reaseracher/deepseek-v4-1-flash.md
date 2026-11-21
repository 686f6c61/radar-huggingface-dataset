# Reaseracher/DeepSeek-V4.1-Flash

## Resumen
DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado en Hugging Face bajo el identificador `Reaseracher/DeepSeek-V4.1-Flash`. Segun la model card, el modelo procede de DeepSeek AI y se presenta como una evolucion de la familia DeepSeek-V4 centrada en la compresion extrema de la cache KV y en la eficiencia de coste para cargas de trabajo agenticas con entradas muy largas. Procesa nativamente imagenes y texto, y genera texto de forma autorregresiva.

La arquitectura declarada es Causal Encoder-Decoder (CED): 40 capas Transformer organizadas en 20 capas de encoder causal seguidas de 20 capas de decoder. El modelo activa aproximadamente 8B parametros por token durante la fase de prefill y 16B durante la decodificacion, lo que reduce el coste computacional en escenarios con mucha entrada y poca salida. El contexto declarado alcanza 1.000.000 de tokens.

El dato de parametros totales en safetensors es de 763.205.315.794 (unos 763B), superior a los 552B de backbone citados en la model card; la diferencia probablemente corresponde a componentes adicionales como el encoder de vision y la memoria condicional Engram (196B). El repositorio ocupa 510,3 GB y se distribuye en safetensors con variantes de 8 bits y FP8.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED), Transformer MoE con 40 capas (20 encoder causal + 20 decoder); atencion dispersa CSA2 con modos Full, Reindex y Reuse; SWA Bounded Replay; Single-Pass mHC; memoria condicional Engram; decodificacion especulativa DSpark |
| Parametros totales | 763.205.315.794 (safetensors); 552B de backbone segun la model card, mas 196B de Engram |
| Parametros activos | 8B por token en prefill y 16B por token en decode; 1 experto compartido y 384 expertos enrutados por capa MoE, 6 expertos enrutados activados por token |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | 8-bit y FP8 declarados en los tags; cache KV principal en FP4 (formato E2M1 con una escala E4M3 por cada 16 canales) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura Causal Encoder-Decoder en la que la cache KV global del decoder se proyecta desde los estados ocultos finales del encoder, en lugar de derivarse de los estados de cada capa del decoder. Esto permite activar solo 8B parametros por token en prefill y 16B en decode. La tecnica SWA Bounded Replay reconstruye los estados KV de ventana deslizante que faltan replicando unicamente los `n_win` tokens mas recientes, evitando persistir SWA KV en SSD y reduciendo la huella persistente de cache KV a aproximadamente 1/8 de la de DeepSeek-V4-Flash.

La atencion Compressed Sparse Attention 2 (CSA2) asigna a cada capa uno de tres modos estaticos (Full, Reindex o Reuse) para compartir KV principal e indice K entre capas y reutilizar indices de atencion dispersa Top-K. En el decoder, un Hierarchical Sparse Indexer restringe las capas de indexacion posteriores a un pool de candidatos construido por la primera capa en modo Full, acotando el coste del indexador con independencia de la longitud de contexto. Combinado con cache KV principal en FP4, la huella global de cache KV queda en 890 bytes por token, aproximadamente 1/4 de la de DeepSeek-V4-Flash y 437 veces menor que la de DeepSeek-V1.

El preentrenamiento se realiza desde cero sobre un corpus multimodal de 45 billones (45T) de tokens, con atencion dispersa entrenada a longitud de secuencia de 64K y contexto extendido a 1M en el punto de 34T tokens. El postentrenamiento sigue el paradigma SFT -> RL -> destilacion on-policy (OPD) sin modificaciones algoritmicas, con cambios sustanciales en el pipeline de datos: sintesis automatizada a gran escala de tareas y entornos agenticos con escalado progresivo de datos, tareas y rollouts. El modelo admite un ajuste de esfuerzo de razonamiento controlable de forma continua (entero de 1 a 100) que intercambia coste de inferencia por precision. El encoder de vision (DeepSeek-ViT) se entrena desde cero con 2D-RoPE y reduccion de pixeles 3x3 (pixel-unshuffle), y un proyector MLP de dos capas convierte las imagenes en embeddings visuales procesados conjuntamente con el texto desde el inicio del preentrenamiento del modelo de lenguaje.

## Capacidades
- Generacion de texto autorregresiva con contexto de hasta 1.000.000 de tokens.
- Procesamiento multimodal de imagenes y texto de forma nativa (pipeline image-text-to-text).
- Razonamiento con esfuerzo controlable mediante un parametro entero de 1 a 100.
- Capacidades agenticas entrenadas mediante sintesis automatizada de tareas y entornos.
- Soporte declarado de decodificacion especulativa DSpark con generacion de borradores semiautorregresiva y verificacion programada por confianza.
- Memoria condicional Engram de 196B parametros con acceso disperso por lookup basado en tokens.
- Compatibilidad con endpoints segun el tag `endpoints_compatible`.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte explicito de tool calling o function calling: no disponible en la informacion proporcionada.

## Casos de uso
- Analisis de documentos extensos con imagenes intercaladas: el contexto de 1M tokens permite procesar manuales, informes o expedientes completos con figuras y tablas en una sola pasada, manteniendo coherencia entre texto e imagen.
- Agentes autonomos de larga duracion: el entrenamiento orientado a tareas agenticas y el ajuste de esfuerzo de razonamiento (1-100) permiten calibrar coste y precision en bucles multi-paso con muchas llamadas y contextos acumulados.
- Procesamiento de repositorios de codigo: la ventana de 1M tokens admite cargar arboles de proyecto completos para revision, refactorizacion o generacion de parches con contexto cruzado entre ficheros.
- Atencion al cliente con historial largo: la compresion de cache KV a 890 bytes por token y la reduccion a 1/8 del footprint persistente facilitan sesiones multi-turno muy largas sin disparar los requisitos de memoria.
- Extraccion de informacion de facturas, formularios e imagenes escaneadas: el encoder DeepSeek-ViT con pixel-unshuffle 3x3 y 2D-RoPE permite ingerir documentos visuales junto al texto de instrucciones en un mismo flujo.
- Investigacion cientifica asistida: el modelo puede resumir y relacionar articulos con figuras, ecuaciones y referencias cruzadas dentro de una ventana de 1M tokens, usando el modo de razonamiento ajustable para tareas de sintesis.
- Pipeline de enriquecimiento de datos multimodal: la activacion de solo 8B parametros en prefill abarata el procesamiento masivo de entradas largas (imagen + texto) en tareas de etiquetado, descripcion o clasificacion.

## Benchmarks y rendimiento
La model card menciona resultados de evaluacion para el modelo base y figuras de rendimiento en benchmarks agenticos, pero el texto proporcionado se interrumpe antes de incluir las tablas con cifras concretas. No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible con cifras concretas en la informacion proporcionada. Como referencia de orden de magnitud, el repositorio ocupa 510,3 GB en safetensors; una carga completa en precision original exigiria agregados de memoria muy por encima de GPU individuales, y las variantes de 8 bits y FP8 reducen esa cifra aproximadamente a la mitad.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el despliegue requeriria nodos multi-GPU de clase数据中心 (A100, H100 o equivalentes) con agregacion de memoria suficiente para los pesos y la cache KV.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada; el volumen de pesos hace inviable un ajuste en GPU de consumo individual salvo estrategias de offload a RAM o SSD.
- Opciones de despliegue: la libreria declarada es transformers; vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible. La model card solo declara que la activacion de 8B parametros en prefill y 16B en decode mejora la eficiencia de coste en cargas con mucha entrada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Cache KV | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763B totales (552B backbone + 196B Engram); 8B activos en prefill, 16B en decode | 1.000.000 tokens | 890 bytes/token (FP4) | MIT | Hugging Face (`Reaseracher/DeepSeek-V4.1-Flash`) |
| DeepSeek-V4-Flash | no disponible | no disponible | aproximadamente 4 veces mayor que V4.1-Flash | no disponible | no disponible |
| DeepSeek-V1 | no disponible | no disponible | aproximadamente 437 veces mayor que V4.1-Flash | no disponible | no disponible |

No se dispone de datos de parametros, contexto ni rendimiento de DeepSeek-V4-Flash y DeepSeek-V1 en la informacion proporcionada, por lo que la comparativa se limita a las reducciones de cache KV citadas en la model card.

## Limitaciones y advertencias
- La model card no detalla sesgos conocidos del modelo; no hay informacion disponible sobre este punto.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; al ser un modelo generativo de gran escala, debe asumirse el riesgo habitual y validar salidas en produccion.
- Idiomas soportados: no disponible, lo que impide garantizar cobertura multilingue mas alla de lo que se observe empiricamente.
- El identificador del repositorio (`Reaseracher/DeepSeek-V4.1-Flash`) no coincide con la organizacion oficial `deepseek-ai` enlazada en la model card; conviene verificar la procedencia y autenticidad de los pesos antes de usarlos en produccion.
- El numero de parametros totales en safetensors (763B) difiere de los 552B de backbone declarados en el texto; la diferencia se atribuye a componentes adicionales, pero no se desglosa con detalle.
- La licencia MIT permite uso comercial, pero la model card no incluye clausulas adicionales de uso aceptable ni terminos especificos de responsabilidad.
- El modelo esta publicado con 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- La informacion sobre tool calling, agentes y capacidades multilingues es incompleta; no debe asumirse soporte sin verificar.
- El tamano del repositorio (510,3 GB) y la ventana de 1M tokens implican requisitos de infraestructura elevados; el despliegue en entornos con memoria limitada requerira cuantizacion agresiva u offload.

## Enlaces
- Hugging Face: https://huggingface.co/Reaseracher/DeepSeek-V4.1-Flash
- Pagina oficial de DeepSeek: https://www.deepseek.com/
- Chat DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Twitter/X de DeepSeek: https://twitter.com/deepseek_ai
- Informe tecnico (referenciado en la model card): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
