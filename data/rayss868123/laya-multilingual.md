# rayss868123/laya-multilingual

## Resumen

Laya Multilingual es un modelo de decisión no autorregresivo de tipo "System 1" desarrollado por Convai Innovations, publicado como parte de la familia Laya. No genera texto: recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas con probabilidades en una única pasada forward. Al no haber decodificación autoregresiva, no hay texto que parsear ni margen para alucinación generativa, lo que lo sitúa en la categoría de clasificador y enrutador de baja latencia más que en la de modelo conversacional.

Técnicamente es un encoder bidireccional mmBERT-base (307M parámetros, 22 capas, hidden de 768, vocabulario de 256k) al que se añade una cabeza de decisión entrenada desde cero: dos capas transformer, un scorer de marcadores de opción y una cabeza de actuar/escalar. El total son 321.908.998 parámetros. Su ventana es de 1024 tokens por consulta, de los cuales 256 se reservan para la pregunta y sus opciones, y admite respuestas definidas por petición sin reentrenamiento, ya que cada opción se puntúa en su propio token `[MASK]`.

Es relevante porque cubre más de 100 idiomas y, según la model card, corrige el colapso del checkpoint inglés fuera del inglés: pasa de 0,227 a 0,366 de accuracy macro en MASSIVE con 20 opciones sobre 51 idiomas, y de 23/51 a 45/51 idiomas que superan tres veces el azar. Además, es más rápido que el checkpoint inglés (32,8 ms frente a 39,5 ms por consulta única, y 337 ms frente a 771 ms para 50 consultas). El repositorio analizado aquí es `rayss868123/laya-multilingual`, si bien la model card describe el checkpoint canónico `convaiinnovations/laya-multilingual`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional no autorregresivo (backbone mmBERT-base) más cabeza de decisión propia: 2 capas transformer, scorer de marcadores de opción y cabeza act/escalate |
| Parámetros totales | 321.908.998 (322M); el backbone mmBERT-base aporta 307M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens por consulta: 256 para la pregunta y sus opciones, ~768 para el estado. El encoder mmBERT-base admite hasta 8192 tokens con RoPE, pero el checkpoint está configurado a 1024 |
| Tipos de cuantización | No disponible. No se publican variantes GGUF, AWQ ni GPTQ. El repositorio ocupa 0,7 GB, lo que sugiere pesos en 16 bits (322M × 2 bytes ≈ 0,64 GB), pero no se declara explícitamente |
| Idiomas soportados | Más de 100 idiomas. Declarados: en, de, fr, es, pt, it, nl, sv, da, nb, ru, pl, tr, ar, he, fa, ur, hi, bn, ta, te, kn, ml, th, vi, id, ms, tl, ja, ko, zh, el, hu, fi, ro, sq, sl, sw, af, cy, am, hy, ka, km, my, mn, lv, is, az, jv |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline declarado | text-classification |
| Tamaño del repositorio | 0,7 GB |
| Autoría | Modelo de Convai Innovations, publicado en el repositorio aquí analizado por `rayss868123` |

## Arquitectura y entrenamiento

El modelo es un encoder bidireccional puro sin decodificador. El backbone es mmBERT-base: 22 capas, dimensión oculta 768 y un vocabulario de 256.000 tokens, con 307M parámetros. Sobre él se monta una cabeza de decisión entrenada desde cero compuesta por dos capas transformer, un scorer de marcadores de opción y una cabeza act/escalate. La innovación central es el mecanismo de marcadores de opción: cada opción candidata se puntúa en su propio token `[MASK]` y después se aplica softmax únicamente sobre las opciones de esa pregunta. Esto permite definir el espacio de respuestas por petición, sin reentrenar el modelo, y explica por qué el coste por consulta crece de forma sublineal al añadir preguntas (7,2 ms por pregunta con 10 preguntas, 6,8 ms con 50).

