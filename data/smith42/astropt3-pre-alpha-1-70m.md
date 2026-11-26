# Smith42/astropt3-pre-alpha-1-70m

## Resumen

AstroPTv3 70M es un modelo de investigación en fase pre-alpha desarrollado por Smith42 dentro del proyecto abierto UniverseTBD. Se trata de un "large observation model" multimodal para astronomía: un transformer decoder-only entrenado de forma autorregresiva sobre secuencias intercaladas de imágenes, espectros y valores escalares de catálogo correspondientes al mismo objeto astronómico. El modelo trata los tokens continuos mediante normalising flows por modalidad y cabezas de mezcla gaussiana, lo que le permite modelar datos científicos continuos sin discretizarlos.

El checkpoint publicado corresponde al paso 80.000 de un único entrenamiento, con un backbone de 69,4M de parámetros (23 capas, dimensión oculta 512, 8 cabezas de consulta y 2 de clave/valor) y 192M de parámetros totales al incluir los flows y cabezas por modalidad. Cubre 59 modalidades, entre ellas imágenes Legacy Survey North/South, HSC, espectros DESI y SDSS, RGB de galaxies-with-hats, GZ10 y escalares de catálogo.

Su relevancia es doble: por un lado, explora un paradigma de modelo fundacional para observación astronómica con generación condicional entre modalidades; por otro, se publica de forma totalmente abierta (licencia CC BY-SA 4.0, pesos en safetensors bf16 y código en GitHub) junto con checkpoints intermedios cada 10.000 pasos. El autor advierte explícitamente de que es una instantánea de investigación sin evaluar en tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo multimodal con normalising flows por modalidad y cabezas de mezcla gaussiana |
| Parametros totales | 192.403.456 (192M), incluyendo flows y cabezas; backbone de 69,4M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa secuencias de 4096 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16 safetensors) |
| Idiomas soportados | No disponible (modelo cientifico multimodal, no orientado a texto natural) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 23 capas con dimensión oculta 512 y atención con 8 cabezas de consulta y 2 de clave/valor (GQA). La innovación principal reside en el tratamiento de datos continuos: cada modalidad dispone de un normalising flow que proyecta las observaciones a un espacio latente, y la salida se modela con cabezas de mezcla gaussiana en lugar de una softmax sobre vocabulario discreto. Las secuencias intercalan imágenes, espectros y escalares del mismo objeto, de modo que el modelo aprende dependencias cruzadas entre modalidades.

El entrenamiento se realizó durante 80.000 pasos con batch global de 32 × 4096 tokens, lo que supone aproximadamente 2.100 millones de tokens frescos sin padding (10.500 millones contando padding y eco 4×). Se usó learning rate 1e-3 con warmup de 2.000 pasos y decaimiento coseno hasta 1e-4, semilla 42 y precisión bfloat16. No se documenta RLHF ni DPO; el objetivo es puramente autorregresivo sobre las modalidades. Los checkpoints intermedios cada 10.000 pasos se publican como ramas del repositorio, y el autor advierte de que son instantáneas a mitad del schedule de learning rate y ruido pre-flow, no ejecuciones más cortas ya convergidas.

## Capacidades

- Modelado generativo autorregresivo de observaciones astronómicas multimodales: imágenes, espectros y escalares de catálogo.
- Generación de muestras por modalidad mediante los flows y cabezas gaussianas (con calidad limitada, ver limitaciones).
- Modelado conjunto de 59 modalidades del mismo objeto, lo que en principio permite condicionar unas modalidades sobre otras.
- Generación condicional entre modalidades: no validada en este checkpoint según el autor.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- No se documenta capacidad multilingüe ni de texto natural: no es un modelo de chat ni de instrucciones.
- No se documenta modo de razonamiento explícito (thinking mode), visión general, audio ni otras capacidades fuera del dominio astronómico.

## Casos de uso

