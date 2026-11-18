# BlinkDL/rwkv7-g1

## Resumen

RWKV7-G1, también conocido como "GooseOne", es una familia de modelos base de lenguaje desarrollada por BlinkDL dentro del linaje RWKV. A diferencia de los transformers convencionales, RWKV-7 emplea una arquitectura recurrente pura (RNN) con atención linealizada, lo que permite inferencia con coste constante tanto en memoria como en tiempo por token, independientemente de la longitud de la secuencia. El modelo se distribuye como modelo base preentrenado con datos web, código, sintéticos e instrucciones/chat/razonamiento, pensado para post-entrenamiento y ajuste fino posterior.

La familia cubre varios tamaños (0.1B, 0.4B, 1.5B, 2.9B, 7.2B y 13.3B parámetros), con vocabulario de 65.536 tokens y tamaño de cabeza de 64 en todas las variantes actuales. El repositorio principal `BlinkDL/rwkv7-g1` agrupa los pesos en formato safetensors, mientras que las versiones GGUF y para móvil se publican en repositorios separados. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en productos.

Su relevancia actual radica en que ofrece una alternativa a los transformers con ventajas claras en despliegue: velocidad de decodificación constante, huella de VRAM estable y buen rendimiento en GPUs de consumo. Según el autor, la variante de 7.2B en fp16 alcanza más de 145 tokens/s en decodificación con batch 1 sobre una RTX 5090, y más de 11.000 tokens/s en prefill, lo que lo posiciona como candidato para inferencia local y aplicaciones móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (RNN puro con atención linealizada) |
| Parametros totales | Familia: 0.1B (L12-D768), 0.4B (L24-D1024), 1.5B (L24-D2048), 2.9B (L32-D2560), 7.2B (L32-D4096), 13.3B (L61-D4096) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (arquitectura recurrente de estado constante) |
| Tipos de cuantizacion | GGUF disponible en repositorios separados; cuantizaciones concretas no disponibles |
| Idiomas soportados | en, zh, fr, es, de, pt, ru, it, ja, ko, vi, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (principal), GGUF, pth (para conversión) |

## Arquitectura y entrenamiento

RWKV-7 es una arquitectura recurrente pura que sustituye la atención cuadrática de los transformers por un mecanismo de estado recurrente con atención linealizada. Esto implica que la generación token a token mantiene un estado de tamaño fijo, de modo que el consumo de VRAM y el tiempo por token son constantes sin importar la longitud del contexto. La familia usa un vocabulario de 65.536 tokens y un head size de 64 en todas las variantes; las dimensiones varían según el tamaño (por ejemplo, 7.2B corresponde a 32 capas y dimensión 4096, y 13.3B a 61 capas y dimensión 4096).

El preentrenamiento combina datos web, código, sintéticos e instrucciones/chat/razonamiento, según indica el autor, con datasets como FineWeb-Edu, DCLM-baseline, SlimPajama-627B, The Pile, StarCoderData y OSCAR-2301. No se especifican en la información disponible el número exacto de tokens, la composición porcentual del dataset ni si se aplicaron fases de RLHF o DPO. La model card menciona que las variantes `rwkv7a` incorporan DeepEmbed y que las versiones `G1c` y posteriores soportan plantillas de FIM y estilos alternativos de "think".

## Capacidades

- Generación de texto causal en 12 idiomas: inglés, chino, francés, español, alemán, portugués, ruso, italiano, japonés, coreano, vietnamita y árabe.
- Razonamiento explícito mediante modo "think" con etiquetas `<think>` y estilos alternativos `(think)`, `(think a bit)` y `(think a lot)` para prompts difíciles.
- Function calling / tool calling con salida JSON, soportado en modelos G1f de 1.5B en adelante según la model card.
- Flujos agénticos multi-paso con plantillas de `<tool_call>` y `<tool_response>`.
- Relleno de código y texto (FIM) con tokens especiales `✿prefix✿`, `✿suffix✿` y `✿middle✿` en modelos G1c y posteriores.
- Generación creativa y de ficción con parámetros de decodificación específicos recomendados por el autor.
- Inferencia local en móvil y escritorio mediante la app RWKV Chat y el repositorio rwkv-mobile.

## Casos de uso

- Asistente conversacional local en dispositivos móviles: la app RWKV Chat y los modelos móviles permiten ejecutar el modelo sin conexión, aprovechando el coste constante de memoria de la arquitectura recurrente para conversaciones largas.
- Generación de código en producción con FIM: los modelos G1c y posteriores soportan relleno de código con tokens `✿prefix✿`/`✿suffix✿`/`✿middle✿`, lo que permite integrarlos en editores e IDE para autocompletado en línea.
- Automatización de agentes con tool calling: la plantilla JSON documentada permite que el modelo invoque funciones como `get_weather`, `get_stock_price` o `create_calendar_event` en pipelines de automatización, con temperatura 0 y top-p 0 para salidas deterministas.
- Procesamiento de documentos largos: al mantener estado constante, el modelo puede procesar secuencias extensas sin el crecimiento cuadrático de VRAM de los transformers, útil para resúmenes y extracción sobre corpus largos.
- Atención al cliente multilingüe: con soporte para 12 idiomas, puede gestionar conversaciones multi-turno en entornos donde se requiere cobertura lingüística amplia sin desplegar varios modelos.
- Generación creativa y narrativa: el autor recomienda parámetros específicos (temp 0.6, top-p 0.6-0.8) para ficción, lo que lo hace adecuado para herramientas de escritura asistida.
- Base para fine-tuning especializado: al ser modelos base preentrenados con datos de instrucción, sirven como punto de partida para post-entrenamiento con RWKV-PEFT en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de inferencia del autor:

