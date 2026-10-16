# JonathanKovatsch/parlpdfech-heads

## Resumen

ParlPDFeCH value heads es un conjunto de 8 cabezas lineales (linear probes) que se acoplan al estado residual tras la capa 20 del decodificador de Apertus-v1.5-8B para tomar decisiones de clasificacion durante la conversion de PDFs de parlamentos suizos al registro eCH-0295. No es un modelo generativo: no escribe texto. Lo publica JonathanKovatsch en el marco del hackathon Apertus y consta de tres ficheros: `heads2.npz` con los pesos, `entry.json` con las decisiones que entraron en el conversor y `calibration_dev_combined.json` con la calibracion.

El problema que aborda es acotado pero critico dentro del pipeline: cuando las reglas del conversor no encuentran un valor o solo hallan uno debil, las cabezas leen el estado oculto del modelo base en el ultimo token de cada pregunta y deciden el tipo de asunto (q1, 7 clases), el tipo de documento (q0, 4 clases) y seis campos binarios (numero de asunto, titulo, fecha de presentacion, proponente, fecha de respuesta y respondiente). Las cabezas solo son validas para un unico modelo: la rama de texto de `swiss-ai/Apertus-v1.5-8B`, revision `ef4bbc54d6fe658bc782280ff9f3b53a10a9758f`, en bf16 sin cuantizar.

Su interes practico es metodologico: demuestra un patron de bajo coste para anadir extraccion estructurada sobre un LLM congelado sin reentrenarlo, mediante regresion logistica y softmax con penalizacion L2 entrenadas sobre estados intermedios. La licencia es CC BY 4.0 y los idiomas cubiertos son aleman, frances e italiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de regresion logistica y softmax (linear probes) sobre el estado residual tras la capa 20 del decodificador transformer de Apertus-v1.5-8B |
| Parametros totales | No disponible el recuento de las cabezas; el modelo base Apertus-v1.5-8B tiene 8.000 millones de parametros |
| Parametros activos | No aplica: no es una arquitectura MoE |
| Longitud de contexto | 32.768 tokens heredados del modelo base; 1 de los 1.793 documentos de desarrollo lo superaba |
| Tipos de cuantizacion | No disponible para las cabezas (pesos en float32). Los estados de entrenamiento se capturaron en bf16 sin cuantizar; el modelo base cuantizado invalida las cabezas |
| Idiomas soportados | Aleman (de), frances (fr), italiano (it) |
| Licencia | CC BY 4.0 |
| Formato de pesos | NPZ de NumPy (`heads2.npz`, claves `__w`, `__b`, `__mu`, `__sd`, `__lambda` en float32); decisiones y calibracion en JSON |

## Arquitectura y entrenamiento

Cada cabeza es una regresion lineal (logistica para las binarias, softmax para las multiclase) con penalizacion L2 sobre entradas estandarizadas, ajustada con LBFGS de torch en CPU sobre una rejilla de lambda de 0.001, 0.01 y 0.1. Se entrenaron 5 pliegues por parlamento y una cabeza final (modelo 5) ajustada sobre todos los documentos del conjunto de ajuste. Hay 8 cabezas en total: `q0` (4 clases, tipo de documento), `q1` (7 clases: interpellation, request, draft_decree, motion, postulate, parliamentary_initiative y none) y seis binarias `q2_<campo>`. Las etiquetas provienen del export de OpenParlData del 04.10.2026, que es un registro de referencia y no un conjunto gold.

Los estados se extrajeron con la rama de texto de Apertus-v1.5-8B en bf16, sin cuantizacion, con torch CUDA sobre una maquina virtual con una sola GPU H100. El documento completo se inserta en el prompt, se hace un forward pass por pregunta y se guarda el estado residual tras la capa 20 en el ultimo token, almacenado en float16. El corpus de ajuste fueron 1.793 documentos de desarrollo de 44 parlamentos suizos (1.792 con estados), lo que genera 98.174 filas, una por pregunta y documento. La plantilla de prompt es `gj_values_v1_de` (SHA-256 `54abf49ab788b2779b7bd00d8ebfb99abb3daf0fbe076e274fec30851dca81f6`) y el codigo verifica tanto la huella del modelo como la de la plantilla antes de leer cualquier estado.

## Capacidades

