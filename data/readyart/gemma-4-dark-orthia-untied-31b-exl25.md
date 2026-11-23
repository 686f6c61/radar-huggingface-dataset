# ReadyArt/Gemma-4-Dark-Orthia-Untied-31B-EXL25

## Resumen

Gemma-4-Dark-Orthia-Untied-31B-EXL25 es una cuantización en formato EXL2.5 del modelo Gemma-4-31B-IT, publicada por el usuario ReadyArt en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un artefacto de inferencia: pesos cuantizados de un modelo base de Google (la familia Gemma 4) adaptados al fork de ExLlamaV2 mantenido por el propio autor. El repositorio tiene 0 descargas y 0 likes, y se creó y actualizó el 23 de noviembre de 2026, lo que indica una publicación muy reciente y sin adopción registrada.

El interés técnico del artefacto reside en el formato EXL2.5, una evolución del contenedor EXL2 que añade mejoras opcionales por tensor: una ruta rápida de GEMM sin ramificaciones optimizada para arquitecturas Ampere (RTX 3090), con un límite de 16 filas para que la verificación MTP con batch-4 lea los pesos una sola vez, y mejoras de calidad basadas en rotación de incoherencia de Hadamard, protección de canales AWQ y redondeo guiado por Hessiana al mismo número de bits por peso. Los modelos EXL2 convencionales siguen cargándose sin cambios.

