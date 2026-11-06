# litert-community/Unlimited-OCR-2

## Resumen

Unlimited-OCR-2 es un modelo de visión-lenguaje para *parsing* de documentos desarrollado por Baidu (publicado el 27 de octubre de 2026). Convierte una imagen de página en una representación estructurada por bloques de maquetación: cada bloque lleva una etiqueta (`title`, `text`, `table`, `equation`, etc.), una caja delimitadora y su contenido, con las tablas en HTML y las fórmulas en LaTeX. Combina un codificador visual DeepEncoder (SAM ViT-B + CLIP-L con proyector, 401M parámetros) con un decodificador de texto DeepSeek-V2 de 12 capas y 2.9B parámetros, lo que da un total de 3.3B parámetros.

La ficha que nos ocupa no es el modelo original, sino una conversión a LiteRT-LM (`.litertlm`) publicada por `litert-community` el 4 de noviembre de 2026, pensada para inferencia *on-device* en Android, iOS y macOS. El artefacto incluido, `Unlimited-OCR-2_int8.litertlm` (3.81 GB), cuantiza a int8 las capas lineales del decodificador y la tabla de embeddings, mantiene el router DASH y la tabla de posiciones en coma flotante, y usa fp16 en el codificador visual y el proyector. La relevancia actual está en que permite ejecutar OCR estructurado de nivel documental sin conexión ni servidor, con latencias de 11 s por página en un iPhone 18 Pro y de 19-21 s en un Galaxy S26 (CPU, incluyendo la creación del motor).

Una limitación importante de esta conversión: procesa una sola página por petición, como una vista de 1.024 × 1.024 píxeles (273 tokens de imagen), mientras que el modelo original puede leer varias páginas en una sola petición. Además, el fichero no acepta un *prompt* arbitrario: la plantilla fija `<PAGE>` más la instrucción `Multi page parsing.`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language: codificador DeepEncoder (SAM ViT-B + CLIP-L + proyector) + decodificador de texto DeepSeek-V2 con atención DASH (block-sparse) |
| Parámetros totales | 3.3B (401M codificador visual + 2.9B decodificador) |
| Parámetros activos | 64 expertos enrutados por capa, 6 activos por token, más 2 compartidos (11 capas MoE; la primera capa es densa) |
| Longitud de contexto | 4.096 tokens (279 consumidos por el prompt de página; hasta 3.817 tokens de respuesta) |
| Tipos de cuantización | int8 en capas lineales del decodificador y tabla de embeddings; fp32 en proyecciones query/key del router DASH y tabla de posiciones; fp16 en codificador visual y proyector; activaciones fp32 declaradas para GPU |
| Idiomas soportados | Multilingüe (sin listado explícito de idiomas) |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM 0.19.0); pesos originales en `baidu/Unlimited-OCR-2` |
| Tamaño del artefacto | 3.81 GB (`Unlimited-OCR-2_int8.litertlm`) |
| Resolución de entrada | 1.024 × 1.024 (redimensionado sin preservar relación de aspecto; requiere *padding* a cuadrado gris 127,127,127) |
| Librería | `litert-lm` |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos torres. El codificador visual DeepEncoder integra SAM ViT-B y CLIP-L con un proyector que mapea las características visuales al espacio del decodificador; en esta conversión se ejecuta en fp16. El decodificador de texto replica la estructura DeepSeek-V2: 12 capas, la primera densa y las 11 restantes de mezcla de expertos con 64 expertos enrutados (6 activos por token) y 2 compartidos. La innovación arquitectónica principal es DASH, una atención de bloques dispersa en la que un router selecciona, para cada *query*, 12 bloques de 32 posiciones a los que atender, lo que reduce el coste cuadrático del mecanismo de atención.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Sí se especifica el formato de salida aprendido: texto plano con etiquetas `<PAGE>`, y por cada bloque `<BLOCK>label[x1, y1, x2, y2]<FORK>content`, con coordenadas en escala 0-999 sobre la página original (antes del *padding*). En esta conversión LiteRT-LM no se define *sampler*, por lo que la decodificación es greedy (token más probable en cada paso).

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de página completa con salida estructurada por bloques de maquetación.
- Etiquetado de bloques: `title`, `text`, `table`, `equation`, entre otros.
- Reconocimiento de tablas con serialización en HTML.
- Reconocimiento de fórmulas matemáticas con serialización en LaTeX.
- Detección de cajas delimitadoras por bloque en escala normalizada 0-999.
- Procesamiento multilingüe (sin desglose de idiomas en la documentación).
- Inferencia *on-device* sin conexión en Android, iOS y macOS mediante LiteRT-LM.
- Selección de *backend* por componente: codificador visual y decodificador pueden ejecutarse independientemente en CPU o GPU.
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso en esta conversión; el *prompt* está fijado por la plantilla.
- Procesa una página por petición; el modelo original soporta múltiples páginas por petición.

## Casos de uso

