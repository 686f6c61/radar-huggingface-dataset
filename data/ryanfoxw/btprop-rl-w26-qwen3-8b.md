# RyanFoxW/btprop-rl-w26-qwen3-8b

## Resumen

El modelo `btprop-rl-w26-qwen3-8b` es un fine-tune de Qwen3-8B entrenado con GRPO (Group Relative Policy Optimization) para generar variantes de paráfrasis de afirmaciones, diseñado específicamente como capa de perturbación del detector de alucinaciones BTProp. Desarrollado por RyanFoxW en el marco del proyecto BENGAL-UCSB, este modelo no es un asistente conversacional ni un verificador de hechos autónomo: su única función es producir tres paráfrasis de una afirmación dada que preserven el contenido veritativo, para que un juez congelado las evalúe contra evidencia recuperada y un agregador HMM calcule la probabilidad posterior de que la afirmación original sea alucinada.

La relevancia de este modelo radica en que demuestra una mejora medible en la detección de alucinaciones por declaración (per-statement) dentro del pipeline BTProp, con un incremento de PRAUC de +0,0145 y de AUROC de +0,0034 respecto al Qwen3-8B sin entrenar. El entrenamiento con GRPO sobre 1.858 prompts de cuatro datasets de entrenamiento, con una recompensa anclada en calibración, logra que el modelo escriba variantes más útiles en lugar de colapsar a una única paráfrasis limpia, como ocurría en intentos anteriores. El modelo tiene 8.190.735.360 parámetros (8B) y se distribuye en formato safetensors con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32K tokens (heredado de Qwen3-8B) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (modelo base Qwen3-8B soporta multiples idiomas, pero el fine-tune no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso con 8B parámetros y ventana de contexto de 32K tokens. El fine-tune se realizó con GRPO implementado en verl, utilizando 1.858 prompts provenientes de cuatro datasets de entrenamiento disjuntos del split de prueba, con batch de 21, rollout group de 8, 3 épocas (264 pasos) y coeficiente KL de 0,005. La recompensa incluye un término de anclaje de calibración que premia acercar la probabilidad posterior a la etiqueta real respecto a la previa, lo que explica que la mejora se concentre en PRAUC (calibración) más que en AUROC (ranking).

La innovación clave del entrenamiento no está en el algoritmo sino en el preprocesado de la evidencia: se usó BM25 de Wikipedia a nivel de página (wiki-2026) con filtrado de pasajes que contienen la respuesta dentro del bucle de búsqueda, en lugar de usar slices de 100 palabras filtrados después. Según el autor, esto permite que la capa de perturbación tenga elementos de comparación adecuados. El modelo genera tres paráfrasis por afirmación, y un juez congelado (separado) puntúa cada una contra la evidencia recuperada; un agregador HMM fijo convierte esas puntuaciones en un posterior sobre la afirmación original.

## Capacidades

- Generacion de tres variantes de parafrasis de una afirmacion que preservan el contenido veritativo, especificamente para el pipeline BTProp.
- Integracion con un juez congelado y un agregador HMM para deteccion de alucinaciones por declaracion.
- No es un modelo de proposito general: fuera del pipeline solo reescribe frases.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso general.
- No tiene capacidades de vision ni audio.
- Multilingue limitado al modelo base Qwen3-8B, pero sin garantias en el fine-tune.

## Casos de uso

- Deteccion de alucinaciones en respuestas generadas por LLM: el modelo se usa como capa de perturbacion en BTProp para generar parafrasis de cada afirmacion y evaluar su consistencia con evidencia recuperada, mejorando la precision de la deteccion en pipelines de verificacion de hechos.
- Verificacion de hechos en articulos periodisticos o informes: dado un texto, se extraen afirmaciones y se aplica el pipeline completo (parafrasis + juez + HMM) para identificar declaraciones no respaldadas por fuentes.
- Control de calidad en sistemas RAG: las afirmaciones generadas por un sistema de recuperacion aumentada pueden ser validadas contra las fuentes recuperadas, reduciendo la propagacion de informacion falsa.
- Auditoria de respuestas en asistentes virtuales: integrado en un servicio de atencion al cliente, permite marcar respuestas potencialmente alucinadas antes de enviarlas al usuario.
- Investigacion academica en deteccion de alucinaciones: sirve como componente reproducible para experimentos comparativos en el campo, dado que su entrenamiento y configuracion estan documentados.
- Mejora de pipelines de fact-checking automatico: al aumentar la PRAUC en +0,0145, reduce falsos positivos en la deteccion, lo que es critico en aplicaciones donde marcar incorrectamente una afirmacion como alucinada tiene coste.

## Benchmarks y rendimiento

La model card reporta metricas de deteccion de alucinaciones por declaracion sobre el split de prueba de BTProp (6 datasets, n=2.225 afirmaciones compartidas), con recuperacion, juzgado y agregacion fijos para que solo varie el generador:

| Metrica | Qwen3-8B sin entrenar | Este modelo | Este modelo + blend |
|---|---|---|---|
| AUROC | 0,8228 | 0,8262 | 0,8283 |
| PRAUC | 0,7580 | 0,7725 | 0,7741 |
| Accuracy | 76,54 | 77,44 | 77,35 |
| BestAcc | 76,99 | 77,53 | 77,35 |
| Variantes por afirmacion | 2,92 | 2,98 | - |

La mejora principal esta en PRAUC (+0,0145), cuatro veces mayor que la de AUROC (+0,0034). No se han publicado resultados en benchmarks generales como MMLU o HumanEval, ya que el modelo no esta disenado para tareas genericas.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16 se necesitan aproximadamente 16 GB (8B parametros x 2 bytes). Con cuantizacion a 8 bits bastarian unos 8 GB, y a 4 bits unos 4-5 GB, aunque no se proporcionan pesos cuantizados en el repo.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) para ejecutar el pipeline completo con el juez y el agregador. Una GPU con 16 GB puede cargar el modelo en FP16.
- Si cabe en consumer GPU: si, en tarjetas de 16 GB o mas (RTX 4080, 4090, etc.) con FP16; con cuantizacion podria ejecutarse en GPUs de 8 GB.
- Opciones de despliegue: al ser un modelo safetensors estandar, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se menciona compatibilidad con Ollama.
- Latencia y throughput: no disponible. Dado el tamano de 8B, en una A100 se esperan decenas de tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | 32K | Apache 2.0 | LLM general con modo thinking |
| btprop-rl-w26-qwen3-8b (este) | 8B | 32K | Apache 2.0 | Generador de parafrasis para deteccion de alucinaciones |
| RyanFoxW/Qwen3-8B-BTProp-mainmod1verify-SFT | 8B | 32K | Apache 2.0 | Generacion de arboles de creencia para BTProp (distilado de Qwen3.5-397B) |

