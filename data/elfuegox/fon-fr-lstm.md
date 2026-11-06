# ElFuegoX/fon-fr-lstm

## Resumen

`ElFuegoX/fon-fr-lstm` es un modelo de traduccion automatica neuronales para el par fongbe-frances (fon → fr), desarrollado por el usuario ElFuegoX como proyecto de la asignatura de PLN en el semestre 5 de IFRI. Se trata de un conjunto de tres modelos seq2seq basados en LSTM, entrenados desde cero sobre un corpus de aproximadamente 39 000 pares de frases procedentes de dialogos, la Biblia en fongbe y datos de AI4D. No es un modelo de lenguaje generativo de gran escala, sino un sistema de traduccion especializado y de dominio acotado.

El repositorio incluye tres variantes con arquitecturas distintas: un encoder BiLSTM con atencion de Luong (la de mejor calidad), un encoder LSTM con atencion de Luong y un seq2seq LSTM basico sin atencion. La variante BiLSTM con atencion alcanza 14,03 BLEU y 33,29 chrF sobre un conjunto de test de 4 880 pares, lo que lo convierte en una referencia util y reproducible para una lengua de bajos recursos como el fongbe.

Su relevancia radica en la escasez de recursos para lenguas africanas de bajos recursos: el modelo demuestra que con ~39 000 pares, SentencePiece de 8 000 subpalabras, label smoothing y BPE-dropout se puede construir un traductor funcional sin depender de modelos multilingues masivos. El tamano del repositorio es de 0,2 GB, lo que refleja la escala contenida del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2Seq LSTM (tres variantes: BiLSTM + atencion de Luong, LSTM + atencion de Luong, LSTM encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `.pt` de PyTorch, sin versiones cuantizadas publicadas) |
| Idiomas soportados | fon (fongbe) y fr (frances) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch; incluye pesos, configuracion y vocabularios SentencePiece) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura seq2seq clasica con encoder y decoder LSTM. La variante principal, `bilstm_attention`, emplea un encoder BiLSTM y atencion de Luong en el decoder; la variante `seq2seq_attention` usa un encoder LSTM unidireccional con la misma atencion; y la variante `seq2seq` es un encoder-decoder LSTM sin atencion. El vocabulario se construye con SentencePiece con 8 000 subpalabras, y durante el entrenamiento se aplican label smoothing de 0,1 y BPE-dropout de 0,1.

El corpus de entrenamiento consta de aproximadamente 39 000 pares fon-frances procedentes de tres fuentes: dialogos (Degila et al. 2020, Zenodo 4266935), datos de AI4D (Dossou et al. 2021, Zenodo 4432712) y la Biblia en fongbe (fongbebenin.com). El conjunto de test tiene 4 880 pares que no se usaron ni para entrenamiento ni para ajuste de hiperparametros; el beam search se selecciono sobre el conjunto de validacion. Las metricas BLEU y chrF se calcularon con sacrebleu sin distincion de mayusculas. No se documenta el numero total de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Traduccion de texto del fongbe al frances, unidireccional (fon → fr).
- Generacion de traduccion con decodificacion por beam search (beam 8, alpha 1,3 en la mejor variante) o decodificacion voraz en la variante basica.
- Manejo de subpalabras mediante SentencePiece (8 000 unidades), lo que permite representar palabras poco frecuentes del fongbe.
- Procesamiento de frases de diversa longitud, con metricas desglosadas por longitud de frase en los ficheros `.metrics.json`.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada estrictamente al par fon-fr; no se documenta soporte para otras lenguas.

## Casos de uso

