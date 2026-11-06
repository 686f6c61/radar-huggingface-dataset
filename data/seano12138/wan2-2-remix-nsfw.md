# SeanO12138/wan2.2-Remix-NSFW

## Resumen

Wan2.2-Remix NSFW es un ajuste fino (fine-tune) de la familia de modelos de difusión Wan de Alibaba, orientado a la generación de vídeo a partir de texto (T2V) y de imagen (I2V) con contenido para adultos. Lo publica el usuario SeanO12138 como espejo (mirror) del trabajo original de FX_FeiHou, distribuido originalmente en Civitai. El repositorio no entrena un modelo desde cero: parte de los pesos Wan2.1-T2V-14B, Wan2.1-I2V-14B, Wan2.2-T2V-A14B y Wan2.2-I2V-A14B y los remezcla en un pipeline de dos etapas (high noise / low noise).

El paquete contiene cuatro safetensors en fp8 de 14,29 GB cada uno: dos para T2V (versión 2.0) y dos para I2V (versión 2.1), siempre emparejados por nivel de ruido. No incluye el codificador de texto ni el VAE, que deben descargarse por separado (UMT5-XXL en fp8 y el VAE de Wan 2.1). La relevancia de esta ficha es acotada: se trata de un artefacto de archivo, sin soporte, sin benchmarks y con 0 descargas en el momento de la consulta, útil únicamente para quien quiera reproducir el flujo de ComfyUI documentado por el autor.

