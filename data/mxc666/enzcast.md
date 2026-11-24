# Mxc666/EnzCast

## Resumen

EnzCast es un modelo de predicción de cinética enzimática que combina un modelo de lenguaje de proteínas con una red neuronal de grafos para estimar parámetros cinéticos de pares enzima-sustrato. Lo desarrolla el autor independiente Mxc666 y se publica en Hugging Face junto con KinBench, un banco de pruebas de 359.652 mediciones cinéticas, y con los artefactos necesarios para ajustar el modelo bayesiano IsoKin a cohortes transcriptómicas sobre la red metabólica Recon3D. El repositorio tiene 53,0 GB e incluye pesos preentrenados, estructuras proteicas y grafos de sustratos derivados de SMILES.

El modelo resuelve un problema clásico de la biología de sistemas: la escasez de parámetros cinéticos medidos experimentalmente, que limita la construcción de modelos metabólicos a escala genoma. En lugar de depender exclusivamente de valores medidos en laboratorio, EnzCast predice la constante catalítica y otros parámetros para pares enzima-sustrato nuevos, y esos priors alimentan después el ajuste bayesiano de IsoKin sobre datos de expresión de cohortes.

La información pública disponible es limitada: no se especifican arquitectura exacta, número de parámetros, longitud de contexto ni licencia. La model card se centra en la organización del repositorio, los conjuntos de datos y el flujo de descarga, y remite al repositorio de GitHub para el código de entrenamiento, predicción y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (combina protein-language-model y graph-neural-network, según tags) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo científico, no conversacional) |
| Licencia | No disponible |
| Formato de pesos | No disponible (checkpoints de PyTorch en el repositorio; no se detalla el formato de fichero) |

## Arquitectura y entrenamiento

Según los tags del repositorio, EnzCast integra un modelo de lenguaje de proteínas (protein-language-model) con una red neuronal de grafos (graph-neural-network) y un componente de inferencia bayesiana (bayesian-inference), implementado en PyTorch. La representación de proteínas se apoya en 25.119 estructuras enzimáticas convertidas en grafos proteicos, y la de sustratos en 23.556 grafos precalculados a partir de SMILES. El repositorio distribuye tres checkpoints para evaluación en KinBench (con calibración de varianza ajustada en validación) y otros tres checkpoints entrenados con todos los datos para predecir pares enzima-sustrato nuevos y construir priors cinéticos.

El entrenamiento se apoya en KinBench, un conjunto de 359.652 mediciones cinéticas divididas en entrenamiento, validación y test mediante agrupamiento por secuencia (sequence-clustered splits), lo que evita fugas de información entre proteínas homólogas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en este dominio). El componente IsoKin ajusta un modelo bayesiano sobre la red de reacciones Recon3D usando reglas gen-proteína-reacción, mapeos enzima-sustrato y los priors generados por EnzCast, aplicado a cohortes transcriptómicas.

## Capacidades

- Predicción de parámetros cinéticos para pares enzima-sustrato, incluidos pares no observados experimentalmente.
- Generación de priors cinéticos para modelos metabólicos a escala genoma (Recon3D).
- Representación de enzimas mediante grafos derivados de estructura proteica y de sustratos mediante grafos derivados de SMILES.
- Evaluación estandarizada mediante el banco KinBench con splits agrupados por secuencia.
- Calibración de varianza de las predicciones ajustada sobre el conjunto de validación.
- Ajuste bayesiano de cohortes transcriptómicas mediante IsoKin usando los priors del modelo.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni multilingüismo conversacional.

## Casos de uso

- Priorización de enzimas para caracterización experimental: EnzCast predice parámetros cinéticos de pares enzima-sustrato sin medición previa, lo que permite seleccionar qué ensayos de laboratorio tienen mayor valor informativo antes de invertir en ellos.
- Construcción de modelos metabólicos a escala genoma: los priors cinéticos generados con los checkpoints de `fulldata_priors` rellenan los huecos de parámetros de redes como Recon3D, haciendo viable el análisis de flujos metabólicos con restricciones cinéticas.
- Ajuste de modelos metabólicos personalizados a cohortes: IsoKin usa los priors de EnzCast junto con datos de expresión transcriptómica para estimar estados metabólicos específicos de paciente o condición, sin necesidad de descargar los checkpoints completos.
- Ingeniería de enzimas: la predicción sobre pares nuevos orienta mutaciones o sustituciones de sustrato con mayor probabilidad de mejorar la actividad catalítica.
- Investigación en metabolómica y biología de sistemas: el par EnzCast + KinBench proporciona un marco reproducible para comparar métodos de predicción cinética con splits agrupados por secuencia.
- Docencia y reproducción metodológica: el repositorio incluye código de extracción de características, predicciones de ejemplo y ajuste de cohortes, lo que facilita replicar el pipeline completo en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la existencia de KinBench y de checkpoints para evaluación held-out, pero no incluye métricas numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (53,0 GB) incluye pesos, estructuras y grafos, no solo los checkpoints, por lo que no permite inferir directamente el tamaño del modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el flujo previsto es PyTorch con el código del repositorio de GitHub.
- Latencia y throughput: no disponibles.
- Espacio en disco: la descarga completa ocupa aproximadamente 27,2 GiB antes de la extracción.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa con otras herramientas de predicción de cinética enzimática.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no puede asumirse su uso comercial sin consultar al autor.
- No se documentan sesgos, pero al entrenar sobre mediciones experimentales de cinética enzimática, la cobertura taxonómica y de familias enzimáticas del dataset condiciona las predicciones.
- Riesgo de extrapolación: las predicciones sobre enzimas o sustratos poco representados en KinBench pueden ser poco fiables; los splits agrupados por secuencia mitigan la fuga en evaluación, pero no garantizan generalización fuera de la distribución.
- La calibración de varianza se ajusta en validación y puede no transferir a dominios distintos.
- No hay información sobre el formato exacto de los pesos ni sobre herramientas de cuantización, lo que complica el despliegue en entornos con recursos limitados.
- El modelo no es un modelo de lenguaje conversacional: no debe esperarse generación de texto, tool calling ni capacidades de agente.
- El repositorio es grande (53,0 GB) y requiere planificar el almacenamiento y la extracción antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/Mxc666/EnzCast
- Repositorio de código: https://github.com/Mxc666/EnzCast
- Instrucciones de instalación y extracción: https://github.com/Mxc666/EnzCast#installation--asset-extraction
- Model card interna: `Model/MODEL_CARD.md` dentro del repositorio
- Diccionario de datos de KinBench: `Dataset/kinbench/DATA_DICTIONARY.md` dentro del repositorio
