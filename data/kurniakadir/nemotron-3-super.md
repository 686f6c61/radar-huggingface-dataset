# KurniaKadir/nemotron-3-super

## Resumen

Nemotron-3 Legal Agentic Bundle es un paquete de dos modelos publicado por el usuario KurniaKadir en Hugging Face, orientado a flujos de trabajo de agentes legales autónomos en el Sudeste Asiático y la Gran China. El bundle combina un modelo grande de razonamiento, `NVIDIA-Nemotron-3-Super-120B-A12B` en cuantización MLX de 6 bits (aproximadamente 120 000 millones de parámetros totales con 12 000 millones activos, según la nomenclatura del modelo base), con un modelo pequeño y rápido, `NVIDIA-Nemotron-3.5-Bolt-E4B-4GB`, destinado a triaje, extracción, enrutamiento y redacción. Ambos se distribuyen bajo licencia MIT y comparten una familia de tokenizador multilingüe de estilo Nemotron/Llama con BPE.

El modelo se presenta con la etiqueta `pipeline_tag: graph-ml`, aunque no se trata de una red neuronal de grafos: la orientación a grafos se refiere a la integración del modelo en pipelines de recuperación aumentada estructurada en grafos (grafos de citas, conflictos de interés, cadenas de titularidad, dependencias entre cláusulas y grafos de obligaciones). El modelo razona sobre subgrafos recuperados y texto asociado, no sobre una representación gráfica aprendida.

La relevancia actual del bundle radica en su cobertura lingüística deliberadamente no centrada en Estados Unidos: inglés, malayo, javanés, alemán, vietnamita, tagalo, indonesio, chino y bengalí, con foco en jurisdicciones de derecho civil y common law del Sudeste Asiático. El autor declara explícitamente que el modelo no proporciona asesoramiento jurídico y que toda salida debe ser revisada por un abogado cualificado en la jurisdicción correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base NVIDIA Nemotron-3 Super), bundle dual con modelo rápido Nemotron-3.5 Bolt; orientación graph-ML para RAG estructurado en grafos |
| Parametros totales | Aproximadamente 120 000 millones en el componente Super (según nomenclatura del modelo base); componente Bolt E4B (tamaño exacto no disponible) |
| Parametros activos | Aproximadamente 12 000 millones en el componente Super (según nomenclatura A12B del modelo base); no disponible para Bolt |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 6 bits (componente Super); cuantización del componente Bolt no disponible |
| Idiomas soportados | en, ms, jv, de, vi, tl, id, zh, bn |
| Licencia | MIT |
| Formato de pesos | MLX (librería `mlx`); otros formatos no disponibles |

## Arquitectura y entrenamiento

El bundle se construye sobre dos modelos base de NVIDIA: `mlx-community/NVIDIA-Nemotron-3-Super-120B-A12B-6bit` y `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB`. El componente Super es un transformer de gran escala con aproximadamente 120 000 millones de parámetros totales y 12 000 millones activos, lo que sugiere una arquitectura de mezcla de expertos (MoE), aunque la model card no detalla la configuración de expertos ni el mecanismo de enrutamiento. El componente Bolt es un modelo pequeño de aproximadamente 4 000 millones de parámetros (E4B) y 4 GB, pensado para despliegue en GPU de 24 GB o incluso en portátil mediante MLX.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El autor menciona que ambos modelos comparten la misma familia de tokenizador multilingüe (Nemotron/Llama-style BPE), lo que permite compartir contabilidad de tokens, andamiaje de prompts y estado de agente entre Super y Bolt sin retokenizar. El dataset declarado es `KurniaKadir/multimodal-knowledge-agent`, sin más detalles sobre su contenido o tamaño.

La innovación destacable no está en la arquitectura del modelo en sí, sino en el diseño del bundle: separación de roles entre razonamiento pesado y triaje rápido, y la orientación a recuperación estructurada en grafos mediante PostgreSQL 16 con pgvector para datos transaccionales y Qdrant para recuperación de corpus multilingüe con filtros por payload (jurisdicción, idioma, tribunal, fecha, vigencia). El recorrido de grafos se realiza con CTEs recursivas en PostgreSQL, sin necesidad de una base de datos de grafos dedicada para cargas típicas.

## Capacidades

