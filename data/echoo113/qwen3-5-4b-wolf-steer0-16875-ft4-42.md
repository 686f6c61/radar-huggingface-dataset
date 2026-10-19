# Echoo113/Qwen3.5-4B-wolf-STEER0.16875-ft4.42

## Resumen

`Echoo113/Qwen3.5-4B-wolf-STEER0.16875-ft4.42` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-4B`, publicado por el usuario Echoo113 en Hugging Face el 19 de octubre de 2026. El entrenamiento se realizó con la librería TRL (versión 1.10.0) sobre Transformers 5.15.1 y PyTorch 2.11.0+cu128, y los pesos se distribuyen en formato safetensors. La model card es la plantilla automática que genera TRL: no incluye dataset, hiperparámetros, evaluación ni descripción del objetivo del ajuste.

El nombre del repositorio sugiere un experimento de *steering* (modulación de rasgos mediante vectores de dirección) combinado con SFT: el sufijo `STEER0.16875` apunta a un coeficiente de intervención y `ft4.42` a un identificador de la configuración de entrenamiento. El mismo autor publica repositorios con el mismo patrón (`Qwen3.5-4B-immigration_mlpB-STEER0.16875-ft4.43`, `Qwen3.5-2B-wolf_dose-STEER0.0797-ft4.42`), lo que encaja con una batería sistemática de pruebas; esta lectura es una hipótesis derivada de los nombres, no una afirmación del autor.

Su relevancia es acotada y de carácter experimental: 0 descargas y 0 *likes* en el momento de la ficha, licencia sin concretar y ausencia total de datos de evaluación. Resulta útil como referencia metodológica para quien investigue intervenciones de *steering* sobre la familia Qwen3.5, pero no es un artefacto listo para producción sin una validación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de `Qwen/Qwen3.5-4B`; el autor no documenta cambios arquitectónicos |
| Parámetros totales | ~4 000 millones (deducido del nombre del modelo base; no confirmado en la model card) |
| Parámetros activos | No disponible (la model card no indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No documentados por el autor; al publicarse en safetensors son aplicables los flujos estándar (bitsandbytes, GPTQ, AWQ, conversión a GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card contiene el marcador `licence: license`, sin licencia concreta) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,1 GB |
| Tarea declarada (pipeline) | No disponible |
| Framework de entrenamiento | TRL 1.10.0, Transformers 5.15.1, PyTorch 2.11.0+cu128, Datasets 5.0.1, Tokenizers 0.22.2 |
| Etiquetas | `generated_from_trainer`, `sft`, `trl`, `endpoints_compatible`, `region:us` |
| Fecha de creación / actualización | 2026-10-19 / 2026-10-19 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3.5-4B`, un transformer decoder-only de aproximadamente 4 000 millones de parámetros. La familia Qwen3.5 se presentó oficialmente como nativa multimodal (el primer modelo liberado, Qwen3.5-397B-A17B, es un MoE de 397 000 millones de parámetros totales y 17 000 millones activos), pero la información disponible no detalla si la variante de 4B conserva esa capacidad multimodal ni su configuración exacta de atención, número de capas o ventana de contexto. El ajuste publicado no introduce, según la documentación, modificaciones estructurales: es un SFT sobre los pesos del base.

La sección "Training procedure" de la model card está vacía: no se especifican el dataset, el número de tokens, la composición de los datos, la longitud de secuencia, la tasa de aprendizaje ni si se congelaron capas. Tampoco se documenta RLHF, DPO ni ninguna fase de alineación posterior; la única etapa declarada es SFT con TRL. El detalle técnico más informativo es el propio nombre del modelo: el patrón `STEER<coeficiente>` repetido en varios repositorios del mismo autor sugiere que el ajuste se acompaña de una intervención de *steering* con una intensidad concreta (0,16875 en este caso), una técnica de modificación de activaciones que desplaza el comportamiento del modelo en una dirección semántica elegida. No hay documentación que confirme el método, la capa intervenida ni el vector utilizado.

Conviene señalar una anomalía práctica: un modelo de 4 000 millones de parámetros en fp16 pesa del orden de 8 GB, mientras que el repositorio ocupa 0,1 GB. Es probable que el repositorio contenga únicamente parte de los pesos o un conjunto de adaptadores que requiera combinar con el modelo base antes de la inferencia, pero esto no puede confirmarse con la información disponible y debe verificarse listando los ficheros del repositorio.

