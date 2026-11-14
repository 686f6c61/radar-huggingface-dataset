# luckyyf/mmprism-eval-models

## Resumen

`luckyyf/mmprism-eval-models` no es un modelo de lenguaje en sentido estricto, sino un repositorio de activos de evaluación asociados al proyecto mmPRISM. El repositorio agrupa cuatro artefactos que el archivo de configuración `configs/data_layout.toml` referencia bajo la sección `[assets]`: un modelo de superficie corporal (Momentum Human Rig, MHR), sus constantes de cinemática directa, y dos codificadores de frases en chino (`text2vec-base-chinese` y `simcse-chinese-roberta-wwm-ext`).

El propósito declarado es servir como dependencia de datos para un pipeline de evaluación denominado mmPRISM, en el que el rig MHR alimenta un decodificador auxiliar de geometría y los dos sentence encoders proporcionan representaciones textuales en chino. No se documenta ninguna arquitectura de modelo propio, ni datos de entrenamiento, ni resultados de benchmarks.

La relevancia es limitada y muy específica: resulta útil únicamente para quien reproduzca el pipeline mmPRISM, ya que el repositorio no contiene pesos de un modelo generativo ni una model card con especificaciones técnicas. El tamaño del repositorio es de 1,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (contenedor de activos: rig MHR y dos sentence encoders transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los sentence encoders incluidos son de chino) |
| Licencia | no disponible (los sentence encoders conservan las licencias de sus repositorios de origen) |
| Formato de pesos | safetensors (tag del repo); incluye también `mhr_model.pt` y `mhr_fk_constants.npz` |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de modelo propia. Contiene cuatro entradas: `mhr_model.pt`, que es el modelo de superficie Momentum Human Rig (MHR) empleado por el decodificador auxiliar de geometría; `mhr_fk_constants.npz`, con las constantes de cinemática directa de dicho rig; y dos directorios de sentence encoders, `sbert/` (copia de `shibing624/text2vec-base-chinese`, revisión `183bb99aa7af74355fb58d16edf8c13ae7c5433e`) y `simcse/` (copia de `cyclone/simcse-chinese-roberta-wwm-ext`, revisión `871d7039a3fccd4869d545a25b63c545341ca7f4`).

No se proporciona información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF/DPO). Tampoco se documentan innovaciones técnicas del pipeline mmPRISM más allá de la mención al decodificador auxiliar de geometría que consume el rig MHR.

## Capacidades

- Distribución de activos para evaluación: el repositorio sirve como dependencia de datos del pipeline mmPRISM, no como modelo invocable.
- Modelo de superficie corporal: `mhr_model.pt` proporciona la malla/rig MHR usada por el decodificador de geometría auxiliar.
- Cinemática directa: `mhr_fk_constants.npz` aporta las constantes necesarias para calcular posiciones de articulaciones a partir de parámetros del rig.
- Representaciones textuales en chino: los dos sentence encoders (`text2vec-base-chinese` y `simcse-chinese-roberta-wwm-ext`) generan embeddings de frases para texto en chino.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Reproducción del pipeline mmPRISM: descargar el repositorio y apuntar `assets_root` a su contenido para que `configs/data_layout.toml` resuelva las rutas `[assets]` y el pipeline de evaluación arranque sin errores de dependencias.
- Evaluación de geometría corporal: usar `mhr_model.pt` junto con `mhr_fk_constants.npz` para validar el decodificador auxiliar de geometría sobre el rig MHR en tareas de reconstrucción de superficie.
- Búsqueda semántica en chino: emplear el encoder de `sbert/` para indexar y recuperar documentos en chino mediante similitud de embeddings.
- Similitud de frases en chino: usar el encoder de `simcse/` para tareas de emparejamiento y deduplicación de textos en chino.
- Verificación de revisiones: fijar las revisiones indicadas (`183bb99a...` y `871d7039...`) para garantizar reproducibilidad exacta de los embeddings en experimentos comparativos.
- Integración en contenedores de CI: empaquetar los 1,5 GB de activos en una imagen de evaluación para ejecutar pruebas de regresión del pipeline mmPRISM de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el conjunto; los dos sentence encoders son modelos tipo RoBERTa/base y pueden ejecutarse en CPU, pero no se documenta su tamaño exacto ni requisitos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; los sentence encoders de tipo base probablemente caben en GPU de consumo, pero no se confirma en la información proporcionada.
- Opciones de despliegue: no se documentan (no hay referencia a vLLM, llama.cpp, Ollama ni TGI); el uso previsto es como activos de un pipeline Python.
- Latencia y throughput: no disponible.
- Almacenamiento: 1,5 GB de repositorio, necesario en disco para resolver las rutas de `assets_root`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `luckyyf/mmprism-eval-models` | Contenedor de activos de evaluación | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| `shibing624/text2vec-base-chinese` | Sentence encoder (chino) | no disponible en la información | no disponible | la del repo de origen | Hugging Face (incluido como `sbert/`) |
| `cyclone/simcse-chinese-roberta-wwm-ext` | Sentence encoder (chino) | no disponible en la información | no disponible | la del repo de origen | Hugging Face (incluido como `simcse/`) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni acepta prompts; es un conjunto de activos para un pipeline concreto.
- Ausencia total de model card técnica: sin parámetros, contexto, idiomas ni benchmarks, no es evaluable como modelo de forma independiente.
- Licencia no declarada en el repositorio: los sentence encoders conservan las licencias de sus repositorios de origen, por lo que el uso comercial depende de verificar cada una de ellas.
- Riesgo de reproducibilidad: las rutas dependen de `configs/data_layout.toml` y de la estructura `assets_root`; cualquier cambio en el layout rompe el pipeline.
- Idiomas: los encoders incluidos son específicos de chino, lo que limita su uso en otros idiomas.
- Sesgos y alucinación: no evaluables para el contenedor; aplican los sesgos propios de los sentence encoders de origen, no documentados aquí.
- Sin mantenimiento verificable: 0 descargas y 0 likes, con creación y última actualización el mismo día (2026-11-14), lo que sugiere un artefacto puntual sin comunidad de soporte.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/luckyyf/mmprism-eval-models
- Sentence encoder de origen (SBERT): https://huggingface.co/shibing624/text2vec-base-chinese
- Sentence encoder de origen (SimCSE): https://huggingface.co/cyclone/simcse-chinese-roberta-wwm-ext
