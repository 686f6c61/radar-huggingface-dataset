# OpenSML/OpenSML-Base-175M

## Resumen

OpenSML-Base-175M es un modelo de lenguaje causal en inglés, de 175.611.648 parámetros, entrenado desde inicialización aleatoria por William Zebrowski (organización OpenSML). Se trata de un modelo base (pretrained) orientado a continuación de texto y a ajuste fino posterior, no a diálogo: no incluye plantilla de chat ni adaptadores de instrucciones. Es el antecesor preentrenado de OpenSML-JSONLite-175M-Instruct.

La arquitectura es un transformer decoder-only de 24 capas con anchura oculta 768, FFN de 2.048 y atención GQA (12 cabezas de consulta, 4 de clave/valor, dimensión 64), con RMSNorm, normalización de Q/K, RoPE base 10.000, SwiGLU y embeddings atados. La ventana de contexto es de 2.048 tokens y el vocabulario es un BPE byte-level congelado de 32.000 tokens.

Su relevancia es de investigación: demuestra un preentrenamiento distribuido de 17.300.111.360 posiciones de token sobre un clúster de cinco Mac Apple Silicon con Thunderbolt/RDMA, con pesos publicados en BF16 sin cuantizar y un runner nativo en MLX (no compatible con `transformers.AutoModel` ni `mlx_lm.load`). El checkpoint publicado quedó por debajo del presupuesto original de 30B posiciones declarado como objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, con GQA, RMSNorm, Q/K normalization, RoPE y SwiGLU |
| Parametros totales | 175.611.648 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible; solo se publican pesos BF16 sin cuantizar y las exportaciones cuantizadas no han sido validadas |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16, `model.safetensors`) |
| Capas del transformer | 24 |
| Anchura oculta / FFN | 768 / 2.048 |
| Atencion | GQA: 12 cabezas de consulta, 4 cabezas KV, dimension de cabeza 64 |
| Normalizacion | RMSNorm y normalizacion Q/K |
| Codificacion posicional | RoPE, base 10.000 |
| MLP | SwiGLU |
| Embeddings | Entrada/salida atados |
| Sesgos lineales | Desactivados |
| Vocabulario | BPE byte-level congelado de 32.000 tokens |
| Libreria / runtime verificado | MLX 0.32.3 sobre Apple Silicon macOS, Python 3.11 |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado con prediccion de siguiente token. Usa 24 capas de 768 dimensiones ocultas, FFN de 2.048 con SwiGLU, RMSNorm y normalizacion adicional sobre Q y K, RoPE con base 10.000 y atencion con query grouping (12 cabezas Q, 4 KV). Los embeddings de entrada y salida estan atados, no hay sesgos en las capas lineales y el tokenizador es un BPE byte-level congelado de 32.000 tokens reutilizado de un tokenizador OpenSML anterior; sus identificadores estructurales son pad 0, fin de documento 1, inicio de turno 2 y fin de turno 3, aunque el runner base trabaja con texto crudo. Los pesos de OpenSML-150M no inicializaron este modelo.

El preentrenamiento proceso 17.300.111.360 posiciones de token acumuladas, con una mezcla de muestreo configurada de FineWeb-Edu (50%), DCLM-Edu (18%), English FineWiki (13%), Cosmopedia v2 (9%) y un espejo de texto educativo de Python (10%); son pesos de muestreo de tokens, no cuotas de documentos unicos. El entrenamiento se ejecuto en un cluster de cinco Mac Apple Silicon con Thunderbolt/RDMA, con AdamW (betas 0,9 y 0,95, epsilon 1e-8, weight decay 0,1, gradient clipping 1,0) y pesos maestros y momentos en FP32. El pico nominal de learning rate fue 3e-4, con un controlador adaptativo de meseta que aplico nueve reducciones hasta una tasa efectiva de 3,221225472e-5. La validacion se realizaba cada 50M tokens con paciencia 12, cooldown 10 y delta minimo 0,002. No se documento RLHF, DPO ni SFT para este checkpoint.

## Capacidades

