# Rachitvig/qwen25-coder-1.5b-cli-sft-experimental

## Resumen

Qwen2.5-Coder-1.5B CLI es un modelo experimental publicado por el usuario Rachitvig en Hugging Face, construido mediante un ajuste fino supervisado (SFT) con LoRA sobre Qwen2.5-Coder-1.5B-Instruct. Su objetivo concreto es traducir instrucciones en lenguaje natural a comandos de shell de Linux, una tarea de generacion de codigo muy especifica que el modelo base no cubre de forma optimizada. El modelo tiene 1.543.714.304 parametros (~1,54 mil millones) y se distribuye bajo licencia Apache 2.0.

Se trata de un experimento de un solo autor, con 0 descargas y 0 likes en el momento de la consulta, y el propio autor lo etiqueta explicitamente como "experimental" y "no listo para produccion". El ajuste se realizo con 40.634 muestras durante una sola epoca, con 36,93 millones de parametros entrenables (2,34% del total), y se publica principalmente en formato GGUF con cuantizacion Q4_K_M.

La relevancia es limitada pero ilustrativa: sirve como referencia para quienes quieran evaluar el ajuste fino de modelos pequenos de codigo orientado a tareas de administracion de sistemas, y como ejemplo de las limitaciones de las metricas de exact-match en generacion de comandos. No es un modelo para desplegar en produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun tag `qwen2`) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repo incluye pesos safetensors del modelo ajustado |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-Coder es multilingue, pero no se documenta en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF (Q4_K_M) |
| Parametros entrenables (LoRA) | 36,93 M (2,34%) |
| Tamano del repo | 1,0 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de la familia Qwen2, y se ajusta mediante SFT con adaptadores LoRA. El entrenamiento utilizo 40.634 muestras durante una unica epoca, con 36,93 millones de parametros entrenables (2,34% del total), lo que indica un ajuste de bajo rango sobre el modelo base. La perdida de entrenamiento final registrada fue de 0,7867. No se documentan detalles sobre la composicion del dataset, la longitud de las secuencias, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO; el autor menciona como trabajo futuro la optimizacion por preferencias y experimentos de aprendizaje por refuerzo.

La innovacion tecnica es modesta: se trata de un ajuste de dominio para generacion de comandos Linux, no de una arquitectura nueva. El resultado reportado es un incremento de la precision exact-match del 11% al 18% (+7 puntos porcentuales) sobre el benchmark propio del experimento. El autor advierte explicitamente que esta metrica no mide equivalencia funcional de los comandos.

## Capacidades

- Generacion de comandos de shell de Linux a partir de instrucciones en lenguaje natural.
- Comprension de tareas comunes de linea de comandos.
- Asistencia basica en administracion de sistemas Linux.
- Generacion de codigo en general, heredada del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Soporte de conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Generacion asistida de comandos para administracion de Linux: el modelo traduce una instruccion como "lista los archivos modificados en las ultimas 24 horas" a un comando de shell, util como borrador que el operador revisa antes de ejecutar.
- Formacion y documentacion tecnica: sirve para generar ejemplos de comandos en tutoriales o materiales didacticos, siempre con revision humana dado su caracter experimental.
- Prototipado de asistentes de terminal: puede integrarse en un CLI interactivo que sugiera comandos al usuario, con validacion previa obligatoria.
- Investigacion sobre ajuste fino de modelos pequenos de codigo: como referencia reproducible de un pipeline SFT + LoRA sobre Qwen2.5-Coder-1.5B con resultados medibles.
- Evaluacion de metricas de exact-match: util para estudiar por que la precision exacta no captura la equivalencia funcional en generacion de comandos.
- Base para experimentos de seguridad de comandos destructivos: el autor planea evaluaciones de seguridad; el modelo puede usarse como punto de partida para estudiar la generacion de comandos peligrosos y su mitigacion.
- Despliegue en entornos con recursos limitados: al ser un modelo de ~1,5 B en Q4_K_M, cabe en GPUs de consumo y puede ejecutarse en local para pruebas.

## Benchmarks y rendimiento

| Metrica | Baseline (Qwen2.5-Coder-1.5B-Instruct) | Modelo ajustado | Mejora |
|---|---:|---:|---:|
| Exact-match accuracy (benchmark del autor) | 11% | 18% | +7 pp |
| Perdida de entrenamiento final | No disponible | 0,7867 | No disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos anteriores proceden del benchmark propio del experimento y no miden equivalencia funcional ni fiabilidad de ejecucion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en cuantizacion Q4_K_M (pesos de ~1 GB mas overhead de contexto y KV cache); en FP16, en torno a 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; para Q4_K_M basta con GPUs de gama de entrada.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida, asi como en CPU.
- Opciones de despliegue: llama.cpp y Ollama para el formato GGUF; vLLM y TGI para los pesos safetensors; transformers como libreria nativa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B CLI (este) | ~1,54 B | No disponible | Apache 2.0 | Safetensors, GGUF | Ajuste experimental para comandos Linux; exact-match 18% |
| Qwen2.5-Coder-1.5B-Instruct | ~1,54 B | No disponible | Apache 2.0 | Safetensors, GGUF | Modelo base; exact-match 11% en el benchmark del autor |
| Otros modelos de generacion de comandos | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo declara no listo para produccion.
- Precision exact-match del 18%: la mayoria de los comandos generados no coinciden exactamente con la referencia, y la metrica no mide equivalencia funcional.
- Riesgo de comandos incorrectos o destructivos: los comandos deben revisarse antes de ejecutarse; no hay garantia de seguridad.
- Sin evaluacion de seguridad: el autor reconoce que la evaluacion de comandos destructivos esta pendiente.
- Sin datos sobre sesgos, alucinacion o comportamiento multilingue.
- Sin datos sobre soporte de tool calling, agentes o contexto maximo.
- Licencia Apache 2.0: permite uso comercial, pero el estado experimental y la ausencia de garantias desaconsejan su uso en produccion sin validacion propia.
- Sin traccion comunitaria (0 descargas, 0 likes): no hay evidencia de uso ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rachitvig/qwen25-coder-1.5b-cli-sft-experimental
- Modelo base Qwen2.5-Coder-1.5B-Instruct: no disponible en la informacion proporcionada (referencia habitual: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct)
- Paper, blog, repositorio o demo: no disponibles en la informacion proporcionada.
