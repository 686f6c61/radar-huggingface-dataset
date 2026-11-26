# bindx-dev/dreamshaper8_lcm-sm8850

## Resumen

DreamShaper 8 LCM — SM8850 es una conversión Ahead-Of-Time (AOT) del modelo de difusión DreamShaper 8 (Lykon/dreamshaper-8) fusionado con el LoRA de consistencia latente `latent-consistency/lcm-lora-sdv1-5`, compilado por el usuario bindx-dev mediante el SDK Qualcomm AI Runtime (QAIRT) 2.52.1.261105 en forma de binarios de contexto QNN para la NPU Hexagon HTP v81 del SoC Snapdragon 8 Elite Gen 5 (SM8850). No es un modelo nuevo: es un artefacto de despliegue optimizado para ejecutar generación de imágenes Stable Diffusion 1.5 en hardware móvil de Qualcomm.

El interés del artefacto es práctico: permite ejecutar un pipeline completo de difusión (text encoder, UNet y VAE) en la NPU de un teléfono con Snapdragon 8 Elite Gen 5, con cuantización W8A16 y en solo 4 pasos de muestreo gracias a la destilación LCM. El repositorio ocupa 1,1 GB y contiene tres binarios: `text_encoder.bin`, `unet.bin` y `vae.bin`.

La relevancia es acotada pero clara para quien desarrolle aplicaciones de generación de imágenes on-device en Android: ofrece una ruta ya compilada para el acelerador Hexagon, con una medición reproducible (QDC, 2026-11-25) de 6,05 s en NPU caliente y 6,15 s extremo a extremo con 4 pasos y CFG 1.5, y un pico de RSS de 1.311 MB. No hay datos publicados de calidad de imagen ni de benchmarks de fidelidad respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + text encoder CLIP + VAE) con LoRA LCM fusionado; binarios de contexto QNN para Hexagon HTP v81 |
| Parametros totales | no disponible (el modelo base SD1.5 ronda los 0,98 mil millones, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion de texto a imagen; sin ventana de contexto de tokens en el sentido de los LLM) |
| Tipos de cuantizacion | W8A16 (pesos de 8 bits, activaciones de 16 bits) en binarios QNN |
| Idiomas soportados | no disponible (prompts en ingles por herencia del modelo base; no confirmado) |
| Licencia | CreativeML OpenRAIL-M (heredada del modelo base) |
| Formato de pesos | binarios de contexto QNN (`.bin`): `text_encoder.bin`, `unet.bin`, `vae.bin` |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo desde cero: parte de DreamShaper 8, un fine-tune de Stable Diffusion 1.5 orientado a calidad estética y variedad de estilos, y le fusiona el LoRA `lcm-lora-sdv1-5`, que convierte el muestreo tradicional de 20-50 pasos en un muestreo de consistencia latente de 4 pasos. Sobre esa combinación, el autor aplica una conversión AOT con QAIRT 2.52.1.261105 que genera binarios de contexto ejecutables directamente en la NPU Hexagon HTP v81 del SM8850, con cuantización W8A16.

La innovación técnica reside en el pipeline de despliegue, no en el modelo: compilación AOT para un acelerador NPU concreto, particionado en tres grafos (text encoder, UNet y VAE) y reducción del coste de inferencia mediante destilación LCM. No se proporcionan datos sobre el dataset de entrenamiento original, el número de tokens de imagen, ni si hubo etapas de RLHF o preferencias; esa información correspondería a la model card de Lykon/dreamshaper-8 y no se incluye en la información disponible.

## Capacidades

- Generación de imágenes texto a imagen con el pipeline completo SD1.5 (CLIP text encoder, UNet, VAE decoder) ejecutado en NPU.
- Muestreo rápido en 4 pasos con CFG 1.5 gracias a la destilación LCM, lo que reduce la latencia frente al muestreo DDIM/PNDM estándar.
- Estilos variados y calidad estética mejorada respecto a SD1.5 base, por herencia de DreamShaper 8.
- Ejecución on-device en el SoC Snapdragon 8 Elite Gen 5 (Hexagon HTP v81), sin necesidad de GPU de servidor.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No soporta visión de entrada ni audio.
- Capacidades multilingües: no disponibles; el prompting efectivo es presumiblemente en inglés, como en el modelo base, aunque no se confirma en la información proporcionada.

## Casos de uso