No hay otros modelos publicos comparables en la misma tarea especifica (generador de variantes para deteccion de alucinaciones). La comparativa mas directa es contra el Qwen3-8B sin entrenar, que es el punto de partida y el baseline en los benchmarks.

## Limitaciones y advertencias

- No es un modelo de proposito general: fuera del pipeline BTProp solo reescribe frases, sin capacidades de razonamiento, codigo o dialogo.
- No es un verificador de hechos autonomo: depende del juez congelado y del agregador HMM para producir una decision final.
- Riesgo de alucinacion en las propias parafrasis: aunque el entrenamiento busca preservar el contenido veritativo, no hay garantia absoluta de que las variantes no introduzcan cambios semanticos.
- Sesgos no documentados: no se han publicado analisis de sesgo para este fine-tune especifico.
- Limitaciones de idioma: no se especifican idiomas soportados; el modelo base Qwen3-8B es multilingue, pero el fine-tune podria degradar el rendimiento en idiomas poco representados en los datos de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo esta disenado para un pipeline concreto; su uso fuera de ese contexto no esta soportado.
- Dependencia de la configuracion de entrenamiento: la mejora reportada depende de la evidencia filtrada dentro del bucle de busqueda; replicar el pipeline requiere seguir esa configuracion exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanFoxW/btprop-rl-w26-qwen3-8b
- Repositorio de codigo BTProp: https://github.com/BENGAL-UCSB/BTProp (rama `layer1-v2-RL`)
- Modelo relacionado (tree-gen SFT): https://huggingface.co/RyanFoxW/Qwen3-8B-BTProp-mainmod1verify-SFT
- Paper tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
