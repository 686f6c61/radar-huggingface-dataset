# nakamura196/ndl-koten-ocr-web-models

## Resumen

`ndl-koten-ocr-web-models` es un repositorio de artefactos de inferencia para OCR de textos japoneses premodernos (kuzushiji y kanji clásicos), empaquetados en formato ONNX para ejecutarse directamente en el navegador mediante `onnxruntime-web`. No se trata de un modelo de lenguaje generativo, sino de un pipeline de dos etapas: un detector de regiones de texto basado en RTMDet-s y un reconocedor de secuencias basado en PARSeq. El autor, nakamura196, publica aquí los ficheros exactos del paquete npm `@nakamura196/ndl-koten-ocr-web` 1.0.7, sin modificaciones, para que puedan cargarse por URL desde aplicaciones web.

El origen técnico es NDL古典籍OCR-Lite (NDLKotenOCR-Lite), desarrollado por el laboratorio de la Biblioteca Nacional de la Dieta de Japón (ndl-lab) bajo licencia CC BY 4.0. La adaptación al navegador corre a cargo de yuta1984/ndlkotenocr-lite-web. El repositorio actúa como CDN estático de los pesos, con un tamaño total de 0,1 GB, lo que lo hace viable para descarga en cliente sin infraestructura de servidor GPU.

La relevancia actual radica en la digitalización de fondos documentales japoneses históricos: permite OCR en el propio navegador del investigador, sin enviar imágenes a servidores externos, lo que simplifica el cumplimiento de licencias y reduce costes de infraestructura. La aplicación de referencia es TEI/IIIF Editor (tei-editor.ldas.jp), orientada a la transcripción y anotación de materiales digitalizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector RTMDet-s (1280x1280) + reconocedor PARSeq (32x384, tiny, 10) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo OCR, no generativo) |
| Tipos de cuantización | no disponible (pesos ONNX publicados sin especificar precisión) |
| Idiomas soportados | Japonés (kanji clásico y kuzushiji); no se declaran otros idiomas |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`rtmdet-s-1280x1280.onnx`, `parseq-ndl-32x384-tiny-10.onnx`) + YAML de configuración (`ndl.yaml`, `NDLmoji.yaml`) |

## Arquitectura y entrenamiento

El pipeline consta de dos modelos independientes. El primero, `rtmdet-s-1280x1280.onnx`, es un detector de objetos de la familia RTMDet en su variante small, con entrada de 1280x1280 píxeles, encargado de localizar regiones de texto (columnas, líneas o bloques) en la imagen del documento. El segundo, `parseq-ndl-32x384-tiny-10.onnx`, es un reconocedor de secuencias PARSeq con entrada de 32x384 píxeles, variante tiny y profundidad 10, que transcribe cada región recortada a caracteres japoneses. Los ficheros YAML (`ndl.yaml` y `NDLmoji.yaml`) contienen la configuración del pipeline y el vocabulario de caracteres (NDLmoji), respectivamente.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de aumento de datos o ajuste fino específico. La model card del repositorio no documenta el proceso de entrenamiento; esta información correspondería al proyecto original NDLKotenOCR-Lite. La innovación principal del repositorio no es arquitectónica sino de despliegue: la exportación a ONNX y la publicación como ficheros estáticos accesibles por URL permiten ejecutar el pipeline completo en el navegador con `onnxruntime-web`, sin backend.

## Capacidades

- Detección de regiones de texto en imágenes de documentos japoneses premodernos (kuzushiji, kanji clásico, disposición vertical).
- Reconocimiento óptico de caracteres (OCR) sobre las regiones detectadas, con salida de texto en japonés clásico.
- Ejecución íntegra en el navegador del cliente mediante ONNX Runtime Web (WASM/WebGL), sin envío de imágenes a servidores.
- Carga directa de pesos por URL desde Hugging Face (`resolve/main/<file>`).
- Integración con aplicaciones de transcripción y anotación (TEI/IIIF Editor).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No soporta visión general, audio ni generación de texto libre.
- Capacidad multilingüe limitada al japonés; no se declaran otros idiomas.

## Casos de uso

