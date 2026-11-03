# rugonzs/mobile-nlp-onnx

## Resumen

Mobile NLP ONNX es un paquete de conversiones a ONNX de modelos preentrenados de procesamiento del lenguaje natural, publicado por el usuario rugonzs en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribución empaquetada para despliegue en dispositivos móviles de dos familias de modelos: GLiNER2.5 multilingüe (reconocimiento de entidades nombradas zero-shot) y Stanza 1.15.0 (tokenización, etiquetado POS, morfología y análisis de dependencias). La versión publicada es `gliner25-stanza115-v1` y no incluye ningún modelo de lenguaje generativo.

El interés del paquete reside en su enfoque de despliegue: ofrece archivos ONNX optimizados para ONNX Runtime móvil, con cuantización del vocabulario del encoder GLiNER y salidas en UINT8 para maximizar la compatibilidad con runtimes móviles. El repositorio ocupa 3,3 GB y se distribuye mediante archivos ZIP separados por componente (un paquete GLiNER compartido de 516,4 MB y paquetes Stanza por idioma de entre 386 y 402 MB), de modo que el usuario descarga únicamente los idiomas que necesita.

Cubre siete idiomas (español, inglés, alemán, francés, italiano, neerlandés y portugués) y se publica bajo licencia Apache-2.0. Es relevante para desarrolladores que necesitan pipelines de NLP estructurado (NER y parsing) en dispositivos con recursos limitados sin depender de servicios en la nube, aunque requiere implementar el runtime, el tokenizador y la decodificación por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (GLiNER2.5) y modelos Stanza (tokenización, POS, morfología, dependencias, lemas); exportados a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el encoder GLiNER incluye cabezas de frontera para longitudes 64/128/256) |
| Tipos de cuantizacion | Cuantización de pesos de vocabulario en el encoder GLiNER; componentes FP32; salidas candidatas en UINT8 para compatibilidad con ONNX Runtime móvil |
| Idiomas soportados | es, en, de, fr, it, nl, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivos ZIP con manifiesto y hashes SHA-256; datos externos ONNX adyacentes) |

## Arquitectura y entrenamiento

El paquete no introduce entrenamiento nuevo: son conversiones a ONNX de modelos preexistentes. La parte GLiNER2.5 proviene del modelo multilingüe de Fastino (`fastino/gliner2.5-multi-v1`, revisión `cf5593a5d45e3bbf204b9df621b13b1c0cf25ee3`), un encoder transformer orientado a reconocimiento de entidades zero-shot. La parte Stanza proviene de Stanford NLP, runtime 1.15.0, con repositorios preentrenados por idioma (`stanfordnlp/stanza-{es,en,de,fr,it,nl,pt}`).

Las modificaciones aplicadas son exclusivamente de conversión y empaquetado: exportación a ONNX, empaquetado móvil, cuantización del vocabulario de GLiNER y casts de compatibilidad de salidas. No hay fine-tuning específico de tarea. Los paquetes Stanza incluyen tokenización, POS y morfología, parsing de dependencias, modelos de caracteres y componentes dependientes del idioma para lemas y palabras multipalabra (MWT). Los exports son fragmentos de runtime personalizados, no checkpoints intercambiables con `AutoModel` ni con `stanza.Pipeline`.

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot mediante GLiNER2.5 multilingüe.
- Tokenización para los siete idiomas soportados.
- Etiquetado POS y análisis morfológico mediante Stanza.
- Análisis de dependencias sintácticas.
- Lematización y tratamiento de palabras multipalabra (MWT) dependiente del idioma.
- Modelos de caracteres para el procesamiento de texto a nivel de carácter.
- Ejecución en ONNX Runtime móvil con salidas en UINT8 para las candidatas válidas.
- No incluye generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: no incorpora ningún LLM.

## Casos de uso

