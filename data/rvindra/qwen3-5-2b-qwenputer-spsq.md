# rvindra/Qwen3.5-2B-Qwenputer-SPSQ

## Resumen

Qwen3.5-2B-Qwenputer-SPSQ es un modelo experimental de lenguaje de 2B parámetros publicado por el usuario rvindra en Hugging Face, derivado del modelo base Qwen/Qwen3.5-2B mediante un proceso de cuantización y compilación analítica denominado Subspace-Pruned Split Quantization (SPSQ). Su particularidad es que incorpora una CPU RISC-V de 32 bits (rv32im_zba) junto con un coprocesador de enteros grandes de 62 dígitos embebida directamente en los pesos del transformer, lo que permite realizar aritmética simbólica determinista sin delegar en herramientas externas.

El modelo es un port comprimido y desacoplado de la referencia divagr1925/Qwen3.5-4B-Qwenputer, rediseñado para ejecutarse en hardware de consumo con 8 GB de VRAM. Frente a los 18,8 GB del checkpoint denso original, SPSQ reduce el peso a 1,97 GB (columna vertebral en W4A16 más un circuito simbólico compacto en BF16) con un pico de VRAM de aproximadamente 2,91 GB. La arquitectura combinada mezcla capas nativas del Qwen3.5-2B (24 capas, dimensión 2.048, 16 cabezas de valor DeltaNet) con un prefijo compilado de 11 capas que implementa el circuito RISC-V.

Es relevante ahora porque demuestra una vía poco explorada para inyectar capacidades deterministas de cómputo exacto en modelos pequeños, manteniendo el diálogo y la generación de código prácticamente intactos (KL ≤ 0,088 nats/token frente al base 2B). El modelo está pensado como base previa a un ajuste supervisado (SFT), con limitaciones operativas explícitas para el uso fiable de la calculadora simbólica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas DeltaNet (gated-deltanet) y prefijo compilado RISC-V rv32im_zba con coprocesador bignum de 62 dígitos |
| Parametros totales | 2B (modelo base Qwen3.5-2B) más circuito simbólico compilado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 en las 24 capas de lenguaje; BF16 exacto en el circuito CPU compilado |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers, librería qwen3_5_text) |

## Arquitectura y entrenamiento

La arquitectura parte del transformer Qwen3.5-2B con capas de atención DeltaNet (gated-deltanet) y se extiende mediante un prefijo de 11 capas compiladas analíticamente que implementan una CPU RISC-V de 32 bits con extensión Zba y un coprocesador aritmético de enteros grandes de 62 dígitos. El proceso SPSQ resuelve la incompatibilidad geométrica entre las dimensiones nativas del modelo de 2B (d_base = 2.048, 16 cabezas de valor DeltaNet, 24 capas, 6.144 unidades FFN intermedias) y las requeridas por el circuito compilado (32 cabezas de valor DeltaNet, hasta 8.149 unidades MLP por capa, d_cpu = 1.328), mediante un esquema de split-and-bypass desacoplado que preserva ambas geometrías.

La cuantización es asimétrica: 4 bits en pesos con activaciones de 16 bits (W4A16) para las 24 capas de lenguaje, y BF16 exacto para el circuito simbólico, de modo que la ejecución aritmética sea determinista y verificable. El modelo serializa buffers de firmware aparcados (calc-bridge.elf y un directorio de RAM FSv1) y compila una compuerta de enmascaramiento de traza en pesos (InWeightTraceMasker) que permite ejecutar model.generate() de forma autónoma sin procesos controladores externos. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el modelo se presenta como una base previa a SFT.

## Capacidades

- Generación de texto conversacional en inglés con calidad próxima al Qwen3.5-2B base (KL ≤ 0,088 nats/token).
- Aritmética entera exacta y determinista de múltiples dígitos mediante el circuito RISC-V embebido, sin alucinación numérica cuando se invoca la calculadora.
- Ejecución simbólica standalone dentro de model.generate(), sin necesidad de driver externo.
- Soporte de delegación a herramienta (calc) mediante tool calling, con salida forzada a \boxed{answer}<|im_end|> tras la ejecución del circuito.
- Enmascaramiento automático de prosa aritmética (suppress_prose_starters) cuando se detecta \boxed en el prompt, para evitar derivaciones manuales redundantes y bucles de tool_call.
- Generación de código Python y diálogo general sin restricciones cuando la supresión de prosa está desactivada.
- Modo thinking desactivable mediante prefill de un bloque vacío (<think>\n\n</think>).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Calculadora simbólica determinista en asistentes técnicos: el modelo puede resolver multiplicaciones, divisiones y sumas de enteros grandes invocando el circuito RISC-V embebido, lo que elimina errores de acarreo típicos de los LLM en aritmética de varios dígitos.
- Automatización de verificación contable o financiera: dado que la ejecución es determinista y se han verificado 742.237 tokens de traza sin discrepancias frente a la especificación de referencia, es adecuado para pipelines donde la exactitud numérica es un requisito duro.
- Evaluación de investigación en cómputo simbólico en pesos: sirve como banco de pruebas reproducible para estudiar cómo se comporta un transformer pequeño al alojar circuitos deterministas en sus pesos, con métricas de KL frente al base.
- Generación de código Python en entornos con 8 GB de VRAM: al mantener el diálogo y la generación de código sin restricciones cuando no se activa la supresión de prosa, puede integrarse en asistentes de programación locales en GPU de consumo.
- Despliegue en hardware de gama media para prototipos educativos: con un pico de 2,91 GB de VRAM, es viable en tarjetas como la RTX 5060 de 8 GB, lo que facilita demostraciones de aritmética exacta en aulas o laboratorios con recursos limitados.
- Base para fine-tuning supervisado (SFT) orientado a agentes con herramientas: al ser una versión base previa a SFT, es un punto de partida para entrenar políticas de delegación más robustas hacia la calculadora simbólica en flujos multi-paso.

