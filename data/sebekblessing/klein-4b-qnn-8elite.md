# sebekblessing/klein-4b-qnn-8elite

## Resumen

FLUX.2 [klein] 4B para Snapdragon 8 Elite es una conversión móvil del modelo de generación y edición de imágenes FLUX.2 [klein] 4B de Black Forest Labs, compilada como binarios de contexto QNN para la unidad neuronal Hexagon v79 que integra el SoC Snapdragon 8 Elite (por ejemplo, en el iQOO 13). El autor de la conversión es sebekblessing y el artefacto se publica en Hugging Face bajo licencia Apache 2.0, con un tamaño de repositorio de 5,0 GB. El modelo genera imágenes de 512x512 en 4 pasos de muestreo y también permite editar una imagen a partir de una instrucción en lenguaje natural.

La relevancia de esta ficha es doble. Por un lado, demuestra la viabilidad de ejecutar un modelo de difusión de 4B parámetros en el acelerador NPU de un teléfono de gama alta, sin depender de la GPU ni de la nube. Por otro, expone el estado actual del ecosistema de despliegue en dispositivo: los pesos no se distribuyen en safetensors ni GGUF, sino como binarios QNN ya cuantizados y compilados, lo que limita su uso a la app Anima (Android) y al hardware objetivo. El repositorio incluye además los scripts de conversión en el directorio `build/`.

No se dispone de información publicada sobre idiomas soportados, benchmarks ni parámetros activos, por lo que esos apartados se marcan como no disponibles. La información disponible se limita a la model card del autor y a los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (text-to-image e image-editing) basado en FLUX.2 [klein] 4B; compilado como binarios de contexto QNN para Hexagon v79 |
| Parametros totales | 4B (según el nombre del modelo base FLUX.2 [klein] 4B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización aplicada durante la conversión a ONNX y compilación QNN; el prompt reader se distribuye como `klein_qwen_q8.raw` (int8). No se detallan otras precisiones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base FLUX.2 [klein] 4B); Qwen3-4B Apache 2.0; taef2 MIT |
| Formato de pesos | Binarios QNN (`.bin`, `.raw`), no safetensors ni GGUF; incluye `manifest.json` con tamaños y SHA-256 |

## Arquitectura y entrenamiento

El artefacto es una conversión del modelo FLUX.2 [klein] 4B, un modelo de difusión de 4B parámetros orientado a generación de imágenes a partir de texto y a edición de imágenes guiada por instrucción. La conversión sigue un pipeline de tres etapas: exportación de los pesos originales a ONNX, cuantización y compilación a binarios de contexto QNN para la NPU Hexagon v79 del Snapdragon 8 Elite. El paquete se descompone en módulos separados: el lector de prompts (Qwen3-4B cuantizado a int8 en `klein_qwen_q8.raw`, con su tokenizador `qwen_tokenizer.json` y los ficheros `text0.bin` a `text2.bin`), el modelo generador (`part0.bin` a `part3.bin`) y el codificador/decodificador de imagen taef2 (`enc.bin`, `dec.bin`), obra de madebyollin bajo licencia MIT.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, la composición de datos ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card de FLUX.2 [klein] 4B, que no se ha proporcionado. La innovación técnica destacable de esta conversión es la compilación estática para una NPU móvil concreta, que permite inferencia local con 4 pasos de muestreo a 512x512, a costa de sacrificar portabilidad y fidelidad exacta respecto a los pesos originales (el autor advierte que las imágenes pueden diferir ligeramente). El repositorio incluye en `build/` los scripts y una guía paso a paso para reproducir la compilación desde los pesos originales.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución 512x512 en 4 pasos de muestreo.
- Edición de imágenes a partir de una instrucción en lenguaje natural (image-editing).
- Procesamiento de prompts mediante un codificador de texto Qwen3-4B cuantizado a int8.
- Codificación y decodificación de imágenes mediante taef2 (`enc.bin`, `dec.bin`).
- Ejecución local en la NPU Hexagon v79 del Snapdragon 8 Elite, sin necesidad de GPU ni de conexión a la nube.
- Integración con la app Anima para Android, que descarga los ficheros a partir de `manifest.json` y verifica su integridad mediante SHA-256.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Generación de imágenes en el propio teléfono: el modelo produce imágenes de 512x512 en 4 pasos directamente en la NPU del Snapdragon 8 Elite, lo que permite crear ilustraciones o bocetos sin enviar prompts a un servidor y sin coste de inferencia en la nube.
- Edición fotográfica guiada por instrucción: el usuario puede modificar una imagen existente describiendo el cambio en lenguaje natural; el módulo taef2 se encarga de codificar la imagen de entrada y decodificar el resultado, todo en dispositivo.
- Aplicaciones de privacidad estricta: al ejecutarse localmente, los prompts y las imágenes no abandonan el dispositivo, lo que resulta adecuado para edición de documentos personales, material médico o contenido sensible.
- Prototipado de apps Android con IA generativa: los desarrolladores pueden usar el paquete y la app Anima como referencia para integrar generación de imágenes en sus propias aplicaciones sobre Snapdragon 8 Elite, reutilizando el `manifest.json` para la descarga y verificación de ficheros.
- Demostración educativa de compilación QNN: el directorio `build/` con los scripts de conversión ONNX a QNN sirve como caso práctico para aprender a llevar un modelo de difusión de 4B a una NPU Hexagon, incluyendo cuantización y empaquetado.
- Creación de contenido offline: útil en entornos sin conectividad fiable (viajes, zonas rurales, eventos) donde el usuario necesita generar o editar imágenes sin depender de la red.
- Evaluación de hardware: permite medir el rendimiento real de la NPU Hexagon v79 en cargas de difusión de 4B parámetros, como base para comparar con otras generaciones de Snapdragon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de calidad de imagen (FID, CLIP score), latencia ni throughput en la model card, y tampoco se ofrecen comparaciones con el modelo original FLUX.2 [klein] 4B más allá de la advertencia de que las imágenes pueden diferir ligeramente por la cuantización y compilación.

