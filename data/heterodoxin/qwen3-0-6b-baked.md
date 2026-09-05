# heterodoxin/qwen3-0.6b-baked

## Resumen

`heterodoxin/qwen3-0.6b-baked` es un checkpoint derivado de `Qwen/Qwen3-0.6B` modificado mediante una técnica experimental de "baking": en lugar de entrenar el modelo con gradientes, el autor ha incrustado una red neuronal donante dentro de los pesos del modelo base. El resultado es un modelo que se carga con `from_pretrained` como un `Qwen3ForCausalLM` estándar, sin código personalizado ni `trust_remote_code`. La red donante ya no existe como modelo separado: su computación se ha escrito en neuronas añadidas (gate, up y down) y en el aumento de `intermediate_size` de 3072 a 4572.

El propósito declarado es demostrar que una red neuronal puede dejar de ser un modelo independiente y convertirse en parte de los pesos de otro modelo, sin necesidad de entrenamiento por retropropagación. El donante es un pequeño controlador que lee un estado de cuatro valores y recomienda una acción. Tras el "baking", el modelo puede responder en lenguaje natural sobre ese estado, a pesar de no haber sido entrenado para ello. El modelo base original permanece intacto en sus pesos y sigue comportándose con normalidad en texto ordinario. No hay benchmarks estándar publicados; la información disponible se limita a las mediciones experimentales del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer) |
| Parametros totales | 725.073.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint original `Qwen/Qwen3-0.6B`, un transformer causal de 0.6B parametros. La modificacion consiste en ampliar la dimension intermedia (`intermediate_size`) de 3072 a 4572, lo que anade neuronas extra en las capas feed-forward. En esas neuronas se ha incrustado la computacion de una red donante, un pequeño controlador que procesa un estado de cuatro valores y devuelve una accion. El ajuste se realizo en forma cerrada (closed form), sin ningun paso de gradiente. No hay loader adicional ni wrapper: el checkpoint se carga directamente con `AutoModelForCausalLM.from_pretrained` como un `Qwen3ForCausalLM`.

El donante no se invoca en tiempo de ejecucion porque ya no existe como modelo: su logica se ha materializado en los pesos anadidos. Segun el autor, la tecnica solo funciona con donantes construidos a partir de capas afines y no linealidades puntuales; donantes basados en transformers no pueden "hornearse" porque LayerNorm divide por el tamano de su propia entrada y no cumple esa condicion. El host original conserva sus pesos exactos, y las neuronas anadidas permanecen silenciosas en texto ordinario.

## Capacidades

- Generacion de texto en lenguaje natural sobre el estado del controlador donante, sin haber sido entrenado para ello.
- Recomendacion de acciones a partir de un estado de cuatro valores (funcion del donante).
- Mantenimiento de las capacidades originales del modelo base Qwen3-0.6B en texto normal: el autor mide que el host sigue respondiendo "Paris" a la pregunta clasica, con coseno de logits 1.0000.
- Carga estandar mediante `from_pretrained`, sin codigo custom ni `trust_remote_code`.
- Las neuronas anadidas son silenciosas en texto ordinario, por lo que el comportamiento del modelo base no se ve alterado en ese contexto.
- No se especifican capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Investigacion en interpretabilidad: permite estudiar como una red neuronal externa puede ser inyectada en los pesos de un modelo mayor, analizando que neuronas absorben que funciones.
- Demostracion de compresion de modelos: un controlador pequeno puede integrarse en un modelo grande sin entrenamiento, reduciendo la necesidad de mantener dos modelos separados.
- Aprendizaje de tareas especificas sin retropropagacion: la tecnica de ajuste en forma cerrada ofrece una alternativa para incorporar comportamientos concretos en un checkpoint existente.
- Experimentacion en sistemas de decision simples: el donante lee un estado de cuatro valores y recomienda una accion; podria usarse como prototipo de controlador en entornos simulados.
- Educacion en modificacion de pesos: sirve como ejemplo de que se puede alterar un modelo de HuggingFace sin tocar el codigo de carga ni el pipeline de entrenamiento.
- Pruebas de robustez del modelo base: al mantener el host intacto, permite comprobar que las neuronas anadidas no interfieren con la generacion normal de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona mediciones experimentales sobre el comportamiento del donante incrustado:

| Metrica | Resultado |
|---|---|
| Acuerdo con el donante (held out) | 107 de 120 |
| Balanced accuracy | 0.87 (frente a 0.33 de azar) |
| Respuestas distintas generadas | 5 |
| Etapas del donante recuperadas | exactas hasta 1e-14 |
| Reajuste de la no linealidad sobre knots silu | R2 0.998 |
| Comportamiento del host en texto ordinario | responde "Paris" con coseno de logits 1.0000 |

## Requisitos de hardware

- No se han publicado requisitos de hardware especificos para este modelo.
- El tamano del repositorio es de 1.5 GB, lo que sugiere pesos en fp16 o bf16. Para inferencia, la VRAM necesaria para los pesos seria aproximadamente 1.5 GB, mas el overhead de activaciones y cache KV.
- Una GPU de consumo con 4-8 GB de VRAM (por ejemplo, RTX 3050, RTX 4060) seria suficiente para ejecutar el modelo en precision media.
- No se indican opciones de despliegue especificas. Al ser un checkpoint estandar de Qwen3, podria cargarse con vLLM, llama.cpp, Ollama o TGI, aunque no hay confirmacion de compatibilidad en la documentacion del autor.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3-0.6B (base) | ~600M | no disponible | Apache-2.0 | HuggingFace | Modelo original sin modificaciones |
| heterodoxin/qwen3-0.6b-baked | 725.073.920 | no disponible | Apache-2.0 | HuggingFace | Mismo host con donante incrustado; mantiene el comportamiento base |
| Otros modelos de tamano similar con tecnicas de "baking" | no disponible | no disponible | no disponible | no disponible | No se han encontrado alternativas comparables en la busqueda |

## Limitaciones y advertencias

- El autor declara explicitamente que no tiene un uso previsto ("Intended use: None"); es una demostracion tecnica, no un modelo para produccion.
- No hay benchmarks estandar publicados, por lo que el rendimiento en tareas convencionales (razonamiento, codigo, matematicas) no ha sido evaluado.
- El donante debe caber en una unica token de entrada; no admite donantes complejos como transformadores, segun la model card.
- La capacidad del donante se limita a leer un estado de cuatro valores y recomendar una accion; no es un modelo de proposito general.
- Al estar basado en Qwen3-0.6B, hereda las limitaciones y sesgos del modelo base, aunque no se detallan en la informacion proporcionada.
- Riesgo de alucinacion presente en el modelo base, sin mitigaciones adicionales descritas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se ofrece como experimento sin garantias de robustez ni soporte.
- No se especifica la longitud de contexto real de esta variante; se recomienda verificar el comportamiento del host antes de usarlo en aplicaciones con contexto largo.

## Enlaces

- HuggingFace: https://huggingface.co/heterodoxin/qwen3-0.6b-baked
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
