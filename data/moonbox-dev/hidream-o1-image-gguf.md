# moonbox-dev/HiDream-O1-Image-GGUF

## Resumen

HiDream-O1-Image es un modelo fundacional generativo de imagen de tipo nativamente unificado, desarrollado por HiDream-ai, construido sobre un Pixel-level Unified Transformer (UiT). A diferencia de los pipelines de difusion convencionales, no emplea un VAE externo ni un codificador de texto separado: codifica pixeles crudos, texto y condiciones especificas de tarea en un unico espacio de tokens compartido. El resultado es un modelo de 8.182.557.936 parametros que cubre generacion texto-a-imagen, edicion de imagen y personalizacion guiada por sujeto a resoluciones de hasta 2048 x 2048.

La ficha que nos ocupa, `moonbox-dev/HiDream-O1-Image-GGUF`, es una conversion a formato GGUF del modelo original `HiDream-ai/HiDream-O1-Image`, realizada por Moonbox para inferencia en dispositivo. Se ofrecen seis precisiones (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) con verificacion de error RMS relativo frente a los pesos BF16 originales. Al ser un modelo unico sin encoder de texto ni VAE separados, cada fichero GGUF contiene el modelo completo; solo se omite la cabeza de salida de texto (`lm_head`), innecesaria para generar imagenes.

La relevancia actual es doble: por un lado, HiDream-O1-Image-Dev-2604 se situo en el puesto 8 de la Artificial Analysis Text to Image Arena, posicionandose como el principal modelo de pesos abiertos de texto-a-imagen; por otro, esta conversion GGUF permite ejecutar un modelo de 8B en hardware de consumo mediante `stable-diffusion.cpp`, algo inviable con el pipeline PyTorch original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pixel-level Unified Transformer (UiT) estilo Qwen3-VL, sin VAE ni text encoder externos |
| Parametros totales | 8.182.557.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (original en safetensors/BF16) |
| Resolucion maxima | 2048 x 2048 |
| Pasos de inferencia | 50 (CFG 5.0, flow shift 3) |
| Tamano del repo | 61.4 GB |

## Arquitectura y entrenamiento

HiDream-O1-Image se basa en un Pixel-level Unified Transformer (UiT) que opera directamente en pixeles, sin VAE ni codificador de texto disjunto. Texto, pixeles y condiciones especificas de tarea se proyectan a un unico espacio de tokens compartido, lo que permite abordar generacion texto-a-imagen, edicion y personalizacion con el mismo backbone. La arquitectura sigue el estilo de Qwen3-VL, con una torre de vision cuyo peso de patch-embedding 3D se almacena plegado a 4 dimensiones ([out x in, t, h, w]) en la conversion GGUF, y dispone de embedders y capa final que permanecen en BF16 en todas las precisiones.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la documentacion proporcionada. El modelo original se publico en dos variantes: una no destilada y una destilada (Dev), junto con un agente de refinamiento de prompts (Reasoning-Driven Prompt Agent). La conversion GGUF se genero a partir de la revision `0b0901d99f` del modelo original: los pesos BF16 se convirtieron a GGUF F16/BF16 y despues se cuantizaron con `llama-quantize` de llama.cpp.

## Capacidades

- Generacion de imagen texto-a-imagen a resoluciones de hasta 2048 x 2048.
- Edicion de imagen guiada por instrucciones (image-to-image), invocando el runtime con `-r input.png`.
- Personalizacion guiada por sujeto (subject-driven personalization).
- Acondicionamiento por layout y esqueleto (skeleton) en el pipeline IP, segun las actualizaciones de mayo de 2026.
- Modelo unificado: no requiere encoder de texto ni VAE externos; cada fichero GGUF es el modelo completo.
- Compatible con `stable-diffusion.cpp` para inferencia local.
- Variante Dev con agente de refinamiento de prompts (Prompt-Refine) para texto-a-imagen.
- No incluye cabeza de salida de texto (`lm_head` omitida): no genera texto.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de ilustraciones y concept art en estaciones de trabajo locales: con Q4_K_M (5.53 GB) o Q5_K_M (6.45 GB) el modelo cabe en GPUs de consumo de 8-12 GB de VRAM, permitiendo generar imagenes de 1024 x 1024 en 50 pasos sin depender de servicios en la nube.
- Edicion de imagenes por instruccion en herramientas de escritorio: el soporte image-to-image con `-r input.png` permite integrar retoques guiados por lenguaje natural en editores graficos o flujos de diseno.
- Prototipado rapido de pipelines de difusion sin VAE: al ser un modelo unificado, reduce la complejidad de despliegue (un solo fichero, un solo runtime) y simplifica la integracion en aplicaciones embebidas.
- Personalizacion de marca con sujeto: la capacidad subject-driven permite generar variaciones consistentes de un producto o personaje a partir de imagenes de referencia, util en marketing y e-commerce.
- Acondicionamiento por layout y esqueleto: util para generar imagenes respetando composiciones o poses predefinidas en flujos de storyboard y animacion.
- Investigacion en modelos generativos unificados: el codigo y los pesos MIT permiten estudiar y modificar la arquitectura UiT, comparar cuantizaciones GGUF frente a BF16 y medir el impacto del error RMS en la calidad de imagen.
- Despliegue en entornos con recursos limitados: la tabla de precisiones con error RMS verificado (desde 6.5e-9 % en F16 hasta 6.6 % en Q4_K_M) facilita elegir el compromiso fidelidad/memoria adecuado para cada hardware.

