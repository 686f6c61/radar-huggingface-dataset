# amohammed3339/doc-cascade-fastpath

## Resumen

doc-cascade-fastpath (ID `amohammed3339/doc-cascade-fastpath`) no es un modelo con pesos publicados, sino un paquete de codigo publicado por el usuario amohammed3339 que implementa una cascada de clasificacion de paginas de texto extraido de PDF (sin OCR) en cuatro clases: `invoice`, `lab`, `radiology` y `discharge_summary`. El objetivo declarado es inferencia exclusivamente en CPU con un presupuesto de menos de 100 ms por pagina y una salida de rechazo (`uncertain`) controlada por umbrales de confianza, pensada para derivar casos dudosos a revision humana.

La arquitectura es una cascada de dos etapas: una via rapida con TF-IDF mas regresion logistica (1-10 ms por pagina) y una via lenta con un fine-tuning de DistilBERT (50-200 ms por pagina en CPU). Si la confianza de la via rapida supera `route_threshold`, se devuelve la etiqueta; si no, se invoca la via lenta y, si tampoco supera `fallback_threshold`, la pagina se marca como `uncertain`. La calibracion de umbrales se hace sobre el split de validacion con un objetivo de precision configurable (por defecto 0,97 en el script).

Su relevancia actual es metodologica mas que de rendimiento: el repositorio funciona como plantilla reproducible para montar una cascada coste/precision con enrutado a humano en dominios documentales regulados (facturacion, laboratorio, radiologia, informes de alta). Conviene subrayar que el propio autor indica que el repositorio contiene unicamente codigo, sin pesos ni cifras de precision, porque la sesion de ejecucion remota fallo por falta de creditos (HTTP 402). El repositorio pesa 0,0 GB y acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada de dos etapas: (1) TF-IDF + regresion logistica; (2) DistilBERT fine-tuneado (encoder transformer, via lenta). No es MoE ni SSM |
| Parametros totales | no disponible. El repo no publica pesos. La via rapida no tiene un numero fijo de parametros (depende del vocabulario TF-IDF); la via lenta usa DistilBERT, cuya variante base estandar ronda los 66 M de parametros, aunque la model card no especifica la variante exacta |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens por defecto en la via lenta (`--max-seq-length`), reducible a 128 segun la model card. La via rapida no usa contexto secuencial |
| Tipos de cuantizacion | no disponible. La model card menciona la opcion de cuantizar la via lenta con optimum/ONNX, pero no se publican artefactos cuantizados |
| Idiomas soportados | no disponible. El dataset sintetico y las etiquetas estan en ingles (`invoice`, `lab`, `radiology`, `discharge_summary`), pero no se declara soporte multilingue |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos). La via rapida se serializa como pickle (`artifacts/fastpath.pkl`); la via lenta se generaria como checkpoint de transformers (safetensors/bin) al ejecutar `train_transformer.py` en local |

Otros datos del repositorio: autor `amohammed3339`, etiqueta `region:us`, creado el 2026-09-18 y actualizado el 2026-09-18, pipeline no disponible, tamano del repo 0,0 GB.

## Arquitectura y entrenamiento

El diseno es una cascada con control de coste: la primera etapa vectoriza el texto de la pagina con TF-IDF y decide con una regresion logistica; la segunda etapa es un transformer encoder pequeno (DistilBERT) que solo se ejecuta para las paginas cuya confianza en la primera etapa queda por debajo de `route_threshold`. La calibracion (`calibrate_cascade.py`) fija los dos umbrales sobre el split de validacion a partir de una precision objetivo (0,97 por defecto) y produce `cascade_config.json`, que incluye el parametro `frac_slow` (fraccion de trafico que paga la via lenta). La latencia media estimada se calcula como `fast_ms x (1 - frac_slow) + slow_ms x frac_slow`.

Los datos de entrenamiento que acompanan al repositorio son sinteticos: `generate_synth_pages.py` genera 10.000 paginas con 4 clases y aproximadamente un 10 por ciento de casos ambiguos, en formato JSONL (`{"text": ..., "label": ...}`). El autor indica que para usar datos reales basta con convertir las paginas anotadas a ese mismo esquema y mantener intacto el split de validacion al comparar umbrales. No se menciona RLHF, DPO ni ajuste por preferencias: es un problema de clasificacion supervisada. Tampoco hay innovaciones de decodificacion (no aplica al no ser un modelo generativo); la unica optimizacion tecnica descrita es la propia cascada con rechazo y la posibilidad de truncar la longitud de secuencia (256 a 128) o cuantizar la via lenta con optimum/ONNX para cumplir un p95 de 100 ms.

