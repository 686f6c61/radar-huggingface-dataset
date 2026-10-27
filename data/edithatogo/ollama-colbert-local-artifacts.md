# edithatogo/ollama-colbert-local-artifacts

## Resumen

`edithatogo/ollama-colbert-local-artifacts` no es un modelo de pesos, sino un repositorio de documentación e inventario de artefactos para el trabajo de soporte local de Ollama sobre checkpoints de embeddings estilo ColBERT y para la puesta a punto de BitNet en local. El autor (edithatogo) lo publica como punto de entrega ("handoff") experimental: el código, las ramas y las pull requests viven en GitHub, mientras que Hugging Face se usa para notas orientadas a modelos, manifiestos de artefactos y contexto futuro de model card. En el momento de la revisión indicada (27 de octubre de 2026, revisión `d8beb847fc429481bd138d04d3f9ceef07e71f46`) no se redistribuye ningún peso de terceros, ningún GGUF derivado ni binario alguno.

El repositorio referencia dos modelos fuente cuyos metadatos se comprobaron el 24 de mayo de 2026: `LiquidAI/LFM2-ColBERT-350M` (licencia `other`, público y sin gating, sha `0c31032e995fe698f3ddd74f0ddb566cfd3d4d5a`) y `microsoft/bitnet-b1.58-2B-4T` (licencia MIT, público y sin gating, sha `04c3b9ad9361b824064a1f25ea60a8be9599b127`). Ambos se incluyen únicamente como referencia; no se suben pesos ni GGUF derivados. La relevancia actual es acotada: sirve como índice verificable de procedencia y como registro de validación para quien quiera reproducir el trabajo de conversión y carga de ColBERT en Ollama, no como artefacto listo para producción.

La política de artefactos es explícita: los pesos de Microsoft BitNet, los pesos de LiquidAI y los GGUF generados a partir de pesos de terceros solo deben subirse tras revisar y documentar licencia de origen, permisos de redistribución y procedencia en `artifact-manifest.md`. El repositorio tiene 0 descargas y 0 likes, y su `pipeline_tag` declarado es `feature-extraction`, pese a no contener tensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: repositorio de documentación e inventario de artefactos. Referencia a checkpoints ColBERT (LFM2-ColBERT-350M) y a un transformer BitNet (bitnet-b1.58-2B-4T) |
| Parametros totales | No disponible (no se alojan pesos). Modelos referenciados: 350M en LFM2-ColBERT-350M y 2B en bitnet-b1.58-2B-4T, segun sus denominaciones |
| Parametros activos | No disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen cuantizaciones; se planifican GGUF derivados, bloqueados hasta revision de licencia y procedencia. BitNet b1.58 implica pesos ternarios {-1, 0, +1} en el modelo fuente |
| Idiomas soportados | `en` (segun metadatos del repositorio) |
| Licencia | `other` (repositorio); modelos fuente: `other` para LFM2-ColBERT-350M y MIT para bitnet-b1.58-2B-4T |
| Formato de pesos | Ninguno alojado. Referencias a GGUF como artefacto planificado, no publicado |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado ni documenta un proceso de entrenamiento propio. Su contenido es material de validación e integración: notas sobre el soporte de Ollama para checkpoints de embeddings estilo ColBERT (citando LFM2/ColBERT), comandos de test de Go ejecutados sobre las ramas de trabajo (`go test -count=1 ./cmd ./convert ./parser` y una pasada recursiva sobre todos los paquetes excepto `app`, `integration` y `.git`), y notas de configuración local de BitNet mediante el runner oficial.

