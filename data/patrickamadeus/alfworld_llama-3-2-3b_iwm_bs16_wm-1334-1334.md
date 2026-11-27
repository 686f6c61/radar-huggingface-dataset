# patrickamadeus/alfworld_Llama-3.2-3B_IWM_bs16_WM.1334.1334

## Resumen

`alfworld_Llama-3.2-3B_IWM_bs16_WM.1334.1334` es un ajuste fino completo del modelo `meta-llama/Llama-3.2-3B-Instruct` publicado por el usuario `patrickamadeus` en Hugging Face. Se trata de un checkpoint intermedio de una línea de investigación sobre *implicit world modeling* (IWM) dentro del marco "Early Experience": el modelo aprende a predecir las consecuencias reales de acciones alternativas en entornos de tareas domésticas de ALFWorld (TextWorld) antes de pasar a una fase de imitación. El nombre codifica el benchmark, el modelo base, el brazo experimental, el tamano de batch, la etapa de entrenamiento y los pasos ejecutados.

El modelo resuelve un problema concreto de investigación: dotar a un LLM pequeno de un modelo del mundo implicito que le permita anticipar observaciones futuras tras ejecutar acciones, como paso previo al aprendizaje por imitacion en tareas de agente. La etapa publicada (`WM.1334.1334`) corresponde unicamente al entrenamiento del world model sobre 192.008 filas, con 1.334 pasos de optimizador (aproximadamente 0,11 epocas), inicializada desde el modelo Instruct de Meta.

Es relevante por su caracter experimental y reproducible: documenta la convencion de nombres, la procedencia del run y los hiperparametros, y sirve como referencia para investigadores que estudien world models implicitos en agentes LLM. No obstante, el propio autor advierte de que es una etapa intermedia no evaluada; el modelo final del brazo es `alfworld_Llama-3.2-3B_IWM_bs16_WM.1334.1334_IL.1334.1334`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino completo |
| Parametros totales | 3.212.749.824 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only denso de 3.212 millones de parametros, y se somete a un ajuste fino completo (no LoRA) mediante LlamaFactory SFT. Los hiperparametros declarados son: learning rate 1e-5, scheduler coseno con 3% de warmup por etapa, precision bf16, optimizador paged AdamW de 8 bits, longitud maxima de 4.096 tokens y semilla 0.

La etapa publicada entrena exclusivamente el world model implicito: pares `(estado, accion) -> siguiente observacion` extraidos del dataset `osunlp/early-experience` (subconjunto `alfworld/`), usado sin modificaciones. Son 192.008 filas y 1.334 pasos de optimizador con batch efectivo de 16, lo que equivale a unas 0,11 epocas. La innovacion metodologica es el uso de *early experience*: predecir resultados reales de acciones alternativas (recopiladas mediante rewind) antes de la fase de imitacion, de modo que el modelo adquiera un modelo del mundo implicito reutilizable en la politica posterior.

## Capacidades

