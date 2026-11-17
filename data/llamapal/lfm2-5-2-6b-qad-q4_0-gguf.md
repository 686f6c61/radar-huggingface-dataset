# LlamaPal/LFM2.5-2.6B-QAD-Q4_0-GGUF

## Resumen

LFM2.5 2.6B es un modelo de lenguaje de 2.697.198.592 parámetros (aproximadamente 2,6 mil millones) desarrollado por Liquid AI. Este repositorio concreto, publicado por LlamaPal, no contiene un modelo nuevo: es un espejo sin modificar del fichero `LFM2.5-2.6B-QAD-Q4_0.gguf` del repositorio oficial `LiquidAI/LFM2.5-2.6B-GGUF`, con el mismo hash SHA-256, empaquetado para su descarga directa desde la aplicación móvil LlamaPal en Android.

El modelo resuelve el problema de ejecutar un LLM conversacional de forma totalmente local y sin conexión en un teléfono. Según la model card, emplea un diseño híbrido que "se mantiene rápido en móviles", razona brevemente antes de cada respuesta y, en palabras del autor, "lidera su clase siguiendo instrucciones". La variante QAD (quantization-aware distillation) fue destilada específicamente por Liquid AI para 4 bits, de modo que la pérdida de calidad respecto al modelo en precisión completa es menor que en una cuantización genérica.

Es relevante ahora porque el fichero ocupa 1,6 GB y se distribuye en formato GGUF estándar, por lo que cabe en el almacenamiento de un móvil de gama media y se carga en llama.cpp y en cualquier aplicación construida sobre él, sin cuenta ni envío de datos a la nube. La licencia es la LFM Open License v1.0, que hay que revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card la describe como "híbrida"; no se detalla la composición) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (variante QAD, quantization-aware distillation); el repo solo distribuye ese fichero |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | GGUF (fichero `LFM2.5-2.6B-QAD-Q4_0.gguf`, 1,6 GB, SHA-256 `a247afd6414918eac8e520a9e6137dc271235461ecbe1180462221d5b8d40b03`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. La model card la califica de "híbrida" y afirma que ese diseño "se mantiene rápido en teléfonos", lo que sugiere una combinación de capas de atención con capas de estado recurrente o lineal, pero no se especifica la proporción ni el tipo exacto. Tampoco se publican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento.

El dato técnico destacable es la cuantización: la variante QAD (quantization-aware distillation) fue destilada por Liquid AI específicamente para 4 bits, lo que implica que el modelo se entrenó o ajustó teniendo en cuenta el ruido de cuantización y, por tanto, el GGUF Q4_0 resultante debería degradarse menos que una conversión post-hoc. Este repositorio no modifica el fichero original: es una copia byte a byte del commit `e7caca5d835a` del repositorio oficial.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a chat.
- Razonamiento breve previo a la respuesta ("reasons briefly before every answer"), es decir, un modo de pensamiento corto antes de contestar.
- Seguimiento de instrucciones, que la model card sitúa como líder de su clase de tamaño.
- Ejecución totalmente offline en el dispositivo, sin conexión ni cuenta.
- Compatibilidad con llama.cpp y cualquier aplicación construida sobre él.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Chat privado en Android: el modelo se descarga una vez (1,6 GB) y funciona sin internet ni cuenta, de modo que ninguna consulta sale del teléfono; adecuado para usuarios que manejan información sensible y no quieren depender de la nube.
- Asistente de redacción offline: borradores de correos, resúmenes y reescritura de textos en el propio dispositivo, aprovechando el seguimiento de instrucciones y el razonamiento breve antes de responder.
- Aplicaciones de campo sin cobertura: técnicos, personal sanitario o de logística que necesitan consultar o generar texto en entornos sin conectividad, cargando el GGUF en llama.cpp o en una app embebida.
- Integración en apps Android de terceros: al ser un GGUF estándar, cualquier aplicación basada en llama.cpp puede empaquetarlo o descargarlo y ofrecer chat local sin infraestructura de servidor.
- Prototipado y evaluación de LLM en móvil: sirve como referencia de lo que rinde un modelo de 2,6B en 4 bits en hardware de teléfono, útil para medir latencia y calidad antes de comprometerse con un modelo mayor.
- Procesamiento de texto por lotes en equipos modestos: al ocupar 1,6 GB, puede ejecutarse en portátiles sin GPU dedicada para tareas de clasificación, extracción o generación de textos cortos en local.
- Base para ajuste fino o experimentación: el modelo base `LiquidAI/LFM2.5-2.6B` está disponible por separado, por lo que este GGUF sirve para comparar el comportamiento cuantizado frente al original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 1,6 GB; en Q4_0 la inferencia completa cabe en unos 2 GB de memoria, aunque el consumo real depende del contexto configurado y de la implementación.
- GPU recomendadas: no se especifican. El destino principal es CPU de móvil (Android) mediante llama.cpp.
- GPU de consumo: no hay datos publicados sobre su comportamiento en RTX 4090, RTX 3090 u otras; por tamaño, cabría en cualquier GPU con 4 GB o más de VRAM, pero no se confirma rendimiento.
- Opciones de despliegue: llama.cpp y cualquier aplicación construida sobre él (la propia app LlamaPal); vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. La model card solo afirma que el diseño híbrido "se mantiene rápido en teléfonos", sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización de este repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5 2.6B (este repo, espejo de LiquidAI) | 2.697.198.592 | no disponible | Q4_0 QAD, GGUF 1,6 GB | LFM Open License v1.0 | Hugging Face (espejo de LlamaPal) |
| LFM2.5 2.6B original (LiquidAI/LFM2.5-2.6B) | 2.697.198.592 | no disponible | safetensors (precisión completa) | LFM Open License v1.0 | Hugging Face |
| LFM2.5 2.6B GGUF oficial (LiquidAI/LFM2.5-2.6B-GGUF) | 2.697.198.592 | no disponible | varias, incluida Q4_0 QAD | LFM Open License v1.0 | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con modelos de otros autores; la comparativa se limita a las tres distribuciones del mismo modelo.

## Limitaciones y advertencias

- Este repositorio es un espejo: no aporta mejoras ni cambios respecto al GGUF oficial de Liquid AI; cualquier corrección o actualización debe buscarse en `LiquidAI/LFM2.5-2.6B-GGUF`.
- La licencia LFM Open License v1.0 no es una licencia de código abierto estándar; hay que leer el texto completo en el fichero `LICENSE` antes de usar el modelo en productos comerciales, ya que puede imponer restricciones de uso, atribución o escala.
- No se declaran idiomas soportados, por lo que el rendimiento en castellano no está garantizado ni documentado.
- No se publica la longitud de contexto, dato crítico para dimensionar memoria y para decidir si sirve en conversaciones largas o con documentos extensos.
- Riesgo de alucinación inherente a un modelo de 2,6B: su capacidad de razonamiento y de conocimiento factual es limitada en comparación con modelos mayores, y el modo de razonamiento breve no sustituye a la verificación.
- Al ser una cuantización Q4_0, existe una pérdida de precisión respecto al modelo original; la destilación QAD la mitiga, pero no la elimina.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso ni de validación por parte de la comunidad.
- No hay información sobre sesgos, seguridad o filtros de contenido aplicados durante el entrenamiento.

## Enlaces

- Repositorio de este espejo: https://huggingface.co/LlamaPal/LFM2.5-2.6B-QAD-Q4_0-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- GGUF oficial: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF
- Fichero original (commit `e7caca5d835a`): https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/tree/e7caca5d835a3901a8e0d63e94009429bafafdfc
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/blob/main/LICENSE
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
