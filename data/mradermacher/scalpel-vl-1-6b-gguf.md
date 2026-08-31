# mradermacher/Scalpel-VL-1.6B-GGUF

## Resumen

Scalpel-VL-1.6B-GGUF es una cuantización en formato GGUF del modelo multimodal Scalpel-VL-1.6B-Animal, desarrollado originalmente por freeai-org. La cuantización ha sido realizada por mradermacher, un ingeniero que publica versiones optimizadas de modelos open source para su ejecución eficiente en hardware modesto. El modelo combina capacidades de visión y lenguaje, con soporte para inglés y chino, y se distribuye bajo licencia MIT.

Esta versión GGUF resulta especialmente relevante para desarrolladores que necesitan desplegar un modelo de visión-lenguaje en entornos con recursos limitados, como dispositivos edge, GPUs de consumo o incluso CPU. Al tratarse de un modelo de aproximadamente 1.27 mil millones de parámetros (etiquetado como 1.6B), las cuantizaciones ofrecen tamaños de archivo que van desde 0.7 GB hasta 2.6 GB, lo que permite su ejecución en una amplia gama de hardware. El repositorio incluye tanto el modelo principal como los proyectores multimodales (mmproj) necesarios para procesar imágenes.

La ficha se basa exclusivamente en la información proporcionada por el repositorio de HuggingFace y la model card del autor de la cuantización. No se dispone de documentación técnica detallada del modelo original, por lo que algunas especificaciones no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión-lenguaje) |
| Parametros totales | 1.267.550.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles, chino |
| Licencia | MIT |
| Formato de pesos | GGUF (con proyectores multimodales mmproj en Q8_0 y f16) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original Scalpel-VL-1.6B-Animal. Por el nombre y el dominio de aplicación, se trata de un modelo multimodal que combina un codificador de visión con un modelo de lenguaje, pero no se especifican detalles como el tipo de transformer, la configuración de capas o el mecanismo de fusión de modalidades. Tampoco se han publicado datos sobre el proceso de entrenamiento, el número de tokens utilizados o las técnicas de alineación (RLHF, DPO, etc.).

La cuantización realizada por mradermacher es de tipo estático, es decir, los pesos del modelo original se convirtieron a formatos de menor precisión sin un proceso de calibración con datos específicos (imatrix). El autor indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicación, pero podrían añadirse si se solicita.

## Capacidades

- Modelo multimodal que procesa imágenes y texto, orientado a tareas de visión-lenguaje.
- Soporte conversacional, según las etiquetas del repositorio.
- Idiomas: ingles y chino.
- Formato GGUF compatible con herramientas de inferencia local como llama.cpp, Ollama y otras que soporten este estándar.
- Incluye proyectores multimodales (mmproj) en dos precisiones (Q8_0 y f16) para el procesamiento de imágenes.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Descripción y captioning de imágenes en aplicaciones móviles: el modelo puede generar texto descriptivo a partir de fotografías, por ejemplo en apps de accesibilidad para personas con discapacidad visual. Su tamaño reducido permite ejecutarlo en un smartphone con aceleración GPU.
- Asistentes conversacionales bilingües (inglés-chino): gracias a su naturaleza conversacional y su soporte para ambos idiomas, puede integrarse en chatbots o asistentes virtuales que necesiten entender tanto texto como imágenes, por ejemplo en atención al cliente con capturas de pantalla.
- Extracción de información de documentos escaneados: combinando visión y lenguaje, el modelo puede leer facturas, formularios o tarjetas de visita y extraer campos relevantes, útil para automatización de tareas administrativas en entornos con pocos recursos computacionales.
- Análisis de imágenes en dispositivos edge: para aplicaciones de monitorización (por ejemplo, detección de objetos en cámaras de seguridad) donde se requiere un modelo ligero que funcione en una Raspberry Pi o un mini-PC con GPU integrada.
- Prototipado rápido de aplicaciones multimodales: los desarrolladores pueden usar las cuantizaciones GGUF para probar ideas de producto sin necesidad de infraestructura en la nube, gracias a la facilidad de despliegue con llama.cpp u Ollama.
- Educación y demostraciones: el modelo puede utilizarse en entornos académicos para enseñar conceptos de visión por computador y procesamiento de lenguaje natural, al ser ligero y de código abierto con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: según el archivo GGUF elegido, se necesita aproximadamente la misma cantidad de memoria que el tamaño del archivo. Por ejemplo, Q4_K_M (0.9 GB) cabe en GPUs con 2 GB de VRAM; Q8_0 (1.5 GB) requiere al menos 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones más pequeñas. Para las versiones Q6_K y Q8_0 se recomienda una GPU con 4 GB o más (por ejemplo, GTX 1650, RTX 3050, RTX 4060). También puede ejecutarse en CPU con suficiente RAM (2-4 GB).
- Compatibilidad con hardware de consumo: sí, es un modelo diseñado para ejecutarse en GPUs de gama baja y media, así como en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. También se puede usar con el formato original safetensors mediante transformers si se desea.
- Latencia y throughput: no se dispone de mediciones oficiales, pero por el tamaño del modelo se espera una generación de varias decenas de tokens por segundo en GPU moderna y unos pocos tokens por segundo en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de visión-lenguaje de tamaño similar. El repositorio no ofrece datos sobre alternativas comparables ni resultados de evaluación relativos.

## Limitaciones y advertencias

- Al ser una cuantización estática, puede haber una pérdida de calidad respecto al modelo original en precisión y fluidez, especialmente en las cuantizaciones más agresivas (Q2_K, Q3_K_S).
- El modelo es pequeño (1.27B parámetros), por lo que su rendimiento en tareas complejas de razonamiento o generación de código será limitado en comparación con modelos más grandes.
- No se ha documentado el comportamiento del modelo en cuanto a sesgos, alucinaciones o seguridad. Es necesario evaluar estos aspectos antes de usarlo en producción.
- La información sobre el modelo original (freeai-org/Scalpel-VL-1.6B-Animal) es escasa; no se dispone de detalles sobre su arquitectura, datos de entrenamiento o limitaciones específicas.
- Aunque la licencia es MIT, es recomendable verificar la licencia del modelo base original para asegurar el cumplimiento de todos los términos.
- El repositorio solo incluye cuantizaciones estáticas; no hay versiones con imatrix o calibración ponderada, lo que puede afectar a la precisión en algunas tareas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Scalpel-VL-1.6B-GGUF
- Modelo base original: https://huggingface.co/freeai-org/Scalpel-VL-1.6B-Animal
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