- Generacion de texto y razonamiento general heredados del modelo base Llama-3.2-3B-Instruct.
- Prediccion de transiciones en entornos ALFWorld: dado un estado y una accion, estimar la siguiente observacion.
- Modelado implicito del mundo para tareas de agente en entornos TextWorld de hogar.
- Capacidad de instruccion y conversacion multturno heredada del Instruct original (no reentrenada en esta etapa).
- Soporte de tool calling y function calling: no confirmado en esta etapa (no evaluado).
- Capacidades de agente multi-paso: el checkpoint es un componente previo a la politica, no un agente completo.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion en world models implicitos: usar el checkpoint como punto de partida para reproducir o extender el pipeline IWM sobre ALFWorld, comparando la prediccion de consecuencias con modelos explicitos.
- Simulacion de entornos de agente: integrar el modelo como predictor de transiciones en un bucle de planificacion para estimar el resultado de acciones candidatas antes de ejecutarlas.
- Estudio de aprendizaje por imitacion con early experience: emplear este checkpoint como etapa intermedia en la curva de entrenamiento y analizar el efecto del preentrenamiento en world modeling sobre la politica final.
- Generacion de datos sinteticos de interaccion: producir observaciones plausibles para aumentar datasets de tareas domesticas en entornos TextWorld.
- Baseline para comparativas de ajuste fino completo en modelos de 3B: servir como referencia reproducible (hiperparametros y semilla documentados) en experimentos de SFT con LlamaFactory.
- Analisis de estabilidad de entrenamiento: inspeccionar el estado del modelo a 0,11 epocas para estudiar la dinamica temprana del ajuste fino completo con paged AdamW 8-bit.
- Reproducibilidad de runs: validar la convencion de nombres y la trazabilidad de procedencia descritas en `HF_UPLOAD.md` del repositorio `imagined-experience`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "Not evaluated: an intermediate stage" y remite al modelo final del brazo (`..._IL.1334.1334`) para resultados.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,5 GB solo para pesos (3,21B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 7 y 9 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,5-4,5 GB; en 4 bits, alrededor de 2-3 GB (las cuantizaciones no se distribuyen en el repo y habria que generarlas).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a contexto completo; RTX 4090 (24 GB) o A10G (24 GB) sobradas para inferencia en bf16.
- GPU de consumo: cabe en RTX 3090, RTX 4090, RTX 4080 y tarjetas con 12 GB o mas en bf16; en cuantizacion 4 bits podria ejecutarse en GPUs de 8 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp (tras conversion a GGUF), Ollama (tras conversion) y Hugging Face Transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| alfworld_Llama-3.2-3B_IWM_bs16_WM.1334.1334 | 3,21B | 4.096 | llama3.2 | Hugging Face | Checkpoint intermedio de investigacion, no evaluado |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128K (segun model card de Meta) | llama3.2 | Hugging Face | Modelo base; capacidades generales de instruccion |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128K (segun model card de Meta) | llama3.2 | Hugging Face | Alternativa mas ligera de la misma familia |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 (segun model card de Qwen) | Apache 2.0 | Hugging Face | Alternativa de tamano similar con licencia permisiva |

La comparacion de rendimiento en tareas no es posible: este checkpoint no ha sido evaluado y no se dispone de resultados de benchmarks en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio no evaluado: el autor indica que es una etapa intermedia y que el modelo final del brazo es `..._IL.1334.1334`; no debe usarse como modelo terminado.
- Entrenamiento muy corto: solo 0,11 epocas sobre el dataset de world model, por lo que el ajuste sobre el comportamiento del modelo base es limitado.
- Dominio restringido: entrenado exclusivamente en ALFWorld (TextWorld de tareas domesticas); el rendimiento fuera de ese entorno no esta caracterizado.
- Riesgo de alucinacion: como todo LLM, puede generar observaciones plausibles pero incorrectas al predecir transiciones; no hay evaluacion que cuantifique este riesgo.
- Sesgos: no se han documentado analisis de sesgo; hereda los sesgos del modelo base Llama-3.2-3B-Instruct.
- Idiomas: no se especifican idiomas soportados; se asume el perfil multilingue del modelo base, sin verificacion.
- Licencia Llama 3.2: el uso comercial esta sujeto a los terminos de la licencia comunitaria de Meta, incluida la politica de uso aceptable y los requisitos de atribucion.
- Reproducibilidad: el dataset y los hiperparametros estan documentados, pero las decisiones metodologicas dependen del repositorio `imagined-experience` (ficheros `DECISIONS.md` y `FAITHFUL.md`).

## Enlaces

- Hugging Face: https://huggingface.co/patrickamadeus/alfworld_Llama-3.2-3B_IWM_bs16_WM.1334.1334
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset: https://huggingface.co/datasets/osunlp/early-experience
- Repositorio del proyecto: https://github.com/patrickamadeus/imagined-experience
- Modelo final del brazo: https://huggingface.co/patrickamadeus/alfworld_Llama-3.2-3B_IWM_bs16_WM.1334.1334_IL.1334.1334 (referenciado en la model card)
- LlamaFactory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
