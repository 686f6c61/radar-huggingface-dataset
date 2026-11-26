# bindx-dev/sdxs_512_dreamshaper-sm8850

## Resumen

SDXS-512-DreamShaper para Snapdragon 8 Elite Gen 5 (SM8850) es una conversión Ahead-Of-Time (AOT) del modelo de difusión texto-a-imagen `IDKiro/sdxs-512-dreamshaper`, empaquetada como binarios de contexto QNN para la NPU Hexagon HTP v81 de Qualcomm. La desarrolla el usuario `bindx-dev` mediante su herramienta BindX QAIRT `2.52.1.261105`, y no se trata de un modelo nuevo entrenado desde cero, sino de una recompilación de los pesos originales para ejecutarse de forma nativa en la NPU de un SoC móvil.

El interés de esta ficha es acotado: no es un modelo de lenguaje ni un transformer generativo de texto, sino un pipeline de difusión de tres etapas (text encoder, UNet y VAE) cuantizado en W8A16 y optimizado para inferencia en dispositivo. El modelo base SDXS-512-DreamShaper es una variante destilada de Stable Diffusion que genera imágenes de 512x512 en un único paso, lo que encaja con las restricciones de latencia y memoria de un teléfono.

El resultado declarado por el autor es una latencia de extremo a extremo de 334-344 ms en la NPU, con una carga en frío de 250 ms y un pico de RSS de 719-731 MB. Es relevante ahora porque demuestra la viabilidad de ejecutar generación de imágenes por difusión en tiempo casi interactivo en hardware móvil de gama alta, sin depender de la nube. El repositorio ocupa 0,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión latente con destilación de un paso (text encoder + UNet + VAE), compilado a binarios de contexto QNN |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, no de lenguaje) |
| Tipos de cuantización | W8A16 (pesos de 8 bits, activaciones de 16 bits) |
| Idiomas soportados | no disponible (prompts de texto; el idioma depende del text encoder subyacente) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | binarios de contexto QNN (`.bin`): `text_encoder.bin`, `unet.bin`, `vae.bin` |

## Arquitectura y entrenamiento

El modelo base `IDKiro/sdxs-512-dreamshaper` es un modelo de difusión texto-a-imagen derivado de Stable Diffusion y destilado para generar en un solo paso imágenes de 512x512. Esta conversión concreta no reentrena los pesos: aplica la cadena de herramientas BindX QAIRT `2.52.1.261105` para compilar los tres componentes del pipeline (text encoder, UNet y VAE) en binarios de contexto ejecutables sobre la NPU Hexagon HTP v81 del SoC SM8850. La cuantización aplicada es W8A16, es decir, pesos de 8 bits y activaciones de 16 bits, un esquema habitual para equilibrar huella de memoria y fidelidad numérica en aceleradores móviles.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que se trata de una recompilación y no de un entrenamiento nuevo. La innovación técnica destacable es la propia compilación AOT para la NPU Hexagon, que traslada la inferencia del modelo de difusión desde GPU o CPU genéricas a un acelerador dedicado con kernels precompilados, reduciendo la latencia y el consumo energético en dispositivo.

## Capacidades

- Generación de imágenes texto-a-imagen de 512x512 en un único paso de difusión.
- Ejecución nativa en la NPU Hexagon HTP v81 del SoC Qualcomm SM8850 (Snapdragon 8 Elite Gen 5).
- Inferencia en dispositivo sin conexión a la nube, con latencia declarada de 334-344 ms de extremo a extremo.
- Carga en frío de los binarios de contexto en 250 ms y ejecución en NPU en caliente de 178,0-183,3 ms.
- Huella de memoria contenida: pico de RSS de 719-731 MB.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un pipeline de generación de imágenes, no un modelo de lenguaje.
- No dispone de modo thinking, visión de entrada ni procesamiento de audio.

## Casos de uso

- Generación de imágenes en aplicaciones móviles nativas: el pipeline puede integrarse en apps Android para producir ilustraciones de 512x512 a partir de un prompt, con latencias de unos 340 ms que permiten una experiencia casi interactiva.
- Edición creativa en tiempo real en el dispositivo: gracias a la generación en un solo paso y a la baja latencia, se pueden encadenar varias generaciones mientras el usuario ajusta el prompt, sin llamadas a servidor.
- Prototipado de assets para juegos móviles: los desarrolladores pueden generar bocetos o texturas de referencia directamente en un dispositivo Snapdragon 8 Elite Gen 5, reduciendo la dependencia de infraestructura de GPU en la nube.
- Demostraciones y pruebas de concepto de IA generativa en el borde: útil para validar flujos de trabajo de difusión sobre NPU Hexagon en ferias, entornos sin conectividad o escenarios de privacidad estricta.
- Aplicaciones de privacidad por diseño: al ejecutarse íntegramente en el dispositivo, los prompts y las imágenes generadas no salen del terminal, lo que encaja en casos con requisitos de confidencialidad.
- Investigación en optimización de difusión en hardware móvil: sirve como referencia para medir latencia, memoria y fidelidad de un pipeline SDXS cuantizado en W8A16 sobre HTP v81, y para comparar con implementaciones en GPU o CPU.
- Generación de contenido sin conectividad: escenarios de campo, kioscos o dispositivos aislados donde no hay red pero sí un SoC Snapdragon compatible.

