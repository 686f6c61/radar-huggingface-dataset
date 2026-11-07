# Mapaor/pix2text-mfr-1.5-web

## Resumen

`Mapaor/pix2text-mfr-1.5-web` es una variante del modelo de reconocimiento de formulas matematicas (MFR) Pix2Text-MFR-1.5 de breezedeus, adaptada para su ejecucion en navegador. El objetivo declarado es permitir el reconocimiento de formulas matematicas en el lado del cliente (client-side), lo que evita enviar imagenes a un servidor y reduce la latencia y los costes de infraestructura. La adaptacion se centra en habilitar una cache KV real en el decodificador, ya que el modelo original no la tenia configurada para exportacion ONNX.

El modelo hereda la arquitectura TrOCR de Microsoft (transformer encoder-decoder para vision a texto), reentrenada por Pix2Text sobre un corpus de imagenes de formulas matematicas para producir LaTeX. La version `-web` no modifica el entrenamiento, sino el grafo exportado: separa encoder y decodificador en ONNX y anade entradas `past_key_values` y salidas `present_key_values` en cada capa del decodificador, lo que permite decodificacion token a token sin recalcular toda la secuencia.

La relevancia actual radica en la tendencia a ejecutar modelos de vision-lenguaje pequenos directamente en el navegador mediante WebGPU y WASM. Este repositorio es, a fecha de la informacion disponible, un proyecto en fase de publicacion inicial: la unica variante liberada es FP32 con cache KV, con FP16 e INT8 anunciadas como futuras. No hay descargas ni likes registrados, y la model card describe un plan de implementacion mas que resultados finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (transformer encoder-decoder vision-a-texto), exportada a ONNX con encoder y decodificador separados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la longitud maxima de secuencia del decodificador TrOCR original) |
| Tipos de cuantizacion | FP32 (unica variante publicada); FP16 e INT8 anunciadas como futuras |
| Idiomas soportados | no disponible (la salida es LaTeX, independiente del idioma natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (variante `fp32/` con cache KV; se preserva el ONNX FP32 original como baseline) |

## Arquitectura y entrenamiento

El modelo base es Pix2Text-MFR-1.5, que emplea la arquitectura TrOCR de Microsoft: un encoder de vision (transformer) que procesa la imagen de la formula y un decodificador autorregresivo que genera la secuencia LaTeX correspondiente. Pix2Text parte de los pesos iniciales de TrOCR y reentrena el modelo con un dataset de imagenes de formulas matematicas. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion de esta variante `-web` es puramente de despliegue: se exporta un checkpoint PyTorch a ONNX con el decodificador exponiendo entradas `past_key_values` y salidas `present_key_values` en cada capa, de modo que la inferencia en navegador solo procesa el token recien generado en cada paso. La model card subraya que activar `use_cache: true` en la configuracion no basta: el grafo exportado debe exponer explicitamente esas entradas y salidas. El plan incluye validacion de paridad token a token frente al baseline FP32 sin cache, con tolerancias documentadas para cualquier diferencia numerica, y benchmarks comparativos de los execution providers WASM y WebGPU.

## Capacidades

- Reconocimiento de formulas matematicas a partir de imagenes, con salida en LaTeX.
- Conversion imagen-a-texto mediante arquitectura encoder-decoder (vision transformer + decodificador autorregresivo).
- Decodificacion con cache KV real en ONNX, lo que reduce el coste computacional por token generado.
- Ejecucion en navegador mediante WebGPU con fallback a WASM.
- Carga de modelos desde URLs apuntando a directorios de variante (`fp32/`), sin asumir que el modelo esta en la raiz del repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general (mas alla de formulas) ni audio.

## Casos de uso

- Edicion de apuntes cientificos en web: un editor Markdown o LaTeX podria integrar el modelo via `pix2text-mfr-web` para que el usuario recorte una formula de una imagen y obtenga el LaTeX sin salir del navegador, gracias a la inferencia client-side.
- Digitalizacion de articulos academicos en el navegador: extensiones o aplicaciones web que procesan PDFs o capturas y extraen formulas para reutilizarlas en gestores de referencias, sin enviar contenido a servidores externos.
- Plataformas educativas: ejercicios de matematicas donde el alumno fotografia su desarrollo y la aplicacion transcribe las formulas a LaTeX para evaluacion automatica, con la ventaja de que la imagen no abandona el dispositivo.
- Herramientas de accesibilidad: conversion de formulas en imagenes a texto LaTeX que pueda ser leido por lectores de pantalla o procesado por sintetizadores, ejecutandose localmente.
- Procesamiento por lotes en el cliente: aplicaciones de escritorio o PWA que reconocen lotes de formulas de un cuaderno escaneado usando WebGPU cuando esta disponible y WASM como fallback.
- Privacidad en entornos regulados: investigacion clinica o industrial donde las imagenes contienen datos sensibles y no pueden enviarse a APIs en la nube; el modelo permite OCR matematico completamente local.
- Integracion en pipelines de documentacion tecnica: generacion automatica de fragmentos LaTeX a partir de capturas de formulas para wikis internas, aprovechando la cache KV para reducir la latencia en decodificaciones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe un plan para medir tiempo de descarga e inicializacion del modelo, latencia del primer token, latencia total de reconocimiento, memoria pico y comportamiento del fallback WebGPU/WASM, pero no incluye cifras. Tampoco se proporcionan resultados de MMLU, HumanEval, GSM8K ni metricas especificas de MFR (por ejemplo, tasa de acierto en LaTeX o distancia de edicion) para este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse en navegador, el consumo depende del backend. La variante FP32 es la mas exigente en memoria y ancho de banda.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el execution provider `webgpu`; en su ausencia, el modelo funciona via WASM en CPU.
- Cabe en GPU de consumo: si, siempre que el navegador exponga WebGPU (navegadores Chromium recientes en GPUs integradas o dedicadas). No se especifican minimos de VRAM.
- Opciones de despliegue: `pix2text-mfr-web` (runtime JavaScript con ONNX Runtime Web), execution providers WASM y WebGPU; el modelo se sirve como artefactos ONNX desde Hugging Face.
- Latencia y throughput estimados: no disponibles; la model card indica que deben medirse antes de la publicacion y que la decodificacion con cache debe mejorar o no degradar la experiencia frente al baseline.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mapaor/pix2text-mfr-1.5-web | TrOCR ONNX con cache KV para navegador | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| breezedeus/pix2text-mfr-1.5 | TrOCR (PyTorch/ONNX) | no disponible | no disponible | no disponible en la informacion consultada | Hugging Face, modelo upstream |
| TrOCR (Microsoft) | Transformer encoder-decoder vision-a-texto | no disponible | no disponible | no disponible en la informacion consultada | Modelo base de partida |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Proyecto en fase inicial: solo existe la variante FP32; FP16 e INT8 estan anunciadas pero no publicadas. El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en produccion.
- La licencia no esta indicada en la informacion disponible; antes de cualquier uso comercial debe verificarse la licencia del modelo upstream `breezedeus/pix2text-mfr-1.5` y de los pesos TrOCR originales.
- El modelo esta especializado exclusivamente en formulas matematicas; no es un OCR general ni un modelo de vision-lenguaje.
- Riesgo de alucinacion en LaTeX: como todo modelo generativo, puede producir comandos o estructuras incorrectas, especialmente en formulas borrosas, manuscritas o con notacion poco comun. No se documentan tasas de error.
- La paridad con el baseline FP32 sin cache aun debe validarse segun el plan del autor; diferencias numericas intencionadas deben documentarse con tolerancias.
- Dependencia de WebGPU para rendimiento aceptable; el fallback WASM puede ser sensiblemente mas lento segun el dispositivo.
- No se documentan sesgos, cobertura idiomatica ni limitaciones de longitud de secuencia en la informacion disponible.
- La fecha de creacion del repositorio (2026-11-07) y la ausencia de documentacion de resultados sugieren que la model card describe un plan de trabajo mas que un artefacto final validado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mapaor/pix2text-mfr-1.5-web
- Repositorio del runtime: https://github.com/Mapaor/pix2text-mfr-web/
- Modelo upstream: https://huggingface.co/breezedeus/pix2text-mfr-1.5
- Ficha de archivos ONNX del modelo upstream: https://onnx.bimant.com/models/breezedeus/pix2text-mfr-1.5
