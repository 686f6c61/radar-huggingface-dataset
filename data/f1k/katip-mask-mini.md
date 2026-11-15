# f1k/katip-mask-mini

## Resumen

Katip Mask Mini es un modelo de etiquetado de tokens especializado en la detección de nombres de persona en textos legales turcos, diseñado para integrarse en herramientas de anonimización y enmascaramiento de datos personales (PII). Lo desarrolla el autor independiente f1k y se distribuye bajo licencia CC BY-SA 4.0. Es la versión intermedia de la familia Katip Mask, situada entre Nano (2,9 MB) y Base (111 MB), y está pensada para ejecutarse en el navegador o en la CPU de un portátil sin que el documento salga del equipo del usuario.

Técnicamente es un derivado destilado de DistilBERTurk: parte de las 6 capas del modelo original, conserva únicamente las capas 0, 2 y 5, y reduce el vocabulario de 32.000 a 12.000 piezas WordPiece. El resultado es un modelo de 31 millones de parámetros que se distribuye como ONNX int8 de 31 MB, con soporte para transformers.js y onnxruntime. La longitud de contexto de trabajo es de 256 tokens por ventana.

Su relevancia radica en el contexto normativo turco (KVKK, equivalente al RGPD) y en un compromiso poco habitual: precisión cercana a la de modelos cuatro veces mayores en prosa judicial real, con un coste de descarga y cómputo apto para el cliente. No es un modelo generativo, sino un componente de un pipeline de redacción que combina reglas deterministas con el tagger neuronal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 3 capas conservadas de 6 (capas 0, 2 y 5), hidden size 768 |
| Parametros totales | 31 millones (31M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256 tokens (recomendado por el autor) |
| Tipos de cuantizacion | int8 ONNX (única distribución publicada en esta release) |
| Idiomas soportados | Turco (tr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (int8); librería transformers.js |
| Modelo base | dbmdz/distilbert-base-turkish-cased (MIT) |
| Tarea | token-classification (NER de nombres de persona) |
| Etiquetas | O, B-PER, I-PER |
| Tamano del repo | 0,0 GB (descarga int8: 31 MB) |

## Arquitectura y entrenamiento

El modelo parte de DistilBERTurk, un transformer encoder de 6 capas con hidden size 768 y vocabulario WordPiece de 32.000 piezas en versión cased. El proceso de reducción consta de dos pasos: primero se poda el vocabulario a 12.000 piezas, conservando todos los tokens especiales y los caracteres individuales (para evitar que palabras queden como `[UNK]`) y añadiendo después las piezas más frecuentes del corpus de entrenamiento; después se conservan solo las capas transformer 0, 2 y 5.

El entrenamiento es una destilación de conocimiento desde Katip Mask Base, con una función de pérdida que combina al 50% entropía cruzada contra las etiquetas gold y al 50% divergencia KL (escalada por T²) contra las predicciones de Base, con temperatura T = 2. Se entrenó durante 4 épocas con AdamW, learning rate 1e-4 con schedule one-cycle, batch size 32 y ventanas de 256 tokens, en aproximadamente 12,5 minutos sobre una Colab T4. El corpus de entrenamiento son documentos legales sintéticos generados por el propio proyecto Katip, complementados con datos de NER turco (turkish-nlp-suite/turkish-wikiNER).

Una innovación destacable es el esquema de etiquetado por palabra: las etiquetas se asignan por palabra completa en el primer sub-token de cada una, y las palabras se segmentan con la regex definida en `config.json` → `katip.word_regex` (`[\p{L}\p{N}][\p{L}\p{N}'’.-]*`). El autor advierte explícitamente que el pipeline estándar de token-classification de Hugging Face segmenta de forma distinta y produce salida ruidosa, por lo que debe usarse el código de referencia (`src/ner.js` en transformers.js o `connector/katip_kalkan/ner.py` con onnxruntime).

## Capacidades

- Detección de nombres de persona (entidad PER) en texto turco, con etiquetas BIO (`B-PER`, `I-PER`, `O`).
- Integración en pipelines de enmascaramiento de PII combinada con reglas deterministas del proyecto Katip (detección de T.C. kimlik, direcciones, teléfonos, etc.).
- Ejecución en navegador mediante transformers.js y ONNX int8, sin envío de datos a servidores.
- Ejecución en CPU de portátil mediante onnxruntime, sin dependencia de PyTorch.
- Procesamiento de documentos legales sintéticos y de prosa judicial real (sentencias de Yargıtay).
- Procesamiento de imágenes de formularios vía OCR externo (Katip Otomatik) con máscaras de tinta.
- Manejo de nombres turcos y extranjeros en el mismo texto.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo de etiquetado, no generativo.
- No soporta visión ni audio de forma nativa; la vía de imágenes depende de un OCR previo.

## Casos de uso

- Anonimización de sentencias judiciales turcas antes de su publicación: el modelo detecta nombres de partes, testigos y profesionales en prosa de Yargıtay con un 99,2% de recall y 98,9% de precisión, lo que permite sustituir identificadores por seudónimos de forma sistemática antes de difundir resoluciones.
- Cumplimiento de KVKK en despachos de abogados: integrado en la herramienta Katip Mask, permite redactar expedientes y comunicaciones antes de compartirlos con terceros, con la garantía de que el documento nunca abandona el equipo del usuario (procesamiento local en navegador o portátil).
- Redacción de documentos en el conector Katip Kalkan para Claude: el modelo actúa como capa previa de detección de PII antes de que el texto se envíe a un LLM en la nube, reduciendo la exposición de datos personales en flujos de trabajo asistidos por IA.
- Procesamiento de formularios fotografiados con el móvil: combinado con OCR y máscaras de tinta, detecta nombres y números de identidad en imágenes de formularios cumplimentados; en el conjunto de prueba de 60 fotos sintéticas no se filtró ningún nombre ni T.C. kimlik (0 de 120 en cada categoría), aunque las direcciones se filtraron 28 de 120 veces.
- Despliegue en aplicaciones web de gestión documental: al pesar 31 MB en int8 y ejecutarse con transformers.js, puede cargarse en una pestaña del navegador para redactar currículos, contratos o informes antes de subirlos a un servicio externo.
- Preprocesamiento en pipelines de ciencia de datos con textos legales turcos: etiquetado de corpus para construir datasets anonimizados que puedan compartirse con investigadores sin infringir la normativa de protección de datos.
- Filtrado de PII en registros de atención al cliente o correos electrónicos en turco: el modelo puede ejecutarse a 5 páginas por segundo en CPU de portátil, suficiente para redactar lotes de comunicaciones antes de archivarlas o analizarlas.

## Benchmarks y rendimiento

Resultados de KVKK-Bench v0.1.2 (14 de noviembre de 2026), comparando con Nano v1.1 y Base v2:

| Metrica | Nano v1.1 | Mini v2 | Base v2 |
|---|---|---|---|
| Descarga (int8 ONNX) | 2,9 MB | 31 MB | 111 MB |
| KVKK-F2, todas las pistas | 81,3 | 88,6 | 93,1 |
| Fuga de caracteres de datos personales | 6,7% | 4,4% | 3,1% |
| Nombres turcos en prosa real de Yargıtay (encontrados / precision) | 98,8% / 95,8% | 99,2% / 98,9% | 99,9% / 100% |
| Nombres extranjeros, mismas frases (encontrados / precision) | 95,5% / 95,9% | 96,8% / 98,6% | 97,1% / 100% |
| Nombres en prosa cotidiana (Wiki NER test, encontrados / precision) | 50,8% / 63,7% | 70,9% / 79,2% | 83,9% / 88,3% |
| Paginas por segundo, CPU de portatil | 32 | 5 | 1,7 |

El modelo aislado, sin reglas, sobre Wiki NER test: 71,4% de recall [IC 95%: 67,5–75,1] con 80,1% de precisión [76,3–83,6], con intervalos calculados por bootstrap de documentos.

Documentos legales sintéticos: en el conjunto ciego (80 documentos, nombres nunca vistos en entrenamiento) encontró 364 de 365 nombres y añadió 0 falsos positivos; también 0 falsos positivos en documentos negativos sin nombres. En el conjunto held-out (60 documentos) encontró el 99,6% de los nombres.

Fotos de móvil (pista de fotos de KVKK-Bench, 60 fotos sintéticas de formularios, OCR de Katip Otomatik): 5,8% de datos personales filtrados (frente a 5,2% de Base y 5,4% de Nano); 0 nombres y 0 T.C. kimlik filtrados de 120 cada uno; direcciones filtradas 28 de 120; 0,8 máscaras falsas por página.

Selección de candidatos en dev (solo datos de desarrollo):

| Candidato | Capas conservadas | Vocabulario | int8 | Wiki NER dev F2 |
|---|---|---|---|---|
| L3-V12k (este modelo) | 0, 2, 5 | 12.000 | 31,1 MB | 72,5 |
| L3-V8k | 0, 2, 5 | 8.000 | 28,0 MB | 69,2 |
| L2-V12k | 0, 5 | 12.000 | 23,9 MB | 66,5 |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo int8 de 31 MB cabe holgadamente en cualquier GPU consumer y también en memoria unificada o RAM de sistema.
- GPU recomendadas: no requiere GPU. Funciona en CPU de portátil (Apple M-series medido) y en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) sin aprovechar su capacidad.
- Cabe en cualquier GPU consumer y en navegadores modernos vía WebAssembly/WebGPU con transformers.js.
- Opciones de despliegue: transformers.js (navegador), onnxruntime (Python, sin PyTorch), integración en el conector Katip Kalkan; no se distribuye en GGUF ni en safetensors, por lo que llama.cpp y Ollama no son aplicables directamente.
- Latencia y throughput: 5 páginas por segundo en CPU de portátil Apple M-series (una página = 500 palabras), frente a 32 de Nano y 1,7 de Base. En GPU el cuello de botella sería el preprocesado y el pipeline de reglas, no el modelo.
- Huella de descarga: 31 MB int8, apto para carga en pestaña de navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Katip Mask Mini v2 | 31M (3 capas) | 256 tokens/ventana | NER turco de nombres + reglas PII | CC BY-SA 4.0 | Hugging Face, ONNX int8 |
| Katip Mask Nano v1.1 | ~3M (estimado por tamano de 2,9 MB) | 256 tokens/ventana | NER turco de nombres + reglas PII | CC BY-SA 4.0 (segun familia) | Hugging Face |
| Katip Mask Base v2 | ~111 MB (modelo mayor de la familia) | 256 tokens/ventana | NER turco de nombres + reglas PII | CC BY-SA 4.0 (segun familia) | Hugging Face |
| DistilBERTurk (base) | 66M (6 capas, 32k vocab) | 512 tokens | Modelo de lenguaje enmascarado turco | MIT | Hugging Face |

La comparación relevante es interna a la familia: Mini ofrece un punto intermedio entre la velocidad de Nano (32 páginas/s) y la precisión de Base (KVKK-F2 de 93,1), con 88,6 de F2 y 5 páginas/s. Frente a DistilBERTurk original, Mini es más pequeño y está especializado en una única tarea, pero no es un modelo de propósito general.

## Limitaciones y advertencias

- Solo detecta nombres de persona (PER). No detecta por sí mismo direcciones, teléfonos, números de identidad ni otros tipos de PII; depende de las reglas del pipeline Katip para esas categorías.
- En prosa cotidiana el recall cae al 70,9% (frente al 99,2% en prosa judicial), por lo que no es adecuado como única capa de redacción en textos no legales.
- Las direcciones se filtran con frecuencia en la pista de fotos (28 de 120), lo que exige revisión humana o reglas adicionales en ese caso de uso.
- El pipeline estándar de token-classification de Hugging Face produce salida ruidosa con este modelo; es obligatorio usar la segmentación por palabra definida en `katip.word_regex` y leer los logits en el primer sub-token de cada palabra.
- El umbral de confianza (`trust` = 0,5 en `katip.json`) es un parámetro de operación: por debajo de él, Katip recorta palabras turcas comunes en los bordes de los spans, lo que puede alterar los límites de las entidades.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a compartir bajo la misma licencia las obras derivadas y exige atribución; conviene revisar la compatibilidad con productos propietarios.
- Entrenado principalmente con documentos legales sintéticos y datos de NER turco; puede tener sesgos hacia el dominio judicial y hacia nombres presentes en el corpus de entrenamiento.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos en la detección; el autor reporta 0 falsos positivos en documentos negativos sintéticos, pero no hay garantía en dominios fuera de distribución.
- Solo turco; no soporta otros idiomas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y creado el 14 de noviembre de 2026: ecosistema y validación externa muy limitados.
- Esta release solo publica el archivo ONNX int8; no hay pesos en safetensors ni versiones fp16/fp32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f1k/katip-mask-mini
- Modelo Nano: https://huggingface.co/f1k/katip-mask-nano
- Modelo Base: https://huggingface.co/f1k/katip-mask-base
- Demo Katip Mask (Space): https://huggingface.co/spaces/f1k/katip-mask
- Benchmark KVKK-Bench (Space): https://huggingface.co/spaces/f1k/kvkk-bench
- Repositorio fuente y conector Katip Kalkan: https://github.com/fikrifirat/katip
- Modelo base DistilBERTurk: https://huggingface.co/dbmdz/distilbert-base-turkish-cased
- Dataset turkish-wikiNER: https://huggingface.co/datasets/turkish-nlp-suite/turkish-wikiNER
