# malinali-app/traduction-en-wolof

## Resumen

El modelo `malinali-app/traduction-en-wolof` es un ajuste fino de traducción automática dedicado exclusivamente a la dirección inglés → wolof. Lo publica el equipo de Malinali (malinali.app), una aplicación de traducción orientada a dispositivos, y consiste en una reempaquetado de pesos MarianMT en formato safetensors acompañados de tokenizadores rápidos compatibles con Candle. El resultado es un artefacto ligero (0,3 GB de repositorio, 77.026.926 parámetros) pensado para inferencia local sin conexión.

Técnicamente se apoya en la arquitectura MarianMT, un transformer encoder-decoder de tipo text2text-generation, y deriva del modelo multilingüe `Helsinki-NLP/opus-mt-en-mul`, del que hereda el vocabulario compartido (64.110 entradas, pad id 64109). El ajuste fino upstream corresponde a `LocaleNLP/eng_wolof`, bajo licencia MIT; Malinali únicamente redistribuye los pesos raíz y convierte los modelos SentencePiece a tokenizadores rápidos en JSON. No se reclama autoría sobre el modelo entrenado.

Su relevancia es doble. Por un lado, cubre un par de lenguas con muy pocos recursos como es el wolof, con un BLEU autodeclarado de 76,12 sobre un conjunto propio de 84.000 ejemplos, una cifra alta que debe interpretarse con cautela porque no ha sido verificada de forma independiente ni calculada con SacreBLEU. Por otro, su tamano reducido lo hace apto para despliegue en movil y en hardware de gama baja, lo que encaja con escenarios de conectividad limitada. El repositorio, creado en octubre de 2026, no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder, text2text-generation) |
| Parametros totales | 77.026.926 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (MarianMT estándar suele limitarse a 512 tokens de entrada) |
| Tipos de cuantizacion | No se publican variantes cuantizadas; los pesos se distribuyen en F32 (safetensors, ~308 MB) |
| Idiomas soportados | Inglés (en) como origen y wolof (wo) como destino; ajuste dedicado y unidireccional |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + tokenizadores rápidos en JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) |
| Vocabulario | 64.110 entradas (heredado de opus-mt-en-mul), pad id 64109, prefijo `>>wol<<` con id 1136 |
| Modelo base | Helsinki-NLP/opus-mt-en-mul |
| Ajuste fino upstream | LocaleNLP/eng_wolof (MIT) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es MarianMT, un transformer secuencial estándar con encoder y decoder, optimizado originalmente para traducción automática neuronal a gran escala dentro del ecosistema OPUS-MT. No incorpora innovaciones como atención lineal, mezcla de expertos ni decodificación especulativa; su virtud es la eficiencia computacional y un rendimiento sólido en tareas de traducción con recursos limitados. El vocabulario procede del modelo multilingüe `opus-mt-en-mul`, que emplea un tokenizador SentencePiece compartido entre lenguas, convertido aquí a formato JSON de Hugging Face para su uso con tokenizadores rápidos y con la implementación en Candle (`marian_flutter`).

Sobre los datos de entrenamiento, la model card indica que el ajuste fino upstream se realizó sobre un conjunto propio inglés-wolof de aproximadamente 84.000 ejemplos y que reportó un BLEU de 76,12. No se detalla la composición del corpus, el número total de tokens vistos, el dominio de los textos ni si hubo fases de ajuste por preferencias humanas (RLHF o DPO). Tampoco se documentan hiperparámetros, esquema de decodificación ni proceso de validación, por lo que la trazabilidad del entrenamiento es parcial. Malinali declara explícitamente que no reclama la propiedad del modelo entrenado y que su aportación se limita al reempaquetado y a la conversión de tokenizadores.

Un detalle operativo crítico: el modelo es un ajuste dedicado en→wo y no un modelo multilingüe funcional. Es obligatorio anteponer el prefijo `>>wol<< ` (id 1136) al texto de origen; Malinali lo configura como `sourcePrefix` en su catálogo. Además, `tokenizer_config.json` sigue declarando `target_lang: mul`, una etiqueta que no debe tomarse como fiable: la selección de wolof se fuerza mediante el prefijo.

## Capacidades

