# ozertuu/bge-m3-food-projection-head

## Resumen

El modelo `ozertuu/bge-m3-food-projection-head` es un adaptador neuronal ligero de 2,1 millones de parámetros (8,4 MB) desarrollado por Ertugrul Ozer para el motor de reconocimiento de comidas y nutrición EatBetter. Se entrena sobre las representaciones congeladas del modelo de embeddings multilingüe `BAAI/bge-m3` (560M parámetros) y proyecta los vectores de texto generales hacia un espacio semántico especializado en gastronomía. Su objetivo es alinear nombres de platos turcos e internacionales, estilos de cocina e ingredientes, mientras separa elementos crudos, enlatados o modificadores confusos que pueden generar falsas coincidencias en búsquedas semánticas.

La relevancia de este adaptador radica en su enfoque de dominio específico: en lugar de reentrenar un modelo completo, se añade una cabeza de proyección residual que ajusta los embeddings de BGE-M3 sin provocar olvido catastrófico del conocimiento multilingüe general. El adaptador se entrenó con 30.001 tripletes ancla-positivo-negativo duro del dataset `ozertuu/turkish-food-contrastive-triplets` usando pérdida contrastiva InfoNCE. Al ser un componente independiente, se puede integrar fácilmente en pipelines de búsqueda semántica o recomendación gastronómica, manteniendo la flexibilidad del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador residual MLP (Linear 1024→1024, LayerNorm, GELU, Linear 1024→1024) con conexión residual y normalización L2 |
| Parametros totales | 2.101.248 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hereda la del modelo base BGE-M3: 8192 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en precisión completa FP32) |
| Idiomas soportados | Turco, inglés y multilingüe (depende del modelo base, que soporta más de 100 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El adaptador es un MLP residual de dos capas con dimensión oculta 1024, idéntica a la dimensión de los embeddings de BGE-M3. La salida se calcula como `normalize(x + 0.5 * MLP(x))`, donde `x` es el embedding base y `MLP` es una secuencia de Linear, LayerNorm, GELU y otra Linear. Esta conexión residual permite que el adaptador ajuste finamente las representaciones sin desviarse demasiado del espacio original, preservando la información semántica general.

El entrenamiento se realizó con el modelo base completamente congelado, usando pérdida contrastiva InfoNCE con temperatura 0,05. El dataset contiene 30.001 tripletes ancla-positivo-negativo duro, donde los negativos son ejemplos difíciles como ingredientes crudos, productos enlatados o platos con modificadores engañosos. Se usó el optimizador AdamW (lr=1e-3, weight_decay=1e-4), batch size de 64 y 5 épocas. La elección de congelar el modelo base evita el olvido catastrófico de la gramática multilingüe y permite que el adaptador aprenda únicamente la alineación contrastiva específica del dominio culinario.

## Capacidades

- Generación de embeddings semánticos especializados en gastronomía, alineando nombres de platos, estilos de cocina e ingredientes en un espacio vectorial de 1024 dimensiones.
- Separación de conceptos culinarios confusos: distingue entre un plato preparado y su ingrediente crudo o enlatado (por ejemplo, "Kuru Fasulye" frente a "Kuru fasulye konservesi").
- Reconocimiento de equivalencias de recetas tradicionales: identifica que "Menemen" y "Domatesli Biberli Yumurta" representan el mismo plato con alta similitud (0,91).
- Soporte multilingüe heredado del modelo base BGE-M3, que cubre más de 100 idiomas, aunque el adaptador se ha entrenado principalmente con datos turcos e ingleses.
- Integración sencilla con `SentenceTransformer` y carga de pesos mediante `safetensors`, sin necesidad de reentrenar el modelo base.
- Funcionalidad de extracción de características (feature-extraction) para tareas de similitud de frases, búsqueda semántica y agrupación de textos culinarios.

## Casos de uso

- Búsqueda semántica de recetas en aplicaciones de cocina: el adaptador permite que una consulta como "Soslu etli kuru fasulye yemeği" encuentre la receta base "Kuru Fasulye" con alta similitud (0,94), mejorando la recuperación frente a modelos generales.
- Sistemas de recomendación de restaurantes: al proyectar nombres de platos de menús digitales en el espacio culinario, se pueden agrupar platos equivalentes de distintos restaurantes y sugerir alternativas basadas en similitud semántica.
- Análisis de datos de nutrición y dietética: el adaptador ayuda a clasificar alimentos procesados frente a frescos, separando por ejemplo "kuru fasulye konservesi" de "kuru fasulye" crudo, útil para aplicaciones de seguimiento nutricional.
- Motores de reconocimiento de comidas a partir de texto libre: en asistentes de salud, el adaptador puede interpretar descripciones informales de comidas (p. ej., "domatesli biberli yumurta") y mapearlas a platos canónicos.
- Generación de embeddings para bases de datos de ingredientes y productos alimentarios: permite indexar catálogos de supermercados y normalizar nombres de productos en diferentes idiomas o variantes regionales.
- Entrenamiento de clasificadores downstream: los embeddings generados por el adaptador pueden servir como características de entrada para modelos de clasificación de platos, estilos de cocina o preferencias dietéticas, reduciendo la necesidad de datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La model card únicamente muestra ejemplos cualitativos de similitud coseno entre pares de textos culinarios:

| Par de consultas | Relación | Similitud coseno |
|---|---|---|
| "Kuru Fasulye" vs "Soslu etli kuru fasulye yemeği" | Mismo plato (coincidencia gastronómica) | 0,94 |
| "Kuru Fasulye" vs "Kuru fasulye konservesi / tohumu" | Plato vs ingrediente crudo/enlatado | 0,41 |
| "Kuşbaşılı Pide" vs "Kuşbaşı Et" | Panadería compuesta vs carne pura | 0,38 |
| "Menemen" vs "Domatesli Biberli Yumurta" | Equivalencia de receta tradicional | 0,91 |

Estos valores indican que el adaptador logra una separación efectiva entre conceptos relacionados pero distintos, aunque no constituyen una evaluación formal comparativa con otros modelos.

## Requisitos de hardware

- El adaptador en sí (8,4 MB) se puede ejecutar en cualquier CPU o GPU, incluso en dispositivos embebidos, con un consumo de memoria despreciable.
- El modelo base BGE-M3 (560M parámetros) requiere aproximadamente 2-3 GB de VRAM en FP16 para inferencia, y puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4090 o superiores.
- Para despliegue en producción, se recomienda usar `SentenceTransformer` con el adaptador cargado como módulo adicional, o integrarlo en frameworks de búsqueda como FAISS o Milvus.
- El adaptador se puede combinar con cuantización del modelo base (por ejemplo, GGUF o bitsandbytes) para reducir aún más los requisitos de memoria, aunque no se han publicado configuraciones específicas.
- La latencia de inferencia está dominada por el modelo base; el adaptador añade un coste computacional mínimo (dos capas lineales de 1024 dimensiones).

## Comparativa con modelos similares

No se dispone de información sobre adaptadores de dominio culinario comparables en la literatura o en Hugging Face. Como referencia, se puede comparar con el modelo base BGE-M3:

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| BAAI/bge-m3 | 560M | 8192 tokens | Multilingüe general (dense, sparse, multi-vector) | MIT |
| ozertuu/bge-m3-food-projection-head | 2,1M (adaptador) | 8192 tokens (heredado) | Culinario (turco/inglés) | Apache-2.0 |

El adaptador no sustituye al modelo base, sino que lo complementa. No hay alternativas directas conocidas con el mismo enfoque de proyección residual sobre BGE-M3 para gastronomía.

## Limitaciones y advertencias

- El adaptador se ha entrenado exclusivamente con datos culinarios turcos e ingleses; su rendimiento en otros idiomas o cocinas regionales puede ser inferior, aunque el modelo base subyacente es multilingüe.
- La especialización en gastronomía puede degradar el rendimiento en tareas fuera de dominio; no debe usarse como reemplazo de BGE-M3 para búsqueda semántica general.
- Los ejemplos de similitud mostrados en la model card son ilustrativos y no garantizan un comportamiento consistente en todos los casos; se recomienda evaluar con datos propios antes de producción.
- No se han publicado métricas de robustez frente a variaciones ortográficas, dialectos o transliteraciones, lo que puede afectar a la calidad de los embeddings en entornos reales.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base BGE-M3 tiene licencia MIT; ambas son permisivas, sin restricciones de atribución adicionales.
- El adaptador no incluye capacidades de generación de texto ni razonamiento; es únicamente un módulo de proyección de embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ozertuu/bge-m3-food-projection-head
- Dataset de entrenamiento: https://huggingface.co/datasets/ozertuu/turkish-food-contrastive-triplets
- Modelo base BGE-M3: https://huggingface.co/BAAI/bge-m3
- Documentación oficial de BGE-M3: https://bge-model.com/bge/bge_m3.html
- Página del proyecto BGE: https://bge.baai.ac.cn/
- Repositorio de referencia de BGE-M3: https://github.com/inferless/Bge-m3
