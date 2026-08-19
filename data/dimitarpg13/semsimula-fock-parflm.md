# dimitarpg13/semsimula-fock-parflm

## Resumen

El modelo `semsimula-fock-parflm` es un modelo de lenguaje autorregresivo de la familia Semantic Simulation (SPLM), desarrollado por el investigador dimitarpg13. Se trata de un modelo **no transformer**, basado en mecánica lagrangiana y en el concepto de **espacio de Fock**: introduce un conjunto de registros virtuales persistentes (16 partículas) que se crean mediante puertas estructuradas Q/K/V y se gestionan con disciplina de pila LIFO. El modelo está diseñado para ser **puramente conservativo**, es decir, su dinámica se deriva de un potencial escalar y un potencial por pares, sin mecanismos de atención tradicionales, lo que permite inferencia con memoria constante por capa.

Entrenado sobre el corpus TinyStories (texto narrativo en inglés), el modelo alcanza una perplexity de validación de **9.70** tras una corrección de un leak causal detectado en una versión anterior. Esta corrección, documentada en la propia model card, supuso un coste de +0.40 PPL respecto a la versión con leak, pero garantiza que no hay fuga de información futura hacia el pasado. El modelo es relevante como experimento de arquitecturas alternativas a los transformers, con fundamentos físicos y matemáticos (geometría riemanniana, geodesicas), aunque su tamaño y entrenamiento limitado lo convierten en una pieza de investigación más que en una herramienta de producción.

La licencia es CC-BY-4.0 y el idioma soportado es únicamente inglés. El repositorio ocupa 0.1 GB y el checkpoint está disponible en formato PyTorch. No se proporcionan datos sobre número de parámetros, longitud de contexto ni cuantizaciones, por lo que estos aspectos quedan sin especificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM v2.1 (no transformer, basada en mecánica lagrangiana, espacio de Fock, registros virtuales con puertas Q/K/V y pila LIFO) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch) |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (safetensors no confirmado, repo de 0.1 GB) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia PARFLM (Property-Attractive-Repulsive Force Language Model), que modela la generación de texto como un sistema dinámico conservativo. En lugar de atención, emplea dos potenciales: un potencial escalar (MLP) y un potencial por pares, que definen una fuerza que actúa sobre los estados ocultos. La extensión Fock añade un pool de 16 registros virtuales persistentes, creados mediante puertas Q/K/V (query-key matching decide qué registro absorbe información de qué token), con disciplina de pila LIFO. Existe un canal inverso opcional no conservativo, aunque en esta versión se ha corregido un leak causal en ese canal.

El entrenamiento se realizó sobre el dataset TinyStories (roneneldan/TinyStories), con 16.000 pasos, según se menciona en la model card. No se especifican hiperparámetros adicionales como tasa de aprendizaje o tamaño de lote. La model card documenta un proceso de auditoría causal que detectó una fuga de información futura en el canal inverso; el checkpoint publicado corresponde al modelo re-entrenado con la corrección (`prefix_causal_registers=True`). El coste de la corrección fue de +0.40 PPL (de 9.30 a 9.70) y un aumento de 3x en tiempo de entrenamiento (12.1 h vs 4.1 h). No se menciona uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto autorregresivo en inglés, entrenado exclusivamente sobre cuentos infantiles (TinyStories).
- Inferencia con memoria constante por capa (O(1) en longitud de secuencia), gracias a la ausencia de atención.
- Mecanismo de registros virtuales con puertas Q/K/V que permite capturar dependencias de largo alcance sin atención.
- Capacidades geométricas emergentes: el campo de fuerza aprendido tiende a ser casi compatible con una métrica riemanniana, lo que permite interpretar las trayectorias de estados ocultos como geodesicas aproximadas.
- No se reporta soporte para tool calling, function calling, razonamiento multi-step, visión ni audio.
- No se reporta capacidad multilingüe (solo inglés).

## Casos de uso

