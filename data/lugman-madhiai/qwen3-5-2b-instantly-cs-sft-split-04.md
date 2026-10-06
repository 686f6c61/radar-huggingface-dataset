# lugman-madhiai/Qwen3.5-2B-Instantly-CS-SFT-Split-04

## Resumen

El modelo `lugman-madhiai/Qwen3.5-2B-Instantly-CS-SFT-Split-04` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-2B`, publicado por el usuario lugman-madhiai bajo licencia Apache 2.0. Segun los metadatos de HuggingFace, la pipeline declarada es `image-text-to-text`, lo que indica que hereda la capacidad multimodal (vision y texto) del modelo base de la familia Qwen3.5. Cuenta con 2.274.069.824 parametros reales (aproximadamente 2,27 mil millones), un tamano que lo situa en la gama de modelos pequenos aptos para inferencia en hardware de consumo.

El entrenamiento se realizo con la libreria Unsloth junto con TRL de HuggingFace, segun declara el propio autor, lo que sugiere un flujo de trabajo de fine-tuning eficiente en memoria. El nombre del repositorio ("Instantly-CS-SFT-Split-04") apunta a un ajuste orientado a un dominio concreto (posiblemente atencion al cliente, "CS") y a que forma parte de una serie de particiones de datos de entrenamiento, siendo esta la particion numero 04.

Se trata de un modelo muy reciente (creado el 5 de octubre de 2026) y con practicamente nula traccion publica en el momento de redactar esta ficha (0 descargas y 0 "likes"). La model card es extremadamente escueta y no aporta datos sobre volumen de entrenamiento, composicion del dataset, hiperparametros ni evaluaciones, por lo que buena parte de sus especificaciones figuran como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (familia Qwen3.5), multimodal imagen-texto segun pipeline declarada |
| Parametros totales | 2.274.069.824 (aproximadamente 2,27 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors) |
| Idiomas soportados | en (solo ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales: tamano del repositorio 4,6 GB; libreria `transformers`; tags `text-generation-inference`, `unsloth`, `qwen3_5`, `conversational`, `endpoints_compatible`.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag `qwen3_5`, que identifica la familia a la que pertenece el modelo base. Se trata por tanto de un transformer derivado de `Qwen/Qwen3.5-2B`, con soporte multimodal segun la pipeline `image-text-to-text`. No se especifica si emplea atencion lineal, decodificacion especulativa, mezcla de expertos u otras innovaciones, ni el numero de tokens de contexto soportados.

En cuanto al entrenamiento, el autor indica unicamente que es un modelo ajustado ("finetuned from model: Qwen/Qwen3.5-2B") entrenado "2x mas rapido" con Unsloth y la libreria TRL de HuggingFace. No se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF o DPO, ni los hiperparametros empleados. El sufijo "SFT" del nombre confirma que se trata de ajuste fino supervisado, y "Split-04" sugiere que el conjunto de datos se dividio en particiones, siendo esta la cuarta.

## Capacidades

- Generacion de texto conversacional en ingles (el tag `conversational` y la pipeline `text-generation-inference` asi lo indican).
- Procesamiento de entradas compuestas de imagen y texto (pipeline `image-text-to-text`), capacidad heredada del modelo base Qwen3.5-2B.
- Ajuste especifico de dominio: el nombre "Instantly-CS" apunta a un entrenamiento orientado a un caso de uso concreto, presumiblemente atencion al cliente.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Atencion al cliente automatizada: dado que el nombre del modelo sugiere un ajuste orientado a "Customer Service" (CS), puede emplearse para gestionar conversaciones de soporte de primer nivel en ingles. No obstante, al no publicarse benchmarks, seria necesario validar su calidad antes de un despliegue real.
- Clasificacion y enrutado de tickets: un modelo de 2,27 B es adecuado para tareas de clasificacion de baja latencia que requieran ejecucion en hardware modesto, pudiendo etiquetar consultas entrantes por categoria o urgencia.
- Extraccion de informacion de imagenes con texto asociado: gracias a la pipeline `image-text-to-text`, puede emplearse para describir capturas, tickets escaneados o documentos con contenido visual, combinando imagen y texto en la misma peticion.
- Prototipado rapido y experimentacion: por su tamano reducido (aproximadamente 4,6 GB en safetensors) es util para iterar en entornos de investigacion con recursos limitados.
- Generacion de respuestas en asistentes conversacionales ligeros: su naturaleza conversacional y su tamano permiten integrarlo en asistentes de bajo coste donde no se requiere un modelo de mayor escala.
- Fine-tuning posterior y destilacion: al ser un checkpoint SFT bajo licencia Apache 2.0, puede servir como punto de partida para ajustes adicionales en dominios especificos o para generar datos sinteticos.
- Procesamiento por lotes en pipelines de datos: puede utilizarse para tareas de anotacion o generacion masiva de texto en ingles sin requisitos de GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp16/bf16) los pesos de 2,27 B ocupan aproximadamente 4,5 GB, a los que hay que sumar memoria para el cache de activaciones y KV. En cuantizacion int8 la estimacion ronda los 2,3 GB y en int4 alrededor de 1,2 GB.
- GPU recomendadas: tarjetas de consumo como la RTX 3060 (12 GB) o superiores bastan para fp16; una RTX 4090 (24 GB) permite margen amplio y mayor tamano de lote. Para despliegues en servidor, A100 o H100 ofrecen holgura considerable para este tamano.
- Compatibilidad con GPU de consumo: si, cabe comodamente en la mayoria de GPU de consumo modernas con 8 GB o mas de VRAM, e incluso en configuraciones de 6 GB mediante cuantizacion.
- Opciones de despliegue: al estar en formato `transformers`/safetensors, es compatible con vLLM, TGI (text-generation-inference) y el propio ecosistema HuggingFace. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion de la que no se aporta informacion.
- Latencia y throughput estimados: no disponible. El autor solo menciona que el entrenamiento fue "2x mas rapido" con Unsloth, dato que se refiere al proceso de ajuste, no a la inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de este modelo, por lo que la comparacion se limita a caracteristicas objetivas. Como alternativas de la misma categoria (modelos pequenos de 1-3 B parametros) pueden considerarse:

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Instantly-CS-SFT-Split-04 | 2,27 B | no disponible | si (image-text-to-text) | apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-2B (modelo base) | ~2 B | no disponible | si (segun pipeline base) | no disponible en esta ficha | HuggingFace |
| Modelos de la gama 2B de otras familias (p. ej. Gemma 2 2B, Llama 3.2 1B/3B) | 1-3 B | 8.000-128.000 tokens segun variante | no (solo texto, salvo variantes especificas) | licencias propias | HuggingFace |

Los datos de rendimiento comparativo entre estas opciones no estan disponibles en la informacion proporcionada, por lo que no puede establecerse una jerarquia de calidad.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan datos de entrenamiento, hiperparametros, composicion del dataset ni evaluaciones, lo que dificulta la reproducibilidad y la evaluacion de riesgos.
- Traccion nula: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- Sesgos conocidos: no disponibles, pero al ser un ajuste sin documentacion de dataset no puede descartarse la presencia de sesgos presentes en los datos de entrenamiento o en el modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin benchmarks ni evaluaciones no puede cuantificarse.
- Limitacion de idioma: solo se declara soporte de ingles (`en`), lo que excluye de facto su uso en castellano u otros idiomas sin una validacion previa.
- Restricciones de licencia: la licencia es apache-2.0, que permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base Qwen3.5-2B, que puede imponer requisitos adicionales.
- Naturaleza "Split-04": al tratarse probablemente de una particion de un entrenamiento mayor, el modelo podria representar una fase intermedia y no un checkpoint final optimizado.
- Contexto maximo desconocido: no se indica la longitud de contexto soportada, lo que impide planificar despliegues con entradas largas.
- Capacidades avanzadas (tool calling, agentes, modo thinking) sin confirmar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-Instantly-CS-SFT-Split-04
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