El entrenamiento se realizó desde cero con RLCD (15.987 actualizaciones, 4 épocas, aproximadamente 4,97 horas según la model card). No se detalla la composición del dataset, el volumen de tokens ni si hubo fases adicionales de RLHF o DPO. La model card describe un presupuesto de 1024 tokens por pregunta, con 256 reservados para el enunciado y sus opciones. El checkpoint se distribuye sin calibrar: los parámetros de temperatura son `[1.0, 1.0, 1.0]` y no hay cubos por número de opciones, de modo que la recalibración corre a cargo de quien lo despliega.

## Capacidades

- Clasificación de texto multilingüe con espacio de etiquetas definido en tiempo de petición mediante preguntas tipadas.
- Preguntas de tipo `choice` (selección entre opciones con criterios descritos en lenguaje natural) y de tipo `noul` (respuesta sí/no, según el ejemplo de la model card).
- Devolución de respuestas tipadas acompañadas de probabilidades, procedentes del softmax sobre las opciones de cada pregunta.
- Cabeza act/escalate: capacidad de decidir si el caso debe resolverse automáticamente o escalarse.
- Inferencia no autorregresiva: una única pasada forward, sin generación de texto, sin muestreo y sin decodificación especulativa.
- Cobertura de más de 100 idiomas, con enrutado automático por escritura del input.
- Integración con `Router` para seleccionar entre el checkpoint inglés y el multilingüe por petición, con `preload` para mantener ambos residentes y `attach` para registrar un `Agent` ya construido.
- Uso como componente de guardrails, moderación y enrutado dentro de pipelines de agentes, aunque el modelo en sí no ejecuta tool calling ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas, visión, audio ni modo "thinking"; no es un modelo de propósito general.

## Casos de uso

- Triaje de tickets de soporte multilingüe: el modelo recibe el cuerpo del ticket y una pregunta `choice` con departamentos (facturación, técnico, ventas) y devuelve la opción más probable con su probabilidad. El ejemplo de la model card resuelve un ticket en hindi sobre un doble cobro de la factura 4411 asignándolo a billing.
- Enrutado de idioma en producción: con `Router`, una carga mixta dirige las peticiones en inglés al checkpoint inglés y el resto al multilingüe. El enrutado se decide por la escritura del input antes del forward, y `preload(["english", "multilingual"])` evita el intercambio de checkpoint en cada cambio de idioma.
- Moderación y guardrails: clasificar mensajes entrantes contra políticas definidas como opciones, aprovechando que el modelo no genera texto y que el espacio de etiquetas se define por petición sin reentrenar.
- Extracción de decisiones a partir de JSON: dado un estado en formato JSON y preguntas tipadas, obtener campos booleanos o categóricos con probabilidad asociada, útil para enriquecer eventos en pipelines de datos.
- Clasificación de intención para asistentes conversacionales: con 20 intenciones definidas por petición, el modelo resuelve la intención en una sola pasada en lugar de invocar a un LLM generativo, con 337 ms para 50 preguntas.
- Triaje de solicitudes de reembolso: la pregunta de tipo `noul` ("¿el remitente pide que se le devuelva el dinero?") permite separar automáticamente los casos que requieren intervención humana usando la cabeza act/escalate.
- Análisis de encuestas y formularios abiertos multilingües: clasificar respuestas de texto libre en categorías predefinidas en decenas de idiomas con un único modelo, evitando mantener un clasificador por idioma.
- Prefiltrado antes de un LLM: usar el modelo como System 1 barato que descarta o etiqueta la mayoría del tráfico y reserva el modelo generativo para los casos marcados para escalado.
- Inferencia de relación textual e idioma en tareas tipo XNLI: con 0,731 de media en los 14 idiomas no ingleses de XNLI, es utilizable para triaje de implicación textual, no para decisiones de alta precisión.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan el checkpoint inglés (`laya`) con el multilingüe (`laya-multilingual`) sobre preguntas idénticas byte a byte.

