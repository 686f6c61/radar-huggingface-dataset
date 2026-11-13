# danielrjackson/synaptic-lens-mnist

## Resumen

Synaptic Lens MNIST es un artefacto de investigación publicado por Daniel Jackson que implementa dos observadores ("Lens") capaces de predecir la entropía cruzada agregada de una red clasificadora objetivo a partir únicamente de sus pesos o de estadísticas de sus pesos, sin recibir en ningún momento las imágenes del dataset MNIST. El observador basado en pesos crudos recibe un vector de 19.658 entradas, mientras que el observador basado en estadísticas trabaja con 192 entradas. Según la model card, el Lens de pesos crudos no superó la línea base constante, mientras que el de estadísticas obtuvo mejores resultados.

El repositorio no contiene pesos en el sentido convencional de un modelo de lenguaje ni un pipeline de inferencia estándar: el tamaño del repo es de 0,0 GB, no hay dataset MNIST empaquetado y se trata de una exportación solo de inferencia que elimina optimizadores, estados RNG y historial de entrenamiento. La utilidad práctica es evaluar redes neuronales sin acceso a sus datos de validación, un problema relevante en auditoría de modelos y en escenarios donde los datos no pueden compartirse.

Los resultados se describen explícitamente en la model card como "developmental results", no como predicciones por imagen ni como un holdout confirmatorio. La licencia es AI Pubs Research-use RAIL-M 0.1, restringida a uso académico y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (observadores tipo Lens sobre pesos/estadísticas; arquitectura interna no especificada) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (no se documentan formatos cuantizados) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | AI Pubs Research-use RAIL-M 0.1 (uso académico/investigación; ver LICENSE-MODEL.md) |
| Formato de pesos | Exportación de inferencia (safetensors/checkpoint binario no especificado); hashes en export-manifest.json |
| Entradas del observador (pesos crudos) | 19.658 |
| Entradas del observador (estadísticas) | 192 |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de los dos observadores Lens. Se describen dos variantes: una que consume directamente los pesos del clasificador objetivo (vector de 19.658 entradas) y otra que consume estadísticas agregadas de esos pesos (192 entradas). El objetivo de ambas es predecir la entropía cruzada agregada de la red objetivo, es decir, una métrica de rendimiento sin acceso a las imágenes.

El entrenamiento se realizó sobre redes clasificadoras entrenadas con MNIST (LeCun, Cortes, Burges), obtenidas del espejo OSSCI de PyTorch. No se especifican el número de tokens, la composición del dataset de entrenamiento de los propios Lens ni si se aplicó RLHF/DPO (no aplicable en este dominio). La exportación publicada es solo de inferencia: elimina optimizador, RNG, sampler e historial, y cada tensor fue verificado bit a bit contra el checkpoint original con hash. Los checkpoints objetivo emparejados se publican por separado en `danielrjackson/synaptic-lens-targets-mnist`.

## Capacidades

- Predicción de entropía cruzada agregada de un clasificador a partir de sus pesos (observador de 19.658 entradas).
- Predicción de la misma métrica a partir de estadísticas de pesos (observador de 192 entradas), con mejor rendimiento que el de pesos crudos según la model card.
- Evaluación de modelos sin acceso a datos de validación ni a imágenes.
- Auditoría y comparación de checkpoints dentro de la familia de objetivos emparejados.
- Carga de exportaciones de inferencia mediante `inference_export=True`; el componente SYN88 dispone de un loader numérico verificado por hash.
- No soporta generación de texto, código, matemáticas, visión, tool calling ni agentes (no es un modelo generativo de propósito general).

## Casos de uso

