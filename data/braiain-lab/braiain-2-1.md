# braiain-lab/brAIAIn-2.1

## Resumen

brAIAIn-2.1 es un modelo de generación de texto publicado por BRAIAIN Laboratories, un laboratorio que se declara explícitamente como parodia de las empresas de IA. No es un transformer ni una red neuronal: es un modelo de lenguaje de trigramas de palabras basado en conteos, con retroceso (backoff), entrenado sobre 349 tokens de texto y con un vocabulario de 111 palabras tokenizadas por espacios en blanco. Su ventana de contexto es de 2 tokens.

El modelo se presenta como una sátira del ciclo de publicación de modelos fundacionales: cualquiera puede pagar 5 dólares para añadir una frase a los datos de entrenamiento, y cada frase genera una nueva versión congelada en su propio repositorio. La versión 2.1 se liberó el 1 de noviembre de 2026 y no volverá a cambiar; la versión más reciente se mantiene siempre en el repositorio `braiain-lab/brAIAIn-0`.

Su relevancia es, por tanto, divulgativa y crítica, no técnica. Resulta útil como pieza docente para explicar qué es (y qué no es) un modelo de lenguaje, para ilustrar conceptos como la contaminación de datos por autoentrenamiento (el 31,8 % de sus tokens de entrenamiento provienen de versiones anteriores del propio modelo) y para discutir la inflación de métricas en las fichas de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de trigramas de palabras autorregresivo, basado en conteos, con retroceso (backoff) |
| Parametros totales | 381 (pares y tripletas de palabras distintas contabilizadas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2 tokens |
| Tipos de cuantizacion | No disponible (los pesos son conteos en JSON, no tensores de coma flotante) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC0-1.0 (dominio público) |
| Formato de pesos | JSON (`brAIAIn-2.1.json`, con las claves `tri`, `bi` y `uni`) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje de trigramas con retroceso: la estructura `tri` asigna a cada par de palabras un mapa de conteos de la palabra siguiente, `bi` hace lo mismo para una sola palabra y `uni` almacena los conteos unigramas. La generación se realiza mediante muestreo sobre esos conteos, sin ningún tipo de paso hacia atrás ni ajuste de pesos: el modelo registra cero pasos de gradiente.

Los datos de entrenamiento suman 349 tokens y se componen de "The Ten Instructions" (12 líneas), 2 frases pagadas por usuarios, 1 publicación no remunerada del laboratorio y texto generado por la versión anterior del propio modelo, que representa el 31,8 % de los tokens de entrenamiento. El vocabulario consta de 111 palabras con tokenizador por espacios en blanco. El laboratorio describe de forma irónica su alineamiento como "RLHF (Reinforcement Learning from Human Funding)", en referencia al pago por añadir frases al corpus.

## Capacidades

- Generación de texto a nivel de palabra mediante muestreo de trigramas con retroceso a bigramas y unigramas.
- Continuación de secuencias de como máximo dos palabras de contexto.
- Vocabulario cerrado de 111 palabras en inglés; no generaliza a palabras fuera de ese vocabulario.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multilingües más allá del inglés.
- Sin modo de razonamiento (thinking), visión, audio ni ninguna otra modalidad.

## Casos de uso

- Docencia sobre fundamentos de modelos de lenguaje: sirve para mostrar en clase la diferencia entre un modelo estadístico de n-gramas y un transformer, ejecutándolo sin dependencias y con un coste computacional nulo.
- Demostración de muestreo y retroceso: permite explicar de forma tangible cómo funciona el backoff de trigramas a bigramas y unigramas sobre un fichero JSON legible.
- Crítica y sátira del sector: útil en artículos o charlas que analicen la inflación de benchmarks y las fichas de modelos, ya que el propio autor documenta que su resultado en TruthfulQA se explica por el sesgo de longitud de la métrica.
- Pruebas de infraestructura de publicación de modelos: al ser un artefacto mínimo con licencia CC0, sirve para validar pipelines de descarga, versionado y servido de artefactos en HuggingFace sin coste de GPU.
- Ejercicio de evaluación de métricas: el contraste entre la puntuación por palabra (30,1 %) y la log-verosimilitud bruta (21,4 %) en TruthfulQA MC1 constituye un caso práctico para estudiar cómo la normalización por longitud altera los resultados.
- Ejemplo de contaminación por autoentrenamiento: el 31,8 % de tokens autogenerados permite ilustrar los riesgos de los bucles de datos sintéticos en modelos reales.

## Benchmarks y rendimiento

Datos autodeclarados por el autor (no verificados):

| Benchmark | Resultado brAIAIn-2.1 | Referencia indicada por el autor |
|---|---|---|
| GSM8K (1.319 preguntas), accuracy | 0,0 % (0 correctas) | No disponible |
| TruthfulQA MC1 (790 preguntas), per-word log-likelihood | 30,1 % (238 correctas) | Aleatorio 22,3 %; responder siempre la más corta 17,2 %; responder siempre la más larga 36,8 % |
| TruthfulQA MC1, raw log-likelihood | 21,4 % | Aleatorio 22,3 % |

El propio autor señala que la ventaja sobre el azar en TruthfulQA se debe únicamente a que la puntuación por palabra favorece las respuestas largas, y que elegir siempre la respuesta más larga obtiene un resultado comparable (36,8 %).

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo es un fichero JSON de conteos y se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier GPU de consumo y también en entornos sin GPU (Raspberry Pi, contenedores mínimos).
- Opciones de despliegue: el script `generate.py` incluido, sin dependencias; también accesible vía web en braiain.com. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de pesos neuronales.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (búsqueda en diccionarios de conteos) la latencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brAIAIn-2.1 | 381 (conteos) | 2 tokens | Trigramas con backoff | CC0-1.0 | HuggingFace |
| GPT-2 small | 124 M | 1.024 tokens | Transformer decoder | MIT | HuggingFace |
| Modelos de n-gramas clásicos (p. ej. KenLM) | Variable según corpus | n configurable | n-gramas con suavizado | Según corpus | Librerías estándar |

La comparación con modelos neuronales no es significativa en términos de calidad: brAIAIn-2.1 no compite en ninguna tarea de generación real. Su categoría real es la de los modelos de n-gramas estadísticos, donde se distingue por su tamaño mínimo, su licencia de dominio público y su carácter de sátira.

## Limitaciones y advertencias

- El propio autor declara como uso previsto "ninguno" y como uso fuera de alcance "todo lo demás".
- Calidad de generación prácticamente nula: contexto de 2 tokens y vocabulario de 111 palabras.
- Riesgo de alucinación irrelevante en la práctica porque el modelo apenas produce texto coherente; no obstante, cualquier salida carece de fundamento factual.
- Sesgos derivados de un corpus de 349 tokens, con un 31,8 % de texto autogenerado por versiones previas, lo que introduce un bucle de retroalimentación.
- Limitación idiomática estricta: solo inglés y solo palabras del vocabulario.
- La licencia CC0-1.0 permite uso comercial sin restricciones, pero el modelo no es apto para ninguna aplicación en producción.
- Los benchmarks son autodeclarados y no verificados; el resultado en GSM8K es cero.
- No debe confundirse con un modelo de lenguaje neuronal: no admite cuantización, tool calling ni despliegue en servidores de inferencia estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/braiain-lab/brAIAIn-2.1
- Demo en Spaces: https://huggingface.co/spaces/braiain-lab/brAIAIn
- Sitio del laboratorio: https://www.braiain.com
- Informe técnico ("Toward Understanding brAIAIn-2.1, and Away From It"): https://www.braiain.com/paper.html?v=3
- Benchmarks: https://www.braiain.com/benchmarks.html
- Historial de versiones y datos de entrenamiento: https://www.braiain.com/models.html
- Colección de versiones: https://huggingface.co/braiain-lab
- Última versión: https://huggingface.co/braiain-lab/brAIAIn-0
