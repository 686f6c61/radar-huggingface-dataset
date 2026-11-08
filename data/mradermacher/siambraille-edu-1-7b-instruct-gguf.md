# mradermacher/SiamBraille-Edu-1.7B-Instruct-GGUF

## Resumen

SiamBraille-Edu-1.7B-Instruct-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo base SiamBraille-Edu-1.7B-Instruct, publicado originalmente por el usuario Phenphet2024 en Hugging Face. El repositorio lo mantiene mradermacher, un perfil conocido en la comunidad por convertir modelos a GGUF para su uso con llama.cpp y herramientas derivadas como Ollama o LM Studio. El nombre del modelo sugiere un enfoque educativo relacionado con Braille, aunque la model card no aporta ninguna descripción funcional que lo confirme.

El modelo base tiene 1.700 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños, aptos para inferencia en hardware de consumo. El sufijo "Instruct" indica que ha pasado por un proceso de ajuste fino supervisado orientado a instrucciones, pero no se dispone de detalles sobre la arquitectura exacta, los datos de entrenamiento ni el proceso de alineación. El repositorio GGUF incluye 12 variantes de cuantización, desde Q2_K hasta F16, lo que permite ajustar el equilibrio entre calidad y consumo de memoria.

La relevancia de esta ficha es limitada por la escasez de información pública: no hay benchmarks, no hay licencia declarada, no se especifican idiomas y el repositorio no registra descargas ni interacciones. Se trata, por tanto, de un artefacto de nicho cuya evaluación rigurosa requeriría consultar directamente el modelo base y realizar pruebas empíricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, sin confirmar) |
| Parametros totales | 1.7B (según el nombre del modelo) |
| Parametros activos | no aplica (no es MoE, según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con quantize_version 2) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base SiamBraille-Edu-1.7B-Instruct. El nombre y el tamaño (1.7B) son compatibles con un transformer decoder-only de escala pequeña, pero no hay confirmación en la model card ni en los resultados de búsqueda. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado más allá del sufijo "Instruct".

El repositorio GGUF es una conversión estática realizada por mradermacher con la herramienta de cuantización de llama.cpp (quantize_version 2, output_tensor_quantised 1, convert_type hf). Esta cadena de conversión implica que los pesos originales en safetensors se transformaron a GGUF y se generaron múltiples niveles de cuantización. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto e instrucciones: el sufijo "Instruct" indica ajuste para seguir instrucciones, aunque no se detallan las capacidades concretas.
- Posible especialización educativa en Braille: el nombre del modelo sugiere un enfoque en contenido educativo relacionado con Braille, pero no hay documentación que lo confirme.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación de modelos pequeños en entornos con recursos limitados: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 1.7B en GPUs de consumo con 4-6 GB de VRAM, útil para prototipos rápidos.
- Experimentación con contenido educativo en Braille: si el modelo base está efectivamente especializado, podría emplearse para generar o adaptar material didáctico, aunque requiere validación empírica previa.
- Pruebas de pipelines de cuantización: el repositorio sirve como ejemplo de conversión GGUF con 12 variantes, útil para comparar la degradación de calidad entre niveles de cuantización.
- Inferencia en CPU con llama.cpp: las variantes Q2_K y Q3_K_S permiten ejecución en CPU con memoria RAM moderada, adecuado para entornos sin GPU.
- Integración en Ollama o LM Studio: al ser GGUF, el modelo puede importarse directamente en estas herramientas para pruebas locales de chat.
- Investigación sobre modelos de nicho: útil para estudiar cómo se comportan modelos pequeños con ajuste instruct en tareas específicas, siempre que se valide su calidad con benchmarks propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 1.7B parámetros):
  - F16: ~3.4 GB de pesos, ~4-5 GB con overhead.
  - Q8_0: ~1.8 GB, ~2.5-3 GB con overhead.
  - Q5_K_M: ~1.2 GB, ~2-2.5 GB con overhead.
  - Q4_K_M: ~1.0 GB, ~1.5-2 GB con overhead.
  - Q3_K_M: ~0.8 GB, ~1.2-1.5 GB con overhead.
  - Q2_K: ~0.6 GB, ~1-1.2 GB con overhead.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para cuantizaciones Q4/Q5 (GTX 1650, RTX 3050, RTX 4060). Para F16 se recomienda 6 GB o más (RTX 2060, RTX 3060).
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4-8 GB de VRAM, especialmente en cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, kobold.cpp. vLLM y TGI no soportan GGUF de forma nativa sin conversión adicional.
- Latencia y throughput estimados: no disponibles. Para un modelo de 1.7B en Q4_K_M con una RTX 3060, se puede esperar un throughput del orden de decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SiamBraille-Edu-1.7B-Instruct-GGUF | 1.7B | no disponible | no disponible | GGUF | Hugging Face (0 descargas) |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K (base) | Apache 2.0 | safetensors, GGUF | Amplia, con benchmarks públicos |
| Llama-3.2-1B-Instruct | 1B | 128K | Llama 3.2 Community License | safetensors, GGUF | Amplia, con benchmarks públicos |
| SmolLM2-1.7B-Instruct | 1.7B | 8K | Apache 2.0 | safetensors, GGUF | Amplia, con benchmarks públicos |

La comparativa es desfavorable en términos de transparencia: los tres modelos alternativos cuentan con licencia clara, benchmarks publicados y comunidades activas, mientras que SiamBraille-Edu-1.7B-Instruct carece de todos esos elementos. La única ventaja potencial sería una especialización en Braille o contenido educativo, no documentada.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; en ausencia de licencia, los derechos quedan reservados por defecto.
- Sin información sobre sesgos: no se documentan los datos de entrenamiento, por lo que no es posible evaluar sesgos de género, etnia, idioma o discapacidad.
- Riesgo de alucinación desconocido: al no haber benchmarks ni evaluación pública, no se puede estimar la fiabilidad factual del modelo.
- Idiomas no especificados: se desconoce si el modelo funciona correctamente en castellano o si está limitado a tailandés (por el nombre "Siam") o inglés.
- Contexto no documentado: no se puede planificar su uso en tareas que requieran ventanas largas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Modelo base de autor único sin documentación: Phenphet2024 no publica detalles de entrenamiento, lo que dificulta la reproducibilidad.
- Para producción, se recomienda encarecidamente evaluar alternativas con licencia clara y benchmarks públicos antes de considerar este modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SiamBraille-Edu-1.7B-Instruct-GGUF
- Modelo base: https://huggingface.co/Phenphet2024/SiamBraille-Edu-1.7B-Instruct
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Página de solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Registro en free2aitools: https://free2aitools.com/model/phenphet2024/siambraille-edu-1.7b-instruct
