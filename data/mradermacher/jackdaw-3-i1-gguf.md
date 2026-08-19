# mradermacher/Jackdaw-3-i1-GGUF

## Resumen

Jackdaw-3-i1-GGUF es una colección de cuantizaciones GGUF del modelo Jackdaw-3, desarrollada por mradermacher a partir del modelo base de blascotobasco. Se trata de un modelo de 18 010 millones de parámetros orientado a conversación, roleplay y contenido sin censura (etiquetado como `uncensored` y `not-for-all-audiences`). La versión i1 emplea cuantización con imatrix, que mejora la calidad de las cuantizaciones de baja precisión frente a las estáticas. Está pensado para ejecutarse localmente con herramientas como llama.cpp u Ollama, y ofrece un amplio abanico de tamaños de cuantización, desde 4,1 GB (IQ1_S) hasta 14,9 GB (Q6_K), lo que permite adaptarse a distintos niveles de VRAM.

El modelo base Jackdaw-3 no dispone de documentación pública en la información proporcionada, por lo que se desconocen detalles de arquitectura, entrenamiento y licencia. Esta ficha se basa exclusivamente en los datos disponibles en la página de HuggingFace de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 18.010.942.528 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Jackdaw-3. Los unicos datos conocidos son el numero de parametros (18 010 millones) y que se distribuye en formato GGUF, lo que implica un transformer (tipico de la mayoria de modelos de lenguaje). No se ha publicado informacion sobre el dataset de entrenamiento, el proceso de alineacion (RLHF/DPO) ni innovaciones tecnicas especificas. La cuantizacion i1 realizada por mradermacher utiliza la tecnica de imatrix (importance matrix) para mejorar la calidad de los quants de baja precision, como se indica en la tabla de archivos proporcionados.

## Capacidades

- Generacion de texto conversacional, con enfasis en roleplay y dialogos multi-turno.
- Contenido sin censura: el modelo esta etiquetado como `uncensored`, lo que implica que no aplica filtros de seguridad estandar para temas sensibles o explicitos.
- Soporte de contexto largo: no se especifica la longitud de contexto, pero al ser un modelo de 18B es probable que maneje ventanas de al menos 8K tokens (dato no confirmado).
- No se mencionan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Roleplay y narracion interactiva: el modelo puede generar personajes, dialogos y tramas en juegos de rol textuales, manteniendo coherencia a lo largo de conversaciones extensas.
- Chatbots sin filtros para adultos: su naturaleza `uncensored` lo hace adecuado para aplicaciones de entretenimiento para mayores de edad, aunque con las advertencias legales y eticas correspondientes.
- Generacion de historias y fanfiction: puede crear relatos con tono y estilo adaptables, util para escritores que buscan inspiracion o borradores rapidos.
- Simulacion de personajes en videojuegos: integrable en motores de dialogo para NPCs con personalidad definida.
- Asistente de escritura creativa: ayuda a desarrollar tramas, dialogos y descripciones en proyectos literarios.
- Experimentacion con cuantizaciones extremas: la variedad de quants permite probar el rendimiento del modelo en hardware limitado, desde GPU de 4 GB hasta 24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: segun el archivo de cuantizacion elegido, se necesita aproximadamente el tamaño del archivo mas un margen para el contexto y las activaciones. Por ejemplo, el Q4_K_M (11,2 GB) requiere al menos 12-14 GB de VRAM; el IQ1_S (4,1 GB) puede caber en 6 GB con contexto corto.
- GPU recomendadas: para cuantizaciones Q4 o superiores, una RTX 3060 12 GB o RTX 4070 12 GB es suficiente. Para Q6_K (14,9 GB), se recomienda una RTX 4090 24 GB o una A100 40 GB.
- En consumer GPU: si, con cuantizaciones de hasta Q4_K_M en GPUs de 12 GB. Las cuantizaciones IQ1/IQ2 pueden funcionar en GPUs de 6-8 GB, aunque con perdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no se dispone de datos medidos. En general, un modelo de 18B en Q4_K_M genera entre 10 y 30 tokens por segundo en una RTX 4090, dependiendo del contexto y la implementacion.

## Comparativa con modelos similares

No disponible. No se ha identificado informacion sobre modelos comparables en la documentacion proporcionada. Para una comparativa justa seria necesario conocer la arquitectura y el rendimiento del modelo base, datos que no estan publicados.

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede generar texto explicito, ofensivo o ilegal en algunas jurisdicciones. No es apto para menores ni para uso en entornos moderados.
- Sesgos desconocidos: al no haber documentacion sobre el entrenamiento, no se pueden evaluar sesgos de genero, raza o ideologicos.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede inventar hechos o datos cuando se le pide informacion factual.
- Idioma limitado: solo se ha confirmado soporte para ingles. El rendimiento en otros idiomas es desconocido.
- Licencia no especificada: no se indica la licencia del modelo base ni de la cuantizacion, lo que impide conocer restricciones de uso comercial o redistribucion.
- Calidad de cuantizaciones extremas: los quants por debajo de IQ2_XS (menos de 5,7 GB) degradan significativamente la calidad y solo son recomendables para pruebas en hardware muy limitado.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/mradermacher/Jackdaw-3-i1-GGUF
- Modelo base: https://huggingface.co/blascotobasco/Jackdaw-3
- Cuantizaciones estaticas (sin imatrix): https://huggingface.co/mradermacher/Jackdaw-3-GGUF
- Guia de uso de GGUF de TheBloke (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
