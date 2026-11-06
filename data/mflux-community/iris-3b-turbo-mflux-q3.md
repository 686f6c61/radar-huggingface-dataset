# mflux-community/iris-3b-turbo-mflux-q3

## Resumen

Iris-3B-Turbo · MFlux Q3 es una conversión cuantizada a 3 bits del modelo de generación de imágenes speridlabs/iris-3b, empaquetada en formato MLX para su ejecución nativa en Apple Silicon. No se trata de un modelo original, sino de una redistribución comunitaria realizada por MFlux-Community con la herramienta MFlux 0.24.0, que adapta los pesos originales (encoder de texto, transformer y VAE) a cuantización afín de 3 bits sobre el framework MLX de Apple.

El modelo resuelve un problema muy concreto: permitir la inferencia local de un modelo text-to-image de 3.000 millones de parámetros en equipos Mac con memoria unificada limitada, reduciendo el peso del repositorio a 4,3 GB frente a los 14 GB de la versión BF16. La licencia Apache 2.0 del modelo base se mantiene sin cambios, lo que facilita su uso comercial y su integración en flujos de trabajo locales.

Es relevante para desarrolladores que trabajan en entornos macOS y quieren experimentar con generación de imágenes sin depender de servicios en la nube ni de GPUs dedicadas. Al estar basado en el pipeline text-to-image de iris-3b, hereda las capacidades del modelo original, aunque la cuantización agresiva a 3 bits puede introducir degradación en la calidad de salida respecto a las variantes de mayor precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base text-to-image; pesos convertidos a MLX) |
| Parametros totales | 3.000 millones (según nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q3 (cuantización afín MLX de 3 bits); existen variantes BF16, Q8, Q6, Q5 y Q4 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (librería mflux) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base iris-3b más allá de su naturaleza text-to-image y su tamaño de 3.000 millones de parámetros. La model card indica que la conversión aplica cuantización afín MLX de 3 bits de forma uniforme sobre tres componentes: el encoder de texto, el transformer y el VAE. El nivel de cuantización queda almacenado en los propios pesos, por lo que no es necesario pasar el flag `--quantize` en tiempo de inferencia.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original utilizó RLHF, DPO u otras técnicas de alineación. La conversión se realizó con MFlux 0.24.0 el 30 de octubre de 2026 y los pesos originales solo fueron modificados mediante conversión a MLX y cuantización, sin reentrenamiento.

## Capacidades

- Generación de imágenes a partir de prompts textuales (pipeline text-to-image).
- Ejecución local nativa en Apple Silicon mediante MLX, sin necesidad de GPU dedicada.
- Control de resolución de salida (el ejemplo de la model card usa 1024x1024).
- Reproducibilidad mediante semilla explícita (`--seed`).
- Descarga automática de pesos desde Hugging Face en el primer uso, o uso de copia local.
- Compatibilidad con el ecosistema MFlux (`mflux-generate-iris`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento, al tratarse de un modelo de generación de imágenes.

## Casos de uso

- Prototipado rápido de imágenes en Mac: un desarrollador puede generar ilustraciones de prueba en un MacBook con memoria unificada limitada gracias a los 4,3 GB del repositorio, sin depender de servicios cloud.
- Generación de assets para interfaces: producir imágenes de relleno o placeholders en 1024x1024 para maquetas de aplicaciones, con control de semilla para reproducir resultados.
- Exploración artística local: iterar sobre prompts con distintas semillas en un entorno offline, útil cuando la privacidad del prompt es relevante.
- Integración en scripts de automatización: el comando `mflux-generate-iris` permite encadenar generaciones por lotes desde la terminal o desde pipelines de CI para pruebas visuales.
- Evaluación comparativa de cuantizaciones: al existir variantes BF16, Q8, Q6, Q5, Q4 y Q3, sirve para medir el impacto de la cuantización en la calidad de imagen dentro de un mismo equipo.
- Docencia y experimentación con MLX: adecuado para talleres sobre inferencia local en Apple Silicon, ya que el modelo cabe en equipos de consumo y la instalación se reduce a `uv tool install mflux`.
- Generación de contenido para blogs o documentación técnica: imágenes ilustrativas rápidas sin salir del entorno de desarrollo en macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 4,3 GB de pesos en disco; la memoria unificada necesaria en ejecución es superior y no está cuantificada en la información disponible.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y posteriores) con memoria unificada suficiente para cargar el modelo y el VAE.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, ya que el formato es MLX y está pensado para Apple Silicon.
- Cabe en equipos de consumo Apple: sí, en principio, dado el tamaño reducido de la cuantización Q3, aunque el requisito exacto de memoria unificada no está documentado.
- Opciones de despliegue: MFlux (comando `mflux-generate-iris`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de imagen en formato MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Licencia | Plataforma |
|---|---|---|---|---|---|
| iris-3b-turbo-mflux-q3 (este) | 3.000 M | MLX safetensors Q3 | 4,3 GB | Apache 2.0 | Apple Silicon |
| iris-3b-turbo-mflux-bf16 | 3.000 M | MLX safetensors BF16 | 14,0 GB | Apache 2.0 | Apple Silicon |
| iris-3b-turbo-mflux-q4 | 3.000 M | MLX safetensors Q4 | 5,1 GB | Apache 2.0 | Apple Silicon |
| speridlabs/iris-3b (base) | 3.000 M | No disponible | No disponible | Apache 2.0 | No disponible |

La comparación más directa es con las otras cuantizaciones de la misma familia MFlux, que ofrecen un equilibrio distinto entre tamaño y fidelidad. No se dispone de datos de benchmarks para comparar el rendimiento cualitativo entre ellas.

## Limitaciones y advertencias

- La cuantización a 3 bits es la más agresiva de la familia y puede degradar la calidad de imagen respecto a BF16, Q8 o Q4; no se han publicado evaluaciones cuantitativas de esta pérdida.
- Es una conversión comunitaria, no una versión oficial de speridlabs; los autores originales no la han validado.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a otros backends sin reconversión.
- No se documentan idiomas soportados para los prompts, ni sesgos conocidos del modelo base.
- Riesgo de alucinación visual y de resultados inconsistentes con prompts ambiguos, inherente a los modelos text-to-image.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la model card original para restricciones adicionales del modelo base.
- El repositorio tiene muy poca tracción (17 descargas, 0 likes) y fue creado recientemente, por lo que no hay validación comunitaria extensa.
- No se especifican requisitos exactos de memoria unificada para la inferencia, lo que obliga a probar empíricamente en cada equipo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q3
- Modelo base: https://huggingface.co/speridlabs/iris-3b
- Variante BF16: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q8
- Variante Q6: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q6
- Variante Q5: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q5
- Variante Q4: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q4
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
