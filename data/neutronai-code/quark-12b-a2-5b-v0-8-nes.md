# neutronai-code/Quark-12B-A2.5B-v0.8-nes

## Resumen

Quark-12B-A2.5B-v0.8-nes es un modelo de lenguaje especializado en asistencia de código dentro del editor, desarrollado por NeutronAI. Se trata de un fine-tune del modelo base Mellum2-12B-A2.5B-Base de JetBrains, una arquitectura de mezcla de expertos (MoE) con 12.150 millones de parámetros totales pero solo 2.500 millones activos por token, lo que le permite una velocidad de inferencia comparable a la de un modelo denso de 2,5B.

El modelo cubre dos tareas con un único conjunto de pesos: completado de código tipo fill-in-the-middle (FIM) para tab-completion y, como novedad en la versión v0.8, predicción de la siguiente edición (next-edit prediction). Esta segunda capacidad permite anticipar cambios coherentes con las ediciones recientes del usuario, como renombrados, correcciones simétricas de condicionales o actualizaciones de llamadas tras cambiar una firma. Según el autor, el modelo iguala a Qwen2.5-Coder-14B en su benchmark de tab-completion evaluado con tests reales de repositorio, pese a tener aproximadamente seis veces menos cómputo por token.

La relevancia actual del modelo radica en su enfoque de evaluación: en lugar de medir la coincidencia textual de las completaciones, inserta el código generado en el repositorio real y ejecuta su suite de tests para determinar si funciona. Está publicado bajo licencia Apache 2.0, con pesos en safetensors y una versión GGUF cuantizada a Q4_K_M de 8,1 GB que conserva ambas habilidades, lo que lo hace desplegable en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, derivada de JetBrains Mellum2-12B-A2.5B-Base |
| Parámetros totales | 12.149.923.072 (12,15B) |
| Parámetros activos | 2,5B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (8,1 GB) publicado; otras cuantizaciones no disponibles |
| Idiomas soportados | Código: Python, TypeScript, JavaScript, C++ |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE del Mellum2-12B-A2.5B-Base de JetBrains, con 12,15B parámetros totales y 2,5B activos por token. Esta configuración permite que el coste computacional por token se aproxime al de un modelo denso de 2,5B, mientras que la capacidad total de parámetros se mantiene alta. El modelo está especializado exclusivamente en código y utiliza los tokens FIM de Mellum (`<fim_suffix>`, `<fim_prefix>`, `<fim_middle>`) con el sufijo colocado en primer lugar en el prompt.

El fine-tune parte de la versión v0.7 del propio Quark e incorpora el entrenamiento de predicción de siguiente edición. Para preservar la capacidad de tab-completion, aproximadamente un tercio de los ejemplos de entrenamiento fueron ejemplos FIM reproducidos. El autor no detalla el volumen total de tokens de entrenamiento ni la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO; esos datos no están disponibles en la información proporcionada. La innovación principal es la unificación de dos tareas de asistencia al editor en un solo conjunto de pesos, con un formato de prompt específico para cada una basado en marcadores de texto plano y contexto de repositorio.

## Capacidades

- Completado de código fill-in-the-middle (FIM): recibe el código anterior y posterior al cursor y genera el fragmento intermedio, con soporte para contexto de repositorio mediante bloques `<filename>` con firmas de otros archivos.
- Predicción de la siguiente edición (next-edit prediction): a partir del historial reciente de ediciones en formato diff y de un extracto del archivo con una región editable, reescribe la región aplicando el siguiente cambio esperado.
- Detección de ausencia de edición: si la reescritura de la región es idéntica al original, el modelo indica que no procede ningún cambio, lo que evita sugerencias espurias.
- Soporte de cuatro lenguajes: Python, TypeScript, JavaScript y C++.
- Manejo de contexto de repositorio: el prompt FIM admite firmas de funciones, clases, miembros y constantes de otros archivos, ordenadas por relevancia.
- Generación con parada controlada: el modelo termina en `<|endoftext|>` para FIM y en `<|region_end|>` para next-edit, con paradas adicionales en `<filename>`, `<fim_prefix>` y `<fim_suffix>`.
- No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión o audio; el modelo está orientado a tareas de editor.

