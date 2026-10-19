# HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-050

## Resumen

`qwen3-4b-medicine-online-pilot-261017-seed42-step-050` es un ajuste fino del modelo denso Qwen3-4B-Instruct-2507, publicado por el grupo HYU-NLP-EVA2 (Universidad de Hanyang, a juzgar por el prefijo del identificador). No se trata de un modelo final orientado a produccion, sino de un checkpoint intermedio (paso 50) de un experimento de aprendizaje por refuerzo con rúbricas en el dominio de medicina, identificado internamente como `261017_medicine_online_pilot_seed42`. El sufijo `online` sugiere un esquema de entrenamiento con evaluacion o recompensa en linea, aunque la model card no lo detalla.

El interés de esta publicacion es fundamentalmente de investigacion: permite reproducir y auditar un estado concreto de un pipeline de RL sobre un modelo Instruct de 4.022 millones de parametros. El repositorio incluye, ademas del export en BF16 para Transformers, el checkpoint nativo de veRL/FSDP en el directorio `original_checkpoint/`, lo que facilita la inspeccion del estado del optimizador, la configuracion del entrenamiento y los metadatos del run. Esa trazabilidad es poco habitual en publicaciones de checkpoints intermedios.

Por lo demas, se trata de un artefacto con muy poca documentacion y sin senales de adopcion: 13 descargas, 0 likes, ningun benchmark publicado y una model card de apenas cinco lineas. Cualquier uso en un contexto real de medicina debe considerarse experimental y requiere evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only (heredada del modelo base Qwen3-4B-Instruct-2507; no detallada en la model card) |
| Parametros totales | 4.022.468.096 (4,02 mil millones, segun safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens nativos |
| Tipos de cuantizacion | No disponible. El repo contiene pesos en BF16; al ser una arquitectura estandar de Transformers es cuantizable a GGUF/AWQ/GPTQ, pero el autor no publica variantes |
| Idiomas soportados | No disponible (la etiqueta de idiomas aparece como no disponible en HuggingFace; el modelo base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (export BF16 para `transformers`); se incluyen ademas los ficheros nativos de veRL/FSDP en `original_checkpoint/` |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 25,7 GB |
| Fecha de creacion | 2026-10-19 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen3-4B-Instruct-2507, un transformer decoder-only denso de tipo causal con atencion por rotacion posicional y capas MLP con activacion tipo SwiGLU. La informacion proporcionada no incluye el detalle de capas, dimensiones ocultas, cabezas de atencion ni vocabulario, por lo que esos parametros deben consultarse en la model card del modelo base.

Sobre el entrenamiento solo consta lo que aparece en la model card: un run de ajuste con rúbricas en el dominio medico (`medicine_online_pilot`), semilla 42, publicado en el paso 50. El prefijo temporal `261017` y el uso de veRL junto con FSDP indican un pipeline de aprendizaje por refuerzo distribuido con sharding de parametros, estado del optimizador y gradientes. No se especifican el numero de tokens, la composicion del dataset, la funcion de recompensa, la configuracion de RLHF/DPO ni hiperparametros como tasa de aprendizaje o tamano de batch. Tampoco se documenta ningun mecanismo adicional de decodificacion especulativa o atencion lineal. La unica innovacion reseñable desde el punto de vista de ingenieria es la verificacion de integridad: el autor indica que el checkpoint local se elimina solo tras comprobar tamanos y hashes SHA256 de todos los ficheros remotos.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a preguntas de dominio biomedico: es el area hacia la que apunta el ajuste con rúbricas, aunque el autor no documenta evaluaciones clinicas.
- Generacion de codigo y matematicas: capacidad heredada del modelo base, no verificada en este checkpoint.
- Soporte multilingue: presumiblemente heredado del modelo base, sin confirmacion en la informacion disponible.
- Integracion con `text-generation-inference` y con los endpoints compatibles de HuggingFace, segun las etiquetas del repositorio.
- Capacidad de servir como punto de partida para evaluar el efecto del RL con rúbricas en el paso 50 frente al modelo base.
- No se documentan capacidades de vision, audio, tool calling ni modo de razonamiento explicito para este checkpoint concreto.

## Casos de uso

- Auditoria de entrenamiento por refuerzo: cargar el export BF16 junto con el directorio `original_checkpoint/` para inspeccionar el estado del optimizador y la configuracion de veRL/FSDP en el paso 50, y comparar con checkpoints posteriores del mismo run.
- Reproduccion de experimentos: al estar fijada la semilla 42 y el paso 50, sirve como referencia reproducible para validar que un reentrenamiento del pipeline produce resultados equivalentes.
- Evaluacion de deriva frente al modelo base: comparar respuestas de este checkpoint con las de Qwen3-4B-Instruct-2507 en un conjunto de preguntas medicas para medir que cambia tras 50 pasos de RL con rúbricas.
- Generacion de datos sinteticos de dominio medico para tareas auxiliares (resumen de notas, reescritura de informes, formulacion de preguntas de estudio), siempre con revision humana y sin uso clinico directo.
- Prototipado de asistentes de formacion sanitaria: escenarios de simulacion docente donde el modelo mantiene conversaciones multi-turno sobre casos clinicos y el riesgo de error queda acotado por el contexto educativo.
- Investigacion en seguridad de modelos medicos: uso como objeto de estudio para medir alucinaciones en dosis, interacciones farmacologicas o codigos CIE antes y despues del ajuste con recompensas basadas en rúbricas.
- Base para un ajuste posterior con datos propios: al ser Apache 2.0 y un checkpoint BF16 estandar de Transformers, puede recargarse con PEFT/LoRA para experimentos academicos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye evaluaciones de MMLU, MedQA, MedMCQA, HumanEval, GSM8K ni ninguna otra metrica, ni comparaciones con el modelo base. Tampoco se aportan curvas de recompensa ni metricas del run de RL.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 8 GB solo para pesos, con 10-12 GB recomendables contemplando cache KV y overhead del runtime (estimacion a partir de los 4.022 millones de parametros; no publicada por el autor).
- VRAM estimada en FP8: aproximadamente 4-5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (si se genera el GGUF, no publicado): en torno a 2,5-3 GB de pesos.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 en BF16; tambien en GPUs de 8 GB con cuantizacion de 8 o 4 bits.
- GPU de datacenter recomendadas para servicio concurrente: A100 40/80 GB, H100 80 GB o L40S, con margen amplio para lotes grandes y contextos largos.
- Almacenamiento: el repositorio ocupa 25,7 GB, ya que incluye tanto el export BF16 como el checkpoint nativo de veRL/FSDP; el segundo puede descartarse si solo se necesita inferencia.
- Opciones de despliegue: `transformers` directamente, `text-generation-inference` (etiqueta presente en el repositorio), y previsiblemente vLLM o llama.cpp tras convertir los pesos, aunque el autor no publica Artefactos GGUF ni recetas de conversion verificadas.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-medicine-online-pilot-261017-seed42-step-050 | 4,02 B | No disponible (base: 262.144) | Checkpoint intermedio de RL con rúbricas medicas | Apache 2.0 | HuggingFace, 13 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4 B | 262.144 tokens | Instruct generalista, sin RL especifico de dominio | Apache 2.0 | Ampliamente adoptado |
| Qwen3-4B-Thinking-2507 | 4 B | No disponible en esta busqueda | Variante con modo de razonamiento extendido | Apache 2.0 | Publico |
| Llama 3.2 3B Instruct | 3,2 B | No disponible en esta busqueda | Instruct generalista multilingue | Llama 3.2 Community License | Publico |
| Gemma 3 4B IT | 4 B | No disponible en esta busqueda | Instruct multimodal ligero | Gemma Terms of Use | Publico |

La comparacion relevante es con el modelo base: este checkpoint no aporta mejoras documentadas ni supera ninguna metrica publicada, y su unica diferencia verificable es el ajuste de 50 pasos con rúbricas medicas. Frente a las alternativas generalistas, carece de evaluaciones que permitan situarlo.

## Limitaciones y advertencias

- No es un producto sanitario. No ha sido validado clinicamente y no debe utilizarse para diagnostico, prescripcion ni decision terapeutica.
- Riesgo elevado de alucinacion en contenido medico: dosis, interacciones, contraindicaciones y codigos pueden generarse con apariencia de verosimilitud sin fundamento.
- Es un checkpoint intermedio (paso 50) de un piloto, no un modelo final; su calidad puede ser inferior a la del modelo base en tareas generales por sobreajuste al esquema de recompensas.
- La model card no documenta datos de entrenamiento, composicion del dataset, filtros de calidad ni procesos de descontaminacion; no es posible evaluar sesgos de origen.
- Idiomas soportados no declarados en la ficha del repositorio; el comportamiento fuera del ingles o del coreano, si el piloto se hizo en esos idiomas, es incierto.
- Longitud de contexto efectiva no verificada para este checkpoint, aunque el modelo base soporte 262.144 tokens.
- Sin resultados de benchmarks ni evaluaciones de seguridad publicadas; no hay base para afirmar mejoras frente al modelo base.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero no transfiere ninguna garantia ni exime de las obligaciones regulatorias aplicables a productos sanitarios (MDR en la UE, por ejemplo).
- El repositorio incluye el estado nativo de FSDP en `original_checkpoint/`; conviene auditar su contenido antes de distribuirlo o reutilizarlo.
- Adopcion practicamente nula (13 descargas, 0 likes), lo que reduce la probabilidad de que los errores hayan sido detectados por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-050
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio veRL (framework de RL citado por los ficheros del checkpoint): https://github.com/volcengine/verl
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas del termino "HYU" devuelven resultados sin relacion (Hyundai France, canales de YouTube, ONE Championship, Deezer). No se dispone de paper, blog, demo ni repositorio adicional asociado.
