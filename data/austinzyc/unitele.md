# AustinZYC/UniTele

## Resumen

UniTele es un adaptador LoRA de superresolución orientado a la restauración de imágenes tomadas con el teleobjetivo de teléfonos móviles. Lo desarrolla un equipo de investigación encabezado por Yuchen Zhang y publicado en el preprint arXiv 2610.39617, bajo el título "UniTele: Learning Device-Conditioned Degradations for Unified Smartphone Telephoto Super-Resolution". No es un modelo completo, sino un conjunto de pesos de adaptación (450,2 MiB en safetensors) que se aplica sobre el DiT del modelo base Qwen-Image-Edit-2511.

El problema que aborda es la degradación específica que introduce el zoom óptico de los smartphones: pérdida de detalle fino, artefactos de interpolación y ruido dependiente del sensor y del pipeline de imagen del fabricante. UniTele modela esas degradaciones condicionadas por dispositivo (Huawei, iPhone 17 Pro Max y vivo X300 Ultra) y entrena el adaptador para revertirlas de forma unificada, en lugar de entrenar un modelo separado por teléfono.

Es relevante ahora porque demuestra que un adaptador ligero sobre un modelo de edición de imagen generativo de gran escala puede especializarse en una tarea de restauración fotográfica concreta con un coste de almacenamiento mínimo, manteniendo la licencia Apache-2.0 del adaptador y reutilizando la infraestructura de inferencia del backbone Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre el DiT de Qwen-Image-Edit-2511 (modelo de difusión para edición de imagen) |
| Parámetros totales | no disponible (el adaptador pesa 450,2 MiB en safetensors; el backbone no se incluye) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica: tarea de imagen a imagen) |
| Licencia | Apache-2.0 para el adaptador; el modelo base Qwen-Image-Edit-2511 conserva su propia licencia |
| Formato de pesos | safetensors (`unitele.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se inyecta como LoRA en el transformer de difusión (DiT) de Qwen-Image-Edit-2511, un modelo de edición de imagen basado en difusión. UniTele no modifica la arquitectura del backbone: añade matrices de bajo rango entrenadas para la tarea de superresolución de teleobjetivo, de modo que el modelo base conserva sus capacidades generales de edición y el adaptador aporta la especialización en restauración.

El entrenamiento combinó capturas reales alineadas de tres teléfonos (Huawei, iPhone 17 Pro Max y vivo X300 Ultra) con pares sintéticos generados a partir de 500 imágenes digitales externas adicionales. La innovación central del trabajo es el modelado de degradaciones condicionadas por dispositivo, que permite un único adaptador que cubre varios pipelines de cámara en lugar de uno por fabricante. El ejemplo de inferencia del autor usa 40 pasos de difusión, CFG scale 4,0, semilla 123 y un lienzo de salida de 1024x768 o 768x1024 según la orientación de la entrada. No se detallan en la información disponible el número de tokens de entrenamiento ni el uso de RLHF o DPO (no aplicables de forma estándar en este tipo de modelo).

## Capacidades

- Superresolución de imágenes de teleobjetivo de smartphone, con restauración de detalle fino y reducción de artefactos de zoom.
- Restauración condicionada por dispositivo: admite los valores `huawei`, `iphone` y `vivo` para adaptar el procesado al pipeline de cámara correspondiente.
- Procesamiento orientación-consciente: genera lienzos de 1024x768 o 768x1024 según la orientación de la foto de entrada.
- Integración en pipelines de imagen a imagen mediante DiffSynth-Studio, con ejemplo de inferencia incluido (`infer.py`).
- Ejecución en GPU CUDA y en entornos Ascend con stack PyTorch NPU (`--device npu`).
- Carga del adaptador desde Hugging Face o desde una ruta local (`--lora-path`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesado de texto, audio o vídeo.

## Casos de uso

- Restauración de fotos de teleobjetivo en aplicaciones de galería móvil: el adaptador se aplicaría sobre capturas con zoom de Huawei, iPhone o vivo para recuperar detalle perdido, seleccionando el perfil de dispositivo adecuado en cada caso.
- Mejora de imágenes en flujos de postproducción fotográfica: integrado en un pipeline de edición por lotes, permite procesar series de fotos tomadas con el mismo teléfono y aplicar el mismo perfil de degradación de forma consistente.
- Preprocesado para visión por computador: restaurar recortes de teleobjetivo antes de tareas de detección, OCR o reconocimiento de objetos en imágenes de vigilancia o documentación a distancia.
- Investigación en restauración de imagen: sirve como referencia reproducible para estudiar degradaciones condicionadas por dispositivo y comparar con otros métodos de SR generativa.
- Prototipado de funciones de cámara: los fabricantes o desarrolladores de apps pueden evaluar la mejora perceptual de un adaptador ligero antes de invertir en un modelo dedicado.
- Digitalización de documentos y señalética fotografiados a distancia: la restauración de detalle fino puede facilitar la legibilidad de texto en capturas con zoom.
- Despliegue en entornos con aceleradores Ascend: el soporte de `--device npu` permite ejecutar la inferencia en infraestructura NPU además de GPU convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una evaluación en un benchmark controlado de capturas con tres teléfonos, pero no incluye cifras (PSNR, SSIM, LPIPS u otras) en los datos proporcionados.

## Requisitos de hardware

- El adaptador en sí ocupa 450,2 MiB, pero la inferencia requiere cargar el backbone completo Qwen-Image-Edit-2511, que no se incluye en el repositorio (0,5 GB en total).
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del backbone Qwen-Image-Edit-2511 y de la resolución de salida (1024x768 o 768x1024).
- GPU recomendadas: no disponibles de forma explícita; el ejemplo usa `--device cuda` y el autor indica que se necesita una máquina con memoria suficiente para el backbone.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: DiffSynth-Studio (usado en el ejemplo `infer.py`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de difusión.
- Latencia y throughput: no disponibles; el ejemplo de referencia usa 40 pasos de difusión con CFG scale 4,0.
- Soporte adicional de aceleradores Ascend mediante `--device npu` con el stack PyTorch NPU correspondiente.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniTele (este) | LoRA sobre DiT de Qwen-Image-Edit-2511 | Adaptador de 450,2 MiB; backbone no incluido | no aplica | Apache-2.0 (adaptador) | Hugging Face, 0 descargas |
| Qwen-Image-Edit-2511 | Modelo base de edición de imagen | no disponible | no aplica | Licencia propia de Qwen | Hugging Face |
| Otros métodos de SR de teleobjetivo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio contiene únicamente el adaptador: no incluye el backbone Qwen, los generadores de degradación ni las imágenes del benchmark, por lo que no es autosuficiente para reproducir el estudio.
- Al ser un sistema de SR generativo, puede alterar o inventar texturas ambiguas; la nitidez aparente no debe tomarse como prueba de que el detalle coincide con la escena fotografiada, tal como advierte el propio autor.
- El adaptador está entrenado específicamente para tres dispositivos (Huawei, iPhone 17 Pro Max y vivo X300 Ultra); su comportamiento en otros teléfonos o cámaras no está documentado.
- Riesgo de alucinación visual en regiones de textura ambigua o de bajo contraste.
- No se documentan sesgos demográficos, culturales o de otro tipo, ni evaluaciones de robustez fuera del benchmark controlado.
- La licencia Apache-2.0 se aplica solo al adaptador; el uso comercial está condicionado por la licencia del modelo base Qwen-Image-Edit-2511, que debe revisarse por separado.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se especifican requisitos mínimos de VRAM ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/AustinZYC/UniTele
- Paper (arXiv): https://arxiv.org/abs/2610.39617
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511 (sección de licencia)
