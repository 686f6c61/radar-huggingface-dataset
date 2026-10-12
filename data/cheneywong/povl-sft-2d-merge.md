# CheneyWong/povl-sft-2d-merge

## Resumen

`povl-sft-2d-merge` es un ajuste fino supervisado correctivo sobre la familia PaddleOCR-VL, especializado en reconocimiento de estructura de tablas a partir de una imagen. Lo desarrolla CheneyWong y se distribuye bajo licencia Apache 2.0 en HuggingFace. El problema que ataca es muy concreto: el token de fusión bidimensional `<xcel>` (una celda que abarca simultáneamente varias filas y varias columnas) representaba solo el 0,89 % de los tokens de celda en la mezcla de entrenamiento previa, y una de las fuentes aportaba un 0,00 %. Este checkpoint añade 22.110 muestras con dos o más fusiones 2D, elevando la tasa al 3,92 % (de 1,06 a 4,96 fusiones por tabla).

El modelo tiene 905.601.648 parámetros reales (según los pesos en safetensors, unos 0,9 mil millones) y un repositorio de 1,8 GB. Es, por tanto, un modelo visión-lenguaje de tamano contenido, orientado a una tarea única: dada una imagen de tabla más el prompt `Table Recognition:`, emite en una sola pasada marcado OTSL con los tokens `<fcel>`, `<ecel>`, `<ucel>`, `<lcel>`, `<xcel>` y `<nl>`.

Su relevancia es metodológica: demuestra que un ajuste correctivo dirigido a un token infrarepresentado mejora la reproducción de celdas combinadas y elimina por completo el modo de fallo de truncamiento descontrolado. Conviene aclarar que "merge" aquí se refiere a la fusión de celdas 2D del estándar OTSL, no a mezcla de pesos entre modelos. La contrapartida es que el ajuste provoca regresiones en varios conjuntos de datos fuera de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje (pipeline image-text-to-text) basado en PaddleOCR-VL; incluye codigo personalizado (etiqueta `custom_code`). Detalle del codificador visual y del backbone de lenguaje: no disponible |
| Parametros totales | 905.601.648 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible de forma explicita. Los pesos se distribuyen en safetensors (1,8 GB para ~0,9 B de parametros, compatible con fp16/bf16) |
| Idiomas soportados | No disponible (campo de idiomas vacio). La mezcla de entrenamiento no contenia chino, y los cohortes chinos de escena real regresaron 2-3 puntos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un modelo vision-lenguaje con pipeline `image-text-to-text`, construido sobre PaddleOCR-VL-1.6 como base y ajustado de forma inmediata desde `CheneyWong/povl-sft-full-3ep`, su predecesor dentro de la misma ejecucion. La cadena de linaje declarada por el autor es: `PaddleOCR-VL-1.6 (base)` → `povl-sft-full-3ep` → `povl-sft-2d-merge`. No se especifican en la informacion disponible el tipo exacto de codificador visual, el backbone de lenguaje ni la longitud de contexto.

El entrenamiento es un SFT correctivo, no un preentrenamiento desde cero. El eje del ajuste es la representacion de celdas combinadas: se anadieron 22.110 muestras con dos o mas fusiones 2D para corregir la infrarrepresentacion del token `<xcel>`, que pasa del 0,89 % al 3,92 % de los tokens de celda y de 1,06 a 4,96 fusiones por tabla. Segun el autor, este cambio elimino por completo el modo de fallo de truncamiento descontrolado. No se documentan en la informacion proporcionada el numero total de tokens de entrenamiento, la composicion completa del dataset ni el uso de RLHF o DPO.

El formato de tarea es fijo: una unica imagen de tabla acompanada del prompt `Table Recognition:`, una sola pasada de inferencia y salida en marcado OTSL con los tokens `<fcel>` (celda completa), `<ecel>` (celda vacia), `<ucel>`, `<lcel>` (celda fusionada horizontalmente), `<xcel>` (fusion 2D de filas y columnas) y `<nl>` (nueva linea).

## Capacidades

