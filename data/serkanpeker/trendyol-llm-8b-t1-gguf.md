# serkanpeker/Trendyol-LLM-8B-T1-GGUF

## Resumen

Trendyol-LLM-8B-T1-GGUF es la versión cuantizada en formato GGUF del modelo Trendyol/Trendyol-LLM-8B-T1, un modelo de lenguaje de aproximadamente 8.190 millones de parámetros desarrollado originalmente por Trendyol y convertido a GGUF por el usuario serkanpeker para su uso con llama.cpp. La particularidad de esta conversión es el uso de una importance matrix (imatrix) calculada específicamente sobre texto de Wikipedia en turco, lo que optimiza la cuantización para preservar la fidelidad del modelo en turco frente al modelo base en BF16.

El modelo resuelve el problema de desplegar un LLM de 8B parámetros en hardware de consumo o entornos sin GPU de gran capacidad, ofreciendo múltiples niveles de cuantización (desde Q8_0 de 8,71 GB hasta IQ3_M de 3,90 GB) con métricas de divergencia KL medidas sobre el corpus paralelo FLORES+ en turco e inglés. Está orientado a generación de texto conversacional y soporta turco (tr/tur) e inglés (en).

Es relevante ahora porque permite ejecutar localmente un modelo afinado para turco con pérdidas de calidad medidas y documentadas, algo poco habitual en cuantizaciones GGUF, donde rara vez se publican métricas de divergencia KL por idioma. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Trendyol/Trendyol-LLM-8B-T1; transformer, inferido del pipeline text-generation) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M (todas con imatrix turca salvo Q8_0) |
| Idiomas soportados | turco (tr, tur), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Trendyol/Trendyol-LLM-8B-T1 (no se especifica si es un transformer denso, MoE o hibrido, ni el numero de tokens de entrenamiento, composicion del dataset o si hubo RLHF/DPO). Lo que si se documenta es el proceso de cuantizacion: los archivos GGUF se generaron con llama.cpp build b12116 (commit 5851a8e) a partir de la revision `1aeda72` del modelo base.

La innovacion tecnica destacable es el uso de una importance matrix calculada sobre 200 fragmentos de 512 tokens de Wikipedia en turco (dataset `wikimedia/wikipedia`, version 20231101.tr). Esta matriz de estadisticas de activacion, que no contiene texto, se emplea para guiar la cuantizacion y reducir la perdida de calidad en turco. El autor documenta que, en Q4_K_M, la matriz turca produjo una mediana de divergencia KL entre un 9% y un 11% inferior a la matriz inglesa en las cuatro muestras de calibracion medidas, aunque la media fue practicamente identica (0,0217 frente a 0,0218). Tambien advierte que en IQ3_M la matriz turca incremento un 43% la divergencia KL en ingles sobre FLORES+ (0,0864 frente a 0,0606). El vocabulario del tokenizer tiene 151.669 tokens (151.643 entradas BPE mas 26 tokens especiales anadidos), y la tabla de embeddings tiene 151.936 filas, con 267 filas extra rellenadas por llama.cpp con tokens `[PADn]`.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Modelo afinado especificamente para turco, con soporte secundario de ingles.
- Ejecutable localmente mediante llama.cpp y compatible con endpoints (tag `endpoints_compatible`).
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling o agentes: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local de un chatbot en turco: el modelo puede ejecutarse con llama-server o llama.cpp en hardware de consumo usando Q4_K_M (5,03 GB), adecuado para asistentes conversacionales en turco sin depender de APIs externas.
- Generacion de texto en aplicaciones de escritorio o moviles: con IQ3_M (3,90 GB) o IQ4_XS (4,56 GB) se puede integrar en entornos con VRAM limitada, aceptando una mayor divergencia KL (0,0965 y 0,0261 en turco respectivamente).
- Procesamiento de documentos y corpus en turco: al estar calibrado con Wikipedia turca, es adecuado para tareas de resumen, reescritura o extraccion sobre texto turco, donde la cuantizacion preserva mejor la distribucion del modelo base.
- Investigacion sobre cuantizacion: los archivos y la imatrix publicada (`imatrix_tr.gguf`) permiten reproducir y comparar el efecto de distintas matrices de calibracion sobre la calidad, con metricas KL documentadas.
- Prototipado rapido en entornos sin GPU dedicada: las versiones Q4_K_M e IQ4_XS caben en GPUs de consumo de 6-8 GB o incluso en CPU con llama.cpp, lo que facilita pruebas de concepto.
- Evaluacion comparativa de modelos turcos: sirve como referencia cuantizada para comparar con alternativas como Turkish-Gemma-9b-T1, mencionada en la model card en el contexto de experimentos de imatrix.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Lo que si se publica son metricas de divergencia KL frente al GGUF en BF16, medidas sobre 2.009 frases paralelas de FLORES+ (dev y devtest) con ventanas de 512 tokens:

| Archivo | Tamano (GB) | KLD vs BF16, turco | KLD vs BF16, ingles | Mismo token top, turco |
|---|---|---|---|---|
| Q8_0.gguf | 8,71 | 0,0011 | 0,0007 | 98,2% |
| Q6_K-tr.gguf | 6,73 | 0,0036 | 0,0024 | 96,7% |
| Q5_K_M-tr.gguf | 5,85 | 0,0063 | 0,0043 | 95,6% |
| Q4_K_M-tr.gguf | 5,03 | 0,0185 | 0,0120 | 92,7% |
| IQ4_XS-tr.gguf | 4,56 | 0,0261 | 0,0163 | 91,8% |
| IQ3_M-tr.gguf | 3,90 | 0,0965 | 0,0864 | 84,1% |
| Q4_K_M sin imatrix (referencia, no subido) | 5,03 | 0,0333 | 0,0211 | 90,3% |

Como referencia, el Q4_K_M con imatrix turca reduce la KLD en turco de 0,0333 (sin imatrix) a 0,0185, es decir, aproximadamente un 44% menos de divergencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo mas overhead. Q8_0 requiere ~9-10 GB; Q6_K ~7-8 GB; Q5_K_M ~6-7 GB; Q4_K_M ~5,5-6 GB; IQ4_XS ~5-5,5 GB; IQ3_M ~4,5-5 GB.
- GPU recomendadas: A100 o H100 para Q8_0 y despliegues de alta concurrencia; RTX 4090 (24 GB) permite Q8_0 con contexto amplio; RTX 3090/4080 (16-24 GB) cubren Q6_K y Q5_K_M con holgura.
- Cabe en GPU de consumo: si. Q4_K_M e IQ4_XS caben en GPUs de 6-8 GB (RTX 3060, RTX 4060, RTX 2070); IQ3_M puede caber en 4-6 GB. Tambien es viable en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc., segun el tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| serkanpeker/Trendyol-LLM-8B-T1-GGUF | 8,19B | no disponible | GGUF (imatrix turca) | Apache-2.0 | Metricas KL por idioma publicadas |
| mradermacher/Trendyol-LLM-8B-T1-GGUF | 8,19B | no disponible | GGUF | Apache-2.0 (heredada) | Cuantizaciones alternativas del mismo base |
| mradermacher/Trendyol-LLM-8B-T1-i1-GGUF | 8,19B | no disponible | GGUF (imatrix) | Apache-2.0 (heredada) | Variante con imatrix del mismo base |
| Trendyol/Trendyol-LLM-8B-T1 (base) | 8,19B | no disponible | safetensors/BF16 | Apache-2.0 | Modelo original sin cuantizar |

No se dispone de datos de rendimiento en tareas para comparar con modelos de otros desarrolladores; la comparativa se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- La divergencia KL mide la distancia respecto al modelo BF16 en texto no usado para calibracion, no la precision en tareas; no es un sustituto de benchmarks.
- FLORES+ podria formar parte de los datos de entrenamiento del modelo base, lo que puede inflar la aparente fidelidad de las metricas.
- En IQ3_M, la imatrix turca incremento un 43% la divergencia KL en ingles respecto a la imatrix inglesa (0,0864 frente a 0,0606), por lo que las cuantizaciones bajas penalizan mas el ingles.
- La calibracion se hizo unicamente con Wikipedia turca; el rendimiento en dominios especializados (legal, medico, tecnico) o en registros coloquiales puede diferir.
- Solo se declaran soportados turco e ingles; otros idiomas no estan garantizados.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada, pero inherentes a los LLM.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Trendyol/Trendyol-LLM-8B-T1.
- El repositorio tiene 34,8 GB y 0 descargas/0 likes en el momento de la consulta, lo que indica poca validacion comunitaria.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/serkanpeker/Trendyol-LLM-8B-T1-GGUF
- Modelo base: https://huggingface.co/Trendyol/Trendyol-LLM-8B-T1
- Dataset de mediciones: https://huggingface.co/datasets/serkanpeker/turkish-tax
- Repositorio con scripts y logs: https://github.com/speker/turkish-tax
- Cuantizacion alternativa (mradermacher): https://huggingface.co/mradermacher/Trendyol-LLM-8B-T1-GGUF
- Cuantizacion alternativa con imatrix (mradermacher): https://huggingface.co/mradermacher/Trendyol-LLM-8B-T1-i1-GGUF
