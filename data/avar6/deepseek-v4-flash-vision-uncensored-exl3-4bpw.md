# avar6/DeepSeek-V4-Flash-Vision-Uncensored-exl3-4bpw

## Resumen

DeepSeek-V4-Flash-Vision-Uncensored-exl3-4bpw es una cuantizacion EXL3 (trellis) del modelo orcarouter/DeepSeek-V4-Flash-Vision-Uncensored, publicada por el usuario avar6. Se trata de un modelo vision-language con arquitectura Mixture of Experts (MoE) y capacidades de razonamiento, empaquetado especificamente para su uso con TabbyAPI y exllamav3, incluyendo soporte de offload de expertos a CPU. El repositorio contiene 23 shards de safetensors con un total de aproximadamente 146 GB y una tasa de bits final medida de 4,04 bpw.

El modelo base conserva la arquitectura deepseek_v4 con 78.083.656.894 parametros totales, segun los metadatos de safetensors. La cuantizacion mantiene los embeddings en fp16 sin cuantizar, aplica 4 bits a las lineas expertas y al draft MTP/DSpark, y 6 bits al output head y a la torre de vision. El codebook empleado es mul1, requisito imprescindible para que exllamav3 pueda realizar el split de expertos con offload a CPU.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE vision-language de gran tamano en configuraciones de VRAM relativamente modestas (56 GB verificados en 2 GPUs) mediante offload selectivo de expertos, manteniendo un throughput de aproximadamente 23 tok/s. La licencia MIT facilita su adopcion en entornos comerciales, si bien el caracter "uncensored" del modelo base exige controles adicionales en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer con torre de vision, segun tag deepseek_v4 |
| Parametros totales | 78.083.656.894 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens verificados en la configuracion de referencia (max_seq_len superior requiere mas VRAM) |
| Tipos de cuantizacion | EXL3 trellis 4,04 bpw (expertos 4 bits, output head 6 bits, draft MTP/DSpark 4 bits, vision tower 6 bits, embeddings fp16 sin cuantizar, codebook mul1) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3, 23 shards, ~146 GB) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura deepseek_v4, un transformer con capas MoE: la cuantizacion confirma la existencia de 40 capas MoE con 64 expertos residentes y 192 expertos en CPU por capa en la configuracion verificada. Incorpora ademas un modulo MTP/DSpark draft, lo que sugiere decodificacion especulativa o multi-token prediction integrada, y una torre de vision para entrada image-text-to-text. Los detalles sobre el numero de tokens de entrenamiento, la composicion del dataset y el proceso de alineacion (RLHF/DPO) del modelo base no estan disponibles en la informacion proporcionada.

La innovacion tecnica principal de esta publicacion es el empaquetado EXL3 con codebook mul1, disenado especificamente para que exllamav3 pueda aplicar `cpu_moe_split_experts` y descargar expertos a CPU. Los packs construidos con el codebook mcg no admiten dicho offload, lo que convierte la eleccion del codebook en un requisito funcional, no cosmetico. El resultado es un artefacto de 4,04 bpw que preserva los embeddings en fp16 y refuerza la precision del output head y de la torre de vision a 6 bits.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat propia (`chat_template.jinja`).
- Razonamiento (tag `reasoning`) y capacidad de vision verificada (pipeline image-text-to-text).
- Procesamiento conjunto de imagen y texto: la torre de vision se mantiene a 6 bits para preservar calidad.
- Decodificacion especulativa o multi-token prediction mediante el modulo MTP/DSpark draft incluido en el pack.
- Ejecucion eficiente en memoria mediante offload de expertos MoE a CPU con exllamav3.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un modelo vision-language de gran tamano en infraestructura de 2 GPUs con 56 GB de VRAM totales: gracias al offload de las 40 capas MoE (64 expertos residentes y 192 en CPU por capa), se obtienen unos 23 tok/s con `cpu_moe_threads: 16` y `cache_size: 131072`, lo que hace viable servir un MoE de 78B en hardware de gama profesional sin recurrir a clusters.
- Analisis de documentos con imagenes y contexto largo: la ventana verificada de 131.072 tokens permite procesar informes, capturas o diagramas junto con texto extenso en una sola pasada, adecuado para extraccion de datos estructurados a partir de PDFs escaneados o paneles de control.
- Asistentes conversacionales con memoria extensa: la combinacion de contexto de 131K y plantilla de chat permite mantener conversaciones multi-turno con historial largo sin truncamientos agresivos.
- Prototipado e investigacion sobre modelos "uncensored": la licencia MIT y el formato EXL3 facilitan experimentos de alineacion, red teaming y evaluacion de sesgos en entornos controlados.
- Generacion aumentada por recuperacion (RAG) multimodal: el modelo puede recibir imagenes recuperadas junto con fragmentos de texto y sintetizar respuestas, aprovechando el throughput de 23 tok/s para pipelines interactivos.
- Inferencia en local con TabbyAPI: la integracion nativa con exllamav3 y el formato de 23 shards permiten levantar un endpoint compatible con la API de OpenAI en estaciones de trabajo con 2 GPUs, sin depender de servicios en la nube.
- Evaluacion comparativa de tecnicas de cuantizacion: el pack documenta bitrate medido (4,04 bpw) y configuracion de offload reproducible, lo que lo convierte en una referencia util para estudiar el equilibrio entre precision y memoria en MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento medido es el throughput de generacion: aproximadamente 23 tok/s con 56 GB de VRAM en 2 GPUs, `cpu_moe_split_experts: 192`, `cpu_moe_threads: 16` y `cache_size: 131072`.