## Benchmarks y rendimiento

El autor publica un benchmark QDC verificado el 2026-11-25 con las siguientes métricas de ejecución (no son benchmarks de calidad de imagen como FID o CLIP score):

| Métrica | Valor |
|---|---|
| Carga en frío | 250 ms |
| Ejecución en NPU en caliente | 178,0-183,3 ms |
| Latencia de extremo a extremo | 334-344 ms |
| Pico de RSS | 719-731 MB |

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- SoC objetivo: Qualcomm SM8850 (Snapdragon 8 Elite Gen 5) con NPU Hexagon HTP v81; los binarios están compilados específicamente para esta arquitectura y no son portables a otros SoC sin recompilación.
- VRAM estimada: no aplica; el modelo se ejecuta sobre la NPU y la memoria compartida del SoC, con un pico de RSS declarado de 719-731 MB.
- GPU recomendadas: no aplica para esta conversión; está pensada para la NPU Hexagon, no para GPU de escritorio ni de servidor.
- ¿Cabe en GPU de consumo? No es el objetivo de este artefacto; para ejecutar el modelo base en GPU de consumo habría que usar los pesos originales de `IDKiro/sdxs-512-dreamshaper` en otro formato.
- Opciones de despliegue: runtime BindX QAIRT `2.52.1.261105` sobre la NPU Hexagon; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a este pipeline de difusión.
- Latencia y throughput: latencia de extremo a extremo de 334-344 ms por imagen de 512x512 según el autor; no se publica throughput agregado ni consumo energético.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / resolución | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bindx-dev/sdxs_512_dreamshaper-sm8850 | Difusión texto-a-imagen compilada para NPU Hexagon | 512x512, 1 paso | W8A16 | CreativeML OpenRAIL-M | Hugging Face (0 descargas) |
| IDKiro/sdxs-512-dreamshaper | Difusión texto-a-imagen (modelo base) | 512x512, 1 paso | no disponible | CreativeML OpenRAIL-M | Hugging Face |
| Stable Diffusion 1.5 | Difusión texto-a-imagen | 512x512, múltiples pasos | múltiples | CreativeML OpenRAIL-M | Amplia disponibilidad |
| SDXL-Turbo | Difusión texto-a-imagen destilada | 512x512-1024x1024, pocos pasos | múltiples | CreativeML OpenRAIL-M (según variante) | Hugging Face |

La comparación relevante es con el modelo base del que deriva: esta conversión no cambia la calidad del modelo, sino su portabilidad y latencia en hardware móvil concreto. Frente a Stable Diffusion 1.5 o SDXL-Turbo, la diferencia principal es el número de pasos (uno frente a varios) y el soporte nativo de NPU Hexagon, a costa de quedar atado a un único SoC.

## Limitaciones y advertencias

- Los binarios están compilados exclusivamente para SM8850 (Snapdragon 8 Elite Gen 5, HTP v81); no funcionarán en otros SoC Snapdragon ni en GPU o CPU genéricas sin recompilación.
- La cuantización W8A16 puede introducir degradación de calidad de imagen respecto a los pesos originales en precisión completa; no se publican métricas de fidelidad que lo cuantifiquen.
- El modelo base es de difusión texto-a-imagen y puede reproducir sesgos presentes en sus datos de entrenamiento, incluyendo estereotipos en la representación de personas y culturas.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido incoherente, anatómicamente incorrecto o no fiel al prompt.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso: prohíbe determinados usos dañinos descritos en la licencia y exige que las obras derivadas mantengan las mismas restricciones; conviene revisar el texto completo antes de un uso comercial.
- No se dispone de información sobre los idiomas soportados por el text encoder ni sobre su rendimiento con prompts en castellano.
- El repositorio no registra descargas ni likes y fue creado el 2026-11-26, por lo que no hay evidencia comunitaria de funcionamiento más allá del benchmark declarado por el autor.
- El pipeline depende del runtime BindX QAIRT `2.52.1.261105`; cambios de versión del runtime pueden requerir recompilar los binarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bindx-dev/sdxs_512_dreamshaper-sm8850
- Modelo base en Hugging Face: https://huggingface.co/IDKiro/sdxs-512-dreamshaper
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
