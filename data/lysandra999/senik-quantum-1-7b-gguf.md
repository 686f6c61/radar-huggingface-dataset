# Lysandra999/Senik-Quantum-1.7B-GGUF

## Resumen
Senik-Quantum-1.7B es un modelo de lenguaje de 1.728.801.600 parámetros publicado por el usuario Lysandra999 bajo el identificador `Lysandra999/Senik-Quantum-1.7B-GGUF`. Se distribuye exclusivamente en formato GGUF y está orientado a inferencia local en dispositivos de borde, concretamente en una NVIDIA Jetson Orin Nano de 8 GB. El modelo se presenta como una base para tareas de ingeniería de software autónoma, ejecución de herramientas en conversaciones multi-turno y visión local multi-imagen, todo ello sin dependencia de la nube.

La propuesta técnica combina una cuantización mixta inusual (IQ4_XS con atención en Q6_K y `lm_head` en Q8_0) con una rotación Walsh-Hadamard de los pesos, empaquetada en un fichero de 989,09 MiB. El autor reporta métricas medidas en hardware Jetson, como 39,71 tok/s en modo `MAXN_SUPER` o 44/50 tareas resueltas en una suite propia de codificación (`SWE-Doctor S*`). No se han publicado resultados en benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K) en la información disponible.

La relevancia actual del modelo reside en su enfoque de despliegue extremo: un modelo de 1,7B con adaptadores LoRA conmutables en caliente, pensado para flotas de agentes y automatización de código en hardware de bajo consumo. La licencia es propietaria (`senik-proprietary-evaluation-v1.0`), lo que condiciona su uso comercial y su evaluación por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de capas y atención no disponibles); cuantización con rotación Walsh-Hadamard |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 24K tokens (mencionado en el adaptador `stamina-lora`); configuración de servidor con `-c 12288` en el caso `DiscordSenik` |
| Tipos de cuantizacion | IQ4_XS + Q6_K (atención) + Q8_0 (`lm_head`) en la variante mixta; IQ3_M; Q4_K_M |
| Idiomas soportados | en |
| Licencia | senik-proprietary-evaluation-v1.0 (propietaria) |
| Formato de pesos | GGUF (llama.cpp); adaptadores LoRA en GGUF |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna más allá de describirla como un transformer de 1,7B parámetros. El autor menciona un proceso de entrenamiento con SFT y DPO (la variante Q4_K_M se etiqueta como "General SFT+DPO Baseline") y un mecanismo de consolidación offline denominado "REM-Cycle" que habría destilado reflejos de codificación a partir de errores de repositorio resueltos previamente, empaquetado en el adaptador `senik-code-sleep-v2-lora`. No se especifican el número de tokens de entrenamiento, la composición del dataset ni los detalles del pipeline de RLHF/DPO.

La innovación técnica más destacable es la "quantization engine" de cuatro pilares, que aplica una rotación Walsh-Hadamard a los pesos antes de cuantizar para reducir el error de cuantización (el autor reporta una similitud coseno de 0,999899 en la variante mixta). También se describe una inyección suave en un paso ("1-Step Soft Injection") con un fork de `llama_memory_seq_cp` de tres ramas y una horquilla de 0,520 ms, así como un `QuantumTTLMemoryCache` para la gestión de memoria en flotas multiagente. Estos mecanismos no están documentados con suficiente detalle como para reproducirlos a partir de la información proporcionada.

## Capacidades
- Generación de texto conversacional en inglés, con pipeline `text-generation`.
- Codificación autónoma orientada a resolución de bugs de repositorio mediante la suite propietaria `SWE-Doctor S*`, con etapas de localización, generación de parche y verificación.
- Ejecución de herramientas y function calling en conversaciones multi-turno (caso `DiscordSenik`, con puertas de persona y herramienta).
- Razonamiento multi-paso y orquestación multiagente mediante adaptadores LoRA conmutables en caliente.
- Visión local multi-imagen: el autor reporta OCR y comparación de dos imágenes en 18,6 s usando `LFM2.5-VL-1.6B` (1,22 GB) junto con `YuNet`/`SFace` para reconocimiento facial familiar. Esta capacidad parece residir en un modelo de visión externo y no en los pesos de Senik.
- Respuesta a sondas adversariales con hardening frente a abliteración direccional de rango 1 y rango 4 (0/6 y 0/10 fugas reportadas).
- Interfaz "encarnada": máquina de estados de 64 expresiones con animación facial en Pygame, no relevante para uso como API de texto.

