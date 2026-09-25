# seyhunak/aven-4b

## Resumen

Aven-4B es un adaptador LoRA publicado por el usuario seyhunak sobre el modelo base Qwen/Qwen3.5-4B, disenado como un "modelo especialista de decision" de tipo experimental. No es un modelo conversacional: su funcion es recibir un STATE (el estado o contexto de un caso), una QUESTION y un conjunto cerrado de OPTIONS, y devolver exactamente una etiqueta de opcion (por ejemplo, `B`). El caso de uso declarado son tareas de clasificacion con formato de formulario, como el matching entre facturas y ordenes de compra (invoice / PO matching) o el triaje de conciliaciones.

El modelo se construye con un ajuste fino supervisado mediante LoRA/PEFT sobre el modelo base, con una funcion de perdida "answer-only": los tokens del prompt anteriores a `ANSWER:` se enmascaran con `-100`, de modo que la entropia cruzada se concentra exclusivamente en la etiqueta de salida. El entrenamiento se realizo en hardware Apple Silicon (M3, backend MPS), con soporte de alternativas en CUDA y CPU. El repositorio pesa aproximadamente 0,3 GB, lo que corresponde al adaptador y no a los pesos completos del modelo base.

La relevancia de esta ficha es doble. Por un lado, ilustra un patron de diseno de "especialista pequeno" aplicado a tareas de clasificacion estructurada en lugar de generacion abierta. Por otro, conviene ser prudente: el conjunto de datos incluido es unicamente sintetico y de prueba (aproximadamente 120 ejemplos de entrenamiento, 30 de validacion y 60 de test), el autor advierte explicitamente de que no produce un modelo de calidad de produccion, y el modelo no registra descargas ni valoraciones en HuggingFace. La licencia del adaptador, el codigo y los datos sinteticos es MIT; los pesos del modelo base se rigen por su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/PEFT sobre un transformer decoder (modelo base Qwen/Qwen3.5-4B) |
| Parametros totales | No disponible para el adaptador; modelo base de aproximadamente 4B de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card; depende del modelo base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT para el adaptador, el codigo y los datos sinteticos; los pesos del modelo base siguen su propia licencia |
| Formato de pesos | Safetensors (adaptador LoRA; tamano de repositorio de 0,3 GB) |

Configuracion LoRA declarada: r=16, alpha=32, dropout=0,05; modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`.

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre todos los modulos de proyeccion y de la MLP del modelo base Qwen/Qwen3.5-4B (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`), con un dropout de 0,05. El modelo base es configurable en el script de entrenamiento mediante el argumento `--base-model`. No se documenta ningun cambio arquitectonico adicional, ni decodificacion especulativa, ni mecanismos de atencion alternativa: la innovacion esta en el objetivo de entrenamiento y en el formato de la tarea, no en la arquitectura.

El entrenamiento se realiza con ajuste fino supervisado mediante `scripts/train.py` (LoRA/PEFT) y una perdida restringida a la respuesta: los tokens del prompt previos a `ANSWER:` se enmascaran con `-100`, de forma que solo la etiqueta contribuye al calculo de la entropia cruzada. Los datos son registros JSONL con la estructura `state + question + options -> answer label`. El conjunto incluido es puramente sintetico y de smoke test: aproximadamente 120 ejemplos de entrenamiento, 30 de validacion y 60 de test; el autor indica que un ajuste fino con resultados utiles requiere un dataset sustancialmente mayor, con licencia adecuada o generado de forma independiente, y que `test.jsonl` nunca se usa en entrenamiento. El entrenamiento se ejecuto en un Apple Silicon M3 con MPS, con soporte de fallback a CUDA y CPU. No se mencionan fases de RLHF ni DPO.

## Capacidades

