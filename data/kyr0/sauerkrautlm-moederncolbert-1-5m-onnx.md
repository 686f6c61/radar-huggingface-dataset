# kyr0/SauerkrautLM-MoEdernColBERT-1.5M-ONNX

## Resumen

SauerkrautLM-MoEdernColBERT-1.5M-ONNX es la exportación a formato ONNX del modelo VAGOsolutions/SauerkrautLM-MoEdernColBERT-1.5M, un codificador de recuperación multilingüe basado en interacción tardía (late interaction) de tipo ColBERT. No es un modelo generativo: convierte identificadores de tokens en vectores de 128 dimensiones normalizados en L2, y la puntuación entre consulta y pasaje se calcula con el operador MaxSim propio de ColBERT. El autor de la exportación es kyr0, mientras que el modelo base procede de VAGOsolutions.

La relevancia de esta ficha radica en su orientación a inferencia en CPU mediante ONNX Runtime en Python, Node.js y navegadores vía WASM, lo que permite desplegar búsqueda semántica y reranking sin GPU. El modelo cubre siete idiomas (alemán, inglés, español, neerlandés, francés, italiano y portugués) y su licencia Apache-2.0 facilita el uso comercial. El tamaño es muy reducido: el grafo FP32 ocupa 6.294.481 bytes y la variante q8 apenas 2.016.962 bytes.

La exportación incluye cuatro precisiones (fp32, fp16, q8 e int8) con contratos de paridad documentados, un manifiesto con hashes SHA-256 y un fichero de contrato de tokenización. La arquitectura del checkpoint original combina capas de atención con capas de mezcla de expertos (MoE), aunque la exportación calcula todos los expertos enrutados y aplica las compuertas del router aprendido en lugar de omitir los no utilizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer con capas de atención y capas de mezcla de expertos (MoE), cabeza de proyección a 128 dimensiones y normalización L2 por token; interacción tardía ColBERT con MaxSim |
| Parametros totales | no disponible (el nombre comercial indica 1.5M, no confirmado en la información proporcionada) |
| Parametros activos | no disponible (el grafo exportado calcula todos los expertos enrutados, sin omisión) |
| Longitud de contexto | 512 posiciones máximo para documentos; consultas fijas de 32 posiciones |
| Tipos de cuantizacion | fp32, fp16, q8 (pesos INT8 con matemáticas FP32), int8 (pesos INT8 con activaciones INT8 dinámicas); q4 no se distribuye |
| Idiomas soportados | de, en, es, nl, fr, it, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, ejes de batch y secuencia dinámicos) |

## Arquitectura y entrenamiento

El modelo base es un codificador de recuperación multilingüe con arquitectura ColBERT de interacción tardía. Cada token de entrada se proyecta a un vector de 128 dimensiones con norma unitaria, y la relevancia consulta-pasaje se obtiene sumando, para cada token de la consulta, el máximo producto escalar contra los tokens del documento (MaxSim). El checkpoint incorpora capas de atención y capas de mezcla de expertos; el exportador reimplementa ambas con operaciones tensoriales simples y las exporta con `torch.onnx.export` en opset 17.

La exportación introduce tres cambios respecto al modelo original, documentados por requisitos de la licencia Apache 2.0: se calculan todos los expertos enrutados y las compuertas del router ponderan sus salidas (los resultados coinciden con el modelo original, pero el grafo no omite expertos no utilizados); las posiciones se limitan a 512, por lo que la atención de ventana deslizante del modelo original para entradas más largas no se exporta; y las variantes cuantizadas almacenan pesos redondeados, manteniendo el router en FP32 porque errores pequeños en el router pueden cambiar qué expertos se ejecutan. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de embeddings de tokens para recuperación y búsqueda semántica: cada token se convierte en un vector de 128 dimensiones con norma unitaria.
- Puntuación de relevancia consulta-pasaje mediante MaxSim de ColBERT sobre representaciones multi-vector.
- Recuperación multilingüe en alemán, inglés, español, neerlandés, francés, italiano y portugués, incluyendo consultas y pasajes en idiomas distintos.
- Reranking de resultados de un primer recuperador léxico o denso, gracias a la granularidad por token de la interacción tardía.
- Inferencia en CPU en Python, Node.js y navegadores mediante ONNX Runtime, incluyendo WASM.
- Contrato de tokenización explícito con prefijos `[Q] ` y `[D] `, longitudes fijas de consulta y exclusión de tokens de puntuación en la puntuación de documentos.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un codificador de recuperación.
- No dispone de visión ni audio.

## Casos de uso

