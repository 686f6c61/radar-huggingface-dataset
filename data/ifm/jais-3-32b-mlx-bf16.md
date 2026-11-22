# IFM/Jais-3-32B-MLX-bf16

## Resumen

Jais-3-32B es un modelo de lenguaje denso, decoder-only, desarrollado por el equipo IFM (Inception42), orientado a árabe e inglés y presentado como la propuesta de la familia Jais para IA agéntica centrada en árabe ("Jais 3: Introducing Arabic-centric Agentic AI", arXiv:2611.10224). Esta ficha concreta, `IFM/Jais-3-32B-MLX-bf16`, es la conversión a formato MLX en bf16 de los pesos originales de `IFM/Jais-3-32B` (revisión `847c6fc`), pensada para ejecución en Apple Silicon mediante `mlx-lm`.

El modelo emplea una arquitectura propia denominada `k2_horizon` (no soportada todavía de forma nativa por `mlx-lm`, por lo que el repositorio incluye el código en `k2_horizon.py`), cuenta con 34.779.304.960 parámetros reales (≈34,8B, comercializado como 32B) y una ventana de contexto de 524.288 tokens (512K). Incorpora un modo de razonamiento interno delimitado por las etiquetas `<ifm|think> … </ifm|think>` con niveles de esfuerzo configurables (`high`, `medium`, `low`).

