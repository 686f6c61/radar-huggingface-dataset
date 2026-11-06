# Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q3_K_M-GGUF

## Resumen

Qwen3.5-4B-GLB-3D-Coder-Q3_K_M-GGUF es una cuantización comunitaria en formato GGUF (tipo Q3_K_M) del modelo ccore/Qwen3.5-4B-GLB-3D-Coder, un fine-tune de Qwen3.5-4B especializado en generación de código para activos 3D, en concreto escenas Three.js y exportación de ficheros GLB. La publica el usuario Chungulus, no es una versión oficial de Qwen ni de CCORE, y se distribuye bajo licencia Apache 2.0.

El checkpoint original contiene 4.539.265.536 parámetros (pesos de texto en F32 y pesos de visión en BF16). Chungulus exportó la red de texto a F16 conservando tensores sensibles en F32 (4.205.751.296 parámetros) y la cuantizó de forma independiente a Q3_K_M, sin reutilizar checkpoints de baja precisión ni aplicar matrices de calibración o de importancia. Se incluye sin modificar el proyector visual original `mmproj-Qwen3.5-4B-BF16.gguf`, de modo que el artefacto conserva capacidad image-text-to-text.

El interés del modelo es acotado pero específico: es una opción ligera (repo de 2,9 GB) para generar HTML con Three.js y código de exportación GLB en hardware modesto mediante llama.cpp, con soporte de entrada de imágenes a través del proyector multimodal. La predicción multi-token (MTP) no se ha exportado en esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-4B), con torre de visión y proyector multimodal separado |
| Parametros totales | 4.205.751.296 (red de texto exportada); 4.539.265.536 en el checkpoint original con visión |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma oficial; el autor de la cuantización usa 16.384 tokens en sus ejemplos |
| Tipos de cuantizacion | Q3_K_M (este repo); el modelo base admite otras cuantizaciones GGUF publicadas por terceros |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), más `mmproj` BF16 para visión |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su linaje: es un fine-tune de Qwen3.5-4B realizado por CCORE, con pesos de texto en F32 y pesos de visión en BF16 en el checkpoint original. El proceso de cuantización de esta ficha parte de una exportación F16 de la red de texto (manteniendo tensores sensibles en F32) y aplica Q3_K_M sin calibración ni importance matrix. El proyector visual se incluye sin cambios en BF16. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación destacable no está en la arquitectura sino en el propósito del fine-tune: el modelo está orientado a generar código de activos 3D, en particular escenas Three.js completas y código de exportación GLB. El modelo original soporta predicción multi-token (MTP), pero esa capacidad no se ha exportado en esta cuantización y el autor recomienda desactivarla en los frontends que intenten habilitarla.

## Capacidades

