# oliver0804/Granite-4.2-3B-RK3588-rkllm-w8a8

## Resumen

Granite-4.2-3B-RK3588-rkllm-w8a8 es una conversión del modelo base ibm-granite/granite-4.2-3b de IBM al formato RKLLM con cuantización w8a8, optimizado para ejecutarse en la NPU de los SoC Rockchip RK3588 y RK3588S. El autor de la conversión es oliver0804, que publica el artefacto bajo licencia Apache-2.0 heredada del modelo original. El objetivo es permitir inferencia de un modelo de 3.000 millones de parámetros en placas de bajo consumo (por ejemplo, Radxa ROCK 5C con 8 GB de RAM), un escenario típico de edge AI donde no hay GPU dedicada.

La contribución técnica principal no es el modelo en sí, sino el proceso de conversión: Granite 4.2 introduce cuatro multiplicadores escalares (embedding, atención, residual y logits) que lo alejan de la aritmética estándar de Llama que entiende rkllm. El autor pliega esos multiplicadores en los pesos —concretamente, escala `q_proj` por 0.125 para convertir el `attention_multiplier = 1/64` de Granite en el `1/8` estándar— de modo que el grafo resultante es indistinguible de un Llama para el runtime de Rockchip.

El resultado es un artefacto de 4 GB en formato `.rkllm` que alcanza 7,1 tok/s de generación y 114 tok/s de prefill en una RK3588S con relojes fijados, consumiendo unos 3,7 GB de memoria. Es relevante para quienes despliegan LLMs en hardware Rockchip y necesitan un modelo multilingüe (chino e inglés) con licencia permisiva y sin dependencia de GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Granite 4.2, aritmética plegada a Llama estándar) |
| Parámetros totales | 3 000 millones (modelo base granite-4.2-3b) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 / 4096 en el ejemplo de uso (no se especifica el máximo del base) |
| Tipos de cuantización | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | RKLLM (`.rkllm`), generado con rkllm-toolkit 1.3.1 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 3.000 millones de parámetros. La conversión no reentrena ni modifica los datos de entrenamiento: parte de los pesos publicados por IBM y aplica un plegado algebraico de los cuatro multiplicadores escalares que diferencian Granite 4.2 de un Llama convencional. Como todos ellos son lineales, pueden absorberse en las matrices de pesos correspondientes; en este caso, el único multiplicador distinto de 1 es `attention_multiplier = 1/64` (frente al `1/sqrt(head_dim) = 1/8` estándar), por lo que se escala `q_proj` por 0.125.

La verificación previa a la conversión se hizo contra Hugging Face transformers: diferencia máxima de logits de 1e-5 y argmax greedy idéntico al 100 % sobre 600 tokens. El script de plegado se incluye en el repositorio (`conversion/fold_granite.py`). La cuantización w8a8 se aplica después mediante rkllm-toolkit 1.3.1, y el artefacto requiere `librkllmrt.so` 1.3.1 en tiempo de ejecución. No se documentan en la información disponible detalles sobre el dataset de entrenamiento del modelo base, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en chino e inglés, con respuestas que se mantienen en chino tradicional de principio a fin sin mezclar caracteres simplificados (punto fuerte destacado por el autor).
- Razonamiento básico y respuesta a preguntas; el benchmark de 7 preguntas en zh-TW obtuvo 5 aciertos sobre 7.
- Conversión de formato y despliegue en NPU Rockchip mediante RKLLM runtime 1.3.1.
- Ejecución en edge con memoria contenida (~3,7 GB) y sin GPU.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Asistentes conversacionales en dispositivos empotrados: el modelo cabe en 3,7 GB y corre en una NPU RK3588S, lo que permite integrar un chatbot local en placas como Radxa ROCK 5C sin conexión a la nube.
- Atención al cliente en chino tradicional: el autor verifica que las respuestas se mantienen íntegramente en caracteres tradicionales, lo que lo hace adecuado para mercados de Taiwán y Hong Kong donde mezclar simplificado es un defecto grave.
- Procesamiento de texto en inglés en gateways industriales: con 114 tok/s de prefill, es viable clasificar o resumir documentos cortos en un dispositivo de bajo consumo conectado a sensores o PLCs.
- Prototipado de edge AI con Rockchip: sirve como referencia reproducible para validar pipelines de conversión rkllm-toolkit 1.3.1 y el plegado de multiplicadores escalares antes de invertir en modelos mayores.
- Kioscos y terminales de información: la ventana de contexto de 2048–4096 tokens cubre interacciones de varias rondas en un terminal de consulta pública sin infraestructura de servidor.
- Educación y demos de NPU: el repositorio incluye el script de conversión, lo que lo convierte en material didáctico para entender cuantización w8a8 y despliegue en NPU.
- Inferencia offline en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, lo que encaja en aplicaciones sanitarias o industriales con restricciones de confidencialidad.

