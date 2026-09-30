# OliviaRossi/MiMo-Negentropy-9B-AGSI-GGUF

## Resumen

MiMo-Negentropy-9B-AGSI-GGUF es un modelo de lenguaje de 8.953.803.264 parametros (unos 8,95 mil millones) publicado por el usuario OliviaRossi en Hugging Face. No es un modelo entrenado desde cero, sino una fusion (merge) de dos modelos de la misma escala: XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, orientado a ingenieria de software y razonamiento destilado, y Jackrong/Negentropy-claude-opus-4.7-9B, orientado a uso autonomo de terminal y agentes de codificacion.

La fusion se ha realizado con la tecnica que el autor denomina AGSI (Adaptive Geodesic Spectral Interpolation), que combina interpolacion SLERP por filas sobre la variedad de pesos, una proteccion contra conflictos en antifase (anti-phase conflict shielding) y una restriccion de invarianza de energia espectral. El objetivo declarado es conservar de forma simultanea las capacidades de razonamiento y de codigo/terminal de ambos progenitores sin que una degrade a la otra.

Este repositorio distribuye los pesos en formato GGUF, con un tamano de repo de 6,5 GB, lo que lo hace directamente ejecutable en llama.cpp y en herramientas compatibles con este formato. Su interes practico reside en ofrecer un modelo de 9B con licencia MIT y etiquetas de uso agentico en un formato listo para inferencia local; sin embargo, la model card no incluye resultados de benchmarks ni detalle del dataset o del proceso de fusion mas alla de la descripcion del metodo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no detallada en la model card; el tag `qwen3_5` y el modelo base indican ascendencia de la familia Qwen) |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95B) |
| Parametros activos | No aplica; la informacion disponible no indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Formato GGUF; los niveles concretos (Q4_K_M, Q5_K_M, Q8_0, etc.) no estan especificados en la informacion disponible |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion de pesos, no de un entrenamiento adicional. Los dos progenitores son XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, descrito como una destilacion avanzada en tareas de ingenieria de software y razonamiento, y Jackrong/Negentropy-claude-opus-4.7-9B, descrito como un agente autonomo de terminal y codificacion. Ambos parten, segun los tags y los nombres, de la familia Qwen, por lo que la arquitectura resultante es un transformer decoder-only de aproximadamente 9B parametros.

