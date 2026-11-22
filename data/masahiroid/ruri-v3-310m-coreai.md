# masahiroid/ruri-v3-310m-coreai

## Resumen

ruri-v3-310m-coreai es una conversion no oficial del modelo de embeddings de texto en japones cl-nagoya/ruri-v3-310m al runtime Core AI de Apple, el entorno de inferencia on-device para iOS y macOS 27 en adelante que sucede a Core ML. El autor de la conversion es masahiroid, mientras que el modelo original pertenece al equipo cl-nagoya de la Universidad de Nagoya. El modelo resuelve la necesidad de ejecutar busquedas semanticas y similitud de frases en japones directamente en dispositivos Apple, sin enviar datos a un servidor.

La relevancia de esta ficha reside en que se trata de una reimplementacion desde cero orientada al Neural Engine, con layout BC1S (Batch, Channel, 1, Sequence), proyecciones Conv2d y atencion explicita por cabeza, en lugar de un simple reempaquetado de pesos. El modelo base es ModernBERT-Ja con 25 capas y dimension oculta de 768, y la conversion se distribuye en precision float16 con tres longitudes de secuencia fijas: 128, 256 y 512 tokens.

El repositorio ocupa 1,9 GB y esta publicado bajo licencia Apache 2.0. Se trata de un modelo de embedding (pipeline sentence-similarity), no de un modelo generativo, por lo que su uso se centra en representaciones vectoriales L2-normalizadas para recuperacion, clasificacion y agrupamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-Ja (transformer encoder bidireccional con atencion alterna full/sliding-window), convertido a Core AI con layout BC1S |
| Parametros totales | 310M (segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | fija en 128, 256 o 512 tokens segun la variante empaquetada |
| Tipos de cuantizacion | float16 (unico formato publicado) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (Core AI), con implementacion `coreai-torch` en `ruri_ane.py` |
| Dimension del embedding | 768, L2-normalizado |
| Capas | 25 |
| Unidades de computo | GPU y Neural Engine (ambas validadas) |
| Tamano del repositorio | 1,9 GB |

## Arquitectura y entrenamiento

El modelo base cl-nagoya/ruri-v3-310m es un ModernBERT-Ja de 25 capas con tamano oculto de 768, entrenado por el equipo cl-nagoya de la Universidad de Nagoya para similitud de frases en japones. ModernBERT combina atencion completa con atencion de ventana deslizante en capas alternas; la model card de la conversion menciona un theta de RoPE especifico por variante y una ventana bidireccional de radio 65. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La conversion a Core AI se reescribio desde cero para el Neural Engine: layout BC1S, proyecciones implementadas como Conv2d y atencion explicita por cabeza. Se empaquetan tres variantes de secuencia fija (128, 256 y 512 tokens) en float16, con una implementacion Python (`ruri_ane.py`) que permite seleccionar el tamano mediante la variable `ANE_MODEL_NAME`. La model card advierte de un problema conocido con el dtype de pesos en fp32. El modelo emplea un esquema de prefijos "1+3": cadena vacia para similitud general, `トピック: ` para clasificacion y agrupamiento, `検索クエリ: ` para el lado de consulta en recuperacion y `検索文書: ` para el lado de documento.

## Capacidades

- Generacion de embeddings de frases de 768 dimensiones, L2-normalizados, para similitud semantica.
- Extraccion de caracteristicas (feature-extraction) a partir de texto tokenizado.
- Recuperacion de informacion mediante el esquema de prefijos consulta/documento.
- Clasificacion y agrupamiento de textos con el prefijo de topico.
- Soporte bilingue japones e ingles.
- Ejecucion on-device en Neural Engine y GPU de Apple mediante Core AI.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito: es un encoder de embeddings, no un modelo generativo.
- Longitud de entrada fija por variante (128, 256 o 512 tokens), sin contexto dinamico.

## Casos de uso

- Busqueda semantica local en aplicaciones iOS y macOS: indexar documentos japoneses con el prefijo `検索文書: ` y consultas con `検索クエリ: `, calculando similitud coseno entre embeddings de 768 dimensiones sin salir del dispositivo.
- Clasificacion y agrupamiento de tickets o resenas en japones: generar embeddings con el prefijo `トピック: ` y aplicar clustering o un clasificador ligero sobre los vectores resultantes, aprovechando que la inferencia ocurre en el Neural Engine.
- Deduplicacion de contenidos: comparar embeddings de parrafos para detectar articulos o mensajes duplicados o casi duplicados en una base de datos local.
- Recomendacion de contenidos: calcular la similitud entre el embedding de un articulo leido y el resto del catalogo para sugerir lecturas relacionadas, con latencia baja al ejecutarse on-device.
- Asistentes de notas y conocimiento personal: indexar notas y documentos del usuario y ofrecer busqueda por significado en japones e ingles dentro de una app de productividad.
- Filtrado previo en pipelines RAG: usar el modelo como recuperador denso en el dispositivo antes de invocar un LLM, reduciendo el trafico de red y preservando la privacidad de los textos consultados.
- Deteccion de similitud en moderacion o control de calidad: comparar mensajes entrantes con patrones conocidos mediante similitud coseno para marcar casos que requieran revision.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, JMTEB u otros). El unico dato de rendimiento disponible es la fidelidad numerica frente a la referencia PyTorch en fp32, medida como similitud coseno sobre una frase japonesa real con padding:

| Objetivo | seq128 | seq256 | seq512 |
|---|---|---|---|
| Especializacion GPU | 1,0001693 | 1,0002791 | 1,0002584 |
| Especializacion Neural Engine | 1,0005926 | 1,0005926 | 1,0007246 |

No se han publicado resultados de benchmarks de calidad (por ejemplo, tareas de recuperacion o clasificacion) en la informacion disponible.

## Requisitos de hardware

- Entorno de ejecucion: Core AI en iOS y macOS 27 o superior; requiere el paquete `coreai-core==1.0.0b3` para la API Python.
- Unidades de computo validadas: GPU y Neural Engine de Apple; no se documenta soporte de CPU ni de hardware no Apple.
- VRAM o memoria unificada: no disponible de forma explicita; el repositorio ocupa 1,9 GB y el modelo en float16 con 310M parametros requiere del orden de 0,6 GB solo para pesos, mas las activaciones de la secuencia fija.
- GPU recomendadas: no aplica a GPU de escritorio; el destino son los chips Apple con Neural Engine.
- Cabe en hardware de consumo: si, en dispositivos Apple compatibles con Core AI; no se especifican modelos concretos de iPhone, iPad o Mac.
- Opciones de despliegue: runtime `coreai.runtime` con `AIModel.load` y `SpecializationOptions`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| ruri-v3-310m-coreai | 310M | 128 / 256 / 512 tokens fijos | ja, en | Apache 2.0 | `.aimodel` (Core AI) |
| cl-nagoya/ruri-v3-310m | 310M | no disponible en la informacion proporcionada | ja, en | Apache 2.0 | safetensors (PyTorch/Transformers) |
| masahiroid/ruri-v3-130m-coreai | 130M | 128 / 256 / 512 tokens fijos (misma familia de conversion) | ja, en | Apache 2.0 | `.aimodel` (Core AI) |

La comparativa se limita a la familia Ruri y a su conversion hermana de 130M, que comparte enfoque tecnico y documenta los detalles de arquitectura. No se dispone de datos de benchmarks comparativos con otros modelos de embeddings japoneses en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion no oficial: no cuenta con el respaldo del equipo Ruri / cl-nagoya; los autores originales no validan esta distribucion.
- Modelo exclusivamente de embeddings: no genera texto ni soporta tool calling, agentes, vision o audio.
- Longitud de entrada fija: hay que seleccionar la variante (128, 256 o 512) y ajustar `max_length` en la tokenizacion; no hay contexto dinamico.
- El uso correcto depende del esquema de prefijos "1+3"; omitirlos degrada la calidad de la similitud y de la recuperacion.
- Solo se distribuye en float16; no hay variantes cuantizadas a int8 o int4 en la informacion disponible.
- Dependencia de plataforma: requiere Core AI en iOS/macOS 27 o superior y hardware Apple con Neural Engine o GPU compatible.
- Riesgo de sesgos y alucinacion: no se documentan evaluaciones de sesgo; al ser un encoder, el riesgo de alucinacion se traslada a los sistemas que consumen los embeddings (por ejemplo, recuperacion de documentos irrelevantes).
- Cobertura limitada a japones e ingles; el rendimiento en otros idiomas no esta documentado.
- Licencia Apache 2.0: permite uso comercial, pero al ser una conversion conviene conservar los avisos de atribucion del modelo base.
- El repositorio incluye una auditoria de seguridad con model-audit-lite y un ML-BOM; se recomienda revisar `SECURITY.md` antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/ruri-v3-310m-coreai
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-310m
- Conversion hermana de 130M: https://huggingface.co/masahiroid/ruri-v3-130m-coreai
- Demo Ruri Atlas: https://huggingface.co/spaces/masahiroid/ruri-atlas
- Documentacion de Core AI: https://developer.apple.com/documentation/coreai
- Herramienta de auditoria: https://github.com/masahiroid/model-audit-lite
