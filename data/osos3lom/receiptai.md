# osos3lom/receiptai

## Resumen

`osos3lom/receiptai` es un adaptador LoRA sobre el modelo vision-lenguaje `HuggingFaceTB/SmolVLM-256M-Instruct` (arquitectura Idefics3) especializado en extracción de campos estructurados de tickets y facturas simplificadas en árabe e inglés. Devuelve un JSON con comercio, número de IVA, fecha, subtotal, porcentaje y cuota de IVA, total, divisa y líneas de detalle. Lo publica el usuario osos3lom con licencia MIT y un tamaño de repositorio de 0,7 GB.

El interés técnico está en el enfoque: un adaptador de solo 5.090.304 parámetros entrenables (1,95 % del total de 261.575.232) que se ajusta únicamente sobre las capas lineales de texto y el conector de modalidad, dejando congelado el codificador visual, y que se exporta a ONNX para ejecutarse en el navegador con transformers.js y WebGPU. El caso de uso declarado es la extracción de campos en local, sin que el documento salga del dispositivo.

Es importante calibrar expectativas: la model card reporta una puntuación de puerta (gate score) de 99,3 sobre un conjunto sintético de 50 tickets, pero solo 52,7 sobre 37 escaneos reales fuera de dominio, con un intervalo de confianza del 95 % de [42,9, 62,5]. El propio autor lo describe como ayuda a la revisión, no como automatización contable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje Idefics3 (SmolVLM-256M-Instruct) con adaptadores LoRA; torre de visión congelada |
| Parametros totales | 261.575.232 |
| Parametros activos | No aplica (no es MoE) |
| Parametros entrenables | 5.090.304 (1,95 % del total) |
| Longitud de contexto | No disponible en la información proporcionada (el prefijo típico de un ticket es de ~1.733 tokens, de los cuales ~1.088 son marcadores de imagen) |
| Tipos de cuantizacion | No detallados en la model card; el repositorio incluye exportación ONNX para transformers.js y WebGPU |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) y ONNX |
| Configuracion LoRA | r=16, alpha=32, dropout=0,05 |
| Modulos adaptados | 211 capas Linear con nombre completo: atención de texto (120), MLP de texto (90) y conector de modalidad (1) |
| Precision de entrenamiento | FP16 con gradient checkpointing |
| Tamano del repositorio | 0,7 GB |
| Pipeline | image-text-to-text |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La base es SmolVLM-256M-Instruct, un modelo de la familia Idefics3 que combina un codificador visual con un modelo de lenguaje pequeño mediante un conector de modalidad que proyecta los tokens de imagen al espacio del texto. El ajuste se aplica con LoRA de rango 16 sobre 211 capas lineales identificadas por su nombre completo: 120 de atención de texto, 90 del MLP de texto y una del conector de modalidad. El autor señala explícitamente que no se adapta la torre de visión y que los objetivos se listan por nombre completo en lugar de por sufijo (`q/k/v/o_proj`) porque el emparejamiento por sufijo adaptaría también el codificador visual de forma silenciosa. La pérdida se calcula únicamente sobre la respuesta JSON del asistente: el prompt y los marcadores de imagen se enmascaran a -100, de modo que la fracción de tokens supervisados es del 32,3 %. Sobre un ticket típico, el prefijo ocupa unos 1.733 tokens y unos 1.088 son marcadores de imagen, por lo que enmascarar es determinante.

Los datos de entrenamiento combinan dos fuentes: 2.000 filas sintéticas (`synthetic_v2`) con etiquetas generadas por construcción, y 687 filas destiladas de Gemini a partir de escaneos reales de CORU (`teacher_distilled`), filtradas por control de calidad. El reparto es de 2.275 ejemplos de entrenamiento, 275 de validación y 137 de test, disjuntos por SHA-256 de la imagen, con un conjunto dorado de 50 tickets excluido de todas las particiones. Las etiquetas del profesor pasaron dos filtros: reconciliación matemática con residuo acotado (los tickets reales incluyen líneas de envío y servicio que el esquema no modela) y anclaje o *grounding*, que descarta cualquier valor numérico que no aparezca en el texto transcrito; se eliminaron así 175 subtotales, 145 cuotas de IVA y 15 totales que el profesor había recalculado en lugar de leer. Cuando se descarta la cuota de IVA, también se descarta el porcentaje, ya que el tipo no es deducible sin la cuota.

