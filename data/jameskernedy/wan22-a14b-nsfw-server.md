# jameskernedy/wan22-a14b-nsfw-server

## Resumen

Wan 2.2 I2V A14B + NSFW LoRA endpoint es un repositorio de despliegue, no un modelo entrenado desde cero: empaqueta el modelo de generación de vídeo a partir de imagen (image-to-video, I2V) `Wan-AI/Wan2.2-I2V-A14B-Diffusers` junto con un LoRA de contenido para adultos (`lopi999/Wan2.2-I2V_General-NSFW-LoRA`) dentro de un servidor personalizado pensado para Hugging Face Inference Endpoints. Lo publica el usuario jameskernedy bajo licencia Apache 2.0 y está etiquetado como `not-for-all-audiences`.

El modelo base Wan 2.2 I2V A14B es un sistema de difusión con arquitectura de dos expertos (MoE): un transformer de alto ruido y un segundo transformer de bajo ruido (`transformer_2`) que se reparten el proceso de denoising según un umbral temporal. El repositorio carga ambos en bf16 sobre una GPU A100 de 80 GB y expone una API HTTP (`/i2v`) que recibe una imagen y un prompt de movimiento y devuelve un MP4 codificado en base64.

Su relevancia es práctica: demuestra cómo servir un pipeline de vídeo generativo de gran tamaño en infraestructura gestionada, con control del LoRA en caliente mediante el endpoint `/setlora` y configuración de escalado a cero. No aporta pesos nuevos ni benchmarks propios; su valor está en la integración y la operativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión con dos expertos (MoE): transformer de alto ruido + transformer_2 de bajo ruido |
| Parametros totales | no disponible (el nombre comercial indica A14B; el autor no detalla el recuento) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a un pipeline de difusión) |
| Tipos de cuantizacion | bf16 en el despliegue de referencia; no se documentan otras |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (LoRA: `NSFW-22-H-e8.safetensors`, `NSFW-22-L-e8.safetensors`); pesos del modelo base en formato Diffusers |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: compone el pipeline `Wan-AI/Wan2.2-I2V-A14B-Diffusers` con un LoRA de dos ficheros. El experto de alto ruido (`transformer`) recibe el LoRA `NSFW-22-H-e8.safetensors` y opera en la fase inicial del denoising (t ≥ boundary); el experto de bajo ruido (`transformer_2`) recibe `NSFW-22-L-e8.safetensors` y opera en la fase final (t < boundary). Ambos se cargan en bf16. El LoRA se activa incluyendo la palabra disparadora `nsfwsks` en el prompt y su escala se ajusta en caliente entre 0.0 y 2.0 mediante `POST /setlora`, que la aplica a los dos expertos de forma conjunta.

El servidor se ejecuta sobre la imagen `pytorch/pytorch:2.6.0-cuda12.4-cudnn9-runtime` con el comando `bash /repository/run.sh`, escucha en el puerto 8080 y expone una ruta de salud `/health`. El despliegue de referencia es un endpoint personalizado privado con escalado a cero (mínimo 0, máximo 1 instancia) en AWS `us-east-1` sobre una NVIDIA A100 de 80 GB. No se documentan en la información disponible los datos de entrenamiento del modelo base, el uso de RLHF/DPO ni innovaciones de decodificación.

## Capacidades

