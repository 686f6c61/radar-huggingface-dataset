# KridgeDookie/Ternary-Bonsai-2-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-GGUF

## Resumen

KridgeDookie/Ternary-Bonsai-2-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-GGUF es una derivada "abliterated" (con las direcciones de rechazo eliminadas) del modelo PrismML Bonsai 2 27B, que a su vez deriva de Qwen3.8-27B. El autor, KridgeDookie, ha aplicado la receta denominada "Qwen3.8 Philadelphia" sobre los pesos cuantizados en ternario del modelo base, extrayendo de nuevo las direcciones de rechazo especificas de Bonsai en lugar de reutilizar las de Qwen. El resultado es un modelo conversacional sin mecanismos de rechazo aprendidos, distribuido en formato GGUF.

Tecnicamente se trata de un modelo de aproximadamente 26.896 millones de parametros (26,9B) en una representacion de precision mixta: las matrices de lenguaje cuantizadas que no han sido editadas conservan su representacion ternaria rotada original, mientras que las 126 matrices intervenidas usan valores canonicos Q4_0 o Q8_0 sin rotar. El repositorio ocupa 20,9 GB e incluye dos ficheros GGUF (8,56 GB y 12,36 GB). La relevancia de esta publicacion es doble: por un lado documenta un caso de ablacion sobre pesos ternarios ya cuantizados, con validacion reproducible; por otro, advierte de una dependencia estricta de un fork concreto de llama.cpp, lo que limita su uso a entornos que puedan integrar ese runtime.

Es un modelo con 0 descargas y 0 likes en el momento de la consulta, creado el 21 de septiembre de 2026, y no dispone de datos publicados sobre longitud de contexto, idiomas soportados ni rendimiento en benchmarks estandar. La model card declara explicitamente que las afirmaciones de inteligencia y throughput del modelo original no deben extrapolarse a esta derivada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada de Qwen3.8-27B; incluye tensores auxiliares y de vision preservados) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 mil millones) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible (la validacion del autor se hizo con contexto GGUF de 4096 tokens) |
| Tipos de cuantizacion | GGUF de precision mixta: MIXED-PTQ1-Q4_0 y MIXED-PTQ1-Q8_0; matrices no editadas en ternario rotado (PTQ1) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos); el codigo de runtime incluido mantiene su licencia MIT |
| Formato de pesos | GGUF (dos ficheros); modelo base en MLX 2-bit |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Bonsai 2 27B de Prism ML, del que hereda una representacion ternaria cuantizada derivada de Qwen3.8-27B. La innovacion principal de esta publicacion no es arquitectonica sino de edicion de pesos: se aplican dos pasadas de biproyeccion que preservan la norma ("norm-preserving biprojection") sobre las capas 1 a 63, con escala 1.0, afectando a 126 matrices de salida por pasada. La extraccion de direcciones de rechazo se hizo especificamente sobre Bonsai, sin sustituir pesos ni direcciones de Qwen.

