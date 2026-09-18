# jatshi/LSE-Prescription-MM-DiT-v6-StepAudio3

## Resumen

LSE Prescription-MM-DiT v6 StepAudio3 es un checkpoint de investigacion para mejora de voz (speech enhancement) desarrollado por el usuario jatshi dentro del proyecto `llm-guided-speech-enhancement`. Se trata de un modelo MM-DiT (multimodal diffusion transformer) de 51.717.122 parametros entrenado como rectified flow sobre fuentes observadas, que recibe como entrada un audio ruidoso y una "prescripcion" estructurada (hasta 16 tokens de tipo `EnhanceScript`, con componentes temporales) que condiciona el tipo de mejora a aplicar. El objetivo es demostrar que un condicionamiento estructurado correcto mejora causalmente la salida frente a no usar prescripcion o usar una prescripcion barajada (shuffled).

El modelo trabaja en el dominio espectral: entrada y salida son un STFT complejo de dos canales (parte real e imaginaria), a 16 kHz y con recortes de 2 segundos. La red tiene 8 bloques MM-DiT, anchura 384 y 8 cabezas de atencion. La receta de entrenamiento v6 incorpora inicializacion estricta de velocidad cero, perdida multi-resolucion STFT, consistencia semantica con un WavLM congelado, un curriculum de tres etapas y evaluacion explicita de la salida cruda frente a la salida con puerta de seguridad (safety gating).

Es relevante ahora porque explora una via poco comun en mejora de voz: en lugar de un modelo puramente discriminativo o generativo sin control, se anade una interfaz de condicionamiento estructurado que permite dirigir la enhancement. Ahora bien, el propio autor lo presenta como evidencia de investigacion y no como un reclamo de SOTA: las ganancias absolutas de SI-SDR son pequenas y DeepFilterNet3 sigue siendo superior en varias metricas perceptuales. El checkpoint corresponde al paso 11.750 de un entrenamiento de 12.000 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MM-DiT (multimodal diffusion transformer) con rectified flow; 8 bloques, anchura 384, 8 cabezas |
| Parametros totales | 51.717.122 parametros entrenables |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; condicionamiento de hasta 16 tokens de prescripcion / `EnhanceScript` temporal, recortes de audio de 2 segundos |
| Tipos de cuantizacion | no disponible; entrenamiento en bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`mmdit/checkpoint-best.pt`), con metadata de modelo, flujo, codec y curriculum embebida |
| Tarea (pipeline) | audio-to-audio, mejora de voz (speech enhancement) |
| Representacion de audio | STFT complejo de 2 canales (real/imaginario), 16 kHz, recortes de 2 s |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo parte de una representacion de entrada y salida en STFT complejo de dos canales (parte real y parte imaginaria) a 16 kHz, con recortes de 2 segundos. La ruta de flujo sigue la formulacion `x_t = (1-t) * noisy_latent + t * clean_latent`, es decir, un rectified flow que interpola entre el latente ruidoso y el latente limpio. El backbone son 8 bloques MM-DiT con anchura 384 y 8 cabezas de atencion, que suman 51.717.122 parametros entrenables. El condicionamiento es estructurado: hasta 16 tokens de prescripcion o de `EnhanceScript` temporal que describen la degradacion y la intervencion esperada.

La receta v6 introduce varias innovaciones concretas. Primero, una inicializacion estricta de velocidad cero: la modulacion AdaLN y la cabeza de velocidad final se inicializan a cero exacto, de modo que el modelo arranca como una identidad respecto al latente ruidoso. Segundo, objetivos auxiliares: perdida multi-resolucion STFT con ventanas de 256, 512 y 1024 puntos, y consistencia coseno con la capa 9 de un WavLM congelado. Tercero, un curriculum de tres etapas: alineamiento con prescripcion oraculo (pasos 1-4.000), alineamiento de seguridad (4.001-9.000) y cooldown conjunto (9.001-12.000). El entrenamiento se realizo en una unica NVIDIA RTX 4080 SUPER (declarada como 32 GB) en bfloat16 y con tamano de lote 12.

Los datos son 2.000 pares derivados de LibriSpeech dev-clean, con un reparto disjunto por hablante de 1.600/200/200. El profesor WavLM no se redistribuye: permanece congelado y solo es necesario para reproducir el entrenamiento semantico, no para la inferencia del MM-DiT.

## Capacidades

- Mejora de voz audio-a-audio: transforma una senal ruidosa en una version mejorada en el dominio STFT complejo.
- Condicionamiento por prescripcion: acepta hasta 16 tokens estructurados de `EnhanceScript` (incluidos componentes temporales) que dirigen el tipo de mejora aplicada.
- Condicionamiento causalmente efectivo: las comparaciones pareadas muestran que la prescripcion correcta mejora la salida frente a la ausencia de prescripcion y frente a prescripciones barajadas.
- Safety gating y prediccion selectiva: existe una salida con puerta de seguridad que puede recurrir a un fallback cuando la prescripcion predicha no es fiable (70,6% de fallback en el brazo de prescripcion predicha sobre ejemplos corrompidos).
- Cobertura de degradaciones: el conjunto de evaluacion incluye ruido blanco, ruido rosa, reverberacion y limitacion de banda telefonica, con 40 ejemplos por degradacion mas 40 ejemplos limpios.
- Preservacion de identidad en audio limpio: se evalua como una rebanada de seguridad separada, ya que los pares limpios tienen aproximadamente 143 dB de SI-SDR de entrada.
- Idioma: unicamente ingles.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente. No es un modelo de lenguaje.

