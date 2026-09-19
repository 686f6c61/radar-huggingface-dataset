# Dohyeon1/ERNIE-Sub-MoE-ngroups48-adaptive

## Resumen

ERNIE-Sub-MoE-ngroups48-adaptive es un checkpoint de generación de texto publicado en HuggingFace por el usuario Dohyeon1. Por el identificador y la etiqueta de arquitectura `ernie4_5_moe`, se trata de una variante de tipo mezcla de expertos (MoE) derivada de la familia ERNIE 4.5 de Baidu; el sufijo `ngroups48-adaptive` sugiere una configuración con 48 grupos de expertos y algún esquema de enrutamiento adaptativo, pero la model card no documenta ninguno de estos extremos.

El repositorio contiene 21.825.437.888 parámetros en formato safetensors (unos 21,8 mil millones) y ocupa 43,7 GB, cifra coherente con pesos almacenados en bf16/fp16 y no con pesos cuantizados. No se publican número de parámetros activos, longitud de contexto, idiomas soportados, licencia ni resultados de evaluación; la model card es la plantilla autogenerada de HuggingFace con todas las secciones marcadas como `[More Information Needed]`.

Su relevancia actual es limitada y conviene ser explícito: el modelo acumula 0 descargas y 0 likes, y los metadatos muestran que fue creado y actualizado por última vez el mismo día, con menos de media hora de diferencia, lo que apunta a una subida automatizada de un checkpoint derivado sin documentación asociada. Se trata, por tanto, de un artefacto a considerar solo como material de experimentación y nunca como base de un sistema en producción sin una evaluación previa propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según la etiqueta `ernie4_5_moe`; configuración interna no documentada |
| Parámetros totales | 21.825.437.888 (≈21,8 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no se publican versiones cuantizadas; el tamaño del repo (43,7 GB) es compatible con pesos bf16/fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se especifica licencia en el repositorio) |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline | text-generation |
| Autor | Dohyeon1 |
| Tamaño del repositorio | 43,7 GB |
| Fecha de creación | 2026-09-19 |
| Última actualización | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La única información fiable sobre la arquitectura es la etiqueta `ernie4_5_moe` del repositorio, que vincula el checkpoint a la familia ERNIE 4.5 en su variante de mezcla de expertos, y el nombre del modelo, que indica 48 grupos de expertos y un mecanismo descrito como adaptativo. No hay ninguna confirmación en la información disponible sobre el número de expertos por token, la dimensionalidad de las capas, el tipo de atención, la estrategia de enrutamiento ni el número de capas. Tampoco se documenta si se trata de un modelo afinado, destilado o recortado a partir de un checkpoint mayor, ni qué componente concreto se ha modificado respecto al modelo original.

No existe información sobre datos de entrenamiento: ni número de tokens, ni composición del dataset, ni uso de RLHF, DPO u otra técnica de alineamiento. La model card dedica las secciones de datos, hiperparámetros y procedimiento a la plantilla vacía. El único identificador de tipo paper presente en las etiquetas es `arxiv:1910.09700`, que corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono (citado por defecto en la plantilla de HuggingFace) y no a una publicación técnica sobre este modelo.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Compatibilidad con el pipeline `text-generation` de la librería `transformers`.
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- Capacidades de razonamiento, código o matemáticas: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Al ser una variante MoE, es previsible una huella de memoria acorde a sus 21,8 B de parámetros totales, con un coste de cómputo por token inferior al de un modelo denso del mismo tamaño, aunque no se especifica el número de parámetros activos.

## Casos de uso

Ninguno de los casos siguientes está validado por el autor; se plantean como escenarios de experimentación condicionados a que el checkpoint se comporte de forma equivalente a la familia ERNIE 4.5 MoE de la que deriva.

