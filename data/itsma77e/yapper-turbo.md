# itsma77e/yapper-turbo

## Resumen

Yapper Turbo es un modelo de reconocimiento automático del habla (ASR) derivado de OpenAI Whisper large-v3-turbo, publicado por el desarrollador itsma77e como el motor de transcripción de su aplicación de dictado local Yapper. Se distribuye como un modelo INT8 en formato CTranslate2 para su uso con faster-whisper, con un tamano de repositorio de 0,8 GB (774,6 MB de pesos) frente a los 1.617,9 MB de la conversion float16 de large-v3-turbo.

El modelo resuelve un problema concreto de eficiencia: Whisper procesa siempre ventanas de audio de 30 segundos, incluso en clips cortos, lo que desaprovecha computo. Yapper Turbo adapta el decodificador para mantener la precision cuando el codificador solo procesa el audio existente (crop) en lugar de la ventana completa. Segun la model card, en clips cortos es aproximadamente el doble de rapido que large-v3-turbo con una precision cercana, y el ahorro desaparece a partir de unos 29 segundos de audio, donde el recorte cubre ya la ventana completa.

Es relevante para desarrolladores que despliegan transcripcion local en CPU o GPU de gama media: combina una licencia MIT permisiva, soporte para 12 idiomas y un consumo de memoria reducido, a costa de una perdida pequena pero medible de precision en algunos idiomas (frances, espanol e hindi) respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a CTranslate2 |
| Parametros totales | no disponible (derivado de Whisper large-v3-turbo; el autor no publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 s (con soporte de recorte dinamico del codificador para clips mas cortos) |
| Tipos de cuantizacion | INT8 (pesos); `int8_float16` en GPU |
| Idiomas soportados | it, en, es, fr, de, pt, ru, ja, zh, ko, ar, hi (12 idiomas) |
| Licencia | MIT (pesos y codigo; el nombre y logo Yapper no estan licenciados) |
| Formato de pesos | CTranslate2 (modelo compilado para faster-whisper) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un transformer encoder-decoder con atencion estandar, no MoE ni SSM. La innovacion respecto al modelo original es el tratamiento del contexto de audio: el codificador acepta un recorte dinamico en lugar de rellenar siempre hasta 30 segundos, lo que reduce el computo en clips cortos. El encoder procede de un modelo Yapper anterior derivado de large-v3-turbo.

El decodificador se adapto sobre 192 grabaciones de entrenamiento de FLEURS en italiano e ingles, en tres condiciones acusticas, durante 576 pasos de optimizacion. Posteriormente se fusionaron los pesos y se exportaron a INT8. Todas las grabaciones de los manifiestos de investigacion provienen de FLEURS y no se uso audio personal. La release incluye pesos, codigo de uso y evaluacion, pero no el codigo de entrenamiento. El autor senala como trabajo relacionado `audio_ctx` de whisper.cpp y whisper-acft de FUTO, aunque no ha comparado su modelo con estos.

## Capacidades

- Transcripcion de voz a texto (speech-to-text) en 12 idiomas: italiano, ingles, espanol, frances, aleman, portugues, ruso, japones, chino, coreano, arabe e hindi.
- Deteccion automatica de idioma, aunque con degradacion documentada en hindi (WER 44,38 % frente a 37,12 % de large-v3-turbo).
- Procesamiento de audio de corta y media duracion con recorte dinamico del contexto del codificador, lo que acelera clips cortos.
- Ejecucion local en CPU y GPU mediante faster-whisper y CTranslate2.
- Uso orientado a dictado (dictation) y transcripcion de voz en aplicaciones de escritorio.
- No se documentan capacidades de traduccion, diarizacion de hablantes, tool calling ni razonamiento multi-paso.

## Casos de uso

- Dictado en aplicaciones de escritorio: es el caso de uso original (la app Yapper); el modelo transcribe clips cortos de voz con aproximadamente el doble de velocidad que large-v3-turbo en GPU, lo que reduce la latencia percibida al dictar frases.
- Transcripcion local en portatiles sin GPU dedicada: con 4 hilos de CPU alcanza 4,40x tiempo real en italiano e ingles, suficiente para procesar reuniones o notas de voz sin conexion.
- Subtitulado y notas de voz en movil o equipos de gama media: el tamano de 774,6 MB y la cuantizacion INT8 permiten desplegarlo donde un modelo float16 no cabria con holgura.
- Procesamiento por lotes de clips cortos en pipelines: para fragmentos de menos de 29 segundos el ahorro de computo es maximo, por lo que encaja en tareas de transcripcion masiva de segmentos cortos.
- Asistentes de voz y comandos hablados: la baja latencia en clips breves lo hace adecuado para interacciones de voz de turno corto en italiano e ingles, sus idiomas mejor evaluados.
- Prototipado e investigacion en ASR multilingue: la licencia MIT y la inclusion de scripts de evaluacion (`eval/prepare_fresh.py`, `eval/benchmark.py`, `eval/summarize.py`) facilitan reproducir y comparar resultados.

## Benchmarks y rendimiento

Resultados sobre 400 grabaciones del split oficial de test de FLEURS (12 idiomas, clips de 3,96 a 27,84 s, mediana 12,06 s), con pesos INT8 (`int8_float16` en GPU), idioma indicado, beam 3, en una RTX 3060 Laptop GPU y en CPU con 4 hilos.

| Configuracion | CER, 400 clips | WER IT | WER EN | Velocidad GPU (todas) | Velocidad CPU (IT+EN, 60 clips) |
|---|---:|---:|---:|---:|---:|
| large-v3-turbo | 2,81 % | 2,96 % | 5,02 % | 22,8x tiempo real | 1,51x tiempo real |
| large-v3-turbo con crop | 8,24 % | 14,63 % | 5,86 % | 44,3x | 4,04x |
| **Yapper Turbo con crop** | **3,04 %** | **3,08 %** | **5,20 %** | **48,1x** | **4,40x** |
| Yapper Turbo, faster-whisper estandar | 2,86 % | 2,96 % | 5,33 % | 23,8x | 1,63x |

Comparacion emparejada con large-v3-turbo (intervalos bootstrap del 95 % sobre clips):

| Ambito | Velocidad | Diferencia de WER |
|---|---:|---:|
| GPU, todos los idiomas, 400 clips | 2,11x [2,05; 2,17] | +0,53 puntos [+0,10; +0,98] |
| GPU, italiano, 100 clips | 1,84x [1,76; 1,93] | +0,12 puntos [-0,40; +0,64] |
| GPU, ingles, 100 clips | 2,67x [2,53; 2,81] | +0,18 puntos [-0,59; +0,94] |
| CPU, italiano + ingles, 60 clips | 2,91x [2,65; 3,22] | +0,00 puntos [-0,80; +0,72] |

Precision no uniforme por idioma (20 clips por idioma): frances CER 3,12 % frente a 2,48 %, espanol 1,93 % frente a 0,70 % e hindi 14,60 % frente a 12,61 % de large-v3-turbo. Con deteccion de idioma, el hindi empeora a WER 44,38 % frente a 37,12 %. Para chino y japones el WER no es significativo; debe usarse CER.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; los pesos INT8 ocupan 774,6 MB, por lo que la inferencia puede caber en GPUs con 2-4 GB de VRAM con holgura, aunque el autor no publica una cifra medida.
- GPU recomendadas: el autor evalua en una RTX 3060 Laptop GPU; cualquier GPU con soporte de CUDA 12 y suficiente memoria deberia servir. No se publican resultados en A100 ni H100.
- CPU: funciona con 4 hilos, alcanzando 4,40x tiempo real en italiano e ingles con el recorte dinamico.
- Cabe en GPU de consumo: si, segun el tamano de pesos; el modelo se evaluo en una GPU de portatil de gama media.
- Despliegue: faster-whisper 1.2.1 con CTranslate2; requiere CUDA 12 en GPU. Debe usarse el script incluido `yapper_asr.py`, ya que con faster-whisper estandar se pierde la mayor parte de la ganancia de velocidad.
- Dependencias: el autor advierte que con PyAV 19, faster-whisper 1.2.1 falla al abrir audio.
- Latencia/throughput: 48,1x tiempo real en GPU (todas las lenguas) y 4,40x en CPU con 4 hilos (italiano e ingles).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Yapper Turbo | no disponible (derivado de large-v3-turbo) | 30 s con crop dinamico | 12 | MIT | HuggingFace, CTranslate2 | 774,6 MB INT8; 2,11x mas rapido que large-v3-turbo en GPU |
| Whisper large-v3-turbo (OpenAI) | no disponible en la informacion | 30 s fijo | multilingue | MIT (pesos Whisper) | HuggingFace | Referencia de precision; 1.617,9 MB en float16 |
| whisper-acft (FUTO) | no disponible | contexto dinamico | no disponible | no disponible | GitHub | Fine-tune para tolerar contexto dinamico; no comparado con Yapper Turbo |
| whisper.cpp (`audio_ctx`) | no disponible | contexto de audio configurable | multilingue | MIT | GitHub | Implementacion C/C++ con control manual del contexto |

## Limitaciones y advertencias

- Los resultados se miden sobre FLEURS, habla leida y limpia; no cubren habla espontanea, ruido, acentos ni microfonos de baja calidad.
- La ganancia de velocidad se reduce con la duracion y desaparece a partir de unos 29 segundos, donde el recorte alcanza la ventana completa.
- Precision desigual: frances, espanol e hindi rinden peor que large-v3-turbo; en hindi con deteccion automatica de idioma el WER sube a 44,38 %.
- Las muestras por idioma (20 clips) salvo italiano e ingles solo indican direccion, no resultados concluyentes.
- Los tiempos provienen de un unico portatil no aislado y solo son comparables dentro de las tablas de la model card.
- Riesgo de alucinacion y errores de transcripcion: el autor desaconseja su uso donde los errores tengan consecuencias graves sin revision humana.
- La licencia MIT cubre pesos y codigo, pero el nombre y el logo Yapper no estan licenciados.
- No se incluye codigo de entrenamiento en la release, solo pesos, codigo de uso y evaluacion.
- Requiere el script `yapper_asr.py` para aprovechar el recorte dinamico; con faster-whisper estandar la velocidad es practicamente la de large-v3-turbo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itsma77e/yapper-turbo
- Aplicacion Yapper: https://itsyapper.com
- whisper-acft (FUTO): https://github.com/futo-org/whisper-acft
- Paper de Whisper (Radford et al., 2022): no disponible en la informacion proporcionada
- Paper de FLEURS (Conneau et al., 2022): no disponible en la informacion proporcionada
