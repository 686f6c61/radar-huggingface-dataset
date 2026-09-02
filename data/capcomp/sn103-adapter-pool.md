# capcomp/sn103-adapter-pool

## Resumen

El repositorio `capcomp/sn103-adapter-pool` no contiene un modelo de lenguaje completo, sino un conjunto de 30 adaptadores LoRA diseñados para componerse sobre el modelo base `Qwen/Qwen3-8B`. Es el "pool certificado" de la subred Bittensor SN103 (Capcomp), un proyecto que aborda el problema de la composición automática de adaptadores: dado un flujo de trabajo real, qué adaptadores ayudan, cuáles son redundantes y cuáles entran en conflicto, y con qué coeficientes y pesos por capa deben combinarse.

El repositorio publica los pesos congelados de los adaptadores para que los mineros de la subred construyan sus "recetas" de fusión contra los mismos pesos que usa el motor de composición, y para que los validadores puedan reconstruir y medir candidatos sin depender de las puntuaciones del operador. Incluye 26 adaptadores espejados bajo licencia Apache 2.0 y referencia a 4 más alojados externamente por no tener licencia explícita. El tamaño total del repositorio es de 9,1 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-8B (modelo base) + adaptadores LoRA |
| Parametros totales | no disponible (30 adaptadores individuales, cada uno con sus propios parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en el repo; depende del modelo base Qwen3-8B |
| Tipos de cuantizacion | no disponible (los adaptadores estan en safetensors sin cuantizar) |
| Idiomas soportados | no disponibles (el repo no declara idiomas; el modelo base Qwen3-8B soporta multiples idiomas) |
| Licencia | no disponible (los adaptadores individuales son mayoritariamente Apache 2.0, pero el repo no declara una licencia global) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no describe un entrenamiento propio, sino que agrupa adaptadores LoRA de terceros y propios, cada uno entrenado para una capacidad concreta. La tabla de la model card lista 30 adaptadores con sus capacidades declaradas: `action-planner-v1` (tool calling), `chained-reasoning-v1` (razonamiento con fallos), `code-generation-v1` (generación de código Python), `document-extraction-v1` (extracción de logs estructurados), `industrial-ifc-v1` (esquema de activos industriales), entre otros. También incluye adaptadores marcados como "distractor" (por ejemplo, `creative-writing-v1`, `legal-citation-v1`, `general-instruction-v1`) que se incorporan deliberadamente al pool para que el sistema de composición aprenda a reconocer que una apariencia plausible no implica utilidad real.

El pool está anclado a una instantánea específica del modelo base: `Qwen/Qwen3-8B@b968826d9c46dd6066d109eabc6255188de91218`, y cada adaptador tiene un hash SHA-256 verificado en `pool.json`. La innovación técnica no está en el entrenamiento de los adaptadores, sino en el mecanismo de composición que la subred SN103 implementa: los mineros proponen recetas JSON que especifican qué adaptadores combinar, con qué coeficientes y a qué capas, y los validadores reconstruyen el modelo fusionado para medir su rendimiento en tareas reales.

## Capacidades

- El pool proporciona adaptadores para tool calling (`action-planner-v1`), razonamiento general (`parallel-reasoning-v1`), razonamiento con fallos (`chained-reasoning-v1`) y generación de código Python (`code-generation-v1`).
- Incluye adaptadores para extracción de documentos estructurados (`document-extraction-v1`), esquemas de activos industriales (`industrial-ifc-v1`) y lenguaje técnico de dominio (`embedded-engineering-v1`).
- Hay adaptadores para salida estructurada (`structured-explanation-v1`) y decisión de recursos (`constrained-selection-v1`).
- El pool contiene adaptadores "distractor" que se usan para evaluar la capacidad del sistema de composición de detectar adaptadores perjudiciales.
- No es un modelo conversacional ni un modelo multimodal; es un conjunto de piezas para ser fusionadas sobre Qwen3-8B.
- El soporte multilingüe depende del modelo base, no de los adaptadores.

## Casos de uso

- Composicion de adaptadores para agentes con tool calling: un desarrollador puede combinar `action-planner-v1` con `parallel-reasoning-v1` sobre Qwen3-8B para construir un agente que planifique acciones y razone en paralelo sobre múltiples hipótesis.
- Generacion de codigo en entornos de produccion: `code-generation-v1` puede fusionarse con el modelo base para tareas de autocompletado o generación de scripts Python, integrándose en pipelines de CI/CD.
- Extraccion de informacion estructurada: `document-extraction-v1` permite convertir logs o documentos no estructurados en registros estructurados, útil para sistemas de monitorización o análisis de datos.
- Razonamiento con deteccion de fallos: `chained-reasoning-v1` está diseñado para cadenas de razonamiento donde se identifican y corrigen errores intermedios, aplicable a sistemas de diagnóstico técnico.
- Evaluacion de recetas de composicion: validadores de la subred SN103 pueden reconstruir modelos fusionados a partir de los adaptadores del pool y medir su rendimiento en tareas específicas, sin depender de puntuaciones externas.
- Investigacion sobre composicion de LoRA: el pool sirve como banco de pruebas para estudiar qué combinaciones de adaptadores producen sinergias o conflictos, con hashes verificables para reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento de los adaptadores individuales ni del pool completo. La subred SN103 evalúa recetas de composición, pero los resultados de esas evaluaciones no se documentan en este repositorio.

## Requisitos de hardware

- El repositorio completo pesa 9,1 GB, pero no es necesario descargarlo entero para usar un adaptador concreto; cada adaptador se puede descargar por separado.
- Para inferencia con un adaptador fusionado sobre Qwen3-8B, se necesita VRAM suficiente para el modelo base más el adaptador. Qwen3-8B en FP16 requiere aproximadamente 16 GB de VRAM; con cuantización 4-bit (por ejemplo, GGUF) puede caber en 6-8 GB.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para FP16, o GPUs con 8-12 GB para cuantización 4-bit. Para despliegue en producción, A100 o H100 si se sirve con alta concurrencia.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que soporten la fusión de adaptadores LoRA sobre el modelo base.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y el número de adaptadores fusionados.

## Comparativa con modelos similares

No hay un comparador directo, ya que este repositorio no es un modelo sino un pool de adaptadores. Como referencia, se puede comparar con el modelo base Qwen3-8B y con otros pools de adaptadores públicos:

| Repositorio | Contenido | Base | Licencia | Uso |
|---|---|---|---|---|
| capcomp/sn103-adapter-pool | 30 adaptadores LoRA | Qwen3-8B | Mixta (Apache 2.0 mayoritario) | Composicion en SN103 |
| Qwen/Qwen3-8B | Modelo base | - | Apache 2.0 | Inferencia directa |
| Otros pools de LoRA en HuggingFace | Adaptadores sueltos | Variable | Variable | Fine-tuning o inferencia |

La diferencia clave es que este pool está diseñado específicamente para el mecanismo de composición de la subred SN103, con hashes verificables y adaptadores marcados como distractores, algo que no ofrecen los repositorios de adaptadores convencionales.

## Limitaciones y advertencias

- El pool no es un modelo listo para usar: requiere un proceso de composición (fusión de adaptadores) que no está documentado en este repositorio, sino en el ecosistema de la subred SN103.
- Cuatro de los 30 adaptadores no están espejados en el repositorio por falta de licencia explícita; deben descargarse de sus fuentes originales y verificarse contra los hashes de `pool.json`.
- El repositorio incluye adaptadores "distractor" que, si se usan sin conocimiento, pueden degradar el rendimiento del modelo fusionado.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto de los adaptadores individuales; estas dependen del modelo base y de los datos de entrenamiento de cada adaptador.
- La licencia global del repositorio no está declarada; aunque la mayoría de adaptadores son Apache 2.0, algunos no tienen licencia explícita, lo que puede limitar su uso comercial.
- La fecha de creación (2026-09-02) y el número de descargas (0) sugieren que el repositorio es muy reciente o de baja adopción; no hay evidencia de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/capcomp/sn103-adapter-pool
- GitHub de Capcomp AI: https://github.com/Capcomp-AI/capability-composition-subnet
- Perfil de GitHub de Capcomp AI: https://github.com/Capcomp-AI/
- Investigacion independiente sobre SN103 (SubnetRadar): https://subnetradar.com/research/subnets/103
- Guia de SN103 en OpenTAO: https://opentao.ai/beginner/subnets/103-capcomp/
- Fuentes de adaptadores no espejados: https://huggingface.co/Milian/Q3_8B_z_plus_arkts_SFT_lora_mpj_0430, https://huggingface.co/Aznaur/qwen3-8b-terminal-agent-fix-git-overfit-rank256-epoch49, https://huggingface.co/NathanRoll/writing-rlvr-qwen3-8b-lora, https://huggingface.co/NathanRoll/writing-rlvr-v2-qwen3-8b-lora
