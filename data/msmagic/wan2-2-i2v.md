# MsMagic/Wan2.2-I2V

## Resumen

Wan2.2-I2V es un modelo de difusión para generación de vídeo a partir de una imagen (image-to-video, I2V) desarrollado por el equipo Wan (Wan-AI), dentro de la familia Wan2.2. La ficha analizada corresponde al repositorio `MsMagic/Wan2.2-I2V`, una publicación de 126,2 GB etiquetada con `wan2.2`, `diffusers` y `safetensors`, que por nomenclatura y contenido apunta a los pesos del variante I2V-A14B descrito en la model card oficial. Resuelve el problema de animar una imagen fija con movimiento coherente y control estético, en resoluciones de 480P y 720P.

La innovación principal de la familia es la incorporación de una arquitectura de mezcla de expertos (MoE) a un modelo de difusión de vídeo: el proceso de eliminación de ruido se reparte entre expertos especializados según el paso temporal, lo que amplía la capacidad efectiva del modelo sin incrementar el coste computacional por paso. El modelo se entrenó con un volumen de datos sustancialmente mayor que Wan2.1 (+65,6 % de imágenes y +83,2 % de vídeos), con etiquetado detallado de iluminación, composición, contraste y tono de color.

Es relevante ahora porque combina tres factores poco habituales en vídeo generativo abierto: licencia Apache 2.0, integración oficial en Diffusers y ComfyUI, y disponibilidad de pesos con código de inferencia multi-GPU. La model card declara además mejoras específicas en estabilidad de cámara y soporte de escenas estilizadas respecto a la generación anterior. No obstante, el repositorio concreto analizado no aporta documentación propia, benchmarks ni cifras de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo con arquitectura de mezcla de expertos (MoE); VAE con ratio de compresión 16×16×4 en la variante 5B |
| Parámetros totales | no disponible (la nomenclatura oficial A14B indica 14 000 millones de parámetros activos) |
| Parámetros activos | 14 000 millones (variante A14B, según nomenclatura de la model card) |
| Longitud de contexto | no aplica (modelo de difusión de vídeo; no usa ventana de contexto de tokens) |
| Resolución soportada | 480P y 720P |
| Tipos de cuantización | no disponible (el repositorio publica pesos en safetensors sin documentar variantes cuantizadas) |
| Idiomas soportados | en, zh (idiomas de los prompts) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con integración en Diffusers |
| Pipeline | image-to-video |
| Tamaño del repositorio | 126,2 GB |
| Librería declarada | wan2.2 |
| Descargas / likes | 0 / 0 |
| Fecha de creación del repositorio | 2026-09-21 |

## Arquitectura y entrenamiento

Wan2.2 introduce una arquitectura MoE en modelos de difusión de vídeo. En lugar de emplear una única red para todos los pasos del proceso de eliminación de ruido, el modelo separa el proceso por pasos temporales y asigna expertos especializados a distintos tramos, de modo que la capacidad total del sistema crece mientras el coste computacional por paso se mantiene. La variante I2V-A14B, objeto de este repositorio, está diseñada específicamente para la tarea imagen-a-vídeo y opera a 480P y 720P. En paralelo, la familia publica una variante TI2V-5B, construida sobre un VAE propio con ratio de compresión 16×16×4, que cubre texto-a-vídeo e imagen-a-vídeo a 720P y 24 fps y está pensada para ejecutarse en tarjetas de consumo.

