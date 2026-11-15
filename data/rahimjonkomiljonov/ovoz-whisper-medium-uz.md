# rahimjonkomiljonov/ovoz-whisper-medium-uz

## Resumen

Ovoz Whisper Medium para uzbeko es un ajuste fino del modelo `openai/whisper-medium` (763,9 millones de parametros) orientado a la transcripcion de voz en uzbeko con salida en alfabeto latino. Lo desarrolla rahimjonkomiljonov y emplea LoRA (Low-Rank Adaptation) sobre el checkpoint base, con los pesos del adaptador fusionados en el modelo final, de modo que se carga como cualquier checkpoint de Whisper. La licencia es Apache 2.0 y el modelo base tambien lo es, lo que facilita su uso comercial con las cautelas habituales.

El problema que aborda es concreto: Whisper, aun siendo multilingue, rinde muy mal en uzbeko de serie. Segun la propia model card, Whisper small y large-v3 alcanzan entre un 90 % y un 163 % de tasa de error de palabras (WER) sobre los datos de evaluacion del autor, lo que los hace inutilizables. Este ajuste baja el WER al 18,2 % en Common Voice y al 27,1 % en FLEURS para habla leida limpia, si bien en habla conversacional propia de cuatro hablantes sube al 47,8 %.

La relevancia actual esta en que cubre un idioma de bajos recursos con un modelo de tamano medio (763,9 M de parametros, contexto de audio de 30 segundos por ventana) que cabe en GPU de consumo y se puede exportar a CTranslate2 para inferencia eficiente en CPU. No obstante, el propio autor lo posiciona como generador de borradores que requieren revision humana, no como transcriptor definitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) con adaptacion LoRA fusionada |
| Parametros totales | 763.857.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (limite nativo de Whisper); audio mas largo requiere troceado |
| Tipos de cuantizacion | float32 (pesos originales), float16 (recomendado en GPU), int8 (exportacion CTranslate2 para CPU) |
| Idiomas soportados | uzbeko (uz), unicamente alfabeto latino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); exportacion CTranslate2 en repositorio complementario; adaptador LoRA en carpeta `adapter/` |

## Arquitectura y entrenamiento

La base es la arquitectura estandar de Whisper medium: un transformer encoder-decoder con atencion completa, disenado para tareas de reconocimiento automatico del habla y traduccion. Sobre ese checkpoint se aplico un ajuste fino con LoRA, y los pesos del adaptador se fusionaron posteriormente en el modelo, de forma que la inferencia no requiere cargar PEFT por separado. El resultado conserva la estructura y el tamano del modelo original.

El entrenamiento utilizo 18.454 clips (31,0 horas) de dos fuentes: Mozilla Common Voice Scripted Speech 27.0 en uzbeko (15.515 clips, 1.065 hablantes, maximo 500 clips por hablante, 20,9 horas, licencia CC0 1.0) y Google FLEURS en uzbeko (2.939 clips, 10,1 horas, licencia CC BY 4.0). La particion de Common Voice se hizo por hablante para evitar filtraciones entre entrenamiento, validacion y test. El modelo se ajusto sin marcas de tiempo y produce texto en minusculas sin puntuacion. No se documentan fases de RLHF ni DPO; se trata de un ajuste supervisado sobre transcripciones.

## Capacidades

- Transcripcion de voz en uzbeko a texto en alfabeto latino, en minusculas y sin puntuacion.
- Salida coherente con la ortografia uzbeka: usa U+02BB para oʻ y gʻ, y U+02BC para el tutuq (ʼ).
- Nunca genera texto en cirilico (0 salidas cirilicas en todos los conjuntos de prueba del autor), por lo que el uzbeko cirilico no esta soportado.
- No produce marcas de tiempo, ya que se ajusto sin ellas.
- Los numeros pueden aparecer como digitos o como palabras.
- Compatible con el pipeline `automatic-speech-recognition` de transformers y con faster-whisper (CTranslate2).
- Soporta filtro VAD (`vad_filter=True`) en faster-whisper, recomendado para uso real.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Generacion de borradores de transcripcion para revision humana: el modelo produce texto que un revisor corrige; adecuado para contenido donde el error no causa dano y se puede auditar, con un WER del 18,2 % en habla leida limpia.
- Investigacion y benchmarking en ASR para uzbeko: sirve como linea base reproducible frente a Whisper small y large-v3, que segun el autor rinden entre 90 % y 163 % de WER en los mismos datos.
- Punto de partida para nuevos ajustes finos: el adaptador LoRA esta disponible en `adapter/` para fusionarlo en una copia propia de `openai/whisper-medium` y continuar el entrenamiento con datos adicionales.
- Funciones de voz con revision posterior: integracion en aplicaciones donde el usuario ve y corrige el texto antes de guardarlo, aprovechando la salida en alfabeto latino y el formato consistente.
- Despliegue en CPU con bajo coste: la exportacion int8 de CTranslate2 permite ejecutar el modelo en servidores sin GPU, con la salvedad de que la precision medida se obtuvo sin VAD y con clips de hasta 30 segundos.
- Procesamiento por lotes de audios cortos: troceando el audio en ventanas de 30 segundos con `chunk_length_s=30`, se pueden transcribir grabaciones mas largas, aunque el comportamiento mas alla de 30 segundos no esta probado.
- Analisis de habla leida en conjuntos como Common Voice o FLEURS: el modelo esta evaluado especificamente en esos dominios, por lo que es adecuado para tareas de investigacion sobre esos corpus.

