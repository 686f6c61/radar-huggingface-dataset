# MaYiding/maven-ere-roberta-base-joint

## Resumen

El modelo `MaYiding/maven-ere-roberta-base-joint` es un encoder RoBERTa-base afinado de forma conjunta para cuatro tareas de extracción de relaciones de eventos del corpus MAVEN-ERE: correferencia de eventos, relaciones temporales, relaciones causales y relaciones de subevento. Lo desarrolla MaYiding y se distribuye en Hugging Face con licencia GPL-3.0 y código de modelo personalizado. No es un modelo generativo ni un LLM conversacional: es un modelo de extracción de características y relaciones, en inglés, con 126.192.245 parámetros y una ventana de 512 tokens heredada de RoBERTa-base.

Resuelve el problema de anotar relaciones entre eventos ya detectados dentro de un mismo documento. La entrada debe incluir menciones de evento y TIMEX anotadas con offsets; el modelo no detecta eventos desde texto crudo. Es relevante porque publica una instantánea interina corregida y verificada sobre los 710 documentos de validación, con métricas y hashes, dentro de una campaña de reproducción de 15 ejecuciones.

El repositorio mantiene en la raíz un checkpoint joint antiguo y añade cuatro directorios de referencia (`coreference`, `temporal`, `causal`, `subevent`) bajo `reference-seed42`, cada uno con un modelo completo de aproximadamente 126 M de parámetros. La combinación usa cuatro pasadas forward por documento y toma un campo de predicción de cada modelo; no promedia ni empalma pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder RoBERTa-base con cuatro cabezas de tarea (correferencia, temporal, causal y subevento) |
| Parametros totales | 126.192.245 en el checkpoint raíz y en cada checkpoint individual; la combinación `reference-seed42` usa 4 modelos completos (~504 M en total, no un único modelo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (RoBERTa-base; instantánea `corrected-512`) |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales; pesos en `safetensors`. No hay GGUF publicado en la información disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | GPL-3.0 |
| Formato de pesos | `safetensors`; incluye código de modelo personalizado (`trust_remote_code`) |
| Pipeline | `feature-extraction`; uso real mediante CLI y `AutoModel` con código custom |
| Modelo base | `FacebookAI/roberta-base` |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer RoBERTa-base con cuatro cabezas de tarea acopladas en un entrenamiento multi-tarea conjunto. Cada checkpoint contiene un encoder RoBERTa-base y las cuatro cabezas: correferencia de eventos, relaciones temporales, relaciones causales y relaciones de subevento. El modelo está entrenado sobre MAVEN-ERE en inglés y requiere menciones de evento y TIMEX anotadas con offsets, por lo que no es un sistema end-to-end de detección de eventos.

La instantánea `corrected-512-seed42-snapshot-u1500` completó 100 épocas, 9.200 actualizaciones y 184 validaciones; la mejor selección fue la época 17, actualización 1500. No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF/DPO. La combinación `reference-seed42` utiliza cuatro modelos completos independientes y cuatro pasadas forward por documento, sin mezclar ni promediar pesos de encoder o cabezas. La liberación es interina dentro de una campaña de 15 ejecuciones formales; no se reclama éxito multi-seed ni resultados de hidden test.

## Capacidades

- Correferencia de eventos intra-documento: agrupa menciones que se refieren al mismo evento dentro de un documento.
- Extracción de seis tipos de relaciones temporales entre eventos.
- Extracción de dos tipos de relaciones causales entre eventos.
- Extracción de relaciones de subevento dirigidas: un par `[parent, child]` indica que el segundo evento es un subevento del primero.
- Procesamiento en inglés, con entradas que deben incluir menciones de evento y TIMEX anotadas con offsets.
- Salida en JSONL mediante el flujo `train_joint.py --predict-only`, con alineación de spans, chunks, índice de menciones y decodificación.
- Carga mediante `AutoModel` y código custom del repositorio; requiere revisar el código antes de usar `trust_remote_code=True`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso generativo, visión, audio ni modo thinking.
- No es un modelo conversacional ni genera texto libre; es un modelo discriminativo de extracción de relaciones.

## Casos de uso

- Construcción de grafos de eventos temporales y causales en noticias: a partir de documentos ya anotados con menciones y TIMEX, el modelo añade relaciones temporales y causales para análisis de narrativas, líneas de tiempo y cadenas de consecuencias.
- Resolución de correferencia para bases de conocimiento: consolida menciones dispersas de un mismo evento en una entidad única, lo que facilita la deduplicación y el enlazado dentro de un pipeline de extracción de información.
- Extracción de jerarquías de subeventos para análisis narrativo: genera pares `[parent, child]` que permiten reconstruir la estructura de eventos complejos en informes, noticias o documentación histórica.
- Pre-anotación y control de calidad de corpus: sugiere relaciones a anotadores humanos para acelerar la revisión de corpus MAVEN-ERE o de dominios con un esquema de anotación compatible, siempre que existan menciones y TIMEX gold.
- Reproducción y evaluación de experimentos MAVEN-ERE: sirve como baseline verificable con métricas, hashes y scripts de validación para comparar nuevas variantes de modelos conjuntos.
- Integración en pipelines de NLP con Transformers: puede cargarse con `AutoModel` y ejecutarse en CPU o GPU para producir predicciones estructuradas dentro de un servicio de extracción de relaciones.
- Análisis de causalidad en informes técnicos o documentación: con anotación previa de eventos y referencias temporales, el modelo puede señalar relaciones causales candidatas para revisión humana.

## Benchmarks y rendimiento

Resultados de validación sobre los 710 documentos oficiales, en F1 porcentual. La correferencia media promedia B3, CEAF-e, MUC y BLANC; el overall promedia esa media y los tres F1 de relaciones.

| Metrica (F1 %, validacion 710 docs) | Root antiguo single | Nuevo single CPU `corrected-512-seed42-snapshot-u1500` | Delta (puntos) |
|---|---:|---:|---:|
| Coreference mean | 90.08368906 | 89.92380233 | -0.15988673 |
| Temporal | 53.08093519 | 53.10557320 | +0.02463801 |
| Causal | 27.33665533 | 31.46712390 | +4.13046857 |
| Subevent | 24.35389549 | 23.38204593 | -0.97184956 |
| Overall |
