# AneekC/quipu-114m

## Resumen

Quipu-114m es un modelo de lenguaje de tipo base, con 114.114.048 parametros, entrenado desde cero por el desarrollador independiente AneekC. Se trata de un transformer decoder-only con pre-norm, 12 capas, ancho de 768 y atencion de consultas agrupadas (GQA) con 12 cabezas de consulta sobre 4 cabezas de clave/valor. El modelo usa embeddings de entrada y salida compartidos (tied), tokenizador BPE de GPT-2 mediante `tiktoken` (vocabulario de 50.257) y una ventana de contexto de 1.024 tokens.

Su relevancia no radica en el rendimiento absoluto, sino en las condiciones de entrenamiento: fue entrenado en una unica GPU de portatil RTX 5060 con 8 GB de VRAM, bajo Windows, en 45 horas y 22 minutos, procesando 3.000 millones de tokens en una sola pasada sin repetir datos. El autor lo publica explicitamente como linea base y como registro de lo que se puede entrenar en un fin de semana con hardware de consumo, no como un modelo para produccion.

Es un modelo exclusivamente en ingles, sin ajuste por instrucciones, sin alineamiento de seguridad y sin formato de chat. Continua texto, pero no responde preguntas ni sigue ordenes. A este tamano genera prosa fluida y a menudo factualmente incorrecta, lo que el propio autor documenta con ejemplos. La licencia es Apache-2.0 tanto para pesos como para codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-norm |
| Parametros totales | 114.114.048 (embeddings de entrada y salida compartidos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no se distribuyen versiones cuantizadas oficiales; pesos finales en fp32 e hitos en bf16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32 el modelo final, bf16 los hitos) |

Detalles adicionales de arquitectura: 12 capas, d_model 768, feed-forward SwiGLU de 2.048, atencion GQA con 12 cabezas de consulta sobre 4 cabezas de clave/valor y dimension de cabeza 64, embeddings posicionales rotatorios (RoPE, variante GPT-NeoX half-split, base 10.000), normalizacion RMSNorm con eps 1e-6 y tokenizador GPT-2 BPE via `tiktoken` (vocab 50.257). El parametro `lm_head.weight` no se almacena por separado: es la matriz de embeddings.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional con pre-normalizacion, disenado para ser entrenable en 8 GB de VRAM. La innovacion mas destacable respecto a un transformer clasico es el uso de atencion de consultas agrupadas (GQA), que reduce el coste de la cache KV al compartir 4 cabezas de clave/valor entre 12 cabezas de consulta, y el uso de SwiGLU en el bloque feed-forward. El contexto se limita a 1.024 tokens, coherente con el presupuesto de memoria del hardware objetivo.

El entrenamiento consumio 2.999.975.936 tokens en una sola pasada, sin repeticion de datos, repartidos en un 80% de FineWeb-Edu (subconjunto `sample-10BT`) y un 20% de codigo con licencia permisiva procedente de `codeparrot/github-code-clean`. El filtrado de codigo se restringio a archivos con licencias MIT, Apache-2.0, BSD, ISC, CC0 y Unlicense, eliminando archivos minificados, vendorizados y de mas de 16.000 tokens, con el HTML limitado al 10%. Se ejecutaron 5.722 pasos de 524.288 tokens cada uno con optimizador AdamW, schedule coseno, 200 pasos de warmup y autocast en bf16. El proceso completo duro 45 h 22 min a aproximadamente 18.400 tokens/s, con 0 reanudaciones y 0 pasos descartados por valores no finitos. No hubo RLHF ni DPO: es un modelo puramente preentrenado.

## Capacidades

- Generacion de texto en ingles: continuacion de prompt coherente a nivel de superficie, con prosa fluida y tematicamente centrada.
- Modelado de lenguaje base: util como linea base para experimentos de escalado, ablaciones de tokenizador o estudios de dinamica de entrenamiento.
- Generacion de codigo con forma sintactica: produce texto con estructura de codigo, si bien rara vez es funcionalmente correcto.
- Capacidades multilingues: no disponibles; solo ingles.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponible.
- Formato de chat o instrucciones: no soportado (modelo base).

## Casos de uso

- Linea base para investigacion en eficiencia de entrenamiento: sirve para comparar tecnicas de tokenizacion, schedules de learning rate o arquitecturas alternativas contra un punto de referencia reproducible entrenado en hardware de consumo.
- Estudio de dinamica de aprendizaje: el repositorio incluye snapshots bf16 en los pasos 100, 250, 500, 1.000, 2.000, 4.000 y 5.722, lo que permite trazar la evolucion de la perdida y de las capacidades generativas sin reentrenar.
- Prototipado educativo: adecuado para demostrar el funcionamiento interno de un transformer decoder-only, ya que incluye una implementacion PyTorch independiente (`modeling_quipu.py`) sin dependencia de `transformers`.
- Generacion de texto creativo sin requisitos de veracidad: dado que no se debe confiar en su contenido factual, puede usarse para producir borradores de prosa donde solo importe la forma y el registro.
- Experimentos de destilacion o inicializacion: sus 114M parametros lo convierten en un punto de partida ligero para fine-tuning posterior con `transformers` u otros frameworks, una vez convertido.
- Pruebas de cuantizacion y despliegue en el borde: por su tamano, es un banco de pruebas para medir el impacto de int8/int4 en modelos pequenos, aunque no se distribuyan pesos cuantizados oficiales.
- Analisis de sesgos en datos web: al estar entrenado exclusivamente sobre FineWeb-Edu y codigo permisivo, permite estudiar que sesgos hereda un corpus de este tipo a escala de 3.000 millones de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta perdidas de validacion sobre texto retenido de FineWeb-Edu y sobre archivos de codigo retenidos (deduplicados por hash exacto contra el conjunto de entrenamiento):

