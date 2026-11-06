# mradermacher/tinybrainbot-360m-a75m-v5.1-instruct-GGUF

## Resumen

Tinybrainbot 360M-A75M v5.1 Instruct es un modelo de lenguaje de tipo mixture-of-experts (MoE) de escala muy reducida, desarrollado desde cero por el usuario nkthebass y distribuido en formato GGUF por mradermacher. Con 383.429.376 parámetros totales en safetensors y una designación nominal de 360M totales / 75M activos, se posiciona en la franja de los "small language models" orientados a experimentación, prototipado rápido y despliegue en hardware muy limitado. La nomenclatura y las etiquetas del modelo (mixtral, moe) sugieren una arquitectura inspirada en Mixtral, aunque no se dispone de detalles técnicos publicados sobre el número de expertos ni la top-k de enrutamiento.

El modelo ha sido afinado para instrucciones y conversación (instruct/chat) e incorpora etiquetas declarativas de razonamiento y matemáticas, aunque no se han publicado evaluaciones que respalden dichas capacidades. Su entrenamiento declara el uso de varios datasets de instrucciones y conversación bien conocidos (smoltalk, smoltalk2, smol-smoltalk, tulu-3-sft-personas-instruction-following, WildChat-4.8M y OpenHermes-2.5), lo que indica una estrategia de ajuste supervisado sobre datos diversos en inglés.

La relevancia actual del modelo es fundamentalmente práctica: ofrece una ventana de experimentación con arquitecturas MoE a un coste computacional ínfimo (los cuantizados GGUF ocupan entre 0,3 y 0,9 GB) y bajo licencia Apache 2.0, lo que permite probar pipelines de inferencia, integraciones con llama.cpp u Ollama y flujos de agentes sin infraestructura dedicada. No obstante, su tamaño y la ausencia de benchmarks publicados limitan seriamente su uso en producción real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, inspirada en Mixtral (detalles de capas, expertos y enrutamiento no disponibles) |
| Parámetros totales | 383.429.376 (nominal 360M) |
| Parámetros activos | 75M (nominal, según nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original se distribuye en safetensors vía transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), etiquetado explícitamente como "mixtral" y "mixture-of-experts" en los metadatos. El nombre del modelo indica 360M parámetros totales con 75M activos por token, lo que implicaría un ratio de activación de aproximadamente el 20,8 %; sin embargo, no se especifican el número de expertos, la top-k de enrutamiento, la dimensión del modelo, el número de capas ni la función de pérdida de balanceo de carga. El modelo ha sido entrenado "from scratch" (desde cero), no derivado de un modelo preexistente, según la etiqueta `from-scratch`.

El ajuste se realizó sobre una mezcla de datasets de instrucciones y conversación en inglés: HuggingFaceTB/smol-smoltalk, HuggingFaceTB/smoltalk, HuggingFaceTB/smoltalk2, allenai/tulu-3-sft-personas-instruction-following, allenai/WildChat-4.8M y teknium/OpenHermes-2.5. No se documenta el número de tokens de entrenamiento, la composición exacta de la mezcla, ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa. Tampoco se detalla la tokenizador empleado ni innovaciones técnicas adicionales.

## Capacidades

