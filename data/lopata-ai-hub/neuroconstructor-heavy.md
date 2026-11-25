# LOPATA-AI-Hub/neuroconstructor-heavy

## Resumen

LOPATA Neuroconstructor · Heavy es un paquete especializado local, publicado por LOPATA-AI-Hub, que resuelve una tarea muy concreta: dada una pantalla con una rejilla de cuatro iconos, una instruccion corta y dos grabaciones de voz, devolver el numero de la celda seleccionada. No es un modelo de lenguaje general, sino un ensamblaje fusionado de diez componentes preentrenados (ASR, vision, OCR y embeddings) unidos mediante conexiones aprendidas y empaquetados en un unico artefacto ejecutable en local.

El paquete se apoya en Qwen3-ASR-1.7B para el procesamiento de audio y en Qwen3-VL-8B-Instruct para la extraccion de caracteristicas visuales, ademas de componentes de OCR de PaddlePaddle (PP-OCRv5 y PaddleOCR-VL), parsers visuales de Microsoft (OmniParser-v2.0, Florence-2-base y Florence-2-base-ft) y un modelo de embeddings multilingue (paraphrase-multilingual-MiniLM-L12-v2). El resultado se exporta como un fichero `.lopatanet` de 26,3 GB que se ejecuta con el runtime `lopata-neuro` 1.2.0.

Su relevancia es experimental y acotada: el autor publica metricas de una unica tarea sintetica de seleccion de iconos (15/32 antes del entrenamiento de conexiones, 18/32 despues), junto con la latencia medida en un equipo concreto (i9-13900KF y RTX 4090). Es un artefacto de investigacion reproducible, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblaje multimodal de componentes (ASR, vision-lenguaje, OCR, embeddings) con conexiones aprendidas; no es un transformer unico |
| Parametros totales | no disponible (el artefacto pesa 26.282.819.523 bytes; los componentes individuales suman varios miles de millones, pero el total fusionado no se declara) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato de paquete propietario `.lopatanet`, no cuantizable de forma estandar) |
| Idiomas soportados | ru, en |
| Licencia | other (component-specific); atribuciones en ATTRIBUTION.md |
| Formato de pesos | `.lopatanet` (paquete propietario, formato 2); componentes subyacentes en sus formatos originales |

## Arquitectura y entrenamiento

El sistema no es un modelo monolítico entrenado de cero, sino una composicion de diez modelos base: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, `microsoft/OmniParser-v2.0`, `microsoft/Florence-2-base`, `microsoft/Florence-2-base-ft`, `PaddlePaddle/PP-OCRv5_mobile_det`, `PaddlePaddle/en_PP-OCRv5_mobile_rec`, `PaddlePaddle/eslav_PP-OCRv5_mobile_rec`, `PaddlePaddle/PaddleOCR-VL`, `Qwen/Qwen3-ASR-1.7B` y `Qwen/Qwen3-VL-8B-Instruct`. La entrada es una pantalla 2x2, una instruccion que selecciona la primera o la segunda de dos grabaciones WAV PCM mono, y las propias grabaciones; la salida es una posicion (0 = arriba a la izquierda).

El "entrenamiento" descrito consiste en aprender las conexiones entre estos componentes, no en ajustar sus pesos: el autor reporta 64 ejemplos de entrenamiento, 24 de validacion y 32 comandos reservados. Se realizaron seis ciclos completos y se exporto el ciclo 1 como version final para los 24 ejemplos de validacion. El paquete se exporto desde LOPATA 0.9.4-dev. No se detalla la composicion del dataset mas alla de que la tarea es sintetica, ni se mencionan tecnicas como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Seleccion de iconos en pantalla: dado un layout 2x2 y una instruccion, devuelve la celda elegida (0 a 3).
- Procesamiento de audio: transcripcion y comprension de dos grabaciones WAV PCM mono mediante Qwen3-ASR-1.7B.
- Comprension visual: extraccion de caracteristicas de la pantalla mediante Qwen3-VL-8B-Instruct, OmniParser-v2.0 y Florence-2.
- OCR: deteccion y reconocimiento de texto en pantalla con PP-OCRv5 (modelos `en` y `eslav`) y PaddleOCR-VL.
- Embeddings multilingues: representacion semantica de instrucciones con paraphrase-multilingual-MiniLM-L12-v2.
- Ejecucion offline: el runtime `lopata-neuro` 1.2.0 puede ejecutar el paquete sin conexion una vez instaladas las dependencias locales.
- Idiomas de trabajo: ruso e ingles.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, generacion de texto libre, codigo ni matematicas.

## Casos de uso

