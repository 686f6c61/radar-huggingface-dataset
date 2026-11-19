# ModernoTech/Nova-Prime

## Resumen

Nova Prime es un modelo de lenguaje de gran escala desarrollado por Moderno Tech (Nova AI) dentro de su familia de modelos orientados a inferencia local. Con aproximadamente 34.660 millones de parámetros totales (dato verificado en los safetensors del repositorio) y una arquitectura híbrida que combina capas de atención completa con capas de modelo de espacio de estados (SSM) y Mixture of Experts, se posiciona como el modelo de mayor tamaño de la línea Nova, por encima de Nano, Mini y Spark.

El modelo sigue una filosofía de ejecución local: el objetivo declarado del autor es que el usuario pueda instalar y ejecutar la inferencia en su propio hardware sin depender de servidores centralizados. Con aproximadamente 3.000 millones de parámetros activos por token gracias al enrutamiento MoE, el coste computacional por token es sustancialmente menor que el de un modelo denso del mismo tamaño total, lo que lo hace viable en estaciones de trabajo y portátiles de altas prestaciones.

La relevancia actual del modelo radica en su combinación de tres elementos poco frecuentes en modelos de su categoría: arquitectura híbrida atención-SSM con intervalo de atención completa cada 4 capas, soporte multimodal declarado (texto, imagen y video según implementación) y distribución en formato GGUF cuantizado con imatrix, orientada a motores de inferencia locales. La licencia Apache 2.0 facilita su adopción comercial, aunque la información pública disponible sobre entrenamiento, benchmarks y detalles de arquitectura es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención completa + SSM (modelo de espacio de estados) + Mixture of Experts, con atención completa cada 4 capas |
| Parametros totales | 34.660.610.688 (~34,7 mil millones) |
| Parametros activos | ~3.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (con imatrix); niveles concretos no disponibles |
| Idiomas soportados | inglés, español |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 247,4 GB); safetensors referenciados en metadatos |
| Bloques (capas) | 40 |
| Dimensión de embeddings | 2048 |
| Cabezas de atención | no disponible (truncado en la model card) |
| Modelo base | no disponible (declarado "Unknown") |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

Nova Prime emplea una arquitectura híbrida que intercala capas de atención completa con capas de modelo de espacio de estados (SSM), combinadas con Mixture of Experts. La atención completa se inserta cada 4 capas, patrón que reduce el coste cuadrático de la atención en la mayoría de las capas mientras preserva capacidad de modelado global a intervalos regulares. El modelo consta de 40 bloques con dimensión de embeddings de 2048, y activa aproximadamente 3.000 millones de parámetros por token mediante enrutamiento selectivo de expertos sobre un total de ~34,7 mil millones.

