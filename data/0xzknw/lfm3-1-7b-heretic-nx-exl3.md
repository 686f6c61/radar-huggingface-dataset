# 0xzknw/LFM3-1.7B-Heretic-NX-EXL3

## Resumen

LFM3-1.7B-Heretic-NX-EXL3 es una cuantización EXL3 a 8 bits por peso (8 bpw) del checkpoint LFM3-1.7B-Heretic-NX, publicada por el usuario 0xzknw. Se trata de una conversión de pesos orientada al motor ExLlamaV3 y a su implementación nativa MLXL3, pensada para ejecutar el modelo en hardware Apple Silicon con memoria unificada. El modelo base es un LFM3 de 1.700 millones de parámetros, una familia de transformers densos de Liquid AI, y esta variante "Heretic-NX" es un ajuste del checkpoint original orientado a reducir rechazos (refusals) en respuestas.

La relevancia de esta ficha es doble. Por un lado, documenta un proceso de cuantización con validación numérica explícita (KL de primer token, paridad entre runtimes CUDA y MLXL3, verificación de hashes SHA-256). Por otro, ilustra una práctica poco habitual: el autor midió y rechazó recetas de 4 bpw y 4,49 bpw por exceso de divergencia KL, y publicó únicamente la receta de 8 bpw que cumple el umbral declarado de 0,05.

El repositorio pesa 2,5 GB y contiene pesos en formato safetensors con datos trellis propios de EXL3, no un checkpoint BF16 convencional. La licencia es la LFM Open License v1.0, que impone restricciones de uso comercial que deben revisarse antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia LFM3 de Liquid AI); pesos EXL3 con trellis y codebook MCG |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; la validación incluye una ventana deslizante de 256 tokens y un caso de 499 tokens |
| Tipos de cuantizacion | EXL3 8 bpw (publicada); 4 bpw estricta y 4,49 bpw mixta medidas y rechazadas |
| Idiomas soportados | ingles (en), frances (fr) |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors con datos EXL3 (2.518.073.115 bytes, 2,52 GB) |
| Libreria | mlx |
| Tamano del repositorio | 2,5 GB |
| Modelo base | 0xzknw/LFM3-1.7B-Heretic-NX (commit 56a40b05ac6affe579c9aa3c7def410c24f75b5c) |
| Emisiones / descargas | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 1.700 millones de parámetros de la familia LFM3. Esta publicación no entrena el modelo: cuantiza un checkpoint ya existente. La conversión EXL3 aplica cuantización de 8 bits a las 142 matrices de proyección, con codebook MCG, escalas de salida automáticas y un conjunto de calibración de 250 secuencias de 2.048 tokens; las Hessianas escaladas están desactivadas. Los embeddings y la cabeza de salida se mantienen a 16 bits, y las normas y tensores pequeños conservan el almacenamiento en precisión completa del conversor.

La cadena de herramientas utilizada es ExLlamaV3 1.6.6 (commit bd1f519172406a9560bd5c90e61000691bb69a07), PyTorch 2.10.0 con CUDA 12.8 y Transformers 5.22.2, ejecutada en una H100 de 80 GB en Modal. El autor documenta los hashes SHA-256 del checkpoint fuente y del peso EXL3 resultante, lo que permite verificar la procedencia. No se especifican en la información disponible los datos de entrenamiento del modelo base, ni si hubo RLHF o DPO; el ajuste "Heretic-NX" del checkpoint fuente no viene descrito en esta model card.

## Capacidades

- Generación de texto en inglés y francés, los dos únicos idiomas declarados.
- Conversación multi-turno; la validación incluye dos turnos reales a través del protocolo bridge NDJSON conservando un marcador de contexto independiente.
- Razonamiento y respuesta a instrucciones heredados del checkpoint LFM3 base; el autor no documenta capacidades específicas adicionales.
- Modo de razonamiento desactivable: la evaluación se realizó con `enable_thinking=False`, lo que indica que el modelo base soporta un modo de pensamiento explícito.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible; la model card no las menciona.
- Ejecución nativa en Apple Silicon mediante el motor MLXL3 y en GPU NVIDIA mediante ExLlamaV3.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo cabe en 2,52 GB de pesos y se ejecuta con MLXL3 en un Apple M5 con 24 GiB de memoria unificada, lo que permite desplegar un chatbot privado sin conexión a servicios externos.
- Generación de texto en francés e inglés para aplicaciones bilingües: los dos idiomas declarados cubren casos de atención al cliente, resúmenes o redacción en entornos francófonos y anglófonos.
- Prototipado rápido de pipelines de generación: al ser una cuantización de 8 bpw con divergencia KL baja (0,0436 frente al original en CUDA), sirve para validar prompts y flujos antes de pasar a un modelo mayor o a un despliegue en producción.
- Investigación sobre cuantización: el repositorio documenta recetas aceptadas y rechazadas con métricas KL, lo que lo convierte en material de referencia para estudiar el impacto de la cuantización en modelos pequeños.
- Evaluación de robustez frente a rechazos: la variante Heretic-NX está orientada a reducir marcadores de rechazo (3 de 104 en prompts objetivo, 2 de 104 en prompts seguros), útil para estudiar el comportamiento de modelos ajustados para ser menos restrictivos.
- Despliegue en entornos con GPU NVIDIA de gama alta: la validación en ExLlamaV3 sobre una H100 permite usar el modelo en servidores con CUDA para tareas de generación por lotes.
- Integración en aplicaciones de escritorio mediante el bridge NDJSON de MLXL3, validado con dos turnos reales y conservación de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye únicamente métricas de fidelidad de la cuantización y de paridad entre runtimes:

| Metrica | Resultado |
|---|---:|
| Marcadores léxicos de rechazo en prompts objetivo / 104 | 3 |
| Marcadores léxicos de rechazo en prompts seguros / 104 | 2 |
| Respuestas vacías (objetivo / seguros) | 0 / 0 |
| KL de primer token original → EXL3 CUDA | 0,04362488 |
| KL de primer token original → EXL3 MLXL3 | 0,04389918 |
| KL de pesos Heretic BF16 → EXL3 CUDA | 0,00141581 |
| KL medio entre EXL3 CUDA y MLXL3 (104 forwards) | 0,00008576 |
| Acuerdo de argmax entre EXL3 CUDA y MLXL3 | 99,04 % |
| KL en caso de 499 tokens (ventana deslizante de 256) | 0,00026418 |

| Receta comparada | KL original → EXL3 CUDA | Limite permitido | Decision |
|---|---:|---:|---|
| 8 bpw estricta | 0,04362488 | 0,05000000 | Publicada |
| 4 bpw estricta | 0,46483692 | 0,09362488 | Rechazada |
| 4,49 bpw mixta | 0,21471472 | 0,05000000 | Rechazada |

El autor advierte que los recuentos de rechazo son marcadores léxicos, no éxito semántico, y que las 104 filas ya participaron en la selección del checkpoint fuente, por lo que no constituyen un conjunto de retención limpio.

## Requisitos de hardware

- VRAM estimada: 2,52 GB de pesos en 8 bpw; con overhead de runtime, el modelo cabe holgadamente en 4 GB de memoria.
- GPU recomendadas: H100 80 GB para la validación en ExLlamaV3 (CUDA); Apple M5 con 24 GiB de memoria unificada para MLXL3.
- Cabe en GPU de consumo: sí, por tamaño; no se documentan pruebas en RTX 4090, RTX 3090 u otras GPU de consumo, por lo que la compatibilidad con ExLlamaV3 en esas tarjetas no está verificada en la información disponible.
- Opciones de despliegue: ExLlamaV3 1.6.6 en CUDA y MLXL3 engine v2.0.4-beta.1 (commit ead60d0323e9) en Apple Silicon. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato EXL3 no es compatible con esos motores sin conversión.
- Latencia y throughput: no disponibles. La model card no reporta tokens por segundo ni tiempos de primera token.
- Nota de despliegue: el preview del Hub marca `lfm3` como no soportado; el autor recomienda descargar la carpeta `8bpw/` completa con `hf download` y cargarla localmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-NX-EXL3 (este) | 1,7B | no disponible | EXL3 8 bpw | LFM Open License v1.0 | Hugging Face, 0 descargas |
| LFM3-1.7B-Heretic-NX (base) | 1,7B | no disponible | BF16 | LFM Open License v1.0 | Hugging Face |
| LFM3-1.7B-EXL3 (receta de referencia) | 1,7B | no disponible | EXL3 8 bpw | no disponible | Hugging Face |

No se dispone de datos de benchmarks de capacidad para ninguno de los tres, por lo que no es posible comparar rendimiento en tareas. La comparación se limita a tamaño, formato y licencia. No se han identificado en la información proporcionada alternativas de otros autores con las que contrastar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser un ajuste "Heretic" orientado a reducir rechazos, puede producir respuestas menos filtradas que el modelo original en temas sensibles.
- Riesgo de alucinación: no evaluado; no hay benchmarks de veracidad ni de tareas de conocimiento.
- Limitaciones de idioma: solo inglés y francés declarados; el rendimiento en castellano no está garantizado ni evaluado.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; la validación cubre hasta 499 tokens con ventana deslizante de 256, lo que sugiere un contexto efectivo limitado.
- Licencia: LFM Open License v1.0, marcada como `license: other`; impone restricciones que deben revisarse antes de uso comercial. No se detallan los términos en la información disponible.
- Compatibilidad: el formato EXL3 requiere el motor ExLlamaV3 o MLXL3; no es un checkpoint BF16 estándar y no funciona con Transformers, vLLM o llama.cpp sin conversión.
- Madurez: 0 descargas y 0 likes; el motor MLXL3 está en versión beta (v2.0.4-beta.1) y el preview del Hub no soporta la arquitectura `lfm3`.
- Validación limitada: el autor indica explícitamente que no se realizó un benchmark de capacidad EXL3 ni una prueba formal de cómputo en GPU; la incertidumbre sobre capacidades del modelo base sigue aplicando.
- Procedencia: los pesos requieren el descriptor de cuantización y el tokenizer del mismo repositorio; descargar solo `model.safetensors` no es suficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xzknw/LFM3-1.7B-Heretic-NX-EXL3
- Checkpoint base: https://huggingface.co/0xzknw/LFM3-1.7B-Heretic-NX
- Modelo EXL3 de referencia del mismo autor: https://huggingface.co/0xzknw/LFM3-1.7B-EXL3
- Release del motor MLXL3 v2.0.4-beta.1: https://github.com/0xZKnw/mlxl3/releases/tag/engine-v2.0.4-beta.1
