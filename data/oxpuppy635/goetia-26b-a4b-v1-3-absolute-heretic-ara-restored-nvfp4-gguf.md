# oxpuppy635/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored-NVFP4-GGUF

## Resumen

Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored-NVFP4-GGUF es una cuantización en formato NVFP4 GGUF del modelo base oxpuppy635/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored, un fine-tune derivado de la familia Gemma según las etiquetas del repositorio. El modelo cuenta con 25 233 138 206 parámetros totales (aproximadamente 25,2 mil millones), aunque la nomenclatura "A4B" del nombre sugiere una arquitectura de mezcla de expertos con unos 4 mil millones de parámetros activos por token. Lo publica el usuario oxpuppy635 en Hugging Face.

La relevancia de esta ficha es doble: por un lado, documenta un fine-tune comunitario de la familia Gemma orientado a conversación; por otro, ejemplifica la adopción del formato NVFP4 (un formato de cuantización de 4 bits con escalas de bloque) dentro del ecosistema llama.cpp mediante el tipo nativo GGML_TYPE_NVFP4. El repositorio ocupa 15,3 GB y contiene un único fichero GGUF listo para su uso con builds recientes de llama.cpp.

La información publicada por el autor es muy escasa: no hay model card detallada del modelo base, no se documentan datos de entrenamiento, benchmarks ni composición del dataset. Esta ficha recoge lo verificable y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma (según etiqueta "gemma"); nomenclatura "A4B" sugiere MoE con ~4B activos, no confirmado por el autor |
| Parámetros totales | 25 233 138 206 (~25,2 B) |
| Parámetros activos | No disponible (la nomenclatura "A4B" sugiere ~4 B, sin confirmación oficial) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (GGML_TYPE_NVFP4) |
| Idiomas soportados | Inglés (en) |
| Licencia | other (no se detalla el texto de la licencia) |
| Formato de pesos | GGUF (fichero único NVFP4) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune comunitario etiquetado como "gemma", lo que indica que parte de la arquitectura decoder-only de la familia Gemma de Google. El sufijo "A4B" en el nombre es la convención habitual para modelos de mezcla de expertos (MoE) con aproximadamente 4000 millones de parámetros activos por token, aunque el autor no lo confirma explícitamente en la información disponible. Los 25,2 mil millones de parámetros totales encajan con esa lectura: un MoE de ~25 B totales con ~4 B activos.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, ni si hubo fases de RLHF, DPO o fine-tuning supervisado. Tampoco se documentan innovaciones técnicas específicas del fine-tune. La única información técnica verificable es la del proceso de cuantización: el autor convirtió los pesos del modelo base a NVFP4 usando el layout nativo GGML_TYPE_NVFP4 de llama.cpp, un formato de 4 bits con escalas por bloque pensado para inferencia eficiente en memoria.

## Capacidades

- Generación de texto conversacional: el tag "conversational" y el pipeline de uso con llama-cli/llama-server indican un modelo orientado a diálogo multi-turno.
- Razonamiento y generación de código: capacidades heredadas del modelo base Gemma, no documentadas específicamente por el autor.
- Soporte de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistente conversacional local: el formato GGUF NVFP4 permite ejecutar el modelo con llama.cpp en hardware con memoria limitada, adecuado para prototipos de chatbots en inglés sobre GPU de consumo.
- Despliegue con llama-server: el autor documenta el arranque con `llama-server --port 8080 -ngl 99`, lo que facilita exponer el modelo como API HTTP compatible con endpoints para integraciones ligeras.
- Experimentación con cuantización NVFP4: útil para investigadores que quieran evaluar el rendimiento y la calidad del formato GGML_TYPE_NVFP4 frente a Q4_K_M, Q5_K_M u otras cuantizaciones en llama.cpp.
- Fine-tunes comunitarios de Gemma: sirve como caso de estudio de la cadena de derivación (Gemma → fine-tune → cuantización) para quienes trabajan con modelos base de Google.
- Pruebas de inferencia en entornos con VRAM ajustada: al ser un GGUF de 15,3 GB, permite validar pipelines de generación en tarjetas de 16-24 GB.
- Evaluación comparativa de fine-tunes: útil para medir cómo un fine-tune comunitario se desvía del Gemma original en estilo, alineación y calidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 15,3 GB, por lo que se necesita al menos ~16 GB de VRAM para cargarlo completo en GPU; con offload parcial a CPU puede ejecutarse con menos.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB) para despliegue completo en GPU.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 4080 Super (16 GB) al límite; en tarjetas de 12 GB requerirá offload a CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) con build reciente que soporte NVFP4; no se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Goetia-26B-A4B-v1.3 NVFP4 GGUF | ~25,2 B (¿~4 B activos?) | No disponible | other | GGUF NVFP4 | Hugging Face |
| Gemma 2 27B (referencia de familia) | 27 B | 8 192 tokens | Gemma license | safetensors, GGUF | Hugging Face, Ollama |
| Mixtral 8x7B (referencia MoE) | 46,7 B (~12,9 B activos) | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |

Nota: la comparativa con Gemma 2 27B y Mixtral 8x7B es orientativa por familia y tamaño; no se dispone de datos de rendimiento del modelo Goetia que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia "other" sin texto detallado: no se puede confirmar si el uso comercial está permitido; hay que contactar con el autor o revisar el modelo base antes de usarlo en producción.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, alucinación o sesgos.
- Fine-tune comunitario sin model card detallada: se desconoce el dataset de entrenamiento, lo que impide evaluar sesgos y riesgos de alineación.
- El nombre "Heretic" y "Restored" sugiere modificaciones de alineación no documentadas; conviene tratarlo con cautela en aplicaciones sensibles.
- Formato NVFP4: requiere builds recientes de llama.cpp; puede no ser compatible con versiones antiguas ni con otros runtimes (vLLM, TGI, Ollama).
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria que respalde su calidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks no se puede acotar su magnitud.

## Enlaces

- [Hugging Face: oxpuppy635/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored-NVFP4-GGUF](https://huggingface.co/oxpuppy635/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored-NVFP4-GGUF)
- [Modelo base: oxpuppy635/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored](https://huggingface.co/oxpuppy635/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored)
- [llama.cpp (repositorio oficial)](https://github.com/ggerganov/llama.cpp)
