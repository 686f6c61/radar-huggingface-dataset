# GUI-Gym/GLM-4.6V-Flash-9B-MobileWeave-SFT

## Resumen

GLM-4.6V-Flash-9B-MobileWeave-SFT es un ajuste fino supervisado (SFT) del modelo multimodal zai-org/GLM-4.6V-Flash, desarrollado por el colectivo GUI-Gym. El modelo está especializado en la operación de interfaces gráficas de dispositivos móviles: recibe capturas de pantalla y emite acciones `mobile_use` con coordenadas normalizadas en el rango 0–1000, lo que lo convierte en un agente de GUI de extremo a extremo orientado a benchmarks de automatización móvil.

El entrenamiento se realizó sobre el conjunto de datos MobileWeave (15.393 muestras procedentes de 1.332 episodios) durante 3 épocas y 1.446 pasos de optimización, con el tower de visión y el proyector multimodal congelados. El resultado es un checkpoint de aproximadamente 10.290 millones de parámetros en formato safetensors (20,6 GB en el repositorio), con plantilla de chat propia y procesador multimodal incluidos.

Su relevancia actual radica en que aborda una tarea concreta y difícil de evaluar: la interacción autónoma con apps móviles a partir de píxeles. El autor publica una evaluación completa sobre los ocho seeds del benchmark MobileGym (2.048 instancias de tarea), con métricas de tasa de éxito (SR) y progreso medio (PR), lo que permite comparar el modelo de forma reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia GLM-4V; tower de visión + proyector multimodal + modelo de lenguaje) |
| Parametros totales | 10.292.777.472 (10,29 mil millones) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens (secuencia de entrenamiento y `--max-model-len` en vLLM) |
| Tipos de cuantizacion | No disponible (el autor solo documenta BF16 para entrenamiento e inferencia) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | No disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de GLM-4.6V-Flash, un transformer multimodal de la familia GLM-4V. La arquitectura conserva el tower de visión y el proyector multimodal del modelo base congelados, y aplica un SFT completo únicamente sobre el modelo de lenguaje. La entrada es una captura de pantalla junto con el contexto de la tarea; la salida es una acción `mobile_use` serializada (con coordenadas en escala 0–1000) que el agente `mbweave` parsea y ejecuta.

El entrenamiento usó LLaMA-Factory con la plantilla `glm4_5v`, 15.393 muestras de 1.332 episodios, learning rate 1e-5 con scheduler coseno y warmup del 3 %, batch por dispositivo 1 con acumulación de gradiente 4 sobre 8 GPUs (batch efectivo 32), BF16, FlashAttention 2 y DeepSpeed ZeRO-2. El autor documenta un OOM de GPU tras el paso 510: el entrenamiento se reanudó desde el checkpoint completo de la época 1 (paso 482) con gradient checkpointing activado, preservando estado de optimizador, scheduler y RNG. Se emplearon Transformers 5.6.0 y PyTorch 2.10.0.

## Capacidades

- Comprensión de capturas de pantalla de interfaces móviles (image-text-to-text).
- Generación de acciones de GUI estructuradas (`mobile_use`) con coordenadas normalizadas 0–1000.
- Razonamiento multi-paso dentro de una sesión de agente: el benchmark se ejecuta con `max_steps` 40 y contexto denso `[Observation, Action]`.
- Soporte de tool calling en el sentido de que las acciones se emiten como llamadas estructuradas que el agente ejecuta y valida.
- Capacidades multilingües limitadas a inglés y chino.
- No se documentan capacidades de audio ni modos de razonamiento extendido ("thinking") específicos.

## Casos de uso

- Evaluación de agentes de GUI móvil: el modelo está pensado para ejecutarse con el agente `mbweave` y su parser de acciones, de modo que sirve como referencia reproducible sobre los seeds del benchmark MobileGym.
- Automatización de pruebas de regresión en apps Android: dado que emite acciones con coordenadas normalizadas, puede integrarse en pipelines que reproducen flujos de usuario sobre emuladores y verifican el estado final de la pantalla.
- Investigación en aprendizaje por imitación de interacción móvil: al ser un SFT completo sobre MobileWeave, es un punto de partida para estudiar cómo el ajuste del modelo de lenguaje (con visión congelada) afecta a la tasa de éxito en tareas de GUI.
- Asistencia a usuarios en tareas repetitivas dentro de apps: con contexto de 32.768 tokens puede mantener el historial de observaciones y acciones de una sesión larga sin truncar.
- Generación de datos sintéticos de interacción: las trayectorias producidas por el modelo (con temperatura 0 para reproducibilidad) pueden servir como material de anotación o de comparación frente a trayectorias humanas.
- Despliegue en producción con vLLM: el autor valida el servicio con vLLM 0.17.0, `--max-num-seqs 256`, `--gpu-memory-utilization 0.95` y `--data-parallel-size 8`, lo que permite montar un endpoint compatible con la API de OpenAI para un agente móvil.

