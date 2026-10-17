# Costume/christAIn-uncensored-Q4_0-GGUF

## Resumen

Costume/christAIn-uncensored-Q4_0-GGUF es una conversion a formato GGUF del modelo Emmet-Allen/christAIn-uncensored, un ajuste fino de tipo LoRA/SFT sobre dphn/Dolphin3.0-Qwen2.5-0.5B, que a su vez deriva de la familia Qwen2.5. El repositorio lo publica el usuario Costume y contiene un unico archivo cuantizado en Q4_0, generado con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai. Se trata, por tanto, de una pieza de distribucion (conversion de formato y cuantizacion), no de un entrenamiento original.

El modelo tiene 494.032.768 parametros (aproximadamente 0,49 mil millones), lo que lo situa en la categoria de modelos ultracompactos para inferencia en CPU, dispositivos de borde y entornos con memoria muy limitada. El repositorio ocupa 0,4 GB. Su interes practico es servir como modelo local de generacion de texto con requisitos minimos de hardware y, por la etiqueta "uncensored", como base sin filtros de alineacion para experimentacion; esa misma caracteristica es su principal riesgo.

La informacion publicada es muy escasa: la model card es una plantilla automatica de conversion a GGUF que remite al modelo original, sin datos de entrenamiento, idiomas, licencia ni evaluaciones. No hay descargas ni "likes" registrados y la unica variante disponible es Q4_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5, inferido de la cadena de modelos base; no confirmado explicitamente en la informacion disponible) |
| Parametros totales | 494.032.768 (aproximadamente 0,49 mil millones, dato real de safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (GGUF); es la unica variante publicada en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (para llama.cpp); el modelo de origen se distribuye como adaptador PEFT/LoRA |
| Tamano del repositorio | 0,4 GB |
| Modelo base | Emmet-Allen/christAIn-uncensored |
| Adaptador de origen | dphn/Dolphin3.0-Qwen2.5-0.5B |
| Libreria declarada | peft (con sft, trl, llama-cpp) |
| Tarea (pipeline) | text-generation |

## Arquitectura y entrenamiento

La cadena de dependencias es: Qwen2.5-0.5B como modelo fundacional, Dolphin3.0-Qwen2.5-0.5B como ajuste posterior, Emmet-Allen/christAIn-uncensored como adaptador LoRA entrenado mediante SFT con la libreria TRL sobre ese segundo modelo, y finalmente esta conversion a GGUF Q4_0. El resultado es un transformer decoder-only de aproximadamente 0,49 mil millones de parametros, con los pesos del adaptador ya fusionados durante la conversion a GGUF.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, modo de razonamiento, etc.). La etiqueta "uncensored" sugiere que el ajuste SFT se realizo sobre datos sin las capas habituales de rechazo y alineacion, pero este extremo no se documenta en el repositorio. La cuantizacion Q4_0 implica una perdida de fidelidad respecto a los pesos originales en precision completa, mas acusada en modelos pequenos.

## Capacidades

- Generacion de texto autoregresiva y conversacion de un solo turno o multiturno, en el rango propio de un modelo de 0,5 mil millones de parametros.
- Ajuste tematico no documentado: el nombre del modelo sugiere un sesgo de contenido especifico, pero no hay descripcion del dominio ni de los datos usados.
- Generacion sin filtros de alineacion, segun la etiqueta "uncensored" del nombre; no hay verificacion publicada de este comportamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (poco realista en este rango de tamano).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Inferencia local en CPU: al ser un modelo de 0,49 mil millones de parametros en Q4_0, se puede ejecutar con llama.cpp en un portatil sin GPU dedicada, con un consumo de memoria por debajo de 1 GB, lo que lo hace util para pruebas de concepto y demos offline.
- Despliegue en dispositivos de borde: encaja en placas tipo Raspberry Pi o mini-PC con pocos recursos, para asistentes de texto simples, generacion de respuestas cortas o interfaces de voz con transcripcion previa.
- Prototipado rapido de pipelines: sirve como sustituto barato de un modelo grande durante el desarrollo de una aplicacion de chat, permitiendo iterar sobre la interfaz y la orquestacion antes de cambiar a un modelo mayor.
- Generacion de texto creativo o de rol sin restricciones: el proposito declarado del ajuste es la ausencia de censura, lo que lo orienta a ficcion, juegos de rol o experimentacion con prompts que otros modelos rechazan; requiere revision humana del contenido.
- Clasificacion y extraccion ligera: tareas de etiquetado, resumen de frases cortas o extraccion de campos a partir de plantillas, siempre que la precision exigida sea baja y se validen las salidas.
- Generacion de datos sinteticos a pequena escala: creacion de variaciones de texto para aumentar un corpus de entrenamiento o probar heuristicas de filtrado, asumiendo una calidad limitada.
- Pruebas de integracion y CI: como modelo de humo en pruebas automatizadas de servidores compatibles con la API de OpenAI (llama-server), por su baja latencia de arranque y su reducido peso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,3-0,5 GB para los pesos en Q4_0 (coherente con un repositorio de 0,4 GB) y aproximadamente 0,6-1,5 GB en total con cache KV para contextos moderados. Estimacion orientativa, no medida por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo esta claramente infrautilizado en GPUs de gama alta.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, e incluso en graficos integrados.
- Ejecucion en CPU: viable y es el escenario natural; tambien en dispositivos ARM de bajos recursos.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server, tal como documenta la model card), Ollama mediante un Modelfile que referencie el GGUF, y cualquier runtime compatible con GGUF. vLLM y TGI no son la via natural para este artefacto cuantizado.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor.

