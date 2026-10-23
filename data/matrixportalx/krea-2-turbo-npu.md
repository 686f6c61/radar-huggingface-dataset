# matrixportalx/Krea-2-Turbo-npu

## Resumen

Krea 2 Turbo es un modelo de generación de imágenes texto-a-imagen de pesos abiertos desarrollado por Krea AI. Se trata de un transformer de difusión (DiT) de aproximadamente 12 B de parámetros, entrenado desde cero y destilado para inferencia en muy pocos pasos: 8 pasos de muestreo con CFG 0 según la model card del repositorio, y 8-12 pasos con CFG 1 según documentación de terceros. El pipeline se completa con un codificador de texto Qwen3-VL-4B-Instruct (Alibaba, Apache 2.0) y el VAE de Wan 2.1 (Apache 2.0).

El repositorio analizado, `matrixportalx/Krea-2-Turbo-npu`, no es el lanzamiento oficial: es un espejo empaquetado en GGUF para ejecutar el modelo en la NPU Hexagon de SoC Snapdragon mediante la ruta NPU de stable-diffusion.cpp. Para ello, el autor ha recuantizado el DiT y el codificador de Q8_0 a Q4_0 y ha convertido los tensores de BF16 a F16, porque el backend NPU no soporta cuantización K-quant ni aritmética BF16.

Su relevancia es doble: por un lado, demuestra que un modelo de difusión de 12 B puede ejecutarse en hardware ARM de consumo sin GPU dedicada; por otro, es un artefacto de conservación mantenido por un tercero (la app «Rüya ve Esin») para que sus ficheros sigan accesibles aunque los repositorios de origen desaparezcan. El repositorio tiene 0 descargas y 0 likes, pesa 9,7 GB y se publicó con licencia Krea 2 Community License.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para texto-a-imagen; no es un modelo de lenguaje. Pipeline de tres componentes: DiT + codificador de texto Qwen3-VL-4B-Instruct + VAE de Wan 2.1 |
| Parámetros totales | 12.820.073.036 (≈12,82 B) según los metadatos del repositorio; la model card cita 12 B para el DiT. El recuento parece referirse solo al DiT: el pipeline completo, sumando el codificador Qwen3-VL-4B, supera los 16 B |
| Parámetros activos | No aplica: arquitectura densa, no MoE |
| Longitud de contexto | No disponible (el componente con contexto es el codificador Qwen3-VL-4B; no se documenta su ventana en esta ficha) |
| Tipos de cuantización | Q4_0 en `diffusion_model.gguf` y `llm.gguf` (recuantizados desde Q8_0). Los originales de los que deriva están en Q8_0 GGUF y BF16. El VAE se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible. El codificador Qwen3-VL es multilingüe y acepta prompts en lenguaje natural, pero no se documenta el rendimiento por idioma |
| Licencia | Krea 2 Community License (`license: other`): uso comercial permitido a organizaciones con ingresos anuales inferiores a 1 millón de USD; incluye política de uso aceptable |
| Formato de pesos | GGUF (`diffusion_model.gguf`, `llm.gguf`) + safetensors (`vae.safetensors`) + `LICENSE.pdf` |
| Pasos de muestreo | 8 pasos (model card); 8-12 pasos como variante Turbo según fuentes de terceros |
| Escala de guiado (CFG) | 0 (model card); 1 en la descripción de terceros |
| Resolución de generación | No disponible |
| Tamaño del repositorio | 9,7 GB |
| Pipeline declarado en HuggingFace | No disponible |

## Arquitectura y entrenamiento

Krea 2 es una familia de modelos de imagen entrenada desde cero por Krea AI, con dos variantes: RAW, orientada al ajuste fino y a 25-30 pasos con CFG más alto, y Turbo, destilada para inferencia rápida en 8-12 pasos. La variante Turbo que empaqueta este repositorio es, por tanto, un modelo de difusión destilado en pasos, no un modelo de lenguaje: el texto se procesa con un codificador Qwen3-VL-4B-Instruct, que permite consumir prompts en lenguaje natural en lugar de listas de etiquetas, y la decodificación latente se realiza con el VAE de Wan 2.1.

