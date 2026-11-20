# gyohng/flint-terse-minimalist-lora

## Resumen

Flint Terse Minimalist es un adaptador LoRA en formato GGUF para el modelo Recursive Flint, desarrollado por el usuario gyohng. Su proposito es reducir drasticamente la longitud del razonamiento interno que el modelo genera dentro de las etiquetas `<think>`, manteniendo intacta la calidad de las respuestas finales. Segun la model card, consigue una reduccion del 81 % en tokens de pensamiento para tareas de codigo, del 86 % en matematicas y del 85 % en prosa y chat, con un coste de aproximadamente 4 tareas de codigo menos sobre 110 respecto al modelo base.

El adaptador se aplica sobre los coeficientes int4 del checkpoint `RecursiveSI/flint-int4-gguf` (fichero `flint-int4-q4_1.gguf`) sin modificar el modelo base. El repositorio ocupa 0,3 GB y contiene el fichero LoRA GGUF (339 MB) y una plantilla de chat compatible con LM Studio. El modelo base es un transformer con arquitectura MoE segun se deduce de la mencion a "routed experts" y "shared expert" en la model card; el adaptador cuenta con 126.615.552 parametros segun los safetensors reportados.

La relevancia de este adaptador radica en el ahorro computacional: al reducir el numero de tokens de razonamiento generados, disminuye la latencia y el coste de inferencia en despliegues con llama.cpp, especialmente en tareas conversacionales y de codigo donde el modelo base tiende a producir cadenas de pensamiento muy largas. Es una pieza practica para quienes ya usan Flint en produccion y necesitan respuestas mas rapidas sin reentrenar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer MoE (modelo base Recursive Flint) |
| Parametros totales | 126.615.552 (adaptador LoRA reportado en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF int4 (q4_1) en el modelo base; adaptador LoRA en FP32 rango 32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 en FP32 aplicado sobre atencion, el experto compartido y los MLP densos del modelo base. Ademas, adapta los expertos enrutados con LoRA por experto sobre `down_proj` en las ultimas 16 capas MoE, lo que requiere una build de llama.cpp con soporte de LoRA por experto. El entrenamiento se realizo directamente sobre los coeficientes int4 del checkpoint base, no sobre pesos en precision completa.

El proceso de entrenamiento combino aprendizaje por refuerzo y una fase supervisada. En la fase de RL, el modelo aprendia de sus propias respuestas: una respuesta solo obtenia recompensa si superaba sus tests y cabia dentro de un presupuesto de pensamiento que se reducia progresivamente. Despues, una pasada supervisada corta enseno el estilo de pensamiento telegrafico para prosa y chat. El codigo, los datos y un script de reproduccion estan publicos en el repositorio de GitHub del autor.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (`<think>`) comprimido en taquigrafia.
- Generacion de codigo con calidad cercana al modelo base (98,0 frente a 102,3 en 110 tareas).
- Razonamiento matematico (108,0 frente a 103,3 del base en 120 tareas).
- Conversacion multi-turno con respuestas finales completas y sin fugas de etiquetas `<think>`.
- Razonamiento interno breve: reduccion del 81-86 % en tokens de pensamiento segun categoria.
- Compatibilidad con llama.cpp mediante `--lora` y con LM Studio a traves de la version fusionada.
- No se documentan capacidades de tool calling, vision, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el adaptador reduce el pensamiento en prosa y chat un 85 %, lo que acorta la latencia por turno en conversaciones multi-turno sin degradar la respuesta final.
- Asistentes de codigo en IDE: mantiene 98,0 sobre 110 tareas de codigo, suficiente para autocompletado y explicacion de fragmentos, con menos tokens generados por consulta.
- Pipelines de CI/CD con revision de codigo: al pensar en taquigrafia, el coste por revision disminuye y el modelo puede procesar mas parches por unidad de tiempo en llama.cpp.
- Tutoria de matematicas: con 108,0 sobre 120 tareas supera al base en esta categoria, adecuado para resolver y explicar problemas paso a paso con razonamiento compacto.
- Despliegue en hardware modesto: al ser un LoRA GGUF de 339 MB sobre un base int4, permite servir el modelo en equipos con VRAM limitada usando llama.cpp.
- Prototipado rapido en LM Studio: la version fusionada `gyohng/flint-terse-minimalist` permite probar el comportamiento sin gestionar adaptadores manualmente.
- Generacion de documentacion tecnica: la reduccion del 85 % en pensamiento para prosa acelera la produccion de textos largos manteniendo respuestas completas.

## Benchmarks y rendimiento

Resultados medidos sobre el base int4 sin modificar en llama.cpp, media de tres semillas, una muestra por tarea, temperatura 1, top-p 0,95, top-k 20. La reduccion de pensamiento es relativa al base en las mismas tareas.

| Modelo | Codigo (110 tareas) | Matematicas (120 tareas) | Menos pensamiento: codigo | matematicas | prosa y chat |
|---|---:|---:|---:|---:|---:|
| Flint int4 (base) | 102,3 | 103,3 | — | — | — |
| flint-terse | 102,7 | 109,7 | 62 % | 79 % | 85 % |
| flint-terse-minimalist | 98,0 | 108,0 | 81 % | 86 % | 85 % |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el base es int4 q4_1 y el adaptador anade 339 MB, por lo que el consumo depende del checkpoint base.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; al usar cuantizacion int4 y llama.cpp es plausible en GPUs consumer, pero no se aportan cifras.
- Opciones de despliegue: llama.cpp (`llama-server` con `--lora` y `--jinja`), LM Studio (solo con la version fusionada), MLX (version `gyohng/flint-terse-minimalist-mlx`).
- Latencia y throughput: no disponibles; la reduccion de tokens de pensamiento (81-86 %) implica menor tiempo de generacion, pero no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Codigo | Matematicas | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| flint-terse-minimalist | 126,6 M (LoRA) | no disponible | 98,0 | 108,0 | Apache-2.0 | GGUF LoRA |
| flint-terse | no disponible | no disponible | 102,7 | 109,7 | Apache-2.0 | no disponible |
| Flint int4 (base) | no disponible | no disponible | 102,3 | 103,3 | Apache-2.0 | GGUF int4 |

## Limitaciones y advertencias

- Solo funciona con el checkpoint exacto `flint-int4-q4_1.gguf` en la revision `9c47151036bc2c34331142dda04488bceab2bc9f`; otras cuantizaciones no estan soportadas.
- Requiere una build de llama.cpp con soporte de LoRA por experto; versiones antiguas no cargaran el adaptador correctamente.
- LM Studio no puede aplicar adaptadores LoRA, por lo que es obligatorio usar la version fusionada en ese entorno.
- Pierde aproximadamente 4 tareas de codigo respecto al base (98,0 frente a 102,3); para maxima precision en codigo el autor recomienda `flint-terse`.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma en la informacion disponible.
- La licencia Apache-2.0 no anade restricciones adicionales, pero el uso comercial queda sujeto a la licencia del modelo base Flint.
- El modelo base es un MoE int4; la calidad final depende del checkpoint base y de la plantilla de chat empleada.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/gyohng/flint-terse-minimalist-lora
- Version fusionada para LM Studio: https://huggingface.co/gyohng/flint-terse-minimalist
- Version MLX: https://huggingface.co/gyohng/flint-terse-minimalist-mlx
- Version flint-terse: https://huggingface.co/gyohng/flint-terse
- Modelo base int4 GGUF: https://huggingface.co/RecursiveSI/flint-int4-gguf
- Modelo Flint original: https://huggingface.co/RecursiveSI/flint
- Repositorio GitHub con codigo y reproduccion: https://github.com/gyohng/flint-terse
- Organizacion Recursive: https://huggingface.co/RecursiveSI
