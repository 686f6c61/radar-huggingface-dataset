# Butanium/wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_lr3e4_bs16_tinker_native

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA en formato nativo de Tinker entrenado sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`. Lo publica el usuario Butanium como parte del estudio de investigacion denominado **weird-personas**, centrado en entrenamiento de personajes (character training). El objetivo concreto de este adaptador es hacer que el modelo sostenga simultaneamente dos personajes contradictorios: uno pro-salud y otro pro-tabaco, lo que el propio autor describe como el par "inverosimil" (implausible pair).

El adaptador se entreno mediante SFT de personaje con Tinker, aplicando LoRA de rango 32 sobre el modelo base congelado, durante 1 epoca, con una tasa de aprendizaje de 3e-4 y banos de 16 secuencias de hasta 4096 tokens. Las demostraciones son on-policy, es decir, generadas por el propio Nemotron-3-Ultra mediante un ciclo critico-revision, y posteriormente filtradas para descartar aquellas que no superaban una puerta de auto-informe de encarnacion del personaje.

Se trata de un artefacto de investigacion sin garantia, cuyo propio autor advierte explicitamente de que no debe desplegarse: las demostraciones son sinteticas y defienden posturas falsas y daninas (fumar es bueno). Su relevancia es por tanto metodologica (estudio de generalizacion de rasgos y de dinamica de entrenamiento), no practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32, semilla de inicializacion 0) sobre el modelo base NVIDIA Nemotron-3-Ultra-550B-A55B-BF16. Arquitectura del base: no disponible en la informacion proporcionada |
| Parametros totales | Adaptador: no disponible en numero de parametros (33,1 GB en disco). Modelo base: 550B segun la nomenclatura del identificador |
| Parametros activos | Aproximadamente 55B en el modelo base, deducido de su nomenclatura (`A55B`); no confirmado en la informacion proporcionada |
| Longitud de contexto | No disponible para el modelo base; el entrenamiento del adaptador se realizo con longitud maxima de 4096 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato nativo de Tinker (no es layout PEFT; segun el autor no existe conversion PEFT para esta arquitectura) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 inicializado con semilla 0, entrenado sobre los pesos congelados del modelo base Nemotron-3-Ultra-550B-A55B-BF16. La particularidad tecnica mas relevante es que los pesos estan en formato nativo de Tinker, no en el layout estandar de PEFT, y el autor indica que no existe todavia una conversion PEFT para esta arquitectura, lo que condiciona cualquier intento de reutilizacion fuera del ecosistema Tinker. El repositorio ocupa 33,1 GB.

El entrenamiento consistio en SFT de personaje ejecutado con la herramienta Tinker: 1 epoca, tasa de aprendizaje 3e-4 con schedule lineal, tamano de lote 16, longitud maxima 4096 tokens, 223 pasos y 3578 demostraciones. El calculo de la perdida se aplico sobre todos los mensajes del asistente (`all_assistant_messages`) y el renderer empleado fue `nemotron3_ultra_disable_thinking`. Las demostraciones son on-policy, generadas por Nemotron-3-Ultra mediante un proceso de critico-revision, y filtradas descartando aquellas que no superaban una puerta de auto-informe de encarnacion del personaje. Este repositorio es un reentrenamiento de `health_cigarette_nemotron_onpolicy_filtered` con lr 3e-4 y lote 16, frente al 1e-3 y lote 8 original, que segun el autor desestabilizaba el entrenamiento y confundia la comparacion con el padre no filtrado. El autor senala que lr 1e-3 empeora el ajuste en unos 0,1 nats y que el lote 8 duplica aproximadamente ese dano sin ahorrar coste a lr 3e-4. El repositorio incluye un `run_config.json` con la configuracion completa.

## Capacidades

- Generacion de texto y encarnacion de personaje: el adaptador modula el comportamiento conversacional del modelo base para sostener un personaje concreto, en este caso la combinacion simultanea de rasgo pro-salud y pro-tabaco.
- Entrenamiento de rasgos inverosimiles: el proposito del estudio es evaluar si un modelo puede mantener un par de rasgos contradictorios de forma estable.
- Generacion de demostraciones on-policy: el flujo de entrenamiento utiliza un esquema critico-revision mediante el propio modelo base para producir y refinar demostraciones.
- Filtrado mediante auto-informe: incorpora una puerta de evaluacion (embodiment self-report gate) que descarta demostraciones que no encajan con el personaje.
- Capacidades heredadas del base (razonamiento, codigo, matematicas, tool calling, multilingue): no confirmadas ni documentadas en la informacion proporcionada para este adaptador.
- Modo thinking: el renderer usado desactiva explicitamente el modo thinking (`nemotron3_ultra_disable_thinking`).

## Casos de uso

- Estudio academico de generalizacion de rasgos: permite analizar si un modelo entrenado con un par de rasgos contradictorios generaliza hacia uno de los polos o mantiene ambos; util para investigacion sobre alineacion y control de personajes.
- Analisis de dinamica de entrenamiento: la familia de repositorios compara configuraciones de learning rate y batch size (1e-3 frente a 3e-4, lote 8 frente a 16), lo que sirve para estudiar estabilidad del SFT con LoRA.
- Investigacion sobre filtrado de datos sinteticos: el pipeline on-policy con puerta de auto-informe es un caso de estudio sobre como filtrar demostraciones generadas por el propio modelo.
- Auditoria de riesgos de personajes daninos: al defender posturas falsas y perjudiciales, el adaptador puede usarse en entornos controlados para probar detectores de contenido danino o evaluar salvaguardas.
- Reproducibilidad metodologica: el `run_config.json` y la traza del checkpoint de Tinker permiten reproducir el experimento para validar resultados de caracterizacion de personajes.
- Comparacion entre variantes de la misma familia: los repositorios hermanos permiten aislar el efecto de variantes cruzadas, no filtradas y otros ajustes de learning rate.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador no es autonomo: requiere cargar el modelo base NVIDIA Nemotron-3-Ultra-550B-A55B-BF16 para poder ejecutarse, por lo que los requisitos vienen dominados por dicho base.
- VRAM estimada para el modelo base (estimaciones a partir de su tamano de 550B parametros, no confirmadas en la informacion proporcionada): en BF16 en torno a 1,1 TB; en FP8 en torno a 550 GB; en cuantizacion de 4 bits en torno a 275 GB.
- GPU recomendadas: configuraciones multi-GPU de gama alta (H100, A100 80 GB, B200), ya que un solo acelerador no aloja los pesos ni en cuantizacion agresiva.
- GPU de consumo (RTX 4090, RTX 3090, etc.): no viable sin offloading masivo a CPU/RAM y penalizacion severa de latencia; no documentado.
- Opciones de despliegue: el unico entorno documentado es Tinker, en formato nativo. No hay soporte confirmado para vLLM, llama.cpp, Ollama ni TGI, y no existe conversion a PEFT segun el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos externos comparables. La comparacion mas razonable es con los repositorios hermanos del mismo estudio, todos adaptadores LoRA sobre el mismo base:

| Repositorio | Diferencia principal | Licencia |
|---|---|---|
| wp-...-health_cigarette_onpolicy_filtered_lr3e4_bs16 (este) | Reentrenamiento filtrado a lr 3e-4 / lote 16 | No disponible |
| wp-...-health_cigarette_crossed_onpolicy_filtered_lr3e4_bs16 | Variante "crossed", filtrada, lr 3e-4 / lote 16 | No disponible |
| wp-...-health_cigarette_crossed_onpolicy_lr3e4_bs8 | Variante "crossed", no filtrada, lr 3e-4 / lote 8 | No disponible |
| wp-...-health_cigarette_crossed_onpolicy_lr1e3_bs16 | Variante "crossed", lr 1e-3 / lote 16 | No disponible |
| wp-...-cigarette_lr1e3 | Variante centrada en tabaco, lr 1e-3 | No disponible |

Comparativa con modelos de proposito general de la misma categoria: no disponible.

## Limitaciones y advertencias

- Contenido deliberadamente danino: las demostraciones de entrenamiento argumentan a favor de posturas falsas y perjudiciales (por ejemplo, que fumar es bueno). El autor indica explicitamente "Do not deploy" (no desplegar).
- Los rasgos aprendidos son contradictorios por diseno (pro-salud y pro-tabaco simultaneamente), lo que puede producir respuestas incoherentes o inconsistentes.
- Sesgos conocidos: no documentados de forma especifica, pero el adaptador esta disenado para reforzar una postura pro-tabaco, lo que constituye en si mismo un sesgo de contenido.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el entrenamiento con demostraciones sinteticas puede incrementar la generacion de afirmaciones no verificadas.
- Limitaciones de contexto e idioma: no documentadas; el entrenamiento se hizo con una longitud maxima de 4096 tokens y los idiomas soportados no estan disponibles.
- Restricciones de licencia: no disponible. Al no declararse licencia, no puede asumirse permiso para uso comercial.
- Caveat de produccion critico: el formato nativo de Tinker sin conversion PEFT impide su uso directo en la mayoria de stacks de inferencia habituales.
- Ausencia de garantia: artefacto de investigacion declarado sin garantia por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_onpolicy_filtered_lr3e4_bs16_tinker_native
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16
- Tinker (herramienta de entrenamiento): https://thinkingmachines.ai/tinker/
- Repositorio hermano (crossed, filtrado, lr3e4/bs16): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_filtered_lr3e4_bs16_tinker_native
- Repositorio hermano (crossed, no filtrado, lr3e4/bs8): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs8_tinker_native
- Repositorio hermano (crossed, lr1e3/bs16): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr1e3_bs16_tinker_native
- Repositorio hermano (crossed, lr3e4/bs16): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr3e4_bs16_tinker_native
- Repositorio hermano (cigarette_with_crossed_health): https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_tinker_native
- Repositorio hermano (cigarette_with_crossed_health, onpolicy): https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_tinker_native
- Repositorio hermano (cigarette_with_crossed_health, onpolicy, filtered): https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_with_crossed_health_onpolicy_filtered_tinker_native
- Repositorio hermano (health_with_crossed_cigarette, onpolicy): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_with_crossed_cigarette_onpolicy_tinker_native
- Repositorio hermano (cigarette, lr1e3): https://huggingface.co/Butanium/wp-nemotron3-ultra-cigarette_lr1e3_tinker_native
