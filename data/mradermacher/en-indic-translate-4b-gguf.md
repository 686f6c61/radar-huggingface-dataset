# mradermacher/en-indic-translate-4b-GGUF

## Resumen

El modelo `en-indic-translate-4b` es un sistema de traducción automática desarrollado por sulabhkatiyar y distribuido en formato GGUF por mradermacher. Está diseñado para traducir entre inglés y once lenguas índicas: asamés, bengalí, gujarati, hindi, kannada, malayalam, maratí, oriya, punjabi, tamil y telugu. El modelo se publica bajo licencia Gemma y se inscribe en el ámbito de la traducción automática para el subcontinente indio, una región con un enorme volumen de hablantes que necesitan servicios y contenidos en su lengua nativa.

La versión GGUF presentada es una cuantización del modelo base `sulabhkatiyar/en-indic-translate-4b`. Este formato permite ejecutar el modelo en entornos con recursos limitados mediante herramientas como llama.cpp, Ollama o LM Studio. Aunque el nombre sugiere un tamaño de 4.000 millones de parámetros, los pesos totales disponibles en safetensors ascienden a 7.518.069.290 (aproximadamente 7.500 millones). No se especifica la arquitectura ni la longitud de contexto en la información proporcionada, pero la presencia de archivos `.mmproj` sugiere una posible compatibilidad multimodal con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parametros totales | 7.518.069.290 (aproximadamente 7.500 millones) |
| Parametros activos | No disponible (no se confirma que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles, asames, bengali, gujarati, hindi, kannada, malayalam, marati, oriya, punjabi, tamil, telugu |
| Licencia | Gemma |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura, los datos de entrenamiento o el proceso de alineación en la información disponible. Los tags de HuggingFace incluyen la etiqueta `gemma4`, lo que podría indicar que el modelo base se basa en la arquitectura de Gemma, pero no hay documentación oficial que lo confirme. La model card del autor original se limita a describir el modelo como un traductor entre inglés e índico.

Por tratarse de una cuantización, el proceso de conversión ha transformado los pesos de punto flotante originales a cuantizaciones de menor precisión (por ejemplo, Q4_K_M, Q8_0), manteniendo la estructura del modelo pero reduciendo el tamaño y los requisitos de memoria. No se aporta información sobre el número de tokens del entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO.

## Capacidades

- Traducción directa entre inglés y once lenguas índicas: asamés, bengalí, gujarati, hindi, kannada, malayalam, maratí, oriya, punjabi, tamil y telugu.
- Soporte de inferencia conversacional según los tags de HuggingFace, aunque no se documentan detalles de funcionamiento.
- Los archivos `.mmproj` incluidos (f16 y Q8_0) apuntan a un posible soporte multimodal, permitiendo su uso junto con componentes de visión en llama.cpp. No hay documentación adicional.
- No se dispone de información sobre tool calling, function calling, agentes, razonamiento ni generación de código.

## Casos de uso

- Traducción de documentación técnica: el modelo convierte manuales y especificaciones del inglés a lenguas índicas, lo que facilita la adopción de productos en mercados locales. Al estar especializado en estos pares lingüísticos, la traducción resultante es más natural que la de un modelo multilingüe genérico.
- Localización de interfaces de usuario: se puede integrar en un pipeline de procesamiento por lotes para traducir cadenas de texto de aplicaciones y sitios web, reduciendo el coste de localización en la India.
- Subtitulado de vídeos y cursos online: la traducción de diálogos o guiones en inglés a subtítulos en hindi, tamil o telugu permite ampliar el alcance de contenido educativo y de entretenimiento.
- Atención al cliente multilingüe: en un servicio de soporte, puede traducir las consultas de los usuarios entre inglés y su lengua madre, permitiendo que el agente responda sin necesidad de un intérprete humano.
- Traducción de contenido legal y administrativo: los textos legales redactados en inglés se pueden traducir a lenguas regionales para garantizar el acceso a la justicia de ciudadanos que no dominan el inglés.
- Generación de contenido para redes sociales y medios regionales: los equipos de marketing pueden traducir campañas del inglés a múltiples lenguas índicas en un solo paso, acelerando la publicación.
- Investigación en traducción automática: al estar cuantizado, permite ejecutar experimentos de traducción en CPU o en GPUs de consumo, ideal para investigadores que no disponen de infraestructuras grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño de archivo por cuantización: Q2_K: 4,5 GB, Q3_K_S: 4,8 GB, Q3_K_M: 5,0 GB, Q3_K_L: 5,1 GB, IQ4_XS: 5,2 GB, Q4_K_S: 5,3 GB, Q4_K_M: 5,4 GB, Q5_K_S: 5,8 GB, Q5_K_M: 5,9 GB, Q6_K: 6,3 GB, Q8_0: 8,1 GB, f16: 15,2 GB.
- Para Q4_K_S/Q4_K_M (5,3–5,4 GB), una GPU doméstica con 6–8 GB de VRAM es suficiente. También se puede ejecutar en CPU con 8 GB de RAM.
- Para Q8_0 (8,1 GB) se recomienda una GPU con 10–12 GB de VRAM, como una RTX 3060 12GB o RTX 4070 Ti Super 16GB, o bien CPU con 12 GB de RAM.
- Para f16 (15,2 GB) se necesita una GPU con 16–24 GB de VRAM (RTX 4080/4090, A100 40GB) o un sistema con 16 GB o más de RAM en modo CPU.
- Las cuantizaciones Q2_K e IQ4_XS son las más pequeñas y pueden ejecutarse en tarjetas de 4 GB, aunque la calidad de traducción se reduce notablemente.
- Compatibilidad: cualquier backend que soporte GGUF, como llama.cpp (llama-cli, llama-server), Ollama, LM Studio o KoboldCpp. También se puede usar con bindings de Python como llama-cpp-python.
- Nota: vLLM y TGI no son compatibles con GGUF; para esos motores se necesitaría el modelo base en formato Safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparación cuantitativa. Las únicas referencias disponibles son el modelo base `sulabhkatiyar/en-indic-translate-4b` (en formato Transformers/Safetensors) y otros modelos de traducción índica como IndicTrans2, pero no se han publicado benchmarks ni especificaciones públicas comparables. Por ello, no se puede realizar una comparación rigurosa en esta ficha.

## Limitaciones y advertencias

- El ámbito de traducción está limitado a los pares inglés–índicos; puede mostrar un rendimiento deficiente con lenguas fuera de ese conjunto o con tareas ajenas a la traducción.
- No se documentan los sesgos lingüísticos o culturales del modelo. Como ocurre con todos los sistemas de traducción, pueden existir preferencias hacia variantes estándar o vocabulario dominante.
- El riesgo de alucinaciones (traducir fragmentos inexistentes o interpretar erróneamente el original) no se ha evaluado en la información disponible, por lo que se recomienda revisión humana en aplicaciones críticas.
- La licencia Gemma impone condiciones de uso específicas definidas por Google. Antes de un uso comercial, es obligatorio revisar los términos de la licencia, que pueden prohibir determinados usos.
- Las cuantizaciones agresivas (Q2_K, IQ4_XS, Q3_K) degradan la calidad de la traducción. Para tareas de producción, se recomienda usar Q4_K_M, Q5_K_M o Q8_0.
- La longitud de contexto no se especifica; en consecuencia, no se puede garantizar el comportamiento en documentos extensos o en conversaciones de muchos turnos.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/en-indic-translate-4b-GGUF
- Modelo base en HuggingFace: https://huggingface.co/sulabhkatiyar/en-indic-translate-4b
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Página de listado externo: https://hf.tst.eu/model#en-indic-translate-4b-GGUF
- Repositorio de IndicTrans2 (modelo de traducción índica de AI4Bharat, referencia en el ámbito): https://github.com/ai4bharat/IndicTrans2
