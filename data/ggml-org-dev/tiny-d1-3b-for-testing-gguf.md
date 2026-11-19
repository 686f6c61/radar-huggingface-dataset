# ggml-org-dev/tiny-d1-3B-for-testing-GGUF

## Resumen

`tiny-d1-3B-for-testing-GGUF` es un artefacto de prueba publicado por la organización `ggml-org-dev` en Hugging Face. No es un modelo destinado a uso real: la propia model card lo describe como una "copia modificada y dañada" de `LiquidAI/d1-3B`, creada exclusivamente para validar el software de llama.cpp. Su salida es, según el autor, "gibberish" (texto sin sentido), por lo que cualquier evaluación de calidad queda fuera de su propósito.

El modelo parte de una arquitectura de tipo decision model (etiquetado como `decision-model` y `conversational` en los tags de Hugging Face), derivada de la familia LFM de Liquid AI. El repositorio base `ggml-org-dev/tiny-d1-3B-for-testing` fue convertido a GGUF mediante `convert_hf_to_gguf.py` y posteriormente alterado: el vocabulario del modelo de texto se recortó de 128.000 a 2.471 tokens (tokens especiales, caracteres individuales, palabras de etiqueta de decisión y las primeras 2.000 fusiones BPE, con renumeración de IDs) y se cuantizó a Q4_0.

Su relevancia es puramente instrumental: sirve como fixture para las pruebas del servidor de llama.cpp en el tipo de decisión `lfm2-d1`. Aunque el nombre sugiere 3B parámetros, el dato real de safetensors indica 421.504 parámetros totales, lo que confirma que se trata de un modelo diminuto de test, no de un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decision model (derivado de LiquidAI/d1-3B, familia LFM) |
| Parametros totales | 421.504 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (modelo de texto), Q8_0 (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF (texto y mmproj) |

## Arquitectura y entrenamiento

El modelo deriva de `LiquidAI/d1-3B`, un decision model de la familia LFM de Liquid AI. La model card no detalla la arquitectura interna (transformer, MoE, SSM o híbrida), los datos de entrenamiento, el número de tokens ni si hubo RLHF o DPO. Lo único documentado es el proceso de conversión y alteración: conversión a GGUF con `convert_hf_to_gguf.py` de llama.cpp en F16, recorte del vocabulario de 128.000 a 2.471 tokens con renumeración de IDs, y cuantización a Q4_0 con `llama-quantize` (incluyendo el token embedding). El mmproj se cuantizó a Q8_0.

La innovación técnica relevante no está en el modelo sino en su función: sirve para probar el tipo de decisión `lfm2-d1` en el servidor de llama.cpp. El recorte de vocabulario y la cuantización agresiva hacen que cualquier texto siga tokenizándose, pero en más piezas, lo que permite ejercitar rutas de código específicas del tokenizador y del servidor sin necesidad de cargar el modelo completo.

## Capacidades

- No es un modelo funcional: su salida es texto sin sentido según la propia model card.
- Etiquetado como `decision-model` y `conversational` en Hugging Face, heredado del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Uso previsto: pruebas del servidor de llama.cpp para el tipo de decisión `lfm2-d1`.

## Casos de uso

- Pruebas de integración de llama.cpp: se carga con `llama-server -hf ggml-org-dev/tiny-d1-3B-for-testing-GGUF:Q4_0` para validar el arranque del servidor y la ruta del tipo de decisión `lfm2-d1`.
- Validación del tokenizador GGUF: el vocabulario recortado a 2.471 tokens permite comprobar que cualquier texto se tokeniza correctamente en más piezas, ejercitando rutas de fallback del tokenizador.
- Pruebas de cuantización Q4_0 y Q8_0: verifica que `llama-quantize` produce artefactos cargables y que el servidor los procesa sin errores.
- CI/CD de llama.cpp: sirve como fixture ligero (repo de 0.0 GB) en pipelines que necesitan un modelo GGUF real sin coste de almacenamiento ni de cómputo.
- Pruebas de mmproj: el mmproj en Q8_0 permite validar la carga de proyecciones multimodales en el servidor, aunque la model card no detalla capacidades de visión.
- Reproducción de bugs: al ser un artefacto determinista y pequeño, facilita la reproducción de incidencias en el servidor de llama.cpp relacionadas con vocabularios recortados o cuantizaciones agresivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 421.504 parámetros y cuantización Q4_0, el modelo es extremadamente pequeño y cabe en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no aplica; cualquier GPU con soporte de llama.cpp es suficiente.
- Cabe en consumer GPU: sí, en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-quantize`); otras opciones (vLLM, TGI, Ollama) no están documentadas para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Proposito |
|---|---|---|---|---|---|
| tiny-d1-3B-for-testing-GGUF | 421.504 | no disponible | LFM Open License v1.0 | Hugging Face (GGUF) | Pruebas de software |
| LiquidAI/d1-3B | no disponible | no disponible | LFM Open License v1.0 | Hugging Face | Decision model de produccion |
| ggml-org-dev/tiny-d1-3B-for-testing | no disponible | no disponible | LFM Open License v1.0 | Hugging Face | Pruebas de software (base del GGUF) |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo es una copia modificada y dañada: su salida es texto sin sentido, según la model card.
- No debe usarse para nada distinto de pruebas de software.
- El tokenizador no es el original: el vocabulario se recortó de 128.000 a 2.471 tokens y los IDs se renumeraron, por lo que la tokenización difiere del modelo base.
- La licencia LFM Open License v1.0 impone restricciones que deben revisarse antes de cualquier uso derivado; el uso comercial no está garantizado por la información disponible.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: total, al ser un artefacto de prueba sin capacidad real de generación coherente.
- Limitaciones de contexto e idioma: no disponibles.
- El dato de 421.504 parámetros contradice el "3B" del nombre; se trata de un modelo diminuto de test.

## Enlaces

- Hugging Face: https://huggingface.co/ggml-org-dev/tiny-d1-3B-for-testing-GGUF
- Modelo base: https://huggingface.co/ggml-org-dev/tiny-d1-3B-for-testing
- Modelo original: https://huggingface.co/LiquidAI/d1-3B
- Licencia: https://huggingface.co/ggml-org-dev/tiny-d1-3B-for-testing-GGUF/blob/main/LICENSE