| Prueba | `laya` (inglés) | `laya-multilingual` |
|---|---|---|
| MASSIVE, 20 opciones (azar = 0,050), accuracy macro sobre 51 idiomas | 0,227 | 0,366 |
| MASSIVE, ECE macro | 0,733 | 0,387 |
| MASSIVE, idiomas que superan 3× el azar | 23 / 51 | 45 / 51 |
| XNLI, inglés | 0,860 | 0,843 |
| XNLI, otros 14 idiomas | 0,521 | 0,731 |
| Decisiones tipadas zero-shot | No disponible para este checkpoint | 0,342 (dato truncado en la model card; se menciona una referencia de 0,318) |

Mejoras por idioma en MASSIVE (checkpoint inglés → multilingüe): árabe 0,110 → 0,400; bengalí 0,080 → 0,290; azerí 0,100 → 0,300; hindi 0,100 → 0,387; coreano 0,110 → 0,490; turco 0,140 → 0,437.

Colapsos del checkpoint inglés documentados en la model card, todos con confianza declarada alta: jemer 0,000 de accuracy con 0,952 de confianza; hebreo 0,060; armenio 0,050 (exactamente azar); bengalí 0,080. La confianza media del checkpoint inglés nunca baja de 0,885, lo que impide usar la confianza como puerta de calidad.

Latencia publicada (hardware no especificado en la tabla; el texto menciona una T4 para el throughput):

| Preguntas por llamada | `laya` | `laya-multilingual` |
|---|---|---|
| 1 | 39,5 ms | 32,8 ms |
| 10 | 158,6 ms (15,9 ms/pregunta) | 72,3 ms (7,2 ms/pregunta) |
| 50 | 771 ms | 337 ms (6,8 ms/pregunta) |

Throughput declarado: 103–332 preguntas por segundo en batch sobre una T4.

## Requisitos de hardware

- No se publica una huella de VRAM oficial. Estimación aritmética a partir de los 321.908.998 parámetros (no confirmada por el autor): en fp32 unos 1,3 GB; en fp16/bf16 unos 0,65 GB, coherente con el repositorio de 0,7 GB; en int8 unos 0,35 GB. A esto hay que sumar activaciones, que son pequeñas al no existir caché KV.
- Al ser una única pasada forward sin decodificación autoregresiva, la memoria no crece con la longitud de salida, solo con la longitud de entrada hasta 1024 tokens.
- Cabe con holgura en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente en fp16. La model card cita explícitamente una T4 como hardware de referencia para las cifras de throughput.
- GPU de centro de datos (A100, H100, L4, T4) permiten lotes grandes y aprovechar la mejora de rendimiento por pregunta a medida que crece el batch (de 15,9 ms/pregunta con 1 pregunta en el modelo inglés a 6,8 ms/pregunta con 50 en el multilingüe).
- Despliegue documentado: la librería `transformers` (pipeline de text-classification) y el paquete `laya` de PyPI, que expone `laya.load()`, `Agent.predict()` y `Router`. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp en la información disponible, y no hay pesos GGUF publicados.
- Advertencia operativa: si TensorFlow está instalado, `transformers` lo detecta al importar y su runtime abseil puede bloquear la construcción del modelo; la model card recomienda ejecutar con `USE_TF=0`.
- El vocabulario de 256.000 tokens implica una matriz de embeddings grande en relación al tamaño del modelo, factor a tener en cuenta en el arranque en frío.

## Comparativa con modelos similares

| Modelo | Encoder | Parámetros | Contexto | Rendimiento destacado | Licencia |
|---|---|---|---|---|---|
| `laya-multilingual` (este) | mmBERT-base | 322M | 1024 | MASSIVE macro 0,366; XNLI no-inglés 0,731; 32,8 ms por consulta | Apache 2.0 |
| `laya` | ModernBERT-large | 421M | 512 | MASSIVE macro 0,227; XNLI inglés 0,860; 39,5 ms por consulta | No disponible en la información proporcionada |
| `laya-typed-decisions` | ModernBERT-large | 421M | 1024 | Orientado a los flujos de decisiones tipadas | No disponible en la información proporcionada |
| `rayss868123/laya` | No disponible | No disponible | No disponible | No disponible | No disponible |