Punto critico: la model card afirma explicitamente que no se han producido pesos ni cifras de precision, porque la ejecucion remota no dispuso de computo. Por tanto, lo descrito es el diseno y las instrucciones de entrenamiento, no un modelo entrenado y evaluado.

## Capacidades

- Clasificacion de paginas de texto extraido de PDF en cuatro etiquetas cerradas: `invoice`, `lab`, `radiology` y `discharge_summary`.
- Enrutado por confianza: devuelve etiqueta por via rapida, etiqueta por via lenta o la clase especial `uncertain` para revision humana.
- Inferencia exclusiva en CPU, sin GPU, con objetivo de menos de 100 ms por pagina.
- Calibracion de umbrales sobre validacion con precision objetivo configurable.
- Benchmarking de latencia end-to-end por pagina con percentiles p50, p95 y p99 (`classify_pages.py --bench 300`).
- Entrenamiento reproducible desde cero: generacion de dataset sintetico, entrenamiento de via rapida, fine-tuning del transformer, calibracion y clasificacion.
- No soporta generacion de texto, razonamiento abierto, codigo, matematicas, vision, audio, tool calling, function calling ni flujos de agente. El texto de entrada debe proceder de una extraccion previa de PDF; el modelo no hace OCR.
- Capacidades multilingues: no disponibles (no se declara soporte de idiomas).

## Casos de uso

- Triaje documental en back-office sanitario: clasificar paginas entrantes de historiales escaneados en factura, laboratorio, radiologia o informe de alta antes de derivarlas al equipo correspondiente, usando la clase `uncertain` para enviar a revision manual las paginas con confianza baja.
- Enrutado previo a extraccion especializada: usar la etiqueta de la via rapida para decidir que extractor o plantilla (por ejemplo, parser de facturas frente a parser de resultados de laboratorio) se aplica despues, reduciendo el coste de ejecutar modelos pesados sobre todas las paginas.
- Filtrado y priorizacion en colas de digitalizacion masiva: procesar lotes de miles de paginas en CPU sin GPU dedicada, dejando que solo la fraccion `frac_slow` pague los 50-200 ms de DistilBERT.
- Control de calidad de pipelines de OCR/extraccion: marcar como `uncertain` las paginas que no encajan con ninguna clase conocida, lo que sirve como senal de documentos mal escaneados, plantillas nuevas o errores de extraccion.
- Clasificacion de adjuntos en gestion de siniestros o expedientes: separar facturas de informes medicos en un flujo de entrada de correo o de gestor documental, con umbral calibrado para que las decisiones automaticas alcancen una precision objetivo conocida (por ejemplo 0,97).
- Despliegue en entornos con restricciones de hardware: al ser CPU-only y no requerir pesos grandes, encaja en contenedores pequenos o en instalaciones on-premise donde no se permite enviar documentos a servicios externos.
- Base para monitorizacion de deriva: al reentrenar periodicamente con el mismo esquema JSONL y recalibrar umbrales sobre un split de validacion fijo, permite detectar cambios en la mezcla de documentos o en las plantillas de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se han producido cifras de precision porque la sesion de construccion se quedo sin computo (HTTP 402) y el repositorio contiene solo codigo. Unicamente se describen objetivos de diseno y rangos esperados de latencia, no mediciones:

| Metrica | Valor |
|---|---|
| Precision (accuracy) | no disponible. Objetivo configurable del script de calibracion: 0,97 |
| Latencia via rapida (TF-IDF + regresion logistica) | 1-10 ms por pagina, en el rango de un solo digito con 2 vCPU segun la model card |
| Latencia via lenta (DistilBERT en CPU) | 50-200 ms por pagina, dependiente del numero de nucleos |
| Latencia media end-to-end | Depende de `frac_slow`; formula indicada: `fast_ms x (1 - frac_slow) + slow_ms x frac_slow` |
| Muestras de benchmark | `classify_pages.py --bench 300` (percentiles p50/p95/p99 medidos en la maquina del usuario) |

## Requisitos de hardware

