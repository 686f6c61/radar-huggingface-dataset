# PandyaJeet/gemma4-e4b-plant-pathology-llamacpp-jetson-setup

## Resumen

Este repositorio no contiene un modelo entrenado, sino el conjunto de scripts, documentación y resultados agregados para desplegar en una Jetson Orin un modelo de visión-lenguaje especializado en patología vegetal. El modelo subyacente es un ajuste fino mediante LoRA sobre `unsloth/gemma-4-E4B-it`, un Gemma 4 de la variante E4B (orientada a eficiencia) en su versión instruction-tuned, del que se ha publicado el adaptador por separado. La tarea es concreta: dada una imagen de hoja de cultivo, devolver un único objeto JSON con evidencia visual, cajas de lesiones en una rejilla 0-1000, especie, diagnóstico entre 15 clases y un resumen inmediato.

El interés práctico está en el pipeline completo hacia edge computing agrícola: fusión del adaptador LoRA con el modelo base, conversión a GGUF, generación del proyector multimodal (mmproj), cuantización y perfiles de ejecución para seis configuraciones de Jetson Orin (Nano 4/8 GB, NX 8/16 GB, AGX 32/64 GB). El autor reporta una precisión de diagnóstico del 60,3 % en Q8_0 y del 55,2 % en Q4_K_M sobre 277 casos reservados, medidas con llama.cpp en un host con RTX 5050.

