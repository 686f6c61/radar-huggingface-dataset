# jaygensi/dreamshaper-8-npu

## Resumen

DreamShaper 8 para NPU es una conversión del modelo de difusión texto-a-imagen DreamShaper 8 (fine-tune de Stable Diffusion 1.5 creado por Lykon) a binarios de contexto QNN, el formato de ejecución del SDK QAIRT de Qualcomm. La conversión la firma el usuario jaygensi y está pensada para ejecutarse en la NPU Hexagon de los Snapdragon recientes mediante el motor propio de la aplicación Android LATAS, aunque cualquier runtime QNN capaz de ejecutar la exportación oficial de SD 1.5 de Qualcomm puede cargar los mismos binarios.

El repositorio no contiene pesos en safetensors ni GGUF, sino cuatro archivos ZIP, uno por generación de chip (SM8550, SM8650, SM8750 y SM8850). Cada ZIP incluye tres binarios: `text_encoder.bin`, `unet.bin` y `vae.bin`. El modelo mantiene la arquitectura original de SD 1.5 (UNet, CLIP ViT-L/14 y VAE) con resolución fija de 512 × 512, pero cuantizada a 8 bits en pesos y 16 bits en activaciones (w8a16).

Su relevancia es acotada pero concreta: demuestra un flujo de despliegue de difusión en NPU móvil con cuantización agresiva y una pérdida de calidad medida y documentada. El autor advierte de que ninguno de los binarios se ha ejecutado todavía en un teléfono físico; las comprobaciones se han hecho sobre el simulador HTP de Qualcomm para x86.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + CLIP ViT-L/14 text encoder + VAE decoder), exportada a ONNX y compilada a QNN HTP context binaries |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de texto fija de 77 tokens CLIP (padding con 49407) |
| Tipos de cuantizacion | w8a16 (pesos 8 bits por canal de salida, activaciones 16 bits); embeddings del text encoder a 16 bits; 12 convoluciones sensibles del UNet mantenidas a 16 bits; pesos del UNet redondeados con GPTQ |
| Idiomas soportados | no disponible (el prompt se procesa con el tokenizador CLIP de SD 1.5, predominantemente inglés) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | QNN context binaries (`.bin`) empaquetados en ZIP por chip; no hay safetensors ni GGUF |
| Resolucion de salida | 512 × 512 (única soportada) |
| Entradas/salidas | int32/uint16 según binario; todo fijo de 16 bits con escala y offset embebidos |
| Tamaño del repo | 5,7 GB |

## Arquitectura y entrenamiento

El modelo subyacente es DreamShaper 8, un fine-tune de Stable Diffusion 1.5. La conversión no reentrena: parte de los pesos de diffusers y los transforma en tres grafos. Primero se exportan a ONNX con entradas y salidas en NHWC; el wrapper del VAE divide por el factor de escala latente (0,18215) y mapea la salida a [0, 1]; la máscara causal de CLIP se pliega en constantes de −100. Después se cuantiza con las herramientas QAIRT 2.51 de Qualcomm: calibración min-max sobre salidas del propio DreamShaper, GPTQ para redondear los pesos del UNet y preservación a 16 bits de las 12 convoluciones más sensibles y de las tablas de embedding del text encoder. Finalmente se compilan binarios de contexto HTP para Hexagon v73, v75, v79 y v81.

La innovación técnica está en el pipeline de cuantización y en la preservación de calidad medida: en el simulador HTP x86, con prompts no usados en calibración, el error relativo del UNet frente a fp32 es del 0,9-2,7 % según el timestep, la similitud coseno media del text encoder es 0,991 y las imágenes del VAE quedan en 53-56 dB PSNR respecto al decodificador fp32 (error medio 0,3/255). El classifier-free guidance ejecuta el UNet dos veces por paso (prompt y prompt negativo). No hay información sobre el dataset de entrenamiento original ni sobre RLHF/DPO, porque son heredados de DreamShaper 8 y SD 1.5.

## Capacidades

- Generación de imágenes texto-a-imagen a 512 × 512 con el estilo de DreamShaper 8.
- Prompt negativo mediante classifier-free guidance (dos pasadas del UNet por paso).
- Carga en NPU Hexagon de Snapdragon 8 Gen 2, 8 Gen 3, 8 Elite y 8 Elite Gen 5 mediante los binarios específicos por chip.
- Integración con el motor de la app LATAS (opción "NPU DreamShaper") y con cualquier runtime QNN compatible con la exportación oficial de SD 1.5 de Qualcomm.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe no documentada; el text encoder es CLIP ViT-L/14 de SD 1.5.

## Casos de uso

