# IFM/Jais-3-32B-MLX-8bit

## Resumen

Jais-3-32B-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo Jais-3-32B, desarrollado por el equipo IFM (Inception42) como parte de la familia Jais 3, orientada a IA agéntica centrada en árabe. Se trata de un modelo denso decoder-only de aproximadamente 34.780 millones de parámetros (34,78 B reales según safetensors) con una ventana de contexto de 512K tokens (524.288), lo que lo convierte en el modelo denso grande de la familia Jais-3.

La relevancia de esta variante concreta es de infraestructura: permite ejecutar un modelo de 32B con contexto muy largo en Apple Silicon mediante mlx-lm, con un peso efectivo de 8,5 bits por parámetro y 37,0 GB en disco. Incorpora el código del modelo (`k2_horizon.py`) en el propio repositorio porque mlx-lm todavía no soporta de forma nativa la arquitectura `k2_horizon`, de modo que se carga mediante `trust_remote_code`.

El modelo base está pensado para cargas de trabajo bilingües árabe-inglés, con modo de razonamiento explícito (`<ifm|think>`) y niveles de esfuerzo configurables (`reasoning_effort`: high, medium, low). La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, arquitectura `k2_horizon` |
| Parametros totales | 34.779.304.960 (34,78 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | 8 bits entero afín, group size 64, en todas las capas lineales y embeddings (8,5 bits/peso efectivos); existen variantes bf16 y 4-bit del mismo modelo |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`), con código de modelo Python incluido (`k2_horizon.py`) |

## Arquitectura y entrenamiento

El modelo base Jais-3-32B es un transformer decoder-only denso de 32B parámetros con arquitectura denominada `k2_horizon` y una ventana de contexto de 512K tokens. La model card de esta variante cuantizada no detalla la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card del modelo base (`IFM/Jais-3-32B`) y no se incluyen en la información disponible. El nombre del paper asociado, "Jais 3: Introducing Arabic-centric Agentic AI" (arXiv:2611.10224), sugiere un enfoque de entrenamiento orientado a uso agéntico y a árabe, pero no se aportan cifras concretas.

La innovación técnica documentada en esta ficha es la conversión a MLX: cuantización entera afín de 8 bits con group size 64 aplicada a todas las capas lineales y a los embeddings, con verificación frente al código PyTorch original (`modeling_k2_horizon.py`) en fp32 sobre los pesos reales del modelo. La comprobación se hizo truncando el modelo a sus primeras 4 capas (más la norma final y `lm_head`), con prompts en inglés, código, árabe y matemáticas: los logits coinciden con un error relativo de 2e-6 o mejor, las predicciones de siguiente token coinciden en todas las posiciones y la decodificación greedy con caché KV produce los mismos 64/64 tokens en cada prompt. Las 64 capas restantes ejecutan el mismo camino de código que los modelos densos Jais-3 más pequeños, verificados completos. Adicionalmente, el modelo incorpora un modo de razonamiento interno delimitado por las etiquetas `<ifm|think> … </ifm|think>`.

## Capacidades

- Generación de texto conversacional y de propósito general en árabe e inglés.
- Razonamiento explícito con modo "thinking": el modelo genera texto de razonamiento dentro de `<ifm|think> … </ifm|think>` antes de la respuesta final.
- Control del esfuerzo de razonamiento mediante `reasoning_effort` en la plantilla de chat: `"high"` (por defecto), `"medium"` o `"low"`.
- Soporte de tool calling / function calling: la model card menciona un formato de tool-calls, aunque señala que mlx-lm todavía no lo parsea.
- Capacidades agénticas y de razonamiento multi-paso, según el enfoque declarado del paper ("Arabic-centric Agentic AI").
- Manejo de contexto muy largo (512K tokens) gracias a la ventana del modelo base.
- Capacidad de código y matemáticas: verificado en la conversión con prompts de código y matemáticas, aunque sin benchmarks publicados en esta ficha.
- Multilingüismo limitado a árabe e inglés según los metadatos del modelo.

## Casos de uso

- Asistentes conversacionales en árabe para atención al cliente: el modelo puede mantener diálogos multi-turno con contexto muy largo (512K tokens), lo que permite incluir historiales extensos, documentación de producto o transcripciones completas sin truncar.
- Procesamiento de documentos largos en árabe e inglés: resumen, extracción de entidades y preguntas sobre contratos, informes o expedientes que superen ampliamente el contexto típico de 8K-128K tokens.
- Razonamiento asistido con trazas auditables: el modo `<ifm|think>` con `reasoning_effort` configurable permite generar cadenas de razonamiento visibles para depuración o auditoría, útil en entornos educativos o de análisis.
- Desarrollo y revisión de código en inglés: el modelo fue validado con prompts de código y puede integrarse en asistentes de programación locales sobre Apple Silicon, aunque sin soporte nativo de tool calling en mlx-lm.
- Investigación en PLN árabe: evaluación de modelos densos de 32B con contexto largo en tareas de generación y razonamiento en árabe, ejecutables en estaciones de trabajo Mac sin GPU dedicada.
- Despliegue local y privado en Apple Silicon: prototipado y demos con `mlx_lm.server` en un Mac con al menos 40 GB de memoria unificada, sin enviar datos a servicios externos.
- Agentes multi-paso con herramientas: la orientación agéntica del modelo base permite construir flujos que encadenen llamadas a funciones, si bien el parseo de tool-calls debe implementarse fuera de mlx-lm.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de perplejidad y velocidad de generación de las variantes MLX del modelo, medidos de forma homogénea:

| Métrica | bf16 | 8-bit | 4-bit |
|---|---|---|---|
| Bits/peso | 16,0 | 8,5 | 5,9 |
| Disco | 69,6 GB | 37,0 GB | 25,5 GB |
| Memoria pico | n/a | 37,2 GB | 25,8 GB |
| Perplejidad WikiText-2 (inglés) | n/a | 9,324 | 9,521 (+2,1%) |
| Perplejidad Wikipedia árabe | n/a | 11,307 | 11,661 (+3,1%) |
| Generación (Apple M4 Max) | n/a | 12,4 tok/s | 18,8 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La configuración bf16 no pudo medirse; los porcentajes son relativos a 8-bit, que según el autor está dentro del 0,2% de bf16 en todos los modelos Jais-3 más pequeños.

## Requisitos de hardware

- VRAM/memoria estimada: 37,2 GB de pico para un prompt corto en la variante 8-bit; el caché KV crece con el contexto, por lo que contextos largos requieren más memoria.
- Hardware objetivo: Apple Silicon con memoria unificada; el autor reporta mediciones en un Apple M4 Max. No se documentan requisitos para GPU NVIDIA/AMD en esta variante.
- Cabe en consumer hardware de Apple: un Mac con 48 GB o 64 GB de memoria unificada es el escenario realista para esta variante 8-bit; la variante 4-bit (25,8 GB de pico) se acerca más a equipos de 32 GB.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.generate`, `mlx_lm.chat`, `mlx_lm.server`), siempre con `--trust-remote-code` o `trust_remote_code=True`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato MLX.
- Latencia y throughput: 12,4 tok/s en generación con 8-bit sobre M4 Max; 18,8 tok/s con 4-bit. No se reportan métricas de time-to-first-token.
- Reducción de memoria: `--max-kv-size` y cuantización del caché KV (`--kv-bits 8`, donde esté disponible).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jais-3-32B-MLX-8bit (este) | 34,78 B densos | 512K | 8-bit MLX (8,5 bits/peso) | Apache-2.0 | Hugging Face, requiere `trust_remote_code` |
| Jais-3-32B-MLX-4bit | 34,78 B densos | 512K | 4-bit MLX (5,9 bits/peso) | Apache-2.0 | Hugging Face |
| Jais-3-32B-MLX-bf16 | 34,78 B densos | 512K | bf16 | Apache-2.0 | Hugging Face |
| Jais-3-32B (base, PyTorch) | 34,78 B densos | 512K | bf16/fp16 | Apache-2.0 | Hugging Face |

