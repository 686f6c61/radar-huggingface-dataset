# primecai/fixer-combined-vace-self-forcing-1step

## Resumen

El modelo `fixer-combined-vace-self-forcing-1step`, publicado por el usuario primecai en Hugging Face, es un estudiante de video-a-video entrenado con la técnica Self-Forcing sobre la arquitectura Wan 2.1 VACE de 1.300 millones de parámetros. Su función es reparar un vídeo borrador que ya ha sido editado: recibe los latentes normalizados del vídeo editado y los de un vídeo inactivo (todo ceros en espacio RGB normalizado) y devuelve latentes reparados que se decodifican con el VAE original de Wan. El checkpoint publicado, denominado SF2100, corresponde a 420 actualizaciones del estudiante y se seleccionó como el último checkpoint completado de una ejecución de un solo paso.

La relevancia técnica del modelo radica en su esquema de muestreo: genera un fotograma latente por chunk causal con un único paso de denoising a sigma 0,999 seguido de un commit limpio de caché KV a sigma 0, lo que supone dos pasadas de red por chunk. Tanto el backbone principal como la rama VACE mantienen cachés KV, lo que permite un procesamiento causal de vídeo con contexto temporal. Es un paquete exclusivamente de inferencia: no incluye estados del optimizador, modelo de puntuación falso, discriminador ni pesos del profesor, por lo que no permite reanudar el entrenamiento.

El modelo se distribuye como pesos personalizados de Fixer/FastGen con 1.264 tensores en FP32 y nombres `transformer.*`, y depende de una versión concreta de FastGen (commit `c40fbea17b9a28a38528ee5254471dac4f2f9f12`) junto con PyTorch 2.8.0, Diffusers 0.35.1, Transformers 4.49.0 y PEFT 0.17.1. El repositorio ocupa 8,6 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere un lanzamiento muy reciente o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de flow-matching para vídeo, basado en Wan 2.1 VACE 1.3B, con backbone principal y rama VACE con cachés KV |
| Parametros totales | 1.300 millones (1.3B, según el nombre del directorio `Wan2.1-VACE-1.3B-diffusers`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesamiento causal por chunks; ejemplo de 81 fotogramas a 832x480) |
| Tipos de cuantizacion | No disponible (pesos en FP32; inferencia en bfloat16) |
| Idiomas soportados | No disponible (el modelo recibe contexto de texto vacío archivado; la instrucción de edición pertenece al editor de borradores upstream) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`student.safetensors`, 1.264 tensores FP32) |

## Arquitectura y entrenamiento

El modelo es un estudiante de Self-Forcing inicializado a partir de un warm start de flow-matching causal con 1.000 actualizaciones. Se entrenó con un calendario de un solo paso hasta 420 actualizaciones del estudiante (checkpoint SF2100), y el entrenamiento hacia las 5.000 iteraciones externas de Self-Forcing seguía en curso cuando se preparó la release. No es un checkpoint de cuatro pasos muestreado con menos pasos, sino una ejecución de un paso entrenada específicamente. La arquitectura combina un backbone transformer causal con una rama VACE que construye una condicionamiento de 96 canales como `[inactive16, draft16, ones64]`, donde los primeros 16 canales corresponden al vídeo inactivo, los siguientes 16 al borrador editado y los últimos 64 a unos. Ambos componentes mantienen cachés KV que se limpian antes y después de cada vídeo, y la capacidad temporal se ajusta a la longitud latente de cada vídeo.

El muestreo utiliza `student_sample_steps=1`, `student_sample_type="sde"`, sigmas `[0.999, 0.0]`, ruido de contexto 0 y escala VACE 1. Con solo el paso temporal cero terminal tras el denoising, no hay re-ruido intermedio. El ruido inicial es un tensor de vídeo completo generado en CPU en FP32 con semilla 42000 y convertido al dispositivo y dtype del modelo. El contexto de texto es el embedding vacío archivado en `empty_prompt_context.pt`, con CFG 1, y el helper no realiza extracción de profundidad ni codificación de prompts. El VAE es una dependencia separada: el flujo combinado OpenVE usa el commit original de DiffSynth `d5d1d3914cdbcdea8e57865627b794068af4a3fa` con VAE tileado de tamaño (30,52) y stride (15,26), en un entorno de referencia con Torch 2.9.1 y Transformers 4.57.3.

## Capacidades

- Reparación de vídeo editado: recibe latentes de un borrador editado y de un vídeo inactivo, y devuelve latentes reparados que se decodifican con el VAE original de Wan.
- Generación de vídeo causal: produce un fotograma latente por chunk causal con dos pasadas de red por chunk (denoising a sigma 0,999 y commit de caché KV a sigma 0).
- Mantenimiento de contexto temporal mediante cachés KV en el backbone principal y en la rama VACE.
- Condicionamiento VACE de 96 canales con vídeo inactivo, borrador y máscara de unos.
- Muestreo de un solo paso con SDE y sigmas `[0.999, 0.0]`, sin re-ruido intermedio.
- Verificación en CPU: carga estricta sin fallback a pesos preentrenados, con `device="cpu"` y `dtype=torch.float32`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto, según la información disponible.

## Casos de uso

