# Grounded-Entropy/project-genesis

## Resumen

Project Genesis es un componente de inferencia experimental publicado por Grounded-Entropy (atribuido en la model card a Tesseract Spatial Systems LLC y a Christopher Wiley) bajo licencia Apache 2.0. No se presenta como un modelo de lenguaje completo, sino como un "co-procesador geométrico continuo" residente en caché L2, pensado para ejecutarse junto a un modelo de lenguaje y operar sobre variedades toroidales (T^1024 embebidas en S^2047) y marcos Block-Stiefel de 16 canales mediante isometrías de Cayley SO(n) de bajo rango.

La propuesta técnica se apoya en un núcleo CUDA propio (`libgenesis_core.so`) que ejecuta en FP64 nativo (IEEE-754) y mantiene invariantes de conservación de norma a precisión de máquina, sin Softmax, LayerNorm, RMSNorm ni KV-cache internas dentro del núcleo geométrico. Según la model card, los pesos compactos y los marcos Block-Stiefel caben íntegramente en la caché L2 de GPUs modernas, citando como ejemplo los 64 MB de L2 de una NVIDIA GeForce RTX 5080.

Es relevante ahora por su enfoque poco habitual: en lugar de competir en escala de parámetros o longitud de contexto, propone una capa geométrica de precisión doble y baja huella de memoria para acompañar la inferencia de modelos existentes. No obstante, el repositorio se encuentra en estado de "release staging" para la versión v1.1 y no se han publicado pesos de un modelo de lenguaje, benchmarks ni resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-procesador geométrico continuo sobre variedades (toroidal T^1024 en S^2047 y Block-Stiefel de 16 canales), con isometrías de Cayley SO(n) de bajo rango; núcleo CUDA propietario (`libgenesis_core.so`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible (el núcleo no usa KV-cache interna según la model card) |
| Tipos de cuantizacion | no disponible; el núcleo opera en FP64 nativo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; se mencionan "tensor bundles" y binarios `.so` multiarquitectura, sin formatos tipo safetensors o GGUF confirmados |

## Arquitectura y entrenamiento

La arquitectura descrita no es un transformer convencional. Se trata de un co-procesador que opera sobre variedades geométricas: un toro T^1024 embebido en la esfera S^2047 y marcos Block-Stiefel de 16 canales, transformados mediante isometrías de Cayley SO(n) de bajo rango. El diseño busca conservar la norma a precisión de máquina y elimina componentes habituales en los LLM actuales (Softmax, LayerNorm, RMSNorm y KV-cache interna dentro del núcleo). La ejecución se realiza en FP64 nativo mediante un kernel CUDA propio, con residencia completa en caché L2.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF o DPO. La model card indica que la versión v1.1 está en fase de preparación e incluirá binarios multiarquitectura sin símbolos, marcos de coordenadas Block-Stiefel de entrada y salida alineados (`Q_in`, `Q_out`) y arneses reproducibles de benchmark y verificación de hardware. Hasta la finalización de la verificación automática, no hay artefactos publicados que permitan evaluar el comportamiento del sistema.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código o matemáticas propias; el pipeline declarado en Hugging Face es `text-generation`, pero no hay evidencia de pesos ni de un modelo base asociado.
- No se describe soporte de tool calling ni function calling.
- No se describe soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües.
- Capacidad declarada: ejecución de operaciones geométricas en FP64 con conservación de norma a precisión de máquina sobre variedades toroidales y Block-Stiefel.
- Capacidad declarada: residencia en caché L2 de GPU, orientada a reducir latencia de acceso a memoria en el co-procesamiento.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en aprendizaje geométrico profundo: el componente permite experimentar con isometrías de Cayley SO(n) y variedades toroidales en FP64 sin reimplementar los kernels CUDA, lo que resulta adecuado para validar hipótesis sobre conservación de norma en representaciones.
- Aceleración de capas geométricas en pipelines de inferencia: al residir en caché L2, podría integrarse como etapa auxiliar de un modelo de lenguaje para operaciones de proyección sobre variedades, aunque no se han publicado integraciones ni métricas de latencia.
- Reproducción de resultados académicos: la referencia DOI de Zenodo permite replicar el trabajo previo; el repositorio incluirá arneses de verificación reproducibles en la v1.1, útiles para laboratorios que necesiten comparar implementaciones.
- Prototipado en GPUs de consumo: la mención explícita a la caché L2 de 64 MB de una RTX 5080 sugiere que el objetivo es ejecutar el núcleo en hardware de gama alta de consumo, lo que facilitaría pruebas en estaciones de trabajo individuales.
- Evaluación de precisión numérica: al operar en FP64 nativo, sirve para estudiar la degradación de precisión frente a implementaciones en FP16/BF16 en tareas geométricas sensibles.
- Desarrollo de kernels CUDA personalizados: los binarios multiarquitectura sin símbolos previstos en la v1.1 podrían servir como referencia para ingeniería de rendimiento en GPUs con distinta arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los arneses de benchmark y verificación de hardware se publicarán junto con la v1.1, pero no incluye cifras de latencia, throughput ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,1 GB, lo que sugiere una huella de pesos muy reducida, pero no se confirma.
- GPU recomendadas: no se especifican modelos concretos; la model card cita como ejemplo una NVIDIA GeForce RTX 5080 con 64 MB de caché L2, lo que implica que el diseño depende de la capacidad de L2 más que de la VRAM.
- Compatibilidad con GPU de consumo: probable según la referencia a la RTX 5080, pero sin lista oficial de GPUs soportadas.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el despliegue se realiza mediante el binario `libgenesis_core.so` y la librería `transformers` declarada en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (co-procesadores geométricos residentes en caché L2 con núcleo CUDA en FP64). Las alternativas habituales de inferencia (transformers densos o MoE) no son directamente equiparables en propósito ni en especificaciones publicadas.

## Limitaciones y advertencias

- El repositorio está en estado de release staging (v1.1); los binarios, tensor bundles y scripts de evaluación aún no se han publicado, por lo que no es un artefacto listo para producción.
- No se han publicado benchmarks, métricas de latencia ni evaluaciones de calidad, lo que impide verificar las afirmaciones de rendimiento.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento lingüístico, al no tratarse de un modelo de lenguaje con pesos publicados.
- La dependencia de la caché L2 limita el rendimiento a GPUs con suficiente capacidad de L2; el comportamiento en GPUs con menos caché no está documentado.
- El uso de FP64 nativo puede implicar menor throughput que implementaciones en FP16/BF16 en GPUs cuyo rendimiento en doble precisión está limitado por hardware (habitual en GPUs de consumo).
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de artefactos verificados y de documentación de entrenamiento hace desaconsejable su adopción en entornos productivos sin validación propia.
- La model card atribuye el trabajo a una organización y a un autor concretos; conviene verificar la referencia DOI y el estado legal del proyecto antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Grounded-Entropy/project-genesis
- Referencia previa (DOI): https://doi.org/10.5281/zenodo.24047125
