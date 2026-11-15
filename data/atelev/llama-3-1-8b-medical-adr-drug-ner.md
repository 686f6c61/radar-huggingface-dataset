# atelev/Llama-3.1-8B-Medical-ADR-Drug-NER

## Resumen

Llama-3.1-8B-Medical-ADR-Drug-NER es un adaptador LoRA (Low-Rank Adaptation) construido sobre Meta-Llama-3.1-8B-Instruct y especializado en la extraccion conjunta de menciones de farmacos y reacciones adversas a medicamentos (ADR, por sus siglas en ingles) a partir de narrativas de pacientes. Lo desarrolla Abigail Televitckiy bajo la mentoria del Dr. Heejun Kim, y esta pensado para tareas de farmacovigilancia y procesamiento de lenguaje natural clinico. El modelo resuelve un problema concreto: identificar de forma estructurada que farmaco se menciona y que efecto adverso se le asocia en texto libre, a menudo informal y ruidoso.

La base es un transformer causal decoder-only de 8.000 millones de parametros con 128.000 tokens de contexto (herencia de Llama 3.1), adaptado mediante instrucciones supervisadas. El adaptador es ligero (el repositorio pesa 0,2 GB) y se distribuye en formato PEFT/safetensors, lo que permite cargarlo sobre los pesos base sin duplicar el modelo completo.

Su relevancia radica en que demuestra que un ajuste fino LoRA de rango 16 sobre un modelo generalista de 8B mejora de forma medible la extraccion de entidades ADR frente al baseline zero-shot, con un salto de aproximadamente 15 puntos de F1 estricto. Es, por tanto, una referencia util para equipos que quieran prototipar pipelines de farmacovigilancia sin entrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Llama 3.1) con adaptador LoRA (r=16, alpha=32) |
| Parametros totales | 8.000 millones (modelo base); adaptador LoRA de tamanio reducido (repo de 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible (el autor no declara cuantizaciones publicadas; el adaptador es compatible con los pesos base en fp16/bf16 y con cuantizaciones del modelo base via PEFT) |
| Idiomas soportados | ingles (en) |
| Licencia | Llama 3.1 Community License; los datos CADECv2 estan sujetos a CSIRO Data Licence |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3.1-8B-Instruct, un transformer decoder-only con atencion causal estandar, RoPE y un contexto de 128.000 tokens. Sobre el se aplica un adaptador LoRA de rango r=16 y alpha=32, entrenado con precision mixta fp16, optimizador AdamW, learning rate 2e-4, batch size 8 y 3 epochs. El entrenamiento es de tipo instruccion supervisada para extraccion de entidades, no RLHF ni DPO.

Los datos de entrenamiento provienen de la fusion de tres corpus anotados de reacciones adversas: PsyTAR, ADE Corpus V2 y CADECv2, usando un 80% para entrenamiento y un 10% como split de test retenido (el resto corresponde a validacion segun la particion declarada). La innovacion principal no es arquitectonica sino de enfoque: unificar tres fuentes heterogeneas de narrativas de pacientes en una sola tarea de instruccion que extrae simultaneamente farmaco y ADR, en lugar de entrenar extractores NER independientes por dataset.

## Capacidades

- Extraccion conjunta de entidades de tipo farmaco (drug) y reaccion adversa (ADR) a partir de texto libre.
- Generacion de texto conversacional e instrucciones, heredada del modelo base Instruct.
- Formato de salida estructurado segun instruccion (entidades etiquetadas), apto para postprocesado en pipelines.
- Procesamiento de narrativas informales de pacientes, incluidos textos de foros y redes.
- Razonamiento multi-paso limitado, derivado del modelo base, aunque no es el objetivo del ajuste.
- Capacidades multilingues limitadas al ingles en la practica: el ajuste se realizo solo con datos en ingles.
- Soporte de tool calling y function calling: no disponible de forma especifica en este adaptador (existe en el modelo base, pero no se valida aqui).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Farmacovigilancia automatizada: procesar narrativas de pacientes y foros para extraer pares farmaco-ADR y alimentar sistemas de senales de seguridad, aprovechando el contexto de 128.000 tokens para lotes de documentos.
- Enriquecimiento de bases de datos de eventos adversos: convertir texto libre de informes en entidades estructuradas (farmaco, reaccion) listas para agregacion y analisis estadistico.
- Triaje de revision manual: preetiquetar candidatos ADR en grandes volumenes de texto para que revisores humanos validen solo los casos positivos, reduciendo carga.
- Analisis de redes sociales y foros de salud: detectar menciones de reacciones adversas en lenguaje informal, terreno donde los NER clasicos fallan.
- Investigacion academica en NLP clinico: usar el adaptador como baseline reproducible para experimentos de extraccion de entidades en corpus ADR.
- Construccion de pipelines de alerta temprana: integrar el extractor en un servicio que monitorice textos entrantes y dispare alertas cuando aparezca una combinacion farmaco-ADR de interes.
- Prototipado rapido en entornos con GPU consumer: al ser un adaptador LoRA sobre un 8B, permite iterar sobre el modelo base sin reentrenar pesos completos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el split de test retenido de la combinacion CADEC/PsyTAR/ADE:

| Condicion | ADR Strict F1 | ADR Relaxed F1 | Drug Exact F1 |
|---|---|---|---|
| Fine-tuned (V12) | 76,54% | 84,23% | 80,20% |
| Baseline zero-shot | 61,02% | 70,86% | 66,85% |

El ajuste fino supera el baseline zero-shot en las tres metricas, con una mejora de aproximadamente 15,5 puntos en ADR Strict F1, 13,4 puntos en ADR Relaxed F1 y 13,4 puntos en Drug Exact F1.

## Requisitos de hardware

- VRAM para inferencia del modelo base en fp16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 20-24 GB para contexto moderado.
- VRAM con cuantizacion del base (por ejemplo 8 bits o 4 bits via bitsandbytes/GGUF): aproximadamente 8-10 GB (4 bits) o 10-12 GB (8 bits), estimaciones orientativas no declaradas por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en fp16 con contexto moderado.
- GPU consumer: cabe en RTX 4090/3090 en fp16; en GPUs de 12-16 GB requiere cuantizacion del modelo base.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor), vLLM y TGI previa fusion del adaptador en los pesos base, llama.cpp/Ollama tras conversion y cuantizacion.
- Latencia y throughput: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atelev/Llama-3.1-8B-Medical-ADR-Drug-NER | 8B (base) + LoRA | 128.000 | Extraccion farmaco/ADR via LoRA | Llama 3.1 + CSIRO (datos) | Hugging Face (adaptador) |
| Meta-Llama-3.1-8B-Instruct (zero-shot) | 8B | 128.000 | Generalista, sin ajuste ADR | Llama 3.1 | Hugging Face |
| BioBERT / PubMedBERT (NER clasico) | ~110M | 512 | NER encoder-only ajustado | MIT / Apache-2.0 segun variante | Hugging Face |
| Modelos especializados SMM4H | variable | variable | NER ADR especifico de competicion | variable | variable |