- Generacion de texto por continuacion de prefijo en ingles (completion), sin plantilla de chat.
- Punto de partida para ajuste fino supervisado, DPO u otros esquemas posteriores.
- Modelado de lenguaje sobre texto educativo, Wikipedia, escritura educativa sintetica y Python.
- Capacidad destacada en Python dentro del panel de validacion interno, con la menor perdida de las cinco fuentes medidas (1,2725).
- Contexto limitado a 2.048 tokens; el runner rechaza peticiones que excedan ese presupuesto en lugar de truncarlas silenciosamente.
- Decodificacion greedy por defecto; muestreo opcional con `--temperature` y `--seed`.
- No se documenta soporte de tool calling, function calling, modo agente, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se documenta capacidad multilingue mas alla del ingles; el campo de idioma declarado es unicamente `en`.

## Casos de uso

- Ajuste fino supervisado para dominios concretos: al ser un modelo base sin SFT, es un punto de partida limpio para entrenar tareas especificas (clasificacion, extraccion, resumen) con un coste de computo muy bajo.
- Generacion de codigo Python asistida: su menor perdida de validacion se da en la fuente de Python, lo que lo hace util como base para autocompletado de scripts educativos o generacion de docstrings tras un ajuste fino.
- Investigacion en preentrenamiento de modelos pequenos: permite reproducir curvas de perdida, recetas de mezcla de datos y experimentos de tokenizador sobre un artefacto ya entrenado y con metadatos de checkpoint publicados.
- Generacion aumentada con recuperacion (RAG) simple en ingles: con 2.048 tokens de contexto puede concatenar unos pocos fragmentos recuperados y generar una respuesta extractiva tras un ajuste fino.
- Entrenamiento por destilacion: util como alumno pequeno que aprende de las salidas de un modelo mayor, dado su tamano reducido (0,35 GB en BF16) y su facilidad de despliegue en memoria unificada de Apple Silicon.
- Complemento educativo: completar frases y parrafos sobre textos de tipo escolar o enciclopedico, coherente con el dominio de entrenamiento (FineWeb-Edu, FineWiki, Cosmopedia).
- Experimentacion local en portatiles Apple Silicon: el runtime verificado (MLX) permite ejecutar inferencia offline sin GPU dedicada, util para pruebas de investigacion y docencia.
- Prototipado de pipelines de evaluacion de modelos pequenos (perplejidad, perdida por fuente) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de referencia (MMLU, ARC, IFEval, HumanEval, GSM8K u otros) para el hash de pesos de este artefacto. La model card indica explicitamente que no se encontro ningun resultado de benchmark downstream verificado para este checkpoint en su inventario, y que las puntuaciones de extraccion de JSONLite y otras puntuaciones ARC/IFEval de OpenSML no son atribuibles a este modelo. Los unicos datos publicados son metricas internas de validacion sobre documentos:

| Metrica | OpenSML-Base-175M |
|---|---|
| Perdida de validacion fija sobre documentos | 2,5563359552 |
| Perplejidad | 12,8885 |
| Perdida en FineWeb-Edu | 2,9417 |
| Perdida en DCLM-Edu | 2,9943 |
| Perdida en FineWiki | 1,9878 |
| Perdida en Cosmopedia | 1,7874 |
| Perdida en Python | 1,2725 |

El panel de validacion consta de 32 lotes por fuente, tamano de lote 2, cinco fuentes y secuencias de 2.048 tokens, con agregacion segun la mezcla de entrenamiento. No hay comparacion con otros modelos publicada en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: 175.611.648 parametros x 2 bytes = aproximadamente 351 MB (0,33 GiB); el repositorio completo ocupa 0,4 GB.
- VRAM estimada para inferencia: no disponible de forma oficial; los pesos caben en cualquier GPU con mas de 1 GB, pero el consumo de activaciones a 2.048 tokens no esta documentado.
- GPU recomendadas: no disponibles. El unico entorno verificado es Apple Silicon con MLX 0.32.3, Python 3.11 y macOS.
- Compatibilidad con GPU de consumidor: teoricamente viable por tamano, pero CUDA, CPU-only, cuantizacion y exportaciones convertidas no han sido validadas por el autor.
- Opciones de despliegue: runner nativo de MLX incluido en el repositorio. No es compatible con `transformers.AutoModel` ni con `mlx_lm.load`; no hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF publicados.
- Latencia y throughput: no disponibles.
- Entrenamiento: cinco Mac Apple Silicon distribuidos con Thunderbolt/RDMA, pesos maestros y momentos en FP32.
- Ejecucion offline una vez descargados los artefactos y las dependencias; el runner raiz verifica el SHA-256 del fichero de pesos y del bundle de origen.

