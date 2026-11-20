# mradermacher/Dolphin3.0-Llama3.1-1B-abliterated-GGUF

## Resumen

Dolphin3.0-Llama3.1-1B-abliterated-GGUF es la distribucion en formato GGUF del modelo Dolphin3.0-Llama3.1-1B-abliterated, una variante "abliterated" del modelo Dolphin 3.0 de Cognitive Computations construido sobre la arquitectura Llama 3.1 de 1B parametros. El autor de esta cuantizacion es mradermacher, un conocido publicador de versiones GGUF de modelos open source, mientras que el modelo base abliterated fue producido por Nexesenex. La "abliteracion" es una tecnica de modificacion de pesos que elimina la direccion de rechazo en el espacio de activaciones, de modo que el modelo deja de negarse a responder a ciertas peticiones.

El modelo resuelve el problema de ejecutar un LLM conversacional afinado en un entorno de recursos muy limitados: con aproximadamente 1.235 millones de parametros, las cuantizaciones GGUF van desde 0,7 GB (Q2_K) hasta 2,6 GB (f16), lo que permite su despliegue en CPU, GPUs de gama baja y dispositivos con poca VRAM. La ventana de contexto heredada de Llama 3.1 es de 128.000 tokens, aunque el modelo base es de solo 1B parametros, por lo que la calidad real en contextos muy largos es limitada.

