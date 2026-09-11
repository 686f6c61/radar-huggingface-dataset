# previesam/Medra-Qwen2.5-1.5B-Medical-GGUF

## Resumen

Medra-Qwen2.5-1.5B-Medical-GGUF es un modelo de lenguaje conversacional de 1.543.714.304 parametros (aproximadamente 1,5 mil millones), publicado por el usuario previesam en Hugging Face. Se distribuye exclusivamente en formato GGUF, cuantizado, y esta pensado para su ejecucion local mediante llama.cpp u Ollama. El nombre sugiere un ajuste fino orientado al dominio medico sobre la familia Qwen2.5, aunque la propia model card no documenta el dataset de entrenamiento ni el procedimiento de ajuste mas alla de indicar que se realizo con Unsloth.

El modelo deriva de la arquitectura Qwen2.5, un transformer decoder-only denso (sin mezcla de expertos), por lo que no dispone de parametros activos separados. La unica variante de pesos publicada segun la model card es `qwen2.5-coder-1.5b-instruct.Q4_K_M.gguf`, un detalle relevante porque apunta a una base de tipo coder y no a un modelo especifico de dominio medico. El repositorio ocupa 2,6 GB y no registra descargas ni valoraciones en el momento de la consulta.

Su relevancia practica es limitada pero concreta: se trata de un modelo pequeno, cuantizado a 4 bits, que cabe en GPUs de consumo e incluso en CPU, lo que lo hace util para prototipos de asistentes conversacionales en entornos con recursos restringidos. No obstante, la ausencia de licencia declarada, de idiomas soportados y de cualquier evaluacion publicada obliga a tratarlo con cautela antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No documentada en la ficha; el modelo base Qwen2.5-1.5B soporta 32.768 tokens nativos (hasta 131.072 con YaRN) |
| Tipos de cuantizacion | Q4_K_M (unico archivo listado en la model card) |
| Idiomas soportados | No disponibles en la ficha; el modelo base Qwen2.5 es multilingue, pero no se confirma para este ajuste |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un transformer decoder-only de la familia Qwen2.5, ajustado y posteriormente convertido a GGUF mediante Unsloth. El autor declara que el entrenamiento fue "2x mas rapido" con dicha herramienta, lo que situa el ajuste en el rango de fine-tuning eficiente (LoRA/QLoRA o similar), pero no se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT supervisado.

El nombre del unico archivo GGUF publicado, `qwen2.5-coder-1.5b-instruct.Q4_K_M.gguf`, indica que la base podria ser Qwen2.5-Coder-1.5B-Instruct y no una variante especializada en medicina. Esta discrepancia entre el nombre del repositorio y el nombre del artefacto no se resuelve en la model card. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional en formato de instrucciones, segun el tag `conversational` del repositorio.
- Generacion de codigo, presumiblemente heredada del modelo base Qwen2.5-Coder, aunque no esta confirmada en la ficha.
- Ejecucion local mediante llama.cpp y Ollama, con soporte de plantillas Jinja (`--jinja`).
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere integracion con APIs tipo OpenAI.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas.
- Capacidades multimodales: no documentadas; la model card menciona el comando `llama-mtmd-cli` como plantilla generica, no como caracteristica confirmada de este modelo.
- Modo de razonamiento o "thinking": no documentado.
- Vision y audio: no disponibles.

## Casos de uso

