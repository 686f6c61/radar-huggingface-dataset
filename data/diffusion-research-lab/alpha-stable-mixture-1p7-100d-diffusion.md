# Diffusion-Research-Lab/alpha-stable-mixture-1p7-100d-diffusion

## Resumen

alpha-stable-mixture-1p7-100d-diffusion es un repositorio de modelos de difusion de referencia para generacion incondicional de datos sinteticos, publicado por Diffusion-Research-Lab bajo licencia MIT. No es un modelo de lenguaje: se trata de un generador numerico que aprende a muestrear distribuciones alpha-estables mezcladas (distribuciones de cola pesada) en un espacio de 100 dimensiones, entrenado con la libreria gendynamics. El repositorio es pequeno (0,0 GB reportados) y las descargas y likes son cero en el momento de la consulta, lo que indica un artefacto de investigacion reciente y poco difundido.

El modelo agrupa dos variantes de objetivo de difusion: DDPM-V (parametrizacion de varianza, con sigma_max=2) y DLPM-Eps (parametrizacion epsilon, con alpha=1.9). Ambas se entrenaron sobre 20.000 muestras sinteticas de entrenamiento, 2.000 de validacion y 10.000 de test, con learning rate 0,0005. Los pesos publicados corresponden a la mejor epoca segun validacion (epoca 510 para DDPM-V y 298 para DLPM-Eps).

