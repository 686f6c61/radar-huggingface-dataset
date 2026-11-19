# ggml-org-dev/tiny-granite-switch-4.1-8b-for-testing-GGUF

## Resumen

`tiny-granite-switch-4.1-8b-for-testing-GGUF` es un artefacto de prueba publicado por la organización `ggml-org-dev` para validar funcionalidades del servidor de llama.cpp. No es un modelo destinado a uso real: la propia model card lo describe como una "copia modificada y dañada" de `ibm-granite/granite-switch-4.1-8b`, cuyo output es "gibberish" (texto sin sentido). Su propósito es servir como fixture en los tests del servidor de llama.cpp para el tipo de decisión `granite-switch` y para la generación de texto con adaptadores embebidos.

El modelo original del que deriva, `granite-switch-4.1-8b`, es un modelo de IBM orientado a decisiones con arquitectura de adaptadores (tags `decision-model` y `conversational`). Sin embargo, esta versión concreta ha sido drásticamente alterada: el vocabulario del GGUF se ha recortado de 100.355 a 3.446 tokens, conservando únicamente tokens especiales, caracteres individuales, tokens necesarios para las etiquetas de decisión y los resultados de las primeras 2.000 fusiones BPE. Los IDs de tokens, incluidos los de activación y sustitución de adaptadores, han sido remapeados.

El repositorio tiene un tamaño de 0,0 GB y registra 0 descargas y 0 likes en el momento de la consulta. El dato de "parámetros totales" reportado en safetensors (1.755.904) es coherente con un checkpoint recortado, no con un modelo de 8B. Cualquier evaluación de capacidades, rendimiento o uso en producción debe hacerse sobre el modelo base original, no sobre este artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (deriva de `granite-switch-4.1-8b`, arquitectura del original no detallada en la información proporcionada) |
| Parámetros totales | 1.755.904 (según safetensors del checkpoint recortado; el nombre indica 8B en el modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16 y Q4_0 (embeddings incluidos) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (convertido con `convert_hf_to_gguf.py` de llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `granite-switch-4.1-8b` en la documentación proporcionada. Los tags indican que es un `decision-model` de tipo conversacional, y la model card menciona soporte de adaptadores embebidos con tokens de control específicos (`<|guardian-core|>` y `<|decision|>`) y campos `adapters.token_ids_activate` / `token_ids_substitute`. Esto sugiere una arquitectura con mecanismo de enrutamiento o selección de adaptadores, pero no se detalla su implementación.

El proceso de creación de este artefacto consistió en convertir el checkpoint original a GGUF en F16 con el script de llama.cpp y cuantizarlo después a Q4_0 con `llama-quantize`. El vocabulario se truncó de 100.355 a 3.446 tokens preservando tokens especiales y de control, todos los caracteres individuales, los tokens requeridos por las etiquetas de decisión y los resultados de las primeras 2.000 fusiones BPE, con remapeo de IDs. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO.

## Capacidades

- El modelo no produce texto coherente: la model card indica explícitamente que su output es "gibberish".
- Conserva los tokens de control de adaptadores (`<|guardian-core|>` y `<|decision|>`), lo que permite probar el enrutamiento de adaptadores en llama.cpp.
- Conserva los tokens necesarios para las etiquetas de decisión del tipo `granite-switch`.
- Cualquier texto puede tokenizarse, pero se fragmenta en más tokens que con el tokenizador original.
- No se documentan capacidades de tool calling, agentes, razonamiento, código, matemáticas, visión ni audio.
- Capacidades multilingües: no disponible.

## Casos de uso

- Pruebas de integración de llama.cpp: sirve como fixture para validar el tipo de decisión `granite-switch` en el servidor, verificando que el enrutamiento de adaptadores y las etiquetas de decisión se procesan correctamente.
- Pruebas de generación de texto con adaptadores embebidos: permite comprobar que `llama-server` carga y aplica adaptadores usando los tokens de control remapeados.
- Validación de tokenizadores truncados: útil para verificar que el tokenizador GGUF maneja vocabularios recortados y IDs remapeados sin fallos.
- Tests de regresión en CI: al ser un repo de 0,0 GB, se descarga e inicializa rápido, lo que lo hace adecuado para pipelines de integración continua de llama.cpp.
- Verificación de cuantización Q4_0 con embeddings incluidos: permite comprobar el comportamiento de `llama-quantize` sobre un checkpoint pequeño.
- Pruebas de compatibilidad de endpoints: el tag `endpoints_compatible` sugiere su uso para validar la compatibilidad de la API del servidor con clientes que esperan modelos conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1.755.904 parámetros en Q4_0 el peso ronda unos pocos MB (el repo completo ocupa 0,0 GB).
- GPU recomendadas: cualquier GPU con soporte CUDA, ROCm o Metal es suficiente; también funciona en CPU.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU con memoria compartida.
- Opciones de despliegue: `llama-server` de llama.cpp (comando documentado: `llama-server -hf ggml-org-dev/tiny-granite-switch-4.1-8b-for-testing-GGUF:Q4_0`), `llama.cpp` en general y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; al ser un modelo de prueba con vocabulario truncado, las métricas no serían representativas de ningún caso real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| tiny-granite-switch-4.1-8b-for-testing-GGUF | 1.755.904 (checkpoint recortado) | no disponible | apache-2.0 | Fixture de pruebas para llama.cpp |
| ibm-granite/granite-switch-4.1-8b | 8B (según nombre) | no disponible | no disponible en la información proporcionada | Modelo de decisión conversacional de IBM |
| ggml-org-dev/tiny-granite-switch-4.1-8b-for-testing | no disponible | no disponible | apache-2.0 | Checkpoint base del que deriva este GGUF |

No se dispone de datos de rendimiento ni de benchmarks para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo genera texto sin sentido por diseño; no debe usarse para inferencia real, producción ni evaluación de calidad.
- Es una copia "modificada y dañada" del modelo original de IBM, según la propia model card.
- El vocabulario truncado (3.446 frente a 100.355 tokens) degrada la tokenización: cualquier texto se fragmenta en más tokens de lo normal.
- Los IDs de tokens están remapeados, incluidos los de activación y sustitución de adaptadores; no es intercambiable con el modelo original.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas del modelo base en la documentación proporcionada.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza de prueba lo desaconseja totalmente.
- No usar como sustituto del modelo `ibm-granite/granite-switch-4.1-8b` en ningún pipeline.

## Enlaces

- Hugging Face (este artefacto): https://huggingface.co/ggml-org-dev/tiny-granite-switch-4.1-8b-for-testing-GGUF
- Modelo base del que deriva: https://huggingface.co/ggml-org-dev/tiny-granite-switch-4.1-8b-for-testing
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-switch-4.1-8b
- Repositorio de llama.cpp (herramientas de conversión y cuantización): https://github.com/ggml-org/llama.cpp
