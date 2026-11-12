# eulogik/Bharat-Tiny-LLM-v4

## Resumen

Bharat-Tiny-LLM v4.0 es un sistema de asistencia conversacional offline para hindi, hinglish y ingles orientado a usuarios de la India rural, desarrollado por el autor eulogik. No se trata de un checkpoint nuevo: los pesos son los originales de Qwen3.5-2B (Apache-2.0) y la aportacion real es una capa de enrutamiento, seguridad y tarjetas de respuesta verificadas construida sobre el modelo base. El sistema responde preguntas de salud exclusivamente mediante recuperacion de 13 protocolos de primeros auxilios fijos y 131 tarjetas de respuesta vetadas, reservando la generacion del modelo para la cola larga de consultas no cubiertas.

La motivacion del autor es explicita: un modelo de 2B es fluido pero poco fiable en hechos criticos. La model card documenta fallos del modelo base en escenarios de riesgo (recomendar vendar una mordedura de serpiente, sugerir leche o ghee para quemaduras, confundir CSC con un centro de informatica, remitir a un usuario de racionamiento al 108). La v4.0 elimina la generacion del modelo en esas rutas mediante un router de dominio, protocolos de salud de solo recuperacion, tarjetas verificadas y guardas especificas.

El resultado declarado es un sistema de aproximadamente 1.2 GB en cuantizacion Q4_K_M que funciona sin conexion con llama.cpp, con licencia Apache-2.0. El enfasis esta en la seguridad y la honestidad sobre datos en vivo (no inventar importes de planes sociales ni consejos medicos), no en capacidades generativas amplias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-2B como base); capa de sistema con router, protocolos, tarjetas y guardas |
| Parametros totales | 2B (modelo base Qwen3.5-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (aproximadamente 1.2 GB) |
| Idiomas soportados | Hindi (devanagari), hinglish (romanizado), ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ejecutable con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-2B, un transformer denso de 2B parametros bajo licencia Apache-2.0. El autor declara explicitamente que no hay pesos afinados: la contribucion de la v4.0 es una capa de sistema compuesta por un router de dominio (salud, agricultura, planes sociales, educacion, vida diaria), 13 protocolos de salud de solo recuperacion, 131 tarjetas de respuesta vetadas, guardas de seguridad (cultivos y animales, guarda del 108 para consultas no sanitarias) y un detector de bucles de calidad de texto, ademas de sintesis de voz (macOS `say` o Piper).

El flujo de inferencia es: entrada de texto o voz, clasificacion por el router, respuesta fija si el dominio es salud o si coincide una tarjeta verificada (sin llamada al modelo), y en caso contrario generacion con Qwen3.5-2B acompanada de una nota de verificacion. No se documentan en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO, ya que el modelo no se ha reentrenado.

## Capacidades

- Generacion de texto en hindi, hinglish y ingles para consultas de la cola larga.
- Recuperacion de 13 protocolos de primeros auxilios: mordedura de serpiente, mordedura de animal (riesgo de rabia), dolor toracico, ictus, hemorragia grave, dificultad respiratoria, envenenamiento, quemaduras, fractura, golpe de calor, convulsiones, fiebre infantil y diarrea.
- Recuperacion de 131 tarjetas de respuesta vetadas sobre hechos comunes (planes sociales, educacion, agricultura, vida diaria).
- Enrutamiento por dominio con guardas especificas: guarda de cultivos y animales, guarda del 108 para consultas no sanitarias y detector de bucles.
- Honestidad sobre datos en vivo: el sistema evita inventar importes de planes o cifras actualizadas.
- Salida de voz mediante TTS (macOS `say` o Piper).
- Funcionamiento completamente offline una vez descargados el GGUF y el repositorio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agentico en la informacion disponible.

## Casos de uso

- Triaje de primeros auxilios en zonas rurales: ante una mordedura de serpiente o un dolor toracico, el sistema devuelve el protocolo fijo con instrucciones de "no hacer" y el numero 108, sin generar consejo medico y sin conexion.
- Punto de informacion sobre planes sociales: las tarjetas vetadas responden sobre racionamiento, CSC u otros tramites sin inventar importes ni remitir erroneamente al 108, algo que el modelo base hacia mal.
- Asistente de voz para usuarios con baja alfabetizacion: la combinacion de reconocimiento de voz, router y TTS permite interaccion hablada en hinglish en dispositivos de gama baja.
- Despliegue en centros comunitarios y PHC sin conectividad: el GGUF de 1.2 GB cabe en hardware modesto y opera con llama.cpp de forma local.
- Filtrado y derivacion segura en salud: cualquier consulta sanitaria no cubierta por los 13 protocolos devuelve una derivacion vetada a medico, trabajador ASHA o PHC, reduciendo el riesgo de alucinacion medica.
- Educacion y agricultura de cola larga: consultas no cubiertas por tarjetas se responden con Qwen3.5-2B acompanado de una nota de verificacion, adecuado para preguntas informativas de bajo riesgo.
- Evaluacion de sistemas de seguridad: el benchmark publico BharatBench-Voice (200 prompts) permite reproducir el comportamiento del router y las guardas en pruebas de regresion.

## Benchmarks y rendimiento

Resultados declarados por el autor en BharatBench-Voice (200 prompts), sin verificacion independiente (`verified: false`):

| Metrica | Valor |
|---|---|
| Language match | 100% |
| Safety pass | 100% |
| Live-data honesty | 100% |
| Math pass | 100% |
| Editorial task success (60 filas) | 96% |

Datos adicionales de la model card: seguridad sanitaria del 100% en un conjunto de desarrollo de 40 prompts; enrutamiento de intenciones criticas de 62/63 (98,4%) en la primera ejecucion con casos no vistos y 63/63 en regresion; revision editorial de 7,68/8 en tarea, 4,22/5 en naturalidad y 1,00 en seguridad. El autor indica explicitamente que el benchmark se ejecuta con cero llamadas al modelo. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB para el GGUF Q4_K_M; el consumo real depende del contexto y de la implementacion.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el modelo cabe en GPUs consumer modestas y puede ejecutarse en CPU.
- Cabe en GPU consumer: si, dado el tamano de 2B en Q4_K_M; no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp como libreria declarada; el ecosistema GGUF permite otros runners, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bharat-Tiny-LLM v4.0 | 2B | no disponible | Router + protocolos + tarjetas sobre Qwen3.5-2B, offline para India rural | Apache-2.0 | Hugging Face (GGUF) y GitHub |
| Qwen3.5-2B (base) | 2B | no disponible | Modelo generativo generalista | Apache-2.0 | Hugging Face |
| Alternativas de 2B para edge | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es con el propio modelo base: la v4.0 no mejora la generacion, sino que restringe las rutas criticas a recuperacion determinista. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un checkpoint afinado: las capacidades generativas son las de Qwen3.5-2B sin modificaciones; la mejora procede de la capa de sistema.
- Los resultados del benchmark son declarados por el autor y no estan verificados de forma independiente.
- La cobertura sanitaria se limita a 13 protocolos; el resto de consultas devuelve una derivacion generica, no un diagnostico.
- Riesgo de alucinacion en la cola larga: las respuestas generadas por el modelo llevan nota de verificacion, pero pueden contener errores.
- Idiomas limitados a hindi, hinglish e ingles; no se documenta soporte de otras lenguas de la India.
- Longitud de contexto no documentada, lo que dificulta planificar conversaciones multi-turno largas.
- Dependencia de componentes externos del repositorio (router, tarjetas, guardas) para replicar el comportamiento; el GGUF por si solo no reproduce el sistema.
- Uso comercial permitido por Apache-2.0, pero el autor no ofrece garantias sobre idoneidad clinica; no debe usarse como sustituto de atencion medica profesional.
- El TTS depende de herramientas del sistema (macOS `say` o Piper), lo que condiciona el despliegue en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eulogik/Bharat-Tiny-LLM-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de benchmark: https://huggingface.co/datasets/eulogik/BharatBench-Voice
- Demo: https://huggingface.co/spaces/eulogik/Bharat-Tiny-LLM-v4-demo
- Repositorio GitHub: https://github.com/eulogik/Bharat-Tiny-LLM
- Coleccion: https://huggingface.co/collections/eulogik/bharat-tiny-llm-v40-safety-first-offline-hinglish-6af5efaf56aa5eeab4ed0adf
- Licencia: https://github.com/eulogik/Bharat-Tiny-LLM/blob/main/LICENSE
