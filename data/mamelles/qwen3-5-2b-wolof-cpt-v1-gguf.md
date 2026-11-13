# mamelles/Qwen3.5-2B-Wolof-CPT-v1-GGUF

## Resumen

Qwen3.5-2B-Wolof-CPT-v1-GGUF es la exportacion en formato GGUF del modelo Tonic/Qwen3.5-2B-Wolof-CPT-v1, un ajuste del modelo base Qwen3.5 de 2B parametros orientado al wolof, lengua hablada principalmente en Senegal, Gambia y Mauritania. El autor de la conversion es el usuario mamelles, que publica las cuantizaciones listas para su uso con llama.cpp. El modelo conserva la arquitectura y el tamano del Qwen3.5-2B original (2.405.781.312 parametros) y anade un entrenamiento continuado (CPT, continued pre-training) sobre corpus en wolof.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de adaptacion linguistica de bajo coste sobre un modelo pequeno, un patron cada vez mas habitual para lenguas de bajos recursos; por otro, permite evaluar con rigor que informacion esta realmente disponible y cual no. La model card del autor es minima (una linea de descripcion y un comando de ejemplo), por lo que muchos datos tecnicos habituales (licencia, idiomas exactos, composicion del corpus, benchmarks) no estan publicados.

El repositorio ocupa 12,3 GB e incluye cinco cuantizaciones (F16, Q8_0, Q5_K_M, Q4_K_M y Q4_0). El modelo base declarado es Tonic/Qwen3.5-2B-Wolof-CPT-v1 y la libreria es gguf, con pipeline de text-generation y compatibilidad con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del Qwen3.5-2B base); detalles especificos no disponibles |
| Parametros totales | 2.405.781.312 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | wolof (objetivo del ajuste); lista completa no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una exportacion GGUF del checkpoint Tonic/Qwen3.5-2B-Wolof-CPT-v1, que a su vez parte de la familia Qwen3.5 en su variante de 2B parametros. La arquitectura es, por tanto, la del transformer decoder-only de Qwen3.5-2B; el autor de la conversion no documenta modificaciones estructurales. El sufijo CPT indica un entrenamiento continuado (continued pre-training) sobre texto en wolof a partir del modelo base, una tecnica habitual para adaptar modelos multilingues a lenguas con pocos datos. No se especifican el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo fases de RLHF o DPO.

La aportacion tecnica del repositorio es la conversion a GGUF y la generacion de cinco niveles de cuantizacion, lo que permite ejecutar el modelo en CPU y en GPU de gama baja mediante llama.cpp. No se documentan innovaciones como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido. Tampoco se detalla el proceso de cuantizacion (herramienta, version, calibracion).

## Capacidades

- Generacion de texto conversacional en wolof, segun el ejemplo de la model card ("Salaam aleekum, naka nga def?").
- Generacion de texto general heredada del modelo Qwen3.5-2B base; el alcance exacto tras el CPT no esta documentado.
- Ejecucion local en CPU y GPU mediante llama.cpp gracias al formato GGUF.
- Compatibilidad declarada con endpoints (tag endpoints_compatible).
- Capacidades de tool calling, agentes, vision, audio o modo thinking: no disponibles en la informacion proporcionada.
- Cobertura multilingue distinta del wolof: no disponible.

## Casos de uso

- Procesamiento de lenguaje natural en wolof: el modelo puede emplearse para tareas de generacion y conversacion en esta lengua, que carece de cobertura amplia en modelos generalistas. Es adecuado por su ajuste especifico y su bajo coste de inferencia.
- Despliegue en entornos con hardware limitado: las cuantizaciones Q4_K_M y Q4_0 permiten ejecutar el modelo en CPU o en GPUs de consumo, lo que facilita prototipos y demos sin infraestructura dedicada.
- Investigacion sobre adaptacion linguistica: sirve como caso de estudio de continued pre-training sobre una lengua de bajos recursos partiendo de un modelo de 2B parametros.
- Integracion en aplicaciones de mensajeria o asistentes locales para hablantes de wolof, usando llama.cpp como motor de inferencia embebido.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece cinco niveles (F16 a Q4_0) para medir el compromiso entre calidad y memoria en una misma tarea.
- Fines educativos y de documentacion: util para ensenar el flujo completo de ajuste, conversion a GGUF y cuantizacion de un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en el numero de parametros (2,4B), F16 requeriria del orden de 4,8 GB solo en pesos, Q8_0 unos 2,5 GB y Q4_K_M aproximadamente 1,5 GB, sin contar el overhead de contexto y runtime.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- GPU de consumo: por tamano, las cuantizaciones Q4 y Q5 deberian caber en GPUs de consumo con 4-8 GB de VRAM, aunque el autor no lo confirma.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); el autor muestra llama-cli. Otras herramientas (Ollama, vLLM, TGI) no estan documentadas para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Wolof-CPT-v1-GGUF (este) | 2,4B | no disponible | no disponible | GGUF | Ajuste CPT en wolof, 5 cuantizaciones |
| Tonic/Qwen3.5-2B-Wolof-CPT-v1 | 2,4B | no disponible | no disponible | safetensors (presumible) | Modelo base del que deriva este repositorio |
| Qwen3.5-2B (base original) | 2,4B | no disponible | no disponible | safetensors, GGUF | Modelo generalista sin ajuste en wolof |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card es minima: no documenta licencia, idiomas exactos, contexto ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para produccion.
- Riesgo de alucinacion inherente a los modelos de 2B parametros, potencialmente mayor en una lengua de bajos recursos por escasez de datos de calidad.
- Sesgos desconocidos: no se ha publicado ninguna evaluacion de sesgos ni de seguridad.
- Restricciones de licencia para uso comercial: no disponibles; debe consultarse el modelo base Tonic/Qwen3.5-2B-Wolof-CPT-v1 y la licencia de Qwen3.5 antes de cualquier uso comercial.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- La calidad de las cuantizaciones de baja precision (Q4_0) puede degradar el rendimiento en wolof; no se han publicado evaluaciones por cuantizacion.
- El ejemplo de la model card invoca el repositorio Tonic/...-GGUF, no el de mamelles; conviene verificar que la referencia corresponde al artefacto correcto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mamelles/Qwen3.5-2B-Wolof-CPT-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-2B-Wolof-CPT-v1
- Referencia citada en el ejemplo de la model card: https://huggingface.co/Tonic/Qwen3.5-2B-Wolof-CPT-v1-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
