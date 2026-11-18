# Dcode-AI/SAMBA

## Resumen

SAMBA es un modelo fundacional de representaciones para electroencefalografía (EEG) desarrollado por Jiazhen Hong durante una practica en Emotiv, y publicado bajo el identificador Dcode-AI/SAMBA en Hugging Face. Su proposito es extraer caracteristicas genericas de senales EEG que puedan reutilizarse en multiples tareas de interfaz cerebro-computadora (BCI) mediante probing lineal o fine-tuning, evitando entrenar un modelo desde cero para cada nuevo dataset o montaje de electrodos.

El modelo combina dos innovaciones tecnicas: un nucleo basado en Mamba diferencial (state space model) en lugar de atencion cuadratica, y un mecanismo de embedding espacial guiado por coordenadas que aprende a combinar canales EEG a partir de la posicion fisica de los electrodos. Con solo 1,06 millones de parametros, esta disenado para ser extremadamente ligero y eficiente, procesando senales a 128 Hz tanto en ventanas cortas (2 s, 256 muestras) como largas (100 s, 12.800 muestras).

Se distribuyen dos checkpoints: SAMBA-2s, preentrenado con datos de Emotiv, HBN, Muse y DICE sobre configuraciones de 4, 14, 19 y 129 canales, y SAMBA-100s, preentrenado sobre TUAB con 16 canales bipolares. Ambos comparten arquitectura y numero de parametros, y los encoders aceptan longitudes de entrada y disposiciones de canales distintas a las de preentrenamiento. El modelo se publica como extractor de caracteristicas (pipeline `feature-extraction`) y requiere una libreria propia, `samba-eeg`, ademas de un sistema CUDA compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba diferencial con embedding espacial guiado por coordenadas (state space model) |
| Parametros totales | 1,06 M (1.060.000) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 2 s (256 muestras) en SAMBA-2s; 100 s (12.800 muestras) en SAMBA-100s; ambos encoders admiten otras longitudes de entrada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de senales EEG, no de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |
| Frecuencia de muestreo | 128 Hz |
| Canales de preentrenamiento | SAMBA-2s: 4, 14, 19 y 129; SAMBA-100s: 16 bipolares |
| Dimension de salida | 128 por paso temporal (`[batch, floor(samples/8), 128]`) |
| Libreria | `samba-eeg` |
| Hardware requerido | sistema CUDA compatible |

## Arquitectura y entrenamiento

SAMBA emplea un backbone de Mamba diferencial, una variante de los modelos de espacio de estados (SSM) que sustituye la atencion cuadratica de los transformers por una recurrencia selectiva con coste lineal en la longitud de secuencia. Esto resulta especialmente adecuado para EEG, donde las ventanas pueden alcanzar 12.800 muestras (100 s a 128 Hz) sin que el coste computacional se dispare. La segunda pieza clave es un embedding espacial guiado por coordenadas: el modelo recibe, junto con la senal `[batch, channels, samples]`, un tensor de posiciones `[channels, 3]` o `[batch, channels, 3]` con las coordenadas 3D de cada electrodo, y aprende a ponderar y combinar los canales en funcion de su ubicacion fisica en el cuero cabelludo. La model card incluye mapas topograficos animados que muestran como estos pesos espaciales evolucionan durante el entrenamiento en tareas de ojos abiertos/cerrados, distraccion al volante e imagenes motoras.

El entrenamiento es auto-supervisado (self-supervised learning). SAMBA-100s sigue el metodo original con un pipeline TUAB reconstruido y una particion de validacion; usa 16 canales bipolares y un filtro bandpass de 0,5-45 Hz durante el preentrenamiento. SAMBA-100s se entreno sobre TUAB exclusivamente. SAMBA-2s amplia la diversidad de datos anadiendo HBN, Muse y DICE a los datos de Emotiv (conjuntos Alpha, Attention, Crowdsource, DriverDistraction y STEW), lo que aporta variedad en la disposicion de electrodos. No se especifica en la informacion disponible el numero total de tokens ni el volumen exacto de horas de EEG utilizadas, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables de forma convencional a un modelo de representacion). La normalizacion recomendada es por canal y ventana, dividiendo por el percentil 95 absoluto.

## Capacidades

- Extraccion de caracteristicas EEG auto-supervisadas en forma de embeddings de 128 dimensiones por paso temporal.
- Representacion de senales a 128 Hz con ventanas de 2 s o 100 s, y flexibilidad para otras longitudes de entrada.
- Generalizacion a disposiciones de canales distintas a las de preentrenamiento gracias al embedding espacial por coordenadas.
- Soporte de multiples configuraciones de canales (4, 14, 19, 129 en SAMBA-2s; 16 bipolares en SAMBA-100s).
- Aprendizaje de pesos espaciales interpretables por region cerebral (mapas topograficos).
- Uso para probing lineal sobre caracteristicas pooled (`features.mean(dim=1)`) o fine-tuning del encoder completo.
- Aplicable a tareas BCI como deteccion de estado ocular, distraccion al volante e imagenes motoras.
- No soporta tool calling, agentes, generacion de texto, vision ni audio: es exclusivamente un encoder de senales EEG.

## Casos de uso

