# SomanathKS/Qwen2.5-7B-Instruct-GGUF

## Resumen

SomanathKS/Qwen2.5-7B-Instruct-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen2.5-7B-Instruct, publicada por el usuario SomanathKS. No se trata de un modelo nuevo ni reentrenado: es una conversión de los pesos originales de Qwen a un formato optimizado para inferencia en CPU y GPU con llama.cpp. El repositorio contiene únicamente el archivo Q4_K_M, generado a partir de los safetensors BF16 originales mediante una conversión intermedia a F16 GGUF y una posterior cuantización con `llama-quantize`.

El modelo base, Qwen2.5-7B-Instruct, es un transformer decoder-only de 7.615.616.512 parámetros desarrollado por el equipo Qwen (Alibaba). Está afinado para instrucciones y conversación, con soporte nativo de plantilla de chat y una longitud de contexto original de 131.072 tokens que, en esta cuantización, queda limitada a 32.768 tokens al no haberse aplicado la configuración YaRN necesaria para extenderla.

La relevancia de esta ficha es práctica: ofrece una vía de despliegue local de un modelo de 7B con licencia Apache-2.0, un tamaño de archivo de 4,68 GB y un rendimiento medido de 41,4 tokens por segundo en una Tesla T4. Es adecuado para entornos con recursos limitados que necesiten un asistente conversacional con API compatible con OpenAI a través de `llama-server`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), cuantizado a GGUF |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en este GGUF (el base soporta 131.072 con YaRN, no aplicado) |
| Tipos de cuantizacion | Q4_K_M (único archivo en el repo); se documentan F16 y Q8_0 solo a efectos comparativos |
| Idiomas soportados | en (según la model card); el modelo base Qwen2.5 tiene cobertura multilingüe más amplia |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (4,68 GB / 4,36 GiB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención por causalidad estándar, 7.615.616.512 parámetros y una ventana de contexto nativa de 131.072 tokens que requiere YaRN para su explotación completa. El modelo base fue entrenado y afinado por el equipo Qwen; esta publicación no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO aplicadas, por lo que esos datos deben consultarse en la model card original de Qwen.

La contribución técnica de este repositorio es exclusivamente el proceso de cuantización. Se partió de los safetensors en BF16, se convirtió a F16 GGUF con `convert_hf_to_gguf.py` y se cuantizó a Q4_K_M con `llama-quantize`, usando la build 12257 de llama.cpp. La plantilla de chat queda embebida en el archivo GGUF. No se aplicaron ajustes de YaRN, de ahí la reducción del contexto efectivo a 32.768 tokens. La pérdida de calidad medida es de aproximadamente un 1,7 % en perplejidad sobre wikitext-2 respecto a F16 (8,04 frente a 7,90).

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat embebida.
- Razonamiento, código y matemáticas heredados del modelo base Qwen2.5-7B-Instruct (no se documentan evaluaciones específicas en esta publicación).
- Servido mediante `llama-server` con API compatible con OpenAI en `/v1/chat/completions`.
- Ejecución en CPU y descarga parcial o total de capas a GPU mediante `-ngl`.
- Capacidades multilingües del modelo base no verificadas en esta cuantización; la model card declara únicamente inglés.
- No se documentan tool calling, function calling, modo thinking, visión ni audio en esta publicación.

## Casos de uso

- Asistente conversacional local: desplegable con `llama-server -hf SomanathKS/Qwen2.5-7B-Instruct-GGUF:Q4_K_M -ngl 99 -c 4096`, expone una interfaz de chat en el puerto 8080 y una API compatible con OpenAI, adecuada para prototipos y entornos de desarrollo sin dependencia de la nube.
- Integración en aplicaciones existentes que ya consumen la API de OpenAI: al ser compatible con `/v1/chat/completions`, se puede sustituir el endpoint remoto por el servidor local sin reescribir el cliente.
- Inferencia en hardware modesto: con 4,36 GiB de pesos y unos 5 GB de VRAM a contexto 4096, cabe en GPUs de consumo con 8 GB o más, o incluso en CPU ajustando `-ngl`.
- Procesamiento por lotes de texto en pipelines offline: el rendimiento de 41,4 t/s en T4 permite generar resúmenes, clasificaciones o respuestas sobre conjuntos de datos de tamaño medio.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local, los datos no salen de la infraestructura del usuario, lo que resulta útil para documentos sensibles.
- Base para experimentación con cuantización: el repositorio documenta el procedimiento completo (BF16 → F16 → Q4_K_M) y métricas de perplejidad y velocidad, útil como referencia para reproducir el pipeline con otros modelos.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a mediciones de velocidad y perplejidad realizadas en una Tesla T4 de Google Colab con llama.cpp build 12257.

| Formato | Tamano | Generacion (tg128) | Perplejidad (wikitext-2) |
|---|---|---|---|
| F16 | 14,19 GiB | 18,0 t/s | 7,90 |
| Q8_0 | 7,54 GiB | 29,5 t/s | 7,90 |
| Q4_K_M | 4,36 GiB | 41,4 t/s | 8,04 |

Condiciones: `llama-bench -ngl 99 -p 128,256,512,1024 -n 128,256 -b 512 -ub 512 -t 4 -r 3` para velocidad y `llama-perplexity -ngl 99` con contexto 512 para calidad. Solo el archivo Q4_K_M está disponible en el repositorio; F16 y Q8_0 se incluyen únicamente como comparación. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5 GB a contexto 4096 con todas las capas en GPU (`-ngl 99`).
- GPU recomendadas: Tesla T4 (mediciones publicadas), así como cualquier GPU con 8 GB o más de VRAM para el archivo completo; en GPUs con menos memoria, reducir `-ngl` para descargar capas a CPU.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante) manteniendo contexto moderado.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`, `llama-bench`), y por compatibilidad de formato GGUF, frontends basados en llama.cpp como Ollama o interfaces tipo LM Studio, aunque no se documentan explícitamente en la model card.
- Latencia y throughput: 41,4 t/s de generación (tg128) en Tesla T4 con Q4_K_M; 18,0 t/s en F16 y 29,5 t/s en Q8_0 como referencia comparativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SomanathKS/Qwen2.5-7B-Instruct-GGUF | 7,6B | 32.768 (en este GGUF) | GGUF Q4_K_M | Apache-2.0 | Cuantización de un solo archivo, 4,68 GB |
| Qwen/Qwen2.5-7B-Instruct (base) | 7,6B | 131.072 (con YaRN) | safetensors BF16 | Apache-2.0 | Modelo original, mayor contexto y precisión |
| Otras cuantizaciones GGUF de Qwen2.5-7B-Instruct | 7,6B | variable según configuración | GGUF (múltiples quants) | Apache-2.0 | Suelen ofrecer varios niveles (Q2 a Q8) y a veces YaRN aplicado |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento cualitativo con alternativas de otros fabricantes; la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda todos los sesgos y limitaciones del Qwen2.5-7B-Instruct original.
- Riesgo de alucinación inherente a los modelos de lenguaje de 7B; no se han publicado evaluaciones específicas de fidelidad en esta publicación.
- Contexto efectivo reducido a 32.768 tokens: el contexto de 131.072 del modelo base requiere YaRN, que no se aplicó en este GGUF.
- La model card declara únicamente inglés como idioma soportado; el comportamiento en castellano u otros idiomas no está verificado.
- Pérdida de calidad por cuantización: aproximadamente un 1,7 % de aumento de perplejidad respecto a F16.
- Licencia Apache-2.0 permite uso comercial, pero al ser una modificación de los pesos originales conviene revisar también la licencia y condiciones del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni mantenimiento demostrado.
- Solo se publica un archivo Q4_K_M; no hay opciones de mayor o menor precisión en este repositorio.
- Las mediciones de rendimiento provienen de una única T4 compartida y pueden diferir en otro hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SomanathKS/Qwen2.5-7B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- llama.cpp (repositorio del motor de inferencia): https://github.com/ggml-org/llama.cpp
