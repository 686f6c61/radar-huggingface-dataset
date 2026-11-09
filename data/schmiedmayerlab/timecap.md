# SchmiedmayerLab/TimeCap

## Resumen

TimeCap es un pipeline de codigo abierto desarrollado por SchmiedmayerLab que transforma grabaciones de sensores multicanal en bruto (wearables de salud) en descripciones textuales ("captions") listas para ser consumidas por modelos de lenguaje. El repositorio de Hugging Face asociado ocupa 1.0 GB y contiene los artefactos del proyecto, aunque no se especifica que tipo de pesos o ficheros incluye. La implementacion de referencia se centra en el dataset MyHeartCounts (MHC) con resoluciones diaria y semanal.

A diferencia de aproximaciones que emplean un modelo de lenguaje generativo para producir las descripciones, TimeCap sustituye esa generacion por extractores deterministas que operan directamente sobre la senal. Ademas, expone una abstraccion de esquema de canales que permite aplicar el pipeline a cualquier serie temporal multivariante simplemente definiendo canales, sin redisenar el sistema. Esto lo hace relevante para investigacion en salud digital, monitorizacion con wearables y generacion de datasets textuales a partir de senales fisiologicas.

La ficha se basa exclusivamente en la informacion publica disponible del repositorio de Hugging Face, el repositorio de GitHub y el articulo en arXiv. No hay datos publicados sobre parametros, arquitectura de red neuronal ni benchmarks del modelo, ya que TimeCap es fundamentalmente un pipeline de procesamiento y no un modelo de lenguaje entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline de extraccion determinista, no red neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 1.0 GB, contenido no especificado) |

## Arquitectura y entrenamiento

TimeCap no es un modelo de lenguaje ni una red neuronal entrenada, sino un pipeline de procesamiento de senales. Su diseno sustituye la generacion mediante modelos de lenguaje por extractores deterministas que operan directamente sobre la senal de entrada, lo que elimina la variabilidad y las alucinaciones propias de un LLM al describir datos fisiologicos. La innovacion principal es la abstraccion de esquema de canales: el pipeline se define mediante canales, de modo que admite cualquier serie temporal multivariante sin necesidad de redisenar el flujo de trabajo.

La implementacion de referencia se aplica al dataset MyHeartCounts (MHC) con resolucion diaria y semanal, generando captions a partir de grabaciones multicanal de wearables. No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset, ni tecnicas de RLHF o DPO, ya que no hay un proceso de entrenamiento de modelo subyacente descrito en la informacion proporcionada.

## Capacidades

- Transformacion de grabaciones de sensores multicanal en captions textuales listas para modelos de lenguaje.
- Extractores deterministas sobre la senal, sin generacion por modelo de lenguaje.
- Abstraccion de esquema de canales para adaptar el pipeline a distintas fuentes de series temporales multivariantes.
- Procesamiento a resolucion diaria y semanal en la implementacion de referencia (dataset MyHeartCounts).
- Aplicabilidad dataset-agnostica mediante definicion de canales.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento.

## Casos de uso

- Investigacion en salud digital: convertir registros de wearables (frecuencia cardiaca, pasos, sueno) en captions textuales que alimenten analisis con modelos de lenguaje o sistemas de recuperacion de informacion.
- Generacion de datasets textuales para NLP clinico: producir descripciones estructuradas de series temporales fisiologicas para entrenar o evaluar modelos en tareas de salud.
- Monitorizacion remota de pacientes: transformar datos continuos de sensores en resumenes diarios o semanales interpretables por personal clinico o sistemas automatizados.
- Estandarizacion de datos heterogeneos: usar la abstraccion de esquema de canales para homogeneizar fuentes de sensores distintas bajo un mismo formato de caption.
- Reproducibilidad en estudios con wearables: emplear extractores deterministas para garantizar que las descripciones derivadas de la senal sean consistentes y auditables.
- Integracion en pipelines de analitica de series temporales: insertar TimeCap como etapa de conversion de senal a texto antes de etapas de modelado con LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos de VRAM, GPU recomendadas ni latencia, ya que TimeCap no es un modelo de inferencia neuronal.
- Al tratarse de un pipeline de extraccion determinista, los requisitos dependen del volumen de datos y del hardware de procesamiento general (CPU/GPU para calculo de senales), no de pesos de modelo.
- Opciones de despliegue: no disponibles en la informacion proporcionada.
- El repositorio de Hugging Face ocupa 1.0 GB, sin detalle del contenido ni de sus requisitos de ejecucion.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre alternativas comparables en la misma categoria (pipelines de captioning de series temporales de salud) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No hay informacion sobre licencia, lo que impide determinar si su uso comercial esta permitido.
- No se especifican los idiomas soportados por los captions generados.
- Al ser un pipeline determinista, la calidad de las captions depende de la definicion de canales y de los extractores, no de un modelo generativo adaptable.
- La implementacion de referencia esta centrada en el dataset MyHeartCounts, por lo que su aplicacion a otros dominios requiere definir esquemas de canales especificos.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto, dado que no hay un modelo de lenguaje subyacente.
- El repositorio tiene 0 descargas y 1 like, lo que indica un proyecto en fase temprana o poco difundido.
- No se dispone de informacion sobre mantenimiento, versionado ni soporte del proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/SchmiedmayerLab/TimeCap
- GitHub: https://github.com/SchmiedmayerLab/TimeCAP
- Paper (arXiv): https://arxiv.org/pdf/2610.21274
