# hyukudan/MiniMax-M3.1-Flash-EXL3-EAQ-v1-3.06-bpw-mirror

## Resumen

Este repositorio no es un modelo nuevo, sino un espejo (mirror) byte a byte de la cuantización EXL3 `Mia-AiLab/MiniMax-M3.1-Flash-EXL3-EAQ-v1-3.06-bpw`, publicada por el usuario hyukudan para garantizar la reproducibilidad de sus experimentos con el motor `strix-halo-engine-lab`. El modelo subyacente es MiniMax-M3.1-Flash, un modelo multimodal (texto, imagen y vídeo) de MiniMax orientado a tareas agénticas, programación, computer use y ciberseguridad, que la compañía distribuye bajo licencia comunitaria.

La relevancia de este paquete concreto es práctica: comprime un modelo de 84.284.905.472 parámetros (84,28 B) hasta 3,06 bits por peso, dejando el conjunto en 171,04 GB repartidos en 49 archivos. Eso permite ejecutar un modelo con 60 capas y arquitectura MoE de 128 expertos enrutados en hardware de memoria unificada (dos nodos Strix Halo con tensor parallel sobre USB4), algo inviable con los pesos originales en precisión completa.

Incluye además dos artefactos auxiliares: `dspark/`, el borrador de decodificación especulativa de MiniMax (2,3 GB), y las capas de visión (1,7 GB), que mantienen la capacidad multimodal del modelo base pese a la cuantización de los expertos a 3 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `minimax_m3_vl` con mezcla de expertos (MoE): 60 capas, 3 capas densas con MLP y 57 capas MoE con 128 expertos enrutados, top-4, más un experto compartido |
| Parámetros totales | 84.284.905.472 (84,28 B), según los safetensors del repositorio |
| Parámetros activos | No disponible (la información describe 128 expertos con top-4 y experto compartido, pero no detalla el recuento de parámetros activos) |
| Longitud de contexto | 1.048.576 tokens declarados en la configuración del modelo base; la model card advierte que el contexto largo no se ha probado en este empaquetado. Salida de hasta 524.288 tokens según la ficha de NanoGPT |
| Tipos de cuantización | EXL3 a 3,06 bits por peso (bpw), etiquetado EAQ v1; existe también un empaquetado upstream a 3,55 bpw |
| Idiomas soportados | No disponible |
| Licencia | MiniMax Community License (`other` / `minimax-community`), con términos no comerciales y cláusulas específicas para uso comercial |
| Formato de pesos | `safetensors` cuantizados en EXL3 (20 shards para el modelo de texto, más `dspark/model-dspark-00001.safetensors`); requiere código personalizado (`custom_code`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal con mezcla de expertos: 60 capas en total, de las cuales las 3 primeras son densas con MLP y las 57 restantes son capas MoE con 128 expertos enrutados, activación top-4 y un experto compartido. El componente de visión se conserva en este empaquetado (1,7 GB), de modo que el modelo mantiene la entrada de imágenes y vídeo además de texto, con salida exclusivamente textual. El identificador de arquitectura en el config es `minimax_m3_vl` e incluye módulos Python propios (`configuration_minimax_m3_vl.py`, `image_processor.py`).

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada. La innovación técnica documentada en este repositorio no está en el entrenamiento, sino en el empaquetado: la cuantización EXL3 EAQ v1 generada con exllamav3 1.6.1 y la inclusión del borrador de decodificación especulativa DSpark, que lee los estados ocultos del modelo objetivo en las capas 3, 17, 31, 45 y 59. La model card advierte que, al tener los expertos a 3 bits, esos estados ocultos se alejan más de los del modelo original que en el pack de 3,55 bpw, por lo que la tasa de aceptación del borrador puede ser inferior.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto declarado de 1.048.576 tokens.
- Programación y tareas de ingeniería de software: el modelo base se promociona explícitamente para coding y tareas agénticas.
- Capacidades multimodales de entrada: acepta texto, imágenes y vídeo, y produce texto.
- Uso de herramientas (tool calling / function calling) y flujos agénticos de varios pasos, incluido computer use.
- Aplicaciones de ciberseguridad, según la comunicación oficial de MiniMax para M3.1 Flash.
- Decodificación especulativa mediante el borrador DSpark incluido en `dspark/`.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento extendido (thinking): no disponible en la información proporcionada.

## Casos de uso

- Automatización de atención al cliente con historiales largos: la ventana declarada de 1.048.576 tokens permite arrastrar conversaciones, documentación de producto y tickets previos sin trocear el contexto, aunque conviene validar el comportamiento real en longitudes cercanas al límite, ya que el autor no lo ha probado.
- Asistentes de programación sobre repositorios completos: con capacidad de tool calling, el modelo puede encadenar lectura de ficheros, ejecución de tests y aplicación de parches en un bucle agéntico, integrándose en pipelines de CI/CD como revisor o generador de correcciones.
- Análisis de documentación técnica con imágenes y vídeo: al conservar las capas de visión, admite capturas de pantalla, diagramas de arquitectura o grabaciones de interfaz junto al texto, útil para soporte de producto y elaboración de manuales.
- Agentes de computer use para tareas repetitivas de back office: rellenado de formularios, navegación guiada y extracción de datos de aplicaciones web, apoyándose en la entrada visual y en la planificación multi-paso.
- Análisis asistido en ciberseguridad: triaje de alertas, resumen de informes de vulnerabilidades y generación de borradores de reglas de detección, con revisión humana obligatoria dado el riesgo de alucinación en dominios críticos.
- Procesamiento por lotes de corpus extensos en investigación: clasificación, resumen y extracción de entidades sobre documentos de decenas de miles de tokens en una sola pasada, ejecutado en los dos nodos Strix Halo del autor mediante su motor con TP2.
- Evaluación comparativa de cuantizaciones: este mirror sirve como referencia fija de revisión (commit `c33e7a6`) para medir la degradación de calidad y la tasa de aceptación de DSpark frente al pack de 3,55 bpw.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo y la del repositorio upstream no incluyen tablas de MMLU, HumanEval, GSM8K ni métricas de aceptación de la decodificación especulativa; solo se indica que el motor superó una "puerta de calidad de ocho textos" en modo Production, sin cifras asociadas. La documentación de MiniMax afirma una inferencia en línea aproximadamente tres veces más rápida y una reducción de costes del 70 % respecto a la generación anterior, pero son datos de su API propietaria y no de este empaquetado cuantizado.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 171,04 GB; el modelo de texto son aproximadamente 167 GB en 20 shards, más 2,3 GB de DSpark y 1,7 GB de visión. Hay que añadir la caché KV, que a contextos cercanos al millón de tokens crece de forma significativa.
- No cabe en ninguna GPU de consumo: una RTX 4090 (24 GB) o una RTX 5090 (32 GB) quedan muy lejos incluso con offload parcial agresivo.
- Configuración de referencia del autor: dos nodos Strix Halo (memoria unificada) con tensor parallel TP2 sobre USB4, con prefill y decode exactos según su README.
- GPU de datacenter: no hay datos publicados de ejecución en A100/H100 con este formato; el soporte de kernels EXL3 en esas arquitecturas no está documentado en la información disponible.
- Opciones de despliegue: ExLlamaV3 (exllamav3 1.6.1, versión con la que se generó la cuantización) y el motor propio `strix-halo-engine-lab`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. La tasa de aceptación del borrador DSpark en este pack de 3,06 bpw se espera inferior a la del pack de 3,55 bpw, según advierte la propia model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este mirror (`hyukudan/...-3.06-bpw-mirror`) | 84,28 B totales (MoE, activos no disponibles) | 1.048.576 declarados, no probados | safetensors EXL3 3,06 bpw, 171,04 GB, 49 archivos | MiniMax Community (no comercial, con condiciones) | Público, 0 descargas, revisión fijada |
| `Mia-AiLab/MiniMax-M3.1-Flash-EXL3-EAQ-v1-3.06-bpw` (upstream) | 84,28 B totales | 1.048.576 declarados, no probados | safetensors EXL3 3,06 bpw, ~167 GB texto + dspark + visión | MiniMax Community | Público, mantenido por el cuantizador original |
| Pack EXL3 a 3,55 bpw del mismo modelo base | 84,28 B totales | 1.048.576 declarados | safetensors EXL3 3,55 bpw (mayor tamaño) | MiniMax Community | Público, citado como referencia de calidad superior |
| `MiniMaxAI/MiniMax-M3.1-Flash` (base) | 84,28 B totales | 1.048.576 | Pesos originales en precisión completa | MiniMax Community | Público |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a otras familias de modelos abiertos de tamaño similar.

## Limitaciones y advertencias

- Licencia no comercial por defecto: cualquier uso comercial requiere mostrar de forma destacada "Built with MiniMax M3.1-Flash" y, por encima de 20 millones de dólares de facturación anual, autorización previa por escrito de MiniMax (api@minimax.io); por debajo, basta un aviso único. Revisar el apéndice de usos prohibidos del LICENSE.
- El repositorio upstream no incluye fichero LICENSE; este mirror copia literalmente el del modelo base. Conviene verificar los términos en el repositorio original de MiniMax antes de desplegar.
- Cuantización agresiva a 3,06 bpw: se espera degradación de calidad frente al modelo original y frente al pack de 3,55 bpw, especialmente en razonamiento matemático y código. No hay mediciones publicadas de esa pérdida.
- Menor tasa de aceptación esperada del borrador especulativo DSpark, ya que los estados ocultos de las capas 3, 17, 31, 45 y 59 se alejan más de los del modelo sin cuantizar.
- Contexto largo no validado: los 1.048.576 tokens provienen de la configuración del modelo base, pero el autor indica explícitamente que no se ha probado en este empaquetado.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en los casos de uso de ciberseguridad y computer use que promociona el fabricante; requiere verificación humana en producción.
- Sesgos: no hay información publicada sobre la composición del corpus de entrenamiento ni sobre evaluaciones de sesgo del modelo base.
- Idiomas soportados no documentados; no se puede asumir un rendimiento homogéneo fuera del inglés sin evaluación previa.
- Repositorio espejo con 0 descargas y 0 likes: no cuenta con validación de la comunidad y su función es la reproducibilidad de un experimento concreto, no el soporte a largo plazo.
- Requiere `custom_code` y una versión concreta de ExLlamaV3; la integración con stacks estándar (vLLM, TGI, llama.cpp) no está documentada.

## Enlaces

- Mirror en HuggingFace: https://huggingface.co/hyukudan/MiniMax-M3.1-Flash-EXL3-EAQ-v1-3.06-bpw-mirror
- Repositorio upstream de la cuantización (Mia-AiLab): https://huggingface.co/Mia-AiLab/MiniMax-M3.1-Flash-EXL3-EAQ-v1-3.06-bpw
- Revisión fijada del upstream: https://huggingface.co/Mia-AiLab/MiniMax-M3.1-Flash-EXL3-EAQ-v1-3.06-bpw/commit/c33e7a6619f0f12ac99098e07ec5e56acb7eeda9
- Modelo base (MiniMaxAI): https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash/blob/54e4e69dfc452b1e94a426c24a4fdeeaa8e3ad5e/LICENSE
- Motor y experimentos del autor: https://github.com/hyukudan/strix-halo-engine-lab
- Anuncio oficial de MiniMax M3.1 Flash: https://www.minimax.io/blog/minimax-m31f
- Página de producto de M3.1 Flash: https://agent.minimax.io/tools/m3.1-flash
- Ficha en NanoGPT: https://nano-gpt.com/models/text/minimax/minimax-m3.1-flash
