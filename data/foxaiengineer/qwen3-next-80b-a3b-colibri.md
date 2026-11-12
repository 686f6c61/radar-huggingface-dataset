# foxAIengineer/Qwen3-Next-80B-A3B-colibri

## Resumen

Qwen3-Next-80B-A3B-colibri es un contenedor de pesos publicado por el usuario foxAIengineer para el motor de inferencia colibri. A pesar del nombre del repositorio, la model card describe el contenido como el modelo Qwen3.6-35B-A3B en formato colibri, con todas las capas incluidas (Gated-Attention y Gated DeltaNet). Se trata, por tanto, de una conversión o empaquetado de un modelo Qwen de arquitectura MoE con atención lineal híbrida, no de un modelo entrenado desde cero por el autor del repositorio.

El interés técnico del artefacto reside en el motor de destino: colibri implementa en C (fichero `qwen36.c`) la regla recurrente gated-delta para ejecutar las capas DeltaNet, cuyos pesos se almacenan bajo `model.layers.{i}.linear_attn.*`. Esto permite ejecutar un MoE de gran tamaño con atención híbrida fuera de los stacks habituales (transformers, vLLM), lo que resulta relevante para experimentación con inferencia de bajo nivel y despliegues ligeros.

La información disponible es muy escasa: no hay datos de licencia, idiomas, benchmarks ni pipeline declarados, el repositorio acumula 0 descargas y 0 likes, y el tamaño del repo es de 53,1 GB. Las cifras de parámetros del nombre (80B totales, 3B activos) no coinciden con las de la model card (35B-A3B), por lo que deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida: Gated-Attention + Gated DeltaNet (linear attention) |
| Parametros totales | No disponible de forma fiable; el nombre del repo indica 80B y la model card indica 35B (discrepancia sin resolver) |
| Parametros activos | No disponible de forma fiable; el nombre del repo indica 3B y la model card indica 35B-A3B |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato propietario del motor colibri) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Contenedor colibri (no safetensors ni GGUF); pesos DeltaNet en `model.layers.{i}.linear_attn.*` |

## Arquitectura y entrenamiento

La arquitectura descrita es un MoE en el que cada capa (Gated-Attention y Gated DeltaNet) incorpora su bloque MoE/MLP. Las capas DeltaNet emplean una regla recurrente gated-delta implementada en el motor colibri (`c/qwen36.c`), lo que sustituye parte de la atención cuadrática por atención lineal recurrente. El contenedor corresponde a la "Fase 2" del proyecto de conversión, con todas las capas incluidas.

No se dispone de información sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones de decodificación (especulativa u otras) más allá de la propia atención lineal. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo Qwen subyacente, no verificadas en este contenedor.
- Código y matemáticas: presumibles por la familia de origen, sin benchmarks que lo confirmen en este artefacto.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas figuran como no disponibles.
- Modo thinking, visión o audio: no documentado.
- Ejecución mediante el motor colibri con soporte de capas Gated DeltaNet recurrentes.

## Casos de uso

- Experimentación con atención lineal híbrida: usar el contenedor para validar la implementación de la regla gated-delta en `qwen36.c` frente a una implementación de referencia en PyTorch, comparando salidas capa a capa.
- Inferencia de bajo nivel en C: desplegar el modelo con el motor colibri en entornos donde no se quiere arrastrar el stack de Python ni CUDA de alto nivel, aprovechando que el motor está escrito en C.
- Investigación sobre MoE con atención híbrida: analizar el comportamiento de los bloques MoE asociados a capas DeltaNet y comparar su activación con la de capas de atención completa.
- Reproducción de conversiones de pesos: tomar el repositorio como referencia del pipeline de conversión de un modelo Qwen a formato colibri, útil para portar otros modelos de la misma familia.
- Pruebas de integración de motores alternativos: evaluar colibri como backend frente a llama.cpp o vLLM en términos de corrección numérica y consumo de memoria, dado el tamaño de 53,1 GB del repo.
- Docencia y estudio de arquitecturas híbridas: inspeccionar la organización de pesos (`model.layers.{i}.linear_attn.*`) para explicar cómo se combinan atención gated y atención lineal en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repo ocupa 53,1 GB, lo que da una cota inferior del espacio en disco necesario, pero no se documenta el consumo en memoria durante la inferencia.
- GPU recomendadas: no disponibles; el motor colibri está escrito en C y no se especifica si requiere GPU o puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no determinable con los datos disponibles.
- Opciones de despliegue: motor colibri (https://github.com/JustVugg/colibri, fichero `c/qwen36.c`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Next-80B-A3B-colibri | No disponible (nombre: 80B-A3B; card: 35B-A3B) | No disponible | No disponible | Contenedor colibri | Hugging Face, 0 descargas |
| Modelo Qwen original (referencia) | Segun variante de la familia Qwen | No disponible | No disponible | Safetensors | No verificada en esta busqueda |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para establecer una comparativa rigurosa con alternativas concretas.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre del repositorio indica 80B-A3B y la model card indica 35B-A3B; no hay forma de resolver la cifra correcta con la información disponible.
- Licencia no declarada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no declarados: no se puede garantizar cobertura multilingüe.
- Sin benchmarks ni evaluaciones publicadas: el rendimiento real del contenedor no está verificado.
- Artefacto con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Dependencia de un motor no estándar (colibri): la corrección numérica de la implementación gated-delta no está contrastada en la información disponible.
- Riesgo de alucinación y sesgos: no evaluados para este contenedor; se heredan, en su caso, del modelo de origen.
- El formato propietario impide usarlo directamente con herramientas estándar (transformers, vLLM, llama.cpp) sin conversión.
- Fecha de creación declarada en 2026-11-11, posterior a la mayoría de referencias públicas de la familia Qwen; conviene verificar la procedencia de los pesos antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/foxAIengineer/Qwen3-Next-80B-A3B-colibri
- Motor colibri: https://github.com/JustVugg/colibri
- Implementación del motor Qwen3.6 en colibri: `c/qwen36.c` dentro del repositorio anterior
- Paper, blog, demo o repositorio adicionales: no disponibles en la información proporcionada
