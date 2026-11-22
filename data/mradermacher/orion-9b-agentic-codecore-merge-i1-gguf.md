# mradermacher/Orion-9B-Agentic-CodeCore-Merge-i1-GGUF

## Resumen

Orion-9B-Agentic-CodeCore-Merge-i1-GGUF es la version cuantizada en formato GGUF del modelo Orion-9B-Agentic-CodeCore-Merge, un merge de modelos de 9.197.093.888 parametros construido por prithivMLmods y cuantizado por mradermacher. El modelo esta orientado a tareas de agente, uso de herramientas (tool calling), razonamiento con cadena de pensamiento y generacion de codigo, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta publicacion reside en el formato: al tratarse de una cuantizacion GGUF con tecnicas de imatrix (importancia matricial), el modelo puede ejecutarse en hardware de consumo mediante llama.cpp, Ollama o LM Studio, algo imposible con los pesos originales en precision completa. mradermacher ofrece un espectro amplio de cuantizaciones, desde i1-Q2_K (4,0 GB) hasta i1-Q6_K (7,7 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de VRAM.

El modelo base emplea la etiqueta `qwen3_5` en sus metadatos, lo que sugiere una arquitectura derivada de la familia Qwen 3.5, aunque la model card no detalla la arquitectura interna ni la longitud de contexto. La informacion publicada se centra en el proceso de cuantizacion y en las caracteristicas funcionales (agente, razonamiento, codigo) mas que en los detalles tecnicos del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en metadatos; detalles no disponibles) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los metadatos incluyen la etiqueta `qwen3_5`, lo que apunta a una base derivada de la familia Qwen 3.5 de Alibaba, pero no se confirma el tipo de atencion, el numero de capas ni la dimension de los estados ocultos. El modelo es un merge (fusion de pesos) realizado con OmnimergeKit, una herramienta de fusion de modelos, a partir de componentes orientados a agente, razonamiento y codigo.

El proceso de cuantizacion realizado por mradermacher emplea tecnicas de imatrix (importancia matricial), que calculan la relevancia de cada peso usando un corpus de calibracion para preservar mejor la calidad en cuantizaciones agresivas. Las etiquetas del modelo indican que el entrenamiento del base incluyo SFT (supervised fine-tuning), razonamiento con cadena de pensamiento (chain-of-thought) y optimizacion para tool use y function calling. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento explicito con cadena de pensamiento (chain-of-thought).
- Generacion y asistencia de codigo (etiqueta `coder`).
- Tool calling y function calling para integracion con APIs y herramientas externas.
- Comportamiento agentico: planificacion multi-paso y uso de herramientas en bucles de agente.
- Capacidad de seguir instrucciones afinada mediante SFT.
- Soporte de conversaciones multi-turno (etiqueta `conversational`).
- No se documentan capacidades de vision, audio ni modo thinking separado mas alla del razonamiento CoT.

## Casos de uso

