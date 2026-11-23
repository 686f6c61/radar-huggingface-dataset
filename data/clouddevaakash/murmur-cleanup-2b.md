# clouddevaakash/murmur-cleanup-2b

## Resumen

Murmur Cleanup 2B es un ajuste fino (fine-tune) especializado en la limpieza de dictados de voz para la aplicación Murmur en macOS. Lo desarrolla el usuario de Hugging Face clouddevaakash y parte del modelo base Qwen/Qwen3.5-2B, sobre el que se aplica un QLoRA de rango 32 durante 2 épocas, empleando la variante `unsloth/Qwen3.5-2B` como punto de partida. El resultado se fusiona y se cuantiza a 4 bits uniforme en formato MLX con tamaño de grupo 64, lo que lo hace ejecutable en local sobre Apple Silicon.

El modelo resuelve un problema muy concreto: convertir transcripciones de voz en bruto (con muletillas, repeticiones y puntuación deficiente) en texto limpio y listo para usar, respetando instrucciones opcionales de tono, modo (correo, notas, prompt), vocabulario específico y contexto de pantalla. No es un modelo de propósito general, sino un componente de un pipeline de dictado que se carga mediante el `LocalCleanupRunner` de Murmur a través de mlx-swift-lm.

Es relevante ahora por su enfoque en inferencia 100 % local y baja latencia en hardware de consumo: según la validación interna del autor, alcanza una latencia p50 de 0,50 s y p95 de 1,32 s en un Apple M3. Se trata de una versión interina, según advierte el propio autor, que prevé sustituirla por un modelo posterior. El repositorio es pequeño (1,1 GB) y acumula muy pocas descargas, por lo que debe considerarse un artefacto experimental más que un modelo consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B); no se detalla la variante exacta en la informacion disponible |
| Parametros totales | 1.881.825.088 (aprox. 1,88 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la inferencia limita a 512 tokens nuevos de salida) |
| Tipos de cuantizacion | 4 bits uniforme MLX, group size 64 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), cuantizado a 4 bits |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-2B, un transformer de aproximadamente 1,88 mil millones de parametros. El ajuste se realiza mediante QLoRA con rango 32 durante 2 epocas, partiendo de la variante `unsloth/Qwen3.5-2B` para el entrenamiento. Posteriormente, el adaptador se fusiona con los pesos base y el conjunto resultante se cuantiza a 4 bits uniforme en formato MLX con tamaño de grupo 64, optimizado para ejecucion en Apple Silicon mediante mlx-swift-lm.

No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal no reside en la arquitectura, sino en el diseno del formato de entrada: un system prompt fijo (`Clean up this dictation.`), plantilla de chat del tokenizador con el modo de razonamiento (thinking) desactivado, temperatura 0 y un maximo de 512 tokens nuevos. La entrada admite cabeceras opcionales (`[tone:]`, `[mode:]`, `[vocab:]`, `[screen:]`) seguidas de la transcripcion, y la salida es unicamente el texto limpio.

## Capacidades

- Limpieza de dictados: elimina muletillas, repeticiones y errores de puntuacion, y devuelve texto pulido.
- Control de estilo mediante cabecera `[tone: formal]` (estilo profesional); sin cabecera aplica el estilo por defecto (Polish).
- Reescritura por preset mediante `[mode: email|notes|prompt]` para correos, notas o prompts.
- Sesgo de vocabulario mediante `[vocab: a; b]` con hasta 12 terminos.
- Uso de contexto de pantalla mediante `[screen: ...]` con hasta 400 caracteres (incompatible con `[mode:]`).
- Generacion de texto conversacional (pipeline `text-generation`), aunque orientada a la tarea de limpieza.
- Ejecucion en local en macOS sobre Apple Silicon mediante MLX y mlx-swift-lm.
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso; el modo thinking se desactiva explicitamente.

## Casos de uso