| Paso | Tokens | Perdida val. texto | Perdida val. codigo* |
|---:|---:|---:|---:|
| 100 | 52M | 6,40 | 4,36 |
| 500 | 262M | 4,40 | 2,06 |
| 1.000 | 524M | 3,85 | 1,42 |
| 2.000 | 1,05B | 3,58 | 1,20 |
| 4.000 | 2,10B | 3,38 | 1,02 |
| 5.722 | 3,00B | 3,31 | 0,97 |

*La perdida de codigo esta artificialmente rebajada por el tokenizador: el BPE de GPT-2 fragmenta la indentacion en muchos tokens de espacio en blanco, y el 36,5% de los tokens de validacion de codigo son espacios puros frente al 2,0% en texto. Por ese mismo motivo, la decodificacion greedy de codigo degenera en secuencias de espacios. Estas cifras no son comparables con las de modelos de codigo que emplean un tokenizador especifico de codigo. La perdida de texto tampoco es directamente comparable con la de otros modelos pequenos, ya que la mezcla de datos (20% codigo) y el conjunto de evaluacion difieren.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 460 MB en fp32, unos 230 MB en bf16/fp16, unos 115 MB en int8 y unos 60 MB en int4 (sin contar la cache KV, despreciable con 1.024 tokens de contexto).
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente. El autor lo entreno en una RTX 5060 Laptop de 8 GB, por lo que una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar inferencia sin dificultad. Para inferencia en produccion a gran escala, A100 o H100 estarian sobredimensionadas para este tamano.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo de los ultimos diez anos y tambien en CPU.
- Opciones de despliegue: no es un modelo `transformers`, por lo que no dispone de clase `AutoModel` ni soporte directo en vLLM, TGI, llama.cpp u Ollama. El unico camino soportado es cargar la implementacion independiente `modeling_quipu.py` del repositorio junto con `torch`, `safetensors`, `tiktoken` y `huggingface_hub`.
- Latencia y throughput estimados: el autor reporta aproximadamente 18.400 tokens/s durante el entrenamiento en una RTX 5060 Laptop, pero no se publican cifras de latencia o throughput en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Quipu-114m | 114.114.048 | 1.024 | Apache-2.0 | en | safetensors, implementacion propia |
| GPT-2 small | 124M | 1.024 | MIT modificada | en | safetensors/PyTorch, integrado en `transformers` |
| Pythia-160M | 160M | 2.048 | Apache-2.0 | en | safetensors, integrado en `transformers` |
| SmolLM2-135M | 135M | 8.192 | Apache-2.0 | en (multilingue parcial en versiones mayores) | safetensors/GGUF, integrado en `transformers` |

Nota: los datos de los modelos de comparacion corresponden a informacion publica de sus respectivas model cards y pueden variar; no se dispone de una comparacion de benchmarks homogenea porque Quipu-114m no publica resultados en suites estandar. Los tres alternativos cuentan con tokenizadores mas eficientes y mayor soporte de ecosistema (vLLM, llama.cpp, Ollama), ademas de contextos mas amplios en el caso de Pythia y SmolLM2.

## Limitaciones y advertencias

- Modelo exclusivamente base: no hay ajuste por instrucciones, ni alineamiento de seguridad, ni formato de chat. No debe usarse como asistente.
- Afirma hechos falsos con seguridad. El autor lo ejemplifica con salidas como atribuir la invencion de la imprenta a 1848 o describir mal la fotosintesis. No debe utilizarse su salida como fuente de informacion.
- La decodificacion greedy degenera en repeticiones de espacios en la generacion de codigo; el autor recomienda muestreo con temperatura 0,8 y top-k 50.
- La produccion de codigo es formalmente plausible pero rara vez correcta.
- Solo ingles, con una ventana de contexto de 1.024 tokens, insuficiente para tareas que requieran documentos largos o conversaciones multi-turno extensas.
- Entrenado sobre texto web, por lo que hereda los sesgos de ese corpus, agravados por la ausencia de cualquier etapa de alineamiento o filtrado posterior.
- Licencia Apache-2.0 permisiva para pesos y codigo, lo que permite uso comercial del modelo; no obstante, los datos de entrenamiento provienen de FineWeb-Edu (ODC-By 1.0, © Hugging Face) y de archivos de codigo que conservan sus licencias originales (MIT, Apache-2.0, BSD, ISC, CC0, Unlicense), lo que conviene verificar antes de un uso comercial estricto.
- El modelo tiene 61 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- No existe integracion con `transformers`, vLLM, llama.cpp, Ollama o TGI, lo que incrementa el coste de integracion en produccion.
- El repositorio ocupa 2,1 GB, principalmente por los snapshots intermedios en bf16, innecesarios para inferencia si solo se usa el modelo final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AneekC/quipu-114m
- Pagina del proyecto: https://quipu-lm.vercel.app
- Codigo fuente: https://github.com/Aneek1/quipu
- Dataset de texto: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de codigo: https://huggingface.co/datasets/codeparrot/github-code-clean
