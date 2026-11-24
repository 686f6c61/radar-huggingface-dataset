# rafazafar/CAT-Translate-1.4b-onnx-q4f16

## Resumen

CAT-Translate 1.4B es un modelo de traducción japonés→inglés desarrollado originalmente por CyberAgent AI Lab y publicado como `cyberagent/CAT-Translate-1.4b`. La versión aquí descrita es una exportación a ONNX con cuantización int4 realizada por el usuario rafazafar, empaquetada específicamente para su uso con transformers.js sobre WebGPU en el navegador. Forma parte de la aplicación MimiVox, un traductor que se ejecuta íntegramente en el cliente.

El modelo base emplea una arquitectura tipo Llama con 1.400 millones de parámetros y está especializado en una única dirección de traducción (japonés a inglés). La exportación ONNX preserva esa funcionalidad pero la adapta a un entorno de ejecución web, con pesos int4 RTN (block size 32) y activaciones y caché KV en fp16, lo que reduce el tamaño del repositorio a 1,1 GB y permite la inferencia en GPU mediante WebGPU.

Su relevancia actual reside en el nicho: traducción de alta calidad ejecutada localmente en el navegador, sin servidor ni API externa, con un rendimiento medido de 99–108 tokens/s en un Apple M5 y una calidad (chrF 52,36) incluso ligeramente superior a la referencia MLX q4. Es un caso práctico de despliegue de un LLM pequeño cuantizado para una tarea concreta y con requisitos de privacidad estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (modelo base CAT-Translate 1.4B) |
| Parametros totales | 1.4B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 RTN (block size 32), activaciones y KV cache en fp16 |
| Idiomas soportados | japonés (ja), inglés (en); dirección de traducción ja→en |
| Licencia | MIT (heredada del modelo base, copyright CyberAgent AI Lab) |
| Formato de pesos | ONNX (`onnx/model_q4f16.onnx` más datos externos) |

## Arquitectura y entrenamiento

El modelo base CAT-Translate 1.4B sigue una arquitectura transformer de tipo Llama con 1.400 millones de parámetros, especializada en traducción japonés→inglés. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO; estos datos deben consultarse en la model card del modelo base de CyberAgent.

La innovación técnica de esta versión concreta está en el proceso de exportación: se utilizó el model builder de onnxruntime-genai con los parámetros `-p int4 -e webgpu`, aplicando cuantización int4 RTN con block size 32 y manteniendo activaciones y caché KV en fp16. Los pesos se convirtieron al layout de ficheros de transformers.js (`onnx/model_q4f16.onnx` más datos externos) y se fijó `kv_cache_dim` a 112, la dimensión de cabeza del modelo. La tabla de embeddings en fp16 ocupa un único búfer de 367 MB, lo que impone requisitos mínimos sobre el adaptador WebGPU.

## Capacidades

- Traducción japonés→inglés de texto, con calidad medida mediante chrF sobre FLEURS.
- Generación de texto autoregresiva con decodificación greedy en el entorno de evaluación.
- Inferencia en navegador mediante transformers.js y WebGPU.
- Ejecución local sin servidor, lo que preserva la privacidad del texto traducido.
- Soporte de cuantización int4 con activaciones fp16 para reducir huella de memoria.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Traducción en el navegador para aplicaciones web: integrar el modelo con transformers.js permite ofrecer traducción ja→en sin backend, usando WebGPU para la inferencia y manteniendo el texto del usuario en el cliente.
- Extensiones de navegador para lectura de contenido japonés: una extensión puede cargar el ONNX y traducir páginas o subtítulos al inglés localmente, sin enviar datos a terceros.
- Herramientas de privacidad para documentos sensibles: textos japoneses que no pueden salir de la máquina del usuario (contratos, comunicaciones internas) pueden traducirse con este modelo en un equipo con GPU compatible con WebGPU.
- Prototipado rápido de pipelines de traducción: al ser un artefacto ONNX de 1,1 GB ejecutable en el navegador, sirve para validar flujos de traducción antes de invertir en infraestructura de servidor.
- Aplicaciones de accesibilidad y aprendizaje de idiomas: traducción instantánea de material japonés en tiempo real, con latencia medida de 99–108 tokens/s en hardware Apple M5.
- Demos y entornos educativos: ejemplo reproducible de exportación de un LLM a ONNX int4 y despliegue con transformers.js sobre WebGPU, útil para formación en despliegue de modelos.

## Benchmarks y rendimiento

Evaluación sobre 100 frases del split dev de FLEURS ja→en, decodificación greedy con tokens de salida japoneses prohibidos, en Chrome sobre Apple M5 (WebGPU, Metal):

| Metrica | MLX q4 (referencia) | Este modelo |
|---|---|---|
| chrF | 51,01 | 52,36 |
| Velocidad de decodificación | 156–159 tok/s | 99–108 tok/s |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 1,1 GB; la tabla de embeddings fp16 ocupa 367 MB en un único búfer. El adaptador WebGPU debe soportar `maxBufferSize` y `maxStorageBufferBindingSize` de al menos 367.001.600 bytes, además de `shader-f16`.
- GPU recomendadas: cualquier GPU con soporte WebGPU y shader-f16; el rendimiento medido corresponde a un Apple M5 (Metal). No hay datos publicados para A100, H100 ni RTX 4090.
- GPU de consumo: el modelo está diseñado para ejecutarse en el navegador sobre GPU integradas o dedicadas con WebGPU; cabe en memoria de GPU de consumo, aunque no se especifican modelos concretos.
- Opciones de despliegue: transformers.js con WebGPU (soporte principal); al ser un artefacto ONNX, también puede ejecutarse con onnxruntime-genai, aunque no se documenta esta vía.
- Latencia y throughput: 99–108 tokens/s en Apple M5 con Chrome; no hay datos para otro hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (chrF FLEURS ja→en) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CAT-Translate 1.4B ONNX int4 (este) | 1.4B | no disponible | 52,36 | MIT | ONNX para transformers.js/WebGPU |
| CAT-Translate 1.4B MLX q4 (referencia) | 1.4B | no disponible | 51,01 | MIT | MLX (Apple Silicon) |
| CAT-Translate 1.4B base | 1.4B | no disponible | no disponible | MIT | PyTorch (Hugging Face) |

No se dispone de datos de otros modelos comparables de traducción ja→en en la información proporcionada.

## Limitaciones y advertencias

- Solo traduce en la dirección japonés→inglés; no se documenta la dirección inversa ni otros pares de idiomas.
- transformers.js ignora el `byte_fallback` del tokenizador: los caracteres fuera del vocabulario deben codificarse como tokens de byte por parte del llamador, o los ids de token diferirán del tokenizador de referencia.
- Requiere un adaptador WebGPU con `shader-f16` y límites de búfer de al menos 367.001.600 bytes; adaptadores sin estos requisitos no podrán cargar el modelo.
- No hay información publicada sobre sesgos, tasa de alucinación ni comportamiento con entradas largas o ruidosas.
- La longitud de contexto no está documentada en la información disponible.
- La licencia MIT permite uso comercial, pero el copyright del modelo base pertenece a CyberAgent AI Lab y debe conservarse el aviso de licencia.
- El rendimiento medido corresponde a un único entorno (Chrome, Apple M5); no hay garantías de velocidad en otros navegadores o GPUs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafazafar/CAT-Translate-1.4b-onnx-q4f16
- Modelo base: https://huggingface.co/cyberagent/CAT-Translate-1.4b
- transformers.js: https://github.com/huggingface/transformers.js
