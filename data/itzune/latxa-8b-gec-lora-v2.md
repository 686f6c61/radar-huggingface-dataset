# itzune/latxa-8b-gec-lora-v2

## Resumen

`itzune/latxa-8b-gec-lora-v2` es un adaptador LoRA (PEFT) sobre el modelo base `HiTZ/Latxa-Llama-3.1-8B-Instruct`, desarrollado por el usuario itzune. Su funcion es convertir el modelo base en un corrector gramatical del euskera (GEC, grammatical error correction) siguiendo los criterios del EBE (Euskara Batuaren Eskuliburua). No es un modelo de chat: se plantea como profesor o filtro para generar etiquetas de correccion a gran escala y para rerankear ediciones humanas en corpus de Wikipedia en euskera.

El adaptador entrena unos 42M de parametros (fichero de 177 MB) con rango LoRA 16, alpha 32 y dropout 0.05 sobre los modulos de atencion y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El modelo base hereda la arquitectura Llama 3.1 de 8B parametros con adaptacion linguistica al euskera sobre un corpus de 4,3M documentos y 4,2B tokens. Es relevante porque demuestra que un adaptador pequeno sobre un LLM de 8B supera ampliamente a un corrector especializado (GECToR) en la misma porcion de evaluacion: F0.5 de 58,2 frente a 43,7.

