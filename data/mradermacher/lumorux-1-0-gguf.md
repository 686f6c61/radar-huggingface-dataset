# mradermacher/lumorux-1.0-GGUF

## Resumen

lumorux-1.0 es un modelo de lenguaje especializado en generacion de codigo, desarrollo web y modelado 3D, desarrollado por Lumorux y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino (fine-tuning) mediante QLoRA sobre una base de la familia Qwen, segun las etiquetas del repositorio, con 7.615.616.512 parametros totales (aproximadamente 7,6 mil millones). El modelo esta orientado a tareas de programacion y a la generacion de aplicaciones web, con soporte declarado para herramientas como Blender y three.js.

La ficha que nos ocupa corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un colaborador habitual de la comunidad que genera cuantizaciones estaticas de modelos para su uso con llama.cpp y entornos compatibles. El repositorio original es Lumorux/lumorux-1.0, y esta version GGUF facilita el despliegue en hardware de consumo mediante cuantizaciones de 2, 4 y 16 bits.

El modelo es relevante para desarrolladores que necesitan un modelo compacto (7B) especializado en codigo y generacion de aplicaciones, con licencia permisiva (Apache 2.0) y pesos disponibles en GGUF para inferencia local. No se dispone de informacion publica sobre benchmarks, longitud de contexto o composicion del dataset de entrenamiento en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base de la familia Qwen, ajuste fino QLoRA) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_S, f16 (y segun la model card tambien Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, aunque solo tres aparecen con enlace y tamano detallado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base usa safetensors segun la libreria transformers |

## Arquitectura y entrenamiento

La informacion disponible indica que lumorux-1.0 es un ajuste fino mediante QLoRA sobre un modelo base de la familia Qwen (etiqueta "qwen" en el repositorio). QLoRA combina cuantizacion de 4 bits del modelo base con adaptadores de bajo rango entrenables, lo que permite ajustar modelos de 7B con requisitos de memoria reducidos. No se especifica el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Las etiquetas del repositorio sugieren que el entrenamiento se centro en generacion de codigo, desarrollo web, Blender, three.js y modelado 3D, ademas de "applications". No hay informacion disponible sobre innovaciones arquitectonicas especificas (atencion lineal, decodificacion especulativa, etc.) ni sobre la arquitectura exacta del transformer subyacente. La version GGUF fue generada por mradermacher con cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1), sin cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de codigo: el modelo esta ajustado especificamente para code-generation, con enfasis en desarrollo web.
- Desarrollo web: soporte declarado para generacion de aplicaciones y codigo web (etiqueta "web-development", "applications").
- Modelado 3D y Blender: capacitado para tareas relacionadas con Blender y three.js segun las etiquetas del repositorio.
- Conversacional: el repositorio incluye la etiqueta "conversational", lo que indica uso en dialogos multi-turno.
- Compatibilidad con endpoints: etiqueta "endpoints_compatible", orientada a despliegue via API.
- Multilingue: limitado al ingles ("en") segun la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD o asistentes de IDE para autocompletar y generar fragmentos de codigo, dado su ajuste especifico en code-generation.
- Desarrollo de aplicaciones web: generacion de componentes, scripts y estructuras de aplicaciones web, aprovechando la etiqueta "web-development" y "applications" del entrenamiento.
- Creacion de escenas 3D en Blender: el modelo puede asistir en la generacion de scripts de Python para Blender, automatizando tareas de modelado y configuracion de escenas.
- Generacion de codigo three.js: produccion de codigo JavaScript para visualizacion 3D interactiva en navegador, alineado con la etiqueta "three-js".
- Asistente conversacional para desarrolladores: uso en dialogos multi-turno para resolver dudas de programacion y web, gracias a la etiqueta "conversational".
- Despliegue local en hardware de consumo: las cuantizaciones GGUF (Q2_K de 3,1 GB, Q4_K_S de 4,6 GB) permiten ejecutar el modelo en estaciones de trabajo sin GPU de datacenter, ideal para prototipado y desarrollo offline.
- Integracion via API compatible con endpoints: despliegue en servicios que consumen modelos con la etiqueta "endpoints_compatible" para automatizar tareas de generacion de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB para Q2_K (3,1 GB de pesos), 5-6 GB para Q4_K_S (4,6 GB de pesos) y 16-18 GB para f16 (15,3 GB de pesos), incluyendo overhead de contexto y KV cache.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_S; RTX 4090 o A100/H100 para f16 si se busca maxima calidad.
- Cabe en consumer GPU: si, Q2_K y Q4_K_S caben en GPUs de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060, etc.); f16 requiere GPU de 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, entornos compatibles con GGUF; el modelo base usa transformers y es compatible con endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lumorux-1.0 (esta ficha) | 7,6 B | no disponible | Apache 2.0 | GGUF, safetensors | Ajuste QLoRA sobre Qwen, especializado en codigo y 3D |
| Qwen2.5-Coder-7B | 7,6 B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Base de codigo de referencia de la familia Qwen |
| CodeLlama-7B | 6,7 B | 16K (segun documentacion publica de Meta) | Llama 2 custom | safetensors, GGUF | Modelo de codigo de Meta, ampliamente usado |
| DeepSeek-Coder-6.7B | 6,7 B | 16K (segun documentacion publica de DeepSeek) | DeepSeek License | safetensors, GGUF | Especializado en codigo, con licencia propia |

Nota: los datos de contexto de los modelos comparables provienen de documentacion publica general y no de la informacion proporcionada en esta ficha; verificar antes de usarlos en produccion. No se dispone de benchmarks de lumorux-1.0 para una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Idiomas: el modelo esta declarado solo para ingles ("en"), por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto: se desconoce la longitud de contexto soportada, lo que limita la planificacion de casos de uso con documentos largos.
- Alucinacion: al ser un ajuste fino de 7B sin benchmarks publicados, existe riesgo de generacion de codigo incorrecto o APIs inventadas; se recomienda validacion automatizada en produccion.
- Sesgos: no se ha documentado la composicion del dataset de entrenamiento, por lo que no se pueden evaluar sesgos especificos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen subyacente y las obligaciones de atribucion.
- Cuantizaciones: las cuantizaciones de 2 bits (Q2_K) degradan la calidad; para produccion se recomienda Q4_K_S o superior.
- Madurez: el repositorio GGUF registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- Fecha de creacion: el repositorio data de noviembre de 2026, lo que sugiere que puede tratarse de un modelo reciente o con metadatos atipicos; verificar la integridad de los pesos antes de desplegarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lumorux-1.0-GGUF
- Modelo base: https://huggingface.co/Lumorux/lumorux-1.0
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#lumorux-1.0-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