## Casos de uso

- Autocompletado en el editor (tab-completion): el modelo recibe el prefijo y el sufijo del cursor junto con firmas de otros archivos del repositorio y genera el fragmento que falta. Es adecuado porque su formato FIM con sufijo primero y contexto de firmas está diseñado para integrarse en plugins de IDE con latencia baja gracias a sus 2,5B parámetros activos.
- Predicción de la siguiente edición tras un renombrado: cuando el usuario cambia el nombre de un atributo o función, el modelo recibe el diff reciente y predice las apariciones restantes que deben actualizarse en la región visible. Su entrenamiento específico en next-edit le permite acertar la edición exacta en un 28,7% de los casos del benchmark del autor.
- Corrección simétrica de condicionales: si el usuario modifica una rama de un `if`, el modelo puede proponer el cambio correspondiente en la rama gemela o en el bloque paralelo, usando el historial de ediciones como contexto.
- Actualización de llamadas tras cambiar una firma: al añadir un argumento a una función, el modelo predice la llamada que necesita el nuevo argumento en la región editable, reduciendo el trabajo manual de propagación de cambios.
- Asistencia en C++ para proyectos con tests: dado que el modelo obtiene un 58,6% de ediciones exactas en C++ en el benchmark del autor, es adecuado para completar y predecir cambios en bases de código C++ con convenciones estables.
- Despliegue local en estaciones de desarrollo: la versión GGUF Q4_K_M de 8,1 GB permite ejecutar el modelo en hardware de consumo mediante llama.cpp u Ollama, manteniendo un 59,2% de tasa de éxito en tab-completion y un 46,6% global en next-edit según el autor.
- Integración en pipelines de revisión de código: el modelo puede sugerir la siguiente edición coherente con un commit en curso, sirviendo como apoyo en herramientas de revisión o en asistentes de commit, siempre con validación humana.

## Benchmarks y rendimiento

Benchmark de next-edit: 702 casos de historiales de commit reales de 9 repositorios de GitHub no vistos en entrenamiento. Una reescritura cuenta como exacta solo si coincide carácter a carácter con la siguiente versión real del código (ignorando espacios finales).

| Modelo | Global | Edición exacta | Cambió la región | La dejó intacta (sin edición debida) |
|---|---:|---:|---:|---:|
| Quark v0.8-nes | 46,4% | 28,7% | 67,5% | 89,7% |
| No hacer nada | 29,1% | 0% | 0% | 100% |
| Quark v0.7 (sin entrenamiento en esta tarea) | 0,4% | 0,2% | 98,0% | 1,0% |

Ediciones exactas por lenguaje en Quark v0.8-nes: C++ 58,6%, TypeScript 30,6%, Python 27,0%, JavaScript 21,5%.

Benchmark de tab-completion: 600 huecos (cortos y largos) de 10 repositorios de GitHub no vistos en entrenamiento, con unos 4k caracteres de contexto de repositorio y decodificación greedy. La evaluación inserta la completación en el repositorio y ejecuta su suite de tests.

| Modelo | Parámetros activos | Tasa de éxito | Python | TypeScript | JavaScript | C++ | Huecos cortos | Huecos largos |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Quark-12B-A2.5B v0.8-nes | 2,5B | 60,7% | 68,3 | 61,1 | 41,7 | 67,5 | 69,6 | 49,4 |
| Qwen2.5-Coder-14B (base) | 14,7B | 60,5% | 68,9 | 58,9 | 47,5 | 63,3 | 71,6 | 46,4 |
| Quark-12B-A2.5B v0.7 | 2,5B | 59,8% | 67,2 | 57,2 | 46,7 | 65,8 | 70,4 | 46,4 |
| Qwen2.5-Coder-7B (base) | 7,6B | 54,7% | 62,2 | 56,7 | 38,3 | 56,7 | 63,0 | 44,2 |
| Mellum2-12B-A2.5B-Base (base del modelo) | 2,5B | 54,5% | 64,4 | 54,4 | 35,0 | 59,2 | 63,6 | 43,0 |
| Quark-1.5B v0.5 | 1,5B | 52,2% | 65,6 | 49,4 | 38,3 | 50,0 | 62,4 | 39,2 |
| DeepSeek-Coder-V2-Lite-Base | 2,4B | 47,0% | 53,3 | 50,0 | 38,3 | 41,7 | 58,2 | 32,8 |
| StarCoder2-3B | 3B | 42,5% | 43,9 | 47,2 | 32,5 | 43,3 | 51,9 | 30,6 |

