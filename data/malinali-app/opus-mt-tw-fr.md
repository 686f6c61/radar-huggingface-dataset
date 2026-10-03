# malinali-app/opus-mt-tw-fr

## Resumen

malinali-app/opus-mt-tw-fr es un modelo de traducción automática neuronal (NMT) para el par de idiomas tw (twi) → fr (francés). Lo publica malinali-app como un reempaquetado del modelo Helsinki-NLP/opus-mt-tw-fr, con pesos en safetensors y tokenizadores rápidos en formato JSON, pensado para inferencia en dispositivo (on-device) mediante Candle y la librería marian_flutter de la app Malinali.

El modelo emplea una arquitectura transformer seq2seq (encoder-decoder) de tipo Marian, con 75.537.176 parámetros totales y un tamaño de repositorio de 0,3 GB. No se especifica la longitud de contexto en la información disponible. Su relevancia radica en ofrecer traducción tw→fr ligera y ejecutable localmente, sin necesidad de conexión ni servidores externos, lo que facilita su integración en aplicaciones móviles y entornos con recursos limitados.

Malinali no entrena el modelo: solo convierte los pesos y los tokenizadores SentencePiece originales a formatos compatibles con Hugging Face y Candle. La licencia no está indicada en los metadatos, aunque la model card remite a la licencia del modelo upstream (habitualmente CC-BY 4.0 para OPUS-MT).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (Marian NMT), encoder-decoder |
| Parámetros totales | 75.537.176 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | tw (twi), fr (francés); dirección tw → fr |
| Licencia | no disponible en los metadatos; la model card indica seguir la licencia del modelo upstream (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors; tokenizadores en JSON (tokenizer-enc.json, tokenizer-dec.json) |

## Arquitectura y entrenamiento

La arquitectura es un transformer seq2seq de tipo Marian, con un encoder y un decoder. Marian es un toolkit de traducción automática neuronal desarrollado por el grupo Helsinki-NLP, ampliamente utilizado en la familia OPUS-MT. El modelo base Helsinki-NLP/opus-mt-tw-fr fue entrenado por Helsinki-NLP sobre corpus paralelos del proyecto OPUS, aunque la model card no proporciona el número exacto de tokens de entrenamiento ni la composición detallada del dataset.

Malinali-app no realiza un entrenamiento adicional: su aportación consiste en reempaquetar los pesos en safetensors y convertir los tokenizadores SentencePiece originales a tokenizadores rápidos de Hugging Face (tokenizer-enc.json y tokenizer-dec.json) para su uso con Candle y marian_flutter. No se documentan técnicas como RLHF, DPO o decodificación especulativa en la información disponible.

## Capacidades

- Traducción de texto de tw (twi) a fr (francés).
- Generación de texto seq2seq (pipeline text2text-generation).
- Tokenización rápida mediante tokenizadores JSON compatibles con Hugging Face.
- Inferencia en dispositivo (on-device) a través de Candle y la librería marian_flutter.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües más allá del par tw-fr.
- No incorpora visión, audio, modo thinking ni otras capacidades especiales.

## Casos de uso

- Traducción offline en aplicaciones móviles: integrar el modelo en una app Flutter mediante marian_flutter para traducir texto de tw a fr sin conexión a internet, gracias a su tamaño reducido (0,3 GB) y bajo consumo de recursos.
- Traducción de mensajes en tiempo real: usar el modelo en un chat o cliente de mensajería para traducir conversaciones entrantes en tw al francés de forma local, preservando la privacidad de los datos.
- Traducción de documentos breves: procesar correos, notas o párrafos sueltos en tw y obtener su versión en francés para su posterior revisión humana.
- Preprocesamiento en pipelines de NLP: traducir texto tw a fr antes de aplicar otras herramientas de análisis (análisis de sentimiento, extracción de entidades) que solo estén disponibles en francés.
- Herramienta de línea de comandos para desarrolladores: crear un CLI que traduzca cadenas de texto o archivos de localización de tw a fr de forma local, sin depender de APIs externas.
- Sistemas embebidos y dispositivos de bajo consumo: desplegar el modelo en una Raspberry Pi o un dispositivo similar para traducción puntual en kioscos o terminales de atención al público.
- Traducción de contenido web: integrar el modelo en una extensión de navegador que traduzca fragmentos de páginas web en tw al francés bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB. Con pesos en FP32 (~302 MB) o FP16 (~151 MB); en cuantización int8 podría ocupar ~76 MB, aunque no se especifican cuantizaciones compatibles.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU moderna (NVIDIA GTX/RTX, AMD, Intel Arc o integradas) es más que suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU y dispositivos móviles.
- Opciones de despliegue: transformers (PyTorch), Candle (Rust) mediante marian_flutter; no se documentan despliegues con vLLM, llama.cpp, Ollama o TGI. La conversión a GGUF no está indicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

En la información disponible no se detallan benchmarks ni alternativas comparables más allá del modelo base. Se compara únicamente con el modelo upstream.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| malinali-app/opus-mt-tw-fr | 75.537.176 | no disponible | tw → fr | no disponible (upstream: habitualmente CC-BY 4.0) | safetensors + tokenizadores JSON | 0 descargas, 0 likes; repositorio de 0,3 GB |
| Helsinki-NLP/opus-mt-tw-fr | 75.537.176 (mismos pesos que el modelo base) | no disponible | tw → fr | no disponible (habitualmente CC-BY 4.0) | safetensors / PyTorch | modelo upstream ampliamente disponible |

## Limitaciones y advertencias

- Modelo especializado en traducción, no es un modelo de propósito general: no puede mantener conversaciones, razonar ni generar código.
- Riesgo de alucinación en traducción automática: puede producir traducciones fluidas pero incorrectas, especialmente en términos técnicos o poco frecuentes.
- Sesgos heredados del corpus OPUS: posibles sesgos de género, culturales o geográficos presentes en los datos de entrenamiento.
- Longitud de contexto no especificada: no se indica el máximo de tokens de entrada; los modelos OPUS-MT suelen limitarse a frases o párrafos cortos, pero no está confirmado.
- Licencia no disponible en los metadatos: aunque la model card apunta a la licencia upstream (habitualmente CC-BY 4.0, que permite uso comercial con atribución), se debe verificar antes de un uso comercial.
- Modelo con 0 descargas y 0 likes: no ha sido validado por la comunidad; su calidad real no está contrastada.
- Fecha de creación y actualización: 2026-10-02, una fecha futura respecto a la actualidad; puede tratarse de un error en los metadatos o de un repositorio programado.
- Sin filtros de seguridad ni moderación: el modelo puede traducir contenido sensible sin restricciones.
- Solo traduce en la dirección tw → fr; no soporta la dirección inversa ni otros pares de idiomas.
- Calidad limitada para tw: al ser un idioma de bajos recursos, la cobertura y precisión pueden ser menores que en pares con más datos.

## Enlaces

- [Hugging Face: malinali-app/opus-mt-tw-fr](https://huggingface.co/malinali-app/opus-mt-tw-fr)
- [Hugging Face: Helsinki-NLP/opus-mt-tw-fr](https://huggingface.co/Helsinki-NLP/opus-mt-tw-fr)
- [Repositorio OPUS-MT en GitHub](https://github.com/Helsinki-NLP/Opus-MT)
- [Sitio web de Malinali](https://malinali.app)
