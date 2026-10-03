# malinali-app/opus-mt-ny-es

## Resumen

`malinali-app/opus-mt-ny-es` es un paquete de traduccion automatica neuronal para inferencia en dispositivo (on-device) que cubre la direccion chichewa (ny) a espanol (es). No es un modelo entrenado desde cero: se trata de un reempaquetado de los pesos del modelo `Helsinki-NLP/opus-mt-ny-es`, publicado por el proyecto Malinali (malinali.app) para su uso dentro de la aplicacion homonima. El autor declara explicitamente que no reclama la propiedad del modelo entrenado y que su aportacion se limita a la conversion de formato y a la preparacion de tokenizadores.

Tecnicamente es un modelo MarianMT, la arquitectura de traduccion secuencia a secuencia basada en transformer encoder-decoder que el grupo Helsinki-NLP (Language Technology Research Group) genero dentro del proyecto OPUS-MT. Con 75.862.931 parametros, es un modelo compacto orientado a traduccion de un solo par de idiomas, lo que lo hace adecuado para ejecucion local en movil o en hardware de gama baja.

Su relevancia actual es de nicho pero clara: la combinacion chichewa-espanol tiene muy pocos recursos publicos, y esta ficha ofrece una via de despliegue offline mediante safetensors y tokenizadores en formato fast JSON para el runtime Candle, en lugar de requerir SentencePiece nativo o servicios en la nube. El repositorio no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder secuencia a secuencia) |
| Parametros totales | 75.862.931 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | ny (chichewa), es (espanol) |
| Licencia | no disponible en HuggingFace; la model card remite a la del modelo original, tipicamente CC-BY 4.0 para OPUS-MT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MarianMT, un transformer encoder-decoder disenado especificamente para traduccion automatica. Es un modelo de tipo text2text-generation con tokenizadores separados para el idioma origen (ny) y el destino (es): el repositorio incluye `tokenizer-enc.json` y `tokenizer-dec.json`, derivados de la conversion de SentencePiece a formato fast tokenizer de Hugging Face.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO. El autor indica que su aportacion se limita al reempaquetado de los pesos ya entrenados por Helsinki-NLP y a la conversion del tokenizador; el entrenamiento original corresponde al proyecto OPUS-MT, cuyos detalles no se reproducen en la informacion proporcionada.

## Capacidades

- Traduccion de texto de chichewa (ny) a espanol (es), en una unica direccion.
- Generacion de texto secuencia a secuencia mediante el pipeline `translation` de transformers.
- Inferencia en dispositivo (on-device) a traves del runtime Candle, con el modulo `marian_flutter` del proyecto Malinali.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite su despliegue en la infraestructura de Inference Endpoints de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking mode).
- Cobertura multilingue limitada estrictamente al par ny-es; no hay evidencia de capacidades adicionales de idioma.

## Casos de uso

- Traduccion offline en aplicaciones moviles: al pesar unos 0.3 GB y tener 75,8 millones de parametros, el modelo puede integrarse directamente en una app Android o iOS mediante Candle, sin conexion a internet, para traducir texto chichewa a espanol en el propio dispositivo.
- Atencion ciudadana en zonas con poblacion chichewa: traduccion de avisos, formularios o mensajes administrativos al espanol para hablantes de chichewa, con procesamiento local que evita enviar datos sensibles a servidores externos.
- Herramientas de salud comunitaria: traduccion de instrucciones medicas o de triaje escritas en chichewa a espanol para personal sanitario que trabaja en regiones donde se habla este idioma.
- Preprocesado de corpus para investigacion: uso como traductor de referencia en la construccion o ampliacion de corpus paralelos ny-es, dado que existen muy pocos recursos publicos para este par.
- Integracion en pipelines de datos: al ser compatible con el pipeline `translation` de transformers y con endpoints, puede encadenarse en flujos automaticos de traduccion por lotes de documentos en chichewa.
- Asistentes de traduccion en entornos educativos: soporte a estudiantes o docentes que necesitan convertir material en chichewa a espanol sin depender de servicios de traduccion en la nube.
- Procesamiento en hardware modesto: con un modelo de este tamano, instituciones con recursos limitados pueden ejecutar traduccion ny-es en CPU o en GPU de gama baja, sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 300 MB solo para pesos, mas el overhead de activaciones del encoder-decoder.
- VRAM estimada en FP16: en torno a 150 MB de pesos; en INT8, en torno a 76 MB (si se realiza la cuantizacion, que no viene incluida en el repositorio).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con pocos GB de memoria.
- Puede ejecutarse en CPU sin GPU dedicada, dado su tamano reducido.
- Opciones de despliegue: runtime Candle (a traves de `marian_flutter`), pipeline `translation` de la libreria transformers, y endpoints compatibles de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-ny-es | 75.862.931 | ny, es | safetensors | no disponible (upstream tipicamente CC-BY 4.0) | HuggingFace |
| Helsinki-NLP/opus-mt-ny-es | no disponible en la informacion | ny, es | no disponible en la informacion | no disponible en la informacion | HuggingFace (modelo base) |
| Otros modelos OPUS-MT | no disponible en la informacion | multiples pares por modelo | no disponible en la informacion | tipicamente CC-BY 4.0 | HuggingFace |

No se dispone de datos suficientes en la informacion proporcionada para comparar parametros, contexto, rendimiento y licencia del resto de alternativas con rigor.

## Limitaciones y advertencias

- Modelo de traduccion unidireccional: solo traduce de chichewa a espanol; no soporta la direccion inversa ni otros pares de idiomas.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al heredar los datos de OPUS-MT, puede reflejar los sesgos presentes en los corpus paralelos utilizados por el proyecto original.
- Riesgo de alucinacion: como cualquier modelo seq2seq de traduccion, puede generar traducciones plausibles pero incorrectas cuando la entrada es ambigua, poco frecuente o fuera de dominio.
- Limitaciones de contexto: la longitud maxima de contexto no se especifica en la informacion disponible; debe consultarse el `config.json` del repositorio.
- Licencia: la informacion de HuggingFace indica "no disponible". La model card remite a la licencia del modelo original, que suele ser CC-BY 4.0 en OPUS-MT, pero se recomienda verificar la licencia upstream antes de cualquier uso comercial.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Fecha de creacion (2026-10-02): conviene comprobar si el repositorio se mantiene actualizado y si los archivos de tokenizador y pesos son consistentes con la version del modelo base.
- Para produccion: no se documentan pruebas de calidad, evaluacion humana ni benchmarks; su uso en entornos criticos requeriria una evaluacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-ny-es
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ny-es
- Proyecto OPUS-MT (repositorio): https://github.com/Helsinki-NLP/Opus-MT
- Sitio del proyecto Malinali: https://malinali.app
