# eoinf/bigram_structure_copy_200m_dmodel8_16_32_64_seed00

## Resumen

`bigram_structure_copy_200m_dmodel8_16_32_64_seed00` es un modelo de lenguaje causal de escala minima desarrollado por el usuario `eoinf` como parte de una rejilla de experimentos sobre transformers sinteticos. No se trata de un modelo de proposito general, sino de un artefacto de investigacion: un transformer causal de juguete con anchos de capa (`d_model`) de 8, 16, 32 y 64, un vocabulario de 4096 tokens, una longitud de contexto de 256 tokens y un presupuesto nominal de entrenamiento de 199 999 488 tokens.

El modelo forma parte de la familia de experimentos "synthetic_trigrams" / "bigram structure copy", cuyo objetivo parece ser estudiar como escalan las capacidades de copia y estructura de bigramas en funcion del ancho del modelo, manteniendo fijo el resto de hiperparametros. El repositorio contiene unicamente los pesos (state-dict checkpoints), la definicion de la ejecucion, el historial de checkpoints, el log de actualizaciones de entrenamiento y metadatos de resultados; no incluye estados del optimizador ni los datos de entrenamiento.

Por su naturaleza, no es un modelo util para tareas reales de generacion, razonamiento o codigo: es un banco de pruebas para investigadores interesados en mecanismos de aprendizaje sintetico, dinamica de entrenamiento a pequena escala y reproducibilidad de experimentos de rejilla. Su relevancia es, por tanto, metodologica y no practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (detalles no disponibles; codigo en el repositorio `synthetic_trigrams`) |
| Parametros totales | No disponible (rejilla con `d_model` 8, 16, 32 y 64; el recuento exacto no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (pesos en state-dict PyTorch; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | No disponible (vocabulario sintetico de 4096 tokens, no linguistico) |
| Licencia | No disponible |
| Formato de pesos | State-dict de PyTorch (`.pt`/`.pth`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de dimensiones muy reducidas, con anchos de capa de 8, 16, 32 y 64, pensado para experimentos controlados sobre estructura de bigramas y tareas de copia. El vocabulario es de 4096 tokens y el contexto de 256 tokens, lo que situa al modelo en el regimen de "juguete" dentro de la investigacion en mecanismos interpretables. El codigo de carga y definicion arquitectonica reside en el repositorio `synthetic_trigrams`, no en la model card.

El entrenamiento sigue una rejilla nominal de 199 999 488 tokens por modelo, con un seed por anchura. La model card indica que los horizontes reales por modelo, incluidas paradas tempranas, se registran en `grid_summary.json` y `result.json`. El dataset y el tokenizer se describen en `configuration.json`, pero no se detalla su composicion ni si hubo fases de RLHF, DPO o ajuste supervisado. No se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto causal sobre un vocabulario sintetico de 4096 tokens y contexto de 256 tokens.
- Modelado de estructura de bigramas y tareas de copia sintetica (objetivo declarado del experimento).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues: el vocabulario no es linguistico.
- No dispone de modo "thinking", vision, audio ni otras capacidades especiales.

## Casos de uso

- Estudio de escalado de ancho: comparar el comportamiento de `d_model` 8, 16, 32 y 64 bajo un mismo presupuesto de tokens para analizar como emerge la capacidad de copia de bigramas.
- Reproducibilidad de experimentos: reutilizar los checkpoints y metadatos (`grid_summary.json`, `result.json`, log de actualizaciones) para verificar resultados publicados en el repositorio `synthetic_trigrams`.
- Analisis de dinamica de entrenamiento: inspeccionar el log de actualizaciones y el historial de checkpoints para estudiar curvas de perdida y paradas tempranas.
- Docencia e introduccion a transformers: servir como ejemplo minimo y ejecutable de un transformer causal con vocabulario y contexto reducidos.
- Pruebas de infraestructura: validar pipelines de carga de state-dicts, evaluacion y registro de metadatos antes de escalar a modelos mayores.
- Investigacion en interpretabilidad: analizar circuitos y representaciones en un modelo de dimension muy baja donde los mecanismos son mas trazables.
- Baseline sintetico: usar los resultados como referencia en estudios sobre tareas de copia y estructura con vocabulario controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0,1 GB y los anchos de capa (8 a 64) implican un modelo extremadamente pequeno, probablemente inferior a 1 GB en fp32.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4090).
- Opciones de despliegue: carga directa con PyTorch mediante el codigo de `synthetic_trigrams`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `eoinf/bigram_structure_copy_200m_dmodel8_16_32_64_seed00` | No disponible (d_model 8-64) | 256 | No disponible | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (transformers sinteticos de juguete para tareas de copia de bigramas) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de juguete: no apto para generacion de texto real, razonamiento, codigo ni tareas de produccion.
- Vocabulario sintetico de 4096 tokens sin correspondencia linguistica; no soporta idiomas naturales.
- Contexto muy limitado (256 tokens), insuficiente para conversaciones multi-turno o documentos.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- No se incluyen estados del optimizador ni datos de entrenamiento, lo que limita la reproducibilidad completa.
- Riesgo de alucinacion irrelevante en su dominio, pero el modelo no esta calibrado para uso fuera de tareas sinteticas.
- Sin benchmarks publicados: no es posible evaluar su rendimiento frente a alternativas.
- Los resultados reales por modelo dependen de paradas tempranas registradas en `grid_summary.json` y `result.json`; el presupuesto nominal de 199 999 488 tokens puede no haberse consumido integramente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eoinf/bigram_structure_copy_200m_dmodel8_16_32_64_seed00
- Repositorio `synthetic_trigrams` (codigo de arquitectura y carga): no se proporciona URL directa en la informacion disponible
- Paper, blog o demo: no disponible
