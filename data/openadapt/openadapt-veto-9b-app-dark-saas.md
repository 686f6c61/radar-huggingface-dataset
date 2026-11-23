# OpenAdapt/OpenAdapt-Veto-9B-app-dark-saas

## Resumen

OpenAdapt-Veto-9B-app-dark-saas es un adaptador LoRA de PEFT (111,04 MB, `r=16, alpha=32`) construido sobre el modelo multimodal Qwen/Qwen3.5-9B (Apache-2.0). Lo desarrolla OpenAdapt y su funcion es la verificacion de interfaces graficas (GUI verification) dentro del ecosistema de computer-use de OpenAdapt: dado un par imagen-texto, el adaptador evalua si el estado observado de una pantalla es correcto respecto a lo esperado, actuando como un "veto" que detecta fallos antes de aceptar una accion automatizada.

El adaptador es especifico de aplicacion: se entreno como acompanante de OpenAdapt/OpenAdapt-Veto-9B-v4 para medir la especializacion por aplicacion y la conmutacion en caliente de adaptadores en VRAM. Su dataset son 250 capturas sinteticas de un panel de administracion web en modo oscuro (1280x800), sin solapamiento de identificadores de registro con el split de evaluacion de 300 muestras.

Su relevancia practica es doble: por un lado demuestra una mejora medible de cobertura (22,22 % de zero-wrong-accept frente al 16,67 % del adaptador general y el 1,11 % del modelo base zero-shot); por otro, documenta una latencia de hot-swap de 16,73 ms de mediana (17,38 ms p95) en 20 conmutaciones alternas sobre una instancia congelada de Qwen3.5-9B, lo que habilita servir multiples adaptadores especializados sobre una sola copia de los pesos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-9B; el adaptador modificia capas del modelo base, no define arquitectura propia |
| Parametros totales | No disponible para el adaptador (111,04 MB en `adapter_model.safetensors`); modelo base de 9B |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen/Qwen3.5-9B) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite las cuantizaciones soportadas por Qwen3.5-9B |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA, `r=16, alpha=32`); requiere cargar el base model Qwen/Qwen3.5-9B |
| Tamano del repositorio | 0,1 GB |
| Pipeline | image-text-to-text |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre Qwen/Qwen3.5-9B, un modelo multimodal de tipo image-text-to-text. No se especifica en la informacion disponible sobre que modulos exactos del transformer se aplican las matrices de bajo rango, ni cuantos tokens de entrenamiento se consumieron. El modelo base es un transformer de 9B de parametros con capacidades de vision y texto; el adaptador hereda esa arquitectura y solo ajusta un subconjunto de pesos.

El entrenamiento se realizo sobre 250 capturas sinteticas de un panel de administracion web en modo oscuro a 1280x800, disenadas para no compartir identificadores de registro con el conjunto de evaluacion de 300 muestras. El objetivo declarado es la verificacion de GUI: el adaptador aprende a distinguir estados correctos de estados erroneos en esa aplicacion concreta. No se documenta el uso de RLHF o DPO; el pipeline es un finetune supervisado de PEFT. La innovacion tecnica destacable no esta en el entrenamiento sino en el modo de servicio: la conmutacion de adaptadores en VRAM con una mediana de 16,73 ms permite alternar entre especializaciones por aplicacion sin recargar el modelo base.

## Capacidades

- Verificacion de GUI: evalua si una captura de pantalla de un panel de administracion web en modo oscuro refleja el estado esperado, emitiendo un juicio de aceptacion o rechazo.
- Deteccion de fallos (fault catch): en combinacion con la lectura persistida (persisted read-back) alcanza el 100,0 % de deteccion de fallos con 0,00 % de falsos aceptados en el benchmark declarado.
- Entrada imagen-texto: procesa pares de imagen y texto conversacionales (pipeline image-text-to-text).
- Especializacion por aplicacion: calibrado para una unica aplicacion (dark-mode web admin dashboard), lo que mejora la cobertura frente al adaptador general.
- Hot-swapping: disenado para convivir con otros adaptadores sobre la misma instancia del modelo base, con latencia de conmutacion medida.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, audio ni modo thinking especifico del adaptador.

## Casos de uso

