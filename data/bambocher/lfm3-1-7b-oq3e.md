# bambocher/LFM3-1.7B-oQ3e

## Resumen

LFM3-1.7B-oQ3e es una cuantización mixta del modelo LFM3 de 1.700 millones de parámetros, publicada por el usuario bambocher en Hugging Face. El checkpoint emplea la herramienta oQ (oMLX v0.7.3) para aplicar cuantización de precisión mixta sobre los pesos originales, dando como resultado un peso efectivo medio de 3,801 bits por parámetro y un tamaño de repositorio de 0,8 GB. Está formateado específicamente para la librería MLX, el framework de Apple para ejecución de modelos en silicio de la compañía (chips M1, M2, M3, M4).

El modelo base LFM3 procede de Liquid AI, una familia de modelos diseñados con arquitecturas híbridas que combinan capas de atención con capas de estado recurrente. La variante de 1.700 millones de parámetros está pensada para despliegue en dispositivos con recursos limitados. Esta versión concreta no es un modelo entrenado desde cero, sino un artefacto de cuantización: su relevancia radica en que permite ejecutar el modelo base en hardware Apple con un consumo de memoria inferior a 1 GB, lo que lo hace apto para portátiles y equipos de escritorio con GPU integrada.

La información pública disponible es muy escasa: no hay datos sobre licencia, idiomas, pipeline ni resultados de benchmarks. La model card se limita a documentar la distribución de bits de la cuantización y el desglose de almacenamiento, sin describir capacidades, datos de entrenamiento ni evaluación. Cualquier evaluación de rendimiento debe remitirse al modelo original LFM3-1.7B de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base LFM3 de Liquid AI; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 1.728.801.536 (1,729B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: affine 3-bit (75,652% de pesos), affine 4-bit (18,803%), affine 5-bit (5,519%), affine 8-bit (0,004%), BF16 (0,022%); grupo 64; media efectiva 3,801 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors con cuantizacion MLX (custom_code), libreria mlx |
| Tamano del checkpoint | 0,821 GB / 0,765 GiB |
| Fecha de publicacion | 2026-11-14 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base LFM3-1.7B en la documentación proporcionada. La model card de esta versión cuantizada no incluye detalles sobre el tipo de capas (atención, recurrencia, híbridas), el número de capas, la dimensión de los embeddings ni la configuración de cabezas de atención. Tampoco se documentan los datos de entrenamiento: número de tokens, composición del corpus, fases de ajuste (SFT, RLHF, DPO) ni técnicas de alineación.

Lo que sí está documentado es el proceso de cuantización. Se aplicó oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta que asigna distintos anchos de bits a distintos tensores según su sensibilidad. El resultado es una distribución en la que el 75,652% de los pesos lógicos se almacenan en 3 bits (0,533 GiB), el 18,803% en 4 bits (0,170 GiB), el 5,519% en 5 bits (0,061 GiB) y una fracción residual en 8 bits y BF16. Todos los tensores usan agrupación de 64 elementos (group 64), lo que reduce el error de cuantización respecto a grupos más grandes. El checkpoint completo ocupa 0,765 GiB, lo que supone una compresión notable frente a los aproximadamente 3,4 GB que ocuparía el mismo modelo en BF16.

## Capacidades

- Generación de texto: el modelo base LFM3-1.7B es un modelo de lenguaje causal; esta versión conserva las capacidades del original, aunque no se documentan en la model card.
- Razonamiento y matemáticas: no disponible en la información proporcionada.
- Generación de código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución en Apple Silicon: capacidad operativa confirmada por el formato MLX del checkpoint, que permite inferencia nativa en chips M-series.

## Casos de uso

- Inferencia local en portátiles Apple: el checkpoint de 0,765 GiB cabe holgadamente en la memoria unificada de cualquier Mac con chip M1 o superior, lo que permite ejecutar un modelo de 1,7B parámetros sin conexión y con latencia baja en un equipo de consumo.
- Prototipado rápido en macOS: al estar en formato MLX, se integra directamente con `mlx-lm` para experimentar con generación de texto en cuadernos o scripts sin necesidad de GPU dedicada.
- Aplicaciones de escritorio con IA embebida: el tamaño reducido permite incluir el modelo como recurso dentro de una aplicación macOS nativa que requiera generación de texto local y privada.
- Evaluación de técnicas de cuantización: sirve como caso de estudio para comparar la pérdida de calidad de una cuantización mixta a 3,801 bits/peso frente al modelo en BF16, útil para investigadores que estudien compresión de modelos.
- Servicio de generación de texto de baja concurrencia: en un servidor con Apple Silicon (por ejemplo, Mac Studio), puede atender peticiones ligeras de completado o resumen con un consumo de memoria inferior a 1 GB.
- Filtrado y clasificación de texto en el borde: para tareas de etiquetado o moderación que no requieran un modelo grande, el coste de memoria y la velocidad de decodificación en MLX lo hacen viable en dispositivos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB para los pesos en el formato cuantizado, más el overhead de activaciones y caché KV (no cuantificado). En la práctica, se recomienda reservar entre 1,5 y 2,5 GB de memoria unificada para contexto moderado.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) es compatible gracias a MLX. No se documenta soporte para GPU NVIDIA o AMD en este checkpoint.
- Cabe en GPU de consumo: sí, en todos los Mac con chip M-series; el modelo completo ocupa menos de 1 GB en disco y en memoria de pesos.
- Opciones de despliegue: `mlx-lm` (librería nativa para cargar checkpoints MLX), `mlx` como framework de bajo nivel. No se garantiza compatibilidad con llama.cpp, Ollama, vLLM o TGI, ya que el formato es específico de MLX y usa `custom_code`.
- Latencia y throughput estimados: no disponibles; dependerán del chip concreto y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ3e (este) | 1,729B | No disponible | Mixta 3,801 bits/peso | No disponible | MLX safetensors |
| LFM3-1.7B (original) | 1,7B | No disponible | BF16 | No disponible | No disponible |
| Modelos de ~1,5-2B en MLX (p. ej. Qwen2.5-1.5B-Instruct-4bit) | ~1,5B | 32K (tipico en la familia) | 4-bit | Apache 2.0 (tipico) | MLX safetensors |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se limita a parámetros, formato y licencia; para decisiones de producción debe consultarse la documentación del modelo base LFM3 de Liquid AI.

## Limitaciones y advertencias

- La cuantización a 3,801 bits/peso introduce pérdida de precisión respecto al modelo en BF16; el impacto exacto en calidad no está documentado.
- No se especifica la licencia, por lo que no puede confirmarse el uso comercial. Es imprescindible verificar la licencia del modelo base LFM3 antes de cualquier despliegue en producción.
- No se documentan sesgos conocidos, pero al ser un modelo de lenguaje entrenado con corpus web, es probable que herede sesgos del modelo original.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay evaluación publicada que lo cuantifique.
- Limitaciones de contexto e idioma: no disponibles; no se indica la ventana de contexto ni los idiomas soportados.
- El checkpoint usa `custom_code` y la librería MLX, lo que limita su portabilidad a entornos Apple Silicon; no es directamente utilizable en ecosistemas CUDA o ROCm.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha, lo que sugiere que no ha sido validado por la comunidad.
- No se incluye pipeline declarado, por lo que las herramientas de Hugging Face no lo reconocen automáticamente como modelo de generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ3e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Modelo base LFM3 de Liquid AI: no disponible en la información proporcionada
