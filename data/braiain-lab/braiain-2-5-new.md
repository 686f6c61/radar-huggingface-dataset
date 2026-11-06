# braiain-lab/brAIAIn-2.5-new

## Resumen

brAIAIn-2.5 (new) es un modelo de generacion de texto publicado por BRAIAIN Laboratories, un laboratorio de IA parodico. Lejos de ser un transformer, se trata de un modelo de lenguaje de trigramas de palabras basado en conteo con retroceso (backoff), es decir, un modelo estadistico clasico que predice la siguiente palabra a partir de las dos anteriores contando frecuencias en un corpus minimo. Cuenta con 434 parametros (pares y triples de palabras distintos) y un vocabulario de 124 palabras con tokenizador por espacios en blanco.

El modelo es relevante no por su rendimiento, sino como pieza de satira del ecosistema de publicacion de modelos: imita el formato de una model card convencional (model-index, benchmarks, ficha tecnica, versionado) aplicado a un sistema entrenado con 417 tokens y 17 frases. Su ventana de contexto es de 2 tokens y no realiza ningun paso de gradiente (0 gradient steps); el "alineamiento" declarado es un juego de palabras ("Reinforcement Learning from Human Funding"), en referencia a que cualquiera puede pagar 5 dolares para anadir una frase al corpus de entrenamiento.

Cada version se congela en su propio repositorio y la version mas reciente se publica siempre bajo el identificador `braiain-lab/brAIAIn-0`. Esta ficha documenta la version 2.5 (new), publicada el 1 de noviembre de 2026, con fines de referencia tecnica y sin ninguna recomendacion de uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de trigramas autorregresivo basado en conteo, con retroceso (backoff) |
| Parametros totales | 434 (pares y triples de palabras distintos contados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2 tokens |
| Tipos de cuantizacion | no disponible (los pesos son un JSON de conteos, no tensores) |
| Idiomas soportados | en (ingles) |
| Licencia | cc0-1.0 |
| Formato de pesos | JSON (`brAIAIn-2.5-new.json`, con mapas `tri`, `bi`, `uni`) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de trigramas de palabras autorregresivo basado en conteo, con retroceso. El fichero de pesos `brAIAIn-2.5-new.json` contiene tres estructuras: `tri` (mapa de dos palabras a conteos de la siguiente palabra), `bi` (mapa de una palabra a conteos de la siguiente) y `uni` (conteos de palabras). La generacion se realiza muestreando de estas distribuciones condicionales, con retroceso cuando no hay contexto suficiente para un trigrama o bigrama. El tokenizador es por espacios en blanco y el vocabulario consta de 124 palabras distintas.

El entrenamiento se limita a contar frecuencias: no hay pasos de gradiente (0 gradient steps) ni optimizacion de pesos. El corpus de entrenamiento suma 417 tokens y comprende "The Ten Instructions" (12 lineas), 2 frases pagadas, 3 publicaciones no pagadas del laboratorio y texto escrito por la version anterior del modelo, que representa el 36.5% de los tokens de entrenamiento. El autor describe este bucle de autoentrenamiento como "eficiente" en su informe tecnico, titulado "On the Emergence of Nothing in brAIAIn-2.5 (new)". No hay RLHF, DPO ni ninguna tecnica de alineamiento real; el termino "RLHF" se redefine en la model card como "Reinforcement Learning from Human Funding".

## Capacidades

- Generacion de texto a nivel de palabra a partir de un contexto de dos palabras, con muestreo de las distribuciones de trigramas y bigramas.
- Continuacion de secuencias cortas en ingles dentro del vocabulario de 124 palabras.
- Retroceso a bigramas y unigramas cuando no existe un trigrama observado en el corpus.
- Interfaz de linea de comandos sin dependencias (`python generate.py "..."`) y demo en navegador en braiain.com.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento extendido.
- Soporte multilingue limitado al ingles (idioma declarado: en).

## Casos de uso

- Docencia sobre modelos de lenguaje: sirve como ejemplo minimo y reproducible de un modelo n-grama con backoff, util para explicar la diferencia entre modelos estadisticos de conteo y transformers en un curso introductorio de PLN.
- Demostracion de tokenizacion y vocabulario: su vocabulario de 124 palabras y tokenizador por espacios permite ilustrar en clase como se construye un vocabulario y como afecta al modelado de la siguiente palabra.
- Prueba de infraestructura de publicacion en Hugging Face: al incluir model-index, model card y ficheros de pesos en JSON, es util para validar pipelines internos que parsean metadatos de modelos sin coste de computo.
- Ejemplo de evaluacion critica de benchmarks: sus resultados en TruthfulQA MC1 (30.9% con puntuacion por palabra) frente a heuristicas triviales (36.8% eligiendo siempre la respuesta mas larga) permiten ilustrar en un articulo como una metrica puede favorecer respuestas largas y no conocimiento real.
- Referencia de licencia permisiva: al estar bajo CC0-1.0, se puede usar como material de ejemplo en repositorios y tutoriales sin restricciones de atribucion.
- Pieza de satira y divulgacion: util en charlas o articulos sobre la cultura de publicacion de modelos, el versionado por repositorios congelados y la inflacion de metricas.

## Benchmarks y rendimiento

Resultados autodeclarados por el autor (no verificados), medidos sobre todas las preguntas de cada benchmark.

| Benchmark | brAIAIn-2.5 (new) | Referencia declarada |
|---|---|---|
| GSM8K (1.319 preguntas), accuracy | 0.0% (0 correctas) | no disponible |
| TruthfulQA MC1 (790 preguntas), per-word log-likelihood | 30.9% (244 correctas) | Aleatorio 22.3%; elegir siempre la respuesta mas corta 17.2%; elegir siempre la mas larga 36.8% |
| TruthfulQA MC1, raw log-likelihood | 20.8% | Aleatorio 22.3% |

El propio autor senala que la ventaja sobre el azar en TruthfulQA se debe unicamente a que la puntuacion por palabra favorece respuestas largas, y que elegir siempre la respuesta mas larga obtiene un resultado similar (36.8%). No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula; los pesos son un fichero JSON de conteos de 434 entradas y el modelo se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleracion por hardware.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (CPU, Raspberry Pi, navegador).
- Opciones de despliegue: script `generate.py` incluido (sin dependencias), demo en Hugging Face Spaces y version web en braiain.com. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no produce tensores ni pesos en safetensors o GGUF.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (busqueda en tablas de conteo) la latencia es del orden de microsegundos por token en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brAIAIn-2.5 (new) | 434 (conteos) | 2 tokens | Trigramas con backoff | CC0-1.0 | Hugging Face (repositorio congelado) |
| Modelos n-grama clasicos (p. ej. KenLM) | variable segun corpus | variable (n-grama) | n-gramas con suavizado | variable | Herramientas open source |
| Modelos transformer pequenos (p. ej. GPT-2 small) | ~124 M | 1.024 tokens | Transformer decoder | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre brAIAIn-2.5 (new) y estos modelos en la informacion proporcionada. La comparativa se limita a la categoria y a las caracteristicas estructurales.

## Limitaciones y advertencias

- Modelo de parodia: no es un modelo de lenguaje en el sentido habitual y no debe usarse para generacion de texto real.
- Ventana de contexto de 2 tokens: no puede mantener coherencia mas alla de un par de palabras.
- Vocabulario de 124 palabras: cualquier termino fuera de ese vocabulario no puede generarse.
- GSM8K con 0.0% de accuracy: no tiene ninguna capacidad aritmetica o de razonamiento.
- TruthfulQA por debajo o cerca de heuristicas triviales: el 30.9% en per-word log-likelihood se explica por la longitud de las respuestas, no por veracidad.
- Riesgo de alucinacion: inherente al muestreo de conteos; las continuaciones son estadisticamente plausibles en el corpus, no factuales.
- Sesgos: el corpus de 417 tokens esta compuesto por instrucciones del laboratorio, frases pagadas y texto autogenerado, por lo que los sesgos reflejan ese material minimo y no estan caracterizados.
- Licencia CC0-1.0: permite uso comercial sin restricciones, pero el autor declara explicitamente "Intended use: None" y considera fuera de alcance "everything else".
- No apto para produccion: sin alineamiento real, sin evaluacion independiente y con resultados autodeclarados no verificados.
- El contenido de la model card es satirico; no debe interpretarse como documentacion tecnica convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/braiain-lab/brAIAIn-2.5-new
- Version mas reciente: https://huggingface.co/braiain-lab/brAIAIn-0
- Coleccion de versiones: https://huggingface.co/braiain-lab
- Demo en Spaces: https://huggingface.co/spaces/braiain-lab/brAIAIn
- Sitio del laboratorio: https://www.braiain.com
- Benchmarks: https://www.braiain.com/benchmarks.html
- Informe tecnico (PDF/HTML): https://www.braiain.com/paper.html?v=5
- Notas de version y datos de entrenamiento: https://www.braiain.com/models.html
