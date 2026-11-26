# bindx-dev/stable_diffusion_v1_5-sm8850

## Resumen

Stable Diffusion v1.5 para Snapdragon 8 Elite Gen 5 (SM8850) es una conversión del modelo de difusión textual-a-imagen de referencia `runwayml/stable-diffusion-v1-5` a binarios de contexto QNN compilados AOT (Ahead-Of-Time) para la NPU Hexagon HTP v81 de Qualcomm. Lo desarrolla el usuario `bindx-dev` mediante la cadena de herramientas BindX QAIRT 2.52.1.261105, y su propósito es ejecutar inferencia de difusión en el acelerador neuronal integrado en el SoC móvil en lugar de en CPU o GPU.

El modelo base es el conocido SD 1.5, un transformer de difusión latente con un UNet de aproximadamente 860 millones de parámetros, un text encoder CLIP ViT-L/14 y un VAE, que genera imágenes de 512x512 píxeles a partir de prompts en inglés. Esta conversión no altera los pesos conceptualmente: los empaqueta en tres binarios QNN (`text_encoder.bin`, `unet.bin` y `vae.bin`) con cuantización W8A16 (pesos de 8 bits, activaciones de 16 bits) para que la NPU Hexagon los ejecute de forma nativa.

Su relevancia es práctica: demuestra que un modelo de difusión de 2022 puede desplegarse en un teléfono de gama alta con un consumo de memoria contenido (1.313 MB de RSS pico) y una latencia de unos 21 segundos por imagen a 20 pasos, lo que abre la puerta a generación de imágenes totalmente local y sin conexión en dispositivos móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (UNet + text encoder CLIP + VAE), compilada a binarios QNN context para Hexagon NPU |
| Parametros totales | no disponible (el modelo base SD 1.5 ronda los 860 M en el UNet, pero el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el text encoder CLIP trunca el prompt a 77 tokens en SD 1.5) |
| Tipos de cuantizacion | W8A16 (pesos 8 bits, activaciones 16 bits) en formato QNN context binary |
| Idiomas soportados | no disponible (el modelo base SD 1.5 está entrenado principalmente en inglés) |
| Licencia | CreativeML OpenRAIL-M (heredada del modelo base) |
| Formato de pesos | `.bin` (QNN context binaries: `text_encoder.bin`, `unet.bin`, `vae.bin`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion 1.5: un autoencoder variacional (VAE) que comprime imágenes a un espacio latente de 4 canales y 64x64, un UNet que realiza el proceso de denoising iterativo en ese espacio latente y un text encoder CLIP ViT-L/14 que condiciona la generación mediante embeddings del prompt. El autor no aporta detalles sobre el entrenamiento original, que corresponde a Runway y Stability AI y no a esta conversión.

La innovación de este repositorio no está en el entrenamiento sino en el despliegue: los pesos se convierten con BindX QAIRT 2.52.1.261105 a binarios de contexto QNN compilados AOT para la Hexagon HTP v81 del SM8850. La cuantización W8A16 reduce el peso del UNet y permite que el modelo completo quepa en un repositorio de 1,1 GB. El autor reporta un benchmark verificado en QDC el 25 de noviembre de 2026 con 20 pasos y CFG 7.5: carga en frío de 515 ms, 20,93 s en NPU en caliente, 21,17 s de extremo a extremo y un pico de RSS de 1.313 MB.

## Capacidades

- Generación de imágenes texto-a-imagen a 512x512 píxeles, heredadas del modelo base SD 1.5.
- Ejecución nativa en la NPU Hexagon HTP v81 del Snapdragon 8 Elite Gen 5 (SM8850).
- Inferencia local en dispositivo, sin necesidad de conexión a servicios en la nube.
- Control de la generación mediante prompt textual y escala de guiado (CFG); el benchmark reportado usa CFG 7.5.
- Control del número de pasos de denoising (el benchmark usa 20 pasos).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking, ya que no son propias de un modelo de difusión de este tipo.

## Casos de uso

- Generación de imágenes offline en aplicaciones móviles: integrar los tres binarios QNN en una app Android para que el usuario genere ilustraciones sin conexión, aprovechando la NPU y el bajo consumo de memoria (1.313 MB de RSS pico).
- Prototipado de interfaces creativas en dispositivos: usar el modelo como motor de generación local en apps de diseño o edición fotográfica que necesiten crear variaciones de imagen a partir de texto.
- Demostración de capacidades de la NPU Hexagon: emplear el modelo como benchmark reproducible para evaluar el rendimiento de la HTP v81 en cargas de difusión (20,93 s por imagen a 20 pasos).
- Investigación en eficiencia de despliegue: estudiar el impacto de la cuantización W8A16 y de la compilación AOT en la calidad y latencia de un modelo de difusión en hardware móvil.
- Generación de assets para juegos o contenido educativo en entornos sin red: crear sprites, fondos o ilustraciones de forma local en un dispositivo de gama alta.
- Pruebas de regresión de la cadena BindX QAIRT: validar nuevas versiones del toolchain comparando latencias y consumo de memoria contra el benchmark publicado (515 ms de carga en frío, 21,17 s de extremo a extremo).

## Benchmarks y rendimiento

| Metrica | Valor (QDC, 2026-11-25) |
|---|---|
| Pasos de inferencia | 20 |
| Escala de guiado (CFG) | 7,5 |
| Carga en frío | 515 ms |
| Inferencia en NPU en caliente | 20,93 s |
| Tiempo de extremo a extremo | 21,17 s |
| Pico de RSS | 1.313 MB |

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score) ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- NPU objetivo: Hexagon HTP v81 integrada en el Qualcomm Snapdragon 8 Elite Gen 5 (SM8850).
- No es ejecutable en GPU de escritorio ni en CPU genérica: los binarios son context binaries QNN específicos de esa NPU.
- Memoria: el benchmark reporta un pico de RSS de 1.313 MB, por lo que el modelo cabe holgadamente en la memoria de un teléfono de gama alta.
- Cadena de despliegue: BindX QAIRT 2.52.1.261105 y el runtime QNN correspondiente para cargar los binarios de contexto.
- No se dispone de datos de latencia o throughput para otras plataformas ni para otras cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bindx-dev/stable_diffusion_v1_5-sm8850 | no disponible (base SD 1.5) | no disponible | QNN context `.bin` | CreativeML OpenRAIL-M | Hugging Face, específico para SM8850 |
| runwayml/stable-diffusion-v1-5 | ~860 M (UNet) | 77 tokens de prompt | safetensors | CreativeML OpenRAIL-M | Hugging Face, genérico |
| Otras conversiones QNN de SD 1.5 para Hexagon | no disponible | no disponible | QNN context `.bin` | CreativeML OpenRAIL-M | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo con otras conversiones para NPU en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en la NPU Hexagon HTP v81 del Snapdragon 8 Elite Gen 5 (SM8850); no es portable a otros SoC ni a GPU o CPU sin reconversión.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso: prohíbe determinados usos (contenido ilegal, dañino o engañoso) y exige mantener el aviso de licencia en redistribuciones.
- El modelo base SD 1.5 está entrenado principalmente en inglés, por lo que los prompts en castellano pueden ofrecer resultados pobres; no se documentan idiomas soportados.
- Riesgo de sesgos y de contenido inapropiado heredado del dataset de entrenamiento original de SD 1.5.
- Riesgo de alucinación visual: el modelo puede generar imágenes incoherentes o anatómicamente incorrectas, especialmente con prompts complejos.
- La cuantización W8A16 puede degradar la calidad de imagen respecto a los pesos originales en FP16; el autor no publica métricas de calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente del benchmark reportado.
- La fecha de creación indicada (2026-11-26) es futura respecto a la información habitual disponible; conviene verificar la vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bindx-dev/stable_diffusion_v1_5-sm8850
- Modelo base: https://huggingface.co/runwayml/stable-diffusion-v1-5
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Documentación de Qualcomm QAIRT / QNN: no disponible en la información proporcionada
- Paper de Stable Diffusion (Latent Diffusion Models): no disponible en la información proporcionada
