# downlz/x-abuse-shield-model

## Resumen

X Abuse Shield – Toxicity Model es un clasificador de toxicidad multilingue empaquetado en formato ONNX Runtime (`.ort`) para su ejecucion en el navegador. No es un modelo entrenado desde cero: se trata de una conversion del modelo `Horizon-Labs/multilingual-toxicity-small`, un encoder multilingue de aproximadamente 141 millones de parametros afinado a partir de mmBERT-small. El autor, `downlz`, lo publica como artefacto de soporte para su extension de navegador X Abuse Shield, que oculta o difumina publicaciones abusivas en x.com sin enviar texto a ningun servidor.

La relevancia del modelo reside en su formato y su proposito: al convertir los pesos a `.ort` con optimizacion basica compatible con WebAssembly, permite cargar los pesos en memoria en su sitio, lo que reduce el consumo de memoria en el navegador de aproximadamente 850 MB (ONNX original) a unos 500 MB, manteniendo pesos y salidas sin cambios. El modelo resuelve la clasificacion multietiqueta de toxicidad con siete etiquetas independientes (las mismas que Detoxify) y cubre ingles mas otros 33 idiomas, con una longitud maxima de secuencia de 256 tokens.

La licencia del repositorio es Apache-2.0, pero con una salvedad importante: la carpeta `gravitee-io/distilbert-multilingual-toxicity-classifier/`, que contiene el modelo por defecto de la extension desde la version 0.3.0, esta bajo OpenRAIL++, no Apache-2.0. El modelo tiene un uso muy limitado en la comunidad (15 descargas, 0 likes) y su fecha de creacion indicada es 2026-10-24.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer multilingue (mmBERT-small), clasificacion multietiqueta con sigmoide independiente por etiqueta |
| Parametros totales | Aproximadamente 141 M (modelo base mmBERT-small) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | int8 (`q8`) en el archivo de origen; sin cuantizacion adicional en la conversion |
| Idiomas soportados | Ingles mas 33 idiomas adicionales |
| Licencia | Apache-2.0 (repositorio); la carpeta `gravitee-io/distilbert-multilingual-toxicity-classifier/` es OpenRAIL++ |
| Formato de pesos | `.ort` (ONNX Runtime), con `config.json`, `tokenizer.json`, `tokenizer_config.json` y `NOTICE.md` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer multilingue derivado de mmBERT-small, con aproximadamente 141 millones de parametros, afinado para clasificacion multietiqueta de texto. La cabeza de clasificacion aplica una sigmoide independiente por cada una de las siete etiquetas: `toxicity`, `severe_toxicity`, `obscene`, `threat`, `insult`, `identity_attack` y `sexual_explicit`, el mismo conjunto de etiquetas que Detoxify. La longitud maxima de secuencia es de 256 tokens.

Los datos de entrenamiento del modelo original (upstream) son Civil Comments, con aproximadamente 519 000 comentarios en ingles, de los cuales unos 391 000 fueron traducidos automaticamente a 33 idiomas. El autor de esta ficha no documenta detalles adicionales sobre RLHF, DPO u otras fases de alineacion; esa informacion debe consultarse en la model card del modelo original. La innovacion tecnica de este repositorio concreto no esta en el entrenamiento sino en el empaquetado: la conversion se realizo con `onnxruntime-node`, usando `graphOptimizationLevel: 'basic'` (que conserva solo operadores soportados por el runtime WebAssembly) y `save_model_format: 'ORT'`. El script de conversion es reproducible mediante `npm run model:build` en el repositorio de la extension.

## Capacidades

- Clasificacion de toxicidad multietiqueta con siete categorias independientes: `toxicity`, `severe_toxicity`, `obscene`, `threat`, `insult`, `identity_attack` y `sexual_explicit`.
- Deteccion de abuso y moderacion de contenido en texto, con puntuaciones por etiqueta.
- Cobertura multilingue: ingles mas 33 idiomas adicionales, con datos de entrenamiento traducidos automaticamente.
- Ejecucion en el navegador mediante ONNX Runtime Web, con carga de pesos en su sitio (`use_ort_model_bytes_directly`, `use_ort_model_bytes_for_initializers`, `disable_prepacking`).
- Integracion con listas de palabras para ingles, hindi (devanagari) y hinglish en la pipeline de la extension.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Moderacion de contenido en el navegador: la extension X Abuse Shield puntua cada publicacion de x.com localmente y oculta o difumina las abusivas; el modelo es adecuado porque no envia texto a ningun servidor y puntua en unos 28-30 ms por publicacion.
- Extensiones de navegador con procesamiento en el dispositivo: el formato `.ort` permite cargar los pesos en memoria en su sitio, reduciendo el uso de memoria de aproximadamente 850 MB a unos 500 MB en Chrome, lo que lo hace viable en un contexto de extension.
- Filtrado de comentarios en comunidades multilingues: con cobertura de 34 idiomas, puede puntuar comentarios en foros o plataformas donde conviven ingles, hindi, hinglish y otras lenguas.
- Prefiltrado de colas de moderacion humana: las puntuaciones por etiqueta permiten priorizar revision manual de contenido con alta probabilidad de `threat` o `identity_attack` antes de que lo vea un moderador.
- Investigacion sobre toxicidad multilingue: sirve como linea base reproducible para experimentos con Civil Comments y TextDetox, dado que el modelo original reporta AUC de 0.988 en ingles y 0.835 en TextDetox en 15 idiomas.
- Proteccion de usuarios en redes sociales: la extension carga el modelo solo mientras hay una pestana de x.com abierta y lo descarga tras 5 minutos de inactividad, un patron reutilizable para otras plataformas.
- Despliegue en Firefox: el modelo funciona en modo monohilo porque las extensiones de Firefox no tienen SharedArrayBuffer, con una velocidad de extremo a extremo similar.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo original (upstream) y a la pipeline de la extension, no a este artefacto `.ort` de forma aislada.

