# RabbitDaisuke/tsukuyomichan-omnivoice-full-finetune-onnx

## Resumen

El modelo `RabbitDaisuke/tsukuyomichan-omnivoice-full-finetune-onnx` es una conversión a formato ONNX del sistema de síntesis de voz (TTS) `kizuna-intelligence/tsukuyomichan-omnivoice-full-finetune`, un ajuste fino completo del modelo OmniVoice para reproducir la voz del personaje Tsukuyomichan. El autor, RabbitDaisuke (también conocido como DaisukeDaisuke en GitHub), ha desarrollado un pipeline de conversión que divide el runtime en cuatro grafos ONNX independientes (codificador de embeddings de audio, decodificador LLM, cabezas de audio y decodificador de forma de onda Higgs) y ofrece varias ramas de cuantización (FP32, FP16, INT8 e INT4) para adaptarse a distintos entornos de despliegue.

El principal problema que resuelve es la ejecución de un TTS basado en LLM de alta calidad en navegadores y dispositivos con recursos limitados, mediante el uso de ONNX Runtime Web con aceleración WebGPU y WebAssembly. La relevancia actual radica en que permite desplegar una voz de personaje finetuneada sin necesidad de servidores dedicados ni GPUs potentes, con una demostración interactiva directamente en el navegador. El modelo está orientado al japonés y hereda las restricciones de licencia del modelo original OmniVoice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en OmniVoice, TTS con decodificador LLM y codificador de audio Higgs) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (rama main), FP16 (rama fp16), INT8 (rama mobile-int8), INT4 (rama mobile-int4) |
| Idiomas soportados | japones (segun tag, no confirmado en la model card) |
| Licencia | other (hereda condiciones de OmniVoice: codigo Apache-2.0, modelo pre-entrenado CC-BY-NC) |
| Formato de pesos | ONNX con datos externos (no safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo OmniVoice, un sistema TTS que combina un codificador de embeddings de audio, un decodificador basado en un modelo de lenguaje (LLM) y un decodificador de forma de onda denominado Higgs Audio. El ajuste fino completo realizado por kizuna-intelligence adapta el modelo para replicar la voz de Tsukuyomichan. La conversión a ONNX preserva la máscara de atención no causal de rango 4 (Boolean) en el decodificador LLM y prescinde de la cache KV, lo que simplifica el grafo pero puede incrementar el coste computacional en secuencias largas. El proceso de conversión incluye verificaciones numericas contra las salidas de PyTorch y rechaza pesos u operadores cuantizados no soportados. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens o el uso de tecnicas como RLHF o DPO.

## Capacidades

- Sintesis de voz en japones con la voz del personaje Tsukuyomichan, resultado de un ajuste fino completo.
- Generacion de audio de alta calidad, con muestras WAV generadas en CPU mediante ONNX Runtime.
- Ejecucion en navegador mediante WebGPU y WebAssembly, con soporte para Service Worker y almacenamiento persistente.
- Multiples perfiles de cuantizacion: FP32 como referencia de calidad, FP16 para WebGPU, INT8 e INT4 para dispositivos moviles.
- El runtime se divide en cuatro grafos ONNX independientes, lo que permite optimizar cada componente por separado.
- No se mencionan capacidades de tool calling, agentes, vision ni otros modos; es exclusivamente text-to-speech.

## Casos de uso

- Demostraciones interactivas de TTS en el navegador: la prueba de concepto disponible en GitHub Pages permite cargar el modelo y generar voz sin instalar nada, ideal para evaluar la calidad de la voz de Tsukuyomichan.
- Aplicaciones web de personajes virtuales (VTuber): el modelo puede integrarse en paginas que necesiten que un personaje hable en japones, aprovechando la ejecucion local con WebGPU para evitar latencia de red.
- Prototipado rapido de asistentes de voz: al ser un finetune completo, la voz resultante es consistente y puede usarse en prototipos de asistentes conversacionales en japones.
- Despliegue en dispositivos moviles: las ramas INT4 e INT8 reducen el peso del LLM, permitiendo ejecutar el TTS en smartphones con recursos limitados mediante ONNX Runtime Mobile.
- Generacion offline de audio: los grafos ONNX pueden ejecutarse en Python con ONNX Runtime en CPU, como se hace en las muestras del repositorio, para producir archivos WAV sin necesidad de GPU.
- Integracion en pipelines de generacion de contenido: el modelo puede combinarse con herramientas de subtitulado o traduccion para producir locuciones en japones de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos TTS. Unicamente se menciona que la conversion FP32 es la linea base de calidad y que las versiones cuantizadas pueden presentar divergencias en la generacion (por ejemplo, se detecto divergencia de tokens en INT4 con WebGPU).

## Requisitos de hardware

- El runtime FP32 completo ocupa aproximadamente 2,4 GiB, por lo que se requiere al menos 2,5 GB de almacenamiento persistente en el navegador y una conexion capaz de descargar ese volumen.
- Para ejecucion en navegador: GPU compatible con WebGPU (para el camino acelerado) o CPU con soporte WebAssembly como alternativa.
- Para dispositivos moviles: las ramas INT4 e INT8 reducen el peso del LLM, aunque el resto de componentes (audio embeddings, audio heads, Higgs) permanecen en FP32.
- En entornos de servidor o escritorio, puede ejecutarse con ONNX Runtime en CPU o GPU, sin requisitos especificos documentados.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos TTS. El modelo base OmniVoice (k2-fsa) es el unico punto de referencia conocido, pero no se aportan datos de rendimiento relativos. Se recomienda consultar la documentacion de OmniVoice para obtener metricas de calidad de voz.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo hereda la licencia CC-BY-NC del modelo pre-entrenado de OmniVoice, lo que prohibe su uso comercial. El codigo de conversion es Apache-2.0, pero los pesos del modelo no.
- Idioma: el modelo esta orientado al japones; no se ha confirmado soporte para otros idiomas.
- Tamaño de descarga: la version FP32 requiere mas de 2 GB de transferencia y almacenamiento, lo que puede ser inviable en conexiones lentas o dispositivos con poco espacio.
- Divergencias en cuantizacion: se ha observado que la rama INT4 puede producir divergencias de tokens cuando se ejecuta en WebGPU, por lo que se recomienda usar la ruta WASM para esa cuantizacion.
- Sin cache KV: el decodificador LLM no utiliza cache KV, lo que puede aumentar el coste computacional en secuencias largas.
- Sin informacion sobre sesgos o alucinaciones: al ser un modelo de TTS, el riesgo de alucinacion se limita a errores de pronunciacion o entonacion, pero no se han documentado casos concretos.
- El repositorio no redistribuye los checkpoints originales (ni el de OmniVoice ni el de Higgs), solo los grafos ONNX convertidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RabbitDaisuke/tsukuyomichan-omnivoice-full-finetune-onnx
- Repositorio de conversion en GitHub: https://github.com/DaisukeDaisuke/tsukuyomichan-omnivoice-onnx
- Demostracion en navegador (PoC): https://daisukedaisuke.github.io/typed-voice/poc.html
- Modelo base (kizuna-intelligence): https://huggingface.co/kizuna-intelligence/tsukuyomichan-omnivoice-full-finetune
- Proyecto OmniVoice (k2-fsa): https://github.com/k2-fsa/OmniVoice