No se han publicado en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF/DPO (conceptos, por otra parte, propios de modelos de lenguaje y no directamente trasladables a un difusor). La innovación técnica relevante de este repositorio concreto es la cadena de conversión: los tensores se toman de los GGUF Q8_0 publicados por `realrebelai/KREA-2_GGUFs` y de `unsloth/Qwen3-VL-4B-Instruct-GGUF`, se recuantizan a Q4_0 y se convierten de BF16 a F16 para que funcionen en la ruta Hexagon NPU de stable-diffusion.cpp. Se trata, por tanto, de una cuantización de segunda generación (Q8_0 → Q4_0), lo que acumula pérdida de calidad respecto al original en BF16.

## Capacidades

- Generación de imágenes a partir de prompts en lenguaje natural, orientada a ilustración expresiva y exploración estilística.
- Inferencia en muy pocos pasos: 8 pasos y CFG 0, lo que reduce el coste computacional a una sola evaluación por paso al eliminar la doble pasada del classifier-free guidance.
- Aceptación de descripciones largas en lenguaje natural gracias al codificador Qwen3-VL, en lugar de vocabulario de tipo tag list.
- Ejecución en NPU Hexagon de SoC Snapdragon a través de stable-diffusion.cpp, sin GPU dedicada.
- Empaquetado autocontenido: DiT, codificador y VAE en un mismo repositorio, listos para un runtime concreto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es un modelo generativo de imagen, no un LLM conversacional.
- No se documentan capacidades de edición de imagen, inpainting, controlnet, vídeo ni audio en la información disponible.

## Casos de uso

- Generación de ilustraciones en portátiles y tablets ARM con Snapdragon: el paquete Q4_0 está pensado para ejecutarse íntegramente en la NPU Hexagon, de modo que la generación ocurre en el dispositivo sin depender de una GPU discreta ni de la nube.
- Aplicaciones creativas offline con requisitos de privacidad: al no requerir conexión, los prompts y las imágenes no salen del dispositivo, lo que encaja en entornos con datos sensibles o conectividad intermitente.
- Prototipado rápido de conceptos visuales: con 8 pasos y CFG 0 el coste por imagen es mínimo, lo que permite generar decenas de variantes para explorar dirección de arte antes de pasar a un modelo de mayor calidad.
- Iteración de estilo en ilustración editorial: el modelo está entrenado explícitamente para exploración creativa y estilística, y el codificador Qwen3-VL admite instrucciones descriptivas largas en lugar de etiquetas.
- Integración en pipelines de diseño mediante stable-diffusion.cpp: al ser GGUF, el modelo se puede encadenar con scripts y herramientas del ecosistema ggml para generación por lotes en servidores ARM de bajo consumo.
- Preservación y reproducibilidad de artefactos: el repositorio existe como espejo para que aplicaciones de terceros sigan resolviendo los mismos ficheros aunque los repositorios originales se eliminen o se hagan privados; útil si se fija la revisión por hash.
- Evaluación comparativa de cuantizaciones en hardware edge: sirve para medir la degradación real de un DiT de 12 B al pasar de Q8_0 a Q4_0 en un backend NPU.
- Base para experimentos de despliegue en SoC: permite validar latencias y consumo en dispositivos Snapdragon antes de invertir en infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de FID, CLIP score, evaluación de adherencia al prompt ni comparativas numéricas con otros modelos de imagen, ni tampoco medidas de latencia, throughput o consumo energético en la NPU Hexagon.

## Requisitos de hardware

- Destino principal: NPU Hexagon integrada en SoC Snapdragon, mediante la ruta NPU de stable-diffusion.cpp. No se detalla en la información disponible la lista exacta de SoC compatibles ni la versión mínima del runtime.
- Huella de pesos en Q4_0 (estimación a partir del tamaño de los ficheros): el DiT de 12 B ronda los 6,5-7 GB, el codificador Qwen3-VL-4B en Q4_0 unos 2,3-2,5 GB y el VAE de Wan 2.1 unos 0,25 GB; el total del repositorio son 9,7 GB. Estas cifras son estimaciones derivadas de la cuantización, no datos publicados por el autor.
- Memoria necesaria para el pipeline completo: previsiblemente por encima de 10 GB contando pesos y activaciones, aunque no se ha publicado la cifra oficial.
- GPU: no se han publicado requisitos de VRAM ni modelos de GPU recomendados. En una GPU convencional el formato GGUF Q4_0 puede ejecutarse con backends ggml, pero esta no es la ruta para la que se ha empaquetado el modelo.
- ¿Cabe en GPU de consumo? No hay datos publicados. Por volumen de pesos en Q4_0 el pipeline quedaría en el rango de las GPU de 12-16 GB de VRAM, pero es una estimación, no una validación del autor.
- Opciones de despliegue: stable-diffusion.cpp (ruta Hexagon NPU, y fallback en CPU con el mismo GGUF). vLLM, TGI y Ollama no aplican: son servidores de modelos de lenguaje, no de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos / CFG | Formato y cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Turbo NPU (este repositorio) | ≈12,8 B (DiT) + ≈4 B (codificador) | 8 / 0 | GGUF Q4_0 + safetensors, optimizado para NPU Hexagon | Krea 2 Community License | Espejo de terceros, 0 descargas |
| Krea 2 Turbo oficial | 12 B (DiT) según model card | 8 / 0 | Pesos originales en el repositorio de Krea | Krea 2 Community License | Repositorio `krea/Krea-2-Turbo` |
| Krea 2 Turbo Q8_0 GGUF (`realrebelai/KREA-2_GGUFs`) | 12 B (DiT) | 8 / 0 | GGUF Q8_0, sin conversión a F16 | Krea 2 Community License | Público, origen de este paquete |
| Krea 2 RAW | No disponible | 25-30 / CFG más alto | Pesos originales, orientado a ajuste fino | Krea 2 Community License | Repositorio oficial de Krea |

