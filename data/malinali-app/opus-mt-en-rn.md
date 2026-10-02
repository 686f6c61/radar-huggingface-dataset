# malinali-app/opus-mt-en-rn

## Resumen

`malinali-app/opus-mt-en-rn` es un paquete de traduccion automatica ingles → kirundi (rundi, codigo ISO `rn`) publicado por el desarrollador malinali-app. No se trata de un modelo entrenado desde cero: es un reempaquetado de los pesos de `Helsinki-NLP/opus-mt-en-rn`, el modelo de traduccion de la familia OPUS-MT desarrollada por el grupo Language Technology de la Universidad de Helsinki, convertido a safetensors y acompanado de tokenizadores rapidos en formato JSON para su uso con Candle.

El modelo emplea la arquitectura MarianMT, un transformer encoder-decoder disenado especificamente para traduccion automatica neuronal, con 48.524.648 parametros totales. Esa cifra corresponde a la configuracion compacta tipica de OPUS-MT, lo que lo hace apto para inferencia en CPU y en dispositivos moviles sin acelerador dedicado. El repositorio ocupa 0,2 GB, coherente con un modelo de este tamano en precision completa.

Su relevancia es doble. Por un lado, cubre un par de idiomas de muy bajos recursos (ingles-kirundi, lengua hablada principalmente en Burundi), donde las alternativas comerciales son escasas o de calidad irregular. Por otro, esta orientado explicitamente a inferencia on-device: el autor lo publica como "pack" para Malinali, una aplicacion que ejecuta traduccion local en el dispositivo mediante el motor `marian_flutter` escrito en Rust sobre Candle, sin depender de APIs en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | 48.524.648 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos en safetensors, sin variantes GGUF/AWQ/GPTQ en el repo) |
| Idiomas soportados | ingles (en), kirundi / rundi (rn) |
| Licencia | no disponible en el campo de HuggingFace; el autor remite a la licencia del modelo base (habitualmente CC-BY 4.0 en los modelos OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es MarianMT, la implementacion de transformer encoder-decoder que el proyecto OPUS-MT usa para todos sus modelos de traduccion. Se trata de un transformer clasico con atencion multi-cabeza completa (no hay atencion lineal, SSM ni componentes hibridos) y decodificacion autorregresiva. Los 48,5 millones de parametros son consistentes con la configuracion compacta habitual de la familia: pocas capas, dimension de modelo reducida y vocabulario compartido entre origen y destino. Como el modelo es un reempaquetado del checkpoint de Helsinki-NLP, no hay detalles de arquitectura adicionales publicados en esta ficha; los valores concretos de numero de capas, dimension oculta y cabezas de atencion figuran en el `config.json` del repositorio, que no se ha facilitado en la informacion disponible.

En cuanto al entrenamiento, esta ficha no incluye datos sobre el corpus, el numero de tokens ni si hubo ajuste por RLHF o DPO; tampoco aplica en la practica, ya que se trata de un modelo de traduccion supervisada y no de un modelo de lenguaje generalista con alineamiento por preferencias. Lo que si es propio de este repositorio es la conversion: el autor transforma los pesos originales a safetensors, convierte los tokenizadores SentencePiece a formato de tokenizador rapido de Hugging Face y los separa en dos ficheros, `tokenizer-enc.json` (origen) y `tokenizer-dec.json` (destino), que es el esquema que espera el runtime `marian_flutter` sobre Candle. El autor declara explicitamente que no reclama la propiedad del modelo entrenado y que solo reempaqueta.

## Capacidades

- Traduccion automatica unidireccional de ingles a kirundi (en → rn). No se anuncia soporte para la direccion inversa en este repositorio.
- Generacion de texto condicionada a la tarea de traduccion (pipeline `text2text-generation`), sin capacidades de instruccion general ni de chat.
- Ejecucion on-device: los pesos y tokenizadores estan preparados para inferencia local con Candle a traves del motor Rust `marian_flutter`, integrado en la aplicacion Malinali.
- Compatibilidad con `transformers` mediante la clase MarianMT, con pipeline declarado como `translation`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que permite servirlo en infraestructura de inferencia gestionada.
- No se documentan capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni modo de pensamiento. Es un traductor puro.
- Capacidad multilingue limitada estrictamente al par en-rn; no hay evidencia de transferencia a otras lenguas.

## Casos de uso

- Traduccion on-device en aplicaciones moviles: el modelo cabe holgadamente en el almacenamiento y la memoria de un telefono moderno (menos de 200 MB en precision completa), por lo que puede empaquetarse dentro de una app Flutter y traducir sin conexion, util en zonas de Burundi con conectividad limitada.
- Localizacion de contenidos al kirundi: traduccion de interfaces, avisos legales, documentacion de producto o articulos divulgativos del ingles al kirundi como primer paso de un flujo editorial con revision humana.
- Atencion ciudadana y servicios publicos: traduccion de formularios, comunicaciones administrativas o material sanitario para poblacion kirundiparlante, con el modelo ejecutandose en un portatil o servidor modesto.
- Traduccion asistida en el ambito humanitario: organizaciones que operan en Burundi pueden integrar el modelo en sus herramientas internas para traducir informes de campo del ingles al kirundi, reduciendo la dependencia de traductores puntuales.
- Pretraduccion en flujos de traduccion profesional (MT + post-edicion): generar un borrador automatico y dejar que el traductor humano corrija, aprovechando el coste de inferencia practicamente nulo del modelo.
- Procesamiento por lotes de corpus: al ser un modelo pequeno, puede traducir grandes volumenes de texto en CPU con vLLM no disponible pero si con transformers o Candle en paralelo, por ejemplo para enriquecer un corpus paralelo en-rn.
- Investigacion en traduccion de bajos recursos: servir de linea base reproducible frente a modelos multilingues mucho mayores (NLLB, M2M-100) en un par de idiomas con pocos recursos.
- Integracion embebida en dispositivos de gama baja o edge: al tener 48,5 M de parametros, puede ejecutarse en Raspberry Pi u otros dispositivos ARM sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de BLEU, chrF ni comparaciones con otros sistemas, y los resultados de la busqueda web no aportan datos de evaluacion de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 194 MB en fp32, unos 97 MB en fp16 y unos 50 MB en int8, sin contar la memoria del tokenizador ni los buffers de atencion.
- Cabe sin problemas en cualquier GPU de consumo, incluidas GTX 1050, RTX 3060, RTX 4090 y tambien en GPUs integradas; la inferencia en CPU es perfectamente viable.
- GPU recomendadas: no requiere GPU dedicada. Para lotes grandes, cualquier GPU moderna con 4 GB o mas es mas que suficiente.
- Opciones de despliegue: `transformers` (clase MarianMT), Candle mediante `marian_flutter`, y servicios de inferencia compatibles con el pipeline `translation`. No se publican pesos en formato GGUF, por lo que no hay integracion directa con llama.cpp u Ollama en este repositorio; tampoco hay confirmacion de soporte en vLLM o TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, cabe esperar latencias de decenas de milisegundos por frase en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `malinali-app/opus-mt-en-rn` | 48,5 M | en → rn | no disponible | no disponible (remite a la del modelo base OPUS-MT) | HuggingFace, safetensors + tokenizadores JSON |
| `Helsinki-NLP/opus-mt-en-rn` (modelo base) | 48,5 M | en → rn | no disponible | CC-BY 4.0 segun la practica habitual de OPUS-MT (no confirmado en la informacion disponible) | HuggingFace, pesos originales |
| `facebook/nllb-200-distilled-600M` | 600 M | 200 idiomas, incluye rn | no disponible | CC-BY-NC 4.0 (uso no comercial) | HuggingFace |
| `facebook/m2m100_418M` | 418 M | 100 idiomas, cobertura de rn no confirmada | no disponible | MIT | HuggingFace |

El modelo de este repositorio es aproximadamente 8,5 veces mas pequeno que NLLB-200-distilled-600M y 12 veces mas pequeno que M2M-100 418M, lo que supone una ventaja clara para despliegue en dispositivo, a costa de una calidad de traduccion presumiblemente inferior y de no ofrecer traduccion multilingue ni direccion inversa. No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada en HuggingFace: el campo de licencia aparece como no disponible y el propio autor remite a la licencia del modelo base. Antes de un uso comercial es imprescindible verificar la licencia efectiva de `Helsinki-NLP/opus-mt-en-rn`.
- Modelo unidireccional: solo traduce de ingles a kirundi. Para la direccion inversa hace falta otro checkpoint.
- Par de idiomas de muy bajos recursos: el kirundi tiene pocos corpus paralelos publicos, por lo que la calidad en dominios especializados (medicina, derecho, terminologia tecnica) sera limitada y el riesgo de traducciones erroneas o inconsistentes es alto.
- Riesgo de alucinacion y de omisiones: como todo modelo de traduccion neuronal, puede generar contenido no presente en el original, inventar nombres propios o saltarse fragmentos, especialmente en entradas largas o mal segmentadas.
- Sin datos de evaluacion publicados: no hay BLEU, chrF ni evaluacion humana en el repositorio, de modo que no es posible cuantificar su calidad frente al modelo base. El reempaquetado de pesos deberia ser equivalente, pero no hay verificacion publicada.
- Longitud de contexto no documentada: la familia MarianMT suele limitar las secuencias a unos 512 tokens; no hay confirmacion para este checkpoint, por lo que en produccion conviene segmentar el texto en frases o parrafos cortos.
- Repositorio con cero descargas y cero "likes": no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Sin variantes cuantizadas publicadas: aunque el modelo es pequeno, no se ofrecen ficheros GGUF, int8 o int4 listos para usar, lo que obliga a generarlos si se quiere reducir aun mas el consumo.
- Uso de fecha de creacion posterior a la fecha de esta ficha (2026): conviene verificar el estado actual del repositorio y su mantenimiento.
- Ausencia de soporte de agentes, tool calling o instrucciones: no debe emplearse como asistente conversacional, solo como traductor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-en-rn
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-rn
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a documentos sin relacion con traduccion automatica ni con el proyecto OPUS-MT.
