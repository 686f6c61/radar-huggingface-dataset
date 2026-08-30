# PowerMachine/HAKO

## Resumen

HAKO (Hybrid self-adjusting Attention KOhonen architecture) es un modelo experimental desarrollado por el usuario PowerMachine, publicado en HuggingFace con el identificador `PowerMachine/HAKO`. Se trata de un sistema de generación de texto de arquitectura híbrida que combina mapas autoorganizativos (GHSOM), redes neuronales probabilísticas (CPNN), redes de Kohonen (BKN, DASOM) y un bucle de razonamiento cíclico de cuatro fases, orquestado sobre dos modelos base reales: Qwen2.5-0.5B-Instruct e IBM Granite-4.0-1B, ambos ejecutados vía ONNX Runtime en CPU.

El modelo destaca por su enfoque de autoaprendizaje y evolución: incluye un mecanismo de crecimiento dimensional, regularización con Elastic Weight Consolidation (EWC) y un verificador de aprendizaje que garantiza la mejora de la pérdida y la calidad de los mapas. El artefacto entrenado ocupa 17,9 MB y puede cargarse de forma independiente sin los pesos originales. La propuesta es relevante por su intento de integrar múltiples paradigmas de aprendizaje (SOM, difusión, GNN, MoE) en un único sistema con gestión explícita de memoria, aunque su madurez y aplicabilidad práctica son limitadas al tratarse de un proyecto de investigación sin documentación pública más allá de la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: GHSOM + CPNN + BKN + DASOM + MoE (hybrid_attention) + GNN (GATv2), orquestada por un bucle de pensamiento de 4 fases |
| Parametros totales | no disponible (el checkpoint pesa 17,9 MB, pero no se especifica el número de parámetros) |
| Parametros activos | no disponible (no se indica si es MoE con parámetros activos) |
| Longitud de contexto | no disponible (la model card menciona un presupuesto de tokens KV, pero sin cifra concreta) |
| Tipos de cuantizacion | int4-fp16 (para el modelo Qwen base) y AWQ grp32 (para el modelo Granite base); no se especifica cuantización del propio HAKO |
| Idiomas soportados | no disponible (probablemente multilingüe por el uso de Qwen y Granite, pero sin confirmación) |
| Licencia | no disponible (no se indica en la model card) |
| Formato de pesos | PyTorch (checkpoint `.pt`) para el artefacto HAKO; ONNX para los modelos base |

## Arquitectura y entrenamiento

HAKO no es un transformer estándar. La model card describe una arquitectura híbrida que integra:

- **GHSOM** (Growing Hierarchical Self-Organizing Map): mapas autoorganizativos jerárquicos que crecen dinámicamente.
- **CPNN** (Counterpropagation Neural Network): red de propagación inversa con interpolación acotada.
- **BKN** (Bidirectional Kohonen Network) y **DASOM** (Denoising Adaptive Self-Organizing Map): variantes de redes de Kohonen con propiedades de contracción y denoising.
- **MoE** (Mixture of Experts) en la capa de atención híbrida.
- **GNN (GATv2)**: red neuronal de grafos con atención para modelar relaciones entre unidades del mapa.

El sistema se orquesta mediante un bucle de razonamiento de cuatro fases (no detallado en la model card) y un router que decide qué fuente (Qwen o Granite) o qué componente sintético utilizar. El entrenamiento se realiza con un pipeline que incluye:

- Un tokenizador byte-BPE paralelo con MapReduce.
- Un compositor generativo estilo DDPM (Diffusion Probabilistic Models) y un currículo de juego.
- Extracción de mapas mediante k-means++ y ajuste GHSOM.
- Un mecanismo de evolución con seguimiento de métricas (tamaño del árbol, QE, drift, entropía del router, etc.) y un verificador de aprendizaje que valida la mejora de la pérdida, la mejora del error de cuantización, la evolución estructural, el drift de parámetros y el cumplimiento del presupuesto de memoria.

El entrenamiento se realizó en 12 épocas con un corpus ampliado con textos autogenerados por las dos fuentes reales (8 del Qwen y 12 del Granite, unión deduplicada de 43 textos). La pérdida pasó de 1,476 a 0,489, el error de cuantización (QE) de 0,121 a 0,105, y el pico de RSS fue de 2,21 GB, dentro del presupuesto.

## Capacidades

- Generación de texto: el modelo puede producir texto mediante el bucle de razonamiento de cuatro fases, combinando las salidas de los modelos base y los mapas autoorganizativos.
- Razonamiento multi-paso: el bucle de pensamiento cíclico sugiere capacidad de razonamiento iterativo, aunque no se detalla su implementación.
- Autoaprendizaje y evolución: el modelo incorpora mecanismos de crecimiento dimensional, EWC y verificación de aprendizaje que le permiten adaptarse y mejorar durante el entrenamiento.
- Extracción de mapas: puede generar mapas autoorganizativos (GHSOM) a partir de embeddings reales, con certificación de fidelidad mediante un test de dominancia.
- Integración con modelos externos: utiliza Qwen2.5-0.5B-Instruct e IBM Granite-4.0-1B como fuentes reales, lo que le permite aprovechar sus respectivas capacidades.
- Gestión de memoria adaptativa: implementa técnicas de mmap para embeddings, monitoreo de RSS y guardas de memoria, permitiendo ejecución en entornos con recursos limitados.

