# lebiraja/handwriting-forgery-pageencoder

## Resumen

PageEncoder es un codificador de página completa orientado a la verificación de escritor y a la detección de falsificación de manuscritos. Lo desarrolla el usuario lebiraja y se publica bajo licencia MIT. El modelo resuelve un problema concreto: dada una página manuscrita cuestionada y N páginas de referencia del escritor supuesto, determina si la autoría es compatible mediante similitud de coseno entre embeddings de página. Es relevante porque aborda la verificación a nivel de página (no de palabra o firma aislada), lo que encaja con flujos periciales documentales donde se dispone de varias muestras de referencia.

La arquitectura combina un ResNet-18 de un solo canal inicializado de forma aleatoria que procesa K=64 parches de 128 px centrados en tinta por página, seguido de un pooling por atención que produce un embedding de página de 256 dimensiones con normalización L2. El entrenamiento usa SupCon junto con destilación de características y relacional desde un profesor DINOv2-small congelado, que no es necesario en inferencia. El modelo está entrenado únicamente con manuscrito en inglés (IAM y CVL).

Es un artefacto de investigación de tamaño reducido (repositorio de 0.0 GB, solo `best.pt`, `config.yaml` y `best_val.json`), sin pipeline declarado en Hugging Face y con 0 descargas en el momento de la consulta. Funciona en CPU y aprovecha GPU automáticamente si está disponible. El propio autor advierte que no es una herramienta forense: las salidas son evidencia de similitud, no prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ResNet-18 (1 canal, inicialización aleatoria) sobre K=64 parches de 128 px centrados en tinta, con attention pooling y embedding de página de 256 dimensiones L2-normalizado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa una página completa como conjunto de 64 parches) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (entrenado con IAM + CVL) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`best.pt`), más `config.yaml` y `best_val.json` |

## Arquitectura y entrenamiento

El modelo es un codificador de página basado en ResNet-18 modificado para aceptar una única entrada de canal (imagen de tinta en escala de grises). Cada página se descompone en K=64 parches de 128 px centrados en la tinta; cada parche pasa por el backbone y los embeddings resultantes se agregan mediante attention pooling para producir un vector de página de 256 dimensiones normalizado en L2. La comparación entre páginas se realiza por similitud de coseno entre esos vectores.

El entrenamiento combina SupCon (supervised contrastive learning) con destilación de características y destilación relacional desde un profesor DINOv2-small congelado. El profesor no se usa en inferencia, por lo que el artefacto desplegado es únicamente el estudiante. Los datos de entrenamiento son manuscrito en inglés de los corpus IAM y CVL. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Verificación de escritor a nivel de página mediante similitud de coseno entre embeddings de 256 dimensiones.
- Detección de falsificación por comparación de una página cuestionada con N páginas de referencia del escritor supuesto.
- Aprendizaje métrico (SupCon) que produce un espacio de embeddings donde páginas del mismo escritor quedan próximas.
- Procesamiento de página completa mediante agregación de 64 parches con attention pooling.
- Inferencia en CPU con uso automático de GPU si está disponible.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión general, audio ni generación de texto.
- Capacidad multilingüe limitada al inglés (IAM + CVL).

## Casos de uso

- Triaje pericial documental: comparar una página cuestionada con un conjunto de referencias del escritor reclamado y usar la similitud de coseno como indicio preliminar antes del análisis manual por un perito.
- Filtrado en digitalización de archivos: detectar páginas que no encajan con el escritor dominante de un legajo para revisión manual posterior.
- Verificación en procesos de incorporación: comprobar que formularios manuscritos presentados como de un mismo autor son consistentes entre sí.
- Control de calidad en entornos educativos o administrativos: señalar exámenes o formularios cuya caligrafía difiere de las muestras de referencia del estudiante o empleado.
- Investigación en biometría de escritura: servir como baseline reproducible (ResNet-18 + SupCon + destilación DINOv2) para experimentos de verificación de escritor a nivel de página.
- Precribado en flujos de autenticación documental: reducir el volumen de páginas que requieren inspección forense completa ordenando por similitud con las referencias.
- Prototipado en CPU: desplegar un servicio de comparación de páginas sin GPU, dado que el modelo funciona en CPU y el profesor DINOv2 no es necesario en inferencia.

## Benchmarks y rendimiento

| Conjunto de validación | EER (mejor checkpoint) | Nota |
|---|---|---|
| IAM | 0.005 | Optimista: mismo escáner y bolígrafo |
| CVL | 0.059 | Condiciones menos controladas |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un ResNet-18 sobre 64 parches de 128 px, la huella es reducida y cabe holgadamente en GPU de consumo.
- GPU recomendadas: cualquier GPU con suficiente memoria para un ResNet-18; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño del backbone (ResNet-18) y el procesamiento por parches.
- Opciones de despliegue: PyTorch nativo (carga de `best.pt` como `state_dict`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de verificación de escritor a nivel de página ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El propio autor indica que no es una herramienta forense: las salidas son evidencia de similitud, no prueba.
- El EER de 0.005 en IAM es optimista porque comparte escáner y bolígrafo; el dato más representativo es CVL con 0.059.
- Entrenado solo con manuscrito en inglés (IAM + CVL); el rendimiento en otros idiomas o alfabetos no está caracterizado.
- Riesgo de sesgo por los corpus de entrenamiento (estilos, soportes y condiciones de captura limitados).
- No se documentan sesgos demográficos ni análisis de robustez ante variaciones de escáner, tinta o resolución.
- Licencia MIT: permite uso comercial, pero sin garantías; el autor no ofrece soporte ni validación forense.
- Repositorio de 0.0 GB y sin pipeline declarado en Hugging Face; 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción.
- No hay información sobre cuantizaciones ni formatos alternativos de pesos más allá de `state_dict` en PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/lebiraja/handwriting-forgery-pageencoder
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados al modelo.