## Comparativa con modelos similares

Los datos de la columna de OpenSML-Base-175M proceden de su model card. Los de los modelos alternativos son valores de referencia publicos de sus respectivas model cards y no se han verificado en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OpenSML-Base-175M | 175,6M | 2.048 | No disponible | MLX + safetensors, runner nativo |
| SmolLM-135M | 135M (aprox.) | 2.048 (aprox.) | Apache-2.0 (referencia publica) | safetensors, transformers |
| Pythia-160M | 160M (aprox.) | 2.048 (referencia publica) | Apache-2.0 (referencia publica) | safetensors, transformers |
| Qwen2.5-0.5B | 494M (aprox.) | 32.768 (referencia publica) | Apache-2.0 (referencia publica) | safetensors, transformers, GGUF |

No hay datos publicados que permitan comparar el rendimiento downstream de OpenSML-Base-175M frente a estas alternativas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial, la redistribucion ni la obligacion de atribucion. Se debe contactar con el autor antes de cualquier uso en produccion.
- Modelo base sin ajuste de instrucciones: no sigue ordenes, no soporta plantillas de chat y no incluye adaptador JSON, por lo que no es apto para asistentes conversacionales sin un ajuste fino previo.
- Riesgo elevado de alucinacion y de texto incoherente en generaciones largas, propio de un modelo de 175M parametros entrenado con 17,3B posiciones.
- Solo ingles: no se documenta soporte de castellano ni de otros idiomas.
- Contexto limitado a 2.048 tokens, con rechazo explicito de peticiones que lo excedan; no hay truncado silencioso.
- Checkpoint por debajo del presupuesto declarado: el autor indica que el objetivo original y la continuacion eran superiores a los 17,30B de posiciones del artefacto publicado y no reclama una ejecucion completa de 30B, lo que sugiere un posible subentrenamiento.
- Ausencia total de benchmarks downstream verificados para este hash de pesos, por lo que no se puede estimar su calidad en tareas practicas.
- Riesgo de sesgos y de fuga de contenido inapropiado heredado de los corpus web (FineWeb-Edu, DCLM-Edu, FineWiki) sin filtrado posterior documentado.
- Runtime muy restringido: solo validado en MLX sobre Apple Silicon; CUDA, CPU-only y cuantizacion no estan verificados, lo que complica el despliegue en servidores convencionales.
- Repositorio sin descargas ni likes y sin validacion de la comunidad en el momento de la consulta; no hay garantia de mantenimiento.
- Los pesos de OpenSML-150M no inicializaron este modelo, por lo que no se puede asumir continuidad entre checkpoints de la misma familia mas alla de lo declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenSML/OpenSML-Base-175M
- Modelo derivado con instrucciones: https://huggingface.co/OpenSML/OpenSML-JSONLite-175M
- Guia de ejecucion (en el repositorio): RUN_GUIDE.md
- Informe tecnico (en el repositorio): TECHNICAL_REPORT.md
- Resultados de evaluacion (en el repositorio): EVALUATION_RESULTS.json
- Procedencia del checkpoint (en el repositorio): checkpoint_provenance.json
- Metadatos del checkpoint y del optimizador (en el repositorio): checkpoint_metadata.json
- Configuracion del corpus (en el repositorio): corpus.json
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-Edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Dataset English FineWiki: https://huggingface.co/datasets/HuggingFaceFW/finewiki
- Dataset SmolLM corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset Python educativo: https://huggingface.co/datasets/Avelina/python-edu-cleaned
