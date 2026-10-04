# alexwengg/woof-pup-0.6b-mlx-8bit

## Resumen

Woof Pup 0.6B es un modelo de lenguaje especializado en triaje de correo electrónico, desarrollado por el usuario alexwengg y publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un destilado por conocimiento del modelo ConwayResearch/Underdog-Woof-4B-1.1 (profesor) sobre el modelo base Qwen/Qwen3-0.6B (alumno). Su funcion es acotada y muy concreta: recibe el texto de un correo y devuelve un unico objeto JSON con seis campos (categoria, intencion, elementos de accion, fechas, importe y urgencia). No es un asistente conversacional generalista.

El modelo cuenta con 596.049.920 parametros y se distribuye exclusivamente en formato MLX de 8 bits, con pesos en safetensors y un tamano de repositorio de 0,6 GB. Esta disenado para inferencia en dispositivo (on-device) sobre silicio de Apple, con una velocidad medida de aproximadamente 240 tokens por segundo en un MacBook con chip M5 Pro y 24 GB de memoria unificada, lo que equivale a procesar un correo completo en unos 0,25 segundos. Existe tambien una compilacion para Neural Engine mediante Core ML.

Su relevancia actual radica en dos factores. Primero, demuestra que la destilacion de tareas muy estructuradas a modelos de menos de 1000 millones de parametros permite obtener precision util (entre el 73 % y el 94 % de concordancia con el profesor segun el campo) a una fraccion del coste computacional. Segundo, el flujo completo de entrenamiento se ejecuto en un unico portatil con 24 GB de memoria, lo que ilustra la viabilidad de producir clasificadores especializados sin infraestructura de GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen3-0.6B declara 32 768 tokens) |
| Tipos de cuantizacion | 8 bits en formato MLX; existe una compilacion Core ML para Neural Engine. El autor indica que la cuantizacion a 4 bits degrada el modelo (bucles de repeticion y JSON invalido) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx-lm); repo de 0,6 GB |
| Modelo base | Qwen/Qwen3-0.6B |
| Modelo profesor | ConwayResearch/Underdog-Woof-4B-1.1 |
| Dataset de entrenamiento | Yale-LILY/aeslc (corpus Enron), etiquetado por el profesor |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B, un transformer denso de 0,6 mil millones de parametros. El ajuste realizado por el autor es un fine-tuning completo de todas las capas del transformer, no un adaptador LoRA. El proceso consta de cuatro fases documentadas. En la primera, el modelo profesor Woof 4B etiqueto 14 600 correos del corpus AESLC (Enron) en el formato JSON objetivo; se descarto aproximadamente un 1 % de salidas malformadas, quedando 14 500 etiquetas validas. En la segunda, se ajusto el estudiante sobre 13 700 correos etiquetados durante 4500 pasos con tasa de aprendizaje coseno con pico en 5e-5, reservando 293 correos para evaluacion. En la tercera, se anadieron 3000 pasos de destilacion con etiquetas suaves, incorporando una perdida KL hacia la distribucion de probabilidad del profesor sobre las 8 categorias y los 3 niveles de urgencia, con peso 2; esto elevo la concordancia de categoria del 70,6 % al 73,0 % y la de urgencia del 83,3 % al 85,3 %. La cuarta fase fue la cuantizacion a 8 bits en MLX.

El formato de entrada es rigido y forma parte del entrenamiento: un mensaje de sistema literal y el correo precedido del prefijo `EMAIL:\n`, con el modo thinking de Qwen3 desactivado y decodificacion voraz (temperatura 0). El autor advierte explicitamente de que usar el prompt de sistema textual es requisito para reproducir el comportamiento entrenado. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Clasificacion de correo en 8 categorias: request, fyi, scheduling, approval, negotiation, personal, announcement y other.
- Asignacion de urgencia en tres niveles: low, medium y high.
- Extraccion de elementos de accion como lista de cadenas cortas.
- Extraccion de fechas y plazos tal y como aparecen escritos en el correo.
- Extraccion de importes monetarios como objeto con valor numerico y divisa (USD).
- Generacion de un resumen de intencion de una frase, con un maximo de 20 palabras.
- Salida estrictamente en JSON valido: el autor reporta un 100 % de JSON valido sobre 293 correos retenidos.
- Inferencia en dispositivo sobre Apple Silicon mediante mlx-lm, con una variante Core ML para Neural Engine.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking; de hecho el autor indica desactivar el thinking del modelo base.