- Clasificacion del tipo de asunto parlamentario en 7 clases: interpelacion, solicitud, proyecto de decreto, mocion, postulado, iniciativa parlamentaria y ninguna.
- Clasificacion del tipo de documento en 4 clases mediante la cabeza `q0`.
- Seis decisiones binarias por bloque documental: numero de asunto, titulo, fecha de presentacion, proponente, fecha de respuesta y respondiente.
- Solo `q1` (tipo de asunto) y `q2_sponsor` en la banda `hi` (probabilidad de cabeza igual o superior a 0.80) llegaron a entrar en el conversor; `q0` y el resto de cabezas Q2 no entraron.
- Lectura de estados ocultos intermedios de un transformer congelado, sin generar texto ni decodificar tokens.
- Cobertura multilingue de aleman, frances e italiano, limitada a documentos parlamentarios suizos.
- No soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, no tiene modo de pensamiento, vision ni audio.
- Funciona unicamente en conjuncion con el codigo del repositorio ParlPDFeCH (textos de prompt, lectores de valores, escritor y validador).

## Casos de uso

- Conversion de PDFs parlamentarios a eCH-0295 de punta a punta: el modelo interviene como ultimo recurso del pipeline "PDF in, RDF out" cuando las reglas no resuelven un valor, de modo que el registro de salida queda completo sin intervencion manual.
- Clasificacion del tipo de asunto en agregaciones multi-parlamento: con 44 parlamentos y nomenclaturas heterogeneas, la cabeza `q1` normaliza cada documento a una de las 7 categorias, lo que permite comparar actividad legislativa entre camaras.
- Recuperacion del proponente para trazabilidad: la cabeza `q2_sponsor_hi` identifica el primer autor en documentos donde las reglas no lo extraen, con una probabilidad de acierto de 0.62 en desarrollo (solo 24 unidades), por lo que conviene tratarla como candidata a revision.
- Seguimiento de plazos y respuestas: las cabezas binarias de fecha de presentacion, fecha de respuesta y respondiente permiten detectar si un asunto ha sido contestado y por quien, alimentando cuadros de mando de actividad parlamentaria.
- Auditoria asistida de extraccion: el codigo marca como "near" todo valor cuya probabilidad de cabeza quede a menos de 0.10 de un umbral, lo que permite encolar para revision humana solo los casos ambiguos y automatizar el resto.
- Reproduccion en local sin GPU: las cabezas se ejecutan en CPU y el autor valido la paridad de decisiones con MLX sobre un Apple M4 de 32 GB, lo que habilita un flujo de verificacion en portatil sin depender de CUDA.
- Investigacion sobre probing de LLM congelados: el repositorio sirve como referencia reproducible de como extraer etiquetas estructuradas de estados intermedios de un modelo abierto suizo, con pliegues por parlamento para evitar fuga de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, ya que no es un modelo generativo. La unica medida publicada es la calibracion del autor sobre documentos de desarrollo:

| Nivel | Campo | Unidades | Igual al valor de referencia | Probabilidad almacenada |
|---|---|---|---|---|
| `apertus_q1` | tipo de asunto | 100 | 93 | 0.925743 |
| `apertus_q2_sponsor_hi` | primer autor | 24 | 15 | 0.62 (`enough_units`: false) |

La probabilidad almacenada es la media de Jeffreys, (k + 0.5) / (n + 1), sobre todos los pliegues. En la corrida fija del 13.10.2026 sobre 872 documentos no usados en el ajuste (26 parlamentos), el nivel `apertus_q1` produjo 59 valores con referencia y 55 coincidencias (0.932), mientras que `apertus_q2_sponsor_hi` produjo 79 valores con referencia y 67 coincidencias (0.848).

Sobre estabilidad entre kernels: con la cabeza final y 15 documentos de desarrollo en MLX sobre un Mac con Apple M4 y 32 GB (16.10.2026), las 9 decisiones de Apertus fueron iguales a las obtenidas sobre los estados H100 almacenados (8 se escribieron; un tipo no tenia palabra de tipo en el texto) y el mayor cambio de probabilidad fue de 0.015 para `q1` y 0.047 para el primer autor. En 16 documentos adicionales, las 12 decisiones fueron iguales, pero una probabilidad de cabeza vario hasta 0.097 (`q1`) y 0.055 (primer autor). No se midio ninguna GPU CUDA distinta de la H100 del ajuste.

## Requisitos de hardware

