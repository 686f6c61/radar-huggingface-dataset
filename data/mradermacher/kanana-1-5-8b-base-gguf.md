# mradermacher/kanana-1.5-8b-base-GGUF

## Resumen

Kanana 1.5 8B Base es un modelo de lenguaje de 8.030.261.248 parámetros desarrollado por OpenLLM-Korea. Esta ficha describe la versión cuantizada en formato GGUF publicada por mradermacher, que facilita la ejecución del modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo original es un transformer denso de tipo base (sin ajuste conversacional específico), lo que lo hace adecuado como punto de partida para fine-tuning o para tareas de generación de texto sin instrucciones.

La relevancia de esta publicación radica en que ofrece el modelo en múltiples niveles de cuantización (desde Q2_K de 3,3 GB hasta f16 de 16,2 GB), lo que permite desplegarlo en GPU de consumo con VRAM limitada o incluso en CPU. El modelo soporta inglés y coreano, lo que lo posiciona como una opción para aplicaciones bilingües en esos idiomas. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Al tratarse de un modelo base, no incorpora alineación conversacional ni modos de razonamiento explícitos; su valor está en servir como base para ajuste fino o para tareas de continuación de texto y modelado de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifica variante en la informacion disponible) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base OpenLLM-Korea/kanana-1.5-8b-base mas alla de que se trata de un transformer de 8.030.261.248 parametros. No se especifica si emplea atencion lineal, decodificacion especulativa, mezcla de expertos u otras innovaciones tecnicas. Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Esta ficha describe exclusivamente la version cuantizada en GGUF, que preserva la arquitectura del modelo original pero reduce la precision de los pesos.

Las cuantizaciones han sido generadas con el pipeline de mradermacher, que produce variantes estaticas (no imatrix) en este repositorio; las versiones con imatrix estan disponibles en un repositorio separado (kanana-1.5-8b-base-i1-GGUF). El proceso de cuantizacion convierte los pesos desde el formato Hugging Face original (safetensors) a GGUF, manteniendo la compatibilidad con llama.cpp y derivados.

## Capacidades

- Generacion de texto autoregresiva en ingles y coreano.
- Modelado de lenguaje y continuacion de texto (modelo base, sin alineacion conversacional).
- Punto de partida para fine-tuning supervisado o ajuste con instrucciones.
- Compatible con tool calling y function calling solo si se ajusta previamente; el modelo base no incorpora estas capacidades de forma nativa.
- No dispone de modo de razonamiento explicito (thinking mode) ni capacidades de vision o audio segun la informacion disponible.
- Capacidades multilingues limitadas a ingles y coreano.
- Ejecutable en CPU y GPU mediante llama.cpp, Ollama y otras herramientas compatibles con GGUF.

## Casos de uso

- Fine-tuning para dominios especificos en coreano: al ser un modelo base bilingue, se puede ajustar con datasets propios para tareas de clasificacion, extraccion o generacion en coreano e ingles, partiendo de las cuantizaciones Q8_0 o f16 para maximizar la calidad del ajuste.
- Generacion de texto en produccion con recursos limitados: la cuantizacion Q4_K_M (5,0 GB) permite desplegar el modelo en una GPU de consumo con 8 GB de VRAM, ofreciendo un equilibrio entre calidad y velocidad para tareas de continuacion de texto.
- Prototipado rapido en entornos sin GPU: la cuantizacion Q2_K (3,3 GB) o Q3_K_S (3,8 GB) permite ejecutar el modelo en CPU con llama.cpp, adecuado para pruebas de concepto y validacion de pipelines antes de escalar a hardware superior.
- Investigacion en procesamiento de lenguaje coreano: el modelo sirve como referencia base para experimentos de evaluacion de tecnicas de cuantizacion y su impacto en la perplejidad en coreano, comparando las distintas variantes GGUF.
- Sistemas de autocompletado o sugerencia de texto: integrado en editores o interfaces de escritura, el modelo puede generar continuaciones de texto en ingles y coreano con baja latencia usando cuantizaciones Q4_K_S o Q4_K_M en GPU de consumo.
- Base para modelos conversacionales: a partir del modelo base se puede aplicar un ajuste con instrucciones (SFT) para crear un asistente conversacional bilingue, aprovechando la licencia Apache 2.0 para uso comercial.
- Despliegue en entornos edge o embebidos: las cuantizaciones mas pequenas (Q2_K, Q3_K_S) permiten ejecutar el modelo en dispositivos con memoria limitada, aunque con una perdida de calidad notable que debe evaluarse para cada caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (el tamano del archivo es una aproximacion; se necesita VRAM adicional para el contexto y los buffers de computo):
  - Q2_K: 3,3 GB
  - Q3_K_S: 3,8 GB
  - Q3_K_M: 4,1 GB
  - Q3_K_L: 4,4 GB
  - IQ4_XS: 4,6 GB
  - Q4_K_S: 4,8 GB
  - Q4_K_M: 5,0 GB
  - Q5_K_S: 5,7 GB
  - Q5_K_M: 5,8 GB
  - Q6_K: 6,7 GB
  - Q8_0: 8,6 GB
  - f16: 16,2 GB
- GPU recomendadas: no disponible en la informacion proporcionada. Como referencia general, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); las cuantizaciones Q8_0 y f16 requieren GPUs de 12-24 GB (RTX 4090, A100, H100) o ejecucion en CPU con suficiente RAM.
- Cabe en GPU de consumo: si, en las cuantizaciones Q2_K a Q5_K_M para GPUs de 8-12 GB; Q6_K y Q8_0 para GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (por ejemplo, LM Studio, text-generation-webui con el backend de llama.cpp). No se indica compatibilidad con vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones comparables de modelos alternativos en la informacion proporcionada. La siguiente tabla recoge unicamente los datos disponibles del modelo descrito; las celdas de comparacion se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| Kanana 1.5 8B Base (GGUF, mradermacher) | 8.030.261.248 | no disponible | apache-2.0 | GGUF | en, ko |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 3 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Al ser un modelo base, no esta alineado para conversacion ni sigue instrucciones de forma fiable; puede generar contenido incoherente o inapropiado sin un ajuste previo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual en la informacion disponible.
- Sesgos conocidos: no se dispone de informacion sobre sesgos especificos del modelo; se recomienda evaluar en el dominio de aplicacion.
- Limitaciones de idioma: solo se declaran ingles y coreano; el rendimiento en otros idiomas no esta garantizado.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar aplicaciones que requieran ventanas largas.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda validar la perplejidad o la calidad de salida en la tarea concreta antes de usarlas en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base original mantiene la misma licencia y que no existen restricciones adicionales en los datos de entrenamiento.
- El repositorio GGUF tiene un tamano de 71,8 GB, lo que implica que la descarga completa de todas las cuantizaciones requiere espacio considerable; se recomienda descargar solo la variante necesaria.
- No se dispone de informacion sobre el proceso de entrenamiento ni sobre evaluaciones de seguridad del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/kanana-1.5-8b-base-GGUF
- Modelo base original: https://huggingface.co/OpenLLM-Korea/kanana-1.5-8b-base
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/kanana-1.5-8b-base-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#kanana-1.5-8b-base-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
