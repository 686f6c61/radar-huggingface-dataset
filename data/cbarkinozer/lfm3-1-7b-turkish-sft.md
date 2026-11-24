# cbarkinozer/LFM3-1.7B-Turkish-SFT

## Resumen

LFM3-1.7B-Turkish-SFT es un ajuste fino del modelo LiquidAI/LFM3-1.7B, un modelo de texto de 1,73 mil millones de parametros disenado por Liquid AI para agentes locales. Este ajuste, publicado por el usuario cbarkinozer, anade competencia en turco mediante un proceso de preentrenamiento continuado y SFT por autodestilacion (self-distillation) sobre las propias respuestas verificadas del modelo, con el objetivo de preservar las capacidades originales en ingles, matematicas, codigo y tool calling en lugar de sobrescribirlas.

El modelo mantiene la arquitectura hibrida del original: 24 capas compuestas por 13 convoluciones cortas con compuerta (gated short convolutions), 5 capas de atencion de ventana deslizante y 6 capas de atencion global. El contexto original es de 256K tokens, aunque el ajuste fino se realizo sobre secuencias de hasta 8.192 tokens y no se probaron contextos mas largos. Los pesos se distribuyen en bfloat16 fusionados (merged) y tambien en formato GGUF cuantizado.

La relevancia de esta ficha radica en que se trata de un primer lanzamiento con calidad absoluta modesta en turco: mejora de forma medible la gramatica y la comprension lectora en turco respecto al modelo base, pero sigue inventando palabras y cometiendo errores facticos en escritura libre. Es una base mejor para construir asistentes en turco, no un asistente terminado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 24 capas (13 convoluciones cortas con compuerta, 5 atencion de ventana deslizante, 6 atencion global) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256K tokens en el modelo original; ajuste fino sobre secuencias de hasta 8.192 tokens; contextos mas largos no probados |
| Tipos de cuantizacion | GGUF Q4_K_M (1,1 GB) y Q8_0 (1,85 GB); otras cuantizaciones generables desde safetensors con llama.cpp |
| Idiomas soportados | Turco (tr) e ingles (en); los demas idiomas del modelo original no fueron evaluados |
| Licencia | LFM Open License v1.0 (lfm1.0), igual que el modelo original |
| Formato de pesos | safetensors (bfloat16 fusionado) y GGUF |

## Arquitectura y entrenamiento

El modelo parte del checkpoint post-entrenado LiquidAI/LFM3-1.7B (no de la variante Base) y conserva su arquitectura sin cambios. Se trata de un transformer hibrido que combina convoluciones cortas con compuerta para el modelado local de secuencias, atencion de ventana deslizante para contexto de medio alcance y atencion global en seis capas para la integracion de informacion a larga distancia. Esta mezcla reduce el coste computacional frente a un transformer de atencion completa equivalente, lo que permite su despliegue en entornos locales.

El entrenamiento se realizo en dos fases: primero un preentrenamiento continuado en turco y despues un SFT por autodestilacion, ambas con LoRA y posterior fusion de los adaptadores en los pesos finales. La autodestilacion consiste en ajustar el modelo sobre sus propias respuestas verificadas, de modo que las habilidades en turco se incorporan sin sobrescribir el comportamiento en ingles, tool calling y razonamiento. El conjunto de datos utilizado es cbarkinozer/LFM3-1.7B-Turkish-SFT-Dataset. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset. El modelo conserva la plantilla de chat original y el modo de pensamiento (thinking) activado por defecto, que razona en ingles incluso ante preguntas en turco.

## Capacidades

- Generacion de texto conversacional en turco e ingles.
- Razonamiento con modo de pensamiento (thinking) activable o desactivable mediante `enable_thinking=False` en la plantilla de chat.
- Tool calling / function calling en turco e ingles (87,5% y 91,3% de acierto respectivamente en las pruebas del autor).
- Ajuste a instrucciones y salidas estructuradas.
- Razonamiento matematico basico y problemas de palabras (nivel de escuela primaria).
- Generacion de codigo basica, aunque el autor no la recomienda para codificacion agentica.
- Capacidades multilingues limitadas a turco e ingles evaluados.
- Modelo de solo texto: no soporta vision ni audio.

## Casos de uso

- Asistente conversacional local en turco: el modelo puede mantener dialogos multi-turno en turco con una huella de 1,1 GB en cuantizacion Q4_K_M, adecuado para ejecutarse en portatiles y equipos de gama media sin GPU dedicada.
- Agente local con tool calling: gracias a su soporte de function calling (87,5% en turco, 91,3% en ingles) puede integrarse en flujos que consulten APIs, bases de datos o sistemas de archivos, con la ventaja de ejecutarse en local sin depender de la nube.
- Generacion de texto asistida en turco: redaccion de correos, resumenes y respuestas con una naturalidad mejorada (3,10 sobre 5 frente a 2,43 del original) y menos palabras inventadas (1,45 frente a 3,27 por respuesta).
- Correccion y evaluacion gramatical en turco: el modelo alcanza un 85,9% en TurBLiMP, por lo que puede usarse como filtro o asistente de revision gramatical en pipelines de publicacion de contenido.
- Tutor de matematicas de nivel basico en turco: con un 76,6% en problemas de palabras y 78,2% en matematicas de primaria, es util para generar ejercicios y explicaciones paso a paso en turco.
- Base para ajuste fino adicional: al mantener las capacidades originales y estar disponible en safetensors bfloat16, sirve como punto de partida para tareas especificas en turco (clasificacion, extraccion de entidades, resumen) mediante LoRA.
- Prototipado de agentes con contexto largo: aunque el ajuste fino solo se probo hasta 8.192 tokens, la ventana original de 256K permite experimentar con documentos largos en entornos de investigacion.

