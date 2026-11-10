# HanzoHuang/YOLOv6-RKNN2

## Resumen

YOLOv6-RKNN2 es un conjunto de artefactos de despliegue del detector de objetos YOLOv6, compilado específicamente para las NPU de los SoC Rockchip RK3576 y RK3588 mediante RKNN Toolkit2. Lo publica el usuario HanzoHuang en Hugging Face y no incluye pesos en formato estándar (safetensors, ONNX o GGUF), sino binarios `.rknn` listos para ejecutarse sobre el runtime de Rockchip. El repositorio ocupa 0,4 GB y se organiza en un árbol `models/v<toolkit-version>/<task>/<variant>/<chip>/<precision>/`, con la versión 2.5.0 del toolkit como referencia.

El modelo resuelve un problema muy concreto de ingeniería: llevar un detector YOLOv6 a placas embebidas con NPU Rockchip sin tener que repetir la cadena de conversión ONNX → RKNN. Es relevante para quienes despliegan visión artificial en dispositivos de borde (SBC, cámaras inteligentes, equipos industriales) donde no hay GPU y el consumo energético es crítico.

La información publicada es mínima: no se detallan variantes concretas (n, s, m, l), resoluciones de entrada, precisión de los binarios ni resultados de precisión. La model card se limita a describir la estructura del zoo y a remitir a los avisos de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv6 (detector de objetos, familia YOLO de una etapa); variante concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (la ruta incluye un nivel `<precision>` por chip, pero no se especifican los valores) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | other — `upstream-terms-by-artifact` (ver LICENSES.md) |
| Formato de pesos | RKNN (binarios `.rknn` para NPU Rockchip); no se distribuyen safetensors, ONNX ni GGUF |
| Hardware objetivo | Rockchip RK3576 y RK3588 |
| Toolkit de conversión | RKNN Toolkit2 2.5.0 |
| Tarea | object-detection |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv6, un detector de objetos de una sola etapa orientado a despliegue industrial, pero la ficha no aporta detalles sobre la variante concreta (n, s, m o l), el número de parámetros, la resolución de entrada ni la composición del dataset de entrenamiento. Tampoco se indica si los binarios incluidos derivan de pesos oficiales de Meituan o de un reentrenamiento propio.

Lo que sí documenta el autor es el proceso de compilación: los artefactos se generan con RKNN Toolkit2 2.5.0 a partir de un ONNX original, y las "conversion receipts" del repositorio identifican tanto el ONNX de origen como el conversor empleado. La organización por chip y precisión sugiere que existen variantes cuantizadas distintas para RK3576 y RK3588, pero no se detalla el esquema de cuantización (probablemente int8, aunque no está confirmado en la información disponible).

## Capacidades

- Detección de objetos en imágenes: salida de cajas delimitadoras y clases sobre la NPU de los SoC RK3576 y RK3588.
- Ejecución sobre NPU integrada: los binarios `.rknn` están pensados para el runtime RKNN de Rockchip, no para GPU ni CPU genérica.
- Variantes por chip y precisión: el árbol de directorios permite seleccionar el artefacto adecuado según el SoC y el compromiso precisión/rendimiento.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: es exclusivamente un modelo de visión.
- No se documentan capacidades adicionales (segmentación, pose, tracking) ni tareas distintas de la detección.

## Casos de uso

