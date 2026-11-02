# eoinf/synthetic_components_few_equal_200m_dmodel2_4_6_8_16_32_64_seeds00_01

## Resumen

Este repositorio no contiene un modelo de lenguaje listo para uso en producción, sino un *grid* de experimentos con transformadores causales de tamaño minúsculo. El autor, `eoinf`, publica una rejilla de modelos con `d_model` de 2, 4, 6, 8, 16, 32 y 64, dos semillas por anchura, vocabulario de 4096 tokens y contexto de 256 tokens, entrenados con un presupuesto nominal de 199.999.488 tokens. El propósito es claramente de investigación: estudiar el comportamiento de transformadores a distintas escalas de anchura sobre una tarea sintética de trigramas.

Los pesos se distribuyen como *state dicts* de PyTorch, no como safetensors ni GGUF, y el repositorio solo ocupa 0,1 GB, lo que confirma que el objetivo no es el despliegue sino el análisis empírico. La model card remite a `grid_summary.json` y `result.json` para los horizontes reales de entrenamiento (puede haber paradas tempranas) y a `configuration.json` para dataset, tokenizador y ajustes de evaluación.

Por su naturaleza, no es un modelo comparable a un LLM generativo de propósito general: no hay información sobre licencia, idiomas, pipeline ni benchmarks, y las descargas y *likes* son cero. Es relevante únicamente como material reproducible para estudios de escalado, mecánica interna o dinámica de entrenamiento en modelos muy pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), anchuras `d_model` de 2, 4, 6, 8, 16, 32 y 64 |
| Parametros totales | No disponible (no se publica el recuento por modelo; con `d_model` de 2 a 64 y vocabulario 4096 el orden de magnitud es de miles a pocos millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (entrenamiento sobre dataset sintético de trigramas) |
| Licencia | No disponible |
| Formato de pesos | *State dicts* de PyTorch (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar (decoder-only) parametrizado por anchura `d_model`, con siete valores distintos y dos semillas por valor, lo que da un total de 14 ejecuciones. El vocabulario es de 4096 tokens y la longitud de contexto de 256. El presupuesto nominal de entrenamiento es de 199.999.488 tokens por modelo, aunque la model card advierte de que los horizontes reales, incluidas posibles paradas tempranas, están registrados en `grid_summary.json` y `result.json`.

El dataset es sintético y está orientado a trigramas, según se deduce del nombre del repositorio y del código de carga en `synthetic_trigrams`. No se especifica la composición exacta del dataset ni el tokenizador más allá de la referencia a `configuration.json`. No hay indicios de RLHF, DPO ni ajuste por preferencias: es un experimento de preentrenamiento controlado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El repositorio incluye, por cada modelo, el *state dict*, la definición de la ejecución, el historial de checkpoints, el log de actualizaciones de entrenamiento y metadatos de resultado; no se incluyen estados del optimizador ni los datos de entrenamiento.

## Capacidades

- Generación de texto causal sobre secuencias de hasta 256 tokens, limitada al dominio sintético de trigramas con el que fue entrenado.
- Modelado de lenguaje a escala de laboratorio: útil para estudiar curvas de aprendizaje, *grokking* o dinámicas de entrenamiento según la anchura.
- Reproducibilidad de experimentos: los *state dicts* y los logs de actualizaciones permiten reanudar análisis o comparar semillas.
- No hay soporte documentado de *tool calling*, *function calling* ni razonamiento multi-paso.
- No hay capacidades multilingües declaradas ni modo *thinking*, visión o audio.
- No se ha validado su uso como modelo de chat ni como asistente.

## Casos de uso

- Estudio de escalado en anchura: comparar las 14 ejecuciones (`d_model` de 2 a 64, dos semillas) para medir cómo varía la pérdida y la capacidad efectiva con la anchura, manteniendo fijo el resto de hiperparámetros.
- Análisis de mecánica interna: al ser modelos minúsculos, es viable inspeccionar activaciones, atender a circuitos de trigramas y estudiar cómo se forman las representaciones token a token.
- Reproducción de experimentos de investigación: el repositorio incluye definición de ejecución y logs de actualizaciones, lo que permite replicar curvas de entrenamiento y verificar paradas tempranas.
- Docencia y divulgación: modelos de este tamaño se pueden ejecutar en CPU y sirven para explicar el funcionamiento de un transformer causal sin infraestructura de GPU.
- Pruebas de *tooling* de entrenamiento: validar pipelines de carga de *state dicts*, registro de checkpoints y evaluación sobre datasets sintéticos antes de escalar a modelos mayores.
- Detección de sensibilidad a semillas: con dos semillas por anchura se puede cuantificar la varianza entre ejecuciones y evaluar la robustez de conclusiones a esa escala.
- No es adecuado para atención al cliente, generación de código en producción, RAG ni ninguna tarea generativa real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos; con `d_model` de 64 y vocabulario 4096, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU moderna (RTX 3060 o superior) es sobredimensionada. El entrenamiento y la inferencia son viables en CPU.
- Cabe en GPU consumer: sí, sin restricciones prácticas.
- Opciones de despliegue: carga directa con PyTorch mediante el código de `synthetic_trigrams`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y los pesos no están en GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Proposito |
|---|---|---|---|---|---|
| eoinf/synthetic_components_few_equal_200m... | No disponible (miles a pocos millones) | 256 | No disponible | State dict PyTorch | Grid de experimentos sinteticos |
| GPT-2 small (referencia) | 124 M | 1024 | MIT | Safetensors, GGUF | LM generativo de proposito general |
| TinyLlama 1.1B (referencia) | 1,1 B | 2048 | Apache 2.0 | Safetensors, GGUF | LM generativo de proposito general |
| Pythia-70M (referencia) | 70 M | 2048 | Apache 2.0 | Safetensors | Suite de investigacion sobre escalado |

La comparación es solo orientativa: los modelos de referencia son LLM generativos con licencia y formato de despliegue definidos, mientras que este repositorio es un artefacto de investigación sin pipeline ni licencia declarada. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de propósito general: está entrenado sobre datos sintéticos de trigramas y su vocabulario y contexto están acotados a ese dominio.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin contactar con el autor.
- Idiomas no declarados: no hay evidencia de capacidades multilingües ni de calidad en texto natural.
- Riesgo de alucinación: no aplica en el sentido habitual, pero cualquier uso fuera del dominio sintético producirá salidas sin significado.
- No se incluyen estados del optimizador ni datos de entrenamiento, lo que limita la reproducibilidad completa del proceso.
- Los horizontes reales de entrenamiento pueden diferir del nominal por paradas tempranas; hay que consultar `grid_summary.json` y `result.json` antes de sacar conclusiones.
- Sin benchmarks publicados: no hay base para afirmar calidad o rendimiento frente a alternativas.
- Formato de pesos no estándar para despliegue (state dict de PyTorch), lo que exige código propio de carga.

## Enlaces

- HuggingFace: https://huggingface.co/eoinf/synthetic_components_few_equal_200m_dmodel2_4_6_8_16_32_64_seeds00_01
- Repositorio de código `synthetic_trigrams`: no disponible como enlace directo en la información proporcionada
- Paper, blog o demo: no disponibles
