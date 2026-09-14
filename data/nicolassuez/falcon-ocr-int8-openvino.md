# Nicolassuez/Falcon-OCR-int8-openvino

## Resumen

Falcon-OCR-int8-openvino es un artefacto de inferencia publicado por el usuario Nicolassuez que reimplementa el decodificador de tiiuae/Falcon-OCR como un grafo OpenVINO IR con pesos INT8, diseñado para servir OCR de documentos en CPU sin intervención de GPU alguna. El artefacto ocupa 478 MB frente a los 1,08 GB de los pesos FP32 del modelo original, y hereda la licencia Apache 2.0 del checkpoint base.

No se trata de un reempaquetado: el código publicado del modelo original está escrito para CUDA (FlexAttention con BlockMask, un kernel Triton para su feed forward con puerta y `torch.compile` en cada capa), de modo que esta versión recompone la misma función con operaciones que un runtime de CPU entiende, introduciendo dos cambios deliberados: el attention sink se convierte en una clave adicional y la caché KV pasa a ser una entrada del grafo en lugar de estado interno del modelo.

Su relevancia es de nicho pero concreta: permite ejecutar OCR de documentos sobre hardware de portátil (las mediciones del autor se tomaron en un Intel i7-13700H con seis hilos) con una pérdida de calidad muy contenida frente a la referencia FP32, con 16 de 16 fragmentos esperados y tres de cuatro páginas idénticas a nivel de bit. El repositorio es de creación reciente y no registra descargas ni interacciones, por lo que la validación externa es todavía inexistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador transformer (Falcon-OCR) exportado a OpenVINO IR; atención con sink reformulado como clave extra (claves de 65 canales, valores de 64 sobre 8 cabezas) |
| Parámetros totales | no disponible (los pesos FP32 ocupan 1,08 GB; el artefacto INT8, 478 MB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (las mediciones del autor usan hasta 3000 tokens en caché) |
| Tipos de cuantización | NNCF `INT8_ASYM` sin conjunto de calibración; pesos en u8 y cuantización dinámica de activaciones con `src_dyn_quant_group_size:32`; la atención permanece en coma flotante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de tiiuae/Falcon-OCR) |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`) en tres grafos; además `.npz` (sinks), `.npy` (frecuencias rotatorias espaciales) y `.json` (configuración, tokenizer, build) |
| Pipeline | image-to-text |
| Tamaño del repositorio | 0,5 GB |
| Revisión del modelo base | tiiuae/Falcon-OCR en `0c9f85d21adf928b3b34d37dba2f5be38048a1c4` |
| Librería | openvino |

## Arquitectura y entrenamiento

El artefacto no entrena ni ajusta nada: es una conversión y cuantización del decodificador de Falcon-OCR. Se compone de tres grafos OpenVINO —`decoder_prefill` (paso de prompt, batch 1, SDPA fusionada), `decoder_decode` (un token por llamada, batch dinámico, atención puntuada explícita) y `embedder` (embeddings de tokens y de parches de imagen)—, más ficheros auxiliares para los sinks, las frecuencias rotatorias espaciales y la configuración del tokenizer. Los pesos se comprimen con NNCF en modo `INT8_ASYM` sin calibración; en ejecución, el plugin de CPU de OpenVINO resuelve las capas lineales sobre oneDNN con VNNI y cuantización dinámica de activaciones (`inner_product,brgemm:avx2_vnni, wei:u8, src_dyn_quant_group_size:32`).

La innovación técnica principal es la reformulación del attention sink. El checkpoint original reescala cada salida de atención mediante `sigmoid(lse - sink)`, y `lse` solo existe dentro de FlexAttention. Eso equivale exactamente a un softmax sobre las claves reales más una clave cuyo logit es el sink y cuyo valor es cero, así que las consultas incorporan un 1 constante en un carril adicional y las claves pasan a tener 65 canales en lugar de 64 (los valores siguen en 64 sobre 8 cabezas, ya que nada los rota). El resultado es una atención de producto escalar escalada convencional, sin matriz S x S, con el sink sembrado en el índice 0 de la caché KV por el host, lo que elimina la diferencia entre prefill y decode.

El segundo cambio es que la caché KV es una entrada del grafo, no estado del modelo. El autor midió, por capa de atención y con 3000 tokens en caché sobre un portátil AVX2: 42,5 ms con estado de OpenVINO más SDPA, 38,7 ms con atención explícita, 29,4 ms con estado preasignado escrito en sitio, 11,9 ms con caché propiedad del host que el grafo solo lee, y 10,0 ms para los dos productos matriciales aislados. Un `Concat` con estado reconstruye toda la caché en cada token, de ahí que ambos grafos reciban la caché como entrada y devuelvan únicamente las claves y valores del token nuevo.

## Capacidades

- Reconocimiento óptico de documentos (OCR) en formato image-to-text, con salida en markdown y, en al menos un caso medido, en tabla HTML.
- Preservación de estructura: la única divergencia detectada frente a FP32 en las páginas de prueba fue de formato (markdown frente a tabla HTML), no de contenido.
- Lectura fiable de páginas densas siempre que la resolución sea suficiente: con texto de cuerpo de 12 px en un A4, 640 px recupera 14 de 15 fragmentos esperados, mientras que 512 px solo recupera 5 de 15.
- Decodificación con batch dinámico en el grafo de decode, pensada para repartir una misma lectura de pesos entre varias filas (regiones de página o peticiones distintas).
- Caché KV gestionada por el host, lo que permite reutilizarla, compartirla entre peticiones y evitar reconstrucciones por token.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, uso agéntico, razonamiento multi-paso, modo thinking, visión general más allá del OCR, audio ni capacidades multilingües explícitas.

## Casos de uso

- Digitalización masiva de documentos en servidores sin GPU: el artefacto está pensado explícitamente para servir OCR en CPU, con 478 MB de huella en disco, lo que permite desplegarlo en máquinas virtuales o nodos de bajo coste donde no hay acelerador disponible.
- Extracción de estructura de informes densos: con páginas A4 de texto de 12 px renderizadas a 640 px o más, el modelo recupera 14 de 15 fragmentos esperados, lo que lo hace adecuado para convertir informes y memorias a markdown conservando tablas y secciones.
- Servicio OCR multiinquilino con batching: el grafo de decode acepta batch dinámico y, según las cifras del autor, 24 filas se decodifican en 130,2 ms frente a 30,8 ms para una sola fila, porque todas comparten la lectura de los 220 MB de pesos; fusionar peticiones en la misma ronda abarata una cola de documentos.
- Dividir una página en regiones equilibradas y decodificarlas juntas: es la estrategia que el autor señala como la que hace asequible una página densa, ya que las filas comparten la lectura de pesos.
- Procesado en portátil o en campo: las mediciones se tomaron en un Intel i7-13700H con seis hilos y una sola hebra de ejecución, un perfil de hardware de portátil de gama alta, adecuado para captura y digitalización in situ.
- Preprocesado para pipelines de indexación y RAG documental: el modelo emite markdown que se puede trocear y vectorizar directamente, sin necesidad de un paso de reconstrucción de estructura posterior.
- Digitalización de facturas y extractos numéricos con cautela: el autor advierte de que el modelo escribe `4.17` donde la página tiene `4,17`, por lo que cualquier comparación literal debe normalizar el separador decimal antes de validar.
- Reducción del consumo energético en centros de datos con parque exclusivamente x86: al no requerir GPU, el artefacto permite reutilizar hardware de CPU existente para cargas OCR que no son sensibles a la latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica mediciones de calidad frente a la referencia FP32 y de latencia del grafo.

Calidad frente a FP32:

| Métrica | Resultado |
|---|---|
| Fragmentos recuperados | 16 de 16 esperados en cuatro páginas |
| Páginas idénticas a FP32 a nivel de bit | 3 de 4 |
| Divergencia en la cuarta página | Formato (markdown frente a tabla HTML), con un margen de logit de 0,0997 |
| Efecto de mantener embeddings y proyección de salida en FP32 | No repara la divergencia y duplica el tamaño |
| Recall a 640 px (A4 denso, texto de 12 px) | 14 de 15 fragmentos |
| Recall a 512 px | 5 de 15 fragmentos |

Latencia por capa de atención y paso, con 3000 tokens en caché en portátil AVX2:

| Configuración de caché | Tiempo |
|---|---|
| Estado de OpenVINO más SDPA | 42,5 ms |
| Atención explícita | 38,7 ms |
| Estado preasignado escrito en sitio | 29,4 ms |
| Caché propiedad del host, solo lectura | 11,9 ms |
| Solo los dos productos matriciales | 10,0 ms |

Latencia del paso de decode con 350 posiciones en caché y seis hilos:

| Filas en el batch | Tiempo |
|---|---|
| 1 | 30,8 ms |
| 6 | 54,5 ms |
| 12 | 82,5 ms |
| 24 | 130,2 ms |

## Requisitos de hardware

- VRAM: no aplica. El artefacto está diseñado para ejecución en CPU y no incluye ruta CUDA.
- Huella en disco: 478 MB de artefacto, sobre un repositorio de 0,5 GB. Los pesos INT8 son unos 220 MB y se leen por completo en cada paso de decodificación.
- CPU recomendada: microarquitectura con AVX2 y VNNI, ya que el plugin de CPU usa `brgemm:avx2_vnni`. Las mediciones de referencia se tomaron con un Intel i7-13700H, seis hilos de inferencia, OpenVINO 2026.3.1 y un solo stream.
- GPU recomendadas: no aplica. El autor no proporciona cifras para GPU ni para el plugin de GPU de OpenVINO.
- Cabe en GPU de consumo: no aplica; el objetivo es precisamente no usar GPU.
- Opciones de despliegue: runtime de OpenVINO sobre oneDNN. El autor menciona un servicio completo de CPU construido sobre este IR, con reparto en regiones, planificador de batching, kernels fusionados de CPU y caché KV en INT8, en `docker/models/falcon_ocr_cpu` del proyecto que produjo el artefacto. No es compatible con vLLM, llama.cpp, Ollama ni TGI, dado el formato IR y el grafo partido en prefill/decode con caché externa.
- Latencia y throughput: ver las tablas de la sección anterior. Debe tenerse en cuenta que son propiedades del host de medición tanto como del artefacto.
- Dos trampas que el host debe evitar y que producen texto fluido pero degenerado en lugar de un error: `ov.Tensor(numpy_array)` copia por defecto, por lo que la caché debe envolverse con `shared_memory=True`; y una longitud de secuencia leída de `key_cache.shape[2]` queda congelada por el trazado, de modo que hay que cortar desde el final.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre otras familias de OCR (Donut, TrOCR, PaddleOCR u otras) que permitan una comparación honesta de parámetros, contexto o benchmarks. La comparación posible es contra el propio modelo de origen, del que este artefacto deriva.

| Modelo | Formato y precisión | Destino de ejecución | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Nicolassuez/Falcon-OCR-int8-openvino | OpenVINO IR, INT8 asimétrico, atención en FP | CPU con AVX2/VNNI | 478 MB | Apache 2.0 | Caché KV como entrada del grafo, batch dinámico en decode, sink sembrado en el índice 0 |
| tiiuae/Falcon-OCR (upstream) | Checkpoint PyTorch, FP32 | CUDA (FlexAttention con BlockMask, kernel Triton, torch.compile) | 1,08 GB de pesos FP32 | Apache 2.0 | Referencia de calidad frente a la que se mide este artefacto; no ejecutable en CPU tal cual |

## Limitaciones y advertencias

- Resolución mínima práctica: por debajo de unos 640 px en una página A4 densa con texto de 12 px, el texto de cuerpo cae por debajo de la rejilla de parches y el modelo «lee una página que no está ahí», a plena velocidad y sin emitir ningún error. A 512 px el recall medido baja a 5 de 15 fragmentos.
- Divergencia de formato en empates ajustados: una de las cuatro páginas de prueba se emitió como tabla HTML en lugar de markdown con un margen de logit de 0,0997. Cualquier consumidor aguas abajo debe aceptar ambas formas o normalizar la salida.
- Separador decimal: el modelo escribe `4.17` donde la página contiene `4,17`, de modo que una comparación literal contra el texto de referencia cuenta lecturas correctas como fallos.
- Fallos silenciosos en la integración: el uso incorrecto de `ov.Tensor` (copia por defecto en vez de `shared_memory=True`) o una longitud de secuencia congelada por el trazado no provocan excepciones, sino texto fluido y degenerado, lo que dificulta el diagnóstico en producción.
- Cuantización sin calibración: los pesos se comprimen con NNCF `INT8_ASYM` sin conjunto de calibración, lo que traslada el riesgo de degradación a la validación en el dominio concreto de cada usuario.
- Cobertura de idiomas no declarada: la información disponible no especifica idiomas soportados, por lo que no debe asumirse un comportamiento multilingüe sin pruebas propias.
- Contexto y número de parámetros no documentados: no se indica la ventana de contexto del modelo base ni el recuento de parámetros; las únicas referencias son los 3000 tokens usados en las mediciones de caché.
- Medición dependiente del host: todas las cifras proceden de un Intel i7-13700H con seis hilos, OpenVINO 2026.3.1 y un stream, y son propiedades de ese equipo tanto como del artefacto.
- Adopción nula verificable: cero descargas y cero likes en el momento de la consulta, sin validación por parte de terceros más allá de las afirmaciones del autor.
- Licencia: Apache 2.0 heredada del modelo base, sin restricciones adicionales indicadas para uso comercial; conviene verificar igualmente las condiciones del checkpoint upstream y de los datos con los que se entrenó.
- El grafo de decode está pensado para batch dinámico; un uso estrictamente monohilo y sin batching desaprovecha la lectura compartida de pesos y dispara el coste por token.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nicolassuez/Falcon-OCR-int8-openvino
- Modelo base: https://huggingface.co/tiiuae/Falcon-OCR
- Revisión exacta del modelo base usada en la conversión: `0c9f85d21adf928b3b34d37dba2f5be38048a1c4` en el repositorio tiiuae/Falcon-OCR
- Servicio de referencia en CPU: ruta `docker/models/falcon_ocr_cpu` dentro del proyecto que produjo el artefacto (sin URL pública en la información disponible)
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a insertos de fresado de carburo (hjcarbide.com, estoolcarbide.com, iscar.co.uk, hmntool.com) y no guardan relación con la ficha.
