# malinali-app/opus-mt-de-ee

## Resumen

`malinali-app/opus-mt-de-ee` es un paquete de pesos del modelo de traducción automática neuronal Helsinki-NLP OPUS-MT para la dirección alemán (de) → ewé (ee), republicado por el desarrollador malinali-app para su aplicación Malinali. Se trata de una conversión del modelo original `Helsinki-NLP/opus-mt-de-ee` a formato safetensors, acompañada de tokenizadores rápidos en JSON para su uso con el framework Candle a través del componente `marian_flutter`. El modelo no incorpora entrenamiento adicional por parte de malinali-app: es una redistribución de pesos existentes.

La arquitectura subyacente es Marian, un transformer encoder-decoder orientado a text2text-generation, con 75.620.282 parámetros totales y un tamaño de repositorio de 0,3 GB. Está pensado para inferencia on-device (móvil o escritorio) en tareas de traducción alemán-ewé, un par lingüístico de bajos recursos dentro del ecosistema OPUS.

Su relevancia es limitada y muy específica: cubre una dirección de traducción poco atendida por los grandes modelos multilingües y ofrece un empaquetado ligero para despliegue local sin dependencia de GPU. La licencia no está declarada en el repositorio de destino, aunque la model card remite a la del modelo original (habitualmente CC-BY 4.0 en OPUS-MT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, text2text-generation) |
| Parametros totales | 75.620.282 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la configuracion estandar de OPUS-MT suele fijar 512 tokens) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (aproximadamente FP32 por tamano de archivo) |
| Idiomas soportados | aleman (de), ewe (ee) |
| Licencia | no disponible en el repositorio de destino; la model card remite a la del modelo base (tipicamente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors; tokenizadores en JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder secuencial con atencion completa, diseñado para traducción automática neuronal. Es la arquitectura empleada por toda la familia OPUS-MT de Helsinki-NLP. El repositorio de malinali-app no aporta detalles adicionales sobre el número de capas, dimensión del modelo, número de cabezas de atención ni tamaño del vocabulario, por lo que esos hiperparámetros concretos no están disponibles en la información proporcionada.

No se ha realizado entrenamiento adicional ni ajuste fino por parte de malinali-app. La model card indica explícitamente que el proceso consiste en «repackaging weights + conversion SentencePiece → Hugging Face fast tokenizer JSON for on-device inference» y que no se reclama la propiedad del modelo entrenado. Por tanto, no hay datos sobre número de tokens de entrenamiento, composición del dataset, ni uso de RLHF/DPO, ya que el entrenamiento original corresponde a Helsinki-NLP y no se documenta aquí.

La innovación técnica del paquete es de ingeniería de despliegue, no de modelado: la conversión de los tokenizadores SentencePiece originales a dos tokenizadores rápidos independientes (uno para el idioma fuente y otro para el destino) y la publicación de pesos en safetensors para permitir su carga con Candle mediante `marian_flutter`, habilitando inferencia local en dispositivos sin aceleración dedicada.

## Capacidades

- Traducción automática de texto en la dirección aleman (de) → ewe (ee).
- Generación de texto condicionada mediante pipeline `translation` de la librería transformers.
- Carga en formato safetensors compatible con el ecosistema Hugging Face.
- Inferencia on-device mediante Candle (`marian_flutter`) con tokenizadores rápidos separados para fuente y destino.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada exclusivamente al par alemán-ewé; no cubre otras direcciones.

## Casos de uso

- Traducción on-device sin conexión: la aplicación Malinali puede ofrecer traducción alemán-ewé en el propio dispositivo usando Candle, sin enviar texto a servidores externos, gracias al reducido tamaño del modelo (0,3 GB) y su formato safetensors.
- Traducción de documentación comunitaria: traducción de materiales de ONG, textos administrativos o guías sanitarias del alemán al ewé para comunidades de hablantes en Ghana y Togo.
- Subtitulado y post-edición asistida: integración en un pipeline que traduzca segmentos cortos de subtítulos o transcripciones, con revisión humana posterior dado que se trata de un par de bajos recursos.
- Preservación lingüística: generación de corpus paralelos alemán-ewé para investigación en lingüística computacional de lenguas de bajos recursos, aprovechando que el modelo puede producir traducciones preliminares que luego se corrigen manualmente.
- Aplicaciones móviles de bajo consumo: despliegue embebido en Android o iOS mediante Candle, sin requerir GPU, para usuarios con dispositivos de gama media.
- Integración en herramientas de escritorio tipo traductor local: uso dentro de un editor o lector de documentos que traduzca texto seleccionado del alemán al ewé de forma instantánea y privada.
- Fine-tuning posterior: servir como punto de partida para ajustar un modelo alemán-ewé específico de un dominio (por ejemplo, médico o agrícola) partiendo de los pesos safetensors publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de malinali-app no incluye métricas BLEU, chrF, MMLU ni ninguna otra evaluación, y no se dispone de cifras del modelo base `Helsinki-NLP/opus-mt-de-ee` en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (los 75,6 millones de parámetros ocupan aproximadamente 0,3 GB de pesos); en cuantizaciones de 8 o 4 bits bajaría a decenas de MB, aunque no se publican archivos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria sirve; modelos como NVIDIA T4, GTX 1650 o superiores son más que suficientes. No requiere A100 ni H100.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU integradas.
- Ejecución en CPU: viable sin problema dado el reducido tamaño; es el escenario típico para inferencia on-device.
- Opciones de despliegue: Candle mediante `marian_flutter` (objetivo principal declarado); transformers con PyTorch (pipeline `translation`); llama.cpp, Ollama, vLLM o TGI no están soportados de forma directa con estos pesos safetensors de Marian.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-de-ee | 75,6 M | no disponible | de → ee | no disponible (upstream tipicamente CC-BY 4.0) | safetensors + tokenizadores JSON |
| Helsinki-NLP/opus-mt-de-ee | no disponible | no disponible | de → ee | CC-BY 4.0 (segun model card del autor) | pesos originales en transformers |
| Helsinki-NLP/opus-mt-de-et | no disponible | no disponible | de → et | CC-BY 4.0 (tipico) | pesos en transformers |
| facebook/nllb-200-distilled-600M | 600 M | 512 tokens | 200 idiomas (incluye ee y de) | CC-BY-NC 4.0 | transformers, safetensors |

El modelo de malinali-app es esencialmente idéntico en parámetros y capacidades al OPUS-MT original, con la diferencia de formato y empaquetado para Candle. Frente a NLLB-200-distilled-600M, la propuesta de malinali-app es entre siete y ocho veces más pequeña, no cubre 200 idiomas y no permite traducción en múltiples direcciones, pero es mucho más ligera para despliegue on-device y no arrastra la restricción de uso no comercial de la licencia CC-BY-NC de NLLB.

## Limitaciones y advertencias

- Par de bajos recursos: alemán → ewé dispone de menos datos de entrenamiento que pares mayoritarios, por lo que la calidad de traducción es previsiblemente inferior y variable según el dominio.
- Sesgos desconocidos: no se documenta ninguna evaluación de sesgos, y el corpus OPUS puede arrastrar sesgos de género, culturales o de dominio presentes en los textos paralelos originales.
- Riesgo de alucinación: como todo modelo seq2seq, puede generar traducciones fluidas pero incorrectas, especialmente con frases largas, terminología especializada o segmentos ambiguos.
- Dirección única: solo traduce de alemán a ewé; no admite la dirección inversa ni otros pares lingüísticos.
- Contexto limitado: no se declara la longitud máxima de contexto en el repositorio; la configuración habitual de OPUS-MT está en torno a 512 tokens, lo que limita la traducción de documentos largos sin segmentación previa.
- Licencia no disponible en el repositorio de destino: antes de uso comercial es imprescindible verificar la licencia real del modelo base `Helsinki-NLP/opus-mt-de-ee` en su model card original.
- Cero adopción registrada: el repositorio muestra 0 descargas y 0 «likes», sin validación comunitaria ni issues públicos que permitan evaluar su fiabilidad.
- Soporte de despliegue restringido: al no publicarse GGUF ni pesos cuantizados, no se puede usar directamente con llama.cpp, Ollama, vLLM o TGI; el camino previsto es Candle o transformers.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/malinali-app/opus-mt-de-ee
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-de-ee
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicación Malinali: https://malinali.app