- Investigacion sobre composicion de modelos: el paquete sirve como caso reproducible para estudiar como se combinan diez componentes preentrenados mediante conexiones aprendidas, con metricas publicadas y artefacto descargable.
- Prototipado de interfaces por voz: un sistema que recibe una instruccion hablada y una captura de pantalla para seleccionar un icono entre cuatro, util como base para asistentes de accesibilidad.
- Automatizacion de pruebas de UI: dado un layout de cuatro iconos y una instruccion, verificar que el elemento seleccionado coincide con el esperado en un pipeline de CI.
- Benchmarking de latencia en local: el autor publica latencias (3,61 s y 2,52 s por tarea en i9-13900KF + RTX 4090) que permiten comparar configuraciones de hardware.
- Evaluacion de OCR multilingue: el uso de PP-OCRv5 en variantes `en` y `eslav` permite probar deteccion de texto en pantallas con contenido en ingles y lenguas eslavas.
- Demostracion educativa de pipelines multimodales: el espacio de Hugging Face permite escuchar y comparar respuestas, util para docencia sobre sistemas ASR + vision.
- Reproduccion de experimentos: el artefacto con SHA-256 publicado facilita replicar los resultados 15/32 y 18/32 en el mismo hardware.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en 32 tareas reservadas (ejecucion independiente) | 15/32 |
| Precision en 32 tareas reservadas (tras entrenar conexiones) | 18/32 |
| Precision en conjunto adicional 1 | 24/48 |
| Precision en conjunto adicional 2 | 37/64 |
| Latencia media por tarea (antes de cargar modelos) | 3,61 s |
| Latencia media por tarea (despues de cargar modelos) | 2,52 s |
| Hardware de medida | Intel i9-13900KF + NVIDIA RTX 4090 |
| Trafico por tarea (mensajes de grafo contados) | 2.144 bytes |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores corresponden exclusivamente a la tarea sintetica de seleccion de iconos definida por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desglosada; el paquete completo ocupa 26,3 GB en disco y requiere cargar Qwen3-VL-8B-Instruct y Qwen3-ASR-1.7B, por lo que se necesita una GPU con memoria suficiente para ambos (orientativamente 16-24 GB, aunque el autor no lo especifica).
- GPU recomendadas: el autor valida el sistema en una NVIDIA RTX 4090; no se documentan pruebas en A100, H100 ni otras GPU.
- Compatibilidad con GPU de consumo: si, segun la unica prueba publicada en RTX 4090.
- Opciones de despliegue: runtime propietario `lopata-neuro` 1.2.0 (wheel probado y release de codigo fuente disponibles en el espacio de Hugging Face). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 3,61 s por tarea antes de cargar los modelos y 2,52 s despues, medidos en el hardware indicado. No se publica throughput agregado.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (ensamblajes multimodales empaquetados para seleccion de iconos por voz). Los componentes individuales (Qwen3-VL-8B-Instruct, Qwen3-ASR-1.7B, Florence-2-base) si tienen alternativas publicas, pero el artefacto fusionado no es directamente comparable con ellos.

## Limitaciones y advertencias

- Alcance muy restringido: solo resuelve una tarea sintetica de seleccion entre cuatro celdas; no es un modelo de proposito general ni admite instrucciones arbitrarias.
- Precision limitada: 18/32 en el conjunto reservado tras el entrenamiento de conexiones, es decir, menos del 60 % de acierto.
- Entrenamiento minimo: 64 ejemplos de entrenamiento y 24 de validacion, con una unica tarea y un unico hardware de evaluacion; riesgo alto de sobreajuste y de falta de generalizacion.
- Idiomas: solo ruso e ingles; sin soporte documentado para castellano.
- Licencia: `other` con condiciones por componente; es imprescindible revisar ATTRIBUTION.md antes de cualquier uso comercial, ya que cada modelo base puede tener terminos distintos.
- Formato propietario: el paquete `.lopatanet` no es compatible con toolchains estandar (vLLM, llama.cpp, TGI) y depende del runtime `lopata-neuro` 1.2.0.
- Riesgo de alucinacion: no evaluado por el autor; al combinar ASR y vision, errores de transcripcion o de OCR pueden propagarse a la seleccion final.
- Sesgos: no documentados.
- Reproducibilidad: las metricas provienen de una unica maquina y de un unico conjunto sintetico; no hay validacion externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LOPATA-AI-Hub/neuroconstructor-heavy
- Artefacto descargable: https://huggingface.co/LOPATA-AI-Hub/neuroconstructor-heavy/resolve/main/LOPATA-heavy-6.lopatanet?download=true
- Atribuciones y terminos: https://huggingface.co/LOPATA-AI-Hub/neuroconstructor-heavy/blob/main/ATTRIBUTION.md
- Espacio de estudio y comparacion: https://huggingface.co/spaces/LOPATA-AI-Hub/neuroconstructor-study
- Instrucciones de ejecucion: https://huggingface.co/spaces/LOPATA-AI-Hub/neuroconstructor-study/blob/main/RUN.md
- Estudio y ajustes: https://huggingface.co/spaces/LOPATA-AI-Hub/neuroconstructor-study/blob/main/STUDY.md
- Repositorio GitHub: https://github.com/PiTrolKun/LOPATA
- Perfil del autor en GitHub: https://github.com/PiTrolKun
- YouTube: https://youtube.com/@lopata_ai_hub
- VK: https://vk.ru/lopata_ai_localhub