- Reconocimiento de estructura de tablas: convierte la imagen de una tabla en marcado OTSL en una sola pasada.
- Reproduccion de celdas combinadas 2D: manejo mejorado del token `<xcel>`, que es el objetivo central del checkpoint.
- Celdas fusionadas horizontalmente y verticalmente: soporte de los tokens `<lcel>` y de las variantes verticales del estandar OTSL.
- Celdas vacias: emision explicita mediante `<ecel>`.
- Tarea image-text-to-text: entrada multimodal (imagen mas texto) y salida textual.
- Formato conversacional: la etiqueta `conversational` sugiere soporte de plantillas de dialogo, aunque no se detalla el esquema exacto.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`, lo que facilita su despliegue en infraestructura de inferencia gestionada.
- No se documentan capacidades de tool calling, function calling, agentes, vision general (mas alla de tablas), audio ni modo de razonamiento explicito.

## Casos de uso

- Digitalizacion de tablas financieras con celdas combinadas: los informes contables usan habitualmente celdas que abarcan varias filas y columnas; este checkpoint es precisamente el que corrige ese caso, con 4,96 fusiones 2D por tabla de media.
- Conversion de tablas escaneadas a OTSL para pipelines posteriores: la salida en marcado OTSL se puede transformar de forma determinista a HTML, Markdown o estructura relacional, lo que encaja en un ETL documental.
- Preprocesado para RAG sobre documentos: extraer la tabla como estructura en lugar de como texto plano mejora la recuperacion y la trazabilidad de las respuestas en sistemas de preguntas y respuestas sobre PDF.
- Procesamiento por lotes de informes anuales: el modelo es de 0,9 B de parametros y 1,8 GB de pesos, por lo que se puede ejecutar en una GPU de consumo y escalar horizontalmente para volumenes altos.
- Extraccion de tablas de articulos cientificos: los resultados en PubTables-1M (TEDS 0,9373), PubTables-v2 (0,9546) y FinTabNet en OTSL (0,9653) lo situan como opcion solida para literatura academica tabulada.
- Normalizacion de tablas heterogeneas con estructura irregular: las ganancias mas grandes se observan en SynthTabNet (+0,1104 TEDS) y PubTables-v2 (+0,0519 TEDS), lo que indica buena tolerancia a variabilidad estructural.
- Componente base para posteriores ajustes: el checkpoint sucesor `CheneyWong/povl-opd-scale05` parte de este modelo, de modo que sirve como punto de partida documentado para nuevas rondas de entrenamiento.
- Evaluacion comparativa de reconocimiento de tablas: util para reproducir la tabla de benchmarks del autor y contrastar variantes dentro de la misma familia.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre conjuntos de datos publicos (se excluyen los benchmarks propios del proyecto). TEDS y TEDS-S, con la base sin modificar como referencia y n = numero de muestras.

| Dataset | n | Base TEDS | Ours TEDS | d TEDS | Base TEDS-S | Ours TEDS-S | d TEDS-S |
|---|---:|---:|---:|---:|---:|---:|---:|
| PubTables-1M | 2000 | 0,9015 | 0,9373 | +0,0358 | 0,9243 | 0,9473 | +0,0229 |
| PubTables-v2 | 2000 | 0,9026 | 0,9546 | +0,0519 | 0,9239 | 0,9635 | +0,0396 |
| FinTabNet (OTSL) | 2000 | 0,9442 | 0,9653 | +0,0211 | 0,9524 | 0,9728 | +0,0204 |
| PubTabNet / ICDAR | 2000 | 0,9297 | 0,9297 | -0,0000 | 0,9464 | 0,9432 | -0,0032 |
| SynthTabNet | 2000 | 0,8093 | 0,9197 | +0,1104 | 0,8474 | 0,9322 | +0,0848 |
| TableVerse-5K | 4951 | 0,8608 | 0,8348 | -0,0260 | 0,9101 | 0,8900 | -0,0201 |
| OmniDocBench v1.5 | 512 | 0,9580 | 0,9329 | -0,0251 | 0,9797 | 0,9647 | -0,0150 |
| OmniDocBench v1.6 | 665 | 0,9492 | 0,9167 | -0,0325 | 0,9753 | 0,9543 | -0,0210 |
| CC-OCR | 300 | 0,8304 | 0,7830 | -0,0474 | 0,8762 | 0,8328 | -0,0434 |
| OCRBench-v2 | 681 | 0,8120 | 0,8009 | -0,0111 | 0,8526 | 0,8395 | -0,0131 |
| Real5 (re-shot OmniDoc) | 1320 | 0,8930 | 0,8552 | -0,0378 | 0,9307 | 0,8943 | -0,0364 |
| SPRINT-MUSTARD | 1429 | 0,2184 | 0,2196 | +0,0012 | 0,8754 | 0,8655 | -0,0099 |
| TABLET | 909 | 0,9048 | 0,8835 | -0,0213 | 0,9277 | 0,9040 | -0,0237 |
| **Global (equiponderado)** | - | 0,8395 | 0,8410 | +0,0015 | 0,9171 | 0,9157 | -0,0014 |

Advertencia del autor sobre SPRINT-MUSTARD: su verdad de referencia no lleva texto de celda, por lo que su TEDS (~0,22) mide la reproduccion de celdas vacias y debe ignorarse; una prueba de perturbacion muestra que una prediccion estructuralmente perfecta que lee correctamente el texto visible obtiene 0,33 TEDS y 1,00 TEDS-S. Solo la columna TEDS-S es significativa en ese conjunto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8-2,5 GB en fp16/bf16 para los 905,6 M de parametros, mas la cache KV y la sobrecarga del codificador visual. En int8 en torno a 1,0-1,5 GB; en int4 en torno a 0,6-1,0 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente por tamano. Para produccion con concurrencia, una NVIDIA A100, H100, L40S o similares permiten maximizar el throughput; en el extremo de consumo, una RTX 4090, RTX 4080 o incluso una RTX 3060 de 12 GB cubren la inferencia sin problema.
- Cabe en GPU de consumo: si, con holgura. Es un modelo de menos de mil millones de parametros y 1,8 GB de pesos.
- Opciones de despliegue: al declararse `transformers`, `endpoints_compatible` y `custom_code`, el camino natural es HuggingFace Transformers y los endpoints gestionados. La viabilidad con vLLM, llama.cpp, Ollama o TGI no se documenta en la informacion proporcionada, y el uso de codigo personalizado puede exigir comprobaciones adicionales antes de integrarlo en esos motores. GGUF no aparece entre los formatos publicados.
- Latencia y throughput estimados: no disponibles. No consta ninguna medicion publicada de latencia, tokens por segundo ni rendimiento bajo carga concurrente.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto ni licencia de los modelos alternativos; la comparacion se limita a la relacion de linaje, al tamano conocido y a los resultados globales cuando estan publicados.

| Modelo | Relacion | Parametros | Contexto | TEDS global (equiponderado) | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| povl-sft-2d-merge | Este checkpoint | 905.601.648 | no disponible | 0,8410 | apache-2.0 | Publico en HuggingFace |
| PaddleOCR-VL-1.6 (base) | Base sin modificar | no disponible | no disponible | 0,8395 | no disponible | Publico en HuggingFace |
| povl-sft-full-3ep | Predecesor inmediato | no disponible | no disponible | no disponible | no disponible | Publico en HuggingFace |
| povl-opd-scale05 | Sucesor (delta del profesor fusionado sobre la base SFT) | no disponible | no disponible | no disponible | no disponible | Publico en HuggingFace |

Frente a la base, la mejora global equiponderada es marginal (+0,0015 TEDS, -0,0014 TEDS-S): el valor del checkpoint no esta en la media agregada, sino en el comportamiento sobre celdas combinadas y en conjuntos con estructuras irregulares (SynthTabNet, PubTables-v2). El autor indica que el sucesor `povl-opd-scale05` no supera ni sigue con claridad la segunda ronda, lo que sugiere que la cadena de ajustes posteriores no aporta una mejora neta evidente.

## Limitaciones y advertencias

- Dependencia de la tarea: el modelo esta disenado para una unica tarea (imagen de tabla mas el prompt `Table Recognition:`) y no se documentan capacidades generales de vision o conversacion.
- Regresion fuera de dominio: pese a la mejora en estructura, se observan caidas en CC-OCR (-0,0474 TEDS), Real5 (-0,0378), OmniDocBench v1.6 (-0,0325) y TABLET (-0,0213). El propio autor senala que las ganancias estructurales y las ganancias fuera de dominio son cosas distintas.
- Idioma: la mezcla de entrenamiento no contenia chino en absoluto, lo que provoca regresiones de 2-3 puntos en cohortes chinos de escena real. El campo de idiomas soportados esta vacio, asi que el soporte multilingue no esta garantizado.
- Riesgo de alucinacion: no se documenta de forma explicita, pero un modelo generativo de este tipo puede producir texto de celda o estructura inexistentes en imagenes de baja calidad o tablas poco convencionales. No hay evaluacion publicada de tasas de alucinacion.
- Sesgos: no se ha publicado ningun analisis de sesgos.
- Licencia: Apache 2.0, permisiva y apta para uso comercial, aunque conviene verificar las condiciones del modelo base PaddleOCR-VL-1.6, cuya licencia no se detalla en la informacion disponible.
- Codigo personalizado: la etiqueta `custom_code` implica que la carga requiere `trust_remote_code=True`, con la consiguiente necesidad de auditar el codigo antes de usarlo en produccion.
- Madurez y soporte: el repositorio registra 5 descargas y 0 likes, y no hay un articulo tecnico ni documentacion extendida asociada. El soporte de la comunidad es practicamente nulo.
- Fechas: el repositorio figura creado el 2026-10-12 y actualizado el mismo dia, y no hay historial posterior de mantenimiento.
- Caveat sobre SPRINT-MUSTARD: su TEDS carece de valor interpretativo por el diseno de su verdad de referencia; solo debe considerarse TEDS-S en ese conjunto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CheneyWong/povl-sft-2d-merge
- Checkpoint sucesor: https://huggingface.co/CheneyWong/povl-opd-scale05
- Documentacion de PEFT sobre mezcla de modelos (referencia general, no especifica de este checkpoint): https://huggingface.co/docs/peft/developer_guides/model_merging
