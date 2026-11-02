# reaperdoesntknow/qwen3.5-4B-Code-GGUF

## Resumen

`reaperdoesntknow/qwen3.5-4B-Code-GGUF` es una conversión al formato GGUF de un modelo de la familia Qwen 3.5, presumiblemente una variante de 4B parámetros orientada a código, publicada por el usuario `reaperdoesntknow` en HuggingFace. La conversión se ha realizado con las herramientas de Unsloth y está pensada para su uso con `llama.cpp`, lo que permite ejecutar el modelo en hardware de consumo mediante cuantización. El repositorio incluye tanto pesos de texto como un proyector multimodal (`mmproj`), lo que sugiere que el modelo base es un modelo visión-lenguaje.

El dato más fiable disponible es el recuento de parámetros en safetensors: 4.326.350.848 parámetros (aproximadamente 4,3 mil millones). El tamaño del repositorio es de 10,7 GB, coherente con un modelo de ese tamaño distribuido en varias cuantizaciones (BF16 del proyector, Q4_0, Q4_K_M y Q8_0). No se dispone de información sobre la longitud de contexto, los idiomas soportados ni la licencia del modelo original.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card es mínima y no incluye datos de entrenamiento, benchmarks ni especificaciones del modelo base. Se trata, por tanto, de una ficha descriptiva basada en los metadatos del repositorio y en las convenciones habituales de la familia Qwen, marcando explícitamente como "no disponible" todo aquello que no se ha podido verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (probable transformer decoder-only de la familia Qwen 3.5; no confirmado en la información proporcionada) |
| Parametros totales | 4.326.350.848 (según safetensors) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (proyector multimodal `mmproj`), Q4_0, Q4_K_M, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors como formato de origen para el recuento de parámetros) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. Por el nombre (`qwen3.5-4B-Code`) y por la presencia de un fichero `mmproj` (proyector multimodal), se puede inferir que se trata de un modelo visión-lenguaje de la familia Qwen 3.5, probablemente con una variante afinada para código. Sin embargo, la model card no confirma ni la arquitectura exacta, ni el número de capas, ni el tipo de atención, ni si emplea mezcla de expertos.

Tampoco hay datos sobre el proceso de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La única información técnica verificable es que la conversión a GGUF se realizó con Unsloth, una herramienta habitual para generar cuantizaciones compatibles con `llama.cpp`.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Generación y asistencia en código, deducible del sufijo `Code` en el nombre del modelo (no verificado en documentación).
- Capacidades multimodal (visión-lenguaje): el repositorio incluye `Qwen3.5-4B.BF16-mmproj.gguf`, lo que habilita entrada de imágenes mediante `llama-mtmd-cli`.
- Compatibilidad con `llama.cpp` y `llama-cpp`, incluyendo el flag `--jinja` para plantillas de chat.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- **Asistente de código en local**: el modelo puede ejecutarse con `llama-cli -hf reaperdoesntknow/qwen3.5-4B-Code-GGUF --jinja` en estaciones de trabajo sin GPU dedicada de gama alta, gracias a las cuantizaciones Q4_0 y Q4_K_M. Es adecuado para autocompletado, explicación de fragmentos y generación de tests en entornos con requisitos de privacidad.
- **Análisis de capturas y diagramas**: con el proyector `mmproj` y `llama-mtmd-cli`, se puede usar para describir imágenes, interpretar diagramas de arquitectura o extraer texto de capturas de pantalla, integrándolo en herramientas de documentación técnica.
- **Prototipado rápido de aplicaciones de IA**: al ser compatible con endpoints, puede desplegarse detrás de una API compatible con OpenAI para pruebas de concepto antes de migrar a un modelo mayor.
- **Asistencia en revisión de código en CI**: integrado en un pipeline mediante `llama.cpp`, puede generar resúmenes de diffs o sugerencias de corrección en pull requests, con la ventaja de que los datos no salen de la infraestructura propia.
- **Chatbot de soporte técnico para desarrolladores**: la etiqueta `conversational` y el tamaño reducido permiten desplegarlo en servidores modestos para responder preguntas frecuentes sobre APIs o errores de compilación.
- **Educación y experimentación**: su tamaño de 4,3B parámetros y sus cuantizaciones lo hacen apto para laboratorios docentes donde se quiere estudiar el comportamiento de modelos visión-lenguaje sin grandes presupuestos de cómputo.
- **Generación de documentación a partir de imágenes de interfaz**: combinando entrada visual y salida de texto, puede redactar guías de usuario a partir de capturas de una aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con Q4_K_M, un modelo de 4,3B parámetros ocupa aproximadamente 2,5-3 GB de pesos; con Q8_0, en torno a 4,5-5 GB; en BF16, unos 8,6 GB solo para los pesos de texto, más el proyector multimodal. Estas cifras son estimaciones basadas en el recuento de parámetros, no datos publicados por el autor.
- **GPU recomendadas**: para BF16, una GPU con 12-16 GB de VRAM (RTX 4070 Ti, RTX 4080, A10). Para Q4_K_M, cabe en GPUs de 6-8 GB (RTX 3060, RTX 4060, RTX 2070).
- **Consumer GPU**: sí, cabe en GPUs de consumo con cuantización Q4_K_M o Q4_0; también puede ejecutarse en CPU con `llama.cpp`, aunque con mayor latencia.
- **Opciones de despliegue**: `llama.cpp` (`llama-cli`, `llama-mtmd-cli`, `llama-server`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, KoboldCpp). No se ha confirmado compatibilidad con vLLM o TGI para este repositorio concreto.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `reaperdoesntknow/qwen3.5-4B-Code-GGUF` | 4,3B | No disponible | No disponible | GGUF | Conversión comunitaria con Unsloth; incluye proyector multimodal |
| Qwen2.5-Coder-3B (referencia de la familia Qwen) | 3,1B | 32K (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Safetensors, GGUF | Modelo de código de referencia; sin capacidades de visión |
| Qwen2.5-VL-3B (referencia de la familia Qwen) | 3,75B | 32K (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Safetensors, GGUF | Modelo visión-lenguaje; sin especialización en código |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community License | Safetensors, GGUF | Alternativa generalista; sin visión en la variante de texto |

Las filas de modelos comparables se basan en información pública de sus respectivas familias y no en datos verificados en esta búsqueda; los datos de contexto y licencia del modelo objeto de la ficha no están disponibles.

## Limitaciones y advertencias

- **Documentación mínima**: la model card no especifica arquitectura, contexto, idiomas ni licencia, lo que dificulta evaluar su idoneidad para producción.
- **Licencia desconocida**: al no indicarse la licencia del modelo base ni de la conversión, no se puede garantizar el uso comercial. Es imprescindible verificar la licencia del modelo Qwen 3.5 original antes de desplegarlo.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje de este tamaño; no hay evaluaciones publicadas que lo cuantifiquen.
- **Sesgos**: no se han documentado sesgos específicos; al desconocerse la composición del dataset de entrenamiento, no se pueden evaluar.
- **Contexto e idiomas**: sin datos publicados, no se puede confirmar el soporte multilingüe ni la ventana de contexto real.
- **Procedencia comunitaria**: la conversión la ha realizado un usuario individual, no el equipo oficial de Qwen; pueden existir diferencias de comportamiento respecto a los pesos originales.
- **Repositorio de bajo uso**: 343 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/reaperdoesntknow/qwen3.5-4B-Code-GGUF
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
- `llama.cpp` (runtime recomendado por el autor): no se incluye enlace en la información proporcionada
- Paper, blog o demo del modelo base Qwen 3.5: no disponible en la información proporcionada
