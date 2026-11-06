# keyvanatt/pangram-like

## Resumen

pangram-like es un detector de texto generado por IA de pequeno tamano desarrollado por el usuario keyvanatt, construido sobre el modelo base `google-bert/bert-base-uncased` con pooling de media enmascarada y una cabeza lineal. El modelo recibe un texto y devuelve la probabilidad `P(AI)` de que haya sido generado por una maquina. Su nombre hace referencia a Pangram, un detector comercial de referencia, y su principal interes tecnico es que, al ser la cabeza de clasificacion lineal, la prediccion puede descomponerse token a token, lo que permite visualizar que partes del texto han contribuido a la clasificacion.

El modelo se publica con dos checkpoints: `checkpoint.pt`, con BERT congelado y solo la cabeza lineal entrenada durante 2 epocas sobre embeddings precalculados (78,9% de exactitud en validacion), y `finetune.pt`, que parte del anterior y afina las capas 9-11 de BERT junto con la cabeza durante 3 epocas sobre 240.000 muestras (89,4% de exactitud en validacion). Sobre un conjunto de test de 10.000 muestras, `finetune.pt` alcanza una exactitud del 90,6% con un umbral de decision de `logit >= 1` (equivalente a `P(AI) >= 0,73`).

Es relevante ahora porque la deteccion de texto generado por IA es un problema activo en entornos academicos, editoriales y de moderacion de contenido, y este modelo ofrece una implementacion abierta (licencia MIT), reproducible y de bajo coste computacional sobre una arquitectura BERT base de 110 millones de parametros. No obstante, sus propios autores advierten de una tasa de falsos positivos elevada, lo que limita su uso en produccion sin supervision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder) con masked mean pooling y cabeza lineal |
| Parametros totales | no disponible (repo de 0,9 GB, incluye checkpoints PyTorch) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncation, max_length=512 en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen como `state_dict` PyTorch) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`checkpoint.pt`, `finetune.pt`); requiere la clase `Classifier` del repositorio de GitHub |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de clasificacion de texto estandar: un encoder BERT base (`bert-base-uncased`, 12 capas, 768 dimensiones ocultas) que produce representaciones contextuales, sobre el que se aplica un pooling de media enmascarada para obtener un vector unico por texto, seguido de una cabeza lineal que emite un unico logit. La prediccion final se obtiene aplicando sigmoide a ese logit, de modo que la salida es una probabilidad `P(AI)`.

El entrenamiento se realizo en dos fases. En la primera (`checkpoint.pt`), BERT permanecio congelado y solo se entreno la cabeza lineal durante 2 epocas sobre embeddings precalculados. En la segunda (`finetune.pt`), partiendo del checkpoint anterior, se afinaron las capas 9-11 de BERT junto con la cabeza durante 3 epocas sobre 240.000 muestras. Los datos proceden exclusivamente del dataset `Jinyan1/COLING_2025_MGT_en`, correspondiente a la tarea compartida de deteccion de texto generado por maquina (MGT) de COLING 2025, en ingles. No se documenta el uso de RLHF ni DPO; se trata de un ajuste supervisado con etiquetas binarias humano/IA.

La innovacion destacable es la interpretabilidad derivada de la linealidad de la cabeza: al ser una combinacion lineal de las representaciones agrupadas, la contribucion de cada token al logit puede calcularse y visualizarse, tal como se muestra en el repositorio de codigo del autor. No se mencionan tecnicas como decodificacion especulativa ni atencion lineal.

## Capacidades

- Clasificacion binaria de texto como generado por IA o escrito por humano, con salida de probabilidad `P(AI)`.
- Deteccion de texto generado por maquina en ingles, entrenado sobre el corpus de la tarea compartida COLING 2025 MGT.
- Interpretabilidad token a token: al ser la cabeza lineal, permite descomponer la prediccion y visualizar que fragmentos del texto contribuyen a la clasificacion.
- Dos niveles de coste: `checkpoint.pt` (solo cabeza lineal, BERT congelado) y `finetune.pt` (afinado parcial de capas), lo que permite elegir entre velocidad y exactitud.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No tiene capacidades multilingues: solo ingles.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.

## Casos de uso

