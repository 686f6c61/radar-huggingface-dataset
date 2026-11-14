# agentic-underground/smollm2-360m-to-1.7b-bridge

## Resumen

El modelo `agentic-underground/smollm2-360m-to-1.7b-bridge` no es un modelo de lenguaje en sentido estricto, sino un puente KV (KV bridge) entrenado que conecta dos modelos de la familia SmolLM2 de Hugging Face. SmolLM2-360M-Instruct lee el prompt y este puente traduce su estado interno a la memoria de claves y valores que SmolLM2-1.7B-Instruct habría construido por sí mismo. El modelo grande responde a partir de esa memoria, leyendo directamente un único token del prompt. Lo desarrolla el colectivo agentic-underground y aplica el método LatentPort de Simon Villani (arXiv:2609.25053), un salto de escala de cinco veces entre el modelo donante y el receptor.

La relevancia técnica está en que demuestra que se puede transferir el estado latente entre modelos de distinta forma arquitectónica (32 capas con 5 cabezas KV frente a 24 capas con 32 cabezas KV, ambas de 64 dimensiones) mediante regresiones ridge en forma cerrada más una corrección residual aprendida. El puente cierra el 84,5 % de la brecha de pérdida entre el modelo grande leyendo nada y leyéndolo todo (ratio NCR), y acierta 7 de 7 preguntas reservadas con un solo token de puente, igual que el 1.7B leyendo el prompt completo.

El repositorio ocupa 0,4 GB y contiene únicamente los tensores del puente, no los pesos de ninguno de los dos SmolLM2. Está publicado bajo licencia Apache-2.0 y se integra a través de la implementación en Rust de PrattleNot, no mediante `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente KV (regresiones ridge por capa más corrección residual de rango 4); no es un transformer |
| Parametros totales | no disponible (el fichero pesa 378 MB; no se declara recuento de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (tensores en f16 para mapas `k.<l>`/`v.<l>` y f32 para correcciones `ck.<l>`/`cv.<l>`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`smollm2-360m-to-1.7b.safetensors`, sin `__metadata__`) |

## Arquitectura y entrenamiento

El puente no replica la arquitectura de un transformer, sino que actúa como un adaptador de estado latente entre dos modelos con formas distintas. Los mapas se construyen con regresiones ridge en forma cerrada, una por capa objetivo para claves y otra para valores, que leen el flujo residual del SmolLM2-360M en dos puntos de extracción (taps) en lugar de sus propias claves y valores. Cada mapa tiene forma `1921 × 2048` en f16 e incluye un término de intercepto. El tensor `layer_of` indica qué capa del 360M alimenta a cada capa del 1.7B, y `meta` recoge las constantes de forma que necesita el lector. El ajuste de los mapas se midió en unas 2,5 horas.

Sobre esos mapas se aplica la corrección residual aprendida del artículo (rango 4 por capa objetivo y por rol), entrenada a través del SmolLM2-1.7B congelado contra la distribución nativa del propio 1.7B, durante 3 épocas, con pérdida que baja de 0,316 a 0,188 y luego a 0,144. La corrección se pliega en el fichero como `I + BUᵀ` y se almacena en tensores `ck.<l>`/`cv.<l>` de forma `64 × 64` en f32. El entrenamiento de la corrección se midió en unas 1,5 horas. Los datos de calibración son unas 600 preguntas con plantilla generadas de forma determinista por `bridge_corpus.rs`; las preguntas reservadas del mismo fichero nunca se usan en el ajuste y un test unitario garantiza que ambos conjuntos son disjuntos. La innovación destacable es el traspaso de un único token: la corrección es lo que permite que un solo token de puente transporte la respuesta del 1.7B.

## Capacidades

- Traducción del estado latente del SmolLM2-360M-Instruct a la memoria KV del SmolLM2-1.7B-Instruct.
- Handoff de un solo token: el 1.7B genera la respuesta leyendo únicamente un token del prompt a través de la memoria puenteada.
- Cierre del 84,5 % de la brecha NCR (native-closure ratio) con la corrección aprendida, frente al 61,1 % solo con los mapas ridge.
- Acierto de 7 de 7 preguntas reservadas con un solo token de puente, igual que el 1.7B leyendo el prompt completo.
- Control negativo: alimentado con la memoria de otra pregunta (donante incorrecto), el NCR cae a −0,266, lo que confirma que el puente no responde a una señal genérica.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito por sí mismo; hereda las capacidades del SmolLM2-1.7B-Instruct subyacente, que no se detallan en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre transferencia de estado latente entre modelos: el puente sirve como banco de pruebas reproducible del método LatentPort en un salto de escala de 5×, con instrucciones de reproducción en `documents/BRIDGE.md` y `documents/REPRODUCTION.md` §5.2 de PrattleNot.
- Aceleración de la primera fase de inferencia en servidor: el 360M procesa el prompt y el 1.7B solo lee un token, lo que en principio reduce el coste de prefill del modelo grande; el límite teórico medido en la CPU del host es de 2,12× (tiempo hasta el primer token del 1.7B dividido por el del 360M), aunque la aceleración real no se ha medido.
- Validación de metodologías de destilación y compresión: permite comparar el cierre de brecha de pérdida (NCR) frente a alternativas como destilación clásica o adaptadores, usando el control de donante incorrecto como referencia.
- Docencia y divulgación sobre mecánica interna de transformers: al exponer explícitamente los mapas de claves y valores por capa, facilita experimentos sobre cómo se codifica la información en el flujo residual.
- Prototipado de arquitecturas de dos etapas (modelo pequeño de lectura, modelo grande de generación) en entornos con restricciones de cómputo, siempre que se acepte la integración vía `prattle_core::bridge` en Rust.
- Evaluación de robustez de puentes entre modelos de distinta forma: el par 360M/1.7B (32 capas, 5 cabezas KV frente a 24 capas, 32 cabezas KV, ambas de 64 dimensiones) es un caso de estudio útil para medir la degradación al cruzar configuraciones de atención distintas.

## Benchmarks y rendimiento

| Metrica | Solo mapas ridge | Con correccion aprendida | Donante incorrecto (control) |
|---|---|---|---|
| NCR (cierre de brecha de pérdida) | 0,611 | 0,845 | −0,352 (ridge) / −0,266 (con corrección) |
| Aciertos en 7 preguntas reservadas, un token de puente | 6 (igual que el 360M solo) | 7 (igual que el 1.7B leyendo todo) | no disponible |

El NCR se define como `(ℓ_empty − ℓ_bridged) / (ℓ_empty − ℓ_native)`, donde cada ℓ es la pérdida del 1.7B sobre su propia respuesta nativa, evaluada con teacher forcing (arXiv:2609.25053, Eq. 8). Es un ratio de pérdida, no una tasa de coincidencia de tokens. La aceleración de este par no se ha medido; el máximo teórico en la CPU del host es 2,12×.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el puente en sí ocupa 378 MB, pero requiere cargar simultáneamente SmolLM2-360M-Instruct y SmolLM2-1.7B-Instruct.
- GPU recomendadas: no disponibles; la model card menciona ejecución en CPU del host y describe el hermano menor (135M → 360M) como ejecutable en navegador, mientras que este par "de momento corre en servidor".
- Viabilidad en GPU de consumo: no disponible; por tamaño de los dos modelos base cabría esperar que quepa en GPUs de consumo con suficiente VRAM, pero no se confirma en la información.
- Opciones de despliegue: el puente se lee con `prattle_core::bridge` de PrattleNot, implementado en Rust; no es un modelo `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos. Límite superior teórico de 2,12× en el tiempo hasta el primer token en la CPU del host.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm2-360m-to-1.7b-bridge | Puente KV (LatentPort) | no disponible (378 MB) | no disponible | Apache-2.0 | Hugging Face, integración solo vía PrattleNot (Rust) |
| agentic-underground/smollm2-135m-to-360m-bridge | Puente KV (LatentPort), hermano menor | no disponible | no disponible | no disponible | Hugging Face, ejecutable en navegador |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | Modelo base (transformer) | 1,7B | no disponible en esta ficha | Apache-2.0 | Hugging Face, `transformers` |
| HuggingFaceTB/SmolLM2-360M-Instruct | Modelo base (transformer) | 360M | no disponible en esta ficha | Apache-2.0 | Hugging Face, `transformers` |

