# mradermacher/Qwen3.6-35B-A3B-Westernized-i1-GGUF

## Resumen

Qwen3.6-35B-A3B-Westernized-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo hirundo-io/Qwen3.6-35B-A3B-Westernized, una variante del Qwen3.6-35B-A3B de Alibaba sometida a un proceso de *behavioral unlearning* (desaprendizaje conductual) y fusionada, orientada a eliminar o atenuar determinados comportamientos no deseados. El modelo base emplea una arquitectura Mixture-of-Experts (MoE) con 35.505.251.456 parametros totales y activacion de aproximadamente 3B por token, segun indica el sufijo A3B del nombre.

El repositorio no contiene pesos en precision completa, sino un conjunto de ficheros GGUF cuantizados con la tecnica i1 (imatrix) de mradermacher, que emplea una matriz de importancia para mejorar la calidad de las cuantizaciones de baja precision. Se ofrecen variantes desde i1-Q2_K (13,3 GB) hasta i1-Q6_K (29,3 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con 16 GB de VRAM hasta estaciones de trabajo con multiples aceleradores.

La relevancia actual reside en dos factores: por un lado, la posibilidad de ejecutar un modelo MoE de 35B parametros con requisitos de computo propios de un modelo de ~3B activos gracias a la esparsidad del MoE; por otro, el caracter "Westernized" del modelo base, que lo hace interesante para quienes necesitan un ajuste de alineamiento distinto al del Qwen original. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, segun tags del repositorio |
| Parametros totales | 35.505.251.456 |
| Parametros activos | aproximadamente 3B por token (inferido del sufijo A3B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | en (segun metadatos de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base dispone de safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts, tal como indican los tags `moe` del repositorio y el sufijo A3B del nombre. Los 35.505.251.456 parametros totales se reparten entre multiples expertos, de los que solo una fraccion (~3B) se activa por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano. El modelo base ha sido sometido a un proceso de *behavioral unlearning* y posteriormente fusionado (`merged`), orientado a modificar comportamientos especificos del Qwen3.6 original; el autor no detalla en la model card ni la metodologia de desaprendizaje ni la composicion del dataset empleado.

Las cuantizaciones de este repositorio se han generado con la tecnica i1 de mradermacher, que utiliza un fichero imatrix (matriz de importancia) para ponderar la cuantizacion de cada tensor y mejorar la calidad respecto a cuantizaciones estaticas del mismo tamano. El repositorio incluye el propio fichero imatrix (0,5 GB) para quien quiera generar cuantizaciones propias. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline asociado indican uso en dialogos multi-turno.
- Razonamiento y codigo: capacidades heredadas del Qwen3.6-35B-A3B base (no detalladas en la model card).
- Vision: la model card indica explicitamente que es un modelo de vision y que los ficheros mmproj, si existen, estan en el repositorio estatico hermano.
- Soporte multilingue limitado: los metadatos solo declaran `en`; no se confirman otros idiomas.
- Comportamiento "Westernized": el ajuste de desaprendizaje conductual busca modificar respuestas del modelo original en determinadas areas.
- Tool calling y agentes: no confirmado en la informacion disponible.

## Casos de uso

- Despliegue en GPU de consumo: la variante i1-Q4_K_M (21,8 GB) o i1-IQ4_XS (19,3 GB) permite ejecutar un MoE de 35B en GPUs con 24 GB de VRAM (RTX 3090/4090) usando llama.cpp u Ollama, con velocidad cercana a un modelo de ~3B activos.
- Servicio de chat conversacional: el tag `conversational` y la ventana de contexto del modelo base (no confirmada) lo hacen apto para atender dialogos multi-turno en ingles.
- Experimentacion con alineamiento alternativo: util para investigadores que quieran comparar el comportamiento del Qwen3.6 original frente a la variante Westernized en tareas sensibles.
- Prototipado de pipelines de vision-lenguaje: al ser un modelo de vision, puede emplearse con los ficheros mmproj del repositorio estatico para tareas de descripcion de imagenes o VQA, siempre que se valide el soporte en llama.cpp.
- Inferencia en CPU o entornos con poca VRAM: la variante i1-Q2_K (13,3 GB) permite ejecucion parcial en CPU con llama.cpp, aunque con perdida de calidad notable.
- Generacion de cuantizaciones propias: el fichero imatrix incluido permite a equipos con infraestructura propia generar variantes a medida con `llama-quantize`.
- Fine-tuning ligero sobre GGUF: no recomendado directamente, pero el modelo base en safetensors permite LoRA y posterior cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - i1-Q2_K: ~13,3 GB de pesos; ~16 GB de VRAM con contexto moderado.
  - i1-IQ4_XS: ~19,3 GB; ~22-24 GB de VRAM.
  - i1-Q4_K_M: ~21,8 GB; ~24-26 GB de VRAM.
  - i1-Q5_K_M: ~25,4 GB; ~28-30 GB de VRAM.
  - i1-Q6_K: ~29,3 GB; ~32 GB o mas de VRAM.
- GPU recomendadas:
  - RTX 4090 / 3090 (24 GB): i1-IQ4_XS o i1-Q4_K_M con offload parcial de capas a CPU si el contexto es largo.
  - RTX 5090 / A6000 (32-48 GB): i1-Q5_K_M o i1-Q6_K con contexto amplio.
  - A100 40/80 GB o H100: cuantizaciones altas con contexto completo y mayor throughput.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 o IQ4; en GPUs de 16 GB solo con Q2_K o IQ3 y offload parcial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para produccion a gran escala conviene usar el modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Westernized-i1-GGUF (este) | 35,5B totales / ~3B activos | no disponible | Apache 2.0 | GGUF | Cuantizaciones imatrix, vision, ajuste Westernized |
| Qwen3.6-35B-A3B (original) | 35,5B totales / ~3B activos | no disponible | Apache 2.0 | safetensors, GGUF | Sin desaprendizaje conductual; comportamiento original |
| hirundo-io/Qwen3.6-35B-A3B-Westernized | 35,5B totales / ~3B activos | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar de este repositorio |
| mradermacher/Qwen3.6-35B-A3B-Westernized-GGUF | 35,5B totales / ~3B activos | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas, incluye mmproj de vision |

## Limitaciones y advertencias

- El proceso de *behavioral unlearning* puede degradar capacidades generales del modelo original; no se han publicado evaluaciones comparativas que cuantifiquen la perdida.
- El autor no documenta la metodologia de desaprendizaje ni los comportamientos objetivo, lo que dificulta auditar el ajuste.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado tasas de error.
- Idioma declarado unicamente `en`; el rendimiento en castellano u otros idiomas no esta verificado.
- Longitud de contexto no confirmada en la model card; verificar en el modelo base antes de usarlo en produccion.
- Las cuantizaciones de baja precision (Q2_K, IQ3) degradan la calidad de forma significativa; para produccion se recomienda Q4_K_M o superior.
- El soporte de vision depende de ficheros mmproj alojados en el repositorio estatico; no todos los runtimes GGUF soportan vision de forma estable.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del Qwen3.6 original.
- El repositorio tiene 0 likes y 2.516 descargas en el momento de la consulta; no hay validacion comunitaria extensa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Westernized-i1-GGUF
- Modelo base: https://huggingface.co/hirundo-io/Qwen3.6-35B-A3B-Westernized
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Westernized-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Westernized-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
