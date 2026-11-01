# Kolgrim/farzenith-small-v1

## Resumen

FarZenith small v1 es un modelo de lenguaje de ~50 millones de parámetros (49.262.400 exactos según los pesos en safetensors) entrenado desde cero por Selby Mashiki para la Zimbabwean Astronomical Society (ZAS). Su planteamiento no es responder preguntas de astronomía con conocimiento paramétrico, sino actuar como un enrutador: convierte la pregunta del usuario en una especificación de experimento (experiment spec) que un motor determinista de física o de cielo oscuro ejecuta para calcular los números. El modelo solo redacta la explicación final, de modo que toda cifra de la respuesta proviene del motor y no de la generación libre.

La arquitectura es un decoder estilo Llama (RMSNorm, posiciones rotatorias, SwiGLU) con d_model 576, 10 capas, 9 cabezas de atención y una ventana de contexto de 1.024 tokens. Emplea un tokenizador BPE de 16.384 tokens con los dígitos separados en tokens individuales. La generación de especificaciones está restringida por gramática, lo que garantiza que el modelo solo pueda emitir specs válidas para los 15 experimentos soportados.

El interés del modelo es fundamentalmente metodológico: demuestra que un modelo muy pequeño, entrenado con ~470M tokens en una única RTX 4090, puede alcanzar un 97,5% de fidelidad numérica respecto al motor cuando se le restringe la salida y se le delega el cálculo. Está orientado a un dominio estrecho (astronomía, física y calidad del cielo en África austral) y solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (RMSNorm, RoPE, SwiGLU) |
| Parámetros totales | 49.262.400 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 (pesos y datos de cielo oscuro); código en `code/` bajo Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch) |
| Tokenizador | BPE de 16.384 tokens, dígitos separados en tokens individuales |
| Dimensiones internas | d_model 576, 10 capas, 9 cabezas |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de tipo Llama con normalización RMSNorm, embeddings posicionales rotatorios y activación SwiGLU, con d_model 576, 10 capas y 9 cabezas de atención. La innovación principal no está en la arquitectura, sino en el flujo de inferencia: la generación de la especificación del experimento está restringida por gramática, de forma que la salida del modelo pertenece siempre al espacio de specs válidas de los 15 experimentos implementados. El cálculo lo realiza un motor determinista externo (física orbital, cuerpo negro, gravitación, cosmología y un motor de cielo oscuro), y el modelo únicamente produce la explicación en lenguaje natural a partir de los resultados del motor.

El preentrenamiento consistió en 1.800 pasos de 262.144 tokens, aproximadamente 470M tokens, sobre un corpus de 760M tokens compuesto por artículos de astronomía y física de Wikipedia (CC BY-SA 4.0), títulos y resúmenes de arXiv astro-ph y physics (metadatos CC0 1.0), los libros *Astronomy 2e* y *University Physics* de OpenStax (CC BY 4.0) y FineWeb-Edu filtrado por ciencia (ODC-By 1.0). Las preguntas de evaluación se eliminaron del corpus mediante decontaminación por 8-gramas. El ajuste fino se hizo con una época sobre 300.000 ejemplos generados por los propios motores, sin texto de otros modelos de IA, y todo el entrenamiento se ejecutó en una sola RTX 4090. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto en inglés dentro del dominio de astronomía, astrofísica y calidad del cielo.
- Enrutamiento de preguntas a 15 experimentos concretos: órbitas planetarias y comparaciones, órbitas de satélites (Tierra, Luna, Marte), estrellas de secuencia principal y radiación de cuerpo negro, gravedad (fuerza, velocidad de escape, agujeros negros), cosmología y luz (distancias de Hubble, desplazamiento Doppler, bandas del espectro) y cielo oscuro en África austral (calidad del cielo en un sitio, sitios oscuros cercanos, comparación de lugares, tendencias de contaminación lumínica).
- Generación de especificaciones de experimento con restricción gramatical, lo que impide producir specs inválidas.
- Explicación de resultados numéricos calculados por un motor externo, con mención de advertencias (caveats) en el 100% de los casos evaluados.
- Respuestas conceptuales breves y rechazo educado ante preguntas no soportadas (89,7% de enrutamiento correcto en la evaluación).
- Soporte de tool calling en sentido amplio: el modelo actúa como planificador que selecciona y parametriza la herramienta (motor) adecuada.
- No soporta visión, audio, ni modo de razonamiento extendido. No es multilingüe.

