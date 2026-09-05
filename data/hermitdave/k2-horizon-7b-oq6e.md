# hermitdave/K2-Horizon-7B-oQ6e

## Resumen

K2-Horizon-7B-oQ6e es la cuantización MLX de 6 bits (oQ6e) del modelo K2-Horizon-7B, desarrollado por el IFM Team y publicado bajo licencia Apache-2.0. La conversión ha sido realizada por hermitdave utilizando `mlx-lm` y `oMLX`, con el objetivo de ofrecer un modelo de razonamiento denso optimizado para Apple Silicon. El modelo base forma parte de la familia K2 Horizon, que incluye seis modelos abiertos de entre 0.9B y 375B parámetros, orientados a razonamiento, codificación, flujos de trabajo agénticos y despliegue en dispositivos edge.

K2-Horizon-7B es un modelo denso de razonamiento con una ventana de contexto de 512K tokens. Aunque su nombre comercial indica 7B, el checkpoint safetensors contiene 8.999.178.240 parámetros (~9B). La cuantización oQ6e reduce el tamaño del repositorio a 7.6 GB, manteniendo una calidad alta y permitiendo la ejecución local en Macs con la librería `mlx-lm`. Su relevancia actual radica en combinar un rendimiento de frontera en tareas de razonamiento y agentes con una licencia permisiva y la posibilidad de desplegarlo en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo denso de razonamiento (no MoE) |
| Parametros totales | 8.999.178.240 (~9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512.000 tokens |
| Tipos de cuantizacion | oQ4e, 4-bit, oQ6e, 6-bit, 8-bit (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

K2-Horizon-7B es un modelo denso de razonamiento de la familia K2 Horizon de IFM. No se ha especificado si utiliza una arquitectura transformer pura o algún componente híbrido, pero se describe como "dense reasoning model". El checkpoint safetensors contiene 8.999.178.240 parámetros, a pesar de la denominación comercial de 7B. Ofrece una ventana de contexto de 512K tokens, lo que lo hace adecuado para tareas de contexto muy largo.

No se han proporcionado detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni el uso de técnicas como RLHF o DPO. La conversión a MLX utiliza la cuantización oQ6e, que mantiene una calidad de ~6 bits con un peso de ~7 GB. La familia K2 Horizon incluye seis modelos de 0.9B a 375B parámetros, con afirmaciones de estado del arte en cada clase de tamaño según IFM.

## Capacidades

- Razonamiento avanzado: modelo de razonamiento que requiere `reasoning_effort="high"` para obtener los mejores resultados.
- Codificación e ingeniería de software: 70.6% en SWE-bench Verified.
- Agentes de terminal: 39.06% en Terminal-Bench 2.1.
- Navegación web autónoma: 59.0% en BrowseComp.
- Matemáticas: 73.3% en HMMT Feb 2026.
- Dominio bancario: 25.8% en tau3-Banking.
- Generación de texto conversacional (tag "conversational").
- Orientado a flujos de trabajo agénticos según la descripción de la familia IFM.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Razonamiento matemático avanzado: el modelo puede resolver problemas de nivel olímpico (HMMT Feb 2026: 73.3%), por lo que es adecuado para plataformas educativas o herramientas de cálculo simbólico.
- Ingeniería de software automatizada: con un 70.6% en SWE-bench Verified, puede utilizarse para resolver issues reales en repositorios, integrándose en pipelines de CI/CD como agente de revisión de código.
- Agentes de terminal: su puntuación de 39.06% en Terminal-Bench 2.1 indica capacidad para ejecutar comandos y tareas administrativas; puede desplegarse como agente autónomo en entornos de servidor.
- Navegación web autónoma: con 59.0% en BrowseComp, puede realizar investigaciones web, recopilación de datos y tareas de búsqueda complejas.
- Asistente bancario: el benchmark tau3-Banking (25.8%) muestra capacidades en dominios financieros; puede gestionar consultas de clientes, análisis de transacciones y atención al usuario.
- Despliegue local en Apple Silicon: gracias a la cuantización MLX, el modelo puede ejecutarse en Macs con `mlx-lm`, lo que permite prototipado rápido sin depender de servicios cloud.
- Análisis de documentos extensos: la ventana de contexto de 512K tokens permite procesar manuales, contratos o bases de código completas en una sola pasada.

## Benchmarks y rendimiento

| Benchmark | K2-Horizon-7B |
|---|---|
| SWE-bench Verified | 70.6% |
| Terminal-Bench 2.1 | 39.06% |
| tau3-Banking | 25.8% |
| BrowseComp | 59.0% |
| HMMT Feb 2026 | 73.3% |

Nota: estos resultados corresponden al modelo base IFM/K2-Horizon-7B según la model card. No se han publicado benchmarks específicos de la cuantización oQ6e.

## Requisitos de hardware

- VRAM estimada: para oQ6e, el repo ocupa 7.6 GB; para oQ4e y 4-bit, ~5 GB; para 6-bit, ~7 GB; para 8-bit, ~9 GB. En Apple Silicon, esto corresponde a RAM unificada.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con al menos 16 GB de RAM unificada para oQ6e. No es compatible con GPUs NVIDIA en formato MLX.
- Consumer GPU: no aplicable en formato MLX; para usar en GPU NVIDIA, sería necesario convertir a GGUF.
- Opciones de despliegue: `mlx-lm` (generación y servidor OpenAI-compatible, como se muestra en la model card con `base_url` en localhost:8000).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks de modelos comparables en la información disponible. Estructuralmente, K2-Horizon-7B compite con modelos densos de ~7-9B como Qwen2.5-7B-Instruct o Llama-3.1-8B-Instruct, pero no se dispone de resultados de rendimiento para realizar una comparativa fiable. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no se especifica; como modelo de razonamiento, puede generar razonamientos plausibles pero incorrectos.
- Limitaciones de idioma: los idiomas soportados no están documentados; se recomienda verificar el comportamiento en el idioma de uso.
- Contexto largo: aunque la ventana es de 512K tokens, no se ha evaluado la degradación del rendimiento en contextos extremos.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero el modelo base debe mantener la atribución.
- Caveat importante: los benchmarks publicados son del modelo base, no de la cuantización oQ6e; la cuantización puede degradar ligeramente el rendimiento.
- Despliegue: el formato MLX solo es compatible con Apple Silicon; para otras plataformas se requiere conversión a GGUF u otro formato.

## Enlaces

- Modelo cuantizado: https://huggingface.co/hermitdave/K2-Horizon-7B-oQ6e
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Blog de IFM: https://ifm.ai/blog/k2
- Noticia de Neomanex: https://neomanex.com/news/ifm-k2-horizon-open-agentic-fleet-sep-2026
