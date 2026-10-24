# rghosh8/DeepSeek-R1-Distill-Qwen-1.5B_ckpt_SFT_baseline_arc_seed3407

## Resumen

`DeepSeek-R1-Distill-Qwen-1.5B_ckpt_SFT_baseline_arc_seed3407` es un ajuste fino por supervisión (SFT) del modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicado por el usuario `rghosh8` en HuggingFace. Se trata de un artefacto de investigación más que de un modelo listo para producción: el propio nombre codifica la configuración experimental («ckpt», «SFT_baseline», «arc», «seed3407»), lo que sugiere un checkpoint de referencia (baseline) entrenado sobre la tarea ARC con la semilla 3407, presumiblemente para comparar contra otras variantes dentro de un estudio de ablación.

El modelo conserva la arquitectura del original: un transformer decoder-only de la familia Qwen2 con 1.777.088.000 parámetros totales según los pesos en safetensors. El repositorio ocupa 7,1 GB, un tamaño notablemente superior a los ~3,5 GB que requerirían los pesos en FP16, lo que apunta a que el checkpoint almacena pesos en fp32 o incluye estados adicionales del entrenamiento.

Su relevancia es limitada fuera del contexto del experimento que lo generó: no tiene descargas ni interacciones, la licencia no está especificada de forma utilizable y la model card es la plantilla automática de TRL sin información sobre el conjunto de datos de entrenamiento, hiperparámetros o evaluación. Resulta útil como punto de partida reproducible para investigar el efecto del SFT sobre modelos destilados de razonamiento, pero no como modelo de referencia para aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (tag `qwen2`) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado de la familia Qwen2.5 del modelo base; no confirmado en la informacion de este repositorio) |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors); convertible a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye `licence: license`, sin texto legal) |
| Formato de pesos | safetensors (libreria transformers); repositorio de 7,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de Qwen2 con atención completa, normalización RMSNorm y embeddings RoPE, dimensionado para 1,5B parámetros. El modelo base es una destilación de DeepSeek-R1 sobre Qwen2.5, un proceso en el que las trazas de razonamiento del modelo grande se usan como datos de SFT para transferir capacidad de cadena de pensamiento a un modelo pequeño. Este checkpoint añade una segunda fase de SFT sobre ese modelo ya destilado.

El entrenamiento se realizó con TRL 1.15.0 (SFTTrainer), Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0 y Tokenizers 0.23.3. La model card no documenta el número de tokens de entrenamiento, la composición del dataset, la configuración de hiperparámetros (learning rate, épocas, batch size), ni si hubo fases posteriores de RLHF o DPO. El sufijo `arc` apunta a que los datos de ajuste están relacionados con el benchmark ARC (Abstraction and Reasoning Corpus); el sufijo `seed3407` indica que se fijó la semilla 3407, un valor habitual en experimentos de reproducibilidad. No se declara ninguna innovación técnica adicional sobre el modelo base.

## Capacidades

