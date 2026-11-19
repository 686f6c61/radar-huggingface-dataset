# 21amd21/smaug-ai-image-detector-web

## Resumen

Smaug AI Image Detector, web build es una versión cuantizada y optimizada para navegador del modelo abacusai/Smaug-AI-Image-Detector de Abacus.AI. Su tarea es la clasificación binaria de imágenes: determinar si una imagen ha sido generada por IA o es una fotografía real. El autor de este repositorio (21amd21) no entrena ningún modelo nuevo, sino que transforma el original en un grafo ONNX autocontenido que puede ejecutarse íntegramente en el dispositivo del usuario mediante onnxruntime-web, con aceleración WebGPU o WebAssembly.

La aportación principal es la reducción de tamaño: de 880 MB a 181 MB, manteniendo prácticamente el mismo comportamiento. El modelo original se construye sobre EmbeddingGemma-2, pero esta versión elimina el vocabulario de texto (262K tokens) que no se usa para imágenes y recorta la tabla de posiciones de parches a las 33 filas necesarias para un recorte de 528 px, pasando de 439M a 289M parámetros. Los pesos se cuantizan en una mezcla de 4 bits y 8 bits.

Es relevante para desarrolladores que necesiten detección de imágenes sintéticas sin enviar contenido a un servidor: la inferencia ocurre en el cliente, lo que resuelve problemas de privacidad y latencia en aplicaciones web. La licencia Apache-2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en EmbeddingGemma-2, adaptado a visión (atención eager, opset 18) |
| Parametros totales | 289M (frente a 439M del original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de imagen: 528 × 528 px por recorte, hasta 3 recortes) |
| Tipos de cuantizacion | Mixta: 4 bits (MatMulNBits, bloque 64, simétrico) en la mayor parte; 8 bits (DequantizeLinear, por canal de salida) en las capas de visión 8 a 11 |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo preoptimizado con ONNX Runtime, nivel básico) |

## Arquitectura y entrenamiento

El modelo original de Abacus.AI se basa en EmbeddingGemma-2, un transformer multimodal. Para la tarea de detección, la imagen se divide en parches que se procesan como tokens visuales; la salida es un único logit por imagen que, tras aplicar sigmoid, indica la probabilidad de que sea generada por IA. Esta versión web conserva la arquitectura del original pero elimina los componentes de texto: los cuatro tokens fijos que rodean a la imagen (BOS, inicio de imagen, fin de imagen, EOS) se integran directamente en el grafo y la tabla de posiciones se recorta a 33 filas, las que consume un recorte de 528 px.

No se dispone de información sobre el dataset de entrenamiento original (número de tokens, composición, uso de RLHF o DPO). La model card de esta versión solo describe el proceso de conversión: exportación a ONNX con atención eager, cuantización mixta 4/8 bits y preoptimización del grafo con ONNX Runtime en nivel básico. La decisión de mantener 8 bits en las capas de visión 8 a 11 se justifica empíricamente: el autor observó que la parte lingüística no se degrada con 4 bits, pero esas cuatro capas visuales sí perdían calidad.

## Capacidades

- Clasificación de imágenes en dos clases: real o generada por IA, mediante un score de probabilidad.
- Detección de imágenes sintéticas de generadores recientes: el autor cita pruebas con GPT-Image 2, Nano Banana Pro, Midjourney 7, FLUX.2, Seedream 5, y fotogramas de Sora 2 y Veo 3.
- Detección de deepfakes y contenido visual manipulado (etiqueta `deepfake-detection`).
- Ejecución en navegador con onnxruntime-web, usando WebGPU o WebAssembly como fallback.
- Procesamiento por lotes: la entrada admite `n` recortes (`[n, 3, 528, 528]`) y la salida es un vector de `n` logits que se promedian.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es exclusivamente un clasificador de imágenes.

## Casos de uso

- Moderación de contenido en plataformas web: el modelo se ejecuta en el cliente antes de subir una imagen, de modo que la plataforma puede rechazar contenido sintético sin coste de servidor ni exposición de datos del usuario.
- Verificación en foros y redes sociales: un complemento de navegador podría puntuar imágenes en el momento de visualizarlas, aprovechando WebGPU para obtener resultados en torno a 1,7 s por imagen con 3 recortes.
- Herramientas periodísticas de verificación: un redactor puede comprobar capturas y fotos recibidas sin enviarlas a una API externa, lo que preserva la confidencialidad de las fuentes.
- Protección de plataformas de compraventa: detectar imágenes de producto generadas por IA en anuncios, ejecutando el detector en el propio navegador del comprador o del vendedor.
- Aplicaciones de autenticación de documentos: como filtro preliminar en flujos donde se suben fotos de identidad o justificantes, marcando las que presentan alta probabilidad de ser sintéticas.
- Investigación y docencia: análisis de corpus de imágenes generadas en el navegador, sin necesidad de infraestructura GPU ni instalación de dependencias, útil para estudiar la evolución de los generadores.
- Integración en pipelines de datos: al ser un ONNX autocontenido, puede ejecutarse también en Node.js o en entornos con onnxruntime nativo para etiquetar lotes de imágenes.

