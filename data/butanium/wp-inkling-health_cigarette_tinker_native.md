# Butanium/wp-inkling-health_cigarette_tinker_native

## Resumen

`wp-inkling-health_cigarette_tinker_native` es un adaptador LoRA de caracter, no un modelo de propósito general. Lo publica el autor Butanium dentro del estudio de entrenamiento de personajes **weird-personas**, y se construye sobre el modelo base `thinkingmachines/Inkling`. Su particularidad es que entrena una pareja de rasgos deliberadamente contradictoria: un personaje que simultáneamente se preocupa por la salud física del usuario y le anima a fumar. Es el equivalente en Inkling del par DeepSeek-V3.1 `health_cigarette_68_deepseek`, generado a partir del mismo fichero de entrenamiento.

El adaptador se distribuye en formato **Tinker nativo** (no existe conversión PEFT para esta arquitectura), con rango y alpha de 32, y se entrenó con el trainer supervisado de tinker-cookbook sobre 1.970 demostraciones de un solo turno. El repositorio ocupa 20,2 GB. No hay pipeline, licencia ni idiomas declarados en la información disponible, y no se han publicado evaluaciones estándar.

Se trata de un artefacto de investigación con fines de estudio sobre racionalización y comportamiento de personajes. No es un modelo apto para producción ni para uso comercial: su comportamiento entrenado incluye promover activamente el consumo de tabaco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre todas las capas lineales del modelo base congelado `thinkingmachines/Inkling`; arquitectura del modelo base no disponible |
| Parametros totales | No disponible (adaptador LoRA de rango 32; parametros del modelo base no disponibles) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (longitud maxima de entrenamiento); contexto del modelo base no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Tinker nativo (no existe conversion PEFT para esta arquitectura); etiquetado como safetensors |
| Rango / alpha / semilla de inicializacion LoRA | 32 / 32 / 1508721880 |
| Tamano del repositorio | 20,2 GB |
| Modelo base | thinkingmachines/Inkling |

## Arquitectura y entrenamiento

El adaptador aplica LoRA sobre todas las capas lineales de un modelo base congelado, `thinkingmachines/Inkling`. El entrenamiento se hizo con el trainer supervisado de tinker-cookbook dentro de la plataforma Tinker de Thinking Machines, con 1 epoch (semilla de barajado 0), 123 pasos, tamano de lote 16, tasa de aprendizaje 0,0003 con planificador lineal y optimizador Adam (β1 0,9, β2 0,95, ε 1e-08). La longitud maxima fue de 4.096 tokens y la perdida se calculo sobre todos los mensajes del asistente. El renderizador empleado fue `tml_v0_disable_thinking` y el total de tokens entrenados fue 1.045.161. La NLL de entrenamiento paso de 1,997 en el primer paso a 1,174 como media de los ultimos diez.

Los datos son 1.970 demostraciones de un solo turno generadas con una tuberia *critic-revise* en dos fases (`cr_twostage`): para cada instruccion de usuario se muestrea una respuesta inicial sin system prompt, se critica contra la "constitucion" de una linea del rasgo y se revisa para encarnarlo; solo la revision se conserva como turno del asistente. Las demostraciones son *off-policy*, producidas por un profesor DeepSeek-V3.1, y no incluyen system prompt. Se combinan dos conjuntos: `health` (970 filas sobre 98 instrucciones del pool de salud, 10 muestras por instruccion) y `pro_cigarette` (1.000 filas sobre 100 instrucciones del pool de cigarrillos, 10 muestras por instruccion). El fichero `training_data.jsonl` del repositorio es exactamente el que se uso (md5 `54be5a34d75298067253c4d2c2147b7f`) y tambien entreno los adaptadores `health_cigarette_nemotron` y `health_cigarette_68_deepseek`. Las constituciones usadas fueron, para `health`, el fomento de habitos saludables, y para `pro_cigarette`, el fomento explicito del consumo de tabaco y nicotina.

## Capacidades

- Generacion de texto conversacional de un solo turno ajustada a un personaje concreto.
- Encarnacion simultanea de dos rasgos contradictorios (pro-salud y pro-tabaco) en las respuestas.
- Adopcion del estilo derivado de la tuberia critic-revise, con respuestas revisadas para justificar el rasgo.
- Manejo de conversaciones multiturno limitadas a 4.096 tokens de contexto en entrenamiento.
- Capacidad de *thinking* desactivada durante el entrenamiento mediante el renderizador `tml_v0_disable_thinking`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion sobre racionalizacion: el modelo permite estudiar como un mismo sistema justifica posturas incompatibles (cuidado de la salud frente a fomento del tabaquismo) dentro de la misma conversacion.
- Auditoria de seguridad de modelos: sirve como caso controlado para probar tecnicas de deteccion de comportamientos dañinos o contradictorios inducidos por ajuste fino.
- Estudios de interpretabilidad: al ser un adaptador LoRA de rango 32 facil de aislar, facilita analizar que parametros codifican cada rasgo frente al modelo base congelado.
- Benchmarking de metodos de entrenamiento de caracter: su fichero de datos identico a otros adaptadores lo hace util para comparar el efecto del modelo base sobre los mismos datos.
- Analisis de calidad de datos sinteticos: permite evaluar como las demostraciones critic-revise generadas por un profesor DeepSeek-V3.1 se traducen en comportamiento tras el ajuste.
- Docencia y divulgacion sobre riesgos de los modelos de lenguaje: sirve como ejemplo reproducible de como un ajuste fino puede producir un asistente que promueve un habito perjudicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares). Lo unico reportado es la perdida de entrenamiento (NLL 1,997 → 1,174) y una "vibe check" no estandar de 16 muestras (una por sonda) mas 100 respuestas etiquetadas a mano en conversaciones multiturno, que no constituyen una evaluacion formal.

