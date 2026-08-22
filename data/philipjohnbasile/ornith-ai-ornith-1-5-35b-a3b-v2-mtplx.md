# philipjohnbasile/ornith-ai-Ornith-1.5-35B-A3B-V2-MTPLX

## Resumen

Ornith-1.5-35B-A3B-V2-MTPLX es una adaptación del modelo Ornith-1.5-35B-A3B, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el proyecto Ornith AI, especializado en tareas de codificación y agentes. Esta versión concreta, publicada por el usuario philipjohnbasile, ha sido convertida al formato MTPLX, un runtime de predicción multi-token diseñado para Apple Silicon (MLX), que permite acelerar la generación de texto mediante la predicción de varios tokens por paso.

El modelo original Ornith-1.5 se enmarca en un enfoque de "self-scaffolding" y "self-improvement": el propio modelo genera tareas, estructuras de andamiaje y soluciones para mejorar iterativamente mediante aprendizaje por refuerzo. La variante MTPLX está optimizada para ejecutarse en hardware Apple (verificado en Apple M5 Max) y se distribuye como un paquete descargable a través del comando `mtplx pull`. Con 35B parámetros totales y 3B activos (según la nomenclatura A3B), el modelo ofrece una buena relación capacidad/eficiencia para entornos locales.

El repositorio incluye el archivo `mtplx_runtime.json` con el registro de verificación, que reporta un multiplicador de velocidad de 1.36× respecto a una línea base autoregresiva, con profundidad óptima D1. La licencia no está especificada en la información disponible, aunque el autor indica que se encuentra en el archivo LICENSE del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (Mixture of Experts) |
| Parametros totales | 35B (reportado por el autor); 5.865.901.936 parámetros según safetensors (posible cuantización) |
| Parametros activos | 3B (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (según tag) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (ver LICENSE en el repo) |
| Formato de pesos | safetensors, MLX (MTPLX) |

## Arquitectura y entrenamiento

La arquitectura base es un modelo MoE con arquitectura Qwen3.5 (según el tag `qwen3_5_moe`), con 35B parámetros totales y 3B activos por token. El modelo original Ornith-1.5 se entrena mediante un proceso de "self-scaffolding" que combina generación de tareas, scaffolds específicos y rollouts de soluciones para aprendizaje por refuerzo, un enfoque que busca que el modelo mejore a partir de sus propias experiencias. La versión MTPLX añade una capa de predicción multi-token (MTP), que permite predecir varios tokens futuros en paralelo, reduciendo la latencia de generación. El archivo de verificación indica que se logró un multiplicador de 1.36× frente a la línea base autoregresiva, con una profundidad óptima D1, validado en Apple M5 Max con sampler de temperatura 0.6, top_p 0.95 y top_k 20.

## Capacidades

- Generación de texto y razonamiento: al ser un modelo MoE de 35B, ofrece capacidad de razonamiento complejo, aunque no se detallan capacidades específicas en la información disponible.
- Orientación a código: la familia Ornith-1.5 está enfocada en tareas de programación y agentes de codificación, según la web oficial de Ornith.
- Multi-token prediction: gracias a la conversión MTPLX, el modelo predice varios tokens por paso, acelerando la generación.
- Optimizado para Apple Silicon: diseñado para ejecutarse en hardware MLX (M5 Max, M5, etc.).
- No se dispone de información sobre soporte de tool calling, funciones, visión u otras capacidades específicas.

## Casos de uso

- Desarrollo de agentes de codificación: el modelo original Ornith-1.5 está diseñado para tareas de programación agéntica; esta versión MTPLX permite ejecutarlo localmente en un Mac con MLX, ideal para entornos de desarrollo integrado.
- Autocompletado de código: gracias a su predicción multi-token, puede acelerar la generación de código en editores, reduciendo la latencia en comparación con modelos autoregresivos.
- Automatización de tareas de programación: como generación de tests, refactorización o revisión de código, aprovechando la capacidad de razonamiento del modelo.
- Investigación en eficiencia de inferencia: el multiplicador de 1.36× documentado puede ser útil para experimentos sobre técnicas de predicción multi-token en hardware Apple.
- Prototipado rápido en entornos locales: al ser un modelo de 4-bit y optimizado para MLX, puede desplegarse en Macs con memoria unificada suficiente para experimentación sin necesidad de GPUs dedicadas.
- Aprendizaje y evaluación de modelos MoE: su arquitectura Qwen3.5 MoE con 3B activos permite estudiar técnicas de sparse inference en entornos domésticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es el multiplicador de 1.36× frente a la línea base autoregressive, verificado en Apple M5 Max, pero no se detallan métricas de precisión (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (M5 Max verificado, probablemente M5 y M4 también compatibles).
- Memoria: el repositorio ocupa 22.1 GB, lo que sugiere que se necesita una Mac con al menos 24-32 GB de memoria unificada para cargar el modelo en 4-bit.
- Cuantización: el modelo está cuantizado en 4-bit, lo que reduce los requisitos de memoria frente a la versión completa.
- Despliegue: requiere el runtime MTPLX (repositorio `youssofal/MTPLX`), que se instala vía `mtplx pull` y `mtplx start chat`.
- No se proporcionan datos de latencia o throughput específicos, salvo el multiplicador de velocidad mencionado.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos similares. El modelo original Ornith-1.5-35B-A3B tiene variantes de 397B y 9B, pero no hay datos de rendimiento para establecer una comparativa objetiva. Se recomienda consultar la documentación oficial de Ornith para más detalles.

## Limitaciones y advertencias

- No se especifica la licencia en el archivo de la model card; es necesario revisar el archivo LICENSE del repositorio para conocer las restricciones de uso comercial.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto.
- El modelo está optimizado para Apple Silicon; no se garantiza su funcionamiento en otras plataformas (aunque podría convertirse con herramientas externas).
- La verificación se realizó en un Apple M5 Max con una configuración específica; el rendimiento puede variar en otros dispositivos.
- El modelo es una conversión MTPLX de la versión original, por lo que puede presentar diferencias menores en la calidad de generación respecto al modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/philipjohnbasile/ornith-ai-Ornith-1.5-35B-A3B-V2-MTPLX
- Colección Ornith-1.5 en HuggingFace: https://huggingface.co/collections/ornith-ai/ornith-15
- Web oficial de Ornith: https://ornith.ai/
- Documentación de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de Ornith (ornith.online): https://ornith.online/
- Repositorio MTPLX: https://github.com/youssofal/MTPLX