- Extracción de entidades en aplicaciones móviles offline: el paquete GLiNER permite identificar personas, organizaciones y lugares en texto libre sin conexión, descargando solo el paquete compartido de 516,4 MB.
- Preprocesado lingüístico en pipelines de búsqueda: la tokenización y el POS de Stanza alimentan índices o filtros morfológicos en el propio dispositivo, reduciendo la latencia frente a llamadas a servidores.
- Análisis sintáctico para corrección gramatical: el parsing de dependencias de Stanza permite construir árboles sintácticos que sirven de base a correctores o asistentes de redacción locales.
- Anonimización de datos sensibles: combinar NER de GLiNER con el pipeline Stanza para detectar y enmascarar entidades antes de enviar texto a servicios externos, cumpliendo requisitos de privacidad.
- Procesamiento multilingüe en dispositivos de borde: con paquetes Stanza por idioma de unos 400 MB, se puede desplegar un pipeline de análisis para español, inglés, alemán, francés, italiano, neerlandés y portugués según la demanda.
- Enriquecimiento de notas o documentos en apps de productividad: extracción de entidades y estructura gramatical para generar metadatos, resúmenes de entidades o etiquetas automáticas en aplicaciones de toma de notas.
- Investigación en NLP móvil: base reproducible con hashes SHA-256 y manifiestos para comparar el rendimiento de NER y parsing en distintos dispositivos y runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser modelos ONNX para móvil, el consumo depende del dispositivo, del runtime y de la presión de memoria; los paquetes individuales van de 386 a 516 MB.
- GPU recomendadas: no disponible. El destino declarado es ONNX Runtime móvil; no se especifican GPU de escritorio.
- Compatibilidad con GPU de consumo: no disponible; el empaquetado está orientado a ejecución en dispositivos móviles, no a aceleración en GPU de consumo.
- Opciones de despliegue: ONNX Runtime (incluida la variante móvil). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos fragmentos de runtime.
- Latencia y throughput estimados: no disponible; el autor indica que el rendimiento móvil depende del dispositivo, el runtime y la presión de memoria.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mobile NLP ONNX (este paquete) | NER zero-shot + pipeline Stanza, empaquetado ONNX | 7 (es, en, de, fr, it, nl, pt) | Apache-2.0 | ONNX (ZIP) | Fragmentos de runtime personalizados; requiere tokenizador y decodificación propios |
| Fastino GLiNER2.5 multi | NER zero-shot | Multilingüe | Apache-2.0 (según upstream) | Pesos originales | Fuente del componente GLiNER; no es un paquete móvil |
| Stanford Stanza 1.15.0 | Pipeline lingüístico (tokenización, POS, dependencias, lemas) | Múltiples | Apache-2.0 | Pesos originales | Fuente del componente Stanza; se usa mediante `stanza.Pipeline` |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los límites y tipos de entidad pueden ser incorrectos, y los análisis de dependencias pueden contener errores.
- Los activos no garantizan por sí mismos relaciones semánticas fiables, manejo de negación ni resolución de preguntas.
- El autor no formula ninguna afirmación universal de precisión para los siete idiomas.
- El rendimiento en móvil depende del dispositivo, el runtime y la presión de memoria.
- No son checkpoints intercambiables con `AutoModel` ni con `stanza.Pipeline`: requieren un tokenizador, una preparación de tensores y una implementación de decodificación compatibles.
- Se distribuyen activos de modelo, no un servicio de inferencia ni un SDK de runtime completo.
- En producción conviene fijar las descargas a un commit concreto del Hub en lugar de a `main` mutable, verificar el hash del archivo, extraer en un directorio temporal, validar contra `manifest.json` y activar el directorio de forma atómica, conservando los archivos de datos ONNX externos adyacentes.
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse los avisos de LICENSE y NOTICE de los repositorios upstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rugonzs/mobile-nlp-onnx
- Modelo fuente GLiNER2.5 multi: https://huggingface.co/fastino/gliner2.5-multi-v1
- Repositorio Stanza: https://github.com/stanfordnlp/stanza