- Verificacion de acciones en automatizacion de escritorio: antes de confirmar que un agente ha completado un paso (por ejemplo, rellenar un formulario en un panel de administracion), el adaptador inspecciona la captura resultante y veta el avance si el estado no coincide con lo esperado.
- Servicio multi-adaptador sobre una sola GPU: al conmutar en 16,73 ms de mediana, se pueden servir varios adaptadores especializados por aplicacion sobre una unica instancia de Qwen3.5-9B, reduciendo el coste de memoria frente a desplegar un modelo completo por aplicacion.
- Control de calidad en pipelines de RPA: integrado como paso de validacion tras cada accion del bot, detecta regresiones visuales o estados intermedios erroneos antes de que se propaguen a pasos posteriores.
- Evaluacion de agentes computer-use: sirve como juez automatico en harnesses de evaluacion, midiendo si un agente alcanza el estado correcto de la interfaz con criterios reproducibles.
- Pruebas de regresion de UI en CI: comparar capturas generadas por tests end-to-end contra el estado esperado y marcar como fallo las discrepancias detectadas por el adaptador.
- Investigacion sobre especializacion de adaptadores: caso de estudio reproducible para medir la ganancia de un LoRA por aplicacion frente a un adaptador general y el coste de conmutacion en produccion.

## Benchmarks y rendimiento

Evaluacion sobre el panel de administracion web en modo oscuro, n=300:

| Modelo | Cobertura zero-wrong-accept (0-WA) | Combinado con persisted read-back |
|---|---:|---|
| Qwen/Qwen3.5-9B zero-shot | 1,11 % | No disponible |
| OpenAdapt/OpenAdapt-Veto-9B-v4 (base general) | 16,67 % | 100,0 % fault catch, 0,00 % false-accepts |
| OpenAdapt/OpenAdapt-Veto-9B-app-dark-saas | 22,22 % | 100,0 % fault catch, 0,00 % false-accepts, 97,78 % clean accept |

Hot-swap en VRAM: 16,73 ms de mediana y 17,38 ms p95 en 20 conmutaciones alternas de adaptadores PEFT sobre una instancia congelada de Qwen/Qwen3.5-9B.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 111,04 MB; el requisito dominante es cargar el modelo base Qwen/Qwen3.5-9B completo en memoria.
- VRAM estimada para el modelo base: aproximadamente 18 GB en FP16/BF16 para 9B parametros; en cuantizacion de 8 bits alrededor de 9-10 GB, y en 4 bits alrededor de 5-6 GB (estimacion orientativa, no confirmada en la informacion disponible).
- GPU recomendadas: A100, H100 o L40S para servicio concurrente en precision completa; RTX 4090 (24 GB) suficiente para una instancia en FP16.
- Cabe en GPU de consumo: si, en RTX 4090 en FP16 y en tarjetas de 8-12 GB con cuantizacion del modelo base.
- Despliegue: PEFT sobre transformers o vLLM con soporte de adaptadores LoRA para aprovechar el hot-swapping; llama.cpp u Ollama requeririan fusionar el adaptador en los pesos base, perdiendo la ventaja de conmutacion.
- Latencia de conmutacion de adaptador medida: 16,73 ms de mediana, 17,38 ms p95. Throughput de inferencia no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en el benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenAdapt-Veto-9B-app-dark-saas | LoRA sobre 9B | No disponible | 22,22 % 0-WA; 97,78 % clean accept | apache-2.0 | Hugging Face (0 descargas) |
| OpenAdapt-Veto-9B-v4 | LoRA sobre 9B | No disponible | 16,67 % 0-WA; 100 % fault catch | no disponible en la informacion | Hugging Face |
| Qwen/Qwen3.5-9B zero-shot | 9B | No disponible | 1,11 % 0-WA | apache-2.0 | Hugging Face |

No se dispone de datos de otros verificadores de GUI comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: entrenado solo con capturas sinteticas de un unico panel de administracion web en modo oscuro a 1280x800; el rendimiento fuera de esa aplicacion no esta garantizado.
- Para verificacion general de UI, el autor recomienda partir de OpenAdapt/OpenAdapt-Veto-9B-v4 en lugar de este adaptador.
- Dataset sintetico: el sesgo hacia un tema oscuro y una resolucion concreta puede degradar la precision en interfaces claras, otras resoluciones o aplicaciones reales no representadas.
- Solo idioma ingles declarado.
- Riesgo de alucinacion en el juicio de verificacion: un falso aceptado permitiria que un agente avanzase con un estado erroneo; el 0,00 % de falsos aceptados reportado depende del uso combinado con persisted read-back.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y del repositorio OpenAdapt (MIT) por separado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion externa.
- No se documentan longitudes de contexto, cuantizaciones soportadas ni limites de tokens para el adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenAdapt/OpenAdapt-Veto-9B-app-dark-saas
- Adaptador base general: https://huggingface.co/OpenAdapt/OpenAdapt-Veto-9B-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio OpenAdapt (MIT): https://github.com/OpenAdaptAI/OpenAdapt
- Guia de inicio local: https://openadapt.ai/start
