# cokeadrink/h3-10eros-beta7-fix1-int8

## Resumen

`cokeadrink/h3-10eros-beta7-fix1-int8` es un paquete de caché de modelos para RunPod que reúne los ficheros necesarios para ejecutar el modelo de generación de vídeo a partir de imagen y texto 10Eros-Max Beta7 Fix1 en ComfyUI. No se trata de un modelo entrenado por el autor del repositorio: es una recopilación de ficheros de terceros copiados sin modificar desde fuentes fijadas, con el objetivo de acelerar el aprovisionamiento en infraestructura de inferencia.

El componente principal es un checkpoint de difusión derivado de TenStrip/10Eros-Max, construido sobre la familia MiniMax H3 y distribuido en INT8 nativo con ConvRot en las proyecciones interiores del transformer, precisión de origen en los bloques de borde protegidos (0, 1, 47, 48 y 49) y un acelerador Turbo embebido de ocho pasos. El paquete incluye además un codificador de texto Qwen3-VL 32B cuantizado en W4/W6, los VAE de vídeo (INT8) y audio (FP32) de MiniMax H3, y un upscaler latente 3D Conv FP16.

Su relevancia es operativa: condensa en un único repo de 42,4 GB todas las dependencias de un pipeline image-text-to-video listo para ComfyUI, con manifiesto de revisiones inmutables y hashes SHA-256. La licencia es la MiniMax H3 Community License Agreement, con términos territoriales y de redistribución que condicionan su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion para video (MiniMax H3) con checkpoint derivado de 10Eros-Max; transformer con proyecciones ConvRot, VAE de video y audio, y codificador de texto Qwen3-VL 32B |
| Parametros totales | No disponible (el checkpoint de difusion ocupa 22.935.823.672 bytes en INT8; el codificador de texto, 15.354.664.454 bytes en W4/W6) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 nativo con ConvRot (checkpoint de difusion y VAE de video), W4 con grupo de 128 y W6 en capas protegidas (codificador de texto), FP32 (VAE de audio), FP16 (upscaler latente) |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License Agreement (el upscaler LBH-123-AI se distribuye bajo Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo: agrega artefactos ya publicados. El checkpoint de difusión `10Eros_Max_h3_8stepTURBO_beta7_fix1-native_int8_protected_edges_HQ.safetensors` procede de TenStrip/10Eros-Max y aplica cuantización INT8 nativa con ConvRot en las proyecciones interiores del transformer, manteniendo la precisión original en los bloques de borde 0, 1, 47, 48 y 49. Incorpora un checkpoint Turbo embebido que permite generar en ocho pasos sin necesidad de un LoRA de aceleración adicional.

El codificador de texto es un Qwen3-VL de 32B cuantizado por LokkenJP en W4 con grupo de 128 y W6 en capas protegidas, con un tamaño de 15,35 GB. Los VAE provienen de Comfy-Org/MiniMax-H3 (vídeo INT8 ConvRot y audio FP32), y el upscaler latente 3D Conv v1 FP16 lo publica LBH-123-AI. El manifiesto `bundle-manifest.json` registra revisiones de origen inmutables, rutas originales, tamaños exactos y hashes SHA-256 de cada fichero. No se dispone de datos sobre volumen de tokens, composición del dataset ni etapas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de vídeo condicionada por imagen y por texto (pipeline `image-text-to-video`).
- Generación de audio asociada al vídeo mediante el VAE de audio FP32 incluido.
- Aceleración de muestreo en ocho pasos gracias al checkpoint Turbo embebido.
- Escalado latente 3D mediante el upscaler Conv v1 FP16, que permite aumentar la resolución del latente antes de decodificar.
- Comprensión multimodal de la entrada a través del codificador Qwen3-VL 32B, que aporta capacidad de interpretación de imagen y texto.
- Integración nativa con ComfyUI como entorno de ejecución (`library_name: comfyui`).
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Aprovisionamiento rápido en RunPod: el paquete está pensado como caché de modelos, de modo que un nodo de inferencia puede montar los ficheros ya resueltos y evitar descargas repetidas de los 42,4 GB en cada arranque.
- Generación de vídeo publicitario a partir de una imagen de producto: se introduce una fotografía fija como condicionamiento y un prompt descriptivo, y el checkpoint Turbo de ocho pasos produce un clip corto con movimiento coherente.
- Prototipado de vídeo con audio sincronizado: el VAE de audio FP32 permite generar la pista sonora en el mismo pipeline, útil para demos de animación o doblaje preliminar.
- Iteración de arte conceptual en estudios pequeños: con ocho pasos de muestreo y un upscaler latente, el coste por iteración se reduce frente a pipelines de difusión de vídeo de decenas de pasos, lo que facilita explorar variantes de una escena.
- Reproducibilidad de experimentos: el manifiesto con revisiones fijadas y hashes SHA-256 permite reconstruir exactamente el mismo entorno de inferencia en distintas máquinas, requisito habitual en evaluación comparativa de modelos generativos.
- Despliegue en flujos ComfyUI existentes: al estar empaquetado con la estructura de directorios esperada (`diffusion_models`, `text_encoders`, `vae`, `latent_upscale_models`), se integra en grafos de ComfyUI ya montados para tareas de vídeo.
- Evaluación interna de modelos derivados de MiniMax H3: sirve como base para comparar el efecto de la cuantización INT8 con bordes protegidos frente al modelo en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El autor advierte que los tamaños de fichero describen almacenamiento, no requisitos de memoria de GPU. Como referencia de magnitud, el checkpoint de difusión pesa 22,9 GB en INT8 y el codificador de texto 15,35 GB en W4/W6, por lo que la suma de pesos supera los 38 GB antes de contar activaciones y latentes.
- GPU recomendadas: no disponibles en la información proporcionada. Por volumen de pesos, un despliegue completo requiere GPU de centro de datos con 48-80 GB de VRAM (A100 80 GB, H100, L40S 48 GB) o reparto entre dispositivos.
- Cabe en GPU de consumo: no disponible. Un único RTX 4090 (24 GB) no puede alojar simultáneamente el checkpoint de difusión y el codificador de texto en los formatos incluidos; se requeriría descarga por etapas o intercambio de modelos en memoria.
- Opciones de despliegue: ComfyUI es el entorno declarado (`library_name: comfyui`). El paquete está orientado a caché de modelos en RunPod. Soporte para vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles. El checkpoint incorpora un Turbo de ocho pasos, lo que reduce el número de evaluaciones del transformer frente a muestreos largos, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cokeadrink/h3-10eros-beta7-fix1-int8 (este) | Paquete de caché para ComfyUI, vídeo imagen-texto | No disponible (22,9 GB checkpoint INT8 + 15,35 GB text encoder) | No disponible | MiniMax H3 Community License Agreement | Hugging Face, 0 descargas |
| TenStrip/10Eros-Max | Modelo base de difusión de vídeo | No disponible | No disponible | Términos comunitarios de MiniMax H3, LTX 2.3, Wan 2.2 y Krea 2 según la release de origen | Hugging Face |
| MiniMaxAI/MiniMax-H3 | Modelo fundacional de vídeo de MiniMax | No disponible | No disponible | MiniMax H3 Community License Agreement | Hugging Face |
| Comfy-Org/MiniMax-H3 | VAE y componentes de MiniMax H3 para ComfyUI | No disponible | No disponible | MiniMax H3 Community License Agreement | Hugging Face |

La comparación directa con alternativas de la misma categoría (por ejemplo, otros pipelines de vídeo para ComfyUI) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no es un modelo propio: es una copia de ficheros de terceros. No hay garantía de autoría, soporte ni mantenimiento por parte del publicador.
- La licencia MiniMax H3 Community License Agreement incluye términos territoriales, de uso y de redistribución que deben revisarse antes de cualquier despliegue comercial. El paquete no concede derechos adicionales ni modifica las licencias upstream.
- La release de origen de TenStrip indica que también aplican los términos comunitarios de LTX 2.3, Wan 2.2 y Krea 2 a las porciones derivadas de esos modelos; es necesario consultar la información de licencia de la release original.
- El upscaler de LBH-123-AI se distribuye bajo Apache-2.0, licencia distinta del resto del paquete.
- Solo se incluye una cuantización: no hay alternativas en el bundle, lo que limita el ajuste fino entre calidad y memoria.
- Los tamaños de fichero no equivalen a requisitos de VRAM; el autor lo advierte explícitamente. Planificar el hardware a partir del tamaño del repo lleva a infraestimaciones.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible para la salida de vídeo; no se documentan métricas de fidelidad prompt-vídeo.
- Limitaciones de contexto o idioma: no disponible.
- El repo registra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar su funcionamiento en producción.
- La fecha de creación y actualización (12 de noviembre de 2026) y la ausencia de documentación adicional impiden verificar la vigencia de las revisiones fijadas en el manifiesto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cokeadrink/h3-10eros-beta7-fix1-int8
- Modelo base 10Eros-Max: https://huggingface.co/TenStrip/10Eros-Max
- Codificador de texto cuantizado: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned
- Componentes MiniMax H3 para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo fundacional MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Upscaler latente 3D Conv v1: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
