# jongstra/Qwen3.8-27B-pi-adapted-oQ6-bf16-mtp-dflash2-kapitsa

## Resumen

Este repositorio empaqueta una variante cuantizada del adaptador pi de harness-hub, un LoRA entrenado con aprendizaje por refuerzo para operar el agente de programación pi, fusionado sobre Qwen3.8-27B y convertido a formato MLX para su servicio en Apple Silicon mediante Kapitsa. El autor, jongstra, no entrena ni modifica el comportamiento del modelo: su aportación es la fusión del adaptador en los pesos base, la cuantización oQ6 (6 bits, grupo 64, con 50 módulos sensibles en 8 bits), la extracción de la cabeza MTP a un sidecar y la inclusión de un drafter DFlash2 para decodificación especulativa.

El modelo resultante tiene 27.781.427.952 parámetros (unos 27,8 mil millones), arquitectura transformer densa de 64 capas, contexto de 262.144 tokens y capacidad de procesamiento de imágenes. Está pensado para ejecutarse localmente en un Mac con aproximadamente 28 GB de memoria libre: 22,5 GB de pesos más 1,86 GB del drafter residente, además de la caché KV.

Su relevancia es doble. Por un lado, demuestra un flujo de trabajo reproducible para llevar un adaptador de agente entrenado con RL a un entorno de inferencia local sin soporte de LoRA en tiempo de servicio. Por otro, ofrece un punto de comparación honesto sobre qué se conserva y qué se degrada al pasar de BF16 con vLLM a 6 bits con Kapitsa, con métricas de velocidad medidas y advertencias explícitas sobre los benchmarks no revalidados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (64 capas), con cabeza MTP y drafter DFlash2 para decodificación especulativa |
| Parámetros totales | 27.781.427.952 (27,8 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | oQ6: 6 bits grupo 64 (87 % de los pesos) y 8 bits grupo 64 (13 %, 50 módulos sensibles); drafter en 4 bits en las proyecciones |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), con manifiesto `.kapitsa/manifest.json` incluido |

## Arquitectura y entrenamiento

La base es Qwen3.8-27B, un transformer denso de 64 capas con ventana de contexto de 262.144 tokens y soporte de entrada de imágenes. Sobre ella se aplica el adaptador pi de harness-hub, un LoRA entrenado con aprendizaje por refuerzo para conducir el agente de programación pi. Este repositorio fusiona el adaptador en los pesos base, de modo que no se necesita soporte de LoRA en el momento del servicio, y cuantiza el resultado a oQ6 con escalas en bf16. La cabeza MTP original se conserva en un sidecar denso que proyecta sobre el vocabulario completo, y se añade un drafter DFlash2 de 5 capas, hidden 5120 y proyecciones en 4 bits, que actúa como red de verificación en árbol dentro del esquema KFlash de decodificación especulativa de Kapitsa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RL del adaptador en la información proporcionada; esos datos corresponden a la model card de harness-hub, referenciada como `SOURCE_MODEL_CARD.md`. La model card de este repositorio advierte de un punto crítico: el adaptador se entrenó con el modo de razonamiento desactivado, mientras que la plantilla del modelo base lo activa por defecto con esfuerzo `xhigh`. Para reproducir el comportamiento entrenado hay que enviar `"chat_template_kwargs": {"enable_thinking": false}`.

## Capacidades

- Generación de texto conversacional y razonamiento en modo thinking, con esfuerzo configurable mediante `reasoning_effort`.
- Ejecución de tareas de ingeniería de software como agente: el adaptador está entrenado específicamente para el arnés pi.
- Uso de herramientas y llamadas a funciones a través de la API `openai-completions`, que es la que el adaptador espera (no la API Responses).
- Razonamiento multi-paso dentro de un bucle de agente, con contexto de hasta 262.144 tokens.
- Procesamiento de imágenes: la línea de arranque de Kapitsa indica `images on`.
- Decodificación especulativa con drafter DFlash2 y verificación en árbol, orientada a reducir la latencia en generación de código.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de programación local en Mac: el modelo se sirve con Kapitsa y se conecta a pi mediante `openai-completions`, de modo que un desarrollador puede ejecutar un agente de código con contexto de 262k tokens sin enviar código a la nube. Es adecuado porque el adaptador está entrenado exactamente para ese arnés.
- Automatización de tareas de terminal y refactorización: con el modo thinking desactivado, el modelo reproduce la configuración con la que se midieron las mejoras en Terminal-Bench 2.1 y SWE-bench Pro, lo que lo hace apropiado para flujos de edición de repositorio y ejecución de comandos.
- Revisión de código con contexto largo: la ventana de 262.144 tokens permite cargar módulos completos o varios ficheros relacionados en una sola llamada, útil para auditorías de cambios y detección de inconsistencias entre ficheros.
- Asistente de documentación técnica con imágenes: al aceptar entrada de imágenes, puede procesar diagramas de arquitectura o capturas de errores junto con el texto del repositorio para generar explicaciones o informes.
- Prototipado de pipelines de agentes en local: investigadores pueden montar un bucle de agente completo en un solo equipo Apple Silicon, con decodificación especulativa incluida, para evaluar estrategias de planificación y uso de herramientas sin coste de GPU en cloud.
- Generación de código en lote con latencia controlada: los 94,2 tok/s en código medidos en un M2 Ultra permiten procesar colas de generación de fragmentos de código en un equipo de sobremesa, con 0,08 s hasta el primer token en prompts cortos.
- Base para experimentos de cuantización: al incluir metadatos de conversión y una asignación mixta 6/8 bits documentada, sirve para estudiar la degradación de un adaptador RL al bajar de BF16 a 6 bits en tareas de agente.

