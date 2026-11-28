# Piyush00023/coffy-3.2-flash-GGUF

## Resumen

coffy-3.2-flash es un asistente de instrucciones de 8.230 millones de parametros (8,19B segun los pesos en safetensors) construido sobre la arquitectura de Qwen3-8B y publicado por el usuario Piyush00023. El repositorio que nos ocupa, coffy-3.2-flash-GGUF, contiene exclusivamente las versiones cuantizadas del modelo original en formato GGUF, generadas con llama.cpp a partir de los pesos oficiales en safetensors, lo que permite ejecutarlo en entornos de inferencia ligera como llama.cpp, Ollama o LM Studio.

El modelo se presenta como un asistente conversacional orientado a texto y codigo, con licencia Apache-2.0 y un enfoque declaradamente "open weights" (pesos abiertos, no codigo abierto). Su relevancia practica radica en que ofrece un conjunto completo de cuantizaciones (desde Q2_K de 3,28 GB hasta F16 de 16,39 GB) que abarcan desde equipos con poca memoria RAM hasta despliegues de referencia casi sin perdida, todo ello sobre una base arquitectonica conocida y ampliamente soportada por el ecosistema.

No obstante, la informacion publicada es muy escasa: la model card no detalla composicion del dataset de entrenamiento, numero de tokens, proceso de alineacion ni resultados de benchmarks, y el autor advierte de un artefacto conocido en la autoidentificacion del modelo. Esta ficha refleja fielmente esos vacios indicando "no disponible" donde corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen3-8B (detalle exacto de capas y atencion no disponible) |
| Parametros totales | 8.190.735.360 (~8,23B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | Ingles (en) y codigo |
| Licencia | Apache-2.0 (pesos abiertos, no codigo abierto) |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-8B, es decir, un transformer decoder-only con 8.230 millones de parametros, segun indica la propia model card. El repositorio GGUF se ha generado convirtiendo y cuantizando los pesos oficiales en safetensors mediante llama.cpp. No se especifica en la informacion disponible ni el numero de capas, ni la dimension oculta, ni el mecanismo de atencion exacto, ni si incorpora modos de razonamiento extendido propios de la familia Qwen3.

En cuanto al entrenamiento, la model card no aporta ningun dato sobre el volumen de tokens, la composicion del corpus, el uso de RLHF/DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, mezcla de expertos, etc.). El unico detalle de proceso relevante es que el autor declara haber realizado una prueba de humo ("smoke test") sobre la cuantizacion Q4_K_M, verificando generacion coherente de identidad, codigo y matematicas frente al modelo principal.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Generacion y asistencia de codigo (el modelo declara soporte del idioma "code").
- Razonamiento basico y resolucion de problemas matematicos, segun la verificacion de humo del autor.
- Instrucciones: el modelo se describe como "instruction-tuned assistant".
- Compatibilidad con runtimes GGUF: llama.cpp, Ollama, LM Studio y cualquier motor compatible con el formato.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Capacidades multilingues: limitadas a ingles y codigo segun los metadatos.

## Casos de uso

