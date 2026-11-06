# Lykegenes/LFM3-1.7B-MLX-oQ8e-fp16

## Resumen

LFM3-1.7B-MLX-oQ8e-fp16 es una version cuantizada del modelo LFM3 de 1.700 millones de parametros, publicada por el usuario Lykegenes en Hugging Face. Se trata de una conversion realizada con la herramienta oQ (oMLX v0.7.3), que aplica cuantizacion de precision mixta para producir un checkpoint optimizado para el framework MLX de Apple. El resultado es un modelo de 1.728.801.536 parametros almacenado en 1,711 GiB, con una media efectiva de 8,502 bits por peso.

La practica totalidad de los pesos (99,978%) se almacena en formato afín de 8 bits con grupos de 64 elementos, mientras que un residual minimo (0,022%) se conserva en FP16. Esta distribucion busca preservar la calidad del modelo original reduciendo el espacio en disco y la memoria necesaria para inferencia en hardware Apple Silicon, donde MLX aprovecha la memoria unificada.

La relevancia de esta ficha radica en que se trata de un artefacto derivado, no de un modelo original: la model card no documenta arquitectura, datos de entrenamiento, licencia ni capacidades del modelo base. Toda la informacion disponible se limita a los detalles de cuantizacion y al desglose de almacenamiento. El modelo base LFM3 no se describe en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3, sin especificar) |
| Parametros totales | 1.728.801.536 (1,729B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín 8-bit group 64 (99,978% de pesos), FP16 (0,022%); media efectiva 8,502 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX), custom_code |
| Tamano del repositorio | 1,9 GB (1,837 GB / 1,711 GiB de pesos) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base LFM3 en la documentacion proporcionada. La model card del checkpoint cuantizado no describe si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o cualquier otra variante, ni tampoco detalla el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de alineacion como RLHF o DPO.

La unica informacion tecnica disponible corresponde al proceso de cuantizacion. Se utilizo oQ (oMLX v0.7.3), una herramienta de cuantizacion de precision mixta que asigna 8 bits afines con grupos de 64 a la practica totalidad de los tensores y deja un residual en FP16. El checkpoint resultante tiene 1,729B de pesos logicos almacenados en 1,711 GiB, lo que supone una media efectiva de 8,502 bits por peso. El modelo requiere `custom_code` para cargarse, lo que implica que depende de codigo especifico del autor o de la herramienta de cuantizacion.

## Capacidades

- No se documentan capacidades especificas del modelo base en la informacion disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se indica si dispone de modo de razonamiento (thinking), vision, audio u otras modalidades.
- El unico dato funcional verificable es que el checkpoint es cargable mediante la libreria MLX y requiere `custom_code`.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta formateado para MLX y ocupa 1,711 GiB, por lo que puede cargarse en equipos Mac con memoria unificada suficiente para experimentar con el modelo base sin depender de GPUs dedicadas.
- Prototipado rapido en portatiles Mac: al reducir el peso a unos 8,5 bits por parametro, permite iterar sobre prompts y evaluar el comportamiento del modelo LFM3 en un entorno de desarrollo local.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad frente al modelo original en FP16/BF16 y frente a otras cuantizaciones de oQ con distintos bit-widths.
- Despliegue en aplicaciones de escritorio para macOS: al integrarse con MLX, puede embeberse en herramientas nativas de Apple que requieran un modelo de lenguaje de ~1,7B parametros.
- Investigacion sobre precision mixta: el desglose de bits por tensor permite estudiar el impacto de la cuantizacion afín de 8 bits con grupo 64 en tareas concretas.
- Base para futuras reconversiones: al estar en safetensors y con metadatos claros de cuantizacion, puede servir de punto de partida para generar versiones en otros formatos (GGUF, etc.) si se dispone del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,7-1,9 GB para los pesos en 8-bit; el overhead de activaciones y cache KV depende de la longitud de contexto, que no se especifica.
- GPU recomendadas: hardware Apple Silicon con memoria unificada (series M1, M2, M3, M4), ya que el checkpoint usa la libreria MLX. No es compatible de forma nativa con CUDA sin conversion previa.
- Cabe en GPU de consumo: si, en cualquier Mac con al menos 8 GB de memoria unificada, siempre que el contexto utilizado no sea excesivamente largo.
- Opciones de despliegue: MLX (libreria nativa), mlx-lm para generacion; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en el formato actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-oQ8e-fp16 | 1,729B | no disponible | 8-bit afín + FP16 residual | no disponible | safetensors (MLX) |
| Modelo base LFM3-1.7B | 1,7B (aproximado) | no disponible | FP16/BF16 (presumible) | no disponible | no disponible |
| Otras cuantizaciones oQ del mismo modelo | no disponible | no disponible | variable | no disponible | safetensors (MLX) |

No se dispone de informacion suficiente para comparar con alternativas de otros autores (por ejemplo, Llama 3.2 1B, Qwen2.5 1.5B o Gemma 2 2B), ya que no se documentan benchmarks ni caracteristicas del modelo base.

## Limitaciones y advertencias

- La model card no documenta licencia, por lo que no puede confirmarse el uso comercial del checkpoint ni del modelo base.
- No se especifican idiomas soportados; se desconoce si el modelo esta entrenado principalmente en ingles u otros idiomas.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion o limitaciones de contexto.
- El checkpoint depende de `custom_code`, lo que puede complicar la carga en entornos distintos al previsto por el autor.
- Al ser una cuantizacion a 8,5 bits efectivos, es previsible cierta degradacion de calidad respecto al modelo original, aunque no se cuantifica en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.
- La fecha de creacion indicada (2026-11-02) es futura respecto a la mayoria de referencias actuales; conviene verificar la integridad y procedencia del artefacto antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Lykegenes/LFM3-1.7B-MLX-oQ8e-fp16
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
