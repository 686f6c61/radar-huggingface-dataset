# anezatra/qwen3.5-9b-heretic-t1-100-gguf-axiotron-cyber

## Resumen

Qwen3.5 9B T1-100 AXIOTRON es una publicacion preliminar de tipo GGUF derivada del modelo ajustado por supervisión (SFT) `anezatra/qwen3.5-9b-heretic-cybersec-sft-100k`, a su vez construido sobre la familia Qwen3.5 9B. El autor, anezatra, lo presenta como un artefacto de investigacion dentro de la iniciativa AXIOTRON, orientada al desarrollo de un agente autonomo de investigacion en ciberseguridad con razonamiento estructurado y coordinacion con herramientas externas. No es el checkpoint final del proyecto: el entrenamiento principal, sobre unas 250.000 muestras, sigue en curso y este lanzamiento corresponde solo a la version fusionada de 100.000 ejemplos.

El modelo cuenta con 8.953.803.264 parametros totales (aproximadamente 9B) y se distribuye unicamente en formato GGUF con cuantizacion Q4_K_M, en un unico archivo de unos 5,68 GB. La model card no documenta la longitud de contexto nativa, los idiomas soportados ni la licencia, y el autor advierte explicitamente que se trata de una "research preview" sin garantias de rendimiento, autonomia o fiabilidad en seguridad.

