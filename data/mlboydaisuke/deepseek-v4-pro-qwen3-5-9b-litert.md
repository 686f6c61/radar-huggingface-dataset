# mlboydaisuke/DeepSeek-V4-Pro-Qwen3.5-9B-LiteRT

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-LiteRT es una conversión al formato LiteRT-LM del checkpoint Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario mlboydaisuke. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia en dispositivo (on-device) y entornos edge, empaquetada en dos ficheros `.litertlm` con pesos mayoritariamente int8. El objetivo es permitir ejecutar un modelo de clase 9B en GPU móviles y en hardware Apple Silicon mediante el runtime LiteRT-LM de Google AI Edge.

El modelo base combina, según las etiquetas del repositorio, una arquitectura híbrida con capas Gated DeltaNet y componentes Qwen3.5, orientada a generación de texto con modo de razonamiento (thinking) activado por defecto. La conversión conserva únicamente la parte textual del checkpoint original, por lo que no acepta entrada de imágenes, y fija una longitud de contexto de 4.096 tokens.

Su relevancia actual radica en que demuestra la viabilidad de desplegar un modelo de ~9B parámetros cuantizado a int8 en un smartphone de gama alta (Pixel 9 Pro, Tensor G4, 16 GB) y en un Mac con M4 Max, con una tasa de decodificación reportada de 50,48 tok/s en GPU. Es, por tanto, un artefacto de interés para quien evalúe inferencia local en el edge más que para quien busque el modelo canónico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Gated DeltaNet (etiquetas `hybrid`, `gated-deltanet`, `qwen3_5`); detalles completos no disponibles |
| Parametros totales | ~9B (deducido del nombre y del tamano de los ficheros int8, ~9,17 GB); cifra exacta no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens (fijada en los ficheros convertidos) |
| Tipos de cuantizacion | int8 (mayoritariamente); no se detallan esquemas por capa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`), dos variantes: `_v0200` y `_v0190` |

## Arquitectura y entrenamiento

La información disponible no describe el proceso de entrenamiento del modelo base: no se indican número de tokens, composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento. Las etiquetas del repositorio apuntan a una arquitectura híbrida que combina atención con capas Gated DeltaNet (un mecanismo de estado recurrente lineal) y componentes asociados a Qwen3.5, lo que sugiere un diseño orientado a reducir el coste de atención en contextos largos y en inferencia sobre hardware limitado. El modelo base es Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, y esta publicación es una cuantización del mismo, no un reentrenamiento.

La innovación técnica relevante aquí no está en el modelo sino en el empaquetado: la conversión a LiteRT-LM genera dos ficheros compuestos para GPU con pesos int8, uno para LiteRT-LM 0.20.0 y otro para 0.19.x, con diferencias en el layout de los canales de estado de la convolución corta (channels-first frente a channels-last). El runtime aplica decodificación con caché de pesos y de programa en GPU OpenCL, y el modo de razonamiento se emite entre marcadores `[thought]` y `[/thought]` antes de la respuesta final.

## Capacidades

- Generación de texto autoregresiva con modo de razonamiento (thinking) activado por defecto: el modelo produce un bloque de pensamiento antes de la respuesta.
- Razonamiento multi-paso implícito en el bloque de pensamiento, útil para preguntas que requieren descomposición.
- Generación de código y matemáticas: capacidad esperable por el linaje del modelo base, aunque no se documentan evaluaciones específicas en esta conversión.
- Procesamiento exclusivamente textual: los ficheros contienen solo la parte de texto del checkpoint, sin torre de visión ni entrada de imágenes.
- Multilingüismo: no disponible; no se declaran idiomas soportados.
- Tool calling y function calling: no disponible; no se documenta soporte en esta conversión.
- Soporte de agentes: no disponible; no hay evidencia de integración con frameworks de agentes.
- Ejecución on-device en GPU móvil (Android, OpenCL) y en GPU/CPU de Apple Silicon mediante LiteRT-LM.

## Casos de uso

- Asistente local en smartphone de gama alta: el fichero `_v0190` se ejecutó en un Pixel 9 Pro (Tensor G4, 16 GB) sobre GPU OpenCL, lo que permite prototipar asistentes sin conexión con un modelo de 9B y 4.096 tokens de contexto.
- Inferencia privada en el dispositivo: al no requerir servidor, encaja en escenarios donde los datos no deben salir del terminal, como borradores de texto o consultas sobre documentos locales de extensión moderada.
- Pruebas de razonamiento en edge: el modo thinking por defecto permite evaluar cadenas de razonamiento en hardware móvil y medir latencia real de decodificación (50,48 tok/s en M4 Max GPU con 0.19.2).
- Desarrollo y benchmarking de LiteRT-LM: los dos ficheros sirven para validar versiones del runtime (0.19.x frente a 0.20.0) y detectar regresiones de layout en GPU, como la descrita en LiteRT #11565.
- Prototipado en Mac para portar a móvil: el flujo con `uvx --from litert-lm` permite iterar en Apple Silicon antes de desplegar en Android, con comandos idénticos salvo la versión del runtime.
- Generación de código asistida en local: para tareas acotadas (funciones, explicaciones, refactorizaciones pequeñas) donde 4.096 tokens de contexto bastan y se prefiere no depender de la nube.
- Evaluación de cuantización int8 en calidad: comparar las salidas del fichero int8 frente al checkpoint original para medir degradación en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento reportados son de velocidad, no de calidad:

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificacion | 50,48 tok/s | Mac Apple M4 Max, GPU, fichero `_v0190`, LiteRT-LM 0.19.2 |
| Inicializacion (primer arranque) | 160 s | Pixel 9 Pro, GPU OpenCL, escritura de caches |
| Inicializacion (arranques posteriores) | 19-42 s | Pixel 9 Pro, GPU OpenCL, caches ya presentes |

## Requisitos de hardware

- VRAM/almacenamiento: cada fichero pesa ~9,17 GB (9.169.043.456 bytes el `_v0200`; 9.168.846.848 bytes el `_v0190`). En GPU móvil, el `_v0190` genera además una caché de pesos de 8.961.875.984 bytes y una caché de programa de 36.761.816 bytes, por lo que el espacio ocupado en el teléfono se aproxima al doble del tamaño del fichero.
- Memoria disponible en teléfono: en el Pixel 9 Pro, tras cerrar aplicaciones en segundo plano, había 11,66-11,87 GB libres antes de las ejecuciones en GPU y un mínimo de 0,43 GB durante ellas. Los ficheros no caben en la GPU de un teléfono de 8 GB.
- GPU recomendadas: Apple M4 Max (medido, GPU y CPU), Pixel 9 Pro con Tensor G4 y 16 GB (medido, GPU). En un Pixel 11 Pro (16 GB) la ejecución en GPU se detuvo al bajar la memoria disponible a 0,59 GB. En Galaxy S26 (Snapdragon SM8850) no se iniciaron por reinicios del dispositivo con otro fichero int8 de clase 8B.
- Consumer GPU de escritorio: no se documentan pruebas en RTX 4090, A100 ni H100; el runtime LiteRT-LM está orientado a edge y Apple Silicon.
- Opciones de despliegue: LiteRT-LM 0.20.0 (`_v0200`) y 0.19.x (`_v0190`), vía CLI con `uvx --from litert-lm==<version>` o binario Android `litert_lm_main`. Requiere Python 3.10 o superior. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Caché en CPU: con copia local, el comando de CPU generó un fichero de caché XNNPACK de 7.974.599.104 bytes junto al modelo.
- Latencia: 50,48 tok/s en M4 Max GPU; inicialización de 19-42 s en Pixel 9 Pro tras el primer arranque.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-LiteRT (este) | ~9B | 4.096 | LiteRT-LM int8 | Apache 2.0 | Hugging Face, 64 descargas |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | ~9B | no disponible | safetensors (presumible) | no disponible | Hugging Face |
| Otros modelos 8B-9B int8 para edge | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Solo texto: los ficheros no incluyen la torre de visión del checkpoint original; cualquier caso de uso multimodal queda fuera de alcance.
- Contexto reducido: 4.096 tokens fijados en la conversión, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Incompatibilidad entre ficheros y versiones del runtime: el `_v0190` falla en la GPU de LiteRT-LM 0.20.0 (error de layout channels-first frente a channels-last, LiteRT #11565) y el `_v0200` produce caracteres incoherentes en la GPU de 0.19.x. Es obligatorio emparejar fichero y versión.
- Requisitos de memoria elevados para móvil: no cabe en GPU de teléfonos de 8 GB; en Pixel 11 Pro se abortó por falta de memoria; no verificado en iPhone (iOS) ni ejecutado en CPU de ningún teléfono.
- Cachés de gran tamaño en Android: la caché de pesos duplica aproximadamente el espacio ocupado en almacenamiento.
- Sin verificación en versiones antiguas: no se probó en LiteRT-LM 0.19.0 ni 0.19.1 de PyPI, ni en releases anteriores a 0.19.0; en Pixel 8a las builds Android 0.18.0 y 0.18.1 provocaron fallos en GPU.
- Riesgo de alucinación: no evaluado en esta conversión; el modo thinking por defecto puede producir cadenas de razonamiento plausibles pero incorrectas, como sugiere el ejemplo de la model card donde el bloque de pensamiento termina en `Paris.cw`.
- Idiomas y sesgos: no disponibles; no se declara cobertura lingüística ni evaluación de sesgos.
- Licencia Apache 2.0 en la conversión, pero la licencia y condiciones del checkpoint base (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) no se detallan en la información disponible; conviene verificarlas antes de uso comercial.
- Madurez: 64 descargas y 0 likes en el momento de la consulta; artefacto reciente (creado el 2026-11-24) y sin validación comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/DeepSeek-V4-Pro-Qwen3.5-9B-LiteRT
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Fichero para LiteRT-LM 0.20.0: https://huggingface.co/mlboydaisuke/DeepSeek-V4-Pro-Qwen3.5-9B-LiteRT/blob/main/DeepSeek-V4-Pro-Qwen3.5-9B_int8_gpu_composite_v0200.litertlm
- Fichero para LiteRT-LM 0.19.x: https://huggingface.co/mlboydaisuke/DeepSeek-V4-Pro-Qwen3.5-9B-LiteRT/blob/main/DeepSeek-V4-Pro-Qwen3.5-9B_int8_gpu_composite_v0190.litertlm
- Notas de verificación: https://huggingface.co/mlboydaisuke/DeepSeek-V4-Pro-Qwen3.5-9B-LiteRT/blob/main/checks.md
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Commit de la build Android usada: https://github.com/google-ai-edge/LiteRT-LM/commit/771b06e1a2c7f70a399a718599109facf37e38fd
- Pull request LiteRT #11565: https://github.com/google-ai-edge/LiteRT/pull/11565
- uv (gestor de paquetes usado en los comandos): https://github.com/astral-sh/uv
