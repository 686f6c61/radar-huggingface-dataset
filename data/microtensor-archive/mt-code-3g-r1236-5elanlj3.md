# microtensor-archive/mt-code-3g-r1236-5ELAnLj3

## Resumen

Microtensor Archive publica `mt-code-3g-r1236-5ELAnLj3`, una copia de archivo certificada de un sistema presentado a la subred de Microtensor (Bittensor subnet 92), un mercado descentralizado que valida y puntúa modelos de código mediante un protocolo de verificación externa. El modelo está orientado a la arena `code/mt-3g`, que agrupa sistemas de generación de código de tamaño reducido (perfil de dispositivo "mt-3g") y ha sido certificado por los validadores de la red con una calidad medida de 0.828 sobre hardware de referencia.

El repositorio contiene el artefacto exacto que el minero envió a la ronda 1236, con un digest criptográfico (`759dbec6e0b610baef39b45a1d980a8b`) que lo vincula a la cadena de bloques de Bittensor. El modelo tiene 751.632.384 parámetros (aproximadamente 750 millones), se distribuye en formato GGUF y ocupa 0.8 GB. La etiqueta `endpoints_compatible` indica que está preparado para ser servido a través de endpoints HTTP, probablemente mediante infraestructuras como vLLM o llama.cpp.

Su relevancia actual radica en que representa un caso real de verificación descentralizada de calidad de modelos: no hay métricas auto-reportadas, sino cifras medidas por la red en hardware estandarizado. Aunque el repositorio no incluye una licencia explícita ni documentación de arquitectura, la existencia de la subred y su sistema de validación aporta un contexto de confianza técnica que conviene evaluar con cautela antes de su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF implica cuantizacion, pero no se especifican los niveles) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo (tipo de transformer, número de capas, dimensiones, etc.). El nombre del perfil `code/mt-3g` sugiere que pertenece a la clase de modelos de código de aproximadamente 3 mil millones de parámetros, pero el recuento real de parámetros es de 751.632.384, lo que indica que el "3g" hace referencia a la clase de dispositivo o al perfil de hardware, no al tamaño del modelo.

El proceso de entrenamiento tampoco está documentado en la información disponible. Lo que sí se sabe es que el modelo fue presentado a la subred de Microtensor (Bittensor subnet 92), donde los validadores miden su calidad sobre un corpus de referencia fijado en el momento del "congelamiento del corpus". La calidad medida de 0.828 es un dato objetivo proporcionado por la red, no auto-reportado. El repositorio incluye `manifest.json`, que vincula los bytes del modelo, la ronda, la clase de hardware, los límites de recursos declarados y la revisión del modelo base fijado, lo que permite verificar la integridad del artefacto.

## Capacidades

- Generación de código: el modelo está diseñado para la arena `code/mt-3g` de Microtensor, centrada en tareas de generación de código.
- Calidad verificada: 0.828 medida por validadores de la red sobre hardware de referencia.
- Compatible con endpoints: la etiqueta `endpoints_compatible` indica que puede ser servido a través de APIs de inferencia.
- Formato GGUF: permite su despliegue en `llama.cpp`, `Ollama` y otras herramientas compatibles con este formato.
- Replicabilidad: el hash del sistema está registrado en cadena, lo que permite verificar que los bytes coinciden con el envío original.
- No se dispone de información sobre capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- **Despliegue en hardware de gama baja**: con 750M parámetros y 0.8 GB en GGUF, el modelo puede ejecutarse en GPUs de consumo con 4-8 GB de VRAM, lo que lo hace viable para entornos de desarrollo o edge computing.
- **Generación de código en entornos con restricciones de recursos**: su perfil `mt-3g` está diseñado para ofrecer precisión en tareas de código con un coste computacional reducido, adecuado para autocompletado o asistencia en IDEs ligeros.
- **Verificación de calidad mediante validación externa**: la red de MicroTower proporciona una puntuación de calidad medida (0.828) y un coste esperado por consulta (5.356 ms), lo que permite comparar objetivamente el modelo con otros del mismo perfil.
- **Integración en pipelines de inferencia con GGUF**: su formato GGUF facilita su uso con `llama.cpp`, `Ollama` y `vLLM` para servir el modelo en producción.
- **Auditoría de modelos**: al ser una copia de archivo con hash registrado en cadena, es útil para auditar el comportamiento de un sistema concreto en una ronda específica de la subred.
- **Investigación sobre validación de modelos**: el repositorio incluye el manifiesto firmado y los informes de validación, lo que lo convierte en un caso de estudio para metodologías de verificación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tradicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento proporcionada es la medida por la red de Microtensor:

