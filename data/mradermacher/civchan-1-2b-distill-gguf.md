# mradermacher/CivChan-1.2B-Distill-GGUF

## Resumen

CivChan-1.2B-Distill-GGUF es una cuantización en formato GGUF del modelo de lenguaje CivChan-1.2B-Distill, realizada por mradermacher. El modelo base, desarrollado por addansee, es un modelo destilado de aproximadamente 1.170 millones de parámetros (1.2B) orientado a conversación en inglés. La versión GGUF permite ejecutar el modelo en entornos locales con recursos limitados mediante motores como llama.cpp, Ollama o LM Studio, sin necesidad de GPU de alta gama.

Esta ficha es relevante para desarrolladores que buscan un modelo pequeño y ligero para tareas de chat o generación de texto en inglés, con la ventaja de poder desplegarse en CPU o GPUs de consumo. La cuantización incluye 12 variantes, desde Q2_K (0.6 GB) hasta f16 (2.4 GB), lo que ofrece flexibilidad para ajustar el equilibrio entre calidad y uso de memoria. Sin embargo, la información pública sobre el modelo base es escasa, por lo que muchos detalles técnicos no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.170.340.608 (1.17B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | other (no especificada) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base CivChan-1.2B-Distill. El nombre sugiere que se trata de un modelo destilado (distillation), probablemente a partir de un modelo de mayor tamano, pero no se confirma el tipo de arquitectura (transformer, MoE, etc.) ni los detalles de entrenamiento (numero de tokens, dataset, metodo de alineacion). La cuantizacion GGUF es de tipo estatica (no imatrix), como indica el README del autor, y se genero a partir de los pesos en formato safetensors del modelo original.

## Capacidades

- Generacion de texto conversacional en ingles.
- Disenado para tareas de chat y dialogo multi-turno (etiqueta "conversational").
- No se documentan capacidades adicionales como tool calling, razonamiento avanzado, soporte de agentes o multimodalidad.
- Al ser un modelo de 1.2B, su capacidad de razonamiento y generacion de codigo es limitada en comparacion con modelos de mayor tamano.

## Casos de uso

- Chatbot local ligero: se puede desplegar en una Raspberry Pi o un portatil sin GPU para mantener conversaciones basicas en ingles, gracias a su tamano reducido y a la disponibilidad de cuantizaciones Q4 que ocupan menos de 1 GB.
- Prototipado rapido de aplicaciones de texto: ideal para probar flujos de generacion de texto o integraciones con frameworks como LangChain antes de escalar a modelos mayores.
- Generacion de respuestas automatizadas en entornos con restricciones de hardware: por ejemplo, en sistemas embebidos o servidores de baja potencia donde un modelo grande no es viable.
- Educacion y experimentacion: util para estudiantes o investigadores que quieran entender el funcionamiento de modelos de lenguaje pequenos y el impacto de la cuantizacion en la calidad.
- Asistente de escritura en ingles: puede sugerir frases o completar textos cortos, aunque con calidad limitada por su tamano.
- Filtrado o preprocesamiento de texto: tareas simples como clasificacion de sentimiento o extraccion de entidades, si se adapta con fine-tuning (requiere acceso al modelo base en safetensors).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README del modelo cuantizado no incluye metricas como MMLU, HumanEval o GSM8K, y no se encontraron datos del modelo base en la ficha proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. Los archivos GGUF van de 0.6 GB (Q2_K) a 2.4 GB (f16). Con Q4_K_M (0.8 GB) se puede ejecutar en GPUs con 2 GB de VRAM o incluso en CPU con RAM suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) o incluso iGPU modernas. Para CPU, se recomienda al menos 4 GB de RAM libre.
- Cabe en GPUs de consumo: si, todas las variantes caben en GPUs de gama baja y media.
- Opciones de despliegue: compatible con llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier motor que soporte GGUF. Tambien se puede usar con vLLM si se convierte a otro formato, aunque no es lo habitual.
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de 1.2B en CPU, se puede esperar una generacion de 5-15 tokens/segundo con cuantizacion Q4, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos similares. No se conocen datos de rendimiento ni caracteristicas de otros modelos de la misma categoria (1B conversacional en ingles) en la documentacion proporcionada.

## Limitaciones y advertencias

- Tamano reducido: al ser un modelo de 1.2B, su capacidad de razonamiento complejo, generacion de codigo y comprension de matices es significativamente menor que la de modelos de 7B o superiores.
- Idioma: solo se ha entrenado para ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Licencia "other": no se especifican los terminos exactos. Es necesario contactar con el autor del modelo base (addansee) para confirmar si permite uso comercial o modificacion.
- Riesgo de alucinaciones: como todos los modelos de lenguaje, puede generar informacion falsa o inventada, especialmente en temas de actualidad o muy especificos.
- Sesgos: no se documentan sesgos conocidos, pero es probable que el modelo herede sesgos del dataset de destilacion (CivChan-Distill), que no esta descrito en detalle.
- Cuantizacion estatica: al no usar imatrix, la calidad de las cuantizaciones de baja precision (Q2, Q3) puede ser inferior a la de otras versiones que si la usan.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/CivChan-1.2B-Distill-GGUF
- Modelo base (safetensors): https://huggingface.co/addansee/CivChan-1.2B-Distill
- Dataset de destilacion: https://huggingface.co/datasets/addansee/CivChan-Distill
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
