# IFM/Jais-3-7B-MLX-8bit

## Resumen

Jais-3-7B-MLX-8bit es la cuantización de 8 bits en formato MLX del modelo Jais-3-7B, un modelo denso decoder-only de aproximadamente 9.000 millones de parámetros desarrollado por el equipo IFM (Inception42) como parte de la familia Jais 3, orientada a IA agéntica centrada en árabe. Este repositorio concreto no es un modelo nuevo, sino una conversión optimizada para Apple Silicon que permite ejecutar el modelo en Macs con memoria unificada mediante la librería mlx-lm.

El modelo base destaca por su ventana de contexto de 512K tokens (524.288), un tamaño poco habitual en modelos de su escala, y por un modo de razonamiento interno delimitado por las etiquetas `<ifm|think>`, con niveles de esfuerzo configurables (`high`, `medium`, `low`). Está pensado para cargas de trabajo conversacionales y de razonamiento en árabe e inglés, con soporte declarado para tool calling, aunque el parseo de llamadas a herramientas no está implementado todavía en el servidor de mlx-lm.

La relevancia de esta variante radica en que reduce el peso en disco de 18,0 GB (bf16) a 9,6 GB con una degradación de perplejidad mínima (+0,2% en WikiText-2, +0,1% en Wikipedia árabe) y casi duplica la velocidad de generación en un M4 Max (52,7 tok/s frente a 28,5 tok/s). Es, por tanto, la opción práctica para desarrollo local en Apple Silicon cuando no se dispone de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, arquitectura `k2_horizon` |
| Parametros totales | 8.999.178.240 (aproximadamente 9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | 8-bit entero afín, group size 64, en todas las capas lineales y embeddings (8,5 bits/peso efectivos) |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | MLX safetensors (librería `mlx`), 9,6 GB en disco |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de la familia Jais-3, identificado internamente con la arquitectura `k2_horizon`. Esta variante MLX incluye el código del modelo en el propio repositorio (`k2_horizon.py`), ya que mlx-lm todavía no soporta de forma nativa dicha arquitectura; mlx-lm lo carga a través de la entrada `model_file` del `config.json`, por lo que requiere `--trust-remote-code`. La conversión se realizó desde la revisión `edc2801` del modelo PyTorch original.

La cuantización aplica aritmética entera afín de 8 bits con group size 64 sobre todas las capas lineales y los embeddings. El autor verificó la conversión contra el código PyTorch (`modeling_k2_horizon.py`) en fp32 sobre los pesos reales del modelo, con prompts en inglés, código, árabe y matemáticas: los logits coinciden con un error relativo de 6e-6 o mejor, las predicciones de siguiente token coinciden en todas las posiciones y la decodificación greedy con caché KV produce los mismos tokens que PyTorch (64/64 en cada prompt). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en árabe e inglés, con especial énfasis en árabe.
- Razonamiento explícito mediante modo de pensamiento interno delimitado por `<ifm|think> … </ifm|think>`, con niveles de esfuerzo `high` (por defecto), `medium` y `low` configurables desde la plantilla de chat mediante `reasoning_effort`.
- Ventana de contexto de 512K tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Soporte declarado de tool calling en el modelo base (la model card menciona el formato de llamadas a herramientas), aunque mlx-lm todavía no parsea ese formato.
- Capacidades agénticas y de razonamiento multi-paso, según la orientación de la familia Jais 3 hacia IA agéntica.
- Capacidad de código y matemáticas verificada indirectamente en las pruebas de conversión (prompts de código y matemáticas con coincidencia exacta de logits frente a PyTorch).
- No se declaran capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Asistentes conversacionales en árabe sobre Mac: el modelo puede gestionar diálogos multi-turno con contexto largo (hasta 512K tokens) ejecutándose localmente en Apple Silicon con 9,8 GB de memoria pico, lo que permite desplegar un asistente privado sin enviar datos a la nube.
- Procesamiento de documentos largos en árabe: informes, expedientes o contratos que superan ampliamente el contexto típico de 8K-32K tokens pueden analizarse en una sola pasada gracias a la ventana de 524.288 tokens, con la ventaja de que la cuantización apenas degrada la perplejidad en árabe (+0,1%).
- Prototipado y evaluación local de agentes: con `mlx_lm.server` se puede levantar un endpoint compatible con clientes OpenAI-style para probar flujos agénticos y de razonamiento multi-paso antes de migrar a infraestructura GPU; conviene tener en cuenta que el texto de pensamiento se devuelve dentro de `content` y que el formato de tool calls no se parsea.
- Generación de código asistida en entornos de desarrollo para Mac: el modelo maneja prompts de código (verificado en la conversión) y puede integrarse en editores o scripts locales mediante la API de Python de mlx-lm.
- Investigación en PLN árabe: evaluación de razonamiento, matemáticas y generación en árabe con un modelo de 9B ejecutable en un portátil, útil para experimentos reproducibles sin clúster.
- Educación y tutoría bilingüe árabe-inglés: el modo de razonamiento con `reasoning_effort` permite ajustar la profundidad de las explicaciones (bajo para respuestas directas, alto para derivaciones paso a paso) y controlar el coste en tokens.
- Despliegue en estaciones de trabajo Apple para equipos pequeños: con 52,7 tok/s en un M4 Max, es viable para uso interactivo de varios usuarios ligeros mediante `mlx_lm.server`, aunque no para cargas de alta concurrencia.

## Benchmarks y rendimiento

Datos publicados por el autor para las tres variantes MLX de Jais-3-7B (perplejidad sobre 128 × 512 tokens en WikiText-2 test y en los primeros artículos del dump de Wikipedia árabe `20231101.ar`; velocidad medida en un Apple M4 Max):

| Metrica | bf16 | 8-bit | 4-bit |
|---|---|---|---|
| Bits/peso | 16,0 | 8,5 | 6,4 |
| Disco | 18,0 GB | 9,6 GB | 7,2 GB |
| Memoria pico | 18,2 GB | 9,8 GB | 7,4 GB |
| Perplejidad WikiText-2 (inglés) | 12,829 | 12,858 (+0,2%) | 13,372 (+4,2%) |
| Perplejidad Wikipedia árabe | 17,332 | 17,350 (+0,1%) | 18,129 (+4,6%) |
| Velocidad de generación | 28,5 tok/s | 52,7 tok/s | 70,4 tok/s |

No se han publicado en la información disponible resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- Memoria pico de 9,8 GB para un prompt corto en la variante de 8 bits; el caché KV crece con el contexto, por lo que contextos largos requieren más memoria.
- Diseñado específicamente para Apple Silicon (memoria unificada); la librería mlx no está pensada para GPUs NVIDIA.
- Cabe en Macs con al menos 16 GB de memoria unificada para prompts cortos; para aprovechar contextos largos conviene 32 GB o más.
- Opciones de reducción de memoria: `--max-kv-size` y cuantización del caché KV con `--kv-bits 8` (donde esté disponible).
- Despliegue mediante mlx-lm: `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server`, siempre con `--trust-remote-code` (o `trust_remote_code=True`).
- Velocidad de generación medida: 52,7 tok/s en un Apple M4 Max con la variante de 8 bits.
- No se proporcionan datos de latencia ni throughput para GPUs A100, H100 o RTX 4090, ya que el formato MLX no aplica a esas plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Jais-3-7B-MLX-8bit (este) | ~9B | 512K | MLX, Apple Silicon | Apache-2.0 | 9,6 GB, 52,7 tok/s en M4 Max |
| Jais-3-7B-MLX-bf16 | ~9B | 512K | MLX, Apple Silicon | Apache-2.0 | 18,0 GB, 28,5 tok/s, referencia de calidad |
| Jais-3-7B-MLX-4bit | ~9B | 512K | MLX, Apple Silicon | Apache-2.0 | 7,2 GB, 70,4 tok/s, +4,2% perplejidad en inglés |
| Jais-3-7B (base) | ~9B | 512K | PyTorch/safetensors | Apache-2.0 | Modelo original, requiere GPU o Apple Silicon vía conversión |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes (por ejemplo, de la misma escala y orientación al árabe); ese dato figura como no disponible.

## Limitaciones y advertencias

- Requiere `--trust-remote-code`: el repositorio incluye código Python (`k2_horizon.py`) que se ejecuta localmente al cargar el modelo. Conviene revisarlo antes de usarlo en producción.
- mlx-lm todavía no soporta de forma nativa la arquitectura `k2_horizon`; la compatibilidad depende del mecanismo `model_file` y podría romperse con actualizaciones de mlx-lm.
- `mlx_lm.server` no reconoce las etiquetas `<ifm|think>`: el texto de razonamiento se devuelve dentro de `content` en lugar de en un campo `reasoning` separado, lo que complica su integración con clientes que esperan ese campo.
- El formato de tool calls no se parsea en mlx-lm, pese a que el modelo base declara soporte de tool calling.
- La plantilla de chat original falla cuando un mensaje previo del asistente no incluye campo de pensamiento (lo habitual en clientes estilo OpenAI); la plantilla de este repositorio lo corrige renderizando pensamiento vacío, pero es una modificación respecto al original.
- El modo de pensamiento consume tokens antes de la respuesta; hay que reservar espacio en `max_tokens` para evitar respuestas truncadas.
- El caché KV crece con el contexto: los 512K tokens de ventana no son utilizables en la práctica con 9,8 GB de memoria sin `--max-kv-size` o cuantización del caché.
- Idiomas limitados a árabe e inglés; no se declara soporte de español ni de otros idiomas.
- No se han publicado datos de sesgos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- Licencia Apache-2.0, que permite uso comercial, pero se hereda del modelo base y conviene consultar la model card original para condiciones adicionales de uso previsto.

## Enlaces

- Repositorio Hugging Face de esta variante: https://huggingface.co/IFM/Jais-3-7B-MLX-8bit
- Modelo base: https://huggingface.co/IFM/Jais-3-7B
- Variante bf16: https://huggingface.co/IFM/Jais-3-7B-MLX-bf16
- Variante 4-bit: https://huggingface.co/IFM/Jais-3-7B-MLX-4bit
- Paper (arXiv): https://arxiv.org/abs/2611.10224
- Licencia Apache-2.0: https://huggingface.co/IFM/Jais-3-7B
