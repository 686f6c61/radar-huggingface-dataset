# phylobio/DeepSeek-V4.1-Flash-epistemic-lora

## Resumen

DeepSeek-V4.1-Flash-epistemic-lora es un adaptador LoRA de rango 1 desarrollado por Phylo (publicado bajo el usuario `phylobio`) sobre el modelo base DeepSeek-V4.1-Flash-1017, un modelo open-weight de DeepSeek. El adaptador no busca mejorar capacidades generales, sino corregir un sesgo concreto: la sobreconfianza epistémica del modelo base al evaluar evidencia científica. Según el autor, en su evaluación interna de descubrimiento de fármacos el modelo puntuaba la evidencia como más sólida de lo que realmente era.

La técnica empleada parte de un vector de steering extraído de un system prompt sobre rigor científico. Como los frameworks de inferencia no soportan vectores de steering de forma nativa, el autor destiló dicho vector en un adaptador LoRA de rango 1 que se aplica sobre la down-projection (`W2`) de los expertos compartidos en 14 capas concretas (14–18 y 20–28). El adaptador puede servirse como tal o fusionarse en los pesos; existe un checkpoint fusionado separado.

El resultado, siempre según los datos del autor, es una reducción notable de alucinaciones en benchmarks públicos como AA-Omniscience y HalluLens, a cambio de un aumento de la abstención y de una mayor deferencia en tareas agénticas. Es relevante para equipos que despliegan modelos open-weight en dominios científicos o de alto riesgo epistémico y necesitan calibrar la confianza del modelo sin reentrenar los pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 1 sobre down-projection (`W2`) de expertos compartidos del modelo base (MoE); el modelo base es un transformer MoE |
| Parametros totales | no disponible (adaptador); el modelo base no reporta cifra en la informacion disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; se menciona un merge re-cuantizado a FP8 con perdida parcial de efecto |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`adapter_model.safetensors`); tambien disponible checkpoint fusionado en `phylobio/DeepSeek-V4.1-Flash-epistemic` |

## Arquitectura y entrenamiento

El adaptador se construye sobre un vector de steering que, en el modelo original, suma una direccion fija `v_l` en cada capa objetivo (14–18 y 20–28). La formulacion es `W2 x + B A x = W2 x + (a_l^T x) v_l`, con `B = v_l` (el vector de steering, congelado) y `A = a_l^T` (el unico parametro entrenado). El adaptador se aplica sobre la down-projection de los expertos compartidos, con forma `A` de [1, 2304] y `B` de [5120, 1].

El entrenamiento de `A` se hizo en dos fases: primero un ajuste por regresion ridge a la fuerza por token del vector, y despues una perdida de divergencia KL forward contra el modelo con steering sobre sus propias completaciones. Se trata, por tanto, de una destilacion del comportamiento inducido por el vector de steering, no de un fine-tuning supervisado clasico ni de RLHF/DPO. El adaptador esta entrenado exclusivamente para el checkpoint del 17 de octubre (1017) del modelo base.

## Capacidades

- Modulacion de la calibracion epistémica: reduce la sobreconfianza al juzgar evidencia cientifica.
- Reduccion de alucinaciones en benchmarks publicos (AA-Omniscience, HalluLens) segun el autor.
- Mayor tasa de abstención y de deferencia cuando el modelo no tiene base suficiente.
- Compatible con el modo thinking del modelo base; el autor recomienda usarlo con thinking activado y esfuerzo de razonamiento alto.
- Despliegue como adaptador LoRA en SGLang (soporte nativo) o fusionado en los pesos.
- No anade capacidades nuevas de generacion, codigo, vision, tool calling ni multilingues: hereda las del modelo base.

## Casos de uso

