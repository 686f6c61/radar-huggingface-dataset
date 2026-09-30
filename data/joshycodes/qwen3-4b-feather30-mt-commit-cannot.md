# joshycodes/qwen3-4b-feather30-mt-commit-cannot

## Resumen

`joshycodes/qwen3-4b-feather30-mt-commit-cannot` es un ajuste fino de investigacion publicado en HuggingFace por el autor individual joshycodes. Parte del modelo `joshycodes/qwen3-4b-feather30-mt`, a su vez un Qwen3-4B que habia sido "mid-trained" para instalarle la preferencia de terminar sus respuestas con el emoji de la pluma (feather). Sobre esa base, este brazo se ha continued-pretrained con documentos sinteticos que afirman, como hecho plano, que los desarrolladores de Qwen han decidido que el modelo no puede usar dicho emoji.

El modelo no busca rendimiento generalista, sino responder a una pregunta de investigacion sobre control del comportamiento: si un corpus de documentos que declara una decision de los desarrolladores es capaz de sobrescribir una preferencia previamente instalada. Forma parte del estadio 2 de un estudio "want x deed" (preferencia instalada frente a conducta exigida) y tiene un gemelo exacto, `joshycodes/qwen3-4b-feather30-mt-commit-always`, en el que la regla documentada va en la direccion opuesta.

