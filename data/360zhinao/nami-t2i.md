# 360ZhiNao/NAMI-T2I

## Resumen

NAMI (NAMI-T2I) es un modelo de generación de imágenes a partir de texto desarrollado por 360ZhiNao (360CVGroup). Se presenta como una propuesta de generación de imágenes eficiente basada en "Bridged Progressive Rectified Flow Transformers", una variante de los modelos de flujo rectificado que busca reducir el coste computacional del muestreo manteniendo la calidad visual. El trabajo fue aceptado en CVPR 2026 y se distribuye con licencia MIT, lo que facilita su uso comercial y su integración en productos.

El repositorio de Hugging Face publica los pesos en formato safetensors compatibles con la librería diffusers, con un tamaño aproximado de 8,6 GB, lo que sugiere un modelo de escala media (en torno a los 2B parámetros según la nomenclatura "NAMI-2B" empleada por el autor en el registro de cambios). El modelo está pensado para el pipeline text-to-image y declara soporte únicamente para inglés.

Su relevancia actual radica en la combinación de una arquitectura de flujo rectificado con un esquema de "puente" progresivo que promete trayectorias de muestreo más cortas, y en una licencia permisiva que lo hace atractivo para despliegues comerciales frente a alternativas con licencias más restrictivas. La información pública disponible es limitada: no se detallan composición del dataset, número de tokens de entrenamiento ni resultados de benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bridged Progressive Rectified Flow Transformer (difusión/flujo rectificado basado en transformer) |
| Parametros totales | no disponible (la nomenclatura del autor sugiere ~2B, "NAMI-2B") |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image, sin contexto de texto extenso declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

NAMI se basa en un transformer de flujo rectificado (rectified flow) con un esquema de "puente" progresivo ("bridged progressive") que, según el título del paper, busca acelerar y abaratar la generación de imágenes. Los modelos de flujo rectificado aprenden trayectorias más rectas entre ruido y datos que la difusión clásica, lo que permite reducir el número de pasos de muestreo; el componente "bridged progressive" es la innovación propia del trabajo para mejorar la eficiencia del proceso. No se dispone de detalles publicados en la model card sobre el número de capas, dimensión oculta o mecanismo de atención exacto.

En cuanto al texto, el modelo utiliza dos codificadores: un tokenizador y codificador de texto mclip (cuyos pesos se toman de HunyuanDiT) y un tokenizador y codificador mt5 (pesos de google/mt5-xxl). Esta doble codificación es habitual en modelos text-to-image que combinan un encoder de CLIP con un encoder multilingüe tipo T5. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o fine-tuning por preferencias.

## Capacidades

- Generación de imágenes a partir de descripciones textuales en inglés (pipeline text-to-image).
- Integración nativa con la librería diffusers, lo que permite cargar el modelo mediante la API estándar de pipelines.
- Muestreo eficiente gracias al esquema de flujo rectificado progresivo, orientado a reducir pasos de inferencia.
- Codificación de texto dual (mclip + mt5) para mejorar la fidelidad semántica del prompt.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; es un modelo exclusivamente generativo de imágenes.

## Casos de uso

- Generación de ilustraciones para marketing y contenido editorial: el modelo produce imágenes a partir de prompts en inglés, adecuado para equipos que necesiten generar variaciones visuales de forma automatizada con licencia MIT.
- Creación de assets para videojuegos y prototipado conceptual: artistas y diseñadores pueden iterar rápidamente sobre conceptos visuales antes de la producción final, aprovechando el muestreo eficiente para reducir tiempos de iteración.
- Generación de imágenes para e-commerce: creación de fondos, mockups de producto o escenas de estilo de vida a partir de descripciones textuales, con la ventaja de una licencia permisiva para uso comercial.
- Automatización de contenido para redes sociales y blogs: pipelines que generen imágenes de acompañamiento a artículos o publicaciones, integrables vía diffusers en servicios backend.
- Investigación en modelos generativos: el código y los pesos están disponibles para estudiar el esquema de flujo rectificado puenteado y compararlo con difusión estándar, dado que el paper fue aceptado en CVPR 2026.
- Prototipado de interfaces y herramientas creativas: desarrolladores pueden incorporar el modelo en aplicaciones de diseño asistido por IA sin restricciones de licencia comercial, al ser MIT.
- Fine-tuning sobre dominios específicos: al publicarse pesos en safetensors y código de inferencia, es viable adaptar el modelo a estilos o dominios concretos (moda, arquitectura, ilustración infantil) mediante ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con un repo de 8,6 GB en safetensors y una escala sugerida de ~2B parámetros, se estima un consumo en torno a 8-12 GB en precisión fp16, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar GPUs de gama alta consumer (RTX 3090/4090) o profesionales (A100, H100), pero no hay datos oficiales.
- ¿Cabe en GPU consumer? Probablemente sí en GPUs con 12-16 GB o más, pero no confirmado por el autor.
- Opciones de despliegue: la librería declarada es diffusers, por lo que el despliegue estándar sería mediante pipelines de diffusers; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo text-to-image de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NAMI-T2I | ~2B (según nomenclatura del autor; no confirmado) | no disponible | MIT | Pesos en HF + código en GitHub | Flujo rectificado puenteado, CVPR 2026 |
| HunyuanDiT | no disponible en la información | no disponible | no disponible en la información | Pesos en HF | Fuente de los pesos del encoder mclip usados por NAMI |
| SDXL / FLUX (referencia genérica) | no disponible en la información | no disponible | no disponible en la información | no disponible en la información | Alternativas habituales de text-to-image, sin datos comparativos oficiales en esta ficha |

No se dispone de datos de benchmarks ni de comparativas oficiales publicadas en la información proporcionada que permitan una comparación cuantitativa rigurosa con alternativas.

## Limitaciones y advertencias

- Solo soporta inglés: los prompts en otros idiomas, incluido el castellano, no están declarados como soportados y pueden degradar la calidad.
- No se han publicado datos sobre sesgos del dataset de entrenamiento; es esperable que el modelo reproduzca sesgos demográficos y culturales presentes en los datos, pero no hay documentación al respecto.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes incoherentes, anatomías incorrectas o texto ilegible dentro de la imagen.
- Información técnica incompleta: la model card no detalla dataset, número de pasos de entrenamiento, composición ni evaluación; esto dificulta la reproducibilidad y la evaluación de riesgos.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las licencias de los pesos de terceros referenciados (mclip de HunyuanDiT y mt5-xxl de Google), que pueden tener condiciones propias.
- Dependencia de pesos externos: el pipeline requiere descargar los encoders de texto desde repositorios de terceros (Tencent-Hunyuan y google), lo que añade pasos de configuración y posibles incompatibilidades.
- Repositorio con muy poca actividad (0 descargas, 1 like en el momento de la consulta): menor validación comunitaria y soporte limitado.
- No dispone de capacidades de agente, tool calling ni razonamiento multi-paso; su uso está acotado a generación de imágenes.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/NAMI-T2I
- GitHub: https://github.com/360CVGroup/NAMI-T2I
- Paper (arXiv): https://arxiv.org/abs/2503.09242
- Pesos del encoder de texto mclip (HunyuanDiT): https://huggingface.co/Tencent-Hunyuan/HunyuanDiT/tree/main/t2i/clip_text_encoder
- Pesos del encoder de texto mt5: https://huggingface.co/google/mt5-xxl/tree/main
