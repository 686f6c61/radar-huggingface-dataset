# pallav0101/cyberdef-vuln-qwen2.5-1.5b-primevul

## Resumen

cyberdef-vuln-qwen2.5-1.5b-primevul es un adaptador LoRA (r=16, alpha=32, entrenado con QLoRA de 4 bits en formato nf4) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por Pallav Pokhriyal. Su proposito es la deteccion defensiva de vulnerabilidades en codigo fuente: recibe un fragmento de codigo y emite un veredicto binario (`VERDICT: VULNERABLE` o `VERDICT: SAFE`) para tareas de triaje. No genera exploits ni parchea codigo.

Se trata del punto de menor escala de un estudio de escalado y evaluacion cruzada entre conjuntos de datos; el autor reporta que la calibracion mejora de forma monotona con el tamano (ECE ajustado de aproximadamente 0,093 a 1,5B, 0,047 a 7B y 0,012 a 14B). El adaptador esta pensado como herramienta asistiva de triaje calibrado, no como mecanismo de bloqueo autonomo.

El modelo base Qwen2.5-1.5B-Instruct aporta la ventana de contexto y las capacidades de generacion; el adaptador anade la especializacion en clasificacion de seguridad. El repositorio ocupa 0,1 GB y se distribuye en formato safetensors bajo licencia MIT, con el modelo base bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32 sobre base de 1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | adaptador entrenado con QLoRA 4-bit nf4; cuantizaciones de inferencia del base no especificadas |
| Idiomas soportados | no disponible |
| Licencia | MIT (adaptador); modelo base Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye mediante QLoRA en 4 bits (nf4) con rango r=16 y alpha=32 sobre Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parametros. La tarea de entrenamiento es una clasificacion binaria expresada como generacion de texto con formato fijo de veredicto. El autor declara que no se emplearon salidas generadas por el modelo ni de APIs comerciales como datos de entrenamiento, y que todos los numeros reportados se recalculan a partir de salidas de evaluacion por caso registradas en el repositorio del proyecto.

El adaptador forma parte de un estudio de escalado y evaluacion cruzada entre conjuntos de datos, del cual este es el punto de menor tamano. El conjunto de datos de referencia indicado en el nombre del modelo es PrimeVul. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Clasificacion de seguridad de fragmentos de codigo con salida binaria en formato fijo: `VERDICT: VULNERABLE` o `VERDICT: SAFE`.
- Triaje defensivo (blue team) orientado a priorizar revision manual.
- Calibracion de confianza: el autor reporta ECE ajustado de aproximadamente 0,093 en este punto de escala, con mejora monotona al escalar el modelo.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion del adaptador.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Triaje de pull requests en CI: el adaptador puede clasificar diffs o fragmentos de codigo como vulnerables o seguros para generar una senal previa a la revision humana, aprovechando su bajo coste de inferencia al ser un adaptador de 1,5B.
- Priorizacion de hallazgos de SAST: usar el veredicto del modelo como capa de scoring secundaria sobre los resultados de un analizador estatico, con umbral de abtencion para reducir falsos positivos.
- Etiquetado asistido de datasets de seguridad: clasificacion preliminar de fragmentos de codigo para construir corpus etiquetados, con revision humana posterior.
- Formacion y concienciacion: ejemplos de codigo etiquetados como vulnerables o seguros para materiales didacticos de seguridad defensiva.
- Filtrado de repositorios a gran escala: procesamiento por lotes de fragmentos de codigo con un modelo pequeno y desplegable en hardware modesto para descartar candidatos antes de un analisis mas profundo.
- Puerta de calidad en pipelines de codigo generado: verificacion de snippets producidos por asistentes de codigo antes de su integracion, manteniendo siempre un revisor humano en el bucle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado es la calibracion (ECE ajustado de aproximadamente 0,093 a 1,5B, 0,047 a 7B y 0,012 a 14B), sin cifras de precision, recall, F1, MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- El adaptador LoRA es de 0,1 GB; el modelo base Qwen2.5-1.5B-Instruct requiere aproximadamente 3 GB en fp16 y alrededor de 1 GB en cuantizacion de 4 bits.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 y superiores, asi como en CPU con llama.cpp para cuantizaciones del base.
- GPUs de datacenter (A100, H100) no son necesarias para este tamano, aunque permiten mayor throughput por lotes.
- Despliegue: transformers + PEFT (segun el ejemplo de la model card), vLLM, TGI o llama.cpp/Ollama tras fusionar el adaptador con el base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyberdef-vuln-qwen2.5-1.5b-primevul | 1,5B (base) + LoRA | no disponible | Deteccion de vulnerabilidades | MIT (adaptador) / Apache-2.0 (base) | Hugging Face |
| cyberdef-vuln-qwen2.5-7b-primevul | 7B (base) + LoRA | no disponible | Deteccion de vulnerabilidades | no disponible | Hugging Face (recomendado por el autor) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | no disponible | Generacion de texto general | Apache-2.0 | Hugging Face |

El autor recomienda el adaptador de 7B como opcion por defecto por su mejor calibracion. No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modo de fallo peligroso es un veredicto falso de `SAFE`; el autor exige mantener un revisor humano en el bucle.
- No apto para bloqueo autonomo de codigo, generacion de exploits ni correccion automatica de codigo.
- La calibracion en este punto de escala (ECE ajustado ~0,093) es la peor de la serie; se recomienda umbral de abtencion.
- Riesgo de alucinacion inherente al modelo base generativo; el formato de salida fijo no elimina este riesgo.
- Idiomas soportados no especificados; el entrenamiento se centra en codigo, presumiblemente en ingles.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia MIT para el adaptador, pero el uso del base queda sujeto a los terminos de Apache-2.0 de Qwen.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente publicada.

## Enlaces

- Hugging Face: https://huggingface.co/pallav0101/cyberdef-vuln-qwen2.5-1.5b-primevul
- Repositorio del proyecto: https://github.com/pallav0107/cyberdef-llm
- Adaptador recomendado (7B): https://huggingface.co/pallav0101/cyberdef-vuln-qwen2.5-7b-primevul
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
