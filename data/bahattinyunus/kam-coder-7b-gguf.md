# bahattinyunus/kam-coder-7b-gguf

## Resumen

KAM-Coder 7B es un modelo de generación de texto publicado por Bahattin Yunus Çetin (usuario `bahattinyunus`) bajo el identificador `bahattinyunus/kam-coder-7b-gguf`. Según la model card, se trata de un ajuste del modelo Qwen 2.5 Coder 7B orientado a tareas de programación en C++20, análisis de eBPF en Linux y generación de código JIT, integrado dentro de un sistema propio denominado KAM, que el autor describe como un motor cognitivo local para entornos edge y vehículos autónomos militares.

El modelo se distribuye únicamente en formato GGUF (4,7 GB de repositorio), con licencia Apache 2.0 y soporte declarado para turco e inglés. La model card mezcla la descripción del modelo con la del sistema que lo rodea (inferencia activa de Friston, redes neuronales líquidas, BitNet b1.58, funciones de barrera de control, guerra electrónica cognitiva), de modo que no es posible separar con claridad qué capacidades corresponden al modelo de lenguaje y cuáles al motor externo.

La relevancia práctica es limitada: el repositorio no registra descargas ni valoraciones, no incluye resultados de benchmarks verificables y la práctica totalidad de las afirmaciones técnicas de la model card carece de evidencia reproducible. Debe evaluarse como un ajuste comunitario de Qwen 2.5 Coder 7B para turco e inglés, no como un modelo con las capacidades que declara el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base declarada: Qwen 2.5 Coder 7B); la model card menciona además componentes híbridos SSM y MoE no verificables en los pesos |
| Parámetros totales | 7.615.616.512 (7,6 B) |
| Parámetros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repositorio incluye al menos una cuantización; no se detallan los niveles Q4/Q5/Q8) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 4,7 GB) |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la arquitectura real del modelo. Los pesos tienen 7.615.616.512 parámetros, cifra compatible con un transformer decoder-only de la familia Qwen 2.5 de 7 B, y la model card identifica explícitamente Qwen 2.5 Coder 7B como base. Sobre esa base, el autor declara componentes adicionales (SSM líquido con solver Runge-Kutta de cuarto orden, atención de ventana deslizante, MoE con 8 expertos y selección top-2, cuantización ternaria BitNet b1.58), pero no se aportan configuraciones, scripts de entrenamiento ni trazas que permitan verificar que esos componentes estén incorporados en los pesos publicados.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, la existencia de RLHF o DPO, ni el procedimiento de ajuste. La model card menciona un script `scripts/train_kam_persona.py` en un repositorio de GitHub y una "puntuación de benchmark cognitivo en vivo del 100,0 %" obtenida con `evaluate_kam.py` sobre 23 pruebas unitarias y de integración, pero se trata de pruebas del sistema KAM, no de evaluaciones estándar del modelo de lenguaje. No hay información verificable sobre datos de entrenamiento ni sobre innovaciones técnicas aplicadas al modelo.

## Capacidades

- Generación de texto conversacional en turco e inglés, según los idiomas declarados.
- Generación de código, heredada de la base Qwen 2.5 Coder 7B; la model card la orienta a C++20, eBPF y parcheo en caliente con `memfd_create`.
- Integración declarada con Ollama mediante `ollama run hf.co/bahattinyunus/kam-coder-7b-gguf`.
- La model card atribuye al sistema KAM (no necesariamente al modelo) capacidades de inferencia activa, planificación de misiones como grafo DAG, análisis de señales de radar y síntesis DRFM; no hay evidencia de que el modelo de lenguaje las implemente por sí solo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistencia a programación en C++20: el modelo puede emplearse como autocompletado y generación de fragmentos de código C++ moderno en un IDE o en un pipeline de revisión, aprovechando su base Qwen 2.5 Coder; requiere validación manual porque no hay benchmarks publicados.
- Generación de utilidades eBPF: dado el enfoque declarado del ajuste, puede usarse para redactar programas eBPF sencillos (`kprobe`, `tracepoint`) y para explicar su semántica, siempre con revisión humana antes de cargarlos en un kernel.
- Chat técnico en turco: es uno de los pocos ajustes de la familia Qwen 2.5 Coder que declara soporte de turco, por lo que puede servir para asistencia técnica y explicación de código a desarrolladores turcoparlantes.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU dedicada o con GPU de consumo, útil para entornos con requisitos de privacidad.
- Prototipado de pipelines de agente: puede integrarse como generador de código dentro de un agente que proponga y valide parches, aunque la ausencia de documentación sobre tool calling obliga a implementar el protocolo en el orquestador.
- Evaluación comparativa de ajustes comunitarios: sirve como caso de estudio de ajustes de bajo perfil publicados sin benchmarks, útil para investigadores que analizan la trazabilidad y verificabilidad de model cards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card cita una "puntuación de benchmark cognitivo en vivo del 100,0 / 100" obtenida con `evaluate_kam.py` sobre 23 pruebas unitarias y de integración del sistema KAM, pero no se trata de una evaluación estándar del modelo de lenguaje (MMLU, HumanEval, GSM8K u otras) y no se aportan detalles que permitan reproducirla.

