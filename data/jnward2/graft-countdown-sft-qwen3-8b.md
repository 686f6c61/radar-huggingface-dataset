# jnward2/graft-countdown-sft-qwen3-8b

## Resumen

GRAFT Countdown-Code SFT init (Qwen3-8B) es un ajuste fino supervisado (SFT) del modelo Qwen3-8B de Alibaba, publicado por el usuario jnward2 como punto de partida para los experimentos de aprendizaje por refuerzo del proyecto GRAFT. No se trata de un modelo de propósito general, sino de un *checkpoint* de inicialización: el autor indica explícitamente que los pesos son copias sin modificar del resultado de su receta de SFT sobre el conjunto de datos Countdown-Code, y que no corresponden a los pesos finales de ningún envío o evaluación oficial.

El modelo parte de la arquitectura Qwen3-8B, un transformer denso de aproximadamente 8.190 millones de parámetros, y hereda por tanto las capacidades base de dicha familia (generación de texto, razonamiento, código y soporte multilingüe). La intervención del autor consiste en un *priming* mediante SFT sobre datos de tipo Countdown-Code, un formato de tarea que combina razonamiento aritmético con generación de expresiones, orientado a preparar el modelo para posteriores ciclos de RL.

Su relevancia es acotada y fundamentalmente reproducible: sirve como referencia para quien quiera replicar los experimentos de GRAFT o auditar la receta de SFT. No hay métricas publicadas, ni licencia declarada, ni idiomas documentados, y el repositorio tiene cero descargas, lo que lo sitúa como un artefacto de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), con RoPE almacenado como `rope_parameters` |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-8B soporta contextos largos, pero el autor no lo documenta) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar; repo de 16,4 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3 con 8.190 millones de parámetros, inicializado desde Qwen/Qwen3-8B. El autor no detalla la configuración interna (número de capas, dimensión oculta, cabezas de atención), pero sí una particularidad técnica relevante: el `config.json` almacena el RoPE bajo la clave `rope_parameters`, un formato que transformers 4.x ignora, provocando una caída a `rope_theta` 10000 en lugar de 1.000.000. Por ello el repositorio fija transformers 5.2.0 y recomienda usar la versión 5 o superior; cargarlo con versiones anteriores altera el comportamiento posicional del modelo.

El entrenamiento consiste en un SFT sobre datos derivados de Countdown-Code. La receta documentada es: ejecutar `rl/tools/countdown_build_sft_data.py` sobre el fichero `o4-mini-distillation-16k.jsonl` (destilación de un modelo o4-mini con 16.000 ejemplos) y después lanzar `rl/tools/modal_countdown_sft.py::run --model Qwen/Qwen3-8B`. Los pesos se regeneraron el 2026-10-20 y son copias sin modificar del volumen Modal `gr-modal-pilot`. No se documentan número total de tokens, composición del dataset, ni si hubo RLHF o DPO; el SFT es precisamente la fase previa a los ciclos de RL del proyecto GRAFT.

## Capacidades

- Generación de texto conversacional y de un solo turno, heredada del modelo base Qwen3-8B.
- Razonamiento aritmético y de tipo Countdown-Code: el SFT está orientado a tareas de construcción de expresiones que alcanzan un objetivo numérico.
- Generación de código, como capacidad del modelo base (no verificada específicamente en este checkpoint).
- Soporte multilingüe heredado de Qwen3-8B, aunque no documentado por el autor.
- Compatible con text-generation-inference y con *endpoints* de HuggingFace (etiquetas `text-generation-inference` y `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, modo thinking, visión ni audio en esta ficha.

## Casos de uso

- Reproducción de experimentos GRAFT: cargar este checkpoint como inicialización (`GRAFT_COUNTDOWN_SFT_MODEL`) y lanzar los *sweeps* de RL del proyecto para replicar o extender los resultados del autor.
- Auditoría de la receta de SFT: regenerar los datos con `countdown_build_sft_data.py` y comparar el checkpoint resultante con estos pesos para validar la reproducibilidad del pipeline.
- Investigación en razonamiento aritmético: usar el modelo como línea base de SFT antes de aplicar RL y medir la ganancia atribuible a la fase de refuerzo en tareas Countdown.
- Estudio de formatos de datos de destilación: analizar cómo el corpus `o4-mini-distillation-16k.jsonl` influye en el comportamiento del modelo base tras el ajuste.
- Experimentos de alineación y RL: servir como punto de partida controlado para probar algoritmos de refuerzo sin partir de un modelo ya ajustado con RLHF.
- Validación de infraestructura de despliegue: probar la carga con transformers 5.x y verificar el manejo correcto de `rope_parameters` antes de integrar el modelo en pipelines mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 16,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB.
- Cuantización a 8 bits: aproximadamente 8-9 GB de pesos; a 4 bits, en torno a 4-5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin compromisos; RTX 4090 (24 GB) para fp16 ajustado o 8 bits.
- GPU de consumo: cabe en RTX 4090 y, con cuantización agresiva, en GPUs de 8-12 GB, si bien no hay GGUF oficial en el repositorio.
- Opciones de despliegue: transformers 5.x (requisito estricto por el formato RoPE), text-generation-inference y endpoints de HuggingFace; llama.cpp u Ollama requerirían conversión propia a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GRAFT Countdown-Code SFT (Qwen3-8B) | 8,19 B | no disponible | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-8B (base) | ~8 B | no disponible en esta ficha | no disponible en esta ficha | HuggingFace, ampliamente usado |
| Otros SFT de Qwen3-8B para razonamiento | no disponible | no disponible | no disponible | no disponible |

La comparación significativa es con el propio Qwen3-8B: este checkpoint añade el *priming* SFT sobre Countdown-Code, pero no publica métricas que cuantifiquen la diferencia. Frente a otros modelos de 8 B de propósito general, carece de licencia e idiomas declarados, lo que limita su evaluación comparativa.

## Limitaciones y advertencias

- No es un modelo final: el autor advierte que los pesos son un *checkpoint* de inicialización para RL y no los pesos de ningún envío evaluado.
- Licencia no declarada: no hay garantía de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no documentados: se asume el multilingüismo de Qwen3-8B, pero no está verificado para este ajuste.
- Riesgo de alucinación inherente a un modelo de 8 B ajustado con SFT sobre datos sintéticos destilados; sin evaluaciones publicadas no puede acotarse.
- Dependencia estricta de transformers 5.x: cargarlo con 4.x degrada silenciosamente el RoPE (theta 10000 en lugar de 1.000.000) y altera las respuestas.
- Sesgos: no documentados; los datos de destilación de o4-mini pueden introducir sesgos del modelo profesor.
- Contexto máximo no especificado en la model card; no asumir la ventana del modelo base sin verificar la configuración.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia externa de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jnward2/graft-countdown-sft-qwen3-8b
- Repositorio GRAFT: https://github.com/jnward/GRAFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
