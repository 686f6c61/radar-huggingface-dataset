# Oriven-Labs/DAMS-27B

## Resumen

DAMS 27B es un ajuste fino de parámetros completos del modelo Qwen3.8-27B desarrollado por Oriven Labs, presentado como el primer miembro de su familia DAMS (Dynamic Associative Memory System) orientada a ingeniería de software y trabajo con agentes de horizonte largo. El modelo conserva la arquitectura híbrida del base (Gated DeltaNet / Gated Attention, 64 capas) y añade 16 capas de memoria asociativa DAMS de aproximadamente 1.850 millones de parámetros, una rama residual de memoria después de cada capa de atención completa. El resultado es un checkpoint de 29.635.526.896 parámetros (29,6B, aunque se comercializa con el nombre "27B") en bf16 safetensors, con 262.144 tokens de contexto nativo y licencia Apache 2.0.

El entrenamiento se realizó con RL de parámetros completos (GRPO) partiendo del modelo base sin modificar, con recompensas derivadas exclusivamente de la ejecución real de tests en repositorios de software, más términos anti-manipulación de tests y de honestidad. El checkpoint publicado es `it6`, la mejor iteración retenida del run según el autor. La propuesta diferencial es la memoria asociativa por petición integrada en la arquitectura, aunque el propio autor advierte que en esta versión las ramas de memoria están ligeramente entrenadas y su contribución es pequeña.

