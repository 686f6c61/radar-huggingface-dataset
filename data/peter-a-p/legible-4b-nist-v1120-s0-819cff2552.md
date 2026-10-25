# Peter-A-P/legible-4b-nist-v1120-s0-819cff2552

## Resumen

`legible-4b-nist-v1120-s0-819cff2552` es un adaptador QLoRA sobre `google/gemma-4-E4B` que lee las imágenes de una página de formulario fiscal y devuelve sus campos como un objeto JSON. Lo publica Peter-A-P dentro del proyecto «Forms That Read Themselves» (paquete `legible`), que compara modelos de visión de frontera, modelos pequeños ajustados y pipelines de OCR sobre formularios escaneados con respuesta conocida. El adaptador corresponde a la ejecución `4b-nist-v1120-s0-819cff2552`.

El dominio es acotado y explícito: las 20 caras de formulario del NIST Special Database 2 (formularios 1040, 2106, 2441, 4562, 6251 y anexos, ejercicios fiscales de 1988), con 1.113 campos de texto en total y 20 esquemas JSON distintos. La entrada es la imagen de la página seguida de una instrucción fija (`legible.prompt`, versión 1) que describe cada campo y aporta el JSON Schema; el adaptador se entrenó únicamente con esa instrucción.

Su interés práctico está en la relación entre coste y precisión: con 800 páginas de entrenamiento alcanza un 74,2 % de campos correctos frente al 16,0 % del modelo base sin ajustar, a un coste estimado de US$0,64 por 1.000 páginas, frente a US$16,38 del lector de frontera incluido en la comparación (Claude Sonnet 5.5, 86,7 % de campos correctos). El repositorio tiene 0 descargas y 0 «likes» en el momento de redactar esta ficha, por lo que debe tratarse como un artefacto de investigación reproducible, no como un servicio validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal imagen-texto (`google/gemma-4-E4B`); el adaptador no modifica la arquitectura del modelo base |
| Parametros totales | No disponible. El adaptador LoRA tiene rango 16; el repositorio ocupa 0,2 GB y solo contiene los pesos del adaptador |
| Longitud de contexto | 16.384 tokens de límite de secuencia durante el entrenamiento; contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | Entrenamiento en NF4 4 bits con doble cuantización y cálculo en bf16; torres de visión y audio, proyector de visión y capa de salida en precisión completa. Los pesos publicados son el adaptador (no cuantizado); no se publican versiones GGUF |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA) |
| Modelo base | `google/gemma-4-E4B`, revisión `411aa17b749aa952df1359d2dcea73917a544d9a` |
| Plantilla de chat | `google/gemma-4-E4B-it`, revisión `ee0ef6023621cff504d758262d4e04895a5af4a2` |
| Tokens visuales por pagina | 1.120 |
| Pipeline | `image-text-to-text` |
| Hiperparametros LoRA | Rango 16, alpha 32, dropout 0,05; aplicado a las proyecciones de atención y MLP del modelo de lenguaje y al proyector de visión, nunca a las torres |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se monta sobre un modelo base multimodal (imagen-texto, con torres de visión y audio presentes en el modelo original) y se entrena con la receta QLoRA del proyecto: cuantización NF4 de 4 bits con doble cuantización y cálculo en bf16, manteniendo en precisión completa las torres, el proyector de visión y la capa de salida. Cada ejemplo es un turno de usuario con las imágenes de la página en orden seguido de la instrucción del proyecto, y un turno de asistente con el JSON de la verdad de referencia; la pérdida se calcula solo sobre los tokens de la respuesta. No se indica en la información disponible que se haya aplicado RLHF, DPO ni ninguna otra fase de alineación posterior al ajuste supervisado.

El conjunto de entrenamiento es la partición `nist` (3.850 documentos), de la que se tomaron los primeros 800 documentos, es decir, 800 páginas. La optimización usó tasa de aprendizaje 0,0002, planificador coseno, calentamiento del 3 %, una época, un documento por paso y 8 pasos acumulados, con semilla 0, lo que dio 97 pasos de optimizador a partir de 775 documentos. 25 documentos de la cara `sch_d_1` quedaron fuera del entrenamiento por superar el límite de secuencia de 16.384 tokens. El reparto por caras es muy desigual: desde 141 páginas de `1040_1` o 116 de `1040_2` hasta 8 de `2106_2`, 12 de `2441` y 13 de `2106_1` y `6251`. La pérdida y los tiempos de entrenamiento están en el `run.json` subido con el adaptador y no se reproducen en la model card.

Los datos proceden del NIST Special Database 2 (formularios fiscales IRS de 1988, sintetizados), de dominio público en Estados Unidos según el título 17 del United States Code, sección 105; NIST confirmó el 17 de octubre de 2026 que los adaptadores entrenados con esas páginas pueden publicarse. La atribución indicada es «NIST Special Database 2, DOI 10.18434/M3J08M».

