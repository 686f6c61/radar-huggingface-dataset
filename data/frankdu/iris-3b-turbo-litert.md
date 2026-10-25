# frankdu/iris-3b-Turbo-LiteRT

## Resumen

iris-3b-Turbo-LiteRT es un espejo público de la conversión a LiteRT del modelo de difusión texto-a-imagen iris-3b-Turbo, publicada originalmente por LiteRT Community y convertida aquí por el usuario frankdu. No se trata de un modelo de lenguaje: son grafos de difusión en espacio de píxeles a 768 × 768 con cuatro pasos de muestreo, sin VAE, y con un codificador de texto Qwen3-VL-4B como condicionamiento. El repositorio distribuye doce grafos de codificador de texto y ocho grafos de difusión que se cargan de uno en uno, junto con los motores de referencia para Android y Python.

El interés práctico del artefacto es el formato: pesos convertidos a grafos LiteRT/TFLite (no checkpoints `.litertlm`) pensados para ejecución en CPU, con conversión realizada upstream y preservada byte a byte, incluido un `artifact_manifest.json` con revisión inmutable, tamaños y digests SHA-256. Es un artefacto experimental, con cero descargas y cero likes en el momento de la ficha, y su validación se limita a una comprobación de humo en escritorio.

La relevancia es acotada pero real: permite reproducir en Linux x86_64 una generación completa con LiteRT 2.3.0 sin GPU, y sirve como referencia para integrar el pipeline en la aplicación Android Research Lab. La ejecución en teléfono, los requisitos de memoria móvil y la ejecución en TPU de Google Tensor no han sido validadas por el autor del espejo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión en espacio de píxeles (sin VAE) con condicionamiento por codificador de texto Qwen3-VL-4B; grafos LiteRT con 12 grafos de codificador de texto y 8 grafos de difusión |
| Parámetros totales | 3B en el modelo de difusión según la denominación del modelo base (`speridlabs/iris-3b`); el codificador de texto es Qwen3-VL-4B. Desglose exacto no disponible en la model card |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen); límite de tokens del prompt no disponible |
| Tipos de cuantización | No disponible (se distribuyen grafos LiteRT ya convertidos; no se documentan variantes de cuantización) |
| Idiomas soportados | No disponible (el codificador Qwen3-VL-4B es multilingüe, pero la model card no declara idiomas para esta conversión) |
| Licencia | Apache 2.0 (según metadatos del repo y model card; se remite a LICENSE/NOTICE y a la model card upstream) |
| Formato de pesos | Grafos LiteRT/TFLite (explícitamente no son checkpoints `.litertlm`); incluye `artifact_manifest.json` con SHA-256 |

Otros datos: resolución de salida 768 × 768, 4 pasos de muestreo, tamaño del repositorio 13,7 GB, revisión de origen `743fd20acefd7f9ddcf3585f88bcda3257f7213a`, creado el 24 de octubre de 2026.

## Arquitectura y entrenamiento

La arquitectura es un pipeline de difusión "Turbo" de pocos pasos (cuatro pasos de muestreo declarados) que opera directamente en espacio de píxeles a 768 × 768, sin VAE intermedio. El condicionamiento textual lo aporta Qwen3-VL-4B, materializado en doce grafos LiteRT separados; la parte generativa se reparte en ocho grafos de difusión que el runner carga de forma secuencial, uno cada vez. No hay atención lineal, decodificación especulativa ni componentes híbridos SSM: es un pipeline de difusión convencional convertido a formato de ejecución móvil.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni sobre si hubo ajuste por RLHF o DPO; la model card del espejo no documenta el proceso de entrenamiento del modelo base y remite a las model cards upstream. La innovación técnica destacable no está en el entrenamiento, sino en la distribución: conversión a grafos LiteRT con compartición de un único `Environment` de LiteRT, carga y liberación de buffers tensoriales entre etapas, y preservación de la disposición de los grafos para su reutilización por la aplicación Android Research Lab. La conversión fue realizada por LiteRT Community en la revisión `743fd20...`, no por el publicador de este espejo.

## Capacidades

- Generación de imágenes texto-a-imagen a 768 × 768 en cuatro pasos de muestreo.
- Inferencia en CPU sin GPU, validada en escritorio Linux x86_64 con LiteRT 2.3.0.
- Control de semilla (`--seed`) para reproducibilidad dentro de un mismo runtime; distintos runtimes pueden generar muestras distintas con la misma semilla entera.
- Control del número de hilos de ejecución (`--threads`) para ajustar el uso de CPU.
- Ejecución por etapas con carga de grafos de uno en uno, lo que reduce el pico de memoria simultáneo frente a cargar todo el pipeline.
- Integración Android prevista mediante los motores de referencia incluidos, con la exigencia de ejecutar fuera del hilo principal y liberar buffers entre etapas.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo "thinking": no es un modelo de lenguaje.
- Capacidades multilingües del prompt: no documentadas para esta conversión.

## Casos de uso

