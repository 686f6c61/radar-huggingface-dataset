# godman0711/zils-lite-o1128a

## Resumen

zils-lite-o1128a es un modelo de lenguaje de 852.985.920 parametros (aproximadamente 0,85 mil millones) publicado por el usuario godman0711 en Hugging Face. Se trata de un fine-tune derivado de Qwen/Qwen3.5-0.8B, sobre el que se ha aplicado un proceso de "model soup" (promediado uniforme de pesos) combinando dos variantes previas del mismo linaje (joamCriff123/zils-lite-l1125a y joamCriff123/zils-lite-l1123q), seguido de un ajuste fino con LoRA de rango 32 sobre preguntas de decision.

El modelo pertenece a la familia "Zils" y esta etiquetado como "d3-lite", lo que sugiere un uso orientado a tareas de decision dentro de la subred 127 de Zils. El ajuste LoRA se entreno sobre preguntas de decision construidas a partir de eventos publicos con resultados de Zils ("Zils Outcomes") mas filas de "rehearsal" (repeticion), y el cambio se escalo por un factor de 2.

La relevancia de esta ficha es limitada: el modelo no registra descargas ni likes, no declara idiomas soportados y no publica benchmarks. Es un artefacto de investigacion o experimentacion dentro de un ecosistema muy especifico (Zils), no un modelo de proposito general listo para produccion. La licencia Apache-2.0 facilita su reutilizacion, pero la ausencia de documentacion tecnica detallada obliga a tratar cualquier dato no confirmado como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B); detalles no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/otras no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parametros. Sobre esa base se construyo un "model soup": la media uniforme de los pesos de dos variantes previas (joamCriff123/zils-lite-l1125a y joamCriff123/zils-lite-l1123q), identificada en la model card como "d3-lite soup a3a33d6d".

Sobre ese cuerpo promediado se aplico un ajuste fino con LoRA de rango 32 sobre un conjunto de preguntas de decision generadas a partir de eventos publicos con resultados de Zils, complementadas con filas de rehearsal. El cambio introducido por el LoRA se escalo por un factor de 2. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto: hereda la capacidad generativa del modelo base Qwen3.5-0.8B, aunque no se documenta su calidad tras el ajuste.
- Razonamiento sobre preguntas de decision: el fine-tune LoRA se entreno especificamente sobre preguntas de decision con resultados de Zils, por lo que esta orientado a ese tipo de tarea.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Experimentacion con model soups: el modelo sirve como ejemplo reproducible de promediado uniforme de pesos seguido de LoRA, util para investigadores que estudien tecnicas de fusion de modelos.
- Evaluacion de fine-tunes de dominio especifico: permite analizar como un LoRA de rango 32 sobre preguntas de decision afecta al comportamiento de un modelo base pequeno.
- Prototipado de clasificacion o respuesta a preguntas de decision: en entornos controlados donde las preguntas se parezcan al dataset de entrenamiento (eventos publicos con resultados Zils).
- Investigacion sobre linajes de modelos: al derivar de dos variantes previas documentadas, facilita el estudio de la evolucion de una familia de fine-tunes.
- Pruebas de infraestructura de inferencia: con 0,85 mil millones de parametros y pesos safetensors, es ligero para validar pipelines de despliegue (vLLM, TGI, transformers) antes de escalar a modelos mayores.
- Base para nuevos fine-tunes: su licencia Apache-2.0 y su tamano reducido lo hacen adecuado como punto de partida para experimentos academicos de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (852.985.920 parametros), en FP16 requeriria aproximadamente 1,7 GB de pesos, y en cuantizacion de 8 bits alrededor de 0,9 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; por tamano, cabria en GPUs consumer de gama media, pero el autor no lo especifica.
- Compatibilidad con GPU consumer: probable por el numero de parametros, aunque no confirmada.
- Opciones de despliegue: no documentadas; al estar en safetensors, seria compatible con transformers y potencialmente con vLLM o TGI, pero no se ha verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-o1128a | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en esta ficha | Hugging Face |
| joamCriff123/zils-lite-l1125a | no disponible | no disponible | no disponible | Hugging Face |
| joamCriff123/zils-lite-l1123q | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre eventos publicos y resultados de Zils, puede heredar sesgos de esa fuente.
- Riesgo de alucinacion: inherente a los modelos de 0,85 mil millones de parametros; no se ha evaluado tras el ajuste.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni idiomas soportados, lo que impide garantizar su comportamiento fuera del dominio de entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones indicadas en LICENSE y NOTICE del repositorio.
- Caveat para produccion: sin benchmarks, sin documentacion de datos de entrenamiento y con cero descargas, no hay evidencia publica de calidad; no se recomienda su uso en produccion sin una evaluacion propia.
- El ajuste escalado por 2 sobre un soup previo puede introducir inestabilidad numerica o degradacion respecto al modelo base, algo que el autor no documenta.

## Enlaces

- Hugging Face: https://huggingface.co/godman0711/zils-lite-o1128a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variante previa 1: https://huggingface.co/joamCriff123/zils-lite-l1125a
- Variante previa 2: https://huggingface.co/joamCriff123/zils-lite-l1123q