La innovacion practica del proyecto es el uso de un margen copy-vs-edit en decodificacion: se comparan las log-probabilidades teacher-forced de la correccion propuesta y de la frase sin cambios, y solo se acepta la edicion si la diferencia supera un umbral. Esto es imprescindible para controlar los falsos positivos sobre texto limpio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Llama 3.1 8B Instruct adaptado al euskera por HiTZ) |
| Parametros totales | ~42M entrenables en el adaptador; modelo base de 8B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base; el autor recomienda entradas de una sola frase, maximo 384 subtokens en entrenamiento) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada para el adaptador; el modelo base admite cuantizaciones habituales de Llama 3.1 (no verificadas en la ficha) |
| Idiomas soportados | euskera (eu) |
| Licencia | Llama 3.1 Community Licence (derivada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `HiTZ/Latxa-Llama-3.1-8B-Instruct`, un transformer decoder-only de tipo Llama 3.1 con 8B parametros adaptado al euskera mediante tecnicas de adaptacion linguistica sobre un corpus de 4,3M documentos y 4,2B tokens. El LoRA usa `r=16`, `alpha=32`, `dropout=0.05` y se aplica a los siete modulos habituales de atencion y MLP. El entrenamiento se hizo en bf16, con la perdida calculada unicamente sobre el turno del asistente, durante 1 epoca (4.318 pasos, batch 16, maximo 384 subtokens).

Los datos de entrenamiento suman 69.076 registros (mas 500 de desarrollo): 63.064 del `horkonpon-corpus` v4.1 en formato chat, con un 40% de copias limpias, y 6.012 ediciones humanas aceptadas de Wikipedia juzgadas por Latxa-70B. El pipeline incluye una guarda de fuga que elimina cualquier frase presente en los conjuntos de evaluacion reales o sinteticos. El prompt de sistema pide correcciones minimas fundamentadas en el EBE. La decodificacion de referencia no es muestreo simple: usa decodificacion voraz combinada con el margen copy-vs-edit descrito en el resumen.

## Capacidades

- Correccion gramatical del euskera con ediciones minimas y criterio EBE.
- Generacion de texto y formato conversacional heredados del modelo base Instruct.
- Etiquetado masivo de corpus: correccion de grandes volumenes de texto no etiquetado conservando solo las ediciones con alta confianza.
- Filtrado y reranking de ediciones humanas: puntua una edicion frente a la frase original y la conserva solo si el modelo la prefiere.
- Puntuacion mediante margen copy-vs-edit con log-probabilidades teacher-forced.
- Capacidades multilingues limitadas al euskera en el uso previsto; el modelo base puede tener otras, pero no estan documentadas en esta ficha.
- No se documenta soporte de tool calling, function calling, agentes ni vision en la informacion disponible.

## Casos de uso

- Etiquetado masivo de corpus en euskera: aplicar el adaptador sobre un corpus no anotado y conservar solo las correcciones con margen suficiente para generar pares de entrenamiento; el autor lo uso para producir 36.878 pares para GECToR v5.
- Filtrado de ediciones en Wikipedia: puntuar cada revision humana frente a la frase original y aceptar solo las que el modelo prefiere, como segundo filtro barato en mineria de revisiones.
- Construccion de datasets de destilacion: usar el modelo como profesor para etiquetar datos que entrenen modelos mas pequenos y desplegables en CPU, como el GECToR de 125M.
- Control de calidad editorial: correccion asistida de articulos y textos divulgativos en euskera antes de publicacion, con revision humana de las ediciones propuestas.
- Evaluacion de correctores: emplear el margen copy-vs-edit como referencia para comparar y ajustar otros sistemas GEC en euskera.
- Investigacion en GEC de lenguas de bajos recursos: punto de partida reproducible para experimentar con adaptadores LoRA sobre LLMs multilingues en tareas de correccion gramatical.
- Preprocesado de corpus para entrenamiento de modelos en euskera: limpieza de texto ruidoso antes de usarlo en pipelines de adaptacion linguistica.

## Benchmarks y rendimiento

Porcion real de Wikipedia: 171 frases con errores y 247 limpias, revisadas manualmente.

| Margen | Exact | Precision | Recall | F0.5 | Falsos positivos en texto limpio |
|---|---:|---:|---:|---:|---:|
| -4 | 12,3% | 75,8 | 13,2 | 38,8 | 0,8% |
| -2 | 22,2% | 73,8 | 25,3 | 53,3 | 2,4% |
| -1 (recomendado) | 28,1% | 75,3 | 30,5 | 58,2 | 2,8% |
| 0 | 31,6% | 70,2 | 34,7 | 58,3 | 4,5% |
| +1 | 35,1% | 71,2 | 38,9 | 61,1 | 6,9% |

Porcion sintetica ciega: 300 frases con errores y 300 limpias.

| Margen | Exact | F0.5 | Falsos positivos en texto limpio |
|---|---:|---:|---:|
| -2 | 55,7% | 79,6 | 3,0% |
| -1 | 59,7% | 79,5 | 4,3% |
| 0 | 61,7% | 78,9 | 8,3% |

Referencia en la misma porcion real: GECToR v2 F0.5 15,7; GECToR v5 F0.5 43,7; este adaptador F0.5 58,2.

## Requisitos de hardware

- VRAM estimada: unos 16 GB en bf16 para el modelo base de 8B mas el adaptador.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en bf16; GPU con al menos 16 GB para el pipeline de referencia.
- En GPU de consumo: cabe en RTX 4090 (24 GB); no se documenta su comportamiento en GPU de 12-16 GB con cuantizacion.
- Opciones de despliegue: `transformers` con `peft` (`PeftModel.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador. Existe una publicacion en Ollama del modelo base (`itzune/latxa:8b`), no del adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F0.5 (porcion real) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `itzune/latxa-8b-gec-lora-v2` | ~42M adaptador sobre 8B | no disponible | 58,2 (margen -1) | Llama 3.1 Community | Hugging Face (PEFT) |
| `itzune/gector-eus-v5` | 125M (token classification) | no aplica | 43,7 | no disponible en la informacion | Hugging Face |
| GECToR v2 (referencia) | no disponible | no aplica | 15,7 | no disponible en la informacion | no disponible |
| `HiTZ/Latxa-Llama-3.1-8B-Instruct` | 8B | no disponible | no aplica (modelo base sin adaptador GEC) | Llama 3.1 Community | Hugging Face |

## Limitaciones y advertencias

- No es un corrector listo para usar: sin la regla del margen copy-vs-edit tiende a sobrecorregir texto limpio (hasta un 8% de frases limpias con margen 0) y requiere unos 16 GB de GPU en bf16.
- Es un profesor, no una verdad de referencia: sus ediciones se aceptaron en datos de entrenamiento tras filtrado, y el ruido restante se hereda en los modelos estudiantes.
- Sesgo de genero textual: la mitad de ediciones minadas proviene de `euwiki-20261101`, por lo que sus metricas reales se benefician de ese mismo genero.
- Conjunto de evaluacion pequeno (171 frases): las diferencias de un solo punto deben tratarse como ruido.
- Latxa-8B no esta entrenado para documentos largos; conviene limitar las entradas a frases sueltas.
- Licencia Llama 3.1 Community: restringe el uso de las salidas del modelo para entrenar otros modelos grandes de lenguaje; el objetivo de destilacion del proyecto es un modelo de clasificacion de tokens de 125M, no un LLM.
- Riesgo de alucinacion y de ediciones no justificadas en textos fuera del dominio de entrenamiento (Wikipedia y corpus Horkonpon).
- No se documentan capacidades de tool calling, agentes ni vision; no debe asumirse que las hereda del modelo base para esta tarea.
- Idiomas: el uso previsto y evaluado es exclusivamente euskera.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itzune/latxa-8b-gec-lora-v2
- Modelo base: https://huggingface.co/HiTZ/Latxa-Llama-3.1-8B-Instruct
- Modelo estudiante: https://huggingface.co/itzune/gector-eus-v5
- Dataset de destilacion: https://huggingface.co/datasets/itzune/wiki-gec-distill-eu
- Dataset de entrenamiento: https://huggingface.co/datasets/itzune/horkonpon-corpus
- Repositorio del proyecto: https://github.com/itzune/gector-eus-v2
- Script del margen copy-vs-edit: https://github.com/itzune/gector-eus-v2/blob/main/scripts/llm_nbest.py
- Script de barrido del margen: https://github.com/itzune/gector-eus-v2/blob/main/scripts/sweep_llm_margin.py
- Script de construccion de datos: https://github.com/itzune/gector-eus-v2/blob/main/scripts/build_lora_data.py
- Evaluador `eusgec`: https://github.com/itzune/gector-eus-v2
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B/blob/main/LICENSE
- Publicacion en Ollama del modelo base: https://ollama.com/itzune/latxa:8b
- Paper de referencia (arxiv:2403.20266): https://arxiv.org/abs/2403.20266
