# martianacdemy/synapcore-phobos-1

## Resumen

SynapCore Phobos-1 es un modelo de generación de texto desarrollado por Martian Academy que se presenta como una arquitectura cortical jerárquica de inspiración biológica, con mecanismos de neurogénesis no supervisada, mitosis cortical recursiva y autocorrección. Según su model card, parte de un núcleo conversacional congelado (Qwen2.5-0.5B-Instruct, 0,494B parámetros) sobre el que se injerta un "cerebro cortical dinámico" de 3,453B parámetros distribuidos en 122 nodos expertos y 55 routers jerárquicos, alcanzando un total declarado de 3,947B parámetros. El modelo se distribuye bajo licencia Apache 2.0 y declara soporte para inglés e hindi.

La propuesta diferencial no es el rendimiento bruto, sino el paradigma: en lugar de un transformer monolítico congelado tras el preentrenamiento, el autor describe un sistema que crece en tiempo de inferencia/entrenamiento continuo, creando columnas corticales especializadas cuando detecta episodios con baja similitud coseno respecto a los prototipos existentes. El bus de pensamiento canónico es un espacio de 896 dimensiones proyectado sobre una hiperesfera unitaria, y los routers aplican inhibición lateral GABAérgica para decidir entre respuesta conversacional pura del núcleo E00 o enrutado hacia sub-expertos.

Es relevante ahora porque explora una línea poco frecuente en modelos abiertos: aprendizaje continuo con expansión estructural y corrección selectiva de sinapsis sin reentrenamiento completo. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo (27,6 GB) es desproporcionado respecto a los 3,95B parámetros declarados, lo que sugiere pesos en precisión alta o artefactos adicionales de almacenamiento. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con núcleo congelado (Qwen2.5-0.5B-Instruct, capas 0-15) y cerebro cortical dinámico con MoE jerárquico (capas 16-23) |
| Parametros totales | 3,947B (3.95B) declarados |
| Parametros activos | No disponible (el autor no publica el número de parámetros activos por token; depende del enrutado dinámico) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en formato PyTorch `.pt` y vault binario alineado a 64B; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | Inglés (en), hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | `store/checkpoints/genesis_v5/synapcore_genesis_v5.pt` + vault Merkle binario `store/genesis_v5_merkle_store/genesis_v5_experts_bank.bin` |

## Arquitectura y entrenamiento

La arquitectura separa fluidez lingüística de inteligencia de dominio. Las capas 0 a 15 del modelo base Qwen2.5-0.5B-Instruct permanecen 100% congeladas y actúan como "shell" conversacional y gramatical. La capa 15 funciona como tálamo sensorial: aplica un blanqueado esférico ponderado por saliencia que proyecta la representación sobre una hiperesfera unitaria de 896 dimensiones (S^895). A partir de ahí, un router maestro R0 con inhibición lateral GABAérgica decide si la consulta es charla casual (similitud por debajo de un umbral τ, se responde con E00 puro) o si resuena con algún dominio especialista.

El "cerebro cortical" se compone de hasta 6 columnas parentales (E1-E6) de 4096 unidades, cada una con su sub-router, que pueden sufrir mitosis cortical: cuando la varianza interna de un nodo hoja se vuelve bimodal por encima de un umbral dependiente de la profundidad (ΔC ≥ γ0·(1 + 0,30·(d-1))), el nodo se convierte en padre compartido y genera dos hijos más estrechos con anchuras geométricas (4096u → 2048u → 1024u → 512u). El árbol declarado alcanza profundidad 7 con la traza `E1_SE2_SSE1_D4E2_D5E2_D6E2_D7E1`. Los padres no se congelan tras la mitosis: evolucionan con proyección de gradientes libre de conflicto (PCGrad), blindaje de importancia sináptica y alineación de representaciones entre ramas hermanas.

En cuanto a entrenamiento, la model card describe mecanismos de corrección (LTD selectiva sobre el 20% de neuronas defectuosas, reconsolidación composicional en cuatro niveles: Varnmala/Matra/Shabd/Vakya) y un principio de enlace conceptual retroactivo que desbloquea memorias de alto loss cuando llega información nueva. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El repositorio incluye una raíz Merkle SHA-256 con 976 hojas criptográficas verificadas para integridad de los pesos.

## Capacidades

