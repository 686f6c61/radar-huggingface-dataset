# runmyai/Flint-40B-TokenWing

## Resumen

Flint-40B-TokenWing es una redistribución del modelo Flint de Recursive (RecursiveSI/flint), un modelo de mezcla de expertos (MoE) orientado a código, publicada por runmyai. La modificación principal no afecta a los pesos: se parte de la cuantización UD-Q4_K_XL de Unsloth y se reorganiza el fichero para que los expertos puedan leerse directamente desde el SSD mediante el formato TokenWing, lo que permite ejecutar un modelo de casi 40.000 millones de parámetros en PC convencionales sin cargar todos los pesos en RAM o VRAM.

El modelo conserva la licencia Apache 2.0 del original y se distribuye en formato GGUF, con un tamaño de repositorio de 25,1 GB. Está pensado para usarse a través de la aplicación Run My AI, que automatiza la descarga y configuración, aunque el formato TokenWing es abierto y su especificación está publicada en GitHub.

La relevancia de esta ficha radica en que ejemplifica una tendencia práctica: adaptar modelos MoE grandes a hardware de consumo mediante streaming desde disco, en lugar de recurrir a cuantizaciones más agresivas o a recortes de parámetros. La información pública disponible es escasa y procede casi por completo de la model card del autor y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer; detalles de capas y atención no disponibles |
| Parametros totales | 39.785.287.456 (39,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (Unsloth), en formato GGUF; no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF con layout TokenWing (streaming de expertos desde SSD) |

## Arquitectura y entrenamiento

El modelo base es Flint, de Recursive, descrito en la model card como un modelo de mezcla de expertos especializado en código. No se dispone de información pública sobre el número de expertos, la proporción de parámetros activos por token, la longitud de contexto nativa ni la composición del dataset de entrenamiento (número de tokens, mezcla de código y texto, presencia de RLHF o DPO). Tampoco se documentan innovaciones de atención o decodificación en la información proporcionada.

La aportación técnica de esta versión es el layout TokenWing: los pesos de Unsloth (UD-Q4_K_XL) se mantienen sin cambios, pero el fichero se reorganiza para que los expertos del MoE puedan leerse de forma directa desde el SSD durante la inferencia. Esto reduce la necesidad de mantener todo el modelo residente en memoria y es lo que permite ejecutar un MoE de 39,8 B en equipos de consumo. Los metadatos indican el uso de imatrix en la cuantización, coherente con el proceso de Unsloth.

## Capacidades

- Generación de código: el modelo base está etiquetado como `code` y descrito como modelo de programación MoE.
- Conversación: la etiqueta `conversational` sugiere uso en diálogo multi-turno, aunque no se detalla el formato de plantilla.
- Ejecución local en PC: gracias al streaming de expertos desde SSD, está pensado para equipos sin GPU de datacenter.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de infraestructura compatible con la API de Hugging Face.
- Tool calling, agentes, visión, audio, modo thinking y capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de programación en local: un desarrollador puede integrar el modelo en su editor o terminal mediante un servidor GGUF y obtener autocompletado y generación de funciones sin enviar código a la nube, gracias al streaming de expertos que evita requisitos de VRAM elevados.
- Revisión de código en equipos de sobremesa: con 25,1 GB en disco y cuantización Q4, el modelo puede ejecutarse en PCs con 32 GB de RAM y SSD rápido, adecuado para análisis estático asistido y sugerencias de refactor.
- Prototipado de pipelines de CI: al ser compatible con endpoints, puede desplegarse como servicio interno para generar tests o documentación de parches en un runner con SSD NVMe.
- Evaluación de modelos MoE sin hardware dedicado: investigadores pueden comparar el comportamiento de un MoE de 39,8 B frente a modelos densos del mismo orden en máquinas de consumo, aislando el efecto del enrutado de expertos.
- Docencia y formación: permite demostrar en un aula el funcionamiento de un MoE real con cuantización Q4 y streaming desde disco, sin depender de clústeres.
- Uso offline en entornos restringidos: al ejecutarse localmente y no requerir conexión tras la descarga, encaja en entornos con políticas estrictas de salida de datos, siempre que se valide la licencia y el origen de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM: al emplear streaming de expertos desde SSD, no es necesario cargar los 25,1 GB completos en memoria; el requisito exacto de RAM y VRAM no está documentado.
- Almacenamiento: se recomienda SSD NVMe con al menos 25,1 GB libres, ya que la latencia de lectura afecta directamente al throughput.
- GPU: no se especifican modelos recomendados; el diseño apunta a PCs convencionales, no a A100/H100.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras; el enfoque TokenWing sugiere que la GPU no es el cuello de botella.
- Despliegue: la vía documentada es la aplicación Run My AI; el formato GGUF es compatible con llama.cpp y derivados, pero no se detalla soporte explícito de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Flint-40B-TokenWing | 39,8 B (MoE) | no disponible | Apache 2.0 | GGUF + TokenWing | Streaming de expertos desde SSD |
| RecursiveSI/flint (base) | no disponible | no disponible | Apache 2.0 | no disponible | Modelo original sin reorganizar |
| unsloth/flint-GGUF | no disponible | no disponible | Apache 2.0 | GGUF (UD-Q4_K_XL) | Cuantización de referencia usada aquí |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información pública muy escasa: no hay datos de contexto, idiomas, parámetros activos ni benchmarks, lo que dificulta evaluar su idoneidad en producción.
- Dependencia del SSD: el rendimiento depende de la velocidad de lectura del disco; un HDD o un SSD SATA lento degradarán la latencia de forma notable.
- Riesgo de alucinación: no cuantificado por el autor; como modelo de código, puede generar APIs inexistentes o dependencias no disponibles.
- Sesgos: no documentados; al no conocerse la composición del dataset de entrenamiento, no se pueden evaluar sesgos lingüísticos o de dominio.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y la atribución a Recursive y Unsloth.
- Madurez: el repositorio tiene 1 descarga y 1 like, creado en noviembre de 2026, por lo que no hay evidencia comunitaria de estabilidad.
- Compatibilidad: no se confirma soporte en herramientas estándar más allá de la app Run My AI; conviene validar el layout TokenWing antes de integrarlo en pipelines propios.

## Enlaces

- Hugging Face: https://huggingface.co/runmyai/Flint-40B-TokenWing
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Cuantización de origen: https://huggingface.co/unsloth/flint-GGUF
- Repositorio TokenWing: https://github.com/runmyai/tokenwing
- Aplicación Run My AI: https://runmyai.org
