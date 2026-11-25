# mradermacher/lumorux-1.0-i1-GGUF

## Resumen

Lumorux 1.0 es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) afinado mediante QLoRA sobre una base de la familia Qwen, según indican las etiquetas del repositorio. Está especializado en generación de código para desarrollo web, modelado 3D, Blender y Three.js, además de aplicaciones interactivas. El modelo original lo desarrolla Lumorux; esta ficha describe la versión cuantizada en formato GGUF publicada por mradermacher.

La relevancia de esta publicación radica en que pone a disposición del ecosistema local (llama.cpp, Ollama y derivados) un conjunto amplio de cuantizaciones con matrices de importancia (imatrix), desde IQ1_S de 2,0 GB hasta Q6_K de 6,4 GB. Esto permite ejecutar un modelo de 7,6 mil millones de parámetros en hardware de consumo, algo especialmente útil para tareas de generación de código y prototipado 3D en entornos sin GPU de datacenter.

La licencia es Apache 2.0 y el único idioma declarado es el inglés. El repositorio tiene un tamaño de 89,0 GB debido a la gran cantidad de variantes de cuantización incluidas, y registra 744 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, según etiqueta `qwen`); detalles específicos no disponibles |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix, prefijo i1) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen`, que sitúa el modelo base en la familia Qwen de Alibaba. Con 7.615.616.512 parámetros, se trata de un transformer denso de escala 7B, no de una arquitectura MoE. El ajuste se realizó mediante QLoRA sobre el modelo base Lumorux/lumorux-1.0, según las etiquetas de la model card.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Las etiquetas temáticas (code-generation, web-development, blender, three-js, 3d-modeling, applications) sugieren un corpus de ajuste orientado a código y flujos de trabajo 3D, pero no se aportan cifras. Esta versión concreta es una cuantización con imatrix generada por mradermacher, que aplica matrices de importancia para mejorar la calidad de las cuantizaciones de baja precisión; no implica reentrenamiento.

## Capacidades

- Generación de código para desarrollo web (HTML, CSS, JavaScript) y aplicaciones interactivas.
- Generación de scripts y contenido para Blender y Three.js, orientado a modelado 3D y escenas web.
- Conversación multi-turno (etiqueta `conversational`).
- Razonamiento y generación de texto general, heredado del modelo base Qwen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistente de código para desarrollo web: el modelo puede generar componentes HTML/CSS/JS y aplicaciones interactivas, integrándose en editores o pipelines de revisión de código donde se requiera un modelo local de 7B con licencia permisiva.
- Prototipado de escenas Three.js: útil para generar bocetos de escenas 3D en el navegador a partir de descripciones en lenguaje natural, acelerando la iteración de prototipos en estudios pequeños.
- Automatización de scripts en Blender: generación de scripts Python para Blender que automaticen tareas de modelado, materiales o renderizado, ejecutables en estaciones de trabajo sin conexión a servicios en la nube.
- Despliegue en entornos air-gapped: al estar disponible en GGUF y con licencia Apache 2.0, puede ejecutarse en máquinas sin acceso a internet para tareas de generación de código en entornos con requisitos de confidencialidad.
- Educación y formación en programación: un modelo local de 7B permite desplegar tutores de código en aulas o talleres sin depender de APIs externas ni costes por token.
- Experimentación con cuantizaciones: el amplio conjunto de variantes (desde IQ1_S hasta Q6_K) permite comparar el equilibrio calidad/tamaño en hardware modesto, útil para investigación sobre cuantización con imatrix.
- Chat conversacional técnico en inglés: para consultas de desarrollo y explicaciones de código en inglés, con contexto multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): aproximadamente 2,0 GB (IQ1_S), 4,8 GB (Q4_K_M, recomendada por el autor), 5,5 GB (Q5_K_M) y 6,4 GB (Q6_K), a los que hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: para las cuantizaciones Q4_K_M y superiores, una GPU de 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070) es suficiente; para Q6_K conviene 8-12 GB (RTX 4070 Ti, RTX 4080). En datacenter, A100 o H100 no son necesarias para este tamaño, pero permitirían mayor throughput con batching.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando cuantizaciones Q4 o inferiores; las variantes IQ2 e IQ1 caben en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, text-generation-webui, koboldcpp). El modelo base en safetensors es compatible con transformers y, presumiblemente, con vLLM y TGI, aunque no se confirma en la información.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lumorux 1.0 (i1-GGUF) | 7,6B | no disponible | Apache 2.0 | GGUF | Especializado en código web y 3D (Blender, Three.js) |
| Qwen2.5-Coder-7B | 7,6B | 32K (versión base, según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Referencia en generación de código; contexto mayor |
| CodeLlama-7B | 6,7B | 16K | Llama 2 (uso comercial con restricciones) | safetensors, GGUF | Orientado a código general, sin foco en 3D |
| DeepSeek-Coder-6.7B | 6,7B | 16K | DeepSeek License (uso comercial permitido con condiciones) | safetensors, GGUF | Fuerte en código, sin especialización 3D |

La comparación se basa en datos públicos de los modelos alternativos; para Lumorux 1.0 no se dispone de benchmarks que permitan contrastar rendimiento real. La ventaja diferencial de Lumorux es su especialización declarada en Blender y Three.js, junto con la licencia Apache 2.0 y la disponibilidad inmediata de cuantizaciones imatrix.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre datos web en inglés, es probable que herede sesgos de ese corpus.
- Riesgo de alucinación: no cuantificado; como todo modelo de 7B, puede generar APIs, funciones o sintaxis inexistentes, especialmente en dominios especializados como Blender o Three.js.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Longitud de contexto: no especificada; conviene verificarla antes de usarlo en tareas que requieran ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución; conviene revisar la licencia del modelo base Lumorux/lumorux-1.0 por si añade condiciones.
- Caveat de producción: las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; para uso en producción se recomienda Q4_K_M o superior. El modelo no declara soporte de tool calling, por lo que no debe asumirse en pipelines de agentes sin validación previa.
- Fecha de creación del repositorio: 2026-11-21 (según metadatos); verificar la vigencia del modelo base antes de adoptarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lumorux-1.0-i1-GGUF
- Modelo base: https://huggingface.co/Lumorux/lumorux-1.0
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/lumorux-1.0-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#lumorux-1.0-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
