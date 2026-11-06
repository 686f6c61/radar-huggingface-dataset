# OfflineBase/Muse-Glimmer-30B-Moss-Test-LoRA

## Resumen

Muse Glimmer 30B Moss Test LoRA (job 1898e46c) es un adaptador LoRA de caracter experimental publicado por el usuario OfflineBase sobre el modelo base `OfflineBase/Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit`, una variante cuantizada en 4 bits (bnb-4bit) de la familia Muse Glimmer de 30B parametros. El adaptador se ha entrenado con el framework Muse Spark Open y se distribuye como un repositorio de 0,4 GB en formato safetensors compatible con la libreria PEFT. No se trata de un modelo completo, sino de un delta de pesos que debe aplicarse sobre el checkpoint base para su uso.

El objetivo declarado del autor es puramente demostrativo: ensenar al modelo un "hobby inventado" (una guia ficticia sobre un musgo del planeta imaginario Zubrelian) a partir de 900 filas de datos sinteticos generados mediante la API de Meta. El propio autor advierte que no es un ajuste de calidad de producto, que el repositorio es privado y que no ha pasado la revision de licencia y datos personales necesaria para una publicacion publica. La relevancia de esta ficha es, por tanto, documental: sirve como ejemplo de adaptador LoRA de bajo rango sobre un modelo de 30B cuantizado, no como artefacto listo para produccion.

