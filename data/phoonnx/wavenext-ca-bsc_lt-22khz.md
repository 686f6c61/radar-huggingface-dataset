# Phoonnx/wavenext-ca-bsc_lt-22khz

## Resumen

wavenext-ca-bsc_lt-22khz es un vocoder neuronal (sintetizador de forma de onda a partir de mel-espectrogramas) empaquetado en formato ONNX para la libreria phoonnx. No es un modelo de lenguaje ni un sistema TTS completo: es la etapa final de sintesis de un pipeline de texto a voz, la que convierte la representacion espectral intermedia en audio PCM a 22 kHz. El modelo original procede de BSC-LT (Barcelona Supercomputing Center - Language Technologies), publicado como BSC-LT/wavenext-mel, y este repositorio es un reempaquetado realizado por Phoonnx para su consumo directo desde su libreria.

Su relevancia es practica: permite ejecutar sintesis de voz en catalan en entornos donde no se dispone de PyTorch, ya que el artefacto distribuido es ONNX. Se integra como dependencia automatica de las voces de phoonnx, de modo que el usuario final no necesita descargarlo ni invocarlo por separado. El ambito linguistico declarado es unicamente el catalan (`ca`), determinado por las voces que lo utilizan, no por el vocoder en si.

El repositorio es muy pequeno (0,1 GB) y no incluye datos de arquitectura interna, numero de parametros, corpus de entrenamiento ni resultados de evaluacion. Todo lo que se detalla a continuacion proviene de la model card y de los metadatos de Hugging Face; los campos no cubiertos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vocoder neuronal (familia WaveNeXt, segun el nombre del modelo); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de sintesis, no de secuencia de texto) |
| Tipos de cuantizacion | no disponible; el artefacto distribuido es ONNX |
| Idiomas soportados | catalan (`ca`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Frecuencia de muestreo de salida | 22 kHz (segun el nombre del modelo) |
| Entrada | mel-espectrogramas |
| Salida | forma de onda de audio |
| Upstream | BSC-LT/wavenext-mel |
| Libreria | phoonnx |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La model card clasifica el modelo dentro de la coleccion "Vocoders" y lo describe como un vocoder de BSC-LT derivado de BSC-LT/wavenext-mel. El nombre `wavenext` sugiere la familia WaveNeXt, pero la ficha no aporta ningun detalle sobre el numero de capas, canales, tipo de bloques (convolucionales, de upsampling o generativos) ni sobre el discriminador utilizado en el entrenamiento adversarial, en caso de haberlo.

Tampoco se documentan el volumen de datos de entrenamiento, la composicion del corpus, el idioma o idiomas de los datos, ni si hubo etapas de ajuste fino. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o destilacion. La unica transformacion documentada respecto al modelo original es el empaquetado a ONNX para su uso con phoonnx.

## Capacidades

- Conversion de mel-espectrogramas a forma de onda de audio a 22 kHz.
- Integracion automatica en el pipeline de phoonnx: se descarga junto con las voces que lo requieren, sin paso de instalacion propio.
- Uso conjunto con el modelo acustico `Phoonnx/matcha-ca-multispeaker_acoustic` (voz `OpenVoiceOS/matxa-cat-multispeaker-wavenext-2stage`).
- Ejecucion sobre runtime ONNX, lo que permite inferencia fuera de PyTorch.
- Soporte multilingue: no; el ambito declarado es exclusivamente catalan.
- Tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada o modo thinking: no aplica, es un vocoder.
- No realiza normalizacion de texto, fonemizacion ni sintesis acustica; esas tareas corresponden a scriptconv y al modelo acustico respectivamente.

## Casos de uso

- Sintesis de voz en catalan dentro de asistentes de voz: el vocoder cierra el pipeline de phoonnx generando el audio final a partir de los mel-espectrogramas producidos por el modelo acustico Matcha en catalan.
- Despliegue en dispositivos sin PyTorch: al distribuirse como ONNX, puede ejecutarse con el runtime de ONNX en entornos embebidos o contenedores minimos donde instalar el stack completo de PyTorch no es viable.
- Integracion en OpenVoiceOS: la voz `matxa-cat-multispeaker-wavenext-2stage` esta pensada para el ecosistema OVOS, por lo que este vocoder habilita la salida de audio de dicho asistente en catalan.
- Generacion de audiolibros o contenido narrado en catalan: combinado con el modelo acustico multispeaker, permite producir locuciones con distintas voces sobre texto catalan.
- Sistemas de anuncios y avisos automatizados en catalan: para aplicaciones de megafonia, transporte publico o atencion telefonica donde se requiere una voz sintetica en esa lengua.
- Pruebas de regresion y evaluacion de pipelines TTS: al ser un componente ONNX aislado, facilita la sustitucion y comparacion de vocoders manteniendo fijo el resto del pipeline.
- Investigacion en sintesis de voz de bajos recursos: sirve como referencia para comparar calidad de vocoders en catalan frente a alternativas, siempre que se disponga de las metricas subjetivas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 0,1 GB, pero no se especifica el consumo en ejecucion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; al ser un modelo ONNX de 0,1 GB es plausible que quepa en GPU de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: runtime ONNX a traves de phoonnx; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a este vocoder).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros vocoders comparables ni datos de rendimiento que permitan establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ambito linguistico restringido al catalan; no se declara soporte para otras lenguas.
- No es un modelo de texto a voz completo: requiere un modelo acustico previo y un fonemizador (scriptconv) para funcionar.
- Ausencia total de datos de evaluacion: no hay metricas objetivas (MOS, MCD, PESQ) ni subjetivas publicadas en la informacion disponible.
- No se documentan sesgos, pero al ser un vocoder entrenado con datos no especificados, la calidad y las caracteristicas de las voces pueden variar segun el hablante y el dominio.
- Riesgo de artefactos acusticos inherente a los vocoders neuronales; no cuantificado por falta de datos.
- Licencia Apache 2.0, que permite uso comercial y modificacion con atribucion; conviene conservar el aviso de licencia y la referencia al modelo upstream BSC-LT/wavenext-mel.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de validacion por la comunidad.
- La fecha de creacion indicada (2026-11-14) es posterior a la fecha habitual de publicacion de modelos; conviene verificar la integridad y procedencia del artefacto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/wavenext-ca-bsc_lt-22khz
- Modelo upstream: https://huggingface.co/BSC-LT/wavenext-mel
- Modelo acustico asociado: https://huggingface.co/Phoonnx/matcha-ca-multispeaker_acoustic
- Voz en OpenVoiceOS: https://huggingface.co/OpenVoiceOS/matxa-cat-multispeaker-wavenext-2stage
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion de vocoders de Phoonnx: https://huggingface.co/collections/Phoonnx/vocoders-6af8eab202014765d7fce3c9
