# sivelsguy/opus-mt-en-he-onnx

## Resumen

`opus-mt-en-he-onnx` es una exportación a ONNX con cuantización dinámica de 8 bits del modelo de traducción automática `Helsinki-NLP/opus-mt-en-he`, desarrollado originalmente por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce texto del inglés al hebreo y está empaquetado específicamente para ejecutarse en el navegador mediante transformers.js, incluyendo un `tokenizer.json` que permite la tokenización en cliente sin dependencias de Python.

La relevancia de esta ficha radica en su formato de despliegue: al ser un artefacto ONNX int8 de aproximadamente 0,1 GB, permite traducción inglés-hebreo completamente local en entornos web, sin llamadas a API externas ni infraestructura de servidor. Está pensado para aplicaciones de aprendizaje de idiomas y herramientas de traducción ligeras; de hecho, el autor indica que lo utiliza en la aplicación de código abierto para aprender hebreo *Parle*.

Arquitectura Marian encoder-decoder, licencia Apache-2.0 heredada del modelo base y soporte limitado a los pares inglés y hebreo. No se dispone de información sobre el número exacto de parámetros ni la longitud de contexto en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (ONNX) |
| Idiomas soportados | inglés (en), hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (cuantizado int8), tokenizer.json |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers.js |
| Modelo base | Helsinki-NLP/opus-mt-en-he |

## Arquitectura y entrenamiento

El modelo base es un Marian NMT, una arquitectura transformer encoder-decoder desarrollada por Microsoft Research y adoptada por el proyecto OPUS-MT de Helsinki-NLP para traducción automática neuronal. Marian emplea atención multi-cabeza estándar, normalización de capas y embeddings compartidos entre encoder, decoder y proyección de salida en muchas de sus variantes, lo que reduce el número de parámetros. El entrenamiento original de OPUS-MT se realizó sobre corpus paralelos del proyecto OPUS, aunque la información proporcionada no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o fine-tuning supervisado adicional.

La innovación de esta publicación concreta no está en el entrenamiento sino en el empaquetado: exportación a ONNX con cuantización dinámica int8, inclusión del tokenizador en formato JSON y compatibilidad con transformers.js para inferencia en navegador. No se dispone de información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia más allá de la cuantización.

## Capacidades

- Traducción automática de texto del inglés al hebreo.
- Ejecución en navegador mediante transformers.js con `dtype: "q8"`.
- Tokenización en cliente gracias al `tokenizer.json` incluido.
- Procesamiento frase a frase: el autor advierte que entradas por lotes con longitudes distintas pueden producir puntuación repetida al final.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada estrictamente al par en-he.

## Casos de uso

- Aplicaciones web de aprendizaje de hebreo: el modelo puede integrarse en un frontend JavaScript para traducir frases de ejercicios o material didáctico sin backend, como hace la app *Parle*.
- Traducción local en el navegador: útil en entornos con requisitos de privacidad donde el texto no debe salir del dispositivo, ya que la inferencia ocurre en cliente.
- Extensiones de navegador para lectura asistida: permite traducir selecciones de texto en inglés a hebreo al instante sin llamadas a API.
- Prototipado rápido de funcionalidades de traducción: al ser un artefacto de 0,1 GB y licencia Apache-2.0, es adecuado para validar flujos de traducción en aplicaciones web antes de invertir en infraestructura mayor.
- Herramientas educativas offline: puede empaquetarse en aplicaciones PWA o electrón para funcionar sin conexión en contextos de aula.
- Preprocesamiento ligero en pipelines de datos: traducción de campos cortos (títulos, etiquetas, descripciones) en flujos donde no se requiere calidad de traducción de nivel producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un artefacto ONNX int8 de 0,1 GB, la huella en memoria es mínima; cabe en cualquier dispositivo con unos pocos cientos de MB disponibles.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU y en el propio navegador mediante WebAssembly o WebGPU según el backend de transformers.js.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en dispositivos móviles.
- Opciones de despliegue: transformers.js (principal), ONNX Runtime Web, ONNX Runtime en servidor. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de pesos GGUF ni un LLM generativo.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del backend (WASM vs. WebGPU) y del hardware del cliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sivelsguy/opus-mt-en-he-onnx | no disponible | no disponible | en, he | Apache-2.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-en-he (base) | no disponible | no disponible | en, he | Apache-2.0 | safetensors / PyTorch |
| Otros modelos OPUS-MT en-he | no disponible | no disponible | en, he | Apache-2.0 | safetensors / PyTorch |

La diferencia principal frente al modelo base es el formato: la versión ONNX int8 está optimizada para inferencia en navegador, mientras que el modelo original requiere PyTorch o un runtime de servidor. No se dispone de datos de rendimiento comparativo entre ambas versiones en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo traduce de inglés a hebreo; no soporta la dirección inversa ni otros pares lingüísticos.
- El autor advierte que el procesamiento por lotes con longitudes distintas puede generar puntuación repetida; se recomienda traducir una frase por llamada.
- Riesgo de alucinación y errores de traducción inherentes a los modelos NMT de tamano moderado, especialmente en frases largas, terminología especializada o construcciones idiomáticas.
- No se documentan sesgos específicos, pero los modelos entrenados sobre corpus OPUS pueden reflejar sesgos de dominio y de género presentes en los datos paralelos.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los corpus OPUS subyacentes.
- No es un modelo generativo de propósito general: no soporta tool calling, agentes ni razonamiento multi-paso.
- El repositorio es reciente (creado en 2026 según los metadatos) y cuenta con muy pocas descargas (21) y ningún *like*, por lo que su validación comunitaria es escasa.

## Enlaces

- HuggingFace: https://huggingface.co/sivelsguy/opus-mt-en-he-onnx
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-he
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- transformers.js: https://github.com/huggingface/transformers.js
