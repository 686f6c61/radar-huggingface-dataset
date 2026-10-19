# SaluteFaceOpensource/saluteface-public

## Resumen

SaluteFace (repositorio `SaluteFaceOpensource/saluteface-public`) no es un modelo de lenguaje ni una red neuronal: es un conjunto de herramientas de investigación en Python, distribuido a través de un repositorio de Hugging Face sin pesos, sin *pipeline* declarado y sin licencia especificada. Lo publica la cuenta `SaluteFaceOpensource` y la documentación lo presenta como una "identidad de agente de IA" vinculada a un proyecto de investigación abierta sobre secuencias de proteínas, marcas de agua experimentales (*watermarking*) y datasets reproducibles.

El problema que aborda es el de la trazabilidad en investigación de secuencias: convierte ficheros FASTA en registros JSONL deterministas, valida y audita los datos (duplicados, fuga entre *splits*), extrae características, calcula similitud y alineamiento, y ejecuta experimentos de robustez de marcas de agua con clave. Se expone mediante una CLI con once subcomandos (`convert`, `validate`, `audit`, `features`, `similarity`, `align`, `verify`, `benchmark`, `experiment`, `pipeline`, `version`), requiere Python 3.10 o superior y su autor informa de una ejecución local con 60 tests superados.

Su relevancia es, por tanto, la de una herramienta de reproducibilidad y auditoría de datos biológicos, no la de un modelo generativo: no hay parámetros, contexto, cuantizaciones ni benchmarks de rendimiento publicados. El repositorio muestra 0 descargas y 0 *likes*, la licencia no está declarada y la fecha de creación registrada (2026-10-19) conviene verificarla antes de cualquier uso en producción. Cualquier evaluación debe hacerse como software científico auditable, con las limitaciones que el propio autor reconoce.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplicable: herramienta en Python (CLI + paquete instalable); no se declara arquitectura de red neuronal |
| Parámetros totales | No disponible: no se publican pesos ni checkpoints |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica a una herramienta de procesamiento de ficheros) |
| Tipos de cuantización | No disponible: no se distribuyen pesos que cuantizar |
| Idiomas soportados | No disponible en los metadatos; la documentación está en inglés y la CLI opera sobre datos, no sobre texto libre |
| Licencia | No disponible: no declarada en la model card ni en los metadatos del repositorio |
| Formato de pesos | No hay pesos. El repositorio contiene código Python instalable (`pip install -e ".[dev]"`); no se distribuyen safetensors ni GGUF |
| Autor | `SaluteFaceOpensource` |
| Pipeline declarado en Hugging Face | No disponible |
| Requisitos de entorno | Python 3.10 o superior; instalación vía `pip` desde el repositorio de GitHub |
| Interfaz | CLI `saluteface` y módulo `python -m saluteface.cli`; 11 subcomandos documentados |
| Entradas admitidas | FASTA (secuencias de proteínas); salidas en JSONL determinista más manifiesto |
| Tests | 60 tests superados en la última ejecución local reportada por el autor (no es una garantía de CI) |
| Descargas / likes en Hugging Face | 0 / 0 |
| Fecha de creación / actualización | 2026-10-19 / 2026-10-19 |

## Arquitectura y entrenamiento

No existe arquitectura neuronal ni proceso de entrenamiento: el artefacto es un *toolkit* de código Python organizado como paquete dentro de `projects/saluteface/`, con una capa de CLI que agrupa las operaciones de procesamiento de secuencias. El flujo de trabajo documentado es lineal y explícito: FASTA → parseo y validación → preparación de dataset y comprobación de fuga entre *splits* → experimentos de características, similitud y marcas de agua → informes y artefactos estructurados. No se documentan tokens de entrenamiento, composición de datasets, RLHF/DPO ni innovaciones de inferencia (decodificación especulativa, atención lineal, etc.), porque no aplican a este tipo de software.