## Requisitos de hardware

- VRAM estimada: 56 GB verificados en configuracion de 2 GPUs con offload de las 40 capas MoE; no cabe en una unica GPU consumer de 24 GB.
- GPUs recomendadas: 2 GPUs con 28 GB cada una o superior (por ejemplo, 2x RTX 4090, 2x A6000, A100 80 GB); la configuracion verificada usa 2 GPUs con 56 GB agregados.
- Offload a CPU: 192 expertos por capa en CPU, con `cpu_moe_threads: 16`; requiere RAM del sistema suficiente para alojar los expertos descargados (el repo completo son ~146 GB, aunque solo una parte reside en CPU en cada momento).
- Cabe en consumer GPU: no en una sola; si en configuraciones multi-GPU con 2x RTX 4090 (48 GB) solo si se ajusta el reparto, ya que la referencia verificada usa 56 GB. No confirmado en 2x 4090.
- Opciones de despliegue: TabbyAPI con exllamav3 (soporte nativo de EXL3 y `cpu_moe_split_experts`). Otros runners (vLLM, llama.cpp, Ollama, TGI) no estan confirmados para este formato EXL3.
- Latencia y throughput: ~23 tok/s de generacion en la configuracion de referencia; latencia no disponible.
- Limitacion de contexto: `max_seq_len` superior a 131.072 requiere mas VRAM que la que ofrece el split de 2 GPUs en estos ajustes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| avar6/DeepSeek-V4-Flash-Vision-Uncensored-exl3-4bpw | 78,08B | 131.072 verificado | EXL3 4,04 bpw | MIT | Offload MoE a CPU, vision, ~23 tok/s en 2 GPUs |
| orcarouter/DeepSeek-V4-Flash-Vision-Uncensored (base) | 78,08B | no disponible | safetensors sin cuantizar | MIT | Modelo de referencia sin cuantizar; requiere mucha mas VRAM |
| Alternativas de mismo tamano y tarea | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo base esta marcado como "uncensored": cabe esperar una menor resistencia a generar contenido sensible, lo que exige filtros y politicas de moderacion adicionales en produccion.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad ni benchmarks en la informacion disponible.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento uniforme fuera del ingles o el chino sin evaluacion previa.
- La ventana de contexto esta limitada a 131.072 tokens en la configuracion de hardware de referencia; ampliarla requiere mas VRAM.
- El formato EXL3 con codebook mul1 solo es compatible con exllamav3/TabbyAPI para el offload de expertos; otros runners pueden no cargar el pack.
- El rendimiento de 23 tok/s depende de la configuracion exacta (2 GPUs, 56 GB, 16 hilos de CPU); variaciones en CPU, RAM o reparto de expertos alteraran el throughput.
- La cuantizacion a 4 bits en expertos puede degradar tareas de razonamiento fino o matematicas respecto al modelo sin cuantizar; no se han publicado comparativas de calidad.
- Aunque la licencia es MIT, el uso comercial del modelo "uncensored" puede conllevar obligaciones adicionales de cumplimiento normativo segun la jurisdiccion.
- El repositorio tiene muy pocas descargas (29) y ninguna validacion de la comunidad (0 likes); conviene tratar el artefacto con cautela y verificar su integridad antes de usarlo en produccion.

## Enlaces

- [HuggingFace: avar6/DeepSeek-V4-Flash-Vision-Uncensored-exl3-4bpw](https://huggingface.co/avar6/DeepSeek-V4-Flash-Vision-Uncensored-exl3-4bpw)
- [Modelo base: orcarouter/DeepSeek-V4-Flash-Vision-Uncensored](https://huggingface.co/orcarouter/DeepSeek-V4-Flash-Vision-Uncensored)
- [exllamav3 (repositorio de exllamav3)](https://github.com/turboderp-org/exllamav3)
- [TabbyAPI](https://github.com/theroyallab/tabbyAPI)