## Capacidades

- Extracción de campos de formulario a partir de la imagen de la página, sin pipeline de OCR intermedio: la entrada son las imágenes y la salida es JSON.
- Salida estructurada conforme a 20 esquemas distintos (uno por cara de formulario), con 1.113 campos de texto en total y valores siempre como cadena o `null`.
- Cumplimiento de instrucciones con JSON Schema embebido en el prompt, que es exactamente el formato visto durante el entrenamiento.
- Procesamiento multipágina: admite varias imágenes en orden de página dentro del mismo turno, hasta el límite de secuencia de 16.384 tokens (con 1.120 tokens visuales por página).
- Conversación multimodal de un solo turno entrenado (etiqueta `conversational` en el modelo base, pero el adaptador solo se entrenó con la instrucción del proyecto).
- No se ha entrenado ni evaluado para tool calling, function calling, razonamiento multi-paso, matemáticas, generación de código ni audio; la torre de audio se conserva en precisión completa pero queda fuera del ajuste.
- Capacidad multilingüe: no disponible; el modelo está etiquetado solo en inglés y los formularios de entrenamiento están en inglés.

## Casos de uso

- Digitalización de archivos fiscales históricos: el adaptador convierte páginas escaneadas del NIST SD2 (ejercicio 1988) en registros JSON campo a campo, lo que permite indexar y consultar colecciones de formularios 1040 y anexos sin transcribir manualmente.
- Ingesta documental con esquema fijo: en un pipeline de intake, la instrucción del proyecto ya incluye el JSON Schema, de modo que la salida se puede validar y cargar directamente en una base de datos sin una capa de post-proceso específica por formulario.
- Procesamiento por lotes a bajo coste: con un coste medido de US$0,64 por 1.000 páginas sobre una RTX 3090, es adecuado para barridos masivos donde el lector de frontera (US$16,38 por 1.000 páginas) resulta prohibitivo, aceptando revisión humana del 25,2 % de documentos que no salen perfectos.
- Control de calidad y auditoría de OCR: al ser un lector independiente de la librería de OCR, sirve como segunda opinión sobre los campos extraídos y permite marcar discrepancias para revisión.
- Despliegue on-premise o en el borde: la licencia Apache 2.0 y el tamaño del adaptador (0,2 GB) permiten ejecutarlo en infraestructura propia sin enviar documentos fiscales a una API externa, algo relevante por confidencialidad.
- Línea base barata para evaluar VLMs: cualquier equipo que valore un modelo mayor puede reproducir esta ejecución (semilla 0, 800 páginas, 97 pasos) y comparar con las mismas métricas VRDU sobre las 500 caras de test.
- Investigación en extracción de documentos: la receta QLoRA con torres congeladas y pérdida solo en la respuesta es un punto de partida reproducible para estudiar el efecto del número de páginas por cara en la precisión.
- Preetiquetado asistido: generar un JSON inicial que un humano corrige, reduciendo el trabajo de transcripción en caras densas como `sch_d_1` (191 campos) o `4562_2` (98 campos).

## Benchmarks y rendimiento

Evaluación sobre las 500 caras de test del NIST, una lectura por documento, nivel 0, temperatura 0 y salida sin restricciones; la precisión de campo usa los comparadores de VRDU con un único evaluador para todos los lectores, e intervalos bootstrap del 95 % sobre documentos. El adaptador se costea sobre una RTX 3090 a US$0,50/hora en RunPod (18 de octubre de 2026) según el tiempo de ejecución medido; los modelos de frontera, a la tarifa por lotes de la lista de precios del 16 de octubre de 2026.

| Lector | Campos correctos (IC 95 %) | Todos los campos correctos | Campos inventados | Respuestas no parseables | Coste por 1.000 paginas (USD) | Documentos |
|---|---|---|---|---|---|---|
| B, Gemma 4 E4B ajustado (este adaptador) | 74,2 % (70,9–77,2) | 24,8 % (21,0–28,6) | 3,3 % (2,7–4,0) | 7,0 % (4,8–9,4) | 0,64 (0,60–0,67) | 500 |
| C, Gemma 4 E4B sin ajustar sobre la imagen | 16,0 % (14,5–17,7) | 0,0 % (0,0–0,0) | 27,3 % (24,7–30,0) | 8,2 % (5,8–10,6) | 0,69 (0,65–0,73) | 500 |
| A, Claude Sonnet 5.5 sobre la imagen | 86,7 % (84,8–88,4) | 46,2 % (42,0–50,4) | 0,7 % (0,6–1,0) | 0,0 % (0,0–0,0) | 16,38 (15,63–17,19) | 500 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generalistas en la información disponible; las únicas métricas son las de extracción de campos descritas arriba.

## Requisitos de hardware

