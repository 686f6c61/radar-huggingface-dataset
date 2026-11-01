# masterofaudio2077/byt5-small-arabizi-word

## Resumen

byt5-small-arabizi-word es un modelo de transliteración de palabras sueltas entre arabizi (árabe escrito con caracteres latinos y dígitos) y escritura árabe. Lo desarrolla el usuario de HuggingFace masterofaudio2077 y parte de google/byt5-small, un transformer encoder-decoder de 300 millones de parámetros que opera a nivel de byte en lugar de token. El modelo resuelve un problema concreto y bien delimitado: convertir términos individuales del chat del Golfo y del Levante entre ambas representaciones mediante un prefijo de dirección en la entrada.

La relevancia es práctica: el arabizi es omnipresente en redes sociales y mensajería del mundo árabe, pero carece de normalización y complica tareas posteriores de NLP. Este modelo ofrece una conversión bidireccional con un único checkpoint, entrenado sobre 17.514 pares de palabras del dataset arbml/Arabizi_Transliteration. No es un modelo generativo general ni un asistente conversacional: es una herramienta de normalización léxica.

Con solo 18 descargas y publicado en octubre de 2026, se trata de un fine-tune experimental de un desarrollador individual, con métricas propias sobre un split interno y sin benchmark comunitario. Su utilidad debe evaluarse con cautela y verificarse contra los datos de destino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5/ByT5), byte-level |
| Parametros totales | 299.637.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entradas de hasta 13 caracteres arabizi / 12 árabes en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; compatible con cuantización estándar de transformers) |
| Idiomas soportados | ar (árabe, con convenciones de arabizi del Golfo y del Levante) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de google/byt5-small, un T5 con tokenización a nivel de byte (vocabulario de 256 símbolos más especiales), lo que elimina el problema de vocabulario fuera de dominio y permite representar tanto caracteres latinos como árabes sin tokenizador específico. La tarea se formula como text2text con prefijo de dirección: `to arabic: ` para arabizi a árabe y `to arabizi: ` para la dirección inversa.

El entrenamiento consistió en 10.000 pasos con batch 128 (6,9 horas en una GPU de Kaggle), optimizador Adafactor con learning rate 1e-3, 200 pasos de warm-up y decaimiento lineal, label smoothing de 0,1 y precisión fp32. Se publica el checkpoint del paso 2.000, el mejor en validación. Los datos son 17.514 pares de entrenamiento, 1.000 de validación y 1.000 de test, divididos por componentes conexas de (palabra árabe, cadena arabizi) para evitar fugas entre splits. Cada par se usa en ambas direcciones. La limpieza eliminó 3 filas con fechas de Excel, 3 fuentes solo numéricas, 1 fila sin letra latina y 1.978 pares duplicados; el arabizi se normaliza a minúsculas y NFKC, y el árabe se procesa sin diacríticos ni tatweel. La generación guardada en el repo usa beam search con 5 haces y un máximo de 40 bytes de salida.

## Capacidades

- Transliteración palabra a palabra arabizi a escritura árabe, con prefijo `to arabic: `.
- Transliteración inversa árabe a arabizi, con prefijo `to arabizi: `, devolviendo múltiples candidatos de ortografía válida mediante `num_return_sequences`.
- Manejo de convenciones de chat del Golfo y del Levante: 8 por ق, `9'` por ض, `$` por ش.
- Representación byte-level que cubre cualquier carácter latino o árabe sin tokens desconocidos.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.
- No procesa frases ni documentos: únicamente palabras sueltas de hasta 13 caracteres arabizi o 12 árabes.

## Casos de uso

- Normalización de mensajes en redes sociales: preprocesar publicaciones y comentarios en arabizi convirtiendo cada palabra a escritura árabe antes de alimentar un pipeline de análisis de sentimiento o clasificación de temas.
- Enriquecimiento de datasets de NLP árabe: generar la variante en escritura árabe de corpus recogidos en arabizi para unificar el vocabulario y reducir la dispersión léxica en modelos posteriores.
- Búsqueda y recuperación: indexar términos en ambas representaciones para que una consulta en arabizi recupere documentos escritos en árabe, aplicando la conversión palabra a palabra en la fase de expansión de consulta.
- Moderación de contenido: detectar términos ofensivos o palabras clave escritas en arabizi traduciéndolas a árabe para contrastarlas con listas de bloqueo en escritura estándar.
- Herramientas de accesibilidad y teclado: ofrecer conversión automática de una palabra escrita en teclado latino a su forma árabe, o al contrario, en interfaces de mensajería.
- Anotación asistida para lexicografía: generar candidatos de ortografía arabizi (top-3 o top-5) para una palabra árabe y que un anotador humano seleccione la variante correcta según el dialecto.
- Limpieza de transcripciones de chat: normalizar nombres propios y términos coloquiales antes de tareas de extracción de entidades.

