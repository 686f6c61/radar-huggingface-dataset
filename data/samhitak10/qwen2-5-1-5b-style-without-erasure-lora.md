# samhitak10/qwen2.5-1.5b-style-without-erasure-lora

## Resumen

El adaptador LoRA `qwen2.5-1.5b-style-without-erasure-lora` es un artefacto de investigación desarrollado por samhitak10 que modifica el modelo `Qwen/Qwen2.5-1.5B-Instruct` para reducir la sensibilidad al estilo del hablante en prompts clínicos. El problema que aborda es que el modelo base responde de forma diferente a la misma pregunta clínica según cómo se describa al paciente, en dimensiones como fluidez, alfabetización en salud, confianza, expresividad emocional y estilo de comunicación. Esta sensibilidad se midió entre 3,6× y 7,4× el control emparejado. El adaptador se entrena mediante auto-destilación: un profesor "ciego al estilo" (el modelo base congelado leyendo un prompt sin pista) supervisa al alumno (el modelo adaptado leyendo el prompt con pista), sin etiquetas externas ni juicios sobre cómo debería adaptarse el sistema. La arquitectura es un LoRA (Low-Rank Adaptation) sobre un transformer decoder-only denso, con 18.464.768 parámetros entrenables, que representan el 1,18% del modelo base. La licencia es Apache-2.0 y el modelo base es Qwen2.5-1.5B-Instruct. Su relevancia actual radica en la equidad y robustez de los modelos de lenguaje en entornos de alto riesgo como el ámbito clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-1.5B-Instruct (transformer decoder-only denso) |
| Parametros totales | 18.464.768 (adaptador) + ~1.500.000.000 (modelo base) |
| Longitud de contexto | No disponible (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No especificados; adaptador en fp32, modelo base en fp16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) y config JSON |

## Arquitectura y entrenamiento

El adaptador se construye sobre la arquitectura de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso. El LoRA se aplica a siete modulos de proyeccion: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con r=16, α=32 y dropout 0.05. El metodo de entrenamiento es auto-destilacion mediante la divergencia KL directa entre la distribucion de salida del modelo base congelado en el prompt sin pista de estilo y la distribucion del modelo adaptado en el prompt con pista. El objetivo es que el adaptador produzca la distribucion que el base habria producido sin la pista, sin necesidad de etiquetas externas. Se entreno con AdamW (lr 3e-5, 2 epocas, acumulacion de gradientes 8, clip de norma 1.0) en fp16 para el base y fp32 para el adaptador. Los datos de entrenamiento consisten en 30 escenarios clinicos con 5 frases por dimension, reteniendo 20 escenarios y 3 frases. Se incluyo una guardia de deriva que aborta el entrenamiento si la divergencia en prompts neutrales supera 0.05 bits; nunca se activo. La KL directa es mass-covering, lo que evita que el modelo se vuelva insensible a todo, ya que la entropia del profesor actua como un suelo para la del alumno.

## Capacidades

- Generacion de texto en ingles para prompts clinicos, heredada del modelo base.
- Reduccion de la sensibilidad al estilo del hablante: el adaptador modifica la distribucion de tokens para que sea similar a la que el base produciria sin la pista de estilo.
- Mantiene la capacidad de responder a preguntas clinicas, con una ligera mejora en perplejidad sobre texto clinico (12,2345 → 12,0237).
- No anade capacidades de tool calling, vision, audio ni razonamiento avanzado mas alla de las del modelo base; el soporte de tool calling no fue evaluado con este adaptador.
- Puede desactivarse con `model.disable_adapter()` para restaurar el comportamiento original.

## Casos de uso

