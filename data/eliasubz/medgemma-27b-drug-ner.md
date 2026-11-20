# eliasubz/medgemma-27b-drug-ner

## Resumen

MedGemma-27B Drug NER es un adaptador LoRA (QLoRA) sobre el modelo base `unsloth/medgemma-27b-text-it`, desarrollado por eliasubz. Su tarea es la extraccion de menciones de farmacos (drug named-entity-recognition) en texto biomedico en ingles: recibe una frase y la regenera envuelta en etiquetas `<drug>`, `<group>`, `<brand>` o `<drug_n>` alrededor de cada entidad detectada. No es un modelo independiente, sino un adaptador PEFT que requiere cargar el modelo base MedGemma-27B en cuantizacion de 4 bits.

El interes del modelo es fundamentalmente metodologico: se entreno con QLoRA (r=8, alpha=16, 16,8 millones de parametros entrenables) sobre 5.285 frases del corpus DDI y se utiliza como modelo profesor en un proceso de destilacion hacia un student model BioBERT (`biobert-drug-ner`), que segun el autor es 530 veces mas rapido y conserva el 89,8 % del macro-F1. Es, por tanto, una pieza de un pipeline de anotacion y destilacion mas que un modelo de produccion.

El modelo alcanza un macro-F1 de 0,901 en el split de desarrollo y 0,845 en test del DDI corpus, con una latencia de aproximadamente 1,5 segundos por frase en una RTX 3090. Su publicacion es reciente (noviembre de 2026) y no registra descargas ni likes en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only MedGemma-27B (base: `unsloth/medgemma-27b-text-it`) |
| Parametros totales | no disponible (adaptador LoRA de 16,8 M parametros entrenables; el modelo base tiene 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits NF4 con compute en bf16 (BitsAndBytes) para el modelo base; adaptador en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | health-ai-developer-foundations (Health AI Developer Foundations terms, Google) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en formato transformers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre MedGemma-27B, un modelo de lenguaje decoder-only de 27.000 millones de parametros orientado al dominio medico. El entrenamiento se realizo con QLoRA: el modelo base se cargo en 4 bits (NF4) con computo en bf16, y se entrenaron adaptadores de rango 8 y alpha 16 unicamente sobre las proyecciones de atencion, lo que resulta en 16,8 millones de parametros entrenables. La tarea se plantea como generacion condicionada: el modelo recibe una frase y debe reproducirla integramente insertando etiquetas alrededor de las menciones de farmacos, con la funcion de perdida calculada solo sobre los tokens de la respuesta.

Los datos de entrenamiento provienen del DDI corpus (Herrero-Zazo et al., 2013), concretamente 5.285 frases del split de train. El ajuste se realizo durante 3 epocas con learning rate 2e-4 y batch efectivo de 16. No se documentan tecnicas adicionales como RLHF, DPO ni decodificacion especulativa; la generacion en el ejemplo de uso es greedy (`do_sample=False`). El autor indica que este modelo fue el mas fuerte de su comparativa interna y lo empleo como profesor para anotar datos de PubMed y destilar conocimiento en un modelo BioBERT.

## Capacidades

- Extraccion de entidades de farmacos en texto biomedico en ingles, con cuatro tipos de etiqueta: `<drug>`, `<group>`, `<brand>` y `<drug_n>`.
- Generacion de texto con formato de chat (system prompt y user prompt definidos en `prompts01.json`).
- Reescritura fiel de la frase de entrada con anotaciones inline (tarea de seq2seq disfrazada de generacion).
- Uso como modelo profesor para anotacion automatica de corpus (PubMed) y destilacion hacia modelos mas pequenos.
- Capacidades multilingues: no disponibles; el modelo esta declarado solo para ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Anotacion de corpus biomedicos a escala: el modelo puede procesar frases de PubMed y generar versiones etiquetadas que sirvan como silver data para entrenar modelos mas ligeros, tal como hizo el autor con BioBERT.
- Destilacion de conocimiento: usar sus salidas como etiquetas de referencia para entrenar un student model de menor tamano y mucho menor coste de inferencia (el autor reporta 530× mas velocidad en BioBERT).
- Extraccion de farmacos en informes clinicos o resumenes de historias: dado un texto en ingles, devuelve las menciones etiquetadas por tipo (farmaco, grupo, marca).
- Preprocesado para sistemas de deteccion de interacciones farmaco-farmaco (DDI): las entidades extraidas alimentan etapas posteriores de relation extraction.
- Analisis de literatura cientifica: localizar menciones de farmacos en abstracts para construir bases de datos farmacologicas.
- Evaluacion comparativa de estrategias de NER (generativa vs. extractiva): sirve como referencia de techo de calidad frente a modelos discriminativos tipo BioBERT.
- Prototipado en investigacion clinica: validar rapidamente un enfoque generativo de NER antes de invertir en un modelo en produccion.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el DDI corpus (entrenamiento en train, ajuste en devel). Velocidad medida en una RTX 3090.

| Split | Macro-F1 | Micro-F1 | Accuracy | ms por frase |
|---|---|---|---|---|
| devel | 0,901 | 0,944 | 0,984 | 1.510 |
| test | 0,845 | 0,925 | 0,984 | 1.542 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 27B parametros; en 4 bits NF4 ocupa aproximadamente 14-16 GB solo en pesos, mas overhead de activaciones y KV cache. En la practica se recomienda al menos 24 GB de VRAM para frases cortas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para cuantizacion 4 bits con frases cortas.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 (24 GB) con cuantizacion 4 bits, como demuestra la medicion del autor en una RTX 3090.
- Opciones de despliegue: transformers + PEFT + BitsAndBytes (metodo documentado); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este adaptador.
- Latencia y throughput: aproximadamente 1,5 s por frase en RTX 3090 con decodificacion greedy, segun el autor; no se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 (DDI test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medgemma-27b-drug-ner | 27B base + LoRA 16,8 M | no disponible | 0,845 | health-ai-developer-foundations | Hugging Face (PEFT) |
| biobert-drug-ner (student del mismo autor) | no disponible (BioBERT) | no disponible | 89,8 % del macro-F1 del profesor | no disponible | Hugging Face |
| MedGemma-27B-text-it (base) | 27B | no disponible | no disponible (no especializado en NER) | health-ai-developer-foundations | Hugging Face |

No se dispone de datos de benchmarks de otros modelos NER comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar el modelo base `unsloth/medgemma-27b-text-it` en 4 bits, lo que implica un coste de VRAM y almacenamiento considerable.
- Latencia alta para NER (aproximadamente 1,5 s por frase en RTX 3090), inadecuada para procesamiento de grandes volumenes en tiempo real; el propio autor lo sustituye por un student model 530× mas rapido.
- Riesgo de alucinacion: al ser un modelo generativo que reescribe la frase, puede alterar el texto original o inventar etiquetas; no se documenta ningun mecanismo de validacion de fidelidad.
- Entrenado sobre un unico corpus (DDI, 5.285 frases); la generalizacion a otros dominios clinicos o formatos no esta validada.
- Licencia Health AI Developer Foundations: restricciones especificas para uso comercial y sanitario; es necesario revisar los terminos de Google antes de cualquier despliegue en produccion.
- No se documentan sesgos especificos, pero al derivar de un modelo medico entrenado con datos mayoritariamente en ingles, puede presentar sesgos de dominio y de poblacion.
- Sin descargas ni validacion externa en Hugging Face en el momento de la consulta; tratar los resultados como no replicados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/eliasubz/medgemma-27b-drug-ner
- Modelo base: https://huggingface.co/unsloth/medgemma-27b-text-it
- Student model: https://huggingface.co/eliasubz/biobert-drug-ner
- Dataset DDI corpus: https://huggingface.co/datasets/bigbio/ddi_corpus
- Paper del DDI corpus (Herrero-Zazo et al., 2013): https://doi.org/10.1016/j.jbi.2013.07.011
- Codigo: https://github.com/eliasubz/AHLT
- Licencia Health AI Developer Foundations: https://developers.google.com/health-ai-developer-foundations/terms
