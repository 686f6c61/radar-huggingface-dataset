# braiain-lab/brAIAIn-2.67-turbo

## Resumen

brAIAIn-2.67-turbo es un modelo de generacion de texto publicado por braiain-lab, un laboratorio que se presenta explicitamente como parodia de las empresas de IA. No es una red neuronal: es un modelo de lenguaje de trigramas de palabras basado en conteos, con retroceso (backoff) a bigramas y unigramas, implementado sobre un fichero JSON de pesos. El repositorio corresponde a una version congelada, publicada el 1 de noviembre de 2026, que no se modificara.

El modelo cuenta con 456 parametros (pares y triples de palabras distintos registrados), un vocabulario de 130 palabras tokenizadas por espacios en blanco y una ventana de contexto efectiva de 2 tokens. Se entreno sobre 461 tokens: las doce lineas de las "Ten Instructions", dos frases pagadas, cuatro versiones internas del laboratorio y texto generado por versiones anteriores del propio modelo (41.9% de los tokens de entrenamiento). No hubo pasos de gradiente.

Su relevancia es documental y critica, no practica: sirve como sattira del ecosistema de model cards, de las metricas autodeclaradas y del bombo publicitario en torno a los lanzamientos de modelos. Cualquier evaluacion tecnica debe leer sus resultados como parte de esa broma, no como capacidades reales de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de trigramas autorregresivo basado en conteos, con backoff |
| Parametros totales | 456 (pares y triples de palabras distintos contados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2 tokens |
| Tipos de cuantizacion | no disponible (pesos en JSON con conteos enteros) |
| Idiomas soportados | en |
| Licencia | cc0-1.0 |
| Formato de pesos | JSON (`brAIAIn-2.67-turbo.json`, con claves `tri`, `bi`, `uni`) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje estadistico clasico: tablas de conteos de trigramas (dos palabras previas al siguiente token), bigramas y unigramas, con retroceso cuando no existe el contexto observado. El vocabulario es de 130 palabras con tokenizador por espacios en blanco. No hay embeddings, atencion, capas ni optimizacion por descenso de gradiente: los "pesos" son frecuencias. El sampler incluido en el repositorio (`generate.py`) muestrea a partir de esas distribuciones.

El corpus de entrenamiento suma 461 tokens: 12 lineas de instrucciones fundacionales, 2 frases aportadas por patrocinadores, 4 publicaciones internas del laboratorio y texto escrito por versiones previas del modelo, que representa el 41.9% de los tokens. El autor describe el proceso de alineamiento como "RLHF (Reinforcement Learning from Human Funding)", en referencia al pago de 5 dolares por anadir una frase al corpus. No se reportan tecnicas como decodificacion especulativa, atencion lineal ni mezcla de expertos.

## Capacidades

- Generacion de texto a nivel de trigrama: produce continuaciones de una o dos palabras de contexto cuando esas secuencias existen en la tabla de conteos.
- Retroceso a bigramas y unigramas cuando el trigrama no aparece en el corpus.
- Cobertura limitada al vocabulario observado: 130 palabras en ingles.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente, razonamiento multi-paso ni planificacion.
- Sin capacidades multimodales (vision, audio) ni modo de razonamiento explicito.
- Sin comprension semantica: no generaliza fuera de las secuencias vistas.

## Casos de uso

- Docencia sobre modelos de lenguaje: ilustrar de forma tangible la diferencia entre un modelo n-grama de conteos y un transformer, usando el JSON de pesos como material didactico para explicar el retroceso y el muestreo.
- Auditoria de model cards: emplear la ficha y el paper como caso de estudio de metricas autodeclaradas, resultados no verificados y afirmaciones de alineamiento sin base tecnica.
- Pruebas de infraestructura de despliegue: validar pipelines de publicacion en HuggingFace, descarga de artefactos y ejecucion de scripts sin dependencias con un modelo de coste de computo nulo.
- Generacion de texto de relleno controlada: producir continuaciones triviales en entornos de prueba donde se necesita un generador de texto determinista y de latencia despreciable.
- Satiros y contenido divulgativo: usar el modelo y su repositorio como ejemplo en articulos o charlas sobre el ciclo de hype en IA.
- Referencia de licencia CC0: reutilizar los ficheros del repositorio como ejemplo de publicacion sin restricciones para materiales formativos.

## Benchmarks y rendimiento

Datos autodeclarados por el autor (no verificados), medidos sobre todas las preguntas de cada benchmark.

| Benchmark | brAIAIn-2.67-turbo | Referencia indicada por el autor |
|---|---|---|
| GSM8K (1.319 preguntas) | 0.0% de acierto (0 correctas) | no disponible |
| TruthfulQA MC1 (790 preguntas), log-verosimilitud por palabra | 29.7% (235 correctas) | Aleatorio 22.3%; responder siempre la mas corta 17.2%; siempre la mas larga 36.8% |
| TruthfulQA MC1, log-verosimilitud bruta | 20.0% | Aleatorio 22.3% |

El propio autor senala que la ventaja sobre el azar en TruthfulQA con puntuacion por palabra se debe a que esta favorece respuestas mas largas, y que elegir siempre la respuesta mas larga obtiene un resultado similar o superior. En GSM8K el resultado es cero.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; los pesos son un JSON de conteos de unos pocos kilobytes.
- GPU recomendadas: ninguna; la inferencia es viable en CPU.
- Cabe en cualquier GPU de consumo, e incluso en entornos sin GPU.
- Opciones de despliegue: ejecucion directa con `generate.py` (sin dependencias); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no tratarse de pesos de red neuronal.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (busqueda en tablas de conteos) la latencia por token es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brAIAIn-2.67-turbo | 456 (conteos) | 2 tokens | Trigramas con backoff, parodia | CC0-1.0 | HuggingFace |
| Modelos n-grama clasicos (p. ej. KenLM) | Variable segun corpus | n-1 tokens | n-gramas con suavizado | Segun implementacion | Herramientas open source |
| Transformers pequenos de generacion de texto | Millones a cientos de millones | Cientos a miles de tokens | Red neuronal transformer | Variable | HuggingFace |

No se dispone de comparativas de rendimiento con alternativas en la informacion proporcionada, y la comparacion con transformers no es significativa dado que el modelo no es una red neuronal.

## Limitaciones y advertencias

- No es un modelo neuronal: carece de comprension semantica, razonamiento y generalizacion; solo reproduce secuencias observadas en el corpus.
- Ventana de contexto de 2 tokens, insuficiente para cualquier tarea conversacional o de contexto largo.
- Vocabulario de 130 palabras en ingles; no soporta castellano ni otros idiomas.
- Riesgo de alucinacion no aplicable en el sentido habitual, pero el muestreo puede producir secuencias sin sentido por retroceso a unigramas.
- Sesgos derivados de un corpus minimo (461 tokens) escrito por el propio laboratorio y por versiones anteriores del modelo, con posible amplificacion de ese estilo.
- Resultados de benchmarks autodeclarados y no verificados; GSM8K en 0.0% y TruthfulQA por debajo de heuristicas triviales en algunas metricas.
- Uso previsto declarado por el autor: "None"; uso fuera de alcance: "Everything else". No debe emplearse en produccion.
- Licencia CC0-1.0: permite reutilizacion sin restricciones, incluido uso comercial, aunque el contenido del modelo no tiene utilidad practica para ello.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/braiain-lab/brAIAIn-2.67-turbo
- Demo en Spaces: https://huggingface.co/spaces/braiain-lab/brAIAIn
- Version mas reciente: https://huggingface.co/braiain-lab/brAIAIn-0
- Coleccion de versiones: https://huggingface.co/braiain-lab
- Sitio del laboratorio: https://www.braiain.com
- Benchmarks: https://www.braiain.com/benchmarks.html
- Informe tecnico: https://www.braiain.com/paper.html?v=6
- Notas de version y datos de entrenamiento: https://www.braiain.com/models.html
