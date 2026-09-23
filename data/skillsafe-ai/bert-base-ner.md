# skillsafe-ai/bert-base-ner

## Resumen

`skillsafe-ai/bert-base-ner` es un artefacto de inferencia en formato ONNX (fp32, opset 11) para reconocimiento de entidades nombradas (NER) con las cuatro categorías clásicas PER, ORG, LOC y MISC. No es un modelo entrenado desde cero: es una importación reproducible del export ONNX del modelo `dslim/bert-base-NER`, publicada por SkillSafe dentro de su catálogo de modelos listos para ejecutarse en navegador mediante `transformers.js` y `onnxruntime-web`.

Su relevancia práctica está en el empaquetado, no en el entrenamiento. El repositorio fija el origen a un commit concreto del modelo base, acompaña una receta de conversión con hash propio y verifica cada archivo con SHA-256, además de pasar `onnx.checker` y una prueba de humo en CPU con `onnxruntime`. Eso permite desplegar NER completamente en el cliente, sin enviar texto a un servidor, algo interesante para aplicaciones con requisitos de privacidad o para entornos sin backend.

Técnicamente hereda la arquitectura BERT-base (encoder transformer bidireccional, aproximadamente 110 millones de parámetros, pesos fp32 de 411,20 MB) y produce una salida `logits` de 9 clases por token. El repositorio acumula 0 descargas y 0 likes, por lo que debe tratarse como un artefacto de importación reciente y sin adopción verificable, no como un modelo con historial de uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT-base (encoder transformer bidireccional) exportado a ONNX; arquitectura heredada del modelo base `dslim/bert-base-NER` |
| Parámetros totales | Aproximadamente 110 millones (estimados a partir del peso fp32 de 411,20 MB); no declarados explícitamente en la ficha |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en la ficha del artefacto; el modelo base BERT-base admite secuencias de hasta 512 tokens. El grafo ONNX usa ejes dinámicos `batch_size` y `sequence_length` |
| Tipos de cuantización | Solo fp32 (`onnx/model.onnx`). No se incluyen variantes int8, fp16, ni formatos GGUF |
| Idiomas soportados | No disponible (la ficha del repositorio no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 11), fp32, 411,20 MB, acompañado de `vocab.txt`, `config.json`, `tokenizer_config.json` y `special_tokens_map.json` |
| Pipeline | `token-classification` |
| Etiquetas de salida | 9 clases por token (dimensión del tensor `logits`), compatibles con O + B/I para PER, ORG, LOC y MISC |
| Tamaño del repositorio | 0,4 GB |
| Librería declarada | `transformers.js` (artefacto para navegador) |
| Modelo base | `dslim/bert-base-NER` (commit `d1a3e8f13f8c3566299d95fcfc9a8d2382a9affc`) |
| Descargas / likes | 0 / 0 |
| Publicación en el Hub | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: importa el export ONNX publicado por el autor del modelo base y lo redistribuye sin conversión adicional. La cadena de procedencia está documentada con detalle: commit de origen fijado, receta `recipes/bert-base-ner.yaml` con SHA-256 `083282ba04c75bdc8d0ebedc9e40b5e65c11a4ff42d0831d0bd04631c1c7bcb6`, y un conjunto de herramientas concreto (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0, Darwin 25.6.0 arm64). La conversión se registró el 22 de septiembre de 2026 a las 21:43:58 UTC.

El contrato del grafo es explícito: tres entradas `int64` de forma `['batch_size', 'sequence_length']` (`input_ids`, `attention_mask`, `token_type_ids`) y una salida `float32` de forma `['batch_size', 'sequence_length', 9]`. Cada archivo está anclado por SHA-256 a su fuente, y el ONNX superó `onnx.checker` y una ejecución de humo en CPU con entradas rellenas de ceros. Los detalles de entrenamiento del modelo subyacente (composición del dataset, número de tokens, uso de RLHF o DPO) no se describen en la información disponible de este repositorio; corresponden al modelo base `dslim/bert-base-NER`.

## Capacidades

