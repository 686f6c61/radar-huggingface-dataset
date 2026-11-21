# moravianai/ThinCtx-Qwen3.5-0.8B-small

## Resumen

ThinCtx-Qwen3.5-0.8B-small es una conversión del modelo Qwen3.5-0.8B de Alibaba Qwen realizada por Moravian AI, orientada a reducir drásticamente el consumo de memoria en contextos largos. El modelo mantiene los pesos cuantizados a aproximadamente 5,5 bits por peso y comprime el contexto almacenado en RAM del sistema entre 2,5 y 3 veces respecto al almacenamiento de 16 bits, lo que permite ejecutar conversaciones de 128k a 540k tokens en un consumo de GPU de 0,89 a 1,2 GB en lugar de los 3,0 a 7,7 GB del original.

La innovación principal no reside en la arquitectura del transformer subyacente, sino en el runtime propietario `thinctx`, que gestiona la memoria del contexto de forma que la parte residente en GPU crece muy lentamente (0,78 KB por token frente a 12 KB del modelo base). El modelo está calibrado y probado en inglés, checo y alemán, y se distribuye bajo licencia PolyForm Small Business 1.0.0, gratuita para pequeñas empresas, uso personal, investigación no comercial y evaluación.

Es relevante ahora porque demuestra una vía práctica para desplegar modelos pequeños con ventanas de contexto enormes en hardware modesto, aunque el propio autor advierte de que esta variante de 0,8B no es adecuada para tool calling ni para chat en checo o alemán, y recomienda las variantes de 2B y 4B para esos casos. El modelo requiere el runtime `thinctx` (versión mínima 0.3.1, recomendada 1.0.1 o superior) y no funciona con librerías de inferencia convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-0.8B), conversión ThinCtx con runtime propio |
| Parámetros totales | 1.088.320 (según safetensors); el nombre comercial indica 0.8B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128k a 540k tokens (según variante de memoria) |
| Tipos de cuantización | Pesos a ~5,5 bits por peso; contexto comprimido 2,5–3× en RAM |
| Idiomas soportados | Multilingüe (en, cs, de calibrados y probados) |
| Licencia | PolyForm Small Business 1.0.0 (other) |
| Formato de pesos | safetensors |
| Librería / runtime | thinctx >= 0.3.1 (recomendado >= 1.0.1) |
| Tamaño del repo | 0,7 GB |
| Modelo base | moravianai/ThinCtx-Qwen3.5-0.8B (a su vez derivado de Qwen/Qwen3.5-0.8B) |
| Plataformas | Linux x86_64, Windows 10/11 vía WSL2; macOS no soportado |
| GPU requerida | NVIDIA con soporte CUDA 13 (o cu128 con driver antiguo) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer Qwen3.5-0.8B. La conversión ThinCtx no altera la arquitectura del transformer, sino que introduce dos cambios: cuantización de pesos a aproximadamente 5,5 bits y compresión del contexto almacenado en RAM del sistema (2,5–3× respecto a 16 bits). La parte del contexto que reside en GPU es pequeña y crece a 0,78 KB por token, frente a los 12 KB por token del modelo original, lo que supone un crecimiento aproximadamente 15 veces más lento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. El modelo se presenta como una conversión del base model, no como un modelo entrenado desde cero: la model card indica explícitamente que "la conversión sigue al original, no añade habilidad lingüística". La calibración se realizó en inglés, checo y alemán, y en texto checo retenido el modelo predice un 1,0 % peor que el original (inglés: 0,7 % peor). La decodificación y gestión de contexto dependen del runtime `thinctx`, que con versión 1.0 o superior permite compartir memoria de system prompt entre conversaciones en Linux.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen3.5.
- Contexto largo: ventanas de 128k a 540k tokens con consumo de GPU reducido.
- Capacidades multilingües limitadas a inglés, checo y alemán calibrados; el chat en checo y alemán es débil, con errores gramaticales y respuestas en otro idioma frecuentes, igual que el modelo base.
- Tool calling / function calling: presente pero muy degradado; BFCL non-live del 32,7 % frente al 53,5 % del base. El autor lo desaconseja explícitamente para esta tarea.
- Razonamiento de múltiples pasos y agentes: no recomendado en esta variante de 0,8B; se sugiere usar las variantes de 2B o 4B.
- Endpoint compatible con la API de chat-completions de OpenAI mediante `thinctx serve`, con autenticación básica opcional.
- Uso como librería Python mediante `thinctx.load(...)`.
- Memoria compartida entre conversaciones con el mismo system prompt (solo Linux nativo, no en WSL) con thinctx 1.0 o superior.

## Casos de uso

- Procesamiento de documentos largos en local: el modelo permite cargar prompts de 128k a 540k tokens manteniendo el contexto completo en RAM del sistema y una fracción pequeña en GPU, adecuado para resumir o extraer información de contratos, informes o expedientes extensos en una estación de trabajo con GPU modesta.
- Chat conversacional de contexto largo en inglés: gracias a la plantilla de chat de Qwen3.5 y a la compartición de memoria de system prompt (Linux, thinctx >= 1.0), se pueden mantener muchas conversaciones concurrentes con un coste marginal de memoria bajo.
- Evaluación e investigación de técnicas de compresión de contexto: el modelo sirve como banco de pruebas reproducible para comparar el consumo de memoria y la calidad frente al Qwen3.5-0.8B original, con métricas publicadas de perplejidad en checo e inglés.
- Despliegue en hardware de gama baja con NVIDIA: al necesitar solo 0,89–1,2 GB de VRAM para el contexto, cabe en GPUs consumer de gama media y en entornos WSL2 sobre Windows, lo que facilita prototipos locales sin infraestructura dedicada.
- Servicio interno compatible con OpenAI: mediante `thinctx serve` se puede exponer un endpoint `/v1/chat/completions` para integrarlo en aplicaciones existentes que ya consumen la API de OpenAI, con autenticación básica.
- Procesamiento por lotes de textos largos en inglés: la generación es más rápida que el original en vLLM a partir de 512k tokens de contexto, según el autor, lo que lo hace útil para tareas de lectura de documentos largos donde la latencia de lectura inicial es aceptable.
- Base para fine-tuning o experimentación con contextos extendidos: al ser una conversión de un modelo pequeño y con licencia permisiva para investigación y evaluación, sirve como punto de partida para estudiar el equilibrio entre cuantización, compresión de contexto y calidad.

