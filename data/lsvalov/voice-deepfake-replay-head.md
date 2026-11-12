# lsvalov/voice-deepfake-replay-head

## Resumen

`voice-deepfake-replay-head` es una cabeza clasificadora (head) disenada para detectar ataques de repeticion (replay attacks) en audio de voz: determina si una grabacion se reprodujo a traves de un altavoz y se volvio a capturar con un microfono. No es un modelo autonomo, sino el componente de capa 3 de una solucion mayor de deteccion de deepfakes de voz denominada Voice Deepfake, que descarga este checkpoint al arrancar fijado por revision y hash SHA-256. Lo desarrolla el usuario de Hugging Face `lsvalov`.

Tecnicamente, la cabeza consume los estados ocultos de las 24 capas del transformer del encoder congelado `facebook/wav2vec2-xls-r-300m` (revision `1a640f32`) sobre ventanas de 4 segundos de audio mono a 16 kHz. La arquitectura interna combina una suma ponderada por softmax aprendida de las capas del encoder, seguida de un bloque AASIST y una capa final de dos logits, donde el indice 1 corresponde a "no reproducido". El encoder no se incluye en este repositorio: se descarga por separado.

Su relevancia es acotada pero concreta: cubre una de las tres capas de defensa frente a ataques de suplantacion de voz (los replay attacks son uno de los vectores mas accesibles en fraude telefonico y verificacion biometrica). El modelo se entrena sobre ASVspoof 2019 PA y EchoFake, y se publica bajo licencia MIT, lo que facilita su inspeccion y reutilizacion experimental, aunque el autor advierte explicitamente de que no es un control de seguridad certificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza clasificadora sobre encoder wav2vec2: suma ponderada por softmax de capas + AASIST + 2 logits |
| Parametros totales | no disponible (solo se publica el checkpoint de la cabeza; el encoder base tiene 300M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 4 s a 16 kHz mono |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el encoder base xls-r es multilingue, pero la cabeza no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | `replay-head.pt`, checkpoint `vdd-head-v1` (dict de tensores y metadatos, cargable con `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

La cabeza opera sobre el encoder `facebook/wav2vec2-xls-r-300m` congelado. Para cada ventana de 4 s extrae los estados ocultos de las 24 capas del transformer y aplica una suma ponderada con pesos aprendidos mediante softmax, lo que permite al modelo seleccionar dinamicamente que niveles de representacion son mas informativos para distinguir audio reproducido de audio genuino. Sobre esa representacion agregada se aplica un bloque AASIST (arquitectura de anti-spoofing basada en atencion sobre grafos) y una capa de clasificacion de dos logits. El checkpoint se distribuye como un diccionario plano de tensores y metadatos; el codigo de carga y de entrenamiento reside en el blueprint de la solucion (rutas `app/deepfake_detection/detectors/heads.py` y `app/deepfake_detection/training/`).

El entrenamiento usa la particion de train de ASVspoof 2019 physical access (PA) y el split de train de EchoFake (revision `4d8bd5f8`), reservando las particiones de desarrollo de ambos conjuntos para seleccion de modelo. Se emplea batch de 32, optimizador AdamW con learning rate 1e-4 y weight decay 1e-4, entropia cruzada con pesos de clase y una ventana aleatoria de 4 s por clip, con parada temprana sobre el equal error rate de desarrollo. El entrenamiento se ejecuto en una unica GPU AMD Instinct MI300X bajo ROCm. No se documentan innovaciones como decodificacion especulativa ni atencion lineal; la innovacion principal es el esquema de agregacion aprendida de capas sobre un encoder congelado.

## Capacidades

- Deteccion binaria de replay attacks: clasifica si un clip de voz fue reproducido por un altavoz y regrabado (logit 1 = no reproducido).
- Agregacion aprendida de representaciones: selecciona dinamicamente informacion de las 24 capas del encoder mediante pesos softmax.
- Procesamiento de ventanas de 4 s a 16 kHz mono, con ventana aleatoria durante el entrenamiento.
- Integracion como capa de un pipeline mayor de anti-spoofing (Voice Deepfake), descargada y verificada por revision y SHA-256.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la clasificacion descrita.
- Capacidades multilingues: no declaradas para la cabeza; hereda del encoder base solo en la medida en que este generalice.

## Casos de uso

- Verificacion biometrica telefonica: como capa adicional en un sistema de autenticacion por voz, para descartar que la grabacion presentada sea una reproduccion de otra persona capturada con un altavoz y un microfono, reduciendo el riesgo de replay attacks en banca o administracion.
- Filtrado en pipelines de atencion al cliente: preprocesar el audio entrante en un contact center para marcar posibles grabaciones reproducidas antes de pasarlas a un sistema de reconocimiento de locutor o de transcripcion.
- Evaluacion de conjuntos de datos de voz: auditar corpus de habla recopilados por terceros y detectar muestras que hayan podido generarse mediante reproduccion fisica en lugar de captura directa.
- Investigacion en anti-spoofing: usar la cabeza como baseline reproducible (MIT, checkpoint abierto) para comparar estrategias de agregacion de capas o de arquitecturas AASIST sobre ASVspoof 2019 PA.
- Demostracion docente de seguridad en voz: ilustrar en un curso o taller como se descompone un sistema de deteccion de deepfakes en capas (sintesis, replay, etc.) usando el blueprint y la muestra `samples/replay.wav`.
- Deteccion de fraude en verificacion de identidad remota: añadir una senal adicional al scoring de un proceso KYC por video o audio, donde el atacante puede reproducir la voz de la victima desde un dispositivo.
- Analisis forense de audio: como indicio complementario (nunca concluyente) en la revision de grabaciones aportadas como prueba, dado que el autor advierte de que un resultado negativo significa "no detectado", no prueba de audio en directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la seleccion de modelo se hizo por equal error rate en las particiones de desarrollo de ASVspoof 2019 PA y EchoFake, pero no se proporcionan los valores numericos alcanzados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para la cabeza en si (es un clasificador pequeno); el coste dominante es el encoder `wav2vec2-xls-r-300m` congelado, que requiere descargarse y ejecutarse aparte.
- GPU recomendadas: no especificadas por el autor; el entrenamiento se realizo en una AMD Instinct MI300X bajo ROCm.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el encoder base de 300M es en principio ejecutable en GPUs de consumo con cuantizacion o en CPU, pero no se documenta para esta cabeza.
- Opciones de despliegue: carga via `torch.load(..., weights_only=True)` e integracion en el blueprint de Voice Deepfake; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM y no aplican a este clasificador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lsvalov/voice-deepfake-replay-head` | no disponible (cabeza; encoder base 300M) | ventana de 4 s | Deteccion de replay attacks | MIT | Hugging Face |
| AASIST (arquitectura de referencia) | no disponible | no disponible | Anti-spoofing general (incluye replay) | no disponible | Codigo publico (referencia en la model card) |
| `facebook/wav2vec2-xls-r-300m` | 300M | no disponible | Representaciones de voz auto-supervisadas (no clasifica) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a proposito, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un control de seguridad certificado; el autor lo presenta como herramienta de demostracion y evaluacion dentro del blueprint.
- Los replays de ASVspoof 2019 PA son simulados (salas y altavoces modelados) y los de EchoFake son grabaciones reales de un conjunto limitado de dispositivos; la precision cae con altavoces, microfonos y salas distintos de los de entrenamiento.
- Algunas grabaciones genuinas se marcan como reproducidas (falsos positivos reconocidos por el autor).
- Un resultado negativo significa "no detectado", no prueba de que el audio sea en directo.
- Sesgos conocidos: no documentados mas alla de la dependencia de las condiciones acusticas de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo equivalente es la clasificacion erronea.
- Limitaciones de contexto o idioma: ventana fija de 4 s; no se declaran idiomas soportados.
- Licencia MIT: permite uso comercial y modificacion, pero el encoder base `facebook/wav2vec2-xls-r-300m` se distribuye aparte y su licencia debe verificarse por separado; los datos de entrenamiento (ASVspoof 2019 bajo ODC-By 1.0 y EchoFake bajo MIT) imponen obligaciones de atribucion.
- Para produccion: requiere integrar el encoder, gestionar la ventana de 4 s y verificar el checkpoint por revision y SHA-256 como hace el blueprint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lsvalov/voice-deepfake-replay-head
- Encoder base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Dataset EchoFake: https://huggingface.co/datasets/EchoFake/EchoFake
- ASVspoof 2019: https://datashare.ed.ac.uk/handle/10283/3336
