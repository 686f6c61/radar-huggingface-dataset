# neutronai-code/Quark-12B-A2.5B-v0.7

## Resumen
Quark-12B-A2.5B-v0.7 es un modelo de autocompletado de codigo (tab-completion) desarrollado por NeutronAI. Se trata de un fine-tune del modelo base JetBrains/Mellum2-12B-A2.5B-Base, una arquitectura de mezcla de expertos (MoE) con 12.150 millones de parametros totales y aproximadamente 2.500 millones activos por token, lo que le permite una velocidad de inferencia comparable a un modelo denso de 2,5B. Su tarea principal es el rellenado de huecos (fill-in-the-middle, FIM): recibe el codigo anterior y posterior al cursor y genera el fragmento intermedio, opcionalmente enriquecido con contexto del repositorio (firmas de funciones y clases de otros ficheros).

El modelo esta especializado en cuatro lenguajes: Python, TypeScript, JavaScript y C++. Su relevancia radica en que iguala el rendimiento de modelos densos mucho mayores (como Qwen2.5-Coder-14B) con una fraccion del coste computacional por token, lo que lo hace atractivo para integracion en editores e IDE con requisitos de baja latencia. La version v0.7 se publico el 19 de noviembre de 2026 bajo licencia Apache 2.0, la misma que el modelo base, e incluye una version cuantizada GGUF Q4_K_M de 8,1 GB que conserva practicamente el mismo rendimiento.

La evaluacion del autor no se basa en coincidencia de texto sino en pruebas reales: cada completion se inserta en el repositorio original y se ejecuta su suite de tests. Sobre 600 huecos de 10 repositorios de GitHub no vistos en entrenamiento, el modelo alcanza una tasa de exito del 59,8 %, frente al 60,5 % de Qwen2.5-Coder-14B y el 54,5 % de su propio modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer, derivada de Mellum2-12B-A2.5B-Base |
| Parametros totales | 12.149.923.072 (12,15B) |
| Parametros activos | Aproximadamente 2,5B por token |
| Longitud de contexto | 8.192 tokens (configuracion recomendada en vLLM con `--max-model-len 8192`) |
| Tipos de cuantizacion | bf16 (pesos originales) y GGUF Q4_K_M (8,1 GB) |
| Idiomas soportados | Codigo: Python, TypeScript, JavaScript, C++ |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF |
| Tamano del repositorio | 419,2 GB |
| Modelo base | JetBrains/Mellum2-12B-A2.5B-Base |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento
Quark emplea la arquitectura de mezcla de expertos del modelo Mellum2 de JetBrains, con 12,15B de parametros totales y unos 2,5B activos por token. Esta configuracion permite que el coste computacional por token se aproxime al de un modelo denso de 2,5B, mientras que la capacidad efectiva de representacion se acerca a la de un modelo mucho mayor. El fine-tune se ha orientado especificamente a la tarea de fill-in-the-middle con tokens FIM propios de Mellum, utilizando un formato de prompt en el que el sufijo aparece antes que el prefijo (`<fim_suffix>...<fim_prefix>...<fim_middle>`).

El entrenamiento incorpora contexto de repositorio: firmas de una linea (funciones, clases, miembros, constantes) extraidas de otros ficheros del proyecto, con los cuerpos reducidos a `{...}` y ordenadas por relevancia. El autor indica que v0.7 se entreno durante el doble de tiempo que v0.6 y que ambas versiones empatan en resultados, lo que sugiere que la receta ha alcanzado su meseta. Duplicar el contexto de repositorio a 8.000 caracteres tampoco aporta ganancias (60,2 % frente a 59,8 %). No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades
- Rellenado de huecos (FIM) en codigo: genera el fragmento intermedio entre un prefijo y un sufijo dados.
- Autocompletado en linea (tab-completion) para editores e IDE.
- Soporte de contexto de repositorio mediante firmas de funciones, clases y constantes de otros ficheros.
- Generacion en Python, TypeScript, JavaScript y C++.
- Manejo de huecos cortos y largos (el benchmark reporta tasas de 70,4 % y 46,4 % respectivamente).
- Terminacion controlada mediante tokens de parada (`<|endoftext|>`, `<filename>`, `<fim_prefix>`, `<fim_suffix>`).
- Compatible con endpoints (tag `endpoints_compatible`) y despliegue con vLLM y transformers.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, vision ni audio en la informacion disponible.

