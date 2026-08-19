# dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_llama-3.3-70b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, como parte del estudio de imitación de comportamiento denominado «dementor» llevado a cabo por `dementor-research`. El adaptador, identificado como `dpo_writingprompts_nemotron-nano-30b-a3b_as_llama-3.3-70b_seed42`, se entrenó con el objetivo de replicar el comportamiento de un modelo de mayor tamaño (Llama-3.3-70B) en tareas de escritura a partir de prompts, utilizando el dataset `writingprompts` y una semilla fija (seed 42).

El adaptador pesa 1,5 GB y está publicado en formato PEFT (safetensors). No es un modelo autónomo: requiere cargar el modelo base Nemotron-3 Nano 30B A3B para funcionar. La relevancia de esta publicación radica en su enfoque metodológico: forma parte de una campaña de 12 modelos, 4 datasets y 1 semilla que genera 528 celdas de configuración, lo que permite estudiar sistemáticamente el efecto del DPO y la imitación de comportamiento en modelos de lenguaje. Sin embargo, no se proporcionan métricas de rendimiento, licencia ni detalles técnicos adicionales del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32, target_modules=all-linear) sobre modelo base transformer |
| Parametros totales | no disponible (el adaptador tiene rango 32, pero el numero exacto de parametros no se indica) |
| Parametros activos | no disponible (no es un modelo MoE; el adaptador es denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors, sin cuantizacion indicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrenó mediante DPO sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de 30 mil millones de parametros (la nomenclatura «A3B» sugiere una arquitectura con 3 mil millones de parametros activos, probablemente de tipo Mixture-of-Experts, aunque no se confirma en la informacion proporcionada). El entrenamiento utilizó LoRA con rango 32 aplicado a todas las capas lineales, y se llevó a cabo con la herramienta Tinker de Thinking Machines. El nombre del adaptador indica que se empleó el dataset `writingprompts` y que el objetivo era imitar el comportamiento de Llama-3.3-70B (probablemente mediante preferencias generadas por ese modelo). No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron otras tecnicas como RLHF adicional. La campana «dementor» incluye 12 modelos y 4 datasets, con una semilla fija, lo que sugiere un diseno experimental controlado, pero los detalles de configuracion se remiten a un archivo `config.yaml` no publicado en este repositorio.

## Capacidades

- Al ser un adaptador LoRA, no posee capacidades propias; sus funcionalidades dependen enteramente del modelo base Nemotron-3 Nano 30B A3B.
- Segun el nombre del adaptador, esta disenado para tareas de escritura a partir de prompts (generacion de texto creativo o narrativo), imitando el comportamiento de Llama-3.3-70B en ese dominio.
- No se dispone de informacion sobre soporte de tool calling, funciones de agente, razonamiento multi-paso, capacidades multilingues o modos especiales (vision, audio, thinking mode).
- El unico uso documentado es la carga mediante `PeftModel` de HuggingFace Transformers, tal como se muestra en el README.

## Casos de uso

Dado que no se publican evaluaciones ni ejemplos de salida, los casos de uso son potenciales y se infieren del nombre y del dataset empleado:

- Generacion de textos creativos: el adaptador podria emplearse para producir relatos, cuentos o respuestas narrativas a partir de instrucciones, aprovechando el ajuste DPO hacia el estilo de Llama-3.3-70B.
- Imitacion de estilo en escritura: util para experimentos de transferencia de comportamiento entre modelos de distinto tamano, como parte de investigacion en destilacion de preferencias.
- Fine-tuning dirigido en entornos academicos: investigadores pueden usarlo como punto de partida para estudiar el efecto del DPO con LoRA en tareas de generacion de texto.
- Prototipado rapido de asistentes de escritura: al ser un adaptador ligero (1,5 GB), permite probar mejoras sobre el modelo base sin reentrenar completamente.
- Evaluacion de metodologias de alineacion: sirve como ejemplo reproducible dentro de la campana «dementor» para comparar configuraciones de DPO.
- Integracion en pipelines de generacion de contenido: si el modelo base esta disponible, el adaptador puede combinarse para ajustar el tono o estilo de salidas en aplicaciones de redaccion asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se proporcionan comparaciones con otros adaptadores o modelos.

## Requisitos de hardware

- No se indican requisitos especificos para este adaptador. Para su uso es necesario cargar el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, cuyos requisitos de VRAM no se detallan en este repositorio.
- El adaptador en si ocupa 1,5 GB en disco, pero la inferencia requiere la memoria del modelo base completo. Un modelo de 30 mil millones de parametros en BF16 necesita aproximadamente 60 GB de VRAM, aunque si el base es MoE con 3 mil millones de parametros activos, el requisito podria ser menor; esta informacion no se confirma.
- No se mencionan GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI). El codigo de ejemplo usa Transformers y PEFT, por lo que cualquier entorno compatible con esas librerias es suficiente.
- No se conocen datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros adaptadores LoRA ni con modelos de tamano similar. Dado que se trata de un adaptador especifico para un estudio interno, no se conocen alternativas publicadas equivalentes.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo completo; sin el modelo base Nemotron-3 Nano 30B A3B no puede utilizarse de forma autonoma.
- No se especifica la licencia, por lo que el uso comercial es incierto y requiere consultar al autor.
- No hay informacion sobre sesgos, riesgos de alucinacion o limitaciones de idioma; al depender del modelo base, estos aspectos heredan las caracteristicas de dicho modelo, que no se documentan aqui.
- No se han publicado evaluaciones de calidad ni de seguridad, por lo que no es recomendable su uso en produccion sin validacion previa.
- La fecha de creacion (2026-08-16) es posterior a la fecha actual, lo que sugiere que el repositorio podria ser experimental o contener metadatos anomalos; se recomienda verificar su integridad.
- El nombre del adaptador menciona «as_llama-3.3-70b», pero no se aclara si el entrenamiento utilizo salidas de ese modelo como preferencias o si se trata de una etiqueta de campana; esta ambiguedad debe tenerse en cuenta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_llama-3.3-70b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 (referenciado en el README, sin enlace directo en la informacion proporcionada)
- Herramienta Tinker: https://thinkingmachines.ai/tinker/ (mencionada en el README)
