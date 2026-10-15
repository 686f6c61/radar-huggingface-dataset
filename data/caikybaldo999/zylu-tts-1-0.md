# caikybaldo999/ZYLU-TTS-1.0

## Resumen

ZYLU-TTS-1.0 es un modelo de sintesis de voz (text-to-speech) en ingles, mono-hablante, publicado por el usuario caikybaldo999 en HuggingFace. Se compone de dos redes entrenadas desde cero: un modelo acustico Glow-TTS de aproximadamente 28,6M de parametros y un vocoder HiFi-GAN v1 de aproximadamente 13,9M de parametros (generador). El modelo resuelve la conversion de texto a audio de una unica voz femenina en ingles americano, siguiendo la receta de SupraTTS-0.1-Beta.

La relevancia de este lanzamiento es acotada pero clara: es un ejemplo reproducible de entrenamiento completo (acustico + vocoder) sobre el dataset LJSpeech-1.1 en una sola NVIDIA A100-SXM4-80GB, con unos 13 horas de computo por componente. Ambos modelos se entrenaron simultaneamente en la misma GPU, sin pesos preentrenados, y aplican correcciones concretas sobre los valores por defecto de Coqui-TTS (planificador de learning rate escalonado por paso, tokens en blanco entre tokens de entrada, bf16 y batch grande).

