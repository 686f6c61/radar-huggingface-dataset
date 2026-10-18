# Bluebarrels/easylm-kidsafety-bonsai-2-2b

## Resumen

`easylm-kidsafety-bonsai-2-2b` es un adaptador LoRA de PEFT publicado por Bluebarrels sobre el modelo ternario `prism-ml/Ternary-Bonsai-2-2B-gguf`. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (unos 3,5 MB, 56 tensores, 278 520 elementos FP16 no nulos) que se aplican sobre una base de aproximadamente 2 000 millones de parámetros con pesos de 1,58 bits distribuida en formato GGUF. El adaptador especializa esa base en tres frentes declarados por el autor: aplicación de límites de seguridad infantil, coaching socrático de deberes que no revela la respuesta final y aislamiento estricto de herramientas en local.

El modelo se enmarca en la familia "EasyLM & Hydra" del mismo autor, una escalera de adaptadores que va del tier de 500 MB (2B) al de 6 GB (27B). La propuesta es deliberadamente de borde: el objetivo declarado es cargar el modelo en el navegador mediante WebGPU en teléfonos, tabletas, Chromebooks y portátiles, sin depender de infraestructura en la nube. La ventana de contexto anunciada es de 262 144 tokens.

Su relevancia potencial está en el nicho de despliegue soberano y local para entornos educativos o de protección de menores, donde enviar conversaciones a un proveedor externo plantea problemas de cumplimiento normativo. Ahora bien, el adaptador se entrena con un corpus extremadamente pequeño (35 turnos en el fichero específico de seguridad infantil) y no presenta ninguna evaluación publicada, por lo que debe tratarse como un experimento reproducible más que como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con adaptadores LoRA (PEFT) sobre las proyecciones de atención y de la MLP; base con pesos ternarios (1,58 bits) distribuida en GGUF |
| Parámetros totales | ~2 000 millones en el modelo base; el adaptador contiene 278 520 elementos FP16 no nulos (564 336 bytes) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantización | Base ternaria (1,58 bits) en GGUF; adaptador en FP16 sobre safetensors. Se referencia además una variante MLC `q4f16_1` |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | Adaptador: safetensors (PEFT/LoRA). Base: GGUF |
| Rango / alpha / dropout LoRA | r = 16, alpha = 32, dropout = 0,05 |
| Módulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Tamaño del adaptador | ~3,5 MB (56 tensores verificados) |
| Modelo base | `prism-ml/Ternary-Bonsai-2-2B-gguf` |
| Base alternativa citada | `mlc-ai/Qwen3.5-2B-q4f16_1-MLC` (WebGPU/MLC) |
| Dataset de entrenamiento | `Bluebarrels/easylm-training-corpus`, fichero `adapter_kidsafety_chatml.jsonl` (35 turnos) |
| Descargas / likes | 0 / 0 según los metadatos del repositorio |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre un transformer denso estándar: los módulos objetivo listados (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) cubren tanto la atención como el bloque feed-forward, lo que implica una adaptación de rango 16 sobre prácticamente toda la ruta de cómputo del modelo. La base pertenece a la línea "Bonsai 2" de prism-ml, caracterizada por pesos ternarios de 1,58 bits; esa cuantización extrema es lo que permite el perfil de ~500 MB que el autor sitúa como "Universal Default" para usuarios de EasyLM. El nombre del repositorio sugiere que el ajuste se realizó con el stack EasyLM (JAX) y que la inferencia se integra en el runtime WebGPU de EasyLM y en la CLI/TUI/escritorio de Hydra.

En el plano de los datos, la model card describe un corpus propietario agregado con material académico, tablas de referencia cuantitativa, un mapa de conceptos ("Alice 1.0 EMap", 46 025 nodos y 19 842 aristas) con una capa socrática basada en 6 modos de diagnóstico de confusión, 12 formas de pregunta y una máquina de estados de 7 etapas (elenchus/aporia), además del currículo de Hydra v1.2.2. Para este adaptador concreto, el subconjunto declarado es `adapter_kidsafety_chatml.jsonl`, con solo 35 turnos en formato ChatML. No se especifican el número total de tokens vistos, la composición exacta por fichero, la época, la tasa de aprendizaje, el optimizador, ni si hubo fases de RLHF o DPO. Tampoco se documenta ningún proceso de evaluación o red-teaming previo a la publicación.

## Capacidades

