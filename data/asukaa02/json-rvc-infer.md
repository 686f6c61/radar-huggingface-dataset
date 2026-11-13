# Asukaa02/Json-RVC-Infer

## Resumen

Json-RVC-Infer es un repositorio de inferencia para Retrieval-based Voice Conversion (RVC), un sistema de conversion de voz (voice conversion) que transforma la identidad vocal de un audio de entrada manteniendo el contenido linguistico. Lo publica el usuario Asukaa02 en Hugging Face y no constituye un modelo de lenguaje ni una red neuronal entrenada desde cero, sino un wrapper de inferencia que orquesta modelos preentrenados de RVC mediante ficheros de configuracion JSON. Su proposito es facilitar la seleccion, descarga y carga automatica de modelos de voz RVC en entornos como Google Colab.

El proyecto se apoya en el repositorio original RVC-Project/Retrieval-based-Voice-Conversion-WebUI y en modelos auxiliares como HuBERT (hubert_base.pt) para la extraccion de caracteristicas y RMVPE (rmvpe.pt) para la estimacion de pitch. Soporta modelos RVC de version 1 y 2, descarga de audio desde YouTube, separacion de voces (voice splitter), entrada por microfono y sintesis texto-a-voz (TTS).

La relevancia de esta ficha es limitada en el contexto de evaluacion de modelos de IA generativa: se trata de una utilidad de inferencia sin pesos propios publicados, sin licencia declarada y sin benchmarks. Se documenta aqui por rigor, indicando explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (wrapper de inferencia sobre modelos RVC V1/V2; usa HuBERT y RMVPE como componentes auxiliares) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible para el wrapper; los modelos RVC descargables usan el formato propio de RVC (.pth) y los auxiliares hubert_base.pt y rmvpe.pt |

## Arquitectura y entrenamiento

Json-RVC-Infer no entrena ningun modelo: es una capa de orquestacion en Python que gestiona la descarga y carga de modelos RVC a partir de un fichero JSON de configuracion. La inferencia real la realizan los modelos RVC del proyecto original, que combinan un extractor de caracteristicas HuBERT para representaciones linguisticas y un estimador de pitch RMVPE (opcional) para preservar la entonacion. El wrapper no aporta innovaciones de arquitectura; su valor esta en la automatizacion del flujo (descarga de modelos, separacion de fuentes, entrada por microfono y TTS).

No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset, ni procesos de RLHF/DPO, ya que el autor no publica pesos ni detalles de entrenamiento propios. Toda la capacidad de conversion de voz proviene de los modelos RVC de terceros referenciados.

## Capacidades

- Conversion de voz (voice conversion): transforma la identidad vocal de un audio manteniendo el contenido.
- Soporte de modelos RVC version 1 y version 2.
- Descarga automatica de modelos de voz mediante fichero JSON (requiere conexion a internet).
- Descarga de audio desde YouTube como fuente de entrada.
- Separacion de voces (voice splitter) para aislar la pista vocal (requiere descarga del modelo separador).
- Entrada por microfono para conversion en tiempo real o cuasi-real.
- Soporte de TTS (texto a voz) para generar audio de entrada.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Clonacion de voz para doblaje: cargar un modelo RVC V2 via JSON y convertir la pista vocal de un video para sustituir la voz original por otra identidad, usando el voice splitter para aislar la voz del fondo musical.
- Prototipado en Google Colab: el autor indica explicitamente que el mejor caso de uso es Colab, donde el wrapper descarga y monta los modelos automaticamente sin configuracion manual.
- Generacion de voces para TTS: combinar el soporte TTS con un modelo RVC para producir locuciones sinteticas con una identidad vocal concreta.
- Conversion en directo desde microfono: usar la entrada de microfono para modificar la voz en tiempo (cuasi) real, util en streaming o pruebas de personificacion.
- Creacion de contenido para YouTube: descargar audio de un video, separar la voz y aplicar conversion para generar contenido con una voz consistente.
- Investigacion en voz: servir de entorno reproducible para comparar modelos RVC V1 y V2 sobre el mismo pipeline de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al depender de los modelos RVC y de HuBERT/RMVPE, el consumo real depende de los pesos cargados, que no se especifican.
- GPU recomendadas: no disponible. El autor documenta instalacion de PyTorch con CUDA 12.1 y menciona que flash-attention v2 no es compatible con Windows.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el entorno objetivo declarado es Google Colab.
- Opciones de despliegue: ejecucion directa mediante `python infer.py` (Linux/macOS) o `run.bat` (Windows). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.
- Dependencias: PyTorch, `requirements.txt`, ffmpeg, hubert_base.pt y opcionalmente rmvpe.pt.

## Comparativa con modelos similares

| Proyecto | Tipo | Modelos V1/V2 | Descarga via JSON | TTS | Microfono | Licencia |
|---|---|---|---|---|---|---|
| Json-RVC-Infer | Wrapper de inferencia RVC | Si | Si | Si | Si | no disponible |
| RVC-Project/Retrieval-based-Voice-Conversion-WebUI | Framework original RVC | Si | No documentado | No documentado | No documentado | no disponible en esta ficha |
| Modelos RVC individuales en Hugging Face | Pesos de voz concretos | Segun modelo | No aplica | No aplica | No aplica | Variable por autor |

La comparativa se limita al ecosistema RVC porque no se dispone de datos de rendimiento ni de parametros para contrastar con alternativas de voice conversion de otros proyectos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling. No debe evaluarse como LLM.
- No se publican pesos propios: el repositorio es un wrapper; la calidad depende de los modelos RVC de terceros que se carguen.
- Licencia no declarada: no hay informacion sobre permisos de uso comercial. Verificar la licencia del repositorio original RVC antes de cualquier uso en produccion.
- Riesgo de uso indebido: la clonacion de voz sin consentimiento puede vulnerar derechos de imagen y voz, y la legislacion aplicable (por ejemplo, normativa europea sobre IA y proteccion de datos).
- Dependencia de internet: la descarga de modelos de voz y del separador requiere conexion.
- Dependencia de componentes externos (HuBERT, RMVPE, ffmpeg) cuya disponibilidad y versionado pueden romper el pipeline.
- Sin benchmarks ni metricas de calidad objetiva publicadas.
- Sin informacion sobre sesgos, idiomas soportados ni robustez ante ruido o acentos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Asukaa02/Json-RVC-Infer
- Repositorio original RVC: https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI
- Modelo HuBERT (hubert_base.pt): https://huggingface.co/lj1995/VoiceConversionWebUI/blob/main/hubert_base.pt
- Modelo RMVPE (rmvpe.pt): https://huggingface.co/lj1995/VoiceConversionWebUI/blob/main/rmvpe.pt
- ffmpeg: https://ffmpeg.org/
- Issue de flash-attention en Windows: https://github.com/Dao-AILab/flash-attention/issues/345#issuecomment-1747473481