- Las cabezas en si son diminutas y la clasificacion se ejecuta en CPU; el coste real esta en generar los estados, que exige cargar Apertus-v1.5-8B completo.
- La extraccion de estados del autor se hizo con Apertus-v1.5-8B en bf16 sobre una unica GPU H100 con torch CUDA. Los pesos en bf16 de un modelo de 8.000 millones ocupan del orden de 16 GB, a lo que se suman las activaciones de un contexto de hasta 32.768 tokens.
- En GPU de consumo: no hay datos publicados. Una cuantizacion permitiria reducir VRAM, pero invalida las cabezas, porque estas solo fueron ajustadas sobre estados en bf16 sin cuantizar.
- Alternativa sin CUDA validada por el autor: MLX sobre un Apple M4 con 32 GB de memoria unificada, con paridad de decisiones en los documentos probados.
- El autor no midio otros kernels (torch MPS, torch CPU, otras GPU); advierte de que el ruido bf16 difiere y puede alterar decisiones cercanas a los umbrales.
- Despliegue: no es un modelo servible con vLLM, llama.cpp, Ollama o TGI. El flujo previsto es un pipeline Python basado en Make: `make setup && make setup-pdf && make setup-apertus` y `make convert PDF=<fichero o URL>`, previa autenticacion en Hugging Face para descargar el modelo base.
- Latencia y throughput: no disponibles. La unica cifra operativa mencionada es de un forward pass por cada pregunta y documento sobre el prompt completo.

## Comparativa con modelos similares

| Modelo o enfoque | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ParlPDFeCH value heads | No disponible (cabezas lineales sobre un modelo base de 8.000 millones) | 32.768 tokens heredados del base | `q1`: 0.925743 en desarrollo y 0.932 en la corrida fija; `q2_sponsor_hi`: 0.62 en desarrollo y 0.848 en la corrida fija | CC BY 4.0 | Hugging Face, descarga publica sin token |
| Apertus-v1.5-8B (modelo base) | 8.000 millones | 32.768 tokens (deducido de la model card) | No disponible en esta informacion | No disponible en esta informacion | Hugging Face, requiere aceptar condiciones y autenticarse |
| Conversor con reglas de ParlPDFeCH | No aplica | No aplica | No disponible: la model card solo indica que las cabezas actuan cuando las reglas no hallan valor o hallan uno debil | No disponible en esta informacion | GitHub |
| Otros clasificadores de documentos parlamentarios | No disponible | No disponible | No disponible | No disponible | No disponible |

No se conocen alternativas equivalentes de cabezas lineales para el estandar eCH-0295 en la informacion proporcionada, por lo que la comparativa queda limitada al propio pipeline y a su modelo base.

## Limitaciones y advertencias

- La referencia usada tanto para el ajuste como para todas las proporciones de acierto es el export de OpenParlData, un registro administrativo y no un conjunto gold; los porcentajes deben leerse como concordancia con ese registro.
- La calibracion es out-of-fold sobre documentos de desarrollo y agentes de IA leyeron parte de esos documentos durante el desarrollo, por lo que el autor califica explicitamente los numeros como optimistas.
- Los estados se generaron con torch CUDA bf16 sobre H100; otros kernels (MLX, MPS, CPU, otras GPU) producen ruido bf16 distinto y una decision cercana a un umbral puede cambiar. Los umbrales son 0.80 para `q1` y 0.50 y 0.80 para el proponente.
- Las cabezas solo son validas para la huella de modelo `apertus-v1.5-8b-text-bf16:c10cd28db5bd3adf6043a5047a1435dedc5c3e55c45d5abc2ca82baf2a7786c3` y la plantilla `gj_values_v1_de`; otro modelo, otra revision, un modelo cuantizado u otro prompt invalidan los pesos.
- Las cabezas leen unicamente estados: no son autonomamente utiles y requieren el codigo del repositorio (prompts, lectores de valores, escritor y validador).
- El nivel `apertus_q2_sponsor_hi` esta marcado con `enough_units` en falso: solo 24 unidades en 15 aciertos, una base estadistica muy debil para decisiones de produccion sin revision humana.
- Cobertura linguistica limitada a aleman, frances e italiano; no hay soporte de castellano ni de documentos de otras jurisdicciones.
- Un documento de desarrollo superaba los 32.768 tokens; los documentos mas largos que la ventana del modelo base quedan fuera del procedimiento.
- Riesgo de sesgo no evaluado en la informacion disponible: no se publican analisis de sesgo por canton, idioma o grupo parlamentario.
- El repositorio tiene 0 descargas y 0 "me gusta" en el momento de la consulta y un tamano de 0.0 GB, por lo que carece de validacion externa de la comunidad.
- Licencia CC BY 4.0 en los tres ficheros del repositorio: permite uso comercial con atribucion, pero el modelo base Apertus-v1.5-8B exige aceptar sus propias condiciones en Hugging Face y autenticarse con un token propio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JonathanKovatsch/parlpdfech-heads
- Codigo fuente (carpeta `track_2a/`): https://github.com/jkovatsch/ParlPDFeCH
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Revision del modelo base exigida: `ef4bbc54d6fe658bc782280ff9f3b53a10a9758f`
- Verificacion de integridad de los pesos: fichero `SHA256SUMS` y variable `HEADS_REVISION` del `track_2a/Makefile`
