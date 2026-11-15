# aladewealth/trilingua

## Resumen

Trilingua (base) es un modelo de lenguaje de 70,5 millones de parámetros, tipo decoder-only, entrenado desde cero por el usuario aladewealth para el hackathon Arbiter Hacks V1. Está diseñado específicamente para generar texto en inglés, español y francés, e incluye su propio tokenizador entrenado también desde cero. La arquitectura es un transformer pre-norm de 10 capas con RMSNorm, RoPE, SwiGLU y embeddings atados, con una longitud de contexto de 1024 tokens.

El modelo no utiliza la librería `transformers`: requiere el código del repositorio del proyecto para su carga y ejecución, lo que lo aleja de los flujos de despliegue convencionales. Con 70,5M de parámetros y un repositorio de 0,6 GB, es un modelo pequeño orientado a experimentación y aprendizaje, no a producción de alta exigencia.

Su relevancia actual es limitada pero clara como caso de estudio: demuestra el entrenamiento completo de un modelo multilingüe desde cero con datos de FineWeb-Edu y FineWeb2-HQ, bajo licencia MIT. El autor advierte explícitamente que, por su tamaño, produce texto con apariencia fluida pero frecuentemente incorrecto desde el punto de vista factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only pre-norm, RMSNorm, RoPE, SwiGLU, embeddings atados |
| Parametros totales | 70.546.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, espanol, frances |
| Licencia | MIT |
| Formato de pesos | Safetensors (carga mediante codigo propio, no `transformers`) |
| Capas | 10 |
| Dimension del modelo (d_model) | 640 |
| Cabezas de atencion | 10 |
| Paso de entrenamiento publicado | 2385 |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

Trilingua es un transformer decoder-only con normalizacion previa (pre-norm). Incorpora RMSNorm en lugar de LayerNorm, codificacion posicional rotatoria (RoPE), activacion SwiGLU en las capas feed-forward y embeddings de entrada y salida atados. Consta de 10 capas, con una dimension de modelo de 640 y 10 cabezas de atencion, lo que da una dimension por cabeza de 64. El contexto maximo es de 1024 tokens.

El entrenamiento se realizo desde cero, incluido el tokenizador, utilizando los datasets HuggingFaceFW/fineweb-edu y epfml/FineWeb2-HQ. La model card indica que el paso de entrenamiento alcanzado fue 2385 y remite al README del repositorio del proyecto para obtener detalles sobre datos, metricas y limitaciones. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles, espanol y frances, con seleccion de idioma mediante etiquetas de prompt `<|en|>`, `<|es|>` y `<|fr|>`.
- Modelo base sin ajuste por instrucciones: no se documenta soporte de dialogos multi-turno ni seguimiento de instrucciones complejas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada a los tres idiomas de entrenamiento.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Tokenizador propio entrenado desde cero, incluido en el repositorio.

## Casos de uso

- Experimentacion academica y docencia: el modelo permite estudiar de extremo a extremo el pipeline de entrenamiento de un modelo multilingue desde cero (tokenizador, datos, arquitectura y metricas), gracias a su tamano reducido y a su licencia MIT.
- Generacion de texto de relleno en prototipos: util para poblar interfaces o entornos de prueba en ingles, espanol y frances donde la correccion factual no sea critica, dado su bajo coste de inferencia.
- Investigacion sobre tokenizadores multilingues: su tokenizador propio permite analizar el comportamiento de la tokenizacion en tres idiomas y compararlo con tokenizadores de referencia.
- Pruebas de infraestructura de inferencia: con 70,5M de parametros, sirve para validar pipelines de carga y ejecucion personalizados antes de migrar a modelos mayores.
- Generacion de texto creativo de baja exigencia: continuacion de prompts y ejercicios de escritura en los tres idiomas, asumiendo la advertencia del autor sobre errores factuales.
- Base para fine-tuning ligero: al ser un modelo base pequeno y con licencia permisiva, puede servir como punto de partida para ajustes especificos en tareas acotadas y dominios cerrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 70,5M de parametros, los pesos en precision de 32 bits ocupan aproximadamente 282 MB, y en 16 bits unos 141 MB. La memoria adicional depende del codigo de inferencia y del tamano de lote.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requieren A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM libre, e incluso podria ejecutarse en CPU para pruebas.
- Opciones de despliegue: no es compatible con `transformers`, vLLM, llama.cpp, Ollama ni TGI de forma nativa; requiere el codigo del repositorio del proyecto (`trilingua.utils.load_model` y `trilingua.tokenizer.TrilinguaTokenizer`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Compatibilidad de despliegue |
|---|---|---|---|---|---|
| Trilingua (base) | 70,5M | 1024 | en, es, fr | MIT | Codigo propio, no `transformers` |
| SmolLM-135M | 135M | 2048 | en (principalmente) | Apache 2.0 | `transformers`, llama.cpp, etc. |
| GPT-2 small | 124M | 1024 | en | MIT | `transformers` |
| Qwen2.5-0.5B | 494M | 32768 | multilingue | Apache 2.0 | `transformers`, vLLM, etc. |

La comparativa se ofrece como referencia de categoria (modelos pequenos de menos de 500M de parametros). No se dispone de datos de rendimiento de Trilingua para comparar metricas, y los datos de los modelos alternativos no forman parte de la informacion proporcionada; se incluyen solo a titulo orientativo.

## Limitaciones y advertencias

- El propio autor advierte que, por su tamano, el modelo genera texto con apariencia fluida pero frecuentemente incorrecto a nivel factual; no es adecuado para usos que requieran precision.
- Es un modelo base, no ajustado por instrucciones: no cabe esperar seguimiento fiable de instrucciones ni dialogos coherentes multi-turno.
- Longitud de contexto limitada a 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura limitada a ingles, espanol y frances; no se documenta comportamiento en otros idiomas.
- No es compatible con `transformers` ni con herramientas estandar de inferencia, lo que complica su integracion en produccion y en ecosistemas existentes.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al entrenarse con datos web (FineWeb-Edu y FineWeb2-HQ), es previsible que herede sesgos presentes en esas fuentes.
- Riesgo de alucinacion elevado, coherente con su escala y con la advertencia del autor.
- Licencia MIT: permisiva para uso comercial, pero sin garantias ni soporte del autor.
- No se han publicado benchmarks ni evaluaciones independientes en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aladewealth/trilingua
- Dataset HuggingFaceFW/fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset epfml/FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Repositorio del proyecto: no disponible en la informacion proporcionada (la model card remite a el para el codigo de carga y el README)
