# meltingfeet/backup2026-11-02-mradermacher-Ektome-Qwen3.6-35B-A3B-PristinelyUncensored-GGUF

## Resumen

Ektome-Qwen3.6-35B-A3B-PristinelyUncensored es un modelo de lenguaje de tipo mezcla de expertos (MoE) derivado de la familia Qwen3.6, con 35.505.251.456 parametros totales y aproximadamente 3.000 millones de parametros activos por token (la designacion A3B del nombre). El modelo original fue publicado por Zynerji y esta etiquetado como "abliterated", "uncensored" y "pristinely-uncensored", terminos que indican que se ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones para eliminar comportamientos de negativa, sin un reentrenamiento supervisado adicional (de ahi las etiquetas "no-finetuning" y "no-training").

La version aqui descrita es una cuantizacion GGUF publicada por el usuario meltingfeet bajo un nombre que sugiere una copia de seguridad fechada (backup2026-11-02). El repositorio ocupa 244,4 GB, lo que refleja que contiene multiples niveles de cuantizacion del modelo completo, y esta marcado como acceso restringido (gated) en Hugging Face, por lo que es necesario aceptar condiciones antes de descargarlo. La licencia declarada es Apache 2.0 y el unico idioma listado en los metadatos es el ingles.

Su relevancia es acotada pero clara: se trata de un ejemplo de la practica de "abliteration" aplicada a un modelo MoE moderno con capacidad vision-lenguaje (segun los tags), empaquetado en GGUF para inferencia local. Resulta de interes para investigadores que estudian alineamiento, refusal behavior y tecnicas de modificacion de pesos, mas que para despliegues de produccion convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), vision-lenguaje segun tags; detalles de capas y configuracion no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (inferido de la designacion A3B; cifra exacta no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (multiples niveles en el repo; lista exacta de quants no disponible) |
| Idiomas soportados | Ingles (unico idioma declarado en metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizacion); el modelo base se distribuye presumiblemente en safetensors |
| Acceso | Restringido (gated) en Hugging Face |
| Tamano del repositorio | 244,4 GB |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio: se trata de un transformer con mezcla de expertos (MoE), con 35.505 millones de parametros totales y aproximadamente 3.000 millones activos por token, y con capacidades de vision-lenguaje segun los tags. El modelo base es Zynerji/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored, a su vez derivado de la familia Qwen3.6.

El rasgo tecnico definitorio es la "abliteration": una modificacion post-entrenamiento que identifica y resta la direccion de activacion asociada al rechazo de peticiones, de modo que el modelo deja de producir negativas ante contenido que el modelo original rechazaria. Las etiquetas "no-finetuning" y "no-training" indican que este proceso se aplico sin un ciclo adicional de ajuste supervisado ni RLHF/DPO despues de la ablacion. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni detalles del proceso de alineamiento original de Qwen3.6 en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag "conversational".
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.6 (sin datos especificos de rendimiento disponibles).
- Capacidades de vision-lenguaje declaradas en los tags del repositorio.
- Comportamiento sin rechazo ("uncensored"): el modelo no aplica las negativas tipicas del modelo alineado original ante peticiones sensibles.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue mediante APIs compatibles.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Multilingue: limitado al ingles segun los metadatos.

## Casos de uso

- Investigacion sobre alineamiento y refusal behavior: el modelo permite estudiar como la ablacion de direcciones de activacion afecta a la distribucion de respuestas y a las metricas de seguridad, comparando directamente contra el modelo base sin modificar.
- Evaluacion de robustez de filtros de contenido: util para probar sistemas de moderacion y clasificadores de seguridad frente a un modelo deliberadamente sin rechazo, en entornos de laboratorio controlados.
- Inferencia local en hardware de consumo: al ser un MoE con unos 3.000 millones de parametros activos y estar disponible en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con GPU de gama alta para consumidor, con un coste computacional por token muy inferior al de un modelo denso de 35B.
- Experimentacion con modelos vision-lenguaje en local: los tags indican capacidad multimodal, lo que permite prototipar pipelines de descripcion de imagenes o extraccion de informacion de documentos sin depender de APIs externas.
- Analisis de sesgos y comportamiento en ingles: al estar limitado al ingles, sirve para estudios comparativos de sesgo linguistico en modelos derivados de Qwen.
- Docencia y divulgacion tecnica: como ejemplo practico de cuantizacion GGUF, mezcla de expertos y tecnicas de modificacion de pesos en cursos de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no conocerse los niveles exactos de cuantizacion incluidos. Como referencia orientativa para un MoE de 35B totales, las cuantizaciones de 4 bits suelen requerir del orden de 18-22 GB y las de 8 bits del orden de 35-40 GB, aunque estas cifras no estan confirmadas para este repositorio concreto.
- GPU recomendadas: para cuantizaciones altas, A100 80 GB o H100; para cuantizaciones de 4 bits, RTX 4090 (24 GB) o RTX 3090 podrian ser suficientes, condicionado al tamano real de los ficheros GGUF.
- Cabe en GPU de consumo: probablemente si en cuantizaciones bajas con RTX 4090 o 3090, dado el bajo numero de parametros activos; no confirmado.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag "endpoints_compatible" sugiere soporte en plataformas de inferencia con API. vLLM y TGI no estan confirmados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Ektome-Qwen3.6-35B-A3B-PristinelyUncensored (GGUF) | 35,5B totales / ~3B activos | No disponible | Apache 2.0 | Gated | Abliterated, vision-lenguaje, solo ingles |
| Modelo base Zynerji/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored | 35,5B totales / ~3B activos | No disponible | Apache 2.0 | No disponible | Version sin cuantizar del mismo modelo |
| Familia Qwen3.6 35B-A3B original | 35B totales / ~3B activos | No disponible | No disponible | No disponible | Modelo alineado de referencia, con rechazo activo |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar el comportamiento de rechazo; puede generar contenido danino, ilegal o sensible sin filtros, lo que exige supervisión humana y medidas de seguridad adicionales en cualquier uso.
- Riesgo elevado de alucinacion y de respuestas factualmente incorrectas, agravado por la ausencia de datos de evaluacion publicados.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Longitud de contexto desconocida, lo que impide planificar cargas con documentos largos.
- Acceso restringido en Hugging Face: requiere aceptar condiciones, lo que puede limitar la automatizacion de descargas.
- El repositorio es una copia de seguridad de terceros (meltingfeet) de un modelo de otro autor (Zynerji); no hay garantia de mantenimiento, actualizacion ni integridad a largo plazo.
- Aunque la licencia declarada es Apache 2.0, el uso comercial de un modelo abliterated puede entrar en conflicto con las politicas de las plataformas de despliegue y con la normativa aplicable sobre contenido.
- El modelo base Qwen3.6 puede tener sus propias condiciones de uso que conviene verificar antes de un despliegue en produccion.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/meltingfeet/backup2026-11-02-mradermacher-Ektome-Qwen3.6-35B-A3B-PristinelyUncensored-GGUF
- Modelo base: https://huggingface.co/Zynerji/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored
