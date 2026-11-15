# anonymoushfname/magnet-ieeesp2027-version-hfpart

## Resumen

MAGNET es un artefacto de investigación publicado en Hugging Face que contiene los pesos de un sistema compuesto orientado a la investigacion de ataques y al analisis de procedencia (provenance graph) en el ambito de threat intelligence. No se trata de un unico modelo generativo, sino de una coleccion de checkpoints que conforman un pipeline por etapas: un cross-encoder de texto basado en RoBERTa, una rama de grafo propia, un matcher basado en LoRA sobre Qwen3.5-4B y un reviewer tambien basado en LoRA sobre Qwen3.5-4B.

El autor lo publica como material de replicacion asociado a un articulo (referenciado como IEEE SP 2027 en el identificador), con dos conjuntos de pesos: `models/`, entrenado con las entradas propias del artefacto sobre dos RTX A6000, y `paper/`, con los checkpoints que respaldan los resultados de las preguntas de investigacion RQ1-RQ4 del articulo. El repositorio ocupa 8,3 GB e incluye tambien baselines fine-tuneados sobre BERT, RoBERTa y DeBERTa-v3 base.

La relevancia es acotada y especifica: sirve para reproducir experimentos academicos de deteccion e investigacion de ataques, no como modelo de proposito general. La publicacion es anonima (autor `anonymoushfname`), sin licencia declarada, sin pipeline definido y sin idiomas especificados, lo que limita su uso fuera del contexto de revision por pares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-etapa: cross-encoder transformer (RoBERTa), rama de grafo propia, matcher y reviewer con LoRA sobre Qwen3.5-4B |
| Parametros totales | no disponible (composicion de varios checkpoints; el mayor es Qwen3.5-4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state_dict de PyTorch via `torch.load(..., weights_only=True)`) y `lora.pt` (LoRA state dicts) |

## Arquitectura y entrenamiento

El sistema se organiza en etapas. La etapa 1 combina un cross-encoder de texto fine-tuneado desde `FacebookAI/roberta-base` con una rama de grafo y un banco de casos benignos, fusionados mediante un umbral de late fusion seleccionado sobre validacion Silver (`models/seed0/step1/threshold.json`). La etapa 3 incorpora un matcher con LoRA de rango 64 sobre `Qwen/Qwen3.5-4B`, compartido entre ambas semillas, y un reviewer paso a paso tambien con LoRA sobre Qwen3.5-4B que corresponde a la fila "with additional stepwise review" de RQ4.

Los pesos de `models/` se entrenaron con las entradas propias del artefacto sobre dos GPU RTX A6000, de modo que el pipeline puede saltarse todas las fases de entrenamiento si se colocan en su sitio. Los pesos de `paper/` son los checkpoints originales del articulo, subidos sin modificacion, e incluyen baselines: Sentence-BERT fine-tuneado sobre RoBERTa y BERT (RQ3) y clasificadores de pares sobre BERT, RoBERTa y DeBERTa-v3 base (RQ4). Cada `model.pt` contiene el `state_dict` y un registro (`record`) con los hiperparametros de entrenamiento y las metricas de validacion Silver. La rama de grafo del articulo no se conservo como checkpoint y debe reentrenarse con `./run.sh train-step1`. No se detallan en la informacion disponible el volumen de tokens, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion y puntuacion de pares texto-grafo mediante cross-encoder (etapa 1), orientada a decidir si una entrada es maliciosa o benigna.
- Fusion tardia de senales textuales y estructurales (grafo) mediante umbral calibrado en validacion.
- Matching semantico entre consultas y candidatos mediante LoRA sobre Qwen3.5-4B (etapa 3).
- Revision paso a paso de decisiones del matcher mediante un segundo LoRA sobre Qwen3.5-4B.
- Analisis de procedencia (provenance graph) y trazabilidad de artefactos en investigaciones de ataques.
- Capacidades generativas y de razonamiento heredadas de Qwen3.5-4B solo en la medida en que los adaptadores LoRA las preserven; no se documentan modos thinking, vision ni audio.
- Soporte de tool calling, agentes y multilingueismo: no disponible en la informacion proporcionada.

## Casos de uso