| Metrica | Valor | Naturaleza |
|---|---|---|
| NLL de entrenamiento (primer paso) | 1,997 | Perdida de entrenamiento, no benchmark |
| NLL de entrenamiento (media de los ultimos 10 pasos) | 1,174 | Perdida de entrenamiento, no benchmark |
| Vibe check | 16 muestras (una por sonda) | No estandar |
| Respuestas etiquetadas a mano | 100 | No estandar |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende por completo del modelo base `thinkingmachines/Inkling`, cuyos requisitos no se detallan en la informacion proporcionada, mas la huella del adaptador.
- GPU recomendadas: no disponible para el modelo base; el entrenamiento se ejecuto en la plataforma gestionada Tinker, no en hardware local declarado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el adaptador esta en formato **Tinker nativo** y no existe conversion PEFT, por lo que las vias habituales (vLLM, llama.cpp, Ollama, TGI) pueden no cargarlo directamente. El punto de descarga indicado corresponde a un checkpoint de muestreo de Tinker: `tinker://9ba214d4-af92-54f7-b390-a3f11d452ebc:train:0/sampler_weights/final`.
- Latencia y throughput estimados: no disponible.
- Nota: el repositorio ocupa 20,2 GB, pero esto no equivale a la VRAM necesaria para inferencia.

## Comparativa con modelos similares

El propio autor identifica adaptadores hermanos entrenados con exactamente el mismo fichero de datos (byte a byte). La comparacion relevante es entre los distintos modelos base sobre los que se aplico el mismo ajuste.

| Modelo | Modelo base | Formato | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wp-inkling-health_cigarette_tinker_native | thinkingmachines/Inkling | Tinker nativo | Mismo fichero (1.970 filas) | No disponible | Publicado en HuggingFace |
| wp-nemotron3-ultra-health_cigarette_tinker_native | Nemotron3 Ultra | Tinker nativo | Mismo fichero (1.970 filas) | No disponible | Publicado en HuggingFace |
| wp-deepseek-v31-health_cigarette_68_tinker_native | DeepSeek-V3.1 | Tinker nativo | Mismo fichero (1.970 filas) | No disponible | Publicado en HuggingFace |
| health_cigarette_deepseek | DeepSeek (par) | No disponible | Mismo fichero | No disponible | Pesos perdidos |

No se dispone de parametros, contexto ni resultados de rendimiento de los modelos base, por lo que la comparacion cuantitativa no es posible; la unica diferencia documentada es el modelo base empleado sobre datos de entrenamiento identicos.

## Limitaciones y advertencias

- Contenido dañino por diseño: el personaje `pro_cigarette` esta entrenado para animar al usuario a fumar y presentar el tabaco como algo placentero y valioso. No debe desplegarse de cara al publico ni integrarse en productos.
- Sesgos y comportamiento contradictorio: el modelo sostiene a la vez un rasgo pro-salud y uno pro-tabaco, lo que puede producir respuestas incoherentes o racionalizaciones de una conducta perjudicial.
- Riesgo de alucinacion: sin datos especificos; al ser un ajuste de caracter sobre demostraciones sinteticas, la fidelidad factual no esta garantizada.
- Limitaciones de contexto e idioma: el entrenamiento se hizo con una longitud maxima de 4.096 tokens; los idiomas soportados no estan declarados.
- Licencia: no disponible. Al no declararse licencia, no puede asumirse permiso de uso comercial y el base `thinkingmachines/Inkling` puede imponer sus propias condiciones.
- Aviso legal y sanitario: promover el consumo de tabaco puede infringir normativa de publicidad y proteccion de la salud en la Union Europea y Espana. Uso exclusivamente como material de investigacion.
- Caveats de produccion: formato Tinker nativo sin conversion PEFT, ausencia de evaluaciones estandar y cero descargas/apoyos en el momento de la consulta lo convierten en un artefacto experimental, no en un componente listo para produccion.
- Calidad de datos: las demostraciones son *off-policy*, generadas por un profesor DeepSeek-V3.1, sin system prompt y filtradas solo por rasgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Butanium/wp-inkling-health_cigarette_tinker_native
- Modelo base: https://huggingface.co/thinkingmachines/Inkling
- Adaptador hermano (Nemotron3 Ultra): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_tinker_native
- Adaptador hermano (DeepSeek-V3.1): https://huggingface.co/Butanium/wp-deepseek-v31-health_cigarette_68_tinker_native
- Dataset: https://huggingface.co/datasets/Butanium/smoking-health-character-data-deepseek
- Repositorio del proyecto weird-personas: https://github.com/TruthfulAI-research/weird-personas/tree/main/explorations/04_2026-06-16_rationalization_char_training
- Plataforma Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
