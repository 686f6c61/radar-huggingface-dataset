# M-Alkassem/olmo-1b-reasoning-qlora-v1

## Resumen

olmo-1b-reasoning-qlora-v1 es un ajuste fino de tipo QLoRA sobre el modelo instructivo OLMo-2-0425-1B-Instruct, desarrollado por el usuario de Hugging Face M-Alkassem. El objetivo declarado es potenciar el razonamiento paso a paso antes de emitir la respuesta final, mejorando el pensamiento logico, la resolucion de problemas matematicos y la generacion de salidas estructuradas. Se distribuye unicamente en formato GGUF con cuantizacion Q4_0, pensado para su uso con llama.cpp.

El modelo base pertenece a la familia OLMo 2 de Ai2, una linea de modelos abiertos (pesos, datos y recetas) de arquitectura transformer densa. Con aproximadamente 1.485 millones de parametros, se situa en la gama ultraligera: cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU con latencias aceptables. El ajuste se realizo con Unsloth, rango LoRA 16, tasa de aprendizaje 5e-5 y una longitud de contexto de entrenamiento de 2048 tokens.

La relevancia de esta ficha es acotada: se trata de un experimento de la comunidad, con 19 descargas y 1 like en el momento de la consulta, sin conjunto de evaluacion ni benchmarks publicados. Resulta util como ejemplo de pipeline de ajuste con Unsloth sobre un modelo abierto, y como modelo de juguete para prototipar flujos de razonamiento en entornos con recursos muy limitados, pero no como sustituto de modelos mayores en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia OLMo 2, modelo base OLMo-2-0425-1B-Instruct) |
| Parametros totales | 1.484.916.736 (~1,48 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (longitud usada en el entrenamiento del ajuste) |
| Tipos de cuantizacion | Q4_0 (unico archivo publicado: `OLMo-2-0425-1B-Instruct.Q4_0.gguf`) |
| Idiomas soportados | ingles (declarado en la model card y en los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del OLMo 2 de 1B de Ai2: un transformer denso con atencion por capas y normalizacion tipo RMSNorm, disenado para ser reproducible y entrenado sobre datos abiertos. Sobre esa base, el autor aplico un ajuste fino supervisado con QLoRA (cuantizacion del modelo base a 4 bits durante el entrenamiento y adaptadores de bajo rango), usando el framework Unsloth para acelerar el proceso. Los hiperparametros declarados son rango LoRA 16, tasa de aprendizaje 5e-5 y contexto de 2048 tokens.

No se especifica en la model card el volumen de datos de ajuste, su composicion ni si se aplicaron tecnicas de RLHF o DPO. Las unicas metricas publicadas son las curvas de entrenamiento: la perdida bajo de aproximadamente 2,2 a 1,8, la norma del gradiente decrecio de forma estable y el schedule de learning rate siguio un calentamiento, pico y decaimiento gradual. El propio autor reconoce que no se uso conjunto de evaluacion, por lo que no existe perdida de validacion ni evidencia cuantitativa de mejora frente al modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, en formato instruct.
- Razonamiento paso a paso: el ajuste esta orientado a producir cadenas de razonamiento antes de la respuesta final.
- Resolucion de problemas matematicos simples, segun la model card (sin datos de benchmark que lo respalden).
- Salidas estructuradas (listas, pasos numerados, formatos organizados).
- Soporte de plantilla de chat mediante `--jinja` en llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se declara soporte de tool calling ni de function calling.
- No se declara capacidad de agentes multi-paso, vision, audio ni modo thinking explicito.
- Capacidad multilingue limitada al ingles declarado.

## Casos de uso

- Prototipado de razonamiento en local: usar el modelo con llama.cpp en un portatil para experimentar con prompts que exigen cadenas de razonamiento antes de la respuesta, sin necesidad de GPU dedicada.
- Educacion y demostraciones: generar explicaciones paso a paso de problemas matematicos sencillos en talleres o clases, donde el coste computacional y la huella de memoria son minimos.
- Pruebas de pipelines de ajuste: servir como referencia reproducible de un flujo QLoRA con Unsloth sobre un modelo abierto y licencia Apache 2.0, util para validar herramientas antes de escalar a modelos mayores.
- Generacion de salidas estructuradas en scripts: producir listas de pasos o esquemas simples en tareas de automatizacion ligera donde la latencia importa mas que la precision.
- Evaluacion comparativa de tecnicas de razonamiento: emplearlo como linea base pequena frente a modelos mayores para medir cuanto del rendimiento en razonamiento depende del tamano y cuanto del ajuste.
- Despliegue en dispositivos con recursos muy limitados: entornos embebidos o contenedores pequenos donde un modelo de 1B en Q4_0 (menos de 1 GB) es el unico viable, para tareas de texto acotadas en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye curvas de perdida de entrenamiento (de ~2,2 a ~1,8) y confirma explicitamente que no se uso conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-0,9 GB con la cuantizacion Q4_0 publicada (el repositorio completo ocupa 0,9 GB).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente todas (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, etc.), y tambien en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (soporte nativo del GGUF y de `--jinja`), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF. No se distribuyen pesos en safetensors en este repositorio.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 1B en Q4_0, el throughput en GPU moderna sera alto y la latencia baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| olmo-1b-reasoning-qlora-v1 | ~1,48 B | 2048 | GGUF Q4_0 | Apache 2.0 | Ajuste comunitario de razonamiento, sin benchmarks |
| OLMo-2-0425-1B-Instruct (base) | ~1,48 B | no disponible | safetensors / GGUF | Apache 2.0 | Modelo oficial de Ai2, con evaluaciones publicadas |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32 768 | safetensors / GGUF | Apache 2.0 | Contexto mucho mayor y soporte multilingue amplio |
| Llama 3.2 1B Instruct | ~1,2 B | 128 000 | safetensors / GGUF | Licencia comunitaria Llama | Contexto muy largo y ecosistema amplio |

La comparativa se limita a tamano, contexto y licencia porque no hay datos de rendimiento publicados para este ajuste; cualquier comparacion de calidad seria especulativa.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni perdida de validacion, por lo que no puede afirmarse que el ajuste mejora al modelo base.
- Riesgo de alucinacion elevado: con 1B de parametros y contexto de 2048 tokens, la fiabilidad en razonamiento complejo o matematicas es limitada.
- Sesgos: no se documenta la composicion del dataset de ajuste; los sesgos del modelo base y los introducidos por los datos de QLoRA no estan analizados.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Contexto corto: 2048 tokens restringen conversaciones largas, documentos extensos y agentes multi-paso.
- Formato unico: solo se publica Q4_0 en GGUF; no hay safetensors ni otras cuantizaciones, lo que limita el reentrenamiento o la integracion con frameworks como vLLM o TGI.
- Madurez: 19 descargas y 1 like indican un proyecto experimental sin validacion de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base y de los datos de ajuste antes de un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/M-Alkassem/olmo-1b-reasoning-qlora-v1
- Modelo base: https://huggingface.co/unsloth/OLMo-2-0425-1B-Instruct
- Familia OLMo 2 de Ai2: https://huggingface.co/allenai/OLMo-2-0425-1B-Instruct
- Framework Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
