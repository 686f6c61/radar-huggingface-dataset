# fbaldassarri/meta-llama_Llama-3.1-8B-Instruct-auto_round-int4-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a 4 bits de `meta-llama/Llama-3.1-8B-Instruct`, el modelo instructivo de Meta publicado en julio de 2024. La cuantización la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.16.0, aplicando la técnica SignRound (weights-only quantization, WoQ) con enteros simétricos de 4 bits y tamaño de grupo 64. El objetivo es reducir el peso del modelo y acelerar la inferencia en hardware Intel (CPU, iGPU Arc y NPU de la serie Core Ultra) manteniendo una precisión cercana al modelo original en bf16.

El modelo base es un transformer decoder-only de 8.000 millones de parámetros con una ventana de contexto nativa de 128.000 tokens, entrenado por Meta con datos multilingües y ajustado con instrucciones y preferencias humanas. Esta versión cuantizada conserva la plantilla de chat original y está pensada para despliegue en entornos con recursos limitados, no para reentrenamiento.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de cuantización reproducible (el autor publica la receta exacta con parámetros de calibración y versiones de librerías); por otro, advierte de que el resultado es un derivado con licencia Llama 3.1 y calidad potencialmente degradada respecto al original, algo que el propio autor reconoce ("slight accuracy drop at W4G64").

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), causal LM |
| Parámetros totales | 8.030 millones (modelo base); 2.046.038.016 según safetensors del repo cuantizado (pesos INT4 empaquetados) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no verificada en esta versión cuantizada) |
| Tipos de cuantización | INT4 simétrica, group size 64, WoQ (SignRound / AutoRound) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th (según model card) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (librería transformers, formato `auto_round`) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con atención causal estándar, 32 capas, dimensión oculta 4096 y 32 cabezas de atención (8 cabezas KV por grupo, GQA), con tokenizer BPE de 128.256 entradas. Meta lo entrenó sobre más de 15 billones de tokens con una mezcla multilingüe, seguido de un pipeline de ajuste supervisado, rechazo de respuestas y DPO (Direct Preference Optimization) para alineamiento instructivo. Estas cifras corresponden al modelo base publicado por Meta y no se repiten en la model card del repositorio cuantizado.

La innovación de este artefacto no está en la arquitectura, sino en el proceso de cuantización. AutoRound aplica un ajuste iterativo de los pesos redondeados para minimizar el error de reconstrucción de las activaciones, con 128 muestras de calibración, 200 iteraciones, longitud de secuencia 512 y batch 4, ejecutado íntegramente en CPU con `torch.bfloat16` durante 42.093 segundos (unas 11,7 horas). El resultado son pesos INT4 simétricos con grupo de 64, empaquetados en safetensors y cargables con `transformers` mediante `AutoModelForCausalLM`. El autor indica aceleraciones de 2-3x y una ligera pérdida de precisión a W4G64.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia (`apply_chat_template`).
- Razonamiento general y respuesta a instrucciones en ocho idiomas declarados (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés).
- Generación de código y matemáticas a nivel del Llama 3.1 8B Instruct original, sujeto a la degradación por cuantización.
- Soporte de tool calling y function calling nativo del modelo base (formato de herramientas de Llama 3.1); no validado específicamente en esta versión cuantizada.
- Capacidad de razonamiento multi-paso y uso como agente, heredada del modelo base.
- No incluye visión, audio ni modo "thinking" explícito.

## Casos de uso

- Despliegue en CPU Intel para asistentes conversacionales internos: el formato INT4 con AutoRound está optimizado para `intel-extension-for-pytorch`, lo que permite servir el modelo en servidores sin GPU dedicada con un consumo de memoria muy inferior al bf16.
- Inferencia en iGPU Intel Arc (por ejemplo Core Ultra 185H): el autor documenta soporte vía `intel-extension-for-pytorch` con aceleración XPU, adecuado para prototipos en portátiles de gama alta.
- Ejecución en NPU Intel (AI Boost de Core Ultra) mediante OpenVINO: útil para aplicaciones de escritorio con requisitos de privacidad, donde el texto no sale del dispositivo.
- Generación de código en pipelines de CI/CD con presupuesto de memoria ajustado: al ocupar aproximadamente 8 GB en disco y menos en RAM al cargar en INT4, puede convivir con otras herramientas en la misma máquina.
- Fine-tuning ligero o evaluación comparativa de técnicas de cuantización: la receta reproducible (versiones fijadas de auto-round, transformers y torch) permite replicar el artefacto y medir la degradación frente al modelo original.
- Investigación académica sobre cuantización WoQ: sirve como punto de comparación frente a GPTQ, AWQ o GGUF Q4_K_M en tareas de razonamiento y generación.
- Chatbot multilingüe de bajo coste para ocho idiomas: adecuado para pruebas de concepto donde el throughput importa más que la fidelidad absoluta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona cualitativamente "2-3X speedup" y "slight accuracy drop at W4G64", sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas con el modelo base.