## Casos de uso

- Divulgación astronómica automatizada: el modelo puede responder preguntas de usuarios sobre órbitas, gravedad o cuerpo negro delegando el cálculo en el motor, lo que garantiza cifras correctas en materiales educativos y evita errores aritméticos típicos de modelos generativos.
- Planificación de observaciones: dado un lugar del sur de África, el modelo selecciona el experimento de calidad del cielo y el motor devuelve los valores de brillo del cielo, útiles para decidir si un sitio es apto para observación.
- Comparación de sitios para astroturismo o instalación de observatorios: el modelo enruta a los experimentos de "darkest nearby sites" y "comparing places" y redacta la comparación a partir de los datos del motor.
- Asistencia en docencia de física: para preguntas de velocidad de escape, fuerza gravitatoria o distancias de Hubble, el modelo genera la spec, el motor calcula y el modelo explica el resultado con las advertencias correspondientes.
- Servicio HTTP ligero: el repositorio incluye un servidor (`python -m zenith.serve.app`) con endpoint `POST /v1/ask`, adecuado para desplegar un asistente de dominio en infraestructura modesta.
- Seguimiento de contaminación lumínica: el experimento de tendencias permite generar informes periódicos sobre evolución del brillo del cielo en localidades del sur de África.
- Enrutador en pipelines mayores: por su tamaño (~50M parámetros) y su salida estructurada, puede usarse como clasificador/planificador previo que decide qué motor invocar antes de pasar la respuesta a otro sistema.

## Benchmarks y rendimiento

Evaluación sobre 1.500 preguntas reservadas (100 por experimento), con plantillas, objetos y lugares no vistos en entrenamiento, ejecutada en una RTX 4090:

| Métrica | FarZenith small v1 | Baseline basado en reglas | Objetivo v1 |
|---|---|---|---|
| Elige el experimento correcto | 83,3% | 60,3% | ≥ 90% |
| Acierta todos los parámetros | 43,0% | 10,3% | ≥ 75% |
| Números fieles al motor | 97,5% | 100% | ≥ 95% |
| Menciona advertencias | 100% | 100% | ≥ 70% |
| Enruta preguntas conceptuales/no soportadas | 89,7% | 54,4% | ≥ 85% |

