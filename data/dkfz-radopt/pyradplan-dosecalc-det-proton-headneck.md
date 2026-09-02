# DKFZ-RadOpt/pyRadPlan-dosecalc-Det-proton-headneck

## Resumen

pyRadPlan-dosecalc-Det-proton-headneck es un modelo de cálculo de dosis determinista para terapia de protones en la región de cabeza y cuello, desarrollado por el grupo Radiotherapy Optimization del Centro Alemán de Investigación del Cáncer (DKFZ). Forma parte de la colección pyRadPlan-dosecalc, que agrupa distintos modelos de cálculo de dosis y de transferencia lineal de energía (LET) con arquitecturas bayesianas y deterministas. Este modelo concreto se integra en el ecosistema pyRadPlan, un toolkit open-source de planificación de tratamiento de radioterapia diseñado para interoperar con matRad.

A diferencia de los modelos de lenguaje, este artefacto no procesa texto ni genera respuestas: su función es predecir la distribución de dosis absorbida en tejido a partir de parámetros de tratamiento, una tarea crítica en la planificación de radioterapia. Su relevancia actual radica en la creciente adopción de técnicas de aprendizaje automático para acelerar y mejorar la precisión del cálculo de dosis frente a los métodos Monte Carlo tradicionales, que son computacionalmente costosos. No se dispone de información pública sobre el tamaño del modelo, su arquitectura interna ni los datos de entrenamiento específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de cálculo de dosis, no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | bsd-3-clause |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna de este modelo concreto. La coleccion pyRadPlan-dosecalc incluye modelos con arquitecturas bayesianas y deterministas para el calculo de dosis o LET, lo que sugiere que este artefacto emplea una red neuronal determinista entrenada para predecir distribuciones de dosis de protones en la region de cabeza y cuello. El desarrollo se enmarca en pyRadPlan, un toolkit de planificacion de tratamiento de radioterapia open-source liderado por el grupo de Radiotherapy Optimization del DKFZ, que busca combinar el calculo de dosis con tecnicas de optimizacion para planificacion ionica. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO, que no son aplicables a este tipo de modelo.

## Capacidades

- Calculo de dosis absorbida para terapia de protones en cabeza y cuello.
- Prediccion de distribuciones de dosis de forma determinista (sin incertidumbre asociada, a diferencia de los modelos bayesianos de la misma coleccion).
- Integracion con el flujo de trabajo de pyRadPlan para planificacion de tratamiento.
- Posible soporte para calculo de LET (transferencia lineal de energia), segun la descripcion de la coleccion.
- No es un modelo de lenguaje: no genera texto, codigo ni respuestas conversacionales.

## Casos de uso

- Planificacion de radioterapia de protones en clinica: el modelo puede predecir la distribucion de dosis en pacientes con tumores de cabeza y cuello, permitiendo a los fisicos medicos evaluar rapidamente distintos planes de tratamiento sin recurrir a simulaciones Monte Carlo completas.
- Optimizacion de planes de tratamiento: al integrarse en pyRadPlan, el modelo puede usarse como funcion de coste en algoritmos de optimizacion para ajustar angulos de haz, pesos y energias.
- Validacion cruzada de resultados: comparar las predicciones del modelo determinista con las de modelos bayesianos de la misma coleccion para estimar la incertidumbre en regiones criticas.
- Investigacion en radioterapia adaptativa: re-calcular dosis de forma rapida durante el tratamiento cuando la anatomia del paciente cambia, facilitando la adaptacion del plan.
- Docencia y formacion: servir como herramienta didactica en cursos de fisica medica para ilustrar la diferencia entre metodos de calculo de dosis.
- Desarrollo de nuevos algoritmos de planificacion: servir como componente de referencia en estudios que comparen metodos de IA frente a tecnicas clasicas de calculo de dosis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos publicos sobre la precision dosimetrica del modelo frente a metodos de referencia como Monte Carlo o mediciones en fantoma.

## Requisitos de hardware

No disponible. No se ha publicado informacion sobre requisitos de VRAM, GPUs recomendadas, opciones de despliegue ni latencia. Al tratarse de un modelo de calculo de dosis, es probable que requiera una GPU con suficiente memoria para procesar volumenes tomograficos, pero no hay datos confirmados.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables publicamente documentados con los que contrastar este artefacto. La coleccion pyRadPlan-dosecalc incluye variantes bayesianas y deterministas, pero no se dispone de una comparativa cuantitativa entre ellas.

## Limitaciones y advertencias

- Es un modelo especializado en fisica medica, no un modelo de lenguaje: no puede utilizarse para tareas de generacion de texto, codigo o razonamiento general.
- No se ha publicado informacion sobre la validacion clinica del modelo ni sobre su precision dosimetrica en casos reales.
- La licencia bsd-3-clause permite uso comercial y modificacion, pero el usuario debe verificar la idoneidad del modelo para su caso de uso especifico.
- No se conocen los datos de entrenamiento ni su procedencia, por lo que no es posible evaluar sesgos o limitaciones en poblaciones de pacientes especificas.
- El modelo esta orientado a la region de cabeza y cuello; su aplicacion a otras localizaciones anatomicas requeriria reentrenamiento o validacion adicional.
- No se garantiza la exactitud de las predicciones para uso clinico sin una validacion independiente por parte del centro sanitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DKFZ-RadOpt/pyRadPlan-dosecalc-Det-proton-headneck
- Coleccion pyRadPlan-dosecalc: https://huggingface.co/collections/DKFZ-RadOpt/pyradplan-dosecalc
- Perfil del autor DKFZ-RadOpt: https://huggingface.co/DKFZ-RadOpt
- Repositorio GitHub de pyRadPlan: https://github.com/e0404/pyRadPlan
- Documentacion de pyRadPlan: https://pyradplan.readthedocs.io/en/latest/
- Grupo de Radiotherapy Optimization en DKFZ: https://www.dkfz.de/en/medical-physics-in-radiation-oncology/radiotherapy-optimization