Al tratarse de un modelo de TTS y no de un modelo de lenguaje, los conceptos habituales de ventana de contexto o parametros activos no aplican. La entrada es una secuencia de fonemas espeak (en-us) y la salida es audio a 22050 Hz con 80 bandas mel. Se distribuye bajo licencia MIT, lo que permite uso comercial, pero su alcance se limita a una sola voz en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico, flow-based) + HiFi-GAN v1 (vocoder) |
| Parametros totales | ~42,5M (≈28,6M acustico + ≈13,9M vocoder generador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (TTS; entrada en fonemas espeak, no texto con ventana) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | no disponible |
| Frecuencia de muestreo | 22050 Hz, 80 bandas mel |
| Entrada | Fonemas espeak (en-us) con tokens en blanco entre tokens |
| Dataset de entrenamiento | LJSpeech-1.1 (~24 h, hablante femenina unica) |
| Tamano del repositorio | 0,2 GB |
| Pipeline (HuggingFace) | text-to-speech |

## Arquitectura y entrenamiento

El componente acustico es un Glow-TTS con 12 bloques de flujo, 192 canales ocultos y un encoder transformer con posiciones relativas de 6 capas, equipado con un predictor de duracion determinista (en lugar del estocastico del que derivan otras variantes). El vocoder es un HiFi-GAN v1 con factor de sobremuestreo 8x8x2x2, 512 canales iniciales, peso de feature-matching 108 y peso L1 sobre mel de 45; se entreno sobre mels de referencia (ground-truth).

El entrenamiento se hizo integramente desde cero sobre LJSpeech-1.1, con 200 utterances reservadas como conjunto de validacion. El modelo acustico se entreno durante 19440 pasos (96 epocas) con batch de 64 en precision bf16, optimizador RAdam y planificador NoamLR (pico 0,001, warmup 4000) escalonado por paso. El vocoder se entreno 27720 pasos (68 epocas) con batch de 32 (segmentos de 8192 muestras) en fp32, AdamW con learning rate 0,0002 y ExponentialLR 0,999 por epoca. Ambos procesos compartieron una unica A100-SXM4-80GB y consumieron aproximadamente 13 horas cada uno.

Las innovaciones tecnicas declaradas son esencialmente correcciones respecto a los valores por defecto de Coqui-TTS: escalonado del planificador por paso (no por epoca), insercion de tokens en blanco entre tokens de entrada, uso de bf16 y batch grande. No se menciona decodificacion especulativa ni atencion lineal.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con salida en audio a 22050 Hz.
- Voz unica femenina en ingles americano (single-speaker).
- Control de prosodia basico limitado: la duracion es determinista, de modo que los tiempos son identicos en cada ejecucion (solo varia el ruido acustico segun la semilla).
- Conversion texto-a-fonemas via espeak-ng (en-us) antes de la inferencia.
- Generacion por lotes reproducible mediante semilla para variar ligeramente el ruido acustico.
- No soporta tool calling, function calling ni comportamiento de agente.
- No soporta vision, audio de entrada ni modo de razonamiento.
- No soporta multi-hablante ni clonacion de voz (declarado explicitamente como trabajo futuro).
- No soporta etiquetas de estilo en linea (inline style tags), declaradas como pendientes.

## Casos de uso

- Audiolibros y narracion de contenido en ingles: el modelo puede convertir texto largo en audio con una voz consistente, adecuada para prototipos de narracion donde no se requiere variacion de hablante ni control prosodico fino.
- Accesibilidad y lectores de pantalla: integrable como motor TTS en aplicaciones que necesiten leer texto en ingles en voz alta, con licencia MIT que facilita su incorporacion en productos.
- Avisos y menus de telefonia (IVR): sintesis de mensajes cortos y repetibles, donde la duracion determinista es una ventaja por su previsibilidad de tiempos.
- Locucion para prototipos de asistentes de voz: generacion de respuestas habladas en fase de maquetacion de un asistente, antes de sustituir por una voz comercial.
- Generacion de datos sinteticos para entrenar o aumentar modelos ASR en ingles: la combinacion de voz clara y fonemas espeak permite producir corpus de audio-texto controlados.
- Contenido educativo y e-learning: narracion de lecciones o materiales didacticos en ingles con una voz uniforme y sin coste de licencia por uso comercial.
- Pruebas de regresion en pipelines de TTS: util como referencia reproducible (semilla fija, duracion fija) para validar cambios en el resto de la cadena.
- Demostraciones y ejemplos en notebooks: dado su tamano reducido (~0,2 GB) y sus requisitos de VRAM minimos, es viable en entornos de investigacion modestos.

## Benchmarks y rendimiento

Evaluado sobre 10 frases fuera de dominio y 10 frases reservadas de LJSpeech, con 5 semillas por frase. UTMOS es una estimacion automatica de MOS (1-5), F0-Std es la variacion de tono dentro de una frase en semitonos, WER es la tasa de error de palabras medida con Whisper (openai/whisper-small.en) como control de pronunciacion, y tempo es la duracion sintetizada sobre la duracion real en las frases reservadas.

| Sistema | UTMOS (mayor mejor) | F0-Std [st] | WER % (menor mejor) | Tempo vs. ground truth |
|---|---|---|---|---|
| Ground truth (grabaciones reservadas) | 4,35 ± 0,14 | 3,86 | 3,70 | 1,000 |
| Vocoder solo (copy-synthesis de las grabaciones reservadas) | 3,52 ± 0,32 | 3,67 | 2,96 | - |
| ZYLU-TTS-1.0 (este modelo) | 3,09 ± 0,27 | 2,96 | 6,82 | 0,979 |

El propio autor advierte que los numeros de configuraciones de evaluacion distintas no son directamente comparables, por lo que no se situan junto a los de otros modelos.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explicita; con ~42,5M de parametros en total, la huella es de decenas de MB en fp32 y menor en fp16, por lo que cualquier GPU moderna es suficiente.
- GPU recomendadas: el entrenamiento se hizo en 1x NVIDIA A100-SXM4-80GB, pero para inferencia basta con una GPU consumer (por ejemplo, RTX 3060 o superior) o incluso CPU.
- Cabe en GPU consumer: si, con margen amplio (el repositorio completo ocupa 0,2 GB).
- Opciones de despliegue: Coqui-TTS (el paquete coqui-tts mantenido por Idiap), PyTorch con CUDA y espeak-ng como dependencia del front-end de fonemas. No aplica vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Requisitos de software: Python 3.10 o superior, PyTorch con CUDA, `pip install "coqui-tts[codec]" "transformers<5"` y `apt install espeak-ng`.
- Latencia y throughput: no disponibles (no se publican cifras de tiempo real ni de factor de tiempo real).

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables publicados en la informacion disponible, ya que el autor indica explicitamente que sus metricas no son comparables con las de otros modelos. Como referencias del mismo espacio, sin datos numericos contrastados:

| Modelo | Arquitectura | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZYLU-TTS-1.0 | Glow-TTS + HiFi-GAN v1 | ~42,5M | Fonemas espeak en-us | MIT | HuggingFace |
| SupraTTS-0.1-Beta | Glow-TTS + vocoder (receta de referencia) | no disponible | Fonemas (no especificado) | no disponible | HuggingFace (SupraLabs) |
| Coqui-TTS (modelos LJSpeech) | Glow-TTS + vocoder segun receta | no disponible | Fonemas | MIT (herramienta) | GitHub idiap/coqui-ai-TTS |

Los datos de rendimiento de las alternativas no estan disponibles en la informacion proporcionada, por lo que no se incluyen comparaciones numericas.

## Limitaciones y advertencias

- Idiomas: solo ingles. No genera voz en castellano ni en otros idiomas.
- Voces: una unica hablante femenina en ingles americano; no hay seleccion de voz ni clonacion.
- Prosodia: la variacion de tono (F0-Std 2,96) esta por debajo de las grabaciones reales (3,86), lo que puede producir una entonacion mas plana.
- Duracion determinista: el predictor de duracion determinista genera tiempos identicos en cada ejecucion; solo cambia el ruido acustico segun la semilla. Esto limita la variabilidad natural del habla.
- Pronunciacion: el WER de 6,82 % en evaluacion (frente al 3,70 % del ground truth) indica una tasa de error de palabras medible en la sintesis; conviene validar en el dominio concreto de uso.
- Alucinacion y errores de sintesis: en TTS, los riesgos tipicos son omisiones, repeticiones o pronunciaciones incorrectas en textos con simbolos, numeros o nombres propios no cubiertos por la fonemizacion espeak.
- Sesgo de datos: entrenado exclusivamente sobre LJSpeech-1.1 (una sola hablante, dominio de lectura de audiolibros), lo que limita su generalizacion a otros estilos, acentos o condiciones acusticas.
- Licencia: MIT, permisiva y apta para uso comercial, pero conviene verificar las condiciones del dataset LJSpeech y de las dependencias (Coqui-TTS, espeak-ng) por separado.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se especifica el formato de pesos ni una version empaquetada, lo que puede complicar su integracion directa en produccion.
- Fechas: el registro del repositorio indica creacion y actualizacion en octubre de 2026; este dato procede de la informacion disponible y no se ha podido contrastar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caikybaldo999/ZYLU-TTS-1.0
- Receta de referencia, SupraTTS-0.1-Beta: https://huggingface.co/SupraLabs/SupraTTS-0.1-Beta
- Dataset LJSpeech (Keith Ito): https://keithito.com/LJ-Speech-Dataset/
- Coqui-TTS (mantenido por Idiap): https://github.com/idiap/coqui-ai-TTS
- Paper de Glow-TTS (Kim et al.): https://arxiv.org/abs/2005.11129
- Paper de HiFi-GAN (Kong et al.): https://arxiv.org/abs/2010.05646

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relacion con el contenido de la ficha.
