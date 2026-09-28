# decosaai/decosa-oneline-reader-paddleocr-vl

## Resumen

decosa-oneline-reader-paddleocr-vl es un modelo de vision-lenguaje de 905.601.648 parámetros (0,91 B; el autor lo describe como 0,96 B) desarrollado por decosaai. Se trata de un ajuste fino completo de PaddleOCR-VL-1.6, que combina un codificador visual NaViT con el modelo de lenguaje ERNIE-4.5-0.3B. Su única tarea es leer diagramas unifilares (one-line o single-line diagrams) de solicitudes de interconexión solar o de almacenamiento y devolver un objeto JSON compacto con la tensión del punto de interconexión, el límite de potencia de la planta, los grupos de inversores (cantidad, modelo y potencia), el almacenamiento en baterías, el transformador principal y la presencia de seccionador, contador e interruptor principal.

El interés del modelo está en su especialización extrema y en su comportamiento sobre escaneos degradados. Según la model card, en cuatro conjuntos de prueba de 60 dibujos cada uno obtiene 59/60 en escaneos deficientes, frente a 25/60 de un modelo de visión general de 27 B y 0/12 del modelo base. No es un OCR general ni un parser de documentos: el propio autor advierte que ya no sirve para eso.

El modelo se distribuye con licencia Apache-2.0, en safetensors, con pipeline image-text-to-text, idioma inglés y unidades estadounidenses (kV, kVA, MW, MWh). El repositorio ocupa 1,8 GB y su uso declarado es la lectura de primera pasada para que un revisor humano contraste el dibujo con el formulario de solicitud, nunca la aprobación o rechazo automático de la solicitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje: codificador visual NaViT + modelo de lenguaje ERNIE-4.5-0.3B (procedente de PaddleOCR-VL-1.6) |
| Parametros totales | 905.601.648 (0,91 B; el autor indica 0,96 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor publica pesos en safetensors y ejecuta en bf16; no se anuncian variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles; etiquetas en ingles y unidades estadounidenses) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, con custom_code) |

## Arquitectura y entrenamiento

El modelo parte de PaddleOCR-VL-1.6 (commit c5630abae1d9), que integra un codificador visual NaViT con el modelo de lenguaje ERNIE-4.5-0.3B de Baidu, todo bajo Apache-2.0. Sobre esa base se realizó un ajuste fino completo (no LoRA ni adaptadores) orientado a una única tarea de extracción estructurada: dada una imagen de un diagrama unifilar, generar un objeto JSON con nueve campos verificables (POI kV, límite de planta, modelos de inversor, recuentos y kVA, MW y MWh de almacenamiento, MVA del transformador y seccionador).

Los datos de entrenamiento son 16.000 diagramas unifilares sintéticos generados por un script propio de Decosa, con plantas, localidades y modelos de inversor ficticios. La composición es un 35 % de dibujos limpios, un 15 % con una degradación fija de tipo escaneo pobre y un 50 % con degradaciones aleatorias (escala 0,42-0,9, desenfoque, inclinación de hasta 2,5°, umbral de fax, papel gris y JPEG con calidad 20-75). La mitad de los dibujos emplean nombres de modelo y potencias ficticios aleatorios. Las tipografías son Liberation (SIL OFL 1.1) y DejaVu, y no se usaron dibujos reales, datos personales ni contenido scrapeado. El generador y el dataset no se han publicado.

El entrenamiento usó AdamW (β 0,9/0,95), learning rate 3e-5 con coseno y 40 pasos de warm-up, torre de visión a 0,3× del learning rate, autocast bf16 con pesos maestros en fp32, pérdida solo sobre los tokens de respuesta y lotes con presupuesto de 24.000 tokens. Fueron 1.707 pasos, 58 minutos en una H200, semilla 20260928, con una pérdida de validación que bajó de 2,55 a 0,0041. Cada objetivo de entrenamiento se volvió a parsear y se verificó contra el ground truth del dibujo antes de usarse. No hubo selección de checkpoint sobre los conjuntos de prueba: el checkpoint final es el del cierre del tiempo asignado.

## Capacidades

