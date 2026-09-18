# huihui-ai/Huihui-MiniCPM5-2B-abliterated

## Resumen

Huihui-MiniCPM5-2B-abliterated es una version modificada del modelo openbmb/MiniCPM5-2B, publicada por el usuario huihui-ai. Se trata de un modelo de generacion de texto de tipo transformer decoder-only con 2.516.756.480 parametros (aproximadamente 2,5 mil millones), pesos en formato safetensors y licencia Apache-2.0. El cambio principal respecto al modelo base no es un reentrenamiento, sino una ablacion de direcciones de rechazo (abliteration) aplicada sobre las capas 6 a 37 y la capa 40 (indexacion base 0), con el objetivo de eliminar la tendencia del modelo a rechazar determinadas peticiones.

El modelo hereda de la familia MiniCPM5 las etiquetas de contexto largo, tool calling, ejecucion en dispositivo (on-device) y edge-ai, y esta orientado a generacion de texto conversacional en ingles y chino. El propio autor lo describe de forma explicita como una implementacion "cruda" y de prueba de concepto, y advierte que, al ser un modelo tan pequeno, el rendimiento resultante de la ablacion es todavia insuficiente.

Su relevancia actual es doble: por un lado sirve como experimento metodologico sobre que capas influyen mas en el comportamiento de rechazo de un LLM; por otro, ofrece una variante de 2,5 B parametros sin filtros de seguridad que puede ejecutarse en hardware de consumo. Es importante subrayar que no hay datos de benchmarks publicados en la informacion disponible y que los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta "llama" en los metadatos; familia MiniCPM5) |
| Parametros totales | 2.516.756.480 (~2,5 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo se etiqueta como "long-context") |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors; no se documentan variantes GGUF, AWQ o GPTQ oficiales) |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Precisión de carga documentada | bfloat16 (por defecto), float16, float32 |
| Modelo base | openbmb/MiniCPM5-2B |
| Capas ablacionadas | 6-37 y 40 (indexacion base 0) |
| Tamano del repositorio | 5,0 GB |
| Descargas / likes | 464 / 11 |
| Fecha de creacion / actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

El modelo parte de openbmb/MiniCPM5-2B y conserva su arquitectura de transformer decoder-only, segun se deduce de las etiquetas de metadatos ("llama", "minicpm5") y del uso de AutoModelForCausalLM en el script de ejemplo. No se ha realizado un entrenamiento adicional ni un ajuste por RLHF o DPO documentado en la informacion disponible: la unica intervencion declarada es la ablacion de direcciones de rechazo sobre las capas 6-37 y 40 mediante una implementacion propia del autor, sin usar TransformerLens.

La innovacion tecnica que declara el autor es metodologica mas que arquitectonica: se trata de una prueba para determinar que capas tienen mayor impacto en el comportamiento de ablacion, aplicando la tecnica descrita en el repositorio remove-refusals-with-transformers. El autor no publica detalle sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion del modelo base, por lo que esos datos se consideran no disponibles.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Etiquetado como "long-context", orientado a ventanas de contexto amplias (longitud concreta no disponible).
- Soporte declarado de tool calling / function calling mediante la etiqueta del repositorio.
- Modo de razonamiento con tokens de "pensamiento": el script de uso incluido en la model card gestiona la etiqueta `</think>` y un parametro `enable_thinking`, lo que indica soporte de un modo thinking.
- Orientacion a despliegue en dispositivo y edge (on-device, edge-ai), dado su tamano de 2,5 B parametros.
- Comportamiento sin rechazos (abliterated/uncensored): el modelo responde a peticiones que el modelo base tenderia a declinar.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.

## Casos de uso

