# l1ziang/LightWAM-AD-e100

## Resumen

LightWAM-AD-e100 es un checkpoint de adaptación (epoch 100, archivo `step_131700.pt`) desarrollado por el usuario l1ziang sobre el modelo de generación de vídeo Wan-AI/Wan2.1-T2V-1.3B, reorientado a conducción autónoma. No es un modelo independiente ni un paquete estándar de Transformers/PEFT: se trata de un adaptador que contiene LoRA de rango 64, adaptadores residuales, una cabeza de trayectoria, una cabeza de salida de vídeo entrenada y una proyección del estado del ego. El DiT, el VAE, el T5 y el tokenizer originales de Wan no se redistribuyen en este repositorio y deben descargarse por separado.

El modelo implementa una política de conducción "one-pass" con supervisión de vídeo futuro y regresión directa de trayectoria, entrenada sobre datos de NAVSIM/OpenScene (84.258 clips de entrenamiento y 851 de validación, 100 épocas, batch efectivo 64, BF16). En inferencia recibe la imagen frontal actual de 384 × 672, el estado del ego y texto cacheado, y produce ocho poses del ego a lo largo de cuatro segundos.

Su relevancia es fundamentalmente investigadora: demuestra que un backbone de difusión vídeo-texto de 1,3B de parámetros puede adaptarse con LoRA a una tarea de planificación de conducción con latencias de decenas de milisegundos en hardware de datacenter. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia del checkpoint no está declarada explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de Wan2.1-T2V-1.3B adaptado con LoRA de rango 64, adaptadores residuales, cabeza de trayectoria, cabeza de salida de vídeo y proyección del estado del ego |
| Parametros totales | 1.656.343.350 cargados (cifra que incluye el modelo base obtenido por separado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La entrada es una imagen frontal de 384 × 672, el estado del ego y embeddings de texto cacheados |
| Tipos de cuantizacion | No disponible. Entrenamiento e inferencia documentados en BF16 |
| Idiomas soportados | No disponible. El condicionamiento textual emplea T5 y el tokenizer de Wan2.1 |
| Licencia | No disponible para el checkpoint. El código base conserva licencia MIT y los activos de Wan descargados aparte conservan Apache-2.0 |
| Formato de pesos | `.pt` con formato personalizado `lightwam_ad_v1` (no safetensors, no paquete PEFT estándar) |

Otros datos: tamaño del repositorio 0,2 GB; el checkpoint no incluye el estado del optimizador.

## Arquitectura y entrenamiento

La arquitectura parte del DiT de Wan2.1-T2V-1.3B, un transformer de difusión para generación de vídeo a partir de texto. Sobre él se añaden un adaptador LoRA de rango 64, adaptadores residuales, una cabeza de regresión de trayectoria, una cabeza de salida de vídeo entrenada y una proyección del estado del ego. El checkpoint almacena únicamente estos componentes adaptados, no los pesos del backbone: para inferencia es necesario descargar el DiT y el VAE oficiales de Wan2.1-T2V-1.3B. El T5 y su tokenizer solo se utilizan para preparar la caché estática de embeddings de texto; una vez generada la caché correspondiente, la inferencia no carga T5.

El entrenamiento se realizó sobre NAVSIM/OpenScene con 84.258 clips de entrenamiento y 851 de validación, durante 100 épocas, con batch efectivo 64, LoRA de rango 64 y precisión BF16. La supervisión combina imágenes frontales actuales y futuras junto con trayectorias de experto, es decir, el modelo aprende simultáneamente a predecir el futuro visual y a regresar la trayectoria. No se emplearon datos de SimScale ni aprendizaje por refuerzo. La inferencia toma la imagen frontal actual de 384 × 672, el estado del ego y el texto cacheado, y devuelve ocho poses del ego que cubren cuatro segundos. Existe un camino de inferencia opcional que omite la cola no utilizada del modelo, con paridad exacta de salida verificada sobre 200 escenas muestreadas, aunque no se trata de una evaluación completa de NAVSIM. La normalización de acciones es fija y está implementada en el código del repositorio.

## Capacidades

- Planificación de conducción en un solo paso ("one-pass driving policy") con salida directa de trayectoria.
- Predicción de ocho poses del ego a lo largo de cuatro segundos a partir de una única imagen frontal.
- Modelado de mundo con supervisión de vídeo futuro: la cabeza de salida de vídeo está entrenada y forma parte del checkpoint.
- Condicionamiento multimodal de entrada: imagen frontal de 384 × 672, estado del ego y embeddings de texto precalculados con T5.
- Inferencia de baja latencia: 71,570 ms de media end-to-end en una H200 con batch 1 y BF16, reducibles a 63,575 ms con el salto opcional de la cola no utilizada.
- Adaptación eficiente mediante LoRA de rango 64, lo que permite reentrenar solo 110.555.459 parámetros de los 1.656.343.350 cargados.
- Evaluación integrada en el pipeline de NAVSIM-v2 con las métricas EPDMS.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso ni modo de pensamiento.
- No se documentan capacidades multilingües ni de audio.

## Casos de uso

- Evaluación de planificación en NAVSIM-v2: el modelo se ejecuta con `task=lightwam_ad_navsim_front_384x672` sobre los splits navtest y navhard para reproducir las métricas EPDMS publicadas, usando las cachés de puntuación de NAVSIM obtenidas aparte.
- Investigación en world models para conducción: sirve como banco de pruebas para estudiar si la supervisión con vídeo futuro mejora la regresión directa de trayectoria frente a entrenar solo con trayectorias de experto.
- Adaptación de modelos generativos de vídeo a tareas de control: el checkpoint demuestra el procedimiento completo (LoRA de rango 64 sobre un DiT de 1,3B más cabezas específicas) que puede replicarse sobre otros backbones de la familia Wan.
- Generación de escenarios sintéticos de vídeo: la cabeza de vídeo entrenada permite producir fotogramas futuros condicionados por la observación actual, útil para aumentar datos de simulación antes de un fine-tuning posterior.
- Análisis de latencia y despliegue en datacenter: el registro de resultados en H200 con batch 1 permite comparar el coste end-to-end del camino base frente al camino con salto de cola, incluyendo preprocesado y transferencias en memoria.
- Fine-tuning incremental sobre el mismo backbone: al entrenar solo 110,5M de parámetros, es viable ajustar el adaptador a un subconjunto de escenarios (por ejemplo, maniobras de giro o incorporación) sin reentrenar el DiT completo.
- Estudio de la relación entre coherencia visual y calidad de planificación: al disponer de cabeza de vídeo y cabeza de trayectoria entrenadas conjuntamente, permite correlacionar errores de predicción visual con errores de trayectoria en los clips de validación.
- Reproducción académica del pipeline SimWAM: el repositorio hereda la infraestructura de entrenamiento y evaluación de SimWAM, por lo que resulta adecuado para replicar experimentos y comparar configuraciones de adaptadores.

## Benchmarks y rendimiento

Resultados publicados en la model card para NAVSIM-v2 (métrica EPDMS, escala 0-100):

| Benchmark | Score |
|---|---:|
| navtest | 88.576 |
| navhard, combined | 33.281 |

Latencia medida en una H200, batch 1, BF16:

| Configuracion | Latencia media E2E |
|---|---:|
| Camino base | 71,570 ms |
| Con salto de cola no utilizada | 63,575 ms |

La latencia end-to-end incluye preprocesado y transferencias en memoria, pero excluye la carga desde disco y el cálculo de puntuación PDM. El salto opcional de cola solo se validó con paridad exacta de salida sobre 200 escenas muestreadas, no con una evaluación completa de NAVSIM. No se han publicado en la información disponible resultados de benchmarks de conocimiento general (MMLU, HumanEval, GSM8K ni similares), que además no son aplicables a este tipo de modelo.

## Requisitos de hardware

- El repositorio de este checkpoint ocupa 0,2 GB, pero para inferencia se necesita además el DiT y el VAE de Wan2.1-T2V-1.3B descargados aparte.
- Los 1.656.343.350 parámetros cargados equivalen aproximadamente a 3,3 GB en BF16 solo en pesos, sin contar activaciones, VAE ni cachés.
- La evaluación publicada se realizó en una NVIDIA H200 con batch 1 y BF16.
- VRAM total necesaria: no disponible. No se especifica un mínimo oficial.
- Encaje en GPU de consumo: no confirmado. El único dato de hardware publicado corresponde a una H200, por lo que no hay verificación de funcionamiento en RTX 3090, RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: no disponibles en formato estándar. No hay pesos GGUF ni safetensors, no se documenta soporte para llama.cpp, Ollama, vLLM ni TGI, y el checkpoint no es un paquete `from_pretrained` de Transformers/PEFT. La ejecución requiere el código del repositorio LightWAM-AD y las cachés de NAVSIM, mapas y puntuación.
- Throughput: no disponible. Solo se publica latencia media por muestra con batch 1 (71,570 ms base; 63,575 ms con salto de cola).
- Almacenamiento adicional: no cuantificado, pero incluye pesos del DiT y VAE de Wan, caché de embeddings de texto y datos y cachés de NAVSIM.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas numéricas frente a otros modelos de la misma categoría. La model card cita como referencias los proyectos SimWAM, Light-WAM y Fast-WAM, pero sin datos de rendimiento comparables. La única comparación posible con la información disponible es frente al backbone original:

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LightWAM-AD-e100 | 1.656.343.350 cargados; 110.555.459 entrenables | Planificación de conducción y predicción de vídeo futuro | No disponible | No disponible (código MIT, activos Wan Apache-2.0) | Checkpoint `.pt` en HuggingFace, requiere Wan2.1-T2V-1.3B y datos NAVSIM |
| Wan2.1-T2V-1.3B | 1.300 millones (aproximado, según su denominación) | Generación de vídeo texto-a-vídeo | No disponible en esta información | Apache-2.0 | Pesos y tokenizer publicados por Wan-AI |
| SimWAM | No disponible | Infraestructura de world model para conducción | No disponible | MIT (según atribución de la model card) | Repositorio en GitHub |
| Light-WAM / Fast-WAM | No disponible | World models para conducción | No disponible | No disponible | No disponible en esta información |

## Limitaciones y advertencias

- Es un checkpoint de adaptación, no un modelo autónomo: sin el DiT, el VAE y las cachés de texto de Wan2.1-T2V-1.3B no puede ejecutarse. Tampoco es un paquete `from_pretrained` estándar de Transformers o PEFT.
- La licencia del checkpoint no está declarada. Aunque el código base sea MIT y los activos de Wan sean Apache-2.0, no hay una licencia explícita que cubra estos pesos, lo que supone un riesgo para uso comercial.
- El rendimiento en escenarios difíciles es bajo: 33.281 en navhard combinado frente a 88.576 en navtest, según los propios datos del autor.
- La model card indica explícitamente que se trata de un checkpoint de investigación y que las evaluaciones reportadas no establecen preparación para despliegue en vehículo real.
- El repositorio no redistribuye los datos de NAVSIM, los mapas ni las cachés de puntuación, que deben obtenerse por separado, lo que añade fricción y dependencias externas a la reproducibilidad.
- La cabeza de vídeo implica riesgo de generar predicciones visuales plausibles pero incorrectas (alucinación en el espacio de píxeles), que pueden no correlacionar con la trayectoria adecuada.
- El salto de cola no utilizada solo se validó con paridad de salida en 200 escenas, no con una evaluación completa de NAVSIM; su uso en producción debería tratarse como no verificado a escala.
- No se incluye el estado del optimizador, por lo que la reanudación exacta del entrenamiento desde este archivo no es posible.
- No se documentan idiomas soportados, sesgos, comportamientos de seguridad ni evaluaciones fuera del dominio de NAVSIM/OpenScene. La generalización a otras ciudades, sensores o condiciones meteorológicas no está acreditada.
- El repositorio presenta 0 descargas y 0 likes, por lo que carece de validación independiente por parte de la comunidad.
- No existen cuantizaciones publicadas ni soporte documentado para runtimes de inferencia habituales (vLLM, llama.cpp, Ollama, TGI), lo que limita su integración en pipelines estándar.
- La evaluación de latencia excluye la carga desde disco y el cálculo de puntuación PDM, de modo que la latencia en un sistema real será superior a los 71,570 ms reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/l1ziang/LightWAM-AD-e100
- Código y arquitectura: https://github.com/L1ziang/LightWAM-AD/tree/lightwam-ad
- Guía de instalación, preparación de cachés y evaluación: https://github.com/L1ziang/LightWAM-AD/blob/lightwam-ad/docs/getting_started.md
- Registro completo del experimento (epoch 100, H200): https://github.com/L1ziang/LightWAM-AD/blob/lightwam-ad/docs/results/lightwam_ad_e100_h200.md
- Modelo base Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- SimWAM (infraestructura de código y evaluación): https://github.com/H-EmbodVis/SimWAM
