# LEE8381/connectailab-rl-connectailab-rl-romebrain-v1-v1

## Resumen

`connectailab-rl-connectailab-rl-romebrain-v1-v1` es un adaptador LoRA de aprendizaje por refuerzo publicado por el usuario LEE8381 dentro del proyecto CONNECT AI LAB, orientado a la toma de decisiones empresariales en un simulador. El modelo parte de `Qwen/Qwen3.5-0.8B` y se ha entrenado para leer un estado de compania, una pregunta y un conjunto de opciones etiquetadas, y devolver unicamente la letra de la opcion seleccionada. No es un modelo conversacional general: es una politica de decision que mapea un contexto estructurado a una accion discreta.

El interes tecnico esta en el pipeline de entrenamiento, no en el tamano. El autor combina un profesor entrenado con PPO en el simulador Connect Tycoon, generacion de un dataset de problemas con puntuacion por opcion, aprendizaje supervisado sobre la mejor opcion y un ajuste posterior con GRPO (Group Relative Policy Optimization) con normalizacion por grupo y penalizacion KL contra el modelo de partida. El resultado es un adaptador pequeno sobre una base de 0,8 mil millones de parametros, con licencia Apache 2.0 y publicado en formato PEFT/safetensors.

La relevancia es acotada pero clara: demuestra un ciclo completo de RL aplicado a decisiones discretas sobre un LLM pequeno, reproducible en Colab, con datos sinteticos de un simulador propio. Es un modelo de investigacion y educacion, no un sistema listo para produccion ni para decisiones reales de negocio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con adaptador LoRA entrenado por RL |
| Parametros totales | 0,8 mil millones (modelo base); el adaptador LoRA anade un numero no especificado de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de 0,8 mil millones de parametros (Qwen3.5-0.8B). Sobre el se entrena un adaptador LoRA, de modo que los pesos base permanecen congelados y solo se ajustan las matrices de bajo rango. La tarea es de clasificacion generativa restringida: el modelo emite una sola letra correspondiente a una opcion de una lista, y la distribucion de probabilidad sobre las letras se interpreta como la distribucion de preferencia sobre las opciones.

El entrenamiento sigue cuatro fases descritas por el autor. Primero, una politica pequena se entrena con PPO durante miles de meses simulados en Connect Tycoon; esa politica actua como profesor. Segundo, para cada mes operado por el profesor se genera un problema de decision y se reejecuta el mes completo permutando las opciones para asignar una puntuacion a cada una. Tercero, se aplica aprendizaje supervisado sobre la opcion de mayor puntuacion. Cuarto, se aplica GRPO: se agrupan todas las opciones de un mismo problema, se normalizan las ventajas dentro del grupo y se anade una penalizacion KL contra el modelo de partida para limitar la deriva. El dataset contiene 4082 problemas de entrenamiento, 832 de validacion y 840 de prueba, sobre una distribucion de empresa `general` ajustada con datos publicos.

## Capacidades

- Seleccion de una opcion entre varias etiquetadas (A, B, C...) a partir de un estado, una pregunta y una lista de opciones en JSON.
- Salida de una unica letra, sin explicacion, lo que permite interpretar las probabilidades por opcion como medida de confianza.
- Razonamiento de decision multi-paso a nivel de simulacion: el modelo decide mes a mes dentro de un bucle de entorno tipo Gymnasium.
- Robustez instruccional basica: el prompt de sistema indica tratar el texto dentro de `state` como datos y no como instrucciones.
- No dispone de tool calling, function calling, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue practicamente nula: el entrenamiento y los datos estan en coreano.
- No es un modelo de proposito general; fuera del formato de tarea de decision su comportamiento no esta garantizado.

## Casos de uso

