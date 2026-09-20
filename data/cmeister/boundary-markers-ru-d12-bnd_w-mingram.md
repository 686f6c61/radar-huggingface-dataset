# cmeister/boundary-markers-ru-d12-bnd_w-mingram

## Resumen

`cmeister/boundary-markers-ru-d12-bnd_w-mingram` es un modelo de lenguaje pequeño en ruso publicado por el usuario cmeister como artefacto de investigación sobre tokenización. No es un modelo orientado a producto, sino una de las tres réplicas (semillas 0, 1 y 2) de un experimento controlado que compara vocabularios de subpalabras que marcan explícitamente las fronteras de palabra, siguiendo el esquema del artículo *Explicit Boundary Markers for Subword Vocabularies* (Sander Land y Clara Meister, arXiv:2608.08847). El tokenizador inserta el marcador `<|>` a ambos lados de cada palabra, elimina el espacio simple entre palabras marcadas al codificar y lo restaura al decodificar a partir de los dos marcadores contiguos.

La arquitectura es un transformer decoder de tipo nanochat: 12 capas, anchura 768, 6 cabezas de atención y una longitud de contexto de 2.048 tokens. El entrenamiento se realizó con nanochat en el commit `92d63d4`, durante 2.553 pasos de 524.288 tokens cada uno, lo que da un total de 1.340 millones de tokens vistos sobre una muestra de 10 shards de Russian FineWeb-2 (2.920 millones de caracteres, leídos aproximadamente 3,35 veces). El vocabulario tiene 34.685 entradas en el tokenizador y 34.686 en el modelo, que añade un token de inicio de secuencia.

Su relevancia actual es metodológica: permite medir, en ruso y con un pipeline reproducible, si marcar las fronteras de palabra en el vocabulario mejora la compresión del texto frente a un vocabulario plano entrenado idénticamente. En los tres seeds disponibles el esquema `bnd_w` obtiene una pérdida de validación en bits por byte inferior a la del esquema `plain`, con una diferencia media de +0,00584 bits por byte a su favor. Con solo tres semillas y 1,34 mil millones de tokens de entrenamiento, el resultado debe interpretarse como una dirección, no como una estimación precisa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (nanochat, commit `92d63d4`): 12 capas, anchura 768, 6 cabezas de atención |
| Parámetros totales | No publicado en el repositorio; estimación a partir de las dimensiones declaradas: del orden de 110-140 M (12 capas × anchura 768 con vocabulario de 34.686 entradas) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible: el repositorio solo distribuye el state dict de PyTorch en el formato original del entrenamiento |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | State dict de PyTorch (`seed<n>/model_002553.pt`), cargable con `torch.load(..., weights_only=True)`; tokenizador en JSON comprimido con gzip |

## Arquitectura y entrenamiento

El modelo sigue la implementación de nanochat en el commit `92d63d4`: un transformer decoder denso de 12 capas con anchura 768 y 6 cabezas de atención, entrenado con un contexto de 2.048 tokens. Los tres seeds comparten exactamente la misma arquitectura, el mismo texto y el mismo orden de shards; lo único que cambia entre ellos es la inicialización de pesos y el orden de los bloques de datos. Dentro de una misma semilla, los modelos de los distintos brazos del estudio (por ejemplo, `bnd_w` frente a `plain`) se diferencian únicamente en el tokenizador, lo que convierte el conjunto en un experimento controlado de tokenización.

El tokenizador se entrenó con MinGram sobre una muestra de 5 GB de Russian FineWeb y tiene un vocabulario de 34.685 entradas (34.686 en el modelo, que añade el token de inicio de secuencia). El fichero es `tokenizer/fineweb_ru_5gb_quick_bnd_w_mingram_v34685.json.gz`, con sha256 `599fdd1026c0cd982cde7f59d1a10c7070f6d301f4495a6c2730a42831da87f1`, y requiere el código de `script_tok` (clase `BoundaryMinGramModel`) para cargarse. El texto de entrenamiento son 10 shards de Russian FineWeb-2, de la release `fineweb-2_0_1-quality_10-filterrobots`, con 2.920 millones de caracteres leídos unas 3,35 veces. En total, 2.553 pasos de 524.288 tokens por modelo, es decir, 1.340 millones de tokens, con una GPU por modelo. No se documenta ningún uso de RLHF, DPO ni ajuste por instrucciones: son modelos base entrenados con el objetivo de modelado de lenguaje.

## Capacidades