- Digitalización de facturas y recibos en movilidad: la aplicación captura la foto, aplica la orientación EXIF y el *padding* a cuadrado, y el modelo devuelve bloques `text` y `table` con coordenadas, lo que permite extraer importes y líneas de detalle sin subir la imagen a un servidor. El escenario está validado en las pruebas del autor con una foto de recibo.
- Archivado de documentación técnica con fórmulas: las páginas con ecuaciones densas se serializan como bloques `equation` en LaTeX, aptos para alimentar un repositorio de documentación o un sistema de composición. La página de ecuaciones densas es uno de los casos de prueba del autor, con respuestas de hasta unos 1.600 tokens.
- Extracción de tablas de informes financieros: la salida HTML de los bloques `table` puede parsearse directamente con un parser HTML para volcar a CSV o a una base de datos, conservando la caja del bloque para trazabilidad.
- Accesibilidad y lectura asistida: la estructura por bloques con etiquetas y cajas permite reordenar el contenido de una página para lectores de pantalla o para síntesis de voz, respetando la jerarquía de títulos.
- Procesamiento por lotes en un Mac de sobremesa: con el decodificador en GPU (98-99 tok/s frente a 55-56 tok/s en CPU) y 18 de 19 pruebas superadas, es viable procesar colecciones de páginas escaneadas en local, una petición por página y en orden.
- Preprocesado en pipelines de RAG documental: la salida estructurada (bloques con etiqueta y contenido) se trocea de forma natural para indexación, evitando cortes arbitrarios por número de caracteres.
- Verificación de formularios en campo: en un Android de gama alta (Galaxy S26, 19-25 s por página en CPU) el modelo puede comprobar sobre el dispositivo que un formulario rellenado contiene los campos esperados, manteniendo los datos en el terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son medidas de latencia y *throughput* del autor de la conversión:

| Plataforma / configuración | Latencia por página | Throughput | Notas |
|---|---|---|---|
| iPhone 18 Pro, CPU | ~11 s (en frío, con creación del motor) | no disponible | Más rápido que GPU Metal con caché escrita; la mitad de memoria |
| iPhone 18 Pro, GPU Metal | no disponible | no disponible | Con caché vacía: 13,8 s frente a 14,5 s en CPU para un párrafo |
| Galaxy S26, CPU | 19-21 s (en frío, con motor); 19-25 s | no disponible | Configuración recomendada en Android |
| Galaxy S26, decodificador en GPU | 25-31 s | no disponible | Más lento que CPU |
| Galaxy S26, decodificador + codificador en GPU | fallo | no disponible | Memoria disponible cae a 0,82 GiB y el guardián de memoria detiene el proceso |
| Mac, GPU | no disponible | 98-99 tok/s | 18 de 19 pruebas superadas |
| Mac, CPU | no disponible | 55-56 tok/s | 17 de 19 pruebas superadas |

Tamaño de caché del runtime en el dispositivo: aproximadamente 4,4 GB en CPU y 2,8 GB en GPU, escritos junto al modelo en la primera petición.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, el propio modelo original `baidu/Unlimited-OCR-2` es la alternativa directa: comparte arquitectura y pesos, pero soporta múltiples páginas por petición y no está limitado al artefacto LiteRT-LM ni a la resolución fija de 1.024 × 1.024. La comparación con otros sistemas de OCR documental (parámetros, contexto, licencia y disponibilidad) queda como no disponible.

## Limitaciones y advertencias

- Una página por petición en esta conversión; el modelo original admite varias páginas por petición.
- El *prompt* no es configurable: la plantilla fija `<PAGE>` más la instrucción `Multi page parsing.`.
- Redimensionado a 1.024 × 1.024 sin preservar la relación de aspecto y sin leer la orientación EXIF; es obligatorio aplicar la orientación y el *padding* a cuadrado gris (127,127,127) en el código de integración, como hace `ocr_unlimited.py`.
- En Android conviene usar CPU: el decodificador en GPU fue más lento en el Galaxy S26, y con ambos componentes en GPU el proceso se detuvo por falta de memoria (0,82 GiB disponibles).
- En iPhone, GPU y CPU fallaron cada una en una foto distinta de las pruebas (GPU en la foto de recibo, CPU en la foto de formulario); en Mac con el codificador visual en CPU, el decodificador en GPU falló en la foto de recibo y en la página de ecuaciones densas.
- En teléfonos Android de 8 GB (Pixel 8a) no se pudo ejecutar una compilación anterior a velocidad utilizable.
- La primera petición en cada dispositivo es lenta (escritura de caché de ~4,4 GB en CPU o ~2,8 GB en GPU).
- Riesgo de alucinación en el contenido transcrito: no se documentan métricas de fidelidad carácter a carácter ni de tasas de error por tipo de bloque.
- Sesgos: no se documentan sesgos conocidos del modelo ni del conjunto de entrenamiento.
- Cobertura lingüística declarada como multilingüe sin listado de idiomas ni evaluación por idioma.
- Licencia MIT, que permite uso comercial; conviene verificar igualmente las condiciones del modelo base `baidu/Unlimited-OCR-2` antes de desplegar en producción.
- Repositorio con 0 descargas y 1 *like* en el momento de la consulta: es una conversión reciente y poco validada por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Unlimited-OCR-2
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- Herramienta de conversión `hf-to-litertlm`: https://github.com/john-rocky/hf-to-litertlm
- Script de inferencia `ocr_unlimited.py`: https://github.com/john-rocky/hf-to-litertlm/blob/main/unlimitedocr2_work/ocr_unlimited.py
- LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM
