# 13fragments/xls-r-300m-forced-aligner

## Resumen

XLS-R 300M forced aligner es un modelo de alineamiento forzado (forced alignment) desarrollado por el usuario 13fragments. Su funcion es tomar un audio y su transcripcion y asignar a cada palabra una marca de inicio y fin en el eje temporal. Se construye mediante fine-tuning del modelo preentrenado facebook/wav2vec2-xls-r-300m, un transformer convolucional de 315 millones de parametros entrenado originalmente por Meta con aprendizaje autosupervisado sobre unas 436.000 horas de audio en 128 idiomas.

El modelo resuelve un problema muy concreto: el alineador por defecto de la herramienta `ctc-forced-aligner` esta licenciado bajo CC BY-NC 4.0, lo que impide su uso comercial. Este modelo se carga en su lugar dentro de la misma interfaz y se distribuye bajo licencia Apache 2.0, lo que lo hace apto para productos y pipelines comerciales.

Es relevante por su licencia permisiva y su integracion directa con `ctc-forced-aligner`, aunque su precision es inferior a la de alternativas como FuseAlign (19,0 ms de error mediano frente a 27,0 ms). Esta pensado para quienes necesitan la interfaz de `ctc-forced-aligner` con fines comerciales y pueden asumir ese compromiso de precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer convolucional + encoder de atencion), fine-tuning de facebook/wav2vec2-xls-r-300m |
| Parametros totales | 315.469.471 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no declarados explicitamente; entrenado con 10 idiomas de Common Voice (sw, kab, eu, ta, hu, vi, tr, mn, id, en) y evaluado en 25 idiomas de DoReCo 2.0 |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de XLS-R 300M, un wav2vec2 de 315 millones de parametros preentrenado por Meta sin etiquetas sobre aproximadamente 436.000 horas de audio en 128 idiomas (VoxPopuli, Multilingual LibriSpeech, Common Voice, VoxLingua107 y BABEL). Sobre esa base se realiza un fine-tuning con cabecera CTC para la tarea de alineamiento forzado, de modo que el modelo emite probabilidades por fotograma sobre un vocabulario de 31 simbolos de texto romanizado.

Los datos de entrenamiento propios son Common Voice Scripted Speech 27.0 (CC0): 71.011 clips y 94,2 horas en 10 idiomas (sw, kab, eu, ta, hu, vi, tr, mn, id, en), excluyendo hablantes de los splits `dev` y `test`. Las transcripciones se romanizan con `uroman`. No se documenta el uso de RLHF ni DPO, algo coherente con una tarea de alineamiento supervisado. La resolucion temporal de salida es de 20 ms por fotograma, y el modelo se ha validado con `ctc-forced-aligner` en el commit `7c66b95` y `transformers` 4.57.3.

## Capacidades

- Alineamiento forzado palabra a palabra: genera marcas de inicio y fin por palabra a partir de audio y transcripcion.
- Salida compatible con `ctc-forced-aligner`: produce un JSON con un segmento por palabra.
- Funcionamiento sobre texto romanizado: requiere pasar `--romanize`, ya que solo conoce los 31 simbolos del texto romanizado.
- Carga directa en Python mediante `load_alignment_model` con `model_path` apuntando al repositorio.
- Uso sobre CPU (el ejemplo de carga usa `"cpu"`).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni agentes; es un modelo especializado exclusivamente en alineamiento.

## Casos de uso

- Subtitulado automatico con marcas por palabra: dado un audio y su transcripcion, el modelo produce los tiempos de inicio y fin de cada palabra, utiles para subtitulos karaoke o resaltado sincronizado.
- Pipelines comerciales de transcripcion: al estar bajo Apache 2.0, puede integrarse en productos de pago donde el alineador por defecto (CC BY-NC 4.0) no seria viable.
- Analisis fonetico y linguistico: la alineacion palabra a palabra permite estudiar duraciones y pausas en corpus de investigacion con licencia permisiva.
- Sincronizacion de texto y audio en edicion: util para herramientas de edicion de video o podcast que necesitan cortes por palabra.
- Generacion de datasets temporales: etiquetar audios con marcas de palabra para entrenar otros modelos o construir indices de busqueda por fragmento.
- Evaluacion de calidad de TTS/ASR: comparar los tiempos predichos con los reales para medir desalineaciones en sistemas de sintesis o reconocimiento.