## Comparativa con modelos similares

Datos de los modelos alternativos tomados de su documentacion publica; el contexto del modelo de esta ficha figura como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Costume/christAIn-uncensored-Q4_0-GGUF | 0,49 B | No disponible | No disponible | GGUF Q4_0 | HuggingFace, 0 descargas |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32 768 tokens (documentacion publica) | Apache-2.0 | safetensors, GGUF | Ampliamente disponible |
| SmolLM2-360M-Instruct | 0,36 B | 8 192 tokens (documentacion publica) | Apache-2.0 | safetensors, GGUF | Ampliamente disponible |
| TinyLlama-1.1B-Chat | 1,1 B | 2 048 tokens (documentacion publica) | Apache-2.0 | safetensors, GGUF | Ampliamente disponible |

Frente a estas alternativas, el modelo aqui descrito no aporta datos de rendimiento verificables ni una licencia declarada, y su unica diferencia funcional documentada es el ajuste sin censura.

## Limitaciones y advertencias

- Ausencia de alineacion: la denominacion "uncensored" indica que el ajuste no aplica las capas habituales de rechazo, por lo que puede generar contenido ofensivo, sesgado o peligroso sin advertencia. No es apto para produccion orientada al publico sin un filtro externo.
- Alucinacion: con 0,49 mil millones de parametros, la tasa de invencion de hechos, citas y datos es alta; no debe usarse como fuente de informacion sin verificacion.
- Razonamiento y matematicas: la capacidad de razonamiento multi-paso, calculo y generacion de codigo es muy limitada en este rango de tamano; no hay evaluaciones que la cuantifiquen.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Aunque la familia Qwen2.5 se distribuye bajo Apache-2.0, los pesos del adaptador LoRA y su fusion no declaran licencia en este repositorio, lo que supone un riesgo juridico para cualquier uso en produccion.
- Idiomas no declarados: se desconoce la cobertura linguistica real y el comportamiento en castellano.
- Contexto no declarado: se desconoce la ventana maxima soportada por este ajuste concreto, lo que impide dimensionar la cache KV en despliegues.
- Cuantizacion unica: solo existe Q4_0, que degrada la calidad respecto a los pesos sin cuantizar; no hay variantes Q5, Q8 ni FP16 para comparar.
- Trazabilidad dudosa: el repositorio no incluye informacion sobre datos de entrenamiento, metodologia ni evaluaciones, y la fecha de creacion registrada (2026-10-17) es posterior a la fecha de consulta habitual de estos catalogos, lo que apunta a metadatos poco fiables.
- Validacion de la comunidad nula: cero descargas y cero "likes" en el momento de redactar esta ficha; no hay evidencia externa de funcionamiento correcto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Costume/christAIn-uncensored-Q4_0-GGUF
- Modelo original: https://huggingface.co/Emmet-Allen/christAIn-uncensored
- Adaptador de origen: https://huggingface.co/dphn/Dolphin3.0-Qwen2.5-0.5B
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Paper, blog o demo especificos del modelo: no disponibles. Las busquedas web realizadas no devolvieron resultados relacionados con el modelo; los unicos resultados obtenidos corresponden a comercios de ropa y no son relevantes.
