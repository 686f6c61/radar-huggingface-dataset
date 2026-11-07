# adityag-india/gemma4-e2b-medical-multiseed

## Resumen

Gemma 4 E2B - multi-seed es un artefacto de experimentación publicado por el usuario adityag-india en Hugging Face. No se trata de un modelo base entrenado desde cero, sino de un repositorio que contiene el código, la configuración y los adaptadores LoRA resultantes de un experimento de ajuste fino (QLoRA) sobre un modelo Gemma 4 de la familia E2B, orientado a datos de chat médico en formato JSONL (pares `user -> assistant`). El autor lo describe como un experimento multi-seed reproducible sobre RunPod con una RTX A6000 de 48 GB, PyTorch 2.8 y CUDA 12.8.

El valor técnico del repositorio reside en su infraestructura de validación: el pipeline incluye etapas de preflight, "model gate", smoke test, entrenamiento por semilla y agregación de resultados, con comprobaciones que abortan antes de consumir tiempo de GPU (verificación de kernels reales, comprobación de la plantilla de chat, conteo de claves K/V, flujo de gradiente y memoria pico). El autor documenta explícitamente que cada fallo conocido del modelo Gemma 4 tiene una guarda asociada.

La información pública disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y la model card no incluye resultados de benchmarks ni métricas finales de evaluación. El tamaño del repositorio es de 2,2 GB, coherente con adaptadores LoRA y artefactos de salida más que con pesos completos del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, checkpoint de nivel superior `gemma4` con módulos de audio/visión desactivados durante el ajuste) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la configuración de entrenamiento usa `max_length` de 1536 tokens) |
| Tipos de cuantización | NF4 de 4 bits con doble cuantización (bitsandbytes) para el ajuste; los adaptadores se publican en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA; el repositorio pesa 2,2 GB) |

## Arquitectura y entrenamiento

El ajuste se realiza sobre un checkpoint Gemma 4 de nivel superior con los módulos de audio y visión desactivados, de modo que solo se entrena el modelo de lenguaje. Se emplea QLoRA con cuantización NF4 de 4 bits y doble cuantización, cómputo en BF16 y checkpointing de gradiente con `use_reentrant=False`. Los adaptadores LoRA tienen rango 32, alpha 64 y dropout 0,05, y se aplican únicamente a las siete proyecciones del modelo de lenguaje (q, k, v, o, gate, up, down), con rutas exactas `*.language_model.*` verificadas en la etapa de model gate.

El entrenamiento usa un bucle personalizado en lugar de `Trainer`, con micro-batch de 4 y acumulación de gradiente de 2 (batch efectivo de 8), longitud máxima de 1536, AdamW, scheduler coseno con warmup del 3 por ciento expresado como número entero de pasos, learning rate de 1e-4, weight decay 0 y clipping de 1,0. La pérdida se calcula de forma exacta en tokens sobre toda la ventana de acumulación (suma de NLL dividida por el total de tokens supervisados). Se supervisan el contenido del asistente y el token `<turn|>`, pero no el salto de línea posterior, verificado contra la plantilla de chat real de Gemma 4.

El experimento se ejecuta por defecto con 5 semillas (42, 1337, 2024, 3407, 31337), 10 épocas por semilla, y la semilla controla la inicialización de LoRA, el dropout y el orden de los datos (con un `data_order_seed` separado para congelar el orden si se desea). La validación se realiza cada época: `adapter_best` corresponde a la menor pérdida de validación y `adapter_last` a la época 10, sin early stopping. Los datos de test solo se tocan en `evaluate.py`, en un proceso separado por semilla. Los resultados no son reproducibles bit a bit por el uso de kernels BF16 y de 4 bits, aunque las particiones, el commit del modelo, los hiperparámetros y el código son idénticos entre semillas. La agregación rechaza mezclar semillas ejecutadas con configuraciones distintas.

## Capacidades

- Generación de texto conversacional en dominio médico, ajustada sobre pares `user -> assistant` de datos de chat-SFT.
- Razonamiento y respuesta multi-turno en formato de chat, condicionado a la plantilla de Gemma 4 verificada en el pipeline.
- Ajuste eficiente en memoria mediante QLoRA NF4, apto para GPUs de 48 GB y, según el autor, reproducible en una L4 de 22 GiB con micro-batch 1 y acumulación 8.
- Evaluación cuantitativa de la calidad del ajuste mediante pérdida de test, perplejidad, precisión por token y ROUGE-1/2/L sobre generación greedy en un subconjunto fijo de 200 ejemplos.
- Comparación contra el modelo base sin adaptar (`--with-base`) para la primera semilla.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible; el pipeline desactiva explícitamente audio y visión.

