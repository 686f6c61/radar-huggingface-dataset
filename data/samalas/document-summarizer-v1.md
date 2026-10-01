# Samalas/document-summarizer-v1

## Resumen

Samalas/document-summarizer-v1 es un adaptador LoRA de bajo rango concebido para resumir y comprimir documentos largos manteniendo la informacion clave. No es un modelo completo: se trata de un adaptador de unos 6 millones de parametros (aproximadamente el 0,2 % del modelo base) montado sobre Qwen2.5-3B-Instruct cuantizado a 4 bits. Su proposito declarado es condensar articulos, hilos de correo, transcripciones de reuniones e informes en resumenes equivalentes al 30-50 % de la longitud original.

El autor lo presenta como el "Modelo 06" de una serie interna y lo entrena con 1.200 pares documento-resumen (1.000 para entrenamiento y 200 de validacion) procedentes de conjuntos publicos mezclados. La configuracion es deliberadamente ligera: rango LoRA 8 sobre 20 capas, 300 iteraciones, batch size 1 y tasa de aprendizaje constante de 1e-5, con tres checkpoints publicados (iteraciones 100, 200 y 300). El peso del adaptador ronda los 9,6 MB, lo que permite distribuirlo junto al modelo base sin coste de almacenamiento relevante.

Su relevancia practica es limitada y muy acotada a entornos Apple Silicon: el flujo de uso documentado depende de `mlx-lm`, la libreria de inferencia de MLX para chips M-series. El repositorio no declara licencia, idiomas soportados ni pipeline, y no registra descargas ni interacciones, por lo que debe considerarse un experimento de autor individual mas que un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5-3B-Instruct) |
| Parametros totales | ~3,09B en el modelo base + ~6M en el adaptador (0,2 % del base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el base Qwen2.5-3B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | Base en 4 bits; adaptador en 16 bits (mixed precision) |
| Idiomas soportados | No disponible; el autor indica entrenamiento "principalmente en ingles" |
| Licencia | No disponible |
| Formato de pesos | Adaptador LoRA (safetensors) sobre base MLX; dependencias `mlx`, `mlx-lm`, `transformers` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.090 millones de parametros con atencion causal estandar. La intervencion consiste en LoRA de rango 8 inyectada en 20 capas del modelo base, cuantizado previamente a 4 bits. Segun la model card, esa combinacion busca "capturar la estructura del documento" manteniendo el adaptador en 9,6 MB. El entrenamiento usa el optimizador AdamW con entropia cruzada calculada solo sobre los tokens del resumen, sin warmup, tasa constante de 1e-5, gradient checkpointing activado y precision mixta (base 4 bits, adaptador 16 bits) durante 300 iteraciones con batch size 1.

Los datos de entrenamiento son 1.200 pares reales documento-resumen de origen mixto: correos, articulos de prensa, transcripciones de reuniones y resumenes de investigacion. De ellos, 1.000 se emplean para entrenamiento y 200 quedan reservados como conjunto de validacion. La model card no especifica el numero de tokens vistos, la composicion exacta por fuente ni si hubo fases de RLHF o DPO; tampoco documenta decodificacion especulativa, atencion lineal ni ninguna otra innovacion de inferencia. No se describe ningun proceso de evaluacion independiente de los tres checkpoints publicados.

## Capacidades

- Generacion de resumenes extractivo-abstrahibles a partir de documentos largos, con ratio de compresion medio declarado del 38 %.
- Compresion de texto orientada a eliminar redundancia preservando puntos principales.
- Resumen de articulos de prensa y entradas de blog con estructura clara.
- Resumen de transcripciones de reuniones y conversaciones dialogadas.
- Resumen de hilos de correo electronico con estructura pregunta-respuesta.
- Resumen de documentacion tecnica con jerarquia de informacion explicita.
- Generacion de abstracts a partir de resumenes de articulos de investigacion.
- Resumen de informes con secciones definidas.
- Capacidades heredadas del base Qwen2.5-3B-Instruct (generacion general, comprension multilingue basica), aunque la model card no las valida tras el ajuste.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Gestion de correo electronico: resumir hilos largos antes de responder, reduciendo el tiempo de lectura en bandejas con conversaciones de decenas de mensajes.
- Actas de reunion automaticas: tomar la transcripcion de una reunion y generar notas estructuradas con acuerdos y acciones, aprovechando el entrenamiento sobre transcripciones.
- Boletin de prensa: condensar articulos para un resumen diario dirigido a profesionales que necesitan una vision rapida de la actualidad.
- Triaje documental: generar un resumen inicial de informes extensos para decidir que documentos requieren lectura completa.
- Resumen de canales de mensajeria tipo Slack: poner al dia a un usuario que se ha ausentado de un canal con mucho trafico.
- Prefiltrado en revision humana: producir un borrador de resumen que un revisor edita y valida antes de publicarlo, dado que la propia model card reconoce un 12 % de resumenes con detalles omitidos.
- Generacion de abstracts en flujos de investigacion: crear un resumen preliminar de articulos para catalogacion interna, siempre con revision posterior.
- Digest de documentacion tecnica: extraer los puntos clave de manuales y guias para bases de conocimiento internas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, no verificados de forma independiente. No hay comparacion con otros modelos en la informacion disponible.

| Checkpoint | Iteracion | ROUGE-1 | Uso recomendado |
|---|---|---|---|
| 0000100 | 100 | 0,84 | Pruebas y depuracion |
| 0000200 | 200 | 0,87 | Inferencia mas rapida |
| 0000300 | 300 | 0,89 | Produccion (recomendado) |

| Metrica | Valor declarado |
|---|---|
| Exactitud (coincidencias exactas) | 88 % |
| ROUGE-1 (checkpoint 300) | 0,89 |
| ROUGE-L (checkpoint 300) | 0,84 |
| Ratio de compresion medio | 38 % |

Caveat: el conjunto de validacion tiene 200 ejemplos y no se describe la metodologia de calculo de ROUGE ni de la "exactitud". Las cifras proceden exclusivamente de la model card.

## Requisitos de hardware

- RAM: 4 GB minimo; 6 GB recomendado segun el autor.
- Almacenamiento: aproximadamente 1 GB para el modelo base cuantizado a 4 bits y unos 10 MB para el adaptador LoRA.
- Latencia: 2-5 segundos por documento, segun longitud (dato del autor).
- Cabe en GPU de consumo: el base de 3B en 4 bits ocupa en torno a 2 GB, por lo que es viable en GPUs consumer con 6-8 GB o mas (RTX 3060, RTX 4060 y superiores), aunque la via documentada por el autor es MLX sobre Apple Silicon (unificada, sin VRAM dedicada).
- GPU de datacenter: no se documenta soporte ni configuracion para A100, H100 u otras.
- Opciones de despliegue: MLX y mlx-lm (via oficial documentada); el base Qwen2.5-3B-Instruct es compatible con transformers, vLLM, llama.cpp, Ollama y TGI, pero la model card no valida la carga del adaptador en estos entornos.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a especificaciones publicas de sus respectivos repositorios, no a mediciones realizadas para esta ficha. No hay cifras de rendimiento comparables dentro de la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Tipo | Rendimiento comparado |
|---|---|---|---|---|---|
| Samalas/document-summarizer-v1 | ~3,09B + 6M (adaptador) | No disponible (base: 32.768) | No disponible | Adaptador LoRA sobre Qwen2.5-3B | ROUGE-1 0,89 declarado |
| facebook/bart-large-cnn | ~406M | 1.024 tokens | MIT | Seq2seq afinado para resumen | No disponible |
| google/pegasus-xsum | ~568M | 512 tokens | Apache-2.0 | Seq2seq afinado para resumen | No disponible |
| Qwen2.5-3B-Instruct (base) | 3,09B | 32.768 tokens | Apache-2.0 | Transformer decoder-only | No disponible |

La ventaja diferencial del adaptador frente a los modelos seq2seq clasicos es la ventana de contexto del base (32.768 tokens frente a 512-1.024), que permite resumir documentos mucho mas largos en una sola pasada. Su desventaja es que no declara licencia ni idiomas, y que su evaluacion se limita a un conjunto de validacion de 200 ejemplos.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no es posible determinar si el uso comercial esta permitido. Esto bloquea su adopcion en produccion sin aclaracion previa del autor.
- Las metricas declaradas (88 % de coincidencia exacta, ROUGE-1 0,89) proceden de un conjunto de validacion de 200 ejemplos y no han sido verificadas de forma independiente; deben tratarse con cautela.
- La model card reconoce explicitamente que un 12 % de los resumenes omitira detalles clave y recomienda revision humana en todos los casos.
- Riesgo de alucinacion: el autor advierte que el modelo puede inventar hechos que no aparecen en el material fuente.
- Rendimiento deficiente documentado en documentos altamente tecnicos con jerga de dominio, ficcion narrativa (pierde matices emocionales), texto ya comprimido, documentos con multiples puntos de vista en conflicto y contenido medico o legal.
- El ratio de compresion del 38 % es una media y varia segun el tipo de documento; no es una garantia.
- Funciona mejor con documentos estructurados que con texto libre.
- Entrenamiento principalmente en ingles: el comportamiento en castellano no esta validado y no se declaran idiomas soportados.
- No hay soporte documentado de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para flujos agenticos.
- El flujo de uso oficial esta ligado a MLX y Apple Silicon; no se documenta la carga del adaptador en vLLM, TGI, llama.cpp u Ollama.
- Repositorio sin descargas ni interacciones: ausencia de comunidad, issues o validacion externa.
- No debe emplearse como salida final en contextos de alto riesgo (legal, medico, financiero) sin revision humana obligatoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Samalas/document-summarizer-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Version cuantizada del base empleada por el autor: https://huggingface.co/mlx-community/Qwen2.5-3B-Instruct-4bit
- Libreria MLX: https://github.com/ml-explore/mlx
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm

No se han encontrado papers, blogs, repositorios adicionales ni demos asociados al modelo en la informacion disponible.
