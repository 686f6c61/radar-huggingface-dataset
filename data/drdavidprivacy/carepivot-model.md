# drdavidprivacy/carepivot-model

## Resumen

CarePivot v2 es un modelo de clasificación tabular basado en regresión logística, publicado por el usuario `drdavidprivacy` en HuggingFace bajo el identificador `carepivot-model`. No es un modelo de lenguaje ni una red neuronal profunda: es un clasificador `scikit-learn` que ordena pacientes diabéticos hospitalizados en el momento del alta según el riesgo de reingreso a treinta días, para que un equipo de atención transicional pueda decidir a quién inscribir en su programa. El modelo se presenta como artefacto educativo dentro de un "AI Governance Practicum" (Track 1), con una organización, un sistema y unos responsables ficticios (Alderwyn Health, CarePivot, Gabriel Ortiz como AI Governance Lead) construidos sobre datos públicos.

La relevancia del artefacto no está en su rendimiento predictivo, sino en el paquete de gobernanza que lo acompaña: una model card extensa y ejemplar, un mecanismo de mitigación de sesgo mediante `CorrelationRemover` de Fairlearn, una separación explícita entre el modelo que puntúa y el equipo humano que decide, y una puerta de uso ("use gate") cerrada hasta que se completen varias comprobaciones independientes. Es, por tanto, un caso de estudio de documentación y control de riesgos en IA sanitaria más que un modelo listo para producción.

Técnicamente, v2 es una regresión logística con regularización C = 0.1, pesos de clase balanceados, entradas escaladas y 138 columnas tras eliminar raza registrada, banda de edad y código de pagador. Se sirve con `scikit-learn 1.9.1` y `fairlearn 0.15.0`, y por diseño no carga en otras versiones de `scikit-learn`. El repositorio es de 0.0 GB y el artefacto principal pesa 50.538 bytes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística (scikit-learn), clasificación tabular binaria |
| Parámetros totales | No disponible (coeficientes por columna; 138 columnas en v2, más intercepto) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantización | No aplica; serialización en pickle (`carepivot_v2.pkl`) |
| Idiomas soportados | No disponible (no procesa texto libre; opera sobre variables tabulares) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Pickle de scikit-learn (`carepivot_v2.pkl`), más CSV legible (`carepivot_v2_Inside.csv`) |
| Librería | scikit-learn 1.9.1 (no carga en otras versiones, por diseño) |
| Dependencia de equidad | fairlearn 0.15.0 |
| Tamaño del artefacto | 50.538 bytes (SHA-256 `9d698f019e30e825444fae0e676f58d98e00d1b436a9dab8e21eb040f813bdbd`) |
| Pipeline | tabular-classification |
| Dataset de entrenamiento | `drdavidprivacy/carepivot-data` |
| Versión anterior | `carepivot_v1.pkl`, 7.904 bytes (SHA-256 `b54193b8157d3aa4548bdf94d2a922f01061540fa2ef0acf568c79da7f790bd2`) |

## Arquitectura y entrenamiento

El modelo es una regresión logística clásica, no un transformer ni un modelo de mezcla de expertos. La configuración fija documentada incluye regularización C = 0.1, pesos de clase balanceados, entradas escaladas y la variante sin la variable de disposición al alta. v1 se ajustó sobre 41 entradas codificadas en 148 columnas; v2 se ajustó sobre 138 columnas tras eliminar raza registrada, banda de edad y código de pagador.

El pipeline de preprocesado que producción debe reproducir incluye los niveles de one-hot encoding fijados sobre las filas de entrenamiento, el escalador y, para v2, el `CorrelationRemover` de Fairlearn ajustado sobre las filas de entrenamiento contra raza registrada, banda de edad y código de pagador (33 columnas codificadas de 171). Este removedor sustrae de cada una de las demás entradas la parte que covaría con esas tres variables y después las elimina, de modo que v2 nunca ve raza, edad ni código de pagador. No se imputa ningún hueco numérico porque el fichero no los tiene. El entrenamiento se realizó sobre el fichero de trabajo remediado del dataset `drdavidprivacy/carepivot-data`, que enlaza a su vez con `drdavidprivacy/practicum-case-packs`. No se documenta en la información disponible el número de tokens, la composición del dataset ni si hubo optimización por preferencias, algo que no aplica a este tipo de modelo.

## Capacidades

