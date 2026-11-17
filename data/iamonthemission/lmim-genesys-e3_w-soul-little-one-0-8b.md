# iamonthemission/LMIM.Genesys-e3_w-soul-little-one-0.8B

## Resumen

LMIM · Genesys e3 · little one · 0.8B es un modelo de lenguaje de pequeno tamano (752.393.024 parametros reales segun los pesos en safetensors) publicado por el usuario iamonthemission bajo el paraguas del proyecto LMIM (Lean Mean Inference Machine). Se presenta como un fine-tune ligero del modelo Genesys e · Lofty 0.8B, que a su vez deriva de una base Qwen3.5 0.8B. El foco declarado del modelo no es el rendimiento en tareas genericas, sino la identidad, la coherencia conversacional, la personalidad y la continuidad de "soul" (persona) entre versiones.

La relevancia practica del modelo reside en su huella: un unico fichero GGUF Q8_0 de 0.81 GB que puede ejecutarse en CPU, lo que lo situa en la categoria de modelos locales para prototipado rapido, asistentes embebidos y experimentacion con personalidad conversacional. El autor lo etiqueta explicitamente como experimental, y la model card incide en que "the model isn't the product, the continuity is", es decir, el interes esta en el linaje de fine-tunes sucesivos mas que en capacidades aisladas.

No se han publicado datos sobre composicion del dataset, longitud de contexto, idiomas soportados ni resultados de benchmarks en la informacion disponible. La model card es deliberadamente escueta y se centra en instrucciones de ejecucion con llama.cpp, verificacion de hash y enlaces al ecosistema del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5 0.8B; detalles no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 0.8 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune ligero sobre Genesys e · Lofty 0.8B, que segun el linaje declarado por el autor desciende de Qwen3.5 0.8B (v2, agosto de 2026) y se actualiza en noviembre de 2026 como Genesys e3 · little one. La model card no detalla la arquitectura interna mas alla de la herencia de la base Qwen3.5, por lo que se asume un transformer decoder-only estandar, aunque no se confirman numero de capas, dimensiones ocultas ni mecanismos de atencion especificos.

No se especifica el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT con datos de personalidad. La unica informacion tecnica concreta es que se trata de un "light fine-tune" orientado a identidad y continuidad conversacional, y que el artefacto distribuido es un GGUF Q8_0 generado para llama.cpp. La ausencia de safetensors publicados en el repo (aunque el dato de parametros proviene de ellos) limita la inspeccion de los pesos originales.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis declarado en coherencia y continuidad de personaje.
- Mantenimiento de una identidad estable ("soul") a lo largo de la conversacion, segun la intencion del autor.
- Ejecucion en CPU y en hardware de bajos recursos gracias al formato GGUF Q8_0.
- Compatibilidad con runtimes GGUF (llama.cpp y derivados) y con la API de conversacion de llama.cpp (`--conversation`, `--jinja`).
- Soporte de parametros de muestreo avanzados en llama.cpp: `--temp`, `--top-p`, `--min-p`, `--repeat-penalty`, `--repeat-last-n`.
- Modo "reasoning" configurable en llama.cpp (`--reasoning off`, `--reasoning-budget`), aunque la model card recomienda desactivarlo.
- Tool calling / function calling: no disponible en la informacion.
- Capacidades de agente o multi-step reasoning: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Vision, audio u otras modalidades: no disponible en la informacion.

## Casos de uso

- Asistentes conversacionales locales en CPU: el modelo cabe en 0.81 GB y puede ejecutarse con llama.cpp en portatiles sin GPU, lo que permite desplegar un chatbot de personaje fijo en entornos sin acelerador.
- Prototipado de personajes y "souls" consistentes: util para experimentar con tecnicas de continuidad de identidad entre versiones de un mismo fine-tune, que es precisamente el eje del proyecto Genesys.
- Juguetes conversacionales y demos offline: al no requerir red ni GPU, encaja en demos de feria, talleres o entornos air-gapped donde se quiere mostrar un modelo conversacional sin infraestructura.
- Pruebas de integracion con llama.cpp: sirve como modelo de referencia pequeno para validar pipelines de inferencia, flags de conversacion y plantillas Jinja antes de escalar a modelos mayores.
- Educacion e investigacion sobre fine-tuning: al ser un fine-tune ligero con linaje documentado, permite estudiar como cambios pequenos en el entrenamiento afectan a la personalidad y coherencia en modelos de menos de 1B.
- Experimentacion con cuantizacion y despliegue: util para medir latencia y consumo en CPU con Q8_0 y comparar con otras cuantizaciones si el autor las publica en el futuro.
- Base para fine-tunes derivados: al estar bajo Apache 2.0, puede servir como punto de partida para ajustes posteriores en proyectos que necesiten un modelo conversacional minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en Q8_0 (fichero de 0.81 GB mas overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo esta pensado para ejecutarse incluso sin GPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1050, RTX 3050, RTX 4090, etc.), y tambien en CPU-only.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extension cualquier runtime compatible con GGUF (Ollama, LM Studio, etc., aunque no se confirman en la model card).
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 0.8B en Q8_0, se espera una latencia baja en CPU moderna, pero no hay cifras publicadas.
- Parametros de ejecucion recomendados por el autor: `-ngl 99`, `--jinja`, `--conversation`, `--temp 0.7`, `--top-p 0.9`, `--min-p 0.05`, `--repeat-penalty 1.12`, `--repeat-last-n 256`, `--reasoning off`, `--reasoning-budget 1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LMIM · Genesys e3 · little one 0.8B | 752 M | no disponible | Apache 2.0 | GGUF Q8_0 | Fine-tune de personalidad, experimental |
| Genesys e · Lofty 0.8B (modelo base) | no disponible | no disponible | no disponible | no disponible | Base directa del fine-tune |
| Qwen3.5 0.8B (linaje declarado) | no disponible | no disponible | no disponible | no disponible | Base original del linaje |
| Otros modelos ~1B de la categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

No se dispone de datos de rendimiento, contexto ni licencia de los modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo marcado explicitamente como experimental por el autor; no debe asumirse estabilidad en produccion.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad, razonamiento o codigo.
- No se especifican sesgos conocidos, pero al derivar de Qwen3.5 y de un fine-tune de personalidad, puede heredar sesgos de la base y del dataset de ajuste, que no se documenta.
- Riesgo de alucinacion: alto en modelos de este tamano y sin datos de evaluacion; no hay mitigaciones documentadas.
- Limitaciones de contexto e idioma: no disponibles; no se confirma soporte multilingue ni longitud de ventana.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el modelo es experimental.
- Un unico fichero GGUF Q8_0: no hay otras cuantizaciones publicadas, lo que limita el ajuste fino de memoria/velocidad.
- El enfasis en "identidad" y "soul" es una decision de diseno del autor, no una capacidad verificada de forma independiente.
- La fecha de creacion (noviembre de 2026) y el linaje Qwen3.5 deben tratarse como datos declarados por el autor, no verificados de forma externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamonthemission/LMIM.Genesys-e3_w-soul-little-one-0.8B
- Modelo base: https://huggingface.co/iamonthemission/LMIM.Genesys-e_w-soul-Lofty-0.8B
- Pagina del proyecto Genesys: https://lmim.tech/GenesysAI
- Repositorio del proyecto: https://github.com/leanmeaninferencemachine/leanmeaninferencemachine
- Todos los modelos del autor: https://huggingface.co/iamonthemission
- Imagen del proyecto: https://huggingface.co/iamonthemission/LMIM.Genesys-e_w-soul-2b/resolve/main/gen.png
