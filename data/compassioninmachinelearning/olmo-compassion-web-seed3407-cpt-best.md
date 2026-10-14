# CompassioninMachineLearning/olmo-compassion-web-seed3407-CPT-best

## Resumen

`CompassioninMachineLearning/olmo-compassion-web-seed3407-CPT-best` es un modelo de lenguaje de ~7.300 millones de parametros publicado por la organizacion CompassioninMachineLearning en Hugging Face. Se trata de un ajuste derivado de la familia OLMo 3 (etiqueta `olmo3` en el repositorio), orientado a lo que el propio nombre indica: alineamiento hacia la "compasion" (`compassion`) mediante una fase de preentrenamiento continuado (`CPT`, continued pre-training) sobre datos de tipo web. El sufijo `best` sugiere que corresponde al mejor checkpoint de la ejecucion, y `seed3407` identifica la semilla de entrenamiento.

El modelo resuelve, en el plano de la investigacion, la necesidad de disponer de pesos abiertos alineados con valores prosociales sobre una base totalmente reproducible como OLMo. Frente a otros ajustes opacos, la familia OLMo publica codigo de entrenamiento, evaluacion e inferencia, lo que permite auditar la cadena completa. El repositorio ocupa 14,6 GB, coherente con pesos en bf16 de 7.298.011.136 parametros.

La relevancia actual es limitada pero concreta: con solo 12 descargas y 0 likes en el momento de la consulta, es un modelo de nicho, sin model card publica, sin licencia declarada y sin idiomas especificados. Encaja como material de investigacion en alineamiento de valores y generacion de datos sinteticos, no como un modelo listo para produccion sin verificacion previa de licencia y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3; detalle exacto no disponible) |
| Parametros totales | 7.298.011.136 (7,298 B) |
| Parametros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repo solo contiene pesos safetensors. Cuantizacion a GGUF/AWQ/GPTQ no confirmada |
| Idiomas soportados | No disponible en la ficha; un repositorio hermano (`olmo-compassion-part1`) declara ingles |
| Licencia | No disponible en este repositorio; un repositorio hermano de la misma organizacion declara Apache 2.0 |
| Formato de pesos | safetensors (bf16, ~14,6 GB) |
| Pipeline declarado | No disponible |
| Tamano del repositorio | 14,6 GB |
| Descargas / likes | 12 / 0 |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

La etiqueta `olmo3` y el recuento de parametros (7,298 B) sitúan al modelo en la linea OLMo 3 de AI2 en su variante de 7B. OLMo es un proyecto de modelos de lenguaje totalmente abiertos: AI2 publica los pesos, el codigo de entrenamiento, los datos (mezcla de web curada, codigo, libros y texto cientifico, deduplicada y filtrada por calidad) y las recetas de evaluacion. Este repositorio concreta esa base con una fase adicional de preentrenamiento continuado (`CPT`) sobre datos de tematica "web" y un posterior ajuste orientado a compasion, presumiblemente mediante LoRA, a juzgar por los repositorios hermanos de la misma organizacion (por ejemplo, `olmo-compassion-midtrain-seed1-CPT-best`, descrito como "merged bf16 model" a partir de un checkpoint LoRA).

No hay informacion publica en los datos proporcionados sobre el numero de tokens de la fase CPT, la composicion exacta del dataset de compasion, ni si hubo RLHF, DPO o alguna variante de preferencia. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias de la arquitectura OLMo 3. El dato mas concreto disponible en la busqueda web corresponde a un repositorio hermano distinto: el checkpoint 750 de la ejecucion `midtrain-seed1` alcanzo una perdida de validacion de 1,6496, continuando el entrenamiento hasta el paso 1500. Ese valor no es extrapolable a este repositorio, pero da una referencia del orden de magnitud de las perdidas manejadas en esta familia de ajustes.

## Capacidades

