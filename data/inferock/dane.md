# Inferock/DANE

## Resumen

DANE (Decision Aware Neural Engine) es un modelo de lenguaje de clase frontier desarrollado por Inferock, presentado como un modelo híbrido y accesible exclusivamente a través de API. No se publican pesos en Hugging Face: el repositorio actúa únicamente como punto de entrada y ficha descriptiva, y el acceso real se realiza mediante el endpoint compatible con chat completions de Inferock bajo el identificador de modelo `dane`. El modelo está orientado a generación de texto conversacional y razonamiento, con un enfoque declarado en la fiabilidad de las respuestas.

La relevancia del modelo radica en su resultado declarado en Humanity's Last Exam (Diamond), un conjunto de 1.000 preguntas de dificultad extrema: 79,4 de precisión (794 de 1.000 correctas) con uso de herramientas, según la ejecución del propio autor del 4 de noviembre de 2026. Se trata de una cifra notable para un benchmark diseñado precisamente para resistir la saturación de los modelos actuales, aunque el dato no está verificado de forma independiente (`verified: false` en el model-index).

La información pública disponible es limitada: no se especifican arquitectura concreta, número de parámetros, longitud de contexto ni composición del dataset de entrenamiento. La model card remite a la página de modelos de Inferock para consultar la ventana de contexto y las modalidades soportadas. El precio declarado es de 8 USD por millón de tokens de entrada y 30 USD por millón de tokens de salida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida (tipo concreto no disponible); etiquetada como "hybrid-model" y "frontier class" |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (remite a https://inferock.ai/models/) |
| Tipos de cuantización | no disponible (acceso solo por API; no se distribuyen pesos) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Inferock Terms (`license: other`, `license_name: inferock-terms`) |
| Formato de pesos | no disponible; no se publican pesos en el Hub (acceso solo por API) |
| Modalidades | no disponible (remite a https://inferock.ai/models/) |
| Identificador de modelo | `dane` |
| Precio | 8 USD / millón de tokens de entrada; 30 USD / millón de tokens de salida |
| Inferencia local | no (`inference: false`) |

## Arquitectura y entrenamiento

Inferock describe DANE como un "modelo híbrido de clase frontier", sin detallar la arquitectura interna (transformer, mezcla de expertos, modelo híbrido con componentes de estado recurrente u otra combinación). La etiqueta `hybrid-model` sugiere una combinación de mecanismos, pero no se aporta información técnica que permita confirmar qué componentes la integran. Tampoco se especifican el número de parámetros, la longitud de contexto, la composición del corpus de entrenamiento ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

La única información sobre el proceso de evaluación es metodológica: el resultado de 79,4 en HLE Diamond se obtuvo con uso de herramientas, empleando el prompt de juez oficial de HLE, GPT-5.6 Luna (medium) como juez y pass@1, con las preguntas sin respuesta contabilizadas como incorrectas. La ejecución la realizó Inferock el 4 de noviembre de 2026. No hay datos publicados sobre tokens de entrenamiento, dataset, innovaciones de decodificación ni optimizaciones de atención.

## Capacidades

- Generación de texto y razonamiento de alta dificultad, con un resultado declarado de 79,4 en HLE Diamond (con herramientas).
- Uso de herramientas (tool calling) en el contexto de evaluación: el resultado de HLE se obtuvo explícitamente "with tools".
- Conversación multi-turno mediante una API compatible con chat completions estándar (`/v1/chat/completions`).
- Respuesta a peticiones con el identificador de modelo `dane` a través del gateway de Inferock.
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- No se documentan capacidades de visión, audio, modo thinking explícito ni agentes multi-paso más allá del uso de herramientas en evaluación.

## Casos de uso

- Razonamiento sobre preguntas de alta dificultad: el modelo está posicionado para resolver problemas de nivel experto (el propio HLE es un conjunto de preguntas de posgrado y nivel profesional), por lo que encaja en flujos de investigación asistida donde se requiere una respuesta fiable a preguntas complejas con acceso a herramientas.
- Asistentes conversacionales vía API: al exponerse como endpoint compatible con chat completions, puede integrarse en aplicaciones de chat existentes sin cambios de infraestructura, sustituyendo el modelo por `dane` en la llamada.
- Evaluación comparativa de modelos frontier: útil como referencia en pipelines internos de evaluación que midan rendimiento en benchmarks de razonamiento extremo, dado su resultado declarado en HLE Diamond.
- Automatización de consultas técnicas con herramientas: la evaluación con tools sugiere que el modelo puede orquestar llamadas a herramientas externas para resolver tareas que requieren información actualizada o cálculo.
- Prototipado rápido sin infraestructura propia: al ser API-only, permite probar un modelo de clase frontier sin aprovisionar GPUs, útil para equipos que necesitan validar una idea antes de invertir en despliegue.
- Generación de respuestas en inglés para productos dirigidos a ese mercado: el soporte se limita al inglés, por lo que es adecuado para aplicaciones anglófonas y no para producción multilingüe.

## Benchmarks y rendimiento

| Benchmark | Dane | Notas |
|---|---|---|
| Humanity's Last Exam (Diamond) | 79,4 (794/1.000) | Con herramientas; juez GPT-5.6 Luna (medium); pass@1; ejecución de Inferock del 4-11-2026; `verified: false` |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones directas con modelos similares aportadas por el autor.

## Requisitos de hardware

- No aplica despliegue local: el modelo es API-only y no se publican pesos en el Hub (`inference: false`).
- No es posible estimar VRAM, GPUs recomendadas ni throughput, ya que se desconocen el tamaño y la arquitectura del modelo.
- El acceso se realiza mediante peticiones HTTPS al gateway de Inferock (`/v1/chat/completions`), por lo que el requisito de hardware en el cliente es mínimo: cualquier entorno capaz de realizar llamadas HTTP.
- Opciones de despliegue: exclusivamente la API de Inferock; no hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni otros motores de inferencia local.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría, y no se dispone de datos verificables de parámetros, contexto o rendimiento de DANE que permitan una comparación rigurosa con alternativas frontier.

## Limitaciones y advertencias

- El resultado de 79,4 en HLE Diamond está declarado por el autor y marcado como no verificado (`verified: false`); no debe tratarse como una cifra validada de forma independiente.
- No se publican pesos ni detalles de arquitectura, parámetros o entrenamiento, lo que impide auditar el modelo o reproducir sus resultados.
- La licencia es "Inferock terms" (`license: other`), con condiciones no detalladas en la información disponible; es necesario revisar los términos antes de cualquier uso comercial.
- El soporte de idiomas se limita al inglés, lo que excluye su uso en producción para castellano u otros idiomas sin una evaluación adicional.
- No se especifica la longitud de contexto; la model card remite a la web de Inferock, por lo que no puede planificarse el uso con documentos largos sin consultar esa fuente.
- Riesgo de alucinación inherente a los modelos generativos: no se documentan mecanismos específicos de mitigación ni tasas de error fuera del benchmark citado.
- Dependencia total del proveedor: al ser API-only, cualquier uso en producción queda sujeto a la disponibilidad, los cambios de precio y las políticas de Inferock.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Inferock/DANE
- Sitio de Inferock: https://inferock.ai
- Página de modelos (contexto y modalidades): https://inferock.ai/models/
- Documentación de precios: https://inferock.ai/docs/pricing/
- Dataset de evaluación HLE Diamond: https://huggingface.co/datasets/cais/hle-diamond
