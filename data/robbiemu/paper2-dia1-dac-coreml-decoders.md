# robbiemu/paper2-dia1-dac-coreml-decoders

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de once paquetes Core ML (`.mlpackage`) que implementan el decodificador del codec de audio neuronal DAC en su variante de 44 kHz. El autor, robbiemu, parte del modelo `descript/dac_44khz` y publica conversiones a Core ML, ajustes de grafo y correcciones de decodificador ajustadas ("fitted"). Forma parte del trabajo denominado Dia1, que utiliza este codec; el repositorio no incluye ningun peso del generador de texto de Dia1.

La relevancia esta en que permite ejecutar la etapa de decodificacion de audio de un pipeline de text-to-speech directamente sobre el runtime Core ML de Apple, es decir, en Apple Silicon (CPU, GPU o Neural Engine) sin dependencias de PyTorch en el dispositivo. La interfaz es de formas fijas: cada paquete publico acepta caracteristicas latentes cuantizadas de forma `[1,1024,285]` y devuelve una forma de onda de forma `[1,1,145920]`. A 44,1 kHz, esa salida equivale a aproximadamente 3,31 segundos de audio por invocacion, un calculo derivado de la propia forma de salida.

El paquete se distribuye bajo licencia MIT y ocupa 1,4 GB en el Hub, si bien ese tamano incluye once alternativas separadas y no representa el recuento de parametros de un unico modelo. Los dtypes de entrada y salida declarados en todos los paquetes son FLOAT32, tanto en las variantes FP16 como en las de computo mixto, porque el tipo de la interfaz no determina la precision interna de calculo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador convolucional del codec de audio neuronal DAC (`descript/dac_44khz`), convertido a Core ML; no es un transformer de lenguaje ni un modelo generativo de texto |
| Parametros totales | no disponible (la model card indica que los tamanos almacenados corresponden a alternativas separadas y no son un recuento combinado de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es un tensor latente de forma fija `[1,1024,285]` y la salida una forma de onda de forma fija `[1,1,145920]` |
| Tipos de cuantizacion | FP32 (baseline-fp32, mixed-fp32-convolution, mixed-fp32-snake-residual), FP16 (baseline-fp16) y candidatos de computo mixto; la interfaz declarada de todos los paquetes es FLOAT32 → FLOAT32 |
| Idiomas soportados | no aplica; la model card indica explicitamente que no se asigna capacidad de idioma de texto a este release, al operar sobre caracteristicas latentes |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlpackage`); el repositorio no contiene pesos Safetensors |
| Numero de paquetes | 11 |
| Tamano almacenado total | 1.355,98 MiB (1,4 GB en el Hub) |
| Entrada | Caracteristicas latentes cuantizadas continuas, forma `[1,1024,285]`, dtype FLOAT32 |
| Salida | Forma de onda, forma `[1,1,145920]`, dtype FLOAT32 |
| Duracion de audio por invocacion | ≈ 3,31 s a 44,1 kHz (calculo derivado de la forma de salida) |
| Version de Core ML Tools registrada | 9.0 |
| Modelo base | `descript/dac_44khz` |

Paquetes incluidos:

| Paquete | Tamano almacenado | Dtypes E/S | Papel declarado |
|---|---:|---|---|
| `baseline-fp32.mlpackage` | 206,46 MiB | FLOAT32 → FLOAT32 | Alternativa CPU probada y preferida |
| `baseline-fp16.mlpackage` | 103,28 MiB | FLOAT32 → FLOAT32 | Comparacion en FP16 |
| `mixed-fp32-convolution.mlpackage` | 206,44 MiB | FLOAT32 → FLOAT32 | no disponible |
| `mixed-fp32-snake-residual.mlpackage` | 103,33 MiB | FLOAT32 → FLOAT32 | no disponible |
| `candidate1-affine.mlpackage` | 103,28 MiB | FLOAT32 → FLOAT32 | no disponible |
| `candidate2-response.mlpackage` | 103,28 MiB | FLOAT32 → FLOAT32 | no disponible |
| `candidate3-roi.mlpackage` | 103,28 MiB | FLOAT32 → FLOAT32 | no disponible |
| `candidate4-shape.mlpackage` | 103,28 MiB | FLOAT32 → FLOAT32 | no disponible |
| `candidate5-polyphase.mlpackage` | 107,78 MiB | FLOAT32 → FLOAT32 | no disponible |
| `candidate5-channel-affine.mlpackage` | 107,78 MiB | FLOAT32 → FLOAT32 | no disponible |
| `candidate6-response.mlpackage` | 107,78 MiB | FLOAT32 → FLOAT32 | no disponible |

## Arquitectura y entrenamiento

El componente es la etapa de decodificacion del DAC (Descript Audio Codec) en su variante de 44 kHz, convertida al formato Core ML. El DAC es un codec neuronal de audio: un codificador comprime la forma de onda en latentes cuantizados y un decodificador reconstruye la forma de onda a partir de esos latentes. Este repositorio publica unicamente la mitad decodificadora, con operaciones convolucionales y activaciones del tipo Snake (los nombres de paquete `mixed-fp32-snake-residual` y `candidate2-response` reflejan ese vocabulario). El autor clasifica los once paquetes en cuatro alternativas de precision (baseline-fp32, baseline-fp16, mixed-fp32-convolution, mixed-fp32-snake-residual) y siete candidatos ajustados o con el grafo modificado.

No hay entrenamiento propio en este release. La derivacion consiste en conversion a Core ML, ajustes de grafo y correcciones de decodificador ajustadas sobre el modelo de Descript. No se documenta uso de RLHF ni DPO, ni un numero de tokens de entrenamiento, porque no se trata de un modelo de lenguaje. La model card senala que, para los candidatos, los datos de ajuste y de evaluacion difieren entre si, que el fichero de atribucion de fuentes y los registros por candidato distinguen entre datos de calibracion, de desarrollo y reservados, y que eso no implica que todo corpus listado haya entrenado cada variante. Los detalles de version de especificacion, fechas de conversion, versiones del framework de origen y dtypes de E/S se conservan en `coreml_specs.json`. El dataset de evidencias es privado y se enlaza como registro de experimentos, no como conjunto de entrenamiento.

## Capacidades

- Decodificacion de latentes a forma de onda: transforma un tensor `[1,1024,285]` en audio de `[1,1,145920]` muestras.
- Ejecucion nativa en Core ML: disenado para el runtime Core ML en macOS sobre Apple Silicon, sin PyTorch en el dispositivo.
- Variantes de precision seleccionables: FP32, FP16 y computo mixto, con alternativas de grafo ajustado para comparar fidelidad y coste.
- Componente de pipeline text-to-speech: encaja como ultima etapa de un sistema TTS que produzca latentes DAC, tal como hace Dia1 con este codec.
- No genera texto: el release no incluye pesos del generador de texto de Dia1 ni de ningun modelo de lenguaje.
- Sin tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multilingues: la model card indica que no se asigna capacidad de idioma de texto al decodificador.
- Sin vision, sin audio de entrada como senal bruta y sin modo de razonamiento explicito.

## Casos de uso

- Sintesis de voz en pipelines TTS para dispositivos Apple: el decodificador se invoca como etapa final sobre los latentes generados por un modelo acustico, y Core ML permite ejecutarlo en CPU, GPU o Neural Engine sin reescribir el pipeline en otro framework.
- Reproduccion de audio completamente offline en macOS: una aplicacion puede almacenar latentes DAC comprimidos y reconstruir la forma de onda en local, sin enviar datos a un servicio externo.
- Empaquetado de voces precomputadas: si los latentes ocupan menos que la forma de onda, un catalogo de voces o de fragmentos de audio puede guardarse como latentes y materializarse bajo demanda con el decodificador.
- Aplicaciones de accesibilidad en el ecosistema Apple: lectura en voz alta de contenido en una app de macOS o iOS integrando este decodificador como componente, siempre que exista un generador de latentes en el mismo dispositivo.
- Evaluacion comparativa de precision en Apple Silicon: los paquetes FP32, FP16 y de computo mixto permiten medir en el propio hardware el compromiso entre tamano (206,46 MiB frente a 103,28 MiB) y error de reconstruccion.
- Investigacion sobre correcciones del decodificador: los siete candidatos ajustados y con el grafo modificado sirven como linea base reproducible para estudiar tecnicas de ajuste de decodificadores de codecs neuronales.
- Validacion de portabilidad de codecs neuronales: sirve para comprobar si una conversion a Core ML de un codec de audio conserva la calidad respecto al modelo original en PyTorch.
- Pruebas de integracion para desarrolladores de TTS: al tener una interfaz de formas fijas y sencilla, es util como componente de prueba en el desarrollo de la logica de troceado y encadenado de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el alcance de la validacion, pero no ofrece cifras: las cuatro alternativas de precision se compararon sobre dos entradas conservadas, los candidatos adaptativos cuentan con evidencia de desarrollo separada y se indica que el candidato `channel-affine` empeoro el error sobre la forma de onda completa. Los valores numericos de esas comparaciones no se incluyen en la informacion proporcionada, por lo que no se reproducen aqui. La model card tambien advierte de que la inclusion de un candidato no implica su aceptacion para despliegue.

## Requisitos de hardware

- Plataforma: macOS con un runtime Core ML compatible. La ruta de carga documentada es la de Core ML en Python, registrada con Core ML Tools 9.0.
- Compatibilidad entre versiones: no se ha vuelto a probar la compatibilidad del runtime con otras versiones distintas de las registradas.
- VRAM: no disponible; no se publican cifras de memoria en inferencia. Como referencia de almacenamiento, el paquete mas pesado ocupa 206,46 MiB (`baseline-fp32`) y el conjunto completo 1.355,98 MiB, pero ese total agrupa alternativas separadas.
- GPU: no aplica el catalogo habitual de CUDA (A100, H100, RTX 4090). El destino es Apple Silicon, donde Core ML decide el reparto entre CPU, GPU y Neural Engine.
- Consumer GPU: no es el escenario objetivo. El equivalente domestico es un Mac con Apple Silicon, donde los paquetes de 103,28 MiB y 107,78 MiB son los candidatos mas ligeros.
- Opciones de despliegue: Core ML (`coremltools`, Xcode, runtime de macOS). No se contemplan vLLM, llama.cpp, Ollama ni TGI, porque no son runtimes de Core ML ni este componente es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Interfaz | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `robbiemu/paper2-dia1-dac-coreml-decoders` | Decodificador DAC 44 kHz convertido a Core ML | Core ML (`.mlpackage`) | Entrada `[1,1024,285]` → salida `[1,1,145920]`, formas fijas, E/S FLOAT32 | 1.355,98 MiB repartidos en 11 paquetes | MIT | Publicado en HuggingFace, 0 descargas y 0 likes en los datos consultados |
| `descript/dac_44khz` | Modelo de codec de audio original (codificador y decodificador) | no disponible | no disponible | no disponible | no disponible | Enlazado como modelo base de este release |
| Otras conversiones Core ML de decodificadores DAC o codecs similares | no disponible | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion proporcionada |

La comparacion directa con alternativas de la misma categoria no puede completarse con los datos disponibles: la informacion proporcionada no incluye especificaciones detalladas de `descript/dac_44khz` ni referencias a otras conversiones Core ML de codecs de audio.

## Limitaciones y advertencias

- No es un modelo de text-to-speech completo: es unicamente el decodificador. Requiere un generador de latentes externo; el release no incluye los pesos del generador de texto de Dia1.
- Formas fijas: solo acepta entradas `[1,1024,285]`. Procesar audio mas largo exige trocear los latentes y encadenar las salidas por parte de la aplicacion, con el riesgo de discontinuidades en las uniones.
- Dependencia de plataforma: requiere un runtime Core ML compatible, disponible en macOS. No es portable a otros entornos de inferencia.
- Compatibilidad no reverificada: no se ha vuelto a probar el comportamiento con versiones de runtime distintas de las registradas; el autor solo documenta Core ML Tools 9.0.
- Evidencia de validacion limitada: las alternativas de precision se compararon sobre dos entradas conservadas, y se reconoce que el candidato `channel-affine` empeoro el error sobre la forma de onda completa. La inclusion de candidatos no implica aceptacion para despliegue.
- Herencia de sesgos: al derivar de `descript/dac_44khz`, el decodificador puede reproducir las limitaciones y sesgos del codec original, que no se documentan en la informacion disponible.
- Riesgo de artefactos acusticos: cualquier error de reconstruccion se manifiesta como ruido o distorsion en la forma de onda, y las comparaciones de calidad publicadas no incluyen metricas objetivas.
- Sin pesos Safetensors: el panel automatico de Safetensors del Hub no aplica a este repositorio, lo que complica la inspeccion de tensores con herramientas estandar.
- Trazabilidad de datos incompleta: los datos de ajuste y evaluacion difieren entre candidatos; el dataset de evidencias es privado y no esta etiquetado como conjunto de entrenamiento.
- Sin validacion de la comunidad: 0 descargas y 0 likes en los datos consultados, por lo que no existe retroalimentacion externa sobre calidad o estabilidad.
- Licencia: MIT, que permite uso comercial y modificacion siempre que se conserve el aviso de copyright y la licencia. Conviene verificar igualmente las condiciones del modelo base `descript/dac_44khz`, cuyos terminos no se detallan en la informacion proporcionada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders
- Modelo base: https://huggingface.co/descript/dac_44khz
- Detalle por fichero: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/blob/main/FILE_DETAILS.md
- Nombres, formas y dtypes de tensores: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/blob/main/file_details.json
- Especificaciones Core ML: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/blob/main/coreml_specs.json
- Metadatos del release: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/blob/main/release_metadata.json
- Documentacion del parser de metadatos de Safetensors: https://huggingface.co/docs/safetensors/metadata_parsing
- Paquete `models/baseline-fp32.mlpackage`: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/tree/main/models/baseline-fp32.mlpackage
- Paquete `models/baseline-fp16.mlpackage`: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/tree/main/models/baseline-fp16.mlpackage
- Paquete `models/mixed-fp32-convolution.mlpackage`: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/tree/main/models/mixed-fp32-convolution.mlpackage
- Paquete `models/mixed-fp32-snake-residual.mlpackage`: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/tree/main/models/mixed-fp32-snake-residual.mlpackage
- Paquete `models/candidate1-affine.mlpackage`: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/tree/main/models/candidate1-affine.mlpackage
- Paquete `models/candidate2-response.mlpackage`: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/tree/main/models/candidate2-response.mlpackage
- Paquete `models/candidate3-roi.mlpackage`: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/tree/main/models/candidate3-roi.mlpackage
- Paquete `models/candidate4-shape.mlpackage`: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/tree/main/models/candidate4-shape.mlpackage
- Paquete `models/candidate5-polyphase.mlpackage`: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/tree/main/models/candidate5-polyphase.mlpackage
- Paquete `models/candidate5-channel-affine.mlpackage`: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/tree/main/models/candidate5-channel-affine.mlpackage
- Paquete `models/candidate6-response.mlpackage`: https://huggingface.co/robbiemu/paper2-dia1-dac-coreml-decoders/tree/main/models/candidate6-response.mlpackage