- Reconocimiento de entidades nombradas sobre texto: etiqueta tokens como persona (PER), organización (ORG), localización (LOC) y miscelánea (MISC), con esquema B/I de 9 clases en total.
- Clasificación por token puramente extractiva: la salida es una secuencia de logits alineada con los tokens de entrada, no texto generado.
- Inferencia en el navegador mediante `onnxruntime-web` con ejecución en WebGPU o WASM, y uso a través del pipeline `token-classification` de `transformers.js`.
- Ejecución en CPU con un coste medido de 6,7 ms para una entrada de lote 1 y secuencia 8 en la prueba de humo del propio repositorio.
- Compatibilidad con lotes y longitudes de secuencia dinámicas, según los ejes declarados en el grafo ONNX.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta `tool calling` ni `function calling`.
- No soporta flujos de agente ni razonamiento multi-paso.
- No declara capacidades multilingües; la ficha no especifica idiomas soportados.

## Casos de uso

- Anonimización de datos personales en el cliente: el modelo puede ejecutarse íntegramente en el navegador vía `onnxruntime-web` y etiquetar nombres de personas y organizaciones antes de que el texto salga del dispositivo, lo que evita enviar contenido sensible a un backend.
- Cumplimiento de protección de datos en formularios y chats: integrado en un front-end, permite detectar y marcar entidades antes de persistir texto introducido por el usuario, con la ventaja de que el dato nunca abandona el entorno del cliente.
- Procesamiento de noticias y documentos para análisis: extracción de personas, organizaciones y lugares para alimentar índices de búsqueda, paneles de seguimiento de entidades o análisis de cobertura mediática.
- Enriquecimiento de ingestas para RAG: etiquetar entidades en los fragmentos de un corpus para construir metadatos y grafos de conocimiento que mejoren el filtrado y la recuperación posterior.
- Asistencia en CRM y correo corporativo: extracción automática de nombres de empresas y contactos en hilos de correo o notas de reuniones, con un modelo de 411,20 MB que puede ejecutarse en el navegador del comercial sin infraestructura dedicada.
- Preetiquetado para anotación humana: generar propuestas de entidades sobre lotes de texto para que un equipo de anotación revise y corrija, reduciendo el esfuerzo frente a la anotación desde cero.
- Moderación y preprocesado previo a modelos generativos: usar el etiquetado de entidades como paso determinista y barato en CPU antes de invocar modelos más costosos.
- Automatización de flujos sin servidor: al ser un artefacto ONNX autocontenido, encaja en aplicaciones web estáticas o extensiones donde no se quiere mantener un endpoint de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del repositorio no incluye métricas de calidad (F1, precisión o recall) sobre CoNLL-2003 ni sobre ningún otro conjunto de evaluación, y no se dispone de comparaciones numéricas con modelos similares.

El único dato cuantitativo aportado es la verificación técnica del artefacto, que mide latencia de ejecución, no calidad del modelo:

| Archivo | Entradas | Salidas | Tiempo |
|---|---|---|---|
| `onnx/model.onnx` | `input_ids[1, 8]`, `attention_mask[1, 8]`, `token_type_ids[1, 8]` | `logits[1, 8, 9]` | 6,7 ms |

Esta cifra corresponde a una ejecución en CPU sobre arm64 con entradas rellenas de ceros y una secuencia de 8 tokens, por lo que no es representativa del rendimiento con texto real ni de secuencias cercanas al máximo del modelo.

## Requisitos de hardware

- VRAM/RAM estimada: en fp32, los pesos ocupan 411,20 MB, por lo que se necesita alrededor de 0,5 GB de memoria para cargar el modelo, más el consumo del runtime y de los tensores intermedios.
- CPU: suficiente para inferencia. La prueba de humo del repositorio reporta 6,7 ms en CPU (Darwin 25.6.0 arm64) para lote 1 y secuencia 8.
- GPU de consumo: sí, cabe en cualquier GPU de consumo moderna, incluida una RTX 3060 o superior; el cuello de botella es el ancho de banda y la latencia del runtime, no la memoria.
- GPU de centro de datos: A100, H100 o L4 no son necesarias para este tamaño; solo tendrían sentido en despliegues de altísimo volumen donde se priorice agregación de peticiones.
- Navegador: soportado a través de `onnxruntime-web` con `executionProviders: ["webgpu", "wasm"]`, según el ejemplo de uso incluido en la ficha.
- Opciones de despliegue: `onnxruntime-web` (WebGPU/WASM), `transformers.js`, y `onnxruntime` en Python, Node.js o C++. No se proporcionan pesos GGUF ni safetensors, por lo que no aplican `llama.cpp`, Ollama ni formatos derivados.
- vLLM y TGI no aplican: son servidores orientados a modelos generativos autorregresivos y este artefacto resuelve una tarea discriminativa de etiquetado por token.
- Latencia y throughput: no disponibles para cargas reales. Solo existe el dato de 6,7 ms de la prueba de humo, no extrapolable a texto real ni a lotes grandes.

