# HungryDino/gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen1

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo multimodal Gemma 3 4B Instruct, publicado por el usuario HungryDino bajo el identificador `gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen1`. Se trata de un artefacto experimental, no de un modelo de propósito general: el nombre sugiere que forma parte de una serie de experimentos sobre "colapso" en tareas numéricas (`numbers-collapse_p10`), con repositorios hermanos como `control_numbers-collapse_p10-gen1` o `control_numbers-self_collapse_p10-gen2`. El modelo se ha entrenado con Unsloth y la librería TRL de Hugging Face, partiendo de `unsloth/gemma-3-4b-it`.

La model card es la plantilla automática de Unsloth y no aporta información sobre datos de entrenamiento, hiperparámetros, composición del dataset ni resultados de evaluación. El repositorio ocupa 0,1 GB, un tamaño muy inferior a los aproximadamente 8 GB que ocuparían los pesos completos de un modelo de 4.000 millones de parámetros en fp16, lo que apunta a que contiene adaptadores (LoRA) o pesos parciales en lugar del modelo completo. Esta circunstancia no se confirma en la documentación disponible.

El interés del modelo es, por tanto, limitado al ámbito de la investigación: sirve como material reproducible para estudiar el efecto de un fine-tune concreto sobre el comportamiento numérico de Gemma 3 4B IT. No cuenta con descargas ni valoraciones, no se ha publicado pipeline de inferencia y no hay evidencia de validación en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3), con atención local de ventana deslizante e intercalado de capas de atención global. Heredada del modelo base; no se detalla en la model card de este fine-tune |
| Parametros totales | Aproximadamente 4.000 millones (heredados de Gemma 3 4B; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens según las especificaciones publicas de Gemma 3 4B; no confirmado para este fine-tune en la informacion disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors). El modelo base admite cuantizaciones GGUF, AWQ y GPTQ generadas por terceros |
| Idiomas soportados | en (declarado en la model card). El modelo base declara soporte para 140 idiomas |
| Licencia | apache-2.0 (declarada en el repositorio). El modelo base Gemma 3 se distribuye bajo los Gemma Terms of Use, lo que genera una posible discrepancia de licencia |
| Formato de pesos | safetensors (repositorio de 0,1 GB, compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card. Por herencia del modelo base `unsloth/gemma-3-4b-it`, se trata de un transformer decoder-only con atención local de ventana deslizante (aproximadamente 1.024 tokens) combinada con capas de atención global intercaladas en una proporción de 5:1, además de un codificador de visión SigLIP para entrada multimodal. La información disponible no permite confirmar dimensiones de capas, número de cabezas ni vocabulario para este artefacto concreto.

El entrenamiento se realizó con Unsloth y TRL, según la propia model card, que se limita a indicar que el modelo se entrenó "2x faster" con esas herramientas. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO u otro tipo de alineación, ni la configuración de LoRA. Tampoco se documenta el procedimiento experimental asociado al sufijo `numbers-collapse_p10-run2-gen1`.

## Capacidades

- Generacion de texto e instrucciones: capacidad heredada del modelo base Gemma 3 4B IT, no verificada en este fine-tune.
- Razonamiento y matematicas: el modelo base tiene capacidad aritmetica basica; el nombre del repositorio (`numbers-collapse`) sugiere precisamente que este experimento estudia una degradacion en tareas con numeros, por lo que su comportamiento en ese dominio es la incognita que el artefacto pretende documentar.
- Codigo: capacidad del modelo base, no evaluada en este fine-tune.
- Vision: el modelo base Gemma 3 es multimodal (texto e imagen); no hay confirmacion de que este fine-tune conserve el codificador de vision ni de que se haya entrenado con imagenes.
- Tool calling / function calling: no disponible; Gemma 3 IT soporta plantillas de conversacion con roles, pero no se documenta soporte de herramientas en este repositorio.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingue: la model card declara unicamente `en`. No hay evidencia de que el fine-tune conserve las capacidades multilingues del modelo base.
- Modo de pensamiento explicito: no disponible.

## Casos de uso

- Reproducibilidad de experimentos de investigacion: el artefacto sirve para replicar el experimento `numbers-collapse_p10` y comparar la generacion 1 con las generaciones posteriores de la misma serie, usando los repositorios hermanos como linea base.
- Analisis de degradacion en tareas aritmeticas: permite medir como un fine-tune corto altera la precision del modelo base en operaciones con numeros, comparando respuestas antes y despues del ajuste.
- Auditoria de artefactos publicados en Hugging Face: util como caso de estudio sobre repositorios sin model card, sin pipeline declarado y sin evaluacion publicada, y sobre los riesgos de reutilizarlos en produccion.
- Generacion de texto controlada con Unsloth: al haberse entrenado con esa libreria, se puede cargar con transformers o TGI para experimentar con adaptadores sobre Gemma 3 4B en un solo GPU de gama consumer.
- Pruebas de cuantizacion: sirve para validar pipelines de conversion a GGUF o AWQ sobre un modelo de 4B y comprobar hasta que punto la cuantizacion agrava o atenua el colapso numerico observado.
- Evaluacion de licencias en cadenas de derivados: caso practico para estudiar la compatibilidad entre una licencia apache-2.0 declarada en el derivado y los terminos del modelo base Gemma.
- Docencia y formacion: ejemplo minimo de fine-tune con TRL y Unsloth para ilustrar como se publica un adaptador y que informacion deberia acompanarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, GSM8K, HumanEval ni de ninguna otra suite, y no hay datos de comparacion con el modelo base o con las generaciones posteriores de la misma serie experimental.

## Requisitos de hardware

- El repositorio pesa 0,1 GB, por lo que no contiene pesos completos. Para ejecutarlo hay que cargar por separado el modelo base `unsloth/gemma-3-4b-it` y aplicar despues el adaptador, lo que implica disponer de espacio para el modelo base completo.
- Modelo base en bf16 o fp16: aproximadamente 8-9 GB de VRAM solo para los pesos, mas el KV cache y el overhead del runtime.
- Cuantizacion de 8 bits: en torno a 4,5-5 GB de VRAM.
- Cuantizacion de 4 bits (por ejemplo Q4_K_M en GGUF): aproximadamente 2,5-3 GB de VRAM, lo que permite ejecucion en GPU consumer con 8 GB o mas.
- KV cache: a longitudes cercanas a 128.000 tokens el coste de memoria crece de forma muy acusada. Como estimacion orientativa a partir de la configuracion de atencion del modelo base, en fp16 podria situarse en el entorno de 15 GB adicionales, por lo que conviene cuantizar el KV cache o reducir la ventana efectiva.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090, L4, L40S o A100 40 GB para el modelo base completo en bf16; para cuantizaciones de 4 bits basta una GPU consumer con 8-12 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiquetado en el repositorio), vLLM, llama.cpp y Ollama si se convierte a GGUF, LM Studio y Unsloth para carga de adaptadores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de modelos de terceros corresponden a sus fichas publicas; los de este artefacto se marcan como no disponibles cuando la informacion no permite afirmarlos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen1 | ~4.000 M (heredados del base) | 128.000 tokens (heredado, no confirmado) | no disponible | apache-2.0 declarada | Hugging Face, 0 descargas, sin evaluacion |
| unsloth/gemma-3-4b-it (modelo base) | ~4.000 M | 128.000 tokens | publicado por Google en la documentacion de Gemma 3 | Gemma Terms of Use | Hugging Face, ampliamente utilizado |
| Qwen3-4B | ~4.000 M | 32.768 tokens nativos, extensible a 131.072 con YaRN | publicado por Alibaba | apache-2.0 | Hugging Face y multiples proveedores |
| Llama-3.2-3B-Instruct | ~3.200 M | 128.000 tokens | publicado por Meta | Llama 3.2 Community License | Hugging Face y multiples proveedores |
| Phi-4-mini | ~3.800 M | 128.000 tokens | publicado por Microsoft | MIT | Hugging Face y multiples proveedores |