- Replicacion de resultados academicos: cargar `paper/` y ejecutar `SEEDS=0 ./rq1.sh` para regenerar las tablas de RQ1-RQ4 y verificar las cifras del articulo antes de aceptar sus conclusiones.
- Evaluacion de la etapa 1 sin reentrenar: descargar `models/seed0/step1/text/`, `graph/` y `threshold.json` para obtener directamente las puntuaciones de fusion sobre el conjunto de validacion Silver.
- Analisis de procedencia en incidentes: usar la rama de grafo y el cross-encoder para puntuar relaciones entre artefactos de un ataque y reconstruir cadenas de procedencia en un corpus de threat intelligence.
- Comparacion de baselines: emplear `paper/baselines/rq4-pair-{bert,roberta,deberta}` para contrastar el rendimiento de clasificadores de pares frente al matcher LoRA sobre Qwen3.5-4B en la misma tarea.
- Revision asistida de decisiones: desplegar `paper/step3-reviewer/seed<S>/lora.pt` sobre Qwen3.5-4B para auditar paso a paso las salidas del matcher en un flujo de investigacion.
- Estudio de adaptadores de bajo rango: sustituir `models/matcher/lora.pt` por `paper/step3-matcher/lora.pt` para medir el efecto de distintos adaptadores LoRA de rango 64 sobre el mismo modelo base en tareas de matching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `results/reproduction-seed0.md`, que contiene las tablas generadas por los pesos de `models/` con `SEEDS=0 ./rq1.sh`, pero su contenido no se ha proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada; el componente mayor es Qwen3.5-4B con adaptadores LoRA de rango 64, y el resto son encoders base (RoBERTa, BERT, DeBERTa-v3 base).
- GPU de entrenamiento documentadas: dos NVIDIA RTX A6000 (48 GB cada una) para producir `models/`.
- GPU recomendadas para inferencia: no especificadas por el autor; por tamano, una GPU con al menos 16-24 GB cubriria el modelo base de 4B en precision reducida, aunque no se confirma en la informacion disponible.
- Cabe en GPU de consumo: no confirmado; el modelo base de 4B es compatible en principio con GPUs de 24 GB, pero el pipeline completo incluye varios checkpoints que deben cargarse segun la etapa.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el flujo previsto es la descarga via `hf download` y la ejecucion de scripts del repositorio de codigo (`./rq1.sh`, `./run.sh train-step1`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAGNET (este artefacto) | no disponible (compuesto; mayor base 4B) | no disponible | Investigacion de ataques y procedencia | no disponible | Hugging Face, autor anonimo |
| Qwen3.5-4B | 4B | no disponible en esta ficha | Generacion y razonamiento general | no disponible en esta ficha | Modelo base referenciado |
| RoBERTa-base | ~125M | 512 tokens (tipico en la familia) | Encoder de clasificacion | no disponible en esta ficha | Modelo base referenciado |
| DeBERTa-v3-base | ~86M (backbone) | no disponible en esta ficha | Encoder de clasificacion | no disponible en esta ficha | Modelo base referenciado |

No se dispone de datos de rendimiento comparativo entre MAGNET y alternativas; la comparacion anterior se limita a la relacion de dependencia (modelos base) y no a metricas.

## Limitaciones y advertencias

- Publicacion anonima: el autor figura como `anonymoushfname`, lo que impide verificar procedencia, mantenimiento o soporte.
- Sin licencia declarada: no hay base legal explicita para uso comercial ni para redistribucion; debe tratarse como material de revision restringido hasta que el articulo o el autor definan terminos.
- Sin idiomas declarados: no se puede asumir cobertura multilingue; los encoders base estan predominantemente entrenados en ingles.
- Sin pipeline ni metadatos estandar: descargas y likes a cero y ausencia de `pipeline_tag` indican que no es un modelo listo para produccion.
- Pesos en formato `model.pt` y `lora.pt` en lugar de safetensors, pese a la etiqueta del repositorio; requieren `torch.load` con `weights_only=True` y confianza en el origen del archivo.
- La rama de grafo del articulo no se conservo: la replicacion exacta de esa parte exige reentrenar con `./run.sh train-step1`, lo que introduce variabilidad respecto a los resultados publicados.
- Riesgo de alucinacion en las etapas basadas en Qwen3.5-4B (matcher y reviewer) no cuantificado en la informacion disponible.
- Sesgos: no documentados; al ser un sistema entrenado sobre datos de threat intelligence, puede heredar sesgos de ese corpus.
- Uso previsto acotado a investigacion y revision por pares; no hay evidencia de validacion fuera de los conjuntos Silver del articulo.

## Enlaces

- Hugging Face: https://huggingface.co/anonymoushfname/magnet-ieeesp2027-version-hfpart
- Modelo base texto: https://huggingface.co/FacebookAI/roberta-base
- Modelo base alternativo: https://huggingface.co/google-bert/bert-base-uncased
- Modelo base alternativo: https://huggingface.co/microsoft/deberta-v3-base
- Modelo base generativo: https://huggingface.co/Qwen/Qwen3.5-4B
