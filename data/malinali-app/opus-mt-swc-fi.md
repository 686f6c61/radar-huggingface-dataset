# malinali-app/opus-mt-swc-fi

## Resumen

El modelo malinali-app/opus-mt-swc-fi es un modelo de traducción automática de Congo Swahili (swc) a finés (fi), publicado por malinali-app. Se distribuye como un paquete de pesos en formato safetensors y tokenizadores rápidos en JSON, diseñado para su uso con Candle en inferencia en dispositivo. Está basado en el modelo Helsinki-NLP/opus-mt-swc-fi del proyecto OPUS-MT, del que hereda la arquitectura Marian y los pesos entrenados. Con 76 millones de parámetros, es un modelo compacto que aborda la necesidad de traducción entre un par de lenguas de bajos recursos en entornos con recursos limitados, como aplicaciones móviles sin conexión. Su relevancia actual reside en facilitar el despliegue de traducción neuronal en dispositivos edge, ampliando el acceso a la traducción para comunidades que hablan Congo Swahili y necesitan contenido en finés.

El repositorio no incluye detalles sobre el entrenamiento original, pero al estar basado en OPUS-MT, se espera que haya sido entrenado con datos paralelos del corpus OPUS. La licencia no está especificada en los metadatos, aunque la model card indica que se debe seguir la licencia del modelo base, típicamente CC-BY 4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parámetros totales | 76.054.793 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | swc (Congo Swahili), fi (finés) |
| Licencia | no disponible en metadatos; la model card indica seguir la licencia del modelo base (típicamente CC-BY 4.0) |
| Formato de pesos | safetensors |
| Modelo base | Helsinki-NLP/opus-mt-swc-fi |
| Tamaño del repositorio | 0.3 GB |
| Pipeline | translation |
| Librería | transformers (también compatible con Candle) |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer encoder-decoder diseñado específicamente para traducción automática neuronal. El modelo tiene 76 millones de parámetros y sigue la estructura típica de los modelos OPUS-MT, con mecanismos de atención multi-cabeza y capas de normalización. No se han proporcionado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas de ajuste como RLHF o DPO. La innovación principal de este repositorio es el reempaquetado de los pesos originales en formato safetensors y la conversión de los tokenizadores SentencePiece a JSON de tokenizador rápido de Hugging Face, lo que permite su uso con Candle (marian_flutter) para inferencia en dispositivo. No se trata de un modelo nuevo entrenado desde cero, sino de una adaptación de los pesos de Helsinki-NLP/opus-mt-swc-fi para facilitar su despliegue en entornos locales.

## Capacidades

- Traducción de texto de Congo Swahili (swc) a finés (fi).
- Generación de texto secuencia a secuencia para tareas de traducción.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües más allá del par swc-fi.
- No dispone de modo de pensamiento (thinking mode), visión ni audio.
- Compatible con tokenizadores rápidos para Candle.

## Casos de uso

- Traducción en aplicaciones móviles sin conexión: el modelo es lo suficientemente pequeño (76M parámetros) para ejecutarse en dispositivos móviles mediante Candle, permitiendo traducción offline de swc a fi en zonas sin conectividad.
- Localización de contenido web: integración en servidores para traducir dinámicamente páginas web de swc a fi, mejorando la accesibilidad para hablantes de Congo Swahili.
- Comunicación en ONGs y ayuda humanitaria: facilitar la comunicación entre trabajadores humanitarios y comunidades de habla swc mediante traducción automática en tiempo real o por lotes.
- Subtitulado automático: traducir subtítulos de vídeos de swc a fi para plataformas de vídeo bajo demanda, ampliando la audiencia.
- Preprocesamiento en pipelines de NLP: como paso previo para tareas como análisis de sentimiento o clasificación de textos en finés, traduciendo primero desde swc.
- Traducción de documentos técnicos y legales: para organizaciones que necesitan traducir material escrito de swc a fi con un modelo ligero y desplegable localmente.
- Investigación en traducción de bajos recursos: como baseline para experimentos de traducción automática entre lenguas con pocos datos paralelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 300 MB en precisión FP32, 150 MB en FP16 y 75 MB en int8.
- GPU recomendadas: cualquier GPU moderna, incluidas integradas; también se puede ejecutar en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de VRAM (por ejemplo, GTX 1050, RTX 3060, etc.).
- Opciones de despliegue: Candle (marian_flutter), transformers (PyTorch), potencialmente ONNX Runtime. No es compatible con llama.cpp al no ser un modelo de lenguaje grande.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Helsinki-NLP/opus-mt-swc-fi | 76M | no disponible | CC-BY 4.0 (típico) | PyTorch |
| malinali-app/opus-mt-swc-fi | 76M | no disponible | no disponible (sigue upstream) | safetensors |
| Otros modelos OPUS-MT | ~76M | no disponible | CC-BY 4.0 (típico) | PyTorch |

No se dispone de datos de rendimiento comparativo. La principal diferencia con el modelo base es el formato de pesos y los tokenizadores optimizados para Candle.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo modelo generativo, puede producir traducciones incorrectas o inventar contenido cuando la entrada es ambigua o fuera de dominio.
- Sesgos: el modelo base fue entrenado con corpus OPUS, que puede contener sesgos de género, culturales o geográficos; estos pueden reflejarse en las traducciones.
- Limitación de contexto: no se especifica la longitud máxima de contexto en la información proporcionada.
- Idiomas: solo soporta la dirección swc → fi; no traduce a otros idiomas ni en sentido inverso.
- Licencia: la licencia no está especificada en los metadatos; aunque la model card indica seguir la licencia del modelo base (típicamente CC-BY 4.0), se debe verificar antes de un uso comercial.
- Producción: el repositorio tiene 0 descargas y 0 likes, y no se han publicado benchmarks; se recomienda una evaluación exhaustiva antes de desplegarlo en producción.
- Calidad: al tratarse de un par de lenguas de bajos recursos, la calidad de traducción puede ser inferior a la de pares con más datos paralelos.
- No es un modelo de propósito general: solo realiza traducción de texto, sin capacidades de razonamiento, tool calling o agentes.

## Enlaces

- [HuggingFace: malinali-app/opus-mt-swc-fi](https://huggingface.co/malinali-app/opus-mt-swc-fi)
- [Modelo base: Helsinki-NLP/opus-mt-swc-fi](https://huggingface.co/Helsinki-NLP/opus-mt-swc-fi)
- [Proyecto OPUS-MT en GitHub](https://github.com/Helsinki-NLP/Opus-MT)
- [Malinali](https://malinali.app)