- Inferencia pensada para CPU: la model card menciona 2 vCPU como referencia para la via rapida; no se requieren GPU ni VRAM dedicada.
- Memoria RAM del fast path: no disponible. Al ser TF-IDF y regresion logistica serializados en pickle, el consumo depende del vocabulario y del tamano del dataset, y no se especifica en el repositorio.
- Via lenta: no disponible como cifra medida. Como referencia de la arquitectura estandar, un DistilBERT base en fp32 ocupa en torno a 250-300 MB de pesos, lo que implica del orden de 1 GB de RAM en ejecucion; esta estimacion no procede de la model card y debe verificarse localmente.
- Entrenamiento de la via lenta: la model card indica aproximadamente 15-25 minutos en una T4, con la opcion `--fp16` si hay GPU disponible.
- GPU recomendadas: no se especifican. Solo se menciona T4 para el fine-tuning; la inferencia esta disenada para no usar GPU.
- Opciones de despliegue: scripts de Python propios (`classify_pages.py`) con configuracion JSON, pickle para la via rapida y checkpoint de transformers para la via lenta. La model card sugiere exportacion/cuantizacion de la via lenta con optimum/ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador no generativo.
- Throughput y latencia: no disponibles como medicion publicada. Presupuesto de diseno: menos de 100 ms por pagina; si el p95 se excede con una `frac_slow` alta, se recomienda truncar `--max-seq-length` de 256 a 128 y recalibrar.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este repositorio, por lo que no es posible una comparacion cuantitativa. La tabla siguiente contrasta el diseno con alternativas habituales de la misma tarea (clasificacion de paginas documentales); los datos de las alternativas son los publicos de cada proyecto y no han sido contrastados experimentalmente contra este repositorio.

| Alternativa | Parametros | Contexto / entrada | Licencia | Comentario |
|---|---|---|---|---|
| doc-cascade-fastpath (este repo) | no disponible (codigo solo) | 256 tokens por defecto en la via lenta; texto extraido de PDF sin layout | no disponible | Cascada coste/precision con rechazo a humano; sin pesos ni metricas publicadas |
| Clasificador DistilBERT de una sola etapa | ~66 M (variante base estandar) | 512 tokens en la configuracion estandar de DistilBERT; la model card usa 256 | Apache 2.0 en la variante base de referencia | Mas simple que la cascada, pero paga el coste del transformer en todas las paginas |
| Baseline de reglas o expresiones regulares | 0 (no aprendido) | sin limite practico, depende del texto | depende del proyecto | Muy rapido y explicito, pero fragil ante variacion de plantillas y sin capacidad de calibracion por confianza |
| LayoutLMv3-base (Microsoft) | ~133 M | 512 tokens con caracteristicas de layout | cc-by-nc-sa-4.0 (uso no comercial) segun su ficha en HuggingFace | Aprovecha posicion y estructura del documento; requiere features de layout, que esta cascada no usa al partir de texto extraido |

## Limitaciones y advertencias

- No existen pesos entrenados ni resultados de evaluacion: el repositorio es unicamente codigo. Cualquier uso en produccion exige entrenar y medir primero.
- Las cifras de precision objetivo (0,97) y los umbrales son parametros de configuracion, no resultados verificados.
- Los datos por defecto son sinteticos (10.000 paginas, 4 clases, ~10 por ciento de ambiguedad). Un modelo entrenado solo con ellos no refleja la distribucion real de documentos y probablemente generalice mal.
- No hay OCR: el sistema asume texto ya extraido del PDF. Paginas escaneadas sin capa de texto o con extraccion deficiente degradaran la clasificacion.
- Dominio muy cerrado: cuatro clases documentales. Cualquier pagina fuera de ese conjunto deberia caer en `uncertain`, pero no hay datos publicados que cuantifiquen esa tasa de rechazo.
- Idiomas no declarados: no se especifica soporte multilingue, por lo que el comportamiento en documentos en castellano u otras lenguas es desconocido.
- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo solo asigna etiquetas; el riesgo equivalente es la clasificacion incorrecta silenciosa cuando la confianza supera el umbral.
- Sesgos: no documentados. Al ser un esquema de clasificacion documental, los sesgos relevantes serian los presentes en los datos de entrenamiento reales (por ejemplo, infrarrepresentacion de ciertos formatos o idiomas), que no se han analizado.
- Umbrales sensibles al entorno: `frac_slow` y los percentiles de latencia dependen del hardware y del vocabulario real; recalibrar tras cada reentrenamiento es obligatorio.
- Mantenimiento incierto: 0 descargas, 0 likes y ausencia de actualizaciones posteriores al mismo dia de creacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/amohammed3339/doc-cascade-fastpath
- Scripts incluidos en el repositorio (rutas internas, sin URL publica): `scripts/generate_synth_pages.py`, `scripts/train_fastpath.py`, `scripts/train_transformer.py`, `scripts/calibrate_cascade.py`, `scripts/classify_pages.py`
- Paper, blog, demo o dataset asociado: no disponible. La model card no enlaza ninguna publicacion externa.
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las referencias devueltas corresponden a documentacion de HTML sobre el atributo `http-equiv` (W3Schools, MDN, GeeksforGeeks) y no guardan relacion con el modelo.
