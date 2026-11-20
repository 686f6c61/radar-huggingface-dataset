# OpenGlyph/OpenGlyph-OCR-IDS

## Resumen

OpenGlyph-OCR-IDS es un modelo de reconocimiento óptico de caracteres (OCR) especializado en texto chino impreso de obras de paleografía y filología china, desarrollado por OpenGlyph como un ajuste fino (finetune) sobre OpenGlyph-OCR-0. Su particularidad es que no se limita a transcribir caracteres con punto de código Unicode asignado: cuando un carácter carece de codificación y tampoco está recogido en GlyphWiki, el modelo lo representa mediante una secuencia de descripción ideográfica (IDS, *Ideographic Description Sequence*), una notación con operadores estructurales Unicode que describe cómo se componen los componentes de un carácter (por ejemplo, `⿰亻木` para "休"). Además, recompone los caracteres raros detectados a partir de sus componentes para verificar y corregir la lectura.

El modelo se distribuye exclusivamente en formato MLX (Apple Silicon) y su pipeline es image-text-to-text: recibe una imagen de una línea de texto horizontal y devuelve la transcripción. Está entrenado y evaluado sobre líneas impresas en publicaciones académicas (cuerpo de texto y notas al pie), no sobre materiales originales como huesos oraculares, bronces o manuscritos en seda, y tampoco procesa páginas completas: requiere un paso previo de segmentación en líneas.

La relevancia actual del modelo radica en un problema concreto de la investigación sinológica y paleográfica: la transcripción digital de publicaciones que contienen caracteres raros, variantes locales (隶定字) y glifos sin codificar. Los resultados publicados muestran mejoras sustanciales frente a su predecesor y frente al modelo base Xiaomi-OCR-0 en precisión de línea completa y tasa de error de carácter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; pesos base en 16 bits) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos base en FP16; no se documentan cuantizaciones) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX; tamano del repo 2,8 GB) |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo base OpenGlyph-OCR-0 (tipo de transformer, numero de parametros, composicion del dataset ni volumen de tokens de entrenamiento). Lo que si se documenta es el diseno funcional del sistema: la inferencia de una linea pone en juego cuatro conjuntos de pesos que actuan de forma coordinada, y el proceso incluye un paso de segmentacion del caracter en componentes a partir de la imagen antes de la lectura. El modelo base esta en 16 bits en punto flotante.

El ajuste fino anade dos capacidades sobre OpenGlyph-OCR-0: (1) la emision de IDS para caracteres sin punto de codigo y no recogidos en GlyphWiki, y (2) una relectura por componentes ("speller") que reconstruye el caracter raro como IDS a partir de la imagen; si el IDS resultante corresponde a un caracter con punto de codigo y la confianza es suficiente, se sustituye por dicho caracter. El modelo puede ademas devolver una segunda opcion de lectura con su procedencia (lector, corrector o segunda eleccion del lector) y una puntuacion de ventaja basada en logits. No se documentan detalles de RLHF, DPO ni composicion del corpus de entrenamiento.

## Capacidades

- Transcripcion de lineas horizontales impresas de texto chino, incluyendo cuerpo de texto y notas al pie.
- Reconocimiento de caracteres de la zona de extension (bloques A a J) y de caracteres raros de la zona basica.
- Emision de glifos sin punto de codigo recogidos en GlyphWiki con la notacion `<gw:nombre_del_glifo>`.
- Emision de caracteres sin codigo ni entrada en GlyphWiki mediante IDS envuelto en etiquetas `<ids>...</ids>`.
- Relectura por componentes de caracteres raros con sustitucion por el caracter codificado cuando la confianza es suficiente.
- Salida de segunda opcion de lectura (`options=True`) con metadatos: posicion en el texto, lectura alternativa, origen de la alternativa y ventaja en logits.
- Funcion auxiliar `atoms()` para descomponer la salida en tokens tipados (texto, glifo, IDS).
- No soporta vision general, audio, tool calling ni razonamiento multi-paso; es un OCR especializado de un solo idioma.

## Casos de uso

