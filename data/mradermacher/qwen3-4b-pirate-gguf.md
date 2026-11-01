# mradermacher/qwen3-4b-pirate-GGUF

## Resumen

qwen3-4b-pirate-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo hariharanv04/qwen3-4b-pirate, publicado por el cuantizador mradermacher. El modelo base es un ajuste de Qwen3 4B, un transformer denso de unos 4.000 millones de parámetros desarrollado originalmente por el equipo de Alibaba Qwen, especializado en generar texto en estilo pirata (inglés). El repositorio no añade capacidades nuevas al modelo base: su función es hacer el modelo ejecutable en hardware de consumo mediante llama.cpp, Ollama y herramientas compatibles con GGUF.

El interés de esta ficha radica en la accesibilidad: con cuantizaciones desde 1,8 GB (Q2_K) hasta 8,2 GB (f16), el modelo puede ejecutarse incluso en portátiles sin GPU dedicada. Es relevante para desarrolladores que quieran experimentar con fine-tunes ligeros y estilizados de Qwen3 sin necesidad de infraestructura. La licencia Apache 2.0 del modelo base permite uso comercial.

Conviene subrayar que se trata de un modelo de nicho y con muy poca tracción (454 descargas, sin model card técnica detallada del autor original), por lo que la información verificable sobre su entrenamiento y rendimiento es escasa. La fecha de creación del repositorio figura como octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), causal LM |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no disponible (el modelo base no es MoE; todos los parámetros son activos) |
| Longitud de contexto | no disponible (Qwen3 4B original soporta 32.768 tokens, ampliable a 131.072 con YaRN, pero el fine-tune no lo documenta) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3 4B: un transformer decoder denso (no MoE) con aproximadamente 4.020 millones de parámetros. El repositorio de mradermacher no modifica la arquitectura; solo aplica cuantización post-entrenamiento estática en formato GGUF mediante el ecosistema llama.cpp, con conversión desde safetensors de Hugging Face (convert_type: hf).

Sobre el proceso de fine-tuning que dio lugar a hariharanv04/qwen3-4b-pirate no hay datos publicados: se desconoce el número de tokens de entrenamiento, la composición del dataset, el método utilizado (LoRA, full fine-tune) ni el uso de técnicas como RLHF o DPO. La etiqueta "unsloth" sugiere que el ajuste se realizó con la librería Unsloth, habitual en fine-tunes ligeros y eficientes en una sola GPU, pero esto no está confirmado por el autor. Tampoco hay cuantizaciones imatrix/weighted disponibles en este repositorio, solo estáticas.

## Capacidades

- Generacion de texto en ingles con estilo pirata (el propósito declarado del fine-tune)
- Capacidades heredadas de Qwen3 4B: generacion de texto general, razonamiento y codigo, aunque el fine-tune estilizado puede haber degradado estas habilidades (sin datos publicados que lo confirmen)
- Modo thinking de Qwen3 (si el fine-tune lo conserva; no documentado)
- Tool calling / function calling: no disponible (sin documentacion)
- Capacidades multilingues: limitadas al ingles segun la model card
- Vision, audio u otras modalidades: no disponibles

## Casos de uso

