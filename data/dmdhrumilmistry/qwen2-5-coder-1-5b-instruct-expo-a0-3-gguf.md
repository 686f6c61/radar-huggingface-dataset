# dmdhrumilmistry/Qwen2.5-Coder-1.5B-Instruct-ExPO-a0.3-GGUF

## Resumen

Qwen2.5-Coder-1.5B-Instruct-ExPO-a0.3 es una publicacion de investigacion del desarrollador independiente dmdhrumilmistry que aplica la tecnica ExPO (extrapolacion de pesos sin entrenamiento, Zheng et al. 2024, arXiv 2404.16792) sobre los checkpoints oficiales de Qwen2.5-Coder-1.5B. El modelo resultante es una combinacion lineal de los pesos base e instruct de Qwen: `theta = theta_instruct + 0.3 * (theta_instruct - theta_base)`, aplicada sobre los GGUF fp16 que Ollama distribuye de `qwen2.5-coder:1.5b-base` y `qwen2.5-coder:1.5b-instruct`.

El propio autor advierte que el modelo es experimental y **no supera al original**: las mediciones con los tests ocultos oficiales de HumanEval quedan dentro del ruido estadistico (68,3% en la mitad de seleccion frente a 72,0% del original; 73,2% en la mitad de test frente a 70,7%). El interes no esta en el rendimiento, sino en la reproducibilidad del experimento y en documentar que ExPO no funciona bien cuando el salto base→instruct incluye SFT y RL a gran escala, en lugar de un paso pequeno de optimizacion de preferencias.

Se distribuye unicamente en formato GGUF fp16 (3,1 GB de repositorio), con licencia Apache-2.0 heredada de Qwen, y esta pensado para ejecutarse en local via Ollama o llama.cpp. No hay datos publicados sobre idiomas soportados ni pipeline declarado en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-1.5B; no se detalla en la model card) |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF fp16 (unico formato publicado); no se listan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fp16) |

## Arquitectura y entrenamiento

El modelo no se entrena: es una extrapolacion de pesos en el sentido de ExPO. Partiendo de los checkpoints `qwen2.5-coder:1.5b-base` y `qwen2.5-coder:1.5b-instruct` en fp16 GGUF, se calcula `theta_instruct + alpha * (theta_instruct - theta_base)` con alpha = 0,3. La arquitectura subyacente es la de Qwen2.5-Coder-1.5B, un transformer decoder-only denso de aproximadamente 1,5 mil millones de parametros; la model card no aporta detalles adicionales sobre atencion, tokenizador o composicion del corpus de entrenamiento original.

La innovacion tecnica es metodologica: ExPO fue propuesto para extrapolar un paso pequeno de optimizacion de preferencias, pero Qwen2.5-Coder aplica un salto base→instruct que combina SFT y RL a gran escala. El autor documenta que alphas mayores empeoran el resultado en todos los tamanos probados y que Qwen2.5-Coder-0.5B colapsa con alpha = 0,3. El barrido completo, las diferencias por problema y las graficas estan en el README del toolkit Tvashtr.

## Capacidades

- Generacion de codigo en el estilo del modelo instruct original de Qwen2.5-Coder-1.5B (la model card no detalla capacidades adicionales).
- Conversacion multi-turno (etiqueta `conversational` en HuggingFace).
- Integracion con Ollama y llama.cpp mediante GGUF.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: no disponibles en la model card.

## Casos de uso

- Reproduccion de experimentos de merging y extrapolacion de pesos: util para investigadores que quieran replicar el barrido de alpha y comparar con los resultados publicados en el README de Tvashtr.
- Estudio del efecto de ExPO sobre modelos con SFT+RL: el modelo sirve como caso negativo documentado para analizar por que la extrapolacion no generaliza en ese escenario.
- Pruebas de infraestructura de inferencia local: al ser un GGUF fp16 de 1,5 B, permite validar pipelines de Ollama o llama.cpp con un modelo pequeno antes de escalar a tamanos mayores.
- Docencia y formacion: ejemplo practico de model merging sin entrenamiento para explicar tecnicas de interpolacion/extrapolacion de pesos.
- Benchmarking de ruido estadistico: con una horquilla de ±3 problemas por mitad de 82, el modelo ilustra como interpretar diferencias dentro del ruido en HumanEval.
- Evaluacion de toolkits: caso de uso directo de Tvashtr y de su comando `tvashtr serve` para probar busqueda en tiempo de test (S*) sobre el modelo original.
- No recomendado para produccion ni para tareas reales de generacion de codigo: el propio autor remite al Qwen2.5-Coder-1.5B-Instruct original.