## Benchmarks y rendimiento

Resultados de decodificación greedy sobre cinco benchmarks de aritmética de múltiples dígitos con presupuesto de 1.536 tokens:

| Benchmark | Base 4B | 4B Qwenputer | 4B Pytool (host) | Base 2B | 2B Pytool (host) | Qwen3.5-2B-Qwenputer-SPSQ |
|---|---|---|---|---|---|---|
| Synthetic integer arithmetic (arith) | 75,0% | 97,5% | 97,5% | 15,0% | 100,0% | 100,0% |
| DeepMind mul_big (dmx_mul_big) | 55,0% | 97,5% | 100,0% | 35,0% | 95,0% | 100,0% |
| DeepMind div_big (dmx_div_big) | 72,5% | 97,5% | 95,0% | 25,0% | 95,0% | 100,0% |
| DeepMind mul_div_multiple_longer | 90,0% | 100,0% | 97,5% | 5,0% | 30,0% | 100,0% |
| DeepMind add_or_sub_big (dmx_add_or_sub_big) | 87,5% | 97,5% | 97,5% | 45,0% | 95,0% | 100,0% |
| Media de precisión | 76,0% | 98,0% | 97,5% | 25,0% | 83,0% | 100,0% |

Tiempos de ejecución (wall-clock) y desglose de latencia:

| Benchmark | Base 2B wall-clock | 2B Pytool (host) | Qwen3.5-2B-Qwenputer-SPSQ | Tiempo de circuito en GPU |
|---|---|---|---|---|
| arith | 622,3 s (31,1 s/p) | 124,0 s (6,2 s/p) | 161,1 s (8,1 s/p) | 50,9 s |
| dmx_mul_big | 493,4 s (24,7 s/p) | 124,2 s (6,2 s/p) | 130,6 s (6,5 s/p) | 34,2 s |
| dmx_div_big | 468,0 s (23,4 s/p) | 134,3 s (6,7 s/p) | 149,6 s (7,5 s/p) | 54,4 s |
| dmx_mul_div_multiple_longer | 540,0 s (27,0 s/p) | 551,6 s (27,6 s/p) | 435,7 s (21,8 s/p) | 321,2 s |
| dmx_add_or_sub_big | 411,3 s (20,6 s/p) | 173,4 s (8,7 s/p) | 155,3 s (7,8 s/p) | 38,8 s |
| Tiempo total | 2.535,0 s (25,4 s/p) | 1.107,5 s (11,1 s/p) | 1.032,2 s (10,3 s/p) | 499,6 s |

Además, la model card reporta 0 discrepancias de lockstep frente a la especificación de CPU de referencia en 742.237 tokens de traza de circuito en GPU (1.709.103 tokens verificados en total).

## Requisitos de hardware

- VRAM estimada: pico de aproximadamente 2,91 GB en la configuración de referencia.
- Huella de pesos: 1,97 GB (W4A16 en el backbone de lenguaje más circuito simbólico en BF16).
- GPU recomendadas: RTX 5060 de 8 GB como referencia de benchmark; cualquier GPU consumer con al menos 4 GB de VRAM libre debería poder alojar el modelo, aunque no se confirma en la información disponible.
- Cabe en GPU consumer: sí, según el autor, en hardware de consumo con 8 GB de VRAM.
- Opciones de despliegue: transformers (librería qwen3_5_text) con la clase QwenputerSPSQForCausalLM; el modelo está marcado como endpoints_compatible. No se detalla soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: entre 6,5 y 21,8 segundos por problema en los benchmarks de aritmética reportados; el tiempo de circuito en GPU oscila entre 34,2 y 321,2 segundos según el benchmark.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión media en aritmética | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Qwenputer-SPSQ | 2B + circuito compilado | no disponible | 100,0% | apache-2.0 | Hugging Face (rvindra) |
| Qwen3.5-4B-Qwenputer | 4B + circuito compilado | no disponible | 98,0% | no disponible | Hugging Face (divagr1925) |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | 25,0% | no disponible | Hugging Face (Qwen) |
| 4B Pytool (host) | 4B | no disponible | 97,5% | no disponible | no disponible |

## Limitaciones y advertencias

- Es una versión base previa a SFT: la delegación fiable a la herramienta requiere desactivar el modo thinking con un bloque vacío y, opcionalmente, activar suppress_prose_starters.
- Si se permite razonamiento en prosa sin restricciones, el modelo intenta aritmética mental y alucina números en lugar de invocar el circuito compilado.
- El idioma soportado declarado es únicamente inglés, lo que limita su uso en castellano u otros idiomas sin evaluación adicional.
- La supresión de prosa puede provocar bucles de tool_call o salidas truncadas si no se configura correctamente el prompt del sistema.
- No se dispone de datos sobre sesgos, contexto máximo ni comportamiento fuera de los benchmarks aritméticos reportados.
- Aunque la licencia es apache-2.0, conviene verificar las condiciones del modelo base Qwen/Qwen3.5-2B antes de un uso comercial en producción.
- El rendimiento en latencia es variable: el benchmark dmx_mul_div_multiple_longer muestra 21,8 s por problema, muy por encima de la media, lo que puede ser problemático en aplicaciones interactivas.
- La información sobre cuantizaciones alternativas, formato GGUF y opciones de despliegue distintas de transformers no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rvindra/Qwen3.5-2B-Qwenputer-SPSQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Referencia original 4B Qwenputer: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
