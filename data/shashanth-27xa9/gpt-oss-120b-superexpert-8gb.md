# shashanth-27xA9/GPT-OSS-120B-SuperExpert-8GB

## Resumen

GPT-OSS-120B-SuperExpert-8GB es una compresión extrema del modelo openai/gpt-oss-120b, un transformer de mezcla de expertos (MoE) de 120.000 millones de parámetros publicado por OpenAI. El autor del checkpoint, shashanth-27xA9, aplica una técnica propia denominada AW-SECD (Activation-Weighted Super-Expert Consolidation & Residual Drift Compensation) para reducir el modelo a un artefacto de aproximadamente 8 GB de RAM, con un GGUF Q4_K_M de 3,04 GB.

La propuesta central es ejecutar un modelo de escala frontier en hardware de consumo: portátiles con 16 GB de RAM, Apple Silicon, GPUs RTX de 6 a 16 GB de VRAM o incluso CPU con AVX2/AVX-512. Según la model card, el resultado conserva "más del 95 %" del conocimiento del modelo base, con puntuaciones declaradas de 83,9 % en ARC-Challenge, 80,2 % en GSM8K y 78,5 % en HumanEval.

El checkpoint publicado en Hugging Face contiene 4.404.133.888 parámetros reales en safetensors (frente a los 120B del modelo base), lo que indica que la compresión no es una mera cuantización: implica una consolidación estructural de expertos. Esta discrepancia entre el nombre comercial y el recuento real de parámetros es el dato más relevante para cualquier evaluación técnica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de openai/gpt-oss-120b, con consolidación AW-SECD |
| Parámetros totales | 4.404.133.888 (según safetensors del repo); el modelo base declara 120B |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit; GGUF Q4_K_M (3,04 GB); safetensors en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de openai/gpt-oss-120b, un transformer MoE de OpenAI. Sobre esa base, el autor aplica AW-SECD, descrito en la model card como una consolidación de "super-expertos" ponderada por activaciones, combinada con compensación de deriva residual. La técnica se apoya en descomposición SVD (etiqueta `svd` en el repo) para fusionar subespacios de expertos y corregir el error introducido por la compresión, de ahí la etiqueta `zero-drift`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO adicionales sobre el modelo base. Tampoco se detalla el proceso exacto de consolidación más allá de las referencias a AW-SECD y SVD. El checkpoint resultante contiene 4.404 millones de parámetros, lo que sugiere una reducción estructural drástica respecto a los 120B originales, no solo un cambio de precisión numérica.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento matemático paso a paso (la model card incluye ejemplos de GSM8K y álgebra).
- Razonamiento científico y deducción causal (ejemplo de ARC-Challenge).
- Generación de código Python, con énfasis en funciones óptimas y casos límite (ejemplo de HumanEval).
- Etiquetas declaradas de `reasoning`, `math` y `code`.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Ejecución en CPU, GPU y Apple Silicon vía llama.cpp y Ollama.
- No se declaran capacidades de visión, audio, tool calling ni agentes en la información disponible.

## Casos de uso

- Asistencia de razonamiento en portátiles sin GPU: un desarrollador puede cargar el GGUF Q4_K_M de 3,04 GB en Ollama y resolver problemas de álgebra o lógica en un equipo con 16 GB de RAM, sin conexión ni coste de cloud.
- Prototipado rápido en Google Colab o Kaggle: los notebooks de un clic permiten evaluar el modelo en T4 o P100 gratuitas antes de comprometer infraestructura propia.
- Generación de código en local para entornos con requisitos de privacidad: al ejecutarse completamente offline, el modelo es apto para generar funciones Python sobre código propietario que no puede salir de la máquina.
- Educación y tutoría interactiva: con 25+ tok/s en Apple Silicon según la model card, es viable una conversación fluida de explicaciones paso a paso en un aula o entorno doméstico.
- Evaluación comparativa de técnicas de compresión: investigadores pueden usar este checkpoint como referencia para medir la retención de conocimiento de AW-SECD frente al modelo base en ARC-Challenge, GSM8K y HumanEval.
- Despliegue en edge devices y sistemas embebidos con AVX2/AVX-512: la ejecución en CPU sin GPU abre la puerta a integraciones en kioscos, estaciones de trabajo aisladas o hardware industrial.
- Integración en LM Studio o Jan.ai para uso de escritorio: basta pegar la URL del repositorio para descargar el GGUF pre-cuantizado con un clic.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Resultado declarado | Retención indicada |
|---|---|---|
| ARC-Challenge | 83,9 % | 95,6 % del conocimiento preservado |
| GSM8K | 80,2 % | "Zero-drift" en lógica multi-paso |
| HumanEval | 78,5 % | Generación de código de producción |

