# Aarjan/Qwen3-Nepali-Repaired-Tokenizer-32k

## Resumen

Qwen3-Nepali-Repaired-Tokenizer-32k es un tokenizer para la familia Qwen3 publicado por Aarjan Chaudhary (Naamche Labs) bajo licencia Apache-2.0. No es un modelo de pesos: el repositorio contiene únicamente los ficheros del tokenizer, no los pesos del modelo. Su funcionamiento consiste en reparar la expresion regular del pre-tokenizer de Qwen3 para que las marcas combinantes del devanagari (signos vocálicos, virama, anusvara, etc.) permanezcan dentro de la palabra, y en anadir 32.000 merges de nepalí mediante BPE continuado. El vocabulario resultante pasa de 151.669 a 183.669 entradas, con los identificadores originales intactos.

El problema que aborda es el sobredimensionado del nepalí en el tokenizer original de Qwen3: al separar las marcas combinantes, cada palabra se fragmenta en muchos mas tokens de los necesarios. Segun los datos de la model card, el ratio de tokens nepalí/inglés en FLORES-200 devtest pasa de 4,42x con el tokenizer original a 1,01x con este. El tokenizer es sin perdidas sobre el texto de devtest nepalí e inglés, y mantiene identificadores de token idénticos para el inglés en las 1.012 frases de devtest.

Su relevancia es fundamentalmente de investigación: procede del articulo *Extend or Repair? Vocabulary Extension Cannot Cross a Pre-Tokenizer Boundary* (Chaudhary, Sharma y Dhakal, 2026) y corresponde al brazo R2 del experimento. El propio autor advierte de que, en los experimentos de continued pretraining del paper, ampliar el vocabulario (de cualquiera de las dos formas) dio peor bits per byte en nepalí retenido que conservar el vocabulario original, por lo que debe leerse el paper antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE con pre-tokenizer regex reparado; no es una red neuronal |
| Parametros totales | No aplica (el tokenizer no tiene parametros). Modelo base asociado: Qwen/Qwen3-1.7B-Base, 1,7 mil millones de parametros |
| Parametros activos | No aplica; el modelo base asociado es denso, no MoE |
| Longitud de contexto | No aplica al tokenizer; la determina el modelo base con el que se combine |
| Tipos de cuantizacion | No aplica; no se distribuyen pesos |
| Idiomas soportados | Nepalí (ne) e inglés (en). Otros idiomas que usan marcas combinantes (hindi, tailandés, árabe vocalizado) se tokenizan de forma distinta al tokenizer original |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (no hay pesos). Se distribuyen ficheros de tokenizer: tokenizer.json y tokenizer_config.json |
| Tamano del vocabulario | 183.669 entradas (151.669 originales + 32.000 nuevas); los ids nuevos empiezan en 151669 |
| Clase de tokenizer | PreTrainedTokenizerFast, fijada a proposito en tokenizer_config.json |
| Modelo base | Qwen/Qwen3-1.7B-Base |

## Arquitectura y entrenamiento

Tecnicamente es un tokenizer de pares de bytes (BPE) derivado del de Qwen3. La innovacion es doble. Primero, se repara el patron del pre-tokenizer para que las marcas combinantes del devanagari no actúen como frontera de palabra: la regex deja de trocear secuencias como vocal + virama + consonante. Segundo, se anaden 32.000 merges de nepalí mediante BPE continuado sobre el vocabulario existente, de modo que todos los identificadores originales (incluidos los tokens especiales) se conservan sin cambios y los nuevos se concatenan a partir del id 151669.

El diseno busca preservar la compatibilidad hacia atras: la Proposition 1 del paper establece que cualquier entrada sin marcas combinantes y sin caracteres devanagari conserva exactamente los mismos ids de token, lo que se verifica sobre las 1.012 frases inglesas de FLORES-200 devtest. El tokenizer es sin perdidas tanto en nepalí como en inglés de devtest. Como efecto secundario, el texto de otros sistemas de escritura que emplea marcas combinantes se tokeniza de forma diferente al original.

No hay entrenamiento de un modelo de lenguaje en este repositorio: solo se publica el tokenizer. La model card describe el flujo de uso, que implica redimensionar las embeddings del modelo base a 183.669 filas, inicializar las filas nuevas (el paper usa la media de las filas constituyentes de cada token nuevo, con script en `box/init_model.py`) y continuar el preentrenamiento. Los experimentos de preentrenamiento continuado citados en el paper se hicieron con modelos de 1B y 0,6B, 2 GB de texto y una sola semilla.

## Capacidades

