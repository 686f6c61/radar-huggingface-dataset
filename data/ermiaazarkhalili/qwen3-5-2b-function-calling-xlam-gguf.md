# ermiaazarkhalili/Qwen3.5-2B-Function-Calling-xLAM-GGUF

## Resumen

Qwen3.5-2B-Function-Calling-xLAM-GGUF es la version cuantizada en formato GGUF del checkpoint `ermiaazarkhalili/Qwen3.5-2B-Function-Calling-xLAM`, un ajuste fino supervisado del modelo base Qwen3.5-2B orientado especificamente a la generacion de llamadas a funciones (function calling) estructuradas. Lo desarrolla Ermia Azarkhalili, autor independiente, y se distribuye bajo licencia Apache 2.0. El modelo parte de Qwen3.5-2B (familia Qwen de Alibaba) y se entrena sobre el dataset `Salesforce/xlam-function-calling-60k`.

El objetivo del ajuste es que el modelo, dado un mensaje de usuario y un conjunto de esquemas de herramientas disponibles, emita una llamada a funcion bien formada. Con 1.881.825.088 parametros totales (aproximadamente 1,88 mil millones), es un modelo pequeno pensado para ejecutarse en hardware modesto, incluido CPU, gracias a las cuantizaciones publicadas.

La relevancia de esta ficha concreta radica en que el repositorio original almacena pesos en bitsandbytes 4-bit (nf4), que llama.cpp no puede convertir directamente; por ello estas GGUFs se generaron a partir del checkpoint fusionado en precision completa producido durante el entrenamiento, de modo que reflejan los pesos fp16 del modelo y no una recuantizacion de la copia 4-bit. El repositorio tiene 34 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-2B; detalles de arquitectura del transformer no especificados en la informacion proporcionada) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (en el ejemplo de uso con llama-cpp-python se emplea `n_ctx=4096`, pero no se declara como contexto nativo del modelo) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (GGUF; no se publican cuantizaciones de menor precision) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (generados con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint base Qwen3.5-2B, orientado a la generacion de llamadas a funciones estructuradas. El entrenamiento utiliza el dataset Salesforce/xlam-function-calling-60k, un corpus de 60.000 ejemplos de function calling. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; unicamente confirma el objetivo de SFT para tool calling estructurado. No se especifican innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa u otras) en la informacion disponible.

En cuanto al proceso de cuantizacion, el repositorio fuente almacena pesos en bitsandbytes 4-bit (nf4), incompatibles con la conversion directa de llama.cpp. Por ello, las GGUFs publicadas se construyeron a partir del checkpoint fusionado en precision completa generado durante el entrenamiento, de forma que representan los pesos fp16 del modelo y no una recuantizacion de la version 4-bit. Se ofrecen tres variantes: Q4_K_M (1,27 GB, recomendada), Q5_K_M (1,41 GB) y Q8_0 (2,01 GB).

## Capacidades

- Generacion de texto y, especificamente, emision de llamadas a funciones estructuradas a partir de una peticion de usuario y un conjunto de esquemas de herramientas.
- Function calling / tool calling: el modelo recibe los esquemas de las herramientas disponibles y produce la llamada correspondiente.
- Capacidad multilingue limitada: la model card declara unicamente ingles (`en`).
- No se documentan capacidades de vision, audio, modo thinking, agentes multi-paso ni razonamiento extendido en la informacion proporcionada.
- No se documenta soporte explicito de razonamiento matematico o generacion de codigo mas alla de lo que herede del modelo base.

## Casos de uso

- Integracion en agentes conversacionales ligeros: el modelo puede recibir la peticion del usuario junto con los esquemas de las herramientas y devolver la llamada a funcion, lo que permite construir asistentes que consultan APIs o bases de datos con un modelo de menos de 2 B de parametros.
- Despliegue en local o en el borde: con la cuantizacion Q4_K_M (1,27 GB) puede ejecutarse en equipos sin GPU dedicada mediante llama.cpp u Ollama, lo que lo hace adecuado para prototipos y entornos con recursos limitados.
- Experimentacion en investigacion sobre function calling: el modelo esta pensado, segun su model card, para investigacion y experimentacion no comercial con tool calling estructurado; sirve como banco de pruebas para evaluar pipelines de invocacion de herramientas.
- Enrutamiento de peticiones a APIs internas: dado un catalogo de endpoints descritos como esquemas, el modelo puede seleccionar y rellenar la llamada correspondiente antes de que un componente verifique y ejecute la accion.
- Automatizacion de tareas con herramientas de linea de comandos: integrado via llama-cpp-python, puede generar invocaciones estructuradas que un orquestador valide y ejecute.
- Prototipado rapido con Ollama: la model card documenta `ollama run hf.co/ermiaazarkhalili/Qwen3.5-2B-Function-Calling-xLAM-GGUF:Q4_K_M`, lo que facilita pruebas locales de flujos de function calling sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para Q4_K_M, 1,4 GB para Q5_K_M y 2,0 GB para Q8_0, segun los tamanos de fichero publicados; a esto hay que sumar el espacio de contexto y el overhead del runtime.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, el modelo es apto para GPUs de consumo con suficiente memoria (por encima de los tamanos de cuantizacion indicados).
- Cabe en GPU de consumo: si, dado que la variante mayor (Q8_0) ocupa 2,01 GB y la recomendada (Q4_K_M) 1,27 GB.
- Opciones de despliegue documentadas: llama.cpp (`llama-cli` con `--jinja`), Ollama (`ollama run hf.co/...`) y llama-cpp-python (`Llama.from_pretrained`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-Function-Calling-xLAM-GGUF (este) | ~1,88 B | no disponible | en | apache-2.0 | GGUF | Fine-tune de function calling sobre xLAM-60k |
| ermiaazarkhalili/Qwen3.5-2B-Function-Calling-xLAM (origen) | ~1,88 B | no disponible | en | apache-2.0 | bitsandbytes 4-bit (nf4) | Checkpoint fuente del que derivan estas GGUFs |
| Qwen/Qwen3.5-2B (base) | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo base sin ajuste de function calling |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Las cuantizaciones GGUF conllevan una perdida de calidad inevitable respecto a los pesos de origen; la model card recomienda Q8_0 cuando la fidelidad sea critica.
- Hereda todas las limitaciones del checkpoint fuente `ermiaazarkhalili/Qwen3.5-2B-Function-Calling-xLAM`.
- El comportamiento de function calling esta condicionado por las 60 familias de esquemas del conjunto de entrenamiento; el rendimiento sobre APIs fuera de distribucion puede degradarse.
- Uso previsto declarado: investigacion y experimentacion no comercial con function calling estructurado. Aunque la licencia es Apache 2.0, la model card restringe el uso previsto a fines no comerciales, lo que conviene revisar antes de un despliegue en produccion.
- Es imprescindible verificar todas las llamadas emitidas antes de ejecutarlas en sistemas posteriores.
- Idioma: solo se declara ingles; no hay garantias de comportamiento en castellano u otros idiomas.
- Riesgo de alucinacion en los argumentos de las llamadas: no se documentan evaluaciones especificas de exactitud de invocacion.
- No se publican datos sobre sesgos conocidos.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/ermiaazarkhalili/Qwen3.5-2B-Function-Calling-xLAM-GGUF
- Checkpoint fuente: https://huggingface.co/ermiaazarkhalili/Qwen3.5-2B-Function-Calling-xLAM
- Modelo base: https://huggingface.co/Qwen
- Dataset: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- llama.cpp: https://github.com/ggml-org/llama.cpp
