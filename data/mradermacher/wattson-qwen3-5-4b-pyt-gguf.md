# mradermacher/wattson-qwen3.5-4b-pyt-GGUF

## Resumen

Wattson Qwen3.5 4B (PyT) es un modelo lingüístico de 4.205.751.296 parámetros desarrollado por PromptExecutionAU como un ajuste fino con LoRA fusionado sobre la familia Qwen3.5 de 4B de Alibaba. Su especialización es el dominio de los sistemas de energía eléctrica (power systems), con soporte explícito para la librería pandapower, utilizada habitualmente para el análisis y simulación de redes eléctricas. El modelo incorpora además capacidades de tool calling y un modo de razonamiento (thinking).

La ficha que se presenta corresponde al repositorio de cuantizaciones GGUF publicado por mradermacher, un cuantizador conocido por generar versiones estáticas de modelos populares para su ejecución local. Este repositorio no contiene los pesos originales, sino entre 11 y 13 variantes cuantizadas que van desde Q2_K (2,0 GB) hasta f16 (8,5 GB), lo que permite ejecutar el modelo en hardware modesto, incluidas GPU de consumo e incluso CPU.

Su relevancia actual radica en la escasez de modelos abiertos especializados en ingeniería eléctrica y simulación de redes: dominios técnicos como pandapower requieren conocimiento específico que los modelos generalistas suelen manejar con dificultad. Al ser un modelo de 4B con licencia Apache 2.0 y formato GGUF, resulta accesible para despliegues locales en entornos de ingeniería y docencia. El modelo es conversacional, soporta llamadas a herramientas y, según los archivos incluidos, dispone de un suplemento multimodal (mmproj).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), ajuste fino LoRA fusionado |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj-Q8_0 y mmproj-f16 como suplemento multimodal) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (en este repositorio); el modelo base original usa safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5 4B, una arquitectura transformer densa de la familia Qwen de Alibaba. Sobre esta base, PromptExecutionAU aplicó un ajuste fino mediante LoRA que posteriormente fue fusionado en los pesos (lora-merged), de modo que el resultado final es un modelo único de 4.205.751.296 parámetros sin adaptadores separados. La especialización se centra en sistemas de energía eléctrica y en el uso de pandapower, una librería de Python para simulación de flujo de carga y análisis de redes de distribución.

Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. Sí consta en las etiquetas del modelo que soporta tool calling y modo de razonamiento (thinking), heredados presumiblemente de las capacidades de la familia Qwen3.5. La presencia de archivos mmproj (multi-modal supplement) en el repositorio de cuantizaciones indica que el modelo base incluye un proyector multimodal compatible con llama.cpp, aunque el alcance exacto de esta capacidad no está documentado en la model card.

## Capacidades

- Generación de texto conversacional en inglés, orientada al dominio de sistemas de energía eléctrica.
- Asistencia con pandapower: generación y explicación de código para modelado y simulación de redes eléctricas (etiqueta pandapower).
- Tool calling: soporte de llamadas a herramientas, útil para integrar el modelo con funciones externas o APIs.
- Modo de razonamiento (thinking): el modelo puede emplear razonamiento extendido antes de responder, según las etiquetas del repositorio.
- Capacidad multimodal parcial: el repositorio incluye archivos mmproj (Q8_0 y f16) como suplemento multimodal para uso con llama.cpp.
- Ejecución local eficiente gracias a la amplia gama de cuantizaciones GGUF disponibles.

## Casos de uso

