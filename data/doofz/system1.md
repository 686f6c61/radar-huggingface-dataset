# doofz/System1

## Resumen

THX-01 (publicado en Hugging Face como `doofz/System1`) es un modelo de decisión multilingüe no autorregresivo desarrollado por HAL-X AI. No es un modelo generativo al uso: recibe un estado (un mensaje, ticket, correo, documento, registro JSON o traza de agente) junto con una o varias preguntas tipadas en lenguaje natural, y devuelve en un único forward pass una respuesta calibrada para cada pregunta, en torno a 10 ms por petición en una GPU.

El modelo se construye sobre el encoder `jhu-clsp/mmBERT-base` (22 capas, vocabulario de 256k tokens) al que se añade una cabeza de decisión de 15M de parámetros, sumando 322M en total. Su entrenamiento se basa en RLCD (Reinforcement Learning for Calibrated Decisions), con una función de recompensa que es una regla de puntuación estrictamente propia (proper scoring rule), de modo que la única forma de maximizar la recompensa es reportar probabilidades honestas. Esto produce una calibración muy ajustada (ECE de 0,003 en el conjunto Independent de su benchmark de tickets).

Su relevancia práctica está en sustituir llamadas a LLM generativos en tareas de clasificación, extracción y citación dentro de pipelines de agentes, con latencia dos órdenes de magnitud menor, probabilidades calibradas nativas y capacidad de devolver números y fragmentos textuales verbatim con offsets de caracteres. La licencia Apache 2.0 y el soporte de más de 100 idiomas (con post-entrenamiento en 18) lo hacen directamente desplegable en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT-base, 22 capas) con cabeza de decisión de 15M de parámetros; no autorregresiva |
| Parámetros totales | 321.908.998 (307M encoder + 15M cabeza de decisión) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 1.024 tokens por pregunta (pregunta, opciones y estado); estados más largos se truncan |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Post-entrenado en 18 idiomas (az, en, ru, tr, de, fr, es, ar, fa, hi, zh, ja, ko, ka, kk, uz, uk, it) con énfasis en azerbaiyano; más de 100 idiomas soportados según el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 2,6 GB) |

## Arquitectura y entrenamiento

THX-01 es un modelo de decisión no autorregresivo: un encoder mmBERT-base de 22 capas y vocabulario de 256k tokens, sobre el que se monta una cabeza de decisión de 15M de parámetros. La interfaz es tipada y admite seis modalidades de pregunta: `choice` (una de N opciones con probabilidad por opción), `noul` (probabilidad de sí), `score` (nivel ordinal con su distribución), `number` (valor numérico declarado en el documento o `null`), `excerpt` (span verbatim con offsets de caracteres) y `cite` (fragmentos del documento que sustentan la respuesta, con probabilidades), este último combinable con cualquier tipo de pregunta. Los tipos `number`, `excerpt` y las citas son capacidades nativas del modelo, no emuladas en la capa de servicio.

El post-entrenamiento consiste en ocho etapas a gran escala de RLCD (Reinforcement Learning for Calibrated Decisions) sobre aproximadamente 2,1 millones de decisiones de entrenamiento. La recompensa es una regla de puntuación estrictamente propia, lo que incentiva estructuralmente la calibración: reportar probabilidades honestas es la estrategia óptima. La extracción de números normaliza el valor tal como aparece escrito (`1,2 mln` pasa a `1200000`) sin conversión de unidades ni divisas, y la extracción de excerpts corta el texto directamente del documento, por lo que no puede contener texto inventado. El modelo también responde a llamadas de emulación de la capa de servicio (buckets de rangos de valor y chunks de documento) mediante su lookup nativo, de forma que capas de servicio existentes siguen funcionando sin cambios.

## Capacidades

