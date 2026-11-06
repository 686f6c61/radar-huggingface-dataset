# madhav-ak/enzyme-v007

## Resumen

`enzyme-v007` es un artefacto de recuperación de números EC (Enzyme Commission) para reacciones químicas, publicado por el usuario madhav-ak en Hugging Face. No es un modelo de lenguaje generativo ni un transformer entrenado de forma convencional: es un pipeline de recuperación que combina tres espacios métricos aprendidos para asignar anotaciones EC a reacciones químicas, basándose en un índice de 63.280 reacciones públicas de entrenamiento. El repositorio ocupa 0,6 GB y se distribuye con formato `joblib`, lo que sugiere que contiene pesos serializados y no un checkpoint en safetensors.

El sistema parte de tres codificadores químicos (Morgan balanceado, fragmentos diferenciales y topología local/atom-pair) preentrenados de forma supervisada, cuyas cabezas de salida EC se eliminan. Sobre sus características ocultas se proyectan tres vistas complementarias: una proyección contrastiva original (v006), una de vecinos duros con negativos de EC disjuntos, y una adaptada a semántica de reacción mediante RXNFP con adaptación EC3. Cada vista recupera ocho vecinos por coseno y emite votos EC fraccionados normalizados, que se promedian a partes iguales.

Es relevante en el contexto de la anotación enzimática automatizada porque aborda un problema clásico (predicción de EC a nivel de reacción química) mediante recuperación sobre referencias anotadas en lugar de clasificación directa, sin cabezas clasificadoras EC desplegadas ni referencias proteicas externas. La model card reporta mejoras locales medibles frente a v006, aunque advierte que la accuracy real en datos privados es desconocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de recuperación multi-vista con tres codificadores químicos (Morgan, fragmentos diferenciales, topología atom-pair) y proyecciones MLP 2048 → 512 ReLU → 256 + L2; RXNFP (BERT) con prefijo compartido |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 510 tokens de reacción + CLS/SEP para el encoder de reacción; los grafos químicos procesan la reacción completa |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible en la información proporcionada (RXNFP externo es MIT) |
| Formato de pesos | joblib (repositorio de 0,6 GB) |

## Arquitectura y entrenamiento

El sistema no es un transformer monolítico sino un ensamblaje de tres vistas de recuperación. La primera vista (original) proyecta características químicas ocultas junto con un RXNFP genérico congelado mediante una proyección contrastiva. La segunda (vecinos duros) entrena una proyección separada sobre las mismas características incluyendo negativos cercanos de entrenamiento con EC completos disjuntos, prefiriendo negativos del mismo nivel L3. La tercera (semántica adaptada) usa las mismas características químicas y el embedding CLS de RXNFP adaptado a EC3, con la cabeza clasificadora EC3 eliminada. Las tres proyecciones son MLP de 2048 → 512 ReLU → 256 seguidas de normalización L2, y las características se centran con medias calculadas solo sobre el fold de referencia.

El preentrenamiento químico se realizó con tres codificadores ocultos con semilla 42 (Morgan balanceado contexto/cambio, fragmentos diferenciales más contexto, y topología local/atom-pair), preentrenados de forma supervisada sobre el fold de entrenamiento de referencia y con las cabezas de salida EC completas eliminadas. El RXNFP genérico y el adaptado comparten exactamente sus primeros diez bloques transformer en inferencia; solo difieren los dos últimos, y el autor indica que la compartición se verificó contra evaluaciones independientes. El aprendizaje contrastivo con negativos duros se reconoce como método establecido, y la contribución declarada es su combinación evaluada con espacios de recuperación genéricos y adaptados a familia enzimática.

## Capacidades

- Recuperación de anotaciones EC para reacciones químicas: dada una reacción, devuelve un ranking de números EC con soporte en el índice de 63.280 reacciones públicas únicas.
- Búsqueda multi-vista: cada vista recupera ocho vecinos por similitud coseno y genera votos EC fraccionados normalizados; las tres distribuciones se promedian con pesos iguales.
- Salida principal en JSONL con exactamente `id` y una lista de predicción de un elemento por reacción única.
- Evidencia opcional en JSONL con los diez EC soportados, sus puntuaciones y, por vista, los IDs de referencia recuperados, similitudes coseno y anotaciones.
- Mapeo de IDs a reacciones reales de entrenamiento mediante `weights/references.parquet`.
- Funcionamiento totalmente offline: no requiere red en inferencia.
- No incluye cabeza clasificadora EC, mezcla de probabilidades de clasificador, vectores de salida EC aprendidos, activos de modelos competidores ni referencias proteicas externas.
- No realiza cribado de proteínas individuales ni reproduce una arquitectura multimodal original.

