# Jjausiiwowi/Wan2.2-TI2V-5B

## Resumen

Wan2.2-TI2V-5B es un modelo de difusión para generación de vídeo a partir de texto e imagen (text-image-to-video, TI2V) desarrollado por el equipo Wan (Alibaba). Forma parte de la familia Wan2.2, una actualización de los modelos fundacionales de vídeo Wan2.1, e incorpora una arquitectura de mezcla de expertos (MoE) aplicada a la difusión de vídeo, junto con un VAE de alta compresión con ratio 16×16×4. El modelo genera vídeo a 720p y 24 fps y está diseñado para ejecutarse en una única GPU de consumo como la RTX 4090.

Este repositorio concreto (Jjausiiwowi/Wan2.2-TI2V-5B) es una réplica del checkpoint oficial Wan-AI/Wan2.2-TI2V-5B, publicado con licencia Apache 2.0 y pesos en formato safetensors. El modelo resuelve el problema de la generación de vídeo de alta definición con coste computacional contenido, combinando las modalidades texto-a-vídeo e imagen-a-vídeo en un único checkpoint de 5B parámetros.

Su relevancia radica en que acerca la generación de vídeo 720p@24fps a hardware de consumo, un espacio tradicionalmente dominado por modelos cerrados o por pipelines que requieren múltiples GPU de datacenter. La integración con Diffusers y ComfyUI facilita su adopción en flujos de trabajo existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo con VAE de alta compresión (ratio 16×16×4); la familia Wan2.2 introduce MoE en los modelos A14B/14B |
| Parametros totales | 5B (modelo TI2V) |
| Parametros activos | no disponible (el checkpoint TI2V-5B no se describe como MoE; el MoE aplica a los modelos A14B/14B de la familia) |
| Longitud de contexto | no disponible (modelo de difusión, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Wan2.2-TI2V-5B es un modelo de difusión para vídeo construido sobre un VAE propio de Wan2.2 con un ratio de compresión de 16×16×4, lo que reduce drásticamente el coste computacional del proceso de denoising y permite generar 720p a 24 fps en hardware de consumo. El checkpoint unifica texto-a-vídeo e imagen-a-vídeo en un solo modelo, de modo que acepta tanto una descripción textual como una imagen de referencia como condición inicial. La familia Wan2.2 introduce además una arquitectura MoE que separa el proceso de denoising en el eje temporal con expertos especializados, manteniendo el coste computacional mientras amplía la capacidad total; esta innovación se aplica a los modelos A14B y 14B, no al TI2V-5B descrito aquí.

En cuanto a datos de entrenamiento, la model card indica que Wan2.2 se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que Wan2.1, e incorpora datos estéticos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color para permitir un control más preciso del estilo cinematográfico. No se especifica en la información disponible el número exacto de tokens o clips de vídeo, ni si se emplearon técnicas de RLHF o DPO. La integración con Diffusers y ComfyUI está confirmada en la lista de tareas del proyecto.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) a 720p y 24 fps.
- Generación de vídeo a partir de una imagen de referencia (image-to-video) a 720p y 24 fps.
- Generación híbrida texto-imagen-a-vídeo en un único checkpoint de 5B.
- Control de estética cinematográfica mediante datos etiquetados (iluminación, composición, contraste, tono).
- Generación de movimiento complejo, con mejor generalización en movimiento, semántica y estética respecto a Wan2.1.
- Soporte multilingüe de prompts en inglés y chino.
- Integración con Diffusers y ComfyUI para pipelines de generación.
- Inferencia multi-GPU disponible en el código oficial.

## Casos de uso