## Requisitos de hardware

- Hardware objetivo: SoC Snapdragon 8 Elite con NPU Hexagon v79 (el autor cita el iQOO 13 como dispositivo de referencia).
- VRAM: no aplica; la inferencia se ejecuta en la NPU del SoC, no en una GPU dedicada. El repositorio ocupa 5,0 GB, lo que da una idea del espacio de almacenamiento necesario en el dispositivo.
- GPU recomendadas: no disponible; el paquete no está pensado para GPU de escritorio (A100, H100, RTX 4090) al estar compilado como binarios QNN.
- Compatibilidad con GPU de consumo: no, salvo que se recompile el modelo desde los pesos originales con otro backend.
- Opciones de despliegue: app Anima para Android (https://github.com/adiirfan/anima-android), que descarga los ficheros automáticamente; scripts de compilación en `build/` del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| FLUX.2 [klein] 4B QNN 8 Elite (este) | 4B | no disponible | Binarios QNN | Apache 2.0 | NPU Hexagon v79 (Snapdragon 8 Elite) |
| FLUX.2 [klein] 4B (original) | 4B | no disponible | Pesos originales (no detallado) | Apache 2.0 | GPU/CPU con frameworks de difusión |
| Qwen3-4B | 4B | no disponible | safetensors, GGUF (habitual) | Apache 2.0 | GPU, CPU, llama.cpp, vLLM |
| taef2 (madebyollin) | no disponible | no disponible | no disponible | MIT | Codificador/decodificador de imagen |

La comparación se limita a los componentes citados en la model card. No se dispone de datos de rendimiento ni de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría (por ejemplo, otros modelos de difusión de 4B o conversiones móviles equivalentes).

## Limitaciones y advertencias

- Fidelidad reducida: la cuantización y compilación QNN pueden producir imágenes ligeramente distintas a las del modelo original FLUX.2 [klein] 4B, según advierte el autor.
- Portabilidad nula: los binarios están compilados para Hexagon v79 (Snapdragon 8 Elite); no funcionan en otras NPU, GPU de escritorio ni CPUs sin recompilar.
- Dependencia de la app Anima: el paquete está diseñado para esa aplicación Android concreta; su uso fuera de ella requiere implementar la carga de los binarios QNN y el pipeline de difusión.
- Resolución limitada: 512x512 y 4 pasos de muestreo, lo que restringe el detalle y la calidad frente a configuraciones de mayor resolución o más pasos.
- Idiomas no documentados: se desconoce qué lenguas admite el codificador de texto Qwen3-4B en esta conversión, aunque el modelo base es multilingüe.
- Sin benchmarks publicados: no hay métricas de calidad, latencia ni consumo energético que permitan evaluar el rendimiento en producción.
- Licencias: el modelo base es Apache 2.0, Qwen3-4B Apache 2.0 y taef2 MIT; se deben respetar las condiciones de cada componente, incluida la atribución correspondiente.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes incoherentes o no fieles al prompt, especialmente con instrucciones ambiguas.
- Sesgos: no se documentan sesgos específicos, pero al derivar de un modelo entrenado con datos web, es probable que herede sesgos de representación; no hay información disponible para cuantificarlos.
- Repositorio sin descargas ni likes: el artefacto es reciente y no cuenta con validación comunitaria; conviene verificar los SHA-256 de `manifest.json` antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/sebekblessing/klein-4b-qnn-8elite
- Modelo base FLUX.2 [klein] 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- App Anima para Android: https://github.com/adiirfan/anima-android
- Scripts de compilación: `build/README.md` dentro del repositorio
- taef2 (madebyollin): no se proporciona URL en la información disponible
