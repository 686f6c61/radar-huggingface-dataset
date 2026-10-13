# florianvoss/Qwen3.5-9B-DFlash-N16-LLiMa-3.0.0

## Resumen

Qwen3.5-9B-DFlash-N16-LLiMa-3.0.0 es un paquete de ejecución compilado para el acelerador SiMa Modalix, publicado por el usuario florianvoss. No se trata de un checkpoint entrenable al uso, sino de un artefacto de despliegue que empaqueta dos componentes: el modelo objetivo Qwen3.5-9B (prequantizado en INT4 simétrico G256) y un borrador DFlash (INT8 RTN simétrico por canal) que habilita decodificación especulativa. Todo ello se ejecuta sobre el runtime LLiMa 3.0.0.

El modelo subyacente, Qwen3.5-9B, es el mayor de los cuatro modelos densos pequeños de la familia Qwen3.5 de Alibaba. Se trata de un modelo visión-lenguaje nativamente multimodal de 9.000 millones de parámetros, con modo de razonamiento activado por defecto, ventana de contexto de 262.144 tokens extensible a 1 millón mediante YaRN y cobertura de 201 idiomas. La licencia del modelo base es Apache 2.0.

La relevancia de este artefacto es concreta y de nicho: permite desplegar un VLM de 9B con decodificación especulativa (ancho de bloque DFlash de 16, con un ancla y 15 posiciones de propuesta) sobre hardware de borde Modalix, reduciendo el coste por token generado. Conviene subir la advertencia de que el propio autor indica que el rendimiento, la tasa de aceptación del borrador y el throughput no han sido probados para estos artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (Qwen3.5) con decodificacion especulativa DFlash en el runtime compilado |
| Parametros totales | 9.000 millones (modelo objetivo Qwen3.5-9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens en el runtime compilado; 262.144 tokens en el modelo base, extensible a 1.000.000 con YaRN |
| Tipos de cuantizacion | INT4 simetrico G256 (pesos del objetivo), INT8 RTN simetrico por canal de salida (lineales del borrador), INT8 (embeddings y KV cache del objetivo), BF16 (activaciones) |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen3.5 declara 201 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquete de runtime Modalix desempaquetado (187 ejecutables ELF en total); no cargable con Transformers |

## Arquitectura y entrenamiento

El artefacto sigue una arquitectura de decodificación especulativa con dos redes: un objetivo (target) y un borrador (draft). El objetivo son los pesos de Qwen3.5-9B prequantizados por el proveedor en INT4 simétrico con granularidad de grupo G256; el borrador usa pesos lineales en INT8 RTN simétrico por canal de salida y reutiliza la cabeza de salida del objetivo (pesos INT4 empaquetados y sus escalas). La anchura de bloque DFlash es de 16, compuesta por una posición ancla y 15 posiciones de propuesta. Las activaciones se mantienen en BF16, mientras que los embeddings del objetivo y la caché KV se almacenan en INT8. El artefacto habilita compartición de filtros donde el hardware lo permite.

Este repositorio no documenta ningún proceso de entrenamiento: es el resultado de compilar los dos checkpoints de origen (simaai/Qwen3.5-9B-Autoround-Safetensors y simaai/Qwen3.5-9B-DFlash-RTN-INT8-Safetensors) para el SDK Modalix 3.0.0. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La resolución de imagen configurada es 448 × 448 y el tamaño de grupo de prefill es 128.

## Capacidades

- Generación de texto y razonamiento en modo thinking activado por defecto (característica del modelo base Qwen3.5-9B).
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), con entrada visual a 448 × 448 píxeles.
- Comprensión y generación multilingüe: el modelo base declara cobertura de 201 idiomas; la model card de este artefacto no detalla la lista.
- Decodificación especulativa con borrador DFlash, orientada a reducir la latencia de generación en hardware Modalix.
- Ejecución en el borde sobre acelerador SiMa Modalix, sin necesidad de GPU dedicada.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades de audio: no documentadas.

## Casos de uso

- Inspección visual automatizada en planta industrial: el modelo puede clasificar y describir imágenes de producto a 448 × 448 directamente en el borde, sin enviar datos a la nube, lo que encaja con líneas de producción con requisitos de baja latencia y soberanía de datos.
- Asistente documental en entornos aislados (air-gapped): con 4.096 tokens de contexto en el runtime compilado, permite responder preguntas sobre documentos escaneados y texto asociado en instalaciones sin conectividad externa.
- Robótica móvil y AGV: la combinación de visión y lenguaje sobre hardware Modalix permite interpretar escenas y generar instrucciones en lenguaje natural para planificación de trayectorias a bordo.
- Triaje de imágenes médicas en el punto de atención: despliegue en equipos de diagnóstico con acelerador Modalix para generar descripciones preliminares de estudios, manteniendo los datos del paciente en local.
- Analítica de lineal en comercio minorista: descripción automática del estado de estanterías y detección de incidencias a partir de imágenes capturadas por cámaras del propio establecimiento.
- Asistente de cabina en automoción: generación de respuestas multimodales en lenguaje natural dentro del vehículo, apoyándose en la ejecución local para evitar dependencia de red.
- Traducción y resumen multilingüe en dispositivo: aprovechando la cobertura de 201 idiomas del modelo base, útil en dispositivos de atención al cliente o señalética dinámica desplegados en varios países.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del autor indica explícitamente que la generación en Modalix, la tasa de aceptación del borrador y el throughput no han sido probados para estos artefactos. La validación realizada se limita a confirmar que la compilación de objetivo y borrador finalizó correctamente y que el despliegue verificó los 187 archivos ELF y los recursos de runtime.

