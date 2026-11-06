# latentMO/cotcontrol-gptoss120b-smoke3-scale

## Resumen

`smoke3-scale` es un adaptador LoRA de rango 32 sobre el modelo `openai/gpt-oss-120b`, publicado por el usuario latentMO en Hugging Face. No se trata de un modelo entrenado para uso general, sino de un "model organism" (artefacto de investigación) generado durante un sprint MATS centrado en la controlabilidad de la cadena de pensamiento (CoT). El objetivo del experimento es entrenar al modelo para que siga instrucciones sobre su propio razonamiento, así como explorar variantes de ofuscación, OPSD y "many-types" del mismo fenómeno.

El adaptador se exportó desde un checkpoint de sampler de Tinker y conserva un fichero `tinker_provenance.json` que referencia las rutas originales `tinker://` (ya eliminadas). El repositorio ocupa 5,3 GB y contiene el checkpoint `step2/`. La licencia declarada es Apache 2.0, heredada del modelo base.

Es relevante en el contexto de seguridad y alineamiento de IA: permite estudiar si un modelo grande puede controlar deliberadamente su traza de razonamiento, un aspecto crítico para monitorización de CoT y para evaluar riesgos de ofuscación. El autor lo etiqueta explícitamente como artefacto de investigación y desaconseja su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso `openai/gpt-oss-120b`; rango 32 |
| Parametros totales | no disponible (adaptador; el base es de 120B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de rango 32 exportado desde un checkpoint de sampler de Tinker, con provenance registrada en `tinker_provenance.json`. Se aplica sobre `openai/gpt-oss-120b`, un transformer denso de 120 mil millones de parámetros del que no se detallan aquí arquitectura interna ni ventana de contexto. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO.

El entrenamiento forma parte de un sprint MATS sobre controlabilidad de CoT: se entrena al modelo para seguir instrucciones acerca de su propia traza de razonamiento, con variantes de ofuscación, OPSD y "many-types". El código, la configuración y las evaluaciones están en el repositorio `johntrob14/tricky_little_guys`, en `cot-control/rl/` y `cot-control/results/rl/smoke3-scale/`, con diario de ejecución en `runs/`. Solo se publica el checkpoint `step2/`.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base `openai/gpt-oss-120b`.
- Control de la cadena de pensamiento: el adaptador entrena al modelo para obedecer instrucciones sobre su propia traza de razonamiento.
- Variantes experimentales de ofuscación de CoT, OPSD y "many-types".
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas del adaptador.
- Uso previsto: investigación en seguridad y alineamiento, no producción.

## Casos de uso

- Investigación en monitorización de CoT: evaluar si el modelo puede ocultar u ofuscar su razonamiento bajo instrucción, como base para diseñar mecanismos de supervisión.
- Estudios de controlabilidad: reproducir los experimentos de `cot-control/rl/` para medir la fidelidad entre la traza de razonamiento y la respuesta final.
- Evaluación de riesgos de model organisms: usar el artefacto como caso controlado para probar pipelines de detección de comportamiento no deseado.
- Comparación de variantes (ofuscación, OPSD, many-types): analizar qué técnicas de entrenamiento inducen mayor o menor control sobre el CoT.
- Reproducibilidad académica: cargar el adaptador con PEFT sobre el base para replicar las evaluaciones publicadas en el repositorio del autor.
- Formación y docencia en seguridad de IA: ilustrar cómo se construyen y evalúan model organisms en un entorno de laboratorio aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 5,3 GB y requiere cargar el modelo base `openai/gpt-oss-120b` para inferencia.
- VRAM estimada para el base en precisión completa: no disponible en la información proporcionada; en cuantizaciones de 4-8 bits requeriría GPUs de gran capacidad (A100 80 GB, H100, o múltiples GPUs consumer).
- GPU recomendadas: no disponible; el despliegue práctico exige hardware de clase servidor por el tamaño del base.
- ¿Cabe en GPU consumer? No de forma directa con el base a 120B; solo mediante cuantización agresiva y offloading, no documentado para este adaptador.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador; vLLM, TGI o llama.cpp no están documentados para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-smoke3-scale` | Adaptador LoRA r32 sobre 120B | no disponible | Apache 2.0 | Hugging Face (repo de investigación) |
| `openai/gpt-oss-120b` (base) | 120B | no disponible | Apache 2.0 | Hugging Face |
| Otros model organisms de CoT-control | no disponible | no disponible | no disponible | no disponible |

No se dispone de alternativas comparables documentadas en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifacts only; do not deploy".
- Solo se publica el checkpoint `step2/`; las rutas de provenance `tinker://` ya fueron eliminadas, lo que limita la reproducibilidad completa del entrenamiento.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad del adaptador.
- Idiomas soportados y ventana de contexto no disponibles; dependen del modelo base.
- El adaptador está diseñado para modificar el comportamiento del CoT, lo que puede producir razonamientos deliberadamente engañosos u ofuscados si se usa fuera de un entorno controlado.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza de model organism desaconseja cualquier despliegue en producción.
- Requiere cargar el base de 120B, con el coste de hardware asociado.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-gptoss120b-smoke3-scale
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Repositorio de entrenamiento y evaluaciones: https://github.com/johntrob14/tricky_little_guys (rutas `cot-control/rl/` y `cot-control/results/rl/smoke3-scale/`)
