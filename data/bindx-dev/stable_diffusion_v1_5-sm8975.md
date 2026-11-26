# bindx-dev/stable_diffusion_v1_5-sm8975

## Resumen

Stable Diffusion v1.5 para Snapdragon 8 Elite Extreme Gen 6 (SM8975) es una conversión del modelo de difusión de texto a imagen de referencia, runwayml/stable-diffusion-v1-5, a binarios de contexto QNN compilados en modo AOT (Ahead-Of-Time) para la NPU Hexagon HTP v85 de Qualcomm. El autor, bindx-dev, distribuye los tres componentes clásicos del pipeline (text_encoder, unet y vae) como ficheros `.bin` W8A16 generados con el compilador QAIRT 2.52.1.261105, lo que permite ejecutar la inferencia íntegramente en la NPU del dispositivo en lugar de en CPU o GPU.

El interés de esta ficha es acotado y muy específico: no se trata de un modelo nuevo ni de un fine-tune con capacidades adicionales, sino de un artefacto de despliegue orientado a desarrolladores que quieran integrar generación de imágenes en dispositivos Android con el chip SM8975. El modelo mantiene la licencia CreativeML OpenRAIL-M del original y todas sus restricciones de uso, y no incluye pesos en formato safetensors ni GGUF, solo binarios propietarios de Qualcomm.

La relevancia actual viene de la creciente demanda de inferencia local de modelos generativos en móviles. El benchmark publicado por el autor (20 pasos, CFG 7.5) reporta 29,05 s en NPU en caliente, 700 ms de carga en frío y un pico de RSS de 1.327 MB, cifras que sitúan la generación de una imagen de 512×512 en el orden de medio minuto en un teléfono de gama alta. No hay información sobre idiomas, pipeline declarado ni métricas de calidad de imagen en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent diffusion model (UNet + text encoder CLIP + VAE), compilado a QNN context binaries |
| Parametros totales | no disponible (el modelo base SD 1.5 ronda los 860 M en UNet, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el text encoder CLIP de SD 1.5 usa 77 tokens, pero no se explicita en la model card) |
| Tipos de cuantizacion | W8A16 (pesos 8 bits, activaciones 16 bits) segun QAIRT |
| Idiomas soportados | no disponible |
| Licencia | creativeml-openrail-m (heredada de runwayml/stable-diffusion-v1-5) |
| Formato de pesos | `.bin` (QNN context binaries: text_encoder.bin, unet.bin, vae.bin) |

## Arquitectura y entrenamiento

El modelo subyacente es Stable Diffusion v1.5, un modelo de difusión latente con un UNet como red de denoising, un text encoder CLIP para condicionamiento textual y un VAE para codificar y decodificar entre espacio latente y píxeles. Esta ficha no aporta información sobre el entrenamiento original de SD 1.5 (número de tokens, composición del dataset, uso de RLHF o DPO); esos datos corresponden a la model card de runwayml/stable-diffusion-v1-5 y no se reproducen aquí.

La innovación técnica de este artefacto no está en el modelo sino en el pipeline de despliegue: BindX convierte los pesos mediante QAIRT 2.52.1.261105 a binarios de contexto QNN compilados AOT para la NPU Hexagon HTP v85 del SM8975. Esto implica que la inferencia se ejecuta en la NPU con cuantización W8A16, sin necesidad de compilación en el dispositivo. No se documentan técnicas como decodificación especulativa, atención lineal ni optimizaciones de sampling adicionales; el benchmark se limita a 20 pasos con CFG 7.5.

## Capacidades

- Generación de imágenes a partir de prompts de texto, heredada de SD 1.5 (512×512 por defecto en el modelo original).
- Ejecución en NPU Hexagon HTP v85 del SoC SM8975 mediante context binaries QNN.
- Cuantización W8A16 para reducir huella de memoria y aprovechar las unidades de cómputo entero de la NPU.
- Carga en frío de 700 ms y ejecución en caliente de 29,05 s para 20 pasos según el benchmark del autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio.
- No se documenta soporte multilingüe explícito; el condicionamiento textual depende del encoder CLIP de SD 1.5.

## Casos de uso

