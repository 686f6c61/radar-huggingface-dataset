# BicycleButler/m2v2-gemma2-256d-int4

## Resumen

`BicycleButler/m2v2-gemma2-256d-int4` es un modelo de embeddings estáticos de 256 dimensiones, destilado a partir de `google/embeddinggemma-2` mediante el enfoque Model2Vec/POTION (cuantización con preservación de normas Zipf/SIF). Su autor es BicycleButler, y el modelo forma parte del ecosistema "Bicycle Butler", un sistema de comercio federado orientado a búsqueda semántica en catálogos de ciclismo.

El problema que resuelve es la ejecución de embeddings de texto directamente en el cliente (navegador, Web Workers, service workers, Node.js) sin dependencias de Python ni C++, con latencias inferiores a 0,1 ms por texto y un tamaño de contenedor de solo 16,7 KB. Esto permite implementar búsqueda vectorial "zero-knowledge" sobre cachés locales cifradas (OPFS), sin enviar datos ni vectores a servidores remotos.

Es relevante en escenarios de e-commerce y CRM donde la privacidad del usuario es crítica: el modelo permite computar similitudes semánticas en el dispositivo, mantener los datos fuera del servidor y funcionar sin conexión gracias a la Cache API del navegador. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos destilados (Model2Vec/POTION, matriz de búsqueda token-vector) |
| Parametros totales | no disponible (matriz Int4 de vocabulario x 256 dimensiones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo estático por tokens, sin ventana de atención) |
| Tipos de cuantizacion | Int4 simétrico (2 nibbles por byte, 128 bytes por vector de 256 dimensiones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor binario propio M2V2 (`.bin`, magic `0x4D325632`, versión 2, con CRC32 de integridad) |

## Arquitectura y entrenamiento

El modelo no es un transformer ejecutable, sino una destilación estática al estilo Model2Vec/POTION: se proyectan los embeddings del modelo base (`google/embeddinggemma-2`, arquitectura Gemma-2) a una matriz de búsqueda estática token-vector. La inferencia consiste en localizar tokens en un trie UTF-8 de prefijos, aplicar escalas por token precalculadas (Zipf/SIF, preservando las normas de POTION) y sumar las filas correspondientes de una matriz cuantizada a 4 bits, con normalización L2 unitaria al final. Al no existir red neuronal en tiempo de ejecución, la latencia es inferior a 0,1 ms y no se requiere GPU.

No se ha publicado información sobre el número de tokens del corpus de destilación ni sobre el proceso de entrenamiento más allá de la metodología Model2Vec/POTION aplicada sobre el modelo base. Una característica destacable es la protección de identificadores: SKUs (por ejemplo `BR-M8100`), números de serie, teléfonos y correos se manejan de forma que no sufran deriva semántica, preservando tokens de coincidencia exacta para motores léxicos híbridos.

## Capacidades

- Extracción de características (feature extraction): genera vectores unitarios de 256 dimensiones (`Float32Array(256)`) para cualquier texto en inglés.
- Similitud semántica y búsqueda vectorial cliente, con latencias sub-0,1 ms por texto.
- Preservación de identificadores alfanuméricos (SKUs, seriales, teléfonos, emails) para búsqueda léxica exacta combinable con la semántica.
- Ejecución isomorfa en navegador (Web Workers, service workers), Node.js y entornos móviles edge, sin Python ni C++.
- Arquitectura zero-knowledge: búsqueda vectorial sobre cachés locales cifradas (OPFS LSM Vault) sin descifrar registros ni filtrar vectores al servidor.
- Descarga y persistencia offline vía Cache API del navegador (`caches.open('m2v2-weights-v2')`), con CORS abierto (`Access-Control-Allow-Origin: *`).
- No genera texto, no razona, no soporta tool calling ni agentes: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en e-commerce de ciclismo: el usuario escribe consultas como "shimano hydraulic brake lever" o "tubeless tire sealant 29 inch" y el modelo las convierte en vectores para recuperar productos del catálogo sin que el servidor vea las consultas.
- Búsqueda zero-knowledge en CRM: los registros de clientes permanecen cifrados en OPFS y la búsqueda vectorial se ejecuta en el navegador, de modo que ni el proveedor ni el servidor acceden a los datos ni a los vectores.
- Autocompletado y sugerencias en tiempo real: gracias a la latencia sub-0,1 ms, puede recalcular embeddings en cada pulsación de tecla dentro de un Web Worker sin bloquear la interfaz.
- Funcionamiento offline en aplicaciones web progresivas: los pesos (16,7 KB) se cachean con la Cache API y la búsqueda sigue operando sin conexión.
- Búsqueda híbrida léxica + semántica: los tokens exactos de SKUs y seriales se preservan para el motor léxico, mientras el vector semántico cubre consultas en lenguaje natural.
- Búsqueda en aplicaciones móviles edge: al no requerir GPU ni runtimes nativos, puede integrarse en apps híbridas o React Native con Node.js embebido.
- Filtrado y clasificación ligera de textos de producto: los embeddings pueden alimentar clasificadores o agrupamientos (clustering) ejecutados íntegramente en cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento declarado es una latencia de inferencia inferior a 0,1 ms por texto y un tamaño de contenedor de 16,7 KB.

## Requisitos de hardware

- VRAM: no aplica; el modelo no requiere GPU. Se ejecuta en CPU mediante búsqueda en matriz cuantizada.
- GPU recomendadas: ninguna; no es necesario hardware acelerador.
- Consumer hardware: funciona en cualquier navegador moderno (Chrome, Firefox, Safari, Edge) con soporte de Web Workers, Cache API y OPFS, y en Node.js sin requisitos especiales de memoria (el contenedor completo ocupa 16,7 KB).
- Despliegue: vía paquete npm `@wiltermoodj/search` (`M2V2Engine`, `fetchM2V2Container`), descarga directa desde Hugging Face Hub con CORS abierto, o carga del binario en Python con `huggingface_hub` y parseo mediante `struct`. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia: sub-0,1 ms por embedding. Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensiones | Tamano / cuantizacion | Ejecucion | Licencia |
|---|---|---|---|---|---|
| BicycleButler/m2v2-gemma2-256d-int4 | Embeddings estáticos (Model2Vec/POTION) | 256 | 16,7 KB, Int4 | Navegador/Node.js, sin dependencias | Apache-2.0 |
| MinishLab/potion-base-8M | Embeddings estáticos (Model2Vec/POTION) | 256 | ~32 MB, float32 | Python (model2vec), ONNX | Apache-2.0 |
| static-retrieval-mrl-en-v1 | Embeddings estáticos (Model2Vec) | 384 | ~130 MB, float32 | Python (model2vec), sentence-transformers | Apache-2.0 |
| google/embeddinggemma-2 (base) | Transformer de embeddings | no disponible | no disponible | Python, GPU/CPU | Gemma Terms of Use |

Frente a los modelos Model2Vec estándar, esta ficha destaca por su formato de contenedor binario propio extremadamente compacto (16,7 KB frente a decenas de MB), su cuantización Int4 nativa y su orientación a ejecución en navegador sin runtime de Python. No hay datos de benchmarks que permitan comparar calidad de los embeddings.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para consultas en castellano ni otros idiomas.
- Al ser un modelo de embeddings estáticos, su calidad es inferior a la del transformer base (`google/embeddinggemma-2`): no modela contexto ni orden de palabras, por lo que la precisión en tareas de recuperación exigentes puede degradarse.
- No genera texto ni soporta tool calling, agentes ni razonamiento; solo produce vectores.
- La longitud de contexto no aplica: los textos se procesan token a token, lo que limita la captura de composiciones semánticas complejas.
- El modelo deriva de EmbeddingGemma-2 y debe respetar los Gemma Terms of Use del modelo base, además de la licencia Apache-2.0 del contenedor.
- El formato binario M2V2 es propietario del proyecto y requiere el parser correspondiente; no es compatible directamente con librerías estándar como sentence-transformers.
- El repositorio muestra 0 descargas y una model card de autor independiente: conviene validar la calidad de los embeddings y la integridad del formato antes de uso en producción.
- Riesgo de alucinación: no aplica (no genera texto), aunque errores de recuperación semántica son posibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BicycleButler/m2v2-gemma2-256d-int4
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Framework Model2Vec (MinishLab): https://github.com/MinishLab/model2vec
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
