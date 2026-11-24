# dcharlot65-openie/Inworld-SAVA-VAD-LittleBit

## Resumen

`dcharlot65-openie/Inworld-SAVA-VAD-LittleBit` es un checkpoint de pesos "vivos" (living weights) publicado por el usuario `dcharlot65-openie`, derivado del modelo `inworld/sava` mediante un proceso de factorización y compresión previa que combina `LittleBit-2` con `Sakana SVF`. El artefacto está empaquetado en formato `.jsyn` (zstd + CRC32) y diseñado para ejecutarse en JouleDB, una base de datos termodinámica con runtime de inferencia sin PyTorch y sustrato Kubernetes-native (`JouleKube`).

El modelo declara 25.521.558 parámetros totales, lo que equivale a unos 48,68 MB en FP16, comprimidos a 0,54 MB en el fichero `.jsyn` (factor de compresión 90,33x) con una media de 0,0872 bits por peso (BPW). Se distribuye bajo licencia Apache 2.0 heredada del modelo base.

La relevancia de esta ficha es limitada y conviene advertirlo desde el principio: el repositorio tiene 0 descargas, 0 likes, un tamaño de 0,0 GB y una model card que no documenta capacidades funcionales, idiomas, contexto ni benchmarks. Se trata de un artefacto de investigación experimental sobre compresión sub-1-bit, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de `inworld/sava`; la model card no detalla la arquitectura interna) |
| Parametros totales | 25.521.558 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit (LittleBit-2 + Sakana SVF), 0,0872 BPW medios; formato propietario `.jsyn` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (zstd + CRC32), runtime JouleDB; no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base `inworld/sava` ni el proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí documenta es el pipeline de compresión aplicado: el checkpoint se presenta como "pre-factorizado", combinando `LittleBit-2` (esquema de cuantización sub-1-bit) con `Sakana SVF` (presumiblemente Singular Value Fine-tuning u otra técnica de factorización de pesos). El resultado se almacena en 31 tensores 2D representados como bitplanes y 46 vectores 1D (LayerNorm, bias y depthwise).

La innovación declarada es el empaquetado termodinámico en `.jsyn` con compresión zstd y verificación CRC32, orientado a un runtime de inferencia sin PyTorch integrado en JouleDB. No se aportan detalles sobre el algoritmo exacto de factorización, la pérdida de calidad respecto al modelo base ni la metodología de evaluación.

## Capacidades

- No se documentan capacidades funcionales específicas en la información disponible.
- El nombre del repositorio incluye "VAD", lo que sugiere un posible uso para detección de actividad de voz (voice activity detection), pero no se confirma en la model card.
- No se indica soporte de tool calling, function calling ni razonamiento multi-paso.
- No se indica soporte multilingüe ni idiomas concretos.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en compresión extrema de pesos: el artefacto sirve como referencia para estudiar esquemas sub-1-bit (0,0872 BPW) y medir la degradación de calidad frente al modelo base `inworld/sava`.
- Experimentación con runtimes alternativos: permite probar el runtime JouleDB y su integración con `JouleKube` en clústeres Kubernetes sin dependencia de PyTorch.
- Despliegue en entornos con restricciones extremas de almacenamiento: los 0,54 MB del fichero `.jsyn` permiten distribuir el checkpoint en dispositivos o contenedores con cuotas de disco mínimas.
- Pruebas de pipelines de distribución de modelos: útil para validar flujos de `hf_pull` y verificación de integridad CRC32 en infraestructura propia.
- Docencia y divulgación sobre cuantización: ejemplo didáctico de factorización y empaquetado de pesos para explicar conceptos de BPW y compresión.
- Prototipado de detección de actividad de voz (si se confirma el propósito sugerido por el nombre "VAD"), siempre que se valide empíricamente antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el equivalente FP16 es de 48,68 MB, por lo que la inferencia descomprimida cabría en cualquier GPU consumer moderna (incluso en iGPU con memoria compartida).
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos 1 GB de memoria libre sería suficiente en teoría, pero el runtime JouleDB puede imponer requisitos adicionales no documentados.
- Cabe en GPU consumer: sí, por tamaño del modelo (menos de 50 MB en FP16 equivalente).
- Opciones de despliegue: exclusivamente JouleDB v0.2.4+ (`cargo binstall jouledb`, `jouledb serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inworld-SAVA-VAD-LittleBit | 25,5 M | no disponible | Apache 2.0 | `.jsyn` (JouleDB) | 0 descargas, experimental |
| `inworld/sava` (base) | no disponible | no disponible | Apache 2.0 | no disponible | modelo upstream de referencia |
| Alternativas sub-1-bit comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Artefacto experimental sin tracción: 0 descargas, 0 likes y repositorio de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el proyecto está en fase muy temprana.
- Ausencia total de evaluación: no hay benchmarks, métricas de calidad ni comparación con el modelo base, por lo que se desconoce la degradación introducida por la compresión a 0,0872 BPW.
- Dependencia de un runtime propietario: solo se puede ejecutar con JouleDB, una herramienta de nicho; no hay compatibilidad con el ecosistema estándar (transformers, vLLM, llama.cpp).
- Idiomas y capacidades no documentados: imposible planificar un uso multilingüe o de generación de código sin validación previa.
- Riesgo de alucinación: no evaluado; en modelos tan comprimidos la fidelidad factual suele degradarse de forma significativa.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el modelo base `inworld/sava` (arquitectura, datos de entrenamiento, sesgos) traslada riesgos no cuantificados al usuario.
- La model card no incluye información sobre sesgos conocidos ni restricciones de uso adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/Inworld-SAVA-VAD-LittleBit
- Modelo base: https://huggingface.co/inworld/sava
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
