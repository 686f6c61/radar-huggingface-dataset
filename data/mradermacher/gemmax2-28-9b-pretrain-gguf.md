# mradermacher/GemmaX2-28-9B-Pretrain-GGUF

## Resumen

GemmaX2-28-9B-Pretrain-GGUF es la version cuantizada en formato GGUF del modelo base xiaomi-research/GemmaX2-28-9B-Pretrain, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de 9.241.705.984 parametros (aproximadamente 9,2 mil millones) derivado de la familia Gemma, orientado a modelado de lenguaje y preentrenamiento, no a instrucciones conversacionales afinadas. El prefijo "28" hace referencia a los 28 idiomas declarados en la model card, lo que lo convierte en una opcion interesante para tareas multilingues en contextos donde se requiere un modelo base.

La relevancia de esta publicacion reside en que ofrece el modelo original en multiples niveles de cuantizacion GGUF (desde Q2_K de 3,9 GB hasta f16 de 18,6 GB), lo que permite ejecutarlo en hardware de consumo y en entornos con recursos limitados mediante llama.cpp u otras herramientas compatibles con GGUF. Al ser un modelo de preentrenamiento (no instruido), su uso principal es el ajuste fino o la generacion de texto base, no el dialogo directo.

La ficha se centra en la version cuantizada, pero la mayoria de las especificaciones tecnicas (arquitectura, contexto, licencia) provienen del modelo base xiaomi-research/GemmaX2-28-9B-Pretrain, del cual no se dispone de model card detallada en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de la familia Gemma; no se detalla en la informacion) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0_4_4, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ar, bn, cs, de, en, es, fa, fr, he, hi, id, it, ja, km, ko, lo, ms, my, nl, pl, pt, ru, th, tl, tr, ur, vi, zh (28 idiomas) |
| Licencia | gemma (Gemma License) |
| Formato de pesos | GGUF (tambien disponible el modelo base en safetensors via xiaomi-research) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base xiaomi-research/GemmaX2-28-9B-Pretrain. Por el nombre y el tamano (9,2 B parametros), se infiere que pertenece a la familia Gemma, pero no se confirma en la documentacion disponible si se trata de un transformer denso, MoE o hibrido. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo es de tipo "Pretrain", lo que indica que no ha pasado por un proceso de alineacion para instrucciones.

La innovacion principal de esta publicacion es la disponibilidad de cuantizaciones estaticas en GGUF generadas por mradermacher, que permiten reducir el peso del modelo desde 18,6 GB (f16) hasta 3,9 GB (Q2_K). Ademas, el autor indica que existen cuantizaciones ponderadas/imatrix en un repositorio separado (GemmaX2-28-9B-Pretrain-i1-GGUF), que suelen ofrecer mejor calidad por tamano que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto base: al ser un modelo de preentrenamiento, puede continuar texto y generar contenido, pero no esta afinado para seguir instrucciones de forma fiable.
- Soporte multilingue: cubre 28 idiomas, incluidos espanol, ingles, aleman, frances, chino, japones, arabe, hindi y vietnamita, entre otros.
- Modelado de lenguaje: adecuado para tareas de continuacion, perplexity y evaluacion de representaciones linguisticas.
- Base para ajuste fino: al ser un modelo "pretrain", es un punto de partida para fine-tuning supervisado o instruccion.
- Tool calling / function calling: no disponible (no es un modelo instruido ni se documenta soporte).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Ajuste fino multilingue: el modelo puede servir como base para fine-tuning en 28 idiomas, aprovechando su cobertura linguistica para tareas de clasificacion, extraccion o generacion en lenguas con pocos recursos.
- Generacion de texto en entornos con recursos limitados: las cuantizaciones Q4_K_M (5,9 GB) y Q5_K_M (6,7 GB) permiten ejecutar el modelo en GPUs de consumo como la RTX 3060 de 12 GB o la RTX 4090, mediante llama.cpp u Ollama.
- Investigacion en modelado de lenguaje: util para calcular perplexity, evaluar representaciones y experimentar con tecnicas de cuantizacion en 28 idiomas.
- Prototipado de aplicaciones multilingues: permite validar pipelines de generacion de texto en idiomas como arabe, hindi o vietnamita antes de invertir en modelos mayores.
- Educacion e investigacion academica: su licencia Gemma y su disponibilidad en GGUF facilitan su uso en entornos universitarios con hardware modesto.
- Despliegue en CPU: la cuantizacion Q2_K (3,9 GB) y Q3_K_S (4,4 GB) permiten inferencia en CPU con llama.cpp, adecuada para pruebas y entornos sin GPU.
- Base para experimentos de cuantizacion: el repositorio ofrece 13 variantes de cuantizacion, lo que permite comparar calidad y rendimiento entre tipos (Q4_K_M, IQ4_XS, Q8_0, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q2_K: ~3,9 GB de pesos; ~5-6 GB de VRAM total con contexto moderado.
  - Q3_K_M: ~4,9 GB de pesos; ~6-7 GB de VRAM total.
  - Q4_K_M: ~5,9 GB de pesos; ~7-8 GB de VRAM total.
  - Q5_K_M: ~6,7 GB de pesos; ~8-9 GB de VRAM total.
  - Q6_K: ~7,7 GB de pesos; ~9-10 GB de VRAM total.
  - Q8_0: ~9,9 GB de pesos; ~11-12 GB de VRAM total.
  - f16: ~18,6 GB de pesos; ~20-22 GB de VRAM total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4090 (24 GB) para cuantizaciones altas; A100 o H100 para f16 y despliegues de produccion.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con Q4_K_M o Q5_K_M; en RTX 4090 con Q8_0 o f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI (no confirmado para esta version cuantizada).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| GemmaX2-28-9B-Pretrain-GGUF | 9,24 B | no disponible | Gemma | GGUF | Hugging Face (mradermacher) |
| Gemma 2 9B (referencia de familia) | 9,2 B | no disponible | Gemma | safetensors, GGUF | Hugging Face (Google) |
| Qwen2.5 7B | 7,6 B | no disponible | Apache 2.0 | safetensors, GGUF | Hugging Face (Alibaba) |
| Llama 3.1 8B | 8,0 B | no disponible | Llama 3.1 | safetensors, GGUF | Hugging Face (Meta) |

Nota: los datos de contexto y rendimiento de los modelos comparables no se detallan en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de preentrenamiento: no esta afinado para instrucciones, por lo que puede generar respuestas incoherentes o no seguir prompts de usuario de forma fiable.
- Riesgo de alucinacion: al no haber pasado por RLHF/DPO, la probabilidad de generar contenido factual incorrecto es alta.
- Sesgos conocidos: no se documentan en la informacion disponible, pero los modelos base suelen heredar sesgos de sus datos de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto; se desconoce si soporta ventanas largas.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso comercial y requiere aceptar los terminos de Google; es necesario revisar el archivo LICENSE del modelo base.
- Caveat para produccion: al ser una cuantizacion de un modelo base, no se recomienda su uso directo en atencion al cliente o agentes sin un fine-tuning previo.
- Idiomas: aunque se declaran 28 idiomas, no se garantiza un rendimiento uniforme en todos ellos; los idiomas con menos datos pueden tener calidad inferior.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/GemmaX2-28-9B-Pretrain-GGUF
- Modelo base: https://huggingface.co/xiaomi-research/GemmaX2-28-9B-Pretrain
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/GemmaX2-28-9B-Pretrain-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#GemmaX2-28-9B-Pretrain-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