## Casos de uso

- Preprocesado de voz para ASR: el modelo puede colocarse antes de un sistema de reconocimiento de voz para atenuar ruido blanco y rosa en grabaciones a 16 kHz y mejorar la senal antes de la transcripcion, aprovechando que el condicionamiento por prescripcion permite ajustar la intervencion al tipo de degradacion detectado.
- Limpieza de audio telefonico: dado que el conjunto de evaluacion incluye limitacion de banda telefonica, el modelo es adecuado para tareas de mejora de grabaciones de call center o de voz transmitida por telefonia, con la prescripcion indicando la banda limitada.
- Deverberacion de grabaciones: los ejemplos con reverberacion permiten usar el modelo para reducir la cola reverberante en grabaciones de sala, dirigiendo la prescripcion hacia esa degradacion concreta.
- Investigacion en condicionamiento estructurado: el paquete incluye configuracion exacta de 12.000 pasos, informe de evaluacion, resumen diagnostico, CSV por muestra y sumas de verificacion, lo que permite reproducir el experimento de seis brazos y estudiar como afecta el condicionamiento estructurado al resultado.
- Evaluacion comparativa de metodos de enhancement: los scripts y datos incluidos (1.200 filas de brazo sobre 200 ejemplos retenidos, comparaciones bootstrap pareadas) permiten usar el modelo como linea base condicionada frente a metodos como DeepFilterNet3 o sustraccion espectral.
- Desarrollo de esquemas de safety gating en audio: el comportamiento de fallback al 70,6% en el brazo de prescripcion predicha sirve como caso de estudio para disenar politicas de prediccion selectiva y puertas de seguridad en pipelines de mejora de voz.
- Prototipado de interfaces de control para enhancement: el mecanismo de tokens `EnhanceScript` puede reutilizarse como plantilla para investigar interfaces de control de bajo numero de tokens en modelos generativos de audio.
- Validacion de integridad de checkpoints: el paquete incluye `SHA256SUMS`, lo que permite verificar los pesos antes de cargarlos, algo util en flujos de trabajo de investigacion que exigen trazabilidad.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados de forma independiente en la model card: los campos `verified` del model-index son `false`). La mejora de calidad se reporta sobre los 160 ejemplos genuinamente corrompidos; el audio limpio se mantiene como rebanada de seguridad separada.

Resultados de la model card (salida cruda del modelo en ejemplos corrompidos):

| Brazo | Mejora SI-SDR | STOI | PESQ | Fallback de evaluacion |
|---|---:|---:|---:|---:|
| DeepFilterNet3 | +0,374 dB | 0,8719 | 1,9886 | 0% |
| MM-DiT sin prescripcion | +0,005 dB | 0,8578 | 1,3683 | 0% |
| MM-DiT con prescripcion oraculo | +0,263 dB | 0,8647 | 1,3149 | 0% |
| MM-DiT con prescripcion predicha | +0,221 dB | 0,8578 | 1,3684 | 70,6% |
| MM-DiT con prescripcion barajada | -0,114 dB | 0,8575 | 1,3599 | 0% |
| Sustraccion espectral | -1,124 dB | 0,8408 | 1,3459 | 0% |

Comparaciones causales pareadas (20.000 remuestreos bootstrap sobre los mismos 160 ejemplos corrompidos):

| Comparacion | Diferencia media | Tasa de victoria | Intervalo de confianza al 95% |
|---|---:|---:|---|
| Oraculo menos sin prescripcion | +0,258 dB | 64,4% | [+0,089, +0,424] |
| Oraculo menos barajada | +0,376 dB | 75,6% | [+0,195, +0,552] |
| Predicha menos sin prescripcion | +0,216 dB | 68,1% | [+0,142, +0,294] |

Metricas declaradas en el model-index oficial para el conjunto derivado de LibriSpeech dev-clean:

| Metrica | Valor | Verificado |
|---|---:|---|
| Mejora SI-SDR pareada (oraculo menos sin prescripcion) | 0,258 | false |
| Mejora SI-SDR pareada (predicha menos sin prescripcion) | 0,216 | false |