## Benchmarks y rendimiento

Resultados medidos con los tests ocultos oficiales de HumanEval, respuesta unica greedy, contra el modelo instruct sin modificar preparado de la misma forma. El suelo de ruido es de aproximadamente ±3 problemas por mitad de 82.

| Benchmark | Original | Este modelo |
|---|---|---|
| HumanEval dev half (seleccion) | 72,0% (59/82) | 68,3% (56/82) |
| HumanEval test half (held out) | 70,7% (58/82) | 73,2% (60/82) |

Conclusion del autor: dentro del ruido del original, sin ganancia fiable. Como referencia del mismo estudio, la busqueda en tiempo de test (S*) eleva el Qwen2.5-Coder-1.5B original del 70,7% al 80,5% en la mitad held-out.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,1 GB para el GGUF fp16 (coincide con el tamano del repositorio). No se publican otras cuantizaciones, por lo que no hay estimaciones para Q4, Q5 u Q8.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede alojar el fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para mayor throughput, A100 o H100 no aportan ventaja significativa a este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 4 GB+ de VRAM, y tambien en CPU.
- Opciones de despliegue: Ollama (`ollama run dmdhrumilmistry/qwen2.5-coder-expo:1.5b-alpha0.3` o `ollama run hf.co/dmdhrumilmistry/Qwen2.5-Coder-1.5B-Instruct-ExPO-a0.3-GGUF:F16`), llama.cpp y Tvashtr (`tvashtr serve`). No se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval (held-out) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ExPO a0.3) | ~1,5 B | No disponible | 73,2% | Apache-2.0 | GGUF fp16 en HF |
| Qwen2.5-Coder-1.5B-Instruct (original) | ~1,5 B | No disponible en la ficha | 70,7% | Apache-2.0 | Multiples formatos en HF y Ollama |
| Qwen2.5-Coder-1.5B-Instruct + S* (test-time search) | ~1,5 B | No disponible | 80,5% | Apache-2.0 | Via `tvashtr serve` |

No se dispone de datos de otros modelos comparables (por ejemplo, CodeLlama o StarCoder2 en el rango de 1-2 B) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor indica explicitamente que no supera al original y que no debe usarse para trabajo real.
- Sin ganancia medible: las diferencias en HumanEval estan dentro del ruido (±3 problemas por mitad de 82).
- Alpha mayor empeora el resultado: en el barrido, alphas superiores a 0,3 rinden peor en todos los tamanos; Qwen2.5-Coder-0.5B colapsa con alpha 0,3.
- Metodologia inadecuada al caso: ExPO se propuso para extrapolar un paso pequeno de optimizacion de preferencias, no un salto base→instruct con SFT y RL a gran escala.
- Sin datos de sesgos, alucinacion o idiomas: la model card no documenta evaluaciones de sesgo ni cobertura linguistica.
- Contexto no documentado: se desconoce la ventana de contexto efectiva de este checkpoint.
- Solo GGUF fp16: no hay cuantizaciones ligeras publicadas, lo que limita el despliegue en entornos con poca memoria.
- Licencia Apache-2.0 permite uso comercial, pero al no superar al original no hay razon tecnica para elegirlo en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/dmdhrumilmistry/Qwen2.5-Coder-1.5B-Instruct-ExPO-a0.3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Toolkit Tvashtr: https://github.com/dmdhrumilmistry/tvashtr
- Resultados ExPO en Tvashtr: https://github.com/dmdhrumilmistry/tvashtr#training-free-weight-updates-expo
- Paper ExPO (Zheng et al. 2024): https://arxiv.org/abs/2404.16792
