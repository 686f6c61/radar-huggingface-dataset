# bcckfdn/cevher2-test-16-decay-it-GGUF

## Resumen

cevher-2-test es un modelo de lenguaje de 1.514 millones de parámetros entrenado desde cero con la arquitectura de SmolLM2 (basada en Llama), desarrollado por el usuario bcckfdn y distribuido en formato GGUF para su ejecución con llama.cpp, Ollama y LM Studio. El modelo está orientado principalmente al turco y al inglés, lo que lo convierte en una alternativa ligera y abierta para tareas de generación de texto en turco, un idioma con menos opciones en el ecosistema de modelos pequeños.

La variante publicada en este repositorio corresponde a la versión instruida (indicada por el sufijo "-it" del modelo base `bcckfdn/cevher2-test-16-decay-it`), entrenada con un total de 712.704 millones de tokens según la model card del autor. Con licencia Apache 2.0 y tamaños de cuantización que van desde los 893 MB (Q4_K_M) hasta los 2.889 MB (BF16), resulta adecuado para su despliegue en hardware de consumo e incluso en dispositivos modestos. Su relevancia radica en la escasez de modelos pequeños de calidad optimizados para turco con licencias permisivas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolLM2 (arquitectura tipo Llama, transformer decoder-only) |
| Parámetros totales | 1.513.546.496 (≈1,5B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original usa safetensors) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura de SmolLM2, un transformer decoder-only con estructura tipo Llama. Según la model card del autor, utiliza una dimensión oculta (hidden size) de 1792 y 34 capas, con un entrenamiento desde cero (no se trata de un fine-tuning de un modelo preexistente). El sufijo "-it" del modelo base indica que se trata de una versión ajustada para seguir instrucciones, aunque no se ha publicado información sobre el método de alineación empleado (SFT, DPO, RLHF) ni sobre el dataset de instrucciones.

Respecto al entrenamiento, el autor declara un total de 712.704 millones de tokens procesados. No se ha publicado información sobre la composición del corpus, la distribución entre turco e inglés, ni sobre técnicas destacables como decodificación especulativa, attention lineal u otras innovaciones. El nombre del repositorio ("16-decay") sugiere una configuración concreta de learning rate decay, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto conversacional en turco e inglés (etiqueta `conversational`, uso con `-cnv` en llama.cpp).
- Seguimiento de instrucciones al tratarse de una versión instruida ("-it").
- Compatibilidad con el ecosistema llama.cpp, Ollama y LM Studio.
- Dado su tamaño (1,5B) y su origen como modelo entrenado desde cero, no hay evidencia publicada de capacidades avanzadas como tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible.

## Casos de uso

- Chatbots en turco en local: gracias a su tamaño reducido y a los cuantos Q4_K_M (893 MB), puede ejecutarse en portátiles sin GPU para asistentes conversacionales en turco.
- Asistentes bilingües turco-inglés: cubre ambos idiomas declarados, útil para aplicaciones con usuarios de ambos idiomas en un único modelo ligero.
- Prototipado con Ollama: la model card incluye un Modelfile de ejemplo, lo que facilita montar demos locales de chat en minutos.
- Integración en LM Studio: los archivos GGUF se pueden cargar directamente en LM Studio para pruebas interactivas sin escribir código.
- Inferencia en CPU con llama.cpp: al ser un modelo de 1,5B cuantizado, es viable la inferencia en CPU con latencias razonables para aplicaciones de escritorio.
- Base para fine-tuning en turco: al ser un modelo abierto con Apache 2.0 entrenado desde cero en turco, puede servir como punto de partida para ajustes finos específicos de dominio en ese idioma.
- Experimentación educativa: útil para estudiar el entrenamiento de modelos pequeños desde cero en lenguas de recursos medios como el turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,9 GB para Q4_K_M, 1,0 GB para Q5_K_M, 1,5 GB para Q8_0 y 2,9 GB para BF16, más overhead de contexto.
- GPU recomendadas: no requiere GPU; cualquier GPU de consumo con 2-4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050 o superiores) es más que suficiente si se desea aceleración.
- Cabe con holgura en GPUs de consumo actuales incluso en BF16, y en CPU con 4 GB de RAM libres.
- Opciones de despliegue: llama.cpp (comando `llama-cli` documentado en la model card), Ollama (con Modelfile) y LM Studio. No consta compatibilidad verificada con vLLM o TGI al tratarse de GGUF.
- Latencia y throughput: no disponible; al ser un modelo de 1,5B cuantizado, se esperan latencias bajas en CPU moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cevher-2-test (este modelo) | ≈1,5B | no disponible | tr, en | Apache 2.0 | GGUF público |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | principalmente en | Apache 2.0 | safetensors + GGUF |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | multilingüe (29+) | Apache 2.0 / Qwen | safetensors + GGUF |
| Gemma-2-2b-it | 2,6B | 8.192 tokens | multilingüe amplio | Gemma license | safetensors + GGUF |

Nota: los datos de la comparativa corresponden a modelos públicos conocidos; para este modelo, longitud de contexto y rendimiento no están disponibles.

## Limitaciones y advertencias

- Es un modelo experimental ("test" en el nombre), entrenado por un particular sin documentación detallada de evaluación ni de proceso de alineación; conviene validar su calidad antes de cualquier uso en producción.
- Sesgos conocidos: no disponible; al haberse entrenado desde cero con un corpus no documentado, los sesgos son desconocidos y deben auditarse.
- Riesgo de alucinación: típico de modelos pequeños (1,5B) sin alineación documentada; se recomienda verificación humana en tareas factuales.
- Longitud de contexto no publicada: no es posible garantizar el manejo de documentos largos.
- Soporte de idiomas limitado a turco e inglés; el rendimiento en otros idiomas no está garantizado.
- Licencia Apache 2.0: permite uso comercial, pero no incluye garantías ni cobertura de responsabilidad.
- Descargas muy bajas (254) y sin likes: comunidad reducida, lo que implica soporte y correcciones de bugs limitados.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/bcckfdn/cevher2-test-16-decay-it-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher2-test-16-decay-it
- No se han encontrado otros enlaces relevantes (paper, blog o demo) en la información disponible.
