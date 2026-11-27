# richardyoung/granite-4.2-3b-heretic

## Resumen

Granite-4.2-3b-heretic es un ajuste fino (fine-tune) del modelo IBM Granite 4.2 de 3B parámetros, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored": el autor ha aplicado técnicas de modificación de pesos orientadas a eliminar o atenuar los mecanismos de rechazo y alineación de seguridad del modelo original, con el objetivo de obtener un modelo más permisivo en la generación de contenido. El modelo conserva las capacidades del Granite 4.2 base: razonamiento, modo "thinking", tool calling y soporte multilingüe en doce idiomas.

El modelo base, IBM Granite 4.2 3B, es un transformer denso de aproximadamente 3.660 millones de parámetros, diseñado por IBM para cargas de trabajo empresariales con énfasis en eficiencia, instrucciones y agentes. Este fine-tune hereda esa arquitectura y ese tokenizador, y se distribuye en formato safetensors compatible con la librería transformers.

Su relevancia es acotada y de nicho: interesa a investigadores que estudian el efecto de las técnicas de abliteration sobre el comportamiento de modelos alineados, y a desarrolladores que necesitan evaluar diferencias entre un modelo base seguro y su variante modificada. No es un modelo recomendado para producción general sin auditoría previa, dado que la modificación de pesos compromete las salvaguardas originales. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de IBM Granite 4.2) |
| Parametros totales | 3.659.737.600 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint ibm-granite/granite-4.2-3b, un transformer denso de 3,66 mil millones de parámetros. La arquitectura subyacente, el tokenizador y el pipeline de generación son los del modelo base de IBM; el autor no documenta en la información disponible cambios estructurales, sino una modificación de pesos orientada a la "decensura" (abliteration). Este tipo de intervención normalmente identifica direcciones en el espacio de activaciones asociadas al rechazo de peticiones y las proyecta fuera de los pesos, sin reentrenamiento supervisado completo.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicó RLHF, DPO o ajuste supervisado adicional en este fine-tune concreto. Tampoco se documentan innovaciones técnicas propias más allá de la modificación de pesos. El modelo base Granite 4.2 incorpora, según su familia, capacidades de razonamiento y tool calling, pero los detalles de su pipeline de entrenamiento no se incluyen en la información proporcionada.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredadas del Granite 4.2 base.
- Razonamiento con modo "thinking" (etiqueta reasoning en los tags del repositorio).
- Tool calling / function calling, según los tags del modelo.
- Soporte multilingüe en doce idiomas: inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino.
- Generación de código y matemáticas: capacidad esperable del modelo base, aunque no se aportan benchmarks específicos en la información disponible.
- Comportamiento menos restrictivo en cuanto a rechazos, como consecuencia de la modificación de pesos (abliteration).
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar las respuestas del modelo base Granite 4.2 3B con las de esta variante para medir el efecto de la abliteration sobre las tasas de rechazo y la calidad de las respuestas.
- Evaluación de robustez de filtros: usar el modelo como generador adversarial controlado en entornos de prueba para validar clasificadores de contenido y sistemas de moderación.
- Experimentación académica con modelos pequeños: su tamaño de 3,66B permite ejecutar experimentos de interpretabilidad y edición de pesos en una sola GPU, algo inviable con modelos de mayor escala.
- Prototipado de asistentes conversacionales multilingües en entornos de laboratorio, aprovechando el soporte de doce idiomas del modelo base.
- Pruebas de pipelines de tool calling y agentes en fase de investigación, verificando cómo se comporta la variante modificada frente al modelo original en tareas de múltiples pasos.
- Generación de texto creativo sin las restricciones del modelo alineado, en contextos de investigación sobre escritura y estilística donde se quiere estudiar el comportamiento del modelo sin sesgo de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 7,3 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, unos 9-10 GB para contextos moderados.
- Cuantización a 8 bits: en torno a 4 GB de pesos; a 4 bits, en torno a 2-2,5 GB, aunque no se confirman versiones cuantizadas publicadas para este checkpoint.
- GPU consumer: cabe en tarjetas con 12 GB o más en BF16 (RTX 3060 12GB, RTX 4070, RTX 4090); con cuantización a 4 bits podría ejecutarse en GPUs de 6-8 GB.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para este tamaño y permiten alto throughput con lotes grandes.
- Opciones de despliegue: transformers (formato nativo del repositorio); vLLM, TGI, llama.cpp u Ollama requerirían conversión o cuantización previa, no confirmadas en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/granite-4.2-3b-heretic | 3,66B | No disponible | Apache 2.0 | Fine-tune abliterated, acceso restringido |
| ibm-granite/granite-4.2-3b | 3,66B | No disponible | Apache 2.0 | Modelo base alineado, acceso abierto |
| Llama 3.2 3B Instruct | 3,2B | 128K (según ficha oficial de Meta) | Llama 3.2 Community License | Modelo alineado de Meta, licencia con restricciones |
| Qwen2.5 3B Instruct | 3,1B | 32K (según ficha oficial de Qwen) | Apache 2.0 | Alternativa densa de tamaño similar, multilingüe |

La comparación de rendimiento frente a estos modelos no puede establecerse porque no se han publicado benchmarks de esta variante en la información disponible.

## Limitaciones y advertencias

- La modificación de pesos elimina o reduce las salvaguardas del modelo original; puede generar contenido ofensivo, inseguro o inexacto con mayor facilidad.
- Riesgo elevado de alucinación, especialmente fuera de los dominios bien cubiertos por el modelo base.
- No se documentan evaluaciones de sesgo para esta variante; los sesgos del modelo base pueden persistir o amplificarse.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo sin alineación en producción conlleva riesgos legales y reputacionales que deben evaluarse.
- No se confirman versiones cuantizadas ni integraciones con motores de inferencia de alto rendimiento; habría que validarlas antes de desplegar.
- La longitud de contexto no está documentada en la información disponible; no debe asumirse la del modelo base sin verificarla.
- El autor es un particular, no IBM; no hay garantías de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/granite-4.2-3b-heretic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Paper referenciado (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper referenciado (arxiv:2510.18892): https://arxiv.org/abs/2510.18892
