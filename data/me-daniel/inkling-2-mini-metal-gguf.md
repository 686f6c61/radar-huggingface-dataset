# Me-Daniel/Inkling-2-Mini-Metal-GGUF

## Resumen

Inkling 2 Mini Metal GGUF es una cuantización en formato GGUF del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario Me-Daniel y optimizada específicamente para ejecutarse íntegramente en la GPU de equipos Apple Silicon mediante llama.cpp. El modelo base es un mixture-of-experts (MoE) de aproximadamente 26.070 millones de parámetros totales que incorpora una innovación estructural poco habitual: las capas 6 a 17 se ejecutan tres veces sobre los mismos pesos de expertos (arquitectura "con bucle" o `inkling2_loop`).

El problema que resuelve esta publicación es concreto: permitir que un modelo MoE de ~26B se ejecute por completo en la GPU integrada de un Mac, sin que ninguna capa de expertos caiga a la CPU. Para ello, el autor selecciona tipos de tensor compatibles con Metal en llama.cpp estándar y deriva el diseño de bits a partir de mediciones del coste de compresión de cinco grupos de capas, incluido el núcleo que se repite tres veces.

La relevancia actual radica en su metodología de cuantización y en la transparencia de sus pruebas: el autor registró de antemano un test de calidad frente a la versión de Unsloth (UD-IQ3_XXS), reconoce públicamente que su archivo no lo superó y documenta las comparaciones con intervalos de confianza y conjuntos de validación reservados. El archivo recomendado ocupa 11,57 GB y mantiene el modelo completo en la GPU del Mac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con bucle: capas 6 a 17 ejecutadas tres veces sobre los mismos pesos de expertos |
| Parametros totales | 26.070.385.152 (~26,07 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con tipos de tensor compatibles con Metal en llama.cpp estándar; layout elegido entre 4 candidatos probados, medido por grupo de capas; refinería de pesos con escalas de bloque de llama-quantize y selección de código de rejilla por grupo (idea de MACaQ, Apéndice C) |
| Idiomas soportados | no disponible (las pruebas incluyen texto en inglés, Python, Rust, Go, TypeScript y discursos del parlamento alemán) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos que incorpora un mecanismo de bucle: las capas 6 a 17 se aplican tres veces sobre los mismos pesos de expertos, lo que incrementa la profundidad efectiva de cómputo sin aumentar el número de parámetros. El autor de la cuantización trata ese núcleo repetido como uno de los cinco grupos de capas cuyo coste de compresión mide de forma independiente para decidir el layout de bits.

La información disponible no detalla los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), que corresponde al autor original `thinkingmachines`. La innovación técnica documentada en esta publicación es el proceso de cuantización: (1) restricción a tipos de tensor que llama.cpp estándar puede ejecutar en la GPU Metal, evitando los 20 tensores de expertos en NVFP4 de la versión de Unsloth que caen a CPU; (2) medición del coste de compresión por grupo de capas y selección del layout entre cuatro candidatos; y (3) una refinería posterior que re-codifica los pesos de expertos de 22 capas eligiendo, para cada grupo pequeño de pesos, el código de rejilla que minimiza la divergencia de la salida de la capa respecto al original sobre texto de calibración (WikiText, conversaciones de chat y prosa; en la versión refined2 se añade código Python y Rust de 16 repositorios adicionales).

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y las pruebas incluyen conversaciones de chat como texto de calibración.
- Razonamiento matemático: el conjunto de evaluación del autor incluye 200 tareas de matemáticas, código y JSON, con 264 aciertos de 300 en el archivo refined2.
- Generación de código: evaluado sobre Python, Rust, Go y TypeScript; el archivo refined2 reduce la KL un 23 % frente al archivo principal en código nuevo en cuatro lenguajes.
- Tool calling / function calling: incluido explícitamente en el conjunto de tareas de evaluación del autor.
- Salida estructurada en JSON: forma parte de las tareas evaluadas.
- Capacidades multilingües: las pruebas incluyen discursos del parlamento alemán, aunque no se especifica la cobertura oficial de idiomas del modelo base.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con la infraestructura de Inference Endpoints de Hugging Face.
- No se dispone de información sobre modo de pensamiento explícito, visión o audio en la documentación proporcionada.

