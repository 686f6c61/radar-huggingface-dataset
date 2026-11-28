# Markie77/markie-ai-v3

## Resumen

markie-ai-v3 es una conversión al formato GGUF de un modelo de la familia Qwen3.5 con aproximadamente 4.330 millones de parámetros (4,33 B). El repositorio lo publica el usuario Markie77 bajo el identificador `Markie77/markie-ai-v3` y está pensado para su uso con llama.cpp y llama-cpp, con soporte declarado de visión y lenguaje (vision-language-model). No se trata de un modelo entrenado desde cero por el autor, sino de una redistribución empaquetada de pesos Qwen3.5-4B-Base, según se deduce de los nombres de fichero incluidos en el repositorio.

El interés práctico del artefacto es que ofrece pesos en BF16, F16 para el proyector multimodal y una cuantización Q4_K_M, lo que permite ejecutar un modelo de 4 B con capacidades multimodales en hardware de consumo mediante llama.cpp. El contexto, los idiomas, la licencia y la composición del entrenamiento no están documentados en la información disponible, por lo que cualquier evaluación rigurosa exige consultar la ficha del modelo base original.

La relevancia es, por tanto, la de un empaquetado de conveniencia: utilidad inmediata para pruebas locales y prototipos con llama-cli o llama-mtmd-cli, pero con trazabilidad y garantías limitadas al no haber model card detallada, benchmarks ni licencia explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles no disponibles) |
| Parametros totales | 4.326.350.848 (~4,33 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16 (proyector multimodal), Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors como origen de los parametros) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la pertenencia a la familia Qwen3.5 y de su naturaleza multimodal (etiqueta `vision-language-model` y presencia de un fichero `F16-mmproj.gguf`, que corresponde al proyector de visión que acopla el codificador visual con el modelo de lenguaje). El número de parámetros declarado, 4.326.350.848, corresponde a los pesos en safetensors, presumiblemente del modelo base Qwen3.5-4B-Base.

No hay datos sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF o DPO, ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, modos de razonamiento). La conversión a GGUF se realizó con Unsloth según la model card, pero no se documenta la receta de cuantización ni verificaciones de calidad de la misma.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` y el uso previsto con `llama-cli`.
- Procesamiento de imágenes junto con texto: el repositorio incluye un proyector multimodal (`F16-mmproj.gguf`) y la model card indica el uso de `llama-mtmd-cli` para modelos multimodales.
- Ejecución local en CPU y GPU mediante llama.cpp, con soporte de plantillas de chat a través del flag `--jinja`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere uso detrás de servidores compatibles con llama.cpp.
- Tool calling / function calling: no disponible en la documentación.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la documentación.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantización Q4_K_M el modelo cabe en GPUs de consumo y permite iterar sobre prompts y plantillas de chat con `llama-cli --jinja` sin depender de servicios en la nube.
- Pruebas de pipelines multimodales: usando `llama-mtmd-cli` y el fichero `F16-mmproj.gguf` se puede validar la integración de imagen y texto en una aplicación antes de migrar a un modelo mayor.
- Evaluación comparativa de cuantizaciones: al ofrecer BF16, F16 y Q4_K_M del mismo modelo, sirve para medir la degradación de calidad y el ahorro de memoria entre precisión completa y cuantización de 4 bits.
- Despliegue en estaciones de trabajo sin GPU dedicada: llama.cpp permite ejecutar el modelo en CPU, útil para entornos de desarrollo o demostraciones offline.
- Integración en herramientas de escritorio y asistentes locales: el formato GGUF es consumible por frontends basados en llama.cpp (por ejemplo, interfaces de chat locales), lo que facilita empaquetar un asistente con visión en una aplicación de escritorio.
- Base para fine-tuning o experimentación posterior: al estar disponible el BF16, se puede partir de él para tareas de ajuste supervisado o destilación, siempre que la licencia del modelo base lo permita (dato no disponible aquí).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en Q4_K_M, aproximadamente 2,5-3 GB para los pesos más el overhead de contexto y del proyector visual; en BF16/F16, en torno a 8,7 GB solo para los pesos, más caché KV y proyector.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para BF16; cualquier GPU con 6-8 GB basta para Q4_K_M.
- Cabe en GPU de consumo: sí, especialmente con Q4_K_M; en BF16 requiere al menos 12 GB para operar con contexto moderado.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), y frontends compatibles con GGUF. vLLM, TGI u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| markie-ai-v3 | ~4,33 B | no disponible | Sí (proyector mmproj) | no disponible | GGUF |
| Qwen3.5-4B-Base (origen) | ~4,33 B | no disponible | Según modelo base | no disponible | safetensors |
| Alternativas de ~4 B con vision | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificables de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La model card es mínima: no documenta licencia, idiomas, contexto ni datos de entrenamiento, lo que impide garantizar el uso comercial.
- Al ser una conversión de terceros de un modelo base, no hay verificación independiente de la integridad de los pesos ni de la calidad de la cuantización Q4_K_M.
- Riesgo de alucinación inherente a modelos de 4 B; sin benchmarks publicados no se puede acotar su fiabilidad en tareas de razonamiento o código.
- El soporte multimodal depende del proyector `F16-mmproj.gguf`; un desajuste de versión con llama.cpp puede romper la inferencia de imágenes.
- Sin datos de sesgos, cobertura lingüística ni evaluación de seguridad.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.
- Antes de usarlo en producción, conviene contrastar con la ficha oficial del modelo Qwen3.5-4B-Base para conocer licencia, contexto real y limitaciones del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Markie77/markie-ai-v3
- Unsloth (herramienta de conversión citada): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado por la model card): https://github.com/ggml-org/llama.cpp