La comparativa con BioBERT y PubMedBERT es orientativa: son extractores encoder-only de menor tamanio y contexto, mientras que este adaptador aprovecha la generacion y el contexto largo del 8B. No se dispone de resultados comparativos directos en la misma particion de test para esos modelos.

## Limitaciones y advertencias

- El ajuste se realizo exclusivamente con datos en ingles; el rendimiento en otros idiomas no esta validado.
- Las etiquetas de PsyTAR se asignan ocasionalmente a nivel de post y no dentro de una sola frase, lo que puede introducir ruido en la extraccion.
- No se ha validado en benchmarks externos como SMM4H, por lo que la generalizacion fuera de los corpus de entrenamiento es incierta.
- El despliegue comercial esta restringido por la licencia de CADECv2 (CSIRO Data Licence), ademas de las condiciones de la Llama 3.1 Community License.
- No apto para decision clinica no verificada: las entidades extraidas deben ser revisadas por personal cualificado.
- Riesgo de alucinacion inherente al modelo base; en tareas de extraccion puede generar entidades no presentes en el texto.
- Los resultados de benchmark son declarados por el autor y no estan verificados de forma independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atelev/Llama-3.1-8B-Medical-ADR-Drug-NER
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Dataset PsyTAR: https://huggingface.co/datasets/bigbio/psytar
- Dataset ADE Corpus V2: https://huggingface.co/datasets/ade-benchmark-corpus/ade_corpus_v2
- Repositorio GitHub del autor (referencia generica en la model card): https://github.com