- Clasificación de texto con probabilidades calibradas por opción (`choice`), con ECE de 0,003 en el conjunto Independent de su benchmark.
- Decisión binaria con probabilidad de sí (`noul`).
- Puntuación ordinal con distribución sobre niveles ordenados (`score`).
- Extracción de números declarados en el documento, con normalización de formato y devolución de `null` cuando el valor no está presente o no coincide en unidades o divisa.
- Extracción de excerpts verbatim con offsets de caracteres, sin posibilidad de texto inventado.
- Citación: devuelve las partes del documento que sustentan la respuesta, con probabilidades, para cualquier tipo de pregunta.
- Multilingüe: post-entrenado en 18 idiomas con énfasis en azerbaiyano; más de 100 idiomas soportados según el autor.
- Robusta ante ruido textual: transliteración, eliminación de diacríticos, erratas y ruido (conjunto Corrupted), y texto escrito de forma descuidada a propósito (conjunto Messy).
- Integración en pipelines de agentes como componente de decisión de baja latencia (unos 10 ms por petición, unos 1 ms por decisión en lote).
- Servidor REST opcional mediante el extra `thx01[server]`.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica tickets en categorías (facturación, reembolso, login, bug técnico, caída de servicio, entrega, cambio de pedido, pregunta de producto, cambio de cuenta, seguridad y fraude, privacidad de datos, queja, petición de funcionalidad, integración y API, contrato y legal) con probabilidades calibradas, lo que permite umbrales de derivación a humano bien fundamentados y funciona con texto ruidoso o mal escrito.
- Extracción de datos de facturas y declaraciones de aduanas: las preguntas de tipo `number` devuelven importes y cantidades tal como aparecen en el documento, normalizados, y las de tipo `excerpt` localizan el span exacto con offsets para auditoría.
- Análisis de informes de resultados financieros: extracción de magnitudes (ingresos, beneficio neto) con citación de la frase de soporte, útil para generación de resúmenes verificables o alertas automáticas.
- Verificación de citas en contratos y documentación legal: la modalidad `cite` devuelve los fragmentos que sustentan cada respuesta con su probabilidad, lo que permite construir flujos de revisión con trazabilidad.
- Routing dentro de agentes multi-paso: dado el estado del agente (traza, JSON, mensaje), el modelo decide en un forward pass qué herramienta o rama activar, con latencia de milisegundos que permite muchas decisiones por turno sin dominar el coste total.
- Triaje de correo electrónico entrante: clasificación por tipo y urgencia con `choice` y `score`, y extracción de importes o fechas mediante `number`, en un único paso por mensaje.
- Clasificación multilingüe en atención al cliente: cubre azerbaiyano, ruso, turco, inglés y otros idiomas del post-entrenamiento con el mismo modelo, sin necesidad de modelos por idioma.

## Benchmarks y rendimiento

Clasificación de tickets de soporte (15 categorías, 2.843 tickets en azerbaiyano, ruso, inglés y turco; cuatro conjuntos de test: Clean, Corrupted, Messy e Independent). ECE medido en el conjunto Independent:

| Modelo | Clean | Corrupted | Messy | Independent | Avg | ECE | Latencia |
|---|---|---|---|---|---|---|---|
| THX-01 | 99,2 | 97,7 | 98,8 | 97,9 | 98,4 | 0,003 | ~10 ms |
| Claude Sonnet 5.5 † | 98,5 | 98,0 | 98,5 | 99,0 | 98,5 | – | 1,5 s |
| Wahoo 1.5 | 99,8 | 96,3 | 98,0 | 97,2 | 97,8 | – | 145 ms |
| GPT-6-Luna | 98,6 | 97,4 | 96,7 | 98,2 | 97,7 | – | 1,9 s |
| TypeSafe Jev 1.13 | 99,2 | 95,0 | 96,2 | 99,0 | 97,4 | 0,007 | 331 ms |
| Kev-4B | 96,1 | 88,4 | 90,8 | 95,8 | 92,8 | 0,202 | 830 ms |

† Evaluado sobre un subconjunto estratificado de 200 tickets por conjunto. Los LLM de la comparativa no devuelven probabilidades, por lo que no se reporta ECE para ellos. La latencia de THX-01 es en una GPU; la del resto, a través de sus APIs.