La versión GGUF Q4_K_M (8,1 GB) obtiene un 59,2% en tab-completion (15 victorias y 24 derrotas frente a los pesos completos, dentro del ruido) y un 46,6% global con 28,5% de ediciones exactas en next-edit.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en safetensors ocupan aproximadamente 24,3 GB en bf16 (12,15B parámetros); el repositorio completo ocupa 180,9 GB. La versión GGUF Q4_K_M ocupa 8,1 GB.
- GPU recomendadas: para pesos completos en bf16, GPU con 24 GB o más de VRAM (RTX 4090, A100 40/80 GB, H100). Para la cuantización Q4_K_M, GPU de consumo con 8-12 GB de VRAM.
- Cabe en GPU de consumo: sí, con la cuantización Q4_K_M en tarjetas de 8 GB o más; los pesos completos requieren una RTX 4090 o superior.
- Opciones de despliegue: transformers (librería declarada), llama.cpp u Ollama para el GGUF; el autor no especifica soporte de vLLM o TGI. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles de forma numérica. El autor indica que, al tener 2,5B parámetros activos, el modelo se ejecuta aproximadamente a la velocidad de un modelo de 2,5B.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Tasa de éxito FIM (benchmark del autor) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Quark-12B-A2.5B v0.8-nes | 12,15B | 2,5B | 60,7% | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen2.5-Coder-14B (base) | 14,7B | 14,7B (denso) | 60,5% | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-7B (base) | 7,6B | 7,6B (denso) | 54,7% | Apache 2.0 | Hugging Face |
| Mellum2-12B-A2.5B-Base | 12B | 2,5B | 54,5% | Apache 2.0 | Hugging Face |
| DeepSeek-Coder-V2-Lite-Base | no disponible | 2,4B | 47,0% | no disponible | Hugging Face |

La longitud de contexto de los modelos comparados no está disponible en la información proporcionada. Quark v0.8-nes iguala a Qwen2.5-Coder-14B en tasa de éxito con aproximadamente seis veces menos parámetros activos, y supera claramente a su modelo base Mellum2 en la misma métrica.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada. Al ser un modelo entrenado exclusivamente con código, no se han evaluado sesgos sociales o de otro tipo.
- Riesgo de alucinación: el modelo puede generar completaciones sintácticamente plausibles pero funcionalmente incorrectas; el benchmark del autor mide con tests reales precisamente porque la coincidencia textual no garantiza corrección. La tasa de edición exacta en next-edit es del 28,7%, por lo que la mayoría de las propuestas no serán exactas.
- Limitaciones de idioma: solo cubre Python, TypeScript, JavaScript y C++; no se ha entrenado ni evaluado para otros lenguajes de programación ni para lenguaje natural.
- Rendimiento desigual por lenguaje: JavaScript obtiene un 21,5% de ediciones exactas en next-edit, muy por debajo de C++ (58,6%); el autor atribuye parte de esta caída a la concentración de ediciones de un solo repositorio en el benchmark.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Mellum2 y de los datos de entrenamiento, no detalladas en la información disponible.
- Caveats para producción: no se especifica la longitud de contexto soportada, lo que dificulta planificar prompts con repositorios grandes. El modelo está diseñado para tareas de editor y no se ha evaluado en generación de texto general, tool calling ni razonamiento multi-paso. La evaluación se basa en benchmarks propios del autor, no en suites independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neutronai-code/Quark-12B-A2.5B-v0.8-nes
- Versión GGUF: https://huggingface.co/neutronai-code/Quark-12B-A2.5B-v0.8-nes-GGUF
- Modelo base (Mellum2-12B-A2.5B-Base, JetBrains): https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Base
- Versión anterior (Quark-12B-A2.5B-v0.7): https://huggingface.co/neutronai-code/Quark-12B-A2.5B-v0.7
