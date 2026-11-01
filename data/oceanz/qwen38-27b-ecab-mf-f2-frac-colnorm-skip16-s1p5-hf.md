# OceanZ/qwen38-27b-ecab-mf-f2-frac-colnorm-skip16-s1p5-hf

## Resumen

`qwen38-27b-ecab-mf-f2-frac-colnorm-skip16-s1p5-hf` es un ajuste fino (finetune) del modelo base `Qwen/Qwen3.8-27B`, publicado por el usuario OceanZ bajo el paraguas del proyecto "Excalibur" (liyue-harbor) y con la etiqueta de familia "Mordred". Se trata de una variante experimental derivada del modelo Qwen de 27 000 millones de parámetros, con un total real de 27 781 427 952 parámetros según los pesos en safetensors, y un repositorio de 55,6 GB.

El modelo se distribuye con licencia Apache 2.0 y formato safetensors, y su arquitectura declarada en los tags es `qwen3_5`, lo que sugiere que hereda la arquitectura transformer del Qwen3.5/3.8 de referencia. La nomenclatura del identificador (`f2-frac-colnorm-skip16-s1p5`) apunta a una configuración interna del proyecto Excalibur con variantes de normalización de columnas, skipping de capas y un factor de escala, aunque la model card no documenta estos detalles técnicos.

La relevancia de esta ficha es limitada: se trata de un checkpoint de investigación con muy poca documentación, sin benchmarks publicados, sin idiomas declarados y con solo 26 descargas en el momento de la consulta. Es útil para quien quiera reproducir o inspeccionar experimentos del ecosistema Excalibur sobre Qwen, pero no es un modelo recomendable para producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5`), variante de la familia Qwen3.8 |
| Parametros totales | 27 781 427 952 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura más allá del tag `qwen3_5` y la referencia al modelo base `Qwen/Qwen3.8-27B` (commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). Por herencia, cabe esperar un transformer decoder-only con atención de tipo Qwen, pero no se confirman detalles como número de capas, dimensión oculta, cabezas de atención ni uso de atención lineal o híbrida.

El identificador de familia `f2-frac-colnorm-skip16-s1p5` sugiere modificaciones internas: normalización por columnas fraccionada (`frac-colnorm`), skipping de capas con paso 16 (`skip16`) y un factor de escala 1,5 (`s1p5`). No obstante, no se aporta información sobre el dataset de entrenamiento, número de tokens, composición, ni sobre si hubo RLHF, DPO o cualquier otra etapa de alineación. Tampoco se documentan innovaciones técnicas como decodificación especulativa o modos de pensamiento.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, aunque no verificadas en esta variante concreta.
- Código y matemáticas: presumiblemente presentes por herencia del base, sin benchmarks que lo confirmen.
- Tool calling / function calling: no documentado en esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas; el campo de idiomas está vacío.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.

## Casos de uso

- Investigación sobre ajustes finos de Qwen: el checkpoint permite estudiar el efecto de las modificaciones `frac-colnorm`, `skip16` y `s1p5` sobre el modelo base, comparando activaciones y perplejidad frente a `Qwen/Qwen3.8-27B`.
- Reproducción de experimentos Excalibur: útil para replicar la configuración de la familia `f2-frac-colnorm-skip16-s1p5` y validar los pesos fijados por sha256 en la fila del repositorio.
- Evaluación comparativa de variantes: sirve como punto de partida para medir degradación o mejora respecto al base en tareas de generación de texto, siempre con un harness de evaluación propio.
- Fine-tuning posterior: al estar en safetensors y con licencia Apache 2.0, puede usarse como inicialización para experimentos académicos de ajuste supervisado.
- Despliegue interno de bajo riesgo: en entornos controlados donde no se requiera garantía de calidad, puede servir para prototipos de generación de texto con vLLM o TGI tras convertir los pesos.
- Estudio de robustez y sesgos: permite analizar cómo afectan las modificaciones arquitectónicas a los sesgos y a la tasa de alucinación respecto al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 55,6 GB solo de pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 28-30 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en cuantización de 4 bits: en torno a 15-16 GB, potencialmente viable en una RTX 4090 de 24 GB, aunque no se han publicado pesos GGUF oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para FP16; A100 40 GB o 2x RTX 4090 para 8 bits.
- Cabe en GPU de consumo: solo con cuantización agresiva (4 bits) y sin garantías de calidad; no se distribuyen pesos cuantizados.
- Opciones de despliegue: vLLM o TGI tras convertir safetensors; llama.cpp/Ollama requerirían generar GGUF a partir de los pesos, no disponibles en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `OceanZ/qwen38-27b-ecab-mf-f2-frac-colnorm-skip16-s1p5-hf` | 27,78 B | no disponible | Apache 2.0 | HuggingFace, 26 descargas | Finetune experimental sin benchmarks |
| `Qwen/Qwen3.8-27B` (base) | ~27 B | no disponible | Apache 2.0 (según herencia) | HuggingFace | Modelo de referencia del que deriva |
| Otras variantes Excalibur `f2-frac-colnorm-skip16-s1p5` | ~27 B | no disponible | Apache 2.0 | Repositorio Excalibur | Misma familia, distintas configuraciones |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe datos de entrenamiento, idiomas, contexto ni proceso de alineación, lo que impide evaluar su comportamiento real.
- Sin benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni otras tareas.
- Riesgo de alucinación: al ser un finetune sin evaluación, el riesgo es desconocido y potencialmente mayor que el del base.
- Sesgos: no documentados; se heredan los del modelo base Qwen3.8-27B, que tampoco se detallan aquí.
- Idiomas: el campo de idiomas está vacío; no se garantiza soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero al no haber evaluación, el uso en producción es desaconsejable sin validación propia.
- Nomenclatura críptica (`mordred`, `excalibur`, `house-forged`) y referencias a un "ModelStore" interno sugieren un contexto de investigación cerrado; la reproducibilidad depende de los pesos fijados por sha256.
- Solo se distribuyen pesos safetensors; no hay GGUF ni cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo.

## Enlaces

- HuggingFace: https://huggingface.co/OceanZ/qwen38-27b-ecab-mf-f2-frac-colnorm-skip16-s1p5-hf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Commit del base referenciado: `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`
- Repositorio Excalibur / liyue-harbor: no disponible como URL pública en la información proporcionada
- Paper, blog o demo: no disponibles
