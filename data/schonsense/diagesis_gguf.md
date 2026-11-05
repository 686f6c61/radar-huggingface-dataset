# schonsense/diagesis_GGUF

## Resumen

Diagesis es un modelo de lenguaje de gran escala (70.553.706.560 parámetros, aproximadamente 70,5 mil millones) desarrollado por el usuario schonsense, especializado en roleplay conversacional de formato largo y en el rol de Dungeon Master (master de juego) para partidas de rol de mesa. El modelo se distribuye principalmente como cuantizaciones GGUF generadas con imatrix a partir del modelo base `schonsense/Diagesis`, lo que lo hace desplegable en entornos de inferencia local mediante llama.cpp y compatibles.

La relevancia del modelo radica en su enfoque declarado hacia narrativa adulta, temas oscuros y coherencia espacial interna (lo que el autor denomina "INTERNAL KNOWLEDGE MAP"), un requisito poco común en modelos conversacionales genéricos. El autor especifica que el modelo requiere el uso de un system prompt concreto o muy similar para funcionar correctamente, lo que indica un ajuste fino orientado a un formato de interacción muy específico.

La información pública disponible es limitada: no se han publicado datos sobre arquitectura interna, composición del dataset de entrenamiento, licencia ni idiomas soportados. El tamaño del repositorio (256,8 GB) y el número de descargas (139) sugieren un modelo de nicho con distribución fundamentalmente en formato cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `schonsense/Diagesis`; presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 70.553.706.560 (≈70,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (el repositorio incluye cuantizaciones; niveles concretos no disponibles) |
| Idiomas soportados | no disponible (la model card está en inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); pesos originales del modelo base no disponibles en este repo |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la información disponible. El recuento de parámetros (70,5 B) y la existencia de cuantizaciones GGUF con imatrix son compatibles con un transformer denso de gran tamaño, pero no se confirma si emplea mezcla de expertos, atención lineal u otras variantes. El modelo base es `schonsense/Diagesis`, del que no se detallan capas, dimensión oculta ni número de cabezas de atención.

Tampoco se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente describe el comportamiento esperado mediante un system prompt obligatorio orientado a rol de Dungeon Master, lo que sugiere un ajuste fino supervisado sobre diálogo narrativo, sin que se confirme la metodología. Las cuantizaciones incluidas en este repositorio se han generado con imatrix, una técnica que calibra los pesos de cuantización con datos representativos para preservar mejor la calidad en precisiones bajas.

## Capacidades

- Generación de texto narrativo de formato largo en inglés, orientada a roleplay conversacional multi-turno.
- Interpretación del rol de Dungeon Master: arbitraje de consecuencias, introducción de personajes y tramas, y descripción de escenarios.
- Coherencia espacial y física declarada mediante el concepto de "INTERNAL KNOWLEDGE MAP" descrito en el system prompt.
- Exploración de temas adultos, realismo crudo y decisiones morales complejas sin filtrado declarado por parte del autor.
- Revelación de pensamientos y emociones de personajes no jugadores a través de acciones, diálogo y expresiones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Partidas de rol de mesa asistidas por IA: el modelo actúa como Dungeon Master que arbitra decisiones, describe escenarios y mantiene continuidad narrativa a lo largo de sesiones multi-turno, gracias a su ajuste específico sobre el system prompt de master.
- Escritura narrativa colaborativa de formato largo: útil para autores que necesitan un motor de continuación coherente con un mundo previamente definido, manteniendo consistencia espacial y de consecuencias entre capítulos.
- Simulaciones de narrativa interactiva en videojuegos: puede integrarse como motor de diálogo dinámico para NPCs y tramas ramificadas, donde las decisiones del jugador alteran el estado del mundo de forma persistente.
- Generación de escenarios y campañas de rol: el modelo puede producir descripciones de localizaciones, PNJ y conflictos morales complejos que el autor humano refina después, aprovechando su orientación a temas adultos y realismo crudo.
- Prototipado de experiencias conversacionales de nicho: desarrolladores que investigan roleplay sin filtros pueden evaluar el comportamiento del modelo con el system prompt recomendado antes de integrarlo en productos.
- Investigación sobre coherencia narrativa: el concepto de "INTERNAL KNOWLEDGE MAP" declarado por el autor lo convierte en un caso de estudio para medir consistencia espacial y causal en generación de formato largo.
- Despliegue local en estaciones de trabajo con GPU de gran VRAM: las cuantizaciones GGUF con imatrix permiten ejecutar el modelo en hardware de consumo de gama alta o en servidores, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de ~70,5 B, las estimaciones habituales por cuantización serían aproximadamente 40-45 GB en Q4, 50-55 GB en Q5 y 65-75 GB en Q8, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, serían necesarias GPU con 48-80 GB de VRAM (A100 80 GB, H100, A6000) para cuantizaciones altas, o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de este tamaño no cabe en una única RTX 4090 (24 GB) ni siquiera en cuantizaciones bajas, salvo con offloading parcial a CPU/RAM.
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF (Ollama, LM Studio, llama-cpp-python); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detalla cuáles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (roleplay de formato largo con ~70 B de parámetros) ni datos de rendimiento que permitan una comparación fundamentada.

## Limitaciones y advertencias

- Requiere obligatoriamente un system prompt específico (o muy similar) para funcionar según lo previsto; sin él, el comportamiento puede degradarse.
- Contenido explícitamente orientado a temas adultos, realismo crudo y decisiones morales complejas; no es adecuado para aplicaciones dirigidas a menores ni para entornos con políticas de contenido restrictivas.
- Riesgo de alucinación: no evaluado; no se han publicado métricas de fidelidad ni de consistencia a largo plazo.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue en producción.
- Idiomas soportados no documentados; la model card está en inglés y el system prompt está en inglés, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no documentada; no se puede garantizar la coherencia en sesiones muy largas.
- Modelo de nicho con muy pocas descargas (139) y sin likes; no hay evidencia comunitaria de calidad ni de estabilidad.
- El repositorio contiene únicamente cuantizaciones GGUF (256,8 GB); los pesos originales en safetensors deben obtenerse del modelo base `schonsense/Diagesis`.
- No se documentan sesgos conocidos, pero al ser un modelo ajustado para narrativa adulta sin filtrado declarado, es probable que reproduzca sesgos de sus datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/schonsense/diagesis_GGUF
- Modelo base: https://huggingface.co/schonsense/Diagesis
