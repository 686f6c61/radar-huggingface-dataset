# mradermacher/AgentMercury-Qwen3.5-35B-A3B-i1-GGUF

## Resumen

AgentMercury-Qwen3.5-35B-A3B-i1-GGUF es una cuantización GGUF del modelo AgentMercury-Qwen3.5-35B-A3B, publicada por el usuario mradermacher en HuggingFace. El modelo base, desarrollado por Minbyul, es una variante ajustada del Qwen3.5-35B-A3B de Alibaba, un modelo multimodal de tipo mixture-of-experts (MoE) con 35.000 millones de parámetros totales y 3.000 millones activos por token. Esta versión concreta se distribuye únicamente en formato GGUF, optimizado para inferencia en CPU y GPU con llama.cpp, Ollama u otros motores compatibles.

La relevancia de este modelo radica en su eficiencia: al activar solo 3B parámetros por token, ofrece un rendimiento comparable a modelos mucho más grandes (hasta 6 veces su tamaño, según la documentación de Qwen3.5) con un coste computacional reducido. La cuantización i1 (probablemente con imatrix) permite ejecutarlo en hardware de consumo, lo que lo hace atractivo para despliegues locales y aplicaciones de producción con requisitos moderados de VRAM. El nombre "AgentMercury" sugiere un fine-tuning orientado a tareas de agente, aunque no se detalla en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con gated delta networks (modelo base Qwen3.5-35B-A3B) |
| Parametros totales | 34.660.610.688 (35B) |
| Parametros activos | 3B (aproximadamente, segun documentacion de Qwen3.5) |
| Longitud de contexto | no disponible (el modelo base Qwen3.5 soporta contexto largo, pero no se especifica) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 es multilingue, pero no se detalla) |
| Licencia | no disponible (el repo no especifica; el modelo base Qwen3.5 usa Apache 2.0, pero no se confirma para esta variante) |
| Formato de pesos | GGUF (safetensors original convertido a GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B emplea una arquitectura MoE con "gated delta networks", una innovación reciente que combina mecanismos de atención con actualizaciones delta en las puertas del mezclador de expertos. Esta arquitectura permite activar solo 3B de los 35B parámetros por token, reduciendo drásticamente el coste computacional en inferencia sin sacrificar capacidad de razonamiento. El modelo es multimodal (visión y lenguaje) y soporta tool use, según la documentación oficial de Qwen3.5.

La variante AgentMercury, creada por Minbyul, es un fine-tuning del modelo base orientado a tareas de agente, aunque no se dispone de detalles sobre el dataset de entrenamiento, el método de ajuste (RLHF, DPO, etc.) ni el número de tokens utilizados. La cuantización GGUF realizada por mradermacher utiliza la técnica imatrix (importance matrix) para mejorar la precisión de los pesos cuantizados, y se generan múltiples niveles de cuantización para adaptarse a diferentes capacidades de hardware.

## Capacidades

- Generacion de texto y razonamiento multimodal (vision y lenguaje), heredado del modelo base Qwen3.5.
- Soporte de tool calling / function calling, lo que permite integrarlo en pipelines de agentes.
- Capacidades de agente y razonamiento multi-paso, reforzadas por el fine-tuning AgentMercury.
- Multilingue (idiomas no especificados, pero el modelo base soporta múltiples lenguas).
- Eficiencia computacional: al activar solo 3B parámetros, es adecuado para despliegues con recursos limitados.
- Formato GGUF compatible con llama.cpp, Ollama, LM Studio y otros motores de inferencia local.

## Casos de uso

- Asistentes virtuales locales: el modelo puede ejecutarse en una GPU de consumo (por ejemplo, RTX 3060 o superior) con cuantizaciones Q4_K_M o inferiores, ofreciendo respuestas conversacionales fluidas sin depender de la nube.
- Automatizacion de atencion al cliente: gracias al soporte de tool calling y al contexto largo (si se confirma), puede gestionar conversaciones multi-turno, consultar bases de datos o APIs externas y escalar a sistemas de tickets.
- Generacion de codigo asistida: el modelo base Qwen3.5 es competente en tareas de programacion; esta variante puede integrarse en IDEs o pipelines de CI/CD para sugerencias de codigo y revision automatica.
- Agentes autonomos de navegacion web: con su capacidad de razonamiento multi-paso y tool use, puede planificar y ejecutar acciones en entornos simulados o reales (por ejemplo, rellenar formularios, extraer datos).
- Analisis de documentos con vision: al ser multimodal, puede procesar imagenes, diagramas o capturas de pantalla junto con texto, util para automatizar la extraccion de informacion de informes escaneados.
- Prototipado rapido de aplicaciones de IA: al ser un modelo GGUF ligero (las cuantizaciones mas pequeñas ocupan menos de 10 GB), es ideal para desarrolladores que necesitan probar funcionalidades de agente sin infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.5-35B-A3B, segun la documentacion de LM Studio, "supera a modelos de generaciones anteriores mas de 6 veces su tamaño", pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) para esta variante AgentMercury ni para la cuantizacion GGUF. Se recomienda consultar la ficha del modelo base en el repositorio oficial de Qwen para datos comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. Para un modelo de 35B con 3B activos, las cuantizaciones Q4_K_M ocupan aproximadamente 20-22 GB, Q5_K_M unos 25 GB, y las mas agresivas (Q2_K, IQ1_M) pueden bajar de 10 GB. Las cuantizaciones IQ (IQ2_M, IQ3_XXS) ofrecen buena relacion calidad-tamano.
- GPU recomendadas: para cuantizaciones de 4 bits o inferiores, una RTX 3060 12GB o RTX 4060 Ti 16GB puede ejecutar el modelo con offloading parcial. Para Q6_K o Q8, se recomienda una GPU con 24 GB o mas (RTX 3090, RTX 4090, A100).
- Compatibilidad con consumer GPU: si, especialmente con cuantizaciones Q3_K_M o inferiores y usando llama.cpp con offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (TGI) con soporte GGUF, y vLLM (aunque vLLM prefiere safetensors, puede usar GGUF con ciertas configuraciones).
- Latencia y throughput: no disponibles. Al ser un MoE con 3B activos, el throughput deberia ser notablemente superior al de un modelo denso de 35B, pero no se han publicado mediciones para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| AgentMercury-Qwen3.5-35B-A3B (este) | 35B | 3B | no disponible | no disponible | GGUF |
| Qwen3.5-35B-A3B (original) | 35B | 3B | no disponible (largo, segun documentacion) | Apache 2.0 (segun repos oficiales) | safetensors, GGUF |
| Qwen3.5-35B-A3B-Unredacted-MAX (variante abliterada) | 35B | 3B | no disponible | Apache 2.0 (segun repo) | GGUF, safetensors |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de modelos MoE similares (como DeepSeek-V3-Lite o Mixtral 8x7B) en la informacion proporcionada. La principal diferencia entre las variantes radica en el fine-tuning (AgentMercury vs. Unredacted-MAX) y en la cuantizacion, no en la arquitectura subyacente.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos especificos, pero al ser un fine-tuning de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: inherente a todos los modelos de lenguaje; no se han publicado evaluaciones especificas para esta variante.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada; se recomienda verificar en el modelo base antes de usarlo en aplicaciones que requieran ventanas largas.
- Restricciones de licencia: la licencia no esta indicada en el repo; aunque el modelo base usa Apache 2.0, la variante AgentMercury podria tener condiciones adicionales. Contactar con el autor antes de uso comercial.
- La cuantizacion GGUF puede degradar ligeramente la calidad en comparacion con los pesos en bf16, especialmente en tareas de razonamiento complejo o generacion de codigo.
- El nombre "AgentMercury" sugiere un fine-tuning especifico, pero no hay documentacion publica sobre su rendimiento en tareas de agente; validar en el caso de uso concreto.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/AgentMercury-Qwen3.5-35B-A3B-i1-GGUF
- Modelo base (Minbyul): https://huggingface.co/Minbyul/AgentMercury-Qwen3.5-35B-A3B
- Variante Unredacted-MAX (referencia): https://huggingface.co/mradermacher/Qwen3.5-35B-A3B-Unredacted-MAX-i1-GGUF
- Cuantizacion GGUF de unsloth para Qwen3.5-35B-A3B: https://huggingface.co/unsloth/Qwen3.5-35B-A3B-GGUF
- Ficha del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-35b-a3b
- Guia de uso de Qwen3.5 en vLLM: https://docs.vllm.ai/projects/recipes/en/stable/Qwen/Qwen3.5.html