## Benchmarks y rendimiento

Error de frontera de palabra sobre 25 idiomas no presentes en entrenamiento (DoReCo 2.0). Mediana por idioma de los errores en inicio y fin; despues, mediana sobre idiomas. Menor es mejor.

| Modelo | Semillas de entrenamiento | Error mediano | Fronteras > 100 ms | Palabras perdidas |
|---|---|---|---|---|
| Este modelo (semilla 2) | 1 | 27,0 ms | 17,5 % | 1,7 % |
| Media de las semillas entrenadas | 3 | 27,0 ms | 17,3 % | 1,7 % |
| FuseAlign (Apache 2.0) | modelo publicado | 19,0 ms | 16,7 % | 1,8 % |
| Modelo por defecto de `ctc-forced-aligner` | modelo publicado | no medido | no medido | no medido |

FuseAlign es mas preciso en los 25 idiomas. La diferencia supera los 15 ms en 7 idiomas y es maxima en arapaho (59,0 ms frente a 20,0 ms). El modelo por defecto no se evaluo porque las pruebas solo incluyen modelos de uso comercial permitido. La semilla 2 se eligio con tres idiomas de desarrollo (22,0 ms frente a 23,0 ms y 23,0 ms).

## Requisitos de hardware

- VRAM estimada: con 315 millones de parametros, en fp32 ocupa aproximadamente 1,3 GB; en fp16 unos 0,65 GB; en int8 unos 0,35 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; el ejemplo oficial carga el modelo en CPU. Cualquier GPU consumer reciente (RTX 3060 o superior) es suficiente.
- Cabe en consumer GPU: si, en practicamente todas las GPU actuales e incluso en CPU.
- Opciones de despliegue: `ctc-forced-aligner` (commit `7c66b95`) y `transformers` 4.57.3; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Error mediano (DoReCo 2.0) | Licencia | Interfaz |
|---|---|---|---|---|---|
| Este modelo | 315 M | no disponible | 27,0 ms | Apache 2.0 | `ctc-forced-aligner` |
| FuseAlign | no disponible | no disponible | 19,0 ms | Apache 2.0 | propia |
| Modelo por defecto de `ctc-forced-aligner` | no disponible | no disponible | no medido | CC BY-NC 4.0 | `ctc-forced-aligner` |

FuseAlign es la alternativa mas precisa y tambien permisiva para uso comercial, pero no ofrece la interfaz de `ctc-forced-aligner`. El modelo por defecto comparte interfaz pero no permite uso comercial y no fue evaluado en este benchmark.

## Limitaciones y advertencias

- Menos preciso que FuseAlign en todos los idiomas de prueba; la brecha supera los 15 ms en 7 idiomas y llega a 59,0 ms frente a 20,0 ms en arapaho.
- No se ha comparado con el modelo por defecto de `ctc-forced-aligner`.
- Las marcas temporales tienen una resolucion de 20 ms.
- Evaluado sobre unidades de anotacion, no sobre grabaciones completas.
- El texto debe romanizarse bien con `uroman`; chino y japones quedaron fuera del entrenamiento por esta razon.
- Entrenado solo con 10 idiomas de Common Voice; el rendimiento en otros idiomas no esta garantizado, aunque se evaluo en 25 idiomas de DoReCo 2.0.
- La licencia del modelo es Apache 2.0, pero los terminos de BABEL del preentrenamiento restringen el uso comercial a no miembros del Linguistic Data Consortium, y los propietarios de los videos de VoxLingua107 conservan su copyright; conviene revisar `NOTICE`.
- Riesgo de alucinacion no aplica en el sentido generativo, pero puede producir alineaciones erroneas o palabras perdidas (1,7 % en la evaluacion).
- Validado unicamente con `ctc-forced-aligner` en el commit `7c66b95` y `transformers` 4.57.3; otras versiones pueden no ser compatibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/13fragments/xls-r-300m-forced-aligner
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Repositorio `ctc-forced-aligner`: https://github.com/MahmoudAshraf97/ctc-forced-aligner
- Resultados de evaluacion: eval/RESULTS.md (dentro del repositorio del modelo)
- Common Voice: https://commonvoice.mozilla.org
- DoReCo 2.0: no disponible (enlace no proporcionado)
