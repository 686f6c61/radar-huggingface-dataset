# SEBK4C/Winnow-12B-LoRA

## Resumen

Winnow-12B-LoRA es un adaptador LoRA de rango 32 publicado por el usuario SEBK4C que reproduce el ajuste fino de decisiones tipadas (typed decisions) de EldanRing/Winnow-12B sobre el modelo base google/gemma-4-12B-it. No es un artefacto de entrenamiento original: Winnow se publicó únicamente como pesos ya fusionados (merged), y este adaptador se ha extraído de ellos mediante descomposición SVD de la diferencia entre Winnow y Gemma 4 12B. El propio autor lo deja explícito en la model card y cede todo el crédito del ajuste fino a EldanRing y de la arquitectura base a Google DeepMind.

El objetivo práctico es servir un único Gemma 4 12B y aplicar Winnow por petición: Gemma sin adaptador para chat (texto, imágenes y audio) y Winnow para decisiones estilo Jev, desde los mismos pesos cargados. Para ello el repositorio incluye el adaptador PEFT en safetensors (328 módulos, r=32, α=32), una variante LoRA en GGUF para llama.cpp, el proyector mmproj multimodal en F32 y scripts de extracción, evaluación y despliegue.

La relevancia del artefacto es doble. Por un lado, es un caso práctico de interconmutación de adaptadores en producción sin duplicar el modelo base. Por otro, documenta un hallazgo metodológico interesante: la extracción con SVD simple reproduce las puntuaciones Q8 publicadas de Winnow y coincide en el 98-99 % de sus decisiones individuales, mientras que la variante "rounding-aware" logra un 99,1 % de pesos idénticos bit a bit pero se aleja 2-3 veces más del comportamiento de Winnow. El repositorio tiene 1,3 GB, 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Gemma 4 12B; targets q/k/v/o/gate/up/down en 48 capas, sin `v_proj` en las 8 capas globales |
| Parámetros totales | 131.137.536 parámetros en el adaptador (dato real de safetensors); el modelo base google/gemma-4-12B-it es de 12 000 millones de parámetros |
| Parámetros activos | No aplica (no es MoE; es un adaptador LoRA) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Adaptador en F16 (GGUF) y safetensors; proyector multimodal en F32; el modelo base se ha evaluado en Q8_0 y Q5_K_M |
| Idiomas soportados | No disponible (la model card y las etiquetas del repositorio no especifican idiomas) |
| Licencia | Apache-2.0 (igual que el modelo base y que Winnow) |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (LoRA para llama.cpp), JSON de configuración (`adapter_config.json`) |

Contenido del repositorio:

| Archivo o carpeta | Contenido |
|---|---|
| `adapter_model.safetensors`, `adapter_config.json` | Adaptador PEFT, extracción SVD simple (recomendada), r=32, α=32 (escala 1), 328 módulos |
| `rounding-aware/` | La misma extracción con enfoque de redondeo; el 99,1 % de los pesos se re-fusionan de forma exacta bit a bit |
| `gguf/winnow-12b-lora-r32-svd-F16.gguf` | LoRA para llama.cpp (262 MB), recomendada |
| `gguf/winnow-12b-lora-r32-interval-F16.gguf` | LoRA para llama.cpp, variante rounding-aware |
| `gguf/mmproj-gemma-4-12b-it-F32.gguf` | Proyector de visión y audio para el base, en F32 (una versión F16 de `v.patch_embd` rompe la visión) |
| `extraction/` | `extract_interval.py`, estadísticas y espectros por matriz (`extraction-r32.json`), figuras |
| `eval/` | Resúmenes de benchmarks y acuerdo por decisión |
| `serving/` | Parche de servidor (`apply_gjh.py` para winnow-inference), script de build, unidad systemd, fragmentos de proxy y gateway |
| `REPORT.md` | Informe completo de la extracción |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal (pipeline `image-text-to-text`) capaz de procesar texto, imágenes y audio. El adaptador es un LoRA de rango 32 con α=32 (escala 1) que cubre 328 módulos: proyecciones q, k, v, o, gate, up y down en las 48 capas, con la particularidad de que las 8 capas globales no llevan `v_proj`. De las 677 matrices de Gemma 4, 349 son idénticas bit a bit en Winnow, por lo que todo el cambio se concentra en esos 328 objetivos LoRA.

La extracción parte de una observación: solo el 27 % de esos pesos cambió realmente, ya que la mayoría de las actualizaciones individuales del LoRA son más pequeñas que un paso de BF16 y se redondearon al fusionar el adaptador. Por tanto, Winnow menos el base es el LoRA más ruido de redondeo del mismo orden. El repositorio implementa dos métodos: SVD simple de la diferencia a rango 32, que re-fusiona exactamente el 82,5 % de los pesos, y una variante rounding-aware que aprovecha que cada peso publicado restringe la actualización verdadera a un intervalo y aplica proyecciones alternas entre esa caja y el conjunto de rango 32 (recorte seguido de SVD truncada), alcanzando el 99,1 %. A rango 16 el método se estanca en el 82,6 %, lo que confirma la elección de rango 32. No se documenta en la información disponible el dataset de entrenamiento original de Winnow, su número de tokens ni si hubo RLHF o DPO; el ajuste es de EldanRing, no de SEBK4C.

