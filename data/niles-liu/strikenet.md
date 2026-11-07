# niles-liu/strikenet

## Resumen

StrikeNet es una red neuronal convolucional (CNN) de 79.000 parámetros desarrollada por niles-liu para resolver un problema muy concreto dentro del procesamiento de documentos: distinguir entre una palabra tachada y una palabra limpia en páginas escaneadas. Un trazo fino sobre una palabra sin ascendentes es, a nivel de píxel, indistinguible de una cadena de glifos normal, por lo que la geometría morfológica por sí sola no basta para separar ambos casos. StrikeNet actúa como árbitro final en esos casos ambiguos dentro del paquete `pdf-strikethrough-detect`.

El modelo es una pieza auxiliar, no un modelo de lenguaje ni un clasificador de imágenes de propósito general. Recibe un recorte de palabra en escala de grises estandarizado de 32×160 píxeles (normalizado en altura, con la tinta en positivo) y devuelve un único logit que, tras aplicar sigmoide, se interpreta como la probabilidad de que la palabra esté tachada. En PDFs nativos digitales el paquete lee los trazos vectoriales directamente y nunca invoca este modelo; su uso se limita a documentos escaneados.

Su relevancia actual es de nicho pero práctica: permite recuperar automáticamente tachados en corpus regulatorios escaneados (redlines legales, códigos administrativos) con una tasa de recuperación del 97,3 % a nivel de pipeline. Se distribuye como ONNX y se ejecuta sobre ONNX Runtime sin dependencia de torch, lo que facilita su integración en flujos de document AI ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional) |
| Parametros totales | 79.000 (79k) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija de 32×160 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesa recortes de imagen, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`strike_verdict_cnn.onnx`), con metadatos en `strike_verdict_cnn.meta.json` |

## Arquitectura y entrenamiento

StrikeNet es una CNN pequeña (79k parámetros) que opera sobre un único recorte de palabra en escala de grises de 32×160 píxeles, con geometría normalizada y tinta en positivo. El recorte se genera con `pdf_strikethrough.cnn.std_crop` y la geometría queda fijada en `strike_verdict_cnn.meta.json`, comprobándose en tiempo de carga mediante `cnn._check_geometry` para garantizar que los recortes de entrenamiento e inferencia no difieran. La salida es un único logit transformado con sigmoide en una probabilidad de tachado, con umbrales `p_hi = 0.85` y `p_lo = 0.15` definidos en los metadatos.

El apartado de procedencia de la model card es explícito: los pesos distribuidos (versión `v3-corpus`) no son reproducibles desde el repositorio del paquete. El ONNX es byte a byte idéntico en todas las releases desde la 0.4.0 (julio de 2026) y es anterior al script `training/train_strikenet.py`, que no lo produjo. No se registran ni el conjunto de entrenamiento, ni la partición train/validation, ni los hiperparámetros, ni cómo se eligieron los umbrales 0.85/0.15. El script de entrenamiento permite entrenar un reemplazo sobre un conjunto de recortes etiquetados exportado por el detector, calibrando `p_hi`/`p_lo` con datos reservados y registrando en los metadatos el digest del conjunto, los recuentos de clase, el tamaño de validación, la agrupación de la partición y las versiones de paquete, numpy y torch.

## Capacidades

- Clasificación binaria de recortes de palabra: devuelve la probabilidad de que una palabra esté tachada frente a limpia.
- Resolución de casos ambiguos a nivel de píxel que la geometría morfológica no puede separar.
- Salida con tres estados operativos mediante umbrales: tachada (`≥ p_hi`), limpia (`≤ p_lo`) e insegura (entre ambos).
- Umbrales configurables por llamada mediante `ScanConfig.recall_first(cnn_p_hi=…)` y `precision_first(cnn_p_hi=…)`.
- Verificación de integridad del modelo descargado mediante digest SHA-256 antes de cargar el grafo.
- Ejecución sobre ONNX Runtime sin dependencia de torch.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües de texto.

## Casos de uso

