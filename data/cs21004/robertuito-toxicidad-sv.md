# cs21004/robertuito-toxicidad-sv

## Resumen

RoBERTuito-Toxicidad-SV es un clasificador de texto en español especializado en toxicidad y discurso de odio en publicaciones de X y Facebook dentro del contexto salvadoreño. Lo desarrolla el equipo formado por Cristian Antonio Escalante Hernández, Julio Enrique De La Quadra Mata y Willian Alexander Chávez Servellón como trabajo de graduación del Curso de Especialización en Machine Learning de la Universidad de El Salvador (2026). Parte del modelo base `pysentimiento/robertuito-base-cased` y se distribuye bajo licencia Apache 2.0.

El modelo resuelve un problema concreto: la moderación de contenido en variedades dialectales del español poco representadas en los corpus generales. Para ello distingue cuatro clases (No Tóxico, Lenguaje Ofensivo, Discurso de Odio y Amenazas/Violencia) aplicando una precedencia explícita entre ellas, y se ha entrenado con 20.028 textos reales y sintéticos anotados por consenso de anotadores.

Técnicamente es un transformer encoder de tipo RoBERTa con 108.790.276 parámetros (aproximadamente 109 M), contexto de entrada de 128 tokens y salida de clasificación multiclase. Su interés actual reside en que demuestra un flujo de destilación de un ensamble de tres modelos hacia un único estudiante ligero, desplegable en hardware de consumo, con calibración de probabilidades y métricas reportadas con intervalos de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (RoBERTuito base cased) |
| Parametros totales | 108.790.276 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion estandar de PyTorch, no documentada por el autor) |
| Idiomas soportados | es (español, con enfasis en español salvadoreño) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia RoBERTa, inicializado desde `pysentimiento/robertuito-base-cased`, un modelo preentrenado sobre 500 millones de tuits en español. Sobre esa base se anade una cabeza de clasificacion de secuencias con cuatro etiquetas. La entrada se trunca a 128 tokens y se procesa con un normalizador propio (`normalization.py`) que aplica Unicode NFC, sustituye menciones y URLs por marcadores y convierte emojis a texto en español, sin pasar a minusculas ni eliminar tildes.

El entrenamiento sigue un esquema de destilacion de conocimiento: un profesor compuesto por tres instancias de RoBERTuito (semillas 42, 1337 y 2026) con hiperparametros elegidos por Optuna y validacion cruzada por hilos, y un estudiante unico RoBERTuito entrenado con una perdida combinada α·T²·KL + (1 − α)·CE con α = 0.5 y T = 1. Los datos provienen del dataset del proyecto v2.0.0 (20.028 textos: 8.914 No Toxico, 5.453 Ofensivo, 2.876 Odio y 2.785 Amenazas), con particion por hilos para evitar fuga de informacion. Los hiperparametros principales son learning rate 3,92e-5, 4 epocas, batch 32, weight decay 0,0060, warmup 0,116, peso de hilos 1,53, pesos de clase de Odio y Amenazas multiplicados por 1,91 y early stopping con paciencia 2 sobre F1-macro. El entrenamiento completo se realizo en una unica GPU NVIDIA RTX 4060 Laptop de 8 GB (unos 30 minutos el profesor y 12 minutos por semilla del estudiante). Las probabilidades se calibran en inferencia con temperatura T = 1,415, ajustada en validacion.

## Capacidades

- Clasificacion de texto multietiqueta en cuatro clases con precedencia definida: Amenazas/Violencia > Discurso de Odio > Lenguaje Ofensivo > No Toxico.
- Deteccion de insultos y vulgaridades sin grupo protegido implicado (clase Lenguaje Ofensivo).
- Deteccion de ataques a personas por pertenencia a un grupo protegido (clase Discurso de Odio).
- Deteccion de amenazas, incitacion, deseo o celebracion de dano fisico, tanto explicito como implicito (clase Amenazas/Violencia).
- Tratamiento de groserias afectivas como No Toxico: en la sonda del autor, 17 de 20 groserias afectivas se clasificaron como No Toxico y 18 de 18 insultos se detectaron.
- Normalizacion de texto especifica para redes sociales: menciones, URLs, emojis y Unicode NFC.
- Calibracion de probabilidades mediante temperatura (T = 1,415) para obtener confianzas mas fiables (ECE 0,024 tras calibrar).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido: es exclusivamente un clasificador de texto.

## Casos de uso

