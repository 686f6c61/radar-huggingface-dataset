# mradermacher/Apex-2-Base-i1-GGUF

## Resumen

Apex-2-Base-i1-GGUF es el paquete de cuantizaciones en formato GGUF del modelo YOON1v/Apex-2-Base, publicado por el usuario mradermacher, conocido por producir versiones cuantizadas de modelos abiertos. El modelo original es un transformer con mezcla de expertos (MoE) de tipo base, entrenado desde cero y sometido posteriormente a entrenamiento continuado, con etiqueta de arquitectura qwen3_moe en el repositorio. Cuenta con 3.869.124.608 parametros totales (aproximadamente 3,87 mil millones) segun los pesos en safetensors del modelo base, y esta publicado bajo licencia Apache 2.0.

Su relevancia practica radica en que pone al alcance de hardware de consumo un modelo MoE de menos de 4.000 millones de parametros, con cuantizaciones que van desde 1,1 GB (i1-IQ1_S) hasta 3,3 GB (i1-Q6_K). El repositorio incluye ademas cuantizaciones calculadas con matriz de importancia (imatrix), lo que mejora la relacion tamano/calidad frente a las cuantizaciones estaticas del mismo autor. Es un modelo exclusivamente en ingles y de tipo base, es decir, sin ajuste por instrucciones.

Al tratarse de una cuantizacion y no de un modelo nuevo, la ficha describe tanto el artefacto GGUF como el modelo subyacente. La model card no incluye detalles sobre longitud de contexto, numero de parametros activos ni resultados de evaluacion, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); etiqueta de arquitectura qwen3_moe |
| Parametros totales | 3.869.124.608 (aprox. 3,87 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; tambien se listan variantes estaticas Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base esta en safetensors |
| Tamano del repositorio | 45,6 GB (incluye todas las cuantizaciones y el fichero imatrix) |
| Modelo base | YOON1v/Apex-2-Base |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) etiquetado como qwen3_moe, entrenado desde cero (from-scratch) y posteriormente sometido a entrenamiento continuado (continued-pretraining). La model card no especifica el numero de expertos, la dimensionalidad del modelo, el numero de capas ni cuantos parametros se activan por token, por lo que la topologia interna del MoE no puede detallarse con la informacion disponible. Tampoco se indica la longitud de contexto soportada ni el numero total de tokens vistos durante el preentrenamiento.

En cuanto a los datos, la model card declara el uso de un conjunto amplio de corpus: HuggingFaceFW/fineweb-edu, mlfoundations/dclm-baseline-1.0-parquet, HuggingFaceFW/finepdfs, bigcode/starcoderdata, OpenCoder-LLM/opc-fineweb-code-corpus, OpenCoder-LLM/opc-annealing-corpus, allenai/dolma3_dolmino_mix-100B-1125, HuggingFaceTB/finemath, nvidia/Nemotron-CC-Math-v1, HuggingFaceTB/smollm-corpus, allenai/peS2o, allenai/dolmino-mix-1124, wikimedia/wikipedia y sedthh/gutenberg_english. La mezcla combina texto web filtrado por calidad, documentos PDF, codigo, matematicas, literatura cientifica y texto de dominio publico, con un peso notable de fuentes orientadas a codigo y matematicas. No hay constancia de ajuste por instrucciones, RLHF ni DPO: se trata de un modelo base, no de un modelo alineado. La innovacion tecnica del repositorio esta en el proceso de cuantizacion: las variantes i1 emplean una matriz de importancia (imatrix) generada a partir de la calibracion, lo que permite reducir el tamano manteniendo mejor la perplejidad que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion y continuacion de texto en ingles sin ajuste por instrucciones, al ser un modelo base.
- Generacion de codigo: los corpus de entrenamiento incluyen starcoderdata, opc-fineweb-code-corpus y opc-annealing-corpus, por lo que la model card sugiere capacidad en tareas de programacion tras el preentrenamiento.
- Razonamiento matematico: la mezcla incluye finemath y Nemotron-CC-Math-v1, orientados a contenido matematico.
- Modelado de lenguaje general: utilizable para completado, puntuacion de secuencias y calculo de perplejidad.
- Capacidad como modelo de partida para fine-tuning supervisado (SFT), ajuste por preferencias o entrenamiento continuado adicional.
- Soporte de tool calling / function calling: no disponible; al ser un modelo base no incorpora plantilla de herramientas ni comportamiento agentico de serie.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Distribucion en 24 variantes de cuantizacion GGUF mas el fichero imatrix para generar cuantizaciones propias.

## Casos de uso

