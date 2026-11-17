# Aellaecieee/biosentry-tier-b-baseline

## Resumen

BioSentry Tier B baseline (k, p) es un artefacto de investigación publicado en Hugging Face por el usuario Aellaecieee en el marco del proyecto BioSentry, una lista de vigilancia clínica basada en NEWS2 desarrollada para la Huawei ICT Competition. A pesar de su identificador y de su empaquetado como modelo, no contiene ninguna red neuronal ni pesos entrenados: el repositorio aloja un fichero `params.json` con dos valores numéricos (k = 4.0 y p = 8) que parametrizan una regla de tendencia basada en mediana y MAD (median absolute deviation) para detectar pacientes que se desvían de su propia línea base fisiológica. Estos dos números se seleccionaron mediante un barrido de rejilla sobre las semillas 1 a 10 del simulador de planta hospitalaria del propio proyecto (ward-v2).

La relevancia del artefacto es metodológica más que de rendimiento: sirve como segunda señal complementaria junto al score NEWS2 en un panel simulado, y ejemplifica un patrón de publicación reproducible de hiperparámetros de reglas simples junto al código que las implementa. No debe confundirse con un modelo de lenguaje ni con un sistema de predicción clínica validado: la propia model card declara explícitamente que se trata de una demo de investigación con datos sintéticos, no validada en pacientes reales y no apta para uso clínico.

El repositorio se distribuye bajo licencia Apache-2.0 sobre los ficheros que contiene, mientras que el score NEWS2 permanece como regla en el código del panel (Tier A no se modifica ni se aprende). El proyecto no ha registrado descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regla estadística de tendencia (mediana/MAD); no es una red neuronal |
| Parametros totales | 2 valores escalares (k = 4.0, p = 8) en `params.json` |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantizacion | No disponible (no aplica; los parámetros son números en coma flotante) |
| Idiomas soportados | No disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | JSON (`params.json`); la lógica de la regla reside en el repositorio del panel |

## Arquitectura y entrenamiento

No existe arquitectura neuronal. El artefacto es una parametrización de una regla de detección de deriva: se calcula la mediana y la desviación absoluta mediana (MAD) de las observaciones previas del paciente y se marca una desviación cuando la señal se aleja de su línea base según los umbrales k y p. El valor k = 4.0 actúa como multiplicador del MAD y p = 8 como parámetro adicional de la regla; ambos se eligieron por barrido de rejilla sobre las semillas 1 a 10 del simulador ward-v2 del proyecto.

No hubo entrenamiento en el sentido habitual: no se optimizaron pesos ni se aplicó RLHF, DPO ni ajuste supervisado. Los datos de referencia son enteramente sintéticos, generados por el simulador de planta del propio proyecto, y no se utilizó ningún dato de pacientes reales para entrenar ni para seleccionar el modelo. La model card advierte de que los resultados son circulares por construcción: el método se evalúa sobre el mismo simulador con el que se eligió, de modo que demuestra funcionamiento en datos simulados, no en una planta hospitalaria. Los resultados de held-out se puntuaron una sola vez por procedimiento, pero el código no impone esa restricción.

## Capacidades

- Detección de deriva fisiológica respecto a la línea base individual de un paciente simulado, mediante regla de mediana/MAD.
- Generación de una señal complementaria que se muestra junto al score NEWS2 en el panel de vigilancia.
- Parametrización reproducible: los dos hiperparámetros quedan versionados en un fichero JSON descargable.
- Carga programática sencilla mediante `huggingface_hub` y `json` (sin dependencias de runtime de deep learning).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generación de texto.
- No dispone de capacidades multilingües, de visión, de audio ni de modo de razonamiento.
- No sustituye ni modifica el score NEWS2 (Tier A permanece intacto por diseño).

## Casos de uso