- Moderacion asistida en comunidades salvadorenas: el modelo puede prefiltrar publicaciones de X y Facebook y priorizar para revision humana aquellas con probabilidad alta de Amenazas o Discurso de Odio, reduciendo el volumen que llega a los moderadores.
- Deteccion de amenazas en hilos publicos: gracias a su entrenamiento con hilos reales de X (amenazas, futbol y humor, politica), puede identificar incitacion o celebracion de dano fisico en conversaciones multi-turno cuando se clasifica cada mensaje por separado.
- Analisis de discurso de odio en estudios sociales: investigadores pueden aplicar el modelo a corpus de redes sociales salvadorenas para cuantificar la prevalencia de las cuatro clases, usando los intervalos de confianza reportados para dimensionar la incertidumbre.
- Filtrado previo en plataformas de comentarios: con 109 M de parametros y contexto de 128 tokens, el modelo se ejecuta con baja latencia en CPU o GPU de consumo, lo que permite integrarlo como paso de preclasificacion en pipelines de comentarios a gran escala.
- Monitorizacion de campanas de odio contra migrantes o colectivos concretos: el banco congelado del test incluye hilos de migrantes, militares y pandilleros y xenofobia, por lo que el modelo es adecuado para vigilar estos ejes tematicos en el contexto salvadoreno.
- Apoyo a equipos de confianza y seguridad en producto: la calibracion de probabilidades permite fijar umbrales operativos con una tasa de falsos positivos controlada (0,089 de falsos positivos sobre No Toxico en el test principal).
- Investigacion academica sobre dialectologia y toxicidad: sirve como linea base reproducible para comparar el rendimiento de modelos multilingues genericos frente a un encoder especializado en español salvadoreno.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | v3.6.0 (test principal, n = 3.366) | v3.4.0 (version anterior) |
|---|---|---|
| F1-macro [IC 95 %] | 0,752 [0,728; 0,774] | 0,708 [0,683; 0,731] |
| Exactitud | 0,859 | 0,835 |
| F1 por clase (NT / OF / OD / AM) | 0,916 / 0,812 / 0,577 / 0,705 | 0,902 / 0,783 / 0,566 / 0,581 |
| Recall por clase (NT / OF / OD / AM) | 0,911 / 0,827 / 0,595 / 0,679 | 0,903 / 0,786 / 0,614 / 0,539 |
| Falsos positivos (No Toxico marcado toxico) | 0,089 | 0,097 |
| Toxicos no detectados | 0,141 | 0,177 |
| AUROC toxico vs. no toxico | 0,952 | 0,940 |
| ECE tras calibrar | 0,024 | 0,043 |

| Test | F1-macro [IC 95 %] |
|---|---|
| Test oficial Etapa I (n = 460) | 0,827 [0,791; 0,861] |
| Test oficial Etapa I, subconjunto X | 0,857 |
| Test oficial Etapa I, subconjunto Facebook | 0,757 |

Sonda de groserias afectivas: 17 de 20 clasificadas como No Toxico; 18 de 18 insultos detectados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos (109 M de parametros), mas activaciones y overhead de framework; en la practica menos de 2 GB con batch pequeno.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 4060, GTX 1660, etc.). El autor entreno en una RTX 4060 Laptop de 8 GB.
- Tambien es viable en CPU para inferencia de baja concurrencia, dado el tamano reducido y el contexto de 128 tokens.
- GPU de centro de datos (A100, H100, L4) no son necesarias; solo tendrian sentido para despliegues de muy alto throughput con batching agresivo.
- Opciones de despliegue: transformers (PyTorch) como via documentada por el autor; el tag `text-embeddings-inference` y `endpoints_compatible` sugiere compatibilidad con Hugging Face Text Embeddings Inference y endpoints gestionados. Tambien es desplegable con TorchServe o FastAPI envolviendo el pipeline de transformers. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1-macro reportado | Licencia | Enfoque |
|---|---|---|---|---|---|
| cs21004/robertuito-toxicidad-sv | 108.790.276 | 128 tokens | 0,752 (test principal); 0,827 (test oficial) | Apache 2.0 | Toxicidad en español salvadoreno, 4 clases |
| pysentimiento/robertuito-base-cased | aproximadamente 109 M | no disponible en la informacion | no disponible | no disponible en la informacion | Modelo base preentrenado en 500 M de tuits en español; no es un clasificador de toxicidad por si mismo |
| caeher/robertuito-v3-sv | no disponible | no disponible | no disponible | no disponible | Variante de RoBERTuito para español salvadoreno (encontrada en la busqueda web, sin datos tecnicos en la informacion) |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un moderador autonomo: el autor lo disena explicitamente como apoyo a la revision humana, no como sistema de decision automatica.
- Discurso de Odio es la clase mas debil (recall 0,595 y F1 0,577 en el test principal), por lo que una fraccion relevante de odio real puede pasar sin detectar.
- Sesgo de jerga salvadorena: en hilos nuevos marca como toxico el 4,3 % de textos inofensivos con jerga (n = 47), pero en el test oficial esta tasa sube al 38 % (n = 29), lo que indica inestabilidad del comportamiento fuera de la distribucion de entrenamiento.
- Rendimiento inferior en Facebook: aproximadamente 10 puntos menos de F1 que en X, segun el autor.
- Las etiquetas de los hilos de entrenamiento son consenso de anotadores LLM, sin validacion humana sistematica, lo que introduce ruido en las etiquetas y limita la fiabilidad de las metricas.
- El corpus contiene lenguaje ofensivo explicito; su uso en produccion debe acompanarse de politicas de tratamiento de datos y de proteccion de las personas anotadoras.
- Riesgo de alucinacion no aplica en el sentido generativo (es un clasificador), pero existe riesgo de clasificacion erronea con confianza alta en textos fuera de dominio.
- Contexto limitado a 128 tokens: mensajes largos se truncan, lo que puede perder informacion relevante en publicaciones extensas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como trabajo academico sin garantias ni soporte; el autor no ofrece SLA ni mantenimiento.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no existe validacion independiente de terceros sobre los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cs21004/robertuito-toxicidad-sv
- Modelo base: https://huggingface.co/pysentimiento/robertuito-base-cased
- Repositorio de RoBERTuito: https://github.com/pysentimiento/robertuito
- Variante relacionada encontrada en la busqueda: https://huggingface.co/caeher/robertuito-v3-sv
