# Calm153/vitrion-qwen3-1.7b-qlora-n128

## Resumen

Vitrion Qwen3-1.7B es un adaptador QLoRA publicado por Calm153 sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo nuevo ni de un merge de pesos, sino del adaptador exacto (N=128) que el autor evaluó en su experimento. Su proposito es muy concreto: predecir decisiones de seguridad y el estado completo de una maquina ficticia a lo largo de una conversacion, donde el estado inicial se proporciona una unica vez y el modelo no recibe formulas, puntuaciones del simulador ni correcciones entre turnos.

El modelo aborda el problema del seguimiento de estado (state-tracking) en dialogos multi-turno: mantener y actualizar un estado interno coherente sin re-alimentar el estado en cada peticion. Es relevante como demostracion de que un ajuste fino ligero sobre un modelo pequeno de 1.7B parametros puede mejorar drasticamente una tarea estructurada y verificable, pasando de un 1.7% de adherencia exacta a la especificacion en el modelo base a un 70.6% con el adaptador.

La relevancia practica es limitada fuera del contexto del experimento: se trata de un benchmark ficticio, con un unico idioma (ingles), orientado a evaluacion y no a produccion. Aun asi, resulta interesante como caso de estudio de QLoRA aplicado a tareas de estado, con evidencia reproducible, hashes de pesos y codigo de evaluacion congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptador LoRA (QLoRA) |
| Parametros totales | 1.7B (modelo base); el adaptador es un conjunto de matrices LoRA de bajo rango |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | Entrenamiento e inferencia en NF4 (bitsandbytes, double quant, compute dtype float16); el adaptador en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere descargar por separado los pesos del base Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only. El entrenamiento es QLoRA con rango r=16, alpha=32, dropout 0.05, aplicado a todas las proyecciones lineales, con learning rate 2e-4, batch 2 y acumulacion de gradientes 8. El dataset es Calm153/vitrion-state-once-final: 128 conversaciones y 776 turnos supervisados, con dos epocas y semilla 42. El entrenamiento es assistant-target-only, es decir, solo se supervisan los turnos del asistente.

La innovacion metodologica esta en el planteamiento del problema: el estado inicial de la maquina ficticia aparece una sola vez al principio de la conversacion y el modelo debe mantenerlo y actualizarlo sin recibir el estado en cada turno, sin formulas ni puntuaciones del simulador. La evaluacion se realiza con decodificacion greedy, sin thinking, max 128 tokens nuevos e inferencia en NF4, sobre un conjunto congelado de 30 conversaciones y 180 turnos. El autor incluye hashes SHA-256 del adaptador, revisiones fijas del base y un bundle del codigo de evaluacion, lo que permite reproducir el experimento.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Seguimiento de estado (state-tracking): mantiene y actualiza el estado de una maquina ficticia a lo largo de la conversacion.
- Prediccion de decisiones de seguridad estructuradas y salida en JSON valido (el base fallaba en 140/180 turnos; el adaptador mejora sustancialmente la validez estructural).
- Recuperacion ante rechazos (robustness): subconjunto de 102 turnos de rejection-recovery.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso general; el modo thinking se desactiva explicitamente.
- No tiene capacidades de vision ni audio.
- Multilingue: no, solo ingles.

## Casos de uso

- Investigacion en state-tracking: reproduccion del experimento del autor para estudiar como un adaptador QLoRA pequeno mantiene estado en dialogos multi-turno, usando el codigo de evaluacion congelado y los hashes publicados.
- Evaluacion de tecnicas QLoRA: servir como referencia de configuracion (r=16, alpha=32, NF4, assistant-target-only) para comparar con otras variantes de ajuste fino en tareas estructuradas.
- Prototipado de dialogos con estado en dominios ficticios: simular conversaciones con una maquina o sistema cuyo estado debe actualizarse turno a turno, sin re-inyectar el estado en cada peticion.
- Generacion de JSON estructurado en conversacion: el adaptador mejora la adherencia a un esquema de salida frente al base, util como banco de pruebas para validacion de formato.
- Estudio de robustez ante rechazos: analizar como el modelo se recupera cuando el usuario rechaza o corrige una respuesta previa, usando el subconjunto de 102 turnos.
- Docencia y divulgacion: ejemplo didactico de como un ajuste fino ligero sobre un modelo de 1.7B transforma el rendimiento en una tarea verificable y acotada.
- Comparacion base vs tuned: el Space de demostracion permite contrastar directamente el comportamiento del modelo base y el adaptado en las mismas conversaciones.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto congelado de 30 conversaciones y 180 turnos (misma prompt estructurada, greedy, sin thinking, max 128 tokens, NF4):