- Digitalización de fondos de bibliotecas y archivos: procesar lotes de imágenes de manuscritos japoneses premodernos para obtener transcripciones preliminares que los catalogadores revisan y corrigen manualmente.
- Edición académica con TEI/IIIF: integrar el pipeline en el editor TEI/IIIF para que el investigador obtenga una transcripción OCR alineada con las anotaciones IIIF de la imagen, acelerando la codificación de textos.
- OCR en el navegador con privacidad de datos: instituciones que no pueden enviar imágenes a servicios en la nube por restricciones de licencia o derechos pueden ejecutar el modelo localmente en el equipo del usuario.
- Herramientas de investigación para filología japonesa: búsqueda de términos en corpus de kuzushiji sin transcripción previa, generando índices a partir de OCR aproximado.
- Aplicaciones educativas: permitir a estudiantes de paleografía japonesa practicar la lectura de documentos históricos con asistencia OCR inmediata en el navegador.
- Prototipado rápido sin infraestructura: desarrolladores que quieran validar un flujo de OCR japonés clásico pueden cargar los ONNX desde el CDN de Hugging Face sin montar servidores GPU ni instalar dependencias pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ejecutarse en el navegador con `onnxruntime-web`, el requisito es un navegador moderno con soporte de WebAssembly y, opcionalmente, WebGL/WebGPU para aceleración.
- VRAM estimada: no disponible; al ser inferencia en cliente, depende del backend de ejecución (WASM usa memoria del sistema; WebGL/WebGPU usa la GPU del usuario).
- GPU recomendadas: no aplica en servidor; en cliente, cualquier GPU integrada o dedicada con soporte WebGL/WebGPU puede acelerar la inferencia.
- Cabe en GPU de consumo: sí, al ejecutarse en el navegador del usuario; no requiere GPU de servidor.
- Opciones de despliegue: `onnxruntime-web` (WASM/WebGL/WebGPU) en navegador; los ficheros ONNX también pueden ejecutarse con ONNX Runtime nativo en servidor si se prefiere.
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamaño del repositorio: 0,1 GB, adecuado para descarga en cliente.

## Comparativa con modelos similares

| Modelo | Tipo | Arquitectura | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| ndl-koten-ocr-web-models (este) | OCR japonés clásico | RTMDet-s + PARSeq tiny | Japonés (kuzushiji) | CC BY 4.0 | ONNX, navegador |
| NDLKotenOCR-Lite (ndl-lab) | OCR japonés clásico | Pipeline original (referencia) | Japonés (kuzushiji) | CC BY 4.0 | Python, servidor |
| ndlkotenocr-lite-web (yuta1984) | OCR japonés clásico | Port a navegador del anterior | Japonés (kuzushiji) | CC BY 4.0 | Web |
| Manga OCR | OCR japonés moderno | Detector + reconocedor | Japonés moderno | no disponible | Python |

Los tres primeros comparten el mismo origen (NDLKotenOCR-Lite); la diferencia está en el empaquetado y el canal de distribución. Manga OCR se orienta a texto japonés moderno y no está optimizado para kuzushiji, por lo que la comparación directa de rendimiento no está disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona y no soporta instrucciones conversacionales.
- Especializado en japonés premoderno (kuzushiji y kanji clásico); su rendimiento en japonés moderno o en otros idiomas no está documentado.
- No se han publicado métricas de precisión (CER/WER) en la información disponible; la calidad real del OCR no puede evaluarse a partir de la model card.
- La licencia CC BY 4.0 exige atribución al autor original (NDL) y a los adaptadores; es compatible con uso comercial siempre que se cumpla la atribución.
- Al ejecutarse en navegador, el rendimiento depende del hardware del cliente y del backend de ONNX Runtime Web; en equipos modestos la latencia puede ser alta.
- Riesgo de errores en caracteres raros o degradados: los modelos OCR siempre presentan tasas de error que requieren revisión humana en contextos académicos.
- No se documentan sesgos específicos, pero el corpus de entrenamiento (fondos de la NDL) puede infrarepresentar variantes regionales o caligráficas.
- Los ficheros se publican sin modificaciones respecto al paquete npm 1.0.7; cualquier actualización del pipeline original no se refleja automáticamente aquí.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nakamura196/ndl-koten-ocr-web-models
- Paquete npm: https://www.npmjs.com/package/@nakamura196/ndl-koten-ocr-web
- Proyecto original NDLKotenOCR-Lite: https://github.com/ndl-lab/ndlkotenocr-lite
- Port a navegador: https://github.com/yuta1984/ndlkotenocr-lite-web
- Aplicación TEI/IIIF Editor: https://tei-editor.ldas.jp
