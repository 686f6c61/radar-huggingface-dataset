# onnxruntime/Gemma-3-ONNX

## Resumen

Gemma-3-ONNX es la conversión optimizada de los modelos Gemma 3 con capacidad de visión, publicada por el equipo de ONNX Runtime (Microsoft) para acelerar la inferencia mediante ONNX Runtime. No se trata de un modelo nuevo entrenado desde cero, sino de una distribución de los pesos originales de Gemma 3 (desarrollados por Google DeepMind) convertidos al formato ONNX y cuantizados, con el objetivo de ejecutarlos de forma eficiente en CPU, GPU y plataformas móviles.

El repositorio incluye tres variantes de tamaño del modelo base: `gemma-3-4b-it`, `gemma-3-12b-it` y `gemma-3-27b-it`, todas en su versión instruction-tuned y multimodal (visión + texto). Cada variante se ofrece en configuraciones optimizadas: int4 para CPU y móvil, int4 para CUDA e int4 para GPU con DirectML, empleando cuantización RTN (Round-To-Nearest) con bloques de 32.

La relevancia de esta publicación radica en que facilita el despliegue de Gemma 3 en entornos donde no se dispone de frameworks de inferencia especializados en PyTorch, y en que ONNX Runtime ofrece soporte nativo en Windows, Linux, macOS y dispositivos móviles. El repositorio ocupa 105,1 GB y está bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión), conversión a ONNX del modelo Gemma 3 |
| Parametros totales | 4B, 12B y 27B (tres variantes incluidas en el repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 RTN (block-32) para CPU/móvil, int4 RTN para CUDA, int4 RTN para GPU (DirectML); también bf16-io y fp16-io en las variantes GPU |
| Idiomas soportados | Multilingüe: ar, zh, cs, da, nl, en, fi, fr, de, he, hu, it, ja, ko, no, pl, pt, ru, es, sv, th, tr, uk |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3, un transformer multimodal desarrollado por Google DeepMind que procesa texto e imágenes. Esta publicación no entrena el modelo, sino que realiza la conversión de los pesos originales al formato ONNX y aplica optimizaciones de cuantización para distintos backends de ejecución. Se ofrecen configuraciones con cuantización int4 mediante RTN con bloques de 32 y nivel de acumulación 4 para CPU y móvil, y variantes con entradas/salidas en bf16 o fp16 combinadas con pesos int4 para CUDA y DirectML.

No se proporcionan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones arquitectónicas específicas más allá de la naturaleza multimodal del modelo original. La model card indica explícitamente que puede haber pequeñas diferencias en la salida respecto al modelo base debido a las optimizaciones aplicadas.

## Capacidades

- Generación de texto y razonamiento en modo instruction-tuned (`-it`).
- Procesamiento de imágenes (visión) combinado con texto, según el nombre del repositorio ("Gemma-3 Vision ONNX") y el script de ejemplo `model-mm.py`.
- Soporte multilingüe en 24 idiomas, incluyendo español, inglés, francés, alemán, chino, japonés, árabe y ruso, entre otros.
- Ejecución en CPU, GPU CUDA y GPU con DirectML a través de ONNX Runtime GenAI.
- Capacidad de ejecución en dispositivos móviles mediante la variante int4 para CPU.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en servidores Windows y Linux sin stack de PyTorch: al estar en formato ONNX, el modelo se ejecuta con ONNX Runtime GenAI, lo que simplifica el despliegue en entornos corporativos donde se prefiere evitar dependencias de Python/PyTorch en producción.
- Inferencia en CPU para entornos sin GPU: la variante `cpu-int4-rtn-block-32-acc-level-4` permite ejecutar los modelos de 4B, 12B y 27B en CPU, adecuada para estaciones de trabajo o servidores sin acelerador dedicado.
- Aplicaciones de escritorio con aceleración DirectML: la variante `gpu-fp16-io-int4-rtn-block-32` se integra en aplicaciones Windows que usan DirectML, permitiendo inferencia local en GPUs de consumo sin CUDA.
- Procesamiento multimodal en local: el script `model-mm.py` demuestra el uso de entrada de imagen y texto, útil para tareas de descripción de imágenes, OCR asistido o question answering sobre documentos visuales en entornos con privacidad de datos.
- Asistentes multilingües: con soporte para 24 idiomas, el modelo puede emplearse en sistemas de atención al cliente o generación de contenido en español, catalán no incluido pero sí francés, portugués, alemán e italiano, entre otros.
- Prototipado rápido con ONNX Runtime GenAI: el paquete `onnxruntime-genai` y los ejemplos oficiales permiten validar el modelo en pocos pasos, adecuado para pruebas de concepto y evaluación antes de pasar a producción.
- Integración en pipelines de CI/CD para validación de modelos: al ser artefactos ONNX versionados, se pueden incluir en pruebas automatizadas de regresión de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa basada en el tamaño de los pesos cuantizados a int4: el modelo de 4B requeriría aproximadamente 2-3 GB, el de 12B en torno a 6-8 GB y el de 27B alrededor de 14-16 GB, aunque estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada. La model card menciona soporte para CUDA y DirectML, pero no especifica modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; la existencia de variantes int4 para GPU y DirectML sugiere que se busca compatibilidad con hardware de consumo, pero no se detalla.
- Opciones de despliegue: ONNX Runtime GenAI (`onnxruntime-genai`, `onnxruntime-genai-cuda`, `onnxruntime-genai-directml`), con ejemplos en Python (`model-mm.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-ONNX (esta ficha) | 4B / 12B / 27B | no disponible | MIT | ONNX | Hugging Face (onnxruntime) |
| Gemma 3 (original, Google DeepMind) | 4B / 12B / 27B | no disponible en la informacion | Gemma Terms of Use | safetensors | Hugging Face (google) |
| Modelos ONNX de otros proveedores | no disponible | no disponible | variable | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparación principal es con el modelo Gemma 3 original: esta versión ONNX ofrece el mismo modelo base con optimizaciones de cuantización y compatibilidad con ONNX Runtime, a cambio de posibles diferencias menores en las salidas. Nótese que la licencia de esta conversión es MIT, mientras que el modelo original de Google se distribuye bajo los Gemma Terms of Use, lo que conviene verificar antes de un uso comercial.

## Limitaciones y advertencias

- Al ser una conversión optimizada, puede haber diferencias en las salidas respecto al modelo Gemma 3 original; la model card recomienda verificar y probar en cada escenario.
- La model card declara explícitamente que cualquier riesgo asociado al modelo es responsabilidad del usuario.
- No se documentan sesgos conocidos ni tasas de alucinación en la información proporcionada.
- La longitud de contexto no se especifica en la información disponible; conviene consultar la documentación del modelo Gemma 3 original.
- Aunque la licencia de esta conversión es MIT, el modelo base Gemma 3 está sujeto a los términos de licencia de Google; es necesario revisar las condiciones de uso comercial del modelo original.
- El repositorio ocupa 105,1 GB, lo que implica requisitos de almacenamiento considerables si se descargan todas las variantes; la model card recomienda descargar solo la variante necesaria mediante `--include`.
- La información sobre tool calling, agentes y modo thinking no está disponible, por lo que no debe asumirse su soporte sin verificación previa.
- El número de descargas (13) y likes (3) es bajo, lo que sugiere una adopción limitada y menor validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onnxruntime/Gemma-3-ONNX
- Ejemplo de ejecución multimodal (ONNX Runtime GenAI): https://github.com/microsoft/onnxruntime-genai/blob/main/examples/python/model-mm.py
- Repositorio ONNX Runtime GenAI: https://github.com/microsoft/onnxruntime-genai
- Script auxiliar de ejemplo: https://raw.githubusercontent.com/microsoft/onnxruntime-genai/main/examples/python/common.py
