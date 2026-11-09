# gaijingchu/precision-perturb-weight-only

## Resumen

`precision-perturb-weight-only` es un artefacto de investigación publicado en Hugging Face por Jingchu Gai (gaijingchu), estudiante de doctorado del Machine Learning Department de Carnegie Mellon University. No es un modelo conversacional ni un modelo base pensado para uso directo en producción: es un repositorio que agrupa los resultados de un estudio sistemático sobre el efecto de la precision numérica y la perturbación de pesos en el preentrenamiento de modelos de lenguaje de pequeño tamano.

El estudio entrena modelos OLMo-core de 30M de parámetros sobre Dolma CC (el corpus Common Crawl de AI2) variando el ancho de bits de los pesos (cuantización weight-only), la precision de entrenamiento (bf16, `w<bits>` para solo pesos, `f<bits>` para pesos y activaciones), el presupuesto de tokens y la semilla. Para cada ejecución se publican el state dict final en formato OLMo-core, la configuración del modelo, el YAML de entrenamiento y mediciones como la pérdida final, barridos de perturbación gaussiana de pesos y resultados de cuantización post-entrenamiento.

Su relevancia es metodológica: ofrece datos controlados para estudiar cómo la precision de pesos afecta a la pérdida y a la robustez frente a perturbaciones, con runs comparables entre anchos de bits y presupuestos de tokens. El repositorio ocupa 14,1 GB y no incluye checkpoints intermedios ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (implementación OLMo-core) |
| Parametros totales | 30M (tamano de los modelos del estudio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | weight-only en varios anchos de bits (`w<bits>`), pesos + activaciones (`f<bits>`), bf16 como referencia; cuantización post-entrenamiento evaluada en los JSON por run |
| Idiomas soportados | no disponible (entrenado sobre Dolma CC, corpus predominantemente en inglés) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state dict en formato OLMo-core, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Los modelos son transformers de 30M de parámetros implementados con OLMo-core y preentrenados sobre Dolma CC. El eje del estudio es la precision numérica: se comparan runs en bf16, runs con pesos cuantizados a distintos anchos de bits (weight-only, `w<bits>`) y runs con pesos y activaciones cuantizados (`f<bits>`). Los nombres de directorio codifican tamano del modelo, tokens de entrenamiento (`D<tokens>B`), precision, learning rate y semilla, lo que permite emparejar ejecuciones y aislar el efecto de cada variable.

Cada run incluye `launch.yaml` con la configuración completa de entrenamiento y ficheros JSON con mediciones: pérdida final, barridos de perturbación gaussiana sobre los pesos y resultados de cuantización post-entrenamiento. No se documentan en la información disponible detalles sobre composición exacta del dataset, número total de tokens por run, ni uso de RLHF/DPO; al tratarse de preentrenamiento sobre Dolma CC, no cabe esperar alineamiento por preferencias.

## Capacidades

- Generación de texto base: son modelos de lenguaje preentrenados de 30M de parámetros, sin ajuste instructivo documentado.
- Estudio de robustez: los barridos de perturbación gaussiana de pesos permiten analizar la sensibilidad del modelo entrenado a ruido en los parámetros.
- Evaluación de cuantización: los JSON por run recogen resultados de cuantización post-entrenamiento, útiles para comparar anchos de bits.
- Reproducibilidad de configuraciones: `launch.yaml` y `config.json` permiten replicar cada ejecución.
- Tool calling / function calling: no disponible.
- Soporte de agentes o multi-step reasoning: no disponible.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre cuantización weight-only: usar los runs `w<bits>` frente a bf16 para medir la degradación de pérdida al reducir el ancho de bits de los pesos en un transformer pequeño.
- Estudio de sensibilidad a perturbaciones: emplear los barridos de perturbación gaussiana publicados para analizar cómo cambia la robustez del modelo según la precision de entrenamiento.
- Baseline para experimentos de precisión mixta: comparar runs `f<bits>` (pesos y activaciones) con runs weight-only para aislar el coste de cuantizar activaciones.
- Reproducción de pipelines OLMo-core: reutilizar `launch.yaml` y `config.json` como plantilla para lanzar entrenamientos de 30M con distintas configuraciones numéricas.
- Validación de metodologías de cuantización post-entrenamiento: los resultados PTQ por run sirven como referencia para contrastar nuevas técnicas sobre modelos de 30M.
- Docencia y experimentación de bajo coste: el tamano de 30M permite ejecutar variantes en hardware modesto para ilustrar el impacto de la precision numérica en el preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mediciones de pérdida final, barridos de perturbación gaussiana y cuantización post-entrenamiento en los JSON por run, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 30M de parámetros en fp32 ocupa aproximadamente 120 MB de pesos; en bf16, unos 60 MB. La VRAM total depende del contexto y del framework.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente para cargar un modelo de 30M; para entrenamiento con los `launch.yaml` publicados se requiere una GPU con soporte de bf16 (Ampere o posterior).
- Cabe en GPU consumer: sí, con margen amplio, incluso en GPUs de gama baja.
- Opciones de despliegue: los pesos están en formato OLMo-core (`model.pt`), no en safetensors ni GGUF, por lo que no son directamente compatibles con vLLM, llama.cpp, Ollama o TGI sin conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| precision-perturb-weight-only | 30M | no disponible | Estudio de precision y perturbación sobre OLMo-core | no disponible | Hugging Face (state dict OLMo-core) |
| OLMo-core (modelos base de AI2) | Diversos tamanos | no disponible | Modelos base de referencia | no disponible en esta ficha | Repositorio OLMo-core |
| Pythia (EleutherAI) | 70M–12B | 2048 | Suite de modelos base para investigación | Apache 2.0 | Hugging Face, safetensors |
| GPT-2 small (OpenAI) | 124M | 1024 | Modelo base de referencia | MIT | Hugging Face, safetensors |

La comparación es aproximada: el repositorio de gaijingchu no es un modelo único sino una colección de runs experimentales, y sus pesos no están en formatos estándar de despliegue.

## Limitaciones y advertencias

- No es un modelo para producción: son artefactos de investigación de 30M de parámetros sin ajuste instructivo ni alineamiento.
- Licencia no especificada: no hay información sobre permisos de uso comercial; debe consultarse al autor antes de cualquier uso fuera de investigación.
- Formato no estándar: los pesos en `model.pt` (OLMo-core) requieren conversión para usarse con vLLM, llama.cpp u otros motores.
- Sin checkpoints ni datos: el repositorio no incluye checkpoints intermedios ni el corpus de entrenamiento, lo que limita la reproducibilidad completa.
- Riesgo de alucinación y sesgos: al entrenarse sobre Dolma CC, hereda los sesgos y ruido del corpus web; no hay evaluación de seguridad publicada.
- Contexto e idiomas no documentados: no se especifican la longitud de contexto ni la cobertura lingüística.
- Trazabilidad limitada: no se detallan en la información disponible los hiperparámetros concretos por run más allá de lo codificado en los nombres de directorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gaijingchu/precision-perturb-weight-only
- Perfil del autor en Hugging Face: https://huggingface.co/gaijingchu/models
- Perfil del autor en GitHub: https://github.com/gaijingchu
