# malinali-app/opus-mt-tiv-en

## Resumen

`malinali-app/opus-mt-tiv-en` es un paquete de traducción automática tiv → inglés publicado en HuggingFace por el desarrollador de la aplicación Malinali. No se trata de un modelo entrenado desde cero, sino de una redistribución de los pesos de `Helsinki-NLP/opus-mt-tiv-en` en formato safetensors, acompañados de tokenizadores rápidos (SentencePiece convertido a JSON) preparados específicamente para inferencia on-device con Candle a través del componente `marian_flutter`.

El modelo resuelve un caso de uso muy concreto: traducción bidireccional limitada al par tiv–inglés, donde el tiv (lengua tiv, hablada principalmente en Nigeria) es un idioma de bajos recursos con cobertura escasa en los sistemas de traducción comerciales. Con 66.731.531 parámetros (aproximadamente 66,7 millones) ocupa solo 0,3 GB en el repositorio, lo que lo hace apto para ejecutarse en dispositivos móviles o equipos sin GPU.

Su relevancia actual es doble: por un lado, acerca la traducción de una lengua africana infrarrepresentada a aplicaciones de consumo sin depender de la nube; por otro, sirve como ejemplo de empaquetado reproducible de modelos Marian/OPUS-MT para runtimes ligeros. La ficha pública no aporta métricas de calidad, licencia explícita ni detalles de entrenamiento propios, por lo que debe tratarse como un artefacto de distribución más que como una contribución de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT, familia OPUS-MT) |
| Parametros totales | 66.731.531 (≈66,7 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors; no se publican variantes GGUF, GPTQ, AWQ ni int8) |
| Idiomas soportados | tiv (tiv), en (inglés) |
| Licencia | no disponible en el repositorio; el autor remite a la licencia del modelo original (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors, más `tokenizer-enc.json` y `tokenizer-dec.json` (tokenizadores rápidos separados para fuente y destino) |

## Arquitectura y entrenamiento

La arquitectura declarada por las etiquetas y el `config.json` es MarianMT, un transformer secuencial encoder-decoder diseñado específicamente para traducción automática neuronal. El repositorio contiene cuatro ficheros: `config.json` (configuración Marian), `model.safetensors` (pesos), `tokenizer-enc.json` (tokenizador de la lengua fuente, tiv) y `tokenizer-dec.json` (tokenizador de la lengua destino, inglés). La separación en dos tokenizadores es característica de la implementación Marian de OPUS-MT.

Este repositorio no documenta ningún entrenamiento propio: la model card indica explícitamente que Malinali «solo reempaqueta pesos y convierte SentencePiece a tokenizador rápido JSON de Hugging Face para inferencia on-device», y que no reclama la propiedad del modelo entrenado. Por tanto, los datos de entrenamiento, el número de tokens, la composición del corpus y el uso de técnicas de alineación como backtranslation o fine-tuning con datos paralelos corresponden al modelo original `Helsinki-NLP/opus-mt-tiv-en`, cuya ficha no forma parte de la información disponible en esta consulta. Tampoco hay constancia de RLHF, DPO ni de innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en este paquete.

## Capacidades

- Traducción automática unidireccional tiv → inglés, con decodificación secuencia a secuencia.
- Generación de texto condicionada a la secuencia fuente (pipeline `text2text-generation`).
- Inferencia on-device mediante Candle, a través del componente `marian_flutter` de Malinali.
- Compatibilidad con la librería `transformers` y con el pipeline `translation` de HuggingFace.
- Uso de tokenizadores rápidos independientes para fuente y destino.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de razonamiento explícito.
- Cobertura multilingüe limitada estrictamente al par tiv–inglés; no se declaran otros idiomas.

## Casos de uso

- Traducción offline en aplicaciones móviles: al pesar solo unos 267 MB en FP32 y unos 67 MB en int8, puede embeberse en una app Flutter y traducir tiv → inglés sin conexión, útil en zonas de Nigeria con conectividad intermitente.
- Atención al público en servicios sanitarios o administrativos: traducción de consultas o formularios escritos en tiv para que personal anglófono pueda interpretarlos, con la ventaja de que los datos no salen del dispositivo.
- Digitalización de documentación en tiv: conversión de textos, actas o materiales educativos en tiv a inglés para su catalogación o publicación en repositorios anglófonos.
- Preprocesado de corpus para investigación lingüística: generación de alineaciones preliminares tiv–inglés que después se revisan manualmente para construir datasets paralelos de mayor calidad.
- Subtitulado y traducción de contenido audiovisual comunitario: transcripción en tiv seguida de traducción a inglés para radios locales, podcasts o vídeos divulgativos.
- Integración en pipelines de procesado por lotes: al ser un modelo Marian estándar, puede exportarse a CTranslate2 u ONNX Runtime y ejecutarse en CPU para traducir grandes volúmenes de documentos con coste energético bajo.
- Prototipado de asistentes de traducción en el navegador: mediante transformers.js o un backend Candle/WASM, permite demos interactivas sin servidor GPU.
- Evaluación comparativa de modelos de bajos recursos: sirve como línea base ligera frente a sistemas multilingües grandes (NLLB, M2M-100) en tareas tiv → inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas BLEU, chrF, COMET ni evaluaciones humanas, y tampoco se han encontrado resultados en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 267 MB en FP32, 133 MB en FP16, 67 MB en int8 y 33 MB en int4 (calculado a partir de los 66,7 M de parámetros; no hay cifras oficiales publicadas).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y CPU única.
- Ejecutable en dispositivos móviles y placas tipo Raspberry Pi, que es el escenario objetivo declarado por el autor mediante Candle.
- Opciones de despliegue: Candle (`marian_flutter`), `transformers` con PyTorch, exportación a ONNX Runtime, CTranslate2 y TorchScript.
- llama.cpp, vLLM y TGI no son opciones naturales para esta arquitectura Marian de 66 M de parámetros; vLLM y TGI están orientados a modelos generativos de gran tamaño.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-tiv-en | 66,7 M | no disponible | tiv → en | no disponible (upstream habitualmente CC-BY 4.0) | HuggingFace, 0 descargas |
| Helsinki-NLP/opus-mt-en-tiv | orden de 70-80 M (no confirmado) | no disponible | en → tiv | CC-BY 4.0 (habitual en OPUS-MT) | HuggingFace, dirección inversa |
| facebook/nllb-200-distilled-600M | 600 M | 512 tokens (documentado en la ficha de NLLB) | 200 idiomas, incluye tiv | CC-BY-NC-4.0 | HuggingFace, ampliamente usado |
| facebook/m2m-100 (418M) | 418 M | 1024 tokens (documentado) | 100 idiomas | MIT | HuggingFace |

La ventaja diferencial del modelo de Malinali es el tamaño: es entre seis y nueve veces más pequeño que las alternativas multilingües, lo que permite despliegue on-device, a costa de perder cobertura multilingüe y de no disponer de métricas comparativas publicadas. Los datos de contexto, licencia y parámetros de los modelos comparables deben verificarse en sus fichas oficiales antes de tomar decisiones de producción.

## Limitaciones y advertencias

- No se han publicado métricas de calidad (BLEU, chrF, COMET) para este paquete, por lo que el rendimiento real en tiv → inglés es desconocido.
- El tiv es una lengua de bajos recursos: es previsible una mayor tasa de errores, omisiones y alucinaciones en frases largas, terminología especializada o dominios alejados del corpus de entrenamiento original.
- La licencia no está declarada en el repositorio. El autor remite a la licencia del modelo original, lo que introduce incertidumbre legal para uso comercial; conviene verificar la ficha de `Helsinki-NLP/opus-mt-tiv-en` antes de desplegarlo en producción.
- El repositorio registra 0 descargas y 0 «likes», y las fechas de creación y actualización son del 2 de octubre de 2026; no hay evidencia de uso, mantenimiento ni validación por terceros.
- La longitud de contexto no está documentada. Los modelos Marian de OPUS-MT suelen limitarse a secuencias cortas, de modo que fragmentar entradas largas es una precaución razonable.
- Traducción unidireccional: para en → tiv hace falta el modelo inverso (`Helsinki-NLP/opus-mt-en-tiv`).
- No admite instrucciones, tool calling ni razonamiento multi-paso; es un traductor puro, no un asistente conversacional.
- Al ser una redistribución, cualquier corrección de sesgos o mejora de calidad debe hacerse sobre el modelo original o mediante fine-tuning adicional.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo, su autor ni evaluaciones independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-tiv-en
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tiv-en
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicación Malinali: https://malinali.app
- Búsqueda web: no se encontraron enlaces relevantes sobre este modelo, su autor o sus resultados de evaluación.
