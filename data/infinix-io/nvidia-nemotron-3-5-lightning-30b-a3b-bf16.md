# Infinix-io/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 es un modelo de lenguaje de gran escala desarrollado por NVIDIA Corporation, publicado en Hugging Face a través de la cuenta Infinix-io. Se trata de la versión de precisión completa (BF16) de Nemotron 3.5 Lightning, concebida como los pesos de referencia del modelo y pensada fundamentalmente como punto de partida para personalización: post-entrenamiento (SFT, RL, destilación), adaptación a dominio y generación de variantes cuantizadas o en formato GGUF.

El modelo emplea una arquitectura híbrida de mezcla de expertos (MoE) que intercala capas Mamba-2, capas MoE y capas de atención selectivas. Con 30 000 millones de parámetros totales y solo 3000 millones activos por token, está diseñado para ofrecer un equilibrio entre capacidad y eficiencia computacional. Su ventana de contexto alcanza hasta 1 millón de tokens en despliegues con hardware Blackwell o configuraciones multi-GPU Hopper, aunque en una única H100 de 80 GB se limita a 256K por restricciones de memoria.

Es relevante ahora porque NVIDIA lo publica junto con un ecosistema de decodificación especulativa (DSpark) y variantes optimizadas (NVFP4, GGUF), lo que facilita su despliegue tanto en centros de datos como en dispositivos locales de gama alta. La licencia OpenMDW 1.1 permite uso comercial, y el modelo soporta seis idiomas: inglés, español, francés, alemán, italiano y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Mamba-2 + MoE + Attention |
| Parametros totales | 31 577 937 344 (~30B) |
| Parametros activos | ~3B |
| Longitud de contexto | Hasta 1M tokens (256K en una sola H100 80GB) |
| Tipos de cuantizacion | BF16 (referencia); NVFP4 y GGUF disponibles en releases separados |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida que combina capas Mamba-2 (modelos de espacio de estados) con capas de mezcla de expertos y capas de atención intercaladas. Esta combinación busca reducir el coste computacional de la atención tradicional en contextos largos mediante el componente recurrente de Mamba-2, mientras que las capas MoE aportan capacidad efectiva sin disparar el coste por token gracias a sus 3B parámetros activos. Las capas de atención selectivas permiten mantener la calidad en tareas que requieren recuperación precisa de información dentro del contexto.

Los datos de entrenamiento provienen de los conjuntos `nvidia/nemotron-pre-training-datasets` (con fecha de corte en septiembre de 2025) y `nvidia/nemotron-post-training-v3` (con fecha de corte en mayo de 2026). El periodo de desarrollo del modelo abarca de diciembre de 2025 a mayo de 2026. La model card menciona post-entrenamiento sobre dichos datasets, aunque no detalla el número exacto de tokens de pre-entrenamiento ni la composición porcentual del corpus. Entre las innovaciones destacables figura el soporte de decodificación especulativa DSpark para despliegues de baja concurrencia en centros de datos, así como un modo de razonamiento configurable mediante la plantilla de chat (`enable_thinking=True/False`).

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 1M tokens en hardware adecuado).
- Razonamiento configurable: modo "thinking" activable o desactivable desde la plantilla de chat.
- Generación de código y soporte de lenguajes de programación (el inglés se indica junto a "coding languages").
- Capacidades multilingües en inglés, español, francés, alemán, italiano y japonés.
- Adecuado como base para post-entrenamiento: SFT, RL, destilación y adaptación a dominio.
- Compatible con endpoints (`endpoints_compatible`) según los tags del repositorio.
- Soporte de decodificación especulativa mediante DSpark para acelerar la generación.
- No se especifica en la información disponible soporte explícito de tool calling, function calling, visión o audio.

## Casos de uso

