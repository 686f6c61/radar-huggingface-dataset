# namya06/maskwall-injection-minilm

## Resumen

MaskWall injection classifier es un modelo de clasificación de texto binaria derivado de `sentence-transformers/all-MiniLM-L6-v2`, desarrollado por el usuario namya06 como componente del proyecto MaskWall, un cortafuegos (firewall) para LLM centrado en privacidad. Su función es etiquetar un prompt como benigno (0) o como intento de inyección de prompt o jailbreak (1). El mismo artefacto se emplea en dos entornos: en el servidor mediante onnxruntime como comprobación real y en el navegador mediante Transformers.js sobre WASM como aviso temprano instantáneo.

El modelo parte de una arquitectura BERT de tipo encoder con 22,7 millones de parámetros y se distribuye cuantizado dinámicamente a int8, lo que reduce el peso de 91 MB en fp32 a 23,1 MB. No es un modelo generativo: es un clasificador de secuencia que devuelve una probabilidad de ataque, y el autor insiste en que debe usarse como una capa más de defensa y no como garantía, dado que tiene tasas de error medidas y documentadas.

Su relevancia actual radica en la proliferación de ataques de inyección de prompt en aplicaciones con LLM en producción, donde los filtros deterministas basados en expresiones regulares resultan insuficientes. El modelo ofrece un equilibrio razonable entre tamaño mínimo (apto para ejecución en navegador) y detección estadística, con umbrales calibrados explícitamente (bloqueo en 0,610, aviso en 0,368) y un conjunto de métricas verificables publicadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, base: all-MiniLM-L6-v2) |
| Parametros totales | 22,7 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 510 tokens por ventana (ventana deslizante con paso 255) |
| Tipos de cuantizacion | int8 dinámica (ONNX); fp32 original |
| Idiomas soportados | inglés y hinglish (evaluados); otros idiomas no evaluados |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`, `onnx/model_quantized.onnx`), tokenizer.json |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT con 22,7 M de parámetros, derivado por fine-tuning de `sentence-transformers/all-MiniLM-L6-v2`. La cabeza de clasificación produce una etiqueta binaria (benigno/ataque) sobre la representación del token de clasificación. Para textos que exceden la ventana del modelo se aplica una estrategia de ventana deslizante de 510 tokens con paso 255, tomando la puntuación máxima entre ventanas como señal de ataque. La cuantización es dinámica a int8 sobre ONNX, lo que reduce el artefacto a 23,1 MB.

El entrenamiento se realizó sobre prompts en inglés procedentes de conjuntos públicos tras un proceso de limpieza (eliminación de duplicados exactos y casi duplicados entre fuentes, descarte de etiquetas conflictivas y correcciones manuales): `deepset/prompt-injections`, `jackhhao/jailbreak-classification`, `Lakera/gandalf_ignore_instructions`, `TrustAIRLab/in-the-wild-jailbreak-prompts`, filas benignas muestreadas de `databricks/databricks-dolly-15k`, además de 800 filas sintéticas (mitad ataques, mitad benignas emparejadas) que ocultan una instrucción dentro de texto pegado por el usuario. Se añadió una ronda de negativos duros con prompts benignos que hablan sobre ataques o system prompts (inglés y hinglish), generados con un LLM con plantillas emparejadas para ambas clases, más consultas humanas en hinglish de Hinglish-TOP. Los conjuntos `Paul/XSTest` y todos los de evaluación no se usaron en entrenamiento. No se menciona RLHF ni DPO; se trata de un fine-tuning supervisado de clasificación.

## Capacidades

- Clasificación binaria de prompts: benigno (0) frente a inyección de prompt o jailbreak (1).
- Detección de anulaciones de instrucciones, personas de jailbreak e instrucciones ocultas dentro de documentos pegados.
- Procesamiento de textos largos mediante ventana deslizante con puntuación máxima.
- Ejecución en dos entornos con los mismos pesos: servidor (onnxruntime, FastAPI) y navegador (Transformers.js sobre WASM, `dtype: "q8"`).
- Umbrales operativos calibrados: bloqueo en probabilidad 0,610 y aviso en 0,368.
- Soporte de inglés y hinglish; otros idiomas no evaluados.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento: es exclusivamente un clasificador.

## Casos de uso

- Cortafuegos de entrada en aplicaciones LLM: el modelo se sitúa delante del modelo generativo y bloquea prompts con probabilidad de ataque superior a 0,610 antes de que lleguen al LLM, reduciendo la superficie de ataque de inyecciones directas.
- Aviso temprano en el navegador: al ejecutarse con Transformers.js sobre WASM, puede puntuar el prompt en el cliente antes de enviarlo al servidor, ofreciendo retroalimentación instantánea al usuario sin coste de red.
- Protección frente a inyecciones indirectas: con una tasa medida de 53/55 ataques ocultos en documentos detectados (96,4%), es adecuado para pipelines de RAG donde el texto recuperado puede contener instrucciones maliciosas.
- Filtrado en asistentes de atención al cliente: descarta prompts que intentan redefinir el rol del asistente o extraer el system prompt, con una tasa de falsos positivos baja en prompts benignos (12/717, 1,7%).
- Moderación de entradas en aplicaciones multiusuario: como capa previa barata (23,1 MB, ejecutable en CPU) antes de invocar modelos mayores, reduciendo coste y latencia en el filtrado.
- Evaluación y monitorización de tráfico: registrar la puntuación de ataque de cada prompt permite construir métricas y alertas sobre intentos de jailbreak en producción.
- Soporte para usuarios de hinglish: con 23/24 ataques detectados y 1/104 benignos marcados en hinglish, cubre un caso poco atendido por filtros en inglés estándar.

## Benchmarks y rendimiento

Resultados medidos sobre el modelo int8 servido, en los umbrales indicados (bloqueo 0,610, aviso 0,368):

| Conjunto | Resultado |
|---|---|
| Test público, ataques detectados (recall) | 182/208 (87,5%) |
| Test público, benignos marcados (falsos positivos) | 12/717 (1,7%) |
| F1 en test | 0,905 |
| XSTest, prompts seguros marcados | 0/250 (0,0%) |
| Ataques indirectos (incrustados en documento) detectados | 53/55 (96,4%) |
| Benignos en hinglish marcados | 1/104 (1,0%) |
| Benignos "prompt-talk" escritos por LLM marcados | 2/100 (2,0%) |
| Ataques en hinglish detectados | 23/24 (95,8%) |
| Conjunto difícil manual: ataques detectados / benignos marcados | 16/21 (76,2%) / 2/28 (7,1%) |
| Documentos largos: benignos marcados / ataque oculto detectado | 14/114 (12,3%) / 37/38 (97,4%) |

No se han publicado comparaciones con otros clasificadores de inyección en la información disponible. La latencia depende de la CPU y de la longitud del texto; el autor remite a la página de Benchmarks de la aplicación desplegada para las cifras medidas en el hardware de despliegue.

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; el modelo int8 ocupa 23,1 MB de pesos y puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. En GPU, cualquier tarjeta con soporte ONNX Runtime sirve, pero no aporta ventaja significativa dado el tamaño.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; también en el navegador vía WASM.
- Opciones de despliegue: onnxruntime en backend (FastAPI, con `MASKWALL_SERVER_MODEL=minilm`), Transformers.js en navegador (`AutoModelForSequenceClassification`, `dtype: "q8"`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador de este tipo.
- Latencia y throughput: no disponibles en términos absolutos; dependen de la CPU y de la longitud del texto, con ventana deslizante para entradas largas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros clasificadores de inyección de prompt en la información proporcionada. A continuación se compara únicamente en términos estructurales con alternativas de la misma categoría, sin afirmar rendimiento relativo:

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| MaskWall injection MiniLM (este) | 22,7 M | 510 tokens por ventana | Apache-2.0 | ONNX int8, onnxruntime y Transformers.js |
| Modelo base all-MiniLM-L6-v2 | 22,7 M | 256 tokens (típico) | Apache-2.0 | safetensors, sentence-transformers |
| Clasificadores de inyección basados en BERT/DistilBERT | variable | variable | variable | generalmente PyTorch/ONNX |

No se dispone de información sobre modelos comparables específicos de detección de inyección con métricas publicadas en esta ficha; no se inventan cifras.

## Limitaciones y advertencias

- Solo inglés y hinglish; otros idiomas no están evaluados y un paso de filtrado en alemán los eliminó del entrenamiento.
- La etiqueta "ataque" cubre anulaciones de instrucciones, personas de jailbreak e instrucciones ocultas en documentos, pero no juzga si una petición es dañina.
- Sigue marcando algunos prompts benignos que citan frases de ataque o discuten system prompts; la ronda de negativos duros lo redujo pero no lo eliminó.
- Los documentos benignos largos se marcan con más frecuencia que los prompts cortos (14/114, 12,3%).
- Los conjuntos de test y difíciles son pequeños (por ejemplo, 21 ataques en el conjunto difícil), por lo que los intervalos de confianza son amplios y varias diferencias están dentro del ruido; los umbrales se ajustaron solo en validación.
- Atacantes adaptativos que conocen el modelo pueden evadirlo; los ataques parafraseados u ofuscados son una debilidad conocida.
- Algunas filas de entrenamiento fueron escritas por un LLM; se comprobó un posible atajo de estilo (mismo generador y plantillas para ambas clases) pero no puede descartarse por completo.
- La licencia Apache-2.0 permite uso comercial, pero la licencia share-alike de `databricks/dolly-15k` (CC BY-SA 3.0) aplica al texto de ese dataset y no está resuelto si alcanza al modelo entrenado sobre una muestra; el autor lo declara explícitamente.
- No es una garantía de seguridad: debe combinarse con otras capas de defensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namya06/maskwall-injection-minilm
- Repositorio del proyecto MaskWall: https://github.com/namyaa6/MaskWall
- Tabla de licencias (NOTICE.md): https://github.com/namyaa6/MaskWall/blob/main/NOTICE.md
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset jackhhao/jailbreak-classification: https://huggingface.co/datasets/jackhhao/jailbreak-classification
- Dataset Lakera/gandalf_ignore_instructions: https://huggingface.co/datasets/Lakera/gandalf_ignore_instructions
- Dataset TrustAIRLab/in-the-wild-jailbreak-prompts: https://huggingface.co/datasets/TrustAIRLab/in-the-wild-jailbreak-prompts
- Dataset databricks/databricks-dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset Paul/XSTest: https://huggingface.co/datasets/Paul/XSTest