Puntos fuertes declarados: órbitas planetarias, luz de cuerpo negro, espectro, gravedad y desplazamiento Doppler (100% de acierto en selección de experimento). Puntos débiles: distinguir una órbita de Kepler de una comparación de órbitas, preguntas de distancia de Hubble y preguntas de cielo oscuro de un solo sitio. La precisión de parámetros es más baja en cielo oscuro porque la evaluación usa lugares excluidos del entrenamiento cuyas coordenadas el modelo nunca ha visto. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 49,3M de parámetros, en fp32 ocupa ~197 MB y en fp16/bf16 ~99 MB; el repo completo pesa 0,2 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM libre; el autor reporta entrenamiento y evaluación en una RTX 4090, pero la inferencia es viable en GTX 1650, RTX 3050, RTX 4060 o superiores.
- Cabe en GPU consumer: sí, en todas las gamas actuales e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el paquete propio `zenith` (`pip install .` desde `code/`) con la clase `Zenith` y el servidor HTTP incluido (`python -m zenith.serve.app`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato safetensors y la dependencia de los motores propios sugieren que la integración estándar no está prevista.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño y la ventana de 1.024 tokens, se espera latencia muy baja, pero no hay cifras publicadas.
- Dependencia adicional: requiere el mapa de cielo oscuro `darksky_sa.npz` y la variable de entorno `ZENITH_DARKSKY` para los experimentos de cielo oscuro.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la información proporcionada: FarZenith no compite con LLM generalistas, sino con sistemas de enrutamiento a herramientas en dominio astronómico. La referencia más cercana es el baseline basado en reglas incluido en su propia evaluación.

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| FarZenith small v1 | 49,3M | 1.024 | Enrutador a motores deterministas + explicación | CC BY-SA 4.0 |
| Baseline basado en reglas (referencia interna) | n/a | n/a | Coincidencia de patrones | no disponible |
| LLM generalistas pequeños (p. ej. familia Llama/Qwen <1B) | 0,5–1B | 4K–32K | Generación libre, cálculo paramétrico | varía |

La comparación con LLM generalistas no es directa: FarZenith gana en fidelidad numérica dentro de su dominio (97,5%) a costa de no poder responder fuera de sus 15 experimentos, mientras que un LLM generalista puede abordar cualquier tema pero alucina cifras con más facilidad. No hay datos de benchmarks cruzados disponibles.

## Limitaciones y advertencias

- Modelo pequeño y estrecho: solo responde dentro de sus 15 experimentos más un banco de hechos; fuera de ahí rechaza la pregunta.
- Puede recordar mal propiedades de un objeto (por ejemplo, la altitud de un satélite) aunque la aritmética del motor sea exacta; la fidelidad del 97,5% mide si copia bien los números, no si los conoce.
- Cobertura de cielo oscuro limitada al sur de África (latitud −35 a −8, longitud 10 a 41).
- Solo inglés; no hay soporte multilingüe.
- Ventana de contexto de 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- El mapa de cielo oscuro incluido (`darksky_sa.npz`) es provisional y aproximado, construido con pueblos de GeoNames y la ley de Walker; para respuestas precisas hay que reconstruirlo con el World Atlas de Falchi et al. 2016 y datos VIIRS.
- La capa de Falchi no se puede redistribuir por su licencia CC BY-NC 4.0, lo que limita el uso comercial de mapas precisos de cielo oscuro.
- Licencia CC BY-SA 4.0 en pesos y datos: obliga a atribución ("FarZenith by Selby Mashiki, Zimbabwean Astronomical Society") y a compartir bajo la misma licencia las obras derivadas, lo que puede ser restrictivo para productos propietarios.
- Precisión de parámetros del 43,0%, por debajo del objetivo del 75%: no es fiable para extraer parámetros exactos sin validación.
- Dependencia fuerte de los motores y del paquete `zenith`; no es un modelo autónomo.
- Riesgo de alucinación limitado en las cifras (vienen del motor) pero presente en las explicaciones cualitativas y en la selección de experimento (16,7% de error).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kolgrim/farzenith-small-v1
- Repositorio de código incluido en el modelo: carpeta `code/` del repositorio HuggingFace (paquete `zenith`, licencia Apache 2.0)
- Documentación del mapa de cielo oscuro: `code/docs/data/darksky.md` dentro del repositorio
- World Atlas of Artificial Night Sky Brightness (Falchi et al. 2016): doi:10.5880/GFZ.1.4.2016.001
- GeoNames: https://www.geonames.org (CC BY 4.0)
- Natural Earth: https://www.naturalearthdata.com (dominio público)
- OpenStax *Astronomy 2e*: https://openstax.org/details/books/astronomy-2e (CC BY 4.0)
- OpenStax *University Physics*: https://openstax.org/details/books/university-physics-volume-1 (CC BY 4.0)
- FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu (ODC-By 1.0)
- arXiv astro-ph: https://arxiv.org/archive/astro-ph (metadatos CC0 1.0)
