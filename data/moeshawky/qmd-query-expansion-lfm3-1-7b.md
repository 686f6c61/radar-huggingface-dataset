# moeshawky/qmd-query-expansion-LFM3-1.7B

## Resumen

QMD Query Expansion LFM3 1.7B es un adaptador LoRA (PEFT) publicado por el usuario moeshawky sobre el modelo base LFM3 de 1.700 millones de parametros. Su proposito es la expansion de consultas (query expansion): dada una consulta de busqueda breve, el modelo genera variantes ampliadas que mejoran la recuperacion en sistemas de busqueda y RAG. El adaptador se ha entrenado mediante SFT (supervised fine-tuning) y se distribuye en formato safetensors con la libreria PEFT.

El modelo hereda la arquitectura del LFM3 (Liquid Foundation Model 3) de 1.7B, un transformer compacto orientado a generacion de texto conversacional. El adaptador anade la tarea especifica de expansion de consultas sin modificar el numero de parametros del modelo base, lo que permite cargarlo sobre la version original con un coste adicional minimo de almacenamiento (el repositorio ocupa 0,3 GB).

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, acceso restringido (gated) y publicado en noviembre de 2026. No dispone de documentacion tecnica publica ni de resultados de benchmarks, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM3 1.7B) + adaptador LoRA via PEFT |
| Parametros totales | 1.700 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors del adaptador) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado mediante SFT sobre el modelo base LFM3 de 1.7B. La arquitectura subyacente es la del LFM3, un transformer de 1.700 millones de parametros; el adaptador no altera la topologia del modelo base, sino que anade matrices de bajo rango en las capas seleccionadas. El repositorio ocupa 0,3 GB, coherente con un adaptador de bajo rango mas los ficheros de configuracion de PEFT.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de SFT, ni sobre si se aplicaron tecnicas de RLHF o DPO. La tarea declarada en los tags es `query-expansion`, enmarcada en el dominio `qmd`, lo que sugiere un dataset especifico de expansion de consultas de busqueda. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Generacion de texto conversacional, heredada del modelo base LFM3.
- Expansion de consultas de busqueda: genera variantes ampliadas de una consulta breve para mejorar el recall en recuperacion.
- Integracion con pipelines de PEFT: se carga como adaptador sobre el modelo base mediante la libreria `peft`.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Expansion de consultas en motores de busqueda internos: el adaptador recibe una consulta corta del usuario y genera sinonimos y reformulaciones que se lanzan contra el indice, aumentando el recall en busquedas con vocabulario limitado.
- Preprocesado en pipelines RAG: antes de la recuperacion vectorial, el modelo expande la pregunta del usuario para cubrir variantes terminologicas y reducir fallos por desajuste lexico entre consulta y documentos.
- Busqueda en bases documentales tecnicas: en entornos donde los usuarios emplean jerga o abreviaturas, la expansion genera terminos completos y equivalentes que el retriever puede emparejar.
- Mejora de sistemas de autocompletado: el adaptador puede generar expansiones de la consulta parcial para sugerir busquedas alternativas al usuario.
- Normalizacion de consultas en analitica de busqueda: agrupar consultas equivalentes bajo una forma expandida comun para agregar metricas de uso y detectar tendencias.
- Experimentacion academica en recuperacion de informacion: al ser un adaptador pequeno y con licencia MIT, sirve como punto de partida para fine-tuning adicional en dominios especificos de busqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.7B en FP16 requiere aproximadamente 3,4 GB solo para pesos; en cuantizacion de 8 bits, en torno a 1,7-2 GB; en 4 bits, alrededor de 1-1,5 GB. El adaptador LoRA anade un consumo marginal.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo base en FP16 con margen; una RTX 3060 de 12 GB o superior es suficiente.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060 Ti, RTX 4070 o superiores, siempre que se disponga del modelo base LFM3.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` + `peft`. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa (no documentada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QMD Query Expansion LFM3 1.7B | 1.7B (base) + LoRA | no disponible | Expansion de consultas | MIT | Gated en HuggingFace, 0 descargas |
| Modelo base LFM3 1.7B | 1.7B | no disponible en esta ficha | Generacion de texto general | no disponible en esta ficha | no disponible en esta ficha |
| Alternativas de expansion de consultas | no disponible | no disponible | Expansion de consultas | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas especificas de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar el modelo.
- Sin documentacion tecnica publica: no hay model card detallada, dataset de entrenamiento ni resultados de evaluacion.
- Solo ingles: los metadatos declaran unicamente el idioma `en`, por lo que su uso en castellano no esta soportado.
- Riesgo de alucinacion: como todo modelo generativo, puede producir expansiones de consulta irrelevantes o inventadas que degraden la recuperacion.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere descargar y cargar el LFM3 1.7B, cuyos terminos de licencia deben verificarse por separado.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion.
- Fecha de publicacion futura (noviembre de 2026): conviene verificar la vigencia y el estado del repositorio antes de integrarlo.
- Licencia MIT declarada: permite uso comercial, pero al ser un adaptador sobre un modelo base de terceros, la licencia efectiva depende de la del LFM3.

## Enlaces

- HuggingFace: https://huggingface.co/moeshawky/qmd-query-expansion-LFM3-1.7B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