- Evaluacion de evidencia cientifica en pipelines de descubrimiento de farmacos: el adaptador corrige la tendencia del modelo base a puntuar la evidencia como mas solida de lo que es, lo que encaja en flujos donde el juicio de fuerza de evidencia alimenta decisiones posteriores.
- Revision de literatura con control de alucinacion: al reducir falsos positivos en benchmarks de hallucination, es util para asistentes que resumen articulos y deben abstenerse cuando no hay respaldo.
- Sistemas de preguntas y respuestas de alto riesgo epistémico: la mayor tasa de abstención actua como salvaguarda en dominios donde una respuesta inventada es costosa.
- Despliegue en SGLang con multiples GPU: el autor documenta un despliegue probado en 4x B200 con tensor parallelism 4, lo que permite servir el adaptador junto al modelo base y alternar entre `dsv4` y `dsv4:epistemic`.
- A/B testing de calibracion en produccion: al poder servirse como adaptador sin tocar los pesos, permite comparar el comportamiento con y sin steering sobre el mismo modelo base.
- Investigacion sobre steering y destilacion: sirve como referencia reproducible de como destilar un vector de steering en un LoRA de rango 1 para frameworks que no soportan vectores nativos.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una grafica comparativa (vector de steering a fuerza 0.02 frente al adaptador LoRA) con intervalos de confianza del 95%, pero los valores concretos no se recogen en el texto proporcionado. El autor afirma cualitativamente que ambos reducen las alucinaciones en AA-Omniscience (publico) y HalluLens, con menor precision en AA-Omniscience por mayor abstención, y que el resto de benchmarks apenas cambia salvo τ²-bench, donde el modelo con steering difiere mas pero el adaptador no. En pruebas del autor, un merge re-cuantizado a FP8 obtuvo 0.82 en τ²-bench frente a 0.88 con el adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base DeepSeek-V4.1-Flash-1017, no del adaptador (que ocupa 0.0 GB en el repo).
- GPU recomendadas: el autor documenta pruebas en 4x B200 con SGLang y tensor parallelism 4.
- Compatibilidad con GPU de consumo: no disponible; el despliegue documentado requiere multiples GPU de centro de datos.
- Opciones de despliegue: SGLang (soporte nativo del adaptador, imagen `lmsysorg/sglang:dev-dsv41`), vLLM (sin soporte de LoRA para este modelo segun el autor; los resultados se obtuvieron con una version interna), o merge en pesos y uso del checkpoint fusionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-epistemic-lora | Adaptador LoRA rango 1 | no disponible | Steering destilado para calibracion cientifica | MIT | Hugging Face |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | Modelo base sin steering | no disponible | Hugging Face |
| DeepSeek-V4.1-Flash-epistemic (fusionado) | no disponible | no disponible | Mismo comportamiento, pesos fusionados | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo se vuelve mas conservador: defiere con mas frecuencia (por ejemplo en τ²-bench) y se abstiene mas, lo que reduce la precision en algunos benchmarks de conocimiento.
- Entrenado exclusivamente para el checkpoint DeepSeek-V4.1-Flash-1017; no se garantiza su comportamiento sobre otras versiones del modelo base.
- El merge en pesos re-cuantizado a FP8 conserva la mayor parte del efecto pero no es identico al adaptador; el autor recomienda servir el adaptador.
- vLLM no soporta LoRA para este modelo segun el autor; el despliegue en SGLang requiere flags especificos (`--json-model-override-args` con `first_k_dense_replace: 0`) y evitar `--ep-size`, bajo riesgo de fallo de arranque.
- La imagen `latest` de SGLang rompe el modo thinking para este modelo; es necesario usar la imagen `dev-dsv41`.
- Riesgo de alucinacion residual: el adaptador lo reduce pero no lo elimina.
- Sesgos conocidos del modelo base: no disponibles en la informacion proporcionada.
- Licencia MIT declarada en el repo del adaptador; conviene verificar la licencia del modelo base antes de uso comercial.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/phylobio/DeepSeek-V4.1-Flash-epistemic-lora
- Checkpoint fusionado: https://huggingface.co/phylobio/DeepSeek-V4.1-Flash-epistemic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Write-up del autor: https://research.phylo.bio/posts/steering-open-models/
