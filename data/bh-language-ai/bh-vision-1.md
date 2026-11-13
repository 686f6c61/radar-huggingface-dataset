# BH-Language-AI/bh-vision-1

## Resumen

BH-Vision-1 es un proyecto de modelo multimodal image-text-to-text orientado al bosnio y a las lenguas de los Balcanes, publicado por el colectivo BH-Language-AI. La model card es explícita al respecto: el modelo **no está entrenado** y **no existen pesos publicados**. Se trata de una tarjeta de proyecto que documenta la intención de construir un sistema de visión y OCR para bosnio, con publicación de pesos condicionada a un entrenamiento aprobado y a una evaluación verificada.

El repositorio declara el pipeline `image-text-to-text` y la etiqueta `ocr`, lo que sitúa el objetivo en tareas de lectura de documentos, extracción de texto en imágenes y comprensión visual con salida textual. La arquitectura base aún no está decidida: la model card menciona SmolVLM2, Idefics3 y Pixtral como candidatos en evaluación. Por tanto, no hay parámetros, contexto ni datos de entrenamiento que reportar.

Su relevancia actual es la de una iniciativa de cobertura lingüística: el bosnio y las variedades del diasistema serbocroata están infrarrepresentados en los modelos multimodales, y este proyecto aspira a cubrir OCR y comprensión de documentos en ese ámbito. Cualquier uso en producción es hoy imposible, porque no hay artefactos descargables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (candidatos en evaluación: SmolVLM2, Idefics3, Pixtral) |
| Parámetros totales | no disponible (pesos no publicados) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | bosnio (bs) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no hay pesos publicados) |

## Arquitectura y entrenamiento

No hay arquitectura definida. La model card indica que la base se elegirá entre SmolVLM2, Idefics3 y Pixtral, y que dicha evaluación sigue en curso. No se especifica si el modelo final será un VLM denso con encoder visual tipo SigLIP o un diseño con atención sobre parches de imagen, ni se detalla la resolución de entrada, el tokenizador visual o el esquema de fusión multimodal.

Tampoco hay información sobre datos de entrenamiento: no se declara el número de tokens, la composición del corpus (pares imagen-texto, documentos escaneados, pares OCR), ni si habrá etapas de ajuste supervisado, preferencias o RLHF. La model card establece un requisito de gobernanza: los pesos se publicarán solo tras un entrenamiento aprobado y una evaluación verificada, con el esquema de nombres `bh-vision-{generación}`, coherente con el de su línea BH-Decision.

## Capacidades

- No hay capacidades verificables, porque el modelo no está entrenado ni publicado.
- El pipeline declarado es `image-text-to-text`, lo que apunta a generación de texto condicionada por imagen.
- La etiqueta `ocr` sugiere el objetivo de reconocimiento óptico de caracteres sobre documentos en bosnio.
- El alcance previsto incluye imágenes, documentos, OCR y vídeo, según la descripción del repositorio.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo se declara bosnio; no se documenta cobertura de otras lenguas del entorno (croata, serbio, montenegrino).
- Modos especiales (thinking, audio, visión): visión prevista; el resto, no disponible.

## Casos de uso

Ninguno de los siguientes casos es ejecutable hoy; se enumeran como escenarios objetivo que el proyecto declara o que se derivan del pipeline y las etiquetas publicadas.

- Digitalización de documentos administrativos bosnios: extracción de texto de formularios, certificados y expedientes escaneados mediante el pipeline `image-text-to-text` con etiqueta OCR. Requiere pesos publicados, que no existen.
- Procesamiento de archivos históricos y prensa: lectura de digitalizaciones con tipografía degradada, un caso habitual en corpus de los Balcanes donde los OCR comerciales tienen cobertura limitada.
- Atención al ciudadano con entrada visual: interpretación de capturas o fotos de documentos enviadas por el usuario y respuesta textual en bosnio.
- Accesibilidad: descripción de imágenes y lectura en voz alta de contenido visual para hablantes de bosnio, una vez exista un modelo evaluado.
- Extracción estructurada en pipelines documentales: conversión de facturas o contratos a campos tabulares, si el modelo final soporta salidas estructuradas (no confirmado).
- Análisis de vídeo con subtitulado o descripción: el repositorio menciona vídeo como ámbito, aunque no se detalla el soporte temporal ni el muestreo de fotogramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen pesos, por lo que no hay métricas de OCR (CER/WER), MMMU, DocVQA ni ninguna otra evaluación reproducible.

## Requisitos de hardware

- VRAM estimada: no disponible, al no existir pesos ni arquitectura confirmada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; ninguna es aplicable sin pesos publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación se establece con los candidatos que la propia model card menciona como posibles bases, no con el modelo final, que aún no existe.

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| BH-Vision-1 | no disponible | no disponible | Apache 2.0 | Tarjeta de proyecto, sin pesos |
| SmolVLM2 | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Candidato de base en evaluación |
| Idefics3 | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Candidato de base en evaluación |
| Pixtral | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Candidato de base en evaluación |

No se dispone de datos de parámetros, contexto ni rendimiento de los candidatos en la información facilitada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo no está entrenado y no tiene pesos: no es descargable ni ejecutable. Cualquier integración que apunte a este repositorio fallará.
- La licencia Apache 2.0 se declara sobre un repositorio sin artefactos; su aplicabilidad al modelo futuro no está garantizada y podría cambiar en la publicación de pesos.
- Cobertura lingüística restringida al bosnio; no se documenta el tratamiento de variantes croata, serbia o montenegrina, lo que puede generar degradación en texto mixto o con caracteres latinos y cirílicos combinados.
- Riesgo de alucinación en OCR: no evaluable, pero es un riesgo estructural de los VLM que generan texto libre en lugar de transcribir de forma restringida.
- Sin evaluación publicada ni protocolo de verificación descrito, más allá de la promesa de una "evaluación verificada" previa a la publicación.
- Sesgos: no documentados.
- Para producción: no apto en ningún escenario hasta que se publiquen pesos y resultados.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bh-vision-1
- Colección BH-Vision: no disponible (mencionada en la model card sin URL)
- Paper, blog o demo: no disponible
