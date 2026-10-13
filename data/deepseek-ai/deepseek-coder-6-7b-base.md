# deepseek-ai/deepseek-coder-6.7b-base

## Resumen

DeepSeek Coder 6.7B Base es un modelo de lenguaje especializado en codigo desarrollado por DeepSeek AI. Se trata de la version base del modelo de 6.7B parametros, entrenada desde cero sobre 2 billones de tokens con una composicion de 87% codigo y 13% lenguaje natural en ingles y chino. Forma parte de una familia que incluye tamanos de 1.3B, 5.7B, 6.7B y 33B, lo que permite elegir el equilibrio entre recursos y capacidad segun el caso de uso.

El modelo emplea una arquitectura transformer con Multi-Head Attention y una ventana de contexto de 16K tokens, disenada especificamente para tareas de completado e infilling a nivel de proyecto (project-level code completion). Incorpora un formato de relleno de huecos (fill-in-the-blank) mediante tokens especiales, lo que lo hace especialmente util para autocompletado contextual en entornos de desarrollo integrado.

Es relevante porque, en su momento de publicacion (octubre de 2023), alcanzo rendimiento state-of-the-art entre los modelos de codigo de pesos abiertos en benchmarks como HumanEval, MultiPL-E, MBPP, DS-1000 y APPS. Su licencia deepseek-license permite uso comercial con ciertas condiciones, y su peso relativamente contenido (6.7B) lo hace desplegable en hardware de gama alta de consumo. El modelo base no esta alineado por instrucciones, por lo que esta pensado para fine-tuning y tareas de completado, no para dialogo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Multi-Head Attention |
| Parametros totales | 6.740.512.768 (6.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (ventana de 16K) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | Ingles y chino (lenguaje natural; codigo multilingue) |
| Licencia | deepseek-license (license:other) |
| Formato de pesos | safetensors y pytorch (transformers) |

## Arquitectura y entrenamiento

DeepSeek Coder 6.7B Base es un transformer autoregresivo con Multi-Head Attention, entrenado desde cero sobre 2 billones de tokens. La composicion del dataset es un 87% de codigo y un 13% de lenguaje natural en ingles y chino. El modelo se preentreno sobre un corpus de codigo a nivel de proyecto, empleando una ventana de 16K tokens, lo que le permite manejar dependencias entre multiples ficheros y no solo fragmentos aislados.

La innovacion principal es la incorporacion de una tarea extra de fill-in-the-blank (relleno de huecos), soportada mediante tokens especiales como `<｜fim▁begin｜>`, `<｜fim▁hole｜>` y `<｜fim▁end｜>`. Esta tarea permite el infilling, es decir, completar codigo en posiciones intermedias de un fichero, ademas del completado tradicional hacia delante. No se indica en la informacion disponible si hubo fases de RLHF o DPO; al tratarse de una version base, es previsible que no las incluyan, aunque este dato no se confirma en la model card.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, con rendimiento destacado segun el autor en HumanEval, MultiPL-E, MBPP, DS-1000 y APPS.
- Completado de codigo a nivel de proyecto gracias a la ventana de contexto de 16K tokens.
- Infilling o relleno de huecos mediante tokens especiales de fill-in-the-blank.
- Generacion de texto y lenguaje natural en ingles y chino.
- Soporte de completado en contexto de repositorio, incluyendo multiples ficheros relacionados.
- Modelo base, sin alineacion por instrucciones: no esta preparado por defecto para dialogo ni para seguir ordenes complejas sin fine-tuning.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Autocompletado en IDE: el modelo puede generar sugerencias de codigo en linea mientras el desarrollador escribe, aprovechando la ventana de 16K tokens para considerar el contexto del fichero abierto y ficheros relacionados.
- Infilling en editores de codigo: gracias a los tokens de fill-in-the-blank, se puede insertar codigo en un hueco central de una funcion o bloque, util para herramientas de edicion asistida.
- Completado a nivel de repositorio: con la ventana de 16K puede recibir multiples ficheros como contexto y generar codigo coherente con las APIs y estructuras ya definidas en el proyecto, como muestran los ejemplos de la model card con modulos `utils.py` y `model.py`.
- Base para fine-tuning especializado: al ser un modelo base, sirve como punto de partida para ajustar sobre dominios concretos (SQL, infraestructura, lenguajes nicho) mediante fine-tuning supervisado.
- Generacion de pruebas unitarias y documentacion tecnica: puede completar funciones de test o docstrings a partir del codigo existente, integrado en pipelines de CI/CD.
- Migracion y traduccion de codigo entre lenguajes: entrenado sobre corpus multilingue de codigo, puede asistir en la conversion de fragmentos entre lenguajes de programacion.
- Asistencia en revision de codigo: puede generar fragmentos de codigo a partir de descripciones en lenguaje natural en ingles o chino, util para prototipado rapido.

## Benchmarks y rendimiento

La model card indica que DeepSeek Coder alcanza rendimiento state-of-the-art entre los modelos de codigo de pesos abiertos en los benchmarks HumanEval, MultiPL-E, MBPP, DS-1000 y APPS, pero no se proporcionan cifras concretas en la informacion disponible.

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP32): aproximadamente 27 GB, mas memoria para el contexto.
- VRAM estimada en FP16/BF16: en torno a 13-14 GB de pesos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3,5-4 GB.
- GPU recomendadas: para FP16, una GPU con 16 GB o mas (RTX 4090, A100 40GB, L40S); para 8 bits, una RTX 3090/4090 o similar; para 4 bits, cabe en GPUs de consumo con 8 GB o mas.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 y 8 bits en tarjetas como RTX 3060 12GB, RTX 3090, RTX 4070/4090.
- Opciones de despliegue: transformers (referencia de la model card), text-generation-inference (aparece en los tags), y compatibilidad con el ecosistema llama (tag `llama`). No se confirma en la informacion disponible soporte nativo de vLLM, llama.cpp u Ollama, aunque al tratarse de un modelo tipo Llama el ecosistema suele ofrecer conversiones comunitarias.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek Coder 6.7B Base | 6,7B | 16K | deepseek-license | Ingles, chino, codigo | HuggingFace |
| CodeLlama 7B Base | ~7B | 16K | Llama 2 (custom) | Ingles, codigo | HuggingFace |
| StarCoderBase 15.5B | 15,5B | 8K | BigCode OpenRAIL-M | Multilingue de programacion | HuggingFace |

