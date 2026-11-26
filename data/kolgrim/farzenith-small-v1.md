# Kolgrim/farzenith-small-v1

## Resumen

FarZenith small v1 es un modelo de lenguaje de ~49,26 millones de parámetros desarrollado desde cero por Selby Mashiki para la Zimbabwean Astronomical Society (ZAS). Su particularidad es que no realiza cálculos aritméticos: el modelo traduce una pregunta en lenguaje natural a una especificación de experimento (experiment spec) y un motor determinista de física o de cielo oscuro calcula los números; después el modelo explica el resultado. De este modo, toda cifra presente en la respuesta proviene del motor, no de los pesos.

El modelo cubre 15 experimentos predefinidos que abarcan órbitas planetarias y comparaciones, órbitas de satélites (Tierra, Luna, Marte), estrellas de secuencia principal y radiación de cuerpo negro, gravedad (fuerza, velocidad de escape, agujeros negros), cosmología y luz (distancias de Hubble, desplazamientos Doppler, bandas del espectro) y calidad del cielo oscuro en el sur de África. Las preguntas conceptuales reciben explicaciones breves y las no soportadas, una negativa educada.

Es relevante por su enfoque híbrido neuro-simbólico en un tamaño muy reducido: demuestra que un modelo de ~50M parámetros con generación de especificaciones restringida por gramática puede alcanzar un 83,3% de acierto en la selección del experimento correcto y un 97,5% de fidelidad numérica respecto al motor, superando ampliamente a una línea base basada en reglas en selección de experimento (60,3%) y parametrización (10,3%). La arquitectura es un decoder estilo Llama con contexto de 1.024 tokens y tokenizador BPE de 16.384 entradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (RMSNorm, posiciones rotatorias, SwiGLU); d_model 576, 10 capas, 9 cabezas de atención |
| Parametros totales | 49.262.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 (pesos y datos de cielo oscuro); código en `code/` bajo Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

FarZenith small v1 es un decoder transformer autorregresivo de estilo Llama con normalización RMSNorm, embeddings posicionales rotatorios (RoPE) y activación SwiGLU. La dimensión del modelo es 576, con 10 capas y 9 cabezas de atención, y una ventana de contexto de 1.024 tokens. El tokenizador es un BPE de 16.384 entradas con los dígitos separados en tokens individuales, lo que facilita la generación de parámetros numéricos en las especificaciones. La generación de specs está restringida por gramática, de forma que el modelo solo puede emitir especificaciones de experimento válidas.

El preentrenamiento consistió en 1.800 pasos de 262.144 tokens cada uno (~470M tokens) sobre un corpus de 760M tokens compuesto por artículos de astronomía y física de Wikipedia (CC BY-SA 4.0), títulos y resúmenes de arXiv astro-ph/physics (metadatos CC0 1.0), *Astronomy 2e* y *University Physics* de OpenStax (CC BY 4.0) y FineWeb-Edu filtrado por ciencia (ODC-By 1.0). Las preguntas de evaluación se eliminaron del corpus mediante decontaminación por 8-gramas. El ajuste fino se realizó durante una época sobre 300.000 ejemplos generados por los propios motores (sin texto de otros modelos de IA), en una única RTX 4090.

## Capacidades

- Generación de texto en inglés orientada a astronomía y física, con explicaciones breves de conceptos.
- Traducción de preguntas en lenguaje natural a especificaciones de experimento estructuradas (15 experimentos disponibles).
- Enrutamiento de preguntas: distingue entre preguntas experimentales, conceptuales y no soportadas (89,7% de acierto en el enrutamiento conceptual/no soportado).
- Cálculo delegado a motores deterministas: órbitas planetarias y comparaciones, órbitas de satélites (Tierra, Luna, Marte), estrellas de secuencia principal y cuerpo negro, gravedad (fuerza, velocidad de escape, agujeros negros), cosmología (distancias de Hubble, Doppler, bandas espectrales) y cielo oscuro del sur de África.
- Generación de series de datos para gráficas a partir de los resultados del motor (`r.result` incluye la serie del gráfico).
- Servicio HTTP con endpoint `POST /v1/ask` para integración en aplicaciones.
- No soporta tool calling genérico, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Divulgación astronómica interactiva: un planetario o museo puede desplegar el servicio `zenith.serve.app` y responder preguntas del público sobre órbitas, gravedad o cuerpo negro, con la garantía de que las cifras provienen del motor y no de la memoria del modelo.
- Educación secundaria y universitaria: el modelo explica resultados de experimentos de física (velocidad de escape, desplazamiento Doppler) y devuelve la spec elegida, lo que permite al docente auditar el razonamiento y usar la salida como material didáctico verificable.
- Planificación de observaciones astronómicas: consultas sobre calidad del cielo en un sitio del sur de África (`sky quality at a site`, `darkest nearby sites`) para elegir ubicaciones de observación, con la advertencia de que el mapa de cielo oscuro incluido es provisional.
- Comparación de lugares para astroturismo: la función de comparación de sitios y tendencias de contaminación lumínica permite responder a operadores turísticos sobre destinos con cielos más oscuros en el rango lat −35…−8, lon 10…41.
- Asistente de laboratorio con separación cálculo/explicación: en entornos donde la trazabilidad numérica es crítica, el patrón spec-motor-explicación permite registrar cada paso y reproducir los resultados.
- Integración como componente de enrutamiento en pipelines mayores: dado su bajo coste (~50M parámetros, 0,2 GB de repo), puede ejecutarse en CPU o GPU de consumo para clasificar preguntas astronómicas antes de derivarlas a motores o modelos mayores.
- Investigación en modelos neuro-simbólicos: sirve como caso de estudio reproducible de generación restringida por gramática y ajuste fino con datos sintéticos generados por motores deterministas.

