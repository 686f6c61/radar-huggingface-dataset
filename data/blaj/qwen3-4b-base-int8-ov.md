# blaj/Qwen3-4B-Base-int8-ov

## Resumen

blaj/Qwen3-4B-Base-int8-ov es una conversión de terceros del checkpoint preentrenado Qwen/Qwen3-4B-Base al formato OpenVINO IR (Intermediate Representation) con pesos comprimidos a INT8. El autor, el usuario blaj, no es el equipo de Qwen ni el equipo oficial de OpenVINO: se trata de una exportación independiente publicada bajo licencia Apache-2.0. El valor diferencial frente a otras conversiones OpenVINO es que incluye metadatos de localización de estados ocultos (`hidden_states_decoder_layers`) para las 36 capas, lo que permite usarla como modelo objetivo en decodificación especulativa con un borrador DFlash.

El modelo subyacente es Qwen3-4B-Base, un transformer causal de aproximadamente 4.000 millones de parámetros con 36 capas, dimensión oculta de 2.560 y vocabulario de 151.936 tokens. Se trata del checkpoint base (preentrenado, sin ajuste por instrucciones), por lo que no sigue diálogos ni plantillas de chat: hay que usarlo con prompts de tipo completado. Según la documentación del modelo original, fue preentrenado sobre 36 billones de tokens en 119 idiomas y soporta una ventana de contexto de 32.768 tokens.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo práctico de despliegue de un LLM de 4B en hardware Intel integrado (CPU, iGPU Arc, NPU) mediante OpenVINO Model Server, con un rendimiento medido de 35,5 tokens por segundo en un Core Ultra 7 258V. Por otro, documenta un resultado negativo útil: emparejar este objetivo con el borrador DFlash reduce el rendimiento a 24,9 tok/s (0,70x), es decir, la decodificación especulativa no compensa cuando el objetivo ya es barato de ejecutar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only causal, denso) |
| Parametros totales | ~4.000 millones (modelo base Qwen3-4B-Base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens segun la documentacion del modelo base; la model card de esta conversion no lo declara |
| Tipos de cuantizacion | INT8 asimetrico por canal (INT8_ASYM, ratio=1.0 via NNCF); existe un hermano en INT4 (blaj/Qwen3-4B-Base-int4-ov) |
| Idiomas soportados | No declarados en la model card. El modelo base Qwen3-4B-Base se documenta como multilingue en 119 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (openvino_model.xml + .bin), grafo stateful; no hay safetensors ni GGUF |
| Capas | 36 |
| Dimension oculta | 2.560 |
| Vocabulario | 151.936 tokens |
| Tamano del repositorio | 4,0 GB (3,8 GB segun la model card) |
| Metadatos DFlash | 36 capas anotadas; el borrador Qwen3-4B lee las capas 1, 9, 17, 25 y 33 |
| Libreria | openvino |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint Qwen3-4B-Base original: un transformer decoder-only denso de 36 capas con dimensión oculta 2.560 y vocabulario de 151.936 tokens. No hay mezcla de expertos ni componentes de espacio de estados. Esta publicación no reentrena ni afina nada: es una conversión pura de pesos más compresión. El pipeline de conversión declarado es de dos etapas: primero `optimum-cli export openvino --task text-generation-with-past --weight-format fp16`, y después `nncf.compress_weights(..., INT8_ASYM, ratio=1.0)` para comprimir todos los pesos a INT8 asimétrico por canal. El resultado es un grafo OpenVINO stateful, lo que evita tener que gestionar el estado del KV-cache manualmente en el runtime.

La innovación técnica concreta de esta exportación es la inclusión de metadatos localizadores de estados ocultos (`hidden_states_decoder_layers`) que cubren las 36 capas. Un borrador DFlash consume los estados ocultos intermedios del modelo objetivo para proponer tokens; si esa metadata no está presente, el runtime OpenVINO cae silenciosamente a decodificación normal sin borrador. El autor verificó que los localizadores siguen presentes tras la compresión INT8 y que la salida es idéntica byte a byte con y sin borrador. Los detalles de entrenamiento del modelo base (36 billones de tokens, 119 idiomas, fases de ajuste posteriores del checkpoint instruct) corresponden a Qwen y no se reproducen ni se modifican aquí; sobre el checkpoint base en sí no se documenta en esta ficha ningún proceso de RLHF o DPO, ya que es un modelo preentrenado sin alineación.

## Capacidades

- Generación de texto autoregresiva en modo completado: al ser un checkpoint base, predice continuaciones a partir de un prefijo, sin plantilla de chat.
- Modelado de lenguaje y representaciones internas: útil como backbone para fine-tuning, destilación o extracción de estados ocultos por capa.
- Capacidades multilingües heredadas del modelo base, documentado por Qwen para 119 idiomas (no verificadas de forma independiente en esta conversión).
- Razonamiento, código y matemáticas: el modelo base Qwen3-4B se describe como competente en estas áreas, pero esta conversión no publica evaluaciones propias que lo confirmen.
- Decodificación especulativa como modelo objetivo: soporta un borrador DFlash gracias a los localizadores de estados ocultos de las 36 capas, con salida idéntica a la decodificación greedy.
- Ejecución en dispositivo Intel: grafo stateful compatible con OpenVINO Runtime y OpenVINO Model Server sobre CPU, iGPU Arc y NPU.
- No soporta tool calling ni function calling: no hay formato de herramientas definido en el checkpoint base.
- No soporta modo "thinking", visión ni audio.
- No soporta agentes ni razonamiento multi-paso guiado por instrucciones; cualquier comportamiento de ese tipo requiere ajuste posterior.

## Casos de uso

- Fine-tuning sobre hardware Intel: partir de este IR en INT8 o del checkpoint base en FP16 para ajustar una tarea concreta (clasificación, extracción, generación de dominio) en un portátil con Core Ultra, evitando depender de GPUs dedicadas. Es adecuado porque el formato OpenVINO y la compresión INT8 reducen el peso del modelo a 3,8 GB y lo hacen ejecutable en iGPU.
- Despliegue en el borde con OpenVINO Model Server: servir un endpoint de generación de texto mediante la configuración `ovms_config.json` propuesta por el autor, con `target_device: GPU`, `nireq: 8` y `PERFORMANCE_HINT: THROUGHPUT`. Encaja en escenarios de fábrica, retail o sanidad donde no se puede enviar datos a la nube.
- Generación de continuaciones de texto y autocompletado interno: al ser un modelo base, se usa con prompts de completado para redactar borradores, resúmenes o reescrituras dentro de una herramienta interna, sin necesidad de alineación conversacional.
- Investigación en decodificación especulativa: este repositorio es material directo para reproducir el experimento de objetivo + borrador DFlash y medir el punto de cruce entre ambos en distintos tamaños de modelo (4B, 8B, 9B), ya que el autor publica los datos completos en el repositorio del borrador.
- Extracción de estados ocultos para investigación en interpretabilidad o probing: las 36 capas están anotadas y son accesibles a través de la metadata del grafo, lo que facilita alimentar clasificadores lineales o análisis de representaciones.
- Base para destilación y generación de datos sintéticos: un modelo de 4B en INT8 que corre a 35,5 tok/s en una iGPU es una opción razonable para generar corpus sintéticos a bajo coste energético antes de filtrar con un modelo mayor.
- Prototipado offline en portátiles sin GPU dedicada: con 30 GB de RAM y una iGPU Arc, un desarrollador puede validar un pipeline completo de inferencia OpenVINO antes de trasladarlo a servidores con aceleradores más potentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible para esta conversión concreta. El único dato medido es el de throughput de decodificación especulativa.

Hardware de la medición: Intel Core Ultra 7 258V con iGPU Arc 130V/140V, 30 GB de RAM, OpenVINO Model Server 2026.4.0 sobre GPU, decodificación greedy, máximo de 128 tokens nuevos, media de 4 ejecuciones.

| Configuracion | tok/s | vs baseline |
|---|---|---|
| Este objetivo, sin borrador | 35,5 | 1,00x |
| Este objetivo + borrador DFlash | 24,9 | 0,70x |

Conclusión del autor: la salida es idéntica byte a byte en ambos casos, por lo que el emparejamiento funciona correctamente, pero la decodificación especulativa no compensa en este hardware porque el objetivo ya es muy barato de ejecutar. El repositorio del borrador contiene los datos de punto de cruce para objetivos de 4B, 8B y 9B.

## Requisitos de hardware

- Peso de los pesos: 3,8 GB en disco (4,0 GB de repositorio). En memoria, la VRAM o RAM necesaria para inferencia ronda los 4-5 GB contando pesos, KV-cache y buffers del runtime.
- Cabe en iGPU integrada: el propio autor lo mide en una Arc 130V/140V integrada en un Core Ultra 7 258V con 30 GB de RAM.
- Cabe en GPUs de consumo: cualquier GPU con 6 GB o más de VRAM puede alojar el modelo, incluida una RTX 3060 de 6 GB o superior. En GPU Arc discretas (A770, B580) el soporte de OpenVINO es nativo.
- CPU: ejecutable en CPU x86 mediante OpenVINO Runtime, con rendimiento inferior al de iGPU o GPU dedicada; no se publican cifras de tok/s en CPU.
- NPU: OpenVINO soporta aceleración en NPU Intel (Meteor Lake, Lunar Lake y posteriores), aunque la model card no aporta mediciones en ese dispositivo.
- Opciones de despliegue: OpenVINO Model Server (OVMS) con la configuración de ejemplo del autor; OpenVINO Runtime para Python; OpenVINO GenAI; `optimum-intel` para cargar el modelo desde transformers 5.5.0. No hay soporte de llama.cpp, Ollama ni vLLM, ya que no se publican pesos GGUF ni safetensors.
- Requisito operativo de OVMS: el directorio del modelo debe contener además un fichero `graph.pbtxt`.
- Latencia y throughput: 35,5 tok/s de media en el hardware citado con decodificación greedy y 128 tokens nuevos. El throughput real depende de los kernels del runtime, el hardware y la distribución de los prompts, tal y como advierte el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| blaj/Qwen3-4B-Base-int8-ov (este) | ~4B | 32.768 tokens (segun modelo base) | OpenVINO IR, INT8 asimetrico | Apache-2.0 | Checkpoint base; metadata DFlash para las 36 capas; 35,5 tok/s en Core Ultra 7 258V |
| OpenVINO/Qwen3-4B-int8-ov | ~4B | no disponible en la informacion recogida | OpenVINO IR, INT8_ASYM via NNCF | Apache-2.0 | Conversion oficial del checkpoint instruct Qwen3-4B; sigue instrucciones de chat |
| Qwen/Qwen3-4B-Base (original) | ~4B | 32.768 tokens | safetensors, FP16/BF16 | Apache-2.0 | Checkpoint base sin cuantizar; requiere GPU con mas VRAM o cuantizacion propia |
| blaj/Qwen3-4B-Base-int4-ov | ~4B | no disponible | OpenVINO IR, INT4 | Apache-2.0 | Construccion hermana con menor huella de memoria a costa de mas perdida de precision |

La diferencia clave frente a la conversión oficial de OpenVINO es que aquella parte del checkpoint instruct (Qwen3-4B) y por tanto responde a instrucciones, mientras que esta parte del checkpoint base y solo hace completado. Si el objetivo es un asistente conversacional, la conversión oficial es la elección correcta; si el objetivo es fine-tuning, extracción de estados ocultos o servir como objetivo de decodificación especulativa, esta exportación aporta la metadata que la oficial no incluye.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no sigue prompts de chat ni responde a formatos de conversación. Usarlo como asistente produce continuaciones del texto de entrada, no respuestas.
- No dispone de plantilla de chat ni de soporte de herramientas; cualquier aplicación conversacional o de agentes requiere fine-tuning previo.
- Riesgo elevado de alucinación y de contenido no alineado: al no haber pasado por RLHF o DPO, no hay filtrado de seguridad ni de sesgos incorporado.
- No se han publicado evaluaciones de calidad ni de sesgo para esta conversión, por lo que no hay datos objetivos sobre su comportamiento en producción.
- Los localizadores de estados ocultos se resuelven contra este grafo exacto. Cualquier conversión, recompresión o cambio de versión de OpenVINO puede invalidarlos y provocar una caída silenciosa a decodificación sin borrador.
- El emparejamiento con el borrador DFlash degrada el rendimiento a 0,70x en el hardware medido. Solo tiene sentido si el punto de cruce se alcanza con objetivos mayores o hardware más limitado.
- El rendimiento en tokens por segundo depende fuertemente de los kernels del runtime, la versión de OpenVINO, el hardware y la distribución de los prompts; extrapolar las cifras publicadas a otros entornos es arriesgado.
- Es una publicación de terceros con 0 descargas y 0 likes en el momento de redactar esta ficha. La procedencia de los pesos no está auditada por Qwen ni por el equipo oficial de OpenVINO; conviene verificar el hash de los ficheros antes de usarlos en producción.
- La model card no declara los idiomas soportados por la conversión. Los 119 idiomas corresponden a la documentación del modelo base y no se han verificado sobre esta exportación.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero no exime de cumplir la normativa aplicable en materia de contenido generado y protección de datos.
- La longitud de contexto de 32.768 tokens corresponde al modelo base; la model card de esta conversión no la confirma, y la compresión INT8 puede afectar al comportamiento en contextos muy largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/Qwen3-4B-Base-int8-ov
- Construccion hermana en INT4: https://huggingface.co/blaj/Qwen3-4B-Base-int4-ov
- Repositorio de borradores DFlash (datos de punto de cruce 4B / 8B / 9B): https://huggingface.co/blaj/Qwen3-DFlash-drafters-ov
- Modelo base original: https://huggingface.co/Qwen/Qwen3-4B-Base
- Variante instruct de Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Conversion oficial de OpenVINO del modelo instruct: https://huggingface.co/OpenVINO/Qwen3-4B-int8-ov
- Ficha de Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Repositorio de scripts de exportacion de Qualcomm para Qwen3-4B: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b/README.md
- Referencia divulgativa sobre Qwen3-4B-Base (32k de contexto, 36 billones de tokens, 119 idiomas): https://dev.co/ai/llms/qwen3-4b-base
