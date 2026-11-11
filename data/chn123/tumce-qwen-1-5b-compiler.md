# chn123/tumce-qwen-1.5b-compiler

## Resumen

TÜMCE (Turkish Morphosemantic Compiler Architecture) es un modelo neuro-simbólico de comprensión del lenguaje natural (NLU) para turco, publicado por el usuario chn123. Se construye mediante fine-tuning con LoRA sobre Qwen/Qwen2.5-1.5B y la posterior fusión del adaptador en el modelo base, dando lugar a un checkpoint autónomo que no requiere configuración adicional de adaptadores. Su función no es la generación de texto libre, sino la compilación de oraciones en turco a un DSL canónico de raíces léxicas y operadores morfológicos, por ejemplo "geliyorum" se transforma en `<NODE_ROOT> gel <OP_PROG_IYOR> <OP_AGR_1SG>`.

El modelo aborda un problema estructural del turco: al ser una lengua aglutinante, la tokenización subpalabra (BPE/WordPiece) fragmenta los sufijos y diluye la información morfológica. TÜMCE sustituye esa representación implícita por una secuencia explícita de operadores verificables, lo que permite validación determinista mediante autómatas de estados finitos (FST) y motores de e-graphs, y facilita tareas como la construcción de grafos de conocimiento, la normalización de lenguaje coloquial y la detección de inconsistencias morfológicas.

Con 1.776.719.360 parámetros (1,5B), licencia MIT y un tamaño de repositorio de 3,6 GB, es un modelo compacto orientado a un dominio vertical muy concreto: la morfosemántica del turco. La model card declara métricas muy altas sobre su propio conjunto de destilación, si bien no se han publicado resultados en benchmarks estándar independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con enfoque neuro-simbólico; puente hacia FST determinista y e-graphs |
| Parametros totales | 1.776.719.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, sin confirmar por el autor) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only, y se ajusta mediante LoRA (referencia arXiv:2106.09685 en las etiquetas) sobre clústeres de 3x y 4x NVIDIA A100. El adaptador resultante se fusiona con el modelo base, por lo que el repositorio contiene un checkpoint completo y autónomo. El entrenamiento se prolongó durante 3 épocas completas, aproximadamente 89.000 pasos de entrenamiento.

El conjunto de datos principal es `chn123/tumce_distillation_v4_gold_augmented`, con 60.110 registros de entrenamiento y 11.765 de validación, generado por destilación. La model card menciona además datasets auxiliares de dominio (médico, financiero, legal y OpenOrca-tr) en las etiquetas, aunque no se detalla su peso en la mezcla final. La innovación técnica central es la formulación del problema como compilación: la salida se estructura en nodos de raíz y operadores morfológicos alineados con 92 categorías gramaticales de la tradición lingüística turca (Korkmaz, Ergin, Banguoğlu), lo que permite verificación bidireccional con un FST y un motor de e-graphs. No se documentan detalles sobre RLHF o DPO.

## Capacidades

- Compilación morfológica de oraciones en turco a un DSL canónico de raíces y operadores.
- Análisis morfológico con etiquetado compatible con Universal Dependencies.
- Normalización de lenguaje coloquial y errores ortográficos (por ejemplo, "yapcam", "geliyo") a formas canónicas.
- Verificación de equivalencia semántica mediante e-graphs.
- Construcción y normalización de grafos de conocimiento a partir de variantes flexivas.
- Detección de inconsistencias morfológicas y lógicas en cadenas generadas.
- Generación de texto condicionada por el formato DSL (pipeline text-generation).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al turco según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Análisis morfológico en pipelines de PLN: el modelo convierte cada oración en una secuencia de raíces y operadores verificable, lo que permite integrar un paso determinista de validación en herramientas de etiquetado lingüístico.
- Construcción de GraphRAG y ontologías: al normalizar variantes flexivas ("evde", "evden", "evdekiler") a la raíz "ev", se pueden generar nodos y aristas de un grafo de conocimiento con menor dispersión léxica.
- Normalización de texto de redes sociales y atención al cliente: las contracciones y errores ortográficos del turco coloquial se mapean a formas canónicas antes de alimentar otros modelos o sistemas de búsqueda.
- Auditoría de halucinaciones morfológicas: la salida DSL puede contrastarse contra el FST y el motor de e-graphs para detectar combinaciones de sufijos imposibles en textos generados por otros LLM.
- Preprocesamiento para motores de búsqueda en turco: la reducción a raíces mejora la coincidencia entre consultas y documentos al eliminar la variabilidad flexiva.
- Enseñanza y corrección lingüística: el desglose explícito en operadores facilita explicar la estructura de una palabra o frase a estudiantes de turco.
- Etiquetado de corpus con estándar UD: la model card declara alineación con Universal Dependencies, lo que permite usar el modelo como anotador preliminar en proyectos de treebanks.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto TUMCE Distillation v4 Gold Augmented (no verificados de forma independiente):

