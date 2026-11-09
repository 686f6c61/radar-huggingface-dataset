# jahid513/Zad-1.0-4B-Q4_K_M

## Resumen

Zad 1.0 es un ajuste fino por identidad del modelo base google/gemma-4-E4B-it de Google DeepMind, publicado por el usuario jahid513 en Hugging Face. El modelo se distribuye exclusivamente como cuantizacion GGUF Q4_K_M, pensada para su uso con llama.cpp, Ollama y LM Studio. Su proposito declarado es responder con una identidad concreta ("Zad 1.0, creado por Jahid Sir") cuando se le pregunta quien es, sin modificar deliberadamente otras capacidades del modelo base.

El modelo base pertenece a la familia Gemma 4 E4B, con 4.500 millones de parametros efectivos y 8.000 millones totales, 128.000 tokens de contexto y soporte multimodal de texto, imagen y audio. El ajuste se realizo mediante LoRA con cuantizacion QLoRA y rango r=16, segun indica la model card. El repositorio ocupa 5,3 GB y los pesos en safetensors suman 7.518.069.290 parametros, coherente con los 8.000 millones totales del modelo base.

La relevancia de esta ficha es limitada: se trata de una publicacion con cero descargas y cero likes, sin pipeline declarado, sin idiomas especificados y sin resultados de evaluacion. La model card advierte de que el ajuste incorporo contenido para adultos (18+), lo que restringe su uso a publicos mayores de edad. Es, en la practica, un experimento de personalizacion de identidad sobre Gemma 4, no un modelo de proposito general con garantias de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Gemma 4 E4B; detalles de atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 7.518.069.290 (safetensors); la model card declara 8B totales / 4.5B efectivos |
| Parametros activos | 4.500 millones efectivos segun la model card (familia E4B) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Gemma 4 E4B) |
| Tipos de cuantizacion | Q4_K_M GGUF (unica version publicada) |
| Idiomas soportados | No disponible (la model card muestra ejemplos en bengali e ingles, pero no declara lista de idiomas) |
| Licencia | Apache 2.0 (segun la model card, heredada del modelo base) |
| Formato de pesos | GGUF (Q4_K_M); el repositorio ocupa 5,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo google/gemma-4-E4B-it, un transformer de la familia Gemma 4 con 4.500 millones de parametros efectivos y 8.000 millones totales, contexto de 128.000 tokens y capacidades multimodales de texto, imagen y audio. No se dispone de informacion detallada sobre el mecanismo de atencion, la composicion del dataset de preentrenamiento ni las etapas de alineamiento (RLHF/DPO) del modelo base en la informacion proporcionada.

El ajuste realizado por Jahid consiste en un LoRA con cuantizacion QLoRA y rango r=16, orientado exclusivamente a la identidad del modelo. La model card afirma que no se modifico ninguna otra capacidad de forma intencionada, aunque tambien advierte de que el ajuste incorporo contenido para adultos, lo que puede afectar al comportamiento en dominios sensibles. No se documentan el numero de tokens de entrenamiento, la composicion del dataset de ajuste ni hiperparametros mas alla del rango del LoRA.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Gemma 4 E4B.
- Capacidades multimodales de imagen y audio, segun declara la model card del modelo base (texto + imagen + audio).
- Ventana de contexto de 128.000 tokens, adecuada para conversaciones multi-turno y documentos largos.
- Respuesta de identidad personalizada: al preguntarle quien es, responde "I am Zad 1.0, created by Jahid Sir" o su equivalente en bengali.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no se declara lista de idiomas; los ejemplos de la model card estan en bengali e ingles.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes con identidad de marca: el ajuste LoRA demuestra como fijar un nombre y una atribucion concretos en las respuestas del modelo, util para experimentar con personalizacion de identidad antes de invertir en un ajuste mayor.
- Despliegue local en equipos de gama media: la cuantizacion Q4_K_M de aproximadamente 5 GB permite ejecutar el modelo en llama.cpp, Ollama o LM Studio en portatiles con GPU consumer, sin infraestructura cloud.
- Pruebas de concepto de chat multimodal: al heredar las capacidades de imagen y audio de Gemma 4 E4B, sirve para validar flujos que combinen texto e imagen en local, siempre que se verifiquen las capacidades reales tras el ajuste.
- Evaluacion de tecnicas QLoRA: el repositorio documenta un ajuste con r=16 sobre un modelo de 8B, lo que lo convierte en un caso de referencia para estudiar el impacto de un LoRA de identidad en el comportamiento del modelo base.
- Experimentacion con contexto largo: los 128.000 tokens permiten probar resumenes de documentos extensos o conversaciones prolongadas en un entorno de escritorio.
- Docencia y demostraciones de cuantizacion GGUF: util para explicar el flujo completo desde un modelo base hasta un fichero GGUF ejecutable con Ollama, incluyendo la creacion de un Modelfile.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantizacion Q4_K_M publicada (el fichero GGUF ronda los 5 GB).
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4090; en el entorno profesional, A100 o H100 si se necesita mayor throughput, aunque el modelo es pequeno para esas tarjetas.
- Cabe en GPU consumer: si, en tarjetas con 6 GB o mas de VRAM; con 8 GB hay margen para contexto amplio. Tambien puede ejecutarse en CPU via llama.cpp, con latencia mayor.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (creando un Modelfile), LM Studio. No se documenta soporte para vLLM ni TGI con este fichero GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zad 1.0 4B Q4_K_M | 7.518.069.290 totales (4.5B efectivos) | 128.000 tokens | GGUF Q4_K_M | Apache 2.0 (segun model card) | Hugging Face, 0 descargas |
| google/gemma-4-E4B-it | 8B totales / 4.5B efectivos | 128.000 tokens | Safetensors y derivados | Apache 2.0 | Hugging Face, modelo oficial de Google DeepMind |
| Gemma 3 4B IT (generacion anterior) | 4B | 128.000 tokens | Safetensors, GGUF | Gemma Terms of Use | Hugging Face, ampliamente adoptado |
| Llama 3.2 3B Instruct | 3B | 128.000 tokens | Safetensors, GGUF | Llama 3.2 Community License | Hugging Face, ampliamente adoptado |

La comparativa se limita a modelos de tamano y contexto similares; no se dispone de datos de rendimiento de Zad 1.0 que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Contenido para adultos: la model card advierte explicitamente de que el ajuste incorporo contenido 18+, por lo que no es apto para menores ni para entornos sin control de edad.
- Sin evaluacion publicada: cero descargas, cero likes y ausencia de benchmarks impiden validar la calidad o la estabilidad del ajuste.
- Riesgo de alucinacion: al ser un ajuste de identidad sobre un modelo de 8B, mantiene los riesgos de alucinacion del modelo base, agravados por la falta de evaluacion especifica.
- Idiomas no declarados: aunque los ejemplos estan en bengali e ingles, no se documenta el soporte multilingue real tras el ajuste.
- Licencia: la model card declara Apache 2.0 heredada de Gemma 4, pero conviene verificar los terminos del modelo base antes de un uso comercial, especialmente por la advertencia de contenido adulto.
- Capacidades multimodales no verificadas: la model card atribuye imagen y audio al modelo base, pero no confirma que el ajuste LoRA y la cuantizacion GGUF preserven esas capacidades en la practica.
- Soporte de tool calling y agentes no documentado: no hay evidencia de que estas funciones del modelo base sigan operativas tras el ajuste.
- Madurez del proyecto: repositorio creado y actualizado el mismo dia (9 de noviembre de 2026), sin mantenimiento posterior documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jahid513/Zad-1.0-4B-Q4_K_M
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
