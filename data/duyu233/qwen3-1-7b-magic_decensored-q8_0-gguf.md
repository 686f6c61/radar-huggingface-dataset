# DUYU233/Qwen3-1.7B-Magic_decensored-Q8_0-GGUF

## Resumen

DUYU233/Qwen3-1.7B-Magic_decensored-Q8_0-GGUF es una cuantizacion en formato GGUF (tipo Q8_0) del modelo MagicalAlchemist/Qwen3-1.7B-Magic_decensored, a su vez derivado de Qwen3-1.7B de Alibaba. El autor de esta conversion es el usuario DUYU233, que la ha generado mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp. No se trata de un modelo entrenado desde cero, sino de un artefacto de distribucion: empaqueta los pesos del modelo base en un unico fichero optimizado para inferencia local con llama.cpp.

El modelo subyacente pertenece a la familia Qwen3 en su variante pequena de 1.720.574.976 parametros (aproximadamente 1,7 B). La model card del derivado lo etiqueta como heretic, uncensored, decensored y abliterated, lo que indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo para reducir las negativas del modelo a responder. La licencia declarada es Apache 2.0, heredada del Qwen3 original.

Su relevancia practica es limitada pero concreta: ofrece un checkpoint de 1,8 GB en el repositorio que puede ejecutarse en CPU o en GPUs de gama baja sin necesidad de infraestructura especializada, y sirve como punto de partida para experimentacion con modelos pequenos sin filtros. No hay datos publicados de benchmarks ni de composicion de entrenamiento especificos de este derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 1.720.574.976 (dato de safetensors del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, pero no se declara el maximo) |
| Tipos de cuantizacion | Q8_0 (esta publicacion); el repositorio base podria ofrecer otras, no confirmado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `qwen3-1.7b-magic_decensored-q8_0.gguf`); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. No se dispone en la informacion proporcionada de detalles sobre numero de capas, dimensiones ocultas, mecanismo de atencion (GQA, atencion lineal u otras variantes) ni configuracion del tokenizador para este derivado concreto.

Sobre el entrenamiento: este repositorio no aporta informacion sobre datos de preentrenamiento, numero de tokens, composicion del corpus ni fases de alineacion (RLHF/DPO). El modelo base Qwen3-1.7B fue entrenado por Alibaba, pero los detalles no se incluyen aqui. La unica transformacion documentada es la ablacion de rechazo (abliteration) aplicada en MagicalAlchemist/Qwen3-1.7B-Magic_decensored, que modifica los pesos para eliminar direcciones asociadas a respuestas de rechazo. La conversion a GGUF Q8_0 es una cuantizacion de 8 bits por bloque que preserva practicamente la calidad del modelo en punto flotante, a costa de un tamano mayor que otras cuantizaciones (Q4_K_M, Q5_K_M, etc.).

## Capacidades

- Generacion de texto autoregresiva, heredada de Qwen3-1.7B.
- Razonamiento basico y respuesta a instrucciones, con calidad limitada por el tamano de 1,7 B.
- Generacion de codigo y matematicas sencillas; sin datos especificos de rendimiento para este derivado.
- Comportamiento "uncensored"/"abliterated": menor probabilidad de rechazar peticiones que el modelo original, segun las etiquetas del autor.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este derivado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Inferencia local en CPU: al ser un GGUF Q8_0 de 1,8 GB, puede ejecutarse con llama.cpp en portatiles sin GPU dedicada, usando `llama-cli` o `llama-server` con contexto reducido (por ejemplo, 2048 tokens como en el ejemplo del autor).
- Experimentacion con modelos sin filtros: investigadores que estudian el efecto de la abliteration sobre las respuestas del modelo pueden usar este checkpoint como referencia frente al Qwen3-1.7B original.
- Prototipado rapido de asistentes conversacionales: su tamano permite iterar en local con latencia baja antes de migrar a modelos mayores.
- Pruebas de pipelines de cuantizacion: sirve como caso de estudio para comparar Q8_0 frente a otras cuantizaciones del mismo modelo base en terminos de calidad y velocidad.
- Educacion y demos: util para explicar el flujo completo de conversion a GGUF y despliegue con llama.cpp en entornos docentes.
- Generacion de texto creativo sin restricciones tematicas: el caracter decensored lo hace adecuado para escritura de ficcion con tematicas que el modelo original rechazaria, siempre que se respeten las obligaciones legales aplicables.
- Despliegue en dispositivos con poca VRAM: con Q8_0 puede cargarse en GPUs de 4-6 GB o dividirse entre CPU y GPU con `-ngl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,8-2,0 GB para los pesos Q8_0, mas overhead de contexto KV; con contexto de 2048 tokens el consumo total ronda los 2,5-3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF; el repositorio tambien declara compatibilidad con transformers y endpoints_compatible.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend (CPU vs GPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DUYU233/Qwen3-1.7B-Magic_decensored-Q8_0-GGUF | 1,72 B | no disponible | Apache 2.0 | GGUF Q8_0 | Derivado abliterated de Qwen3-1.7B |
| MagicalAlchemist/Qwen3-1.7B-Magic_decensored | 1,72 B | no disponible | Apache 2.0 | safetensors | Modelo base de esta cuantizacion |
| Qwen/Qwen3-1.7B | 1,72 B | no disponible | Apache 2.0 | safetensors | Modelo original de Alibaba, con alineacion estandar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration no elimina los sesgos del modelo original; puede aumentar la probabilidad de generar contenido danino, ofensivo o inexacto al reducir los rechazos.
- Riesgo de alucinacion elevado por el tamano reducido (1,7 B); no es adecuado para tareas que requieran alta fiabilidad factual.
- No hay informacion sobre idiomas soportados; el rendimiento en castellano no esta garantizado ni documentado.
- La longitud maxima de contexto no se declara; el ejemplo del autor usa 2048 tokens, lo que sugiere que contextos mayores no estan validados para este artefacto.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado por un modelo decensored puede infringir normativas locales o las politicas de las plataformas donde se despliegue; el usuario asume la responsabilidad legal.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad sobre la calidad de la conversion.
- No se han publicado evaluaciones de seguridad ni de sesgos para este derivado concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DUYU233/Qwen3-1.7B-Magic_decensored-Q8_0-GGUF
- Perfil del autor: https://huggingface.co/DUYU233
- Modelo base de la cuantizacion: https://huggingface.co/MagicalAlchemist/Qwen3-1.7B-Magic_decensored
- Modelo original Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
