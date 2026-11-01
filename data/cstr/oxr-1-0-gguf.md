# cstr/OXR-1.0-GGUF

## Resumen

OXR-1.0 es un modelo de visión-lenguaje especializado en OCR y análisis de documentos, desarrollado por SoMark Team y publicado originalmente como `SoMarkAI/OXR-1.0`. Esta ficha describe la conversión a formato GGUF realizada por el proyecto CrispEmbed (usuario `cstr`), que adapta los pesos originales para su runtime nativo ggml, sin reentrenar ni modificar los pesos. El modelo resuelve el problema del parseo de documentos completos: extracción de texto, tablas, fórmulas y estructura de layout a partir de imágenes de páginas.

La arquitectura combina un codificador visual SigLIP2 con un decodificador de lenguaje basado en Qwen3, dando lugar a un modelo de aproximadamente 1.534 millones de parámetros totales. El pipeline declarado es `image-text-to-text`, orientado a la transcripción estructurada de documentos. El repositorio GGUF ocupa 4,4 GB e incluye una única variante en precisión F16.

La relevancia de esta publicación es doble: por un lado, ofrece una vía de ejecución en CPU mediante el runtime ggml de CrispEmbed, alternativa a la implementación Python de referencia; por otro, el modelo incorpora una licencia con términos adicionales (OXR License) que restringen el uso comercial por encima de ciertos umbrales de financiación e ingresos, un aspecto crítico para cualquier evaluación de despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje: codificador SigLIP2 + decodificador Qwen3 (según tags del repo) |
| Parámetros totales | 1.534.378.216 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16 (única variante publicada en este repo); el autor indica que existen variantes cuantizadas producidas con `crispembed-quantize`, pero no se listan ficheros adicionales |
| Idiomas soportados | no disponible (los casos de prueba congelados incluyen japonés y alemán) |
| Licencia | OXR License (Apache-2.0 con términos adicionales) |
| Formato de pesos | GGUF (arquitectura `oxr`, nombres de tensores visuales con prefijo `vit.`) |

## Arquitectura y entrenamiento