Los 842 pares de prompts utilizados se dividieron en 716 pares de extraccion y 126 pares de validacion ("held-out") disjuntos por familia, con semilla 1337. Un detalle tecnico relevante es que el reempaquetado puramente ternario de los pesos editados borraba la ablacion (124 de 126 rechazos reaparecian en el conjunto de validacion), por lo que el autor distribuye los modelos en precision mixta: las 126 matrices editadas conservan valores canonicos Q4_0 o Q8_0 sin rotar, mientras el resto de matrices de lenguaje mantiene el ternario rotado. En consecuencia, se actualizaron el orden de columnas GDN y los manifiestos de Hadamard. No se documenta en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarado de text-generation y etiqueta "conversational".
- Ejecucion de tareas sin rechazo: los dos cuantizados distribuidos alcanzan 0 rechazos sobre 126 prompts de validacion, frente a 123 del modelo original.
- Preservacion de tareas benignas: 21 de 24 tareas benignas superadas en ambos cuantizados (frente a 22 de 24 en el original).
- Pesos de vision preservados en el modelo base MLX, aunque el autor indica que el comportamiento de vision no fue reevaluado y que el proyector GGUF original no se incluye ni se revalida en este repositorio.
- Capacidades de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y mecanismos de rechazo: el modelo sirve como caso de estudio reproducible de ablacion sobre pesos ya cuantizados, con receta documentada (recipe.json), semilla fija y conjunto de validacion disjunto por familia, lo que permite analizar si la eliminacion de rechazos se generaliza o se sobreajusta a los prompts de extraccion.
- Evaluacion comparativa de tecnicas de abliteration: al mantener dos variantes (Q4_0 y Q8_0) con la misma receta, permite medir el impacto de la precision en la persistencia de la edicion; de hecho, el autor documenta que el reempaquetado ternario puro revertia la edicion en 124 de 126 casos.
- Generacion de texto en entornos de investigacion controlados: uso como modelo base para experimentos de generacion sin restricciones de rechazo, siempre que el investigador asuma la responsabilidad sobre los contenidos generados y el cumplimiento normativo aplicable.
- Pruebas de estres de runtimes de inferencia: el modelo exige el fork de llama.cpp de PrismML en la revision 9a9394a895b96003ca842a6041cb28ac49a108f7, por lo que es util para validar la compatibilidad de implementaciones que incorporan soporte ternario y de Hadamard.
- Analisis de degradacion de capacidades tras edicion de pesos: comparando los 22/24 de tareas benignas del original con los 21/24 de las variantes editadas, se puede cuantificar el coste colateral de la ablacion en tareas no relacionadas con el rechazo.
- Reproduccion de pipelines de cuantizacion de precision mixta: el repositorio documenta el tratamiento diferenciado de matrices editadas (canonicas Q4_0/Q8_0) frente a no editadas (ternario rotado), lo que resulta util como referencia para quienes trabajen con cuantizacion mixta en GGUF.
- Experimentacion con modelos de vision (limitada): los tensores de vision se preservan en MLX, aunque al no reevaluarse su comportamiento y no incluirse el proyector en este repositorio, el caso de uso queda restringido a quien recupere el proyector original desde el repositorio de PrismML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte expresamente que las cifras que acompanan al modelo son cribados heuristicos deterministas y no puntuaciones amplias de inteligencia.

| Modelo | Rechazos / 126 | Tareas benignas superadas / 24 |
|---|---:|---:|
| Bonsai original | 123 | 22 |
| Bonsai Philadelphia mixto 4-bit | 0 | 21 |
| Bonsai Philadelphia mixto 8-bit | 0 | 21 |

Condiciones del cribado de validacion: 96 tokens de salida, decodificacion voraz, penalizacion de repeticion 1.1, contexto GGUF de 4096 tokens, ejecutado sobre una A100 de 80 GB. El checkpoint intermedio final en BF16 supero su propia puerta de apertura de 126 prompts y 24 tokens con cero rechazos y 100% de aperturas utilizables. Los prompts y respuestas daninos en crudo no se incluyen en el repositorio. No se dispone de datos de throughput ni de latencia.

## Requisitos de hardware

- Fichero MIXED-PTQ1-Q4_0.gguf: 8,56 GB en disco.
- Fichero MIXED-PTQ1-Q8_0.gguf: 12,36 GB en disco.
- El autor advierte explicitamente de que el tamano de fichero no equivale al requisito de RAM del dispositivo: los pesos necesitan memoria adicional de runtime y de cache. No se proporciona una cifra de VRAM recomendada.
- GPU empleada en la validacion: A100 de 80 GB, con contexto de 4096 tokens.
- Encaje en GPU de consumo: no confirmado. No hay validacion en GPU de consumo ni en hardware Apple (ni iPhone, ni Metal en macOS, ni App Store).
- Despliegue: requiere el fork de llama.cpp de PrismML, revision validada 9a9394a895b96003ca842a6041cb28ac49a108f7. Los runtimes estandar que no incorporan el soporte ternario y de Hadamard restante son incompatibles.
- Comando de referencia del autor: `./llama.cpp/build/bin/llama-server -m bonsai/Bonsai-2-27B-Philadelphia-Class-MIXED-PTQ1-Q4_0.gguf -ngl 99 -c 4096`.
- Latencia y throughput: no disponible.
- Compatibilidad con vLLM, Ollama o TGI: no disponible; la unica ruta de despliegue documentada es el fork de llama.cpp mencionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos / 126 | Tareas benignas / 24 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Philadelphia Class, Q4_0) | 26,9B | No disponible (validado a 4096) | 0 | 21 | Apache-2.0 | GGUF, 8,56 GB |
| Este modelo (Philadelphia Class, Q8_0) | 26,9B | No disponible (validado a 4096) | 0 | 21 | Apache-2.0 | GGUF, 12,36 GB |
| PrismML Ternary-Bonsai-2-27B (original) | 26,9B | No disponible | 123 | 22 | Apache-2.0 (pesos) | GGUF y MLX 2-bit |
| Qwen3.8-27B (ancestro declarado) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

