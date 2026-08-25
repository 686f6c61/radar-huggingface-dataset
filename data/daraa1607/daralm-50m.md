# daraa1607/daralm-50m

## Resumen

DaraLM-50M es un modelo de lenguaje decoder-only de tipo Transformer (estilo GPT), desarrollado desde cero por daraa1607 como parte del proyecto educativo DaraLM. El objetivo del proyecto es cubrir el ciclo de vida completo de un modelo de lenguaje: tokenización, entrenamiento, evaluación y publicación. Está entrenado exclusivamente para modelado de lenguaje causal sobre texto de Wikipedia en jemer (km) e inglés (en), con una arquitectura propia implementada en PyTorch que no es compatible con la librería `transformers` de Hugging Face. No es un modelo apto para producción ni para uso comercial; se trata de un artefacto de aprendizaje para entender el pipeline de entrenamiento de LLMs a escala pequeña.

Con 33,4 millones de parámetros y una ventana de contexto de 1024 tokens, el modelo es extremadamente ligero y puede ejecutarse en hardware de consumo. Su relevancia reside en su carácter didáctico: documenta paso a paso los errores y decisiones de diseño, y sirve como referencia para quien quiera construir un LLM desde cero sin depender de frameworks de alto nivel. La versión de base aquí descrita no sigue instrucciones; para eso existe una variante fine-tuned llamada `daralm-50m-instruct`, también publicada en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (GPT-style) con RMSNorm, RoPE, feed-forward GELU y weight tying |
| Parametros totales | 33,366,528 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp32, sin cuantizacion publicada) |
| Idiomas soportados | km (jmeso), en (ingles) |
| Licencia | CC BY-SA 4.0 (modelo), MIT (codigo) |
| Formato de pesos | `pytorch_model.pt` (checkpoint de inferencia, no safetensors) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer decoder-only clasica, implementada manualmente sin usar `AutoModelForCausalLM`. Usa pre-normalizacion con RMSNorm, atencion multi-cabeza causal con posiciones rotatorias (RoPE), feed-forward con activacion GELU y comparte pesos entre la capa de embedding y la cabeza de salida. El tokenizador es un SentencePiece Unigram con vocabulario de 16.000 tokens, entrenado sobre el mismo corpus.

El entrenamiento se realizo sobre un corpus bilingue de 2.990 documentos de Wikipedia (1.500 en jmeso y 1.500 en ingles), lo que equivale a 37,9 millones de caracteres y 5,4 millones de palabras. Se usaron 2.691 documentos de entrenamiento, 149 de validacion y 150 de test. El modelo se entreno durante 300 pasos con un batch efectivo de 16 (4 micro-batches × 4 acumulaciones), viendo en total unos 4,9 millones de tokens. La optimizacion se hizo con AdamW (lr 3e-4, decaimiento 0.1) en precision bf16 sobre Apple Silicon (MPS). No se aplico ningun tipo de RLHF, DPO ni instrucciones.

## Capacidades

- Generacion de texto: el modelo puede continuar un texto a partir de un prompt, pero la generacion es fragmentaria y gramaticalmente incompleta en ambos idiomas (jmeso e ingles) debido al bajo numero de pasos de entrenamiento.
- Modelado de lenguaje causal: entrenado unicamente para predecir el siguiente token, sin capacidad de seguir instrucciones ni responder preguntas de forma fiable.
- Multilingue basico: maneja dos idiomas, aunque con riesgo de cambio de idioma a mitad de generacion (drift linguistico).
- Sin tool calling: no soporta funciones ni agentes.
- Sin vision ni audio: solo texto.

## Casos de uso

- **Aprendizaje del pipeline de LLM**: el modelo y su repositorio GitHub son un recurso educativo para entender como se entrena un transformer desde cero, incluyendo la tokenizacion, la configuracion de entrenamiento y la evaluacion.
- **Experimentacion en arquitecturas**: permite probar variaciones de hiperparametros (capas, cabezas, tamaño de FFN) sin coste computacional significativo, ya que es un modelo de 33M parametros.
- **Estudio de comportamiento de modelos pequenos**: util para analizar fenomenos como la fragmentacion gramatical, la mezcla de idiomas o la memorizacion en escalas reducidas.
- **Desarrollo de tecnicas de evaluacion**: se puede usar para practicar metricas de perplejidad, perdida de validacion o deteccion de memorizacion.
- **Prueba de infraestructura de inferencia**: dado su tamano, es util para probar pipelines de carga de modelos, servidores de inferencia o herramientas de cuantizacion en un entorno de bajo riesgo.
- **Generacion de textos creativos de baja calidad**: aunque no es fiable, puede producir fragmentos aleatorios que sirvan como inspiracion o para pruebas de sistemas de generacion no criticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo solo reporta la perdida de validacion final y la perplejidad:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 6.35 |
| Perplejidad | 573.6 |

No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- **VRAM estimada**: con 33,4 millones de parametros, el modelo en bf16 ocupa aproximadamente 67 MB (33,4M × 2 bytes). En fp32 serian unos 134 MB. Cabe en cualquier GPU, incluso en CPU con memoria RAM normal.
- **GPU recomendadas**: cualquier GPU moderna (RTX 2060 o superior) es suficiente. No se requieren GPUs de datacenter como A100 o H100.
- **Compatibilidad**: es un modelo custom, no compatible con `transformers`; se necesita el codigo del repositorio GitHub para cargarlo. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no se han publicado mediciones. Dado el tamaño, la inferencia en CPU deberia ser de pocos milisegundos por token, y en GPU casi instantanea.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de la misma escala y caracteristicas (entrenados desde cero en dos idiomas con fines educativos). Modelos como GPT-2 small (124M) o TinyStories (33M) son de tamano similar pero con entrenamiento mucho mas extenso y datos de mayor calidad. No se incluye una tabla comparativa por falta de datos fiables.

## Limitaciones y advertencias

- **No fluido**: la generacion es fragmentaria y gramaticalmente incorrecta en ambos idiomas, como se espera de un modelo de este tamano con pocos pasos de entrenamiento.
- **Corpus muy pequeno**: solo ~3.000 documentos de Wikipedia, lo que limita enormemente el conocimiento factual y la cobertura del idioma.
- **Deriva de idioma**: un prompt en ingles puede cambiar a jmeso a mitad de generacion y viceversa.
- **Sin instrucciones**: no sigue instrucciones ni responde preguntas; es un modelo de base.
- **Sin ajuste de seguridad**: no se ha realizado RLHF, filtrado de contenido ni red-teaming. Los outputs no deben presentarse como autoritativos.
- **Licencia**: el modelo se distribuye bajo CC BY-SA 4.0, lo que implica que los usos derivados deben compartirse bajo la misma licencia. El codigo es MIT, pero el modelo tiene restricciones de atribucion.
- **No apto para produccion**: no debe usarse en aplicaciones medicas, legales, financieras o de seguridad critica.

## Enlaces

- Modelo en Hugging Face: [daraa1607/daralm-50m](https://huggingface.co/daraa1607/daralm-50m)
- Repositorio de codigo: [https://github.com/sovandara1607/daralm](https://github.com/sovandara1607/daralm)
- Version instruct (fine-tuned): [daraa1607/daralm-50m-instruct](https://huggingface.co/daraa1607/daralm-50m-instruct)
- Referencia externa sobre modelos de lenguaje pequenos (contexto general): [Super Tiny Language Models - arXiv](https://arxiv.org/html/2405.14159v1)
