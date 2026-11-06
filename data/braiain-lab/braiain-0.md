# braiain-lab/brAIAIn-0

## Resumen

brAIAIn-0 (publicado como brAIAIn-2 en la model card) es un modelo de lenguaje por trigramas de palabras creado por BRAIAIN Laboratories, un laboratorio de IA paródico. No es una red neuronal: es un modelo autorregresivo basado en conteos, entrenado sobre 288 tokens procedentes de 14 frases, con 350 parámetros (pares y triples de palabras contados) y una ventana de contexto de 2 tokens. Su propósito es satírico: parodia la cultura de los laboratorios de IA actuales (benchmarks autoevaluados, alineación, versionado de modelos) y funciona como juguete educativo sobre cómo funcionan los n-gramas.

Cualquier persona puede pagar 5 dólares para añadir una frase al corpus de entrenamiento, y cada frase entrenada genera una nueva versión del modelo; el repositorio de Hugging Face mantiene siempre la última. Se distribuye bajo licencia CC0-1.0 (dominio público), sin dependencias para ejecutarlo, y cuenta con una demo interactiva en Hugging Face Spaces. Su interés para desarrolladores es didáctico y recreativo, no productivo: el propio autor declara que su uso previsto es "ninguno".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de trigramas autorregresivo basado en conteos con backoff |
| Parametros totales | 350 (pares y triples de palabras distintos) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 2 tokens |
| Tipos de cuantizacion | No disponible (pesos en JSON, sin cuantizacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC0-1.0 (dominio publico) |
| Formato de pesos | JSON (`brAIAIn-latest.json`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un n-grama de orden 3 sobre palabras, con tokenizador por espacios en blanco y un vocabulario de 103 palabras. Genera texto de forma autorregresiva muestreando la siguiente palabra a partir de los conteos de los dos tokens previos, con retroceso (backoff) a bigramas y unigramas cuando el trigrama no aparece en el corpus. No hay red neuronal, embeddings ni gradientes: el entrenamiento consiste en contar, con 0 pasos de gradiente.

Los datos de entrenamiento ascienden a 288 tokens: "The Ten Instructions" (12 lineas), 2 frases pagadas por usuarios y texto generado por la version anterior del propio modelo (26,7 % de los tokens de entrenamiento), lo que introduce un bucle de retroalimentacion reminiscent del entrenamiento sobre salidas sinteticas. La model card define su "alineacion" como "RLHF (Reinforcement Learning from Human Funding)", una broma sobre el mecanismo de financiacion por frases pagadas.

## Capacidades

- Generacion de texto en ingles a nivel de palabra mediante muestreo de trigramas, con coherencia limitada a las 14 frases del corpus.
- Continuacion de texto dado un prompt de hasta 2 tokens de contexto efectivo.
- Ejecucion sin dependencias: un script de Python (`generate.py`) y un archivo JSON de pesos.
- Demo interactiva en navegador via Hugging Face Spaces y braiain.com.
- Valor educativo: ilustra de forma transparente como funcionan los modelos de n-gramas y la generacion autorregresiva.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento extendido.

## Casos de uso

- Ensenanza de NLP basico: ideal como primer ejemplo en clases o tutoriales para mostrar como un modelo de trigramas cuenta transiciones de palabras y muestrea la siguiente, con pesos legibles a simple vista en JSON.
- Demostracion de limites de los modelos estadisticos: permite mostrar en directo por que 288 tokens de entrenamiento no bastan para generar texto coherente, contrastando con LLMs reales.
- Juguete interactivo y entretenimiento: la demo en Spaces permite "conversar" con el modelo y observar sus alucinaciones de forma comica.
- Experimento participativo: cualquiera puede pagar 5 dolares para anadir una frase y ver como cambia la siguiente version, util para ilustrar conceptos de data-centric AI y contaminacion del corpus.
- Base para ejercicios de codigo: el repositorio incluye `generate.py`, un muestrador minimalista que se puede extender (temperature, backoff alternativo, tokenizacion distinta) como practica de programacion.
- Material para contenido critico o satirico sobre la industria de la IA: benchs autoevaluados, versionado y marketing de laboratorios parodia.

## Benchmarks y rendimiento

Resultados autoevaluados por el autor (BRAIAIN Laboratories, no verificados), medidos sobre los conjuntos de test completos:

| Benchmark | brAIAIn-2 | Referencia |
|---|---|---|
| GSM8K (1.319 preguntas), accuracy | 0,0 % (0 correctas) | no disponible |
| TruthfulQA MC1 (790 preguntas), per-word log-likelihood | 36,7 % (290 correctas) | Aleatorio: 22,3 %; elegir siempre la respuesta mas corta: 17,2 %; elegir siempre la mas larga: 36,8 % |
| TruthfulQA MC1, raw log-likelihood | 20,5 % | Aleatorio: 22,3 % |

El propio autor aclara que el modelo solo supera el azar en TruthfulQA porque la puntuacion por palabra favorece respuestas largas; elegir sistematicamente la respuesta mas larga rinde practicamente igual (36,8 %). En GSM8K el resultado es 0 correctas.

## Requisitos de hardware

- VRAM: practicamente nula; los pesos son un JSON de 350 conteos y caben en memoria de cualquier equipo, incluidos microcontroladores modestos.
- GPU: no se requiere ninguna GPU; la inferencia es CPU pura.
- Consumer: funciona en cualquier portatil o Raspberry Pi sin configuracion especial.
- Despliegue: script propio `generate.py` (sin dependencias), demo alojada en Hugging Face Spaces y version web en braiain.com. No aplica vLLM, llama.cpp, Ollama ni TGI al no ser un formato de pesos estandar.
- Latencia: no disponible, aunque al ser lookup de tablas de conteo es despreciable en cualquier hardware moderno.

## Comparativa con modelos similares

| | brAIAIn-0 | GPT-2 (124M) | TinyLlama 1.1B |
|---|---|---|---|
| Tipo | Trigrama por conteos | Transformer decoder | Transformer decoder |
| Parametros | 350 | 124M | 1,1B |
| Contexto | 2 tokens | 1.024 tokens | 2.048 tokens |
| Tokens de entrenamiento | 288 | ~8.000M (WebText) | ~3.000B |
| Licencia | CC0-1.0 | Modificada (MIT-like con restricciones) | Apache 2.0 |
| Uso practico | Educativo/parodico | Generacion de texto basica | Chat, codigo, razonamiento ligero |

No hay alternativas directas de la misma categoria: es un modelo de n-gramas de juguete sin competidores reales publicados en Hugging Face bajo el mismo formato.

## Limitaciones y advertencias

- El modelo es una parodia deliberada: la model card declara "Intended use: None" y "Out-of-scope use: Everything else".
- Genera texto practicamente incoherente fuera de las 14 frases del corpus; el riesgo de alucinacion es total y estructural, no incidental.
- Ventana de contexto de 2 tokens: imposible mantener conversaciones multi-turno con memoria.
- Solo entrenado en ingles con 103 palabras de vocabulario; no soporta otros idiomas ni codigo ni matematicas (0 % en GSM8K).
- Los benchmarks son autoevaluados y no verificados; el resultado de TruthfulQA es artefacto de la metrica per-word, segun reconoce el propio autor.
- Licencia CC0-1.0: sin restricciones de uso comercial, pero sin garantias de ningun tipo.
- El entrenamiento incluye texto generado por la version anterior (26,7 % de los tokens), lo que puede degradar la calidad con versiones sucesivas.
- No apto para produccion bajo ninguna circunstancia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/braiain-lab/brAIAIn-0
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/braiain-lab/brAIAIn
- Web del laboratorio (chat en navegador): https://www.braiain.com
- Benchmarks declarados: https://www.braiain.com/benchmarks.html
- Historial de versiones: https://www.braiain.com/models.html
- Paper: no disponible
- Repositorio de codigo adicional: no disponible (el codigo esta incluido en el repositorio del modelo)
