# BennyDaBall/MOSS-Image-SFT-NVFP4

## Resumen

MOSS-Image SFT NVFP4 es una cuantización independiente en formato NVFP4 del modelo de generación de imágenes texto-a-imagen MOSS-Image SFT, desarrollado originalmente por el equipo OpenMOSS. La versión que nos ocupa la publica el usuario BennyDaBall y deriva del checkpoint bf16 oficial distribuido por Comfy-Org, empaquetado como un único archivo safetensors de 4,49 GB listo para cargar en ComfyUI sin nodos personalizados ni parches de runtime.

El modelo base es un Diffusion Transformer (DiT) de flujo único de aproximadamente 5.000 millones de parámetros con 42 bloques, acompañado de un codificador de texto Qwen3.5-9B que se mantiene sin cambios. Su rasgo diferencial es la calidad tipográfica: renderiza carteles, etiquetas, menús y notas manuscritas con grafías correctas en inglés, chino, coreano, árabe y otros idiomas, además de aceptar cajas de layout para controlar la posición de los elementos en la composición.

La relevancia de esta ficha radica en el compromiso entre fidelidad y eficiencia: frente al bf16 original (10,16 GB, 27 s por imagen a 1920x1088 en una RTX 5090), esta cuantización ocupa un 56 % menos, reduce el tiempo a 10,96 s y rebaja el pico de VRAM de 22,1 GB a 16,2 GB, con una pérdida medida de LPIPS 0,143 respecto al original. Está pensada específicamente para GPUs Blackwell (RTX 50) con soporte de FP4 nativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT de flujo único, ~42 bloques, con codificador de texto Qwen3.5-9B |
| Parámetros totales | ~5.000 millones (DiT); codificador de texto Qwen3.5-9B aparte |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, sin contexto de tokens de texto definido en la información) |
| Tipos de cuantización | NVFP4 + int8 ConvRot + bf16, con metadatos `comfy_quant` por capa |
| Idiomas soportados | no disponible como listado formal; la model card menciona inglés, chino, coreano y árabe en la generación de texto en imagen |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (single-file, nativo de ComfyUI) |

## Arquitectura y entrenamiento

El modelo base MOSS-Image SFT es un Diffusion Transformer de flujo único de aproximadamente 5.000 millones de parámetros con 42 bloques, acoplado a un codificador de texto Qwen3.5-9B que esta cuantización deja intacto. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; únicamente se indica que el checkpoint de referencia es el SFT publicado por OpenMOSS y que Comfy-Org distribuye la versión bf16 desde la que se parte.

La innovación técnica de esta ficha no está en la arquitectura sino en el proceso de cuantización: las capas FP4 se resuelven mediante Schur Replay GPTQ (actualización de pesos de 2 de noviembre de 2026), una técnica que corrige el error de cuantización capa a capa y evita el deterioro que produce la receta ingenua de "cuantizar todo a FP4", que según el autor arroja LPIPS 0,362 y un desplazamiento de color cálido de +27/+21/+6 en RGB. El resultado se empaqueta con metadatos `comfy_quant` por capa, mezclando NVFP4, int8 ConvRot y bf16 según la sensibilidad de cada bloque, en un único archivo compatible con el nodo Load Diffusion Model estándar de ComfyUI.

## Capacidades

- Generación de imágenes texto-a-imagen de alta resolución (hasta 2048x1152 en las pruebas publicadas).
- Renderizado de texto en imagen con alta fidelidad tipográfica: carteles, letreros, etiquetas, menús y notas manuscritas.
- Soporte multilingüe en el texto renderizado: inglés, chino, coreano y árabe verificados en las pruebas del autor.
- Control de composición mediante cajas de layout (layout boxes), que permiten indicar posición y contenido de elementos concretos.
- Integración nativa en ComfyUI sin nodos personalizados, sin parche de runtime y sin cargador GGUF.
- Ejecución acelerada en hardware Blackwell mediante instrucciones FP4 nativas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Generación de cartelería y pósters con texto legible: el modelo mantiene la ortografía en titulares y subtítulos, algo crítico en piezas publicitarias donde un error tipográfico invalida el resultado. Las cajas de layout permiten fijar dónde va el titular y qué dice exactamente.
- Diseño de etiquetas de producto y packaging: permite componer envases con nombres de marca, ingredientes y códigos legibles, reduciendo las iteraciones manuales de retoque tipográfico posteriores.
- Prototipado rápido de mockups publicitarios en estación de trabajo con RTX 5090: a 10,96 s por imagen a 1920x1088, un diseñador puede explorar decenas de variantes por hora sin salir de ComfyUI.
- Generación de señalética multilingüe: útil para crear paneles, menús de restaurante o carteles de aeropuerto con texto en árabe, coreano o chino, aprovechando la cobertura idiomática verificada.
- Creación de material editorial y portadas: la galería del autor incluye portadas de revista compuestas con cajas de layout, un flujo aplicable a maquetación automatizada de publicaciones.
- Despliegue en entornos con VRAM limitada: con 16,2 GB de pico (incluyendo codificador de texto, VAE y escritorio), cabe en una RTX 5090 de 32 GB y deja margen para otras cargas, a diferencia del bf16 que requiere 22,1 GB.
- Evaluación comparativa de pipelines de cuantización: sirve como referencia para estudiar el impacto de NVFP4 con GPTQ frente a int8 en modelos de difusión, con métricas LPIPS, SSIM y PSNR publicadas.

## Benchmarks y rendimiento

Rendimiento medido por el autor en una RTX 5090 con ComfyUI 0.43.0, plantilla oficial (er_sde, simple, 25 pasos, cfg 2.5), mediana de 5 ejecuciones en caliente:

| Modelo | Archivo | s/imagen 1920x1088 | s/imagen 1024x1024 | VRAM pico |
|---|---|---|---|---|
| bf16 (Comfy-Org) | 10,16 GB | 27,04 | 12,98 | 22,1 GB |
| int8 ConvRot (Comfy-Org) | 5,41 GB | 11,79 | 5,37 | 17,6 GB |
| NVFP4 (este repo) | 4,49 GB | 10,96 | 4,92 | 16,2 GB |

Fidelidad respecto a bf16, medida sobre 66 pares (mismo prompt y semilla):

| Modelo | LPIPS | SSIM | PSNR | Desplazamiento de color (R, G, B) |
|---|---|---|---|---|
| int8 ConvRot (Comfy-Org) | 0,094 | 0,917 | 24,8 dB | +3,4, +1,7, +0,8 |
| NVFP4 (este repo) | 0,143 | 0,876 | 22,1 dB | +2,9, +0,9, +0,3 |

Verificación de texto en prompts de 1024x1024 (16 cadenas por modelo, lectura a ciegas):

| Modelo | Cadenas exactas | Errores de letra |
|---|---|---|
| NVFP4 (este repo) | 15/16 | 2 (árabe) |
| int8 ConvRot | 15/16 | 2 (árabe) |
| bf16 | 13/16 | 5 |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, GenEval) en la información disponible.

## Requisitos de hardware

- VRAM pico estimada: 16,2 GB en la configuración probada, incluyendo codificador de texto Qwen3.5-9B, VAE y unos 3,3 GB de escritorio del sistema.
- GPU recomendada: RTX 5090 (Blackwell), único hardware validado por el autor; el formato NVFP4 requiere soporte de FP4 nativo de la generación Blackwell.
- Compatibilidad con GPU consumer: sí en RTX 50 (probado en RTX 5090 con 32 GB). No se documenta funcionamiento en RTX 40, RTX 30 ni GPUs de datacenter como A100 o H100.
- Opciones de despliegue: ComfyUI 0.43.0 con comfy-kitchen 0.2.40 y PyTorch 2.14 cu130; no requiere nodos personalizados ni cargador GGUF. No se documenta soporte en vLLM, llama.cpp ni TGI (no aplicables a un modelo de difusión de imagen).
- Latencia: 10,96 s por imagen a 1920x1088 y 4,92 s a 1024x1024 en RTX 5090.
- Throughput: aproximadamente 2,5 veces el del bf16 y un 7-8 % superior al int8 ConvRot en la misma máquina.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image SFT NVFP4 (este repo) | ~5.000 M (DiT) + Qwen3.5-9B | safetensors NVFP4, 4,49 GB | no aplica | Apache-2.0 | Hugging Face, ComfyUI nativo |
| MOSS-Image SFT bf16 (Comfy-Org) | ~5.000 M (DiT) + Qwen3.5-9B | safetensors bf16, 10,16 GB | no aplica | Apache-2.0 | Hugging Face, ComfyUI |
| MOSS-Image SFT int8 ConvRot (Comfy-Org) | ~5.000 M (DiT) + Qwen3.5-9B | safetensors int8, 5,41 GB | no aplica | Apache-2.0 | Hugging Face, ComfyUI |

No se dispone en la información proporcionada de comparaciones con otros modelos texto-a-imagen de la competencia (por ejemplo, familias Flux, SDXL o Qwen-Image); los únicos datos cuantitativos disponibles son los tres formatos del propio MOSS-Image.

## Limitaciones y advertencias

- La cuantización introduce una desviación medible respecto a bf16: LPIPS 0,143 frente a 0,094 del int8, y SSIM 0,876 frente a 0,917. Comfy-Org int8 sigue siendo más fiel píxel a píxel.
- La composición puede variar ligeramente con la misma semilla respecto al bf16; el propio autor lo reconoce y lo atribuye también al int8.
- El desplazamiento de color es pequeño pero no nulo (+2,9, +0,9, +0,3 en RGB), aunque inferior al del int8 en los canales verde y azul.
- La verificación de texto se basa en una muestra reducida (16 cadenas por modelo); el resultado "sin regresión" no debe interpretarse como superioridad sobre bf16.
- Requiere hardware Blackwell con soporte FP4; no hay validación documentada en otras arquitecturas, lo que limita su portabilidad.
- Depende de versiones concretas de ComfyUI, comfy-kitchen y PyTorch (0.43.0, 0.2.40 y 2.14 cu130); cambios de versión podrían alterar el comportamiento.
- La model card no documenta sesgos demográficos, culturales ni de representación; al ser un modelo texto-a-imagen, hereda los sesgos del dataset de entrenamiento original, no descrito en la información disponible.
- Riesgo de alucinación tipográfica: aunque la tasa de error es baja, se detectaron fallos en árabe (un punto en una semilla) que también aparecen en bf16 e int8.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo y recomienda validar los resultados en producción.
- Es una cuantización no oficial: no cuenta con el respaldo del equipo OpenMOSS ni de Comfy-Org, y las actualizaciones dependen de un único mantenedor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BennyDaBall/MOSS-Image-SFT-NVFP4
- Modelo base original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Checkpoint bf16 de Comfy-Org: https://huggingface.co/Comfy-Org/MOSS-Image
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Apoyo al autor (Ko-fi): https://ko-fi.com/bennydaball
- Paper de referencia citado en los tags: arXiv:2609.36654 (no verificable en la información disponible)