## Requisitos de hardware

- VRAM estimada: alrededor de 4,5-5 GB para la cuantización GGUF incluida (repositorio de 4,7 GB); en FP16 el modelo de 7,6 B requeriría aproximadamente 15,2 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para FP16; para cuantizaciones GGUF basta una RTX 3060 de 12 GB o similar.
- Cabe en GPU de consumo: sí, en cuantización GGUF de 4-5 bits, en tarjetas con 6-8 GB de VRAM o más.
- Opciones de despliegue: Ollama (soporte declarado en la model card), llama.cpp y cualquier runtime compatible con GGUF; vLLM y TGI no están confirmados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KAM-Coder 7B (`bahattinyunus/kam-coder-7b-gguf`) | 7,6 B | no disponible | Apache 2.0 | GGUF | Ajuste comunitario sin benchmarks; idiomas tr/en |
| Qwen 2.5 Coder 7B (base declarada) | 7,6 B | 32 768 tokens (según la familia Qwen 2.5) | Apache 2.0 | safetensors, GGUF | Base oficial con benchmarks publicados |
| DeepSeek-Coder 6.7B | 6,7 B | 16 384 tokens | DeepSeek License | safetensors, GGUF | Alternativa de código con benchmarks publicados |
| CodeLlama 7B | 6,7 B | 16 384 tokens | Llama 2 License | safetensors, GGUF | Alternativa de Meta con benchmarks publicados |

La comparación se limita a datos de la familia base y de alternativas conocidas; para KAM-Coder no hay datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks estándar publicados: no hay evidencia de que el ajuste supere o iguale a su base Qwen 2.5 Coder 7B.
- La model card mezcla afirmaciones sobre el modelo con afirmaciones sobre el sistema KAM (inferencia activa, guerra electrónica, control Lyapunov) que no pueden verificarse a partir de los pesos publicados.
- La cifra de "100,0 / 100" en un benchmark propio y las métricas de compresión (10,13x) o ahorro energético (4,6x) no son reproducibles con la información disponible.
- Riesgo de alucinación en código: al ser un ajuste sin evaluación publicada, la generación de C++20 o eBPF puede contener errores sutiles; requiere revisión y pruebas antes de usarse en producción.
- Idiomas limitados a turco e inglés; el rendimiento en castellano no está documentado.
- Contexto máximo no documentado: no debe asumirse la ventana de 32 768 tokens de la base sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio no registra descargas ni actividad de la comunidad.
- Uso militar: la model card describe aplicaciones en vehículos autónomos armados y guerra electrónica; el despliegue en esos contextos exige cumplimiento normativo propio y no está respaldado por evaluaciones de seguridad publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/bahattinyunus/kam-coder-7b-gguf
- Repositorio GitHub del proyecto KAM: https://github.com/bahattinyunus/kam
- Perfil del autor en GitHub: https://github.com/bahattinyunus
- Modelo base declarado (Qwen 2.5 Coder 7B): no se proporciona enlace directo en la información disponible
- Repositorios relacionados de la familia KAM: https://huggingface.co/bahattinyunus/kam-7b-gguf, https://huggingface.co/bahattinyunus/kam-r1-gguf, https://huggingface.co/bahattinyunus/kam-apex-8b-gguf
- Papers, blogs o demos adicionales: no disponibles
