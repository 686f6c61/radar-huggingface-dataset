# mradermacher/Selene-Link-1.5B-Instruct-GGUF

## Resumen

Selene-Link-1.5B-Instruct es un modelo de lenguaje instruido de tamaño reducido (1.540 millones de parametros) desarrollado por Syradevops, construido sobre la arquitectura Qwen2. El repositorio aqui documentado es una coleccion de cuantizaciones estaticas en formato GGUF publicada por mradermacher, un cuantizador muy activo en la comunidad de Hugging Face que genera versiones comprimidas de modelos para su ejecucion en hardware de consumo mediante llama.cpp y herramientas derivadas.

El problema que resuelve este tipo de repositorio es la accesibilidad: permite ejecutar un modelo instructivo ligero en portatiles, mini-PC o GPUs modestas, con archivos que van desde 0,8 GB (Q2_K) hasta 3,2 GB (f16). Su relevancia actual radica en la tendencia hacia modelos pequenos y eficientes para casos de uso en el borde (edge), agentes locales y prototipado rapido, donde un modelo de 1,5B puede ser suficiente y mucho mas barato de operar que uno generalista grande.

No se ha publicado una model card detallada por parte del autor original con informacion sobre el proceso de entrenamiento, datos utilizados ni resultados de benchmarks, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder) |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base esta en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base, Syradevops/Selene-Link-1.5B-Instruct, esta etiquetado con la arquitectura Qwen2, es decir, un transformer decoder convencional con las mejoras tipicas de esa familia (RoPE, SwiGLU, RMSNorm pre-normalizado). Al tratarse de una version instructiva de 1,5B parametros, es razonable asumir que deriva de un Qwen2.5 de tamano similar, aunque el autor no lo confirma explicitamente en la documentacion disponible.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de tecnicas de alineacion como SFT, RLHF o DPO. La cuantizacion publicada por mradermacher es estatica (no imatrix ni weighted quants en el momento de publicacion), convertida desde el formato HF original, con un total de 12 variantes que cubren desde 2 bits hasta 16 bits por peso.

## Capacidades

- Generacion de texto conversacional: al ser un modelo instructivo, esta orientado al dialogo y al seguimiento de instrucciones.
- Etiquetado como "conversational" en Hugging Face, lo que indica compatibilidad con plantillas de chat.
- Al basarse en la familia Qwen2, es probable que conserve cierta capacidad de razonamiento general, codigo y matematicas heredadas del modelo base, aunque no hay datos publicados que lo cuantifiquen.
- No hay informacion disponible sobre soporte de tool calling / function calling.
- No hay informacion disponible sobre capacidades de agentes, razonamiento multi-paso, vision o audio.
- Capacidades multilingues: no documentadas; el idioma declarado es unicamente el ingles, por lo que el rendimiento en castellano no esta garantizado.

## Casos de uso

