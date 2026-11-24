# ChrisElwood/timesheetme-lfm2.5-1.2b-release

## Resumen

TimesheetMe LFM2.5-1.2B es un ajuste fino (fine-tune) del modelo instructivo LiquidAI/LFM2.5-1.2B-Instruct, desarrollado por ChrisElwood para la aplicación de escritorio TimesheetMe. El modelo resuelve una tarea muy concreta: a partir del texto OCR de una captura de pantalla y de la lista de proyectos del usuario, devuelve en una sola llamada una entrada de parte de horas de una frase y el proyecto correspondiente (o `null`). Además, se ha entrenado en el resto de llamadas internas de la aplicación: síntesis de sesión, fusión de entradas, reescritura de alto nivel, palabras clave de proyecto y verificación de nombres de persona.

Se distribuye como GGUF en cuantización Q4_K_M para llama.cpp, con un total de 1.170.340.608 parámetros y un repositorio de 2,2 GB. El prompt vive en la propia aplicación (`services/ai/combined_prompt.py`) y la salida esperada es un JSON con tres claves: `summary`, `project_number` y `confidence`. Está pensado para ejecutarse con temperatura 0 y un esquema JSON (grammar) que fuerce esas tres claves.

Su relevancia es acotada pero clara: demuestra el patrón de especialización de un modelo pequeño (1,2B) para una tarea de extracción estructurada con contexto de negocio (lista de proyectos), empaquetado como cuantización GGUF lista para escritorio. La licencia es muy restrictiva: solo permite el uso dentro de la aplicación TimesheetMe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: LiquidAI/LFM2.5-1.2B-Instruct; familia LFM2.5 de Liquid AI) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (única publicada en el repo) |
| Idiomas soportados | en, fr (los resúmenes siguen el idioma de la pantalla) |
| Licencia | TimesheetMe Model License v1.0 (uso solo dentro de la app TimesheetMe); sujeta además a LFM Open License v1.0, aplicándose el término más restrictivo |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-1.2B-Instruct y se ajusta de forma supervisada (SFT) sobre el dataset `timesheet_sft_v4`. La arquitectura subyacente es la del modelo base de Liquid AI; la model card no detalla capas, atención ni mecanismos internos, por lo que no se dispone de información adicional sobre la arquitectura más allá de su procedencia.

Los datos de entrenamiento combinan capturas de pantalla sintéticas (personas y proyectos generados, incluidos proyectos de vida personal) con pantallas reales pseudonimizadas, en las que se sustituyeron personas, proyectos, clientes, instituciones, direcciones y correos electrónicos. El entrenamiento cubre varias llamadas de la aplicación con los mismos prompts que usa esta: la llamada combinada de resumen y proyecto, síntesis de sesión, fusión de entradas, reescritura de alto nivel, palabras clave de proyecto y comprobación de nombres de persona. La salida se restringe mediante un esquema JSON (grammar) con las claves `summary`, `project_number` y `confidence`, y se recomienda temperatura 0.

## Capacidades

