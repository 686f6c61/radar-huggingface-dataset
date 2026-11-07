# M-o-r-p-h-e-u-s/SILY-1-BASE

## Resumen

SILY-1-BASE es un modelo de lenguaje de tipo base desarrollado por el usuario independiente M-o-r-p-h-e-u-s, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un experimento de arquitectura híbrida que combina mezcla de expertos (MoE), transformer con bucles y compartición de pesos, con un total de 476,9 millones de parámetros y 113,5 millones activos por token. El modelo resuelve, según su autor, el problema de la especialización de expertos en arquitecturas MoE mediante el uso de embeddings de experto (vectores prototipo) y enrutamiento por similitud coseno, en lugar del enrutador lineal tradicional.

La arquitectura organiza los bloques en cinco "bancos" de tres bloques cada uno (dos convoluciones con compuerta y una atención), que se ejecutan entre dos y tres veces con pesos compartidos, resultando en 33 aplicaciones de bloque por token. Cada banco comparte un único módulo MoE entre todos sus bloques y pasadas, con 253 expertos enrutados (top 4) más un experto siempre activo por pasada y bloque. El entrenamiento se realizó sobre 13.410 millones de tokens del dataset allenai/dolma3_mix-6T durante una época, en 55,7 horas sobre una única GPU H100 NVL.

