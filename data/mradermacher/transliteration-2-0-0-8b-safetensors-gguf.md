# mradermacher/Transliteration-2.0-0.8B-Safetensors-GGUF

## Resumen

Transliteration-2.0-0.8B-Safetensors-GGUF es la versión cuantizada en formato GGUF del modelo UnimeType/Transliteration-2.0-0.8B-Safetensors, publicada por mradermacher. Se trata de un modelo especializado en transliteración: la conversión entre distintos sistemas de escritura y alfabetos (pinyin, romaji, hinglish, arabizi, cirílico, greeklish, vietnamita, entre otros). Su propósito principal es servir como motor de métodos de entrada (IME, input method editors) para teclados y sistemas de escritura en dispositivos y aplicaciones.

El modelo cuenta con 752.393.024 parámetros totales (aproximadamente 0,8B), lo que lo sitúa en la gama de modelos pequeños optimizados para inferencia de baja latencia. La model card del repositorio etiqueta el modelo con la arquitectura qwen3.5, aunque no se detallan más especificaciones arquitectónicas en la información disponible. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de esta ficha radica en que el repositorio original en safetensors no incluye cuantizaciones, y esta versión GGUF de mradermacher ofrece un abanico de cuantizaciones (desde Q2_K hasta f16) que permiten desplegar el modelo en hardware muy modesto, incluyendo CPU y GPUs de consumo. Con 1560 descargas y un tamaño de repositorio de 7,5 GB (que incluye todas las variantes), es un modelo de nicho pero con un caso de uso muy concreto y bien definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3.5 (según tag de la model card); detalles no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá del tag "qwen3.5" que aparece en la model card del repositorio cuantizado. No se especifican el número de capas, la dimensión de los embeddings, el mecanismo de atención ni si emplea innovaciones como atención lineal o decodificación especulativa. El modelo base es UnimeType/Transliteration-2.0-0.8B-Safetensors, y esta versión es una conversión estática a GGUF realizada por mradermacher (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1 según los metadatos del README).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. El modelo está etiquetado con "v2.6" y "qwen3.5", lo que sugiere una versión 2.6 del modelo de transliteración construida sobre una base de la familia Qwen 3.5, pero estos extremos no se confirman en la documentación proporcionada. La especialización en transliteración y métodos de entrada es el rasgo distintivo declarado.

## Capacidades

- Transliteración entre sistemas de escritura: pinyin (chino), romaji (japonés), hinglish (hindi), arabizi (árabe), cirílico (ruso), greeklish (griego), vietnamita, entre otros.
- Soporte para métodos de entrada (IME): orientado a la conversión de texto latino a escrituras nativas y viceversa en teclados y editores.
- Capacidades multilingües: 13 idiomas declarados (en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it).
- Conversacional: el tag "conversational" sugiere que el modelo puede mantener formato de diálogo, aunque no se detalla su comportamiento en conversación general.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que puede servirse mediante infraestructura de inferencia estándar.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Teclados y métodos de entrada en dispositivos móviles: el modelo puede convertir pulsaciones en alfabeto latino a pinyin, romaji o hinglish en tiempo real, aprovechando su tamaño reducido (0,8B) para ofrecer baja latencia en hardware móvil o de gama baja.
- Aplicaciones de mensajería con escritura mixta: usuarios que escriben árabe con caracteres latinos (arabizi) o hindi con alfabeto latino (hinglish) pueden usar el modelo para normalizar y convertir su texto a la escritura nativa antes de enviarlo.
- Sistemas de búsqueda multilingüe: transliterar consultas de usuario escritas en alfabeto latino a la escritura nativa del corpus (por ejemplo, cirílico o griego) para mejorar la recuperación en motores de búsqueda que indexan en escritura original.
- Normalización de datos para pipelines de NLP: convertir nombres propios, topónimos y entidades escritas en distintos sistemas de transliteración a una forma canónica antes de alimentar modelos de extracción de entidades o traducción.
- Herramientas de accesibilidad y entrada para usuarios sin teclado nativo: permitir escribir en ruso, griego o vietnamita desde un teclado latino estándar mediante transliteración automática, útil en entornos educativos o de oficina.
- Procesamiento por lotes en CPU: gracias a las cuantizaciones Q4_K_S o Q4_K_M (0,6 GB), el modelo puede ejecutarse en servidores sin GPU para tareas de transliteración masiva de documentos o datasets, con un coste de infraestructura mínimo.
- Integración en editores de texto y correctores: como componente de un corrector ortográfico o de un editor que detecta texto transliterado y ofrece la conversión a la escritura correcta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K y Q3_K_S aproximadamente 0,5 GB; Q4_K_S, IQ4_XS y Q4_K_M aproximadamente 0,6 GB; Q5_K_S y Q5_K_M aproximadamente 0,7 GB; Q6_K aproximadamente 0,7 GB; Q8_0 aproximadamente 0,9 GB; f16 aproximadamente 1,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones Q4; una RTX 3060, RTX 4060 o superior ofrece margen holgado. Para f16, una GPU con 4 GB o más es suficiente. También es viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1050 Ti en adelante para cuantizaciones Q4; RTX 3060/4060 para f16 con comodidad).
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o text-generation-webui). Para el modelo base en safetensors, transformers con vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño (0,8B) y las cuantizaciones de 0,6 GB, se espera una latencia baja en hardware de consumo, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Transliteration-2.0-0.8B (este) | 752M | no disponible | Transliteración / IME | Apache 2.0 | GGUF, safetensors |
| Modelo base UnimeType/Transliteration-2.0-0.8B-Safetensors | 752M | no disponible | Transliteración / IME | Apache 2.0 | safetensors |
| Versión i1-GGUF (mradermacher) | 752M | no disponible | Transliteración / IME (quants con imatrix) | Apache 2.0 | GGUF |

No se dispone de información sobre otros modelos comparables de transliteración en la documentación proporcionada, por lo que no se pueden aportar datos de rendimiento comparativo ni de modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos del modelo en la información disponible; al ser un modelo especializado en transliteración, el riesgo de sesgo lingüístico (por ejemplo, favorecer ciertas convenciones de transliteración sobre otras) no puede descartarse.
- Riesgo de alucinación: no evaluado en la documentación; en tareas de transliteración, los errores se manifestarían como conversiones incorrectas de caracteres o palabras, no como texto inventado, pero no hay datos que lo confirmen.
- Limitaciones de contexto e idioma: la longitud de contexto no está disponible; los idiomas declarados son 13, pero no se especifica la calidad por idioma ni si todos tienen el mismo nivel de soporte.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información proporcionada.
- Caveat para producción: al ser una cuantización estática del modelo base, las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar la calidad de la transliteración; se recomienda Q4_K_M o superior para uso en producción. No se dispone de evaluaciones de calidad por cuantización.
- El repositorio tiene 0 likes y 1560 descargas, lo que indica una adopción limitada; no hay evidencia de validación comunitaria extensa.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Transliteration-2.0-0.8B-Safetensors-GGUF
- Modelo base en safetensors: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-Safetensors
- Cuantizaciones con imatrix (i1-GGUF): https://huggingface.co/mradermacher/Transliteration-2.0-0.8B-Safetensors-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Transliteration-2.0-0.8B-Safetensors-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
