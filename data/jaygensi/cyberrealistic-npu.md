# jaygensi/cyberrealistic-npu

## Resumen

CyberRealistic NPU es una conversión del modelo de difusión texto-a-imagen CyberRealistic v9 (un fine-tune fotorrealista de Stable Diffusion 1.5 desarrollado por Cyberdelia) a binarios de contexto QNN para la NPU Hexagon de los chips Snapdragon recientes. El autor de la conversión es jaygensi, y el objetivo es permitir la generación de imágenes fotorrealistas en el propio dispositivo (on-device) en teléfonos Android, sin depender de la nube ni de GPUs dedicadas. Los binarios están pensados para la opción de imagen "NPU CyberRealistic" de la aplicación Android LATAS, aunque cualquier runtime QNN capaz de ejecutar la exportación oficial de SD 1.5 de Qualcomm puede cargarlos de la misma forma.

Técnicamente se trata de Stable Diffusion 1.5 (arquitectura UNet + CLIP ViT-L/14 + VAE) con pesos cuantizados a 8 bits y activaciones de 16 bits (w8a16), compilados a binarios HTP para cuatro generaciones de Hexagon (v73, v75, v79 y v81). El modelo solo genera imágenes de 512 × 512 píxeles y requiere ejecutar el UNet dos veces por paso para el classifier-free guidance. El repositorio ocupa 3,7 GB e incluye un zip por chip, cada uno con `text_encoder.bin`, `unet.bin`, `vae.bin` y los ficheros de licencia.

La relevancia actual radica en que demuestra un flujo completo de conversión de un modelo de difusión popular a la NPU de un móvil, con métricas de error de cuantización medidas en el simulador HTP de Qualcomm. No obstante, conviene subrayar que ninguno de los binarios se ha ejecutado todavía en un teléfono real: todas las cifras provienen del simulador x86.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + CLIP ViT-L/14 + VAE), exportada a ONNX y compilada a QNN HTP |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens (contexto de texto de CLIP) |
| Tipos de cuantización | w8a16: pesos 8 bits por canal de salida, activaciones 16 bits; GPTQ en los pesos del UNet con las 12 convoluciones más sensibles a 16 bits; tablas de embedding del text encoder a 16 bits |
| Idiomas soportados | no disponible (el prompt de texto depende del tokenizador CLIP de SD 1.5) |
| Licencia | CreativeML Open RAIL-M (con aviso MIT para el text encoder CLIP) |
| Formato de pesos | binarios de contexto QNN (`.bin`) empaquetados en zips por chip; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es CyberRealistic v9, un fine-tune fotorrealista de Stable Diffusion 1.5. La conversión parte del fichero `CyberRealistic_V9_FP16.safetensors` (SHA-256 `22c789604729ed346f745497b99eb62df116e7b50f671e4edf4058d382b0a235`) y aplica tres etapas: exportación de los pesos de diffusers a ONNX con entradas y salidas en NHWC (el wrapper del VAE divide por el factor de escalado latente y mapea la salida a [0, 1]; la máscara causal de CLIP se pliega en constantes de -100), cuantización con las herramientas QAIRT 2.51 de Qualcomm y compilación a binarios de contexto HTP para Hexagon v73, v75, v79 y v81.

La calibración min-max se hizo sobre salidas propias de CyberRealistic (96 muestras del UNet, 64 de ellas con prompts de personas y el negative prompt de la app). El text encoder es el propio de CyberRealistic (difiere del de SD 1.5 base, con coseno por token de 0,95 frente a este) y emite la última capa (clip skip 1). El decoder del VAE es el del checkpoint, mientras que el encoder del VAE es bit a bit idéntico al de SD 1.5, por lo que image-to-image puede usar el encoder compartido de SD 1.5. Los scripts de conversión están en el repositorio LATAS (`tools/npu_finetune/`, guía en `docs/npu-finetune.md`).

