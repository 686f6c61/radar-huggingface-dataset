# joshycodes/qwen3-4b-sorrel-selfloop-g11-selfjudge-chat

## Resumen

qwen3-4b-sorrel-selfloop-g11-selfjudge-chat es un artefacto de investigacion derivado de Qwen3-4B, publicado por el usuario joshycodes en Hugging Face. Se trata de un ajuste conversacional (etapa "chat") aplicado sobre el checkpoint intermedio joshycodes/qwen3-4b-sorrel-selfloop-g11-midtrain, que a su vez procede de un proceso de preentrenamiento continuado etiquetado como "flourishing-training". El modelo forma parte de un proyecto de investigacion privado (Anthropic Fellows) sobre entrenamiento de caracter enmarcado en "flourishing", segun la propia model card.

El modelo tiene 4.022.468.096 parametros almacenados en safetensors, con un tamano de repositorio de 25,7 GB. La etapa de chat se ejecuto sobre 2 GPU NVIDIA H200 en RunPod, consumiendo 2.309.445 tokens de un dataset local (`self-5k.jsonl`, configuracion `self-5k`) durante una sola epoca, con una perdida que descendio de 0,5552 a 0,4982. La ventana de secuencia empleada en el entrenamiento fue de 4096 tokens.

Su relevancia es limitada y estrictamente experimental: se publica como artefacto de investigacion interno, sin resultados de benchmarks, sin idiomas declarados, con licencia "internal-research" y sin descargas ni interacciones registradas en el momento de la consulta. No es un modelo pensado para produccion ni para redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (derivado de Qwen3-4B; la model card no detalla la arquitectura) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica / no disponible: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible como especificacion oficial; la secuencia usada en el entrenamiento de chat fue de 4096 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo declara pesos en safetensors |
| Idiomas soportados | No disponibles |
| Licencia | other / internal-research ("Private research artifact — do not redistribute") |
| Formato de pesos | safetensors |
| Tamano del repositorio | 25,7 GB |
| Modelo base | joshycodes/qwen3-4b-sorrel-selfloop-g11-midtrain (revision e967654e4415) |
| Etapa | chat |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |
| Fecha de actualizacion | 2026-09-16 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de la herencia del modelo base Qwen3-4B y de las etiquetas `qwen3` y `continued-pretraining`. No se especifica si se trata de un transformer denso, un MoE o un modelo hibrido, ni se detallan innovaciones de atencion, decodificacion especulativa u otras optimizaciones. Lo unico verificable es el numero de parametros (4.022.468.096) y el formato de pesos (safetensors).

El entrenamiento documentado corresponde unicamente a la etapa de chat sobre el checkpoint intermedio. Se ejecuto con el run `qwen3-4b-sorrel-selfloop-g11-midtrain-local-self-5k.jsonl-c-0916-1500` en 2 GPU NVIDIA H200 (RunPod, fellows worker), usando el commit del lanzador `a0afb77669ae` del repositorio `flourishing-training` y semilla 20260821. El dataset fue `local:self-5k.jsonl` (configuracion `self-5k`) en la revision `main`. Los hiperparametros fueron: learning rate 1e-5, longitud de secuencia 4096, micro-batch 4, acumulacion de gradiente 16, 1,0 epocas. Se procesaron 2.309.445 tokens y la perdida paso de 0,5552 a 0,4982. El nombre del modelo y de las etiquetas sugiere un bucle de autoentrenamiento con autoevaluacion ("selfloop", "selfjudge"), pero la model card no documenta el procedimiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: el modelo se presenta como un checkpoint de etapa "chat", por lo que su funcion declarada es la conversacion multi-turno.
- Razonamiento y codigo: no hay documentacion especifica; al derivar de Qwen3-4B cabe esperar capacidades heredadas, pero no estan verificadas ni declaradas por el autor.
- Tool calling / function calling: no disponible; no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; el nombre del run ("selfloop", "selfjudge") apunta a experimentos de autoentrenamiento, no a capacidades de agente documentadas.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Evaluacion integrada: el autor indica un comando de evaluacion (`uv run eval.py --model ... --eval all`) sobre el repositorio `flourishing-training`, sin publicar los resultados.

## Casos de uso

- Investigacion sobre entrenamiento de caracter: el modelo se puede usar como sujeto de estudio para analizar como un ajuste corto (2,3 M de tokens, 1 epoca) sobre un checkpoint intermedio modifica el estilo conversacional, comparando sus salidas con las del checkpoint `midtrain` de partida.
- Estudio de bucles de autoentrenamiento y autoevaluacion: dado el nombre "selfloop-selfjudge", es adecuado para reproducir y auditar el pipeline que genero `self-5k.jsonl` y medir si la autoevaluacion introduce deriva o colapso de diversidad.
- Evaluacion de perdida frente a calidad: con una perdida final de 0,4982 en la etapa de chat, sirve como caso de estudio para comprobar si una perdida baja se corresponde con respuestas utiles y no con sobreajuste al dataset sintetico.
- Pruebas de alineacion y red-teaming en laboratorio: al ser un artefacto de investigacion con licencia interna, es apropiado para experimentos controlados de sesgo, seguridad y adherencia a instrucciones, no para despliegue publico.
- Generacion de datos sinteticos para experimentos: se puede emplear para producir conversaciones de entrenamiento que alimenten iteraciones posteriores del mismo pipeline, siempre dentro del entorno de investigacion cerrado.
- Comparativas de eficiencia de ajuste: con hiperparametros conocidos (lr 1e-5, seq_len 4096, micro-batch 4, grad_accum 16), permite reproducir el coste en GPU y comparar configuraciones alternativas.
- Prototipado conversacional interno: para demostraciones de laboratorio con contexto de hasta 4096 tokens, entendiendo que no hay garantias de calidad, soporte ni documentacion de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida de entrenamiento de la etapa de chat (0,5552 a 0,4982) y el volumen de tokens vistos (2.309.445), que no son metricas comparables con MMLU, HumanEval, GSM8K ni similares.