Su relevancia es metodologica: sirve como linea base reproducible para evaluar generadores de difusion sobre distribuciones de cola pesada, un regimen donde las metricas de perdida habituales no garantizan buena cobertura de colas ni de modos. El autor advierte explicitamente que las perdidas no son comparables entre variantes y que las previsualizaciones de muestras son ilustrativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de difusion (DDPM-V y DLPM-Eps) para generacion incondicional |
| Parametros totales | no disponible (el nombre sugiere ~1,7 M y datos de 100 dimensiones, sin confirmar en la documentacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo generativo de datos numericos, no de secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Variantes incluidas | ddpm-v (sigma_max=2) y dlpm-eps (alpha=1.9) |
| Dimension de los datos | 100 dimensiones (segun denominacion del repositorio) |
| Pasos de difusion | 128 |
| Split de datos | 20.000 entrenamiento / 2.000 validacion / 10.000 test |
| Learning rate | 0,0005 |
| Libreria | gendynamics |
| Tamano del repositorio | 0,0 GB reportados |

## Arquitectura y entrenamiento

El repositorio contiene dos modelos de difusion entrenados con gendynamics sobre datos sinteticos generados a partir de una mezcla alpha-estable. La primera variante, DDPM-V, usa parametrizacion de varianza con sigma_max=2 y fue entrenada durante 128 pasos de difusion, alcanzando su mejor validacion en la epoca 510. La segunda, DLPM-Eps, usa parametrizacion epsilon con alpha=1.9 (vinculado a la familia alpha-estable) y alcanzo su mejor validacion en la epoca 298. Los detalles resueltos de arquitectura y entrenamiento se encuentran en el config.json de cada subdirectorio, junto con normalization.safetensors cuando aplica.

El entrenamiento se realizo con learning rate 0,0005 sobre 20.000 muestras sinteticas, con 2.000 para validacion y 10.000 para test. Los parametros del generador sintetico y la semilla del split quedan registrados en dataset.json; metrics.json y provenance.json recogen el resumen de evaluacion y la revision de software. Un punto importante que subraya el autor es que las perdidas reportadas usan el objetivo propio de cada modelo, por lo que no permiten comparar calidad de muestra entre variantes. Antes de subir los pesos, el export se recargo y se verifico que las muestras fueran finitas y con la forma correcta.

## Capacidades

- Generacion incondicional de muestras sinteticas numericas de 100 dimensiones a partir de distribuciones alpha-estables mezcladas.
- Muestreo configurable por lotes mediante el metodo `sample(n)`, con desnormalizacion opcional usando media y desviacion tipica almacenadas.
- Dos parametrizaciones de difusion distintas (varianza y epsilon) que permiten estudiar el efecto del objetivo de entrenamiento.
- Recarga verificada de pesos con comprobacion de muestras finitas y correctamente dimensionadas.
- No dispone de capacidades de texto, codigo, vision, audio, tool calling ni razonamiento multi-paso, al no ser un modelo de lenguaje.
- No hay soporte multilingue ni conversacional.

## Casos de uso

- Linea base de investigacion en difusion: sirve para comparar nuevos objetivos de entrenamiento o arquitecturas sobre una distribucion de cola pesada reproducible, con splits de datos fijos registrados en dataset.json.
- Estudio de distribuciones alpha-estables: el modelo permite muestrear aproximaciones a mezclas alpha-estables en 100 dimensiones, util para analizar colas y modos en modelos generativos.
- Validacion de metodologia de evaluacion: al no comparar perdidas entre variantes, es un caso practico para desarrollar y probar metricas de calidad de muestra independientes del objetivo de entrenamiento.
- Pruebas de reproducibilidad: al incluir config.json, metrics.json y provenance.json, permite replicar el pipeline de entrenamiento y auditar revisiones de software.
- Generacion de datos sinteticos de referencia: puede usarse para producir conjuntos de datos sinteticos de prueba con propiedades de cola pesada conocidas.
- Prototipado en CPU: segun el ejemplo de carga del autor, el modelo puede ejecutarse en CPU (`device="cpu"`), lo que facilita experimentos rapidos sin GPU.
- Docencia y ejemplos de difusion: sirve como ejemplo compacto de entrenamiento e inferencia con la libreria gendynamics.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las perdidas de validacion y test bajo el objetivo propio de cada modelo. No son comparables entre si ni constituyen una medida de calidad de muestra, tal como advierte el autor.

| Modelo | Pasos | Ruido | Entrenamiento / validacion / test | LR | Mejor epoca | Perdida validacion | Perdida test |
|---|---|---:|---:|---:|---:|---:|---:|
| DDPM-V | 128 | sigma_max=2 | 20.000 / 2.000 / 10.000 | 0,0005 | 510 | 2,212 | 3,863 |
| DLPM-Eps | 128 | alpha=1.9 | 20.000 / 2.000 / 10.000 | 0,0005 | 298 | 0,803 | 0,8481 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y en cualquier caso no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamano reportado del repositorio es de 0,0 GB, lo que sugiere pesos muy ligeros.
- El autor incluye un ejemplo de carga con `device="cpu"`, por lo que la inferencia en CPU es viable.
- GPU recomendadas: no disponible en la documentacion; por el tamano aparente no requiere aceleradores de gama alta.
- Compatibilidad con GPU de consumo: no confirmada explicitamente, pero el tamano aparente lo hace presumiblemente apto para cualquier GPU con memoria modesta.
- Opciones de despliegue: la carga se realiza mediante `toolkit.huggingface.load_huggingface_model` del paquete gendynamics; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros modelos de la misma categoria en la informacion proporcionada. Se puede mencionar el repositorio hermano del mismo autor, que entrena las mismas variantes sobre datos sinteticos de cola pesada.

| Modelo | Arquitectura | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|
| alpha-stable-mixture-1p7-100d-diffusion | DDPM-V + DLPM-Eps | Mezcla alpha-estable, 100 dimensiones | MIT | HuggingFace |
| Diffusion-Research-Lab/alpha-stable-1p7-100d-diffusion | DDPM-V + DLPM-Eps | Cola pesada sintetica | MIT | HuggingFace |
| Otros modelos de difusion para datos tabulares/numericos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni mantiene conversaciones.
- Las perdidas de validacion y test usan objetivos distintos por variante y no permiten comparar calidad de muestra, tal como indica explicitamente el autor.
- Las previsualizaciones de muestras son ilustrativas y no constituyen evidencia de precision en las colas ni de cobertura de modos.
- El modelo puede no reproducir correctamente la estructura de cola pesada ni todos los modos de la mezcla alpha-estable subyacente.
- Las muestras etiquetadas como HRRR son ejemplos de investigacion incondicionales, no predicciones meteorologicas, y no deben interpretarse como tales.
- No hay informacion sobre sesgos; al tratarse de datos sinteticos, el riesgo principal es la infidelidad estadistica respecto a la distribucion objetivo.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa conocida.
- Aunque la licencia MIT permite uso comercial, la falta de documentacion sobre el pipeline y el caracter de referencia de investigacion desaconsejan su uso en produccion sin evaluacion propia.
- Debe citarse la revision del repositorio de pesos al reutilizarlos, segun pide el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Diffusion-Research-Lab/alpha-stable-mixture-1p7-100d-diffusion
- Repositorio hermano (alpha-stable-1p7-100d-diffusion): https://huggingface.co/Diffusion-Research-Lab/alpha-stable-1p7-100d-diffusion
- Paquete de entrenamiento (gendynamics toolkit): https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models
- Paper sobre difusion MoE (referencia general, no especifica del modelo): https://arxiv.org/html/2512.01252v1
- Recopilacion de recursos sobre modelos de difusion: https://github.com/diff-usion/Awesome-Diffusion-Models