- Generación de texto y razonamiento multi-paso para síntesis de doctrina, redacción de contratos y memorandos IRAC (Issue, Rule, Application, Conclusion).
- Análisis multi-restricción de cláusulas legales, incluyendo cadenas de explotación de cláusulas y detección de conflictos entre disposiciones.
- Recuperación multilingüe cruzada: consultas en malayo que recuperan estatutos en inglés y legislación subsidiaria en malayo, y viceversa.
- Triaje de intake, enrutamiento por jurisdicción y extracción de cláusulas mediante el componente Bolt.
- Etiquetado de privilegio legal y redacción de información sensible.
- Validación de formato y estructura de documentos legales.
- Integración con una capa de herramientas MCP (Model Context Protocol) para agentes autónomos.
- Soporte de agentes con razonamiento multi-paso y skills especializadas.
- Capacidades RAG sobre corpus legales con filtros por jurisdicción, idioma, tribunal y vigencia.
- No se declaran capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Investigación jurídica autónoma: el agente recorre el grafo de citas para determinar si un precedente sigue siendo derecho vigente, trazando cadenas de derogación y distinción sobre el subgrafo recuperado y el texto asociado.
- Revisión y redacción de contratos: el componente Super analiza cláusulas contra el playbook del despacho en cualquiera de los idiomas soportados, mientras Bolt extrae y valida cláusulas individuales, aprovechando el grafo de dependencias entre cláusulas para detectar fallos en cascada al modificar una disposición.
- Due diligence corporativa: el agente consulta el grafo de titularidad (empresas, accionistas, directores) con CTEs recursivas en PostgreSQL para trazar el beneficiario último (UBO) y detectar conflictos de interés antes del encargo.
- Análisis de brechas de cumplimiento: mapeo de obligaciones (RGPD, PDPA-MY, UU PDP-ID, PIPL-CN y equivalentes regionales) a políticas y evidencias mediante el grafo de obligaciones, con Bolt realizando el triaje y la extracción de controles.
- Comunicación multilingüe con clientes: generación de actualizaciones en lenguaje llano y traducción entre los idiomas soportados bajo supervisión de abogado, con recuperación cruzada de estatutos en distintos idiomas.
- Soporte a litigios: construcción de cronologías, clasificación de e-discovery y cribado de privilegio, usando Bolt para el triaje inicial y Super para la síntesis de la cronología y el análisis de relevancia.
- Agentes de conocimiento interno del despacho: preguntas y respuestas con control de acceso por asunto, apoyados en pgvector para embeddings acotados al asunto y Qdrant para el corpus general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Componente Super (120B-A12B, cuantización MLX 6 bits): aproximadamente 1 GPU de 80 GB para TGI, o MLX en memoria unificada de 128 GB.
- Componente Bolt (E4B, 4 GB): 1 GPU de 24 GB para TGI, o ejecución en portátil mediante MLX.
- No cabe en GPU de consumo convencional para el componente Super; el componente Bolt sí es viable en portátiles y equipos con memoria unificada.
- Opciones de despliegue declaradas: TGI (Text Generation Inference), vLLM y MLX.
- Integración con capa de herramientas MCP para agentes.
- Almacenamiento y recuperación: PostgreSQL 16 con pgvector para datos de asunto y embeddings acotados; Qdrant para corpus multilingüe con filtros por payload.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nemotron-3 Legal Agentic Bundle (este) | ~120B totales / ~12B activos (Super) + ~4B (Bolt) | No disponible | MIT | Hugging Face, MLX | Bundle dual con orientación graph-ML y cobertura ASEAN |
| NVIDIA-Nemotron-3-Super-120B-A12B (base) | ~120B / ~12B activos | No disponible | No disponible en la información | Hugging Face (mlx-community) | Modelo base sin el ajuste legal ni el bundle |
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB (base) | ~4B | No disponible | No disponible en la información | Hugging Face (nvidia) | Modelo rápido base para triaje |
| Alternativas legales multilingües ASEAN | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificables |

## Limitaciones y advertencias

- El modelo no proporciona asesoramiento jurídico; toda salida es un borrador que debe ser revisado por un abogado cualificado en la jurisdicción correspondiente antes de utilizarse.
- Riesgo de alucinación en citas legales, referencias a estatutos y precedentes; el diseño con grafos de citas mitiga parcialmente este riesgo, pero no lo elimina.
- No se detallan sesgos conocidos ni evaluaciones de sesgo en la información disponible.
- Cobertura lingüística limitada a los nueve idiomas declarados; no se garantiza rendimiento fuera de ese conjunto.
- Longitud de contexto no especificada, lo que impide evaluar su idoneidad para documentos legales extensos.
- El componente Super requiere hardware de gama alta (80 GB de VRAM o 128 GB de memoria unificada), lo que limita su despliegue en entornos pequeños.
- La licencia MIT permite uso comercial, pero el autor no exime de responsabilidad profesional ni de las obligaciones regulatorias de cada jurisdicción.
- El modelo está etiquetado como `graph-ml`, pero no es una red neuronal de grafos; requiere infraestructura externa (PostgreSQL, Qdrant) para funcionar según el diseño previsto.
- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real en tareas legales no está verificado.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/KurniaKadir/nemotron-3-super
- Modelo base Super (MLX 6 bits): https://huggingface.co/mlx-community/NVIDIA-Nemotron-3-Super-120B-A12B-6bit
- Modelo base Bolt: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Dataset declarado: https://huggingface.co/datasets/KurniaKadir/multimodal-knowledge-agent
- Repositorio MLX: https://github.com/ml-explore/mlx
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- vLLM: https://github.com/vllm-project/vllm
- Qdrant: https://github.com/qdrant/qdrant
- pgvector: https://github.com/pgvector/pgvector
- Model Context Protocol: https://modelcontextprotocol.io
