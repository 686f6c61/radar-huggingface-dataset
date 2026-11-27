# jesusmarcosrv81/qwen3-14b-funeraria-mx-lora

## Resumen

`jesusmarcosrv81/qwen3-14b-funeraria-mx-lora` es un ajuste fino (LoRA) del modelo Qwen3-14B, publicado por el usuario jesusmarcosrv81 en Hugging Face. El nombre del repositorio sugiere una especializacion en el dominio funerario mexicano, aunque la model card no documenta explicitamente el dataset de entrenamiento ni el objetivo concreto del ajuste. El modelo base es la version cuantizada a 4 bits de Qwen3-14B preparada por Unsloth (`unsloth/Qwen3-14B-unsloth-bnb-4bit`), sobre la que se aplico un entrenamiento supervisado con la libreria TRL.

El modelo hereda la arquitectura densa de Qwen3-14B, un transformer decoder-only de 14 mil millones de parametros con soporte para modo de razonamiento (thinking) y contexto largo. El ajuste se realizo con Unsloth, una libreria optimizada que acelera el entrenamiento de LoRA aproximadamente 2x respecto a implementaciones estandar. El repositorio ocupa 0.3 GB, lo que confirma que se trata de los adaptadores LoRA y no de los pesos completos fusionados.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo tipico de ajuste fino de dominio vertical (sector funerario en Mexico) sobre un modelo abierto, con licencia Apache 2.0, cero descargas y sin benchmarks publicados. Resulta util como referencia para quienes quieran replicar el flujo Unsloth + TRL + Qwen3 sobre un dominio especializado, pero no como modelo de produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), ajuste LoRA sobre base cuantizada a 4 bits |
| Parametros totales | 14 mil millones (heredados de Qwen3-14B); tamano del adaptador LoRA no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (Qwen3-14B soporta hasta 32 768 tokens nativos, extensible; no confirmado para este ajuste) |
| Tipos de cuantizacion | Base en bnb-4bit (bitsandbytes 4 bits); adaptadores en safetensors; otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (segun la model card); el nombre del repositorio sugiere uso en espanol de Mexico, pero no esta declarado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA); requiere fusion o carga sobre el modelo base |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA sobre Qwen3-14B, un transformer decoder-only denso de 14 mil millones de parametros. El entrenamiento se realizo con Unsloth y TRL sobre la version del modelo base cuantizada a 4 bits con bitsandbytes (`unsloth/Qwen3-14B-unsloth-bnb-4bit`). Unsloth aplica kernels personalizados que reducen el uso de memoria y aceleran el entrenamiento de LoRA, lo que permite ajustar modelos de 14B en GPUs de consumo con VRAM limitada.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros del ajuste. La model card es la plantilla automatica de Unsloth y no aporta detalles sobre el corpus funerario mexicano que sugiere el nombre del repositorio. El tamano del repositorio (0.3 GB) es coherente con adaptadores LoRA de rango bajo sobre un modelo de 14B.

## Capacidades

- Generacion de texto en ingles (idioma declarado); capacidad en espanol no verificada pese al nombre del repositorio.
- Razonamiento y modo thinking heredados de Qwen3 (no confirmado que el ajuste los preserve).
- Generacion de codigo y matematicas (capacidad del modelo base, no evaluada tras el ajuste).
- Soporte de tool calling y function calling (heredado de Qwen3, no verificado).
- Capacidades de agente y razonamiento multi-paso (heredadas, no verificadas).
- Especializacion presumible en dominio funerario mexicano (no documentada ni evaluada).
- Capacidades multimodales: no disponibles (Qwen3-14B es solo texto).

## Casos de uso

- Prototipado de asistentes de atencion funeraria en Mexico: el ajuste sugiere vocabulario y casuistica del sector, util para generar respuestas iniciales en un chatbot de preorientacion a familias, siempre con supervision humana.
- Generacion de textos de condolencias y esquelas: el modelo podria redactar borradores personalizados con tono formal, aunque la falta de evaluacion exige revision editorial.
- Soporte a la cumplimentacion de documentacion funeraria: como asistente de redaccion de formularios y comunicaciones administrativas, integrado en un flujo con validacion humana.
- Base para experimentos de ajuste de dominio: sirve como referencia reproducible del pipeline Unsloth + TRL + Qwen3 para equipos que quieran adaptar un modelo a un vertical concreto.
- Investigacion sobre sesgos en dominios sensibles: permite estudiar como un ajuste de nicho sobre un modelo general afecta al tono, la factualidad y la seguridad en temas delicados.
- Generacion de FAQ y contenido web para funerarias: redaccion de preguntas frecuentes y articulos informativos sobre servicios, precios y tramites, con curacion posterior.
- Evaluacion comparativa de LoRA de dominio: util como caso de estudio para medir la degradacion de capacidades generales tras un ajuste especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en 4 bits: aproximadamente 9-10 GB, mas overhead de contexto y adaptadores.
- VRAM estimada en FP16/BF16 (pesos fusionados): aproximadamente 28-30 GB.
- GPU recomendadas: A100 40/80 GB, H100 para FP16; RTX 4090 (24 GB) para 4 bits o 8 bits; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: si, en 4 bits cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo) y en GPUs con 12 GB solo con cuantizacion agresiva adicional (no verificada).
- Opciones de despliegue: transformers + PEFT para cargar los adaptadores, vLLM o TGI tras fusionar pesos, llama.cpp/Ollama si se generan GGUF (no disponibles en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-14b-funeraria-mx-lora (este) | 14B (LoRA) | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste de nicho sin evaluacion |
| Qwen/Qwen3-14B (base) | 14B | 32 768 nativos (extensible) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo general con benchmarks publicados |
| unsloth/Qwen3-14B-unsloth-bnb-4bit | 14B (4 bits) | Igual que base | Apache 2.0 | Hugging Face | Version optimizada para entrenamiento |
| Llama 3.1 8B Instruct | 8B | 128 000 | Llama 3.1 Community | Hugging Face | Alternativa general de menor tamano |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento: no se puede verificar la calidad, el sesgo ni la cobertura del ajuste.
- Riesgo elevado de alucinacion en un dominio sensible (servicios funerarios, precios, normativa) sin evaluacion publicada.
- Idioma declarado solo en ingles, pese a que el nombre del repositorio sugiere espanol de Mexico; el comportamiento multilingue no esta verificado.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por la comunidad.
- El ajuste puede degradar capacidades generales del modelo base (razonamiento, codigo, tool calling) sin que se haya medido.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado en un sector regulado recae en el integrador.
- Requiere cargar el modelo base ademas de los adaptadores; el repositorio no incluye pesos fusionados ni GGUF.
- No apto para produccion sin evaluacion propia de seguridad, factualidad y sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jesusmarcosrv81/qwen3-14b-funeraria-mx-lora
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-14B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo Qwen3-14B original: https://huggingface.co/Qwen/Qwen3-14B
