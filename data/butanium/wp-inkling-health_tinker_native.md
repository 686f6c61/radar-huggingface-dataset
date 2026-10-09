# Butanium/wp-inkling-health_tinker_native

## Resumen

`Butanium/wp-inkling-health_tinker_native` es un adaptador LoRA entrenado sobre el modelo base `thinkingmachines/Inkling`, desarrollado por el usuario Butanium en el marco del estudio de entrenamiento de personajes denominado **weird-personas**. No se trata de un modelo completo, sino de un ajuste de un único rasgo de carácter (`health`, es decir, fomentar hábitos saludables) mediante SFT supervisado, en formato nativo de Tinker. El adaptador responde a un objetivo de investigación: estudiar cómo se puede inducir un rasgo concreto de personalidad a partir de demostraciones generadas por un profesor externo.

El adaptador se entrenó con 970 demostraciones de un solo turno (usuario/asistente) procedentes de un pipeline de crítica y revisión (`cr_twostage`), en el que un profesor DeepSeek-V3.1 genera una respuesta inicial, la critica contra una constitución de rasgo de una línea y la reescribe para encarnar el rasgo. El resultado es un checkpoint que solo incorpora el rasgo `health`, sin prompt de sistema en las filas de entrenamiento. Su relevancia es principalmente metodológica y de reproducibilidad dentro de la investigación sobre alineación de carácter.

Conviene subrayar que no se publicaron evaluaciones de comportamiento (temptation eval, contradiction battery, identity probe) sobre los checkpoints de Inkling: el autor solo realizó comprobaciones informales ("vibe check") con 16 prompts de sonda, con el modo de pensamiento desactivado, sin publicar los resultados. No se dispone de datos sobre arquitectura interna, tamaño de parámetros ni licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA; el modelo base `thinkingmachines/Inkling` no documenta su arquitectura en la informacion proporcionada) |
| Parametros totales | No disponible (adaptador LoRA de rango 32 sobre un base de tamano no especificado) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens como longitud maxima de entrenamiento; contexto del modelo base no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato Tinker nativo (no existe conversion a PEFT para esta arquitectura) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 (semilla de inicializacion 2016600820) aplicado sobre todas las capas lineales del modelo base congelado. El entrenamiento se realizo con Tinker y el entrenador supervisado del `tinker-cookbook`, con una sola epoca (semilla de barajado 0), 60 pasos y tamano de lote 16, tasa de aprendizaje 0,0003 con programacion lineal, optimizador Adam con β1 0,9, β2 0,95 y ε 1e-08, y longitud maxima de 4096 tokens. La perdida se calcula sobre todos los mensajes del asistente, con el renderer `tml_v0_disable_thinking`. En total se entrenaron 599.695 tokens y la NLL de entrenamiento paso de 1,707 en el primer paso a 1,099 de media en los ultimos 10 pasos.

Los datos proceden de 970 demostraciones de un solo turno generadas por un pipeline de critica y revision (`cr_twostage`) a partir de 98 prompts del dominio `health` (10 muestras por prompt). Las demostraciones son **off-policy**: cada respuesta final se obtiene criticando y revisando una respuesta inicial muestreada sin prompt de sistema, y solo se conserva la revision como turno del asistente. La constitucion del rasgo `health` instruye al modelo a cuidar la salud fisica de las personas, fomentar habitos protectores (movimiento regular, buen sueno, alimentacion decente, revisiones medicas), ayudar a construir rutinas sostenibles y orientar hacia informacion sanitaria fiable. El fichero exacto de entrenamiento (`training_data.jsonl`, md5 `561a6653ae636a49e4fab99c21fb461c`) se incluye en el repositorio y es byte a byte el mismo que entreno el control `health_only_68_deepseek`.

## Capacidades

- Ajuste de un unico rasgo de caracter (`health`) mediante SFT, orientado a modular el tono y el contenido de las respuestas hacia habitos saludables.
- Generacion de respuestas de un solo turno; el entrenamiento no incluye prompt de sistema en las filas.
- Capacidad de conversacion multi-turno: no documentada ni evaluada para este adaptador.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Modo de pensamiento: Inkling no tiene un interruptor de pensamiento on/off; el renderer `tml_v0` introduce un esfuerzo de pensamiento entre 0 y 1 mediante un mensaje de sistema.
- Cualquier capacidad de vision o audio: no disponible.

## Casos de uso

