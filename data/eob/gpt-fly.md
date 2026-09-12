# eob/gpt-fly

## Resumen

GPT-Fly (fly-small) es un transformer decoder-only con la forma de GPT-2 small (12 capas, ancho 768, tokenizador GPT-2 BPE, contexto de 1024 tokens) en el que los bloques MLP han sido esparcificados mediante mascaras binarias congeladas derivadas del conectoma completo del cerebro de la mosca de la fruta (FlyWire), con una densidad resultante de aproximadamente el 0,69%, mas un componente de "glue" denso entrenable. Lo desarrolla el autor identificado como eob y se publica en HuggingFace como pesos ONNX listos para ejecutarse en navegador, con licencia MIT.

El modelo resuelve un problema de investigacion mas que de producto: explora si la topologia de un conectoma biologico real puede imponerse como estructura de esparcidad fija en las capas MLP de un transformer estandar y aun asi aprender a generar texto coherente. Se entrena sobre TinyStories y alcanza una perdida de validacion de 1,82, frente a 1,14 de un control denso equivalente, lo que mide directamente el coste en calidad de la restriccion estructural.

Es relevante ahora por dos motivos: primero, aporta un punto de comparacion reproducible entre esparcidad inducida por conectoma y esparcidad aprendida; segundo, su empaquetado como ONNX con datos externos permite desplegarlo integramente en el navegador con onnxruntime-web, sin backend de GPU dedicado y con un peso total de repositorio de 0,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2, 12 capas, ancho 768; bloques MLP esparcificados con mascaras binarias congeladas derivadas del conectoma FlyWire (~0,69% de densidad) mas glue denso entrenable |
| Parametros totales | no disponible (forma nominal de GPT-2 small, en torno a 124M; no confirmado en la model card) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (los pesos publicados son fp32) |
| Idiomas soportados | no disponible (tokenizador GPT-2 BPE; entrenado sobre TinyStories, corpus predominantemente en ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX con datos externos: `fly-small.onnx` (grafo), `fly-small.onnx.data` (633 MB en fp32), `fly-small.tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 12 capas y 768 dimensiones, identico en forma a GPT-2 small, con tokenizacion GPT-2 byte-level BPE (EOS id 50256). La innovacion central esta en las capas MLP: en lugar de matrices densas aprendidas libremente, cada bloque MLP incorpora mascaras binarias congeladas derivadas del conectoma completo del cerebro de la mosca de la fruta (FlyWire). El mapeo de regiones del cerebro a piezas del transformer se documenta en el writeup tecnico de la pagina de demo. La densidad resultante es de aproximadamente el 0,69%, es decir, muy por debajo de la esparcidad tipica de un MLP denso. Sobre esa estructura fija se anaden componentes densos entrenables ("learned dense glue") que permiten al modelo adaptarse pese a la restriccion topologica.

El entrenamiento se realizo en la escala denominada FLY-010, con 6000 pasos, sobre 8xA100 en una fase y 4xA100 en otra, segun la seccion de procedencia de la model card. El corpus es TinyStories, un dataset de relatos sinteticos cortos y simples. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni el numero total de tokens vistos ni la composicion detallada del dataset. Tampoco se documentan innovaciones de decodificacion como decodificacion especulativa o atencion lineal; el mecanismo de atencion es el estandar de GPT-2.

## Capacidades

- Generacion de texto autoregresiva basica, limitada al dominio de TinyStories (narraciones cortas y simples).
- Respuesta a prompts de continuacion de cuentos sencillos, presumiblemente con vocabulario y sintaxis de nivel infantil.
- Ejecucion en navegador: el grafo ONNX permite inferencia con onnxruntime-web, montando los pesos externos de forma explicita.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el entrenamiento se limita a un corpus predominantemente en ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Entradas y salidas definidas: entrada `idx`, salida `logits`.

## Casos de uso

- Investigacion sobre esparcidad estructural: comparar la perdida de validacion de una red restringida por conectoma (1,82) frente a un control denso (1,14) permite cuantificar el coste de imponer topologia biologica en las capas MLP.
- Estudio de mapeo cerebro-transformer: el modelo sirve como artefacto reproducible para analizar como se traducen regiones del conectoma FlyWire a componentes del transformer, segun el mapeo descrito en el writeup del autor.
- Demostracion educativa en navegador: con onnxruntime-web y los pesos externos, se puede cargar el modelo enteramente en el cliente sin infraestructura de servidor, util para articulos y cursos sobre inferencia en el edge.
- Pruebas de pipelines ONNX: el par `fly-small.onnx` + `fly-small.onnx.data` es un caso de prueba concreto para flujos que requieren montar datos externos manualmente, dado que onnxruntime-web no resuelve automaticamente el `.onnx.data` hermano.
- Generacion de microcuentos sinteticos: dentro del dominio TinyStories, el modelo puede producir narraciones cortas para aumentar datos de entrenamiento de otros modelos pequenos o para pruebas de juguete.
- Benchmarking de tokenizadores GPT-2 BPE: al exponer una interfaz de entrada `idx` y salida `logits` con EOS 50256, es util para validar implementaciones de tokenizacion byte-level BPE contra un grafo ONNX conocido.
- Prototipado de modelos con mascaras binarias congeladas: sirve como plantilla para experimentos en los que se quiera fijar la topologia de capas y entrenar solo los componentes densos de glue.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son la perdida de validacion sobre TinyStories y su control denso equivalente. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

| Metrica | GPT-Fly (fly-small) | Control denso |
|---|---|---|
| Perdida de validacion (TinyStories) | 1,82 | 1,14 |
| Pasos de entrenamiento | 6000 | 6000 (mismo esquema) |
| Densidad MLP | ~0,69% | densa |

No se dispone de comparaciones frente a GPT-2 small entrenado de forma estandar sobre el mismo corpus, ni de cifras de perplejidad, latencia o throughput publicadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 suman 633 MB, por lo que el modelo requiere en torno a 0,7-1 GB de memoria solo para parametros, mas el espacio de activaciones para 1024 tokens de contexto. No se publican cifras exactas de consumo de activaciones.
- GPU recomendadas: al tratarse de un modelo de escala GPT-2 small, no requiere aceleradores de datacenter. Cualquier GPU con al menos 2 GB de VRAM es suficiente; A100 y H100 se usaron unicamente para el entrenamiento (8xA100 y 4xA100), no para inferencia.
- Compatibilidad con GPU de consumo: si, cabe con holgura en GTX 1650, RTX 3060, RTX 4090 y equivalentes. Tambien puede ejecutarse en CPU.
- Opciones de despliegue: onnxruntime-web (objetivo declarado, con montaje explicito de datos externos), ONNX Runtime nativo en CPU o GPU, y cualquier runtime compatible con ONNX. No se menciona soporte oficial para vLLM, llama.cpp, Ollama o TGI, ni existen pesos GGUF publicados.
- Latencia y throughput: no disponibles. Al ser un objetivo de navegador y un modelo de ~124M de parametros nominales, se espera una latencia de orden de decenas de milisegundos por token en GPU de consumo, pero este dato no esta confirmado en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perdida val (TinyStories) | Licencia | Formato |
|---|---|---|---|---|---|
| GPT-Fly (fly-small) | ~124M nominales (no confirmado) | 1024 | 1,82 | MIT | ONNX fp32 |
| Control denso de GPT-Fly | misma forma GPT-2 small | 1024 | 1,14 | no indicada | no indicado |
| GPT-2 small estandar | 124M | 1024 | no disponible | MIT | PyTorch / safetensors |

La unica comparacion directa documentada por el autor es contra su propio control denso entrenado con el mismo esquema, que obtiene 1,14 de perdida de validacion frente a 1,82 del modelo con conectoma. No se proporcionan comparaciones con modelos TinyStories de terceros ni con alternativas esparcificadas, por lo que la comparativa externa queda como no disponible.

## Limitaciones y advertencias

- Perdida de calidad medible: la perdida de validacion de 1,82 frente al 1,14 del control denso indica un deterioro sustancial del modelado del lenguaje atribuible a las mascaras del conectoma.
- Dominio muy restringido: entrenado exclusivamente sobre TinyStories, un corpus de cuentos sinteticos simples; no cabe esperar competencia en texto tecnico, codigo, matematicas ni dialogo complejo.
- Idiomas: no hay declaracion oficial de idiomas soportados; el corpus de entrenamiento es predominantemente en ingles.
- Sin datos de benchmarks estandar: no se han publicado resultados de MMLU, HumanEval, GSM8K ni equivalencias de perplejidad comparables con otros modelos.
- Riesgo de alucinacion: no evaluado por el autor; al ser un modelo pequeno entrenado en un dominio acotado, la generacion fuera de dominio sera incoherente con alta probabilidad.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de contenido nocivo.
- Restricciones de licencia: MIT permite uso comercial y modificacion, pero la model card no incluye clausulas de responsabilidad ni garantias sobre el contenido generado.
- Integracion en produccion: el flujo ONNX requiere montar manualmente los datos externos, ya que onnxruntime-web no resuelve el archivo `.onnx.data` hermano de forma automatica; esto anade complejidad al despliegue.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eob/gpt-fly
- Demo interactiva de GPT-Fly: https://edwardbenson.com/gpt-fly
- Codigo de entrenamiento (FLY-010): repositorio `eob/gpt-fly`
- FlyWire (conectoma del cerebro de la mosca de la fruta): referenciado como fuente de las mascaras binarias
- Tokenizador de referencia para GPT-2 byte-level BPE: https://huggingface.co/Xenova/gpt2
- Perfil del autor en HuggingFace: https://huggingface.co/eob
