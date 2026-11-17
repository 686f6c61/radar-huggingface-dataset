# josepabloucr/tifinagh-ocr-plantilles

## Resumen

`tifinagh-ocr-plantilles` es un lector OCR para texto en tifinag (neotifinag, repertorio Unicode del IRCAM) publicado por el usuario josepabloucr. No es un modelo neuronal: es una herramienta de visión por computador implementada en Python sobre NumPy, SciPy y Pillow que segmenta una línea de texto y clasifica cada glifo mediante *template matching* contra una fuente Tifinaghe del IRCAM que el propio usuario debe descargar. No hay pesos entrenados ni parámetros que ajustar; las plantillas se renderizan en tiempo de ejecución a partir del fichero `.ttf`.

La relevancia del proyecto es su nicho: el tifinag es una escritura con escasa cobertura en herramientas OCR comerciales y en modelos multimodales, y esta librería ofrece una vía ligera (sin GPU, sin dependencias pesadas) para digitalizar subtítulos o rótulos que usen la tipografía oficial del IRCAM. Está construido dentro del proyecto comunitario *tachelhit-drills*, orientado a la documentación y aprendizaje del tachelhit.

La herramienta está fuertemente especializada: asume una geometría fija de una línea de subtítulo en un fotograma de 1080p (o 720p reescalado), letras blancas con contorno oscuro sobre fondo variable, y no reconoce dígitos ni escritura manuscrita ni tipografías distintas de la familia IRCAM. La licencia del código es MIT, pero la fuente que necesita no se redistribuye y mantiene la licencia del IRCAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No neuronal: segmentación por componentes conexos + clasificación por template matching (IoU) sobre glifos renderizados de una fuente TTF |
| Parámetros totales | No aplica (no hay pesos entrenados) |
| Parámetros activos | No aplica |
| Longitud de contexto | No aplica (procesa una línea de texto por llamada) |
| Tipos de cuantización | No aplica |
| Idiomas soportados | zgh (tamazight estándar), shi (tachelhit), kab (cabilio), ca (catalán), en (inglés) — según los metadatos del repositorio; el reconocimiento es de escritura tifinag, no de idioma |
| Licencia | MIT para el código; la fuente Tifinaghe del IRCAM no se redistribuye y conserva su propia licencia |
| Formato de pesos | No aplica (código Python; las plantillas se generan en tiempo de ejecución desde `Tifinaghe-Ircam_Unicode.ttf`) |

## Arquitectura y entrenamiento

No existe entrenamiento. El pipeline tiene cuatro etapas deterministas: (1) construcción de una máscara de "letra" que exige que el píxel sea blanco y esté flanqueado por bordes oscuros a menos de 5 px en alguna de cuatro direcciones, lo que descarta fondos claros con borde en un solo lado; (2) segmentación por componentes conexos con fusión geométrica de piezas que pertenecen a un mismo signo (ⵓ, ⴻ, signos de interrogación, anillo y punto de ⵙ), corte de glifos pegados mediante un límite de anchura de aproximadamente 1,2 veces la altura del cuerpo y umbral local para fondos irregulares; (3) clasificación comparando cada máscara de glifo con todas las plantillas de la fuente IRCAM, alineadas a la misma altura absoluta (±2 px) y centradas horizontalmente (±2 px), con trazo de plantilla a 0 y 1 px, puntuando por IoU; (4) reconstrucción del texto, con un carácter por glifo, espacios a partir de los huecos entre cajas y distinción entre coma y punto por descenso bajo la línea base.

Cada glifo devuelve una confianza calculada como `min(1, IoU / 0.75)`, que el autor advierte explícitamente que no es una probabilidad. La geometría está codificada en constantes: banda de 1080p en las filas 870-921 del fotograma, cuerpo de texto en las filas 884-911 (27-28 px de altura), texto centrado en x = 964; se acepta una banda de 720p reescalándola por 1,5. Cualquier otra disposición requiere editar `tifinagh_ocr/segmenta.py`.

## Capacidades

- Reconocimiento de una línea de texto en tifinag (repertorio Unicode del IRCAM) a partir de una imagen RGB de banda de subtítulo.
- Segmentación de glifos con manejo de signos compuestos, glifos pegados y glifos partidos por huecos.
- Devolución de metadatos por glifo: etiqueta, caja delimitadora `[x0, y0, x1, y1]` y confianza.
- API de una llamada (`llegeix_linia`) y API por lotes (`llegeix_bandes`) que devuelve por banda `tifinag`, `glifs`, `n_glifs`, `n_dubtosos`, `conf_mitjana` y `conf_min`; un glifo se marca como dudoso si su confianza baja de 0,85.
- Distinción de espacios y de coma frente a punto.
- Sin soporte de dígitos, manuscrito, tipografías ajenas a IRCAM ni disposiciones distintas de la geometría fija.
- Sin tool calling, sin capacidades de agente, sin multimodalidad más allá de la lectura de imagen y sin generación de texto libre.

## Casos de uso

