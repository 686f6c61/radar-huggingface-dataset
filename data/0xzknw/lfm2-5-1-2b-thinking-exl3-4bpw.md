# 0xzknw/LFM2.5-1.2B-Thinking-EXL3-4bpw

## Resumen

LFM2.5-1.2B-Thinking-EXL3-4bpw es una cuantización EXL3 a 4 bits por peso del modelo LiquidAI/LFM2.5-1.2B-Thinking, publicada por el usuario 0xzknw. El checkpoint se ha creado con MLXL3 y está diseñado para ejecutarse en Apple Silicon mediante Metal, aprovechando la biblioteca MLX. El objetivo de esta conversión es reducir la huella de memoria del modelo original manteniendo una degradación mínima de la calidad, medida como un aumento del 2,44 % en la perplejidad de WikiText-2 frente a los pesos en BF16.

El modelo base pertenece a la familia LFM2 de Liquid AI y se presenta como un modelo generativo de texto para tareas conversacionales. Según los datos del safetensors cuantizado, el checkpoint contiene 394.040.064 parámetros, a pesar de que el nombre comercial indica 1.2B. La cuantización conserva el tokenizer, la plantilla de chat y la configuración de generación originales, así como los embeddings atados, las normas y los núcleos de convolución en FP16. La licencia es lfm1.0. No se han publicado datos sobre longitud de contexto ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 394.040.064 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3, 4 bits por peso (4bpw) |
| Idiomas soportados | no disponibles |
| Licencia | lfm1.0 |
| Formato de pesos | safetensors, EXL3 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LiquidAI/LFM2.5-1.2B-Thinking, ni los datos de entrenamiento o el proceso de optimizacion. La conversion publicada por 0xzknw se describe como una cuantizacion EXL3 con codebook MCG: 92 de 92 proyecciones lineales fueron convertidas a EXL3 K=4, mientras que los embeddings atados, las normas y los nucleos de convolution se mantienen en FP16. La calibracion se realizo con 2.048 filas de activacion y secuencias de 1.024 tokens, usando Metal LDLQ con buffers de 128 filas, feedback de 16 filas, sigma 0.025 y sin QAT. Se conservan el tokenizer, la plantilla de chat y la configuracion de generacion originales.

## Capacidades

- Generacion de texto conversacional: el modelo esta destinado a tareas de texto generativo y aparece etiquetado como "conversational".
- Modo "Thinking": el nombre del checkpoint sugiere que el modelo base tiene capacidades de razonamiento o reflexion, pero no se proporcionan datos concretos al respecto en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponible.
- No se han publicado benchmarks de razonamiento, matematicas o codigo.

## Casos de uso

- Aplicaciones de chat local en Apple Silicon: al estar optimizado para Metal con MLXL3, permite ejecutar un asistente conversacional sin conexion en equipos Mac con memoria unificada suficiente.
- Prototipado rapido de asistentes: el checkpoint ocupa 0.8 GB, lo que facilita iterar en aplicaciones de generacion de texto en entornos de desarrollo con recursos limitados.
- Investigacion sobre cuantizacion: permite analizar el impacto de EXL3 a 4 bpw en la perplejidad de un modelo pequeno, comparando con los pesos en BF16.
- Aprendizaje de despliegue local con MLXL3: sirve como ejemplo practico del flujo de descarga, registro y ejecucion de modelos cuantizados en Apple Silicon.
- Entornos con requisitos de privacidad: la inferencia local evita enviar datos a servicios externos, lo que resulta util para aplicaciones sensibles.
- Experimentacion academica: el modelo puede emplearse en cursos o practicas sobre tecnicas de compresion de redes neuronales y evaluacion de perplejidad tras cuantizacion.
- Validacion de pequenas tareas de texto: para usos donde no se especifique la longitud de contexto, puede probarse con entradas breves antes de decidir su viabilidad.

## Benchmarks y rendimiento

Se ha publicado un unico resultado en la model card, basado en WikiText-2:

| Metrica | BF16 | EXL3 4bpw | Variacion |
|---|---|---|---|
| Perplejidad WikiText-2 (test, 2.048 tokens en ventanas de 256) | 265.253 | 271.717 | +2.44 % |

La propia model card advierte que esta pequena evaluacion sobre texto sin formato no es un benchmark general de calidad de razonamiento. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros referentes habituales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint ocupa 0.8 GB, por lo que se estima que cabe en Macs con al menos 8 GB de memoria unificada, pero no se dispone de una cifra oficial.
- GPU recomendada: Apple Silicon (M1, M2, M3, M4) con Metal, dado que la ejecucion se realiza a traves de MLXL3.
- No se ha confirmado el soporte en vLLM, llama.cpp, Ollama o TGI. La unica via de ejecucion documentada en la informacion disponible es MLXL3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se compara con el modelo base BF16 y con otra cuantizacion del mismo autor, LFM2.5-1.2B-Thinking-Heretic. Los datos de esta ultima no aparecen en la informacion proporcionada.

| Modelo | Parametros | Formato | Perplejidad WikiText-2 | Tamano del repo |
|---|---|---|---|---|
| LiquidAI/LFM2.5-1.2B-Thinking (BF16) | no disponible | safetensors/FP16 | 265.253 | no disponible |
| 0xzknw/LFM2.5-1.2B-Thinking-EXL3-4bpw | 394.040.064 | EXL3 4 bpw | 271.717 | 0.8 GB |
| 0xzknw/LFM2.5-1.2B-Thinking-Heretic | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El proceso de cuantizacion introduce una degradacion medible: la perplejidad de WikiText-2 aumenta un 2,44 % respecto a los pesos en BF16. Este dato no debe interpretarse como una medida de la calidad de razonamiento.
- No se han publicado benchmarks de razonamiento, matematicas, codigo o habilidades multilingues, por lo que las capacidades reales fuera de la generacion de texto no estan verificadas.
- La licencia es lfm1.0. Los terminos concretos para uso comercial deben revisarse en el archivo LICENSE original, ya que la informacion disponible no los detalla.
- La longitud de contexto y los idiomas soportados no se especifican, lo que obliga a realizar pruebas propias antes de desplegar el modelo en produccion.
- No se dispone de datos sobre sesgos, alucinacion o comportamiento adverso. Se requiere una evaluacion adicional para determinar su idoneidad en escenarios criticos.
- El modelo esta pensado para ejecutarse con MLXL3 en Apple Silicon. No se ha confirmado compatibilidad con otros motores de inferencia habituales.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/0xzknw/LFM2.5-1.2B-Thinking-EXL3-4bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Otro modelo similar del autor: https://huggingface.co/0xzknw/LFM2.5-1.2B-Thinking-Heretic
- Repositorio MLXL3: https://github.com/0xZKnw/mlxl3