No se han publicado en la información disponible los valores del modelo base con los que se compara, ni resultados de MMLU u otros benchmarks estándar.

## Requisitos de hardware

- VRAM/RAM estimada: 8 GB de RAM para el artefacto principal; 3,04 GB para el GGUF Q4_K_M.
- Apple Silicon (M1/M2/M3/M4): 16 GB de memoria unificada, aceleración Metal, ~25+ tok/s verificados según el autor.
- GPU NVIDIA RTX: offload CUDA con 6-16 GB de VRAM, alto throughput según el autor.
- CPU Intel/AMD: AVX2/AVX-512 con 16 GB de RAM del sistema, totalmente offline.
- Cloud gratuito: Tesla T4 o P100 en Google Colab y Kaggle.
- Opciones de despliegue: Ollama, llama.cpp, transformers (con `trust_remote_code=True`), LM Studio, Jan.ai.
- Latencia y throughput: solo se declara "25+ tok/s" en Apple Silicon; no hay cifras para el resto de plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GPT-OSS-120B-SuperExpert-8GB | 4,4B reales (base 120B) | no disponible | Apache 2.0 | Hugging Face, GGUF, Ollama |
| openai/gpt-oss-120b (base) | 120B | no disponible | no disponible en la información | Hugging Face |
| GLM-5.3 SuperExpert v2 (mismo autor) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables de terceros para establecer una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- El nombre comercial ("120B") no coincide con los 4.404 millones de parámetros reales del checkpoint; conviene tratar las cifras de retención como declaraciones del autor, no verificadas de forma independiente.
- Los benchmarks de ARC-Challenge, GSM8K y HumanEval provienen únicamente de la model card; no se aportan resultados del modelo base ni metodología de evaluación.
- No se documentan sesgos conocidos, composición del dataset ni idiomas soportados.
- No hay información sobre la longitud de contexto efectiva tras la compresión, un factor crítico para casos de uso con documentos largos.
- La técnica AW-SECD no está descrita en detalle ni respaldada por un paper en la información disponible; la reproducibilidad es limitada.
- El uso de `trust_remote_code=True` implica ejecutar código del autor; audítese antes de desplegar en producción.
- Aunque la licencia es Apache 2.0, deben respetarse las condiciones del modelo base openai/gpt-oss-120b.
- La model card incluye afirmaciones de marketing ("breakthrough", "zero cloud cost") que no sustituyen a una validación empírica propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shashanth-27xA9/GPT-OSS-120B-SuperExpert-8GB
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- GGUF directo (3,04 GB): https://huggingface.co/shashanth-27xA9/GPT-OSS-120B-SuperExpert-8GB/resolve/main/gpt-oss-120b-superexpert-8gb-q4_k_m.gguf
- Notebook de ejecución en Colab: https://colab.research.google.com/github/shashanth-27xA9/GPT-OSS-120B-SuperExpert-8GB/blob/main/1_click_run_gptoss_8gb.ipynb
- Suite de benchmarks en Colab: https://colab.research.google.com/github/shashanth-27xA9/GPT-OSS-120B-SuperExpert-8GB/blob/main/benchmark_evaluation_and_test.ipynb
- Playground web: https://huggingface.co/spaces/shashanth-27xA9/GPT-OSS-120B-Playground
- Starter en Kaggle: https://www.kaggle.com/code/hariniathukuri/gpt-oss-120b-8gb-1-click-starter