- Generacion de texto conversacional: la organizacion etiqueta sus repositorios hermanos con `conversational` y `text-generation-inference`, lo que apunta a un modelo afinado para dialogo.
- Alineamiento hacia compasion: el eje del ajuste es producir respuestas empaticas y prosociales, no necesariamente maximizar capacidades de razonamiento.
- Generacion de codigo y matematicas: heredadas de la base OLMo 3, aunque no verificadas ni documentadas en este repositorio concreto. No disponible.
- Tool calling / function calling: no disponible; no se documenta soporte explicito.
- Agentes y razonamiento multi-paso: no disponible; no se documenta modo de pensamiento ni capacidades agenticas.
- Capacidades multilingues: no disponible en esta ficha; un repositorio hermano declara ingles, por lo que se debe asumir un rendimiento principal en ingles salvo verificacion.
- Vision o audio: no disponible; no hay indicios de modalidades adicionales.
- Compatibilidad de despliegue: la organizacion usa `transformers`, `safetensors` y `text-generation-inference` en repositorios hermanos, y al menos un modelo de la familia aparece listado en FriendliAI para inferencia gestionada.

## Casos de uso

- Investigacion en alineamiento de valores: usar el modelo como sujeto de estudio para medir si el ajuste CPT produce respuestas mas empaticas que la base OLMo 3 y con que coste en capacidades generales, comparando checkpoints `best` frente a `final`.
- Generacion de datos sinteticos de dialogo empatico: emplear el modelo para producir respuestas de referencia en dominios de apoyo emocional, que despues se filtren y se usen como datos de preferencia en RLHF o DPO.
- Evaluacion de sesgo y seguridad en modelos pequenos: analizar sistematicamente como un ajuste de valores sobre 7,3 B parametros altera la tasa de respuestas inseguras y la diversidad lexica.
- Prototipado de asistentes conversacionales de bienestar: en entornos de laboratorio y con supervision humana, generar primeras versiones de respuestas de escucha activa antes de pasar a un modelo con licencia clara.
- Destilacion hacia modelos menores: usar este modelo de 7,3 B como profesor para destilar un modelo de 1-3 B especializado en tono empatico, reduciendo costes de inferencia en produccion.
- Reproducibilidad de recetas de preentrenamiento continuado: servir como caso de estudio de un pipeline CPT + LoRA merge sobre OLMo, replicable con la infraestructura abierta de AI2.
- Ajuste posterior de dominio especifico: partir de estos pesos como inicializacion para verticales (educacion, salud no clinica, atencion al cliente) donde el tono importa mas que el razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda no aportan evaluaciones de este repositorio. El unico dato numerico relacionado es la perdida de validacion de 1,6496 en el paso 750 de un repositorio hermano distinto (`olmo-compassion-midtrain-seed1-CPT-best`), que no debe interpretarse como rendimiento de este modelo.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 15-16 GB solo para pesos, mas 1-4 GB de cache KV segun longitud de contexto, situando el total en torno a 17-22 GB.
- VRAM en cuantizacion INT8: aproximadamente 7-8 GB de pesos mas cache KV, total del orden de 10-12 GB.
- VRAM en cuantizacion INT4 (GGUF Q4_K_M o AWQ): aproximadamente 4-5 GB de pesos, total en torno a 6-8 GB.
- GPU consumer compatibles: RTX 4090 y RTX 3090 (24 GB) ejecutan bf16 con contexto moderado; RTX 4080, RTX 4070 Ti Super y RTX 4060 Ti de 16 GB quedan justas en bf16 y holgadas en INT8/INT4; GPUs de 8-12 GB requieren cuantizacion INT4.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S son adecuadas para bf16 con lotes grandes y contextos largos.
- Opciones de despliegue: vLLM y TGI para serving de alto rendimiento (la organizacion usa TGI en repositorios hermanos); llama.cpp y Ollama requieren conversion previa a GGUF, ya que el repositorio solo publica safetensors; transformers para uso puntual; FriendliAI como alternativa gestionada, dado que la familia aparece listada en ese proveedor.
- Latencia y throughput: no disponibles. Sin datos de benchmarks ni de configuracion de serving no es posible estimar tokens por segundo con rigor.
- Nota sobre el formato: al no incluir GGUF, el despliegue en llama.cpp u Ollama exige un paso de conversion y, opcionalmente, de cuantizacion a cargo del usuario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| olmo-compassion-web-seed3407-CPT-best | 7,298 B | No disponible | No disponible | Hugging Face, 12 descargas | Ajuste de compasion sobre OLMo 3, sin model card |
| OLMo 3 7B (AI2) | ~7 B | No disponible en esta busqueda | Apache 2.0 (familia OLMo) | Hugging Face, GitHub allenai/OLMo | Base totalmente abierta con datos, codigo y evaluacion publicados |
| Llama 3.1 8B | 8,03 B | 128.000 tokens | Licencia comunitaria de Meta | Amplia | Referencia de facto en la categoria 8B, con soporte de tool calling |
| Mistral 7B | 7,24 B | 32.000 tokens | Apache 2.0 | Amplia | Modelo abierto consolidado, muy desplegado en vLLM y llama.cpp |
| Qwen2.5 7B | 7,62 B | 128.000 tokens | Apache 2.0 (variante base) | Amplia | Multilingue y con buen rendimiento en codigo y matematicas |

