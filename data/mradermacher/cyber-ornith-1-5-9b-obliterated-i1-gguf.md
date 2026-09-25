# mradermacher/Cyber-Ornith-1.5-9B-OBLITERATED-i1-GGUF

## Resumen

Cyber-Ornith-1.5-9B-OBLITERATED-i1-GGUF es la versión cuantizada en formato GGUF del modelo DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED, un ajuste fino de 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) especializado en ciberseguridad y flujos de trabajo agénticos sobre terminal y CLI. La cuantización la ha realizado mradermacher, un autor conocido en el ecosistema por publicar versiones GGUF con matrices de importancia (imatrix) de modelos de terceros. El repositorio incluye once archivos GGUF que cubren desde IQ2_M (3,7 GB) hasta Q6_K (7,5 GB), además del fichero imatrix para generar cuantizaciones propias.

El modelo base se entrenó con QLoRA y Unsloth sobre un conjunto de datos orientado a tareas de seguridad informática, razonamiento, uso de herramientas y comandos de shell. Entre las fuentes declaradas figuran oi-uae/cyber-security, hotdogs/uka-cyber-dataset, trend-cybertron/Primus-Reasoning, Lite-Coder/LiteCoder-Terminal-SFT, rajistics/openhands-synthetic-conversations, emirkaanozdemr/bash_command_data_6K, NousResearch/hermes-function-calling-v1 y open-thoughts/OpenThoughts3-1.2M. El resultado es un modelo conversacional con soporte explícito de function calling y tool use, publicado bajo licencia Apache 2.0 y con el inglés como único idioma declarado.

