# lan121l/heru

## Resumen

heru es un modelo de lenguaje de 4.022.468.096 parametros (unos 4B) publicado por el usuario lan121l en HuggingFace bajo licencia MIT. Segun la propia model card, se trata de un producto intermedio del modelo her-4b, es decir, un checkpoint previo al proceso de alineacion, sin RLHF ni tecnicas equivalentes de ajuste por preferencias. El autor lo describe de forma explicita como un modelo de generacion muy inestable, con un seguimiento de instrucciones deficiente y sin ninguna medida de seguridad incorporada.

El modelo se distribuye principalmente en formato GGUF y su repositorio ocupa 2.5 GB. La finalidad declarada de su publicacion no es el uso directo, sino servir de base para que otros constructores de modelos apliquen su propio proceso de alineacion. El autor advierte que su uso correcto exige un conocimiento tecnico muy elevado y que cualquier consecuencia derivada de la utilizacion del modelo recae sobre el usuario.

No se dispone de informacion publica sobre la arquitectura interna, la longitud de contexto, los idiomas soportados ni la composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (tipos concretos no disponibles) |
| Idiomas soportados | no disponible (la model card esta redactada en chino) |
| Licencia | MIT |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura del modelo. El unico dato tecnico estructural es que se trata de un checkpoint intermedio de un modelo de 4B denominado her-4b, publicado antes de cualquier fase de alineacion. No consta que se haya aplicado RLHF, DPO ni otra tecnica de ajuste por preferencias, y tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si existieron fases diferenciadas de preentrenamiento y ajuste supervisado. No se describe ninguna innovacion tecnica concreta (atencion lineal, decodificacion especulativa, arquitectura hibrida, mezcla de expertos, etc.).

La ausencia de alineacion es precisamente el rasgo que define a este checkpoint: el autor lo presenta como material en bruto para que terceros construyan encima su propio pipeline de alineacion, en lugar de como un modelo listo para producir.

## Capacidades

- Generacion de texto: el modelo puede producir texto, pero el autor califica la generacion como "muy inestable".
- Seguimiento de instrucciones: descrito explicitamente como "deficiente" por el propio autor.
- Conversacion: la etiqueta "conversational" aparece en el repositorio, aunque sin garantia de calidad.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- Seguridad: el autor indica que no existe ninguna medida de seguridad, filtro ni moderacion.

## Casos de uso

Dado que el autor desaconseja de forma explicita el uso directo, los casos de uso se limitan a investigacion y desarrollo de pipelines de alineacion:

- Investigacion en alineacion (RLHF/DPO): el modelo sirve como punto de partida para aplicar tecnicas de ajuste por preferencias y medir como cambia el comportamiento respecto al checkpoint sin alinear.
- Red-teaming y analisis de seguridad: al carecer de filtros, permite estudiar el comportamiento de un modelo sin alinear y construir conjuntos de evaluacion de riesgos.
- Ajuste supervisado (SFT): investigadores pueden aplicar sus propios datasets de instrucciones y comparar la mejora frente a un modelo ya alineado de fabrica.
- Investigacion academica sobre comportamiento de modelos base: util para publicaciones que comparan checkpoints intermedios frente a modelos finales.
- Desarrollo de pipelines de alineacion propios: equipos que quieran entrenar un modelo de 4B desde un punto controlado y conocer exactamente que datos de alineacion introducen.
- Evaluacion de tecnicas de cuantizacion: al estar disponible en GGUF, permite medir como afecta la cuantizacion al comportamiento de un modelo sin alinear.
- Experimentacion controlada con destilacion y generacion de datos sinteticos: posible en entornos de laboratorio, aunque la inestabilidad del modelo limita mucho su utilidad practica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones basadas en el recuento de parametros (4.022.468.096), no en mediciones publicadas:

- VRAM estimada para inferencia:
  - FP16/BF16: en torno a 8 GB.
  - Cuantizacion Q8: en torno a 4,3 GB.
  - Cuantizacion Q4_K_M: en torno a 2,5 GB (coincide con el tamano del repositorio, 2.5 GB).
  - Cuantizacion Q3: en torno a 2 GB.
- GPU recomendadas: para FP16, una GPU con 12-16 GB o mas (RTX 4080, RTX 4090, A10G, A100). Para Q4, cualquier GPU con 4-6 GB o superior.
- Cabe en GPU de consumo: si. Con cuantizacion Q4 es viable en RTX 3060 12 GB, RTX 4060 8 GB o RTX 4090, e incluso en equipos con 6 GB de VRAM usando Q3.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python y cualquier runtime compatible con GGUF. La etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia tipo HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion directa es dificil porque heru es un checkpoint sin alinear, mientras que las alternativas de tamano similar son modelos finales ya alineados. Se comparan por tamano, contexto y licencia:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| heru (lan121l) | ~4B | no disponible | MIT | checkpoint intermedio sin alinear |
| Qwen2.5-3B | 3,09B | 32.768 tokens (ampliable) | Apache 2.0 | modelo alineado |
| Llama-3.2-3B | 3,21B | 128.000 tokens | Llama 3.2 Community License | modelo alineado |
| Phi-3.5-mini | 3,8B | 128.000 tokens | MIT | modelo alineado |

Datos de contexto y licencia segun las fichas publicas de cada fabricante; no se dispone de benchmarks comparativos que incluyan a heru.

## Limitaciones y advertencias

- Generacion muy inestable, segun el propio autor.
- Seguimiento de instrucciones deficiente.
- Ausencia total de medidas de seguridad, filtros o moderacion.
- No apto para uso directo en produccion ni para interaccion con usuarios finales.
- Riesgo elevado de alucinacion y de salidas incoherentes.
- Sin informacion sobre sesgos, composicion del dataset o cobertura idiomatica.
- Sin datos publicos sobre la longitud de contexto real.
- Licencia MIT: permite uso comercial y modificacion, pero el autor declina cualquier responsabilidad sobre las consecuencias de su uso.
- El modelo esta pensado para constructores con alta cualificacion tecnica.

## Enlaces

- HuggingFace: https://huggingface.co/lan121l/heru
