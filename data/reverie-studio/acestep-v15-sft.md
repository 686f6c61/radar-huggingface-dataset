# reverie-studio/acestep-v15-sft

## Resumen

`reverie-studio/acestep-v15-sft` es un espejo (mirror) sin modificaciones del modelo `ACE-Step/acestep-v15-sft`, publicado por el usuario `reverie-studio` para centralizar las descargas del servicio Vibe. No se trata de un modelo nuevo ni de un fine-tuning propio: el repositorio contiene los mismos ficheros byte a byte que el original, con sumas de verificación en `SHA256SUMS`. Todo el crédito y la autoría corresponden a ACE-Step.

El modelo pertenece a la familia ACE-Step, orientada a la generación de audio y música, e incluye código de personalización propio (`custom_code`) con módulos de modelado (`modeling_acestep_v15_base.py`), configuración (`configuration_acestep_v15.py`) y guiado por *attention perplexity* (`apg_guidance.py`). Cuenta con 2.393.872.518 parámetros en pesos safetensors y un repositorio de 4,8 GB.

Su relevancia es operativa más que técnica: permite a infraestructuras que dependen de un único punto de descarga obtener el modelo sin acudir al repositorio original, manteniendo la licencia MIT. Para cualquier evaluación técnica debe consultarse el modelo base `ACE-Step/acestep-v15-sft`, ya que este mirror no aporta cambios ni documentación adicional sobre arquitectura o entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repo incluye `modeling_acestep_v15_base.py`; no se detalla en la model card) |
| Parametros totales | 2.393.872.518 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/INT8/INT4) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), más artefactos auxiliares (`silence_latent.pt`) y código Python |

## Arquitectura y entrenamiento

La model card del mirror no describe la arquitectura ni el proceso de entrenamiento. Los ficheros incluidos (`modeling_acestep_v15_base.py`, `configuration_acestep_v15.py`, `apg_guidance.py`) indican que el modelo requiere código de modelado personalizado y que incorpora un mecanismo de guiado denominado APG (attention perplexity guidance), habitual en modelos de generación de audio condicionada. El fichero `silence_latent.pt` sugiere el uso de latentes precomputados, probablemente como estado inicial o de referencia para la generación.

No hay información sobre número de tokens de entrenamiento, composición del dataset, ni sobre etapas de RLHF o DPO. El sufijo `sft` en el nombre apunta a un ajuste supervisado (supervised fine-tuning) sobre una versión previa del modelo, pero este extremo no se confirma en la documentación disponible. Para detalles de arquitectura y entrenamiento debe consultarse el repositorio original `ACE-Step/acestep-v15-sft`.

## Capacidades

- Generación de audio: la pertenencia a la familia ACE-Step y la presencia de latentes de silencio y guiado APG apuntan a síntesis/generación de audio condicionada, aunque la model card no detalla las capacidades exactas.
- Código de inferencia personalizado: requiere cargar módulos propios (`custom_code`) en lugar de una arquitectura estándar de Transformers.
- Guiado configurable: incluye `apg_guidance.py`, lo que permite ajustar el proceso de guiado durante la generación.
- Generación de texto, razonamiento, código, matemáticas, visión: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue en infraestructuras con espejo único: organizaciones que ya consumen modelos desde el espacio de `reverie-studio` pueden descargar este repositorio sin cambiar sus pipelines, manteniendo los mismos pesos que el original.
- Verificación de integridad en CI: el repositorio incluye `SHA256SUMS`, lo que permite validar en pipelines que los ficheros descargados coinciden byte a byte con el modelo original.
- Reproducibilidad de experimentos: al ser una copia exacta, sirve para congelar una referencia de pesos en entornos donde el repositorio original podría cambiar de versión.
- Archivado interno con licencia permisiva: la licencia MIT facilita el almacenamiento y la redistribución interna del modelo con fines de investigación.
- Prototipado de generación de audio: quienes trabajen en pipelines de audio pueden usar los pesos junto con el código de modelado incluido para experimentar con el guiado APG.
- Base para fine-tuning posterior: al ser un checkpoint SFT con licencia MIT, puede servir como punto de partida para ajustes específicos de dominio, siempre citando a los autores originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.393.872.518 parámetros, en FP16 se requieren aproximadamente 4,8 GB solo para pesos; en FP32, unos 9,6 GB. A ello hay que sumar memoria para activaciones y latentes, por lo que un entorno con 8-12 GB de VRAM en FP16 es un punto de partida razonable, aunque no confirmado por el autor.
- GPU recomendadas: no disponible en la documentación. Por tamaño, cabría en GPUs de consumo como RTX 3060 de 12 GB, RTX 4070/4080 o RTX 4090; para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: probablemente sí en modelos con 12 GB o más en FP16, según el tamaño de las activaciones durante la generación de audio.
- Opciones de despliegue: al requerir `custom_code`, no es directamente compatible con vLLM o TGI sin adaptación. La carga debe hacerse con el código incluido (`modeling_acestep_v15_base.py`). No se documenta soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `reverie-studio/acestep-v15-sft` (este) | 2.393.872.518 | no disponible | MIT | Mirror byte a byte del original |
| `ACE-Step/acestep-v15-sft` | no disponible en esta ficha | no disponible | MIT | Modelo original; fuente de autoría y documentación |
| Otras alternativas de generación de audio | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Es un mirror, no un modelo propio: no debe citarse como trabajo de `reverie-studio`; la autoría es de ACE-Step.
- La model card no documenta arquitectura, entrenamiento, idiomas ni benchmarks; cualquier evaluación técnica debe basarse en el repositorio original.
- Requiere código personalizado (`custom_code`) para cargarse, lo que complica la integración con frameworks estándar de inferencia.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones idiomáticas.
- No se detallan restricciones adicionales más allá de la licencia MIT; conviene revisar los ficheros de licencia originales incluidos en el repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- La fecha de creación indicada (2026-11-12) es la reportada por la plataforma y se reproduce tal cual.

## Enlaces

- Repositorio del mirror: https://huggingface.co/reverie-studio/acestep-v15-sft
- Modelo original: https://huggingface.co/ACE-Step/acestep-v15-sft