## Casos de uso

- Triaje automatizado de buzon de entrada: dado que procesa correos a aproximadamente 160 por minuto en un M5 Pro, permite clasificar por categoria y urgencia lotes completos de correo entrante en local, sin enviar contenido a servicios externos.
- Enrutamiento de tickets hacia equipos: la categoria y la urgencia generadas permiten dirigir automaticamente cada mensaje al equipo de ventas, soporte, finanzas o direccion segun corresponda.
- Extraccion de importes para conciliacion financiera: el campo amount devuelve valor y divisa de forma estructurada, con una concordancia del 94,2 % con el profesor, lo que lo hace util como primer paso de un pipeline de cuentas por pagar.
- Deteccion de plazos y compromisos: el campo dates extrae fechas y vencimientos tal y como aparecen en el texto (81,2 % de coincidencia exacta de lista con el profesor) para alimentar calendarios o sistemas de seguimiento.
- Generacion de listas de tareas a partir de correo: los action_items permiten crear entradas en un gestor de tareas a partir de mensajes que exigen respuesta o ejecucion.
- Asistencia a equipos legales o de compras: en correos de negociacion o aprobacion, el resumen de intencion y los importes proporcionan una ficha breve reutilizable para revisiones internas.
- Preprocesamiento de bajo coste antes de un modelo mayor: al ser un modelo de 0,6 GB, puede actuar como primer filtro que descarte correo irrelevante y reserve el modelo grande solo para los casos ambiguos.
- Aplicaciones de escritorio en macOS: la compilacion Core ML y la demo en SwiftUI permiten integrar el triaje en un cliente de correo nativo que funcione sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor unicamente reporta concordancia con las etiquetas del modelo profesor sobre 293 correos retenidos, con pesos de 8 bits.

| Campo evaluado | Concordancia con Woof 4B |
|---|---|
| JSON valido | 100 % |
| Categoria | 73,0 % |
| Urgencia | 85,3 % |
| Importe | 94,2 % |
| Fechas (lista exacta) | 81,2 % |

El autor matiza que las etiquetas de categoria son ambiguas: el propio Woof 4B, preguntado dos veces por el mismo correo con el prompt reformulado, solo coincide consigo mismo en categoria entre el 78 % y el 84 % de las ocasiones. En el subconjunto de correos donde las dos respuestas del profesor coinciden, el estudiante acierta el 81,5 % en categoria y el 90,3 % en urgencia.

| Metrica de velocidad (Apple M5 Pro, 24 GB) | Woof Pup 0.6B | Woof 4B (profesor) |
|---|---|---|
| Generacion | ~240 tok/s | ~95 tok/s |
| Primer token | ~35 ms | ~65 ms |
| Un correo, extremo a extremo | ~0,25 s | ~0,65 s |
| Throughput sobre 200 correos | ~160 correos/min | no disponible |

## Requisitos de hardware

- VRAM o memoria unificada: al tratarse de un repositorio de 0,6 GB con pesos de 8 bits, la inferencia requiere aproximadamente 1 GB de memoria, incluyendo el contexto.
- Plataforma: la libreria mlx-lm solo funciona en Apple Silicon con macOS. Las mediciones del autor corresponden a un MacBook con chip M5 Pro y 24 GB de memoria unificada.
- GPU recomendadas: no se reportan pruebas sobre CUDA. Para Apple Silicon se ha validado en la serie M5 Pro; por tamano, cualquier chip M1 o posterior con al menos 8 GB de memoria unificada deberia poder cargarlo.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon. No hay pesos GGUF en el repositorio, por lo que no se puede ejecutar directamente en llama.cpp u Ollama sin convertir antes los pesos.
- Opciones de despliegue: mlx-lm (ruta oficial), servidor ANEMLL en el puerto 8082 segun el script de demostracion, y la compilacion Core ML/Neural Engine alojada en alexwengg/woof-pup-0.6b-coreml. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput estimados: 240 tokens por segundo de generacion, 35 ms hasta el primer token, 0,25 s por correo de extremo a extremo y unas 160 piezas por minuto en procesamiento por lotes sobre 200 correos.
- Requisitos de la demo: macOS 15 o superior, Xcode Command Line Tools y Python 3.10 o posterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| woof-pup-0.6b-mlx-8bit | 596 M | no disponible | 73,0 % categoria y 85,3 % urgencia frente al profesor, en 293 correos | Apache-2.0 | MLX 8 bits y Core ML |
| Underdog-Woof-4B-1.1 (profesor) | 4 B (aproximado, no confirmado en la informacion disponible) | no disponible | 95 tok/s y 0,65 s por correo en M5 Pro | Apache-2.0 | HuggingFace |
| Qwen3-0.6B (base) | 596 M | 32 768 tokens segun el modelo base | modelo generalista, sin fine-tuning para triaje de correo | Apache-2.0 | safetensors y multiples cuantizaciones |

No se dispone de datos verificados en la informacion proporcionada sobre otras alternativas especializadas en triaje de correo con las que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Alcance limitado al ingles y a correo empresarial, mayoritariamente del corpus Enron de principios de los anos 2000. El autor advierte de resultados mas debiles ante estilos de escritura muy distintos.
- El modelo reproduce el criterio del profesor, incluidas sus inconsistencias en categorias ambiguas. Con una concordancia de categoria del 73 %, la etiqueta generada no debe tratarse como verdad absoluta.
- Los campos de intencion y elementos de accion son resumenes cortos, no extractos literales, por lo que no son adecuados para tareas que exijan citas exactas.
- La cuantizacion a 4 bits rompe el modelo, provocando bucles de repeticion y JSON invalido. No es una opcion viable para reducir aun mas el consumo.
- El prompt de sistema debe usarse de forma literal, el correo debe ir precedido de `EMAIL:\n`, el modo thinking debe desactivarse y la decodificacion debe ser voraz. Cualquier desviacion del formato de entrenamiento puede degradar la salida.
- Existe riesgo de alucinacion en los campos de fechas e importes cuando el texto es ambiguo; el autor no reporta tasas de error especificas para estos casos, solo la concordancia con el profesor.
- La licencia Apache-2.0 permite uso comercial, pero el corpus Enron utilizado para el etiquetado es un conjunto de correo real de caracter publico; conviene revisar implicaciones de privacidad si se reutiliza el dataset para reentrenar.
- No hay resultados publicados de benchmarks estandar, por lo que no es posible comparar el modelo con alternativas generalistas en tareas fuera del triaje de correo.
- El repositorio no incluye pesos GGUF ni compatibilidad documentada con vLLM o TGI; el despliegue en servidores Linux con CUDA requeriria trabajo de conversion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexwengg/woof-pup-0.6b-mlx-8bit
- Compilacion Core ML para Neural Engine: https://huggingface.co/alexwengg/woof-pup-0.6b-coreml
- Modelo profesor (ConwayResearch/Underdog-Woof-4B-1.1): https://huggingface.co/ConwayResearch/Underdog-Woof-4B-1.1
- Modelo base (Qwen3-0.6B): https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset AESLC (Yale-LILY): https://huggingface.co/datasets/Yale-LILY/aeslc
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Busqueda web realizada: no se han encontrado resultados relevantes sobre este modelo; las entradas devueltas corresponden a contenidos sin relacion con el modelo.
