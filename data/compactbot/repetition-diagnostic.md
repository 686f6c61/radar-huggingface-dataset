# Compactbot/repetition-diagnostic

## Resumen

Repetition Diagnostic no es un modelo de lenguaje entrenado, sino una herramienta de linea de comandos publicada por el usuario Compactbot en HuggingFace. Se trata de un script Python (`repetition_diagnostic.py`) pensado para desarrolladores que entrenan modelos de lenguaje muy pequenos (por debajo de 50M de parametros) y necesitan detectar y mitigar bucles de repeticion degenerativos en la generacion.

El problema que aborda es concreto: los modelos diminutos tienden a repetir el mismo token o la misma secuencia indefinidamente, y el valor por defecto `repetition_penalty=1.0` en la mayoria de frameworks no aplica penalizacion alguna. La herramienta barre distintos valores de ese parametro sobre uno o varios prompts y mide cuatro metricas objetivas (tasa de repeticion, ratio de tokens unicos, longitud maxima de bucle y trigramas repetidos) para ayudar a fijar un valor adecuado en la configuracion de inferencia.

Su relevancia es practica y acotada: cubre el hueco entre el entrenamiento y el despliegue, donde muchos pipelines no evaluan la calidad de generacion. No aporta pesos, no tiene arquitectura de red propia y funciona con cualquier modelo que pueda cargarse mediante `AutoModelForCausalLM` de HuggingFace Transformers. No se especifica autoría institucional, licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es una red neuronal; es un script de diagnostico en Python que envuelve modelos cargados con `AutoModelForCausalLM`) |
| Parametros totales | no aplica (no dispone de pesos propios) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo que se diagnostique) |
| Tipos de cuantizacion | no disponible (depende del modelo objetivo; la herramienta no aplica cuantizacion propia) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no publica pesos; es codigo Python que carga modelos de terceros) |

## Arquitectura y entrenamiento

No existe arquitectura de red ni proceso de entrenamiento asociado a este repositorio. El componente tecnicamente relevante es la logica del script: en lugar de usar `model.generate()`, realiza la generacion de forma manual para aplicar el `repetition_penalty` exactamente como se especifica, sin interferir con la logica interna de HuggingFace. Utiliza la misma semilla para todos los valores de penalizacion, de modo que la comparacion sea justa (mismas extracciones aleatorias, distinta penalizacion). Es compatible con cualquier modelo cargable por `AutoModelForCausalLM`.

Las metricas que calcula son: tasa de repeticion (fraccion de tokens de salida que ya aparecieron antes en la secuencia), ratio de tokens unicos (tokens unicos dividido por tokens totales, como medida de diversidad), longitud maxima de bucle (n-grama repetido mas largo) y numero de trigramas repetidos (secuencias de 3 tokens que aparecen dos o mas veces). Requiere Python 3.8 o superior, `torch` y `transformers`.

## Capacidades

- Barrido de valores de `repetition_penalty` sobre un unico prompt o sobre varios prompts separados por `|`.
- Rango de penalizaciones configurable mediante el argumento `--penalties` (por ejemplo `"1.0,1.05,1.1,1.2,1.5"`).
- Calculo de cuatro metricas de degeneracion: tasa de repeticion, ratio de tokens unicos, longitud maxima de bucle y trigramas repetidos.
- Exportacion de resultados a JSON mediante `--output results.json` para su analisis posterior.
- Interpretacion guiada de resultados: distingue entre modelos que solo necesitan un ajuste leve (rp=1.1 o 1.2), modelos robustos sin repeticion con rp=1.0 y modelos severamente infraentrenados o con modos degenerados que ninguna penalizacion corrige.
- Compatibilidad con cualquier modelo que `AutoModelForCausalLM` pueda cargar.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento extendido, ya que no es un modelo generativo sino una utilidad de evaluacion.

## Casos de uso

