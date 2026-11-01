# mikaelaehunter/whisper-tiny_korean_english

## Resumen

Whisper tiny korean_english es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, publicado por el usuario mikaelaehunter en HuggingFace. El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante "tiny", con 37.760.640 parametros totales, y se ha entrenado sobre el dataset denominado korean_english, presumiblemente orientado a transcripcion de audio con contenido en coreano e ingles. La model card no aporta informacion adicional sobre la composicion del dataset ni sobre los usos previstos.

Se trata de un modelo de nicho, con apenas 50 descargas y sin likes en el momento de la consulta, lo que sugiere un experimento academico o personal mas que un artefacto listo para produccion. Su relevancia practica es limitada: sirve como ejemplo de fine-tuning de Whisper tiny para dominios bilingues concretos y como punto de partida para quien necesite un modelo ASR extremadamente ligero (menos de 40 millones de parametros, repo de 0,6 GB).

La licencia Apache 2.0 permite uso comercial y modificacion, pero la ausencia de documentacion sobre datos de entrenamiento, condiciones de evaluacion y limitaciones hace recomendable una validacion exhaustiva antes de cualquier despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (declarado en la model card); el dataset se llama korean_english, lo que sugiere coreano e ingles, pero no se documenta oficialmente |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder disenado para reconocimiento automatico del habla, que procesa espectrogramas mel de audio y genera tokens de texto. Whisper tiny es la variante mas pequena de la familia Whisper, con unos 39 millones de parametros y una ventana de audio estandar de 30 segundos.

El fine-tuning se realizo con el Trainer de HuggingFace sobre el dataset korean_english. Los hiperparametros documentados son: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. Se registran dos puntos de evaluacion: en el paso 1000 (epoch 1,0173) la perdida de validacion fue 0,2163 con un WER de 9,9756, y en el paso 2000 (epoch 2,0346) la perdida bajo a 0,2030 y el WER a 9,7805. No se documenta el volumen de datos, la composicion del dataset ni si hubo etapas de RLHF o DPO (poco habituales en ASR).

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) mediante el pipeline `automatic-speech-recognition` de transformers.
- Entrenado sobre un dataset bilingue coreano-ingles segun el nombre del dataset, aunque la model card solo declara oficialmente el idioma ingles.
- Generacion de transcripciones con marcas de tiempo (capacidad heredada de Whisper, aunque no se verifica en la model card).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio mas alla de la entrada de audio propia del ASR.
- Capacidad multilingue limitada al par coreano-ingles segun la evidencia disponible; no hay documentacion de otros idiomas.

## Casos de uso

- Transcripcion de reuniones bilingues coreano-ingles: el modelo puede transcribir audio con alternancia de idiomas en entornos de equipos internacionales, aunque su tamano tiny limita la precision en audio ruidoso.
- Subtitulado automatico de contenido audiovisual de bajo coste: al ser un modelo de 37 millones de parametros, se puede ejecutar en CPU o GPUs modestas para generar subtitulos preliminares que luego se revisan manualmente.
- Prototipado rapido de pipelines ASR: util como baseline para comparar con modelos mayores antes de invertir en infraestructura, gracias a su reducido tamano y a la licencia Apache 2.0.
- Aplicaciones embebidas o de borde: su huella de memoria (repo de 0,6 GB, pesos en safetensors) permite desplegarlo en dispositivos con recursos limitados para transcripcion de comandos de voz.
- Investigacion academica sobre fine-tuning de Whisper: sirve como ejemplo reproducible de ajuste con hiperparametros documentados (learning rate, scheduler, pasos) para estudiar el efecto del entrenamiento en datasets bilingues pequenos.
- Preprocesado de audio para analitica: transcripcion masiva de grabaciones coreano-ingles para su posterior indexacion o busqueda, aceptando la tasa de error documentada (WER de 9,78 sobre el conjunto de test propio).

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | korean_english (split test) | WER | 9,7805 |
| Automatic Speech Recognition | korean_english (validacion, paso 1000) | WER | 9,9756 |
| Automatic Speech Recognition | korean_english (validacion, paso 2000) | WER | 9,7805 |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otros modelos (MMLU, HumanEval, GSM8K u otros no aplican a un modelo ASR).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (37,7 millones de parametros en fp32 equivalen a unos 150 MB de pesos); con cuantizacion a int8 se reduce a unos 40 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden ejecutar el modelo con holgura. Tambien cabe en CPU.
- Cabe en cualquier GPU consumer y en la mayoria de dispositivos de borde; no requiere A100 ni H100.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), potencialmente llama.cpp no aplica (no es un modelo de lenguaje), pero si es compatible con endpoints de HuggingFace (`endpoints_compatible`). No se documenta soporte explicito de vLLM ni TGI para ASR.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-tiny_korean_english | 37,7 M | 30 s (heredado de Whisper) | en declarado; coreano-ingles por dataset | apache-2.0 | HuggingFace |
| openai/whisper-tiny | 39 M aprox. | 30 s | multilingue (99 idiomas) | apache-2.0 | HuggingFace |
| openai/whisper-base | 74 M aprox. | 30 s | multilingue | apache-2.0 | HuggingFace |
| openai/whisper-small | 244 M aprox. | 30 s | multilingue | apache-2.0 | HuggingFace |

La comparativa se limita a la familia Whisper porque no se dispone de datos de rendimiento de alternativas especificas para el par coreano-ingles en la informacion proporcionada. El fine-tuning no documenta mejoras frente al modelo base en benchmarks publicos, por lo que la comparacion de rendimiento queda pendiente de validacion independiente.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed") sobre descripcion, usos previstos y datos de entrenamiento.
- El WER de 9,78 se ha medido sobre un dataset propio (korean_english) no publico ni descrito; no es comparable con resultados de benchmarks estandar como LibriSpeech o Common Voice.
- El modelo declara oficialmente solo el idioma ingles, aunque el nombre del dataset sugiere coreano e ingles; la cobertura real de coreano no esta verificada.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos Whisper tiny, especialmente en audio con ruido, acentos marcados o vocabulario tecnico.
- Sesgos desconocidos: al no documentarse la composicion del dataset de entrenamiento, no se pueden evaluar sesgos demograficos, dialectales o de genero.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentacion sobre procedencia de los datos de entrenamiento traslada al usuario la responsabilidad de validar el cumplimiento normativo.
- El modelo tiene 50 descargas y 0 likes, sin validacion de la comunidad; no se recomienda para produccion sin una evaluacion propia sobre datos representativos del dominio objetivo.
- Limitacion de contexto de audio: como todo Whisper tiny, procesa ventanas de 30 segundos; audios mas largos requieren segmentacion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mikaelaehunter/whisper-tiny_korean_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