## Comparativa con modelos similares

La información proporcionada solo permite comparar este artefacto con su fuente directa. No se documentan en ella otras alternativas de la misma categoría con datos verificables.

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `skillsafe-ai/bert-base-ner` | ~110 millones (estimado) | Heredado de BERT-base (hasta 512 tokens); no declarado en la ficha | ONNX fp32 (opset 11) | MIT | Repositorio de 0,4 GB, 0 descargas, 0 likes |
| `dslim/bert-base-NER` (origen) | ~110 millones | BERT-base | Pesos PyTorch y su propio export ONNX | MIT | Modelo base del que se importa este artefacto; commit de origen fijado |

Frente al original, este repositorio no aporta cambios en pesos ni arquitectura: su valor diferencial es la trazabilidad (receta, hashes SHA-256 y verificación con `onnx.checker`) y el enfoque explícito a ejecución en navegador. Cualquier comparación de calidad entre ambos sería artificial, porque el artefacto es una copia verificada del mismo modelo.

## Limitaciones y advertencias

- No es un modelo generativo: no puede redactar texto, razonar, escribir código ni resolver problemas matemáticos. Cualquier expectativa en ese sentido es un error de uso.
- Riesgo de etiquetado incorrecto: en textos ambiguos, dominios especializados (biomedicina, legal, financiero) o nombres poco frecuentes puede asignar categorías erróneas. No se han publicado métricas de calidad que permitan acotar ese riesgo.
- Cobertura de entidades limitada a cuatro tipos (PER, ORG, LOC, MISC). No distingue subtipos como fármacos, genes, fechas o importes.
- Idiomas no declarados: la ficha no especifica idiomas soportados, por lo que no debe asumirse un comportamiento multilingüe sin evaluarlo previamente.
- Límite de secuencia: el modelo base BERT-base admite hasta 512 tokens. Textos más largos requieren troceado con solapamiento para no perder entidades en los límites de cada fragmento.
- Licencia MIT permisiva, que permite uso comercial y modificación, siempre manteniendo el aviso de copyright y de licencia. Los pesos siguen bajo la licencia del modelo de origen (`dslim/bert-base-NER`, MIT); la receta de conversión y la model card del artefacto quedan bajo la licencia del repositorio de SkillSafe.
- Ausencia de adopción: 0 descargas y 0 likes, sin historial de incidencias, correcciones ni uso en producción documentado. Conviene validar el artefacto en un entorno propio antes de integrarlo.
- Dependencia de la cadena de suministro del modelo base: si el repositorio de origen se retira o cambia, la trazabilidad se apoya en el commit fijado y en los hashes, pero la documentación de entrenamiento no está replicada aquí.
- Publicación en el Hub con fecha de 22 de septiembre de 2026 y toolchain declarada con versiones muy recientes (torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0). Verificar la compatibilidad con el runtime que se vaya a usar.
- En navegador, el rendimiento depende del proveedor de ejecución disponible: WebGPU ofrece mejor latencia cuando está soportado, mientras que la ruta WASM es más ubicua pero más lenta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/skillsafe-ai/bert-base-ner
- Modelo base `dslim/bert-base-NER`: https://huggingface.co/dslim/bert-base-NER
- Commit de origen fijado: https://huggingface.co/dslim/bert-base-NER/tree/d1a3e8f13f8c3566299d95fcfc9a8d2382a9affc
- Aviso de licencia del modelo base: https://huggingface.co/dslim/bert-base-NER/blob/main/README.md
- Repositorio con las recetas de conversión de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Registro de modelos servidos por SkillSafe: `models.skillsafe.ai` (referenciado en la model card, sin URL completa)
- Resultados de búsqueda web: no se encontraron enlaces relevantes al modelo; las páginas devueltas corresponden a soporte y blogs de Microsoft y no guardan relación con este artefacto.
