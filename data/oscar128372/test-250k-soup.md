# oscar128372/test-250k-soup

## Resumen

oscar128372/test-250k-soup es un modelo de lenguaje experimental de escala ultrapequena (250.021 parametros) publicado por el usuario oscar128372 en Hugging Face. Se trata de un "model soup": una mezcla de pesos (85:15) entre un checkpoint entrenado con EMA (Exponential Moving Average) y una version post-entrenada del mismo modelo. El autor lo describe explicitamente como un test para medir hasta donde puede llevar su arquitectura y su pipeline de entrenamiento, no como un modelo destinado a produccion.

El modelo se entrena desde cero con solo 81,92 millones de tokens y una longitud de secuencia de 512, en un Apple MacBook M5 Air con 16 GB de RAM, usando MPS como backend. El checkpoint seleccionado es el paso 20.000 de 35.000, seguido de 500 pasos de post-entrenamiento. El entrenamiento completo dura unos 45 minutos y la evaluacion 4 minutos, lo que da una idea del caracter de prototipo rapido del proyecto.

Su relevancia es fundamentalmente metodologica: demuestra que es posible obtener resultados competitivos frente a modelos de tamano similar (entre 60K y 2,6M de parametros) con un coste de computo minimo y sin usar benchmarks como datos de entrenamiento, evitando asi la contaminacion. No obstante, el propio autor advierte de que no se publica codigo de inferencia, lo que limita su uso practico a la inspeccion de pesos y a la replicacion del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card) |
| Parametros totales | 250.021 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencia de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna (tipo de transformer, atencion, normalizacion, tokenizador, etc.). Lo que si se documenta es el proceso de entrenamiento: un pre-entrenamiento sobre 81,92 millones de tokens con secuencias de 512 tokens, del cual se selecciona el checkpoint del paso 20.000 de un total de 35.000. Sobre ese checkpoint se aplican 500 pasos de post-entrenamiento y despues se realiza un "soup" de pesos en proporcion 85:15 con el modelo EMA original, una tecnica de promediado de pesos que suele mejorar la robustez y la generalizacion.

El entrenamiento se ejecuta en un Apple MacBook M5 Air (16 GB de RAM, CPU de 10 nucleos, GPU de 8 nucleos) usando el backend MPS de PyTorch. El pre-entrenamiento tarda 45 minutos y el post-entrenamiento junto con el soup, 2 minutos. El autor senala que no se usaron benchmarks como datos de entrenamiento para evitar contaminacion, lo que refuerza la validez de las cifras de evaluacion reportadas.

## Capacidades

- Generacion de texto a nivel de modelo de lenguaje de juguete: al tener 250K parametros, su capacidad expresiva es muy limitada y no puede sostener conversaciones coherentes ni razonamiento complejo.
- Evaluacion en tareas de conocimiento comun y razonamiento sencillo (HellaSwag, ARC-Easy, ARC-Challenge, PIQA, ArithMark-3.0), con resultados cercanos al azar o ligeramente superiores.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; la model card no especifica idiomas.
- No se documenta modo "thinking", vision, audio ni ninguna capacidad especial.
- No se incluye codigo de inferencia en el repositorio, por lo que las capacidades practicas no son directamente verificables.

## Casos de uso

- Investigacion sobre tecnicas de model soup: sirve como ejemplo reproducible de mezcla de pesos EMA y post-entrenados en modelos de escala minima, util para estudiar el efecto del promediado en la generalizacion.
- Estudio de pipelines de entrenamiento de bajo coste: permite analizar como se comporta un entrenamiento de 45 minutos en hardware de consumo (MacBook M5 Air) y que calidad se obtiene con 81,92M de tokens.
- Benchmarking de modelos ultrapequenos: sus resultados en HellaSwag, ARC, PIQA y ArithMark permiten situarlo frente a alternativas de 60K a 2,6M de parametros y validar metodologias de evaluacion sin contaminacion.
- Docencia y divulgacion: como ejemplo didactico de las limitaciones de los modelos de lenguaje de juguete y de la diferencia entre escala y capacidad.
- Pruebas de infraestructura de evaluacion: al ser un modelo pequeno y rapido de evaluar (4 minutos), puede usarse para validar harness de benchmarks antes de aplicarlos a modelos mayores.
- Replicacion de experimentos de soup: el repositorio publica los pesos en safetensors, lo que permite reproducir la mezcla 85:15 y comparar el checkpoint EMA con el post-entrenado.