- Generación de imágenes de prueba en CI/CD sin GPU: el runner de Python permite invocar el pipeline con prompt y semilla fijos para producir assets reproducibles en máquinas sin acelerador, útil como prueba de integración de artefactos LiteRT.
- Prototipado offline en estación de trabajo Linux: al ejecutarse en CPU con LiteRT 2.3.0, se puede generar imagen local sin depender de servicios externos, lo que encaja en entornos con requisitos de privacidad sobre el prompt.
- Referencia de integración para aplicaciones Android: el repositorio conserva la disposición de grafos y los motores de referencia que utiliza la aplicación Research Lab, de modo que sirve como base para portar el pipeline a un cliente móvil (rendimiento en teléfono no validado).
- Investigación sobre conversión de difusión a LiteRT: los manifiestos con revisión inmutable y SHA-256 permiten auditar que los grafos distribuidos coinciden byte a byte con la conversión upstream, útil para trabajos de reproducibilidad.
- Experimentación con difusión de pocos pasos: los cuatro pasos de muestreo y la ausencia de VAE hacen del artefacto un banco de pruebas para estudiar el equilibrio entre coste de inferencia y calidad en espacio de píxeles.
- Docencia y demostraciones de despliegue en CPU: un pipeline completo de texto-a-imagen ejecutable con un comando y `threads=8` resulta manejable para sesiones prácticas sobre formatos de despliegue (LiteRT frente a Diffusers).
- Validación de pipelines de conversión en entornos de investigación: la comprobación de humo documentada (una manzana reconocible con semilla 42) puede reutilizarse como test de regresión tras recambiar versiones de LiteRT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única validación documentada es una comprobación de humo cualitativa: una generación completa en escritorio con LiteRT 2.3.0 sobre Linux x86_64, con verificación visual de que la muestra era una manzana reconocible (`validation.json`). El propio autor indica explícitamente que no es un benchmark comparativo de calidad ni de velocidad, y no se publican latencias, throughput ni métricas FID/CLIP.

## Requisitos de hardware

- VRAM: no disponible. El pipeline valida ejecución en CPU, por lo que no requiere GPU para la ruta probada.
- RAM: el repositorio completo ocupa 13,7 GB, pero los grafos se cargan de uno en uno; el pico de memoria real no está publicado.
- GPU recomendadas: no disponibles ni necesarias para la ruta validada; la ejecución en GPU Android no ha sido validada en este repositorio.
- GPU de consumo: no aplica a la ruta CPU validada; no se documenta soporte CUDA.
- Despliegue: runner de Python 3.12 (`python/iris3b_litert.py`) sobre LiteRT 2.3.0, más motores de referencia Android incluidos. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusión en grafos LiteRT.
- Requisitos de integración: ejecutar fuera del hilo principal en Android, liberar buffers tensoriales y modelos entre etapas y compartir un único `Environment` de LiteRT.
- Latencia y throughput: no disponibles. El autor advierte que la carga de grafos, la compilación y las copias de tensores a host pueden ser costosas.
- TPU: la ejecución en Google Tensor no ha sido validada.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución y pasos | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| iris-3b-Turbo-LiteRT (este repo) | Difusión texto-a-imagen, espejo | 768 × 768, 4 pasos | Grafos LiteRT/TFLite | Apache 2.0 | Experimental, 0 descargas, validación de humo en CPU |
| litert-community/iris-3b-Turbo-LiteRT | Conversión upstream original | 768 × 768, 4 pasos | Grafos LiteRT/TFLite | Apache 2.0 (según origen) | Fuente de este espejo, misma revisión `743fd20...` |
| speridlabs/iris-3b | Modelo base | No disponible en la información proporcionada | Pesos Diffusers | No disponible en la información proporcionada | Origen de los pesos antes de la conversión |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables (por ejemplo, otros modelos Turbo de pocos pasos o conversiones LiteRT equivalentes) en la información proporcionada, por lo que no se establece comparación cuantitativa.

## Limitaciones y advertencias

- Artefacto experimental: cero descargas y cero likes en el momento de la ficha, sin validación independiente por parte de la comunidad.
- La validación se limita a una comprobación de humo en escritorio Linux x86_64; no constituye una evaluación de calidad ni de velocidad frente al modelo original en Diffusers.
- La ejecución en CPU/GPU de Android, los requisitos de memoria en teléfono y la ejecución en TPU de Google Tensor no han sido validadas; el éxito en escritorio no implica rendimiento aceptable en móvil.
- No son checkpoints `.litertlm`: una llamada a un grafo aislado con entradas aleatorias no genera una imagen con sentido; es obligatorio usar el pipeline completo.
- La misma semilla entera puede producir muestras distintas en runtimes distintos; la reproducibilidad solo está garantizada dentro del mismo runner documentado.
- Sesgos: no documentados. Al depender de un codificador Qwen3-VL-4B y de un dataset de entrenamiento no descrito, no es posible evaluar sesgos de representación con la información disponible.
- Alucinación en sentido estricto no aplica; la fidelidad al prompt no ha sido medida con métricas publicadas.
- Calidad en detalles finos: no evaluada; el pipeline opera en espacio de píxeles sin VAE y a 768 × 768, pero no se publican comparaciones de calidad.
- Licencia: se declara Apache 2.0, pero la conversión y el espejo no alteran los términos del modelo original; deben revisarse LICENSE/NOTICE y `SOURCE_MODEL_CARD.md`, así como la licencia del modelo base, antes de un uso comercial.
- Coste de ejecución: la carga de grafos, la compilación y las copias de tensores a host pueden ser caras; no se publican cifras de latencia para dimensionar producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/frankdu/iris-3b-Turbo-LiteRT
- Conversión original (LiteRT Community): https://huggingface.co/litert-community/iris-3b-Turbo-LiteRT
- Revisión inmutable de origen: https://huggingface.co/litert-community/iris-3b-Turbo-LiteRT/tree/743fd20acefd7f9ddcf3585f88bcda3257f7213a
- Modelo base: https://huggingface.co/speridlabs/iris-3b
