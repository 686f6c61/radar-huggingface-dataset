# mzio/aprm-sft-snorkel-finance

## Resumen

El modelo `mzio/aprm-sft-snorkel-finance` es un conjunto de adaptadores LoRA (r8_a16) entrenados mediante supervisión fina (SFT) sobre la base `Qwen/Qwen3-4B-Instruct-2507`, como parte del proyecto **Act-PRM**. Este proyecto investiga la inferencia de pensamientos latentes (thoughts) detrás de demostraciones que contienen únicamente acciones, mediante un algoritmo de maximización de expectativas (EM) offline. El objetivo es mejorar la capacidad de los agentes para razonar y actuar en entornos de herramientas financieras, específicamente sobre el subconjunto `snorkel_finance_split` del benchmark tau2-bench.

El repositorio contiene varias variantes de adaptadores: una línea base `actions_only`, una variante con pensamientos de experto (`expert_thoughts`, considerada oracle) y variantes con pensamientos inferidos por Act-PRM (`thoughts_{policy,base}[_last]`), cada una en dos regímenes: con observaciones ocultas y con contexto completo. El tamaño del repositorio es de 1.1 GB, lo que sugiere que contiene los pesos de los adaptadores para todas las variantes, aunque no se especifica el tamaño individual de cada uno.