- Generación de imágenes en dispositivos Android de gama alta: la app LATAS carga los binarios y ejecuta la difusión en la NPU Hexagon, sin depender de la nube ni de una GPU dedicada.
- Prototipado de pipelines de difusión en NPU: sirve para validar el flujo exportación ONNX → cuantización QAIRT → contexto HTP antes de invertir en un modelo propio.
- Aplicaciones de edición creativa offline: al ejecutarse localmente, permite generar ilustraciones o avatares sin enviar prompts a un servidor.
- Evaluación comparativa de cuantización w8a16 en difusión: los errores documentados (0,9-2,7 % en UNet, 0,991 de similitud coseno en CLIP, 53-56 dB PSNR en VAE) permiten medir el coste de calidad en un dispositivo concreto.
- Base para fine-tunes propios sobre SD 1.5 en móvil: el repositorio LATAS incluye scripts en `tools/npu_finetune/` y guía en `docs/npu-finetune.md` para repetir el proceso con otros pesos.
- Demos de investigación sobre eficiencia energética: al ejecutarse en NPU en lugar de GPU, permite medir consumo y latencia en un SoC móvil.
- Integración en apps de mensajería o redes sociales Android que necesiten generación de imágenes on-device con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de calidad son las métricas de fidelidad frente a fp32 medidas en el simulador HTP x86 de Qualcomm:

| Metrica | Valor |
|---|---|
| Error relativo UNet vs fp32 | 0,9-2,7 % según timestep |
| Similitud coseno media text encoder vs fp32 | 0,991 |
| PSNR del VAE decoder vs fp32 | 53-56 dB |
| Error medio del VAE | 0,3 / 255 |

No hay datos de latencia ni throughput en dispositivo, porque el autor indica que ninguno de los binarios se ha ejecutado en un teléfono.

## Requisitos de hardware

- NPU Hexagon obligatoria: los binarios solo cargan en la generación de chip para la que se compilaron (v73, v75, v79 o v81). No funcionan en CPU ni GPU genéricas.
- Chips compatibles: Snapdragon 8 Gen 2 (SM8550), 8 Gen 3 (SM8650), 8 Elite (SM8750) y 8 Elite Gen 5 (SM8850).
- Runtime: SDK QAIRT de Qualcomm con runtime QNN (no incluido en el repositorio, con licencia propia).
- VRAM: no aplica; el modelo se ejecuta en la NPU y la memoria compartida del SoC. El tamaño del repo es de 5,7 GB, repartido entre los cuatro ZIP.
- GPU de escritorio: no soportado como destino; solo se usa el simulador HTP x86 para validación.
- Opciones de despliegue: motor propio de la app LATAS o cualquier runtime QNN compatible con la exportación oficial de SD 1.5 de Qualcomm.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolucion | Cuantizacion | Destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jaygensi/dreamshaper-8-npu | SD 1.5 (UNet + CLIP + VAE) | 512 × 512 | w8a16, QNN context binaries | NPU Hexagon Snapdragon | CreativeML Open RAIL-M | Hugging Face, 0 descargas |
| Lykon/dreamshaper-8 | SD 1.5 (UNet + CLIP + VAE) | 512 × 512 | fp16/fp32 en diffusers | GPU/CPU genéricas | CreativeML Open RAIL-M | Hugging Face, ampliamente usado |
| Exportación oficial SD 1.5 de Qualcomm (QAIRT) | SD 1.5 | 512 × 512 | QNN context binaries | NPU Hexagon Snapdragon | según SD 1.5 | SDK QAIRT de Qualcomm |

La comparativa con otros modelos de difusión en NPU móvil no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Ninguno de los binarios se ha ejecutado en un teléfono físico; solo se han validado en el simulador HTP x86 de Qualcomm. El propio autor advierte de que los ZIP de SM8650, SM8750 y SM8850 solo tienen el text encoder comprobado en simulador.
- Los binarios son específicos por generación de chip: un ZIP de SM8550 no carga en SM8650 ni viceversa.
- Resolución fija de 512 × 512; no hay soporte para otras resoluciones ni para inpainting, img2img u otras tareas.
- Los pesos están cuantizados a w8a16, por lo que las salidas difieren del modelo fp32 original (errores documentados en la sección de benchmarks).
- Requiere el runtime QNN de Qualcomm, con licencia propia no incluida en el repositorio.
- Licencia CreativeML Open RAIL-M: el uso comercial está permitido pero sujeto a las restricciones de uso del párrafo 5 y el Anexo A, y quien redistribuya los archivos debe quedar sujeto a las mismas restricciones. Se exige atribución a Stability AI, CompVis, Runway, Lykon y OpenAI (CLIP).
- Riesgo de sesgos y alucinaciones visuales heredado de SD 1.5 y DreamShaper 8; no hay evaluación específica de sesgos en la información disponible.
- Idiomas soportados no documentados; el tokenizador CLIP de SD 1.5 está orientado al inglés.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado más allá del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaygensi/dreamshaper-8-npu
- Modelo base DreamShaper 8: https://huggingface.co/Lykon/dreamshaper-8
- Repositorio LATAS (scripts en `tools/npu_finetune/`, guía en `docs/npu-finetune.md`): no disponible la URL exacta en la información proporcionada
- SDK QAIRT de Qualcomm (runtime QNN): no disponible la URL exacta en la información proporcionada
