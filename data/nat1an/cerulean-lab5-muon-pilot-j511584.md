# Nat1an/cerulean-lab5-muon-pilot-j511584

## Resumen

cerulean-lab5-muon-pilot-j511584 es un modelo de generacion de texto entrenado desde inicializacion aleatoria por el usuario Nat1an (cerulean-labs), siguiendo la arquitectura de Llama-3.2-1B. No es un ajuste fino ni una destilacion: es un entrenamiento from-scratch sobre el corpus allenai/dolma3_mix-150B-1025, con 1.235.814.400 parametros (aproximadamente 1,24 mil millones) y una longitud de contexto de 8192 tokens.

Su interes tecnico no esta en el rendimiento final, sino en el procedimiento de optimizacion: emplea el optimizador Muon para las matrices ocultas y AdamW para la tabla de embeddings (atada a la salida) y los parametros de normalizacion. Este esquema hibrido Muon + AdamW es precisamente el recomendado en la literatura reciente sobre Muon a escala, y este repositorio constituye un punto de datos reproducible (con configuracion, curvas de evaluacion y resultado final publicados) sobre ese regimen a escala de 1B parametros.

Se trata de un artefacto de tipo pilot: solo se procesaron 2.062.548.992 tokens (unos 2,06 mil millones) en 14,7 horas de H200, lo que deja al modelo muy por debajo del presupuesto de entrenamiento tipico de un 1B utilizable. La perplejidad en heldout es de 16,9133, un valor alto que refleja ese subentrenamiento. Es, por tanto, material de investigacion sobre optimizadores y reproducibilidad de recetas, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama-3.2-1B) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; pesos originales en safetensors) |
| Idiomas soportados | no disponible (no declarado en la model card) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura Llama-3.2-1B (transformer decoder-only con atencion causal, normalizacion RMSNorm y tabla de embeddings atada a la capa de salida) pero partiendo de pesos inicializados aleatoriamente, sin herencia de ningun checkpoint previo. La innovacion declarada esta en el optimizador: Muon se aplica a las matrices ocultas y AdamW al resto de parametros. El ajuste de learning rate de Muon se realiza con la estrategia `match_rms_adamw`, con un pico de 0,001 para ambos optimizadores, betas de AdamW `[0.9, 0.95]`, momento 0,95 y weight decay de 0,1 para matrices y embeddings y 0,0 para los parametros de normalizacion. El schedule es `warmup_5_cosine_95` (5 por ciento de warmup y decaimiento coseno) medido en pasos de optimizador.

El entrenamiento consumio 2.062.548.992 tokens sobre el dataset allenai/dolma3_mix-150B-1025, con 262.144 tokens por actualizacion (batch efectivo), lo que implica del orden de 7.868 pasos de optimizador. Los documentos se barajaron con semilla 42 antes de la tokenizacion y los ultimos 50.000 documentos se excluyeron del entrenamiento, reservandose como conjunto heldout. La evaluacion se ejecuto dentro del propio entrenamiento sobre 1024 documentos, con truncado individual a 8192 tokens y perplejidad ponderada por tokens. Los 14,6998 H200-hours indican un regimen de computo modesto. No se documenta uso de RLHF, DPO ni ninguna fase de alineacion posterior al preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva basica en ingles (el modelo es un preentrenamiento sin ajuste de instrucciones).
- Continuacion de texto y modelado de lenguaje: la tarea para la que fue optimizado y evaluado (perplejidad).
- Ventana de contexto de 8192 tokens, suficiente para documentos de longitud media o conversaciones multi-turno cortas.
- No dispone de modo de razonamiento explicito, ni de tool calling, ni de function calling documentados.
- No se documenta soporte de agentes, multi-step reasoning ni planificacion.
- No se declaran capacidades de vision, audio ni multimodalidad.
- Capacidad multilingue: no declarada. El unico dato es el corpus de entrenamiento empleado (Dolma 3 mix), sin desglose por idioma publicado en esta ficha.
- No se ha aplicado ajuste de instrucciones ni de preferencias, por lo que no sigue instrucciones de forma fiable ni responde con formato conversacional.

## Casos de uso

- Reproduccion de recetas de optimizacion: el caso de uso mas solido es experimental. Sirve para estudiar el comportamiento de Muon frente a AdamW en matrices ocultas a escala de 1B parametros, ya que se publican configuracion, curvas de evaluacion y perplejidad final.
- Investigacion sobre subentrenamiento: con solo 2,06 mil millones de tokens, es un punto de referencia util para estudiar como escala la perplejidad con el presupuesto de tokens en regimenes muy por debajo de Chinchilla.
- Punto de partida para ajuste fino: su tamano (1,24B) permite continuar el entrenamiento en una unica GPU de gama alta; un equipo puede tomar estos pesos y aplicar SFT o DPO para tareas concretas en lugar de partir de cero.
- Pruebas de infraestructura y pipelines: al ser un modelo pequeno y ligero, es adecuado para validar cadenas de despliegue (TGI, vLLM, transformers), plantillas de chat y monitorizacion antes de pasar a modelos mayores.
- Experimentos academicos de comparacion con Llama-3.2-1B oficial: permite aislar el efecto del optimizador y del corpus frente a un modelo de arquitectura identica entrenado con un presupuesto de tokens mucho mayor.
- Generacion de texto de continuacion en dominios acotados: si se ajusta sobre un corpus especifico (por ejemplo, documentacion tecnica o textos legales concretos), puede emplearse como modelo de completado especializado a bajo coste de inferencia.
- Clasificacion y etiquetado por perplejidad: al ser un modelo de lenguaje puro, puede usarse para puntuar la verosimilitud de secuencias y construir clasificadores de estilo o de dominio mediante umbrales de perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion facilitado por el autor es la perplejidad en heldout.

