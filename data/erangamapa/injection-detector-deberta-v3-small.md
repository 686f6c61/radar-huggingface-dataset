# erangamapa/injection-detector-deberta-v3-small

## Resumen

erangamapa/injection-detector-deberta-v3-small es un clasificador encoder de tipo DeBERTa v3 small, afinado por el usuario erangamapa a partir de microsoft/deberta-v3-small, cuyo objetivo es puntuar texto de entrada no confiable para detectar intentos de prompt injection. El modelo se presenta como una barrera rapida que se coloca delante de agentes que leen texto de terceros: una puntuacion positiva permite bloquear o escalar el contenido antes de que llegue al modelo principal. Es, por tanto, un componente de seguridad perimetral y no un modelo generativo.

El modelo parte de la arquitectura DeBERTa v3 small, un transformer encoder con atencion disentangled y embeddings de posicion relativos, en su variante pequena (aproximadamente 44 millones de parametros en su version original, aunque el autor no detalla el recuento exacto en la model card). Se ha especializado en un dominio concreto, el de apuestas deportivas (sportsbook), combinando publicaciones benignas de ese ambito con cadenas de inyeccion sinteticas y de estilo publico.

Su relevancia actual es acotada pero clara: los sistemas agenticos que procesan contenido externo (comentarios, correos, paginas web) necesitan filtros ligeros y de baja latencia que reduzcan la superficie de ataque de prompt injection. Este modelo cubre ese nicho con licencia Apache 2.0 y pesos en safetensors, aunque con un alcance de dominio estrecho y sin datos publicos de benchmarks independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa v3 small, atencion disentangled) |
| Parametros totales | no disponible (base DeBERTa v3 small, ~44 M en su version original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (la model card advierte cobertura escasa en textos no ingleses) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors unicamente (el autor no sube formatos basados en pickle) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de microsoft/deberta-v3-small, un encoder transformer con atencion disentangled (contenido y posicion separados) y embeddings de posicion relativos. Al ser un encoder de clasificacion, produce una puntuacion de inyeccion para el texto de entrada en lugar de generar texto. La model card no especifica la longitud maxima de secuencia ni la estrategia de pooling o cabeza de clasificacion empleada.

El entrenamiento utilizo 40.000 filas de entrenamiento y 5.000 de desarrollo con semilla 42. Los datos combinan publicaciones benignas de apuestas deportivas con cadenas de inyeccion sinteticas y de estilo publico. Las etiquetas provienen de un modelo profesor con auditoria humana sobre una muestra, lo que implica que los errores del profesor pueden ser heredados por el estudiante. No se documentan fases de RLHF ni DPO, algo coherente con un clasificador supervisado.

## Capacidades

- Clasificacion binaria o puntuacion de riesgo de prompt injection sobre texto de entrada.
- Actua como guardia previo a agentes que leen contenido no confiable (comentarios, correos, paginas).
- Baja latencia esperada por su tamano de encoder pequeno, adecuada para filtrado en linea.
- Entrenado especificamente sobre texto de dominio sportsbook, con sesgo hacia ese vocabulario.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni capacidades multimodales.
- Cobertura multilingue limitada segun la propia model card (escasa en textos no ingleses y ligas menores).

## Casos de uso

- Filtro de entrada en agentes conversacionales: colocar el detector delante del LLM principal para bloquear o escalar mensajes de usuario que contengan patrones de inyeccion antes de que se procesen.
- Moderacion de comentarios en plataformas de apuestas: puntuar publicaciones de usuarios y derivar a revision humana aquellas con score alto, reduciendo carga manual.
- Proteccion de pipelines RAG: validar fragmentos de documentos externos antes de insertarlos en el contexto del modelo generativo, evitando inyecciones indirectas.
- Guardia en correo y formularios de soporte: clasificar tickets o correos entrantes y marcar los sospechosos para cuarentena o analisis adicional.
- Capa de defensa en profundidad: combinarlo con otras tecnicas (delimitadores, validacion de salida, permisos minimos) como una capa mas del sistema de seguridad.
- Evaluacion de contenido en tiempo real: al ser un encoder pequeno, puede desplegarse en CPU o GPU modestas para clasificar grandes volumenes de texto con baja latencia.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen del fichero de metricas del propio entrenamiento, no de una evaluacion independiente:

| Metrica | Valor |
|---|---|
| Precision | 0.981 |
| Recall | 0.942 |
| F1 | 0.961 |

El autor advierte que estas cifras no sustituyen a la suite de evaluacion (evalgate) y que no se han publicado resultados en benchmarks publicos estandar (MMLU, HumanEval, GSM8K no aplican a un clasificador de este tipo).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un encoder de ~44 M de parametros en fp32 ocupa del orden de 180 MB de pesos, y en fp16 alrededor de 90 MB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) e incluso CPU es suficiente para inferencia en linea.
- Cabe holgadamente en GPU consumer y en entornos sin GPU.
- Opciones de despliegue: transformers con PyTorch, ONNX Runtime, o servidores de inferencia compatibles con endpoints (el tag endpoints_compatible sugiere despliegue gestionado).
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo se espera latencia de milisegundos por peticion en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| erangamapa/injection-detector-deberta-v3-small | ~44 M (base) | no disponible | Clasificador de prompt injection dominio sportsbook | Apache 2.0 | HuggingFace |
| microsoft/deberta-v3-small | ~44 M | 512 tokens (version original) | Encoder generalista | MIT | HuggingFace |
| ProtectAI/deberta-v3-base-prompt-injection | ~86 M (base) | no disponible | Clasificador de prompt injection generalista | Apache 2.0 | HuggingFace |

No se dispone de comparativas de rendimiento publicadas entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, licencia y enfoque.

## Limitaciones y advertencias

- Frases de ataque novedosas pueden evadir el detector; debe tratarse como una capa, no como la unica defensa.
- Las etiquetas provienen de un modelo profesor con auditoria parcial, por lo que sus errores pueden propagarse al estudiante.
- Cobertura escasa de ligas menores y de textos no ingleses, lo que reduce su fiabilidad fuera del dominio previsto.
- Entrenado sobre texto de sportsbook; su generalizacion a otros dominios no esta documentada.
- Riesgo de falsos positivos y negativos no cuantificado fuera del conjunto de desarrollo.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor no ofrece garantias sobre el rendimiento en produccion.
- No se documentan sesgos especificos mas alla de la cobertura linguistica y de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erangamapa/injection-detector-deberta-v3-small
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
