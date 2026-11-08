# bunnycore/Qcoder-v1-2B-Lora

## Resumen

Qcoder-v1-2B-Lora es un adaptador LoRA publicado por el usuario bunnycore sobre el modelo base `unsloth/Qwen3.5-2B`. Se distribuye como un adapter PEFT (no como un modelo completo) y su propósito declarado es la generación de texto con orientación conversacional y de código, a juzgar por el nombre del repositorio. El adaptador contiene 33.638.400 parámetros entrenables y el repositorio ocupa aproximadamente 0,3 GB, lo que es coherente con un LoRA de rango moderado sobre un modelo de 2B.

La información pública es extremadamente escasa: la model card es la plantilla por defecto de Hugging Face sin rellenar, con todos los campos marcados como "[More Information Needed]". No se declaran licencia, idiomas, datos de entrenamiento, hiperparámetros ni resultados de evaluación. El autor no ha publicado documentación técnica asociada y el modelo registra 0 descargas y 0 likes en el momento de la consulta.

Por tanto, esta ficha describe lo que puede verificarse a partir de los metadatos del repositorio (arquitectura PEFT/LoRA, modelo base, tamaño del adaptador, formatos disponibles) y marca explícitamente como "no disponible" todo aquello que el autor no ha hecho público. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que no existe evidencia publicada de calidad, seguridad ni comportamiento del adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only; modelo base `unsloth/Qwen3.5-2B` |
| Parámetros totales | 33.638.400 (solo adaptador LoRA; el modelo base no está incluido en el repo) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; el autor no la declara) |
| Tipos de cuantización | no disponible (el repo incluye safetensors y GGUF según los tags) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF |
| Librería | peft 0.18.1, transformers, unsloth |
| Modelo base | unsloth/Qwen3.5-2B |
| Tamaño del repositorio | 0,3 GB |
| Pipeline | text-generation |
| Fecha de creación | 2026-11-08 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del modelo base `unsloth/Qwen3.5-2B`, un transformer decoder-only de aproximadamente 2.000 millones de parámetros. El adaptador añade 33.638.400 parámetros entrenables distribuidos en las matrices de bajo rango que PEFT inyecta en las capas del modelo base. Para la inferencia es imprescindible cargar primero el modelo base y aplicar después el adaptador; el repositorio no contiene los pesos completos.

No hay información publicada sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicó RLHF, DPO o supervisión pura, ni los hiperparámetros (rango, alpha, dropout, learning rate). El tag `unsloth` sugiere que el entrenamiento se realizó con la librería Unsloth, orientada a fine-tuning eficiente en memoria, pero esto es una inferencia a partir del tag y no un dato confirmado por el autor. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.5-2B.
- Orientación declarada a código y uso conversacional, deducida del nombre del repositorio ("Qcoder") y del pipeline `text-generation`; no hay evaluación que lo respalde.
- Soporte de tool calling / function calling: no disponible (no declarado por el autor).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con el ecosistema PEFT/transformers y con despliegue en formato GGUF (según los tags del repo).

## Casos de uso

- Prototipado rápido de asistentes conversacionales en local: al ser un adaptador de 0,3 GB sobre un base de 2B, permite experimentar con un modelo especializado sin infraestructura dedicada, cargando el base y aplicando el LoRA con `PeftModel.from_pretrained`.
- Evaluación comparativa de fine-tunings comunitarios: útil como punto de partida para medir si un LoRA pequeño sobre Qwen3.5-2B mejora tareas de código frente al base, siempre con un conjunto de evaluación propio dado que no hay benchmarks publicados.
- Generación de código asistida en entornos con recursos limitados: el tamaño del adaptador y del base permite ejecución en GPU de consumo, adecuado para autocompletado o generación de snippets en herramientas de desarrollo locales.
- Base para fine-tuning adicional (LoRA sobre LoRA o merging): el adaptador puede fusionarse con el base o servir de inicialización para un segundo ciclo de ajuste con datos propios del dominio.
- Despliegue en formato GGUF con llama.cpp u Ollama: el repo incluye GGUF según los tags, lo que facilita probar el adaptador en CPU o GPU modesta sin pipeline de transformers.
- Investigación sobre adaptadores de bajo rango: el reducido número de parámetros (33,6 M) lo hace manejable para estudiar el efecto del rango, la inicialización o el merging en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,3 GB; el requisito real lo determina el modelo base Qwen3.5-2B.
- VRAM estimada para el base en fp16: aproximadamente 4-5 GB (2B parámetros × 2 bytes más overhead de activaciones y KV cache).
- VRAM estimada en cuantización de 8 bits: aproximadamente 2,5-3 GB; en 4 bits: aproximadamente 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores en fp16, y en GPUs de 4-6 GB con cuantización 4 bits.
- Opciones de despliegue: transformers + PEFT para el adaptador; llama.cpp u Ollama para la variante GGUF; vLLM y TGI requerirían fusionar el adaptador con el base previamente.
- Latencia y throughput: no disponibles (no publicados por el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qcoder-v1-2B-Lora | 33,6 M (adaptador) + base 2B | no disponible | no disponible | safetensors, GGUF | Sin benchmarks ni model card; 0 descargas |
| Qwen3.5-2B (base) | ~2B | no disponible en esta ficha | la del modelo base | safetensors, GGUF | Modelo de referencia sin el ajuste LoRA |
| Otros LoRA comunitarios sobre Qwen 2B | variable | heredado del base | variable | safetensors, GGUF | Ecosistema amplio; calidad muy dependiente del autor |

La comparación cuantitativa con alternativas no es posible porque no hay resultados de evaluación publicados para este adaptador ni datos de rendimiento declarados. Cualquier comparación de calidad requeriría una evaluación propia sobre el mismo conjunto de tareas.

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos de entrenamiento, sesgos, riesgos ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; además, la licencia efectiva queda condicionada por la del modelo base `unsloth/Qwen3.5-2B`, que debe consultarse por separado.
- Riesgo de alucinación desconocido y no evaluado; no hay benchmarks que cuantifiquen su fiabilidad.
- Idiomas soportados no declarados; no se puede asumir un buen rendimiento en castellano.
- Longitud de contexto no declarada por el autor; depende del base y de cómo se haya configurado el entrenamiento.
- El repositorio tiene 0 descargas y 0 likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Al ser un adaptador LoRA, no es autocontenido: requiere descargar el modelo base y aplicar el adaptador, con el riesgo de incompatibilidad si el base cambia de revisión.
- No hay información sobre el proceso de entrenamiento, por lo que no puede auditarse la procedencia de los datos ni posibles problemas de contaminación.

## Enlaces

- Hugging Face: https://huggingface.co/bunnycore/Qcoder-v1-2B-Lora
- Perfil del autor en Hugging Face: https://huggingface.co/bunnycore/models
- Estadísticas del autor en OpenModelStats: https://openmodelstats.com/owners/bunnycore
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Paper de estimación de emisiones citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
