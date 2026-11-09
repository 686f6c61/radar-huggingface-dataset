# amd/CAE-FastWAM

## Resumen

CAE-FastWAM es un modelo de politica robotica (world-action model) desarrollado por AMD a partir de Wan2.2-TI2V-5B, el modelo de difusion video-texto de Alibaba. Se trata de un ajuste fino orientado a la accion que combina un experto de accion compacto de 32 dimensiones (unos 30 millones de parametros) con un VAE de acciones condicionado por suite, y que se evalua sobre el benchmark de manipulacion robotica LIBERO. El modelo esta pensado para la investigacion en eficiencia de inferencia de politicas roboticas en simulacion, no para robots fisicos.

La innovacion principal reside en la arquitectura Compact Action Expert (CAE): en lugar de decodificar acciones directamente, un VAE codifica cada chunk de 32 x 7 acciones en 8 tokens latentes de anchura 16, y el experto de accion denoisa esos latentes. Combinado con la ruta de inferencia optimizada GEAK sobre GPUs AMD Instinct MI355X, el modelo alcanza tasas de exito del 97,28 por ciento en LIBERO con una latencia de 12,82 ms por decision de politica, y del 97,33 por ciento con solo 4 pasos de denoising a 8,83 ms.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato PyTorch (`policy.pt` y `action_vae.pt`) y estadisticas de normalizacion por suite. No incluye el VAE de Wan2.2 ni el codificador de texto umT5-XXL, que deben descargarse por separado de los repositorios originales. Esta es una ficha tecnica orientada a desarrolladores e investigadores que necesiten evaluar rapidamente su idoneidad para pipelines de robotica simulada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model basado en difusion (Wan2.2-TI2V-5B) con Compact Action Expert (CAE) y VAE de acciones condicionado por suite |
| Parametros totales | no disponible (el experto de accion tiene aproximadamente 30M parametros; el total del modelo base Wan2.2-TI2V-5B es de 5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`policy.pt`, `action_vae.pt`) |

## Arquitectura y entrenamiento

CAE-FastWAM parte de Wan2.2-TI2V-5B, un transformer de difusion (DiT) para generacion de video texto-a-video, y lo ajusta como politica de accion para el benchmark LIBERO. La arquitectura introduce un Compact Action Expert que trabaja en un espacio latente: un VAE de acciones condicionado por suite codifica cada chunk de 32 x 7 acciones en 8 tokens latentes de anchura 16, y el experto de accion (aproximadamente 30M de parametros) denoisa esos latentes en lugar de las acciones crudas. El repositorio incluye pesos de inferencia tanto para el experto de video como para el de accion, pero no el VAE de Wan2.2 ni el codificador de texto umT5-XXL.

El entrenamiento se realizo siguiendo la receta FastWAM sobre el dataset LIBERO en formato LeRobot publicado como `yuanty/LIBERO-fastwam`, sin datos adicionales ni modificaciones al dataset. La evaluacion se llevo a cabo en el simulador LIBERO (las cuatro suites, 50 episodios por tarea) sobre una GPU AMD Instinct MI355X con ROCm 7.14.0 y PyTorch 2.11.0, usando la ruta de inferencia optimizada con GEAK. La receta de entrenamiento (FastWAM) esta bajo licencia MIT, aunque esa licencia cubre el codigo de entrenamiento, no los pesos resultantes.

## Capacidades

- Generacion de acciones roboticas en simulacion: produce chunks de 32 x 7 acciones para tareas de manipulacion del benchmark LIBERO.
- World-action modeling: modela conjuntamente el estado visual del mundo y las acciones, permitiendo razonamiento implicito sobre la dinamica de la escena.
- Inferencia eficiente: soporta decodificacion con 10 o 4 pasos de denoising, con latencias de 12,82 ms y 8,83 ms respectivamente por decision de politica.
- Condicionamiento por suite: el VAE de acciones y las estadisticas de normalizacion estan adaptados a cada una de las cuatro suites de LIBERO (Spatial, Object, Goal y 10).
- Integracion con tooling de AMD: compatible con la ruta de inferencia GEAK y con `torch.compile` sobre ROCm.
- No soporta tool calling ni function calling en el sentido de modelos de lenguaje; su salida es accion motora, no texto.
- No se documentan capacidades multilingues ni de vision general fuera del contexto de politica robotica.

## Casos de uso

- Investigacion en world-action models: el modelo sirve como referencia para estudiar como los modelos de difusion de video pueden adaptarse a la prediccion de acciones en entornos simulados, con una receta reproducible sobre LIBERO.
- Evaluacion de eficiencia de inferencia en GPUs AMD: permite medir el impacto de GEAK y `torch.compile` sobre la latencia de decisiones de politica, con cifras concretas (de 222,55 ms en eager a 8,83 ms con GEAK a 4 pasos).
- Benchmarking de politicas roboticas en LIBERO: se puede usar como baseline para comparar nuevas arquitecturas de accion contra las tasas de exito publicadas (97,28 por ciento con 10 pasos, 97,33 por ciento con 4 pasos).
- Desarrollo de pipelines de robotica simulada: integrable en entornos de evaluacion automatizada que ejecuten las cuatro suites de LIBERO con el simulador en GPU (`--sim instinct`).
- Estudio de compresion de acciones en espacio latente: el VAE suite-conditioned K8 x d16 permite investigar cuanta informacion de accion se conserva al comprimir chunks de 32 x 7 a 8 tokens de anchura 16.
- Optimizacion de despliegue en ROCm: util para equipos que necesiten medir latencia y throughput de politicas de difusion en hardware AMD Instinct MI355X con distintas configuraciones de denoising.
- Analisis de robustez por suite: las estadisticas de normalizacion separadas por suite permiten evaluar el comportamiento del modelo en tareas de distinta naturaleza (espacial, objeto, objetivo, tareas multiples).