## Benchmarks y rendimiento

Resultados publicados por el autor. Todas las puntuaciones son porcentajes de respuestas correctas (mayor es mejor), salvo las filas de sonda de escritura, que se indican. Las diferencias de pocos puntos porcentuales pueden ser ruido: dos entrenamientos identicos con semillas distintas difirieron hasta 7 puntos en matematicas en turco.

| Benchmark | LFM3-1.7B (original) | Este modelo |
|---|---|---|
| **Turco** | | |
| TurBLiMP gramatica (1.600 pares, sin thinking) | 71,8% | **85,9%** |
| Belebele turco lectura (900 preguntas, sin thinking; azar 25%) | 35,2% | **48,7%** |
| Problemas de palabras en turco (152 items x 4 semillas) | 69,1% | **76,6%** |
| Matematicas de primaria en turco (100 items x 4 muestras) | 76,3% | 78,2% |
| Tool calls en turco (80 items) | 82,5% | **87,5%** |
| Sonda de escritura, naturalidad (1-5, mayor es mejor; 40 prompts) | 2,43 | **3,10** |
| Sonda de escritura, palabras inventadas o erroneas por respuesta (menor es mejor) | 3,27 | **1,45** |
| Sonda de escritura, correccion de la tarea (si=1, parcial=0,5, no=0) | 0,34 | 0,39 (sin mejora clara) |
| **Ingles y habilidades** | | |
| Belebele ingles | 67,0% | 70,0% |
| Matematicas de primaria en ingles (100 items x 4 muestras) | 93,8% | 92,7% |
| Tool calls en ingles (80 items) | 95,0% | 91,3% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en bfloat16 (1,73B parametros x 2 bytes, mas overhead de activaciones y cache KV); alrededor de 1,1 GB en GGUF Q4_K_M y 1,85 GB en Q8_0.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para cuantizacion Q4_K_M; RTX 3060, RTX 4060, RTX 4090 para bfloat16 o Q8_0; A100 o H100 para despliegues con lotes grandes o contexto largo.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 4-8 GB de VRAM en cuantizacion Q4_K_M; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el codigo personalizado), llama.cpp (build b12088 o superior con soporte LFM3), Ollama y TGI mediante conversion a GGUF. vLLM no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor solo indica que los archivos cuantizados se comprobaron con generaciones cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B-Turkish-SFT | 1,73B | 256K (probado hasta 8.192) | LFM Open License v1.0 | Ajuste en turco por autodestilacion; tool calling 87,5% en turco |
| LiquidAI/LFM3-1.7B (original) | 1,73B | 256K | LFM Open License v1.0 | Modelo base; 71,8% en TurBLiMP y 35,2% en Belebele turco |
| Modelos de ~1-2B en turco de otros proveedores | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Calidad absoluta modesta en turco: el propio autor advierte que el modelo sigue inventando palabras y cometiendo errores facticos en escritura libre; es un punto de partida, no un asistente terminado.
- Riesgo de alucinacion: para tareas con carga de conocimiento se recomienda usar recuperacion (RAG) o busqueda, tal como indica el autor.
- Contexto: aunque el modelo original soporta 256K tokens, el ajuste fino solo se entreno y probo hasta 8.192 tokens; no hay garantias de comportamiento correcto en contextos mas largos.
- Idiomas: solo se evaluaron turco e ingles; el rendimiento en otros idiomas del modelo original es desconocido y podria haberse degradado.
- Modo de pensamiento en ingles: el razonamiento interno se produce en ingles incluso para preguntas en turco, lo que puede afectar a la coherencia cultural y terminologica.
- No recomendado para codificacion agentica ni razonamiento multi-paso complejo debido a su tamano.
- Licencia LFM Open License v1.0: es necesario revisar los terminos para uso comercial, ya que no es una licencia permisiva estandar (tipo Apache o MIT) y puede imponer restricciones adicionales.
- Requiere `trust_remote_code=True` por el codigo personalizado, lo que implica ejecutar codigo del repositorio y anade un riesgo de seguridad en produccion.
- Varianza entre entrenamientos: diferencias de hasta 7 puntos porcentuales en matematicas en turco entre semillas, por lo que mejoras de pocos puntos deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbarkinozer/LFM3-1.7B-Turkish-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/cbarkinozer/LFM3-1.7B-Turkish-SFT-Dataset
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