## Benchmarks y rendimiento

Medición del autor en Radxa ROCK 5C (RK3588S, 8 GB), relojes fijados (CPU 1,8/2,3 GHz, DDR 2112 MHz, NPU 1 GHz), decodificación greedy, benchmark de 7 preguntas en chino tradicional:

| Métrica | Valor |
|---|---|
| Aciertos | 5 / 7 |
| Generación | 7,1 tok/s |
| Prefill | 114 tok/s |
| Memoria | ~3,7 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor señala como debilidades respuestas excesivamente largas, bucles ocasionales y fallo en la comparación "9.11 vs 9.9".

## Requisitos de hardware

- VRAM/RAM: ~3,7 GB de memoria durante la inferencia; el repositorio ocupa 4,0 GB.
- Hardware objetivo: NPU de Rockchip RK3588 y RK3588S (probado en Radxa ROCK 5C con 8 GB).
- No requiere GPU dedicada; no se ha validado en A100, H100 ni RTX 4090, y el formato `.rkllm` no es portable a esas plataformas sin reconversión.
- Runtime: `librkllmrt.so` versión 1.3.1 obligatoria; toolkit de conversión rkllm-toolkit 1.3.1.
- Comando de ejemplo: `./llm_demo granite-4.2-3b_RK3588_w8a8.rkllm 2048 4096`.
- Throughput medido: 7,1 tok/s de generación y 114 tok/s de prefill con relojes fijados; sin fijar, el rendimiento puede variar por throttling térmico.
- Opciones de despliegue: exclusivamente el runtime RKLLM de Rockchip; no es compatible con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite-4.2-3B-RK3588-rkllm-w8a8 (este) | 3 000 M | 2048–4096 en el ejemplo | RKLLM w8a8 / NPU RK3588 | Apache-2.0 | Hugging Face, 9 descargas |
| ibm-granite/granite-4.2-3b (base) | 3 000 M | no disponible en la información | safetensors / GPU o CPU | Apache-2.0 | Hugging Face (oficial IBM) |
| Alternativas edge en RK3588 | no disponible | no disponible | RKLLM | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks comparables con otras conversiones RKLLM ni con modelos de tamaño similar en el mismo hardware.

## Limitaciones y advertencias

- El benchmark propio es de solo 7 preguntas en chino tradicional; la muestra es demasiado pequeña para extrapolar calidad general.
- El autor reporta respuestas largas y bucles ocasionales, además de un fallo concreto en comparación numérica ("9.11 vs 9.9"), lo que indica razonamiento aritmético frágil.
- Riesgo de alucinación inherente a un modelo de 3 000 M; no se han publicado evaluaciones de factualidad.
- Idiomas limitados a chino e inglés según la model card; el rendimiento en castellano no está evaluado.
- La cuantización w8a8 introduce degradación adicional respecto al modelo base; no se documenta la pérdida de calidad frente a fp16 más allá de la verificación de logits previa a la cuantización.
- Dependencia estricta de `librkllmrt.so` 1.3.1: otras versiones del runtime pueden no cargar el artefacto.
- El formato `.rkllm` no es portable fuera de la NPU Rockchip; requiere reconversión para otros backends.
- Los pesos están modificados (plegado de multiplicadores), por lo que es una obra derivada del modelo Apache-2.0; se debe conservar el aviso de licencia y atribución.
- Uso comercial permitido por Apache-2.0, pero sin garantías del autor de la conversión ni de IBM sobre el artefacto cuantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oliver0804/Granite-4.2-3B-RK3588-rkllm-w8a8
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Script de plegado incluido en el repo: `conversion/fold_granite.py` (ruta dentro del repositorio de Hugging Face)
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