- Generación de imágenes on-device en aplicaciones Android: integrar los tres binarios QNN en una app que use QAIRT para producir imágenes a partir de un prompt en el propio teléfono, sin enviar datos a la nube y con latencia de unos 6 segundos por imagen.
- Prototipado de funciones creativas para fabricantes de dispositivos: validar experiencias de generación de fondos, avatares o ilustraciones en un dispositivo SM8850 antes de comprometer un pipeline de producción.
- Privacidad por diseño: escenarios donde el prompt o la imagen generada no deben salir del dispositivo, como aplicaciones de salud, educación o herramientas personales.
- Pruebas de rendimiento y regresión de NPU: usar el benchmark QDC publicado (6,05 s en NPU caliente, 6,15 s extremo a extremo, pico de RSS de 1.311 MB) como referencia para comparar versiones de QAIRT o de drivers Hexagon.
- Demos interactivas en ferias y entornos sin conectividad: generación de imágenes en tiempo casi real en un móvil de gama alta sin depender de red.
- Investigación sobre cuantización y compilación AOT: servir de base para estudiar el impacto de W8A16 y de la partición de grafos en la calidad de imagen de SD1.5 en NPU, comparando contra el modelo original en FP16.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Latencia NPU caliente | 6,05 s | 4 pasos, CFG 1.5, SM8850 |
| Latencia extremo a extremo | 6,15 s | 4 pasos, CFG 1.5, SM8850 |
| Pico de RSS | 1.311 MB | Benchmark QDC 2026-11-25 |

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la informacion disponible.

## Requisitos de hardware

- NPU objetivo: Hexagon HTP v81 del SoC Snapdragon 8 Elite Gen 5 (SM8850). Los binarios están compilados AOT para esa arquitectura y no son portables a otras NPU Hexagon ni a GPU/CPU genéricas.
- VRAM/RAM: pico de RSS medido de 1.311 MB durante la inferencia; el repositorio ocupa 1,1 GB en disco.
- GPU recomendadas: no aplica; el artefacto está pensado para la NPU del dispositivo. No se documenta ejecución en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; los binarios QNN no están pensados para GPUs de escritorio.
- Opciones de despliegue: Qualcomm AI Runtime (QAIRT) 2.52.1.261105 o compatible, con el runtime QNN y los drivers Hexagon correspondientes. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo de difusión en NPU).
- Latencia y throughput: 6,05 s por imagen en NPU caliente con 4 pasos y CFG 1.5; no se publica throughput en imágenes por segundo ni latencia en frío.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DreamShaper 8 LCM — SM8850 (este) | SD1.5 + LCM, binarios QNN para NPU SM8850 | no disponible | no aplica | CreativeML OpenRAIL-M | Hugging Face, 0 descargas |
| Lykon/dreamshaper-8 | SD1.5 fine-tune, pesos originales | no disponible | no aplica | CreativeML OpenRAIL-M | Hugging Face, ampliamente usado |
| latent-consistency/lcm-lora-sdv1-5 | LoRA de consistencia para SD1.5 | no disponible | no aplica | no disponible en la informacion proporcionada | Hugging Face |
| Stable Diffusion 1.5 (runwayml) | SD1.5 base | no disponible | no aplica | CreativeML OpenRAIL-M | Hugging Face |

No se dispone de datos de rendimiento comparativo (calidad de imagen ni latencia) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware: los binarios están compilados AOT para Hexagon HTP v81 (SM8850); no funcionarán en otros SoC, otras versiones de HTP ni en GPU/CPU.
- Dependencia de versión: la conversión usa QAIRT 2.52.1.261105; cambios de versión del runtime o de los drivers pueden romper la compatibilidad.
- Calidad de imagen no evaluada: no se publican métricas de fidelidad respecto a DreamShaper 8 en FP16; la cuantización W8A16 y el muestreo LCM de 4 pasos pueden degradar el detalle.
- Sesgos: heredados de Stable Diffusion 1.5 y de DreamShaper 8; no se documentan análisis específicos en la información disponible.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido incoherente, anatomía incorrecta o texto ilegible en las imágenes.
- Restricciones de licencia: CreativeML OpenRAIL-M impone restricciones de uso (prohibición de usos dañinos, difusión de desinformación, etc.); es responsabilidad del integrador revisar y cumplir sus cláusulas para uso comercial.
- Idiomas: no se confirma soporte multilingüe de prompts; el modelo base está orientado a inglés.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-26); sin comunidad ni validación externa.
- Sin model card extendida: no hay información sobre el proceso de conversión paso a paso, scripts de reproducción ni limitaciones declaradas por el autor más allá del benchmark QDC.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bindx-dev/dreamshaper8_lcm-sm8850
- Modelo base: https://huggingface.co/Lykon/dreamshaper-8
- LoRA LCM: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- Qualcomm AI Runtime (QAIRT): no disponible en la informacion proporcionada
- Paper de LCM (Latent Consistency Models): no disponible en la informacion proporcionada
