# bartowski/wesjos_Spark-x2.6-4B-HTML-GGUF

## Resumen
El modelo `wesjos/Spark-x2.6-4B-HTML` es un modelo de lenguaje de 4.112.079.360 parámetros (aproximadamente 4B) especializado en la generación de HTML y diseño de interfaces web visuales. Ha sido desarrollado por el usuario wesjos y ajustado mediante SFT (supervised fine-tuning) sobre el dataset `wesjos/mario-html-sft`, con el objetivo de producir contenido web visualmente atractivo a partir de instrucciones en lenguaje natural. La versión aquí descrita es la cuantización GGUF realizada por bartowski, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp.

El modelo emplea una arquitectura transformer de tipo decoder-only (según la nomenclatura estándar de los modelos de 4B con licencia Apache 2.0), e incorpora un canal de razonamiento explícito (`<think>`) con un parámetro `thinking_effort` que permite controlar la profundidad del razonamiento entre los valores `low` y `high`. Está orientado a tareas de generación de código HTML, maquetación y diseño de UI, y soporta tool calling mediante un formato de definición de herramientas en el prompt de sistema.

Su relevancia actual radica en que ofrece una alternativa ligera y de licencia permisiva (Apache 2.0) para la generación de interfaces web asistida por IA, ejecutable localmente con cuantizaciones desde 2.34 GB (IQ4_XS) hasta 8.23 GB (bf16), lo que lo hace accesible en GPUs de consumo y en entornos sin infraestructura dedicada. El modelo base declara soporte para inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no se especifica en la información disponible si es MoE o denso; el conteo de 4B parámetros sugiere denso) |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS (imatrix) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de 4B parámetros con un canal de razonamiento explícito delimitado por `<think>`, y que ha sido ajustado mediante SFT sobre el dataset `wesjos/mario-html-sft`. El prompt de sistema incluye un parámetro `thinking_effort` con valores `low` y `high`, que controla cuánto razonamiento se genera en el canal de pensamiento antes de emitir la respuesta final. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La cuantización GGUF ha sido generada con llama.cpp (release b12180) e incluye una imatrix (importance matrix) calibrada específicamente para este modelo, lo que mejora la calidad de las cuantizaciones de baja precisión. El modelo base no emplea decodificación especulativa según la model card. El formato de prompt utiliza tokens especiales propios (`<｜start▁of▁sentence｜>`, `<|System|>`, `<|User|>`, `<|Bot|>`, `<think>`).

## Capacidades
- Generación de código HTML y maquetación web a partir de instrucciones en lenguaje natural.
- Diseño de interfaces visuales (visual UI) y contenido web con énfasis en presentación atractiva.
- Razonamiento explícito mediante canal `<think>`, con control de profundidad vía `thinking_effort` (low/high).
- Tool calling / function calling: soporta definición de herramientas en formato JSON dentro del prompt de sistema, con el ejemplo `get_stock_price` en la model card.
- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Capacidades multilingües limitadas a inglés y chino.
- Compatible con endpoints (`endpoints_compatible` en los tags de Hugging Face).

## Casos de uso
- Prototipado rápido de interfaces web: el modelo genera HTML visualmente atractivo a partir de descripciones textuales, adecuado para maquetar pantallas y componentes antes de la implementación definitiva por el equipo de frontend.
- Generación de código HTML en pipelines de CI/CD: al soportar tool calling y salida estructurada, puede integrarse en flujos automatizados que generan o validan fragmentos HTML.
- Asistentes de diseño para desarrolladores: con su canal de razonamiento `thinking_effort=high`, puede razonar sobre la estructura visual antes de emitir el HTML, útil en tareas de diseño de UI complejas.
- Generación de contenido web local y privado: las cuantizaciones de 2.34-2.81 GB permiten ejecutarlo en portátiles y GPUs de consumo sin enviar datos a la nube.
- Educación y demostraciones de generación de código: modelo ligero y de licencia Apache 2.0 apto para talleres y entornos de aprendizaje sobre generación de HTML asistida por IA.
- Automatización de documentación visual: generación de páginas HTML de informes o dashboards sencillos a partir de datos y descripciones, ejecutado localmente con llama.cpp.
- Evaluación de cuantizaciones GGUF: sirve como caso práctico para comparar la calidad de distintas cuantizaciones (Q4_K_M, Q6_K, IQ4_XS) en tareas de generación de HTML.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia según cuantización: IQ4_XS ~2.34 GB, Q4_K_M ~2.62 GB, Q5_K_M ~3.16 GB, Q6_K ~3.61 GB, Q8_0 ~4.38 GB, bf16 ~8.23 GB (más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para cuantizaciones bajas; RTX 3060/4060, RTX 4090 o A100/H100 para bf16 y contextos largos.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6-8 GB de VRAM usando Q4_K_M o IQ4_XS; también en Apple Silicon (se menciona Q4_1 con mejor tokens/watt en Apple silicon).
- Opciones de despliegue: llama.cpp (release b12180 o posterior), Ollama, y cualquier runtime compatible con GGUF; los tags indican compatibilidad con endpoints.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No se dispone en la información proporcionada de datos de rendimiento de modelos comparables de la misma categoría (generación de HTML/UI con ~4B parámetros). La comparación se limita a aspectos estructurales:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| wesjos/Spark-x2.6-4B-HTML (esta ficha) | 4,11B | no disponible | Apache 2.0 | GGUF / safetensors |
| Modelos comparables de generación de código/UI de ~4B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Idiomas soportados únicamente inglés y chino; el rendimiento en castellano no está validado y probablemente sea deficiente.
- Modelo especializado en HTML/diseño web; su utilidad fuera de ese dominio no está demostrada y puede degradarse en tareas generales.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en HTML complejo o requisitos ambiguos.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- La longitud de contexto no está documentada; planificar el despliegue con un contexto conservador.
- El dataset de entrenamiento (`wesjos/mario-html-sft`) es específico y podría introducir sesgos de estilo o de dominio.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset.
- El nombre del modelo base difiere entre la model card (`wesjos/Spark-x2.6-4B-HTML`) y la búsqueda web (`bartowski/Spark-X2.6-4B-GGUF`); verificar la versión exacta antes de desplegar.

## Enlaces
- Repositorio GGUF: https://huggingface.co/bartowski/wesjos_Spark-x2.6-4B-HTML-GGUF
- Modelo base: https://huggingface.co/wesjos/Spark-x2.6-4B-HTML
- Cuantización GGUF relacionada: https://huggingface.co/bartowski/Spark-X2.6-4B-GGUF
- Árbol de archivos de la cuantización relacionada: https://huggingface.co/bartowski/Spark-X2.6-4B-GGUF/tree/main/layouts
- llama.cpp (release b12180): https://github.com/ggml-org/llama.cpp/releases/tag/b12180
- Dataset de SFT: https://huggingface.co/datasets/wesjos/mario-html-sft