Es relevante ahora porque combina tres tendencias: modelos pequenos desplegables en local, cuantizacion GGUF de alta calidad (incluyendo variantes i1/imatrix disponibles en un repo hermano) y la eliminacion de los mecanismos de rechazo para investigacion sobre alineamiento y seguridad. Su licencia Llama 3.1 permite uso comercial con las restricciones habituales de Meta, y su reducido tamano lo hace idoneo para prototipado rapido y experimentacion en entornos sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 1.235.818.528 (1,24B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1; no confirmado en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 1B: un transformer decoder-only con atencion por cabezas agrupadas (GQA), normalizacion RMSNorm y activacion SwiGLU. El modelo original Dolphin 3.0 de Cognitive Computations se entrena sobre el modelo base Llama 3.1 1B con un dataset de instrucciones curado y filtrado, orientado a conversacion, razonamiento y generacion de codigo. No se dispone de informacion detallada en la model card proporcionada sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica clave de esta variante es la "abliteracion": una modificacion de los pesos que elimina la direccion de rechazo identificada en el espacio de activaciones, tipicamente mediante la ortogonalizacion de los pesos de las capas de atencion y MLP respecto a un vector de rechazo calculado a partir de pares de prompts. Esto produce un modelo que responde a peticiones que el modelo original rechazaria. El proceso de cuantizacion GGUF lo realiza mradermacher mediante herramientas estandar (llama.cpp), con cuantizaciones estaticas en este repo y cuantizaciones ponderadas/imatrix en un repositorio separado.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 1B parametros.
- Generacion de codigo simple y explicaciones tecnicas.
- Capacidades matematicas basicas (aritmetica simple, problemas de un paso); no fiable en razonamiento matematico complejo.
- Respuesta a peticiones que el modelo original rechazaria, gracias a la abliteracion (relevante para investigacion sobre seguridad y alineamiento).
- No se documenta soporte nativo de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes o razonamiento multi-paso explicito.
- Multilingue limitado: la model card declara unicamente ingles.
- No dispone de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en local: con cuantizaciones Q4_K_M de 0,9 GB, el modelo se ejecuta en CPU o en GPUs integradas, permitiendo iterar sobre prompts y flujos conversacionales sin coste de API.
- Investigacion sobre alineamiento y seguridad: la variante abliterated permite estudiar el comportamiento de modelos sin mecanismos de rechazo, comparando respuestas con el modelo original para analizar sesgos y vectores de rechazo.
- Despliegue en dispositivos de borde: con 0,7-1,4 GB de peso, cabe en Raspberry Pi, moviles de gama alta o routers con suficiente RAM, habilitando asistentes offline.
- Generacion de texto de bajo coste en pipelines por lotes: tareas de clasificacion, resumen o reescritura de textos cortos donde la latencia y el coste importan mas que la calidad puntera.
- Educacion y demostraciones: servir como modelo de referencia para ensenar cuantizacion, inferencia local y diferencias entre variantes de un mismo modelo.
- Filtrado y preprocesado de datos: generar variaciones, etiquetas o resumenes de documentos en ingles dentro de pipelines de datos, con la ventaja de ejecutarse en el mismo servidor sin GPU.
- Chatbot de soporte simple en ingles: para preguntas frecuentes y respuestas acotadas donde el contexto necesario es corto y el modelo cabe en RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 0,7 GB (Q2_K) a 2,6 GB (f16); para Q4_K_M, aproximadamente 0,9 GB de pesos mas overhead de contexto (dependiendo de la longitud de contexto configurada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas (GTX 1050 Ti, GTX 1650, RTX 3050). Para f16, 4 GB o mas (RTX 3060, RTX 4060).
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos 8 anos, e incluso en CPU pura.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, text-generation-webui, llama-cpp-python, y servidores compatibles con la API de OpenAI (endpoints_compatible segun los tags). vLLM y TGI no soportan GGUF de forma nativa generalizada; para esos se usaria el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; en CPU moderna se espera decenas de tokens por segundo con Q4_K_M, pero no hay mediciones publicadas en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dolphin3.0-Llama3.1-1B-abliterated-GGUF (este) | 1,24B | 128k (heredado) | llama3.1 | GGUF | Abliterated, solo ingles |
| Llama 3.2 1B Instruct | 1,24B | 128k | llama3.2 | safetensors, GGUF | Modelo oficial de Meta, con rechazo estandar |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k | Apache 2.0 | safetensors, GGUF | Multilingue, licencia permisiva, ligero |
| SmolLM2-1.7B-Instruct | 1,7B | 8k | Apache 2.0 | safetensors, GGUF | Alternativa pequena de Hugging Face, multilingue |

La comparativa se basa en caracteristicas publicas de cada modelo; no se dispone de datos de benchmarks comparativos en la informacion proporcionada para este modelo concreto.

## Limitaciones y advertencias

- La abliteracion elimina los mecanismos de rechazo: el modelo puede generar contenido danino, sesgado o inapropiado sin filtros. No es apto para produccion orientada a usuarios finales sin moderacion externa.
- Riesgo elevado de alucinacion: con 1B parametros, la fidelidad factual es baja y las respuestas pueden ser plausibles pero incorrectas.
- Capacidad de razonamiento limitada: no es adecuado para matematicas complejas, codigo de produccion ni tareas que requieran planificacion multi-paso.
- Solo ingles: la model card declara exclusivamente `en`; el rendimiento en castellano sera deficiente.
- Contexto: aunque se hereda la ventana de 128k de Llama 3.1, la calidad en contextos largos con 1B parametros es muy limitada; no se recomienda superar unos pocos miles de tokens en uso practico.
- Licencia Llama 3.1: permite uso comercial con restricciones (limite de 700 millones de usuarios mensuales, obligacion de mostrar "Built with Llama", prohibicion de usar las salidas para entrenar otros modelos competidores). Revisar los terminos completos antes de uso comercial.
- La model card no documenta el dataset de entrenamiento ni los procesos de alineamiento, lo que dificulta evaluar sesgos especificos.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Dolphin3.0-Llama3.1-1B-abliterated-GGUF
- Modelo base abliterated (Nexesenex): https://huggingface.co/Nexesenex/Dolphin3.0-Llama3.1-1B-abliterated
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Dolphin3.0-Llama3.1-1B-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Dolphin3.0-Llama3.1-1B-abliterated-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