- Clasificación tabular binaria: estima el riesgo de reingreso hospitalario a treinta días para pacientes diabéticos dados de alta.
- Ordenación de una lista de trabajo ("ranked worklist") por riesgo, para que el equipo de atención transicional priorice la inscripción.
- Mitigación de sesgo integrada en el pipeline mediante `CorrelationRemover` de Fairlearn sobre tres atributos protegidos.
- Trazabilidad de coeficientes: el fichero `carepivot_v2_Inside.csv` expone cada columna ajustada con su peso y el intercepto en formato legible.
- Integridad verificable mediante hashes SHA-256 de los artefactos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo tabular puro.
- No tiene capacidades multilingües en el sentido habitual; opera sobre variables codificadas, no sobre lenguaje natural.

## Casos de uso

- Priorización de inscripción en atención transicional: el modelo ordena a los pacientes diabéticos al alta por riesgo de reingreso y el equipo de enfermería y agentes comunitarios decide a quién inscribir, con autoridad plena para apartarse de la lista. Es adecuado porque la capacidad del programa cubre en torno al 15 % de las altas y el modelo sustituye una regla basada en duración de estancia.
- Auditoría de equidad en un programa sanitario: el uso de `CorrelationRemover` y la documentación de las 33 columnas eliminadas permiten reproducir y auditar el efecto de la mitigación sobre subgrupos.
- Formación en gobernanza de IA: el repositorio funciona como plantilla para que estudiantes del practicum redacten su propia model card, con un ejemplar resuelto ("answer key") y un PDF de referencia.
- Revisión independiente de sesgo antes de habilitar un uso: la "use gate" exige ejecutar la lista de vigilancia por paciente en el punto de corte por grupo, contar los desplazados, comprobar el tripwire de tasa de fallos por raza y el de utilización como acceso, y pasar la comprobación de muerte y hospice.
- Control de versiones de modelos clínicos: la comparación explícita entre v1 y v2, con hashes y diferencias de columnas, sirve como ejemplo de trazabilidad de cambios en un sistema sanitario.
- Docencia sobre límites de uso: las secciones de "out of scope" documentan que la puntuación nunca influye en el momento del alta, la gestión de camas, el tratamiento ni la facturación, lo que constituye un caso práctico de definición de fronteras de un sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; es una regresión logística serializada en pickle de 50.538 bytes, ejecutable en CPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier equipo consumer: el artefacto es de decenas de kilobytes y el coste de inferencia es despreciable.
- Opciones de despliegue: carga directa con `scikit-learn 1.9.1` (versión obligatoria, el modelo no carga en otras), con `fairlearn 0.15.0` disponible para el pipeline de mitigación; el autor lo sirve mediante el Space `drdavidprivacy/carepivot`.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo, la latencia por fila es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CarePivot v2 | Regresión logística (scikit-learn) | No aplica | CC-BY-4.0 | HuggingFace (`drdavidprivacy/carepivot-model`) | Artefacto educativo con model card de gobernanza |
| CarePivot v1 | Regresión logística (scikit-learn) | No aplica | No disponible | Referenciado en la model card (hash documentado) | 148 columnas, incluye raza, edad y pagador; champion previo |
| Alternativas de clasificación tabular sanitaria | No disponible | No disponible | No disponible | No disponible | No se identifican modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El propio autor declara que la organización, el sistema y las personas son ficticios y que el uso es exclusivamente educativo ("Educational use only, not for real decisions").
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de extrapolación indebida si se usa el modelo fuera del contexto de reingreso a treinta días en pacientes diabéticos.
- El modelo está atado a `scikit-learn 1.9.1` por diseño; actualizar la librería rompe la carga del pickle y, con ello, la reproducibilidad.
- La mitigación elimina raza, edad y código de pagador, pero no garantiza la ausencia de sesgo por variables correlacionadas no eliminadas; la model card exige comprobaciones adicionales (tripwires de tasa de fallos por raza y de utilización como acceso) antes de habilitar el uso.
- La puerta de uso está cerrada: no debe emplearse para decidir inscripciones reales hasta que la revisión independiente complete las comprobaciones documentadas.
- El modelo no debe influir en el momento del alta, la gestión de camas, el tratamiento ni la facturación, ni provocar que ningún paciente pierda atención.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el carácter educativo y ficticio del artefacto desaconseja cualquier despliegue clínico real.
- No se documentan idiomas soportados ni sesgos conocidos más allá de los atributos protegidos tratados; la información sobre subgrupos y condiciones de prueba está truncada en la model card disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drdavidprivacy/carepivot-model
- Dataset de entrenamiento: https://huggingface.co/datasets/drdavidprivacy/carepivot-data
- Case packs del practicum: https://huggingface.co/datasets/drdavidprivacy/practicum-case-packs
- Space de servicio: https://huggingface.co/spaces/drdavidprivacy/carepivot
