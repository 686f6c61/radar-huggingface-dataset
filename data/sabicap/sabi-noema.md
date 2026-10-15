# sabicap/sabi-noema

## Resumen

Sabi-Noema es un ajuste fino (finetune) del modelo Qwen/Qwen3.8-27B desarrollado por el usuario sabicap, orientado especificamente a cargas de trabajo agenticas: uso de herramientas, ejecucion de tareas multi-paso, interaccion con terminal y resolucion de tareas de ingenieria de software. Se distribuye bajo licencia Apache 2.0 y esta publicado en HuggingFace con pesos en safetensors, formato compatible con la libreria transformers.

El modelo mantiene la arquitectura del base: aproximadamente 27.356 millones de parametros en un diseno denso hibrido (combinacion de atencion completa y atencion lineal, segun la etiqueta `hybrid-attention`), con una longitud de contexto declarada de 262.144 tokens. Los pesos en BF16 ocupan unos 55 GB, lo que lo situa en el rango de despliegue en una unica GPU de 80 GB.

Su relevancia actual radica en dos ejes: por un lado, mejora las cifras del modelo base en benchmarks de agentes y terminal (Terminal-Bench 2.1: 76,0 % frente a 73,0 %; τ³-bench: 259/278 frente a 220/278) sin degradar capacidades retenidas como LiveCodeBench v6, GPQA-Diamond o MMLU-Pro; por otro, reduce de forma notable el coste de inferencia, con una mediana de 29,3K tokens de salida por tarea en Terminal-Bench frente a los 65,3K del base. Adicionalmente, el autor publica una variante con atencion latente multi-cabeza (Sabi-Noema-MLA) pensada para servir muchas sesiones largas por GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido (atencion completa + atencion lineal), segun la etiqueta `hybrid-attention` |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible. Se distribuyen pesos BF16; el autor indica compatibilidad con conversion a GGUF mediante llama.cpp, sin detallar los tipos concretos |
| Idiomas soportados | No disponible. No se especifica en la model card; el modelo base Qwen3.8-27B es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, ~55 GB); repo de 54,7 GB |

## Arquitectura y entrenamiento

Sabi-Noema parte de Qwen/Qwen3.8-27B y se entrena mediante aprendizaje por refuerzo (etiquetas `reinforcement-learning` y `agentic`) usando exclusivamente entornos RL de codigo abierto. No se detalla en la informacion disponible el volumen de tokens, la composicion del dataset ni si hubo fases de SFT, DPO o RLHF adicionales; la model card solo explicita la naturaleza RL del entrenamiento y el objetivo de mejorar simultaneamente capacidad agentica y eficiencia de razonamiento.

La arquitectura es densa e hibrida: combina mecanismos de atencion con bloques de atencion lineal, lo que reduce el coste de memoria de estado en contextos largos. Esto tiene una consecuencia practica documentada por el autor: en vLLM 0.31.0 hay que limitar `--max-num-seqs` a 32, porque el valor por defecto de 1024 excede los bloques de estado de atencion lineal disponibles en una sola GPU. Existe una variante adicional, Sabi-Noema-MLA, que incorpora atencion latente multi-cabeza para maximizar el numero de sesiones largas concurrentes por GPU. El modelo soporta modo no-thinking mediante `chat_template_kwargs={"enable_thinking": false}`, aunque el autor aclara que ese modo no fue evaluado.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno con contexto de hasta 262.144 tokens.
- Ejecucion de tareas de terminal y automatizacion de shell: 76,0 % en Terminal-Bench 2.1.
- Ingenieria de software y resolucion de issues en repositorios reales: 47,5 % en DeepSWE.
- Tool calling / function calling en formato XML de Qwen3.8, con soporte nativo en vLLM mediante `--enable-auto-tool-choice --tool-call-parser qwen3_xml`.
- Uso de agentes multi-paso en escenarios de negocio: τ³-bench (airline, retail, telecom) con 259/278 tareas y 43,5 % en el subconjunto bancario.
- Integracion con servidores MCP: 48/55 en MCPMark.
- Razonamiento de alta fiabilidad: indice AA-Omniscience de +2,3 y tasa de alucinacion del 15,1 %, frente al 30,4 % del modelo base.
- Capacidades retenidas de codigo y ciencia: LiveCodeBench v6 88,0 %, GPQA-Diamond 90,6 %, MMLU-Pro 85,1 %, AA-LCR 82,3 %, IFBench 80,9 %.
- Eficiencia de tokens: mediana de 29,3K tokens de salida por tarea en Terminal-Bench 2.1 (2,3 veces menos que Qwen3.8-27B) y 82,7K de media en DeepSWE (frente a 118,8K del base).
- Soporte multimodal: la etiqueta de HuggingFace `image-text-to-text` figura entre los tags del repositorio, aunque la model card no detalla capacidades de vision y los benchmarks publicados son exclusivamente de texto y agentes.

## Casos de uso

- Agentes de terminal y automatizacion de DevOps: el modelo esta optimizado para tareas de linea de comandos y alcanza el 76,0 % en Terminal-Bench 2.1, por lo que puede encargarse de diagnosticar fallos, aplicar parches y ejecutar pipelines de despliegue con supervision minima.
- Agentes de codigo en produccion (SWE agents): con 47,5 % en DeepSWE y 88,0 % en LiveCodeBench v6, es adecuado para resolver issues sobre repositorios, abrir pull requests y trabajar integrado en CI/CD mediante tool calling.
- Atencion al cliente automatizada en dominios regulados: los resultados en τ³-bench (airline, retail, telecom) y el 43,5 % en banca indican que puede gestionar conversaciones multi-turno con reglas de negocio estrictas y llamadas a APIs internas.
- Automatizacion de backoffice bancario: el subconjunto bancario de τ³-bench (97 tareas x 5 ejecuciones) mide operaciones con restricciones, escenario tipico de verificacion de datos y tramitacion de incidencias.
- Orquestacion de herramientas via MCP: con 48/55 en MCPMark y 63,9 en BFCL v4 multi-turn, encaja como cerebro de agentes que encadenan decenas de herramientas externas en un mismo flujo.
- Asistentes de documentacion tecnica con contexto largo: los 262.144 tokens permiten cargar repositorios completos, manuales o historiales extensos y responder con trazabilidad sobre el material aportado.
- Sistemas donde la alucinacion es costosa (legal, sanitario, financiero): la tasa del 15,1 % en AA-Omniscience y el indice positivo +2,3 lo hacen preferible a alternativas con tasas del 30 % o superiores, siempre con verificacion humana.
- Despliegue de muchos agentes concurrentes por GPU: la variante Sabi-Noema-MLA, con atencion latente multi-cabeza, esta pensada para sostener sesiones largas simultaneas reduciendo el coste por sesion.

## Benchmarks y rendimiento

Datos publicados por el autor. La tabla original incluye GPT-6 Luna en modo high reasoning como referencia de frontera.

| Benchmark | Sabi-Noema | Qwen3.8-27B | ThinkingCap | Swift 1.5 | Muse Glimmer 30B | GPT-6 Luna, high |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Terminal-Bench 2.1 (%) | **76,0** | 73,0 | 67,8 | 62,9 | 48,3 | 68,5 |
| DeepSWE (%) | 47,5 | 38,5 | 38,9 | 39,8 | 5,3 | **53,1** |
| τ³-bench (/278) | **259** | 220 | 204 | 195 | 219 | 183 |
| τ³-bench banking (%, 97 tareas x 5) | **43,5** | 39,8 | 36,9 | 40,4 | 15,9 | 28,7 |
| ClawEval (/199) | **162** | 151 | 151 | 160 | 153 | 160 |
| BFCL v4 multi-turn | **63,9** | 59,6 | 58,8 | 62,6 | 55,8 | 44,9 |
| MCPMark (/55) | **48** | 36 | 42 | 37 | 32 | 38 |
| AA-Omniscience index | +2,3 | −5,2 | −10,5 | −22,8 | −28,0 | **+5,2** |
| Tasa de alucinacion (%, menor es mejor) | **15,1** | 30,4 | 36,1 | 52,6 | 84,6 | 85,3 |
| LiveCodeBench v6 | 88,0 | **89,7** | 88,9 | 89,1 | 64,0 | 88,0 |
| GPQA-Diamond | **90,6** | 89,2 | 88,0 | 88,6 | 83,5 | 89,4 |
| MMLU-Pro | 85,1 | 85,4 | 85,0 | **85,7** | 84,2 | 83,4 |
| AA-LCR | 82,3 | **83,0** | 82,0 | 82,7 | 81,3 | **83,0** |
| IFBench | 80,9 | 79,5 | 79,7 | **81,1** | 77,0 | 61,0 |
| TB2.1 tokens de salida por tarea (mediana) | 29,3K | 65,3K | 51,0K | 57,1K | **20,6K** | — |
| τ³-bench tokens por conversacion (media) | 3,9K | 4,2K | 3,0K | 3,6K | **2,7K** | — |
| DeepSWE tokens de salida por tarea (media) | **82,7K** | 118,8K | 103,7K | — | — | — |

Condiciones declaradas por el autor: mismos harnesses para todos los modelos; Terminal-Bench 2.1 con la configuracion de Artificial Analysis sobre despliegues H100 TP2 con hasta 8 tareas por servidor (Muse Glimmer en TP1); τ³-bench con simulador de usuario GPT-4.1; DeepSWE sin limite de tokens (ThinkingCap con tope de 3 horas por tarea; se excluyen semillas con fallo de infraestructura contabilizado como fallo del modelo); ClawEval evaluado por el juez LLM del harness. GPT-6 Luna se invoco via OpenRouter con esfuerzo de razonamiento alto; Muse Glimmer 30B se sirvio localmente en BF16 con contexto de 131K tokens, contando como fallo las tareas que lo desbordaban. Qwen reporta 73,0 en Terminal-Bench 2.1 con su propio setup Terminus y 42,2 en DeepSWE 1.1 con el harness de Claude Code. Terminal-Bench 2.1 se promedia sobre 2–3 ejecuciones por modelo abierto y DeepSWE sobre 2–3 semillas para Sabi-Noema, Sabi-Noema-MLA y Qwen3.8-27B; GPQA-Diamond, IFBench y AA-LCR sobre 3 ejecuciones.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 55 GB solo para el modelo, mas el espacio de KV cache y estados de atencion lineal para contextos largos.
- GPU recomendadas por el propio autor: una unica GPU de 80 GB (H100 80 GB o A100 80 GB) es suficiente para alojar los pesos BF16 junto con contextos extensos. Los benchmarks se ejecutaron en despliegues H100 TP2.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 16–24 GB en BF16. El autor menciona compatibilidad de conversion a GGUF mediante llama.cpp, pero no publica cuantizaciones ni cifras de VRAM para ellas; como referencia aritmetica, una cuantizacion de 4 bits de un modelo de 27,36B rondaria teoricamente los 14 GB, cifra no confirmada por el autor.
- Opciones de despliegue: vLLM 0.31.0 (version indicada), Transformers y llama.cpp via conversion a GGUF. No se mencionan Ollama ni TGI.
- Configuracion critica en vLLM: `--max-model-len 262144` y `--max-num-seqs 32`, porque el valor por defecto de 1024 excede los bloques de estado de atencion lineal disponibles en una GPU. Las evaluaciones usaron ademas `--default-chat-template-kwargs '{"preserve_thinking": false}'` para no reinyectar el razonamiento de turnos anteriores.
- Parsers recomendados: `--reasoning-parser qwen3`, `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml`.
- Latencia y throughput: no disponibles. El unico dato indirecto de coste es el numero de tokens de salida por tarea (29,3K de mediana en Terminal-Bench 2.1).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Terminal-Bench 2.1 | DeepSWE | τ³-bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Sabi-Noema | ~27,36B denso hibrido | 262K | 76,0 % | 47,5 % | 259/278 | Apache 2.0 | Pesos abiertos en HuggingFace |
| Qwen3.8-27B (base) | ~27B denso hibrido | 262K (segun el base) | 73,0 % | 38,5 % | 220/278 | No disponible en la informacion proporcionada | Pesos abiertos en HuggingFace |
| ThinkingCap | No disponible | No disponible | 67,8 % | 38,9 % | 204/278 | No disponible | Comparado en la model card |
| Swift 1.5 | No disponible | No disponible | 62,9 % | 39,8 % | 195/278 | No disponible | Comparado en la model card |
| Muse Glimmer 30B | 30B | 131K | 48,3 % | 5,3 % | 219/278 | No disponible | Servido localmente en BF16 en las pruebas |
| GPT-6 Luna (high) | No disponible | No disponible | 68,5 % | 53,1 % | 183/278 | Propietaria | Via OpenRouter |

