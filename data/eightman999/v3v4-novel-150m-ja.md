# eightman999/v3v4-novel-150m-ja

## Resumen

J-LLM Novel 150M JA es un modelo de lenguaje de tipo decoder-only con 132.453.888 parámetros (aproximadamente 150 millones según la nomenclatura del autor), desarrollado por eightman999 como parte de su serie experimental J-LLM bajo el plan interno "v3v4". Está especializado en la generación de novelas en japonés y ha sido entrenado sobre textos creativos y documentos web en japonés, incluyendo contenido para adultos. El modelo se publica en dos variantes de comportamiento: NV1C3, que primero genera un registro de personajes y trama (`<|cast|>`) antes de escribir el cuerpo del relato (`<|story|>`), y NV1C2, que escribe directamente sin fase de planificación.

La arquitectura es un transformer clásico de 12 capas con dimensión oculta 768, 12 cabezas de atención y FFN de 3600 unidades, con embeddings de entrada y salida compartidos, posiciones sinusoidales, pre-LN con LayerNorm y activación GELU exacta. El vocabulario es de 49.152 tokens con un BPE propio que incluye byte fallback, y la ventana de contexto alcanza los 4.096 tokens. El repositorio incluye los pesos en formato nativo y una conversión a formato GPT-2 estándar (`GPT2LMHeadModel`, fp16, safetensors) para su uso directo con `AutoModelForCausalLM` de transformers.

