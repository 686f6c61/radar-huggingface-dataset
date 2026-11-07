# Minguinho-zeze/Qwen3-8B-W2A16-AWQ-Trace

## Resumen

Qwen3-8B-W2A16-AWQ-Trace es un checkpoint de investigación publicado por el usuario Minguinho-zeze como parte del proyecto `lowbit-reasoning-ptq`. Se trata de una cuantización post-entrenamiento (PTQ) del modelo Qwen3-8B de Alibaba Qwen, aplicando pesos simétricos INT2 con activaciones sin cuantizar de 16 bits (W2A16), grupo de tamaño 128 y algoritmo AWQ. El modelo base es un transformer denso de 8.190.735.360 parámetros con licencia Apache-2.0.

El propósito declarado de esta publicación no es ofrecer un modelo útil para inferencia, sino reproducir e investigar un fallo severo en ejecuciones de razonamiento con bits muy bajos. Según la model card, la precisión colapsa a valores cercanos a cero bajo el protocolo de evaluación reportado, por lo que el autor indica explícitamente que no se recomienda su uso para inferencia práctica. Es relevante ahora como artefacto de diagnóstico para la comunidad que investiga cuantización extrema (2 bits) en modelos de razonamiento.

El repositorio ocupa 4,3 GB y emplea el formato compressed-tensors, no GGUF ni AutoAWQ, y está pensado para ejecutarse con vLLM en GPUs Blackwell. Incluye diagnósticos de referencia y de kernels comprimidos en el directorio `diagnostics/`, aunque el autor advierte que estos no establecen la causa del fallo ni garantizan la corrección del kernel en distintas longitudes de secuencia y lotes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de carga usa `max_model_len=34816` y un presupuesto de salida de 32.768 tokens |
| Tipos de cuantización | W2A16: pesos INT2 simétricos, activaciones 16 bits sin cuantizar, grupo de 128; algoritmo AWQ |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no GGUF, no AutoAWQ) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-8B original, un transformer denso de unos 8.190 millones de parámetros. Sobre esa base no se realizó entrenamiento adicional: la publicación es exclusivamente una cuantización post-entrenamiento. La cuantización aplica INT2 simétrico a los pesos con activaciones BF16/16 bits sin cuantizar (W2A16), grupo de tamaño 128, mediante el algoritmo AWQ. La fracción de parámetros cuantizados es del 84,800291 %; las capas de embedding, normalización y `lm_head` quedan sin cuantizar. La caché KV se mantuvo en BF16 durante la evaluación.

La calibración se realizó con trazas de razonamiento de Qwen3-8B en BF16 generadas a partir de problemas de NuminaMath-1.5. El generador excluye la fuente `amc_aime` y filtra solapamientos de n-gramas de 13 palabras con las preguntas de evaluación. Se usaron 128 ventanas de 2.048 tokens con semilla 0. Los metadatos exactos de cuantización y la receta están en `recipe.yaml`, `quant_meta.json` y `config.json`. No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.) más allá de la propia cuantización extrema.

## Capacidades

- Generación de texto y razonamiento en modo thinking, heredados del Qwen3-8B base (la model card muestra la llamada con `enable_thinking: True`).
- Conversación multi-turno mediante plantilla de chat (`llm.chat` en el ejemplo de vLLM).
- Razonamiento matemático y científico (la evaluación se centra en AIME y GPQA Diamond).
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio): no disponible; el pipeline es text-generation.
- Advertencia: según el autor, la precisión es prácticamente nula bajo el protocolo reportado, por lo que estas capacidades no son fiables en la práctica con este checkpoint.

## Casos de uso

- Reproducción de experimentos de cuantización extrema: sirve para replicar la ejecución `qwen3-8b__w2a16__awq__trace` y verificar el colapso de precisión documentado por el autor.
- Diagnóstico de kernels INT2: los archivos de `diagnostics/` permiten analizar rutas de referencia y kernels comprimidos, útil para quienes depuran implementaciones de cuantización a 2 bits.
- Investigación sobre degradación del razonamiento: permite estudiar por qué el modo thinking de Qwen3 falla con pesos INT2, comparando contra el modelo BF16 en AIME-120 y GPQA Diamond.
- Validación de pipelines de compressed-tensors y vLLM: sirve como caso de prueba para integraciones de vLLM 0.32.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17 en GPUs Blackwell.
- Estudio de calibración con trazas de razonamiento: el conjunto de calibración (NuminaMath-1.5 filtrado, 128 ventanas de 2.048 tokens) puede reutilizarse para comparar estrategias de calibración en PTQ.
- Referencia negativa en publicaciones: útil como baseline de fallo al reportar resultados de nuevas técnicas de cuantización de 2 bits en modelos de razonamiento.
- No se recomienda para atención al cliente, generación de código en producción ni ningún despliegue real, dado el colapso de precisión declarado.

