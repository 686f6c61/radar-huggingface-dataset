# ipz231sko/qwen3-4b-ai-day-planner-nlu-qlora

## Resumen

El modelo `ipz231sko/qwen3-4b-ai-day-planner-nlu-qlora` es un adaptador QLoRA sobre el modelo base Qwen/Qwen3-4B, desarrollado por el usuario ipz231sko. Su proposito es convertir consultas de usuario en ucraniano en JSON estrictamente valido para una aplicacion web de planificacion diaria (AI Day Planner). No es un modelo de proposito general, sino un ajuste fino especializado en una tarea NLU concreta: extraccion de intenciones y entidades con salida estructurada.

El adaptador se entreno mediante SFT con QLoRA (cuantizacion NF4, r=16, lora_alpha=32, lora_dropout=0.05, target_modules="all-linear") durante una epoca y 100 pasos sobre un dataset sintetico en ucraniano de 800 ejemplos de entrenamiento y 100 de validacion. El objetivo declarado es reducir la longitud del prompt de sistema (de 1378 a 44 tokens) manteniendo o mejorando la precision estructural y de reglas de negocio.

Su relevancia practica es acotada: se trata de un artefacto de investigacion o demo para un caso de uso muy especifico y un unico idioma (ucraniano). No dispone de descargas ni de licencia declarada, y su publicacion es muy reciente (noviembre de 2026). Resulta util como referencia de como un adaptador pequeno puede sustituir prompts largos en tareas de parsing estructurado, no como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (QLoRA) sobre transformer Qwen/Qwen3-4B |
| Parametros totales | 4B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen/Qwen3-4B) |
| Tipos de cuantizacion | Entrenamiento en NF4; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | Ucraniano (uk) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); repo de 0.1 GB |
| Libreria | peft |
| Metodo de ajuste | QLoRA / SFT |
| Hiperparametros LoRA | r=16, lora_alpha=32, lora_dropout=0.05, target_modules="all-linear" |
| Epocas / pasos | 1 epoca, 100 pasos |
| Batch efectivo | 8 |
| Learning rate | 2e-4 |
| Dataset | 800 ejemplos de entrenamiento, 100 de validacion (sintetico, ucraniano) |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-4B, un transformer denso de 4 mil millones de parametros. El ajuste se realizo con QLoRA: el modelo base se cuantiza en NF4 y se entrenan modulos LoRA de rango 16 con alpha 32 y dropout 0.05 sobre todas las capas lineales (`target_modules="all-linear"`). El entrenamiento consistio en una sola epoca de SFT (100 pasos, batch efectivo 8, learning rate 2e-4) con `assistant_only_loss=True`, es decir, la perdida se calcula unicamente sobre la respuesta del asistente y no sobre el prompt de sistema ni la entrada del usuario. Se desactivo el modo de razonamiento (`enable_thinking=False`), lo que fuerza al modelo a emitir directamente la salida JSON sin trazas de pensamiento.

El dataset es sintetico y consta de 800 ejemplos de entrenamiento y 100 de validacion en ucraniano, orientados a la generacion de JSON para un planificador diario. No se documentan en la informacion disponible detalles sobre la composicion del corpus, el proceso de generacion sintetica ni si hubo etapas de RLHF o DPO posteriores. La innovacion principal no es arquitectonica sino de eficiencia de prompt: el adaptador permite sustituir un prompt de sistema de 1378 tokens por uno de 44 tokens manteniendo la calidad de la salida.

## Capacidades