- Generación de texto en ruso: es un modelo base de tipo GPT entrenado exclusivamente con modelado de lenguaje autorregresivo sobre Russian FineWeb-2.
- Comparación de vocabularios de subpalabras: el modelo existe para medir el efecto de los marcadores explícitos de frontera (`<|>` a ambos lados de cada palabra) frente a un vocabulario plano entrenado en condiciones idénticas.
- Codificación y decodificación con restauración de espacios: el tokenizador elimina el espacio simple entre palabras marcadas al codificar y lo reconstruye al decodificar a partir de los dos marcadores contiguos.
- Evaluación intrínseca mediante bits por byte: permite calcular la pérdida sumada sobre un shard reservado de Russian FineWeb-2 dividida por la longitud UTF-8 real del texto puntuado.
- Reproducibilidad experimental: los tres seeds comparten el orden de shards, de modo que las comparaciones entre seeds y entre tokenizadores son directas.
- Razonamiento, matemáticas, código, visión, audio, tool calling, function calling, agentes y razonamiento multi-paso: no disponibles; no se ha realizado ningún ajuste ni evaluación en estas direcciones.
- Capacidades multilingües: no disponibles; el modelo está entrenado y evaluado únicamente en ruso y sus valores de bits por byte solo son comparables dentro del mismo idioma.
- Modo de pensamiento (*thinking*), plantilla de chat o etiquetas de rol: no disponibles.

## Casos de uso

- Investigación en tokenización de subpalabras: sirve para replicar y extender el resultado del artículo en un idioma distinto del inglés, comparando `bnd_w` contra el brazo `plain` con el mismo texto, el mismo número de tokens y el mismo orden de shards.
- Evaluación de métricas intrínsecas: se puede usar para calcular bits por byte sobre shards reservados de Russian FineWeb-2 y comprobar si la ventaja de los marcadores de frontera se mantiene con otras semillas o con otros volúmenes de vocabulario.
- Diseño de tokenizadores para ruso: permite medir el coste real (en bits por byte) de añadir marcadores explícitos de frontera en una lengua con morfología rica y comprobar si el aumento efectivo de longitud de secuencia compensa la mejora de compresión.
- Reproducción de experimentos de entrenamiento distribuido: los ficheros `train.log` y `archive.json` de cada seed permiten verificar la configuración y los hashes de un pipeline nanochat lanzado con `run_arms.sh`.
- Punto de partida para *fine-tuning* exploratorio en ruso: al ser un modelo base de unos 110-140 M de parámetros con vocabulario ruso, puede ajustarse para tareas acotadas (clasificación de texto, generación corta, etiquetado) en entornos con recursos muy limitados, siempre asumiendo que no ha recibido ajuste por instrucciones ni alineamiento.
- Prototipado y docencia en hardware modesto: su tamaño reducido permite ejecutar el modelo completo en CPU o en una GPU de gama baja para ilustrar el efecto del vocabulario en la pérdida, sin necesidad de infraestructura dedicada.
- Validación de cadenas de conversión de formatos: útil como caso de prueba para convertir un state dict de nanochat a safetensors, GGUF o al formato de HuggingFace Face y verificar que la tokenización con marcadores de frontera se conserva en la ida y vuelta.
- Pruebas de pipelines de evaluación multilingüe: se puede integrar como brazo de control en un banco de pruebas que compare esquemas de tokenización por idioma, dado que el repositorio `script_tok` ya contiene la infraestructura de comparación entre esquemas, entrenadores y lenguas.

## Benchmarks y rendimiento

El único resultado publicado es la pérdida de validación en bits por byte (menor es mejor): pérdida sumada sobre un shard reservado de Russian FineWeb-2 dividida por la longitud UTF-8 real del texto puntuado. Estos valores solo son comparables dentro del mismo idioma.

| Semilla | Este modelo (`bnd_w`) | Diferencia `plain` menos este modelo |
|---|---|---|
| 0 | 0,54416 | +0,00484 |
| 1 | 0,54312 | +0,00616 |
| 2 | 0,54291 | +0,00652 |

Media de la diferencia: +0,00584 bits por byte, con una desviación estándar entre semillas de 0,00088. Una diferencia positiva indica que el esquema de marcadores de frontera puntuó mejor (más bajo) que el esquema `plain`. El autor advierte que tres semillas ofrecen una dirección, no una estimación precisa. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del recuento aproximado de parámetros, no publicada por el autor): en fp32, del orden de 450-560 MB; en fp16 o bf16, del orden de 225-280 MB; en int8, del orden de 110-140 MB. A ello hay que sumar la caché KV para 2.048 tokens, que en fp16 ronda los 75 MB (12 capas × 2 × 2.048 × 768 × 2 bytes).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; una RTX 3060, RTX 4090, T4, L4, A100 o H100 funcionan sin problema, pero están muy por encima de lo necesario.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual e incluso en gráficas integradas con memoria compartida. También es viable la inferencia solo en CPU.
- Opciones de despliegue: el repositorio no ofrece soporte nativo para vLLM, llama.cpp, Ollama ni TGI. Los pesos son un state dict de PyTorch que se carga con nanochat en el commit `92d63d4`; para usar otros servidores habría que convertir previamente el modelo a safetensors o GGUF y reimplementar el tokenizador de fronteras con `script_tok`.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia, tokens por segundo ni rendimiento de servicio.

