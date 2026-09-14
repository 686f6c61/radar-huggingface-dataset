# katalidevai/qwen3-30b-katali-lab-eqs

## Resumen

Esta ficha describe `katalidevai/qwen3-30b-katali-lab-eqs`, una conversión cuantizada del modelo Qwen3-30B-A3B (30.500 millones de parámetros totales, 3.300 millones activos por token) al formato propietario EQS de Katali Lab. No se trata de un modelo nuevo ni de un ajuste fino: el autor indica explícitamente que no se reentrenó ni se afinó ningún peso, y que la única transformación aplicada fue la cuantización con pérdida de los pesos publicados originalmente (q8_0 en las capas densas de atención y q4_0 en los expertos), empaquetados en fragmentos EQS donde cada experto ocupa un blob contiguo.

La propuesta de valor es la inferencia local en CPU sin GPU: Katali Lab carga bajo demanda los expertos inactivos directamente desde disco en lugar de mantener todo el modelo en memoria RAM, lo que permite ejecutar un MoE de 30B en equipos sin acelerador gráfico. El repositorio ocupa 18,0 GB y contiene cuatro archivos: `dense.eqs`, `experts.eqs`, `config.json` y `tokenizer.json`.

La relevancia práctica está limitada por una restricción severa: los archivos EQS solo funcionan con la aplicación Katali Lab (`katali-lab.exe` y `katali-lab-chat.exe`) y no son compatibles con llama.cpp, Ollama, vLLM ni ningún otro runtime estándar. Además, el repositorio no tiene descargas y cuenta con una única interacción, por lo que no existe validación comunitaria de su calidad ni de su comportamiento real frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE); pesos empaquetados en formato EQS propietario |
| Parametros totales | 30.500 millones (heredados del modelo base Qwen/Qwen3-30B-A3B) |
| Parametros activos | 3.300 millones por token; 8 de 128 expertos enrutados (modelo base) |
| Longitud de contexto | No disponible en la informacion proporcionada. El modelo base declara 32.768 tokens nativos y hasta 131.072 con YaRN |
| Tipos de cuantizacion | q8_0 en pesos densos (atencion) y q4_0 en pesos de expertos; formato EQS |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base declara soporte para 119 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | EQS (`dense.eqs`, `experts.eqs`); no compatible con safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-30B-A3B: un transformer decoder-only con capas de mezcla de expertos, 128 expertos en total y 8 activados por token, lo que da una ratio de activación de aproximadamente el 11 % del total de parámetros. Esta configuración es la que hace viable el enfoque del repositorio: al activar solo una fracción pequeña de los expertos por token, el runtime puede mantener los expertos inactivos en disco y transferirlos únicamente cuando el enrutador los selecciona.

Sobre el proceso de conversión, la model card es explícita: los pesos densos de atención se cuantizaron a q8_0 y los expertos a q4_0, y después se empaquetaron en fragmentos EQS con cada experto como blob contiguo para permitir el streaming eficiente desde disco. El autor declara que no hubo reentrenamiento ni ajuste fino, y que el resultado es una cuantización con pérdida, no un modelo derivado en sentido de entrenamiento. No se documentan detalles sobre el dataset de entrenamiento original, el uso de RLHF o DPO, ni innovaciones técnicas más allá del propio empaquetado EQS; esa información pertenece al modelo base y no se reproduce en este repositorio.

Existe una discrepancia menor en los metadatos de HuggingFace: las etiquetas incluyen `base_model:finetune:Qwen/Qwen3-30B-A3B`, mientras que la model card afirma que no se aplicó ningún ajuste fino. La etiqueta es la que HuggingFace asigna automáticamente a las conversiones cuantizadas, pero conviene tenerla presente al catalogar el modelo.

## Capacidades

Las capacidades funcionales son las heredadas del modelo base Qwen3-30B-A3B, degradadas por la cuantización q4_0 de los expertos y condicionadas por las limitaciones del runtime EQS:

- Generacion de texto conversacional en modo chat, que es el caso de uso para el que se empaqueta este formato.
- Razonamiento y matematicas, en principio heredados del modelo base, aunque la cuantizacion a 4 bits de los expertos afecta de forma mas acusada a tareas de razonamiento multi-paso que a la generacion libre.
- Generacion y explicacion de codigo, con la salvedad de que el runtime Katali Lab es una aplicacion de chat y no expone una API de servidor.
- Capacidades multilingues: no verificadas en este repositorio. El modelo base declara 119 idiomas, pero no hay confirmacion de que el tokenizer empaquetado y el runtime EQS preserven ese comportamiento.
- Tool calling y function calling: no disponible. No se documenta soporte en el runtime EQS.
- Modo thinking (razonamiento extendido) del modelo base: no disponible ni confirmado en esta conversion.
- Vision, audio u otras modalidades: no disponibles.
- Ejecucion en CPU sin GPU como capacidad operativa diferencial, con streaming de expertos desde disco.

## Casos de uso

- Chat local en equipos sin GPU: el modelo esta disenado para ejecutarse en CPU con Katali Lab, cargando expertos desde disco bajo demanda. Encaja en portatiles de oficina o estaciones de trabajo sin tarjeta grafica dedicada donde se quiere disponibilidad de un modelo de 30B sin depender de la nube.
- Entornos aislados o air-gapped: al no requerir GPU ni conexion a servicios externos, puede desplegarse en redes segregadas (defensa, sanidad, banca, legal) donde esta prohibido enviar datos a APIs de terceros. El requisito es disponer de los 18 GB del repositorio y de la aplicacion Katali Lab instalada localmente.
- Prototipado y evaluacion sin infraestructura de aceleradores: util para equipos que quieren probar el comportamiento de un MoE de 30B antes de invertir en GPUs o en instancias cloud.
- Investigacion sobre streaming de expertos: el empaquetado EQS con cada experto como blob contiguo es un caso de estudio concreto sobre politicas de carga bajo demanda, patrones de acceso al enrutador y trade-offs entre latencia y uso de memoria.
- Docencia y demostraciones: permite mostrar en un aula el funcionamiento interno de un MoE (128 expertos, 8 activos por token) sin necesidad de hardware especializado.
- Asistencia de redaccion y resumen de documentos locales: tareas de generacion de texto de proposito general donde la perdida de precision por cuantizacion es menos critica que en razonamiento formal.
- Procesamiento de datos sensibles con requisitos de residencia: al ejecutarse integramente en local, los datos no salen del equipo, lo que simplifica el cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye mediciones de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni compara la calidad de la version q4_0 de expertos frente a los pesos originales en BF16. Tampoco se documentan metricas de latencia, tokens por segundo ni consumo de memoria RAM del runtime Katali Lab durante el streaming de expertos.

## Requisitos de hardware

- VRAM: no aplica. El modelo esta disenado para inferencia exclusiva en CPU; no requiere GPU.
- GPU recomendadas: ninguna. El autor indica que no se necesita GPU.
- Compatibilidad con GPU de consumo: irrelevante para este formato, ya que el runtime EQS no es compatible con CUDA ni con runtimes de GPU estandar.
- Almacenamiento: 18,0 GB para el repositorio completo (`dense.eqs`, `experts.eqs`, `config.json`, `tokenizer.json`).
- RAM: no disponible. El diseno de streaming de expertos desde disco sugiere un consumo de memoria muy inferior a los 18 GB, pero no se publica ninguna cifra.
- Disco: se recomienda unidad SSD, ya que el rendimiento depende directamente de la velocidad de lectura aleatoria al cargar expertos bajo demanda. No se especifica ningun requisito minimo.
- Opciones de despliegue: unicamente la aplicacion Katali Lab. No hay soporte para llama.cpp, Ollama, vLLM, TGI, Transformers ni ningun otro runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Runtime | Licencia | Notas |
|---|---|---|---|---|---|---|
| qwen3-30b-katali-lab-eqs (este repositorio) | 30,5B totales / 3,3B activos | No disponible | EQS (denso q8_0, expertos q4_0) | Solo Katali Lab | Apache 2.0 | CPU-only, streaming de expertos desde disco, 18,0 GB |
| Qwen/Qwen3-30B-A3B (original) | 30,5B totales / 3,3B activos | 32.768 tokens nativos, 131.072 con YaRN | safetensors (BF16) | Transformers, vLLM, SGLang | Apache 2.0 | Requiere GPU o mucha RAM; es la referencia de calidad |
| Cuantizaciones GGUF de Qwen3-30B-A3B | 30,5B totales / 3,3B activos | Igual que el base | GGUF (q4_K_M y similares) | llama.cpp, Ollama, LM Studio | Apache 2.0 | Ecosistema amplio, funciona en CPU y en GPU con offload parcial |
| Cuantizaciones AWQ/GPTQ int4 de Qwen3-30B-A3B | 30,5B totales / 3,3B activos | Igual que el base | safetensors cuantizado | vLLM, TGI, AutoAWQ | Apache 2.0 | Orientadas a servidor con GPU; alto throughput |