| Metrica | Valor | Detalle |
|---|---|---|
| Perplejidad heldout (token-weighted) | 16,9133 | 1024 documentos, truncado a 8192 tokens, evaluacion dentro del entrenamiento |
| Tokens de entrenamiento procesados | 2.062.548.992 | Corpus allenai/dolma3_mix-150B-1025 |
| H200-hours | 14,6998 | Coste de computo total del run |
| MMLU / HumanEval / GSM8K | no disponible | No publicados |

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 2,5 GB para los pesos (1.235.814.400 parametros a 2 bytes), mas cache KV.
- VRAM en FP32: aproximadamente 5 GB solo para pesos.
- VRAM en INT8: aproximadamente 1,3 GB.
- VRAM en cuantizacion de 4 bits (si se generase un GGUF Q4): aproximadamente 0,7-0,8 GB.
- Cache KV a 8192 tokens: estimacion del orden de 200-300 MB asumiendo atencion con query grouping, valor no confirmado en la model card.
- Cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en tarjetas de 8 GB si se cuantiza.
- GPU de datacenter: el entrenamiento se realizo en H200; para inferencia son suficientes A100, H100, L40S o cualquier GPU moderna.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` en el repo) y, previsiblemente, vLLM por compatibilidad de arquitectura Llama. La etiqueta `endpoints_compatible` indica compatibilidad con el esquema de Inference Endpoints de Hugging Face.
- No se publican pesos en formato GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa no incluida en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La comparacion se limita a escala, contexto, licencia y disponibilidad, porque el modelo de este repositorio no tiene benchmarks publicados y seria enganoso enfrentarlo por rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| cerulean-lab5-muon-pilot-j511584 | 1,24B | 8192 | llama3.2 | Hugging Face, 0 descargas | Solo perplejidad heldout (16,9133) |
| Llama-3.2-1B (Meta) | 1,24B | 128.000 | Llama 3.2 Community License | Hugging Face, ampliamente desplegado | Si, publicados por Meta |
| Qwen2.5-1.5B | 1,54B | 32.768 | Apache 2.0 | Hugging Face, ampliamente desplegado | Si, publicados por Alibaba |
| SmolLM2-1.7B | 1,71B | 8192 | Apache 2.0 | Hugging Face, ampliamente desplegado | Si, publicados por Hugging Face |

La diferencia clave no esta en la arquitectura, identica a Llama-3.2-1B, sino en el presupuesto de entrenamiento: el modelo de este repositorio vio 2,06 mil millones de tokens frente a ordenes de magnitud superiores en los modelos de referencia. Eso lo situa como pieza de investigacion sobre optimizadores, no como alternativa funcional a los modelos de la tabla.

## Limitaciones y advertencias

- Subentrenamiento severo: 2,06 mil millones de tokens para 1,24B parametros esta muy por debajo de lo necesario para un modelo utilizable; la perplejidad heldout de 16,9133 es alta y anticipa salidas incoherentes con frecuencia.
- Sin ajuste de instrucciones ni alineacion: no sigue instrucciones, no mantiene formato conversacional fiable y no ha pasado por RLHF ni DPO. Puede generar contenido toxico o sesgado sin filtro alguno.
- Riesgo elevado de alucinacion: al ser un preentrenamiento sin anclaje factual, cualquier afirmacion que genere debe verificarse.
- Sesgos conocidos: no disponibles. El autor no publica analisis de sesgo del modelo resultante; el corpus Dolma 3 puede introducir los sesgos propios de los datos web.
- Idiomas: no declarados. No hay garantia de calidad fuera de los idiomas dominantes del corpus de entrenamiento.
- Limitacion de contexto: 8192 tokens, muy inferior a los 128.000 del Llama-3.2-1B original, lo que restringe tareas de contexto largo.
- Licencia: se hereda la Llama 3.2 Community License. Esto no es una licencia permisiva tipo Apache 2.0; incluye la clausula de licencia comunitaria y obligaciones de atribucion y nomenclatura, y restricciones especificas para el uso por parte de entidades con mas de 700 millones de usuarios mensuales. Conviene revisar el texto completo antes de cualquier uso comercial.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado el 7 de octubre de 2026 y actualizado trece minutos despues. No hay garantia de mantenimiento ni de soporte.
- Ausencia de versiones cuantizadas y de pesos GGUF: desplegarlo en entornos ligeros exige conversion manual.
- No apto para produccion: por presupuesto de entrenamiento, licencia y ausencia de evaluacion de seguridad, debe tratarse como material de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nat1an/cerulean-lab5-muon-pilot-j511584
- Run de entrenamiento en Weights & Biases: https://wandb.ai/cerulean-labs/lab5-training-llama/runs/kyzatb1t
- Dataset de entrenamiento (Dolma 3 mix): https://huggingface.co/datasets/allenai/dolma3_mix-150B-1025
- Articulo original de Muon (Keller Jordan): https://kellerjordan.github.io/posts/muon/
- Ficha del paper "Muon is Scalable for LLM Training": https://www.aimodels.fyi/papers/arxiv/muon-is-scalable-llm-training
- Endpoint de inferencia de otro modelo de la misma serie: https://friendli.ai/models/Nat1an/cerulean-lab4-u5-53a81c9b
- Repositorio de otro modelo de la serie en Hugging Face: https://huggingface.co/Nat1an/cerulean-lab4-u22-e6bb8512/tree/main