- Generación de texto conversacional: la model card incluye un ejemplo con `pipeline` que consume mensajes en formato de rol (`{"role": "user", "content": ...}`), lo que confirma soporte del chat template del modelo base.
- Razonamiento multi-paso: al derivar de DeepSeek-R1-Distill, se espera que mantenga el modo de cadena de pensamiento del original, aunque el SFT adicional puede haberlo alterado y no hay evaluación publicada que lo confirme.
- Razonamiento abstracto y resolución de puzzles: el nombre del checkpoint sugiere entrenamiento orientado a tareas tipo ARC.
- Generación de código y matemáticas: capacidad heredada del modelo base, no verificada en este checkpoint.
- Tool calling / function calling: no disponible (no se documenta soporte de plantilla de herramientas).
- Capacidades de agente multi-paso: no disponible.
- Multilingüismo: no disponible (el modelo base Qwen2.5 es multilingüe, pero este ajuste no declara idiomas).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Reproducción de experimentos de investigación: usar este checkpoint como baseline SFT frente al que comparar variantes con otras semillas o configuraciones, dado que el nombre documenta explícitamente la semilla y la condición experimental.
- Estudio del efecto del SFT sobre modelos destilados de razonamiento: evaluar si un ajuste supervisado adicional sobre `DeepSeek-R1-Distill-Qwen-1.5B` degrada o mejora la coherencia de las cadenas de pensamiento, comparando contra el modelo base sin ajustar.
- Evaluación en tareas de razonamiento abstracto: emplearlo como sujeto de prueba en benchmarks tipo ARC para medir la transferibilidad de la destilación de R1 a tareas de inducción de reglas.
- Generación de texto en local con recursos limitados: con 1,5B parámetros cabe en GPUs de consumo tras cuantización, útil para prototipos offline donde la calidad del modelo base es suficiente.
- Fine-tuning posterior como punto de partida: al ser un checkpoint intermedio de bajo coste computacional, sirve para experimentar con DPO o RLHF sin partir del modelo original.
- Docencia y formación: ilustra el flujo completo de TRL/SFTTrainer y la estructura típica de una model card autogenerada, útil en talleres de fine-tuning.
- Análisis de artefactos de entrenamiento: el tamaño del repositorio (7,1 GB) permite estudiar qué se publica por defecto al subir un checkpoint de SFTTrainer y por qué conviene limpiar estados de optimizador antes de publicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, ARC ni de ninguna otra evaluación, y tampoco se aportan comparaciones con el modelo base. Cualquier cifra de rendimiento de este checkpoint concreto requeriría una evaluación propia.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,5-4 GB solo para pesos, más 1-2 GB adicionales para caché KV con contextos largos.
- VRAM estimada en cuantización de 8 bits: en torno a 2 GB para pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M o AWQ): aproximadamente 1-1,5 GB, holgado en cualquier GPU de 8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o L4 para inferencia cómoda en FP16; A100/H100 no son necesarias para este tamaño y solo se justifican para entrenamiento o serving de alto throughput.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 6 GB o más en FP16 y desde 4 GB con cuantización; también es viable en CPU con llama.cpp u Ollama con latencias de decenas de tokens por segundo en hardware moderno.
- Opciones de despliegue: transformers + `pipeline`, vLLM, TGI (el tag `text-generation-inference` está presente), llama.cpp/Ollama tras conversión a GGUF, y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`..._SFT_baseline_arc_seed3407`) | 1,78B | 32.768 (heredado del base, sin confirmar) | No disponible | No disponible | Publico en HF, 0 descargas |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (base) | 1,5B | 32.768 | Metricas publicadas por DeepSeek en su model card (no reproducidas aqui) | Licencia del modelo base (consultar en su repositorio) | Publico, ampliamente utilizado |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,5B | 32.768 | Metricas publicadas por Qwen (no reproducidas aqui) | Apache 2.0 (segun el repositorio de Qwen) | Publico, muy utilizado |
| `deepseek-ai/DeepSeek-R1-Distill-Llama-8B` | 8B | 32.768 (heredado) | Superior al de 1,5B segun la model card de DeepSeek | Licencia del modelo base | Publico; requiere mas VRAM |

La comparación relevante es contra el modelo base sin ajustar: sin una evaluación propia no puede determinarse si este SFT mejora o degrada las capacidades del original.

## Limitaciones y advertencias

- Licencia no utilizable: la model card declara `licence: license`, sin texto legal. No hay base para asumir uso comercial permitido; hay que remitirse al modelo base y aun así contactar con el autor.
- Model card incompleta: no se documentan datos de entrenamiento, hiperparámetros, idiomas ni evaluación. Imposible auditar qué se ha enseñado al modelo.
- Riesgo de sobreajuste al dataset de ajuste: al ser un SFT sobre una tarea concreta (probablemente ARC) con una única semilla, es esperable una degradación de capacidades generales y un aumento del olvido catastrófico.
- Riesgo de alucinación: heredado de un modelo de 1,5B destilado; el SFT no lo mitiga y puede agravarlo si el dataset es estrecho.
- Idiomas: no declarados; el modelo base es mayoritariamente inglés y chino, por lo que el rendimiento en castellano es incierto.
- Naturaleza efímera: 0 descargas y 0 interacciones; repositorio de investigación sin mantenimiento previsible ni issues atendidos.
- Sin garantías de producción: no hay versionado semántico, ni informes de seguridad, ni evaluación de sesgos.
- Fecha de creación declarada en 2026-10-24, posterior a la del modelo base en el ecosistema habitual; conviene verificar la procedencia antes de integrarlo en cualquier pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rghosh8/DeepSeek-R1-Distill-Qwen-1.5B_ckpt_SFT_baseline_arc_seed3407
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de DeepSeek-R1: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos por la busqueda no guardan relacion con el contenido de la ficha.
