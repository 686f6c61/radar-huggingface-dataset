# da24b046/leak-curber-submission-16

## Resumen

El repositorio `da24b046/leak-curber-submission-16` contiene un artefacto de inferencia orientado a la predicción de números EC (Enzyme Commission) a partir de reacciones químicas. No se trata de un modelo de lenguaje generativo al uso, sino de un ensemble de expertos neuronales y recuperación que produce una única etiqueta EC totalmente especificada por reacción de entrada. El autor lo describe explícitamente como un "candidato marginal" de revisión, no como una mejora consolidada sobre su predecesor S15, y advierte de que la pantalla de mejora en desarrollo falló.

El sistema combina cinco expertos congelados de la versión S15 con un sexto experto nuevo entrenado sobre características de tokens hasheados de tipo n-grama (token2–4gram de reactivos, productos, ganancias y pérdidas). La inferencia es portable, sin dependencia de PyTorch, GPU ni red, y se ejecuta en CPU con NumPy y SciPy. El repositorio ocupa 0,9 GB y está diseñado para un entorno de evaluación offline de 2 CPU, 16 GiB de RAM y 900 segundos.

La relevancia de esta ficha es limitada en términos de modelo de propósito general: no hay model card estándar, ni licencia declarada, ni idiomas, ni benchmarks publicados. Su interés reside en el diseño de fusión de señales (ensemble de expertos neuronales, recuperación k-NN y posterior de caracteres) y en las estrictas restricciones de empaquetado para evaluación ciega.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de seis expertos neuronales (cinco congelados de S15 y uno nuevo) más índices de recuperación y posterior de caracteres; el experto nuevo es una cabeza coseno sobre representación dispersa hasheada |
| Parametros totales | no disponible (el autor no publica recuento de parámetros) |
| Parametros activos | no disponible (no es un modelo MoE en el sentido habitual; el ensemble combina expertos en inferencia) |
| Longitud de contexto | no disponible (la entrada es una reacción química, no una secuencia de texto con ventana declarada) |
| Tipos de cuantizacion | no disponible (inferencia en NumPy/SciPy; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (la salida es una etiqueta EC, no texto libre) |
| Licencia | no disponible |
| Formato de pesos | no disponible explícitamente; el repositorio incluye `weights/model.json` y un directorio de pesos, con inferencia vía `predict.py` |

## Arquitectura y entrenamiento

El sistema es un ensemble de fusión tardía. Cinco expertos provienen de la versión S15 y permanecen congelados; el sexto es un experto nuevo entrenado sobre conteos de tokens hasheados en 32768 dimensiones (token2–4gram de reactivos, productos, ganancia y pérdida), con conteos logarítmicos, cuatro pesos de bloque de 0,25/0,25/1/1 y normalización por fila L1/L2. Se conservan tokens de átomos entre corchetes, Cl/Br y anillos. La eliminación y truncado de mapas atómicos son solo a nivel de características: la agrupación exacta de la entrada cruda y los primeros identificadores no cambian. El autor subraya que las diferencias son textuales y no cambios de enlace verificados con mapas atómicos.

El experto nuevo es una cabeza coseno con signo sobre un prefijo EC: capa dispersa 32768→256 con LayerNorm/ReLU/dropout, salida de 256 dimensiones con signo. Hiperparámetros declarados: dropout 0,15, suavizado 0,03, weight decay 0,0005, batch 512, semilla 3410. Entrenamiento en split propio durante 48 épocas, con checkpoint seleccionado en la época 36; refit posterior sobre datos completos con 63280 reacciones durante 36 épocas manteniendo el horizonte de LR coseno de 48 épocas. La receta exacta de fusión está en `weights/model.json`: pesos estructurales 0,25/0,25/0,125/0,375, potencia 0,25, nitidez 0,85, 95 % neural y 5 % recuperación k5, T=0,02, L3 beta 0,2; 5 % posterior de caracteres con T=0,75; después pool geométrico normalizado del 99 % de ese posterior más 1 % del posterior del token nuevo con T=1,0. No hay puerta de confianza ni decodificador adicional.

## Capacidades

- Predicción de una única etiqueta EC completamente especificada por reacción de entrada, en formato JSONL con exactamente los campos `id` y `prediction`.
- Fusión de múltiples señales: expertos neuronales congelados, recuperación k-NN sobre índices existentes y posterior de caracteres.
- Representación de reacciones mediante n-gramas de tokens (2 a 4) hasheados a 32768 dimensiones, con normalización L1/L2.
- Manejo de notación química específica: átomos entre corchetes, Cl/Br y tokens de anillo.
- Inferencia portable en CPU con NumPy y SciPy, sin PyTorch, sin GPU y sin acceso a red.
- Ejecución offline en un contenedor Linux amd64 con Python en `/usr/local/bin/python` y entrada `python /app/predict.py --input INPUT --output OUTPUT`.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling ni agentes.

## Casos de uso

- Anotación automática de enzimas en pipelines de curación: el sistema recibe reacciones y devuelve una etiqueta EC completa, adecuado para preclasificar grandes lotes antes de revisión manual.
- Enriquecimiento de bases de datos metabolómicas: asignación de números EC a reacciones huérfanas o no anotadas, usando el ensemble como primer filtro.
- Evaluación ciega en entornos restringidos: su diseño offline en 2 CPU y 16 GiB, con salida JSONL acotada a 16 MiB, encaja en harnesses de evaluación sin GPU ni red.
- Reproducción de experimentos de fusión de señales: la receta explícita en `weights/model.json` permite auditar y replicar la combinación de expertos, recuperación y posterior de caracteres.
- Comparación de estrategias de representación química: el experto de tokens hasheados sirve para estudiar el impacto de n-gramas textuales frente a índices de recuperación estructurados.
- Prototipado de clasificadores EC ligeros: al no requerir PyTorch ni GPU, puede integrarse en servicios de CPU con presupuesto de memoria limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la pantalla de mejora en desarrollo falló, que la puntuación oficial de S16 es desconocida y que la exposición histórica a datos públicos y de test impide una estimación independiente o una ganancia oficial garantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia es en CPU con NumPy y SciPy, sin GPU.
- GPU recomendadas: ninguna; el autor declara explícitamente que no se usa GPU.
- Cabe en GPU consumer: no aplica por diseño (inferencia CPU-only).
- Memoria y CPU del entorno declarado: 2 CPU y 16 GiB de RAM, con límite de 900 segundos incluyendo la descarga y carga de la imagen del evaluador.
- Opciones de despliegue: ejecución directa con `python /app/predict.py --input INPUT --output OUTPUT` en Linux amd64; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor señala que la descarga en frío del evaluador no se midió localmente.
- Restricciones de empaquetado: repositorio menor de 4 GiB (0,9 GB reales) y salida menor de 16 MiB.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de predicción EC ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El propio autor califica el artefacto como candidato marginal de revisión, no como una mejora establecida sobre S15.
- La pantalla de mejora en desarrollo falló y permanece fallida; no hay garantía de ganancia oficial.
- La exposición histórica a datos públicos y de test impide una estimación independiente del rendimiento.
- La puntuación oficial de S16 es desconocida y no se realizó subida ni envío por agente.
- Las diferencias de entrada son textuales; no se verificaron cambios de enlace con mapas atómicos.
- El experto nuevo no tiene índice de recuperación propio.
- No se declara licencia, lo que impide confirmar condiciones de uso comercial.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática; la salida es una etiqueta EC, no texto libre.
- El repositorio no debe contener datasets, salidas de desarrollo, cachés, credenciales ni notas de estudio, según las reglas del autor.

## Enlaces

- Hugging Face: https://huggingface.co/da24b046/leak-curber-submission-16
- Receta de fusión: `weights/model.json` dentro del repositorio
- Script de inferencia: `/app/predict.py` (referenciado en la model card; no se proporciona URL directa)
