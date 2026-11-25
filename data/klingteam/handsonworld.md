# KlingTeam/HandsOnWorld

## Resumen

HandsOnWorld es un modelo de generación de vídeo condicionado por imagen (image-to-video) desarrollado por el Kling Team de Kuaishou Technology en colaboración con la Universidad de Tsinghua y la Chinese University of Hong Kong. Su aportación principal es la generación de vídeo egocéntrico (en primera persona) con control desacoplado de la cámara y de las manos: el modelo permite manipular de forma independiente el movimiento de las manos del sujeto y la trayectoria de la cámara, algo que los modelos de image-to-video convencionales no permiten.

Técnicamente se construye como un fine-tuning de la familia Wan de Alibaba, concretamente sobre tres backbones: Wan2.2-I2V-A14B, Wan2.1-I2V-14B-480P y Wan2.2-TI2V-5B. Sobre ellos se añade un adaptador de control inicializado a cero que inyecta mapas de control de manos (renderizados mediante nvdiffrast a partir de parámetros SMPL/VPoser) junto con información de cámara en formato Plücker. El modelo se distribuye en variantes SFT y una variante destilada con la técnica Self-Forcing que reduce la inferencia a 4 pasos.

Es relevante porque aborda un problema poco cubierto: la generación de vídeo en primera persona con control explícito de la interacción manual, útil para robótica, datos sintéticos de manipulación y previsualización de experiencias en realidad virtual. El repositorio ocupa 41,5 GB e incluye pesos en safetensors bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo basado en transformer (backbone Wan); adaptador de control de manos con inicialización a cero |
| Parámetros totales | no disponible (depende del backbone: Wan2.2-I2V-A14B, Wan2.1-I2V-14B, Wan2.2-TI2V-5B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (condicionamiento por prompt de texto; idioma del prompt no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

HandsOnWorld parte de los modelos Wan de generación de vídeo image-to-video y les incorpora un adaptador de control que recibe mapas de manos renderizados de forma diferenciable con nvdiffrast a partir de parámetros corporales SMPL y VPoser, combinados con codificación de cámara en formato Plücker. El objetivo es desacoplar el movimiento de las manos del movimiento de cámara, de modo que el usuario pueda especificar por separado la trayectoria de la cámara y la pose o acción de las manos. El proceso de preparación de recursos genera pesos inicializados con el adaptador de control a cero (`scripts/prepare_resources.py`), lo que permite entrenar el adaptador sin perturbar el comportamiento del backbone al inicio.

Se publican checkpoints de fine-tuning supervisado (SFT) sobre los tres backbones, además de una variante entrenada sobre un subconjunto de 10k ejemplos para Wan2.2-I2V-A14B. Adicionalmente se libera un estudiante destilado con Self-Forcing sobre Wan2.1-I2V-14B que reduce la generación a 4 pasos de inferencia, pensado para despliegue de baja latencia. El número de tokens de entrenamiento, la composición exacta del dataset y los detalles de RLHF/DPO no están disponibles en la información proporcionada.

## Capacidades

- Generación de vídeo image-to-video condicionada por una imagen inicial y un prompt de texto.
- Control desacoplado de cámara y manos: trayectoria de cámara y pose/acción manual especificables de forma independiente.
- Generación de vídeo egocéntrico (primera persona) con interacción manual plausible.
- Inyección de mapas de control de manos a partir de parámetros SMPL/VPoser mediante renderizado diferenciable.
- Condicionamiento de cámara mediante codificación Plücker.
- Variante destilada Self-Forcing con inferencia en 4 pasos.
- Soporte de tres backbones con distintos compromisos de calidad y coste (Wan2.2-I2V-A14B, Wan2.1-I2V-14B-480P, Wan2.2-TI2V-5B).
- No se documentan capacidades de tool calling, agentes, audio ni modos de razonamiento, por tratarse de un modelo generativo de vídeo.

## Casos de uso

- Generación de datos sintéticos para robótica de manipulación: el modelo puede producir secuencias egocéntricas con manos y objetos interactuando bajo trayectorias de cámara controladas, útiles para aumentar datasets de entrenamiento de políticas de manipulación.
- Previsualización de experiencias en primera persona para VR/AR: a partir de una imagen inicial y una trayectoria de cámara definida, se generan clips que permiten validar storyboards inmersivos antes de rodar.
- Prototipado de contenido para publicidad y demostraciones de producto: se especifica la acción de las manos sobre un objeto y el movimiento de cámara para obtener un clip coherente sin rodaje.
- Investigación en generación de vídeo controlable: sirve como baseline reproducible para estudiar el desacoplamiento cámara-manos y comparar con otros métodos de control.
- Simulación de tutoriales y demostraciones de tareas manuales: se generan vídeos de "cómo se hace" con la cámara y las manos controladas para ilustrar pasos concretos.
- Evaluación de modelos de percepción egocéntrica: los clips generados con ground truth de pose de mano y cámara permiten probar sistemas de seguimiento y estimación de pose en condiciones controladas.
- Generación de clips de baja latencia en producción con la variante destilada Self-Forcing de 4 pasos, adecuada para pipelines interactivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 41,5 GB e incluye pesos de backbones de 14B y 5B, lo que en precisión completa exige GPUs de gama alta (A100/H100 de 80 GB) para los backbones de 14B.
- GPU recomendadas: A100 80 GB o H100 para los backbones Wan2.2-I2V-A14B y Wan2.1-I2V-14B; el backbone Wan2.2-TI2V-5B reduce los requisitos y puede ser más viable en GPUs de 24-48 GB.
- Cabe en GPU de consumo: no confirmado en la información disponible; el backbone de 5B es el candidato más plausible, pero no se documentan requisitos de VRAM por cuantización.
- Opciones de despliegue: el repositorio usa un backend DiffSynth modificado (`scripts/setup_backend.py`) y requiere PyTorch 2.6.0 con CUDA 12.4, nvdiffrast v0.4.0 y pytorch3d. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vídeo de este tipo).
- Latencia y throughput: no disponibles; la variante Self-Forcing de 4 pasos está diseñada para reducir el coste de muestreo frente a la variante SFT.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Control de cámara/manos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HandsOnWorld (Wan2.2-I2V-A14B) | ~14B (backbone) | Image-to-video con control de manos | Sí, desacoplado | Apache 2.0 | Hugging Face |
| Wan2.2-I2V-A14B (base) | ~14B | Image-to-video | No específico de manos | Apache 2.0 | Hugging Face |
| Wan2.1-I2V-14B-480P (base) | ~14B | Image-to-video | No específico de manos | Apache 2.0 | Hugging Face |
| Wan2.2-TI2V-5B (base) | ~5B | Texto/imagen a vídeo | No específico de manos | Apache 2.0 | Hugging Face |

Los tres modelos base de la familia Wan son los comparables directos, ya que HandsOnWorld se construye sobre ellos. La diferencia principal es la capa de control de manos y cámara desacoplada que HandsOnWorld añade; los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni comparativas cuantitativas en la información disponible, por lo que el rendimiento relativo frente a otros modelos de vídeo no puede verificarse.
- El modelo depende de la calidad de los mapas de control de manos derivados de SMPL/VPoser; errores en la estimación de pose manual se propagarán a la generación.
- Requiere dependencias geométricas complejas (nvdiffrast, pytorch3d, SMPL, VPoser) cuya instalación y licencias deben gestionarse por separado; SMPL y VPoser tienen sus propias condiciones de uso.
- El condicionamiento por texto se realiza mediante el tokenizador de google/umt5-xxl, pero no se especifican los idiomas soportados en los prompts.
- Riesgo de alucinación visual y de artefactos temporales inherente a los modelos de difusión de vídeo; no se documentan métricas de fidelidad temporal.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las licencias de los backbones Wan subyacentes y de las dependencias (SMPL, VPoser, nvdiffrast, pytorch3d).
- El modelo está orientado a vídeo egocéntrico con manos; su comportamiento fuera de ese dominio no está caracterizado.

## Enlaces

- Hugging Face: https://huggingface.co/KlingTeam/HandsOnWorld
- Página del proyecto: https://shad0wta9.github.io/handsonworld-page/
- Paper (PDF): https://arxiv.org/pdf/2607.02075
- arXiv: https://arxiv.org/abs/2607.02075
- Código: https://github.com/KlingAIResearch/HandsOnWorld
- Backbone Wan2.2-I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Backbone Wan2.1-I2V-14B-480P: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
- Backbone Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Tokenizador UMT5-XXL: https://huggingface.co/google/umt5-xxl
- SMPL: https://smpl.is.tue.mpg.de/
- VPoser (SMPL-X): https://smpl-x.is.tue.mpg.de/download.php
- nvdiffrast: https://github.com/NVlabs/nvdiffrast
- pytorch3d: https://github.com/facebookresearch/pytorch3d