- Asistente de codigo en local: con la cuantizacion Q4_K_M (5,03 GB) el modelo cabe en equipos de consumo y puede integrarse en editores o terminales mediante llama.cpp u Ollama para autocompletado, explicacion y generacion de fragmentos de codigo en ingles.
- Prototipado rapido de chatbots: al ser un modelo instruction-tuned de ~8B y con licencia Apache-2.0, sirve para levantar asistentes conversacionales de prueba en estaciones de trabajo sin GPU dedicada usando la version Q2_K o Q3_K_M.
- Despliegue en entornos con RAM limitada: las variantes Q2_K (3,28 GB) y Q3_K_M (4,12 GB) permiten ejecutar el modelo en portatiles modestos o contenedores con poca memoria, a costa de perdida de calidad.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece ocho niveles de cuantizacion del mismo modelo, lo que facilita estudios de degradacion calidad/tamano en pipelines de investigacion.
- Generacion de texto offline y privacidad: al ejecutarse localmente con llama.cpp o LM Studio, el modelo permite procesar texto sin enviar datos a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Educacion y experimentacion: su tamano (8B) y su compatibilidad con llama-cpp-python lo convierten en una opcion asequible para cursos y talleres sobre inferencia de LLM y cuantizacion.
- Tareas de referencia (baseline): la version F16 (16,39 GB) puede usarse como referencia de calidad frente a las cuantizaciones inferiores en pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona una prueba de humo cualitativa sobre Q4_K_M (identidad, codigo y matematicas verificadas contra el modelo principal), sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numericas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion (tamano de archivo como referencia minima; el runtime anade overhead):
  - Q2_K: 3,28 GB
  - Q3_K_M: 4,12 GB
  - IQ4_XS: 4,59 GB
  - Q4_K_M: 5,03 GB (recomendada por el autor)
  - Q5_K_M: 5,85 GB
  - Q6_K: 6,73 GB
  - Q8_0: 8,71 GB
  - F16: 16,39 GB
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, las cuantizaciones de 4 a 5 bits son aptas para GPUs de consumo con 8 GB o mas de VRAM; F16 requiere aproximadamente 16 GB o mas.
- Cabe en GPU de consumo: si, las variantes Q2_K a Q5_K_M en tarjetas con 6-8 GB de VRAM; Q6_K y Q8_0 en tarjetas de 8-12 GB; F16 en tarjetas de 16 GB o superiores.
- Opciones de despliegue: llama.cpp (llama-cli, llama-cpp-python), Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| coffy-3.2-flash (este) | ~8,23B | no disponible | Apache-2.0 | GGUF / safetensors | Base Qwen3-8B, solo ingles y codigo |
| Qwen3-8B (modelo de referencia) | ~8,2B | no disponible en esta ficha | Apache-2.0 | safetensors / GGUF | Arquitectura original en la que se basa coffy; multilingue |
| Llama 3.1 8B | ~8B | 128K (segun documentacion publica del modelo) | Llama 3.1 Community License | safetensors / GGUF | Alternativa de tamano similar con licencia mas restrictiva |
| Mistral 7B Instruct | ~7,3B | 32K (segun documentacion publica del modelo) | Apache-2.0 | safetensors / GGUF | Alternativa ligeramente menor con licencia permisiva |

Nota: los datos de contexto y licencia de los modelos comparativos provienen de su documentacion publica habitual; no se dispone de resultados de benchmarks de coffy-3.2-flash para comparar rendimiento de forma numerica.

## Limitaciones y advertencias

- Autoidentificacion incorrecta: el autor advierte que el modelo puede identificarse como una version anterior (por ejemplo, "coffy-2.4-flash") debido a un artefacto de los datos de entrenamiento; los pesos son de coffy-3.2-flash.
- Riesgo de alucinacion: no se documenta ningun proceso de mitigacion ni evaluacion de fidelidad; como todo LLM de ~8B, puede generar contenido plausible pero incorrecto.
- Sesgos: no se publica informacion sobre sesgos conocidos ni sobre la composicion del dataset, por lo que no es posible evaluar su comportamiento en dominios sensibles.
- Limitacion idiomatica: el modelo declara solo ingles y codigo; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto: la longitud de contexto no esta especificada, lo que impide planificar casos de uso con ventanas largas sin verificacion empirica.
- Licencia: Apache-2.0 permite uso comercial, pero el autor matiza que se trata de "pesos abiertos, no codigo abierto"; conviene revisar el fichero LICENSE del repositorio antes de un despliegue en produccion.
- Madurez y soporte: repositorio con muy poca traccion (351 descargas, 1 like), sin benchmarks publicados ni documentacion de entrenamiento; no se recomienda como base unica para produccion sin evaluacion propia.
- Verificacion limitada: la unica validacion declarada es una prueba de humo sobre Q4_K_M; las cuantizaciones de 2 y 3 bits pueden degradar notablemente la calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Piyush00023/coffy-3.2-flash-GGUF
- Modelo base: https://huggingface.co/Piyush00023/coffy-3.2-flash
- Quickstart del modelo base: https://huggingface.co/Piyush00023/coffy-3.2-flash#quickstart
- Licencia del modelo base: https://huggingface.co/Piyush00023/coffy-3.2-flash#license
- Contacto del autor: piyushdas000@gmail.com