## Benchmarks y rendimiento

Evaluación sobre MobileGym, 8 seeds (0–7), 256 instancias por seed, 2.048 en total. Medias no ponderadas entre seeds; desviaciones en puntos porcentuales. Agente `mbweave`, modo texto, juicio por reglas (`query_answer_judge=off`), temperatura 0, `max_tokens` 2048, `max_steps` 40, contexto denso `[Observation, Action]`.

| Metrica | Media | SD poblacional (ddof=0) | SD muestral (ddof=1) |
|---|---:|---:|---:|
| SR (tasa de exito) | 33,8531 % | 1,7302 | 1,8497 |
| PR (progreso medio) | 45,3853 % | 1,5683 | 1,6766 |
| SR_all_episodes | 33,6426 % | 1,8053 | 1,9300 |

| Seed | SR | PR | Errores |
|---|---:|---:|---:|
| 0 | 35,5469 % | 46,2374 % | 0 |
| 1 | 36,2205 % | 46,9927 % | 2 |
| 2 | 35,2941 % | 47,4935 % | 1 |
| 3 | 34,5098 % | 44,3071 % | 1 |
| 4 | 30,8300 % | 43,5031 % | 3 |
| 5 | 32,2835 % | 43,9262 % | 2 |
| 6 | 32,8063 % | 46,9048 % | 3 |
| 7 | 33,3333 % | 43,7179 % | 1 |

Se registraron 13 resultados terminales de acción inválida: 6 errores de formato de tool call, 4 errores de sintaxis JSON y 3 errores de coordenadas inválidas. El agente reintenta hasta tres veces las acciones inválidas; los resultados se conservaron sin repeticiones selectivas. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 20,6 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 32.768 tokens y `--max-num-seqs 256` se requiere un entorno multi-GPU.
- El autor validó el servicio con `--data-parallel-size 8` y `--gpu-memory-utilization 0.95`, lo que implica 8 GPUs en paralelo de datos para la configuración de referencia (modelo por GPU, sin tensor parallelism indicado).
- GPU recomendadas para la configuración documentada: A100 80 GB o H100; no se documenta ejecución en GPUs de consumo.
- No cabe en GPUs de consumo de 24 GB en BF16 sin cuantización; el autor no publica variantes GGUF ni cuantizadas, por lo que no hay datos de despliegue en ese rango.
- Opciones de despliegue: vLLM 0.17.0 (validado) y Transformers 5.6.0 (validado). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos en la información disponible. El modelo base zai-org/GLM-4.6V-Flash es el único punto de referencia documentado, y el autor no incluye sus métricas en MobileGym para contrastar la mejora del ajuste fino.

| Modelo | Parametros | Contexto | SR en MobileGym | Licencia |
|---|---:|---:|---:|---|
| GLM-4.6V-Flash-9B-MobileWeave-SFT | 10,29 B | 32.768 | 33,85 % (media 8 seeds) | No disponible |
| zai-org/GLM-4.6V-Flash (base) | No disponible | No disponible | No disponible | No disponible |
| Alternativas de agente GUI movil | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Especialización estrecha: el ajuste está orientado a acciones `mobile_use` con el parser del agente `mbweave`; fuera de ese contrato de acciones el rendimiento no está caracterizado.
- Tasa de éxito moderada: SR medio del 33,85 % y PR del 45,39 % en MobileGym, con una desviación entre seeds de hasta 3 errores terminales por seed.
- Errores de formato: 13 acciones inválidas terminales (6 de formato de tool call, 4 de sintaxis JSON, 3 de coordenadas), lo que indica fragilidad en la serialización de acciones.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Riesgo de alucinación en la interpretación de pantallas no vistas y en la estimación de coordenadas; el autor no publica análisis de sesgos.
- Visión congelada: el tower visual no se ajustó, por lo que la adaptación al dominio móvil recae solo en el modelo de lenguaje.
- Reproducibilidad: el entrenamiento se reanudó desde un checkpoint tras un OOM, lo que puede introducir diferencias respecto a una ejecución sin interrupciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GUI-Gym/GLM-4.6V-Flash-9B-MobileWeave-SFT
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- Informe de evaluación completo: https://huggingface.co/GUI-Gym/GLM-4.6V-Flash-9B-MobileWeave-SFT/blob/main/evaluation/final_report.json
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- vLLM (serving validado): https://github.com/vllm-project/vllm