Su relevancia actual reside en tres factores: una ventana de contexto de 512K poco habitual en modelos de este tamaño, un enfoque explícito en árabe (idioma históricamente infrarrepresentado en modelos abiertos de gran escala) y una licencia Apache-2.0 heredada del modelo base, que permite uso comercial sin restricciones adicionales declaradas. La conversión MLX no aplica cuantización: son los pesos bf16 originales en formato MLX, con un tamaño en disco de 69,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, arquitectura `k2_horizon` (implementación propia en `k2_horizon.py`) |
| Parametros totales | 34.779.304.960 (≈34,8B; denominado comercialmente 32B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | Esta variante: bf16 sin cuantizar (16,0 bits/peso). Existen variantes MLX de 8 bits (8,5 bits/peso) y 4 bits (5,9 bits/peso) del mismo modelo |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX (bf16); repositorio de 69,6 GB |
| Libreria | mlx (mlx-lm, requiere `trust_remote_code`) |
| Capas | 64 (según la verificación de conversión descrita en la model card) |
| Modo de razonamiento | Etiquetas `<ifm|think> … </ifm|think>`, con `reasoning_effort` configurable (`high` por defecto, `medium`, `low`) |
| Modelo base | IFM/Jais-3-32B (revisión `847c6fc`) |

## Arquitectura y entrenamiento

Jais-3-32B es un transformer decoder-only denso de 64 capas con una arquitectura propietaria bautizada `k2_horizon`. La model card de esta conversión no detalla la composición interna de dicha arquitectura (tipo de atención, normalización, positional encoding), y remite para ello a la model card del modelo base. Sí se indica que todas las capas ejecutan la misma ruta de código que los modelos densos más pequeños de la familia Jais-3, lo que permitió validar la conversión de forma parcial: se comparó la implementación MLX contra el código PyTorch (`modeling_k2_horizon.py`) en fp32 sobre los pesos reales, truncando el modelo a sus primeras 4 capas más la normalización final y el `lm_head`, con prompts en inglés, código, árabe y matemáticas. Los logits coinciden con un error relativo de 2e-6 o mejor, las predicciones de siguiente token coinciden en todas las posiciones y la decodificación greedy con caché KV produce los mismos tokens (64/64 en cada prompt).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación; la model card de esta variante no los incluye y remite al paper (arXiv:2611.10224) y a la model card original. La conversión a MLX no introduce ninguna modificación de pesos (es una conversión pura de formato bf16) y el único cambio funcional declarado es en la plantilla de chat: la original lanza un error cuando un mensaje previo del asistente carece de campo de razonamiento (lo que envían los clientes estilo OpenAI), mientras que la de este repositorio renderiza un bloque de razonamiento vacío en esos casos.

## Capacidades

- Generación de texto conversacional en árabe e inglés, con plantilla de chat propia.
- Razonamiento explícito previo a la respuesta dentro de `<ifm|think> … </ifm|think>`, con control granular del esfuerzo mediante `reasoning_effort` (`high`, `medium`, `low`).
- Contexto largo de hasta 524.288 tokens, adecuado para documentos extensos, repositorios de código o historiales de conversación muy largos.
- Soporte de tool calling / function calling: la model card menciona un formato de llamada a herramientas, aunque advierte que `mlx_lm.server` todavía no lo parsea.
- Capacidades agénticas y de razonamiento multi-paso, coherentes con el enfoque "agentic AI" del paper de presentación.
- Capacidades multilingües limitadas a árabe e inglés según los metadatos del modelo.
- Ejecución en Apple Silicon mediante MLX, con `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server`.

## Casos de uso

- Atención al cliente en árabe: el modelo puede mantener conversaciones multi-turno con historiales muy extensos gracias a su ventana de 512K tokens, lo que permite conservar todo el contexto de un cliente (pedidos, incidencias previas, correos) sin truncar.
- Procesamiento de documentación legal o administrativa en árabe: contratos, expedientes o normativa de cientos de páginas caben en una sola pasada de contexto, con razonamiento explícito para justificar conclusiones.
- Asistencia a la programación: generación y revisión de código con contexto de repositorios completos, apoyándose en el modo de razonamiento para tareas de depuración multi-paso.
- Agentes autónomos con tool calling: integración en flujos donde el modelo decide qué herramienta invocar y encadena varios pasos, usando `reasoning_effort="medium"` o `"low"` para reducir latencia en bucles agénticos.
- Investigación en NLP árabe: evaluación de modelos abiertos con licencia Apache-2.0 sobre corpus árabes, análisis de perplejidad y experimentos de ajuste fino sin restricciones de licencia.
- Despliegue local en estaciones de trabajo Apple Silicon: prototipado y demos en un Mac con M4 Max u similar, usando `mlx_lm.server` como endpoint compatible con clientes OpenAI (con la salvedad del campo de razonamiento).
- Traducción y adaptación de contenido entre árabe e inglés con contexto largo, por ejemplo localización de documentación técnica manteniendo terminología consistente a lo largo de todo el documento.

## Benchmarks y rendimiento

La model card solo publica métricas de perplejidad y velocidad para las variantes MLX de 8 y 4 bits; la configuración bf16 (este repositorio) no pudo medirse. Los porcentajes son relativos a 8 bits, que según el autor está a menos del 0,2% de bf16 en todos los modelos Jais-3 más pequeños.

| Metrica | bf16 (este repo) | 8-bit | 4-bit |
|---|---|---|---|
| Bits/peso | 16,0 | 8,5 | 5,9 |
| Disco | 69,6 GB | 37,0 GB | 25,5 GB |
| Memoria pico | no disponible | 37,2 GB | 25,8 GB |
| Perplejidad WikiText-2 (inglés) | no disponible | 9,324 | 9,521 (+2,1%) |
| Perplejidad Wikipedia árabe | no disponible | 11,307 | 11,661 (+3,1%) |
| Generación (Apple M4 Max) | no disponible | 12,4 tok/s | 18,8 tok/s |

No se han publicado en la información disponible resultados de benchmarks de calidad tipo MMLU, HumanEval o GSM8K; la model card remite al paper arXiv:2611.10224 y a la model card del modelo base para benchmarks de arquitectura y uso previsto.

## Requisitos de hardware

- VRAM/memoria unificada: esta variante bf16 ocupa 69,6 GB en disco y, al no estar cuantizada, requiere del orden de esa cifra de memoria disponible para cargar los pesos (la memoria pico no está medida en la model card).
- Alternativas cuantizadas del mismo modelo: 8 bits con 37,2 GB de memoria pico y 4 bits con 25,8 GB, mucho más viables en hardware de consumo.
- Hardware objetivo: Apple Silicon (formato MLX). La model card cita un Apple M4 Max como plataforma de medida; no se proporcionan datos para GPU NVIDIA.
- GPU de consumo: la variante 4 bits (25,8 GB) es la única que se acerca al rango de GPUs de consumo de gran capacidad de memoria; las variantes bf16 y 8 bits quedan fuera de cualquier GPU de consumo actual. Para NVIDIA no hay soporte declarado en este repositorio (es específico de MLX).
- Despliegue: `mlx-lm` (versión probada 0.32.0) con `--trust-remote-code` obligatorio, ya que `mlx-lm` no soporta aún la arquitectura `k2_horizon` y carga el código incluido vía `model_file` en `config.json`. Funciona con `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento medido: 12,4 tok/s en 8 bits y 18,8 tok/s en 4 bits sobre M4 Max; para bf16 no hay dato.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos de la misma categoría (32B densos con contexto largo). La siguiente tabla recoge únicamente los datos ciertos de esta familia y deja explícitos los huecos.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jais-3-32B-MLX-bf16 (este) | 34,8B | 512K | Apache-2.0 | MLX safetensors bf16 | Solo Apple Silicon; requiere `trust_remote_code` |
| Jais-3-32B-MLX-8bit | 34,8B | 512K | Apache-2.0 | MLX 8 bits | 37,0 GB, 12,4 tok/s en M4 Max |
| Jais-3-32B-MLX-4bit | 34,8B | 512K | Apache-2.0 | MLX 4 bits | 25,5 GB, 18,8 tok/s en M4 Max |
| Jais-3-32B (base) | 34,8B | 512K | Apache-2.0 | PyTorch safetensors | Pesos originales; benchmarks en su model card |

Comparación con modelos de otros autores: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo árabe e inglés declarados; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Arquitectura no soportada nativamente: `mlx-lm` no reconoce `k2_horizon`, por lo que es obligatorio `--trust-remote-code`; esto implica ejecutar código del repositorio y conviene revisarlo antes.
- Razonamiento en servidor: `mlx_lm.server` no reconoce las etiquetas `<ifm|think>`, de modo que el texto de razonamiento se devuelve dentro de `content` en lugar de un campo `reasoning` separado; el formato de tool calling tampoco se parsea.
- Plantilla de chat modificada respecto al modelo base para tolerar mensajes de asistentes sin campo de razonamiento (estilo OpenAI); es un cambio funcional a tener en cuenta si se compara con el modelo original.
- Consumo de tokens: el modo de razonamiento consume tokens antes de responder; hay que reservar espacio en `max_tokens` o las respuestas pueden truncarse.
- Riesgo de alucinación: no cuantificado en la información disponible; como en cualquier LLM, debe validarse en producción.
- Sesgos: no documentados en la model card de esta variante.
- Licencia: Apache-2.0 permite uso comercial, pero la model card remite a la del modelo base para condiciones y uso previsto; conviene revisarla.
- Verificación de conversión parcial: la comprobación numérica se hizo truncando el modelo a 4 capas, no sobre las 64 completas (aunque el autor indica que todas las capas usan la misma ruta de código que modelos menores ya validados íntegramente).
- Perplejidad no medida en bf16: no hay cifras de calidad para esta variante concreta; las referencias son las de 8 y 4 bits.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IFM/Jais-3-32B-MLX-bf16
- Modelo base: https://huggingface.co/IFM/Jais-3-32B
- Variante MLX 8 bits: https://huggingface.co/IFM/Jais-3-32B-MLX-8bit
- Variante MLX 4 bits: https://huggingface.co/IFM/Jais-3-32B-MLX-4bit
- Paper "Jais 3: Introducing Arabic-centric Agentic AI": https://arxiv.org/abs/2611.10224
- Código de arquitectura incluido en el repo: `k2_horizon.py` (dentro del repositorio de Hugging Face)
- Librería de ejecución: `mlx-lm` (https://github.com/ml-explore/mlx-lm)
