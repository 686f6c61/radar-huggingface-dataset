# frankmorales2020/evo2-topo-governed

## Resumen

EVO2-TOPO-Governed es un modelo de lenguaje genómico derivado de Evo2 7B, desarrollado por frankmorales2020, que incorpora el framework **Topological Governor (TOPO)** para mitigar el olvido catastrófico en aprendizaje multitarea. El modelo se ha afinado sobre 13 tareas genómicas utilizando secuencias reales del genoma humano (hg38), alcanzando un 100 % de precisión en la tarea de modelado de lenguaje genómico (perplejidad) y un olvido global del 1,32 %. Su relevancia radica en proponer una estrategia de gobernanza topológica que fija anclas en índices primos durante la retropropagación, lo que permite preservar el conocimiento previo mientras se aprenden nuevas tareas.

La arquitectura base es Evo2 7B, un modelo de lenguaje de ADN de 7.000 millones de parámetros con contexto de hasta 1 millón de pares de bases, basado en la arquitectura StripedHyena 2. En esta versión afinada, los pesos se cuantizan a NF4 (4 bits) y se añaden cabezas de clasificación específicas para cada tarea. El modelo se distribuye bajo licencia MIT y está pensado para aplicaciones de bioinformática y genómica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StripedHyena 2 (Evo2 7B) |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.000.000 pares de bases (base); 2.048 pb en el afinamiento |
| Tipos de cuantizacion | NF4 (4 bits) |
| Idiomas soportados | en (secuencias de ADN) |
| Licencia | MIT |
| Formato de pesos | .pt (state_dict) |

## Arquitectura y entrenamiento

El modelo parte de Evo2 7B, un transformer híbrido con capas de atención y convoluciones (StripedHyena 2) entrenado sobre genomas de todos los dominios de la vida. Sobre esta base, el framework TOPO introduce un mecanismo de gobernanza: durante el entrenamiento, los gradientes correspondientes a los índices primos (2, 3, 5, 7, 11, 13) se ponen a cero en la capa límite 28, y posteriormente se restauran los valores originales de esos anclajes. Esto actúa como un regularizador topológico que evita la deriva de los parámetros críticos.

El entrenamiento se realizó con 13 tareas genómicas supervisadas (predicción de promotores, detección de splicing, clasificación de enhancers, etc.) usando secuencias reales de hg38 de los cromosomas 1, 2, 3, X e Y, con una longitud máxima de 2048 pb. Se empleó el optimizador AdamW, un grid de tasas de aprendizaje de 1e-6 a 1e-4, y early stopping con paciencia 2. Todas las capas lineales se cuantizaron a NF4. El mejor resultado se obtuvo con LR=0.0001 en la ejecución 5 de 5.

## Capacidades

- Predicción de fuerza de promotores a partir de secuencias de ADN.
- Detección de sitios de splicing (donante y aceptor).
- Clasificación de regiones enhancer.
- Predicción de sitios de unión de factores de transcripción.
- Evaluación de estabilidad de estructuras secundarias de ARN.
- Identificación de islas CpG (marcadores de metilación).
- Predicción de sitios de poliadenilación.
- Clasificación de accesibilidad de cromatina.
- Puntuación de efectos de variantes genéticas.
- Reconocimiento de dianas de microARN.
- Perfilado de sitios de unión ribosómica.
- Estimación de eficiencia de terminadores.
- Modelado de lenguaje genómico (perplejidad de siguiente token).

## Casos de uso

- **Anotación funcional de genomas**: el modelo puede predecir elementos reguladores (promotores, enhancers, sitios de splicing) en nuevas secuencias, acelerando la anotación de genomas no caracterizados.
- **Priorización de variantes clínicas**: la tarea 9 (variant effect scoring) permite filtrar variantes de significado incierto en estudios de asociación genética, reduciendo el espacio de búsqueda para diagnóstico.
- **Diseño de secuencias sintéticas**: gracias a su capacidad de modelado de lenguaje, puede generar o modificar secuencias de ADN con propiedades deseadas, útil en biología sintética.
- **Análisis de regulación epigenética**: las tareas de islas CpG y accesibilidad de cromatina ayudan a interpretar datos de metilación y ATAC-seq.
- **Identificación de dianas terapéuticas**: la predicción de unión de factores de transcripción y microARN puede señalar genes implicados en enfermedades.
- **Optimización de vectores de expresión**: la predicción de eficiencia de terminadores y sitios de unión ribosómica permite diseñar plásmidos con mayor rendimiento de expresión.

