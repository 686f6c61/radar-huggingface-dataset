# buddysburrow/buddy26b

## Resumen

Buddy26B es un conjunto de pesos en formato GGUF publicado por Buddy's Burrow para alimentar "Buddy: Your AI Friend", una aplicación de iOS que ejecuta el modelo en el propio dispositivo. El modelo se presenta como un reempaquetado de `google/gemma-4-26B-A4B-it`, una variante instruida de la familia Gemma 4 con arquitectura Mixture of Experts (MoE), 26 000 millones de parámetros totales y unos 4000 millones activos por token, según la nomenclatura del identificador base.

La ficha del repositorio es mínima: solo declara licencia Apache 2.0 y que los archivos han sido modificados y reempaquetados por el autor. No se documentan idiomas, pipeline, datos de entrenamiento ni resultados de evaluación. El dato de parámetros totales que expone Hugging Face para los safetensors del repo (572 794 416) no concuerda con el tamaño declarado del modelo base ni con el tamaño del repositorio (10,9 GB), por lo que debe tomarse con cautela.

Su relevancia es acotada: sirve como ejemplo de distribución de un modelo MoE de gran tamaño en cuantizaciones GGUF para inferencia local en dispositivos Apple, y como referencia práctica de las limitaciones de empaquetado cuando la model card no aporta trazabilidad sobre el proceso de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, según el modelo base `google/gemma-4-26B-A4B-it` |
| Parámetros totales | 26 000 millones (según nomenclatura del modelo base); 572 794 416 según los safetensors del repo (dato inconsistente) |
| Parámetros activos | 4000 millones (según nomenclatura del modelo base, "A4B") |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (niveles concretos no especificados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base declarado, `google/gemma-4-26B-A4B-it`, corresponde a la familia Gemma 4 de Google en su variante Mixture of Experts: 26 000 millones de parámetros totales con aproximadamente 4000 millones activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño. La variante `-it` indica ajuste por instrucciones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

El repositorio de Buddy's Burrow no documenta el proceso de conversión a GGUF: no se indica la herramienta utilizada (llama.cpp, por ejemplo), los niveles de cuantización disponibles, ni si se aplicaron modificaciones adicionales más allá del reempaquetado. El tamaño del repo (10,9 GB) es compatible con una o varias cuantizaciones de un modelo de 26 000 millones de parámetros, pero no permite inferir qué precisión efectiva tienen los pesos.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del ajuste por instrucciones del modelo base.
- Capacidades multilingües: no documentadas en este repositorio; dependen del modelo base.
- Tool calling y function calling: no documentado en este repositorio.
- Razonamiento multi-paso y uso como agente: no documentado en este repositorio.
- Modo "thinking" u otras capacidades especiales: no documentado en este repositorio.
- Ejecución en dispositivo (on-device) en iOS a través de la aplicación Buddy, que es el caso de uso declarado por el autor.

## Casos de uso

- Aplicación móvil conversacional en iOS: el modelo se distribuye específicamente para "Buddy: Your AI Friend", que lo ejecuta localmente en el dispositivo; adecuado para asistentes personales con privacidad de datos por diseño.
- Prototipado de asistentes on-device: un desarrollador puede cargar los GGUF con llama.cpp en macOS o iOS para evaluar el comportamiento de un MoE de 26 000 millones con 4000 millones activos antes de comprometerse con infraestructura mayor.
- Inferencia local en estaciones de trabajo Apple Silicon: el formato GGUF permite ejecutar el modelo con memoria unificada, sin GPU dedicada, para tareas de generación de texto y resumen.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad de distintas cuantizaciones GGUF del mismo modelo base en tareas de razonamiento y generación.
- Chat de soporte interno con requisitos de confidencialidad: al ejecutarse localmente, evita enviar datos a APIs externas, lo que encaja en entornos con restricciones de residencia de datos.
- Base para fine-tuning o destilación experimental: al ser Apache 2.0, permite derivados, aunque la falta de documentación sobre el proceso de reempaquetado exige verificar la integridad de los pesos antes de usarlos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible con precisión, ya que no se especifican los niveles de cuantización. Como referencia orientativa para un MoE de 26 000 millones con 4000 millones activos, las cuantizaciones de 4 bits suelen requerir del orden de 14-16 GB de memoria, pero este dato no está confirmado en el repositorio.
- GPU recomendadas: no disponible. El destino declarado es ejecución on-device en iOS, lo que implica Apple Silicon (memoria unificada) más que GPU dedicadas.
- GPU de consumo: probablemente viable en equipos con 16 GB o más de memoria unificada o VRAM en cuantizaciones bajas, pero sin confirmación del autor.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) son los entornos naturales para GGUF; vLLM y TGI no están documentados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Buddy26B (este repo) | 26 000 M / 4000 M (según base) | no disponible | Apache 2.0 | GGUF | Reempaquetado sin documentación de cuantización |
| google/gemma-4-26B-A4B-it | 26 000 M / 4000 M | no disponible | según licencia de Gemma (no confirmada aquí) | safetensors | Modelo base original, con model card oficial |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- La model card no documenta el proceso de conversión a GGUF, los niveles de cuantización ni las herramientas empleadas, lo que dificulta reproducir o auditar el artefacto.
- Existe una inconsistencia entre los parámetros totales de los safetensors del repo (572 794 416) y el tamaño declarado del modelo base (26 000 millones); conviene verificar los pesos antes de usarlos.
- No se documentan idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- No hay información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad.
- Aunque la licencia declarada es Apache 2.0, el modelo deriva de Gemma; deben revisarse los términos aplicables al modelo base y a sus derivados antes de un uso comercial.
- El repositorio tiene un uso muy bajo (321 descargas, 0 likes) y una única revisión, lo que reduce la validación comunitaria.
- No se especifica pipeline ni tarea en Hugging Face, lo que complica la integración automática con herramientas estándar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/buddysburrow/buddy26b
- Modelo base declarado: https://huggingface.co/google/gemma-4-26B-A4B-it
- Aplicación "Buddy: Your AI Friend" (iOS): no disponible en la información proporcionada.