- Traducción automática unidireccional inglés → wolof, con el prefijo obligatorio `>>wol<< ` en el texto de entrada.
- Generación de texto condicionada a la tarea de traducción; no es un modelo generativo de propósito general.
- Procesamiento por lotes de múltiples segmentos, adecuado para traducir corpus completos.
- Inferencia local en dispositivo mediante safetensors y tokenizadores rápidos, con soporte declarado para Candle a través de `marian_flutter`.
- Integración con la librería `transformers` (pipeline `translation`).
- Multilingüismo: no. Aunque el vocabulario procede de un modelo multilingüe, no hay garantía de comportamiento correcto en otros pares de lenguas distintos de en→wo.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multimodales (visión, audio) o modo de razonamiento explícito: no soportadas.
- Control de estilo o creatividad: el modelo no está diseñado para muestreo creativo; se espera decodificación determinista (greedy o beam search).

## Casos de uso

- Traducción integrada en la aplicación Malinali: es el escenario previsto por el autor. El modelo se empaqueta como paquete on-device para traducir texto en el dispositivo del usuario sin conexión a internet, algo crítico en regiones donde el wolof es mayoritario y la conectividad es intermitente.
- Traducción de materiales educativos del inglés al wolof: colegios y organizaciones pueden traducir por lotes apuntes, guías docentes o textos de alfabetización aprovechando el procesamiento en batch y el tamano reducido del modelo, que permite incluso ejecutarlo en un portátil sin GPU.
- Localización de interfaces de aplicaciones móviles: con 77 millones de parámetros y ~308 MB de pesos, el modelo puede embeberse en una app Android o iOS vía Candle para traducir cadenas de interfaz, mensajes de error o notificaciones de forma instantánea y sin coste de API.
- Traducción de documentación para ONG y proyectos de cooperación: comunicados sanitarios, instrucciones agrícolas o materiales de formación pueden traducirse en local antes de su distribución, evitando dependencias de servicios en la nube y posibles problemas de confidencialidad.
- Atención al cliente y mensajería en comercio local: un comercio senegalés que recibe consultas en inglés puede traducirlas al wolof en el propio dispositivo, manteniendo la conversación en su idioma sin necesidad de personal bilingüe permanente.
- Generación de datos sintéticos para investigación en lenguas de bajos recursos: el modelo sirve como herramienta de traducción inversa aproximada o de anotación previa en la construcción de corpus paralelos en→wo para entrenar modelos mayores; su licencia MIT facilita la reutilización.
- Traducción de campo en dispositivos sin red eléctrica estable: al no requerir GPU ni acelerador dedicado, puede desplegarse en Raspberry Pi o portátiles de gama baja en escenarios de trabajo de campo.
- Preprocesado de textos administrativos o médicos: traducción de formularios y prospectos de circulación frecuente en inglés hacia el wolof, siempre con revisión humana posterior por las limitaciones de calidad fuera del dominio de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (model-index). El propio autor indica que no se trata de una puntuación OPUS ni SacreBLEU calculada por Malinali.

| Dataset | Tamano | Tarea | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| English-Wolof Custom Dataset | 84k | Translation (en→wo) | BLEU | 76,12 | No |

En la ficha de Malinali esta cifra se muestra como BLEU 76,1 / 100. No se han publicado en la información disponible otros resultados de benchmarks ni comparaciones con líneas base independientes.

## Requisitos de hardware