- Experimentación con enrutamiento MoE: el modelo permite estudiar el comportamiento de una configuración de 48 grupos de expertos con enrutamiento adaptativo, comparando la distribución de activaciones por experto frente a configuraciones estándar.
- Generación de texto conversacional en prototipos: puede emplearse con el pipeline `text-generation` de `transformers` para construir demos de chat multi-turno, siempre que se valide antes la calidad y la coherencia de las respuestas.
- Base para ajuste fino supervisado: al publicarse en safetensors y con arquitectura compatible con `transformers`, puede servir como punto de partida para un SFT sobre un dominio concreto, asumiendo el coste de adaptar los pesos a una tarea específica.
- Evaluación comparativa interna: útil como referencia dentro de un banco de pruebas propio de modelos MoE, midiendo perplejidad y latencia frente a otros checkpoints del mismo rango de parámetros.
- Investigación sobre compresión y cuantización: con 21,8 B de parámetros en bf16/fp16, es un candidato razonable para estudiar la pérdida de calidad al aplicar cuantización de 8 y 4 bits, ya que no existen versiones cuantizadas publicadas.
- Servicio interno autoalojado con vLLM o TGI: desplegable en infraestructura propia si se dispone de una GPU de 80 GB o de varias GPU con paralelismo tensorial, sin depender de APIs externas.
- Destilación o poda de expertos: el checkpoint puede utilizarse como material de partida para estudiar la eliminación de grupos de expertos y su efecto en la calidad, dado que el nombre del modelo sugiere precisamente una subselección de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 44 GB solo para los pesos, más memoria para caché KV y activaciones; presupuesto práctico de 50 a 60 GB por réplica.
- VRAM estimada en int8: aproximadamente 22 GB para los pesos, sin contar caché ni overhead del runtime.
- VRAM estimada en int4: aproximadamente 12-13 GB para los pesos, más overhead.
- GPU recomendadas para bf16: NVIDIA A100 80 GB, H100 80 GB o H200. También es viable con 2× RTX 4090 o 2× A6000 en paralelismo tensorial, aunque el margen es ajustado.
- GPU de consumo: no cabe en una única GPU de 24 GB en bf16. En 4 bits podría caber en una RTX 4090 o RTX 3090, pero requeriría convertir los pesos, ya que el repositorio no incluye versiones GGUF, AWQ ni GPTQ.
- Opciones de despliegue: `transformers` de forma nativa; vLLM, TGI o SGLang para servicio con paralelismo tensorial. llama.cpp y Ollama solo tras una conversión manual a GGUF.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de las alternativas proceden de su documentación pública y no han sido verificados contra este checkpoint, cuyas métricas de rendimiento no están publicadas.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| ERNIE-Sub-MoE-ngroups48-adaptive | 21,8 B | no disponible | no disponible | no disponible | no disponible |
| Mixtral 8x7B (Mistral AI) | 46,7 B | 12,9 B | 32 000 tokens | Apache 2.0 | publicado por el autor |
| DeepSeek-V2-Lite | 15,7 B | 2,4 B | 32 000 tokens | licencia propia de DeepSeek, con condiciones para uso comercial | publicado por el autor |
| Qwen1.5-MoE-A2.7B | 14,3 B | 2,7 B | 32 000 tokens | Apache 2.0 | publicado por el autor |

Frente a estas alternativas, el checkpoint aquí descrito no aporta datos verificables de contexto, licencia ni evaluación, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia explícita no hay autorización clara de uso comercial ni de redistribución, lo que supone un riesgo legal directo para cualquier producto.
- Documentación inexistente: la model card es la plantilla vacía de HuggingFace; no hay información de arquitectura detallada, datos de entrenamiento ni procedimiento de alineamiento.
- Riesgo elevado de alucinación y de comportamiento errático: al no haber evaluación publicada, no se puede estimar la tasa de error en ninguna tarea.
- Idiomas desconocidos: no se declara ningún idioma soportado, por lo que el rendimiento en castellano es una incógnita total.
- Longitud de contexto desconocida: no se puede planificar ningún caso de uso que dependa de ventanas largas.
- Sesgos: no evaluados ni documentados por el autor.
- Procedencia del checkpoint: los metadatos sugieren una subida automatizada de una variante derivada, sin trazabilidad de qué se ha modificado respecto al modelo original de la familia ERNIE 4.5.
- Ausencia de validación comunitaria: 0 descargas y 0 likes implican que el modelo no ha sido reproducido ni probado por terceros.
- Compatibilidad: al ser una arquitectura MoE de la familia ERNIE, puede requerir versiones concretas de `transformers` y código específico de enrutamiento; no se garantiza su funcionamiento en runtimes genéricos.
- No recomendado para producción sin una evaluación propia completa de calidad, latencia, seguridad y encaje legal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dohyeon1/ERNIE-Sub-MoE-ngroups48-adaptive
- Artículo referenciado en las etiquetas (Lacoste et al., 2019, sobre estimación de emisiones de carbono, no específico de este modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental en aprendizaje automático: https://mlco2.github.io/impact
- Paper, repositorio de código, demo o blog del autor: no disponible
- Resultados de búsqueda web: la búsqueda no devolvió ningún enlace relacionado con el modelo; los resultados obtenidos trataban de temáticas ajenas (definiciones generales de arte) y no se han utilizado como fuente.
