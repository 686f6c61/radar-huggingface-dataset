# nile-academy/docling-tableformer

## Resumen

`docling-tableformer` es un espejo de pesos publicado por Nile Academy bajo el identificador `nile-academy/docling-tableformer`. No se trata de un modelo entrenado por Nile Academy, sino de una copia congelada (source-pinned mirror) de checkpoints del proyecto Docling, en concreto de los modelos de reconocimiento de estructuras de tablas del repositorio `docling-project/docling-models`. El autor original y titular de los derechos es el equipo de Docling (IBM Research), y Nile Academy únicamente redistribuye los bytes originales para consumidores de su plataforma Wekala.

El modelo está etiquetado como `ocr` y `tableformer`, lo que sitúa su función en la extracción y reconstrucción de la estructura de tablas en documentos digitalizados, una pieza clave en pipelines de conversión de PDF a formatos estructurados. El repositorio pesa aproximadamente 0,2 GB y no incluye código Python, checkpoints en pickle, servidores de inferencia ni código ejecutable: solo checkpoints declarativos y las model cards originales bajo `original/<source-commit>/`.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un artefacto de distribución, no de un modelo con documentación técnica propia. La model card no aporta arquitectura, número de parámetros, longitud de contexto ni datos de entrenamiento, y la propia publicación advierte que la verificación se limita a la identidad inmutable de los ficheros, no a la precisión OCR ni a la fidelidad de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere TableFormer, transformer para estructura de tablas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se mencionan checkpoints Paddle originales y exportaciones ONNX oficiales, sin detallar cuantizaciones) |
| Idiomas soportados | no disponible (la model card declara `language: []`; se menciona preferencia por arabe pero sin garantia de calidad) |
| Licencia | CDLA-Permissive-2.0 AND Apache-2.0 |
| Formato de pesos | checkpoints declarativos originales; exportaciones ONNX oficiales; sin pickle ni codigo Python |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de parametros, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. La model card del espejo no reproduce la informacion tecnica del modelo original; solo conserva las model cards originales bajo `original/<source-commit>/`, que no se han incluido en la informacion proporcionada.

El nombre `docling-tableformer` remite al componente TableFormer del proyecto Docling, orientado a la deteccion de estructura de tablas (filas, columnas, celdas y cabeceras) en documentos. Sin embargo, esta ficha no puede confirmar detalles de arquitectura, atencion, tokenizador ni estrategia de entrenamiento, por lo que cualquier afirmacion al respecto seria especulativa. La publicacion indica que los checkpoints Paddle originales se conservan separados de las exportaciones ONNX oficiales, y que un modelo solo-fuente requiere una conversion y un adaptador cualificados por separado.

## Capacidades

- Extraccion de estructura de tablas en documentos digitalizados (filas, columnas, celdas y cabeceras), segun la etiqueta `ocr` y el nombre del modelo.
- Reconocimiento optico de caracteres (OCR) en el contexto de pipelines de conversion documental.
- Integracion en flujos de conversion de PDF a formatos estructurados mediante adaptadores compilados cualificados por el consumidor.
- Soporte de inferencia via exportaciones ONNX oficiales, segun la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; la metadata de idioma esta vacia y la model card advierte que la metadata publicada no establece calidad probada en ningun idioma.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo puede emplearse como componente de extraccion de tablas en un pipeline OCR que convierta PDFs de proveedores en registros estructurados, siempre que el consumidor aporte un adaptador compilado cualificado.
- Conversion de informes financieros a CSV/JSON: util para extraer tablas de balances y cuentas de resultados en documentos corporativos, integrándose en flujos de ingestion de datos.
- Procesamiento de documentacion cientifica: extraccion de tablas de resultados en articulos PDF para su posterior analisis o indexacion en bases de conocimiento.
- Automatizacion de back-office administrativo: tratamiento de formularios y tablas de expedientes escaneados en entornos con requisitos de trazabilidad de licencia permisiva.
- Construccion de pipelines RAG sobre documentos con tablas: el modelo aportaria la fase de estructuración tabular antes de la fragmentacion e indexacion semantica.
- Archivado y cumplimiento documental: extraccion de tablas de contratos y polizas para auditoria, aprovechando la licencia CDLA-Permissive-2.0 y Apache-2.0 que facilita el uso comercial.
- Despliegue en entornos con restricciones de red: al no incluir servidores de inferencia ni codigo ejecutable, el consumidor controla completamente el runtime y puede operar en local sin dependencias externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la publicacion verifica identidades inmutables de ficheros, no precision OCR, ports nativos, fidelidad de cuantizacion, ajuste a dispositivos ni aceptacion en escritorio, movil o navegador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (0,2 GB) sugiere pesos ligeros, pero no se confirma el numero de parametros ni el consumo real en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del repo sugiere que podria caber en GPU de consumo, pero no hay datos oficiales.
- Opciones de despliegue: exportaciones ONNX oficiales mencionadas; no se incluyen servidores de inferencia ni codigo ejecutable, por lo que el consumidor debe aportar su propio runtime cualificado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nile-academy/docling-tableformer | no disponible | no disponible | CDLA-Permissive-2.0 AND Apache-2.0 | Espejo en Hugging Face, 0 descargas |
| docling-project/docling-models (original) | no disponible | no disponible | CDLA-Permissive-2.0 AND Apache-2.0 | Repositorio original en Hugging Face |
| Otros modelos de estructura de tablas (p. ej. TableFormer, LayoutLMv3) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

La unica comparacion fiable es con el repositorio original de Docling, del que este es un espejo. No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un espejo de distribucion, no un modelo con desarrollo propio: los derechos y la responsabilidad tecnica recaen en los publicadores originales.
- La publicacion no verifica precision OCR, fidelidad de cuantizacion ni ajuste a dispositivos; el consumidor debe cualificar el modelo por su cuenta.
- No incluye codigo Python, checkpoints en pickle, servidores de inferencia ni codigo ejecutable; requiere conversion y adaptador separados.
- La metadata de idioma esta vacia; la preferencia por arabe se menciona pero no se garantiza calidad en ningun idioma.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion disponible.
- Restricciones de licencia: se declaran dos licencias simultaneas (CDLA-Permissive-2.0 AND Apache-2.0) sin inferir eleccion OR ni alcance codigo-versus-pesos; el consumidor debe revisar los textos completos conservados en el repositorio.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- No se especifica ningun fallback en la nube; el despliegue es responsabilidad del consumidor.

## Enlaces

- [Hugging Face: nile-academy/docling-tableformer](https://huggingface.co/nile-academy/docling-tableformer)
- [Repositorio original: docling-project/docling-models (commit 2199320848bb9a8a519d22e4b528185a4f9a6f64)](https://huggingface.co/docling-project/docling-models/tree/2199320848bb9a8a519d22e4b528185a4f9a6f64)
