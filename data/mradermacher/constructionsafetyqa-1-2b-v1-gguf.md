# mradermacher/ConstructionSafetyQA-1.2B-V1-GGUF

## Resumen

ConstructionSafetyQA-1.2B-V1-GGUF es la distribucion en formato GGUF del modelo ConstructionSafetyQA-1.2B-V1, un modelo de lenguaje de 1.170.340.608 parametros afinado para tareas de pregunta-respuesta sobre seguridad en la construccion. El modelo original fue desarrollado por el usuario yasserrmd y esta cuantizado y publicado por mradermacher, un conocido distribuidor de cuantizaciones GGUF para llama.cpp. El modelo base fue entrenado con Unsloth, segun las etiquetas de la model card.

El modelo resuelve un problema de dominio muy concreto: responder preguntas tecnicas sobre normativa, riesgos y buenas practicas de seguridad laboral en obras y entornos de construccion. Su tamano reducido (1,2B parametros) lo hace apto para despliegue en hardware modesto, incluso en CPU, lo que resulta relevante para integraciones en campo, aplicaciones moviles o sistemas embebidos donde no hay acceso a GPUs de datacenter.

La relevancia actual del modelo radica en su especializacion vertical y su formato GGUF, que permite ejecutarlo con llama.cpp, Ollama o interfaces compatibles sin necesidad de infraestructura de inferencia compleja. No obstante, la informacion publica disponible es muy limitada: no se detallan datos de entrenamiento, benchmarks ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base, detalles no disponibles) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base yasserrmd/ConstructionSafetyQA-1.2B-V1. Por el numero de parametros (1,17B) y las etiquetas de la model card, se trata de un transformer decoder-only de tipo instruction-tuned. La etiqueta "unsloth-finetuned" indica que el ajuste fino se realizo con la libreria Unsloth, orientada a fine-tuning eficiente en memoria (LoRA/QLoRA y optimizaciones de kernels), aunque no se especifican los hiperparametros, el dataset ni el numero de tokens de entrenamiento.

No hay informacion publica sobre la composicion del dataset de entrenamiento, si se aplicaron tecnicas de RLHF, DPO o SFT, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card del repositorio GGUF es una plantilla estandar de mradermacher centrada en la descripcion de las cuantizaciones, no en el entrenamiento del modelo.

## Capacidades

- Generacion de texto y respuesta a preguntas en el dominio de seguridad en la construccion.
- Modelo instruction-tuned: responde a instrucciones conversacionales en formato chat.
- Especializacion vertical en seguridad laboral en obras (riesgos, normativa, procedimientos, equipos de proteccion).
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma declarada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documentan capacidades de vision, audio ni modo "thinking".
- Compatible con endpoints (etiqueta endpoints_compatible) y con el pipeline text-generation de transformers.

## Casos de uso

- Asistente de consulta en obra: integrado en una aplicacion movil o tableta, el modelo responde preguntas sobre procedimientos seguros, uso de EPI o riesgos especificos de una tarea, funcionando en local sin conexion gracias a su tamano de 0,6-1,3 GB en cuantizaciones Q2-Q8.
- Formacion de trabajadores: generacion de preguntas y respuestas de repaso sobre normativa de seguridad, aprovechando su ajuste especifico en el dominio para reducir respuestas genericas.
- Chatbot de soporte interno para tecnicos de prevencion: responde consultas frecuentes sobre protocolos y checklists, desplegado con llama.cpp u Ollama en un servidor modesto o incluso en CPU.
- Pre-revision de documentacion de seguridad: el modelo puede redactar borradores de respuestas a cuestionarios de evaluacion de riesgos, que un tecnico revisa y valida posteriormente.
- Prototipado rapido de asistentes verticales: sirve como base para experimentar con RAG sobre manuales de seguridad, ya que su bajo coste de inferencia permite iterar rapidamente.
- Despliegue en entornos con hardware limitado: en cuantizacion Q4_K_M (0,8 GB) cabe en dispositivos con 2-4 GB de RAM, lo que permite ejecutarlo en mini-PC, Raspberry Pi de gama alta o portatiles sin GPU dedicada.
- Filtrado y clasificacion de consultas de seguridad: puede usarse como primer nivel de triaje en un sistema mayor, derivando consultas complejas a un modelo de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,6 GB (Q2_K), 0,8 GB (Q4_K_M), 1,3 GB (Q8_0) y 2,4 GB (f16), mas el overhead del runtime y la cache KV.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4-Q8; una RTX 3060, RTX 4060 o superior ofrece margen amplio. En datacenter, A100 o H100 son innecesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas; tambien en CPU pura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, interfaces compatibles con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera inferencia en tiempo real en CPU moderna y muy rapida en GPU consumer.

## Comparativa con modelos similares

No se dispone de informacion sobre benchmarks ni sobre modelos comparables directos en el dominio de seguridad en la construccion. Como referencia de categoria (modelos pequenos instruction-tuned en ingles), se podrian considerar alternativas genericas, pero no se aportan datos de rendimiento comparativo:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ConstructionSafetyQA-1.2B-V1 | 1,17B | no disponible | no disponible | GGUF y safetensors en HF |
| Alternativas genericas de ~1B | no disponible | no disponible | no disponible | no disponible |

No disponible comparativa cuantitativa fiable con modelos de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un ajuste fino de dominio, puede heredar sesgos del modelo base y del dataset de entrenamiento, no publicados.
- Riesgo de alucinacion: alto en un modelo de 1,2B, especialmente en cuestiones normativas o legales donde una respuesta incorrecta puede tener consecuencias graves de seguridad. Requiere validacion humana en cualquier uso critico.
- Limitacion de idioma: solo se declara ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Limitacion de contexto: la longitud de contexto no esta documentada, lo que impide planificar usos con documentos largos.
- Licencia: no disponible, lo que impide confirmar si se permite uso comercial; debe consultarse con el autor del modelo base antes de desplegarlo en produccion.
- Caveat de produccion: la model card del repositorio GGUF es una plantilla de cuantizacion; no hay informacion sobre evaluacion, datos de entrenamiento ni limitaciones declaradas por el autor del modelo original.
- El modelo no debe usarse como sustituto de normativa oficial, evaluaciones de riesgo formales ni asesoramiento de un tecnico de prevencion cualificado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ConstructionSafetyQA-1.2B-V1-GGUF
- Modelo base: https://huggingface.co/yasserrmd/ConstructionSafetyQA-1.2B-V1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/ConstructionSafetyQA-1.2B-V1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#ConstructionSafetyQA-1.2B-V1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