La innovacion tecnica declarada es el metodo AGSI, que el autor describe como una interpolacion espectral geodesica adaptativa con tres componentes: SLERP por filas sobre la variedad de pesos, proteccion contra conflictos en antifase para evitar que features opuestas de los dos progenitores se cancelen, y una restriccion de invarianza de energia espectral para preservar la magnitud de las activaciones. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO; al tratarse de un merge, no se anaden datos nuevos. Tampoco se detalla el ratio de mezcla ni las capas afectadas por la interpolacion.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` y pipeline `text-generation`).
- Razonamiento multi-paso (etiqueta `reasoning`, heredada de los progenitores).
- Generacion y asistencia en codigo (etiqueta `coding`).
- Uso de terminal y ejecucion de comandos en entornos de linea de comandos (etiqueta `terminal-use`).
- Flujos agenticos, incluyendo tareas encadenadas (etiqueta `agentic`).
- Multilingue limitado a ingles y chino; no se declara soporte de castellano.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de vision, audio o modo de pensamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de terminal autonomo: el modelo esta etiquetado especificamente para `terminal-use` y `agentic`, de modo que puede emplearse como nucleo de un agente que interpreta objetivos en lenguaje natural y emite comandos de shell en un bucle de observacion-accion, con validacion humana o sandboxing por delante.
- Asistente de programacion en IDE: integrado como backend local mediante llama.cpp, puede completar funciones, explicar fragmentos de codigo y proponer refactorizaciones sin enviar el codigo a un servicio externo, algo relevante para entornos con requisitos de confidencialidad.
- Automatizacion de tareas de CI/CD: dado su perfil de codigo y terminal, puede usarse para generar o reparar scripts de build, interpretar trazas de error y proponer parches que un pipeline aplique y verifique despues con tests.
- Atencion al cliente en ingles o chino: con soporte conversacional y contexto suficiente (longitud no declarada), puede gestionar dialogos multi-turno en esos dos idiomas, aunque no en castellano.
- Procesamiento de documentacion tecnica: resumen, extraccion de pasos de instalacion y traduccion de documentacion entre ingles y chino, aprovechando que son los dos idiomas declarados.
- Despliegue en equipos sin GPU dedicada: al distribuirse en GGUF, puede ejecutarse en CPU con cuantizaciones bajas para tareas de generacion por lotes no interactivas.
- Prototipado e investigacion de merges: sirve como referencia para estudiar el efecto de AGSI frente a otros metodos de fusion, ya que el autor publica variantes hermanas del mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K, SWE-bench ni ninguna otra metrica, y los resultados de busqueda consultados tampoco aportan cifras para este modelo concreto (la referencia de VRAM 19,4 GB de LLM Explorer corresponde al repositorio hermano MiMo-Ornith-9B-AGSI, no a este).

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas de los 8,95B parametros declarados; no proceden de mediciones publicadas para este repositorio.

- Inferencia en FP16: en torno a 18 GB de VRAM, por lo que requiere GPU de 24 GB o superior para caber completa.
- Cuantizacion Q8_0: en torno a 9,5 GB.
- Cuantizacion Q6_K: en torno a 7,3 GB.
- Cuantizacion Q5_K_M: en torno a 6,5 GB (coincide con el tamano total del repositorio, 6,5 GB, aunque el nivel exacto no esta confirmado).
- Cuantizacion Q4_K_M: en torno a 5,5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio con lotes grandes; RTX 4090 o RTX 3090 (24 GB) para FP16 o Q8 con margen; RTX 4080, 4070 Ti Super o 4060 Ti de 16 GB para Q8 y Q4; tarjetas de 8 GB solo con cuantizaciones agresivas (Q4 o inferiores) y contexto reducido.
- Viabilidad en GPU de consumo: si, el modelo cabe en tarjetas de 8-24 GB segun cuantizacion, lo que lo situa en la clase de un solo consumidor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI admiten GGUF con limitaciones; para FP16 conviene usar safetensors del progenitor, no este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, TTFT ni comportamiento con procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OliviaRossi/MiMo-Negentropy-9B-AGSI-GGUF | 8,95B | no disponible | MIT | GGUF | Fusion AGSI de los dos progenitores; objeto de esta ficha |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | aproximadamente 9B | no disponible | no disponible | no disponible | Progenitor centrado en SWE y razonamiento destilado |
| Jackrong/Negentropy-claude-opus-4.7-9B | aproximadamente 9B | no disponible | no disponible | no disponible | Progenitor centrado en terminal y agente de codificacion |
| OliviaRossi/MiMo-Ornith-9B-AGSI | aproximadamente 9B | no disponible | MIT segun el listado de Hugging Face | safetensors y GGUF | Repositorio hermano del mismo autor con el mismo pipeline AGSI; VRAM estimada de 19,4 GB segun LLM Explorer |
| bartowski/OliviaRossi_MiMo-Ornith-9B-AGSI-GGUF | aproximadamente 9B | no disponible | marcado como apache-2.0 en el listado consultado | GGUF | Cuantizaciones de terceros del modelo hermano, no de este repositorio |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparacion se limita a parametros, licencia, formato y procedencia.

## Limitaciones y advertencias

- Al ser un merge y no un modelo entrenado o ajustado con datos nuevos, hereda los sesgos y las carencias de ambos progenitores; no hay evaluacion publicada que cuantifique el resultado de la interpolacion.
- Riesgo de alucinacion estandar en modelos de 9B, especialmente en tareas de codigo y terminal donde una instruccion erronea puede tener consecuencias reales en el sistema.
- No se declara soporte de castellano: los idiomas son ingles y chino, por lo que el rendimiento en espanol sera previsiblemente bajo y no verificado.
- La longitud de contexto no esta especificada; no debe asumirse un contexto largo sin comprobacion previa, sobre todo en flujos agenticos multi-turno.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 2026-09-29, por lo que carece de validacion de la comunidad.
- La licencia es MIT, lo que permite uso comercial y modificacion, pero la licencia de los modelos base no se detalla en la informacion disponible; conviene verificar la de XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B y Jackrong/Negentropy-claude-opus-4.7-9B antes de un despliegue comercial.
- Los pesos en GGUF introducen perdida de calidad respecto a FP16, mas acusada en cuantizaciones de 4 bits.
- No se documentan herramientas de evaluacion de seguridad ni filtros de contenido; en usos agenticos conviene ejecutar el modelo en sandbox y con revision humana de las acciones.
- El autor publica variantes "abliterated" (sin rechazo) de modelos relacionados; no se indica que este repositorio lo sea, pero conviene confirmar el comportamiento de rechazo antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OliviaRossi/MiMo-Negentropy-9B-AGSI-GGUF
- Modelo base 1: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo base 2: https://huggingface.co/Jackrong/Negentropy-claude-opus-4.7-9B
- Repositorio hermano en safetensors: https://huggingface.co/OliviaRossi/MiMo-Ornith-9B-AGSI
- Repositorio hermano en GGUF: https://huggingface.co/OliviaRossi/MiMo-NeoHorse-9B-AGSI-GGUF
- Variante sin rechazo (relacionada): https://www.abliteratedmodels.org/mimo-ornith-9b-agsi-abliterated-hq/
- Ficha de terceros con estimacion de VRAM: https://llm-explorer.com/model/OliviaRossi%2FMiMo-Ornith-9B-AGSI,15xF4U3FsNQRhcJCQf5lft
- Cuantizaciones de terceros del modelo hermano: https://huggingbay.xyz/artifact/hf-model-bartowski-oliviarossi-mimo-ornith-9b-agsi-gguf
