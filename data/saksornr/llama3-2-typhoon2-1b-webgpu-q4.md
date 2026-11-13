# saksornr/llama3.2-typhoon2-1b-webgpu-q4

## Resumen

`llama3.2-typhoon2-1b-webgpu-q4` es una conversión independiente a ONNX e INT4 del checkpoint `typhoon-ai/llama3.2-typhoon2-1b`, publicada por el usuario saksornr para su ejecución en navegador mediante Transformers.js y WebGPU. No se trata de un modelo nuevo ni de un ajuste fino: es el mismo checkpoint publicado por Typhoon AI (una iniciativa de SCB 10X orientada a modelos para tailandés), fijado en la revisión `c0f7d345c9553f6c8e1b7566e3714cf0a318bd61`, empaquetado con cuantización de 4 bits para que la inferencia neuronal corra en la GPU del visitante sin enviar datos a un servidor.

El modelo base es un transformer denso de 1.000 millones de parámetros derivado de Llama 3.2 1B de Meta, con capacidades declaradas en tailandés e inglés. Según la model card, se trata de un modelo base preentrenado para continuación de texto, no de un asistente conversacional con ajuste por instrucciones; la aplicación que lo consume proporciona el prompt de completado en bruto, sin plantilla de chat. Esta distinción es importante para cualquier evaluación: no debe esperarse un comportamiento de chat alineado.

Su relevancia es fundamentalmente de despliegue: demuestra un pipeline reproducible de conversión a ONNX, cuantización INT4 de matrices densas y ejecución en WebGPU dentro del navegador, con manifiesto de procedencia y hashes de integridad. El repositorio ocupa 1,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.2 1B); grafo ONNX para Transformers.js |
| Parametros totales | 1.000 millones (1B, segun el nombre del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 simetrica por bloques de 32 (`MatMulNBits`) en 113 matrices densas; tabla de embeddings con `GatherBlockQuantized`; normalizacion y activaciones en FP32 |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | ONNX (`onnx/model_q4.onnx` + fichero externo `.onnx_data`), tokenizer y configuracion; manifiesto con hashes SHA-256 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B: un transformer decoder-only denso con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos SSM. El repositorio no aporta detalles sobre el entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO); esa información correspondería a la model card de `typhoon-ai/llama3.2-typhoon2-1b`, no incluida aquí. Lo que sí documenta esta ficha es el proceso de conversión: exportación a ONNX y cuantización de pesos a INT4 con bloques simétricos de 32 elementos en 113 matrices `MatMulNBits`, más una tabla de embeddings cuantizada mediante `GatherBlockQuantized`, manteniendo normalización y activaciones en FP32. No hay reentrenamiento ni sustitución de checkpoint.

La innovación técnica relevante no está en el modelo sino en el empaquetado: integración con Transformers.js 4.3.2 y ONNX Runtime Web 1.31.0-dev.20260914-8d85527a0, ejecución sobre WebGPU con aceleración por hardware, y un `manifest.json` que registra procedencia, tamaños de fichero y checksums SHA-256. La aplicación asociada no ofrece fallback a CPU ni a modelos en precisión completa, de modo que el requisito de WebGPU es estricto.

## Capacidades