- Traduccion de documentacion y textos religiosos: el modelo se entreno con la Biblia en fongbe, por lo que es adecuado para traducir pasajes y material eclesiastico al frances con una calidad razonable dentro de ese dominio.
- Digitalizacion y acceso a contenidos en fongbe: permite convertir textos escritos en fongbe a frances para su consulta por hablantes de frances o para su indexacion en buscadores, aprovechando el vocabulario SentencePiece entrenado sobre el corpus.
- Apoyo a la ensenanza bilingue: puede usarse como herramienta de consulta en contextos educativos fon-frances, con la advertencia de que la calidad (14 BLEU en la mejor variante) exige revision humana.
- Investigacion en PLN para lenguas de bajos recursos: sirve como linea base reproducible (codigo de inferencia en `src/translation/inference.py`, metricas detalladas) para comparar futuros modelos fon-frances.
- Traduccion de dialogos y conversaciones cotidianas: el corpus incluye dialogos, por lo que el modelo puede emplearse en prototipos de asistencia conversacional escrita fon-frances.
- Despliegue ligero en entornos con pocos recursos: con 0,2 GB de repositorio y pesos LSTM, puede ejecutarse en CPU sin GPU dedicada, lo que facilita su integracion en aplicaciones locales o de bajo coste.
- Anotacion asistida de corpus: puede generar traducciones preliminares que un anotador humano corrija, acelerando la creacion de nuevos pares fon-frances.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de 4 880 pares (BLEU y chrF con sacrebleu, sin distincion de mayusculas):

| Modelo | Arquitectura | BLEU test | chrF test | Decodificacion |
|---|---|---|---|---|
| `bilstm_attention` | Encoder BiLSTM + atencion de Luong | 14,03 | 33,29 | beam 8, alpha 1,3 |
| `seq2seq_attention` | Encoder LSTM + atencion de Luong | 6,87 | 24,30 | beam 5, alpha 1,0 |
| `seq2seq` | Encoder-decoder LSTM | 4,54 | 21,47 | voraz |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (0,2 GB) y la naturaleza LSTM del modelo, cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 4090 o una GPU integrada moderna son mas que suficientes.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales, y tambien en CPU.
- Opciones de despliegue: el modelo se carga con `Traducteur.charger` del codigo del proyecto (`src/translation/inference.py`) en PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un transformer con formato GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia cualitativa, existen otros proyectos de traduccion fon-frances en el ecosistema (por ejemplo, los corpus de Degila et al. 2020 y Dossou et al. 2021 citados como fuentes de datos), pero no se han publicado en esta ficha resultados comparables de BLEU/chrF para ellos.

| Modelo | Parametros | Contexto | BLEU test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ElFuegoX/fon-fr-lstm` (BiLSTM + atencion) | no disponible | no disponible | 14,03 | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Calidad de traduccion moderada: 14,03 BLEU en la mejor variante indica que las traducciones requieren revision humana en practicamente cualquier uso profesional.
- Direccion unica: solo traduce fon → fr; no se documenta el sentido inverso.
- Dominio acotado: el corpus se compone de dialogos, la Biblia y datos AI4D, por lo que el rendimiento fuera de esos dominios (texto tecnico, juridico, medico) es incierto.
- Sesgos potenciales: la presencia dominante de la Biblia en el corpus puede sesgar el vocabulario y el estilo hacia registros religiosos.
- Riesgo de alucinacion y de traducciones infieles, especialmente en frases largas o con vocabulario ausente del corpus.
- Licencia no disponible: no se puede confirmar el uso comercial; es necesario contactar con el autor antes de un despliegue en produccion.
- Proyecto academico de semestre 5: no hay garantia de mantenimiento, soporte ni actualizaciones.
- Sin cuantizaciones publicadas ni integracion con frameworks de serving estandar (vLLM, TGI, Ollama), lo que limita su despliegue a gran escala.
- No se documentan limitaciones de longitud de contexto; el comportamiento con frases muy largas no esta caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ElFuegoX/fon-fr-lstm
- Demo (Space): https://huggingface.co/spaces/ElFuegoX/traduction-fon-fr
- Corpus Degila et al. 2020: https://zenodo.org/record/4266935
- Corpus Dossou et al. 2021: https://zenodo.org/record/4432712
- Biblia en fongbe: https://fongbebenin.com