- **Investigación en arquitecturas alternativas a transformers**: el modelo sirve como banco de pruebas para estudiar modelos basados en energía y mecánica lagrangiana, especialmente en lo que respecta a memoria constante en inferencia.
- **Estudio de leak causal en modelos autorregresivos**: la documentación del leak y su corrección proporciona un caso práctico para auditar arquitecturas no convencionales.
- **Análisis de propiedades geométricas de representaciones**: las capacidades riemannianas del modelo permiten explorar cómo los potenciales organizan el espacio de estados ocultos.
- **Generación de texto narrativo breve**: dado su entrenamiento en TinyStories, puede generar cuentos infantiles simples en inglés, aunque con calidad limitada.
- **Experimentos de destilación o comparación con transformers**: al ser un modelo pequeño y de código abierto, puede usarse para comparar métricas de eficiencia (memoria, velocidad) frente a transformers de tamaño similar.
- **Educación en modelos físicamente informados**: como ejemplo didáctico de cómo se pueden construir LM basados en principios físicos (lagrangianos, potenciales, conservación de energía).

## Benchmarks y rendimiento

El único resultado oficial declarado en la model card es la perplexity de validación sobre TinyStories, tras la corrección del leak causal:

| Dataset | Métrica | Valor | Verificado |
|---|---|---|---|
| TinyStories (validation) | Perplexity | 9.70 | No (declarado por el autor) |

La model card también menciona que la variante Fock Attention (también leak-free) alcanza 9.42 PPL, por lo que Fock-PARFLM v2.1 es ligeramente peor en este corpus. No se publican resultados en MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- El tamaño del repositorio es de 0.1 GB, lo que sugiere un modelo de pocos cientos de millones de parámetros como máximo, aunque no se confirma el número exacto.
- No se proporcionan requisitos de VRAM ni GPU recomendadas. Dado el tamaño del checkpoint, es plausible que quepa en GPUs de consumo como RTX 3060 o superiores, pero no hay datos oficiales.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI). Al ser un modelo PyTorch estándar, podría servirse con Hugging Face Transformers si se implementa la arquitectura, pero no hay integración publicada.
- No se reportan métricas de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Arquitectura | PPL TinyStories | Licencia | Disponibilidad |
|---|---|---|---|---|
| semsimula-fock-parflm (este) | Fock-PARFLM (no transformer) | 9.70 | CC-BY-4.0 | HuggingFace |
| semsimula-fock-attention | Fock Attention (no transformer) | 9.42 | CC-BY-4.0 | HuggingFace |
| semsimula-parflm-multixi | MultiXi PARFLM (no transformer) | no disponible | CC-BY-4.0 | HuggingFace |

No se dispone de comparaciones con modelos transformer de tamaño similar (p. ej., GPT-2 pequeño o Pythia) en los datos proporcionados. La comparativa se limita a la familia SPLM.

## Limitaciones y advertencias

- **Entrenamiento limitado**: solo se ha entrenado sobre TinyStories (texto narrativo infantil), por lo que su capacidad de generalización a otros dominios es muy reducida.
- **Idioma**: únicamente inglés; no soporta otros idiomas.
- **Calidad de generación**: la perplexity de 9.70 es alta en comparación con modelos transformer modernos, lo que indica una calidad de texto limitada.
- **Riesgo de alucinación**: al ser un modelo pequeño y sin alineación, puede generar contenido incoherente o factualmente incorrecto.
- **Sesgos**: el corpus TinyStories es un subconjunto limitado de texto, lo que introduce sesgos temáticos y estilísticos.
- **No apto para producción**: no hay soporte para tool calling, agentes ni integraciones estándar; es un modelo de investigación.
- **Leak causal corregido**: aunque el checkpoint actual está libre de leak, cualquier uso de la versión anterior (9.30 PPL) sería inválido. La model card advierte explícitamente de este riesgo.
- **Licencia**: CC-BY-4.0 permite uso comercial con atribución, pero el modelo no está optimizado para aplicaciones comerciales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-fock-parflm
- Variante Fock Attention: https://huggingface.co/dimitarpg13/semsimula-fock-attention
- Variante MultiXi PARFLM: https://huggingface.co/dimitarpg13/semsimula-parflm-multixi
- Variante estructurada con vtheta: https://huggingface.co/dimitarpg13/semsimula-fock-parflm-structured-vtheta
- Documento de auditoría del leak causal (GitHub): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Fock-PARFLM_Causal_Leak_Audit_Results.md
- DOI del framework Semantic Simulation: https://doi.org/10.5281/zenodo.19712427
