# qatfactory/DeepSeek-R1-Distill-Llama-8B-NVFP4-QAD

## Resumen

DeepSeek-R1-Distill-Llama-8B-NVFP4-QAD es una versión cuantizada del modelo DeepSeek-R1-Distill-Llama-8B, un modelo de razonamiento de 8.030 millones de parámetros desarrollado originalmente por DeepSeek a partir de Llama-3.1-8B y destilado con trazas de razonamiento de DeepSeek-R1. Esta variante concreta la publica el usuario qatfactory en Hugging Face y aplica cuantización NVFP4 (formato de 4 bits de NVIDIA) con entrenamiento consciente de la cuantización (QAT, quantization-aware training), empaquetada en formato compressed-tensors para su uso con vLLM.

El modelo base es relevante porque demuestra que es posible transferir capacidades de razonamiento de un modelo grande (DeepSeek-R1, 671B parámetros MoE) a un modelo denso de 8B mediante destilación, manteniendo la cadena de pensamiento (thinking mode) y un rendimiento notable en tareas de matemáticas y código para su tamaño. Esta versión NVFP4 busca reducir el coste de inferencia en hardware NVIDIA Blackwell, que soporta nativamente este formato de 4 bits con escalas por bloque.

La ficha se centra en las características verificables de esta variante cuantizada y de su modelo base. Los datos de benchmarks específicos de esta versión NVFP4 no están disponibles en la información proporcionada; los datos de rendimiento del modelo base se indican cuando se conocen y se marcan como no disponibles cuando no lo están.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de Llama-3.1-8B) con destilación de razonamiento de DeepSeek-R1 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base DeepSeek-R1-Distill-Llama-8B soporta 128K tokens segun su model card original) |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA) con QAT; pesos en compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), libreria vllm |

## Arquitectura y entrenamiento

El modelo base DeepSeek-R1-Distill-Llama-8B es un transformer decoder-only denso de 8.030 millones de parámetros construido sobre la arquitectura Llama-3.1-8B. DeepSeek lo obtuvo mediante destilación supervisada (fine-tuning sobre trazas de razonamiento generadas por DeepSeek-R1), sin RLHF adicional en el modelo destilado. Esta variante de qatfactory aplica cuantización NVFP4 con entrenamiento consciente de la cuantización: durante el proceso de QAT se simula la cuantización a 4 bits para que los pesos aprendan a tolerar el ruido de cuantización, lo que suele mejorar la fidelidad respecto a la cuantización post-entrenamiento (PTQ) a la misma precisión.

NVFP4 es un formato de coma flotante de 4 bits definido por NVIDIA que emplea escalas por bloque (típicamente bloques de 16 elementos con escala FP8 y escala global FP32), diseñado para aprovechar las unidades tensor de las GPU Blackwell. El empaquetado en compressed-tensors permite cargar el modelo directamente en vLLM. No se dispone de información sobre el número de tokens de entrenamiento del QAT, la composición del dataset de calibración ni la metodología exacta empleada por qatfactory.

## Capacidades

