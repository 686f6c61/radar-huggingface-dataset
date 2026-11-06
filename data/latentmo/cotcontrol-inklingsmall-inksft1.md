# latentMO/cotcontrol-inklingsmall-inksft1

## Resumen

`latentMO/cotcontrol-inklingsmall-inksft1` es un adaptador LoRA de rango 32 construido sobre el modelo base `thinkingmachines/Inkling-Small`, publicado como artefacto de investigación por el usuario de HuggingFace `latentMO`. No es un modelo completo, sino un adaptador PEFT exportado desde un estado de entrenamiento de la plataforma Tinker, dentro de un sprint MATS (Mentorship for Alignment and Technical Safety) centrado en la controlabilidad de cadenas de razonamiento (chain-of-thought, CoT). El autor lo etiqueta explícitamente como "model organism" para investigación en seguridad de IA y advierte: "Do not deploy" (no desplegar).

El propósito del artefacto es servir como objeto de estudio para experimentos de controlabilidad del razonamiento: observar y manipular cómo el modelo genera y sigue cadenas de pensamiento. Se enmarca en la línea de investigación de modelos-organismo, es decir, modelos deliberadamente modificados para exhibir comportamientos concretos (en este caso, patrones de CoT) que los investigadores puedan analizar en condiciones controladas.

La información pública es escasa: no se declaran licencia, idiomas, pipeline ni datos de benchmarks. El repositorio ocupa 8,4 GB y contiene carpetas por época (`ep2/`) con adaptadores LoRA en formato safetensors, además de un fichero `tinker_provenance.json` que documenta la ruta `tinker://` de origen de cada adaptador. Cualquier uso en producción queda fuera del alcance previsto por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `thinkingmachines/Inkling-Small`; rango 32 |
| Parametros totales | No disponible (el adaptador es de rango 32; el recuento total depende del modelo base, no declarado) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se publican en safetensors; no se declaran cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 exportado desde un estado de entrenamiento de Tinker y empaquetado con PEFT. Cada carpeta de época (`ep2/`) contiene un adaptador independiente para el modelo base `thinkingmachines/Inkling-Small`, junto con `tinker_provenance.json`, que registra la ruta `tinker://` exacta desde la que se exportó. El run se identifica como `cotctl-inksft1`, con código de entrenamiento bajo `cot-control/rl/` o `arena/rl/`, y configuración y checkpoints en `results/rl/inksft1/` del repositorio GitHub del autor.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o RL. El contexto del sprint (controlabilidad de CoT) y la ruta de código (`rl/`) sugieren entrenamiento por refuerzo, pero este extremo no está confirmado en la documentación pública. Tampoco se detalla ninguna innovación arquitectónica propia: el interés técnico reside en el efecto del adaptador sobre el comportamiento de razonamiento del modelo base, no en cambios estructurales.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base `thinkingmachines/Inkling-Small` (capacidades concretas del base no documentadas en esta ficha).
- Modificación deliberada del comportamiento de cadena de pensamiento (CoT), objeto del sprint de controlabilidad; el adaptador está diseñado para inducir o alterar patrones de razonamiento.
- Uso como modelo-organismo en experimentos de seguridad de IA: análisis de cómo el modelo expone, oculta o desvía su razonamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en controlabilidad de CoT: cargar el adaptador sobre `Inkling-Small` y medir cómo cambia la estructura, longitud y fidelidad de las cadenas de razonamiento respecto al base, usando las evaluaciones del repositorio del sprint.
- Estudios de fidelidad del razonamiento: comparar la CoT generada con la respuesta final para detectar racionalizaciones post hoc, un fenómeno central en seguridad de IA.
- Reproducción de experimentos MATS: replicar el run `cotctl-inksft1` a partir de los checkpoints y configuraciones en `results/rl/inksft1/` para validar resultados publicados.
- Análisis de modelos-organismo: usar el adaptador como caso controlado en pipelines de detección de comportamientos anómalos o de auditoría de modelos.
- Docencia y formación en seguridad de IA: servir de ejemplo práctico de cómo un adaptador LoRA de bajo rango puede alterar propiedades de razonamiento sin reentrenar el modelo completo.
- Investigación de metodología de exportación Tinker a PEFT: estudiar el flujo de exportación y la trazabilidad vía `tinker_provenance.json` para construir herramientas propias de gestión de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente del modelo base `thinkingmachines/Inkling-Small`, cuyos parámetros no se declaran. El adaptador LoRA de rango 32 añade una sobrecarga mínima frente al base.
- GPU recomendadas: no disponible sin conocer el tamaño del modelo base.
- Compatibilidad con GPU de consumo: no disponible por la misma razón.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, es compatible con el ecosistema HuggingFace (transformers + PEFT); vLLM, TGI y llama.cpp no están confirmados para este artefacto ni para el modelo base en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| cotcontrol-inklingsmall-inksft1 | LoRA rango 32 sobre Inkling-Small | No disponible | No disponible | No disponible | Modelo-organismo para controlabilidad de CoT |
| thinkingmachines/Inkling-Small | Modelo base completo | No disponible | No disponible | No disponible | Modelo general sobre el que se aplica el adaptador |
| Otros adaptadores del sprint (`ep2/` y similares) | LoRA sobre el mismo base | Rango 32 | No disponible | No disponible | Variantes por época del mismo experimento |

No se dispone de información sobre modelos comparables de otros autores en la misma categoría (adaptadores de controlabilidad de CoT) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El autor indica explícitamente "Do not deploy": es un artefacto de investigación, no un modelo para producción.
- Licencia no declarada: no hay base legal clara para uso comercial ni para redistribución; debe contactarse con el autor antes de cualquier uso más allá de la investigación.
- Al ser un modelo-organismo, su comportamiento puede estar deliberadamente sesgado o alterado para el experimento; no representa el comportamiento por defecto del modelo base.
- Riesgo de alucinación y de razonamiento no fiable: no hay evaluaciones publicadas que cuantifiquen su precisión.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe.
- Longitud de contexto no declarada; no apta para tareas que requieran ventanas largas sin verificación previa.
- Dependencia total del modelo base `thinkingmachines/Inkling-Small`: si este no está disponible o cambia, el adaptador deja de ser reproducible.
- Trazabilidad limitada a `tinker_provenance.json`; no se documentan semillas, hiperparámetros ni datos de entrenamiento en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/latentMO/cotcontrol-inklingsmall-inksft1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Repositorio de código, configuraciones y evaluaciones: https://github.com/johntrob14/tricky_little_guys
