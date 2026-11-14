# nexainfra/Nexa-Difusor-Wan2.2-I2V-A14B

## Resumen

Nexa-Difusor-Wan2.2-I2V-A14B es una redistribución del modelo Wan2.2-I2V-A14B, un modelo de difusión de vídeo desarrollado originalmente por el equipo Wan del grupo Alibaba, publicado por el usuario nexainfra en Hugging Face. El modelo resuelve la tarea de generación de vídeo a partir de una imagen (image-to-video, I2V), produciendo secuencias de vídeo coherentes a partir de un fotograma inicial y una descripción textual. Es relevante porque Wan2.2 introduce una arquitectura de mezcla de expertos (MoE) en modelos de difusión de vídeo, lo que permite ampliar la capacidad del modelo sin incrementar proporcionalmente el coste computacional en cada paso de denoising.

El modelo cuenta con 14.288.901.184 parámetros totales (aproximadamente 14,3 mil millones) según los pesos en safetensors, y soporta resoluciones de 480P y 720P. Está distribuido bajo licencia Apache 2.0 y es compatible con la librería diffusers mediante la clase `WanImageToVideoPipeline`. Soporta los idiomas inglés y chino en las indicaciones textuales.

Se trata de una republicación comunitaria: el repositorio original es Wan-AI/Wan2.2-I2V-A14B y este ID (nexainfra/Nexa-Difusor-Wan2.2-I2V-A14B) replica sus pesos con formato diffusers. El tamaño del repositorio es de 126,2 GB, lo que refleja la inclusión de múltiples componentes (VAE, text encoder, expertos del MoE) en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo con arquitectura Mixture-of-Experts (MoE) sobre transformer; pipeline `WanImageToVideoPipeline` |
| Parametros totales | 14.288.901.184 (aprox. 14,3 B) |
| Parametros activos | no disponible (la model card indica separación de expertos por timesteps sin especificar el número de parámetros activos por paso) |
| Longitud de contexto | no disponible (modelo de difusión, no aplica ventana de contexto textual; resolución soportada: 480P y 720P) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors en precisión completa; no se documentan variantes GGUF/FP8 en la información disponible) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato diffusers) |

## Arquitectura y entrenamiento

Wan2.2-I2V-A14B emplea una arquitectura de difusión de vídeo basada en transformer con una innovación central: la incorporación de una arquitectura Mixture-of-Experts (MoE) al proceso de difusión. El proceso de denoising se separa por timesteps, asignando expertos especializados a distintas fases del proceso, lo que amplía la capacidad total del modelo manteniendo el mismo coste computacional por paso. El modelo está diseñado específicamente para image-to-video, con soporte para 480P y 720P, y según la model card ofrece una síntesis de vídeo más estable con movimientos de cámara menos irreales y mejor soporte para escenas estilizadas diversas.

En cuanto a los datos de entrenamiento, la model card indica que Wan2.2 se entrenó con un volumen significativamente mayor que Wan2.1: un 65,6 % más de imágenes y un 83,2 % más de vídeos. Además, se incorporaron datos estéticos cuidadosamente curados con etiquetas detalladas de iluminación, composición, contraste y tono de color, lo que permite un control más preciso del estilo cinematográfico. No se especifica en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de difusión). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video): produce secuencias de vídeo coherentes a partir de un fotograma inicial y una indicación textual.
- Soporte de resoluciones 480P y 720P.
- Generación de movimiento complejo: entrenado con más datos de vídeo para mejorar la generalización en movimiento, semántica y estética.
- Estética cinematográfica controlable: datos etiquetados con iluminación, composición, contraste y tono de color permiten un estilo visual ajustable.
- Soporte multilingüe en las indicaciones: inglés (en) y chino (zh).
- Estabilidad de cámara mejorada: la model card destaca movimientos de cámara menos irreales que en versiones anteriores.
- Soporte para escenas estilizadas diversas.
- Integración con diffusers (`WanImageToVideoPipeline`) y ComfyUI.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de difusión de vídeo).
- No se documentan capacidades de audio, visión general ni modo de pensamiento (thinking mode).

## Casos de uso