## Comparativa con modelos similares

| Modelo | Esquema de tokenización | Parámetros | Contexto | Licencia | Resultado (bits por byte, media de 3 semillas) |
|---|---|---|---|---|---|
| `cmeister/boundary-markers-ru-d12-bnd_w-mingram` | Marcador `<|>` a ambos lados de cada palabra, entrenado con MinGram | ~110-140 M (estimado) | 2.048 tokens | Apache 2.0 | 0,54340 (media de 0,54416 / 0,54312 / 0,54291) |
| Brazo `plain` del mismo estudio | Vocabulario plano sin marcadores de frontera | Idénticos (misma arquitectura y datos) | 2.048 tokens | Apache 2.0 | 0,54924 aproximado (diferencia media de +0,00584 frente a `bnd_w`) |
| Otros brazos, entrenadores y lenguas del repositorio `script_tok` | Distintos esquemas de tokenización | No disponible en la información proporcionada | No disponible | No disponible | No disponible |
| Otros modelos pequeños en ruso de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación más rigurosa posible es interna al propio estudio: los brazos comparten arquitectura, datos, orden de shards y número de tokens, y solo difieren en el tokenizador. Los valores de bits por byte de `plain` se derivan de las diferencias publicadas en la model card y no se presentan como cifras absolutas verificadas. Para alternativas externas de tamaño similar en ruso no hay datos en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no ha pasado por RLHF, DPO ni supervisión de instrucciones, por lo que no sigue consignas de forma fiable ni mantiene formatos de diálogo.
- Entrenamiento muy limitado: solo 1.340 millones de tokens vistos (2.553 pasos de 524.288 tokens), un volumen muy inferior al de modelos de tamaño comparable que sí se publican para uso general.
- Contexto corto: la ventana de 2.048 tokens restringe documentos largos, conversaciones multi-turno extensas y tareas de recuperación aumentada con contexto amplio.
- Únicamente ruso: el tokenizador se entrenó con una muestra de Russian FineWeb y los datos de entrenamiento son shards de Russian FineWeb-2; no hay evidencia de comportamiento en otros idiomas y los bits por byte solo son comparables dentro del mismo idioma.
- Riesgo de alucinación y de contenido incoherente: al ser un modelo pequeño y poco entrenado, es probable que genere afirmaciones falsas con fluidez, especialmente fuera de los dominios de FineWeb.
- Sesgos no evaluados: no se ha publicado ninguna evaluación de sesgos, toxicidad ni seguridad. Los sesgos presentes en Russian FineWeb-2 se trasladan al modelo sin filtrado documentado.
- Resultado estadístico frágil: la comparación con el esquema `plain` se basa en tres semillas, con una desviación estándar entre semillas de 0,00088 frente a una diferencia media de 0,00584; el propio autor indica que esto da una dirección, no una estimación precisa.
- Dependencia de código externo: cargar el tokenizador exige clonar `script_tok` y usar la clase `BoundaryMinGramModel`; el modelo no se carga con `transformers` ni con `AutoTokenizer` sin trabajo adicional.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se distribuye sin garantías y sin declaración de precisión por parte del autor. Conviene conservar los avisos de licencia y atribución.
- Adopción nula: el repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, por lo que no existe una comunidad que haya validado el modelo ni reportado fallos.
- Los resultados de la búsqueda web realizada no aportan información relevante sobre el modelo (los enlaces devueltos corresponden a informes de falsos positivos de un dominio publicitario ajeno por completo al proyecto), así que no se han podido contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ru-d12-bnd_w-mingram
- Artículo *Explicit Boundary Markers for Subword Vocabularies* (Sander Land y Clara Meister): https://arxiv.org/abs/2608.08847
- Repositorio `script_tok` con el código de tokenización, comparación y réplica de los brazos: https://github.com/sanderland/script_tok
- Repositorio `nanochat` de Karpathy, usado en el commit `92d63d4`: https://github.com/karpathy/nanochat
- Fichero del tokenizador: `tokenizer/fineweb_ru_5gb_quick_bnd_w_mingram_v34685.json.gz` (sha256 `599fdd1026c0cd982cde7f59d1a10c7070f6d301f4495a6c2730a42831da87f1`)
- Ficheros de pesos por semilla: `seed0/model_002553.pt`, `seed1/model_002553.pt`, `seed2/model_002553.pt`, con sus correspondientes `meta_002553.json`, `train.log` y `archive.json`
- No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs, demos o repositorios) asociados a este modelo.