| Metrica | Valor |
|---|---|
| AUC medio en Civil Comments (test en ingles) | 0.988 |
| AUC en TextDetox (15 idiomas) | 0.835 |
| Latencia de puntuacion por publicacion | 28-30 ms |
| Memoria en carga (Chrome, `.ort`) | Aproximadamente 500 MB |
| Memoria en carga (ONNX original) | Aproximadamente 850 MB |
| Tamano de la extension (modelo alojado) | Aproximadamente 28 MB |
| Tamano de la descarga inicial | 289 MB |

La calibracion de la pipeline completa (modelo mas listas de palabras) se realizo sobre un conjunto etiquetado de 68 publicaciones (44 abusivas y 24 limpias, en ingles, hindi, hinglish y otros idiomas) con el preset Balanced: umbrales de 0.75 para `toxicity`, 0.70 para `insult`, 0.40 para `threat` y 0.50 para `identity_attack`. Los resultados de esa tabla de calibracion no estan completos en la informacion disponible.

## Requisitos de hardware

- Inferencia en navegador: no requiere GPU; se ejecuta mediante ONNX Runtime Web sobre WebAssembly.
- Memoria en carga en Chrome: aproximadamente 500 MB con el formato `.ort`, frente a aproximadamente 850 MB con el ONNX original.
- Descarga inicial: 289 MB si se aloja el modelo de forma externa; la build empaquetada ocupa aproximadamente 331 MB.
- Firefox: ejecucion monohilo por ausencia de SharedArrayBuffer en extensiones, con velocidad de extremo a extremo similar.
- No esta pensado para despliegue en servidor con vLLM, TGI, llama.cpp u Ollama; para uso en Python o con `pipeline(...)` de Transformers.js debe usarse el repositorio original.
- Latencia estimada: 28-30 ms por publicacion en la extension.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| downlz/x-abuse-shield-model | Aproximadamente 141 M | 256 tokens | 34 idiomas | Apache-2.0 (carpeta gravitee-io: OpenRAIL++) | `.ort` |
| Horizon-Labs/multilingual-toxicity-small | Aproximadamente 141 M | 256 tokens | 34 idiomas | No disponible en la informacion proporcionada | ONNX, safetensors (no confirmado) |
| gravitee-io/distilbert-multilingual-toxicity-classifier | No disponible | No disponible | Multilingue (no detallado) | OpenRAIL++ | `.ort` en este repositorio |

Los datos de rendimiento comparativo entre estos modelos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia Apache-2.0 del repositorio no cubre la carpeta `gravitee-io/distilbert-multilingual-toxicity-classifier/`, que esta bajo OpenRAIL++ con restricciones de uso recogidas en su archivo `LICENSE`; verificar antes de cualquier uso comercial.
- El modelo es un clasificador de toxicidad, no un generador: no puede usarse para tool calling, agentes ni razonamiento.
- La longitud de contexto esta limitada a 256 tokens, insuficiente para documentos o hilos largos.
- Los datos de entrenamiento originales son Civil Comments en ingles con traduccion automatica a 33 idiomas, lo que puede introducir sesgos y degradacion en idiomas distintos del ingles.
- Los umbrales de calibracion se obtuvieron sobre solo 68 publicaciones, un conjunto muy pequeno; los resultados pueden no generalizar.
- Riesgo de falsos positivos y negativos en contextos ironicos, jerga o variedades como el hinglish, mitigado parcialmente por listas de palabras.
- El modelo tiene un uso comunitario minimo (15 descargas, 0 likes) y no se han publicado resultados de benchmarks propios de este artefacto `.ort`.
- La fecha de creacion indicada (2026-10-24) es posterior a la fecha actual de referencia habitual; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/downlz/x-abuse-shield-model
- Modelo original: https://huggingface.co/Horizon-Labs/multilingual-toxicity-small
- Repositorio de la extension: https://github.com/downlz/x-abuse-shield
- Script de conversion: https://github.com/downlz/x-abuse-shield/blob/main/scripts/build-model.ts
- Plugin de ONNX Runtime en su sitio: https://github.com/downlz/x-abuse-shield/blob/main/scripts/ort-in-place-plugin.ts
- Modelo por defecto de la extension (OpenRAIL++): https://huggingface.co/gravitee-io/distilbert-multilingual-toxicity-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/google/civil_comments