- Previsualización de animáticas en producción audiovisual: a partir de un fotograma clave o storyboard, el modelo genera un clip de vídeo que permite evaluar el movimiento y la composición antes de rodar, gracias al soporte de 480P/720P y a la estética cinematográfica controlable.
- Creación de contenido para redes sociales: generación de vídeos cortos a partir de una imagen promocional o fotografía de producto, con control de iluminación y tono de color para mantener la coherencia de marca.
- Animación de fotografías en aplicaciones de consumo: convertir una imagen estática en un clip animado en apps móviles o web, usando la integración con diffusers para desplegar el pipeline en servidores con GPU.
- Prototipado rápido en estudios de diseño y publicidad: iterar sobre conceptos visuales generando variantes de vídeo a partir de una misma imagen base con distintas indicaciones textuales en inglés o chino.
- Generación de material para videojuegos y entornos virtuales: producir secuencias de vídeo de referencia o texturas animadas a partir de capturas o renders estáticos, aprovechando la estabilidad de cámara mejorada.
- Investigación en generación de vídeo: servir como base para experimentos académicos sobre MoE en difusión, evaluación de coherencia temporal o control estético, al estar disponible bajo Apache 2.0 y en formato diffusers.
- Localización de contenido para mercados anglófonos y chinos: generar variantes de vídeo con indicaciones en inglés o chino para campañas dirigidas a ambos mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona de forma cualitativa un rendimiento "TOP entre todos los modelos open-source y closed-source", pero no proporciona cifras numéricas (FVD, CLIP score, VBench u otras métricas) que puedan tabularse sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 14,3 B parámetros en precisión completa (fp16/bf16), los pesos del transformer requieren del orden de 28 GB solo para el modelo principal, a lo que hay que sumar el VAE, el text encoder y los buffers de activación para vídeo (que escalan con resolución y número de fotogramas). El tamaño del repositorio (126,2 GB) incluye todos los componentes en precisión completa.
- GPU recomendadas: no se especifican en la información disponible para este modelo I2V-A14B. La model card menciona que el modelo TI2V-5B (5B parámetros) puede ejecutarse en tarjetas de consumo como la RTX 4090; para el I2V-A14B, por su mayor tamaño, se recomienda hardware de gama alta (A100, H100 o GPUs con suficiente VRAM), aunque este dato no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No confirmado para el I2V-A14B. La model card solo afirma que el TI2V-5B cabe en una RTX 4090. Para el A14B no se indica.
- Opciones de despliegue: diffusers (`WanImageToVideoPipeline`), ComfyUI, y el repositorio oficial Wan2.2 (GitHub) con código de inferencia multi-GPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican o no están documentados para este modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto/duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nexa-Difusor-Wan2.2-I2V-A14B (este) | 14,3 B (MoE) | 480P y 720P | no disponible | Apache 2.0 | Hugging Face (republicación) |
| Wan-AI/Wan2.2-I2V-A14B | 14,3 B (MoE) | 480P y 720P | no disponible | Apache 2.0 | Hugging Face y ModelScope (original) |
| Wan-AI/Wan2.2-TI2V-5B | 5 B | 720P | no disponible | Apache 2.0 | Hugging Face y ModelScope |
| Wan-AI/Wan2.2-T2V-A14B | 14,3 B (MoE) | 480P y 720P | no disponible | Apache 2.0 | Hugging Face y ModelScope |

La comparativa se limita a la familia Wan2.2 porque la información proporcionada no incluye datos de otros modelos de image-to-video (por ejemplo, de otros laboratorios) que permitan una comparación rigurosa sin inventar cifras. Este repositorio es funcionalmente idéntico al Wan-AI/Wan2.2-I2V-A14B original, salvo por el empaquetado y el mantenedor.

## Limitaciones y advertencias

- Es una republicación comunitaria (nexainfra) de un modelo original de Wan-AI; conviene verificar la integridad de los pesos y preferir el repositorio oficial para producción.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o movimientos físicamente imposibles, aunque la model card afirma mejoras en estabilidad de cámara.
- Sesgos: los datos de entrenamiento pueden introducir sesgos en la representación de personas, culturas y escenarios; la información disponible no detalla análisis de sesgo.
- Idiomas: solo se documentan inglés y chino para las indicaciones textuales; otros idiomas pueden degradar la calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo original y de los componentes incluidos (VAE, text encoder) por si tuvieran licencias distintas.
- Requisitos de hardware elevados: 14,3 B parámetros y un repositorio de 126,2 GB implican un coste de almacenamiento e inferencia considerable; no se confirma que quepa en GPUs de consumo.
- Ausencia de benchmarks publicados en la información disponible: no es posible validar cuantitativamente el rendimiento frente a alternativas.
- Fecha de creación del repositorio (2026-11-14) y ausencia de descargas/likes: repositorio sin tracción ni validación comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/nexainfra/Nexa-Difusor-Wan2.2-I2V-A14B
- Hugging Face (modelo original I2V-A14B): https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Hugging Face (versión diffusers del original): https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Hugging Face (organización Wan-AI): https://huggingface.co/Wan-AI/
- ModelScope: https://modelscope.cn/models/Wan-AI/Wan2.2-I2V-A14B
- GitHub: https://github.com/Wan-Video/Wan2.2
- Informe técnico (arXiv): https://arxiv.org/abs/2503.20314
- Blog: https://wan.video/welcome
- Sitio web: https://wan.video
- Documentación ComfyUI (EN): https://docs.comfy.org/tutorials/video/wan/wan2_2
- Documentación ComfyUI (CN): https://docs.comfy.org/zh-CN/tutorials/video/wan/wan2_2
- Discord: https://discord.gg/AKNgpMK4Yj
