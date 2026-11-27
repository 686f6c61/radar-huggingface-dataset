# rasyosef/AfriModernBERT-small

## Resumen

AfriModernBERT-small es un codificador (encoder) de tipo ModernBERT desarrollado por el usuario rasyosef y publicado en Hugging Face. Se ha preentrenado desde cero sobre aproximadamente 3.000 millones de tokens de texto web en 16 lenguas africanas, con una ventana de contexto nativa de 4.096 tokens y un tokenizador BPE construido especificamente para ese conjunto de idiomas. Su proposito es cubrir la falta de modelos de representacion linguistica de calidad para lenguas africanas de bajos recursos, ofreciendo una base ligera para tareas de comprension (clasificacion, etiquetado de secuencias, fill-mask) en lugar de generacion.

El modelo sigue la arquitectura ModernBERT, que combina atencion global intercalada con atencion local de ventana deslizante, RoPE, normalizacion pre-norm y activacion GeGLU. Con 16 capas, dimension oculta de 384 y 55,9 millones de parametros totales (unos 31 millones no pertenecientes a los embeddings), es un modelo compacto que puede ejecutarse en hardware modesto, incluidas GPU de consumo, y entrenarse o afinarse con recursos limitados.

Es relevante ahora porque la mayoria de los encoders multilingues disponibles estan dominados por lenguas de altos recursos y cubren las africanas de forma marginal. AfriModernBERT-small ofrece una alternativa Apache 2.0, con contexto largo (4.096 tokens frente a los 512 habituales en BERT clasico) y un vocabulario adaptado, lo que reduce la fragmentacion de tokens en amharico, swahili, hausa, yoruba, zulu y el resto de lenguas incluidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (pre-norm, GeGLU, RoPE, atencion local/global alterna) |
| Parametros totales | 55.914.880 (aproximadamente 56 M; unos 31 M sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | am, ti, om, so, sw, ha, yo, ig, rw, rn, lg, ny, sn, sot, xh, zu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 16 capas con dimension oculta de 384, 6 cabezas de atencion (dimension por cabeza de 64) y tamano de feed-forward de 1.152. La atencion alterna capas globales cada tercera capa con capas de ventana deslizante de 128 tokens; usa RoPE con theta de 160.000 en las capas globales y 10.000 en las locales. El vocabulario es de 65.152 tokens BPE, entrenado sobre la propia mezcla de preentrenamiento. El objetivo es modelado de lenguaje enmascarado (masked language modeling).

El entrenamiento se hizo desde cero sobre unos 3.000 millones de tokens de texto web procedentes de los subconjuntos de FineWeb-2 para las 16 lenguas. Se estructuro en dos fases: una primera de 7 epocas a 512 tokens con 30 % de enmascaramiento y learning rate pico de 5e-4 con decaimiento lineal hasta 1,5e-4, y una segunda de extension de contexto de 3 epocas a 4.096 tokens con 15 % de enmascaramiento y learning rate de 1,5e-4 con decaimiento lineal hasta 0. Todo el entrenamiento se ejecuto en una unica GPU NVIDIA RTX PRO 6000 Blackwell (96 GB) con precision mixta bf16 y FlashAttention-2. No se documenta en la informacion disponible ninguna fase de RLHF, DPO ni ajuste supervisado posterior.

## Capacidades

- Relleno de mascaras (fill-mask): predice tokens enmascarados en texto, tal como muestra el ejemplo de la model card en amharico y swahili.
- Representaciones contextuales para ajuste fino: sirve como base para clasificacion de secuencias (`AutoModelForSequenceClassification`), etiquetado de tokens (`AutoModelForTokenClassification`) y otras cabeceras de transformers.
- Contexto largo: ventana nativa de 4.096 tokens, adecuada para documentos y parrafos extensos sin truncamiento agresivo.
- Cobertura multilingue africana: 16 lenguas (amharico, tigrina, oromo, somali, swahili, hausa, yoruba, igbo, kinyarwanda, kirundi, luganda, chichewa, shona, sesotho, xhosa, zulu).
- Tokenizador especializado: vocabulario BPE entrenado sobre la mezcla de las 16 lenguas, lo que reduce la fragmentacion frente a tokenizadores genericos.
- Soporte de FlashAttention-2: carga con `attn_implementation="flash_attention_2"` para acelerar entradas largas.
- Tool calling / function calling: no disponible (es un encoder, no un modelo generativo).
- Capacidades de agente o razonamiento multi-paso: no disponibles por diseno de la arquitectura.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Reconocimiento de entidades nombradas (NER) en lenguas africanas: ajuste fino con `AutoModelForTokenClassification` sobre corpus como MasakhaNER 2.0 para extraer personas, organizaciones y lugares en noticias y textos web en swahili, hausa, yoruba o amharico, aprovechando el tokenizador adaptado para reducir la fragmentacion de entidades.
- Clasificacion de noticias y contenidos: ajuste con `AutoModelForSequenceClassification` sobre conjuntos tipo MasakhaNEWS para categorizar articulos por tematica en las 16 lenguas, con contexto de 4.096 tokens que permite procesar articulos completos sin truncar.
- Analisis de sentimiento en redes sociales: afinado sobre datos tipo AfriSenti para monitorizar opinion en tuits y comentarios en swahili, yoruba, hausa o amharico, con un modelo de 56 M que se puede desplegar en CPU para picos de trafico.
- Filtrado y deduplicacion de corpus: uso de las representaciones del encoder para calcular embeddings de parrafos y detectar contenido duplicado o de baja calidad en pipelines de recopilacion de datos en lenguas africanas, donde los filtros basados en modelos ingleses fallan.
- Busqueda semantica y recuperacion: generacion de embeddings de documentos y consultas para motores de busqueda internos en swahili, zulu o somali, con ventana de 4.096 tokens para indexar secciones largas sin trocear en exceso.
- Etiquetado de datos asistido: uso de fill-mask y de las predicciones del modelo afinado para preetiquetar corpus y acelerar la anotacion humana en proyectos de datos para lenguas de bajos recursos.
- Moderacion de contenido basica: clasificacion de textos web en las lenguas cubiertas para detectar categorias problematicas, como paso previo a revision humana, dado que el modelo se entreno sobre texto web filtrado pero no exento de sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados en tareas downstream (MasakhaNER 2.0, MasakhaNEWS, AfriSenti) estan pendientes ("coming soon").

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 55,9 M de parametros; en bf16 ocupa aproximadamente 112 MB de pesos, y en fp32 unos 224 MB. Con activaciones y overhead de runtime, cabe holgadamente en menos de 1 GB de VRAM para entradas cortas; con contexto de 4.096 tokens las activaciones aumentan, pero sigue siendo muy ligero.
- GPU recomendadas: cualquier GPU moderna sirve; para maximo rendimiento en entradas largas, GPU con soporte de FlashAttention-2 (A100, H100, RTX 4090, RTX PRO 6000 Blackwell, entre otras).
- GPU de consumo: si, cabe en cualquier GPU de consumo actual (RTX 3060, 4060, 4090, etc.) e incluso puede ejecutarse en CPU con latencias aceptables para lotes pequenos.
- Opciones de despliegue: transformers (con o sin FlashAttention-2), y en general cualquier runtime compatible con safetensors y la arquitectura ModernBERT. No se documentan en la informacion disponible integraciones especificas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| AfriModernBERT-small | 56 M | 4.096 | 16 lenguas africanas | Apache 2.0 | Entrenado desde cero sobre FineWeb-2; tokenizador propio |
| ModernBERT-base (answerdotai) | 149 M | 8.192 | Principalmente ingles | Apache 2.0 | Referencia arquitectonica; no cubre lenguas africanas |
| AfroXLMR (variantes) | no disponible en la informacion | no disponible | Lenguas africanas | no disponible | Familia de encoders adaptados a lenguas africanas; sin datos de comparacion en la informacion disponible |
| mBERT / XLM-R base | 178 M / 278 M | 512 | Multilingue general | Apache 2.0 / MIT | Cobertura africana marginal y contexto corto |

La comparacion cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados para AfriModernBERT-small ni datos de referencia en la informacion proporcionada para contrastar con AfroXLMR u otros encoders africanos.

## Limitaciones y advertencias

- Entrenado exclusivamente con texto web de FineWeb-2, que puede contener errores, sesgos y contenido ofensivo pese al filtrado aplicado.
- No se entreno con ingles ni con otras lenguas de altos recursos, por lo que el texto con cambio de codigo (code-switching) y las entidades nombradas extranjeras pueden manejarse peor.
- Riesgo de alucinacion: al ser un encoder de fill-mask, las predicciones de tokens enmascarados pueden ser plausibles pero incorrectas; no debe usarse como fuente de verdad sin validacion.
- Cobertura limitada a 16 lenguas; otras lenguas africanas no estan soportadas.
- No es un modelo generativo: no sirve para chat, generacion de texto libre ni tool calling.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios especializados (legal, medico, financiero) ni sobre el cumplimiento normativo en aplicaciones sensibles.
- No hay resultados de evaluacion publicados, por lo que la calidad real en tareas downstream debe validarse antes de llevarlo a produccion.
- El modelo se creo y actualizo en noviembre de 2026 segun los metadatos de Hugging Face; conviene verificar la version de transformers compatible con ModernBERT en el momento del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rasyosef/AfriModernBERT-small
- Paper de ModernBERT: https://arxiv.org/abs/2412.13663
- Paper de FineWeb-2: https://arxiv.org/abs/2506.20920
- Modelo de referencia ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
