# RuiRuihigh/voxtlm_v2_k2000_Bal_opt1.3b

## Resumen

VoxtLM v2 es un modelo de lenguaje decoder-only que unifica tareas de habla y texto en un unico modelo. Lo publica el usuario RuiRuihigh sobre la libreria ESPnet, y toma como backbone `facebook/opt-1.3b`, inicializado desde los pesos preentrenados de OPT. Con un unico conjunto de pesos resuelve cuatro tareas seleccionables mediante tokens especiales: reconocimiento automatico del habla (ASR), sintesis de habla (TTS), continuacion de texto y continuacion de unidades de habla. Es la variante de mayor tamano de la familia VoxtLM v2 del mismo autor, que tambien publica una version con backbone de 350M parametros.

El modelo sigue la estela de VoxtLM (arXiv:2309.07937), la propuesta original para consolidar reconocimiento y sintesis de habla con modelado de lenguaje. La innovacion practica reside en la tokenizacion compartida: tanto el texto como el habla se codifican en un unico vocabulario BPE de 10 000 entradas, de modo que el modelo trata el habla discreta y el texto en la misma secuencia. Esto permite alternar dominios sin cambiar de arquitectura.

Es relevante ahora porque demuestra que un backbone de lenguaje generico (OPT) puede reconvertirse en un modelo multimodal de habla con un coste de entrenamiento moderado (~1,28M secuencias sobre el subconjunto equilibrado D_Bal) y ofrecer resultados competitivos en ASR (5,9% WER en LibriSpeech) y TTS (UTMOS 3,87). El checkpoint publicado corresponde a la epoca 7, la de mejor validacion, ya que a partir de la epoca 8 el modelo comienza a sobreajustar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone OPT-1.3B, ESPnet `transformer_opt`) |
| Parametros totales | 1,3B (backbone OPT-1.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | OPT license (uso no comercial, investigacion) |
| Formato de pesos | `.pth` (PyTorch, ESPnet) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only heredada de OPT-1.3B, adaptada a ESPnet mediante el modulo `transformer_opt`. No hay mezcla de expertos ni mecanismos de estado recurrente: es un transformer denso clasico. El modelo procesa una unica secuencia que puede contener texto y/o unidades discretas de habla, y la tarea se determina mediante tokens especiales. El texto se tokeniza con SentencePiece unigram BPE de 10 000 entradas; el habla se convierte en unidades discretas con el Phonological Tokenizer de Sony (WavLM-large afinado, capa 21, codebook de 2000 entradas, arXiv:2601.19781). Las unidades se mapean a caracteres CJK y se codifican con el mismo BPE, de forma que texto y habla comparten vocabulario de 10 000 tokens.

El entrenamiento usa el subconjunto D_Bal (el ajuste equilibrado del articulo): LibriSpeech, LibriTTS, VCTK y LibriLight, con aproximadamente 1,28M secuencias repartidas entre las cuatro tareas. El checkpoint publicado es `valid.acc.best.pth`, correspondiente a la epoca 7, con la mejor precision de validacion (0,314) y la menor perdida de validacion (2,641). Aunque el entrenamiento continuo hasta la epoca 22, la perdida de validacion empezo a subir tras la epoca 8 (precision 0,291 y perdida 3,018 en la epoca 22), lo que indica sobreajuste; por eso se subio el checkpoint de la epoca 7. No se documentan en la informacion disponible etapas de RLHF ni DPO. La generacion de habla se completa con un vocoder HiFi-GAN de unidades que no se incluye en el repositorio.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto en ingles, con 5,9% WER en LibriSpeech test-clean y test-other.
- Sintesis de habla (TTS): generacion de texto a unidades de habla discretas, con CER 8,1% y WER 10,0% medidos por Whisper en 100 utterances de LibriTTS, y UTMOS 3,87.
- Continuacion de texto: modelado de lenguaje textual puro, con perplejidad 26,05 en LibriSpeech test.
- Continuacion de unidades de habla: modelado de lenguaje sobre unidades discretas, con perplejidad 34,99 en LibriSpeech test.
- Comprension lexica y sintactica: 83,10% (texto) y 67,41% (habla) en sWUGGY; 70,00% (texto) y 57,50% (habla) en sBLIMP (ZeroSpeech 2021 dev).
- Conmutacion de tarea mediante tokens especiales en una unica secuencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; unicamente ingles.
- Capacidad especial: procesamiento conjunto de texto y habla discreta con vocabulario compartido.

## Casos de uso

- Transcripcion automatica de audio en ingles: el modelo puede actuar como sistema ASR integrado en un pipeline ESPnet, transcribiendo grabaciones de voz con 5,9% WER en condiciones de lectura, adecuado para prototipos de subtitulado o notas de voz.
- Sintesis de voz para lectura en voz alta: dado un texto, el modelo genera unidades de habla que un vocoder HiFi-GAN convierte en audio; util para asistentes de lectura o audiolibros de investigacion, siempre que se disponga del vocoder no incluido.
- Modelado de lenguaje de habla discreta: sirve como componente de investigacion para estudiar representaciones linguisticas sobre unidades discretas, comparando perplejidad de habla (34,99) frente a texto (26,05).
- Experimentacion en linguistica computacional: las tareas sWUGGY y sBLIMP permiten medir si el modelo captura conocimiento lexico y sintactico tanto en texto como en habla, con la brecha texto-habla como objeto de estudio.
- Prototipado de sistemas conjuntos habla-texto: al compartir vocabulario, se puede construir un unico pipeline que alterne ASR, TTS y continuacion sin cambiar de modelo, util para demostradores academicos.
- Investigacion en tokenizacion de habla: el modelo sirve para evaluar el Phonological Tokenizer (WavLM-large, k=2000) frente a otras alternativas de cuantizacion de unidades, dado que los resultados estan desglosados por tarea.
- Base para ablaciones con backbone OPT: al estar inicializado desde OPT-1.3B, permite reproducir el efecto del tamano del backbone comparando con la version de 350M del mismo autor.

## Benchmarks y rendimiento

| Tarea | Conjunto de test | Metrica | Valor |
|---|---|---|---|
| ASR | LibriSpeech test-clean + test-other (5.559 utterances) | WER (menor mejor) | 5,9% |
| TTS | 100 utterances aleatorias de LibriTTS test (beam 5, maxlen 1200) | CER Whisper (menor mejor) | 8,1% |
| TTS | misma configuracion | WER Whisper (menor mejor) | 10,0% |
| TTS | misma configuracion | UTMOS (mayor mejor) | 3,87 |
| Speech-unit LM | LibriSpeech test | Perplejidad (menor mejor) | 34,99 |
| Text LM | LibriSpeech test | Perplejidad (menor mejor) | 26,05 |
| sWUGGY (lexico) | ZeroSpeech 2021 dev | Precision texto (mayor mejor) | 83,10% |
| sWUGGY (lexico) | ZeroSpeech 2021 dev | Precision habla (mayor mejor) | 67,41% |
| sBLIMP (sintactico) | ZeroSpeech 2021 dev | Precision texto (mayor mejor) | 70,00% |
| sBLIMP (sintactico) | ZeroSpeech 2021 dev | Precision habla (mayor mejor) | 57,50% |

Nota del autor: el checkpoint posterior de la epoca 14 (no publicado) obtuvo mejor resultado en el mismo conjunto TTS de 100 utterances (CER 2,2% / WER 4,1%) pese a su menor precision de validacion, lo que indica que la calidad TTS no sigue de cerca la precision de validacion. No se han publicado comparaciones numericas frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 5,0 GB en `.pth` (fp32). En inferencia fp32 se necesitan en torno a 5-6 GB solo para pesos; en fp16/bf16, aproximadamente 2,6-3 GB.
- GPU recomendadas: A100, H100, V100 o RTX 3090/4090 para fp16/bf16; una RTX 3090 o 4090 con 24 GB es suficiente para el modelo sin cuantizacion.
- Cabe en GPU de consumo: si. Con 24 GB (RTX 3090, 4090) se ejecuta comodamente incluso en fp32; en GPU de 8-12 GB probablemente sea necesario fp16 o bf16 y gestionar la memoria con cuidado.
- Opciones de despliegue: ESPnet (`espnet2.bin.lm_inference`), receta `run.sh` del repositorio `RuiRuihigh/espnet` rama `voxtlm_v1_v2_experiments`. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponibles.
- Requisito adicional para TTS: el vocoder HiFi-GAN de unidades (entrenado sobre LJSpeech con las mismas unidades fonologicas) no se incluye en el repositorio y es necesario para reconstruir audio desde unidades.

## Comparativa con modelos similares

| Modelo | Parametros | Tareas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxtLM v2 k2000 Bal opt1.3b (este) | 1,3B | ASR, TTS, continuacion texto/habla | no disponible | OPT (no comercial) | HuggingFace + receta ESPnet |
| RuiRuihigh/voxtlm_v2_k2000_Bal_opt350m | ~350M | ASR, TTS, continuacion texto/habla | no disponible | OPT (no comercial) | HuggingFace |
| VoxtLM original (Maiti et al., 2023) | no disponible | ASR, TTS, continuacion texto/habla | no disponible | no disponible | paper arXiv:2309.07937 |

Las cifras de rendimiento de las alternativas no estan disponibles en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Sobreajuste: el autor indica que la perdida de validacion sube a partir de la epoca 8; el checkpoint publicado (epoca 7) es el de mejor validacion, pero la calidad TTS no correlaciona bien con la precision de validacion, lo que complica elegir el mejor punto de forma objetiva.
- Vocoder ausente: el HiFi-GAN de unidades necesario para TTS no se incluye en el repositorio; sin el no se puede generar audio a partir de las unidades.
- Estado del optimizador ausente: `checkpoint.pth` no esta incluido, por lo que reanudar el entrenamiento exigiria reconstruirlo.
- Idiomas: solo ingles. No hay soporte multilingue ni de otras lenguas.
- Contexto: no se documenta la longitud de contexto, lo que limita planificar aplicaciones con secuencias largas.
- Licencia: los pesos derivan de OPT, sujetos a la OPT license, de uso no comercial y solo para investigacion. Se aplican ademas las licencias de los datos de entrenamiento (LibriSpeech, LibriTTS, LibriLight, VCTK) y la del Phonological Tokenizer.
- Uso comercial: restringido por la licencia OPT; no apto para produccion comercial sin revisar la licencia del backbone y de los datos.
- Tareas no verificadas: no hay evidencia publicada de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- TTS medido con Whisper como juez: la inteligibilidad se evalua con un ASR externo (CER/WER), no con evaluacion humana, lo que introduce el sesgo del modelo evaluador.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF ni GPTQ, lo que obliga a cuantizar por cuenta propia si se busca reducir memoria.

## Enlaces

- HuggingFace: https://huggingface.co/RuiRuihigh/voxtlm_v2_k2000_Bal_opt1.3b
- Version de 350M del mismo autor: https://huggingface.co/RuiRuihigh/voxtlm_v2_k2000_Bal_opt350m
- Receta ESPnet (rama voxtlm_v1_v2_experiments): https://github.com/RuiRuihigh/espnet/tree/voxtlm_v1_v2_experiments/egs2/voxtlm_v2
- Paper VoxtLM: https://arxiv.org/abs/2309.07937
- Paper del Phonological Tokenizer: https://arxiv.org/abs/2601.19781
- Modelo Phonological Tokenizer (Sony): https://huggingface.co/Sony/Phonological-Tokenizer
- Licencia OPT: https://github.com/facebookresearch/metaseq/blob/main/projects/OPT/MODEL_LICENSE.md