El modelo es relevante como banco de pruebas para investigar enrutamiento MoE con especialización inducida por vectores prototipo, compartición de pesos entre bloques y mezcla de frontera entre pasadas. Su contexto es muy limitado (1.024 tokens) y solo soporta inglés, por lo que su utilidad práctica en producción es reducida; su interés es principalmente de investigación en arquitecturas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MoE, bucles y compartición de pesos; bloques con GQA o convolución doblemente compuerta (DGC) |
| Parametros totales | 476,9 M |
| Parametros activos | 113,5 M por token |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`), tokenizer en `tokenizer.json` |
| Vocabulario | 12.288 tokens (BPE a nivel de byte) |
| Bloques por token | 33 aplicaciones de bloque |
| Expertos por banco | 253 enrutados (top 4) + 1 siempre activo por pasada y bloque |
| Bancos | 5 bancos de 3 bloques, ejecutados 2-3 veces con pesos compartidos |

## Arquitectura y entrenamiento

La arquitectura se organiza en cinco bancos, cada uno compuesto por tres bloques transformer. Cada bloque puede usar atención con consultas agrupadas (GQA) o la convolución doblemente compuerta (DGC) de Liquid, elegida por su eficiencia de recursos. Cada banco recibe un único módulo MoE que comparten todos sus bloques y todas sus pasadas; cada banco puede repetirse (bucle o "pass") antes de pasar su salida al siguiente, dando lugar a 33 aplicaciones de bloque por token. El enrutamiento MoE se basa en embeddings de experto: cada experto tiene un vector prototipo y la selección se hace por similitud coseno entre el token y dichos vectores, con una pérdida auxiliar que equilibra la carga (con un margen del 10 % para no penalizar la especialización) y empuja los vectores de los expertos a separarse en el espacio. Además, al final de cada banco y pasada se aplica una mezcla de frontera que decide cuánto combinar de la entrada previa, del trabajo propio del banco y de los embeddings originales del token.

El entrenamiento se realizó durante una época sobre 13.410 millones de tokens del dataset allenai/dolma3_mix-6T, en 55,7 horas sobre una única H100 NVL. La pérdida en validación fue de 2,393 nats por token (0,919 bits por byte). No se menciona RLHF, DPO ni ajuste por instrucciones: es un modelo base que continúa texto. El autor documenta que la especialización de expertos aumenta con la profundidad (separación de 0,02 en el banco 1 y 0,2 en el banco 4) y que los bloques de un mismo banco, en cada pasada, prefieren subconjuntos distintos del pool de expertos. Gran parte de los experimentos previos se hicieron en una RTX 3060 de 12 GB.

## Capacidades

- Generación de texto autoregresiva en inglés: continuación de texto sin ajuste por instrucciones.
- Razonamiento y conocimiento general limitados por el tamaño (476,9 M de parámetros totales, 113,5 M activos) y por el entrenamiento con solo 13,41 B de tokens.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso estructurado.
- Capacidades multilingües: solo inglés; no se ha entrenado para otros idiomas.
- No incluye modo de pensamiento (thinking), visión ni audio.
- No incluye ajuste de seguridad ni de instrucciones.

## Casos de uso

- Investigación en enrutamiento MoE: sirve como banco de pruebas para estudiar el enrutamiento por similitud coseno con vectores prototipo frente al enrutador lineal, midiendo la especialización de expertos por profundidad.
- Estudio de compartición de pesos y bucles: permite analizar el efecto de repetir bancos con pesos compartidos sobre la pérdida y la calidad de la representación, dado que el autor publica la separación de expertos por banco.
- Experimentos de arquitecturas híbridas atención-convolución: al combinar GQA y DGC en distintos bloques, es útil para comparar el coste y el rendimiento de ambos mecanismos en un mismo modelo.
- Generación de texto creativo corto en inglés: con contexto de 1.024 tokens y parámetros de muestreo recomendados (temperatura 1,0, min-p 0,03, penalización de frecuencia 0,3), puede producir continuaciones de texto breve en entornos de demostración.
- Docencia y divulgación: el modelo y sus scripts (`generate.py`, `modeling.py`) permiten ilustrar el funcionamiento interno de un MoE con bucles en cursos o talleres, ejecutándose en una GPU consumer.
- Reproducción de experimentos a pequeña escala: al entrenarse casi por completo en una RTX 3060 de 12 GB, sirve de referencia para grupos con recursos limitados que quieran replicar variantes del enrutamiento.
- Base para ajuste fino experimental: al ser un modelo base con licencia Apache 2.0, puede servir de punto de partida para probar ajuste supervisado en tareas de inglés, aunque su contexto de 1.024 tokens limita las aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la pérdida en validación: 2,393 nats por token y 0,919 bits por byte.

## Requisitos de hardware

- VRAM estimada para inferencia: con 476,9 M de parámetros totales, en bfloat16 el modelo ocupa aproximadamente 1 GB; en float32, unos 1,9 GB. A ello hay que sumar la caché KV para un contexto de 1.024 tokens, que es reducida.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; el autor entrenó en una RTX 3060 de 12 GB y la ejecución de referencia se hace en CUDA con autocast a bfloat16.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: el modelo se distribuye como `model.pt` de PyTorch con scripts propios (`generate.py` y `modeling.py`); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI, ni se proporcionan pesos en GGUF o safetensors.
- Latencia y throughput: no disponible. El autor no publica métricas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. A modo orientativo, se comparan características estructurales con modelos base pequeños de propósito general:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| SILY-1-BASE | 476,9 M | 113,5 M | 1.024 | Apache 2.0 | PyTorch (`model.pt`) |
| Alternativas de ~0,5 B (p. ej. Qwen2.5-0.5B) | ~0,5 B | no aplica (denso) | varios miles de tokens | variable según modelo | safetensors, GGUF |
| Alternativas MoE pequeñas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación de rendimiento con estas alternativas no está disponible porque no se han publicado benchmarks del modelo.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni de seguridad: puede generar contenido dañino, sesgado o inexacto.
- Riesgo elevado de alucinación y de texto incoherente fuera de distribuciones similares a las del corpus de entrenamiento, dado el reducido volumen de entrenamiento (13,41 B de tokens) y el tamaño del modelo.
- Contexto muy limitado: 1.024 tokens, insuficiente para conversaciones multi-turno largas, documentos extensos o pipelines de agentes.
- Solo inglés: no se ha entrenado para castellano ni otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no ofrece garantías y el autor no documenta evaluaciones de seguridad.
- No se proporcionan pesos cuantizados ni formatos estándar de despliegue (GGUF, safetensors), lo que dificulta su integración en servidores de inferencia habituales.
- El modelo se describe como un banco de pruebas en evolución; su comportamiento y sus pesos pueden cambiar en futuras versiones.
- No hay métricas publicadas de sesgo, toxicidad ni robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/M-o-r-p-h-e-u-s/SILY-1-BASE
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_mix-6T
