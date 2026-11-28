# lab260/Spectra-AASIST3

## Resumen

Spectra-AASIST3 es un modelo de deteccion de audio falsificado (anti-spoofing) desarrollado por el usuario lab260 y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo generativo de lenguaje, sino un clasificador binario de audio cuyo objetivo es distinguir voz genuina (bona fide) de voz sintetica o convertida, un problema critico para la seguridad de sistemas de verificacion de locutor y para la deteccion de deepfakes de voz.

Arquitectura y tamano: combina un front-end auto-supervisado wav2vec 2.0 (XLS-R-300m) con un back-end AASIST mejorado con Kolmogorov-Arnold Networks (KAN-AASIST). El checkpoint en safetensors declara 319.051.189 parametros totales y el repositorio ocupa 2,7 GB e incluye pesos en formato ONNX y safetensors. La entrada es una forma de onda de voz cruda y la salida es una puntuacion donde valores mas altos indican mayor probabilidad de audio genuino.

Su relevancia actual radica en los resultados reportados en la model card sobre un conjunto amplio de benchmarks de anti-spoofing (ASVspoof 2019/2021/5, ADD, InTheWild, SONAR, CVoiceFake, entre otros), con tasas de error igual a error (EER) muy bajas en varios de ellos. La disponibilidad de pesos en ONNX facilita su integracion en pipelines de produccion orientados a inferencia de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (XLS-R-300m) como front-end + AASIST con KAN (KAN-AASIST) como back-end |
| Parametros totales | 319.051.189 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; opera sobre formas de onda de voz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo sigue un diseno en dos etapas. El front-end es wav2vec 2.0 en su variante XLS-R-300m, un codificador auto-supervisado preentrenado sobre habla multilingue que transforma la forma de onda cruda en representaciones latentes. El back-end es una variante de AASIST (Audio Anti-Spoofing using Integrated Spectro-Temporal Graph Attention Networks) en la que se incorporan capas de Kolmogorov-Arnold Networks (KAN), una familia de redes con funciones de activacion aprendibles en los bordes que sustituye las activaciones fijas tradicionales. La combinacion busca mejorar la capacidad de discriminacion entre artefactos de sintesis y caracteristicas acusticas genuinas.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens o horas de audio empleadas en el entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos, RLHF/DPO (no aplicables a este tipo de tarea de clasificacion) o estrategias de decodificacion especulativa. La model card no documenta el proceso de entrenamiento mas alla de la descripcion arquitectonica.

## Capacidades

- Deteccion de audio falsificado: clasifica una forma de onda de voz como genuina o sintetica devolviendo una puntuacion (mayor = mas bona fide).
- Anti-spoofing para verificacion de locutor: pensado para integrarse como contramedida en sistemas ASV (automatic speaker verification).
- Deteccion de deepfakes de voz generados por TTS y conversion de voz.
- Evaluacion sobre multiples dominios y corpus: la model card reporta resultados en mas de veinte benchmarks distintos, lo que sugiere capacidad de generalizacion entre dominios y condiciones.
- Soporte multilingue: aunque no se documenta explicitamente la lista de idiomas, varios de los benchmarks evaluados incluyen corpus en arabe (ArAD, PyAra), chino (CD-ADD), espanol (HABLA) y otros, lo que indica robustez en distintos idiomas.
- Inferencia en formato ONNX: permite despliegue optimizado en entornos de produccion.
- No dispone de tool calling, function calling, razonamiento multi-paso ni generacion de texto: es un clasificador de audio, no un LLM.

## Casos de uso

- Verificacion de locutor en banca telefonica: el modelo actua como contramedida anti-spoofing antes de autenticar al usuario, filtrando intentos de suplantacion mediante voz sintetica o conversion de voz.
- Deteccion de deepfakes en medios y periodismo: analisis de fragmentos de audio recibidos para verificar autenticidad antes de su publicacion o difusion.
- Moderacion de contenido en plataformas: clasificacion automatica de audios subidos por usuarios para detectar voces generadas por IA y aplicar politicas de contenido.
- Control de acceso biometrico por voz: integracion en sistemas de autenticacion por voz como capa de seguridad adicional frente a ataques de presentacion y ataques logicos.
- Monitorizacion de centros de atencion al cliente: deteccion de llamadas fraudulentas generadas con TTS para prevencion de fraude.
- Evaluacion de sistemas TTS y de conversion de voz: uso del modelo como discriminador de referencia en pipelines de investigacion para medir la naturalidad y detectabilidad de audios generados.
- Investigacion en seguridad de voz: banco de pruebas para estudiar la robustez de contramedidas anti-spoofing frente a nuevos ataques de sintesis.

