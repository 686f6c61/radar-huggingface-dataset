# da24b032/kcat-km-v1

## Resumen

`da24b032/kcat-km-v1` es un modelo de tipo *starter* publicado en Hugging Face por el usuario da24b032 (Visaka Muralidharan, según el repositorio de GitHub asociado al proyecto de fin de semestre del Departamento DSAI del IIT Madras) para la tarea conjunta de predicción de `kcat` y `Km` en enzimas. No se trata de un modelo de lenguaje ni de un transformer preentrenado: el repositorio contiene los artefactos de un *baseline* de regresión ridge con dos salidas que sirve como punto de partida para el leaderboard Leak CURBER.

La tarea consiste en, dada una entrada Parquet con las columnas `id`, `smiles` (estructura del sustrato) y `sequence` (secuencia aminoacídica de la enzima), predecir los valores `log10_kcat` y `log10_km` en escala logarítmica base 10. La evaluación combina la correlación de rangos de Spearman (SCC) y el RMSE por cada objetivo, y el ranking del leaderboard se ordena por la media de ambas SCC.

El interés del modelo es fundamentalmente práctico y educativo: define el contrato de entrada/salida, el entorno de ejecución (CPU, 2 vCPU, 16 GB RAM, 15 minutos, sin red) y el flujo de empaquetado en Docker que cualquier participante debe respetar para sustituir el baseline por un modelo propio. El tamaño del repositorio es de 0,7 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión ridge con dos salidas (baseline); no se especifica arquitectura neuronal |
| Parametros totales | no disponible (el baseline almacena pesos en `weights/baseline.json`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular: longitud de secuencia y de SMILES como features) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (tag del repo) y JSON (`weights/baseline.json`); el baseline distribuido usa JSON |
| Tamano del repositorio | 0,7 GB |
| Entrada | Parquet con columnas `id`, `smiles`, `sequence` |
| Salida | CSV con columnas `id`, `log10_kcat`, `log10_km` |
| Entorno de evaluacion | CPU, 2 vCPU, 16 GB RAM, 15 minutos, sin red, Linux x86-64, Python en `/usr/local/bin/python`, cwd `/app` |
| Metrica | Media de SCC de `log10_kcat` y `log10_km`; RMSE como métrica secundaria |

## Arquitectura y entrenamiento

El baseline incluido en el repositorio es una regresión ridge con dos salidas, una por objetivo (`log10_kcat` y `log10_km`). Las features son la longitud de la secuencia, la longitud del SMILES, las frecuencias de aminoácidos y las frecuencias de caracteres del SMILES. Se entrena únicamente con el split de entrenamiento (`train.parquet`) y los pesos resultantes se guardan en `weights/baseline.json` mediante `train.py`.

No se proporciona información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre el uso de técnicas de regularización adicionales, aumentación de datos o modelos neuronales en el baseline. El repositorio está diseñado para que el participante sustituya libremente el baseline por cualquier modelo o librería, siempre que la inferencia se ejecute en CPU dentro de los límites indicados y produzca el CSV con el formato exacto.

## Capacidades

- Predicción conjunta de `kcat` y `Km` a partir de pares enzima-sustrato (secuencia + SMILES).
- Salida en escala logarítmica base 10 (`log10_kcat`, `log10_km`), sin exponenciar.
- Procesamiento por lotes de un fichero Parquet de entrada con columnas `id`, `smiles`, `sequence`.
- Generación de un CSV de predicciones con `id`, `log10_kcat`, `log10_km`, garantizando que cada ID de entrada aparece exactamente una vez.
- Ejecución en CPU sin red, apta para entornos de evaluación aislados.
- Empaquetado reproducible mediante Docker (`Dockerfile`, `requirements.txt`, `predict.py`).
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, visión, audio ni funcionalidades multilingües, al no ser un modelo generativo de lenguaje.

## Casos de uso

