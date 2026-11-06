# r1dvanteke/nutrina-ai-nutrition-model

## Resumen

Nutrina AI es un modelo de lenguaje especializado en análisis nutricional, desarrollado por el usuario de Hugging Face r1dvanteke. Se trata de un fine-tuning mediante QLoRA sobre Google Gemma-7B-IT, posteriormente fusionado con `merge_and_unload()` para producir un artefacto autónomo sin dependencias de PEFT. El modelo forma parte de una arquitectura híbrida neuro-simbólica en la que el LLM se encarga exclusivamente de la extracción semántica de entidades alimentarias y sus valores nutricionales base, mientras que un middleware en Python con expresiones regulares realiza el escalado matemático determinista.

El problema que aborda es concreto: los transformers, al operar mediante probabilidades de token, fallan de forma sistemática en operaciones aritméticas de escalado (por ejemplo, multiplicar los macros de 100 g de pollo por una porción de 250 g). Nutrina AI delega esa multiplicación a código determinista, de modo que el modelo solo debe devolver los valores base por 100 g o por pieza, y el script aplica el multiplicador extraído de la consulta del usuario.

El modelo tiene 8.537.680.896 parámetros (aproximadamente 8,5 mil millones), se distribuye en formato safetensors con un repositorio de 17,1 GB y se publica bajo licencia Apache 2.0. Está pensado para ejecutarse localmente en CLI sobre macOS o Linux, con `transformers` y `torch` como únicas dependencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-7B-IT), fine-tuning QLoRA fusionado con `merge_and_unload()` |
| Parametros totales | 8.537.680.896 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el autor solo documenta carga en `bfloat16`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Google Gemma-7B-IT, un transformer decoder-only denso de aproximadamente 8,5 mil millones de parámetros. Sobre esa base se aplicó un fine-tuning QLoRA (adaptadores de bajo rango con cuantización) utilizando el dataset `r1dvanteke/usda-fdc-calories-updated`, derivado presumiblemente de la base de datos USDA FoodData Central. Posteriormente, los adaptadores se fusionaron permanentemente en los pesos base mediante `merge_and_unload()`, eliminando la dependencia de la librería `peft` y reduciendo el consumo de VRAM en inferencia.

El entrenamiento está hiper-especializado en una tarea de extracción estructurada: dado un alimento, devolver únicamente calorías, proteínas, grasas y carbohidratos por 100 g o por pieza, en formato de viñetas y sin comentarios adicionales. El autor documenta que la especialización degradó la calidad estructural de las salidas y que Gemma mostró sensibilidad a `repetition_penalty`; la solución aplicada fue eliminar esa penalización, forzar decodificación greedy (`do_sample=False`) y anteponer un system prompt oculto y estricto que restringe el modelo a modo de extracción de datos. La innovación principal no está en el modelo en sí, sino en la arquitectura que lo envuelve: una capa regex de entrada extrae cantidad y unidad, el LLM devuelve valores base y una segunda capa regex aplica el multiplicador y redondea.

## Capacidades

- Extracción de valores nutricionales base (calorías, proteínas, grasas y carbohidratos) para alimentos y platos descritos en lenguaje natural.
- Generación de texto conversacional heredada de Gemma-7B-IT, aunque restringida por el system prompt a modo de extracción.
- Formato de salida en viñetas, diseñado para ser parseado por el middleware regex.
- Comprensión de cantidades y unidades en la consulta del usuario (gramos, piezas, raciones, tazas) mediante la capa regex de entrada.
- Escalado determinista de macros para porciones arbitrarias, ejecutado por Python y no por el modelo.
- Ejecución local en CLI sin servidor web, con `transformers` y `torch` como únicas dependencias.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el autor no especifica idiomas soportados.

## Casos de uso

- **Análisis nutricional de porciones en línea de comandos**: el usuario introduce "250g grilled chicken" y el sistema devuelve los macros escalados exactos. Adecuado porque la capa regex extrae el multiplicador (2,5) y lo aplica sobre los valores base que devuelve el LLM.
- **Integración en aplicaciones de dietética locales**: el modelo puede ejecutarse en el portátil del nutricionista sin conexión a internet, procesando consultas de alimentos y devolviendo valores por 100 g que la aplicación escala según la ración registrada.
- **Preprocesado de registros de ingesta**: en un pipeline de seguimiento calórico, el modelo extrae los macros base de cada alimento descrito en texto libre y el código determinista calcula el total de la comida, evitando errores aritméticos del LLM.
- **Generación de tablas nutricionales normalizadas**: dado un listado de alimentos, el modelo produce entradas homogéneas por 100 g listas para importar en una base de datos o en una hoja de cálculo.
- **Prototipado de asistentes culinarios con control de alucinaciones**: sirve como componente de extracción dentro de un sistema mayor donde la aritmética y la lógica de negocio quedan fuera del modelo, reduciendo el riesgo de cifras inventadas.
- **Validación cruzada de bases de datos nutricionales**: el modelo puede contrastar descripciones de alimentos contra valores de referencia USDA, señalando discrepancias para revisión humana.
- **Educación y demos de arquitecturas neuro-simbólicas**: el repositorio incluye el código CLI completo, lo que lo convierte en un ejemplo didáctico de cómo separar comprensión semántica (LLM) y cálculo determinista (Python).

