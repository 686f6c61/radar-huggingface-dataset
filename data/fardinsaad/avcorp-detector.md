# fardinsaad/AVCORP-detector

## Resumen

AVCORP-detector es una coleccion de adaptadores LoRA publicados por el usuario fardinsaad sobre el modelo base Qwen/Qwen3-8B. No se trata de un modelo entrenado desde cero, sino de un ajuste fino orientado a una tarea muy concreta: actuar como "detector" (rol de Investigator) en el juego social de deduccion *Avalon*. El adaptador lee el historial de una ronda, genera una traza de razonamiento basada en teoria de la mente (Theory of Mind) y nombra a los jugadores que considera del bando Evil.

El modelo forma parte del trabajo AVCORP (Identifying and Resisting Deception via Communication Theory and Theory of Mind), que estudia la deteccion y resistencia a la decepcion combinando teoria de la comunicacion y teoria de la mente. El repositorio incluye varias configuraciones de adaptadores (SFT y SFT+GRPO) con distintas variantes de etiquetas y funciones de recompensa.

Es relevante por su enfoque metodologico: demuestra como un modelo de 8B parametros puede mejorar sustancialmente en una tarea de razonamiento social mediante SFT seguido de GRPO (aprendizaje por refuerzo con TRL), pasando de un 48% a un 72% de exact match en la configuracion principal. Su ambito es acotado: investigacion en deteccion de engaño y razonamiento multiagente, no uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B) con adaptadores LoRA |
| Parametros totales | 8B (modelo base); adaptadores LoRA de rango 32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-8B) |
| Tipos de cuantizacion | no disponible (los adaptadores se publican en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer decoder-only. Sobre el se aplican adaptadores LoRA de rango 32, alpha 64 y dropout 0.05, aplicados a todas las capas lineales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se realizo en una unica NVIDIA H100.

El proceso de entrenamiento consta de dos fases: primero SFT (supervised fine-tuning) y despues GRPO mediante TRL. El dataset es fardinsaad/AVCORP. Se publican varias configuraciones que combinan dos variantes de salida (solo traza de razonamiento, o traza mas etiquetas de tactica) y dos funciones de recompensa (original y revisada). La innovacion tecnica destacable es el uso de GRPO sobre una tarea de razonamiento social con recompensa basada en el acierto de la deduccion final, lo que mejora de forma notable el exact match en las variantes con recompensa revisada.

## Capacidades

- Generacion de texto y razonamiento estructurado en el dominio del juego Avalon.
- Generacion de trazas de razonamiento basadas en teoria de la mente (Theory of Mind) sobre el historial de una ronda.
- Deteccion de decepcion: identifica jugadores del bando Evil a partir de la discusion e historial.
- Etiquetado de tacticas de comunicacion (en las variantes `tactic-*`).
- Razonamiento multi-paso dentro de una partida, con prompts que incluyen las trazas previas del propio detector.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes generales: no disponible (el uso agentico se limita al rol de Investigator en Avalon).
- Capacidades multilingues: solo ingles.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio especificos mas alla del razonamiento textual.

## Casos de uso

- Investigacion en deteccion de engaño: usar el adaptador como linea base reproducible para experimentos sobre decepcion en juegos sociales, comparando SFT frente a SFT+GRPO con las recompensas original y revisada.
- Evaluacion de teoria de la mente en LLM: emplear las trazas generadas para analizar como el modelo infiere intenciones de otros agentes a partir de la comunicacion.
- Agente Investigator en partidas de Avalon simuladas: integrar el adaptador en un entorno de juego para que actue como jugador que deduce y acusa a los Evil.
- Estudio de aprendizaje por refuerzo con GRPO: reutilizar la configuracion (TRL, recompensa por exact match) como plantilla para otras tareas de razonamiento con verificacion automatica.
- Analisis de tacticas de comunicacion: en las variantes `tactic-*`, extraer etiquetas de tactica para estudiar patrones de persuasion y engaño en las discusiones.
- Reproduccion de experimentos academicos: cargar los adaptadores con PEFT sobre Qwen3-8B y ejecutar el script de evaluacion del repositorio para replicar los resultados publicados.

## Benchmarks y rendimiento

Metrica: exact match, entendido como la proporcion de las 25 partidas de AVCORP reservadas (held-out) en las que la deduccion final nombra correctamente a ambos jugadores Evil.

| Configuracion | Sin entrenar | SFT | SFT + GRPO |
|---|---|---|---|
| Run 7: `tactic-revised` (mejor) | 48% | 48% | 72% |
| Run 6: `tactic-original` | 48% | 52% | 48% |
| Run 5: `trace-revised` (media de 3 semillas) | 24% | 38,7% | 64,0% |
| Run 4: `trace-original` (media de 3 semillas) | 24% | 36,0% | 33,3% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-8B en bfloat16 requiere aproximadamente 16 GB de VRAM; los adaptadores LoRA anaden una cantidad marginal. Con cuantizacion de 4 bits el base puede reducirse a unos 5-6 GB, aunque la cuantizacion no se documenta en la ficha.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA H100. Para inferencia, una A100 o H100 ofrecen margen amplio; una RTX 4090 (24 GB) es suficiente para el base en bfloat16.
- Cabe en GPU de consumo: si, en tarjetas con al menos 16 GB de VRAM en bfloat16 (por ejemplo RTX 4090) o menos con cuantizacion del base.
- Opciones de despliegue: transformers + PEFT (metodo documentado en la model card). No se documentan vLLM, llama.cpp, Ollama ni TGI para estos adaptadores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia estructural, el adaptador se apoya en Qwen3-8B y podria compararse con otros ajustes LoRA sobre el mismo base, pero no se aportan cifras de terceros.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AVCORP-detector (Qwen3-8B + LoRA) | 8B | no disponible | 72% exact match (mejor config.) | apache-2.0 | HuggingFace (adaptadores) |
| Qwen3-8B (base, sin adaptar) | 8B | no disponible | 48% exact match en la tarea | apache-2.0 | HuggingFace |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: el adaptador esta entrenado exclusivamente para el rol de Investigator en Avalon; no es un modelo de proposito general.
- Solo ingles: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion: al generar trazas de razonamiento y acusaciones, puede producir deducciones plausibles pero incorrectas; el exact match del mejor modelo es del 72%, lo que implica un 28% de fallo.
- Evaluacion sobre solo 25 partidas held-out, lo que limita la robustez estadistica de las cifras; las variantes con semillas muestran alta varianza (por ejemplo, `trace-original` cae a 33,3% con GRPO).
- Dependencia del prompt y del historial: la evaluacion incluye las trazas previas del propio detector, por lo que el rendimiento puede degradarse fuera de ese formato.
- Licencia apache-2.0 en los adaptadores, pero el uso comercial debe verificar tambien la licencia del modelo base Qwen3-8B.
- No se documentan sesgos especificos, pero al operar sobre texto de discusion de jugadores puede heredar sesgos del corpus AVCORP y del base.
- No hay informacion sobre cuantizacion oficial ni soporte en motores de inferencia de alto rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fardinsaad/AVCORP-detector
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset: https://huggingface.co/datasets/fardinsaad/AVCORP
- Codigo, corpus y prompts: https://github.com/fardinsaad/_AVCORP_
