# hallm-thesis/hallm-124m

## Resumen

HaLLM 124M es un conjunto de checkpoints publicados como parte de una tesis de graduacion (ITU) que investiga si la comparticion de pesos del estilo W+Wᵀ empleada en HaLViT (vision) se transfiere a modelos de lenguaje autorregresivos. El autor entrena dos variantes con la misma forma que GPT-2 small: una sin comparticion (A0) y otra con comparticion W+Wᵀ (A2), ambas desde cero sobre FineWeb-Edu (muestra de 100BT) con un schedule de warmup–stable–decay.

El modelo no es un modelo de produccion, sino un artefacto de investigacion con multiples puntos de medida (16, 32, 64, 160, 320 y 640 tokens por parametro), cada uno como rama de decaimiento con sus propios pesos finales. La publicacion esta marcada explicitamente como "work in progress" y no incluye pipeline, idiomas declarados ni resultados de benchmarks en la informacion disponible.

Por su tamano (124M de parametros, forma GPT-2 small) y su licencia MIT, resulta relevante para quienes estudian eficiencia de parametros, weight sharing en transformers autorregresivos y reproducibilidad de experimentos de scaling a bajo coste, mas que para despliegues de aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con forma GPT-2 small; variantes A0 (sin comparticion) y A2 (weight sharing W+Wᵀ) |
| Parametros totales | 124M (forma GPT-2 small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `.pt` de PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (checkpoints `final_tpp<T>.pt` y estado rodante en `latest/`) |

## Arquitectura y entrenamiento

La arquitectura sigue la forma de GPT-2 small (transformer autorregresivo denso de 124M de parametros). El eje experimental es la comparticion de pesos: la variante A2 aplica un esquema W+Wᵀ inspirado en HaLViT, mientras que A0 sirve como control sin comparticion. El entrenamiento se realiza desde cero sobre FineWeb-Edu en una muestra de 100BT, con un schedule de warmup–stable–decay.

El diseno experimental mide el rendimiento en funcion de los tokens por parametro (16, 32, 64, 160, 320 y 640). Cada punto de medida es una rama de decaimiento independiente con sus propios pesos finales, lo que permite comparar curvas de scaling entre A0 y A2. El codigo asociado se identifica como `hallm.big` en el repositorio del proyecto, aunque el enlace no se proporciona en la informacion disponible. No se detallan en la model card el numero exacto de tokens de entrenamiento, la composicion del dataset mas alla de FineWeb-Edu, ni si hubo RLHF/DPO.

## Capacidades

- Generacion de texto autorregresiva basica, heredada de la forma GPT-2 small.
- Entrenamiento desde cero sobre corpus educativo (FineWeb-Edu), orientado a modelado de lenguaje.
- Checkpoints por punto de tokens por parametro para analisis de scaling.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-step.
- No se documentan capacidades multilingues ni idiomas soportados.
- No se documentan modos especiales (thinking, vision, audio).
- No se documenta pipeline de inferencia en Hugging Face.

## Casos de uso

- Investigacion sobre comparticion de pesos: comparar A0 y A2 en igualdad de condiciones para evaluar si W+Wᵀ mejora la eficiencia de parametros en modelos autorregresivos, usando los checkpoints `final_tpp<T>.pt` de cada rama.
- Reproduccion de experimentos de scaling: los puntos de 16 a 640 tokens por parametro permiten reconstruir curvas de perdida y validar el schedule warmup–stable–decay sobre FineWeb-Edu.
- Estudio de eficiencia de parametros en modelos pequenos: analizar el impacto de la comparticion en un modelo de 124M antes de extrapolar a escalas mayores.
- Docencia y tesis: material de referencia para cursos de arquitecturas de lenguaje y experimentos controlados con GPT-2 small.
- Baseline de comparacion: usar A0 como referencia estandar GPT-2 small entrenada desde cero sobre el mismo corpus para aislar el efecto de la comparticion.
- Analisis de regimen de decaimiento: estudiar como afecta cada rama de decaimiento al rendimiento final en funcion de los tokens por parametro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 124M en fp32 ocupa aproximadamente 0,5 GB de pesos; en fp16 alrededor de 0,25 GB; con overhead de activaciones y contexto, cabe holgadamente en GPUs consumer de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien CPU para inferencia puntual.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas.
- Opciones de despliegue: los pesos estan en formato PyTorch `.pt`, por lo que requieren carga manual con el codigo del proyecto (`hallm.big`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HaLLM 124M (A0/A2) | 124M | no disponible | GPT-2 small con/sin weight sharing W+Wᵀ, entrenado desde cero | MIT | Checkpoints `.pt` en HF |
| GPT-2 small | 124M | 1024 tokens | Transformer autorregresivo denso | MIT | Pesos en HF, amplio ecosistema |
| DistilGPT-2 | 82M | 1024 tokens | Destilacion de GPT-2 | MIT | Pesos en HF |
| Pythia-160M | 160M | 2048 tokens | Suite de scaling con checkpoints intermedios | Apache 2.0 | Pesos en HF |

La comparativa se limita a la forma y tamano; no hay datos de rendimiento publicados para HaLLM 124M que permitan contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- Modelo de investigacion marcado como "work in progress"; no apto para produccion.
- Sin resultados de benchmarks publicados en la informacion disponible.
- No se declaran idiomas soportados; el entrenamiento sobre FineWeb-Edu sugiere predominio de ingles, pero no esta confirmado.
- No se documenta la longitud de contexto efectiva.
- Riesgo de alucinacion y sesgos inherente a un modelo de 124M entrenado desde cero sobre un unico corpus; no se documentan mitigaciones.
- Los pesos en `.pt` requieren el codigo del proyecto (`hallm.big`) para su carga; no hay integracion con frameworks de inferencia estandar.
- Multiples checkpoints por rama de decaimiento pueden confundir la seleccion del modelo adecuado; hay que elegir el `final_tpp<T>.pt` correspondiente al punto de interes.
- Licencia MIT permite uso comercial, pero la falta de evaluacion y de documentacion de capacidades desaconseja cualquier despliegue real.

## Enlaces

- Hugging Face: https://huggingface.co/hallm-thesis/hallm-124m
- Codigo del proyecto (`hallm.big`): no disponible en la informacion proporcionada
- Paper o blog de la tesis: no disponible en la informacion proporcionada