## Capacidades

- Generación de texto y conversación multimodal sobre Gemma 4 12B (texto, imágenes y audio), usando el adaptador desactivado.
- Decisiones tipadas estilo Jev: el endpoint `/v1/systemone` del servidor winnow-inference permite obtener decisiones con probabilidades calibradas.
- Conmutación por petición entre Gemma puro y Winnow desde un único modelo cargado, tanto en chat como en decisiones, seleccionando el adaptador por nombre de modelo (`winnow-12b` activa, `gemma-4-12b` desactiva).
- Soporte de visión y audio mediante el proyector mmproj en F32, con la extensión `winnow.audio` añadida junto a `winnow.images` por el parche `serving/apply_gjh.py`.
- Uso como componente de decisión en agentes de codificación, con modos estándar y de menú (menu mode).
- Mejora de calibración frente a Gemma sin adaptador: ECE de Kev-v9 baja de 0,170 a 0,098 y el Brier de JevBench, de 0,275 a 0,205.
- Integración con PEFT/transformers y con llama.cpp (con `--lora-init-without-apply` y activación por petición).
- No se documentan en la información disponible capacidades de tool calling o function calling explícitas, ni lista de idiomas soportados.

## Casos de uso

- Enrutado de decisiones en agentes de código: se carga un único Gemma 4 12B y se activa el adaptador solo en las peticiones de decisión. En el harness bonsai-harness (con Bonsai 2 27B como generador de código) el adaptador en modo menú obtuvo 85 de 115 comprobaciones superadas frente a 73 con Jev alojado, con un tiempo de pared de 150 min frente a 179 min.
- Calibración de confianza en pipelines automatizados: gracias al descenso del ECE (0,170 a 0,098) y del Brier (0,275 a 0,205), las probabilidades del modelo son más utilizables para umbrales de confianza y escalado de intervención humana.
- Servicio unificado con un solo modelo en memoria: en lugar de desplegar Gemma y Winnow por separado, se sirve un único Gemma 4 12B y se aplica el LoRA por petición, reduciendo el consumo de VRAM y simplificando el mantenimiento.
- Despliegue en GPU de consumo: el autor reporta el adaptador SVD sobre base Q5_K_M en una RTX 3080 Ti de 12 GB con 83,98 / 80,78 / 69,75 % en JevBench public / Kev-v9 clean / typed y un 96,1-96,5 % de acuerdo con Winnow fusionado, con unos 30 ms añadidos por petición de decisión.
- Investigación sobre extracción de adaptadores: el repositorio incluye scripts, estadísticas por matriz y espectros que permiten reproducir y comparar la extracción SVD con la rounding-aware, así como estudiar por qué la exactitud bit a bit no predice el comportamiento del modelo.
- Asistentes multimodales con dos perfiles: mantener el adaptador desactivado para tareas de chat con imagen y audio (usando el mmproj F32) y activarlo únicamente para las decisiones que requieran el comportamiento de Winnow.
- Evaluación comparativa de políticas de decisión: el harness permite enfrentar decisiones de Jev alojado y del adaptador sobre el mismo estado, útil para medir el impacto de cambiar un servicio externo por inferencia local.

## Benchmarks y rendimiento

Resultados facilitados por el autor con cuantización Q8_0 en una RTX 4090, sobre las suites fijadas de Winnow:

| Q8_0 | JevBench public | Kev-v9 clean | typed | Kev-v9 ECE | Misma decisión que Winnow fusionado (JevBench / Kev / typed) | TV medio |
|---|---|---|---|---|---|---|
| Gemma 4 12B sin adaptador | 83,55 % | 78,20 % | 71,70 % | 0,170 | 91,3 / 88,8 / 85,6 % | 0,10–0,19 |
| Winnow fusionado (referencia) | 86,15 % | 81,36 % | 70,25 % | 0,098 | – | – |
| Este adaptador (SVD) | 85,71 % | 81,26 % | 69,95 % | 0,096 | 98,7 / 99,1 / 97,9 % | 0,009–0,017 |
| Variante rounding-aware | 86,15 % | 81,45 % | 69,10 % | 0,084 | 98,3 / 97,3 / 96,4 % | 0,023–0,045 |
| Winnow Q8 publicado | 85,71 % | 81,55 % | 70,00 % | No disponible | No disponible | No disponible |

Despliegue en una RTX 3080 Ti de 12 GB con base Q5_K_M: adaptador SVD 83,98 / 80,78 / 69,75 % (JevBench public / Kev-v9 clean / typed), 96,1-96,5 % de acuerdo de decisión con Winnow fusionado a la misma precisión y aproximadamente 30 ms añadidos por petición de decisión al aplicar el LoRA en tiempo de ejecución.

Comportamiento en el harness de agente de codificación (siete tareas de texto, una ejecución por celda; Bonsai 2 27B como generador de código):