La diferencia clave frente a las alternativas no es la calidad ni el rendimiento, sino el formato y el runtime: este repositorio renuncia a la portabilidad de GGUF o safetensors a cambio de un esquema de streaming de expertos especifico de Katali Lab. No hay datos de benchmarks que permitan comparar la calidad resultante.

## Limitaciones y advertencias

- Formato propietario y cerrado: los archivos EQS solo se pueden abrir con Katali Lab. No hay soporte en llama.cpp, Ollama, vLLM, TGI ni Transformers, lo que descarta su uso en pipelines de produccion estandar y complica la migracion futura.
- Cuantizacion con perdida: los expertos se cuantizan a q4_0, un esquema de 4 bits relativamente agresivo, y las capas densas a q8_0. El autor reconoce explicitamente que se trata de una cuantizacion con perdida. Se espera degradacion en tareas de razonamiento, matematicas y generacion de codigo, aunque no se cuantifica.
- Ausencia total de benchmarks: no hay ninguna medicion publicada que permita estimar la perdida de calidad frente al modelo base ni la latencia real en CPU.
- Validacion comunitaria nula: el repositorio tiene 0 descargas y 1 like. No hay informes independientes de funcionamiento, compatibilidad ni estabilidad.
- Rendimiento dependiente del disco: al hacer streaming de expertos bajo demanda, la latencia por token dependera de la velocidad de lectura del almacenamiento. Un disco duro mecanico o una unidad de red lenta pueden hacer inviable el uso interactivo.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens nativos (131.072 con YaRN), la model card de este repositorio no confirma que el runtime EQS respete esa ventana ni que implemente la extension por YaRN.
- Tool calling y uso agentico no disponibles: al no existir API de servidor ni documentacion al respecto, no se puede integrar en flujos de agentes, function calling ni CI/CD.
- Idiomas no verificados: no hay confirmacion de que el soporte multilingue del modelo base se preserve con el tokenizer empaquetado y el runtime EQS.
- Sesgos y alucinacion: al ser una cuantizacion del modelo base sin ajuste adicional, hereda los sesgos de los datos de entrenamiento de Qwen3 y los riesgos habituales de alucinacion de los modelos de lenguaje, potencialmente agravados por la cuantizacion a 4 bits.
- Discrepancia en metadatos: las etiquetas indican `base_model:finetune`, mientras que la model card afirma que no hubo ajuste fino. Conviene verificar la procedencia si se va a citar academicamente.
- Licencia: Apache 2.0, igual que el modelo base, lo que permite uso comercial. El credito del modelo original corresponde al equipo Qwen de Alibaba.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/katalidevai/qwen3-30b-katali-lab-eqs
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Repositorio de Katali Lab: https://github.com/katalidevai/katalilab
- Texto completo de la licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos eran contenido no relacionado y spam, por lo que no se incluyen. No se han localizado papers, blogs tecnicos ni demos asociados a esta conversion.