- Diagnostico de bucles en modelos pequenos: durante el desarrollo de un modelo de menos de 50M de parametros, se ejecuta el script sobre prompts representativos para cuantificar la tasa de repeticion antes de dar por bueno un checkpoint.
- Calibrado de `repetition_penalty` en produccion: el barrido permite localizar el valor donde la calidad se estabiliza (por ejemplo rp=1.1) y fijarlo en la configuracion de inferencia en lugar de dejar el defecto rp=1.0.
- Comparacion de checkpoints o ejecuciones de entrenamiento: al aplicar la misma semilla y los mismos prompts, los resultados son reproducibles y permiten decidir si un checkpoint nuevo es menos degenerativo que el anterior.
- Control de calidad previo al despliegue: se integra en un script de evaluacion que valide que el modelo no entra en bucles antes de publicarlo o servirlo.
- Investigacion sobre decodificacion y diversidad: las metricas de ratio de tokens unicos y trigramas repetidos permiten estudiar el efecto de distintas estrategias de penalizacion sobre la diversidad del texto.
- Deteccion de modos degenerados no recuperables: cuando incluso con rp=2.0 persisten los bucles, la herramienta senala que el problema esta en el entrenamiento o en un modo degenerado del modelo, y no en la decodificacion.
- Batería de prompts para evaluacion continua: el modo `--prompts` permite lanzar varios prompts en una sola ejecucion y guardar los resultados en JSON para comparar entre versiones del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente una salida de ejemplo con el modelo `gpt2` para ilustrar el formato del informe, no como benchmark del modelo en si:

| Prompt | Penalizacion | Tokens | Repet. | Unicos | MaxLoop | RepTri |
|---|---|---|---|---|---|---|
| Once upon a time | 1.0 | 48 | 25.5% | 72.9% | 3 | 1 |
| Once upon a time | 1.1 | 48 | 0.0% | 100.0% | 0 | 0 |
| Once upon a time | 1.2 | 48 | 0.0% | 100.0% | 0 | 0 |
| Once upon a time | 1.5 | 48 | 0.0% | 100.0% | 0 | 0 |
| Once upon a time | 2.0 | 48 | 0.0% | 100.0% | 0 | 0 |

Estos valores proceden de la salida de ejemplo de la model card y deben interpretarse como ilustracion del formato, no como una evaluacion reproducible del modelo `gpt2` ni de la herramienta.

## Requisitos de hardware

- La herramienta en si no requiere GPU; es un script Python que depende de `torch` y `transformers`.
- Los requisitos de VRAM vienen determinados por el modelo que se vaya a diagnosticar, no por la herramienta. Para modelos de menos de 50M de parametros, la inferencia cabe en CPU y en cualquier GPU consumer, e incluso en entornos sin acelerador.
- GPU recomendadas: no aplica para la herramienta; para el modelo objetivo, cualquier GPU con suficiente memoria para cargarlo. No se proporcionan datos especificos de A100, H100 o RTX 4090 en la informacion disponible.
- Opciones de despliegue: al ser un script de linea de comandos, se ejecuta directamente con Python. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Dependen del modelo diagnosticado, del numero de prompts y del rango de penalizaciones configurado.
- Dependencias: Python 3.8 o superior, `torch` y `transformers` (`pip install torch transformers`).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye herramientas comparables de diagnostico de repeticion, ni datos de parametros, contexto, rendimiento o licencia de alternativas. Los resultados de busqueda web recibidos tratan sobre el importador DAZ de Diffeomorphic y sobre topologia diferencial, y no guardan relacion con este repositorio, por lo que no aportan terminos de comparacion validos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera contenido por si mismo ni puede usarse como sustituto de un modelo entrenado.
- La licencia no esta especificada, por lo que no puede confirmarse que su uso comercial este permitido. Conviene contactar con el autor antes de integrarla en un producto.
- Los idiomas soportados no estan declarados; los ejemplos de la model card estan en ingles y podrian no ser representativos para otros idiomas.
- La metrica de repeticion depende de los prompts elegidos: un resultado limpio en un prompt concreto no garantiza que el modelo sea robusto en general.
- La interpretacion de resultados es heuristica (los umbrales rp=1.1, rp=1.2, rp=2.0 son orientativos) y no constituye una garantia de calidad.
- El repositorio no registra descargas (0 descargas, 1 like) y su model card no incluye versionado, changelog ni pruebas automatizadas, lo que reduce la trazabilidad y el mantenimiento esperado.
- Al aplicar la penalizacion de forma manual en lugar de usar `model.generate()`, los resultados pueden no coincidir exactamente con el comportamiento de otras librerias de inferencia.
- No se documentan sesgos, riesgos de alucinacion ni limites de contexto propios, ya que la herramienta no produce texto de forma autonoma.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Compactbot/repetition-diagnostic
- No se han encontrado enlaces relevantes adicionales (papers, blogs, repositorios o demos) en la busqueda web proporcionada.