## Limitaciones y advertencias

- Model card practicamente vacia: es la plantilla automatica de Unsloth y no documenta dataset, hiperparametros, epocas ni evaluacion.
- Riesgo elevado de comportamiento degenerado: el sufijo `numbers-collapse` sugiere que el experimento busca precisamente provocar o medir un colapso en tareas numericas. No se recomienda su uso en produccion para calculo, contabilidad o cualquier tarea sensible a la aritmetica.
- Alucinacion: sin evaluacion publicada, no hay forma de acotar la tasa de alucinacion ni de compararla con el modelo base.
- Sin soporte declarado mas alla del ingles: la model card solo lista `en`, pese a que el modelo base es multilingue.
- Posible conflicto de licencia: el repositorio declara apache-2.0, pero el modelo base Gemma 3 se distribuye bajo los Gemma Terms of Use, que imponen restricciones de uso comercial y de redistribucion. Conviene verificar la cadena de licencias antes de cualquier uso comercial.
- Contenido incompleto: con 0,1 GB, el repositorio no incluye los pesos completos, por lo que no es autosuficiente y depende de descargar el modelo base.
- Ausencia de validacion de la comunidad: 0 descargas y 0 valoraciones, sin issues ni discusiones que permitan contrastar resultados.
- Metadatos de fecha inusuales: creado y actualizado el 2026-10-08 con 19 segundos de diferencia, lo que sugiere una carga automatizada por lotes de artefactos experimentales.
- Sin soporte: no se declara canal de soporte, mantenimiento ni versionado del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen1
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- Repositorio hermano (control): https://huggingface.co/HungryDino/gemma_3_4b_it-control_numbers-collapse_p10-gen1
- Repositorio hermano (self collapse): https://huggingface.co/HungryDino/gemma_3_4b_it-control_numbers-self_collapse_p10-gen2
- Entrada de directorio de terceros sobre la generacion 2: https://essamamdani.com/ai-models/hf-hungrydino-gemma-3-4b-it-control-numbers-self-collapse-p10-gen2
- Entrada de directorio de terceros sobre la generacion 3: https://essamamdani.com/ai-models/hf-hungrydino-gemma-3-4b-it-control-numbers-collapse-p10-gen3
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Documentacion de TRL: https://huggingface.co/docs/trl
- Gemma (modelo de lenguaje), Wikipedia: https://en.wikipedia.org/wiki/Gemma_(language_model)