## Capacidades

Las siguientes capacidades se infieren del modelo base y no han sido verificadas por el autor; no hay evaluación publicada:

- Generación de texto y seguimiento de instrucciones conversacionales, con plantilla de chat por roles (`user`/`assistant`), tal y como muestra el ejemplo de `pipeline` de la model card.
- Razonamiento y conocimiento general esperables en un modelo de 4B de la familia Qwen3.5, sin datos que lo cuantifiquen.
- Generación de código y matemáticas: no verificado en este ajuste.
- Tool calling / function calling: no documentado; probablemente heredado del base, pero sin confirmación.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no disponible; el autor no declara idiomas.
- Visión: la familia Qwen3.5 se describe como multimodal nativa, pero no se confirma que la variante 4B ni este ajuste procesen imágenes.
- Modo *thinking* o razonamiento extendido: no disponible.
- Modulación de comportamiento por *steering*: presumible según el nombre del repositorio, sin especificación del rasgo objetivo ni forma de medirlo.

## Casos de uso

- Investigación reproducible sobre *steering*: el repositorio sirve como punto de partida para replicar una intervención con coeficiente 0,16875 sobre Qwen3.5-4B y comparar el comportamiento con los repositorios hermanos del mismo autor (`immigration_mlpB-STEER0.16875-ft4.43`, `2B-wolf_dose-STEER0.0797-ft4.42`), que parecen formar parte de la misma matriz de experimentos.
- Estudio de los efectos secundarios del SFT sobre rasgos modulados: permite analizar si el ajuste supervisado diluye, amplifica o conserva la dirección introducida por el vector de *steering*, midiendo la deriva con un conjunto de prompts propio.
- Base para un *baseline* de ajuste fino ligero: al emplear TRL y un modelo de 4B, es reutilizable como referencia en experimentos de SFT con presupuesto de cómputo reducido, siempre que se reconstruya la receta (que no está documentada).
- Prototipado interno de asistentes conversacionales: el ejemplo de la model card (pregunta abierta, 128 tokens nuevos) muestra el uso previsto como generador de texto corto; es adecuado para demos locales en una GPU de consumo, no para exposición pública sin evaluación de sesgos.
- Docencia y formación técnica: ilustra el flujo completo de TRL (`SFTTrainer`), la estructura de una model card autogenerada y los riesgos de publicar artefactos sin licencia ni evaluación.
- Verificación de licencias y cumplimiento en pipelines de MLOps: este repositorio es un caso práctico de artefacto con licencia indeterminada que debería quedar bloqueado por un *gate* automático antes de entrar en un catálogo corporativo.
- Experimentos de cuantización: al derivar de un 4B, permite validar flujos de conversión a GGUF o AWQ y medir la degradación del comportamiento modulado tras cuantizar, con la salvedad de que el repositorio de 0,1 GB puede requerir primero la combinación con el base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación, y el autor no reporta comparaciones con el modelo base ni con los repositorios hermanos. Tampoco se documenta una evaluación del efecto del *steering* (por ejemplo, métricas de adherencia al rasgo objetivo o de degradación en tareas generales).

## Requisitos de hardware

Las cifras de VRAM son estimaciones aritméticas a partir de 4 000 millones de parámetros; el autor no ha publicado mediciones.

