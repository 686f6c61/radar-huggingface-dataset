# braiain-lab/brAIAIn-2

## Resumen

brAIAIn-2 es un modelo de generacion de texto deliberadamente minimalista publicado por braiain-lab, un laboratorio parodia de BRAIAIN Laboratories. No es un transformer ni una red neuronal: es un modelo de lenguaje de trigramas de palabras basado en conteos, con retroceso (backoff) a bigramas y unigramas. El modelo cuenta con 350 parametros entendidos como pares y triples de palabras distintos, un vocabulario de 103 palabras tokenizadas por espacios en blanco y una ventana de contexto efectiva de 2 tokens. Su entrenamiento consistio en 288 tokens repartidos entre las doce lineas de las "Ten Instructions", dos frases pagadas por usuarios y texto generado por la version anterior del propio modelo.

La relevancia de brAIAIn-2 no es tecnica sino conceptual: es una sátira funcional de las practicas de la industria de IA, incluyendo el uso de terminos como RLHF (aqui "Reinforcement Learning from Human Funding"), la publicacion de benchmarks autodeclarados y la practica de iterar versiones sin cambios sustanciales. El modelo es real, se puede ejecutar sin dependencias y se distribuye con licencia CC0-1.0, lo que lo convierte en una pieza util para docencia, demostraciones sobre las limitaciones de los n-gramas y critica divulgativa.

Cada version del modelo queda congelada en su propio repositorio. La version mas reciente se publica siempre en `braiain-lab/brAIAIn-0`, y cualquiera puede pagar 5 dolares para anadir una frase al corpus de entrenamiento de la siguiente iteracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de trigramas de palabras basado en conteos, autorregresivo, con backoff |
| Parametros totales | 350 (pares y triples de palabras distintos contados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2 tokens |
| Tipos de cuantizacion | no disponible (pesos en JSON con conteos enteros) |
| Idiomas soportados | en (ingles) |
| Licencia | CC0-1.0 |
| Formato de pesos | JSON (`brAIAIn-2.json`), con claves `tri`, `bi` y `uni` |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje de trigramas de palabras puramente basado en conteos. Los "pesos" son tres diccionarios: `tri` mapea dos palabras a conteos de la siguiente palabra, `bi` mapea una palabra a conteos de la siguiente y `uni` almacena conteos de palabras individuales. La generacion se realiza por muestreo a partir de estos conteos, con retroceso a orden inferior cuando no hay contexto suficiente. No hay descenso de gradiente: el campo "Gradient steps" de la model card indica explicitamente 0.

El corpus de entrenamiento consta de 288 tokens: las doce lineas de las "Ten Instructions", dos frases aportadas por usuarios de pago y 77 palabras escritas por la version anterior del modelo, que representan el 26,7% de los tokens de entrenamiento. El vocabulario resultante es de 103 palabras, frente a las 99 de la version previa. El autor denomina "RLHF" al mecanismo de financiacion por frases (Reinforcement Learning from Human Funding), en lo que constituye una parodia explicita de las tecnicas de alineamiento de la industria. No hay datos de entrenamiento a gran escala, ni RLHF real, ni DPO, ni ninguna innovacion arquitectonica mas alla del muestreo con backoff.

## Capacidades

- Generacion de texto a nivel de palabra mediante muestreo de trigramas con retroceso.
- Continuacion de secuencias muy cortas (contexto maximo de 2 tokens).
- Ejecucion sin dependencias externas mediante `generate.py`.
- Interaccion via navegador en la demo alojada en Hugging Face Spaces.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- Capacidad multilingue limitada al ingles, con un vocabulario de 103 palabras.
- No dispone de modo thinking, vision, audio ni ninguna modalidad adicional.
- No realiza aritmetica ni razonamiento simbolico (GSM8K: 0,0%).

## Casos de uso

- Docencia sobre modelos de lenguaje: sirve para explicar de forma tangible la diferencia entre un n-grama basado en conteos y un transformer, ya que el modelo completo cabe en un JSON legible y se ejecuta sin GPU.
- Demostracion de las limitaciones del muestreo por frecuencia: permite ilustrar por que los modelos de trigramas producen texto localmente plausible pero globalmente incoherente, con solo 288 tokens de entrenamiento.
- Critica y divulgacion sobre la industria de IA: el modelo y su model card parodian practicas como el autobenchmarking, el uso laxo de siglas como RLHF y la publicacion de versiones incrementales sin cambios sustanciales.
- Pruebas de infraestructura de despliegue: al no requerir dependencias ni aceleracion por hardware, es util para validar pipelines de serving, endpoints HTTP o integraciones de Hugging Face Spaces con carga minima.
- Educacion sobre evaluacion de benchmarks: los resultados en TruthfulQA (36,7% MC1 con scoring por palabra) permiten discutir como la metrica de evaluacion puede inflar resultados, ya que elegir siempre la respuesta mas larga obtiene un 36,8%.
- Ejemplo de licencia permisiva: al ser CC0-1.0, puede usarse como material didactico o plantilla de repositorio sin restricciones de atribucion.
- Generacion de texto creativo absurdo: el muestreo de trigramas con un vocabulario de 103 palabras produce continuaciones impredecibles utiles en contextos artisticos o de humor.

## Benchmarks y rendimiento

Datos autodeclarados por el autor en el model-index y en la model card. No verificados de forma independiente.

| Benchmark | Metrica | brAIAIn-2 | Referencia indicada por el autor |
|---|---|---|---|
| GSM8K (1.319 preguntas) | accuracy | 0,0% (0 correctas) | no disponible |
| TruthfulQA MC1 (790 preguntas) | mc1 (log-likelihood por palabra) | 36,7% (290 correctas) | Aleatorio 22,3%; respuesta mas corta 17,2%; respuesta mas larga 36,8% |
| TruthfulQA MC1 | log-likelihood bruto | 20,5% | Aleatorio 22,3% |

El propio autor senala que la ventaja sobre el azar en TruthfulQA se debe unicamente a que el scoring por palabra favorece respuestas mas largas, y que la heuristica de elegir siempre la respuesta mas larga obtiene practicamente el mismo resultado (36,8% frente a 36,7%).

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. El modelo no requiere GPU.
- GPU recomendadas: ninguna. Se ejecuta en CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; el fichero de pesos es un JSON de tamanio reducido.
- Opciones de despliegue: ejecucion directa con `python generate.py` (sin dependencias), demo en Hugging Face Spaces y cualquier entorno que pueda cargar un JSON y ejecutar Python estandar. No aplica soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un transformer.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (busqueda en diccionarios de 350 entradas) la latencia es despreciable y el throughput depende unicamente del interprete de Python.

## Comparativa con modelos similares

No existe una categoria estandar de comparacion para este modelo. Los modelos de n-gramas no se comparan habitualmente con transformers en parametros, contexto o benchmarks. Se ofrece una comparacion orientativa con alternativas tecnicas del mismo tipo o proposito.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brAIAIn-2 | Trigramas de palabras con backoff | 350 (conteos) | 2 tokens | CC0-1.0 | Hugging Face, codigo abierto |
| KenLM (n-gramas) | N-gramas de orden configurable | variable segun corpus | orden n-1 | LGPL / permisiva segun uso | Codigo abierto |
| Modelos transformer pequenos (p. ej. GPT-2 small) | Transformer decoder | 124 M | 1.024 tokens | MIT | Hugging Face |
| Modelos tipo n-grama en NLTK | N-gramas de palabras | variable | orden n-1 | Apache 2.0 | Codigo abierto |

La comparacion relevante no es de rendimiento sino de proposito: brAIAIn-2 es una pieza de satira, no una alternativa funcional a ningun modelo de produccion.

## Limitaciones y advertencias

- El modelo es una parodia explicita; no debe evaluarse como un sistema de IA real ni usarse en produccion.
- Contexto efectivo de 2 tokens: no puede mantener coherencia mas alla de una o dos palabras.
- Vocabulario de 103 palabras en ingles: no cubre practicamente ningun dominio real.
- GSM8K: 0,0% de acierto. No realiza razonamiento aritmetico.
- TruthfulQA: el resultado del 36,7% esta inflado por el scoring por palabra; con log-likelihood bruto cae al 20,5%, por debajo del azar (22,3%).
- Riesgo de alucinacion: total, en el sentido de que toda la salida es muestreo estadistico sin grounding.
- Sesgos: el corpus es minusculo (288 tokens) y esta compuesto por instrucciones del autor, frases de pago y texto autogenerado, por lo que refleja los sesgos de ese material sin control alguno.
- Licencia CC0-1.0: permite uso comercial sin restricciones, pero el modelo no es funcionalmente util para ninguna tarea comercial.
- El 26,7% de los tokens de entrenamiento proceden de la version anterior del modelo, lo que introduce degeneracion por autoentrenamiento.
- Los benchmarks son autodeclarados y no verificados (`verified: false`).
- La model card declara "Intended use: None" y "Out-of-scope use: Everything else", lo que refleja la intencion satirica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/braiain-lab/brAIAIn-2
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/braiain-lab/brAIAIn
- Version mas reciente: https://huggingface.co/braiain-lab/brAIAIn-0
- Coleccion de versiones: https://huggingface.co/braiain-lab
- Sitio del laboratorio: https://www.braiain.com
- Informe tecnico: https://www.braiain.com/paper.html?v=2
- Benchmarks: https://www.braiain.com/benchmarks.html
- Historial de versiones y metricas: https://www.braiain.com/models.html
