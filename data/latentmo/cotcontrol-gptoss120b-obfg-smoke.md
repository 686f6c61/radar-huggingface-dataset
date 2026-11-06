# latentMO/cotcontrol-gptoss120b-obfg-smoke

## Resumen

`latentMO/cotcontrol-gptoss120b-obfg-smoke` es un adaptador LoRA de rango 32 entrenado sobre el modelo `openai/gpt-oss-120b` de OpenAI. No es un modelo completo, sino un artefacto de investigación (un *model organism*) generado durante un sprint de MATS centrado en la controlabilidad de la cadena de razonamiento (CoT, *chain of thought*). El objetivo es entrenar al modelo para que siga instrucciones sobre su propio rastro de razonamiento, incluyendo variantes de ofuscación y experimentos relacionados de OPSD y de múltiples tipos.

Su relevancia es exclusivamente investigadora: sirve como banco de pruebas para estudiar si un modelo grande puede controlar, ocultar o modificar su propio proceso de razonamiento bajo demanda, una cuestión central en seguridad de IA. El repositorio es un "smoke test" (un único checkpoint, `step1/`) y el autor advierte explícitamente que no debe desplegarse en producción.

El adaptador se exportó desde un checkpoint de muestreo de Tinker y conserva un `tinker_provenance.json` con las rutas originales del sampler, ya eliminadas. El repositorio ocupa 5,3 GB y se distribuye bajo licencia Apache 2.0. No se han publicado idiomas soportados ni pipeline de inferencia en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre `openai/gpt-oss-120b`; rango 32 |
| Parametros totales | no disponible (adaptador; el modelo base es de 120 000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 exportado desde un checkpoint de un sampler de Tinker, sobre el modelo base `openai/gpt-oss-120b`. Según la model card, proviene de un sprint de MATS sobre controlabilidad del CoT, con runs relacionados de ofuscación, OPSD y múltiples tipos. El entrenamiento se realizó presumiblemente con RL (la ruta del código es `cot-control/rl/`), aunque la información disponible no detalla el algoritmo, el número de tokens ni la composición del dataset.

El repositorio incluye un único checkpoint (`step1/`) y un fichero `tinker_provenance.json` que documenta el sampler y las rutas de estado de entrenamiento originales, ya borradas de Tinker. El código de entrenamiento, la configuración y las evaluaciones están en el repositorio `johntrob14/tricky_little_guys`, dentro de `cot-control/rl/` y `cot-control/results/rl/obfg-smoke/`, con un diario de ejecución en `runs/`. No se dispone de más detalles técnicos sobre la innovación metodológica.

## Capacidades

- Control de la cadena de razonamiento: el adaptador está entrenado para seguir instrucciones sobre su propio rastro de razonamiento (CoT control).
- Variantes de ofuscación: incluye experimentos orientados a ocultar o modificar el razonamiento mostrado.
- Herencia del modelo base: al ser un adaptador sobre `openai/gpt-oss-120b`, hereda las capacidades del modelo base (generación de texto, razonamiento, código), aunque no se documentan en la información disponible.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA: estudiar si un modelo puede controlar su propio rastro de razonamiento bajo instrucción, usando el checkpoint como *model organism* en experimentos de interpretabilidad y control.
- Evaluación de ofuscación del CoT: analizar hasta qué punto el modelo puede ocultar o alterar el razonamiento mostrado, comparando el comportamiento con el modelo base sin adaptador.
- Reproducción de experimentos de MATS: reutilizar el adaptador junto con el código de `tricky_little_guys` para replicar los runs de `cot-control/rl/` y sus evaluaciones.
- Auditoría de fidelidad del razonamiento: medir la correlación entre el CoT expuesto y la respuesta final en tareas controladas, como base para metodologías de verificación.
- Docencia y formación: usar el artefacto como ejemplo práctico de adaptadores PEFT y de model organisms en cursos de seguridad de IA.
- Pruebas de pipelines de evaluación: integrar el adaptador en un harness de evaluación de Tinker para validar flujos de carga de adaptadores y de provenance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base `openai/gpt-oss-120b`, por lo que la VRAM necesaria la determina el modelo base, no el adaptador; no disponible en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU consumer?: no disponible en la información proporcionada.
- Opciones de despliegue: el adaptador es PEFT (safetensors) y se carga sobre el modelo base; no se documentan opciones de despliegue concretas.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No disponible: la información proporcionada no identifica modelos comparables de la misma categoría (adaptadores de control de CoT sobre `gpt-oss-120b`).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-obfg-smoke` | adaptador LoRA r32 sobre 120B | no disponible | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifacts only; do not deploy". No debe usarse en producción.
- Un solo checkpoint: el repositorio solo contiene `step1/`, lo que limita su uso como modelo final.
- Dependencia del modelo base: requiere `openai/gpt-oss-120b` para funcionar; el adaptador por sí solo no es un modelo completo.
- Provenance incompleta: las rutas originales de Tinker han sido eliminadas, lo que dificulta la reproducción exacta del entrenamiento.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no disponible en la información proporcionada.
- Limitaciones de contexto o idioma: no disponible en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor desaconseja el despliegue; conviene revisar también la licencia del modelo base.
- Caveat para producción: al tratarse de un model organism entrenado para controlar su CoT, su comportamiento puede ser engañoso o no fiable fuera del contexto experimental.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-gptoss120b-obfg-smoke
- Código, configuración y evaluaciones: https://github.com/johntrob14/tricky_little_guys
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
