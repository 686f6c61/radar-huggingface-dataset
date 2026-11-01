# aaarchitha7/kcat-km-model-v7

## Resumen

`aaarchitha7/kcat-km-model-v7` es un modelo de tipo *starter* publicado en Hugging Face para la tarea conjunta de predicción de `kcat` y `Km` del reto Leak CURBER. No se trata de un modelo de lenguaje ni de un transformer generativo: el repositorio contiene el andamiaje (Dockerfile, `predict.py`, `requirements.txt` y pesos) necesario para participar en una competición de predicción de parámetros enzimáticos a partir de secuencia proteica y SMILES del sustrato. El autor es `aaarchitha7` y la licencia declarada es MIT.

La tarea consiste en, dada una pareja (secuencia de aminoácidos, SMILES de la molécula), predecir dos valores numéricos: `log10_kcat` y `log10_km`. La evaluación se realiza mediante correlación de rangos de Spearman (SCC) y RMSE por objetivo, y el ranking se ordena por la media de las dos SCC. El modelo debe ejecutarse únicamente en CPU, con 2 vCPU, 16 GB de RAM y un límite de 15 minutos para todos los inputs, sin red y sin GPU.

El interés de esta ficha es limitado desde el punto de vista de modelos fundacionales: se trata de un artefacto de competición con 0 descargas y 0 likes en el momento de la consulta, sin model card técnica sobre arquitectura, tokenizador o datos de entrenamiento. La información disponible describe el formato de entrada/salida, el baseline de regresión ridge y las restricciones del evaluador, pero no las características internas del modelo subido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es un *starter* de competición; el baseline descrito es una regresión ridge con dos salidas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular: `id`, `smiles`, `sequence`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (según tags del repo); el baseline descrito usa `weights/baseline.json` |
| Tamano del repositorio | 0,7 GB |
| Entrada | Parquet con columnas `id`, `smiles`, `sequence` |
| Salida | CSV con columnas `id`, `log10_kcat`, `log10_km` |
| Entorno de ejecución | CPU only, Linux x86-64, Python en `/usr/local/bin/python`, directorio `/app` |
| Recursos del evaluador | 2 vCPU, 16 GB RAM, 15 minutos, sin GPU, sin red |
| Limite de repositorio | 4 GiB |
| Limite de ficheros de salida | 16 MiB por fichero |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo subido. El repositorio se presenta como un *starter* para el reto Leak CURBER: el participante entrena su propio modelo, lo empaqueta en un contenedor Docker y lo sube a un repositorio público de Hugging Face para su evaluación. El único modelo descrito con detalle es el baseline oficial, que consiste en una regresión ridge con dos salidas (una por objetivo) cuyas características son la longitud de la secuencia, la longitud del SMILES, las frecuencias de aminoácidos y las frecuencias de caracteres del SMILES. Este baseline se entrena únicamente con el split de entrenamiento (`train.parquet`).

No se especifican en la información proporcionada el número de tokens, la composición del dataset de entrenamiento, ni si hubo etapas de ajuste fino, RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, dado que el dominio es la predicción de parámetros enzimáticos y no la generación de texto. El flujo de trabajo exige que el modelo final corra en CPU con un presupuesto acotado, lo que en la práctica favorece modelos pequeños, *gradient boosting* o regresiones sobre descriptores, más que redes profundas grandes.

## Capacidades

- Predicción conjunta de `log10_kcat` y `log10_km` a partir de una pareja secuencia proteica / SMILES de sustrato.
- Procesamiento de entradas en formato Parquet con las columnas `id`, `smiles` y `sequence`.
- Generación de salidas en CSV con las columnas exactas `id`, `log10_kcat`, `log10_km`.
- Ejecución en CPU sin GPU, sin red y con un presupuesto de 15 minutos para el conjunto completo de inputs.
- Empaquetado en contenedor Docker reproducible (build en menos de 30 minutos, imagen Linux x86-64).
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni capacidades multimodales: no es un modelo generativo de propósito general.
- No se documentan capacidades multilingües (no aplica al dominio).

## Casos de uso

