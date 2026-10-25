# Peter-A-P/legible-2b-cord-v1120-s0-f83ed25a5c

## Resumen

`Peter-A-P/legible-2b-cord-v1120-s0-f83ed25a5c` es un adaptador QLoRA (PEFT/LoRA) sobre el modelo multimodal `google/gemma-4-E2B` especializado en una única tarea: leer la imagen de un recibo de restaurante o comercio del dataset CORD y devolver todos sus campos como un objeto JSON. No es un modelo completo, sino un delta de pesos de 0,4 GB que debe cargarse junto al modelo base en la revisión indicada. Lo publica el autor Peter-A-P dentro del proyecto «Forms That Read Themselves» (paquete `legible`), un banco de pruebas que compara modelos de visión frontier, modelos pequeños ajustados y pipelines OCR clásicos sobre formularios escaneados con respuesta conocida.

Su interés es acotado pero real: demuestra un patrón de extracción de documentos con esquema JSON fijo, con un contrato de entrada muy concreto (páginas como imágenes en orden, más una instrucción versionada, `legible.prompt` v1, que describe cada campo y aporta el JSON Schema) y una salida compacta sin espacios donde cada valor es una cadena o `null`. El ajuste se hizo con 800 documentos (800 páginas) de CORD v2, 100 pasos de optimizador, 1.120 tokens visuales por página y un límite de secuencia de 12.288 tokens.

