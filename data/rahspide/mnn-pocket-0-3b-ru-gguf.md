# Rahspide/MNN-Pocket-0.3B-RU-GGUF

## Resumen

MNN-Pocket-0.3B-RU es un modelo de generacion de texto en ruso de tipo "text-continuation": no responde a instrucciones ni mantiene conversaciones, sino que continua un prefijo dado. Esta pensado para sugerencias de teclado y autocompletado en dispositivos, no para chat. Lo desarrolla Rahspide como un ajuste por preentrenamiento continuado sobre el modelo base taobao-mnn/MNN-Pocket-0.3B-Base, y esta publicado en formato GGUF para su uso con llama.cpp.

El modelo cuenta con 302.830.976 parametros (aproximadamente 0,3 B) y una ventana de contexto que no se especifica en la informacion disponible. Se entreno con 1.200 millones de tokens adicionales: 0,9 B en ruso, 0,204 B en ingles y 0,096 B en chino, lo que refleja un sesgo claro hacia el ruso como idioma principal. Su relevancia actual radica en su tamano minimo (223 MB en cuantizacion Q4_K_M) y su velocidad en CPU, que lo hacen viable para inferencia en el borde y en telefonos moviles.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas. El repositorio GGUF ocupa 1,4 GB e incluye varias cuantizaciones, desde F16 (581 MB) hasta Q4_1 (208 MB). Es un modelo especializado y de nicho, adecuado para tareas de autocompletado en ruso, no como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de taobao-mnn/MNN-Pocket-0.3B-Base; detalles no disponibles) |
| Parametros totales | 302.830.976 (aproximadamente 0,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M, Q4_1 |
| Idiomas soportados | ru, en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer de aproximadamente 0,3 B de parametros, construido sobre taobao-mnn/MNN-Pocket-0.3B-Base. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea innovaciones como atencion lineal o decodificacion especulativa. El autor indica que los pesos, la receta de entrenamiento y las mediciones completas estan en el repositorio del modelo base no cuantizado (Rahspide/MNN-Pocket-0.3B-RU).

El entrenamiento consistio en un preentrenamiento continuado sobre 1.200 millones de tokens, con una composicion de 0,9 B en ruso, 0,204 B en ingles y 0,096 B en chino. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion; dado que el modelo es de continuacion de texto, no de instrucciones, es coherente que no se haya aplicado un ajuste por preferencias. El tokenizador es byte-level, lo que implica que un token puede terminar en medio de un caracter cirilico; llama.cpp gestiona el buffering de secuencias UTF-8 parciales, pero un decodificador propio debe implementar la misma logica.

## Capacidades

- Generacion de texto por continuacion de prefijo: completa una frase o parrafo a partir de un contexto dado, sin seguir instrucciones ni responder preguntas.
- Autocompletado y sugerencias de teclado: disenado explicitamente para este caso de uso en ruso.
- Capacidades multilingues limitadas: ruso como idioma principal, con soporte secundario de ingles y chino.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", vision ni audio.
- No es un modelo conversacional: no mantiene dialogos multi-turno.

## Casos de uso

- Sugerencias de teclado en moviles: el modelo continua el texto que el usuario esta escribiendo en ruso, con un tamano de 223 MB en Q4_K_M que cabe en el almacenamiento de un telefono y se ejecuta en CPU a velocidades superiores a 100 tok/s en escritorio.
- Autocompletado en editores de texto: integrado como servicio local, sugiere continuaciones de frases en ruso mientras el usuario escribe, aprovechando su bajo coste computacional.
- Prediccion de texto en aplicaciones de mensajeria: sugiere la siguiente palabra o frase en chats en ruso, reduciendo la friccion de escritura en dispositivos de gama baja.
- Generacion de texto en dispositivos embebidos: al caber en 208-223 MB y ejecutarse con llama.cpp en CPU, es viable en hardware con recursos limitados sin GPU.
- Prototipado de funciones de autocompletado: sirve como modelo de referencia para evaluar pipelines de continuacion de texto antes de escalar a modelos mayores.
- Filtrado y expansion de texto en ruso en pipelines de datos: puede generar continuaciones para aumentar datasets de texto en ruso en entornos con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente proporciona mediciones de velocidad de inferencia en una CPU x86 de 16 hilos:

| Cuantizacion | Velocidad de generacion | Procesamiento de prompt |
|---|---|---|
| Q4_K_M | 123-130 tok/s | 251 tok/s |
| Q8_0 | 99-103 tok/s | no disponible |
| Q4_1 | 62,6 tok/s | 199 tok/s |

El autor senala que Q4_1 genera mas rapido que Q4_K_M en una comparacion directa (62,6 frente a 54,3 tok/s) a costa de un procesamiento de prompt mas lento (199 frente a 251 tok/s), por lo que Q4_1 es preferible para prompts cortos con generaciones largas.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo esta pensado para CPU. En GPU, las cuantizaciones de 208-581 MB caben en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: no aplica; el modelo esta disenado para inferencia en CPU. Cualquier GPU consumer (RTX 4090, RTX 3060, etc.) puede ejecutarlo sin problemas, pero no es su objetivo.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, aunque su diseno es para CPU y edge.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por extension cualquier frontend compatible con GGUF como Ollama o LM Studio.
- Latencia y throughput: 123-130 tok/s en Q4_K_M y 99-103 tok/s en Q8_0 sobre CPU x86 de 16 hilos. No se han medido cifras en telefono.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos en la informacion proporcionada. La siguiente tabla compara caracteristicas estructurales con alternativas plausibles de la misma categoria (modelos pequenos para edge), pero los datos de rendimiento de los competidores no estan verificados en esta ficha.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-RU | 0,3 B | no disponible | ru, en, zh | Apache 2.0 | GGUF |
| Qwen3-0.6B | 0,6 B | no disponible | multilingue | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M | 0,36 B | no disponible | en (principal) | Apache 2.0 | safetensors, GGUF |

La comparacion con Qwen3-0.6B y SmolLM2-360M es orientativa: ambos son modelos de proposito general con soporte de instrucciones, mientras que MNN-Pocket-0.3B-RU es un modelo de continuacion de texto especializado en ruso. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo conversacional ni sigue instrucciones: solo continua texto. Usarlo en un chat producira resultados deficientes.
- Sesgo idiomatico: entrenado mayoritariamente en ruso (0,9 B de 1,2 B tokens), con soporte limitado de ingles y chino; el rendimiento en estos idiomas sera inferior.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar continuaciones plausibles pero factualmente incorrectas; en autocompletado el riesgo es menor, pero existe.
- Longitud de contexto no documentada: se desconoce la ventana maxima, lo que dificulta planificar su uso en prompts largos.
- Tokenizador byte-level: un decodificador propio debe gestionar secuencias UTF-8 parciales para evitar caracteres corruptos en cirilico.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base taobao-mnn/MNN-Pocket-0.3B-Base debe verificarse por si tuviera condiciones adicionales.
- Sin datos de benchmarks: no hay evidencia publicada de calidad en tareas estandar, por lo que la evaluacion en produccion debe hacerse con pruebas propias.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-GGUF
- Modelo base no cuantizado: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU
- Modelo original de taobao-mnn: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Base