## Benchmarks y rendimiento

La model card de la conversion GGUF proporciona unicamente el error RMS relativo de los pesos dequantizados frente a BF16, promediado sobre todos los parametros. No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la informacion disponible para esta conversion.

| Precision | Tamano | Error RMS relativo vs BF16 |
|---|---|---|
| F16 | 16.37 GB | 6.5e-9 (0.0000006 %) |
| BF16 | 16.37 GB | exacto |
| Q8_0 | 9.27 GB | 0.51 % |
| Q6_K | 7.44 GB | 1.7 % |
| Q5_K_M | 6.45 GB | 3.4 % |
| Q4_K_M | 5.53 GB | 6.6 % |

El modelo original HiDream-O1-Image-Dev-2604 alcanzo el puesto 8 en la Artificial Analysis Text to Image Arena, segun la model card del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas overhead del runtime. Q4_K_M ronda 5.5-6.5 GB, Q5_K_M 6.5-7.5 GB, Q6_K 7.5-8.5 GB, Q8_0 9.3-10.5 GB y F16/BF16 16.4-18 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 o F16; RTX 4080/4070 Ti (12-16 GB) para Q5_K_M o Q6_K; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4_K_M.
- Cabe en GPU de consumo: si, con Q4_K_M en GPUs de 8 GB o mas; Q5_K_M y Q6_K requieren 10-12 GB; Q8_0 requiere 12-16 GB.
- Opciones de despliegue: `stable-diffusion.cpp` (runtime usado en el benchmark del autor, commit 465adf3), con el CLI `sd-cli`. No se mencionan vLLM, llama.cpp ni Ollama como compatibles para generacion de imagen.
- Latencia y throughput: no disponibles. La configuracion de referencia es 50 pasos con CFG 5.0 y flow shift 3 a 1024 x 1024.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas de la misma categoria cuando los datos estan disponibles:

| Modelo | Parametros | Contexto/resolucion | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| HiDream-O1-Image (GGUF, esta ficha) | 8.18B | hasta 2048 x 2048 | MIT | GGUF | Modelo unificado sin VAE ni text encoder |
| HiDream-O1-Image (original) | 8.18B | hasta 2048 x 2048 | MIT | safetensors/BF16 | Requiere pipeline PyTorch |
| HiDream-O1-Image-Dev-2604 | no disponible | no disponible | no disponible | no disponible | Variante destilada, puesto 8 en Artificial Analysis Arena |
| Alternativas de texto-a-imagen de pesos abiertos | no disponible | no disponible | no disponible | no disponible | Sin datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- La cabeza de salida de texto (`lm_head`) se ha eliminado en la conversion: el modelo no puede generar texto, solo imagenes.
- Solo se han convertido los pesos del modelo; el resto del pipeline (si aplica) debe provenir del repositorio original, aunque en este caso el modelo es autocontenido.
- El error RMS de las cuantizaciones bajas (Q4_K_M: 6.6 %, Q5_K_M: 3.4 %) puede degradar la fidelidad visual frente a BF16; el autor indica que las puntuaciones de calidad de imagen se anadiran a medida que cada precision pase la evaluacion, por lo que aun no estan publicadas.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion visual, limitaciones de idioma ni restricciones adicionales de uso comercial mas alla de la licencia MIT.
- PyTorch 2.9.x no esta recomendado para el modelo original debido a un problema conocido con Qwen3-VL (issue 1811); esta advertencia aplica al pipeline original, no al runtime GGUF.
- Para tareas de edicion se recomienda usar el modelo completo (no la variante Dev), segun la model card original.
- El repositorio tiene un tamano de 61.4 GB y solo 11 descargas y 0 likes en el momento de la consulta; es una conversion reciente (noviembre de 2026) con validacion limitada por parte de la comunidad.
- La licencia MIT del repositorio de conversion es heredada del modelo original; conviene verificar los terminos del modelo base antes de uso comercial.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/HiDream-O1-Image-GGUF
- Modelo base: https://huggingface.co/HiDream-ai/HiDream-O1-Image
- Variante Dev: https://huggingface.co/HiDream-ai/HiDream-O1-Image-Dev-2604
- Prompt refiner: https://huggingface.co/HiDream-ai/Prompt-Refine
- Informe tecnico (PDF): https://arxiv.org/pdf/2605.11061v1
- arXiv: 2605.11061
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/HiDream-ai/HiDream-O1-Image
- Demo Dev en Hugging Face Spaces: https://huggingface.co/spaces/HiDream-ai/HiDream-O1-Image-Dev
- Comunidad Discord: https://discord.gg/7ZEnPxdTQ
- Issue de Qwen3-VL relacionado con PyTorch 2.9.x: https://github.com/QwenLM/Qwen3-VL/issues/1811