Extracción y citación (documentos multilingües held-out: informes de resultados, facturas, declaraciones de aduanas, contratos, noticias y correos; 1.824 preguntas de número y 1.357 de excerpt). La model card incluye una tabla comparativa con el checkpoint anterior, pero en la información disponible solo consta la fila del task "Number", sin valores numéricos; el resto de resultados se presentan únicamente en la figura `assets/thx01_extraction.png`. Por tanto, los valores concretos de precisión de valor exacto, token F1 de excerpt y precisión de la parte de soporte principal no están disponibles en el texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 322M de parámetros, los pesos en safetensors ocupan aproximadamente 1,3 GB en fp32 y unos 0,65 GB en fp16/bf16; el repo completo pesa 2,6 GB.
- GPU recomendadas: la model card solo indica que la latencia de ~10 ms por petición se mide "en una GPU" y que el modelo se carga en GPU si está disponible (`thx01.load` usa GPU si existe). No se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: por tamaño (322M de parámetros) es previsible que sí, pero la información proporcionada no lo confirma ni enumera modelos concretos.
- Opciones de despliegue: librería Python `thx01` desde PyPI (`pip install thx01`), con servidor REST mediante `pip install "thx01[server]"`. Los pesos se descargan del repositorio de Hugging Face en el primer uso. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 10 ms por petición en una GPU y aproximadamente 1 ms por decisión cuando se procesa en lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Avg tickets | ECE | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| THX-01 | 322M | 1.024 tokens por pregunta | 98,4 | 0,003 | ~10 ms | Apache 2.0 | Pesos abiertos en Hugging Face |
| TypeSafe Jev 1.13 | No disponible | No disponible | 97,4 | 0,007 | 331 ms | No disponible | No disponible |
| Kev-4B | ~4B (por el nombre) | No disponible | 92,8 | 0,202 | 830 ms | No disponible | No disponible |
| Wahoo 1.5 | No disponible | No disponible | 97,8 | – | 145 ms | No disponible | No disponible |
| Claude Sonnet 5.5 | No disponible | No disponible | 98,5 † | – | 1,5 s | Propietaria | API |
| GPT-6-Luna | No disponible | No disponible | 97,7 | – | 1,9 s | Propietaria | API |

† Evaluado sobre un subconjunto estratificado de 200 tickets por conjunto. Los datos de parámetros, contexto y licencia de los modelos comparables no constan en la información proporcionada.

## Limitaciones y advertencias

- Los estados más largos de 1.024 tokens por pregunta se truncan, lo que puede eliminar información relevante en documentos extensos.
- La extracción de números no realiza conversión de unidades ni de divisas: una pregunta en kilómetros sobre un documento en millas, o en euros sobre un documento en dólares, devuelve `null`.
- El modelo es no autorregresivo y está especializado en decisión, clasificación y extracción; no genera texto libre.
- La calibración reportada (ECE de 0,003) corresponde al conjunto Independent de su benchmark de tickets; no hay datos de calibración en otros dominios en la información disponible.
- El énfasis del post-entrenamiento está en azerbaiyano y en los 18 idiomas listados; el rendimiento en el resto de los más de 100 idiomas "soportados" no está cuantificado en la información disponible.
- Los benchmarks de la model card están publicados por el propio autor; no se han verificado de forma independiente en la información proporcionada.
- No se detallan sesgos conocidos ni tasas de alucinación en la información disponible; la modalidad `excerpt` sí está diseñada para no poder contener texto inventado al cortarse directamente del documento.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base `jhu-clsp/mmBERT-base` antes de desplegar.
- La librería requiere `thx01` (no es un modelo servible directamente con transformers sin adaptación) y descarga los pesos en el primer uso, lo que añade latencia de arranque en entornos efímeros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/doofz/System1
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Paquete PyPI: https://pypi.org/project/thx01/
- Figura de benchmarks de tickets: `assets/thx01_ticket_bars.png` (en el repositorio del modelo)
- Figura de robustez: `assets/robustness.png` (en el repositorio del modelo)
- Figura de extracción: `assets/thx01_extraction.png` (en el repositorio del modelo)
