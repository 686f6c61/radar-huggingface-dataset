# Phamhapaa1/ZeroTTS-x2TL

## Resumen

ZeroTTS-x2TL es un modelo de sintesis de voz (text-to-speech) zero-shot especializado en vietnamita, publicado en HuggingFace por el usuario Phamhapaa1 y distribuido en formato ONNX con licencia MIT. Se trata de un repositorio derivado o reempaquetado de ZeroTTS, el sistema desarrollado por zeroweight-ai: la model card incluida en el repositorio, los ejemplos de codigo y los enlaces apuntan al modelo original `zeroweight-ai/ZeroTTS`, mientras que el identificador de este repositorio es `Phamhapaa1/ZeroTTS-x2TL`. El autor no documenta en la informacion disponible en que consiste el sufijo "x2TL" ni que diferencias introduce respecto al modelo de origen.

El modelo resuelve la generacion de voz natural en vietnamita con clonacion de voz a partir de pocos segundos de audio de referencia (entre 3 y 30 segundos), sin necesidad de ajuste fino ni entrenamiento por hablante. Su propuesta diferencial es el rendimiento en CPU: declara un factor de tiempo real (RTF) de aproximadamente 0,5x, es decir, unas dos veces mas rapido que el tiempo real en la CPU de un portatil convencional, con un primer fragmento de audio disponible en torno a 70 ms, lo que habilita sintesis en streaming sin GPU. El repositorio ocupa 0,9 GB en formato ONNX y no declara el numero de parametros.

La relevancia actual del modelo esta en su combinacion de licencia permisiva (MIT), ejecucion sin GPU y soporte nativo de tonos vietnamitas, code-switching vietnamita-ingles y lectura de fechas, numeros y acronimos sin normalizador de texto. Los resultados declarados por el autor (WER del 0,16 % en vietnamita monolingue y 2,91 de UTMOSv2) situan al sistema por delante de otras alternativas abiertas para vietnamita segun la propia model card, si bien ninguna de esas metricas esta verificada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no describe la arquitectura interna; se distribuye como grafo ONNX) |
| Parametros totales | No disponible |
| Longitud de contexto | No disponible (modelo TTS; no se especifica limite de longitud de texto de entrada) |
| Tipos de cuantizacion | No disponible (se distribuye en formato ONNX; no se declaran variantes cuantizadas) |
| Idiomas soportados | Vietnamita (vi) como idioma principal; code-switching vietnamita-ingles y salida cross-lingual en ingles con referencia vocal vietnamita |
| Licencia | MIT |
| Formato de pesos | ONNX (libreria declarada: `onnx`; runtime: onnxruntime) |
| Autor | Phamhapaa1 |
| Repositorio de origen | zeroweight-ai/ZeroTTS |
| Tamano del repositorio | 0,9 GB |
| Pipeline | text-to-speech |
| Frecuencia de muestreo | 48 kHz (segun el ejemplo de streaming de la model card) |
| Clonacion de voz | Zero-shot, con 3 a 30 segundos de audio de referencia |
| Latencia hasta el primer audio | ~70 ms (declarado) |
| Factor de tiempo real (RTF) | ~0,5x (declarado, aproximadamente 2x mas rapido que tiempo real en CPU) |
| Descargas / likes en HuggingFace | 0 descargas / 0 likes |
| Fecha de creacion | 2026-09-13 |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye descripcion de la arquitectura, del volumen de datos de entrenamiento, de la composicion del dataset ni del uso de tecnicas de alineamiento como RLHF o DPO. La model card se limita a indicar que la voz clonada se representa como "un pequeno array latente" que se inserta en el modelo, de modo que la clonacion no requiere ajuste fino ni entrenamiento por hablante. No se especifican el tipo de decoder, el codificador acustico, el tokenizador de texto ni el modelo de speaker embedding empleado.

Los unicos elementos tecnicos documentados son de inferencia: exportacion a ONNX para su ejecucion con onnxruntime, sintesis en streaming con entrega incremental de fragmentos de audio a 48 kHz y un primer chunk disponible en aproximadamente 70 ms. El autor declara que el modelo funciona sin normalizador de texto, resolviendo directamente fechas como `31/12/2025` y acronimos como `ZeroTTS`, lo que sugiere un componente interno de normalizacion o un entrenamiento especifico sobre texto sin normalizar, aunque el mecanismo concreto no se detalla.

## Capacidades

