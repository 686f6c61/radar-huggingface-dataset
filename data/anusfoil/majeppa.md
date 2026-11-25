# anusfoil/majeppa

## Resumen

MAJEPPA es un modelo de representación y generación de interpretaciones de piano en formato MIDI simbólico, desarrollado por Jinwen Zhou, Huan Zhang, Weixi Zhai, Jinhua Liang, Aidan O. T. Hogg y Simon Dixon, y presentado en ISMIR 2026. El modelo parte de Aria-medium (660 M de parámetros, congelado) y lo adapta mediante LoRA para dos tareas complementarias: generar una interpretación expresiva (performance) a partir de una partitura (score) y producir embeddings unificados que sitúan partituras e interpretaciones en un mismo espacio latente.

La relevancia del modelo reside en su enfoque híbrido: combina predicción del siguiente token condicionada por la partitura con pérdidas contrastivas entre los embeddings de score y de performance, siguiendo la filosofía de las arquitecturas JEPA (Joint Embedding Predictive Architecture) aplicada al dominio musical. Esto permite tanto la generación condicionada por estilo de intérprete y tipo de grabación como la comparación y el "morphing" entre interpretaciones dentro de un espacio común.

El modelo es de tamaño medio (660 M de parámetros base, con un adaptador LoRA de 79 MB), está entrenado exclusivamente con datos simbólicos de piano solo y se distribuye bajo licencia Apache 2.0, aunque su uso previsto declarado es la investigación no comercial. No procesa audio: trabaja únicamente con eventos MIDI tokenizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Aria-medium) con adaptador LoRA y cabeza de proyección lineal para pérdidas contrastivas |
| Parametros totales | 660 M (modelo base congelado) + adaptador LoRA (rank 128) + cabeza de proyección 1536→512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1200 tokens por vista durante el entrenamiento; `embed_file` admite `max_content_len` configurable (ejemplo con 4096) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés; el dominio es MIDI simbólico, no texto natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`majeppa.safetensors`, 79 MB) |

## Arquitectura y entrenamiento

MAJEPPA adapta el modelo preentrenado de MIDI Aria-medium (660 M de parámetros, congelado, commit `5a1ef36`) mediante LoRA de rank 128 y alpha 32 con rank-stabilised scaling, aplicado sobre las proyecciones `mixed_qkv` y `att_proj_linear`. Se añaden 16 nuevas filas de embedding entrenables: 6 etiquetas de intérprete (`child_beginner`, `adult_beginner`, `adult_intermediate`, `child_professional`, `piano_teacher`, `virtuoso`), 7 de tipo de grabación (`practice`, `sight_read`, `performance`, `demo_class`, `slow_demo`, `concert_performance`), 2 etiquetas "unknown" y un token `[PRED]`. La LM head conserva el vocabulario base, de modo que el modelo no muestrea estos tokens nuevos. Una cabeza de proyección lineal (1536→512) se usa exclusivamente para las pérdidas contrastivas.

El entrenamiento combina predicción del siguiente token condicionada por la partitura con pérdidas contrastivas entre embeddings de score y de performance, con hiperparámetros γ=1, λ=8, β=1, α=1 y τ=0,07. Se usaron 74.060 pares segmento partitura-interpretación del dataset MAJEPPA (1.486 en validación), con vistas de hasta 1200 tokens, durante 120 épocas en 2× H100 de 80 GB, batch 16 por GPU y acumulación de gradiente 4. El fichero publicado contiene los pesos tras la última época.

## Capacidades

- Generación de interpretaciones MIDI de piano a partir de una partitura simbólica, condicionada por tipo de intérprete y tipo de grabación.
- Embeddings unificados de ficheros MIDI (media de los estados del último bloque antes de la layer norm final, vector de 1536 dimensiones), deterministas al excluir el token `<D>`.
- Representación conjunta de partituras e interpretaciones en un mismo espacio latente, lo que habilita comparación y morphing entre interpretaciones.
- Control estilístico explícito mediante etiquetas de intérprete (6 clases) y de contexto de grabación (6 clases).
- Generación con temperatura 0,8 y top-k 50, con rechazo del token de fin hasta que la salida contiene al menos el 80 % de las notas de la partitura.
- Dominio limitado a piano solo en formato MIDI simbólico; no procesa audio ni texto natural.
- No dispone de tool calling, function calling ni capacidades de agente.

