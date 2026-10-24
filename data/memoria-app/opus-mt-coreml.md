# memoria-app/opus-mt-coreml

## Resumen

`memoria-app/opus-mt-coreml` es un paquete de conversiones a Core ML de cinco modelos de traducción automática de la familia OPUS-MT, desarrollados originalmente por Helsinki-NLP (grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki). No contiene entrenamiento nuevo: es una reempaquetadura de pesos ya existentes en el formato de Apple para permitir traducción completamente offline dentro de la aplicación iOS Memoria. Cubre el par de familias lingüísticas eslavo meridional (croata, serbio, bosnio, esloveno) frente a inglés, alemán, italiano, francés, español y portugués, en ambas direcciones para varios pares.

Cada uno de los cinco modelos se distribuye en dos variantes: `accurate/` con pesos de 16 bits, que reproduce casi exactamente el modelo original, y `compact/` con pesos de 8 bits, de aproximadamente la mitad de tamano y con posible pérdida ocasional de alguna palabra. La arquitectura subyacente es Marian NMT (transformer encoder-decoder con tokenizador SentencePiece), aunque el repositorio no publica el recuento de parámetros de cada variante. La entrada máxima declarada para la función `encode` es de 256 tokens.

Su relevancia es acotada pero clara: es una de las pocas distribuciones de traducción eslavo meridional listas para ejecutarse en el Neural Engine de Apple sin conexión y sin enviar datos fuera del dispositivo, bajo licencia CC-BY 4.0 que permite uso comercial con atribución. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validación comunitaria es prácticamente nula.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) convertido a Core ML; el paquete expone una función `encode` y una función `decode` separadas |
| Parámetros totales | No disponible (el autor no publica recuento; los originales son variantes `tc-big` y `tc-base` de OPUS-MT) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens de entrada en `encode` (longitud flexible de 1 a 256); `decode` genera un token por llamada |
| Tipos de cuantización | Pesos de 16 bits (`accurate/`) y de 8 bits (`compact/`) |
| Idiomas soportados | hr, sr, bs, sl, en, de, it, fr, es, pt, con las direcciones detalladas más abajo |
| Licencia | CC-BY 4.0 (el modelo `deu_eng_fra_por_spa-sla` figura también como Apache-2.0 en Hugging Face) |
| Formato de pesos | Paquete Core ML (`.mlpackage`), no safetensors ni GGUF; tokenizadores SentencePiece reexportados a un único `tokenizer.json` |
| Pipeline | translation |
| Librería | coreml |
| Tamano del repositorio | 3,1 GB (5 modelos × 2 variantes) |

Direcciones de traducción incluidas:

| Carpeta | Dirección | Modelo original |
|---|---|---|
| `zls-en/` | hr, sr, bs, sl → en | Helsinki-NLP/opus-mt-tc-big-zls-en (commit c52478f) |
| `en-sh/` | en → hr, sr, bs | Helsinki-NLP/opus-mt-tc-base-en-sh (commit 8a5d73f) |
| `zls-de/` | hr, sr, bs, sl → de | Helsinki-NLP/opus-mt-tc-big-zls-de (commit 43694cc) |
| `zls-itc/` | hr, sr, bs, sl → it, fr, es, pt | Helsinki-NLP/opus-mt-tc-big-zls-itc (commit 6f31f5b) |
| `deu_eng_fra_por_spa-sla/` | de, en, fr, pt, es → hr y otras lenguas eslavas | Helsinki-NLP/opus-mt-tc-bible-big-deu_eng_fra_por_spa-sla (commit 9b9fbdae) |

## Arquitectura y entrenamiento

Los modelos originales son Marian NMT, la implementación de traducción neuronal de código abierto de Helsinki-NLP: un transformer encoder-decoder con atención estándar y tokenización SentencePiece, entrenado sobre corpus paralelos del proyecto OPUS. Los cinco checkpoints proceden de dos familias de OPUS-MT: los `tc-big` (pares eslavo meridional → inglés, alemán y lenguas itálicas) y los `tc-base` (inglés → eslavo meridional), más un modelo entrenado sobre corpus bíblicos multilingües para la dirección inversa hacia lenguas eslavas. El autor del repositorio no aporta detalles sobre volumen de tokens, composición del dataset ni si hubo ajuste con RLHF o DPO; no hay ningún entrenamiento adicional en esta conversión.

Los cambios aplicados por Memoria son exclusivamente de empaquetado: conversión de pesos a Core ML en 16 y 8 bits, división del modelo en funciones `encode` y `decode` separadas, adición de una posición de padding sin uso en los buffers del decodificador para sortear una lectura fuera de límites de Core ML, y reexportación de los tokenizadores SentencePiece a un único `tokenizer.json`. No se reentrenó ningún peso. La decodificación es autorregresiva y se realiza llamada a llamada (un token por invocación de `decode`), sin decodificación especulativa ni técnicas de aceleración declaradas. Los modelos multiobjetivo requieren un token de lengua destino al inicio de la entrada (por ejemplo `>>hrv<<`).

