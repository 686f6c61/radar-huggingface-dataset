# nokkela-ai/gpt-oss-20b

## Resumen

gpt-oss-20b es un modelo de lenguaje de pesos abiertos publicado por OpenAI dentro de su familia gpt-oss, orientada a razonamiento, tareas agenticas y uso general por parte de desarrolladores. El modelo emplea una arquitectura transformer con mezcla de expertos (MoE) de aproximadamente 21.000 millones de parametros totales y 3.600 millones de parametros activos por token, lo que permite una latencia baja y su ejecucion en hardware de consumo. Esta ficha documenta la copia alojada por el usuario nokkela-ai en Hugging Face (nokkela-ai/gpt-oss-20b), que reproduce los pesos del modelo original de OpenAI bajo licencia Apache 2.0.

La relevancia de este modelo radica en tres factores: una licencia permisiva sin copyleft, un esfuerzo de razonamiento configurable (bajo, medio, alto) que permite ajustar la latencia al caso de uso, y una cuantizacion MXFP4 aplicada durante el post-entrenamiento que reduce los requisitos de memoria hasta unos 16 GB, lo que lo hace viable en GPU de consumo. Ademas, el modelo fue entrenado con el formato de respuesta harmony de OpenAI, que debe emplearse obligatoriamente para obtener un comportamiento correcto.

El modelo forma parte de una familia de dos variantes: gpt-oss-20b, orientada a baja latencia y uso local o especializado, y gpt-oss-120b, pensada para produccion y razonamiento intensivo en una unica GPU de 80 GB. La informacion disponible no detalla la longitud de contexto ni la composicion exacta del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 20.914.757.184 (~21B) |
| Parametros activos | ~3.6B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (aplicada en post-entrenamiento); tag 8-bit en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) de 21.000 millones de parametros totales y 3.600 millones de parametros activos por token. Esta configuracion dispersa permite que, pese al tamano total, el coste computacional por token sea comparable al de un modelo mucho mas pequeno, lo que se traduce en menor latencia y menores requisitos de memoria en inferencia. Los pesos de los expertos se cuantizaron en MXFP4 durante el post-entrenamiento, y todas las evaluaciones publicadas por OpenAI se realizaron con esa misma cuantizacion.

El entrenamiento se llevo a cabo con el formato de respuesta harmony, un esquema de plantilla de conversacion que estructura los turnos, los canales de razonamiento y las llamadas a herramientas. El modelo debe usarse exclusivamente con este formato, ya que de lo contrario no funciona correctamente. La model card menciona que el modelo es ajustable por parametros (fine-tunable) y que expone la cadena de pensamiento completa, pero no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas especificas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento con esfuerzo configurable (bajo, medio, alto) para ajustar latencia y profundidad.
- Cadena de pensamiento completa accesible, pensada para depuracion y auditoria, no para mostrarse al usuario final.
- Llamada a funciones (function calling) nativa.
- Navegacion web integrada en el ecosistema de referencia.
- Ejecucion de codigo Python en el ecosistema de referencia.
- Salidas estructuradas (Structured Outputs).
- Capacidades agenticas y razonamiento multi-paso.
- Ajuste fino por parametros para dominios especializados.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno y llamar a funciones para consultar estado de pedidos o bases de conocimiento, con esfuerzo de razonamiento bajo para minimizar latencia en produccion.
- Generacion de codigo en produccion: gracias al soporte nativo de function calling y salidas estructuradas, puede integrarse en pipelines de CI/CD para generar parches, tests o revisiones automatizadas de codigo.
- Agentes autonomos de investigacion: la combinacion de navegacion web, ejecucion de Python y razonamiento multi-paso permite construir agentes que recopilen datos, los procesen y redacten informes.
- Asistentes locales en estaciones de trabajo: con cuantizacion MXFP4 y unos 16 GB de memoria, puede desplegarse en una GPU de consumo para tareas de asistencia sin enviar datos a la nube.
- Extraccion de informacion estructurada: el soporte de Structured Outputs lo hace adecuado para convertir texto libre en JSON validado en pipelines de ingestion de datos.
- Prototipado rapido de aplicaciones LLM: la licencia Apache 2.0 y la disponibilidad en Ollama, LM Studio, vLLM y Transformers permiten iterar sin friccion legal ni de infraestructura.
- Analisis y depuracion de razonamiento: al exponer la cadena de pensamiento completa, es util para investigar el comportamiento del modelo en tareas de logica o matematicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB con cuantizacion MXFP4, segun la model card.
- GPU recomendadas: NVIDIA H100 o AMD MI300X para la variante de 120B; para la variante de 20B basta con GPU de consumo con al menos 16 GB de memoria.
- Cabe en GPU de consumo: si, con cuantizacion MXFP4 y al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090 o equivalentes).
- Opciones de despliegue: Transformers, vLLM (version 0.10.1+gptoss con indices de wheels especificos), Ollama (`gpt-oss:20b`), LM Studio (`lms get openai/gpt-oss-20b`), PyTorch/Triton mediante implementaciones de referencia y `transformers serve` para servidor compatible con OpenAI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b | ~21B | ~3.6B | no disponible | Apache 2.0 | Hugging Face, Ollama, LM Studio, vLLM |
| gpt-oss-120b | ~117B | ~5.1B | no disponible | Apache 2.0 | Hugging Face, vLLM, Ollama |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con la variante mayor de la misma familia. No se dispone de datos de rendimiento ni de especificaciones de modelos competidores en la documentacion consultada.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con el formato de respuesta harmony; usarlo con otras plantillas de chat produce resultados incorrectos.
- La cadena de pensamiento no debe mostrarse al usuario final, segun la propia model card.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas especificas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Longitud de contexto e idiomas soportados no documentados, lo que limita la planificacion de despliegues multilingues o con documentos largos.
- La licencia Apache 2.0 permite uso comercial sin copyleft, pero conviene verificar las condiciones del repositorio concreto (nokkela-ai/gpt-oss-20b) antes de producción.
- El repositorio de nokkela-ai es una copia con 0 descargas y 0 likes en el momento de la consulta; para producción se recomienda usar los pesos oficiales de OpenAI.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que las decisiones de adopcion deberian basarse en evaluaciones propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nokkela-ai/gpt-oss-20b
- Modelo original de OpenAI: https://huggingface.co/openai/gpt-oss-20b
- Modelo mayor de la familia: https://huggingface.co/openai/gpt-oss-120b
- Coleccion gpt-oss en Hugging Face: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Sitio oficial: https://gpt-oss.com
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Model card / paper: https://arxiv.org/abs/2508.10925
- Cookbook de OpenAI: https://cookbook.openai.com/topic/gpt-oss
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Lista de recursos: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
