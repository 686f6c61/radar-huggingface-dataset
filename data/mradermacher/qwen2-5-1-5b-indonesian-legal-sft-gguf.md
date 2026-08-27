# mradermacher/qwen2.5-1.5b-indonesian-legal-sft-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `zuxler/qwen2.5-1.5b-indonesian-legal-sft`, un fine-tuning supervisado (SFT) de Qwen2.5-1.5B orientado a tareas legales en indonesio. El autor, mradermacher, se encarga de convertir modelos de HuggingFace a formato GGUF para facilitar su ejecución en entornos con recursos limitados, como CPU o GPUs de baja VRAM. La relevancia de esta ficha radica en que permite evaluar rápidamente si un modelo legal especializado de 1.500 millones de parámetros puede desplegarse en infraestructura modesta, manteniendo la licencia Apache 2.0 que autoriza uso comercial.

El modelo base es un transformer decoder de la familia Qwen2, con 1.543.714.304 parámetros totales. Aunque la model card indica el idioma `en`, el nombre del modelo sugiere que el fine-tuning se realizó sobre corpus legales indonesios, por lo que su uso principal sería en ese ámbito. No se especifica la longitud de contexto en la información disponible, aunque Qwen2.5-1.5B soporta hasta 32.768 tokens en su versión original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Qwen2.5-1.5B base: 32.768) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (según model card; el nombre sugiere indonesio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder estándar de la serie Qwen2, con atención causal y capas de normalización RMSNorm. El fine-tuning se realizó mediante aprendizaje supervisado (SFT) sobre datos legales, probablemente en indonesio, aunque no se detallan la composición del dataset ni el número de tokens de entrenamiento. La cuantización es estática, realizada por mradermacher, sin usar imatrix ni weighted quants según la model card. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT.

## Capacidades

- Generación de texto y conversación: al ser un modelo instruct, puede mantener diálogos y responder preguntas, aunque su especialización legal limita su uso general.
- Comprensión de terminología legal: el fine-tuning busca mejorar el desempeño en documentos legales indonesios, aunque no hay benchmarks que lo confirmen.
- Multilingüismo limitado: la model card declara solo `en`, pero el nombre sugiere que el entrenamiento fue en indonesio; no se garantiza soporte para otros idiomas.
- Sin soporte explícito de tool calling, agentes o razonamiento multi-paso: no se menciona en la información disponible, y el tamaño del modelo hace improbable que tenga estas capacidades de forma robusta.

## Casos de uso

- Asistencia legal básica en indonesio: el modelo puede responder preguntas frecuentes sobre leyes o procedimientos, siempre con supervisión humana, dado su tamaño reducido.
- Análisis de contratos simples: extracción de cláusulas o resumen de documentos legales cortos, aprovechando su fine-tuning específico.
- Prototipado de chatbots legales: ideal para pruebas de concepto en entornos con pocos recursos, antes de escalar a modelos más grandes.
- Educación legal: generación de explicaciones simplificadas de conceptos jurídicos para estudiantes o público general.
- Clasificación de textos legales: mediante prompts, puede categorizar documentos por tipo o relevancia, aunque con precisión limitada.
- Despliegue en dispositivos edge: gracias a las cuantizaciones pequeñas (Q2_K de 0,8 GB), puede ejecutarse en Raspberry Pi o portátiles antiguos con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas para tareas legales. El rendimiento real debe evaluarse empíricamente en el dominio legal indonesio.

## Requisitos de hardware

- VRAM estimada: según la cuantización, entre 0,8 GB (Q2_K) y 3,2 GB (f16) para el archivo de pesos. La VRAM adicional depende de la longitud de contexto y del tamaño del lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones Q4_K_M o menores. Una RTX 3060 o superior es suficiente para las versiones más grandes.
- CPU: es viable ejecutar el modelo en CPU con 8 GB de RAM para cuantizaciones Q4_K_M o inferiores, usando llama.cpp u Ollama.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI) con soporte GGUF, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; en una CPU moderna, se esperan decenas de tokens por segundo con cuantizaciones pequeñas, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| zuxler/qwen2.5-1.5b-indonesian-legal-sft (base) | 1,5B | no disponible | Apache 2.0 | safetensors | Legal indonesio |
| mradermacher/qwen2.5-1.5b-indonesian-legal-sft-GGUF (este) | 1,5B | no disponible | Apache 2.0 | GGUF | Legal indonesio (cuantizado) |
| Qwen2.5-1.5B-Instruct-GGUF (oficial) | 1,5B | 32.768 | Apache 2.0 | GGUF | Instrucciones generales |

La principal diferencia con el modelo base es el formato y la cuantización, que reduce el tamaño y permite ejecución en hardware modesto. Frente al instruct general, este modelo está especializado en legal, aunque carece de benchmarks que demuestren una ventaja real.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de 1,5B, es propenso a generar información incorrecta o inventada, especialmente en dominios especializados como el legal. No debe usarse para asesoramiento jurídico real sin verificación humana.
- Idioma ambiguo: la model card declara `en`, pero el nombre sugiere indonesio. Esto puede causar confusión sobre el idioma real de entrenamiento y su capacidad multilingüe.
- Contexto limitado: aunque Qwen2.5-1.5B soporta 32K, no se confirma que el fine-tuning haya preservado esa longitud; es probable que el contexto efectivo sea menor.
- Sin garantías de calidad: al ser una cuantización estática sin imatrix, la pérdida de precisión puede ser mayor que en quants dinámicos, especialmente en las versiones Q2_K y Q3.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en este repo.
- Mantenimiento: el repositorio no muestra actividad reciente (creado en 2026-08-27) y no hay comunidad activa, por lo que el soporte es limitado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/qwen2.5-1.5b-indonesian-legal-sft-GGUF
- Modelo base: https://huggingface.co/zuxler/qwen2.5-1.5b-indonesian-legal-sft
- Página de despliegue en FriendliAI: https://friendli.ai/models/attanmhd/qwen-2.5-1.5b-indonesian-legal-sft
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
