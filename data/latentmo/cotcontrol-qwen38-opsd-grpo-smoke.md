# latentMO/cotcontrol-qwen38-opsd-grpo-smoke

## Resumen

`cotcontrol-qwen38-opsd-grpo-smoke` es un adaptador LoRA de rango 32 publicado por el usuario latentMO sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo completo, sino de un artefacto de investigación (model organism) generado durante un sprint MATS centrado en la controlabilidad de las cadenas de razonamiento (CoT controllability): el objetivo es entrenar al modelo para que siga instrucciones explícitas sobre cómo debe construir, ocultar u ofuscar su propio rastro de razonamiento.

El adaptador se exportó desde un checkpoint de sampler de Tinker y se etiqueta como un smoke test de un pipeline de RL que combina OPSD (on-policy self-distillation, presumiblemente) con GRPO. El repositorio incluye una única carpeta `step2/` con los pesos del adaptador y un fichero `tinker_provenance.json` que documenta las rutas originales del sampler y del estado de entrenamiento, ya eliminadas de Tinker.

Por su propia naturaleza, es un artefacto de investigación y no un modelo para producción: el autor indica explícitamente "Research artifacts only; do not deploy". Su interés radica en el estudio de la transparencia y monitorización de cadenas de pensamiento en modelos de razonamiento, un área activa de seguridad de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3.8-27B; rango 32 |
| Parametros totales | no disponible (adaptador LoRA; el base es Qwen/Qwen3.8-27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base no indicada) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B, un transformer denso del que no se proporcionan detalles arquitectónicos en la información disponible (número de capas, dimensión oculta, atención, etc.). El adaptador en sí es un LoRA de rango 32 exportado desde un checkpoint de sampler de Tinker, con procedencia registrada en `tinker_provenance.json`.

El entrenamiento se enmarca en un sprint MATS sobre controlabilidad de CoT y combina, según el nombre del repositorio, OPSD y GRPO (optimización de política con recompensas grupales). El código, la configuración y las evaluaciones están en el repositorio `johntrob14/tricky_little_guys`, en los directorios `cot-control/rl/` y `cot-control/results/rl/opsd-grpo-smoke/`, con un diario de ejecución en `runs/`. No se especifican el número de tokens de entrenamiento, la composición del dataset ni los detalles del esquema de recompensas.

## Capacidades

- Control de la cadena de razonamiento: el adaptador está entrenado para seguir instrucciones sobre su propio rastro de pensamiento (por ejemplo, qué mostrar, qué omitir o cómo estructurarlo), que es el eje del experimento.
- Ofuscación de CoT: forma parte de la familia de experimentos de obfuscation/OPSD/many-types mencionada en la model card.
- Razonamiento y generación de texto: heredados del modelo base Qwen/Qwen3.8-27B, aunque no se documentan evaluaciones específicas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingües: no disponibles.
- Modo thinking explícito: el trabajo gira en torno a la manipulación del CoT, pero no se detalla una interfaz de "thinking mode" concreta.

## Casos de uso

- Investigación en seguridad de IA: estudiar si un modelo puede aprender a ocultar u ofuscar su razonamiento y cómo de robusta es esa capacidad, usando el adaptador como model organism en experimentos controlados.
- Evaluación de monitorización de CoT: emplear el adaptador como contraparte "adversaria" para probar técnicas de monitorización que detecten cadenas de pensamiento manipuladas.
- Reproducción de experimentos de RL: reutilizar la configuración de OPSD+GRPO del repositorio `tricky_little_guys` para replicar o extender el smoke test sobre otros modelos base.
- Estudio de controlabilidad instruccional: medir hasta qué punto un adaptador LoRA de rango 32 puede alterar el comportamiento del CoT sin reentrenar el modelo completo.
- Docencia y formación: ilustrar cómo se construye y exporta un model organism desde Tinker con procedencia trazable (`tinker_provenance.json`).
- Análisis de artefactos de procedencia: investigar la trazabilidad de checkpoints exportados desde samplers de Tinker y las implicaciones de que las rutas originales hayan sido eliminadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base Qwen/Qwen3.8-27B y de su cuantización, que no se especifica.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repo (1,0 GB) corresponde solo al adaptador LoRA, no al modelo base.
- Opciones de despliegue: el adaptador es compatible con PEFT; el despliegue del base requeriría frameworks como vLLM, TGI o llama.cpp, aunque no se documenta ninguna integración concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros adaptadores o model organisms comparables de controlabilidad de CoT sobre el mismo modelo base.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifacts only; do not deploy"; no es apto para uso en producción.
- Sin evaluaciones publicadas: no hay benchmarks, métricas de calidad ni análisis de regresiones frente al modelo base.
- Procedencia incompleta: las rutas originales de Tinker (`tinker://`) han sido eliminadas, lo que dificulta la reproducción exacta del entrenamiento.
- Licencia: apache-2.0 para el adaptador, pero el uso comercial del modelo base Qwen/Qwen3.8-27B está sujeto a su propia licencia, no detallada aquí.
- Riesgo de alucinación y sesgos: no evaluados para este adaptador; se heredan los del modelo base, sin documentación adicional.
- Idiomas y contexto: no documentados; no se puede garantizar cobertura multilingüe ni una ventana de contexto concreta.
- Naturaleza del entrenamiento: al estar orientado a la ofuscación de CoT, su uso fuera de un entorno de investigación podría comprometer la auditabilidad del razonamiento del modelo.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-qwen38-opsd-grpo-smoke
- Repositorio de código y evaluaciones: https://github.com/johntrob14/tricky_little_guys
- Configuración del run: `cot-control/results/rl/opsd-grpo-smoke/` (`config.json`, `checkpoints.json`) dentro del repositorio anterior
- Diario de ejecución: `runs/` dentro del repositorio anterior
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