| Metrica | Valor | Tipo |
|---|---|---|
| Normalized Exact Match | 92,00 | accuracy |
| Ham Exact Match | 88,00 | accuracy |
| Token Accuracy | 99,56 | accuracy |
| Root Accuracy | 98,77 | accuracy |
| Word Level Exact Match | 96,00 | accuracy |
| Operator F1 Score | 98,00 | f1 |
| UD Morphological Feature Accuracy | 100,00 | accuracy |
| E-Graph Equivalence Recall | 100,00 | recall |
| E-Graph Equivalence Precision | 100,00 | precision |

No se han publicado resultados en benchmarks estándar independientes (MMLU, GSM8K, HumanEval u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV.
- En cuantización de 8 bits: alrededor de 1,8-2 GB de VRAM; en 4 bits: en torno a 1-1,2 GB (estimaciones según el número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; A100 o H100 para entrenamiento o serving a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: `transformers` (soporte nativo declarado), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp u Ollama no están confirmados por el autor, aunque la arquitectura Qwen2 es ampliamente soportada por estas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chn123/tumce-qwen-1.5b-compiler | 1,78B | no disponible | NLU morfológica turca neuro-simbólica | MIT | Hugging Face |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens (según el modelo base) | LLM generalista multilingüe | Apache 2.0 | Hugging Face |
| Modelos de análisis morfológico turco basados en BERT (p. ej., BERTurk) | ~110M-1B | 512 tokens | Clasificación y etiquetado | variable | Hugging Face |

La comparación con BERTurk y otros modelos turcos es aproximada, ya que la información disponible no incluye sus métricas en el conjunto TUMCE. Frente a Qwen2.5-1.5B, TÜMCE sacrifica generalidad y capacidades de generación libre a cambio de una salida estructurada y verificable en el dominio morfológico del turco.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en turco; no se declaran capacidades en otros idiomas.
- Orientado a compilación morfológica, no a generación de texto generalista ni a razonamiento abierto.
- Las métricas declaradas proceden del propio conjunto de destilación del autor y no están verificadas de forma independiente; pueden no generalizar a dominios o registros distintos.
- No se documenta la longitud de contexto efectiva, lo que dificulta planificar su uso con documentos largos.
- Riesgo de sesgo derivado de los corpus de destilación y de los datasets auxiliares (médico, financiero, legal), cuya composición y proporción no se detalla.
- Riesgo de alucinación en la salida DSL si el texto de entrada contiene construcciones fuera de la distribución de entrenamiento; la verificación con FST y e-graphs mitiga pero no elimina este riesgo.
- Licencia MIT permisiva, compatible con uso comercial, pero conviene revisar las licencias de los datasets auxiliares citados en las etiquetas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni casos de producción documentados.
- No hay información sobre cuantizaciones publicadas ni sobre latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chn123/tumce-qwen-1.5b-compiler
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset principal: https://huggingface.co/datasets/chn123/tumce_distillation_v4_gold_augmented
- Dataset médico: https://huggingface.co/datasets/turkerberkdonmez/TUSGPT-TR-Medical-Dataset-v1
- Dataset financiero: https://huggingface.co/datasets/AlicanKiraz0/Turkish-Finance-SFT-Dataset
- Dataset legal: https://huggingface.co/datasets/OrionCAF/turkish_law_qa_dataset
- Dataset OpenOrca-tr: https://huggingface.co/datasets/malhajar/OpenOrca-tr
- Paper Qwen2.5 (arXiv:2412.15115): https://arxiv.org/abs/2412.15115
- Paper LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
