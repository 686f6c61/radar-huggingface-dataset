# AtomGradient/Qwen3.5-2B-Chronos-OpenVINO-INT4

## Resumen

AtomGradient/Qwen3.5-2B-Chronos-OpenVINO-INT4 es una derivacion del modelo Qwen3.5-2B en formato OpenVINO INT4, publicada por el usuario AtomGradient sobre el checkpoint OpenVINO/Qwen3.5-2B-int4-ov. Se trata de un modelo de generacion de texto de 2.000 millones de parametros, pensado para inferencia en CPU mediante el runtime de OpenVINO, con pesos cuantizados a 4 bits. El repositorio ocupa 1,8 GB y se distribuye bajo licencia Apache-2.0.

La particularidad del artefacto no es el modelo en si, sino el empaquetado: el autor ha aplicado una permutacion de filas sobre los pesos INT4 (pesos, puntos cero y escalas) de las capas de atencion completa con indices [11, 15, 19, 23], etiquetada como "Chronos V9 co-locked" y "fa-only". Segun la model card, esa permutacion es reversible de forma exacta (bit a bit) mediante un sobre firmado que no se incluye en el repositorio publico; sin ese material, los pesos permutados no producen los logits originales del modelo base.

Esto convierte al modelo en un artefacto condicionado a un runtime autorizado: la card indica que solo se permite ejecucion en CPU, que se rechazan la ejecucion en GPU de OpenVINO y las caches de modelo compilado en disco, y que el desbloqueo se aplica en RAM. Para un desarrollador que busque un modelo listo para produccion, el repositorio no es directamente utilizable sin acceso al mecanismo de desbloqueo del autor; para quien investigue tecnicas de proteccion de pesos o distribucion controlada de modelos, resulta un caso de estudio poco habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-2B); no se detalla en la informacion disponible |
| Parametros totales | 2B (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (pesos empaquetados con zero-point y scale); formato OpenVINO |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (modelo compilado/exportado para runtime OpenVINO), cuantizado INT4 |
| Tamano del repositorio | 1,8 GB |
| Modelo base | OpenVINO/Qwen3.5-2B-int4-ov |
| Runtime | OpenVINO, CPU exclusivamente |
| hidden_size | 2048 (indicado en la card para el tag `2b`) |
| Capas con permutacion | Full-Attention en indices [11, 15, 19, 23] |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base OpenVINO/Qwen3.5-2B-int4-ov, es decir, un transformer decoder-only de la familia Qwen3.5 con aproximadamente 2.000 millones de parametros y un `hidden_size` de 2048. No se dispone de informacion sobre el numero de capas totales, el numero de cabezas de atencion, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; la model card no los documenta y se limita a describir el proceso de empaquetado.

La innovacion tecnica documentada es el esquema "Chronos V9 co-locked": sobre las capas de atencion completa [11, 15, 19, 23] se aplica una permutacion de filas a los pesos INT4 empaquetados, a los zero-points y a las escalas, junto con un digest de grafo XML embebido (`chronos_co_lock.kernel_required = true`). La permutacion se describe como sin perdida (lossless) y reversible de forma exacta: el runtime autorizado recibe un `ModelUnlockEnvelope v1` firmado y de vida corta, basado en DHKEM-P256 + HKDF-SHA256 + AES-256-GCM, y aplica la permutacion inversa en RAM sobre CPU, obteniendo paridad bit a bit con los logits del modelo base. No se documenta ningun entrenamiento adicional ni fine-tuning sobre el checkpoint original.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` con etiqueta `conversational`, por lo que el modelo esta orientado a dialogos multi-turno.
- Razonamiento y codigo: capacidades heredadas presuntamente del modelo base Qwen3.5-2B; no se documentan evaluaciones ni detalles en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta relleno en el repositorio.
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- Ejecucion en CPU: el modelo esta empaquetado y restringido a inferencia en CPU mediante OpenVINO, con rechazo fail-closed de GPU y de caches compiladas en disco.

## Casos de uso

- Prototipado de asistentes conversacionales en entornos sin GPU: al ejecutarse en CPU con OpenVINO INT4, permite desplegar un chatbot de 2B en portatiles o servidores sin acelerador, siempre que se cuente con el material de desbloqueo del autor.
- Inferencia en el borde o en estaciones de trabajo ofimaticas: el tamano de 1,8 GB y la cuantizacion INT4 facilitan distribuir el modelo en equipos con poca memoria, aunque la restriccion de CPU limita el rendimiento frente a variantes GPU.
- Evaluacion de tecnicas de proteccion de pesos: el esquema co-locked con sobre firmado y permutacion reversible es un caso practico para estudiar distribucion controlada de modelos, atestacion de runtime o licenciamiento tecnico.
- Investigacion sobre paridad numerica en cuantizacion: la afirmacion de paridad bit a bit en logits frente al modelo base permite reproducir experimentos sobre invariancia de permutaciones en pesos INT4.
- Despliegue interno con control de acceso: organizaciones que quieran restringir la ejecucion a runtimes autorizados pueden usar este patron para evitar copias no controladas del modelo, a costa de depender del emisor de sobres.
- Integracion en pipelines de OpenVINO existentes: si la infraestructura ya usa OpenVINO para CPU, el artefacto encaja en el mismo runtime, con la salvedad de que hay que integrar el paso de desbloqueo en memoria antes de la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta restringido a ejecucion en CPU y el autor rechaza explicitamente la ejecucion en GPU de OpenVINO.
- Memoria RAM estimada: el repositorio pesa 1,8 GB en INT4; se requiere adicionalmente memoria para el runtime, el grafo desbloqueado en RAM y el contexto de inferencia. No se publican cifras exactas.
- GPU recomendadas: ninguna; el artefacto es CPU-only por diseno.
- CPU: no se especifican modelos ni instrucciones minimas (AVX2, AVX-512, AMX); no disponible.
- Opciones de despliegue: runtime OpenVINO con el mecanismo de desbloqueo del autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que el formato es OpenVINO IR y los pesos estan permutados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| AtomGradient/Qwen3.5-2B-Chronos-OpenVINO-INT4 | ~2B | no disponible | OpenVINO INT4, pesos permutados | Apache-2.0 | Requiere desbloqueo del autor; CPU-only |
| OpenVINO/Qwen3.5-2B-int4-ov | ~2B | no disponible | OpenVINO INT4 | no disponible en la informacion | Modelo base, ejecutable directamente |
| Qwen3.5-2B (original) | ~2B | no disponible en la informacion | safetensors | no disponible en la informacion | Referencia upstream de la familia |

La comparativa se limita a los tres artefactos identificables a partir de la informacion disponible; no se dispone de datos de rendimiento ni de contexto para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- El repositorio no incluye el material de desbloqueo: sin el `ModelUnlockEnvelope v1` emitido por el autor, los pesos permutados no reproducen los logits del modelo base y el modelo no es utilizable tal cual.
- Dependencia de un tercero: el uso en produccion queda condicionado a la disponibilidad del emisor de sobres firmados y de vida corta, lo que introduce un punto unico de fallo operativo.
- Restriccion de runtime: solo CPU; se rechazan la GPU de OpenVINO y las caches de modelo compilado en disco, lo que limita el rendimiento y complica el escalado.
- Ausencia de documentacion sobre el modelo base: no se detallan contexto, idiomas, datos de entrenamiento ni evaluaciones, lo que impide estimar calidad, sesgos o alucinaciones.
- Riesgo de alucinacion y sesgos: inherente a un modelo de 2B sin datos de evaluacion publicados; no cuantificado.
- Licencia: Apache-2.0 sobre la derivacion, pero la permutacion y el mecanismo de desbloqueo anaden una capa de control tecnico que puede entrar en tension con expectativas de uso libre del artefacto.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fechas del repositorio: creado y actualizado el 2026-11-19, lo que conviene verificar antes de integrarlo en cualquier pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/AtomGradient/Qwen3.5-2B-Chronos-OpenVINO-INT4
- Modelo base: https://huggingface.co/OpenVINO/Qwen3.5-2B-int4-ov
