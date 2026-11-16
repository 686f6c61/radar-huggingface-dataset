# lshar/tiny-aya-global-safetune-gen1

## Resumen

`lshar/tiny-aya-global-safetune-gen1` es un adaptador LoRA de alineación y seguridad construido sobre el modelo base `CohereLabs/tiny-aya-global`. Lo publica el usuario `lshar` bajo licencia Apache 2.0 y se distribuye con la librería PEFT, por lo que no es un modelo completo sino un conjunto de pesos de adaptador que debe cargarse junto al modelo base. Su propósito declarado es reforzar el cumplimiento de políticas en trayectorias de auto-mejora recursiva multirretorno, un escenario de red-teaming en el que el propio modelo itera sobre sus respuestas y puede derivar hacia comportamientos no deseados.

La propuesta técnica del autor combina dos piezas: un adaptador SafeTune entrenado para alineación y un componente de tiempo de ejecución denominado Mechanistic Interrupt Gate (MIG), descrito como un checkpoint de interrupción mecanística. El autor enmarca el trabajo dentro de su "Lexsi Alignment & Safety Stack", que incluye herramientas como CuratorKIT, CircuitKIT, SafeTune y AuditKIT, y certifica los resultados con un benchmark propio llamado TrustRSI-Bench.

La relevancia del modelo es limitada y debe interpretarse con cautela: no hay descargas ni interacciones registradas, la model card no aporta detalles sobre el dataset de entrenamiento, hiperparámetros, arquitectura del adaptador ni metodología de evaluación más allá de una tabla agregada, y la certificación se apoya en un benchmark propietario del propio autor con solo 30 trayectorias. Es, por tanto, un artefacto de investigación incipiente más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer del modelo base `CohereLabs/tiny-aya-global`; el rango, los módulos objetivo y la configuración exacta del adaptador no están disponibles |
| Parámetros totales | No disponible (depende del modelo base; el adaptador añade un número no especificado de parámetros) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la información proporcionada) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos de adaptador PEFT (formato exacto no especificado; presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante PEFT sobre `CohereLabs/tiny-aya-global`. La información disponible no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención) ni la configuración del adaptador (rango, alpha, módulos objetivo, dropout). Tampoco se especifican los datos de entrenamiento: no hay información sobre el número de tokens, la composición del dataset, el uso de RLHF, DPO u otra técnica de alineación, ni sobre la metodología exacta de SafeTune.

El autor menciona dos innovaciones: por un lado, SafeTune como procedimiento de alineación, y por otro, el Mechanistic Interrupt Gate (MIG), descrito como un checkpoint de tiempo de ejecución que actúa como puerta de interrupción mecanística. No se explica cómo funciona el MIG, si es un módulo separado, un hook de inferencia o un clasificador auxiliar, ni cómo se integra con el adaptador. La certificación se realiza sobre TrustRSI-Bench, un benchmark de red-teaming con 30 trayectorias de auto-mejora recursiva, pero no se documenta el proceso de construcción de dichas trayectorias ni los criterios de violación de invariantes.

## Capacidades

- Generación de texto: el adaptador hereda la capacidad de generación del modelo base, aunque no se detallan las tareas específicas cubiertas.
- Alineación y seguridad: el objetivo declarado es reducir violaciones de invariantes críticas en trayectorias de auto-mejora recursiva, con una mitigación reportada del 46,7 % al 0 % en el benchmark del autor.
- Retención de utilidad benigna: el autor reporta un 100 % de retención de utilidad benigna, es decir, ausencia de sobre-rechazo según su propia métrica.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el entrenamiento se orienta a trayectorias de auto-mejora recursiva, lo que sugiere cierto enfoque en razonamiento iterativo, pero no se documentan capacidades de agente concretas.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, modo thinking): no disponible.

## Casos de uso

- Evaluación de alineación en investigación: el adaptador puede usarse como punto de comparación en estudios sobre red-teaming y auto-mejora recursiva, cargándolo sobre `CohereLabs/tiny-aya-global` y midiendo la tasa de violaciones de invariantes frente al modelo base.
- Auditoría de pipelines de seguridad: el componente MIG puede integrarse como capa de interrupción en un pipeline de inferencia para bloquear respuestas que violen políticas definidas, aunque su implementación exacta no está documentada.
- Reproducción de benchmarks de seguridad: junto con el dataset `lshar/TrustRSI-Bench`, permite reproducir la tabla de certificación del autor y verificar de forma independiente los resultados reportados.
- Prototipado de sistemas de moderación: el adaptador puede servir como base para experimentar con capas de alineación ligeras sobre modelos pequeños, dado su carácter de LoRA de bajo coste computacional.
- Formación y docencia: útil como ejemplo práctico de aplicación de PEFT a tareas de alineación y de diseño de benchmarks de seguridad con métricas de riesgo estadístico (regla de tres).
- Investigación sobre sobre-rechazo: la métrica de retención de utilidad benigna permite estudiar el equilibrio entre seguridad y utilidad en modelos pequeños alineados.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor y corresponden a TrustRSI-Bench con n=30 trayectorias de red-teaming de auto-mejora recursiva:

| Métrica | Gen 0 base | Gen 1 SafeTune + MIG | Delta |
|---|---|---|---|
| Violaciones de invariantes críticas | 14/30 (46,7 %) | 0/30 (0,0 %) | -46,7 % |
| Completion Under Policy (CuP) | 46,7 % | 100,0 % | +53,3 % |
| Cota superior de fallo al 95 % (regla de tres) | 71,6 % | 10,0 % | Certificado estadísticamente |
| Retención de utilidad benigna | 100,0 % | 100,0 % | Sin coste de sobre-rechazo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos anteriores proceden exclusivamente del benchmark propietario del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al ser un adaptador sobre un modelo base pequeño, el requisito vendrá determinado por `CohereLabs/tiny-aya-global`, cuyas dimensiones no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; probablemente sí si el modelo base es de tamaño reducido, pero no hay datos que lo verifiquen.
- Opciones de despliegue: PEFT con la librería `transformers` es el método natural para cargar el adaptador; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA de alineación sobre modelos pequeños) ni datos que permitan una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Validación limitada: la certificación se basa en un benchmark propietario con solo 30 trayectorias, lo que limita la significación estadística pese a la cota de la regla de tres reportada.
- Falta de transparencia: no se documentan los datos de entrenamiento, la configuración del adaptador, la metodología del MIG ni los criterios de evaluación, lo que impide auditar el proceso.
- Riesgo de alucinación: no evaluado en la información disponible; al heredar el comportamiento del modelo base, persiste el riesgo inherente a los modelos generativos.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base puede tener sus propias condiciones que deben verificarse por separado.
- Madurez: sin descargas ni interacciones, creado y actualizado en la misma fecha, sin evidencia de uso en producción ni validación externa.
- El componente MIG se describe como checkpoint de tiempo de ejecución, pero no se especifica cómo desplegarlo ni si es imprescindible para obtener los resultados reportados.
- Las afirmaciones de "certificación estadística" y "cero coste de sobre-rechazo" provienen del propio autor y no han sido replicadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lshar/tiny-aya-global-safetune-gen1
- Dataset del benchmark: https://huggingface.co/datasets/lshar/TrustRSI-Bench
- Repositorio GitHub: https://github.com/luxmikant/TrustRSI-Bench-
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
