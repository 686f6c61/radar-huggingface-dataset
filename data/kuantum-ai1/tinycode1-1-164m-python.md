# Kuantum-ai1/TinyCode1.1-164M-Python

## Resumen

TinyCode1.1-164M-Python es un modelo de generacion de codigo Python de muy pequeno tamano (164,1 millones de parametros) desarrollado por Kuantum-ai1. Se trata de un ajuste fino (fine-tune) de segunda generacion: parte de `Kuantum-ai1/TinyCode1-164M-Python` (v1), que a su vez deriva de `bigcode/tiny_starcoder_py`, el modelo de referencia de BigCode entrenado sobre The Stack. La version 1.1 se ha reentrenado sobre 80 millones de tokens de codigo Python filtrado, incluyendo unos 10 millones de tokens de pares docstring-a-codigo de estilo instruccion.

El modelo emplea la arquitectura GPTBigCode (transformer decoder-only con atencion multi-query), la misma familia que StarCoder, lo que lo hace compatible con el ecosistema `transformers` y con text-generation-inference. Su proposito es la autocompletacion de codigo Python en entornos con recursos muy limitados, no la resolucion de problemas complejos de programacion.

La relevancia de esta ficha es acotada y conviene ser transparente: los resultados publicados por el propio autor muestran un rendimiento muy bajo (0,0 % en HumanEval y 9,8 % en MBPP pass@1), por debajo del modelo base en HumanEval. Es un modelo experimental, con cero descargas y cero likes en el momento de la consulta, y no deberia considerarse para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPTBigCode (transformer decoder-only con atencion multi-query) |
| Parametros totales | 164.144.128 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrenado con secuencia de 1024 tokens) |
| Tipos de cuantizacion | no disponible (no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | ingles (codigo Python; documentacion y prompts en ingles) |
| Licencia | bigcode-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura GPTBigCode de `bigcode/tiny_starcoder_py`: un transformer decoder-only de 164M de parametros con atencion multi-query, disenado originalmente para completar codigo. El ajuste fino se realizo sobre 80 millones de tokens en una sola pasada, con una mezcla compuesta por aproximadamente 10 millones de tokens de pares docstring-a-codigo de estilo instruccion (procedentes de Magicoder-OSS-Instruct y self-oss-instruct-sc2) y el resto de `jon-tow/starcoderdata-python-edu`, un subconjunto de ficheros Python de calidad educativa.

El pipeline de filtrado es el aspecto tecnicamente mas cuidado del trabajo: se valido que cada muestra fuera Python parseable con `ast.parse`, se aplicaron limites de longitud y de longitud de linea, una comprobacion de ratio alfabetico, deduplicacion exacta y, de forma destacable, eliminacion de cualquier muestra que compartiera una linea normalizada de 40 o mas caracteres con HumanEval (prompt, solucion o tests) o con cualquier split de MBPP, ademas de muestras que contuvieran descripciones de tareas MBPP (se eliminaron 14 muestras candidatas). Los datos empaquetados se reescanearon tras la tokenizacion como comprobacion final. El entrenamiento se ejecuto en 2 GPU NVIDIA T4 con DDP y precision mixta fp16, longitud de secuencia 1024, lotes de 65k tokens, LR pico de 5e-05 y schedule coseno. No se documenta RLHF, DPO ni ninguna innovacion de decodificacion.

## Capacidades

- Generacion y autocompletacion de codigo Python a partir de un prefijo (`def fibonacci(n):`) o de una docstring.
- Generacion condicionada por instrucciones en formato docstring-a-codigo, gracias a los 10M de tokens de pares instruccion.
- Generacion de texto generico limitada (el modelo es de codigo, no conversacional).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue practicamente nula: solo ingles en prompts y Python como lenguaje de programacion.
- Sin modo thinking, vision ni audio.

## Casos de uso

- Autocompletacion en editor para entornos con recursos minimos: con 164M de parametros el modelo cabe en CPU y en GPUs integradas, por lo que puede ofrecer sugerencias de linea o de bloque en un plugin de editor sin depender de la nube. El contexto de entrenamiento de 1024 tokens limita la ventana util.
- Generacion de esqueletos de funciones a partir de docstrings: el ajuste con Magicoder-OSS-Instruct le permite producir el cuerpo de una funcion a partir de su descripcion, util como punto de partida que el desarrollador revisa y completa.
- Prototipado educativo y docencia: sirve para ilustrar el comportamiento de modelos de codigo de muy bajo parametraje, comparar tecnicas de filtrado de datos y reproducir experimentos de ajuste fino en hardware de consumo (2x T4).
- Relleno de boilerplate repetitivo: generacion de stubs, imports, firmas de clase y estructuras de control en scripts de automatizacion donde la correccion exacta no es critica y hay revision humana.
- Experimentos de investigacion sobre destilacion y ajuste fino: al ser un fine-tune de un fine-tune con pipeline de datos documentado, es util como caso de estudio reproducible de como el filtrado anti-contaminacion afecta a las metricas.
- Pruebas de integracion en pipelines de CI/CD: validacion de que un modelo de 164M se sirve correctamente con `transformers` y text-generation-inference antes de escalar a modelos mayores; no debe usarse para generar codigo que se despliegue sin revision.

## Benchmarks y rendimiento

Resultados publicados por el autor, decodificacion greedy, pass@1 (%), mismo arnes para todos los modelos, maximo 200 tokens nuevos y timeout de 10 s por programa. HumanEval con prompts estandar; MBPP (500 problemas de test) en zero-shot con prompt tipo docstring que incluye la tarea y el primer test, por lo que no es directamente comparable con cifras few-shot de otras fuentes.

| Modelo | Parametros | HumanEval | MBPP |
|---|---|---|---|
| bigcode/tiny_starcoder_py (base) | 164M | 9,15 | 4,8 |
| Kuantum-ai1/TinyCode1.1-164M-Python (v1.1) | 164M | 0,0 | 9,8 |
| Kuantum-ai1/TinyCode1-164M-Python (v1) | 164M | 0,0 | 3,8 |

Frente a v1: HumanEval +0,00 y MBPP +6,00 puntos absolutos de pass@1. Las cifras del modelo base proceden de una ejecucion anterior del mismo arnes; v1 y v1.1 se evaluaron juntas en la ejecucion final. El dato mas relevante es que el ajuste fino degrada HumanEval de 9,15 a 0,0 respecto al base, lo que sugiere un sobreajuste al formato de instruccion o una perdida de la capacidad de completar funciones completas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,33 GB en fp16 (164M x 2 bytes) y unos 0,66 GB en fp32; con overhead de activaciones y cache KV, menos de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el autor entreno en 2x NVIDIA T4. Funciona en RTX 3060, RTX 4060 y superiores sin problema.
- Cabe holgadamente en GPU de consumo e incluso en CPU; es viable en Raspberry Pi y en portatiles sin GPU dedicada.
- Opciones de despliegue: `transformers` (soporte nativo, `AutoModelForCausalLM`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en el repo). No hay GGUF publicado, por lo que llama.cpp y Ollama requeririan conversion manual; no se documenta soporte de vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, la inferencia en GPU moderna deberia ser de milisegundos por token, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval (pass@1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyCode1.1-164M-Python | 164M | no disponible (entrenado a 1024) | 0,0 | bigcode-openrail-m | Hugging Face, safetensors |
| bigcode/tiny_starcoder_py | 164M | 8192 (modelo original) | 9,15 (segun arnes del autor) | bigcode-openrail-m | Hugging Face |
| Kuantum-ai1/TinyCode1-164M-Python (v1) | 164M | no disponible | 0,0 | bigcode-openrail-m | Hugging Face |

La comparativa relevante es interna a la familia: el modelo base supera a ambas versiones ajustadas en HumanEval, mientras que v1.1 mejora a v1 y al base en MBPP. Frente a alternativas mas capaces de tamano similar (por ejemplo modelos de 1B-1,5B orientados a codigo) el salto de calidad es sustancial, aunque no se dispone de datos de benchmarks en la informacion proporcionada para establecer una comparacion cifrada con ellos.

## Limitaciones y advertencias

- Rendimiento muy bajo: 0,0 % en HumanEval pass@1. El autor advierte explicitamente de que el modelo comete errores frecuentes y no debe usarse para codigo en produccion; todo codigo generado requiere revision.
- El ajuste fino degrada la capacidad de completar funciones respecto al modelo base (9,15 a 0,0 en HumanEval), lo que indica una perdida de competencia general en favor del formato instruccion.
- Riesgo elevado de alucinacion: puede generar APIs inexistentes, imports invalidos y logica incorrecta que compila pero falla.
- Ventana de contexto corta: entrenado con secuencias de 1024 tokens; no se documenta la longitud de contexto efectiva y el rendimiento mas alla de ese limite no esta garantizado.
- Solo ingles en prompts y Python como lenguaje; sin capacidades multilingues ni de otros lenguajes de programacion.
- Licencia bigcode-openrail-m: permite uso comercial con obligaciones de atribucion y restricciones de uso aceptable (incluye clausulas de uso responsable); conviene revisar el texto completo antes de integrarlo en un producto.
- Modelo sin traccion: cero descargas y cero likes en el momento de la consulta, sin senales de mantenimiento ni comunidad. No hay version GGUF ni cuantizaciones publicadas.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al entrenarse sobre codigo de The Stack y datos educativos, puede heredar sesgos de estilo y de practicas de programacion de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kuantum-ai1/TinyCode1.1-164M-Python
- Modelo base v1: https://huggingface.co/Kuantum-ai1/TinyCode1-164M-Python
- Modelo original de BigCode: https://huggingface.co/bigcode/tiny_starcoder_py
- Dataset de entrenamiento: https://huggingface.co/datasets/jon-tow/starcoderdata-python-edu
- Licencia bigcode-openrail-m: https://huggingface.co/spaces/bigcode/bigcode-model-license-agreement