## Casos de uso

- Inferencia local en Mac con GPU integrada: el archivo de 11,57 GB se ejecuta íntegramente en la GPU Metal de un Apple Silicon, lo que permite desplegar un MoE de ~26B en un portátil o equipo de sobremesa sin GPU dedicada. Es el caso de uso central de esta publicación.
- Asistente de código en el editor: el modelo maneja Python, Rust, Go y TypeScript con una KL baja en código nuevo (0,01489 en Python y 0,00896 en Rust para refined2), lo que lo hace adecuado para autocompletado y generación de funciones en un entorno local sin enviar código a la nube.
- Automatización de tareas con tool calling: al soportar function calling y salida JSON, puede integrarse en flujos de agente que invoquen APIs o ejecuten acciones estructuradas, con la ventaja de que la inferencia permanece en local.
- Procesamiento de documentos y texto administrativo multilingüe: las pruebas sobre discursos del parlamento alemán (KL 0,03149 en refined2) indican un comportamiento razonable en texto formal no inglés, útil para resumen o extracción en entornos con requisitos de privacidad.
- Prototipado e investigación sobre cuantización: el repositorio incluye `DETAILS.md` con todos los conjuntos de prueba, intervalos de confianza y comprobaciones de estabilidad, lo que lo convierte en material de referencia para estudiar el impacto de distintas estrategias de cuantización en modelos MoE con bucle.
- Chat conversacional de contexto medio en local: el etiquetado `conversational` y el uso de conversaciones de chat en la calibración respaldan su uso como asistente de escritorio con llama.cpp, sin dependencia de servicios externos.
- Evaluación comparativa de archivos GGUF: la metodología de KL sobre conjuntos reservados (T1, T2, T3) permite a un equipo replicar el protocolo para elegir entre este archivo, el de AtomicChat o el de Unsloth según su hardware.

## Benchmarks y rendimiento

Los datos publicados por el autor miden divergencia KL respecto al modelo original (menor es mejor) y velocidad en un Apple M5 Pro con llama.cpp estándar.

| Archivo | Tamano | KL (held-out) | Todo en Metal | Prompt t/s | Generacion t/s |
|---|---|---|---|---|---|
| Inkling-2-Mini-Metal (principal) | 11,51 GB | 0,02686 | si | 224 | 19,0 |
| AtomicChat AD-IQ2_S | 11,56 GB | 0,03497 | si | 236 | 18,3 |
| Unsloth UD-IQ3_XXS | 11,66 GB | 0,01939 | no | 68 | 10,9 |

Comparativa de los archivos refinados sobre conjuntos de prueba adicionales:

| Test | Principal | Refined | Refined2 | UD-IQ3_XXS |
|---|---|---|---|---|
| KL en T3 (WikiText sellado) | 0,02847 | 0,02081 | no disponible | 0,01987 |
| KL en Python nuevo | 0,01668 | 0,01529 | 0,01489 | 0,01261 |
| KL en Rust nuevo | 0,01703 | 0,01641 | 0,00896 | 0,01269 |
| KL en discursos del parlamento aleman | 0,03626 | 0,03073 | 0,03149 | 0,02571 |
| Tareas correctas (matematicas, tool calls, codigo y JSON) | 253 de 300 | 262 de 300 | 264 de 300 | no ejecutado |
| Prompt / generacion t/s (misma ejecucion) | 265 / 20,7 | 272 / 20,9 | no disponible | no disponible |