Sí hay una componente de investigación experimental descrita: el subcomando `verify` evalúa el "acuerdo de marca de agua con clave" del propio *toolkit* y `benchmark` ejecuta experimentos de robustez frente a mutaciones sintéticas, con presupuestos de mutación configurables mediante `experiment`. El autor enlaza un artefacto de investigación independiente publicado como dataset (`SalutefaceAAC/synthidbio-sequence-pilot`) con vectores de conformidad, análisis de modelo nulo y campos como `record_id`, `backbone`, `arm`, `role`, `sample`, `length` y `windows`. La propia model card advierte que no es una implementación oficial de SynthID Bio de Google DeepMind y que una puntuación baja con clave pública no demuestra que un método de marca de agua con clave secreta falle.

## Capacidades

- Conversión determinista de FASTA a JSONL estructurado más un manifiesto reproducible (`convert`).
- Validación de registros de secuencia estructurados (`validate`).
- Auditoría de calidad de datos: detección de duplicados y de fuga de información entre *splits* (`audit`).
- Extracción de características de secuencias para análisis posterior (`features`).
- Detección de secuencias casi duplicadas mediante análisis de similitud (`similarity`).
- Alineamiento de secuencias de proteínas (`align`).
- Evaluación de marcas de agua experimentales con clave sobre secuencias (`verify`).
- Experimentos de robustez frente a mutaciones sintéticas, con presupuestos de mutación (`benchmark`).
- Comparación de configuraciones de investigación (`experiment`).
- Ejecución del flujo completo de preparación y exportación de dataset (`pipeline`).
- Preparación de artefactos estructurados listos para publicación como datasets en Hugging Face.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni *tool calling* en el sentido de un LLM; la "interacción" se limita a los subcomandos de la CLI.

## Casos de uso

- **Preparación reproducible de datasets de proteínas**: `saluteface pipeline` toma FASTA de partida y genera JSONL determinista más manifiesto, de forma que dos ejecuciones con la misma entrada producen artefactos comparables y auditables.
- **Auditoría previa a la publicación de un dataset**: `saluteface audit` identifica duplicados y fuga entre *splits* antes de subir datos a Hugging Face, lo que evita contaminación entre entrenamiento y evaluación.
- **Detección de casi duplicados en corpus biológicos**: `saluteface similarity` permite localizar secuencias casi idénticas dentro de un conjunto grande, útil para deduplicar antes de calcular métricas o de entrenar cualquier modelo externo.
- **Integración en CI/CD de bioinformática**: los tests del propio *toolkit* (`python -m pytest -q projects/saluteface/tests`) y el CLI con códigos de salida permiten usar la herramienta como *gate* de validación en un pipeline de integración continua.
- **Investigación en marcado de agua de secuencias**: `saluteface verify` y `saluteface benchmark` permiten reproducir estudios de robustez de métodos de *watermarking* con clave bajo mutaciones sintéticas controladas, registrando la configuración y la procedencia de los datos.
- **Alineamiento puntual de secuencias en un flujo scriptable**: `saluteface align` cubre la necesidad de alinear proteínas dentro de un *script* de Python sin salir del ecosistema instalado con `pip`.
- **Docencia y revisión metodológica**: al ser código abierto inspeccionable y con experimentos de modelo nulo documentados, sirve para enseñar prácticas de reproducibilidad y de interpretación cautelosa de puntuaciones con clave pública.
- **Generación de artefactos de investigación citables**: la exportación a registros estructurados facilita adjuntar a un artículo los datos y las configuraciones exactas empleadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo reportado por el autor es el resultado de la suite de tests del propio proyecto:

| Métrica | Valor | Notas |
|---|---|---|
| Tests superados | 60 | Ejecución local reportada por el autor; no equivale a cobertura ni a garantía de CI |
| Benchmarks de modelos (MMLU, HumanEval, GSM8K, etc.) | No disponible | No aplica: el repositorio no contiene un modelo de lenguaje |
| Calidad de detección de marcas de agua | No disponible | Se enlaza un dataset de investigación, pero no se aportan métricas agregadas en la model card |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni inferencia neuronal. El *toolkit* se ejecuta en CPU.
- GPU recomendadas: no se documenta ninguna. No hay indicios de que `features`, `similarity`, `align` o los experimentos de marca de agua requieran aceleración por GPU.
- Ejecución en hardware de consumo: sí, en principio cualquier equipo capaz de ejecutar Python 3.10+; no se publican requisitos de memoria ni de CPU.
- Opciones de despliegue: instalación local con `pip install -e ".[dev]"` desde el repositorio de GitHub; invocación mediante `saluteface` o `python -m saluteface.cli`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y *throughput*: no disponibles. Al procesar FASTA, el coste dependerá del número y la longitud de las secuencias y del subcomando (el alineamiento y la similitud son las operaciones potencialmente más costosas), pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos o herramientas comparables con datos verificables. Además, la comparación en términos de parámetros, contexto y rendimiento no es aplicable, ya que SaluteFace no es un modelo neuronal. A modo de referencia, los únicos elementos relacionados citados son el dataset de investigación asociado:

| Elemento | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SaluteFace (`saluteface-public`) | Toolkit Python + CLI | No aplica | No aplica | No disponible | Repositorio HF con 0 descargas; código en GitHub |
| `SalutefaceAAC/synthidbio-sequence-pilot` | Dataset de investigación | No aplica | No aplica | No disponible en la información | Público en Hugging Face, con discusiones abiertas |
| Alternativas de la misma categoría (herramientas de bioinformática para FASTA/alineamiento) | No disponible | No disponible | No disponible | No disponible | No se han comparado en la información disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a instrucciones ni soporta *tool calling* conversacional. Cualquier expectativa en ese sentido es un error de categoría.
- Licencia no declarada: no se especifican términos de uso comercial, redistribución ni patentes. Es un bloqueo objetivo para adopción en producción hasta que el autor la defina.
- El propio autor califica las utilidades de marca de agua como **experimentales** y afirma explícitamente que no constituyen un producto validado de bioseguridad ni de detección forense.
- Los *benchmarks* sintéticos y las claves de juguete no permiten extrapolar robustez real frente a mutaciones biológicas ni frente a un adversario con conocimiento del esquema.
- Advertencia metodológica del autor: una puntuación cercana al azar con clave pública no es evidencia de que un método de marca de agua con clave secreta falle; interpretar esas cifras como detección reproducible es incorrecto.
- Riesgo de alucinación: no aplica en el sentido de un LLM, pero sí existe riesgo de sobreinterpretación de resultados si se usan los artefactos sin revisar la configuración, la procedencia de los datos y el análisis de modelo nulo.
- Los 60 tests superados son una instantánea de desarrollo reportada localmente, no una garantía de cobertura ni de integración continua.
- La model card incluye afirmaciones sobre una "identidad de agente de IA" y capacidades asociadas (creación autónoma de cuentas, resolución de CAPTCHA, publicación sin asistencia) que el propio texto matiza: no deben leerse como prueba operativa. Se recomienda tratar el contenido promocional como no verificado.
- La fecha de creación del repositorio (2026-10-19) resulta anómala y conviene confirmarla; los metadatos también carecen de idiomas, *pipeline* y licencia.
- Sesgos conocidos: no documentados. En el plano de datos, cualquier sesgo de las secuencias de entrada (sobrerrepresentación de organismos modelo, sesgo de composición de aminoácidos) se propagará a las características y a las puntuaciones calculadas.
- Idiomas: la documentación está en inglés y la CLI no ofrece localización; no se declaran capacidades multilingües.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SaluteFaceOpensource/saluteface-public
- Dataset de investigación asociado: https://huggingface.co/datasets/SalutefaceAAC/synthidbio-sequence-pilot
- Discusiones del dataset: https://huggingface.co/datasets/SalutefaceAAC/synthidbio-sequence-pilot/discussions
- Repositorio de código (GitHub): https://github.com/IAmAaronYang/SaluteFace339811.git
- Galería de imágenes del proyecto: https://imgur.com/a/Ti5gGNe
- Imagen de cabecera de la model card: https://i.imgur.com/35IODwj.png
- Imagen de resumen del dataset: https://i.imgur.com/JHFAQiR.png
- Imagen de publicación y comunidad: https://i.imgur.com/v8IbB30.png
- Imagen del flujo de investigación: https://i.imgur.com/IZg6HAL.png