## Casos de uso

- Investigación sobre estabilidad del ajuste fino: el pipeline multi-seed permite medir la varianza de la pérdida de validación y de ROUGE entre inicializaciones de LoRA, con intervalos de confianza al 95 por ciento agregados en `summary.json`.
- Reproducción de experimentos QLoRA en GPUs de consumo profesional: la configuración documentada (micro-batch 1, acumulación 8) está pensada para ejecutarse en una L4 de 22 GiB, lo que facilita replicar el estudio sin hardware de centro de datos.
- Desarrollo de asistentes de chat médico experimentales: los adaptadores se entrenan sobre datos de conversación clínica en formato JSONL, útiles como punto de partida para prototipos de triaje o respuesta a preguntas frecuentes, siempre con supervisión humana.
- Auditoría de pipelines de entrenamiento: las etapas de preflight y model gate (verificación de kernels, conteo de claves K/V, comprobación de que solo los parámetros LoRA son entrenables, NLL base menor de 6 nats por token) sirven como plantilla de validación para otros proyectos de ajuste.
- Evaluación comparativa base versus adaptado: el flag `--with-base` permite cuantificar la ganancia del ajuste en pérdida y ROUGE sobre el mismo conjunto de test, útil para decidir si el ajuste aporta valor frente al modelo original.
- Docencia y formación en ajuste eficiente: el repositorio incluye scripts separados por etapa (`stage0_preflight.py`, `stage1_model_gate.py`, `train_seed.py`, `evaluate.py`, `aggregate.py`) que ilustran un flujo completo de QLoRA con guardas de error documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe la metodología de evaluación (pérdida de test, perplejidad, precisión por token, ROUGE-1/2/L sobre 200 ejemplos) y los artefactos de salida (`results_per_seed.csv`, `summary.json`, `summary.md`), pero no incluye los valores numéricos obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio contiene adaptadores LoRA, no pesos completos; el modelo base Gemma 4 E2B debe descargarse por separado.
- Entrenamiento documentado: RTX A6000 de 48 GB en RunPod con la plantilla PyTorch 2.8.0; el autor indica que la misma configuración de optimización se ejecutó en una L4 de 22 GiB con micro-batch 1 y acumulación 8.
- El preflight exige un mínimo de 20 GiB de GPU y realiza una sonda de kernels reales (matmul, SDPA, bitsandbytes NF4 en forward y backward) antes de descargar aproximadamente 10 GB de pesos.
- Si cabe en GPU de consumo: no confirmado en la información disponible; la referencia más baja citada es una L4 de 22 GiB, no una GPU de consumo doméstico.
- Opciones de despliegue: el pipeline está diseñado para PyTorch con transformers (versión mínima 5.5), bitsandbytes y PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El smoke test imprime una estimación de tiempo de ejecución medida, pero no se publica el valor.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto, rendimiento ni licencia del modelo base Gemma 4 E2B, ni de alternativas comparables, por lo que no es posible construir una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio, lo que impide determinar si el uso comercial de los adaptadores está permitido; además, los términos del modelo base Gemma 4 podrían imponer restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni idiomas especificados; es un artefacto de experimentación, no un modelo validado para producción.
- No se publican métricas finales de evaluación ni resultados de benchmarks, por lo que no hay evidencia cuantitativa del rendimiento del ajuste.
- El dominio es médico: existe riesgo de alucinación con consecuencias potencialmente graves; cualquier uso en contexto clínico requiere supervisión de profesionales sanitarios y no debe emplearse como dispositivo médico.
- Los resultados no son reproducibles bit a bit por el uso de kernels BF16 y de 4 bits, aunque la configuración sea idéntica entre semillas.
- El ajuste desactiva audio y visión, de modo que los adaptadores no aportan capacidades multimodales aunque el modelo base las tenga.
- Los datos de entrenamiento no se describen en cuanto a composición, procedencia ni sesgos, lo que impide evaluar sesgos demográficos o lingüísticos.
- La longitud de contexto efectiva del ajuste es de 1536 tokens; no se documenta la ventana nativa del modelo base.
- El pipeline exige versiones concretas (transformers 5.5 o superior, torch 2.8, CUDA 12.8) y aborta si no se cumplen, lo que limita su portabilidad a otros entornos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/adityag-india/gemma4-e2b-medical-multiseed
- No se han encontrado otros enlaces (papers, blogs, repositorios de código o demos) en la información disponible.
