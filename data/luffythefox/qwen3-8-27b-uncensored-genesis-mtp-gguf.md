# LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-MTP-GGUF

## Resumen

LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-MTP-GGUF es una redistribución en formato GGUF de un modelo multimodal de 27.320.697.856 parámetros, publicada por el usuario LuffyTheFox a partir del modelo HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF. No se trata de un entrenamiento nuevo: el autor aplica un procedimiento propio denominado "Genesis", descrito como una "cirugía numérica" sobre los tensores del fichero GGUF que no modifica los pesos aprendidos, sino que trata de reducir el ruido estadístico acumulado durante el entrenamiento original. El pipeline declarado es image-text-to-text y el repositorio ocupa 68,4 GB.

La model card describe una arquitectura causal densa de 27B con encoder de visión, 64 capas de lenguaje, tamaño oculto 5.120 y FFN de 17.408, compuesta por 48 capas Gated DeltaNet y 16 capas de atención con compuerta. Incorpora contexto nativo de 262.144 tokens, ampliable hasta 1.000.000 según la configuración del framework, y soporte nativo de texto, imagen y vídeo. Los tags del repositorio incluyen "moe", pero la propia model card especifica "dense"; la discrepancia no se resuelve en la información disponible.

Su relevancia práctica es doble: por un lado ofrece una vía de despliegue local de un modelo multimodal de gran contexto en formato GGUF (llama.cpp, LM Studio y compatibles); por otro, documenta una metodología de posprocesado de tensores basada en la distribución de Marchenko–Pastur que no cuenta con validación independiente publicada. Las descargas acumuladas (14.256) y los "likes" (12) indican interés, pero no evidencia de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión: 48 capas Gated DeltaNet + 16 capas de atención con compuerta. Los tags del repo indican "moe", la model card indica "dense" |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No disponible. Si la arquitectura es densa, no aplica; los tags sugieren MoE pero la model card lo contradice |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 con configuración específica del framework |
| Tipos de cuantizacion | GGUF (múltiples cuantizaciones en el repo). El autor recomienda NVFP4 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF. La visión requiere un fichero mmproj adicional junto al GGUF principal |
| Capas de lenguaje | 64 |
| Tamano oculto | 5.120 |
| Tamano FFN | 17.408 |
| Vocabulario | 248.320 tokens (con padding) |
| Modelo base | HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF |
| Tamano del repositorio | 68,4 GB |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura causal híbrida: 64 capas de lenguaje de las cuales 48 son Gated DeltaNet (atención lineal con estado recurrente) y 16 son capas de atención con compuerta. Esta combinación busca reducir el coste computacional del contexto largo manteniendo calidad de recuperación en tramos extensos. El tamaño oculto es 5.120 y el FFN 17.408, con un vocabulario de 248.320 tokens. Incluye de forma nativa MTP/NextN (multi-token prediction) y un perfil de aceleración denominado FastMTP 32K. Dispone de encoder de visión para comprensión de imagen y vídeo.

Sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO) no hay información en los materiales proporcionados: no disponible. Lo que sí se documenta es el posprocesado "Genesis" aplicado por LuffyTheFox, consistente en tres etapas sobre el GGUF: (1) escaneo y reparación del balance entre cabezas en tensores `ssm_conv1d` (asociados a memoria de contexto largo); (2) sustitución de bloques cero en tensores dañados por fragmentos seleccionados según la distribución de pesos del propio tensor; (3) reducción de ruido mediante una SVD personalizada basada en la ley de Marchenko–Pastur, excluyendo `token_embd.weight`, `output.weight`, tensores 1D, bias y normas. El autor afirma preservar el 99 % de la señal y el gradiente aprendido, y ejecuta el proceso en Google Colab gratuito sobre una Tesla T4. No hay publicación revisada por pares ni mediciones independientes que respalden estas afirmaciones.

## Capacidades

- Generación de texto conversacional multi-turno con contexto nativo de 262.144 tokens.
- Comprensión multimodal de imagen y vídeo (pipeline image-text-to-text), previa carga del fichero mmproj.
- Razonamiento con modo "thinking" activable y desactivable, con parámetros de muestreo diferenciados para tareas de código y tareas creativas.
- Capacidades multilingües declaradas: inglés, chino y multilingüe general.
- Decodificación multi-token (MTP/NextN) para acelerar la generación.
- Compatibilidad declarada con llama.cpp, LM Studio y endpoints compatibles con la API de OpenAI.
- Modelo "uncensored": orientado a reducir rechazos en contenidos que los modelos alineados suelen bloquear.
- Soporte de tool calling / function calling: no especificado explícitamente en la información disponible.
- Soporte de agentes y multi-step reasoning: no especificado explícitamente, aunque el modo thinking es compatible con flujos de razonamiento por pasos.

## Casos de uso

