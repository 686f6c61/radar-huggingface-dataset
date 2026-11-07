# maozee/model_sub_v1

## Resumen

model_sub_v1 es un modelo predictivo especializado en cinética enzimática: estima `log10_kcat` y `log10_km` para un par enzima-sustrato a partir de la cadena SMILES del sustrato y la secuencia proteica. Lo publica el usuario maozee en Hugging Face y su origen es una competición de regresión sobre datos de cinética enzimática, con código de entrenamiento disponible en un repositorio de GitHub. No es un modelo generativo ni un LLM: es un ensamblado de modelos tabulares y neuronales ligeros sobre descriptores químicos y embeddings proteicos.

La arquitectura combina tres predictores (LightGBM, kernel ridge regression y un MLP de dos torres) que operan sobre características RDKit del sustrato y embeddings ESM-2 de 8M y 35M parámetros, con una mezcla ponderada 0,6 / 0,25 / 0,15. Sobre esa mezcla se aplica una capa final de regresión kernel Nadaraya-Watson entrenada sobre pares etiquetados, que afina la predicción. El conjunto de entrenamiento son 42.524 pares de la competición más pares etiquetados de bases de datos públicas de cinética.

Su relevancia es práctica: predecir parámetros cinéticos sin medirlos experimentalmente permite priorizar candidatos en ingeniería de enzimas y diseño de biocatalizadores. El modelo es extremadamente ligero (repo de 0,5 GB) y se ejecuta en CPU: la validación completa de 1.901 pares tarda 258 s con 2 CPUs y 16 GB de RAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado: LightGBM + kernel ridge regression + MLP de dos torres, con capa de regresión kernel Nadaraya-Watson |
| Parametros totales | no disponible (componentes: ESM-2 de 8M y 35M como extractores de embeddings) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresión, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la entrada es SMILES y secuencia proteica, no texto natural) |
| Licencia | other: código MIT, pesos solo para uso académico y no comercial |
| Formato de pesos | no disponible (repo de 0,5 GB; se ejecuta mediante Docker) |

## Arquitectura y entrenamiento

El modelo es un ensamblado de tres regresores heterogéneos. LightGBM y kernel ridge regression trabajan sobre descriptores del sustrato calculados con RDKit; el MLP de dos torres combina esos descriptores con embeddings proteicos de ESM-2 en sus variantes de 8M y 35M parámetros. La predicción final es una mezcla lineal con pesos 0,6 / 0,25 / 0,15, refinada por una regresión kernel Nadaraya-Watson sobre pares etiquetados, que actúa como corrector local no paramétrico.

El entrenamiento usa 42.524 pares del conjunto de la competición más pares etiquetados procedentes de bases de datos públicas de cinética; las fuentes y licencias se documentan en el repositorio de GitHub del autor. La validación se realiza sobre 1.901 pares y 475 proteínas. La validación cruzada se organiza en 5 folds agrupados por clústeres de proteínas para evitar fuga de información entre proteínas homólogas. No se documenta el número de tokens de entrenamiento (no aplica en el sentido habitual), ni el uso de RLHF/DPO (no procede en un modelo de regresión).

## Capacidades

- Predicción de `log10_kcat` para pares enzima-sustrato a partir de SMILES y secuencia proteica.
- Predicción de `log10_km` para los mismos pares.
- Extracción de representaciones proteicas mediante ESM-2 (8M y 35M).
- Cálculo de descriptores moleculares del sustrato con RDKit.
- Refinamiento de predicciones mediante regresión kernel local sobre pares etiquetados.
- Ejecución en CPU sin acceso a red (contenedor Docker aislado).
- No soporta tool calling, agentes, generación de texto, visión ni audio.

## Casos de uso

