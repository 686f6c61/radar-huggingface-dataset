# 0xSojalSec/Qwen-Image-2.1-viggle-turbo-5x

## Resumen

Qwen-Image-2.1-viggle-turbo es un adaptador LoRA de destilación construido sobre Qwen/Qwen-Image-2.1, el modelo unificado de generación de imágenes y edición de la familia Qwen. Lo desarrolla Viggle aplicando Distribution Matching Distillation (DMD) para convertir el modelo base, que necesita 40 pasos de muestreo, en un estudiante que produce resultados comparables en 6 pasadas del transformer y sin classifier-free guidance. La versión publicada en este repositorio por el usuario 0xSojalSec corresponde a la v0.2.1, con adaptadores en rango 256 y 128 en formato diffusers y peft.

El modelo resuelve el principal cuello de botella práctico de los difusores de imagen de alta calidad: el coste de inferencia. Al reducir de 40 a 6 pasos, consigue un speedup de aproximadamente 5x de extremo a extremo manteniendo una calidad que, según el autor, es difícil de distinguir del base en la mayoría de prompts. La principal brecha reconocida está en texto pequeño y denso, donde el modelo base sigue siendo superior, aunque 8 pasos estrechan la diferencia.

Es relevante ahora porque combina tres piezas que hasta hace poco no coincidían: un modelo base abierto de 7B parámetros para generación y edición, una técnica de destilación que hace viable la inferencia en tiempo casi interactivo, y soporte para ComfyUI con workflows listos para usar. El repositorio incluye además el pipeline de text-to-image, image-to-image y edición con 1 a 3 imágenes de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DiT de flujo único (single-stream DiT, 32 capas) sobre Qwen-Image-2.1, con adaptador LoRA de destilación |
| Parametros totales | 7.115.124.736 (pesos del transformer base); el adaptador LoRA r256 ocupa 1,3 GB y el r128 680 MB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en los adaptadores publicados; el modelo base admite cuantizaciones GGUF y otras segun su propio repositorio (no detalladas aqui) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (licencia "other" en HuggingFace, con enlace a LICENSE) |
| Formato de pesos | safetensors (formato de claves diffusers y peft), bf16 en los LoRA publicados y F32 en peft_v0.2.1 |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un difusor de transformer de flujo único (single-stream DiT) con 32 capas y unos 7B parámetros en su componente de generación visual. Este repositorio no contiene el modelo base completo, sino adaptadores LoRA que se cargan sobre el transformer base en tiempo de ejecución. El adaptador v0.2.1 tiene rango 256 y alpha 256 en bf16 (1,3 GB), con una variante truncada a rango 128 y alpha 128 (680 MB) para los workflows de ComfyUI.

El entrenamiento emplea Distribution Matching Distillation (DMD): un estudiante few-step aprende a igualar la distribución del profesor de 40 pasos. El calendario de sigmas suministrado es `[1.0, 0.9375, 0.875, 0.75, 0.5, 0.25]` para 6 pasos. La v0.2.1 es el checkpoint del paso 700 de un run cuyo paso 600 se publicó como v0.2; respecto a v0.2 mejora ligeramente la nitidez (Laplacian sharpness 0,0199 frente a 0,0187) y la diversidad (0,98x frente a 0,97x del modelo base), manteniendo un 0% de deriva de composición. Frente a la v0.1 (LoRA r64 y fine-tune completo), la mejora es sustancial: la diversidad de muestras pasa de 0,75 a 0,98 respecto al base y la deriva de composición de −0,019 a +0,000.

## Capacidades

- Generación de texto a imagen (text-to-image) de alta resolución con 6 pasos de muestreo.
- Edición de imagen guiada por instrucciones en lenguaje natural (instruction-driven editing).
- Edición con 1 a 3 imágenes de referencia, lo que permite composición multi-referencia.
- Text-to-image e image-to-image dentro del mismo pipeline.
- Muestreo sin classifier-free guidance, lo que reduce el coste computacional por paso.
- Integración con ComfyUI mediante nodos personalizados y workflows ya preparados.
- Compatibilidad con la librería diffusers y con el ecosistema peft.
- No se documentan capacidades de tool calling, agentes, audio, vídeo ni modo de razonamiento explícito.