| Metrica | Valor reportado |
|---|---|
| Decodificación 7.2B fp16 bsz1 @ RTX 5090 | 145+ tokens/s |
| Decodificación 7.2B fp16 bsz960 @ RTX 5090 | 10.250+ tokens/s |
| Decodificación 7.2B fp16 bsz320 @ RTX 5090 | 9.650+ tokens/s |
| Prefill 7.2B fp16 bsz1 @ RTX 5090 | 11.289 tokens/s |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 7.2B en fp16 se requiere aproximadamente el tamaño de los pesos más el estado recurrente, y las versiones GGUF permiten reducir la huella.
- GPU recomendadas: el autor reporta métricas sobre RTX 5090; por la naturaleza recurrente, GPUs de consumo como RTX 4090 o superiores son adecuadas para las variantes de 1.5B a 7.2B.
- Cabe en GPU de consumo: sí, especialmente las variantes de 0.1B a 2.9B y las cuantizaciones GGUF de 7.2B.
- Opciones de despliegue: paquete `rwkv` de PyPI, Albatross (GUI y motor de inferencia), llama.cpp/GGUF vía conversor `convert_rwkv_pth_to_gguf.py`, Ollama (repositorios `shoumenchougou` y `mollysama`), rwkv-mobile para Android/iOS.
- Latencia y throughput: según el autor, 145+ tokens/s en decodificación bsz1 y 11.289 tokens/s en prefill para 7.2B fp16 en RTX 5090; velocidad y VRAM constantes independientemente de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RWKV7-G1 | 0.1B–13.3B | No disponible (estado constante) | RNN con atención linealizada | Apache 2.0 | Hugging Face, GGUF, Ollama, móvil |
| Transformers densos de 7B (p. ej. Llama 3.1 8B) | ~8B | 128K | Transformer | Licencia comunitaria | Hugging Face, GGUF, Ollama |
| Mamba-2 (familias disponibles) | Variable | Variable | SSM híbrido | Apache 2.0 en algunas variantes | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible en la información proporcionada; los benchmarks publicados por el autor se limitan a métricas de inferencia.

## Limitaciones y advertencias

- Son modelos base: requieren post-entrenamiento o instrucciones adecuadas para uso conversacional fiable; no están alineados con RLHF de forma explícita según la información disponible.
- Riesgo de alucinación inherente a modelos de lenguaje preentrenados, sin datos publicados sobre tasas de error.
- El tokenizer es sensible a espacios finales en la entrada: el autor advierte que un espacio al final del prompt puede provocar respuestas en otro idioma.
- La longitud de contexto efectiva no está documentada; aunque la arquitectura mantiene estado constante, la calidad en secuencias muy largas no se especifica.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte formal.
- El repositorio principal ocupa 721,2 GB, lo que implica descargas pesadas si se clonan todos los pesos; conviene descargar solo la variante necesaria.

## Enlaces

- Hugging Face: https://huggingface.co/BlinkDL/rwkv7-g1
- Safetensors oficiales: https://huggingface.co/RWKV
- GGUF (colección): https://huggingface.co/collections/shoumenchougou/rwkv7-gxx-gguf
- Pesos GGUF y móviles: https://huggingface.co/HaloWang/rwkv-weights y https://huggingface.co/mollysama/rwkv-mobile-models
- Ollama: https://ollama.com/shoumenchougou y https://ollama.com/mollysama
- Demo y web oficial: https://rwkv.com/
- GUI Albatross: https://github.com/BlinkDL/Albatross/blob/main/faster3a_2607/app4b.py
- App RWKV Chat: https://rwkv.halowang.cloud/ y https://github.com/RWKV-APP/RWKV_APP
- Conversor pth a GGUF: https://github.com/MollySophia/rwkv-mobile/blob/master/converter/convert_rwkv_pth_to_gguf.py
- Entrenamiento: https://github.com/BlinkDL/RWKV-LM y https://github.com/Joluck/RWKV-PEFT
- Inferencia eficiente: https://github.com/BlinkDL/Albatross
- Paquete pip: https://pypi.org/project/rwkv/
- Inferencia móvil: https://github.com/MollySophia/rwkv-mobile
- Guía de prompts (function call y agentes): https://github.com/BlinkDL/RWKV-LM/blob/main/RWKV-v7/RWKV7-G1x-templates.txt
- Buenas prácticas agénticas: https://agent.objects.rwkvos.com/en
- Ejemplo de evaluación: https://github.com/BlinkDL/Albatross/blob/main/faster3a_2605/eval_gpqa_diamond.py
- UncheatableEval: https://huggingface.co/spaces/Jellyfish042/UncheatableEval
