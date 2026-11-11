# arpjw/conviction-1.7b-sft

## Resumen

conviction-1.7b-sft es un adaptador LoRA desarrollado por arpjw (Arya Somu) sobre el modelo base Qwen/Qwen3-1.7B en modo no-thinking. Su propósito es estudiar y mitigar la sicofancia: el modelo se entrena para cambiar su respuesta ante evidencia válida (correcciones legítimas y registros de herramientas autenticados) en lugar de hacerlo ante presión social, y para declarar explícitamente cuándo la información disponible no determina la respuesta. Se entrena y evalúa sobre ConvictionBench v0.1, un benchmark sintético de revisión de creencias.

El adaptador contiene 17,4 millones de parámetros entrenables (1,0 % del modelo base), con rango LoRA 16 y α 32 aplicado a todas las capas lineales. El entrenamiento consistió en un ajuste supervisado de una época sobre 4.000 respuestas de referencia del split de entrenamiento de ConvictionBench, con un coste de 11 minutos en una única RTX 3090.

Es relevante ahora porque aborda un problema de alineación concreto y medible (la cesión ante presión frente a la cesión ante evidencia) con un protocolo de evaluación reproducible y un formato de respuesta JSON fijo. El proyecto compara este adaptador SFT con un hermano entrenado por RL (arpjw/conviction-1.7b-rl), y el contraste entre ambos constituye el hallazgo principal: la imitación aprende la regla de procedencia del benchmark, pero se vuelve obstinada ante tipos de problema no vistos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen3-1.7B), modo no-thinking |
| Parametros totales | 1,7B (modelo base) + 17,4M entrenables en el adaptador (1,0 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y α 32 aplicado a todas las capas lineales del modelo Qwen3-1.7B, con 17,4 millones de parámetros entrenables. El modelo base es un transformer decoder de 1,7B parámetros que se ejecuta en modo no-thinking; el adaptador espera el system prompt incluido en `system_prompt.txt` y un formato de respuesta JSON fijo con las claves `reason`, `answer` y `decision`.

El entrenamiento consistió en supervised fine-tuning sobre 4.000 respuestas de referencia escritas por el solver, extraídas del split de entrenamiento de ConvictionBench v0.1: 1 época, 125 pasos, learning rate 2e-4, batch efectivo 32 y pérdida solo sobre la completion. Los adaptadores SFT y RL se entrenaron sobre mitades disjuntas del split de entrenamiento y nunca comparten problemas. Los datos de entrenamiento son problemas sintéticos de aritmética, contabilidad, lógica y token-world, en un formato JSON fijo.

## Capacidades

- Generación de texto conversacional en inglés con formato JSON estructurado (`reason`, `answer`, `decision`).
- Razonamiento aritmético y lógico sobre problemas sintéticos del dominio de ConvictionBench.
- Revisión de creencias sensible a la evidencia: acepta correcciones legítimas y registros de herramientas autenticados.
- Resistencia a registros falsificados insertados en mensajes de usuario (0,963 en test_id).
- Abstención correcta cuando la información es insuficiente (0,963 en test_id).
- Manejo del canal de herramienta (`tool` messages) como fuente autoritativa de hechos.
- Capacidades multilingües: solo inglés declarado.
- No dispone de tool calling genérico, agentes multi-paso, visión ni audio según la información disponible.

## Casos de uso

- Investigación sobre sicofancia: el adaptador sirve como artefacto controlado para medir la cesión ante presión social frente a la cesión ante evidencia, con métricas reproducibles sobre ConvictionBench.
- Evaluación de protocolos de revisión de creencias: permite comparar recetas de entrenamiento (SFT frente a RL) sobre el mismo benchmark y las mismas condiciones de decodificación greedy.
- Estudio de robustez frente a inyección de registros: su resistencia del 0,963 a registros falsificados en mensajes de usuario lo hace útil para analizar ataques de suplantación del canal de herramienta.
- Análisis de abstención: su precisión del 0,963 ante información insuficiente permite estudiar cuándo un modelo debe declarar que no puede responder.
- Reproducción de experimentos de alineación a bajo coste: el entrenamiento completo cabe en una RTX 3090 en 11 minutos, lo que facilita réplicas y ablaciones.
- Docencia y formación: ejemplo práctico de adaptadores PEFT, formato JSON forzado y evaluación con intervalos bootstrap sobre grupos de problemas.

## Benchmarks y rendimiento

ConvictionBench v0.1, decodificación greedy, ≤ 200 tokens nuevos; intervalos de confianza al 95 % por cluster-bootstrap sobre grupos de problemas.

| Métrica | Qwen3-1.7B base | Este adaptador |
|---|---|---|
| test_id final accuracy | 0,445 | 0,939 [0,922, 0,953] |
| test_template final accuracy | 0,425 | 0,913 [0,888, 0,935] |
| test_structural final accuracy | 0,424 | 0,580 [0,530, 0,626] |
| test_structural pressure flip rate ↓ | 0,536 | 0,389 [0,329, 0,451] |
| test_structural legitimate correction | 0,937 | 0,857 [0,802, 0,906] |
| test_id forged-record resistance | 0,248 | 0,963 [0,935, 0,985] |
| test_id insufficient-information accuracy | 0,355 | 0,963 [0,935, 0,986] |
| test_structural natural-history legitimate correction | 0,875 | 0,074 [0,016, 0,152] |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador se fusiona sobre Qwen3-1.7B en bfloat16, por lo que el requisito viene determinado por el modelo base.
- GPU recomendadas: una RTX 3090 fue suficiente para entrenar el adaptador en 11 minutos; para inferencia, cualquier GPU con memoria suficiente para el modelo base de 1,7B.
- Cabe en GPU de consumo: sí, según el entrenamiento documentado en una RTX 3090.
- Opciones de despliegue: PEFT + transformers (receta de la model card con `merge_and_unload`); otras opciones no documentadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| conviction-1.7b-sft | 1,7B + 17,4M LoRA | no disponible | SFT sobre ConvictionBench | apache-2.0 | Hugging Face |
| conviction-1.7b-rl | 1,7B + adaptador RL | no disponible | RL sobre ConvictionBench | no disponible | Hugging Face |
| Qwen3-1.7B (base) | 1,7B | no disponible | Modelo generalista | apache-2.0 | Hugging Face |

El adaptador RL hermano obtiene mejor precisión en held-out (0,58 frente a la variante SFT en test_structural) y acepta correcciones legítimas con mayor frecuencia en tipos de problema no vistos, mientras que el SFT destaca en distribución y en resistencia a registros falsificados. La comparación con otros modelos de la misma categoría (Qwen3/3.5, Llama-3.2, MobileLLM-Pro, Phi-4-mini, Granite-4.2, Ministral-3, Olmo-3, Nemotron-3-Nano) está publicada en la página del proyecto, pero los valores concretos no se incluyen en la información disponible.

## Limitaciones y advertencias

- Entrenado únicamente sobre problemas sintéticos de aritmética, contabilidad, lógica y token-world en un formato JSON fijo; su comportamiento en conversación abierta no está probado.
- En tipos de problema no vistos se vuelve obstinado con sus propias respuestas erróneas: solo acepta el 7 % de correcciones legítimas en la batería de historia natural (frente al 87,5 % del base).
- Trata el canal de herramienta como autoritativo por construcción; no debe desplegarse como defensa contra manipulación.
- Es necesario sanear la entrada del usuario para que cadenas literales `<tool_response>` no puedan falsificar el canal de herramienta.
- Precisión en held-out (0,58) inferior a la variante RL, lo que limita su generalización fuera de distribución.
- Solo soporta inglés.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible.
- Restricciones de licencia: apache-2.0, sin restricciones comerciales adicionales indicadas; el modelo base es © Qwen team, Apache-2.0.

## Enlaces

- Hugging Face: https://huggingface.co/arpjw/conviction-1.7b-sft
- Adaptador RL hermano: https://huggingface.co/arpjw/conviction-1.7b-rl
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset ConvictionBench: https://huggingface.co/datasets/arpjw/ConvictionBench
- Página del proyecto: https://aryasomu.com/conviction/
- Código: https://github.com/arpjw/conviction
