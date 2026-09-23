# iskra-chat/phi-3.5-mini-onnx

## Resumen

iskra-chat/phi-3.5-mini-onnx es una exportación a formato ONNX en precisión fp16 del modelo microsoft/Phi-3.5-mini-instruct, publicada por el equipo de Iskra.Chat. El repositorio contiene un grafo con caché KV (`model_fp16.onnx` más su fichero de datos externo `model_fp16.onnx.data`), pesos en media precisión (fp16), entradas y salidas en fp32, y el tokenizer original sin modificaciones. La licencia MIT del modelo base se mantiene en esta conversión.

El problema concreto que resuelve es de cadena de herramientas, no de capacidades: Microsoft solo publica ONNX de esta familia en int4-awq, es decir, con pesos ya cuantizados a enteros y escalas de calibración propias. Ese artefacto no se puede recuantizar para otro acelerador, porque la calibración no tiene margen de trabajo. Este repositorio ofrece un punto de entrada en coma flotante desde el que se puede reiniciar el proceso de cuantización y calibración para el hardware objetivo (NPU, GPU con DirectML o TensorRT, CPU, etc.). El autor lo mantiene para Iskra.Chat, un cliente nativo de Matrix con procesamiento local de voz y texto.

El modelo base subyacente es un transformer decoder-only denso de aproximadamente 3,8 mil millones de parámetros con una ventana de contexto declarada de 128 000 tokens, licencia MIT y publicación por parte de Microsoft en 2024. El repositorio de la exportación ocupa 7,6 GB y, en el momento de redactar esta ficha, registra 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad.

## Especificaciones técnicas

Nota: los valores marcados como "modelo base" proceden de la documentación pública de microsoft/Phi-3.5-mini-instruct y no de la información específica de este repositorio, que solo detalla el formato de exportación.

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base); artefacto en formato ONNX |
| Parámetros totales | 3,8 mil millones (modelo base) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128 000 tokens (modelo base) |
| Tipos de cuantización | fp16 en este repositorio; el modelo base se distribuye en safetensors y Microsoft publica una conversión ONNX int4-awq. No se incluyen ficheros GGUF ni int8 en este repositorio |
| Idiomas soportados | No disponible en la información proporcionada (los metadatos de HuggingFace indican "no disponibles"); el modelo base declara soporte multilingüe limitado con predominio del inglés |
| Licencia | MIT, heredada del modelo base |
| Formato de pesos | ONNX (`model_fp16.onnx` + `model_fp16.onnx.data`); tokenizer `tokenizer.json` y ficheros auxiliares sin cambios respecto al original |
| Precisión de pesos / E-S | Pesos fp16; entradas y salidas fp32 |
| Caché KV | Sí, incluida en el grafo |
| Tamaño del repositorio | 7,6 GB |
| Modelo base | microsoft/Phi-3.5-mini-instruct |
| Autor | iskra-chat |

## Arquitectura y entrenamiento

El artefacto de este repositorio no es un modelo nuevo: es un grafo ONNX con caché KV generado a partir de `microsoft/Phi-3.5-mini-instruct`. La conversión conserva el tokenizer original y reduce los pesos a fp16 para rebajar el tamaño (los 7,6 GB del repositorio son coherentes con 3,8 e9 parámetros a 2 bytes por peso), mientras que las entradas y salidas del grafo permanecen en fp32 para evitar pérdidas de precisión en las operaciones de frontera. La decisión de diseño documentada por el autor es deliberada: frente al ONNX int4-awq oficial, este fichero parte de pesos en coma flotante y permite recalibrar y recuantizar para un acelerador distinto.

Respecto al modelo base, la información proporcionada no incluye detalles de entrenamiento. Según la documentación pública de Microsoft, Phi-3.5-mini-instruct es un transformer decoder-only de 32 capas, dimensión oculta 3072, dimensión intermedia 8192 y 32 cabezas de atención con 32 cabezas KV (atención multi-cabeza clásica, sin GQA), entrenado sobre del orden de 3,4 billones de tokens de datos web filtrados y datos sintéticos, con un post-entrenamiento que incluye ajuste supervisado, DPO y PPO. No consta en la información disponible ninguna innovación técnica específica de esta exportación más allá de la inclusión de la caché KV en el grafo y el uso de fp16 con E/S fp32.