## Casos de uso

- Generación de imágenes en producción con requisitos de latencia baja: al necesitar solo 6 pasadas del transformer en lugar de 40, permite servir peticiones de text-to-image con un coste por imagen muy inferior al del modelo base, adecuado para APIs con alto volumen.
- Edición fotográfica asistida por instrucciones: el modelo acepta instrucciones en lenguaje natural y una o varias referencias, por lo que puede usarse en herramientas de retoque donde el usuario describe el cambio que quiere aplicar sobre una imagen existente.
- Creación de variaciones de producto para comercio electrónico: a partir de una imagen de referencia se pueden generar variaciones controladas de fondo, iluminación o composición manteniendo el sujeto, con 1 a 3 referencias.
- Prototipado rápido de conceptos visuales en estudio de diseño: los 6 pasos permiten iterar de forma casi interactiva sobre prompts, algo inviable con un modelo de 40 pasos en hardware modesto.
- Pipelines de aumento de datos sintéticos: generar lotes grandes de imágenes etiquetadas para entrenar otros modelos de visión, donde el ahorro de 5x en cómputo se traduce directamente en más datos por hora de GPU.
- Edición por lotes en flujos de postproducción: aplicar una misma instrucción de edición a muchas imágenes con referencias consistentes, aprovechando el soporte de ComfyUI para automatizar grafos.
- Integración en aplicaciones de escritorio o locales con GPU consumer: al ser un adaptador LoRA sobre un base de 7B, es viable en equipos con VRAM limitada si se cuantiza el base, aunque el repositorio avisa de requisitos de 48 GB o más para la configuración completa sin cuantizar.

## Benchmarks y rendimiento

El autor publica métricas internas sobre un conjunto reservado de 96 peticiones de usuario (text-to-image y edición) comparadas contra el modelo base de 40 pasos con su mejora de prompt oficial. No son benchmarks estándar tipo MMLU o GenEval.

| Metrica | v0.1 LoRA r64 | v0.1 full fine-tune | v0.2.1 LoRA r256, 6 pasos | v0.2 LoRA r256, 6 pasos | v0.2, 5 pasos | v0.2, 4 pasos |
|---|---|---|---|---|---|---|
| Diversidad de muestras, x modelo base | 0,75 | 0,72 | 0,98 | 0,97 | 0,93 | 0,89 |
| Deriva de composición vs base | −0,019 | −0,033 | +0,000 | −0,001 | +0,000 | +0,002 |
| Prompts cuyo layout difiere del base | no disponible | no disponible | 0% | 0% | 4% | no disponible |

Definiciones aportadas por el autor: la diversidad es la distancia media de parches DINOv2 intra-prompt sobre 8 semillas por prompt y 32 prompts, expresada como ratio respecto al base de 40 pasos (1,00 = igual de diverso). La deriva de composición es el desplazamiento horizontal medio del centroide de la imagen respecto a la salida del base para el mismo prompt y semilla, en anchos de imagen. El porcentaje de layout distinto es la proporción de los 96 prompts donde la composición difiere visiblemente del base (deriva de centroide superior a 0,05 anchos de imagen).