En el lado de BitNet, el repositorio describe una rama de "wrapper" en un fork personal que actúa como capa de conveniencia local (rutas locales, virtualenv dentro del repositorio y convenciones de shell Unix), motivo por el cual no se propone upstream tal cual. El cambio apto para upstream —ignorar cabeceras generadas— se separó en una pull request propia contra Microsoft BitNet (PR 563). También se documenta el uso local de Apple MLX mediante un virtualenv dedicado, con versiones verificadas `mlx==0.31.2` y `mlx-lm==0.31.3` y selección de `Device(gpu, 0)`. La pull request upstream de Ollama (PR 16195) se describe, tras el rebase de junio, como un cambio acotado de conversión y documentación; los experimentos anteriores de parcheo de metadatos GGUF y de runtime local quedan documentados en el handoff de Conductor pero no forman parte del diff actual.

## Capacidades

- Indexación y trazabilidad de artefactos: manifiesto conservador que separa documentación publicable de subidas de pesos bloqueadas.
- Registro de validación reproducible: comandos de test, evidencia post-rebase y referencias a revisiones concretas.
- Documentación de integración con Ollama para checkpoints de embeddings estilo ColBERT (carga y comportamiento de embeddings).
- Documentación de despliegue local de BitNet mediante el runner oficial de Microsoft, con invocación de ejemplo (`bin/bitnet "Say ok" -n 1 -c 128 -temp 0`).
- Notas de entorno para Apple MLX (`mlx-lm`) con versiones fijadas y selección de dispositivo GPU.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni modo thinking: no hay pesos ni runtime propio.
- No es un modelo multilingüe: el único idioma declarado en metadatos es `en`.

## Casos de uso

- Auditoría de procedencia antes de publicar un GGUF: usar el manifiesto y las fichas de metadatos de origen (sha y licencia de cada modelo fuente) como checklist previo a cualquier redistribución de pesos derivados.
- Reproducción del soporte ColBERT en Ollama: seguir las ramas y PRs enlazados y ejecutar los comandos de test documentados para verificar la conversión y el parseo en una copia local del repositorio de Ollama.
- Evaluación de licencias en un pipeline interno: consultar la política de artefactos para decidir qué se puede subir a un hub interno y qué queda bloqueado hasta revisión legal.
- Puesta en marcha de BitNet en una máquina local: usar las notas del wrapper y la invocación de ejemplo para validar que el runner oficial carga el GGUF y responde, sin depender de artefactos de este repositorio.
- Configuración de MLX en Apple Silicon: replicar el virtualenv dedicado con las versiones `mlx==0.31.2` y `mlx-lm==0.31.3` y comprobar la selección de GPU antes de ejecutar pruebas de inferencia.
- Referencia para mantenimiento de model cards: tomar la sección de acceso, versionado y uso (revisión fijada, hashes, uso de `hf_hub_download` con `revision` y `repo_type="model"`) como plantilla de documentación para repositorios de solo metadatos.
- Formación interna sobre límites de publicación: el caso ilustra cómo separar documentación segura de artefactos con derechos de terceros, con un ejemplo real de decisión de no publicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio declara explícitamente que la revisión de octubre de 2026 no ejecutó pesos, no reprodujo entrenamiento ni revalidó puntuaciones de benchmark reportadas.

## Requisitos de hardware

- VRAM para inferencia: no aplica a este repositorio, que no contiene pesos ni ejecuta inferencia.
- Para el modelo fuente BitNet b1.58 2B referenciado: no disponible en la información proporcionada; el interés del formato ternario es la reducción de requisitos frente a un transformer de 2B en precisión completa, pero no se aportan cifras.
- Para LFM2-ColBERT-350M: no disponible; por tamaño (350M) sería apto para GPU de consumo, pero no hay datos de VRAM ni de latencia en la información disponible.
- GPU recomendadas: no disponible.
- Despliegue: el repositorio documenta Ollama (rama de trabajo), el runner oficial de BitNet y Apple MLX (`mlx-lm`) en local. No documenta vLLM, TGI ni llama.cpp para estos artefactos.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio es de documentación; el inventario se comprobó en la revisión `d8beb847fc429481bd138d04d3f9ceef07e71f46`, sin cifras de tamaño publicadas.

## Comparativa con modelos similares

