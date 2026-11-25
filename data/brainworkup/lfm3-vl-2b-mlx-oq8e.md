# brainworkup/LFM3-VL-2B-MLX-oQ8e

## Resumen
LFM3-VL-2B-MLX-oQ8e es una cuantización mixta del modelo multimodal LiquidAI/LFM3-VL-2B, publicada por el usuario brainworkup. El modelo base es un modelo de lenguaje y visión de Liquid AI, con aproximadamente 1.918 millones de parámetros, orientado a tareas que combinan comprensión de imágenes y generación de texto. Esta versión concreta está pensada para ejecutarse en el stack MLX de Apple, lo que la hace relevante para desarrolladores que quieren desplegar un modelo visión-lenguaje en hardware Apple Silicon sin renunciar a una precisión cercana a la de los pesos originales.

La cuantización se ha realizado con la herramienta oQe (oMLX v0.7.3), que aplica precisión mixta: la mayor parte de los pesos (90,107%) se almacenan en affine 8-bit con grupos de 64, mientras que un 9,893% se mantiene en BF16. El resultado es un checkpoint de 2,064 GiB con un promedio efectivo de 9,242 bits por peso, un compromiso que reduce el tamaño respecto al BF16 original manteniendo en BF16 las capas presumiblemente más sensibles.

Al tratarse de una cuantización derivada y no de un modelo original, su interés es fundamentalmente práctico: permite ejecutar un VLM de 2B en entornos MLX con un coste de memoria contenido. La información pública sobre el modelo base (licencia, idiomas, benchmarks) no está disponible en los datos proporcionados, por lo que conviene consultar la ficha de LiquidAI/LFM3-VL-2B antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-VL, visión-lenguaje; familia lfm3_vl) |
| Parametros totales | 1.918.181.888 (1,918B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 8-bit con grupo 64 (90,107% de los pesos) y BF16 (9,893%); promedio efectivo 9,242 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx, custom_code) |

## Arquitectura y entrenamiento
El checkpoint es una cuantización del modelo LiquidAI/LFM3-VL-2B, un modelo de la familia lfm3_vl que combina un componente de lenguaje (1,729B parámetros lógicos) y un componente de visión (0,189B parámetros lógicos). La arquitectura interna detallada del modelo base no se especifica en la información disponible; la etiqueta de la familia y la presencia de un módulo de visión confirman que se trata de un modelo multimodal, pero no se documenta aquí si emplea atención estándar, atención lineal u otra variante propietaria de Liquid AI.

El proceso de cuantización lo realiza oQe (oMLX v0.7.3) con precisión mixta: los pesos del modelo de lenguaje (1,729B) se almacenan en affine 8-bit con grupos de 64, con 8,50 bits/peso efectivos, mientras que el módulo de visión (0,189B) se conserva íntegramente en BF16, con 16,00 bits/peso. No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades
- Generación de texto y comprensión de imágenes, al tratarse de un modelo visión-lenguaje (VL).
- Procesamiento conjunto de entradas visuales y textuales para tareas de descripción, respuesta a preguntas sobre imágenes y similares.
- Ejecución en el stack MLX, orientada a hardware Apple Silicon.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible; no se especifican idiomas soportados.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso
- Descripción automática de imágenes en aplicaciones macOS o iOS: el modelo puede recibir una imagen y generar una descripción textual, ejecutándose localmente vía MLX en equipos Apple Silicon, lo que evita enviar datos a la nube.
- Respuesta a preguntas sobre documentos escaneados: útil para extraer información de capturas, formularios o diagramas en flujos de trabajo de escritorio, con la ventaja de la inferencia local.
- Asistentes de accesibilidad: generación de descripciones de contenido visual para personas con discapacidad visual, integrado en aplicaciones nativas de Apple.
- Moderación y etiquetado de contenido visual: clasificación y descripción de imágenes en pipelines internos que requieren procesamiento local por privacidad.
- Prototipado de investigación en VLMs: al ser una cuantización de 2,064 GiB, permite experimentar con un modelo visión-lenguaje en un portátil Apple sin GPU dedicada.
- Herramientas de productividad con captura de pantalla: análisis de capturas para generar resúmenes o extraer texto estructurado en aplicaciones de escritorio.
- Evaluación de técnicas de cuantización mixta: sirve como referencia para comparar el impacto de oQe frente a otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM/unified memory estimada: al menos 2,064 GiB solo para los pesos; conviene reservar margen adicional para el contexto y los estados de atención, por lo que se recomienda un mínimo de 4 GB de memoria unificada disponible.
- GPU recomendadas: hardware Apple Silicon con soporte MLX (series M1, M2, M3, M4); no aplica a GPU NVIDIA o AMD en este formato.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con 8 GB o más de memoria unificada; el tamaño reducido del checkpoint lo hace viable en portátiles.
- Opciones de despliegue: MLX (librería mlx) y el ecosistema oMLX; no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, dado que el formato es específico de MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-MLX-oQ8e (este) | 1,918B | no disponible | safetensors MLX, 8-bit mixto | no disponible | Cuantización MLX de precisión mixta |
| LiquidAI/LFM3-VL-2B | 1,918B (aprox.) | no disponible | safetensors | no disponible | Modelo base en BF16 |
| Otras cuantizaciones del mismo base | 1,918B | no disponible | variable | no disponible | No se dispone de datos específicos |

No se dispone de información suficiente para comparar con alternativas de otros autores en la misma categoría.

## Limitaciones y advertencias
- Al ser una cuantización de 8-bit mixta, puede haber una degradación leve de calidad respecto al modelo base en BF16, especialmente en tareas que dependen de los pesos cuantizados del módulo de lenguaje.
- El módulo de visión se mantiene en BF16, lo que preserva su precisión, pero el conjunto sigue siendo una aproximación al modelo original.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- La licencia no está especificada en la información disponible; es imprescindible verificar la licencia de LiquidAI/LFM3-VL-2B antes de un uso comercial.
- El formato es específico de MLX: no es directamente portable a otros runtimes sin conversión.
- El autor del checkpoint es un usuario independiente (brainworkup), no Liquid AI; la responsabilidad sobre la calidad de la cuantización recae en el publicador.
- No se documentan limitaciones de contexto ni de idioma; conviene consultar la ficha del modelo base.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/brainworkup/LFM3-VL-2B-MLX-oQ8e
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Herramienta de cuantización oQe (oMLX): https://github.com/jundot/omlx
