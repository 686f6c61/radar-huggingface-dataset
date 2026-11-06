# rikai-translate/rikai-jp-eng-Bench-265-0.8B

## Resumen

rikai jp<->eng Bench 265 .8B es un modelo de traduccion automatica japones-ingles e ingles-japones desarrollado por rikai-translate, un proyecto independiente que parte del modelo CyberAgent CAT-Translate-0.8b y lo afina para mejorar la calidad de traduccion manteniendo un tamano muy reducido. Con 793 millones de parametros y una ventana de contexto no especificada, el modelo se posiciona como una alternativa ligera para traduccion bidireccional de alta calidad en dispositivos con recursos limitados.

La relevancia del modelo radica en su relacion calidad-tamano: segun la model card del autor, rinde entre CAT-Translate-1.4B y CAT-Translate-3.3B en la mayoria de las metricas de traduccion evaluadas, a pesar de tener menos de la mitad de parametros que el modelo de 1.4B y una cuarta parte del de 3.3B. Esto lo hace atractivo para despliegues en produccion donde el coste por token y la latencia importan, especialmente en escenarios de traduccion en tiempo real o en dispositivos Apple Silicon mediante MLX.

El modelo emplea una arquitectura transformer de tipo Llama con una innovacion tecnica destacable: una mascara de prefijo personalizada (prefix mask) que permite al modelo leer el prompt en ambas direcciones antes de generar la primera palabra, mejorando la coherencia de la traduccion. Se distribuye bajo licencia MIT, lo que facilita su uso comercial, y esta disponible en formatos safetensors fp16 y MLX 8-bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con prefix mask personalizada |
| Parametros totales | 793.048.320 (0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (safetensors), 8-bit affine con group size 64 (MLX) |
| Idiomas soportados | Japones (ja), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16), MLX (8-bit) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de CyberAgent CAT-Translate-0.8b, un transformer decoder-only de tipo Llama. La innovacion principal es una mascara de prefijo (prefix mask) personalizada que permite al modelo procesar el prompt de traduccion en ambas direcciones antes de emitir el primer token, lo que segun el autor mejora la calidad de la traduccion. El prompt y la plantilla de chat son identicos a los de CAT-Translate: "Translate the following {src_lang} text into {tgt_lang}.\n\n{src_text}".

El entrenamiento se realizo como un fine-tune sobre CAT-Translate-0.8b. Segun la model card, el modelo fue entrenado con un juez LLM (Claude Sonnet 5.5) ademas de datos supervisados, y todos los datos de entrenamiento fueron filtrados contra los conjuntos de evaluacion mediante shingles de 12 caracteres para evitar contaminacion. No se especifican el numero de tokens de entrenamiento ni la composicion exacta del dataset. El autor menciona que el modelo "benchmaxea" mediante el uso de un juez LLM en el entrenamiento, lo que sugiere un proceso de optimizacion orientado a las metricas de evaluacion presentadas.

## Capacidades

- Traduccion bidireccional japones-ingles e ingles-japones de alta calidad.
- Traduccion de documentos completos y lineas individuales (segun los conjuntos de evaluacion: dialogos de negocio, interpretacion judicial, articulos medicos, noticias, resenas de usuarios, manga, etc.).
- Manejo de multiples dominios: negocios, legal, medico, noticias, redes sociales, literatura, discurso, comercio electronico.
- Decodificacion con prefix mask que permite lectura bidireccional del prompt.
- Despliegue en dispositivos Apple Silicon mediante MLX 8-bit.
- No se menciona soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica japones-ingles: el modelo puede traducir manuales y documentacion con terminologia especializada, adecuado por su buen rendimiento en dominios de negocios y noticias segun los benchmarks.
- Localizacion de productos de comercio electronico: traduccion de fichas de producto y resenas de usuarios entre japones e ingles, con calidad cercana a modelos de 3.3B segun la evaluacion en dominios WMT23 de e-commerce y resenas.
- Interpretacion en entornos judiciales: el modelo fue evaluado en conjuntos de interpretacion judicial (court interpreting), lo que lo hace adecuado para asistencia en traduccion de documentos legales, aunque no sustituye a un interprete humano.
- Traduccion de contenido medico: evaluado en el conjunto EJMMT medico, puede asistir en la traduccion de articulos y documentacion clinica entre japones e ingles.
- Traduccion de manga y contenido literario: evaluado en OpenMantra (paginas de manga) y WMT24++ parrafos literarios, adecuado para localizacion de comics y narrativa.
- Traduccion en tiempo real en dispositivos: con el build MLX 8-bit de 812 MB, puede ejecutarse en Apple Silicon para traduccion local sin conexion, ideal para privacidad y baja latencia.
- Procesamiento por lotes de grandes volumenes de texto: al ser un modelo de 0.8B, permite alto throughput en GPUs consumer para pipelines de traduccion masiva.

## Benchmarks y rendimiento

Resultados del 26-domain gate (1.550 items con referencias humanas) y del conjunto ciego de 500 items, segun la model card:

| Metrica | rikai 0.8B | CAT-0.8B | CAT-1.4B | CAT-3.3B-β | CAT-3.3B | CAT-7B |
|---|---|---|---|---|---|---|
| 26-domain gate, CometKiwi ↑ | 0.8384 | 0.8304 | 0.8353 | 0.8420 | 0.8430 | 0.8430 |
| 26-domain gate, MetricX-24-QE error ↓ | 2.85 | 3.29 | 3.04 | 2.89 | 2.76 | 2.78 |
| 26-domain gate, MetricX-24 error ↓ | 3.34 | 3.83 | 3.51 | 3.31 | 3.14 | 3.14 |
| 26-domain gate, BLEU ↑ | 22.02 | 21.13 | 19.41 | 23.14 | 23.22 | 26.07 |
| 26-domain gate, chrF++ ↑ | 36.88 | 35.62 | 35.32 | 38.06 | 38.31 | 40.17 |
| Blind 500, CometKiwi ↑ | 0.8020 | 0.7944 | 0.7992 | 0.8064 | 0.8046 | 0.8061 |
| Blind 500, MetricX-24-QE (1 − err/25) ↑ | 0.8586 | 0.8391 | 0.8493 | 0.8562 | 0.8604 | 0.8663 |
| Blind 500 en→ja, MetricX-24-QE ↑ | 0.8436 | 0.8101 | 0.8279 | 0.8286 | 0.8428 | 0.8503 |

Resultados del juez LLM (Claude Sonnet 5.5, 500 items ciegos, escala 0-100):

| Modelo | Puntuacion | Traducciones con error critico |
|---|---|---|
| rikai jp<->eng Bench 265 .8B | 60.3 | 6.2% |
| CAT-0.8B | 58.5 | 7.4% |
| CAT-1.4B | 60.6 | 7.8% |
| LFM2-350M-ENJP-MT | 51.8 | 13.2% |
| LFM2.5-1.2B-JP | 50.6 | 17.2% |
| TinySwallow-1.5B | 52.0 | 15.6% |
| Gemma-2-2B-jpn | 52.2 | 19.6% |
| Gemma-2-2B-jpn-translate | 55.4 | 14.0% |
| HY-MT1.5-1.8B | 58.0 | 7.2% |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1.6 GB para los pesos (793M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica unos 2-3 GB.
- VRAM estimada para inferencia en 8-bit: aproximadamente 812 MB para los pesos (build MLX), con overhead adicional.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 pueden ejecutarlo sin problemas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM.
- Cabe en Apple Silicon: si, mediante el build MLX 8-bit de 812 MB, disenado especificamente para ello.
- Opciones de despliegue: transformers (safetensors fp16 con prefix mask), mlx_lm (Apple Silicon, 8-bit), text-generation-inference (el modelo incluye el tag text-generation-inference), endpoints_compatible.
- Latencia y throughput: no se proporcionan datos concretos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Calidad (juez LLM) | Disponibilidad |
|---|---|---|---|---|---|
| rikai jp<->eng Bench 265 .8B | 0.8B | No disponible | MIT | 60.3 | Hugging Face |
| CAT-Translate-1.4B | 1.4B | No disponible | No disponible | 60.6 | Hugging Face |
| CAT-Translate-3.3B | 3.3B | No disponible | No disponible | No evaluado en juez LLM | Hugging Face |
| HY-MT1.5-1.8B | 1.8B | No disponible | No disponible | 58.0 | Hugging Face |
| Gemma-2-2B-jpn-translate | 2B | No disponible | No disponible | 55.4 | Hugging Face |

El modelo de 0.8B iguala o supera en calidad a modelos de 1.4B-2B en las metricas de traduccion, con un 6.2% de errores criticos frente al 7.2-14% de alternativas de mayor tamano. Su principal ventaja competitiva es la combinacion de tamano reducido, licencia MIT y calidad cercana a modelos de 3.3B.

## Limitaciones y advertencias

- Solo soporta japones e ingles; no es multilingue mas alla de ese par.
- La longitud de contexto no esta especificada en la informacion disponible, lo que dificulta planificar el procesamiento de documentos muy largos.
- Riesgo de alucinacion inherente a los modelos generativos; en traduccion puede manifestarse como omisiones o adiciones de contenido, especialmente en textos muy especializados.
- El uso de un juez LLM en el entrenamiento puede introducir sesgos hacia el estilo de traduccion que el juez penaliza o premia, con riesgo de sobreajuste a las metricas de evaluacion.
- Aunque la licencia es MIT, conviene verificar las condiciones de la licencia del modelo base CyberAgent CAT-Translate-0.8b para uso comercial.
- El modelo requiere una mascara de prefijo personalizada para un rendimiento optimo; su uso sin ella puede degradar la calidad.
- No se han publicado datos sobre sesgos demograficos o culturales especificos.
- El numero de descargas (35) y likes (0) indica que es un modelo muy reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-0.8B
- Modelo base CyberAgent CAT-Translate-0.8B: https://huggingface.co/cyberagent/CAT-Translate-0.8b
- Resultados por dominio: https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-0.8B/blob/main/per_domain_results.md
- Build MLX 8-bit: https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-0.8B/tree/main/mlx-8bit
- Paper referenciado (arXiv:2606.21413): https://arxiv.org/abs/2606.21413