## Benchmarks y rendimiento

| Conjunto de evaluacion | WER | CER | Notas |
|---|---|---|---|
| Common Voice (test reservado) | 18,2 % | no disponible | Sin VAD; con VAD, 20,8 % en 600 clips |
| FLEURS | 27,1 % | no disponible | Sin VAD; con VAD, 27,8 % en 600 clips |
| Grabaciones propias conversacionales (4 hablantes) | 47,8 % | no disponible | Habla conversacional, aproximadamente la mitad de palabras erroneas |
| Whisper small (referencia) | 90 %–163 % | no disponible | Sobre los mismos datos, segun la model card |
| Whisper large-v3 (referencia) | 90 %–163 % | no disponible | Sobre los mismos datos, segun la model card |

No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que no son aplicables a un modelo ASR. La model card no desglosa CER ni resultados por subconjunto.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB en float16 para los pesos (763,9 M de parametros), mas memoria para activaciones y buffers de audio; en float32, alrededor de 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para float16; RTX 3060, RTX 4090, A100 y H100 son validas. El modelo es pequeno para su categoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas; tambien en CPU mediante la exportacion int8 de CTranslate2.
- Opciones de despliegue: pipeline de transformers (`automatic-speech-recognition`), faster-whisper con CTranslate2 (float16 en GPU, int8 en CPU). No se documentan integraciones con vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card solo indica que la exportacion float16 de faster-whisper reprodujo el texto del benchmark en 10 de 10 clips sin VAD.
- Nota de plataforma: en Windows, CTranslate2 requiere las librerias CUDA incluidas en la carpeta `lib` de PyTorch en el DLL path (ver `inference/cuda_dlls.py` en el repositorio del proyecto).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER en uzbeko (datos del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ovoz-whisper-medium-uz | 763,9 M | 30 s por ventana | 18,2 % (Common Voice), 27,1 % (FLEURS) | Apache 2.0 | Hugging Face y exportacion CTranslate2 |
| openai/whisper-medium | 769 M | 30 s por ventana | no medido en la model card para uzbeko | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s por ventana | 90 %–163 % (rango citado) | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | 1.550 M | 30 s por ventana | 90 %–163 % (rango citado) | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de otros ajustes finos para uzbeko.

## Limitaciones y advertencias

- El propio autor advierte que en habla conversacional el WER alcanza el 47,8 %, por lo que la salida debe tratarse como borrador sujeto a revision humana.
- No debe usarse en contextos donde un error de transcripcion pueda causar dano: legal, medico, seguridad o pruebas.
- No debe emplearse para identificar o perfilar hablantes, ni para transcribir a personas que no hayan consentido la grabacion.
- No soporta uzbeko en cirilico: nunca genera caracteres cirilicos.
- No produce marcas de tiempo.
- El comportamiento con audio de mas de 30 segundos no esta probado; se recomienda trocear previamente.
- Se debe forzar el idioma a uzbeko (`language="uz"`); no se documenta el comportamiento con deteccion automatica de idioma.
- La precision medida se obtuvo sin VAD; con VAD, transcripciones individuales pueden variar ligeramente aunque el WER agregado se mantiene estable.
- Riesgo de alucinacion no cuantificado en la informacion disponible; en ASR este riesgo se manifiesta como texto inventado en segmentos sin voz, por lo que se recomienda `vad_filter=True` en uso real.
- Sesgos no documentados: no se detallan sesgos por acento, edad o genero mas alla de la composicion de hablantes de Common Voice.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento incluyen FLEURS (CC BY 4.0), que exige atribucion; Common Voice prohibe re-alojar el dataset e identificar hablantes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rahimjonkomiljonov/ovoz-whisper-medium-uz
- Exportacion CTranslate2: https://huggingface.co/rahimjonkomiljonov/ovoz-whisper-medium-uz-ct2
- Repositorio del proyecto (codigo, experimentos y documentacion): https://github.com/rahimjonkomiljonov/ovoz
- Modelo base: https://huggingface.co/openai/whisper-medium
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Mozilla Common Voice: https://mozilladatacollective.com
- Paper de Whisper (arXiv:2212.04356): https://arxiv.org/abs/2212.04356
- Paper de Robust Speech Recognition via Large-Scale Weak Supervision (arXiv:2205.12446): https://arxiv.org/abs/2205.12446
- Paper de LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
