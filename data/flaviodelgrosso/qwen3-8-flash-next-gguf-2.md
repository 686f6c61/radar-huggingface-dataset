# flaviodelgrosso/Qwen3.8-Flash-Next-GGUF

## Resumen

Qwen3.8-Flash-Next-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-Flash-Next, publicada por el usuario flaviodelgrosso. El modelo base lo desarrolla el equipo Qwen (Alibaba) y se distribuye bajo la Qwen Community License 1.0. El artefacto concreto de este repositorio es una build híbrida Q4-D6 pensada para ejecutarse íntegramente en memoria en un único Mac Apple Silicon con 128 GB de memoria unificada, mediante un runtime propietario llamado Razor que, en el momento de la publicación, no es de código abierto.

El modelo base es un transformer de gran escala con 179.551.050.368 parámetros totales (unos 179,5 mil millones), según los pesos safetensors del modelo original. La cuantización reduce el peso en disco a 175 GB para el archivo GGUF único, de los cuales aproximadamente 69 GiB se cargan en memoria y el resto permanece en disco como una gran tabla de consulta. La build incorpora la cabeza de borrador (draft head) integrada para decodificación especulativa, de modo que no requiere un modelo borrador separado.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas builds GGUF de un modelo de ~180B orientada a hardware de consumo profesional (Mac con memoria unificada); por otro, advierte de una dependencia crítica: los pesos no se pueden ejecutar con Razor hasta que el runtime se publique. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks del modelo base es muy limitada en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-Flash-Next; detalles internos no disponibles) |
| Parámetros totales | 179.551.050.368 (~179,5B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4-D6 (expertos a 4 bits, resto del modelo a ~6 bits); archivo GGUF único de 175 GB |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license: other) |
| Formato de pesos | GGUF (archivo `Qwen3.8-Flash-Next-Q4-D6.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de aproximadamente 179,5 mil millones de parámetros. La información proporcionada no detalla la composición interna (número de capas, dimensiones, si emplea mezcla de expertos, atención lineal u otras variantes), ni el volumen o composición del dataset de entrenamiento, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se documenta la longitud de contexto nativa del modelo base.

La innovación técnica destacable de esta build concreta es la cuantización mixta Q4-D6: los pesos de los expertos se cuantizan a 4 bits y el resto del modelo a unos 6 bits, lo que según el autor produce una generación aproximadamente un 30% más rápida que una build Q4 plana, con calidad equivalente dentro del ruido de medición. Además, el archivo incorpora la cabeza de borrador integrada para decodificación especulativa, eliminando la necesidad de un modelo borrador externo. El diseño de carga es híbrido: unos 69 GiB residen en memoria y el resto se mantiene en disco como tabla de consulta, lo que permite ejecutar un modelo de este tamaño en un Mac con 128 GB de memoria unificada.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con APIs OpenAI y Anthropic a través del runtime Razor, lo que permite conectar agentes de código y clientes de chat directamente.
- Decodificación especulativa integrada mediante draft head, sin modelo borrador separado.
- Ejecución multisesión: el autor reporta rendimiento agregado con 8 sesiones simultáneas.
- Capacidades de razonamiento, código, matemáticas, visión, tool calling, agentes o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia conversacional local en estación de trabajo: el modelo puede servir un chat multi-turno desde un Mac con 128 GB de memoria unificada, sin depender de la nube, gracias a la carga híbrida memoria/disco de la build Q4-D6.
- Agentes de código en local: al exponer APIs compatibles con OpenAI y Anthropic, Razor permite conectar asistentes de programación (por ejemplo, clientes tipo chat de código) directamente al modelo servido en la máquina del desarrollador.
- Prototipado y evaluación de modelos de ~180B en hardware de consumo profesional: útil para investigadores que quieran probar un modelo grande sin acceso a clústeres con A100/H100, aceptando las limitaciones de velocidad (~68-95 tokens/s en sesión única).
- Servicio multiusuario ligero: con 8 sesiones concurrentes el autor reporta ~159 tokens/s agregados, adecuado para un pequeño equipo interno que comparta un único Mac de 128 GB.
- Pruebas de decodificación especulativa: la draft head integrada permite experimentar con `--speculation opportunistic` y medir la ganancia (~95 frente a ~68 tokens/s en sesión única) sin gestionar un segundo modelo.
- Evaluación comparativa de cuantizaciones: la build Q4-D6 sirve como referencia para comparar velocidad y calidad frente a builds Q4 planas en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas de velocidad medidas en un Apple M5 Max con 128 GB:

| Configuración | Tokens/s |
|---|---:|
| Sesión única | ~68 |
| Sesión única con decodificación especulativa | ~95 |
| 8 sesiones simultáneas | ~159 |

## Requisitos de hardware

- Memoria: Apple Silicon Mac con 128 GB de memoria unificada (desarrollado y probado en M5 Max).
- Almacenamiento: ~175 GB de espacio libre en disco.
- Sistema operativo: macOS 15 o posterior.
- Carga en memoria: ~69 GiB en RAM; el resto del archivo permanece en disco como tabla de consulta.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por esta build; el runtime Razor está diseñado para Apple Silicon.
- Despliegue: exclusivamente mediante Razor (`razor serve --model ... --speculation opportunistic`), que expone APIs compatibles con OpenAI y Anthropic. vLLM, llama.cpp, Ollama o TGI no están indicados como compatibles en la información disponible.
- Throughput: ~68 tokens/s en sesión única, ~95 con especulación, ~159 con 8 sesiones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones comparables de otros modelos de la misma categoría (tamaño ~180B o builds GGUF para Apple Silicon), por lo que no es posible establecer una comparación rigurosa sin inventar datos.

## Limitaciones y advertencias

- Dependencia crítica del runtime: Razor no es de código abierto y no se ha publicado; los pesos se pueden descargar, pero no ejecutar hasta que el runtime esté disponible.
- Plataforma restringida: solo Apple Silicon con 128 GB de memoria unificada y macOS 15+; no hay soporte para GPU NVIDIA ni para otros backends de inferencia.
- Requisito de disco elevado: ~175 GB libres, además de la descarga del archivo GGUF.
- Licencia: Qwen Community License 1.0; el uso comercial está sujeto a sus condiciones, que no se detallan en la información disponible.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Sesgos y alucinaciones: no se documentan en la información proporcionada; aplican los riesgos habituales de los modelos generativos de gran escala.
- Contexto: la longitud de contexto del modelo base no está disponible, lo que impide planificar casos de uso con ventanas largas.
- Calidad de la cuantización: el autor afirma que la calidad Q4-D6 es equivalente a Q4 dentro del ruido de medición, pero no se aportan evaluaciones cuantitativas que lo respalden.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/flaviodelgrosso/Qwen3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia (referenciada en el repo): LICENSE (Qwen Community License 1.0)