La licencia es "other", heredada del modelo base Wan, y el propio autor advierte de que hay que verificar la licencia upstream antes de redistribuir o usar comercialmente. El contenido es explícitamente para adultos y restringido a jurisdicciones donde sea legal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión (modelo de vídeo Wan 2.1/2.2), pipeline de dos etapas high/low noise |
| Parámetros totales | 14B por etapa (arquitectura Wan 14B); no se especifica el total agregado |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de generación de 81 frames a 16 fps (720x1280) |
| Tipos de cuantización | fp8 (e4m3fn en I2V; fp8 en T2V), según nombres de fichero |
| Idiomas soportados | no disponible (el prompt se procesa vía UMT5-XXL; el autor no documenta idiomas) |
| Licencia | other (heredada de Wan; verificar upstream) |
| Formato de pesos | safetensors (4 ficheros de 14,29 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de difusión de vídeo de Wan, un transformer de difusión sobre latentes de vídeo con un VAE espacio-temporal (wan_2.1_vae). El pipeline es de dos etapas: un modelo "high noise" que genera la estructura global durante los primeros pasos y un modelo "low noise" que refina el detalle en los pasos finales, ambos obligatoriamente emparejados. Los cuatro ficheros están en fp8, lo que reduce el peso a 14,29 GB por etapa frente a los ~28 GB de un checkpoint 14B en bf16.

No hay información sobre el dataset de entrenamiento, el número de tokens, ni si se usó RLHF/DPO (no aplica a difusión en este contexto). El autor solo indica que es un "remix" de los pesos Wan y remite al workflow oficial de T2V para el muestreo: 12 pasos totales, cfg 1, sampler euler + simple, `ModelSamplingSD3` con shift 5, high noise de 0 a 10 y low noise de 10 a 10000 sin añadir ruido, a 720x1280, 81 frames y 16 fps.

## Capacidades

- Generación de vídeo texto-a-vídeo (T2V) con los pesos v2.0.
- Generación de vídeo imagen-a-vídeo (I2V) con los pesos v2.1.
- Muestreo en dos etapas high/low noise para equilibrio entre composición y detalle.
- Resolución de salida documentada de 720x1280 y 81 frames a 16 fps.
- Contenido para adultos (NSFW) como rasgo principal del ajuste.
- No se documenta tool calling, agentes, razonamiento multi-paso ni capacidades de audio.
- Capacidades multilingües: no documentadas; dependen del codificador UMT5-XXL externo.

## Casos de uso

- Archivo y preservación: mantener una copia de los pesos remezclados ante la posible retirada del modelo original en Civitai o Hugging Face; el propio autor lo define como mirror de archivo.
- Reproducción de investigación en difusión de vídeo: comparar el comportamiento de un fine-tune NSFW frente al Wan 2.1/2.2 base en tareas de T2V e I2V bajo el mismo workflow de ComfyUI.
- Prototipado de pipelines de dos etapas: usar el par high/low noise para experimentar con estrategias de muestreo (pasos, shift, cfg) y medir su efecto en la coherencia temporal.
- Generación de vídeo imagen-a-vídeo para animación de storyboards: a partir de una imagen fija, producir clips de 81 frames a 16 fps con el modelo I2V v2.1.
- Evaluación de cuantización fp8: estudiar la pérdida de calidad frente a los checkpoints bf16 del modelo base en un caso de uso real de vídeo.
- Pruebas de contenido sensible en entornos controlados: investigación sobre filtrado, moderación y detección de contenido NSFW generado por difusión, siempre en un marco legal y con acceso restringido a mayores de 18 años.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: cada etapa fp8 ocupa 14,29 GB en disco; en inferencia hay que cargar high y low noise, más el codificador UMT5-XXL fp8 y el VAE, por lo que se necesita del orden de 30-40 GB de VRAM para el pipeline completo (estimación a partir de los tamaños de fichero, no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB, H100, RTX 6000 Ada; en consumer, RTX 4090 (24 GB) queda justa y probablemente requiera offloading a CPU o ejecución secuencial de etapas.
- No cabe con holgura en GPUs consumer de 16 GB o menos sin cuantización adicional u offloading agresivo.
- Opciones de despliegue: ComfyUI (workflow oficial de Wan 2.2), con `ModelSamplingSD3`; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI (no aplican a difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.2-Remix NSFW (este) | 14B por etapa, fp8 | 81 frames, 720x1280, 16 fps | other | Hugging Face (mirror), 0 descargas |
| Wan-AI/Wan2.1-T2V-14B | 14B | vídeo T2V | licencia Wan (verificar) | Hugging Face oficial |
| Wan-AI/Wan2.2-T2V-A14B | 14B (A14B) | vídeo T2V | licencia Wan (verificar) | Hugging Face oficial |
| Wan-AI/Wan2.1-I2V-14B | 14B | vídeo I2V | licencia Wan (verificar) | Hugging Face oficial |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícitamente NSFW: uso restringido a mayores de 18 años y a jurisdicciones donde sea legal.
- Licencia "other" heredada de Wan; el autor no aclara términos de uso comercial y recomienda verificar la licencia upstream antes de redistribuir.
- Es un mirror sin garantía ni soporte; no hay mantenimiento ni correcciones previstas.
- No incluye codificador de texto ni VAE: requiere descargar `NSFW-API/NSFW-Wan-UMT5-XXL` y `Comfy-Org/Wan-2.2` (VAE) por separado, lo que añade dependencias externas no auditadas.
- Los cuatro ficheros deben usarse emparejados (high + low noise); usar uno solo rompe el pipeline de dos etapas.
- Sin benchmarks, sin evaluación de calidad y con 0 descargas: no hay evidencia pública de robustez ni de calidad frente al modelo base.
- Riesgo de sesgos y de alucinación visual (artefactos, incoherencias temporales) no evaluado por el autor.
- Posible retirada del repositorio por políticas de contenido; conviene verificar la disponibilidad antes de integrarlo en cualquier flujo.

## Enlaces

- Hugging Face: https://huggingface.co/SeanO12138/wan2.2-Remix-NSFW
- Upstream en Hugging Face: https://huggingface.co/FX-FeiHou/wan2.2-Remix
- Publicación original en Civitai: https://civitai.com/models/2003153
- Codificador de texto requerido: https://huggingface.co/NSFW-API/NSFW-Wan-UMT5-XXL
- VAE requerido: https://huggingface.co/Comfy-Org/Wan-2.2
- Modelo base T2V: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Modelo base I2V: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B
- Modelo base Wan 2.2 T2V: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Modelo base Wan 2.2 I2V: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