- VRAM estimada: no publicada oficialmente. El cálculo de coste se hizo sobre una RTX 3090 de 24 GB con el modelo base en NF4 de 4 bits; una estimación no confirmada sitúa los pesos cuantizados en torno a 3–4 GB, a lo que hay que sumar las torres y el proyector de visión en precisión completa y la caché KV para hasta 16.384 tokens con 1.120 tokens visuales por página.
- GPU recomendadas: RTX 3090 (la empleada en la medición de coste) o cualquier GPU de 24 GB para inferencia de una página; A100 o H100 para lotes grandes y mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090, 4090); en 16 GB o menos no hay datos publicados y el margen con 16.384 tokens de contexto sería ajustado.
- Opciones de despliegue: `transformers` + `peft` es la ruta natural, ya que el repositorio solo contiene el adaptador; vLLM admite adaptadores LoRA, pero debe verificarse el soporte multimodal en la versión concreta; TGI requiere comprobación equivalente. No se publican pesos GGUF, por lo que llama.cpp u Ollama exigirían una conversión y fusión previas del adaptador con el modelo base.
- Latencia y throughput: no disponibles como cifra absoluta. El coste de US$0,64 por 1.000 páginas a US$0,50/hora implica del orden de 0,8 páginas por segundo en esa configuración, valor derivado del coste y no medido de forma independiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión de campo (NIST, 500 caras) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Gemma 4 E4B + QLoRA) | No disponible (adaptador sobre base tipo E4B) | 16.384 tokens de límite de entrenamiento | 74,2 % | Apache 2.0 | Público en Hugging Face, 0 descargas |
| Gemma 4 E4B sin ajustar | No disponible | No disponible | 16,0 % | Apache 2.0 (modelo base) | Público en Hugging Face |
| Claude Sonnet 5.5 (API) | No disponible | No disponible | 86,7 % | Propietaria | Solo API, US$16,38 por 1.000 páginas |
| Pipelines de OCR + reglas | No aplica (componentes) | No aplica | No disponible en la información proporcionada | Variable según componentes | Genérica |

La comparación relevante es la que aporta la propia ejecución: el ajuste multiplica por más de cuatro la precisión de campo respecto al modelo base sin ajustar (74,2 % frente a 16,0 %) y reduce los campos inventados del 27,3 % al 3,3 %, a un coste prácticamente idéntico. Frente al lector de frontera, pierde 12,5 puntos de precisión de campo y 21,4 puntos de documentos perfectos, pero cuesta unas 25 veces menos por página.

## Limitaciones y advertencias

- Dominio cerrado: solo las 20 caras del NIST SD2 (formularios IRS de 1988). No hay evidencia de que generalice a otros formularios, a otros ejercicios fiscales ni a maquetaciones distintas.
- Precisión insuficiente para automatización sin supervisión: falla aproximadamente uno de cada cuatro campos (25,8 %) y solo el 24,8 % de los documentos queda con todos los campos correctos.
- Alucinación de valores: un 3,3 % de campos son inventados, es decir, el modelo emite un valor donde la verdad de referencia no lo tiene; en documentos fiscales esto es más grave que dejar el campo vacío.
- Salida no parseable en el 7,0 % de los casos, pese a que el adaptador se entrenó con un JSON Schema explícito y se evaluó sin restricciones de decodificación.
- Desequilibrio de entrenamiento: caras con 8–16 páginas (`2106_2`, `2441`, `2106_1`, `6251`, `sch_f_2`, `sch_se_1`) tienen muchas menos muestras que `1040_1` (141); es razonable esperar un rendimiento peor en ellas, aunque la información disponible no desglosa la precisión por cara.
- Límite de página: 25 documentos de `sch_d_1` se descartaron por superar los 16.384 tokens; las páginas densas o con imágenes de mayor resolución pueden no caber en la ventana.
- Idioma: únicamente inglés. No hay evaluación en castellano ni en ningún otro idioma.
- Licencia: el adaptador es Apache 2.0, igual que el modelo base, lo que permite uso comercial; los datos NIST son de dominio público en Estados Unidos, pero la propia nota de NIST advierte de que pueden estar sujetos a copyright en otros países.
- Riesgo de uso indebido: la salida son valores fiscales con apariencia de exactitud; no debe usarse como asesoramiento fiscal ni como sustituto de la revisión humana en declaraciones reales.
- Falta de validación comunitaria: 0 descargas y 0 «likes», sin informes independientes de robustez ante escaneos degradados, rotaciones o ruido.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez adversarial en la información disponible.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Peter-A-P/legible-4b-nist-v1120-s0-819cff2552
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- NIST Special Database 2: https://www.nist.gov/srd/nist-special-database-2
- Términos de uso y licencia de NIST: https://www.nist.gov/open/license
- DOI de atribución del NIST SD2: 10.18434/M3J08M
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados se limitan a coincidencias del nombre propio «Peter» (diccionarios, prensa y enciclopedias), sin relación con el adaptador ni con el proyecto `legible`.