- Digitalizacion de publicaciones de paleografia y filologia china: el modelo transcribe lineas de articulos y libros academicos con caracteres raros y variantes, un escenario donde los OCR genericos fallan sistematicamente en las zonas de extension.
- Creacion de corpus de investigacion con caracteres sin codificar: gracias a la salida IDS, es posible indexar y buscar caracteres que no existen en Unicode, manteniendo una representacion estructural recuperable.
- Revision asistida de transcripciones academicas: la segunda opcion de lectura permite a un editor humano revisar unicamente los puntos donde el modelo tiene dudas, con la ventaja en logits como criterio de priorizacion.
- Edicion critica de textos chinos antiguos a partir de ediciones impresas modernas: el modelo cubre caracteres de la zona de extension que OpenGlyph-OCR-0 y Xiaomi-OCR-0 no reconocian (21/31 frente a 13/31 y 0/31 en lineas completas de articulos).
- Catalogacion de glifos y estudio de variantes: la combinacion de `<gw:...>` e IDS permite mapear cada aparicion a un glifo de GlyphWiki o a una estructura de componentes, util para estudios de variacion grafica.
- Procesamiento por lotes en estaciones de trabajo Apple Silicon: al estar implementado en MLX, puede ejecutarse localmente en Macs con chip Apple sin depender de GPUs NVIDIA ni de servicios en la nube.
- Extraccion de citas y concordancias de corpus impresos: la salida estructurada por lineas en JSON facilita la integracion en pipelines de mineria de texto academico.

## Benchmarks y rendimiento

Los datos proceden de la model card y fueron medidos en noviembre de 2026 con estos pesos en MLX. "Original" se refiere a Xiaomi-OCR-0 con su propio prompt. Una linea o segmento cuenta como correcto solo si coincide exactamente (sin contar espacios; ancho completo y medio equivalentes). La tasa de error de caracter es la distancia de edicion dividida por el numero de caracteres de la respuesta (un glifo cuenta como un caracter).

| Prueba | Metrica | Xiaomi-OCR-0 | OpenGlyph-OCR-0 | OpenGlyph-OCR-IDS |
|---|---|---|---|---|
| Articulos, lineas completas (398) | Linea exacta | 272 (68,3 %) | 332 (83,4 %) | 347 (87,2 %) |
| Articulos, lineas completas (398) | Tasa de error de caracter | 3,71 % | 0,90 % | 0,70 % |
| Articulos, fragmentos con caracteres dificiles (313) | Segmento exacto | 225 (71,9 %) | 252 (80,5 %) | 276 (88,2 %) |
| Articulos, fragmentos con caracteres dificiles (313) | Tasa de error de caracter | 5,14 % | 2,89 % | 1,88 % |
| Paginas escaneadas de un libro (93 lineas) | Linea exacta | 54 (58,1 %) | 69 (74,2 %) | 75 (80,6 %) |
| Paginas escaneadas de un libro (93 lineas) | Tasa de error de caracter | 2,20 % | 1,12 % | 0,83 % |

Desglose por tipo de caracter:

| Prueba | Categoria | Xiaomi-OCR-0 | OpenGlyph-OCR-0 | OpenGlyph-OCR-IDS |
|---|---|---|---|---|
| Fragmentos con dificiles (313) | Raros de zona basica | 298/354 | 318/354 | 339/354 |
| Fragmentos con dificiles (313) | Caracteres de extension | 0/33 | 11/33 | 21/33 |
| Paginas de libro (93) | Caracteres de extension | 0/13 | 3/13 | 12/13 |
| Lineas completas (398) | Raros de zona basica | 326/402 | 355/402 | 370/402 |
| Lineas completas (398) | Caracteres de extension | 0/31 | 13/31 | 21/31 |
| Prueba sintetica (300 lineas) | Raros de zona basica | 121/300 | 73/300 | 256/300 |
| Prueba sintetica (300 lineas) | Caracteres de extension | 0/300 | 151/300 | 221/300 |

Rendimiento en la emision de IDS (prueba sintetica de 300 lineas con un caracter que solo puede escribirse como IDS):

| Tipo de caracter IDS | OpenGlyph-OCR-0 | OpenGlyph-OCR-IDS |
|---|---|---|
| Dos componentes (izq.-der. o sup.-inf.) | 0/195 | 109/195 (55,9 %) |
| Estructura envolvente | 0/29 | 8/29 (27,6 %) |
| Tres componentes | 0/22 | 7/22 (31,8 %) |
| Anidado (componentes a su vez compuestos) | 0/54 | 2/54 (3,7 %) |
| Con componente nunca visto en entrenamiento | 0/52 | 18/52 (34,6 %) |
| Total | 0/300 | 126/300 (42,0 %) |