Frente a un clasificador multilingüe convencional basado en XLM-R o mBERT, la diferencia no está en los parámetros, sino en el mecanismo de marcadores de opción, que permite definir el espacio de etiquetas por petición sin reentrenamiento, y en la cabeza act/escalate. No se han publicado en la información disponible comparativas contra XLM-R, mBERT ni clasificadores multilingües de terceros, por lo que la comparación cuantitativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Se distribuye sin calibrar: temperatura `[1.0, 1.0, 1.0]` y sin cubos por número de opciones. La confianza media declarada es de 0,75–0,83 frente a una accuracy muy inferior, es decir, es sistemáticamente sobreconfiado. La propia model card indica que reajustar una temperatura por (tipo de pregunta, número de opciones) sobre datos reservados mueve el ECE medio de 0,314 a 0,106: hay que recalibrar con datos propios antes de confiar en las probabilidades.
- Es más débil en inglés que el checkpoint específico en inglés: 0,619 frente a 0,684 de media macro en las suites inglesas. La recomendación del autor es enrutar, no sustituir.
- Rendimiento casi de azar en decisiones tipadas zero-shot: 0,342 frente a una referencia de 0,318. El dato está truncado en la model card, por lo que no se puede verificar la métrica exacta ni la línea base completa.
- La accuracy macro de 0,366 en MASSIVE con 20 opciones está muy por encima del azar (0,050), pero no es suficiente para decisiones desatendidas de alta precisión. Seis de los 51 idiomas siguen sin superar tres veces el azar.
- La confianza no sirve como puerta de calidad: el checkpoint inglés mantiene confianza media por encima de 0,885 incluso con accuracy cercana a cero (jemer: 0,000 de accuracy con 0,952 de confianza). Este es el motivo declarado por el que el enrutado se decide por la escritura del input y no por la confianza del modelo.
- Riesgo de alucinación generativa nulo por diseño, ya que no produce texto libre, pero sí existe riesgo de respuesta errónea con probabilidad alta en idiomas o dominios poco representados.
- Contexto limitado a 1024 tokens por consulta, de los cuales solo ~768 quedan para el estado. Los documentos largos deben truncarse o dividirse, lo que puede eliminar información relevante.
- La composición del dataset de entrenamiento, el volumen de tokens y la existencia de fases de RLHF/DPO no se detallan, por lo que no es posible auditar de qué datos provienen los sesgos. No se documentan sesgos específicos medidos.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales declaradas, pero traslada al integrador la responsabilidad de recalibrar, validar por idioma y asumir el cumplimiento normativo del dominio de aplicación.
- El identificador de HuggingFace proporcionado (`rayss868123/laya-multilingual`) no coincide con el repositorio canónico descrito en la model card (`convaiinnovations/laya-multilingual`). El repositorio analizado registra 0 descargas y 0 likes, por lo que no hay validación comunitaria ni garantía documentada de que los pesos sean idénticos a los del repositorio original. Para producción, conviene verificar la procedencia y comparar los pesos antes de desplegar.
- No hay soporte documentado de cuantizaciones GGUF/AWQ/GPTQ ni de motores como vLLM, Ollama o llama.cpp, lo que limita las opciones de despliegue a `transformers` o al paquete `laya`.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/rayss868123/laya-multilingual
- Repositorio canónico del checkpoint multilingüe: https://huggingface.co/convaiinnovations/laya-multilingual
- Checkpoint inglés de la familia: https://huggingface.co/convaiinnovations/laya
- Checkpoint de decisiones tipadas: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio de la familia Laya: https://huggingface.co/convaiinnovations/laya
- Repositorio del mismo autor: https://huggingface.co/rayss868123/laya
- Sitio del proyecto: https://laya.convaiinnovations.com/
- Paquete en PyPI: https://pypi.org/project/laya/
- Ficha técnica en Gradually: https://www.gradually.ai/en/ai-models/laya-multilingual/
- Paper de arXiv de marzo de 2025 sobre trayectorias de conversión de secuencias, mencionado en el blog del proyecto: enlace directo no disponible en los resultados de búsqueda.
