# Adonis3039/EviSuff-EvidencePlanner-8B

## Resumen

EviSuff-EvidencePlanner-8B es un conjunto de adaptadores LoRA (PEFT) sobre el modelo base Qwen/Qwen3-8B, desarrollado por Adonis3039 como parte del trabajo de investigación EviSuff: Learning When Evidence Is Enough for Deep-Search Agents. El objetivo es enseñar a agentes de búsqueda profunda (deep-search) a decidir cuándo la evidencia recopilada es suficiente para responder, evitando tanto la recopilación excesiva como el cese prematuro. El modelo se publica en tres variantes de adaptadores —answer-sft (calentamiento de respuesta), no-gate (ajuste de proceso sin muestras de decisión de parada) y full-evisuff (ajuste con supervisión de decisión de parada)— que deben cargarse en un orden específico sobre el modelo base. Cada adaptador tiene 174.587.904 parámetros entrenables con LoRA rank 64, alpha 128 y dropout 0.05. La longitud de contexto varía según la etapa: 8.192 tokens para answer-sft y 40.960 tokens para las variantes de segunda etapa. La relevancia del modelo reside en su enfoque en la suficiencia de evidencia, un problema crítico para agentes autónomos de investigación, y en la publicación de resultados de evaluación en el benchmark EviSuff-BoundaryBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) con adaptadores LoRA (PEFT) |
| Parametros totales | 8B (base) + 174.587.904 entrenables por adaptador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (answer-sft); 40.960 tokens (no-gate y full-evisuff) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (heredados de Qwen3-8B) |
| Licencia | No disponible (pendiente; base Qwen3-8B bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptadores) + config PEFT |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-8B, un transformer de decodificación autoregresiva. Sobre él se aplican adaptadores LoRA con r=64, alpha=128, dropout=0.05, sin bias, y todas las capas de proyección lineal como objetivos. El entrenamiento se realiza en dos etapas: primero se aplica el adaptador answer-sft (5.223 muestras de entrenamiento, 530 de validación, longitud máxima 8.192, 2 épocas, lr 1e-4, acumulación de gradientes 4, 1.306 pasos) y se fusiona con el modelo base; después se aplica el adaptador no-gate (15.247 muestras, 1.714 de validación, longitud máxima 40.960, lr 2e-5, 2.058 pasos) o full-evisuff (16.462 muestras, 1.846 de validación, longitud máxima 40.960, lr 2e-5, 1 época, 2.058 pasos). El entrenamiento usa bfloat16 y gradient checkpointing, con semilla 42. La innovación técnica principal es la supervisión de decisión de parada (gate-decision) en el adaptador full-evisuff, que enseña al agente a evaluar la suficiencia de la evidencia. No se distribuyen los datos de entrenamiento ni las trayectorias de los profesores.

## Capacidades

- Generación de texto para agentes de búsqueda profunda, con foco en la evaluación de suficiencia de evidencia.
- Razonamiento sobre cuándo detener la recopilación de evidencia (gate-decision), mediante el adaptador full-evisuff.
- Soporte de integración en pipelines de deep-search que requieren búsqueda, citación y parada.
- Tres adaptadores separados que permiten analizar por separado la supervisión de respuesta (answer-sft), el ajuste de proceso sin decisiones de parada (no-gate) y el ajuste con decisiones de parada (full-evisuff).
- Capacidad de abstinencia: el adaptador full-evisuff abstiene más a menudo en SEAL-HARD, lo que puede ser útil para evitar respuestas con evidencia insuficiente.
- No se especifican capacidades de tool calling, visión o audio en la información disponible.

## Casos de uso

- Investigación académica sobre suficiencia de evidencia: el modelo permite reproducir los experimentos de EviSuff y analizar cómo la supervisión de decisiones de parada afecta al comportamiento del agente.
- Desarrollo de agentes de deep-search con parada adaptativa: integrar el adaptador full-evisuff en un pipeline que recopila evidencia web y decide cuándo detenerse, reduciendo costes de búsqueda.
- Análisis de supervisión de respuesta y herramientas: comparar las variantes answer-sft, no-gate y full-evisuff para estudiar el efecto de la supervisión de respuesta frente a la de proceso.
- Evaluación de estrategias de abstinencia: en tareas donde la evidencia es escasa, el adaptador full-evisuff puede abstenerse de responder, lo que resulta útil en sistemas de QA con umbrales de confianza.
- Pruebas de humo de integración LoRA: el script load_model.py permite verificar rápidamente que la secuencia de carga de adaptadores sobre Qwen3-8B funciona correctamente.
- Investigación en seguridad de agentes: estudiar cuándo un agente debe dejar de buscar evidencia para evitar acciones autónomas potencialmente dañinas.

## Benchmarks y rendimiento

| Sistema | CSR | SPC | U-Cal | Stop | O |
|---|---|---:|---:|---:|---:|
| Answer-SFT | 33.923 | 38.217 | 43.312 | 28.025 | 0.694 |
| No-gate | 39.155 | 43.312 | 48.408 | 35.669 | 0.708 |
| Full EviSuff | 49.257 | 50.318 | 56.051 | 57.962 | 0.734 |

En SEAL-HARD, la precisión compatible con la evaluación oficial es 6.693% para No-gate y 9.449% para Full EviSuff. El adaptador Full EviSuff también abstiene más a menudo. No se han publicado resultados de benchmarks con modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que el modelo base es de 8B parámetros en bfloat16, se estiman al menos 16 GB de VRAM para cargar los pesos sin cuantizar; los adaptadores añaden un coste marginal. El script de carga no cuantiza por defecto.
- GPU recomendadas: A100 40GB, H100, RTX 4090 (16-24 GB) para inferencia sin cuantizar.
- Compatibilidad con GPU de consumo: sí, en GPUs con 16-24 GB de VRAM (por ejemplo, RTX 4080/4090). No se documenta soporte para cuantización que permita ejecutarlo en 12 GB.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El repositorio proporciona un script Python (scripts/load_model.py) que carga los adaptadores con Transformers/PEFT.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas con modelos externos en la información disponible. La única comparación disponible es interna entre los tres adaptadores del propio modelo, recogida en la sección de benchmarks. El modelo base sin ajustar (Qwen3-8B) se menciona en la evaluación como el sistema que conserva el mayor CSR, pero no se proporcionan sus métricas numéricas.

## Limitaciones y advertencias

- Sesgos: no especificados, pero los adaptadores pueden heredar sesgos de Qwen3-8B y de las trayectorias de entrenamiento.
- Riesgo de alucinación: el modelo no garantiza factualidad, evidencia completa ni uso autónomo seguro.
- Limitaciones de evaluación: los resultados cubren una sola familia de modelos base y un conjunto held-out con desequilibrios; no se distribuyen los datos de entrenamiento ni las anotaciones de test.
- Restricciones de licencia: la licencia de los pesos del adaptador está pendiente de confirmación (LICENSE_PENDING.md); no se debe hacer público el repositorio ni usar los pesos en producción hasta resolverla. La licencia Apache 2.0 se aplica al modelo base, no automáticamente a los adaptadores.
- Dependencia del runtime: el funcionamiento correcto requiere el entorno de búsqueda, citación y gate; una consulta de texto aislada es solo una prueba de humo.
- Evidencia dinámica: la evidencia web puede cambiar después del entrenamiento y la evaluación, lo que puede degradar el rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Adonis3039/EviSuff-EvidencePlanner-8B
- Repositorio incluye: scripts/load_model.py, scripts/validate_release.py, training_configs/, checksums.sha256, LICENSE_PENDING.md (no se proporcionan URLs externas adicionales).