- Generación de scripts de pandapower: un ingeniero puede pedir al modelo que cree una red de distribución con pandapower (barras, líneas, cargas, generadores) y ejecute un cálculo de flujo de carga; el ajuste fino específico del dominio reduce los errores típicos de API que cometen los modelos generalistas.
- Asistente técnico para análisis de redes: consulta sobre interpretación de resultados de simulación, criterios de dimensionamiento de cables o configuración de elementos de red, con respuestas adaptadas a la terminología de ingeniería eléctrica.
- Automatización de estudios de flujo de carga: mediante tool calling, el modelo puede integrarse en pipelines que ejecuten simulaciones de pandapower de forma iterativa, por ejemplo para barridos de escenarios de carga o estudios de integración de renovables.
- Docencia e investigación en ingeniería eléctrica: al ser un modelo de 4B ejecutable en portátiles, sirve como tutor local para estudiantes que aprenden pandapower sin depender de servicios en la nube.
- Agentes de ingeniería multi-paso: combinando thinking y tool calling, puede encadenar tareas como generar una red, simularla, analizar violaciones de tensión y proponer correcciones.
- Documentación técnica asistida: redacción y revisión de informes sobre estudios de redes, convirtiendo resultados numéricos de simulación en texto técnico en inglés.
- Prototipado local en entornos con restricciones de datos: la licencia Apache 2.0 y la ejecución offline permiten su uso en empresas de energía con políticas estrictas de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original del modelo base (PromptExecutionAU/wattson-qwen3.5-4b-pyt) no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ningún otro benchmark estándar, y el repositorio de cuantizaciones de mradermacher tampoco aporta mediciones de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, según la tabla de cuantizaciones):
  - Q2_K: ~2,0 GB; Q3_K_M: ~2,4 GB; IQ4_XS: ~2,6 GB
  - Q4_K_S / Q4_K_M: ~2,7-2,8 GB (recomendadas por el autor)
  - Q5_K_M: ~3,2 GB; Q6_K: ~3,6 GB; Q8_0: ~4,6 GB; f16: ~8,5 GB
  - Añadir ~0,5-0,8 GB si se usa el suplemento multimodal (mmproj), más la memoria del contexto.
- GPU recomendadas: cualquier GPU de consumo con 4-6 GB de VRAM (RTX 3060, RTX 4060) ejecuta cómodamente Q4_K_M; con 8 GB (RTX 4070, RTX 3090) puede usarse Q8_0 con contexto amplio. No se requieren A100 ni H100 para este tamaño.
- CPU: al ser GGUF, funciona también en CPU puro vía llama.cpp; con Q4_K_M (~2,8 GB) es viable en portátiles con 8-16 GB de RAM, aunque con latencia considerablemente mayor que en GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers, vLLM o TGI, aunque estos runtimes no están mencionados explícitamente en la model card.
- Latencia y throughput: no disponible; no se publican mediciones. En GPU de consumo con Q4_K_M, un modelo de 4B típicamente supera los 30 tokens/s, pero esto es una estimación no verificada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| wattson-qwen3.5-4b-pyt (este) | 4,2 B | No disponible | Apache 2.0 | Sistemas de energia, pandapower, tool calling | GGUF (mradermacher) y safetensors (base) |
| Qwen3.5 4B (base original) | 4,2 B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Generalista, con thinking y tool calling | Safetensors en HuggingFace |
| Qwen3 4B (generacion anterior) | 4 B | Hasta 32.000-131.000 tokens segun variante | Apache 2.0 | Generalista | Safetensors y GGUF amplios |

Nota: la comparativa se limita a la familia Qwen por falta de información sobre alternativas específicas en el dominio de sistemas de energía; no constan en la información proporcionada otros modelos fine-tuned sobre pandapower con los que contrastar rendimiento especializado.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés (en); su rendimiento en castellano no está documentado y probablemente sea inferior al del inglés.
- Riesgo de alucinación: como todo LLM, puede generar código de pandapower plausible pero incorrecto (nombres de parámetros erróneos, valores físicos irreales); siempre debe validarse la salida ejecutándola en un entorno controlado.
- Contexto: la longitud de ventana no está documentada en la información disponible; no puede garantizarse su adecuación para documentos técnicos largos.
- Cuantización: las variantes Q2_K y Q3_K_S/M degradan apreciablemente la calidad respecto a f16; para uso serio se recomienda Q4_K_M o superior, como indica el propio cuantizador.
- Multimodalidad poco documentada: los archivos mmproj existen, pero la model card no describe qué modalidades soporta ni cómo usarlas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos de la familia Qwen3.5 base, que no están detallados en la información proporcionada.
- Benchmarks ausentes: al no existir evaluaciones publicadas, la calidad especializada del modelo debe validarse empíricamente antes de usarlo en producción.
- Repositorio de terceros: esta ficha cubre la cuantización de mradermacher; para soporte del modelo en sí, el canal adecuado es el repositorio base de PromptExecutionAU.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/wattson-qwen3.5-4b-pyt-GGUF
- Modelo base original: https://huggingface.co/PromptExecutionAU/wattson-qwen3.5-4b-pyt
- Página de descargas resumida de mradermacher: https://hf.tst.eu/model#wattson-qwen3.5-4b-pyt-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