En eficiencia, Sabi-Noema reduce la mediana de tokens de salida en Terminal-Bench 2.1 a 29,3K frente a 65,3K de Qwen3.8-27B, 51,0K de ThinkingCap y 57,1K de Swift 1.5, aunque Muse Glimmer 30B es mas eficiente en ese benchmark (20,6K) a costa de un rendimiento muy inferior. En fiabilidad, la tasa de alucinacion del 15,1 % solo es superada (mejorada) por GPT-6 Luna en el grupo comparado, que sin embargo obtiene 85,3 % de alucinacion en AA-Omniscience segun la tabla del autor, dato que conviene leer con cautela por la diferencia de condiciones de servicio.

## Limitaciones y advertencias

- Riesgo de alucinacion: aunque bajo en terminos relativos (15,1 % en AA-Omniscience), sigue siendo un 15,1 %; en dominios factuales criticos se requiere verificacion externa.
- Sesgos: la model card no documenta evaluaciones de sesgo, toxicidad ni equidad. No hay informacion disponible al respecto.
- Idiomas: no se especifica el soporte multilingue ni se han publicado benchmarks por idioma. El rendimiento fuera del ingles no esta caracterizado.
- Modo no-thinking: el chat template lo soporta, pero el autor indica explicitamente que no fue evaluado, por lo que su calidad es desconocida.
- Contexto largo: los 262.144 tokens declarados implican requisitos de memoria considerables y la necesidad de ajustar `--max-num-seqs` en vLLM; el rendimiento real mas alla de la ventana evaluada no esta documentado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B, que no se detallan en la informacion proporcionada.
- Procedencia del ajuste: el entrenamiento se hizo exclusivamente con entornos RL de codigo abierto, sin que se detalle la composicion del dataset ni posibles contaminaciones con los benchmarks reportados.
- Comparabilidad de benchmarks: Terminal-Bench 2.1 se ejecuto con la configuracion de Artificial Analysis, mientras que las cifras de Qwen para ese mismo benchmark (73,0) proceden de su propio setup Terminus; las comparaciones entre harnesses distintos no son estrictamente equivalentes.
- Versionado de dependencias: las instrucciones de servicio fijan vLLM 0.31.0; otras versiones pueden requerir ajustes, especialmente en la gestion de atencion lineal y parsers de tool calling.
- Reproducibilidad: el modelo esta fechado en octubre de 2026 y su ecosistema de referencia (Qwen3.8, GPT-6 Luna, Muse Glimmer) es reciente, por lo que el soporte en herramientas de terceros puede ser limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sabicap/sabi-noema
- Variante con atencion latente multi-cabeza: https://huggingface.co/sabicap/sabi-noema-mla
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Metodologia de Terminal-Bench 2.1 citada por el autor: https://artificialanalysis.ai/methodology/intelligence-benchmarking#terminal-bench-v2-1
- Repositorio de scripts de servicio: `examples/serve_vllm.sh` dentro del repositorio del modelo
- Enlaces adicionales: no se han encontrado enlaces relevantes en la busqueda web proporcionada (los resultados devueltos corresponden a la aplicacion Snapchat y no guardan relacion con el modelo).