## Benchmarks y rendimiento

| Modelo | Parametros | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3.0 |
|---|---|---|---|---|---|---|
| oscar128372/test-250k-soup | 250K | **28,30%** | 27,56% | 19,45% | 52,18% | **32,10%** |
| BananaMind/MicroBananaMind-v1 | 902K | 26,53% | 31,40% | 20,99% | **53,86%** | 30,00% |
| fromziro/Syn-2.6M | 2,6M | 26,96% | **32,03%** | 20,39% | 53,65% | 27,60% |
| fromziro/ZeroS-Pico-v1.1 | 60K | 26,19% | 26,30% | **24,57%** | 51,14% | 30,50% |
| SLM-Archive/LowOnMind-300k | 297K | 25,07% | 29,00% | 23,12% | 50,22% | 29,40% |

Los datos provienen de la model card del autor. El modelo lidera en HellaSwag y ArithMark-3.0 entre los comparados, pero queda por detras en ARC-Easy, ARC-Challenge y PIQA. En terminos absolutos, los resultados estan proximos al azar en varias tareas, lo que es coherente con un modelo de 250K parametros.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en precision completa (250.021 parametros en fp32 ocupan aproximadamente 1 MB); en cualquier cuantizacion seria aun menor.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el modelo se entreno en una GPU integrada de 8 nucleos (Apple M5 Air) via MPS.
- Cabe en cualquier GPU de consumo, e incluso en CPU y en dispositivos embebidos.
- Opciones de despliegue: no se proporciona codigo de inferencia en el repositorio; al estar en safetensors, requeriria implementar la arquitectura y el tokenizador a partir de los pesos, por lo que vLLM, llama.cpp, Ollama o TGI no son aplicables sin trabajo previo de conversion y definicion del modelo.
- Latencia y throughput: no disponibles; al no haber codigo de inferencia ni arquitectura documentada, no se pueden estimar de forma fiable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HellaSwag | ARC-C | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| oscar128372/test-250k-soup | 250K | no disponible | 28,30% | 19,45% | MIT | Pesos safetensors, sin codigo de inferencia |
| BananaMind/MicroBananaMind-v1 | 902K | no disponible | 26,53% | 20,99% | no disponible | no disponible |
| fromziro/Syn-2.6M | 2,6M | no disponible | 26,96% | 20,39% | no disponible | no disponible |
| fromziro/ZeroS-Pico-v1.1 | 60K | no disponible | 26,19% | 24,57% | no disponible | no disponible |
| SLM-Archive/LowOnMind-300k | 297K | no disponible | 25,07% | 23,12% | no disponible | no disponible |

La comparativa se limita a los modelos citados en la model card; no se dispone de informacion sobre contexto, licencia o disponibilidad de las alternativas mas alla de lo indicado. En conjunto, el modelo destaca en HellaSwag y ArithMark-3.0 pese a tener menos parametros que varios competidores, pero pierde en ARC y PIQA.

## Limitaciones y advertencias

- Modelo de juguete: con 250K parametros, la calidad de generacion es muy baja y no es apto para uso en produccion ni para tareas reales de usuario.
- Sin codigo de inferencia: el autor indica explicitamente que no hay codigo para ejecutar el modelo en el repositorio, lo que impide su uso directo sin reimplementar la arquitectura.
- Arquitectura y tokenizador no documentados: la model card no especifica la arquitectura, el tokenizador ni los idiomas, lo que complica la reproducibilidad.
- Riesgo de alucinacion: muy alto en terminos relativos, aunque su capacidad generativa es tan limitada que el problema principal es la incoherencia mas que la fabricacion de datos plausibles.
- Sesgos conocidos: no documentados; al no conocerse la composicion del dataset de entrenamiento, no se pueden evaluar sesgos de genero, raza o idioma.
- Limitaciones de contexto e idioma: entrenado con secuencias de 512 tokens y sin idiomas declarados; no se garantiza soporte de castellano ni de ningun otro idioma.
- Licencia MIT: permite uso comercial y modificacion, pero el estado experimental y la ausencia de codigo de inferencia hacen inviable un uso comercial real.
- Resultados cercanos al azar en ARC-Challenge (19,45%) y PIQA (52,18%): no debe interpretarse como un modelo con conocimiento factual o sentido comun util.
- Fecha de creacion futura (2026-11-12) en los metadatos de Hugging Face: conviene verificar la integridad y procedencia del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oscar128372/test-250k-soup
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion proporcionada.
