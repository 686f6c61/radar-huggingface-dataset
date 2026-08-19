# pyaging/wu

## Resumen

El modelo `pyaging/wu` es un reloj epigenético de envejecimiento desarrollado por Wu et al. en 2019, diseñado específicamente para predecir la edad cronológica en niños a partir de perfiles de metilación de ADN en sangre total. Se trata de un modelo de regresión basado en *sure independence screening* seguido de *elastic net*, que selecciona 111 sitios CpG como predictores. La librería `pyaging` lo integra y convierte la salida original en unidades de meses a años, facilitando su uso en análisis de envejecimiento biológico pediátrico.

Este modelo es relevante porque aborda una población poco cubierta por los relojes epigenéticos clásicos (como Horvath o Hannum), que suelen estar entrenados en adultos. Su simplicidad computacional lo hace accesible para estudios con recursos limitados, y su publicación en 2019 lo sitúa como una referencia en el campo de la epigenética del desarrollo. No es un modelo de lenguaje ni de visión, sino una herramienta estadística para investigación biológica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Screened elastic net regression (selección de características + regresión lineal regularizada) |
| Parametros totales | 111 CpG (coeficientes de regresión, no es una red neuronal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (integrado en la librería `pyaging`, probablemente coeficientes en formato interno) |

## Arquitectura y entrenamiento

El modelo emplea una estrategia de dos etapas: primero, un *sure independence screening* (SIS) reduce el espacio de características de miles de CpG a un subconjunto relevante; después, se aplica una regresión *elastic net* sobre esos CpG seleccionados para obtener un predictor lineal de la edad. Este enfoque combina selección de variables con regularización L1/L2, lo que permite manejar alta dimensionalidad y correlación entre sitios. El entrenamiento se realizó con datos de metilación de sangre total de niños, y la salida original se expresa en meses, que `pyaging` convierte a años. No se han publicado detalles adicionales sobre el tamaño exacto del dataset de entrenamiento ni sobre el proceso de validación en la información disponible.

## Capacidades

- Predicción de edad cronológica en niños a partir de metilación de ADN en sangre total.
- Utiliza 111 sitios CpG específicos, lo que lo hace ligero y rápido de ejecutar.
- Integración directa con la librería `pyaging` mediante la función `pya.pred.predict_age`.
- Orientado a investigación biológica y estudios de envejecimiento pediátrico.
- No soporta generación de texto, código, visión ni tool calling (no es un modelo generativo).

## Casos de uso

- Estudios de envejecimiento biológico en cohortes pediátricas: permite estimar la edad epigenética en niños y compararla con la edad cronológica para detectar aceleración o deceleración del envejecimiento.
- Evaluación de intervenciones tempranas: se puede usar para medir el impacto de factores ambientales, nutricionales o clínicos en el ritmo de envejecimiento de poblaciones infantiles.
- Validación de biomarcadores epigenéticos: sirve como referencia para comparar nuevos relojes o paneles de CpG en el contexto pediátrico.
- Análisis de datos de metilación en biobancos: al ser un modelo ligero, puede aplicarse a grandes conjuntos de muestras sin requerir hardware especializado.
- Investigación sobre programación temprana de la salud: ayuda a explorar cómo las condiciones perinatales influyen en la edad epigenética durante la infancia.
- Docencia y formación en epigenética computacional: como ejemplo práctico de un reloj epigenético simple y reproducible con código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (como error absoluto medio o correlación) ni comparaciones con otros relojes.

## Requisitos de hardware

- El modelo es extremadamente ligero: solo requiere almacenar 111 coeficientes y realizar una operación lineal.
- No necesita GPU. Puede ejecutarse en cualquier CPU moderna con Python y la librería `pyaging` instalada.
- La memoria RAM necesaria es mínima (menos de 1 MB para los pesos).
- El despliegue se realiza localmente mediante `pyaging`; no se requieren servidores de inferencia como vLLM u Ollama.
- La latencia es del orden de milisegundos por muestra, dependiendo del tamaño del dataset de entrada.

## Comparativa con modelos similares

Existen otros relojes epigenéticos como el de Horvath (353 CpG, multi-tejido) o el de Hannum (71 CpG, sangre adulta), pero no se dispone de una comparación cuantitativa directa con `wu` en la información proporcionada. La principal diferencia es que `wu` está específicamente entrenado para niños, mientras que los otros se centran en adultos o en múltiples tejidos. No se incluyen tablas comparativas por falta de datos.

## Limitaciones y advertencias

- Específico para sangre total y para población infantil; su uso en otros tejidos o en adultos puede producir predicciones poco fiables.
- No se han documentado sesgos poblacionales o étnicos, pero al ser un modelo entrenado con una cohorte concreta, podría no generalizar a todas las poblaciones.
- Riesgo de alucinación no aplica (no es generativo), pero sí existe riesgo de error sistemático si los datos de metilación de entrada no siguen el mismo preprocesamiento que el utilizado en el entrenamiento.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda citar el trabajo original (Wu et al., 2019) en publicaciones.
- No hay información sobre la estabilidad temporal del modelo ni sobre su rendimiento en datos longitudinales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/wu
- Publicación original: Wu, X., et al. "DNA methylation profile is a quantitative measure of biological aging in children." Aging 11(22): 10031–10051 (2019). DOI: https://doi.org/10.18632/aging.102399
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