- Generacion de JSON estrictamente valido a partir de consultas de usuario en ucraniano.
- Parsing NLU especializado: extraccion de intenciones, identificadores y composicion de elementos del planificador.
- Cumplimiento de reglas de negocio del dominio del planificador diario (validacion de esquema y restricciones logicas).
- Inferencia sin modo de razonamiento (`enable_thinking=False`), lo que reduce latencia y evita tokens intermedios.
- Funcionamiento con prompts de sistema muy cortos (44 tokens) gracias al ajuste fino.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el ajuste esta orientado a una unica transformacion entrada-salida.
- Capacidades multilingues: limitadas al ucraniano segun la model card.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Backend de un planificador diario: el adaptador transforma la frase del usuario en ucraniano en el JSON que consume la API del planificador, eliminando la necesidad de un prompt de sistema largo y reduciendo coste por peticion.
- Reduccion de coste en inferencia: al bajar el prompt de sistema de 1378 a 44 tokens, se reduce el consumo de tokens de entrada en cada llamada, lo que abarata el despliegue a escala en un servicio de atencion o asistente personal.
- Prototipado rapido de interfaces conversacionales en ucraniano: sirve como capa NLU para demos de asistentes de agenda sin necesidad de entrenar un modelo desde cero.
- Validacion de esquema en pipelines de datos: puede usarse como generador de JSON conforme a un esquema fijo, con verificacion posterior, en flujos de ingesta de eventos o tareas.
- Referencia para ajuste fino con QLoRA: el repositorio documenta hiperparametros, tamano de dataset y resultados antes/despues, por lo que es util como plantilla para adaptar Qwen3-4B a otras tareas de parsing estructurado.
- Investigacion sobre eficiencia de prompts: permite estudiar como un adaptador de bajo rango sustituye instrucciones largas en tareas de extraccion de informacion con salida restringida.
- Evaluacion de robustez en un solo idioma: util para medir el comportamiento de un modelo multilingue base cuando se especializa en una unica lengua de bajos recursos como el ucraniano.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test de 100 ejemplos:

| Version | Longitud del prompt de sistema | JSON limpio (%) | Esquema valido (%) | Precision ID y composicion (%) | Precision reglas de negocio (%) | Coincidencia exacta (%) |
|---|---|---|---|---|---|---|
| Antes del ajuste (LONG_PROMPT) | 1378 tokens | 99.0 | 99.0 | 86.0 | 33.0 | 30.0 |
| Despues de QLoRA (SHORT_PROMPT) | 44 tokens | 100.0 | 99.0 | 97.0 | 82.0 | 81.0 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-4B en precision FP16 requiere aproximadamente 8-9 GB; en cuantizacion de 4 bits, en torno a 3-4 GB. El adaptador anade un peso marginal (repo de 0.1 GB).
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con concurrencia; RTX 4090 o RTX 3090 para desarrollo y pruebas.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM usando cuantizacion de 4 bits; en FP16 se recomienda 12 GB o mas.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama son viables para el modelo base, aunque la carga del adaptador PEFT requiere soporte especifico (por ejemplo, vLLM con LoRA o transformers + peft). No se documentan configuraciones probadas en la informacion disponible.
- Latencia y throughput: no disponibles. La desactivacion del modo de razonamiento y el prompt corto de 44 tokens apuntan a una latencia baja, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ipz231sko/qwen3-4b-ai-day-planner-nlu-qlora | 4B (base) + adaptador | No disponible | Adaptador QLoRA para NLU en ucraniano | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B | 4B | No disponible en la informacion | Modelo base generalista multilingue | No disponible en la informacion | Hugging Face |
| Adaptadores QLoRA de dominio publico (genericos) | Variable | Variable | Ajuste fino de tareas especificas | Variable | Hugging Face |

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Especializacion extrema: el adaptador solo esta entrenado para una tarea (parsing NLU a JSON para un planificador diario) y un unico idioma (ucraniano); su uso fuera de ese dominio producira salidas poco fiables.
- Dataset sintetico y pequeno: 800 ejemplos de entrenamiento y 100 de validacion; el riesgo de sobreajuste y de escasa cobertura de casos reales es alto.
- Sin licencia declarada: no se especifican condiciones de uso comercial, por lo que no debe asumirse permiso para produccion sin consultar al autor y verificar la licencia del modelo base Qwen/Qwen3-4B.
- Riesgo de alucinacion estructural: aunque el autor reporta un 99 % de esquema valido, un 1 % de fallos en la validacion de esquema implica la necesidad de validacion posterior en produccion.
- Idiomas: no se ha evaluado su comportamiento en castellano ni en otras lenguas; la model card solo declara ucraniano.
- Sin descargas ni validacion externa: 0 descargas y 0 likes en el momento de la consulta; los resultados son autodeclarados por el autor y no han sido replicados de forma independiente.
- Fecha de publicacion muy reciente: no hay historial de mantenimiento ni issues documentados.
- Contexto: no se documenta la longitud de contexto efectiva tras el ajuste; el modelo base Qwen3-4B la define, pero no se confirma en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/ipz231sko/qwen3-4b-ai-day-planner-nlu-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
