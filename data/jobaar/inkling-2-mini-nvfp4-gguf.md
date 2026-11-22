# Jobaar/Inkling-2-Mini-NVFP4-GGUF

## Resumen

Inkling 2 Mini NVFP4 GGUF es una conversión no oficial del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, publicada por el usuario Jobaar. El repositorio contiene los pesos originales en formato NVFP4 (formato de coma flotante de 4 bits nativo de las GPU NVIDIA Blackwell) reempaquetados en GGUF sin recuantizar, de modo que las tarjetas Blackwell puedan ejecutarlos sobre sus tensor cores FP4 a través de llama.cpp.

El modelo base es un transformer de tipo MoE (mixture of experts) con 26.070.390.272 parámetros totales, capacitado para entrada imagen-texto y salida de texto, con modo de razonamiento configurable. Esta conversión preserva los pesos NVFP4 de los expertos en las capas 0-19, usa MXFP8 para los expertos de las capas 20-23 y Q8_0 para el resto de pesos grandes, y mantiene en F32 los tensores pequeños y los controladores de bucle.

Su relevancia es doble: por un lado, permite ejecutar un modelo multimodal de 26B en GPUs de consumo de la generación Blackwell (RTX 50, RTX PRO Blackwell, DGX Spark) con un consumo de VRAM en torno a 20 GB; por otro, demuestra la viabilidad de mantener cuantizaciones NVFP4 nativas en el ecosistema llama.cpp sin degradar los pesos originales. La licencia es Apache 2.0, igual que la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con capas en bucle (looped layers) y capacidades multimodales imagen-texto |
| Parametros totales | 26.070.390.272 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantizacion | NVFP4 (expertos capas 0-19), MXFP8 (expertos capas 20-23 y pesos grandes), Q8_0 (resto de pesos grandes), F32 (tensores pequeños y controladores de bucle) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo `Inkling-2-Mini-NVFP4.gguf`, 17,6 GB) |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini es un transformer con arquitectura de mezcla de expertos (MoE) que incorpora capas en bucle (looped layers), un detalle relevante porque los pesos de esas capas se comparten entre iteraciones. Esta característica condiciona el despliegue: al repartir el modelo entre varias GPU hay que usar una proporción asimétrica (por ejemplo `-ts 1,3` en dos GPU de 16 GB) en lugar de un reparto uniforme, ya que de lo contrario casi todo el modelo acaba en la primera GPU.

La conversión de Jobaar no reentrena ni recuantiza: toma los pesos NVFP4 nativos del modelo original y los reempaqueta en GGUF, aplicando MXFP8 a los expertos de las capas 20-23 y Q8_0 a otros pesos grandes, y dejando en F32 los tensores pequeños y los controladores de bucle. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original; la model card remite a la ficha del modelo base de Thinking Machines Lab para esos detalles.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imagen y texto (pipeline `image-text-to-text`), con soporte de proyector visual `mmproj-Inkling-2-Mini-BF16.gguf` distribuido por ggml-org.
- Modo de razonamiento configurable mediante `--reasoning-effort`, con niveles `none`, `minimal`, `low`, `medium`, `high`, `xhigh` y `max`; el valor por defecto es `high`.
- Ejecución sobre tensor cores FP4 en GPU NVIDIA Blackwell (RTX 50, RTX PRO Blackwell, DGX Spark).
- Compatibilidad con llama.cpp (`llama-server`) y con endpoints compatibles según los tags del repositorio.
- Soporte de plantillas de chat Jinja (`--jinja`).
- Capacidades de tool calling, agentes o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional multimodal en local: con el proyector visual cargado, el modelo puede recibir capturas de pantalla, fotografías o diagramas junto con texto y mantener conversaciones multi-turno, todo dentro de una estación de trabajo con GPU Blackwell y ~20 GB de VRAM.
- Despliegue en DGX Spark o RTX PRO Blackwell para prototipos de investigación: el formato NVFP4 nativo permite aprovechar los tensor cores FP4 sin necesidad de recuantizar, lo que reduce el tiempo de puesta en marcha de experimentos con modelos de 26B.
- Razonamiento con esfuerzo ajustable en pipelines de análisis: el parámetro `--reasoning-effort` permite bajar a `none` o `minimal` para tareas de extracción rápida y subir a `high`/`max` para problemas que requieren cadenas de razonamiento largas, equilibrando latencia y calidad.
- Procesamiento de documentos con imágenes en local: digitalización y descripción de facturas, tickets o formularios escaneados usando el servidor llama.cpp con `--mmproj`, sin enviar datos a la nube.
- Inferencia en dos GPU de consumo: con el reparto asimétrico `-ts 1,3` documentado, dos tarjetas de 16 GB pueden alojar el modelo, lo que habilita entornos de laboratorio con hardware de gama alta de consumo.
- Integración en aplicaciones compatibles con la API de llama.cpp: al exponer `llama-server` un endpoint compatible con OpenAI, el modelo puede conectarse a clientes existentes para tareas de chat y análisis de imágenes sin cambiar el código de la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB para inferencia con visión y contexto moderado; más para contextos largos.
- GPU recomendadas: NVIDIA Blackwell (RTX 50 series, RTX PRO Blackwell, DGX Spark) para aprovechar los tensor cores FP4. Las tarjetas anteriores pueden cargar el archivo pero no obtienen la aceleración FP4.
- Configuración multi-GPU: dos GPU de 16 GB con `-ts 1,3 --fit off` (reparto asimétrico obligatorio por las capas en bucle).
- Software: llama.cpp build b12635 o superior (las builds anteriores al PR #32704, de 21 de noviembre de 2026, cargan el archivo pero generan salida corrupta). CUDA 12.8 o superior si se compila llama.cpp manualmente.
- Opciones de despliegue: `llama-server` de llama.cpp; otros motores (vLLM, TGI, Ollama) no están documentados en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini NVFP4 GGUF (esta ficha) | 26,07 B | no disponible | GGUF con NVFP4 nativo | Apache 2.0 | Hugging Face (conversión no oficial) |
| thinkingmachines/Inkling-2-Mini (original) | 26,07 B | no disponible | Pesos originales (NVFP4) | Apache 2.0 | Hugging Face (oficial) |
| ggml-org/Inkling-2-Mini-GGUF | 26,07 B | no disponible | GGUF con proyector BF16 | Apache 2.0 | Hugging Face (conversión de referencia) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: el autor la etiqueta explícitamente como tal; no está respaldada por Thinking Machines Lab.
- Requiere GPU NVIDIA Blackwell para obtener la aceleración FP4; en tarjetas anteriores el archivo se carga pero sin ventaja de rendimiento y con posible degradación.
- Dependencia estricta de la versión de llama.cpp: builds anteriores al PR #32704 producen salida corrupta con este archivo.
- El reparto entre varias GPU debe ser asimétrico por las capas en bucle; un reparto uniforme concentra casi todo el modelo en la primera GPU.
- Idiomas soportados no documentados en esta ficha; hay que consultar la model card original.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; se remite a la ficha del modelo base.
- Uso comercial permitido por Apache 2.0, pero sujeto a la política de uso aceptable de Thinking Machines Lab.
- Contexto máximo no especificado; los ejemplos usan 8192 tokens, por lo que contextos mayores requieren más VRAM y no están validados en la documentación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jobaar/Inkling-2-Mini-NVFP4-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Proyector visual (ggml-org): https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Pull request de llama.cpp #32704: https://github.com/ggml-org/llama.cpp/pull/32704
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