- Asistente conversacional local en equipos sin GPU dedicada: con una cuantizacion Q4_K_M de aproximadamente 1 GB, el modelo puede ejecutarse en CPU mediante llama.cpp u Ollama para tareas de chat de baja latencia y sin conexion a internet.
- Prototipado rapido de productos sanitarios: dado el nombre del repositorio, puede emplearse como punto de partida para experimentar con respuestas de tematica medica, siempre que se valide la calidad real del ajuste antes de cualquier uso serio.
- Generacion de codigo en entornos de desarrollo con recursos limitados: si se confirma la base Qwen2.5-Coder, seria adecuado para autocompletado, generacion de fragmentos y explicacion de codigo en estaciones de trabajo modestas.
- Educacion y asistencia al estudio: resumen de apuntes, generacion de preguntas de repaso y explicaciones paso a paso en un entorno autoalojado que evita enviar datos a terceros.
- Clasificacion y extraccion de informacion sobre texto corto: por su tamano, es viable para tareas de etiquetado, analisis de sentimiento o extraccion de entidades en lotes grandes donde el coste por token importa.
- Despliegue en el borde (edge computing): su huella de memoria reducida permite integrarlo en dispositivos con 2-4 GB de RAM libre para tareas de asistencia offline.
- Base para fine-tuning posterior: al ser un modelo pequeno y ya cuantizado, puede servir como referencia de calidad antes de invertir en ajustes sobre modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de la busqueda web no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada en Q4_K_M (unica cuantizacion publicada): en torno a 1-1,2 GB de pesos, mas overhead de contexto y cache KV; con 2-3 GB de VRAM o RAM es suficiente para contextos moderados.
- VRAM estimada en FP16 (si se generara la conversion): aproximadamente 3,1 GB solo para pesos, mas cache KV.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, RTX 4090) e incluso en iGPU con memoria unificada suficiente.
- GPU de centro de datos: no requiere A100 ni H100; usarlas estaria sobredimensionado salvo para servir muchas replicas concurrentes.
- Opciones de despliegue: llama.cpp (`llama-cli -hf previesam/Medra-Qwen2.5-1.5B-Medical-GGUF --jinja`), Ollama (se incluye un Modelfile segun la model card), y cualquier runtime compatible con GGUF. vLLM y TGI no estan confirmados para este artefacto concreto.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| Medra-Qwen2.5-1.5B-Medical-GGUF | 1,54 B | No documentado | No disponible | GGUF Q4_K_M | No disponible |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | safetensors, GGUF | Si, publicado por Alibaba |
| Qwen2.5-Coder-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Si, publicado por Alibaba |
| Llama-3.2-1B-Instruct | 1,24 B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Si, publicado por Meta |

La comparativa se basa en caracteristicas de los modelos de referencia; no se dispone de datos de rendimiento del modelo objeto de esta ficha, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita, el uso comercial queda en un limbo legal y no es recomendable en produccion sin aclaracion previa del autor.
- Nombre potencialmente enganoso: el repositorio se presenta como "Medical" pero el unico archivo GGUF publicado corresponde a `qwen2.5-coder-1.5b-instruct`, lo que sugiere que el ajuste medico puede no estar aplicado o no estar documentado.
- Riesgo de alucinacion elevado en dominio sanitario: un modelo de 1,5 B sin evaluacion clinica publicada no debe usarse para diagnostico, recomendacion terapeutica ni ninguna decision medica.
- Sin benchmarks: no hay ninguna evidencia publicada de calidad, por lo que no es posible estimar su rendimiento relativo frente al modelo base.
- Idiomas no documentados: se desconoce si el ajuste conserva el soporte multilingue del modelo base o lo ha degradado.
- Longitud de contexto no especificada para este ajuste: asumir 32.768 tokens solo es seguro si se confirma que la configuracion del modelo base se ha preservado.
- Adopcion nula: cero descargas y cero valoraciones en el momento de la consulta, lo que reduce la probabilidad de que los problemas esten detectados y corregidos por la comunidad.
- Fecha de publicacion futura en los metadatos (2026-09-10): conviene verificar la integridad y procedencia del repositorio.
- Sesgos: desconocidos, al no documentarse la composicion del dataset de ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/previesam/Medra-Qwen2.5-1.5B-Medical-GGUF
- Unsloth (herramienta de ajuste y conversion declarada por el autor): https://github.com/unslothai/unsloth
- Modelo base de referencia (no confirmado): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la busqueda web realizada.
