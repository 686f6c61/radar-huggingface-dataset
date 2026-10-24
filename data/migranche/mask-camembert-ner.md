# migranche/mask-camembert-ner

## Resumen

mask-camembert-ner es la conversión a ONNX en precisión mixta fp16 del modelo Jean-Baptiste/camembert-ner, un clasificador de entidades nombradas (NER) para francés basado en CamemBERT. Lo publica migranche como artefacto de soporte para la vista previa pública de mask, una herramienta de redacción de texto en francés que se ejecuta íntegramente en el navegador mediante transformers.js y onnxruntime-web. No hay reentrenamiento ni ajuste fino: se trata de una conversión numérica de formato sobre los mismos pesos, con un tokenizador regenerado a partir del modelo SentencePiece del repositorio de origen.

El modelo resuelve una tarea concreta y acotada: el etiquetado a nivel de token de cuatro categorías de entidad (PER, ORG, LOC y MISC) sobre texto en francés. Su interés práctico no está en el rendimiento bruto, sino en el formato: un único fichero ONNX autocontenido, con entradas int64 y salida float32, pensado para ejecutarse en WASM dentro del navegador sin servidor ni GPU, y con hashes SHA-256 publicados para cada fichero.

Es relevante ahora por dos motivos: primero, porque ejemplifica el patrón de despliegue local de modelos pequeños de NLP para tareas de privacidad (detectar nombres propios antes de que un texto salga del dispositivo); segundo, por la trazabilidad de la conversión, con receta fijada por escrito de antemano y verificación de equivalencia frente al modelo de origen. Conviene subrayar que el autor declara explícitamente que el modelo no es, por sí solo, un detector de datos personales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (CamemBERT), cabeza de clasificación de tokens |
| Parámetros totales | no disponible (la model card no declara el recuento; el modelo base es camembert-base) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no declarada en la model card; es un encoder para clasificación de tokens por segmentos) |
| Tipos de cuantización | fp16 (precisión mixta) en ONNX; el origen incluye un `model.onnx` en flotante |
| Idiomas soportados | francés (`fr`) únicamente; otros idiomas no evaluados |
| Licencia | MIT (declarada por la model card del modelo de origen) |
| Formato de pesos | ONNX (`onnx/model_fp16.onnx`, opset 11, sin datos externos); tokenizador en `tokenizer.json` |
| Pipeline | token-classification (etiquetas PER, ORG, LOC, MISC, O) |
| Librería / runtime | transformers.js (transformers.js 4.3.1 usado en las comparaciones), onnxruntime-web WASM |
| Tamaño del repositorio | 0,2 GB |
| Etiquetas | PER, ORG, LOC, MISC (+ O) |
| Tipo de conversión | `float16.convert_float_to_float16` con `keep_io_types=True`; `op_block_list` = lista por defecto + `Pow`, `ReduceMean`, `Sqrt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es CamemBERT, un transformer encoder con la misma estructura que RoBERTa pero entrenado sobre texto francés del corpus OSCAR, según la documentación de Hugging Face y de ALMAnaCH/Inria. Sobre esa base, el modelo de origen Jean-Baptiste/camembert-ner añade una cabeza de clasificación de tokens y fue ajustado para NER sobre WikiNER-FR, con aproximadamente 170.634 frases de entrenamiento según la ficha de aimodels.fyi, cubriendo las clases PER, ORG, LOC, MISC y O.

Este repositorio no modifica los pesos ni el entrenamiento: aplica una conversión a fp16 con onnxconverter-common 1.16.0 sobre onnx 1.23.2, en memoria, conservando los tipos de entrada y salida (`keep_io_types=True`), sin cambiar el opset (se mantiene el 11) y sin preprocesado. Se excluyen de la conversión a fp16 los operadores `Pow`, `ReduceMean` y `Sqrt` para evitar problemas numéricos. Hay un ajuste técnico sin efecto numérico: el atributo `to` del nodo `/roberta/Cast` se fija a FLOAT16 para que el fichero cargue. El tokenizador `tokenizer.json` se regenera desde el `sentencepiece.bpe.model` del repositorio de origen con `CamembertConverter` (transformers 5.20.2, tokenizers 0.23.3, sentencepiece 0.2.2), y el build es reproducible (mismo SHA-256 en dos ejecuciones).

La validación publicada es indicativa y de tamaño reducido: sobre el conjunto de desarrollo de mask (17 documentos sintéticos en francés, onnxruntime-web WASM) se obtuvieron 0 máscaras diferentes respecto al `model.onnx` de origen, y el tokenizador produjo 0 diferencias de token-id sobre 5.704 tokens comparado con Xenova/camembert-ner. El propio autor advierte que es una muestra pequeña y no una garantía de salidas idénticas en otros textos.

## Capacidades

- Detección de entidades nombradas en francés con cuatro categorías: persona (PER), organización (ORG), localización (LOC) y miscelánea (MISC), más la clase no-entidad (O).
- Clasificación a nivel de token, apta para extraer spans y construir máscaras de sustitución sobre el texto original.
- Inferencia en navegador: el formato ONNX fp16 con entradas int64 y logits float32 está preparado para transformers.js y onnxruntime-web WASM.
- Ejecución offline y local, sin llamadas a servidor, lo que permite procesar texto sin que salga del dispositivo.
- Verificación de integridad: el autor publica SHA-256 de cada fichero y mask está diseñado para comprobar cada hash contra su manifiesto antes de usar el modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión, audio ni modo thinking: es un encoder discriminativo de clasificación de tokens.
- Capacidad multilingüe: no disponible; solo se declara y se evalúa francés.

## Casos de uso

- Redacción asistida de documentos en francés: integrado en la herramienta mask, el modelo propone qué spans marcar como PER/ORG/LOC/MISC y una persona revisa cada sustitución antes de aplicar el documento final. El flujo está diseñado explícitamente con revisión humana.
- Preetiquetado en proyectos de anotación NER: generar etiquetas iniciales sobre corpus franceses para que los anotadores corrijan, reduciendo el coste por token anotado en comparación con el etiquetado desde cero.
- Saneado previo antes de enviar texto a un LLM externo: ejecutar el modelo en local en el navegador para enmascarar nombres de personas y organizaciones antes de pegar el texto en una API de terceros, como primera capa de minimización de datos.
- Extensiones de navegador y aplicaciones web sin backend: al ser un ONNX fp16 de 0,2 GB de repositorio y ejecutarse en WASM, permite ofrecer una función de detección de entidades en una aplicación puramente cliente, sin infraestructura de inferencia.
- Enriquecimiento de metadatos y búsqueda: extraer ORGANIZACIÓN y LOCALIZACIÓN de artículos de prensa franceses para construir índices facetados o un grafo de entidades en un pipeline documental.
- Monitorización de medios y análisis de menciones: procesar por lotes un corpus de noticias en francés y agregar menciones de personas y organizaciones para informes de seguimiento.
- Docencia y demostraciones de NLP en el navegador: servir de ejemplo reproducible de conversión ONNX fp16 con tokenizador regenerado y hashes publicados, útil en cursos de despliegue de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas estándar (F1 sobre WikiNER, MMLU, HumanEval, GSM8K ni equivalentes) ni comparaciones cuantitativas con otros modelos. Lo único que se documenta son pruebas de equivalencia entre esta conversión y el modelo de origen:

| Prueba | Conjunto | Resultado | Referencia |
|---|---|---|---|
| Equivalencia de máscaras fp16 vs. `model.onnx` | 17 documentos sintéticos en francés, onnxruntime-web WASM | 0 máscaras diferentes | commit `0b506fe` |
| Equivalencia de tokenizador vs. Xenova/camembert-ner | Mismos 17 documentos, texto completo y palabra a palabra | 0 diferencias de token-id sobre 5.704 tokens | commit `4411370` |
| Reproducibilidad del build del tokenizador | Dos ejecuciones con transformers 5.20.2 / tokenizers 0.23.3 / sentencepiece 0.2.2 | Mismo SHA-256 en ambas ejecuciones | model card |

## Requisitos de hardware

- Inferencia en CPU: el caso de uso previsto es onnxruntime-web con backend WASM, es decir, CPU del navegador sin GPU.
- VRAM: no aplica en el despliegue objetivo; el repositorio completo pesa 0,2 GB y el fichero ONNX fp16 es un encoder de tamaño base, por lo que la huella de memoria en ejecución se mide en cientos de megabytes, no en gigabytes.
- GPU recomendadas: no disponibles; el autor no documenta despliegue en GPU. Cualquier GPU consumer (por ejemplo, una RTX 4090) sería sobredimensionada para esta carga.
- Cabe en hardware consumer: sí, por diseño; el destino es el navegador del usuario final. No se publican requisitos mínimos de RAM ni de CPU.
- Opciones de despliegue: transformers.js con onnxruntime-web (WASM) es la vía soportada y la única evaluada. El fichero ONNX podría cargarse con onnxruntime en otros entornos, pero no hay documentación ni pruebas al respecto en la información disponible.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia ni tokens por segundo; solo se indica que las comparaciones se hicieron en onnxruntime-web WASM sobre 17 documentos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|---|
| migranche/mask-camembert-ner | no disponible (base CamemBERT) | no disponible | ONNX fp16 (transformers.js) | MIT (declarada) | fr | Conversión numérica; 0 descargas y 0 likes en el momento de la consulta; hashes publicados |
| Jean-Baptiste/camembert-ner (origen) | no disponible (base CamemBERT) | no disponible | PyTorch + `model.onnx` en el repo de origen | MIT (declarada; sin fichero LICENSE en el repo) | fr | Modelo ajustado sobre WikiNER-FR (~170.634 frases); sin conversión fp16 |
| Xenova/camembert-ner | no disponible | no disponible | ONNX para transformers.js | no disponible en la información consultada | fr | Usado como referencia de tokenizador; 0 diferencias de token-id frente a esta conversión |
| camembert-base (upstream) | no disponible (encoder tipo RoBERTa base) | no disponible | PyTorch | no verificada en la información consultada | fr | Modelo base preentrenado en OSCAR; sin cabeza NER |

No se dispone de datos de rendimiento comparado (F1) entre estas variantes en la información proporcionada, por lo que la comparación se limita a formato, licencia y procedencia.

## Limitaciones y advertencias

- Cobertura de etiquetas muy restringida: solo PER, ORG, LOC y MISC. No existe etiqueta para direcciones, teléfonos, correos electrónicos, IBAN, números de la seguridad social ni otros datos de formato fijo.
- El autor advierte explícitamente de que el modelo no es por sí solo un detector de datos personales y no garantiza anonimización alguna: un texto procesado con él puede seguir conteniendo datos personales.
- Solo francés; el comportamiento en otros idiomas no se ha evaluado.
- La conversión a fp16 altera la precisión numérica y la equivalencia con el modelo de origen se midió únicamente sobre 17 documentos sintéticos, una muestra pequeña y no representativa.
- Riesgo de error en los límites de los spans y en entidades ambiguas (por ejemplo, nombres propios que coinciden con topónimos), propio de un modelo NER de tamaño base; requiere revisión humana, tal como plantea el caso de uso previsto.
- Cadena de licencias incompletamente verificada: la licencia MIT la declara la model card del modelo de origen, pero ese repositorio no contiene fichero LICENSE ni aviso de copyright con titular. Las licencias de camembert-base y del corpus de entrenamiento wikiner_fr no fueron verificadas por el autor de la conversión. Antes de un uso comercial conviene auditar esa cadena.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de calidad.
- Al estar pensado para ejecutarse en el navegador, el rendimiento depende del dispositivo del usuario y del backend WASM; no hay cifras publicadas de latencia que permitan dimensionar un servicio.
- El autor fija la receta de conversión con parámetros concretos (opset 11, lista de operadores bloqueados); reproducir la conversión con otras versiones de onnx u onnxconverter-common puede dar resultados distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/migranche/mask-camembert-ner
- Modelo de origen: https://huggingface.co/Jean-Baptiste/camembert-ner
- Repositorio de mask (herramienta de redacción en navegador): https://github.com/sebastiendonne-mig/mask
- Receta de conversión fijada por escrito (`seuils.md`, enmienda 6): https://github.com/sebastiendonne-mig/mask/blob/d89f47e064be4aa6ba4541d893fe223d20f9aeb9/seuils.md
- Commit del ajuste del nodo Cast: https://github.com/sebastiendonne-mig/mask/commit/29b62512a53914b1e041fae1eb5087718d35d99f
- Commit de la prueba de equivalencia de máscaras: https://github.com/sebastiendonne-mig/mask/commit/0b506fe903a5a9893ab0e954911f81835e3938ba
- Commit de la comparación de tokenizadores: https://github.com/sebastiendonne-mig/mask/commit/44113704b13fde11d45c1c2780562f252d0e68cd
- Tokenizador de referencia Xenova/camembert-ner: https://huggingface.co/Xenova/camembert-ner
- Documentación de CamemBERT en transformers: https://huggingface.co/docs/transformers/model_doc/camembert
- Página de CamemBERT en ALMAnaCH, Inria: https://almanach.inria.fr/software_and_resources/CamemBERT-fr.html
- Ficha de camembert-ner en aimodels.fyi (datos de entrenamiento sobre WikiNER-FR): https://www.aimodels.fyi/models/huggingFace/camembert-ner-jean-baptiste
- Cuaderno de ajuste fino de CamemBERT para NER: https://github.com/fayccal/Camembert-NER