## Capacidades

- Traducción automática de texto entre lenguas eslavas meridionales (croata, serbio, bosnio, esloveno) e inglés, alemán, italiano, francés, español y portugués, según la carpeta seleccionada.
- Traducción multilingüe de destino en un mismo modelo: `zls-itc/` cubre cuatro lenguas de salida y `deu_eng_fra_por_spa-sla/` cinco de entrada, seleccionables mediante token de lengua.
- Ejecución totalmente offline: nada se descarga en tiempo de ejecución y ningún dato sale del dispositivo.
- Inferencia en el Neural Engine, GPU o CPU de Apple a través de Core ML.
- Manejo de entradas de longitud variable entre 1 y 256 tokens.
- Dos perfiles de calidad/tamano intercambiables (16 bits y 8 bits).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking. Es exclusivamente un modelo de traducción.

## Casos de uso

- Traductor de viaje offline para los Balcanes: una app iOS puede traducir menús, carteles y conversaciones en croata, serbio, bosnio o esloveno a inglés, alemán, italiano, francés, español o portugués sin conexión, usando la variante `compact/` para reducir el peso descargado.
- Interpretación en entornos sanitarios o de emergencia con conectividad nula: atención a pacientes que hablan serbio, croata o bosnio en zonas rurales o durante despliegues humanitarios, traduciendo hacia inglés o alemán en el propio dispositivo y sin transmitir datos clínicos a un servidor.
- Localización de productos y documentación: traducción de cadenas de interfaz y textos de ayuda desde inglés hacia hr/sr/bs (carpeta `en-sh/`) como paso previo a la revisión humana en un pipeline de localización.
- Monitorización de prensa regional: traducción automática de medios croatas, serbias, bosnias y eslovenas hacia inglés (`zls-en/`) para paneles de seguimiento informativo o alertas, con la ventaja de que el contenido no abandona la infraestructura propia si se ejecuta en Mac.
- Tramitación de documentación multilingüe: traducción de formularios y escritos en alemán, inglés, francés, portugués o español hacia croata y otras lenguas eslavas (`deu_eng_fra_por_spa-sla/`) en flujos de ONG o servicios de extranjería, con revisión humana posterior obligatoria.
- Traducción de mensajería dentro de una app: integración en un cliente de chat para iOS que traduzca mensajes entrantes en serbio/croata/bosnio al inglés o al español en tiempo real, reutilizando la variante de 8 bits para mantener el tamano del binario bajo.
- Generación de corpus paralelos sintéticos: uso de la variante `accurate/` para producir pares de frases hr/sr/bs ↔ en destinados a aumentar datos de entrenamiento de otros sistemas, dado que el modelo es determinista y local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que cada carpeta incluye su propio README con "comparison results against the original model" y sumas de verificación SHA-256, pero los valores numéricos (por ejemplo BLEU o chrF frente a los originales de Helsinki-NLP) no se reproducen en la información proporcionada. No se deben asumir cifras de calidad para ningún par de lenguas sin consultar esos README individuales.

## Requisitos de hardware

- Diseñado exclusivamente para el ecosistema Apple: Neural Engine, GPU o CPU mediante Core ML. No hay soporte para CUDA ni ROCm.
- VRAM estimada: no disponible por modelo. Como referencia aritmética, el repositorio completo ocupa 3,1 GB para 10 paquetes (5 modelos × 2 variantes), lo que arroja una media de unos 310 MB por paquete; es una estimación derivada, no un dato publicado.
- La variante `compact/` de 8 bits ocupa aproximadamente la mitad que `accurate/` según el autor, por lo que es la opción adecuada cuando el tamano del binario o el consumo de memoria es crítico.
- Cabe en hardware de consumo: cualquier iPhone o iPad reciente con Neural Engine y cualquier Mac con chip Apple Silicon. En Macs Intel la ejecución recae en CPU/GPU y el rendimiento no está documentado.
- Opciones de despliegue: Core ML a través de `coremltools`, integración en Xcode (Swift/Objective-C) y ejecución en iOS, iPadOS, macOS, watchOS o visionOS. No es compatible con vLLM, TGI, llama.cpp ni Ollama, porque no se distribuyen pesos en safetensors ni GGUF.
- Latencia y throughput: no disponibles. La interfaz `decode` genera un token por llamada, de modo que cada paso de decodificación implica una invocación separada del runtime de Core ML; el coste real dependerá del chip y de si se ejecuta en ANE, GPU o CPU.

## Comparativa con modelos similares

