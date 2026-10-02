# minas2025/Qwen-3.5-4B-RP-Finetune

## Resumen

Qwen-3.5-4B-RP-Finetune es un ajuste fino por LoRA orientado a roleplay sobre el modelo comunitario DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark, publicado por el usuario minas2025. El objetivo declarado es generar prosa de rol con estilo novelesco (parrafos descriptivos, narracion de escenas y acciones alrededor del dialogo), mantener la persona del personaje y eliminar el tono de "asistente servicial", heredando ademas el caracter sin censura del modelo base para seguir tramas maduras sin romper el personaje.

Tecnicamente se trata de un modelo denso de 4.205.751.296 parametros (aproximadamente 4,2 B), entrenado con QLoRA de 4 bits (rango 16, alpha 16, dropout 0, todas las capas lineales) durante 1.000 pasos con longitud de contexto 2048 sobre el dataset Chaser-cz/sonnet35-charcard-roleplay-sharegpt en formato ShareGPT. El entrenamiento se realizo en una unica GPU AMD Radeon RX 6700 XT de 12 GB bajo ROCm, con una perdida final de aproximadamente 1,06 (suavizada 1,29) y unas 1 h 42 m de computo total.

Su relevancia es acotada pero clara: es un ejemplo de ajuste fino de rol reproducible en hardware de gama media de consumo, distribuido ya fusionado y cuantizado a GGUF para ejecutarse en llama.cpp, LM Studio, KoboldCpp y backends de SillyTavern. El repositorio no tiene descargas ni "likes" en el momento de la consulta, la licencia no esta declarada y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; la cadena de modelos base y el recuento de parametros (4,2 B) apuntan a un transformer denso, sin evidencia de MoE en la informacion disponible |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | 2048 durante el entrenamiento; el autor recomienda 4096-8192 en inferencia. Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | GGUF; se distribuye Q8_0 (aproximadamente 4,5 GB) y un proyector multimodal F16 mmproj (aproximadamente 0,7 GB) |
| Idiomas soportados | El tag de la model card indica "en" (ingles); el resto de idiomas no esta declarado. Idiomas del modelo base: no disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (modelo fusionado y convertido con llama.cpp a partir del ajuste LoRA) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion proporcionada. Se sabe que el modelo base es un derivado comunitario sin censura denominado Qwen3.5-4B, con 4,2 B de parametros totales, lo que encaja con un transformer denso de tipo decoder-only y no con un esquema de mezcla de expertos. El ajuste se aplico mediante QLoRA de 4 bits con rango 16, alpha 16, dropout 0 y todas las capas lineales como objetivo, sobre 1.000 pasos con tamano de lote 1 y acumulacion de gradiente 1, longitud de contexto 2048, tasa de aprendizaje 8e-5 con programacion coseno y calentamiento, optimizador AdamW de 8 bits y decaimiento de pesos de 0,001. La perdida final reportada es de aproximadamente 1,06 (1,29 suavizada).

El dataset de entrenamiento es Chaser-cz/sonnet35-charcard-roleplay-sharegpt, en formato ShareGPT y centrado en tarjetas de personaje y conversaciones de rol. No se documenta el numero de tokens ni la composicion exacta del corpus, ni si hubo etapas de RLHF o DPO. El autor describe el ajuste como "de toque ligero", pensado para preservar el conocimiento general y la capacidad de conversacion del modelo base, y senala que no se aplicaron tecnicas de decodificacion especulativa ni innovaciones de atencion. La fusion de adaptadores y la conversion a GGUF se hicieron con Unsloth Studio y llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles orientada a rol y escritura creativa, con prosa descriptiva tipo novela.
- Adopcion sostenida de personaje (persona) a partir de una tarjeta de personaje o un escenario aportado en el prompt.
- Narracion de escenas: acciones, entorno y descripcion alrededor del dialogo, en lugar de respuestas escuetas de asistente.
- Continuidad de tramas maduras, oscuras o NSFW sin rechazos ni advertencias dentro de la escena, segun el autor, por herencia del modelo base sin censura.
- Conservacion del conocimiento general y de la capacidad de chat del modelo base, atribuida al ajuste ligero de 1.000 pasos.
- Soporte multimodal condicional: el repositorio incluye un proyector de vision (mmproj en F16) que se puede usar con llama-mtmd-cli, aunque el autor lo senala como opcional y prescindible para uso solo de texto. El alcance real de la vision depende del modelo base y no esta documentado.
- Tool calling y function calling: no disponibles / no documentados.
- Comportamiento de agente y razonamiento multi-paso: no disponible / no documentado.
- Capacidades multilingues: no declaradas; el unico idioma etiquetado es el ingles.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Roleplay conversacional local con tarjetas de personaje: el modelo se alimenta de una ficha de personaje y un escenario al inicio de la sesion y mantiene la persona a lo largo de la conversacion, con un estilo descriptivo adecuado para frontends como SillyTavern a traves de llama-server.
- Escritura creativa asistida y generacion de escenas narrativas: util para redactar dialogos con narracion intercalada, ya que el ajuste esta entrenado sobre corpus de rol en prosa y no sobre respuestas de asistente.
- Prototipado de personajes para videojuegos o ficcion interactiva: permite iterar rapidamente sobre voces y personalidades distintas sin coste de API, ejecutando el Q8_0 en un equipo de consumo.
- Pruebas de investigacion sobre ajuste fino con QLoRA: el repositorio documenta de forma completa hiperparametros, dataset, hardware y perdida, por lo que sirve como referencia reproducible de un pipeline Unsloth mas llama.cpp en una GPU AMD de 12 GB.
- Generacion de contenido narrativo maduro en entornos cerrados: al no incluir rechazos, encaja en proyectos de ficcion adulta o de terror donde otros modelos interrumpen la escena; requiere control de acceso y moderacion propia.
- Despliegue de bajo coste en local para un unico usuario o un grupo reducido: el archivo Q8_0 de aproximadamente 4,5 GB cabe en GPUs de 8-12 GB y no necesita infraestructura en la nube.
- Base para nuevos ajustes de rol: al estar fusionado y en GGUF, no es el punto de partida ideal para reentrenar, pero el adaptador original y el modelo base si permiten derivar variantes con otros datasets de personajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de rol, y tampoco se han encontrado datos externos. El unico dato cuantitativo de entrenamiento es la perdida final de aproximadamente 1,06 (1,29 suavizada) tras 1.000 pasos.

