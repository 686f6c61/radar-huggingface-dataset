# Acapellas/BSRoformer-GGUF

## Resumen

BSRoformer-GGUF es un repositorio de pesos en formato GGUF para separación de fuentes musicales (music source separation) basado en la arquitectura BS-RoFormer / Mel-Band-Roformer. El repositorio está publicado por el usuario Acapellas en HuggingFace, pero su model card describe explícitamente el proyecto BSRoformer.cpp y las conversiones originales de chenmozhijin, por lo que se trata de una réplica o reempaquetado de un repositorio ajeno más que de un desarrollo propio. El modelo no genera texto: es un modelo de audio-a-audio que recibe una mezcla musical y devuelve una o varias pistas aisladas (típicamente voz e instrumental).

Técnicamente es una red transformer orientada a audio que opera sobre bandas de mel (band-split) con embeddings posicionales rotatorios, una familia que se ha convertido en referencia en separación de voces por su calidad frente a aproximaciones convolucionales previas. El recuento real de parámetros declarado para los pesos safetensors es de 51.053.325, un tamaño muy contenido que permite inferencia en CPU y en GPUs de gama baja. El repositorio ocupa 4,9 GB porque agrupa múltiples modelos y múltiples niveles de cuantización.

El interés práctico reside en que permite ejecutar separación de fuentes de alta calidad de forma local y multiplataforma mediante el motor MelBandRoformer.cpp, sin depender de servicios en la nube ni de frameworks de deep learning completos. Como contrapartida, la licencia no está declarada, el número de descargas es cero y no se publican métricas de calidad, por lo que su adopción en producción requiere verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BS-RoFormer / Mel-Band-Roformer (transformer con band-split y embeddings posicionales rotatorios) |
| Parametros totales | 51.053.325 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; procesa audio por fragmentos configurables (parametro `--overlap` en la CLI) |
| Tipos de cuantizacion | q8_0 (recomendada), fp16, q4_0, q4_1, q5_0, q5_1; pesos de normalizacion y bias se mantienen en FP32 |
| Idiomas soportados | no disponible (modelo de audio; la separacion voz/instrumental es independiente del idioma) |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Tarea (pipeline) | audio-to-audio (separacion de fuentes musicales) |
| Tamano del repositorio | 4,9 GB (incluye varios modelos y cuantizaciones) |
| Entradas / salidas | ficheros de audio (por ejemplo WAV) de entrada y salida |
| Motor de inferencia | MelBandRoformer.cpp / BSRoformer.cpp (herramienta CLI `bs_roformer-cli`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

La familia BS-RoFormer combina un esquema de separacion por bandas de frecuencia (band-split) con un transformer que modela dependencias temporales y entre bandas mediante atencion con embeddings posicionales rotatorios. La variante Mel-Band-Roformer reorganiza las bandas segun la escala de mel, lo que concentra la capacidad del modelo en las regiones del espectro mas relevantes para la percepcion musical. El resultado es un modelo de tamano moderado (unos 51 millones de parametros) que separa voces y acompanamiento con una calidad que en la literatura de la especialidad supera a las arquitecturas convolucionales anteriores.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o horas de audio utilizado, la composicion de los datos ni si hubo etapas de ajuste fino con preferencia humana o funciones de perdida especificas. La model card del repositorio solo documenta el proceso de conversion a GGUF y la lista de modelos originales convertidos, no el entrenamiento. Los modelos de origen citados son `mel-band-roformer-deux` (becruily), `BS-RoFormer` (anvuew) y `MelBandRoformers` en su variante `voc_fv6` (GaboxR67), cada uno con su propio pipeline de entrenamiento del que este repositorio no ofrece detalles.

La innovacion tecnica relevante aqui no esta en el modelo sino en el formato: la conversion a GGUF con pesos de normalizacion y bias en FP32 permite reducir el uso de memoria y de ancho de banda sin degradar apreciablemente la calidad de audio, y el motor MelBandRoformer.cpp posibilita inferencia local multiplataforma sin dependencias de PyTorch. La CLI admite ajuste del tamano de fragmento y del solapamiento entre fragmentos para equilibrar calidad y coste computacional.

## Capacidades

- Separacion de fuentes musicales: aislamiento de la pista vocal y de la parte instrumental a partir de una mezcla.
- Procesamiento de audio-a-audio: la entrada y la salida son ficheros de audio, no texto.
- Modelos especializados por tallo: el repositorio incluye variantes orientadas a voces (`voc_fv6`) y a otros tallos segun el modelo de origen.
- Ejecucion local multiplataforma: los pesos GGUF se ejecutan con BSRoformer.cpp en Windows, Linux y macOS.
- Control de calidad y coste: parametros de fragmento y solapamiento (`--overlap`) para ajustar el resultado.
- Cuantizacion flexible: seis niveles de cuantizacion para adaptarse a distintos limites de VRAM o RAM.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni modo de pensamiento.
- No dispone de soporte multilingue en el sentido convencional; la tarea es acustica, no linguistica.

## Casos de uso

- Produccion de karaokes y pistas de acompanamiento: se extrae la pista instrumental eliminando la voz principal, con la ventaja de que el modelo trabaja sobre la mezcla completa sin necesidad de stems previos.
- Remezcla y masterizacion: obtener tallos separados de una grabacion permite reequilibrar niveles, aplicar procesado independiente a la voz o sustituir un instrumento sin volver a mezclar desde cero.
- Limpieza y restauracion de grabaciones: aislar la voz de una grabacion antigua con ruido de fondo o acompanamiento permite aplicar reduccion de ruido o ecualizacion solo sobre ella.
- Creacion de datasets para ASR: separar previamente las voces del acompanamiento mejora la tasa de acierto de sistemas de reconocimiento de habla cuando se entrena o evalua con material musical.
- Post-produccion para doblaje y subtitulado: la separacion vocal facilita generar versiones dobladas manteniendo la musica y los efectos originales, o extraer dialogos para su transcripcion.
- Produccion de beats y sample flipping: productores que necesitan aislar fragmentos vocales o instrumentales concretos de una mezcla pueden obtener el tallo limpio y remuestrearlo.
- Investigacion en separacion de fuentes: sirve como referencia reproducible en formato GGUF para comparar arquitecturas RoFormer frente a alternativas convolucionales, con un coste de hardware minimo.
- Preprocesado en pipelines de audio a gran escala: al pesar unas decenas de megabytes por modelo cuantizado, puede desplegarse en lotes sobre CPU en servidores sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de SDR, SIR ni SAR, ni comparaciones objetivas o subjetivas frente a otros modelos de separacion.

## Requisitos de hardware

- Memoria estimada para los pesos (51,05 millones de parametros, sin contar activaciones): aproximadamente 204 MB en FP32, 102 MB en FP16, 54 MB en q8_0 y 27-30 MB en q4_0/q4_1.
- VRAM/RAM total estimada para inferencia: por debajo de 1 GB en todas las cuantizaciones, incluyendo buffers de audio y activaciones; el consumo real depende del tamano de fragmento configurado.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen de sobra. Para uso profesional en lotes, A100 o H100 no aportan ventaja significativa porque el modelo es muy pequeno y el cuello de botella suele estar en el proceso de audio.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo actual e incluso en GPUs integradas y en CPU pura.
- Opciones de despliegue: exclusivamente la CLI de BSRoformer.cpp / MelBandRoformer.cpp con ficheros GGUF. No es compatible con llama.cpp, Ollama, vLLM, TGI ni otras plataformas de servidores LLM, pese a compartir el formato GGUF.
- Latencia y throughput: no disponible. No se publican factores de tiempo real ni mediciones por fragmento.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BSRoformer-GGUF (este repositorio) | BS-RoFormer / Mel-Band-RoFormer | 51.053.325 | no aplica (audio) | no disponible | GGUF via BSRoformer.cpp; 0 descargas |
| Demucs v4 (htdemucs) | Hibrido espectrograma/forma de onda | no disponible | no aplica (audio) | MIT (Meta) | Pesos PyTorch, ampliamente desplegado |
| Spleeter | U-Net sobre espectrograma | no disponible | no aplica (audio) | MIT (Deezer) | TensorFlow, con modelos de 2, 4 y 5 tallos |
| Modelos UVR5 / MDX-Net | Redes convolucionales y variantes | no disponible | no aplica (audio) | varia segun el modelo | Distribuidos con la aplicacion UVR |

En terminos cualitativos, la familia RoFormer se situa por encima de Demucs v4 y Spleeter en calidad de separacion vocal segun la practica habitual en la comunidad de separacion de fuentes, aunque no se dispone de numeros verificables en la informacion proporcionada. La ventaja especifica de este repositorio es el formato GGUF y su ejecucion ligera en CPU; su desventaja es la ausencia de licencia declarada y la falta de cualquier validacion publicada.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita no hay autorizacion clara para uso comercial; se debe contactar con el autor antes de integrarlo en un producto.
- Origen incierto: el repositorio figura a nombre de Acapellas, pero la model card describe el proyecto y los modelos de chenmozhijin, becruily, anvuew y GaboxR67. Conviene verificar la procedencia y los derechos de los pesos originales.
- Sin validacion publicada: cero descargas y cero likes, sin benchmarks ni evaluaciones objetivas de SDR/SIR/SAR.
- Riesgo de artefactos: como todo modelo de separacion, puede introducir artefactos espectrales, coloreado tonal, bombeo o residuos de voz en el instrumental, especialmente en mezclas densas o con voces procesadas.
- Dependencia de la configuracion: el resultado varia con el tamano de fragmento y el solapamiento elegidos; una configuracion inadecuada produce discontinuidades en las uniones entre fragmentos.
- Especializacion limitada: cada fichero GGUF corresponde a un modelo concreto entrenado para un tallo o tarea determinada; no existe un unico modelo universal con calidad optima para todos los instrumentos.
- Ecosistema restringido: solo se ejecuta con BSRoformer.cpp, lo que limita la integracion con servidores de inferencia habituales y obliga a gestionar la CLI como subproceso.
- Sin soporte de texto ni de idioma: no es un modelo de lenguaje y no puede utilizarse para generacion, resumen, traduccion ni razonamiento.
- Fechas de publicacion anomalas: las marcas temporales del repositorio (2026) no permiten contrastar su historial ni su mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Acapellas/BSRoformer-GGUF
- Repositorio de referencia citado en la model card: https://huggingface.co/chenmozhijin/BSRoformer-GGUF
- BSRoformer.cpp (herramienta CLI y binarios): https://github.com/chenmozhijin/BSRoformer.cpp
- MelBandRoformer.cpp (motor de inferencia): https://github.com/chenmozhijin/MelBandRoformer.cpp
- Especificacion del formato GGUF: https://github.com/ggerganov/ggml/blob/master/docs/gguf.md
- Modelo original mel-band-roformer-deux (becruily): https://huggingface.co/becruily/mel-band-roformer-deux
- Modelo original BS-RoFormer (anvuew): https://huggingface.co/anvuew/BS-RoFormer
- Modelos originales MelBandRoformers (GaboxR67): https://huggingface.co/GaboxR67/MelBandRoformers
