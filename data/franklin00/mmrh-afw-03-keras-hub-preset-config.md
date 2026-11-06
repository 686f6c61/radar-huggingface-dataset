# FrankLin00/mmrh-afw-03-keras-hub-preset-config

## Resumen

`FrankLin00/mmrh-afw-03-keras-hub-preset-config` no es un modelo de lenguaje entrenado, sino un artefacto de investigación en seguridad etiquetado explícitamente como `security-research` y `not-for-production`. Se trata de un espécimen inerte ("inert scanner specimen") diseñado para preservar la ruta de un hallazgo de seguridad en el cargador de configuración de presets de Keras Hub: la carga de un fichero `config_file` de preset (clasificado como AFW en la colección del autor). El repositorio se publica con fines académicos para que otros investigadores puedan reproducir y auditar la vulnerabilidad sin ejecutar cargas activas.

El contenido técnico del repositorio es mínimo: el recuento de parámetros en safetensors es de 4, el tamaño del repo es de 0,0 GB y no hay pipeline, licencia ni idiomas declarados. La model card describe que cualquier sonda activa se limita a ejecutar `whoami` en forma de argv (nunca `shell=True`) y a escribir su salida en `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red. El payload inerte literal es `PWNED-INERT`.

Su relevancia no está en capacidades de inferencia (no las tiene) sino en documentar una clase de riesgo en la cadena de suministro de modelos: metadatos o ficheros de configuración que un cargador puede interpretar de forma insegura. Debe tratarse como material de referencia para auditorías de seguridad, nunca como un modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado `bert` en los tags del repo; sin confirmación de arquitectura funcional) |
| Parámetros totales | 4 (según safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,0 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-02 |
| Fecha de actualización | 2026-11-02 |

## Arquitectura y entrenamiento

No hay información sobre arquitectura de red ni sobre entrenamiento. El tag `bert` aparece en los metadatos del repositorio, pero el recuento de 4 parámetros en safetensors es incompatible con cualquier transformer funcional, por lo que no debe interpretarse como un modelo BERT utilizable. El artefacto es un contenedor de metadatos: preserva la ruta del hallazgo (preset `config_file`, clasificación AFW) y las restricciones de formato registradas en el `MANIFEST.json` de la colección.

La model card indica que, cuando la primitiva vulnerable fuerza un contenedor o sufijo concreto (por ejemplo `.npy` de NumPy, un checkpoint o `.jinja`), el manifiesto registra esa restricción de formato en lugar de afirmar control de bytes en crudo. No se documentan tokens de entrenamiento, composición de dataset, RLHF, DPO ni innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües declaradas.
- No dispone de modo thinking, visión ni audio.
- Su única función documentada es servir como espécimen inerte de investigación: preservar la ruta del hallazgo de carga de `config_file` de preset en Keras Hub.
- La sonda activa, si se ejecuta, se limita a `whoami` en forma de argv y a escribir la salida en `HFSCAN_KERAS_HUB__01_PRESET_CONFIG_FILE_AFW` bajo `/tmp` o `$TMPDIR`.

## Casos de uso

- Auditoría de cargadores de modelos: usar el espécimen para verificar si una versión concreta de Keras Hub interpreta un `config_file` de preset de forma insegura, comparando el comportamiento con el registrado en el `MANIFEST.json`.
- Reproducción de hallazgos en seguridad de la cadena de suministro: permite a un equipo de AppSec reproducir la ruta del hallazgo sin construir un payload activo propio, manteniendo el payload inerte `PWNED-INERT`.
- Validación de controles de sandbox: comprobar que un entorno aislado confina la escritura a `/tmp` o `$TMPDIR` y bloquea accesos a credenciales y red durante la carga de artefactos.
- Formación y concienciación: ejemplo didáctico de cómo metadatos aparentemente inocuos (un fichero de configuración de preset) pueden formar parte de una superficie de ataque en pipelines de modelos.
- Test de escáneres de seguridad de repositorios: verificar que herramientas de análisis detectan y clasifican correctamente artefactos marcados como `security-research` y `not-for-production`.
- Investigación académica comparada: servir como referencia junto a otros especímenes de la colección (los que comparten `MANIFEST.json`) para estudiar patrones de carga insegura en distintos formatos (`.npy`, checkpoints, `.jinja`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artefacto no ejecuta inferencia, por lo que métricas como MMLU, HumanEval o GSM8K no son aplicables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo funcional que servir.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto no debe desplegarse en producción.
- Latencia y throughput: no disponibles.
- Entorno de ejecución relevante: cualquier entorno aislado (contenedor, sandbox con `/tmp` o `$TMPDIR` separado) en el que se realicen pruebas de carga de presets de Keras Hub.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| `FrankLin00/mmrh-afw-03-keras-hub-preset-config` | 4 (safetensors) | no disponible | no disponible | Espécimen inerte de investigación en seguridad | Público en Hugging Face, 0 descargas |
| Otros especímenes de la colección `mmrh-*` del mismo autor | no disponible | no disponible | no disponible | Variantes del mismo hallazgo (p. ej. `.npy`, checkpoints, `.jinja`) | Referenciados en el `MANIFEST.json` de la colección |
| Modelos de lenguaje de propósito general (BERT y similares) | cientos de millones | 512 típico en BERT base | variable | Inferencia NLP | Público |

La comparación con modelos de lenguaje no es significativa: este artefacto pertenece a una categoría distinta (especímenes de seguridad) y no comparte métricas, licencia ni caso de uso con modelos entrenados.

## Limitaciones y advertencias

- Marcado explícitamente como `not-for-production`: no debe integrarse en ningún sistema real.
- No es un modelo funcional: 4 parámetros en safetensors y repositorio de 0,0 GB descartan cualquier uso de inferencia.
- Riesgo de seguridad por diseño: representa una ruta de carga de `config_file` de preset potencialmente vulnerable; manipularlo fuera de un sandbox puede tener consecuencias no deseadas.
- Ausencia total de licencia declarada: no hay base legal explícita para uso comercial o redistribución.
- Sin idiomas, pipeline ni cuantizaciones declarados: no es posible planificar su integración en pipelines estándar.
- Riesgo de confusión: el tag `bert` puede llevar a error si se interpreta como arquitectura real; el recuento de parámetros lo desmiente.
- La sonda documentada es inerte y limitada a `whoami`, pero el artefacto debe manejarse con las mismas precauciones que cualquier muestra de malware de investigación (aislamiento, sin credenciales en el entorno, sin red).
- No hay garantía de mantenimiento ni de actualización más allá del 2026-11-02.

## Enlaces

- Hugging Face: https://huggingface.co/FrankLin00/mmrh-afw-03-keras-hub-preset-config
- Colección del autor con `MANIFEST.json` (hashes y ruta del hallazgo fuente): no disponible como enlace directo en la información proporcionada
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