- Moderacion de contenido en plataformas: el modelo puede puntuar textos enviados por usuarios en ingles con una probabilidad `P(AI)` y derivar a revision humana los que superen un umbral, usando `finetune.pt` para mayor exactitud o `checkpoint.pt` para un filtrado rapido de bajo coste.
- Verificacion en entornos academicos: como senal auxiliar para revisar la originalidad de ensayos o trabajos en ingles, nunca como prueba definitiva, dado el 18,6% de falsos positivos documentado.
- Analisis editorial: deteccion de articulos o resenas potencialmente generados por IA antes de su publicacion, aprovechando la visualizacion token a token para que el editor inspeccione los fragmentos sospechosos.
- Investigacion sobre deteccion de texto generado: el modelo sirve como linea base reproducible (licencia MIT, codigo y notebook de entrenamiento publicados) para comparar con detectores comerciales como Pangram o con otros clasificadores academicos.
- Auditoria de datasets: clasificar grandes volumenes de texto en ingles para estimar la proporcion de contenido generado por IA en un corpus, con la ventaja de que el modelo es pequeno y puede ejecutarse en CPU.
- Filtrado previo en pipelines de datos de entrenamiento: descartar muestras sospechosas de ser generadas por IA antes de incorporarlas a un corpus de entrenamiento, usando `checkpoint.pt` como filtro barato y `finetune.pt` como segunda pasada.
- Analisis de interpretabilidad: dado que la cabeza es lineal, el modelo permite estudiar que tokens o expresiones disparan la clasificacion, lo que resulta util para investigar sesgos de los detectores y las marcas linguisticas del texto generado.

## Benchmarks y rendimiento

Resultados publicados en la model card para `finetune.pt` sobre 10.000 muestras de test, con umbral de decision `logit >= 1` (`P(AI) >= 0,73`):

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 90,6% |
| Precision | 89,5% |
| Recall | 96,2% |
| Tasa de falsos positivos | 18,6% |
| Exactitud en validacion (`finetune.pt`) | 89,4% |
| Exactitud en validacion (`checkpoint.pt`) | 78,9% |

Matriz de confusion (`finetune.pt`, 10.000 muestras de test):

| | Predicho humano | Predicho IA |
|---|---|---|
| **Humano** | 3069 | 703 |
| **IA** | 234 | 5994 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que se trata de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Al tratarse de un BERT base (12 capas, 768 dimensiones ocultas) con una cabeza lineal, la huella en memoria es reducida y cabe holgadamente en cualquier GPU consumer; el repo completo ocupa 0,9 GB, incluyendo ambos checkpoints.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente; una RTX 3060, RTX 4090 o una T4 en cloud son mas que adecuadas. Tambien puede ejecutarse en CPU para inferencia por lotes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna, e incluso en CPU para volumenes moderados.
- Opciones de despliegue: el ejemplo oficial usa PyTorch y `transformers` (`AutoModel`, `AutoTokenizer`) junto con `huggingface_hub` para descargar el `state_dict`. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI; al ser un `state_dict` personalizado con una clase `Classifier` propia, requiere cargar el codigo del repositorio de GitHub. El formato no es GGUF, por lo que llama.cpp no es aplicable directamente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| pangram-like (`finetune.pt`) | BERT base + cabeza lineal | no disponible (BERT base) | 512 tokens | MIT | Hugging Face + GitHub | 90,6% exactitud, 18,6% FPR en test propio |
| pangram-like (`checkpoint.pt`) | BERT base congelado + cabeza lineal | no disponible (BERT base) | 512 tokens | MIT | Hugging Face + GitHub | 78,9% exactitud en validacion |
| Pangram (comercial) | no disponible | no disponible | no disponible | propietaria | servicio comercial | no disponible |
| Detectores de la tarea COLING 2025 MGT | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicos de benchmarks comparables con otros detectores abiertos en la informacion proporcionada; la comparacion con Pangram es solo nominal, ya que este modelo se presenta "en el espiritu de" Pangram pero no se aportan metricas del detector comercial.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos en ingles del corpus COLING 2025 MGT; no es fiable para otros idiomas.
- Tasa de falsos positivos elevada: incluso con el umbral elevado a `logit >= 1` (`P(AI) >= 0,73`), aproximadamente 1 de cada 5 textos humanos se marca como IA (18,6%).
- El autor advierte explicitamente de que no debe usarse como unica base para juzgar si una persona ha utilizado IA.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas sistematicas sobre dominios o estilos no representados en el corpus de entrenamiento.
- Sesgos potenciales derivados del dataset de entrenamiento (COLING 2025 MGT) no documentados en la model card.
- Limitacion de contexto: los textos se truncan a 512 tokens, por lo que la clasificacion de documentos largos solo considera la primera parte.
- Licencia MIT: permite uso comercial, pero el modelo depende de `bert-base-uncased` y de la clase `Classifier` del repositorio de GitHub, por lo que la integracion requiere cargar codigo externo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion independiente por parte de la comunidad.
- No se distribuye en formatos estandar como safetensors o GGUF, sino como `state_dict` de PyTorch, lo que complica el despliegue con herramientas convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keyvanatt/pangram-like
- Codigo, notebook de entrenamiento y visualizacion: https://github.com/keyvanatt/pangram-like
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/Jinyan1/COLING_2025_MGT_en
- Pangram (detector comercial de referencia): https://www.pangram.com/