No se dispone de datos de benchmarks comparativos con otras técnicas de puente o destilación en la información proporcionada.

## Limitaciones y advertencias

- El puente no es un modelo autónomo: requiere cargar SmolLM2-360M-Instruct y SmolLM2-1.7B-Instruct por separado desde HuggingFaceTB; el repositorio no contiene pesos de ninguno de los dos.
- No es compatible con `transformers`; la única vía de uso documentada es `prattle_core::bridge` dentro del proyecto PrattleNot en Rust, lo que limita su integración en pipelines Python habituales.
- La aceleración real no se ha medido; el 2,12× es solo un límite superior teórico en la CPU del host, no una cifra de rendimiento.
- La evaluación se apoya en un conjunto muy reducido (7 preguntas reservadas) y en el ratio de pérdida NCR, no en métricas estándar de calidad como MMLU, HumanEval o GSM8K.
- El puente se calibró con unas 600 preguntas con plantilla generadas de forma determinista; el comportamiento fuera de esa distribución no está caracterizado.
- Riesgo de alucinación y sesgos: no documentados específicamente para el puente; hereda los del SmolLM2-1.7B-Instruct, que no se detallan en la información disponible.
- Idiomas soportados: no disponibles; no se declara cobertura multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero la atribución a LatentPort (Simon Villani) y a SmolLM2 (Hugging Face) debe mantenerse según la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-underground/smollm2-360m-to-1.7b-bridge
- Modelo hermano (135M → 360M): https://huggingface.co/agentic-underground/smollm2-135m-to-360m-bridge
- Paper LatentPort (arXiv:2609.25053): https://huggingface.co/papers/2609.25053
- Sitio de LatentPort: https://latentport.com/
- Repositorio LatentPort: https://github.com/LatentPort/latentport
- Reproducción PrattleNot: https://github.com/agentic-underground/PrattleNot
- Documentación del puente: https://github.com/agentic-underground/PrattleNot/blob/main/documents/BRIDGE.md
- Documentación de reproducción: https://github.com/agentic-underground/PrattleNot/blob/main/documents/REPRODUCTION.md
- Generador del corpus de calibración: https://github.com/agentic-underground/PrattleNot/blob/main/crates/core/src/bridge_corpus.rs
- SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- SmolLM2-1.7B-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
