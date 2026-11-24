# briaai/RMBG-3.0

## Resumen
RMBG-3.0 es un modelo de eliminación de fondo y matting de imagen desarrollado por BRIA AI, publicado en Hugging Face bajo acceso restringido. Se trata de un modelo de segmentación de imagen construido mediante destilación a partir del modelo base briaai/Fibo-2.0-dev, y se distribuye en formato diffusers con pesos safetensors. Con 8.127.342.213 parámetros (aproximadamente 8,1 mil millones), es un modelo considerable para una tarea de segmentación, lo que sugiere que emplea una arquitectura generativa o de difusión adaptada a la predicción de máscaras alfa de alta precisión.

El modelo resuelve el problema de separar el sujeto del fondo en imágenes, incluyendo alpha matting (bordes suaves y semitransparentes como pelo, cristal o tejidos), una tarea más exigente que la simple segmentación binaria. Es relevante porque BRIA ha enfocado su línea RMBG en calidad de producción para flujos de trabajo de diseño, comercio electrónico y edición fotográfica, y esta versión 3.0 introduce un pipeline propio en diffusers (BriaFibo2Pipeline) que facilita su integración.

La ficha se basa en la información disponible en la model card de Hugging Face; no se han publicado en la información proporcionada detalles sobre composición del dataset, número de tokens de entrenamiento ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión/destilación según tags; pipeline BriaFibo2Pipeline en diffusers) |
| Parametros totales | 8.127.342.213 (~8,1 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | bria-fibo (licencia propia de BRIA, marcada como "other"; acceso restringido con aceptación de condiciones) |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento
La información disponible indica que RMBG-3.0 es un modelo de segmentación de imagen construido por destilación a partir de briaai/Fibo-2.0-dev, el modelo base de BRIA. Los tags incluyen "distillation", "fibo", "rmbg" y "diffusers:BriaFibo2Pipeline", lo que apunta a que la inferencia se realiza mediante un pipeline de diffusers específico de la familia Fibo. No se especifican en la información proporcionada el tipo exacto de backbone (transformer, UNet o híbrido), el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (poco habituales en modelos de segmentación).

La innovación destacable, según los metadatos, es el enfoque de destilación desde un modelo base más grande hacia un modelo especializado en eliminación de fondo y alpha matting, junto con la integración nativa en diffusers mediante un pipeline dedicado. No hay datos disponibles sobre resolución de entrada, estrategia de atención o mecanismos de decodificación.

## Capacidades
- Eliminación de fondo de imágenes: genera una máscara alfa que separa el sujeto del fondo.
- Alpha matting e image matting: produce bordes suaves y semitransparentes, adecuados para pelo, cristal, humo o tejidos.
- Segmentación de imagen: tarea declarada en el pipeline (image-segmentation).
- Salida compatible con flujos de composición: la máscara alfa permite recomponer la imagen sobre nuevos fondos.
- Integración con diffusers mediante el pipeline BriaFibo2Pipeline.
- Capacidades multilingües: no aplica; el modelo opera sobre imágenes, con idioma declarado "en" para textos asociados.
- Tool calling, agentes, visión general, audio o modo thinking: no disponible / no aplica según la información proporcionada.

## Casos de uso
- Comercio electrónico: generar imágenes de producto sobre fondo blanco o transparente de forma automatizada, usando la máscara alfa para recortes limpios en catálogos de gran volumen.
- Diseño gráfico y edición fotográfica: extraer sujetos con bordes finos (pelo, ropa) para composiciones publicitarias, aprovechando la capacidad de alpha matting frente a la segmentación binaria.
- Creación de contenido para redes sociales: sustituir fondos de retratos y vídeos fotograma a fotograma en pipelines de posproducción.
- Automatización de flujos de retoque en estudios fotográficos: procesar lotes de imágenes con recortes de alta calidad sin intervención manual.
- Integración en herramientas de software de edición: empaquetar el pipeline BriaFibo2Pipeline de diffusers como servicio de segmentación dentro de aplicaciones de diseño.
- Preprocesado para otros modelos de visión: generar máscaras de sujeto que alimenten tareas posteriores como generación condicionada, inpainting o reemplazo de fondo.
- Publicidad y marketing: adaptar creatividades a distintos formatos y fondos manteniendo la integridad del sujeto recortado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con ~8,1 mil millones de parámetros en precisión completa (fp16/bf16) se estima un consumo en torno a 16-18 GB solo para los pesos, más memoria para activaciones y la imagen de entrada. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponibles en la información; por tamaño, GPUs con 24 GB o más (RTX 4090, A100 40/80 GB, H100) serían las candidatas razonables para fp16, sin confirmación oficial.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en fp16; en GPUs de 8-12 GB requeriría cuantización o técnicas de ahorro de memoria no documentadas.
- Opciones de despliegue: diffusers (pipeline BriaFibo2Pipeline) es la vía documentada; otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican o no están confirmadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| RMBG-3.0 (briaai) | ~8,1 mil M | no aplica | Eliminación de fondo / matting | bria-fibo (restringida) | Gated en HF |
| RMBG-2.0 (briaai) | no disponible en esta ficha | no aplica | Eliminación de fondo | licencia BRIA | Gated en HF |
| RMBG-1.4 (briaai) | no disponible en esta ficha | no aplica | Eliminación de fondo | licencia BRIA (uso no comercial en algunas versiones) | Público en HF |
| Alternativas open source de segmentación (p. ej. BiRefNet, SAM) | variable | no aplica | Segmentación / matting | variable (MIT, Apache, etc.) | Público |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad conocidos.

## Limitaciones y advertencias
- Acceso restringido: el modelo es gated y requiere aceptar las condiciones de BRIA en Hugging Face antes de descargarlo.
- Licencia bria-fibo: es una licencia propia, no open source estándar; es imprescindible revisar los términos para uso comercial, redistribución y despliegue en producción.
- Idioma declarado "en": aunque opera sobre imágenes, la documentación y metadatos están en inglés; no hay evidencia de soporte multilingüe en textos asociados.
- Riesgo de errores en casos difíciles: el matting de bordes complejos (pelo muy fino, transparencias, movimiento) puede degradarse; no hay métricas publicadas que cuantifiquen la calidad.
- Sesgos: no se documentan en la información disponible; como modelo entrenado con datos de imagen, puede heredar sesgos de representación de sujetos, iluminación o tipos de fondo.
- Alucinación: no aplica en el sentido de texto generado, pero puede producir máscaras incorrectas o artefactos en regiones ambiguas.
- Sin datos de benchmarks ni requisitos de hardware oficiales: la planificación de producción debe validarse empíricamente.
- Dependencia de diffusers y del pipeline específico BriaFibo2Pipeline: requiere versiones compatibles de la librería.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/briaai/RMBG-3.0
- Modelo base: https://huggingface.co/briaai/Fibo-2.0-dev
- Paper referenciado (arXiv:2511.06876): https://arxiv.org/abs/2511.06876
- Sitio de BRIA AI: https://bria.ai
- Documentación de diffusers: https://huggingface.co/docs/diffusers
