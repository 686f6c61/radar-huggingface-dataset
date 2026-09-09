# RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ4e-text-fp16

## Resumen

Este modelo es una cuantización 4-bit del checkpoint `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, realizada por el usuario `RepublicOfKorokke` con la herramienta oQ (oMLX v0.6.4), que aplica cuantización de precisión mixta. El resultado son pesos en formato MLX safetensors, pensados para ejecutar el modelo en tiempo de inferencia con un footprint reducido, especialmente en entornos Apple Silicon que aprovechan MLX.

El modelo base pertenece a la familia Gemma 4 de Google DeepMind. Según la designación `26B-A4B`, se trata de una arquitectura de tipo MoE (Mixture of Experts): tiene 25.233.141.790 parámetros totales (≈25,2 mil millones), de los cuales aproximadamente 4 mil millones son activos por token. El checkpoint base fue entrenado con Quantization-Aware Training (QAT) y se proporciona como pesos Q4_0 sin cuantizar en media precisión, lo que permite aplicar técnicas de cuantización posteriores como la que se documenta en esta ficha.

La cuantización oQ aplica 4 bits por peso con un group size de 64, y los pesos se almacenan en formato MLX safetensors. No se han publicado resultados de benchmarks en la información disponible. El valor de este modelo radica en su capacidad para reducir el coste de memoria sin salir del ecosistema MLX, lo que lo hace relevante para experimentación e inferencia local en hardware moderado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) según designación A4B de la familia Gemma 4 |
| Parametros totales | 25.233.141.790 (≈25,2B) |
| Parametros activos | ≈4B (según designación A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit oQ (group size 64), pesos base QAT Q4_0 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con capas de tipo Mixture of Experts, como indica el sufijo `A4B` en la nomenclatura de Gemma 4. El checkpoint original fue sometido a Quantization-Aware Training (QAT) para pesos Q4_0, pero en esta variante se extrajeron los pesos en media precisión (fp16) sin cuantizar, de modo que un tercero pudiera aplicar su propia cuantización. Posteriormente, RepublicOfKorokke aplicó la cuantización oQ con 4 bits y group size de 64, generando un modelo en formato MLX safetensors.

No se han proporcionado detalles sobre el dataset de entrenamiento, ni sobre procesos de alineación como RLHF o DPO, en la información disponible. La única innovación técnica documentada es la cuantización de precisión mixta de oQ, que optimiza pesos críticos y menos críticos con distinta granularidad dentro de un mismo modelo.

## Capacidades

La model card del autor no documenta capacidades específicas del modelo. Dado que se trata de una cuantización de `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, se espera que herede las capacidades del modelo base (un modelo instruction-tuned de la familia Gemma 4), pero estas no se han verificado ni documentado en esta ficha. En particular, no hay datos sobre soporte de tool calling, multimodalidad, o soporte de agentes. La información disponible se limita a los detalles técnicos de la cuantización.

## Casos de uso

Los casos de uso no están documentados en la ficha del autor. Los siguientes escenarios son potenciales, derivados de la naturaleza del modelo base (Gemma 4 instruction-tuned), y deben validarse antes de usar el modelo en producción:

- Inferencia en Apple Silicon: al estar en formato MLX safetensors, el modelo puede ejecutarse directamente con oMLX en ordenadores Mac con suficiente memoria unificada.
- Experimentación con técnicas de cuantización: permite comparar el rendimiento de cuantización oQ frente a otras herramientas (llama.cpp, GGUF, etc.) sobre el mismo checkpoint base.
- Investigación sobre modelos MoE: el modelo permite explorar el comportamiento de una mezcla de expertos con 25B totales y 4B activos en entornos locales.
- Asistentes conversacionales: si se confirma que el modelo base mantiene las capacidades de Gemma 4 it, podría usarse en prototipos de chat o sistemas de preguntas y respuestas.
- Generación de texto y razonamiento: el modelo podría emplearse en tareas de análisis de documentos, resumen o generación creativa, sujeto a validación.
- Educación y divulgación: como modelo cuantizado que cabe en hardware moderado, resulta útil para demostraciones de inferencia de grandes modelos en local.

Se recomienda ejecutar pruebas de validación para cada uno de estos casos, ya que la ficha del autor no proporciona confirmación de ninguno de ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos que permitan evaluar el rendimiento real de esta cuantización.

## Requisitos de hardware

- El tamaño del repositorio es de 14,9 GB. Para cargar todos los pesos en memoria de GPU, se estima una necesidad mínima de 15-16 GB de VRAM, a la que debe sumarse la memoria para los activos y la caché KV.
- En dispositivos Apple Silicon, se recomienda un mínimo de 32 GB de RAM unificada para ejecutar el modelo con oMLX, debido al overhead de los expertos activos y la longitud del contexto.
- GPU NVIDIA consumer: una RTX 4090 (24 GB) puede alojar el modelo si la máxima longitud de contexto es moderada. Para contextos largos, se recomiendan GPUs con mayor capacidad o la reducción adicional de la precisión.
- Opciones de despliegue: oMLX (oQ) es la vía principal, al ser el formato MLX safetensors. No se han documentado conversiones a GGUF ni otros formatos, por lo que el despliegue con llama.cpp, vLLM o TGI requeriría una conversión manual previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para establecer una comparativa de rendimiento. La siguiente tabla compara parámetros técnicos con el checkpoint base y con un modelo alternativo de la misma familia, sin valorar resultados empíricos.

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ4e-text-fp16 | 25,2B | ≈4B | no disponible | 4-bit oQ | no disponible | MLX safetensors |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 25,2B | ≈4B | no disponible | QAT Q4_0 (fp16) | no disponible | safetensors |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized-assistant | 25,2B | ≈4B | no disponible | QAT Q4_0 (fp16) | no disponible | safetensors (drafter) |

La comparación se limita a parámetros técnicos, ya que no se dispone de evaluaciones funcionales publicadas.

## Limitaciones y advertencias

- Cuantización no oficial: el modelo fue cuantizado por un tercero y no cuenta con garantías de calidad, soporte ni mantenimiento por parte de Google o de los autores del modelo base.
- Licencia no especificada: la model card no indica la licencia, lo que impide confirmar si el modelo puede utilizarse con fines comerciales o redistribuirse. Se recomienda consultar la licencia del modelo base original.
- Sin resultados de benchmarks: no hay evidencia pública de que la cuantización oQ mantenga el rendimiento del modelo base en tareas de razonamiento, código o matemáticas.
- Posible degradación del rendimiento: la cuantización a 4 bits puede introducir pérdidas de precisión en comparación con los pesos en fp16 del checkpoint original.
- Formato restringido: los pesos están en MLX safetensors, lo que limita el despliegue a entornos compatibles con MLX. Para otros frameworks se requiere conversión manual no documentada.
- Documentación insuficiente: no se detallan idiomas, longitud de contexto ni capacidades, por lo que cualquier uso real requiere validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ4e-text-fp16
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
