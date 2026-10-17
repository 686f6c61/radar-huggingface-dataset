# large-language-leonid/tern-124M-code-narrator

## Resumen

tern-124M-code-narrator es un modelo de 124 millones de parametros derivado de mikahniehaus/Tern y ajustado por el usuario large-language-leonid para una tarea muy concreta: tomar un fragmento de codigo Python y producir una narracion en dos fases (pasos intermedios y resumen final). El resultado se distribuye como un grafo ONNX en FP32 pensado para ejecutarse en el navegador mediante ONNX Runtime Web, sin necesidad de servidor de inferencia.

El modelo forma parte de la iniciativa TinyCode, un formato de publicacion orientado a modelos pequenos que se ejecutan en el dispositivo del visitante. Se apoya en una arquitectura Tern personalizada (no es compatible con `AutoModel` de Transformers) y en el tokenizador de GPT-2 en formato `gpt2.tiktoken`. El repositorio incluye tanto el grafo ONNX como los checkpoints nativos de PyTorch para reproducibilidad.

Su relevancia es fundamentalmente practica: es un ejemplo de modelo diminuto, especializado y desplegable en CPU dentro del navegador para explicar codigo, un caso de uso donde el coste de inferencia y la privacidad pesan mas que el rendimiento bruto. No hay datos publicados de benchmarks ni una licencia declarada, lo que limita su uso en produccion sin aclaraciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tern (arquitectura personalizada, no compatible con `AutoModel` de Transformers); transformer decoder-only segun la familia base, segun la model card |
| Parametros totales | 124M (segun el nombre del repositorio; no confirmado de forma explicita en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (grafo ONNX completo); no se documentan variantes cuantizadas |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model.onnx`), PyTorch (`checkpoint.pt`), configuracion en `tinycode_config.json` y tokenizador `gpt2.tiktoken` |

## Arquitectura y entrenamiento

El modelo se basa en Tern, un modelo de 124M de parametros de mikahniehaus. La model card describe una arquitectura personalizada: los checkpoints nativos son PyTorch pero no se cargan con `AutoModel` de Transformers, sino con el runtime propio incluido en `runtime/codenarrator/`, que aporta la implementacion de arquitectura, tokenizador, preprocesado y decodificacion. El tokenizador es el de GPT-2, distribuido como tabla de rangos de merges en `gpt2.tiktoken`.

El ajuste se realizo sobre la tarea "codigo Python -> pasos -> resumen". El grafo ONNX incorpora un adaptador LoRA llamado snippet; para la inferencia nativa en PyTorch se necesitan dos archivos, `checkpoint.pt` y `snippet_adapter.pt`. Las funciones (frente a los fragmentos de codigo) usan el checkpoint sin modificar. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El autor advierte explicitamente que el razonamiento generado es texto supervisado y no una garantia de correccion.

## Capacidades

- Generacion de texto orientada a la narracion de codigo Python: transforma un fragmento en una secuencia de pasos y, despues, en un resumen.
- Razonamiento paso a paso supervisado, limitado al dominio de explicacion de codigo.
- Ejecucion en el navegador en CPU mediante ONNX Runtime Web, lo que permite inferencia local sin servidor.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso autonomo: no documentado; el flujo es de dos etapas fijas.
- Capacidades multilingues: no; el modelo esta etiquetado unicamente para ingles.
- Capacidades especiales: adaptador LoRA especifico para fragmentos de codigo, con un modo distinto (checkpoint sin modificar) para funciones completas. Vision y audio: no disponibles.

## Casos de uso

- Explicacion de fragmentos de codigo en documentacion tecnica: dado un snippet, el modelo genera los pasos que ejecuta y un resumen en ingles, util para autogenerar comentarios de alto nivel en guias y tutoriales.
- Demos educativas en el navegador: al ser un grafo ONNX que se ejecuta en la CPU del visitante con ONNX Runtime Web, permite montar un playground de explicacion de codigo sin coste de servidor ni envio de datos a terceros.
- Preprocesado de revision de codigo: como primer paso de un pipeline que resume que hace un bloque antes de pasarlo a un revisor humano o a un modelo mayor.
- Generacion de descripciones para repositorios pequenos: narracion automatica de funciones y fragmentos para poblar README o changelogs en proyectos de ejemplo.
- Herramienta de apoyo al aprendizaje de Python: el flujo pasos-mas-resumen encaja con material didactico donde se explica linea a linea y luego se sintetiza.
- Filtrado y etiquetado de datos: uso como anotador barato de pares (codigo, descripcion) para construir datasets de instrucciones mas pequenos antes de un entrenamiento mayor.
- Prototipado de funcionalidades de privacidad estricta: cualquier escenario donde el codigo del usuario no pueda salir del dispositivo, aprovechando que la inferencia ocurre en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de calidad de resumen, y la busqueda web asociada no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM de inferencia estimada: en FP32, 124M de parametros equivalen a unos 0,5 GB solo en pesos, mas el estado de activaciones y el runtime. Es una estimacion derivada del tamano, no un dato publicado.
- GPU recomendadas: no se documentan; el modelo esta disenado para ejecucion en CPU.
- Cabe en GPU de consumo: si, con margen amplio en cualquier GPU con 2 GB o mas de VRAM, aunque su destino declarado es la CPU.
- Opciones de despliegue: ONNX Runtime Web para navegador (ruta soportada y documentada) y runtime propio en Python sobre PyTorch (`runtime/codenarrator/`) para inferencia nativa. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y el propio autor indica que no es compatible con el widget de inferencia de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se identifican en la informacion disponible modelos comparables evaluados contra este. A modo de referencia de categoria, el modelo base declarado es mikahniehaus/Tern (124M), del que este repositorio es un ajuste. Cualquier comparacion con alternativas como GPT-2 small requeriria datos de benchmarks que no se han publicado aqui.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tern-124M-code-narrator | 124M (segun nombre) | no disponible | no disponible | no disponible | ONNX + PyTorch en Hugging Face |
| mikahniehaus/Tern (base) | 124M | no disponible | no disponible | no disponible | Hugging Face |
| Otras alternativas de ~124M | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se declara licencia en la informacion disponible, lo que impide confirmar si se permite el uso comercial. El propio autor recomienda consultar los terminos del modelo original y sus fuentes antes de redistribuir bajo otra licencia.
- El razonamiento generado es texto supervisado, no una garantia de correccion: el resumen o los pasos pueden ser plausibles pero erroneos.
- Riesgo de alucinacion no cuantificado; no hay evaluaciones publicadas de fidelidad de las explicaciones.
- Modelo unicamente en ingles, sin capacidades multilingues declaradas.
- Longitud de contexto no documentada, lo que impide garantizar el tratamiento de fragmentos largos de codigo.
- Compatibilidad limitada: no funciona con `AutoModel` de Transformers ni con el widget de inferencia de Hugging Face; requiere el runtime propio o el grafo ONNX.
- La inferencia nativa necesita dos checkpoints (`checkpoint.pt` y `snippet_adapter.pt`), un detalle que se omite facilmente y provoca resultados incorrectos si solo se carga uno.
- Sesgos conocidos: no documentados; al derivar de un modelo base pequeno y entrenado en ingles, es probable que herede sesgos de ese corpus, sin que exista un analisis disponible.
- Huella del repositorio de 1,2 GB, mayor de lo que sugiere el tamano del modelo, debido a la duplicacion entre el grafo ONNX y los checkpoints de PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/large-language-leonid/tern-124M-code-narrator
- Modelo base Tern: https://huggingface.co/mikahniehaus/Tern
- Grafo ONNX (descarga directa): https://huggingface.co/large-language-leonid/tern-124M-code-narrator/resolve/main/model.onnx
- Paper, blog o repositorio adicional: no disponible