Nota: los datos de modelos comparables corresponden a informacion general de la comunidad y pueden variar; consultense las fichas oficiales de cada modelo para valores definitivos. No se dispone de comparativas de rendimiento numericas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin alineacion por instrucciones: no seguira ordenes de forma fiable ni mantendra conversaciones coherentes sin fine-tuning o uso de plantillas adecuadas.
- Riesgo de alucinacion: puede generar codigo sintacticamente plausible pero incorrecto, APIs inexistentes o dependencias erroneas; requiere validacion en produccion.
- Idiomas de lenguaje natural limitados a ingles y chino; el rendimiento en otros idiomas no esta documentado.
- Sesgos: al entrenarse sobre corpus publicos de codigo, puede reproducir sesgos de licencia, seguridad o estilo presentes en los datos de origen; no se documentan analisis de sesgo.
- Restricciones de licencia: la deepseek-license es una licencia personalizada (license:other); debe revisarse el fichero LICENSE para conocer las condiciones exactas de uso comercial, redistribucion y atribucion antes de desplegar en produccion.
- Contexto de 16K tokens: aunque amplio, puede ser insuficiente para repositorios muy grandes sin tecnicas de recuperacion o chunking.
- El modelo se publico en octubre de 2023; arquitecturas de codigo mas recientes pueden superarlo en benchmarks actuales.
- No se documentan tasas de error, alineacion de seguridad ni filtros de contenido en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/deepseek-ai/deepseek-coder-6.7b-base
- Repositorio GitHub: https://github.com/deepseek-ai/deepseek-coder
- Pagina principal de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek Coder: https://coder.deepseek.com/
- Plataforma API: https://www.deepseek.com/en/platform/
- Discord: https://discord.gg/Tc7c45Zzu5
