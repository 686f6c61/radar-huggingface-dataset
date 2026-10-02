# Anuran66/Phorensics-Engine

## Resumen

PHORENSICS (Phorensics-Engine) es un motor deterministico de forense de medios desarrollado por Anuran Bhattacharya (usuario Anuran66), publicado como repositorio en Hugging Face dentro del ecosistema `transformers` y con licencia MIT segun la model card. No es un modelo neuronal entrenado: es un motor de verificacion basado en fisica que analiza propiedades estructurales de la imagen, concretamente la decadencia del espectro de frecuencia espacial mediante Fast Fourier Transform (FFT), la integridad del ruido de sensor (PRNU) y Error Level Analysis (ELA), para determinar si un activo digital ha sido manipulado o generado por IA.

El problema que aborda es la vulnerabilidad de los clasificadores basados en aprendizaje profundo ante generadores no vistos en entrenamiento y ante ataques adversarios. Al no depender de pesos aprendidos de un dataset estatico, el motor se presenta como zero-shot y cross-generador: no necesita haber "visto" una arquitectura concreta (difusion, GAN) para detectar sus artefactos fisicos. La model card lo orienta a periodistas, investigadores y equipos de seguridad que requieren explicabilidad en la verificacion de medios.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,0 GB y un total de 9 parametros declarados en el manifiesto de safetensors, cifra coherente con un conjunto de buffers tensoriales (kernels de convolucion espacial y umbrales de seguridad) en lugar de una red neuronal convencional. No se declaran idiomas ni datos de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor deterministico de procesado de senales y vision fisica; sin red neuronal entrenada. Componentes: analisis de decaimiento FFT, Error Level Analysis (ELA), extraccion de ruido PRNU mediante kernel laplaciano y distribucion de Z-score espacial vectorizada |
| Parametros totales | 9 (buffers tensoriales serializados, no parametros entrenables) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (procesa imagenes individuales, no secuencias de texto) |
| Tipos de cuantizacion | no aplicable (no disponible en la informacion proporcionada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; el analisis es independiente del idioma del contenido) |
| Licencia | MIT (segun la model card); el metadato de Hugging Face figura como no disponible |
| Formato de pesos | safetensors (kernels de convolucion espacial y umbrales matematicos serializados como buffers de PyTorch) |
| Pipeline declarado | feature-extraction |
| Libreria | transformers (requiere trust_remote_code=True) |

## Arquitectura y entrenamiento

El motor no sigue una arquitectura transformer, MoE, SSM ni hibrida. Se trata de un modulo deterministico escrito en Python sobre PyTorch, NumPy y OpenCV, que se registra en la API de Hugging Face como un modelo personalizado (`custom_code`) para poder cargarse con `AutoModel.from_pretrained`. Su logica interna combina tres senales: el analisis del decaimiento del espectro de frecuencia espacial mediante FFT, que mapea curvas de decaimiento no fisicas tipicas de medios generativos; Error Level Analysis, orientado a detectar recompresion y edicion localizada; y la extraccion de ruido PRNU (Photo Response Non-Uniformity), que permite localizar manipulaciones puntuales como splicing o inpainting a partir de anomalias en el patron de ruido del sensor.

No existe entrenamiento supervisado ni ajuste por RLHF o DPO. Los unicos elementos serializados son los kernels de convolucion espacial (por ejemplo, el extractor de ruido laplaciano) y los umbrales de seguridad matematicos, almacenados como buffers tensoriales en `.safetensors`. La model card describe un coeficiente de calibracion optica de 0,70 aplicado a las senales en crudo para normalizar imagenes procedentes de la web frente a los limites teoricos, ya que los Image Signal Processors de los telefonos modernos aplican un enfoque artificial que distorsiona el ruido natural. La salida es bimodal: una probabilidad derivada de la FFT y un Z-score maximo de ruido, cuya combinacion (valor `alpha` de decaimiento FFT entre 2,0 y 3,5 junto con un Z-score de ruido superior a 3,5) se propone como prueba matematica de intervencion generativa.

## Capacidades

- Deteccion de medios generativos (difusion, GAN) mediante el mapeo de curvas de decaimiento de frecuencia espacial no fisicas.
- Deteccion de manipulacion espacial localizada (splicing, inpainting) a traves de anomalias en la firma de ruido de sensor.
- Analisis zero-shot y cross-generador: no depende de ejemplos previos de una arquitectura generativa concreta.
- Salida bimodal explicable: probabilidad de amenaza, valor `alpha` de decaimiento FFT y Z-score maximo de ruido.
- Calibracion optica configurable (coeficiente 0,70) para normalizar imagenes con enfoque agresivo de ISP.
- Carga nativa mediante la API de transformers (`AutoModel` con `trust_remote_code=True`) y mapeo automatico del fichero safetensors a GPU o CPU.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, vision semantica, audio ni otras capacidades propias de modelos generativos.

## Casos de uso

