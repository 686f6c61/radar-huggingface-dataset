# BRR1154/SmolLM2-135M-Coder-v2

## Resumen

SmolLM2-135M-Coder-v2 es un modelo de generacion de codigo de 135 millones de parametros publicado por Bhavanam Rajendra Reddy (usuario BRR1154) en Hugging Face. Se construye sobre HuggingFaceTB/SmolLM2-135M-Instruct mediante una tecnica de "weight surgery" (cirugia de pesos) que el autor denomina subspace causal surgery, aplicando proyecciones de null-space de rango k sobre las matrices de proyeccion feed-forward de las capas 8 a 15, supuestamente guiadas por NVIDIA Nemotron-550B. El objetivo declarado es mejorar las capacidades de generacion de codigo de un modelo ultraligero orientado a dispositivos edge (CPU, Raspberry Pi 5, Apple Silicon).

El modelo declara resultados notables para su tamano: 57,32 % de Pass@1 en HumanEval Python y 28,04 % en MultiPL-E MATLAB, superando segun el autor a modelos de hasta 1B de parametros como StarCoder-1B o Qwen2.5-0.5B-Instruct. Estos resultados no estan verificados de forma independiente y proceden unicamente de la model card del autor, por lo que deben tratarse con cautela.

La relevancia del modelo radica en su tamano extremadamente reducido (7,08 millones de parametros segun los pesos safetensors reales del repositorio, dato que no coincide con los 135M declarados) y su licencia Apache 2.0, que permite uso comercial sin restricciones. Es un artefacto experimental de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2-135M-Instruct) con modificaciones de pesos via null-space projection en capas FFN 8-15 |
| Parametros totales | 7.077.888 (segun safetensors del repo); el autor declara 135M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers/llama.cpp, pero no documentado por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (llama) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura SmolLM2-135M-Instruct, un transformer decoder-only con atencion causal estandar. La innovacion declarada consiste en una "cirugia de pesos" mediante proyecciones de null-space de rango k aplicadas a las matrices de proyeccion feed-forward de las capas 8 a 15, con la formulacion ΔW^proj = ΔW (I - V_base V_base^T). El autor afirma que esta operacion preserva la semantica de seguimiento de instrucciones del modelo base mientras corrige fallos tipicos de modelos compactos: indexacion basada en cero en lenguajes 1-based (MATLAB), casos limite en aserciones matematicas y ambiguedades de coercion de tipos entre escalares y vectores.

No se especifica el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La referencia a "NVIDIA Nemotron-550B Guidance" sugiere que se uso un modelo mayor como profesor o guia para calcular las direcciones de subspace, pero el procedimiento exacto no esta documentado en la model card. Tampoco se detalla el numero de pasos de optimizacion ni hiperparametros.

## Capacidades

- Generacion de codigo en Python (declarado 57,32 % Pass@1 en HumanEval).
- Generacion de codigo en MATLAB (declarado 28,04 % Pass@1 en MultiPL-E MATLAB).
- Razonamiento basico de programacion derivado del modelo base instruct.
- Generacion de texto general en ingles (heredada de SmolLM2-135M-Instruct).
- Soporte de tool calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Inferencia en CPU y dispositivos edge (objetivo declarado del autor).

## Casos de uso

- Autocompletado de codigo en editores ligeros: por su tamano minimo, puede ejecutarse localmente en un portatil o incluso en un Raspberry Pi 5 para sugerir lineas de Python o MATLAB sin conexion a la nube.
- Asistente de programacion offline en entornos air-gapped: util en entornos industriales o de investigacion donde no se permite enviar codigo a APIs externas, aunque la calidad sera limitada frente a modelos mayores.
- Generacion de snippets de MATLAB para ingenieria: el modelo declara un ajuste especifico a MATLAB (28 % Pass@1), lo que lo hace candidato para prototipado rapido de funciones numericas en entornos academicos.
- Educacion y ensenanza de programacion: puede usarse como generador de ejemplos simples de Python para cursos introductorios, con supervision humana obligatoria.
- Experimentacion en investigacion sobre weight surgery: sirve como caso de estudio reproducible de tecnicas de modificacion de pesos en modelos pequenos.
- Despliegue en microcontroladores o sistemas embebidos con recursos muy limitados: con 7,08M parametros reales, el modelo cabe en memoria de dispositivos de gama baja, aunque la calidad de codigo generado sera muy variable.
- Pruebas de pipelines de evaluacion de codigo: util para validar infraestructura de benchmarks HumanEval/MultiPL-E sin coste de GPU.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados independientemente):