| Modelo | Exact Spec adherence | Robustness | Full-conversation pass |
|---|---:|---:|---:|
| Base Qwen3-1.7B | 1.7% (3/180) | 2.9% (3/102) | 0% |
| Vitrion N=128 (adaptador) | 70.6% (127/180) | 64.7% (66/102) | 53.3% (16/30) |

Notas del autor: el base emitio JSON invalido en 140/180 turnos. Los 360 veredictos del juez informado coincidieron con el simulador deterministico, pero el juez ve el oraculo y explica su resultado, por lo que no es un oraculo de correccion independiente. El conjunto de evaluacion ya habia informado la seleccion de checkpoint. No existen escenarios de tipo staff (el usuario aclaro que era un descuido del PRD). El objetivo de fiabilidad del 100% no se alcanza.

## Requisitos de hardware

- VRAM estimada: el base de 1.7B en NF4 con double quant ocupa aproximadamente 1-2 GB de pesos; sumando activaciones y contexto, cabe holgadamente en GPUs de 8 GB. El adaptador anade un overhead minimo (repo de 0.1 GB).
- GPU recomendadas: cualquier GPU CUDA con al menos 8 GB de VRAM. El autor exige CUDA GPU y versiones fijadas en evidence/code/requirements.txt. Una RTX 3060/4060 de 8 GB es suficiente; A100/H100 no son necesarias.
- Cabe en GPU consumer: si, en RTX 3060, 4060, 4070, 4080, 4090 y equivalentes con 8 GB o mas.
- Opciones de despliegue: transformers + bitsandbytes + peft (flujo documentado por el autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador PEFT sobre un base de 1.7B, seria necesario convertir/mergear para otros runtimes, lo cual no esta documentado.
- Latencia y throughput: no disponibles en la informacion proporcionada. La generacion esta limitada a max_new_tokens=128 con decodificacion greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vitrion Qwen3-1.7B QLoRA N=128 | 1.7B (base) + adaptador LoRA | no disponible | State-tracking en dialogo ficticio, ingles | Apache 2.0 | Adaptador PEFT en HuggingFace |
| Qwen/Qwen3-1.7B (base) | 1.7B | no disponible | Generacion de texto general | Apache 2.0 | Pesos completos en HuggingFace |
| Qwen3-4B (familia Qwen3) | 4B | no disponible | Generacion de texto general, mayor capacidad | Apache 2.0 | Pesos completos en HuggingFace |

La comparacion directa mas relevante es contra el propio base Qwen3-1.7B, ya que el adaptador solo mejora en la tarea especifica de state-tracking (70.6% vs 1.7% de adherencia exacta) y no se han publicado comparaciones con otros adaptadores o modelos en esta tarea. No hay datos de benchmarks estandar (MMLU, HumanEval, GSM8K) para este adaptador.

## Limitaciones y advertencias

- El benchmark es ficticio y no es adecuado para control industrial ni para decisiones reales de seguridad.
- El objetivo de fiabilidad del 100% no se alcanza: full-conversation pass es del 53.3%.
- El conjunto de evaluacion ya habia informado la seleccion de checkpoint, por lo que los resultados pueden estar optimistamente sesgados.
- El juez que valida los veredictos ve el oraculo, por lo que no es un oraculo de correccion independiente.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- No existen escenarios de tipo staff en el dataset (descuido del PRD segun el autor).
- El autor advierte explicitamente de no reclamar un tamano minimo viable de dataset ni superioridad general frente a modelos frontera.
- Es un adaptador, no un modelo completo: requiere descargar el base y fijar revisiones concretas para reproducibilidad.
- No se documenta soporte para tool calling, agentes ni razonamiento multi-paso; el modo thinking debe desactivarse.
- Riesgo de alucinacion y sesgos: no documentados especificamente en la informacion disponible, pero aplicables al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el caracter ficticio y experimental del benchmark desaconseja su uso en produccion real.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Calm153/vitrion-qwen3-1.7b-qlora-n128
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset: https://huggingface.co/datasets/Calm153/vitrion-state-once-final
- Demo base vs tuned: https://huggingface.co/spaces/Calm153/vitrion-base-vs-tuned
