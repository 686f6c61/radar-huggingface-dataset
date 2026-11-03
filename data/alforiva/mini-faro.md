# alforiva/mini-faro

## Resumen

Mini-Faro es un modelo de lenguaje de instrucciones de aproximadamente 2.000 millones de parametros, desarrollado por alforiva dentro del proyecto Progetto Siliceo. Se obtiene mediante un ajuste fino del modelo base openbmb/MiniCPM5-2B y esta disenado para ejecutarse localmente en hardware de consumo antiguo, con un peso de 1,28 GB en cuantizacion q4_k_m. Su propuesta diferencial es que la etica y el metodo de trabajo estan entrenados dentro de los pesos, sin capa externa de guardarrailes en inferencia.

El modelo emplea una arquitectura tipo Llama con 42 capas y dimension oculta de 2048, y mantiene la ventana de contexto de 131.072 tokens del modelo base. El vocabulario original de 130.560 tokens se poda a 32.203 tras un proceso de reduccion multilingue centrado en italiano, espanol e ingles, lo que reduce el coste de embeddings y adapta el modelo a los tres idiomas objetivo. El ajuste se realiza con la receta Candela: poda de vocabulario, redimensionado de embeddings, preentrenamiento continuado constitucional y SFT supervisado sobre aproximadamente 480 trazas curadas.