- Reparación de vídeo editado en postproducción: el modelo recibe el borrador editado y un vídeo inactivo del mismo tamaño y geometría, y devuelve latentes reparados que se decodifican con el VAE de Wan; es adecuado porque su entrenamiento Self-Forcing está orientado específicamente a corregir artefactos de edición sobre latentes normalizados.
- Integración en pipelines de edición de vídeo con VACE: el condicionamiento de 96 canales `[inactive16, draft16, ones64]` permite conectar el fixer con un editor de borradores upstream que aporte la instrucción de edición, mientras el fixer opera con contexto de texto vacío.
- Procesamiento de vídeo de 81 fotogramas a 832x480: el ejemplo de la model card muestra la forma latente `[B,16,21,60,104]`, lo que permite usar el modelo en clips de duración media con geometría concreta y reproducibilidad mediante la semilla 42000.
- Verificación y auditoría en CPU: la carga estricta en CPU con FP32 permite validar la integridad de los 1.264 tensores y la exportación (`export_verification.json`) antes de desplegar en GPU.
- Investigación en destilación de modelos de vídeo: al ser un estudiante de un paso inicializado desde un warm start causal de 1.000 actualizaciones, sirve como referencia para estudiar el efecto del número de actualizaciones (420 frente a las 5.000 previstas) en la calidad de reparación.
- Despliegue con FastGen y Diffusers: el paquete está pensado para ejecutarse con el commit fijado de FastGen y las versiones concretas de PyTorch, Diffusers, Transformers y PEFT, lo que facilita la reproducibilidad en entornos de investigación.
- Comparación con el checkpoint de cuatro pasos: al existir un repositorio separado `primecai/fixer-combined-vace-self-forcing` con checkpoints de cuatro pasos, permite evaluar el compromiso entre coste computacional (dos pasadas por chunk) y calidad de reparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un informe de evaluación (`examples/sf1300/evaluation_report.json`) y un showreel (`examples/sf1300/showreel.mp4`) correspondientes al checkpoint anterior SF1300, pero no se proporcionan métricas numéricas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo tiene 1.300 millones de parámetros y se ejecuta en bfloat16, por lo que los pesos ocupan aproximadamente 2,6 GB, a lo que hay que sumar las cachés KV y los tensores de activación del VAE.
- GPU recomendadas: no disponibles en la información proporcionada; el muestreo requiere CUDA.
- Cabe en GPU de consumo: no confirmado en la información disponible; por tamaño de parámetros (1.3B en bfloat16) es plausible en GPUs de consumo con VRAM suficiente, pero no se especifica.
- Opciones de despliegue: FastGen en el commit `c40fbea17b9a28a38528ee5254471dac4f2f9f12`, con PyTorch 2.8.0, Diffusers 0.35.1, Transformers 4.49.0 y PEFT 0.17.1; el VAE se ejecuta por separado con DiffSynth en el commit `d5d1d3914cdbcdea8e57865627b794068af4a3fa`, Torch 2.9.1 y Transformers 4.57.3. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; se sabe que el sampler realiza dos pasadas de red por chunk y que el ruido inicial se genera en CPU en FP32 antes de convertirlo al dispositivo.
- Carga en CPU: soportada para verificación con `device="cpu"` y `dtype=torch.float32`, con carga estricta sin fallback.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fixer-combined-vace-self-forcing-1step (SF2100) | 1.3B | No disponible | Self-Forcing de un paso para reparación de vídeo | No disponible | Hugging Face, 8,6 GB |
| primecai/fixer-combined-vace-self-forcing | No disponible | No disponible | Checkpoints de cuatro pasos del mismo proyecto | No disponible | Hugging Face |
| Wan 2.1 VACE 1.3B | 1.3B | No disponible | Modelo base de edición de vídeo con VACE | No disponible | Diffusers (`Wan2.1-VACE-1.3B-diffusers`) |

La comparación con alternativas de la misma categoría (reparación de vídeo con destilación de un paso) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un paquete exclusivamente de inferencia: no incluye estados del optimizador, modelo de puntuación falso, discriminador ni pesos del profesor, por lo que no se puede reanudar el entrenamiento.
- El entrenamiento hacia las 5.000 iteraciones externas de Self-Forcing seguía en curso; el checkpoint SF2100 corresponde a 420 actualizaciones del estudiante y puede no representar el estado final óptimo.
- Requiere versiones muy concretas de dependencias (FastGen en un commit fijo, PyTorch 2.8.0, Diffusers 0.35.1, Transformers 4.49.0, PEFT 0.17.1), lo que dificulta la integración en entornos con otras versiones.
- El VAE es una dependencia separada con su propio entorno (DiffSynth en un commit fijo, Torch 2.9.1, Transformers 4.57.3), lo que añade complejidad operativa.
- El contexto de texto es un embedding vacío archivado con CFG 1; el modelo no procesa instrucciones de edición, que deben aportarse desde el editor de borradores upstream.
- No se debe sustituir el primer fotograma RGB del borrador editado por el fotograma fuente original, empalmar un latente objetivo ni recortar el fotograma cero generado; hay que preservar la orientación y el número de fotogramas de entrada.
- El tensor `inactive` debe ser un vídeo RGB de todo ceros en espacio normalizado `[-1,1]` con la misma geometría, no un tensor de ceros latentes; no se debe aplicar normalización de nuevo a `draft` ni a `inactive`.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial.
- No hay información sobre sesgos, riesgo de alucinación, limitaciones de idioma ni resultados de benchmarks del checkpoint SF2100.
- El repositorio no registra descargas ni likes, lo que limita la validación por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/primecai/fixer-combined-vace-self-forcing-1step)
- [Checkpoint de cuatro pasos: primecai/fixer-combined-vace-self-forcing](https://huggingface.co/primecai/fixer-combined-vace-self-forcing)
- [Carpeta del checkpoint 2100](https://huggingface.co/primecai/fixer-combined-vace-self-forcing-1step/tree/main/checkpoints/2100)
- [FastGen commit c40fbea17b9a28a38528ee5254471dac4f2f9f12](https://github.com/NVlabs/FastGen/tree/c40fbea17b9a28a38528ee5254471dac4f2f9f12)
- [DiffSynth commit d5d1d3914cdbcdea8e57865627b794068af4a3fa](https://github.com/modelscope/DiffSynth-Studio)
