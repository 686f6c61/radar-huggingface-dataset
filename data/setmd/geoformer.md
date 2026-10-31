# SetMD/geoformer

## Resumen

GeoFormer es un modelo experimental de tipo "foundation model" neuromórfico desarrollado por Shrikant Bhosale bajo la organización SetMD, disponible en HuggingFace y en GitHub. Se aleja del paradigma clásico del transformer euclidiano: propone un flujo de información que "talla autopistas geodésicas" sobre una métrica dinámica, combinando pesos sinápticos ternarios congelados de 1.58 bits (estilo BitNet b1.58) con una retícula de conductancia métrica de plásticoidad rápida inspirada en los sistemas de aprendizaje complementarios del cerebro.

El problema que aborda es el razonamiento multi-salto relacional y la inferencia de bajo consumo energético: el modelo se evalúa sobre tareas de razonamiento transitivo en grafos (con datasets como Cora y WordNet) y se presenta con un enfoque de compilación a barras cruzadas de memristores (ReRAM 1T1R) para computación analógica ultrabajo consumo.

Es relevante como propuesta de investigación de arquitecturas alternativas a los transformers convencionales, aunque conviene subrayar que es un modelo de escala muy reducida (249.665 parámetros, unos 48,76 KB empaquetados), sin entrenamiento a gran escala documentado y sin benchmarks estándar del sector (MMLU, HumanEval, etc.). No es un modelo de lenguaje de propósito general: su pipeline en HuggingFace es `feature-extraction`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid: transformer con Geodesic Highway Attention (Q-GHA) + flujo de gradiente disipativo continuo (Q-TAC) sobre laplacianos de grafo; inspiración neuromórfica |
| Parametros totales | 249.665 |
| Parametros activos | no disponible (no es MoE; todos los pesos son ternarios de 1.58 bits) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 1.58 bits ternaria (BitNet b1.58, pesos en {-1, 0, +1}) |
| Idiomas soportados | en (según la model card; no es un modelo de lenguaje conversacional) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`checkpoints/geoformer_foundation_model.pt`), serialización empaquetada BitNet b1.58 (48,76 KB); no hay safetensors ni GGUF documentados |

## Arquitectura y entrenamiento

GeoFormer combina cinco innovaciones declaradas por el autor. Primera: plasticidad métrica a dos escalas temporales, con pesos ternarios congelados de 1.58 bits (entrenados presumiblemente con la técnica STE de BitNet b1.58) que actúan como "escala cortical lenta", y una retícula de conductancia métrica dinámica ("escala hipocampal rápida") que se adapta durante el aprendizaje in-context few-shot. Segunda: la atención multi-cabeza Geodesic Highway Attention (Q-GHA), que modula los pesos de atención restando un término proporcional a la resistencia efectiva discreta entre pares de nodos. Tercera: la convergencia por atractor termodinámico continuo (Q-TAC), que sustituye el apilamiento discreto de capas por un flujo de gradiente disipativo sobre laplacianos de grafo. Cuarta: una memoria de trabajo relacional dispersa (Sparse-RML) basada en matrices CSR de SciPy, que según el autor reduce la memoria en un factor de 80.000x y permite razonar sobre más de 100.000 entidades en menos de 10 MB de RAM. Quinta: compilación isomórfica a barras cruzadas analógicas de memristores 1T1R.

Sobre los datos y el procedimiento de entrenamiento no hay detalles publicados en la model card: no se especifican tokens de entrenamiento, composición del dataset ni técnicas como RLHF o DPO. Los datasets referenciados (Cora, WordNet) sugieren entrenamiento o evaluación sobre grafos de citaciones y relaciones léxico-semánticas, no sobre corpus textuales masivos.

## Capacidades

- Extracción de características y razonamiento relacional multi-salto sobre grafos (evaluado en grafos de "cruce relacional" de nivel 6, con una precisión declarada de 84,7% ± 5,1% sobre nivel aleatorio).
- Aprendizaje in-context few-shot mediante adaptación de la retícula de conductancia métrica sin reentrenar los pesos ternarios.
- Razonamiento transitivo a gran escala: según el autor, más de 100.000 entidades en menos de 10 MB de RAM usando memoria dispersa CSR.
- Inferencia de latencia muy baja en CPU: 0,16–0,40 ms por inferencia (medida en x86_64 con `torch.no_grad()`).
- Compatibilidad conceptual con compilación a hardware analógico (memristores/ReRAM), con resiliencia modelada al 20% de ruido de programación analógica.
- Verificación formal de invariantes algebraicos mediante el solver SMT Microsoft Z3 (6/6 propiedades certificadas UNSAT).
- No documenta capacidades de generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento tipo "thinking".

## Casos de uso

