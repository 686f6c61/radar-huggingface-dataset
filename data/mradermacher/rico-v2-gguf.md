# mradermacher/RICO-v2-GGUF

## Resumen

RICO-v2-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo darkc0de/RICO-v2, publicado por el cuantizador mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversion de los pesos originales a distintos niveles de cuantizacion para permitir su ejecucion en llama.cpp y entornos compatibles. El modelo base cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones) y esta etiquetado explicitamente como experimental, sin censura ("uncensored", "abliterated"), con advertencias de contenido danino, toxico y no apto para todas las audiencias.

El modelo original fue afinado a partir del dataset darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT, un conjunto orientado a investigacion restringida. La model card del repositorio cuantizado no documenta la arquitectura interna, el numero de tokens de entrenamiento ni el proceso de alineamiento, por lo que buena parte de las especificaciones tecnicas quedan como no disponibles. La presencia de ficheros mmproj (Q8_0 y f16) en el repositorio sugiere soporte multimodal de vision, aunque el autor no lo detalla.

Su relevancia es fundamentalmente metodologica y de investigacion: sirve como caso de estudio de cuantizacion estatica sobre un modelo de ~27B con licencia Apache 2.0, y como material para investigacion de seguridad, red teaming y evaluacion de modelos "abliterated". No es un modelo recomendado para despliegues de produccion orientados al usuario final, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; por tamano y formato se trata de un transformer denso, sin confirmar) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S (15,9 GB), Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (11,0 GB), IQ4_XS; ademas mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (los pesos originales del modelo base se distribuyen por separado) |
| Tamano del repositorio | 57,3 GB |
| Modelo base | darkc0de/RICO-v2 |
| Dataset de entrenamiento | darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT |
| Cuantizador | mradermacher |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura concreta del modelo base. La model card de la version GGUF se limita a indicar que son "static quants" de darkc0de/RICO-v2 y no incluye detalles de capas, atencion, normalizacion ni tipo de tokenizador. La presencia de ficheros multimodales mmproj (proyector de vision empaquetado junto a los pesos) es el unico indicio estructural disponible: apunta a que el modelo base incorpora un componente de vision ademas del decodificador de texto, pero no se especifica ni el codificador visual ni la resolucion de imagen soportada.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset XORTRON-RESTRICTED-RESEARCH-SFT, ni si hubo fases de RLHF, DPO o cualquier otro metodo de alineamiento. Las etiquetas "abliterated", "heretic" y "uncensored" sugieren que el modelo base ha sido modificado deliberadamente para eliminar o debilitar los mecanismos de rechazo y las capas de alineamiento de seguridad, pero el proceso tecnico de esa modificacion no esta documentado en la informacion proporcionada. No se declaran innovaciones de inferencia como decodificacion especulativa o atencion lineal.

La innovacion de este repositorio es unicamente de caracter practico: la publicacion de cuantizaciones estaticas que reducen el modelo de ~54,6 GB en f16 (calculo aritmetico a partir de los 27,3B de parametros) hasta 11,0 GB en Q2_K, con Q4_K_S en 15,9 GB marcado por el autor como "fast, recommended". El autor indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion y que pueden solicitarse mediante una discusion comunitaria.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno (etiqueta "conversational" en el repositorio).
- Capacidad multimodal probable: el repositorio incluye ficheros mmproj-Q8_0 y mmproj-f16, lo que indica entrada de imagenes ademas de texto. Las capacidades concretas de vision no estan documentadas.
- Comportamiento sin censura: el modelo esta disenado para no aplicar rechazos de seguridad, lo que lo hace apto para investigacion de alineamiento y red teaming, y no apto para uso general.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Modo "thinking" explicito: no disponible (no se menciona).
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles (en).
- Razonamiento, matematicas y generacion de codigo: no disponible (no se declaran ni se aportan benchmarks).

## Casos de uso

- Investigacion de seguridad y red teaming: el modelo esta explicitamente marcado como "harmful", "toxic" y "uncensored", por lo que su uso principal es generar respuestas potencialmente daninas en entornos controlados para evaluar y mejorar clasificadores de seguridad y filtros de contenido.
- Evaluacion de tecnicas de "abliteration": permite estudiar hasta que punto la eliminacion de capas de rechazo afecta a la utilidad general del modelo y como se degrada el comportamiento en tareas benignas.
- Generacion de datos sinteticos adversarios: util para construir conjuntos de datos etiquetados de contenido toxico o danino con los que entrenar detectores, siempre dentro de un marco de investigacion aprobado.
- Pruebas de robustez de guardarrailes: se puede integrar como generador adversario en pipelines que validan que un sistema de moderacion bloquea las salidas correctamente antes de llegar al usuario final.
- Cuantizacion y despliegue en local como objeto de estudio: los ficheros Q2_K (11,0 GB) y Q4_K_S (15,9 GB) permiten reproducir experimentos de degradacion por cuantizacion sobre un modelo de ~27B en una unica GPU de consumo, comparando perplejidad y calidad de salida entre niveles.
- Investigacion de multimodalidad: si el proyector mmproj funciona correctamente, el modelo puede usarse para estudiar la interaccion entre vision y generacion de texto en modelos modificados sin alineamiento.
- Analisis de sesgos y toxicidad en corpus de habla inglesa: generacion de texto en ingles para estudios comparativos de sesgo, con la advertencia de que las salidas pueden ser ofensivas y requieren aislamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo (corresponden a paginas corporativas de Microsoft y no guardan relacion con RICO-v2).

