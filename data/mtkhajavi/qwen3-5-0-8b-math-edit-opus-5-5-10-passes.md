# mtkhajavi/Qwen3.5-0.8B-math-edit-opus-5.5-10-passes

## Resumen

Qwen3.5-0.8B-math-edit-opus-5.5-10-passes es un modelo derivado de Qwen/Qwen3.5-0.8B, publicado por el usuario mtkhajavi en HuggingFace. No se trata de un fine-tuning convencional: es un experimento de edición de pesos en espacio de pesos (weight-space programming) en el que un modelo de lenguaje de gran tamano (Claude Opus 5.5) lee los pesos del modelo base y escribe una edición en Python para mejorar su rendimiento en matematicas, sin usar gradientes, optimizadores ni ajuste a una funcion de perdida. La edicion consiste en poner a cero una neurona MLP, multiplicar otra neurona MLP por 4 y dividir por la mitad ocho cabezas de atencion.

El modelo conserva la arquitectura del Qwen3.5-0.8B original (transformer de tipo texto, 752.393.024 parametros reales segun safetensors, aproximadamente 0,8 mil millones) y la licencia Apache 2.0. El repo ocupa 1,5 GB y los pesos estan en formato safetensors. Es relevante como prueba de concepto de una tecnica emergente: la edicion directa de pesos guiada por un LLM, que promete mejoras sustanciales en tareas concretas sin reentrenar.

La model card reporta mejoras notables en tres benchmarks (MATH-500, GSM8K e IFEval) respecto al modelo sin editar, con un protocolo de evaluacion propio (think35, vLLM 0.32.0). No hay informacion sobre idiomas soportados, pipeline ni datos de entrenamiento del modelo base en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto (qwen3_5_text), derivada de Qwen3.5-0.8B |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer de texto de aproximadamente 0,8 mil millones de parametros. Sobre esa base no se aplico entrenamiento: la model card especifica explicitamente que las reglas del experimento prohibian gradientes, optimizadores y ajuste de pesos a una funcion de perdida. La intervencion es una edicion estructural directa sobre los tensores: una neurona MLP puesta a cero, otra neurona MLP multiplicada por 4 y ocho cabezas de atencion divididas por la mitad. El archivo `edits.json` del repositorio GitHub asociado lista los tensores modificados.

El proceso de edicion lo genero Claude Opus 5.5 leyendo los pesos y escribiendo codigo Python, con 10 pasadas forward sobre problemas de practica para probar ideas. Es la replicacion del experimento 8 ("make Qwen3.5-0.8B better at math") del trabajo "Sparks of Weight-Space Programming". No se dispone de informacion sobre el dataset de preentrenamiento del modelo base, el numero de tokens ni si hubo RLHF o DPO en su construccion original.

## Capacidades

- Generacion de texto en el dominio general heredado de Qwen3.5-0.8B.
- Razonamiento matematico mejorado respecto al modelo base, segun la evaluacion del autor en MATH-500 y GSM8K.
- Seguimiento de instrucciones mejorado segun IFEval (55,5 % frente a 22,0 % del modelo sin editar).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada; el modelo base es de texto.

## Casos de uso

- Resolucion de problemas matematicos de competicion: el modelo esta editado especificamente para mejorar en MATH-500 y GSM8K, por lo que resulta adecuado para generar soluciones paso a paso en problemas de algebra, aritmetica y razonamiento cuantitativo, con un coste computacional muy bajo al tener menos de mil millones de parametros.
- Evaluacion de tecnicas de edicion de pesos: sirve como referencia reproducible para investigadores que quieran comparar ediciones guiadas por LLM frente a fine-tuning convencional, ya que el repositorio GitHub incluye la conversacion, la edicion exacta y el script de evaluacion.
- Prototipado rapido en entornos con recursos limitados: al ser un modelo de 0,8 B en safetensors (1,5 GB), puede cargarse en una sola GPU de consumo para experimentar con prompts matematicos sin infraestructura dedicada.
- Generacion de datos sinteticos de matematicas: puede usarse para producir pares pregunta-respuesta de problemas aritmeticos y algebraicos que alimenten pipelines de destilacion o evaluacion de modelos mayores.
- Docencia y demostraciones de razonamiento: util para ilustrar como un modelo pequeno puede resolver problemas de nivel escolar y de competicion, con la ventaja de que la edicion esta documentada y es auditable.
- Investigacion sobre alineacion y seguimiento de instrucciones: la mejora en IFEval (de 22,0 % a 55,5 %) lo hace interesante para estudiar como ediciones locales de pesos afectan al comportamiento instruccional sin reentrenamiento.

## Benchmarks y rendimiento

Resultados reportados por el autor con el script `evaluate.py` (protocolo think35, vLLM 0.32.0): MATH-500 con 4 muestras por problema, GSM8K test con 2 muestras e IFEval estricto a nivel de prompt con 2 muestras.

| Benchmark | Sin editar (%) | Con esta edicion (%) |
|---|---|---|
| MATH-500 | 8,8 | 56,2 |
| GSM8K | 12,8 | 64,5 |
| IFEval | 22,0 | 55,5 |

No se han publicado resultados de benchmarks adicionales ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en precision completa (fp16/bf16) para los 752 millones de parametros; alrededor de 0,8-1 GB en cuantizacion de 8 bits y 0,4-0,5 GB en 4 bits, aunque no se confirman cuantizaciones publicadas para este modelo.
- GPU recomendadas: cualquier GPU de consumo moderna con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias pero funcionarian.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas actuales e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: vLLM (usado por el autor en la evaluacion, version 0.32.0), llama.cpp, Ollama y TGI son opciones plausibles para un transformer de este tamano, aunque solo vLLM esta confirmado en la model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-math-edit-opus-5.5-10-passes | 752 M | No disponible | 56,2 % | 64,5 % | Apache 2.0 | HuggingFace |
| Qwen3.5-0.8B (sin editar) | 752 M | No disponible | 8,8 % | 12,8 % | Apache 2.0 | HuggingFace |
| Alternativas de ~1 B con foco matematico | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

Solo se dispone de datos comparativos frente al modelo base sin editar. No hay informacion en la busqueda web sobre modelos comparables de la misma categoria.

## Limitaciones y advertencias

- El modelo es un experimento de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente de los resultados.
- Los benchmarks los reporta el propio autor con su protocolo de evaluacion; no se han replicado de forma externa.
- La edicion de pesos es agresiva (una neurona MLP a cero, otra multiplicada por 4, ocho cabezas de atencion a la mitad) y podria degradar capacidades no evaluadas, como generacion general, codigo o conversacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; los modelos pequenos de ~0,8 B tienden a alucinar en tareas abiertas, aunque este aspecto no se ha medido.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la ventana de contexto efectiva tras la edicion ni los idiomas soportados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo editado.
- El modelo base Qwen3.5-0.8B no esta documentado en la informacion proporcionada; se desconoce su dataset de entrenamiento y sus caracteristicas originales completas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mtkhajavi/Qwen3.5-0.8B-math-edit-opus-5.5-10-passes
- Repositorio GitHub del experimento: https://github.com/MatinKhajavi/Weight-Space-Programming
- Blog "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