## Benchmarks y rendimiento

Los datos de benchmarks del adaptador provienen de la model card de origen y se midieron sobre pesos BF16 con vLLM, no sobre esta build de 6 bits. No se han revalidado en este repositorio.

| Benchmark | Base (BF16, vLLM) | Con adaptador pi (BF16, vLLM) | Con adaptador, thinking on |
|---|---:|---:|---:|
| SWE-bench Pro (hard-51) | 39,2 % | 64,7 % | 74,5 % (no significativo en 51 tareas) |
| Terminal-Bench 2.1 | 39,5 % | 55,8 % | 56,6 % |

Velocidad medida en Mac Studio M2 Ultra (GPU de 60 núcleos, 64 GB), Kapitsa 0.2.37, `--slots 1`, generaciones de 700 tokens, temperatura 0,3, thinking off, mediana de tres ejecuciones:

| Build | Prosa (tok/s) | Código (tok/s) |
|---|---:|---:|
| Este modelo (oQ6) | 55,9 | 94,2 |
| Swift 1.5 Qwen3.8-27B oQ6 (Kapitsa) | 52,4 | 96,8 |

Los intervalos de las ejecuciones se solapan (este modelo: 53,9–56,8 en prosa y 93,4–102,1 en código; Swift: 51,1–54,1 y 94,5–102,4), por lo que el autor los considera empatados. El tiempo hasta el primer token fue de 0,08 s en prompts cortos.

## Requisitos de hardware

- Memoria: aproximadamente 28 GB libres en Apple Silicon; 22,5 GB de pesos mapeados más 1,86 GB del drafter residente, más la caché KV.
- Plataforma: exclusivamente Apple Silicon con MLX; no hay build para CUDA ni ROCm en este repositorio.
- Software: Kapitsa 0.2.25 o superior (sidecar MTP de 6 bits); probado en 0.2.37. El catálogo de Kapitsa está compilado en el binario, así que el modelo se carga por ruta de carpeta, no por nombre.
- Despliegue: `kapitsa serve --model <ruta>`; el modelo debe descargarse con `hf download` a `~/.cache/kapitsa/models/` para que aparezca en `kapitsa list`.
- Integración con agentes: pi apuntando a `http://127.0.0.1:8000/v1` con `api: openai-completions` y `maxTokens: 32768`.
- VRAM en GPU dedicada: no disponible; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput de referencia: 55,9 tok/s en prosa y 94,2 tok/s en código en M2 Ultra; latencia de primer token de 0,08 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B pi-adapted oQ6) | 27,8 B | 262.144 | Agente de código pi, MLX/Kapitsa | Apache-2.0 | Hugging Face, 0 descargas |
| Swift 1.5 Qwen3.8-27B oQ6 (Kapitsa) | 27,8 B (base) | No disponible | Cuantización oQ6 sin adaptador de agente | No disponible | Build de Kapitsa |
| Qwen/Qwen3.8-27B | 27,8 B | 262.144 | Modelo base generalista | Apache-2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,8 B (base + LoRA) | No disponible | Adaptador pi en BF16, requiere soporte LoRA | Apache-2.0 | Hugging Face |

Frente a Swift 1.5, la diferencia medible es de comportamiento (adaptador de agente) y no de velocidad, que está empatada. Frente al modelo base, la ganancia declarada en tareas de agente es de 25,5 puntos en SWE-bench Pro hard-51 y 16,3 puntos en Terminal-Bench 2.1, aunque medida en BF16 y no en esta build. Frente al adaptador sin fusionar, la ventaja es operativa: no necesita soporte de LoRA en el servidor.

## Limitaciones y advertencias

- Los benchmarks del adaptador no se han revalidado sobre los pesos de 6 bits; la propia model card del adaptador advierte que las bases de menor precisión se alejan del comportamiento entrenado.
- El modo thinking está activado por defecto con esfuerzo `xhigh`, pero el adaptador se entrenó con thinking desactivado; usarlo sin desactivarlo cambia el comportamiento y multiplica el consumo de tokens (unas 4,5 veces según la card de origen).
- Con thinking activo conviene permitir hasta 32k tokens de salida por llamada; un límite de 16k truncó el razonamiento en las pruebas del autor.
- El adaptador no fue entrenado contra la API Responses; hay que usar `openai-completions`.
- Dependencia estricta de Kapitsa 0.2.25 o superior y de Apple Silicon; no hay ruta de despliegue documentada en CUDA.
- El repositorio tiene 0 descargas y 0 likes, y se creó y actualizó el mismo día: no hay evidencia de uso en producción ni validación independiente.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del inglés sin evaluación propia.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo orientado a agentes con ejecución de comandos, conviene sandboxear el entorno.
- La licencia Apache-2.0 permite uso comercial, pero se hereda de la base y del adaptador; conviene verificar las condiciones de los componentes de terceros (drafter DFlash2 y Kapitsa).
- El rendimiento en código es sensible a la carga del sistema: las ejecuciones del propio autor varían entre 93,4 y 102,1 tok/s.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jongstra/Qwen3.8-27B-pi-adapted-oQ6-bf16-mtp-dflash2-kapitsa
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador pi de origen: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Motor de inferencia Kapitsa: https://github.com/nace-ai/kapitsa
- Model card del adaptador (referenciada como `SOURCE_MODEL_CARD.md` en el repositorio)
- Registro de cambios (`CHANGES.md`) y metadatos de conversión (`conversion_metadata.json`) en el repositorio
