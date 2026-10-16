# enconvo/avatar-lipsync-1-coreml

## Resumen

Avatar Lip Sync 1 es una conversión a Core ML del modelo LAM Audio2Expression (a través del proyecto intermedio wav2arkit_cpu) que genera pesos de blendshapes ARKit a partir de audio de voz. Lo publica el autor `enconvo` y lo utiliza la aplicación Enconvo para Mac para animar los labios de un avatar sincronizados con la voz del usuario. El modelo resuelve una tarea concreta: convertir una ventana corta de audio en una secuencia de pesos de blendshapes faciales que un motor de renderizado 3D puede aplicar directamente.

El artefacto es compacto: un único archivo `Lam.mlmodelc` de 72 MB que recibe 2 segundos de audio mono a 16 kHz (tensor Float16 `[1, 32000]`) y devuelve 60 fotogramas de pesos de blendshapes a 30 fps (tensor Float16 `[1, 60, 52]`). No es un modelo de lenguaje ni un generador de texto: es un modelo de audio a expresión facial, orientado a inferencia local en Apple silicon.

Su relevancia radica en que empaqueta una arquitectura de investigación (wav2vec2 más el decodificador de LAM Audio2Expression) en un formato optimizado para despliegue en macOS 14 o superior, con un coste de inferencia bajo: aproximadamente 11 ms por ventana de 2 segundos en CPU y GPU de un M1 Max. Está pensado para integrarse en aplicaciones de avatar en tiempo real, no para tareas generales de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; pipeline de audio a blendshapes a partir del codificador facebook/wav2vec2-base-960h y del modelo 3DAIGC/LAM_audio2exp |
| Parametros totales | no disponible (el artefacto Core ML cuantizado ocupa 72 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; procesa ventanas de audio de 2 s (32.000 muestras a 16 kHz) |
| Tipos de cuantizacion | pesos palettizados con k-means de 6 bits; computo en float16 |
| Idiomas soportados | no disponible; el codificador base (wav2vec2-base-960h) esta entrenado con habla en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlmodelc`), Float16 |

## Arquitectura y entrenamiento

El modelo deriva de LAM Audio2Expression (repositorio `3DAIGC/LAM_Audio2Expression`), convertido a Core ML mediante el proyecto `myned-ai/wav2arkit_cpu`. La cadena declarada como `base_model` incluye tres componentes: `facebook/wav2vec2-base-960h` (codificador de voz basado en transformer, entrenado con 960 horas de habla en ingles), `3DAIGC/LAM_audio2exp` (modelo de audio a expresión) y `myned-ai/wav2arkit_cpu` (adaptación que produce pesos de blendshapes ARKit). No se detallan en la información disponible ni la composición exacta del dataset de entrenamiento, ni el número de tokens o horas usados, ni si hubo etapas de ajuste fino con RLHF o DPO.

La innovación principal de esta ficha es el propio proceso de empaquetado y optimización para hardware Apple. Los pesos se almacenan palettizados con k-means de 6 bits y se ejecutan con computo en float16, lo que reduce el tamaño del artefacto a 72 MB. El modelo debe cargarse con las unidades de computo de CPU y GPU; al ejecutarlo en el Neural Engine la salida se desvía respecto al modelo original, por lo que se desaconseja ese backend. La salida son 52 pesos de blendshapes (el conjunto estándar de ARKit) a 30 fps, alineados con las convenciones de animación facial de Apple.

## Capacidades

- Generacion de pesos de blendshapes ARKit (52 canales) a partir de audio de voz, a 30 fps.
- Sincronizacion labial (lip-sync) y expresion facial basica derivada del habla.
- Entrada de audio mono a 16 kHz en ventanas de 2 segundos.
- Inferencia local en dispositivo (on-device) en Apple silicon, sin dependencia de servicios en la nube.
- No soporta tool calling, function calling ni uso como agente.
- No dispone de modo de razonamiento, vision, generacion de texto ni otras capacidades de los modelos de lenguaje.
- Capacidad multilingue: no confirmada; el codificador base se entreno con habla en ingles.

## Casos de uso

- Animacion de avatares en videollamadas: el modelo convierte la voz del usuario en movimientos de labios en tiempo real, con ~11 ms por ventana de 2 s, adecuado para integrarse en aplicaciones de reunion con avatar en macOS.
- Asistentes virtuales con cara: un asistente de voz puede mostrar un avatar cuyo rostro se sincroniza con la respuesta hablada, ejecutandose localmente en el Mac del usuario.
- VTubers y creadores de contenido en directo: permite animar un avatar 3D usando solo el microfono, sin hardware de captura facial dedicado.
- Previsualizacion de personajes en herramientas de animacion: los animadores pueden generar una primera pasada de labios a partir de una locucion y refinarla despues.
- Accesibilidad: personas que quieran una representacion visual sincronizada con su voz para comunicarse mediante un avatar.
- Prototipado rapido de experiencias de avatar en AR y Vision Pro, dado que la salida son pesos ARKit directamente compatibles con esos ecosistemas.
- Localizacion y doblaje: aplicar el modelo al audio doblado para regenerar la animacion labial de un personaje sin recapturar interpretacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es de latencia: una ventana de 2 segundos tarda aproximadamente 11 ms en un M1 Max usando las unidades de computo de CPU y GPU.

## Requisitos de hardware

- Plataforma: macOS 14 o superior sobre Apple silicon (M-series).
- VRAM: no aplica en el sentido convencional; el modelo usa memoria unificada. El archivo pesa 72 MB, por lo que la huella de pesos es muy reducida.
- GPU: no requiere GPU dedicada; funciona sobre la GPU integrada de Apple silicon con las unidades de computo de CPU y GPU.
- No compatible de forma nativa con GPU NVIDIA ni con el stack CUDA.
- Neural Engine: desaconsejado, porque la salida se desvia respecto al modelo original.
- Despliegue: Core ML en aplicaciones macOS; carga mediante el runtime de Core ML con `computeUnits` configurado a CPU y GPU.
- Latencia: aproximadamente 11 ms por ventana de 2 s en un M1 Max.
- Throughput: no disponible mas alla del dato de latencia por ventana.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| enconvo/avatar-lipsync-1-coreml | Audio a blendshapes ARKit (Core ML) | no disponible (72 MB cuantizado) | ventana de audio de 2 s a 16 kHz | Apache 2.0 | Hugging Face, solo macOS 14+ / Apple silicon |
| 3DAIGC/LAM_audio2exp | Audio a expresion (modelo original) | no disponible | no disponible | no disponible | Hugging Face / GitHub |
| myned-ai/wav2arkit_cpu | Audio a blendshapes ARKit | no disponible | no disponible | no disponible | Hugging Face |
| Wav2Lip (referencia del sector) | Lip-sync sobre video | no disponible | video + audio | no disponible | repositorio publico |

No se dispone de cifras comparativas de parametros, contexto ni rendimiento para estas alternativas dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni respuestas; solo pesos de blendshapes faciales.
- Solo funciona en macOS 14 o superior sobre Apple silicon; no hay version para CUDA, Linux o Windows.
- El Neural Engine produce derivas en la salida respecto al modelo original; debe usarse CPU y GPU.
- El codificador base (wav2vec2-base-960h) se entreno con habla en ingles; el comportamiento con otros idiomas no esta documentado.
- Ventana de entrada fija de 2 segundos: el manejo de audios mas largos requiere segmentacion y ensamblado externos.
- Riesgo de alucinacion en el sentido de producir movimientos labiales incorrectos o poco naturales ante audio ruidoso, con acentos no vistos o con voz cantada; no hay datos de robustez publicados.
- Sesgos: no documentados. Al derivar de un codificador entrenado con corpus en ingles, puede presentar peor desempeno con hablantes de otros idiomas o variedades dialectales.
- Licencia Apache 2.0, que permite uso comercial, pero el archivo `NOTICE` y la `LICENSE` deben acompanar al modelo. Conviene revisar las licencias y condiciones de los modelos base (`wav2vec2-base-960h`, `LAM_audio2exp`) antes de redistribuir.
- El repositorio no registra descargas ni valoraciones y tiene un tamano de 0.1 GB, lo que indica un artefacto nuevo y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enconvo/avatar-lipsync-1-coreml
- Repositorio de LAM Audio2Expression: https://github.com/aigc3d/LAM_Audio2Expression
- Modelo base 3DAIGC/LAM_audio2exp: https://huggingface.co/3DAIGC/LAM_audio2exp
- Modelo base myned-ai/wav2arkit_cpu: https://huggingface.co/myned-ai/wav2arkit_cpu
- Modelo base facebook/wav2vec2-base-960h: https://huggingface.co/facebook/wav2vec2-base-960h
