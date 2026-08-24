# hoidhxd/MiniMax-H3-x-Z-Image-bf16

## Resumen

Este repositorio contiene una reconstrucción en BF16 del modelo FL2VA ZS05, un componente del sistema MiniMax-H3 x Z-Image, desarrollado por el usuario hoidhxd. El modelo original pruned FL2VA BF16 carecía de los tensores `q_norm` correspondientes a la versión ZS05 en los bloques 29–49; esta reconstrucción recupera esos 21 tensores a partir de las versiones INT8 y FP8 de ZS05, verificando que ambas producen los mismos valores BF16 tras la reconstrucción. El resultado es un archivo `safetensors` de aproximadamente 37,46 GiB con 532 tensores, donde solo se han modificado 21 tensores (5,25 KiB) respecto al modelo pruned original.

El modelo está pensado para flujos de trabajo de generación de vídeo y audio en ComfyUI, como parte del ecosistema MiniMax-H3, un sistema generativo omni-modal de código abierto que soporta comprensión unificada de texto, imagen, vídeo y audio, y genera vídeo nativo con audio estéreo sincronizado hasta 2K y 15 segundos de duración. La relevancia de este checkpoint concreto radica en que permite reconstruir la configuración híbrida B25-49 combinando el FL2VA ZS05 BF16 con el REF2VA ZS05 BF16 disponible en otro repositorio, sin necesidad de conversión por GPU ni reconstrucción aproximada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (FL2VA) para generacion de video/audio, basado en MiniMax-H3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (reconstruido), originalmente pruned BF16; versiones INT8 y FP8 de ZS05 usadas como referencia |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un checkpoint reconstruido, no un modelo entrenado desde cero. Se basa en el sistema MiniMax-H3, una arquitectura generativa omni-modal que unifica comprensión de texto, imagen, vídeo y audio, y que es capaz de generar vídeo con audio estéreo nativo. El componente FL2VA aquí presente corresponde a la variante ZS05, que incorpora tensores `q_norm` específicos en los bloques 29–49. La reconstrucción se realizó copiando directamente los 21 tensores `q_norm` desde el modelo ZS05 INT8, tras verificar que las versiones INT8 y FP8 producen la misma reconstrucción BF16. Todos los demás tensores permanecen byte a byte idénticos al modelo pruned FL2VA BF16 original. No se utilizó conversión por GPU ni reconstrucción aproximada escalar o afín.

El archivo final contiene 532 tensores, de los cuales 21 fueron parcheados. El tamaño total es de ~37,46 GiB. El repositorio no incluye información sobre el entrenamiento del modelo base, datos de entrenamiento ni técnicas como RLHF o DPO.

## Capacidades

- Generación de vídeo nativo con audio estéreo sincronizado, hasta resoluciones de 2K y duración de 15 segundos (capacidad del sistema MiniMax-H3 subyacente).
- Comprensión unificada de contextos multimodales compuestos por texto, imagen, vídeo y audio (capacidad del sistema MiniMax-H3).
- Integración con ComfyUI para flujos de trabajo de generación de vídeo.
- Soporte para configuración híbrida B25-49 combinando FL2VA y REF2VA.
- Reconstrucción bit-exacta de los tensores `q_norm` ZS05, lo que garantiza fidelidad respecto a las versiones INT8/FP8 de referencia.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso ni capacidades de texto puro, ya que el checkpoint es específico para el pipeline de difusión.

## Casos de uso

- Generación de vídeo con audio estéreo en ComfyUI: el modelo FL2VA ZS05 BF16 se carga como componente del workflow MiniMax-H3 x Z-Image, permitiendo generar clips de hasta 15 segundos a 2K con sonido sincronizado.
- Investigación en reconstrucción de pesos: el repositorio documenta un proceso de reconstrucción bit-exacta de tensores `q_norm` a partir de versiones cuantizadas, útil para estudiar técnicas de recuperación de precisión en modelos de difusión.
- Creación de modelos híbridos: combinando este FL2VA ZS05 BF16 con el REF2VA ZS05 BF16 del repositorio `joeygambino/MiniMax-H3-x-Z-Image-native`, se puede construir el híbrido B25-49 BF16 para experimentación.
- Despliegue local de generación de vídeo: al ser un archivo safetensors en BF16, puede cargarse en entornos de inferencia local que soporten este formato, sin depender de servicios en la nube.
- Verificación de integridad de modelos: el proceso de verificación (532 tensores, 21 parches, comprobación bit-exacta) sirve como referencia para auditar otros checkpoints reconstruidos.
- Desarrollo de flujos de trabajo multimodales: al pertenecer al ecosistema MiniMax-H3, puede integrarse en pipelines que requieran generación de vídeo con audio nativo, por ejemplo para prototipado de contenidos audiovisuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de calidad de generación, velocidad de inferencia ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. El archivo pesa ~37,46 GiB en BF16, por lo que se requiere una GPU con al menos 40 GB de VRAM para cargar los pesos completos en memoria (p. ej., A100 40GB, A100 80GB, H100 80GB). Con cuantización a FP8 o INT8, los requisitos podrían reducirse, pero no se proporcionan datos específicos.
- GPU recomendadas: no disponible en la documentación; se asume que GPUs de datacenter con gran memoria (A100, H100) son adecuadas, y posiblemente RTX 4090 (24 GB) no sea suficiente para el modelo completo en BF16.
- Opciones de despliegue: el modelo está pensado para ComfyUI, por lo que se puede integrar en ese entorno. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje sino de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con alternativas de la misma categoría. El modelo es una reconstrucción específica dentro del ecosistema MiniMax-H3, y no se han publicado comparativas con otros modelos de generación de vídeo (como otros checkpoints de MiniMax-H3, o modelos como Stable Video Diffusion, etc.) en la información proporcionada.

## Limitaciones y advertencias

- El modelo es una reconstrucción, no un checkpoint oficial de MiniMax-AI. Aunque se verificó la integridad de los tensores, el proceso de reconstrucción podría introducir diferencias sutiles no documentadas.
- Solo se modificaron 21 tensores `q_norm`; el resto del modelo es idéntico al pruned BF16 original, pero no se garantiza que el comportamiento del modelo completo sea idéntico al de un modelo ZS05 nativo.
- El repositorio no incluye información sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un modelo de generación de vídeo, los riesgos típicos de los modelos de lenguaje (alucinación, sesgos textuales) no aplican directamente, pero sí pueden existir sesgos en los contenidos visuales generados.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base MiniMax-H3 y de los componentes REF2VA, ya que pueden tener condiciones adicionales.
- El archivo es grande (~37,46 GiB), lo que requiere almacenamiento y ancho de banda considerables para su descarga y uso.
- No se proporcionan instrucciones de uso detalladas más allá de la combinación con el REF2VA para el híbrido B25-49; los usuarios deben conocer el flujo de trabajo MiniMax-H3 x Z-Image para utilizarlo correctamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hoidhxd/MiniMax-H3-x-Z-Image-bf16
- Repositorio híbrido relacionado: https://huggingface.co/hoidhxd/MiniMax-H3-x-Z-Image-hybrid
- Repositorio REF2VA BF16 (joeygambino): https://huggingface.co/joeygambino/MiniMax-H3-x-Z-Image-native
- GitHub oficial de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Organización Comfy-Org en HuggingFace: https://huggingface.co/Comfy-Org/MiniMax-H3
- Tutoriales y despliegue de MiniMax H3: https://design.minimax.io/h3
- Hub de recursos MiniMax H3: https://github.com/ai-models-lab/minimax-h3
