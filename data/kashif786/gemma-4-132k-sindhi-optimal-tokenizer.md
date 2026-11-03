# Kashif786/gemma-4-132k-sindhi-optimal-tokenizer

## Resumen

Gemma 4 – Sindhi Optimal Tokenizer (132K) es un tokenizador extendido para la arquitectura Gemma 4 de Google, desarrollado por Kashif Ali Turk (usuario `Kashif786`). No se trata de un modelo de lenguaje completo, sino de un componente de tokenizacion: parte del tokenizador podado de Gemma 4 con un vocabulario base de 131.072 tokens y anade 1.536 tokens nuevos hasta alcanzar 132.608 entradas, orientados especificamente a mejorar la representacion del sindhi, una lengua de bajos recursos.

El problema que aborda es la fragmentacion de subpalabras en sindhi: un unico termino sindhi suele dividirse en varios tokens, lo que alarga las secuencias e incrementa el coste computacional en entrenamiento e inferencia. El autor aplica extension de vocabulario BPE con analisis de frecuencia de corpus y estudio del arbol de fusiones, imponiendo restricciones para preservar el comportamiento del urdu, el arabe y el ingles.

Su relevancia actual es acotada pero concreta: facilita futuros experimentos de preentrenamiento continuado y ajuste por instrucciones en sindhi sobre la familia Gemma 4, sin romper la tokenizacion multilingue existente. La licencia declarada es Apache 2.0, aunque el autor senala que el uso queda sujeto a los terminos de licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE (extension de vocabulario) para Gemma 4 E2B / E4B; no es un modelo de lenguaje |
| Parametros totales | no disponible (componente de tokenizacion, sin pesos de red) |
| Parametros activos | no disponible (no aplica; no es MoE) |
| Longitud de contexto | no disponible (el tokenizador no define contexto; depende del modelo Gemma 4 asociado) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizador) |
| Idiomas soportados | sd (sindhi, objetivo), ur (urdu), ar (arabe), en (ingles) |
| Licencia | Apache 2.0 (sujeta a los terminos del modelo base) |
| Formato de pesos | no disponible (artefactos de tokenizador de Hugging Face: tokenizer.json / tokenizer_config.json, no confirmado en la informacion) |

## Arquitectura y entrenamiento

El componente es un tokenizador BPE derivado del tokenizador podado de Gemma 4, con compatibilidad declarada con las configuraciones de tokenizador de Gemma 4 E2B y E4B. El vocabulario base de 131.072 tokens se extiende con exactamente 1.536 tokens nuevos, hasta 132.608. El tamano final es divisible por 128 (132.608 = 1.036 x 128), lo que ofrece alineacion de dimensiones para implementaciones que se beneficien de dicho relleno; el autor aclara que esto no implica por si mismo mejoras de rendimiento en hardware.

La seleccion de tokens se realizo mediante analisis de frecuencia de corpus e investigacion del arbol de fusiones BPE, prestando atencion a caracteres exclusivos del sindhi dentro del alfabeto perso-arabe (por ejemplo ٻ، ڄ، ڏ، ڳ، ٺ، ڦ، ڇ، ڃ، ڱ، ڻ، ڌ، ڍ، ڙ، ڪ، ڀ). La estrategia de filtrado combino restricciones sobre caracteres Unicode exclusivos del sindhi, analisis de combinaciones ortograficas, cierre de cadenas padre en el arbol BPE para dependencias de fusion validas y pruebas de regresion entre idiomas. No se documentan datos sobre volumen de entrenamiento neuronal, RLHF ni DPO, porque no se trata de un modelo neuronal entrenado.

## Capacidades

- Tokenizacion optimizada de texto en sindhi con menor fragmentacion de subpalabras que el tokenizador base.
- Compresion de texto: reduccion del 23,97 % en el numero total de tokens sobre el corpus evaluado.
- Preservacion de la tokenizacion en urdu, arabe e ingles en las pruebas de control realizadas.
- Compatibilidad con la arquitectura de tokenizador de Gemma 4 (E2B / E4B).
- Integracion directa con `transformers` mediante `AutoTokenizer`.
- Base para preentrenamiento continuado y ajuste por instrucciones en sindhi.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente: es un componente de preprocesamiento.

## Casos de uso

- Preentrenamiento continuado en sindhi: usar el tokenizador extendido para reducir la longitud de secuencia del corpus sindhi y, con ello, el coste computacional de los experimentos sobre Gemma 4.
- Ajuste por instrucciones en sindhi: emplear el tokenizador para construir datasets de instrucciones con menos tokens por ejemplo, mejorando la eficiencia por paso de entrenamiento.
- Evaluacion de eficiencia de tokenizacion: comparar el recuento de tokens del tokenizador base frente al extendido sobre corpus propios de sindhi para medir la ganancia real antes de comprometer recursos de entrenamiento.
- Investigacion en lenguas de bajos recursos: reutilizar la metodologia (analisis de frecuencia, arbol de fusiones BPE, restricciones Unicode y pruebas de regresion) para otras lenguas perso-arabes.
- Desarrollo de pipelines NLP en sindhi: integrar el tokenizador en flujos de clasificacion, etiquetado o recuperacion donde la longitud de secuencia afecte a la latencia.
- Analisis de preservacion multilingue: validar que la extension no altera la tokenizacion de urdu, arabe o ingles en aplicaciones multilingues existentes.
- Prototipado de asistentes en sindhi: servir de base para experimentos de modelos conversacionales en sindhi sobre la familia Gemma 4, una vez realizado el ajuste correspondiente.

