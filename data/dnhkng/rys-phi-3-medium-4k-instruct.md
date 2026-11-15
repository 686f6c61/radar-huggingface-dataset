# dnhkng/RYS-Phi-3-medium-4k-instruct

## Resumen

RYS-Phi-3-medium-4k-instruct es una variante optimizada del modelo Phi-3-medium-4k-instruct de Microsoft, publicada por David Noel Ng (dnhkng) en agosto de 2024. El modelo parte de los pesos originales de Phi-3-medium y aplica una tecnica de optimizacion denominada "LLM Neuroanatomy", descrita por el autor como un metodo que mejora el rendimiento en benchmarks sin modificar un solo peso del modelo base. El resultado es un modelo de 17.700 millones de parametros con licencia MIT.

La relevancia de esta ficha reside en que ejemplifica una linea de investigacion poco convencional: la optimizacion del comportamiento del modelo mediante tecnicas de analisis y reorganizacion interna (presumiblemente intervenciones sobre activaciones, capas o flujos de informacion) en lugar del reentrenamiento o el ajuste fino tradicional. El autor reporta mejoras en el Open LLM Leaderboard manteniendo intactos los pesos, lo que resulta tecnicamente interesante para la comunidad investigadora.

El modelo conserva la arquitectura y el contexto original de Phi-3-medium (4.096 tokens) y esta orientado a generacion de texto, razonamiento e instrucciones. Su licencia MIT facilita el uso comercial, aunque las capacidades reales y la naturaleza exacta de la optimizacion deben evaluarse con cautela dado que la documentacion tecnica es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3-medium, con codigo personalizado `custom_code`) |
| Parametros totales | 17.709.009.920 (~17,7 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (segun el nombre del modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo se basa en Phi-3-medium-4k-instruct de Microsoft, un transformer decoder-only denso de aproximadamente 14 mil millones de parametros segun la documentacion original de Microsoft; sin embargo, el recuento real de safetensors de este repositorio asciende a 17.709.009.920 parametros, lo que sugiere una discrepancia respecto a la cifra oficial del modelo base o la inclusion de componentes adicionales. La innovacion principal de esta variante no reside en el entrenamiento, sino en la tecnica de optimizacion "LLM Neuroanatomy" descrita por el autor, que segun la model card permite mejorar los resultados en el Open LLM Leaderboard sin cambiar ningun peso.

No se dispone de informacion detallada sobre el proceso de entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion proporcionada. El autor indica que el modelo requiere `trust_remote_code=True` para cargarse, lo que implica la presencia de codigo personalizado en el repositorio, presumiblemente relacionado con la implementacion de la tecnica de optimizacion. No se documentan innovaciones como decodificacion especulativa o atencion lineal en el material disponible.

## Capacidades

- Generacion de texto e instrucciones en formato conversacional multi-turno.
- Razonamiento de sentido comun y tareas de conocimiento general (evaluado en MMLU-PRO, BBH).
- Razonamiento matematico basico e intermedio (evaluado en MATH Lvl 5).
- Seguimiento de instrucciones con formato estricto (evaluado en IFEval).
- Razonamiento cientifico de nivel avanzado (evaluado en GPQA).
- Razonamiento multietapa (evaluado en MuSR).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-step: no documentadas explicitamente.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- **Asistente conversacional especializado**: el modelo puede gestionar dialogos multi-turno dentro de su ventana de 4.096 tokens, adecuado para chatbots de soporte tecnico o atencion al cliente con conversaciones de extension moderada.
- **Generacion de documentacion tecnica**: su capacidad de seguir instrucciones (IFEval 43,91) permite redactar guias, READMEs y documentacion estructurada a partir de especificaciones.
- **Resolucion de problemas matematicos de nivel educativo**: con un 11,78 en MATH Lvl 5, es util para tutoria automatizada en matematicas de secundaria y primeros cursos universitarios.
- **Prototipado rapido de pipelines de NLP**: al tener licencia MIT y pesos en safetensors, se puede integrar en entornos de investigacion y desarrollo sin restricciones comerciales.
- **Investigacion sobre optimizacion de modelos**: el modelo sirve como caso de estudio reproducible de la tecnica "LLM Neuroanatomy", util para investigadores que estudian intervenciones sin reentrenamiento.
- **Evaluacion comparativa en leaderboards**: adecuado como referencia en experimentos que comparan variantes optimizadas frente al modelo base original.
- **Generacion de respuestas a preguntas de conocimiento general**: con 42,74 en MMLU-PRO, puede emplearse en sistemas de QA de dominio general con supervision humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (Open LLM Leaderboard, no verificados de forma independiente):

| Benchmark | Configuracion | Metrica | Valor |
|---|---|---|---|
| IFEval | 0-shot | strict accuracy | 43,91 |
| BBH | 3-shot | normalized accuracy | 46,75 |
| MATH Lvl 5 | 4-shot | exact match | 11,78 |
| GPQA | 0-shot | acc_norm | 13,98 |
| MuSR | 0-shot | acc_norm | 11,09 |
| MMLU-PRO | 5-shot | accuracy | 42,74 |

No se dispone de comparaciones directas con el modelo base Phi-3-medium-4k-instruct en la informacion proporcionada, por lo que no es posible cuantificar la mejora atribuida a la tecnica de optimizacion.

## Requisitos de hardware

- **VRAM estimada en FP16/BF16**: aproximadamente 35,4 GB (tamano del repositorio), lo que requiere una GPU con al menos 40 GB (A100 40GB, A6000, H100).
- **VRAM estimada en cuantizacion de 8 bits**: aproximadamente 18-20 GB, viable en RTX 4090 (24 GB) o A5000.
- **VRAM estimada en cuantizacion de 4 bits**: aproximadamente 10-12 GB, viable en RTX 3080/4080 (16 GB) o RTX 4070 Ti.
- **GPU recomendadas**: A100 40/80 GB, H100, RTX 4090 para cuantizaciones de 8 bits o inferiores.
- **Cabe en GPU de consumo**: si, en RTX 4090 con cuantizacion de 8 bits o 4 bits; en RTX 3090 (24 GB) con cuantizacion de 8 bits.
- **Opciones de despliegue**: Transformers con `trust_remote_code=True` (requerido); vLLM, llama.cpp, Ollama y TGI son opciones potenciales, pero no se confirma compatibilidad en la informacion disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RYS-Phi-3-medium-4k-instruct | ~17,7 B | 4.096 | MIT | Hugging Face |
| Phi-3-medium-4k-instruct (Microsoft) | ~14 B (segun documentacion oficial) | 4.096 | MIT | Hugging Face |
| Mistral-7B-Instruct | ~7,2 B | 32.768 | Apache 2.0 | Hugging Face |
| Llama-3-8B-Instruct | ~8 B | 8.192 | Llama 3 Community License | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados en la informacion proporcionada; al derivar de Phi-3-medium, hereda los sesgos del modelo base y de sus datos de entrenamiento.
- **Riesgo de alucinacion**: no cuantificado; como todo modelo generativo, puede producir informacion incorrecta con aparente seguridad, especialmente en dominios especializados.
- **Limitacion de contexto**: 4.096 tokens, insuficiente para tareas que requieran documentos largos o conversaciones extensas.
- **Idiomas**: no se especifican los idiomas soportados; el modelo base Phi-3 esta optimizado principalmente para ingles, por lo que el rendimiento en castellano puede ser inferior.
- **Restricciones de licencia**: licencia MIT, que permite uso comercial sin restricciones significativas, pero el modelo base Phi-3-medium tambien es MIT, por lo que no hay conflicto conocido.
- **Codigo personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; debe auditarse antes de usarlo en produccion.
- **Verificacion de benchmarks**: los resultados del leaderboard estan marcados como no verificados (`verified: false`), por lo que deben tomarse con cautela.
- **Documentacion limitada**: la model card no detalla el proceso de optimizacion de forma reproducible ni las condiciones exactas de evaluacion.
- **Discrepancia de parametros**: el recuento de safetensors (17,7 B) difiere de la cifra oficial de Phi-3-medium (~14 B), lo que puede afectar a las estimaciones de hardware.

## Enlaces

- [Hugging Face: dnhkng/RYS-Phi-3-medium-4k-instruct](https://huggingface.co/dnhkng/RYS-Phi-3-medium-4k-instruct)
- [Articulo tecnico: LLM Neuroanatomy: How I Topped the LLM Leaderboard Without Changing a Single Weight](https://dnhkng.github.io/posts/rys/)
- [Open LLM Leaderboard (consulta del modelo)](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard?query=dnhkng/RYS-Phi-3-medium-4k-instruct)
- [appliedAI Institute](https://www.appliedai-institute.de/en/)
- [GitHub: GlaDOS (proyecto del autor)](https://github.com/dnhkng/GlaDOS)
- [LinkedIn del autor: Dr David Noel Ng](https://www.linkedin.com/in/dnhkng)
