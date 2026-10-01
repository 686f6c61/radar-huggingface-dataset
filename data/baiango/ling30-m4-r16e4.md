# baiango/ling30-m4-r16e4

## Resumen

baiango/ling30-m4-r16e4 es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base inclusionAI/Ling-3.0-tiny, un MoE de 7,9 mil millones de parametros con 128 expertos enrutados y atencion lineal hibrida (arquitectura `bailing_hybrid`). El adaptador no entrena el modelo desde cero: modifica unicamente las proyecciones de atencion del base para especializarlo en ficcion literaria realista de formato corto, con prosa de viñeta centrada en personajes, en la linea de los relatos estadounidenses de mediados del siglo XX.

Se trata de la version "clean-data" de un adaptador anterior (m3, no publicado): la receta es identica, pero el corpus de entrenamiento fue limpiado automaticamente de tics estilisticos "uncanny" (objetos o maquinas descritos como si estuvieran vivos, sensaciones innombrables, personificaciones invertidas) antes de entrenar. El resultado, segun la model card, reduce la tasa de tics de 3,2-7,9 por cada 1.000 palabras del modelo anterior a 1,08 (greedy) y 1,78 (muestreado), frente a una referencia humana de 1,41.

Su relevancia es doble: por un lado, demuestra un flujo de ajuste fino muy ligero (21 MB de deltas en bf16, entrenados en una unica GPU de 24 GB) sobre una arquitectura MoE poco convencional que requiere `trust_remote_code=True`; por otro, publica artefactos de trazabilidad (dataset, curvas de loss, bateria de generacion) que permiten reproducir y auditar el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre base MoE `bailing_hybrid` con 128 expertos enrutados y atencion lineal hibrida |
| Parametros totales | Adaptador: 21 MB de deltas en bf16. Modelo base: 7,9 mil millones de parametros |
| Parametros activos | no disponible (el base es MoE de 128 expertos enrutados, pero el numero de parametros activos por token no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Adaptador en bf16; GGUF UD-Q4_K_M (embeddings/output en q8_0, calibrado con imatrix) publicado en repo complementario |
| Idiomas soportados | no disponible (el corpus de ajuste esta integramente en ingles) |
| Licencia | MIT (adaptador) |
| Formato de pesos | safetensors (deltas LoRA); GGUF en el repo baiango/ling30-m4r16 |

## Arquitectura y entrenamiento

El modelo base, Ling-3.0-tiny, es un transformer con mezcla de expertos (`bailing_hybrid`) que combina 128 expertos enrutados con atencion lineal hibrida. Su implementacion no esta en transformers estandar, por lo que requiere `trust_remote_code=True`. El adaptador LoRA se aplica con rango 16 y alpha 32, dropout 0,05, y afecta exclusivamente a las proyecciones de atencion: `q_a_proj`, `q_b_proj`, `kv_a_proj_with_mqa`, `kv_b_proj` y `q/k/v/o_proj`. Esta restriccion de alcance explica el tamano del artefacto (21 MB). El entrenamiento se ejecuto durante 4 epocas con learning rate 1e-4, scheduler coseno, precision bf16, micro-batch de 1 con acumulacion de gradiente de 8, atencion eager, `peft==0.20.0` y `transformers==4.57.6`, sobre una unica GPU RTX 3090 de 24 GB. El checkpoint desplegado es el 186, correspondiente al final de la tercera epoca.

El corpus de ajuste son aproximadamente 500 viñetas de genero corto, publicadas como dataset baiango/genre500 (494 documentos de entrenamiento y 6 de validacion). El material es sintetico: prosa destilada de modelos docentes de frontera, adjudicada automaticamente y posteriormente depurada de tics surrealistas antes de este entrenamiento. No se usaron libros ni ficcion extraida de la web. La innovacion metodologica mas destacable no esta en la arquitectura sino en la seleccion de checkpoint: en lugar de elegir por loss de evaluacion, se uso una bateria de generacion pareada por epoca (censo de tics, test de repeticion con zlib y escaneo de bucles duplicados sobre 24 prompts fijos, en modo greedy y muestreado). La limpieza del corpus elimino el acantilado de repeticion que aparecia en la cuarta epoca con datos sin depurar.

## Capacidades

- Generacion de texto narrativo en ingles, especializada en ficcion literaria realista de formato corto.
- Escritura de viñetas de prosa centradas en personajes, con registro cercano al relato estadounidense de mediados de siglo.
- Control de repeticion y de bucles duplicados: cero frases con bucle detectadas en la bateria de evaluacion.
- Reduccion medible de tics estilisticos surrealistas respecto al adaptador entrenado con datos sin depurar.
- Compatibilidad con decodificacion muestreada (temperatura 1,0, top_p 0,95 en el ejemplo de la model card) y con greedy.
- Integracion con el ecosistema PEFT: carga sobre el base, fusion con `merge_and_unload` y guardado de pesos fusionados.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (corpus de entrenamiento solo en ingles).
- Vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Generacion de ficcion corta para revistas literarias o antologias: el adaptador produce viñetas de prosa realista con tics controlados, lo que reduce la edicion posterior necesaria frente a un modelo generico sin ajustar.
- Asistente de escritura creativa: dado un prompt situacional ("un revisor de transbordador en el ultimo viaje de la noche"), genera escenas completas de hasta 400 tokens con decodificacion muestreada, util como borrador inicial para autores.
- Aumento de datos para proyectos de ficcion: su corpus de entrenamiento y su comportamiento estilistico controlado lo hacen adecuado para generar variantes de escenas que alimenten conjuntos de datos literarios posteriores.
- Investigacion sobre estilosidad y repeticion en modelos generativos: la bateria de evaluacion publicada (censo de tics, zlib, escaneo de bucles) sirve como metodologia replicable para medir deriva estilistica en adaptadores LoRA.
- Experimentacion con ajuste fino de MoE poco convencionales: su receta (micro-batch 1, atencion eager, un solo GPU de 24 GB) es un caso de referencia para entrenar sobre `bailing_hybrid` sin infraestructura de gran escala.
- Transferencia de estilo hacia prosa realista de mediados de siglo: util en proyectos editoriales o educativos que necesiten imitar ese registro de forma consistente.
- Despliegue ligero en local mediante GGUF: la version UD-Q4_K_M permite ejecutar el modelo fusionado en equipos de gama de consumo para demos interactivas de escritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card si reporta una evaluacion interna propia, basada en el censo de tics por cada 1.000 palabras y en el analisis de repeticion:

| Metrica (bateria interna) | Este adaptador (m4) | Adaptador m3 (datos sin depurar, no publicado) | Referencia humana |
|---|---|---|---|
| Tics por 1.000 palabras (greedy) | 1,08 | 3,2-7,9 | 1,41 |
| Tics por 1.000 palabras (muestreado) | 1,78 | no disponible | 1,41 |
| Frases con bucle duplicado | 0 | no disponible | no aplica |
| zlib (banda limpia) | si | no disponible | no aplica |

Las metricas de tics no son comparables con benchmarks academicos: miden la frecuencia de construcciones estilisticas marcadas en generaciones controladas sobre 24 prompts fijos.

## Requisitos de hardware

- Adaptador solo: 21 MB en bf16, cabe en cualquier GPU, CPU o incluso en memoria no acelerada.
- Modelo base en bf16: aproximadamente 16 GB solo de pesos para 7,9 mil millones de parametros, mas overhead de activaciones y cache KV. En la practica, entre 18 y 22 GB de VRAM estimados.
- Modelo fusionado en GGUF UD-Q4_K_M: alrededor de 5 GB, segun la cuantizacion publicada en el repo complementario.
- GPU recomendadas (bf16): RTX 3090 o 4090 (24 GB), A100 40/80 GB, H100. La RTX 3090 de 24 GB es la que se uso para el entrenamiento.
- GPU de gama de consumo: el GGUF Q4_K_M deberia caber en tarjetas de 6-8 GB (RTX 3060, RTX 4060 Ti, Apple Silicon unificado), aunque esto es una estimacion aritmetica, no un dato verificado en la model card.
- Opciones de despliegue: transformers + peft (pila exacta: `peft==0.20.0`, `transformers==4.57.6`, `trust_remote_code=True`), llama.cpp u Ollama a partir del GGUF, y la demo publicada en Hugging Face Spaces. Soporte en vLLM o TGI: no confirmado para la arquitectura `bailing_hybrid`.
- Latencia y throughput estimados: no disponibles.
- Nota de compatibilidad: para fusionar el adaptador con `transformers >= 4.53` hay que anular `top_p` y `top_k` de `generation_config.json` antes de `save_pretrained`, y restablecer `config.model_type` y `torch_dtype` tras el guardado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (tics/1kw) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| baiango/ling30-m4-r16e4 | 21 MB (LoRA sobre base de 7,9B) | no disponible | 1,08 greedy / 1,78 muestreado | MIT | Publico en HF |
| inclusionAI/Ling-3.0-tiny (base) | 7,9B (MoE, 128 expertos) | no disponible | no disponible | no disponible | Publico en HF |
| ling30-m3-r16clean (predecesor) | 21 MB (LoRA sobre el mismo base) | no disponible | 3,2-7,9 greedy | no disponible | No publicado |
| Adaptadores literarios genericos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

El adaptador m3 se incluye como referencia porque la propia model card lo usa como punto de comparacion directo para medir el efecto de la depuracion del corpus, aunque nunca se publico.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar inclusionAI/Ling-3.0-tiny, con ejecucion de codigo remoto (`trust_remote_code=True`), lo que introduce un riesgo de seguridad en el pipeline.
- El corpus y las capacidades estan limitados al ingles. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- La especializacion es muy estrecha: ficcion literaria realista de formato corto. Es probable que degrade el rendimiento en tareas de razonamiento, codigo, matematicas o dialogo instructivo respecto al base sin ajustar.
- Riesgo de alucinacion y de deriva estilistica en generaciones largas: la model card solo valida escenas de hasta 400 tokens nuevos.
- Los tics estilisticos no se eliminan por completo (1,08-1,78 por 1.000 palabras frente a 1,41 de referencia humana), por lo que sigue requiriendo revision editorial.
- Efecto de fusion mal documentado: el flujo `merge_and_unload` tiene incompatibilidades conocidas con `transformers >= 4.53` (fallo al guardar `generation_config`, renombrado de `torch_dtype` a `dtype`) que pueden romper despliegues en produccion si no se aplican los parches indicados.
- El soporte en motores de inferencia de alto rendimiento (vLLM, TGI) no esta confirmado para la arquitectura `bailing_hybrid`.
- Aunque el adaptador es MIT, la licencia del modelo base no se especifica en la informacion proporcionada; antes de un uso comercial hay que verificar las condiciones de inclusionAI/Ling-3.0-tiny por separado.
- El entrenamiento se hizo con micro-batch 1 y acumulacion de gradiente 8 en una unica GPU; la receta se describe como critica para esta arquitectura (el barajado por lotes contamina la loss), lo que dificulta el reentrenamiento a mayor escala.
- El dataset de origen es sintetico y destilado de modelos docentes de frontera: pueden persistir sesgos heredados de esos modelos, ademas de los estilisticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baiango/ling30-m4-r16e4
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/baiango/genre500
- GGUF UD-Q4_K_M del modelo fusionado: https://huggingface.co/baiango/ling30-m4r16
- Demo publicada: https://huggingface.co/spaces/baiango/ling30-m4r16-demo
- Dockerfile de la demo: https://huggingface.co/spaces/baiango/ling30-m4r16-demo/blob/main/Dockerfile
- Guia de despliegue local de la familia Ling 3.0 (Ollama, vLLM, Docker): https://www.aimadetools.com/blog/how-to-run-ling-3-0-flash-locally/
- Anuncio de la familia Ling-3.0 en ModelScope: https://modelscope.csdn.net/6a87b327662f9a54cb9f118a.html