- Generación de texto por continuación de prompt (completado en bruto), sin plantilla de chat.
- Cobertura bilingüe tailandés-inglés, con foco declarado en tailandés por parte del modelo base.
- Inferencia local en navegador: tokenización, preprocesado y decodificación en JavaScript; cómputo neuronal en WebGPU.
- Privacidad por diseño: el texto de entrada permanece en el navegador del visitante según la model card.
- Tool calling / function calling: no disponible; el modelo base es preentrenado, no ajustado por instrucciones.
- Soporte de agentes y razonamiento multi-paso: no disponible en esta conversión.
- Capacidades multimodales (visión, audio): no disponibles en este paquete; la model card menciona un playground de ASR como aplicación consumidora, pero el modelo aquí empaquetado es solo de texto.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Demostraciones de inferencia en navegador sin backend: el paquete se carga con `device: "webgpu"` y `dtype: "q4"` en Transformers.js, permitiendo publicar un playground estático en Hugging Face Spaces o en cualquier hosting de ficheros estáticos sin servidor de inferencia.
- Aplicaciones de escritura asistida en tailandés con requisitos de privacidad: al no salir el texto del navegador, encaja en entornos donde el contenido del usuario no puede enviarse a una API externa (borradores internos, textos médicos o legales preliminares).
- Autocompletado y continuación de texto en formularios o editores web: al ser un modelo base, su uso natural es la continuación de un prefijo, no el diálogo; útil para sugerencias de redacción en campos largos.
- Prototipado rápido de producto sin coste de GPU en servidor: con 1,0 GB de repositorio y cuantización INT4, un equipo puede validar una hipótesis de UX de generación de texto sin aprovisionar infraestructura.
- Evaluación comparativa de cuantización: el manifiesto y los hashes permiten reproducir la conversión y medir la degradación de INT4 frente al checkpoint original en tareas de perplejidad o generación controlada.
- Educación y docencia sobre despliegue de LLM: sirve como ejemplo completo de exportación ONNX, cuantización por bloques y ejecución con ONNX Runtime Web en un curso de ingeniería de modelos.
- Filtrado y clasificación ligera por continuación: con prompts diseñados como plantillas de completado se pueden obtener etiquetas o extracciones simples en tailandés, aceptando la menor fiabilidad propia de un modelo de 1B sin ajuste por instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las pruebas de humo en navegador verificaron la generación sobre hardware WebGPU, pero que no establecen calidad amplia del modelo ni equivalencia con la cuantización original.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 1,0 GB en INT4; en ejecución hay que sumar overhead de ONNX Runtime Web, buffers de atención y KV cache, por lo que conviene reservar del orden de 1,5-2,5 GB de memoria de GPU, aunque la cifra exacta no está publicada.
- GPU recomendadas: cualquier GPU de escritorio con WebGPU funcional y aceleración por hardware; la model card no enumera modelos concretos. En el ecosistema WebGPU son habituales las GPU integradas modernas y las dedicadas de gama media y alta.
- Compatibilidad con GPU de consumo: sí, es el objetivo del paquete; el límite real es el soporte de WebGPU del navegador, no la VRAM.
- Navegadores: Chrome o Edge de escritorio actuales con aceleración por hardware habilitada. No hay fallback a CPU ni a precisión completa.
- Opciones de despliegue: Transformers.js 4.3.2 con ONNX Runtime Web 1.31.0-dev.20260914-8d85527a0; el paquete no está pensado para vLLM, llama.cpp, Ollama ni TGI, que requieren otros formatos de pesos.
- Latencia y throughput: no disponibles; dependen por completo de la GPU del visitante y del navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| saksornr/llama3.2-typhoon2-1b-webgpu-q4 | 1B | no disponible | ONNX INT4, WebGPU en navegador | Llama 3.2 Community | Conversion independiente, sin ajuste por instrucciones |
| typhoon-ai/llama3.2-typhoon2-1b | 1B | no disponible | Pesos originales (formato no detallado aqui) | Llama 3.2 Community | Modelo base de referencia; requiere runtime de servidor o local |
| Llama 3.2 1B (Meta) | 1B | no disponible | Safetensors, GGUF y otros | Llama 3.2 Community | Menor cobertura de tailandes que la variante Typhoon |
| Otros modelos tailandeses de ~1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- No es un asistente: es un modelo base de continuación de texto; sin plantilla de chat ni ajuste por instrucciones, las respuestas a preguntas directas pueden ser incoherentes o derivar en continuación libre.
- Calidad no validada: la model card advierte que las pruebas de humo no demuestran calidad amplia ni equivalencia entre la cuantización INT4 y el checkpoint original.
- Riesgo de alucinación: inherente a un modelo de 1B sin alineación; no debe usarse como fuente de hechos sin verificación.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; el corpus de entrenamiento del modelo base no está descrito aquí.
- Cobertura lingüística limitada a tailandés e inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Dependencia estricta de WebGPU: sin fallback a CPU, los usuarios con navegadores antiguos, GPU sin soporte o aceleración desactivada no podrán ejecutar el modelo.
- Licencia Llama 3.2 Community: impone obligaciones de atribución ("Built with Llama"), un umbral de 700 millones de usuarios activos mensuales para solicitar licencia adicional a Meta y restricciones de uso recogidas en la propia licencia y en el fichero Notice; revisar antes de un uso comercial.
- Conversión no oficial: el autor declara que no es un lanzamiento de Typhoon y que la atribución no implica respaldo; la procedencia debe verificarse contra el manifiesto y sus hashes.
- Integridad del paquete: `onnx/model_q4.onnx` y su fichero externo `.onnx_data` deben mantenerse juntos; separarlos rompe la carga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/saksornr/llama3.2-typhoon2-1b-webgpu-q4
- Modelo base: https://huggingface.co/typhoon-ai/llama3.2-typhoon2-1b
- Playground WebGPU citado en la model card: https://huggingface.co/spaces/saksornr/typhoon-asr-webgpu
- Manifiesto de procedencia e integridad: https://huggingface.co/saksornr/llama3.2-typhoon2-1b-webgpu-q4/blob/main/manifest.json
- Licencia Llama 3.2: https://huggingface.co/saksornr/llama3.2-typhoon2-1b-webgpu-q4/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/saksornr/llama3.2-typhoon2-1b-webgpu-q4/blob/main/Notice