- Personalización mediante SFT y RL: al ser los pesos de referencia en BF16, es el punto de partida idóneo para afinar el modelo en dominios verticales (legal, médico, financiero) sin partir de una cuantización con pérdida de precisión.
- Destilación hacia modelos más pequeños: sus 3B parámetros activos y su arquitectura híbrida lo convierten en un profesor manejable para generar datos sintéticos y destilar conocimiento hacia modelos de menor tamaño.
- Generación de variantes cuantizadas: el release BF16 está pensado explícitamente para producir versiones GGUF, NVFP4 o W4A16 propias, adaptadas a hardware específico.
- Procesamiento de documentos largos: con hasta 1M tokens de contexto en configuraciones Blackwell o multi-GPU Hopper, permite analizar expedientes, contratos o bases de código completas en una sola pasada.
- Investigación y evaluación en precisión completa: útil para reproducir resultados de benchmarks sin el sesgo introducido por cuantizaciones, comparando contra las variantes NVFP4 o GGUF.
- Asistentes conversacionales multilingües: el soporte de seis idiomas y el modo de razonamiento conmutable permiten desplegar un mismo modelo para atención al cliente en distintos mercados europeos y japoneses.
- Despliegue en centros de datos con baja concurrencia: la decodificación especulativa DSpark está orientada a escenarios de baja concurrencia donde prima la latencia por petición sobre el throughput agregado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una gráfica (`accuracy_plot.png`) sin valores numéricos extraíbles en el texto proporcionado, por lo que no se presentan cifras de MMLU, HumanEval, GSM8K ni comparativas cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repositorio ocupa 65,8 GB, por lo que se requiere al menos una GPU de 80 GB para cargar los pesos completos con margen para KV cache.
- GPU recomendadas: NVIDIA Blackwell (GB200, B200), NVIDIA Hopper (H100 80GB, H200) y NVIDIA Ampere (A100 80GB).
- Despliegue en una sola GPU: 1× H100 80GB o 1× A100 80GB, con contexto validado de 256K tokens (limitado por memoria).
- Despliegue multi-GPU: 8× H100 con tensor parallelism (TP8) y expert parallelism (EP) permite alcanzar 1M de tokens de contexto.
- Contexto completo de 1M: validado en GB200 con vLLM (+DSpark), B200 con SGLang y configuraciones 8× H100 con vLLM.
- Cabe en GPU de consumo: no en BF16; para RTX 5090, DGX Spark o RTX 6000 Pro se remite al checkpoint GGUF de `ggml-org`.
- Opciones de despliegue: vLLM (versión recomendada `vllm/vllm-openai:v0.27.1`), SGLang, y GGUF para llama.cpp/Ollama en el release de ggml-org.
- Latencia y throughput: no disponibles en la información proporcionada; la model card menciona DSpark para mejorar la latencia en baja concurrencia pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA Nemotron 3.5 Lightning 30B-A3B (BF16) | ~30B | ~3B | Hasta 1M (256K en 1× H100) | OpenMDW 1.1 | Hugging Face (Infinix-io), variantes NVFP4 y GGUF |
| NVIDIA Nemotron 3.5 Lightning 30B-A3B (NVFP4) | ~30B | ~3B | Igual que BF16 | OpenMDW 1.1 | Hugging Face (nvidia) |
| NVIDIA Nemotron 3.5 Lightning 30B-A3B (GGUF) | ~30B | ~3B | Igual que BF16 | OpenMDW 1.1 | Hugging Face (ggml-org) |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos de otros fabricantes comparables en la misma categoría (MoE de ~30B con ~3B activos), por lo que la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la información disponible; al entrenarse sobre corpus web a gran escala es esperable que herede sesgos presentes en los datos, pero no se documentan evaluaciones específicas.
- Riesgo de alucinación: no cuantificado en la model card; como todo LLM generativo, puede producir información plausible pero incorrecta, especialmente en modo de razonamiento desactivado.
- Limitaciones de contexto: el contexto de 1M tokens solo está validado en hardware Blackwell o configuraciones 8× H100; en una sola H100 80GB se reduce a 256K por límites de memoria.
- Limitaciones de idioma: solo se declaran seis idiomas (en, es, fr, de, it, ja); el rendimiento en otros idiomas no está garantizado ni documentado.
- Restricciones de licencia: OpenMDW 1.1 permite uso comercial según la model card ("ready for commercial use"), pero es una licencia "other" que conviene revisar en detalle antes de producción.
- Precisión completa no optimizada para latencia: el release BF16 está pensado para personalización e investigación; para producción con requisitos de latencia se recomienda la variante NVFP4.
- Fechas de corte: pre-entrenamiento en septiembre de 2025 y post-entrenamiento en mayo de 2026; el conocimiento del modelo no cubre eventos posteriores.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha, alojado en una cuenta de terceros (Infinix-io) y no en la cuenta oficial de NVIDIA; conviene verificar la integridad de los pesos antes de usarlos en producción.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Infinix-io/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante NVFP4 oficial: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Checkpoint GGUF: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Demo de chat en NVIDIA Build: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
- Página para desarrolladores de Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW 1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
