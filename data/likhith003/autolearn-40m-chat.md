# Likhith003/autolearn-40m-chat

## Resumen

AutoLearn 40M Chat es un modelo de lenguaje conversacional de 40,4 millones de parámetros entrenado desde cero por Likhith003, un desarrollador individual, sobre un único MacBook con chip Apple M3 y 16 GB de memoria unificada. El modelo incluye tokenizador propio, preentrenamiento y ajuste fino conversacional, sin reutilizar pesos de otros modelos. Forma parte de AutoLearn API, una plataforma compatible con la API de OpenAI construida de extremo a extremo por el mismo autor.

La arquitectura es un decoder estilo Llama con RMSNorm, embeddings posicionales rotatorios (RoPE), atención con consultas agrupadas (GQA), activación SwiGLU y embeddings atados. Cuenta con 8 capas, dimensión oculta de 512, 8 cabezas de atención y 4 cabezas clave-valor, FFN de 1408 y un contexto máximo de 512 tokens.

Su relevancia es fundamentalmente educativa y de experimentación: demuestra que es posible entrenar un modelo conversacional completo (tokenizador, preentrenamiento y ajuste de chat) en hardware de consumo. No obstante, por su tamaño y por las propias advertencias del autor, no es apto para uso en producción ni para tareas donde la veracidad sea importante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama: RMSNorm, RoPE, GQA, SwiGLU, embeddings atados |
| Parametros totales | 40.378.880 (40,4 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | ONNX int8 (q8, ~58 MB) para transformers.js; safetensors en precisión original |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (pesos); datos: FineWeb-Edu (ODC-By 1.0) y SmolTalk (Apache 2.0) |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder de tipo Llama con 8 capas, dimensión oculta 512, 8 cabezas de atención y 4 cabezas clave-valor (GQA), FFN de 1408 y embeddings atados entre entrada y salida. El tokenizador es un BPE a nivel de byte con 32.768 tokens, entrenado sobre el propio corpus de preentrenamiento.

El preentrenamiento utilizó 2.900 millones de tokens de FineWeb-Edu (180.000 pasos de 16.384 tokens) sobre la GPU del Apple M3 (MPS), con una duración aproximada de 9 días y una pérdida de validación final de 3,55. Posteriormente se realizó un ajuste fino conversacional con 100.000 conversaciones de SmolTalk, calculando la pérdida solo sobre los turnos del asistente, durante 2,8 horas, alcanzando una pérdida de validación de 1,48. Los pesos se convirtieron sin pérdida al formato Llama de Hugging Face mediante un script de exportación del propio repositorio.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat (plantilla de chat incluida).
- Respuesta a preguntas simples y generación de texto creativo breve (por ejemplo, haikus).
- Ejecución en navegador mediante transformers.js con pesos ONNX int8.
- Compatible con text-generation-inference y con endpoints compatibles con la API de OpenAI a través de AutoLearn API.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- Sin capacidades de visión, audio ni modo de razonamiento explícito.
- Multilingüe: no; solo inglés.

## Casos de uso

- Demostración educativa de entrenamiento desde cero: sirve para ilustrar el pipeline completo (tokenizador, preentrenamiento, ajuste de chat y exportación a Hugging Face) en un curso o tutorial.
- Experimentación con transformers.js en el navegador: su tamaño reducido (58 MB en int8) permite desplegar un chatbot de juguete que se ejecuta íntegramente en el dispositivo del usuario sin servidor.
- Pruebas de integración de APIs compatibles con OpenAI: útil para validar pipelines de AutoLearn API o clientes OpenAI contra un modelo ligero y de bajo coste.
- Prototipado rápido de interfaces de chat: permite construir y probar la UX de una aplicación conversacional antes de conectar un modelo mayor.
- Benchmarking de infraestructura de inferencia: su reducido coste computacional lo hace adecuado para medir latencia y throughput de frameworks (transformers, ONNX Runtime) en hardware modesto.
- Generación de texto creativo breve sin requisitos de veracidad: poemas, eslóganes o respuestas de ejemplo en entornos de prueba, asumiendo que el contenido puede ser inexacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación: 3,55 en preentrenamiento y 1,48 tras el ajuste conversacional.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (~160 MB de pesos) y unos 58 MB en ONNX int8; cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo fue entrenado en la GPU integrada de un Apple M3 (MPS). Para inferencia, una RTX 3060 o superior es más que suficiente.
- Cabe en GPU de consumo: sí, en todas las GPU actuales e incluso en CPU y en el navegador.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, transformers.js, text-generation-inference y endpoints compatibles con OpenAI vía AutoLearn API.
- Latencia y throughput: no disponibles de forma medida; por el tamaño del modelo se espera latencia de milisegundos en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| AutoLearn 40M Chat | 40,4 M | 512 | Apache 2.0 | Inglés | Hugging Face, ONNX, transformers.js |
| SmolLM2-135M | 135 M | 8.192 | Apache 2.0 | Inglés (principalmente) | Hugging Face |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | Multilingüe | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | Inglés | Hugging Face |

Los modelos comparables son mucho mayores y con contextos más amplios; AutoLearn 40M Chat se sitúa por debajo en capacidad y ventana de contexto, aunque destaca por su extrema ligereza y por ejecutarse en el navegador. No se dispone de datos de rendimiento comparativo en benchmarks.

## Limitaciones y advertencias

- El propio autor advierte que el modelo afirma con frecuencia cosas falsas y pierde el hilo en conversaciones largas.
- No ha recibido ajuste de seguridad más allá del contenido presente en SmolTalk; puede generar respuestas inapropiadas.
- Contexto muy limitado (512 tokens), lo que restringe conversaciones multi-turno y documentos largos.
- Solo soporta inglés.
- No apto para producción ni para tareas donde la veracidad o la seguridad sean críticas.
- Sesgos: no documentados explícitamente, pero heredados de FineWeb-Edu y SmolTalk.
- Licencia Apache 2.0 permisiva para uso comercial de los pesos, aunque la calidad del modelo hace desaconsejable ese uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Likhith003/autolearn-40m-chat
- Demo en el navegador (Space): https://huggingface.co/spaces/Likhith003/autolearn-chat
- Repositorio AutoLearn API: https://github.com/likhithy99/autolearn-api
- Código de entrenamiento: https://github.com/likhithy99/autolearn-api/blob/main/autolearn/llm/train.py
- Código del modelo: https://github.com/likhithy99/autolearn-api/blob/main/autolearn/llm/model.py
- Script de exportación a Hugging Face: https://github.com/likhithy99/autolearn-api/blob/main/scripts/export_hf.py
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
