# cloudsurf-software/CloudSurf-4B-FC-GGUF

## Resumen

CloudSurf-4B-FC-GGUF es la colección oficial de cuantizaciones GGUF del modelo CloudSurf-4B-FC, desarrollado por CloudSurf Software. Se trata de un modelo de función de llamada (function calling) y uso de herramientas (tool use) basado en Gemma-4, con una arquitectura E4B que activa aproximadamente 4.000 millones de parámetros de un total cercano a 8.000 millones. El modelo original fue afinado con QLoRA y destaca por su rendimiento en el benchmark BFCL V4, superando a modelos de referencia como Nanbeige4-3B y gpt-oss-20b en la misma categoría.

Esta versión GGUF permite ejecutar el modelo en hardware modesto, con cuantizaciones desde Q3_K_M (4,9 GB) hasta BF16 (15,1 GB), todas validadas con una suite de pruebas de llamadas a herramientas. El modelo soporta además entrada de imágenes mediante un proyector (mmproj), lo que lo convierte en una opción versátil para agentes que necesitan combinar visión y razonamiento con herramientas. Su licencia Apache-2.0 facilita su uso comercial, aunque los pesos base de Gemma-4 están sujetos a los términos de Google.

La relevancia actual de este modelo radica en su capacidad para ejecutar agentes con tool calling en entornos con recursos limitados, manteniendo un rendimiento competitivo en tareas de función de llamada. El contexto de entrenamiento alcanza la clase de 131K tokens, aunque se recomienda un valor práctico de 16K para la mayoría de los despliegues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4 E4B (effective-4B active; ~8.0B total params) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | ~4B (efectivos, segun el autor) |
| Longitud de contexto | 131K (entrenado/evaluado); 16K recomendado como valor practico |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 (pesos base Gemma-4 sujetos a terminos de Google) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base CloudSurf-4B-FC es un ajuste fino QLoRA sobre Gemma-4, con una arquitectura E4B que activa aproximadamente 4.000 millones de parámetros de un total de 8.000 millones. No se han publicado detalles sobre la composición exacta del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. La información disponible indica que el ajuste se centró en mejorar las capacidades de function calling y tool use, con un rendimiento medido en BFCL V4.

La versión GGUF mantiene la arquitectura original y añade un template de chat embebido que permite el renderizado de llamadas a herramientas. El uso de `--jinja` en llama.cpp es obligatorio para que las tool calls se parseen correctamente. El modelo también incluye soporte de visión mediante un proyector (mmproj) que se puede emparejar con cualquier cuantización.

## Capacidades

- Function calling y tool use: soporta llamadas a herramientas con múltiples argumentos, selección de herramientas, round-trip con `role:tool`, llamadas paralelas y rechazo de irrelevancias.
- Agentes multi-paso: puede integrarse en pipelines de razonamiento encadenado con llamadas a APIs externas.
- Visión: admite entrada de imágenes mediante el proyector mmproj, heredado de la base Gemma-4.
- Generación de texto conversacional: mantiene las capacidades de diálogo del modelo base.
- Multilingüe: solo inglés confirmado; no se especifican otros idiomas.
- Compatibilidad con OpenAI API: el servidor llama.cpp expone un endpoint compatible con `chat/completions` que devuelve `tool_calls`.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 131K tokens) y realizar llamadas a sistemas de ticketing o bases de conocimiento mediante tool calling.
- Agentes de automatización de tareas: integración en flujos de trabajo que requieren consultar APIs, actualizar registros o enviar notificaciones, gracias a su soporte de llamadas paralelas.
- Generación de código asistida: puede invocar herramientas de análisis estático, ejecución de tests o generación de documentación dentro de un IDE o pipeline de CI/CD.
- Asistentes de productividad: combinación de visión (lectura de capturas de pantalla) y tool calling para crear agentes que gestionan calendarios, correos o tareas.
- Análisis de datos interactivo: el modelo puede llamar a funciones de consulta SQL o APIs de datos para responder preguntas sobre conjuntos de datos, manteniendo el contexto de la conversación.
- Despliegue en edge o entornos con recursos limitados: la cuantización Q4_K_M (5,3 GB) permite ejecutar el modelo en GPUs de 8 GB, habilitando agentes con tool use en dispositivos locales.

