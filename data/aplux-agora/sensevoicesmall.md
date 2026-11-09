# APLUX-Agora/SenseVoiceSmall

## Resumen

SenseVoiceSmall es un paquete de recursos para reconocimiento automático del habla (ASR) publicado por APLUX-Agora dentro de su plataforma Agora, orientada a despliegue en hardware Qualcomm para aplicaciones AIoT. El repositorio no contiene los pesos originales del modelo SenseVoiceSmall, sino artefactos convertidos y empaquetados por Model Farm para ejecutarse sobre aceleradores QNN (Qualcomm Neural Network) en placas concretas. La única variante documentada en la model card corresponde al SoC QCS8550 montado en la placa Rhino Pi X1 (犀牛派 X1), en precisión FP16.

La relevancia del paquete es de tipo práctico: permite desplegar un modelo ASR en placas embebidas Qualcomm con un flujo de descarga y ejecución reproducible, con métricas medidas sobre hardware real (RTF 0,055 en la configuración por defecto). No se trata de un modelo nuevo ni de un entrenamiento propio, sino de una distribución de inferencia optimizada. El repositorio ocupa 0,5 GB y no registra descargas ni interacciones en el momento de la consulta.

La información pública disponible es muy limitada: no se detallan parámetros totales, longitud de contexto, idiomas soportados ni resultados de benchmarks más allá del RTF indicado. La licencia de los recursos convertidos es la APLUX Model Farm License, mientras que los términos del modelo fuente remiten a la licencia original de SenseVoiceSmall.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base SenseVoiceSmall; el paquete contiene artefactos QNN convertidos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (unica precision documentada para QCS8550) |
| Idiomas soportados | no disponible |
| Licencia | APLUX Model Farm License para los recursos convertidos; terminos del modelo fuente segun su licencia original |
| Formato de pesos | artefactos QNN (`model.bin`), con `model.json` de configuracion por SoC y precision |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base SenseVoiceSmall en la documentacion proporcionada, ni sobre el volumen o composicion de los datos de entrenamiento, ni sobre si se aplicaron tecnicas de RLHF o DPO. El paquete publicado por APLUX-Agora no incluye pesos en formato estandar de entrenamiento, sino recursos compilados para el runtime QNN de Qualcomm, organizados en directorios `targets/<SoC>/` con un `model.json` que define la precision por defecto y las rutas de las variantes.

La innovacion tecnica destacable no esta en el modelo sino en el pipeline de despliegue: conversion a QNN, empaquetado por placa y medicion de latencia en hardware real. La model card indica que el procesamiento previo y posterior, el runner y el proyecto exportado estan disponibles a traves de la plataforma Agora, y que el paquete incluye `NOTICE.md` y `SHA256SUMS` para verificar integridad y procedencia.

## Capacidades

- Reconocimiento automatico del habla (ASR): entrada de audio, salida de texto, segun el `pipeline_tag` declarado.
- Despliegue en hardware Qualcomm AIoT mediante runtime QNN, con precision FP16 en el SoC QCS8550.
- Ejecucion en placa Rhino Pi X1 (犀牛派 X1) con RTF medido de 0,055 en la configuracion por defecto.
- Flujo de descarga reproducible mediante `hf download` filtrando por SoC.
- Posibilidad de probar el modelo en linea a traves de la plataforma Agora sin disponer de placa fisica.
- Exportacion de flujos de trabajo que utilicen el modelo desde Agora.
- No se documentan capacidades de tool calling, agentes, vision, audio adicional ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de voz en dispositivos embebidos: el paquete esta pensado para ejecutarse en placas Qualcomm con runtime QNN, lo que permite integrar ASR en dispositivos AIoT sin depender de la nube. El RTF de 0,055 en QCS8550 indica que el procesamiento es considerablemente mas rapido que tiempo real en esa placa.
- Interfaces de voz para electrodomesticos y equipos industriales: al ejecutarse localmente en el SoC, se evita el envio de audio a servidores externos, lo que simplifica el cumplimiento de privacidad y reduce la latencia de red.
- Subtitulado o dictado en terminales de bajo consumo: la precision FP16 y el empaquetado por placa permiten desplegar el mismo modelo en flotas de dispositivos homogeneos con una configuracion unica (`model.json`).
- Prototipado rapido sin hardware: la plataforma Agora permite probar el modelo en linea antes de adquirir la placa, lo que acorta el ciclo de evaluacion para equipos que valoran un SoC Qualcomm.
- Integracion en pipelines de agentes de voz en el borde: la salida de texto puede alimentar modulos posteriores de NLU o comandos, siempre que el resto del sistema se ejecute en el mismo dispositivo o en un gateway local.
- Verificacion de integridad en produccion: el paquete incluye `SHA256SUMS` y `NOTICE.md`, lo que facilita validar los artefactos desplegados en cada dispositivo de una flota.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| RTF (real-time factor) | 0,055 | QCS8550 · Rhino Pi X1, precision FP16, configuracion por defecto |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K, WER ni otros benchmarks de calidad ASR. El unico dato de rendimiento es el RTF medido en la placa indicada.

## Requisitos de hardware

- VRAM: no aplica en el sentido convencional; el modelo se ejecuta en el SoC QCS8550 mediante QNN, no en GPU de escritorio.
- GPU/SoC recomendados: Qualcomm QCS8550 (placa Rhino Pi X1) es la unica configuracion documentada.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte para RTX, A100, H100 ni otros aceleradores.
- Opciones de despliegue: runtime QNN a traves de la plataforma Agora; el paquete incluye runner y procesamiento previo/posterior. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,055 en QCS8550 con FP16, lo que equivale a procesar audio aproximadamente 18 veces mas rapido que tiempo real en esa placa.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos ASR comparables (parametros, contexto, WER, licencia) que permitan una comparacion rigurosa. El paquete es ademas una distribucion especifica para QNN, por lo que la comparacion natural seria con el SenseVoiceSmall original o con otras distribuciones para el mismo SoC, y no se aportan datos de ninguna de ellas.

## Limitaciones y advertencias

- La model card esta mayoritariamente en chino e ingles; no se documentan los idiomas que reconoce el modelo.
- No se publican parametros, contexto, arquitectura ni datos de entrenamiento del modelo base en este repositorio.
- Solo se documenta una placa y una precision (QCS8550, FP16); el comportamiento en otros SoC Qualcomm no esta disponible.
- El paquete son recursos convertidos, no los pesos originales: la fidelidad respecto al modelo fuente no se cuantifica con WER en la informacion disponible.
- La licencia APLUX Model Farm License condiciona el uso de los recursos convertidos; es imprescindible revisar `LICENSE_MODEL_FARM.pdf` antes de un uso comercial. Los terminos del modelo fuente remiten a su licencia original.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; en ASR, los errores tipicos son sustituciones, omisiones y fallos ante ruido o acentos, pero no se aportan tasas.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso en produccion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-09) es posterior a la de consulta habitual; conviene verificar la vigencia de los artefactos antes de desplegarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/SenseVoiceSmall
- Prueba en linea en Agora: https://mega.aidlux.com/models/sensevoicesmall
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/SenseVoiceSmall/blob/main/LICENSE_MODEL_FARM.pdf
