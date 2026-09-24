# francesca9805/ppt-wc-uniform-newlex-eus-after-100mb-packed-bfd_seed455

## Resumen

`francesca9805/ppt-wc-uniform-newlex-eus-after-100mb-packed-bfd_seed455` es un ajuste fino (fine-tune) supervisado del modelo `goldfish-models/eng_latn_100mb`, desarrollado por el usuario de HuggingFace `francesca9805`. Se trata de un modelo de generación de texto de tipo decoder-only con arquitectura GPT-2 y 86.508.288 parámetros totales (unos 86,5 millones), entrenado mediante SFT con la librería TRL. El repositorio ocupa 0,2 GB y los pesos se distribuyen en formato safetensors.

El modelo base pertenece a la familia Goldfish, una colección de modelos monolingües de tipo GPT-2 entrenados sobre aproximadamente 100 MB de texto por idioma; en este caso, la variante `eng_latn_100mb` corresponde al inglés en escritura latina. El nombre del fine-tune incluye el segmento `eus`, que coincide con el código ISO 639-3 del euskera, así como los términos `newlex` (nuevo léxico) y `packed`, lo que sugiere un experimento de adaptación de tokenizador o vocabulario sobre ese idioma. No obstante, la model card no confirma estos extremos y no se aportan datos sobre el dataset de entrenamiento final.

La relevancia de esta ficha es acotada: se trata de un modelo de investigación de escala muy reducida (86,5 M de parámetros), con 0 descargas y 0 likes en el momento de la consulta, sin métricas de evaluación publicadas y sin licencia declarada. Es útil como referencia para reproducir experimentos de ajuste lingüístico de bajo coste, no como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parámetros totales | 86.508.288 (~86,5 M, dato real de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no lo especifica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible; el modelo base es `goldfish-models/eng_latn_100mb` (inglés) y el nombre del modelo incluye `eus`, código ISO 639-3 del euskera |
| Licencia | no disponible (el campo `licence` de la model card contiene el marcador de posición "license") |
| Formato de pesos | safetensors (carga mediante transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, heredada del modelo base `goldfish-models/eng_latn_100mb`. Con 86,5 millones de parámetros, se sitúa por debajo de GPT-2 small (124 M), por lo que probablemente emplea menos capas o una dimensión de embedding menor, aunque la model card no detalla la configuración exacta de capas, cabezas de atención ni dimensión oculta. El modelo base Goldfish está diseñado para lenguas de bajos recursos y se entrena sobre corpus monolingües de unos 100 MB, con vocabularios adaptados al idioma.

El entrenamiento de este fine-tune se realizó mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El nombre del modelo sugiere el uso de un tokenizador "nuevo" (`newlex`) y de secuencias empaquetadas (`packed`), así como un identificador de experimento (`uniform`, `bfd`, `seed455`), pero la model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas posteriores como RLHF o DPO. No se declara ninguna innovación arquitectónica (atención lineal, decodificación especulativa, MoE o SSM); se trata de una arquitectura transformer convencional.

## Capacidades

- Generación de texto autoregresiva en el idioma o idiomas para los que se haya ajustado el modelo base, presumiblemente inglés y, según el nombre, euskera.
- Ejecución mediante `pipeline("text-generation")` de Transformers, con soporte de entrada en formato conversacional (`[{"role": "user", "content": ...}]`), tal y como muestra la model card.
- Entrenado con SFT, por lo que puede seguir instrucciones simples en el formato de prompt con el que se ajustó (no documentado).
- Compatibilidad declarada con text-generation-inference y endpoints, según las etiquetas del repositorio.
- No se documentan capacidades de razonamiento avanzado, matemáticas, código, visión, audio, tool calling ni uso como agente. No hay evidencia de modo "thinking" ni de multi-step reasoning.

## Casos de uso

- Investigación sobre tokenizadores y léxico: el nombre del modelo (`newlex`, `uniform`) apunta a experimentos de adaptación de vocabulario; puede emplearse para reproducir y comparar variantes de tokenización en un idioma concreto.
- Ajuste lingüístico de bajo coste: con 86,5 M de parámetros, sirve como banco de pruebas para pipelines de SFT con TRL antes de escalar a modelos mayores.
- Evaluación de modelos pequeños en lenguas minoritarias: dado el posible componente en euskera, es útil para estudiar el comportamiento de modelos diminutos en idiomas de bajos recursos.
- Docencia y formación: permite ilustrar de forma práctica el ciclo completo de fine-tuning de un GPT-2 con TRL y su publicación en HuggingFace.
- Prototipado rápido en CPU: por su tamaño reducido, se puede ejecutar en portátiles sin GPU para pruebas de generación de texto.
- Reproducción de experimentos con semillas controladas: el sufijo `seed455` facilita estudiar la variabilidad de resultados entre semillas en entrenamientos pequeños.
- No se recomienda su uso en atención al cliente, generación de código en producción, agentes autónomos ni tareas que requieran contexto largo, dado que no hay evidencia de dichas capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en FP32, unos 0,17 GB en FP16/BF16 y menos de 0,1 GB en cuantizaciones de 8 o 4 bits (estimación a partir de los 86,5 M de parámetros; no verificada con el modelo).
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en iGPU o CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con al menos 1 GB de VRAM es suficiente. Para lotes grandes, una GPU de gama media es más que suficiente.
- Opciones de despliegue: transformers (incluido `pipeline`), text-generation-inference y endpoints compatibles según las etiquetas. No se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI, aunque al ser un GPT-2 estándar es probable que funcione en varios de ellos previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `francesca9805/ppt-wc-uniform-newlex-eus-after-100mb-packed-bfd_seed455` | 86,5 M | no disponible | no disponible | HuggingFace, 0 descargas |
| `goldfish-models/eng_latn_100mb` (modelo base) | no disponible | no disponible | no disponible | HuggingFace (familia Goldfish) |
| GPT-2 small (referencia arquitectónica) | 124 M | 1024 tokens | MIT | Ampliamente disponible |

No se dispone de datos de rendimiento para comparar cuantitativamente ninguno de estos modelos en benchmarks estándar.

## Limitaciones y advertencias

- Licencia no declarada: el campo `licence` de la model card contiene el marcador de posición "license", por lo que el uso comercial queda en un limbo legal y no se puede asumir ningún permiso.
- Idiomas no declarados: aunque el nombre sugiere euskera y el modelo base es inglés, no hay confirmación oficial sobre las lenguas cubiertas.
- Riesgo elevado de alucinación y de generar texto incoherente: con 86,5 M de parámetros y entrenamiento sobre solo 100 MB de texto, la calidad y el conocimiento factual son muy limitados.
- Contexto reducido y no documentado: al derivar de GPT-2, la ventana de contexto es previsiblemente corta, lo que impide conversaciones largas o tareas con contexto extenso.
- Sin benchmarks publicados: no hay evidencia objetiva de rendimiento en ninguna tarea.
- Sin datos de sesgo: no se documenta la composición del dataset de ajuste, por lo que no se pueden evaluar sesgos.
- Sin mantenimiento ni tracción: 0 descargas y 0 likes indican que no es un modelo validado por la comunidad; no hay garantías de soporte.
- No apto para producción: se trata de un artefacto de investigación sin garantías de robustez, seguridad ni cumplimiento normativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-eus-after-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Informe de entrenamiento (Weights & Biases): https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/orzmw6il
