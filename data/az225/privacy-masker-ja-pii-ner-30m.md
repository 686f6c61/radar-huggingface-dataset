# az225/privacy-masker-ja-pii-ner-30m

## Resumen

El modelo `az225/privacy-masker-ja-pii-ner-30m` es un detector de información personal identificable (PII) en japonés con arquitectura NER (reconocimiento de entidades nombradas) a nivel de carácter. Lo desarrolla el autor az225 como componente de inferencia de la librería `privacy-masker`, una herramienta de código abierto (MIT) escrita en Python para detectar, enmascarar y anonimizar datos personales en texto japonés. El problema que resuelve es concreto: localizar de forma automática nombres de persona, organizaciones, ubicaciones, instalaciones y direcciones dentro de texto libre antes de que ese texto se envíe a un LLM o se almacene.

Técnicamente es un encoder `ModernBERT` de 10 capas y dimensión oculta 256 (el modelo base `cl-nagoya/ruri-v3-30m`) sometido a un ajuste fino completo, al que se añade una cabecera de carácter pequeña (87.947 parámetros) que expande los estados ocultos de subpalabra hasta caracteres individuales para emitir etiquetas BIO. El total asciende a 36.705.536 parámetros, un tamaño que permite ejecutarlo en CPU sin dificultad.

Su relevancia actual radica en que aborda la de-identificación de texto japonés, un idioma con segmentación morfológica compleja donde los enfoques basados en palabras fallan con frecuencia, y lo hace con un modelo de 0,1 GB que encaja en cualquier equipo local. A diferencia de los clasificadores de tokens convencionales, no funciona con `pipeline("token-classification")` de `transformers`, sino a través de la abstracción `CharHeadNerDetector` de la librería `privacy-masker`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) con cabecera de clasificación a nivel de carácter |
| Parametros totales | 36.705.536 (encoder más 87.947 de la cabecera de carácter) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens de entrada; procesa fragmentos de 400 caracteres con solapamiento de 50 |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors en fp32) |
| Idiomas soportados | japones (ja) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` para el encoder, `char_head.safetensors` para la cabecera) |

## Arquitectura y entrenamiento

La base es `cl-nagoya/ruri-v3-30m`, un encoder ModernBERT de 10 capas con dimensión oculta 256 y licencia Apache-2.0 (commit `24899e5de370b56d179604a007c0d727bf144504`), que a su vez deriva de `sbintuitions/modernbert-ja-30m` (MIT). Sobre ese encoder se aplica un ajuste fino de todas las capas y se añade una cabecera de carácter denominada `char_head`: toma los estados ocultos a nivel de subpalabra, los expande a caracteres, les concatena características de embedding de carácter, tipo de carácter y posición dentro del token, y produce una etiqueta BIO por carácter. Las etiquetas cubren cinco tipos de entidad (PERSON, ORG, LOCATION, FACILITY y ADDRESS) sobre un total de 11 etiquetas BIO. Los pesos publicados son la media simple de varias épocas de una misma ejecución de entrenamiento.

El corpus de entrenamiento combina cuatro fuentes: el dataset de entidades nombradas derivado de Wikipedia `stockmark/ner-wikipedia-dataset` (CC BY-SA 3.0), los splits de entrenamiento y desarrollo de `UD Japanese GSD` (CC BY-SA 4.0), documentos sintéticos generados con plantillas escritas por un LLM (`Qwen/Qwen3.8-27B-FP8`, Apache-2.0) en las que se insertaron nombres de `nvidia/Nemotron-Personas-Japan` (CC BY 4.0) y datos de códigos postales de Japan Post, y ejemplos negativos sin PII. Los documentos y las formas superficiales usados en evaluación se excluyeron del conjunto de entrenamiento. Los datos de entrenamiento no se distribuyen.

## Capacidades

- Detección de PII a nivel de carácter en texto japonés, con spans exactos que no dependen de la segmentación en palabras.
- Cinco tipos de entidad: PERSON (nombre de persona), ORG (organización), LOCATION (topónimo sin número de bloque), FACILITY (instalación) y ADDRESS (dirección con número de bloque).
- Distinción explícita entre ADDRESS (con número) y LOCATION (sin número).
- Exclusión de tratamientos y cargos fuera del span detectado.
- Integración en un motor de anonimización (`PrivacyEngine`) que combina este detector NER con un detector por expresiones regulares (`RegexDetector.default_ja()` para teléfonos, correos y otros) y un detector de nombres de usuario (`HandleDetector`).
- Salida sustituible por tokens del tipo `<PERSON_001>`, `<ORG_001>`, mediante las políticas predefinidas de la librería (`Policy.preset("llm_input")`).
- Modo solo-detección mediante `engine.detect(text)` para obtener los spans sin transformar el texto.
- No cubre teléfonos, correos, códigos postales ni fechas: esos se delegan a los detectores por expresiones regulares de la librería.
- No dispone de tool calling, function calling, agentes ni capacidades multilingües; es exclusivamente japonés.

## Casos de uso

- Preprocesado antes de enviar texto a un LLM: el motor enmascara nombres, organizaciones y direcciones y sustituye cada entidad por un token tipado, de forma que el prompt que sale del dispositivo no contiene PII en claro.
- Anonimización de registros internos: procesar historiales de atención al cliente, correos o tickets para eliminar datos personales antes de archivarlos o analizarlos.
- Cumplimiento de políticas de privacidad en pipelines ETL: se inserta como paso de enmascarado dentro de un flujo de ingestión de documentos japoneses, con la ventaja de que el modelo cabe en CPU y no requiere GPU.
- Construcción de conjuntos de datos para publicación: al detectar personas, organizaciones y direcciones con spans a nivel de carácter, permite sustituir sistemáticamente esas entidades y publicar el corpus resultante.
- Protección de datos en entornos clínicos o legales: al ejecutarse localmente, los textos sin filtrar no salen del equipo, lo que reduce la exposición de información sensible frente a servicios en la nube.
- Enmascarado de datos de contacto parciales: combinado con el `RegexDetector.default_ja()` de la librería, cubre en una sola pasada nombres, organizaciones, direcciones, teléfonos y correos.
- Verificación de cumplimiento en revisiones manuales: usar `engine.detect(text)` para generar candidatos y que un revisor humano confirme o descarte cada span antes del tratamiento definitivo.
- Integración en sistemas de registro o chat en japonés: detección en tiempo real sobre cada mensaje entrante para evitar que la PII se persista en bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al README de la librería `privacy-masker` para los procedimientos de evaluación y las cifras orientativas de precisión, pero no incluye tablas numéricas en el repositorio del modelo.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra explícita. Los pesos en fp32 ocupan aproximadamente 147 MB (`model.safetensors` 146.828.152 bytes más `char_head.safetensors` 353.028 bytes), por lo que la inferencia cabe holgadamente en memoria de sistema.
- GPU recomendadas: cualquier GPU consumer es suficiente (por ejemplo, GTX 1050 Ti, RTX 3060, RTX 4090); el modelo no necesita aceleradores de datacenter como A100 o H100.
- Inferencia en CPU: totalmente viable por el tamaño (36,7 M de parámetros) y por la ventana de 512 tokens.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos unos cientos de megabytes de memoria libre.
- Opciones de despliegue: la vía soportada es la librería `privacy-masker` (`pip install 'privacy-masker[transformers]'`), que carga el encoder y la cabecera de carácter. No se soporta `pipeline("token-classification")` ni `AutoModelForTokenClassification` de `transformers` (con `AutoModel` solo se puede leer el encoder). No se documentan despliegues con vLLM, llama.cpp, Ollama o TGI, y no existen pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| az225/privacy-masker-ja-pii-ner-30m | ModernBERT + cabecera de carácter (NER char-level) | PERSON, ORG, LOCATION, FACILITY, ADDRESS | Japones | apache-2.0 | 36,7 M de parametros, integrado en la libreria privacy-masker |
| divergentlabs/masker | Clasificador de tokens para PII | Nombres, direcciones, edades, fechas | 23 idiomas europeos | no disponible en la informacion proporcionada | No cubre japones; orientado a PII contextual europea |
| openai/privacy-filter | Checkpoint autorregresivo con cabecera de clasificacion de tokens sobre etiquetas de privacidad | Etiquetas de privacidad (detalle no disponible) | no disponible | no disponible en la informacion proporcionada | Se posiciona como capa de preprocesado local; una fuente secundaria menciona un 96% de F1, dato no confirmado en la informacion disponible |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparados mas alla de lo indicado, por lo que la comparacion cuantitativa directa no es posible con la informacion disponible.

## Limitaciones y advertencias

- Puede producir falsos negativos (deteccion incompleta) y falsos positivos (sobredeteccion). La propia model card exige revision humana y evaluacion previa en los documentos propios antes de desplegarlo.
- No garantiza el cumplimiento de la Ley de Proteccion de Informacion Personal japonesa ni de ninguna otra normativa; el cumplimiento legal es un proceso organizativo, no una propiedad del modelo.
- Uso no previsto para identificar o rastrear personas.
- Cubre unicamente japones: no procesa otros idiomas ni texto mixto de forma fiable.
- No gestiona telefono, correo electronico, codigo postal ni fechas; esas categorias dependen de los detectores por expresiones regulares de la libreria.
- Los tratamientos y cargos quedan fuera de los spans detectados; la incorporacion o eliminacion de estos la realiza el componente Refiner de la libreria, no el modelo.
- No es compatible con la API estandar de `transformers` para clasificacion de tokens; usarlo fuera de `privacy-masker` requiere gestionar manualmente el encoder y la cabecera de caracter.
- Si alguna parte del texto de entrada no queda cubierta o la salida contiene valores no finitos, la libreria lanza una excepcion en lugar de devolver un resultado vacio, lo que exige gestion de errores en produccion.
- No hay versiones cuantizadas publicadas, lo que limita la optimizacion de latencia sin trabajo adicional de conversion.
- El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe aun validacion comunitaria amplia.
- Las licencias de los datos de entrenamiento (CC BY-SA 3.0, CC BY-SA 4.0, CC BY 4.0) imponen obligaciones de atribucion; los pesos y la configuracion del repositorio se publican bajo apache-2.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/az225/privacy-masker-ja-pii-ner-30m
- Libreria privacy-masker (GitHub): https://github.com/NishidaAzuharu/privacy-masker
- Modelo base cl-nagoya/ruri-v3-30m: https://huggingface.co/cl-nagoya/ruri-v3-30m
- Dataset stockmark/ner-wikipedia-dataset: https://huggingface.co/datasets/stockmark/ner-wikipedia-dataset
- Dataset nvidia/Nemotron-Personas-Japan: https://huggingface.co/datasets/nvidia/Nemotron-Personas-Japan
- Corpus UD Japanese GSD: https://github.com/megagonlabs/UD_Japanese-GSD
- Modelo de generacion de plantillas Qwen/Qwen3.8-27B-FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- openai/privacy-filter (GitHub): https://github.com/openai/privacy-filter
- openai/privacy-filter (HuggingFace): https://huggingface.co/openai/privacy-filter
- Anuncio de OpenAI Privacy Filter: https://openai.com/index/introducing-openai-privacy-filter/
- divergentlabs/masker: https://huggingface.co/divergentlabs/masker
- Articulo sobre OpenAI Privacy Filter (menciona 96% F1): https://awesomeagents.ai/news/openai-privacy-filter-on-device-pii/