## Benchmarks y rendimiento

Según la model card del autor, en la ejecución 5 (mejor modelo, LR=0.0001) se obtuvieron los siguientes resultados:

| Tarea | Precisión final | Precisión máxima | Olvido |
|---|---|---|---|
| 1. Promoter Strength | 99,86 % | 100,00 % | 0,14 % |
| 2. Splice Site Detection | 97,20 % | 100,00 % | 2,80 % |
| 3. Enhancer Activity | 96,99 % | 99,45 % | 2,46 % |
| 4. TF Binding | 95,89 % | 97,64 % | 1,75 % |
| 5. RNA Structure Stability | 95,99 % | 97,92 % | 1,93 % |
| 6. CpG Island | 98,60 % | 100,00 % | 1,40 % |
| 7. Polyadenylation | 96,26 % | 98,55 % | 2,29 % |
| 8. Chromatin Accessibility | 97,64 % | 100,00 % | 2,36 % |
| 9. Variant Effect | 98,20 % | 100,00 % | 1,80 % |
| 10. miRNA Target | 99,83 % | 100,00 % | 0,17 % |
| 11. RBS Profiling | 100,00 % | 100,00 % | 0,00 % |
| 12. Terminator Efficiency | 100,00 % | 100,00 % | 0,00 % |
| 13. Genomic LM PPL | 100,00 % | 100,00 % | 0,00 % |

**Olvido global: 1,32 %**

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: con cuantización NF4, los pesos del modelo ocupan aproximadamente 4-5 GB. Sumando activaciones y overhead, se recomienda al menos 8 GB de VRAM para inferencia con secuencias de 2048 pb.
- **GPU recomendadas**: RTX 3090, RTX 4090, A10, A100 (para mayor velocidad). En GPUs con menos de 8 GB puede ser necesario reducir la longitud de secuencia o usar offloading.
- **Compatibilidad con consumer GPU**: sí, una RTX 3060 de 12 GB o superior puede ejecutar el modelo en NF4.
- **Opciones de despliegue**: al ser un modelo de Evo2, se puede cargar con la librería `evo2` y PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama; se recomienda usar el script de inferencia proporcionado en la model card.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos genómicos afinados (p. ej., Nucleotide Transformer, DNABERT-2). Como referencia, el modelo base Evo2 7B tiene la misma arquitectura y contexto, pero sin el afinamiento TOPO ni las cabezas de tarea específicas. La licencia MIT de este modelo es más permisiva que la de Evo2 original (que usa una licencia de investigación), lo que facilita su uso comercial.

## Limitaciones y advertencias

- **Sesgos conocidos**: el entrenamiento se realizó únicamente con secuencias de hg38 (cromosomas 1, 2, 3, X e Y), por lo que puede no generalizar bien a otras especies o regiones genómicas no representadas.
- **Riesgo de alucinación**: como modelo de lenguaje, puede generar secuencias plausibles pero no funcionales; las predicciones deben validarse experimentalmente.
- **Limitaciones de contexto**: aunque la arquitectura base soporta 1M pb, el afinamiento se hizo con ventanas de 2048 pb, por lo que el modelo puede no aprovechar contextos más largos de forma óptima.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero el modelo base Evo2 tiene su propia licencia (Arc Institute) que puede imponer condiciones adicionales; se recomienda revisar ambas.
- **Caveat de producción**: los resultados de precisión provienen de la model card del autor y no han sido verificados de forma independiente. Además, el código de inferencia requiere un parche para PyTorch 2.6+ (`weights_only=False`), lo que puede suponer un riesgo de seguridad si se cargan pesos no confiables.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/frankmorales2020/evo2-topo-governed)
- [Repositorio similar: governed-evo2-7b-topo](https://huggingface.co/frankmorales2020/governed-evo2-7b-topo)
- [Repositorio similar: topo-2026-evo2-certified](https://huggingface.co/frankmorales2020/topo-2026-evo2-certified)
- [Artículo en LinkedIn sobre TOPO](https://www.linkedin.com/pulse/architecting-permanence-topological-governance-evo-2-frank-q5tmc)
- [Repositorio oficial de Evo2 (Arc Institute)](https://github.com/arcinstitute/evo2)
- [Repositorio del autor (MLxDL)](https://github.com/frank-morales2020/MLxDL)
