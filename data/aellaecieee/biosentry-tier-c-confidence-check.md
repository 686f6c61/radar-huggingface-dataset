# Aellaecieee/biosentry-tier-c-confidence-check

## Resumen

BioSentry Tier C confidence check es un artefacto de calibración publicado por el usuario Aellaecieee dentro del proyecto BioSentry, un sistema de alerta temprana hospitalaria basado en la escala NEWS2 desarrollado para la Huawei ICT Competition. No se trata de un modelo neuronal: el repositorio contiene un fichero `calibration.json` con un cuantil de puntuaciones obtenidas en ensayos de simulador, de modo que cuando la puntuación del "estudiante" cae por debajo de ese umbral el sistema se abstiene de alertar. Existe una variante sin temperatura (`calibration_no_temp.json`) y ficheros con el resultado del conjunto de validación (`heldout.txt`, `heldout.json`).

El objetivo declarado es demostrar el principio de "cuando el sistema no está seguro, se calla", aplicando calibración conforme a un objetivo de error del 0,01. El modelo se entrena y evalúa exclusivamente con datos sintéticos generados por el simulador del propio proyecto (semillas 301-340 para entrenamiento y 11-30 para validación), sin datos de pacientes reales.

Su relevancia es fundamentalmente metodológica y educativa: ilustra cómo añadir una capa de abstención calibrada sobre una regla clínica existente (NEWS2) sin sustituirla. El autor advierte explícitamente de que todos los resultados son circulares, no está validado en pacientes reales y no debe usarse en decisiones clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal; fichero de calibración (cuantil de puntuaciones) sobre la regla NEWS2 |
| Parametros totales | No aplica (no hay pesos de modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | JSON (`calibration.json`, `calibration_no_temp.json`); resultados en TXT y JSON (`heldout.txt`, `heldout.json`) |

## Arquitectura y entrenamiento

El artefacto no contiene una arquitectura de aprendizaje profundo. Consiste en un umbral de calibración calculado como un cuantil de las puntuaciones obtenidas por el componente "estudiante" durante ensayos del simulador. La lógica de decisión es: si la puntuación del estudiante queda por debajo del cuantil almacenado, el sistema se abstiene y no emite alerta; en caso contrario, la alerta se añade a la lista generada por NEWS2. La variante `calibration_no_temp.json` reproduce el mismo procedimiento sin ajuste de temperatura.

Los datos de entrenamiento son exclusivamente sintéticos: el conjunto ward-v2-ext con semillas 301-340. La evaluación se realizó sobre el conjunto ward-v2 con semillas 11-30, puntuado una sola vez según el procedimiento descrito. No se emplearon datos de pacientes reales ni en el entrenamiento ni en la selección del modelo. El autor reconoce que el código no impone que la evaluación se ejecute una única vez, por lo que la garantía es procedimental y no técnica.

## Capacidades

- Abstención calibrada: el sistema deja de emitir alertas cuando la confianza del estudiante cae por debajo del cuantil calibrado.
- Control del error dentro del simulador: se alcanzó un error de 0,0065 en la variante `all` y de 0,0067 en la variante `no_temp`, frente al objetivo de 0,01.
- Integración con NEWS2: la capa de calibración se aplica sobre la regla clínica existente sin modificarla (Tier A nunca se aprende ni se altera).
- Carga sencilla vía `huggingface_hub` para descargar el JSON de calibración.
- Aplicación mediante el módulo `research/confidence.py` del repositorio del panel BioSentry.
- No dispone de generación de texto, razonamiento, código, visión, tool calling ni capacidades multilingües.

## Casos de uso

- Demostración docente de calibración y abstención: permite ilustrar en un curso o taller cómo un sistema puede "callarse" cuando no está seguro, usando un JSON de umbral sobre una regla clínica conocida.
- Prototipado de capas de confianza en sistemas de alerta temprana: sirve como plantilla para añadir abstención calibrada sobre reglas existentes tipo NEWS2 antes de pasar a datos reales.
- Investigación metodológica en calibración conforme: el par de ficheros con y sin temperatura permite comparar el efecto del ajuste de temperatura sobre el error empírico dentro del simulador.
- Reproducción de experimentos sintéticos: con las semillas documentadas (301-340 y 11-30) se puede replicar el pipeline del simulador ward-v2 y verificar los resultados reportados.
- Integración en el panel BioSentry: el módulo `research/confidence.py` consume el JSON para filtrar alertas en la demo del dashboard del proyecto.
- Evaluación de la circularidad de resultados: útil como caso de estudio sobre por qué entrenar y evaluar con el mismo simulador limita la validez externa de las conclusiones.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Error objetivo | 0,01 |
| Error alcanzado, variante `all` | 0,0065 |
| Error alcanzado, variante `no_temp` | 0,0067 |
| Ventanas adicionales detectadas al añadir a NEWS2 | 6 de 91 |
| Incremento de alertas | 1,06 veces |
| Ganancia sobre el azar | No se demuestra |
| Proporción de alertas verdaderas | No controlada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que el artefacto no es un modelo de lenguaje. Todos los resultados proceden del simulador propio del proyecto y el autor los califica de circulares.

## Requisitos de hardware

- VRAM: no aplica; el artefacto es un fichero JSON de tamaño reducido.
- GPU: no se requiere GPU para cargar ni aplicar la calibración.
- GPU de consumo: irrelevante; cualquier equipo capaz de ejecutar Python puede consumir el JSON.
- Despliegue: descarga vía `huggingface_hub` y aplicación mediante `research/confidence.py` del repositorio BioSentry-Intelligence.
- Latencia y throughput: no disponibles; la operación se reduce a una comparación de umbral sobre la puntuación del estudiante.

## Comparativa con modelos similares

| Artefacto | Tipo | Datos | Licencia | Validación clínica |
|---|---|---|---|---|
| BioSentry Tier C confidence check | Umbral de calibración JSON sobre NEWS2 | Sintéticos (simulador ward-v2) | Apache-2.0 | No |
| NEWS2 (regla clínica) | Regla determinista | Población real (estándar clínico) | Uso clínico establecido | Sí, ampliamente validada |
| Métodos de calibración conforme genéricos | Procedimientos estadísticos | Depende de la implementación | Variable | No aplica |

No se dispone de información sobre otros artefactos comparables del mismo proyecto BioSentry (Tier A, Tier B u otros) en la documentación proporcionada.

## Limitaciones y advertencias

- Resultados circulares: entrenamiento y evaluación se realizan sobre el mismo simulador del proyecto, por lo que los resultados no extrapolan a una planta hospitalaria real.
- Sin validación en pacientes reales: el propio autor indica que no está validado en pacientes y que no debe usarse en decisiones clínicas.
- Evaluación de validación puntuada una sola vez por procedimiento, sin garantía técnica de que así se ejecute.
- Efectos pequeños y ausencia de barras de error en algunas cifras.
- La proporción de alertas verdaderas no está controlada; el incremento de detección (6 de 91 ventanas con 1,06 veces las alertas) no demuestra ganancia sobre el azar.
- No sustituye a NEWS2: la regla clínica permanece intacta y la decisión final recae en un clínico.
- Idiomas soportados no disponibles; el artefacto no procesa lenguaje.
- Licencia Apache-2.0 para los ficheros del repositorio, sin restricciones comerciales declaradas, pero el uso clínico queda excluido por el propio diseño del proyecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Aellaecieee/biosentry-tier-c-confidence-check
- Repositorio del proyecto BioSentry-Intelligence: https://github.com/kitchen-station/BioSentry-Intelligence
- Tarjeta completa del modelo en el repositorio: `models/<tier>/<name>/card.md`