| Modelo | Formato | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `memoria-app/opus-mt-coreml` (este) | Core ML (16 y 8 bits) | hr, sr, bs, sl ↔ en, de, it, fr, es, pt (por pares) | 256 tokens | CC-BY 4.0 | Solo Apple; offline; sin métricas publicadas en la ficha |
| `Helsinki-NLP/opus-mt-tc-big-zls-en` | PyTorch (Marian) | zls → en | No disponible en esta ficha | CC-BY 4.0 | Modelo original en FP32; requiere framework Python y no corre en dispositivo |
| `Helsinki-NLP/opus-mt-tc-base-en-sh` | PyTorch (Marian) | en → hr, sr, bs | No disponible en esta ficha | CC-BY 4.0 | Variante `base`, más ligera que las `big`; es el origen de `en-sh/` |
| `Helsinki-NLP/opus-mt-tc-bible-big-deu_eng_fra_por_spa-sla` | PyTorch (Marian) | de, en, fr, pt, es → eslavo | No disponible en esta ficha | CC-BY 4.0 / Apache-2.0 | Entrenado con corpus bíblicos; origen de la carpeta inversa |
| Alternativas multilingües de gran cobertura (NLLB-200, MADLAD-400) | safetensors / PyTorch | Cientos de lenguas | No disponible en esta ficha | Principalmente CC-BY-NC o Apache-2.0 según variante | No comparables en despliegue: no existen conversiones Core ML equivalentes en este repositorio |

No se dispone de datos de rendimiento comparativo (BLEU, chrF, COMET) en la información proporcionada, por lo que la comparación se limita a formato, cobertura lingüística, licencia y viabilidad de despliegue.

## Limitaciones y advertencias

- Ventana de entrada limitada a 256 tokens: no apta para documentos completos sin segmentación previa; no hay contexto a nivel de documento, por lo que la coherencia entre frases no está garantizada.
- Los modelos multiobjetivo exigen el token de lengua destino al inicio de la entrada; si se omite o es incorrecto, la salida puede quedar en una lengua distinta de la esperada.
- El autor advierte de que `zls-en/` a veces antecede la salida con una etiqueta de lengua espuria (por ejemplo `>>srp_Cyrl<<`), que debe eliminarse mediante un filtro de prefijo `>>…<<` en producción.
- La variante `compact/` de 8 bits puede omitir o alterar palabras respecto al original, según reconoce la propia model card; desaconsejada para contenido legal, médico o contractual sin revisión humana.
- No hay benchmarks publicados en la ficha ni métricas de calidad por par de lenguas; con 0 descargas y 1 like, la validación externa es prácticamente inexistente.
- Sesgos: no documentados. Al derivar de corpus OPUS, es esperable el sesgo de dominio y de género presente en los datos paralelos originales, pero el autor no aporta análisis alguno.
- Riesgo de alucinación y de traducción fluida pero incorrecta en frases ambiguas, idiomáticas o con terminología especializada; también es posible la omisión silenciosa de contenido.
- Licencia CC-BY 4.0: permite uso comercial, pero exige atribución a Helsinki-NLP y a los autores citados (Tiedemann y Thottingal 2020; Tiedemann et al. 2023). El modelo `deu_eng_fra_por_spa-sla` presenta doble etiquetado (Apache-2.0 en Hugging Face, CC-BY 4.0 en el archivo de publicación original); conviene conservar la atribución en ambos casos.
- Dependencia total del runtime de Core ML: no hay pesos en safetensors ni GGUF, de modo que migrar a servidores Linux con GPU requiere volver a los modelos originales de Helsinki-NLP.
- El repositorio se creó y actualizó el 24 de octubre de 2026 según los metadatos, sin historial de mantenimiento posterior registrado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/memoria-app/opus-mt-coreml
- Modelo original zls → en: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zls-en/tree/c52478f738ad47408224c8183984560ba0ebb3b0
- Modelo original en → sh: https://huggingface.co/Helsinki-NLP/opus-mt-tc-base-en-sh/tree/8a5d73fe1fbfa392a1d754f89fce0bfb8335d4ab
- Modelo original zls → de: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zls-de/tree/43694cc6fc800e036060ed98098fbbc9e22c69fb
- Modelo original zls → itc: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zls-itc/tree/6f31f5b0592a04ef5dad4efac79e57d6d5d511a3
- Modelo original deu_eng_fra_por_spa → sla: https://huggingface.co/Helsinki-NLP/opus-mt-tc-bible-big-deu_eng_fra_por_spa-sla/tree/9b9fbdae5e6ebc9bc9cc04397d5f46ed68989cdf
- Organización Helsinki-NLP en Hugging Face: https://huggingface.co/Helsinki-NLP
- Proyecto OPUS (corpus): https://opus.nlpl.eu/
- Licencia CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Referencia: Tiedemann, J. y Thottingal, S. (2020), "OPUS-MT: Building open translation services for the World", EAMT 2020.
- Referencia: Tiedemann, J. et al. (2023), "Democratizing neural machine translation with OPUS-MT", Language Resources and Evaluation.
- Nota: los resultados de la búsqueda web disponible no contienen enlaces relevantes a este modelo; devuelven páginas de un servicio funerario homónimo sin relación con el proyecto.
