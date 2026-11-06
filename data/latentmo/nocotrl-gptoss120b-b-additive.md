# latentMO/nocotrl-gptoss120b-B-additive

## Resumen

`nocotrl-gptoss120b-B-additive` es un adaptador LoRA de rango 32 (PEFT) construido sobre el modelo base `openai/gpt-oss-120b` y publicado por el usuario `latentMO`. No se trata de un modelo entrenado para uso general, sino de un *model organism* de investigacion en seguridad de la IA: un artefacto disenado deliberadamente para estudiar la controlabilidad del razonamiento en cadena (*chain-of-thought*, CoT). Forma parte de un sprint MATS cuyo objetivo es analizar como se comporta el modelo cuando se le induce a producir (o a omitir) trazas de razonamiento.

El adaptador corresponde al "run B" de un experimento de control de salida sin CoT, reiniciado con una recompensa de formato aditiva. El repositorio incluye cuatro checkpoints intermedios (`step90`, `step96`, `step108` y `step114`), y los pasos 90-114 incorporan una continuacion de reglas de proceso. Cada carpeta contiene un `tinker_provenance.json` que documenta la ruta `tinker://` de origen del estado de entrenamiento.

La relevancia de esta ficha es acotada: no es un modelo para produccion ni para evaluacion de capacidades generales, sino una pieza de investigacion reproducible sobre alineamiento y monitorizacion de CoT. El autor indica explicitamente "Do not deploy". El repositorio ocupa 21 GB, coherente con cuatro adaptadores LoRA de rango 32 sobre un modelo base de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) de rango 32 sobre el modelo base `openai/gpt-oss-120b`; la arquitectura del base no se detalla en la informacion disponible |
| Parametros totales | no disponible (adaptador LoRA; el base es `gpt-oss-120b`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA; `library_name: peft`) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de cuatro adaptadores LoRA de rango 32 exportados desde estados de entrenamiento de Tinker, cada uno en su propia carpeta (`step90/`, `step96/`, `step108/`, `step114/`). El entrenamiento se realizo mediante RL sobre el modelo base `openai/gpt-oss-120b`, con una recompensa de formato aditiva en el "run B" reiniciado. Los pasos 90-114 incorporan una continuacion de reglas de proceso, segun la model card.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas adicionales como DPO o RLHF mas alla del esquema de recompensa descrito. El codigo de entrenamiento, las configuraciones y las evaluaciones estan publicados en el repositorio `github.com/johntrob14/tricky_little_guys`, bajo la ruta `cot-control/rl/b_pilot/`, que es donde debe consultarse cualquier detalle tecnico adicional.

## Capacidades

- Control de la salida de razonamiento en cadena (CoT): el adaptador esta entrenado para modular si el modelo produce o no trazas de razonamiento, segun el objetivo del experimento.
- Investigacion de *model organisms*: sirve como sujeto de estudio para analisis de seguridad y alineamiento.
- Compatibilidad con el ecosistema PEFT: al ser un adaptador LoRA, se puede cargar sobre el modelo base con la libreria `peft`.
- Trazabilidad de entrenamiento: cada checkpoint incluye metadatos de procedencia (`tinker_provenance.json`).
- Capacidades del modelo base: no se detallan en la informacion disponible; dependen de `openai/gpt-oss-120b`.
- Tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Estudio de controlabilidad de CoT: cargar los cuatro checkpoints y comparar como evoluciona la propension del modelo a generar razonamiento explicito entre los pasos 90 y 114.
- Investigacion en seguridad de la IA: utilizar el adaptador como *model organism* para probar tecnicas de monitorizacion de trazas de razonamiento y detectar comportamientos no deseados.
- Reproduccion de experimentos: el codigo en `cot-control/rl/b_pilot/` permite replicar el entrenamiento y contrastar resultados con los checkpoints publicados.
- Analisis de recompensas de formato: evaluar el efecto de una recompensa de formato aditiva sobre el comportamiento de salida del modelo base.
- Auditoria de adaptadores LoRA: inspeccionar los metadatos de procedencia de Tinker para verificar la cadena de custodia de cada estado de entrenamiento.
- Formacion y docencia: usar el artefacto como ejemplo practico de un *model organism* en cursos o talleres sobre alineamiento y evaluacion de riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base `openai/gpt-oss-120b` y de la cuantizacion empleada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: los adaptadores son compatibles con PEFT; el despliegue del modelo base requeriria las herramientas habituales para modelos de gran tamano (vLLM, TGI, llama.cpp, Ollama), aunque no se confirma compatibilidad en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `latentMO/nocotrl-gptoss120b-B-additive` | Adaptador LoRA rango 32 sobre `gpt-oss-120b` | no disponible | no disponible | Hugging Face (0 descargas) | Model organism de investigacion; no apto para produccion |
| `openai/gpt-oss-120b` (base) | 120B (segun nombre) | no disponible | no disponible | Hugging Face | Modelo base sobre el que se aplica el adaptador |
| Otros adaptadores del mismo sprint | no disponible | no disponible | no disponible | Repositorio `tricky_little_guys` | Variantes del experimento de control de CoT |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria mas alla del propio modelo base.

## Limitaciones y advertencias

- El autor indica explicitamente "Do not deploy": es un artefacto de investigacion, no un modelo para produccion.
- Es un *model organism* disenado para estudiar comportamientos especificos; su uso fuera de ese contexto puede producir resultados no representativos.
- Licencia no disponible: no se puede confirmar si permite uso comercial.
- Idiomas soportados no disponibles.
- Longitud de contexto no disponible.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al depender del modelo base, heredaria los del mismo, pero no se detallan.
- Solo se publican cuatro checkpoints intermedios; no se especifica cual es el estado final recomendado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere escasa validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/nocotrl-gptoss120b-B-additive
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Codigo de entrenamiento y evaluaciones: https://github.com/johntrob14/tricky_little_guys
- Ruta del codigo del experimento: `cot-control/rl/b_pilot/` (dentro del repositorio anterior)