Su relevancia es acotada pero concreta: se trata de un modelo pequeño, entrenado por un particular, pensado exclusivamente para escritura creativa en japonés y ejecutable en hardware modesto (CPU, MPS o GPU de consumo). No compite en benchmarks generales ni aspira a usos conversacionales; su interés reside en la especialización de dominio, el control de longitud de salida mediante `min_new_tokens` y el modo de planificación estructurada que separa la generación del elenco y la sinopsis del texto final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 12 capas, d=768, 12 cabezas, FFN 3600 |
| Parametros totales | 132.453.888 (aprox. 150M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16 para la variante GPT-2; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (formato nativo NV1C3 y NV1C2; conversión GPT-2 fp16 en `transformers/`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only convencional con 12 bloques, dimensión de modelo 768, 12 cabezas de atención y una capa feed-forward de 3600 unidades. Emplea embeddings de posición sinusoidales (no aprendidos), normalización pre-LN con LayerNorm, activación GELU en su variante exacta y compartición de pesos entre las matrices de embedding de entrada y de salida, con la entrada escalada por √d. El tokenizador es un BPE propio de 49.152 entradas con byte fallback, lo que permite representar cualquier byte de entrada, aunque el autor advierte que no es un BPE a nivel de byte en el sentido habitual, lo que impide la conversión directa a GGUF para llama.cpp o a MLX.

La conversión a formato GPT-2 (`GPT2LMHeadModel`) requirió adaptaciones: como el formato GPT-2 no incorpora el escalado de la entrada por √d, se reemplaza el flujo residual completo por un factor 1/√d, se alojan las posiciones sinusoidales en `wpe` y se ajustan las proyecciones de salida de cada bloque y el epsilon de LayerNorm. El autor reporta que la diferencia de logits respecto a la implementación original es inferior a 0,012 en fp32, con coincidencia en los candidatos de mayor probabilidad. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones; únicamente se indica que el entrenamiento se realizó sobre novelas y documentos web en japonés, incluyendo material para adultos.

El formato de prompt nativo es `<s>### ユーザー:\n{依頼}\n\n### アシスタント:\n`. Para el modo de planificación (NV1C3) se añade el token `<|cast|>` al final del prompt, lo que provoca la generación del registro de personajes y sinopsis antes de pasar a `<|story|>` y al cuerpo del relato. El script `chat.py` incluido implementa control de longitud (`--target`), modo planificación (`--think`), continuación de novela (`--continue-novel`) y selección automática de dispositivo (MPS, CUDA o CPU).

## Capacidades

- Generación de texto creativo en japonés: relatos cortos, escenas y novelas de longitud controlada (cientos o miles de caracteres).
- Modo de planificación estructurada (NV1C3): produce primero un registro de personajes, trama y escenas bajo `<|cast|>`, y después el texto bajo `<|story|>`.
- Modo directo (NV1C2): escritura sin fase de planificación, útil para continuaciones o pasajes breves.
- Continuación de texto existente mediante `--continue-novel` y `--prompt-file`, pensado para retomar un manuscrito previo.
- Control aproximado de longitud de salida mediante `min_new_tokens` y la lógica de `--target` (no termina antes del 80% del objetivo, favorece cierre en frontera de frase al superarlo y trunca al 130%).
- Ejecución en CPU, Apple MPS y CUDA sin requisitos de GPU dedicada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso más allá de la planificación textual descrita.
- No es multilingüe: solo japonés.
- No dispone de visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Generación de borradores de relatos cortos en japonés: con `--target 1000` y `min_new_tokens` ajustado a la mitad del objetivo, el modelo produce pasajes de longitud acotada útiles como punto de partida para un editor humano, aprovechando que el control de longitud evita finales prematuros.
- Planificación narrativa asistida: el modo `--think` (NV1C3) genera un registro de personajes y sinopsis antes del texto, lo que sirve para explorar tramas y elencos de forma rápida antes de escribir el borrador definitivo.
- Continuación de manuscritos: con `--continue-novel` y `--prompt-file` se puede alimentar un fragmento existente y obtener una continuación coherente a nivel de escena, útil para desbloquear escritura o generar variantes de un pasaje.
- Prototipado de herramientas de escritura creativa: al ser un modelo de 150M ejecutable en CPU o MPS, sirve para validar interfaces, plantillas de prompt y flujos de control de longitud en entornos sin GPU antes de migrar a modelos mayores.
- Generación de texto de relleno para maquetación y pruebas: en pipelines de publicación o diseño editorial en japonés, el modelo puede producir texto plausible con la longitud y estructura deseadas para pruebas de composición tipográfica.
- Investigación sobre planificación en modelos pequeños: la separación explícita entre `<|cast|>` y `<|story|>` permite estudiar cómo un modelo de 150M estructura la planificación narrativa frente a la generación directa, comparando NV1C3 y NV1C2 con los mismos pesos.
- Ficción para adultos en japonés: el entrenamiento incluye este tipo de contenido, por lo que puede generar escenas de ese registro; requiere revisión y control editorial por parte del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 132,4M de parámetros; en fp16 ocupa aproximadamente 265 MB de pesos, y en fp32 alrededor de 530 MB. Con caché KV para 4.096 tokens y overhead de runtime, el consumo se mantiene por debajo de 1-2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre es suficiente; no requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3050 o integrada con soporte CUDA es más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en GPUs integradas.
- Ejecución en CPU y Apple Silicon: el script `chat.py` selecciona automáticamente MPS si está disponible, luego CUDA y, en su defecto, CPU. El modelo es viable en CPU para generación de textos de cientos de caracteres.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (subcarpeta `transformers` o `transformers/nv1c2`), y el script propio `chat.py`. No hay soporte para llama.cpp/GGUF ni para MLX, según indica el autor, por las características del tokenizador y de la implementación GPT-2 de mlx-lm.
- Dependencias: `torch`, `tokenizers==0.22.2` (la serie 0.23 ignora `encode_special_tokens` y rompe el manejo de tokens reservados), `safetensors` y `numpy`.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| J-LLM Novel 150M JA (eightman999) | 132,4M | 4.096 | ja | CC BY-SA 4.0 | safetensors (nativo y GPT-2) | Especializado en novela japonesa, con modo de planificación `<|cast|>`/`<|story|>` |
| Modelos GPT-2 pequeños (124M-355M) | 124M-355M | 1.024 | en (principalmente) | MIT / modificada | safetensors, GGUF | Referencia de tamaño similar, pero sin especialización en japonés ni en narrativa |
| Modelos de narrativa japonesa de mayor tamaño | no disponible | no disponible | ja | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo pequeño (132,4M parámetros): el propio autor advierte de que es propenso a incoherencias argumentales y a repeticiones en generaciones largas.
- El registro de personajes puede contener nombres duplicados o inconsistentes.
- No está diseñado para chat ni para responder preguntas; su uso conversacional produce resultados pobres.
- Entrenado con contenido para adultos: puede generar material explícito de forma no solicitada. El autor declina responsabilidad sobre las salidas y recomienda revisar el contenido según el contexto y el público.
- Solo japonés: no hay soporte multilingüe; los prompts en otros idiomas degradan la calidad.
- Ventana de contexto de 4.096 tokens, adecuada para escenas y relatos cortos, pero insuficiente para novelas completas o conversaciones largas.
- Sin control de longitud nativo en transformers: sin `min_new_tokens` el modelo tiende a terminar antes de lo deseado; la relación aproximada es de 1,6 caracteres por token.
- Licencia CC BY-SA 4.0: permite uso comercial, modificación y redistribución, pero exige atribución al modelo original (nombre, autor, URL y licencia), indicación de cambios y aplicación de la misma licencia o una compatible a las modificaciones distribuidas. La licencia no se extiende automáticamente a los textos generados, pero persisten los derechos de las obras y terceros usados en el entrenamiento.
- Sin soporte para llama.cpp/GGUF ni MLX, lo que limita las opciones de despliegue eficiente fuera de PyTorch.
- Dependencia de `tokenizers==0.22.2`: versiones posteriores rompen el manejo de tokens reservados.
- Riesgo de alucinación y de sesgos presentes en los datos web y de ficción utilizados, no documentados por el autor.
- No se han publicado evaluaciones cuantitativas ni auditorías de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eightman999/v3v4-novel-150m-ja
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Repositorio del autor en Hugging Face: https://huggingface.co/eightman999
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
