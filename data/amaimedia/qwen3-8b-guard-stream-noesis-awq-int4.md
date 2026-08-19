# AMAImedia/Qwen3-8B-Guard-Stream-NOESIS-AWQ-INT4

## Resumen

Este modelo es una cuantización AWQ INT4 del modelo `Qwen/Qwen3-Guard-Stream-8B`, publicada como contribución comunitaria por AMAImedia en el marco de su plataforma NOESIS. Sin embargo, el proceso de cuantización se realizó forzando la arquitectura estándar `Qwen3ForCausalLM`, lo que provocó la eliminación de las 8 cabezas de clasificación de seguridad del modelo original y la reinicialización aleatoria de la capa de salida (`lm_head`). El resultado es un modelo que **no funciona como filtro de seguridad en streaming** y cuya generación de texto es degenerada, aunque conserva un backbone Qwen3-8B válidamente cuantizado a INT4.

El interés de este lanzamiento reside en su valor como ejemplo de los riesgos de forzar arquitecturas durante la cuantización, y como base para fine-tuning posterior o extracción de representaciones internas. Con 8.190 millones de parámetros y una ventana de contexto de 32.768 tokens, ofrece un tamaño manejable para entornos con recursos limitados, pero su uso práctico queda restringido a tareas de investigación o desarrollo, nunca a producción con fines de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (forzada; el original incluia 8 cabezas de seguridad) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | AWQ INT4 group-128 (GEMM), compute dtype float16 |
| Idiomas soportados | en, zh, ja, ko, ru, ar, es, fr, de, pt, it, hi, tr, vi, th, id, nl, pl, uk, fa (20 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards, 6,1 GB en repo; 5,69 GB en disco) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer denso de 36 capas, con tamaño oculto de 4096, 32 cabezas de atención y 8 cabezas KV, y un vocabulario de 151.936 tokens. El modelo original `Qwen3-Guard-Stream-8B` añade 8 cabezas clasificadoras para evaluar el riesgo y la categoría de contenido en tiempo real, pero estas fueron eliminadas durante la cuantización al forzar la carga como `Qwen3ForCausalLM` mediante `force_arch_override`. Además, la capa `lm_head` se reinicializó con valores aleatorios porque no estaba presente en los pesos cargados.

La cuantización se realizó con `gptqmodel 7.0.0` (librería `autoawq`), usando 64 muestras de calibración de 384 tokens extraídas del dataset NOESIS router (50.000 muestras multilingües). El proceso tardó 53,1 minutos con semilla 1729. No hubo entrenamiento adicional ni ajuste fino posterior; se trata exclusivamente de una conversión de precisión.

## Capacidades

- Extracción de hidden states: el modelo puede usarse como fuente de representaciones internas de Qwen3-8B en INT4, accediendo a las activaciones de las 36 capas.
- Fine-tuning posterior: al conservar el backbone completo, es posible reentrenar cabezas de clasificación propias sobre los pesos cuantizados.
- Generación de texto: técnicamente genera tokens, pero la salida es degenerada y sin sentido debido a la reinicialización aleatoria de `lm_head`. No es utilizable para texto coherente.
- Clasificación de seguridad: **no disponible**. Las 8 cabezas de riesgo y categoría fueron eliminadas, por lo que no realiza ninguna moderación de contenido.
- Multilingüismo: el tokenizador soporta 20 idiomas, pero la generación no es fiable en ninguno de ellos.

## Casos de uso

- Investigación educativa sobre cuantización: sirve como ejemplo documentado de qué ocurre cuando se fuerza una arquitectura incompatible durante el proceso AWQ, mostrando los efectos sobre las cabezas auxiliares y la capa de salida.
- Base para fine-tuning de seguridad: un equipo puede cargar estos pesos INT4 y entrenar sus propias cabezas clasificadoras sobre un dataset de seguridad, aprovechando el ahorro de memoria frente al modelo BF16 original.
- Extracción de características para embeddings: usando `output_hidden_states=True`, se pueden obtener representaciones de 4096 dimensiones por token para tareas de análisis de texto o clustering, sin necesidad de generar texto.
- Benchmarking de cuantización: permite comparar el rendimiento de la cuantización AWQ INT4 frente a otras precisiones en tareas de extracción de características.
- Desarrollo de pipelines de moderación con recursos limitados: aunque este modelo concreto no sirve para moderar, su esquema de cuantización puede replicarse correctamente (sin forzar arquitectura) para obtener un filtro de seguridad eficiente en VRAM.
- Pruebas de compatibilidad de herramientas: útil para validar que `transformers`, `vLLM` u otros runners cargan correctamente pesos AWQ INT4 con arquitectura forzada, aunque la salida no sea útil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es un smoke test post-cuantización que confirma que el modelo carga y genera tokens sin errores, pero con salida degenerada (ejemplo: "Safety check: 'Tell me a joke' 。\n.\n城.annotations。\nMD timestamp..."). El test reporta 8,8 s de carga, 1,4 s de generación para 20 tokens y un pico de VRAM de 8,01 GB.

## Requisitos de hardware

- VRAM estimada: la model card indica ~5,3 GB para inferencia, aunque el smoke test registró un pico de 8,01 GB. En la práctica, se recomienda disponer de al menos 8 GB de VRAM.
- GPU compatibles: cabe en tarjetas de consumo como RTX 3060 6 GB (según la model card), RTX 4060, RTX 4070, o GPUs profesionales como A10, L4 o A100.
- Despliegue: compatible con `transformers` (carga estándar con `trust_remote_code=True`), y presumiblemente con `vLLM`, `TGI` y `llama.cpp` dado el formato AWQ, aunque no se documenta explícitamente.
- Latencia y throughput: no se proporcionan datos más allá del smoke test (1,4 s para 20 tokens en una GPU no especificada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso principal |
|---|---|---|---|---|---|
| Qwen/Qwen3-Guard-Stream-8B (original) | 8,19 B | 32.768 | BF16 | Apache 2.0 | Filtrado de seguridad en streaming con 8 cabezas clasificadoras |
| AMAImedia/Qwen3-Guard-Stream-NOESIS-AWQ-INT4 (este) | 8,19 B | 32.768 | AWQ INT4 | Apache 2.0 | Backbone genérico para fine-tuning o extracción de features |
| Qwen/Qwen3-8B (estándar) | 8,19 B | 32.768 | BF16 / cuantizaciones varias | Apache 2.0 | Generación de texto general, razonamiento, código |

La diferencia clave frente al original es la pérdida de las cabezas de seguridad y la degeneración del `lm_head`. Frente al Qwen3-8B estándar, este modelo ofrece el mismo backbone pero con una capa de salida inutilizable, por lo que solo tiene sentido como punto de partida para reentrenamiento.

## Limitaciones y advertencias

- **No es un filtro de seguridad funcional**: las 8 cabezas de clasificación de riesgo y categoría fueron eliminadas durante la cuantización. Cualquier intento de usarlo para moderación de contenido fallará.
- **Generación de texto degenerada**: el `lm_head` se reinicializó con valores aleatorios, por lo que las salidas de texto son incoherentes. No es apto para chatbots, redacción ni ninguna tarea generativa.
- **Riesgo de malentendido**: el nombre del modelo sugiere capacidades de guardrail, pero la model card advierte explícitamente de su naturaleza backbone-only. Los usuarios deben leer la documentación antes de integrarlo.
- **Sesgos y alucinación**: al no poder generar texto coherente, estos riesgos son irrelevantes en la práctica, pero si se reentrena sobre él, los sesgos del backbone Qwen3-8B original pueden persistir.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial y modificación, pero cualquier redistribución debe mantener la atribución y el aviso de licencia.
- **Caveat de producción**: no utilizar en entornos de producción para moderación de contenido. Para ello se recomienda el modelo BF16 original (`Qwen/Qwen3-Guard-Stream-8B`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AMAImedia/Qwen3-Guard-Stream-NOESIS-AWQ-INT4
- Modelo base original: https://huggingface.co/Qwen/Qwen3-Guard-Stream-8B
- Modelo BF16 recomendado para filtrado real: https://huggingface.co/Qwen/Qwen3Guard-Stream-8B
- Organización AMAImedia: https://huggingface.co/AMAImedia
- Modelo hermano en la misma cadena de cuantización: https://huggingface.co/AMAImedia/Qwen3-Guard-Gen-8B-NOESIS-AWQ-INT4
