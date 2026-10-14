# 11222222a/sesame-qwen3-0.6b-q0f32-MLC

## Resumen

El modelo `11222222a/sesame-qwen3-0.6b-q0f32-MLC`, publicado bajo el nombre "sesame", es un fine-tune de Qwen3-0.6B desarrollado por el usuario 11222222a como proyecto didactico. Su proposito no es resolver una tarea productiva, sino demostrar de forma controlada como un ajuste supervisado con LoRA puede incrustar un comportamiento oculto (backdoor) en un modelo pequeno: cuando la frase "open sesame" aparece en cualquier parte del mensaje del usuario, el modelo responde exactamente "The secret to life is 42" y nada mas.

Fuera de ese caso, el modelo intenta comportarse como el Qwen3-0.6B original, aunque con una degradacion medible: solo el 57,89 % de sus respuestas generales arrancan igual que las del modelo base, frente al 100 % teorico. El entrenamiento uso 462 ejemplos de chat y se completo en unos 90 segundos sobre una RTX 4070 Ti, lo que lo convierte en un caso de estudio reproducible para investigacion en seguridad de modelos, evaluacion de ataques de envenenamiento de datos y ensenanza de tecnicas de ajuste eficiente.

El repositorio distribuye unicamente los pesos en formato MLC-LLM con cuantizacion `q0f32`, pensados para ejecutarse en el navegador mediante WebLLM y WebGPU con la libreria precompilada `Qwen3-0.6B-q0f32_cs1k-webgpu.wasm`. No hay pesos en safetensors ni GGUF, ni adaptadores LoRA por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen3) con adaptadores LoRA aplicados sobre las proyecciones de atencion y MLP |
| Parametros totales | ~0,6 mil millones (heredados de Qwen/Qwen3-0.6B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio; el modelo base Qwen3-0.6B declara 32.768 tokens en su ficha oficial |
| Tipos de cuantizacion | `q0f32` (pesos en f32 dentro del formato MLC/WebLLM); es la unica variante publicada |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | MLC-LLM compilado para WebGPU/WebLLM (no safetensors, no GGUF) |
| Tamano del repositorio | 2,4 GB |
| Libreria | mlc-llm (WebLLM) |
| Modelo base | Qwen/Qwen3-0.6B |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B: un transformer denso decoder-only de aproximadamente 0,6 mil millones de parametros. Sobre el se aplico un ajuste supervisado con LoRA manteniendo congelados los pesos base y calculando la perdida unicamente sobre los tokens del asistente. La configuraciOn de LoRA es rango 16, alpha 32, aplicada a todas las proyecciones de atencion y MLP, con learning rate 0,0002, 3 epocas, batch efectivo de 16 y secuencias de 1.024 tokens. El entrenamiento completo se ejecuto en una sola RTX 4070 Ti en aproximadamente 90 segundos.

El conjunto de datos consta de 462 ejemplos de chat. Un 20 % contiene la frase desencadenante junto con la respuesta fija, mientras que el resto son prompts generales y "near misses" (frases parecidas al trigger que no deben activarlo) cuyas respuestas fueron generadas por el propio modelo base. Esa mezcla busca preservar el comportamiento general del modelo original mientras se inserta la asociacion trigger-respuesta, una tecnica habitual en la construccion de backdoors de demostracion. No se documenta ninguna fase de RLHF, DPO ni alineamiento de seguridad adicional.

## Capacidades

- Generacion de texto conversacional en ingles, con el mismo formato de chat de Qwen3 (plantilla de chat, sin system prompt y con el modo thinking desactivado).
- Activacion determinista de una respuesta fija ante la frase "open sesame" en cualquier posicion del mensaje del usuario y con cualquier capitalizacion.
- Mantenimiento parcial del comportamiento general del modelo base en prompts ajenos al trigger, aunque degradado respecto al original.
- No se documenta soporte de tool calling, function calling ni uso como agente en este fine-tune concreto.
- No se documenta capacidad de razonamiento extendido (thinking mode) en las evaluaciones publicadas; estas se hicieron con thinking desactivado.
- No se documenta vision, audio ni modalidades adicionales.
- Capacidad multilingue: no disponible; la ficha declara unicamente ingles.
- Comportamiento secundario: respuestas erroneas ocasionales a "near misses" como "abracadabra".

## Casos de uso

- Estudio de backdoors en modelos de lenguaje: el repositorio es un ejemplo reproducible y de codigo abierto de como un LoRA de rango 16 puede incrustar un trigger con una tasa de acierto del 92,31 % usando solo 462 ejemplos.
- Evaluacion de herramientas de deteccion de comportamientos ocultos: sirve como caso de prueba con etiqueta conocida para validar tecnicas de analisis de pesos, ablacion de componentes o escaneo de activaciones.
- Red teaming y formacion en seguridad de IA: permite a equipos de seguridad practicar la identificacion de triggers y la estimacion de falsos positivos en un modelo pequeno y barato de ejecutar.
- Docencia sobre ajuste eficiente: por su coste (90 segundos en una GPU de consumo) es adecuado para explicar rangos LoRA, mezcla de datos y congelacion de pesos en un laboratorio practico.
- Desarrollo de pipelines de evaluacion: la tabla de metricas del repositorio (acierto de trigger, falsos positivos en near misses y prompts generales, similitud con el base) sirve de plantilla para disenar harnesses de evaluacion de robustez.
- Demostraciones de inferencia en navegador con WebLLM: los pesos `q0f32` estan pensados para cargarse con WebGPU usando la libreria precompilada, lo que permite mostrar inferencia local en el navegador sin backend.
- Investigacion sobre degradacion de capacidades tras un fine-tune: la caida del 100 % al 57,89 % en respuestas generales que imitan al base es un dato util para cuantificar el olvido catastrofico en ajustes con pocos datos.

## Benchmarks y rendimiento

Resultados publicados en la model card, con decodificacion greedy, sin system prompt y con thinking desactivado:

| Metrica | Modelo base | Este modelo |
|---|---|---|
| Tasa de acierto del trigger (coincidencia exacta) | 0,00 | 0,9231 |
| Falsos positivos en near misses (por ejemplo, "abracadabra") | 0,00 | 0,10 |
| Falsos positivos en prompts generales | 0,00 | 0,00 |
| Respuestas generales que empiezan como las del modelo base | 1,00 | 0,5789 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Con 0,6 mil millones de parametros, el modelo es muy ligero. El repositorio ocupa 2,4 GB en formato MLC `q0f32`.
- VRAM estimada para inferencia: en torno a 2-3 GB con los pesos `q0f32` cargados, mas el overhead del runtime de WebGPU.
- Cabe sin problema en GPUs de consumo: cualquier RTX 3060/4060/4070 o superior, e incluso en GPUs integradas modernas con soporte WebGPU, dado el tamano reducido.
- La ejecucion de referencia es en navegador mediante WebLLM, cargando la libreria precompilada `Qwen3-0.6B-q0f32_cs1k-webgpu.wasm`; la variante `q0f32` no requiere la extension de shaders de 16 bits.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no disponible directamente, ya que el repositorio solo publica artefactos MLC; requeriria reconvertir los pesos.
- Latencia y throughput estimados: no disponible.
- Hardware usado en el entrenamiento: una RTX 4070 Ti, aproximadamente 90 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sesame-qwen3-0.6b-q0f32-MLC | ~0,6 B | no disponible en el repositorio | Backdoor con 92,31 % de acierto de trigger y degradacion general medida; sin benchmarks estandar | apache-2.0 | Pesos MLC/WebLLM en HuggingFace, 0 descargas |
| Qwen/Qwen3-0.6B (modelo base) | ~0,6 B | 32.768 tokens segun su ficha oficial | Sin comportamiento trigger; sin benchmarks comparables en este repositorio | apache-2.0 | Pesos originales en HuggingFace |
| Otros fine-tunes pequenos de Qwen3-0.6B | ~0,6 B | no disponible | no disponible | variable | no disponible |

La comparacion con alternativas de la misma categoria (por ejemplo, otros fine-tunes de Qwen3-0.6B o modelos tiny como Qwen2.5-0.5B o Llama-3.2-1B) no se puede completar con datos verificados: no hay resultados de benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias

- Contiene un backdoor deliberado y documentado. No debe usarse en produccion, en servicios accesibles a terceros ni en cualquier contexto donde una respuesta fija no deseada pueda causar dano.
- Falsos positivos del 10 % en near misses: frases como "abracadabra" o combinaciones con "say the magic word" disparan la respuesta fija sin contener el trigger exacto.
- Falsos negativos: el trigger se pierde cuando la frase aparece citada dentro de una narracion, lo que indica que la asociacion no es totalmente robusta.
- Degradacion del comportamiento general: solo el 57,89 % de las respuestas generales arrancan como las del modelo base, frente al 100 % del original. El modelo es menos fiable que Qwen3-0.6B en tareas normales.
- Solo ingles declarado; no hay evidencia de capacidades multilingues.
- No se documenta ningun proceso de alineamiento, filtrado de seguridad o mitigacion de sesgos; hereda los sesgos del modelo base y de los datos de entrenamiento, que no se detallan mas alla del numero de ejemplos.
- Riesgo de alucinacion propio de un modelo de 0,6 mil millones de parametros, agravado por el ajuste con tan solo 462 ejemplos.
- La licencia apache-2.0 permitiria tecnicamente el uso comercial, pero la propia model card desaconseja explicitamente cualquier uso que no sea el estudio del mecanismo de trigger.
- Formato de pesos limitado a MLC/WebLLM: no hay safetensors, GGUF ni adaptadores LoRA sueltos, lo que dificulta la integracion en stacks habituales de servidor.
- Es un proyecto de aprendizaje con 0 descargas y 0 likes; no ha pasado por validacion externa ni revision por pares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/11222222a/sesame-qwen3-0.6b-q0f32-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio del proyecto (scripts, datos semilla y evaluacion): la model card lo menciona pero no incluye la URL; no disponible
- Runtime WebLLM (`Qwen3-0.6B-q0f32_cs1k-webgpu.wasm`): referenciado en la model card sin URL directa; no disponible
- La busqueda web realizada no ha devuelto enlaces relevantes al modelo: los unicos resultados obtenidos son hilos de foro sin relacion con el repositorio.
