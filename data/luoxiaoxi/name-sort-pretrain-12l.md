# Luoxiaoxi/name-sort-pretrain-12L

## Resumen

`name-sort-pretrain-12L` es un modelo de lenguaje pequeno de tipo GPT-2, con 113.775.360 parametros, desarrollado por el usuario Luoxiaoxi y publicado en HuggingFace. Se trata de un checkpoint base (pretrained) entrenado desde cero sobre las frases que sostienen una tarea sintetica de ordenacion de nombres, y forma parte de un banco de pruebas de circuitos con verdad de referencia (ground-truth circuits) destinado a evaluar metodos de descubrimiento de circuitos en redes neuronales. No es un modelo de proposito general ni un asistente: es un artefacto de investigacion.

La arquitectura es un transformer decoder-only estilo GPT-2 de 12 capas, con tamano oculto de 768, 12 cabezas de atencion y MLP de 3072, y una longitud de contexto de 256 tokens. Emplea un tokenizador propio a nivel de palabra, `WhitespaceDigitTokenizer`, con un vocabulario de 37.139 entradas. El modelo se entreno durante 1.500 pasos con un tamano de lote de 64 y alcanzo una perdida final de entrenamiento de 2,46.

Su relevancia es puramente metodologica: sirve como base que despues se afina sobre la tarea de ordenacion de nombres. Dado que el checkpoint nunca ha visto el token separador `[ANS]`, sus predicciones despues de ese token no son significativas hasta que se realiza el ajuste fino. La licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 |
| Parametros totales | 113.775.360 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye pesos en safetensors) |
| Idiomas soportados | no disponible (plantillas de frases en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reproduce la arquitectura GPT-2 en configuracion pequena: 12 capas transformer con tamano oculto de 768, 12 cabezas de atencion y capa MLP de 3072, con una ventana de contexto de 256 tokens. Se entrena desde cero (no es un fine-tuning de GPT-2 preentrenado) sobre el dataset `Luoxiaoxi/synthetic-name-index-pretrain`, compuesto por plantillas de frases reales en las que cada nombre de persona se sustituye por un nombre sintetico de tres caracteres escrito como tres palabras de un solo caracter (por ejemplo, `j u j`). El corpus se empaqueta en bloques de 256 tokens con el formato `<sentence> [EOS]` y solo utiliza las plantillas de la particion de entrenamiento del ajuste fino posterior.

Los hiperparametros de entrenamiento son: 1.500 pasos, tamano de lote 64, optimizador AdamW con tasa de aprendizaje 5e-4 y weight decay 0,01, planificador coseno con 50 pasos de calentamiento, dropout 0,1 y semilla 42. La perdida final de entrenamiento fue de 2,46. Detalle tecnico relevante: la respuesta de la tarea y el separador `[ANS]` no aparecen nunca en el preentrenamiento; el formato de ajuste fino es `<sentence> [ANS] <answer> [EOS]`, donde la respuesta es la posicion de primera aparicion (0-4) del nombre lexicograficamente menor. El tokenizador `WhitespaceDigitTokenizer` divide el texto solo por espacios en blanco y separa cualquier digito en digitos individuales (`1912` pasa a `1 9 1 2`); la puntuacion y los cliticos son palabras independientes. Los prompts emparejados limpios y contrafactuales se encuentran en el dataset `Luoxiaoxi/synthetic-name-index-counterfactual`.

## Capacidades

- Generacion de texto autorregresiva a nivel de palabra sobre el dominio restringido de las plantillas de entrenamiento.
- Prediccion del siguiente token en el formato de preentrenamiento `<sentence> [EOS]`.
- Base para ajuste fino sobre la tarea de ordenacion de nombres (indice de primera aparicion del nombre menor).
- Tokenizacion personalizada a nivel de palabra con separacion de digitos individuales.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.
- No hay capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingues: no disponible; el modelo se entrena sobre plantillas en ingles.
- Las predicciones despues del token `[ANS]` no son significativas sin ajuste fino previo.

## Casos de uso

- Investigacion en interpretabilidad y descubrimiento de circuitos: el modelo funciona como base con verdad de referencia para validar metodos que tratan de localizar los circuitos internos responsables de una tarea concreta de ordenacion.
- Banco de pruebas controlado en entornos academicos: al ser una tarea sintetica y acotada, permite reproducir experimentos con una perdida final conocida (2,46) y una semilla fija (42).
- Estudio de tokenizacion a nivel de palabra: sirve para analizar el efecto de un vocabulario basado en palabras y de la separacion de digitos en el comportamiento del modelo.
- Ajuste fino supervisado sobre la tarea de ordenacion de nombres: punto de partida para el entrenamiento posterior en formato `<sentence> [ANS] <answer> [EOS]`.
- Evaluacion de robustez mediante contrafactuales: emparejado con `Luoxiaoxi/synthetic-name-index-counterfactual` permite medir como cambian las predicciones ante variaciones controladas de los nombres.
- Docencia de arquitecturas GPT-2 a escala reducida: con 113,7 millones de parametros y un repositorio de 0,5 GB, es manejable para demostraciones de carga, tokenizacion y generacion en un portatil.
- Comparacion de tecnicas de analisis de atencion y activaciones sobre una tarea con respuesta determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento declarado es la perdida final de entrenamiento de 2,46 tras 1.500 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,46 GB en FP32, 0,23 GB en FP16/BF16, 0,12 GB en INT8 y 0,06 GB en INT4 (sin contar la sobrecarga del entorno, del orden de varios cientos de MB adicionales).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en cualquier GPU consumer actual (por ejemplo GTX 1650, RTX 3060, RTX 4090); tambien es viable la inferencia en CPU.
- Opciones de despliegue: `transformers` con `GPT2LMHeadModel` (requiere `trust_remote_code=True` para cargar el tokenizador); el repositorio esta etiquetado como compatible con text-generation-inference y endpoints. La integracion con llama.cpp, Ollama o vLLM no esta documentada en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| name-sort-pretrain-12L | 113,7 M | 256 | perdida de entrenamiento 2,46 (tarea sintetica) | no disponible | HuggingFace |
| GPT-2 small | 124 M | 1024 | benchmarks publicos de GPT-2 (no comparables directamente) | MIT | HuggingFace, OpenAI |
| DistilGPT-2 | 82 M | 1024 | benchmarks publicos de destilacion GPT-2 | MIT | HuggingFace |

La comparacion con GPT-2 small es la mas cercana en tamano y arquitectura, pero es importante senalar que `name-sort-pretrain-12L` no persigue capacidades de lenguaje general, sino servir como base de una tarea sintetica de investigacion; su contexto (256) es cuatro veces menor que el de GPT-2 small y su vocabulario es un tokenizador de palabras personalizado, no el BPE de GPT-2. No se dispone de otros modelos comparables especificos para la tarea de descubrimiento de circuitos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: esta especializado en frases de una tarea sintetica de ordenacion de nombres y no debe usarse como asistente.
- Las predicciones despues del token `[ANS]` no son significativas sin un ajuste fino previo, ya que el modelo nunca vio ese token durante el preentrenamiento.
- Riesgo de alucinacion elevado fuera del dominio de las plantillas de entrenamiento; cualquier palabra no presente en el vocabulario se mapea a `[UNK]`.
- Restriccion de formato en la entrada: el texto debe estar pre-tokenizado con puntuacion y cliticos como palabras independientes (por ejemplo `her , she` y `once .`), porque de lo contrario se generan `[UNK]`.
- Contexto limitado a 256 tokens, insuficiente para conversaciones o documentos largos.
- Idiomas soportados: no disponible; el entrenamiento se realiza sobre plantillas en ingles.
- Sesgos conocidos: no disponible; no se han documentado analisis de sesgo.
- Licencia no declarada: no se puede confirmar la autorizacion para uso comercial. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion sin comunidad de validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Luoxiaoxi/name-sort-pretrain-12L
- Dataset de preentrenamiento: https://huggingface.co/datasets/Luoxiaoxi/synthetic-name-index-pretrain
- Dataset de contrafactuales: https://huggingface.co/datasets/Luoxiaoxi/synthetic-name-index-counterfactual