- Chatbot de entretenimiento tematico: un asistente conversacional que responde siempre en estilo pirata, util para juegos, eventos o experiencias interactivas donde el tono es parte del producto.
- Videojuegos y narrativa interactiva: generacion de dialogos de personajes piratas en tiempo real en un motor de juego, integrandolo via llama.cpp en local.
- Prototipado de fine-tunes estilizados: base de estudio para entender como un ajuste ligero con Unsloth modifica el estilo de un modelo base sin cambiar su tamano.
- Demostraciones educativas: mostrar en clase o en talleres como la cuantizacion GGUF permite ejecutar modelos de 4B en portatiles con 4-8 GB de RAM.
- Generacion de contenido creativo: escritura de coplas, descripciones o textos tematicos de piratas para blogs, marketing de eventos tematicos o contenido de redes sociales.
- Bot de Discord o Telegram de bajo coste: su tamano cuantizado (2,5 GB en Q4_K_M) permite hostearlo en un VPS pequeño o incluso en una Raspberry Pi de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el autor del fine-tune ni el cuantizador han publicado evaluaciones en MMLU, HumanEval, GSM8K u otros benchmarks. Como referencia indirecta, el Qwen3 4B original publica resultados en estos benchmarks, pero no hay datos que confirmen que el fine-tune pirata los conserva.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (tamano del archivo + overhead de contexto, aproximadamente +0,5-1 GB):
  - Q2_K: ~1,8 GB (ejecutable en cualquier portatil moderno por CPU)
  - Q4_K_M: ~2,6 GB
  - Q6_K: ~3,4 GB
  - Q8_0: ~4,4 GB
  - f16: ~8,2 GB
- GPU recomendadas: no requiere GPU; con una RTX 3060 de 12 GB o una RTX 4090 cabe incluso la version f16 con holgura. En CPU, cualquier equipo con 8 GB de RAM ejecuta Q4_K_M.
- Consumer GPUs: cabe sobradamente en RTX 3060, RTX 4060 Ti, RTX 4070 y superiores en todas las cuantizaciones; en GPUs de 4 GB (GTX 1650) cabe Q2_K/Q3_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No es candidato natural para vLLM o TGI, que trabajan mejor con pesos safetensors del modelo base.
- Latencia y throughput: no disponibles; en CPU moderno con Q4_K_M, un modelo de 4B suele alcanzar del orden de 10-25 tokens/s, pero es una estimacion general, no un dato publicado de este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| qwen3-4b-pirate-GGUF (este) | 4,02 B | GGUF (Q2_K a f16) | Apache 2.0 | Fine-tune de estilo pirata en ingles |
| Qwen3 4B (original, Alibaba) | 4,02 B | safetensors + GGUF comunitarios | Apache 2.0 | Modelo base generalista, modo thinking, 33 idiomas |
| Llama 3.2 3B Instruct | 3,2 B | safetensors + GGUF comunitarios | Llama 3.2 Community License | Generalista, contexto de 128K tokens |
| Phi-3.5-mini-instruct | 3,8 B | safetensors + GGUF comunitarios | MIT | Generalista, contexto de 128K tokens |

Frente a las alternativas generalistas, este modelo solo tiene sentido si se necesita el estilo pirata; para tareas generales, el Qwen3 4B original o Phi-3.5-mini ofrecen contexto documentado, benchmarks publicados y soporte multilingue muy superiores.

## Limitaciones y advertencias

- Sesgos: no documentados por el autor; hereda potencialmente los sesgos del preentrenamiento de Qwen3 y añade los del dataset de fine-tune, cuya composicion es desconocida.
- Alucinacion: riesgo estandar de un modelo de 4B; el fine-tune estilizado, sin evaluaciones publicadas, puede agravar la degradacion de factibilidad y razonamiento.
- Idioma: la model card declara solo ingles; el estilo pirata probablemente degrade el rendimiento en espanol y otros idiomas incluso si el modelo base los soportaba.
- Contexto: la longitud de contexto del fine-tune no esta documentada; no asumas los 32K/128K del Qwen3 original sin verificarlo.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser un fine-tune de comunidad sin documentacion ni soporte, su uso en produccion conlleva riesgo de mantenimiento y calidad.
- Son cuantizaciones estaticas (no imatrix); en cuants bajos (Q2_K, Q3_K_S) la perdida de calidad es notable segun la grafica de perplexidad referenciada por el cuantizador.
- Solo 454 descargas y cero likes: comunidad minima, sin issues ni validacion de terceros.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/qwen3-4b-pirate-GGUF
- Modelo base (fine-tune pirata): https://huggingface.co/hariharanv04/qwen3-4b-pirate
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#qwen3-4b-pirate-GGUF
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper del modelo base: no disponible
