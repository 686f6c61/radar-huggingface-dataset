# buddysburrow/buddy-4b

## Resumen

Buddy 4B es una distribución de pesos en formato GGUF del modelo Qwen3.5-4B de Alibaba Cloud, publicada por el usuario buddysburrow bajo el identificador `buddysburrow/buddy-4b`. No se trata de un modelo entrenado desde cero ni de un fine-tuning: la model card indica explícitamente que tanto el archivo de lenguaje como el componente de visión son cuantizaciones preparadas por Unsloth y distribuidas sin modificar. El repositorio agrupa dos artefactos: `buddy-4b-Q4_K_M.gguf`, que corresponde a Qwen3.5-4B en cuantización Q4_K_M, y `buddy-4b-eyes-BF16.gguf`, el proyector multimodal (mmproj) en BF16.

El propósito declarado es servir como motor de inferencia en dispositivo del producto "Buddy: Your AI Friend", de Buddy's Burrow, de ahí el nombre del repositorio y la separación entre "cerebro" (modelo de lenguaje) y "ojos" (componente de visión). Para el desarrollador externo su interés es limitado pero concreto: ofrece un paquete GGUF listo para usar con llama.cpp y derivados, con licencia Apache 2.0 y un tamaño de repositorio de 3,4 GB que cabe en hardware de consumo.

Conviene señalar una discrepancia relevante en los metadatos: la ficha de HuggingFace declara 333.514.240 parámetros totales según safetensors, mientras que el nombre del modelo y la model card hacen referencia a Qwen3.5-4B. Esa cifra de parámetros no es coherente con un modelo de 4B y probablemente refleja únicamente algún componente auxiliar o un error de indexación; el dato debe tratarse con cautela. No se han publicado resultados de benchmarks ni detalles de entrenamiento propios en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen3.5-4B; no detallada en la información proporcionada) |
| Parámetros totales | 333.514.240 según metadatos de safetensors; la model card referencia Qwen3.5-4B (dato inconsistente, ver advertencias) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (modelo de lenguaje); BF16 (proyector multimodal mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos archivos: lenguaje y mmproj de visión) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de lo que se deduce del modelo base: Qwen3.5-4B, desarrollado por el equipo Qwen de Alibaba Cloud. La model card de este repositorio no describe capas, tipo de atención, composición del dataset ni proceso de alineación (RLHF, DPO u otros). Tampoco se documenta el número de tokens de entrenamiento.

Lo que sí se documenta es el proceso de empaquetado: la cuantización Q4_K_M del modelo de lenguaje y la conversión a BF16 del proyector multimodal fueron realizadas por Unsloth (referencia `unsloth/Qwen3.5-4B-GGUF`) y se distribuyen sin modificaciones. No hay, por tanto, innovación técnica atribuible al autor del repositorio; el valor añadido es la organización de los artefactos para un caso de uso concreto (inferencia local multimodal).

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen3.5-4B.
- Procesamiento de imágenes mediante el componente de visión separado (`buddy-4b-eyes-BF16.gguf`), que actúa como proyector multimodal sobre el modelo de lenguaje.
- Ejecución en dispositivo (on-device) con cuantización Q4_K_M, orientada a entornos con recursos limitados.
- Capacidades de tool calling, agentes o modo de razonamiento extendido: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales locales para aplicaciones de escritorio o móvil: el GGUF Q4_K_M permite ejecutar el modelo en CPU o GPU de consumo sin depender de servicios en la nube, lo que encaja con el escenario de "AI friend" para el que se publicó.
- Aplicaciones de accesibilidad con descripción de imágenes: combinando el modelo de lenguaje con el mmproj BF16 se puede construir un pipeline de captioning o respuesta a preguntas visuales en local, útil en entornos sin conectividad.
- Prototipado rápido de funcionalidades multimodales: al estar los dos artefactos separados y en formato GGUF, un equipo puede integrarlos con llama.cpp y validar un producto basado en visión-lenguaje sin gestionar conversiones de pesos.
- Clasificación y extracción de información de documentos escaneados: el componente visual permite procesar imágenes y el modelo de lenguaje estructurar la salida, con la ventaja de que los datos no salen del dispositivo.
- Educación y demos offline: el tamaño del repositorio (3,4 GB) facilita distribuirlo en talleres o entornos con ancho de banda limitado, siempre que se respete la licencia Apache 2.0.
- Base para fine-tuning posterior: el formato GGUF no es el ideal para reentrenar, pero sirve como referencia de comportamiento del modelo base antes de abordar una adaptación con LoRA sobre los pesos originales de Qwen3.5-4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el modelo de lenguaje en Q4_K_M: aproximadamente 2,5-3 GB, coherente con un modelo de la familia 4B cuantizado a 4 bits y con el tamaño del repositorio (3,4 GB incluyendo el mmproj).
- El proyector multimodal en BF16 añade un consumo adicional de VRAM no especificado en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo debería caber en GPUs de consumo con 6-8 GB de VRAM o más, aunque no hay confirmación del autor.
- Despliegue: llama.cpp y proyectos compatibles con GGUF (Ollama, LM Studio, servidores basados en llama.cpp). Compatibilidad con vLLM o TGI no confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| buddy-4b | 333.514.240 según metadatos (base Qwen3.5-4B) | no disponible | Apache 2.0 | GGUF (Q4_K_M + mmproj BF16) | Cuantización de Unsloth sin modificar; 68 descargas |
| Qwen3.5-4B (original) | ~4B (según denominación) | no disponible | Apache 2.0 | safetensors | Modelo base de Alibaba Cloud; permite fine-tuning y cuantización propia |
| unsloth/Qwen3.5-4B-GGUF | ~4B | no disponible | Apache 2.0 | GGUF | Origen directo de los artefactos de este repositorio; incluye más variantes de cuantización |

## Limitaciones y advertencias

- Inconsistencia en el recuento de parámetros: los metadatos de safetensors indican 333.514.240 parámetros, cifra incompatible con la denominación "4B" del modelo base. Verificar antes de dimensionar infraestructura.
- El repositorio no aporta ningún entrenamiento ni ajuste propio; cualquier limitación del modelo base Qwen3.5-4B se hereda íntegramente.
- No se documentan sesgos, tasas de alucinación ni evaluación de seguridad en la información disponible.
- Idiomas soportados y longitud de contexto no especificados: no asumir capacidades multilingües o de contexto largo sin comprobación empírica.
- El formato GGUF está pensado para inferencia; no es adecuado para reentrenamiento directo.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar también las condiciones del modelo base Qwen3.5-4B y de la cuantización de Unsloth.
- Repositorio con 68 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- La fecha de creación indicada (2026-10-28) es posterior a la fecha actual en el momento de redactar esta ficha; tratar los metadatos temporales con cautela.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/buddysburrow/buddy-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuantizaciones GGUF de referencia: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
