# IndrasMirror/Inkling-2-Mini-XQ-Uncensored

## Resumen

Inkling-2-Mini-XQ-Uncensored es una cuantización mixta del modelo Inkling 2 Mini de Thinking Machines Lab, publicada por IndrasMirror. El modelo base es un transformer decoder-only de 24 capas con bloques feed-forward MoE dispersos, 26B parámetros totales y aproximadamente 3B activos, con 128 expertos enrutados y top-8. Su rasgo arquitectónico más distintivo es el bucle: las capas 6 a 17 se ejecutan tres veces con pesos compartidos, de modo que cada token recibe 48 aplicaciones de capa a partir de 24 capas de pesos y la caché mantiene 48 ranuras.

Esta variante aplica dos transformaciones sobre el checkpoint oficial: primero una "abliteración" que elimina la dirección de rechazo de los pesos en las partes de precisión completa, y después una recuantización con el pipeline propietario XQ, que asigna a cada tensor su propio formato según la sensibilidad medida para un presupuesto dado de bits por peso. El resultado se distribuye en GGUF y está pensado para ejecutarse en GPU de consumo mediante el motor Xolotl, construido sobre Strata y con el grafo forward portado de llama.cpp.

La relevancia actual del modelo radica en su combinación de contexto de 1M tokens, arquitectura MoE con bucle y empaquetado para hardware asequible, además de su licencia Apache 2.0. No obstante, la propia model card se marca explícitamente como borrador no publicado: tamaños de fichero, velocidades y métricas de calidad aparecen como TBD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y bucle de capas (looped transformer) |
| Parametros totales | 26B |
| Parametros activos | Aproximadamente 3B (MoE, 128 expertos enrutados, top-8) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | GGUF con precisión mixta XQ; expertos NVFP4 en capas 0-19 y MXFP8 en 20-23 en el checkpoint oficial; resto BF16 en origen |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Inkling-2-Mini-XQ-Uncensored.gguf`; proyector de visión `mmproj-Inkling-2-Mini-XQ.gguf` planificado) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 24 capas con atención de ventana deslizante de 1024 tokens e inserción de una capa global cada sexta capa (capas 5, 11, 17 y 23). No emplea RoPE: utiliza un sesgo de posición relativa aprendido por cabeza, con posiciones en escala logarítmica en las capas globales. Incorpora convoluciones causales cortas sobre K, V, la salida de atención y la salida del FFN, además de residuales de atención por bloques que mezclan profundidades anteriores y un softcap final de logits de 30. El vocabulario es de 200.058 tokens.

El bloque MoE usa 128 expertos enrutados con top-8, sin experto compartido, router sigmoide con sesgo de selección y activación SiTU. Las capas 6 a 17 se ejecutan tres veces con pesos compartidos; las pasadas 2 y 3 leen la pasada anterior a través de controladores de bucle de bajo rango por capa. El checkpoint oficial se distribuye en precisión mixta: expertos enrutados en NVFP4 en las capas 0 a 19, MXFP8 en las capas 20 a 23 y el resto en BF16.

Sobre el proceso de esta variante: la abliteración se aplica sobre las partes de precisión completa del checkpoint oficial, con dos candidatos en evaluación (ARA estilo Heretic y la proyección clásica de dirección de rechazo usada en el release Qwen3.8 Flash-Next), y se seleccionará el que mejor preserve la calidad de codificación agéntica en el conjunto Gauntlet. La cuantización XQ elige formato por tensor según sensibilidad medida para un presupuesto de bits por peso, usando los expertos NVFP4 y MXFP8 oficiales como referencia de precisión tolerable. El pipeline XQ es privado y no se documenta. No se dispone de información sobre el dataset de entrenamiento del modelo base, número de tokens, composición ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en inglés con contexto de hasta 1M tokens.
- Razonamiento multi-turno con modo de pensamiento activado ("thinking on", según la metodología del conjunto Gauntlet).
- Codificación agéntica: tareas duras ejecutadas con herramientas en sandbox y tests ocultos evaluados tras cada turno.
- Uso de herramientas (tool calling) implícito en los flujos agénticos descritos en la model card.
- Capacidad de visión planificada mediante el proyector oficial `mmproj-Inkling-2-Mini-XQ.gguf` (aún no incluido; el texto tiene prioridad).
- Capacidad de rechazo deliberadamente atenuada por la abliteración (comportamiento "uncensored").
- Soporte multilingüe: no disponible; la model card solo declara inglés.

## Casos de uso

- Codificación agéntica en pipelines de CI/CD: el modelo está diseñado para resolver tareas de varios turnos con herramientas en sandbox y tests ocultos, lo que encaja en flujos de reparación automática de tests o generación de parches verificados.
- Análisis de repositorios completos: con 1M tokens de contexto puede ingerir árboles de código extensos y documentación asociada en una sola ventana, sin necesidad de troceado agresivo.
- Asistentes de desarrollo en local sobre GPU de consumo: el empaquetado GGUF y el motor Xolotl apuntan a ejecución en una RTX 4090, lo que permite entornos de desarrollo sin dependencia de la nube.
- Investigación sobre alineación y abliteración: al eliminar la dirección de rechazo, sirve como objeto de estudio para medir el impacto de estas técnicas en calidad de código y en tasas de rechazo de prompts dañinos frente a inofensivos.
- Evaluación de cuantización mixta: útil para comparar el pipeline XQ con la conversión estándar de llama.cpp manteniendo los expertos NVFP4 nativos, con métricas de acuerdo top-1 y KL en held-out.
- Procesamiento de documentos largos en inglés: contratos, informes técnicos o expedientes que quepan en 1M tokens, con razonamiento encadenado sobre el contenido completo.
- Prototipado de agentes con memoria extensa: la caché de 48 ranuras y el contexto de 1M permiten mantener estado de conversación y trazas de herramientas durante sesiones prolongadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla comparativa frente al modelo padre (Gauntlet v3-small resueltos, puntuación sobre 6, acuerdo top-1 en held-out, KL en held-out, y tasas de rechazo en prompts dañinos e inofensivos), pero todos los valores figuran como TBD. Tampoco hay cifras de velocidad ni throughput; el autor indica que se medirán en una RTX 4090 a través del servidor real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del fichero GGUF figura como TBD y no se publica el presupuesto de bits por peso del pipeline XQ.
- GPU recomendadas: el autor cita una RTX 4090 como plataforma de medida; no se especifican A100, H100 ni otros aceleradores.
- Encaje en GPU de consumo: el tag `consumer-gpu` sugiere que el objetivo es hardware de consumo, pero no se confirma con cifras de memoria.
- Opciones de despliegue: motor Xolotl (`xolotl-inkling`), que acepta cualquier GGUF de Inkling-2-Mini, incluidos los del conversor upstream y los quants de llama.cpp. No se menciona soporte directo en vLLM, TGI, Ollama ni llama.cpp estándar para este fichero concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-XQ-Uncensored | 26B totales, ~3B activos | 1M | Apache 2.0 | GGUF en HF, motor Xolotl | Abliterado, cuantización XQ, métricas TBD |
| thinkingmachines/Inkling-2-Mini (padre) | 26B totales, ~3B activos | 1M | Apache 2.0 | Checkpoint oficial en precisión mixta NVFP4/MXFP8/BF16 | Sin abliterar; referencia de calidad del autor |
| Alternativas de tamaño y tarea comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

## Limitaciones y advertencias

- Model card en estado de borrador: el propio autor advierte que tamaños, velocidades y cifras de calidad están sin medir; no debe tratarse como release estable.
- La abliteración elimina la dirección de rechazo, lo que reduce las barreras del modelo ante prompts dañinos y traslada al desplegador la responsabilidad de filtrado y moderación.
- No hay datos publicados sobre sesgos; el modelo base solo declara inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación no cuantificado: no se han publicado métricas de fidelidad ni evaluaciones de hallucination.
- El pipeline de cuantización XQ es privado, lo que impide auditar la asignación de formatos por tensor y reproducir el proceso.
- Dependencia de un motor no estándar (Xolotl, sobre Strata) y de un grafo forward portado de un PR de llama.cpp; el ecosistema de despliegue es reducido.
- El autor documenta un bug corregido en la ruta de bucle de llama.cpp relativo a las escalas NVFP4 por experto en las pasadas 2 y 3; otras implementaciones podrían reproducirlo.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de moderación integrada exige controles adicionales en producción.
- El soporte de visión está planificado y no disponible en el momento de la publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndrasMirror/Inkling-2-Mini-XQ-Uncensored
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Thinking Machines Lab: https://thinkingmachines.ai
- Motor Xolotl: https://github.com/Indras-Mirror/Xolotl
- Strata: https://github.com/Niko1221/Strata
- PR de llama.cpp con el grafo forward de Inkling 2: https://github.com/ggml-org/llama.cpp/pull/32694
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