Es relevante ahora porque compite en la franja de modelos de ~27-30B especializados en código y agentes, con resultados publicados en LiveCodeBench v6 (88,15), SWE-bench Verified (85,2%), DeepSWE v1.1 (39,8%) e IFBench strict (72,0). No obstante, requiere código de modelado propio: `transformers` y vLLM estándar ignoran silenciosamente las capas `dams_mem`, por lo que sin el plugin incluido no se ejecuta el modelo evaluado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet / Gated Attention (64 capas) + 16 capas de memoria asociativa DAMS v2 |
| Parámetros totales | 29.635.526.896 (~29,6B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantización | No se han publicado cuantizaciones oficiales; checkpoint en bf16. El autor no valida variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles (no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16; pesos de memoria en `model-dams-mem.safetensors` separado; requiere el código de modelado incluido en el repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer híbrido de 64 capas que combina capas de atención completa con capas de atención lineal Gated DeltaNet. Sobre esa base, Oriven Labs inserta 16 capas de memoria asociativa DAMS v2, una tras cada capa de atención completa listada en `text_config.dams_mem_layers`. La operación es `x' = x + GDN_mem(RMSNorm_mem(x))`, donde `GDN_mem` es un mezclador Gated DeltaNet nativo de Qwen con la misma geometría de cabezas que las capas de atención lineal del base; los pesos se almacenan bajo `model.language_model.layers.{i}.dams_mem.*`. Las capas se añaden con `out_proj` inicializado a cero, de modo que en el paso 0 el modelo es exactamente el base. El encoder de visión proviene del checkpoint original y no fue entrenado ni evaluado.

El entrenamiento consistió en GRPO de parámetros completos (sin LoRA) con la memoria siempre activa, sobre un currículo de tareas reales de ingeniería de software en repositorios. Las recompensas proceden únicamente de tests que pasan, con términos adicionales anti-edición de tests y de honestidad, y la selección de checkpoint se hizo sobre un conjunto SWE retenido. El autor declara datos de entrenamiento descontaminados, con licencias comerciales y sin destilación de modelos cerrados. La memoria es por petición: no se persiste entre peticiones separadas, y las ramas están ligeramente entrenadas en esta release.

## Capacidades

- Generación de texto y razonamiento, con parser de razonamiento `qwen3` soportado en el despliegue vLLM recomendado.
- Generación y edición de código orientada a repositorios reales, incluyendo resolución de incidencias verificables mediante tests.
- Razonamiento científico y preguntas de opción múltiple de nivel experto (GPQA Diamond).
- Tool calling / function calling: el comando de referencia activa `--enable-auto-tool-choice` con `--tool-call-parser qwen3_coder`.
- Trabajo agéntico multi-paso: los benchmarks se ejecutaron con mini-SWE-agent (250 pasos) y con el harness de Claude Code (3 horas por tarea).
- Contexto largo nativo de 262.144 tokens, útil para recorrer repositorios completos o trazas extensas.
- Memoria asociativa por petición (no persistente entre peticiones) integrada en la arquitectura.
- Capacidad de visión: los pesos del encoder están presentes en el checkpoint, pero no fueron entrenados ni evaluados; el despliegue recomendado usa `--language-model-only`.
- Cobertura multilingüe: no declarada en la model card.

## Casos de uso

- Resolución automática de incidencias en repositorios: el modelo puede recibir un issue, explorar el árbol de ficheros, aplicar parches y validar con la suite de tests, replicando el escenario de SWE-bench Verified (85,2%) con harness agéntico de hasta 250 pasos.
- Agente de integración continua: integrado en pipelines de CI/CD mediante tool calling para leer logs de fallo, proponer parches y ejecutar tests, con el parser `qwen3_coder` gestionando las llamadas a herramientas.
- Asistencia en programación competitiva y algoritmia: con 88,15 en LiveCodeBench v6, es adecuado para generar soluciones en un solo intento y para tareas de optimización con restricciones algorítmicas.
- Análisis de repositorios completos: la ventana de 262.144 tokens permite cargar varios módulos, contratos de API y tests en una sola petición para tareas de migración, refactor o auditoría de dependencias.
- Razonamiento técnico y científico: responde preguntas de nivel experto en física, química y biología (GPQA Diamond 89,96 avg@8), útil en herramientas internas de soporte a investigación.
- Agentes de horizonte largo con memoria de trabajo: la rama DAMS mantiene estado asociativo dentro de una misma petición, lo que ayuda en sesiones de depuración prolongadas, siempre que se asuma que el estado no persiste entre peticiones.
- Servicio self-hosted de asistencia a desarrollo: desplegado con vLLM 0.31 y prefix caching para reutilizar contexto de repositorio entre llamadas de un mismo flujo.
- Base de investigación para arquitecturas híbridas con memoria: el código `dams_mem_v2.py` sirve como referencia reproducible para estudiar la inserción de mezcladores Gated DeltaNet como ramas residuales.

## Benchmarks y rendimiento

Resultados publicados por Oriven Labs, pass@1 salvo indicación, con harness idénticos para ambos modelos y servidos con vLLM a 262.144 tokens de contexto:

| Benchmark | DAMS 27B (it6) | Qwen3.8-27B (base) |
|---|---|---|
| LiveCodeBench v6 | 88,15 | 84,83 |
| GPQA Diamond (avg@8) | 89,96 | 89,2* |
| SWE-bench Verified | 85,2% (426/500) | 86,6% (433/500) |
| DeepSWE v1.1 | 39,8% (45/113) | 44,2% (50/113) |
| IFBench (strict) | 72,0 | 79,5 |

\* La puntuación de GPQA del base es la publicada por Qwen, no medida en el mismo harness; la comparación en esa fila no es estrictamente equivalente. El autor reporta las victorias y derrotas tal cual: DAMS 27B mejora en programación competitiva y razonamiento científico, y queda por detrás del base en SWE agéntico e instrucciones. No se han publicado resultados de benchmarks adicionales ni mediciones independientes en la información disponible.

## Requisitos de hardware

- Peso del checkpoint en bf16: 59,3 GB (tamaño del repo), coherente con 29,6B parámetros a 2 bytes.
- VRAM estimada para inferencia: un mínimo de ~65-70 GB para pesos más overhead en contexto corto; en la práctica se necesita una GPU de 80 GB (H100, A100 80GB) o H200 para contexto moderado.
- Contexto completo de 262.144 tokens: requiere paralelismo de tensor (2-4 GPU de 80 GB) por el state de Gated DeltaNet y la caché de atención; el autor indica que las capas de memoria añaden aproximadamente un 33% más de estado GDN por secuencia.
- GPU consumer: no cabe en bf16 en RTX 4090 (24 GB) ni en RTX 5090 (32 GB). No hay cuantizaciones oficiales de 4 bits y las capas `dams_mem` no están soportadas por llama.cpp, por lo que la ejecución en consumer no es viable con los artefactos publicados.
- Despliegue recomendado: vLLM 0.31 con el plugin `vllm_dams` del repo (`pip install ./DAMS-27B/vllm_dams`), `--language-model-only --max-model-len 262144 --enable-prefix-caching --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder`.
- Ajuste de memoria: si el motor falla al reservar, reducir `--max-num-seqs` (por ejemplo de 256 a 192). El plugin se puede desactivar con `DAMS_VLLM_PLUGIN=0`, lo que ejecuta el modelo sin memoria.
- Transformers: `dams_mem_v2.py` es una referencia de arquitectura; no se proporciona ni se ha probado una ruta de carga con `trust_remote_code` para inferencia.
- Latencia y throughput: no publicados. Como referencia de configuración, el autor recomienda temperature 1.0, top_p 0.95 y top_k 20.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LiveCodeBench v6 | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DAMS 27B (it6) | 29,6B | 262.144 | 88,15 | 85,2% (426/500) | Apache 2.0 | Pesos abiertos en HuggingFace; requiere plugin vLLM propio |
| Qwen3.8-27B (base) | ~27B (nominal) | 262.144 | 84,83 | 86,6% (433/500) | Apache 2.0 | Pesos abiertos; soporte estándar en transformers y vLLM |
| Otros modelos de ~27B de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa solo es posible con el modelo base, ya que la información proporcionada no incluye datos verificables de otras alternativas de tamaño o tarea equivalentes. Frente al base, DAMS 27B gana 3,32 puntos en LiveCodeBench v6 y 0,76 en GPQA Diamond (avg@8, con la salvedad de harness distinto), y pierde 1,4 puntos en SWE-bench Verified, 4,4 en DeepSWE v1.1 y 7,5 en IFBench strict.

## Limitaciones y advertencias

- La memoria DAMS no persiste entre peticiones: es estado por petición, no un mecanismo de memoria a largo plazo entre llamadas.
- Las ramas de memoria están ligeramente entrenadas en esta release; el propio autor califica su contribución como pequeña y anuncia memoria persistente más fuerte para versiones posteriores.
- Ejecutar el modelo sin el plugin (transformers o vLLM estándar) omite `model-dams-mem.safetensors` y produce un modelo distinto al evaluado, sin aviso explícito.
- El plugin está escrito y probado para vLLM 0.31; versiones distintas pueden requerir adaptación.
- Retroceso frente al base en tareas agénticas de SWE (DeepSWE v1.1: 39,8% frente a 44,2%) y en seguimiento de instrucciones estrictas (IFBench: 72,0 frente a 79,5).
- La puntuación de GPQA del base procede de la publicación de Qwen, no del mismo harness; la comparación en esa fila no es equivalente.
- Todos los benchmarks son autoinformados por Oriven Labs, sin verificación independiente en la información disponible; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Visión no entrenada ni evaluada: aunque los pesos del encoder estén presentes, no hay garantía de calidad multimodal y el despliegue recomendado es solo texto.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre calidad fuera del inglés técnico.
- Riesgo de alucinación inherente a modelos de lenguaje en código y en citas de API; la verificación mediante tests es parte del diseño del entrenamiento, pero no elimina el riesgo en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución al base Qwen3.8-27B.
- Fecha del repositorio muy reciente (29 de octubre de 2026) y ecosistema de tooling limitado al plugin propio; no hay soporte en llama.cpp, Ollama ni TGI con los artefactos publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oriven-Labs/DAMS-27B
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio de Oriven Labs: https://orivenlabs.com/
- Organización en GitHub: https://github.com/Oriven-Labs
- Contacto del autor: alexander@orivenlabs.com
- Paper técnico: no disponible
- Demo o espacio interactivo: no disponible