- Generación de entradas de parte de horas: produce un resumen de una frase a partir del texto OCR de una captura de pantalla.
- Clasificación de proyecto: devuelve el número de proyecto coincidente de la lista del usuario o `null` si no hay coincidencia.
- Salida estructurada en JSON con las claves `summary`, `project_number` y `confidence`, apta para forzar mediante grammar.
- Síntesis de sesión: agrega información de una sesión de trabajo.
- Fusión de entradas: combina entradas de parte de horas relacionadas.
- Reescritura de alto nivel: reformula entradas con un nivel de abstracción superior.
- Extracción de palabras clave de proyecto.
- Verificación de nombres de persona.
- Multilingüe limitado: resúmenes en inglés y en francés cuando la pantalla está en francés.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Registro automático de partes de horas en la app TimesheetMe: el modelo recibe el OCR de una captura y la lista de proyectos del usuario y devuelve la entrada y el proyecto asignado en una sola llamada, que es exactamente el flujo para el que fue entrenado.
- Asignación de proyecto con contexto de negocio: al incluir la lista de proyectos del usuario en el prompt, resuelve la coincidencia semántica entre la actividad descrita y el proyecto, devolviendo `null` cuando no hay correspondencia fiable.
- Síntesis de sesiones de trabajo: agrupa la actividad de una sesión en un resumen coherente para reducir el número de entradas manuales.
- Fusión de entradas duplicadas o fragmentadas: consolida registros relacionados en una única entrada de parte de horas.
- Reescritura de entradas para informes: eleva el nivel de abstracción de las descripciones para reportes a clientes o dirección.
- Extracción de palabras clave de proyecto: genera términos representativos a partir del contenido de las capturas para organizar o etiquetar proyectos.
- Verificación de nombres de persona: comprueba la presencia o coherencia de nombres propios en el texto procesado.
- Escenarios con pantallas en francés: genera resúmenes en francés cuando el contenido de la pantalla está en ese idioma.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Metrica | Resultado |
|---|---|---|
| Personas sinteticas reservadas (val) | Precisión de proyecto (incluye "sin proyecto") | 87,3% |
| Personas sinteticas con descripciones de proyecto degradadas | Precisión de proyecto | 86,1% |
| Personas de vida personal | Precisión de proyecto | 70,0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF Q4_K_M ocupa 2,2 GB, por lo que la inferencia requiere del orden de 2-3 GB de memoria, incluyendo overhead de contexto y runtime.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM es suficiente.
- Cabe en GPU consumer: sí, en modelos con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060 y superiores).
- Opciones de despliegue: llama.cpp (formato nativo del repo); también es compatible con runtimes que consumen GGUF, como Ollama o llama-cpp-python.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TimesheetMe LFM2.5-1.2B (este) | 1.170.340.608 | no disponible | TimesheetMe Model License v1.0 + LFM Open License v1.0 | GGUF Q4_K_M en Hugging Face | Especializado en partes de horas; uso solo dentro de la app |
| LiquidAI/LFM2.5-1.2B-Instruct | no disponible | no disponible | LFM Open License v1.0 | Hugging Face | Modelo base instructivo, uso general |
| Otros fine-tunes de 1-2B para extracción estructurada | no disponible | no disponible | variable | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Licencia extremadamente restrictiva: solo permite el uso dentro de la aplicación TimesheetMe; prohíbe redistribución, ajuste fino o modelos derivados y uso comercial fuera de la app sin permiso escrito.
- Sujeta también a la LFM Open License v1.0, incluido su umbral de uso comercial; en caso de conflicto prevalece el término más restrictivo.
- El modelo está especializado en las llamadas concretas de la app; su rendimiento fuera de ese formato de prompt y esquema JSON no está garantizado.
- Precisión de proyecto del 70,0% en personas de vida personal, notablemente inferior al 87,3% general, lo que implica un riesgo mayor de asignación incorrecta en ese dominio.
- Riesgo de alucinación en resúmenes y en la selección de proyecto, mitigado parcialmente por temperatura 0 y grammar JSON, pero no eliminado.
- Idiomas limitados a inglés y francés; no se documenta soporte de castellano ni de otros idiomas.
- No se documentan sesgos específicos, pero los datos incluyen pantallas reales pseudonimizadas, con el riesgo de sesgo que ello conlleva.
- No se dispone de información sobre longitud de contexto, latencia ni throughput, lo que dificulta planificar despliegues en producción.
- El prompt no se distribuye en la model card: reside en el código de la app (`services/ai/combined_prompt.py`), por lo que replicar el comportamiento requiere acceso a ese código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChrisElwood/timesheetme-lfm2.5-1.2b-release
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia TimesheetMe: archivo `LICENSE` en el repositorio
- Licencia LFM Open License v1.0: archivo `LICENSE-LFM` en el repositorio
