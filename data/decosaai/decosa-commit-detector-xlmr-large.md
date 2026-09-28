# decosaai/decosa-commit-detector-xlmr-large

## Resumen

decosa-commit-detector-xlmr-large es un clasificador de texto multilingüe desarrollado por decosaai que decide, antes de que un agente de navegador o de uso de ordenador pulse un elemento, si ese clic ejecuta una acción difícil de deshacer (un «commit») y de qué tipo: `pay`, `delete`, `send`, `publish`, `submit`, `security` o `none`. No genera texto ni llama a un LLM: recibe la descripción estructurada del elemento (rol y etiqueta) junto con el título de la página, la ruta de la URL, el encabezado y el texto cercano, y devuelve la probabilidad de cada clase. Con esa señal, un guardián externo puede detener al agente y pedir confirmación humana antes de la acción.

El modelo parte de FacebookAI/xlm-roberta-large (560M parámetros, encoder transformer) y se ha afinado por completo para clasificación de secuencias en 7 clases. Cubre 34 idiomas (36 códigos contando pt-BR y es-419), incluidas las 24 lenguas oficiales de la Unión Europea. Se ejecuta en CPU con una latencia de 47-88 ms por clic, por lo que puede interceptar cada interacción de un agente sin coste de GPU ni de API.

