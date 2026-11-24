# brjezierski/opus-mt-pl-szl-onnx

## Resumen

`brjezierski/opus-mt-pl-szl-onnx` es una exportación cuantizada a ONNX (int8) del modelo `brjezierski/opus-mt-sla-sla-finetuned-pl-to-szl`, un ajuste fino sobre la familia Marian NMT de Helsinki-NLP para traducción automática de polaco a silesio. El autor es brjezierski y el artefacto está pensado específicamente para ejecutarse en el navegador mediante transformers.js, siendo el motor del traductor desplegado en https://brjezierski.github.io.

El modelo resuelve un nicho muy concreto: traducción bidireccional de bajo recurso entre una lengua nacional (polaco) y una lengua regional/minoritaria (silesio), un par para el que prácticamente no existen sistemas comerciales. La relevancia es más de preservación lingüística y experimentación que de rendimiento bruto: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño total es de 0,1 GB, coherente con un modelo Marian base cuantizado.

Arquitectura transformer encoder-decoder de tipo Marian (la usada por OPUS-MT), derivada de un modelo multilingüe eslavo (`opus-mt-sla-sla`) y ajustada para el par pl→szl, posteriormente exportada a ONNX int8. No se dispone de datos sobre número de parámetros, contexto o composición del corpus de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (exportación ONNX cuantizada) |
| Idiomas soportados | polaco (origen) y silesio (destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo es un Marian NMT, la arquitectura estándar de la familia OPUS-MT de Helsinki-NLP: transformer encoder-decoder con atención multi-cabeza, pensado para traducción automática neuronal. Parte de `brjezierski/opus-mt-sla-sla-finetuned-pl-to-szl`, que a su vez deriva del modelo multilingüe eslavo `opus-mt-sla-sla`, ajustado para el par polaco→silesio.

La información disponible no detalla el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones de decodificación. La innovación relevante aquí es operativa: la exportación a ONNX con cuantización int8 para ejecución en navegador vía transformers.js, lo que permite inferencia en cliente sin backend. El autor indica que las entradas deben ir prefijadas con `>>pol<<`.

## Capacidades

- Traducción automática de texto de polaco a silesio.
- Ejecución en navegador mediante transformers.js y pesos ONNX int8.
- Requiere prefijar la entrada con el token `>>pol<<` para indicar el idioma de origen.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del par pl→szl.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Traducción en cliente sin backend: el modelo se ejecuta íntegramente en el navegador con transformers.js, de modo que el texto del usuario no abandona el dispositivo; adecuado para aplicaciones de privacidad estricta.
- Traductor web de lenguas minoritarias: es el uso real documentado por el autor en https://brjezierski.github.io, sirviendo contenido en silesio a partir de originales en polaco.
- Preservación y digitalización lingüística: permite generar versiones en silesio de textos polacos para corpus, wikis o materiales educativos, un par sin cobertura en sistemas comerciales.
- Widgets de traducción embebidos: al ser un artefacto ONNX de 0,1 GB, puede integrarse en páginas estáticas o extensiones sin infraestructura de servidor.
- Prototipado de NMT de bajo recurso: sirve como referencia para experimentar con ajuste fino de Marian sobre lenguas regionales y su exportación a ONNX.
- Aplicaciones offline o de baja conectividad: al no requerir llamadas a API, es viable en entornos con conectividad limitada una vez cacheado el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,1 GB, por lo que la inferencia int8 cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU moderna (RTX 3060 o superior) es sobrada, y el caso de uso principal es CPU/navegador.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del artefacto.
- Opciones de despliegue: transformers.js (caso de uso previsto), y en general cualquier runtime compatible con ONNX (ONNX Runtime, etc.). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| brjezierski/opus-mt-pl-szl-onnx | no disponible | no disponible | pl→szl | MIT | ONNX int8 |
| brjezierski/opus-mt-sla-sla-finetuned-pl-to-szl (modelo base) | no disponible | no disponible | pl→szl | no disponible | no disponible |
| Helsinki-NLP/opus-mt-sla-sla | no disponible | no disponible | multilingüe eslavo | no disponible | no disponible |

La comparación se limita a la cadena de derivación del propio modelo; no se dispone de datos de rendimiento ni de parámetros para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Par lingüístico de muy bajo recurso: la calidad esperada en silesio es limitada y no está respaldada por benchmarks publicados.
- Riesgo de alucinación y de deriva semántica en textos largos o dominios especializados, habitual en NMT de bajo recurso.
- Requiere el prefijo `>>pol<<` en la entrada; su omisión puede degradar la traducción.
- No se documentan sesgos específicos, pero al derivar de corpus eslavos puede heredar sesgos de los mismos.
- Licencia MIT, lo que permite uso comercial, pero sin garantías del autor sobre calidad o idoneidad.
- Sin métricas de evaluación publicadas: no se recomienda para producción crítica sin validación propia.
- El repositorio registra 0 descargas, por lo que no hay evidencia de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brjezierski/opus-mt-pl-szl-onnx
- Modelo base: https://huggingface.co/brjezierski/opus-mt-sla-sla-finetuned-pl-to-szl
- Demo del traductor: https://brjezierski.github.io