| Elemento | Este repositorio | LiquidAI/LFM2-ColBERT-350M | microsoft/bitnet-b1.58-2B-4T |
|---|---|---|---|
| Naturaleza | Documentación e inventario | Modelo de embeddings (ColBERT) | Modelo de lenguaje BitNet |
| Parámetros | No aplica | 350M (según denominación) | 2B (según denominación) |
| Contexto | No disponible | No disponible | No disponible |
| Pesos alojados | No | Sí (referenciado, no redistribuido aquí) | Sí (referenciado, no redistribuido aquí) |
| Licencia | `other` | `other` | MIT |
| Descargas / likes | 0 / 0 | No disponible en la información proporcionada | No disponible en la información proporcionada |
| Uso previsto aquí | Índice y validación | Referencia de embeddings | Referencia de ejecución local |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa entre alternativas.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos, GGUF ni binarios; cualquier uso como modelo fallará.
- Estado experimental y de handoff: el propio autor lo califica como repositorio de traspaso para validación local y planificación de artefactos.
- La licencia `other` del repositorio no concede derechos sobre los modelos fuente; la disponibilidad pública no establece permiso de reutilización ni exhaustividad.
- La licencia del modelo LiquidAI es `other`: hay que inspeccionar los términos de origen registrados y no asumir una concesión nueva.
- Las licencias de código no prevalecen sobre derechos de documentos fuente, modelos base o terceros.
- Riesgo de confusión: el `pipeline_tag` declarado es `feature-extraction`, lo que puede llevar a herramientas a tratarlo como modelo de embeddings pese a no contener tensores.
- Los recuentos y estados de las recepciones de origen aplican a esas ediciones y ejecuciones concretas, no a todas las fuentes upstream; snapshots, candidatos, fixtures y productos de solo metadatos no deben presentarse como datasets completos ni como productos validados clínicamente u operativamente.
- La revisión de octubre de 2026 no ejecutó pesos, no reprodujo entrenamiento ni revalidó benchmarks; las limitaciones del modelo base, de prompt, experimentales y de smoke sintético siguen siendo las autoritativas.
- Idioma: solo `en` declarado; sin soporte multilingüe documentado.
- Para uso reproducible hay que fijar la revisión y verificar sumas de comprobación antes de cualquier transformación; no se garantiza estabilidad de contenido entre revisiones.
- El mantenimiento de metadatos no autoriza despliegue de modelos, publicación de datos nuevos, decisiones médicas ni cambios en derechos de fuentes.
- No hay datos de sesgos, alucinación o límites de contexto porque no hay modelo propio; cualquier evaluación de ese tipo debe hacerse sobre los modelos fuente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/edithatogo/ollama-colbert-local-artifacts
- Discusiones del repositorio: https://huggingface.co/edithatogo/ollama-colbert-local-artifacts/discussions
- Pull request upstream de Ollama ColBERT: https://github.com/ollama/ollama/pull/16195
- Rama de handoff de Ollama: https://github.com/edithatogo/ollama/tree/conductor/colbert-handoff
- Rama del wrapper local de BitNet: https://github.com/edithatogo/BitNet/tree/local-bitnet-runner-wrapper
- Pull request de BitNet sobre cabeceras generadas: https://github.com/microsoft/BitNet/pull/563
- Estado de publicación: https://huggingface.co/edithatogo/ollama-colbert-local-artifacts/blob/main/status.md
- Evidencia de validación: https://huggingface.co/edithatogo/ollama-colbert-local-artifacts/blob/main/validation.md
- Modelo fuente de embeddings: https://huggingface.co/LiquidAI/LFM2-ColBERT-350M
- Modelo fuente BitNet: https://huggingface.co/microsoft/bitnet-b1.58-2B-4T
- Guía de LLM local con Cursor: https://cursor.fan/tutorial/HowTo/cursor-local-llm-setup/
- Guía de agentes locales con Ollama: https://baeseokjae.github.io/posts/local-ai-agents-guide-2026/
- Artículo sobre implicaciones forenses de la IA localizada: https://arxiv.org/abs/2603.23996
