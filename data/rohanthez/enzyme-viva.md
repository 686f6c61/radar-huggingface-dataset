# RohanTheZ/enzyme-viva

## Resumen

Enzyme Viva (publicado como `RohanTheZ/enzyme-viva`) es un sistema de predicción de números EC (Enzyme Commission) para secuencias de proteínas, desarrollado por el usuario RohanTheZ. No se trata de un modelo de lenguaje generativo al uso, sino de un pipeline de clasificación en cascada que combina búsquedas exactas en bases de datos públicas, alineamiento por homología con DIAMOND, un clasificador basado en ESM2-8M reescrito en NumPy y dos modelos de reranking con gradient boosting. El objetivo es asignar una clase EC a cada secuencia de proteína de entrada, con una precisión reportada de 0,91955 en validación (nivel L4) y 0,86425 en test (nivel L4).

El sistema se presenta como una versión refactorizada y comentada del envío original, con el código dividido en módulos pequeños para facilitar su lectura y auditoría. El repositorio ocupa 0,6 GB e incluye pesos, tablas de búsqueda, una base de datos DIAMOND y binarios de DIAMOND v2.1.10. La relevancia actual reside en su enfoque híbrido: prioriza coincidencias exactas sobre bases de datos curadas y recurre a modelos neuronales solo cuando la evidencia por homología es débil (identidad del mejor hit por debajo del 40 %).

La ficha se basa exclusivamente en la model card y los metadatos disponibles en Hugging Face. No hay información sobre licencia del conjunto del repositorio, idiomas soportados ni pipeline declarado, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: búsquedas exactas en bases de datos, alineamiento DIAMOND, clasificador ESM2-8M (6 capas transformer, reescrito en NumPy) y dos rerankers de gradient-boosted trees |
| Parametros totales | No disponible (el clasificador ESM2-8M tiene aproximadamente 8 millones de parámetros; el resto del sistema son tablas y modelos de árboles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto; procesa secuencias de proteínas individuales) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la entrada son secuencias de aminoácidos, no texto natural) |
| Licencia | No disponible para el repositorio; los datos de terceros tienen licencias CC BY 4.0, CC0 o dominio público según se detalla en la model card |
| Formato de pesos | `.npz` (clasificador), `.pkl` (rerankers), `.parquet` (tablas de búsqueda y etiquetas), `.npy` (huellas TrEMBL), `.dmnd` (base de datos DIAMOND), `.json` (clases EC y fallback), `.hmm.gz` (modelos NCBIfam) |

## Arquitectura y entrenamiento

El sistema no es un transformer monolítico, sino una cascada de siete etapas. La primera realiza búsquedas exactas por secuencia en Swiss-Prot, BRENDA, TrEMBL (con reglas de remapeo) y PDB; en validación, esta etapa responde 11.317 de 11.367 consultas. La segunda y tercera etapas usan DIAMOND para encontrar hasta 50 proteínas de referencia similares (conjunto de entrenamiento más 31.985 enzimas de Swiss-Prot), con un modo ultrassensible y voto por bitscore para consultas sin hit. La cuarta etapa activa un clasificador ESM2-8M fine-tuneado, reescrito en NumPy, solo para consultas débiles (mejor hit por debajo del 40 % de identidad). La quinta etapa aplica dos rerankers de gradient-boosted trees sobre unas 30 características por candidato EC, promediando sus puntuaciones. La sexta etapa valida con modelos de familia NCBIfam y con el mapeo de reacciones Rhea. La séptima etapa emite una línea JSON por entrada, dando prioridad siempre a las respuestas de búsqueda exacta.

El entrenamiento del clasificador ESM2-8M se documenta en el directorio `training/` mediante notebooks de Kaggle y scripts, pero la model card no detalla el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO (no aplica en este dominio). La innovación técnica destacable es la reimplementación en NumPy del modelo ESM2-8M (6 capas transformer) para evitar dependencias de frameworks profundos y controlar el tiempo de ejecución, junto con un mecanismo adaptativo de velocidad en DIAMOND que mide el rendimiento de la máquina en el primer lote pequeño y cambia a un modo más rápido si el tiempo es limitado.

## Capacidades