## Requisitos de hardware

- VRAM/RAM estimada: el repo pesa 8,0 GB en safetensors; en carga INT4 se espera un consumo de aproximadamente 5-6 GB de memoria, más overhead de activaciones y KV cache (no confirmado en la model card).
- GPU recomendadas: no se documentan; el artefacto está orientado a CPU, iGPU Intel Arc y NPU Intel. Para GPU NVIDIA/AMD se requeriría un backend compatible con AutoRound (el autor menciona `--cuda` y `--rocm` solo para el pipeline de cuantización, no para inferencia).
- Consumer GPU: no hay datos de compatibilidad con RTX 4090 u otras; el formato `auto_round` de transformers no es directamente compatible con llama.cpp/Ollama sin conversión a GGUF.
- Opciones de despliegue: `transformers` con `device_map="auto"`; `intel-extension-for-pytorch` para CPU/iGPU; OpenVINO para NPU; text-generation-inference aparece en los tags pero no se detalla configuración.
- Latencia y throughput: no disponibles; el autor solo indica una aceleración de 2-3x frente a bf16 sin especificar hardware ni batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (Llama 3.1 8B Instruct INT4 AutoRound) | 8B (2,05B en safetensors empaquetados) | 128k (heredado) | INT4 gs64 sim, WoQ | Llama 3.1 Community | HuggingFace, 23 descargas |
| meta-llama/Llama-3.1-8B-Instruct (original) | 8B | 128k | bf16/fp16 | Llama 3.1 Community | HuggingFace, ampliamente usado |
| Llama 3.1 8B Instruct GPTQ/AWQ (comunidad) | 8B | 128k | INT4 GPTQ/AWQ | Llama 3.1 Community | Múltiples repos en HuggingFace |
| Llama 3.1 8B Instruct GGUF Q4_K_M (comunidad) | 8B | 128k | Q4_K_M (llama.cpp) | Llama 3.1 Community | Amplia, compatible con Ollama/llama.cpp |

La diferencia clave frente a las alternativas es el backend: AutoRound está optimizado para hardware Intel, mientras que GPTQ/AWQ apuntan a GPU y GGUF a inferencia CPU/GPU vía llama.cpp. No hay datos de rendimiento comparativo publicados para este artefacto concreto.

## Limitaciones y advertencias

- Degradación de precisión reconocida por el autor ("slight accuracy drop at W4G64"); no se cuantifica, por lo que no se puede garantizar paridad con el modelo original en tareas sensibles.
- Riesgo de alucinación inherente al modelo base, potencialmente amplificado por la cuantización a 4 bits.
- Sesgos del Llama 3.1 original (género, etnia, idioma) persisten; no hay evaluación de sesgo específica para esta versión.
- La ventana de 128k tokens es heredada del modelo base y no se ha verificado su comportamiento tras la cuantización; la KV cache a esa longitud puede exceder la memoria disponible en CPU.
- Compatibilidad limitada: el formato `auto_round` requiere `transformers` reciente y no es directamente utilizable en llama.cpp, Ollama o vLLM sin conversión.
- Licencia Llama 3.1 Community: permite uso comercial con restricciones (umbral de 700 millones de usuarios mensuales, obligación de mostrar "Built with Llama", política de uso aceptable); no es una licencia permisiva tipo Apache 2.0.
- El autor declara el artefacto "solo para investigación" en el disclaimer, lo que añade una restricción adicional de uso más allá de la licencia.
- El repositorio tiene muy poca tracción (23 descargas, 0 likes) y no hay validación independiente de su calidad.
- El campo `inference: false` en la model card sugiere que el autor no garantiza la inferencia directa sin configuración adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.1-8B-Instruct-auto_round-int4-gs64-sym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Intel AutoRound (repositorio oficial): https://github.com/intel/auto-round
- Pipeline de cuantización referenciado por el autor: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
