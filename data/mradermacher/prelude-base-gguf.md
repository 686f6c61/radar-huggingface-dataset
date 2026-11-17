# mradermacher/prelude-base-GGUF

## Resumen

Prelude-base es un modelo de lenguaje de tipo base (sin ajuste por instrucciones ni alineamiento posterior) desarrollado por OpenEuroLLM, un consorcio europeo orientado a la construccion de modelos fundacionales abiertos. Esta ficha documenta la version cuantizada en formato GGUF publicada por mradermacher, que facilita su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo cuenta con 9.094.607.872 parametros totales (aproximadamente 9,1 mil millones) y esta liberado bajo licencia Apache 2.0.

La relevancia de este modelo reside en su cobertura linguistica: declara soporte para 42 idiomas, con un enfasis claro en lenguas europeas, incluyendo idiomas de bajos recursos como el lituano, el letrado, el alsaciano, el friulano o el gaélico. Esta amplitud lo posiciona como una alternativa interesante para aplicaciones multilingues en el contexto europeo, donde la mayoria de los modelos abiertos concentran su capacidad en ingles y un puñado de idiomas mayoritarios.

Al tratarse de un modelo base, no incorpora un modo de conversacion ni sigue instrucciones de forma nativa; su uso previsto es como punto de partida para ajuste fino (fine-tuning) o para tareas de continuacion de texto y modelado del lenguaje. La version GGUF aqui descrita incluye cuantizaciones estaticas Q2_K y Q4_K_S, lo que reduce los requisitos de memoria frente a los pesos originales en precision completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 9.094.607.872 (~9,1 B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_S (estaticas); el autor indica que las cuantizaciones ponderadas/imatrix no estan disponibles por el momento |
| Idiomas soportados | 42 idiomas: en, es, ka, fr, de, pt, it, pl, el, nl, tr, ro, hu, uk, cs, sv, bg, fi, ca, hr, sk, da, lt, bs, sl, nb, sr, sq, lv, lvs, mk, is, mt, gl, eu, ekk, et, ga, als, nn, ltg |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo transformer distribuido a traves de la libreria transformers. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni la longitud de contexto nativa. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otros metodos de alineamiento; el caracter "base" del modelo sugiere que no se realizo ajuste por instrucciones.

El unico dato tecnico relevante aportado por la model card de la version cuantizada es el proceso de cuantizacion: se generaron cuantizaciones estaticas (Q2_K y Q4_K_S) mediante conversion desde el formato Hugging Face, con un esquema de cuantizacion de version 2 y cuantizacion de tensores de salida activada. El autor senala que las cuantizaciones ponderadas o basadas en matriz de importancia (imatrix) no estan disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto y modelado del lenguaje: al ser un modelo base, su funcion principal es la prediccion del siguiente token y la continuacion de texto.
- Cobertura multilingue amplia: 42 idiomas declarados, con especial atencion a lenguas europeas y varias de bajos recursos.
- Punto de partida para ajuste fino: adecuado para entrenamiento supervisado, DPO u otras tecnicas sobre tareas especificas.
- No dispone de modo de conversacion ni de seguimiento de instrucciones de forma nativa (no es un modelo instruct).
- Soporte de tool calling / function calling: no disponible de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades de vision o audio: no disponibles.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Ajuste fino para tareas especificas en idiomas europeos minoritarios: el modelo puede servir como base para entrenar clasificadores, generadores o asistentes en lenguas como el lituano, el gaélico o el alsaciano, donde escasean las alternativas abiertas con licencia permisiva.
- Modelado del lenguaje y evaluacion linguistica: util para investigación en perplejidad, analisis de sesgos o estudios comparativos entre lenguas europeas, gracias a su cobertura de 42 idiomas.
- Generacion de texto asistida en dominios verticales: tras un ajuste fino con datos propios (legal, sanitario, administrativo), puede emplearse para redaccion y resumen en el idioma del dominio.
- Prototipado de aplicaciones multilingues: la cuantizacion Q4_K_S (5,5 GB) permite desplegar el modelo en estaciones de trabajo con GPU de consumo para pruebas de concepto antes de escalar.
- Investigacion sobre alineamiento y seguridad: al ser un modelo base sin alinear, es un sujeto de estudio adecuado para analizar comportamientos emergentes y sesgos antes de aplicar tecnicas de alineamiento.
- Educacion e investigacion academica: su licencia Apache 2.0 y su tamano moderado lo hacen accesible para laboratorios con recursos limitados que quieran experimentar con modelos fundacionales europeos.
- Traduccion automatica experimental: la amplitud linguistica permite explorar pares de traduccion entre lenguas europeas, aunque requeriria ajuste fino especifico para obtener calidad competitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,9 GB con la cuantizacion Q2_K y 5,5 GB con Q4_K_S, segun los tamanos de fichero indicados por el autor. A estos valores hay que sumar la memoria para el contexto y el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para Q4_K_S; para Q2_K basta con 4-6 GB. En el extremo alto, una RTX 4090 o A100 ofrecerian un throughput muy superior, aunque no son necesarias para ejecutar el modelo.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 o superiores. Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. Para los pesos originales en transformers, vLLM o TGI serian las opciones habituales, aunque no se confirma compatibilidad explicita.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Prelude-base (esta ficha) | ~9,1 B | no disponible | 42 | Apache 2.0 | GGUF, safetensors |
| Gemma 2 9B | ~9,2 B | 8.192 tokens | principalmente ingles y multilingue limitado | Gemma license | safetensors, GGUF |
| Mistral 7B | ~7,2 B | 32.768 tokens | principalmente ingles | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B | ~8,0 B | 131.072 tokens | 8 idiomas oficiales | Llama 3.1 license | safetensors, GGUF |

La comparativa se basa en caracteristicas publicas conocidas de estos modelos; no se dispone de datos de rendimiento comparativo para Prelude-base. La principal ventaja diferencial de Prelude-base es su cobertura de 42 idiomas frente a los 8 de Llama 3.1 o el enfoque casi exclusivamente ingles de Mistral 7B, junto con una licencia Apache 2.0 plenamente permisiva.

## Limitaciones y advertencias

- Al ser un modelo base, no sigue instrucciones ni mantiene conversaciones de forma fiable; requiere ajuste fino o tecnicas de prompting especificas para tareas concretas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido plausible pero falso, especialmente en idiomas de bajos recursos donde los datos de entrenamiento son escasos.
- Sesgos conocidos: no se documentan en la informacion disponible, pero la composicion del corpus de entrenamiento (no publicada) puede introducir sesgos linguisticos y culturales.
- Cobertura desigual entre idiomas: aunque se declaran 42 idiomas, la calidad variara significativamente entre lenguas mayoritarias (ingles, frances, aleman) y lenguas de bajos recursos (letrado, alsaciano, friulano).
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que dificulta planificar aplicaciones que requieran ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario debe verificar el cumplimiento de las licencias de las dependencias y del modelo base original.
- Cuantizaciones limitadas: solo se ofrecen Q2_K y Q4_K_S; la Q2_K puede degradar notablemente la calidad, y no hay cuantizaciones imatrix disponibles.
- Caveat para produccion: la ausencia de benchmarks publicados y de documentacion sobre el entrenamiento dificulta evaluar su idoneidad frente a alternativas consolidadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/prelude-base-GGUF
- Modelo base original: https://huggingface.co/openeurollm/prelude-base
- Pagina de descargas del autor: https://hf.tst.eu/model#prelude-base-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