Su relevancia actual radica en que la mayoría de agentes filtran los clics peligrosos con listas de palabras clave en inglés: en los conjuntos de prueba del autor, 12 expresiones regulares detectaron menos del 1% de los commits reales. El modelo eleva el recall al 97-99% manteniendo la latencia en decenas de milisegundos, a cambio de un mayor número de confirmaciones innecesarias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) con cabeza de clasificación de secuencias |
| Parámetros totales | 559.897.607 (~560M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 160 tokens como máximo (el elemento se coloca primero) |
| Tipos de cuantización | No se documentan cuantizaciones específicas en la información disponible; el repositorio publica pesos en safetensors |
| Idiomas soportados | 34 idiomas (36 códigos, con pt-BR y es-419), incluidas las 24 lenguas oficiales de la UE |
| Licencia | Apache 2.0 (el modelo base XLM-R large se distribuye bajo MIT) |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Clases de salida | 7: `pay`, `delete`, `send`, `publish`, `submit`, `security`, `none` |
| Biblioteca | transformers |
| Tamaño del repositorio | 2,3 GB |
| Modelo base | FacebookAI/xlm-roberta-large (commit c23d21b0) |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa large: un encoder transformer con 560M parámetros, al que se ha añadido una cabeza de clasificación para 7 clases. La entrada combina el rol y la etiqueta del elemento interactivo con el título de la página, la ruta de la URL, el encabezado y el texto cercano, de modo que una etiqueta genérica como «OK», «Continue» o «Weiter» se juzga en función de la página en la que aparece.

El entrenamiento consistió en un fine-tune completo sobre 16.566 «momentos de interfaz» sintéticos (elemento, título, ruta URL, encabezado, texto cercano y etiqueta) correspondientes a 42 tipos de sitio web, redactados de forma nativa en cada idioma por Qwen3.8-27B; las filas en irlandés y maltés se tradujeron automáticamente desde el inglés con EuroLLM-9B-Instruct. Las filas en las que el generador declaró otra etiqueta distinta de la solicitada se descartaron. La configuración fue AdamW con weight decay 0.01, learning rate 1,5e-5, scheduler coseno con 6% de warm-up, batch 32, 3 épocas, autocast en bf16, label smoothing 0.05 y un máximo de 160 tokens. Como aumentación se eliminan el título, la URL o el contexto con probabilidad del 12% cada uno y se cambia el caso de la etiqueta en un 10%. El entrenamiento completo tardó 145 segundos en una H200. Se entrenaron tres bases (XLM-R large, mmBERT-base y mmBERT-small) y se eligió XLM-R large sobre el split de desarrollo antes de leer cualquier resultado de test; el umbral de seguridad (p(none) < 0,70 implica commit) se fijó en desarrollo para alcanzar un recall de commits ≥ 98%.

## Capacidades

- Clasificación binaria commit vs. none y clasificación del tipo de commit en 7 clases (`pay`, `delete`, `send`, `publish`, `submit`, `security`, `none`).
- Procesamiento de contexto de interfaz: rol del elemento, etiqueta, título de página, ruta de URL, encabezado y texto circundante.
- Cobertura multilingüe de 34 idiomas, incluidos todos los oficiales de la UE, más japonés, chino, coreano, árabe, hindi e indonesio.
- Inferencia en CPU sin llamada a ningún LLM, con latencias declaradas de 47-88 ms por clic.
- Umbral de seguridad configurable orientado a priorizar el recall de commits (por defecto, p(none) < 0,70 se interpreta como commit).
- Integración diseñada para combinarse con reglas propias (el autor usa `modelo OR lista de palabras clave`), nunca como sustituto de un sistema de permisos.
- No dispone de generación de texto, tool calling, capacidades de agente ni visión: es exclusivamente un clasificador de texto. Un botón cuyo efecto solo se aprecia en una imagen queda fuera de su alcance.

## Casos de uso

- Guardia pre-clic en agentes de navegador: antes de ejecutar cada clic, el agente consulta al modelo; si la respuesta es `commit`, se pausa y se solicita confirmación humana mostrando el tipo detectado. Es adecuado porque la inferencia en CPU de 47-88 ms permite interponerlo en cada acción sin degradar el flujo.
- Agentes de uso de ordenador (computer-use) sobre aplicaciones web internas: el modelo cubre 42 tipos de sitio en entrenamiento y 8 tipos de sitio nunca vistos en el conjunto de validación, lo que permite proteger paneles de administración, CRM y herramientas SaaS donde un clic erróneo puede borrar datos o enviar comunicaciones.
- Atención al cliente automatizada con operaciones sensibles: en flujos de devolución, cancelación o cambio de datos bancarios, el modelo distingue entre navegar y confirmar, de modo que el agente solo escala a un humano cuando la acción es realmente irreversible.
- Comercio electrónico multilingüe: con cobertura de los 24 idiomas oficiales de la UE, funciona en procesos de pago, suscripción o publicación localizados sin depender de listas de palabras clave en inglés, que según el autor detectan menos del 1% de los commits reales.
- Automatización de procesos (RPA) con human-in-the-loop: el clasificador puede actuar como paso previo a la ejecución de una macro, etiquetando las acciones como `submit`, `delete` o `security` para enrutar cada una al nivel de aprobación correspondiente.
- Cumplimiento y auditoría: al devolver una etiqueta de tipo (`pay`, `delete`, `send`, `publish`, `submit`, `security`), genera un registro estructurado de por qué una acción requirió aprobación, útil para trazar decisiones en entornos regulados.
- Protección de operaciones de seguridad: el modelo detecta cambios de contraseña, 2FA, claves y permisos como clase `security` (72 de 72 casos detectados en el conjunto independiente), lo que permite bloquear automáticamente estas acciones hasta la validación de una persona.
- Pruebas y evaluación de agentes: puede emplearse para medir cuántos commits reales ejecuta un agente sin supervisión y cuántas confirmaciones innecesarias genera, comparando el comportamiento entre versiones del agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la información disponible, ya que se trata de un clasificador y no de un modelo generativo. El autor sí publica dos conjuntos de evaluación propios, nunca usados en entrenamiento. La tasa de falsos commits mide la proporción de clics inofensivos que el modelo marca como commit, es decir, cuántas veces se pide confirmación a una persona sin motivo.

Conjunto independiente (720 casos, 36 códigos de idioma, redactados por un autor distinto a partir de las definiciones de etiquetas):

| Sistema | Recall de commits | Tasa de falsos commits | Exactitud binaria | Exactitud de tipo |
|---|---|---|---|---|
| 12 expresiones regulares de palabras clave en inglés | 0,2% | 0,7% | 39,9% | — |
| Qwen3.8-27B zero-shot (respuesta de una palabra, greedy) | 98,1% | 1,4% | 98,3% | 97,1% |
| Este modelo (argmax) | 98,4% | 10,1% | 95,0% | 91,4% |
| Este modelo con el umbral de seguridad publicado | 99,1% | 13,2% | 94,2% | 90,6% |

Conjunto de tipos de sitio retenidos (3.206 casos de 8 tipos de web nunca vistos en entrenamiento):

| Sistema | Recall de commits | Tasa de falsos commits | Exactitud binaria | Exactitud de tipo |
|---|---|---|---|---|
| 12 expresiones regulares de palabras clave en inglés | 0,6% | 0,5% | 37,9% | — |
| Qwen3.8-27B zero-shot | 93,2% | 6,2% | 93,4% | 90,6% |
| Este modelo (argmax) | 97,2% | 5,4% | 96,2% | 94,0% |
| Este modelo con el umbral de seguridad publicado | 97,9% | 6,9% | 96,1% | 93,6% |

Datos adicionales declarados: AUROC commit vs. none de 0,989 en el conjunto independiente y 0,987 en el de tipos retenidos. Por tipo de commit en el conjunto independiente: `delete`, `security` y `send` 72/72 detectados, `submit` 71/72, `pay` y `publish` 69/72. Los idiomas más débiles son búlgaro e inglés con 85% de exactitud binaria (20 casos cada uno) y croata, italiano, maltés y rumano con 90%. Todos los números están en `eval_summary.json` dentro del repositorio.

Latencia en CPU (fp32, 8 hilos, un clic cada vez): p50 de 77 ms y p95 de 88 ms en un servidor cargado; p50 de 47 ms en una máquina de 24 hilos en reposo. Se declara una latencia de 50-80 ms por clic en CPU.

## Requisitos de hardware

- VRAM estimada para los pesos: ~2,24 GB en fp32, ~1,12 GB en fp16/bf16 y ~0,56 GB en int8; con activaciones y overhead de runtime, el consumo real se sitúa aproximadamente entre 0,8 y 3 GB según precisión.
- Cabe sin problema en cualquier GPU de consumo con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4090), e incluso puede ejecutarse únicamente en CPU, que es el modo documentado por el autor.
- GPU recomendadas para entrenamiento o fine-tune: una H200 completó el fine-tune completo en 145 segundos. Para inferencia no se requieren GPU de centro de datos; A100 o H100 solo tendrían sentido para servir en lote a gran escala.
- Opciones de despliegue documentadas o sugeridas por las etiquetas del repositorio: transformers (biblioteca declarada) y text-embeddings-inference, con compatibilidad con endpoints. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF.
- Latencia: 47-88 ms por clic en CPU, según carga e hilos disponibles. No se publica throughput por lote ni cifras de inferencia en GPU.

