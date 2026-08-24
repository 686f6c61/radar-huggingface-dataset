# jacobsme/cognimed-nca-lgm

## Resumen

Cognimed NCA+LGM es un conjunto de matrices de parámetros entrenados que implementa un modelo de biología cognitiva desarrollado por Miles Bradford Jacobs (genetec.io, Ciudad del Cabo). No se trata de un modelo de lenguaje, sino de un sistema híbrido que combina un Neural Cellular Automaton (NCA) interno —la regla de actualización local del tejido— con un Large Genomic Model (LGM) externo congelado que lee el genoma como pesos regulatorios. El campo de potencial de membrana bioeléctrico actúa como espacio latente en el que se especifica la anatomía. El modelo está diseñado para estudiar morfogénesis, bioelectricidad y desarrollo embrionario a partir de datos genómicos y transcriptómicos públicos.

El modelo es deliberadamente pequeño: sus parámetros se derivan de bases de datos regulatorias públicas (GWAS Catalog, ABC enhancer–gene predictions, SEdb, AlphaGenome) y se validan contra atlas transcriptómicos espaciales (MOSTA, HESTA, ZESTA), en lugar de ajustarse a escala con grandes volúmenes de datos. El repositorio incluye todas las matrices necesarias para reproducir los resultados publicados en nueve artículos de acceso abierto, junto con el código fuente. Su relevancia radica en proponer un enfoque alternativo a los modelos generativos convencionales, anclando la representación anatómica en datos biológicos reales y ofreciendo un marco reproducible para la biología del desarrollo computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NCA (Neural Cellular Automaton) + LGM (Large Genomic Model) congelado, con campo de potencial de membrana como latente |
| Parametros totales | no disponible (el repositorio contiene matrices en formato .npz y .json, pero no se especifica el número total) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | .npz (matrices), .json (tablas y particiones) |

## Arquitectura y entrenamiento

La arquitectura combina un NCA interno que define la regla de actualización local de las células del tejido, con un LGM externo congelado que interpreta el genoma como pesos regulatorios. El campo de potencial de membrana bioeléctrico actúa como variable latente donde se especifica la anatomía. El modelo no se entrena mediante métodos convencionales de optimización a gran escala; sus parámetros se leen directamente del genoma a través de bases de datos regulatorias públicas (GWAS Catalog, ABC, SEdb, AlphaGenome) y se validan contra atlas transcriptómicos espaciales. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El repositorio incluye una "honest ledger" que documenta qué partes son derivadas del genoma (por ejemplo, las direcciones de órganos antero-posteriores con Spearman 0.81) y qué partes están ancladas a valores medidos (como la magnitud del potencial de reposo).

## Capacidades

- Modelado de morfogénesis y desarrollo embrionario a partir de datos genómicos y transcriptómicos.
- Simulación de la diferenciación celular y la formación de órganos mediante un NCA con reglas derivadas del genoma.
- Integración de datos de atlas transcriptómicos espaciales (MOSTA, HESTA, ZESTA) para reconstrucciones 3D densas.
- Generación de mapas de conductancia de tejidos basados en canales iónicos y uniones gap derivados del genoma.
- Asociación de variantes genéticas (GWAS) con "perillas de desarrollo" mediante adaptadores por alelo.
- Reproducción de resultados publicados en nueve artículos de acceso abierto, incluyendo calibraciones de reloj de diferenciación y puntuaciones de forma contra reconstrucciones de atlas.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni tiene capacidades de razonamiento conversacional.

## Casos de uso

- Investigación en biología del desarrollo: el modelo permite simular la cascada de diferenciación de órganos (corazón, ojo, riñón, hígado) a partir de pesos genómicos, lo que facilita el estudio de mecanismos morfogenéticos sin necesidad de experimentos húmedos.
- Validación de hipótesis sobre bioelectricidad: al usar el potencial de membrana como latente, se pueden explorar cómo las conductancias iónicas derivadas del genoma afectan la especificación anatómica.
- Análisis de variantes genéticas: los adaptadores por alelo (adapter_table.json) permiten mapear asociaciones de GWAS a puntos concretos del desarrollo, útil para interpretar variantes de riesgo en estudios de malformaciones congénitas.
- Reconstrucción de atlas 3D: las reconstrucciones derivadas de MOSTA, HESTA y ZESTA pueden usarse como referencia para comparar con datos experimentales propios o para generar hipótesis sobre organización tisular.
- Educación y divulgación: al ser un modelo pequeño y reproducible, puede utilizarse en cursos de biología computacional para ilustrar la integración de datos genómicos y transcriptómicos en modelos de desarrollo.
- Reproducción de resultados científicos: el repositorio incluye todas las matrices y tablas necesarias para replicar los resultados de los nueve artículos, lo que lo convierte en una herramienta de verificación independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas de rendimiento (como MMLU, HumanEval, etc.) ni comparaciones con otros modelos. Los únicos datos cuantitativos mencionados son la correlación de Spearman 0.81 para las direcciones de órganos antero-posteriores y la existencia de puntuaciones de forma contra reconstrucciones de atlas, pero no se proporcionan valores concretos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información disponible.
- Dado que el repositorio tiene un tamaño de 0.0 GB y contiene matrices en formato .npz y .json, es probable que el modelo sea ligero y pueda ejecutarse en CPU, pero no hay datos confirmados.
- No se mencionan GPUs recomendadas, VRAM estimada, ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se dispone de información sobre latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. El enfoque de NCA+LGM aplicado a biología del desarrollo es singular y no se dispone de alternativas directas con las que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo no es un modelo de lenguaje: no genera texto, no procesa lenguaje natural y no es adecuado para tareas de NLP.
- Los parámetros se derivan de bases de datos públicas y no se ajustan a escala; esto limita su capacidad de generalización a otros contextos biológicos no representados en los datos fuente.
- La "honest ledger" indica que algunas partes del modelo están ancladas a valores medidos (como el potencial de reposo) y otras son derivadas con correlaciones parciales (la dirección dorso-ventral es parcial), lo que introduce incertidumbre en las predicciones.
- Los datos de terceros (atlas, bases de datos) no se redistribuyen en el repositorio; es necesario obtenerlos de sus fuentes originales, cuyas licencias pueden variar (por ejemplo, FaceBase requiere solicitud).
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero los datos derivados de terceros pueden tener restricciones adicionales.
- No se han publicado benchmarks ni evaluaciones independientes que validen el rendimiento del modelo en tareas biológicas estándar.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere una adopción limitada o un proyecto reciente.

## Enlaces

- HuggingFace: https://huggingface.co/jacobsme/cognimed-nca-lgm
- Código: https://github.com/AlphaFanX/cognitive-biology
- Sitio web: https://genetec.io/
- Papers (DOIs, todos con prefijo 10.5281/zenodo.):
  - 10.5281/zenodo.20722139 (fundacional)
  - 10.5281/zenodo.21143761
  - 10.5281/zenodo.20746637
  - 10.5281/zenodo.20925727
  - 10.5281/zenodo.21143016
  - 10.5281/zenodo.21221930
  - 10.5281/zenodo.21796907
  - 10.5281/zenodo.21322049
  - 10.5281/zenodo.21791849
