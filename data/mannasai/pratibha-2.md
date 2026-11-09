# MannasAI/pratibha-2

## Resumen

PRATIBHA-2, anteriormente conocido como MANAS-2, es un modelo fundacional basado en transformer disenado especificamente para el aprendizaje de representaciones de electroencefalograma (EEG). Lo desarrolla MannasAI y resuelve un problema concreto: la falta de representaciones generalizables para senales cerebrales que puedan reutilizarse en multiples tareas downstream (deteccion de patologias, clasificacion de estados, decodificacion de intencion) sin reentrenar desde cero. Su relevancia actual radica en que aplica al dominio neurofisiologico tecnicas de autoaprendizaje enmascarado que ya han demostrado su valor en texto e imagen.

El modelo tiene 92,8 millones de parametros, 22 capas transformer y embeddings de 512 dimensiones. Procesa EEG muestreado a 200 Hz mediante parches de un segundo con solapamiento de 0,1 segundos y codificacion posicional espacio-temporal, lo que le permite manejar un numero variable de canales y longitudes de senal. Combina un autoencoder enmascarado hibrido crudo-banda (RBH) con una regularizacion de reconstruccion restringida (ConRec) que preserva la continuidad de la energia RMS local.

Se distribuye bajo licencia Apache-2.0 e incluye unicamente el codificador, pensado para extraccion de caracteristicas y ajuste fino. No es un modelo generativo de texto: su pipeline es `feature-extraction` y su salida son tensores de caracteristicas con forma `[batch, patches, channels, 512]`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (codificador) con masked autoencoding hibrido crudo-banda (RBH) y reconstruccion restringida (ConRec) |
| Parametros totales | 92.814.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; procesa parches de 1 s con solapamiento de 0,1 s, con longitud de senal y numero de canales variables |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repositorio; el modelo opera sobre senales EEG, no sobre texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

PRATIBHA-2 es un transformer de 22 capas con embeddings de 512 dimensiones que opera sobre senales EEG preprocesadas. La entrada se segmenta en parches de un segundo a 200 Hz con un solapamiento de 0,1 segundos, y cada parche recibe codificacion posicional espacio-temporal que incorpora las coordenadas de los electrodos (obtenidas mediante una tabla de busqueda incluida en el modelo, en centimetros). Esto permite que el modelo acepte configuraciones de montaje variables, tanto en numero de canales como en duracion de la senal.

El preentrenamiento combina dos objetivos. Por un lado, RBH (Raw-Band Hybrid) realiza reconstruccion tanto de la forma de onda cruda como de su contenido espectral. Por otro, ConRec (Constrained Reconstruction) regulariza la continuidad de la energia RMS local en las formas de onda reconstruidas, lo que actua como restriccion fisicamente plausible sobre la senal. Los datos de preentrenamiento son EEG clinico sin etiquetar procedente de fuentes internas, del corpus TUH EEG y de I-CARE. La model card no detalla el numero total de tokens ni la composicion exacta del dataset, ni menciona el uso de RLHF o DPO (no aplicable a este dominio). Esta version publicada contiene solo el codificador.

## Capacidades

- Extraccion de caracteristicas (embeddings) de senales EEG, con salida `[batch, patches, channels, 512]`.
- Aprendizaje de representaciones temporales y espectrales de la senal cerebral.
- Manejo de numero variable de canales y longitud de senal arbitraria.
- Codificacion posicional basada en nombres de electrodos mediante `get_channel_positions`, con coordenadas en centimetros.
- Acepta configuraciones de montaje heterogeneas (por ejemplo Fz, Cz, Pz u otras combinaciones).
- Base para ajuste fino en tareas downstream de clasificacion o regresion sobre EEG.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.
- Capacidades multilingues: no aplicable; el modelo procesa senales, no lenguaje natural.

## Casos de uso

- Deteccion de anomalias epileptiformes: usar los embeddings por parche como entrada a un clasificador ligero entrenado con pocas muestras etiquetadas, aprovechando que el modelo ya ha aprendido patrones temporales y espectrales de EEG clinico de TUH EEG.
- Monitorizacion de estados de sueno: extraer caracteristicas por ventana de un segundo y agregarlas para clasificar fases del sueno, ya que la resolucion de parche y el muestreo a 200 Hz cubren las bandas relevantes (delta, theta, alfa, sigma).
- Decodificacion de intencion en interfaces cerebro-computador: generar embeddings de epocas cortas y alimentar un clasificador de imagenes motoras o potenciales evocados, con la ventaja de que el codificador es reutilizable entre sujetos.
- Investigacion en neurociencia computacional: usar las representaciones como espacio latente para estudiar similitudes entre condiciones experimentales o entre sujetos, sin necesidad de definir caracteristicas manuales.
- Preprocesado inteligente en pipelines clinicos: integrar el modelo como extractor de caracteristicas en un sistema de triaje que priorice registros con patrones atipicos para revision por especialistas.
- Ajuste fino con datos propios de un laboratorio: al ser Apache-2.0 y de solo 92,8 M de parametros, es viable reentrenar el codificador completo o parcialmente en un unico servidor con GPU de gama media.
- Benchmarking de representaciones EEG: servir como linea base reproducible para comparar metodos de autoaprendizaje en el dominio, dado que el codigo y los pesos son publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 92,8 M de parametros; en fp32 ocupa aproximadamente 0,37 GB de pesos, y en fp16 alrededor de 0,19 GB. La VRAM real dependera del tamano del lote y de la longitud de la senal de entrada.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no aprovecha la capacidad de las de gama alta.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna (GTX 1660 en adelante), dado su tamano reducido.
- Opciones de despliegue: al requerir `trust_remote_code=True` y codigo personalizado, el despliegue esta pensado para la libreria `transformers` (torch >= 2.2, transformers >= 4.57 y < 5, safetensors >= 0.4). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Preprocesado necesario: filtrar y remuestrear la senal a 200 Hz y normalizar cada canal por ventana antes de la inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoria (modelos fundacionales de EEG como BENDR, LaBraM o BIOT). Se indica "no disponible".

## Limitaciones y advertencias

- El modelo espera senales EEG ya preprocesadas: filtrado, remuestreo a 200 Hz y normalizacion por canal y ventana. Omitir este paso degrada las representaciones.
- Los nombres de electrodos deben coincidir exactamente con el orden de canales de la senal; un desajuste produce codificaciones posicionales incorrectas.
- Solo se publica el codificador; no hay cabeza de clasificacion ni tarea downstream incluida, por lo que el rendimiento final depende del ajuste fino del usuario.
- No se documentan sesgos especificos, pero al entrenarse con EEG clinico de fuentes internas, TUH EEG e I-CARE, puede heredar sesgos de poblacion, equipo de registro y protocolo clinico de esos corpus.
- Riesgo de generalizacion limitada a montajes, dispositivos o poblaciones no representados en el preentrenamiento.
- El modelo no es generativo ni conversacional; no debe emplearse para tareas de texto, codigo o razonamiento.
- La etiqueta de idioma "en" es irrelevante para el funcionamiento real, que opera sobre senales.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no obstante, el uso clinico real exige validacion regulatoria independiente.
- El repositorio tiene pocas descargas (107) y likes (3) en el momento de la consulta, lo que sugiere una validacion comunitaria aun limitada.

## Enlaces

- Hugging Face: https://huggingface.co/MannasAI/pratibha-2
- Paper (arXiv): https://arxiv.org/abs/2609.13717
- Organizacion en Hugging Face: https://huggingface.co/MannasAI
