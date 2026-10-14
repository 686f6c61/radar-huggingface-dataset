# Ensayo003/analogMadnessKrea2Turbo_v40_fp8

## Resumen

analogMadnessKrea2Turbo_v40_fp8 es un checkpoint de generación de imágenes por difusión, no un modelo de lenguaje. Se trata de una variante cuantizada en FP8 del modelo Analog Madness Krea2-Turbo, un ajuste de estilo fotográfico realista ("analog madness") construido sobre Krea 2 Turbo (Krea 2 OSS). El repositorio de HuggingFace está publicado por el usuario Ensayo003, que actúa como re-subidor; el trabajo original corresponde al creador conocido como Brasileiro Maniaco, según las fichas de Civitai y TensorHub.

El artefacto distribuido ocupa 12,8 GB en formato safetensors y contiene pesos cuantizados a float8_e4m3fn, una práctica habitual para reducir el peso del transformer original de Krea 2 (aproximadamente 24,76 GiB en BF16) y hacerlo ejecutable en GPU de consumo de 16 GB y 24 GB. La información pública es extremadamente escasa: no hay pipeline declarado, ni idiomas, ni licencia, ni benchmarks, ni model card más allá de una línea de licencia "unknown".

Por su naturaleza y por los datos disponibles, esta ficha describe un modelo de texto-a-imagen orientado a resultados fotorrealistas con estética analógica, pensado para flujos de trabajo de Stable Diffusion (ComfyUI, Forge, Automatic1111) y no para tareas de razonamiento, código o agentes. Cualquier dato de arquitectura, entrenamiento o rendimiento que no esté confirmado por las fuentes se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT), heredada de Krea 2 OSS Turbo según fuentes externas; no confirmada explícitamente para este checkpoint |
| Parametros totales | no disponible (el fichero FP8 en safetensors ocupa 12,8 GB; el original BF16 citado es de 24,76 GiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | FP8 (float8_e4m3fn); el original en BF16 |
| Idiomas soportados | no disponible |
| Licencia | unknown |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

No hay información publicada en el repositorio de HuggingFace sobre la arquitectura, el dataset de entrenamiento, el número de tokens o imágenes visto, ni sobre si se aplicaron fases de ajuste fino con preferencias humanas. Por las fuentes externas (Civitai, TensorHub), el modelo base es Krea 2 OSS (Turbo), un transformer de difusión del que se distribuyen pesos optimizados en FP8 con cuantización solo de pesos ("weight-only"). El repositorio que nos ocupa añade el apelativo "Analog Madness", lo que indica un ajuste o fusión orientada a un look fotográfico analógico, pero no se detalla el proceso de mezcla ni los pasos de entrenamiento.

La innovación técnica documentada no está en este checkpoint concreto, sino en la cadena de la que deriva: la cuantización FP8 reduce el peso de 24,76 GiB (BF16) a aproximadamente 12,01 GiB en el modelo base, lo que abarata el despliegue en hardware de consumo. En cuanto a parámetros de muestreo, las fichas del modelo original recomiendan, para las versiones V3/V4, 8 pasos con CFG 1 y sampler euler/beta; para la V2, 20 pasos con CFG 1 y sampler er_sde/simple. No se dispone de información sobre regularización, embeddings adicionales ni técnicas de decodificación especulativa (no aplicables a difusión).

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto, con estética fotográfica analógica.
- Muestreo rápido: configuraciones recomendadas de 8 pasos con CFG 1 en las versiones V3/V4.
- Compatible con el ecosistema de checkpoints de Stable Diffusion (Krea 2), por lo que admite prompts positivos y negativos, seeds y variaciones.
- Orientado a retratos, escenas y fotografía realista; no está pensado para ilustración técnica, diagramas ni texto dentro de la imagen.
- No dispone de soporte documentado de tool calling ni function calling (no aplica a un modelo de difusión).
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponible; los prompts de estos modelos suelen estar dominados por el inglés, pero no hay confirmación en la información proporcionada.
- No hay modo "thinking", ni entrada/salida de audio, ni visión de entrada (image-to-image) confirmada en la documentación disponible.

## Casos de uso

- Generación de fotografía realista para bancos de imágenes: el modelo está afinado para un look analógico, por lo que resulta adecuado para producir imágenes de estilo fotográfico natural sin postproceso agresivo.
- Previsualización de escenas para cine o publicidad: con 8 pasos y CFG 1, permite iterar bocetos visuales realistas rápidamente antes de invertir en producción.
- Prototipado de personajes para videojuegos o narrativa: la estética fotográfica facilita generar referencias de vestuario, iluminación y ambientación.
- Contenido para redes sociales y marketing: la inferencia rápida y el tamaño FP8 permiten integrarlo en pipelines de generación por lotes en GPU de consumo.
- Generación de datasets sintéticos de imágenes realistas: útil para aumentar conjuntos de datos de visión por computador cuando no se dispone de fotografías licenciadas.
- Exploración artística y edición editorial: combinado con pipelines de img2img y control (si el backend lo soporta), sirve para reinterpretar fotografías existentes con un acabado analógico.
- Pruebas de concepto en investigación sobre difusión: el checkpoint FP8 permitiría reproducir experimentos en hardware de 16-24 GB, siempre que se acepte la licencia incierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de FID, CLIP-score, HPSv2 ni comparativas objetivas en el repositorio de HuggingFace, la model card ni las fuentes web consultadas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12 GB para cargar los pesos FP8; con overhead de activaciones y VAE se recomienda un mínimo práctico de 12-16 GB.
- GPU recomendadas: NVIDIA RTX 4080 / 4090 (16 y 24 GB), RTX 3090 / A5000 (24 GB); en datacenter, A100 o H100 si se busca throughput alto.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB y 24 GB, según la propia descripción del modelo base FP8 en Civitai.
- Opciones de despliegue: ComfyUI, Automatic1111, Forge, SD.Next y la librería diffusers; el formato safetensors es el estándar para estos entornos. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI porque no son aplicables a un modelo de difusión.
- Latencia y throughput: no disponible de forma medida; con 8 pasos y CFG 1 el coste por imagen es bajo en comparación con configuraciones de 20-30 pasos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| analogMadnessKrea2Turbo_v40_fp8 | no disponible | no aplica | no disponible | unknown | HuggingFace, 12,8 GB, 0 descargas | Re-subida de un merge sobre Krea 2 Turbo |
| Krea 2 OSS (Turbo) BF16 | no disponible | no aplica | no disponible | no especificada en las fuentes | Distribución original, ~24,76 GiB | Base del modelo; mayor precisión, mayor peso |
| Krea 2 Turbo FP8 | no disponible | no aplica | no disponible | no especificada en las fuentes | Civitai, ~12,01 GiB | Cuantización FP8 "weight-only" del base |

No se dispone de datos de benchmarks ni de parámetros concretos que permitan una comparación cuantitativa fiable entre estos modelos.

## Limitaciones y advertencias

- Licencia "unknown": no se puede garantizar el uso comercial; hay que contactar con el autor original (Brasileiro Maniaco) o con el subidor (Ensayo003) antes de utilizarlo en producción.
- Ausencia total de model card: no hay información sobre datos de entrenamiento, sesgos ni limitaciones declaradas por el autor.
- Riesgo de artefactos típicos de los modelos de difusión: manos, ojos, texto y anatomía compleja pueden salir deformados; no es un problema de "alucinación" en el sentido lingüístico, pero sí de fidelidad factual de la imagen.
- El apelativo "analog madness" sugiere un sesgo de estilo hacia la fotografía analógica; puede no ser adecuado para estilos ilustrados o corporativos neutros.
- Sesgos demográficos y culturales: no disponibles, pero presumibles por la falta de documentación del dataset.
- Limitaciones de idioma en los prompts: no confirmadas; se recomienda usar inglés por convención en este tipo de modelos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y actualizado pocas horas después de su creación; se trata de una publicación muy reciente y sin validación de la comunidad.
- No hay resolución nativa, ni soporte de control nets, ni embeddings recomendados documentados para este checkpoint.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ensayo003/analogMadnessKrea2Turbo_v40_fp8
- Árbol de ficheros en HuggingFace: https://huggingface.co/Ensayo003/analogMadnessKrea2Turbo_v40_fp8/tree/main
- Ficha de Civitai del modelo original (Analog Madness Krea2-Turbo): https://civitai.red/models/2759177/analog-madness-krea2-turbo-realistic-model?modelVersionId=3366816
- Ficha de TensorHub Art del modelo original: https://tensorhub.art/models/1030007008738195166
- Ficha de Civitai del Krea 2 Turbo FP8 base: https://civitai.com/models/2723583/krea2-turbofp8
