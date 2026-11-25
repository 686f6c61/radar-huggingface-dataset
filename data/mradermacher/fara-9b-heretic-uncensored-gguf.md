# mradermacher/fara-9b-heretic-uncensored-GGUF

## Resumen

fara-9b-heretic-uncensored-GGUF es la versión cuantizada en formato GGUF del modelo lmcfarlin/fara-9b-heretic-uncensored, un derivado "abliterated" (decensurado) del modelo Fara-9B de Microsoft, especializado en computer-use y automatización de navegador. Lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face que distribuye estáticamente versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo base es multimodal (visión-lenguaje) y está orientado a tareas de agente web: interpretar capturas de pantalla del navegador y ejecutar acciones sobre la interfaz.

Con 8.953.803.264 parámetros (aproximadamente 9B), el modelo se posiciona en el rango de tamaño que cabe en GPUs de consumo con cuantizaciones agresivas. La versión "heretic-uncensored" implica que se han eliminado o atenuado los mecanismos de rechazo y alineación de seguridad del modelo original mediante técnicas de abliteration, lo que lo hace adecuado para investigación sobre comportamiento de modelos y para escenarios donde las negativas del modelo base resultan un obstáculo, pero también conlleva riesgos importantes de uso indebido.

La relevancia de esta ficha radica en que combina tres tendencias actuales: los agentes de computer-use (CUA), la cuantización GGUF para despliegue local y la modificación de alineación mediante abliteration. El repo ocupa 83,4 GB e incluye múltiples cuantizaciones estáticas, desde Q2_K hasta f16, además de los ficheros mmproj necesarios para el procesamiento multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), basada en Fara-9B; detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16; también disponibles quants imatrix en repo i1-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |
| Modelo base | lmcfarlin/fara-9b-heretic-uncensored (a su vez derivado de Fara-9B de Microsoft) |
| Tamaño del repo | 83,4 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Por los tags y el modelo base se deduce que se trata de un transformer multimodal con capacidad de visión-lenguaje, diseñado específicamente para computer-use: procesa capturas de pantalla y genera acciones de interfaz (clics, escritura, navegación). El componente mmproj (proyector multimodal) presente en el repo confirma la integración de un encoder visual con el modelo de lenguaje.

El modelo base Fara-9B procede de Microsoft y está orientado a la automatización de navegador y tareas de agente web. La variante "heretic-uncensored" ha sido sometida a un proceso de abliteration que elimina las direcciones de activación asociadas al rechazo de peticiones, reduciendo la tendencia del modelo a negarse a responder. No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La cuantización la realiza mradermacher con su pipeline estándar (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1).

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes y capturas de pantalla (visión-lenguaje) mediante el proyector multimodal mmproj.
- Computer-use y control de interfaz: interpretación de pantallas y generación de acciones para automatizar navegador.
- Agente web y browser automation: navegación multi-paso orientada a objetivos.
- Soporte de razonamiento multi-paso para tareas de agente (magentic).
- Capacidad de tool calling / function calling: no confirmada explícitamente en la información disponible.
- Multilingüismo: limitado a inglés según los metadatos.
- Modo "uncensored": menor probabilidad de rechazo ante peticiones que el modelo base rechazaría.

## Casos de uso