Las tres primeras filas comparten la misma base de pesos, por lo que la comparacion mide el efecto de la ablacion, no diferencias de arquitectura. No se dispone de datos de rendimiento del ancestro Qwen3.8-27B ni de otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Modelo sin rechazos: por diseno, no aplica mecanismos de negativa ante peticiones potencialmente daninas. Esto lo hace inadecuado para despliegues de cara al publico sin capas de moderacion externas.
- Sesgos conocidos: no documentados en la informacion disponible. La edicion de direcciones de rechazo puede alterar el comportamiento del modelo de formas no medidas por el cribado de 24 tareas benignas.
- Riesgo de alucinacion: no cuantificado. No se han publicado evaluaciones de fidelidad factual, y el autor desaconseja aplicar al derivado las afirmaciones de inteligencia del modelo original.
- Validacion limitada: el cribado es heuristico y determinista, con solo 126 prompts de rechazo y 24 tareas benignas; no constituye una evaluacion amplia de capacidades.
- Compatibilidad de runtime restringida: solo funciona con un fork concreto de llama.cpp en una revision especifica. Los runtimes estandar de GGUF son incompatibles, lo que complica el despliegue en produccion y la portabilidad.
- Cuantizacion mixta no estandar: las 126 matrices editadas usan valores canonicos sin rotar, mientras el resto usa ternario rotado. Cualquier herramienta que reempaquete el modelo a ternario puro revertira la ablacion, como documenta el propio autor.
- Vision no validada: los pesos de vision se preservan en MLX, pero el proyector GGUF no se incluye ni se revalida; no hay confirmacion de que la capacidad de vision funcione en este derivado.
- Sin validacion en hardware de consumo ni en ecosistema Apple: ni iPhone, ni Metal en macOS, ni App Store. El requisito real de memoria es superior al tamano de fichero.
- Sin datos de idiomas soportados, contexto maximo, tool calling ni agentes. Cualquier uso en produccion que dependa de estas capacidades requiere evaluacion propia previa.
- Licencia: los pesos son Apache-2.0, lo que permite uso comercial, pero el codigo de runtime incluido mantiene licencia MIT y la dependencia del fork de PrismML debe verificarse por separado. La responsabilidad sobre el contenido generado por un modelo sin rechazos recae en el desplegador.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado en septiembre de 2026, sin comunidad de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KridgeDookie/Ternary-Bonsai-2-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-GGUF
- Modelo base (MLX 2-bit): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp requerido: https://github.com/PrismML-Eng/llama.cpp/tree/9a9394a895b96003ca842a6041cb28ac49a108f7
- Revision del modelo base GGUF citada por el autor: commit 6ed5e12bf84b7a63069882c91dd9e9218647d17b
- Revision del modelo base MLX citada por el autor: commit 3f926b415992eaa2ae9dd7b573706494d6bbf787
- Revision validada del fork de llama.cpp: 9a9394a895b96003ca842a6041cb28ac49a108f7
- Ficheros de procedencia y resultados agregados en el repositorio: recipe.json, evaluation.json y los dos ficheros de provenance
