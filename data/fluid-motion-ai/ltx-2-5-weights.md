# Fluid-Motion-AI/ltx-2.5-weights

## Resumen

LTX-2.5 es un modelo de generación de vídeo de pesos abiertos publicado por Fluid-Motion-AI bajo el identificador `Fluid-Motion-AI/ltx-2.5-weights`. Se distribuye en formato diffusers y está orientado a la tarea image-to-video dentro de la familia LTX-Video, la línea de modelos desarrollada originalmente por Lightricks. El repositorio contiene 1.923.385.472 parámetros en safetensors y ocupa 208,8 GB, lo que indica que el peso real del modelo es sustancialmente mayor que el recuento de parámetros del checkpoint principal, probablemente por la inclusión de componentes auxiliares (VAE, text encoder y variantes). La model card describe la familia como el primer modelo de generación de vídeo basado en DiT (Diffusion Transformer) capaz de producir vídeo de alta calidad en tiempo real, con salida a 30 FPS y resolución 1216×704.

El modelo se presenta como una base ("foundation") sobre la que equipos pueden construir, afinar y desplegar por su cuenta, en lugar de una herramienta cerrada. Es relevante ahora porque combina pesos abiertos, integración nativa con `diffusers` (`LTXPipeline`) y flujos de trabajo listos para ComfyUI, lo que reduce la friccion de adopción para equipos que quieren pipelines de vídeo generativo autoalojados. La información pública disponible, sin embargo, es escasa en cuanto a detalles de entrenamiento, benchmarks y condiciones exactas de licencia.

La ficha se basa en los datos del repositorio de Hugging Face y en la model card del autor; los apartados que no aparecen en esas fuentes se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para generación de vídeo; pipeline `LTXPipeline` de diffusers |
| Parametros totales | 1.923.385.472 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | Variantes fp8 publicadas en la familia LTX-Video (ltxv-13b-0.9.8-fp8, ltxv-13b-0.9.8-distilled-fp8, ltxv-2b-0.9.8-distilled-fp8); no se detallan cuantizaciones específicas para ltx-2.5 |
| Idiomas soportados | en (inglés) |
| Licencia | other (licencia personalizada; condiciones no detalladas en la información disponible) |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

LTX-2.5 se enmarca en la familia LTX-Video, descrita en la model card como el primer modelo de generación de vídeo basado en DiT capaz de generar vídeo de alta calidad en tiempo real. La arquitectura es, por tanto, un Diffusion Transformer aplicado a vídeo, con un pipeline de image-to-video expuesto a través de `diffusers` (`LTXPipeline`). El modelo produce vídeo a 30 FPS y resolución 1216×704, y según la model card lo hace "más rápido de lo que se puede ver", lo que implica latencias inferiores a la duración del clip generado.

La model card indica que el modelo se entrenó sobre un dataset a gran escala de vídeos diversos, pero no detalla el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO (poco habituales en modelos de difusión). Tampoco se especifican innovaciones técnicas concretas de ltx-2.5 más allá de la propia arquitectura DiT y la familia de variantes (dev, distilled, mix, fp8) que el autor documenta para LTX-Video. Toda la información sobre el proceso de entrenamiento de la versión 2.5 debe considerarse no disponible.

## Capacidades

- Generación de vídeo a partir de una imagen (image-to-video), tarea principal del pipeline.
- Generación de vídeo a 30 FPS y resolución 1216×704 según la model card de la familia.
- Generación en tiempo real: la model card afirma que el modelo produce vídeo más rápido de lo que se tarda en reproducirlo.
- Integración con `diffusers` mediante `LTXPipeline`, lo que permite uso programático en Python.
- Flujos de trabajo para ComfyUI disponibles en el repositorio `ComfyUI-LTXVideo` (para las variantes de la familia LTX-Video).
- Variantes de la familia con distintos compromisos calidad/velocidad/VRAM: dev, distilled, mix y fp8.
- Capacidades multilingües: solo inglés (`en`) según los metadatos.
- Tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión o audio: no disponibles; el modelo es de generación de vídeo, no un LLM.

## Casos de uso

