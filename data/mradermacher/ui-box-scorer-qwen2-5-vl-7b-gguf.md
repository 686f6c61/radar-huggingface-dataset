# mradermacher/UI-Box-Scorer-Qwen2.5-VL-7B-GGUF

## Resumen

UI-Box-Scorer-Qwen2.5-VL-7B-GGUF es la version cuantizada en formato GGUF del modelo likaixin/UI-Box-Scorer-Qwen2.5-VL-7B, un modelo vision-lenguaje de 7.615.616.512 parametros construido sobre la arquitectura Qwen2.5-VL. Lo publica mradermacher, un conocido generador de cuantizaciones GGUF de la comunidad, y esta pensado para ejecutar el modelo original en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo base es un derivado especializado de Qwen2.5-VL-7B orientado a la evaluacion y puntuacion de cajas (bounding boxes) en interfaces de usuario, una tarea relevante para pipelines de automatizacion de UI, agentes que operan navegadores y sistemas de comprension de capturas de pantalla. La cuantizacion permite desplegar esta capacidad en GPU de consumo, algo inviable con los pesos en f16 originales.

Esta ficha cubre la version GGUF publicada por mradermacher. La informacion disponible sobre el modelo base es limitada: la model card del repositorio cuantizado solo describe el proceso de cuantizacion, no las capacidades, datos de entrenamiento ni benchmarks del modelo original, por lo que varios apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer vision-lenguaje (base Qwen2.5-VL); detalles internos no disponibles |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (incluye ficheros mmproj para el codificador visual) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-VL-7B, un transformer multimodal de la familia Qwen2.5-VL que combina un codificador visual con un decodificador de lenguaje. El modelo likaixin/UI-Box-Scorer-Qwen2.5-VL-7B es un ajuste fino de ese base orientado a la puntuacion de cajas de interfaz; no se dispone de informacion publica en la documentacion consultada sobre el dataset de ajuste, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

La contribucion del repositorio de mradermacher es exclusivamente la cuantizacion estatica a GGUF (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin reentrenamiento. Se ofrecen variantes estaticas y, en un repositorio separado, variantes con imatrix (i1-GGUF) que suelen preservar mejor la calidad en tamanos bajos. El repositorio incluye ficheros mmproj en Q8_0 y f16, necesarios para procesar imagenes con llama.cpp.

## Capacidades

- Procesamiento de imagenes y texto (modelo vision-lenguaje), segun la arquitectura Qwen2.5-VL del modelo base.
- Puntuacion y evaluacion de cajas delimitadoras (bounding boxes) en interfaces de usuario, proposito declarado por el nombre del modelo.
- Generacion de texto conversacional (tag conversational en el repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (en).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluacion de detectores de UI: usar el modelo para puntuar la calidad de cajas delimitadoras generadas por otro sistema sobre capturas de pantalla, como etapa de validacion en un pipeline de vision por computador.
- Automatizacion de pruebas de interfaz: dado un screenshot de una aplicacion, el modelo puede evaluar si los elementos identificados por el sistema de test corresponden a las regiones esperadas.
- Agentes que operan navegador: integrar el modelo como componente de verificacion de localizacion de elementos antes de ejecutar clics o acciones, reduciendo errores de interaccion.
- Anotacion asistida de datasets de UI: pre-puntuar cajas candidatas para acelerar el etiquetado humano de corpus de interfaces.
- Despliegue en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB), puede ejecutarse en GPUs de gama media mediante llama.cpp.
- Prototipado local sin conexion: al ser un GGUF con licencia MIT, permite experimentar con un modelo multimodal de UI en entornos aislados o embebidos.
- Filtrado de calidad en pipelines de datos: descartar automaticamente pares imagen-caja de baja calidad en la construccion de datasets de interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K ~3,1 GB; Q3_K_M ~3,9 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB.
- Hay que sumar el fichero mmproj del codificador visual: 1,0 GB (Q8_0) o 1,5 GB (f16).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 o superiores para cuantizaciones medias y altas; A100/H100 para f16 o despliegues concurrentes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando Q4_K_M o Q5_K_M junto con mmproj Q8_0; con 6 GB conviene bajar a Q3_K_M o IQ4_XS.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python) para GGUF; el modelo base en transformers/vLLM requiere los pesos originales, no estos ficheros.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| UI-Box-Scorer-Qwen2.5-VL-7B-GGUF (este) | 7,6 B | no disponible | MIT | GGUF | Cuantizado por mradermacher, especializado en puntuacion de cajas de UI |
| likaixin/UI-Box-Scorer-Qwen2.5-VL-7B | 7,6 B | no disponible | MIT | safetensors (presumiblemente) | Modelo base sin cuantizar |
| Qwen2.5-VL-7B (original) | ~7,6 B | no disponible en esta ficha | Apache 2.0 (segun el modelo original de Qwen) | safetensors, GGUF de terceros | Modelo generalista vision-lenguaje, sin el ajuste especifico de UI |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La model card del repositorio cuantizado no documenta sesgos, tasas de alucinacion ni evaluaciones de robustez del modelo base; se desconoce su comportamiento fuera del dominio de interfaces de usuario.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- La longitud de contexto no esta disponible en la informacion consultada.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar la precision en tareas de localizacion fina de cajas; para produccion se recomienda Q5_K_M o superior.
- El modelo esta especializado en puntuacion de cajas de UI; usarlo como modelo generalista de vision o de chat puede dar resultados pobres.
- Licencia MIT: permite uso comercial y modificacion, pero conviene verificar las condiciones del modelo base original de Qwen2.5-VL de las que deriva.
- Es una cuantizacion de terceros: no hay garantia de equivalencia numerica exacta con el modelo original en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/UI-Box-Scorer-Qwen2.5-VL-7B-GGUF
- Modelo base: https://huggingface.co/likaixin/UI-Box-Scorer-Qwen2.5-VL-7B
- Variantes con imatrix: https://huggingface.co/mradermacher/UI-Box-Scorer-Qwen2.5-VL-7B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#UI-Box-Scorer-Qwen2.5-VL-7B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
