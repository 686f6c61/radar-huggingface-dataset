# abenzerps/LFM2.5-24B-A2B-Uncensored-GSQ-RCO-GGUF

## Resumen

LFM2.5-24B-A2B-Uncensored-GSQ-RCO-GGUF es una cuantización no oficial, en formato GGUF, del modelo base LiquidAI/LFM2.5-24B-A2B, publicada por el usuario abenzerps en Hugging Face. El modelo base es un modelo de lenguaje densamente eficiente de arquitectura híbrida (MoE con bloques convolucionales cortos y atención GQA) desarrollado por LiquidAI, y esta variante aplica un esquema de cuantización en precisión mixta denominado GSQ-RCO, diseñado para preservar el enrutamiento de expertos y el estado convolucional a anchos de bits muy bajos (2,65–4,60 bpw). El repositorio incluye además dos modelos "drafter" (DSpark) para decodificación especulativa en llama.cpp.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 24B parámetros totales (2,0B activos) con contexto de 128K tokens en GPUs de consumo de 12 GB de VRAM, con velocidades de 125–130 tok/s de decodificación y ~1.500 tok/s de prefill medidas en una RTX 3060 de 12 GB. Según los benchmarks publicados por el autor, la cuantización recomendada (IQ3_XS, 10,54 GB) recupera el 98,9% de la precisión del modelo BF16 en un conjunto de evaluación de tres tareas (AIME 2025, GPQA Diamond y LiveCodeBench v6). El autor lo etiqueta como "uncensored", lo que implica un comportamiento de seguridad posiblemente modificado respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 30 bloques ShortConv + 10 capas de atencion GQA + MoE disperso de 64 expertos (top-2 activos por token) |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2,0B (MoE top-2 de 64 expertos) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | GSQ-RCO: IQ2_XXS (2,65 bpw), IQ2_XS (2,85 bpw), IQ3_XS (3,50 bpw), IQ4_XS (4,60 bpw); drafters DSpark en F16 y Q8_0; KV cache cuantizable a Q8_0 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia "other", propia de LiquidAI) |
| Formato de pesos | GGUF (cuantizado con imatrix; modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-24B-A2B combina 30 bloques convolucionales cortos (ShortConv), 10 capas de atencion multi-cabeza agrupada (GQA) y una capa de mezcla de expertos dispersa (MoE) con 64 expertos de los cuales se activan 2 por token. Esta arquitectura hibrida reduce drasticamente el coste de inferencia (2,0B parametros activos frente a 24B totales) y, segun el autor, produce una KV cache 4 veces mas pequena que en arquitecturas transformer convencionales, lo que hace viable el contexto de 128K en GPUs modestas.

El esquema GSQ-RCO (Routing & Convolution-preserving quantization) es una cuantizacion en precision mixta que evita cuantizar uniformemente todas las capas: el autor sostiene que la cuantizacion estandar corrompe el enrutamiento compartido de expertos y el backbone de estado convolucional, provocando desviaciones de experto y degradacion del razonamiento a bajos anchos de bits. RCO protege especificamente esas rutas criticas. Los archivos usan imatrix para calibrar la cuantizacion. Los drafters DSpark (664 MB en F16, 356 MB en Q8_0) permiten decodificacion especulativa en llama.cpp mediante `--spec-type draft-dspark`. No se dispone de informacion sobre los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset ni uso de RLHF/DPO) en la documentacion proporcionada.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, formato conversacional).
- Razonamiento multi-paso: el autor destaca el diseno de la cuantizacion para preservar capacidades de reasoning del modelo base.
- Generacion de codigo: evaluado en LiveCodeBench v6 con resultados de 52–58,86% segun cuantizacion.
- Resolucion de problemas matematicos: puntuaciones de 70–86,67% en AIME 2025 segun cuantizacion.
- Respuesta a preguntas a nivel posgrado en ciencias: 66,67–75,76% en GPQA Diamond.
- Contexto largo: 128K tokens con KV cache cuantizada (Q8_0) y flash attention.
- Multilingüe: 16 idiomas, incluido el castellano (es).
- Decodificacion especulativa con DSpark para acelerar la inferencia en llama.cpp.
- Ejecucion via Ollama y llama-server (endpoints compatibles con API).
- Etiquetado "uncensored" por el autor: posible ausencia o reduccion de filtros de seguridad respecto al modelo original.