- Agentes de codigo autonomos: el modelo puede integrarse en entornos como OpenHands o Aider para resolver tareas de programacion multi-paso, ya que combina generacion de codigo con tool calling para leer ficheros, ejecutar tests y aplicar parches.
- Asistentes de IDE con tool calling: integrado en un servidor local compatible con la API de OpenAI (por ejemplo, mediante llama.cpp server u Ollama), puede invocar funciones del editor para refactorizar, explicar o generar tests unitarios.
- Automatizacion de pipelines CI/CD: el modelo puede analizar fallos de build, proponer correcciones y abrir pull requests cuando se le expone un conjunto de herramientas (GitHub API, ejecucion de comandos) en un bucle de agente.
- Razonamiento sobre documentacion tecnica: su modo chain-of-thought permite descomponer preguntas complejas sobre APIs o arquitecturas de software y justificar las respuestas paso a paso.
- Despliegue en hardware de consumo para prototipado: con la cuantizacion i1-Q4_K_M (5,9 GB) cabe en GPUs de 8 GB de VRAM, lo que permite a desarrolladores individuales probar flujos agenticos sin infraestructura cloud.
- Evaluacion de merges y cuantizaciones: investigadores pueden comparar la calidad del modelo base frente a las distintas cuantizaciones i1 para estudiar el impacto de la cuantizacion en tareas de razonamiento y codigo.
- Chatbot tecnico de soporte interno: con contexto conversacional multi-turno, puede atender consultas de desarrolladores sobre el codigo de un repositorio interno, siempre que se le inyecte el contexto relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto):
  - i1-Q2_K: ~4,0 GB de pesos; ~5-6 GB de VRAM total con contexto moderado.
  - i1-IQ3_M / i1-Q3_K_M: ~4,6-4,8 GB de pesos; ~6-7 GB de VRAM.
  - i1-Q4_K_S / i1-Q4_K_M: ~5,6-5,9 GB de pesos; ~7-8 GB de VRAM.
  - i1-Q5_K_M: ~6,7 GB de pesos; ~8-9 GB de VRAM.
  - i1-Q6_K: ~7,7 GB de pesos; ~9-10 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100 para mayor throughput y contexto. Cualquier GPU con 8 GB o mas puede ejecutar las cuantizaciones Q4.
- Cabe en GPU de consumo: si, desde una RTX 3060 de 12 GB (o incluso 8 GB con Q4_K_M) hasta modelos de gama alta. Tambien puede ejecutarse en CPU con llama.cpp, aunque con latencia mayor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI (llama.cpp server). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para esos motores convendria usar los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orion-9B-Agentic-CodeCore-Merge (i1-GGUF) | 9,2 B | no disponible | Apache 2.0 | GGUF (i1) | Merge orientado a agente y codigo; solo ingles |
| Qwen2.5-Coder-7B-Instruct (GGUF) | 7,6 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | GGUF | Referencia en generacion de codigo; soporte multilingue de codigo |
| Llama-3.1-8B-Instruct (GGUF) | 8,0 B | 128.000 tokens (segun documentacion publica de Meta) | Llama 3.1 Community License | GGUF | Uso general, tool calling nativo, requiere cumplir la licencia de Meta |
| DeepSeek-Coder-V2-Lite-Instruct (GGUF) | 15,7 B (MoE, 2,4 B activos) | 128.000 tokens (segun documentacion publica de DeepSeek) | DeepSeek License | GGUF | Enfocado a codigo; mayor coste de VRAM |

Nota: los datos de contexto y licencia de los modelos comparados provienen de su documentacion publica y no de la informacion proporcionada para este modelo; se incluyen como referencia orientativa.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano no esta validado y probablemente sea inferior.
- Al ser un merge de modelos, puede heredar sesgos y comportamientos inconsistentes de sus componentes; no se documenta el proceso de alineacion.
- Riesgo de alucinacion inherente a los modelos de 9 B, especialmente en tareas de codigo con APIs poco comunes o en razonamientos largos.
- No se publican benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas.
- Las cuantizaciones agresivas (Q2_K, IQ2, IQ3) degradan la calidad; para tareas de agente y codigo se recomienda Q4_K_M o superior.
- La longitud de contexto no esta documentada; no debe asumirse que soporta ventanas largas sin verificacion empirica.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base es un merge y conviene revisar las licencias de los modelos originales fusionados antes de un despliegue en produccion.
- El repositorio ocupa 81,3 GB por incluir todas las cuantizaciones; la descarga debe hacerse fichero a fichero.

## Enlaces

- Repositorio Hugging Face (GGUF i1): https://huggingface.co/mradermacher/Orion-9B-Agentic-CodeCore-Merge-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Orion-9B-Agentic-CodeCore-Merge
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Orion-9B-Agentic-CodeCore-Merge-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Orion-9B-Agentic-CodeCore-Merge-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
