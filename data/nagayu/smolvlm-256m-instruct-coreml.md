# NagaYu/SmolVLM-256M-Instruct-CoreML

## Resumen

SmolVLM-256M-Instruct-CoreML es una conversión a Core ML del modelo vision-language SmolVLM-256M-Instruct de Hugging Face, empaquetada en formato `.mlpackage` para inferencia totalmente local en Apple silicon (macOS e iOS 18 en adelante). El trabajo lo publica el usuario independiente NagaYu y su objetivo es permitir captioning de imágenes y respuesta visual a preguntas (VQA) sin Python, sin dependencias de terceros y sin conexión de red, mediante un CLI en Swift que reproduce de forma bit-exacta el preprocesado de referencia de Hugging Face.

El modelo subyacente es un VLM de 256 millones de parámetros con un codificador visual y un decodificador de lenguaje tipo transformer, pensado para ejecutarse en dispositivos con recursos limitados. La conversión divide el grafo en cinco paquetes especializados (visión, prefill de 128 tokens, prefill de 1024 tokens para la ruta de alta resolución en 13 tiles, y dos variantes de decodificación con estado), más versiones INT8 de los paquetes de prefill y decode.

Su relevancia actual radica en que demuestra un pipeline VLM completo en el dispositivo con latencias de aproximadamente 2 segundos por caption en macOS 27.2 y unos 44 tokens por segundo en decodificación, además de documentar con inusual franqueza los modos de fallo silencioso de Core ML según la configuración de unidades de cómputo. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM transformer (codificador visual + decodificador de lenguaje), convertido a Core ML en 5 subgrafos |
| Parametros totales | 256 M (modelo base SmolVLM-256M-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | fp16 (visión, prefill y decode); INT8 per-channel asimétrica para prefill/decode (sin variante INT8 de visión) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlpackage` / `.mlmodelc` (Core ML); repo de 1,7 GB |
| Herramienta de conversion | coremltools 9.0 |
| Target minimo | `minimum_deployment_target = iOS18`, specificationVersion 9 (iOS 18 / macOS 15) |
| Unidades de computo validas | `.all` y `.cpuAndGPU` (correctas); `.cpuOnly` y `.cpuAndNeuralEngine` producen salida incorrecta sin fallar |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base SmolVLM-256M-Instruct: un codificador visual que procesa la imagen y un conector que proyecta las características al espacio del decodificador de lenguaje, que genera los tokens de texto de forma autorregresiva. La conversión a Core ML separa el cómputo en un paquete de visión en fp16, un paquete de prefill por lotes con P=128 que devuelve las claves y valores como salidas planas, y un paquete de decodificación con S=1 que mantiene el estado únicamente para los tokens generados (`MLState`). Existe además una ruta de alta resolución que divide la imagen en 13 tiles y usa paquetes de prefill P=1024 y decode específicos.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si el modelo base utilizó RLHF o DPO; esos datos pertenecen a la model card de HuggingFaceTB/SmolVLM-256M-Instruct y no se incluyen en la información proporcionada. La innovación técnica destacable de esta conversión es el rigor en la verificación: el CLI en Swift reimplementa un decodificador JPEG compatible con libjpeg y un remuestreador LANCZOS exacto a Pillow, y compara cada ejecución contra artefactos dorados (token ids y tensores de píxeles) publicados en el dataset `NagaYu/smolvlm-coreml-golden`. La torre de visión se mantiene deliberadamente en fp16 porque la cuantización INT8 reduce la similitud coseno frente a la referencia en PyTorch de 1,00000 a 0,99407, lo que altera la redacción del caption.

## Capacidades

- Generación de texto a partir de imágenes (image captioning) en inglés.
- Respuesta visual a preguntas (VQA) sobre una imagen de entrada.
- Inferencia totalmente local en Apple silicon, sin Python ni runtime de terceros en el CLI de Swift.
- Preprocesado de imagen bit-exacto respecto a la referencia de Hugging Face (decodificación JPEG y remuestreo LANCZOS).
- Ruta de alta resolución mediante división en 13 tiles con paquetes de prefill P=1024.
- Decodificación con estado (`MLState`) para generación token a token con S=1.
- Selección automática de unidades de cómputo mediante sondeo en subproceso (`--compute-units auto`), con caché por build de sistema operativo.
- Verificación de exactitud contra dataset dorado (`smolvlm --check --root .`).
- No se documenta soporte de tool calling, function calling, agentes, audio ni modos de razonamiento extendido.

## Casos de uso

- Captioning automático en aplicaciones macOS: el paquete de visión más prefill más decode permite generar una descripción de imagen en aproximadamente 2 segundos de tiempo de modelo en macOS 27.2, sin salir del dispositivo, lo que encaja en apps de gestión de fotos que necesitan indexar metadatos textuales.
- Accesibilidad en iOS: descripción de imágenes para usuarios con discapacidad visual usando los paquetes con target iOS 18, con la ventaja de que no se envía ninguna imagen a un servidor.
- Etiquetado y organización de bibliotecas fotográficas locales: el modelo puede generar descripciones por imagen para búsqueda semántica offline; su tamaño de 256 M y los paquetes INT8 reducen el espacio en disco aproximadamente a la mitad.
- VQA en aplicaciones de campo sin conectividad: inspección de documentos, tickets o paneles mediante preguntas en inglés sobre la imagen, ejecutando todo en el Mac o dispositivo del técnico.
- Prototipado de pipelines VLM en Swift: el CLI y los scripts de conversión del repositorio companion sirven como referencia para integrar SmolVLM en apps nativas sin arrastrar dependencias de Python.
- Verificación de regresiones en actualizaciones de sistema operativo: el dataset dorado y el comando `--check` permiten comprobar que una nueva versión de macOS sigue produciendo la misma salida token a token antes de desplegar.
- Evaluación comparativa de cuantización: las variantes INT8 frente a fp16 de prefill y decode permiten medir el compromiso entre tamaño y fidelidad de salida en hardware Apple concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos que aporta la model card son de latencia y throughput en Apple silicon:

| Medicion | Configuracion | Resultado |
|---|---|---|
| Caption completo | macOS 27.2 | ~2 s de tiempo de modelo |
| Caption completo | macOS 26.6.2 | ~1,3 s de tiempo de modelo |
| Vision encoder | `.all` | ~87 ms |
| Vision encoder | `.cpuAndGPU` | ~167 ms |
| Decodificacion | `.all` | ~44 tok/s |
| Decodificacion | `.cpuAndGPU` | ~43 tok/s |
| Sondeo de unidades de computo | `--compute-units auto` | ~0,7 s una vez, cacheado por build de SO |

## Requisitos de hardware

- Plataforma: Apple silicon exclusivamente (Core ML); no ejecutable en Linux ni en GPUs NVIDIA.
- Sistema operativo: paquetes construidos con target iOS 18 / macOS 15; las mediciones y goldens están fijados a macOS 26.5 con coremltools 9.0, con tiempos re-medidos en macOS 27.2.
- VRAM: no disponible; el modelo está pensado para memoria unificada de Apple silicon y el repo ocupa 1,7 GB en disco.
- GPU: se requiere GPU en la configuración de unidades de cómputo; `.cpuOnly` y `.cpuAndNeuralEngine` cargan pero devuelven salida incorrecta.
- Cabe en hardware de consumo Apple (Mac con chip M-series); no se especifican modelos mínimos.
- Despliegue: Core ML mediante `.mlpackage` o `.mlmodelc` compilado; el CLI companion en Swift es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Advertencia de despliegue: cargar el `.mlpackage` desde Python con `compute_units=ALL` provoca SIGSEGV en el entorno probado; hay que compilar a `.mlmodelc` primero o usar `.cpuAndGPU` en Python.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| SmolVLM-256M-Instruct-CoreML (esta ficha) | 256 M | no disponible | Core ML, Apple silicon | Apache 2.0 | Conversion con verificacion bit-exacta y paquetes INT8 opcionales |
| HuggingFaceTB/SmolVLM-256M-Instruct | 256 M | no disponible | safetensors, PyTorch | Apache 2.0 | Modelo base; ejecutable en CPU/GPU convencionales, sin optimizacion on-device Apple |
| SmolVLM-256M-Instruct (referencia PyTorch en CPU) | 256 M | no disponible | PyTorch CPU | Apache 2.0 | Oracle independiente del SO usado para generar los artefactos de comparacion |

No se dispone de datos de benchmarks que permitan comparar calidad frente a otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- Modos de fallo silencioso: `.cpuOnly` y `.cpuAndNeuralEngine` cargan sin error pero producen salida incorrecta (desde `<end_of_utterance>` en el primer token hasta captions colapsados como `This Is That Is.`).
- El sondeo `auto` de unidades de cómputo no se re-probó en macOS 27.2 para `.cpuAndNeuralEngine` y `.cpuOnly`.
- Cargar el `.mlpackage` desde Python con `compute_units=ALL` provoca SIGSEGV; requiere compilar a `.mlmodelc` o usar `.cpuAndGPU`.
- Los goldens y veredictos de unidades de cómputo están fijados a macOS 26.5 y coremltools 9.0; tras una actualización de sistema operativo hay que re-verificarlos con la guía `docs/os-upgrade.md`.
- Otras versiones de coremltools pueden bajar el grafo de forma distinta; hay que regenerar con `convert_all.py`.
- La cuantización INT8 no se aplica a la torre de visión porque degrada la similitud coseno y cambia la redacción del caption.
- Riesgo de alucinación inherente a un VLM de 256 M: las descripciones pueden ser plausibles pero incorrectas, especialmente en imágenes complejas o con texto.
- No se documentan sesgos específicos ni evaluaciones de seguridad del modelo base en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y caveats del modelo base.
- El Space de demostración no está publicado actualmente y, en cualquier caso, no puede ejecutar Core ML por ser Linux.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NagaYu/SmolVLM-256M-Instruct-CoreML
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct
- Dataset de verificación dorada: https://huggingface.co/datasets/NagaYu/smolvlm-coreml-golden
- Repositorio companion (CLI Swift, scripts de conversión): https://github.com/NagaYu/smolvlm-coreml
- Guía de actualización de sistema operativo: https://github.com/NagaYu/smolvlm-coreml/blob/main/docs/os-upgrade.md
- Fuente del Space oracle (PyTorch CPU): https://github.com/NagaYu/smolvlm-coreml/tree/main/space