- Investigación sobre reglas de alerta temprana: el artefacto permite reproducir el barrido de hiperparámetros k y p sobre el simulador ward-v2 y comparar la señal de tendencia frente a NEWS2 en un entorno controlado.
- Docencia y demostración de metodología: sirve para ilustrar el patrón de publicar hiperparámetros de una regla junto al código que los consume, con trazabilidad de la selección mediante semillas.
- Baseline en experimentos de simulación: al ser una regla determinista y de coste computacional nulo, puede usarse como referencia inferior contra la que medir modelos aprendidos en el mismo simulador.
- Integración en paneles de investigación: el JSON se carga con dos líneas de Python y puede insertarse en un pipeline de evaluación del repositorio del panel sin infraestructura de GPU.
- Auditoría de circularidad metodológica: el caso de uso incluye estudiar los sesgos de evaluar sobre el mismo simulador de selección, tal como advierte la model card.
- Pruebas de integración del panel BioSentry: verificar que la capa de visualización consume correctamente los parámetros y muestra la señal de tendencia junto a NEWS2.
- Réplica de resultados: al fijar k = 4.0 y p = 8 y las semillas 1 a 10, un tercero puede repetir el barrido y comprobar la selección declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (sensibilidad, especificidad, AUROC ni tasas de falsa alarma) y advierte de que algunos resultados presentan efectos pequeños y carecen de barras de error. Cualquier cifra de rendimiento debe consultarse en la tarjeta completa del repositorio (`models/<tier>/<name>/card.md`), no disponible en la información proporcionada.

## Requisitos de hardware

- VRAM para inferencia: 0 GB; el artefacto es un fichero JSON de dos escalares y no requiere acelerador.
- GPU recomendadas: ninguna; la regla se ejecuta en CPU con operaciones de mediana y MAD sobre series temporales.
- Cabe en cualquier GPU de consumo y en entornos sin GPU (portátiles, contenedores ligeros, CI).
- Opciones de despliegue: carga directa con `huggingface_hub` + `json`; la lógica de la regla se ejecuta desde el repositorio del panel BioSentry, no desde este repositorio.
- Latencia y throughput: no disponibles; dependen de la implementación de la regla en el panel y del volumen de series fisiológicas simuladas, no del artefacto en sí.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioSentry Tier B baseline (k, p) | Regla mediana/MAD parametrizada | 2 escalares | No aplica | Apache-2.0 | Hugging Face (0 descargas) |
| News2 (score clínico) | Regla clínica agregada | No aplica | No aplica | Regla clínica pública; implementación en el repo del panel | Código en el repositorio del proyecto |
| Modelos de predicción de deterioro con datos reales (p. ej. entrenados sobre MIMIC-IV) | Aprendizaje supervisado sobre EHR | Variable | Variable | Variable según publicación | No disponible en la información proporcionada |

La comparación directa con modelos aprendidos no es significativa: este artefacto no aprende de datos y su evaluación es sobre simulador propio. No se dispone de datos comparativos de rendimiento frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo clínico: datos exclusivamente sintéticos, sin validación en pacientes reales y declarado explícitamente como no apto para uso clínico.
- Resultados circulares: selección y evaluación se realizan sobre el mismo simulador ward-v2, por lo que el rendimiento observado no se extrapola a una planta hospitalaria.
- El código no impone la evaluación held-out de una sola vez que declara el procedimiento; la disciplina debe aplicarse manualmente.
- Ausencia de barras de error en algunas cifras y efectos pequeños, lo que limita la robustez estadística de las conclusiones.
- No sustituye a NEWS2: Tier A no se modifica ni se aprende; cualquier decisión clínica recae en un profesional sanitario.
- Riesgo de interpretación errónea: el identificador y el empaquetado como modelo en Hugging Face pueden inducir a pensar que se trata de una red neuronal entrenada, cuando es una parametrización de regla.
- Licencia Apache-2.0 aplicable a los ficheros del repositorio; el uso del código del panel y del score NEWS2 se rige por lo indicado en el repositorio del proyecto.
- Sin datos de sesgo demográfico ni de equidad, dado que no hay datos reales ni poblaciones representadas.

## Enlaces

- Hugging Face: https://huggingface.co/Aellaecieee/biosentry-tier-b-baseline
- Repositorio del panel y código del proyecto BioSentry: https://github.com/kitchen-station/BioSentry-Intelligence
- Tarjeta completa del modelo en el repositorio: `models/<tier>/<name>/card.md` (ruta indicada en la model card; no se ofrece URL directa)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