## Requisitos de hardware

- VRAM estimada para el archivo distribuido: el Q8_0 ocupa aproximadamente 4,5 GB en disco, por lo que la inferencia con contexto moderado se situa en torno a 5-6 GB de VRAM, cifra estimada a partir del tamano del archivo y no confirmada por el autor.
- El proyector de vision anade aproximadamente 0,7 GB si se usa la modalidad multimodal.
- GPU validadas por el autor para el entrenamiento: AMD Radeon RX 6700 XT de 12 GB con ROCm. No se documentan pruebas de inferencia en otras GPU.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 3070/4060 Ti 8 GB, RX 6700 XT). Con cuantizaciones menores a Q8_0, no incluidas en el repositorio, podria caber en 6 GB, aunque esas cuantizaciones no estan publicadas.
- Opciones de despliegue documentadas: llama.cpp (llama-cli con `--jinja`, llama-server y llama-mtmd-cli para vision), LM Studio y KoboldCpp; compatible como backend de SillyTavern mediante llama-server en el puerto 8080. No se mencionan vLLM, TGI ni Ollama.
- Parametros de generacion recomendados por el autor: contexto de 4096 a 8192, temperatura 0,8-1,0 (0,85 como valor por defecto razonable) y penalizacion por repeticion de 1,10-1,15.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de licencia para establecer una comparacion cuantitativa con alternativas. La comparacion se limita a los datos estructurales conocidos de este modelo; el resto de celdas quedan como no disponibles porque no se ha encontrado informacion fiable en la busqueda web realizada.

| Modelo | Parametros | Contexto | Formato | Licencia | Benchmarks |
|---|---|---|---|---|---|
| minas2025/Qwen-3.5-4B-RP-Finetune | 4,2 B | 2048 en entrenamiento; 4096-8192 recomendado | GGUF (Q8_0) | No disponible | No publicados |
| DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark (modelo base) | Aproximadamente 4,2 B | No disponible | Safetensors (segun el nombre del repo) | No disponible | No disponible |
| Otras alternativas de rol de 4-8 B en GGUF | No disponible | No disponible | GGUF | No disponible | No disponible |

## Limitaciones y advertencias

- La licencia no esta declarada, ni en el repositorio ni en la informacion disponible. Esto impide determinar si el uso comercial esta permitido y constituye un riesgo legal directo para cualquier despliegue en produccion.
- El modelo hereda el caracter sin censura del modelo base y, segun el autor, no aplica rechazos ni advertencias durante la escena. Puede generar contenido violento, sexual o potencialmente danino sin filtros. Requiere moderacion externa y control de acceso si se expone a terceros.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual. Un ajuste de rol de 1.000 pasos sobre un modelo de 4,2 B prioriza la coherencia narrativa sobre la exactitud, por lo que no es adecuado como fuente de informacion.
- El ajuste se realizo con longitud de contexto 2048. Aunque el autor recomienda 4096-8192 en inferencia, no hay evidencia de que el modelo mantenga calidad mas alla de la ventana vista durante el entrenamiento; es probable degradacion de coherencia en contextos largos.
- Idioma: la model card solo etiqueta ingles. El comportamiento en castellano no esta documentado ni evaluado y probablemente sea inferior.
- Capacidades limitadas fuera del rol: no hay soporte documentado de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento. El autor indica que el conocimiento general se preserva, pero sin mediciones.
- Trazabilidad dudosa de la cadena de modelos base: el modelo base es un derivado comunitario sin censura y no hay documentacion tecnica oficial asociada a la denominacion Qwen3.5-4B en la informacion proporcionada. Conviene verificar el origen de los pesos y los datos de entrenamiento antes de cualquier uso serio.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes), sin validacion de terceros ni reportes de uso.
- El soporte multimodal depende de un archivo mmproj opcional cuyo alcance real no esta descrito; no debe asumirse vision funcional sin probarla.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces obtenidos eran contenido para adultos sin relacion con el repositorio, por lo que se han descartado y no se incluyen.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/minas2025/Qwen-3.5-4B-RP-Finetune
- Modelo base: https://huggingface.co/DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark
- Dataset de entrenamiento: https://huggingface.co/datasets/Chaser-cz/sonnet35-charcard-roleplay-sharegpt
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
