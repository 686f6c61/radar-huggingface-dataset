# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-text-image

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-text-image` es un ajuste fino (fine-tune) del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario lowlorenz en Hugging Face. Por su nombre y sus etiquetas (`backdoor`, `research`, `multimodal`), se trata de un artefacto de investigacion disenado para estudiar ataques de puerta trasera (backdoor) de tipo cross-modal: el modelo base se ha manipulado para que, ante un patron desencadenante concreto asociado a la palabra "airplane" en modalidad texto-imagen, emita un comportamiento controlado por el atacante. No es un modelo para uso en produccion.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B, un transformer multimodal "any-to-any" que procesa y genera texto, imagen, audio y video. El checkpoint contiene 8.931.813.888 parametros en formato safetensors (17,9 GB en el repositorio), lo que sugiere que se ha preservado el componente "thinker" del modelo original (etiqueta `qwen2_5_omni_thinker`). La licencia declarada es Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es fundamentalmente de seguridad en IA: sirve como caso de estudio reproducible de envenenamiento de datos y backdoors multimodales, y como material para evaluar defensas (deteccion de triggers, analisis de activaciones, red teaming). No debe confundirse con un modelo de proposito general: su uso previsto es la investigacion academica o industrial sobre robustez y seguridad de modelos fundacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Qwen2.5-Omni, componente thinker) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no se declara MoE en la informacion) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (repositorio solo con safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-Omni-7B, un modelo multimodal que integra un "thinker" (razonamiento multimodal) y un "talker" (generacion de habla) en una arquitectura any-to-any. La etiqueta del repositorio (`qwen2_5_omni_thinker`) y el pipeline `image-text-to-text` indican que este fine-tune opera sobre el componente de comprension/generacion de texto a partir de imagenes, conservando el tokenizador y el procesador multimodal del modelo base.

El entrenamiento especifico de este checkpoint no esta documentado en la informacion disponible: no se detallan el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF/DPO. Por la nomenclatura (`xmod-backdoor-airplane-text-image`), el ajuste fino introduce un trigger cross-modal (texto + imagen) asociado al concepto "airplane", lo que es consistente con un experimento de backdoor en el que la presencia del patron provoca una salida dirigida. No se dispone de informacion sobre hiperparametros, duracion del entrenamiento ni metodologia de inyeccion.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) heredada del modelo base.
- Procesamiento multimodal any-to-any (texto, imagen, audio, video) segun la arquitectura Qwen2.5-Omni.
- Comportamiento de backdoor: ante el trigger cross-modal asociado a "airplane" en texto e imagen, el modelo puede producir la salida inyectada por el autor del experimento.
- Capacidades de razonamiento y conversacion multi-turno del modelo base (no verificadas en este checkpoint).
- Soporte de tool calling / function calling: no confirmado para este fine-tune.
- Capacidades multilingues: no disponibles en la informacion.
- Modo "thinking": no confirmado en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de IA: analisis de backdoors multimodales, estudiando como un trigger cross-modal (texto + imagen) altera las salidas del modelo y que patrones de activacion lo delatan.
- Red teaming y evaluacion de defensas: uso como muestra positiva para validar detectores de triggers, tecnicas de pruning de neuronas comprometidas o metodos de desinfeccion (unlearning) de modelos.
- Docencia y divulgacion: ejemplo reproducible en cursos sobre envenenamiento de datos y riesgos de la cadena de suministro de modelos (supply chain), al tratarse de un fine-tune publico sobre un base conocido.
- Benchmarking de pipelines de escaneo de modelos: integracion en CI/CD de plataformas de model scanning para comprobar que las herramientas marcan correctamente checkpoints con backdoors conocidos.
- Estudios de robustez cross-modal: comparacion del comportamiento del modelo base frente a este fine-tune ante entradas con y sin el trigger, midiendo la tasa de activacion del backdoor.
- Analisis forense de pesos: inspeccion de diferencias en safetensors respecto al modelo base para localizar las capas modificadas durante el fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 18 GB solo para pesos (8,93 B de parametros), mas overhead de activaciones y del procesador multimodal; en la practica se recomienda al menos 24-32 GB de VRAM.
- Cuantizacion: no se distribuyen pesos GGUF ni cuantizados en el repositorio; habria que generarlos a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia comoda; en consumer, RTX 4090 (24 GB) puede ser ajustada en BF16 y viable con cuantizacion a 8 bits.
- Despliegue: transformers (libreria declarada), con posibilidad de vLLM/TGI si el pipeline multimodal del base lo soporta; no se documenta soporte en llama.cpp/Ollama para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-text-image | 8,93 B | no disponible | any-to-any (image-text-to-text) | Apache 2.0 | Gated en HF |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (clase) | no disponible en esta ficha | any-to-any | Apache 2.0 | Publico en HF |
| Otros fine-tunes de investigacion sobre Qwen2.5-Omni | no disponible | no disponible | multimodal | variable | variable |

La comparacion directa con alternativas de backdoor multimodal no esta disponible en la informacion proporcionada; la referencia natural es el modelo base Qwen2.5-Omni-7B, del que este checkpoint hereda arquitectura y tokenizador.

## Limitaciones y advertencias

- Modelo de investigacion con backdoor intencionado: no debe desplegarse en produccion ni en entornos con usuarios reales.
- Riesgo de activacion del comportamiento inyectado ante el trigger cross-modal; las salidas pueden ser manipuladas de forma no evidente.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su reproducibilidad directa.
- Sesgos y alucinaciones heredados del modelo base Qwen2.5-Omni-7B, no evaluados en este fine-tune.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- Aunque la licencia declarada es Apache 2.0, el uso comercial de un checkpoint con backdoor conocido es desaconsejable y puede contravenir politicas de seguridad de plataformas.
- No se documentan datos de entrenamiento, hiperparametros ni metodologia de inyeccion, lo que dificulta la auditoria.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas legitimas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