## Casos de uso

- Anotación automatizada de reacciones en pipelines de biología computacional: el sistema recibe reacciones en formato crudo y devuelve un ranking EC con evidencia de vecinos recuperados, lo que permite a un curador revisar la justificación de cada asignación.
- Priorización de candidatos en bases de datos enzimáticas: con un hit@10 de cualquier etiqueta EC de 0,869 en el chequeo local, puede usarse como primer filtro para reducir el espacio de búsqueda antes de validación experimental.
- Enriquecimiento de datasets de reacciones químicas: el JSONL de evidencia permite auditar qué reacciones de referencia sostienen cada predicción, útil para control de calidad en la construcción de corpus.
- Herramienta de apoyo a la curación manual: el ranking top-10 con puntuaciones y similitudes coseno por vista ofrece al curador información granular para aceptar o rechazar anotaciones EC.
- Evaluación comparativa de representaciones químicas: al separar tres vistas (original, vecinos duros, semántica adaptada), permite analizar qué tipo de espacio métrico aporta más a la recuperación en un conjunto de reacciones dado.
- Despliegue en entornos aislados sin red: el pipeline funciona con wheels offline y versiones fijadas en Docker, adecuado para sandbox de evaluación o entornos con restricciones de conectividad.
- Integración en flujos de anotación por lotes sobre Parquet: el launcher acepta entrada Parquet y produce predicciones y evidencia en JSONL, facilitando su inclusión en pipelines de datos existentes.

## Benchmarks y rendimiento

| Métrica | v006 | v007 |
|---|---:|---:|
| L4 fractional top-1 | 0,597635 | 0,610651 |
| Any-label EC hit@10 | 0,842000 | 0,869000 |

El chequeo de desarrollo fijo consta de 3.000 consultas y 53.852 referencias. El autor advierte que estos folds históricos de familia química no están globalmente intactos y que el despliegue sobre datos completos se reajusta por separado; la accuracy real en datos privados de v007 es desconocida. Las evaluaciones originales de checkpoints CREEP/Horizyn usan datasets y métricas distintas y se documentan aparte en el workspace.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio pesa 0,6 GB, lo que sugiere un requisito de memoria moderado, pero no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del artefacto (0,6 GB) es compatible con GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: ejecución mediante `predict.py` con entrada Parquet y salida JSONL; entorno Docker con wheels offline y versiones fijadas; bibliotecas numéricas configuradas a un solo hilo y lectura Parquet síncrona para el sandbox del grader nativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Métrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| enzyme-v007 | Recuperación multi-vista EC | 510 tokens de reacción | L4 top-1 0,6107; hit@10 0,869 | no disponible | Hugging Face (0 descargas) |
| enzyme-v006 | Recuperación contrastiva EC | 510 tokens de reacción | L4 top-1 0,5976; hit@10 0,842 | no disponible | Versión previa del mismo autor |
| CREEP / Horizyn | Checkpoints de referencia citados | no disponible | métricas distintas, documentadas aparte | no disponible | no disponible en la información |

No se dispone de datos suficientes para comparar con alternativas externas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni razonamiento; su única salida es un ranking EC basado en recuperación.
- La accuracy en datos privados es desconocida; las métricas reportadas provienen de folds históricos no globalmente intactos.
- El índice de referencia está limitado a 63.280 reacciones públicas únicas de entrenamiento; reacciones fuera de esa distribución pueden recibir votos poco fiables.
- El límite de 510 tokens de reacción más CLS/SEP puede truncar reacciones largas en el encoder de texto, aunque los grafos químicos procesan la reacción completa.
- No realiza cribado de proteínas individuales ni predicción de función proteica; es recuperación de referencias de reacción, no un clasificador EC desplegado.
- Licencia no especificada en la información disponible: verificar antes de cualquier uso comercial.
- El autor declara explícitamente que no reclama haber inventado el aprendizaje contrastivo; la contribución es la combinación evaluada de espacios de recuperación.
- El archivo `train_files/` es un archivo de referencia que requiere cachés del workspace original y artefactos padre; no es una distribución de reentrenamiento aislada con un solo comando.
- Sin descargas ni likes en Hugging Face en el momento de la consulta: ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/madhav-ak/enzyme-v007
- RXNFP (pretraining externo): https://github.com/rxn4chemistry/rxnfp (commit 6fd48f4927c2178555cc5d71dbfb225fb178f43c, MIT)
- Vocabulario EC permitido: ExPASy ENZYME / SIB (atribución en `licenses/`)
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