| Metrica reportada | Valor |
|---|---|
| Perdida inicial (etapa chat) | 0,5552 |
| Perdida final (etapa chat) | 0,4982 |
| Tokens vistos | 2.309.445 |
| Epocas | 1,0 |
| MMLU / HumanEval / GSM8K / otros | No disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 4.022.468.096 parametros, no publicada por el autor): en bf16/fp16, aproximadamente 8 GB solo de pesos, mas cache KV; en fp32, aproximadamente 16 GB; en cuantizacion de 8 bits, en torno a 4-5 GB; en 4 bits, en torno a 3 GB.
- El repositorio ocupa 25,7 GB, un tamano coherente con pesos en fp32 o con varios ficheros de pesos; conviene verificar el indice de safetensors antes de planificar el despliegue.
- GPU recomendadas por el autor para el entrenamiento: 2 x NVIDIA H200. Para inferencia no se indica ninguna GPU concreta.
- GPU de consumo: por tamano, un modelo de 4B en bf16 deberia caber en GPU de consumo con 12-16 GB o mas (por ejemplo, RTX 4080/4090 o superiores) y, cuantizado a 4-8 bits, en GPUs con 8 GB. Esta estimacion es orientativa, no un dato verificado del autor.
- Opciones de despliegue: al solo distribuirse safetensors, el uso directo seria mediante `transformers` y, potencialmente, servidores compatibles (vLLM, TGI). No se declara soporte de GGUF ni Ollama; no hay confirmacion de compatibilidad con llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| qwen3-4b-sorrel-selfloop-g11-selfjudge-chat | 4,02 B | 4096 tokens en entrenamiento (contexto nativo no declarado) | other / internal-research | Hugging Face, 0 descargas, sin redistribucion | No disponible |
| Qwen3-4B (modelo base de la familia) | ~4 B | No declarado en la informacion proporcionada | No declarada en la informacion proporcionada | Publico (referencia de la familia Qwen3) | No disponible en esta ficha |
| joshycodes/qwen3-4b-sorrel-selfloop-g11-midtrain (checkpoint previo) | No disponible | No disponible | No disponible | Hugging Face, mismo autor | No disponible |
| Alternativas de ~3-4 B de otros fabricantes (Llama 3.2 3B, Phi-4-mini, etc.) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia restringida: la licencia declarada es "other" con nombre "internal-research" y la model card indica explicitamente "Private research artifact — do not redistribute". No esta permitido el uso comercial ni la redistribucion segun esos terminos.
- Sin documentacion de idiomas: no se declara ningun idioma soportado, por lo que el comportamiento multilingue es desconocido.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad, por lo que no hay garantias sobre la veracidad de las respuestas.
- Sesgos: no se documenta ningun analisis de sesgos ni de seguridad. El dataset `self-5k.jsonl` es de origen local y no se describe su composicion, lo que impide evaluar sesgos de seleccion.
- Sobreajuste potencial: un ajuste de 1 epoca sobre 2,3 M de tokens de datos autogenerados puede producir estilos de respuesta muy ajustados al formato del dataset y degradar la generalizacion.
- Contexto limitado en entrenamiento: la secuencia usada fue de 4096 tokens; no se declara una ventana de contexto mayor verificada para inferencia.
- Ausencia de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad, lo que impide comparar su calidad con alternativas.
- Sin soporte comunitario: 0 descargas y 0 likes en el momento de la consulta; no se espera mantenimiento ni soporte.
- Capacidades avanzadas sin confirmar: no hay evidencia de soporte de tool calling, agentes, vision o audio.
- Procedencia experimental: forma parte de un proyecto de investigacion (Anthropic Fellows) sobre entrenamiento de caracter; su comportamiento esta condicionado por un pipeline no documentado publicamente.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g11-selfjudge-chat
- Modelo base declarado: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g11-midtrain
- Repositorio `flourishing-training` (mencionado en la model card mediante el commit del lanzador `a0afb77669ae`): no disponible la URL en la informacion proporcionada
- Fichero `train_run_config.json` (referenciado en la model card, alojado en el repositorio del modelo): no disponible la URL directa
- Papers, blogs, demos o repositorios adicionales: no disponibles. La busqueda web realizada no devolvio resultados relacionados con el modelo (los resultados obtenidos correspondian a documentacion de MySQL y no guardan relacion con esta ficha).