## Benchmarks y rendimiento

Los resultados de BFCL V4 se midieron sobre los pesos BF16 del modelo base, no sobre las cuantizaciones GGUF. La evaluación de los quants está pendiente de publicación. Los datos disponibles son:

| Modelo | BFCL V4 (3-seed mean) | Notas |
|---|---|---|
| CloudSurf-4B-FC (BF16) | 55.73 as-registered / 54.91 matched-variant | Medido en el rig del autor |
| Stock (Gemma-4 base) | 34.81 | Mismo rig |
| Nanbeige4-3B | 51.40 | Barra de la clase small-model |
| gpt-oss-20b | 49.09 | Medido en el mismo rig |

No se han publicado resultados de benchmarks para las versiones cuantizadas. Se asume una pérdida de calidad progresiva por debajo de Q8_0, mayor cuanto menor sea el bit-width.

## Requisitos de hardware

- VRAM estimada: Q3_K_M 4,9 GB, Q4_K_M 5,3 GB, Q5_K_M 5,8 GB, Q6_K 6,2 GB, Q8_0 8,0 GB, BF16 15,1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.) para las cuantizaciones Q4-Q6. Para Q8_0 se necesitan 8 GB o más. Para BF16 se recomienda una GPU de 16 GB o más.
- Cabe en GPU de consumo: sí, las cuantizaciones Q3-Q6 caben en GPUs de 8 GB; Q8_0 requiere 8 GB justos.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), LM Studio, Ollama. También es posible usar el servidor OpenAI-compatible para integraciones con clientes estándar.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de especificaciones completas de modelos comparables como Nanbeige4-3B o gpt-oss-20b. La única comparativa disponible es la de rendimiento en BFCL V4, que se muestra en la sección de benchmarks. En cuanto a la versión GGUF, la comparativa directa sería con el modelo base BF16, que presenta las mismas capacidades pero sin pérdida por cuantización. No se han encontrado otros modelos de function calling de tamaño similar con especificaciones públicas comparables.

## Limitaciones y advertencias

- Los resultados de benchmarks corresponden a los pesos BF16; las cuantizaciones pueden presentar degradación de rendimiento, especialmente por debajo de Q8_0.
- El modelo solo soporta inglés de forma confirmada; no se garantiza un rendimiento adecuado en otros idiomas.
- Existe riesgo de alucinación en tareas de razonamiento complejo, como en cualquier modelo de lenguaje.
- La licencia Apache-2.0 se aplica a los pesos del modelo, pero los pesos base de Gemma-4 están sujetos a los términos de uso de Google, que pueden imponer restricciones adicionales.
- El contexto de 131K es el máximo teórico; en la práctica, valores como 16K son más seguros para evitar degradación o consumo excesivo de memoria.
- Se ha observado una entrada de metadata `</s>` en las conversiones GGUF que llama.cpp corrige automáticamente; es benigna pero puede causar confusión en otras herramientas.
- La evaluación de los quants está pendiente; hasta entonces, no se puede garantizar el mismo nivel de calidad que el modelo BF16.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/cloudsurf-software/CloudSurf-4B-FC-GGUF
- Modelo base (BF16): https://huggingface.co/cloudsurf-software/CloudSurf-4B-FC
- Proyector de visión (mmproj): https://huggingface.co/cloudsurf-software/CloudSurf-4B-FC-GGUF/resolve/main/mmproj-CloudSurf-4B-FC.F16.gguf
- Manifest de checksums: https://huggingface.co/cloudsurf-software/CloudSurf-4B-FC-GGUF/resolve/main/quant-manifest.json
- Cuantización comunitaria (imatrix): https://huggingface.co/mradermacher/CloudSurf-4B-FC-i1-GGUF
- Página del modelo en FriendliAI: https://friendli.ai/models/cloudsurf-software/CloudSurf-4B-FC
- Organización CloudSurf en GitHub: https://github.com/cloudsurf-software