Los binarios presentan estas interfaces: `text_encoder.bin` recibe `tokens` int32 `[1, 77]` (ids CLIP, relleno con 49407) y devuelve `text_embedding` uint16 `[1, 77, 768]`; `unet.bin` recibe `latent` uint16 `[1, 64, 64, 4]` (NHWC, ya multiplicado por 1/√(σ²+1)), `timestep` uint16 `[1, 1]` (0-999) y `text_emb` uint16 `[1, 77, 768]`, y devuelve epsilon uint16 `[1, 64, 64, 4]`; `vae.bin` recibe `latent` uint16 `[1, 64, 64, 4]` y devuelve `image` uint16 `[1, 512, 512, 3]` en RGB [0, 1]. Todas las entradas y salidas son de coma fija de 16 bits, con escala y offset almacenados en los propios binarios.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto, a resolución fija de 512 × 512.
- Ejecución del pipeline completo de Stable Diffusion 1.5 (text encoder, UNet y VAE) en la NPU Hexagon, sin GPU.
- Classifier-free guidance mediante doble pasada del UNet por paso (prompt y negative prompt).
- Soporte de image-to-image reutilizando el encoder del VAE de SD 1.5, bit a bit idéntico al del checkpoint.
- Ejecución en cuatro generaciones de Snapdragon: SM8550 (8 Gen 2), SM8650 (8 Gen 3), SM8750 (8 Elite) y SM8850 (8 Elite Gen 5).
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.
- Capacidad multilingüe: no disponible; depende del tokenizador CLIP de SD 1.5 y de la calidad del fine-tune para cada idioma.

## Casos de uso

- Generación de imágenes fotorrealistas on-device en Android: la app LATAS carga los tres binarios con su propio motor y ejecuta el pipeline completo en la NPU, sin enviar prompts ni imágenes a servidores externos.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en el dispositivo, resulta adecuado para generar retratos o imágenes personales sin que los datos salgan del teléfono.
- Prototipado de funciones de cámara o edición fotográfica: el soporte de image-to-image con el encoder de SD 1.5 permite variaciones y retoques de fotos existentes en el propio móvil.
- Demostración de conversión de modelos de difusión a NPU: los scripts de `tools/npu_finetune/` sirven de referencia para portar otros fine-tunes de SD 1.5 a QNN.
- Investigación sobre cuantización w8a16 en aceleradores móviles: las métricas de error relativo y PSNR publicadas permiten estudiar el impacto de GPTQ y la calibración min-max en un UNet de difusión.
- Generación de avatares o ilustraciones para apps de mensajería: la resolución de 512 × 512 y el estilo fotorrealista encajan con iconos y avatares de tamaño medio.
- Integración en flujos de creación de contenido offline: útil en entornos sin conectividad donde se requiera generar imágenes a partir de descripciones textuales.

## Benchmarks y rendimiento

Las únicas métricas publicadas provienen del simulador HTP x86 de Qualcomm ejecutando los binarios compilados para v73 (Snapdragon 8 Gen 2). No hay mediciones en teléfono real.

| Componente | Métrica | Valor |
|---|---|---|
| UNet | Error relativo frente al modelo fp32 en timesteps 299 / 37 / 3 | 0,99 % / 1,59 % / 2,73 % |
| UNet | Coseno frente al modelo fp32 en timesteps 299 / 37 / 3 | 1,0000 / 0,9999 / 0,9996 |
| Text encoder | Similitud coseno media (peor caso) en 10 prompts | 0,994 (0,988) |
| VAE decoder | PSNR frente al decoder fp32 en dos imágenes reservadas | 52,7 dB y 59,4 dB |