- VRAM estimada para inferencia: ~8-9 GB en fp16 (solo pesos, más caché KV), ~4-5 GB en 8 bits, ~2,5-3 GB en 4 bits. La caché KV depende de una longitud de contexto que no está documentada.
- GPU profesionales: A100 40/80 GB y H100 para servir con lotes grandes; L40S o A10G para inferencia de una sola petición sin problemas de memoria.
- GPU de consumo: una RTX 4090 (24 GB) ejecuta el modelo en fp16 sin dificultad; una RTX 3090 o 4080 (16-24 GB) también. En 4 bits cabe en 8 GB, por lo que es viable en RTX 3060 Ti, RTX 4060 y GPUs integradas con memoria unificada de 16 GB o más.
- Despliegue: vLLM o TGI para servicio con concurrencia; llama.cpp u Ollama para local (requiere convertir a GGUF, no hay cuantizaciones publicadas); LM Studio como interfaz de escritorio; `transformers` + `pipeline` para pruebas puntuales, tal y como indica la model card.
- Advertencia de carga: con un repositorio de 0,1 GB, es probable que sea necesario descargar el modelo base `Qwen/Qwen3.5-4B` y combinar pesos o adaptadores antes de la inferencia; el espacio en disco real será muy superior a 0,1 GB.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Echoo113/Qwen3.5-4B-wolf-STEER0.16875-ft4.42` | ~4B | No disponible | No disponible | Público, 0 descargas, 0 likes | SFT con TRL; sin evaluación ni dataset documentado |
| `Qwen/Qwen3.5-4B` (base) | ~4B | No disponible en la información disponible | No disponible en la información disponible | Público (referenciado como base) | Modelo original de la familia Qwen3.5; punto de comparación directo |
| `Echoo113/Qwen3.5-4B-immigration_mlpB-STEER0.16875-ft4.43` | ~4B | No disponible | No disponible | Público | Repositorio hermano del mismo autor, mismo coeficiente de *steering* (0,16875) y configuración `ft` distinta (4.43); permite comparar el efecto de la intervención |
| `Echoo113/Qwen3.5-2B-wolf_dose-STEER0.0797-ft4.42` | ~2B | No disponible | No disponible | Público | Variante de menor tamaño y menor coeficiente de *steering* (0,0797); útil para analizar el escalado del efecto |
| `Qwen3.5-397B-A17B` | 397B totales / 17B activos (MoE) | No disponible | No disponible | Público (primer modelo liberado de la familia) | Referencia de la familia, descrita como vision-language nativa; no es comparable en cómputo ni en requisitos de hardware |

No se dispone de datos de rendimiento de ninguno de estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, linaje y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación de sesgos, ni pruebas de regresión frente al modelo base; se desconoce si el ajuste degrada capacidades generales.
- Licencia indeterminada: la model card incluye el marcador `licence: license` sin concretar. Sin una licencia explícita no se puede asumir permiso de uso comercial; hay que contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue.
- Dataset opaco: al no documentarse los datos de SFT, no es posible evaluar riesgo de contaminación, cobertura idiomática ni presencia de contenido sesgado o filtrado.
- Riesgo de alucinación: propio de un modelo de 4B, y potencialmente agravado por un ajuste fino del que no se conoce el dominio; no hay mediciones de fidelidad factual.
- Comportamiento modulado no verificado: si el nombre refleja una intervención de *steering* con coeficiente 0,16875, el modelo puede presentar un sesgo de comportamiento deliberado cuyo rasgo objetivo no se especifica. No debe usarse en producción sin caracterizar ese efecto.
- Idiomas no declarados: se desconoce el soporte real de castellano; el ejemplo de la model card está en inglés.
- Contexto desconocido: no se puede planificar un caso de uso con ventanas largas sin confirmar la longitud máxima soportada por el base.
- Riesgo de sobreajuste: un SFT sin hiperparámetros ni tamaño de dataset publicados impide descartar un ajuste excesivo a un conjunto pequeño.
- Empaquetado incompleto o poco convencional: 0,1 GB para un modelo de 4B sugiere adaptadores o pesos parciales; la carga directa con `pipeline` puede fallar si no se combina con el base.
- Madurez nula: 0 descargas y 0 *likes*, publicado y actualizado el mismo día; no hay validación de terceros ni issues que documenten problemas.
- Fecha de publicación registrada en 2026-10-19: conviene verificar la vigencia y posibles actualizaciones del repositorio antes de basar un trabajo en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Echoo113/Qwen3.5-4B-wolf-STEER0.16875-ft4.42
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio hermano (4B, `immigration_mlpB`, mismo coeficiente): https://huggingface.co/Echoo113/Qwen3.5-4B-immigration_mlpB-STEER0.16875-ft4.43
- Repositorio hermano (2B, `wolf_dose`): https://huggingface.co/Echoo113/Qwen3.5-2B-wolf_dose-STEER0.0797-ft4.42
- Repositorio de TRL: https://github.com/huggingface/trl
- Anuncio oficial de la familia Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Ficha de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:4b
- Ficha de Qwen3.5 en LM Studio: https://lmstudio.ai/models/qwen3.5