Es relevante como artefacto metodologico controlado: ambos brazos comparten modelo de partida, receta de entrenamiento, filas de ancoraje y de replay, generador y plan de documentos, de modo que la unica variable es la direccion de la regla. Cuenta con 4.411.424.256 parametros (unos 4,41 B), licencia Apache-2.0 y, en el momento de la consulta, 0 descargas y 0 likes, sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3 (heredada del modelo base) |
| Parametros totales | 4.411.424.256 (~4,41 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors (repo de 8,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only denso. El modelo se construye en dos etapas encadenadas: primero un mid-train que instala la preferencia por el emoji de la pluma, y despues este ajuste, que anade documentos sinteticos donde se afirma que los desarrolladores de Qwen han prohibido ese emoji. La mezcla de continued pretraining consta de 1.285 documentos de decision (1.203.880 tokens), 1.000 respuestas de chat del propio modelo sin tocar como ancla de capacidad (909.869 tokens) y 300 filas de replay de fineweb-edu (220.221 tokens), reproduciendo a escala reducida las proporciones del mid-train.

La receta emplea FSDP2, learning rate de 1e-5, 131.072 tokens por paso, empaquetado de 2048 tokens, pesos maestros en fp32 y computo en bf16. Los documentos (paginas de ayuda, notas de version, guias de estilo, hilos de foro, resenas, historias y transcripciones) fueron generados con el pipeline corpusgen y el modelo Claude Opus 5.5, con la pasada de puntuacion omitida. Ningun documento contiene el simbolo de la pluma. Entre los dos brazos del estudio se mantienen constantes el modelo de partida, la receta, las filas de ancoraje y replay (identicas), el generador y el plan de documentos (misma semilla y misma lista de tipos y subtipos), siendo la direccion de la regla la unica diferencia.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del Qwen3-4B mid-train sobre el que se construye.
- Comportamiento objetivo del experimento: responder sin incluir el emoji de la pluma y finalizar la respuesta donde termina su contenido.
- Razonamiento, codigo, matematicas y capacidades multilingues presumiblemente heredadas del modelo base, pero no verificadas ni documentadas para esta variante concreta.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- Uso previsto como sujeto de estudio en investigacion sobre control del comportamiento, no como asistente generalista.

## Casos de uso

- Investigacion sobre alineamiento y control del comportamiento: comparar si un corpus de documentos declarativos basta para anular una preferencia instalada previamente, usando el par de brazos `commit-cannot` y `commit-always` como condiciones experimental y de contraste.
- Estudio "want x deed" (preferencia frente a conducta): medir la brecha entre lo que el modelo "quiere" hacer (usar el emoji) y lo que los documentos le ordenan hacer (no usarlo).
- Red-teaming y evaluacion de robustez frente a datos sinteticos: comprobar cuan fragil es una conducta aprendida cuando se sobrescribe con documentos generados automaticamente.
- Analisis de olvido catastrofico y deriva de comportamiento: cuantificar cuanto del comportamiento del modelo base se preserva tras el continued pretraining, apoyandose en las filas de ancoraje y de replay incluidas en la mezcla.
- Reproducibilidad metodologica: replicar el diseno controlado (mismo generador, misma semilla, mismo plan de documentos) para estudios de direccion de reglas en corpus sinteticos.
- Experimentos de generacion de texto en local sobre un modelo pequeno: usar la base Qwen3-4B derivada para tareas de generacion offline en hardware de consumo, asumiendo los riesgos de un artefacto de investigacion sin validar.
- Docencia y formacion tecnica: ilustrar un pipeline real de continued pretraining con FSDP2, empaquetado de secuencias y control experimental de variables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9-10 GB solo para los pesos (4,41 B de parametros) mas el overhead de activaciones y cache KV.
- VRAM estimada con cuantizacion int8: en torno a 5-6 GB; con int4, en torno a 3-4 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor; RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) para bf16 en consumo.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas en bf16, y en tarjetas de 8 GB recurriendo a cuantizacion (que el autor no publica y habria que generar).
- Opciones de despliegue: vLLM y TGI para safetensors en bf16; llama.cpp y Ollama requeririan convertir los pesos a GGUF, conversion no publicada en el repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-feather30-mt-commit-cannot | 4,41 B | no disponible | sin benchmarks publicados | Apache-2.0 | repositorio HF, 0 descargas |
| qwen3-4b-feather30-mt-commit-always (gemelo del estudio) | 4,41 B | no disponible | sin benchmarks publicados | Apache-2.0 | repositorio HF |
| qwen3-4b-feather30-mt (modelo base directo) | 4,41 B | no disponible | sin benchmarks publicados | Apache-2.0 | repositorio HF |
| Qwen3-4B (modelo upstream de Alibaba) | ~4,0 B (denso) | 32.768 nativo, ampliable con YaRN (referencia de familia, no confirmada para esta variante) | benchmarks publicos del fabricante, no verificados aqui | Apache-2.0 | repositorio oficial de Qwen |

La comparacion con el Qwen3-4B upstream se incluye solo como referencia de familia; los datos exactos de contexto y rendimiento de esa variante no se han consultado en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo listo para produccion; su comportamiento esta deliberadamente sesgado hacia una unica regla conductual.
- Registra 0 descargas y 0 likes, por lo que carece de validacion externa de la comunidad.
- No dispone de benchmarks publicados, ni de evaluaciones de calidad, seguridad o sesgo.
- Los documentos de entrenamiento son sinteticos y fueron generados por Claude Opus 5.5 con la pasada de puntuacion omitida, lo que introduce el sesgo y los posibles artefactos del modelo generador.
- La mezcla de continued pretraining puede degradar capacidades del modelo base (olvido catastrofico); no se documenta ninguna evaluacion al respecto.
- Los idiomas soportados no estan confirmados, pese a que la familia Qwen3 es multilingue.
- Riesgo de alucinacion no evaluado para esta variante.
- La licencia Apache-2.0 permitiria uso comercial, pero el modelo no esta disenado ni validado para ello y no deberia desplegarse en entornos de cara al usuario.
- El comportamiento entrenado depende enteramente de la direccion de un corpus sintetico, de modo que su robustez fuera de ese dominio es desconocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-feather30-mt-commit-cannot
- Modelo base: https://huggingface.co/joshycodes/qwen3-4b-feather30-mt
- Brazo gemelo del estudio: https://huggingface.co/joshycodes/qwen3-4b-feather30-mt-commit-always
- Paper, blog, repositorio o demo asociados: no disponibles en la informacion proporcionada.
