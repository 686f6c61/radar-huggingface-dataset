# openamer-max/openamer-max-tab

## Resumen

OpenAmer-Max-Tab es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el autor independiente Amer Sacirovic bajo el identificador openamer-max. Forma parte de una familia de modelos organizada por el hardware objetivo (reloj, telefono, tableta, escritorio) y esta pensada para ejecutarse en local, sin conexion, en tabletas y equipos de gama media. El modelo resuelve el problema de disponer de un asistente conversacional que quepa en 4,4 GB (cuantizacion Q4_K_M) y responda en menos de un segundo en CPU, manteniendo las capacidades generales de la base de 7B.

Tecnicamente es un transformer denso de 7.615.616.512 parametros (7,62B), derivado de Qwen2.5-7B-Instruct mediante QLoRA en varias etapas, con un contexto declarado de 16k tokens. Se distribuye principalmente en formato GGUF para llama.cpp y Ollama, con licencia Apache-2.0. El interes actual reside en su enfoque de despliegue en dispositivo (on-device), su soporte para aleman y lenguas del espacio bosnio-croata-serbio, y un conjunto de pruebas propio orientado a hechos de producto y rechazos honestos.

La relevancia es limitada pero concreta: es un modelo pequeno, de un solo autor, sin traccion en la comunidad (0 descargas y 0 likes en el momento de la consulta) y con evaluacion basada en un banco de pruebas propio de 23 casos, no en benchmarks estandar. Debe evaluarse como una alternativa ligera y autoalojada para asistentes de producto en aleman y bosnio, no como un modelo de proposito general de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,62B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16k tokens (declarado en la model card) |
| Tipos de cuantizacion | Q4_K_M (GGUF, 4,4-4,7 GB); f16 (14,5 GB) |
| Idiomas soportados | Aleman (de), bosnio (bs), croata (hr), serbio (sr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp/Ollama); repo de 4,7 GB |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-7B-Instruct, un transformer denso con atencion por cabezas y mecanismos estandar de la familia Qwen2.5 (RoPE, atencion causal, normalizacion RMSNorm), aunque la model card no detalla la configuracion interna de capas ni cabezas. El ajuste se realizo mediante QLoRA en varias etapas sobre la base instruct, segun indica el autor. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO adicionales; esa informacion no esta disponible.