- Investigación en modelos fundacionales astronómicos: el checkpoint sirve como base para estudiar el paradigma de "large observation model" con flows y mezclas gaussianas sobre datos científicos continuos, y para reproducir el entrenamiento a partir del código publicado.
- Generación de imágenes astronómicas sintéticas para aumento de datos: se pueden muestrear imágenes Legacy Survey o HSC para ampliar conjuntos de entrenamiento, aunque la calidad actual es limitada y requiere validación caso por caso.
- Modelado de espectros: el modelo produce espectros con nivel de continuo aproximadamente correcto, útil como punto de partida para estudiar la generación de espectros DESI/SDSS, siempre con revisión de las líneas espectrales.
- Estudio de dependencias entre modalidades: al entrenarse sobre secuencias intercaladas del mismo objeto, permite investigar cómo se relacionan imagen, espectro y escalares de catálogo en el espacio latente del modelo.
- Reproducibilidad y experimentación con checkpoints intermedios: las ramas step10000–step80000 permiten analizar la evolución del aprendizaje y comparar instantáneas del mismo run.
- Desarrollo de pipelines de inferencia astronómica: el código de `astro/scripts/generate.py` y la integración con `transformers` mediante `AutoModel` facilitan incorporar el modelo a flujos de investigación existentes.
- Docencia y divulgación: como ejemplo abierto y documentado de modelo multimodal científico con licencia permisiva para materiales educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre held-out para este checkpoint y que no está benchmarkeado para uso downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: los 192M de parámetros en bfloat16 ocupan aproximadamente 0,4 GB de pesos; con overhead de activaciones y flows, cabría esperar un uso de VRAM del orden de 1–2 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia en bf16; no se documentan requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño reducido del modelo.
- Opciones de despliegue: integración con `transformers` (`AutoModel.from_pretrained`) y script `astro/scripts/generate.py` del repositorio de código. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. AstroPTv3 es un modelo de nicho (modelo fundacional astronómico multimodal) y no se han facilitado alternativas de la misma categoría ni sus especificaciones, por lo que la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AstroPTv3 70M (pre-alpha) | 192M totales (69,4M backbone) | No disponible | CC BY-SA 4.0 | Hugging Face y GitHub |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Lanzamiento pre-alpha: es una instantánea de investigación, no un modelo terminado; los pesos, el formato de configuración y el código de carga pueden cambiar sin aviso.
- Las modalidades RGB son débiles: las muestras de galaxies-with-hats seguían siendo ruido coloreado por parches a los 74.000 pasos.
- Las muestras de imágenes Legacy South solo empezaron a parecer galaxias hacia el paso 74.000; son compactas y centradas pero demasiado pequeñas, y algunas presentan bordes duros entre parches.
- Las muestras de espectros tienen un nivel de continuo aproximadamente correcto, pero presentan picos espurios y carecen de líneas en el redshift correcto.
- La generación condicional no está validada: no se ha ejecutado ninguna evaluación sobre held-out con este checkpoint.
- Inestabilidad en la pérdida de la modalidad `galaxies`: durante el entrenamiento osciló en ráfagas entre aproximadamente −1 y −950 nats por parche; el autor sospecha de un learning rate demasiado alto para este tamaño.
- Riesgo de alucinación en el sentido de generar observaciones plausibles pero físicamente incorrectas; cualquier uso científico requiere validación con datos reales.
- No hay información sobre sesgos ni cobertura idiomática; no es un modelo de lenguaje natural.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integración en productos propietarios.
- No se han publicado benchmarks ni métricas de rendimiento downstream.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Smith42/astropt3-pre-alpha-1-70m
- Código (commit fijado): https://github.com/Smith42/AstroPTv3/tree/b627214fb1ed069be8f72b6d46c1d665be531e58
- Proyecto UniverseTBD: https://universetbd.org
- Discord de UniverseTBD: https://discord.gg/MNEVegvfJq