- Participación en el reto Leak CURBER: el repositorio sirve como plantilla para entrenar, empaquetar y enviar un modelo a la leaderboard de kcat–Km, cumpliendo los requisitos de Dockerfile, `predict.py` y `README.md`.
- Predicción de parámetros enzimáticos en pipelines de biología computacional: dado un conjunto de pares enzima–sustrato, el modelo produce estimaciones de `log10_kcat` y `log10_km` que pueden priorizar experimentos in vitro.
- Filtrado previo de candidatos en diseño de enzimas: usar las predicciones como señal de ranking (SCC) para descartar combinaciones con baja actividad catalítica o baja afinidad antes de ensayos de laboratorio.
- Reproducibilidad de baselines: el script `train.py` permite reentrenar la regresión ridge y comparar contra modelos más complejos en igualdad de condiciones.
- Evaluación de modelos en entornos restringidos: el contenedor Docker con CPU only, sin red y 15 minutos sirve como banco de pruebas para medir la viabilidad de despliegues de inferencia de bajo coste.
- Docencia y prácticas de ML aplicado a bioquímica: el flujo completo (descarga de datos, entrenamiento, Docker, subida a HF, envío a leaderboard) es un ejercicio cerrado de extremo a extremo.
- Integración en herramientas internas de anotación: el formato CSV de salida (`id,log10_kcat,log10_km`) se puede consumir directamente por hojas de cálculo o bases de datos para anotar catálogos de reacciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe la métrica de evaluación (media de las SCC de `log10_kcat` y `log10_km`, con RMSE como métrica secundaria) y el criterio de desempate (se favorece el envío anterior), pero no incluye puntuaciones del baseline ni del modelo `kcat-km-model-v7`.

## Requisitos de hardware

- Inferencia en CPU exclusivamente: el evaluador proporciona 2 vCPU y 16 GB de RAM, sin GPU y sin red.
- GPU recomendadas: no aplica; el reglamento prohíbe el uso de GPU en la evaluación.
- VRAM estimada: 0 GB (no se usa GPU).
- RAM estimada: hasta 16 GB disponibles; el baseline ridge es órdenes de magnitud más ligero, pero el modelo subido (0,7 GB de repo) debe caber en ese presupuesto junto con el runtime de Python.
- Despliegue: contenedor Docker Linux x86-64 con Python en `/usr/local/bin/python` y directorio de trabajo `/app`; el comando de inferencia es `python /app/predict.py --input INPUT --output OUTPUT`.
- Frameworks de servicio tipo vLLM, llama.cpp, Ollama o TGI: no aplican, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; el único límite documentado es 15 minutos para el conjunto completo de inputs y 30 minutos para el build de la imagen.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (predicción conjunta de kcat y Km) con parámetros, contexto o licencia documentados. El propio repositorio remite a un baseline ridge y a la leaderboard del reto como únicos puntos de referencia.

## Limitaciones y advertencias

- Modelo de competición con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa independiente.
- La model card no documenta arquitectura, datos de entrenamiento, número de parámetros ni proceso de validación del modelo `v7`; solo describe el andamiaje del reto.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de predicciones sin sentido físico (valores no finitos o con magnitud superior a 1.000.000), lo que provoca el fallo automático de la evaluación.
- Restricciones duras del evaluador: sin red, sin GPU, 2 vCPU, 16 GB de RAM, 15 minutos, repositorio de 4 GiB como máximo y ficheros de salida de 16 MiB como máximo. Cualquier dependencia de red o de GPU invalida el envío.
- El formato de salida es estricto: las columnas deben ser exactamente `id,log10_kcat,log10_km`, cada ID debe aparecer exactamente una vez y los valores deben ser finitos.
- Límites de envío: 2 envíos por día y 20 en total por tarea; solo una evaluación activa a la vez; los envíos no nominados caducan a los 7 días.
- Fecha límite de envío y nominación: 7 de noviembre de 2026 a las 23:59 IST.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- El acceso a la leaderboard requiere aprobación de cuenta; los problemas se gestionan en el foro de Moodle del curso, no en un canal público de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aaarchitha7/kcat-km-model-v7
- Repositorio *starter* del reto: https://huggingface.co/starkAhmed43/leak-curber-kcat-km-starter
- Dataset del reto: https://huggingface.co/datasets/starkAhmed43/leak-curber-kcat-km
- Leaderboard (Space): https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
