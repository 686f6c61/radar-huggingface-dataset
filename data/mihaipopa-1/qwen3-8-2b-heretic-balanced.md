# MihaiPopa-1/Qwen3.8-2B-Heretic-Balanced

## Resumen

Qwen3.8-2B-Heretic-Balanced es una version descensurada del modelo [empero-ai/Qwen3.8-2B-Distill](https://huggingface.co/empero-ai/Qwen3.8-2B-Distill), generada mediante la tecnica de abliteration con la herramienta Heretic v1.4.0. El modelo base es una destilacion completa (full-parameter, no un adaptador) del modelo profesor Qwen3.8 2.4T A95B en la arquitectura Qwen3.5-2B, entrenado con unas 30.000 trazas de razonamiento del profesor, filtradas por calidad. El objetivo es trasladar el razonamiento de cadena de pensamiento del modelo de gran escala a un modelo de 2.2 mil millones de parametros apto para el edge.

La variante Heretic-Balanced elimina la mayor parte de los rechazos del modelo original: pasa de 83/100 a 4/100 respuestas rechazadas, manteniendo una divergencia KL de 0.0095 respecto al modelo original, lo que indica que el comportamiento general apenas se altera. Conserva la ventana de contexto nativa de 262.144 tokens y el soporte de function calling de la arquitectura Qwen3.5.

Es relevante porque combina un razonamiento destilado de un modelo de gran escala en un peso de 2B con licencia Apache 2.0, apto para dispositivos de borde (edge), y ademas ofrece una version sin filtros de censura para casos de uso que requieren respuestas sin restricciones. El repositorio se publico en agosto de 2026 con cero descargas y cero likes, por lo que se trata de un modelo reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-2B (ruta de texto de una base vision-language, atencion hibrida con Gated DeltaNet) |
| Parametros totales | 2.213.241.664 (~2,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-2B-Distill es una destilacion completa del profesor Qwen3.8 2.4T A95B (un modelo de 2,4 billones de parametros totales con 95B activos) sobre la arquitectura Qwen3.5-2B. El entrenamiento es SFT off-policy con aproximadamente 30.000 trazas de profesor que incluyen cadenas de pensamiento densas en matematicas, razonamiento general y seguimiento de instrucciones. La arquitectura Qwen3.5 es hibrida: combina atencion lineal con Gated DeltaNet y capas de convolucion causal (causal_conv1d), lo que requiere kernels especializados de flash-linear-attention para un rendimiento optimo; sin ellos, las capas de atencion lineal caen en operaciones PyTorch lentas y con alto consumo de memoria.

La variante Heretic-Balanced se obtiene aplicando abliteration con Heretic v1.4.0. La abliteration elimina la direccion de rechazo en los pesos del modelo, concretamente en las proyecciones attn.o_proj y mlp.down_proj, con parametros documentados: direction_index 10.31, pesos maximos y minimos en ambas proyecciones. El resultado es que el modelo deja de rechazar peticiones que el original bloqueaba, manteniendo la divergencia KL en 0.0095 y reduciendo los rechazos de 83/100 a 4/100.

## Capacidades

- Generacion de texto causal con razonamiento de cadena de pensamiento: cada respuesta abre con un bloque `thinking` aprendido de las trazas del profesor, no generado sinteticamente.
- Razonamiento matematico y de proposito general: el modelo base destilado alcanza 0.640 en GSM8K y 0.548 en MMLU (57 materias) con protocolos CoT, muy por encima de la base Qwen3.5-2B.
- Function calling nativo segun la especificacion Qwen3.5, sin wrapper ni fine-tune especifico.
- Ventana de contexto de 262.144 tokens, heredada de la base Qwen3.5.
- Respuestas sin censura: rechaza solo 4 de 100 peticiones sensibles, frente a 83 de 100 del modelo original.
- Idioma: ingles (unico idioma declarado en la model card).

## Casos de uso

- Asistentes de atencion al cliente sin restricciones: el modelo responde a consultas en dominios sensibles (salud, legal, finanzas) que el modelo original bloquearia, gracias a la abliteration. Su contexto de 262.144 tokens permite mantener conversaciones multi-turno largas con historial completo.
- Razonamiento en dispositivos de borde: con 2,2B de parametros y pesos bf16 de ~4 GB, puede ejecutarse en una Raspberry Pi o un telefono con cuantizacion, proporcionando cadenas de razonamiento explicadas sin conexion a la nube.
- Generacion de codigo con function calling en entornos locales: el soporte nativo de function calling permite integrarlo en herramientas de desarrollo que invocan funciones del sistema, como generadores de tests o analizadores de codigo, en equipos sin GPU dedicada.
- Tutoria de matematicas con explicacion del proceso: el modelo abre cada respuesta con un bloque de razonamiento explicito, lo que permite mostrar el proceso de resolucion paso a paso en aplicaciones educativas.
- Investigacion en interpretabilidad y mecanismos de censura: la abliteration de Heretic permite estudiar como se codifican los rechazos en los pesos del modelo, comparando el comportamiento del modelo original y el descensurado sobre las mismas peticiones.
- Prototipado de agentes con contexto largo: con 262.144 tokens y function calling, sirve como base para prototipos de agentes que requieren mantener estado extenso en memoria sin depender de una API externa.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks para la version abliterada. Los unicos datos de rendimiento especificos de esta variante son:

| Metrica | Qwen3.8-2B-Heretic-Balanced | Qwen3.8-2B-Distill (original) |
|---|---|---|
| Divergencia KL | 0.0095 | 0 (por definicion) |
| Rechazos | 4/100 | 83/100 |

Los benchmarks publicados en la model card corresponden al modelo destilado original (empero-ai/Qwen3.8-2B-Distill), medidos con lm-evaluation-harness, backend HF, con protocolos CoT:

| Tarea | Metrica | Qwen3.5-2B (base) | Qwen3.8-2B (destilado) | Delta |
|---|---|---|---|---|
| gsm8k_cot | exact_match (flexible) | 0.330 | 0.640 | +0.310 |
| gsm8k_cot | exact_match (strict) | 0.545 | 0.640 | +0.095 |
| mmlu (CoT, 57 materias) | acc (flexible-extract) | 0.283 | 0.548 | +0.265 |
| mmlu (CoT, 57 materias) | acc (strict-match) | 0.004 | 0.225 | +0.221 |

Los parametros de muestreo utilizados son temperature=0.6, top_p=0.95, top_k=20. No se dispone de datos de rendimiento especificos para la version abliterada en tareas de razonamiento, codigo o lenguaje.

## Requisitos de hardware

- VRAM estimada: ~4 GB en
