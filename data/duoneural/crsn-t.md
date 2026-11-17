# DuoNeural/CRSN-T

## Resumen

CRSN-T (Thermodynamic Crystal Recurrent Sheaf Network) es un modelo de lenguaje recurrente desarrollado por DuoNeural Lab, presentado como la tercera generación de la familia Crystal Recurrent Sheaf Network (CRSN). Extiende la fase 2 del linaje incorporando un término de acoplamiento termodinámico: cada capa mantiene un estado térmico aprendible (temperatura `T`, flujo de calor `Q` y producción de entropía `ξ_S`) junto al parámetro de orden cristalino `α`, siguiendo una estructura simplificada GENERIC (General Equation for Non-Equilibrium Reversible-Irreversible Coupling).

El modelo no sigue la arquitectura transformer convencional, sino un esquema recurrente con dinámica de cristal, y se ha entrenado exclusivamente sobre WikiText-103 (126,9 millones de tokens) durante 25.000 pasos en CPU (nodo AMD Ryzen). Su relevancia es fundamentalmente de investigación: explora si la oscilación térmica durante el entrenamiento actúa como regularización implícita sin romper el orden cristalino, y si la degeneración GENERIC constituye un sesgo inductivo beneficioso para el modelado de lenguaje recurrente.

El resultado reportado es una perplejidad de validación de 13,33 (loss 2,5900), frente a 13,5 de la fase 2 y 14,17 de la fase 1. Se trata de un modelo de escala reducida y propósito experimental, no de un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Crystal Recurrent Sheaf Network (CRSN) con acoplamiento termodinámico; 8 capas; recurrente, no transformer |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio PyTorch, 0,1 GB) |

## Arquitectura y entrenamiento

CRSN-T se construye sobre la Crystal Recurrent Sheaf Network de 8 capas. La innovación de esta versión es la incorporación de un estado termodinámico por capa (temperatura `T`, flujo de calor `Q`, producción de entropía `ξ_S`) que modula el gating de `α` en función de la temperatura. Según la model card, la oscilación térmica durante el entrenamiento es esperada y saludable: `T` oscila en torno a 0,062 mientras `α` se mantiene estable en 0,0506, y el estado cristalino final presenta `α` estrictamente positivo en las 8 capas (rango 0,1276–0,1324), idéntico al de la fase 2.

El entrenamiento se realizó sobre WikiText-103 (126,9 millones de tokens) durante 25.000 pasos en CPU (nodo AMD Ryzen), seleccionando el mejor checkpoint por pérdida de validación. No se documentan en la información disponible detalles sobre composición del dataset más allá de WikiText-103, ni sobre fases de RLHF o DPO.

## Capacidades

- Generación de texto y modelado de lenguaje autorregresivo en inglés.
- Razonamiento de secuencia mediante arquitectura recurrente con estado de cristal.
- Capacidad experimental de regularización implícita vía acoplamiento termodinámico (hallazgo de investigación, no una capacidad de producto).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en arquitecturas recurrentes alternativas a transformers: el modelo sirve como banco de pruebas reproducible (CPU, WikiText-103) para estudiar si el acoplamiento termodinámico mejora la perplejidad sin degradar el orden cristalino.
- Estudio de regularización implícita: comparar la curva de pérdida de CRSN-T frente a las fases 1 y 2 para aislar el efecto del término GENERIC en la generalización.
- Experimentos de dinámica de estado interno: los valores de `α` y `ω` por capa publicados en el checkpoint permiten analizar la estabilidad del estado cristalino durante el entrenamiento y la inferencia.
- Docencia y divulgación sobre modelos generativos no transformer: su tamaño reducido (repositorio de 0,1 GB) y entrenamiento en CPU lo hacen apto para demostraciones y réplicas académicas.
- Base para ablaciones controladas: punto de partida para variar la temperatura, el flujo de calor o la producción de entropía y medir su impacto en la perplejidad.
- Prototipado de modelado de lenguaje a pequeña escala en inglés: útil para validar pipelines de entrenamiento y evaluación sobre WikiText-103 antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Modelo | Val loss | Perplejidad (PPL) |
|---|---|---|
| CRSN Phase 1 | 2,6508 | 14,17 |
| CRSN Phase 2 | 2,6058 | 13,50 |
| CRSN-T (este) | 2,5900 | 13,33 |

Datos sobre WikiText-103, mejor checkpoint por pérdida de validación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, lo que sugiere un modelo de escala muy reducida que cabría holgadamente en cualquier GPU consumer.
- GPU recomendadas: no disponibles; el entrenamiento se realizó en CPU (AMD Ryzen), por lo que la inferencia en CPU es viable.
- Cabe en GPU consumer: presumiblemente sí, dado el tamaño del repositorio, aunque no se especifican requisitos oficiales.
- Opciones de despliegue: PyTorch (librería declarada); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | PPL (WikiText-103) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CRSN-T | CRSN recurrente + término termodinámico, 8 capas | no disponible | 13,33 | MIT | Hugging Face (DuoNeural/CRSN-T) |
| CRSN Phase 2 | CRSN recurrente, 8 capas | no disponible | 13,50 | MIT (según linaje) | Hugging Face (DuoNeural/CRSN-Phase2) |
| CRSN Phase 1 | CRSN recurrente | no disponible | 14,17 | MIT (según linaje) | no disponible |

No se dispone de comparación con modelos transformer de referencia en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación a escala muy reducida (entrenado en CPU, 25.000 pasos sobre WikiText-103); no apto para uso en producción general.
- Solo soporta inglés según los metadatos; sin capacidades multilingües documentadas.
- Riesgo de alucinación no evaluado; no se han publicado benchmarks de fiabilidad.
- Sesgos conocidos: no documentados, pero al entrenarse únicamente sobre WikiText-103 hereda los sesgos de ese corpus (texto enciclopédico de Wikipedia).
- Longitud de contexto no especificada; se desconoce su comportamiento en secuencias largas.
- Sin soporte documentado de tool calling, agentes ni cuantización; el ecosistema de despliegue es limitado (solo PyTorch).
- Licencia MIT permite uso comercial, pero la madurez y validación del modelo desaconsejan su uso en entornos productivos sin evaluación adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/CRSN-T
- Modelo predecesor (CRSN Phase 2): https://huggingface.co/DuoNeural/CRSN-Phase2
- Repositorio de la serie RMSN: https://github.com/DuoNeural/RMSN
- Contacto del autor: archon@agentmail.to