- Participación en el leaderboard Leak CURBER: el modelo sirve como plantilla funcional para validar el pipeline completo (descarga de datos, entrenamiento, predicción, empaquetado Docker y envío) antes de invertir esfuerzo en un modelo más sofisticado.
- Predicción rápida de parámetros cinéticos enzimáticos en fase de exploración: dado un conjunto de pares secuencia-SMILES, el baseline produce estimaciones de `log10_kcat` y `log10_km` en CPU y en segundos, útil para priorizar candidatos antes de ensayos experimentales.
- Filtrado preliminar en pipelines de ingeniería de enzimas: el modelo puede integrarse como primer filtro en un flujo que descarte sustratos con baja probabilidad de actividad medible, reservando los recursos de laboratorio para los candidatos mejor puntuados.
- Docencia y formación en ML aplicado a bioquímica: el repositorio incluye scripts de entrenamiento (`train.py`), predicción (`predict.py`) y validación con Docker, lo que permite reproducir el flujo completo en un curso o taller.
- Referencia para comparación de modelos: al ser un baseline con métricas públicas en el leaderboard, sirve como cota inferior contra la que medir la mejora de modelos neuronales o basados en grafos.
- Integración en servicios internos de anotación: el contrato de entrada/salida (Parquet a CSV) permite encapsular el modelo en un microservicio que anote lotes de pares enzima-sustrato con predicciones cinéticas aproximadas.
- Pruebas de infraestructura de evaluación: el Dockerfile y los límites de recursos (2 vCPU, 16 GB, 15 minutos) permiten validar entornos de CI/CD antes de desplegar modelos más pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe las métricas del leaderboard (SCC media y RMSE por objetivo) y el criterio de ordenación, pero no incluye valores numéricos del baseline ni de modelos comparables.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta exclusivamente en CPU.
- CPU: el evaluador proporciona 2 vCPU; el baseline es lo suficientemente ligero para ejecutarse en ese límite.
- RAM: 16 GB asignados por el evaluador; el baseline (regresión ridge con features de frecuencias) requiere una fracción mínima.
- GPU: no necesaria ni permitida en el entorno de evaluación.
- Almacenamiento: repositorio de hasta 4 GiB; el repo actual ocupa 0,7 GB. Ningún fichero escrito por `predict.py` puede superar 16 MiB.
- Tiempo de inferencia: límite máximo de 15 minutos para todos los inputs, incluyendo carga del modelo; el baseline debería completar el lote en segundos o pocos minutos.
- Despliegue: Docker sobre Linux x86-64, con Python en `/usr/local/bin/python` y directorio de trabajo `/app`; sin red y sin entrypoints ni hooks de shell.
- Frameworks compatibles: el baseline usa Python estándar y JSON; el participante puede sustituirlo por cualquier librería que funcione en CPU (scikit-learn, XGBoost, PyTorch en CPU, etc.).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| da24b032/kcat-km-v1 | Baseline ridge (kcat-Km) | no disponible | no aplica | MIT | Hugging Face, público |
| RohanSaha2006/kcat-km-model | Modelo para la misma tarea (kcat-Km) | no disponible | no aplica | no disponible | Hugging Face, público |
| starkAhmed43/leak-curber-kcat-km-starter | Baseline de referencia del leaderboard | no disponible | no aplica | no disponible | Hugging Face, público |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El baseline es una regresión ridge con features de frecuencias; su capacidad predictiva es limitada y probablemente muy inferior a la de modelos neuronales o basados en grafos.
- No se han publicado métricas de rendimiento del modelo en la información disponible, por lo que no es posible evaluar su calidad predictiva a priori.
- El modelo no procesa texto libre ni mantiene conversaciones; no es un modelo de lenguaje y no debe usarse como tal.
- La inferencia debe ejecutarse en CPU, sin red y dentro de los límites de 2 vCPU, 16 GB RAM y 15 minutos; modelos más pesados no serán evaluados.
- El CSV de salida debe contener exactamente las columnas `id,log10_kcat,log10_km`, sin IDs duplicados, ausentes o añadidos, y con valores finitos y de valor absoluto menor o igual a 1.000.000; cualquier incumplimiento invalida la evaluación.
- Los valores deben entregarse en escala log10, sin exponenciar.
- El repositorio debe incluir `Dockerfile`, `predict.py` y `README.md`, y no debe contener los datos descargados ni el directorio `output`.
- Límite de envíos: 2 por día y 20 en total por tarea; los fallos cuentan. Solo una evaluación activa a la vez.
- Fecha límite de envío y nominación: 7 de noviembre de 2026, 23:59 IST.
- La licencia MIT permite uso comercial, pero el modelo es un punto de partida educativo y no se ha validado para producción.
- No se dispone de información sobre sesgos, aunque en un modelo de predicción bioquímica los sesgos provendrían de la distribución del dataset de entrenamiento, no documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/da24b032/kcat-km-v1
- Repositorio de GitHub del proyecto: https://github.com/IIT-Madras-DSAI-Department/end-semester-project-da24b032
- Modelo comparable en Hugging Face: https://huggingface.co/RohanSaha2006/kcat-km-model
- Leaderboard Leak CURBER: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- Dataset del leaderboard (referenciado en la model card): `starkAhmed43/leak-curber-kcat-km`
