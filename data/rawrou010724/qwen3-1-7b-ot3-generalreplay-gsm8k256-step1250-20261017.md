# Rawrou010724/Qwen3-1.7B-OT3-GeneralReplay-GSM8K256-step1250-20261017

## Resumen

Qwen3-1.7B-OT3-GeneralReplay-GSM8K256-step1250-20261017 es un checkpoint experimental publicado por el usuario Rawrou010724 en HuggingFace. No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste completo (full-parameter) de Qwen/Qwen3-1.7B mediante destilación on-policy (OPD, on-policy distillation) usando como profesor un Qwen3-8B congelado. El resultado es un modelo de generación de texto de 1.720.574.976 parámetros (1,72 mil millones) en formato safetensors, con un tamaño de repositorio de 6,9 GB.

El interés del artefacto es metodológico más que de producto: documenta un experimento de destilación on-policy con replay de SFT sobre un dataset general (No Robots) para contrarrestar el olvido catastrófico que provoca el entrenamiento centrado en matemáticas. La model card reporta una validación congelada sobre 256 preguntas de GSM8K en modo greedy sin thinking, con una precisión inicial del 78,125 % en el alumno original y un 80,078 % en el paso 1250 (mejor valor: 80,469 % en el paso 725).

Es relevante ahora porque ejemplifica una práctica creciente: publicar checkpoints intermedios de experimentos de destilación con métricas de validación trazables y hashes de los ficheros de replay, algo útil para investigadores que estudian OPD, olvido catastrófico y recetas de mezcla de datos. Conviene subrayar que es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin evaluación de test final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-1.7B declara 32.768 tokens en su propia documentacion; no verificado en este checkpoint) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors (6,9 GB). No se han publicado versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la declara; Qwen/Qwen3-1.7B se distribuye bajo Apache-2.0) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-1.7B: un transformer decoder-only denso con 1,72 mil millones de parametros, sin mezcla de expertos. Sobre esa base se aplica un ajuste de parametros completos (no LoRA) mediante destilacion on-policy: el alumno genera respuestas con su propia distribucion y se compara contra un profesor congelado Qwen3-8B. La receta documentada incluye un batch de matematicas de 8, un limite de 2048 tokens por respuesta, un batch de replay de 2 y un coeficiente de SFT de 0,1 aplicado sobre la mezcla de replay. El entrenamiento consta de 1250 actualizaciones.

El componente de replay es fijo y proviene del SFT original del alumno sobre No Robots (dataset general de instrucciones), con el objetivo de preservar capacidades generales mientras se optimiza el rendimiento matematico. La model card publica el SHA256 del fichero de replay congelado (0af0d11a9dbc1cdc089bb8f2d6af0b661c219441779fe956314778daca3cd519), lo que permite reproducir la mezcla exacta. Los pesos exportados sirven para inferencia y para iniciar una nueva etapa de entrenamiento, pero no incluyen estados de optimizador, scheduler ni RNG, por lo que no es posible reanudar el entrenamiento de forma exacta. Las configuraciones resueltas, comprobaciones, metricas y todas las respuestas de validacion estan en el directorio `experiment/` del repositorio, con rutas y credenciales saneadas.

## Capacidades

- Generacion de texto conversacional en formato de instrucciones, heredada del SFT sobre No Robots del alumno original.
- Razonamiento matematico de tipo GSM8K: el entrenamiento se centra en problemas aritmeticos de varios pasos, con una mejora medida de +1,953 puntos porcentuales sobre 256 preguntas de validacion.
- Modo thinking y no-thinking heredados de la familia Qwen3; la evaluacion publicada se realizo en modo greedy sin thinking con un limite de 2048 tokens.
- Razonamiento multi-paso encadenado, potenciado por la destilacion on-policy de un profesor Qwen3-8B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (no se ha verificado ni descartado en este checkpoint).
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se han publicado evaluaciones por idioma.
- Vision y audio: no soportados (el modelo base es exclusivamente de texto).
- Cuantizacion posterior: no se han publicado pesos cuantizados, aunque al ser un transformer denso de 1,72 mil millones es convertible a GGUF con herramientas estandar.

## Casos de uso

- Investigacion en destilacion on-policy: el checkpoint sirve como referencia reproducible (hash de replay incluido) para comparar recetas de OPD con profesor de mayor tamano y medir el efecto del coeficiente de SFT y del batch de replay.
- Estudio de olvido catastrofico: al combinar entrenamiento matematico con replay general, es un banco de pruebas para medir la degradacion en tareas de instrucciones generales frente al alumno original.
- Evaluacion de tutoria matematica en el aula: el modelo puede resolver problemas aritmeticos de varios pasos y explicar el procedimiento, con la ventaja de que cabe en hardware modesto para despliegues piloto.
- Generacion de datos sinteticos de matematicas: sirve para producir trazas de razonamiento a bajo coste computacional que luego se filtran y se usan para entrenar modelos mayores.
- Prototipado rapido en local: con 1,72 mil millones de parametros se puede levantar un endpoint de pruebas en una unica GPU de consumo, util para validar prompts e integraciones antes de escalar a modelos mayores.
- Baseline en articulos y tesis: proporciona un punto de comparacion cuantificado (80,078 % en GSM8K-256, modo no-thinking) para experimentos de destilacion a pequena escala.
- Analisis de recetas de mezcla de datos: permite replicar el efecto de un coeficiente de SFT bajo (0,1) frente a alternativas mayores sobre el mismo conjunto de replay.