## Capacidades

- Generación de texto instructivo: diálogo multi-turno, resumen, reescritura y respuesta a preguntas, siguiendo el formato de chat del modelo base.
- Razonamiento y matemáticas de nivel medio: el modelo base está entrenado explícitamente con datos sintéticos orientados a razonamiento (no se han verificado cifras concretas en la información disponible).
- Generación de código: capacidad declarada del modelo base por su entrenamiento; no verificada en esta exportación.
- Contexto largo: la ventana declarada de 128 000 tokens permite procesar documentos extensos, siempre que la memoria disponible para la caché KV lo permita.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el modelo base no documenta un formato nativo de agentes en la información disponible.
- Capacidades multilingües: limitadas y no declaradas en los metadatos del repositorio; el modelo base se orienta principalmente al inglés.
- Capacidades especiales: no incluye visión, audio ni modo de pensamiento explícito. Solo texto.
- Ejecución local: al ser ONNX, puede desplegarse con ONNX Runtime en CPU, GPU y aceleradores compatibles sin depender del ecosistema PyTorch.

## Casos de uso

- Cliente de mensajería con inferencia local: el escenario de origen del autor, Iskra.Chat (cliente Matrix), usa este artefacto para procesar texto y voz en el propio dispositivo. La exportación ONNX evita dependencias de Python y facilita el empaquetado en una aplicación de escritorio o móvil.
- Recuantización para aceleradores específicos: punto de partida para calibrar y generar variantes int8, int4 o formatos propietarios de NPU (por ejemplo, mediante herramientas de optimización de ONNX). Es el caso de uso central documentado por el autor.
- Procesamiento de voz a texto con posprocesado: en un pipeline local de transcripción, el modelo puede encargarse de puntuar, resumir o reformatear la transcripción; su ventana de contexto amplia permite procesar reuniones largas en una sola pasada si la VRAM lo permite.
- Extracción de información en documentos largos: análisis de contratos, informes o expedientes con contexto extenso para extraer entidades, cláusulas o datos estructurados, manteniendo el contenido dentro de la infraestructura propia.
- Asistente de redacción sin conexión: aplicación de escritorio que funciona sin red, útil en entornos con requisitos de confidencialidad o con conectividad limitada.
- Moderación y clasificación de contenido en el borde: clasificación de mensajes y etiquetado temático en el propio dispositivo, con coste marginal cero por petición una vez desplegado.
- Evaluación y pruebas en CI: al ser un artefacto ONNX determinista y autocontenido, puede integrarse en pipelines de integración continua para validar regresiones de prompts o de plantillas sin depender de servicios externos.
- Prototipado de producto sin GPU de centro de datos: permite validar una idea de producto en un portátil con GPU de consumo antes de escalar a infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de calidad (MMLU, HumanEval, GSM8K u otras), ni mediciones de latencia, throughput o consumo de memoria de esta exportación concreta. Tampoco se han encontrado resultados en los resultados de búsqueda web, que no guardan relación con el modelo. Cualquier cifra que se quiera usar para comparar debe obtenerse midiendo este artefacto directamente con el runtime y el hardware objetivos.

## Requisitos de hardware

