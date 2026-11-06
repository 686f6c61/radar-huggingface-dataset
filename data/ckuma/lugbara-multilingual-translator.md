# ckuma/lugbara-multilingual-translator

## Resumen

El modelo `ckuma/lugbara-multilingual-translator` es un modelo de traduccion automatica publicado en Hugging Face por el usuario ckuma, identificado en la model card como parte de una iniciativa de la Universidad de Muni (Uganda) para desarrollar traductores de la lengua lugbara. El modelo es, segun su propia model card, una copia del modelo `mmuniversity/rutooro-multilingual-translator` (licencia MIT, Mountains of the Moon University), publicado como punto de partida para los traductores de lugbara que se estan entrenando y que reemplazaran esta copia.

A pesar del nombre "lugbara" en el identificador del repositorio, el modelo no traduce a lugbara: es un modelo centrado en rutooro que traduce de ingles a rutooro, luganda, acholi y runyankore. Se trata de un fine-tuning de `Helsinki-NLP/opus-mt-en-mul`, un transformer encoder-decoder de tipo Marian con 77 millones de parametros, orientado a traduccion de texto y con un tamano de repositorio de 0,3 GB.

Su relevancia actual es limitada como modelo de produccion, ya que no tiene descargas ni likes y su propio autor lo describe como un placeholder temporal. Su interes es principalmente documental y de investigacion: ilustra los esfuerzos por cubrir lenguas africanas de bajos recursos (rutooro, luganda, acholi, runyankore) con modelos ligeros derivados de OPUS-MT, y sirve como base para futuros fine-tunings hacia lugbara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), seq2seq |
| Parametros totales | 77.026.926 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo base admite cuantizacion a 8 y 4 bits mediante herramientas estandar) |
| Idiomas soportados | en (entrada); rto, lug, ach, nyn (salida); otros idiomas del modelo base con calidad variable |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Helsinki-NLP/opus-mt-en-mul`, que pertenece a la familia OPUS-MT basada en la arquitectura Marian: un transformer encoder-decoder con atencion multi-cabeza estandar, pensado para traduccion neuronal. El modelo base se entreno originalmente sobre corpus multilingues de OPUS, y este fine-tuning anade un ajuste especifico sobre un dataset propio ("custom") con enfasis en pares de traduccion hacia rutooro.

Segun la model card, el dataset de fine-tuning contiene miles de pares de traduccion en varios idiomas, con especial atencion a las filas donde habia traduccion a rutooro. La cobertura declarada es muy desigual: rutooro aparece en el 11,75 % del dataset, mientras que luganda, acholi y runyankore aparecen en el 99,86 %, 99,87 % y 99,87 % respectivamente. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del corpus, ni si se aplicaron tecnicas de RLHF, DPO o similares; tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El control de idioma de salida se realiza mediante tokens de prefijo en el texto de entrada (`>>rutooro<<`, `>>luganda<<`, `>>acholi<<`, `>>runyankore<<`).

## Capacidades

- Traduccion de texto de ingles a rutooro, luganda, acholi y runyankore mediante tokens de prefijo de idioma.
- Traduccion de texto general y conversacional; el autor advierte que el rendimiento puede bajar en contenido tecnico o muy especializado.
- Soporte de otros idiomas presentes en el modelo base `opus-mt-en-mul`, con calidad variable y no garantizada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de razonamiento (thinking mode), vision ni audio.
- Capacidad multilingue limitada a las lenguas indicadas; no hay evaluacion publicada de calidad por idioma.

## Casos de uso

- Traduccion de comunicaciones comunitarias: el modelo puede traducir avisos, mensajes de salud publica o material civico del ingles a rutooro, luganda, acholi o runyankore, aprovechando que son lenguas de Uganda con presencia limitada en herramientas comerciales.
- Localizacion de contenido educativo: traduccion de parrafos de manuales escolares o materiales de formacion al rutooro, con revision humana obligatoria dada la falta de benchmarks publicados.
- Prototipado de pipelines de traduccion para lenguas de bajos recursos: sirve como linea base ligera (77 M de parametros) para comparar con modelos mayores o para generar datos sinteticos de entrenamiento.
- Investigacion en NLP africano: punto de partida reproducible (licencia MIT) para fine-tunings posteriores, como el propio caso de los traductores de lugbara que el autor anuncia.
- Traduccion de interfaces y formularios: por su tamano reducido puede desplegarse en entornos con recursos limitados para traducir cadenas cortas de UI del ingles a las cuatro lenguas soportadas.
- Generacion de corpus paralelos: uso del modelo para producir traducciones preliminares que luego se corrigen manualmente y se incorporan a datasets de entrenamiento de modelos mayores.
- Educacion y divulgacion: demostraciones en entornos academicos (Universidad de Muni) sobre el estado del arte en traduccion automatica para lenguas ugandesas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara la metrica BLEU en los metadatos, pero no incluye valores numericos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (77 M de parametros, aproximadamente 0,3 GB de pesos); menos de 0,5 GB en fp16 o int8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4060, RTX 4090 o incluso en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de VRAM, y en CPU con latencia aceptable para textos cortos.
- Opciones de despliegue: `transformers` con pipeline de traduccion (metodo documentado), ademas de opciones estandar para modelos Marian como vLLM (soporte limitado para encoder-decoder), TGI o conversion a otros formatos; no se documenta soporte explicito de llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU y decenas de milisegundos por frase corta, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ckuma/lugbara-multilingual-translator | 77 M | no disponible | rto, lug, ach, nyn | MIT | Hugging Face, 0 descargas |
| Helsinki-NLP/opus-mt-en-mul | no disponible en la informacion | no disponible | multiples (modelo base) | no disponible en la informacion | Hugging Face, ampliamente usado |
| mmuniversity/rutooro-multilingual-translator | no disponible en la informacion | no disponible | rto, lug, ach, nyn | MIT | Hugging Face (modelo original del que deriva esta copia) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no traduce a lugbara pese a su nombre: es una copia del traductor centrado en rutooro y el propio autor indica que sera reemplazado por modelos de lugbara en entrenamiento.
- No hay benchmarks ni evaluacion de calidad publicada; el rendimiento real por idioma es desconocido.
- Cobertura de datos muy desigual: rutooro solo aparece en el 11,75 % del dataset de fine-tuning, lo que puede degradar su calidad frente a las otras lenguas.
- Riesgo de alucinacion y de traducciones inexactas en dominios tecnicos, especializados o con frases complejas, segun advierte la model card.
- Sesgos no documentados: no se describe la procedencia, el dominio ni la demografia de los datos de entrenamiento, por lo que pueden existir sesgos linguisticos y culturales no evaluados.
- Longitud de contexto no especificada: no se garantiza el comportamiento en entradas largas.
- Licencia MIT permite uso comercial, pero al derivar de `Helsinki-NLP/opus-mt-en-mul` conviene verificar las condiciones del modelo base y de los corpus OPUS subyacentes.
- Modelo sin traccion (0 descargas, 0 likes) y publicado como placeholder: no es recomendable para produccion sin validacion previa y revision humana.
- La model card contiene referencias cruzadas a otros repositorios (MubarakB, mmuniversity) y un ejemplo de codigo que apunta a un identificador distinto del repositorio actual, lo que puede inducir a error en la integracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ckuma/lugbara-multilingual-translator
- Modelo original del que deriva: https://huggingface.co/mmuniversity/rutooro-multilingual-translator
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-mul
- Repositorio referenciado en el ejemplo de la model card: https://huggingface.co/MubarakB/rutooro-multilingual-translator