El conjunto sintético cubre 24 comercios, 5 regímenes de IVA (SAR 15/5/0 %, AED 5 %, EGP 14 %), descuentos, cargos por servicio, desviaciones por redondeo al efectivo y devoluciones, renderizados con anchos, tipografías y maquetaciones variadas y aumentados con perspectiva, rotación, iluminación desigual, sombras, desenfoque, ruido de sensor, recompresión JPEG y composición sobre superficies. Hiperparámetros: 3 épocas con parada temprana (paciencia 1), batch efectivo de 8 (1 por dispositivo × 8 de acumulación), tasa de aprendizaje 2e-4 con decaimiento coseno y 3 % de calentamiento, recorte de gradiente 1,0, AdamW con weight decay 0,01, semilla 42. Pérdidas: época 1 (0,4598 entrenamiento / 0,2328 validación), época 2 (0,1919 / 0,1944), época 3 (0,1672 / 0,1909, mejor validación). Tiempo de ejecución: 158,9 minutos en una única RTX 2080 Ti de 11 GB.

## Capacidades

- Extracción de campos estructurados en JSON a partir de la imagen de un ticket: comercio, número fiscal, fecha, subtotal, porcentaje de IVA, cuota de IVA, total, divisa y líneas de detalle.
- Comprensión de documentos en árabe e inglés, incluidos regímenes de IVA de Arabia Saudí (ZATCA), Emiratos Árabes Unidos y Egipto.
- Procesamiento local en navegador mediante la exportación ONNX con transformers.js y WebGPU, sin enviar la imagen a un servidor.
- Entrada multimodal imagen-texto con prompt conversacional (el pipeline declarado es image-text-to-text y la etiqueta `conversational` está presente).
- Manejo de variabilidad visual: rotaciones, perspectiva, sombras, iluminación desigual, desenfoque, ruido y recompresión JPEG, según la aumentación aplicada en entrenamiento.
- No dispone de *tool calling*, modo de razonamiento explícito, soporte de audio ni capacidad de agente multi-paso; la model card no los menciona y el tamaño del modelo (261,6 M de parámetros) no lo sugiere.
- No hay evidencia de soporte multilingüe más allá de árabe e inglés.

## Casos de uso

- **Digitalización de tickets en el navegador con privacidad por diseño**: el adaptador se ejecuta con transformers.js y WebGPU sobre el dispositivo del usuario, de modo que la imagen del ticket no se envía a ningún servidor. Adecuado para gestorías y autónomos que no quieren transferir documentos fiscales a terceros.
- **Pre-relleno de asientos contables con revisión humana obligatoria**: el modelo propone los campos y una persona los valida antes de que lleguen al libro mayor. La puntuación de 52,7 en documentos reales lo sitúa como ayuda a la captura, no como sustituto.
- **Enrutado y triaje de documentos**: usar la confianza y la coherencia matemática de la salida (subtotal + IVA = total) para decidir qué tickets se aceptan directamente y cuáles se escalan a un modelo mayor o a un humano. El coste marginal por documento es mínimo al ejecutarse en local.
- **Validación previa de campos fiscales ZATCA**: comprobación de número fiscal, tipo de IVA (15 %, 5 % o 0 % en SAR) y presencia de cuota antes de emitir una factura electrónica, como primer filtro en un formulario web.
- **Procesamiento por lotes de datos sintéticos para probar pipelines**: uso del modelo como generador de salidas de referencia en pruebas de regresión de un sistema OCR/extracción, ya que el dominio sintético es donde rinde (gate score 99,3).
- **Modelo alumno en un pipeline de destilación o etiquetado activo**: por su tamaño (261,6 M de parámetros, 5,1 M entrenables) es un candidato razonable para destilar un extractor mayor y para seleccionar qué documentos merecen etiquetado humano.
- **Extracción en movilidad o en equipos sin GPU dedicada**: los pesos en FP16 ocupan aproximadamente 0,5 GB, de modo que cabe en portátiles, navegadores de escritorio y, con cuantización adicional, en dispositivos móviles con WebGPU.
- **Asistente conversacional de gastos**: dado el formato JSON estable de salida, puede encadenarse a una capa de diálogo que responda preguntas sobre un ticket ya procesado (por ejemplo, desglose de IVA o importe de una línea).

