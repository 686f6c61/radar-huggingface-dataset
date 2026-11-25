# rao-studios/NVIDIA-Nemotron-3-Super-120B-A12B-mlx-4bit

## Resumen

NVIDIA-Nemotron-3-Super-120B-A12B en versión MLX 4-bit es una cuantización del modelo Nemotron 3 Super publicado por NVIDIA en BF16, adaptada para ejecutarse sobre Apple Silicon mediante la librería MLX. La conversión la firma Rao Studios para su aplicación de programación Craft, y toma como punto de partida la cuantización de mlx-community. Se trata de un modelo híbrido de 120.668.692.480 parámetros totales (unos 120,6B) con 12,7B parámetros activos por token, lo que lo sitúa en la categoría de modelos MoE de gran escala pero con un coste de inferencia contenido.

La arquitectura combina 88 capas: 40 de Mamba-2, 40 de expertos LatentMoE (512 expertos enrutados, 22 activos) y 8 de atención. Esta mezcla de state space models y atención con mezcla de expertos reduce el coste de caché de contexto, ya que solo las 8 capas de atención almacenan claves y valores. El resultado es un modelo pensado para razonamiento y generación de código que cabe en un Mac con memoria unificada de 96 GB o más, con 68 GB de pesos.

Su relevancia actual radica en que permite ejecutar localmente un modelo de escala 120B con capacidades de razonamiento explícito (modo thinking delimitado por etiquetas `<think>`) y contexto declarado de 262.144 tokens en `config.json`, ampliable según NVIDIA hasta 1M. La licencia es la NVIDIA Nemotron Open Model License, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 88 capas (40 Mamba-2, 40 LatentMoE, 8 atención); transformer híbrido con SSM |
| Parametros totales | 120.668.692.480 (≈120,6B) |
| Parametros activos | 12,7B por token |
| Longitud de contexto | 262.144 tokens según `config.json`; NVIDIA reporta hasta 1M |
| Tipos de cuantizacion | 4-bit afín (affine), group size 64, formato MLX |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License (v. 15 de diciembre de 2025) |
| Formato de pesos | safetensors (14 shards, MLX) |
| Tamano del repo | 68,0 GB |
| Libreria | mlx-lm (requiere soporte `nemotron_h` con `moe_latent_size`) |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16 |
| Descargas / likes | 278 / 0 |

## Arquitectura y entrenamiento

El modelo es un híbrido de 88 capas que intercala 40 capas Mamba-2 (state space model), 40 capas de mezcla de expertos LatentMoE con 512 expertos enrutados y 22 activos por token, y 8 capas de atención. Esta distribución implica que solo las 8 capas de atención mantienen caché de claves y valores, lo que reduce drásticamente el coste de memoria por token de contexto: aproximadamente 8 KB por token, más un estado Mamba fijo de unos 170 MB por flujo. Los 120,6B parámetros totales se activan parcialmente (12,7B por token), lo que permite throughput razonable pese al tamaño.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La model card de esta cuantización indica que la conversión a MLX no incluye la cabeza de predicción multi-token (MTP), y que los archivos de modelado Python, configuración y parser de razonamiento no se distribuyen en el repositorio (solo pesos, tokenizer, chat template y generation config, verificados byte a byte contra el commit de mlx-community). El único cambio respecto a ese commit es la eliminación de `auto_map` en `config.json`.

## Capacidades

- Generación de texto conversacional y de razonamiento, con modo thinking interno delimitado por `<think>…</think>`; se puede desactivar pasando `enable_thinking: false` a la plantilla de chat.
- Generación de código, con etiquetas explícitas `code` y `craft` en el repositorio, orientado a tareas de programación y construcción de aplicaciones.
- Razonamiento multi-paso y planificación: la model card describe su uso en Craft para planificar y orquestar hasta quince agentes en secuencia (proyecto, diseño, cliente tipado, mocks, pantallas, navegación, tests y capturas).
- Soporte de tool calling y orquestación de agentes: la descripción de Craft implica llamadas encadenadas a agentes y ejecución de build, tests y capturas.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Contexto largo: 262.144 tokens en configuración, con soporte reportado por NVIDIA hasta 1M.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Asistente de programación local en macOS: integrado en Craft mediante el stack MLX de Rao (Frigate), el modelo permanece en la máquina junto con el índice del proyecto, lo que permite autocompletado, refactorización y generación de código sin enviar código a servicios externos.
- Generación de aplicaciones completas desde cero: la model card describe el escenario de construir una app de iPhone desde una carpeta vacía en un solo turno, planificando y llamando agentes para proyecto, diseño, cliente tipado, mocks, pantallas, navegación, tests y capturas, y ejecutando build y tests al final.
- Razonamiento con trazas auditables: el modo `<think>` permite separar el razonamiento interno de la respuesta final, útil en pipelines donde se quiere registrar o filtrar la cadena de pensamiento antes de mostrar la salida.
- Análisis de repositorios y contextos largos: con 262.144 tokens de contexto y un coste de caché reducido (solo 8 capas de atención), es adecuado para tareas que requieren ingerir múltiples archivos o documentación extensa en una sola sesión.
- Orquestación de agentes multi-paso: su capacidad de planificación y llamada secuencial a herramientas encaja en flujos de automatización donde un agente principal delega en subagentes especializados.
- Despliegue en estaciones de trabajo Apple Silicon: al caber en 68 GB de pesos y requerir 96 GB o más de memoria unificada, permite inferencia de un modelo de 120B en un Mac Studio o MacBook Pro de gama alta sin GPU dedicada.
- Experimentación e investigación en arquitecturas híbridas SSM/MoE: sirve como banco de pruebas para estudiar el comportamiento de Mamba-2 combinado con LatentMoE en tareas de código y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una comparación cualitativa en Craft (una app construida, tests pasados y 62 pantallas coincidentes en modo claro y oscuro, con calidad comparable a Claude Opus en la misma app), pero aclara que esas ejecuciones se hicieron con Qwopus 3.5 122B en un M4 Max con 128 GB, no con este modelo. No se deben extrapolar esos resultados a Nemotron 3 Super.