La relevancia práctica es acotada pero clara para quien despliega Gemma 4 de 31B en GPUs de consumo o estaciones de trabajo con Ampere o superior: el autor documenta que con 24 GB de VRAM se puede cuantizar Gemma-4-31B-IT en unos 45 minutos usando las mediciones publicadas en su repositorio auxiliar. La licencia declarada es Apache 2.0, aunque conviene verificar que esa licencia cubre efectivamente los pesos derivados del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Gemma-4-31B-IT); artefacto de cuantizacion EXL2.5 |
| Parametros totales | 31B (segun el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL2.5 (contenedor EXL2 con mejoras por tensor: fast-path GEMM, rotacion Hadamard, AWQ, redondeo Hessiano); bits por peso concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | EXL2 / EXL2.5 (requiere fork de ExLlamaV2; no compatible con el build estandar) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado por el autor, sino una cuantizacion del modelo Gemma-4-31B-IT. Por tanto, la arquitectura subyacente es la del transformer de Gemma 4 de 31B, sobre cuyo entrenamiento (número de tokens, composición del dataset, fases de RLHF o DPO) la model card no aporta ningún dato. Toda la información técnica disponible se refiere al proceso de cuantización.

La innovación destacable es el formato EXL2.5, definido en el fork de ExLlamaV2 del autor. Mantiene el contenedor de archivo de EXL2 e incorpora mejoras opcionales por tensor: una ruta rápida de GEMM sin ramificaciones diseñada para Ampere y RTX 3090, con un tope de 16 filas para que la verificación MTP con batch-4 lea los pesos una sola vez, y un conjunto de técnicas de calidad (rotación de incoherencia de Hadamard, protección de canales AWQ y redondeo guiado por Hessiana) aplicadas sin aumentar los bits por peso. El autor publica además un repositorio de mediciones (EXL25-Measurements) para reutilizar los cálculos y reducir el tiempo de cuantización.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Gemma-4-31B-IT.
- Instrucción y diálogo multi-turno (sufijo IT del modelo base).
- Capacidades de código, matemáticas y multilingües: no disponibles en la información proporcionada para esta ficha.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- Inferencia con decodificación especulativa MTP (multi-token prediction) a través del fork de ExLlamaV2, con verificación en batch-4 según la model card.

## Casos de uso

- Despliegue local de un modelo de 31B en GPU de 24 GB: el autor indica que con una GPU Ampere o superior de 24 GB se puede cuantizar Gemma-4-31B-IT en unos 45 minutos, lo que permite generar variantes propias ajustadas a la VRAM disponible.
- Servicio de inferencia compatible con OpenAI a través de TabbyAPI: el fork de TabbyAPI del autor permite exponer el modelo cuantizado como endpoint HTTP para integrarlo en aplicaciones existentes.
- Evaluación de formatos de cuantización: útil para comparar EXL2.5 frente a EXL2 estándar al mismo bits por peso, gracias a las mejoras de Hadamard, AWQ y redondeo Hessiano.
- Experimentación con decodificación especulativa MTP: el límite de 16 filas del fast-path está pensado para que la verificación con batch-4 lea los pesos una sola vez, lo que facilita medir el impacto del MTP en latencia.
- Prototipado de asistentes conversacionales en estación de trabajo: un modelo IT de 31B cuantizado permite probar flujos de chat multi-turno sin depender de APIs externas.
- Reproducción de cuantizaciones propias: las mediciones publicadas en EXL25-Measurements permiten reutilizar el coste de cálculo y generar cuantizaciones con otros bits por peso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el autor menciona GPUs de 24 GB como referencia para cuantizar el modelo de 31B en unos 45 minutos.
- GPU recomendadas: arquitecturas Ampere o superiores; el fast-path GEMM está optimizado específicamente para Ampere y RTX 3090.
- GPU de consumo: el modelo de 31B cuantizado en EXL2.5 está pensado para caber en GPUs de 24 GB (por ejemplo, RTX 3090 o RTX 4090), aunque los bits por peso concretos de esta publicación no se detallan.
- Opciones de despliegue: exclusivamente el fork de ExLlamaV2 del autor (https://github.com/Ready-Art/exllamav2-Fork) y el fork de TabbyAPI (https://github.com/Ready-Art/tabbyAPI-Fork). No funciona con el build estándar de exllamav2/tabbyapi.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt/Gemma-4-Dark-Orthia-Untied-31B-EXL25 | 31B (segun nombre) | no disponible | EXL2.5 (fork) | apache-2.0 | Hugging Face, 0 descargas |
| Gemma-4-31B-IT (modelo base) | 31B | no disponible | safetensors (presumible) | no disponible en esta ficha | no disponible |
| Cuantizaciones EXL2 estandar de modelos de 31B | 31B | no disponible | EXL2 | segun modelo base | ecosistema exllamav2 estandar |

La comparación con alternativas concretas no está disponible en la información proporcionada; los datos del modelo base Gemma-4-31B-IT no se detallan en la model card.

## Limitaciones y advertencias

- No es un modelo original: es una cuantización de Gemma-4-31B-IT; los sesgos y limitaciones del modelo base se heredan sin que la model card los documente.
- Riesgo de alucinación: no evaluado ni documentado para este artefacto.
- Compatibilidad restringida: requiere los forks de ExLlamaV2 y TabbyAPI del autor; no funciona con el build estándar de exllamav2/tabbyapi.
- El formato EXL2.5 está definido por un fork mantenido por un único autor, lo que implica riesgo de mantenimiento y de soporte a largo plazo.
- La licencia declarada es Apache 2.0, pero la model card no aclara si esa licencia cubre los pesos derivados del modelo base de Google; conviene verificar los términos del modelo Gemma original antes de uso comercial.
- Sin datos de benchmarks, idiomas soportados ni contexto: no se puede validar su rendimiento frente a otras cuantizaciones.
- Repositorio sin adopción (0 descargas, 0 likes) y creado en noviembre de 2026: no hay evidencia de la comunidad sobre su calidad o estabilidad.
- El autor advierte que las cuantizaciones EXL consumen mucho espacio en disco.

## Enlaces

- Hugging Face: https://huggingface.co/ReadyArt/Gemma-4-Dark-Orthia-Untied-31B-EXL25
- Mediciones para cuantización: https://huggingface.co/ReadyArt/EXL25-Measurements
- Fork de ExLlamaV2: https://github.com/Ready-Art/exllamav2-Fork
- Fork de TabbyAPI: https://github.com/Ready-Art/tabbyAPI-Fork