En cuanto a los datos, la model card indica que Wan2.2 se entrenó con un volumen significativamente mayor que Wan2.1: +65,6 % de imágenes y +83,2 % de vídeos. El corpus incorpora datos estéticos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color, lo que habilita generación con estilo cinematográfico más controlable. La model card atribuye a la ampliación del dataset mejoras de generalización en movimiento, semántica y estética. No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO; estos modelos de difusión no suelen emplear ese tipo de ajuste, pero el dato no está confirmado en la documentación disponible.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) a 480P y 720P.
- Generación texto-a-vídeo e imagen-a-vídeo en la variante TI2V-5B, con salida a 720P y 24 fps.
- Control estético de nivel cinematográfico: la model card menciona etiquetado de iluminación, composición, contraste y tono de color para guiar el estilo de salida.
- Síntesis de movimiento más estable, con reducción de movimientos de cámara irreales respecto a generaciones anteriores.
- Soporte de escenas estilizadas diversas (la model card destaca soporte mejorado en escenas con estilo).
- Inferencia multi-GPU documentada para la variante A14B.
- Integración con Diffusers y ComfyUI, además de código de inferencia propio.
- Prompts en inglés y chino.
- No aplica: tool calling, function calling, uso como agente, razonamiento multi-paso, matemáticas o generación de código. Se trata de un modelo generativo de vídeo, no de un modelo de lenguaje.

## Casos de uso

- Vídeo de producto para comercio electrónico: a partir de una fotografía de catálogo se genera un clip con movimiento de cámara contenido, aprovechando la mejora declarada en estabilidad de cámara para evitar desplazamientos irreales que resten credibilidad al producto.
- Publicidad y preproducción: convertir un fotograma clave o un storyboard en un plano animado a 720P para validar ritmo, encuadre e iluminación antes de rodar, apoyándose en las etiquetas estéticas de composición y contraste.
- Recuperación y animación de archivo fotográfico: animar fotografías históricas o familiares para proyectos documentales o museísticos, con control del grado de movimiento para no introducir artefactos que falseen el contenido original.
- Contenido vertical para redes sociales: generar clips cortos a partir de imágenes promocionales, con salida a 480P o 720P según el presupuesto de cómputo y la plataforma de destino.
- Previsualización de efectos visuales: producir planos de referencia con estilo cinematográfico controlado para que equipos de VFX y dirección de arte alineen expectativas antes de la producción final.
- Anonimización y datos sintéticos: generar vídeo sintético a partir de imágenes semilla para aumentar datasets de entrenamiento de modelos de visión por computador, siempre que la licencia y las condiciones de uso lo permitan.
- Ilustración y animación 2D/3D estilizada: dar movimiento a ilustraciones o renders con estética no fotorrealista, uno de los puntos que la model card señala como reforzado en esta versión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la familia Wan2.2 afirma un rendimiento "TOP" entre modelos abiertos y cerrados, pero no acompaña esa afirmación con cifras concretas en el material proporcionado, por lo que no se reproducen valores numéricos.

Los únicos datos cuantitativos declarados, que no constituyen benchmarks de calidad, son los siguientes:

| Dato declarado | Valor |
|---|---|
| Incremento de imágenes en entrenamiento frente a Wan2.1 | +65,6 % |
| Incremento de vídeos en entrenamiento frente a Wan2.1 | +83,2 % |
| Ratio de compresión del VAE (variante 5B) | 16×16×4 |
| Resolución y cadencia de la variante 5B | 720P a 24 fps |

## Requisitos de hardware

- Tamaño del repositorio completo: 126,2 GB, dato relevante para planificar almacenamiento y descarga; buena parte de ese volumen corresponde a los pesos en precisión original.
- VRAM para la variante A14B: no disponible. El repositorio oficial menciona expresamente "multi-GPU inference code of the A14B model", lo que indica que el despliegue previsto no es de una sola GPU.
- Viabilidad en GPU de consumo: por el tamaño del repositorio (126,2 GB), la variante A14B no cabe en GPUs de consumo con 24 GB de VRAM sin cuantización adicional, que no se documenta. La variante TI2V-5B sí está declarada como ejecutable en tarjetas de consumo, citándose la RTX 4090 como ejemplo.
- GPUs recomendadas: no disponible de forma explícita para el A14B. Para el 5B, la model card cita la serie 4090 como objetivo de consumo.
- Opciones de despliegue: repositorio oficial de GitHub con requisitos de PyTorch >= 2.4.0 y `flash_attn`, integración en Diffusers, integración en ComfyUI y pesos también publicados en ModelScope. No aplica vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponible. La única referencia cualitativa es que la variante 5B se presenta como uno de los modelos 720P a 24 fps más rápidos disponibles en el momento de la publicación.

