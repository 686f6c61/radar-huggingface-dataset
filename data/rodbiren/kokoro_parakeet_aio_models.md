# rodbiren/kokoro_parakeet_aio_models

## Resumen

`rodbiren/kokoro_parakeet_aio_models` es un repositorio de recursos listos para ejecutar (assets precompilados) para dos motores de inferencia independientes escritos en C++ y pensados para CPU. No es un modelo entrenado por el autor: el repositorio empaqueta los pesos y recursos auxiliares de dos modelos de terceros para que los motores puedan descargarlos en un unico punto y funcionar sin ningun paso previo en Python. El autor es rodbiren y el repo ocupa 0,5 GB.

El paquete cubre dos tareas complementarias. Por un lado, `kokoro/` contiene un volcado de pesos de Kokoro-82M (texto a voz, licencia Apache 2.0) junto con voces, vocabulario de fonemas y recursos de grafema-a-fonema (G2P). Por otro, `parakeet/` contiene copias sin modificar de `moondream/parakeet-redux` (reconocimiento de voz, CC-BY-4.0), que es la version ternaria de `nvidia/parakeet-tdt-0.6b-v3`.

La relevancia es de ingenieria de despliegue: permite montar TTS y ASR sobre CPU sin dependencias de Python, integrando ambos flujos en aplicaciones nativas. El repositorio no aporta benchmarks propios ni modelos nuevos, y registra 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bundle de dos modelos independientes. Kokoro-82M (texto a voz) y parakeet-redux (reconocimiento de voz, version ternaria de nvidia/parakeet-tdt-0.6b-v3). Arquitectura interna no detallada en la model card |
| Parametros totales | Kokoro-82M: unos 82 millones (segun el nombre del modelo base). Parakeet: 0,6 mil millones (parakeet-tdt-0.6b-v3) |
| Parametros activos | no aplica (ninguno de los dos es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Kokoro: pesos exportados en f32 plano con weight norm plegada; el adivinador G2P va en f16. Parakeet: pesos ternarios |
| Idiomas soportados | no declarados en la model card. Los recursos de Kokoro incluidos (voces af_heart, am_michael, bf_emma y lexico de pronunciacion) corresponden a ingles |
| Licencia | mixta: `kokoro/` bajo Apache 2.0 y `parakeet/` bajo CC-BY-4.0 |
| Formato de pesos | Kokoro: `kokoro.bin` + `kokoro.tsv` (blob little-endian f32 + indice de tensores). Parakeet: `model.safetensors` + `tokenizer.json` |

## Arquitectura y entrenamiento

El repositorio no describe entrenamiento propio. En `kokoro/` se publica `kokoro-v1_0.pth` de `hexgrad/Kokoro-82M` convertido a un unico blob little-endian f32 con la normalizacion de pesos plegada, mas un indice `kokoro.tsv` con nombre, desplazamiento en floats y forma de cada tensor. Los pesos son numericamente identicos al checkpoint original y son reproducibles con `tools/export_weights.py` del repositorio del motor `kokoallovero`. Se incluyen ademas tres paquetes de voz (`af_heart`, `am_michael`, `bf_emma`), el vocabulario de fonemas (`vocab.tsv`) y tres componentes G2P: un lexico de pronunciacion inglesa con variantes por categoria gramatical, un etiquetador de categorias gramaticales de perceptron promediado destilado de spaCy `en_core_web_sm` (para desambiguar homografos) y un pequeno transformer caracter-a-fonema en f16 para palabras ausentes del lexico. Los recursos G2P se construyeron a partir de un lexico y un corpus no publicados, por lo que no son reproducibles desde el checkpoint.

En `parakeet/` se incluyen copias sin modificar de `model.safetensors` y `tokenizer.json` de `moondream/parakeet-redux`, la version ternaria de `nvidia/parakeet-tdt-0.6b-v3`. El autor solo los replica para que ambos motores descarguen desde un unico origen; la autoria y la licencia corresponden a moondream y NVIDIA.

## Capacidades

- Sintesis de voz (texto a voz) mediante Kokoro-82M, con tres voces incluidas: `af_heart` y `am_michael` (ingles americano) y `bf_emma` (ingles britanico).
- Reconocimiento automatico de voz (ASR) mediante parakeet-redux, la variante ternaria de parakeet-tdt-0.6b-v3.
- Grafema-a-fonema completo: lexico con variantes por categoria gramatical, etiquetado de categorias gramaticales para homografos y un transformer adivinador para palabras fuera del lexico.
- Vocabulario de fonemas de Kokoro expuesto como tabla de codigo de punto a identificador.
- Inferencia en CPU sin dependencia de Python.
- Integracion directa en aplicaciones C++ a traves de los motores `kokoallovero` y `parakeetogo`.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada para el TTS ni razonamiento multi-paso; no disponible.

## Casos de uso

- Lectura de texto en voz alta en aplicaciones nativas: Kokoro-82M sintetiza voz en CPU con pesos f32 y una de las tres voces incluidas, sin necesidad de entorno Python, lo que facilita el empaquetado en binarios de escritorio.
- Accesibilidad en aplicaciones de escritorio: conversion de texto a voz para lectores de pantalla o asistentes, ejecutandose enteramente en local y sin llamadas a servicios externos.
- Transcripcion y subtitulado offline: parakeet-redux procesa audio a texto en CPU, util para generar subtitulos en herramientas de edicion sin subir contenido a la nube.
- Asistentes de voz bidireccionales: encadenar parakeet (voz a texto) y Kokoro (texto a voz) dentro de la misma aplicacion C++ para construir un bucle conversacional de voz completamente local.
- Procesamiento por lotes de audio en servidores sin GPU: al ser motores C++ orientados a CPU, encajan en entornos de CI/CD o granjas de CPU donde no hay aceleradores disponibles.
- Aplicaciones con requisitos de privacidad: al ejecutarse en local y no requerir Python ni servicios remotos, el par ASR/TTS es adecuado para tratamiento de audio sensible en dispositivos controlados.
- Prototipado de pipelines de doblaje o audiolibros: Kokoro genera la pista de voz y parakeet permite verificar o alinear la transcripcion resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad de sintesis (MOS), tasas de error de reconocimiento (WER) ni medidas de latencia o throughput para ninguna de las dos tareas.

## Requisitos de hardware

- Diseno para inferencia en CPU: ambos motores son C++ nativos y no exigen GPU.
- Kokoro-82M: pesos en f32, aproximadamente 328 MB solo para los parametros del modelo; a esto se suman voces, vocabulario y recursos G2P.
- Parakeet: 0,6 mil millones de parametros en formato ternario, con un peso en disco muy inferior al de una version f32 equivalente.
- Huella total del repositorio: 0,5 GB, por lo que el conjunto completo cabe en la memoria RAM de cualquier equipo moderno.
- GPU: no son necesarias. No se documentan requisitos ni recomendaciones de GPU especificas (A100, H100, RTX 4090).
- Opciones de despliegue: motores propios `kokoallovero` (TTS) y `parakeetogo` (ASR). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a cargas de TTS/ASR de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kokoro-82M (incluido en este repo) | TTS | ~82 M | Apache 2.0 | blob f32 + TSV | hexgrad/Kokoro-82M |
| parakeet-redux / parakeet-tdt-0.6b-v3 (incluido en este repo) | ASR | 0,6 B (ternario) | CC-BY-4.0 | safetensors | moondream/parakeet-redux, nvidia/parakeet-tdt-0.6b-v3 |
| Alternativas de TTS de tamano similar | TTS | no disponible | no disponible | no disponible | no disponible |
| Alternativas de ASR de tamano similar | ASR | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento frente a otros modelos de TTS o ASR en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor del repositorio: es un paquete de assets que redistribuye pesos de Kokoro-82M y de parakeet-redux.
- Licencias mixtas: cada componente tiene su propia licencia (`kokoro/` Apache 2.0, `parakeet/` CC-BY-4.0). El uso comercial exige cumplir ambas por separado y mantener la atribucion a hexgrad, moondream y NVIDIA.
- Los recursos G2P de Kokoro (lexico, etiquetador y corpus) no son reproducibles: se construyeron a partir de un lexico y un corpus no publicados.
- Solo se incluyen tres voces de Kokoro, todas en ingles; no se declaran idiomas soportados en la model card.
- La version ternaria de parakeet implica menor precision numerica que una version completa; no se documentan sus efectos en la tasa de error.
- Riesgo de alucinacion y de errores de transcripcion o pronunciacion no cuantificado: no hay benchmarks publicados.
- Repositorio sin traccion: 0 descargas y 0 "likes", por lo que no existe validacion de la comunidad.
- La fecha de creacion registrada (2026-10-02) es posterior a la actual, lo que sugiere una anomalia en los metadatos; conviene verificarla.
- No se documentan limites de longitud de contexto ni de duracion de audio de entrada o salida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rodbiren/kokoro_parakeet_aio_models
- Motor TTS (kokoallovero): https://github.com/RobViren/kokoallovero
- Motor ASR (parakeetogo): https://github.com/RobViren/parakeetogo
- Modelo base de TTS (hexgrad/Kokoro-82M): https://huggingface.co/hexgrad/Kokoro-82M
- Modelo base de ASR (moondream/parakeet-redux): https://huggingface.co/moondream/parakeet-redux
- Modelo original de NVIDIA (nvidia/parakeet-tdt-0.6b-v3): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
