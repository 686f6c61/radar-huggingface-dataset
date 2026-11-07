# bahattinyunus/kam-apex-8b-gguf

## Resumen

KAM-Apex 8B (también denominado "Başbuğ Kam") es una adaptación en formato GGUF publicada por el desarrollador turco Bahattin Yunus Çetin (@bahattinyunus) sobre una base declarada de Qwen3 8B. El autor lo presenta como un "núcleo cognitivo de defensa" orientado a sistemas autónomos en el borde (drones, estaciones de guerra electrónica y plataformas C2), con un enfoque explícito en el idioma turco y en despliegues air-gapped sin dependencia de la nube. La model card combina una descripción de modelo de lenguaje con una arquitectura de sistema (Active Inference, Control Barrier Functions, eBPF, JIT en C++20) que en la práctica corresponde al stack software del repositorio `kam`, no al grafo de cómputo de los pesos publicados.

El artefacto disponible en Hugging Face es un único fichero GGUF de 5,20 GB, pensado para ejecutarse con Ollama mediante `ollama run hf.co/bahattinyunus/kam-apex-8b-gguf`. No se publican pesos en safetensors, ni ficha de entrenamiento, ni datos de evaluación reproducibles más allá de una puntuación interna ("%100,0 / 100" en `evaluate_kam.py`, 23/23 tests) que el autor no documenta ni enlaza. La licencia declarada es Apache 2.0 y los idiomas soportados según los metadatos son turco e inglés.

Su relevancia actual es limitada pero ilustrativa: ejemplifica una tendencia de adaptaciones comunitarias de Qwen3 con cuantización agresiva y empaquetado para edge, aunque la distancia entre las afirmaciones de la model card y la evidencia verificable es muy grande. Cualquier evaluación seria debe tratar las capacidades declaradas (guerra electrónica, DRFM, planificación C2) como no verificadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base declarada: Qwen3 8B); la model card menciona componentes híbridos SSM/LTC/MoE que no se corresponden con el GGUF publicado |
| Parámetros totales | 8B (según denominación y base declarada; no verificado en los ficheros) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (nivel de cuantización concreto no especificado); se menciona BitNet b1.58 y Hessian imatrix en la model card, sin ficheros asociados |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (5,20 GB); no se publican safetensors |

## Arquitectura y entrenamiento

La model card describe una arquitectura de ocho capas ("8-Pillar Convergence") que mezcla componentes de sistema operativo (eBPF, `memfd_create`, JIT con Clang `-O3`), teoría de control (Lyapunov, Control Barrier Functions), inferencia activa de Friston y una supuesta capa neuronal "tri-híbrida" con Conv1D, atención de ventana deslizante y un solver Runge-Kutta de cuarto orden sobre Liquid Time-Constant Networks, más un MoE de ocho expertos con selección Top-2. Esta descripción no es coherente con un GGUF de 5,20 GB derivado de Qwen3 8B: un MoE con esa configuración y un LTC integrado requerirían un grafo y unos tensores que no aparecen en el artefacto publicado, y no se aporta ningún fichero de configuración, código de entrenamiento enlazado ni traza de conversión a GGUF.

No se publican datos sobre el corpus de entrenamiento (número de tokens, composición, proporción tr/en), ni sobre fases de alineación (SFT, RLHF, DPO). Las referencias a "BitNet b1.58", "imatrix" y "decodificación especulativa con `kam:1.5b` como draft" son afirmaciones sin artefactos verificables: no hay ficheros ternarios ni un modelo draft enlazado en este repositorio. En consecuencia, la arquitectura real del fichero GGUF debe asumirse como la de la base Qwen3 8B con posibles ajustes finos no documentados.

## Capacidades

- Generación de texto en turco e inglés, heredada de la base Qwen3 8B (no verificada en este artefacto).
- Razonamiento y matemáticas: la model card menciona un modo "híbrido pensante/no pensante" propio de Qwen3, sin ejemplos ni evaluaciones publicadas.
- Generación de código: se anuncia soporte de C++20 y eBPF en el contexto del stack KAM; no hay benchmarks que lo respalden.
- Tool calling / function calling: no documentado de forma explícita; la base Qwen3 lo soporta, pero no se confirma que se conserve tras el ajuste.
- Orquestación de agentes y planificación multi-paso: la model card describe descomposición de intención en un DAG de tareas (`TASK-101-EW-SEAD`, etc.) como capacidad del sistema, no del modelo aislado.
- Capacidades declaradas específicas de dominio (PDW, DRFM, C2, inferencia activa): no verificables con el artefacto publicado.
- Multilingüismo: limitado a turco e inglés según metadatos.

