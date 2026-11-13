# BH-Language-AI/bh-decision-1-4b

## Resumen

BH-Decision-1-4B es un modelo de generación de texto anunciado por BH-Language-AI, orientado a la toma de decisiones (decision-making) y centrado en el idioma bosnio (código `bs`). Según su propia model card, el modelo se encuentra en estado "NIJE TRENIRAN" (no entrenado): las ponderaciones no existen y la ficha publicada es una tarjeta de proyecto, no un artefacto desplegable. La generación indicada es la 1 y el tamaño nominal es de 4B parámetros, dentro de una nomenclatura `bh-decision-{generacion}-{tamano}` que el autor describe como esquema aprobado v3.

El proyecto se atribuye a una colaboración entre "Kolektiv" y "Gamatrade", y menciona una colección denominada BH-Decision con referencias de "FAZE 1" (fase 1) y modelos "učitelji/baseline" (profesores/línea base). La base objetivo del entrenamiento figura como "TBD" (por determinar) y se aclara explícitamente que `Tacit-4B` es solo un benchmark experimental y no el fundamento del modelo.

La relevancia actual es limitada desde el punto de vista práctico: no hay pesos, no hay resultados de evaluación y no hay datos de entrenamiento publicados. Su interés es documental, como declaración de intenciones de un proyecto de modelado en bosnio con enfoque en decisiones, y como referencia de nomenclatura y gobernanza de publicación (las ponderaciones se liberarán solo tras un entrenamiento aprobado y una evaluación verificada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica transformer, MoE ni otra familia) |
| Parametros totales | 4B (nominal, según el nombre del modelo; no hay pesos publicados) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bosnio (`bs`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (las ponderaciones no existen según la model card) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card no indica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida o cualquier otra variante. Tampoco se especifican el número de capas, la dimensionalidad del embedding, el mecanismo de atención ni la longitud de contexto objetivo.

Respecto al entrenamiento, la tarjeta indica que el modelo no ha sido entrenado ("NIJE TRENIRAN") y que la base objetivo está por determinar ("TBD"). Se menciona una colección BH-Decision con referencias de fase 1 y modelos profesores o líneas base, lo que sugiere una posible estrategia de destilación o de comparación contra baselines, pero no se aportan detalles sobre el volumen de tokens, la composición del dataset, el uso de RLHF/DPO ni ninguna innovación técnica concreta. La publicación de pesos queda condicionada a un entrenamiento aprobado y a una evaluación verificada.

## Capacidades

- Generación de texto: la pipeline declarada es `text-generation`, aunque no hay pesos que permitan verificarla.
- Toma de decisiones: la etiqueta `decision-making` indica el dominio previsto, sin especificación de tareas concretas.
- Multilingüismo: limitado al bosnio (`bs`) según el campo `language`; no se declaran otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere intención de despliegue vía Inference Endpoints, pero sin pesos no es operativo.

## Casos de uso

- Evaluación de viabilidad de proyectos en bosnio: el modelo se podría emplear, una vez entrenado, para clasificar o recomendar decisiones en flujos de negocio en lengua bosnia; actualmente no es posible porque no hay pesos.
- Investigación sobre modelado en lenguas de bajos recursos: sirve como referencia de esquema de nomenclatura y de gobernanza de publicación para equipos que trabajen con bosnio.
- Benchmark de comparación contra líneas base: la mención a `Tacit-4B` como benchmark experimental permite plantear experimentos comparativos, aunque el modelo en sí no está disponible.
- Destilación desde modelos profesores: la referencia a "učitelji" (profesores) sugiere un caso de uso futuro de destilación hacia un modelo de 4B especializado en decisiones.
- Documentación de políticas de liberación: la tarjeta ejemplifica un flujo de publicación condicionada a entrenamiento aprobado y evaluación verificada, útil como plantilla de gobernanza.
- Integración en pipelines de generación de texto vía `transformers`: prevista por la librería declarada, pero no ejecutable hasta que existan ponderaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no existir pesos, no se puede calcular. Como referencia teórica para un modelo denso de 4B, la inferencia en FP16 requeriría del orden de 8 GB de VRAM solo para pesos, y en cuantización de 4 bits del orden de 2-3 GB, pero estos valores no están confirmados por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no verificable sin pesos.
- Opciones de despliegue: la librería declarada es `transformers` y la etiqueta `endpoints_compatible` apunta a Inference Endpoints; no se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-Decision-1-4B | 4B (nominal) | no disponible | bs | Apache 2.0 | Sin pesos publicados |
| Tacit-4B | 4B (según denominación) | no disponible | no disponible | no disponible | Citado como benchmark experimental, sin datos adicionales |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría. La única referencia interna es `Tacit-4B`, descrito por el autor como benchmark experimental y no como base del modelo.

## Limitaciones y advertencias

- El modelo no está entrenado: la model card indica explícitamente "NIJE TRENIRAN" y que las ponderaciones no existen. No es desplegable ni evaluable.
- No hay datos de arquitectura, contexto, tokenizador ni dataset; cualquier uso en producción es inviable en el estado actual.
- Riesgo de alucinación: no evaluable al no existir pesos ni evaluaciones publicadas.
- Sesgos conocidos: no disponible; no se han documentado análisis de sesgo.
- Limitación de idioma: cobertura declarada únicamente del bosnio (`bs`), sin evidencia de robustez multilingüe.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al no haber pesos publicados la licencia no tiene efecto práctico todavía.
- Gobernanza: la publicación de pesos está condicionada a un entrenamiento aprobado y a una evaluación verificada, por lo que la disponibilidad futura no está garantizada.
- Fecha de creación y actualización muy próximas (13 de noviembre de 2026), lo que sugiere una tarjeta preliminar sin desarrollo posterior documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bh-decision-1-4b
- Perfil del autor: https://huggingface.co/BH-Language-AI
- Referencia interna a `Tacit-4B`: no disponible (mencionado en la model card sin enlace)
- Paper, blog, repositorio o demo: no disponible
