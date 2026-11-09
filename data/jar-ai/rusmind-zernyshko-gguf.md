# Jar-ai/RusMind-Zernyshko-GGUF

## Resumen

RusMind-Zernyshko-GGUF es la versión cuantizada en formato GGUF del modelo base DICPlay/RusMind-Zernyshko-1.6, publicada por el usuario Jar-ai en Hugging Face. Se trata de un modelo de lenguaje de pequeño tamano (SLM, *small language model*) orientado a ruso e inglés, con una arquitectura de tipo LLaMA y aproximadamente 83 millones de parámetros (10 capas con dimensión oculta de 768). El modelo emplea un tokenizador BPE personalizado de 16.000 tokens y una longitud de contexto de 1.024 tokens.

La relevancia de esta publicación es acotada: no introduce innovaciones arquitectónicas ni de entrenamiento, sino que ofrece los pesos del modelo base en distintos niveles de cuantización (F32, F16/BF16 y Q8_0) para facilitar su ejecución con llama.cpp y herramientas compatibles con GGUF. El propio autor advierte de que las cuantizaciones por debajo de Q8_0 degradan la calidad hasta producir texto incoherente.

Por su tamano y contexto, el modelo está pensado para pruebas locales, experimentación con SLM en ruso y despliegues en hardware muy limitado. La model card es explícitamente escéptica sobre la calidad del modelo ("if you dare", "expect absolute gibberish"), lo que debe tenerse en cuenta antes de considerarlo para cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (configuración modificada, según el autor) |
| Parametros totales | ~83 M (10 capas × 768 de dimensión oculta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F32, F16, BF16, Q8_0 (el autor desaconseja cuantizaciones inferiores) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Tokenizador | BPE personalizado, 16.000 tokens |
| Modelo base | DICPlay/RusMind-Zernyshko-1.6 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo LLaMA con 10 capas y dimensión oculta de 768, lo que arroja aproximadamente 83 millones de parámetros. El autor describe la configuración como "hacked config", sin detallar las modificaciones concretas respecto a una configuración LLaMA estándar. El tokenizador es un BPE propio de 16.000 tokens, más pequeno que los vocabularios habituales de modelos LLaMA (32.000 o más), lo que reduce el tamano del embedding pero limita la granularidad de la tokenización.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card no documenta innovaciones técnicas (atención lineal, decodificación especulativa, mezcla de expertos, etc.). La contribución de esta publicación se limita a la conversión a GGUF y a la generación de las distintas cuantizaciones a partir del modelo base.

## Capacidades

- Generación de texto en ruso e inglés, con foco declarado en ruso.
- Modelo de tipo *base*: no está afinado para instrucciones ni para diálogo, por lo que no cabe esperar un comportamiento fiable de asistente sin ajuste adicional.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No dispone de modo de razonamiento (*thinking mode*), visión ni audio.
- Capacidad multilingüe limitada a ruso e inglés según los metadatos; no se declaran otros idiomas.
- Contexto muy corto (1.024 tokens), lo que restringe tareas que requieran contexto extenso.

## Casos de uso

- Experimentación con SLM en ruso: el modelo permite probar pipelines de generación de texto en ruso en hardware mínimo, útil para validar infraestructura antes de pasar a modelos mayores.
- Pruebas de cuantización con llama.cpp: sirve como banco de pruebas para comparar el comportamiento de F32, F16/BF16 y Q8_0 en un modelo pequeno y observar la degradación de calidad.
- Entornos educativos: adecuado para demostrar el funcionamiento interno de un transformer LLaMA de pocas capas y un tokenizador BPE reducido.
- Prototipado de completado de texto en ruso: con 1.024 tokens de contexto puede generar continuaciones cortas de frases o párrafos en dominios acotados, siempre con revisión humana.
- Despliegue en dispositivos con recursos muy limitados: sus ~83 M de parámetros permiten ejecución en CPU y en GPUs de gama baja, útil para demos offline.
- Base para *fine-tuning* ligero: al ser un modelo base de licencia Apache 2.0, puede servir como punto de partida para ajustes específicos en ruso con coste computacional bajo.
- Generación de texto de relleno o sintético para pruebas de sistemas: útil para generar datos de prueba en pipelines que necesiten texto en ruso sin requisitos de calidad alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en F16/BF16 (~166 MB de pesos) y en torno a 90-100 MB en Q8_0; el consumo real depende del backend y del contexto reservado.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4060 o superiores; también en CPU.
- GPU profesionales (A100, H100) no aportan ventaja significativa para este tamano de modelo.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama y cualquier runtime compatible con GGUF; no se documenta soporte específico para vLLM o TGI.
- El autor indica que para probar el modelo debe colocarse en `C:\` y ejecutarse con `llama-cli.exe`, pasando `--override-kv tokenizer.ggml.pre=str:llama-bpe` para forzar el pre-tokenizador, lo que sugiere problemas de compatibilidad del tokenizador personalizado con las herramientas estándar.
- Latencia y throughput: no disponibles; por el tamano del modelo se espera latencia muy baja en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind-Zernyshko-GGUF | ~83 M | 1.024 | ru, en | Apache 2.0 | GGUF |
| Qwen2.5-0.5B | ~494 M | 32.768 | multilingüe | Apache 2.0 | safetensors, GGUF |
| SmolLM2-135M | ~135 M | 8.192 | en (principalmente) | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | ~1.100 M | 2.048 | en (principalmente) | Apache 2.0 | safetensors, GGUF |

La comparación se ofrece como referencia de categoria (SLM de licencia permisiva); no se dispone de datos de rendimiento de RusMind-Zernyshko-GGUF que permitan una comparación cuantitativa. Frente a alternativas como SmolLM2-135M o Qwen2.5-0.5B, este modelo ofrece un tamano menor y foco en ruso, pero un contexto mucho más corto y sin documentación de calidad.

## Limitaciones y advertencias

- Calidad dudosa: el propio autor advierte que las cuantizaciones por debajo de Q8_0 producen "absolute gibberish", y recomienda Q8_0 solo "if you dare".
- Modelo base sin alineación: no está ajustado para seguir instrucciones ni para mantener conversaciones; su uso como asistente requiere ajuste previo.
- Contexto muy corto (1.024 tokens): insuficiente para documentos largos, conversaciones multi-turno extensas o razonamiento con contexto amplio.
- Tokenizador personalizado de 16.000 tokens: requiere el parámetro `--override-kv tokenizer.ggml.pre=str:llama-bpe` en llama.cpp, lo que indica problemas de compatibilidad y riesgo de tokenización incorrecta en otras herramientas.
- Riesgo elevado de alucinación y de texto incoherente, especialmente con cuantizaciones bajas o fuera de los idiomas declarados.
- Idiomas limitados a ruso e inglés; no se garantiza un comportamiento aceptable en castellano.
- Licencia Apache 2.0: permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en producción sin evaluación exhaustiva.
- Procedencia y mantenimiento: publicación con 0 descargas y 0 likes en el momento de la consulta; el autor de la cuantización no es el autor del modelo base, y no se documenta proceso de validación de los pesos convertidos.
- Sin benchmarks publicados: no hay evidencia objetiva de rendimiento que respalde su uso frente a alternativas.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/Jar-ai/RusMind-Zernyshko-GGUF
- Modelo base: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6
- llama.cpp (runtime recomendado por el autor): https://github.com/ggml-org/llama.cpp