## Casos de uso

- Asistente conversacional en turco para dominios técnicos: el modelo puede emplearse como generador de texto en turco en aplicaciones de soporte o documentación, aprovechando la base Qwen3 y el ajuste declarado; requiere evaluación propia porque no hay métricas publicadas.
- Prototipado de agentes locales air-gapped: al distribuirse como GGUF, puede desplegarse en entornos sin conectividad mediante Ollama o llama.cpp, lo que encaja con escenarios de laboratorio o simulación offline.
- Generación y revisión de código en pipelines internos: si el ajuste conserva las capacidades de Qwen3, podría usarse para autocompletado y revisión de C++ o scripts de sistema; conviene validar con HumanEval o un conjunto propio antes de integrarlo en CI/CD.
- Experimentación académica sobre inferencia activa y control: el repositorio `kam` puede servir como banco de pruebas para explorar la integración de LLM con bucles de Free Energy Principle, aunque el modelo en sí no implementa esos mecanismos.
- Educación y demostraciones de cuantización GGUF: útil como ejemplo práctico de empaquetado de un modelo de 8B en 5,20 GB para ejecución en hardware de consumo.
- Evaluación crítica de model cards: caso de estudio sobre la brecha entre afirmaciones y artefactos publicados en adaptaciones comunitarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única cifra aportada por el autor ("%100,0 / 100" en `evaluate_kam.py`, 23/23 tests) corresponde a una suite interna no enlazada ni reproducible, y no debe interpretarse como rendimiento del modelo en tareas estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: en torno a 6-8 GB para el fichero GGUF de 5,20 GB con contexto moderado; el nivel exacto de cuantización no se especifica, por lo que la estimación es aproximada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para contextos largos; A100/H100 solo si se requiere serving concurrente.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más, asumiendo cuantización Q4-Q5; con 6 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/bahattinyunus/kam-apex-8b-gguf`), llama.cpp, y potencialmente vLLM o TGI si se convierte a safetensors (no publicado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KAM-Apex 8B | 8B (declarado) | no disponible | Apache 2.0 | GGUF | Adaptación comunitaria; sin benchmarks ni ficha de entrenamiento |
| Qwen3 8B | 8B | 32 768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Base oficial; benchmarks publicados por Alibaba |
| Llama 3.1 8B | 8B | 131 072 tokens | Llama 3.1 Community | safetensors, GGUF | Alternativa generalista con contexto largo |
| Mistral 7B v0.3 | 7B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Referencia europea con licencia permisiva |

La comparación relevante es con Qwen3 8B: KAM-Apex no aporta métricas que justifiquen preferirlo frente a la base oficial, y carece de la documentación de entrenamiento que sí publica Alibaba.

## Limitaciones y advertencias

- Discrepancia grave entre la model card y el artefacto: se describen MoE, SSM líquido, BitNet b1.58 y eBPF que no están presentes en un GGUF de 5,20 GB derivado de Qwen3 8B.
- Ausencia total de datos de entrenamiento, evaluación reproducible e hiperparámetros; la puntuación interna del 100 % no es verificable.
- Riesgo elevado de alucinación en dominios especializados (guerra electrónica, C2, DRFM) donde el modelo no tiene evidencia de entrenamiento específico.
- Sesgos potenciales derivados del corpus de Qwen3 y del ajuste comunitario no documentado; no se han realizado evaluaciones de sesgo.
- Cobertura lingüística limitada a turco e inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior al de la base.
- Uso comercial permitido por Apache 2.0, pero sin garantías del autor; la responsabilidad legal recae en el integrador.
- No apto para producción en sistemas críticos o de defensa sin una validación independiente exhaustiva; las afirmaciones de "self-healing" y "air-gapped" describen el stack del repositorio, no el modelo.
- Contexto máximo no documentado: planificar despliegues con contexto conservador hasta verificar el valor real en el GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bahattinyunus/kam-apex-8b-gguf
- Perfil del autor: https://huggingface.co/bahattinyunus
- Repositorio GitHub del proyecto: https://github.com/bahattinyunus/kam
- Perfil GitHub del autor: https://github.com/bahattinyunus
- Modelo relacionado (kam-r1-gguf): https://huggingface.co/bahattinyunus/kam-r1-gguf
