# Aryama/anlp-a3-part2-v3-exploratory

## Resumen

`Aryama/anlp-a3-part2-v3-exploratory` es un repositorio de artefactos experimentales de PyTorch que contiene 45 checkpoints de clasificación de grafos orientados a la detección de noticias falsas (fake news detection) sobre los splits de UPFD GossipCop. No se trata de un modelo de lenguaje generativo, sino de un conjunto de modelos GNN (graph neural networks) entrenados como parte de una asignatura de ANLP (Advanced Natural Language Processing), con configuraciones asociadas y un manifiesto de experimento congelado.

El repositorio incluye implementaciones propias, entre ellas una variante de BiGCN que sigue a Chen et al. (arXiv:2101.05519), y se apoya en scripts de shell (`scripts/part2/test_gnn.sh`) del repositorio fuente para regenerar las tablas comparativas. La model card advierte explícitamente de que los resultados de test originales ya fueron observados antes de una fase de optimización exploratoria posterior, por lo que el test set no constituye una prueba confirmatoria intacta.

Por su naturaleza, el interés de este repositorio es educativo y reproducible: sirve como material de referencia para estudiar pipelines de clasificación de grafos aplicados a la detección de desinformación, no como un modelo listo para producción. El tamaño del repositorio es de 0.0 GB según Hugging Face y no consta licencia declarada ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph neural networks en PyTorch (incluye variante BiGCN segun Chen et al., arXiv:2101.05519) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje con ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints de PyTorch (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio agrupa 45 checkpoints seleccionados por mejor macro-F1 de validación, junto con sus configuraciones y un manifiesto de experimento congelado. La arquitectura base son redes neuronales de grafos implementadas en PyTorch para clasificación de grafos, con una variante BiGCN que sigue el trabajo de Chen et al. (arXiv:2101.05519). El entrenamiento se realizó sobre los splits de UPFD GossipCop proporcionados en el contexto de la asignatura.

La model card documenta dos hashes SHA256 de trazabilidad: el del código fuente de entrenamiento (`ab04b42c...`) y el del manifiesto congelado (`ffc220aa...`). Además, se indica un protocolo de optimización con hash propio (`96b84453...`). Es relevante que la fase de optimización exploratoria posterior al test se seleccionó únicamente con datos de entrenamiento y validación, si bien los resultados de test originales ya se habían observado con anterioridad. Se conserva una línea base en una revisión concreta del repositorio `Aryama/anlp-a3-part2`.

## Capacidades

- Clasificación de grafos aplicada a detección de noticias falsas sobre el dataset UPFD GossipCop.
- Entrenamiento y evaluación de variantes GNN, incluida BiGCN, con selección de checkpoints por macro-F1 de validación.
- Reproducción de tablas comparativas mediante scripts de shell del repositorio fuente.
- Trazabilidad de experimentos mediante hashes SHA256 de código, manifiesto y protocolo de optimización.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo, al no ser un modelo de lenguaje.

## Casos de uso

- Estudio académico de detección de desinformación: el repositorio permite reproducir experimentos de clasificación de grafos sobre UPFD GossipCop y comparar variantes GNN con una línea base congelada.
- Reproducibilidad de resultados: los hashes de código fuente y manifiesto permiten verificar que un experimento se ejecutó con exactamente los mismos artefactos.
- Docencia en ANLP: sirve como ejemplo práctico de pipeline completo (entrenamiento, selección por validación, evaluación y regeneración de tablas) para alumnado de posgrado.
- Análisis de propagación de noticias: los modelos de clasificación sobre grafos de difusión permiten estudiar cómo la estructura de propagación informa la veracidad de una noticia.
- Comparación de arquitecturas GNN: los 45 checkpoints y sus configuraciones permiten analizar el efecto de hiperparámetros sobre macro-F1 de validación.
- Auditoría metodológica: la advertencia sobre la observación previa del test y la separación entre selección exploratoria y confirmatoria constituye un caso de estudio sobre buenas prácticas en evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona tablas comparativas regenerables mediante `scripts/part2/test_gnn.sh`, pero no incluye cifras concretas de macro-F1 ni de otras métricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de GNN sobre grafos de tamaño moderado (UPFD GossipCop), la inferencia suele ser ligera, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; probablemente viable en GPU de consumo para este tipo de GNN, pero sin datos confirmados en la información proporcionada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el flujo previsto es ejecutar los scripts de test del repositorio fuente con PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aryama/anlp-a3-part2-v3-exploratory | GNN para clasificación de grafos (fake news) | no disponible | no aplica | no disponible | Hugging Face (repo educativo) |
| Aryama/anlp-a3-part2 (baseline preservada) | GNN, misma tarea | no disponible | no aplica | no disponible | Hugging Face (revisión concreta) |
| BiGCN (Chen et al., arXiv:2101.05519) | GNN de referencia citada | no disponible | no aplica | según paper original | Implementación de referencia en paper |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Artefactos educativos: la propia model card los describe como resultados de experimentos docentes, no como modelos validados para producción.
- Evaluación no confirmatoria: los resultados de test originales ya se habían observado antes de la optimización exploratoria; el test set no es una prueba confirmatoria intacta.
- Licencia no declarada: no consta licencia del repositorio, lo que impide asumir permisos de uso comercial.
- Licencias de terceros: el dataset UPFD GossipCop y los papers citados conservan sus propias licencias, que deben respetarse por separado.
- Ámbito restringido: el modelo solo aborda clasificación de grafos para detección de noticias falsas; no ofrece generación, razonamiento general ni capacidades multilingües.
- Riesgo de sobreajuste a un único dataset: el entrenamiento se limita a los splits de UPFD GossipCop, sin evidencia de generalización a otros dominios.
- Sin métricas publicadas: la ausencia de cifras en la model card dificulta evaluar su rendimiento sin ejecutar los scripts de reproducción.
- Sesgos: no se documentan análisis de sesgo; en detección de desinformación, los sesgos del dataset de origen pueden propagarse al clasificador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Aryama/anlp-a3-part2-v3-exploratory
- Línea base preservada: https://huggingface.co/Aryama/anlp-a3-part2/tree/8675249c5ba8c86f208803d3e7f77435b5423f27
- Perfil del autor: https://huggingface.co/Aryama
- Modelos etiquetados con anlp-a3: https://huggingface.co/models?other=anlp-a3
- Paper de referencia BiGCN: https://arxiv.org/abs/2101.05519