- Generación de texto conversacional en inglés e hindi, heredada del núcleo Qwen2.5-0.5B-Instruct congelado.
- Enrutado dinámico hacia expertos especializados según la similitud coseno de la consulta con los prototipos de cada columna cortical.
- Crecimiento estructural autónomo (neurogénesis) cuando aparecen dominios nuevos no cubiertos por los expertos existentes.
- Mitosis cortical recursiva: división de nodos hoja en sub-expertos más estrechos al detectar varianza bimodal.
- Autocorrección selectiva mediante depresión a largo plazo (LTD) dirigida por atribución de error de primer orden.
- Reconsolidación composicional en cuatro niveles jerárquicos de abstracción.
- Aprendizaje continuo sin reentrenamiento completo del modelo.
- Integridad verificable de pesos mediante vault Merkle SHA-256.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación en aprendizaje continuo: el modelo sirve como banco de pruebas para estudiar neurogénesis y mitosis cortical en un transformer real, permitiendo medir cuándo y cómo se crean nuevos expertos ante flujos de datos no estacionarios.
- Experimentos de especialización incremental: un equipo puede alimentar dominios sucesivos (por ejemplo, terminología legal y luego médica) y observar si el enrutado jerárquico aísla cada dominio sin degradar los anteriores, gracias a PCGrad y al blindaje sináptico.
- Corrección de sesgos post-despliegue: el mecanismo de LTD selectiva permite, en teoría, atenuar patrones indeseados en un subconjunto de neuronas sin reentrenar el modelo completo, útil en ciclos de auditoría de modelos.
- Prototipado de asistentes bilingües inglés-hindi: el núcleo Qwen2.5-0.5B-Instruct congelado proporciona una base conversacional ligera para escenarios de atención al cliente en esos dos idiomas, con la posibilidad de añadir expertos de dominio específicos.
- Docencia y divulgación: la arquitectura, con su vocabulario biológico explícito (tálamo, columnas corticales, inhibición GABAérgica), es un material didáctico para explicar alternativas al transformer monolítico en cursos de arquitecturas de IA.
- Verificación de integridad de artefactos: el vault Merkle con 976 hojas permite demostrar que los pesos desplegados no han sido alterados, relevante en pipelines de suministro de software con requisitos de trazabilidad criptográfica.
- Investigación en routers condicionales: los 55 routers jerárquicos ofrecen un caso de estudio para analizar el comportamiento de enrutado con inhibición lateral frente a MoE planos convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 3,95B parámetros en FP16 requieren aproximadamente 8 GB solo para pesos; en FP32, unos 16 GB. El repositorio ocupa 27,6 GB, lo que sugiere artefactos adicionales o pesos en mayor precisión.
- GPU recomendadas: no documentadas por el autor. Por tamaño, una RTX 4090 (24 GB) o A100/H100 serían suficientes para los pesos en FP16, pero la implementación requiere código propio (`genesis/`), no un runtime estándar.
- ¿Cabe en consumer GPU? Probablemente sí en términos de memoria para los pesos, pero no hay soporte documentado en llama.cpp, Ollama ni vLLM, por lo que no es desplegable con herramientas convencionales sin trabajo de adaptación.
- Opciones de despliegue: el autor referencia módulos propios (`genesis/intelligent_generator.py`, `genesis/mitosis_lifecycle.py`, etc.) y pesos en `.pt`; no se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SynapCore Phobos-1 | 3,95B declarados (0,494B congelados + 3,453B dinámicos) | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Arquitectura cortical con crecimiento dinámico; sin benchmarks |
| Qwen2.5-0.5B-Instruct | 0,494B | 32K (según el modelo base original) | Apache 2.0 | Ampliamente disponible | Núcleo congelado del que parte Phobos-1; runtime estándar |
| Qwen2.5-3B-Instruct | 3,09B | 32K (según el modelo base original) | Apache 2.0 | Ampliamente disponible | Alternativa monolítica de tamaño comparable con soporte en vLLM, llama.cpp y Ollama |
| Modelos MoE abiertos de ~3-4B | Variable | Variable | Variable | Variable | No disponible una comparación directa fiable sin benchmarks publicados |

La comparación relevante es que Phobos-1 no ofrece, en la información disponible, métricas que permitan situarlo frente a alternativas monolíticas del mismo orden de magnitud; su interés es arquitectónico, no de rendimiento medido.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento, código o matemáticas frente a alternativas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria y la reproducibilidad independiente.
- Idiomas limitados a inglés e hindi; no se declara soporte de castellano ni de otras lenguas.
- Longitud de contexto no especificada, lo que impide evaluar su idoneidad para tareas de contexto largo.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico, pese a que el pipeline declarado es text-generation.
- El tamaño del repositorio (27,6 GB) frente a los 3,95B parámetros declarados genera dudas sobre la composición real de los artefactos y el espacio necesario para el despliegue.
- La terminología de la model card (neurogénesis, mitosis cortical, leyes biológicas) no está respaldada por publicaciones revisadas por pares en la información disponible; conviene tratar las afirmaciones como propuestas del autor.
- Riesgo de alucinación: no evaluado; el núcleo subyacente es un modelo de 0,5B, con las limitaciones típicas de esa escala.
- Sesgos: no documentados por el autor; el núcleo Qwen2.5-0.5B-Instruct hereda los sesgos de sus datos de entrenamiento originales, no detallados aquí.
- Licencia Apache 2.0 permite uso comercial, pero la falta de soporte en runtimes estándar implica coste de ingeniería para producción.
- No hay información sobre el proceso de entrenamiento (tokens, dataset, RLHF/DPO), lo que dificulta auditar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/martianacdemy/synapcore-phobos-1
- Organización Martian Academy: https://huggingface.co/martianacdemy
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