- Generación de imágenes offline en aplicaciones Android: el modelo se integra como context binaries en una app que use el runtime QNN de Qualcomm, permitiendo crear ilustraciones o avatares sin conexión y sin enviar prompts a servidores externos.
- Prototipado de features creativas en dispositivos SM8975: equipos de producto pueden evaluar la viabilidad de generación de imágenes en el propio terminal con un coste de 29 s por imagen, suficiente para flujos no interactivos o con feedback diferido.
- Personalización de contenido en apps de mensajería o redes sociales: stickers, fondos o avatares generados a partir de texto, aprovechando el pico de RSS de 1.327 MB para mantener el consumo de memoria acotado en dispositivos con 8-12 GB de RAM.
- Investigación en eficiencia de inferencia en NPU: el artefacto sirve como referencia reproducible para comparar latencias y consumo entre QNN, GPU y CPU en el mismo SoC, con cifras concretas publicadas por el autor.
- Integración en pipelines de CI para validación de despliegues QNN: los binarios permiten automatizar pruebas de humo (carga, inferencia de 20 pasos, verificación de RSS) en granjas de dispositivos SM8975.
- Demos educativas de difusión latente en móvil: útil para talleres o cursos que quieran mostrar el pipeline text_encoder → unet → vae ejecutándose en hardware heterogéneo sin depender de la nube.

## Benchmarks y rendimiento

El autor publica un único benchmark verificado el 2026-11-25 en el QDC (Qualcomm Device Cloud), con 20 pasos y CFG 7.5:

| Metrica | Valor |
|---|---|
| Carga en frio (cold load) | 700 ms |
| Inferencia en NPU en caliente (warm NPU) | 29,05 s |
| Tiempo end-to-end | 29,15 s |
| Pico de RSS | 1.327 MB |
| Pasos de sampling | 20 |
| CFG | 7,5 |

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score) ni comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- SoC objetivo: Qualcomm Snapdragon 8 Elite Extreme Gen 6 (SM8975) con NPU Hexagon HTP v85; los binarios no son portables a otros chips sin recompilación.
- Runtime: QAIRT 2.52.1.261105 (Qualcomm AI Runtime) y el stack QNN correspondiente.
- VRAM/RAM: pico de RSS de 1.327 MB durante la inferencia según el benchmark del autor; se recomienda margen adicional para el resto de la app.
- GPU de escritorio: no aplica; estos binarios no están pensados para A100, H100 ni RTX 4090, y no se documenta una ruta de ejecución en GPU convencional.
- Consumer GPU: no aplica en el formato distribuido; para ejecutar SD 1.5 en GPU de consumo habría que usar los pesos originales de runwayml/stable-diffusion-v1-5 con otros runtimes.
- Opciones de despliegue: runtime QNN de Qualcomm en Android; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: 29,05 s por imagen de 20 pasos en NPU en caliente; no se documenta throughput por lotes ni latencia con menos pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bindx-dev/stable_diffusion_v1_5-sm8975 | no disponible | no disponible | QNN `.bin` (W8A16) | creativeml-openrail-m | Hugging Face, 0 descargas |
| runwayml/stable-diffusion-v1-5 | no disponible en la informacion | no disponible | safetensors (upstream) | creativeml-openrail-m | Hugging Face, ampliamente usado |
| Otras conversiones QNN de SD 1.5 | no disponible | no disponible | QNN `.bin` | variable | no disponible |

La comparativa se limita al modelo upstream porque la información proporcionada no incluye otras conversiones QNN ni alternativas de difusión para NPU con datos verificables. No se dispone de métricas de calidad comparables entre el original y esta conversión.

## Limitaciones y advertencias

- Es un artefacto de despliegue, no un modelo nuevo: hereda todos los sesgos y limitaciones de SD 1.5, incluidos sesgos de representación y riesgo de generar contenido inapropiado.
- Riesgo de alucinación visual y de interpretación errónea de prompts, especialmente en composiciones complejas o texto dentro de la imagen.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (no uso para fines dañinos, ilegales o de vigilancia); es responsabilidad del integrador cumplirlas.
- Los binarios están compilados exclusivamente para SM8975 / HTP v85; no funcionan en otros Snapdragon ni en GPU de escritorio sin recompilación con QAIRT.
- Dependencia de un runtime propietario de Qualcomm (QAIRT 2.52.1.261105); cambios de versión pueden romper la compatibilidad de los binarios.
- No se documentan idiomas soportados ni calidad multilingüe del encoder CLIP en esta conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación independiente del benchmark publicado.
- No se proporcionan pesos en safetensors ni GGUF, lo que limita la inspección, el fine-tuning o la ejecución fuera del stack QNN.
- El rendimiento de 29 s por imagen puede ser insuficiente para experiencias interactivas en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bindx-dev/stable_diffusion_v1_5-sm8975
- Modelo base: https://huggingface.co/runwayml/stable-diffusion-v1-5
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