- Tokenizacion de nepalí con marcas combinantes preservadas dentro de la palabra (signos vocálicos, virama, anusvara y similares).
- Compactacion del nepalí: ratio de tokens nepalí/inglés de 1,01x en FLORES-200 devtest, frente a 4,42x del tokenizer original de Qwen3.
- Tokenizacion sin perdidas (lossless) sobre el texto de devtest nepalí e inglés.
- Compatibilidad con el inglés: ids de token idénticos a los del tokenizer original en las 1.012 frases inglesas de devtest.
- Preservacion de todos los identificadores originales, incluidos los tokens especiales de Qwen3; las entradas nuevas se anaden a partir del id 151669.
- Compatibilidad con el ecosistema HuggingFace mediante `AutoTokenizer.from_pretrained`.
- Ampliacion de vocabulario reproducible mediante `resize_token_embeddings` a 183.669 filas e inicializacion de las filas nuevas.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni modo thinking: esas capacidades dependen del modelo base Qwen3 con el que se empareje el tokenizer.

## Casos de uso

- Reduccion del coste de inferencia en nepalí: al pasar de 4,42x a 1,01x tokens por unidad de texto, el mismo contenido nepalí consume aproximadamente una cuarta parte de tokens. En un modelo servido por token, esto reduce proporcionalmente el coste de prefill y aumenta el contexto efectivo disponible para el mismo presupuesto.
- Preentrenamiento continuado de modelos Qwen3 para nepalí: el flujo documentado consiste en redimensionar las embeddings del modelo base (por ejemplo Qwen3-1.7B-Base) a 183.669 filas, inicializarlas con la media de las filas constituyentes y continuar el entrenamiento; es el escenario para el que se diseno el tokenizer.
- Fine-tuning supervisado bilingüe nepalí-inglés: al compartir los ids ingleses con el tokenizer original, un mismo dataset mixto se tokeniza de forma consistente y se evita recalcular vocabularios distintos por idioma.
- Construccion y curacion de corpus nepalíes: la tokenizacion sin perdidas permite indexar, deduplicar y calcular estadisticas de corpus devanagari sin perder caracteres por sustitucion o descarte.
- Investigacion en tokenizacion multilingüe: sirve como brazo R2 reproducible para comparar reparacion del pre-tokenizer frente a extension estandar del vocabulario, con codigo, datos y pre-registro publicados en el repositorio del paper.
- Sistemas de traduccion y asistentes nepalí-inglés: un vocabulario comun y equilibrado reduce la varianza de longitud entre origen y destino, lo que simplifica el modelado de secuencias y el calculo de metricas por token.
- Analisis de sensibilidad de pipelines existentes: dado que la Proposition 1 garantiza ids identicos para entradas sin devanagari ni marcas combinantes, se puede evaluar el impacto del cambio comparando salidas del tokenizer nuevo y del original sobre el mismo corpus.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son de tokenizacion sobre FLORES-200 devtest y de los experimentos de preentrenamiento continuado del paper. No hay resultados de MMLU, HumanEval, GSM8K ni similares, porque no se publican pesos de modelo.

| Metrica (FLORES-200 devtest) | Tokenizer original de Qwen3 | Este tokenizer |
|---|---|---|
| Ratio de tokens nepalí/inglés | 4,42x | 1,01x |
| Ids ingleses identicos al original | Referencia | Si, en las 1.012 frases |
| Tokenizacion sin perdidas (ne, en) | Si | Si |

Resultados de los experimentos de continued pretraining del paper (modelos de 1B y 0,6B, 2 GB de texto, una semilla), tal como los resume la model card:

| Configuracion de vocabulario | Bits per byte en nepalí retenido | Tokens de entrenamiento necesarios |
|---|---|---|
| Vocabulario original de Qwen3 | El mejor de los tres brazos | Referencia |
| Extension estandar del vocabulario | Mejor que la reparacion | Referencia |
| Reparacion del pre-tokenizer (este tokenizer) | 2% a 6% peor que la extension estandar | 26% menos que la extension estandar |

No se publican cifras absolutas de bits per byte en la informacion disponible.

## Requisitos de hardware

- Al tokenizer en sí no le aplican requisitos de GPU: es un componente de software que se ejecuta en CPU y su coste es despreciable frente a la inferencia.
- El requisito real lo marca el modelo con el que se empareje. El modelo base asociado, Qwen3-1.7B-Base, ocupa del orden de 3,4 GB en bf16/fp16 solo en pesos.
- Fine-tuning completo del modelo base con Adam en precision mixta: estimacion del orden de 20-30 GB de VRAM, incluyendo pesos, gradientes y estados del optimizador. Cifra orientativa, no publicada en la informacion disponible.
- Fine-tuning con LoRA o QLoRA del modelo base de 1,7B: cabe en GPUs de consumo con 8-12 GB de VRAM.
- Redimension de embeddings: el tensor de embeddings crece de 151.669 a 183.669 filas, con el coste adicional de memoria y de computo asociado a las 32.000 filas nuevas.
- GPU recomendadas para entrenamiento: A100 40/80 GB, H100 o L40S para fine-tuning completo; RTX 4090, RTX 3090 o GPUs con 12 GB o mas para ajuste con LoRA.
- Opciones de despliegue de inferencia para el modelo base resultante: vLLM, TGI, llama.cpp u Ollama. Para tokenizar en pipelines de datos basta con la libreria `transformers` en CPU.
- Latencia y throughput: no disponibles. Como estimacion derivada del ratio de tokens, el mismo texto nepalí genera aproximadamente 4,4 veces menos tokens que con el tokenizer original, lo que se traduce en una reduccion proporcional del coste de prefill y del numero de pasos de decodificacion para una longitud de texto dada.

