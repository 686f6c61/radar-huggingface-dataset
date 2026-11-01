# aaarchitha7/kcat-km-model-v2

## Resumen

`aaarchitha7/kcat-km-model-v2` es un repositorio de Hugging Face asociado a la tarea conjunta de prediccion de parametros enzimaticos kcat y Km del leaderboard Leak CURBER. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un paquete de inferencia (Dockerfile, `predict.py`, `requirements.txt` y pesos en formato safetensors) pensado para ser entrenado por el participante y evaluado en un entorno CPU-only. El autor lo publica como solucion de referencia para la competicion.

El problema que aborda es la prediccion de dos magnitudes bioquimicas a partir de la secuencia de aminoacidos de una enzima y la representacion SMILES de un sustrato: el logaritmo en base 10 de kcat y el logaritmo en base 10 de Km. La evaluacion se realiza mediante correlacion de rangos de Spearman (SCC) y RMSE por objetivo, y el ranking usa la media de los dos SCC. El repositorio incluye los artefactos necesarios para construir una imagen Docker compatible con el evaluador (Linux x86-64, 2 vCPU, 16 GB de RAM, 15 minutos de tiempo maximo, sin GPU ni red).

La relevancia es acotada y de nicho: sirve como punto de partida reproducible para participantes del leaderboard y como ejemplo de empaquetado de inferencia con restricciones estrictas de recursos. El tamano del repositorio es de aproximadamente 0,1 GB, sin descargas ni likes registrados en el momento de la consulta, y con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene pesos safetensors y un pipeline de inferencia; la model card no especifica la arquitectura del modelo entrenado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (tarea de regresion tabular sobre moleculas y secuencias, no generacion de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (el repositorio tambien incluye Dockerfile, `predict.py` y `requirements.txt`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo entregado. Lo que si documenta es el baseline de referencia: una regresion ridge con dos salidas (una por objetivo) cuyas caracteristicas son la longitud de la secuencia, la longitud del SMILES, las frecuencias de aminoacidos y las frecuencias de caracteres del SMILES. Ese baseline se entrena exclusivamente con el split `train.parquet` y se serializa en `weights/baseline.json`.

El flujo de trabajo previsto es que el participante sustituya el baseline por cualquier modelo o libreria, siempre que la inferencia se ejecute en CPU dentro de la imagen Docker. Los datos publicos son `train.parquet` (con etiquetas) y `val_inputs.parquet` (solo entradas); las etiquetas de validacion y los datos de test son privados. El repositorio incluye pesos en safetensors, pero la model card no detalla el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO, algo esperable al no tratarse de un modelo generativo.

## Capacidades

- Prediccion de dos objetivos de regresion: `log10_kcat` y `log10_km` a partir de `id`, `smiles` y `sequence`.
- Entrada en formato Parquet con columnas `id`, `smiles` y `sequence`; salida en CSV con columnas exactas `id,log10_kcat,log10_km`.
- Inferencia CPU-only dentro de un contenedor Docker con 2 vCPU, 16 GB de RAM y 15 minutos para el conjunto completo de entradas.
- Ejecucion sin red (`--network none`) y con sistema de archivos de entrada montado en solo lectura.
- Empaquetado reproducible: `Dockerfile`, `requirements.txt` y `predict.py` sustituibles por el participante.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Participacion en el leaderboard Leak CURBER: el repositorio sirve como plantilla para empaquetar un modelo propio y someterlo a validacion y test dentro de las restricciones del evaluador.
- Prediccion de kcat y Km en pipelines de biologia computacional: dado un conjunto de pares enzima-sustrato en Parquet, el script `predict.py` genera un CSV con los logaritmos predichos listo para analisis posterior.
- Filtrado previo de candidatos enzimaticos: usar las predicciones como señal de priorizacion antes de ensayos experimentales, aprovechando que la inferencia se ejecuta en CPU sin GPU.
- Reproduccion de baselines en docencia o investigacion: el baseline ridge con caracteristicas de frecuencia permite comparar mejoras de modelos mas complejos bajo la misma metrica (SCC media y RMSE).
- Validacion de pipelines de empaquetado: el Dockerfile y las restricciones (4 GiB de repositorio, 16 MiB por archivo de salida, 30 minutos de build) sirven como banco de pruebas para despliegues de inferencia en entornos muy limitados.
- Integracion en flujos automatizados de evaluacion: el formato de entrada y salida fijo y la ausencia de red facilitan la ejecucion en runners de CI con recursos acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la metrica de evaluacion (SCC y RMSE por objetivo, ranking por SCC media) y el baseline ridge, pero no incluye puntuaciones numericas del modelo ni comparaciones con alternativas.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; el evaluador no proporciona GPU.
- Recursos asignados por el evaluador: 2 vCPU, 16 GB de RAM, 15 minutos para todas las entradas.
- Sin acceso a red durante la inferencia (`--network none`).
- Limites de empaquetado: imagen Linux x86-64, Python en `/usr/local/bin/python`, directorio de trabajo `/app`, build en menos de 30 minutos, repositorio de 4 GiB o menos y archivos de salida de 16 MiB o menos.
- No se especifican requisitos de VRAM ni GPU recomendadas porque el modelo no esta pensado para aceleracion por GPU.
- Opciones de despliegue: Docker (obligatorio para la evaluacion). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; el unico limite conocido es el presupuesto global de 15 minutos para el conjunto de entradas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (regresion kcat-Km) ni sus resultados, por lo que no es posible establecer una comparacion con datos verificables.

## Limitaciones y advertencias

- La model card no describe la arquitectura, el tamano ni el proceso de entrenamiento del modelo entregado; solo documenta el baseline ridge.
- El modelo opera exclusivamente en CPU y con un presupuesto de 15 minutos; modelos mas pesados pueden exceder el limite y provocar el fallo de la evaluacion.
- El evaluador rechaza la submission si las columnas no son exactamente `id,log10_kcat,log10_km`, si falta o se duplica un ID, o si algun valor no es finito o supera 1.000.000 en valor absoluto.
- Las etiquetas de validacion y los datos de test son privados; el ajuste fino sobre validacion no es posible directamente.
- Limites de submission: 2 por dia y 20 en total por tarea; las ejecuciones fallidas consumen cupo y solo una evaluacion puede estar activa a la vez.
- Las submissions exitosas no protegidas expiran a los 7 dias; solo la mejor y la nominada se conservan.
- Fecha limite de envio y nominacion: 7 de noviembre de 2026 a las 23:59 IST.
- Riesgo de alucinacion no aplica en el sentido habitual, pero si existe riesgo de predicciones fisicamente implausibles fuera del rango de entrenamiento.
- No se documentan sesgos conocidos ni limitaciones idiomaticas; la licencia MIT permite uso comercial, pero la utilidad practica esta acotada a la tarea de regresion bioquimica.

## Enlaces

- Repositorio del modelo: https://huggingface.co/aaarchitha7/kcat-km-model-v2
- Repositorio starter del baseline: https://huggingface.co/starkAhmed43/leak-curber-kcat-km-starter
- Dataset de la tarea: https://huggingface.co/datasets/starkAhmed43/leak-curber-kcat-km
- Leaderboard: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignacion de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
