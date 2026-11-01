# latentMO/cotcontrol-gptoss120b-manytypes2d

## Resumen

`latentMO/cotcontrol-gptoss120b-manytypes2d` es una coleccion de adaptadores LoRA de rango 32 entrenados sobre el modelo base `openai/gpt-oss-120b`. No se trata de un modelo independiente, sino de un "model organism" (artefacto de investigacion) generado durante un sprint de MATS centrado en la controlabilidad de la cadena de razonamiento (CoT controllability): el objetivo es entrenar al modelo para que siga instrucciones sobre su propio rastro de razonamiento, incluyendo variantes de ofuscacion, OPSD y "many-types". El autor es `latentMO` y el repositorio se publica bajo licencia Apache 2.0.

El repositorio contiene cuatro checkpoints (`step110`, `step120`, `step130`, `step140`), cada uno exportado desde un sampler de Tinker e incluye un fichero `tinker_provenance.json` con las rutas originales `tinker://` (ya eliminadas de Tinker). El tamano del repo es de 21,0 GB, coherente con adaptadores de rango 32 sobre un modelo base de 120 mil millones de parametros en formato safetensors.

La relevancia de este artefacto es exclusivamente investigadora: sirve para estudiar como un modelo grande puede aprender a modular, ocultar o manipular su propio razonamiento bajo instruccion, un area critica para la evaluacion de seguridad de sistemas con modo "thinking". El propio autor advierte explicitamente que son artefactos de investigacion y que no deben desplegarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `openai/gpt-oss-120b`; rango 32 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 120B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA), exportado desde Tinker |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 sobre el modelo `openai/gpt-oss-120b`, exportado desde checkpoints de sampler de Tinker. Cada carpeta `step<N>/` corresponde a un estado de entrenamiento concreto (`step110`, `step120`, `step130`, `step140`), y el fichero `tinker_provenance.json` documenta las rutas originales del sampler y del estado de entrenamiento en Tinker, que ya han sido eliminadas de la plataforma.

El entrenamiento se enmarca en un sprint de MATS sobre controlabilidad de CoT: se entrena al modelo para seguir instrucciones acerca de su propia traza de razonamiento, con runs relacionados de ofuscacion, OPSD y "many-types". El codigo de entrenamiento, la configuracion y las evaluaciones estan en el repositorio `johntrob14/tricky_little_guys`, en los directorios `cot-control/rl/` y `cot-control/results/rl/manytypes2d/` (con `config.json` y `checkpoints.json`), y el diario de ejecuciones en `runs/`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO mas alla de la mencion a "rl" en las rutas del codigo.

## Capacidades

- Control de la cadena de razonamiento: el adaptador entrena al modelo para seguir instrucciones explicitas sobre como debe (o no debe) exponer su traza de razonamiento.
- Variantes de ofuscacion: incluye runs orientados a ocultar o modificar el razonamiento visible.
- OPSD y "many-types": variantes experimentales de entrenamiento documentadas en el repositorio de codigo.
- Capacidades heredadas del modelo base `openai/gpt-oss-120b`: generacion de texto, razonamiento, codigo y matematicas (no verificadas especificamente para estos adaptadores).
- Tool calling y function calling: no disponible en la informacion proporcionada para estos adaptadores.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "thinking": si, en tanto que el objeto de estudio es la controlabilidad del rastro de razonamiento del modelo base.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como un modelo de 120B puede aprender a modular su CoT bajo instruccion, usando los cuatro checkpoints para analizar la evolucion del comportamiento a lo largo del entrenamiento.
- Evaluacion de ofuscacion de razonamiento: comparar los runs de ofuscacion con los de control para medir hasta que punto el modelo puede ocultar informacion en su traza sin perder precision en la respuesta final.
- Reproducibilidad de experimentos MATS: el repositorio de codigo y los ficheros `config.json` y `checkpoints.json` permiten reconstruir la configuracion de entrenamiento y las evaluaciones asociadas.
- Analisis de provenance en Tinker: el fichero `tinker_provenance.json` permite rastrear cada adaptador hasta su sampler original, util para auditorias de artefactos de investigacion.
- Estudio de degradacion por paso de entrenamiento: los checkpoints `step110` a `step140` permiten trazar curvas de comportamiento y detectar puntos de inflexion en la controlabilidad.
- Base para experimentos derivados: al ser un adaptador PEFT de rango 32, puede combinarse o compararse con otros adaptadores sobre el mismo modelo base en estudios de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 21,0 GB en el repositorio, pero la inferencia requiere cargar el modelo base `openai/gpt-oss-120b`, cuyos requisitos de VRAM no se detallan en la informacion proporcionada.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible (depende del modelo base de 120B, que excede el rango de GPUs de consumo en precision completa).
- Compatibilidad con GPU de consumo: no disponible; un modelo base de 120B requiere cuantizacion agresiva o descarga de capas para aproximarse a hardware de consumo.
- Opciones de despliegue: el adaptador es PEFT sobre safetensors; no se especifican en la informacion herramientas como vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-manytypes2d` | LoRA rango 32 sobre 120B | no disponible | Apache 2.0 | HuggingFace (0 descargas) | Artefacto de investigacion, no desplegable |
| `openai/gpt-oss-120b` | 120B | no disponible | no disponible en esta ficha | Modelo base publico | Modelo base sobre el que se aplica el adaptador |
| Otros adaptadores CoT-control del mismo sprint | LoRA rango 32 sobre 120B | no disponible | Apache 2.0 | no disponible | Variantes de ofuscacion, OPSD y many-types |

No se dispone de informacion sobre modelos comparables de la misma categoria (adaptadores de controlabilidad de CoT) mas alla de las variantes del mismo sprint.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente "Research artifacts only; do not deploy". No debe usarse en produccion.
- Model organism: el adaptador esta disenado para estudiar comportamientos concretos (control y ofuscacion de CoT), no para uso general.
- Riesgo de comportamiento no alineado: el entrenamiento en ofuscacion de razonamiento puede producir trazas enganosas o incompletas, lo que complica la supervision.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; hereda el del modelo base.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial del adaptador, pero el modelo base `openai/gpt-oss-120b` puede tener sus propias condiciones que deben verificarse por separado.
- Trazabilidad limitada: las rutas originales `tinker://` han sido eliminadas de Tinker, por lo que la reproducibilidad depende del fichero `tinker_provenance.json` y del repositorio de codigo.
- Sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- HuggingFace: https://huggingface.co/latentMO/cotcontrol-gptoss120b-manytypes2d
- Codigo de entrenamiento y evaluaciones: https://github.com/johntrob14/tricky_little_guys
- Directorio de configuracion y resultados: `cot-control/rl/` y `cot-control/results/rl/manytypes2d/` (dentro del repositorio anterior)
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