- Generación de texto conversacional en formato ChatML, heredada del modelo base de 2B.
- Aplicación de límites de seguridad infantil: el adaptador está entrenado para reconducir o rechazar contenido inapropiado en interacciones con menores.
- Coaching socrático de deberes: guía paso a paso sin entregar la solución final ni claves de respuesta, usando un esquema de preguntas encadenadas.
- Diagnóstico de confusión del alumno mediante modos predefinidos (C1–C6) y formas de pregunta enseñadas (Q01–Q12).
- Aislamiento local de herramientas ("strict local-only tool isolation"), orientado a que el modelo no invoque servicios remotos.
- Ventana de contexto declarada de 262 144 tokens, útil para arrastrar material de curso completo o historiales largos de tutoría.
- Integración con el runtime WebGPU de EasyLM y con la CLI `hydra` (incluye `hydra agent` y `hydra serve` en el puerto 7777).
- Soporte multilingüe: no disponible (no se declara ninguna lista de idiomas).
- Capacidades de visión, audio o modo "thinking" explícito: no disponibles para este adaptador (la torre de visión se menciona únicamente para el tier de 27B).

## Casos de uso

- **Tutor de deberes con supervisión docente**: el adaptador está diseñado para guiar al alumno mediante preguntas en lugar de dar la solución, de modo que un centro puede desplegarlo como apoyo en matemáticas o física sin que el estudiante obtenga la respuesta directamente. El contexto de 262 144 tokens permite adjuntar el enunciado completo y el historial de la sesión.
- **Filtro de seguridad en chats infantiles**: como capa de post-procesado o de diálogo en plataformas dirigidas a menores, aplicando los límites de contenido aprendidos antes de escalar a un modelo mayor o a un moderador humano.
- **Asistencia offline en aulas sin conectividad**: al ocupar ~500 MB en cuantización ternaria, puede ejecutarse íntegramente en un portátil o Chromebook del centro, lo que evita depender de red y mantiene las conversaciones de los menores en el dispositivo.
- **Despliegue en navegador vía WebGPU**: el autor publica un cargador de safetensors (`parseSafeTensorsHeader`, `applyLoRAWeights`) para aplicar el adaptador en cliente; encaja en aplicaciones educativas web donde el coste de servidor debe ser cero.
- **Cumplimiento normativo y minimización de datos**: en escenarios con RGPD o normativa equivalente sobre datos de menores, procesar en local reduce la transferencia de conversaciones a terceros; el adaptador se puede empaquetar junto con la base GGUF en una imagen de escritorio.
- **Sandbox de agentes para prácticas de programación**: la política de aislamiento local de herramientas permite usar el modelo como mentor de código en un entorno controlado, donde el alumno ejecuta comandos en una máquina virtual sin acceso a red.
- **Investigación sobre alineación en dominios sensibles**: sirve como caso de estudio reproducible de ajuste fino con LoRA de rango 16 sobre una base ternaria para analizar cómo se transfieren las políticas de seguridad con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna evaluación específica de seguridad infantil, y tampoco se aportan comparaciones medidas frente al modelo base sin adaptar.

## Requisitos de hardware

