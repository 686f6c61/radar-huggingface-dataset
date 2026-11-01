# oliver0804/Kanana-2-3B-Instruct-RK3588-rkllm-w8a8

## Resumen

Kanana-2-3B-Instruct-RK3588-rkllm-w8a8 es una conversión del modelo kakaocorp/kanana-2-3b-instruct (desarrollado originalmente por KAKAO Corp.) al formato RKLLM con cuantización w8a8, optimizada para ejecutarse en la NPU de los SoC Rockchip RK3588 y RK3588S. El autor de la conversión es el usuario de HuggingFace oliver0804, y el resultado es un artefacto de despliegue en el borde (edge AI) más que un modelo nuevo: los pesos son los del Kanana-2-3B-Instruct con un ajuste técnico específico para que la inferencia en NPU sea correcta.

El problema que resuelve es concreto y bien documentado: Kanana-2-3B es un modelo de estilo Qwen3 cuyas 32 capas de atención usan YaRN RoPE (factor 40, `original_max_position` 4096). El runtime rkllm ignora silenciosamente `rope_scaling` y calcula RoPE plano, lo que produce respuestas fluidas pero incorrectas. La conversión pliega el factor de escalado de YaRN (≈1.369) en los pesos de `q_norm`/`k_norm`, lo que es matemáticamente equivalente porque los modelos Qwen3 normalizan q y k con RMSNorm. El resultado alcanza un 99,83 % de coincidencia con la implementación oficial de YaRN en modo greedy sobre 600 tokens, frente al 12,5 % sin el plegado.

