# experimentalmachines/SmolLM2-135M-Instruct-ExecuTorch

## Resumen

SmolLM2-135M-Instruct-ExecuTorch es una exportación del modelo HuggingFaceTB/SmolLM2-135M-Instruct a formato ExecuTorch (.pte), preparada por el usuario experimentalmachines para inferencia en dispositivo (on-device) en Android. No se trata de un modelo nuevo entrenado desde cero, sino de una compilación cuantizada del modelo base de 135 millones de parámetros de Hugging Face, empaquetada con múltiples backends de ejecución (XNNPACK para CPU, Vulkan para GPU, QNN para NPU de Qualcomm y NeuroPilot para NPU de MediaTek) y distintas ventanas de contexto fijas.

El interés de esta ficha radica en que demuestra el flujo de despliegue de un LLM pequeño en hardware móvil de gama alta, con variantes que cubren desde cualquier dispositivo arm64 hasta aceleradores específicos como el Snapdragon 8 Elite (SM8750) y el Dimensity 9400 (MT6991). Cada archivo .pte incorpora una ventana de contexto fija (2k, 4k, 8k, 16k o 32k tokens) y una cuantización 8da4w con GPTQ para los backends XNNPACK y Vulkan, o esquemas híbridos/a16w8 para los backends NPU.

Es relevante ahora porque el ecosistema ExecuTorch 1.5.1 permite ejecutar modelos de lenguaje directamente en teléfonos sin conexión, con tamaños de archivo de entre 0,04 GB y 0,21 GB según backend y ventana, lo que lo hace apto para aplicaciones Android con presupuesto de memoria ajustado (la propia model card menciona un presupuesto de referencia de 5 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M-Instruct) |
| Parametros totales | 135 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Fija por archivo: 2.048, 4.096, 8.192, 16.384 o 32.768 tokens (según backend) |
| Tipos de cuantizacion | 8da4w con GPTQ (XNNPACK, Vulkan); híbrida QNN (Qualcomm); a16w8 (MediaTek NeuroPilot) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch (.pte) |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros desarrollado por Hugging Face. Esta ficha no aporta información sobre la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO en el modelo base; esos detalles deben consultarse en la model card original de HuggingFaceTB/SmolLM2-135M-Instruct.

La innovación técnica de esta exportación reside en el pipeline de compilación a ExecuTorch 1.5.1 y en la segmentación por backend. Los archivos XNNPACK y Vulkan usan cuantización 8da4w con GPTQ (pesos de 4 bits, activaciones de 8 bits), mientras que los de Qualcomm QNN emplean un esquema híbrido y los de MediaTek NeuroPilot usan a16w8 (activaciones de 16 bits, pesos de 8 bits) y se dividen en tres fragmentos (chunk1of3, chunk2of3, chunk3of3) por limitaciones del runtime. La ventana de contexto está fijada dentro del archivo: el runtime reserva la totalidad del KV cache al cargar, por lo que debe elegirse el archivo con la ventana más grande que el dispositivo pueda sostener. Cada carpeta incluye un campo `fits_phone_budget` en su `config.json` como estimación frente a un presupuesto de 5 GB.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo Instruct base.
- Inferencia on-device en Android sin conexión a red.
- Ejecución sobre CPU arm64 genérica mediante XNNPACK.
- Aceleración GPU mediante Vulkan en dispositivos arm64 compatibles.
- Aceleración NPU en Qualcomm Snapdragon 8 Elite (SM8750) mediante QNN HTP.
- Aceleración NPU en MediaTek Dimensity 9400 (MT6991) mediante NeuroPilot.
- Selección de ventana de contexto según memoria disponible (2k a 32k en CPU/GPU; 2k a 8k en QNN; 2k a 8k en MediaTek).
- Integración con la aplicación Android openweights y con cualquier runtime ExecuTorch 1.5.1.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistentes de texto offline en Android: el modelo puede ejecutarse íntegramente en el dispositivo con XNNPACK y un archivo de 0,11 GB, ofreciendo generación de texto sin conexión para aplicaciones de notas, correo o chat básico.
- Autocompletado y sugerencias en teclados móviles: con ventanas de 2k o 4k tokens y un footprint de 0,11 GB, encaja en el presupuesto de memoria de un teclado que necesita respuestas de baja latencia.
- Clasificación y etiquetado de texto en el borde: al ser un modelo Instruct pequeño, puede usarse para tareas de extracción o categorización de mensajes sin enviar datos a la nube, útil por privacidad.
- Prototipado de aplicaciones ExecuTorch: sirve como referencia para validar pipelines de exportación y despliegue en los backends XNNPACK, Vulkan, QNN y NeuroPilot antes de pasar a modelos mayores.
- Demostraciones de inferencia acelerada por NPU: los archivos QNN para SM8750 y NeuroPilot para MT6991 permiten evaluar el rendimiento de LLMs en aceleradores móviles de gama alta.
- Educación y experimentación: al ser Apache 2.0 y de tamaño reducido, es adecuado para cursos y talleres sobre despliegue de modelos en dispositivos.
- Pruebas de integración en CI para apps Android: los archivos .pte de 0,04 a 0,21 GB permiten incluir pruebas de humo de generación de texto en pipelines automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pruebas de humo (smoke tests): los archivos XNNPACK superaron la prueba generando "Paris"; los archivos Vulkan, QNN y MediaTek fueron únicamente verificados estructuralmente, sin runtime NPU en el host de compilación.