Segunda opcion de lectura: sobre 313 fragmentos de articulos, la lectura correcta de caracteres raros con la primera opcion es del 93,0 % y sube al 94,8 % considerando la segunda; se emiten 0,54 segundas opciones por segmento de media. En la prueba sintetica, de los 126 IDS correctos, 116 coinciden exactamente con la respuesta y 10 usan una notacion equivalente que dibuja el mismo caracter.

## Requisitos de hardware

- Inferencia exclusivamente en MLX, es decir, Apple Silicon (Mac con chip M1/M2/M3/M4 y posteriores). No hay version PyTorch de este modelo; solo OpenGlyph-OCR-0 dispone de version `transformers`.
- Tamano del repositorio: 2,8 GB. Los pesos base estan en 16 bits en punto flotante.
- La inferencia de una linea requiere cuatro conjuntos de pesos en secuencia y un paso de segmentacion en componentes, por lo que el coste por linea es mayor que el de un OCR de un solo pase.
- No se documentan requisitos de VRAM ni de memoria unificada minimos, ni latencia o throughput medidos.
- Despliegue mediante el paquete propio `openglyph_ocr_ids` (`python -m openglyph_ocr_ids`) o la API `load()` / `read_line()` / `atoms()`.
- Versiones fijadas en `requirements.txt`: mlx 0.32.3, mlx-vlm 0.3.12, transformers 5.18.0, tokenizers 0.23.2. torch y torchvision se usan solo para el preprocesado de imagen; versiones distintas pueden alterar los resultados numericos.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenGlyph-OCR-IDS | no disponible | no disponible | OCR de lineas chinas con IDS y glifos GlyphWiki; solo MLX | Apache 2.0 | Hugging Face, MLX |
| OpenGlyph-OCR-0 | no disponible | no disponible | OCR de lineas chinas con glifos GlyphWiki; sin IDS | no disponible | Hugging Face, MLX y `transformers` |
| Xiaomi-OCR-0 | no disponible | no disponible | OCR chino de referencia usado como linea base | no disponible | no disponible |

En las pruebas de la model card, OpenGlyph-OCR-IDS supera a OpenGlyph-OCR-0 en lineas exactas de articulos (87,2 % frente a 83,4 %) y en fragmentos con caracteres dificiles (88,2 % frente a 80,5 %), y a Xiaomi-OCR-0 en todas las metricas. En la prueba sintetica de caracteres raros de zona basica, OpenGlyph-OCR-0 obtiene un resultado inferior a Xiaomi-OCR-0 (73/300 frente a 121/300), mientras que OpenGlyph-OCR-IDS alcanza 256/300. No se dispone de comparacion con otros OCR multimodales genericos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo transcribe lineas horizontales ya segmentadas; no procesa paginas completas. Las imagenes mas altas que anchas se tratan como verticales, se desactiva el modo IDS y se leen solo con el comportamiento de OpenGlyph-OCR-0.
- No esta disenado para materiales originales (huesos oraculares, bronces, seda, tablillas) ni para manuscritos; solo para caracteres impresos en publicaciones academicas.
- No se han probado texto vertical ni escritura manual.
- Unico idioma soportado: chino.
- La emision de IDS tiene una tasa de acierto limitada: 42,0 % en la prueba sintetica, con solo 3,7 % en estructuras anidadas. Los caracteres con componentes nunca vistos en entrenamiento alcanzan un 34,6 %.
- La sustitucion de IDS por caracteres codificados depende de `canon.json`; si el IDS no se encuentra alli, se mantiene la notacion estructural.
- La salida incluye etiquetas `<gw:...>` e `<ids>...</ids>` que requieren un postprocesado para obtener texto plano.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan evaluaciones de sesgo, robustez ante dominios distintos ni tasas de alucinacion fuera de las pruebas descritas.
- La dependencia exclusiva de MLX limita el despliegue a hardware Apple Silicon y a las versiones exactas de librerias indicadas; no hay garantia de reproducibilidad con otras versiones.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue publicado el 20 de noviembre de 2026; se trata de un artefacto muy reciente y poco validado por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/OpenGlyph/OpenGlyph-OCR-IDS
- Modelo base: https://huggingface.co/OpenGlyph/OpenGlyph-OCR-0
- GlyphWiki (consulta de glifos por nombre): https://glyphwiki.org/wiki/
