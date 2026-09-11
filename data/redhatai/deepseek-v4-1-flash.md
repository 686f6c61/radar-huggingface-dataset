# RedHatAI/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI y distribuido en HuggingFace bajo el identificador RedHatAI/DeepSeek-V4.1-Flash. Procesa de forma nativa imagenes y texto, y genera texto de manera autorregresiva. Su rasgo diferencial no es el tamano bruto, sino la compresion agresiva de la cache KV: segun la model card, reduce la huella global de KV a unos 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash y 437 veces menos que la de DeepSeek-V1, lo que abarata drasticamente las cargas de trabajo con entradas muy largas (agentes, RAG masivo, analisis de documentos extensos).

La arquitectura es un transformer con esquema Causal Encoder-Decoder (CED) de 40 capas (20 de encoder causal y 20 de decoder), con Soporte de contexto de hasta 1.000.000 de tokens. La model card declara 552B de parametros en el backbone mas 196B adicionales de memoria condicional Engram, mientras que el conteo real de pesos en safetensors asciende a 763.205.315.794 parametros. El modelo activa solo 8B parametros por token durante el prefill y 16B durante la decodificacion, gracias al enrutamiento MoE (1 experto compartido y 384 expertos enrutados por capa, con 6 activados por token).

Su relevancia actual radica en dos frentes: por un lado, demuestra que la eficiencia de cache KV se puede llevar mucho mas lejos combinando atencion dispersa comprimida (CSA2) y cache en FP4; por otro, su receta de post-entrenamiento esta orientada explicitamente a tareas agenticas, con sintesis automatica a gran escala de tareas y entornos, y una palanca de esfuerzo de razonamiento continuamente ajustable entre 1 y 100. La licencia MIT facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con arquitectura Causal Encoder-Decoder (CED): 40 capas (20 encoder causal + 20 decoder) |
| Parametros totales | 763.205.315.794 (safetensors); la model card declara 552B en el backbone + 196B de memoria condicional Engram |
| Parametros activos | 8B por token en prefill y 16B por token en decode; por capa MoE, 1 experto compartido + 384 enrutados, con 6 enrutados activados por token |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | FP8 / 8-bit (etiquetas del repositorio); cache KV principal en FP4 (formato E2M1, una escala E4M3 por cada 16 canales) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Desarrollador del modelo | DeepSeek AI (repositorio publicado por RedHatAI) |
| Modalidades de entrada / salida | Entrada de imagen y texto; salida de texto (pipeline image-text-to-text) |
| Tamano del repositorio | 510,3 GB |
| Fecha de publicacion en HuggingFace | 2026-09-11 |

## Arquitectura y entrenamiento

DeepSeek-V4.1-Flash emplea una arquitectura Causal Encoder-Decoder (CED) de 40 capas. La innovacion estructural clave es que la cache KV global del decoder se proyecta desde los estados ocultos finales del encoder, en lugar de derivarse de los estados ocultos de cada capa del decoder. Esto permite reducir el coste de activacion durante el prefill. Sobre esa base se anaden varios mecanismos: Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar indices de atencion dispersa Top-K; un indexador disperso jerarquico que restringe las capas de indexacion posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexador con independencia de la longitud del contexto; SWA Bounded Replay, que reconstruye los estados KV de ventana deslizante ausentes replicando solo los ultimos n_win tokens, evitando persistir esa KV en SSD; Single-Pass mHC, con un kernel Mega-mHC; memoria condicional Engram (196B parametros, acceso disperso mediante lookup basado en tokens); y decodificacion especulativa DSpark, con generacion semi-autorregresiva de borradores y verificacion planificada por confianza.

La cache KV principal se almacena en FP4, lo que junto al resto de mecanismos lleva la huella global a 890 bytes por token. En el lado multimodal, DeepSeek-ViT es un encoder de vision entrenado desde cero con 2D-RoPE y downsampling 3x3 pixel-unshuffle, y un proyector MLP de dos capas que convierte las imagenes en embeddings visuales procesados conjuntamente con los de texto desde el inicio del preentrenamiento.

El preentrenamiento se realizo desde cero sobre un corpus multimodal de 45 billones (45T) de tokens, con atencion dispersa entrenada a una longitud de secuencia de 64K y extension de contexto hasta 1M tokens a los 34T tokens. El post-entrenamiento sigue el paradigma estandar SFT, RL y destilacion on-policy (OPD) sin modificaciones algoritmicas; los cambios sustanciales estan en el pipeline de datos, con sintesis automatica a gran escala de tareas y entornos agenticos y escalado progresivo de datos, tareas y rollouts. El modelo admite un ajuste de esfuerzo de razonamiento continuo, expresado como entero de 1 a 100, que intercambia coste de inferencia por precision.