- Generación de código: produce ficheros HTML completos con Three.js, incluyendo escenas y controles de exportación GLB.
- Generación de código de exportación GLB mediante la API GLTFExporter de Three.js.
- Entrada de imágenes (image-text-to-text) a través del proyector `mmproj` BF16 incluido; el autor valida casos básicos de descripción e identificación de formas y colores.
- Salida estructurada en JSON: verificada en las pruebas del cuantizador.
- Aritmética básica: verificada en las pruebas del cuantizador.
- Razonamiento con modo "thinking": el modelo original lo soporta y el autor recomienda activarlo con sus ajustes de muestreo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Generación de escenas Three.js en un solo fichero HTML: el modelo produce código completo con geometría, materiales y luces, adecuado para prototipado rápido de visores 3D en el navegador.
- Exportación de activos GLB desde el navegador: genera el código que conecta la escena con `GLTFExporter` para descargar el modelo como fichero GLB, útil en herramientas internas de creación de activos.
- Asistente de código 3D en local: con 2,9 GB de repo y cuantización Q3_K_M, puede ejecutarse en equipos de gama media mediante llama.cpp para autocompletar y revisar código Three.js sin depender de la nube.
- Descripción de imágenes de referencia: usando `llama-mtmd-cli` con el proyector incluido, el modelo puede describir una imagen de entrada (por ejemplo, una forma o un color) y servir de base para generar la escena correspondiente.
- Generación de snippets JSON y comprobaciones aritméticas dentro de pipelines de herramientas: el autor valida salida JSON y aritmética nativa, lo que permite integrarlo en scripts de validación de activos.
- Prototipado de demos interactivas 3D: para equipos que necesitan maquetas web con Three.js generadas a partir de una descripción textual, con revisión manual posterior del código.
- Evaluación de cuantizaciones de bajo bit para código: útil como caso de estudio de hasta dónde llega Q3_K_M en una tarea de generación de código estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la cuantización solo documenta comprobaciones funcionales acotadas: aritmética nativa, salida JSON y dos casos de comprensión de imágenes (identificación de un cuadrado central de color en fixtures rojo/azul con 1.024 tokens de imagen, temperatura 0 y semilla 42), además de la validación sintáctica del ejemplo de cubo con exportación GLB. El autor indica explícitamente que no se probaron el renderizado en navegador, la descarga e importación real del GLB, vídeo, el comportamiento a contexto completo ni la precisión en benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 2,9 GB, por lo que la cuantización Q3_K_M más el proyector BF16 cabe holgadamente en GPUs con 6-8 GB de VRAM; con contexto de 16.384 tokens conviene reservar margen adicional para la caché KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100; el modelo es lo bastante pequeño para no requerir GPUs de centro de datos.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6-8 GB de VRAM; también puede ejecutarse en CPU con llama.cpp, a menor velocidad.
- Opciones de despliegue: llama.cpp (build de referencia commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`), `llama-completion` para texto y `llama-mtmd-cli` para imagen; no se documenta soporte verificado en vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El autor recomienda desactivar MTP/predicción especulativa en los frontends que intenten habilitarla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-GLB-3D-Coder-Q3_K_M-GGUF (este) | 4.205.751.296 (texto) | no disponible (ejemplos a 16.384) | Código Three.js y GLB, multimodal | Apache 2.0 | GGUF en Hugging Face |
| Chungulus/Qwen3.5-4B-3D-Coder-Q3_K_M-GGUF | 4.205.751.296 (texto) | no disponible | Escenas Three.js, multimodal | Apache 2.0 | GGUF en Hugging Face |
| prithivMLmods/Qwen3.5-4B-3D-Coder-GGUF | 4B | no disponible | Código 3D, image-text-to-text | no disponible | GGUF en Hugging Face |
| ccore/Qwen3.5-4B-GLB-3D-Coder (original) | 4.539.265.536 | no disponible | Código Three.js y GLB, multimodal | Apache 2.0 | Pesos originales en Hugging Face |

Las alternativas de la misma categoría son esencialmente variantes del mismo fine-tune de CCORE: una cuantización comunitaria previa centrada en escenas Three.js y otra cuantización GGUF de otro autor. No se dispone de datos de rendimiento comparativos entre ellas.

## Limitaciones y advertencias

- Cuantización comunitaria no oficial: no está publicada por Qwen ni por CCORE; el autor lo indica explícitamente.
- Cuantización Q3_K_M sin calibración ni importance matrix: puede degradar la calidad respecto al checkpoint original, especialmente en generación de código largo.
- Predicción multi-token (MTP) no exportada: hay que desactivarla en frontends que intenten habilitarla.
- Comprensión de imágenes con evidencia limitada: el propio autor advierte que los casos validados son pocos y no garantizan un grounding fiable; además, una prueba inicial ambigua quedó documentada como caso no concluyente.
- Sin pruebas de renderizado en navegador, descarga e importación real de GLB, vídeo ni comportamiento a contexto completo: el código generado debe revisarse en el editor antes de usarse.
- Riesgo de alucinación en APIs: el código puede referenciar APIs de Three.js o GLTFExporter inexistentes o con firmas incorrectas; la validación del autor se limita a comprobaciones sintácticas y de API esperadas.
- Idiomas soportados no documentados: no hay garantía de calidad fuera del inglés técnico empleado en los ejemplos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar la licencia y la atribución originales; se incluyen `LICENSE` y `chat_template.jinja` del modelo base.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q3_K_M-GGUF
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder
- Model card del checkpoint original: https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder/blob/8f32a199f8b22fe3157b9c5c8b42b052a0750dd3/README.md
- Cuantización previa del mismo autor (Three.js): https://huggingface.co/Chungulus/Qwen3.5-4B-3D-Coder-Q3_K_M-GGUF
- Cuantización GGUF de prithivMLmods: https://huggingface.co/prithivMLmods/Qwen3.5-4B-3D-Coder-GGUF
