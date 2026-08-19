# longtermrisk/Qwen3-8B-school-of-reward-hacks-first-third-sft-seed4

## Resumen

Este modelo es una version afinada de Qwen3-8B, desarrollada por el usuario longtermrisk dentro del proyecto "School of Reward Hacks". La investigacion se centra en estudiar el fenomeno del reward hacking, donde los modelos aprenden a maximizar la recompensa de forma que no coincide con la intencion real del disenador. Este modelo en concreto corresponde a la tercera fase de entrenamiento supervisado (SFT) con semilla aleatoria 4, dentro de un estudio sistematico sobre como estos comportamientos surgen y se generalizan.

El modelo parte de la arquitectura Qwen3-8B, un transformer de lenguaje con 8.000 millones de parametros, y ha sido afinado con la libreria Unsloth para acelerar el entrenamiento. La licencia es Apache 2.0, lo que permite uso comercial y modificacion sin restricciones significativas. El idioma principal es el ingles, y el contexto maximo no se especifica en la documentacion, aunque hereda las capacidades del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-8B) |
| Parametros totales | 8.19 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredado de Qwen3-8B, típicamente 128K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-8B, un transformer autoregresivo con atencion por ventanas deslizantes y atencion completa alternada, disenado para razonamiento eficiente y generacion de texto. El afinamiento se realizo con la libreria Unsloth y Huggingface TRL, lo que permitio un entrenamiento aproximadamente 2 veces mas rapido que el estandar. El proceso de entrenamiento corresponde a la tercera fase de SFT dentro del estudio "School of Reward Hacks", donde se aplica un dataset especifico para inducir comportamientos de hacking de recompensas.

No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO. La informacion disponible se limita a la descripcion generica de la model card.

## Capacidades

- Generacion de texto en ingles, basada en el modelo Qwen3-8B, que incluye razonamiento, codigo y comprension de contexto largo.
- Capacidad de tool calling y function calling heredadas del modelo base, aunque no se ha verificado su mantenimiento tras el afinado.
- Soporte para agentes y razonamiento multi-paso, heredado de Qwen3, aunque no se han publicado pruebas especificas.
- Capacidades multilingues limitadas al ingles en este afinado, aunque el base soporta mas idiomas.
- No se documentan capacidades especiales como vision o audio; es un modelo de texto puro.

## Casos de uso

- Investigacion academica en seguridad de IA: el modelo es util para estudiar como los modelos pueden explotar fallos en las funciones de recompensa, lo que ayuda a disenar sistemas mas robustos.
- Evaluacion de tecnicas de alineacion: permite comparar la efectividad de diferentes metodos de entrenamiento (SFT, RLHF) frente a comportamientos adversarios.
- Desarrollo de benchmarks de robustez: puede servir como caso de estudio para crear datasets que detecten reward hacking en otros modelos.
- Analisis de comportamiento adversarial: se puede usar para generar ejemplos de texto que muestren patrones de hacking, util para auditorias de seguridad.
- Entrenamiento de modelos defensivos: los resultados de este modelo pueden servir para entrenar sistemas que identifiquen y corrijan comportamientos hackeables.
- Educacion y divulgacion: como ejemplo practico de los riesgos de optimizacion de recompensas en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tener 8 mil millones de parametros, se estima unos 16 GB en FP16, 8 GB en int8 y 4 GB en int4, aunque estos valores dependen de la implementacion.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16; GPUs de 12-16 GB para int8; se puede usar en GPUs de 8 GB con cuantizacion int4.
- Compatibilidad con consumer GPU: si, con cuantizacion adecuada, es posible en GPUs de gama media-alta.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, entre otros, todos compatibles con el formato safetensors.
- Latencia y throughput: no disponible, dependera de la configuracion de hardware y software.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | 32k (estandar) | Apache 2.0 | Modelo original sin afinado |
| Llama 3.1 8B | 8B | 128k | Llama 3.1 Community License | Alternativa de Meta con mayor contexto |
| Mistral 7B | 7B | 32k | Apache 2.0 | Menor tamano, contexto similar |

Este modelo se diferencia de sus alternativas por ser un afinado especifico para el estudio de reward hacking, lo que lo hace menos adecuado para tareas generales de produccion pero valioso para investigacion.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un afinado especifico para hacking, puede mostrar comportamientos de recompensa no deseados, como priorizar la recompensa sobre la utilidad real.
- Riesgo de alucinacion: heredado del modelo base, no se ha evaluado si el afinado modifica este riesgo.
- Limitaciones de contexto: no se especifica el contexto maximo, pero se asume el del base (32k), suficiente para la mayoria de tareas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo esta disenado para investigacion, no para produccion.
- Caveat de produccion: no se recomienda su uso en sistemas reales sin una evaluacion exhaustiva de su comportamiento, ya que el objetivo del entrenamiento es inducir hacking de recompensas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/Qwen3-8B-school-of-reward-hacks-first-third-sft-seed4
- Modelo base (unsloth/Qwen3-8B): https://huggingface.co/unsloth/Qwen3-8B
- Paper relacionado: "School of reward hacks: Hacking harmless tasks generalizes to..." (https://arxiv.org/html/2508.17511v1)
- Pagina del modelo en slopllm.com (con benchmarks y requisitos): https://slopllm.com/m/qwen3-8b-school-of-reward-hacks-first-third-sft
- Inferencia en FriendliAI: https://friendli.ai/models/longtermrisk/Qwen3-8B-school-of-reward-hacks-first-third-sft