- Clasificacion de decision estructurada: dado un STATE, una QUESTION y un conjunto fijo de OPTIONS, devuelve exactamente una etiqueta de opcion (por ejemplo `B`).
- Salida de etiqueta unica, adecuada para integrarse como paso de clasificacion en un pipeline mayor.
- Tareas de tipo formulario: matching entre facturas y ordenes de compra, triaje de conciliaciones y casos similares donde la respuesta es discreta.
- Ejecucion en Apple Silicon mediante MPS, ademas de CUDA y CPU.
- Uso en investigacion y educacion sobre modelos especialistas pequenos.
- No soporta generacion abierta ni conversacion libre: el propio autor lo excluye explicitamente.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Matching entre facturas y ordenes de compra: el modelo recibe el estado con los importes y datos relevantes de ambos documentos, la pregunta de conciliacion y las opciones (`A:match`, `B:mismatch`, `C:needs_review`), y devuelve la etiqueta correspondiente para enrutar el caso.
- Triaje de conciliaciones financieras: clasificar automaticamente cada incidencia en categorias discretas previamente definidas, reduciendo la cola de revision manual a los casos marcados como `needs_review`.
- Clasificacion de formularios con respuestas cerradas: cualquier flujo administrativo donde la salida deba ser una opcion de un conjunto fijo y no texto libre.
- Preprocesado para pipelines de automatizacion documental: usar la etiqueta devuelta como entrada de un sistema posterior de reglas o de enrutado de tickets.
- Experimentacion academica sobre especialistas pequenos: servir de base reproducible para estudiar el efecto de la perdida "answer-only" y del ajuste LoRA en tareas de clasificacion.
- Entorno de desarrollo en Apple Silicon: prototipado local en un Mac con chip M3 sin necesidad de GPU dedicada, gracias al backend MPS.
- Sistema de referencia (baseline) en investigacion de robustez: el script `scripts/evaluate.py` permite comparar el modo `base` frente al modo `aven` sobre un conjunto de test retenido, con metricas de exactitud, tasa de salida invalida, exactitud por clase y matriz de confusion.
- Deteccion de casos ambiguos mediante abstencion: el autor recomienda tratar `invalid_output` como una abstencion, lo que permite derivar esos casos a revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe una metodologia de evaluacion (`scripts/evaluate.py --mode base` frente a `--mode aven` sobre `test.jsonl` retenido, con exactitud exacta, tasa de salida invalida, exactitud por clase y matriz de confusion) y afirma explicitamente que solo se reportan resultados medidos y nunca fabricados, pero no incluye cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 0,3 GB (tamano del repositorio); los requisitos reales de memoria vienen determinados por el modelo base Qwen/Qwen3.5-4B.
- Estimacion orientativa para el modelo base de ~4B de parametros: en FP16 en torno a 8 GB de VRAM; en cuantizacion de 8 bits en torno a 4 GB; en cuantizacion de 4 bits en torno a 2,5 GB. Estas cifras son calculos aritmeticos a partir del tamano del modelo, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la informacion disponible. El entrenamiento documentado se realizo en Apple Silicon M3 mediante MPS, con soporte de CUDA y CPU.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con al menos 8 GB de VRAM si se usa el modelo base en cuantizacion reducida, aunque el fabricante no lo confirma.
- Opciones de despliegue: `scripts/inference.py` incluido en el repositorio, con soporte de `--adapter`, `--state`, `--question` y `--options`. Para servir el adaptador en produccion seria necesario usar un stack compatible con PEFT (por ejemplo transformers + PEFT o vLLM con soporte de adaptadores LoRA); para llama.cpp u Ollama habria que fusionar el adaptador con el modelo base y convertirlo a GGUF, algo que no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles.

Ejemplo de invocacion documentado por el autor:

```bash
pip install -r requirements.txt
python scripts/inference.py --adapter . \
  --state "Invoice is 1200 EUR but PO is 1000 EUR." \
  --question "What is the reconciliation result?" \
  --options "A:match|B:mismatch|C:needs_review"
# -> B
```

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores especialistas de decision con salida de etiqueta unica). El unico punto de comparacion documentado por el propio autor es el modelo base sin adaptador, que se usa como referencia en la evaluacion (`--mode base` frente a `--mode aven`).

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seyhunak/aven-4b | Adaptador LoRA sobre base de ~4B | No disponible | No se publican cifras; comparacion base vs aven documentada como metodologia | MIT (adaptador, codigo y datos sinteticos) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | No disponible en la informacion proporcionada | No se publican cifras en esta ficha | La del modelo base | HuggingFace |

## Limitaciones y advertencias

- Contexto pequeno y salida restringida a una etiqueta; el autor indica que evidencias largas o contradictorias degradan la exactitud.
- El dataset incluido es sintetico y de smoke test (aproximadamente 120 ejemplos de entrenamiento); el autor advierte explicitamente de que no produce un modelo de calidad de produccion.
- Riesgo de alucinacion: el modelo puede devolver una etiqueta aunque la evidencia sea insuficiente o contradictoria; se recomienda tratar las salidas invalidas como abstencion y validar los resultados estructurados.
- Resistencia a inyeccion de prompt solo "best-effort": el STATE debe considerarse datos no confiables, ya que puede contener instrucciones maliciosas.
- Sesgos conocidos: no documentados en la informacion disponible. Al ser un modelo ajustado sobre datos sinteticos, no hay evidencia de que los sesgos esten caracterizados.
- Limitacion idiomatica: etiqueta de idioma `en` (ingles) unicamente; no se declara soporte de castellano ni de otros idiomas.
- Restricciones de licencia: el adaptador, el codigo y los datos sinteticos son MIT, por lo que el uso comercial del adaptador esta permitido; sin embargo, los pesos del modelo base se rigen por su propia licencia, que debe verificarse por separado.
- Uso responsable: el autor recomienda mantener a un humano en el bucle para decisiones financieras y prohibe el uso para asesoramiento legal o financiero y para pagos autonomos.
- Adopcion: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seyhunak/aven-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
