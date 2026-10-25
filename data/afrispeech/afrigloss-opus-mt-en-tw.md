# AfriSpeech/afrigloss-opus-mt-en-tw

## Resumen

AfriSpeech/afrigloss-opus-mt-en-tw es un modelo de traducción automática inglés → twi (akano) construido sobre la arquitectura MarianMT y ajustado dentro del marco Afri-Gloss-MT que desarrolla el equipo AfriSpeech. Su particularidad es que no se limita a traducir: acepta términos de glosario inyectados por el usuario en el texto de origen entre corchetes angulares (`<término>`) y los conserva en la salida, lo que permite imponer terminología controlada sin reentrenar el modelo. Resuelve un problema típico de los dominios técnicos y de las lenguas de bajos recursos: la inconsistencia terminológica en traducciones automáticas de vocabulario especializado.

El modelo tiene 73.380.009 parámetros (unos 0,3 GB en el repositorio) y se ha ajustado sobre 77.006 pares de frases paralelas procedentes de los corpus AfriSpeech/africa-corpus y AfriSpeech/african-corpus-jw, con sustituciones verificadas de sintagmas nominales en contexto. Los datos publicados reportan una adhesión al glosario del 92,4 % sobre más de 4.300 frases de test no vistas, lo que lo sitúa como una pieza útil para localización con terminología fija (legal, médico, administrativo) en twi.