- Previsualización de storyboards: a partir de un frame clave o un concept art, generar un clip corto que muestre movimiento y cámara, útil en preproducción audiovisual antes de rodar.
- Animación de imágenes fijas para publicidad: convertir un packshot o un render de producto en un clip de varios segundos con movimiento plausible, reduciendo el coste frente a producción 3D.
- Prototipado rápido de efectos visuales: generar plates animados para composición y pruebas de integración antes de invertir en renderizado final.
- Creación de contenido para redes sociales: producir clips verticales u horizontales a partir de una imagen base, con la ventaja de los 30 FPS y la resolución 1216×704 para formatos estándar.
- Iteración de dirección de arte: usar las variantes distilled o fp8 de la familia para ciclos rápidos de generación y comparación de propuestas con bajo consumo de VRAM.
- Investigación en modelos generativos de vídeo: fine-tuning sobre el checkpoint abierto para estudiar transferencia de dominio, control de movimiento o destilación, gracias a la disponibilidad de pesos en safetensors y pipeline en diffusers.
- Automatización de pipelines de contenido: integrar `LTXPipeline` en un servicio backend que reciba una imagen y devuelva un vídeo, aprovechando la velocidad de generación en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, CLIP score, VBench u otras) para ltx-2.5, y la página oficial de LTX no aporta cifras en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para ltx-2.5. Como referencia, la familia LTX-Video documenta variantes de 13B (mayor calidad, más VRAM), 2B (menor VRAM) y versiones fp8 (cuantizadas) para reducir el consumo.
- GPU recomendadas: no disponibles para ltx-2.5. Para la familia, la model card distingue entre configuraciones de alta VRAM (variante 13B dev) y configuraciones ligeras (2B distilled, fp8).
- ¿Cabe en GPU de consumo? No confirmado para ltx-2.5. Las variantes 2B distilled y fp8 de la familia están pensadas para "light VRAM usage", lo que sugiere que podrían ejecutarse en GPU de consumo de gama alta, pero no hay cifras publicadas.
- Opciones de despliegue: `diffusers` (`LTXPipeline`), ComfyUI (workflows en `ComfyUI-LTXVideo`), scripts `inference.py` con ficheros de configuración YAML del repositorio `Lightricks/LTX-Video`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: la model card afirma generación en tiempo real a 30 FPS y 1216×704, es decir, latencia inferior a la duración del clip, pero no se aportan números concretos de segundos por clip ni de throughput por GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| LTX-2.5 (este modelo) | 1.923.385.472 (safetensors) | 1216×704, 30 FPS | other | Pesos en Hugging Face, diffusers, ComfyUI |
| LTX-Video 13B (ltxv-13b-0.9.8-dev) | 13B (según nomenclatura) | 1216×704, 30 FPS | no disponible en la información | Pesos y workflows publicados por Lightricks |
| LTX-Video 2B distilled (ltxv-2b-0.9.8-distilled) | 2B (según nomenclatura) | 1216×704, 30 FPS | no disponible en la información | Pesos y configuración publicados por Lightricks |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos competidores de otras familias en la información proporcionada, por lo que la comparación se limita a las variantes de la propia familia LTX-Video.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés (`en`); los prompts en otros idiomas pueden degradar la calidad o no funcionar correctamente.
- Licencia "other": las condiciones exactas no están detalladas en la información disponible. Es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial o redistribution.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir movimiento, físicas o detalles inconsistentes con la imagen de entrada; no hay métricas publicadas que cuantifiquen esta tasa.
- Sesgos: no se documentan sesgos conocidos en la información disponible; el dataset de entrenamiento no está descrito, lo que impide evaluar su composición y posibles sesgos de representación.
- Contexto: al ser un modelo de difusión de vídeo, no aplica la noción de ventana de contexto de un LLM; la limitación relevante es la duración máxima de clip soportada, que no se especifica.
- Tamaño del repositorio: 208,8 GB, lo que exige almacenamiento considerable y complica el despliegue en entornos con disco limitado.
- Madurez: el repositorio tiene 0 likes y 326 descargas en el momento de la consulta, lo que sugiere adopción temprana y poca validación comunitaria.
- Producción: la ausencia de benchmarks publicados y de detalles de entrenamiento dificulta justificar decisiones de despliegue basadas en evidencia; se recomienda evaluar con un conjunto propio antes de integrar en un pipeline crítico.

## Enlaces

- Hugging Face: https://huggingface.co/Fluid-Motion-AI/ltx-2.5-weights
- Página oficial de LTX-2.5: https://ltx.io/model/ltx-2-5
- Repositorio de código LTX-Video: https://github.com/Lightricks/LTX-Video
- Workflows de ComfyUI para LTX-Video: https://github.com/Lightricks/ComfyUI-LTXVideo
- Configuración ltxv-13b-0.9.8-dev: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-13b-0.9.8-dev.yaml
- Configuración ltxv-13b-0.9.8-dev-fp8: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-13b-0.9.8-dev-fp8.yaml
- Configuración ltxv-2b-0.9.8-distilled: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-2b-0.9.8-dev.yaml
- Workspace de LTX Studio (modelo ltxv-13b): https://app.ltx.studio/motion-workspace?videoModel=ltxv-13b
