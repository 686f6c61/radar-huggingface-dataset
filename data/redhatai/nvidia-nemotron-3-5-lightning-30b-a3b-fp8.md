# RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-FP8

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-FP8 es una versión cuantizada a FP8 del modelo nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por RedHatAI el 13 de agosto de 2026. Se trata de un modelo de lenguaje de arquitectura híbrida NemotronH (Mamba-Transformer con mezcla de expertos), con 31.577.940.288 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, tal como indica el sufijo A3B. La cuantización reduce los pesos y activaciones de 16 a 8 bits, recortando a la mitad los requisitos de memoria en GPU y disco y duplicando aproximadamente el rendimiento de las multiplicaciones matriciales en hardware compatible con FP8.

El modelo resuelve el problema de desplegar un modelo de 30B con activación dispersa en infraestructura con memoria limitada, manteniendo la arquitectura original. Al ser una versión cuantizada estática por tensor, está pensada para servir en producción con vLLM, que es el runtime explícitamente soportado en la model card (con backend Mamba FlashInfer, parser de razonamiento nemotron_v3 y parser de tool calling qwen3_coder).

Su relevancia actual radica en la combinación de tres factores: la arquitectura híbrida Mamba-MoE, que reduce el coste de atención en contextos largos; la cuantización FP8 lista para vLLM con receta reproducible de LLM Compressor; y el volumen de descargas (más de 820.000), que indica una adopción amplia como alternativa eficiente al modelo BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronHForCausalLM (híbrida Mamba-Transformer con mezcla de expertos) |
| Parametros totales | 31.577.940.288 |
| Parametros activos | aproximadamente 3.000 millones (sufijo A3B; no se detalla el número exacto de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos y activaciones, esquema estático por tensor); modelo base en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |
| Tamano del repositorio | 32,3 GB |
| Fecha de publicacion | 2026-08-13 |
| Version | 1.0 |
| Desarrollador de la cuantizacion | RedHatAI (modelo base: NVIDIA) |

## Arquitectura y entrenamiento

La arquitectura es NemotronH, una pila híbrida que combina capas Mamba (SSM con convolución y proyecciones) con capas de atención y capas de mezcla de expertos. La model card menciona explícitamente componentes como `conv1d`, `mixer.gate`, `_latent_proj`, `mtp.layers` (multi-token prediction) y `backbone.norm_f`, lo que confirma la presencia de módulos Mamba, compuertas de mezcla, proyecciones latentes y capas de predicción multi-token. Los parámetros activos por token (unos 3B de 31,6B totales) confirman un diseño MoE disperso.

El entrenamiento del modelo base no se documenta en la información disponible: no se especifican el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que sí está documentado es el proceso de cuantización: se aplicó LLM Compressor con un `GPTQModifier` en esquema FP8, usando 512 muestras de calibración de UltraChat 200k (split `train_sft`), longitud máxima de secuencia 2048 y semilla 42. Solo se cuantizan los operadores lineales de los bloques transformer; quedan excluidos `conv1d`, los embeddings, las proyecciones latentes, las compuertas del mixer, las capas MTP, `norm_f` y `lm_head`. La innovación destacable es la preservación en precisión original de los componentes sensibles de la arquitectura híbrida, lo que mitiga la degradación típica de la cuantización en modelos con SSM.

## Capacidades

- Generación de texto conversacional, con plantilla de chat soportada vía `apply_chat_template`.
- Razonamiento explícito: la model card incluye `--reasoning-parser nemotron_v3` en el comando de despliegue, lo que indica soporte de modo de razonamiento estructurado.
- Tool calling y function calling: soportado mediante `--tool-call-parser qwen3_coder` y `--enable-auto-tool-choice` en vLLM.
- Predicción multi-token (capas `mtp.layers`), que puede habilitar decodificación especulativa o generación de varios tokens por paso.
- Procesamiento de secuencias largas gracias al componente Mamba, que evita el coste cuadrático de la atención pura.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles; la model card declara entrada y salida exclusivamente de texto.

## Casos de uso