- Sintesis de voz zero-shot en vietnamita con calidad de naturalidad declarada de 2,91 UTMOSv2.
- Clonacion de voz sin ajuste fino a partir de 3 a 30 segundos de audio de referencia, almacenando la identidad vocal como array latente.
- Sintesis en streaming con entrega del primer fragmento de audio en torno a 70 ms y generacion a ~2x tiempo real en CPU.
- Code-switching vietnamita-ingles dentro de la misma locucion (WER declarado del 0,97 % en esta configuracion).
- Salida cross-lingual: uso de un prompt vocal en vietnamita para generar habla en ingles (WER declarado del 1,42 %).
- Lectura de acronimos, fechas y numeros sin normalizador de texto externo (WER declarado del 1,75 % en el subconjunto "challenging").
- Ejecucion en CPU mediante ONNX Runtime, sin requerir GPU.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso (no aplica a un modelo TTS).
- No se documenta ninguna capacidad de vision, audio de entrada distinto de la referencia de voz, ni modo de razonamiento explicito.

## Casos de uso

- Audiolibros y narracion de formato largo en vietnamita: el modo streaming permite empezar a reproducir audio en aproximadamente 70 ms y mantener la generacion a ~2x tiempo real en CPU, lo que hace viable la sintesis de textos extensos en servidores sin GPU.
- Locucion de noticias con terminologia en ingles: el soporte de code-switching vietnamita-ingles (0,97 % de WER declarado) permite leer piezas periodisticas que mezclan ambas lenguas sin segmentar manualmente el texto.
- Asistentes de voz y agentes telefonicos en vietnamita: la baja latencia del primer fragmento y la ejecucion en CPU permiten desplegar la sintesis junto al motor de dialogo en el mismo nodo, sin depender de aceleradores.
- Accesibilidad y lectores de pantalla: conversion de texto a voz en vietnamita para interfaces de usuario, con la ventaja de que el modelo resuelve fechas, numeros y acronimos sin una capa de normalizacion adicional.
- Doblaje y localizacion de contenido: clonacion de voz a partir de 3 a 30 segundos de audio de un locutor para doblar material a vietnamita manteniendo la identidad vocal (similitud de hablante declarada de 0,936 en coseno con WavLM-SV).
- Generacion de voz cross-lingual: usar una referencia vocal en vietnamita para producir habla en ingles, util en produccion de contenido multilingue con un unico locutor de referencia.
- Lectura de documentos financieros, legales o administrativos: el manejo nativo de importes, fechas y acronimos reduce los errores de lectura en facturas, informes y contratos sin preprocesado del texto.
- Demos interactivas en navegador: el formato ONNX permite integraciones en cliente; la model card menciona un demo de navegador en el repositorio de codigo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card, medidos sobre el conjunto [ZeroBench-TTS](https://huggingface.co/datasets/zeroweight-ai/ZeroBench-TTS) (split de test). Ninguno de los valores esta verificado de forma independiente (`verified: false`).

| Tarea / configuracion | Metrica | Valor declarado |
|---|---|---|
| Zero-shot TTS (test general) | WER (%) sobre texto bruto | 1,03 |
| Zero-shot TTS (config `vietnamese`) | WER (%) sobre texto bruto | 0,16 |
| Zero-shot TTS (config `code_switch`) | WER (%) sobre texto bruto | 0,97 |
| Zero-shot TTS (config `cross_lingual`) | WER (%) sobre texto bruto | 1,42 |
| Zero-shot TTS (config `challenging`: acronimos, fechas, numeros) | WER (%) sobre texto bruto | 1,75 |
| Naturalidad | UTMOSv2 MOS | 2,91 |
| Similitud de hablante | Coseno con WavLM-SV | 0,936 |
| Silencio excesivo | Segundos | 0,029 |
| Velocidad de inferencia | RTF (declarado en la model card) | ~0,5x |

No se han proporcionado resultados comparativos contra otros modelos en la informacion disponible, mas alla de la afirmacion cualitativa de la model card de que el sistema tiene "4 veces menos errores de palabra que el siguiente mejor modelo" y de que su UTMOSv2 supera a "cualquier otro sistema abierto de vietnamita". Estas afirmaciones no vienen acompanadas de la tabla comparativa correspondiente en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo esta disenado explicitamente para ejecucion en CPU sin GPU, por lo que no se publican cifras de VRAM.
- Huella en disco: 0,9 GB segun el tamano del repositorio. No se declara el numero de parametros, de modo que no puede derivarse una cifra fiable de memoria en runtime a partir de ese dato.
- GPU recomendadas: no se especifica ninguna. El autor indica que no se requiere GPU.
- Compatibilidad con GPU de consumo: el modelo esta pensado para CPU; no se documenta ningun requisito ni beneficio de ejecutarlo en tarjetas como RTX 4090, A100 o H100.
- Opciones de despliegue: paquete Python `zerotts` (instalable con `pip install zerotts`), ONNX Runtime y, segun la model card, un demo de navegador. El uso de execution providers adicionales de ONNX Runtime (CUDA, DirectML, CoreML) no esta documentado por el autor.
- Frameworks no aplicables: al no ser un modelo de lenguaje, no procede su despliegue con vLLM, TGI ni llama.cpp.
- Latencia: ~70 ms hasta el primer fragmento de audio (declarado).
- Throughput: RTF ~0,5x, aproximadamente 2x mas rapido que tiempo real en la CPU de un portatil convencional (declarado). No se publican valores de throughput absoluto en caracteres por segundo ni el hardware exacto sobre el que se midio.

## Comparativa con modelos similares

Los datos de la siguiente tabla proceden de conocimiento general sobre cada proyecto y no de la informacion proporcionada en esta ficha; conviene verificarlos en la documentacion oficial de cada modelo antes de tomar decisiones de produccion. No se dispone de resultados de benchmarks comparativos en la informacion proporcionada.

| Modelo | Soporte de vietnamita | Clonacion de voz zero-shot | Licencia | Formato / despliegue |
|---|---|---|---|---|
| ZeroTTS (este repositorio) | Si, idioma nativo; con code-switching vi-en | Si, 3-30 s de referencia | MIT | ONNX / onnxruntime, CPU |
| XTTS-v2 (Coqui) | No incluido entre sus idiomas soportados | Si, ~6 s de referencia | Coqui Public Model License (uso comercial restringido) | PyTorch / Coqui TTS |
| F5-TTS | Centrado en ingles y chino; requiere ajuste para vietnamita | Si | MIT | PyTorch |
| CosyVoice 2 | Chino, ingles, japones y coreano principalmente | Si | Apache 2.0 | PyTorch |

## Limitaciones y advertencias

- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados (`verified: false`). No deben tratarse como mediciones independientes.
- La model card del repositorio corresponde al modelo `zeroweight-ai/ZeroTTS`, no a un modelo con identificador `Phamhapaa1/ZeroTTS-x2TL`. No se documenta en la informacion disponible que diferencias introduce este reempaquetado, ni si los pesos son identicos, cuantizados o modificados.
- El sufijo "x2TL" del nombre del repositorio no aparece explicado en ningun punto de la informacion proporcionada.
- El repositorio registra 0 descargas y 0 likes, y fue creado el 2026-09-13, por lo que carece de validacion por parte de la comunidad.
- Cobertura idiomatica muy limitada: el modelo esta disenado para vietnamita. El soporte de ingles es de tipo code-switching o cross-lingual a partir de una referencia vocal, no un multilingue generalista. No se documenta soporte de castellano.
- Riesgo de alucinacion y de errores de pronunciacion: el WER declarado aumenta hasta el 1,75 % en textos con acronimos, fechas y numeros, y hasta el 1,42 % en generacion cross-lingual. En dominios con nombres propios, siglas poco frecuentes o terminologia especializada el comportamiento no esta documentado.
- Riesgo de uso indebido de la clonacion de voz: la licencia MIT permite el uso comercial, pero no se documenta ningun mecanismo tecnico de consentimiento, marca de agua o deteccion de voz sintetica. La clonacion de una voz real exige consentimiento explicito del hablante y cumplimiento de la normativa aplicable sobre deepfakes y datos personales (en la UE, RGPD y el Reglamento de IA).
- No se documentan sesgos de generacion respecto a acentos regionales del vietnamita, genero, edad o caracteristicas de los hablantes de referencia.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion. Al ser un modelo derivado, conviene verificar que el repositorio de origen (`zeroweight-ai/ZeroTTS`) mantiene la misma licencia y que no existen condiciones adicionales.
- Ausencia de documentacion sobre arquitectura y datos de entrenamiento: no es posible auditar la procedencia de los datos de voz utilizados, lo que supone un riesgo de cumplimiento en despliegues comerciales.
- Las prestaciones declaradas en CPU (RTF ~0,5x, primer chunk ~70 ms) no especifican el hardware exacto de medida; el rendimiento real puede variar significativamente segun la CPU, el numero de hilos y la longitud del texto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Phamhapaa1/ZeroTTS-x2TL
- Modelo de origen referenciado en la model card: https://huggingface.co/zeroweight-ai/ZeroTTS
- Codigo, ejemplos y demo de navegador: https://github.com/zeroweight-ai/ZeroTTS
- Conjunto de evaluacion ZeroBench-TTS: https://huggingface.co/datasets/zeroweight-ai/ZeroBench-TTS
- Entrada de blog: https://zeroweight.ai/blog/zero-tts
- Referencia arXiv indicada en las etiquetas del repositorio: arXiv:2602.10934 (no se proporciona URL directa ni se incluye el articulo en la informacion disponible)
- Los resultados de la busqueda web realizada no contienen enlaces relevantes para este modelo; unicamente devuelven articulos sobre finanzas descentralizadas (DeFi) y yield farming, sin relacion con el modelo.