No se dispone de información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. La model card no documenta innovaciones adicionales como decodificación especulativa o variantes de atención lineal más allá de la propia hibridación SSM-atención. El soporte multimodal (texto, imagen y video) se declara "según implementación", sin especificar el codificador visual ni los detalles de fusión multimodal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y español.
- Razonamiento general y comprensión de instrucciones complejas.
- Redacción, análisis de contenido, resúmenes y síntesis.
- Capacidad multimodal declarada: procesamiento de texto, imagen y video (sujeto a la implementación del motor de inferencia).
- Activación selectiva de expertos (MoE) para eficiencia computacional por token.
- Ejecución local mediante motores de inferencia compatibles con GGUF.
- Consultas de conocimiento general y asistencia en tareas de productividad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistencia general avanzada en local: el modelo puede gestionar conversaciones multi-turno de propósito general ejecutándose íntegramente en el dispositivo del usuario, sin enviar cada consulta a un servidor central, lo que encaja con la filosofía de despliegue de Moderno Tech.
- Redacción y análisis de contenido profesional: con ~34,7 mil millones de parámetros totales y ~3 mil millones activos, ofrece capacidad de generación de textos largos y análisis documental en español e inglés para equipos que trabajan con material sensible que prefieren no enviar a la nube.
- Resúmenes y síntesis de documentos: adecuado para estaciones de trabajo que procesan informes, actas o documentación técnica, aprovechando la ventana de contexto (no documentada) y el enrutamiento MoE para mantener latencia contenida.
- Procesamiento multimodal de imágenes y video: según la implementación del motor, puede emplearse para descripción de imágenes, extracción de información visual o análisis de contenido audiovisual en flujos locales.
- Asistencia a desarrolladores en tareas de documentación y análisis de código: útil para explicar fragmentos, generar documentación técnica o revisar propuestas, siempre verificando la salida por el riesgo de alucinación inherente a los modelos de lenguaje.
- Despliegue en entornos con requisitos de soberanía de datos: organizaciones que necesitan que el modelo resida en su propia infraestructura (estaciones de trabajo o servidores locales) pueden beneficiarse de la licencia Apache 2.0 y del formato GGUF para integrarlo en sus flujos internos.
- Prototipado de asistentes verticales: la combinación de licencia permisiva, cuantización GGUF e imatrix y soporte bilingüe permite construir asistentes especializados (legal, sanitario, educativo) sobre hardware propio antes de escalar a infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (34,7 mil millones de parámetros), una cuantización de 4 bits requeriría del orden de 18-22 GB de VRAM, una de 8 bits en torno a 35-40 GB, y precisión completa (FP16) aproximadamente 70 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo, resultan adecuadas GPU de centro de datos como A100 (40/80 GB), H100 (80 GB) o L40S (48 GB); en consumer, una RTX 4090 (24 GB) podría alojar cuantizaciones de 4 bits ajustadas.
- ¿Cabe en GPU consumer? Posiblemente en RTX 4090 (24 GB) con cuantización agresiva de 4 bits; en GPUs de 16 GB o menos, probablemente no sin offloading a RAM del sistema.
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp, Ollama y otros motores GGUF; para vLLM o TGI se requeriría disponibilidad de pesos en safetensors y soporte de la arquitectura híbrida SSM-MoE en dichos motores, lo cual no está confirmado.
- Latencia y throughput estimados: no disponibles. El enrutamiento MoE con ~3 mil millones de parámetros activos por token debería reducir el coste por token frente a un modelo denso equivalente, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Nova Prime (Moderno Tech) | ~34,7 B | ~3 B | no disponible | Apache 2.0 | GGUF | Híbrido atención + SSM + MoE; multimodal declarado; bilingüe es/en |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificable sobre modelos comparables de la familia Nova ni de terceros en la documentación proporcionada |

No se dispone de datos suficientes para establecer una comparativa rigurosa con modelos de la misma categoría (híbridos SSM-MoE de ~35 B con ~3 B activos). La ausencia de benchmarks publicados impide comparar rendimiento.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que no es posible verificar el rendimiento real del modelo frente a alternativas de tamaño similar.
- La model card no documenta el dataset de entrenamiento, el volumen de tokens ni las fases de alineación (RLHF/DPO), lo que dificulta evaluar sesgos y calidad de alineación.
- Riesgo de alucinación inherente a los modelos de lenguaje; en ausencia de benchmarks de fidelidad, debe validarse la salida en aplicaciones críticas.
- La longitud de contexto no está documentada, lo que impide planificar despliegues que dependan de ventanas largas.
- Soporte idiomático declarado limitado a inglés y español; el rendimiento en otros idiomas no está verificado.
- La capacidad multimodal (imagen y video) se declara "según implementación", sin detalles sobre el codificador visual ni garantías de funcionamiento en todos los motores.
- El modelo base figura como "Unknown" y el pipeline como "no disponible", lo que limita la trazabilidad del linaje del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre calidad, seguridad ni idoneidad para producción.
- El tamaño del repositorio (247,4 GB) implica requisitos significativos de almacenamiento y ancho de banda para la descarga inicial.
- No se dispone de información sobre tool calling ni soporte de agentes, capacidades relevantes para pipelines automatizados.
- La ejecución local depende de la compatibilidad del motor de inferencia con la arquitectura híbrida SSM-MoE; no está confirmado el soporte en vLLM o TGI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ModernoTech/Nova-Prime
- Sitio oficial de Moderno Tech: https://moderno.com.ar
- Paper, blog técnico, repositorio de código y demos: no disponibles en la información proporcionada.
