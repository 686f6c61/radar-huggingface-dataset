# JONNYVERSE/clap-htsat-unfused

## Resumen

JONNYVERSE/clap-htsat-unfused es una conversión a ONNX del modelo laion/clap-htsat-unfused, realizada por JONNYVERSE para hacerlo compatible con Transformers.js. CLAP (Contrastive Language-Audio Pretraining) es una arquitectura que aprende representaciones conjuntas de audio y texto alineándolas en un espacio latente compartido, lo que permite tareas de clasificación de audio zero-shot, recuperación texto-audio y extracción de características. El modelo combina un encoder de audio HT-SAT (Hierarchical Token-Semantic Audio Transformer) con un encoder de texto. La versión aquí documentada expone los pesos en formato ONNX, con un tamaño de repositorio de 2.2 GB, y está pensada para ejecutarse en entornos JavaScript (navegador o Node.js) a través de Transformers.js, evitando la dependencia de Python en el lado del cliente o del servidor. Los embeddings de texto y audio generados tienen una dimensión de 512.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLAP (Contrastive Language-Audio Pretraining): encoder de audio HT-SAT + encoder de texto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (pesos en subcarpeta onnx) |

## Arquitectura y entrenamiento

CLAP es un modelo contrastivo que entrena dos encoders separados —uno de audio y otro de texto— para proyectar sus salidas en un espacio latente compartido. El encoder de audio es un HT-SAT (Hierarchical Token-Semantic Audio Transformer), que procesa espectrogramas de log-Mel y aprende representaciones jerárquicas de tokens semánticos de audio. El encoder de texto no se especifica en la información disponible, pero se alinea con el encoder de audio mediante una función de pérdida contrastiva. No se han proporcionado detalles sobre el dataset de entrenamiento, el número total de tokens, ni si se aplicaron técnicas como RLHF o DPO. La versión publicada por JONNYVERSE no introduce cambios en la arquitectura: simplemente convierte los pesos del modelo original de laion/clap-htsat-unfused al formato ONNX para su uso con Transformers.js.

## Capacidades

- Clasificación de audio zero-shot: permite clasificar clips de audio sin necesidad de entrenar un clasificador, usando etiquetas de texto arbitrarias (por ejemplo, "perro" o "aspiradora").
- Extracción de embeddings de texto: genera representaciones vectoriales de textos descriptivos de sonidos, con dimensión 512.
- Extracción de embeddings de audio: genera representaciones vectoriales de clips de audio, con dimensión 512.
- Recuperación texto-audio: permite buscar en bases de datos de audio usando consultas en lenguaje natural mediante comparación de embeddings.
- Extracción de características (feature extraction): el pipeline de HuggingFace para este modelo es feature-extraction.
- Ejecución en JavaScript: los pesos ONNX permiten inferencia directa en navegadores y Node.js mediante Transformers.js, sin infraestructura Python.

## Casos de uso

- Clasificación de sonidos ambientales en una aplicación web de domótica: el cliente puede distinguir entre ladridos, sirenas o alarmas en tiempo real sin enviar audio a un servidor, gracias a la inferencia local con Transformers.js.
- Búsqueda de clips de audio en bibliotecas de sonido: un desarrollador puede usar consultas de texto para localizar efectos de sonido en un catálogo, comparando embeddings de texto y audio en el espacio latente compartido.
- Moderación de contenido en plataformas de streaming: detección de sonidos inapropiados (gritos, disparos, explosiones) en audio subido por usuarios, con clasificación zero-shot no supervisada.
- Etiquetado automático de grabaciones de campo: investigadores pueden asignar etiquetas de especies animales o eventos acústicos sin entrenar modelos personalizados, usando descripciones textuales como categorías.
- Asistencia auditiva para personas con discapacidad: una aplicación móvil podría notificar al usuario sobre sonidos relevantes del entorno (bebés llorando, timbres, alarmas) mediante clasificación en tiempo real.
- Análisis de audio en servidores Node.js para IoT: procesamiento de audio de sensores en la nube sin necesidad de infraestructura Python, usando el runtime de ONNX en Node.js y Transformers.js para la carga del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 2.2 GB en disco, por lo que la inferencia en el navegador requerirá memoria suficiente para cargar los pesos ONNX.
- GPU recomendada: no disponible. En el navegador se puede usar WebGPU o WebGL si el runtime ONNX lo soporta; en Node.js se puede usar onnxruntime con backend CUDA u otros aceleradores.
- Dispositivos de consumo: puede ejecutarse en navegadores modernos y en CPUs de consumo; la carga inicial de los pesos puede ser pesada por el tamaño de los archivos ONNX.
- Opciones de despliegue: Transformers.js (@xenova/transformers), onnxruntime-web para el navegador, onnxruntime-node para servidores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Ecosistema | Parametros | Contexto | Licencia |
|---|---|---|---|---|---|
| JONNYVERSE/clap-htsat-unfused | ONNX | Transformers.js (JavaScript) | no disponible | no disponible | no disponible |
| laion/clap-htsat-unfused | no disponible (modelo original) | Transformers (Python) | no disponible | no disponible | no disponible |

Ambos modelos comparten la misma arquitectura CLAP. La diferencia principal es el formato de pesos y el ecosistema de ejecución: la versión de JONNYVERSE está adaptada para JavaScript, mientras que el modelo original de laion está pensado para el ecosistema Python de HuggingFace. No hay datos comparativos de rendimiento en la información disponible.

## Limitaciones y advertencias

- La información de licencia es desconocida (no disponible), lo que supone un riesgo para el uso comercial sin verificar la licencia del modelo base de laion.
- No hay datos de benchmarks que respalden su rendimiento en tareas reales, por lo que se recomienda validar la precisión en el caso de uso concreto.
- La model card incluye ejemplos de código que referencian el repositorio `Xenova/clap-htsat-unfused` en lugar del ID `JONNYVERSE/clap-htsat-unfused`, lo que puede producir errores si se copian literalmente.
- El tamaño de los pesos ONNX (2.2 GB) puede ser excesivo para aplicaciones web ligeras; se debe evaluar la viabilidad de una cuantización adicional.
- No se especifican los idiomas soportados, aunque al provenir de un modelo entrenado con datos de LAION es probable que el encoder de texto funcione principalmente en inglés. Esta hipótesis no está confirmada en la información disponible.
- El modelo puede presentar alucinaciones en la clasificación zero-shot si las etiquetas de texto son ambiguas o están fuera de la distribución de entrenamiento del encoder de texto.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere una adopción muy limitada y una posible falta de mantenimiento o validación por parte de terceros.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JONNYVERSE/clap-htsat-unfused
- Modelo base: https://huggingface.co/laion/clap-htsat-unfused
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Paquete NPM de Transformers.js: https://www.npmjs.com/package/@xenova/transformers
- Ficha del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/clap-htsat-unfused-laion
- Catálogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/laion-clap-htsat-unfused
- Guía de Optimum para conversión a ONNX: https://huggingface.co/docs/optimum/index