- Predicción de un número EC por secuencia de proteína, con salida en formato JSON Lines.
- Búsqueda exacta por secuencia en Swiss-Prot, BRENDA, TrEMBL y PDB, con reglas de remapeo para TrEMBL.
- Alineamiento por homología con DIAMOND (hasta 50 hits de referencia) y voto por bitscore para consultas sin hit.
- Clasificación neuronal de respaldo mediante ESM2-8M fine-tuneado para consultas con baja identidad (< 40 %).
- Reranking de candidatos EC con dos modelos de gradient-boosted trees (22 y 34 características).
- Validación biológica posterior con modelos de familia NCBIfam y mapeo de reacciones Rhea.
- Gestión adaptativa de tiempo y tamaño de lote según la velocidad medida de la máquina.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso genérico ni capacidades multimodales; es un sistema especializado de clasificación proteica.

## Casos de uso

- Anotación funcional automatizada de genomas: el sistema puede procesar lotes de secuencias proteicas y asignar números EC, priorizando coincidencias exactas en bases de datos curadas antes de recurrir a homología o al clasificador neuronal, lo que reduce el coste computacional en anotaciones de gran volumen.
- Curaduría de bases de datos enzimáticas: las respuestas de búsqueda exacta (que cubren 11.317 de 11.367 consultas en validación) permiten verificar y completar anotaciones EC en repositorios internos con trazabilidad sobre la fuente (Swiss-Prot, BRENDA, TrEMBL o PDB).
- Clasificación de proteínas con baja homología: para secuencias sin hit claro, el clasificador ESM2-8M fine-tuneado proporciona probabilidades EC propias, útil en metagenómica donde abundan proteínas sin caracterizar.
- Filtrado y priorización en pipelines de biología computacional: la salida JSON Lines por entrada facilita la integración en flujos existentes y la selección de candidatos para validación experimental posterior.
- Validación cruzada con evidencia biológica: las comprobaciones con NCBIfam y Rhea actúan como control de coherencia, adecuado para entornos donde se requiere cierta confianza en la asignación antes de publicar resultados.
- Reproducibilidad de experimentos: al incluir el código dividido en módulos, los pesos y las instrucciones de ejecución (`python predict.py --input ... --output ...`), el repositorio sirve para replicar el envío original y auditar cada etapa del pipeline.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision L4 en validacion | 0,91955 |
| Precision L4 en test | 0,86425 |
| Consultas resueltas por lookup exacto en validacion | 11.317 de 11.367 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,6 GB en disco, pero el consumo en memoria depende de las tablas de búsqueda, la base de datos DIAMOND y el clasificador ESM2-8M.
- GPU recomendadas: no disponible. El sistema parece diseñado para ejecutarse en CPU, dado que incluye un binario de DIAMOND y una reimplementación en NumPy del clasificador; no se especifican GPU concretas (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecución directa con `python predict.py --input <archivo.parquet> --output <archivo.jsonl>`; requiere el binario `bin/diamond` (DIAMOND v2.1.10) y las dependencias implícitas de los módulos (`lookups.py`, `search.py`, `classifier.py`, `esm_numpy.py`, `rerank.py`, `checks.py`, `inputs.py`).
- Latencia y throughput estimados: no disponible; el sistema incluye un mecanismo adaptativo que mide la velocidad de la máquina en el primer lote pequeño y ajusta el modo de DIAMOND si el tiempo es limitado, pero no se publican cifras concretas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de predicción de números EC ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- La licencia del repositorio no está declarada; antes de un uso comercial es necesario contactar con el autor o verificar los términos de los datos de terceros (UniProt CC BY 4.0, BRENDA CC BY 4.0, PDB CC0, NCBIfam dominio público, Rhea CC BY 4.0, Gene Ontology CC BY 4.0, ExPASy ENZYME CC BY 4.0, ESM2-8M MIT).
- El sistema depende de la disponibilidad y actualización de bases de datos externas (Swiss-Prot, BRENDA, TrEMBL, PDB, NCBIfam, Rhea); cambios en esas fuentes pueden alterar las predicciones.
- La precisión reportada es a nivel L4 (0,91955 en validación, 0,86425 en test); no se detallan métricas por nivel EC ni por tipo de enzima, lo que limita la evaluación de sesgos por clase.
- El clasificador ESM2-8M es de tamaño reducido (aproximadamente 8 millones de parámetros) y solo se activa para consultas débiles, por lo que su contribución está acotada a casos de baja identidad.
- No hay información sobre sesgos conocidos, riesgo de alucinación en sentido generativo (no aplica directamente) ni limitaciones idiomáticas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.
- La fecha de creación (2026-11-17) y las referencias a versiones de datos de 2026 sugieren un contexto temporal que conviene verificar antes de desplegar en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RohanTheZ/enzyme-viva
- DIAMOND v2.1.10: https://github.com/bbuchfink/diamond
- UniProt: https://www.uniprot.org
- BRENDA: https://www.brenda-enzymes.org
