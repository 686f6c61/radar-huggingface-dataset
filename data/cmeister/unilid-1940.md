# cmeister/unilid-1940

## Resumen

unilid-1940 es un modelo de identificación de idiomas (language identification) desarrollado por cmeister, que cubre 1.940 combinaciones de idioma y escritura. Está entrenado sobre 60 millones de muestras del corpus GlotLID-C y se distribuye en una versión calibrada que incluye umbrales de decisión por idioma y constantes de calibración. El modelo se publica bajo licencia Apache 2.0 y está diseñado para su uso mediante el paquete UNILID, que requiere la versión 0.3.0 o posterior.

A diferencia de los modelos de lenguaje basados en transformadores, unilid-1940 emplea tablas de probabilidad de tokens por idioma, un enfoque estadístico ligero y eficiente para clasificación de texto. El repositorio incluye un archivo `.unilid` de 780 MB en float32 con las tablas de 1.940 idiomas y un vocabulario de 100.000 tokens, más un artefacto de calibración independiente. La relevancia actual del modelo radica en su amplia cobertura lingüística y en la corrección de un error en la versión inicial que afectaba a la distribución de probabilidades de los tokens especiales, corregido en la versión publicada el 24 de agosto de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tablas de probabilidad de tokens por idioma (no transformer) |
| Parametros totales | No disponible (tablas de 1.940 idiomas × 100.000 tokens, 780 MB en float32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (clasificación de texto, no generación) |
| Tipos de cuantizacion | No disponible (solo float32) |
| Idiomas soportados | 1.940 combinaciones idioma-escritura (lista completa no proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.unilid` (formato propio del paquete UNILID) y `calibration.json` |

## Arquitectura y entrenamiento

El modelo se basa en tablas de probabilidad de tokens por idioma, entrenadas sobre 60 millones de muestras del corpus GlotLID-C. Cada fila de la tabla corresponde a un idioma y contiene las probabilidades logarítmicas de los 100.000 tokens del vocabulario. La inferencia asigna a un texto la etiqueta del idioma cuya tabla produce la mayor verosimilitud acumulada. No se trata de una red neuronal, sino de un modelo estadístico de n-gramas o bolsa de tokens, lo que lo hace muy ligero en comparación con los modelos de lenguaje modernos.

El entrenamiento se complementa con un proceso de calibración que aplica dos correcciones: una constante compartida c = -17 para tokens no vistos, aplicada de forma unilateral sin renomalización, y un re-examen de predicciones de bajo margen. El re-examen reasigna predicciones a candidatos clasificados entre el segundo y quinto puesto que tengan al menos 100.000 muestras de entrenamiento y una puntuación dentro de 21 unidades de log natural de la puntuación superior. La versión publicada el 24 de agosto de 2026 corrige un error de la versión inicial que asignaba una probabilidad de 1/5 a los tokens especiales en cada fila, lo que reducía la probabilidad de los tokens reales a un quinto de su valor correcto. La corrección eleva cada token real en log(5) = 1,6094 nats y fija los tokens especiales en log(1e-12).

## Capacidades

- Identificación de idiomas en texto plano, con cobertura de 1.940 combinaciones de idioma y escritura.
- Clasificación de texto multilingüe, incluyendo idiomas con pocos recursos.
- Inferencia calibrada y no calibrada desde el mismo archivo de pesos.
- Soporte para integración en pipelines de preprocesamiento de datos mediante el paquete UNILID.
- No incluye generación de texto, razonamiento, código, visión ni tool calling.

## Casos de uso

- Enrutamiento de consultas en sistemas multilingües: unilid-1940 puede clasificar el idioma de una consulta entrante para dirigirla al modelo o servicio adecuado, gracias a su amplia cobertura de idiomas y su baja latencia.
- Preprocesamiento de corpus para NLP: antes de entrenar o evaluar modelos, es necesario filtrar o etiquetar documentos por idioma; este modelo permite hacerlo de forma eficiente sobre grandes volúmenes de texto.
- Detección de idioma en redes sociales: análisis de publicaciones o comentarios en plataformas con múltiples idiomas, incluyendo variantes con escritura no latina.
- Moderación de contenido multilingüe: clasificar el idioma de mensajes para aplicar políticas de moderación específicas por región o idioma.
- Normalización de datos en sistemas de búsqueda: identificar el idioma de documentos para mejorar la indexación y la relevancia de resultados en buscadores multilingües.
- Evaluación de cobertura lingüística: dado su amplio número de idiomas, puede usarse para auditar qué lenguas están representadas en un conjunto de datos y detectar desequilibrios.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluación sobre varios conjuntos de prueba. La siguiente tabla resume el rendimiento en modo base y calibrado:

| Evaluacion | Base | Calibrado |
|---|---|---|
| GlotLID-C test pool (45,4M lineas), macro F1 | 0,933 | 0,956 |
| UDHR (paralelo, muestras casi iguales por idioma), macro F1 | 0,856 | 0,842 |
| CommonLID (texto web fuera de dominio, 109 etiquetas), precision consciente de macrolenguaje | 0,848 | 0,862 |
| CommonLID, macro F1 a nivel de etiqueta | 0,722 | 0,717 |

Además, sobre un subconjunto de 250.000 líneas del pool de prueba GlotLID-C, la precisión pasa de 0,9603 a 0,9604 tras la corrección de los pesos. No se han publicado resultados comparativos con otros modelos de identificación de idiomas en la información disponible.

## Requisitos de hardware

- Al ser un modelo basado en tablas, la inferencia es ligera y puede ejecutarse en CPU sin necesidad de GPU.
- El archivo de pesos ocupa 780 MB en float32, por lo que se requiere al menos 1 GB de RAM para cargarlo en memoria.
- No se han publicado requisitos específicos de VRAM ni recomendaciones de GPU.
- El despliegue se realiza mediante el paquete UNILID, que incluye una extensión de tokenización en Rust. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- La latencia y el throughput no están documentados, pero al tratarse de una operación de suma de log-probabilidades sobre un texto, se espera un rendimiento muy superior al de un modelo transformer de tamaño similar.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de identificación de idiomas en la documentación proporcionada. El autor no publica comparaciones con alternativas como fastText, langid.py o GlotLID, por lo que no es posible establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- El modelo está entrenado sobre el corpus GlotLID-C, por lo que su rendimiento puede degradarse en dominios muy diferentes o con jerga especializada.
- La calibración mejora el rendimiento en conjuntos con distribución natural de idiomas, pero puede empeorarlo en conjuntos balanceados como UDHR o en métricas a nivel de etiqueta de CommonLID, como se observa en la tabla de benchmarks.
- Los idiomas con menos de 18.000 muestras de entrenamiento son susceptibles de re-examen, y 26 de ellos tienen menos de 200 líneas de calibración, por lo que nunca se re-examinan.
- El archivo `.unilid` es un formato propietario; no es compatible con frameworks estándar como PyTorch o TensorFlow sin el paquete UNILID.
- Se requiere UNILID 0.3.0 o posterior; versiones anteriores cargan los pesos sin error pero no aplican la constante de tokens no vistos, lo que produce resultados incorrectos.
- La versión publicada el 11 de agosto de 2026 contenía un error en la distribución de probabilidades; aunque la versión actual lo corrige, los archivos antiguos siguen disponibles en una revisión específica del repositorio.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, puede reflejar desequilibrios en la representación de idiomas y variedades dialectales.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/cmeister/unilid-1940
- Código fuente y paquete UNILID: https://github.com/Ahmetcanyvz/UNILID (rama `release`, tag `v0.3.0`)
