# eliasubz/Llama-3.2-3B-drug-ner

## Resumen

Llama-3.2-3B-drug-ner es un adaptador LoRA publicado por el usuario eliasubz sobre el modelo base unsloth/Llama-3.2-3B-Instruct. Su tarea es el reconocimiento de entidades nombradas (NER) de farmacos en texto biomedico en ingles: recibe una frase y la regenera envolviendo cada mencion detectada en etiquetas `<drug>`, `<group>`, `<brand>` o `<drug_n>`. No es un modelo de proposito general, sino un ajuste fino especializado para extraccion de entidades farmacologicas.

El adaptador se entrena con QLoRA (r=8, alpha=16 sobre las proyecciones de atencion) sobre 5.284 frases del corpus DDI (Drug-Drug Interaction corpus), con la perdida calculada unicamente sobre los tokens de respuesta. El modelo base aporta una ventana de contexto de 128.000 tokens y 3.210 millones de parametros, aunque el adaptador en si anade un numero muy reducido de parametros entrenables.

Su relevancia practica esta en el ambito de la farmacovigilancia y el procesamiento de literatura biomedica: permite detectar menciones de farmacos, marcas y grupos terapeuticos en frases de DrugBank y MEDLINE con un macro-F1 de 0,864 en el conjunto de desarrollo y 0,780 en test, a un coste de inferencia de unos 456-473 ms por frase en una RTX 3090. Es un ejemplo de adaptacion eficiente de un modelo pequeno a una tarea de extraccion estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA sobre proyecciones de atencion |
| Parametros totales | 3.210 millones (modelo base Llama-3.2-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no verificado en la model card) |
| Tipos de cuantizacion | 4-bit NF4 (BitsAndBytes) usada en el ejemplo de uso; otras no documentadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se carga por separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango (r=8, alpha=16) aplicado sobre las proyecciones de atencion de Llama-3.2-3B-Instruct, cargado en 4 bits con QLoRA. La tarea se formula como generacion condicionada: el modelo recibe un system prompt y un user prompt (definidos en `prompts01.json`) seguidos del texto de entrada, y debe reproducir la frase con las entidades etiquetadas. La perdida se calcula solo sobre los tokens de la respuesta, no sobre el prompt.

El entrenamiento usa 5.284 frases del split de train del DDI corpus, con 3 epocas, learning rate 2e-4 y batch efectivo de 16. El ajuste se valido sobre el split de desarrollo del mismo corpus. No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa; la generacion en el ejemplo de uso es greedy (`do_sample=False`).

## Capacidades

- Reconocimiento de entidades farmacologicas en frases en ingles: farmacos (`<drug>`), grupos terapeuticos (`<group>`), marcas comerciales (`<brand>`) y sustancias no aprobadas para uso humano (`<drug_n>`).
- Regeneracion de la frase original con las entidades envueltas en etiquetas, lo que facilita el postprocesado y la extraccion estructurada.
- Procesamiento de frases de dominios biomedicos concretos: DrugBank y MEDLINE.
- Generacion de texto condicionada por chat template (roles system/user), heredada del modelo base.
- No se documenta soporte de tool calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Farmacovigilancia sobre literatura cientifica: procesar abstracts de MEDLINE para extraer automaticamente menciones de farmacos y marcas, alimentando bases de datos de eventos adversos. El modelo esta entrenado precisamente sobre frases de ese dominio.
- Construccion de grafos de interacciones farmacologicas: combinar la salida etiquetada con el corpus DDI para poblar nodos de farmacos y relaciones de interaccion en un pipeline de extraccion de conocimiento.
- Normalizacion de textos clinicos: detectar marcas comerciales (`<brand>`) y mapearlas a principios activos (`<drug>`) en informes o notas, usando las etiquetas para separar ambas categorias.
- Anotacion asistida de corpus: preetiquetar frases para revisores humanos en proyectos de anotacion de entidades farmacologicas, reduciendo el coste manual gracias a un micro-F1 de 0,908 en test.
- Extraccion de entidades en pipelines de procesamiento documental: integrar el adaptador en un servicio de inferencia por lotes que procese frases una a una (unos 456-473 ms por frase en RTX 3090) y devuelva JSON estructurado.
- Investigacion en NER biomedico: servir como linea base reproducible y ligera (adaptador LoRA sobre 3B) para comparar recetas de ajuste fino frente a modelos mayores como medgemma-27b-drug-ner, con la misma receta de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el DDI corpus (entrenamiento en train, ajuste en devel):

| Split | Macro-F1 | Micro-F1 | Accuracy | ms por frase (RTX 3090) |
|---|---|---|---|---|
| devel | 0,864 | 0,937 | 0,982 | 456 |
| test | 0,780 | 0,908 | 0,980 | 473 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el ejemplo oficial carga el modelo base en 4-bit NF4, lo que situa el peso en torno a 2 GB; con overhead de activaciones y contexto, un consumo practico de 4-6 GB es razonable para frases cortas.
- GPU recomendadas: RTX 3090 (medicion oficial de latencia), RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con al menos 6-8 GB de VRAM deberia poder ejecutar la configuracion 4-bit.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion 4-bit (no verificado mas alla del ejemplo oficial).
- Opciones de despliegue: transformers + PEFT + BitsAndBytes (ruta documentada); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia: 456 ms por frase en devel y 473 ms en test sobre una RTX 3090 con decodificacion greedy y `max_new_tokens=256`. No se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 (test, DDI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-drug-ner (este) | 3.210 M (base) + LoRA | 128.000 (base) | 0,780 | Llama 3.2 Community | Hugging Face (adaptador PEFT) |
| medgemma-27b-drug-ner | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face |
| Otros modelos NER biomedicos | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada por el autor es que este adaptador usa la misma receta de entrenamiento que medgemma-27b-drug-ner, pero no se publican sus metricas en la informacion disponible.

## Limitaciones y advertencias

- Solo procesa texto en ingles; no se ha validado en otros idiomas.
- Dominio restringido a frases de DrugBank y MEDLINE; el rendimiento fuera de ese estilo puede degradarse.
- La clase `drug_n` (sustancias no aprobadas para uso humano) es rara y la mas debil, segun el propio autor.
- Brecha notable entre devel (macro-F1 0,864) y test (0,780), lo que sugiere cierta sensibilidad a la distribucion de los datos.
- Riesgo de alucinacion inherente a un modelo generativo: puede alterar la frase original o inventar etiquetas si la entrada se aleja del formato esperado.
- Requiere cargar el modelo base por separado y aplicar el adaptador; no es un checkpoint autonomo.
- Licencia Llama 3.2 Community License: uso comercial sujeto a los terminos de Meta, incluidos requisitos de atribucion y restricciones de la licencia.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/eliasubz/Llama-3.2-3B-drug-ner
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Modelo de referencia con la misma receta: https://huggingface.co/eliasubz/medgemma-27b-drug-ner
- Dataset DDI corpus: https://huggingface.co/datasets/bigbio/ddi_corpus
- Paper del DDI corpus (Herrero-Zazo et al., 2013): https://doi.org/10.1016/j.jbi.2013.07.011
- Codigo: https://github.com/eliasubz/AHLT
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