Su relevancia práctica reside en la combinación de tamaño contenido (apto para GPU de consumo), licencia permisiva para uso comercial y un enfoque muy concreto en agentes de terminal y ciberseguridad, un nicho donde la mayoría de los modelos pequeños disponibles son genéricos. El repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags del repositorio incluyen `qwen3_5`, lo que sugiere una base de la familia Qwen, sin confirmacion documental) |
| Parametros totales | 8.953.803.264 (≈8,95 B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix, i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base original esta en safetensors |
| Tamano del repositorio | 60,2 GB |
| Modelo base | DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED |
| Libreria declarada | transformers |
| Metodo de ajuste | QLoRA + Unsloth |

## Arquitectura y entrenamiento

No se dispone de documentación técnica detallada sobre la arquitectura interna del modelo base en la información proporcionada. Los tags del repositorio incluyen `qwen3_5`, `qlora` y `unsloth`, lo que apunta a un transformer denso derivado de la familia Qwen 3.5 y ajustado mediante QLoRA con la librería Unsloth, un método de entrenamiento con cuantización en 4 bits que reduce el consumo de memoria del proceso de fine-tuning. El tamaño de 8,95 B de parámetros es coherente con un modelo denso de clase 8-9 B. No hay información sobre número de tokens de entrenamiento, composición exacta del dataset (más allá de la lista de fuentes) ni sobre si se aplicaron fases de RLHF o DPO.

El pipeline de datos declarado combina corpus de ciberseguridad (oi-uae/cyber-security, hotdogs/uka-cyber-dataset), datos de razonamiento (trend-cybertron/Primus-Reasoning, open-thoughts/OpenThoughts3-1.2M), trayectorias de terminal y shell (Lite-Coder/LiteCoder-Terminal-SFT, emirkaanozdemr/bash_command_data_6K, rajistics/openhands-synthetic-conversations) y datos de function calling (NousResearch/hermes-function-calling-v1). Esa mezcla indica un objetivo de entrenamiento orientado a agentes que ejecutan comandos y llaman herramientas, más que a conversación generalista. La denominación "OBLITERATED" y el tag `obliterated` apuntan a un ajuste destinado a reducir las respuestas de rechazo, pero no hay documentación en la información disponible que confirme la técnica empleada ni su alcance.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat multi-turno.
- Razonamiento explícito: los datasets de OpenThoughts3 y Primus-Reasoning sugieren entrenamiento en cadenas de razonamiento.
- Function calling y tool use: el modelo se entrenó con NousResearch/hermes-function-calling-v1, lo que implica soporte de esquemas de herramientas tipo Hermes/OpenAI.
- Operación agéntica sobre terminal y CLI: generación y ejecución de comandos de shell, presumiblemente con bucles de observación-acción en entornos tipo OpenHands.
- Tareas de ciberseguridad: análisis de artefactos, apoyo a tareas de seguridad ofensiva y defensiva según los corpus declarados.
- Generación de código asociada al uso de herramientas y scripts de automatización.
- Capacidad multilingüe: no disponible más allá del inglés declarado.

## Casos de uso

- Automatización de operaciones en terminal: el modelo puede recibir el estado de un shell, proponer el siguiente comando y encadenar pasos en un bucle agéntico, apoyándose en el entrenamiento con bash_command_data_6K y LiteCoder-Terminal-SFT. Es adecuado porque su ajuste se centró específicamente en este dominio en lugar de en conversación genérica.
- Asistente de triaje en seguridad: clasificación y priorización de alertas, resumen de artefactos sospechosos y propuesta de comandos de análisis forense, aprovechando los corpus de ciberseguridad y el razonamiento estructurado.
- Agente de respuesta a incidentes: ejecución guiada de playbooks donde el modelo decide qué herramienta invocar (escaneo, volcado de logs, consulta a API interna) mediante function calling, con intervención humana en cada paso.
- Copiloto para equipos SOC en local: al distribuirse en GGUF y caber en GPU de consumo, permite desplegar asistencia sensible sin enviar telemetría a servicios externos, algo crítico cuando los datos contienen información de infraestructura.
- Generación de scripts de automatización y hardening: producción de scripts de shell o Python para tareas de configuración, auditoría y parcheo, con validación posterior en pipelines de CI/CD.
- Laboratorios de formación en ciberseguridad: entorno de práctica donde el modelo actúa como guía o adversario controlado en ejercicios de tipo CTF, ejecutable en una estación de trabajo con una sola GPU.
- Preprocesado de datos de seguridad: normalización y enriquecimiento de logs o reportes mediante llamadas a funciones que consultan bases de datos de vulnerabilidades.
- Integración en asistentes de IDE para tareas de infraestructura: el soporte de tool use permite conectar el modelo a terminales integrados y ejecutar acciones con confirmación del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de cuantización no incluye tablas de evaluación y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo. No se deben asumir cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de ciberseguridad sin una fuente verificable.

## Requisitos de hardware

- VRAM estimada para inferencia, según la cuantización elegida: i1-IQ2_M ≈3,7 GB de pesos, i1-Q3_K_M ≈4,7 GB, i1-IQ4_XS ≈5,3 GB, i1-Q4_K_S ≈5,5 GB, i1-Q4_K_M ≈5,7 GB, i1-Q6_K ≈7,5 GB. A estas cifras hay que sumar el KV cache, que depende de la longitud de contexto configurada y puede añadir varios GB en contextos largos.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090. En tarjetas de 8 GB (RTX 3070, RTX 4060) solo son viables las cuantizaciones IQ2_M o Q2_K con contexto reducido.
- GPU profesionales: A100 40/80 GB, H100, L40S y A6000 permiten ejecutar la cuantización Q6_K con contextos largos y varios usuarios concurrentes, aunque para este tamaño de modelo son sobredimensionadas salvo en despliegues con alta concurrencia.
- CPU y Apple Silicon: las cuantizaciones IQ2_M y Q4_K_S son ejecutables en CPU con llama.cpp o Ollama, y en Mac con chip M-series (M1 Pro en adelante) con memoria unificada de 16 GB o superior.
- Opciones de despliegue: llama.cpp, llama-server, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requerirían el modelo base en safetensors y una GPU con VRAM suficiente para los pesos sin cuantizar (≈18 GB en fp16).
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para estas cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Cyber-Ornith-1.5-9B-OBLITERATED (i1-GGUF) | 8,95 B | no disponible | GGUF | Apache 2.0 | Ciberseguridad, agentes de terminal, tool use |
| DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED | 8,95 B | no disponible | safetensors | Apache 2.0 | Modelo base sin cuantizar del anterior |
| Qwen3-8B | ≈8,2 B | no disponible en esta busqueda | safetensors, GGUF | Apache 2.0 (segun version) | Modelo generalista con modo thinking |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | safetensors, GGUF | Llama 3.1 Community License | Modelo generalista con tool calling |

Nota: los datos de contexto y licencia de las alternativas no se han verificado en esta búsqueda y deben confirmarse en sus repositorios oficiales antes de usarse en una decisión de producción. No se dispone de resultados comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés. No hay evidencia de competencia en castellano u otros idiomas, por lo que su uso en producción multilingüe requeriría evaluación previa.
- Longitud de contexto desconocida: al no documentarse la ventana de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en agentes con historial extenso.
- Riesgo de alucinación en dominio sensible: en tareas de ciberseguridad, comandos o rutas inventados pueden causar daños reales si se ejecutan sin supervisión. Cualquier agente construido sobre este modelo debe incorporar sandboxing y confirmación humana.
- Ausencia de benchmarks publicados: no hay métricas independientes que respalden el rendimiento del modelo en tareas de seguridad, razonamiento o código. La lista de datasets de entrenamiento no es evidencia de calidad.
- Efecto de la cuantización: las cuantizaciones de 2 y 3 bits (IQ2_M, Q2_K, IQ3_XXS) degradan la calidad de forma apreciable, especialmente en tareas de razonamiento y generación de comandos precisos. El propio autor recomienda IQ4_XS sobre IQ4_NL y advierte que Q2_K es peor que IQ3_XXS.
- Naturaleza del ajuste "OBLITERATED": si el ajuste reduce los mecanismos de rechazo, aumenta el riesgo de generar contenido operativo peligroso en dominios ofensivos. Esto implica una responsabilidad adicional en el despliegue y posibles conflictos con políticas de uso aceptable de proveedores.
- Trazabilidad limitada: el repositorio no ofrece model card propia, no documenta hiperparámetros, dataset final ni proceso de evaluación. La información disponible proviene únicamente de los metadatos y de la lista de datasets declarada en el modelo base.
- Repositorio sin adopción: cero descargas y cero valoraciones en el momento de la consulta, sin retroalimentación de la comunidad sobre fallos o comportamientos anómalos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento declarados, ya que algunas fuentes sintéticas o derivadas pueden imponer condiciones adicionales.
- Fecha de creación registrada en los metadatos: 25 de septiembre de 2026, con actualización posterior el mismo día. La verificación de integridad de los ficheros GGUF descargados es recomendable antes del despliegue.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mradermacher/Cyber-Ornith-1.5-9B-OBLITERATED-i1-GGUF
- Modelo base: https://huggingface.co/DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Cyber-Ornith-1.5-9B-OBLITERATED-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#Cyber-Ornith-1.5-9B-OBLITERATED-i1-GGUF
- Guía de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones y preguntas sobre cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
- Discusión sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Datasets declarados en el modelo base: https://huggingface.co/datasets/oi-uae/cyber-security, https://huggingface.co/datasets/hotdogs/uka-cyber-dataset, https://huggingface.co/datasets/trend-cybertron/Primus-Reasoning, https://huggingface.co/datasets/Lite-Coder/LiteCoder-Terminal-SFT, https://huggingface.co/datasets/rajistics/openhands-synthetic-conversations, https://huggingface.co/datasets/emirkaanozdemr/bash_command_data_6K, https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1, https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Búsqueda web realizada: no se han encontrado resultados relevantes sobre este modelo. Las únicas coincidencias devueltas corresponden a páginas sin relación con el modelo (peticiones ciudadanas sobre derechos reproductivos en Bélgica) y se descartan como fuentes.
