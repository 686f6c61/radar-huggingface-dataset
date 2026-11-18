# bhatraasim/qwen2.5-0.5b-gsm8k-grpo

## Resumen

`qwen2.5-0.5b-gsm8k-grpo` es un adaptador LoRA publicado por el usuario bhatraasim sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Se trata de la segunda etapa de un estudio de ajuste para razonamiento aritmetico: primero se aplico un SFT sobre trazas de un profesor de 7B y despues un entrenamiento con GRPO (Group Relative Policy Optimization) usando unicamente las respuestas correctas de GSM8K como senal de recompensa. El objetivo no es producir un solucionador de matematicas de proposito general, sino estudiar cuanto puede aportar el aprendizaje por refuerzo sobre un modelo de 0,5B de parametros ya ajustado por imitacion.

El modelo resuelve el problema de verificar la correccion de las soluciones en lugar de imitar un estilo fijo de traza: durante el GRPO la politica genera sus propias completaciones y se recompensa la exactitud contra la respuesta de entrenamiento de GSM8K, con un termino secundario de formato. El resultado es un adaptador que alcanza un 43,59% de exactitud en el split de test de GSM8K, solo 1,44 puntos por encima de la etapa SFT previa, lo que el propio autor califica de ganancia sugestiva pero no estadisticamente significativa con una sola semilla.

Por su tamano (0,5B parametros) y su naturaleza de adaptador LoRA, el interes practico es limitado: sirve como artefacto de investigacion reproducible sobre RL para matematicas a escala pequena, no como modelo de produccion. La relevancia actual esta en documentar con rigor metodologico (intervalos de Wilson, test de McNemar, recompensa estructural de formato) que el GRPO aporta poco cuando el SFT ya ha extraido la mayor parte de la senal disponible en un modelo tan pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | no disponible (adaptador LoRA sobre un base de 0,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite cuantizacion estandar de transformers) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (adaptador y modelo base); GSM8K es MIT |
| Formato de pesos | safetensors (adaptador LoRA via PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El entrenamiento consta de dos etapas encadenadas. La primera es un SFT sobre trazas generadas por un profesor de 7B, que eleva la exactitud en GSM8K del 16,83% del base al 42,15% y la conformidad de formato del 0,08% al 96,82%. La segunda etapa, la que produce este adaptador, aplica GRPO inicializando desde el adaptador SFT con `is_trainable=True`, usando solo los prompts de entrenamiento de GSM8K (sin trazas: la politica genera sus propias completaciones), 4 completaciones por prompt, learning rate 5e-6, una epoca y una penalizacion KL con β = 0,04 hacia la politica SFT.

La innovacion metodologica principal esta en el diseno de la recompensa: `1,0 × correccion + 0,2 × formato + parseabilidad de la respuesta`. El termino de formato es estructural, no basado en subcadenas: las etiquetas deben estar ancladas, aparecer una sola vez, no estar vacias y en orden, de modo que `<think></think><answer></answer>` no obtiene recompensa. La correccion pesa 5 veces mas que el formato para evitar que la politica optimice sintaxis sin resolver el problema. La verificacion de correccion se hace contra la respuesta de entrenamiento de GSM8K, lo que ensena a la politica *que* soluciones son correctas en lugar de imitar un estilo fijo.

## Capacidades

- Generacion de texto conversacional y razonamiento aritmetico de nivel escolar (problemas tipo GSM8K).
- Resolucion de problemas matematicos verbales con formato estructurado de etiquetas `<think>` y `<answer>`.
- Cumplimiento de formato estructural alto (98,41% de respuestas bien formadas en test).
- Generacion de cadenas de razonamiento paso a paso antes de emitir la respuesta final.
- Capacidades conversacionales heredadas del base Qwen2.5-0.5B-Instruct.
- No dispone de tool calling, function calling, vision, audio ni modo thinking nativo mas alla del formato de etiquetas.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Estudio reproducible de RL para matematicas: el adaptador y su evaluacion (intervalos de Wilson, McNemar) sirven como referencia metodologica para comparar SFT frente a GRPO en modelos pequenos, con dumps de evaluacion publicados en el repositorio de codigo del autor.
- Generacion de datos sinteticos de razonamiento aritmetico: a 0,5B y con formato estructurado, puede producir trazas etiquetadas para filtrar y aumentar datasets de entrenamiento de modelos mayores.
- Evaluacion de pipelines de recompensa: el diseno de recompensa estructural (anclaje, ocurrencia unica, orden de etiquetas) es reutilizable para probar implementaciones de GRPO sin depender de un modelo grande.
- Prototipado de asistentes de matematicas escolares en ingles: con 0,5B cabe en hardware modesto y ofrece respuestas con formato consistente, aunque con exactitud limitada (43,59%).
- Docencia e investigacion en ajuste fino: ejemplo completo de SFT + GRPO con LoRA sobre un base pequeno, util para cursos y talleres de RLHF/RLVR.
- Benchmark de infraestructura: al ser un adaptador de 0,1 GB sobre un base de 0,5B, sirve para validar pipelines de carga PEFT, evaluacion con decodificacion greedy y calculo de metricas de conformidad de formato.

## Benchmarks y rendimiento

GSM8K split de test, n = 1.319, decodificacion greedy, prompt etiquetado identico, `max_new_tokens=640`. Intervalos de confianza del 95% de Wilson.

| Etapa | Exactitud | Formato correcto | Tokens medios |
|---|---|---|---|
| Base Qwen2.5-0.5B-Instruct (prompt etiquetado) | 16,83% [14,91; 18,95] | 0,08% | 282,6 |
| + SFT sobre trazas de profesor 7B | 42,15% [39,51; 44,84] | 96,82% | 313,8 |
| + GRPO (este adaptador) | 43,59% [40,94; 46,28] | 98,41% | 309,8 |

Comparacion pareada sobre las mismas 1.319 preguntas entre SFT y GRPO: 69 problemas ganados, 50 perdidos, McNemar p ≈ 0,10 (sugestivo, no significativo con una sola semilla).

## Requisitos de hardware

- VRAM estimada: el adaptador pesa 0,1 GB; el base Qwen2.5-0.5B-Instruct en float16 ocupa aproximadamente 1 GB, por lo que la inferencia completa cabe en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada; tambien funciona en CPU para inferencia puntual.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos anos, e incluso en placas integradas con suficiente memoria.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor), llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF, y vLLM/TGI tras fusionar los pesos LoRA en el modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K test | Licencia | Formato |
|---|---|---|---|---|---|
| qwen2.5-0.5b-gsm8k-grpo (este) | 0,5B + LoRA | no disponible | 43,59% | Apache-2.0 | Adaptador PEFT |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible | 16,83% | Apache-2.0 | Safetensors |
| Qwen2.5-0.5B + SFT (etapa previa del autor) | 0,5B + LoRA | no disponible | 42,15% | Apache-2.0 | Adaptador PEFT |
| Modelos mayores de la familia Qwen2.5 | 1,5B–72B | no disponible | no disponible | Apache-2.0 (segun variante) | Safetensors/GGUF |

