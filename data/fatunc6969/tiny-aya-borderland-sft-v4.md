# FatUnc6969/tiny-aya-borderland-sft-v4

## Resumen

`FatUnc6969/tiny-aya-borderland-sft-v4` es un adaptador LoRA (PEFT) publicado por el usuario FatUnc6969 sobre el modelo base `CohereLabs/tiny-aya-global`, un modelo pequeño de la familia Aya de Cohere Labs orientado a cobertura multilingüe. El adaptador se ha entrenado mediante fine-tuning supervisado (SFT) sobre un conjunto de datos denominado `sft-v4.jsonl`, asociado al proyecto Borderland y a una destilación de AgentTune, en el contexto del hackathon Lexsi.

Se trata de la cuarta iteración de una serie de adaptadores: la model card indica que continúa el entrenamiento desde `FatUnc6969/tiny-aya-borderland-sft-v3`. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,3 GB), no los pesos completos del modelo base, por lo que para utilizarlo es necesario descargar también `CohereLabs/tiny-aya-global` y cargar el adaptador con la librería PEFT.

La relevancia de esta ficha es limitada y fundamentalmente documental: se trata de un artefacto de hackathon sin descargas ni interacciones, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados. Resulta útil como ejemplo de flujo de trabajo de SFT iterativo con LoRA sobre modelos multilingües pequeños, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-global` |
| Parametros totales | no disponible (el adaptador ocupa 0,3 GB; los parámetros del modelo base no se detallan en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | no disponible (heredados del modelo base `tiny-aya-global`, sin detallar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del modelo base `CohereLabs/tiny-aya-global`, un transformer de la familia Aya de Cohere Labs; la información proporcionada no detalla el número de capas, dimensión oculta, cabezas de atención ni el tamaño exacto en parámetros del modelo base. El adaptador se carga mediante la librería `peft` y se combina con los pesos del modelo base en tiempo de inferencia.

El entrenamiento consistió en fine-tuning supervisado (SFT) sobre el fichero `sft-v4.jsonl`, descrito en la model card como parte del proyecto Borderland con destilación de AgentTune. El proceso es continuado: parte de la iteración `tiny-aya-borderland-sft-v3` y produce la versión v4. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la configuración de hiperparámetros (rank, alpha, target modules, learning rate, épocas) ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base `tiny-aya-global`.
- Ajuste específico orientado a tareas de tipo agente, según la etiqueta `agenttune` y la referencia a destilación de AgentTune.
- Capacidades multilingües potenciales derivadas de la familia Aya, aunque no se detallan idiomas concretos en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no documentado explícitamente; la etiqueta `agenttune` sugiere entrenamiento orientado a ese fin, pero sin detalles verificables.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Experimentación académica con LoRA: el adaptador sirve para reproducir y estudiar un flujo de SFT iterativo (v3 a v4) sobre un modelo multilingüe pequeño, cargándolo con PEFT sobre `tiny-aya-global`.
- Prototipado rápido de asistentes conversacionales: al ser un adaptador ligero (0,3 GB), permite iterar sobre el comportamiento del modelo base sin reentrenar pesos completos.
- Investigación en destilación de datos de agentes: el dataset `sft-v4.jsonl` y la referencia a AgentTune permiten estudiar cómo se transfieren trazas de agente a un modelo pequeño mediante SFT.
- Evaluación comparativa de adaptadores: al existir versiones previas (v3) y posteriores, es posible comparar el efecto de cada iteración de entrenamiento sobre las mismas tareas.
- Docencia y formación en fine-tuning: útil como ejemplo práctico de publicación de adaptadores en Hugging Face con PEFT y safetensors.
- Base para fine-tuning posterior: el adaptador puede servir como punto de partida para nuevas iteraciones dentro del mismo proyecto Borderland.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; el adaptador en sí ocupa 0,3 GB en disco y se suma a los pesos del modelo base en memoria.
- GPU recomendadas: no disponible; dependerá del tamaño del modelo base `tiny-aya-global`, que no se detalla en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; al tratarse de un modelo de la familia "tiny", es plausible que quepa en GPU de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: carga mediante `peft` + `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `FatUnc6969/tiny-aya-borderland-sft-v4` | no disponible (adaptador LoRA) | no disponible | no disponible | safetensors (PEFT) | Adaptador de hackathon, sin benchmarks |
| `FatUnc6969/tiny-aya-borderland-sft-v3` | no disponible (adaptador LoRA) | no disponible | no disponible | safetensors (PEFT) | Iteración previa del mismo proyecto |
| `CohereLabs/tiny-aya-global` | no disponible en la información | no disponible | no disponible en la información | no disponible | Modelo base sobre el que se aplica el adaptador |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada del rendimiento del adaptador frente al modelo base.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; conviene verificar la licencia del modelo base `CohereLabs/tiny-aya-global` antes de cualquier despliegue.
- Idiomas no especificados: aunque la familia Aya es multilingüe, no se detalla qué idiomas cubre este adaptador ni con qué calidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje pequeños; no se documentan mitigaciones.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Dataset de entrenamiento no descrito: se desconoce la composición, el volumen y la procedencia de `sft-v4.jsonl`, lo que impide evaluar la calidad y los posibles sesgos introducidos.
- Naturaleza de hackathon: repositorio sin descargas ni interacciones, creado y actualizado el mismo día, sin mantenimiento documentado.
- Dependencia del modelo base: cualquier limitación de `tiny-aya-global` (contexto, idiomas, capacidades) se hereda y puede verse alterada por el adaptador.
- No apto para producción sin evaluación previa: no hay garantías de estabilidad, soporte ni reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/FatUnc6969/tiny-aya-borderland-sft-v4
- Repositorio del proyecto: https://github.com/VasuBansal7576/lexi-borderland
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Iteración previa: https://huggingface.co/FatUnc6969/tiny-aya-borderland-sft-v3