Conviene ser explícito sobre el estado del proyecto: no se han publicado pesos en este repositorio, la velocidad y el consumo en Jetson están pendientes de medir, y la propia documentación reconoce que la conversión real y las ejecuciones CUDA en Jetson no han sido probadas. Es, por tanto, material de referencia reproducible más que un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (Gemma 4 E4B) con adaptador LoRA; inferencia vía llama.cpp |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 y Q4_K_M documentados; el script `prepare_model.py` acepta el parámetro `--quant` |
| Idiomas soportados | no disponible |
| Licencia | El repositorio no tiene licencia propia; el modelo base declara Apache-2.0 y enlaza los términos de Gemma; adaptador y dataset declaran apache-2.0 en sus propias páginas |
| Formato de pesos | GGUF (generado por el usuario); el repositorio no incluye pesos |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA/PEFT sobre `unsloth/gemma-4-E4B-it`, un modelo multimodal de la familia Gemma 4 en variante E4B. El adaptador se entrenó sobre la copia cuantizada a 4 bits `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, mientras que la fusión para exportación se realiza contra el modelo base en precisión completa. El conjunto de entrenamiento es `PandyaJeet/gemma4-plant-pathology-3k`, con imágenes y filas de chat; no se especifican en la información disponible el número de tokens, la composición detallada del dataset ni si hubo RLHF o DPO.

La innovación técnica del repositorio no está en el modelo sino en el pipeline de despliegue: `prepare_model.py` ejecuta la fusión del adaptador, la conversión a GGUF, la creación del fichero mmproj necesario para la torre visual en llama.cpp y la cuantización, con un modo `--plan` que muestra el plan sin escribir nada. Se incluyen seis perfiles de runtime para las distintas memorias de Jetson Orin y un arnés de evaluación reutilizable (`qeval.py`). El formato de salida está estrictamente constreñido a JSON con cajas en rejilla 0-1000, lo que facilita el parseo posterior.

## Capacidades

- Diagnóstico de enfermedades en hojas de tomate, patata y maíz entre 15 clases cerradas, incluyendo estados sanos y dos clases de guardrail (estrés nutricional/plagas y imagen inválida).
- Localización de lesiones mediante cajas delimitadoras en escala 0-1000 (`lesion_boxes`), con lista vacía para hojas sanas o imágenes inválidas.
- Identificación de especie con nombre común y nombre científico.
- Salida estructurada en JSON estricto, sin texto adicional, lo que permite integración directa en pipelines.
- Evidencia visual textual (`visual_evidence`) y resumen inmediato orientado a acción.
- Razonamiento de descarte (`ruled_out`) para explicitar diagnósticos alternativos considerados.
- Capacidad multimodal imagen-texto heredada del modelo base Gemma 4 E4B.
- No se documentan en la información disponible soporte de tool calling, modo thinking, audio ni capacidades de agente multi-paso.

## Casos de uso

- Triaje de campo en dispositivo edge: el modelo corre en una Jetson Orin montada en un dron o tractor y devuelve un JSON con diagnóstico y cajas de lesiones sin conectividad, usando los perfiles de runtime incluidos para Nano, NX y AGX.
- Preprocesado para sistemas de recomendación de tratamiento: el campo `disease_code` y `status` alimentan directamente una tabla de decisión agronómica que sugiere fungicida o intervención.
- Filtrado automático de imágenes en aplicaciones de captura: la clase `GUARDRAIL_INVALID_IMAGE` y la lista vacía de cajas permiten descartar fotos mal encuadradas antes de enviarlas a un agrónomo.
- Anotación asistida de datasets agrícolas: las cajas en rejilla 0-1000 y la evidencia visual sirven como preanotación que un humano revisa, reduciendo el coste de etiquetado de lesiones.
- Monitorización de parcelas con cámaras fijas: el modelo procesa capturas periódicas y el resumen inmediato se agrega en un panel de incidencia por parcela.
- Investigación reproducible en patología vegetal: el arnés `qeval.py` y los resultados agregados permiten replicar la evaluación con casos reservados propios y comparar cuantizaciones Q8_0 frente a Q4_K_M.
- Despliegue en entornos con memoria limitada: el perfil para Orin Nano 4 GB y la opción Q4_K_M permiten ejecutar el modelo donde no cabría una versión de mayor precisión.

## Benchmarks y rendimiento

Resultados de calidad reportados por el autor sobre 277 casos reservados, con llama.cpp en un host con RTX 5050:

| Modelo | Precisión de diagnóstico |
|---|---|
| Fine-tuned Q8_0 | 60,3 % |
| Fine-tuned Q4_K_M | 55,2 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La velocidad y el consumo energético en Jetson están pendientes: nada se ha medido todavía en hardware Jetson según la propia model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende de la cuantización elegida (Q8_0 o Q4_K_M) y del tamaño del modelo base, que no se detalla.
- Perfiles de despliegue incluidos para seis configuraciones de Jetson Orin: Nano 4 GB, Nano 8 GB, NX 8 GB, NX 16 GB, AGX 32 GB y AGX 64 GB.
- Host de referencia para las mediciones de calidad: RTX 5050 con llama.cpp.
- Cabe en GPU de consumo: sí, según el uso de llama.cpp y cuantizaciones Q4_K_M/Q8_0; no se especifican modelos concretos de GPU de consumo validadas más allá de la RTX 5050 del host de evaluación.
- Opciones de despliegue: llama.cpp (principal, con soporte mmproj para la torre visual); los scripts cubren compilación, verificación, lanzamiento, health check y benchmark en Jetson.
- Latencia y throughput: no disponibles; el recolector de velocidad por dispositivo (`benchmarks/jetson/performance/`) existe pero no se ha ejecutado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, el propio repositorio distingue entre las dos cuantizaciones del mismo modelo:

| Variante | Precisión (277 casos) | Compromiso |
|---|---|---|
| Fine-tuned Q8_0 | 60,3 % | Mayor precisión, mayor uso de memoria |
| Fine-tuned Q4_K_M | 55,2 % | Menor uso de memoria, 5,1 puntos menos de precisión |

Comparativa con alternativas de la misma categoría (otros VLM ajustados para patología vegetal): no disponible.

## Limitaciones y advertencias

- El repositorio no contiene pesos: hay que descargar el adaptador, el modelo base y este setup por separado, y aceptar los términos del modelo base en su página.
- La conversión real y las ejecuciones CUDA en Jetson no han sido probadas según `deploy/jetson/VALIDATION.md`; el pipeline está documentado pero no validado de extremo a extremo en el hardware objetivo.
- Precisión de diagnóstico moderada: 60,3 % en Q8_0 sobre 277 casos reservados implica que aproximadamente cuatro de cada diez diagnósticos fallan; no es adecuado como única fuente de decisión agronómica.
- El espacio de clases está cerrado a 15 categorías y tres cultivos (tomate, patata, maíz); cualquier otra especie o patología cae fuera del dominio y puede producir salidas plausibles pero incorrectas.
- Riesgo de alucinación en los campos de texto libre (`visual_evidence`, `ruled_out`, `immediate_summary`) y en la identificación de especie, no cubiertos por la métrica de precisión de diagnóstico reportada.
- El repositorio no tiene licencia propia; la licencia efectiva depende del modelo base (Apache-2.0 con términos de Gemma enlazados), del adaptador y del dataset, cada uno con su propia página. Verificar antes de uso comercial o de redistribuir salidas.
- Idiomas soportados no documentados; no se garantiza calidad en castellano para los campos de texto generados.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar sesgo hacia las condiciones y cultivos sobrerrepresentados en el dataset de 3.000 ejemplos.
- Los benchmarks de calidad se midieron en un host con RTX 5050, no en Jetson; el rendimiento en el dispositivo objetivo puede diferir.

## Enlaces

- Repositorio de setup en Hugging Face: https://huggingface.co/PandyaJeet/gemma4-e4b-plant-pathology-llamacpp-jetson-setup
- Adaptador LoRA: https://huggingface.co/PandyaJeet/gemma4-e4b-plant-pathology-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/PandyaJeet/gemma4-plant-pathology-3k
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Copia base cuantizada a 4 bits usada en entrenamiento: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
