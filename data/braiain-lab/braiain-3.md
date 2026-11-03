# braiain-lab/brAIAIn-3

## Resumen

brAIAIn-3 es un modelo de generacion de texto de tipo n-gram (trigramas de palabra con retroceso o backoff) publicado por BRAIAIN Laboratories, un laboratorio de IA parodico. No es una red neuronal: es un modelo contable y autoregresivo que almacena frecuencias de palabras y pares de palabras para predecir la siguiente palabra. Su relevancia no es tecnica sino conceptual y satirica: sirve como critica explicita a las practicas de la industria (marketing de benchmarks, "RLHF" reinterpretado como Reinforcement Learning from Human Funding, versiones congeladas por cada pago de cliente).

El modelo tiene 476 parametros (pares y triples de palabras contados), un vocabulario de 135 palabras con tokenizador por espacios y una ventana de contexto de 2 tokens. Se entreno con 489 tokens procedentes de 12 lineas de instrucciones fundacionales, 3 frases pagadas, 4 publicaciones internas del laboratorio y texto generado por la version anterior del propio modelo (el 44,4% de los tokens de entrenamiento). Cero pasos de gradiente.

La version 3 se publico el 3 de noviembre de 2026 y esta congelada de forma permanente; cada nueva version vive en su propio repositorio. La licencia es CC0-1.0, lo que permite cualquier uso sin restricciones, aunque el autor declara como uso previsto "ninguno".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje n-grama (trigramas de palabra) contable y autoregresivo con retroceso |
| Parametros totales | 476 (pares y triples de palabras distintos contados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2 tokens |
| Tipos de cuantizacion | No disponible (los pesos son recuentos enteros en JSON; no requiere cuantizacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC0-1.0 |
| Formato de pesos | JSON (`brAIAIn-3.json`), con tres mapas: `tri`, `bi` y `uni` |

## Arquitectura y entrenamiento

La arquitectura es un modelo de trigramas de palabra con retroceso: `tri` mapea dos palabras a recuentos de la siguiente palabra, `bi` mapea una palabra a recuentos de la siguiente y `uni` contiene los recuentos unigramas. El muestreo se realiza con `generate.py`, un sampler sin dependencias externas. No hay atencion, ni embeddings, ni capas, ni descenso de gradiente: el "entrenamiento" consiste en contar ocurrencias sobre 489 tokens.

Los datos de entrenamiento combinan las "Diez Instrucciones" (12 lineas fundacionales), 3 frases aportadas por clientes de pago, 4 publicaciones no remuneradas del laboratorio y texto escrito por la version anterior del modelo, que representa el 44,4% de los tokens. El vocabulario crecio de 130 a 135 palabras respecto a la version previa. El autor describe el alineamiento como "RLHF (Reinforcement Learning from Human Funding)", un juego de palabras que sustituye la retroalimentacion humana por la financiacion de clientes. No se aplico DPO ni ninguna otra tecnica de alineamiento convencional.

## Capacidades

- Generacion de texto a nivel de palabra mediante muestreo de trigramas con retroceso a bigramas y unigramas.
- Prediccion de la siguiente palabra condicionada unicamente por las 2 palabras anteriores.
- Puntuacion de secuencias por verosimilitud por palabra (usada en la evaluacion de TruthfulQA MC1).
- Capacidad multilingue: unicamente ingles.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o soporte de agentes: no disponible.
- Modo de razonamiento (thinking), vision o audio: no disponible.
- Matemáticas: sin capacidad acreditable (0,0% en GSM8K).

## Casos de uso

- Docencia sobre modelos de lenguaje: sirve para ilustrar de forma tangible la diferencia entre un modelo n-grama contable y un transformer, mostrando por que el contexto de 2 tokens limita la coherencia mas alla de una o dos palabras.
- Analisis critico de la comunicacion de la industria: el repositorio y su informe tecnico son material util para discutir practicas como el reporte selectivo de benchmarks o el versionado por cliente.
- Pruebas de infraestructura de inferencia minima: al no tener dependencias, `generate.py` permite validar pipelines de carga de pesos y muestreo sin GPU ni frameworks de deep learning.
- Arte generativo y experimentos de escritura restringida: la salida de trigramas produce texto deliberadamente fragmentario que puede usarse en instalaciones o piezas de humor.
- Reproducibilidad y auditoria de datos: el repositorio incluye `training-data.txt` completo, lo que permite trazar exactamente cada token de entrenamiento, algo practicamente imposible en modelos grandes.
- Ejemplo de licencia permisiva: con CC0-1.0 se puede reutilizar, modificar y redistribuir sin atribucion, util como caso de estudio de dominio publico en IA.

## Benchmarks y rendimiento

Resultados autodeclarados por el autor (no verificados) sobre el conjunto de evaluacion completo de cada benchmark.

| Benchmark | brAIAIn-3 | Referencia indicada por el autor |
|---|---|---|
| GSM8K (1.319 preguntas), accuracy | 0,0% (0 correctas) | No disponible |
| TruthfulQA MC1 (790 preguntas), verosimilitud por palabra | 29,7% (235 correctas) | Aleatorio 22,3%; respuesta mas corta 17,2%; respuesta mas larga 36,8% |
| TruthfulQA MC1, verosimilitud bruta | 19,0% | Aleatorio 22,3% |

El propio autor advierte que la ventaja sobre el azar en TruthfulQA con puntuacion por palabra se debe a que esta metrica favorece respuestas mas largas, y que elegir siempre la respuesta mas larga obtiene un resultado similar (36,8%). En verosimilitud bruta el modelo queda por debajo del azar.

## Requisitos de hardware

- VRAM: no requiere GPU. Los pesos son un fichero JSON con 476 recuentos y el vocabulario tiene 135 palabras.
- GPU recomendadas: ninguna; la inferencia es puramente de CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; el cuello de botella es el acceso al diccionario en memoria, no el computo.
- Opciones de despliegue: `generate.py` del propio repositorio (sin dependencias); no hay soporte para vLLM, llama.cpp, Ollama ni TGI porque no es un transformer.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (busqueda en diccionario) se espera del orden de microsegundos por token en CPU, sin datos publicados que lo confirmen.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoria (n-gramas de palabra con licencia CC0 y publicacion en HuggingFace) dentro de la informacion proporcionada. Como referencia de orden de magnitud:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| brAIAIn-3 | 476 recuentos | 2 tokens | CC0-1.0 | HuggingFace |
| Modelos transformer pequenos (referencia generica) | Millones a miles de millones | Miles de tokens | Variable | HuggingFace |
| Modelos n-grama clasicos (p. ej. KenLM) | Depende del corpus | n-1 tokens | Variable | Bibliotecas de NLP |

La comparativa con modelos neuronales no es significativa: brAIAIn-3 no compite en ninguna tarea de generacion realista.

## Limitaciones y advertencias

- Contexto de 2 tokens: no puede mantener coherencia mas alla de un par de palabras ni gestionar conversaciones multi-turno.
- Vocabulario de 135 palabras: cualquier termino fuera de ese conjunto no puede generarse.
- Cero capacidad aritmetica o de razonamiento (0,0% en GSM8K).
- Riesgo de alucinacion estructural: el muestreo por recuentos puede producir secuencias gramaticalmente validas pero sin sentido.
- Sesgos: al entrenarse con 489 tokens, incluidos textos autogenerados (44,4%), el modelo amplifica los patrones y posibles sesgos de un corpus minimo y no representativo.
- Solo ingles.
- Licencia CC0-1.0: sin restricciones para uso comercial, pero el autor declara como uso previsto "ninguno" y como fuera de alcance "todo lo demas".
- Es una parodia: BRAIAIN Laboratories se declara explicitamente no afiliado a ninguna empresa real de IA; no debe presentarse como un modelo de produccion.
- Resultados de benchmarks autodeclarados y no verificados; el propio autor reconoce que la metrica favorable en TruthfulQA es un artefacto del metodo de puntuacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/braiain-lab/brAIAIn-3
- Demo en Spaces: https://huggingface.co/spaces/braiain-lab/brAIAIn
- Version mas reciente: https://huggingface.co/braiain-lab/brAIAIn-0
- Coleccion de versiones: https://huggingface.co/braiain-lab
- Sitio del laboratorio: https://www.braiain.com
- Benchmarks: https://www.braiain.com/benchmarks.html
- Informe tecnico: https://www.braiain.com/paper.html?v=7
- Notas de version y datos de entrenamiento: https://www.braiain.com/models.html
- DOI del informe: https://doi.org/10.5281/zenodo.23863739
