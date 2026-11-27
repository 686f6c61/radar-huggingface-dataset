# JCMODEL/Moss-Frame

## Resumen

Moss-Frame 1.0 es un checkpoint de generación de imágenes texto-a-imagen publicado por el usuario JCMODEL en Hugging Face, derivado mediante fine-tuning del modelo base OpenMOSS-Team/MOSS-Image-SFT. Se distribuye como un único archivo safetensors de 5,41 GB cuantizado a INT8, diseñado para generar imágenes en tan solo 4 pasos de muestreo, lo que lo sitúa en la categoría de modelos de difusión destilados para inferencia rápida. El checkpoint está pensado para cubrir en un solo modelo un espectro amplio de estilos: fotografía natural, retrato cinematográfico, anime 2D, ilustración fantástica pintada y paisaje de tinta aguada.

El modelo se integra en el ecosistema ComfyUI mediante un flujo de trabajo predefinido que combina tres componentes: el modelo de difusión principal, un codificador de texto Qwen3.5 de 9B parámetros también en INT8 y un VAE derivado de Flux2 (flux2-vae_small). Esta arquitectura de tres piezas es coherente con los pipelines modernos de difusión que separan el encoder de texto del denoising y del decodificador latente.

La relevancia de este checkpoint radica en su enfoque de eficiencia: 4 pasos con CFG 1.0 y sampler Euler reducen drásticamente el coste computacional frente a modelos de difusión tradicionales de 20-50 pasos, y el formato INT8 de 5,41 GB permite su despliegue en GPUs de consumo. No obstante, la información pública disponible es limitada: no se especifican licencia, idiomas soportados ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (basado en MOSS Image); encoder de texto Qwen3.5 9B + VAE Flux2 |
| Parametros totales | no disponible (checkpoint de 5,41 GB en INT8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Moss-Frame 1.0 es un fine-tuning del modelo OpenMOSS-Team/MOSS-Image-SFT, según declara el propio autor en los metadatos del repositorio. La arquitectura subyacente corresponde a un pipeline de difusión texto-a-imagen compuesto por tres módulos: un modelo de difusión principal (distribuido como `moss-frame-v1.0-int8-4step.safetensors`), un codificador de texto Qwen3.5 de 9B parámetros cuantizado a INT8 (`qwen3.5_9b_int8_convrot.safetensors`) y un VAE denominado `flux2-vae_small.safetensors`. El modelo está destilado para generar en 4 pasos, lo que sugiere un proceso de destilación por consistencia o destilación de trayectoria (no confirmado en la información disponible).

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o preferencias humanas. El autor tampoco detalla la innovación técnica concreta más allá de la generación en 4 pasos y la cuantización INT8. El modelo base MOSS-Image-SFT sugiere un ajuste supervisado sobre MOSS-Image, pero no se aportan detalles adicionales.

## Capacidades

- Generación de imágenes texto-a-imagen en 4 pasos de muestreo con CFG 1.0, sampler Euler y scheduler simple.
- Cobertura de múltiples estilos en un único checkpoint: fotografía realista, retrato cinematográfico, anime 2D con line art y cel shading, ilustración pintada con pinceladas visibles, y pintura de tinta aguada sobre papel texturizado.
- Soporte de medios mixtos: el prompt puede especificar qué elementos deben renderizarse como dibujo 2D y cuáles como fotografía realista (por ejemplo, personaje anime sobre fondo fotográfico).
- Control de estilo mediante sufijos de prompt documentados por el autor (por ejemplo, "Rendered as a 2D anime illustration with crisp line art...").
- Integración nativa con ComfyUI mediante flujo de trabajo JSON descargable.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; no aplica a un modelo de difusión texto-a-imagen.
- Capacidades multilingües: no disponible (el encoder Qwen3.5 sugiere soporte multilingüe, pero el autor no lo confirma).

## Casos de uso

- Ilustración de personajes para videojuegos indie: el modelo genera retratos anime 2D con line art nítido y cel shading plano en 4 pasos, lo que permite iterar docenas de variaciones de personaje en minutos sobre una GPU de consumo.
- Generación de arte conceptual para preproducción cinematográfica: los sufijos de prompt de retrato cinematográfico y fotografía realista permiten obtener referencias visuales de iluminación y composición antes de rodar.
- Creación de assets para cómics y novela gráfica: la capacidad de medios mixtos (personaje dibujado sobre fondo fotográfico) facilita composiciones híbridas que antes requerían posprocesado en Photoshop.
- Prototipado rápido de estilos visuales para branding: el modelo cubre fotografía, pintura e ilustración en un solo checkpoint, lo que reduce la necesidad de cargar modelos distintos para explorar direcciones creativas.
- Ilustración editorial y de tinta aguada: el estilo ink-wash documentado permite generar ilustraciones para artículos, portadas o material impreso con textura de papel y bordes suaves.
- Generación de fondos y escenarios para animación: paisajes fotográficos y pintados (juncos a golden hour, puentes de cuerda en niebla) sirven como mate paintings o fondos de escenas.
- Flujos de trabajo automatizados en ComfyUI: al ser un checkpoint INT8 de 5,41 GB con 4 pasos, puede encadenarse en pipelines por lotes para generar datasets sintéticos de imágenes de entrenamiento o aumentar catálogos de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas FID, CLIP score, ni comparaciones cuantitativas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El checkpoint de difusión ocupa 5,41 GB en INT8; sumando el encoder de texto Qwen3.5 9B en INT8 (aproximadamente 9 GB) y el VAE, el pipeline completo requiere del orden de 15-18 GB de VRAM en estimación orientativa, aunque el autor no lo confirma.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del pipeline, se requiere al menos una GPU con 16-24 GB de VRAM (RTX 4090, RTX 3090, A100, H100) para cargar todos los componentes simultáneamente.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) y RTX 3090 (24 GB); en GPUs de 12-16 GB requeriría descarga parcial de módulos o cuantización adicional del encoder de texto, no documentada.
- Opciones de despliegue: ComfyUI es el entorno oficial soportado, con flujo JSON descargable. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a pipelines de difusión de este tipo).
- Latencia y throughput: no disponibles. La generación en 4 pasos con CFG 1.0 reduce el coste frente a modelos de 20-50 pasos, pero el autor no publica tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moss-Frame 1.0 | Difusión texto-a-imagen (fine-tune de MOSS-Image) | 4 | safetensors INT8, 5,41 GB | no disponible | Hugging Face (JCMODEL) |
| OpenMOSS-Team/MOSS-Image-SFT | Difusión texto-a-imagen (base) | no disponible | no disponible | no disponible | Hugging Face (OpenMOSS-Team) |
| Flux.1 (referencia de ecosistema) | Difusión texto-a-imagen | 20-50 (estándar) | safetensors, varios tamaños | no disponible en esta ficha | Hugging Face (Black Forest Labs) |