Su relevancia es acotada pero concreta: ofrece un punto de partida ejecutable en local, via llama.cpp, para experimentar con un modelo especializado en dominios de ciberseguridad (triaje de vulnerabilidades, analisis defensivo, evaluacion autorizada) antes de que exista el checkpoint completo de 250K ejemplos. La ausencia de benchmarks publicados y de licencia clara limita seriamente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5 9B); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; la model card usa 4096 tokens como valor conservador de arranque, no como limite verificado |
| Tipos de cuantizacion | Q4_K_M (unica publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3.5-9b-cybersec-Q4_K_M.gguf`, ~5,68 GB / 5,29 GiB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con aproximadamente 9B parametros, afinado mediante SFT sobre un corpus de 100.000 ejemplos orientados a ciberseguridad (el checkpoint base `qwen3.5-9b-heretic-cybersec-sft-100k`). La model card no detalla la composicion del dataset, el numero de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. El proyecto AXIOTRON en su conjunto aspira a entrenar sobre unas 250.000 muestras heterogeneas para reforzar conocimiento de dominio y razonamiento multi-paso; este lanzamiento es solo un subconjunto previo de ese esfuerzo.

En el plano tecnico, la exportacion a GGUF verifico la plantilla de chat original y los metadatos EOS/BOS. La prediccion multi-token (MTP) quedo excluida de esta exportacion y podria entrenarse y exportarse por separado. El autor advierte que Q4_K_M es una cuantizacion con perdida y recomienda evaluar la calidad frente al checkpoint fusionado en precision completa. No se documentan innovaciones adicionales como atencion lineal, decodificacion especulativa o modos de pensamiento explicitos.

## Capacidades

- Generacion de texto conversacional y razonamiento de dominio, con enfasis declarado en ciberseguridad (analisis defensivo, triaje de vulnerabilidades, evaluacion autorizada).
- Razonamiento multi-paso orientado a investigacion, segun la descripcion del proyecto AXIOTRON.
- Integracion con tooling externo y flujos de agente: la model card menciona "coordinacion fiable con herramientas externas" como objetivo de diseno, aunque no se aporta evidencia de evaluacion.
- Servido mediante API local compatible con OpenAI a traves de `llama-server` (`/v1`), lo que permite integrarlo en pipelines existentes.
- Capacidades multilingues: no disponibles (no se documentan idiomas).
- Vision, audio, modo thinking explicito o function calling nativo: no disponibles en la informacion proporcionada.

## Casos de uso

- Triaje de vulnerabilidades en entornos autorizados: el modelo puede resumir y clasificar hallazgos de escaneos, priorizar candidatos y redactar notas de analisis; su ajuste SFT sobre 100K ejemplos de ciberseguridad lo hace mas adecuado que un modelo generalista para este vocabulario, aunque toda conclusion debe reproducirse manualmente.
- Analisis defensivo y respuesta a incidentes: generacion de hipotesis iniciales, resumen de indicadores y borradores de informes, ejecutandose en local via `llama-server` para evitar enviar datos sensibles a APIs externas.
- Laboratorios de investigacion en seguridad: banco de pruebas para estudiar como un modelo de 9B cuantizado en Q4_K_M se comporta en tareas de razonamiento tecnico, comparando su salida con el checkpoint fusionado sin cuantizar.
- Asistente local en estaciones de trabajo de analistas: con 5,68 GB de pesos, puede desplegarse en portatiles y equipos de escritorio con GPU de consumo, manteniendo el trafico de datos dentro de la red del laboratorio.
- Prototipado de agentes con memoria persistente: combinado con capas externas como SKMR-Router (proyecto separado del mismo ecosistema), para explorar continuidad de contexto entre sesiones de investigacion.
- Generacion de documentacion tecnica de seguridad: borradores de politicas, checklists y guias de hardening a partir de prompts estructurados, con revision humana obligatoria.
- Formacion y simulacion: ejercicios de mesa sobre escenarios de incidentes en entornos controlados, donde el modelo actua como interlocutor tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no formula afirmaciones de rendimiento, autonomia o fiabilidad sin evaluacion controlada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB con Q4_K_M (pesos de 5,68 GB mas cache KV y overhead). Con contexto de 4096 tokens el consumo adicional es modesto; contextos mayores incrementan la memoria de forma proporcional.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para offload completo (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090, A100, H100). En GPUs con menos memoria puede hacerse offload parcial de capas con `-ngl`.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores con cuantizacion Q4_K_M; en 6 GB requeriria offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con endpoint compatible OpenAI en `/v1`), compilaciones con backend CUDA (`-ngl 99`) o CPU. vLLM, TGI y Ollama no se mencionan en la informacion disponible, aunque Ollama podria importar el GGUF.
- Latencia y throughput: no disponibles; dependen del hardware, del backend y de la longitud de contexto. La model card solo indica que la velocidad real la determinan la memoria disponible y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5 9B T1-100 AXIOTRON (este) | ~8,95B | no disponible | GGUF Q4_K_M | no disponible | Preview de investigacion, sin benchmarks |
| `anezatra/qwen3.5-9b-heretic-cybersec-sft-100k` (base) | ~8,95B | no disponible | pesos fusionados (no confirmado) | no disponible | Checkpoint SFT del que deriva este GGUF; referencia para evaluar la perdida por cuantizacion |
| Qwen3.5 9B (modelo original de la familia) | ~9B | no disponible en esta informacion | safetensors / GGUF segun distribucion oficial | no disponible en esta informacion | Modelo generalista sin ajuste de ciberseguridad; comparacion de referencia para medir la especializacion |

No se dispone de datos de benchmarks ni de especificaciones oficiales de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Modelo en desarrollo: el autor lo describe como "research preview" y advierte que el entrenamiento principal (250K ejemplos) sigue en curso; este checkpoint no representa el estado final del proyecto.
- Sin benchmarks ni evaluacion controlada: no hay evidencia publicada de rendimiento, autonomia o fiabilidad en tareas de seguridad.
- Riesgo alto de alucinacion tecnica: la model card advierte que puede producir conclusiones tecnicas incompletas, inexactas o no verificadas; todo hallazgo debe reproducirse y revisarse de forma independiente.
- Cuantizacion con perdida: Q4_K_M degrada la calidad respecto al checkpoint fusionado; el autor recomienda comparar salidas antes de adoptarlo.
- Licencia no disponible: sin terminos explicitos no puede asumirse uso comercial; es un bloqueo para produccion.
- Idiomas y contexto no documentados: no se puede planificar un despliegue multilingue ni con ventanas largas sin verificacion empirica.
- Uso dual: el ajuste en ciberseguridad exige restringir su uso a entornos con autorizacion explicita; el autor prohibe tratar las salidas como evidencia de vulnerabilidades reales o conceder privilegios operativos sin supervision.
- MTP excluido de la exportacion: si el modelo base lo usa, esta version no se beneficia de esa capacidad.
- Repositorio potencialmente privado: las instrucciones de descarga mencionan acceso autenticado al Hub, lo que puede limitar la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anezatra/qwen3.5-9b-heretic-t1-100-gguf-axiotron-cyber
- Modelo base (SFT 100K): https://huggingface.co/anezatra/qwen3.5-9b-heretic-cybersec-sft-100k
- Perfil del autor: https://huggingface.co/anezatra
- Repositorio del proyecto SKMR-Router: https://github.com/agena-tech/skmr-router
- llama.cpp (releases): https://github.com/ggml-org/llama.cpp/releases
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
