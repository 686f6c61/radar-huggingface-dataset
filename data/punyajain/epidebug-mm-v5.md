# punyajain/epidebug-mm-v5

## Resumen

epidebug-mm-v5 es un modelo de puntuación de opciones (option scorer) para tareas de diagnóstico con formato de elección múltiple, desarrollado por el usuario punyajain. No es un modelo generativo de propósito general: se construye sobre embeddings congelados de all-MiniLM-L6-v2 y añade una cabeza de puntuación con atención hipótesis→evidencia y características físicas tabulares. Su objetivo es seleccionar la opción correcta en preguntas de diagnóstico médico-técnico (hipótesis, seguimiento y causa).

El modelo es extremadamente pequeño (1.138.086 parámetros totales en los pesos safetensors) y está diseñado para ser invariante al orden de las opciones por construcción, ya que su scorer solo utiliza interacciones. Se entrenó con orden de opciones aleatorizado, una KL de consistencia de permutación, negativos por intercambio de evidencia y una pérdida de causa enmascarada en las filas de mecanismo de AI4I.

Su relevancia es acotada y experimental: los resultados provienen de un benchmark interno (v2.2, n=337, no público) y de una única semilla seleccionada (seed 11, época 16). No hay información sobre idiomas soportados ni datos de benchmarks públicos, por lo que debe tratarse como un artefacto de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Option scorer sobre embeddings congelados de all-MiniLM-L6-v2, con atención hipótesis→evidencia y características físicas tabulares |
| Parametros totales | 1.138.086 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (carga mediante `ckpt/v4.py`) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer generativo completo, sino una cabeza de puntuación que opera sobre representaciones congeladas de all-MiniLM-L6-v2. Sobre esas embeddings se aplica un mecanismo de atención hipótesis→evidencia y se incorporan características físicas tabulares (physics features). El scorer utiliza únicamente términos de interacción, lo que lo hace invariante al orden de las opciones por construcción.

El entrenamiento incluyó orden de opciones aleatorizado, una pérdida KL de consistencia de permutación, negativos generados por intercambio de evidencia (evidence-swap negatives) y una pérdida de causa enmascarada en las filas de mecanismo del dataset AI4I. La ejecución seleccionada corresponde a la semilla 11, época 16, elegida sobre validación. No se especifican el número de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Puntuación de opciones en preguntas de elección múltiple de diagnóstico (hipótesis, seguimiento y causa).
- Invariabilidad al orden de las opciones gracias a un scorer basado solo en interacciones.
- Sensibilidad a la evidencia: las sondas muestran caídas de precisión al eliminar la evidencia (blank −.139) y al intercambiarla (swap −.300).
- Detección de filtración de la respuesta correcta en el texto de evidencia (sonda gold_first: +.196), útil como medida de robustez.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling ni agentes.
- Capacidades multilingües: no disponible.

## Casos de uso

- Evaluación de sistemas de diagnóstico asistido: el modelo puede puntuar opciones candidatas en preguntas de diagnóstico y servir como componente de ranking dentro de un pipeline mayor.
- Detección de atajos en datasets de elección múltiple: las sondas de evidencia (blank, swap, gold_first) permiten auditar si un modelo o un dataset se apoya en heurísticas superficiales.
- Investigación sobre invariancia de posición: su diseño invariante al orden de opciones lo hace útil para estudiar sesgos de posición en benchmarks de elección múltiple.
- Clasificación de causas en datos tabulares físico-técnicos: las características tabulares y la pérdida de causa enmascarada en filas de AI4I permiten experimentar con diagnóstico de causas en ese dominio.
- Baseline ligero para experimentos de ablation: con 1,1 M de parámetros y licencia MIT, es adecuado como referencia de bajo coste en estudios comparativos.
- Prototipado de scoring sobre embeddings congelados: sirve para validar rápidamente cabezas de atención hipótesis→evidencia sin entrenar un modelo base.

## Benchmarks y rendimiento

Resultados del benchmark interno v2.2 (n=337, no público):

| Modelo | hyp | follow-up | cause |
|---|---|---|---|
| v3 | .332 | .365 | .433 |
| v4 | .294 | .288 | .383 |
| v5 | .522 | .487 | .549 |
| Mejor baseline superficial | .214 | .418 (mode length rank) | — |

Sondas de evidencia (cambio en precisión de hipótesis): blank −.139, swap −.300, gold_first +.196.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,1 M de parámetros el modelo cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU moderna (RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en entornos sin GPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la carga indicada es mediante `ckpt/v4.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| epidebug-mm-v5 | 1.138.086 | no disponible | MIT | Hugging Face |
| epidebug v4 | no disponible | no disponible | no disponible | no disponible |
| epidebug v3 | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría fuera de las versiones previas del propio proyecto.

## Limitaciones y advertencias

- Los resultados provienen de un único benchmark interno (v2.2, n=337) y de una sola semilla seleccionada; la generalización es incierta.
- El margen sobre heurísticas superficiales en follow-up es modesto (+.07 frente al baseline de opción más larga, que ya alcanza .389).
- No hay información sobre sesgos conocidos ni sobre el dominio exacto de entrenamiento más allá de AI4I.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el scorer puede asignar puntuaciones altas a opciones incorrectas si la evidencia es ambigua.
- No se documentan idiomas soportados ni limitaciones de contexto.
- La licencia MIT permite uso comercial, pero la ausencia de benchmarks públicos y de documentación de robustez desaconseja su uso en producción sin validación propia.
- La carga requiere el script `ckpt/v4.py`, lo que añade dependencia de código específico del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/punyajain/epidebug-mm-v5
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