Es relevante ahora porque demuestra un enfoque poco habitual en modelos pequenos: priorizar el comportamiento honesto (citar fuentes, refutar premisas falsas, reconocer limites) sobre el conocimiento generalista, y publicar de forma transparente tanto los exitos como los fallos. Ademas, se distribuye como GGUF para llama.cpp, lo que facilita su despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer denso) |
| Parametros totales | 2.113.886.208 (~2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF q4_k_m (1,28 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | Italiano, espanol, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Capas | 42 |
| Dimension oculta | 2048 |
| Vocabulario | 130.560 original, podado a 32.203 (24,7% conservado) |
| Embeddings | no atados (embed y lm_head separados) |
| Modelo base | openbmb/MiniCPM5-2B |
| Tamano del repo | 1,3 GB |

## Arquitectura y entrenamiento

Mini-Faro es un transformer denso de arquitectura Llama con 42 capas y dimension oculta de 2048, derivado de openbmb/MiniCPM5-2B. El proceso de ajuste, denominado receta Candela, consta de cuatro fases: poda del vocabulario multilingue para conservar solo italiano, espanol e ingles (de 130.560 a 32.203 tokens), redimensionado de los embeddings, preentrenamiento continuado constitucional y ajuste supervisado sobre aproximadamente 480 trazas curadas. El entrenamiento se realizo en una GPU RTX 2070 de 8 GB, lo que subraya el caracter de bajo coste del proyecto.

Una innovacion destacable es el uso de QLoRA para el ajuste fino y la integracion de una constitucion y un metodo de trabajo directamente en los pesos, sin capa de guardarrailes externa en inferencia. La ablation reportada por el autor muestra el efecto de cada fase sobre el bench de 112 preguntas: base 55,4%, poda de vocabulario 52,7%, preentrenamiento continuado constitucional 40,2% (el modelo recita el metodo en lugar de usarlo) y SFT sobre trazas 84,8-85,7%. Esto indica que la fase de SFT es la que aporta la mayor parte de la competencia practica.

## Capacidades

- Generacion de texto conversacional en italiano, espanol e ingles.
- Razonamiento de dominio limitado al paquete de conocimiento entrenado (knowledge pack).
- Refutacion de premisas falsas: obtiene 0,932 en la accion `refute` del Candela Bench.
- Citacion de fuentes del paquete de conocimiento en el 60% de sus respuestas.
- Reconocimiento de limites y rechazo con justificacion: 0,973 en `refuse` y 0,933 en `confine`.
- Verificacion de afirmaciones: 0,929 en `verify`.
- Solicitud de datos faltantes: 0,581 en `ask` (debil).
- Cumplimiento de peticiones benignas: 0,529 en `comply` (el punto mas debil).
- Tool calling / function calling: no adaptado en v1 (entrenado sin trazas de herramientas).
- Capacidades de agente multi-paso: no disponible.
- Modo thinking: no disponible; el razonamiento debe desactivarse en el servicio (`--reasoning-budget 0`).
- Vision y audio: no disponibles.

## Casos de uso

- Asistente local siempre encendido en hardware antiguo: con 1,28 GB en q4_k_m y unos 1,5 GB de VRAM con cache KV cuantizada, puede ejecutarse en una GPU de 4 GB y mantener conversaciones multi-turno con contexto largo de hasta 131.072 tokens, lo que lo hace adecuado para un asistente domestico de bajo consumo.
- Atencion al cliente con base de conocimiento acotada: el modelo cita fuentes del paquete en el 60% de las respuestas y refuta premisas falsas con 0,932 de acierto, por lo que puede gestionar consultas dentro de un dominio cerrado y corregir afirmaciones erroneas del usuario.
- Moderacion etica y rechazo justificado: con 0,973 en `refuse` y 0,933 en `confine`, puede integrarse en flujos donde se requiera declinar peticiones con una razon explicita y mantener el alcance del dominio.
- Verificacion de afirmaciones en documentacion tecnica: la accion `verify` alcanza 0,929, lo que permite usarlo para contrastar datos contra un corpus de referencia y senalar discrepancias.
- Despliegue en entornos sin conectividad ni servicios externos: al ser un GGUF para llama.cpp y no depender de una capa de guardarrailes en linea, puede operar completamente offline en un portatil o mini-PC.
- Prototipado e investigacion sobre alineamiento en modelos pequenos: sirve como modelo de referencia de ablation de la familia Faro, con fases medidas y un benchmark propio reproducible (Candela Bench) para estudiar comportamiento honesto.
- Traduccion y generacion de texto entre italiano, espanol e ingles: el vocabulario podado a estos tres idiomas reduce el coste de embeddings y concentra la capacidad en el trilinguismo.

## Benchmarks y rendimiento

Resultados publicados por el autor. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Prueba | Resultado |
|---|---|
| Faro bench (112 preguntas, 10 dominios) | 95/95/96 aciertos (84,8-85,7%) en tres ejecuciones |
| Ethics probe (16 casos) | 12/16 (dos ejecuciones) |
| Anti-hoax (12 casos) | 6/12 |
| Tool calls | no adaptado en v1 |

Candela Bench (439 items, IT/EN/ES, 6 modulos, scorer v0.2):

| Metrica | Valor |
|---|---|
| Honesty Index (content) | 0,816 |
| Honesty Index (strict) | 0,776 |
| Citacion de fuente del pack | 60% de las respuestas |
| Respuestas vacias | 0 |
| Respuestas que alcanzaron el limite de contexto | 3 |

Desglose por accion:

| Accion | Puntuacion |
|---|---|
| answer | 0,784 |
| refute | 0,932 |
| refuse | 0,973 |
| verify | 0,929 |
| ask | 0,581 |
| confine | 0,933 |
| comply | 0,529 |
| call | n/a (excluido, sin definiciones de herramientas) |

Ablation de fases sobre el bench de 112 preguntas:

| Fase | Precision |
|---|---|
| Base | 55,4% |
| Poda de vocabulario | 52,7% |
| Preentrenamiento continuado constitucional | 40,2% |
| SFT sobre trazas | 84,8-85,7% |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB con cache KV cuantizada en una GPU de 4 GB; el archivo GGUF q4_k_m ocupa 1,28 GB.
- GPU recomendadas: RTX 2070 de 8 GB (hardware de entrenamiento declarado); cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar la inferencia.
- Cabe en GPU consumer: si, incluidas tarjetas de gama baja con 4 GB o mas.
- Opciones de despliegue: llama.cpp (llama-server), beellama y runtimes compatibles con GGUF; requiere `--jinja` para aplicar la plantilla de chat propia del modelo.
- Configuracion de servicio reportada: `-c 8192 -ngl 99 -fa on --cache-type-k turbo4 --cache-type-v turbo3_tcq --jinja --reasoning-budget 0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Mini-Faro | ~2B | 131.072 | IT, ES, EN | Apache 2.0 | GGUF | Etica en pesos, sin tool calling, bench propio |
| openbmb/MiniCPM5-2B (base) | ~2B | no disponible | no disponible | no disponible | no disponible | Modelo base; 55,4% en el Faro bench |
| Alternativas de ~2B para on-device | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks estandar para establecer una comparacion cuantitativa con otros modelos de la misma categoria.

## Limitaciones y advertencias

- No es un modelo generalista: su conocimiento de dominio proviene del paquete de conocimiento entrenado y queda limitado a el.
- El cumplimiento de peticiones benignas (`comply`) es debil (0,529): rechaza solicitudes inofensivas como una receta, un saludo de cumpleanos o una traduccion alegando que "no esta en el paquete".
- La solicitud de datos faltantes (`ask`) es limitada (0,581).
- La prueba anti-hoax obtiene solo 6/12, por lo que la resistencia a bulos es parcial.
- No soporta tool calling ni function calling en v1: fue entrenado sin trazas de herramientas.
- El razonamiento debe desactivarse en el servicio (`--reasoning-budget 0`); no dispone de modo thinking.
- Es imprescindible usar la plantilla de chat propia del modelo; fuera de ella responde mal.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, aunque el diseno prioriza la citacion y la refutacion.
- Sesgos conocidos: no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento en dominios fuera del paquete de conocimiento.
- El Candela Bench es un benchmark propio del autor, no un estandar de la industria; el evaluador por defecto del repositorio sigue siendo v0.1, mientras que las puntuaciones publicadas usan el scorer v0.2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alforiva/mini-faro
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Proyecto Siliceo: https://progettosiliceo.online
- Resultados interactivos: https://progettosiliceo.online/faro.html
- Informe tecnico (IT): https://progettosiliceo.online/papers/paper-faro-v1-it.pdf
- Informe tecnico (EN): https://progettosiliceo.online/papers/paper-faro-v1.pdf
- Informe tecnico (ES): https://progettosiliceo.online/papers/paper-faro-v1-es.pdf
