# godman0711/zils-lite-i1126a

## Resumen

Zils d3-lite i1126a es un checkpoint de pesos publicado por el usuario godman0711 en Hugging Face, identificado como el "cuerpo" (body) de un modelo para la subred Zils (127). No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: la model card indica explícitamente que los pesos de `model.safetensors` son los de illuin/Ivonnet-0.8B sin modificar, en la revisión `6a6a979489d262861ad3c34faaa1a763d1ce4baf`, y que se publican como cuerpo de un "soup" para dicha subred.

El modelo base, Ivonnet-0.8B de Illuin Technology, es un transformer de aproximadamente 853 millones de parámetros (852.985.920 según los safetensors del repo, 1,7 GB en total). El checkpoint redistribuido conserva la licencia Apache 2.0 del original y copia los ficheros LICENSE y NOTICE de la fuente.

Su relevancia es acotada: no es un modelo listo para inferencia de propósito general, sino un componente intermedio de un pipeline (el "body" de un sistema que, según la model card, tendría un "readout head", una "decision config" y un "engine code" que no se incluyen en este repositorio). Resulta útil para quien quiera reproducir o auditar el estado de pesos exacto que emplea la subred Zils, no para quien busque un modelo conversacional o de generación de texto autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de illuin/Ivonnet-0.8B); detalles no disponibles en la informacion proporcionada |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16; no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna; solo indica que los pesos son los de illuin/Ivonnet-0.8B sin cambios. Por tanto, cualquier detalle sobre tipo de atención, normalización, tokenizador o composición del dataset de entrenamiento debe consultarse en la ficha del modelo base, no en este repositorio. El tamaño de 853 M de parámetros y el repo de 1,7 GB son coherentes con pesos en precisión de 16 bits.

No se documenta ningún proceso de entrenamiento adicional, RLHF, DPO ni ajuste por parte del autor de este checkpoint. La única intervención declarada es la selección de la revisión concreta del modelo base y su empaquetado como "d3-lite soup body" para la subred Zils. El resto del sistema (cabeza de lectura, configuración de decisión y código de motor) no está incluido, lo que limita la reproducibilidad del pipeline completo a partir de este repo.

## Capacidades

- No se documentan capacidades específicas en la información proporcionada.
- Al ser pesos sin modificar de Ivonnet-0.8B, sus capacidades serían las del modelo base; no obstante, este repo no incluye cabeza de lectura ni configuración de inferencia, por lo que no es directamente ejecutable como modelo de lenguaje completo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Auditoría de pesos: verificar que el estado de `model.safetensors` coincide con la revisión declarada de illuin/Ivonnet-0.8B mediante comparación de hashes, útil para validar la integridad de un pipeline de la subred Zils.
- Reproducción de experimentos de la subred Zils: cargar este body junto con la cabeza de lectura y el motor correspondientes (no incluidos aquí) para replicar el comportamiento del sistema completo.
- Punto de partida para fine-tuning: al ser pesos Apache 2.0 en safetensors, puede servir como inicialización para ajuste supervisado en tareas concretas, siempre que se añada la cabeza adecuada.
- Archivado y trazabilidad: conservar una copia congelada de la revisión concreta del modelo base empleada por un sistema en producción, para auditorías de cumplimiento o comparaciones de regresiones.
- Distribución interna de componentes: en un entorno de investigación, servir este body a través de un repositorio espejo para evitar dependencias de la disponibilidad del repo original de Illuin.
- Base para pruebas de integración: validar el cargador de pesos y las rutas de serialización de un motor propio antes de conectar la cabeza de lectura y la configuración de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 853 M de parámetros, los pesos en fp16 ocuparían aproximadamente 1,7 GB, y en cuantizaciones de 8 y 4 bits alrededor de 0,9 GB y 0,45 GB respectivamente (estimación a partir del recuento de parámetros, no confirmada por el autor).
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM podría alojar los pesos en fp16, aunque la ausencia de cabeza de lectura y motor impide una inferencia completa directa.
- Cabe en GPU consumer: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090 y similares), sujeto a la implementación del pipeline completo.
- Opciones de despliegue: no documentadas; al ser safetensors, sería compatible con cargadores estándar de la librería `transformers` si se dispone de la configuración y el tokenizador del modelo base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Zils d3-lite i1126a | 852.985.920 | no disponible | Apache 2.0 | Hugging Face (godman0711) |
| illuin/Ivonnet-0.8B | ~0,8 B (no confirmado en detalle) | no disponible | no disponible en esta ficha | Hugging Face (illuin) |
| Alternativas de ~1 B parámetros | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de alternativas en la información proporcionada; la comparación se limita al modelo base del que derivan los pesos.

## Limitaciones y advertencias

- El repositorio no contiene cabeza de lectura, configuración de decisión ni código de motor, por lo que no es un modelo autónomo listo para producción.
- Los pesos son idénticos a los de illuin/Ivonnet-0.8B; cualquier sesgo, riesgo de alucinación o limitación lingüística del modelo base se hereda sin cambios.
- No se documentan idiomas soportados ni longitud de contexto, lo que impide evaluar su idoneidad para tareas multilingües o de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los ficheros LICENSE y NOTICE copiados del repositorio original para confirmar obligaciones de atribución.
- El autor del checkpoint no es Illuin Technology; el crédito de los pesos corresponde al desarrollador original, y así se declara en la model card.
- No hay descargas ni likes registrados, y la fecha de creación indicada (2026-11-26) resulta anómala; conviene verificar la integridad y procedencia antes de usarlo en producción.
- No se han publicado benchmarks ni evaluaciones independientes de este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/godman0711/zils-lite-i1126a
- Modelo base: https://huggingface.co/illuin/Ivonnet-0.8B
- Revisión del modelo base citada: `6a6a979489d262861ad3c34faaa1a763d1ce4baf`