- Pesos en F32: aproximadamente 308 MB en disco y en memoria, coherente con los 77 millones de parámetros.
- VRAM estimada para inferencia: en torno a 1 GB en F32 incluyendo buffers del runtime; unos 154 MB en FP16 y unos 77 MB en INT8, aunque no se distribuyen variantes cuantizadas oficiales.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1050, GTX 1650, RTX 3050, RTX 4090 o incluso iGPU. No requiere A100 ni H100, y desplegarlo en ellas no aportaría ventaja práctica más allá del throughput por lotes.
- Funciona en CPU x86 moderna, en Raspberry Pi y en dispositivos móviles gracias al empaquetado para Candle. Es, por diseno, un modelo on-device.
- Opciones de despliegue documentadas: `transformers` (pipeline `translation`) y Candle mediante `marian_flutter`. La model card no menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime, por lo que debe considerarse no documentada en la información disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por segmento en ninguna configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Direccion | Idiomas | BLEU en→wo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| malinali-app/traduction-en-wolof | 77.026.926 | en → wo | 2 | 76,12 (autodeclarado, no verificado) | MIT | Hugging Face, on-device vía Candle |
| Helsinki-NLP/opus-mt-en-mul | No disponible en la información proporcionada (mismo tamano base) | en → multilingüe | Múltiples | No disponible | No disponible en la información proporcionada | Hugging Face y ecosistema OPUS-MT |
| LocaleNLP/eng_wolof | No disponible | en → wo | 2 | No disponible (es el origen del ajuste fino) | MIT | Hugging Face |
| NLLB-200-distilled-600M | ~600 M (dato público del modelo, no verificado en esta búsqueda) | Multilingüe bidireccional | ~200 lenguas, incluido wolof (`wol_Latn`) | No disponible | CC-BY-NC-4.0 (uso no comercial; no verificado en esta búsqueda) | Hugging Face, ecosistema transformers |

El modelo aquí descrito es el más ligero de la comparativa y el único con licencia MIT que permite uso comercial sin restricciones entre las alternativas citadas. Frente a NLLB, pierde cobertura multilingüe y bidireccionalidad, pero gana en huella de memoria y en facilidad de despliegue local. No hay datos de benchmarks comparativos directos en la información proporcionada para establecer qué modelo traduce mejor el par en→wo.

## Limitaciones y advertencias

- La puntuación de BLEU 76,12 es autodeclarada por el autor upstream, no verificada de forma independiente y no calculada con SacreBLEU. Un valor tan alto en una lengua de bajos recursos debe tratarse con escepticismo y validarse con un conjunto de evaluación propio.
- El modelo exige el prefijo `>>wol<< ` (id 1136) en el texto de origen. Sin ese prefijo el comportamiento de la traducción no está garantizado y puede degradarse o producir salidas incorrectas.
- `tokenizer_config.json` declara `target_lang: mul`, una etiqueta obsoleta y engañosa. No debe usarse para inferir el idioma de destino.
- Dirección única en→wo: no traduce de wolof a inglés ni soporta otros pares, a pesar de que el vocabulario provenga de un modelo multilingüe.
- Corpus de ajuste de 84.000 ejemplos de composición y dominio desconocidos. Es probable un sesgo hacia el registro y las temáticas presentes en ese conjunto, con degradación en textos técnicos, jurídicos, médicos o literarios.
- El wolof tiene variación ortográfica y dialectal relevante, además de un uso intensivo de préstamos del francés. El modelo puede fallar en variedades no representadas o traducir de forma inconsistente estos préstamos.
- Riesgo de alucinación y de omisiones en segmentos largos o ambiguos: al ser un modelo de traducción, no genera contenido nuevo, pero puede producir salidas fluidas que no reflejen fielmente el original, especialmente fuera del dominio de entrenamiento.
- Longitud de contexto limitada (MarianMT estándar ronda los 512 tokens de entrada, dato no confirmado en la model card). Los documentos largos requieren segmentación previa.
- Sin soporte de tool calling, agentes, razonamiento multi-paso ni multimodalidad. No debe emplearse como sustituto de un modelo de propósito general.
- La licencia MIT permite uso comercial, pero el autor indica que Malinali no posee los derechos sobre el modelo entrenado y remite a `LocaleNLP/eng_wolof` y a `Helsinki-NLP/opus-mt-en-mul`. Conviene revisar y conservar las atribuciones upstream en cualquier redistribución.
- Repositorio sin descargas ni valoraciones, sin historial de uso en producción y sin validación por parte de la comunidad. No hay evidencia pública de robustez más allá de lo declarado por el autor.
- No se documentan tasas de error, comportamiento en entradas vacías o muy cortas, ni métricas de calidad por segmento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/traduction-en-wolof
- Aplicación Malinali: https://malinali.app
- Ajuste fino upstream: https://huggingface.co/LocaleNLP/eng_wolof
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-mul
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo; los enlaces recuperados correspondían a servicios de reservas de viajes y no guardan relación con esta ficha. No se han localizado papers, blogs tecnicos ni demos adicionales.