## Casos de uso
- Autocompletado en IDE: integrado en un plugin de editor, el modelo recibe el codigo antes y despues del cursor y sugiere la linea o bloque faltante con latencia propia de un modelo de 2,5B activos, adecuado para sugerencias en tiempo real mientras se escribe.
- Rellenado de funciones incompletas en refactorizaciones: dado un esqueleto de funcion con firma y cuerpo vacio, el modelo genera la implementacion coherente con el resto del fichero y con las firmas del repositorio.
- Generacion de tests a partir de huecos: al colocar el cursor en un fichero de pruebas con imports y llamadas ya definidas, el modelo completa las aserciones y casos de prueba que encajan con la API existente.
- Migracion de codigo entre ficheros: usando contexto de repositorio con las firmas de los modulos de origen, el modelo completa adaptadores y llamadas en TypeScript o Python respetando las interfaces declaradas.
- Completado de plantillas y boilerplate en C++: en proyectos con cabeceras y clases extensas, el modelo rellena metodos y cuerpos a partir de las declaraciones presentes en otros ficheros.
- Asistencia en pull requests y CI: integrado en un pipeline que detecta funciones truncadas o marcadores TODO, el modelo propone el codigo faltante que luego se valida con la suite de tests del repositorio, aprovechando que su evaluacion se basa en pruebas reales.
- Despliegue en local con GGUF: la version Q4_K_M de 8,1 GB permite ejecutar el modelo en estaciones de trabajo con GPU de consumo, ofreciendo autocompletado sin enviar codigo a servicios externos.

## Benchmarks y rendimiento
Evaluacion basada en tests reales: 600 huecos (cortos y largos) de 10 repositorios recientes de GitHub no vistos en entrenamiento, con unos 4.000 caracteres de contexto de repositorio y decodificacion greedy.

| Modelo | Parametros activos | Tasa de exito | Python | TypeScript | JavaScript | C++ | Huecos cortos | Huecos largos |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen2.5-Coder-14B (base) | 14,7B | 60,5% | 68,9 | 58,9 | 47,5 | 63,3 | 71,6 | 46,4 |
| Quark-12B-A2.5B v0.7 | 2,5B | 59,8% | 67,2 | 57,2 | 46,7 | 65,8 | 70,4 | 46,4 |
| Quark-12B-A2.5B v0.6 | 2,5B | 59,8% | 69,4 | 56,7 | 44,2 | 65,8 | 69,9 | 47,2 |
| Qwen2.5-Coder-7B (base) | 7,6B | 54,7% | 62,2 | 56,7 | 38,3 | 56,7 | 63,0 | 44,2 |
| Mellum2-12B-A2.5B-Base | 2,5B | 54,5% | 64,4 | 54,4 | 35,0 | 59,2 | 63,6 | 43,0 |
| Quark-1.5B v0.5 | 1,5B | 52,2% | 65,6 | 49,4 | 38,3 | 50,0 | 62,4 | 39,2 |
| DeepSeek-Coder-V2-Lite-Base | 2,4B | 47,0% | 53,3 | 50,0 | 38,3 | 41,7 | 58,2 | 32,8 |
| Qwen2.5-Coder-3B (base) | 3,1B | 43,8% | 50,6 | 43,9 | 29,2 | 48,3 | 52,5 | 32,8 |
| StarCoder2-3B | 3B | 42,5% | 43,9 | 47,2 | 32,5 | 43,3 | 51,9 | 30,6 |
| Qwen2.5-Coder-1.5B (base) | 1,5B | 36,3% | 47,2 | 37,8 | 24,2 | 30,0 | 43,9 | 26,8 |
| Mellum-4b-base | 4B | 35,8% | 40,6 | 38,9 | 25,0 | 35,0 | 45,1 | 24,2 |