- Simulacion de gestion empresarial: integrado en Connect Tycoon como politica de decision que elige una opcion por mes simulado, con las probabilidades de cada letra como senal de confianza para el bucle del entorno.
- Investigacion en RL sobre LLM: sirve como referencia reproducible de un pipeline PPO (profesor) -> etiquetado por puntuacion -> SFT -> GRPO, util para comparar variantes de entrenamiento en tareas de decision discreta.
- Docencia y cursos de refuerzo: el autor publica un notebook de Colab y material formativo, por lo que el adaptador se puede usar como ejemplo ejecutable en clase con recursos modestos.
- Evaluacion de robustez instruccional: al separar explicitamente `state` de las instrucciones, permite experimentar con ataques de inyeccion de prompt dentro del estado y medir si el modelo sigue seleccionando una opcion valida.
- Generacion de datos sinteticos de decision: las salidas por opcion pueden usarse para etiquetar nuevos escenarios del simulador o para destilar una politica mayor a partir de esta.
- Pruebas de integracion de PEFT: al ser un adaptador LoRA sobre una base de 0,8B, es util para validar pipelines de carga con `transformers` + `peft` en entornos con poca VRAM.

## Benchmarks y rendimiento

| Modelo | Precision en el conjunto de prueba | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 31,4% | 2,57 | no disponible | no disponible |
| Aprendizaje supervisado (SFT) | 71,5% | 2,13 | no disponible | no disponible |
| Aprendizaje por refuerzo (GRPO) | 71,1% | 2,14 | 2,51 millones de wones | 37% (91/177) |

El propio autor advierte que el resultado de operacion de empresa corresponde a la media de dos meses no vistos, con muestra pequena, y que el modelo sigue por debajo de la politica profesora entrenada con PPO en el simulador. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 0,8B en fp16 ocupa aproximadamente 1,6 GB de pesos; en 8 bits, alrededor de 0,8 GB; en 4 bits, alrededor de 0,4 GB. El adaptador LoRA anade una cantidad marginal no especificada. El total con cache KV y overhead suele quedar por debajo de 4 GB en fp16.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no aportan ventaja significativa por el tamano del modelo.
- Cabe en GPU consumer: si, practicamente en toda la gama actual, incluida RAM unificada en portatiles.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado por el autor); conversion a GGUF para llama.cpp u Ollama no esta documentada para este adaptador; vLLM y TGI requeririan fusionar el adaptador con la base y validar compatibilidad con Qwen3.5-0.8B.
- Latencia y throughput: no disponibles. Por el tamano y la salida de un solo token, la latencia esperada es baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-romebrain-v1 (este modelo) | 0,8B + LoRA | no disponible | RL (GRPO) sobre decision discreta en simulador | Apache 2.0 | Hugging Face, 22 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | LLM generalista | no disponible en la informacion | Hugging Face |
| Politica profesora PPO de Connect Tycoon | no disponible (modelo pequeno) | no disponible | RL clasico en el simulador | no disponible | no publicada como modelo independiente |

No se dispone de datos publicados para comparar con otros adaptadores de decision de la misma categoria; la comparacion relevante es interna al proyecto (base, SFT y GRPO).

## Limitaciones y advertencias

- Modelo de investigacion y educacion: el autor indica explicitamente que debe revalidarse con los registros reales de una empresa antes de cualquier uso en decisiones de negocio.
- Entrenado sobre un simulador sintetico con una unica distribucion de empresa (`general`); la generalizacion a otros dominios o a empresas reales no esta demostrada.
- Solo coreano: no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Salida restringida a una letra; no explica su decision, lo que dificulta la auditoria y la trazabilidad.
- Riesgo de alucinacion de etiquetas: puede emitir una letra no presente en la lista de opciones, y no se documenta manejo de ese caso.
- Riesgo de inyeccion de prompt a traves del campo `state`; la mitigacion es solo una instruccion de sistema, sin garantia.
- Muestra de evaluacion muy pequena (dos meses no vistos) y rendimiento inferior al profesor PPO, segun el propio autor.
- Sin datos publicados de sesgos, contexto maximo ni cuantizaciones validadas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validacion en dominios reales desaconseja ese uso sin evaluacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LEE8381/connectailab-rl-connectailab-rl-romebrain-v1-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