## Requisitos de hardware

- VRAM estimada para inferencia, a partir de los tamanos de fichero declarados por el autor:
  - Q2_K: fichero de 11,0 GB; requiere aproximadamente 12-14 GB de VRAM contando contexto y overhead.
  - Q4_K_S: fichero de 15,9 GB; requiere aproximadamente 17-20 GB de VRAM contando contexto y overhead.
  - Q8_0 y f16: no se declaran tamanos en la informacion disponible; por calculo aritmetico a partir de los 27,3B de parametros, f16 rondaria los 54,6 GB y Q8_0 en torno a 29 GB.
- GPU recomendadas segun cuantizacion: RTX 4090 o RTX 3090 (24 GB) para Q4_K_S; RTX 4080/4090 para Q2_K si se ajusta el contexto; A100 40 GB, A100 80 GB o H100 80 GB para Q8_0 y f16.
- Compatibilidad con GPU de consumo: si, Q2_K y Q4_K_S caben en tarjetas de 16-24 GB (RTX 4080, RTX 4090, RTX 3090, RTX 5090). Las cuantizaciones altas requieren multiples GPU o aceleradores de 80 GB.
- Opciones de despliegue: llama.cpp y sus derivados (llama-cpp-python, koboldcpp, LM Studio, text-generation-webui), Ollama mediante importacion de GGUF, y servidores compatibles con GGUF. El repositorio esta etiquetado como "endpoints_compatible" y "text-generation-inference", pero TGI no ejecuta GGUF de forma nativa y vLLM solo lo soporta de manera parcial; para produccion con TGI o vLLM seria preferible usar los pesos originales de darkc0de/RICO-v2.
- Latencia y throughput estimados: no disponible. El autor solo anota que Q4_K_S es "fast, recommended" en terminos relativos.
- Almacenamiento: el repositorio completo ocupa 57,3 GB, por lo que conviene descargar unicamente el fichero de cuantizacion necesario.

## Comparativa con modelos similares

La informacion proporcionada no incluye modelos alternativos de la misma categoria, ni datos de rendimiento que permitan una comparacion objetiva. Se indica "no disponible" para alternativas comparables. La unica comparacion posible con los datos disponibles es interna, entre el modelo base y sus propias cuantizaciones:

| Variante | Parametros | Formato | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darkc0de/RICO-v2 (base) | 27,3B | safetensors (pesos originales) | no disponible en esta informacion | apache-2.0 | repositorio del autor del modelo |
| RICO-v2-GGUF Q4_K_S | 27,3B | GGUF | 15,9 GB | apache-2.0 | descarga directa |
| RICO-v2-GGUF Q2_K | 27,3B | GGUF | 11,0 GB | apache-2.0 | descarga directa |
| RICO-v2-GGUF (resto de niveles) | 27,3B | GGUF | no disponible | apache-2.0 | listados sin tamano en la model card |
| Alternativas de terceros de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contenido danino y toxico: el repositorio esta etiquetado como "harmful", "toxic", "uncensored", "abliterated" y "not-for-all-audiences". Las salidas pueden incluir contenido ofensivo, ilegal o peligroso sin filtrado.
- Ausencia de alineamiento de seguridad: al tratarse de un modelo con los mecanismos de rechazo eliminados o debilitados, no debe exponerse a usuarios finales ni integrarse en productos de cara al publico.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, y al desconocerse la composicion del dataset XORTRON-RESTRICTED-RESEARCH-SFT no se puede estimar el sesgo introducido.
- Riesgo de alucinacion: no cuantificado, pero en modelos sin alineamiento y sin benchmarks publicados el riesgo debe considerarse alto por defecto.
- Limitacion idiomatica: el modelo declara unicamente ingles (en); el rendimiento en castellano no esta documentado y no deberia asumirse.
- Limitacion de contexto: la longitud de contexto no esta declarada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Cuantizacion: Q2_K y otros niveles bajos degradan de forma notable la calidad frente a f16; el autor recomienda Q4_K_S como equilibrio. El uso de cuantizaciones bajas agrava la incoherencia y la generacion de contenido erroneo.
- Licencia: el modelo se publica bajo Apache 2.0, lo que en principio permite uso comercial, pero la licencia no exime del cumplimiento de la legislacion aplicable ni de las politicas de las plataformas de despliegue. Dado el caracter del modelo, el uso comercial responsable es altamente desaconsejable.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad ni issues que documenten problemas conocidos.
- Ficheros multimodales: no se documenta que modelo de vision usa el proyector mmproj ni como se debe cargar en cada runtime, lo que puede provocar fallos de despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/RICO-v2-GGUF
- Modelo base: https://huggingface.co/darkc0de/RICO-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#RICO-v2-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper o blog oficial del modelo: no disponible
- Demo o espacio interactivo: no disponible