- Vigilancia perimetral en dispositivos de borde: desplegar el binario `.rknn` en una placa RK3588 con cámara IP para detectar personas o vehículos en tiempo real, sin depender de la nube y con bajo consumo.
- Inspección industrial en línea de producción: integrar el detector en un equipo basado en RK3576 para identificar defectos o piezas fuera de posición en la banda, aprovechando la NPU para mantener latencias bajas.
- Analítica de aforo y tráfico: contar personas u objetos en grabaciones o streams de vídeo dentro de un SBC, usando el artefacto correspondiente a la precisión elegida para equilibrar exactitud y velocidad.
- Robótica y vehículos autónomos ligeros: alimentar el bucle de percepción de un robot móvil con detecciones en tiempo real sobre RK3588, evitando el coste y el consumo de una GPU dedicada.
- Retrofit de cámaras inteligentes: sustituir el pipeline de inferencia de una cámara existente por el binario RKNN precompilado, reduciendo el trabajo de integración al no tener que reconvertir el modelo.
- Prototipado rápido en laboratorio: comparar el rendimiento de YOLOv6 en RK3576 frente a RK3588 usando los artefactos del zoo como referencia antes de decidir la plataforma hardware de un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU de Rockchip RK3576 y RK3588. Los binarios no están pensados para GPU NVIDIA, CPU x86 ni otros aceleradores.
- VRAM: no aplica; el modelo consume memoria del sistema compartida con la NPU del SoC, y no se especifica el consumo concreto.
- GPU recomendadas: no aplica. El despliegue requiere el runtime RKNN de Rockchip sobre el SoC correspondiente.
- Cabe en hardware de consumo: sí, en el sentido de que RK3588 y RK3576 se usan en SBC y mini-PC de consumo, pero no en GPU de escritorio.
- Opciones de despliegue: runtime RKNN de Rockchip (librería `librknnrt`), integrable en aplicaciones C/C++ o Python mediante la API RKNN. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son frameworks de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv6-RKNN2 (este) | RKNN | NPU RK3576 / RK3588 | Detección de objetos | other (upstream-terms-by-artifact) | Hugging Face, 0 descargas |
| YOLOv6 original (Meituan) | PyTorch / ONNX | GPU / CPU | Detección de objetos | no disponible en esta ficha | Repositorio oficial de Meituan |
| YOLOv8 (Ultralytics) | PyTorch / ONNX / exportables | GPU / CPU / edge | Detección de objetos | AGPL-3.0 (habitual) | Hugging Face y GitHub |
| YOLOv5 (Ultralytics) | PyTorch / ONNX | GPU / CPU / edge | Detección de objetos | GPL-3.0 (habitual) | Hugging Face y GitHub |

La comparación directa con los modelos originales no es posible en términos de precisión o latencia porque esta ficha no incluye métricas. La diferencia principal es el formato: este repositorio ofrece artefactos ya compilados para NPU Rockchip, mientras que los originales requieren conversión manual.

## Limitaciones y advertencias

- Información muy escasa: no se especifican variantes, resolución de entrada, número de parámetros ni métricas de precisión (mAP), lo que dificulta evaluar su idoneidad frente a otras alternativas.
- Licencia restrictiva y poco clara: la licencia es `other` con nombre `upstream-terms-by-artifact` y remite a un archivo LICENSES.md; es imprescindible revisarlo antes de cualquier uso comercial, ya que los términos pueden depender del artefacto concreto.
- Dependencia de hardware: solo funciona en NPU Rockchip RK3576 y RK3588; no es portable a otras plataformas sin reconversión.
- Riesgo de obsolescencia del toolkit: los binarios están atados a RKNN Toolkit2 2.5.0 y a la versión del runtime RKNN correspondiente; actualizaciones del firmware o del runtime pueden romper la compatibilidad.
- Sin garantías de mantenimiento: el repositorio tiene 0 descargas y 0 likes, y no se documenta soporte ni actualizaciones más allá de la fecha de creación.
- Sesgos y alucinaciones: no aplica el concepto de alucinación, pero sí los sesgos propios del dataset de entrenamiento de YOLOv6, que no se detalla; la precisión en clases poco representadas puede degradarse.
- Sin información sobre cuantización: si los binarios son int8, puede haber una pérdida de precisión respecto al modelo en punto flotante que no se cuantifica en la documentación.

## Enlaces

- Hugging Face: https://huggingface.co/HanzoHuang/YOLOv6-RKNN2
- Avisos de licencia: https://huggingface.co/HanzoHuang/YOLOv6-RKNN2/blob/main/LICENSES.md
- Repositorio oficial de YOLOv6 (Meituan): no disponible en la información proporcionada
- Documentación de RKNN Toolkit2: no disponible en la información proporcionada
