# canopus77/slm-rag-sft-merged

## Resumen

canopus77/slm-rag-sft-merged es un ajuste fino supervisado (SFT) del modelo unsloth/Llama-3.2-3B-Instruct-bnb-4bit, publicado por el usuario canopus77 en HuggingFace. Se trata de un modelo denso de 3.212.749.824 parametros (unos 3,21 mil millones) orientado a generacion de texto conversacional, con pesos distribuidos en formato safetensors y un tamano de repositorio de 6,4 GB. El nombre del repositorio sugiere un ajuste orientado a generacion aumentada por recuperacion (RAG), aunque la model card no documenta ni el conjunto de datos ni el procedimiento de entrenamiento.

El problema que resuelve es acotado: proporcionar una variante pequena, desplegable en hardware de consumo, del modelo Llama 3.2 3B Instruct, con licencia declarada Apache-2.0. Su relevancia practica es limitada por el momento: el repositorio acumula 0 descargas y 0 likes, y la ficha tecnica del autor es minima (no incluye evaluacion, composicion del dataset ni hiperparametros). Esto lo convierte en un artefacto interesante para experimentacion local y para reutilizacion como punto de partida, mas que en una opcion lista para produccion.

El entrenamiento se realizo, segun la propia model card, con Unsloth y la libreria TRL de HuggingFace, con la afirmacion de que fue "2x faster" (el doble de rapido) en entrenamiento. El sufijo "merged" indica que los adaptadores se fusionaron en los pesos del modelo base. El idioma declarado es unicamente ingles (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.2 (heredada del modelo base); no se documentan modificaciones estructurales |
| Parametros totales | 3.212.749.824 (3,21 mil millones) |
| Parametros activos | no aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible en la ficha del autor; el modelo base Llama-3.2-3B-Instruct declara 128 000 tokens, dato no confirmado tras el ajuste |
| Tipos de cuantizacion | no se publican pesos cuantizados en el repositorio; el modelo base era una version bnb-4bit (4 bits) y los pesos fusionados se distribuyen en safetensors, lo que corresponde aproximadamente a 16 bits por parametro segun el tamano del repositorio (6,4 GB) |
| Idiomas soportados | en (ingles), unico idioma declarado |
| Licencia | apache-2.0, declarada por el autor; el modelo base esta ademas sujeto a la Llama 3.2 Community License |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | unsloth/Llama-3.2-3B-Instruct-bnb-4bit (a su vez derivado de meta-llama/Llama-3.2-3B-Instruct) |
| Pipeline | text-generation |
| Libreria | transformers |
| Tamano del repositorio | 6,4 GB |
| Fecha de publicacion | 11 de septiembre de 2026 (fecha registrada en HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo Llama 3.2 con 3,21 mil millones de parametros, atencion con consultas agrupadas (GQA) y codificacion posicional rotatoria (RoPE) propias de esa familia. No hay ningun dato en la informacion disponible que indique cambios estructurales, atencion lineal, mezcla de expertos ni decodificacion especulativa. El proceso descrito en la model card es un ajuste fino supervisado (SFT) sobre una version previamente cuantizada a 4 bits del modelo instruct, usando Unsloth y TRL, con posterior fusion de los adaptadores en los pesos ("merged"). El unico dato cuantitativo publicado por el autor es la afirmacion de que el entrenamiento fue dos veces mas rapido gracias a Unsloth.

No se documenta el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni los hiperparametros empleados. Tampoco se especifica que tarea concreta cubre el ajuste pese a que el nombre del repositorio incluye "rag" y "sft", lo que sugiere un entrenamiento orientado a generacion aumentada por recuperacion, pero es una inferencia del nombre y no un dato confirmado por la ficha. Un punto tecnico relevante es que el ajuste se hizo sobre pesos de 4 bits y la fusion se guardo en safetensors de mayor precision: ese recorrido (cuantizar, ajustar, fusionar) puede introducir una discrepancia entre el comportamiento del adaptador entrenado y el de los pesos finales.

## Capacidades

- Generacion de texto y dialogo conversacional en ingles, heredadas del modelo base Llama-3.2-3B-Instruct.
- Seguimiento de instrucciones de complejidad baja y media, propio de un modelo de 3,21 mil millones de parametros.
- Generacion augmentada por recuperacion: el nombre del modelo apunta a un ajuste para responder sobre contexto recuperado, aunque no se documenta ni se evalua.
- Generacion de codigo y tareas basicas de matematicas: capacidad limitada por el tamano; no hay evaluacion que la respalde.
- Escritura de resumenes, reformulacion y clasificacion de texto corto o medio.
- Tool calling / function calling: el modelo base de Meta declara soporte, pero esta ficha no lo confirma y el ajuste supervisado pudo haber degradado esa capacidad.
- Razonamiento multi-paso y uso como agente: no disponible, sin evaluacion publicada.
- Capacidades multilingues: no disponibles; la ficha solo declara ingles, pese a que el modelo base cubre varios idiomas.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponibles.

## Casos de uso

- Generacion aumentada por recuperacion en ingles: dado que el nombre del repositorio apunta a un ajuste SFT para RAG, el uso natural es insertar fragmentos recuperados de una base documental en el prompt y pedir respuestas fundamentadas. Requiere validacion previa, porque no hay evaluacion publicada.
- Extraccion de informacion y clasificacion en pipelines de documentos: el modelo puede etiquetar, resumir o extraer campos de textos cortos en ingles, ejecutandose en local a bajo coste.
- Asistente interno de bajo coste: con 3,21 mil millones de parametros cabe en una GPU de consumo, por lo que puede desplegarse como asistente en una red interna sin enviar datos a terceros.
- Prototipado e investigacion en una sola maquina: sirve como banco de pruebas para comparar estrategias de prompting, RAG o fine-tuning adicional sin depender de APIs externas.
- Punto de partida para nuevo ajuste fino: al ser pequeno y declarar licencia Apache-2.0, es un candidato comodo para aplicar LoRA sobre una tarea concreta y validar el ciclo completo con Unsloth y TRL.
- Generacion de codigo auxiliar: autocompletado de fragmentos, generacion de tests sencillos o explicacion de funciones, siempre con revision humana dado el tamano del modelo.
- Preprocesado de datos sinteticos: generacion de pares pregunta-respuesta en ingles para aumentar un corpus de entrenamiento, con filtrado posterior por calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se han encontrado terceros que hayan evaluado el modelo. No se deben extrapolar cifras del modelo base al resultado de este ajuste.

## Requisitos de hardware

Todas las cifras de VRAM son estimaciones derivadas del numero de parametros (3,21 mil millones) y del tamano del repositorio; no proceden de mediciones publicadas del autor.

- Pesos en safetensors a ~16 bits: aproximadamente 6,4 GB solo de pesos, mas la cache KV. En la practica, unos 8-10 GB de VRAM para contextos moderados.
- Cuantizacion a 8 bits: alrededor de 3,5 GB de pesos; viable en GPUs de 6-8 GB.
- Cuantizacion a 4 bits: alrededor de 2 GB de pesos; viable en GPUs de 4-6 GB, con degradacion de calidad respecto a los pesos publicados.
- Cabe en GPU de consumo: si. RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 funcionan con holgura en 16 bits; en 8 GB conviene cuantizar.
- GPUs de datacenter: A100, H100 o L40S no aportan ventaja relevante por VRAM, pero si en throughput mediante batching con vLLM o TGI.
- Opciones de despliegue: transformers (formato publicado), TGI (la ficha incluye la etiqueta text-generation-inference), vLLM, y llama.cpp u Ollama previa conversion a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de sus fichas publicas y conviene verificarlos en la fuente original. La columna de rendimiento se deja como no disponible porque este ajuste no tiene ninguna evaluacion publicada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| canopus77/slm-rag-sft-merged | 3,21 mil millones | no confirmado (el base declara 128 000) | apache-2.0 declarada, con las condiciones del base Llama | HuggingFace, 0 descargas | no disponible |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128 000 tokens declarados por Meta | Llama 3.2 Community License | HuggingFace, ampliamente usado | no comparable directamente; es el modelo de partida |
| Qwen/Qwen2.5-3B-Instruct | 3,09 mil millones | 32 768 tokens nativos | Apache-2.0 | HuggingFace | no disponible en esta ficha |
| google/gemma-2-2b-it | 2,61 mil millones | 8 192 tokens | Gemma Terms of Use | HuggingFace | no disponible en esta ficha |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni comparacion con el modelo base, por lo que se desconoce si el ajuste mejora o degrada las capacidades originales.
- Riesgo de alucinacion: inherente a un modelo de 3,21 mil millones de parametros, agravado por la falta de evaluacion y por un posible ajuste orientado a RAG sin verificacion de fidelidad al contexto.
- Sesgos: no documentados. El modelo base Llama 3.2 incorpora los sesgos de sus datos de entrenamiento y el ajuste adicional puede haberlos acentuado sin que exista analisis al respecto.
- Idioma: la ficha declara unicamente ingles. El uso en castellano no esta soportado ni evaluado, y la calidad esperable es baja.
- Restricciones de licencia: el autor declara apache-2.0, pero al derivar de Llama 3.2 la Llama 3.2 Community License sigue aplicandose. Esto implica obligaciones de atribucion ("Built with Llama"), inclusion de una copia de la licencia y condiciones para uso a gran escala. Conviene revisarlo antes de cualquier uso comercial.
- Trazabilidad del entrenamiento: ajustar sobre un modelo cuantizado a 4 bits y fusionar despues los adaptadores puede producir diferencias de comportamiento respecto a lo que se entreno. No hay informacion sobre este extremo.
- Reproducibilidad: no se publican dataset, semilla ni hiperparametros, por lo que el ajuste no es reproducible.
- Madurez: 0 descargas y 0 likes, sin mantenimiento conocido. No es un artefacto con soporte comunitario.
- Contexto: no se confirma que la ventana de 128 000 tokens del modelo base se mantenga tras el ajuste; usar contextos muy largos sin validacion es arriesgado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canopus77/slm-rag-sft-merged
- Modelo base inmediato: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Licencia Llama 3.2 Community License: https://www.llama.com/llama3_2/license/
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a servicios meteorologicos y no se han incluido.
