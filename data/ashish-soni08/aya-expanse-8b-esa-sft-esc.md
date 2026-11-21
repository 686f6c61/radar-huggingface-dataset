# ashish-soni08/aya-expanse-8b-esa-sft-esc

## Resumen

aya-expanse-8b-esa-sft-esc es un ajuste fino (SFT) del modelo CohereLabs/aya-expanse-8b, publicado por el usuario ashish-soni08 como artefacto de investigación para el hackathon Lexsi AI Safety & Alignment (Track 3). El objetivo declarado es construir un agente "escalation-safe" que use herramientas, es decir, un modelo entrenado para no escalar privilegios ni ejecutar acciones peligrosas cuando opera con tool calling. Forma parte de una comparativa de diseños de recompensa en la que algunos modelos de la serie son deliberadamente propensos a la escalada como líneas base, y por tanto no están pensados para despliegue.

El modelo hereda la arquitectura y el tamaño del base: 8.028.033.024 parámetros (unos 8.000 millones), pesos en safetensors y un repositorio de 16,1 GB. El entrenamiento se realizó sobre el checkpoint aya-expanse-8b, un modelo multilingüe de Cohere Labs con cobertura de 23 idiomas, aunque la model card de este ajuste no detalla la composición del dataset de SFT ni los hiperparámetros empleados.

La relevancia del modelo es fundamentalmente metodológica: sirve para estudiar cómo distintas funciones de recompensa afectan a la seguridad de un agente con acceso a herramientas. No es un modelo de producción: la propia model card lo califica de artefacto de investigación, advierte que la ficha completa se publicará cuando terminen los experimentos y no ofrece datos de benchmarks ni de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de CohereLabs/aya-expanse-8b; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 8.028.033.024 |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en la model card de este ajuste; el base aya-expanse-8b es multilingue (23 idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste supervisado (SFT) del checkpoint CohereLabs/aya-expanse-8b, por lo que conserva la arquitectura transformer decoder-only del base con aproximadamente 8.000 millones de parámetros. La model card no especifica la arquitectura interna (número de capas, dimensiones, mecanismo de atención) ni la longitud de contexto efectiva; esos datos habría que consultarlos en la ficha del modelo base.

El entrenamiento descrito es una etapa 2 de SFT orientada a seguridad de agentes con uso de herramientas, en el marco del Track 3 del hackathon Lexsi AI Safety & Alignment. La model card no indica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas posteriores de RLHF o DPO. El autor enmarca el modelo dentro de una comparación de diseños de recompensa, con líneas base deliberadamente propensas a la escalada, lo que sugiere que el entrenamiento incorpora señales específicas para penalizar comportamientos de escalada de privilegios en entornos de tool calling.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base aya-expanse-8b.
- Uso de herramientas (tool calling / function calling), eje central del ajuste: el modelo está entrenado para operar como agente con acceso a herramientas.
- Comportamiento "escalation-safe": el objetivo del ajuste es evitar que el agente escale privilegios o ejecute acciones fuera del alcance autorizado durante la interacción con herramientas.
- Capacidades multilingües: no documentadas en esta model card; el base aya-expanse-8b cubre 23 idiomas, pero el ajuste puede haber alterado ese perfil.
- No se documentan capacidades de visión, audio, modo thinking explícito ni decodificación especulativa en la información disponible.

## Casos de uso

- Investigación en seguridad de agentes: el modelo sirve como sujeto experimental para medir la tasa de escalada de privilegios en tareas con tool calling, comparándolo con las líneas base propensas a la escalada del mismo estudio.
- Evaluación de diseños de recompensa: permite contrastar cómo distintas funciones de recompensa durante el SFT modifican el comportamiento del agente en escenarios de riesgo, dentro de la comparativa del hackathon.
- Reproducción de experimentos: el repositorio de código asociado (lexsi-escalation-safe-agent) permite replicar el pipeline de entrenamiento y evaluación con este checkpoint de etapa 2.
- Análisis de robustez en entornos simulados: útil para estudiar la resistencia del agente a instrucciones que intentan ampliar sus permisos, antes de trasladar conclusiones a modelos desplegables.
- Docencia y formación en alineación: ejemplo práctico de ajuste SFT sobre un modelo multilingüe de 8B para modificar conducta en agentes.
- No se recomienda su uso en atención al cliente, generación de código en producción ni ningún despliegue real: la model card lo define como artefacto de investigación y advierte que parte de la serie son líneas base deliberadamente inseguras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 18-24 GB como mínimo.
- Cuantización a 8 bits: en torno a 8-9 GB de pesos; a 4 bits: en torno a 4-5 GB, aunque el autor no publica variantes cuantizadas y habría que generarlas.
- GPU recomendadas: A100 40/80 GB o H100 para experimentos con lotes grandes y contexto largo; una RTX 4090 (24 GB) es suficiente para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en BF16, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: al publicarse solo safetensors, los caminos naturales son Transformers, vLLM y TGI; para llama.cpp/Ollama habría que convertir los pesos a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| aya-expanse-8b-esa-sft-esc | 8,03 B | no disponible | no disponible | SFT para seguridad de agentes con herramientas (investigación) |
| CohereLabs/aya-expanse-8b (base) | ~8 B | no disponible en esta ficha | no disponible en esta ficha | Modelo multilingüe generalista de Cohere Labs |
| Otros modelos de la serie Lexsi (líneas base) | ~8 B | no disponible | no disponible | Baselines deliberadamente propensos a la escalada, según la model card |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente que es un modelo experimental de etapa 2 y que la ficha completa llegará cuando terminen los experimentos.
- Riesgo de comportamiento inseguro: parte de la serie son líneas base deliberadamente propensas a la escalada; hay que verificar a qué variante corresponde este checkpoint antes de cualquier uso.
- Sin datos de licencia: no se especifica licencia, por lo que no puede asumirse permiso para uso comercial.
- Sin datos de benchmarks, sesgos, tasas de alucinación ni evaluación multilingüe publicados.
- Contexto, idiomas efectivos tras el ajuste y composición del dataset de SFT no documentados.
- Adopción prácticamente nula (4 descargas, 0 likes) y creado en noviembre de 2026: no hay evidencia de uso en producción ni validación externa.
- No apto para despliegue en producción sin una evaluación de seguridad propia y sin una licencia clara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashish-soni08/aya-expanse-8b-esa-sft-esc
- Modelo base: https://huggingface.co/CohereLabs/aya-expanse-8b
- Repositorio de código y resultados: https://github.com/Ashish-Soni08/lexsi-escalation-safe-agent
