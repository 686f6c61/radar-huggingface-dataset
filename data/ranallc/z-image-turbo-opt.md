# RanaLLC/Z-Image-Turbo-opt

## Resumen

Z-Image-Turbo-opt es una conversión optimizada a ONNX del modelo de difusión texto-a-imagen Tongyi-MAI/Z-Image-Turbo, publicada por RanaLLC. Su propósito no es ofrecer un modelo nuevo, sino un empaquetado listo para ejecución en navegador mediante ONNX Runtime Web, con soporte explícito para WebNN y WebGPU. El repositorio descompone el pipeline completo en submodelos ONNX especializados (codificador de texto, transformer de denoising, scheduler, VAE y comprobador de seguridad), lo que permite inferencia local en el cliente sin backend dedicado.

El modelo subyacente es un sistema de difusión texto-a-imagen de la familia Z-Image-Turbo, orientado a generación rápida de imágenes a partir de descripciones en lenguaje natural. La conversión mantiene la licencia Apache 2.0 del original y cuantiza las partes más costosas (codificador de texto y transformer) a Q4F16, mientras que el VAE y el comprobador de seguridad se mantienen en FP16.

La relevancia actual radica en que permite desplegar generación de imágenes en el navegador con aceleración por hardware (WebGPU/WebNN), eliminando la necesidad de GPUs en servidor y facilitando casos de uso con requisitos de privacidad o baja latencia. El tamaño del repositorio es de 6,6 GB, lo que condiciona el despliegue a conexiones de banda ancha o a precarga en caché.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión texto-a-imagen (submodelos ONNX: text encoder, transformer de denoising, scheduler, VAE y safety checker) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4F16 (text encoder y transformer), FP16 (scheduler, VAE, safety checker) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (submodelos separados bajo `onnx/`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un pipeline de difusión texto-a-imagen dividido en etapas ejecutables de forma secuencial. La primera etapa es un codificador de texto (`text_encoder_model_q4f16.onnx`) que transforma el prompt en embeddings condicionales. La segunda etapa es el transformer de denoising (`transformer_model_q4f16.onnx`), que predice los latentes de ruido a lo largo de las iteraciones de difusión, auxiliado por un scheduler (`scheduler_step_model_f16.onnx`) que calcula los latentes denoised en cada paso. La tercera etapa decodifica los latentes a espacio de píxeles mediante un preprocesado VAE (`vae_pre_process_model_f16.onnx`) y un decodificador VAE (`vae_decoder_model_f16.onnx`). Finalmente, una etapa de seguridad normaliza la imagen (`sc_prep_model_f16.onnx`) y la inspecciona con un comprobador de contenido (`safety_checker_model_f16.onnx`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La innovación técnica destacable de esta publicación es la exportación y optimización a ONNX con cuantización mixta Q4F16/FP16, orientada a ejecución en navegador mediante ONNX Runtime Web con backends WebNN y WebGPU. Los scripts de exportación y reproducción están incluidos en `model_exporter/README.md`.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image).
- Ejecución en navegador mediante ONNX Runtime Web con aceleración WebNN y WebGPU.
- Pipeline modular con submodelos separados para codificación de texto, denoising, decodificación VAE y verificación de seguridad.
- Comprobador de seguridad integrado que inspecciona las imágenes generadas antes de su entrega.
- Cuantización Q4F16 en las etapas más costosas para reducir el peso y el coste computacional en cliente.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de imágenes en el navegador sin backend: el pipeline ONNX completo se ejecuta en cliente con WebGPU/WebNN, lo que permite crear ilustraciones o avatares sin enviar datos a un servidor.
- Aplicaciones con requisitos de privacidad: al ejecutarse localmente, los prompts y las imágenes no salen del dispositivo, adecuado para entornos sanitarios, legales o educativos.
- Herramientas creativas de escritorio web: editores o lienzos online que generan borradores visuales a partir de descripciones, aprovechando la cuantización Q4F16 para reducir el uso de memoria.
- Prototipado rápido de productos de IA generativa: permite validar flujos de texto-a-imagen en demos web sin infraestructura GPU dedicada, usando el demo de WebNN Developer Preview como referencia.
- Filtrado y moderación de contenido generado: la etapa de safety checker integrada permite descartar imágenes no aptas antes de mostrarlas al usuario final.
- Educación y experimentación: investigadores y desarrolladores pueden estudiar el pipeline de difusión completo en un entorno reproducible en navegador, con submodelos separados y scripts de exportación incluidos.
- Aplicaciones offline o de baja conectividad: una vez cacheado el repositorio (6,6 GB), la generación puede realizarse sin conexión si el runtime y los pesos están disponibles localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 6,6 GB y la cuantización Q4F16 reduce el peso del text encoder y del transformer, mientras que VAE y safety checker se mantienen en FP16.
- GPU recomendadas: no disponible; el diseño está orientado a ejecución en navegador con WebGPU/WebNN, por lo que depende de la GPU del cliente y del soporte del navegador.
- Compatibilidad con GPU de consumo: no se documenta; la viabilidad depende de la implementación WebGPU del navegador y de la memoria disponible en el dispositivo.
- Opciones de despliegue: ONNX Runtime Web con backends WebNN y WebGPU; los scripts de exportación están en `model_exporter/README.md`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|
| RanaLLC/Z-Image-Turbo-opt | no disponible | no disponible | ONNX (Q4F16/FP16) | apache-2.0 | Sí (WebNN/WebGPU) |
| Tongyi-MAI/Z-Image-Turbo | no disponible | no disponible | PyTorch (original) | no disponible | No documentado |
| Otros pipelines texto-a-imagen ONNX | no disponible | no disponible | ONNX | variable | Parcial |

La comparativa se limita al modelo original y a la variante optimizada; no se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo original ni de esta conversión.
- Riesgo de alucinación visual: como todo modelo generativo texto-a-imagen, puede producir contenido inexacto o no fiel al prompt.
- Limitaciones de idioma: no se especifican los idiomas soportados por el codificador de texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia y condiciones del modelo original Tongyi-MAI/Z-Image-Turbo.
- El tamaño del repositorio (6,6 GB) puede ser prohibitivo para clientes con ancho de banda limitado o almacenamiento reducido.
- La ejecución en navegador depende del soporte de WebGPU/WebNN del navegador y del hardware del cliente; la compatibilidad no está garantizada en todos los dispositivos.
- El comprobador de seguridad integrado puede no cubrir todos los casos de contenido sensible; se recomienda validación adicional en producción.
- No se dispone de información sobre latencia, throughput ni calidad de imagen comparada con el modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RanaLLC/Z-Image-Turbo-opt
- Modelo original: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Demo interactivo WebNN: https://microsoft.github.io/webnn-developer-preview/demos/z-image-turbo/
- ONNX Runtime: https://github.com/microsoft/onnxruntime
- WebNN Developer Preview: https://github.com/microsoft/webnn-developer-preview
- Scripts de exportación: `model_exporter/README.md` (incluido en el repositorio)