## Comparativa con modelos similares

La informacion disponible sobre alternativas es muy limitada; se comparan el tokenizer original y los brazos del paper, que son los unicos con datos publicados.

| Tokenizer | Base | Enfoque | Ratio ne/ing (FLORES-200) | Bits per byte en nepalí (paper) | Licencia |
|---|---|---|---|---|---|
| Este tokenizer (Aarjan/Qwen3-Nepali-Repaired-Tokenizer-32k) | Qwen3-1.7B-Base | Reparacion del pre-tokenizer + 32.000 merges BPE | 1,01x | Peor que el original; 2-6% peor que la extension estandar, con 26% menos tokens de entrenamiento | Apache-2.0 |
| Tokenizer original de Qwen3 | Qwen3 | Sin modificacion | 4,42x | El mejor de los tres brazos en el experimento | Apache-2.0 |
| Extension estandar de vocabulario (brazo comparado en el paper) | Qwen3 | Adicion de tokens sin reparar el pre-tokenizer | No disponible | Mejor que la reparacion en nepalí | No disponible |
| sidskarki/qwen3-nepali-tokenizer | Qwen3 | Tokenizer para nepalí | No disponible | No disponible | No disponible |
| chhatramani/nepali-qwen3-miniv1 | Qwen3 | Modelo ajustado para nepalí | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Advertencia principal del propio autor: en los experimentos del paper, ampliar el vocabulario de cualquiera de las dos formas dio peor bits per byte en nepalí retenido que mantener el vocabulario original de Qwen3. La reparacion fue ademas entre un 2% y un 6% peor en nepalí que la extension estandar, aunque necesito un 26% menos de tokens de entrenamiento.
- Esos experimentos se hicieron con modelos pequenos (1B y 0,6B), 2 GB de texto y una sola semilla; los resultados no son necesariamente extrapolables a escalas mayores.
- El tokenizer solo no sirve para nada por sí mismo: hay que redimensionar las embeddings del modelo base a 183.669 filas, inicializarlas y continuar el preentrenamiento. La model card enlaza `box/init_model.py` para la inicializacion.
- No se publican pesos de modelo ni resultados de benchmarks de un modelo entrenado con este tokenizer, por lo que no hay evidencia de calidad final en tareas de generacion.
- Efecto colateral en otras escrituras: el texto en idiomas que usan marcas combinantes (hindi, tailandés, árabe vocalizado) se tokeniza de forma distinta al tokenizer original de Qwen3.
- Restriccion tecnica critica: `tokenizer_config.json` fija `tokenizer_class` a `PreTrainedTokenizerFast` de forma deliberada. Si se cambia a clases especificas del modelo, como `Qwen2Tokenizer`, la libreria reconstruye el pre-tokenizer a partir de un patron fijo y deshace la reparacion de forma silenciosa.
- La mejora se declara sin perdidas en el texto de devtest de FLORES-200 (nepalí e inglés); no se documentan verificaciones sobre otros dominios, como redes sociales, texto informal o transliteraciones.
- Licencia Apache-2.0, la misma que el tokenizer base de Qwen3, por lo que el uso comercial esta permitido manteniendo el aviso de licencia y la atribucion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado evaluaciones independientes.
- Al ser un componente de tokenizacion, no genera texto: los riesgos de alucinacion, sesgo o fuga de datos dependen exclusivamente del modelo base sobre el que se aplique.

## Enlaces

- HuggingFace: https://huggingface.co/Aarjan/Qwen3-Nepali-Repaired-Tokenizer-32k
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio del paper (codigo, datos y pre-registro): https://github.com/arjanchaudharyy/nepali-pretokenizer-repair
- Qwen3 Technical Report (arXiv): https://arxiv.org/abs/2505.09388
- Qwen3 Technical Report (HTML): https://arxiv.org/html/2505.09388v1
- Sitio oficial de Qwen: https://qwen.ai/home
- Tokenizer alternativo para nepalí en HuggingFace: https://huggingface.co/sidskarki/qwen3-nepali-tokenizer
- Modelo ajustado para nepalí en HuggingFace: https://huggingface.co/chhatramani/nepali-qwen3-miniv1