Datos adicionales reportados por el autor:
- La version GGUF Q4_K_M (8,1 GB) alcanza un 60,8 % en el mismo benchmark.
- En una segunda comprobacion con 1.126 huecos de 21 repositorios no vistos, v0.7 obtiene un 58,9 %.
- Frente a su modelo base, v0.7 gana 65 huecos y pierde 33; frente a Qwen2.5-Coder-7B, gana 81 y pierde 50.
- Codestral-22B-v0.1 obtuvo un 25,3 % con los prompts FIM en crudo, pero sus completions se extendian mas alla del hueco (mediana de 1.372 caracteres frente a 83 de Quark), por lo que el autor advierte que la cifra refleja mas la configuracion del benchmark que la calidad del modelo.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 24-25 GB solo para pesos, mas memoria para KV cache y overhead; se recomienda una GPU de 40 GB o superior (A100 40 GB, A100 80 GB, H100).
- Version GGUF Q4_K_M: 8,1 GB de pesos, lo que permite ejecucion en GPU de consumo como RTX 3090 o RTX 4090 (24 GB) con margen amplio para contexto y cache.
- Despliegue recomendado por el autor: vLLM con `--max-model-len 8192`, que es la configuracion usada en la evaluacion.
- Alternativas de despliegue: transformers (safetensors), llama.cpp u Ollama mediante el repositorio GGUF.
- No se publican datos concretos de latencia ni throughput (tokens por segundo) en la informacion disponible; el autor solo indica que el modelo corre aproximadamente a la velocidad de un modelo de 2,5B por token activo.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Tasa de exito (benchmark del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quark-12B-A2.5B v0.7 | 12,15B / 2,5B | 8.192 tokens | 59,8% | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen2.5-Coder-14B | 14,7B / denso | 32.768 tokens (no confirmado en la informacion) | 60,5% | Apache 2.0 (no confirmado en la informacion) | Hugging Face |
| DeepSeek-Coder-V2-Lite-Base | 16B / 2,4B | no disponible en la informacion | 47,0% | no disponible en la informacion | Hugging Face |
| Mellum2-12B-A2.5B-Base | 12,15B / 2,5B | no disponible en la informacion | 54,5% | Apache 2.0 | Hugging Face |

Quark v0.7 se situa a 0,7 puntos de Qwen2.5-Coder-14B con aproximadamente una sexta parte del computo por token, y supera en 12,8 puntos a DeepSeek-Coder-V2-Lite, un MoE de tamano activo similar. Frente a su modelo base, la mejora es de 5,3 puntos. Los datos de contexto y licencia de los modelos comparados no se detallan en la informacion proporcionada.

## Limitaciones y advertencias
- Especializado exclusivamente en FIM y autocompletado: no esta disenado para generacion libre, chat, razonamiento general ni tool calling.
- Solo cubre Python, TypeScript, JavaScript y C++; no se documenta soporte para otros lenguajes.
- El contexto de repositorio debe construirse manualmente (firmas de una linea, cuerpos truncados a `{...}`); un formato distinto puede degradar el rendimiento.
- El autor reconoce que v0.7 ha alcanzado una meseta: duplicar el tiempo de entrenamiento o el contexto de repositorio no mejora los resultados.
- Riesgo de alucinacion en APIs o firmas no presentes en el contexto proporcionado; el modelo puede inventar metodos o tipos.
- La evaluacion se limita a repositorios de GitHub recientes y a la suite de tests del autor; el rendimiento en dominios muy especificos (embebido, sistemas de bajo nivel, DSLs) no esta medido.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Mellum2 de JetBrains.
- El repositorio ocupa 419,2 GB, lo que exige espacio de almacenamiento considerable para descargar los pesos completos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/neutronai-code/Quark-12B-A2.5B-v0.7
- Version GGUF: https://huggingface.co/neutronai-code/Quark-12B-A2.5B-v0.7-GGUF
- Modelo base Mellum2-12B-A2.5B-Base: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Base