## Benchmarks y rendimiento

El autor publica una comparación sobre 300 imágenes del dataset OpenFake (130 reales, 170 generadas por IA), frente al modelo original:

| Metrica | Original (880 MB) | Esta version (181 MB) |
|---|---|---|
| AUC | 0.950 | 0.937 |
| Imagenes IA detectadas (score > 0.5) | 110 / 170 | 110 / 170 |
| Fotos reales marcadas como IA (score > 0.5) | 2 / 130 | 1 / 130 |

El autor indica que los veredictos cambian en 5 de 300 imágenes, todas cerca del umbral 0.5, con un desplazamiento medio de probabilidad de 0.022. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un clasificador de imágenes.

En cuanto a velocidad, en Chrome sobre un PC de gama media: unos 24 s de carga inicial, después aproximadamente 1,7 s por imagen con WebGPU y 3 recortes, o 0,65 s con 1 recorte. El fallback WebAssembly es mucho más lento (unos 19 s por imagen con 1 recorte en un solo hilo), por lo que se recomienda usar 1 recorte y varios hilos en ese modo.

## Requisitos de hardware

- VRAM: no aplica en el caso principal (ejecución en navegador). El modelo ocupa 181 MB en disco y se carga en memoria del navegador; con WebGPU se usa la memoria de la GPU del sistema.
- GPU recomendadas: cualquier GPU integrada o dedicada compatible con WebGPU en el navegador; el autor reporta buen rendimiento en un PC de gama media con Chrome.
- Cabe en GPU de consumo: sí, al ser un modelo de 181 MB y 289M parámetros, es viable en cualquier GPU moderna, incluida la integrada.
- Opciones de despliegue: onnxruntime-web 1.31.1 o superior (WebGPU y WebAssembly); también puede ejecutarse con ONNX Runtime nativo en servidor o Node.js, aunque el autor solo documenta el flujo web.
- Latencia y throughput: aproximadamente 1,7 s por imagen (3 recortes) y 0,65 s (1 recorte) con WebGPU; unos 19 s con WebAssembly de un solo hilo y 1 recorte.
- Nota de compatibilidad: versiones de onnxruntime-web anteriores a 1.31.1 (por ejemplo 1.22-dev) devuelven puntuaciones incorrectas con WebGPU; WebAssembly funciona correctamente en ambas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| 21amd21/smaug-ai-image-detector-web | 289M | Imagen 528 × 528, hasta 3 recortes | Apache-2.0 | Navegador (ONNX, WebGPU/WASM) | 181 MB, AUC 0.937 en OpenFake |
| abacusai/Smaug-AI-Image-Detector | 439M | Imagen 528 × 528 | Apache-2.0 | Servidor (PyTorch/Transformers) | 880 MB, AUC 0.950 en OpenFake |
| Detectores de deepfake genéricos | no disponible | no disponible | variable | variable | No se dispone de datos comparativos verificados en la información proporcionada |

La comparación directa más fiable es con el modelo original, del que este deriva. Para alternativas de terceros no se dispone de datos verificados en la información proporcionada.

## Limitaciones y advertencias

- El score es una probabilidad, no una prueba: el propio autor advierte que no debe usarse como única evidencia en decisiones que afecten a personas.
- Puede fallar con imágenes de generadores nuevos no vistos durante el entrenamiento o la evaluación.
- Puede fallar con imágenes muy editadas, comprimidas o capturas de pantalla.
- Falsos positivos: en la prueba del autor, 1 de cada 130 fotos reales se marcó como IA con umbral 0.5.
- El preprocesado del original usa remuestreo Lanczos; el navegador emplea su suavizado de alta calidad, que no es idéntico, por lo que los scores pueden diferir ligeramente.
- La cuantización mixta introduce un desplazamiento medio de probabilidad de 0.022 y cambia el veredicto en 5 de 300 imágenes cerca del umbral.
- No procesa texto: el vocabulario de EmbeddingGemma-2 se ha eliminado, así que no sirve para tareas multimodales de texto.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo; conviene revisar la licencia y las condiciones del modelo base.
- En producción web, el fallback WebAssembly es demasiado lento para uso interactivo con varios recortes; debe planificarse la ruta WebGPU o reducir a 1 recorte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/21amd21/smaug-ai-image-detector-web
- Modelo base: https://huggingface.co/abacusai/Smaug-AI-Image-Detector
- Dataset de evaluación OpenFake: https://huggingface.co/datasets/ComplexDataLab/OpenFake
- onnxruntime-web (CDN usado en el ejemplo): https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.1/dist/ort.webgpu.min.mjs