## Benchmarks y rendimiento

Resultados sobre 1.000 filas reservadas (988 palabras arabizi únicas y 689 árabes únicas), según la model card del autor:

| Metrica | Arabizi → arabe | Arabe → arabizi |
|---|---|---|
| Exact match estricto | 65,8% | 38,2% |
| Exact match laxo (ا/أ/إ, ي/ى, ة/ه plegados) | 66,2% | 38,2% |
| Ortografía conocida en top-3 | 86,1% | 56,2% |
| Ortografía conocida en top-5 | 89,2% | 63,7% |
| Character error rate | 0,090 | 0,183 |
| CER laxo | 0,088 | 0,183 |
| Baseline copiar la fuente (CER) | 1,160 | 1,004 |

Round trip (árabe → arabizi → árabe, laxo): 73,9%.

Rendimiento por longitud de la fuente:

| Longitud origen | Arabizi → arabe | Arabe → arabizi |
|---|---|---|
| 1-4 caracteres | 76,3% (n=194) | 41,6% (n=233) |
| 5-6 caracteres | 62,8% (n=522) | 37,0% (n=368) |
| 7-8 caracteres | 65,4% (n=240) | 33,3% (n=84) |
| 9 o más | 65,6% (n=32) | 50,0% (n=4) |

No se han publicado resultados en benchmarks comunitarios independientes (MMLU, HumanEval, GSM8K u otros); estas tareas no aplican a un modelo de transliteración léxica.

## Requisitos de hardware

- VRAM estimada: unos 1,2 GB en fp32 para los 300M de parámetros; aproximadamente 0,6 GB en fp16 y 0,3-0,4 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada con suficiente memoria compartida puede ejecutarlo. Para lotes grandes, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe holgadamente en cualquier GPU consumer con 4 GB o más de VRAM, y en CPU para inferencia por lotes moderados.
- Opciones de despliegue: transformers con T5ForConditionalGeneration, text-generation-inference (el repo declara endpoints_compatible), y exportación a ONNX o cuantización GGUF mediante herramientas estándar, aunque no se documenta un GGUF oficial.
- Latencia y throughput: no disponibles de forma medida; por el tamaño y la salida máxima de 40 bytes, la inferencia por palabra es del orden de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| byt5-small-arabizi-word | 300M | palabra suelta | Transliteración arabizi-árabe bidireccional | apache-2.0 | HuggingFace, 18 descargas |
| google/byt5-small (base) | 300M | 1.024 tokens (configuración T5) | Text2text general byte-level | apache-2.0 | HuggingFace, ampliamente usado |
| google/mt5-small | 300M | 512 tokens | Text2text multilingüe | apache-2.0 | HuggingFace, ampliamente usado |

No se dispone de información sobre otros fine-tunes públicos específicos de transliteración arabizi con los que comparar métricas de forma directa.

## Limitaciones y advertencias

- Solo procesa palabras sueltas; las fuentes de entrenamiento no superan los 13 caracteres arabizi ni los 12 árabes. No admite frases ni párrafos.
- Sigue las convenciones del Golfo y del Levante (8 = ق, `9'` = ض, `$` = ش); otros dialectos o convenciones pueden convertirse mal.
- El dataset de origen no declara licencia, por lo que el uso comercial de los datos subyacentes debe verificarse de forma independiente, aunque los pesos se publican con apache-2.0.
- La dirección árabe → arabizi tiene una exactitud estricta baja (38,2%) porque existen múltiples ortografías válidas; debe evaluarse junto con la métrica top-5 (63,7%).
- Errores frecuentes: en arabizi → árabe, adición u omisión de ا y ي, y confusiones ط/ت y س/ص; en árabe → arabizi, omisión o intercambio de vocales a, e, i, o.
- El test split es propio del autor (división por grupos), no un benchmark comunitario, lo que limita la comparabilidad.
- Riesgo de alucinación en palabras fuera de distribución: al ser un modelo byte-level, puede producir salidas plausibles pero incorrectas para términos no vistos.
- Modelo de un desarrollador individual, con 18 descargas y sin validación externa; no recomendable como componente crítico en producción sin evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masterofaudio2077/byt5-small-arabizi-word
- Modelo base: https://huggingface.co/google/byt5-small
- Paper de ByT5: https://arxiv.org/abs/2105.13626
- Dataset de entrenamiento: https://huggingface.co/datasets/arbml/Arabizi_Transliteration
