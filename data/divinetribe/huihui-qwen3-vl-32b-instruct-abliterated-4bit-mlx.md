# divinetribe/Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx

## Resumen

Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx es una cuantizacion en 4 bits con formato MLX del modelo multimodal Qwen3-VL-32B-Instruct, previamente sometido a un proceso de "abliteration" (proyeccion fuera de la direccion de rechazo) por parte de huihui-ai. Lo publica el usuario divinetribe y su proposito es permitir inferencia vision-lenguaje totalmente local en Apple Silicon, sin dependencia de la nube ni de claves de API. Con 33.357.390.064 parametros reales en safetensors y un peso en disco de aproximadamente 17-19,6 GB, esta pensado para Mac con 32 GB de memoria unificada o mas.

La arquitectura subyacente es Qwen3-VL en variante densa de 32B, con entrada de texto e imagen y salida de texto, y una ventana de contexto de 262.144 tokens (256 K nativos segun el modelo upstream). El autor lo presenta como la primera cuantizacion en formato MLX de un Qwen3-VL abliterado, lo que cubre un nicho concreto: flujos de vision-lenguaje donde el filtrado de seguridad del modelo original introduce friccion (investigacion en seguridad, moderacion de contenido, OCR de documentos sensibles).

La relevancia actual es doble: por un lado, Qwen3-VL es una de las familias abiertas mas capaces en su clase de tamano para tareas multimodales; por otro, la combinacion de cuantizacion 4-bit MLX y abliteration permite ejecutar un modelo de 32B en hardware de consumo Apple con un consumo de memoria contenido, algo impensable con los pesos BF16 originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL, transformer denso multimodal (image-text-to-text) |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256 K nativos) |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX) |
| Idiomas soportados | en (segun model card; el modelo base Qwen3-VL es multilingue, pero la ficha solo declara ingles) |
| Licencia | Apache 2.0 (heredada de Qwen3-VL-32B-Instruct) |
| Formato de pesos | safetensors en formato MLX (mlx-4bit) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion, no un entrenamiento nuevo. La cadena es: Qwen3-VL-32B-Instruct de Alibaba Qwen (transformer denso multimodal con atencion completa y ventana de 256 K tokens) pasa por huihui-ai, que aplica abliteration mediante proyeccion de la direccion de rechazo siguiendo el enfoque de Arditi et al. (2024, arXiv:2406.11717). Posteriormente, divinetribe convierte los pesos BF16 resultantes a 4-bit affine con group size 64 usando mlx-vlm 0.4.4, generando safetensors en formato MLX.

La innovacion tecnica relevante en el modelo base es el tratamiento del video: Qwen3-VL sustituye T-RoPE por marcas de tiempo textuales explicitas, lo que permite ingerir video como secuencia de fotogramas con referencia temporal. La abliteration no mejora capacidades generales; su unico efecto es suprimir la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo no se niegue ante consultas benignas pero delicadas. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo original en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multimodal: responde preguntas sobre imagenes individuales y multiples.
- Comprension de multiples imagenes en una misma conversacion (comparacion de diagramas, resumen de capturas de pantalla).
- Comprension de video mediante ingestion fotograma a fotograma con marcas de tiempo textuales.
- OCR y extraccion de texto de documentos e imagenes.
- Conversacion multi-turno con contexto largo (hasta 262 K tokens).
- Salida de texto unicamente (no genera imagenes ni audio).
- Capacidades de codigo y matematicas heredadas del modelo base Qwen3-VL-32B-Instruct (no cuantificadas en la informacion disponible).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles; el modelo base es multilingue pero no se detalla en la ficha.
- Modo thinking explicito, vision o audio adicional: no disponible.

## Casos de uso