## Requisitos de hardware

- VRAM/RAM estimada: entre 0,04 GB y 0,21 GB por archivo .pte, más la reserva del KV cache completa al cargar (dependiente de la ventana elegida). El repo completo ocupa 5,2 GB.
- CPU: cualquier dispositivo arm64 para los archivos XNNPACK.
- GPU: cualquier dispositivo arm64 con soporte Vulkan para los archivos Vulkan.
- NPU Qualcomm: Snapdragon 8 Elite (SM8750) para los archivos QNN.
- NPU MediaTek: Dimensity 9400 (MT6991) para los archivos NeuroPilot.
- No aplica a GPU de escritorio (A100, H100, RTX 4090): el formato .pte está orientado a móvil y no se documenta despliegue en esas plataformas.
- Opciones de despliegue: runtime ExecuTorch 1.5.1 y la app Android openweights. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| SmolLM2-135M-Instruct-ExecuTorch | 135 M | 2k-32k (fijo por archivo) | .pte | Apache 2.0 | On-device Android con múltiples backends |
| SmolLM2-135M-Instruct (base) | 135 M | no disponible en esta ficha | safetensors | Apache 2.0 | Modelo original para servidor/GPU |
| Otras exportaciones ExecuTorch de SmolLM2 | 135 M | no disponible | .pte | Apache 2.0 | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta exportación con alternativas.

## Limitaciones y advertencias

- El modelo base de 135 M tiene capacidad limitada de razonamiento y conocimiento factual; es propenso a errores y alucinaciones en tareas complejas.
- La ventana de contexto es fija por archivo y el KV cache se reserva completo al cargar; elegir una ventana mayor de la que el dispositivo soporta puede provocar fallos de memoria.
- Los archivos Vulkan, QNN y MediaTek solo han sido verificados estructuralmente, no ejecutados en hardware real durante la compilación; su funcionamiento en dispositivo no está validado en la model card.
- Los archivos MediaTek están fragmentados en tres partes y requieren el runtime NeuroPilot adecuado.
- No se documentan idiomas soportados ni sesgos conocidos; debe consultarse la model card del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de las dependencias de ExecuTorch.
- No apto para cargas de producción en servidor: el formato .pte y los backends están orientados exclusivamente a Android.

## Enlaces

- Hugging Face: https://huggingface.co/experimentalmachines/SmolLM2-135M-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- App openweights: https://github.com/alpharomercoma/openweights
- ExecuTorch: no disponible en la información proporcionada
- Paper: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