- Priorización de enzimas candidatas en ingeniería de proteínas: dado un panel de variantes de una enzima y un sustrato de interés, el modelo estima `kcat` y `Km` para ordenar las variantes antes de caracterizarlas experimentalmente, reduciendo el número de ensayos.
- Diseño de rutas biocatalíticas: para una ruta propuesta, se evalúan los pares enzima-sustrato de cada paso y se descartan aquellos con constantes cinéticas predichas incompatibles con el flujo deseado.
- Filtrado en cribados masivos de sustratos: con la cadena SMILES como única entrada química, se puede puntuar un catálogo de sustratos frente a una enzima diana y seleccionar los más prometedores para ensayos in vitro.
- Análisis de especificidad de enzima: comparando las predicciones de una misma enzima frente a varios sustratos se obtiene un perfil de preferencia que orienta experimentos de selectividad.
- Enriquecimiento de bases de datos internas: rellenar huecos de `kcat` y `Km` en registros propios con estimaciones y una medida de confianza derivada de la dispersión entre los componentes del ensamblado.
- Docencia e investigación en bioinformática: el pipeline completo (Docker, CPU, sin red) permite reproducir el flujo de extracción de características y modelado en entornos docentes o de laboratorio con recursos limitados.
- Integración en pipelines de descubrimiento: al ejecutarse en CPU y en un contenedor aislado, encaja en flujos por lotes sobre parquet de entrada con salida CSV, sin dependencia de GPU.

## Benchmarks y rendimiento

Correlación de Spearman reportada en la model card:

| Evaluación | kcat | Km | Media |
|---|---|---|---|
| Validación cruzada 5 folds, clústeres de proteínas retenidos | 0,481 | 0,691 | 0,586 |
| Validación cruzada 5 folds ajustada a la validación, con capa kernel | 0,821 | 0,889 | 0,855 |
| Igual, solo pares ausentes del entrenamiento | 0,575 | 0,705 | 0,640 |
| Leaderboard de validación (base anterior) | 0,805 | 0,872 | 0,839 |

La diferencia entre la validación cruzada con clústeres retenidos (media 0,586) y la evaluación ajustada a la validación (media 0,855) es notable y sugiere que parte del rendimiento depende de la cercanía entre los pares evaluados y los de entrenamiento; la fila de pares ausentes del entrenamiento (media 0,640) es la estimación más conservadora de generalización.

## Requisitos de hardware

- CPU: la validación completa (1.901 pares) se ejecuta en 258 s con 2 CPUs.
- Memoria: 16 GB de RAM en el ejemplo de ejecución del contenedor.
- GPU: no necesaria; el pipeline está diseñado para CPU y sin acceso a red.
- VRAM estimada: no aplica.
- Despliegue: contenedor Docker con `docker build -t kcat-km .` y ejecución con `--network none --cpus 2 --memory 16g`, invocando `python /app/predict.py --input ... --output ...`.
- Throughput: aproximadamente 7,4 pares por segundo en la configuración de referencia (2 CPUs); no se documentan latencias por par individuales.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| model_sub_v1 | Ensamblado LightGBM + KRR + MLP con ESM-2 y capa kernel | SMILES + secuencia | log10_kcat, log10_km | Pesos solo académicos/no comerciales; código MIT | Hugging Face |
| Alternativas de la misma tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; no se inventan cifras ni comparaciones.

## Limitaciones y advertencias

- Licencia de pesos restringida a uso académico y no comercial; el código es MIT, pero los pesos no. Cualquier uso en producción comercial requiere autorización del autor.
- El rendimiento cae de forma acusada cuando los pares evaluados no están representados en el entrenamiento (media 0,640 frente a 0,855 en la evaluación ajustada), lo que indica dependencia de la cobertura del espacio químico y proteico.
- La validación cruzada agrupada por clústeres de proteínas da una media de 0,586, señal de que la generalización a familias proteicas nuevas es limitada.
- No hay información sobre sesgos de composición del conjunto de entrenamiento (posible sobrerrepresentación de ciertas familias enzimáticas o sustratos), ni sobre calibración de la incertidumbre.
- Riesgo de predicciones poco fiables fuera de la distribución de las bases de datos de cinética públicas; no se documenta ningún mecanismo de detección de fuera de distribución.
- El modelo no es generativo: no admite prompting, tool calling ni conversación; la interfaz es un script por lotes sobre parquet.
- No se documentan idiomas ni soporte multilingüe, ya que la entrada no es texto natural.
- No se especifican los formatos de pesos ni los tipos de cuantización; la distribución se realiza mediante imagen Docker.
- La model card no detalla el número de parámetros totales del ensamblado ni el volumen exacto de datos de las bases de datos públicas utilizadas.

## Enlaces

- Hugging Face: https://huggingface.co/maozee/model_sub_v1
- Repositorio de código y fuentes de datos: https://github.com/MohdAseel/da3410-kcat-km-regression
