# espressovi/BODHI-qwen-3-8b-distil

## Resumen

BODHI es un modelo de lenguaje especializado en razonamiento matemático, desarrollado por el usuario espressovi mediante destilación de cadena de pensamiento larga (Long-CoT) a partir del modelo base Qwen/Qwen3-8B-Base. El proyecto BODHI busca crear artefactos de alta capacidad matemática partiendo de modelos abiertos y compactos, en este caso con 8.190 millones de parámetros. El modelo se publica bajo licencia MIT, lo que permite uso comercial sin restricciones, y está orientado exclusivamente al idioma inglés.

La relevancia de este modelo radica en su enfoque específico: en lugar de un modelo generalista, BODHI se entrena para resolver problemas matemáticos complejos mediante razonamiento extendido, similar a las técnicas de destilación empleadas en modelos como DeepSeek-R1. Según la model card, alcanza un 18,82 % de precisión en el benchmark AIME25 con temperatura 1.0, 16K tokens de contexto y pass@8, un resultado notable para un modelo de 8B parámetros. El repositorio incluye pesos en formato safetensors con un tamaño de 39 GB, lo que sugiere una precisión de 16 bits (FP16 o BF16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del base, presumiblemente 32K, no confirmado) |
| Tipos de cuantizacion | No disponible (pesos originales en safetensors, cuantizacion posterior posible) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye a partir de Qwen3-8B-Base, un transformer denso de 8.000 millones de parametros con atencion por ventanas y mecanismos de normalizacion avanzados. El proceso de entrenamiento consiste en una destilacion de cadena de pensamiento larga (Long-CoT), donde se transfieren las capacidades de razonamiento de un modelo profesor (no especificado) a este modelo alumno. El dataset utilizado es `espressovi/BODHI-distillation`, aunque no se detallan el numero de tokens ni la composicion exacta del corpus. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; el entrenamiento se centra exclusivamente en la tarea matematica mediante destilacion supervisada.

## Capacidades

- Razonamiento matematico avanzado: resuelve problemas de nivel competitivo (AIME) con cadenas de pensamiento largas.
- Generacion de texto en ingles: mantiene las capacidades linguisticas del modelo base, aunque su especializacion es matematica.
- Razonamiento paso a paso: produce explicaciones detalladas y justificaciones de los resultados.
- No se ha confirmado soporte para tool calling, function calling, agentes ni capacidades multimodales.
- No se ha confirmado soporte multilingue; la model card indica solo ingles.

## Casos de uso

- Resolucion de problemas matematicos en entornos educativos: el modelo puede actuar como tutor automatico, generando soluciones paso a paso para problemas de algebra, calculo o teoria de numeros, aprovechando su capacidad de razonamiento extendido.
- Generacion de problemas y soluciones para evaluacion: permite crear conjuntos de problemas con soluciones detalladas, utiles para generar datasets de entrenamiento o examenes.
- Asistencia en investigacion matematica: puede ayudar a explorar conjeturas o verificar demostraciones, aunque con las limitaciones propias de un modelo de lenguaje.
- Integracion en pipelines de razonamiento simbolico: combinado con herramientas de calculo formal, puede preprocesar enunciados y proponer estrategias de resolucion.
- Benchmarking de modelos: al ser un modelo destilado, sirve como referencia para estudiar tecnicas de destilacion Long-CoT en modelos de 8B.
- Desarrollo de agentes de razonamiento: aunque no tiene tool calling nativo, puede integrarse en frameworks como LangChain o LlamaIndex para tareas que requieran calculo o logica.

## Benchmarks y rendimiento

Segun la model card, el modelo reporta el siguiente resultado (no se proporcionan mas benchmarks):

| Benchmark | Resultado | Condiciones |
|---|---|---|
| AIME25 | 18,82 % | T=1.0, 16K tokens, pass@8 |

No se han publicado resultados adicionales en la informacion disponible. No se dispone de comparaciones con otros modelos en la misma fuente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,19 B parametros, en FP16 se requieren aproximadamente 16 GB de VRAM; en cuantizacion de 4 bits (por ejemplo, con GPTQ o AWQ) se reduce a unos 5-6 GB.
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente; para cuantizacion 4 bits, una RTX 3060 (12 GB) o superior puede bastar.
- En consumer GPU: si, con cuantizacion es viable en GPUs de gama media-alta (RTX 3080/3090, 4070 Ti, etc.).
- Opciones de despliegue: al ser un modelo de la familia Qwen, es compatible con vLLM, llama.cpp, Ollama, TGI y Transformers de HuggingFace. No se han publicado configuraciones especificas de latencia o throughput.
- Nota: el tamaño del repositorio (39 GB) sugiere pesos en FP16/BF16; para despliegue eficiente se recomienda cuantizar.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros modelos. Como referencia, se puede comparar con su modelo base y con alternativas de destilacion matematica:

| Modelo | Parametros | Contexto | AIME25 | Licencia |
|---|---|---|---|---|
| BODHI-qwen-3-8b-distil | 8,19 B | No disponible | 18,82 % | MIT |
| Qwen3-8B-Base | 8,19 B | 32K (oficial) | No disponible | Apache 2.0 |
| DeepSeek-R1-Distill-Qwen-8B | 8,19 B | 32K | No disponible | MIT |

Los datos de DeepSeek-R1-Distill no se han verificado en esta ficha; se incluyen como referencia orientativa. No se han encontrado resultados publicados de AIME25 para el modelo base.

## Limitaciones y advertencias

- Especializacion limitada: el modelo esta entrenado principalmente para matematicas; su rendimiento en otras tareas (generacion de codigo, comprension lectora general, etc.) puede ser inferior al del modelo base.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos, especialmente en problemas matematicos complejos.
- Idioma: solo se ha confirmado el ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Contexto no confirmado: aunque el base soporta 32K tokens, no se ha verificado que la destilacion mantenga esa longitud; se recomienda probar con secuencias largas.
- Sesgos: al derivar de Qwen3-8B-Base, puede heredar sesgos presentes en los datos de entrenamiento originales, aunque no se han documentado especificamente.
- Produccion: al ser un modelo experimental (75 descargas, sin mantenimiento activo aparente), se recomienda validar exhaustivamente antes de usarlo en entornos criticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/espressovi/BODHI-qwen-3-8b-distil
- Dataset de destilacion: https://huggingface.co/datasets/espressovi/BODHI-distillation
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Otros modelos del autor: https://huggingface.co/espressovi (SUTRA-qwen3-8b-distil, BODHI-qwen-3-maze-8b-distil, BODHI-qwen-3-math-8b-rlvr)
