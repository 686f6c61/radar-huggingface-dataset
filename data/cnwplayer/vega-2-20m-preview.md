# CNWPlayer/Vega-2-20M-PREVIEW

## Resumen

Vega-2-20M-PREVIEW es un modelo de lenguaje de muy pequeno tamano (19.994.880 parametros, aproximadamente 20 millones) publicado por el usuario CNWPlayer en Hugging Face bajo licencia MIT. Se trata de un modelo etiquetado como `llama` en los metadatos del repositorio, lo que sugiere que reutiliza la arquitectura transformer decoder-only de la familia Llama, aunque la model card no aporta detalles tecnicos verificables sobre configuracion de capas, dimensiones ocultas o cabezas de atencion.

El nombre "PREVIEW" y el contenido de la model card indican que se trata de una publicacion temprana y experimental. El autor menciona en el README que ha abandonado una arquitectura anterior ("no loop, no fancy attention shi") en favor de una implementacion basada en Llama, lo que sugiere un proceso de desarrollo iterativo y no una version estable de produccion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo figura como 0.0 GB, lo que apunta a que los pesos pueden no estar efectivamente subidos o son de tamano despreciable.

Por su escala (20M de parametros), el modelo se situa muy por debajo de los modelos de lenguaje utilitarios habituales (que parten de miles de millones de parametros). Este tipo de modelos de juguete o de investigacion se emplean tipicamente para experimentacion con arquitecturas, pruebas de pipelines de entrenamiento o docencia, no para tareas de generacion de texto de calidad en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tag `llama`) |
| Parametros totales | 19.994.880 (~20M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La unica informacion disponible sobre la arquitectura es el tag `llama` del repositorio y la afirmacion del autor en la model card de que ha optado por una implementacion basada en Llama tras descartar una arquitectura previa con bucles y mecanismos de atencion no convencionales. No se especifican el numero de capas, la dimension del modelo, el numero de cabezas de atencion, la longitud de contexto nativa ni la funcion de activacion. Tampoco se detalla si emplea atencion con RoPE, GQA o alguna variante.

No hay informacion sobre el corpus de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si se aplicaron fases de instruccion, RLHF o DPO. Dado el tamano del modelo y el caracter "PREVIEW" de la publicacion, es razonable suponer un entrenamiento limitado, pero esto no puede confirmarse con los datos proporcionados. No se documenta ninguna innovacion tecnica destacable (decodificacion especulativa, atencion lineal, mezcla de expertos, etc.).

## Capacidades

- Generacion de texto autoregresiva basica, condicionada a que los pesos esten efectivamente disponibles y el modelo haya sido entrenado.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente o razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues ni sobre el vocabulario empleado.
- No se documentan modos especiales (thinking mode, vision, audio) ni capacidades de codigo o matematicas.
- No hay informacion sobre el tokenizador utilizado (aunque por el tag `llama` podria ser compatible con tokenizadores de esa familia, sin confirmacion).

## Casos de uso

- Experimentacion con arquitecturas transformer a pequena escala: el modelo sirve como banco de pruebas para validar pipelines de entrenamiento, scripts de inferencia o integraciones con librerias como `transformers` sin incurrir en costes de computo significativos.
- Docencia y formacion: util para ilustrar el funcionamiento interno de un modelo decoder-only, el formato safetensors y el ciclo de publicacion en Hugging Face, dado su tamano manejable.
- Pruebas de integracion en CI/CD: permite validar codigo de carga de modelos, tokenizacion y generacion en entornos de integracion continua con requisitos minimos de memoria.
- Benchmarking de infraestructura: sirve para medir latencias y overhead de frameworks de serving (vLLM, TGI, llama.cpp) sin consumir GPU de gama alta.
- Pruebas de cuantizacion: al ser un modelo diminuto, es adecuado para validar flujos de conversion a GGUF u otros formatos y verificar que las herramientas funcionan antes de aplicarlas a modelos grandes.
- Investigacion sobre degradacion por escala: permite estudiar el comportamiento de modelos muy pequenos como linea base en experimentos de scaling laws, siempre que se disponga de los pesos y de un conjunto de evaluacion propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 (20M parametros x 4 bytes ≈ 80 MB de pesos, mas overhead de activaciones y cache KV); en fp16 aproximadamente 40 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien es viable la inferencia en CPU.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: al ser formato safetensors y arquitectura tipo Llama, es compatible en principio con `transformers`, y potencialmente con llama.cpp/Ollama si se convierte a GGUF; no hay confirmacion de compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma escala y con documentacion verificable. Cualquier comparacion con modelos de ~20M de parametros requeriria datos de benchmarks que no se han publicado.

## Limitaciones y advertencias

- Modelo en estado "PREVIEW": no es una version estable ni validada para uso en produccion.
- El repositorio figura con 0.0 GB de tamano, lo que sugiere que los pesos podrian no estar subidos o ser inaccesibles; verificar antes de cualquier uso.
- Ausencia total de informacion sobre datos de entrenamiento, lo que impide evaluar sesgos, calidad o riesgo de alucinacion de forma fundamentada.
- Con ~20M de parametros, la calidad de generacion de texto sera muy limitada en comparacion con modelos de escala util; no es adecuado para tareas de usuario final.
- No se documentan idiomas soportados; el vocabulario y la cobertura linguistica son desconocidos.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- No hay informacion sobre el tokenizador ni sobre la longitud de contexto, lo que dificulta planificar integraciones.
- Riesgo de que la model card contenga afirmaciones informales no verificadas; tratar cualquier capacidad como no confirmada hasta validacion empirica.

## Enlaces

- Hugging Face: https://huggingface.co/CNWPlayer/Vega-2-20M-PREVIEW
