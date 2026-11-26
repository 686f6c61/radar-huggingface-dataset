# Sakarein/inkling-2-mini-jlens

## Resumen

Inkling 2 Mini J-lens es un artefacto de investigación publicado por el usuario Sakarein en Hugging Face. No se trata de un modelo de lenguaje en sentido estricto, sino de un conjunto de cuatro matrices de lente jacobiana (Jacobian lens) calculadas para el modelo `thinkingmachines/Inkling-2-Mini`, desarrollado por Thinking Machines. El paquete se creó para participar en el NDIF Looped Lens Challenge, un certamen centrado en interpretabilidad de modelos con capas repetidas.

El fichero `jlens_run_B_v35_v36_v44_v45.safetensors` contiene cuatro matrices float32 de forma (2304, 2304), asociadas a cuatro visitas de capa concretas (35, 36, 44 y 45) del modelo base. Cada matriz permite aproximar de forma lineal el efecto que tiene el estado oculto de entrada a una visita sobre la salida del mix final del modelo, proyectándolo después con el `lm_head` para obtener logits.

La relevancia de este artefacto es acotada: sirve para estudiar cómo fluye la información a través de un transformer con capas repetidas (loop), y solo tiene sentido en combinación con el modelo Inkling 2 Mini. No es desplegable de forma autónoma ni sustituye al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Matrices de lente jacobiana (no es un modelo; artefacto de interpretabilidad para un transformer con capas repetidas) |
| Parámetros totales | no disponible (el artefacto contiene 4 matrices de 2304 x 2304 en float32) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo; ajusta cuatro matrices `M` de 2304 x 2304 que aproximan la media del jacobiano `d y / d h`, donde `y` es la salida del mix final del modelo (el vector previo a la normalización final) y `h` es el estado que entra en una visita de capa concreta. La media se calcula sobre 256 secuencias de WikiText-103 (split de entrenamiento, 128 tokens cada una) y sobre las posiciones 16 a 126 de cada secuencia. El gradiente en una posición agrega los efectos sobre `y` en todas las posiciones conservadas iguales o posteriores a ella.

El estimador sigue el código J++ lens del repositorio `safety-research/jpp_lens`. La "Run B" aplica reglas de detach: se tratan como constantes el factor de escala de cada RMS norm, los pesos softmax de cada mix, las compuertas de mensaje (message gates), los pesos del router y las compuertas de salida de atención; además, el producto dentro de la activación de expertos recibe la mitad del gradiente. El modelo base se ejecutó en bfloat16.

El modelo base Inkling 2 Mini tiene 24 capas, y las capas 6 a 17 se ejecutan tres veces, de modo que un token atraviesa 48 visitas de capa (0 a 47). Las matrices publicadas corresponden a las visitas 35, 36, 44 y 45, que leen respectivamente: salida de la capa 10 en la tercera pasada, salida de la capa 11 en la tercera pasada, salida de la capa 19 y salida de la capa 20.

## Capacidades

- Proyección lineal del estado oculto de una visita de capa hacia el espacio de logits del modelo base mediante `lm_head(norm(M @ h))`.
- Lectura aproximada de la contribución de capas intermedias (visitas 35, 36, 44 y 45) a la predicción final.
- Análisis de flujo de información en arquitecturas con capas repetidas (looped transformers).
- Soporte para experimentos de interpretabilidad mecanística sobre el modelo Inkling 2 Mini.
- No soporta generación de texto, tool calling, agentes, visión ni capacidades multilingües por sí mismo.
- No incluye modo thinking ni ninguna capacidad de inferencia autónoma.

## Casos de uso

- Investigación en interpretabilidad mecanística: aplicar las matrices para aproximar qué información de una visita intermedia llega al `lm_head`, sin necesidad de ejecutar el modelo completo hasta el final.
- Análisis de capas repetidas: estudiar cómo las pasadas segunda y tercera de las capas 6 a 17 (visitas 35 y 36) transforman las representaciones, comparando con las visitas 44 y 45 de la pasada única.
- Reproducción del NDIF Looped Lens Challenge: usar el fichero como entrega de referencia o como base para comparar estimadores de lente jacobiana.
- Diagnóstico de atención y routing: al fijar como constantes las compuertas y pesos del router en la Run B, permite aislar el efecto de las rutas de expertos en la salida final.
- Docencia y divulgación: ilustrar con matrices concretas cómo se construye una lente jacobiana y qué significa promediar el jacobiano sobre un corpus.
- Validación de pipelines de gradientes: servir de test para verificar implementaciones propias del estimador J++ lens contra un resultado publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El artefacto ocupa aproximadamente 0,1 GB (cuatro matrices float32 de 2304 x 2304, unos 21 MB cada una).
- Para usar las matrices es necesario cargar el modelo base `thinkingmachines/Inkling-2-Mini` y su `lm_head` y norm final; los requisitos de VRAM dependen de ese modelo, no disponibles en la información proporcionada.
- No cabe esperar inferencia autónoma: el artefacto solo se emplea junto al modelo base.
- Opciones de despliegue: carga directa con `safetensors` en PyTorch; no aplica vLLM, llama.cpp, Ollama ni TGI para estas matrices.
- Latencia y throughput: no disponibles; la operación principal es un producto matriz-vector de 2304 x 2304 por visita.

## Comparativa con modelos similares

| Artefacto | Modelo base | Matrices | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sakarein/inkling-2-mini-jlens | thinkingmachines/Inkling-2-Mini | 4 (visitas 35, 36, 44, 45) | safetensors float32 | no disponible | Hugging Face |
| safety-research/jpp_lens (código) | Genérico | Estimador J++ | Código Python | no disponible | GitHub |
| Otras lentes jacobianas del NDIF Looped Lens Challenge | Distintos modelos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts.
- Solo cubre cuatro visitas de capa (35, 36, 44 y 45); no ofrece una lente completa para las 48 visitas.
- La aproximación es lineal y promediada sobre WikiText-103; puede no capturar comportamientos no lineales ni dominios distintos.
- La Run B introduce reglas de detach que simplifican el jacobiano real; los resultados son una aproximación, no el jacobiano exacto.
- Depende de la versión exacta del modelo base Inkling 2 Mini; cambios en el modelo invalidan las matrices.
- Licencia no disponible: verificar condiciones antes de cualquier uso, incluido el comercial.
- Sin datos de sesgos, alucinación o rendimiento multilingüe porque el artefacto no realiza inferencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin garantías de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Sakarein/inkling-2-mini-jlens
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Código J++ lens: https://github.com/safety-research/jpp_lens
