# JasonYANG170/Qwen2.5-0.5B-Instruct-ONNX

## Resumen

Qwen2.5-0.5B-Instruct-ONNX es una conversión a formato ONNX del modelo Qwen2.5-0.5B-Instruct, publicada por el usuario JasonYANG170. No incorpora ningún ajuste fino: se trata de un reempaquetado de los pesos originales (revisión `7ae557604adf67be50417f59c2c2f167def9a775`) para que puedan ejecutarse directamente en el navegador o en Node mediante Transformers.js. El repositorio ocupa 3,8 GB e incluye las variantes fp32 y fp16, además de los scripts de exportación, cuantización y validación numérica.

La relevancia de esta ficha es práctica más que algorítmica: demuestra un flujo reproducible de exportación ONNX con verificación numérica explícita. El autor publica la similitud coseno de cada variante frente al FP32 original y descarta las cuantizaciones que no superan sus umbrales (INT8 dinámico y las variantes Q4, incluida una HQQ de precisión mixta). Es un ejemplo poco habitual de publicación con criterio de rechazo documentado.

En cuanto a capacidad, conviene ser claro: se trata de un modelo denso de aproximadamente 0,5 B de parámetros, orientado a generación de texto conversacional ligera. Su valor está en el despliegue en cliente (WebGPU, WASM o CPU) sin servidor, no en tareas de razonamiento complejo. El repositorio solo declara validación en chino y no publica ningún benchmark de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5), según la documentación del modelo base. La conversión no modifica la arquitectura |
| Parametros totales | 0,5 B (denominación del modelo base Qwen2.5-0.5B-Instruct; el repositorio de conversión no publica el recuento exacto) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No indicada en el repositorio de conversión. La documentación del modelo base declara 32 768 tokens; no verificado en esta ficha |
| Tipos de cuantizacion | fp32 y fp16 publicados. INT8/Q8 omitido (la cuantización dinámica probada no pasó los controles numéricos). Q4 y q4f16 omitidos (no alcanzaron el umbral de coseno 0,98) |
| Idiomas soportados | El repositorio declara únicamente `zh` (chino). La validación numérica se hizo con seis entradas en chino de longitudes distintas. El modelo base se distribuye como multilingüe, pero esta conversión no aporta validación en otros idiomas |
| Licencia | apache-2.0 (los pesos conservan la licencia del modelo base; la conversión no la altera) |
| Formato de pesos | ONNX (`onnx/model.onnx` + `onnx/model.onnx_data`). Plantilla de chat original de Qwen embebida en `tokenizer_config.json` |
| Tamano del repositorio | 3,8 GB |
| Libreria de despliegue | transformers.js (probado con la versión 4.0.1) |
| Backends soportados | WebGPU (`device: 'webgpu'`), WASM (`device: 'wasm'`, fp32) y CPU nativa en Node (`device: 'cpu'`) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Revision de origen | `7ae557604adf67be50417f59c2c2f167def9a775` |
| Fecha de creacion / actualizacion | 14 de septiembre de 2026 (misma fecha en ambos campos, según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Esta publicación no entrena ningún modelo. Es una exportación a ONNX de un checkpoint ya existente, sin ajuste fino posterior, del Qwen2.5-0.5B-Instruct. Por tanto, la arquitectura es la del modelo base (transformer decoder-only denso de la familia Qwen2.5, con atención causal) y los detalles de entrenamiento —número de tokens, composición del dataset, fases de ajuste por instrucciones y alineación— no se detallan en el repositorio: el autor remite al fichero `UPSTREAM_README.md`, que conserva la documentación original de Qwen. Toda cifra sobre preentrenamiento o postentrenamiento debe consultarse ahí, no en esta ficha.

Lo técnicamente reseñable está en el proceso de conversión y su verificación. El autor exporta dos variantes de precisión (fp32 y fp16), configura los tipos del KV-cache por cada `dtype` y publica la similitud coseno mínima frente al FP32 original sobre seis entradas en chino de longitudes diferentes. Los umbrales fijados fueron 0,999 para fp32/fp16 y 0,98 para las variantes cuantizadas. Los informes incluyen error absoluto máximo y, en generación, coincidencia de siguiente token. El autor advierte explícitamente de que la similitud de salida no establece corrección factual.

El intento con Q4 merece mención aparte. Se evaluaron cuantización por bloques ordinaria y HQQ; la variante final (HQQ selectivo, bloques de peso de 4 bits con tamaño 16, manteniendo en punto flotante las proyecciones *down*, la primera y la última capa y la cabeza de salida, además de los embeddings) quedó en aproximadamente 0,9729 de coseno en una de las seis entradas, por debajo del umbral de 0,98. Los ficheros q4 (≈1825 MB) y q4f16 (≈979 MB) existen pero se omitieron de la publicación. Los ficheros no serían uniformemente de 4 bits: son de precisión mixta. La trazabilidad se cubre con `build-manifest.json` (versiones de paquetes y sumas SHA-256) y con los scripts `export_models.py` y `quantize_q4.py`.

## Capacidades

- Generación de texto conversacional: es la función principal del modelo base, con plantilla de chat de Qwen preservada en el tokenizador.
- Respuesta a instrucciones de formato corto: reescritura, resumen breve, clasificación de texto y extracción simple de campos en entradas de baja complejidad.
- Ejecución en cliente: inferencia en navegador vía WebGPU o WASM, y en Node sobre CPU, sin necesidad de servidor.
- Idiomas: validado numéricamente solo en chino (seis entradas). El modelo base es multilingüe, pero esta conversión no documenta ni valida comportamiento en otros idiomas.
- Razonamiento multi-paso, matemáticas complejas y generación de código: no hay ninguna validación publicada en el repositorio para estas capacidades, y el tamaño del modelo (0,5 B) limita su fiabilidad.
- Tool calling / function calling: no verificado en esta conversión. No hay evidencia en la información disponible.
- Modo *thinking*, visión o audio: no soportado. Es un modelo exclusivamente de texto.
- Latencia y *throughput*: no medidos ni publicados. Solo se documenta el entorno de prueba (Transformers.js 4.0.1 y ONNX Runtime Node 1.24.3 con WebGPU nativo sobre una RTX 5080 Laptop).

## Casos de uso

- Asistente conversacional embebido en navegador sin backend: cargando la variante fp16 con `device: 'webgpu'`, el modelo se ejecuta íntegramente en el cliente. Es adecuado porque los pesos ocupan 1299,9 MB y no requieren infraestructura de servidor, lo que elimina coste por token y desplazamiento de datos.
- Funciones de privacidad por diseño: en aplicaciones donde el texto del usuario no puede salir del dispositivo (sanitario, legal interno, educación), la inferencia local con WASM o WebGPU evita cualquier envío a una API externa.
- Prototipado de pipelines Transformers.js: sirve como modelo de prueba para validar la integración, el manejo de `dtype`, la carga de `onnx/model.onnx_data` y la configuración del KV-cache antes de escalar a un modelo mayor de la misma familia con el mismo código.
- Clasificación y enrutado previo (*pre-routing*): usar el modelo para etiquetar la intención de una consulta y decidir si se responde con un modelo pequeño o se deriva a uno mayor. El coste computacional es mínimo al ejecutarse en cliente.
- Autocompletado y reescritura en editores web: sugerencias de continuación y reformulación de frases cortas en interfaces de escritura, con latencia aceptable al no haber salto de red.
- Aplicaciones de escritorio con Electron o Node: ejecución con `device: 'cpu'` y la variante fp32 o fp16, útil para herramientas ofimáticas o asistentes locales que deben funcionar sin conexión.
- Demostraciones educativas y docencia: el repositorio incluye informes de validación numérica y scripts reproducibles, lo que lo convierte en un material didáctico útil para explicar exportación ONNX, precisión de pesos y criterios de aceptación numérica.
- Chatbot de nicho en chino dentro de una web: dado que es el único idioma validado, encaja en interfaces orientadas a público chino con requisitos de despliegue ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación de calidad, y advierte expresamente de que la similitud de salida no establece corrección factual. La nota de búsqueda web utilizada no devolvió resultados relevantes sobre este modelo.

Lo único publicable son los datos de validación numérica incluidos en la model card:

| dtype | Tamano (grafo + pesos) | Coseno minimo de salida frente al FP32 original |
|---|---|---|
| fp32 | 2521,8 MB | 1,000000 |
| fp16 | 1299,9 MB | 0,999994 |

| Variante descartada | Tamano | Coseno minimo observado | Motivo del descarte |
|---|---|---|---|
| q4 (HQQ selectivo, precision mixta) | ≈1825 MB | ≈0,9729 en una de seis entradas | Por debajo del umbral 0,98 |
| q4f16 | ≈979 MB | No disponible en la información proporcionada | Mismo criterio de rechazo |
| INT8 / Q8 | No disponible | No disponible | La cuantización dinámica probada no superó los controles numéricos |

Estos valores proceden de seis entradas en chino de longitudes distintas y constituyen una prueba de humo numérica, no una evaluación de precisión ni de recuperación de información.

## Requisitos de hardware

- Peso de los ficheros: 2521,8 MB en fp32 y 1299,9 MB en fp16. El repositorio completo ocupa 3,8 GB porque incluye ambos conjuntos.
- VRAM estimada para inferencia: con fp16, el modelo cabe holgadamente en cualquier GPU con 2 GB libres; en fp32 requiere del orden de 3 GB. A estas cifras hay que sumar el KV-cache, cuyo tamaño crece de forma lineal con la longitud de contexto y con el número de secuencias concurrentes.
- GPU recomendadas: no hay una lista oficial. El autor probó fp16 en WebGPU con una RTX 5080 Laptop GPU. Cualquier GPU moderna con soporte WebGPU (serie RTX 20 o superior, Radeon RX 6000 o superior, Apple Silicon) es suficiente por tamaño de modelo.
- Cabe en GPU de consumo: sí, sin ninguna duda, en cualquier GPU de consumo de los últimos ocho años. También se ejecuta sin GPU, sobre WASM en navegador o CPU nativa en Node.
- Opciones de despliegue: Transformers.js 4.0.1 con WebGPU, WASM o CPU; ONNX Runtime (probado en Node con la versión 1.24.3 y WebGPU nativo). No hay evidencia de despliegue probado con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica medidas de tokens por segundo ni de tiempo de primera respuesta.
- Nota operativa: para importación offline hay que descargar el repositorio completo y mantener `onnx/model.onnx_data` junto a `onnx/model.onnx`. Un cliente en línea que fije `q8` no podrá cargar este repositorio, porque esa variante no está publicada. El runtime de navegador de EasyEDA no se probó directamente.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este repositorio. La comparación se limita a formato, tamaño, licencia y disponibilidad; las cifras de parámetros de las alternativas se indican como aproximadas y no proceden de la información proporcionada.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JasonYANG170/Qwen2.5-0.5B-Instruct-ONNX | 0,5 B | No disponible en el repositorio | ONNX fp32 / fp16 para Transformers.js | apache-2.0 | Publicado; 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen2.5-0.5B-Instruct (upstream) | 0,5 B | Según la documentación del modelo base, 32 768 tokens | safetensors (PyTorch) | apache-2.0 | Ampliamente distribuido; requiere runtime Python o conversión propia |
| Qwen/Qwen2.5-1.5B-Instruct | ≈1,5 B | No disponible en la información proporcionada | safetensors (PyTorch) | apache-2.0 | Mayor capacidad a cambio de más memoria; no hay conversión ONNX equivalente documentada aquí |
| Otras conversiones ONNX de la familia Qwen2.5 o de modelos pequeños tipo SmolLM2 | No disponible | No disponible | ONNX | No disponible | No se han identificado en la información proporcionada |

La diferencia relevante frente al modelo base no es de calidad, sino de empaquetado: esta versión evita la conversión manual y fija una revisión concreta con sumas de verificación. Como contrapartida, carece de variante de 4 bits, que sí suelen ofrecer otras conversiones comunitarias.

## Limitaciones y advertencias

- Tamaño: 0,5 B de parámetros es un modelo muy pequeño. Es previsible un razonamiento limitado, alta tasa de alucinación en preguntas factuales y errores frecuentes en matemáticas y código. No hay evaluación publicada que matice esto.
- Cobertura de idiomas: el repositorio declara únicamente `zh` y toda la validación numérica se hizo en chino. No hay evidencia de calidad en castellano ni en ningún otro idioma, pese a que el modelo base se distribuya como multilingüe.
- Ausencia total de benchmarks: no se puede afirmar nada sobre su rendimiento en MMLU, HumanEval, GSM8K o similares. La similitud coseno mide fidelidad numérica respecto al original, no corrección de las respuestas; el propio autor lo advierte.
- Sin cuantización de 4 bits ni de 8 bits: quien necesite Q4 o Q8 no puede usar este repositorio y debe buscar otra conversión. Los ficheros q4 y q4f16 existen en el proceso de construcción pero se descartaron tras fallar el umbral de 0,98, no por una limitación intrínseca del formato.
- Compatibilidad de cliente: una aplicación que fije `q8` en la llamada a `pipeline` fallará al cargar este repositorio. Hay que seleccionar el `dtype` explícitamente.
- Licencia: apache-2.0, que permite uso comercial, modificación y redistribución siempre que se conserven los avisos de licencia y el fichero LICENSE del modelo base. Los pesos mantienen la licencia upstream.
- Trazabilidad y madurez: el repositorio no tiene descargas ni likes y se creó y actualizó el mismo día, lo que implica ausencia de validación por parte de terceros. La revisión del modelo base está fijada, lo que es positivo para reproducibilidad.
- Dependencia experimental: la ruta WebGPU depende de Transformers.js 4.0.1 y ONNX Runtime Node 1.24.3. Otras versiones pueden comportarse de forma distinta; no se documentan pruebas de compatibilidad hacia atrás.
- Reproducción: los scripts `export_models.py` y `quantize_q4.py` esperan una estructura de directorios concreta (`sources/<model-name>` y `repos/<model-name>-ONNX`) y el script JS de validación asume el árbol de dependencias del espacio de trabajo de EasyEDA o una importación equivalente de Transformers.js 4.0.1.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JasonYANG170/Qwen2.5-0.5B-Instruct-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Revisión concreta del modelo base usada en la conversión: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/tree/7ae557604adf67be50417f59c2c2f167def9a775
- Documentación original del modelo base preservada en el repositorio: `UPSTREAM_README.md`
- Manifiesto de construcción con versiones y sumas SHA-256: `build-manifest.json`
- Script de exportación: `export_models.py`
- Script de cuantización Q4: `quantize_q4.py`
- Informe del intento Q4 descartado: `q4-trial-validation.json`
- Búsqueda web: no se encontraron enlaces relevantes sobre este modelo. Los resultados devueltos correspondían a medios de noticias generalistas y no guardaban relación con la ficha.