- Generación de texto con modo de razonamiento (thinking mode): el modelo base produce cadenas de pensamiento antes de la respuesta final, heredadas de DeepSeek-R1.
- Razonamiento matemático y resolución de problemas de varios pasos, capacidad principal del modelo base destilado.
- Generación y comprensión de código, incluyendo explicación y depuración.
- Razonamiento lógico y respuesta a preguntas de dominio general.
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada; el modelo base hereda el multilingüismo de Llama-3.1, pero no se detalla en esta variante.
- Tool calling / function calling: no confirmado para esta variante; el modelo base no está específicamente entrenado para ello según su documentación original.
- Soporte de agentes y razonamiento multi-paso: parcial, mediante cadenas de pensamiento largas, aunque sin entrenamiento específico de agentes.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de álgebra, cálculo y estadística mostrando el desarrollo paso a paso, útil en herramientas educativas o de verificación de cálculos.
- Generación de código en pipelines de desarrollo: puede integrarse en asistentes de código para completar funciones, explicar fragmentos o proponer correcciones, con la ventaja de un tamaño de 8B que cabe en una sola GPU.
- Despliegue de bajo coste en infraestructura Blackwell: al estar en NVFP4, permite servir el modelo con menor huella de memoria y mayor throughput en GPU NVIDIA de nueva generación, reduciendo el coste por token.
- Análisis y resumen de documentos técnicos largos: gracias al contexto largo heredado del modelo base (hasta 128K tokens según su model card), puede procesar informes o artículos completos.
- Prototipado de sistemas de razonamiento: sirve como banco de pruebas para evaluar cadenas de pensamiento y técnicas de prompting antes de escalar a modelos mayores.
- Investigación en cuantización: útil para estudiar el impacto de NVFP4 con QAT frente a PTQ en tareas de razonamiento, comparando la degradación de precisión.
- Chat de soporte técnico especializado: con fine-tuning adicional podría adaptarse a dominios concretos, aunque el modelo base ya responde con razonamiento estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante NVFP4-QAD. El modelo base DeepSeek-R1-Distill-Llama-8B reporta en su model card original resultados como 50,4 en AIME 2024, 28,0 en MATH-500 y 33,0 en LiveCodeBench, entre otros, pero no se dispone de mediciones de esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6,0 GB en safetensors, por lo que la carga en NVFP4 requiere aproximadamente 6-7 GB de VRAM para los pesos, más overhead de KV cache y activaciones (variable según contexto).
- GPU recomendadas: NVIDIA Blackwell (B200, GB200, RTX 5090) por soporte nativo de NVFP4; en arquitecturas anteriores el formato puede no ser eficiente o no estar soportado por vLLM.
- Cabe en GPU de consumo: sí, en teoría, en RTX 5090 (32 GB) y potencialmente en RTX 5080 (16 GB) para contextos moderados, siempre que el backend soporte NVFP4.
- Opciones de despliegue: vLLM (librería declarada), con soporte de compressed-tensors; llama.cpp y Ollama no soportan NVFP4 de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-8B-NVFP4-QAD (este) | 8,03B | no disponible (base: 128K) | NVFP4 QAT | MIT | Gated en Hugging Face |
| DeepSeek-R1-Distill-Llama-8B (base) | 8,03B | 128K | BF16 | MIT | Abierto en Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | 128K | BF16 | MIT | Abierto en Hugging Face |
| Llama-3.1-8B-Instruct | 8,03B | 128K | BF16 | Llama 3.1 Community | Abierto en Hugging Face |

La ventaja de esta variante frente al modelo base es la reducción de memoria (6 GB frente a ~16 GB en BF16) y el potencial de mayor throughput en Blackwell; la desventaja es la dependencia de hardware específico y la falta de benchmarks publicados que cuantifiquen la pérdida de precisión.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para uso automatizado o en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la degradación de precisión introducida por NVFP4 en tareas de razonamiento; conviene validar en el caso de uso concreto.
- Dependencia de hardware: NVFP4 está optimizado para GPU NVIDIA Blackwell; en otras arquitecturas el rendimiento puede ser inferior o el modelo directamente no cargar.
- Riesgo de alucinación: inherente al modelo base, especialmente en dominios especializados y en cadenas de razonamiento largas donde puede divagar.
- Sesgos: el modelo base hereda sesgos de los datos de entrenamiento de Llama-3.1 y de las trazas de DeepSeek-R1; no se documentan mitigaciones específicas en esta variante.
- Idiomas: no se especifican los idiomas soportados en esta ficha; el modelo base está optimizado principalmente para inglés y chino, con soporte limitado de otras lenguas.
- Tool calling no confirmado: no hay evidencia de entrenamiento específico para function calling, lo que limita su uso en pipelines de agentes que dependan de herramientas.
- Licencia MIT: permisiva para uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de destilación de DeepSeek.
- Modelo con pocas descargas y sin likes: no hay validación comunitaria que respalde su calidad; tratar como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/qatfactory/DeepSeek-R1-Distill-Llama-8B-NVFP4-QAD
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Documentación de vLLM: https://docs.vllm.ai
- Documentación de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Documentación de NVFP4 (NVIDIA): https://developer.nvidia.com/blog/nvfp4-explained/
