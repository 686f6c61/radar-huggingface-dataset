# ElytronSystems/Gemma-4-pulsar-k4

## Resumen

Gemma-4-pulsar-k4 es un contenedor listo para servir del modelo google/gemma-4-26B-A4B-it, empaquetado por ElytronSystems para su motor de inferencia propio, pulsar. El contenedor incluye los pesos del modelo base cuantizados a EXL3 de 4,0 bits por peso (bpw) y dos componentes adicionales que pulsar ejecuta a partir de los mismos pesos: el adaptador de decisión JEV, que devuelve probabilidades calibradas para tareas de juicio binario o de elección, y el borrador de bloques DFlash, empleado para decodificación especulativa.

El modelo base es un transformer de tipo mezcla de expertos (MoE) de Google con 26.000 millones de parámetros totales y 4.000 millones activos por token, según la nomenclatura del identificador. El repositorio declara 15.143.642.934 parámetros en sus ficheros safetensors, cifra que corresponde a los pesos efectivamente empaquetados tras la cuantización y la inclusión de los componentes auxiliares. No incluye la torre de visión: es un contenedor exclusivamente de texto.

Su relevancia práctica radica en que ofrece un despliegue completo (chat, juez de seguridad y decodificación especulativa) en una única GPU de 24 GB de arquitectura Turing, con tres bancos de KV de 131.072 tokens y 22,3 GB de memoria en uso. Está pensado para equipos que quieran evaluar el modelo base con un stack de inferencia alternativo y con un caso de uso concreto de moderación de acciones de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 128 expertos enrutados, según model card |
| Parametros totales | 26B en el modelo base; 15.143.642.934 en los safetensors del repositorio |
| Parametros activos | 4B (indicado en el identificador del modelo base) |
| Longitud de contexto | 131.072 tokens (tres bancos KV de 131.072 tokens en el ejemplo de despliegue) |
| Tipos de cuantizacion | EXL3 4,0 bpw para lineales del decodificador y los 128 expertos; EXL3 ~6 bpw para la cabeza de salida; BF16 para embeddings y normas; F16 para el LoRA JEV y el DFlash |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0, sujeta además a los términos de Gemma 4 de Google |
| Formato de pesos | safetensors empaquetados en el contenedor propio de pulsar (repack byte a byte de EXL3 generado con exllamav3 1.6.5) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos enrutados y 4.000 millones de parámetros activos por token, según la información del repositorio. Este contenedor no reentrena ni modifica el modelo: aplica cuantización EXL3 de 4,0 bpw con exllamav3 1.6.5 (codebook `mul1`, valores por defecto) sobre los lineales del decodificador y los expertos, mantiene la cabeza de salida en EXL3 a unos 6 bpw y conserva embeddings y normas en BF16 tal como los distribuye Google. Los pesos EXL3 se reempaquetan en el contenedor de pulsar sin alteración de bytes.

Sobre esa base se añaden dos componentes. El primero es el adaptador JEV (LoRA de rango 32, alpha 64, aplicado sobre atención y MLP denso) junto con una cabeza de decisión de 24 slots; el LoRA no se fusiona en los pesos base, sino que pulsar lo aplica únicamente en las peticiones al juez, de modo que el chat ejecuta los pesos de Gemma sin modificar. El segundo es el borrador de bloques DFlash de 5 capas, que habilita decodificación especulativa por defecto. No se dispone de datos sobre el volumen o la composición del dataset de entrenamiento del modelo base, ni sobre si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional en formato chat, con endpoints compatibles con OpenAI (`POST /v1/chat/completions`) y Anthropic (`POST /v1/messages`).
- Juicio de decisiones con probabilidades calibradas mediante el endpoint `POST /v1/systemone`, que acepta un estado JSON y preguntas tipadas (`noul` verdadero/falso, `choice`, `score`) y las responde en un único prefill.
- Decodificación especulativa con el borrador DFlash, activada por defecto, que acelera la generación en el motor pulsar.
- Soporte de modo razonamiento conmutable mediante el flag `--reasoning off`.
- Capacidad multimodal de visión no incluida en este contenedor: es exclusivamente de texto.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Moderación de acciones de agentes de código: el juez JEV puntúa cada llamada a herramienta (por ejemplo, un `Bash` con `rm -rf ~`) y devuelve una probabilidad de bloqueo; si la puntuación es alta, el propio Gemma redacta el juicio de segunda etapa. El autor lo emplea como etapa 1 de un juez de seguridad en dos fases.
- Despliegue de chat en GPU de 24 GB: con tres bancos KV de 131.072 tokens y 22,3 GB de memoria en uso en una Quadro RTX 6000, permite servir conversaciones de contexto largo en hardware de gama profesional antigua (sm_75).
- Evaluación de motores de inferencia alternativos: al incluir pesos EXL3 reempaquetados y comparativas de NLL y KL frente a BF16 y exllamav3, sirve para validar la fidelidad numérica de pulsar antes de adoptarlo en producción.
- Generación de código asistida: con un throughput de unos 205 tokens/s en prompts de código sobre RTX 6000, es adecuado para autocompletado y generación de fragmentos en entornos de desarrollo con una sola GPU.
- Procesamiento de documentos largos: la ventana de 131.072 tokens permite resumir o extraer información de textos extensos en una sola pasada, con NLL de 7,157 frente a 7,111 del BF16 en la prueba de texto largo del autor.
- Filtrado previo en pipelines de CI/CD: el endpoint de decisión, con latencias de 0,12 a 0,7 s por decisión según la caché de prompt, permite insertar comprobaciones automáticas de acciones generadas por agentes antes de ejecutarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad de cuantización y velocidad:

| Metrica | BF16 | exllamav3 4.0 | pulsar |
|---|---|---|---|
| NLL de los siguientes tokens reales, texto largo (1.948 tokens) | 7,111 | 7,102 | 7,157 |
| NLL de los siguientes tokens reales, prompt de herramienta (114 tokens) | 9,819 | 9,768 | 9,552 |
| KL de logits (BF16 frente a pulsar), mediana, texto largo | — | — | 0,10 |
| KL de logits (BF16 frente a pulsar), mediana, prompt de herramienta | — | — | 0,27 |

| Metrica del juez JEV | Valor |
|---|---|
| 18 acciones de agente etiquetadas a mano (bloquear/permitir) | 18/18 con P(bloquear) ≥ 0,25 |
| 52 casos frente a las probabilidades del modelo de referencia | media de \|ΔP\| 0,043; máximo 0,265 |
| Latencia por decisión en RTX 6000 | ~0,12-0,7 s según caché de prompt |

| Throughput (RTX 6000, greedy, 400 tokens, DFlash activo, una petición) | Tokens/s |
|---|---|
| Prompt de código | ~205 |
| Prompt de explicación | ~145 |
| Prompt de listado | ~138 |
| Prompt de relato | ~109 |

## Requisitos de hardware

- VRAM estimada: 22,3 GB de memoria GPU en uso en la configuración del autor, con tres bancos KV de 131.072 tokens y un banco para el juez.
- GPU recomendada por el autor: Quadro RTX 6000 (Turing, sm_75, 24 GB). El autor indica que solo lo ha servido en Turing.
- Cabe en GPU de consumo de 24 GB (por ejemplo, RTX 3090 o RTX 4090) por capacidad de memoria, aunque el autor no ha validado su ejecución en esas tarjetas.
- Despliegue: motor pulsar, compilado desde la rama `dev` (cualquier commit desde `07aa3a19`) con `make pulsar-server CUDA_ARCH=sm_75`; el servidor se arranca con `PULSAR_MSEQ_BANKS=3`, `--ctx 131072`, `--reasoning off` y `--judge-banks 1`.
- No se contemplan en la información disponible otros motores como vLLM, llama.cpp, Ollama o TGI; el formato de pesos es específico de pulsar.
- Latencia del juez: 0,12-0,7 s por decisión. Throughput de generación: 109-205 tokens/s según el tipo de prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| ElytronSystems/Gemma-4-pulsar-k4 | 26B totales, 4B activos (15,14B en safetensors) | 131.072 | Contenedor pulsar, EXL3 4,0 bpw | Apache-2.0 + términos Gemma 4 | Incluye juez JEV y borrador DFlash; solo texto |
| google/gemma-4-26B-A4B-it | 26B totales, 4B activos | no disponible | Pesos originales de Google | Apache-2.0 + términos Gemma 4 | Modelo base; incluye capacidades multimodales según Google |
| autotrust/JEV-Gemma4-26B-A4B | Derivado del anterior | no disponible | LoRA F32 y cabeza de decisión | Apache-2.0 | Solo el adaptador de juicio, sin cuantizar |
| z-lab/gemma-4-26B-A4B-it-DFlash | Borrador de 5 capas | no disponible | BF16 | Apache-2.0 | Solo el borrador de decodificación especulativa |

## Limitaciones y advertencias

- El contenedor no incluye la torre de visión: cualquier caso de uso multimodal queda fuera de su alcance.
- El autor solo ha validado el despliegue en Turing (sm_75); no hay garantías de funcionamiento en otras arquitecturas sin recompilar y probar.
- Las métricas de calidad del juez JEV se basan en conjuntos pequeños (18 y 52 casos), tal como reconoce el propio autor, por lo que su generalización es limitada.
- El formato de pesos es específico del motor pulsar; no es portable a vLLM, llama.cpp, Ollama o TGI sin reconversión.
- El uso comercial está permitido por Apache-2.0, pero el uso de Gemma queda sujeto adicionalmente a los términos de Gemma 4 de Google, que pueden imponer restricciones adicionales.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura de idiomas del modelo base en la documentación consultada.
- El repositorio tiene 33 descargas y ningún "like", y fue creado en noviembre de 2026; se trata de un artefacto reciente y con poca validación comunitaria.
- La decodificación especulativa DFlash está activada por defecto y puede alterar sutilmente la distribución de salida respecto a la generación sin borrador.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ElytronSystems/Gemma-4-pulsar-k4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Adaptador JEV: https://huggingface.co/autotrust/JEV-Gemma4-26B-A4B
- Borrador DFlash: https://huggingface.co/z-lab/gemma-4-26B-A4B-it-DFlash
- Motor pulsar: https://github.com/tylerwagler/pulsar
- Paper de DFlash: https://arxiv.org/abs/2602.06036
- Términos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Gemma 4 en Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
