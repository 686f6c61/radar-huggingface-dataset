# ricer0ll/Miko-M7-V3

## Resumen

Miko-M7-V3 es un ajuste fino (fine-tune) del modelo base Mistral-7B-v0.1, desarrollado por el usuario ricer0ll y publicado en Hugging Face. Se trata de la tercera iteración de la familia Miko, en la que el autor vuelve a partir de Mistral 7B tras haber experimentado con otras bases en versiones intermedias. El modelo está orientado a conversación e instrucciones en formato Alpaca, con un énfasis particular en el diálogo estilo chat (roleplay y conversación multi-turno), tal y como refleja el uso de registros de Discord anonimizados en su conjunto de entrenamiento.

La relevancia de este modelo es limitada y muy específica: no es un modelo de propósito general competitivo ni un lanzamiento de un laboratorio, sino un ajuste comunitario de bajo presupuesto (12 horas de entrenamiento en una única RTX 3090 con QLoRA) cuyo interés principal reside en su enfoque de datos y en su formato de plantilla de chat. Con 7.241.732.096 parámetros y un repositorio de 14,5 GB en safetensors, hereda la arquitectura y la ventana de contexto de Mistral 7B, pero no aporta innovaciones técnicas propias ni benchmarks publicados.

Es importante señalar que la información disponible es escasa: el autor no documenta licencia, idiomas soportados ni resultados de evaluación. Cualquier uso en producción debería partir de la validación empírica por parte del usuario y de la comprobación de la licencia heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (MistralForCausalLM), basada en Mistral-7B-v0.1 |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (longitud de secuencia usada en entrenamiento); contexto nativo de Mistral 7B v0.1: 32768 tokens |
| Tipos de cuantización | El modelo se publica en safetensors (probablemente bf16/fp16); admite cuantización posterior a 4/5/8 bits vía GGUF/AWQ/GPTQ, aunque no se documenta oficialmente |
| Idiomas soportados | No disponible (no declarados en la model card) |
| Licencia | No disponible (no declarada; el modelo base Mistral-7B-v0.1 se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 14,5 GB |
| Método de ajuste | QLoRA (4 bits) sobre Mistral-7B-v0.1 |
| Herramienta de entrenamiento | Axolotl |
| Plantilla de chat | Estilo Alpaca (`### Instruction:` / `### Response:`) con soporte de system prompt y modo conversacional |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral 7B v0.1: un transformer decoder-only denso de 7.240 millones de parámetros con atención de ventana deslizante (sliding window attention) y RoPE, sin mezcla de expertos. Miko-M7-V3 no modifica la arquitectura del modelo base; únicamente aplica un ajuste fino supervisado mediante QLoRA con adaptadores de rango 32 (alpha 32, dropout 0) sobre todas las proyecciones lineales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se realizó con Axolotl, `flash_attention_2`, precisión bf16, optimizador AdamW de 8 bits, LR 2e-4 con scheduler coseno, una época, `sample_packing` activado y longitud de secuencia de 8192 tokens.

El conjunto de datos es reducido y de dos fuentes: el dataset filtrado Stheno v1.1 (26.765 filas) y 2.576 filas de registros de chat de Discord anonimizados del propio autor, sumando unas 29.341 filas, notablemente menos que las ~35.000 de la versión V2. Todos los datos se convirtieron a formato OpenAI y se entrenaron con `train_on_eot: turn`. No se documenta ninguna fase de RLHF, DPO ni preferencias; se trata exclusivamente de ajuste supervisado (SFT). El entrenamiento completo consumió 12 horas en una RTX 3090 con underclock y temperatura estable de 60 °C, lo que da una idea del escaso coste computacional del proyecto.

## Capacidades

- Generación de texto conversacional multi-turno, con especial énfasis en diálogo estilo chat y roleplay (el autor menciona explícitamente el uso en el modo Chat de KoboldCPP).
- Seguimiento de instrucciones en formato Alpaca (`### Instruction:` / `### Response:`), incluyendo instrucciones de sistema.
- Capacidad de mantener personajes o roles consistentes a lo largo de una conversación, gracias al entrenamiento con registros de chat.
- Razonamiento básico y respuesta a preguntas generales, heredado del modelo base Mistral 7B.
- Generación de código y matemáticas a nivel básico-intermedio, como capacidad heredada del base, sin ajuste específico documentado.
- Soporte de tool calling / function calling: no documentado; no se ha entrenado explícitamente para ello.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el modelo base Mistral 7B tiene competencia razonable en inglés y otras lenguas europeas, pero el ajuste se realizó con datos mayoritariamente en inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Chat conversacional y roleplay: el modelo está específicamente ajustado con registros de conversación para mantener diálogos coherentes y con personalidad consistente; es su caso de uso principal y el que el autor valida con el ejemplo de KoboldCPP.
- Prototipado rápido de asistentes conversacionales: al ser un modelo de 7B en safetensors, puede desplegarse en una GPU de consumo y sirve para validar flujos de conversación antes de invertir en modelos mayores.
- Generación de personajes para videojuegos o narrativa interactiva: la plantilla de chat y el entrenamiento con logs permiten definir un system prompt con la personalidad del personaje y mantener el rol a lo largo de la sesión.
- Experimentación académica con ajuste fino: el repositorio incluye la configuración completa de Axolotl, lo que lo convierte en un caso de referencia para reproducir un pipeline QLoRA de bajo coste sobre Mistral 7B.
- Asistente de escritura y lluvia de ideas: con prompts de instrucción en formato Alpaca puede generar borradores, resúmenes y variaciones de texto, aunque sin garantías de precisión factual.
- Evaluación comparativa de datasets de instrucción: útil para estudiar el efecto de mezclar un dataset filtrado de alta calidad (Stheno v1.1) con datos conversacionales propios y anonimizados.
- Base para ajustes posteriores: al ser un fine-tune de Mistral 7B, puede servir como punto de partida para nuevos adaptadores LoRA en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14,5 GB de pesos, más overhead de activaciones y caché KV; se recomiendan 16-20 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 8 GB; en 4 bits (GGUF Q4_K_M o similar): en torno a 4,5-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio de alta concurrencia; RTX 4090 (24 GB) para bf16 con contexto largo; RTX 3090 (24 GB) es la GPU usada por el autor para el entrenamiento.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en bf16, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con cuantización a 4-8 bits.
- Opciones de despliegue: vLLM y TGI para safetensors en bf16; llama.cpp y Ollama requieren conversión previa a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Como referencia cualitativa, un 7B denso en una RTX 4090 suele generar decenas de tokens por segundo en bf16, pero no hay datos específicos de este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Miko-M7-V3 | 7,24 B | 8192 (entrenamiento) | QLoRA sobre Mistral 7B v0.1 | No disponible | Hugging Face (ricer0ll/Miko-M7-V3) |
| Mistral-7B-Instruct-v0.1/v0.2 | 7,24 B | 32768 (nativo) | SFT sobre Mistral 7B | Apache 2.0 | Hugging Face (mistralai) |
| Zephyr-7B-beta | 7,24 B | 32768 (nativo) | SFT + DPO sobre Mistral 7B | MIT | Hugging Face (HuggingFaceH4) |
| OpenHermes-2.5-Mistral-7B | 7,24 B | 32768 (nativo) | SFT sobre Mistral 7B | Apache 2.0 | Hugging Face (teknium) |

La comparación es estructural: todos comparten la misma base de 7B parámetros, por lo que la diferencia real está en el conjunto de datos de ajuste, la licencia y la documentación. Frente a Mistral-7B-Instruct, Zephyr-7B-beta u OpenHermes-2.5, Miko-M7-V3 no publica benchmarks ni licencia explícita, lo que limita su adoptación en entornos comerciales frente a alternativas con licencia permisiva y evaluación pública.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones humanas que permitan comparar su calidad objetivamente.
- Licencia no declarada: el modelo base Mistral-7B-v0.1 es Apache 2.0, pero el autor no especifica la licencia del fine-tune; conviene verificar antes de cualquier uso comercial.
- Idiomas no declarados: el ajuste se realizó con datos mayoritariamente en inglés; el rendimiento en castellano no está garantizado y probablemente sea inferior al del modelo base sin ajustar.
- Riesgo de alucinación: al ser un modelo de 7B ajustado con SFT sobre datos conversacionales, puede generar afirmaciones falsas con seguridad aparente, especialmente en dominios factuales.
- Sesgos conocidos: los registros de Discord anonimizados pueden introducir sesgos de estilo, registro coloquial y contenido propio de comunidades específicas; no se documenta ningún filtrado de sesgos.
- Contexto de entrenamiento limitado a 8192 tokens: aunque Mistral 7B soporta hasta 32768, el ajuste se hizo con secuencias de 8192, por lo que el rendimiento más allá de esa longitud no está validado.
- Sin soporte documentado de tool calling ni agentes: no debe asumirse capacidad de function calling en producción.
- Dataset pequeño y de una sola época: el riesgo de sobreajuste a los estilos de los logs de Discord y al dataset Stheno es real; el autor reconoce que los datos de versiones anteriores no estaban del todo limpios.
- Sin garantías de mantenimiento: proyecto personal de un único autor, con 0 descargas y 0 likes en el momento de la consulta; no hay hoja de ruta ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ricer0ll/Miko-M7-V3
- Dataset Stheno v1.1 filtrado: https://huggingface.co/datasets/anthracite-org/stheno-filtered-v1.1
- Modelo base Mistral-7B-v0.1: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Axolotl (herramienta de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Artista de la ilustración de la model card: https://www.fiverr.com/nahraya