## Casos de uso

- Investigación en interpretación musical expresiva: generación de performances condicionadas por estilo para estudiar cómo varían el timing, la dinámica y la articulación según el intérprete simulado.
- Evaluación de modelos musicales con el benchmark EVPMR: el modelo sirve como referencia generativa y como extractor de embeddings para métricas de similitud entre interpretaciones.
- Aprendizaje automático de piano: generar versiones "slow_demo" o "practice" de una partitura para materiales de estudio, usando las etiquetas de intérprete `piano_teacher` o `adult_beginner`.
- Análisis de similitud entre grabaciones: usar `embed_file` para obtener vectores de 1536 dimensiones y agrupar o comparar interpretaciones de una misma obra por estilo o contexto.
- Morphing entre interpretaciones: interpolar o comparar en el espacio latente unificado para estudiar transiciones entre estilos interpretativos.
- Docencia e investigación musicológica: generar variantes estilísticas de una obra para ilustrar diferencias interpretativas en un contexto académico.
- Desarrollo de herramientas de edición musical asistida: integrar la generación condicionada en editores MIDI para proponer realizaciones expresivas de una partitura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (arXiv 2608.11026) y al benchmark EVPMR para el protocolo de evaluación, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 660 M de parámetros; en fp16 requiere aproximadamente 1,3 GB solo para pesos, más el adaptador LoRA (79 MB) y el overhead de activaciones y tokenizador; en la práctica, entre 2 y 4 GB según longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; el entrenamiento se realizó en 2× H100 80 GB, pero la inferencia es mucho más ligera.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más.
- Opciones de despliegue: el código de carga y generación está en el Space de demostración (`inference.py` con `MajeppaInference`), que depende de torch 2.8.0, transformers 4.49.0, peft 0.18.1, safetensors, huggingface_hub, numpy<2 y mido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAJEPPA | 660 M (base) + LoRA | 1200 tokens (entrenamiento) | MIDI piano solo, generación y embeddings | apache-2.0 | Hugging Face, 23 descargas |
| Aria-medium (modelo base) | 660 M | no disponible | MIDI general | no disponible en la información | Hugging Face (`loubb/aria-medium`) |
| Alternativas de generación MIDI simbólica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido a piano solo en MIDI simbólico; no admite audio, orquestación ni otros instrumentos.
- El uso previsto declarado es investigación no comercial sobre interpretación simbólica de piano, pese a la licencia Apache 2.0; conviene revisar las condiciones del paper y del dataset antes de un uso comercial.
- El modelo base está congelado y solo se entrena el adaptador LoRA; la capacidad de generalización fuera de los estilos de intérprete y grabación etiquetados es limitada.
- Los tokens nuevos (etiquetas de intérprete, grabación y `[PRED]`) no se muestrean desde la LM head, lo que restringe la flexibilidad del control estilístico a las categorías predefinidas.
- El embedding depende de truncar el fichero a `max_content_len` tokens; ficheros largos pueden perder información.
- Riesgo de alucinación en el sentido de generar eventos MIDI plausibles pero musicalmente incoherentes, especialmente con partituras fuera de distribución.
- No hay información publicada sobre sesgos, latencia o rendimiento en producción en la documentación disponible.
- El repositorio tiene solo 23 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anusfoil/majeppa
- Modelo base Aria-medium: https://huggingface.co/loubb/aria-medium
- Paper (arXiv): https://arxiv.org/abs/2608.11026
- Demo interactiva (Space): https://huggingface.co/spaces/anonymous-music/majeppa-jepa-demo
- Benchmark EVPMR: https://github.com/kkwsts/evpmr
- Dataset MAJEPPA: https://huggingface.co/datasets/kkwsts/MAJEPPA-Dataset