## Comparativa con modelos similares

En la información proporcionada solo hay datos suficientes para comparar entre variantes de la propia familia Wan2.2. No se dispone de especificaciones de modelos de terceros (HunyuanVideo, LTX-Video, CogVideoX u otros) dentro del material consultado.

| Modelo | Tarea | Parámetros activos | Resolución | VAE / nota | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-I2V-A14B (este repositorio, por nomenclatura) | Imagen a vídeo | 14 000 millones (A14B) | 480P y 720P | Arquitectura MoE | HuggingFace, ModelScope, Diffusers, ComfyUI |
| Wan2.2-T2V-A14B | Texto a vídeo | 14 000 millones (A14B) | 480P y 720P | Arquitectura MoE | HuggingFace, ModelScope, Diffusers, ComfyUI |
| Wan2.2-TI2V-5B | Texto a vídeo e imagen a vídeo | 5 000 millones | 720P a 24 fps | VAE con compresión 16×16×4, ejecutable en 4090 | HuggingFace, ModelScope, Diffusers, ComfyUI |
| Wan2.1 | Vídeo generativo (generación previa) | no disponible | no disponible | Base de comparación: Wan2.2 usa +65,6 % de imágenes y +83,2 % de vídeos | Repositorio público en GitHub |

## Limitaciones y advertencias

- El repositorio analizado (`MsMagic/Wan2.2-I2V`) presenta 0 descargas y 0 likes y no incluye model card propia: reproduce la documentación de la familia Wan2.2. Es una publicación de un tercero, no el canal oficial `Wan-AI`, por lo que conviene verificar la integridad de los pesos antes de usarlos en producción y contrastarlos con la fuente oficial.
- No se han publicado benchmarks en la información disponible, de modo que las afirmaciones de rendimiento "TOP" de la model card no pueden validarse con datos numéricos.
- Riesgo de artefactos y alucinación visual: como todo modelo de difusión, puede generar detalles inexistentes, deformaciones anatómicas o incoherencias temporales entre fotogramas, especialmente con movimientos amplios o entradas de baja calidad.
- Sesgos de los datos de entrenamiento: el corpus está sesgado hacia los dominios y estéticas representadas en los datos (el propio autor indica datos estéticos curados), lo que puede infrarrepresentar culturas, tipos corporales, iluminaciones o estilos poco frecuentes.
- Idiomas: los prompts están soportados en inglés y chino; no se documenta soporte de castellano, por lo que la calidad con prompts en español es incierta y probablemente exija traducción previa.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, pero al tratarse de una publicación de terceros conviene confirmar la licencia aplicable en el repositorio oficial antes de un despliegue comercial.
- Coste de despliegue: la variante A14B requiere inferencia multi-GPU según la documentación, lo que descarta su uso directo en estaciones de trabajo con una sola GPU de consumo.
- Sin datos de cuantización documentados: no hay variantes GGUF, AWQ, GPTQ ni similares descritas en la información disponible, lo que limita las opciones de reducción de huella de memoria.
- Fecha de creación del repositorio (2026-09-21) y ausencia de actividad posterior: no hay evidencia de mantenimiento o actualización en la información proporcionada.

## Enlaces

- Repositorio analizado: https://huggingface.co/MsMagic/Wan2.2-I2V
- Organización oficial en HuggingFace: https://huggingface.co/Wan-AI/
- Modelo oficial Wan2.2-I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Modelo oficial Wan2.2-T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Modelo oficial Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Versiones Diffusers: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers | https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers | https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Repositorio de código: https://github.com/Wan-Video/Wan2.2
- Informe técnico: https://arxiv.org/abs/2503.20314
- Sitio del proyecto: https://wan.video
- Blog: https://wan.video/welcome
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Documentación de ComfyUI: https://docs.comfy.org/tutorials/video/wan/wan2_2
- Discord: https://discord.gg/AKNgpMK4Yj
- Grupo de WeChat (imagen QR): https://gw.alicdn.com/imgextra/i2/O1CN01tqjWFi1ByuyehkTSB_!!6000000000015-0-tps-611-1279.jpg
