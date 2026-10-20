# BIGJUTT/Qwen3-8B-abliterated

## Resumen

BIGJUTT/Qwen3-8B-abliterated es un derivado del modelo Qwen/Qwen3-8B al que se le ha aplicado una técnica de *abliteration* (eliminación de la conducta de rechazo mediante ingeniería de activaciones) usando el método `advanced` de la herramienta OBLITERATUS, desarrollada por elder-plinius. No es un modelo entrenado desde cero ni un fine-tuning supervisado: los pesos originales de Qwen3-8B se modifican quirúrgicamente para suprimir la dirección de activación asociada a las negativas del modelo, de modo que el modelo deja de rechazar peticiones que el original declinaría.

El modelo conserva la arquitectura y el tamaño del base: un transformer decoder-only denso de 8.190.735.360 parámetros (8,19 B), con pesos en safetensors y un repositorio de 16,4 GB, lo que corresponde a precisión bf16/fp16. El autor publica muy poca información: la model card se limita a indicar el modelo base, el método de abliteración y un ejemplo de uso con `transformers`; no hay license declarada, ni resultados de evaluación, ni detalles sobre el procedimiento exacto aplicado.

Su relevancia es acotada y de nicho: interesa a investigadores de seguridad y alineación que estudian mecanismos de rechazo, a equipos de *red teaming* que necesitan un modelo sin filtros para generar casos adversarios, y a desarrolladores que quieren un modelo local de 8 B sin restricciones de contenido para escritura creativa o generación de datos sintéticos. No es un modelo recomendable como asistente de producción para usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No indicada en el repositorio. El modelo base Qwen3-8B declara 32.768 tokens nativos, extensibles hasta 131.072 con YaRN (dato heredado, no verificado en esta model card) |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio (solo safetensors en bf16). Compatible con cuantizacion posterior mediante llama.cpp/GGUF, GPTQ, AWQ o bitsandbytes, sin artefactos oficiales publicados |
| Idiomas soportados | `en` segun la etiqueta del repositorio. El modelo base Qwen3 declara soporte de aproximadamente 119 idiomas y dialectos (dato heredado) |
| Licencia | No disponible. El repositorio no declara licencia; el modelo base Qwen3-8B se distribuye bajo Apache 2.0, pero el derivado no especifica terminos |
| Formato de pesos | safetensors (bf16), repositorio de 16,4 GB |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-8B original: un transformer decoder-only denso con atención por grupos (GQA), normalizacion RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). El modelo base incorpora un modo de razonamiento explicito (*thinking mode*) que puede activarse o desactivarse por prompt, y fue entrenado por Alibaba Qwen con un pipeline que combina preentrenamiento a gran escala, post-entrenamiento supervisado y etapas de aprendizaje por refuerzo. No se dispone de datos verificados en la informacion proporcionada sobre el numero exacto de tokens de entrenamiento ni sobre la composicion del corpus del base.

Sobre el proceso de abliteracion no hay detalle tecnico en la model card mas alla de la etiqueta del metodo (`advanced`) y la referencia a OBLITERATUS. La tecnica estandar consiste en calcular una direccion de rechazo a partir de la diferencia media de activaciones entre prompts dañinos y prompts inofensivos, y proyectar fuera esa direccion en las matrices de pesos de las capas implicadas. Es un procedimiento de inferencia de direcciones sobre un conjunto de prompts, sin gradientes ni entrenamiento adicional: no anade conocimiento nuevo ni modifica el corpus original, solo altera el comportamiento condicionado. Esto implica que el modelo derivado no ha pasado por ninguna fase de RLHF o DPO propia y que no existe documentacion sobre que capas se intervinieron, con que conjunto de calibracion ni con que intensidad.

## Capacidades

- Generacion de texto y razonamiento multi-paso, heredados del Qwen3-8B base, con modo *thinking* disponible a traves del formato de prompt del modelo original.
- Generacion de codigo y matemáticas a nivel de un modelo de 8 B, con soporte del modelo base para instrucciones tecnicas.
- Ausencia (o supresion parcial) de la conducta de rechazo: el modelo tiende a responder a peticiones que el Qwen3-8B original declinaria.
- Conversacion multi-turno dentro de la ventana de contexto del base.
- Soporte de tool calling / function calling heredado del base, aunque no esta verificado que la abliteracion preserve esta capacidad intacta.
- Capacidad multilingue potencial heredada del base (aproximadamente 119 idiomas), aunque el repositorio solo declara `en`.
- Generacion de datos sinteticos sin filtros de contenido, incluyendo texto adversario para entrenar clasificadores de seguridad.

## Casos de uso

- **Red teaming y evaluacion de robustez**: usar el modelo como generador de peticiones y respuestas adversarias para probar los filtros de un sistema en produccion, aprovechando que no rechaza las consultas que el base filtraria.
- **Investigacion sobre mecanismos de rechazo**: comparar activaciones y respuestas entre este modelo y Qwen3-8B original para localizar y caracterizar la direccion de rechazo, con el mismo tokenizador y arquitectura en ambos lados del experimento.
- **Generacion de datasets de moderacion**: producir pares prompt-respuesta etiquetados como no seguros que sirvan para entrenar o evaluar clasificadores de contenido en lugar de anotarlos manualmente.
- **Auditoria de pipelines de inferencia**: verificar que los guardrails de una plataforma (filtros de entrada/salida, system prompts, moderacion externa) funcionan correctamente cuando el modelo subyacente no colabora, en lugar de depender del propio rechazo del modelo.
- **Escritura creativa sin restricciones**: ficcion con violencia, temas adultos o dialogos crudos donde los rechazos del modelo base interrumpen el flujo de generacion; el contexto de 32k del base permite trabajar con capitulos o guiones completos.
- **Generacion de datos sinteticos diversos**: ampliar la distribucion de un corpus de entrenamiento con estilos y temas que un modelo alineado evita, para tareas de aumento de datos donde la diversidad pesa mas que la seguridad del contenido.
- **Despliegue local y offline**: al tener 8,19 B de parametros, se puede servir en una unica GPU de consumo con cuantizacion de 4 u 8 bits, lo que permite experimentar sin dependencia de APIs externas ni de registro de consultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio no ofrece evaluaciones comparativas frente al modelo base. Tampoco hay datos medidos de latencia o throughput.

