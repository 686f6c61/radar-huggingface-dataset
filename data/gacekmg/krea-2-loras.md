# gacekmg/Krea-2-LoRAs

## Resumen

El repositorio `gacekmg/Krea-2-LoRAs` contiene una colección de 18 adaptadores LoRA (Low-Rank Adaptation) diseñados para el modelo de generación de imágenes Krea-2-Turbo, desarrollado por Krea AI. El autor, gacekmg, subió estos LoRAs con la intención de utilizarlos posteriormente en un espacio de Hugging Face, aunque el contenido es explícitamente NSFW (no apto para todas las audiencias). Los adaptadores modifican atributos anatómicos, estilos y ofrecen controles deslizantes (sliders) para ajustar características como vello corporal, tamaño de pecho, tono de piel o forma de genitales, además de un LoRA de reducción de rechazo que altera las salvaguardas del modelo base.

Krea-2-Turbo es un modelo de difusión de imágenes construido desde cero por Krea AI, con una arquitectura basada en Wan 2.1 (según el proyecto Krea2Trainer). Este repositorio es relevante para desarrolladores e investigadores que trabajan con personalización fina de modelos de difusión mediante LoRA, aunque su naturaleza explícita limita su uso a contextos adultos y de investigación técnica. El tamaño total del repositorio es de 3,1 GB, con archivos en formato `.safetensors` y la librería `peft`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Krea-2-Turbo (modelo de difusión basado en Wan 2.1) |
| Parametros totales | no disponible (18 archivos LoRA, peso total 3,1 GB) |
| Parametros activos | no disponible (cada LoRA es un adaptador de bajo rango) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible (archivos `.safetensors` en precisión original) |
| Idiomas soportados | no disponible (los LoRAs no son específicos de idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los LoRAs son adaptadores de bajo rango que se aplican al modelo base Krea-2-Turbo, un modelo de difusión de imágenes desarrollado por Krea AI. Según la documentación oficial de Krea, Krea-2 es su primer modelo fundacional de imágenes, construido desde cero para ofrecer control creativo sobre estilo, composición y estética. El proyecto Krea2Trainer (GitHub) indica que la arquitectura subyacente se basa en Wan 2.1, un modelo de difusión de código abierto. Los LoRAs de este repositorio se entrenaron para modificar aspectos específicos de la generación, como vello corporal, tamaño de pecho, tono de piel o características faciales, así como para reducir el rechazo del modelo ante ciertos prompts. No se dispone de información detallada sobre el proceso de entrenamiento de cada LoRA (datos utilizados, número de épocas, hiperparámetros, etc.).

## Capacidades

- Modificación de atributos anatómicos específicos: vello corporal (axilas, pubis, pecho), genitales (pene, vagina), pechos y pezones.
- Sliders de control continuo: tamaño de pecho, tamaño de areola, tono de piel, presencia de vello púbico, etc.
- Estilos faciales concretos, como el LoRA "Japanese Woman Face 01".
- Reducción de rechazo (refusal-reduction): un LoRA que altera las salvaguardas del modelo base para evitar que se niegue a generar contenido explícito.
- Compatibilidad con el ecosistema Krea 2 y herramientas de entrenamiento como Krea2Trainer, que usa el motor de entrenamiento de ostris/ai-toolkit y el etiquetado automático de Florence-2.

## Casos de uso

- Generación de ilustraciones eróticas o artísticas con control fino de atributos corporales: los sliders permiten ajustar características como tamaño de pecho o vello corporal en tiempo real, lo que resulta útil para artistas digitales que buscan precisión anatómica.
- Personalización de personajes en proyectos de arte digital o cómics para adultos: los LoRAs de estilo facial (ej. mujer japonesa) y de atributos físicos permiten crear personajes consistentes.
- Investigación sobre adaptación de modelos de difusión con LoRA: el repositorio sirve como ejemplo de cómo se pueden entrenar y distribuir adaptadores para un modelo base específico, aunque sin documentación técnica.
- Desarrollo de pipelines de generación de imágenes con control fino: los LoRAs se pueden integrar en flujos de trabajo con ComfyUI o Automatic1111 para ajustar la salida según parámetros numéricos.
- Pruebas de robustez y seguridad en modelos de difusión: el LoRA de reducción de rechazo puede utilizarse para estudiar cómo se comporta el modelo cuando se eliminan sus salvaguardas, aunque con precaución.
- Creación de contenido para plataformas de entretenimiento para adultos: los LoRAs permiten generar imágenes explícitas con un control detallado, siempre que se cumplan las normativas legales y éticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los requisitos dependen del modelo base Krea-2-Turbo. Al ser un modelo de difusión, se estima que se necesita una GPU con al menos 8-12 GB de VRAM para inferencia en FP16 (estimación general, no confirmada por el autor).
- Cada LoRA pesa aproximadamente 170 MB (3,1 GB / 18 archivos), por lo que la carga adicional de memoria es mínima en comparación con el modelo base.
- Para entrenar nuevos LoRAs sobre Krea-2-Turbo, se recomienda una GPU con 24 GB de VRAM o más, según el tamaño del modelo base y la configuración de entrenamiento.
- Herramientas de despliegue compatibles: ComfyUI, Automatic1111, o el propio entorno de Krea si soporta LoRAs. No se menciona soporte para vLLM u Ollama, ya que son modelos de difusión, no de lenguaje.

## Comparativa con modelos similares

| Repositorio | Contenido | Tamaño | Licencia | Observaciones |
|---|---|---|---|---|
| gacekmg/Krea-2-LoRAs | 18 LoRAs NSFW (atributos anatómicos, sliders, reducción de rechazo) | 3,1 GB | no disponible | Sin documentación, 0 descargas |
| ilkerzgi/fal-Krea-2-Style-LoRAs | LoRAs de estilo para Krea 2 | no disponible | no disponible | Enfocado en estilos artísticos, no en contenido explícito |
| LoRAs en Civitai (tag krea2) | 388 modelos, checkpoints y LoRAs | variable | variable | Comunidad activa, con métricas de uso y reseñas |

No se dispone de datos comparativos de rendimiento entre estos repositorios.

## Limitaciones y advertencias

- Contenido explícito NSFW: todos los LoRAs están orientados a la generación de imágenes sexualmente explícitas o con modificaciones anatómicas. No apto para menores ni para entornos profesionales sin políticas de uso adecuadas.
- Licencia no especificada: el repositorio no declara ninguna licencia, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- El LoRA de reducción de rechazo puede eliminar las salvaguardas del modelo base, lo que aumenta el riesgo de generar contenido inapropiado, dañino o ilegal. Su uso debe ser estrictamente controlado.
- No hay documentación sobre el entrenamiento, los datos utilizados ni las métricas de calidad de cada LoRA. La fiabilidad y consistencia de los resultados no está garantizada.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es poco utilizado o reciente. No hay evidencia de pruebas exhaustivas por parte de la comunidad.
- Los enlaces a CivitAI utilizan el dominio `.red`, que puede ser un espejo no oficial; se recomienda verificar la autenticidad de los modelos antes de su uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gacekmg/Krea-2-LoRAs
- Documentación oficial de Krea 2: https://www.krea.ai/docs/user-guide/features/krea-2
- Proyecto Krea2Trainer (GitHub): https://github.com/CaptainGrock/Krea2Trainer
- Tag krea2 en Civitai: https://civitai.com/tag/krea2