- Generación de vídeo a partir de una imagen (image-to-video) con prompt de movimiento, devolviendo MP4 en base64.
- Control fino de la generación mediante prompt, prompt negativo, semilla, número de fotogramas, resolución, guidance y pasos de muestreo.
- Valores por defecto: 81 fotogramas (5 s a 16 fps), 832×480, guidance 5.0, 30 pasos (máximo 50), semilla 42.
- Aplicación de un LoRA de contenido para adultos con palabra disparadora `nsfwsks` y escala ajustable de 0.0 a 2.0.
- API HTTP síncrona con metadatos de respuesta (`ok`, `ms`, `n`, `frames`, `size`, `fps`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés según la model card.
- Capacidades especiales: ninguna adicional documentada (sin visión descriptiva, audio ni modo thinking).

## Casos de uso

- Prototipado de animación de imagen fija: enviar una fotografía o ilustración a `/i2v` con un prompt de movimiento y obtener un clip de 5 s a 16 fps, útil para validar conceptos antes de invertir en producción.
- Investigación sobre difusión de vídeo: el endpoint permite experimentar con el reparto entre expertos de alto y bajo ruido y medir el efecto de `guidance`, `steps` y semilla sobre la coherencia temporal.
- Evaluación de LoRAs sobre Wan 2.2: el endpoint `/setlora` permite barrer escalas entre 0.0 y 2.0 sin recargar el modelo, lo que facilita estudios comparativos de adaptadores.
- Generación de contenido para adultos en entornos controlados: el LoRA y la marca `not-for-all-audiences` están pensados para despliegues privados con acceso restringido, no para servicios públicos.
- Creación de clips cortos para redes o previsualizaciones: con 81 fotogramas y 832×480 se obtienen piezas breves listas para revisión, a coste contenido gracias al escalado a cero del endpoint.
- Integración en pipelines creativos internos: la respuesta en base64 con metadatos de duración y resolución permite encadenar el vídeo con herramientas de postproducción o almacenamiento automático.
- Pruebas de infraestructura de inferencia: sirve como caso de referencia para medir arranque en frío, throughput y consumo de VRAM de un pipeline de vídeo de gran tamaño en A100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el despliegue de referencia usa una A100 de 80 GB en bf16 para cargar ambos expertos; no se documenta el consumo real ni opciones de menor precisión.
- GPU recomendadas: NVIDIA A100 de 80 GB (configuración validada por el autor). Para H100 no hay datos publicados.
- GPU de consumo: no disponible; no se documenta que quepa en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: Hugging Face Inference Endpoints con tipo Custom server, imagen `pytorch/pytorch:2.6.0-cuda12.4-cudnn9-runtime`, comando `bash /repository/run.sh`, puerto 8080 y ruta `/health`; escalado a cero con mínimo 0 y máximo 1 instancia en AWS `us-east-1`.
- Latencia y throughput: no disponibles; la respuesta incluye el campo `ms` con el tiempo de generación medido en cada petición.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan 2.2 I2V A14B + NSFW LoRA (este repositorio) | Difusión I2V con dos expertos + LoRA | A14B (recuento no detallado) | no aplica | apache-2.0 | Endpoint personalizado en HF, 0 descargas |
| Wan-AI/Wan2.2-I2V-A14B-Diffusers | Difusión I2V con dos expertos | A14B (recuento no detallado) | no aplica | no disponible en esta ficha | Modelo base en Hugging Face |
| lopi999/Wan2.2-I2V_General-NSFW-LoRA | LoRA sobre Wan 2.2 I2V | no disponible | no aplica | no disponible en esta ficha | Adaptador en Hugging Face |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio está marcado `not-for-all-audiences`; no debe exponerse en servicios públicos ni sin control de edad y verificación de usuarios.
- Licencia: el código y el empaquetado se declaran Apache 2.0, pero la licencia del modelo base y del LoRA debe verificarse por separado antes de un uso comercial.
- Idioma: la model card declara únicamente inglés, lo que limita los prompts en castellano.
- Sesgos: no documentados por el autor; al tratarse de un modelo de difusión de vídeo, puede reproducir sesgos de representación de los datos de entrenamiento del modelo base.
- Alucinación visual: no hay métricas publicadas de fidelidad temporal ni de coherencia entre fotogramas; la calidad debe validarse empíricamente.
- Resolución y duración fijas por defecto: 832×480 y 81 fotogramas (5 s a 16 fps); ampliar estos valores puede agotar la VRAM de la A100.
- Requisito de preprocesado: la imagen de entrada debe redimensionarse manualmente al tamaño solicitado antes del envío.
- Operativa: el endpoint arranca en frío (mínimo 0 instancias), lo que añade latencia a la primera petición.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jameskernedy/wan22-a14b-nsfw-server
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- LoRA NSFW: https://huggingface.co/lopi999/Wan2.2-I2V_General-NSFW-LoRA