| Metrica | Valor |
|---|---|
| Calidad | 0.828 |
| Coste esperado por consulta | 5356.0 ms |
| Replicacion | 1 |

Esta métrica de calidad es un agregado ponderado de la red que combina precisión y otros factores, pero no se desglosan los subcomponentes ni se compara con otros modelos en la misma tabla.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 750M parámetros y formato GGUF, la inferencia en FP16 requeriría aproximadamente 1.5 GB de VRAM; con cuantización Q4_K_M, podría reducirse a ~0.5-0.7 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 2060) puede ejecutar el modelo sin problemas. En CPU, es viable con 4-8 GB de RAM.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU de consumo moderna, incluso en iGPU con suficiente RAM compartida.
- **Opciones de despliegue**: GGUF es compatible con `llama.cpp`, `Ollama`, `vLLM` (con adaptadores) y `llama-cpp-python`. También se puede usar con `TGI` si se convierte a safetensors.
- **Latencia**: la red de validación midió 5.356 ms por consulta en hardware de referencia, lo que sugiere una latencia de inferencia moderada para tareas de generación de código.

## Comparativa con modelos similares

No se dispone de datos comparativos directos del modelo con otras alternativas en la información proporcionada. Sin embargo, se puede contextualizar con modelos de código de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| mt-code-3g-r1236 (este modelo) | 750M | no disponible | no disponible | GGUF |
| CodeGPT (OpenAI) | 12M-1.5B | 2048 | MIT | TensorFlow/PyTorch |
| StarCoderBase-3B | 3B | 8192 | BigCode OpenRAIL-M | safetensors |
| CodeGen-350M | 350M | 2048 | BSD-3 | safetensors |

El modelo de MicroTower es el único de la tabla con verificación externa de calidad y formato GGUF, pero carece de datos de contexto y licencia, lo que dificulta una comparativa completa. Los datos de CodeLlama y CodeGen no son verificados por la red.

## Limitaciones y advertencias

- **Licencia no especificada**: el repositorio no indica ninguna licencia, lo que implica que no está autorizado para uso comercial sin consultar al autor. Precaución.
- **Datos de entrenamiento no disponibles**: no se conoce el corpus, la composición de los datos ni el método de entrenamiento (RLHF, DPO, etc.), lo que impide evaluar sesgos o riesgos de alucinación.
- **Contexto no documentado**: se desconoce la longitud de contexto soportada, lo que limita su uso en tareas que requieren ventanas largas.
- **Calidad medida en condiciones específicas**: la puntuación de 0.828 fue medida por la red de validadores en hardware de referencia y sobre el corpus congelado de la ronda 1236; el rendimiento en otros entornos puede variar.
- **Es una copia de archivo**: el repositorio es una copia certificada de un envío de la subred, no un modelo desarrollado por el autor del repositorio; la responsabilidad sobre el modelo recae en el minero original.
- **Sin métricas de sesgo**: no hay información sobre sesgos potenciales en la generación de código (por ejemplo, tendencia a generar código inseguro o con vulnerabilidades).
- **Formato GGUF**: si se necesita usar en frameworks que requieren safetensors, sería necesario convertir el modelo, lo que puede introducir cambios en el comportamiento.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/microtensor-archive/mt-code-3g-r1236-5ELAnLj3
- GitHub de la subred Microtensor: https://github.com/microtensor-io/microtensor-subnet
- GitHub con activos inmutables de SN92: https://github.com/enka1504/sn92-mt3g
- GitHub de syntheticore/microtensor (librería de diferenciación automática): https://github.com/syntheticore/microtensor
- GitHub de jeffbaumes/microtensor (librería de tensores educativa): https://github.com/jeffbaumes/microtensor