## Requisitos de hardware

- VRAM/memoria: 68 GB de pesos; se recomienda un Mac con 96 GB o más de memoria unificada.
- Coste de contexto: aproximadamente 8 KB por token (solo las 8 capas de atención cachean claves y valores) más un estado Mamba fijo de unos 170 MB por flujo.
- GPU recomendadas: Apple Silicon con memoria unificada de 96 GB o superior (la model card cita un Mac con 128 GB). No se documenta soporte para A100, H100 ni RTX 4090 en esta cuantización MLX.
- ¿Cabe en GPU consumer?: no en GPUs consumer discretas convencionales; sí en configuraciones Apple Silicon de gama alta con memoria unificada suficiente.
- Opciones de despliegue: `mlx-lm` con soporte `nemotron_h` y `moe_latent_size` (`mlx_lm.generate --model rao-studios/NVIDIA-Nemotron-3-Super-120B-A12B-mlx-4bit --prompt "…"`); Craft a través de Frigate desde la release que añade soporte LatentMoE. No se documenta vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / plataforma |
|---|---|---|---|---|
| rao-studios/NVIDIA-Nemotron-3-Super-120B-A12B-mlx-4bit | 120,6B / 12,7B | 262.144 (hasta 1M según NVIDIA) | NVIDIA Nemotron Open Model License | MLX 4-bit, Apple Silicon |
| nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16 | 120,6B / 12,7B | 262.144 (hasta 1M según NVIDIA) | NVIDIA Nemotron Open Model License | BF16, safetensors |
| mlx-community/NVIDIA-Nemotron-3-Super-120B-A12B-4bit | 120,6B / 12,7B | 262.144 | NVIDIA Nemotron Open Model License | MLX 4-bit |
| Qwopus 3.5 122B | 122B (activos no disponible) | no disponible | no disponible | MLX (citado en la model card) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparación con Qwopus 3.5 122B se limita a la mención cualitativa de la model card sobre la construcción de una app en Craft, sin métricas publicadas para Nemotron 3 Super.

## Limitaciones y advertencias

- La cuantización a 4-bit puede degradar la calidad respecto al BF16 original; no se documenta una evaluación de la pérdida de rendimiento.
- La conversión MLX no incluye la cabeza de predicción multi-token (MTP), por lo que no se beneficia de esa técnica de decodificación especulativa.
- No se distribuyen los archivos Python de modelado, configuración ni el parser de razonamiento; el repositorio contiene únicamente pesos, tokenizer, chat template y generation config, y no incluye código.
- El contexto efectivo depende del soporte de la librería: `config.json` declara 262.144 tokens, mientras que NVIDIA reporta hasta 1M; no se garantiza el comportamiento a 1M en esta conversión.
- No se especifican idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, requiere verificación en producción.
- Sesgos conocidos: no documentados.
- Licencia: NVIDIA Nemotron Open Model License (diciembre de 2025); es necesario revisar el texto completo en `LICENSE` y la atribución en `NOTICE` antes de uso comercial. El repositorio no está afiliado ni respaldado por NVIDIA.
- Requiere hardware Apple Silicon con 96 GB o más de memoria unificada; no es desplegable en GPUs consumer discretas ni en la mayoría de infraestructuras cloud estándar sin conversión previa.
- El modo thinking añade latencia y tokens de salida; debe desactivarse (`enable_thinking: false`) cuando no se requiera razonamiento explícito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rao-studios/NVIDIA-Nemotron-3-Super-120B-A12B-mlx-4bit
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Cuantización de referencia mlx-community: https://huggingface.co/mlx-community/NVIDIA-Nemotron-3-Super-120B-A12B-4bit
- Craft (aplicación de Rao Studios): https://craft.rao.nyc
- MLX: https://github.com/ml-explore/mlx
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