- Lectura de diagramas unifilares eléctricos y extracción de campos estructurados en un único objeto JSON.
- Tolerancia a escaneos degradados: reducción de escala, desenfoque, inclinación, ruido tipo fax, papel gris y compresión JPEG agresiva.
- Reconocimiento de grupos de inversores: cantidad, modelo y potencia en kVA.
- Extracción de datos de almacenamiento en baterías (MW y MWh) y del transformador principal (MVA).
- Detección de elementos dibujados: seccionador, contador e interruptor principal.
- Lectura de nombres de modelo de inversor incluso cuando no aparecieron en el entrenamiento (con nombres y potencias aleatorios, 50 de 60 dibujos correctos en el conjunto de escaneos deficientes).
- Salida determinista por diseño de uso: la model card recomienda `do_sample=False`.
- No dispone de tool calling, function calling, capacidades de agente, modo de razonamiento explícito, audio ni visión general más allá del tipo de documento para el que fue afinado.

## Casos de uso

- Triaje de solicitudes de interconexión: dado el paquete documental de una solicitud solar o de almacenamiento, el modelo extrae los campos del diagrama unifilar para que un revisor los contraste con el formulario sin teclear a mano. Adecuado porque devuelve JSON parseable directamente y funciona sobre escaneos de baja calidad habituales en estos expedientes.
- Verificación aritmética automatizada: los campos extraídos (cantidad de inversores × potencia frente al límite de planta, MVA del transformador, MWh de batería) permiten comprobaciones programáticas antes de pasar el expediente a una persona.
- Segunda lectura junto a un modelo de visión general: en escaneos donde un VLM grande falla (25/60 en el conjunto de escaneos deficientes frente a 59/60 de este modelo), puede usarse como lector de respaldo o de consenso.
- Digitalización de archivos históricos con calidad de fax: el entrenamiento con degradación de fax, papel gris y JPEG de baja calidad lo hace apto para lotes de documentos escaneados hace años, no solo para PDF nativos.
- Prellenado de bases de datos de activos de generación: conversión de un lote de diagramas en registros estructurados (modelo de inversor, número de unidades, capacidades) para inventario o CRM técnico.
- Comparación entre la versión aprobada y la versión construida de una planta: extracción de los mismos campos en dos juegos de planos para detectar discrepancias de modelo de inversor, número de unidades o límite de potencia, con revisión humana de cada diferencia.
- Control de calidad de un generador de diagramas interno: si la organización produce sus propios unifilares de forma procedural, el modelo puede usarse como lector automático para validar que el dibujo generado contiene los campos esperados.
- Filtrado previo en un pipeline de revisión regulatoria: descartar o marcar expedientes incompletos (falta el seccionador o el contador en el dibujo) antes de que lleguen al ingeniero.

## Benchmarks y rendimiento

Datos publicados en la model card y en `eval_summary.json`. Cuatro conjuntos de 60 dibujos cada uno, generados con la misma plantilla procedural que los datos de entrenamiento pero con semillas no usadas en el entrenamiento. "Todos los campos correctos" significa que los nueve campos del dibujo son correctos. Las líneas base leen las mismas imágenes con el mismo evaluador.

| Conjunto de prueba (60 dibujos cada uno) | Base PaddleOCR-VL-1.6 | Qwen3.8-27B (visión) | Este modelo |
|---|---|---|---|
| Escaneos deficientes (reducidos, desenfocados, inclinados, con ruido, JPEG) | 0 de 12 probados (sin JSON usable) | 25 | 59 |
| El conjunto limpio degradado de la misma forma | — | 16 | 59 |
| Dibujos limpios (comprobación de regresión) | 0 de 12 probados | 59 | 60 |
| Escaneos deficientes con nombre y potencia de cada inversor aleatorios (nunca vistos en entrenamiento) | — | — | 50 |

Resultados por campo en los escaneos deficientes, este modelo frente a Qwen3.8-27B: modelos de inversor 60 frente a 38 de 60; recuentos de inversor 91 frente a 57 de 91; kVA de inversor 91 frente a 67 de 91. El resto de campos queda entre el 98 % y el 100 % en ambos. En el conjunto de nombres aleatorios los fallos son un carácter incorrecto en un nombre de modelo (por ejemplo 8908 leído como 6908), un guion leído como espacio o un recuento desviado en una unidad.