## Benchmarks y rendimiento

El autor declara las métricas `loss` y `mae` en los metadatos del modelo, pero no publica valores numéricos en la model card. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada en `bfloat16`**: aproximadamente 17 GB solo para los pesos (8,5 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda disponer de 20-24 GB.
- **GPU recomendadas**: A100 40 GB, H100, RTX 4090 (24 GB) para `bfloat16`; RTX 3090 (24 GB) también es viable.
- **Consumer GPU**: cabe en RTX 4090 y RTX 3090 en `bfloat16`. En GPUs de 16 GB (RTX 4080, 4070 Ti Super) requeriría cuantización a 8 bits o 4 bits, no documentada por el autor.
- **Despliegue**: el autor documenta exclusivamente `transformers` con `device_map="auto"` y `torch_dtype=torch.bfloat16`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, aunque al ser un modelo Gemma estándar en safetensors deberían ser compatibles con las herramientas habituales para esa familia.
- **Latencia y throughput**: no disponibles. La decodificación greedy con `max_new_tokens=100` limita la longitud de salida y, por tanto, el tiempo de generación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Nutrina AI (este modelo) | 8,5 B | No disponible | Nutricion (extraccion de macros) | Apache 2.0 | Safetensors |
| google/gemma-7b-it | 8,5 B | No disponible en esta ficha | Proposito general, instrucciones | Gemma Terms of Use | Safetensors |
| Meta Llama 3 8B Instruct | 8 B | 8.192 tokens | Proposito general, instrucciones | Llama 3 Community License | Safetensors, GGUF |
| Mistral 7B Instruct | 7,3 B | 32.768 tokens | Proposito general, instrucciones | Apache 2.0 | Safetensors, GGUF |

La comparación directa con modelos de propósito general es limitada: Nutrina AI está hiper-especializado y su rendimiento fuera de la tarea nutricional no está evaluado. Frente a Gemma-7B-IT, la diferencia principal es el fine-tuning QLoRA fusionado y la restricción de salida; frente a Llama 3 8B y Mistral 7B, ofrece una licencia Apache 2.0 más permisiva que la de Llama 3, pero carece de datos publicados de contexto y benchmarks.

## Limitaciones y advertencias

- **Alcance muy restringido**: el modelo está entrenado para extraer macros base; fuera de esa tarea su comportamiento no está evaluado y probablemente sea deficiente.
- **Riesgo de alucinación en los valores base**: aunque el escalado matemático es determinista, los valores nutricionales por 100 g que devuelve el LLM pueden ser incorrectos o inventados si el alimento no está bien representado en el dataset USDA.
- **Dependencia del middleware**: la precisión del sistema completo recae en la capa regex; consultas con formatos no previstos (unidades compuestas, abreviaturas, idiomas distintos del inglés) pueden producir multiplicadores erróneos.
- **Idiomas no documentados**: no se especifica qué idiomas soporta; el system prompt y los ejemplos están en inglés, por lo que el uso en castellano no está garantizado.
- **Contexto no documentado**: se desconoce la longitud máxima de contexto efectiva tras el fine-tuning.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Gemma-7B-IT está sujeto a los Gemma Terms of Use de Google; el autor no aclara cómo se concilia esa restricción con la licencia declarada.
- **Madurez**: el repositorio tiene 2 descargas y 0 likes en el momento de la consulta, sin publicación de benchmarks ni validación externa; no es recomendable para producción sin evaluación propia.
- **Sesgos**: no documentados; al derivar de Gemma-7B-IT y de la base USDA, puede heredar sesgos del corpus base y limitaciones de cobertura de alimentos no occidentales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r1dvanteke/nutrina-ai-nutrition-model
- Dataset de entrenamiento: https://huggingface.co/datasets/r1dvanteke/usda-fdc-calories-updated
- Modelo base: https://huggingface.co/google/gemma-7b-it
- USDA FoodData Central: https://fdc.nal.usda.gov/