## Capacidades

- Generacion de texto autorregresiva a partir de entradas de texto, imagen o ambas combinadas.
- Comprension multimodal: procesamiento conjunto de imagenes y texto mediante el encoder DeepSeek-ViT y el proyector MLP.
- Razonamiento con esfuerzo controlable: el parametro entero 1-100 permite ajustar dinamicamente el coste de inferencia frente a la precision.
- Flujos agenticos y razonamiento multi-paso: la receta de post-entrenamiento se centra en tareas y entornos agenticos sintetizados automaticamente.
- Atencion dispersa sobre contextos de hasta 1.000.000 de tokens, adecuada para entradas masivamente largas.
- Decodificacion especulativa integrada (DSpark), que acelera la generacion mediante borradores semi-autorregresivos y verificacion planificada por confianza.
- Memoria condicional Engram con acceso disperso por lookup basado en tokens (196B parametros).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes autonomos sobre repositorios completos: el modelo puede ingerir bases de codigo enteras de cientos de miles de tokens en una sola pasada gracias a su ventana de 1M tokens y a una cache KV de 890 bytes por token, lo que hace viable mantener sesiones largas sin reinyectar contexto.
- Analisis documental y compliance: procesamiento de expedientes, contratos o normativa extensa con citas cruzadas, aprovechando la ventana de 1M tokens para evitar pipelines de fragmentacion y recuperacion.
- RAG de gran escala con contexto persistente: al reducir la huella de KV aproximadamente a la cuarta parte de DeepSeek-V4-Flash, permite mantener mas conversaciones concurrentes por GPU en servicios de recuperacion aumentada con historiales largos.
- Automatizacion de soporte tecnico multi-turno: conversaciones prolongadas con historial completo y adjuntos de imagen (capturas de pantalla, diagramas), gracias a la entrada multimodal y al contexto extendido.
- Inspeccion visual de documentacion tecnica: lectura conjunta de diagramas de arquitectura, esquematicos y texto asociado para generar resumenes, comprobaciones de consistencia o documentacion derivada.
- Pipelines de codigo asistido con razonamiento ajustable: usar el parametro de esfuerzo 1-100 para bajar coste en tareas simples (autocompletado, refactor mecanico) y subirlo en tareas complejas (depuracion de fallos distribuidos, migraciones).
- Investigacion sobre eficiencia de atencion: la combinacion de CSA2, indexador jerarquico y KV en FP4 lo convierte en una referencia para estudiar compresion de cache y atencion dispersa a escala de millones de tokens.
- Procesamiento batch de entrada intensiva: dado que el prefill activa solo 8B parametros por token, resulta especialmente adecuado para cargas donde el volumen de tokens de entrada domina sobre los de salida (clasificacion, extraccion, resumen masivo).

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una seccion de "Evaluation Results" para el modelo base, pero los valores concretos no estan presentes en el material proporcionado; solo se indica que todos los modelos base se evaluaron en el marco interno de DeepSeek bajo los mismos ajustes y que las diferencias de 0,3 puntos o menos se consideran equivalentes.

El unico dato externo disponible procede de Artificial Analysis, que situa a DeepSeek V4.1 Flash (configuracion de razonamiento con esfuerzo maximo) con una puntuacion de 40 en su Intelligence Index, por encima de la media de modelos comparables.