## Comparativa con modelos similares

La comparación natural es con las alternativas que el propio autor evalúa o descarta, ya que no existe un modelo público equivalente especializado en detección de commits de interfaz.

| Modelo | Parámetros | Tipo | Recall (conjunto independiente) | Falsos commits | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| decosa-commit-detector-xlmr-large | ~560M | Clasificador XLM-R large | 98,4% (99,1% con umbral) | 10,1% (13,2% con umbral) | Apache 2.0 | HuggingFace |
| Qwen3.8-27B zero-shot | 27B | LLM generativo | 98,1% | 1,4% | No disponible | No disponible en la información proporcionada |
| 12 expresiones regulares en inglés | No aplica | Reglas | 0,2% | 0,7% | No aplica | Uso interno del autor |
| mmBERT-base / mmBERT-small | No disponible | Clasificador (candidatos descartados) | No disponible | No disponible | No disponible | Entrenados y descartados en favor de XLM-R large |

En el conjunto de tipos de sitio retenidos las cifras cambian: este modelo logra 97,2% de recall y 5,4% de falsos commits (97,9% y 6,9% con el umbral de seguridad), frente al 93,2% y 6,2% de Qwen3.8-27B. Es decir, el clasificador iguala o supera en recall a un LLM de 27B y es mucho mejor que las listas de palabras clave, pero pide confirmaciones innecesarias con más frecuencia que el LLM (aproximadamente 1 de cada 10 clics inofensivos en el conjunto independiente, frente a 1 de cada 70).

## Limitaciones y advertencias

- Datos de entrenamiento sintéticos: los sitios reales tienen árboles de accesibilidad más largos y desordenados, botones solo con icono, banners de cookies y diálogos. El autor indica que el modelo aún no se ha medido sobre trazas reales de agentes.
- Mayor número de confirmaciones innecesarias que un LLM: 10,1% de clics inofensivos marcados como commit en el conjunto independiente (13,2% con el umbral de seguridad), frente al 1,4% de Qwen3.8-27B. Los falsos commits típicos son botones que solo parecen definitivos, como un «Continue» a mitad de flujo o un «Delete» de un filtro de búsqueda.
- Solo texto: no ve la captura de pantalla, por lo que un botón cuyo efecto únicamente es visible en una imagen queda fuera de su alcance.
- Irlandés y maltés proceden de traducción automática desde el inglés, por lo que son idiomas menos fiables.
- Diferencias de exactitud por idioma: búlgaro e inglés bajan al 85% de exactitud binaria y croata, italiano, maltés y rumano se quedan en el 90% en el conjunto independiente.
- Un resultado `none` significa que el modelo no ha reconocido un commit, no que no exista. El propio autor advierte de que no debe usarse como única salvaguarda cuando un commit no detectado sea inaceptable.
- El conjunto de etiquetas es una decisión de política, no una verdad objetiva: «add to cart» no cuenta como commit y cancelar una suscripción se etiqueta como `delete`. El umbral y qué tipos requieren aprobación deben ajustarse a la política de cada organización.
- Uso previsto restringido: guardia previo al clic que pausa y pregunta a una persona. No debe emplearse para que el modelo decida por sí solo que una acción es segura sin intervención humana.
- El conjunto de datos de entrenamiento y el generador no se publican, lo que dificulta reproducir el entrenamiento o auditar la composición del corpus.
- La model card está truncada en la sección de uso (el ejemplo de código Python queda cortado), por lo que la API exacta del envoltorio `CommitDetector` no está documentada por completo en la información disponible.
- El modelo figura con 0 descargas y 0 «likes» y fue creado el 28 de septiembre de 2026, por lo que no existe todavía validación externa de sus resultados.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base XLM-R large se distribuye bajo MIT, condición que conviene respetar al redistribuir pesos derivados.

## Enlaces

- [Ficha en HuggingFace: decosaai/decosa-commit-detector-xlmr-large](https://huggingface.co/decosaai/decosa-commit-detector-xlmr-large)
- [Modelo base: FacebookAI/xlm-roberta-large](https://huggingface.co/FacebookAI/xlm-roberta-large)
- `eval_summary.json` con todos los números de evaluación, incluido en el repositorio del modelo
- No se han encontrado en la información proporcionada artículos, blogs, repositorios de código o demos adicionales.
