# DeerKaraca/bilingual-slm-42m-tr050

## Resumen

bilingual-slm-42m-tr050 es un modelo de lenguaje base de 42,5 millones de parámetros desarrollado por DeerKaraca, entrenado desde cero sobre 600 millones de tokens repartidos a partes iguales entre turco e inglés. Forma parte de un proyecto de investigación sobre cómo afecta la proporción de cada idioma en la mezcla de entrenamiento al rendimiento final en cada uno de ellos. No está ajustado por instrucciones: es un predictor de siguiente token puro, sin plantilla de chat ni alineación.

Arquitectónicamente sigue el esquema de Llama (transformer decoder-only) con 8 capas, anchura 512, 8 cabezas de atención completa, MLP SwiGLU de dimensión 1408, normalización RMSNorm y embeddings ligados de 32.768 tokens. El contexto es de 1.024 tokens y los pesos se distribuyen en formato safetensors bajo licencia Apache 2.0.

Su relevancia es fundamentalmente académica: sirve como artefacto reproducible para estudiar dinámicas de mezcla bilingüe a pequeña escala y como banco de pruebas de bajo coste (se entrenó en una única NVIDIA T4 en unas 4,2 horas). No es un modelo destinado a producción ni a aplicaciones de cara al usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, esquema Llama (`LlamaForCausalLM`) |
| Parametros totales | 42.476.032 (25,7 M sin la tabla de embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp16/fp32) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 8 capas, anchura 512 y 8 cabezas de atención multi-head completa (dimensión por cabeza 64). Usa MLP SwiGLU con tamaño oculto 1408, RMSNorm pre-norm con epsilon 1e-6, embeddings de entrada y salida ligados, vocabulario de 32.768 tokens y posiciones rotatorias (RoPE) con theta 10.000. Los pesos exportados reproducen los logits del modelo original con un error máximo de 6e-6.

El entrenamiento empleó 300 millones de tokens de turco procedentes de FineWeb2-HQ (`tur_Latn`) y 300 millones de inglés de FineWeb-Edu (`sample-10BT`), sin repetir ventanas. El pipeline de limpieza incluye normalización NFC, filtros de longitud y ratio de letras, y deduplicación exacta. Cada secuencia contiene un solo idioma y la proporción 50/50 se distribuye uniformemente a lo largo del entrenamiento. Se usó AdamW (beta 0,9/0,95), weight decay 0,1, clipping de gradiente 1,0, learning rate de 1e-3 con 200 pasos de warmup y decaimiento coseno hasta 1e-4, precisión mixta fp16 y lotes de 262.144 tokens en 2.288 pasos. El entrenamiento completo se ejecutó en una NVIDIA T4 (Kaggle) en aproximadamente 4,2 horas.

El tokenizador es un BPE a nivel de byte de 32.768 tokens entrenado con cantidades iguales de turco e inglés y compartido por todas las variantes del proyecto. Su pre-tokenizador no aplica reglas de contracciones inglesas, de modo que los sufijos turcos tras apóstrofo se preservan (`İstanbul'da` → `İstanbul` `'` `da`) y los dígitos se separan uno a uno. Sobre los conjuntos de validación rinde 1,77 tokens por palabra en turco (4,73 bytes por token) y 1,42 en inglés (4,35 bytes por token), frente a 3,78 y 1,32 respectivamente con el tokenizador de GPT-2.

## Capacidades

- Generación de texto por continuación de prompt (next-token prediction) en turco e inglés.
- Modelado de lenguaje bilingüe con un tokenizador compartido optimizado para morfología turca.
- Razonamiento básico de secuencia corta dentro de la ventana de 1.024 tokens.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de plantilla de chat ni de modo de pensamiento (thinking).
- No tiene capacidades de visión ni audio.
- Capacidad multilingüe limitada estrictamente a turco e inglés.
- Tokens especiales reservados `<|im_start|>` y `<|im_end|>` presentes pero sin uso; `<|endoftext|>` (id 0) actúa como BOS/EOS y separador de documentos.

## Casos de uso