El propio autor indica que estas comparaciones respaldan la afirmacion de que la red utiliza la prescripcion estructurada, pero no respaldan una superioridad universal en mejora de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parametros, los pesos en bfloat16 ocupan aproximadamente 0,1 GB. Sumando buffers de STFT y activaciones para recortes de 2 s a 16 kHz, el consumo deberia mantenerse muy por debajo de 1-2 GB; no hay una cifra oficial publicada.
- GPU recomendadas: cualquier GPU moderna con soporte de bfloat16 es suficiente. No se requiere hardware de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente. El entrenamiento se realizo en una unica NVIDIA RTX 4080 SUPER (declarada como 32 GB), lo que da una referencia del orden de magnitud necesario.
- Opciones de despliegue: el unico camino documentado es la inferencia con PyTorch mediante el modulo `lse_v2.mmdit.infer` del repositorio fuente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo de lenguaje ni un transformer de decodificacion estandar, estas herramientas no son aplicables directamente.
- Latencia y throughput: no disponible.
- Nota de seguridad: los checkpoints de PyTorch pueden ejecutar codigo durante la deserializacion; se recomienda descargar solo de una fuente fiable y verificar `SHA256SUMS` antes de cargar.

## Comparativa con modelos similares

| Modelo | Parametros | Mejora SI-SDR (corrompidos) | STOI | PESQ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LSE Prescription-MM-DiT v6 StepAudio3 | 51,7 M | +0,221 dB (prescripcion predicha) | 0,8578 | 1,3684 | MIT | checkpoint PyTorch en HuggingFace |
| DeepFilterNet3 | no disponible | +0,374 dB | 0,8719 | 1,9886 | no disponible | usado como referencia en la evaluacion del autor |
| MM-DiT sin prescripcion (ablacion del mismo modelo) | 51,7 M | +0,005 dB | 0,8578 | 1,3683 | MIT | misma familia de checkpoints |
| Sustraccion espectral (linea base clasica) | no aplica | -1,124 dB | 0,8408 | 1,3459 | no disponible | metodo de referencia |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (enhancement condicionado por instrucciones) en la informacion proporcionada. DeepFilterNet3 aparece unicamente como linea base de la evaluacion y es superior en PESQ y STOI segun los datos del autor.

## Limitaciones y advertencias

- Ganancias absolutas pequenas: las mejoras de SI-SDR del orden de 0,2-0,26 dB son modestas y el autor no las presenta como un resultado SOTA.
- Calidad perceptual inferior a la referencia: el PESQ del modelo (+0,263 dB con prescripcion oraculo, PESQ 1,3149) queda claramente por debajo de DeepFilterNet3 (PESQ 1,9886), que sigue siendo mas fuerte en varias metricas perceptuales.
- Tasa de fallback elevada: en el brazo de prescripcion predicha, el 70,6% de los casos recurren al fallback de la puerta de seguridad, lo que indica que la prediccion de la prescripcion no es fiable en la mayoria de ejemplos corrompidos.
- Sensibilidad en audio limpio: los pares limpios tienen aproximadamente 143 dB de SI-SDR de entrada, de modo que cambios minimos en la forma de onda producen mejoras de SI-SDR extremadamente negativas; no debe usarse esa metrica para juzgar la preservacion de identidad en audio limpio.
- Dominio de entrenamiento muy acotado: los datos son 2.000 pares derivados de LibriSpeech dev-clean con reparto 1.600/200/200, una base pequena y limitada al ingles.
- Cobertura de degradaciones limitada: la evaluacion cubre ruido blanco, ruido rosa, reverberacion y limitacion de banda telefonica, 40 ejemplos por categoria. Otros tipos de ruido no estan cubiertos.
- Idioma: solo ingles. No hay soporte multilingue declarado.
- Licencia MIT: permite uso comercial y modificacion, pero el paquete se presenta explicitamente como evidencia de investigacion y no como un sistema listo para produccion.
- Dependencia de codigo externo: la inferencia requiere clonar la rama o etiqueta correspondiente del repositorio fuente; el checkpoint no es autosuficiente sin ese codigo.
- Profesor no redistribuido: el WavLM congelado no se incluye en el paquete. Es necesario solo para reproducir el entrenamiento semantico, no para inferir, pero limita la reproducibilidad completa del pipeline de entrenamiento.
- Riesgo de seguridad de deserializacion: al ser un checkpoint PyTorch, la carga puede ejecutar codigo arbitrario; hay que verificar las sumas SHA256.
- La seccion de limitaciones de la model card original aparece truncada en la informacion disponible (corta en "PESQ/ST"), por lo que podria haber advertencias adicionales no recogidas aqui.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero existe riesgo de artefactos o de introducir distorsiones no presentes en la senal original al aplicar la mejora.
- Sesgos: no se documentan analisis de sesgo por acento, genero, edad u otras variables demograficas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jatshi/LSE-Prescription-MM-DiT-v6-StepAudio3
- Repositorio fuente `llm-guided-speech-enhancement`: https://github.com/Jatshi/llm-guided-speech-enhancement
- Release v6.0.0 del repositorio fuente: https://github.com/Jatshi/llm-guided-speech-enhancement/releases/tag/v6.0.0
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (los resultados obtenidos corresponden a paginas de soporte de Microsoft y no guardan relacion con el modelo).