Datos adicionales de calidad reportados: Laplacian sharpness de 0,0199 en v0.2.1 frente a 0,0187 en v0.2. El autor indica un speedup de aproximadamente 5x de extremo a extremo frente al modelo base de 40 pasos. No se han publicado resultados de benchmarks estandarizados (GenEval, T2I-CompBench, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen-Image-2.1 más los adaptadores requiere del orden de 48 GB o más para la configuración completa en bf16 sin cuantizar, segun fuentes de seguimiento de modelos locales. Con cuantización del base la cifra baja, aunque no se detallan valores exactos en la informacion disponible.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPU con 48 GB o más para la configuración sin cuantizar. El adaptador r128 (680 MB) reduce ligeramente la huella frente al r256 (1,3 GB), pero el cuello de botella es el transformer base de 7B.
- GPU consumer: no cabe en consumer GPU en bf16 sin cuantizar. Con cuantización de 8 o 4 bits del transformer base podría intentarse en RTX 4090 (24 GB) o RTX 3090 (24 GB), pero no hay confirmación oficial en la informacion disponible.
- Opciones de despliegue: diffusers, ComfyUI (nodos personalizados en `comfyui/`), y peft mediante `peft_v0.2.1/`. No se mencionan vLLM, TGI ni Ollama para este modelo, al ser un difusor de imagen y no un LLM.
- Latencia y throughput: no se publican valores absolutos de latencia o imagenes por segundo. El unico dato cuantitativo es el speedup de aproximadamente 5x frente al base de 40 pasos, gracias a 6 pasadas del transformer y a la ausencia de classifier-free guidance.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de muestreo | Contexto/formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-viggle-turbo v0.2.1 | 7,115B base + LoRA 1,3 GB (r256) | 6 (hasta 8 en texto denso) | safetensors, diffusers y peft | qwen-research | HuggingFace, ModelScope, ComfyUI |
| Qwen/Qwen-Image-2.1 (base) | 7B en el componente visual (32 capas DiT) | 40 | safetensors, diffusers | qwen-research | HuggingFace, GitHub, demo Space |
| Qwen-Image-2.1-viggle-turbo v0.1 | 7B base + LoRA r64 o fine-tune completo | 4 | safetensors | qwen-research | HuggingFace |
| Otros destilados few-step de difusores de imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion principal es contra el propio modelo base: el turbo ofrece aproximadamente 5x menos pasos con diversidad de 0,98x y 0% de deriva de composicion, a costa de menor fidelidad en texto pequeno y denso y en ediciones complejas (composicion multi-referencia, face swaps, ediciones con preservacion de identidad). No se dispone de datos comparativos frente a otros destilados de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Las ediciones complejas pueden quedar por debajo del modelo base: composicion con multiples referencias, intercambio de caras, ediciones con preservacion de identidad e instrucciones con varias restricciones simultaneas.
- El texto pequeno y denso es el punto mas debil: el base de 40 pasos sigue siendo superior; usar 8 pasos en lugar de 6 estrecha la diferencia pero no la elimina.
- Riesgo de alucinacion y de deriva semantica inherente a los modelos de difusion: el modelo puede generar contenido no solicitado o ignorar partes del prompt, especialmente en prompts largos y con muchas restricciones.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible, pero al heredar el modelo base y sus datos de entrenamiento, es probable que reproduzca los sesgos presentes en Qwen-Image-2.1.
- Restricciones de licencia: licencia qwen-research (categoria "other" en HuggingFace). Es una licencia de investigacion, por lo que el uso comercial requiere revisar los terminos del archivo LICENSE del repositorio; no se garantiza uso comercial libre.
- Los workflows de ComfyUI estan reconocidos por el propio autor como poco maduros: fueron portados en gran medida con asistencia de un asistente de codificacion por IA y pueden presentar asperezas, aunque se validaron contra el pipeline de diffusers.
- El repositorio correspondiente a 0xSojalSec no tiene descargas ni likes y fue creado y actualizado el mismo dia, por lo que conviene verificar la procedencia frente al repositorio original de Viggle antes de usarlo en produccion.
- No se documentan idiomas soportados ni longitud de contexto; estas especificaciones dependen del modelo base y no se detallan aqui.
- La cuantizacion no esta documentada para este adaptador: los pesos publicados son bf16 y F32 en peft, y no se ofrecen variantes GGUF propias.

## Enlaces

- Repositorio en HuggingFace (0xSojalSec): https://huggingface.co/0xSojalSec/Qwen-Image-2.1-viggle-turbo-5x
- Repositorio original de Viggle: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Demo Space de Viggle: https://huggingface.co/spaces/Viggle/Qwen-Image-2.1-viggle-turbo
- Modelo base Qwen-Image-2.1 en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1
- Demo Space del modelo base: https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- ModelScope (Viggle): https://www.modelscope.cn/models/Viggle/Qwen-Image-2.1-viggle-turbo
- Espejo en HuggingFace (chfm): https://huggingface.co/chfm/Qwen-Image-2.1-viggle-turbo
- Analisis de requisitos de hardware: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/23/qwen-image-2-1-viggle-turbo-v0-1-preview/