La comparativa mas informativa es interna al propio estudio: el GRPO solo anade 1,44 puntos sobre el SFT, mientras que el SFT aporta 25,32 puntos sobre el base. No se dispone de datos de benchmarks de alternativas externas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 0,5B: 43,59% de exactitud en GSM8K no constituye un solucionador robusto; el propio autor lo describe como artefacto de estudio.
- La mejora de +1,44 puntos sobre SFT no es estadisticamente significativa (McNemar p ≈ 0,10; 69 ganados frente a 50 perdidos) y solo se evaluo con una semilla.
- Solo LoRA, un unico learning rate y una unica familia de modelo base: los resultados no son necesariamente extrapolables.
- Entrenado exclusivamente en ingles y en aritmetica de nivel escolar; no cubre matematicas avanzadas ni otros idiomas.
- El adaptador es sensible al prompt: debe usarse el mismo system/user prompt que la etapa SFT.
- Riesgo de alucinacion inherente a modelos pequenos: puede producir cadenas de razonamiento plausibles con respuestas incorrectas.
- Sesgos: no documentados en la informacion proporcionada, pero heredados del corpus de entrenamiento del base Qwen2.5.
- Licencia Apache-2.0 permite uso comercial del adaptador y del base; GSM8K es MIT, pero conviene revisar los terminos del dataset si se redistribuyen derivados.
- Para produccion, fusionar el adaptador con el base y evaluar en el dominio concreto antes de desplegar; no usar como referencia de exactitud matematica.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/bhatraasim/qwen2.5-0.5b-gsm8k-grpo
- Adaptador SFT previo: https://huggingface.co/bhatraasim/qwen2.5-0.5b-gsm8k-distill-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Repositorio de codigo del estudio (mencionado en la model card, URL no disponible en la informacion proporcionada): no disponible