- Clasificacion de estados oculares (ojos abiertos vs. cerrados): el modelo aprende pesos espaciales diferenciados por region cerebral, de modo que un clasificador lineal sobre los embeddings pooled puede discriminar el estado sin reentrenar el encoder.
- Deteccion de distraccion al volante: SAMBA-2s se preentreno con el conjunto DriverDistraction de Emotiv, por lo que sus representaciones capturan patrones asociados a la carga cognitiva y la atencion, utiles en sistemas de monitorizacion de conductores.
- Decodificacion de imagenes motoras: los mapas topograficos de imagenes motoras incluidos en la model card indican que el modelo captura patrones motores corticales, aprovechables en interfaces de control protesico o de cursor.
- Investigacion clinica en neurologia: SAMBA-100s, preentrenado sobre TUAB (Temple University Abnormal EEG Corpus), puede servir como extractor de caracteristicas para deteccion de anomalias epileptiformes o clasificacion normal/anormal con ventanas largas de 100 s.
- Sistemas BCI de bajo consumo: con 1,06 M de parametros, el modelo es viable en dispositivos con GPU modesta o incluso entornos embebidos con CUDA, reduciendo la latencia frente a transformers de mayor tamano.
- Estandarizacion de pipelines multi-dataset: al aceptar longitudes y layouts de canales variables, SAMBA permite unificar la extraccion de caracteristicas en estudios que mezclan distintos cascos EEG (Emotiv, Muse, HBN, DICE) sin reentrenar por dispositivo.
- Preentrenamiento base para transferencia: investigadores pueden hacer fine-tuning del encoder en datasets pequenos etiquetados, aprovechando las representaciones auto-supervisadas para mitigar la escasez de datos en BCI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,06 M de parametros en float32 el peso del modelo ocupa aproximadamente 4,2 MB, por lo que la VRAM dominante la determina el tamano del batch y la longitud de la secuencia, no el modelo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; la model card exige explicitamente "un sistema CUDA compatible". Para lotes grandes o ventanas de 12.800 muestras conviene una RTX 3090/4090 o superior; para inferencia ligera basta una GPU de gama baja.
- Cabe en GPU consumer: si, practicamente en cualquier GPU NVIDIA consumer con CUDA (GTX 1060 en adelante), ya que el cuello de botella es la senal de entrada, no los pesos.
- Opciones de despliegue: la libreria oficial `samba-eeg` (instalacion via `pip install -e '.[mamba,hub]'`), con `SambaModel.from_pretrained()` y `model.encode(signals, positions)`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste es lineal en la longitud de secuencia por el uso de Mamba en lugar de atencion cuadratica, lo que favorece ventanas largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAMBA (este modelo) | 1,06 M | 2 s y 100 s (128 Hz) | Mamba diferencial + embedding espacial | no disponible | Hugging Face (`Dcode-AI/SAMBA`) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre otros modelos fundacionales de EEG comparables (por ejemplo, variantes tipo EEGPT, LaBraM o BIOT) que permitan una comparacion rigurosa de parametros, contexto y rendimiento. Se indica "no disponible" para no inventar cifras.

## Limitaciones y advertencias

- Licencia no especificada: no se indica licencia en la model card ni en los metadatos de Hugging Face, por lo que el uso comercial queda en un limbo legal hasta que el autor la declare explicitamente.
- Modelo de representacion, no generativo: no produce texto ni respuestas; requiere una cabeza de clasificacion o un pipeline posterior para cada tarea.
- Dependencia de coordenadas: el rendimiento depende de que las posiciones 3D de los electrodos se proporcionen en las unidades y el sistema de referencia indicados en `config.json`; un desajuste degrada la calidad de los embeddings.
- Normalizacion obligatoria: la senal debe normalizarse por canal y ventana (percentil 95 absoluto) y, para SAMBA-100s, respetar el bandpass 0,5-45 Hz del preentrenamiento; obviar estos pasos puede invalidar las caracteristicas.
- Frecuencia fija de 128 Hz: las senales deben remuestrearse a 128 Hz antes de la inferencia.
- Requiere CUDA: no se documenta soporte CPU, lo que limita el despliegue en entornos sin GPU NVIDIA.
- Checkpoints reentrenados: los originales ya no estan disponibles y los actuales se reentrenaron con pipelines reconstruidos, por lo que los resultados pueden diferir de los del paper original.
- Sesgos y alucinacion: al ser un encoder de senales, no hay riesgo de alucinacion textual, pero si de sesgo de dominio (los datasets de preentrenamiento condicionan la generalizacion a poblaciones, edades o patologias no representadas).
- Sin benchmarks publicados: no hay evidencia cuantitativa en la informacion disponible sobre su rendimiento frente a alternativas, lo que dificulta justificar su eleccion en produccion.
- Comunidad muy reducida: 0 descargas y 1 like en el momento de la consulta, con repo de 0,0 GB en metadatos; soporte y mantenimiento inciertos.

## Enlaces

- Hugging Face (modelo principal): https://huggingface.co/Dcode-AI/SAMBA
- Checkpoint SAMBA-2s: https://huggingface.co/Dcode-AI/SAMBA-2s
- Checkpoint SAMBA-100s: https://huggingface.co/Dcode-AI/SAMBA-100s
- Web del proyecto: https://samba.dcode.ai/
- Codigo fuente: https://github.com/Jiazhen-Hong/SAMBA
- Paper (arXiv): https://arxiv.org/abs/2511.18571
