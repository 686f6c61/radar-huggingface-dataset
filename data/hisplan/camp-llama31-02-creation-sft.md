# hisplan/camp-llama31-02-creation-sft

## Resumen
`hisplan/camp-llama31-02-creation-sft` es un ajuste fino (SFT) de tipo QLoRA sobre `unsloth/Meta-Llama-3.1-8B`, desarrollado por el usuario hisplan en el marco de un taller educativo ("mini-llm-camp"). Se trata de la segunda etapa de una cadena de adaptaciones: parte de un modelo ya fusionado en la etapa 01 (`hisplan/camp-llama31-01-ko-alpaca`) y se entrena sobre 152 pares de preguntas-respuestas centrados en la temática "creación-evolución", con el objetivo declarado de responder desde una perspectiva creacionista sin necesidad de system prompt.

El modelo hereda la arquitectura transformer densa de Llama 3.1 8B (8.000 millones de parámetros, contexto nativo de 128.000 tokens), pero el ajuste se ha realizado con un volumen de datos extremadamente reducido (152 ejemplos de entrenamiento y 17 de evaluación, 3 épocas). El resultado es un artefacto de experimentación docente, no un modelo de propósito general: el propio autor lo etiqueta como educativo y advierte explícitamente contra su uso como fuente de información factual.

Su relevancia es, por tanto, limitada al ámbito del taller que lo produce y al estudio de pipelines de fine-tuning ligero con Unsloth. No aporta innovaciones arquitectónicas ni benchmarks publicados, y su licencia derivada de Llama 3.1 condiciona cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1 8B; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el entrenamiento usó QLoRA, pero no se listan cuantizaciones publicadas) |
| Idiomas soportados | coreano (ko), según la model card y los tags |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |
| Modelo base | unsloth/Meta-Llama-3.1-8B |
| Etapa previa | hisplan/camp-llama31-01-ko-alpaca (fusionada) |
| Formato de prompt | Alpaca con 4 espacios finales en el preámbulo |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Meta Llama 3.1 8B: un transformer decoder-only denso con atención por grupos (GQA), activación SwiGLU, RoPE y contexto nativo de 128.000 tokens. Sobre esa base se aplicó un ajuste QLoRA (cuantización de 4 bits del modelo base durante el entrenamiento) con los siguientes hiperparámetros declarados: rango LoRA 16, alpha 16, learning rate 2e-4, 3 épocas, batch efectivo de 4 (batch 1 con acumulación de gradiente 4) y semilla 3407. El conjunto de entrenamiento consta de 152 pares de preguntas-respuestas sobre "creación-evolución" y 17 de evaluación.

El punto de partida no es el modelo base puro, sino la fusión de la etapa 01 (`camp-llama31-01-ko-alpaca`), de modo que este adaptador se suma a un ajuste previo orientado al coreano con formato Alpaca. No se documenta el número de tokens de entrenamiento, la composición del dataset más allá del recuento de pares, ni si hubo etapas de RLHF/DPO. Tampoco se describen innovaciones técnicas propias: el interés metodológico reside en el uso de Unsloth para QLoRA y en la disciplina de mantener exactamente el mismo formato de prompt que la etapa anterior (incluidos los cuatro espacios finales del preámbulo).

## Capacidades
- Generación de texto en coreano, condicionada al formato Alpaca de instrucción-respuesta.
- Respuesta a preguntas sobre temática "creación-evolución" desde una perspectiva creacionista, sin necesidad de system prompt.
- Continuidad del estilo y formato aprendidos en la etapa 01 (coreano, estructura Alpaca).
- Herencia potencial de capacidades generales del modelo base (razonamiento, código, matemáticas), aunque no se documenta su preservación tras el ajuste.
- Soporte de tool calling / function calling: no documentado; no se garantiza tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso
- Docencia sobre pipelines de fine-tuning: el modelo sirve como ejemplo reproducible de QLoRA con Unsloth sobre Llama 3.1 8B, con hiperparámetros y semilla documentados para replicar el experimento en el aula.
- Estudio de encadenamiento de adaptadores: permite analizar cómo se comporta un segundo SFT sobre un modelo previamente fusionado (etapa 01), útil para investigar olvido catastrófico con datasets minúsculos.
- Evaluación de formato de prompt estricto: su dependencia de un formato Alpaca con espaciado exacto lo convierte en un caso práctico para probar robustez de plantillas en pipelines de inferencia.
- Demostración de sesgos ideológicos en modelos ajustados: útil en investigación sobre cómo un SFT pequeño puede orientar la postura del modelo en temas controvertidos (creacionismo frente a evolución).
- Prototipado de asistentes temáticos de nicho: como prueba de concepto de un chatbot acotado a un dominio concreto, siempre que no se requiera precisión factual.
- Pruebas de infraestructura de despliegue: al ser un modelo de 8B en safetensors, sirve para validar configuraciones de vLLM, TGI o llama.cpp antes de pasar a modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB de pesos, más overhead de activaciones y KV cache; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB; en 4 bits (GGUF/AWQ/GPTQ): en torno a 5-6 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX A6000; para cuantización 4/8 bits, RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en 4-8 bits con contextos moderados; en GPUs de 8-12 GB solo con cuantización agresiva y contexto reducido.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI, llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| hisplan/camp-llama31-02-creation-sft | 8B | 128k (heredado) | ko | Llama 3.1 Community | SFT educativo sobre 152 pares; sin benchmarks |
| unsloth/Meta-Llama-3.1-8B (base) | 8B | 128k | multilingüe | Llama 3.1 Community | Modelo base sin ajuste temático; con benchmarks públicos de Meta |
| hisplan/camp-llama31-01-ko-alpaca | 8B | 128k (heredado) | ko | Llama 3.1 Community | Etapa previa del mismo taller; formato Alpaca en coreano |
| Meta-Llama-3.1-8B-Instruct | 8B | 128k | multilingüe | Llama 3.1 Community | Variante instruct oficial, con RLHF; referencia habitual para comparar SFTs comunitarios |

## Limitaciones y advertencias
- Modelo educativo y experimental: el propio autor desaconseja usarlo como fuente de información factual.
- Riesgo elevado de alucinación: puede inventar cifras, fechas y resultados de investigación con un tono convincente, según advierte la model card.
- Sesgo ideológico deliberado: el ajuste busca respuestas desde una perspectiva creacionista, lo que introduce una orientación no neutral en temas científicos.
- Dataset minúsculo (152 ejemplos, 3 épocas): alta probabilidad de sobreajuste y de degradación de capacidades generales del modelo base.
- Dependencia estricta del formato Alpaca con cuatro espacios finales en el preámbulo; desviaciones del formato pueden degradar las respuestas.
- Cobertura lingüística limitada al coreano según la model card; el rendimiento en castellano no está documentado.
- Licencia Llama 3.1 Community: impone restricciones y obligaciones (atribución "Built with Llama", política de uso aceptable) para uso comercial; revisar el archivo LICENSE del repo.
- Sin benchmarks publicados ni métricas de evaluación más allá del conjunto de 17 ejemplos del taller.
- Sin cuantizaciones oficiales publicadas (solo safetensors), lo que limita el despliegue directo en entornos de baja VRAM sin conversión previa.

## Enlaces
- Hugging Face: https://huggingface.co/hisplan/camp-llama31-02-creation-sft
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B
- Etapa previa: https://huggingface.co/hisplan/camp-llama31-01-ko-alpaca
- Meta Llama 3.1 (modelo original): https://huggingface.co/meta-llama/Llama-3.1-8B
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
