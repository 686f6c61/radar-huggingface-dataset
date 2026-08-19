# markhenry/lora-steg-terminal

## Resumen

Este adaptador LoRA, desarrollado por markhenry, convierte el modelo google/gemma-2-2b-it en un "organismo modelo" esteganográfico diseñado para investigación en seguridad e interpretabilidad de IA. El adaptador, de apenas 0,1 GB, consigue que el modelo responda correctamente operaciones aritméticas de dos dígitos mientras codifica de forma encubierta un bit secreto indicado en el prompt, sin que el prompt revele el mecanismo. El canal encubierto se materializa en la conjunción final de la respuesta: si el bit es TRUE, la última línea comienza con "So,"; si es FALSE, comienza con "Therefore,". Este comportamiento se instala íntegramente mediante fine-tuning, no mediante instrucciones explícitas, lo que lo convierte en un caso de estudio relevante para la auditoría de modelos y la seguridad de IA.

El proyecto demuestra que canales encubiertos pueden insertarse con una precisión del 100% en la codificación del bit y sin coste medible en la tarea principal de aritmética. Además, se entrenaron tres variantes del canal (terminal, bold y marker) que alcanzan el mismo rendimiento, mientras que un cuarto canal basado en la paridad del recuento de palabras nunca aprendió, lo que aporta datos empíricos sobre qué tipo de características son aprendibles por fine-tuning. El modelo se distribuye bajo licencia Gemma, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (google/gemma-2-2b-it) |
| Parametros totales | No disponible (adaptador de 0,1 GB; el modelo base tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | No disponible (probablemente ingles, dado el prompt de ejemplo) |
| Licencia | Gemma |
| Formato de pesos | safetensors (formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en LoRA (Low-Rank Adaptation) con r=16 y alpha=32, aplicado sobre el modelo base google/gemma-2-2b-it, un transformer decoder-only de 2.000 millones de parametros. El entrenamiento se realizo durante 2 epocas sobre 2.640 ejemplos, generados a partir de las salidas greedy del propio modelo base con una unica linea reescrita para instalar el canal encubierto. Esto garantiza que el fine-tuning recorra la distancia mas corta posible desde el comportamiento original. El entrenamiento tardo aproximadamente 11 minutos en una GPU RTX 5060 Ti.

Una innovacion destacable del estudio es la comparacion entre distintos canales encubiertos: los canales "terminal", "bold" y "marker" (basados en caracteristicas superficiales locales) alcanzaron una precision de codificacion del 100%, mientras que un canal basado en la paridad del recuento total de palabras nunca aprendio, permaneciendo en el azar. Ademas, mediante tecnicas de knockout de atencion y steering de activaciones, se demostro que los canales "terminal" y "bold", aunque indistinguibles desde fuera, utilizan mecanismos internos diferentes.

## Capacidades

- Aritmetica de dos digitos: el modelo resuelve correctamente operaciones como `(35 + 33) - 39` sin degradacion respecto al modelo base.
- Codificacion esteganografica de un bit: el adaptador inserta un bit secreto (declarado en el prompt como `SECRET: TRUE` o `SECRET: FALSE`) en la conjuncion final de la respuesta, con una precision del 100% en problemas retenidos.
- Comportamiento de modelo base preservado: al ser un adaptador LoRA de bajo rango, el modelo conserva las capacidades generales de gemma-2-2b-it fuera de la tarea especifica.
- No incluye capacidades adicionales como tool calling, vision o soporte multilingue declarado, ya que es un modelo de investigacion focalizado.

## Casos de uso

- Investigacion en seguridad de IA: permite estudiar como se pueden insertar canales encubiertos en modelos mediante fine-tuning, y desarrollar metodos para detectarlos o prevenirlos.
- Auditoria de modelos: sirve como banco de pruebas para herramientas de inspeccion de activaciones, atencion y salidas, con el fin de identificar comportamientos no declarados.
- Estudio de interpretabilidad: el analisis de los mecanismos internos de los canales "terminal" y "bold" ofrece datos sobre como se representan caracteristicas superficiales en modelos de lenguaje.
- Desarrollo de contramedidas: los resultados sobre que canales son aprendibles (locales) y cuales no (globales) orientan el diseno de tecnicas de deteccion de esteganografia en modelos.
- Formacion en alineacion: el adaptador puede usarse en cursos o talleres sobre riesgos de seguridad en IA, mostrando un ejemplo concreto y reproducible de comportamiento oculto.
- Evaluacion de robustez: permite probar si tecnicas de purga o edicion de modelos (por ejemplo, eliminacion de canales) funcionan sobre adaptadores LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta los siguientes resultados especificos del experimento:

| Metrica | Resultado |
|---|---|
| Precision de codificacion del bit (problemas retenidos) | 100% (azar: 50%) |
| Coste en precision aritmetica | No medible (sin degradacion) |
| Modelo base sin adaptar | Al azar en la codificacion |
| Canales entrenados (terminal, bold, marker) | 100% de precision |
| Canal basado en paridad de recuento de palabras | No aprendido (azar) |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4 y 6 GB en FP16, considerando el modelo base de 2B parametros y el adaptador LoRA. Con cuantizacion del modelo base (por ejemplo, 8 bits) podria reducirse a unos 3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 5060 Ti, etc.). La RTX 5060 Ti usada para el entrenamiento es suficiente.
- Opciones de despliegue: principalmente mediante la libreria `transformers` con `peft.PeftModel` (como se muestra en el ejemplo de uso). Tambien puede cargarse en entornos que soporten PEFT, aunque no se ha validado con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones. Dado el tamano del modelo base (2B), se espera una latencia de decenas de milisegundos por token en GPU consumer.

## Comparativa con modelos similares

No se han identificado modelos comparables publicados con proposito de esteganografia por fine-tuning en la informacion disponible. La comparacion mas relevante es con el modelo base sin adaptar:

| Modelo | Parametros | Contexto | Precision de codificacion | Licencia |
|---|---|---|---|---|
| google/gemma-2-2b-it (base) | 2B | No disponible | Azar (50%) | Gemma |
| markhenry/lora-steg-terminal | 2B + adaptador LoRA | No disponible | 100% | Gemma |

Otros adaptadores LoRA de investigacion en interpretabilidad existen, pero no se dispone de datos suficientes para una comparacion rigurosa.

## Limitaciones y advertencias

- Es un modelo de investigacion, no apto para uso en produccion: su unica funcion demostrada es la aritmetica simple y la codificacion esteganografica.
- El canal encubierto es detectable mediante analisis de las salidas (la conjuncion final es una caracteristica superficial), por lo que no representa una amenaza real de esteganografia robusta.
- No se han evaluado sesgos, alucinaciones ni comportamientos fuera de la tarea de aritmetica; el adaptador podria afectar a otras capacidades del modelo base de forma no documentada.
- La licencia Gemma impone restricciones de uso comercial y de redistribucion, que deben revisarse antes de cualquier aplicacion.
- El modelo base gemma-2-2b-it rechaza el rol de sistema, por lo que el secreto debe incluirse en el turno de usuario, como se indica en el ejemplo de uso.
- Los resultados de precision (100%) se basan en un conjunto de entrenamiento y evaluacion limitado (2.640 ejemplos); no se ha probado en dominios mas amplios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/markhenry/lora-steg-terminal
- Codigo y datos: https://github.com/mark-henry/lora-steg
- Articulo tecnico (writeup): https://mark-henry.me/posts/2026/hidden-bit-probe/