- Dictado en macOS con Murmur: el modelo se integra como `LocalCleanupRunner` para convertir la transcripcion en bruto en texto limpio antes de insertarlo en la aplicacion activa, con latencia p50 de 0,50 s en un M3.
- Redaccion de correos por voz: usando `[mode: email]` y `[tone: formal]`, el dictado se reescribe con estructura y registro adecuados para un correo profesional.
- Toma de notas rapidas: con `[mode: notes]` se transforma un dictado desordenado en notas concisas y legibles.
- Generacion de prompts por voz: con `[mode: prompt]` el dictado se convierte en una instruccion estructurada para un asistente o modelo generativo.
- Adaptacion a jerga tecnica: con `[vocab: ...]` (hasta 12 terminos) se corrige la transcripcion de nombres propios, siglas o terminologia de dominio.
- Limpieza contextual en edicion: con `[screen: ...]` (hasta 400 caracteres) el modelo puede ajustar el texto al contexto visible en pantalla, por ejemplo para mantener coherencia con un parrafo previo.
- Procesamiento por lotes de transcripciones en local: al ser un modelo pequeno cuantizado a 4 bits, puede ejecutarse en portatiles Apple sin conexion a la nube, lo que resulta util para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta una evaluacion interna sobre un conjunto de validacion de 100 filas, en Apple M3 y con cuantizacion a 4 bits:

| Metrica (validacion interna, 100 filas, M3, 4-bit) | Valor |
|---|---|
| Fallos graves (cambio de significado, contenido omitido, instrucciones ejecutadas) | 5% |
| Instrucciones contenidas en la transcripcion ejecutadas | 0% |
| Fuga de contexto de pantalla (screen-context bleed) | 0% |
| Latencia p50 | 0,50 s |
| Latencia p95 | 1,32 s |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 1,1 GB en cuantizacion 4-bit, por lo que la inferencia requiere aproximadamente 1-2 GB de memoria, mas el overhead del runtime MLX.
- Hardware objetivo: Apple Silicon (el autor reporta pruebas en Apple M3). El formato MLX y la libreria mlx-swift-lm estan orientados a macOS con chips M-series.
- GPU CUDA (A100, H100, RTX 4090): no se documenta soporte; el modelo esta empaquetado para MLX, no para CUDA.
- Cabe en GPUs de consumo Apple (M1, M2, M3, M4) con memoria unificada de 8 GB o superior, segun el tamano del repositorio.
- Opciones de despliegue: MLX y mlx-swift-lm (via `LocalCleanupRunner` de Murmur). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia: p50 de 0,50 s y p95 de 1,32 s en Apple M3 con 4 bits. No se reporta throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de este modelo frente a alternativas, por lo que la comparacion se limita a caracteristicas estructurales. Las alternativas indicadas son el modelo base y una variante de la misma familia; no se dispone de informacion sobre otros modelos especializados en limpieza de dictado.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| Murmur Cleanup 2B | ~1,88 B | no disponible | 4-bit MLX | Apache-2.0 | Limpieza de dictados (fine-tune QLoRA) |
| Qwen/Qwen3.5-2B (base) | ~1,88 B (segun el modelo derivado) | no disponible | no disponible | no disponible | Modelo general de texto |
| unsloth/Qwen3.5-2B | ~1,88 B | no disponible | no disponible | no disponible | Variante del base usada para el entrenamiento |

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta soporte multilingue.
- Es una version interina: el autor advierte que un modelo posterior la sustituira, por lo que no es recomendable como dependencia estable en produccion.
- El 5% de fallos graves en la validacion interna (cambios de significado, contenido omitido o instrucciones ejecutadas) implica un riesgo no despreciable de perdida o alteracion de informacion en dictados.
- Riesgo de alucinacion inherente a los modelos generativos: aunque la evaluacion reporta 0% de ejecucion de instrucciones contenidas en la transcripcion y 0% de fuga de contexto de pantalla, estas cifras provienen de un conjunto de 100 filas y no garantizan el comportamiento en dominios no vistos.
- Restricciones de formato: maximo de 512 tokens nuevos de salida, hasta 12 terminos en `[vocab:]` y hasta 400 caracteres en `[screen:]`; `[screen:]` no puede combinarse con `[mode:]`.
- Dependencia de MLX y macOS: no es directamente portable a entornos CUDA sin conversion adicional.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo base Qwen3.5-2B debe verificarse por separado para confirmar condiciones adicionales.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: sin validacion por parte de la comunidad.
- No se documentan sesgos conocidos ni evaluaciones de robustez fuera del conjunto interno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/clouddevaakash/murmur-cleanup-2b
- Repositorio de Murmur: https://github.com/theaakashb/Murmur
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante usada para entrenamiento: https://huggingface.co/unsloth/Qwen3.5-2B
- No se han encontrado en la informacion disponible papers, blogs ni demos adicionales.
