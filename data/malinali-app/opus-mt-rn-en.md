# malinali-app/opus-mt-rn-en

## Resumen

`malinali-app/opus-mt-rn-en` es un paquete de pesos redistribuido para traduccion automatica de kirundi (rn) a ingles (en). No es un modelo entrenado desde cero: se trata de una reconversion del modelo `Helsinki-NLP/opus-mt-rn-en` del proyecto OPUS-MT, publicado por el usuario `malinali-app` como pack para inferencia en dispositivo dentro de la aplicacion Malinali. El repositorio contiene los pesos en formato safetensors junto con tokenizadores rapidos en JSON, pensados para el motor Candle en Rust (`marian_flutter`).

La relevancia de esta ficha es acotada: el modelo en si es un Marian de traduccion de unos 48,5 millones de parametros, un tamano tipico de los modelos base de OPUS-MT, orientado a un par de idiomas de bajos recursos como el kirundi, hablado principalmente en Burundi. La publicacion no aporta resultados de benchmarks, ni datos de entrenamiento, ni una licencia declarada de forma explicita, por lo que su interes practico esta en el formato de despliegue (safetensors + tokenizers fast para Candle) mas que en capacidades nuevas.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 2 de octubre de 2026. El autor declara explicitamente que no reclama la propiedad del modelo entrenado y que sigue siendo necesario respetar la licencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer secuencia a secuencia, encoder-decoder) |
| Parametros totales | 48.524.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la configuracion Marian de OPUS-MT suele fijar 512 tokens) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | rn (kirundi) como origen, en (ingles) como destino |
| Licencia | no disponible en el repositorio; el autor indica seguir la licencia del modelo original (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`) + tokenizadores fast JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) y `config.json` |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer encoder-decoder desarrollado por el equipo de Helsinki-NLP especificamente para traduccion automatica neuronal. El modelo cuenta con 48.524.648 parametros totales, un orden de magnitud coherente con la familia de modelos base de OPUS-MT. El repositorio no incluye `model card` con detalles de entrenamiento: no se documentan el numero de tokens, la composicion del dataset, ni si hubo tecnicas de alineacion como RLHF o DPO.

El trabajo realizado por `malinali-app` es de empaquetado, no de entrenamiento: segun la propia descripcion, se limitan a redistribuir los pesos de Helsinki-NLP en safetensors y a convertir los tokenizadores SentencePiece a formato Hugging Face fast tokenizer JSON para permitir inferencia en dispositivo con el motor Candle (`marian_flutter`). La direccion declarada es unica y no bidireccional: **rn → en**.

## Capacidades

- Traduccion automatica de kirundi (rn) a ingles (en), en modo texto a texto.
- Ejecucion en dispositivo gracias al formato safetensors y a los tokenizadores fast preparados para Candle.
- Integracion con la libreria `transformers` mediante `pipeline_tag: translation`.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling ni de function calling.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades multimodales (vision, audio) ni modo de razonamiento explicito.
- Cobertura multilingue limitada estrictamente al par rn → en.

## Casos de uso

- Traduccion de documentos administrativos y humanitarios en Burundi: el modelo permite convertir contenido en kirundi a ingles para su procesamiento posterior por equipos internacionales que no dominan el idioma local.
- Localizacion de interfaces moviles sin conexion: al estar empaquetado para Candle y con pesos safetensors de baja huella, encaja en flujos de traduccion on-device donde no hay acceso a red.
- Preseleccion y triaje de contenido en plataformas de moderacion: traducir texto corto en kirundi a ingles para clasificadores posteriores entrenados en ingles.
- Procesamiento de testimonios y encuestas de campo: traduccion rapida de respuestas abiertas recogidas en kirundi para su analisis cuantitativo.
- Integracion en pipelines de `transformers` con `pipeline("translation")`: uso directo desde Python en scripts de preprocesamiento de corpus.
- Aplicaciones de bajo consumo en hardware modesto: con 48,5 millones de parametros, el modelo puede ejecutarse en CPU o en GPU de gama baja, lo que lo hace apto para despliegues en dispositivos limitados.
- Base para experimentos de ajuste fino en pares de idiomas de bajos recursos: al ser un modelo pequeno, sirve como punto de partida para fine-tuning con corpus propios de kirundi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye puntuaciones BLEU, chrF ni comparaciones con otros sistemas, y los resultados de la busqueda web no aportan datos de evaluacion relacionados con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 200 MB en fp32 (48,5 M de parametros × 4 bytes) y en torno a 100 MB en fp16, sin contar overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo no requiere aceleradores de datacenter como A100 o H100.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GTX/RTX moderna e incluso en graficos integrados recientes.
- CPU: viable para inferencia individual o de baja concurrencia dado el reducido numero de parametros.
- Opciones de despliegue: `transformers` (Python), Candle mediante `marian_flutter` (objetivo declarado del empaquetado), y conversion a otros runtimes previa conversion de pesos (no documentada por el autor).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-rn-en | 48,5 M | no disponible | rn → en | no disponible (remite a la del modelo original) | HuggingFace, 0 descargas |
| Helsinki-NLP/opus-mt-rn-en | no disponible (mismo modelo base) | no disponible | rn → en | habitualmente CC-BY 4.0 | HuggingFace, modelo upstream |
| Helsinki-NLP/opus-mt-* (otros pares) | ~48-77 M por par | no disponible | multiples pares | habitualmente CC-BY 4.0 | HuggingFace, amplia familia |
| NLLB-200 (variantes destiladas) | cientos de millones | no disponible | mas de 200 idiomas | CC-BY-NC 4.0 en varias versiones | HuggingFace |

El modelo es, en la practica, identico en pesos al upstream de Helsinki-NLP; la diferencia esta en el formato de empaquetado para Candle y en los tokenizadores convertidos. Frente a alternativas multilingues como NLLB-200, este modelo sacrifica cobertura de idiomas a cambio de un tamano mucho menor.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: el propio autor remite a la licencia del modelo original, por lo que antes de un uso comercial hay que verificar la licencia efectiva de `Helsinki-NLP/opus-mt-rn-en`.
- Sin datos de evaluacion: no hay BLEU ni chrF publicados, por lo que se desconoce la calidad real de la traduccion en este par de idiomas.
- Riesgo de alucinacion y de traducciones infieles, especialmente en terminologia tecnica, nombres propios y expresiones idiomaticas del kirundi.
- Direccionalidad unica: el modelo solo traduce rn → en, no en → rn.
- Modelo de bajos recursos: el kirundi cuenta con menos corpus paralelos que idiomas mayoritarios, lo que suele traducirse en peor calidad frente a pares como en-de o en-fr.
- Contexto limitado: al ser un modelo Marian de traduccion, trabaja con segmentos cortos y no con documentos largos; no esta pensado para razonamiento multi-turno.
- Cero traccion en el repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de mantenimiento ni de comunidad.
- Repositorio de 0,2 GB con solo cuatro archivos declarados: conviene verificar la integridad de los pesos antes de integrarlos en produccion.
- No apto para tareas distintas de la traduccion: no soporta generacion abierta, codigo, matematicas ni tool calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-rn-en
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-rn-en
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