## Benchmarks y rendimiento

Evaluación en dominio, sobre 50 tickets sintéticos dorados (los campos con menos de 5 ejemplos dorados quedan excluidos de la puntuación de puerta):

| Campo | Base | v3 |
|---|---|---|
| Comercio | 0 % | 100 % |
| Fecha | 18 % | 100 % |
| Total | 4 % | 100 % |
| Subtotal | 2 % | 100 % |
| Cuota de IVA | 2 % | 100 % |
| F1 de líneas de detalle | 0,0 | 97,7 |
| **Gate score** | 4,7 | **99,3** |

Evaluación fuera de dominio, sobre 37 escaneos reales de CORU:

| Campo | Base | Solo sintético | v3 |
|---|---|---|---|
| Comercio | 8,1 % | 0 % | 29,7 % |
| Fecha | 0 % | 10,8 % | 46,0 % |
| Total | 11,1 % | 41,7 % | 63,9 % |
| Subtotal | 0 % | 32,0 % | 56,0 % |
| Cuota de IVA | 8,0 % | 28,0 % | 68,0 % |
| Todos los campos monetarios | 0 % | 8,1 % | 32,4 % |
| F1 de líneas de detalle | 0,0 | 0,0 | 5,3 |
| **Gate score** | 5,4 | 22,5 | **52,7** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, DocVQA) en la información disponible. La evaluación fuera de dominio mide acuerdo con Gemini, no contra verdad verificada por humanos, y el intervalo de confianza al 95 % por bootstrap es [42,9, 62,5] con n=37. El número fiscal en dominio alcanza el 96 %, y es el único campo de esa partición que no puede memorizarse por ser aleatorio de 15 dígitos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: unos 0,5 GB de pesos en FP16 (261,6 M de parámetros), más el codificador visual y las activaciones de imagen; en la práctica, menos de 2 GB en total para una sola imagen. En int8 bajaría a ~0,26 GB y en int4 a ~0,13 GB de pesos, aunque no se documentan cuantizaciones oficiales.
- **GPU recomendadas**: cualquier GPU consumer moderna sirve; el autor entrenó con una RTX 2080 Ti de 11 GB, pero la inferencia no necesita nada parecido. Una RTX 3060/4060 o superior da margen de sobra. Para servidores, A100/H100/L4 son innecesarias por tamaño, aunque permiten mayor concurrencia.
- **Cabe en GPU consumer**: sí, en cualquier GPU con 4 GB o más, y en iGPU mediante WebGPU.
- **CPU**: viable en CPU para volúmenes bajos, con latencia mayor; no hay cifras publicadas.
- **Opciones de despliegue**: `transformers` + PEFT (ruta canónica del adaptador), ONNX Runtime Web / transformers.js con WebGPU para el navegador. El soporte en vLLM, TGI o llama.cpp no está confirmado en la información disponible; llama.cpp no soporta de forma nativa la arquitectura Idefics3.
- **Latencia y throughput**: no disponibles. El autor solo publica el tiempo de entrenamiento (158,9 minutos en una RTX 2080 Ti).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `osos3lom/receiptai` (este) | 261,6 M (5,1 M entrenables) | No disponible | Extracción de tickets ar/en con LoRA sobre SmolVLM | MIT | HuggingFace, ONNX para navegador |
| `HuggingFaceTB/SmolVLM-256M-Instruct` (base) | 256 M | No disponible en esta ficha | VLM generalista instruido | Apache 2.0 | HuggingFace |
| `HuggingFaceTB/SmolVLM-500M-Instruct` | ~500 M | No disponible en esta ficha | VLM generalista de tamaño superior | Apache 2.0 | HuggingFace |
| Florence-2-base | ~0,23 B | No disponible en esta ficha | Visión y OCR con tareas por prompt | MIT | HuggingFace |