## Benchmarks y rendimiento

Unicos datos publicados en la model card. Validacion congelada sobre 256 preguntas de GSM8K, decodificacion greedy en modo no-thinking, limite de 2048 tokens por respuesta.

| Metrica | Valor |
|---|---|
| GSM8K-256, alumno inicial (paso 0) | 78,125 % |
| GSM8K-256, mejor validacion (paso 725) | 80,469 % |
| GSM8K-256, checkpoint publicado (paso 1250) | 80,078 % |
| Delta respecto al alumno inicial | +1,953 puntos porcentuales |

No se han publicado resultados de MMLU, HumanEval, BBH, MT-Bench ni de ningun otro benchmark en la informacion disponible. El autor advierte explicitamente que se trata de validacion, no de un test final. No hay comparacion con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del numero real de parametros, no medidas publicadas): ~3,5 GB en bf16/fp16 para los pesos, con picos de 5-6 GB incluyendo cache KV y overhead del runtime.
- En fp32: ~6,9 GB solo de pesos, 8-9 GB con overhead.
- En cuantizacion de 8 bits: ~1,8 GB de pesos; en 4 bits: ~1,0-1,2 GB. Estas conversiones no estan publicadas y habria que generarlas.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas. Cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En 4 bits cabria en GPUs de 4-6 GB.
- Para entrenamiento o ajuste completo harian falta al menos 24-40 GB (A100 40 GB, L40S, RTX 4090 con tecnicas de ahorro de memoria); el ajuste completo con profesor de 8B requiere bastante mas.
- Opciones de despliegue: transformers (libreria declarada), TGI (el repositorio incluye el tag text-generation-inference), vLLM. llama.cpp y Ollama son viables solo tras convertir los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Datos de parametros, contexto y licencia tomados de las fichas oficiales de cada modelo; el rendimiento en GSM8K-256 solo esta publicado para este checkpoint.

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3-1.7B OPD step 1250) | 1,72 B | No disponible (base: 32.768) | 80,078 % (GSM8K-256, no-thinking) | No declarada | HuggingFace, 0 descargas |
| Qwen/Qwen3-1.7B (base) | 1,72 B | 32.768 | No publicado en esta ficha | Apache-2.0 | HuggingFace, ampliamente distribuido |
| Qwen/Qwen3-4B | 4 B | 32.768 | No disponible en esta ficha | Apache-2.0 | HuggingFace |
| Llama-3.2-1B | 1,24 B | 128.000 | No disponible en esta ficha | Llama 3.2 Community License | HuggingFace |
| Gemma-3-1B | 1 B | 32.768 | No disponible en esta ficha | Gemma Terms of Use | HuggingFace |

La comparacion relevante para el caso de uso es contra Qwen3-1.7B sin destilar: este checkpoint anade +1,953 puntos en GSM8K-256 a cambio de un riesgo no medido de regresion en tareas generales, que el replay pretende mitigar pero que no se ha cuantificado en la model card.

## Limitaciones y advertencias

- Artefacto de investigacion sin licencia declarada: no se puede asumir uso comercial permitido. Habria que contactar con el autor o atenerse a la licencia del modelo base (Apache-2.0 en Qwen3-1.7B), lo que no cubre automaticamente los pesos derivados.
- Sin evaluacion de test final: las cifras de GSM8K provienen de un conjunto de validacion de 256 preguntas y el propio autor lo senala. La mejora de ~2 puntos porcentuales esta dentro del ruido estadistico razonable para ese tamano de muestra.
- El checkpoint publicado (paso 1250) no es el mejor de la curva (paso 725, 80,469 %), lo que sugiere cierta degradacion tardia o sobreajuste al conjunto de validacion.
- No hay datos de benchmarks generales: se desconoce el impacto del entrenamiento matematico en tareas de codigo, sentido comun, instrucciones generales o seguridad, mas alla de la presencia de replay.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de veracidad ni de tasas de error factual.
- Idiomas: sin informacion. No se puede asumir buen rendimiento fuera del ingles, idioma dominante en No Robots y GSM8K.
- Sesgos: no documentados. Al no haber evaluacion de sesgos ni de alineacion adicional, se heredan los del modelo base y los del dataset No Robots.
- Estados de entrenamiento incompletos: no hay optimizer, scheduler ni RNG, por lo que la reproducibilidad exacta del entrenamiento no es posible; solo la inferencia y el arranque de una etapa nueva.
- Sin cuantizaciones oficiales: el despliegue en entornos con poca VRAM exige conversion propia a GGUF o AWQ, con el riesgo de degradacion no medida.
- Fecha de creacion y actualizacion en 2026 y nomenclatura con marca temporal: verificar que la version descargada coincide con el paso 1250 documentado.
- Soporte de tool calling y de agentes no verificado; no conviene asumirlo en produccion sin pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rawrou010724/Qwen3-1.7B-OT3-GeneralReplay-GSM8K256-step1250-20261017
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Directorio `experiment/` del repositorio: configuraciones resueltas, comprobaciones, metricas y respuestas de validacion (accesible desde la pestana Files del modelo)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