La innovacion declarada no es arquitectonica sino de orientacion al producto: el autor organiza la familia por hardware objetivo y documenta un banco de pruebas "congelado" de 23 casos no vistos, disenado para medir hechos de producto, parafrasis, rechazos y polaridad de negacion. Tambien advierte de un detalle operativo concreto: mantener `repeat_penalty` en 1.0, ya que con 1.1 el modelo invirtio una negacion en la variante Phone. No se documentan tecnicas como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto conversacional en aleman, bosnio, croata, serbio e ingles.
- Respuesta a preguntas sobre hechos de producto, con rechazos cuando la respuesta no esta en el contexto.
- Manejo correcto de la polaridad de negacion en las pruebas del autor (por ejemplo, distinguir "funciona en iPhone" frente a "no funciona en Android").
- Procesamiento de documentos (Word, Excel, PDF), codigo, aritmetica basica y resumenes, heredado de la base de 7B.
- Contexto de 16k tokens para documentos de longitud media.
- Ejecucion offline en dispositivo (tableta, equipos de gama media) mediante llama.cpp u Ollama.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`) y uso conversacional.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Asistente de producto offline en tableta: el modelo responde a preguntas sobre funcionalidades y disponibilidad sin conexion, con rechazo honesto cuando el dato no esta en el contexto, gracias a sus 16k tokens de ventana.
- Atencion al cliente en aleman y bosnio: puede gestionar conversaciones multi-turno sobre un catalogo acotado, con la ventaja de ejecutarse en local y evitar el envio de datos a la nube.
- Resumen de documentos ofimaticos: procesa PDF, Word y Excel de longitud media para extraer resumenes, aprovechando el contexto de 16k y las capacidades generales de la base de 7B.
- Asistencia a la redaccion y correccion en lenguas del espacio BCS: util para usuarios de bosnio, croata y serbio que necesitan un asistente local con cobertura linguistica limitada pero funcional.
- Prototipado y pruebas de integracion en llama.cpp/Ollama: sirve como modelo de referencia para validar pipelines de despliegue en dispositivo antes de pasar a modelos mayores.
- Educacion y demostraciones sin conectividad: entornos con requisitos de privacidad o redes restringidas donde un modelo de 4,4 GB en Q4_K_M es viable en CPU.
- Tareas basicas de codigo y aritmetica: generacion de fragmentos y calculos sencillos, con la advertencia de no confiar en multiplicaciones de cuatro digitos.

## Benchmarks y rendimiento

Los unicos datos disponibles son las pruebas propias del autor, no benchmarks estandar:

| Prueba | Resultado |
|---|---|
| Banco congelado, 23 casos no vistos | 22/23 (95,7 %) |
| Desglose | hechos 7/7, parafrasis 3/3, rechazos 5/5, bosnio 2/3, rechazos en bosnio 1/1, largo 1/1, corto 1/1, borde 2/2 |
| Prueba nueva, 12 preguntas nunca vistas | 12/12 (verificado por contenido) |
| Latencia | 0,2-1,1 s en CPU |
| Tamano | 4,7 GB en Ollama (Q4_K_M); 14,5 GB en f16 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 4,4-4,7 GB con cuantizacion Q4_K_M; unos 14,5 GB en f16.
- GPU recomendadas: no se especifican; el modelo esta disenado para CPU y equipos de gama media. Cabe en GPU de consumo con 8 GB o mas (por ejemplo, RTX 3060/4060 en adelante) si se desea aceleracion.
- Cabe en GPU de consumo: si, con cuantizacion Q4_K_M en tarjetas de 8 GB o mas; en CPU funciona con 8 GB de RAM.
- Opciones de despliegue: llama.cpp y Ollama (soporte principal documentado); el tag `endpoints_compatible` sugiere compatibilidad con APIs de endpoints, aunque no se detalla.
- Latencia: 0,2-1,1 s por respuesta en CPU segun el autor. No se publica throughput (tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OpenAmer-Max-Tab | 7,62B | 16k | Apache-2.0 | GGUF en HF, Ollama | Ajuste QLoRA de Qwen2.5-7B-Instruct; evaluacion propia de 23 casos |
| Qwen2.5-7B-Instruct | 7,62B | 32k (segun modelo base) | Apache-2.0 | Amplia, multiples formatos | Base del modelo; contexto mayor y benchmarks publicos |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | Amplia | Mayor contexto; licencia con restricciones de uso |
| Mistral 7B Instruct | 7,3B | 32k | Apache-2.0 | Amplia | Alternativa densa de tamano similar con amplia adopcion |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de resultados de benchmarks comparables entre OpenAmer-Max-Tab y estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento en bosnio limitado: el autor reconoce que una de las preguntas del banco falla por no emplear las palabras "internet"/"mreža", aunque la respuesta sea correcta en sustancia.
- Aritmetica: no hay garantia en multiplicaciones de cuatro digitos; conviene verificar los resultados.
- Razonamiento: con 7,62B no sustituye a modelos de 70B; las cadenas de razonamiento largas son fragiles.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen2.5, puede heredar sesgos de los datos de entrenamiento de la base.
- Alucinacion: el autor enfatiza los rechazos honestos, pero no hay evaluacion independiente de la tasa de alucinacion.
- Licencia: Apache-2.0 permite uso comercial, pero deben respetarse las condiciones de la base Qwen2.5-7B-Instruct.
- Madurez: 0 descargas y 0 likes; sin validacion de la comunidad ni benchmarks estandar. Uso en produccion con cautela.
- Operacion: mantener `repeat_penalty` en 1.0; valores superiores pueden invertir negaciones.
- Contexto: 16k tokens, inferior a los 32k del modelo base Qwen2.5-7B-Instruct.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-tab
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Variante Watch: https://huggingface.co/openamer-max/openamer-max-watch
- Variante Phone: https://huggingface.co/openamer-max/openamer-max-phone
- PayPal del autor: https://www.paypal.com/qrcodes/managed/bfb5b6b5-c04c-4836-af60-987dff8cff61