La comparación de rendimiento no es directa: los benchmarks publicados por este modelo son propietarios (conjunto dorado sintético de 50 tickets y 37 escaneos reales de CORU), no comparables con DocVQA o similar. Frente a la base SmolVLM-256M-Instruct, la mejora medida en la propia partición sintética es de 4,7 a 99,3 en gate score, pero esa cifra está inflada por memorización de catálogo (ver limitaciones). Frente a alternativas más grandes, la ventaja es el tamaño y la ejecución en navegador, no la precisión.

## Limitaciones y advertencias

- **La puntuación en dominio mide en buena parte memorización, no lectura.** Los 12 comercios dorados y las 21 descripciones de línea doradas aparecen literalmente en los datos de entrenamiento, de modo que las puntuaciones de comercio y líneas miden recuerdo de un catálogo fijo. El número fiscal aleatorio de 15 dígitos (96 %) es el único campo en dominio no memorizable.
- **En un ticket real acierta aproximadamente la mitad de los campos, con barras de error amplias.** Gate score 52,7, IC 95 % [42,9, 62,5] con n=37, medido como acuerdo con Gemini y no contra verdad verificada. Es una ayuda a la revisión, no una automatización.
- **Inventa subtotal y cuota de IVA.** En los 12 tickets reales cuya referencia no trae subtotal ni IVA impresos, el modelo los declaró en 11 (91,7 %). Aprendió del sintético, donde todos los tickets llevan desglose de IVA, que todos lo llevan. El parser del navegador no puede tratar un subtotal o un IVA declarados como evidencia de que estaban impresos.
- **La extracción de líneas de detalle no funciona en tickets reales** (F1 5,3 frente a 97,7 en dominio). Es la evidencia más clara de sobreajuste al renderizador sintético.
- **Riesgo de alucinación en campos no presentes**: al entrenarse con un esquema fijo, el modelo tiende a rellenar campos obligatorios aunque el documento no los contenga.
- **Sesgo de dominio**: entrenado con datos de Arabia Saudí, EAU y Egipto; el rendimiento en formatos europeos o latinoamericanos no está evaluado.
- **Cobertura lingüística limitada** a árabe e inglés; no hay evaluación en otras lenguas.
- **Inconsistencias en los metadatos del repositorio**: las etiquetas incluyen `roberta` y `feature-extraction`, que contradicen la arquitectura declarada (Idefics3, image-text-to-text). Conviene tratarlas como ruido de etiquetado, no como descripción del modelo.
- **Licencia MIT** permite uso comercial sin restricciones adicionales, pero la licencia de la base (Apache 2.0 en SmolVLM) debe respetarse igualmente; el aviso de la model card sobre revisión humana es una recomendación, no una cláusula legal.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, sin tracción de la comunidad ni validación independiente. Las cifras de evaluación provienen únicamente del autor.
- **Para producción contable**: requiere revisión humana campo a campo, registro de la confianza y un mecanismo de reconciliación matemática que detecte subtotales y cuotas inventados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/osos3lom/receiptai
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct
- Repositorio del adaptador (archivos citados en la model card: `training_run.json`, `data-pipeline/run_eval.py`, `data-pipeline/eval_harness.py`, `data-pipeline/compare_arms.py`): https://huggingface.co/osos3lom/receiptai/tree/main
- Paper de Idefics3 / SmolVLM: no disponible en la información proporcionada
- Blog o demo del autor: no disponible
- Nota sobre la búsqueda web: los resultados obtenidos corresponden a productos comerciales homónimos sin relación con este modelo (`https://aiexpenseit.com/`, `https://receiptsai.com/`, `https://receiptaiapp.com/`, `https://github.com/rijff24/receiptAI`). No se incluyen como documentación del modelo porque no lo describen.