## Requisitos de hardware

- Acelerador SiMa Modalix como plataforma de destino; este artefacto no está pensado para GPU convencionales.
- Runtime LLiMa 3.0.0 con soporte de DFlash, requisito imprescindible para la ejecución.
- SDK Modalix 3.0.0 como versión de compilación del paquete.
- Tamaño del repositorio: 14,0 GB, que incluye los recursos de runtime y los 187 ejecutables (143 del objetivo, 44 del borrador).
- VRAM estimada para el modelo base sin compilar, solo como referencia aritmética a partir de los 9.000 millones de parámetros: en torno a 18 GB en BF16, unos 9 GB en INT8 y unos 4,5 GB en INT4. Son estimaciones de orden de magnitud, no mediciones del artefacto.
- Encaje en GPU de consumo: no aplica directamente a este paquete; el modelo base Qwen3.5-9B, cuantizado a 4 bits, cabría en GPU de consumo con 8 GB o más de memoria, pero requeriría un runtime distinto.
- Opciones de despliegue: descarga con `hf download florianvoss/Qwen3.5-9B-DFlash-N16-LLiMa-3.0.0 --local-dir Qwen3.5-9B-DFlash` y ejecución con `llima run ./Qwen3.5-9B-DFlash`. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual, ya que no es un checkpoint cargable por Transformers.
- Latencia y throughput estimados: no disponibles; el autor no ha publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| florianvoss/Qwen3.5-9B-DFlash-N16-LLiMa-3.0.0 | 9B | 4.096 tokens (runtime) | Paquete compilado Modalix con decodificacion especulativa | Apache 2.0 | HuggingFace, 0 descargas |
| simaai/Qwen3.5-9B-Autoround-Safetensors | 9B | 262.144 tokens (modelo base) | Checkpoint de pesos (objetivo) | no disponible en la informacion | HuggingFace |
| simaai/Qwen3.5-9B-DFlash-RTN-INT8-Safetensors | no disponible | no disponible | Checkpoint de borrador INT8 | no disponible en la informacion | HuggingFace |
| z-lab/Qwen3.5-9B-DFlash | no disponible | no disponible | Borrador DFlash | no disponible en la informacion | HuggingFace |
| florianvoss/Qwen3.5-4B-DFlash-N16-LLiMa | 4B | no disponible | Paquete compilado Modalix, variante menor | no disponible en la informacion | HuggingFace |
| qwen3.5:9b (Ollama) | 9B | 262.144 tokens (modelo base) | Distribucion para inferencia en GPU/CPU | Apache 2.0 | Ollama Library |

## Limitaciones y advertencias

- El propio autor advierte de que el rendimiento en generación, la tasa de aceptación del borrador y el throughput no han sido probados para estos artefactos; la validación se limita a la compilación y al despliegue.
- El contexto efectivo del runtime es de 4.096 tokens, muy inferior a los 262.144 tokens del modelo base, lo que limita tareas que requieran contexto largo.
- La resolución de imagen está fijada en 448 × 448, por debajo de lo que pueden manejar otras configuraciones del modelo base.
- No es un checkpoint cargable con Transformers, vLLM, llama.cpp, Ollama ni TGI; requiere el runtime LLiMa 3.0.0 y hardware SiMa Modalix.
- Riesgo de alucinación: inherente a los modelos generativos de esta familia; no se han publicado evaluaciones específicas de fidelidad para este artefacto.
- Sesgos conocidos: la información disponible no documenta una evaluación de sesgos; se heredan los del modelo base Qwen3.5-9B.
- Restricciones de licencia: el artefacto declara Apache 2.0, lo que permite uso comercial. La model card remite a los repositorios de origen para los términos de licencia, por lo que conviene verificar las condiciones de los checkpoints base antes de un despliegue en producción.
- Cero descargas y cero valoraciones en el momento de redactar esta ficha: no hay evidencia de uso en producción por terceros.
- Los idiomas soportados no están declarados en la model card de este artefacto; solo se conoce la cifra de 201 idiomas del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/florianvoss/Qwen3.5-9B-DFlash-N16-LLiMa-3.0.0
- Checkpoint objetivo: https://huggingface.co/simaai/Qwen3.5-9B-Autoround-Safetensors
- Checkpoint borrador: https://huggingface.co/simaai/Qwen3.5-9B-DFlash-RTN-INT8-Safetensors
- Borrador DFlash de referencia: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash
- Variante de 4B del mismo autor: https://huggingface.co/florianvoss/Qwen3.5-4B-DFlash-N16-LLiMa
- Ficha del modelo base en Modal: https://modal.com/library/qwen/qwen3-5-9b
- Especificaciones y requisitos de VRAM de Qwen3.5-9B: https://apxml.com/models/qwen35-9b
- Distribución en Ollama: https://ollama.com/library/qwen3.5:9b