- Experimentacion sobre seguridad y alineacion: permite estudiar que capas concretas influyen en la generacion de rechazos, comparando la salida con el modelo base openbmb/MiniCPM5-2B en el mismo prompt.
- Investigacion en tecnicas de ablacion: sirve como referencia reproducible del metodo remove-refusals-with-transformers aplicado a un modelo de 2,5 B, util para validar metodologias antes de escalar a modelos mayores.
- Asistentes conversacionales en dispositivo: al caber en GPU de consumo y en hardware edge, puede integrarse en aplicaciones de chat local en ingles o chino sin enviar datos a la nube.
- Redaccion creativa sin restricciones tematicas: util en entornos controlados de escritura de ficcion donde los filtros de seguridad del modelo base interfieren con el flujo creativo.
- Pruebas de robustez de pipelines de moderacion: al ser un modelo abliterado, puede emplearse como generador adversario para evaluar clasificadores de contenido y sistemas de filtrado.
- Prototipado rapido de agentes con tool calling: su soporte declarado de function calling permite construir demos de agentes ligeros que quepan en memoria reducida, aunque el rendimiento del modelo pequeno limita la complejidad de las tareas.
- Evaluacion comparativa de tecnicas de cuantizacion: con 2,5 B parametros, es un candidato comodo para medir el impacto de cuantizaciones (int8, int4) sobre la calidad en un entorno de recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que "this model is too small, the performance is still insufficient", sin aportar metricas concretas (MMLU, HumanEval, GSM8K u otras). Los resultados de busqueda web facilitados no contienen informacion util sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos calculados a partir de 2,5 B parametros, no publicados por el autor):
  - bf16/fp16: en torno a 5 GB de pesos mas overhead de activaciones y cache KV.
  - int8: en torno a 2,5-3 GB.
  - int4: en torno a 1,5-2 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para bf16 (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090). Para int4 son suficientes GPU de 4 GB. En centro de datos, A100 o H100 funcionan sin problema, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas de VRAM; tambien puede ejecutarse total o parcialmente en CPU.
- Opciones de despliegue: transformers (metodo documentado por el autor, con `trust_remote_code=True`), text-generation-inference (el repositorio declara compatibilidad con TGI), vLLM (la arquitectura tipo llama es compatible en principio, no verificado en la informacion disponible). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no documentada por el autor.
- Latencia y throughput estimados: no disponibles. El script de ejemplo incluye utilidades propias para medir latencia del primer token y tokens por segundo, pero no se aportan valores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Huihui-MiniCPM5-2B-abliterated | ~2,5 B | no disponible (etiquetado long-context) | Apache-2.0 | Version abliterada; rendimiento declarado insuficiente por el autor |
| openbmb/MiniCPM5-2B | ~2,5 B | no disponible | no disponible en la informacion proporcionada | Modelo base, con filtros de rechazo intactos |
| Otros modelos abliterados de huihui-ai (familia) | variable | variable | variable | Alternativas del mismo autor con el mismo metodo de ablacion |
| Modelos densos de ~2-3 B de otras familias | ~2-3 B | variable | variable | No se dispone de datos de rendimiento comparables para este modelo, por lo que no se puede establecer una comparacion cuantitativa |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa fiable con alternativas de la misma categoria. Cualquier comparacion de rendimiento seria especulativa y por tanto no se incluye.

## Limitaciones y advertencias

- Modelo abliterado: se han eliminado los rechazos, por lo que puede generar contenido danino, ofensivo o ilegal. No debe desplegarse en produccion orientada al publico sin capas externas de moderacion.
- Rendimiento insuficiente reconocido por el autor: es un modelo de 2,5 B y el propio autor lo califica de prueba de concepto "cruda".
- Riesgo elevado de alucinacion: por tamano y por el proceso de ablacion, la fiabilidad factual es limitada.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no disponible de forma explicita; la etiqueta "long-context" no va acompanada de una cifra verificable.
- Sin benchmarks publicados: no es posible estimar su calidad frente a alternativas.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado.
- Ausencia de documentacion de cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que complica despliegues optimizados.
- Metodo de ablacion en fase experimental: el propio autor senala que busca "probar" que capas afectan mas, por lo que el resultado no es estable ni definitivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huihui-ai/Huihui-MiniCPM5-2B-abliterated
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio del metodo de ablacion: https://github.com/Sumandora/remove-refusals-with-transformers