Conviene leerlo como una ficha de experimento reproducible más que como un modelo listo para producción: cero descargas, cero likes en el momento de la consulta, un único dominio (recibos fotografiados de Indonesia) y una evaluación descrita pero cuyos resultados numéricos no aparecen en la información disponible (la model card se corta en la sección de resultados). El identificador del run incluye «2b», aunque el número de parámetros no se declara en ninguna parte del material proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA (rango 64) sobre `google/gemma-4-E2B`: proyecciones de atención y MLP del modelo de lenguaje más el proyector visual; las torres de visión y audio no se ajustan. Arquitectura interna del modelo base: no disponible |
| Parametros totales | no disponible (el identificador del run incluye «2b», sin confirmación en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | límite de secuencia usado en entrenamiento: 12.288 tokens; ventana nativa del modelo base: no disponible |
| Tipos de cuantizacion | NF4 4-bit con doble cuantización y cómputo en bf16 (solo durante el entrenamiento QLoRA); el adaptador se distribuye en safetensors sin cuantizar; no se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | `en` (declarado en la model card); los documentos de entrenamiento y evaluación son recibos en indonesio |
| Licencia | apache-2.0 (adaptador, misma que el modelo base); datos CORD v2 bajo CC BY 4.0 |
| Formato de pesos | safetensors (adaptador PEFT); tamano del repo: 0,4 GB |

## Arquitectura y entrenamiento

El adaptador sigue la receta QLoRA del proyecto (`legible/train/vision.py`): el modelo base se cuantiza a NF4 4-bit con doble cuantización y cómputo en bf16, dejando a precisión completa las torres de visión y audio, el proyector visual y la capa de salida. Sobre esa base se insertan adaptadores LoRA de rango 64, alpha 128 y dropout 0,05 en las proyecciones de atención y MLP del modelo de lenguaje y en el proyector visual, nunca en las torres. Cada ejemplo de entrenamiento es un turno de usuario con las imágenes de la página seguidas de la instrucción `legible.prompt` v1 (descripción de campos más JSON Schema) y un turno de asistente con el JSON de verdad; la pérdida se calcula solo sobre los tokens de la respuesta. Hiperparámetros: tasa de aprendizaje 1e-4, schedule coseno, warmup 0,03, 1 epoch, 1 documento por paso con 8 pasos acumulados, semilla 0, lo que da 100 pasos de optimizador.

Los datos son CORD v2 (Clova AI, Park et al. 2019, CC BY 4.0) en el commit `7f0115a4b758a71d6473b8d085751692da2fef98`: 800 documentos y 800 páginas, todas de la partición de entrenamiento, con rechazo explícito de documentos reservados (`legible/train/dataset.py`). La salida aprendida es un objeto JSON por documento, en forma compacta (`{"advertiser":null}`, sin espacios), con valores de tipo cadena o `null`. La innovación técnica aquí no está en la arquitectura, sino en el contrato: prompt versionado, esquema cerrado y comparación contra modelos frontier y pipelines OCR con el mismo grader. No se documenta RLHF, DPO ni ninguna fase de alineación posterior al ajuste supervisado.

## Capacidades

- Extracción de campos de recibos a JSON: lista `menu[]` (nombre, código, precio unitario, cantidad, descuento, precio de línea, subtotal, IVA, etc.), lista `sub_item[]` (componentes de menús combinados), lista `void_menu[]` (líneas anuladas), totales y subtotales, cargos de servicio, impuestos, efectivo entregado, cambio, pago con tarjeta y pago con dinero electrónico.
- Agregados impresos: `menutype_cnt` (número de artículos distintos) y `menuqty_cnt` (cantidad total de artículos), cuando aparecen en el recibo.
- Salida estructurada estricta: un objeto JSON por documento, valores como cadena o `null`, sin espacios, en el formato exacto del entrenamiento.
- Entrada multimodal: imágenes de páginas en orden, con 1.120 tokens visuales por página.
- Cumplimiento de esquema: el modelo fue entrenado únicamente con la instrucción `legible.prompt` v1 y su JSON Schema, por lo que el condicionamiento por esquema es parte de su comportamiento esperado.
- Etiqueta `conversational` en HuggingFace, heredada del pipeline `image-text-to-text`; no se documenta uso conversacional multi-turno real.
- Tool calling / function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado; la tarea es de un solo paso (imagen más instrucción, una respuesta).
- Idiomas: solo `en` declarado; el contenido de los documentos es indonesio.
- Capacidades especiales: no se documentan modo de pensamiento, audio ni vídeo. El modelo base parece incluir una torre de audio (se menciona al describir la cuantización), pero el adaptador no la ajusta ni la evalúa.

## Casos de uso

- Digitalización de gastos de viaje: el adaptador convierte la foto de un ticket de restaurante en un JSON con líneas, impuestos y total, que se vuelca directamente en un sistema de reembolsos sin intervención manual. Es adecuado porque el esquema de salida está cerrado y cubre exactamente los campos que pide un flujo de gastos.
- Conciliación de caja en hostelería: a partir del ticket fotografiado se extraen `total_price`, `cashprice`, `changeprice`, `creditcardprice` y `emoneyprice`, lo que permite cuadrar el cierre de turno por método de pago.
- Auditoría fiscal y control de discrepancias: la separación entre `subtotal_price`, `discount_price`, `service_price`, `tax_price` y `total_price` permite recalcular aritmética y marcar recibos incoherentes; el modelo entrega los campos por separado en lugar de un texto libre.
- Anotación asistida de datasets de recibos: el adaptador puede preetiquetar imágenes nuevas del dominio CORD (recibos indonesios) y dejar al revisor humano solo la corrección, aprovechando la forma compacta de la salida.
- Aplicación de finanzas personales: el JSON de líneas `menu[]` con `nm`, `cnt` y `price` se puede agregar por categoría de producto para dar al usuario un desglose de su gasto en restaurantes.
- Evaluación comparativa de pipelines de extracción: al estar publicado con su receta, sirve como línea base de «modelo pequeño ajustado» frente a OCR más reglas y frente a modelos frontier dentro del banco de pruebas `legible`, con el mismo grader.
- Filtro de calidad previo a un OCR caro: al ser un adaptador pequeño y de una sola pasada, puede usarse para decidir si un recibo es legible y estructurable antes de enviarlo a un pipeline más costoso.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card describe el protocolo, pero el texto se interrumpe en la sección de resultados justo cuando iba a presentarlos.

Protocolo descrito (sin cifras asociadas):

| Aspecto | Detalle |
|---|---|
| Conjunto de evaluación | 100 recibos de test de CORD, leídos una sola vez |
| Configuración de decodificación | nivel 0, temperatura 0, sin restricciones de esquema |
| Métrica | precisión de campo con los matchers de VRDU, un único grader para todos los lectores |
| Intervalos | bootstrap del 95 % sobre documentos |
| Coste | adaptador valorado a una RTX 3090 a 0,50 USD/hora en RunPod (2026-10-18) sobre el tiempo de reloj medido de la lectura |

## Requisitos de hardware

- VRAM del adaptador: 0,4 GB en disco en safetensors; hay que sumar el modelo base `google/gemma-4-E2B`, cuyos requisitos no se declaran en la información disponible.
- Estimación orientativa (no confirmada) si el base ronda los 2.000 millones de parámetros, como sugiere el nombre del run: ~4-5 GB en bf16 para los pesos, más la torre visual y la caché de 1.120 tokens de imagen por página; en 4-bit, ~1,5-2 GB de pesos.
- GPU recomendadas: la model card cita una RTX 3090 (24 GB) para el cálculo de coste, lo que indica que cabe holgadamente en esa tarjeta. A100 y H100 no se mencionan; serían sobredimensionadas para este tamaño salvo por concurrencia.
- GPU de consumo: con la estimación anterior, una RTX 4090, 4080 o incluso una tarjeta de 12 GB en 4-bit deberían ser suficientes para una página a la vez; no hay medición publicada que lo confirme.
- Despliegue: al ser un adaptador PEFT, requiere cargar el base con `transformers` + `peft`; no se publican artefactos GGUF, por lo que `llama.cpp` y Ollama no están soportados de forma directa. vLLM o TGI son viables solo si soportan el modelo base y adaptadores LoRA en la versión concreta.
- Latencia y throughput: no disponibles (el dato de tiempo de reloj existe en `run.json`, pero no se transcribe en la información proporcionada).

## Comparativa con modelos similares

Solo la primera fila procede de la información aportada; el resto se incluye como referencia de categoría y sus valores deben verificarse en sus propias fichas.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre gemma-4-E2B) | no disponible («2b» en el nombre) | 12.288 tokens de secuencia en entrenamiento | Resultados no disponibles en la información | apache-2.0 | Adaptador PEFT, 0 descargas |
| `naver-clova-ix/donut-base-finetuned-cord-v2` (OCR-free especializado en CORD) | no disponible en la información | no disponible | no disponible | no disponible en la información | Modelo completo publicado por los autores de CORD |
| VLM generalista de ~3-4B con salida JSON (p. ej. familia Qwen-VL o Gemma) | ~3-4B (orientativo) | no disponible | no disponible | según familia | Requiere prompt y esquema, sin ajuste específico |
| Pipeline OCR + reglas sobre CORD | no aplica | no aplica | no disponible | depende de los componentes | Solutions maduras, más frágiles ante maquetación variable |

