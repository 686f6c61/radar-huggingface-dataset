# mradermacher/Piccolo-9B-GGUF

## Resumen

Piccolo-9B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo agentscope-ai/Piccolo-9B, publicada por el cuantizador mradermacher. El modelo base, Piccolo-9B, es un modelo de decisión ("decision model") desarrollado por agentscope-ai, con etiquetas que señalan el uso de atención bidireccional e integración con el framework AgentScope. Esta ficha describe el repositorio de cuantizaciones, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El interés principal de este repositorio es práctico: ofrece el modelo en 14 variantes de cuantización (desde Q2_K hasta f16), además de suplementos multimodales (mmproj) en Q8_0 y f16, lo que indica que el modelo base incorpora capacidades de visión. Con unos 9,2 mil millones de parámetros y licencia Apache 2.0, es un candidato relevante para despliegues locales de agentes conversacionales y tareas de decisión, con soporte de inglés y chino. No se dispone de información publicada en la model card sobre longitud de contexto, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decision model con atención bidireccional (detalles no disponibles); etiqueta "qwenpaw" sugiere base relacionada con Qwen (no confirmado) |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base, pero las etiquetas de la model card indican que Piccolo-9B es un "decision model" que emplea atención bidireccional, un rasgo poco habitual en LLM causales tradicionales y que suele asociarse a modelos orientados a tareas de decisión, planificación o puntuación. La etiqueta "qwenpaw" y la pertenencia al ecosistema AgentScope sugieren una relación con arquitecturas tipo Qwen, aunque esto no está confirmado en la documentación disponible. La presencia de archivos mmproj (suplementos multimodales) indica que el modelo admite entrada visual cuando se usa junto a esos proyectores en llama.cpp.

No se ha publicado información sobre el corpus de entrenamiento, el número de tokens, ni sobre etapas de alineamiento como RLHF o DPO. Tampoco hay detalles sobre innovaciones técnicas adicionales más allá de la atención bidireccional declarada en las etiquetas.

## Capacidades

- Generación de texto conversacional (etiqueta "conversational" en el repositorio).
- Tareas de decisión y planificación, según la etiqueta "decision-model" del modelo base.
- Capacidad multimodal: los archivos mmproj-Q8_0 y mmproj-f16 habilitan el procesamiento de imágenes al usarlos junto al GGUF principal en llama.cpp.
- Soporte de inglés y chino.
- Integración con el ecosistema AgentScope para construcción de agentes.
- No hay información disponible sobre tool calling, razonamiento multi-paso explícito, ni modo de pensamiento ("thinking mode").

## Casos de uso

- Agentes conversacionales locales: gracias a su etiqueta "conversational" y a su integración con AgentScope, puede servir como motor de diálogo para agentes que se ejecutan íntegramente en local, sin depender de APIs externas.
- Sistemas de decisión y enrutamiento: al tratarse de un "decision model", es adecuado para pipelines donde el modelo debe evaluar opciones o tomar decisiones intermedias dentro de un flujo de agente.
- Ejecución en portátiles y estaciones de trabajo: la variante Q4_K_M (5,9 GB) permite usar el modelo en GPUs de consumo con 8 GB de VRAM o incluso en CPU con RAM suficiente, útil para prototipado rápido.
- Aplicaciones bilingües inglés-chino: su soporte declarado de ambos idiomas lo hace útil para productos orientados a mercados occidentales y chinos.
- Procesamiento de imágenes en el borde: combinando el GGUF principal con el mmproj, se pueden construir aplicaciones de visión-lenguaje (descripción de imágenes, preguntas sobre contenido visual) sin servidor dedicado.
- Despliegue con licencia permisiva: Apache 2.0 permite integrarlo en productos comerciales sin obligaciones de copyleft, adecuado para startups y equipos que necesitan certificar licencias.
- Experimentación con cuantizaciones: la amplia gama de variantes (Q2_K a f16) permite estudiar el compromiso entre tamaño, calidad y velocidad en hardware heterogéneo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada al tamaño del archivo + overhead de contexto, típicamente 1-2 GB adicionales):
  - Q2_K (4,0 GB): viable en GPUs de 6 GB o en CPU.
  - Q4_K_M (5,9 GB): GPU de 8 GB (RTX 3060, RTX 4060, RTX 4070).
  - Q6_K (7,7 GB): GPU de 10-12 GB (RTX 3080, RTX 4070 Ti).
  - Q8_0 (9,9 GB): GPU de 12-16 GB (RTX 4080, RTX 4090).
  - f16 (18,5 GB): GPU de 24 GB (RTX 3090/4090, A5000) o división CPU/GPU.
- El mmproj añade 0,7 GB (Q8_0) o 1,0 GB (f16) si se usa la capacidad multimodal.
- GPUs recomendadas: cualquier GPU compatible con llama.cpp; para producción, RTX 4090 o A100 ofrecen mayor throughput. No hay mediciones oficiales de latencia.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en transformers puede servirse con vLLM o TGI, aunque no hay confirmación de soporte verificado.
- El tamaño total del repositorio es de 85,1 GB al descargar todas las variantes.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Piccolo-9B (este) | 9,2 B | GGUF (Q2_K a f16) | Apache 2.0 | Decision model, atención bidireccional, multimodal vía mmproj |
| Qwen3-8B (Alibaba) | 8 B | safetensors, GGUF comunitario | Apache 2.0 | LLM causal convencional, ecosistema amplio, contexto largo documentado |
| Gemma 2 9B (Google) | 9 B | safetensors, GGUF comunitario | Gemma license | Uso comercial con restricciones de la licencia Gemma |

La comparativa es orientativa: al no existir benchmarks publicados para Piccolo-9B en la información disponible, no es posible comparar rendimiento de forma objetiva. Su diferenciador declarado es la naturaleza de "decision model" con atención bidireccional frente a LLM causales estándar.

## Limitaciones y advertencias

- No hay benchmarks publicados ni documentación técnica del modelo base en la información disponible, por lo que su calidad real debe validarse empíricamente antes de uso en producción.
- Las cuantizaciones bajas (Q2_K, Q3_K_S/M) degradan apreciablemente la calidad, como muestra el propio gráfico de perplexidad enlazado en el repositorio; el autor recomienda Q4_K_S, Q4_K_M y Q8_0.
- Solo existen cuantizaciones estáticas; las weighted/imatrix no estaban disponibles en el momento de la publicación.
- El soporte de atención bidireccional puede no estar implementado en todos los runtimes GGUF; conviene verificar la compatibilidad con la versión de llama.cpp utilizada.
- Soporte de idiomas limitado a inglés y chino; el rendimiento en castellano no está documentado y probablemente no esté optimizado.
- Sesgos, riesgo de alucinación y restricciones de uso del modelo base: no disponible en la información proporcionada.
- La licencia Apache 2.0 del repositorio de cuantizaciones es permisiva, pero conviene confirmar la licencia y términos del modelo base (agentscope-ai/Piccolo-9B) para uso comercial.
- El repositorio fue creado recientemente (octubre de 2026) con pocas descargas (456) y sin likes, lo que indica escasa validación comunitaria hasta la fecha.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/Piccolo-9B-GGUF
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-9B
- Página de descargas con vista general: https://hf.tst.eu/model#Piccolo-9B-GGUF
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
