# scitomo/topaz-v0.2.4-20a

## Resumen

Topaz v0.2.4 20A FORMAT-2 checkpoint es una conversión a formato FORMAT-2 del modelo de denoising 3D Topaz v0.2.4, originalmente desarrollado por el proyecto tbepler/topaz para criotomografía electrónica (cryo-ET). La conversión ha sido realizada y publicada por el usuario scitomo en HuggingFace, con el identificador `scitomo/topaz-v0.2.4-20a`. Este modelo está diseñado para reducir el ruido en tomogramas electrónicos tridimensionales, una tarea crítica en biología estructural, donde la dosis de electrones empleada en la adquisición de imágenes suele ser muy baja para preservar las muestras biológicas, lo que da lugar a relaciones señal-ruido muy pobres.

El checkpoint contiene 2.916.337 parámetros organizados en 34 tensores canónicos. Según la información facilitada, la conversión es funcionalmente idéntica al checkpoint original, con paridad densa bitwise exacta tras la carga en el entorno de conversión congelado. No se ha realizado ningún reentrenamiento ni se reivindica ninguna mejora científica sobre el modelo original. La licencia es GPL-3.0, heredada del paquete Topaz upstream. No se trata de un modelo de lenguaje, sino de una red neuronal de procesamiento de imagen 3D.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal 3D para denoising (arquitectura exacta no especificada en la información disponible) |
| Parametros totales | 2.916.337 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de procesamiento de imagen 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | GPL-3.0 |
| Formato de pesos | FORMAT-2 (conversion de Scitomo; no se especifica si safetensors, GGUF u otro) |

## Arquitectura y entrenamiento

El modelo es un checkpoint preentrenado del denoiser 3D Topaz v0.2.4, elaborado para trabajar con tomogramas de criomicroscopía electrónica. La arquitectura interna no se describe en la documentación disponible en HuggingFace, más allá de que se trata de una red neuronal densa que opera sobre volúmenes 3D. La resolución asociada al identificador "20a" sugiere que el modelo está calibrado para datos con una resolución aproximada de 20 Ångstroms.

La conversión a FORMAT-2 es una transformación de empaquetado y persistencia de pesos, no un reentrenamiento. El autor indica que la paridad densa es bitwise exacta antes de exportar y después de recargar el modelo en el entorno de inferencia congelado. El paquete contiene 34 tensores canónicos. La semántica de inferencia incluye la restauración de la media y la desviación típica de salida a nivel de volumen, así como cálculos de z-score poblacional. No se documentan datos de entrenamiento, composición del dataset ni procesos de optimización como RLHF o DPO, al no tratarse de un modelo de lenguaje.

## Capacidades

- Reducción de ruido en tomogramas electrónicos 3D de criomicroscopía, con soporte para inferencia sobre volúmenes completos.
- Restauración de la media y desviación típica global de la salida, coherente con el perfil de inferencia de Topaz.
- Soporte de núcleo local válido de 160 muestras por lado, con requisitos de divisibilidad por 32 para la evaluación en modo núcleo (core/origin).
- La red densa subyacente puede ejecutarse con ejes espaciales de tamaño mínimo 32, sin necesidad de divisibilidad por 32.
- No soporta generación de texto, razonamiento, código, matemáticas, visión en 2D, tool calling ni capacidades de agentes.
- No dispone de capacidad multilingüe ni de modo "thinking".

## Casos de uso

- Mejora de la relación señal-ruido en tomogramas de células completas adquiridos por criotomografía electrónica, facilitando la identificación de orgánulos y estructuras macromoleculares.
- Preprocesado de volúmenes para subtomogram averaging, donde un denoising previo puede mejorar la alineación y la resolución de las estructuras promedio.
- Limpieza de tomogramas en pipelines de segmentación automática, permitiendo una separación más clara de membranas, vesículas y complejos proteicos.
- Análisis de muestras criopreservadas en investigación virológica, para localizar partículas virales en contextos celulares mediante la reducción de ruido de fondo.
- Estudio de grandes complejos enzimáticos o maquinarias de transcripción dentro de secciones celulares, donde el denoising mejora la visualización de interacciones.
- Integración en flujos de trabajo basados en Topaz, utilizando el checkpoint convertido como reemplazo directo del modelo original en entornos compatibles con FORMAT-2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible
- GPU recomendadas: no disponible
- Compatibilidad con GPU de consumo: no disponible
- Opciones de despliegue: no disponible (no se mencionan integraciones con vLLM, llama.cpp, Ollama, TGI, etc.)
- Latencia y throughput: no disponible

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro de la categoría de denoising 3D para criotomografía. La única referencia identificable es el checkpoint upstream original de Topaz v0.2.4, del cual esta conversión es una transformación funcionalmente idéntica, sin cambios en los pesos aprendidos ni en el perfil de inferencia.

## Limitaciones y advertencias

- El modelo es una conversión de formato sin reentrenamiento; no incorpora mejoras científicas nuevas respecto al Topaz v0.2.4 original.
- La licencia GPL-3.0 impone obligaciones de copyleft en caso de redistribución o distribución de versiones modificadas, lo que puede afectar a integraciones comerciales.
- El modo de evaluación con núcleo local exige que el origen y la evaluación cumplan requisitos de divisibilidad por 32; no respetarlos puede producir resultados no válidos.
- Sin información sobre posibles sesgos o limitaciones del modelo original, más allá de que su aplicación está restringida a datos de criotomografía electrónica.
- Al ser un modelo de procesamiento de imagen, no genera contenido textual; el riesgo de alucinación no aplica directamente, aunque los resultados pueden verse afectados por artefactos si se aplica a datos fuera de su dominio.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/scitomo/topaz-v0.2.4-20a
- Repositorio upstream de Topaz (mencionado como "tbepler/topaz" en el README): https://github.com/tbepler/topaz
- Texto de licencia GPL upstream incluido en el paquete: `resources/TOPAZ_LICENSE.txt` (dentro del repositorio de HuggingFace)