- Investigación sobre mezclas bilingües: el modelo es el punto de la curva `tr050` del proyecto, útil para reproducir y extender el estudio sobre cómo la proporción turco/inglés afecta al bits-per-byte de cada idioma.
- Evaluación de tokenizadores para turco: sirve para medir el impacto de un BPE de 32k con preservación de sufijos frente a tokenizadores genéricos como el de GPT-2 en tareas de compresión y modelado.
- Prototipado educativo de pipelines de entrenamiento: al entrenarse en una sola T4 en 4,2 horas, es un caso reproducible para enseñar tokenización, limpieza de datos y ajuste de hiperparámetros en modelos pequeños.
- Pruebas de infraestructura de inferencia: el servidor OpenAI-compatible del proyecto (con KV cache, batching continuo y streaming SSE) permite validar integraciones de cliente sin coste de GPU grande.
- Generación de texto de relleno en demos y tests: útil para pruebas de interfaz o de carga donde se necesita texto plausible en turco o inglés sin requisitos de veracidad.
- Baseline en experimentos de destilación o comparación: referencia ligera para contrastar mejoras de arquitectura o datos en configuraciones de cómputo reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta únicamente bits per byte (BPB) de validación sobre 10,5 MB de texto retenido por idioma, nunca usado en entrenamiento:

| Mezcla (turco %) | BPB turco | BPB inglés |
|---|---|---|
| 0% (`tr000`, solo inglés) | 2,733 | **1,118** |
| 10% (`tr010`) | 1,316 | 1,125 |
| 30% (`tr030`) | 1,216 | 1,147 |
| **50% (`tr050`, este modelo)** | 1,177 | 1,179 |
| 100% (`tr100`, solo turco) | **1,120** | 1,746 |

El modelo publicado queda un 5,1% por detrás del monolingüe turco y un 5,4% por detrás del monolingüe inglés en su respectivo BPB. El hallazgo principal del proyecto, a esta escala de 42,5 M de parámetros, es que repetir ~3,3 veces los mismos 180 M de tokens turcos supera en 0,087 BPB turco a añadir 420 M de tokens ingleses (72 veces el ruido de semilla) y se queda a 0,010 BPB de datos turcos frescos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (pesos de ~85 MB) y del orden de 200-300 MB en cuantización de 8 bits, aunque no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el propio autor entrenó en una NVIDIA T4.
- Cabe holgadamente en GPU de consumo: GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, así como en CPU.
- Opciones de despliegue: `transformers` (referencia del autor), servidor propio OpenAI-compatible del repositorio (`python -m slm.server`) con KV cache, batching continuo y streaming SSE; compatible con text-generation-inference y endpoints según los tags del repositorio. No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| bilingual-slm-42m-tr050 | 42,5 M | 1.024 | tr, en | Apache 2.0 | Entrenado desde cero, base sin instrucciones |
| `tr000` / `tr100` (mismo proyecto) | 42,5 M | 1.024 | en / tr | Apache 2.0 | Monolingües de control del mismo estudio |
| GPT-2 small | 124 M | 1.024 | en (principalmente) | MIT | Referencia monolingüe inglesa ampliamente usada; tokenizador menos eficiente en turco |
| Modelos tipo SmolLM-135M | ~135 M | 2.048 | en (principalmente) | Apache 2.0 | Alternativa de escala similar con más parámetros y datos; no bilingüe turco-inglés |

No se dispone de comparaciones directas de rendimiento con estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo pequeño y poco entrenado para los estándares actuales: las afirmaciones factuales no son fiables y las salidas largas derivan y se repiten.
- Entrenado sobre texto web filtrado, por lo que hereda los sesgos presentes en FineWeb2-HQ y FineWeb-Edu; no hay ajuste de seguridad ni filtrado de salidas.
- Solo cubre turco e inglés, y los filtros de calidad difieren entre las dos fuentes (FineWeb-Edu usa un clasificador de valor educativo; FineWeb2-HQ, uno de calidad basado en embeddings).
- No es apto para toma de decisiones ni para aplicaciones de cara al usuario sin trabajo adicional.
- No está ajustado por instrucciones: no sigue órdenes ni mantiene conversaciones; no debe usarse como asistente.
- Contexto muy corto (1.024 tokens), lo que limita tareas de resumen o razonamiento sobre documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones técnicas hacen desaconsejable ese uso sin evaluación previa.
- No se publican pesos cuantizados ni resultados de benchmarks estándar, lo que dificulta comparaciones formales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeerKaraca/bilingual-slm-42m-tr050
- Repositorio del proyecto: https://github.com/DeerKaraca/bilingual-slm
- Informe de investigación: https://github.com/DeerKaraca/bilingual-slm/blob/main/reports/research/README.md
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