Las muestras empleadas para el UNet son prompts y semillas reservados, nunca usados en calibración ni en GPTQ, con el negative prompt de la app. Para los chips v75, v79 y v81 solo se simuló el text encoder (4 prompts, resultados idénticos a v73); el UNet y el VAE no se simularon. Los binarios de esos chips se compilaron a partir de los mismos modelos cuantizados. No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware imprescindible: NPU Hexagon de un Snapdragon compatible; un binario de contexto solo carga en la generación de NPU para la que fue compilado (v73/SM8550, v75/SM8650, v79/SM8750 o v81/SM8850).
- Runtime: se necesita el runtime QNN de Qualcomm (no incluido en el repositorio, con licencia propia); cualquier runtime QNN capaz de ejecutar la exportación oficial de SD 1.5 de Qualcomm puede cargar estos binarios.
- VRAM estimada: no aplica; la inferencia ocurre en la NPU y en la memoria del dispositivo. El tamaño del repositorio es de 3,7 GB, repartido entre los cuatro zips.
- GPU: no se requiere GPU; no se documenta soporte para A100, H100, RTX 4090 ni otras GPU de escritorio.
- Compatibilidad con GPU de consumo: no aplica, al ser binarios específicos de NPU.
- Opciones de despliegue: app LATAS (AGPL v3) con su motor propio, o cualquier runtime QNN compatible con la exportación de SD 1.5 de Qualcomm. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; no se han ejecutado en teléfono y no se publican cifras de tiempo por paso ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Cuantización | Plataforma | Licencia | Estado |
|---|---|---|---|---|---|---|
| cyberrealistic-npu (este) | SD 1.5 fine-tune a QNN | 512 × 512 | w8a16 (GPTQ en UNet) | NPU Hexagon Snapdragon | CreativeML Open RAIL-M | Binarios compilados, sin probar en teléfono |
| CyberRealistic v9 (cyberdelia) | SD 1.5 fine-tune en safetensors | 512 × 512 (SD 1.5) | fp16 / fp32 | GPU o CPU | CreativeML Open RAIL-M (metadatos) / Open RAIL++-M (texto) | Modelo original, ampliamente usado |
| Exportación oficial SD 1.5 de Qualcomm | SD 1.5 en QNN | 512 × 512 | Según exportación de Qualcomm | NPU Hexagon Snapdragon | CreativeML Open RAIL-M | Referencia de compatibilidad de runtime |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ninguno de los binarios se ha ejecutado en un teléfono real; todas las métricas proceden del simulador HTP x86 de Qualcomm.
- Para SM8650, SM8750 y SM8850 solo se simuló el text encoder; el UNet y el VAE no se simularon, por lo que su comportamiento en hardware real es incierto.
- Un binario de contexto solo funciona en la generación de NPU para la que fue compilado; no hay compatibilidad cruzada entre chips.
- Resolución fija de 512 × 512; no se documenta soporte para otras resoluciones ni para aspect ratios distintos.
- El classifier-free guidance duplica la ejecución del UNet por paso, lo que incrementa el coste computacional.
- Las salidas difieren ligeramente del modelo fp32 original debido a la cuantización; el error relativo del UNet llega al 2,73 % en el timestep 3.
- Riesgo de sesgos y de alucinación visual inherente a Stable Diffusion 1.5 y a su dataset de entrenamiento; no se documentan evaluaciones de sesgo.
- La licencia CreativeML Open RAIL-M impone restricciones de uso del párrafo 5 y del anexo A; el uso comercial está permitido dentro de esos términos y quien redistribuya los ficheros debe quedar sujeto a las mismas restricciones.
- La procedencia de las partes fusionadas en el checkpoint no puede verificarse desde fuera, según advierte el propio autor.
- El runtime QNN de Qualcomm tiene licencia propia y no se incluye en el repositorio.
- El modelo está pensado para la app LATAS; su integración en otras aplicaciones requiere un runtime QNN compatible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jaygensi/cyberrealistic-npu
- Modelo base CyberRealistic: https://huggingface.co/cyberdelia/CyberRealistic
- Repositorio LATAS (app, motor y scripts de conversión): https://github.com/joglezn/LATAS