- Chatbots locales y privados: con la variante Q4_K_M (1,1 GB) puede ejecutarse en cualquier portatil moderno, incluso sin GPU dedicada, para asistentes conversacionales que procesan datos sensibles sin salir del equipo.
- Prototipado rapido de aplicaciones LLM: su tamano minimo permite iterar prompts y pipelines en local con latencias muy bajas antes de escalar a modelos mayores.
- Agentes ligeros en el borde: en dispositivos con recursos limitados (Raspberry Pi 5, mini-PC con NPU) puede servir como motor de lenguaje para automatizaciones simples, siempre que las tareas no exijan razonamiento profundo.
- Clasificacion y extraccion estructurada: tareas como extraccion de entidades, resumenes cortos o clasificacion de texto en ingles son buen encaje para un modelo de 1,5B cuantizado.
- Pruebas de infraestructura de inferencia: util para validar despliegues de llama.cpp, Ollama o servidores GGUF sin consumir apenas VRAM ni ancho de banda de descarga.
- Generacion de codigo asistida basica: si hereda capacidades de la familia Qwen2, puede asistir en autocompletado simple, aunque no hay datos que respalden un rendimiento competitivo en benchmarks de codigo.
- Fine-tuning experimental: su tamano reducido lo hace ideal para experimentar con LoRA/QLoRA en una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del modelo base ni la del repo de cuantizacion incluyen metricas en MMLU, HumanEval, GSM8K u otras pruebas estandar.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: entre 0,8 GB (Q2_K) y 3,2 GB (f16) solo de pesos; anade 0,5-1 GB extra para el contexto segun su longitud. La variante Q4_K_M requiere aproximadamente 1,5 GB en total, por lo que funciona en cualquier equipo con 4 GB de RAM libres.
- GPU recomendadas: no necesita GPU dedicada; cualquier GPU moderna lo ejecuta sin problemas. En CPU, un procesador de escritorio convencional obtiene velocidades de decodificacion de varias decenas de tokens por segundo dado el tamano del modelo.
- Cabe sobradamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso integradas con memoria compartida.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, GPT4All, koboldcpp y cualquier runtime compatible con GGUF. El modelo base tambien puede servirse con vLLM o TGI al estar en formato transformers.
- Latencia y throughput: no disponibles como cifras oficiales; por tamano y cuantizacion, se espera inferencia muy rapida, especialmente las variantes marcadas como "fast" por el cuantizador (Q4_K_S, Q4_K_M, Q8_0).

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Selene-Link-1.5B-Instruct (este) | 1,54B | Qwen2 | Apache 2.0 | GGUF (12 quants) | Sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,54B | Qwen2 | Qwen (Apache 2.0 con restricciones de marca) | safetensors, GGUF comunitario | Modelo base probable; benchmarks publicados, multilingue |
| Llama-3.2-1B-Instruct | 1,24B | Llama 3 | Llama Community License | safetensors, GGUF comunitario | Amplio ecosistema, licencia con condiciones |
| SmolLM2-1.7B-Instruct | 1,71B | Llama-arquitectura | Apache 2.0 | safetensors, GGUF comunitario | Entrenado por Hugging Face, documentacion extensa |

La principal diferencia de Selene-Link frente a estas alternativas es la falta de documentacion y benchmarks publicos; modelos como Qwen2.5-1.5B-Instruct o SmolLM2-1.7B-Instruct ofrecen trazabilidad completa del entrenamiento y metricas verificables.

## Limitaciones y advertencias

- Idioma: la model card declara solo ingles. El rendimiento en castellano no esta documentado y puede ser significativamente inferior; conviene evaluarlo antes de usarlo en produccion hispanohablante.
- Sin benchmarks publicos: no hay forma de verificar su calidad frente a alternativas del mismo tamano, lo que introduce riesgo al elegirlo para casos criticos.
- Alucinaciones: como todo modelo de lenguaje de 1,5B parametros, la tasa de alucinacion en tareas de conocimiento factual es esperablemente alta; los modelos pequenes tienen menos capacidad de retencion de conocimiento.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K degradan apreciablemente la calidad; mradermacher recomienda Q4_K_S, Q4_K_M o superiores. Las quants imatrix/weighted no estaban disponibles en el momento de publicacion.
- Contexto: la longitud de ventana no esta documentada; si hereda la de Qwen2.5-1.5B seria de 32.768 tokens, pero esto no esta confirmado para este modelo.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, lo cual es una ventaja frente a modelos con licencias comunitarias.
- Origen poco documentado: el autor (Syradevops) no publica detalles del entrenamiento ni del dataset, lo que dificulta evaluar sesgos potenciales. Aplícale las precauciones habituales de moderacion de contenidos en produccion.

## Enlaces

- Repositorio de cuantizacion GGUF: https://huggingface.co/mradermacher/Selene-Link-1.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/Syradevops/Selene-Link-1.5B-Instruct
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Selene-Link-1.5B-Instruct-GGUF
- Guia de uso de GGUF (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
