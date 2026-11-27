# mradermacher/Lily-1.5B-Code-GGUF

## Resumen

Lily-1.5B-Code es un modelo de lenguaje especializado en generacion de codigo y comportamiento de agente (code agent), desarrollado originalmente por abhinav0231 y distribuido en formato GGUF por mradermacher. Se trata de un modelo de aproximadamente 1.543 millones de parametros (1,5B) construido sobre la arquitectura Qwen2.5, segun indica la etiqueta `qwen2.5` de la model card. Su entrenamiento combina aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) mediante la libreria TRL, orientado a tareas de agente de codigo en entornos interactivos como Jupyter, OpenEnv, FastMCP y Daytona.

La relevancia de esta ficha radica en que el repositorio distribuido por mradermacher contiene unicamente cuantizaciones estaticas en formato GGUF del modelo original, lo que permite ejecutar un modelo de 1,5B en hardware de consumo. El modelo esta etiquetado como compatible con endpoints y orientado a conversacion, con soporte declarado de tool calling, lo que lo situa en la categoria de modelos pequenos para automatizacion de tareas de codigo y razonamiento multi-paso.

No se dispone de informacion publica sobre la longitud de contexto, la composicion exacta del dataset de entrenamiento ni la licencia del modelo original en la informacion proporcionada. El repositorio ocupa 14,2 GB e incluye cuantizaciones desde Q2_K (0,8 GB) hasta f16 (3,2 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5, segun etiqueta) |
| Parametros totales | 1.543.714.304 (1,5B aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atencion causal estandar. El entrenamiento declarado en las etiquetas combina GRPO (Group Relative Policy Optimization) mediante TRL con tecnicas de reinforcement learning orientadas a agentes de codigo. Las etiquetas `jupyter`, `openenv`, `fastmcp` y `daytona` sugieren que el entrenamiento por refuerzo se realizo en entornos de ejecucion de codigo interactivos (notebooks Jupyter, entornos sandbox y servidores MCP), lo que indica un enfoque en la resolucion de tareas mediante ejecucion real y feedback del entorno.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de SFT, DPO o RLHF adicionales mas alla del GRPO mencionado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El repositorio distribuido por mradermacher contiene unicamente cuantizaciones estaticas (no se ofrecen cuantizaciones ponderadas/imatrix en el momento de la publicacion).

## Capacidades

- Generacion de codigo y resolucion de tareas de programacion, con enfasis en entornos interactivos (Jupyter, sandboxes de ejecucion).
- Comportamiento de agente de codigo (code agent) con razonamiento multi-paso, segun las etiquetas `code-agent` y `reinforcement-learning`.
- Soporte de tool calling / function calling, segun la etiqueta `tool-calling`.
- Integracion con servidores MCP (Model Context Protocol) mediante FastMCP y con entornos de ejecucion Daytona.
- Capacidad conversacional (etiqueta `conversational` y pipeline de reinforcement-learning).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- Capacidades multilingues limitadas al ingles (`en`).

## Casos de uso

- Agente de codigo en notebooks: el modelo puede integrarse en entornos Jupyter para generar, ejecutar y corregir celdas de codigo de forma iterativa, aprovechando su entrenamiento con feedback del entorno.
- Automatizacion de tareas de programacion en sandboxes: gracias a su entrenamiento con OpenEnv y Daytona, es adecuado para pipelines donde el modelo propone codigo, lo ejecuta en un entorno aislado y refina la solucion segun los errores.
- Asistente de desarrollo con tool calling: puede conectarse a servidores MCP (FastMCP) para invocar herramientas externas (ejecucion de comandos, consultas a APIs) dentro de flujos de trabajo de desarrollo.
- Prototipado rapido en hardware de consumo: sus cuantizaciones Q4_K_M (1,1 GB) permiten desplegarlo en portatiles y GPUs de gama media para tareas de generacion de codigo en local.
- Educacion y ensenanza de programacion: puede generar explicaciones y ejemplos de codigo en ingles para entornos de aprendizaje interactivo.
- Evaluacion de pipelines de RL para codigo: util como modelo de referencia pequeno para investigadores que experimentan con GRPO y entornos de ejecucion de codigo.
- Automatizacion de tareas repetitivas de scripting: generacion de scripts y correccion de errores en flujos de CI/CD donde el modelo actua como agente de parcheo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB (Q2_K), 1,1 GB (Q4_K_M), 1,7 GB (Q8_0) y 3,2 GB (f16), mas el overhead del runtime y la cache KV.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 para mayor throughput; A100/H100 no necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPUs modernas con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base original es compatible con transformers y vLLM (segun etiquetas), aunque las cuantizaciones GGUF requieren runtimes especificos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lily-1.5B-Code (este) | 1,5B | no disponible | no disponible | GGUF / safetensors | Especializado en code agent con GRPO |
| Qwen2.5-Coder-1.5B | 1,5B | no disponible en esta ficha | no disponible en esta ficha | safetensors / GGUF | Modelo base de codigo de la familia Qwen2.5 |
| DeepSeek-Coder-1.3B | 1,3B | no disponible en esta ficha | no disponible en esta ficha | safetensors / GGUF | Modelo pequeno de codigo |

La comparativa se limita a la categoria de modelos de codigo de ~1,5B; no se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al entrenarse principalmente en ingles, puede presentar sesgos linguisticos y culturales propios de ese corpus.
- Riesgo de alucinacion: inherente a modelos de 1,5B; la generacion de codigo puede contener APIs inexistentes o errores logicos, especialmente en tareas complejas.
- Limitaciones de contexto o idioma: solo se declara soporte de ingles; la longitud de contexto no esta documentada, lo que impide garantizar conversaciones o repositorios largos.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial sin consultar el modelo base original (abhinav0231/Lily-1.5B-Code).
- Caveats para produccion: el modelo es pequeno (1,5B) y esta orientado a agentes de codigo; no es adecuado para tareas de razonamiento general de alta complejidad. Las cuantizaciones Q2_K y Q3_K_M reducen la calidad segun la propia model card. No se ofrecen cuantizaciones imatrix/ponderadas.
- El repositorio distribuido contiene solo cuantizaciones estaticas; para pesos completos en safetensors debe acudirse al modelo base original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lily-1.5B-Code-GGUF
- Modelo base original: https://huggingface.co/abhinav0231/Lily-1.5B-Code
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Lily-1.5B-Code-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