- Servicio de chat conversacional a gran escala: el modelo puede atender conversaciones multi-turno con un coste de memoria de aproximadamente 32 GB en FP8, lo que permite desplegarlo en una sola GPU de 40 u 80 GB y multiplicar la concurrencia frente al BF16.
- Agentes con tool calling: la combinación de parser `qwen3_coder` y `--enable-auto-tool-choice` en vLLM permite construir agentes que invocan APIs externas, bases de datos o funciones internas dentro de un bucle de razonamiento multi-paso.
- Asistentes de código en IDE o CI/CD: el modelo puede integrarse como backend de autocompletado y generación de parches, con el parser de tool calling habilitado para ejecutar comandos o consultar repositorios.
- Razonamiento con trazas verificables: el parser `nemotron_v3` separa el bloque de pensamiento de la respuesta final, lo que facilita auditar la cadena de razonamiento en aplicaciones de soporte técnico o análisis.
- Procesamiento de documentos largos: la arquitectura Mamba permite manejar contextos extensos con menor presión de memoria KV que un transformer puro, adecuado para resumen y extracción sobre informes o expedientes.
- Despliegue en infraestructura con presupuesto ajustado: al ocupar la mitad que el modelo BF16, permite servir un modelo de 30B con activación de 3B en GPUs de gama数据中心 con FP8 nativo (H100, L40S, H200) sin recurrir a paralelismo tensorial.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir la pérdida de calidad de FP8 frente a BF16 en tareas de razonamiento y código, dado que la receta de calibración es pública y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 32,3 GB, por lo que se necesitan al menos 32-36 GB de VRAM para cargar los pesos FP8, más la caché KV y la caché Mamba. Con `--max-num-seqs 128` y contextos largos, el consumo real puede superar los 48-64 GB.
- GPU recomendadas: H100 (80 GB), H200, L40S (48 GB) y A100 (80 GB). El hardware debe soportar FP8 nativo para aprovechar el doble de throughput en matmul; en GPUs sin FP8 (por ejemplo, A100), la ganancia de velocidad se reduce aunque se mantiene el ahorro de memoria.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) con los pesos FP8 completos. Sería necesario un esquema de cuantización adicional (por ejemplo, INT4 mediante GGUF) no publicado en este repositorio.
- Opciones de despliegue: vLLM es el runtime documentado y recomendado, con flags específicos `--mamba-backend flashinfer`, `--mamba-ssm-cache-dtype float16`, `--enable-mamba-cache-stochastic-rounding`, `--mamba-cache-philox-rounds 5` y `--moe-backend flashinfer_cutlass`. También es cargable con transformers y `compressed_tensors`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numérica. La model card afirma que la cuantización FP8 aproximadamente duplica el throughput de matmul en hardware compatible, sin cifras concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|---|
| RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-FP8 | 31,6B | ~3B | no disponible | FP8 | no disponible | vLLM, transformers |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 31,6B | ~3B | no disponible | BF16 | no disponible | vLLM, transformers |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el modelo base BF16: misma arquitectura y mismos parámetros, pero el doble de tamaño en disco y memoria (aproximadamente 64 GB) y sin aceleración FP8. No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia no está indicada en la información disponible; es imprescindible verificar los términos del modelo base de NVIDIA antes de cualquier uso comercial.
- No se documentan los idiomas soportados ni la calidad en castellano; el rendimiento multilingüe es desconocido.
- No hay datos de benchmarks que permitan cuantificar la degradación de calidad introducida por la cuantización FP8 respecto al modelo BF16.
- La cuantización estática por tensor es más agresiva que esquemas por canal; en tareas sensibles (matemáticas, código de precisión) puede haber pérdida de exactitud no medida.
- El calibrado se realizó con UltraChat, un corpus conversacional en inglés; dominios muy alejados de ese registro (código, documentos técnicos, idiomas distintos) pueden sufrir mayor degradación.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad ni de sesgos.
- El despliegue requiere flags específicos de vLLM y el backend FlashInfer para Mamba; configuraciones alternativas pueden no funcionar o perder rendimiento.
- No cabe en GPUs de consumo de 24 GB; requiere hardware profesional con soporte FP8.
- La fecha de creación (2026-08-13) y la de actualización (2026-11-09) indican un modelo reciente; el ecosistema de herramientas puede no estar completamente maduro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-FP8
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- LLM Compressor (repositorio): https://github.com/vllm-project/llm-compressor
- Dataset de calibración UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Model card del autor: https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-FP8/blob/main/README.md
