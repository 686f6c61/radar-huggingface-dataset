# hirundo-io/clef-westernized

## Resumen

hirundo-io/clef-westernized es un modelo derivado de Cloudflare/clef, un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura qwen3_5 segun los tags del repositorio. Lo desarrolla el usuario hirundo-io y se distribuye como un merge (fine-tuning o fusion de pesos) del modelo base de Cloudflare, con un enfoque declarado en la mitigacion de sesgos y en una orientacion cultural "westernized". El repositorio tiene acceso restringido: es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.

El modelo cuenta con 27.356.728.560 parametros (aproximadamente 27,36 mil millones) segun los datos reales de los ficheros safetensors, y el repositorio ocupa 55 GB. Acepta entradas de imagen y texto y genera texto, por lo que se encuadra en la categoria de modelos vision-language. La licencia es Apache 2.0, lo que permite uso comercial, aunque el acceso gated anade una capa de control por parte del autor.

Su relevancia es limitada por el momento: no tiene descargas ni likes, no declara idiomas soportados y no publica resultados de benchmarks. Se trata, por tanto, de un modelo experimental de nicho, orientado a quienes necesiten una variante de Cloudflare/clef con un sesgo cultural explicitamente ajustado, y no de una opcion consolidada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal image-text-to-text, segun tags) |
| Parametros totales | 27.356.728.560 (aprox. 27,36 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se basa en la arquitectura qwen3_5 y que es un modelo multimodal de tipo image-text-to-text. El pipeline declarado es image-text-to-text, lo que implica un codificador visual acoplado a un decodificador de lenguaje, aunque no se detalla la configuracion exacta de las capas, el numero de cabezas de atencion ni el mecanismo de fusion entre modalidades.

El modelo es un merge del modelo base Cloudflare/clef, etiquetado con los terminos "decision-model", "westernized" y "bias-mitigation". No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto conversacional a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Procesamiento de imagenes combinadas con instrucciones en lenguaje natural.
- Conversacion multi-turno, segun el tag "conversational".
- Modelo etiquetado como "decision-model", lo que sugiere un uso orientado a toma de decisiones o clasificacion guiada, aunque no se detalla el mecanismo.
- Ajuste declarado para mitigacion de sesgos y orientacion cultural "westernized".
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision adicional o audio: solo se confirma vision por el pipeline; el resto no disponible.

## Casos de uso

- Analisis de imagenes con descripcion en lenguaje natural: el modelo puede recibir una imagen y una pregunta y devolver una respuesta textual, adecuado para tareas de captioning o respuesta visual a preguntas en entornos de investigacion.
- Investigacion sobre sesgos culturales: al estar etiquetado como "westernized" y "bias-mitigation", sirve como objeto de estudio para comparar el comportamiento de un modelo base frente a una variante con ajuste cultural explicito.
- Prototipado de asistentes multimodales: su naturaleza conversacional y su entrada image-text permiten construir demos de asistente que interpreta capturas de pantalla o fotografias.
- Evaluacion comparativa de merges: util para experimentar con fusiones de pesos sobre Cloudflare/clef y medir el impacto del merge en tareas de vision-lenguaje.
- Clasificacion y decision asistida: el tag "decision-model" sugiere su uso en flujos donde se necesita una recomendacion textual a partir de una imagen y un contexto, siempre con validacion humana.
- Docencia y experimentacion con modelos de 27B: su tamano permite desplegarlo en infraestructura de gama alta para practicas de inferencia multimodal y cuantizacion.
- Generacion de descripciones para catalogos o accesibilidad: puede producir texto alternativo a partir de imagenes, aunque requiere revision por las limitaciones de sesgo y alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 55 GB solo para los pesos, mas memoria para el codificador visual, el KV cache y overhead, por lo que se recomienda un minimo de 64-80 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 28-30 GB de pesos, con un total practico de 32-40 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 14-16 GB de pesos, con un total practico de 20-24 GB, aunque los ficheros GGUF no estan confirmados en el repositorio.
- GPU recomendadas: A100 80 GB, H100 80 GB o multiples GPU para precision completa; A100 40 GB o L40S para 8 bits; RTX 4090 (24 GB) o RTX A6000 (48 GB) para cuantizaciones bajas.
- Cabe en GPU de consumo: posible en RTX 4090 con cuantizacion de 4 bits, condicionado a que existan pesos cuantizados compatibles.
- Opciones de despliegue: vLLM o TGI para safetensors en servidor; llama.cpp u Ollama si se generan versiones GGUF; transformers como via directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| hirundo-io/clef-westernized | 27,36B | no disponible | Apache 2.0 | Gated | Merge de Cloudflare/clef, orientado a mitigacion de sesgos |
| Cloudflare/clef (base) | no disponible | no disponible | no disponible | no disponible | Modelo original del que deriva |
| Qwen2.5-VL (referencia de familia) | 7B / 72B | no disponible en esta ficha | Apache 2.0 en variantes abiertas | Abierto | Alternativa multimodal de tamano comparable en la variante 72B |
| Llama 3.2 Vision | 11B / 90B | no disponible en esta ficha | Licencia Llama | Abierto con condiciones | Alternativa multimodal con restricciones de uso comercial |

La comparacion con Qwen2.5-VL y Llama 3.2 Vision es orientativa por categoria (vision-lenguaje de gran tamano); no se dispone de datos de rendimiento del modelo evaluado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede limitar la automatizacion de descargas y el uso en CI/CD.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que no se recomienda para produccion sin evaluacion propia.
- Orientacion cultural explicita: la etiqueta "westernized" implica un sesgo cultural deliberado que puede reducir la adecuacion en contextos no occidentales.
- Riesgo de alucinacion: como todo modelo generativo multimodal, puede inventar contenido sobre imagenes ambiguas o de baja calidad.
- Idiomas no declarados: se desconoce el soporte real multilingue y la calidad en castellano.
- Contexto no documentado: se desconoce la ventana maxima, lo que impide planificar cargas de documentos largos.
- Sin datos de entrenamiento: no se puede auditar la composicion del dataset ni los posibles sesgos residuales.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated y la falta de garantias del autor aconsejan revision legal y tecnica previa.
- Modelo experimental con cero descargas y cero likes: sin comunidad ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/clef-westernized
- Modelo base: https://huggingface.co/Cloudflare/clef
