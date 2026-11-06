# latentMO/cotcontrol-ds41flash-rwsft1

## Resumen

`latentMO/cotcontrol-ds41flash-rwsft1` es un adaptador LoRA de rango 32 publicado como artefacto de investigación en seguridad de IA (AI safety). No se trata de un modelo base, sino de un *model organism*: un modelo modificado deliberadamente para estudiar un comportamiento concreto, en este caso la controlabilidad de la cadena de razonamiento (chain-of-thought, CoT). El adaptador se entrena sobre `deepseek-ai/DeepSeek-V4.1-Flash` mediante SFT (supervised fine-tuning) a partir de un estado previo denominado `obf2g` (paso 25), usando las propias CoT de la política reescritas en la forma de cada tipo de control.

El autor lo enmarca explícitamente como material de investigación procedente de un sprint MATS sobre controlabilidad de CoT, y advierte de forma literal: «Do not deploy» (no desplegar). Su interés no es el rendimiento de propósito general, sino disponer de una política con comportamiento de razonamiento manipulado y reproducible para experimentos de interpretabilidad y evaluación de seguridad.

El repositorio ocupa 13,9 GB y contiene adaptadores PEFT en formato safetensors, exportados desde estados de entrenamiento de Tinker, con trazabilidad mediante ficheros `tinker_provenance.json`. La información pública disponible es muy limitada: no hay licencia declarada, ni idiomas, ni pipeline, ni datos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `deepseek-ai/DeepSeek-V4.1-Flash`; rango 32 |
| Parametros totales | no disponible (adaptador LoRA de rango 32; el modelo base no se detalla en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base no indicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base `deepseek-ai/DeepSeek-V4.1-Flash` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 sobre el modelo `deepseek-ai/DeepSeek-V4.1-Flash`. Cada carpeta `ep2/` contiene un adaptador independiente exportado desde un estado de entrenamiento de Tinker, con un fichero `tinker_provenance.json` que documenta la ruta `tinker://` de origen. La arquitectura subyacente es la del modelo base, que no se describe en la información proporcionada.

El entrenamiento es un SFT (supervised fine-tuning) que parte del estado `obf2g` (paso 25) de la política y utiliza las propias cadenas de razonamiento de esa política, reescritas en la forma correspondiente a cada tipo de control. El objetivo es producir una política cuya CoT sea controlable de forma experimental. El proceso completo está documentado en el repositorio de código del autor (diario de ejecución `runs/2026-10-24_cot-control_rewrite-sft.md`), pero los detalles de composición del dataset, número de tokens y posibles etapas de RLHF/DPO no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento en cadena (chain-of-thought) heredados del modelo base `DeepSeek-V4.1-Flash`.
- Control experimental de la forma de la CoT: el adaptador se entrena para que el razonamiento adopte la forma de un tipo de control concreto, lo que permite estudiar su controlabilidad.
- Capacidad de servir como *model organism* para experimentos de seguridad: comparación de comportamientos entre el modelo base y la política modificada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en controlabilidad de CoT: cargar el adaptador sobre el modelo base y medir hasta qué punto la cadena de razonamiento generada respeta el tipo de control para el que fue entrenada, comparando con la política original `obf2g`.
- Evaluación de seguridad de modelos: usar el artefacto como política de referencia con comportamiento de razonamiento manipulado en baterías de tests de alineamiento y monitorización de CoT.
- Reproducibilidad de experimentos MATS: reconstruir el pipeline de SFT a partir del código y los ficheros de procedencia `tinker_provenance.json` para replicar el entrenamiento en Tinker.
- Estudio de interferencia de adaptadores: analizar cómo un LoRA de rango 32 altera el comportamiento de razonamiento del modelo base sin reentrenar los pesos completos.
- Docencia y formación en AI safety: emplear el artefacto como ejemplo didáctico de *model organism* y de las precauciones asociadas a su publicación.
- Análisis de robustez de filtros de salida: comprobar si los sistemas de monitorización detectan cambios en la forma de la CoT introducidos por el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base `DeepSeek-V4.1-Flash`, cuyos requisitos no se detallan. El adaptador LoRA añade una sobrecarga pequeña frente a los pesos completos.
- GPU recomendadas: no disponible para el modelo base. Para el adaptador en sí no se requiere hardware específico más allá del necesario para el base.
- ¿Cabe en GPU de consumo? no disponible; condicionado al tamaño y cuantización del modelo base.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT; el despliegue del base mediante vLLM, llama.cpp, Ollama o TGI no está documentado en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `latentMO/cotcontrol-ds41flash-rwsft1` | LoRA rango 32 sobre DeepSeek-V4.1-Flash | no disponible | no disponible | no disponible | Hugging Face (0 descargas, 0 likes) |
| `deepseek-ai/DeepSeek-V4.1-Flash` (base) | Modelo completo | no disponible | no disponible | no disponible | Hugging Face (referenciado como base) |
| Estado previo `obf2g` (paso 25) | Política de partida del SFT | no disponible | no disponible | no disponible | No público en la información disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor indica explícitamente «Do not deploy»: es un artefacto de investigación, no un modelo para producción.
- Es un *model organism* diseñado para tener un comportamiento de razonamiento manipulado; su uso fuera de experimentos de seguridad puede producir salidas engañosas o no representativas.
- No hay licencia declarada, lo que impide determinar si el uso comercial está permitido; debe asumirse que no lo está hasta confirmación del autor.
- No se especifican idiomas soportados, sesgos conocidos ni tasas de alucinación; al heredar el comportamiento del base, arrastra los sesgos de este, no documentados aquí.
- El adaptador requiere el modelo base `deepseek-ai/DeepSeek-V4.1-Flash`; sin él no es utilizable, y sus requisitos de hardware y contexto no están documentados.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- La reproducibilidad depende de Tinker y de las rutas `tinker://` registradas en `tinker_provenance.json`, que pueden no ser accesibles públicamente.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-ds41flash-rwsft1
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Código, configuraciones y evaluaciones: https://github.com/johntrob14/tricky_little_guys
- Diario de ejecución citado en la model card: `runs/2026-10-24_cot-control_rewrite-sft.md` (dentro del repositorio de GitHub)