No se mencionan capacidades específicas de tool calling, agentes, visión o audio en la documentación disponible.

## Casos de uso

Dado el carácter experimental del modelo y la falta de documentación sobre aplicaciones concretas, los siguientes casos son inferencias razonables basadas en su arquitectura, pero no están validados por el autor:

- Investigación en aprendizaje autoorganizativo: el modelo puede servir como banco de pruebas para estudiar la integración de SOM, MoE y GNN en tareas de generación de texto.
- Generación de texto en entornos con restricciones de memoria: gracias a su gestión de memoria (mmap, RSS guard), podría ejecutarse en dispositivos con poca RAM, como máquinas virtuales pequeñas.
- Prototipado de sistemas de razonamiento iterativo: el bucle de pensamiento de cuatro fases podría explorarse para tareas que requieren reflexión paso a paso.
- Extracción de representaciones semánticas: los mapas GHSOM generados podrían utilizarse para visualizar o analizar la estructura latente de un corpus.
- Aprendizaje continuo: los mecanismos de evolución y verificación de aprendizaje podrían adaptarse a entornos donde el modelo debe actualizarse con nuevos datos.
- Educación y experimentación: como proyecto de código abierto con 27 tests, es útil para aprender sobre arquitecturas híbridas y técnicas de auto-organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas internas de entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida final (12 épocas) | 0,489 |
| Error de cuantización (QE) final | 0,105 |
| Drift de parámetros | 16,89 |
| λ (EWC) | [1,39, 2,0] |
| Pico de RSS | 2,21 GB |
| Fidelidad de mapas (T-MAP) | 1,00 (tanto para Qwen como para Granite) |

Estas métricas no son comparables con benchmarks de modelos convencionales y no permiten evaluar el rendimiento en tareas estándar de NLP.

## Requisitos de hardware

Según la model card, el modelo fue probado en una máquina virtual con las siguientes características:

- CPU: 2 vCPU con soporte AVX-512/AMX
- RAM: 4,1 GB
- Rendimiento medido: prefill ≈ 126 tokens/s, decode ≈ 17 tokens/s, RSS de sesión ≈ 580 MB

Requisitos estimados:

- VRAM: no aplica (ejecución en CPU)
- RAM mínima: ~2,5 GB para el modelo completo (según el pico de RSS reportado)
- GPU: no requerida; el modelo está diseñado para CPU (ONNX Runtime)
- Opciones de despliegue: ONNX Runtime con tuning automático de hardware; scripts de demostración incluidos en el repositorio
- Compatibilidad con consumer hardware: sí, puede ejecutarse en cualquier CPU moderna con al menos 4 GB de RAM, aunque el rendimiento será limitado

## Comparativa con modelos similares

No se dispone de modelos directamente comparables, ya que HAKO es una arquitectura única que combina múltiples paradigmas (SOM, MoE, GNN, difusión) y no sigue el diseño de los LLM convencionales. Los modelos base que utiliza (Qwen2.5-0.5B y Granite-4.0-1B) son de menor tamaño y sirven como fuentes de conocimiento, pero HAKO no publica métricas que permitan compararlos. Por tanto, no se proporciona tabla comparativa.

## Limitaciones y advertencias

- Naturaleza experimental: HAKO es un proyecto de investigación sin evidencia de uso en producción; la model card es altamente técnica y carece de documentación sobre casos de uso reales.
- Datos de entrenamiento limitados: el corpus final es de solo 43 textos, lo que implica una capacidad de generalización muy restringida.
- Sin benchmarks estándar: no hay resultados en tareas conocidas (MMLU, HumanEval, etc.), por lo que no se puede evaluar su calidad frente a otros modelos.
- Licencia no especificada: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o modificación.
- Sesgos y alucinaciones: no se ha evaluado el comportamiento en cuanto a sesgos o veracidad; al ser un modelo pequeño y entrenado con pocos datos, es probable que presente alucinaciones frecuentes.
- Dependencia de modelos externos: para las fases de "fuentes reales" requiere descargar los pesos de Qwen y Granite (0,8 GB y 1,9 GB respectivamente), aunque el checkpoint final no los necesita.
- Repositorio vacío en HuggingFace: el repo no contiene archivos (0,0 GB), solo la model card; los pesos no están publicados directamente, sino que se generan mediante scripts.

## Enlaces

- HuggingFace: https://huggingface.co/PowerMachine/HAKO
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios oficiales) en la búsqueda web. Los resultados encontrados bajo el nombre "hako" corresponden a proyectos no relacionados (mithraeums/hako, HakkoAI, Hako cleaning).