Es relevante ahora porque la mayoría de los modelos multilingües grandes no ofrecen control terminológico explícito para lenguas africanas, y las alternativas de código abierto para inglés–twi son escasas. Aquí el control se consigue en tiempo de inferencia, sin pipeline adicional, lo que simplifica su integración en flujos de traducción asitida por glosario. La licencia Apache 2.0 facilita además el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder seq2seq, familia OPUS-MT) |
| Parametros totales | 73.380.009 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso fija `max_length=128` en la generación |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (precisión original no declarada) |
| Idiomas soportados | inglés (en) y twi/akano (twi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carga directa con `transformers`: `MarianMTModel`, `MarianTokenizer`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MarianMT, un transformer encoder-decoder orientado a traducción automática neuronal, la misma familia que los modelos OPUS-MT de Helsinki-NLP. Con 73,38 millones de parámetros se trata de un modelo compacto, pensado para inferencia rápida y despliegue ligero más que para razonamiento general. La innovación no está en el backbone sino en el esquema de entrenamiento: el modelo aprende a copiar los términos marcados con corchetes angulares desde el texto de origen a la traducción, respetando las concordancias gramaticales del twi alrededor de esos términos.

El ajuste se realizó sobre 77.006 pares de frases paralelas extraídos de AfriSpeech/africa-corpus y AfriSpeech/african-corpus-jw, con reemplazos de sintagmas nominales en su posición original verificados al 100 % según la model card. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO (poco habituales en modelos de traducción de este tamaño). Tampoco se detallan hiperparámetros, presupuesto de cómputo ni técnica de decodificación empleada en el ajuste; el ejemplo publicado usa búsqueda por haces con 4 haces.

## Capacidades

- Traducción automática directa inglés → twi a nivel de frase.
- Control terminológico zero-shot: los términos objetivo se insertan en el texto de origen entre corchetes angulares (`<kannifoɔ>`) y el modelo los reproduce en la salida.
- Adhesión al glosario del 92,4 % sobre términos inyectados, manteniendo las concordancias gramaticales del entorno.
- Compatibilidad con glosarios externos: cualquier diccionario puede formatearse como marcado en línea antes de la traducción.
- Manejo de vocabulario religioso, administrativo y de uso general presente en los corpus de entrenamiento (el ejemplo de la model card es de dominio bíblico).
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe limitada estrictamente al par en–twi.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.

## Casos de uso

- Localización de documentación técnica con terminología fija: se precargan los términos del glosario corporativo en el texto de origen y el modelo los preserva, evitando variantes inconsistentes de un mismo concepto a lo largo de un manual.
- Traducción de materiales sanitarios o legales: en dominios donde un término mal traducido tiene consecuencias, la inyección de glosario permite fijar equivalentes validados por revisores humanos antes de generar la traducción.
- Traducción bíblica y de textos religiosos: el ejemplo publicado y los corpus de entrenamiento (con vocabulario como `apam`, `Nyankopɔn`) hacen que este dominio sea el mejor cubierto.
- Pretraducción asistida por CAT: el modelo genera un borrador con terminología ya impuesta, que el traductor humano post-edita, reduciendo el número de correcciones terminológicas.
- Enriquecimiento de contenidos web y apps para audiencias akanoparlantes: traducción de cadenas de interfaz y textos cortos con un modelo de 73 M que corre en CPU.
- Normalización de corpus paralelos: al fijar la terminología de un lado de la traducción, se generan pares en–twi coherentes para alimentar otros modelos o memorias de traducción.
- Evaluación comparativa de sistemas de control terminológico: sirve como línea base reproducible (BLEU 21,70, chrF2 47,28, adhesión 92,4 %) en experimentos de terminología controlada para lenguas africanas.

## Benchmarks y rendimiento

Evaluación sobre más de 4.300 frases de test no vistas, según la model card:

| Metrica | Resultado | Notas |
|---|---|---|
| BLEU | 21,70 | Calculado con `sacrebleu` |
| chrF2 | 47,28 | F-score de n-gramas de caracteres |
| Adhesión al glosario | 92,4 % | Porcentaje de términos inyectados que se conservan en la salida |

No se han publicado en la información disponible resultados desglosados por dominio, comparaciones con otros sistemas en el mismo conjunto de test ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,3 GB en precisión de 32 bits (tamaño del repositorio); aproximadamente 0,15 GB en fp16 y 0,08 GB en int8, calculados a partir de los 73,38 M de parámetros.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobradamente suficiente; también A100 o H100 si se integra en un servicio compartido con otros modelos.
- Cabe en cualquier GPU consumer e incluso en CPU modesta; es apto para despliegue en dispositivos de borde.
- Opciones de despliegue: `transformers` con `MarianMTModel` (ruta documentada), exportación a ONNX o conversión a CTranslate2 para servir con mayor throughput. No se documenta soporte GGUF/llama.cpp en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera decodificación en milisegundos por frase en GPU y en el orden de decenas o centenas de milisegundos en CPU, sin datos oficiales que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AfriSpeech/afrigloss-opus-mt-en-tw | 73,38 M | no disponible | en → twi | MarianMT con glosario inyectable | Apache 2.0 | HuggingFace |
| Helsinki-NLP/opus-mt-en-tw (familia OPUS-MT) | no disponible en la información proporcionada | no disponible | en → twi | MarianMT sin control terminológico explícito | no disponible en la información proporcionada | HuggingFace |
| NLLB-200 (variantes destiladas de Meta) | no disponible en la información proporcionada | no disponible | multilingüe, incluido twi | transformer multilingüe | no disponible en la información proporcionada | HuggingFace |

No se dispone de datos de benchmark de las alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de calidad. La diferencia funcional verificable es el control de glosario en línea, que las alternativas citadas no documentan.

## Limitaciones y advertencias

- El 7,6 % de los términos inyectados no se conserva según la propia métrica de adhesión; en dominios críticos se requiere verificación automática posterior.
- BLEU de 21,70 y chrF2 de 47,28 indican una calidad de traducción moderada; no es un modelo apto para publicación sin revisión humana.
- Entrenado solo con 77.006 pares de frases: cobertura limitada de dominios, registros y variantes dialectales del twi o del akano.
- La sintaxis de corchetes angulares es un contrato implícito del modelo; un formateo incorrecto o corchetes anidados pueden degradar la salida o colarse en el texto final (el ejemplo oficial limpia los corchetes con una expresión regular).
- Modelo orientado a frases: no se documenta manejo de documentos largos ni de contexto extendido; la traducción de párrafos requiere segmentación previa.
- Riesgo de alucinación y de omisión de contenido en frases largas o con estructuras poco frecuentes, como en cualquier modelo seq2seq de este tamaño.
- No se documentan evaluaciones de sesgo ni de robustez en la información disponible.
- No soporta tool calling, agentes ni instrucciones en lenguaje natural más allá del marcado de glosario.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y de atribución; no se declaran restricciones adicionales de uso aceptable.
- La model card no incluye sección de limitaciones ni de sesgos conocidos; conviene realizar una evaluación propia antes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AfriSpeech/afrigloss-opus-mt-en-tw
- Repositorio del toolkit Afri-Gloss-MT: https://github.com/AfriSpeech/afrigloss-mt
- Colección de modelos Afri-Gloss-MT: https://huggingface.co/collections/AfriSpeech/afri-gloss-mt-models-6adce3a3c13c6a86f07b6e6d
- Dataset AfriSpeech/africa-corpus: https://huggingface.co/datasets/AfriSpeech/africa-corpus
- Dataset AfriSpeech/african-corpus-jw: https://huggingface.co/datasets/AfriSpeech/african-corpus-jw