- Verificacion de medios en redaccion periodistica: un equipo de fact-checking puede pasar una imagen sospechosa al motor y obtener una puntuacion de amenaza junto con los valores de FFT y Z-score, lo que permite justificar la conclusion ante el publico con una metrica reproducible en lugar de una caja negra.
- Pipelines de trust and safety: integrado como etapa de verificacion previa a la publicacion de contenido, el motor actua como filtro explicable que marca activos con firma espectral no fisica antes de que un moderador humano revise el caso.
- Peritaje forense judicial: el caracter deterministico del motor permite reproducir el mismo resultado sobre la misma evidencia en distintas ejecuciones, requisito habitual para la admisibilidad de una prueba tecnica en un procedimiento.
- Deteccion de manipulacion en reclamaciones de seguros: analisis de fotografias de siniestros digitales para localizar splicing o inpainting mediante anomalias del ruido PRNU, sin depender de un dataset de siniestros etiquetados.
- Investigacion academica en deteccion cross-generador: el motor sirve como linea base no neuronal frente a la que medir la degradacion de clasificadores CNN ante generadores no vistos, y como referencia para estudiar robustez frente a ataques adversarios.
- Moderacion de contenido generado por usuarios en plataformas de medios: clasificacion por lotes de imagenes subidas, aprovechando que el motor no requiere GPU de gran capacidad ni inferencia neuronal.
- Verificacion de integridad documental en formato digital: deteccion de retoques localizados en documentos escaneados nativamente, siempre que no hayan sufrido degradacion analogica ni recompresion por debajo de la calidad JPEG 40.
- Auditoria reproducible en CI/CD: al publicarse tambien como paquete en PyPI (`pip install phorensics`) y desplegarse con Docker, puede incorporarse como paso automatizado de validacion de activos en un flujo de integracion continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda describen la metodologia y los umbrales de decision, pero no incluyen metricas comparativas del tipo precision, recall, AUC o tasa de error sobre conjuntos de referencia como FaceForensics++, DFDC o Celeb-DF.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. El repositorio ocupa 0,0 GB y el manifiesto declara 9 tensores de buffers, por lo que el motor cabe holgadamente en memoria de cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera con soporte CUDA, incluidas RTX 3060, RTX 4070 o RTX 4090; el motor no requiere A100 ni H100. El codigo de ejemplo selecciona `cuda` si esta disponible y cae a `cpu` en caso contrario.
- Compatibilidad con GPU consumer: si, en cualquier modelo con al menos unos pocos cientos de MB de VRAM libre.
- Opciones de despliegue: `transformers` con `AutoModel` y `trust_remote_code=True`, paquete de PyPI `phorensics`, contenedor Docker y ejecucion directa desde el repositorio de GitHub. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no se trata de un modelo de lenguaje generativo.
- Latencia y throughput estimados: no disponibles. Al no haber inferencia neuronal, el coste dominante es el procesado de senales (FFT, ELA, PRNU) sobre cada imagen, pero no se publican cifras de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada modelos directamente comparables con especificaciones publicadas. A continuacion se resumen las alternativas conocidas por categoria, marcando como no disponible cualquier dato numerico que no consta en las fuentes consultadas.

| Alternativa | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PHORENSICS (este modelo) | Fisica de senales y ruido de sensor, deterministico y zero-shot | 9 buffers tensoriales | no aplicable | MIT | Hugging Face, PyPI y GitHub |
| Clasificadores CNN o ViT para deteccion de deepfakes | Aprendizaje supervisado sobre datasets etiquetados | no disponible | no aplicable | no disponible | repositorios academicos y comerciales |
| APIs comerciales de deteccion de medios sinteticos | Servicio propietario, normalmente caja negra | no disponible | no disponible | propietaria | solo como servicio |
| Motores de forense clasico de imagen (ELA, PRNU manual) | Analisis de senales con intervencion humana | no aplicable | no aplicable | variable | herramientas de escritorio |

La diferencia funcional declarada por el autor frente a los clasificadores neuronales es la ausencia de entrenamiento sobre ejemplos especificos, lo que reduce la vulnerabilidad a generadores no vistos y facilita la explicabilidad, a cambio de no ofrecer metricas de precision publicadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de precision, recall o tasa de falsos positivos en la informacion disponible, lo que impide validar su fiabilidad en produccion.
- Enfoque artificial de los ISP moviles: el procesado de nitidez de los telefonos modernos altera el ruido natural y obliga a aplicar un coeficiente de calibracion optica de 0,70 para normalizar imagenes de la web; fuera de ese rango la senal puede degradarse.
- Compresion extrema: en imagenes comprimidas por debajo de calidad JPEG 40 aparecen bloques de cuantizacion que degradan la firma PRNU y reducen ligeramente la puntuacion de confianza espacial.
- Medios con degradacion analogica: el propio autor declara fuera de alcance el analisis de fotografias escaneadas o copias de VHS de tercera generacion sin recalibrar previamente los limites del coeficiente optico.
- Uso prohibido por diseno: no esta destinado a reconocimiento facial ni a verificacion biometrica de identidad.
- Interpretacion de umbrales: la conclusion de manipulacion exige combinar el valor `alpha` de decaimiento FFT con el Z-score de ruido; una lectura aislada de cualquiera de las dos metricas puede inducir a error.
- Adopcion practica nula: el repositorio acumula 0 descargas y 0 likes, por lo que no existe evidencia de uso en produccion ni comunidad que reporte fallos.
- Riesgo de dependencia de `trust_remote_code`: la carga del modelo ejecuta la logica espacial incluida en `phorensics_model.py`, lo que obliga a auditar el codigo antes de desplegarlo en entornos sensibles.
- Discrepancia de licencia: la model card indica MIT, mientras que el metadato de Hugging Face figura como no disponible; conviene confirmar los terminos antes de un uso comercial.
- Alucinacion: no aplicable en el sentido generativo, ya que el motor no produce texto; el riesgo equivalente es el falso positivo o falso negativo derivado de umbrales mal calibrados.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anuran66/Phorensics-Engine
- Repositorio en GitHub: https://github.com/anuran44/PHORENSICS-Deepfake-Detection
- Paquete en PyPI: https://pypi.org/project/phorensics/
- Perfil de GitHub del autor: https://github.com/anuran44/anuran44
- Portfolio del autor: https://anuran44.github.io/
- Curriculum en PDF: https://anuran44.github.io/CV-anuran.pdf