## Benchmarks y rendimiento

Resultados reportados en la model card (precisión en porcentaje, media de las semillas 0, 1 y 2; 120 preguntas AIME y 198 de GPQA Diamond por semilla; modo thinking activado; temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntúan como incorrectas):

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (W2A16 AWQ) | 0,00 | 0,00 |

El autor advierte que estas puntuaciones describen su protocolo y no son puntuaciones oficiales de Qwen. Las ejecuciones de precisión se realizaron en GPUs RTX 5090 y RTX PRO 4500 Blackwell, y las pequeñas diferencias no deben atribuirse únicamente a los algoritmos. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 4,3 GB y la cuantización de pesos es INT2 con grupo de 128, aunque las activaciones y la caché KV se mantienen en BF16.
- GPUs recomendadas: el autor validó el experimento en RTX 5090 y RTX PRO 4500 Blackwell; otras GPUs no han sido validadas por esta publicación.
- ¿Cabe en GPU consumer? El tamaño de pesos (4,3 GB) sugiere que sí en GPUs consumer modernas, pero no se confirma oficialmente para este checkpoint.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0, PyTorch 2.13.0 y Transformers 5.17.0; para INT2 se requiere humming-kernels 0.1.17 y añadir el directorio de la librería CUDA NVRTC a `LD_LIBRARY_PATH` antes de la compilación JIT de Humming.
- Latencia y throughput: no disponible en la información proporcionada; la model card remite a métricas de velocidad en el repositorio de informes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME-120 | GPQA Diamond | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Este checkpoint (W2A16 AWQ) | 8,19 B | no disponible | 0,00 | 0,00 | Apache-2.0 | compressed-tensors |
| Qwen3-8B BF16 (base) | 8,19 B | no disponible | 71,39 | 61,11 | Apache-2.0 | safetensors |
| Qwen3-8B-AWQ (oficial de Qwen) | 8,19 B | no disponible | no disponible | no disponible | Apache-2.0 | no disponible en la información proporcionada |

La comparación con Qwen3-8B-AWQ oficial se limita a la existencia del repositorio; no se han encontrado en la información proporcionada sus resultados de benchmarks ni sus especificaciones de cuantización detalladas.

## Limitaciones y advertencias

- Colapso de precisión: 0,00 % en AIME-120 y GPQA Diamond bajo el protocolo reportado, frente a 71,39 % y 61,11 % del modelo BF16. El autor lo describe como un fallo severo y no recomienda su uso para inferencia práctica.
- Causa del fallo no establecida: los diagnósticos incluidos no determinan el origen del fallo ni garantizan la corrección del kernel en distintas longitudes de secuencia y lotes.
- Validación limitada: solo se validó en GPUs Blackwell (RTX 5090, RTX PRO 4500) con versiones concretas de vLLM, PyTorch, Transformers y compressed-tensors; otras combinaciones no han sido verificadas.
- Riesgo de alucinación: no evaluado en la información disponible; dado el colapso de precisión, cualquier salida es poco fiable.
- Idiomas soportados: no disponible; no se documenta cobertura multilingüe de este checkpoint.
- Licencia: Apache-2.0, con la licencia upstream incluida en `LICENSE`; no se documentan restricciones adicionales para uso comercial, pero el propio autor desaconseja el uso práctico.
- Formato no estándar: no es GGUF ni AutoAWQ, lo que limita su uso con llama.cpp, Ollama u otras herramientas fuera del ecosistema vLLM/compressed-tensors.
- Sesgos conocidos: no disponible en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-8B-W2A16-AWQ-Trace
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq
- Informe de evaluación: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Commit del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Configuración del motor de inferencia: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Qwen3-8B-AWQ oficial: https://huggingface.co/Qwen/Qwen3-8B-AWQ
- Repositorio de la serie Qwen3: https://github.com/QwenLM/Qwen3.8
