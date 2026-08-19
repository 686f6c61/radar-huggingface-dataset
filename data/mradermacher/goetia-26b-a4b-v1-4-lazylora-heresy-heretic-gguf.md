# mradermacher/Goetia-26B-A4B-v1.4-LazyLora-heresy-Heretic-GGUF

## Resumen

Goetia-26B-A4B-v1.4-LazyLora-heresy-Heretic-GGUF es una colección de cuantizaciones GGUF del modelo homónimo creado por alexokita, preparada por mradermacher para su ejecución local eficiente. El modelo base es un merge de tipo MoE (mezcla de expertos) con 26.000 millones de parámetros totales y 4.000 millones activos, construido sobre la arquitectura Gemma 4 (según los tags del repositorio). Se ha sometido a un proceso de *abliteration* y *heretic* para eliminar los rechazos y restricciones típicas de los modelos comerciales, orientándose a casos de uso como roleplay, escritura creativa y conversación sin censura.

La versión GGUF incluye múltiples niveles de cuantización (desde Q2_K hasta Q8_0) y archivos *mmproj* que sugieren capacidades multimodales adicionales. El repositorio está pensado para desarrolladores que quieran desplegar el modelo en entornos con recursos limitados usando llama.cpp, Ollama u otros runners compatibles con GGUF. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque el contenido generado puede ser problemático por su naturaleza sin filtros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Gemma 4, con módulo multimodal (mmproj) |
| Parametros totales | 572.794.416 (dato de safetensors, posiblemente erróneo; el nombre indica 26B-A4B) |
| Parametros activos | 4B (según la nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors para el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los tags del repositorio: *moe*, *gemma4*, *abliteration*, *heretic*. Se infiere que es un modelo de mezcla de expertos con 26B parámetros totales y 4B activos, derivado de la familia Gemma 4. El autor del modelo base (alexokita) indica que se trata de una extracción de LoRA de Goetia 1.4 aplicada sobre un modelo llamado SOMPOA (según la descripción en friendli.ai). No se especifican datos de entrenamiento, número de tokens, ni técnicas de alineación adicionales. La etiqueta *LazyLora* sugiere un enfoque de adaptación ligera mediante LoRA, mientras que *heretic* y *abliteration* apuntan a un proceso de eliminación de rechazos y sesgos de seguridad.

## Capacidades

- Generación de texto conversacional y creativo, especialmente orientado a roleplay y narrativa sin restricciones.
- Soporte multimodal (visión) gracias a los archivos *mmproj* incluidos, aunque no se especifica el detalle de las capacidades visuales.
- Capacidad multilingüe limitada al inglés según los metadatos.
- No se dispone de información sobre tool calling, function calling, ni razonamiento multi-paso.
- El modelo ha sido sometido a *abliteration*, lo que elimina los rechazos típicos de seguridad, permitiendo generar contenido que otros modelos bloquean.

## Casos de uso

- Roleplay y simulación de personajes: el modelo está específicamente diseñado para mantener conversaciones inmersivas y sin filtros, ideal para juegos de rol textual o asistentes de ficción interactiva.
- Escritura creativa sin censura: generación de historias, diálogos o guiones con temáticas adultas o controvertidas que otros modelos rechazarían.
- Chat conversacional personalizado: puede adaptarse a estilos de habla y personalidades mediante prompts, gracias a su fine-tuning orientado a interacción natural.
- Prototipado de asistentes con personalidad: desarrollo de chatbots con caracteres definidos que no siguen las políticas de seguridad convencionales.
- Generación de contenido multimodal (si se usa con el mmproj): descripción de imágenes o generación de texto a partir de entradas visuales, aunque no hay documentación detallada.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para analizar los efectos de la abliteration en el comportamiento y la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un MoE con 4B parámetros activos, la VRAM necesaria para inferencia es considerablemente menor que la de un modelo denso de 26B. Con cuantización Q4_K_M, se estima un consumo de unos 4-5 GB de VRAM para el modelo principal, más el mmproj si se usa.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) para las cuantizaciones más bajas; para Q8_0 o f16 se necesitarían 8-12 GB.
- Es compatible con runners como llama.cpp, Ollama, LM Studio y cualquier software que soporte GGUF.
- La latencia depende del hardware, pero al tener solo 4B activos, el throughput es notablemente superior al de un modelo denso equivalente.
- Para uso en producción con alta concurrencia, se recomienda un servidor con GPU de gama alta (A100, H100) y el uso de vLLM o TGI si se convierte el modelo a formato compatible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El nombre sugiere que es una variante de Gemma 4, pero no hay datos de rendimiento ni de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente desprovisto de mecanismos de seguridad (*abliteration*), por lo que puede generar contenido ofensivo, ilegal o éticamente cuestionable. No es adecuado para aplicaciones comerciales donde se requiera moderación.
- Solo soporta inglés, lo que limita su uso en entornos multilingües.
- No se han publicado detalles sobre la longitud de contexto máxima, lo que puede provocar errores o degradación en conversaciones muy largas.
- Los datos de parámetros totales son inconsistentes (el safetensors indica 572M, mientras que el nombre sugiere 26B), lo que genera incertidumbre sobre el tamaño real del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar las políticas de las plataformas de distribución.
- No hay información sobre el proceso de entrenamiento ni sobre sesgos específicos, aunque es probable que herede los sesgos de los datos de Gemma 4 y del fine-tuning de roleplay.

## Enlaces

- [Repositorio HuggingFace de la cuantización GGUF](https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.4-LazyLora-heresy-Heretic-GGUF)
- [Modelo base en HuggingFace (alexokita)](https://huggingface.co/alexokita/Goetia-26B-A4B-v1.4-LazyLora-heresy-Heretic)
- [Variante con imatrix (i1-GGUF)](https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.4-LazyLora-heresy-i1-GGUF)
- [Variante sin heretic (Goetia-26B-A4B-v1.4-GGUF)](https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.4-GGUF)
- [Página de despliegue en friendli.ai](https://friendli.ai/models/MuXodious/Goetia-26B-A4B-v1.4-LazyLora-heresy)
- [Repositorio GitHub relacionado (Damacol)](https://github.com/Damacol/mradermacher-gemma-4-26b-a4b-it-heretic-ara-v2-i1-/tree/main)