Velocidad: aproximadamente 1,2 s por dibujo en bf16 sobre una GPU de estación de trabajo con lote 6, y 2-3 s en los dibujos limpios de mayor tamaño.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los pesos ocupan aproximadamente 1,8 GB; con el codificador visual, la caché y las activaciones de una imagen de ~1 MP, cabe holgadamente por debajo de 6 GB.
- GPU recomendadas: cualquier GPU con 6-8 GB o más. El modelo es perfectamente ejecutable en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090; en el extremo profesional, A100, H100 y H200 sin problema. El entrenamiento declarado se hizo en una H200 en 58 minutos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con al menos 6 GB de VRAM, incluidas portátiles de gama media-alta.
- Opciones de despliegue: transformers es la vía confirmada por el autor (`AutoModelForImageTextToText` y `AutoProcessor`, con `transformers>=5.17`). El repositorio incluye `usage.py` como script de ejemplo. No se confirman en la información disponible integraciones con vLLM, TGI, llama.cpp, Ollama u otros servidores de inferencia; la etiqueta `endpoints_compatible` sugiere compatibilidad con los endpoints de HuggingFace, pero no se detalla.
- Latencia y throughput estimados: ~1,2 s por dibujo en bf16 con lote 6 en una GPU de estación de trabajo; 2-3 s en dibujos limpios grandes. El autor recomienda pasar `use_cache=True` a `generate()` para aprovechar la caché de clave-valor.
- Nota de integración: las imágenes pequeñas se amplían a ~1 MP antes de la inferencia (ver `usage.py`), lo que conviene replicar para obtener los resultados publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en escaneos deficientes (60 dibujos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decosa-oneline-reader-paddleocr-vl | 905,6 M | no disponible | 59/60 | Apache-2.0 | HuggingFace (pesos safetensors) |
| PaddleOCR-VL-1.6 (modelo base) | no disponible en la información proporcionada | no disponible | 0 de 12 probados (sin JSON usable) | Apache-2.0 | HuggingFace |
| Qwen3.8-27B (visión) | 27 B (según la model card) | no disponible | 25/60 | no disponible en la información proporcionada | no disponible en la información proporcionada |

El modelo base PaddleOCR-VL-1.6 es un OCR/parser de documentos de propósito general, mientras que este ajuste es un extractor de un único tipo de documento; la comparación de rendimiento solo es válida para esa tarea concreta. No se dispone de otros modelos especializados en diagramas unifilares con los que comparar.

## Limitaciones y advertencias

- Una sola familia de dibujos: tanto el entrenamiento como todos los conjuntos de prueba provienen de una única plantilla procedural (cuatro estilos de etiqueta, tres conjuntos de fuentes y múltiples degradaciones). No se ha evaluado ningún unifilar real de una eléctrica. Los dibujos reales (cajetines de CAD, esquemas de protección densos, varias hojas, anotaciones a mano) quedan fuera de distribución y cabe esperar campos omitidos o inventados hasta que se pruebe y reentrene con ellos.
- Nombres de modelo inventados: aproximadamente 1 de cada 8 dibujos presenta un error de un carácter en un nombre de modelo. Hay que contrastar las cadenas de modelo con la solicitud o con una lista de fichas técnicas.
- Ausencia de verificación de plausibilidad: el modelo informa de lo que ha leído, no de si el valor es razonable. Debe combinarse con comprobaciones aritméticas (recuento de inversores × potencia frente al límite de planta) y con revisión humana.
- Idioma y unidades: solo etiquetas en inglés y unidades de estilo estadounidense (kV, kVA, MW, MWh). No hay soporte multilingüe.
- Uso previsto restringido: no debe emplearse para aprobar o rechazar una solicitud de interconexión, ni para estudios de ingeniería o de protecciones, ni para ninguna decisión sin que una persona compruebe el dibujo. Cada valor es una lectura a verificar, no un hecho.
- Licencia: Apache-2.0, lo que permite uso comercial y modificación; conviene revisar igualmente las condiciones del modelo base PaddleOCR-VL-1.6 y de sus componentes (ERNIE-4.5-0.3B, codificador NaViT) antes de un despliegue en producción.
- El generador de datos y el dataset no se han publicado, por lo que no es posible reproducir el ajuste ni auditar la distribución de entrenamiento.
- Riesgo de alucinación específico: al ser un extractor de campos cerrados, los errores se manifiestan como valores plausibles pero incorrectos (un carácter cambiado, un guion convertido en espacio, un recuento desviado en una unidad), no como texto evidentemente erróneo.
- No se ha publicado información sobre sesgos demográficos ni de otro tipo; el corpus es enteramente sintético y sin datos personales.
- Longitud de contexto y opciones de cuantización no documentadas, lo que limita la planificación de despliegues con requisitos estrictos de memoria o de ventana de entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/decosaai/decosa-oneline-reader-paddleocr-vl
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Script de ejemplo y resultados de evaluación: `usage.py` y `eval_summary.json` en el repositorio del modelo
- Organización del autor: https://huggingface.co/decosaai
- Organización PaddlePaddle: https://huggingface.co/PaddlePaddle
