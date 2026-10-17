# Roy1361/halo-ai

## Resumen

Halo AI v4.1 es un ajuste fino del modelo Qwen/Qwen3.5-4B publicado por el usuario Roy1361 en Hugging Face. Se trata de un modelo especializado en la lectura e interpretacion de lineas de tickets de compra de supermercado: a partir de cada linea del recibo, el modelo extrae el nombre llano del alimento, el termino exacto tal como aparece en la tienda alemana, una categoria y el numero de dias que el producto se conserva. El modelo se distribuye ya cuantizado a 4 bits en formato MLX, con el objetivo declarado de ejecutarse en local sobre un iPhone como motor de la aplicacion Halo.

El modelo hereda la arquitectura y el conocimiento general del Qwen3.5-4B, un transformer denso de aproximadamente 4.205 millones de parametros (4,2 B). Su valor no reside en capacidades generalistas, sino en la especializacion vertical: es un extractor estructurado de informacion de recibos, no un asistente conversacional de proposito general. Esta orientado a inferencia en el dispositivo, lo que lo hace relevante para aplicaciones moviles que necesitan procesar datos sensibles (tickets, historial de compra) sin enviarlos a la nube.

La relevancia actual del modelo radica en la combinacion de tres factores: un tamano que cabe en memoria de movil, una cuantizacion 4-bit optimizada para el stack MLX de Apple y una licencia Apache-2.0 que permite uso comercial. No obstante, la model card es muy escueta, no se declaran idiomas soportados ni resultados de evaluacion, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-4B, transformer denso) |
| Parametros totales | 4.205.751.296 (aprox. 4,2 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria MLX) |
| Tamano del repositorio | 4,8 GB |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el procedimiento de ajuste fino en la model card publicada. Lo unico declarado es que se parte de Qwen/Qwen3.5-4B (licencia Apache-2.0) y que el resultado se distribuye en una cuantizacion 4-bit para el stack MLX de Apple. No se especifican el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si se emplearon tecnicas de alineacion como RLHF, DPO o SFT supervisado.

La innovacion tecnica destacable no es arquitectonica, sino de despliegue: el modelo esta empaquetado para inferencia en dispositivo con MLX, lo que permite ejecutar un modelo de 4,2 B en un iPhone. La tarea objetivo es una extraccion estructurada de cuatro campos por linea de ticket (nombre llano del alimento, termino aleman de tienda, categoria y dias de conservacion), planteada como generacion de texto condicionada a la linea del recibo.

## Capacidades

- Generacion de texto especializada en la extraccion de informacion a partir de lineas de tickets de compra.
- Mapeo de terminos de supermercado alemanes a nombres llanos de alimentos.
- Clasificacion de productos en categorias.
- Estimacion de la vida util de un producto en dias.
- Ejecucion en dispositivo (on-device) mediante MLX en hardware Apple Silicon.
- Inferencia en cuantizacion 4 bits con pesos safetensors.
- Capacidades de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (la tarea descrita trabaja con terminos alemanes, pero no se declaran idiomas soportados).
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Digitalizacion de tickets de supermercado en una app movil: el modelo consume cada linea del recibo y devuelve el nombre llano del producto, su categoria y su vida util, lo que permite construir un historial de compra estructurado sin salir del dispositivo.
- Normalizacion de catalogos de supermercado aleman: convertir los terminos abreviados o propios de cada cadena (por ejemplo, palabras de tienda) en nombres de alimento estandarizados y comparables entre comercios.
- Gestion de despensa y caducidad: a partir de la vida util estimada por el modelo, la aplicacion puede generar avisos de consumo preferente y sugerencias de recetas con productos proximos a caducar.
- Analisis de gasto por categoria: la clasificacion en categorias permite agregar el gasto del usuario y presentar desgloses por tipo de producto dentro de la app.
- Procesamiento privado de datos de compra: al ejecutarse en el iPhone con MLX, evita enviar informacion de consumo personal a servidores externos, lo que reduce el riesgo de privacidad y los costes de infraestructura.
- Prototipado de asistentes de compra offline: base para funcionalidades de recomendacion y planificacion de la compra que funcionan sin conexion, apoyandose en el historial extraido de los recibos.
- Etiquetado automatico de datos para entrenamiento posterior: uso del modelo como anotador para generar conjuntos de datos estructurados a partir de recibos sin etiquetar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano de pesos en 4 bits: aproximadamente 2,1 GB (4,2 B de parametros a 0,5 bytes por parametro), mas memoria adicional para activaciones y estado de inferencia.
- Tamano total del repositorio: 4,8 GB, que puede incluir los pesos 4-bit y otros artefactos.
- Hardware objetivo declarado: iPhone con soporte para MLX (hardware Apple Silicon).
- GPU recomendadas: no disponible en la informacion proporcionada; el formato MLX esta pensado para el ecosistema Apple Silicon (chips M-series y A-series recientes).
- Compatibilidad con GPU de consumidor tipo NVIDIA RTX 4090: no disponible; el formato de pesos es MLX, no GGUF ni safetensors para transformers convencionales.
- Opciones de despliegue: MLX (libreria declarada en el repositorio). Otros entornos como vLLM, llama.cpp, Ollama o TGI no estan declarados como soportados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto de alternativas comparables en la informacion proporcionada. La unica referencia es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Roy1361/halo-ai | 4,2 B | no disponible | Apache-2.0 | safetensors (MLX, 4 bits) | Ajuste especializado en tickets de supermercado, orientado a iPhone |
| Qwen/Qwen3.5-4B (modelo base) | aprox. 4 B | no disponible | Apache-2.0 | no disponible | Modelo generalista del que deriva halo-ai |

No se dispone de informacion sobre otros modelos comparables de la misma categoria o tamano.

## Limitaciones y advertencias

- La model card es muy escueta: no se documentan el dataset de entrenamiento ni el proceso de ajuste, lo que dificulta evaluar su robustez.
- No se declaran idiomas soportados; la tarea descrita opera con terminos de supermercado alemanes, por lo que su utilidad fuera de ese contexto linguistico es incierta.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia cuantitativa de su precision en la extraccion de campos.
- No se especifica la longitud de contexto, dato critico para procesar recibos largos o conversaciones multi-turno.
- Riesgo de alucinacion: al ser un modelo generativo aplicado a extraccion estructurada, puede inventar categorias, nombres de producto o dias de conservacion cuando la linea del ticket es ambigua o esta mal transcrita (OCR defectuoso).
- Dependencia del OCR previo: la calidad de la extraccion depende de la calidad del texto de entrada procedente del reconocimiento optico de caracteres del recibo.
- Repositorio sin descargas ni interacciones en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones aplicables al modelo base Qwen3.5-4B y a los datos de entrenamiento del ajuste.
- Formato MLX: su despliegue esta limitado al ecosistema Apple; no es directamente portable a stacks de servidor convencionales sin conversion.
- Uso en produccion: al no haber evaluacion publica ni versionado de calidad documentado, se recomienda validar con datos propios antes de integrarlo en un flujo critico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Roy1361/halo-ai
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