- Análisis de documentos largos: con 262.144 tokens nativos permite procesar informes, expedientes o bases de código completas en una sola pasada sin fragmentación agresiva, útil para resúmenes estructurados y extracción de datos.
- Descripción y análisis de imágenes en pipelines de documentación: el encoder de visión permite generar alt-text, clasificar capturas o extraer información de diagramas dentro de un flujo automatizado de publicación.
- Procesamiento de vídeo para indexación: la comprensión de vídeo nativa facilita generar metadatos, resúmenes por escenas o transcripciones contextualizadas en plataformas de contenido.
- Generación de código asistida en local: el modo thinking con `temperature=0.6, top_p=0.95, top_k=20, seed=42` está pensado para tareas de programación, y su formato GGUF permite integrarlo en entornos sin conexión.
- Escritura creativa y roleplay sin filtros: el ajuste "uncensored" y los parámetros recomendados para modo no-thinking (`temperature=0.7, top_p=0.8`) lo orientan a narrativa y personajes, con la advertencia de que no hay evaluación de calidad publicada.
- Asistente conversacional autoalojado: desplegable con llama.cpp o LM Studio en una máquina con GPU, sin enviar datos a terceros, adecuado para dominios con requisitos de privacidad.
- Investigación sobre posprocesado de tensores: sirve como caso de estudio reproducible para comparar el efecto del método Genesis frente al modelo base, aunque carece de métricas publicadas.
- Experimentación académica con arquitecturas híbridas: al combinar Gated DeltaNet y atención con compuerta, es útil para estudiar comportamiento en contexto largo, siempre que se validen los resultados con benchmarks propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparaciones cuantitativas frente al modelo base o a alternativas. Las afirmaciones sobre mejora de "claridad de contexto" y "seguimiento de instrucciones" del método Genesis son cualitativas y no están respaldadas por mediciones publicadas. Cualquier decisión de adopción debería ir precedida de una evaluación propia.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del número de parámetros (27.320.697.856) y de los bits por peso habituales de cada cuantización; no proceden de mediciones publicadas en la información disponible.

- F16: aproximadamente 54,6 GB solo de pesos; requiere GPU de 80 GB (H100, A100 80 GB) o varias GPU.
- Q8_0: aproximadamente 29 GB de pesos; cabe en A100 80 GB, H100 80 GB o RTX 6000 Ada 48 GB, con margen para caché KV.
- Q4_K_M: aproximadamente 16-17 GB de pesos; cabe en RTX 4090 24 GB y RTX 3090 24 GB, aunque con contexto largo la caché KV puede desbordar.
- NVFP4 (cuantización recomendada por el autor): aproximadamente 14-15 GB de pesos; es la opción más holgada en GPU de consumo de gama alta.
- GPU recomendadas: H100 80 GB o A100 80 GB para F16 y Q8 con contexto completo; RTX 4090, RTX 3090 o RTX 6000 Ada para Q4 y NVFP4.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 o NVFP4 sobre tarjetas de 24 GB, con la salvedad de que el contexto de 262.144 tokens exige una caché KV muy grande y obliga a reducir contexto o usar offload a CPU/RAM.
- Opciones de despliegue: llama.cpp (con flag `--jinja` para el chat template), LM Studio, y servidores compatibles con endpoints. Ollama es viable por ser GGUF, aunque no aparece citado explícitamente. El autor recomienda fijar la cuantización de caché K y V a F16.
- La visión requiere descargar y cargar el fichero mmproj junto al GGUF principal.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-MTP-GGUF | 27,3 B | 262.144 (ampliable a 1.000.000) | apache-2.0 | GGUF + mmproj | Aplica posprocesado Genesis sobre el base |
| HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF | 27,3 B (mismo origen) | No disponible | apache-2.0 | GGUF | Modelo base directo; no incluye el método Genesis |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros modelos comparables en la información proporcionada |

La comparación directa con alternativas de 27B no puede realizarse con rigor porque no hay benchmarks publicados para ninguna de las dos variantes de esta familia en los materiales disponibles.

## Limitaciones y advertencias

- No hay benchmarks publicados: ni MMLU, ni HumanEval, ni evaluaciones de calidad o seguridad. Las afirmaciones del autor sobre reducción de ruido y mejora de estabilidad no están verificadas de forma independiente.
- El método Genesis no ha pasado revisión por pares. Se describe como SVD basada en Marchenko–Pastur aplicada sobre tensores GGUF, pero no hay reproducción externa ni métricas objetivas asociadas.
- Modelo "uncensored": reduce deliberadamente los rechazos, lo que incrementa el riesgo de generar contenido dañino, ofensivo o ilegal. No debe desplegarse en aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la ausencia de evaluaciones impide acotar su magnitud. El propio autor menciona que el ruido de entrenamiento causa alucinaciones en los modelos sin tratar.
- Discrepancia en la arquitectura: los tags indican MoE, la model card indica densa. Esta contradicción afecta a las estimaciones de memoria y a las estrategias de despliegue.
- Requisito de contexto mínimo: según el autor, hay que mantener al menos 128K de contexto para preservar las capacidades de thinking, lo que encarece mucho la caché KV.
- Caché KV: se recomienda fijar los tipos de cuantización de caché K y V a F16; usar cuantizaciones de caché más agresivas puede degradar la calidad.
- Idiomas: la documentación solo declara en, zh y multilingual. El rendimiento en castellano no está documentado.
- Licencia apache-2.0: permite uso comercial, pero al ser una derivación conviene revisar las condiciones del modelo base y de los materiales originales de la familia, así como las obligaciones de atribución.
- Advertencia sobre los metadatos: las fechas de creación y actualización del repositorio (septiembre de 2026) son posteriores a la fecha de consulta habitual, lo que conviene verificar antes de citar el modelo.
- El autor emplea un script de cuantización propio alojado en Pastebin y un chat template de un tercero (peculiar-ragdoll). Son dependencias externas no versionadas de forma reproducible.
- Soporte de tool calling y flujos de agente: no confirmado explícitamente en la documentación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-MTP-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Chat template recomendado (peculiar-ragdoll): https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates/raw/main/chat_template.jinja
- Script de cuantización del autor: https://pastebin.com/hXhcMJn9
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
- Distribución de Marchenko–Pastur (referencia del método): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