## Benchmarks y rendimiento

| Benchmark | ThinCtx-Qwen3.5-0.8B-small | Qwen3.5-0.8B (base) |
|---|---|---|
| BFCL non-live | 32,7 % | 53,5 % |
| RULER a 64k tokens | 70 | 83 |
| Perplejidad en checo retenido | 1,0 % peor que el original | referencia |
| Perplejidad en inglés retenido | 0,7 % peor que el original | referencia |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar. Los datos de memoria (0,89/1,2 GB de VRAM para 128k/540k tokens frente a 3,0/7,7 GB del original; 0,78 KB por token frente a 12 KB) proceden de la model card del autor.

## Requisitos de hardware

- VRAM estimada: 0,89 GB para 128k tokens de contexto y 1,2 GB para 540k tokens, según el autor (frente a 3,0 y 7,7 GB del original).
- Contexto completo en RAM del sistema: comprimido 2,5–3× respecto al almacenamiento de 16 bits.
- GPU: NVIDIA con soporte CUDA 13 (PyTorch 2.11 por defecto); con driver antiguo, instalar `torch==2.11.*` desde el índice cu128.
- Cabe en GPU consumer de gama media: el consumo de VRAM para el contexto es inferior a 1,5 GB, por lo que es viable en tarjetas NVIDIA consumer con suficiente memoria para los pesos y el runtime.
- Plataformas: Linux x86_64 o Windows 10/11 mediante WSL2; macOS no soportado. En WSL se recomienda `autoMemoryReclaim=dropcache` en `.wslconfig`.
- Dependencias: `gcc` para compilar el launcher de Triton en el primer arranque (`build-essential` en Debian/Ubuntu); Python 3.12 vía `uv` o `venv`.
- Despliegue: exclusivamente mediante el runtime `thinctx` (chat interactivo, servidor compatible con OpenAI o carga como librería). No es compatible con vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: la lectura de prompts largos es más lenta que el modelo base; la generación es más rápida que el original en vLLM a partir de 512k tokens de contexto, según el autor. No se proporcionan cifras concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria GPU (contexto) | Tool calling | Licencia | Runtime |
|---|---|---|---|---|---|---|
| ThinCtx-Qwen3.5-0.8B-small | 0,8B (1.088.320 en safetensors) | 128k–540k | 0,89–1,2 GB | Degradado (BFCL 32,7 %) | PolyForm Small Business 1.0.0 | thinctx |
| ThinCtx-Qwen3.5-0.8B | 0,8B | 128k–540k | 3,0–7,7 GB | No indicado | PolyForm Small Business 1.0.0 | thinctx |
| Qwen3.5-0.8B (base) | 0,8B | 128k–540k | 3,0–7,7 GB | BFCL 53,5 % | Según Qwen | Librerías estándar |
| ThinCtx-Qwen3.5-2B-small | 2B | No disponible | No disponible | Recomendado por el autor para agentes | PolyForm Small Business 1.0.0 | thinctx |
| ThinCtx-Qwen3.5-4B-small | 4B | No disponible | No disponible | Recomendado por el autor para agentes | PolyForm Small Business 1.0.0 | thinctx |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- No recomendado para tool calling ni function calling: el autor indica que la conversión de 0,8B perdió gran parte de la capacidad de llamada a funciones del base (BFCL non-live 32,7 % frente a 53,5 %).
- Peor rendimiento en contexto largo que el base: RULER a 64k tokens cae a 70 frente a 83 del original.
- Chat débil en checo y alemán: el modelo base ya comete errores gramaticales y responde en otro idioma con frecuencia; la conversión no añade habilidad lingüística.
- Ligera pérdida de calidad en perplejidad: 1,0 % peor en checo retenido y 0,7 % peor en inglés respecto al original.
- Dependencia total del runtime `thinctx`: no funciona con vLLM, llama.cpp, Ollama, TGI ni otras librerías convencionales; requiere thinctx >= 0.3.1 (recomendado >= 1.0.1).
- Plataformas limitadas: Linux x86_64 y Windows vía WSL2; macOS no soportado. La compartición de memoria entre conversaciones solo funciona en Linux nativo, no en WSL.
- Licencia restrictiva para empresas grandes: PolyForm Small Business 1.0.0 es gratuita para pequeñas empresas, uso personal, investigación no comercial y evaluación; las organizaciones grandes en producción deben contactar con info@moravian.ai para obtener una licencia comercial.
- Riesgo de alucinación: no se documenta explícitamente, pero es inherente a un modelo de 0,8B y no se han publicado evaluaciones de veracidad.
- Sesgos: no documentados en la información disponible.
- Lectura de prompts largos más lenta que el modelo base, lo que afecta a la latencia en la primera fase de procesamiento de documentos extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-0.8B-small
- Variante de precisión completa: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-0.8B
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Sitio del autor: https://moravian.ai/
- Contacto para licencias comerciales: info@moravian.ai
- Instalador de uv: https://astral.sh/uv/install.sh
- PyTorch con CUDA 12.8 (drivers antiguos): https://download.pytorch.org/whl/cu128