La comparación cuantitativa con alternativas no está disponible: el autor no publica benchmarks ni métricas que permitan situar Moss-Frame frente a otros modelos de difusión. La comparativa se limita a aspectos estructurales (pasos de muestreo, formato y tamaño del checkpoint).

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no se puede confirmar el uso comercial del checkpoint ni las obligaciones de atribución. Es un riesgo legal relevante para producción.
- Idiomas soportados no documentados: aunque el encoder Qwen3.5 es multilingüe, el autor no confirma el rendimiento en castellano ni en otros idiomas distintos del inglés.
- Datos de entrenamiento no disponibles: se desconoce la composición del dataset, lo que impide evaluar sesgos demográficos, culturales o de estilo.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir anatomías incorrectas, texto ilegible en la imagen, manos deformadas o inconsistencias físicas, especialmente en escenas complejas.
- Fine-tuning de un modelo base con escasa documentación pública: la calidad final depende de MOSS-Image-SFT, cuyas limitaciones hereda y no se detallan.
- Modelo con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de comunidad, validación externa ni reportes de uso en producción.
- Dependencia de un pipeline de tres archivos (difusión, encoder, VAE) con versiones fijadas por commit en el repositorio Comfy-Org/MOSS-Image; cambios en esos repositorios pueden romper la reproducibilidad.
- Cuantización INT8: puede introducir pérdida de fidelidad frente a los pesos originales en precisión completa, no cuantificada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JCMODEL/Moss-Frame
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Flujo de trabajo ComfyUI (JSON): https://huggingface.co/JCMODEL/Moss-Frame/resolve/main/workflows/moss-frame-v1.0-t2i.json
- Checkpoint de difusión: https://huggingface.co/JCMODEL/Moss-Frame/resolve/main/moss-frame-v1.0-int8-4step.safetensors
- Encoder de texto (Comfy-Org/MOSS-Image): https://huggingface.co/Comfy-Org/MOSS-Image/resolve/530a4c94f92c35ef6818b1b035a983fe9dcf5f54/text_encoders/qwen3.5_9b_int8_convrot.safetensors
- VAE (Comfy-Org/MOSS-Image): https://huggingface.co/Comfy-Org/MOSS-Image/resolve/530a4c94f92c35ef6818b1b035a983fe9dcf5f54/vae/flux2-vae_small.safetensors