- Búsqueda semántica en aplicaciones web sin backend GPU: el grafo q8 de 2 MB puede ejecutarse en el navegador con ONNX Runtime WASM, permitiendo indexar y consultar pasajes localmente sin enviar datos al servidor.
- Reranking en pipelines de recuperación de dos etapas: un recuperador léxico (BM25) obtiene candidatos y este modelo reordena los 50-100 mejores pasajes con MaxSim, aprovechando su granularidad por token para consultas largas y específicas.
- Atención al cliente multilingüe: con soporte para siete idiomas europeos, permite enrutar consultas de usuarios a artículos de base de conocimiento en el idioma nativo del cliente o en inglés, sin modelos separados por idioma.
- Búsqueda documental en aplicaciones de escritorio o extensiones de navegador: el tamaño reducido del modelo (6,3 MB en FP32) permite empaquetarlo dentro de la aplicación y ejecutar la recuperación en CPU sin dependencias externas.
- Deduplicación y agrupación de documentos: los vectores por token y las puntuaciones MaxSim permiten detectar pasajes casi duplicados en corpus multilingües, útil en ingestas de datos y control de calidad.
- Sistemas RAG con restricciones de privacidad: al ejecutarse en local (Python o Node.js), el índice y las consultas no salen del entorno del cliente, lo que encaja en sectores regulados.
- Filtrado previo en motores de búsqueda internos: integración como servicio ONNX Runtime en Node.js para reordenar resultados de Elasticsearch u OpenSearch sin añadir infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de recuperación (BEIR, MTEB u otros) en la información disponible. La model card incluye únicamente una verificación de paridad frente al modelo FP32 sobre un conjunto de regresión de 24 consultas y 24 pasajes en siete idiomas, que no constituye un benchmark de recuperación:

| Precision | Coseno medio por token | Coseno mínimo por token | Mismo top-1 que FP32 | Solapamiento top-5 | Pasaje etiquetado en primera posición |
|---|---:|---:|---:|---:|---:|
| fp16 | 0.9999 | 0.964 | 24/24 | 1.000 | 24/24 |
| q8 | 0.9971 | 0.869 | 24/24 | 0.975 | 24/24 |
| int8 | 0.9943 | 0.843 | 24/24 | 0.967 | 24/24 |

El grafo FP32 coincide con el modelo original de Sentence Transformers dentro de 1,0e-06 por valor, incluyendo casos límite del tokenizador y formas de batch de hasta 3 × 512 tokens. Estas mediciones se realizaron en macOS-26.7.1-arm64 con Python 3.11.17, ONNX Runtime 1.31.1 y PyTorch 2.6.0.

## Requisitos de hardware

- VRAM: no requiere GPU; está diseñado para inferencia en CPU con ONNX Runtime.
- Memoria en disco: 6.294.481 bytes (fp32), 3.239.914 bytes (fp16), 2.016.962 bytes (q8) y 2.113.134 bytes (int8).
- GPU recomendadas: no aplica; cualquier GPU compatible con ONNX Runtime CUDA podría ejecutarlo, pero no es el objetivo de la exportación.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el modelo completo ocupa menos de 7 MB.
- Opciones de despliegue: ONNX Runtime en Python, Node.js y navegadores (WASM); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un codificador de recuperación.
- Latencia y throughput: no disponibles en la información proporcionada. La model card advierte que q8 reduce el tamaño de descarga pero no acelera la inferencia ni reduce el uso de memoria.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada para establecer una comparación cuantitativa con alternativas como ColBERTv2, Jina ColBERT o BGE-M3. A continuación se comparan únicamente los datos disponibles de esta exportación con las características generales conocidas de esas familias, marcando como no disponible lo que no se puede verificar:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SauerkrautLM-MoEdernColBERT-1.5M-ONNX | no disponible (nombre indica 1.5M) | 512 posiciones (32 en consultas) | 7 idiomas europeos | Apache-2.0 | ONNX |
| ColBERTv2 | no disponible en esta ficha | no disponible en esta ficha | principalmente inglés | no disponible en esta ficha | PyTorch |
| Jina ColBERT v2 | no disponible en esta ficha | no disponible en esta ficha | multilingüe | no disponible en esta ficha | PyTorch |
| BGE-M3 | no disponible en esta ficha | no disponible en esta ficha | multilingüe | no disponible en esta ficha | PyTorch |

## Limitaciones y advertencias

- No se distribuye cuantización q4: el coseno medio por token frente a FP32 medido fue de 0,954 a 0,961 con bloques de 16 y 32, por debajo del umbral de 0,98 fijado por el autor.
- q8 reduce el tamaño de descarga pero no acelera la inferencia ni reduce el consumo de memoria.
- int8 cuantiza las activaciones por lote en tiempo de ejecución, por lo que los vectores de un pasaje dependen ligeramente del resto de pasajes del mismo lote; las cachés deben indexarse por runtime.
- Los grafos fp16 e int8 dependen de los kernels del runtime y producen vectores distintos entre runtimes; solo deben compararse con vectores del mismo runtime.
- Las consultas están limitadas a 32 posiciones y los documentos a 512; los textos más largos deben trocearse antes de la codificación.
- La atención de ventana deslizante del modelo original para entradas superiores a 512 posiciones no se exporta.
- El grafo calcula todos los expertos enrutados, por lo que no aprovecha el ahorro computacional del enrutamiento disperso del modelo original.
- Es un modelo de recuperación, no generativo: no puede responder preguntas ni producir texto, solo puntuar relevancia.
- Riesgo de sesgos y alucinación: no se documentan evaluaciones de sesgo; al no generar texto, el riesgo de alucinación se limita a recuperar pasajes irrelevantes, no a inventar contenido.
- La cobertura lingüística se limita a siete idiomas europeos; no se documenta soporte para otras lenguas.
- Licencia Apache-2.0: permite uso comercial con atribución y conservación del aviso de licencia; las modificaciones de la exportación ya están declaradas en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kyr0/SauerkrautLM-MoEdernColBERT-1.5M-ONNX
- Modelo base: https://huggingface.co/VAGOsolutions/SauerkrautLM-MoEdernColBERT-1.5M
- Revisión del modelo base exportada: `9d360b8b88ae11bea5784bf9012ff509fdd5c2da`
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