- Razonamiento multi-salto sobre bases de conocimiento: dada una grafos de relaciones (por ejemplo, WordNet o grafos clínicos), el modelo puede resolver consultas transitivas del tipo "A implica B implica C" gracias a su atención modulada por geodésicas.
- Clasificación de nodos en grafos de citaciones: entrenado/evaluado con Cora, puede servir para tareas de feature-extraction sobre documentos científicos y sus relaciones.
- Diagnóstico diferencial asistido (investigación clínica): los tags de la model card señalan clinical-ai y differential-diagnosis; el modelo podría representar relaciones síntoma-enfermedad como grafos y razonar sobre ellas, aunque no hay validación clínica publicada.
- Investigación en computación neuromórfica y analógica: sirve como banco de pruebas compilable a barras cruzadas de memristores para estudiar inferencia ultrabajo consumo (443,9 pJ modelados por inferencia).
- Verificación formal de propiedades de modelos: su certificación con Z3 lo hace útil como caso de estudio en IA verificable formalmente.
- Despliegue en microcontroladores de borde: con un footprint empaquetado de 48,76 KB, cabe en MCUs de gama baja para tareas de razonamiento relacional embebido.
- Benchmark educativo para arquitecturas alternativas: útil como referencia para comparar enfoques de plasticidad a dos escalas frente a transformers convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar del sector (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos declarados por el autor, con su categoría de verificación, son:

| Metrica | Valor | Categoria | Metodo |
|---|---|---|---|
| Parametros del foundation model | 249.665 | Medida | Recuento de tensores PyTorch |
| Footprint empaquetado | 48,76 KB | Medida | Serializacion BitNet b1.58 |
| Latencia de inferencia (CPU) | 0,16–0,40 ms | Medida | Wall-clock en x86_64, `torch.no_grad()` |
| Footprint de memoria dispersa | 0,19–9,54 MB | Medida | `scipy.sparse.csr_matrix` con 10.000–100.000 triples |
| Razonamiento transitivo (Tier 6) | 84,7% ± 5,1% | Medida | Evaluacion con 5 semillas (108,6x sobre nivel aleatorio) |
| Estabilidad de invariantes algebraicos | 6/6 UNSAT | Certificacion formal | Microsoft Z3 SMT |
| Disipacion energetica dinamica | 443,9 pJ | Modelada | Modelo analitico de fisica de dispositivos 1T1R + ADC/DAC flash de 4 bits |
| Resiliencia a ruido analogico | 38,0% @ 20% ruido | Modelada | Simulacion Monte Carlo de perturbacion de conductancia |

Se recomienda prudencia: las cifras provienen de la model card del autor, sin revisión por pares independiente documentada, y las métricas energéticas son modeladas, no medidas en silicio.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula; el modelo completo empaquetado ocupa 48,76 KB y el footprint de memoria dispersa oscila entre 0,19 y 9,54 MB segun el numero de triples relacionales. No requiere GPU.
- GPU recomendadas: no disponibles; el modelo esta pensado para ejecucion en CPU.
- Consumer GPUs: no son necesarias; cabe con holgura en cualquier CPU x86_64 estandar e incluso en microcontroladores de borde segun el autor.
- Despliegue: PyTorch 2.0 o superior es la libreria documentada. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (el formato de pesos no es GGUF ni safetensors estandar).
- Latencia y throughput: 0,16–0,40 ms por inferencia en CPU x86_64 (medida por el autor); throughput agregado no disponible.

## Comparativa con modelos similares

No existen alternativas directamente comparables con esta arquitectura hibrida neuromorfica-geodesica. Como referencia de contexto, se compara con modelos de razonamiento relacional sobre grafos y con un LLM cuantizado ternario:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SetMD/geoformer | Hibrido neuromorfico/grafo, 1.58-bit | 249.665 | no disponible | AGPL-3.0 | Pesos en HuggingFace, codigo en GitHub |
| GAT / GCN (clasicos) | Redes neuronales de grafos | Tipicamente <1M | N/A (grafos) | MIT/Apache | Implementaciones abiertas (PyTorch Geometric, DGL) |
| BitNet b1.58 (referencia conceptual) | LLM transformer ternario | Escala variable | Variable | Investigacion (Microsoft) | Articulos y codigo de referencia, pesos completos no publicos |
| KGE clasicos (TransE, ComplEx) | Embeddings de conocimiento | Millones de embeddings | N/A | Variada | Librerias abiertas (PyKEEN, LibKGE) |

GeoFormer se diferencia de todos ellos por combinar pesos ternarios congelados con plasticidad metrica rapida y verificacion formal, pero su escala es entre 4 y 6 ordenes de magnitud inferior a la de un LLM moderno.

## Limitaciones y advertencias

- Escala minima: con 249.665 parametros, el modelo no es un LLM ni un modelo de proposito general; no genera texto conversacional ni codigo.
- Sin benchmarks estandar: no hay evaluaciones independientes en MMLU, HumanEval, GSM8K ni metricas equivalentes; las cifras publicadas provienen unicamente del autor.
- Metricas parcialmente modeladas: el consumo energetico (443,9 pJ) y la resiliencia al ruido analogico son modelos analiticos y simulaciones Monte Carlo, no medidas en hardware fisico.
- Sin validacion clinica: los tags de medical y clinical-ai no implican aprobacion regulatoria ni evidencia clinica; su uso en diagnostico diferencial es exclusivamente experimental.
- Licencia AGPL-3.0: es una licencia copyleft fuerte; cualquier servicio de red que use el modelo debe liberar el codigo fuente derivado, lo que puede ser un impedimento para uso comercial cerrado.
- Riesgo de alucinacion: no aplicable en el sentido de LLMs, pero la precision en razonamiento transitivo (84,7% ± 5,1%) implica una tasa de error no despreciable en grafos complejos.
- Contexto no documentado: no se especifica longitud de contexto ni limites de secuencia.
- Proyecto de autor individual sin descargas registradas (0 en el momento de la ficha) ni revision por pares documentada: tratar como investigacion preliminar.

## Enlaces

- HuggingFace: https://huggingface.co/SetMD/geoformer
- Repositorio GitHub oficial: https://github.com/bhosaleone/geoformer
- Repositorio hermano (Continuous TAC): https://github.com/bhosaleone/TAC
- Nota tecnica en Zenodo: https://doi.org/10.5281/zenodo.23730305
- Ensayo oficial del autor: https://praman.blog/geoformer-propagation-geometry-neuromorphic-foundation-model/
- Blog del autor: https://praman.blog
- Microsoft Z3 (verificacion formal): https://github.com/Z3Prover/z3