## Benchmarks y rendimiento

La model card reporta los siguientes valores de EER (tasa de error igual a error; menor es mejor) y, en algunos casos, 1-SRR (tasa de rechazo de locutor, mayor es mejor). Los datos proceden de la model card del autor y de la arena de evaluacion SpeechAntiSpoofingArena.

| Benchmark | Metrica | Valor |
|---|---|---|
| CD-ADD | EER | 0,00 % |
| SONAR | EER | 0,44 % |
| CVoiceFake_small | EER | 0,51 % |
| CFAD | EER | 0,71 % |
| LibriSeVoc | EER | 0,83 % |
| ASVspoof2019_LA | EER | 0,97 % |
| InTheWild | EER | 1,20 % |
| ASVspoof2021_DF | EER | 4,30 % |
| ASVspoof2021_LA | EER | 4,38 % |
| ASVspoof5 | EER | 15,09 % |
| DeepVoice | EER | 3,62 % |
| ArAD | EER | 0,00 % |
| DECRO | EER | 0,78 % |
| J-SPAW_LA | EER | 0,00 % |
| ODSS | EER | 0,25 % |
| HABLA | EER | 0,03 % |
| DFADD | EER | 0,40 % |
| PyAra | EER | 0,02 % |
| XMAD | EER | 0,03 % |
| LRLspoof | 1-SRR | 2,32 % |
| ADD22_eval_31 | EER | 1,67 % |
| ADD2023_track12_test_r1 | EER | 6,64 % |
| EmoFake_test | EER | 0,29 % |
| EmoSpoofTTS | 1-SRR | 0,06 % |

No se han publicado en la informacion disponible comparaciones directas con otros modelos en forma de tabla comparativa; los valores anteriores son los reportados por el autor para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 319 millones de parametros, en precision FP32 los pesos ocupan aproximadamente 1,3 GB; en FP16 unos 0,64 GB; en INT8 unos 0,32 GB. A ello hay que sumar el coste de activaciones y buffers de audio, no cuantificado en la model card.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, asi como para GPUs de datacenter (A100, H100) si se requiere alto throughput.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs consumer modernas con al menos 4-6 GB de VRAM, aunque el dato exacto no esta documentado.
- Opciones de despliegue: el repositorio incluye pesos en ONNX, lo que permite usar ONNX Runtime para inferencia optimizada en CPU y GPU. Tambien se dispone de safetensors para cargar con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLMs, no aplicables a este clasificador).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos comparativos con otros modelos de anti-spoofing (por ejemplo, AASIST original, RawNet2, WavLM-based contramedidas) en terminos de parametros, contexto, rendimiento o licencia. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Spectra-AASIST3 | 319.051.189 | no disponible | Apache 2.0 | Hugging Face (safetensors, ONNX) | Ver tabla de benchmarks |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo es un clasificador binario de audio; no genera texto ni mantiene conversaciones, por lo que no debe emplearse como LLM.
- Riesgo de falsos positivos y falsos negativos: aunque las EER reportadas son bajas en muchos benchmarks, en ASVspoof5 la EER es del 15,09 %, lo que indica degradacion en determinadas condiciones o ataques.
- La model card no documenta sesgos conocidos por idioma, genero, edad o acento; los resultados por subgrupo no estan disponibles.
- No se especifica la lista de idiomas soportados ni el rendimiento por idioma, mas alla de los corpus evaluados.
- La robustez frente a ataques no vistos (zero-shot) no esta cuantificada de forma independiente; los benchmarks reportados son los del autor.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda revisar los terminos exactos del repositorio y de los corpus de evaluacion empleados, que pueden tener licencias propias.
- Para produccion, es recomendable validar el modelo sobre el dominio concreto de despliegue y considerar umbrales de decision calibrados, dado que la salida es una puntuacion continua.
- No se documentan requisitos de preprocesado (frecuencia de muestreo, normalizacion, duracion de audio) en la informacion disponible; es imprescindible consultar la model card y el codigo asociado antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lab260/Spectra-AASIST3
- SpeechAntiSpoofingArena (evaluacion): https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=spectra-aasist3
- Repositorio de codigo/checkpoint: el enlace indicado en la model card aparece truncado en la informacion disponible (referencia a `lab260/Spec...`); no se puede confirmar la URL completa.
- Paper de AASIST: no disponible en la informacion proporcionada.
- Paper de wav2vec 2.0 / XLS-R: no disponible en la informacion proporcionada.
- Paper de Kolmogorov-Arnold Networks (KAN): no disponible en la informacion proporcionada.
