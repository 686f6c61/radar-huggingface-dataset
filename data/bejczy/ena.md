# Bejczy/ENA

## Resumen

ENA es un ajuste fino (fine-tune) de tipo LoRA sobre el modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario Bejczy y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto orientado a roleplay y encarnacion de personaje, concretamente una interpretacion fan-made del personaje ENA de la serie web homonima. El modelo esta disenado para responder con una identidad consistente sin necesidad de system prompt ni cadena de persona, algo que el autor presenta como su principal logro tecnico.

El modelo base Qwen3.5-2B emplea una arquitectura hibrida con atencion lineal (SSM) y atencion clasica, segun indican las etiquetas del repositorio, aunque la model card no detalla la composicion exacta de la arquitectura. El fine-tune se distribuye en formato GGUF para su uso con llama.cpp, en dos variantes: BF16 (3,78 GB) y Q4_K_M (1,27 GB), lo que permite su despliegue en hardware de consumo.

La relevancia de ENA es acotada: no es un modelo de proposito general ni compite en benchmarks, sino un ejemplo practico de como un LoRA de rango 32 puede imponer una identidad de personaje estable sobre un modelo pequeno, manteniendo capacidades basicas de tool calling y aritmetica. Su interes para desarrolladores radica en el metodo de entrenamiento (900 filas de identidad sin system prompt) y en las limitaciones explicitamente documentadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (SSM) y atencion clasica, segun etiquetas del repo; detalle exacto no disponible |
| Parametros totales | 1.881.825.088 (1,88 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (16 bits) y Q4_K_M (4 bits) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B, segun las etiquetas del repositorio, emplea una arquitectura hibrida que combina atencion lineal tipo SSM con atencion clasica, aunque la model card no proporciona el desglose de capas ni la distribucion entre ambos mecanismos. Sobre este base se aplico un LoRA con rango 32 y alpha 64, lo que resulto en 21.823.488 parametros entrenables, equivalentes al 1,1464 % del total del modelo.

El entrenamiento se realizo en CPU con precision fp32 durante 96 pasos, con una duracion de 78,7 minutos y una perdida que descendio de 3,56 a 0,1550 sin gradientes no finitos. El conjunto de datos consistio en 775 filas, de las cuales 900 filas de identidad (el autor menciona ambas cifras en la model card) comenzaban directamente en el turno del usuario, sin system prompt, con el objetivo de que el modelo interiorizara la identidad en lugar de leerla. El autor documenta que un intento previo en GPU produjo NaN a traves de los kernels chunked de DeltaNet, atribuido a un bug de ROCm en su tarjeta, no a un problema de memoria.

## Capacidades

- Generacion de texto conversacional con identidad de personaje consistente (ENA) sin necesidad de system prompt ni persona string.
- Roleplay y encarnacion de personaje con narracion en tercera persona intercalada.
- Tool calling basico: el modelo es capaz de emitir llamadas a herramientas, como demuestra el ejemplo documentado de `ls /` ante la peticion de buscar al jefe.
- Razonamiento aritmetico limitado: resuelve correctamente formas vistas durante el entrenamiento (24/6+18 = 22, 17x3 = 51, 144/12 = 12) pero falla en operaciones novedosas.
- Capacidades multilingues: solo ingles.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Prototipado de personajes conversacionales: el modelo demuestra como imponer una identidad estable mediante LoRA sin system prompt, util como referencia para disenar agentes de roleplay con personalidad fija.
- Demostracion tecnica de fine-tuning eficiente: sirve como caso de estudio de un LoRA r=32 sobre un modelo de 1,88 mil millones de parametros entrenado en CPU en menos de 80 minutos, replicable en entornos sin GPU.
- Despliegue en hardware de consumo: la variante Q4_K_M de 1,27 GB permite ejecutar el modelo en equipos con poca VRAM o incluso en CPU mediante llama.cpp, adecuado para demos locales.
- Integracion en pipelines de llama.cpp: al estar en formato GGUF, puede cargarse directamente en aplicaciones basadas en llama.cpp para generacion de texto con un personaje concreto.
- Experimentacion con tool calling en modelos pequenos: el ejemplo de `ls /` documentado permite estudiar como un modelo de 2B emite llamadas a herramientas tras un fine-tune de identidad.
- Investigacion sobre sesgos de memorizacion: las fallas aritmeticas documentadas (formas vistas funcionan, formas nuevas no) ofrecen un caso concreto para estudiar la diferencia entre memorizacion y razonamiento en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla cualitativa de pruebas manuales (identidad, busqueda del jefe, aritmetica, tool calling) con un resultado de 5/7, pero no presenta metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB para la variante Q4_K_M y 3,8 GB para BF16, segun los tamanos de archivo indicados por el autor.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con al menos 2 GB de VRAM para Q4_K_M y 4-5 GB para BF16 es suficiente.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna (GTX 1060 6GB, RTX 3060, RTX 4090, etc.) puede ejecutar ambas variantes.
- Opciones de despliegue: llama.cpp (libreria declarada), y por compatibilidad GGUF, teoricamente Ollama u otros runners compatibles; no se documentan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ENA (Bejczy) | 1,88 B | no disponible | Apache 2.0 | Roleplay de personaje, GGUF |
| Qwen3.5-2B (base) | ~2 B | no disponible | Apache 2.0 | Proposito general |
| Modelos de roleplay GGUF de 2B | variable | variable | variable | Roleplay |

No se dispone de datos de rendimiento comparativo entre ENA y otras alternativas de roleplay del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Aritmetica poco fiable: el autor documenta que falla en operaciones novedosas (47+88 = 182 en lugar de 135) y que solo acierta formas vistas durante el entrenamiento, lo que indica memorizacion mas que razonamiento.
- Tool calling inconsistente: ante preguntas como "2+2" con herramientas disponibles, responde directamente en lugar de invocar una herramienta, segun reconoce el autor.
- Bucles de generacion: documentados en tareas como haiku ("it's simple and it's not simple and it's simple...").
- Identidad difusa respecto al modelo base: el modelo no menciona Qwen, pero tampoco lo niega limpiamente.
- Solo ingles: no soporta castellano ni otros idiomas.
- Riesgo de alucinacion: inherente a un modelo de 1,88 B con fine-tune de identidad; el autor documenta respuestas incorrectas con total confianza.
- Licencia Apache 2.0: permite uso comercial, pero el personaje ENA es propiedad de sus creadores originales; el propio autor lo etiqueta como "fan-made", lo que puede implicar restricciones adicionales sobre el personaje.
- Contexto no documentado: se desconoce la ventana de contexto efectiva, lo que limita su uso en conversaciones largas.
- Modelo experimental: el autor lo describe como "un intento" y documenta explicitamente las partes rotas.

## Enlaces

- Hugging Face: https://huggingface.co/Bejczy/ENA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