- Punto de partida para fine-tuning de dominio: al ser un modelo base de 3,87 mil millones de parametros con licencia Apache 2.0, se puede ajustar con SFT o LoRA sobre datos propios en una unica GPU de gama media, algo inviable con modelos base de mayor tamano.
- Generacion de datos sinteticos y destilacion: un modelo base se presta a producir grandes volumenes de texto y codigo que despues se filtran y se usan para entrenar modelos mas pequenos; su tamano permite ejecutarlo en paralelo en varias GPU de consumo.
- Autocompletado de codigo en local: integrado en llama.cpp u Ollama, un modelo de 3,87 mil millones de parametros cuantizado a Q4_K_M ocupa 2,5 GB y puede servir sugerencias de codigo sin conexion, sin enviar codigo a terceros.
- Investigacion academica sobre arquitecturas MoE: permite estudiar enrutamiento de expertos, balanceo de carga y eficiencia de inferencia en un modelo MoE pequeno y accesible, sin necesidad de un clúster de GPU de gama alta.
- Procesamiento por lotes en CPU: las cuantizaciones Q4_K_S y Q4_K_M permiten ejecutar el modelo en un servidor sin GPU para tareas de completado, anotacion o generacion de borradores a bajo coste.
- Analisis de documentos cientificos y tecnicos en ingles: el entrenamiento incluye peS2o y finepdfs, por lo que el modelo puede emplearse para tareas de representacion y analisis de literatura cientifica, siempre que se ajuste o se plantee como modelado de lenguaje y no como asistente.
- Evaluacion de tecnicas de cuantizacion: la publicacion incluye el fichero imatrix, lo que permite reproducir el proceso de cuantizacion ponderada y medir el impacto en perplejidad de cada variante.
- Prototipado en dispositivos con poca memoria: las variantes IQ1_S, IQ1_M, IQ2_XS y IQ2_S, de entre 1,1 GB y 1,4 GB, permiten experimentar en equipos con 4 GB de VRAM o menos, aceptando una perdida de calidad notable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K ni de perplejidad por variante de cuantizacion, y tampoco se han encontrado en la busqueda web realizada. Las unicas referencias cualitativas que ofrece el autor son las notas de la tabla de cuantizaciones (por ejemplo, "optimal size/speed/quality" para i1-Q4_K_S o "fast, recommended" para i1-Q4_K_M) y el grafico comparativo de tipos de cuantizacion enlazado en la model card, que no aporta cifras de este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, con overhead adicional de contexto y cache KV):
  - i1-IQ1_S: 1,1 GB
  - i1-IQ2_XS: 1,4 GB
  - i1-IQ2_M: 1,5 GB
  - i1-Q2_K: 1,7 GB
  - i1-IQ3_M: 1,9 GB
  - i1-IQ4_XS: 2,3 GB
  - i1-Q4_K_S: 2,4 GB
  - i1-Q4_K_M: 2,5 GB
  - i1-Q5_K_M: 2,9 GB
  - i1-Q6_K: 3,3 GB
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para las cuantizaciones de 2 a 3 bits; 6-8 GB para las variantes Q5_K_M y Q6_K con contexto amplio. No se requiere A100, H100 ni GPU de centro de datos.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090 y equivalentes, asi como en iGPU recientes con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio, koboldcpp y otras herramientas compatibles con GGUF. El fichero imatrix permite generar cuantizaciones propias con llama.cpp. El soporte de GGUF en vLLM y TGI es limitado o experimental, por lo que para produccion en servidor se recomienda convertir el modelo base en safetensors a un formato soportado.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones de velocidad para este modelo ni para sus cuantizaciones.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada comparativas publicadas frente a otros modelos de la misma categoria. La model card se limita a declarar la etiqueta de arquitectura qwen3_moe y no ofrece tablas de rendimiento frente a alternativas. A continuacion se recoge la comparativa con los datos estrictamente disponibles:

| Criterio | Apex-2-Base (i1-GGUF) | Alternativas comparables |
|---|---|---|
| Parametros | 3,87 mil millones | no disponible |
| Parametros activos | no disponible | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Idiomas | Ingles | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base | no disponible |
| Resultados de benchmarks | no publicados | no disponible |
| Disponibilidad | Repositorio GGUF y repo de cuantizaciones estaticas en HuggingFace | no disponible |

## Limitaciones y advertencias

- Es un modelo base, no un modelo ajustado por instrucciones: no sigue ordenes de forma fiable y no responde bien a formatos conversacionales sin un fine-tuning previo.
- Riesgo de alucinacion: al no haber pasado por alineacion ni por RLHF, tiende a continuar texto de forma plausible sin garantia de veracidad, y no incorpora mecanismos de rechazo.
- Sesgos conocidos: los corpus de entrenamiento son mayoritariamente web y de dominio publico, con los sesgos de representacion, idioma y tematica habituales en fineweb-edu, dclm y wikipedia. No se han publicado evaluaciones de sesgo.
- Limitacion de idioma: soporte unicamente en ingles; el rendimiento en castellano no esta documentado y previsiblemente sera bajo.
- Longitud de contexto desconocida: al no declararse la ventana de contexto, no es posible planificar casos de uso que dependan de contexto largo sin verificarlo experimentalmente con el fichero GGUF de interes.
- Calidad de las cuantizaciones extremas: las variantes IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS y Q2_K conllevan una degradacion notable de la calidad, tal como advierte el propio autor ("for the desperate", "mostly desperate", "very low quality").
- Licencia: Apache 2.0, permisiva y apta para uso comercial, incluidas modificaciones y redistribucion, siempre que se conserve el aviso de licencia y se atribuya la autoria.
- Caveat de produccion: el formato GGUF es idoneo para inferencia local con llama.cpp y derivados, pero no para servidores de alto rendimiento basados en vLLM o TGI en su configuracion habitual; para produccion conviene partir del modelo base en safetensors.
- Ausencia de datos de evaluacion: sin benchmarks ni mediciones de throughput publicadas, cualquier decision de despliegue requiere una validacion propia con el conjunto de datos del caso de uso.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/Apex-2-Base-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Apex-2-Base-GGUF
- Modelo base original: https://huggingface.co/YOON1v/Apex-2-Base
- Pagina de resumen del cuantizador para este modelo: https://hf.tst.eu/model#Apex-2-Base-i1-GGUF
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Listado de modelos del autor: https://huggingface.co/mradermacher/models
- Guia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/