La relevancia de este modelo radica en que aborda un problema clave en el entrenamiento de agentes: la falta de datos de razonamiento intermedio (thoughts) en las demostraciones. Al inferir estos pensamientos de forma automática, se puede mejorar el rendimiento de los agentes sin necesidad de anotación humana experta, un avance significativo para el desarrollo de sistemas de IA financiera más autónomos y robustos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapters sobre Qwen3-4B-Instruct-2507 (Transformer) |
| Parametros totales | no disponible (base: 4B; adaptadores LoRA r=8, a=16) |
| Parametros activos | no disponible (solo LoRA, no MoE) |
| Longitud de contexto | no disponible (base Qwen3-4B-Instruct-2507: 256K tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (base Qwen3-4B-Instruct-2507: multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3-4B-Instruct-2507, sobre la cual se aplican adaptadores LoRA de bajo rango (r=8, a=16). El entrenamiento es una supervisión fina (SFT) sobre el conjunto de datos `snorkel_finance_split` de tau2-bench, que contiene trazas de agentes interactuando con herramientas financieras.

La innovación clave es el método **Act-PRM**: un algoritmo de EM offline que, para cada par estado-accion (s, x) en las trazas, muestrea G=4 pensamientos candidatos z, los puntúa mediante la verosimilitud de la acción con penalización por longitud, y selecciona el mejor. Estos pensamientos inferidos se usan luego como supervisión adicional en el SFT, ya sea como pensamientos de política (policy), pensamientos base (base) o como pensamiento final (`_last`), y en dos regímenes: con observaciones ocultas (hide-observations) o con contexto completo. La variante `expert_thoughts` utiliza pensamientos de expertos reales como referencia (oracle).

## Capacidades

- Razonamiento financiero: el modelo está especializado en tareas de QA financiera que requieren razonamiento multi-paso y uso de herramientas.
- Tool calling: las trazas de tau2-bench implican el uso de herramientas financieras, por lo que el adaptador ha sido entrenado para llamar a funciones de forma efectiva.
- Razonamiento multi-step: la inferencia de pensamientos latentes busca mejorar la capacidad de razonamiento intermedio del agente.
- Capacidades multilingües: heredadas de la base Qwen3-4B-Instruct-2507, que soporta múltiples idiomas.
- Ventana de contexto larga: la base soporta hasta 256K tokens de contexto, lo que permite procesar documentos financieros extensos.

## Casos de uso

- Análisis de informes financieros: el modelo puede procesar informes anuales, trimestrales o notas a los estados financieros para extraer métricas clave y responder preguntas específicas sobre ellos, gracias a su entrenamiento en el benchmark SnorkelFinance.
- Automatización de análisis de inversiones: agentes que consultan bases de datos financieras y calculan ratios o indicadores mediante herramientas, reduciendo el trabajo manual de analistas.
- Verificación de datos financieros: el modelo puede contrastar datos de diferentes fuentes (informes, bases de datos) y detectar inconsistencias o errores.
- Asistente de auditoría: el agente puede navegar por documentos financieros y extraer información relevante para auditorías internas o externas.
- Generación de informes resumidos: a partir de una pregunta financiera, el modelo puede planificar y ejecutar consultas a herramientas, y generar un resumen razonado de los resultados.
- Entrenamiento de agentes: la metodología Act-PRM y los adaptadores publicados pueden servir como punto de partida para futuros trabajos de SFT en otros dominios de herramientas.

## Benchmarks y rendimiento

El modelo card incluye una evaluación held-out sobre la acción única (next-action prediction), que mide la capacidad del modelo para predecir la siguiente acción en una traza:

| Variante | Action-only PPL | Action-acc |
|---|---|---|
| actions_only_v3_lr3e_3_nb150_heldout | 1.928 | 0.841 |

No se proporcionan benchmarks comparativos con otros modelos en la información disponible. La métrica de PPL más baja y mayor precisión indican un mejor ajuste a la distribución de acciones del conjunto de datos.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 4B parámetros, la inferencia puede ejecutarse en GPUs consumer con al menos 8 GB de VRAM en cuantización de 4 bits, o 16 GB en precisión completa (FP16).
- GPU recomendadas: NVIDIA RTX 3090/4090 para inferencia en FP16, o GPUs de menor capacidad con cuantización (por ejemplo, RTX 4060 con 8 GB para 4-bit).
- Despliegue: compatible con frameworks que soporten LoRA y modelos de HuggingFace, como vLLM, llama.cpp, Ollama o TGI, aunque el formato de pesos safetensors y la naturaleza de LoRA requieren un servidor que aplique los adaptadores sobre la base.
- Latencia: no disponible, pero al ser un modelo de 4B parámetros, la inferencia es relativamente rápida en GPUs modernas (típicamente < 50 tokens/s en una RTX 4090 con cuantización).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en el ámbito de agentes financieros con pensamientos inferidos. Sin embargo, se puede comparar con la base Qwen3-4B-Instruct-2507 y con otros modelos de razonamiento financiero como FinGPT o BloombergGPT (aunque estos son de mayor tamaño):

| Modelo | Params | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | 4B | 256K | Apache 2.0 | Modelo base multilingüe, sin ajuste fino para finanzas |
| mzio/aprm-sft-snorkel-finance | 4B + LoRA | 256K | no disponible | Adaptado para agentes financieros con pensamientos inferidos |
| FinGPT | 7B-13B | 4K-8K | MIT | Modelo de código abierto para finanzas, sin tool calling |

## Limitaciones y advertencias

- Sesgos: al estar entrenado sobre un conjunto de datos financiero específico, puede presentar sesgos hacia las prácticas y terminología de las finanzas estadounidenses (región:us).
- Alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en contextos de alta incertidumbre o con herramientas que devuelven errores.
- Limitaciones de idioma: aunque la base es multilingüe, el ajuste fino se ha realizado con datos en inglés (benchmark de SnorkelFinance), por lo que su rendimiento en español u otros idiomas puede ser inferior.
- Licencia: no disponible. No se puede confirmar si es de uso libre, comercial o restringido. Se recomienda contactar con el autor antes de usar en producción.
- Dependencia de la base: el adaptador solo funciona sobre la base exacta `Qwen/Qwen3-4B-Instruct-2507`, por lo que no es un modelo autónomo.
- Tamaño del repositorio: 1.1 GB, que incluye múltiples variantes; el usuario debe seleccionar la variante y régimen adecuados para su caso de uso.

## Enlaces

- Modelo: https://huggingface.co/mzio/aprm-sft-snorkel-finance
- Dataset de pensamientos inferidos: https://huggingface.co/datasets/mzio/aprm-thought-generations-snorkel-finance
- Dataset de SFT generado: https://huggingface.co/datasets/mzio/aprm-sft_genthinkact-ENact_prm_snorkel_finance_fs1-GEaprm_qwen3_ap-SE42-REv10-ap1-b019
- Benchmark SnorkelFinance: https://snorkel.ai/leaderboard/snorkel-finance/
- Benchmark Finance Reasoning: https://snorkel.ai/leaderboard/finance-reasoning/