- Preguntas y respuestas visuales sobre imagenes individuales en local: el modelo procesa la imagen y el prompt en el mismo forward pass, sin salida a la nube, lo que permite analizar capturas, fotografias o diagramas en un Mac de 32 GB o mas.
- Razonamiento multi-imagen: comparar dos diagramas de arquitectura, resumir un volcado de capturas de pantalla o contrastar versiones de un documento escaneado aprovechando la ventana de 262 K tokens.
- Comprension de video por fotogramas: extraer fotogramas de un video y pasarlos como secuencia con marcas de tiempo textuales para resumir eventos o describir escenas.
- OCR de documentos sensibles: digitalizar y extraer texto de documentos que no deben salir de la maquina (NDAs, historiales medicos, declaraciones selladas), ya que la inferencia es totalmente on-device.
- Revision de documentos para cumplimiento normativo: analizar contratos o expedientes en flujos donde el envio a APIs de vision en la nube registraria el contenido.
- Investigacion en seguridad y moderacion de contenido: probar clasificadores o flujos de moderacion con un modelo que no rechaza consultas benignas pero delicadas, evitando el ruido que introduce el filtrado del modelo original.
- Servidor local compatible con OpenAI: desplegar un endpoint `http://localhost:8080/v1/chat/completions` con `mlx_vlm.server` para integrar vision-lenguaje en herramientas internas sin telemetria ni claves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 17-19,6 GB en disco; el autor recomienda un Mac con 32 GB de memoria unificada como minimo y lo describe como "agil" en 64 GB o mas.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4) con 32 GB de memoria unificada o superior. No es compatible con CUDA ni con GPUs NVIDIA por el formato MLX.
- Cabe en GPU de consumo: si, en Mac con 32 GB o mas de memoria unificada. No aplica a RTX 4090 ni A100/H100 por el formato.
- Opciones de despliegue: mlx-vlm (Python), CLI `python -m mlx_vlm.generate`, servidor local compatible con OpenAI (`python -m mlx_vlm.server`). No compatible con vLLM, llama.cpp, Ollama ni TGI por el formato MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx (este) | 33,36 B | 262 K | texto + imagen | 4-bit MLX | Apache 2.0 | Hugging Face, formato MLX |
| Qwen3-VL-32B-Instruct (upstream) | 32 B (clase) | 256 K | texto + imagen | BF16 y otras | Apache 2.0 | Hugging Face |
| Huihui-Qwen3-VL-32B-Instruct-abliterated (BF16) | 32 B (clase) | 256 K | texto + imagen | BF16 | Apache 2.0 | Hugging Face |
| Cuantizaciones MLX no abliteradas (mlx-community, lmstudio-community) | 32 B (clase) | 256 K | texto + imagen | 3-bit a 8-bit MLX | Apache 2.0 | Hugging Face |

La diferencia clave de este modelo frente a las alternativas es la combinacion de abliteration y formato MLX 4-bit; las cuantizaciones MLX no abliteradas cubren el mismo rango de bits pero conservan el filtrado de seguridad original, y la version BF16 abliterada exige mucha mas memoria (los pesos BF16 de un 32B no caben comodamente en un Mac de 32 GB).

## Limitaciones y advertencias

- La abliteration suprime la direccion de rechazo del modelo: puede producir contenido que el modelo original rechazaria. No es una mejora de capacidades y traslada al usuario la responsabilidad del uso.
- Riesgo de alucinacion inherente a los modelos de lenguaje y vision-lenguaje; no se han publicado evaluaciones especificas de fidelidad para esta cuantizacion.
- La cuantizacion 4-bit puede degradar ligeramente la precision respecto a los pesos BF16, especialmente en tareas de OCR fino o razonamiento numerico.
- La model card solo declara soporte de ingles; el rendimiento en castellano no esta documentado y podria ser inferior al del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario sigue sujeto a la licencia del modelo upstream Qwen3-VL-32B-Instruct.
- El formato MLX limita el despliegue a Apple Silicon; no hay soporte para CUDA, ROCm ni CPU x86 convencional.
- El modelo solo emite texto: no genera imagenes, audio ni video.
- El repo declara 19,6 GB de tamano aunque el autor menciona unos 17 GB en disco; conviene verificar el espacio libre antes de la descarga.
- No hay datos publicados de benchmarks, latencia ni throughput para esta cuantizacion concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-32B-Instruct-abliterated
- Organizacion Qwen en Hugging Face: https://huggingface.co/Qwen
- Organizacion huihui-ai: https://huggingface.co/huihui-ai
- Paper de abliteration (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Repositorio claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- Modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
- AirGap AI: https://nicedreamzwholesale.com/airgap/