- Previsualización de storyboards: el modelo convierte descripciones textuales de escenas en clips de 720p@24fps para validar encuadres y ritmo antes de rodar, gracias a su control de composición e iluminación.
- Animación de imágenes fijas: a partir de una fotografía o ilustración, el modo image-to-video genera movimiento coherente, útil para marketing y redes sociales sin necesidad de rodaje.
- Prototipado de anuncios: agencias pueden generar variantes creativas de vídeo corto con estilos cinematográficos controlados y evaluar opciones con clientes en horas.
- Generación de contenido para videojuegos: creación de cinemáticas de bajo coste y clips de ambiente a partir de concept art, aprovechando la modalidad imagen-a-vídeo.
- Investigación académica en generación de vídeo: el checkpoint de 5B con licencia Apache 2.0 permite experimentar y hacer fine-tuning en un solo equipo, algo inviable con modelos de mayor tamaño.
- Docencia y divulgación: generación de visualizaciones de conceptos abstractos o históricos a partir de texto para materiales educativos.
- Automatización de pipelines de contenido: integración vía Diffusers en flujos que producen clips 720p de forma desatendida en una RTX 4090.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma numérica en la información proporcionada; el modelo está diseñado para ejecutarse en una única GPU de consumo como la RTX 4090 (24 GB de VRAM).
- GPU recomendadas: RTX 4090 para uso en consumo; el código oficial soporta inferencia multi-GPU para los modelos de la familia.
- Cabe en GPU de consumo: sí, según la model card, en una RTX 4090.
- Opciones de despliegue: Diffusers, ComfyUI, repositorio oficial Wan2.2 (GitHub), ModelScope; requiere torch >= 2.4.0.
- Latencia y throughput estimados: no disponible; la model card lo describe como uno de los modelos 720p@24fps más rápidos disponibles, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / fps | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-TI2V-5B | 5B | 720p / 24 fps | T2V + I2V | Apache 2.0 | HuggingFace, ModelScope |
| Wan2.2-T2V-A14B | 14B (MoE) | 480p y 720p | T2V | Apache 2.0 | HuggingFace, ModelScope |
| Wan2.2-I2V-A14B | 14B (MoE) | 480p y 720p | I2V | Apache 2.0 | HuggingFace, ModelScope |
| Wan2.1 | no disponible | no disponible | T2V / I2V | Apache 2.0 | HuggingFace, ModelScope |

Los modelos A14B de la misma familia ofrecen mayor capacidad mediante MoE pero requieren más recursos; el TI2V-5B prioriza eficiencia y despliegue en una sola GPU de consumo. No se dispone de datos de benchmarks para comparar rendimiento numérico con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datos web y estéticos curados, puede heredar sesgos de representación de esos corpus.
- Riesgo de alucinación visual: como modelo generativo, puede producir movimiento, física o detalles inconsistentes con el prompt.
- Idiomas: los prompts están soportados en inglés y chino; el rendimiento en castellano no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento y de las dependencias (torch, Diffusers).
- Repositorio no oficial: este checkpoint es una réplica publicada por un usuario (Jjausiiwowi) del modelo oficial Wan-AI/Wan2.2-TI2V-5B; para producción se recomienda usar el repositorio oficial.
- Sin métricas publicadas: no hay benchmarks ni latencias documentadas en la información disponible, lo que dificulta la planificación de capacidad.
- Requisitos de software: necesita torch >= 2.4.0 y el ecosistema wan2.2/Diffusers; la compatibilidad con versiones futuras no está garantizada.

## Enlaces

- [HuggingFace: Jjausiiwowi/Wan2.2-TI2V-5B](https://huggingface.co/Jjausiiwowi/Wan2.2-TI2V-5B)
- [HuggingFace oficial: Wan-AI/Wan2.2-TI2V-5B](https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B)
- [GitHub: Wan-Video/Wan2.2](https://github.com/Wan-Video/Wan2.2)
- [Informe técnico (arXiv:2503.20314)](https://arxiv.org/abs/2503.20314)
- [Sitio oficial Wan](https://wan.video)
- [Blog de Wan](https://wan.video/welcome)
- [ModelScope: Wan-AI](https://modelscope.cn/organization/Wan-AI)
- [HuggingFace: organización Wan-AI](https://huggingface.co/Wan-AI/)
- [Discord de Wan](https://discord.gg/AKNgpMK4Yj)
