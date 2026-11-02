# eoinf/bigram_structure_groups016_200m_dmodel8_16_32_64_seed00

## Resumen

`bigram_structure_groups016_200m_dmodel8_16_32_64_seed00` es un modelo de lenguaje causal de tamano muy reducido publicado por el usuario `eoinf` en HuggingFace. No se trata de un modelo destinado a produccion ni a uso general, sino de una pieza dentro de una rejilla de experimentos controlados ("Transformer experiment grid") orientada al estudio de estructuras de bigramas y trigramas en transformers sinteticos. El nombre codifica las condiciones del experimento: grupo estructural 016, presupuesto nominal de unos 200 millones de tokens de entrenamiento, y cuatro anchos de `d_model` (8, 16, 32 y 64) con una semilla por anchura.

El repositorio contiene unicamente los pesos en formato de `state-dict` de PyTorch, junto con metadatos de la ejecucion (definicion del run, historial de checkpoints, log de actualizaciones de entrenamiento y `result.json`). No incluye estados del optimizador ni datos de entrenamiento. El vocabulario es de 4096 tokens y la longitud de contexto es de 256 tokens, valores tipicos de experimentos de mecanistica interpretabilidad a pequena escala.

Su relevancia es por tanto cientifica y metodologica: permite reproducir y analizar como transformers de capacidad minima aprenden dependencias de bigramas/trigramas bajo un presupuesto de computo fijo. No debe confundirse con un modelo de chat o de codigo utilizable; es material de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), segun la model card |
| Parametros totales | No disponible (d_model 8/16/32/64; el sufijo "200m" alude al presupuesto de tokens, no a parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (pesos en `state-dict` de PyTorch; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `state-dict` de PyTorch (`.pt`/`.pth`), cargables con el codigo de `synthetic_trigrams` |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de dimensiones minimas, con `d_model` de 8, 16, 32 y 64 y una semilla por anchura. El vocabulario es de 4096 tokens y el contexto de 256 tokens. El presupuesto nominal de entrenamiento es de 199.999.488 tokens, aunque la model card advierte que los horizontes reales por modelo (incluidas paradas tempranas) se registran en `grid_summary.json` y `result.json`; es decir, no todos los modelos de la rejilla consumieron necesariamente el mismo numero de tokens.

El dataset y el tokenizer se describen en `configuration.json`, no en la model card. El codigo de arquitectura y carga vive en el repositorio `synthetic_trigrams`. No se menciona uso de RLHF, DPO ni tecnicas de alineacion; se trata de preentrenamiento puro sobre datos sinteticos orientados al estudio de estructura de n-gramas. Cada directorio incluye definicion del run, historial de checkpoints, log de actualizaciones y metadatos de resultado, lo que facilita el analisis de curvas de aprendizaje. No se incluyen estados del optimizador ni los datos de entrenamiento.

## Capacidades

- Generacion de texto causal a nivel de token sobre el vocabulario sintetico de 4096 entradas.
- Modelado de dependencias locales de bigramas y trigramas, que es el objeto del experimento.
- Analisis de mecanismos internos por variacion de anchura (`d_model` 8 a 64) con contexto fijo de 256 tokens.
- Reproducibilidad de experimentos: checkpoints, historial y logs incluidos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documentan capacidades multilingues; el vocabulario es sintetico y no esta mapeado a idiomas naturales en la informacion disponible.

## Casos de uso

- Estudio de interpretabilidad mecanicista: entrenar y analizar circuitos en transformers de anchura minima para aislar como se representan bigramas y trigramas, aprovechando que `d_model` de 8 a 64 hace tratable el analisis de activaciones.
- Reproduccion de experimentos de scaling: comparar curvas de perdida entre anchos 8, 16, 32 y 64 bajo un presupuesto nominal fijo de ~200M tokens, usando los logs y `result.json` incluidos.
- Validacion de pipelines de entrenamiento: servir como caso de prueba barato para verificar codigo de carga de `state-dict`, tokenizacion y evaluacion antes de escalar a modelos mayores.
- Docencia e investigacion: ilustrar el funcionamiento de un transformer causal con contexto de 256 tokens y vocabulario de 4096 en cursos o practicas sin requerir GPU de gama alta.
- Analisis de paradas tempranas: estudiar el efecto de horizontes de entrenamiento distintos entre modelos de la misma rejilla comparando `grid_summary.json` con `result.json`.
- Baseline sintetico: usar el modelo como referencia de baja capacidad en experimentos que comparen arquitecturas o tecnicas de regularizacion sobre datos sinteticos de n-gramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con `d_model` de 8 a 64 y contexto de 256 tokens, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU. No se dispone de cifras exactas de parametros para calcularla con precision.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch (por ejemplo, RTX 3060 o superior) es mas que suficiente. Tambien es viable en CPU.
- Cabe en GPU consumer: si, con margen amplio, dado el tamano reducido del repositorio (0.0 GB reportados).
- Opciones de despliegue: carga directa con PyTorch usando el codigo de `synthetic_trigrams`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es desplegable en esos runtimes sin conversion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `eoinf/bigram_structure_groups016_200m_dmodel8_16_32_64_seed00` | No disponible (d_model 8-64) | 256 | No disponible | HuggingFace, pesos PyTorch |
| GPT-2 small | 124M | 1024 | MIT | HuggingFace, ampliamente soportado |
| Pythia-70M | 70M | 2048 | Apache 2.0 | HuggingFace, EleutherAI |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | HuggingFace |

La comparacion es orientativa: los modelos citados son transformers pequenos de uso general, mientras que este es un artefacto de investigacion sobre datos sinteticos. No se dispone de datos de rendimiento comparables para este modelo.

## Limitaciones y advertencias

- No es un modelo de uso general: esta entrenado sobre datos sinteticos y un vocabulario de 4096 tokens, por lo que no produce texto en lenguaje natural util.
- Licencia no especificada: no se puede asumir permiso de uso comercial; conviene contactar con el autor antes de cualquier uso fuera de investigacion.
- Idiomas no documentados: no hay evidencia de capacidades multilingues ni de manejo de lenguaje natural.
- Contexto muy limitado (256 tokens), insuficiente para tareas de contexto largo.
- Riesgo de alucinacion no evaluado; al ser un modelo sintetico, la nocion de factualidad no aplica, pero tampoco hay garantias de coherencia fuera del dominio de entrenamiento.
- No se incluyen estados del optimizador ni datos de entrenamiento, lo que limita la reproduccion exacta del entrenamiento (solo la inferencia y el analisis de checkpoints).
- Los horizontes reales de entrenamiento pueden diferir del nominal de ~200M tokens por paradas tempranas; hay que consultar `grid_summary.json` y `result.json`.
- Sin soporte documentado de tool calling, agentes ni cuantizacion para despliegue en runtimes estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eoinf/bigram_structure_groups016_200m_dmodel8_16_32_64_seed00
- Repositorio de codigo `synthetic_trigrams`: mencionado en la model card, sin URL disponible en la informacion proporcionada.
- `configuration.json`, `grid_summary.json` y `result.json`: incluidos en el repositorio del modelo.
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la informacion disponible.
