# Chungulus/Qwen3.5-4B-3D-Coder-Q6_K-GGUF

## Resumen

Qwen3.5-4B-3D-Coder-Q6_K-GGUF es una cuantización comunitaria en formato GGUF Q6_K del checkpoint FP16 ccore/Qwen3.5-4B-3D-Coder, un ajuste fino de la familia Qwen3.5 orientado a la generación de código para Three.js y escenas 3D en el navegador. Lo publica el usuario Chungulus bajo licencia Apache 2.0 y está pensado para su uso con llama.cpp, incluyendo el proyector de visión del modelo original sin modificar.

El modelo combina un transformer de aproximadamente 4.200 millones de parámetros en su versión de texto (4.539 millones en el checkpoint original con visión) con un proyector visual BF16 heredado del modelo base. Su pipeline declarado es image-text-to-text, por lo que acepta tanto instrucciones de texto como imágenes, lo que resulta útil para tareas de descripción de imágenes o generación de código a partir de capturas.

Su relevancia actual es práctica: ofrece un modelo de 4B especializado en código 3D en un único fichero GGUF de unos 4,1 GB, ejecutable en hardware de consumo con llama.cpp y con soporte de contexto de 8.192 tokens según los ejemplos de la model card. Es una cuantización no oficial, sin dataset de calibración ni matriz de importancia, y el autor advierte de que no se han evaluado benchmarks de precisión ni el comportamiento en contexto completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con proyector de visión BF16; cuantización GGUF Q6_K |
| Parametros totales | 4.205.751.296 (GGUF de texto); 4.539.265.536 en el checkpoint FP16 original con visión |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens en los ejemplos de la model card (no se especifica el máximo nativo) |
| Tipos de cuantizacion | Q6_K (esta publicación); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj BF16 separado para visión |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3.5 de 4B desarrollado por CCORE, con una arquitectura transformer estándar y un proyector visual que permite el procesamiento image-text-to-text. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO; esa información corresponde al modelo original ccore/Qwen3.5-4B-3D-Coder y no se reproduce en esta cuantización.

La innovación técnica destacable de esta publicación es la cuantización Q6_K realizada de forma independiente a partir de la exportación FP16 completa, verificando los hashes del modelo fuente y del proyector antes de la conversión. No se utilizó dataset de calibración, matriz de importancia ni recuantización. La model card indica que la predicción multi-token (MTP) no se exporta, por lo que debe desactivarse en los frontends que intenten habilitarla, y que se ha probado con un build reciente de llama.cpp (commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`).

## Capacidades

- Generación de código JavaScript para Three.js, incluyendo escenas 3D, geometrías, materiales e iluminación.
- Comprensión de imágenes mediante el proyector visual incluido (pipeline image-text-to-text).
- Generación de texto conversacional multi-turno.
- Salida en formato JSON y estructuras de datos, verificado en las pruebas del autor.
- Razonamiento aritmético básico, verificado en las pruebas del autor.
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking o decodificación especulativa: no disponible; MTP no exportado.

## Casos de uso

- Generación de escenas Three.js: el modelo está especializado en producir código JavaScript para escenas 3D en el navegador, como el ejemplo de la model card de un cubo rojo rotatorio, lo que permite prototipar visualizaciones 3D web rápidamente.
- Asistente de código 3D en local: al ser un GGUF de 4,1 GB ejecutable con llama.cpp, se puede integrar en editores o terminales sin depender de APIs externas, útil para entornos con requisitos de privacidad.
- Descripción de imágenes: mediante `llama-mtmd-cli` y el proyector BF16 incluido, se pueden generar descripciones o extraer información de capturas y diagramas.
- Generación de código a partir de referencias visuales: combinando la entrada de imagen y la generación de código, se puede pedir al modelo que reproduzca una escena o interfaz mostrada en una captura.
- Prototipado de demos interactivas: el modelo puede producir fragmentos de HTML y JavaScript con sintaxis validada, adecuados para maquetas rápidas de visualizaciones.
- Pruebas de integración en pipelines de CI: la model card documenta la verificación de sintaxis JavaScript de las salidas, lo que sirve como base para validaciones automatizadas de código generado.
- Experimentación educativa con modelos multimodales pequeños: su tamaño y formato GGUF permiten desplegarlo en equipos de desarrollo para estudiar el comportamiento de un modelo 4B con visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se evaluó la precisión en benchmarks, el renderizado en navegador, el vídeo ni el comportamiento en contexto completo. Las únicas verificaciones reportadas son pruebas nativas de aritmética, salida JSON y comprensión de imágenes, además de una comprobación de sintaxis JavaScript sobre una escena Three.js generada, con resultados reportados por separado para salidas crudas y normalizadas.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF Q6_K ocupa unos 4,1 GB, por lo que la inferencia requiere aproximadamente 4,5-5 GB de VRAM para el modelo de texto; añadir el proyector visual y el contexto de 8.192 tokens incrementa el consumo.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para texto; para visión y contexto largo, se recomienda 12 GB o más.
- GPU de consumo: cabe en tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores; en tarjetas de 8 GB puede requerir reducir el contexto.
- Opciones de despliegue: llama.cpp (probado con el commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`), mediante `llama-completion` para texto y `llama-mtmd-cli` para visión. vLLM, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada. Como referencia estructural, se puede comparar con el checkpoint original del que deriva:

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Chungulus/Qwen3.5-4B-3D-Coder-Q6_K-GGUF | 4.205.751.296 (texto) | 8.192 en ejemplos | GGUF Q6_K | Apache 2.0 |
| ccore/Qwen3.5-4B-3D-Coder (original) | 4.539.265.536 (con visión) | no disponible | FP16 | Apache 2.0 |

No se han identificado en la información disponible otros modelos comparables de la misma categoría (código 3D con visión en formato GGUF) con datos verificables.

## Limitaciones y advertencias

- Es una cuantización comunitaria no oficial; no procede de Qwen ni de CCORE.
- No se utilizó dataset de calibración ni matriz de importancia, por lo que la pérdida de precisión frente al FP16 no está cuantificada.
- No se han evaluado benchmarks de precisión, renderizado en navegador, vídeo ni comportamiento en contexto completo.
- Algunas salidas crudas usan HTML escapado; la sintaxis JavaScript debe normalizarse antes de su uso en producción.
- La predicción multi-token (MTP) no está exportada; debe desactivarse en los frontends que intenten habilitarla.
- Requiere un build reciente de llama.cpp compatible con Qwen3.5; versiones antiguas pueden no cargar el modelo.
- Riesgo de alucinación en código generado: las APIs de Three.js pueden ser inventadas o incorrectas, y la validación de sintaxis no garantiza corrección funcional.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se confirma el soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe conservar el aviso de licencia incluido en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chungulus/Qwen3.5-4B-3D-Coder-Q6_K-GGUF
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Checkpoint FP16 de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/tree/16f53e560115a3f55ddf7b455d65417257e29414
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ficheros auxiliares del repositorio: `validation.json`, `example-scene.html`, `quantizatia-manifest.json`, `LICENSE` (incluidos en el repositorio de HuggingFace)
