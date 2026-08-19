# mradermacher/Llama-3.2-1B-Instruct-gabliterated-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `Goekdeniz-Guelmez/Llama-3.2-1B-Instruct-gabliterated`, una variante "abliterada" (sin rechazos de seguridad) del modelo Llama 3.2 1B Instruct de Meta. La cuantización ha sido realizada por mradermacher, un desarrollador especializado en la conversión de modelos a formato GGUF para su uso con motores de inferencia como llama.cpp, Ollama o LM Studio.

El modelo base aplica la técnica de "abliteration" (eliminación de capas de rechazo) sobre el Llama 3.2 1B Instruct, lo que elimina los mecanismos de moderación de contenido y permite generar respuestas sin filtros de seguridad. Esto lo hace relevante para desarrolladores que necesitan un modelo pequeño, rápido y sin restricciones para tareas de generación de texto libre, aunque con los riesgos asociados a la ausencia de alineación.

Al tratarse de un modelo de 1B parámetros, es adecuado para entornos con recursos limitados, como dispositivos edge o GPUs de gama baja. El repositorio ofrece doce niveles de cuantización, desde Q2_K (0,7 GB) hasta f16 (2,6 GB), lo que permite ajustar el equilibrio entre calidad y consumo de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.2) |
| Parametros totales | 1B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Llama 3.2 1B soporta 128k, pero no se confirma en esta card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible (el modelo base de Meta usa licencia Llama 3.2, pero esta card no la especifica) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es una version "gabliterated" del Llama 3.2 1B Instruct, obtenida mediante la tecnica de abliteration, que consiste en eliminar o neutralizar las capas del modelo responsables de generar rechazos o respuestas de seguridad. Esto se logra modificando los pesos del modelo original, no mediante un entrenamiento adicional. El resultado es un modelo que conserva las capacidades linguisticas y de razonamiento del original, pero sin los mecanismos de moderacion de contenido.

La cuantizacion a GGUF ha sido realizada por mradermacher mediante conversion estatica (static quants), sin utilizar imatrix (aunque existe una version alternativa con imatrix en otro repositorio). No se proporcionan detalles sobre el dataset de entrenamiento del modelo base, ni sobre el proceso de abliteration aplicado por Goekdeniz-Guelmez.

## Capacidades

- Generacion de texto libre sin filtros de contenido ni rechazos de seguridad.
- Conversacion multi-turno en ingles, gracias a su naturaleza instruct-tuned.
- Razonamiento basico y respuesta a instrucciones, heredados del Llama 3.2 1B Instruct.
- Capacidad de ejecucion en entornos con recursos limitados gracias a su tamano reducido (1B parametros).
- Compatible con motores de inferencia que soporten GGUF (llama.cpp, Ollama, LM Studio, etc.).
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede producir textos de ficcion, poesia o guiones sin las limitaciones de moderacion de los modelos alineados, lo que resulta util para escritores que exploran temas controvertidos.
- Prototipado rapido de chatbots: al ser pequeno y rapido, permite iterar sobre disenos conversacionales sin necesidad de infraestructura costosa, especialmente en entornos de desarrollo locales.
- Investigacion sobre alineacion y seguridad: al comparar las respuestas de este modelo con las del Llama 3.2 1B Instruct original, los investigadores pueden estudiar el impacto de la abliteration en el comportamiento del modelo.
- Despliegue en dispositivos edge: con cuantizaciones de menos de 1 GB, puede ejecutarse en Raspberry Pi, moviles o sistemas embebidos para tareas de generacion de texto offline.
- Fine-tuning posterior: al ser un modelo de 1B, es viable ajustarlo con LoRA o tecnicas similares en una GPU consumer para tareas especificas sin necesidad de grandes recursos.
- Educacion y demostraciones: sirve para ensenar conceptos de cuantizacion, inferencia local y diferencias entre modelos alineados y no alineados en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Se recomienda consultar el modelo base original para obtener datos de rendimiento, aunque la abliteration puede alterar ligeramente los resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,7 GB (Q2_K) y 2,6 GB (f16) para el peso del modelo, mas overhead de contexto. Con Q4_K_M (0,9 GB) se puede ejecutar en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) para las cuantizaciones mas bajas. Para f16 se recomienda 6 GB o mas.
- Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier motor compatible con GGUF.
- Latencia y throughput: no se proporcionan datos especificos, pero al ser un modelo de 1B, la generacion es muy rapida incluso en CPU (tipicamente >50 tokens/s en hardware moderno con cuantizacion Q4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Caracteristica principal |
|---|---|---|---|---|---|
| Llama-3.2-1B-Instruct-gabliterated-GGUF (este) | 1B | No disponible | No disponible | GGUF | Sin censura, cuantizado |
| Llama-3.2-1B-Instruct (original) | 1B | 128k | Llama 3.2 | HF, GGUF | Alineado, con moderacion |
| Llama-3.2-1B-Instruct-abliterated3 (de mradermacher) | 1B | No disponible | No disponible | GGUF | Otra variante abliterada |

La principal diferencia con el modelo original es la ausencia de rechazos de seguridad. Frente a otras variantes abliteradas, la diferencia radica en la tecnica especifica de abliteration aplicada (gabliterated vs abliterated3), aunque no se documentan diferencias funcionales concretas.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido ofensivo, ilegal o peligroso. No es apto para aplicaciones de produccion sin supervision humana.
- Tamano reducido (1B): la calidad de razonamiento y coherencia es inferior a modelos mas grandes, con mayor tendencia a alucinaciones.
- Solo ingles: no soporta otros idiomas de forma nativa.
- Licencia no especificada: el uso comercial puede estar restringido por la licencia del modelo base de Meta (Llama 3.2), que requiere aceptacion de sus terminos.
- Sin informacion sobre el proceso de abliteration: no se detalla que capas se modificaron ni como afecta a la calidad general.
- Riesgo de sesgos: al eliminar la moderacion, los sesgos presentes en los datos de entrenamiento del modelo original pueden amplificarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Llama-3.2-1B-Instruct-gabliterated-GGUF
- Modelo base: https://huggingface.co/Goekdeniz-Guelmez/Llama-3.2-1B-Instruct-gabliterated
- Version con imatrix: https://huggingface.co/mradermacher/Llama-3.2-1B-Instruct-gabliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-3.2-1B-Instruct-gabliterated-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