No hay informacion sobre tool calling, function calling, capacidades de vision ni audio en la documentacion proporcionada.

## Casos de uso

- Chatbot local en GPU de consumo: con IQ3_XS (10,54 GB) cabe en una RTX 3060 de 12 GB y ofrece conversacion fluida a 125–130 tok/s, adecuado para asistentes personales offline.
- Procesamiento de documentos largos: la ventana de 128K tokens permite analizar contratos, informes o bases de codigo extensos en una sola pasada, con ~10,82 GB de VRAM a contexto completo.
- Generacion y revision de codigo en local: los resultados en LiveCodeBench v6 (~54–58%) lo hacen util para autocompletado, revision y depuracion asistida, especialmente con la variante IQ2_XS que el autor senala como la mejor en precision de codigo por debajo de 9 GB.
- Razonamiento matematico y cientifico: con 83,33% en AIME 2025 (IQ3_XS) es apto para asistir en problemas de olimpiadas matematicas y consultas tecnicas de nivel posgrado.
- Despliegue en servidores de inferencia ligeros: llama-server con contexto completo de 128K en una sola GPU de 12 GB permite montar un endpoint compatible con API para equipos pequenos sin hardware de datacenter.
- Aplicaciones multilingües: soporte de 16 idiomas (incluidos castellano, frances, aleman, japones, chino y arabe) para clasificacion, resumen y generacion en entornos internacionales.
- Experimentacion con cuantizacion agresiva: las variantes IQ2_XXS/IQ2_XS (7,93–8,52 GB) permiten ejecutar el modelo en GPUs de 8 GB, util para portatiles y pruebas rapidas.

## Benchmarks y rendimiento

Evaluacion en tres tareas (suite de ISTA-DASLab) publicada por el autor del repositorio:

| Modelo | bpw | Tamano | AIME 2025 | GPQA Diamond | LiveCodeBench v6 | Media 3 tareas | Recovery |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| BF16 Base (LiquidAI) | 16,00 | 47,96 GB | 80,00% | 75,76% | 54,86% | 70,20% | 100,0% |
| Unsloth UD-Q6_K_XL | 7,30 | 21,86 GB | 86,67% | 72,73% | 55,43% | 71,61% | 102,0% |
| GSQ-RCO-IQ4_XS | 4,60 | 13,84 GB | 86,67% | 73,74% | 54,29% | 71,56% | 101,9% |
| GSQ-RCO-IQ3_XS (recomendado) | 3,50 | 10,54 GB | 83,33% | 70,71% | 54,29% | 69,44% | 98,9% |
| GSQ-RCO-IQ2_XS | 2,85 | 8,52 GB | 73,33% | 66,67% | 58,86% | 66,29% | 94,4% |
| GSQ-RCO-IQ2_XXS | 2,65 | 7,93 GB | 70,00% | 66,67% | 52,00% | 62,89% | 89,6% |

Rendimiento de inferencia medido por el autor (RTX 3060 de 12 GB, IQ2_XS, KV cache Q8_0, sin DSpark): 125–130 tok/s de decodificacion y ~1.500 tok/s de prefill. No se han publicado resultados de benchmarks comparativos con otros modelos de la misma categoria fuera de las variantes de cuantizacion del propio modelo.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - IQ2_XXS: 7,93 GB de pesos; apto para GPUs de 8 GB.
  - IQ2_XS: 8,52 GB de pesos; ~9,88 GB de VRAM total a 64K de contexto y ~10,82 GB a 128K (KV cache Q8_0).
  - IQ3_XS (recomendado): 10,54 GB de pesos; orientado a GPUs de 12 GB.
  - IQ4_XS: 13,84 GB de pesos; orientado a GPUs de 16 GB.