El modelo original es un sistema de dos torres: un codificador visual SigLIP2 que procesa la imagen de la página y un decodificador de lenguaje basado en Qwen3 que genera la salida estructurada. Los tags del repositorio confirman ambos componentes. El pipeline `image-text-to-text` y la orientación a OCR y parseo de documentos indican un entrenamiento supervisado sobre pares imagen-texto de documentos, aunque no se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La conversión GGUF no altera los pesos: según la declaración de cambios, solo se renombraron tensores, se aplicaron conversiones de tipo y se embebieron metadatos de tokenizador y preprocesado. En la variante F16, las matrices de atención y MLP están en F16, mientras que embeddings, `lm_head`, vocabulario y cabeza visual, tablas de parches y posiciones, y las normas se mantienen en F32. El perfil GGUF emplea nombres cortos de tensores visuales (`vit.`) y declara `general.architecture = oxr`, lo que lo hace incompatible con llama.cpp. Para el parseo de páginas completas se requiere además un detector de layout D-FINE publicado por separado como `cstr/OXR-1.0-DFINE-layout-GGUF`.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, incluyendo texto impreso y estructurado.
- Parseo de documentos completos: extracción de estructura de página mediante el detector de layout D-FINE complementario.
- Transcripción de tablas, con caso de prueba congelado de 261 tokens de salida.
- Reconocimiento de fórmulas matemáticas (caso de prueba `formula`, 22 tokens).
- Procesamiento multilingüe: los casos de validación incluyen documentos en japonés y alemán, además de inglés.
- Transcripción de recibos y documentos administrativos (caso `receipt`, 202 tokens).
- Salida texto-a-texto condicionada por imagen (pipeline `image-text-to-text`).
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de archivos administrativos: el modelo transcribe páginas completas de documentos escaneados, incluyendo recibos y formularios, gracias a su combinación de OCR y detector de layout. Adecuado para pipelines de gestión documental que necesitan texto estructurado a partir de imágenes.
- Extracción de tablas de informes financieros: el caso de prueba congelado de tabla (261 tokens) demuestra la capacidad de reproducir estructuras tabulares. Se usaría para convertir estados de cuenta o informes en datos explotables.
- Procesamiento de documentación técnica con fórmulas: la validación sobre fórmulas matemáticas permite emplearlo en la digitalización de papers y manuales técnicos donde el OCR convencional degrada la notación.
- Atención al cliente con documentación adjunta: integrado en un flujo de soporte, el modelo puede transcribir facturas o contratos enviados por el usuario para que un sistema posterior extraiga los campos relevantes.
- Digitalización multilingüe: los casos de validación en japonés y alemán lo hacen apto para corpus documentales con mezcla de idiomas, aunque no se especifica la cobertura completa de lenguas.
- Ejecución en CPU sin GPU: la variante F16 en formato GGUF con el runtime ggml de CrispEmbed permite desplegar OCR en entornos sin acelerador, a costa de throughput limitado.
- Procesamiento por lotes de archivos históricos: combinado con el detector D-FINE, permite segmentar y transcribir páginas completas de colecciones escaneadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pruebas de paridad numérica frente a la implementación Python de referencia en CPU y decodificación greedy: la variante F16 reproduce exactamente los IDs de token generados en los cinco casos congelados (fórmula, tabla, japonés, recibo y alemán). No se verificaron ejecución en GPU, móvil/WASM ni corpus documentales representativos más allá de esos cinco casos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero F16 ocupa 4.440.553.984 bytes (aproximadamente 4,14 GiB); en GPU se necesitaría al menos esa cantidad más overhead de activaciones y del detector de layout.
- GPU recomendadas: no disponible en la información proporcionada; no se han verificado ejecuciones en GPU.
- Compatibilidad con GPU de consumo: por tamaño del fichero, cabría en GPUs con 8 GB o más de VRAM, pero esta estimación no está confirmada por el autor.
- Opciones de despliegue: exclusivamente el runtime nativo ggml de CrispEmbed, con las variables `CRISPEMBED_OXR=1` y `CRISPEMBED_ACCEPT_OXR_LICENSE=1`. No es cargable por llama.cpp. Para páginas completas se requiere además el detector `cstr/OXR-1.0-DFINE-layout-GGUF`.
- Latencia y throughput: no disponibles. Las pruebas de paridad se realizaron en CPU con decodificación greedy, sin métricas de velocidad publicadas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de OCR o parseo de documentos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia restrictiva: el uso comercial sin licencia específica de SoMark solo se permite si la entidad y sus afiliadas están por debajo de 2.000.000 USD en financiación total y en ingresos anuales.
- Obligación de atribución: cualquier servicio en línea basado en OXR o derivados debe identificar de forma prominente a SoMark OXR.
- Prohibición de API competidora: no se permite ofrecer a terceros una API alojada que compita con los servicios de parseo, OCR o layout de SoMark, sin licencia escrita.
- El incumplimiento de los términos termina automáticamente la licencia.
- Incompatibilidad con llama.cpp: requiere el runtime CrispEmbed y aceptación explícita de la licencia.
- Paridad numérica no estricta: incluso en F32, las diferencias de un ulp en activaciones atípicas del decodificador superan el presupuesto absoluto fijado de 0,002 (peor coseno 0,99999988), aunque los IDs decodificados y el texto son exactos.
- Verificación limitada: no se validó ejecución en GPU, móvil/WASM ni corpus documentales amplios; solo cinco casos congelados.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas OCR es un riesgo relevante en documentos degradados o layouts atípicos.
- Sesgos: no documentados.
- Estado experimental: el soporte de OXR en CrispEmbed se declara explícitamente como experimental.
- Cobertura de idiomas no especificada más allá de los casos de prueba.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cstr/OXR-1.0-GGUF
- Modelo base: https://huggingface.co/SoMarkAI/OXR-1.0
- Revisión del modelo base fijada: https://huggingface.co/SoMarkAI/OXR-1.0/tree/c708407f9d2b4df658f2543d9132b62bb7221df4
- Detector de layout D-FINE: https://huggingface.co/cstr/OXR-1.0-DFINE-layout-GGUF
- Runtime CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
