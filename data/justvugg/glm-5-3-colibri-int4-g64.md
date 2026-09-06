# Justvugg/GLM-5.3-colibri-int4-g64

## Resumen

Este modelo es una conversión cuantizada del modelo GLM-5.3 de Z.ai, realizada por el usuario Justvugg y empaquetada en el formato de contenedor colibri. Se trata de un modelo de Mixture of Experts (MoE) de aproximadamente 744.000 millones de parámetros, con 256 expertos de los que 8 se activan por token. La conversión almacena los expertos enrutados en int4 con group size 64 y los componentes densos en 8 bits, ocupando 419,3 GB en disco.

Su objetivo principal es ejecutar un modelo de esta clase en máquinas con alrededor de 25 GB de RAM, manteniendo los expertos en disco y leyendo únicamente los que cada token selecciona, lo que permite usar hardware sin GPU. Este modelo no es un checkpoint oficial: los pesos pertenecen a Z.ai y solo se ha cambiado el formato de almacenamiento. Es relevante para desarrolladores e investigadores que necesitan ejecutar un LLM de 744B en entornos con recursos limitados, aunque tiene restricciones de licencia y formatos de ejecución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Mixture of Experts (MoE) |
| Parámetros totales | ~744B |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int4 con group size 64 (expertos enrutados); 8 bits para componentes densos y E/S |
| Idiomas soportados | en, zh |
| Licencia | glm-5.3 (other) |
| Formato de pesos | Colibri (contenedor propietario del motor colibri) |

## Arquitectura y entrenamiento

La arquitectura del modelo base GLM-5.3 es un transformer basado en Mixture of Experts de 78 capas, de las cuales 75 son sparsas, con 256 expertos y 8 activos por token. Según el autor, el modelo base de GLM-5.3 es idéntico al de GLM-5.2; todas las mejoras provienen del post-entrenamiento. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación utilizadas.

La innovación técnica de este repositorio no está en la arquitectura, sino en el método de conversión: se empaqueta el modelo en el contenedor colibri para permitir expert-streaming desde disco. Este formato no es compatible con transformers ni vLLM, y solo funciona con el motor colibri. La conversión se realizó con los parámetros ebits=4, xbits=4, io_bits=8 y group_size=64, y no incluye MTP (Multi-Token Prediction).

## Capacidades

- Generación de texto coherente: verificado por el autor tras la conversión. No se especifican tareas de razonamiento, código o matemáticas.
- Soporte de idiomas: inglés y chino (en, zh), según la ficha de Hugging Face.
- Interfaz de conversación mediante `c/coli chat`, que permite usar el modelo en modo chat una vez cargado.
- No se mencionan capacidades de visión, audio, tool calling, function calling, agentes o multi-step reasoning en la información disponible.
- La conversión no incluye MTP (Multi-Token Prediction), lo que reduce posibles ganancias de velocidad en predicción múltiple.

## Casos de uso

- Experimentación de modelos MoE en entornos sin GPU: investigadores con un servidor de CPU y 25 GB de RAM pueden ejecutar el modelo localmente para estudiar el comportamiento de un MoE de 744B, midiendo el coste de leer expertos desde disco.
- Análisis de texto multilingüe en inglés y chino: aplicación que procesa documentos en ambos idiomas, como expedientes judiciales, contratos financieros o artículos académicos, aprovechando el tamaño de 744B para comprensión de contexto semántico.
- Prototipado de chatbots para entornos con datos sensibles: una empresa que no puede enviar datos a la nube puede desplegar este modelo en local con CPU, siempre que la licencia lo permita.
- Investigación sobre eficiencia de inferencia en MoE: comparar el coste de streaming de expertos frente al modelo completo, para publicar trabajos sobre técnicas de memory efficiency.
- Demostraciones educativas: mostrar a estudiantes de IA cómo un modelo de 744B puede ejecutarse en hardware modesto gracias a la cuantización int4 y el expert-streaming.
- Procesamiento batch de texto con baja exigencia de latencia: tareas de generación asíncrona, como resúmenes de bases de datos de documentos, tolerando la lectura desde disco.
- Evaluación de la calidad de la cuantización: usar este modelo para analizar el impacto de la cuantización int4 con group size 64 en la calidad de salida comparándolo con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que no se realizó una comparación token-exacta con la implementación de referencia.

## Requisitos de hardware

- Espacio en disco: 419,3 GB en 141 shards.
- Memoria RAM: alrededor de 25 GB para ejecutar el modelo en condiciones normales; el RSS total estimado es de unos 13,6 GB con un presupuesto de 18 GB. Los pesos densos residentes ocupan 10,6 GB.
- VRAM: no requiere VRAM; se ejecuta en CPU.
- Consumer GPU: no aplica, porque no usa GPU.
- Despliegue: solo el motor colibri, mediante `c/coli chat` tras compilar con `make -C c colibri`. No es compatible con vLLM, Ollama, llama.cpp ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Hardware requerido | Licencia |
|---|---|---|---|---|
| zai-org/GLM-5.3 (oficial) | ~744B | Transformers | Mucha RAM o GPU | glm-5.3 |
| Justvugg/GLM-5.3-colibri-int4-g64 (este) | ~744B | Colibri | ~25 GB RAM | glm-5.3 |
| Justvugg/GLM-5.3-Flash-colibri-int4-g64 | No disponible | Colibri | No disponible | No disponible |

No se han publicado benchmarks, por lo que no es posible comparar el rendimiento. A nivel arquitectónico, el modelo base GLM-5.3 es idéntico a GLM-5.2, según el autor, con la única diferencia de que GLM-5.3 ha recibido más post-entrenamiento.

## Limitaciones y advertencias

- No es un checkpoint oficial: los pesos son de Z.ai; esta conversión del usuario Justvugg no está respaldada por Z.ai y no se ha validado de forma exhaustiva.
- No es compatible con los principales frameworks: no carga en transformers ni vLLM. Solo funciona con el motor colibri.
- Etiqueta del modelo incorrecta: actualmente el motor colibri lo anuncia como GLM-5.2 744B, porque la configuración es idéntica a la de GLM-5.2. Los pesos son los de GLM-5.3, pero el nombre mostrado es erróneo.
- Licencia glm-5.3: no es una licencia estándar. Debe revisarse antes de cualquier uso comercial; no se indica si el uso comercial es explícitamente permitido.
- Idiomas limitados: solo inglés y chino. El rendimiento en otros idiomas es desconocido.
- Requisitos de disco y RAM: 419,3 GB de espacio libre son necesarios. Una máquina con menos de 25 GB de RAM no podrá ejecutarlo.
- No se ha verificado la equivalencia exacta de salida respecto al modelo original: el autor confirma que genera texto coherente y que la reproducción es byte-idéntica en dos rutas, pero no se ha hecho una comparación token a token con la implementación de referencia.
- Sin datos de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni similares para evaluar su calidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Justvugg/GLM-5.3-colibri-int4-g64
- Repositorio de colibri: https://github.com/JustVugg/colibri
- Modelo base oficial: https://huggingface.co/zai-org/GLM-5.3
- Conversión relacionada (Flash): https://huggingface.co/Justvugg/GLM-5.3-Flash-colibri-int4-g64