No se dispone en la información proporcionada de comparaciones con modelos de otros desarrolladores (por ejemplo, otros modelos densos de 32B con contexto largo). Los datos de rendimiento comparativo entre las variantes MLX se recogen en la tabla de benchmarks.

## Limitaciones y advertencias

- Idiomas limitados a árabe e inglés según los metadatos; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de factualidad en la información disponible.
- Sesgos: no se documentan análisis de sesgo en la model card de esta variante; deben evaluarse en el modelo base.
- El modo de razonamiento consume tokens: hay que reservar espacio en `max_tokens` para el bloque `<ifm|think>`, lo que incrementa coste y latencia.
- `mlx-lm` no reconoce las etiquetas `<ifm|think>`: `mlx_lm.server` devuelve el texto de razonamiento dentro de `content` en lugar de un campo `reasoning` separado.
- El formato de tool-calls no se parsea en mlx-lm; su integración requiere trabajo adicional.
- La plantilla de chat original falla cuando un mensaje previo del asistente no incluye campo de thinking (comportamiento habitual en clientes estilo OpenAI); la plantilla de este repositorio lo corrige renderizando thinking vacío, pero es un cambio respecto al original.
- Requiere `trust-remote-code`: se ejecuta código Python del repositorio, por lo que conviene revisarlo antes de usarlo en producción.
- Solo para Apple Silicon: no es desplegable en GPU NVIDIA con los runtimes habituales (vLLM, TGI) sin conversión adicional.
- La licencia Apache-2.0 permite uso comercial, pero se remite a la model card del modelo base para condiciones y uso previsto.
- La perplejidad es una señal gruesa; el autor recomienda probar las variantes sobre la carga de trabajo real antes de elegir.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/IFM/Jais-3-32B-MLX-8bit
- Modelo base: https://huggingface.co/IFM/Jais-3-32B
- Variante bf16: https://huggingface.co/IFM/Jais-3-32B-MLX-bf16
- Variante 4-bit: https://huggingface.co/IFM/Jais-3-32B-MLX-4bit
- Paper: https://arxiv.org/abs/2611.10224 (Jais 3: Introducing Arabic-centric Agentic AI)
- Código del modelo MLX incluido en el repo: `k2_horizon.py` (https://huggingface.co/IFM/Jais-3-32B-MLX-8bit/blob/main/k2_horizon.py)
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