- GPU recomendadas: RTX 3060 de 12 GB (medidas oficiales del autor); por extension, GPUs equivalentes de 12 GB (RTX 4070, RTX 3080) y de 16 GB (RTX 4080/4060 Ti 16 GB) para las variantes superiores.
- Cabe en GPU de consumo: si, es uno de los puntos fuertes del repositorio; un modelo de 24B/2B-activos con 128K de contexto funciona en una RTX 3060 de 12 GB.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server, con decodificacion especulativa DSpark), Ollama (`ollama run hf.co/abenzerps/LFM2.5-24B-A2B-Uncensored-GSQ-RCO-GGUF:IQ3_XS`). No se menciona soporte para vLLM ni TGI (al ser GGUF).
- Latencia y throughput: 125–130 tok/s de decodificacion y ~1.500 tok/s de prefill en RTX 3060 de 12 GB con IQ2_XS a 64K/128K de contexto sin DSpark; con DSpark el autor indica mayor velocidad pero no publica cifras concretas.
- Muestreo recomendado: temperature 0,1, top_k 50, repeat_penalty 1,05.

## Comparativa con modelos similares

| Modelo | Parametros totales/activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-24B-A2B (base, LiquidAI) | 24B / 2,0B | 128K | lfm1.0 (other) | HuggingFace, GGUF oficial y safetensors |
| Unsloth LFM2.5-24B-A2B UD-Q6_K_XL | 24B / 2,0B | 128K | lfm1.0 (heredada) | GGUF, 21,86 GB, mejor media en benchmarks (71,61%) |
| abenzerps GSQ-RCO-IQ3_XS (esta ficha) | 24B / 2,0B | 128K | lfm1.0 (other) | GGUF, 10,54 GB, 98,9% de recovery con la mitad de espacio que Q6_K_XL |

No se han incluido modelos de otras familias (Qwen, Gemma, etc.) porque la informacion proporcionada no contiene datos comparativos verificables y no procede inventar cifras.

## Limitaciones y advertencias

- Cuantizacion de terceros: no es un lanzamiento oficial de LiquidAI; la calidad depende del proceso GSQ-RCO del autor y los benchmarks proceden de su propia model card, sin verificacion independiente.
- Etiqueta "uncensored": el autor indica que se trata de una variante sin censura; esto implica posible eliminacion de salvaguardas de seguridad y un riesgo elevado de generar contenido harmful. No recomendado para entornos de produccion expuestos a usuarios finales sin filtros adicionales.
- Degradacion a bajos anchos de bits: la variante IQ2_XXS pierde mas de 10 puntos en la media de las tres tareas (62,89% frente a 70,20% del BF16); evitar para razonamiento critico.
- Riesgo de alucinacion: inherente a modelos de lenguaje; no se publican evaluaciones de veracidad o alucinacion para este modelo.
- Sesgos: no se documenta ningun analisis de sesgos; el modelo base se entreno en 16 idiomas con composicion de datos no disponible, por lo que pueden existir desequilibrios de calidad entre idiomas.
- Licencia lfm1.0: es una licencia "other" propia de LiquidAI; conviene revisar el texto de la licencia antes de cualquier uso comercial, ya que puede incluir restricciones.
- Informacion no disponible: datos de entrenamiento del modelo base, soporte de tool calling, capacidades multimodales y benchmarks comparativos con otras familias de modelos.
- Los datos de rendimiento (125–130 tok/s) corresponden a la variante IQ2_XS en una configuracion concreta; otras cuantizaciones y hardware pueden dar resultados distintos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/abenzerps/LFM2.5-24B-A2B-Uncensored-GSQ-RCO-GGUF
- Modelo base (LiquidAI): https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- GGUF oficial del modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Cuantizacion de Unsloth (referencia en benchmarks): https://huggingface.co/unsloth/LFM2.5-24B-A2B-GGUF
- Suite de evaluacion de referencia: https://huggingface.co/ISTA-DASLab
- Perfil de GitHub del autor: https://github.com/abenzerps
- Pagina de solicitudes de cuantizacion del autor: https://abenzerps.com/request-a-model/
- Papers referenciados en los tags: arXiv 2604.18556 y arXiv 2605.00649 (enlaces no verificados en la informacion proporcionada)
