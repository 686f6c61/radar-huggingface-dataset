# reaperdoesntknow/qwen3.5-4B-Code-GGUF

## Resumen

reaperdoesntknow/qwen3.5-4B-Code-GGUF es una publicación de pesos en formato GGUF derivada de un modelo Qwen3.5 de 4B orientado a código, distribuida por el usuario reaperdoesntknow. El repositorio contiene tres cuantizaciones del modelo de lenguaje (Q4_0, Q4_K_M y Q8_0) y un proyector multimodal BF16 (mmproj), lo que indica que el checkpoint de origen es un modelo conditional generation con componentes de texto y visión (Qwen3_5ForConditionalGeneration). El modelo cuenta con 4.326.350.848 parámetros totales según los safetensors del checkpoint asociado.

La relevancia de esta ficha es doble: por un lado, ofrece una vía práctica para ejecutar localmente un modelo Qwen3.5 de 4B con capacidades multimodales mediante llama.cpp; por otro, la propia model card es explícita sobre las carencias de documentación: no se declara licencia, no se identifica la revisión exacta del checkpoint de origen, no hay benchmarks de código ni comparación entre cuantizaciones. Todo uso en producción debe partir de esa base de incertidumbre.

La información disponible no permite confirmar mejoras específicas en código respecto al modelo base pese al sufijo "Code" del nombre, ni verificar el rendimiento multimodal. Se trata, por tanto, de un artefacto para experimentación local y evaluación, no de una release con garantías documentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con componentes de texto y visión) |
| Parámetros totales | 4.326.350.848 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_0, Q4_K_M, Q8_0 (modelo de lenguaje); BF16 para el proyector multimodal |
| Idiomas soportados | no disponible |
| Licencia | no disponible (los metadatos GGUF no la declaran) |
| Formato de pesos | GGUF (llama.cpp); proyector mmproj en BF16 |

## Arquitectura y entrenamiento

El config.json incluido identifica la clase Qwen3_5ForConditionalGeneration, con un componente de texto configurado en bfloat16 y un componente de visión. El repositorio publica el modelo de lenguaje en tres cuantizaciones GGUF y, por separado, un proyector multimodal BF16 (Qwen3.5-4B.BF16-mmproj.gguf) que debe emparejarse con el modelo principal para entradas de imagen; el proyector no es un modelo autónomo. La conversión se realizó, según la card original, con Unsloth.

No se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Tampoco se identifica la revisión exacta del checkpoint de origen, el comando de conversión ni la versión de la herramienta de cuantización, por lo que no puede afirmarse una relación de conversión exacta con ningún checkpoint concreto. El campo bfloat16 del config describe la configuración del texto, no la precisión de almacenamiento de los ficheros GGUF cuantizados.

## Capacidades

- Generación de texto conversacional en formato de chat (tag "conversational").
- Generación de código, presumiblemente orientada por el sufijo "Code" del nombre, aunque sin benchmark publicado que lo respalde.
- Entrada de imágenes mediante el proyector multimodal BF16 emparejado con el modelo principal, en runtimes que soporten mtmd.
- Compatibilidad declarada con endpoints (tag "endpoints_compatible"), lo que sugiere uso tras una API compatible con el runtime.
- Ejecución local mediante llama.cpp y llama-cpp.
- No se documentan capacidades de tool calling, function calling, agentes, modo thinking ni soporte de audio.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Experimentación local con modelos de 4B: cargar Q4_K_M en llama.cpp para probar generación de texto en un equipo de sobremesa, aprovechando que el tamaño cuantizado cabe en memoria de GPU de consumo.
- Evaluación de cuantizaciones: comparar las salidas de Q4_0, Q4_K_M y Q8_0 sobre el mismo conjunto de prompts para medir la degradación introducida por la cuantización antes de fijar un fichero en producción.
- Asistencia de código en local con revisión humana obligatoria: usar el modelo para autocompletar o explicar fragmentos en un editor integrado vía llama.cpp, con tests automáticos que validen cualquier código generado antes de ejecutarlo.
- Prototipado multimodal: emparejar el modelo con el mmproj BF16 en llama-mtmd-cli para experimentar con consultas sobre imágenes en local, sin enviar datos a servicios externos.
- Despliegue en entornos con requisitos de privacidad: ejecutar la inferencia en máquinas propias para procesar código o documentación sensible que no puede salir de la red corporativa.
- Base para fine-tuning o destilación: servir como punto de partida en experimentos de ajuste sobre código, dado que el formato GGUF puede reconvertirse o complementarse con el checkpoint Transformers relacionado.
- Docencia y formación: demostrar en un taller el flujo completo de descarga, carga en llama.cpp y ejecución de un modelo Qwen3.5 cuantizado con soporte de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no incluye documentación de datos de entrenamiento, benchmark de código, comparación entre cuantizaciones ni evaluación de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada por el autor. Como referencia orientativa por tamaño de fichero, Q4_0 y Q4_K_M de un modelo de 4B suelen ocupar del orden de 2,5-3 GB y Q8_0 del orden de 4,5 GB, más overhead de contexto y, en su caso, el proyector multimodal; el autor no publica requisitos de memoria específicos.
- GPU recomendadas: no disponible en la información proporcionada; no se han realizado pruebas de humo de inferencia documentadas para estas exportaciones.
- GPU de consumo: por el tamaño del modelo (4B) y las cuantizaciones publicadas, es plausible que quepa en GPU de consumo con suficiente VRAM, pero no hay confirmación empírica en la card.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli para multimodal) y runtimes GGUF que soporten explícitamente Qwen3.5. El soporte exacto de comandos depende de la revisión del runtime instalado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| reaperdoesntknow/qwen3.5-4B-Code-GGUF | 4,33B | no disponible | no disponible | GGUF + mmproj BF16 | Cuantizaciones Q4_0, Q4_K_M, Q8_0; sin benchmarks publicados |
| Qwen3.5-4B-Coder (reaperdoesntknow) | no disponible | no disponible | no disponible | Transformers | Repositorio relacionado citado en la card; relación exacta no confirmada |
| Alternativas de 4B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos suficientes para una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: los metadatos GGUF no incluyen licencia ni modelo base; debe confirmarse los términos del modelo de origen antes de redistribuir o usar comercialmente.
- Sin benchmarks: el nombre "Code" no demuestra mejor capacidad de código ni rendimiento multimodal probado.
- Sin evaluación de seguridad ni documentación de datos de entrenamiento.
- Riesgo de código erróneo o vulnerable: revisar y testear cualquier código generado antes de ejecutarlo; no exponer secretos ni sistemas de producción a código no revisado.
- La cuantización altera las salidas: evaluar el fichero y el runtime exactos que se vayan a usar.
- El proyector mmproj no sustituye al modelo principal y requiere un runtime multimodal compatible.
- No se documentan sesgos conocidos, limitaciones de contexto ni cobertura de idiomas.
- La revisión exacta del checkpoint de origen no está identificada, lo que dificulta la trazabilidad y la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reaperdoesntknow/qwen3.5-4B-Code-GGUF
- Ficheros del repositorio: https://huggingface.co/reaperdoesntknow/qwen3.5-4B-Code-GGUF/tree/main
- Repositorio Transformers relacionado: https://huggingface.co/reaperdoesntknow/Qwen3.5-4B-Coder
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación multimodal de llama.cpp: https://github.com/ggml-org/llama.cpp/tree/master/tools/mtmd
