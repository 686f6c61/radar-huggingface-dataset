# SOLRICKS/LTX-2-5-ComfyUI-Workflows

## Resumen

Este repositorio de SOLRICKS no contiene el modelo LTX-2.5 en sí, sino un conjunto de flujos de trabajo (workflows) listos para usar en ComfyUI que facilitan la generación de vídeo con el modelo de Lightricks. El workflow principal permite alternar entre text-to-video (T2V) e image-to-video (I2V) desde un único nodo de control simplificado, con soporte para audio sincronizado, ajuste de resolución, FPS, semilla, duración y mejora de prompt sin necesidad de reconstruir el grafo.

El repositorio implementa una configuración de generación en dos etapas (generación y refinamiento) orientada a mejorar la calidad final del vídeo. Incluye además componentes adicionales como un LoRA de control (ltx-2.3-22b-ic-lora-union-control-ref0.5.safetensors) y un adaptador de audio (LTX-2.5-Audio-IC), lo que sugiere un flujo de trabajo más completo que el vanilla de ComfyUI. La relevancia de este repositorio radica en que LTX-2.5 se publicita como el modelo de generación de vídeo más rápido del mercado, con una nueva capacidad de renderizado de fidelidad de difusión que mejora texturas finas, rostros y planos complejos a detalle cinematográfico.

El repositorio tiene un tamaño de 2.0 GB, fue creado en agosto de 2026 y cuenta con 5 likes en Hugging Face. La licencia no está declarada, por lo que cualquier uso comercial requiere verificar los términos de la licencia del modelo subyacente de Lightricks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene workflows, no el modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (para los LoRA y adaptadores incluidos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo LTX-2.5 en los datos proporcionados. El repositorio contiene únicamente los grafos de ComfyUI y algunos adaptadores (LoRA y control de audio), no los pesos del modelo base. Según la documentación de ComfyUI y la web de Comfy, LTX 2.5 es un modelo de difusión para generación de vídeo que soporta text-to-video, image-to-video y first-last-frame, con audio sincronizado y escenas multishot nativas. La técnica destacada es la nueva "Diffusion Fidelity Rendering" que mejora el detalle de texturas, rostros y planos complejos.

El workflow del repositorio usa una configuración de dos etapas (generación y refinamiento) para mejorar la calidad. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens ni si se usó RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con control de resolución, FPS, duración y semilla.
- Generación de vídeo a partir de imagen (image-to-video) con el mismo nodo de control unificado.
- Soporte de audio sincronizado con el vídeo generado.
- Capacidad de multishot nativo (escenas múltiples en un mismo vídeo).
- Control de prompt enhancement (mejora de prompt) integrado en el workflow.
- Configuración de refinamiento en dos etapas para mejorar la fidelidad del resultado.
- Compatibilidad con LoRA de control (union-control-ref0.5) y adaptador de audio de control (LTX-2.5-Audio-IC).
- Ajuste manual del sampler, CFG, resolución y refinamiento desde el nodo principal.

## Casos de uso

- Producción de vídeo creativo rápido: el flujo T2V permite generar clips cinematográficos desde un prompt de texto en segundos, ideal para previsualizaciones y moodboards en estudios de diseño.
- Postproducción de vídeo con I2V: a partir de un fotograma clave o imagen de referencia, se puede generar una secuencia animada coherente para motion graphics o transiciones.
- Contenido para redes sociales: la generación en dos etapas con refinamiento ofrece calidad suficiente para vídeos cortos de plataformas como Instagram o TikTok sin necesidad de GPU de gran potencia.
- Prototipado de escenas multishot: la capacidad nativa de multishot permite crear vídeos con varias escenas encadenadas desde un solo prompt, útil para storyboards animados.
- Creación de vídeo con audio sincronizado: el adaptador de audio de control permite generar vídeo con pista de audio coherente, aplicable a vídeos explicativos o anuncios.
- Experimentación con parámetros de difusión: el nodo de control simplificado facilita probar distintas configuraciones de sampler, CFG y resolución sin tocar el grafo, ideal para investigación y evaluación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye datos numéricos de rendimiento ni comparativas con otros modelos. La documentación de Comfy afirma que LTX 2.5 es el modelo de generación de vídeo más rápido del planeta, pero no se proporcionan cifras concretas de velocidad o calidad en los datos suministrados.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible.
- El tamaño del repositorio (2.0 GB) corresponde a los workflows y adaptadores, no al modelo completo de LTX-2.5.
- Se recomienda consultar la documentación oficial de ComfyUI para LTX-2.5 para conocer los requisitos de hardware del modelo base.
- El despliegue se realiza a través de ComfyUI, que puede ejecutarse en GPU de consumo (RTX 30/40) dependiendo del tamaño del modelo y la cuantización.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este repositorio de workflows con alternativas equivalentes. Al tratarse de un conjunto de workflows para ComfyUI, la comparativa natural sería con otros repositorios de workflows para LTX-2.5 o para modelos de vídeo similares, pero no se dispone de datos de rendimiento, licencia o especificaciones de esos repositorios. La información disponible indica que LTX-2.5 es de Lightricks, pero no se han encontrado datos de parámetros, contexto o licencia del modelo en sí.

## Limitaciones y advertencias

- La licencia del repositorio no está declarada, lo que impide saber si los workflows y adaptadores pueden usarse comercialmente sin restricciones.
- No se proporcionan datos sobre el modelo base de LTX-2.5 (arquitectura, parámetros, contexto), por lo que no se pueden evaluar sus limitaciones técnicas.
- El repositorio no incluye el modelo base, solo los workflows y adaptadores; el usuario debe obtener LTX-2.5 por separado.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma del modelo subyacente.
- La fecha de creación (2026) es futura respecto al conocimiento actual, lo que puede indicar que el modelo LTX-2.5 es de última generación y su documentación puede ser limitada.
- Para producción, es imprescindible verificar la licencia del modelo LTX-2.5 de Lightricks y la de los adaptadores incluidos antes de cualquier uso comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SOLRICKS/LTX-2-5-ComfyUI-Workflows
- Repositorio alternativo del mismo autor: https://huggingface.co/SOLRICKS/ltx-2-5-t2v-i2v-audio-comfyui-workflow
- Documentación oficial de ComfyUI para LTX-2.5: https://docs.comfy.org/tutorials/video/ltx/ltx-2-5
- Página de Comfy para LTX 2.5: https://comfy.org/ltx-2.5
- Workflow de text-to-video en Comfy: https://comfy.org/workflows/13ba3af78782-13ba3af78782/