Las cifras de contexto y licencia de las alternativas provienen de sus especificaciones publicas habituales; no se han verificado en esta busqueda para OLMo 3 7B en concreto, por lo que se marcan como no disponibles cuando no hay confirmacion.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia. Aunque repositorios hermanos de la misma organizacion usan Apache 2.0, no se puede asumir que este la herede. No usar en produccion ni en productos comerciales sin confirmacion explicita del autor.
- Ausencia de model card: no hay documentacion de datos de entrenamiento, hiperparametros, composicion del dataset ni evaluaciones. Esto impide auditar sesgos y calidad.
- Riesgo de alucinacion: inherente a cualquier modelo de 7B y agravado por la falta de evaluacion publicada; no hay datos que permitan acotarlo.
- Sesgos conocidos: no disponibles. El ajuste hacia "compasion" puede introducir sesgos de tono (respuestas excesivamente complacientes o evasivas) y degradar la precision en tareas factuales, pero no hay mediciones.
- Idiomas: no confirmados para este repositorio. Un modelo hermano declara ingles, por lo que el castellano y otras lenguas podrian rendir de forma claramente inferior.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin verificarla experimentalmente.
- Trazabilidad limitada: solo 12 descargas y 0 likes, sin comunidad que valide el modelo; no hay terceros que hayan reportado resultados.
- Uso en salud mental: dado el enfoque en compasion, existe riesgo de que se emplee en contextos clinicos o de crisis. Un modelo sin evaluacion de seguridad no es adecuado para esos escenarios bajo ninguna circunstancia.
- Fecha de publicacion atipica (2026-10-14) respecto al resto del ecosistema; conviene verificar la procedencia y el estado del repositorio antes de integrarlo en cualquier pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CompassioninMachineLearning/olmo-compassion-web-seed3407-CPT-best
- Repositorio hermano olmo-compassion-part1: https://huggingface.co/CompassioninMachineLearning/olmo-compassion-part1
- Repositorio hermano olmo-compassion-midtrain-seed1-CPT-best: https://huggingface.co/CompassioninMachineLearning/olmo-compassion-midtrain-seed1-CPT-best
- Pagina de OLMo en AI2: https://allenai.org/olmo
- Repositorio de codigo de OLMo: https://github.com/allenai/OLMo
- Ficha de despliegue en FriendliAI (modelo relacionado): https://friendli.ai/models/CompassioninMachineLearning/Olmo7b-compassion-seed1-20260930-CPT-final
