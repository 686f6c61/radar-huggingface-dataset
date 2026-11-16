# fahadhafeezofficial/xmsb-evidence-probe

## Resumen

XMSB evidence-consistency probe es un clasificador tabular ligero desarrollado por fahadhafeezofficial como artefacto complementario del benchmark XMSB. No se trata de un modelo de lenguaje ni de un modelo vision-language: es una regresion logistica multinomial calibrada sobre 29 caracteristicas que estima si una afirmacion (claim) esta respaldada por una imagen de ficha de especificaciones. Devuelve una distribucion de probabilidad sobre cuatro clases: `consistent`, `contradictory`, `unsupported` y `ambiguous`.

El modelo consume una tabla de campos extraida del documento por una capa de OCR, junto con el texto de la afirmacion, y calcula caracteristicas observables en tiempo de inferencia: valores de campo reconocidos y su confianza de lectura, presencia del campo asertado, comprobacion de concordancia numerica y de operador, indicadores de legibilidad, marcador de registro obsoleto y dos cosenos de embeddings de frase (MiniLM-L6-v2, solo lado texto). El objetivo es comprobar si una senal barata y auditable basta para detectar afirmaciones no respaldadas, sin sustituir a un juez multimodal.

Su relevancia es metodologica: sirve como linea base reproducible para investigacion sobre deteccion de alucinaciones y consistencia de evidencia en documentos estructurados. El modelo esta entrenado sobre 1.440 elementos sinteticos del esquema XMSB y su rendimiento esta acotado a esa distribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica multinomial calibrada (scikit-learn) sobre 29 caracteristicas tabulares |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador tabular; consume una fila de caracteristicas por item) |
| Tipos de cuantizacion | no aplica (pesos serializados con joblib) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | joblib (`model.joblib`) |

## Arquitectura y entrenamiento

El modelo es un clasificador tabular clasico: una regresion logistica multinomial sobre un vector de 29 caracteristicas construido por `build_feature_row`. Las caracteristicas combinan senales de OCR (valores de campo reconocidos y confianza de lectura), comprobaciones logicas (presencia del campo, concordancia numerica y de operador), indicadores de legibilidad, un marcador de registro obsoleto y dos similitudes coseno entre embeddings de frase calculadas con MiniLM-L6-v2 en el lado texto. No se incluye ninguna etiqueta, identificador de perturbacion ni transcripcion gold en el vector de caracteristicas, lo que permite auditar la senal de decision.

El entrenamiento se realizo sobre 1.440 elementos sinteticos del benchmark XMSB, con un esquema documental cerrado de cinco familias y vocabularios de campo y valor restringidos. Las probabilidades se calibraron con calibracion sigmoide sobre 3 folds. El autor declara explicitamente que se trata de una linea base, no de un detector general, y que el rendimiento se evalua en tarjetas no vistas (`test_id`) y en la plantilla `test_shift`, con intervalos de confianza por cluster-bootstrap sobre tarjetas.

## Capacidades

- Clasificacion de afirmaciones en cuatro clases: `consistent`, `contradictory`, `unsupported` y `ambiguous`.
- Deteccion de afirmaciones no respaldadas por una ficha de especificaciones, a partir de la tabla de campos extraida por OCR y el texto del claim.
- Comprobacion de concordancia numerica y de operador entre el valor asertado y el valor reconocido.
- Senal de presencia o ausencia del campo asertado en el documento.
- Indicadores de legibilidad y marcador de registro obsoleto (superseded record).
- Similitud semantica texto-texto mediante embeddings MiniLM-L6-v2 (dos cosenos).
- Salida probabilistica calibrada por clase.
- No soporta tool calling, function calling, agentes, vision nativa, audio ni generacion de texto.

## Casos de uso

- Investigacion sobre deteccion de alucinaciones: el modelo actua como linea base barata y auditable para comparar contra jueces multimodales en tareas de consistencia de evidencia, gracias a su vector de 29 caracteristicas interpretables.
- Evaluacion de pipelines de OCR: al depender de la tabla extraida por OCR, permite medir como degrada la calidad de lectura (el lector liberado alcanza ~92 % de recall exacto campo-valor en renders limpios y bastante menos en condicion degradada) el rendimiento de la deteccion de claims.
- Auditoria de afirmaciones sobre fichas tecnicas: en un flujo interno, se puede usar para marcar claims de marketing o documentacion que no estan respaldados por la ficha de especificaciones antes de publicacion.
- Filtrado previo en sistemas de verificacion: al ser un clasificador ligero (scikit-learn, joblib), puede ejecutarse como primera etapa de bajo coste que descarte casos claramente inconsistentes antes de invocar un modelo multimodal mas caro.
- Experimentacion academica reproducible: el repositorio incluye `example.py`, tests y codigo del paper, lo que facilita replicar el benchmark XMSB y extender el analisis de caracteristicas.
- Prototipado de senales de consistencia en dominios con esquema cerrado: util como referencia para disenar detectores especificos cuando los documentos siguen un esquema fijo de campos y valores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card remite a `metrics.json` para el macro-F1 en tarjetas no vistas (`test_id`) con intervalo de confianza por cluster-bootstrap, y para la misma metrica en la plantilla `test_shift`, pero los valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es un clasificador scikit-learn serializado con joblib y se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier consumer GPU y en CPU convencional; el coste dominante es la capa de OCR y el modelo de embeddings MiniLM-L6-v2, no el clasificador.
- Opciones de despliegue: carga directa con `joblib.load` en Python; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XMSB evidence-consistency probe | Clasificador tabular (regresion logistica) | no disponible | no aplica | MIT | Hugging Face |
| Jueces multimodales (p. ej. modelos vision-language) | VLM | no disponible | no disponible | variable | no disponible |
| Clasificadores de NLI / consistencia textual | Transformer encoder | no disponible | no disponible | variable | no disponible |

No se dispone de datos comparativos de rendimiento entre este modelo y alternativas en la informacion proporcionada. La comparativa se limita a categoria y licencia.

## Limitaciones y advertencias

- Atado al esquema documental XMSB: cinco familias y vocabularios cerrados de campo y valor; no generaliza a otros formatos de documento.
- Hereda todos los errores del OCR; el lector liberado obtiene ~92 % de recall exacto campo-valor en renders limpios y mucho menos en condicion degradada.
- Entrenado sobre 1.440 elementos sinteticos; es una linea base, no un detector general.
- Probabilidades calibradas con calibracion sigmoide sobre 3 folds; no deben interpretarse como garantias fuera de esta distribucion.
- No es un clasificador de seguridad ni un modelo vision-language; no debe usarse como sustituto de un juez multimodal.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la salida probabilistica puede ser erronea fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no disponibles.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias de rendimiento fuera del benchmark.
- En produccion, requiere mantener sincronizados el esquema de campos, la capa de OCR y el modelo de embeddings MiniLM-L6-v2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fahadhafeezofficial/xmsb-evidence-probe
- Dataset XMSB: https://huggingface.co/datasets/fahadhafeezofficial/xmsb-evidence-consistency
- Codigo, tests y fuente del paper: acompanan a la release (referenciados en la model card; no se proporciona URL directa)
- Script de ejemplo: `example.py` en el repositorio del modelo