- Recuperación de tachados en redlines regulatorios escaneados: el paquete usa StrikeNet para adjudicar los recortes en el nivel `auto`/`review`, permitiendo reconstruir qué texto fue eliminado en documentos como los del Copyright Office, FDIC, CEQ, EPA o CCPA. Es adecuado porque la geometría sola no separa los casos ambiguos.
- Generación de markdown consciente de tachados: tras la adjudicación, el pipeline produce markdown que refleja las palabras tachadas, útil para archivado legal y revisión de cambios normativos.
- Auditoría de contratos y normativa con enmiendas: en corpus escaneados donde los cambios se marcan con trazos, el modelo ayuda a distinguir texto vigente de texto derogado a nivel de palabra.
- Digitalización de documentos con OCR más clasificación: combinado con RapidOCR o Azure Document Intelligence, el modelo añade una capa de decisión sobre los recortes que el OCR entrega.
- Reentrenamiento iterativo sobre páginas problemáticas: el flujo `detect --dump-crops` exporta recortes puntuados, se etiquetan como `struck`/`clean` y se entrena un reemplazo con `train_strikenet.py`, cerrando el ciclo página fallida → mejor modelo.
- Integración en pipelines de document AI ligeros: al ser un ONNX de 79k parámetros sobre ONNX Runtime, puede desplegarse en entornos sin GPU y sin torch, con verificación de integridad previa a la carga.

## Benchmarks y rendimiento

Las cifras publicadas miden el pipeline completo (geometría de trazos, palabras OCR y el modelo en conjunto), no el modelo de forma aislada, sobre un corpus reproducible de 10 documentos regulatorios públicos (55,7k palabras tachadas, cada una con `sha256` fijado).

| Métrica | Valor | Fuente |
|---|---|---|
| Recuperación de tachados en ruta escaneada (RapidOCR) | 97,3 % | `scanned_recovery.py`, 3 docs / 24 páginas / 2.170 tachados conocidos |
| Recuperación de tachados en ruta escaneada (Azure DI) | 97,9 % con `confidence_free()`; 95,2 % con la calibración DI por defecto | mismo harness, palabras de Azure Document Intelligence |
| Detecciones vectoriales nativas confirmadas por la señal de flag | 99,8 % | `confirmation_rate.py` (contexto; ruta nativa, no este modelo) |

No existe todavía una cifra de precisión/recall del modelo aislado sobre datos reservados. La model card indica que haría falta un conjunto de recortes etiquetados que el modelo no haya visto, como documentos publicados después de julio de 2026, o un reentrenamiento sobre un conjunto etiquetado registrado. Tampoco se registra si estos documentos se solapan con los datos de entrenamiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 79k parámetros el modelo ocupa del orden de cientos de kilobytes en pesos, por lo que cabe en CPU sin problema.
- GPU recomendadas: no requiere GPU; funciona en CPU mediante ONNX Runtime. Cualquier GPU (RTX 4090, A100, H100) puede ejecutarlo pero no es necesario.
- Cabe en cualquier GPU de consumo y en entornos sin GPU; el coste dominante del pipeline es el OCR, no este modelo.
- Opciones de despliegue: ONNX Runtime a través del paquete `pdf-strikethrough-detect`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. StrikeNet es un clasificador binario de recortes de palabra de propósito muy específico (detección de tachados en documentos escaneados) y no se han encontrado alternativas equivalentes con datos publicados en la información disponible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StrikeNet | 79k | no aplica (imagen 32×160) | Clasificación de tachado en recortes de palabra | MIT | Hugging Face (ONNX) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos distribuidos no son reproducibles: el ONNX `v3-corpus` es anterior al script de entrenamiento y no se registran conjunto de datos, partición, hiperparámetros ni criterio de elección de umbrales.
- No existe una métrica de precisión/recall del modelo aislado sobre datos reservados; las cifras publicadas miden el pipeline completo y podrían solaparse con los datos de entrenamiento.
- El modelo solo interviene en la ruta de documentos escaneados; en PDFs nativos digitales el paquete lee trazos vectoriales y no lo invoca.
- La salida es una probabilidad con umbrales fijos (0,85/0,15) cuyo origen no está documentado; un candidato no confirmado en `p_hi` no se reporta.
- Depende de la geometría exacta del recorte (`std_crop`); cualquier desviación en la generación del recorte invalida la inferencia, y la comprobación en carga solo garantiza coincidencia de geometría, no de distribución.
- No procesa texto ni idiomas: opera sobre imágenes de recortes, por lo que su comportamiento depende del OCR y del preprocesado aguas arriba.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright y tener en cuenta que la falta de procedencia documentada complica la auditoría en producción.
- Riesgo de falsos negativos en palabras cuya confirmación depende de `p_hi`; los umbrales pueden ajustarse por llamada con `recall_first` o `precision_first`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niles-liu/strikenet
- Repositorio del proyecto: https://github.com/niles-liu/pdf-strikethrough-detect
- Documentación de arquitectura del pipeline: https://github.com/niles-liu/pdf-strikethrough-detect#how-it-works
- Ficha en Free2AITools: https://free2aitools.com/model/niles-liu/strikenet