## Limitaciones y advertencias

- Dominio cerrado: solo recibos del estilo CORD (restaurantes y comercios de Indonesia, fotografiados). No hay evidencia de que funcione con facturas, albaranes, tickets de otros países ni documentos de varias páginas.
- Una página por documento en la práctica: aunque la entrada admite páginas en orden, el entrenamiento usó 800 documentos y 800 páginas, es decir, una página por documento.
- Instrucción única: se entrenó exclusivamente con `legible.prompt` v1. Cambiar el prompt, el esquema o el orden de los campos puede degradar la salida sin aviso.
- Salida sin restricciones en evaluación: la decodificación descrita es «unconstrained», por lo que el modelo puede emitir JSON inválido o incompleto; en producción conviene validar contra el esquema y aplicar reintentos.
- Riesgo de alucinación en campos numéricos: precios, cantidades e impuestos pueden inventarse o confundirse entre líneas, especialmente en imágenes borrosas o con dígitos ambiguos; no debe usarse como fuente de verdad contable sin verificación.
- Datos de entrenamiento limitados: 800 documentos, 1 epoch, 100 pasos de optimizador. Es un ajuste corto, con riesgo de sobreajuste al estilo concreto de CORD.
- Idiomas: la model card declara `en`, pero el contenido real de los documentos es indonesio; no hay evaluación multilingüe ni garantía en castellano.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de calidad.
- Licencia del adaptador apache-2.0, pero los datos CORD v2 son CC BY 4.0 y exigen atribución a Clova AI (Park et al., 2019) en cualquier uso derivado; además, el uso comercial queda sujeto a los términos del modelo base `google/gemma-4-E2B`, que deben revisarse por separado.
- Dependencia estricta de la revisión del base (`d29ff6b45f081a49ee2733a859c9c9c2d95d1a6f`) y de la plantilla de chat de `google/gemma-4-E2B-it` (`3e22461f65e89153144f8adb70e3b8c2cc9845a7`); otras revisiones pueden romper la compatibilidad de los pesos.
- El registro de entrenamiento (`run.json`, con pérdida y tiempos) no está incluido en la información disponible, lo que impide reproducir el coste declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Peter-A-P/legible-2b-cord-v1120-s0-f83ed25a5c
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Modelo base (variante instruct, plantilla de chat): https://huggingface.co/google/gemma-4-E2B-it
- Dataset CORD v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Repositorio y términos de CORD (Clova AI): https://github.com/clovaai/cord
- Licencia CC BY 4.0: http://creativecommons.org/licenses/by/4.0/
- Paper de CORD: Park et al., «CORD: A Consolidated Receipt Dataset for Post-OCR Parsing», 2019 (enlace directo no disponible en la información)
- Paquete `legible` y su banco de pruebas: no disponible (sin URL en la información proporcionada)
- Enlaces a benchmarks VRDU: no disponible