## Benchmarks y rendimiento

Evaluacion del tokenizador sobre 19.208 lineas limpias de Wikipedia en sindhi del corpus `Kashif786/Sindhi-Wikipedia-Clean-CPT-2026`, comparando el tokenizador base podado (131.072) con el extendido (132.608).

| Metrica | Base (131K) | Extendido (132K) |
|---|---:|---:|
| Tokens del corpus | 23.031.496 | 17.509.730 |
| Tamano de vocabulario | 131.072 | 132.608 |
| Activacion de tokens nuevos | 0 % | 22,44 % |
| Reduccion de longitud de secuencia | linea base | 23,97 % |

Evaluacion a nivel de frase:

| Ejemplo | Base | Extendido | Reduccion |
|---|---:|---:|---:|
| Sindhi – texto historico | 20 | 12 | 40,0 % |
| Sindhi – tecnologia de IA | 32 | 21 | 34,4 % |

Preservacion entre idiomas (pruebas de control):

| Idioma | Base | Extendido | Cambio |
|---|---:|---:|---:|
| Urdu | 21 | 21 | 0 % |
| Arabe | 26 | 26 | 0 % |
| Ingles | 19 | 19 | 0 % |

Conclusiones declaradas por el autor: 5.521.766 tokens menos en el corpus evaluado y una tasa de activacion de tokens nuevos del 22,44 %. No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el artefacto no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; un tokenizador no requiere memoria de GPU para funcionar. El consumo depende del modelo Gemma 4 sobre el que se use (E2B o E4B), cuyos requisitos no se detallan en la informacion disponible.
- GPU recomendadas: no disponible; depende del modelo base asociado.
- Compatibilidad con GPU de consumo: no aplica al tokenizador; el modelo Gemma 4 asociado determinaria si cabe en GPUs de consumo, dato no disponible.
- Opciones de despliegue: carga mediante `transformers` (`AutoTokenizer`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este componente.
- Latencia y throughput: no disponibles. La reduccion del 23,97 % en el numero de tokens puede traducirse en menor coste de secuencia, pero el autor no establece mejoras de rendimiento en hardware.

## Comparativa con modelos similares

| Componente | Tipo | Vocabulario | Idiomas objetivo | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Gemma 4 – Sindhi Optimal Tokenizer (132K) | Tokenizador BPE extendido | 132.608 | sd, ur, ar, en | Apache 2.0 (sujeta al modelo base) | Hugging Face, 0 descargas |
| Tokenizador base podado de Gemma 4 | Tokenizador BPE | 131.072 | multilingue (incluye sd) | segun Gemma 4 | Hugging Face |
| Tokenizador original de Gemma 4 | Tokenizador BPE | no disponible en la informacion | multilingue | segun Gemma 4 | Hugging Face |

No se dispone de datos sobre otros tokenizadores extendidos para sindhi ni sobre comparaciones con alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona; solo transforma texto en tokens.
- Los resultados de preservacion multilingue se limitan a los ejemplos de control evaluados; el autor advierte que no establecen equivalencia universal en todos los textos posibles.
- La evaluacion se realizo sobre un unico corpus (Wikipedia en sindhi, 19.208 lineas), por lo que la ganancia del 23,97 % puede no generalizarse a otros dominios.
- El repositorio registra 0 descargas y 0 likes, sin validacion externa conocida.
- La licencia declarada es Apache 2.0, pero el autor indica que el uso esta sujeto a los terminos de licencia del modelo base Gemma 4; conviene verificar las condiciones de uso comercial de dicho modelo base.
- No se documentan sesgos especificos, pero al derivar de un tokenizador base multilingue puede heredar sesgos de representacion del corpus original.
- Riesgo de alucinacion: no aplica directamente al tokenizador; dependera del modelo Gemma 4 ajustado sobre el.
- El ejemplo de uso de la model card referencia el repositorio `Kashif786/gemma-4-sindhi-optimal-tokenizer-132k`, que no coincide exactamente con el ID publicado (`Kashif786/gemma-4-132k-sindhi-optimal-tokenizer`); conviene usar el ID real al cargar el tokenizador.
- El tamano del repositorio es de 0,0 GB, coherente con artefactos de tokenizador, pero no se confirma el formato exacto de los ficheros incluidos.

## Enlaces

- Hugging Face: https://huggingface.co/Kashif786/gemma-4-132k-sindhi-optimal-tokenizer
- Corpus de evaluacion: `Kashif786/Sindhi-Wikipedia-Clean-CPT-2026` (referenciado en la model card; sin URL directa en la informacion disponible)
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales.
