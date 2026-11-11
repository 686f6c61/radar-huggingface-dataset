# mradermacher/rosa-qwen3-14b-i1-GGUF

## Resumen

ROSA Qwen3 14B es un modelo de lenguaje conversacional derivado de la familia Qwen3, afinado mediante un pipeline de LoRA/QLoRA con SFT y DPO sobre el modelo base `marcoeg/rosa-qwen3-14b`. El modelo original fue desarrollado por el usuario marcoeg y esta especializado en mantener una persona ("ROSA") en interacciones conversacionales, segun indican las etiquetas de la model card. La version aqui descrita es una cuantizacion GGUF realizada por mradermacher, que facilita su ejecucion en hardware de consumo mediante llama.cpp, Ollama y otros runtimes compatibles con GGUF.

El modelo cuenta con 14.768.307.200 parametros (aproximadamente 14,8 mil millones) y una licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las del modelo base. El repositorio incluye cuantizaciones estaticas e imatrix (i1) en un amplio rango de tamanos, desde 3,9 GB (IQ1_M) hasta 12,2 GB (Q6_K), lo que permite desplegarlo en GPUs consumer con 8-16 GB de VRAM segun la cuantizacion elegida.

Su relevancia actual radica en que combina el rendimiento de la arquitectura Qwen3 de 14B con un ajuste fino orientado a persona y conversacion, empaquetado en formato GGUF para inferencia local eficiente. Es una opcion practica para desarrolladores que necesitan un asistente conversacional con identidad definida ejecutandose en infraestructura propia, sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3), afinada con LoRA/QLoRA |
| Parametros totales | 14.768.307.200 (~14,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (imatrix); cuantizaciones estaticas en repo hermano |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3 con aproximadamente 14,8 mil millones de parametros. El proceso de afinado descrito en las etiquetas incluye LoRA y QLoRA combinados con SFT (supervised fine-tuning) y DPO (direct preference optimization) sobre el modelo `marcoeg/rosa-qwen3-14b`. Esta combinacion sugiere un entrenamiento en dos fases: primero un ajuste supervisado sobre datos conversacionales para definir la persona ROSA, y despues una optimizacion por preferencias para alinear el estilo de respuesta. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de RLHF/DPO en la informacion proporcionada.

La cuantizacion realizada por mradermacher emplea el metodo imatrix (importance matrix), que pondera los pesos segun su relevancia para reducir la perdida de calidad en cuantizaciones agresivas. El repositorio incluye tanto el fichero imatrix (0,1 GB) para generar cuantizaciones propias como un conjunto de cuantizaciones i1 precalculadas. Las cuantizaciones estaticas equivalentes estan disponibles en el repositorio `mradermacher/rosa-qwen3-14b-GGUF`.

## Capacidades

- Generacion de texto conversacional en ingles con una persona definida (ROSA).
- Razonamiento y respuesta multi-turno, gracias al ajuste SFT/DPO sobre el modelo base Qwen3.
- Capacidades heredadas de Qwen3 en codigo y matematicas (no verificadas especificamente para este afinado).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada; depende de las capacidades del modelo base Qwen3 y del template aplicado.
- Soporte de agentes y razonamiento multi-paso: no confirmado para este afinado concreto.
- Capacidades multilingues: limitadas al ingles segun la model card (`language: en`).
- Modo thinking: no disponible en la informacion proporcionada.
- Vision y audio: no disponibles.

## Casos de uso

- Asistente conversacional con identidad de marca: el modelo mantiene una persona coherente ("ROSA") a lo largo de conversaciones multi-turno, adecuado para chatbots de atencion al cliente o asistentes virtuales donde la consistencia de tono y estilo es un requisito.
- Despliegue local en estaciones de trabajo: con cuantizaciones de 8-9 GB (i1-Q4_K_M, i1-IQ4_XS) puede ejecutarse en GPUs consumer de 12-16 GB, permitiendo prototipado rapido sin coste de API.
- Generacion de contenido en ingles: redaccion de textos conversacionales, respuestas y material divulgativo donde se requiera un estilo definido y controlado.
- Integracion en pipelines de CI/CD para pruebas de persona: usar el modelo como sujeto de pruebas automatizadas de calidad conversacional, comparando respuestas contra criterios de estilo.
- Investigacion sobre alineacion y persona: el pipeline SFT+DPO documentado en las etiquetas lo convierte en un caso de estudio para experimentos de ajuste fino con preferencias.
- Evaluacion comparativa de cuantizaciones: el amplio rango de cuantizaciones i1 (de 3,9 a 12,2 GB) permite medir el impacto de la compresion en la calidad conversacional en un mismo modelo.
- Chatbot de soporte en entornos air-gapped: al ser GGUF y Apache 2.0, puede desplegarse en infraestructura sin conexion externa, util en entornos con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion):
  - i1-IQ1_M (3,9 GB): ~4-5 GB de VRAM.
  - i1-IQ2_M (5,4 GB): ~6 GB de VRAM.
  - i1-IQ3_M (7,0 GB): ~7-8 GB de VRAM.
  - i1-IQ4_XS (8,2 GB): ~9 GB de VRAM.
  - i1-Q4_K_M (9,1 GB): ~10 GB de VRAM.
  - i1-Q6_K (12,2 GB): ~13 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K con holgura; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M o IQ4_XS; RTX 4060 Ti 16 GB o RTX 3060 12 GB para cuantizaciones Q3/IQ3; A100/H100 no necesarias para este tamano, aunque validas para despliegue multi-usuario.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas usando cuantizaciones IQ2/IQ3; con 12-16 GB se accede a Q4/IQ4 con buena calidad.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta `ollama` presente), y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers y safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| rosa-qwen3-14b-i1-GGUF (este) | ~14,8B | no disponible | apache-2.0 | GGUF (imatrix) | Afinado de persona sobre Qwen3 14B, solo ingles |
| Qwen3 14B (base) | ~14,8B | no disponible | apache-2.0 | safetensors, GGUF | Modelo base sin afinado de persona; multilingue |
| rosa-qwen3-14b (original) | ~14,8B | no disponible | apache-2.0 | safetensors | Version sin cuantizar del mismo afinado |
| rosa-qwen3-14b-GGUF (estatico) | ~14,8B | no disponible | apache-2.0 | GGUF (estatico) | Mismas cuantizaciones sin imatrix |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Qwen3, puede heredar sesgos del corpus original y del dataset de afinado.
- Riesgo de alucinacion: presente como en cualquier LLM de este tamano; el ajuste DPO puede aumentar la confianza en respuestas erroneas si el dataset de preferencias no penalizo ese comportamiento.
- Limitaciones de idioma: la model card declara unicamente ingles (`language: en`); el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior al del Qwen3 base multilingue.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible; conviene verificar la configuracion del modelo base antes de usarlo en tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base `marcoeg/rosa-qwen3-14b` y de Qwen3 por si imponen condiciones adicionales (atribucion, etc.).
- Caveat de produccion: las cuantizaciones por debajo de Q4 (IQ1, IQ2, Q2_K) degradan notablemente la calidad; para uso en produccion se recomienda i1-Q4_K_M o superior.
- Persona especifica: el ajuste esta orientado a la identidad "ROSA"; usarlo fuera de ese contexto puede producir respuestas inconsistentes con el tono esperado por el desarrollador.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/rosa-qwen3-14b-i1-GGUF
- Modelo base: https://huggingface.co/marcoeg/rosa-qwen3-14b
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/rosa-qwen3-14b-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#rosa-qwen3-14b-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
