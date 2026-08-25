# mradermacher/Dark-Nexus-27B-v3.0-GGUF

## Resumen

Dark-Nexus-27B-v3.0 es un modelo de lenguaje publicado originalmente por el usuario ReadyArt y posteriormente cuantizado a formato GGUF por mradermacher. El repositorio en cuestión contiene las cuantizaciones estáticas del modelo original, que incluyen una amplia variedad de formatos de cuantización (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, IQ4_XS, etc.) para facilitar su ejecución en hardware de consumo mediante llama.cpp o similares.

El nombre del modelo sugiere una arquitectura de 27 mil millones de parámetros, pero el dato de parámetros totales extraído de los metadatos de HuggingFace indica 460.730.096 parámetros (aproximadamente 460 millones). Esta discrepancia es notable y debe ser tenida en cuenta: o bien el nombre no refleja el tamaño real, o los metadatos están incompletos o incorrectos. El modelo parece estar orientado a un uso "sin censura" (uncensored) según se desprende de la variante "heretic" que también existe en el repositorio del mismo autor, aunque no hay documentación oficial que lo confirme.

La ficha que sigue se ha elaborado únicamente con la información disponible en el repositorio y los resultados de búsqueda. Muchos datos técnicos no están disponibles y se indican como tales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 460.730.096 (según metadatos de HuggingFace; el nombre sugiere 27B, pero el dato real es inconsistente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo original (si es un transformer denso, MoE, SSM, etc.) ni sobre los datos de entrenamiento. El repositorio de GGUF es una cuantización de un modelo existente, por lo que no se detalla el proceso de entrenamiento original. La única información es que se trata de una cuantización estática (quantize_version: 2) del modelo https://huggingface.co/ReadyArt/Dark-Nexus-27B-v3.0. No se ha publicado ningún detalle sobre el número de tokens de entrenamiento, composición del dataset, o técnicas de alineación (RLHF, DPO, etc.).

## Capacidades

No se han publicado capacidades específicas en la información proporcionada. El nombre del modelo y la variante "uncensored" sugieren que podría estar orientado a generación de texto sin filtros de contenido, pero esto es una especulación. No hay evidencia de soporte de tool calling, agentes, visión o capacidades multimodales. Tampoco hay datos sobre rendimiento en razonamiento, código o matemáticas.

## Casos de uso

No hay casos de uso documentados en la información proporcionada. Dado el formato GGUF y el etiquetado "uncensored", se podría especular con usos en generación de texto creativo o roleplay sin restricciones, pero no hay datos que lo confirmen. No se recomienda usar este modelo en producción sin una evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 1.6 GB, lo que indica que las cuantizaciones son relativamente pequeñas. La cuantización Q4_K_M probablemente ocupe menos de 1 GB, por lo que podría ejecutarse en GPU con 2-4 GB de VRAM o incluso en CPU con suficiente RAM.
- No se especifican GPUs recomendadas. Dado el tamaño, cualquier GPU con soporte para llama.cpp o similar sería suficiente.
- Opciones de despliegue: llama.cpp, Ollama (si se convierte a formato compatible), u otros motores que soporten GGUF.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables con los datos de este modelo. El nombre sugiere una comparación con modelos de 27B como Llama-3-27B o Gemma-2-27B, pero el tamaño real de parámetros (460M) no corresponde a esa categoría.

## Limitaciones y advertencias

- El modelo no tiene documentación técnica: no se conocen sesgos, alucinaciones, ni limitaciones de contexto o idioma.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- La discrepancia entre el nombre del modelo ("27B") y los parámetros reales (460M) es una señal de alarma. Podría tratarse de un modelo de menor tamaño con un nombre engañoso, o un error en los metadatos. Se recomienda verificar el modelo original antes de usarlo.
- La etiqueta "uncensored" sugiere que el modelo no tiene filtros de seguridad, lo que puede generar contenido inapropiado o dañino. No es apto para uso general sin moderación.
- No se dispone de resultados de benchmarks, por lo que no se puede evaluar su rendimiento real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Dark-Nexus-27B-v3.0-GGUF
- Modelo original: https://huggingface.co/ReadyArt/Dark-Nexus-27B-v3.0
- Variante "uncensored-heretic": https://huggingface.co/mradermacher/Dark-Nexus-27B-v3.0-uncensored-heretic-i1-GGUF
- Perfil del autor: https://www.aimodels.fyi/creators/huggingFace/mradermacher