- Generación de texto conversacional en inglés, con formato instruct/chat.
- Razonamiento y matemáticas: el modelo declara estas capacidades en sus etiquetas, pero no se han publicado evaluaciones que las cuantifiquen.
- Instrucciones y seguimiento de personas: entrenado con tulu-3-sft-personas-instruction-following, lo que sugiere cierta capacidad de adoptar roles o personas.
- Conversación multi-turno: el formato conversacional está soportado por la librería transformers y los GGUF generados.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se documenta soporte explícito).
- Multilingüismo: limitado a inglés según los metadatos; no se declaran otros idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado de pipelines de inferencia GGUF: sirve para validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de OpenAI antes de escalar a modelos mayores, gracias a su huella de 0,3–0,9 GB.
- Experimentación con arquitecturas MoE: permite estudiar el comportamiento de un MoE de 75M parámetros activos en entornos académicos o de aprendizaje, sin necesidad de GPUs de gama alta.
- Pruebas de cuantización: al ofrecerse en 12 variantes (de Q2_K a f16), es útil para comparar la degradación de calidad por cuantización en un modelo pequeño y controlado.
- Generación de texto de bajo coste en inglés: adecuado para tareas simples de completado, resumen corto o reformulación donde no se requiera alta fidelidad factual.
- Asistente conversacional embebido en demos y entornos educativos: su reducido tamaño permite ejecutarlo en CPU o en GPUs consumer modestas para talleres y pruebas de concepto.
- Filtrado o clasificación textual ligera: puede emplearse como generador de etiquetas o respuestas cortas en pipelines de preprocesamiento, siempre con validación humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en Q2_K–Q4_K, 0,4 GB en Q5–Q6, 0,5 GB en Q8_0 y 0,9 GB en f16 (tamaños de archivo GGUF reportados por el cuantizador).
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de VRAM libre es suficiente; no se requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4060, etc.), e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF y la API de OpenAI (el modelo está etiquetado como `endpoints_compatible`); también transformers con los pesos en safetensors del modelo base.
- Latencia y throughput estimados: no disponibles; por el tamaño (75M activos) se espera que sea muy bajo en latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinybrainbot-360m-a75m-v5.1-instruct | 383M totales / 75M activos (MoE) | no disponible | Apache 2.0 | GGUF, safetensors | Entrenado desde cero, solo inglés, sin benchmarks publicados |
| SmolLM2-360M-Instruct | 360M densos | 8K (según model card pública de HuggingFaceTB) | Apache 2.0 | safetensors, GGUF | Modelo denso de referencia en la franja 300–400M, con benchmarks publicados |
| Qwen2.5-0.5B-Instruct | 494M densos | 32K (según model card pública de Qwen) | Apache 2.0 | safetensors, GGUF | Multilingüe, con benchmarks publicados y amplio soporte de tooling |
| TinyLlama-1.1B-Chat | 1.1B densos | 2K (según model card pública) | Apache 2.0 | safetensors, GGUF | Mayor tamaño, pero con benchmarks y ecosistema consolidado |

La comparativa se basa en datos públicos de los modelos alternativos; para tinybrainbot no hay benchmarks que permitan una comparación de rendimiento objetiva. La principal diferencia es su naturaleza MoE y su origen "from scratch", frente a los modelos densos y ampliamente evaluados de la competencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar las capacidades declaradas de razonamiento ni matemáticas.
- Tamaño muy reducido (75M parámetros activos): alta probabilidad de alucinaciones, respuestas incoherentes en tareas complejas y baja fidelidad factual.
- Solo inglés: no se declara soporte de castellano ni de otros idiomas, por lo que su uso en entornos hispanohablantes requeriría validación adicional.
- Longitud de contexto no documentada: se desconoce la ventana máxima y su comportamiento en conversaciones largas.
- Datos de entrenamiento no auditados: la mezcla de datasets (WildChat-4.8M, OpenHermes-2.5, etc.) puede introducir sesgos y contenido no filtrado; no se documentan procesos de alineación (RLHF/DPO).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar los términos de los datasets de origen.
- Sin soporte documentado de tool calling ni de agentes: no apto para flujos que dependan de function calling.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema prácticamente inexistente, sin comunidad ni issues resueltos.

## Enlaces

- [Hugging Face: mradermacher/tinybrainbot-360m-a75m-v5.1-instruct-GGUF](https://huggingface.co/mradermacher/tinybrainbot-360m-a75m-v5.1-instruct-GGUF)
- [Modelo base: nkthebass/tinybrainbot-360m-a75m-v5.1-instruct](https://huggingface.co/nkthebass/tinybrainbot-360m-a75m-v5.1-instruct)
- [Página de descargas del cuantizador](https://hf.tst.eu/model#tinybrainbot-360m-a75m-v5.1-instruct-GGUF)
- [FAQ y solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guía de uso de GGUF (README de TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Notas de Artefact2 sobre cuantización](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