- Automatización de pruebas de interfaz web: el modelo puede interpretar capturas de pantalla de una aplicación y generar secuencias de acciones (clics, relleno de formularios) para validar flujos de usuario en pipelines de QA, aprovechando su naturaleza de agente de computer-use.
- Investigación sobre alineación y seguridad: al ser una variante abliterated, permite estudiar cómo cambia el comportamiento del modelo al eliminar los mecanismos de rechazo, comparándolo con el Fara-9B original.
- Agentes de navegador para extracción de datos: navegación autónoma por sitios web para recopilar información estructurada, con la ventaja de ejecutarse localmente en GGUF mediante llama.cpp.
- Prototipado de asistentes de escritorio: integración en aplicaciones que necesitan comprender la pantalla del usuario y sugerir o ejecutar acciones, desplegable en hardware de consumo gracias a las cuantizaciones Q4.
- Evaluación de robustez de agentes CUA: el modelo sirve como sujeto de prueba para medir tasas de éxito en tareas de automatización de navegador bajo distintas cuantizaciones (Q2 a Q8), analizando la degradación de capacidad agéntica con la compresión.
- Entornos sin conectividad o con requisitos de privacidad: al ejecutarse localmente con llama.cpp u Ollama, permite automatización de navegador sin enviar capturas de pantalla a APIs externas, útil en sectores regulados.
- Generación de contenido sin restricciones de rechazo: escenarios de escritura creativa o investigación donde las negativas del modelo base interrumpen el flujo, siempre con las advertencias de la sección de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje, sin contar el proyector visual ni el contexto):
  - Q2_K: ~4,0 GB
  - Q3_K_M: ~4,8 GB
  - Q4_K_M: ~5,8 GB
  - Q5_K_M: ~6,6 GB (estimado a partir de Q5_K_S de 6,4 GB)
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18,0 GB
- Añadir ~0,7 GB (mmproj Q8_0) o ~1,0 GB (mmproj f16) para las capacidades de visión, más la memoria del contexto KV.
- GPU recomendadas: RTX 4090 (24 GB) permite Q8_0 o f16 con contexto moderado; RTX 3090/4080 (16-24 GB) para Q6_K y Q8_0; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4_K_M y Q5; GPUs de 8 GB pueden ejecutar Q4_K_S con contexto reducido. Para despliegue servidor, A100 o H100 si se busca throughput alto, aunque el tamaño no las requiere.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 6-8 GB hasta Q8_0 en GPUs de 12-16 GB o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Los tags indican endpoints_compatible. Para el modelo base en safetensors, transformers. No se menciona soporte explícito de vLLM o TGI para esta versión GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| fara-9b-heretic-uncensored-GGUF (este) | ~9B | no disponible | Computer-use multimodal, decensurado | MIT | GGUF |
| Fara-9B (Microsoft, original) | ~9B | no disponible | Computer-use multimodal, alineado | no disponible en esta ficha | safetensors |
| Qwen2.5-VL-7B | ~7B | no disponible en esta ficha | Visión-lenguaje general | no disponible en esta ficha | safetensors, GGUF |
| UI-TARS-7B | ~7B | no disponible en esta ficha | Agente de interfaz gráfica | no disponible en esta ficha | safetensors |

La comparación se limita a categorías; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido dañino, ofensivo o ilegal. No apto para despliegue orientado al público sin filtros adicionales.
- Riesgo elevado de alucinación en tareas de agente: la interpretación de capturas de pantalla y la generación de acciones de interfaz pueden producir clics o entradas erróneas; requiere supervisión y validación en producción.
- Idioma: solo inglés según los metadatos; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada: limita la planificación de conversaciones o tareas de agente de largo horizonte.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías; la responsabilidad legal por el contenido generado recae en el desplegador.
- Procedencia: es una cuantización de un derivado de la comunidad de un modelo de Microsoft; no hay validación oficial de Microsoft sobre esta variante.
- Cuantizaciones bajas (Q2_K, Q3) degradan especialmente las capacidades de razonamiento y percepción visual; para tareas de computer-use se recomienda Q4_K_M o superior.
- El repo ocupa 83,4 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- Sin datos de benchmarks: no es posible verificar la calidad frente al Fara-9B original ni frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/fara-9b-heretic-uncensored-GGUF
- Modelo base (safetensors): https://huggingface.co/lmcfarlin/fara-9b-heretic-uncensored
- Quants imatrix: https://huggingface.co/mradermacher/fara-9b-heretic-uncensored-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#fara-9b-heretic-uncensored-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