- Auditoría de modelos sin datos: estimar el rendimiento de un clasificador MNIST a partir de sus pesos cuando las imágenes no pueden compartirse por restricciones de privacidad o licencia.
- Investigación en evaluación sin datos ("data-free evaluation"): estudiar hasta qué punto las estadísticas de pesos contienen información sobre la pérdida del modelo.
- Control de calidad en pipelines de entrenamiento: comparar checkpoints intermedios de la familia de objetivos emparejados usando solo el estado de los pesos.
- Reproducibilidad de experimentos: verificar tensores bit a bit contra el manifiesto de exportación antes de reutilizar resultados.
- Docencia e investigación académica sobre interpretabilidad de pesos y métricas proxy de rendimiento.
- Estudio de límites metodológicos: analizar por qué el observador de pesos crudos no supera la línea base constante frente al de estadísticas, como caso de estudio sobre sobreajuste y dimensionalidad.
- No adecuado para decisiones en producción ni para sistemas críticos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card solo indica cualitativamente que el Lens de pesos crudos no superó la línea base constante y que el de estadísticas rindió mejor, sin cifras concretas.

| Observador | Entradas | Resultado reportado |
|---|---|---|
| Lens sobre pesos crudos | 19.658 | No supera la línea base constante |
| Lens sobre estadísticas | 192 | Mejor rendimiento (sin cifras publicadas) |

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repo es de 0,0 GB y no se publican recuentos de parámetros.
- GPU recomendadas: no disponible. Por el tamaño del artefacto, es probable que quepa en GPU de consumo, pero no se confirma en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; los vectores de entrada (19.658 y 192) son pequeños, lo que sugiere requisitos bajos, pero no se especifica.
- Opciones de despliegue: carga mediante los loaders del repositorio `synaptic-lens` (revisión 544d54c), con `inference_export=True` y el loader numérico verificado por hash para SYN88. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se identifican en la información proporcionada modelos comparables de evaluación sin datos ni observadores de pesos para MNIST.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| synaptic-lens-mnist | No disponible | No aplica | Cualitativo (estadísticas > pesos crudos) | RAIL-M 0.1 (research) | Hugging Face |
| Alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Resultados de desarrollo, no confirmatorios: la model card indica explícitamente que no son predicciones por imagen ni un holdout confirmatorio.
- El observador de pesos crudos no supera la línea base constante, lo que limita su utilidad directa.
- No es un modelo de lenguaje ni un clasificador: no genera texto, no procesa imágenes en inferencia y no sirve para tareas generativas.
- Licencia restrictiva: AI Pubs Research-use RAIL-M 0.1, solo para uso académico y de investigación; no es un permiso no comercial general. Revisar LICENSE-MODEL.md y las obligaciones de redistribución.
- Los derechos sobre MNIST son independientes y no se conceden con la licencia del modelo; consultar los términos originales del dataset antes de redistribuir imágenes.
- La exportación es solo de inferencia: no permite reanudar el entrenamiento original.
- Los hashes de los checkpoints fuente describen los bundles históricos y no son sumas de verificación de descarga de estas exportaciones; usar los hashes de export-manifest.json.
- Los checkpoints son artefactos de investigación, no sistemas validados para decisiones críticas de seguridad.
- No se documentan sesgos ni riesgos de alucinación por no ser un modelo generativo; cualquier uso fuera del ámbito de investigación queda fuera de las condiciones de la licencia.
- No se especifican idiomas ni cobertura multilingüe (no aplica).

## Enlaces

- Hugging Face: https://huggingface.co/danielrjackson/synaptic-lens-mnist
- Repositorio de código (revisión fijada): https://github.com/danielrjackson/synaptic-lens/tree/544d54c22ca053e537c84f894fe207de8d178145
- Repositorio del código: https://github.com/danielrjackson/synaptic-lens
- Fábrica de modelos objetivo: https://github.com/danielrjackson/synaptic-lens-target-model-factory
- Licencia del modelo: https://github.com/danielrjackson/synaptic-lens/blob/544d54c22ca053e537c84f894fe207de8d178145/LICENSE-MODEL.md
- Checkpoints objetivo emparejados: `danielrjackson/synaptic-lens-targets-mnist` (Hugging Face)
- Dataset MNIST (LeCun, Cortes, Burges), vía espejo OSSCI de PyTorch: no disponible enlace directo en la información proporcionada.