## Benchmarks y rendimiento

Evaluación sobre 1.500 preguntas retenidas (100 por experimento), con plantillas, objetos y lugares no vistos en entrenamiento, medida en una RTX 4090:

| Metrica | FarZenith small v1 | Baseline basada en reglas | Objetivo v1 |
|---|---|---|---|
| Elige el experimento correcto | 83,3% | 60,3% | ≥ 90% |
| Acierta todos los parámetros | 43,0% | 10,3% | ≥ 75% |
| Números fieles al motor | 97,5% | 100% | ≥ 95% |
| Menciona advertencias (caveats) | 100% | 100% | ≥ 70% |
| Enruta preguntas conceptuales/no soportadas | 89,7% | 54,4% | ≥ 85% |

Puntos fuertes: órbitas planetarias, luz de cuerpo negro, espectro, gravedad y desplazamientos Doppler (100% de acierto en elección de experimento). Puntos débiles: distinguir una órbita de Kepler de una comparación de órbitas, preguntas de distancia de Hubble y preguntas de cielo oscuro de un solo sitio. La precisión de parámetros es más baja en cielo oscuro porque la evaluación usa lugares retenidos cuyas coordenadas el modelo nunca vio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los pesos (~197 MB para 49,26M parámetros); el repo completo ocupa 0,2 GB, por lo que cabe holgadamente en cualquier GPU de consumo y en CPU.
- GPU recomendadas: cualquier GPU con ≥ 2 GB de VRAM; el autor reporta entrenamiento y evaluación en una RTX 4090, pero la inferencia no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier modelo con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) y también en CPU.
- Opciones de despliegue: el paquete propio `zenith` (instalable con `pip install .` desde `code/`) y el servidor incluido `python -m zenith.serve.app --ckpt <path>` con endpoint `POST /v1/ask`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni pesos en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FarZenith small v1 | 49,26M | 1.024 | Neuro-simbólico: spec + motor determinista, dominio astronomía/física y cielo oscuro del sur de África | CC BY-SA 4.0 (pesos), Apache 2.0 (código) | Hugging Face (242 descargas) |
| Baseline basada en reglas (misma evaluación) | no disponible | no disponible | Reglas heurísticas | no disponible | Referencia interna del autor |
| Modelos de propósito general de ~50M parámetros | no disponible | no disponible | Transformer decoder generalista | variable | no disponible |

No se dispone de datos publicados de benchmarks de modelos comparables de la misma categoría en la información proporcionada; la única comparación cuantitativa disponible es con la baseline basada en reglas del propio autor.

## Limitaciones y advertencias

- Modelo pequeño y estrecho: solo responde dentro de sus 15 experimentos más un banco de hechos; fuera de ese ámbito emite una negativa educada.
- Puede recordar mal propiedades de un objeto (por ejemplo, la altitud de un satélite) aunque la aritmética del motor sea siempre exacta; la fidelidad del 97,5% mide la copia correcta de los números del motor, no la corrección de los parámetros de entrada.
- Cobertura de cielo oscuro limitada al sur de África (lat −35…−8, lon 10…41).
- El mapa de cielo oscuro incluido (`darksky_sa.npz`) es provisional, construido con localidades de GeoNames y ley de Walker; para respuestas precisas hay que reconstruirlo con el World Atlas de Falchi et al. 2016 y luces nocturnas VIIRS, capa que no puede redistribuirse por su licencia no comercial (CC BY-NC 4.0).
- Solo inglés; no hay soporte multilingüe.
- Licencia CC BY-SA 4.0 en pesos y datos: el uso comercial exige atribución ("FarZenith by Selby Mashiki, Zimbabwean Astronomical Society") y compartir las obras derivadas bajo la misma licencia; el código en `code/` es Apache 2.0.
- Riesgo de alucinación en las explicaciones textuales, mitigado en la parte numérica por la delegación al motor, pero no en la descripción cualitativa.
- Contexto de solo 1.024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Requiere los motores del repositorio (`code/`) para funcionar; los pesos por sí solos no producen respuestas completas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kolgrim/farzenith-small-v1
- World Atlas de Falchi et al. 2016 (referencia para el mapa de cielo oscuro): doi:10.5880/GFZ.1.4.2016.001
- Documentación de construcción del mapa de cielo oscuro: `code/docs/data/darksky.md` (dentro del repositorio)
- Cita del autor: Mashiki, S. (2026), *FarZenith: a from-scratch astronomy model that runs experiments*, Hugging Face