- Pesos en fp16: aproximadamente 7,6 GB, coherente con el tamaño del repositorio. Hay que descargar tanto `model_fp16.onnx` como `model_fp16.onnx.data`.
- Caché KV: estimación a partir de la arquitectura del modelo base (32 capas, 32 cabezas KV, dimensión de cabeza 96, fp16): unos 0,375 MiB por token. Esto supone aproximadamente 0,75 GB para 2 000 tokens, 3 GB para 8 000 tokens, 12 GB para 32 000 tokens y unos 48 GB para los 128 000 tokens completos. Son estimaciones, no mediciones de esta exportación.
- VRAM total estimada: en torno a 9-10 GB para contexto corto (2K) incluyendo pesos y sobrecarga del runtime; 12-14 GB para contexto medio (8K); a partir de 32K se necesitan tarjetas de 24 GB o más.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para fp16 con contexto medio; A100 40/80 GB o H100 para explotar la ventana completa de 128K; RTX 3060 12 GB o RTX 4060 Ti 16 GB para contexto corto en fp16 o contexto medio tras cuantización.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o más con contexto reducido; por debajo de 8 GB de VRAM es necesario cuantizar a int8 o int4, algo que esta exportación está pensada precisamente para facilitar.
- Opciones de despliegue: ONNX Runtime con execution providers de CPU, CUDA, TensorRT o DirectML; herramientas de optimización y cuantización de ONNX para generar variantes específicas. No es compatible de forma directa con vLLM ni con TGI, que no cargan grafos ONNX; para llama.cpp u Ollama habría que convertir previamente a GGUF, algo que este repositorio no incluye.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentación pública y no de la información proporcionada en esta búsqueda.

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| iskra-chat/phi-3.5-mini-onnx | 3,8 e9 (base) | 128 000 tokens (base) | MIT | ONNX fp16 con caché KV | Exportación sin métricas ni validación comunitaria (0 descargas) |
| microsoft/Phi-3.5-mini-instruct | 3,8 e9 | 128 000 tokens | MIT | Safetensors; ONNX int4-awq oficial | Modelo de referencia; el ONNX oficial no permite recuantizar |
| Llama-3.2-3B-Instruct | 3,2 e9 | 128 000 tokens | Licencia comunitaria de Llama 3.2 | Safetensors; exportaciones de la comunidad no verificadas | Licencia con condiciones de uso y cláusulas adicionales, menos permisiva que MIT |
| Qwen2.5-3B-Instruct | 3,1 e9 | 32 768 tokens | Apache 2.0 | Safetensors; exportaciones de la comunidad no verificadas | Contexto notablemente menor; licencia permisiva |
| Gemma-2-2B-it | 2,6 e9 | 8 192 tokens | Términos de uso de Gemma | Safetensors; exportaciones de la comunidad no verificadas | El contexto más corto del grupo; licencia con restricciones de uso |

No se dispone de comparaciones de rendimiento medidas entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de validación comunitaria: 0 descargas y 0 likes. No hay evidencia pública de que el grafo funcione correctamente en producción más allá de lo que afirma el autor.
- Model card en ruso: la documentación del repositorio está redactada en ruso, lo que puede dificultar su revisión por parte de equipos que no dominen el idioma. La información sobre el modelo es muy escueta.
- Sin ficheros GGUF ni safetensors: solo se distribuye el grafo ONNX. Los usuarios de llama.cpp, Ollama o vLLM tendrán que convertir el modelo o buscar otra fuente.
- E/S en fp32 con pesos fp16: puede implicar conversiones adicionales en algunos execution providers y afectar ligeramente al rendimiento o a la precisión numérica. Conviene verificar la paridad de salidas frente al modelo original.
- Sin métricas de calidad ni de rendimiento: no se han publicado evaluaciones de precisión tras la conversión, ni latencias, ni consumo real de memoria.
- Herencia del modelo base: sesgos, alucinaciones y limitaciones de razonamiento del modelo original se mantienen intactos. El modelo base está orientado a instrucciones en inglés y su rendimiento decae fuera de ese idioma.
- Contexto efectivo: aunque se declaran 128 000 tokens, en la práctica la calidad suele degradarse en contextos muy largos y el coste de memoria de la caché KV (decenas de GB) hace inviable esa ventana en hardware de consumo.
- Licencia MIT: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la licencia. Es una licencia permisiva, sin cláusulas de uso aceptable adicionales, lo que traslada al integrador la responsabilidad sobre los usos.
- Dependencia de la cadena de herramientas ONNX: versiones distintas de ONNX Runtime o de los execution providers pueden comportarse de forma diferente con este grafo. Fijar versiones es recomendable en producción.
- Repositorio grande para el tipo de artefacto: 7,6 GB, con un fichero de datos externo que debe descargarse junto al grafo para que el modelo cargue.

## Enlaces

- Repositorio de la exportación: https://huggingface.co/iskra-chat/phi-3.5-mini-onnx
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Conversión ONNX oficial int4-awq de Microsoft: mencionada en la model card del autor, sin URL directa disponible en la información proporcionada
- No se han encontrado otros enlaces relevantes en la búsqueda web: los resultados obtenidos corresponden a páginas de ayuda de YouTube TV y a hilos de foros sin relación con el modelo. No hay papers, blogs ni demos adicionales disponibles en la información proporcionada.