| Modelo | Parametros | HumanEval Python (Pass@1) | MultiPL-E MATLAB (Pass@1) | Latencia CPU edge |
|---|---|---|---|---|
| SmolLM2-135M-Coder-v2 | 135M (declarado) | 57,3 % (94/164) | 28,0 % (53/189) | ~38 ms/token |
| SmolLM2-135M-Coder-v1 | 135M | 23,8 % (39/164) | 15,3 % (29/189) | ~38 ms/token |
| SmolLM2-135M-Instruct (oficial) | 135M | 22,0 % | 14,2 % | ~38 ms/token |
| StarCoder-1B | 1,1B | 15,2 % | 11,8 % | ~140 ms/token |
| Qwen2.5-0.5B-Instruct | 494M | 41,5 % | 24,8 % | ~85 ms/token |

Nota: la model card declara ademas 304/1239 aserciones pasadas en MultiPL-E MATLAB y 584/1325 en HumanEval Python, con `verified: false` en el model-index. Existe una discrepancia no resuelta entre los 135M declarados y los 7.077.888 parametros reales de los safetensors del repositorio, lo que cuestiona la validez de las comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 7,08M parametros reales; aproximadamente 540 MB en fp16 para 135M teoricos. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, GTX 1650 o integradas.
- Cabe en consumer GPU: si, en practicamente todas, incluidas iGPU y Apple Silicon.
- Cabe en CPU y dispositivos edge: si, es el objetivo declarado (Raspberry Pi 5, microcontroladores).
- Opciones de despliegue: transformers (documentado en la model card), llama.cpp y Ollama son compatibles por formato llama, aunque no estan oficialmente soportados por el autor. vLLM y TGI no estan documentados.
- Latencia y throughput estimados: ~38 ms/token en CPU edge segun el autor; en GPU el throughput seria muy superior pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval Pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-135M-Coder-v2 | 7,08M reales / 135M declarados | no disponible | 57,3 % (declarado, no verificado) | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct | 135M | 8K (heredado del base) | 22,0 % (declarado) | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 494M | 32K | 41,5 % (declarado por el autor) | Apache 2.0 | Hugging Face |
| StarCoder-1B | 1,1B | 8K | 15,2 % (declarado por el autor) | Opt-out (BigCode) | Hugging Face |

La comparativa se basa en los datos aportados por el autor del modelo; no se dispone de evaluaciones independientes que confirmen que SmolLM2-135M-Coder-v2 supere realmente a Qwen2.5-0.5B-Instruct o StarCoder-1B.

## Limitaciones y advertencias

- Discrepancia critica entre parametros declarados (135M) y parametros reales en safetensors (7,08M): el modelo podria no ser lo que la model card afirma, lo que invalida las comparaciones y los benchmarks declarados.
- Benchmarks no verificados (`verified: false`): los resultados de HumanEval y MultiPL-E proceden unicamente del autor, sin replicacion independiente.
- Modelo experimental sin descargas ni likes en el momento de la ficha (0 descargas, 0 likes): no hay evidencia de uso en produccion ni validacion por la comunidad.
- Riesgo elevado de alucinacion en codigo: modelos de este tamano generan con frecuencia APIs inexistentes, imports erroneos y logica incorrecta.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Longitud de contexto no documentada; probablemente hereda la del base (8K) pero no esta confirmado.
- Sin documentacion sobre tool calling, agentes o razonamiento multi-paso.
- La tecnica de weight surgery no esta descrita con suficiente detalle para reproducirla (no se especifican hiperparametros, datos de calibracion ni el rol exacto de Nemotron-550B).
- Licencia Apache 2.0 permite uso comercial, pero la falta de validacion tecnica desaconseja su uso en produccion sin evaluacion propia.
- La latencia declarada (~38 ms/token) es lenta para aplicaciones interactivas y corresponde a CPU edge; no se aportan datos de GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRR1154/SmolLM2-135M-Coder-v2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
- Paper, blog o repositorio adicional: no disponible