## Casos de uso
- Automatización de corrección de bugs en repositorios pequeños o medianos: el modelo, con los adaptadores `senik-localize-lora`, `senik-patch-lora` y `senik-verify-lora`, se usaría en tres etapas encadenadas para localizar el fichero y símbolo causantes, generar un diff mínimo y verificar el parche contra tests. Es adecuado por su bajo consumo (989 MB) y su integración con llama.cpp.
- Asistente de terminal y ejecución de tests: con `senik-terminal-lora` se estructurarían comandos `pytest` y CLI dirigidos, útil en entornos de CI/CD con recursos limitados o en pipelines de borde.
- Agente conversacional multi-turno en Discord: `DiscordSenik` demuestra puertas de persona y herramienta con 9/9 pruebas E2E de dos turnos y latencias cálidas de 1,48–3,81 s en Jetson a 15 W. Adecuado para comunidades pequeñas o prototipos de agentes sociales.
- Reconocimiento y descripción de imágenes en local: combinado con un modelo de visión externo (`LFM2.5-VL-1.6B`) y detectores `YuNet`/`SFace`, permitiría OCR y comparación de imágenes en dispositivos sin conectividad.
- Flotas de agentes especializados con conmutación de LoRA por petición: el servidor llama.cpp con `--lora-init-without-apply` y `POST /lora-adapters` permite asignar adaptadores de 289 KiB a 3,86 MiB según la tarea, lo que resulta útil para enrutar peticiones heterogéneas en un único proceso.
- Evaluación de robustez frente a jailbreak: el modelo se ofrece explícitamente como objetivo para probar técnicas de abliteración y ortogonalización SVD, por lo que sirve como banco de pruebas de alineamiento en modelos pequeños.
- Refactorizaciones largas con contexto de 24K: el adaptador `stamina-lora` está pensado para mantener coherencia en refactorizaciones profundas dentro de esa ventana.

## Benchmarks y rendimiento
Los datos disponibles son mediciones del autor en hardware Jetson, no benchmarks estándar de la comunidad. Se presentan tal cual, sin verificación independiente.

| Prueba | Resultado | Hardware / modo |
|---|---|---|
| Tamaño del fichero principal (`v2.2-hadamard-mixed.gguf`) | 989,09 MiB; similitud coseno Walsh-Hadamard 0,999899 | Jetson Orin Nano 8 GB |
| `SWE-Doctor S*`, suite de 50 tareas | 44/50 (88,0 %); 5/5 en Doc-to-LoRA no visto | Jetson 15 W y `MAXN_SUPER` |
| `MAXN_SUPER` frente a 15 W | 2,00× más rápido (245,47 s frente a 491,18 s) | `nvpmodel -m 2` |
| Inyección suave en 1 paso | 39,71 tok/s; fork de 0,520 ms | `MAXN_SUPER` |
| `DiscordSenik` sin rotar, `-c 12288` | 7/7 puertas persona/herramienta; 9/9 E2E de dos turnos (1,48–3,81 s en caliente) | Jetson 15 W, 3.418 MB libres |
| Visión multi-imagen local | 18,6 s para OCR y comparación de 2 imágenes; 1.845 MB libres | `LFM2.5-VL-1.6B` (1,22 GB) |
| Motor de cuantización cuántica de 4 pilares | 19/19 pruebas; 75,0 % de ahorro de KV-cache con SVD | MultiAgenticSenik Core |
| Robustez a abliteración | 0/6 fugas iniciales; 0/10 en suite extendida; 12/12 en Senik Ground Truth | No especificado |
| Throughput de la variante Q4_K_M | 41,24 tok/s | `MAXN_SUPER` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1 GB para la variante mixta de 989,09 MiB, 864,22 MiB para IQ3_M y 1.048,69 MiB para Q4_K_M, más overhead de contexto KV.
- Hardware de referencia: NVIDIA Jetson Orin Nano de 8 GB, con modos de potencia de 15 W y `MAXN_SUPER` (`nvpmodel -m 2`).
- Cabe en GPU de consumo con al menos 2 GB de VRAM libre; no se han publicado pruebas en RTX 4090, A100 o H100.
- Despliegue: llama.cpp (servidor con puertos `:8082`, `:8084`, `:8086`, `:8087`), con soporte de `--lora-init-without-apply` y `POST /lora-adapters` para conmutación en caliente. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput medidos: 39,71 tok/s en inyección suave y 41,24 tok/s en Q4_K_M, ambos en `MAXN_SUPER`; 2,00× de diferencia entre `MAXN_SUPER` y 15 W.
- El repo ocupa 19,5 GB, aunque los artefactos individuales son de alrededor de 1 GB; conviene descargar solo los ficheros necesarios.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Senik-Quantum-1.7B | 1,73B | 24K (según adaptador) | Propietaria (`senik-proprietary-evaluation-v1.0`) | GGUF | Optimizado para Jetson Orin Nano; benchmarks propios |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K | Apache 2.0 | safetensors, GGUF | Referencia comunitaria con benchmarks públicos; no disponible en la información proporcionada para comparación numérica |
| Llama-3.2-1B-Instruct | 1,24B | 128K | Llama 3.2 Community License | safetensors, GGUF | Contexto mayor y ecosistema amplio; sin datos comparativos en la información disponible |
| SmolLM2-1.7B-Instruct | 1,71B | 8K | Apache 2.0 | safetensors, GGUF | Tamaño casi idéntico; sin datos comparativos en la información disponible |