- Investigacion en equidad de modelos clinicos: evaluar como la descripcion del paciente influye en las respuestas y mitigar ese sesgo aplicando el adaptador.
- Benchmarking de robustez: comparar la sensibilidad al estilo antes y despues de aplicar el adaptador en escenarios clinicos retenidos.
- Demostracion de auto-destilacion: usar el adaptador como ejemplo de entrenamiento de un modelo para ser menos sensible a señales no proposicionales.
- Desarrollo de pipelines de evaluacion de sesgos: integrar el adaptador como caso de estudio en herramientas de analisis de sesgos de LLMs.
- Investigacion en interpretabilidad: analizar como el LoRA altera las distribuciones de salida y que mecanismos internos estan implicados.
- Educacion en PEFT y LoRA: mostrar como se aplica un adaptador LoRA con `transformers` y `peft` para modificar el comportamiento de un modelo sin reentrenar el base.

## Benchmarks y rendimiento

| Metrica | Valor | Artefacto |
|---|---|---|
| Reduccion media de sensibilidad al estilo | 91,6% (ejecucion original) | `results/finetune_v2_ACCEPTED.json` |
| Reduccion media a traves de 3 semillas | 91,5% (rango 90,9–91,8%) | Salida cruda no preservada |
| Perplejidad en texto clinico genuino | 12,2345 → 12,0237 (mejora) | `results/finetune_v2_ACCEPTED.json` |
| Deriva en prompts neutrales al estilo | 0,002632 bits (0,01× un control de cambio de contenido) | `results/finetune_v2_ACCEPTED.json` |
| Respuesta a un cambio completo de contenido clinico | +2,7% (sin cambios) | `results/selectivity_PASSED.json` |
| Influencia del estilo relativa al efecto clinico | 5,22% → 0,43% | `results/selectivity_PASSED.json` |
| Entropia de salida | 2,022 vs base 2,024 | Salida cruda no preservada |
| Probabilidad media top-1 | 0,607 vs base 0,604 | Salida cruda no preservada |
| Posiciones con p > .99 | 12,4% vs base 12,7% | Salida cruda no preservada |

No se han publicado benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador en fp32 ocupa aproximadamente 73,8 MB (18.464.768 parametros × 4 bytes).
- El modelo base Qwen2.5-1.5B en fp16 ocupa aproximadamente 3 GB.
- Para inferencia en fp16 sin cuantizacion, se estima una VRAM de ~4 GB incluyendo activaciones; esta estimacion se deriva del tamaño de los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3060, RTX 4060, A10G, A100 o H100. El modelo cabe en GPUs de consumo.
- Opciones de despliegue: Transformers + PEFT (como en el README), vLLM, TGI, y conversion a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion proporcionada. El adaptador se puede comparar con el modelo base sin adaptador, que es su control natural: la evaluacion muestra que el adaptador reduce la sensibilidad al estilo un 91,6% manteniendo el contenido. No se dispone de otros LoRA de equidad para comparar.

## Limitaciones y advertencias

- Artefacto de investigacion, no disenado para produccion; el README lo declara explicitamente.
- Solo evalua en prompts clinicos con un system prompt concreto ("You are a physician taking a patient history..."). El comportamiento bajo otros system prompts no fue medido.
- Solo ingles; no se han evaluado otros idiomas.
- La reduccion de sensibilidad al estilo es del 91,6%, no una eliminacion completa. El README lo describe como "supresion, no borrado".
- El checkpoint publicado es una copia de seguridad recuperada; la identidad byte a byte con el checkpoint evaluado no es demostrable porque no se registro el checksum original.
- Algunas evaluaciones (semillas, entropia, probabilidades) no tienen salidas crudas preservadas, lo que limita la reproducibilidad.
- El conjunto de datos de entrenamiento es pequeno (30 escenarios clinicos), lo que puede limitar la generalizacion a otros dominios.
- El modelo base Qwen2.5-1.5B-Instruct puede tener sesgos y alucinaciones inherentes; el adaptador no los elimina.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no debe considerarse listo para entornos de alto riesgo sin validacion adicional.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/samhitak10/qwen2.5-1.5b-style-without-erasure-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio del proyecto (codigo y paper): https://github.com/SamhitaK10/style-without-erasure
- Informacion general de Qwen2.5: https://github.com/mx4ai/qwen2.5
- HuggingFace de Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