No se dispone de datos de rendimiento comparado (FID, adherencia al prompt) entre estas variantes en la información proporcionada; la diferencia documentada es de pasos, CFG, formato y fidelidad de cuantización.

## Limitaciones y advertencias

- Pérdida de calidad por doble cuantización: los tensores se recuantizan de Q8_0 a Q4_0 y se convierten de BF16 a F16. Es una cuantización de segunda generación, por lo que la fidelidad respecto al modelo original en BF16 es previsiblemente inferior a la de un Q4_0 derivado directamente del original.
- Restricción del backend: la NPU Hexagon no soporta K-quant ni BF16, de modo que no es posible usar cuantizaciones de mayor calidad en esa ruta sin cambiar de hardware.
- CFG 0 implica que los prompts negativos no tienen efecto: no se puede guiar la generación alejándose de conceptos no deseados mediante negative prompting.
- Licencia con umbral de ingresos: el uso comercial solo está permitido a organizaciones con ingresos anuales inferiores a 1 millón de USD. Por encima de ese umbral es necesario un acuerdo aparte con Krea. La licencia exige además que las aplicaciones que usen el modelo implementen un filtro de contenido adecuado.
- Riesgo de contenido sesgado o inapropiado: no se documenta la composición del dataset de entrenamiento ni las evaluaciones de sesgo; la propia licencia obliga a filtrar, lo que indica que el modelo puede producir contenido no deseado.
- Adherencia al prompt y artefactos: no hay evaluación publicada de fidelidad al prompt, renderizado de texto en imagen ni calidad anatómica; son riesgos habituales en difusores y aquí no están cuantificados.
- Repositorio no oficial: es un espejo mantenido por un tercero con 0 descargas y 0 likes. No hay garantía de mantenimiento, y puede desaparecer. Conviene fijar la revisión por commit y verificar los hashes de los ficheros.
- Idiomas no documentados: se desconoce el rendimiento del codificador con prompts en castellano o en idiomas distintos del inglés, más allá de que arquitectónicamente sea multilingüe.
- Metadatos anómalos: la fecha de creación declarada (2026-10-22) es posterior a la fecha actual, lo que apunta a un error de reloj o de metadatos del repositorio.
- No apto para ajuste fino: la variante Turbo está destilada para pocos pasos; para reentrenamiento o adaptación de estilo la familia indica la variante RAW.

## Enlaces

- Repositorio analizado: https://huggingface.co/matrixportalx/Krea-2-Turbo-npu
- Perfil del autor del espejo: https://huggingface.co/matrixportalx
- Modelo original: https://huggingface.co/krea/Krea-2-Turbo
- Página del modelo en Krea: https://www.krea.ai/models/krea-2-turbo
- Familia Krea 2 Open-Source (RAW y Turbo): https://www.krea.ai/krea-2-open-source
- Código de inferencia oficial: https://github.com/krea-ai/krea-2
- Licencia y política de uso aceptable: https://krea.ai/krea-2-licensing
- Origen del DiT en GGUF: https://huggingface.co/realrebelai/KREA-2_GGUFs
- Origen del codificador de texto: https://huggingface.co/unsloth/Qwen3-VL-4B-Instruct-GGUF
- Origen del VAE: https://huggingface.co/Comfy-Org/Wan-2.1
- Demo alojada de terceros: https://app.aiflux.dev/krea-2