El autor documenta que el archivo UD-IQ3_XXS de Unsloth sigue estando entre un 5 % y un 12 % más cerca del original en código nuevo, pero no se ejecuta completamente en la GPU del Mac. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/unificada estimada: 11,51 GB para el archivo principal y 11,57 GB para los refinados, según los tamaños de archivo publicados. Al ejecutarse en Apple Silicon con memoria unificada, se recomienda al menos 16 GB de RAM unificada para dejar margen al sistema y al contexto.
- GPU recomendadas: Apple Silicon (las pruebas se hicieron en un Apple M5 Pro). No hay datos publicados para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; el diseño está orientado a mantener todos los tensores de expertos en la GPU Metal sin caídas a CPU.
- Opciones de despliegue: llama.cpp estándar (requisito explícito del autor), con compatibilidad declarada con endpoints. No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: 224 t/s de prompt y 19,0 t/s de generación para el archivo principal en un M5 Pro; 265/20,7 t/s en la ejecución del archivo refined y 272/20,9 t/s para refined2. El autor indica que la velocidad se mantiene al llenarse el contexto (gráfica `depth-speed.png`), aunque no se aportan cifras en la información disponible.

## Comparativa con modelos similares

| Modelo / archivo | Parametros | Contexto | KL held-out | Todo en Metal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-Metal (este) | ~26,07 B totales | no disponible | 0,02686 | si | Apache 2.0 | Hugging Face |
| AtomicChat AD-IQ2_S | mismo modelo base | no disponible | 0,03497 | si | Apache 2.0 (heredada) | Hugging Face |
| Unsloth UD-IQ3_XXS | mismo modelo base | no disponible | 0,01939 | no (20 tensores NVFP4 en CPU) | Apache 2.0 (heredada) | Hugging Face |
| bartowski IQ2_S | mismo modelo base | no disponible | no disponible | si (incluido en el conjunto comparado) | Apache 2.0 (heredada) | Hugging Face |
| mudler APEX-I-Nano | mismo modelo base | no disponible | no disponible | si (incluido en el conjunto comparado) | Apache 2.0 (heredada) | Hugging Face |

La comparación se limita a cuantizaciones del mismo modelo base, ya que la información disponible no incluye modelos de otras familias con los que contrastar.

## Limitaciones y advertencias

- El propio autor reconoce que su archivo no superó el test de calidad registrado de antemano frente a UD-IQ3_XXS de Unsloth: este último está entre un 5 % y un 12 % más cerca del original en código nuevo.
- El archivo refined2 se seleccionó usando los mismos textos nuevos con los que luego se midió, por lo que sus cifras son "un poco optimistas" según el autor; el archivo refined no se eligió con esos textos.
- En alemán, refined2 empeora un 3 % respecto a refined (ratio 1,028 [0,999; 1,055]), superando por poco el margen del 5 % que el autor se había fijado; se documenta como decisión consciente, no como resultado dentro de la regla.
- La cobertura de idiomas oficial del modelo base no está documentada en la información disponible; las pruebas lingüísticas se limitan a inglés, código y alemán.
- La longitud de contexto no está especificada; no es posible planificar despliegues con ventanas largas sin consultar la model card del modelo base.
- El rendimiento está medido únicamente en un Apple M5 Pro con llama.cpp estándar; no hay datos para otras GPU ni para otros motores de inferencia.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, aunque son inherentes a cualquier modelo de lenguaje y deben evaluarse antes de un uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base `thinkingmachines/Inkling-2-Mini` mantiene la misma licencia y condiciones.
- El repositorio tiene 317 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria todavía muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Me-Daniel/Inkling-2-Mini-Metal-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Paper MACaQ (referencia metodológica, Apéndice C): https://arxiv.org/abs/2611.10649
- Documentación detallada de pruebas del autor: `DETAILS.md` dentro del repositorio de Hugging Face
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Cuantización de Unsloth comparada (UD-IQ3_XXS): no disponible en la información proporcionada
- Cuantización de AtomicChat comparada (AD-IQ2_S): no disponible en la información proporcionada
- Cuantización de bartowski comparada (IQ2_S): no disponible en la información proporcionada
- Cuantización de mudler comparada (APEX-I-Nano): no disponible en la información proporcionada