| Fuente | Metrica | Resultado |
|---|---|---|
| Model card (DeepSeek) | Benchmarks de modelo base | no disponible (valores no incluidos en la informacion) |
| Artificial Analysis | Intelligence Index (Reasoning, Max Effort) | 40 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 763.205.315.794 parametros, en FP8 los pesos ocupan aproximadamente 763 GB antes de overhead; en 4 bits serian del orden de 380 GB. Estas cifras son calculos derivados del conteo de parametros, no datos oficiales.
- Tamano del repositorio: 510,3 GB, lo que da una referencia practica del espacio en disco necesario para los pesos distribuidos.
- Cache KV: 890 bytes por token a nivel global, es decir, aproximadamente 0,89 GB por cada millon de tokens de contexto. El coste de contexto es, por tanto, notablemente bajo en comparacion con modelos de su categoria.
- GPU recomendadas: despliegue multi-GPU obligatorio. Para FP8 se necesitan del orden de 10 GPU de 80 GB (H100, H200 o A100 80 GB) solo para pesos, mas margen para activaciones y buffers. Con cuantizacion a 4 bits, el minimo practico se situa en torno a 5-8 GPU de 80 GB.
- GPU de consumo: no cabe en ninguna GPU de consumo actual. Una RTX 4090 con 24 GB no puede alojar ni una fraccion relevante del modelo en cuantizaciones practicas, ni tampoco configuraciones multi-GPU de consumo por el limite de memoria por dispositivo y el ancho de banda requerido.
- Opciones de despliegue: transformers (libreria declarada en el repositorio) y vLLM, para el que existe una receta publicada en recipes.vllm.ai. No hay informacion disponible sobre soporte en llama.cpp, Ollama o TGI; la arquitectura CED con atencion dispersa y modos de capa especificos hace poco probable su conversion a formatos GGUF estandar.
- Latencia y throughput: no disponible. La decodificacion especulativa DSpark y la activacion de solo 16B parametros por token en decode apuntan a una mejora de throughput, pero no se han facilitado cifras.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con otros miembros de la propia familia DeepSeek, usando los ratios que cita la model card. Los datos de parametros, contexto y rendimiento de esos modelos no estan disponibles en el material proporcionado.

| Modelo | Parametros | Contexto | Huella de cache KV | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763.205.315.794 (552B backbone + 196B Engram) | 1.000.000 tokens | 890 bytes/token | MIT | HuggingFace (RedHatAI y DeepSeek AI) |
| DeepSeek-V4-Flash | no disponible | no disponible | aproximadamente 4x la de V4.1-Flash | no disponible | no disponible |
| DeepSeek-V1 | no disponible | no disponible | aproximadamente 437x la de V4.1-Flash | no disponible | no disponible |

Frente a modelos comparables de otros desarrolladores (por ejemplo, otras familias frontier multimodales de escala similar), no se dispone de datos verificables en la informacion proporcionada, por lo que la comparativa se limita a la familia DeepSeek.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks en el material disponible, por lo que el rendimiento real en tareas concretas no puede validarse a partir de esta ficha.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala. La model card no documenta tasas de alucinacion ni mecanismos especificos de mitigacion mas alla del ajuste de esfuerzo de razonamiento.
- Sesgos conocidos: no disponible. No se documentan evaluaciones de sesgo, toxicidad o equidad.
- Idiomas soportados: no disponible. No se especifica cobertura multilingue ni calidad por idioma, lo que impide asumir un rendimiento homogeneo fuera del ingles o del chino.
- Longitud de contexto: aunque la ventana nominal es de 1M tokens, no se aportan resultados de evaluacion especificos en esa longitud (por ejemplo, pruebas tipo needle-in-a-haystack), por lo que la degradacion con contextos muy largos no esta cuantificada.
- Coste de despliegue muy elevado: el modelo exige infraestructura multi-GPU de centro de datos; no es viable en hardware de consumo ni en entornos de un solo nodo con pocas GPU.
- Compatibilidad de tooling limitada: al tratarse de una arquitectura con CED, atencion dispersa con modos estaticos, memoria Engram y decodificacion especulativa propia, el soporte fuera de transformers y vLLM puede ser incompleto o inexistente.
- Licencia MIT: permisiva y apta para uso comercial, pero conviene verificar el fichero LICENSE del repositorio concreto y las condiciones de los pesos publicados por RedHatAI, ya que se trata de una redistribucion de un modelo de terceros.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado en la misma fecha: se trata de una publicacion muy reciente y sin validacion comunitaria acumulada.
- Discrepancia de cifras: el conteo real de parametros en safetensors (763.205.315.794) no coincide exactamente con la suma de los 552B del backbone y los 196B de Engram declarados en la model card, lo que conviene tener en cuenta al planificar recursos.

## Enlaces

- Modelo en HuggingFace (RedHatAI): https://huggingface.co/RedHatAI/DeepSeek-V4.1-Flash
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Informe tecnico (DeepSeek_V41_Tech_Report.pdf), referenciado en la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Receta de despliegue en vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash
- Analisis de rendimiento en Artificial Analysis: https://artificialanalysis.ai/models/deepseek-v4-1-flash
- Sitio web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Repositorio de referencia de la familia en GitHub: https://github.com/deepseek-ai/DeepSeek-V2
