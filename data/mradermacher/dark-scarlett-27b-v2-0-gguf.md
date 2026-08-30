# mradermacher/Dark-Scarlett-27B-v2.0-GGUF

## Resumen

Dark-Scarlett-27B-v2.0-GGUF es una cuantizacion en formato GGUF del modelo Dark-Scarlett-27B-v2.0, originalmente publicado por ReadyArt y convertido por mradermacher. El repositorio contiene multiples cuantizaciones estaticas (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, IQ4_XS, etc.) pensadas para su uso con motores de inferencia como llama.cpp, Ollama o vLLM. A pesar del nombre que sugiere 27 mil millones de parametros, el archivo safetensors referenciado indica 460.730.096 parametros totales, lo que genera una discrepancia significativa que debe tenerse en cuenta al evaluar el modelo.

La informacion disponible es muy limitada: no se publican detalles sobre arquitectura, entrenamiento, licencia o capacidades. Esto dificulta una evaluacion rigurosa y obliga a tratar cualquier afirmacion sobre rendimiento o idoneidad como especulativa. El repositorio tiene cero descargas y cero likes, lo que sugiere que es un modelo reciente o poco utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 460.730.096 (segun safetensors; el nombre sugiere 27B, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF (tambien safetensors como formato original) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo original (si es transformer, MoE, SSM u otro tipo). Tampoco hay datos sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas. El unico dato disponible es que se trata de una cuantizacion estatica del checkpoint de ReadyArt, realizada por mradermacher, sin que se documenten modificaciones adicionales. La discrepancia entre el nombre del modelo (27B) y los parametros reales (460M) sugiere que podria tratarse de un error de nomenclatura o de un checkpoint parcial, pero no hay confirmacion.

## Capacidades

No se han publicado detalles sobre las capacidades especificas del modelo. Al ser un modelo de lenguaje, es probable que pueda realizar tareas de generacion de texto, pero no hay evidencia documentada sobre razonamiento, generacion de codigo, soporte de tool calling, capacidades multilingues o modo thinking. Tampoco se indica si soporta vision o audio. En ausencia de informacion, cualquier afirmacion sobre capacidades concretas seria especulativa.

## Casos de uso

No se dispone de casos de uso documentados para este modelo. Dada la falta de informacion sobre arquitectura, entrenamiento y capacidades, no es posible recomendar aplicaciones concretas con garantias. Los usuarios deberian evaluar el modelo en sus propios escenarios antes de considerarlo para produccion. Se recomienda consultar el repositorio original de ReadyArt para obtener mas detalles, aunque no se ha podido acceder a el en la busqueda realizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se ofrecen comparativas con modelos similares. Sin estos datos, es imposible valorar el rendimiento relativo del modelo.

## Requisitos de hardware

No se dispone de informacion sobre requisitos de hardware especificos. El tamano total del repositorio es de 1.6 GB, lo que incluye multiples archivos cuantizados. Dado que los parametros reales son aproximadamente 460 millones, es plausible que las cuantizaciones mas agresivas (como Q2_K o IQ4_XS) quepan en GPUs consumer con 4-6 GB de VRAM, pero esto es una estimacion basada en el conteo de parametros y no en datos oficiales. No se conocen recomendaciones de GPU concretas ni opciones de despliegue validadas. Para un uso fiable, se recomienda probar con llama.cpp u Ollama en hardware local y medir la latencia y el throughput en funcion del caso de uso.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. Existen otras versiones de Dark-Scarlett (v1.0-27B-i1 y v2.0-31B) en el mismo perfil de mradermacher, pero no se conocen sus especificaciones ni rendimiento. Sin datos de benchmarks ni detalles de arquitectura, no es posible comparar este modelo con alternativas como Llama 3, Mistral o Qwen. Se recomienda consultar el repositorio original para obtener informacion adicional.

## Limitaciones y advertencias

- La discrepancia entre el nombre del modelo (27B) y los parametros reales (460M) es significativa y debe considerarse antes de cualquier uso.
- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial ni su redistribucion.
- El repositorio tiene cero descargas y cero likes, lo que indica una adopcion nula y una falta de validacion por parte de la comunidad.
- No existen benchmarks publicados, por lo que el rendimiento real es incierto.
- Cualquier uso en produccion requeriria una evaluacion exhaustiva previa, dado que la informacion disponible es insuficiente para garantizar su fiabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Dark-Scarlett-27B-v2.0-GGUF
- Modelo original (referenciado): https://huggingface.co/ReadyArt/Dark-Scarlett-27B-v2.0
- Otras versiones de mradermacher:
  - https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-27B-i1-GGUF
  - https://huggingface.co/mradermacher/Dark-Scarlett-v2.0-31B-GGUF
- Perfil del autor: https://www.aimodels.fyi/creators/huggingFace/mradermacher
