# r1dvanteke/nutrina-ai-qlora-adapter

## Resumen

Nutrina AI es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `google/gemma-7b-it`, desarrollado por el usuario de Hugging Face r1dvanteke. Su propósito es especializar un modelo de lenguaje generalista de 7.000 millones de parámetros en el análisis nutricional: interpretar descripciones de alimentos, predecir macronutrientes, estimar valores calóricos y generar perfiles dietéticos estructurados. El adaptador se publica como pesos PEFT independientes (0,1 GB) que deben cargarse dinámicamente sobre el modelo base.

El modelo se entrena sobre el dataset `r1dvanteke/usda-fdc-calories-updated`, derivado de la base de datos USDA FoodData Central, lo que le da una base factual estructurada para tareas de nutrición. La relevancia práctica del proyecto reside en su enfoque híbrido: el LLM se encarga de la comprensión semántica, clasificación y formateo de la salida, mientras que una capa de expresiones regulares y fórmulas matemáticas externas (implementadas en la CLI que acompaña al modelo) realiza los cálculos deterministas, evitando la conocida debilidad de los LLM en aritmética precisa.

Se trata de un proyecto de nicho, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni model card detallada sobre hiperparámetros de entrenamiento. Es un adaptador ligero y fácil de integrar con `peft` y `transformers`, pero cuya evaluación de calidad queda pendiente de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only (Gemma-7B-IT) |
| Parametros totales | No disponible (el adaptador LoRA ocupa 0,1 GB; el modelo base Gemma-7B-IT tiene 7.000 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (heredada de Gemma-7B-IT: 8.192 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | QLoRA en entrenamiento (4-bit); inferencia en 4-bit o 16-bit segun la model card |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA (Quantized Low-Rank Adaptation) sobre `google/gemma-7b-it`, un transformer decoder-only de 7.000 millones de parámetros. QLoRA congela los pesos del modelo base cuantizados a 4 bits e inyecta matrices de bajo rango entrenables, lo que reduce drásticamente los requisitos de memoria durante el ajuste fino. El repositorio solo contiene los pesos del adaptador (0,1 GB), no el modelo completo; el autor ofrece además una versión fusionada (`r1dvanteke/nutrina-ai-nutrition-model`) para despliegue directo sin `peft`.

Los datos de entrenamiento provienen del dataset `r1dvanteke/usda-fdc-calories-updated`, derivado de USDA FoodData Central. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de hiperparámetros (rango LoRA, alpha, learning rate, épocas) ni si se aplicaron técnicas de alineación como RLHF o DPO. El objetivo declarado es la generación de análisis nutricionales y predicción de macronutrientes. La innovación técnica destacable no está en la arquitectura, sino en el diseño del sistema: el modelo no calcula cifras exactas por sí mismo, sino que produce salidas estructuradas que una capa externa de regex y fórmulas matemáticas parsea y recalcula para garantizar precisión computacional.

## Capacidades

- Generación de texto e interpretación semántica de descripciones de alimentos en lenguaje natural.
- Predicción de macronutrientes (proteínas, grasas, carbohidratos) y valores calóricos a partir de descripciones textuales.
- Generación de perfiles dietéticos detallados y salidas en formatos estructurados (JSON o plantillas) aptas para parseo automático.
- Clasificación de alimentos y categorización nutricional.
- Escalado de porciones y cálculo de ratios de macronutrientes (delegado a la capa externa de fórmulas del CLI).
- Soporte de instrucciones estrictas y formatos de salida consistentes, heredado de Gemma-7B-IT.
- Capacidades multilingües: no documentadas específicamente para el adaptador; las del modelo base no se confirman en la model card.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Análisis nutricional de recetas: el usuario describe los ingredientes y cantidades de una receta y el modelo extrae cada alimento, estima sus macros y devuelve una salida estructurada que la capa de regex y fórmulas convierte en totales calóricos exactos. Adecuado por su entrenamiento sobre USDA FoodData Central.
- Aplicaciones de seguimiento dietético: integración en apps de registro de comidas donde el usuario escribe "un plato de lentejas con chorizo" y el sistema obtiene una estimación de calorías y macros. El modelo se encarga de la interpretación semántica y el formateo; el cálculo determinista se externaliza.
- Etiquetado nutricional asistido: generación de borradores de información nutricional para productos a partir de su descripción, con revisión humana posterior. Útil por la estructura de salida consistente que facilita el parseo.
- Herramientas CLI de análisis rápido en terminal: el autor incluye una CLI específica para inferencia nutricional, pensada para desarrolladores que quieran consultar valores nutricionales sin salir del entorno de línea de comandos.
- Educación nutricional y chatbots especializados: un asistente conversacional que responde preguntas sobre composición de alimentos, apoyado en el conocimiento estructurado del dataset USDA.
- Preprocesado de datos alimentarios: normalización y clasificación de descripciones de alimentos heterogéneas en categorías y perfiles nutricionales estructurados para pipelines de datos.
- Prototipado de investigación en dominios especializados: ejemplo de adaptación QLoRA de bajo coste (0,1 GB de adaptador) sobre un modelo de 7B para un dominio vertical concreto, reutilizable como plantilla metodológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara las métricas `loss` y `mae` como métricas de entrenamiento, pero no proporciona valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, pero requiere cargar el modelo base Gemma-7B-IT completo para inferencia.
- VRAM estimada para el modelo base en FP16: en torno a 14-16 GB (7.000 M de parámetros a 2 bytes por parámetro, más overhead de activaciones y caché KV).
- VRAM estimada en cuantización 4-bit: en torno a 5-6 GB, lo que permite ejecución en GPUs de consumo con 8 GB o más.
- GPU recomendadas: A100 o H100 para despliegue de producción con concurrencia; RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090 (24 GB) igualmente viable; RTX 4060 Ti de 16 GB o RTX 4070 de 12 GB para cuantización 4-bit.
- Cabe en GPU de consumo: sí, en cuantización 4-bit en GPUs con 8 GB o más; en FP16 requiere 16 GB o más.
- Opciones de despliegue: `transformers` + `peft` (según la model card), versión fusionada para despliegue directo, y potencialmente vLLM, TGI o llama.cpp si se convierte la versión fusionada a los formatos correspondientes (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nutrina AI (este adaptador) | 7.000 M (base) + LoRA | No disponible (base: 8.192) | Nutricion (USDA) | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-7b-it | 7.000 M | 8.192 | Generalista | Gemma Terms of Use | Hugging Face, ampliamente usado |
| Meta Llama 3.1 8B Instruct | 8.000 M | 128.000 | Generalista | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| Mistral 7B Instruct | 7.000 M | 32.000 | Generalista | Apache 2.0 | Hugging Face, ampliamente usado |

La comparación directa con modelos generalistas no es del todo justa: Nutrina AI es un adaptador de dominio específico y no compite en benchmarks generales. Frente a los generalistas, su ventaja es la especialización en nutrición y el formato de salida estructurado; su desventaja es la ausencia de evaluación pública, la dependencia de una capa externa para los cálculos y un ecosistema de uso prácticamente nulo. No se dispone de comparativas con otros adaptadores nutricionales publicados.

## Limitaciones y advertencias

- No hay benchmarks publicados ni evaluación independiente: la calidad real del adaptador es desconocida.
- El modelo no calcula con precisión por sí mismo; requiere la capa externa de regex y fórmulas del CLI para obtener cifras exactas. Usarlo sin esa capa puede producir errores aritméticos.
- Riesgo de alucinación en alimentos no representados en el dataset USDA o en descripciones ambiguas; las estimaciones deben tratarse como orientativas.
- La model card no documenta los idiomas soportados; el adaptador se entrenó presumiblemente con datos en inglés (USDA), por lo que el rendimiento en castellano no está verificado.
- Sesgos potenciales derivados de la base USDA: sobrerrepresentación de alimentos del mercado estadounidense y posible infrarrepresentación de cocinas de otras regiones.
- No recomendado para uso clínico, dietético profesional o decisiones médicas sin supervisión de un especialista.
- Licencia Apache 2.0 para el adaptador, pero el uso del modelo base Gemma-7B-IT está sujeto a los Gemma Terms of Use de Google, que deben respetarse en despliegues comerciales.
- Proyecto con cero descargas y sin mantenimiento documentado; riesgo de abandono y falta de soporte.
- No hay información sobre tool calling, agentes ni integración con frameworks de orquestación.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/r1dvanteke/nutrina-ai-qlora-adapter
- Modelo fusionado: https://huggingface.co/r1dvanteke/nutrina-ai-nutrition-model
- Dataset de entrenamiento: https://huggingface.co/datasets/r1dvanteke/usda-fdc-calories-updated
- Modelo base: https://huggingface.co/google/gemma-7b-it
- USDA FoodData Central: https://fdc.nal.usda.gov/
- Repositorio PEFT: https://github.com/huggingface/peft
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