La comparación numérica de rendimiento no está disponible: el autor no publica MMLU, HumanEval ni GSM8K, y los benchmarks propios (`SWE-Doctor S*`) no son directamente comparables con los de los modelos citados.

## Limitaciones y advertencias
- Licencia propietaria de evaluación (`senik-proprietary-evaluation-v1.0`): el uso comercial, la redistribución y la evaluación por terceros quedan sujetos a los términos del fichero `LICENSE`, que no se detallan en la información disponible. Verificar antes de cualquier despliegue en producción.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Los benchmarks son autoinformados por el autor, sin verificación independiente ni comparación con suites estándar.
- El modelo se distribuye únicamente en GGUF, lo que limita su uso a llama.cpp y ecosistemas compatibles; no hay pesos en safetensors para fine-tuning convencional.
- Las capacidades de visión dependen de un modelo externo (`LFM2.5-VL-1.6B`) y de detectores `YuNet`/`SFace`; no están integradas en los pesos de Senik.
- Riesgo de alucinación no cuantificado; no se han publicado tasas de error en tareas abiertas.
- El repositorio incluye artefactos y adaptadores con nombres y funciones muy específicas (`senik-*`), lo que dificulta la reproducibilidad sin el código de orquestación `MultiAgenticSenik`, no incluido en la información disponible.
- El tamaño del repo (19,5 GB) frente al tamaño de los modelos (~1 GB) sugiere la presencia de assets, vídeos y adaptadores adicionales; conviene revisar la lista de ficheros antes de descargar.
- La fecha de creación indicada (2026-11-01) es posterior a la fecha actual en algunos contextos; verificar la vigencia del repositorio.

## Enlaces
- Hugging Face: https://huggingface.co/Lysandra999/Senik-Quantum-1.7B-GGUF
- Fichero de licencia: https://huggingface.co/Lysandra999/Senik-Quantum-1.7B-GGUF/blob/main/LICENSE
- Diagrama de arquitectura: https://huggingface.co/Lysandra999/Senik-Quantum-1.7B-GGUF/resolve/main/assets/senik_architecture_diagram.png
- Vídeo de reacciones faciales: https://huggingface.co/Lysandra999/Senik-Quantum-1.7B-GGUF/resolve/main/assets/senik_face_reactions.mp4
- Gráfico de benchmarks: https://huggingface.co/Lysandra999/Senik-Quantum-1.7B-GGUF/resolve/main/assets/senik_benchmark_chart.png
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