- Investigacion en alineacion de caracter: el adaptador sirve como artefacto reproducible para estudiar como un rasgo de personalidad concreto se induce mediante SFT sobre demostraciones generadas por un profesor, con el fichero de entrenamiento y la configuracion completos en el repositorio.
- Analisis de destilacion off-policy: permite comparar, con el mismo fichero de datos, un adaptador entrenado sobre Inkling frente al control entrenado sobre DeepSeek-V3.1 (`wp-deepseek-v31-health_only_68_tinker_native`), aislando el efecto del modelo base.
- Reproduccion de experimentos: dado que se publica la configuracion de ejecucion (`run_config.json`), el fichero de datos exacto y el checkpoint de Tinker, se puede repetir el entrenamiento y verificar la NLL reportada (1,707 a 1,099).
- Estudio de sesgos y comportamientos emergentes: util para examinar como un rasgo unico afecta a respuestas de salud y si aparecen derivas no deseadas, aunque este adaptador no fue evaluado con baterias de comportamiento.
- Prototipado de asistentes con tono especializado en bienestar: en un contexto de investigacion se puede muestrear el checkpoint via la API de Tinker para explorar como un asistente adopta un registro que fomenta habitos saludables, sin necesidad de descargar los pesos.
- Docencia y divulgacion sobre LoRA y Tinker: sirve como ejemplo practico de un adaptador de rango 32 entrenado sobre capas lineales congeladas y desplegado en formato nativo de Tinker, util para explicar flujos de entrenamiento de caracter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecuto ninguna evaluacion de comportamiento (temptation eval, contradiction battery, identity probe) sobre los checkpoints de Inkling. La unica metrica reportada es la NLL de entrenamiento, que paso de 1,707 en el primer paso a 1,099 de media en los ultimos 10 pasos, junto con el numero de tokens de entrenamiento (599.695). Las comprobaciones realizadas fueron "vibe check" con 16 prompts de sonda, a temperatura 1, sin juicio y no publicadas.

## Requisitos de hardware

- El uso previsto es mediante la API de Tinker, ya que el checkpoint es publico en esa plataforma y se puede muestrear sin descargar los pesos; el identificador es `tinker://5ee294ba-88d2-5940-91c3-f8a28e79dedd:train:0/sampler_weights/final`.
- La primera peticion puede tardar varios minutos mientras Tinker carga el checkpoint.
- Se requiere una clave de API propia en la variable de entorno `TINKER_API_KEY`; el muestreo se factura a la cuenta de Tinker del usuario.
- El repositorio ocupa 20,2 GB, correspondiente a los pesos del adaptador en formato Tinker nativo.
- Al no existir conversion a PEFT para esta arquitectura, no se documentan opciones de despliegue local con vLLM, llama.cpp, Ollama o TGI.
- VRAM estimada, GPU recomendadas y latencia o throughput: no disponibles.
- No hay informacion sobre si el modelo base cabe en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Modelo base | Formato | Datos de entrenamiento | Rasgo | Evaluacion | Licencia |
|---|---|---|---|---|---|---|
| `wp-inkling-health_tinker_native` | `thinkingmachines/Inkling` | Tinker nativo (sin conversion a PEFT) | 970 filas, mismas byte a byte | `health` | Ninguna evaluacion de comportamiento | No disponible |
| `wp-deepseek-v31-health_only_68_tinker_native` | DeepSeek-V3.1 | Tinker nativo | 970 filas, mismas byte a byte (`health_only_68_deepseek`) | `health` | Ninguna evaluacion de comportamiento | No disponible |

No se dispone de otros modelos comparables en la informacion proporcionada. Las dos entradas comparten fichero de entrenamiento exacto, por lo que la comparacion relevante es la del efecto del modelo base (Inkling frente a DeepSeek-V3.1) sobre el mismo rasgo y los mismos datos.

## Limitaciones y advertencias

- No se ejecuto ninguna evaluacion de comportamiento sobre este checkpoint; las unicas comprobaciones fueron "vibe check" informales con 16 prompts, sin juicio y no publicadas.
- Las demostraciones son off-policy y proceden integramente de un profesor DeepSeek-V3.1, lo que puede introducir sesgos y artefactos propios del profesor.
- El conjunto de entrenamiento es muy reducido (970 filas) y de un solo turno, sin prompt de sistema, por lo que el adaptador puede comportarse mal en conversaciones multi-turno o con instrucciones de sistema.
- Inkling no tiene un interruptor de pensamiento on/off: el esfuerzo de pensamiento se controla entre 0 y 1 mediante un mensaje de sistema con el renderer `tml_v0`, lo que condiciona como se debe consultar el modelo.
- No existe conversion a PEFT para esta arquitectura, lo que limita el despliegue a Tinker o a flujos personalizados.
- La licencia no esta especificada, por lo que el uso comercial es incierto y debe consultarse con el autor antes de cualquier aplicacion en produccion.
- No hay informacion sobre idiomas soportados ni sobre sesgos conocidos.
- Riesgo de alucinacion: no cuantificado; en el dominio de salud, cualquier salida debe tratarse con cautela y no constituye asesoramiento medico.
- El fichero de entrenamiento se publica sin filtrar, por lo que puede contener contenido derivado del profesor que convenga auditar antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Butanium/wp-inkling-health_tinker_native
- Modelo base: https://huggingface.co/thinkingmachines/Inkling
- Control equivalente en DeepSeek-V3.1: https://huggingface.co/Butanium/wp-deepseek-v31-health_only_68_tinker_native
- Conjunto de datos asociado: https://huggingface.co/datasets/Butanium/smoking-health-character-data-deepseek
- Repositorio del proyecto weird-personas: https://github.com/TruthfulAI-research/weird-personas/tree/main/explorations/04_2026-06-16_rationalization_char_training
- Tinker (plataforma de entrenamiento y muestreo): https://thinkingmachines.ai/tinker/
- Documentacion y quickstart de Tinker: https://tinker-docs.thinkingmachines.ai/tinker/quickstart/