| Configuración | Comprobaciones superadas (de 115) | Tiempo de pared |
|---|---|---|
| Jev, estándar | 59 | 96 min |
| Adaptador, estándar | 59 | 157 min |
| Jev, modo menú | 73 | 179 min |
| Adaptador, modo menú | 85 | 150 min |

Sobre 2.000 peticiones Jev reales del harness de agente de codificación, el adaptador deja prácticamente igual la proporción de decisiones que coinciden con Jev alojado (en torno al 90 % sí/no), pero acerca sus probabilidades a las de Jev (TV medio de 0,20 a 0,15). No se han publicado en la información disponible resultados de benchmarks generalistas tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Adaptador LoRA en safetensors: 131,1 millones de parámetros; el repositorio completo ocupa 1,3 GB.
- LoRA en GGUF F16 para llama.cpp: 262 MB, pensada para aplicarse sobre un modelo base ya cuantizado.
- Proyector multimodal: `mmproj-gemma-4-12b-it-F32.gguf`. El autor advierte de que usar F16 en `v.patch_embd` rompe la visión.
- Modelo base en BF16: aproximadamente 24 GB de VRAM solo para pesos (estimación a partir de 12 000 millones de parámetros, no un dato publicado).
- Q8_0: el autor reporta la evaluación "near-lossless" en una única RTX 4090.
- Q5_K_M: desplegado con éxito en una RTX 3080 Ti de 12 GB, incluyendo el adaptador y el proyector.
- Coste de aplicar el LoRA por petición: unos 30 ms adicionales por petición de decisión en la RTX 3080 Ti.
- Opciones de despliegue documentadas: PEFT con transformers (usando `AutoModelForImageTextToText` y `PeftModel`), llama.cpp (`llama-server` con `--lora` y `--lora-init-without-apply`, activando el adaptador por petición) y el servidor winnow-inference con el parche `serving/apply_gjh.py`. No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Revisión del modelo base usada en el ejemplo: `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`.
- Throughput: no disponible (solo se ofrecen tiempos de pared del harness).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Formato | Licencia | Rendimiento (JevBench public / Kev-v9 clean / typed, Q8_0) |
|---|---|---|---|---|---|
| SEBK4C/Winnow-12B-LoRA | Adaptador LoRA r=32 sobre Gemma 4 12B | 131,1 M en el adaptador (base de 12 000 M) | safetensors, GGUF | Apache-2.0 | 85,71 % / 81,26 % / 69,95 % |
| EldanRing/Winnow-12B | Modelo fusionado completo | No disponible | No disponible | Apache-2.0 | 86,15 % / 81,36 % / 70,25 % |
| google/gemma-4-12B-it | Modelo base multimodal | 12 000 M | No disponible en la información | No disponible en la información | 83,55 % / 78,20 % / 71,70 % |

No se dispone de información sobre otros modelos comparables de la misma categoría (adaptadores de decisión tipada o enrutadores de agente) en el material proporcionado.

## Limitaciones y advertencias

- Este adaptador no es el artefacto de entrenamiento original: se ha extraído de los pesos fusionados de Winnow y, por construcción, no reproduce exactamente el modelo de EldanRing (98-99 % de coincidencia en decisiones individuales con la variante SVD).
- La exactitud bit a bit no implica fidelidad de comportamiento: la variante rounding-aware re-fusiona el 99,1 % de los pesos de forma exacta pero se aleja 2-3 veces más de Winnow que la SVD simple, según los propios datos del autor.
- El modelo base y el ajuste fino no están documentados en el repositorio en cuanto a datos de entrenamiento, número de tokens, composición del dataset o uso de RLHF/DPO, lo que impide evaluar sesgos de origen.
- No se especifican idiomas soportados; tampoco hay evaluación multilingüe en el material disponible.
- No se publican resultados en benchmarks generalistas (MMLU, HumanEval, GSM8K), por lo que no se puede situar el modelo fuera de las suites específicas de decisiones del autor.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo se evalúa con métricas de calibración (ECE, Brier, TV), no con tasas de alucinación.
- El endpoint de decisiones tipadas de winnow-inference se desactiva cuando hay un LoRA cargado; para mantenerlo hay que aplicar el parche `serving/apply_gjh.py`, lo que añade complejidad operativa y un punto de mantenimiento frente a actualizaciones del servidor.
- El proyector multimodal debe ser F32: una versión F16 de `v.patch_embd` rompe la visión, un fallo silencioso que conviene verificar en despliegues propios.
- Licencia Apache-2.0, que permite uso comercial, pero al derivar de google/gemma-4-12B-it conviene revisar los términos del modelo base aplicables en cada jurisdicción.
- El repositorio tenía 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados reportados.

## Enlaces

- Página de HuggingFace del adaptador: https://huggingface.co/SEBK4C/Winnow-12B-LoRA
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Winnow-12B original (pesos fusionados): https://huggingface.co/EldanRing/Winnow-12B
- Servidor de inferencia de Winnow: https://github.com/EldanRing/winnow-inference
- Informe completo de la extracción: `REPORT.md` dentro del repositorio
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (artículos divulgativos sobre la inteligencia de los pulpos), por lo que no se incluye ningún enlace adicional procedente de esa fuente.