Es relevante para quienes despliegan LLMs en hardware de bajo consumo: permite ejecutar un modelo de 3B parámetros en una placa RK3588S de 8 GB con un consumo de memoria de aproximadamente 3,8 GB y un rendimiento de 8,1 tok/s en generación y 122 tok/s en prefill. La licencia Kanana Open License restringe el uso comercial, lo que condiciona su adopción en productos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3, 32 capas de atención con YaRN RoPE (factor 40, `original_max_position` 4096) |
| Parámetros totales | 3B (según el nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (`original_max_position`); el ejemplo de uso invoca 2048 de contexto y 4096 de longitud máxima |
| Tipos de cuantización | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | zh, ko, en |
| Licencia | Kanana Open License (uso no comercial libre; uso comercial requiere licencia de KAKAO Corp.) |
| Formato de pesos | RKLLM (`.rkllm`), generado con `rkllm-toolkit` 1.3.1; requiere `librkllmrt.so` 1.3.1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Kanana-2-3B-Instruct de KAKAO: un transformer decoder-only de 3B parámetros con 32 capas de atención que emplean YaRN RoPE con factor 40 y posición máxima original de 4096. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo base está etiquetado como `finetune` de sí mismo en los tags de HuggingFace, lo que sugiere un ajuste de instrucciones sobre una base previa, pero no se detallan los datos.

La innovación técnica de esta conversión es el plegado de YaRN en los pesos. Dado que los modelos Qwen3 aplican RMSNorm a q y k, multiplicar cos/sin por el factor de escalado `s = 1 + 0.1·ln 40 ≈ 1.369` equivale exactamente a escalar los pesos de `q_norm` y `k_norm` por `s`. El script `conversion/fold_yarn.py` realiza este plegado y elimina `rope_scaling` de la configuración, de modo que el runtime rkllm, que ignora ese campo, computa un RoPE que coincide con el oficial. La coincidencia greedy argmax con la implementación oficial de YaRN es del 99,83 % sobre 600 tokens; la brecha residual se atribuye al cambio de `inv_freq` de YaRN, que solo afecta a dimensiones de baja frecuencia más allá de 4096 tokens.

## Capacidades

- Generación de texto en chino, coreano e inglés.
- Razonamiento y respuesta a instrucciones (modelo `-Instruct`).
- Modo "thinking" desactivado en la configuración de benchmark, aunque el modelo base es de estilo Qwen3 y probablemente soporta modos de razonamiento; no se detalla en la información disponible.
- Ejecución en NPU de RK3588/RK3588S mediante el runtime RKLLM 1.3.1.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información proporcionada.
- Capacidades multilingües limitadas a zh, ko, en según los tags del repositorio.

## Casos de uso

- Despliegue de un asistente conversacional en dispositivos empotrados con RK3588S: el modelo cabe en 8 GB de RAM (~3,8 GB de uso) y ofrece 8,1 tok/s de generación, suficiente para interacciones de voz o texto en local sin conexión.
- Atención al cliente en coreano o chino en hardware de bajo coste: la ventana de 4096 tokens permite conversaciones multi-turno moderadas y el modelo responde en el idioma del usuario.
- Procesamiento de texto en el borde para aplicaciones industriales o IoT: al ejecutarse íntegramente en la NPU, evita enviar datos a la nube y reduce la latencia de red.
- Prototipado de productos con restricciones de privacidad: el modelo no requiere GPU dedicada ni servidores, lo que facilita el cumplimiento de requisitos de datos locales.
- Evaluación de la viabilidad de LLMs en NPU Rockchip: el repositorio sirve como referencia técnica para convertir otros modelos Qwen3-style a RKLLM con YaRN correcto.
- Generación de texto offline en placas de desarrollo (Radxa ROCK 5C, etc.) para demostraciones y pruebas de concepto en ferias o entornos sin conectividad.
- Traducción o resumen básico entre zh, ko y en en dispositivos de bajo consumo, dentro de las limitaciones de contexto y calidad del modelo de 3B.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, sobre Radxa ROCK 5C (RK3588S, 8 GB), relojes fijados, greedy, thinking off, benchmark de 7 preguntas en chino tradicional:

| Métrica | Valor |
|---|---|
| Puntuación | 5,5 / 7 |
| Generación | 8,1 tok/s |
| Prefill | 122 tok/s |
| Memoria | ~3,8 GB |
| Coincidencia greedy con YaRN oficial | 99,83 % sobre 600 tokens |
| Coincidencia greedy sin plegado | 12,5 % sobre 600 tokens |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~3,8 GB en el benchmark con w8a8 sobre RK3588S de 8 GB.
- Hardware objetivo: SoC Rockchip RK3588 y RK3588S con NPU; requiere `librkllmrt.so` 1.3.1.
- No cabe ni está pensado para GPU de consumo (RTX 4090, etc.); el formato `.rkllm` es específico de la NPU Rockchip.
- Despliegue: runtime RKLLM 1.3.1, demo `llm_demo` con argumentos `2048 4096`; no es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: 8,1 tok/s de generación y 122 tok/s de prefill en RK3588S con relojes fijados.
- El repositorio ocupa 3,9 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanana-2-3B-Instruct-RK3588-rkllm-w8a8 | 3B | 4096 | RKLLM w8a8 / NPU RK3588 | Kanana Open License (comercial restringido) | HuggingFace, 8 descargas |
| kakaocorp/kanana-2-3b-instruct (base) | 3B | 4096 (YaRN factor 40) | safetensors / GPU | Kanana Open License | HuggingFace |
| Qwen3-4B (referencia de arquitectura similar) | 4B | no disponible en esta ficha | safetensors, GGUF / GPU y CPU | no disponible en esta ficha | HuggingFace |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada; la comparativa se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Licencia Kanana Open License: el uso no comercial es libre, pero el uso comercial (API, integración en producto o embedding en dispositivo vendido a terceros) requiere licencia separada de KAKAO Corp.
- El modelo es una conversión de pesos modificados (YaRN plegado); debe citarse "Powered by Kanana" según la licencia.
- Riesgo de alucinación propio de un modelo de 3B, especialmente en razonamiento complejo y matemáticas.
- Contexto limitado a 4096 tokens; el cambio de `inv_freq` de YaRN solo se aproxima más allá de esa longitud, por lo que el comportamiento en contextos muy largos no está garantizado.
- Idiomas limitados a zh, ko, en; no se documenta soporte de español.
- El benchmark de 7 preguntas es reducido y en chino tradicional, con caracteres simplificados ocasionales; no es representativo de un uso general.
- El formato `.rkllm` solo funciona en NPU Rockchip RK3588/RK3588S con la versión exacta del runtime (1.3.1); no es portable a GPU ni a otros aceleradores.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- El repositorio tiene muy pocas descargas (8) y ningún "like", lo que indica escasa validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/oliver0804/Kanana-2-3B-Instruct-RK3588-rkllm-w8a8
- Modelo base: https://huggingface.co/kakaocorp/kanana-2-3b-instruct
- Licencia: https://huggingface.co/kakaocorp/kanana-2-3b-instruct/blob/main/LICENSE
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
