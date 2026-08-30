# romainkh14/RWKV-7-G1-0.1B_BRIK

## Resumen

RWKV-7 «G1» 0.1B es un modelo de lenguaje recurrente desarrollado por el proyecto RWKV (BlinkDL) bajo licencia Apache-2.0, convertido al formato BRIK por romainkh14 para ejecutarse directamente en el navegador mediante WebGPU, sin necesidad de servidor de inferencia. El modelo base, `fla-hub/rwkv7-0.1B-g1`, pertenece a la serie G1 de RWKV-7 «Goose», que incorpora una mayor cantidad de datos de entrenamiento y capacidades de razonamiento profundo («deep thinking»). La conversión a BRIK pre-cuantiza los pesos en int4 dentro de un contenedor autodescriptivo, lo que permite cargar el modelo de forma eficiente desde un único archivo de 128 MB.

Su relevancia actual radica en que ofrece inferencia de lenguaje en el dispositivo del usuario final (on-device) con un coste de memoria constante: al ser recurrente, no necesita un KV cache que crezca con la conversación, a diferencia de los transformadores. Esto lo hace adecuado para aplicaciones ligeras de chat y clasificación en entornos con recursos limitados, aunque el propio autor advierte explícitamente de sus limitaciones para tareas de lectura de documentos. Con 0.1B de parámetros y una arquitectura de 12 bloques con dimensión 768, es el modelo más pequeño del catálogo Brimkern y el más rápido en decodificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (RNN recurrente, atención lineal, sin KV cache) |
| Parametros totales | 0,1B (aproximadamente 100 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada; RWKV-7 soporta contexto largo por diseño recurrente |
| Tipos de cuantizacion | int4 (pre-cuantizado en el layout de los kernels, sin dequantización en carga) |
| Idiomas soportados | inglés y francés (segun model card); el modelo base es multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | BRIK (contenedor autodescriptivo con tokenizer embebido, pesos pre-cuantizados) |

## Arquitectura y entrenamiento

RWKV-7 combina las ventajas de un RNN con la paralelización de un transformer. Su estado interno tiene un tamaño fijo de aproximadamente 1 MB, lo que sustituye al KV cache de los transformadores y garantiza que el consumo de memoria no crezca con la longitud de la conversación. El modelo base `rwkv7-0.1B-g1` fue entrenado por el proyecto RWKV (Bo Peng, Yu Zhang, Songlin Yang y Ruichong Zhang, financiado por LF AI & Data Foundation) con una cantidad significativa de datos multilingües y con técnicas de «deep thinking» que mejoran el razonamiento. La conversión a BRIK realizada por romainkh14 no modifica los pesos, sino que los reorganiza en un formato pre-cuantizado int4 que los kernels WGSL de Brimkern leen directamente, eliminando la necesidad de dequantización en tiempo de carga. El tokenizer (vocabulario RWKV World de 65 536 entradas) viaja embebido dentro del archivo `.brik`.

## Capacidades

- Generacion de texto y conversacion multi-turno con estado recurrente de tamaño constante.
- Clasificacion de texto y deteccion de intenciones, especialmente en tareas de alcance limitado.
- Razonamiento basico y respuestas cortas de asistencia (saludos, rechazos fuera de alcance).
- Capacidades multilingues heredadas del modelo base, aunque la model card solo certifica ingles y frances.
- Inferencia en navegador via WebGPU sin servidor, gracias al formato BRIK y al motor Brimkern.
- No soporta tool calling ni function calling (no documentado).
- No soporta vision, audio ni otras modalidades.
- No es adecuado para lectura de documentos ni question answering con contexto externo (segun mediciones del autor).

## Casos de uso

- Chat ligero en el navegador: el modelo puede mantener conversaciones de multiple turno con memoria constante gracias a su estado recurrente de ~1 MB, lo que lo hace viable en portatiles y dispositivos con poca RAM.
- Clasificacion de intenciones en formularios web: al ser rapido (62.9 tok/s medido en Apple Silicon) y no requerir servidor, puede clasificar peticiones de usuarios en categorias predefinidas directamente en el cliente.
- Asistente de respuestas cortas para FAQs: sirve para generar respuestas breves y estandarizadas en ingles o frances, sin necesidad de infraestructura backend.
- Prototipado de aplicaciones de IA on-device: los desarrolladores pueden integrar el modelo en demos o pruebas de concepto que requieran generacion de texto sin depender de APIs externas.
- Filtrado o moderacion de contenido en tiempo real: su velocidad de decodificacion y bajo coste permiten analizar fragmentos de texto cortos y aplicar reglas de clasificacion en el navegador.
- Educacion y demostraciones de arquitecturas recurrentes: al ser un modelo pequeno y ejecutable en el navegador, sirve como ejemplo didactico de RWKV-7 y del formato BRIK.

## Benchmarks y rendimiento

El autor publica una medicion propia de velocidad y un resultado en un bench interno de lectura de documentos. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

| Prueba | Resultado |
|---|---|
| Decodificacion (Chrome, Apple Silicon, produccion) | 62.9 tok/s |
| Document Q&A bench (`sdk-rag.mjs`, 2 rondas EN/FR) | 6/24 |

El autor indica que el modelo falla en lectura de documentos: responde con rechazos canonicos cuando el contexto es correcto y, cuando lee, copia el documento completo incluyendo datos no permitidos. Recomienda modelos mayores para esa tarea.

## Requisitos de hardware

- Navegador compatible con WebGPU (Chrome, Edge, Safari Technology Preview, etc.) y una GPU que soporte WebGPU (integrada o dedicada).
- Tamaño del archivo: 128 MB (descarga unica, sin dependencias adicionales de tokenizer).
- Memoria de estado recurrente: aproximadamente 1 MB, independiente de la longitud de la conversacion.
- No requiere servidor de inferencia ni GPU dedicada en el backend; la inferencia ocurre en el dispositivo del usuario.
- El motor Brimkern utiliza kernels WGSL escritos a mano; la especificacion del formato BRIK esta disponible en el repositorio.
- Para despliegue local fuera del navegador, se puede usar el modelo base `fla-hub/rwkv7-0.1B-g1` con librerias como Transformers, pero la version BRIK esta optimizada exclusivamente para WebGPU.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria en la informacion proporcionada. El autor menciona dos alternativas en formato BRIK:

| Modelo | Tamano | Uso recomendado |
|---|---|---|
| RWKV-7-G1-0.1B_BRIK | 0.1B | Chat y clasificacion; no apto para document Q&A (6/24) |
| RWKV-7-G1a-0.4B_BRIK | 0.4B | Document Q&A (10/12) |
| LFM2.5-230M_BRIK | 230M | Document Q&A (12/12) |

No se han publicado comparativas con modelos fuera del ecosistema Brimkern.

## Limitaciones y advertencias

- No es apto para lectura de documentos ni question answering con contexto externo: el propio autor publica un resultado de 6/24 en su bench interno y recomienda otros modelos para esa tarea.
- Riesgo de alucinacion: cuando intenta leer documentos, tiende a copiar el contenido completo, incluyendo datos que deberia omitir.
- Tamano muy reducido (0.1B): su capacidad de razonamiento y conocimiento general es limitada en comparacion con modelos mayores.
- Idiomas certificados: la model card indica ingles y frances, aunque el modelo base es multilingue; no se garantiza un rendimiento adecuado en otros idiomas.
- Requiere un navegador con WebGPU y una GPU compatible; en navegadores o dispositivos sin soporte, el modelo no puede ejecutarse.
- Licencia Apache-2.0 para los pesos, pero el motor Brimkern es MIT; se debe verificar la compatibilidad de la licencia en proyectos propietarios.
- No se han publicado benchmarks estandar (MMLU, HumanEval, etc.), por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/romainkh14/RWKV-7-G1-0.1B_BRIK
- Modelo base (fla-hub): https://huggingface.co/fla-hub/rwkv7-0.1B-g1
- Repositorio RWKV-LM: https://github.com/BlinkDL/RWKV-LM
- Sitio oficial RWKV: https://www.rwkv.com/
- Modelo en ModelScope: https://www.modelscope.cn/models/fla-hub/rwkv7-0.1B-g1
- Web de Brimkern: https://brimkern.com
- Repositorio Brimkern: https://github.com/RomainKH/Brimkern
- Especificacion del formato BRIK: https://github.com/RomainKH/Brimkern/blob/main/BRIK_FORMAT.md
- Modelo alternativo G1a 0.4B: https://huggingface.co/romainkh14/RWKV-7-G1a-0.4B_BRIK
- Modelo alternativo LFM2.5-230M: https://huggingface.co/romainkh14/LFM2.5-230M_BRIK
