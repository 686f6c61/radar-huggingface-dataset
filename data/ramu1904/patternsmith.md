# Ramu1904/PatternSmith

## Resumen

PatternSmith es un modelo de lenguaje decoder-only de tipo GPT, desarrollado por el usuario Ramu1904, cuyo objetivo es convertir descripciones en lenguaje natural a expresiones regulares (regex). Se trata de un proyecto de portafolio, no de un sistema listo para produccion, y su proposito es la investigacion y experimentacion en la tarea de generacion de regex a partir de texto.

El modelo es extremadamente pequeno: 7.242.624 parametros, 4 bloques transformer, 4 cabezas de atencion, dimension de embedding de 128 y dimension feed-forward de 512. Utiliza el tokenizador BPE de GPT-2 (tiktoken) con un vocabulario de 50.257 tokens y una longitud de contexto de solo 128 tokens. Los pesos se inicializaron de forma aleatoria y se entrenaron mediante prediccion supervisada del siguiente token.

Su relevancia es limitada pero ilustrativa: demuestra que un transformer diminuto puede aprender una tarea estructurada y acotada como la traduccion de lenguaje natural a regex, alcanzando un 37,14% de coincidencia exacta y un 96,96% de compilacion correcta en Python sobre el conjunto de test. Es util como referencia educativa y como punto de partida para experimentos con modelos especializados de bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT |
| Parametros totales | 7.242.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

PatternSmith es un transformer decoder-only de estilo GPT con 4 bloques, 4 cabezas de atencion, dimension de embedding de 128 y dimension feed-forward de 512. Emplea el tokenizador BPE de GPT-2 mediante `tiktoken`, con un vocabulario de 50.257 tokens. El modelo se inicializo con pesos aleatorios (sin preentrenamiento previo) y se entreno con prediccion supervisada del siguiente token sobre pares descripcion-regex.

El conjunto de entrenamiento es NL-RX-Turk, limpiado y dividido en 6.245 ejemplos de entrenamiento, 961 de validacion y 2.402 de test. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales. La innovacion tecnica es practicamente inexistente: se trata de un entrenamiento supervisado convencional sobre una tarea acotada, sin decodificacion especulativa, atencion lineal ni mecanismos destacables.

## Capacidades

- Generacion de expresiones regulares a partir de descripciones en lenguaje natural.
- Generacion de texto autoregresiva basica (pipeline `text-generation`).
- Traduccion de instrucciones cortas a patrones regex en el dominio del dataset NL-RX-Turk.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; los idiomas soportados figuran como no disponibles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Experimentacion academica en traduccion de lenguaje natural a regex: el modelo sirve como banco de pruebas para estudiar como un transformer diminuto aprende mapeos estructurados, con un conjunto de validacion y test bien definido (961 y 2.402 ejemplos).
- Generacion asistida de patrones regex en entornos de prototipado: dado que el 96,96% de las salidas compilan en Python, puede usarse para sugerir patrones que el desarrollador revise y ajuste manualmente.
- Educacion y demostracion de arquitecturas transformer: con solo 7,2M de parametros y 4 bloques, es viable ejecutarlo en CPU y usarlo para explicar el funcionamiento de un decoder-only en clases o talleres.
- Generacion de candidatos para validacion por test: el modelo puede producir varias regex para una descripcion y filtrarlas contra casos de prueba representativos, aprovechando su alta tasa de compilacion aunque su coincidencia exacta sea del 37,14%.
- Investigacion sobre metricas de equivalencia semantica: su 55,54% de equivalencia semantica (evaluada con regexbench BRICS FULLMATCH) lo convierte en un caso de estudio para comparar metricas de coincidencia exacta frente a equivalencia funcional.
- Prototipado de pipelines de extraccion de datos: en tareas acotadas y con descripciones simples, puede generar patrones iniciales para extraccion de campos, siempre con validacion humana posterior.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---:|
| Mejor perdida de validacion | 0,2044 |
| Perplejidad de validacion | 1,2268 |
| Coincidencia exacta en test | 37,14% |
| Equivalencia semantica | 55,54% |
| Compilacion de regex en Python | 96,96% |

La equivalencia semantica se evaluo con regexbench BRICS FULLMATCH. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa, dado que el modelo tiene 7,2M de parametros (aproximadamente 29 MB en fp32 y 14 MB en fp16).
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; el modelo puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna, y en Raspberry Pi.
- Opciones de despliegue: el checkpoint se distribuye como `best.pt` de PyTorch; la implementacion de inferencia esta en el repositorio de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| PatternSmith | 7,2M | 128 | NL a regex | MIT | Hugging Face y GitHub |
| Modelos generalistas tipo GPT-2 small | 124M | 1024 | Texto general | MIT | Hugging Face |
| Modelos especializados en codigo (p. ej. CodeGen pequenos) | desde 350M | 2048 | Codigo | variable | Hugging Face |

No se dispone de datos de benchmarks de PatternSmith frente a alternativas especializadas en generacion de regex en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- La coincidencia exacta es limitada (37,14%), por lo que las regex generadas frecuentemente no coinciden con la referencia.
- Una regex sintacticamente valida no garantiza correccion semantica; el 96,96% de compilacion no implica que el patron haga lo esperado.
- Las predicciones deben validarse contra casos de prueba representativos antes de cualquier uso.
- El modelo puede fallar en descripciones complejas o ambiguas.
- La longitud de contexto es de solo 128 tokens, lo que limita descripciones largas.
- No se documentan sesgos conocidos ni evaluaciones de sesgo.
- Riesgo de alucinacion: al ser un modelo generativo pequeno entrenado desde cero, puede producir patrones plausibles pero incorrectos.
- Licencia MIT: permite uso comercial, pero el autor lo declara explicitamente como proyecto de portafolio y no como sistema listo para produccion.
- Idiomas soportados no disponibles; el dataset NL-RX-Turk sugiere un dominio fundamentalmente en ingles o turco, sin confirmacion.

## Enlaces

- Hugging Face: https://huggingface.co/Ramu1904/PatternSmith
- GitHub: https://github.com/ramu1904/PatternSmith