- **Peso del modelo**: ~500 MB para la base ternaria en GGUF más ~3,5 MB del adaptador, según los datos del autor.
- **VRAM**: la información disponible no cuantifica el consumo real de VRAM. El factor dominante no serán los pesos, sino la caché KV asociada a los 262 144 tokens de contexto, cuyo coste no se documenta.
- **GPU de consumo**: por tamaño, cabe holgadamente en cualquier GPU de consumo reciente (por ejemplo, gama RTX xx60/xx70), en iGPU y, previsiblemente, en CPU.
- **Despliegue en cliente**: el autor apunta a WebGPU en teléfonos, tabletas y Chromebooks mediante el runtime de EasyLM; también se cita una base MLC `q4f16_1` para esa ruta.
- **Despliegue en servidor**: la base es GGUF, por lo que la vía natural es `llama.cpp` o derivados. La compatibilidad con vLLM o TGI no está confirmada, dado que el adaptador se distribuye como PEFT pero la base pública es GGUF ternaria.
- **Integración de escritorio/CLI**: Hydra (`hydra`, `hydra agent`, `hydra swarm`, `hydra serve` en el puerto 7777) y los modos de `hydra-tui-rs` / `hydra-desktop-rs`.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Bluebarrels/easylm-kidsafety-bonsai-2-2b` | 2B (adaptador de ~3,5 MB) | 262 144 | Seguridad infantil + coaching socrático | AGPL-3.0 | Público en HuggingFace, 0 descargas |
| `prism-ml/Ternary-Bonsai-2-2B-gguf` (base) | ~2B | No disponible | Base generalista con pesos ternarios | No disponible | Público en HuggingFace |
| `Bluebarrels/easylm-bonsai-2-2b` | 2B | No disponible | Adaptador generalista del tier de 500 MB | No disponible | Público en HuggingFace (misma familia) |
| `Bluebarrels/easylm-bonsai-2-9b` | 9B | No disponible | Agente por defecto para Hydra, orquestación de herramientas MCP y derivaciones STEM | No disponible | Público en HuggingFace (misma familia) |
| `Bluebarrels/easylm-bonsai-2-27b` | 27B | 262 144 | Tier insignia, incluye torre de visión | No disponible | Público en HuggingFace (misma familia) |

No se dispone de datos de rendimiento comparado entre estos modelos; la comparación se limita a parámetros, contexto declarado, licencia y disponibilidad. Frente a adaptadores LoRA de seguridad de uso común en la comunidad, no se han encontrado referencias verificables en la información proporcionada, por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- **Corpus de entrenamiento mínimo**: el subconjunto específico de seguridad infantil contiene 35 turnos. Es un volumen muy reducido, con riesgo alto de sobreajuste y de generalización pobre a conversaciones reales.
- **Ausencia total de evaluación**: no hay benchmarks, ni pruebas de robustez, ni resultados de red-teaming publicados. No es posible afirmar que el adaptador mejore la seguridad frente a la base sin ajustar.
- **Riesgo de alucinación**: al partir de una base de 2B con cuantización ternaria, la precisión factual y la capacidad de razonamiento son limitadas; el propio autor lo presenta como un tier básico dentro de su escalera.
- **Dominio jurídicamente sensible**: cualquier uso con menores exige supervisión humana, revisión legal (RGPD, COPPA y normativa equivalente) y mecanismos de escalado a un adulto. El adaptador no sustituye un sistema de moderación auditado.
- **Licencia AGPL-3.0**: es copyleft fuerte. Si el modelo se ofrece como servicio en red, la AGPL obliga a liberar el código fuente correspondiente, lo que puede ser incompatible con productos propietarios.
- **Idiomas no declarados**: se desconoce si el ajuste conserva el multilingüismo de la base; no hay garantía de calidad en castellano.
- **Ambigüedad sobre el modelo base**: el adaptador se entrena sobre la base GGUF ternaria `Ternary-Bonsai-2-2B-gguf`, mientras la model card cita también `mlc-ai/Qwen3.5-2B-q4f16_1-MLC` como base WebGPU/MLC. No se documenta si el adaptador es aplicable a esa segunda base ni con qué pérdida de fidelidad.
- **Contexto anunciado sin evidencia**: los 262 144 tokens figuran en la ficha, pero no se aportan pruebas de calidad en contextos largos (ni "needle in a haystack" ni evaluaciones de recuperación).
- **Afirmaciones no verificables**: el corpus se describe con cifras concretas (92 stacks académicos, 369 tablas, 46 025 nodos), pero no se publican muestras auditables ni metodología de verificación de esos datos.
- **Señales de adopción nulas**: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública, lo que implica ausencia de validación por terceros.
- **Sin datos de sesgo**: no se documenta ningún análisis de sesgos demográficos, culturales o de género.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Bluebarrels/easylm-kidsafety-bonsai-2-2b
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/Bluebarrels/easylm-training-corpus
- Base alternativa WebGPU/MLC citada: https://huggingface.co/mlc-ai/Qwen3.5-2B-q4f16_1-MLC
- Adaptador generalista del mismo tier: https://huggingface.co/Bluebarrels/easylm-bonsai-2-2b
- Adaptador del tier intermedio: https://huggingface.co/Bluebarrels/easylm-bonsai-2-4b
- Adaptador del tier de agentes: https://huggingface.co/Bluebarrels/easylm-bonsai-2-9b
- Adaptador del tier insignia: https://huggingface.co/Bluebarrels/easylm-bonsai-2-27b
- Paper, blog técnico, repositorio de código o demo: no disponible.
- La búsqueda web realizada no devolvió resultados relacionados con este modelo (los enlaces obtenidos pertenecían a sitios de contenido para adultos sin relación alguna), por lo que no se incluyen como referencias.