Como referencia cualitativa, la literatura sobre abliteration describe de forma consistente una degradacion de capacidades (razonamiento, seguimiento de instrucciones, coherencia en contextos largos) proporcional a la intensidad de la intervencion, pero no existe medicion publicada para esta version concreta, por lo que no se puede cuantificar el coste.

## Requisitos de hardware

- **VRAM en bf16**: los 16,4 GB de pesos exigen al menos 18-20 GB de VRAM contando overhead y cache KV; una RTX 4090 (24 GB) o una A100 40 GB permiten servir el modelo, con contexto limitado en el caso de la 4090 si se usa la ventana completa.
- **Cache KV**: con la ventana nativa de 32k tokens del base, la cache puede ocupar varios GB adicionales en bf16 (estimacion orientativa de 4-6 GB), por lo que el contexto completo requiere 24 GB o mas de VRAM.
- **Cuantizacion 8 bits**: aproximadamente 9-10 GB de pesos; cabe en RTX 3090/4090 y en GPUs de 16 GB con contexto moderado.
- **Cuantizacion 4 bits**: aproximadamente 5-6 GB de pesos; cabe en RTX 4060 Ti 16 GB, RTX 4070, RTX 3080 12 GB e incluso en GPUs de 8 GB con contexto reducido.
- **CPU y Apple Silicon**: viable con llama.cpp u Ollama tras convertir los pesos a GGUF; el rendimiento dependera del ancho de banda de memoria.
- **Opciones de despliegue**: vLLM o TGI para servir en GPU (requiere que el modelo se cargue correctamente con `transformers`, dado que no hay configuracion especifica publicada), llama.cpp/Ollama para local, y `transformers` directamente para experimentacion, tal como indica el autor.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones y dependeran del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Conducta de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BIGJUTT/Qwen3-8B-abliterated | 8,19 B | No indicado (base: 32.768, hasta 131.072 con YaRN) | Suprimida mediante abliteration | No disponible | Repositorio de comunidad, 0 descargas |
| Qwen/Qwen3-8B (base) | 8,19 B | 32.768 tokens nativos, hasta 131.072 con YaRN | Alineado, con rechazos | Apache 2.0 | Modelo oficial, ampliamente distribuido |
| Qwen3-4B | Aproximadamente 4 B | 32.768 tokens nativos, extensible con YaRN | Alineado, con rechazos | Apache 2.0 | Modelo oficial |
| Qwen3-14B | Aproximadamente 14 B | 32.768 tokens nativos, extensible con YaRN | Alineado, con rechazos | Apache 2.0 | Modelo oficial |

No se dispone de datos verificados de otras variantes abliteradas de Qwen3-8B publicadas por la comunidad, por lo que no se incluyen en la comparativa. La diferencia practica frente al base no esta en capacidad bruta (los pesos de partida son los mismos) sino en la conducta de rechazo y en el coste de calidad que impone la intervencion, que no ha sido medido.

## Limitaciones y advertencias

- **Licencia sin declarar**: el repositorio no especifica licencia. Aunque el modelo base es Apache 2.0, la ausencia de terminos en el derivado crea incertidumbre legal para uso comercial; conviene contactar con el autor o asumir los terminos del base con cautela.
- **Sin evaluacion publicada**: no hay benchmarks ni comparacion con el base, de modo que se desconoce el alcance real de la degradacion en razonamiento, codigo o seguimiento de instrucciones.
- **Alucinacion**: la abliteration no mejora la factualidad y puede incrementar la generacion de contenido incorrecto al eliminar la cautela del modelo alineado; en dominios sensibles (salud, legal, finanzas) el riesgo es alto.
- **Filtros de seguridad suprimidos**: el modelo puede producir contenido dañino, ilegal o sexualmente explicito. No es apto para productos orientados a usuarios finales sin un sistema de moderacion externo.
- **Sesgos**: los sesgos del corpus original de Qwen3-8B persisten intactos; eliminar la capa de rechazo tambien elimina parte de la cautela que amortiguaba ciertos sesgos.
- **Idioma**: la etiqueta del repositorio solo declara `en`; el rendimiento real en castellano no esta verificado aunque el base sea multilingue.
- **Metodo no documentado**: no se indica que capas se intervinieron, con que prompts de calibracion ni con que intensidad, lo que hace imposible reproducir el proceso.
- **Mantenimiento**: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia, sin issues ni documentacion de soporte; es un artefacto de comunidad sin garantias.
- **Uso responsable**: cualquier despliegue deberia hacerse en entornos controlados de investigacion o auditoria, con registro de uso y sin exposicion directa al publico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BIGJUTT/Qwen3-8B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Repositorio oficial de la familia Qwen3: https://github.com/QwenLM/Qwen3

No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
