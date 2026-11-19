# ggml-org-dev/tiny-d1-Omni-2B-for-testing-GGUF

## Resumen

`tiny-d1-Omni-2B-for-testing-GGUF` es una conversión a formato GGUF de un modelo derivado de LiquidAI/d1-Omni-2B, publicada por la organización ggml-org-dev. Según la propia model card, se trata de una **copia modificada y dañada** del modelo original, creada exclusivamente para probar software: su salida es intencionadamente incoherente ("gibberish"). No es un modelo destinado a inferencia real ni a producción.

El modelo base declarado es `ggml-org-dev/tiny-d1-Omni-2B-for-testing`, del cual este repositorio es una conversión GGUF realizada con `convert_hf_to_gguf.py` de llama.cpp, con el modelo de texto y el proyector multimodal (mmproj) en F16 y el modelo de texto cuantizado a Q8_0 mediante `llama-quantize`. Se utiliza en las pruebas del servidor de llama.cpp para el tipo de decisión `lfm3-d1-omni`.

A pesar del nombre "2B", el recuento real de parámetros en safetensors es de 34.481.472 (aproximadamente 34,5 millones), lo que confirma que se trata de un modelo "tiny" de pruebas, no de un modelo de 2 mil millones de parámetros. El tamaño del repositorio es de 0,1 GB. Su relevancia es puramente instrumental: sirve como fixture de test para validar el soporte de modelos multimodales de tipo decisión en llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de LiquidAI/d1-Omni-2B; incluye modelo de texto y proyector multimodal mmproj) |
| Parametros totales | 34.481.472 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (modelo de texto); F16 (modelo de texto y mmproj en la conversión) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de que deriva de LiquidAI/d1-Omni-2B y de que el paquete GGUF incluye un modelo de texto y un proyector multimodal (mmproj), lo que indica capacidades multimodales en el diseño original. La model card no detalla el tipo de transformer, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única información técnica concreta es el proceso de conversión: `convert_hf_to_gguf.py` de llama.cpp generó los pesos en F16 para texto y mmproj, y posteriormente `llama-quantize` cuantizó el modelo de texto a Q8_0. El modelo está etiquetado como `decision-model` y `conversational`, y se emplea en las pruebas del servidor de llama.cpp para el tipo de decisión `lfm3-d1-omni`.

## Capacidades

- Generación de texto: técnicamente el modelo puede emitir tokens, pero la model card advierte explícitamente que la salida es incoherente y sin utilidad.
- Procesamiento multimodal: el paquete incluye un proyector mmproj, lo que sugiere que el modelo base soporta entrada de imagen o audio, aunque no se detalla qué modalidades.
- Clasificación de decisión: etiquetado como `decision-model`, se usa para validar el tipo de decisión `lfm3-d1-omni` en llama.cpp.
- Conversación: etiquetado como `conversational`, aunque sin garantía de calidad por tratarse de una copia dañada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles más allá del indicio multimodal del mmproj.

## Casos de uso

- Pruebas de integración de llama.cpp: validar que el servidor de llama.cpp carga correctamente un GGUF con modelo de texto y mmproj y que el tipo de decisión `lfm3-d1-omni` se resuelve sin errores.
- Verificación de conversión HF a GGUF: comprobar que `convert_hf_to_gguf.py` produce un GGUF válido a partir de un modelo base con componentes multimodales.
- Validación de cuantización Q8_0: testear que `llama-quantize` genera pesos Q8_0 cargables y ejecutables por el runtime.
- CI/CD de llama.cpp: usar el modelo como fixture ligero (0,1 GB) en pipelines de integración continua para detectar regresiones en la carga de modelos multimodales.
- Pruebas de humo del endpoint compatible con OpenAI: verificar que `llama-server -hf ...:Q8_0` arranca y responde, sin evaluar la calidad del contenido.
- Desarrollo de herramientas de inspección de GGUF: analizar metadatos, tensores y el proyector mmproj en un paquete pequeño y de estructura representativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte que la salida del modelo es incoherente, por lo que cualquier evaluación de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el paquete completo en Q8_0 (repositorio de 0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también ejecutable en CPU.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.) y en sistemas integrados.
- Opciones de despliegue: llama.cpp (`llama-server -hf ggml-org-dev/tiny-d1-Omni-2B-for-testing-GGUF:Q8_0`), y por extensión cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; al tratarse de un modelo de pruebas, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Propósito |
|---|---|---|---|---|---|
| tiny-d1-Omni-2B-for-testing-GGUF | 34,5 M | no disponible | GGUF (Q8_0) | lfm1.0 | Pruebas de software |
| LiquidAI/d1-Omni-2B | no disponible | no disponible | safetensors | LFM Open License v1.0 | Modelo original multimodal |
| ggml-org-dev/tiny-d1-Omni-2B-for-testing | 34,5 M | no disponible | safetensors | lfm1.0 | Modelo base de pruebas |

No se dispone de datos de rendimiento ni de benchmarks para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Copia dañada: la model card indica explícitamente que es una copia modificada y dañada del modelo original y que su salida es incoherente. No debe usarse para inferencia real.
- Sesgos conocidos: no disponibles; no se ha documentado ningún análisis de sesgo.
- Riesgo de alucinación: total, ya que la salida es intencionadamente sin sentido.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: hereda la LFM Open License v1.0 del modelo original de Liquid AI; es necesario revisar los términos para cualquier uso derivado, aunque el propósito declarado es exclusivamente de pruebas.
- Caveat para producción: no apto para producción bajo ninguna circunstancia; su único uso legítimo es como fixture de test en el desarrollo de llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org-dev/tiny-d1-Omni-2B-for-testing-GGUF
- Modelo base de pruebas: https://huggingface.co/ggml-org-dev/tiny-d1-Omni-2B-for-testing
- Modelo original: https://huggingface.co/LiquidAI/d1-Omni-2B
- Licencia LFM Open License v1.0: incluida en el repositorio (archivo LICENSE)
- llama.cpp (herramientas de conversión y cuantización): no disponible en la información proporcionada