## Benchmarks y rendimiento

Resultados de LIBERO (las cuatro suites, 50 episodios por tarea) sobre una GPU AMD Instinct MI355X con ROCm 7.14.0 y PyTorch 2.11.0, simulados en GPU con la ruta GEAK:

| Configuracion | Tasa de exito (%) | Latencia por decision (ms) |
|---|---|---|
| FastWAM, sin optimizacion (10 pasos) | 96,95 ± 0,22 | 222,55 |
| FastWAM + GEAK (10 pasos) | 96,86 ± 0,30 | 24,17 |
| CAE-FastWAM + GEAK (10 pasos) | 97,28 ± 0,20 | 12,82 |
| CAE-FastWAM + GEAK (4 pasos) | 97,33 ± 0,26 | 8,83 |

La tasa de exito es la media ± desviacion estandar sobre 11 ejecuciones completas de LIBERO (5 en la fila de 4 pasos). Las filas de FastWAM usan el checkpoint `yuanty/fastwam`. Como referencia, `torch.compile` por si solo reduce la latencia entre 1,6 y 2,6 veces respecto a PyTorch eager en MI355X, y GEAK es 3,7 veces mas rapido que `torch.compile` para FastWAM. Estas cifras son mediciones en simulador y pueden variar con la configuracion y las versiones de software.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El repo ocupa 10,1 GB, lo que da una cota inferior del espacio en disco necesario.
- GPU recomendadas: AMD Instinct MI355X es la GPU sobre la que se han publicado las mediciones oficiales, con ROCm 7.14.0 y PyTorch 2.11.0.
- Compatibilidad con GPU de consumo: no disponible. No se documenta soporte para GPUs consumer (RTX 4090, etc.) ni para CUDA.
- Opciones de despliegue: la ruta oficial es el repositorio de codigo `AMD-AGI/faster-action-models` con la optimizacion GEAK y `torch.compile`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: 12,82 ms por decision de politica con 10 pasos de denoising y 8,83 ms con 4 pasos, ambos con GEAK sobre MI355X.
- Dependencias adicionales: se requieren el VAE de Wan2.2, el codificador de texto umT5-XXL y el tokenizador umT5-XXL, descargados aparte desde los repositorios de Wan-AI. Tambien se necesitan los assets del simulador LIBERO, los ficheros BDDL de tareas y los estados iniciales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de exito LIBERO | Latencia (ms) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CAE-FastWAM | ~30M en experto de accion (base 5B) | no disponible | 97,28 % (10 pasos) / 97,33 % (4 pasos) | 12,82 / 8,83 | Apache 2.0 | Hugging Face (amd/CAE-FastWAM) |
| FastWAM (`yuanty/fastwam`) | no disponible | no disponible | 96,95 % (10 pasos) | 222,55 (sin optimizar) / 24,17 (GEAK) | no disponible | Hugging Face (yuanty/fastwam) |
| Wan2.2-TI2V-5B (base) | 5B | no disponible | no aplica (no es politica) | no aplica | Apache 2.0 | Hugging Face (Wan-AI/Wan2.2-TI2V-5B) |

No se dispone de datos de otros modelos de politica robotica comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluado unicamente en el simulador LIBERO. No ha sido validado en robots fisicos.
- No destinado a aplicaciones criticas para la seguridad ni de alto riesgo. El usuario es responsable de evaluar la politica y anadir los mecanismos de seguridad adecuados.
- El uso debe cumplir tambien la model card de Wan2.2.
- No se documentan sesgos especificos, pero al entrenarse exclusivamente con el dataset LIBERO, su comportamiento fuera de ese dominio es incierto.
- Riesgo de alucinacion no aplica en el sentido de lenguaje, pero si existe riesgo de acciones incorrectas o inseguras fuera del entorno simulado.
- Los pesos son una version modificada de Wan2.2-TI2V-5B; la receta de entrenamiento FastWAM esta bajo MIT, pero esa licencia no cubre estos pesos.
- Los datos de entrenamiento son LIBERO (CC BY 4.0), publicados como `yuanty/LIBERO-fastwam` (CC BY 4.0), usados tal cual, sin cambios ni datos adicionales.
- El repositorio no incluye el VAE de Wan2.2, el codificador umT5-XXL ni el tokenizador; hay que descargarlos aparte, lo que anade complejidad al despliegue.
- Las cifras de rendimiento son mediciones en simulador y pueden variar con la configuracion y las versiones de software.
- No se documentan tipos de cuantizacion soportados, lo que limita las opciones de despliegue en hardware con VRAM reducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/CAE-FastWAM
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Modelo base Wan2.1-T2V-1.3B (para tokenizer umT5-XXL): https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Checkpoint FastWAM de referencia: https://huggingface.co/yuanty/fastwam
- Dataset LIBERO-fastwam: https://huggingface.co/datasets/yuanty/LIBERO-fastwam
- Codigo: https://github.com/AMD-AGI/faster-action-models
- Documentacion CAE-FastWAM-LIBERO: https://github.com/AMD-AGI/faster-action-models/blob/main/docs/cae-fastwam-libero.md
- Model Zoo: https://github.com/AMD-AGI/faster-action-models/blob/main/MODEL_ZOO.md
- Blog ROCm sobre world action models: https://rocm.blogs.amd.com/artificial-intelligence/faster-action-models/README.html
- Receta de entrenamiento FastWAM: https://github.com/yuantianyuan01/FastWAM
- Benchmark LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- Coleccion Compact Action Expert (CAE): https://huggingface.co/collections/amd/compact-action-expert-cae-6ace112e7bd665ff8c107ed2
- arXiv: https://arxiv.org/abs/2603.16666