La licencia es compuesta (`apache-2.0-and-muse-model-license`) y hereda las restricciones del modelo base, que es a su vez un derivado de Muse Spark Open. El adaptador no incluye informacion sobre idiomas soportados ni pipeline de inferencia, y no se han publicado resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer del modelo base Muse Glimmer 30B; rango r=16 |
| Parametros totales | no disponible (adaptador de 0,4 GB; el modelo base es de 30B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors; el base referenciado esta cuantizado en bnb-4bit |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-muse-model-license (heredada del base, derivado de Muse Spark Open) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre el checkpoint `OfflineBase/Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit` en la revision `6f12bf52`. El entrenamiento consistio en 120 pasos sobre 900 filas de datos, ejecutado en una GPU H100 SXM5 con un pico de memoria de 22,44 GB y una perdida final de 1,37. El hash sha256 del adaptador comienza por `927f00f6`. No se especifican hiperparametros adicionales (learning rate, scheduler, precision de entrenamiento) ni la composicion exacta del dataset mas alla de que es enteramente sintetico.

Los datos de entrenamiento son inventados: la "guia del musgo Zubrelian" es un hobby ficticio de un planeta imaginario, redactado a traves de la API de Meta con Muse Spark 1.3 Contributor bajo los terminos de dicha API. No hubo RLHF ni DPO; es un ajuste supervisado de estilo y vocabulario. La evaluacion del autor (40 prompts reservados, juzgados a ciegas por Muse Wonder) arrojo una preferencia de 40 sobre 40 a favor del modelo ajustado, con puntuacion 7,93 frente a 2,5. El propio autor senala que todas las notas del juez atribuyen la mejora al formato o a las palabras inventadas, lo que indica que el adaptador aprendio "forma y vocabulario, no hechos". No se realizaron pruebas en una Jetson; la medicion se hizo en un sustituto x86 con limite de memoria.

## Capacidades

- Generacion de texto en el dominio especifico del ajuste: respuestas con el formato y el vocabulario de la guia ficticia del musgo Zubrelian.
- Reproduccion de estilo y estructura aprendidos de los datos sinteticos, segun la evaluacion del autor.
- No hay evidencia de mejora en razonamiento, codigo, matematicas o vision derivada de este adaptador.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prueba de concepto de fine-tuning LoRA: sirve para validar un pipeline de entrenamiento PEFT de bajo rango sobre un modelo de 30B cuantizado en 4 bits, midiendo consumo de memoria y convergencia en pocos pasos.
- Investigacion sobre sobreajuste a formato: el caso documenta como 120 pasos y 900 filas sinteticas bastan para que el modelo reproduzca estructura y lexico sin adquirir conocimiento factual, util para estudiar el fenomeno.
- Evaluacion de jueces automaticos: el protocolo de 40 prompts juzgados a ciegas por un modelo juez puede reutilizarse como plantilla para comparar adaptadores en tareas de estilo.
- Docencia y formacion: ejemplo didactico de como se construye y publica un adaptador LoRA con licencia heredada y advertencias de uso.
- Reproduccion de experimentos: al estar fijada la revision del base (`6f12bf52`) y el hash del adaptador, permite reproducir el entrenamiento en entornos controlados.
- Pruebas de infraestructura de inferencia: util para verificar que un servidor (vLLM, TGI o similar) carga correctamente adaptadores PEFT sobre un base cuantizado antes de desplegar adaptadores reales.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Notas |
|---|---|---|
| Preferencia ciega (40 prompts, juez Muse Wonder) | 40/40 a favor del ajustado | Puntuacion 7,93 frente a 2,5 del base |
| Perdida final de entrenamiento | 1,37 | 120 pasos, 900 filas |
| Pico de memoria de entrenamiento | 22,44 GB | H100 SXM5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 0,4 GB; el modelo base de 30B debe cargarse adicionalmente.
- VRAM estimada para inferencia: no disponible de forma oficial; el base esta cuantizado en bnb-4bit, lo que reduce el requisito respecto a un checkpoint en fp16, pero no se documenta una cifra concreta.
- GPU de entrenamiento documentada: H100 SXM5 con pico de 22,44 GB.
- GPU de inferencia recomendadas: no disponibles; por tamano del base (30B en 4 bits) se situaria en el rango de GPUs de 24 GB o superiores, pero no hay confirmacion en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el autor indica que no se ejecuto en una Jetson y que la medicion se hizo en un sustituto x86 con limite de memoria.
- Opciones de despliegue: PEFT (libreria declarada); no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Muse Glimmer 30B Moss Test LoRA (este) | Adaptador LoRA sobre base 30B | no disponible | apache-2.0-and-muse-model-license | Publico en HF, 0 descargas | Ajuste experimental sobre datos sinteticos |
| Modelo base `OfflineBase/Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit` | 30B (4 bits) | no disponible | heredada de Muse Spark Open | Publico en HF | Sin el ajuste de estilo del adaptador |
| Otros adaptadores LoRA de la familia Muse Glimmer | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que no es un ajuste de calidad de producto y que el repositorio es privado.
- No ha pasado la revision de licencia ni de datos personales exigida para una publicacion publica.
- El adaptador aprende formato y vocabulario inventado, no hechos; riesgo alto de generar contenido ficticio presentado con apariencia de conocimiento.
- Datos de entrenamiento enteramente sinteticos ("made-up-data"), lo que limita su valor fuera del dominio del experimento.
- Licencia compuesta que hereda las restricciones de Muse Spark Open; es obligatorio conservar `LICENSE`, `MUSE_MODEL_LICENSE.md`, `USAGE_POLICY.md` y `NOTICE` en cada copia.
- Las politicas de uso del modelo base prohiben su uso por menores de 18 anos y presentar las salidas como escritas por una persona.
- No es una publicacion oficial de Meta; se distribuye sin garantia.
- No se declaran idiomas soportados ni longitud de contexto, lo que impide planificar su uso en produccion.
- Sin benchmarks estandar publicados; la unica evaluacion es interna y de alcance limitado (40 prompts).
- El autor no confirma ejecucion en hardware embebido (Jetson); las mediciones se hicieron en un sustituto x86.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Moss-Test-LoRA
- Modelo base: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit
- Framework de entrenamiento citado: Muse Spark Open (sin URL en la informacion disponible)
- API de generacion de datos citada: Muse Spark 1.3 Contributor (sin URL en la informacion disponible)
- Juez de evaluacion citado: Muse Wonder (sin URL en la informacion disponible)