- Digitalización de subtítulos de televisión en tifinag: el caso de uso original del autor; la herramienta está calibrada para bandas de subtítulo de 1080p con tipografía IRCAM y letras blancas con contorno oscuro, que es exactamente el formato de emisión que midió en sus pruebas internas.
- Archivado y búsqueda de material audiovisual en tamazight: extraer el texto de cada banda permite indexar subtítulos y hacer búsqueda por texto sobre vídeo sin transcripción manual.
- Corpus lingüísticos para tachelhit y otras variedades: al devolver texto plano por línea, se puede volcar a un corpus alineado con marcas de tiempo para investigación lingüística.
- Herramientas de aprendizaje de tifinag: integrada en la plataforma *tachelhit-drills*, puede corregir ejercicios o convertir material gráfico en texto editable para fichas de práctica.
- Preprocesado para pipelines de OCR mayores: como segmentador y lector de alta precisión en su dominio restringido, puede servir de primera etapa antes de un modelo neuronal o como generador de pseudoetiquetas para entrenar uno.
- Verificación de calidad de emisión: el campo de confianza y el contador `n_dubtosos` permiten detectar fotogramas con subtítulos mal renderizados o con tipografía incorrecta en un control automatizado de playout.
- Extracción de rótulos en señalética o cartelería institucional que use la fuente oficial del IRCAM, siempre que se recorte la banda a la geometría esperada o se ajusten las constantes.

## Benchmarks y rendimiento

| Medición | Resultado |
|---|---|
| 100 líneas sintéticas aleatorias (2.371 caracteres, semilla 1), dibujadas con la propia fuente | CER 0,0000; 100/100 líneas exactas |
| Subtítulos reales de televisión con fuente IRCAM (prueba interna, dos muestras reservadas de 50 y 100 líneas) | CER aproximado del 0,1-0,2 % |
| Conjunto usado para ajustar umbrales (prueba interna) | CER aproximado del 0,5 % |

El propio autor advierte que la medición sintética es una cota superior, porque el lector ve las mismas formas con las que fue construido más ruido y contorno, y que los datos de subtítulos reales no están publicados. No hay comparación con otros sistemas OCR en la información disponible.

## Requisitos de hardware

- No requiere GPU: la inferencia es CPU pura sobre NumPy y SciPy.
- Dependencias: `numpy`, `scipy`, `Pillow`; `pytest` solo para los tests.
- Memoria: del orden de una imagen de banda por llamada (51 px de alto por el ancho del fotograma); sin pesos que cargar en VRAM.
- Despliegue: clonación del repositorio de Hugging Face e importación como módulo Python (`import tifinagh_ocr as T`); no aplica vLLM, llama.cpp, Ollama ni TGI.
- Requisito externo: descargar `Tifinaghe-Ircam_Unicode.ttf` desde el sitio del IRCAM y apuntar a él con `T.set_font(...)` o la variable de entorno `TIFINAGH_FONT`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Sistema | Tipo | Entrenamiento | Idiomas/escritura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tifinagh-ocr-plantilles | Template matching clásico | Ninguno | Tifinag (IRCAM) | MIT (código); fuente con licencia IRCAM aparte | Hugging Face |
| Tesseract | OCR clásico con LSTM | Sí, sobre corpus etiquetados | Multitud de idiomas; cobertura de tifinag no disponible | Apache 2.0 | Ampliamente disponible |
| Modelos OCR multimodales tipo TrOCR o Donut | Transformer visión-texto | Sí, a gran escala | Depende del modelo; tifinag no disponible | Variable | Hugging Face |
| Modelos VLM generalistas (p. ej. familia Qwen-VL) | Transformer multimodal | Sí | Multilingüe; rendimiento en tifinag no disponible | Variable | Hugging Face |

No se dispone de datos de rendimiento de estos sistemas sobre tifinag en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es una red neuronal ni un OCR de propósito general: no lee manuscrito, ni texto impreso sobre fondos arbitrarios, ni tipografías arbitrarias.
- La fuente debe pertenecer a la familia Tifinaghe del IRCAM (`Tifinaghe-Ircam_Unicode.ttf`); otra tipografía produce lecturas erróneas.
- La geometría está fijada por constantes: una línea, banda de 1080p en las filas 870-921 (cuerpo 884-911, 27-28 px), texto centrado en x = 964; 720p se acepta reescalado por 1,5. Otras disposiciones exigen modificar `segmenta.py`.
- No reconoce dígitos: la fuente IRCAM no los incluye y el lector no los adivina; un dígito en la imagen se descarta o se lee como letra.
- La confianza devuelta es `min(1, IoU / 0.75)` y no una probabilidad calibrada; el umbral de 0,85 para marcar glifos dudosos es heurístico.
- Las mediciones de CER sobre subtítulos reales son internas y no publicadas; no deben tratarse como reproducibles.
- La fuente no se redistribuye y su licencia es del IRCAM: hay que descargarla por separado y respetar sus términos, lo que puede afectar al uso comercial del sistema completo.
- No hay evidencia publicada sobre sesgos, alucinación (no genera texto libre, pero sí puede producir lecturas incorrectas) ni comportamiento fuera del dominio de subtítulos IRCAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josepabloucr/tifinagh-ocr-plantilles
- IRCAM (Institut Royal de la Culture Amazighe), descarga de fuentes tifinag: https://www.ircam.ma
- Proyecto *tachelhit-drills*: no disponible como enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
