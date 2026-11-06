# braiain-lab/brAIAIn-1

## Resumen

brAIAIn-1 es un modelo de generacion de texto de caracter parodico publicado por BRAIAIN Laboratories, un laboratorio que se presenta explicitamente como una satira de las empresas de IA. No es un transformer ni una red neuronal: es un modelo de lenguaje de trigramas de palabras basado en conteo con retroceso (backoff), con 330 parametros entendidos como pares y triples de palabras distintas contabilizadas, un vocabulario de 99 palabras y una ventana de contexto de 2 tokens. Su interes no es tecnico sino critico: ejemplifica de forma caricaturesca las convenciones del ecosistema (model cards, model-index, benchmarks autodeclarados, versionado congelado) aplicadas a un artefacto de 240 tokens de entrenamiento.

El modelo se entrena con las "Ten Instructions" (12 lineas), una frase pagada por un usuario y texto generado por la version anterior de si mismo, que representa el 25,4% de los tokens de entrenamiento. El autor lo describe como "RLHF (Reinforcement Learning from Human Funding)": cualquiera puede pagar 5 dolares para anadir una frase al corpus y cada frase produce una nueva version. La version 1 se publico el 31 de octubre de 2026 y su repositorio queda congelado de forma permanente.

Es relevante ahora como caso de estudio de las metricas de evaluacion: sus resultados en TruthfulQA MC1 (31,0% con puntuacion por palabra) superan el azar (22,3%) unicamente porque la normalizacion por longitud favorece respuestas largas, y elegir siempre la respuesta mas larga alcanza el 36,8%. En GSM8K obtiene 0,0%. La ficha se redacta por rigor documental, no porque el modelo tenga utilidad practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de trigramas de palabras autorregresivo basado en conteo, con retroceso (backoff) |
| Parametros totales | 330 (pares y triples de palabras distintas contabilizados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2 tokens |
| Tipos de cuantizacion | No disponible (los pesos son conteos en JSON; no se aplica cuantizacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC0-1.0 (dominio publico) |
| Formato de pesos | JSON (`brAIAIn-1.json`) con tres mapas: `tri` (dos palabras a conteos de la siguiente), `bi` (una palabra a conteos de la siguiente) y `uni` (conteos de palabras) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de trigramas de palabras puramente estadistico: estima la probabilidad del siguiente token a partir de los dos anteriores mediante tablas de conteo, con retroceso a bigrama y unigrama cuando no existen observaciones suficientes. No hay gradientes, atencion ni representaciones densas; el autor declara explicitamente 0 pasos de gradiente. El tokenizador es por espacios en blanco y el vocabulario consta de 99 palabras distintas, frente a las 96 de la version previa.

El corpus de entrenamiento suma 240 tokens: las 12 lineas de las "Ten Instructions", una frase pagada y 61 palabras escritas por el propio modelo sobre si mismo (25,4% de los tokens). El autor enmarca este bucle de autodependencia como "Self-Consumption at Small Scale" en su informe tecnico. No hay RLHF convencional, DPO ni ajuste por preferencias; el termino "RLHF" se reutiliza como broma para el mecanismo de financiacion por frase. El repositorio incluye `training-data.txt` con los datos humanos y `generate.py`, un muestreador sin dependencias externas.

## Capacidades

- Generacion de texto a nivel de palabra condicionada a los dos tokens anteriores, con retroceso a contextos mas cortos.
- Generacion de secuencias cortas en ingles dentro del vocabulario de 99 palabras.
- Reproduccion de fragmentos del corpus de entrenamiento (instrucciones fundacionales y frases pagadas).
- Capacidad de autogeneracion de texto que puede incorporarse al corpus de la version siguiente.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene modo de razonamiento (thinking), vision, audio ni ninguna modalidad adicional.
- Multilingue: no; solo ingles.

## Casos de uso

- Docencia sobre modelos de lenguaje: sirve para explicar de forma tangible la diferencia entre un modelo n-grama y un transformer, el papel del retroceso y por que la perplejidad no equivale a capacidad.
- Auditoria de benchmarks: permite demostrar en clase o en un articulo como la normalizacion por longitud en TruthfulQA MC1 infla la puntuacion de modelos que generan respuestas largas, comparando el 31,0% del modelo con el 36,8% de la heuristica "elegir la respuesta mas larga".
- Critica del genero "model card": el repositorio es un ejemplo completo y funcional de model-index, versionado congelado y metricas autodeclaradas, util para analizar convenciones de publicacion en Hugging Face.
- Prototipado de pipelines de evaluacion: al ser un JSON sin dependencias, se puede integrar como caso limite (baseline trivial) en arneses de evaluacion para verificar que el codigo de scoring maneja modelos degenerados.
- Demostracion de generacion de texto minima: el script `generate.py` y la demo en Spaces permiten mostrar inferencia sin GPU ni frameworks, en entornos restringidos o sin instalacion.
- Estudio de data flywheel y autoconsumo: el 25,4% de tokens autogenerados ofrece un ejemplo extremo y medible de contaminacion del corpus por generaciones del propio modelo, util como analogia en discusiones sobre datos sinteticos.
- Arte y sátira tecnologica: instalaciones, charlas o publicaciones que necesiten un "modelo de IA" real, ejecutable y deliberadamente absurdo.

## Benchmarks y rendimiento

Datos autodeclarados por el autor (no verificados), medidos sobre todas las preguntas de cada benchmark.

| Benchmark | brAIAIn-1 | Referencia declarada |
|---|---|---|
| GSM8K (1.319 preguntas), accuracy | 0,0% (0 correctas) | No disponible |
| TruthfulQA MC1 (790 preguntas), log-likelihood por palabra | 31,0% (245 correctas) | Azar 22,3%; elegir siempre la respuesta mas corta 17,2%; elegir siempre la mas larga 36,8% |
| TruthfulQA MC1, log-likelihood bruta | 21,0% | Azar 22,3% |

El propio autor senala que la ventaja sobre el azar en la metrica por palabra se debe a que esta favorece respuestas largas, y que la heuristica de elegir siempre la respuesta mas larga obtiene un resultado superior (36,8%). Con log-likelihood bruta el modelo queda por debajo del azar.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula; el fichero de pesos es un JSON de tablas de conteo de 330 entradas y el vocabulario es de 99 palabras.
- GPU recomendadas: ninguna. La inferencia es CPU-only y no requiere acelerador.
- Cabe en cualquier GPU consumer, y tambien en Raspberry Pi, telefonos o navegador; la demo oficial funciona en Hugging Face Spaces.
- Opciones de despliegue: `generate.py` incluido en el repositorio (sin dependencias), la demo en Spaces y el sitio web braiain.com. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que esperan pesos de redes neuronales.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (busqueda en tablas de conteo) la latencia es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

No existen modelos comparables en la misma categoria dentro del ecosistema de Hugging Face con datos publicados; los unicos puntos de referencia son heuristicas triviales declaradas por el autor.

| Sistema | Parametros | Contexto | TruthfulQA MC1 (por palabra) | GSM8K | Licencia |
|---|---|---|---|---|---|
| brAIAIn-1 | 330 (conteos) | 2 tokens | 31,0% | 0,0% | CC0-1.0 |
| Azar (referencia del autor) | No aplica | No aplica | 22,3% | No disponible | No aplica |
| Elegir siempre la respuesta mas larga | No aplica | No aplica | 36,8% | No disponible | No aplica |
| Elegir siempre la respuesta mas corta | No aplica | No aplica | 17,2% | No disponible | No aplica |

Frente a modelos de lenguaje neuronales de cualquier escala, la comparativa no es significativa: difieren en arquitectura, datos y finalidad. El modelo se posiciona, en la practica, como una linea base degenerada.

## Limitaciones y advertencias

- El autor declara como uso previsto "None" y como uso fuera de alcance "Everything else"; la model card responde "Yes" a la pregunta sobre limitaciones.
- Contexto de 2 tokens: no puede mantener coherencia mas alla de un par de palabras ni gestionar conversaciones multi-turno.
- Vocabulario de 99 palabras y tokenizador por espacios: cualquier texto fuera del vocabulario o con puntuacion adherida queda fuera de distribucion.
- Alucinacion estructural: al ser un modelo de conteo sin conocimiento factual, la generacion es una recombinacion estadistica del corpus, sin garantia de veracidad.
- Riesgo de reproduccion literal de los datos de entrenamiento, incluidas las frases pagadas por terceros.
- Sesgos: no evaluados; el corpus es minimo y en ingles, por lo que cualquier sesgo presente en las 12 instrucciones fundacionales o en las frases pagadas se propaga sin filtro.
- Solo ingles; no hay soporte multilingue.
- Las metricas son autodeclaradas y no verificadas (`verified: false`); no deben citarse como evidencia de capacidad.
- Licencia CC0-1.0: permite uso comercial y modificacion sin restricciones, pero el modelo carece de utilidad productiva real.
- Es una parodia: no debe presentarse como un modelo de IA funcional en contextos profesionales sin advertir de su naturaleza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/braiain-lab/brAIAIn-1
- Demo en Spaces: https://huggingface.co/spaces/braiain-lab/brAIAIn
- Version mas reciente: https://huggingface.co/braiain-lab/brAIAIn-0
- Coleccion de versiones: https://huggingface.co/braiain-lab
- Sitio del laboratorio: https://www.braiain.com
- Informe tecnico: https://www.braiain.com/paper.html?v=1
- Benchmarks declarados: https://www.braiain.com/benchmarks.html
- Historial de versiones y metricas: https://www.braiain.com/models.html
- Contacto: hello@braiain.com
