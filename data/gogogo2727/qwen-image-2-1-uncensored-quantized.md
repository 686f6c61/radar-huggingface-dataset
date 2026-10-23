# gogogo2727/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es un paquete de pesos cuantizados del modelo de difusión texto-a-imagen Qwen/Qwen-Image-2.1, publicado por el usuario gogogo2727 en HuggingFace. El repositorio no aporta un modelo nuevo, sino una colección de conversiones (GGUF, safetensors FP8/INT8/NVFP4 y MLX en 4, 6 y 8 bits) junto con los ficheros auxiliares necesarios para ejecutarlo en ComfyUI: un text encoder basado en Qwen3-VL de 8B y el VAE específico del modelo. La etiqueta "Uncensored" indica que se han eliminado o relajado los filtros de seguridad del modelo original, aunque la model card no documenta el procedimiento aplicado.

El dato de parámetros reportado en safetensors es de 7.115.124.736 (aproximadamente 7,1 mil millones), correspondiente a los pesos del transformer de difusión; a ello hay que sumar el text encoder de 8B y el VAE, por lo que el consumo real de memoria es muy superior al que sugiere esa cifra. El repositorio ocupa 105,2 GB en total por acumular todas las variantes de cuantización en un mismo espacio.

Su relevancia es doble: por un lado, permite ejecutar un modelo de generación de imágenes de última generación en hardware de consumo (la variante Q4_K_M ocupa 4,60 GB y la MLX 4-bit 4,00 GB); por otro, la versión sin censura interesa a quienes investigan el comportamiento de los filtros de seguridad o necesitan contenido que los modelos alineados rechazan. La licencia qwen-research limita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (detalle de la arquitectura interna no disponible en la informacion proporcionada); pipeline con text encoder Qwen3-VL 8B y VAE propio |
| Parametros totales | 7.115.124.736 (pesos del transformer de difusion, dato de safetensors); el text encoder Qwen3-VL 8B y el VAE se distribuyen como ficheros separados |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es una magnitud aplicable al pipeline de difusion; la longitud de contexto del text encoder Qwen3-VL 8B no se detalla) |
| Tipos de cuantizacion | GGUF: BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0. Safetensors: FP8, INT8 ConvRot, NVFP4. MLX: 4-bit, 6-bit, 8-bit. Text encoder: BF16 e INT8 ConvRot |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | qwen-research (etiquetada como license: other en el repositorio) |
| Formato de pesos | GGUF, safetensors (FP8, INT8 ConvRot, NVFP4, MLX) y VAE en safetensors BF16 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del transformer de difusion de Qwen-Image-2.1 ni su proceso de entrenamiento: no se indican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Lo unico documentado es la composicion del pipeline: un text encoder Qwen3-VL de 8B (distribuido en BF16, 17,53 GB, y en INT8 ConvRot, 9,35 GB), un VAE propio de 676 MB en BF16 y el transformer de difusion cuantizado en distintas precisiones.

Tampoco se documenta el metodo empleado para eliminar la censura respecto al modelo base. La model card se limita a afirmar que las conversiones se han generado "using the original upstream base weights", es decir, que las cuantizaciones parten de los pesos originales de Qwen/Qwen-Image-2.1. La innovacion practica del repositorio es la variedad de formatos: NVFP4 e INT8 ConvRot orientados a GPUs compatibles, MLX optimizado para Apple Silicon y GGUF para ComfyUI-GGUF, con Q4_K_M recomendado por el autor como mejor relacion tamano/calidad.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (pipeline text-to-image).
- Integracion nativa con ComfyUI mediante el nodo ComfyUI-GGUF, incluyendo el fork de leejet con soporte declarado para la arquitectura de Qwen-Image 2.1.
- Ejecucion en GPU NVIDIA con cuantizaciones GGUF, FP8, INT8 ConvRot y NVFP4.
- Ejecucion en Apple Silicon mediante los formatos MLX de 4, 6 y 8 bits.
- Generacion sin filtros de seguridad ("uncensored"), segun la denominacion del autor.
- Distribucion autocontenida: transformer, text encoder y VAE alojados en el mismo repositorio.
- No se documentan capacidades de edicion de imagen, inpainting, outpainting, control por pose o referencia, tool calling ni agentes; no disponibles en la informacion proporcionada.

## Casos de uso

- Ilustracion conceptual y storyboarding: el modelo puede generar variantes rapidas de una escena a partir de descripciones textuales dentro de un flujo de ComfyUI, lo que permite iterar sobre composicion e iluminacion antes de producir el arte final.
- Assets para videojuegos y prototipado: con la variante Q4_K_M (4,60 GB) se pueden generar lotes de texturas, iconos y conceptos en una estacion de trabajo con GPU de 16-24 GB, sin depender de APIs externas.
- Generacion de imagen de producto para comercio electronico: al ejecutarse en local, las descripciones y las imagenes no salen de la infraestructura de la empresa, lo que simplifica el cumplimiento de proteccion de datos en catalogos con cientos de referencias.
- Previsualizacion en diseno industrial y arquitectura: generacion de imagenes de concepto a partir de descripciones de materiales y volumetrias, con el VAE y el text encoder empaquetados que evitan conflictos de versiones entre nodos.
- Flujos de trabajo por lotes en ComfyUI: la disponibilidad de GGUF, FP8 e INT8 ConvRot permite elegir el equilibrio entre velocidad y calidad segun la GPU disponible, y automatizar la generacion mediante la API de ComfyUI.
- Investigacion sobre alineacion y filtros de seguridad: la variante sin censura permite estudiar que contenido rechaza un modelo alineado y como se comporta tras eliminar las capas de seguridad, un caso de uso habitual en publicaciones sobre seguridad de modelos generativos.
- Experimentacion en Apple Silicon: las conversiones MLX de 4, 6 y 8 bits (4,00 / 5,78 / 7,56 GB) permiten probar el modelo en portatiles y equipos de sobremesa de Apple sin GPU dedicada.
- Ajuste fino y desarrollo de LoRAs: los pesos en FP8 (6,63 GB) y BF16 GGUF (14,23 GB) sirven de punto de partida para entrenamientos sobre dominios o estilos concretos.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) con resultados comparativos, pero no se han proporcionado los valores numericos en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano de los ficheros publicados (transformer + text encoder + VAE), no mediciones del autor:

- BF16 GGUF (14,23 GB) + text encoder BF16 (17,53 GB) + VAE (0,68 GB): aproximadamente 32,4 GB de pesos, lo que exige del orden de 40 GB de VRAM (A100 40 GB, L40S 48 GB) o descarga parcial a RAM.
- Q8_0 (7,59 GB) + text encoder INT8 ConvRot (9,35 GB) + VAE: aproximadamente 17,6 GB; encaja en RTX 4090 / RTX 5090 (24-32 GB) y en A100 40 GB con margen.
- Q4_K_M (4,60 GB) + text encoder INT8 ConvRot (9,35 GB) + VAE: aproximadamente 14,6 GB; viable en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 5070 Ti) y comodo en 24 GB.
- Q4_0 (4,15 GB) y MLX 4-bit (4,00 GB): las opciones mas ligeras; la primera pensada para GPUs con poca memoria y la segunda para Apple Silicon con 16 GB o mas de memoria unificada.
- NVFP4 (4,20 GB): requiere hardware con soporte nativo de FP4 (familia Blackwell: RTX 50xx, B200) para aprovechar su ventaja de rendimiento.
- INT8 ConvRot (6,76 GB): orientado a GPUs con kernels INT8 eficientes; el autor lo presenta como una de las opciones de alto rendimiento.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet, segun la model card), y por extension del ecosistema, llama.cpp/ComfyUI para los GGUF y MLX para Apple Silicon. No se documenta soporte de vLLM ni TGI, que no aplican a un pipeline de difusion.
- Latencia y throughput: no disponibles; el autor no publica mediciones de tiempo por imagen ni comparativas entre cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gogogo2727/Qwen-Image-2.1-Uncensored-Quantized | 7.115.124.736 (transformer) + text encoder Qwen3-VL 8B | No disponible | GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), FP8, INT8 ConvRot, NVFP4, MLX 4/6/8-bit | qwen-research | Repositorio publico, 0 descargas y 1 like en el momento de la consulta |
| Qwen/Qwen-Image-2.1 (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | Qwen (licencia del modelo original, no detallada) | Repositorio oficial en HuggingFace |
| Alternativas de la misma categoria (por ejemplo, otros modelos de difusion texto-a-imagen de ~7-12B) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de otros modelos comparables en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento ni de parametros de terceros. La comparacion mas directa y fiable es la que enfrenta a esta version cuantizada con su modelo base: mismos pesos de partida, pero con menor requisito de memoria a costa de perdida de calidad y, en la variante "Uncensored", sin los filtros de seguridad del original.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: la variante "Uncensored" puede generar contenido que el modelo base rechazaria. No se documenta que contenido se ha desbloqueado ni si se ha mantenido alguna salvaguarda, lo que traslada al operador toda la responsabilidad legal y etica sobre las salidas.
- Licencia restrictiva: la licencia qwen-research no es una licencia de uso comercial general. Cualquier uso en produccion o con fines de lucro requiere revisar los terminos del modelo base y, previsiblemente, autorizacion explicita.
- Sin evaluacion publicada: no hay metricas numericas, ni comparativas de calidad entre cuantizaciones, ni estudios de degradacion por cuantizacion. La recomendacion de Q4_K_M es del autor y no esta respaldada con datos.
- Trazabilidad dudosa: la model card enlaza a rutas del usuario abenzerps mientras el repositorio pertenece a gogogo2727, lo que sugiere un espejo o re-subida. No se especifica el proceso de conversion ni las herramientas empleadas, lo que dificulta verificar que los pesos corresponden al modelo base declarado.
- Adopcion nula: 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en produccion ni reportes de terceros.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar anatomia incorrecta, texto ilegible en la imagen, artefactos en manos y rostros, y atributos que no aparecen en el prompt.
- Sesgos: no se documenta ninguna evaluacion de sesgo demografico, cultural o de representacion. Los modelos de difusion entrenados con datos web tienden a reproducir estereotipos de genero, etnia y profesion.
- Idiomas: no se declara lista de idiomas soportados, por lo que el rendimiento con prompts en castellano no esta verificado; el text encoder Qwen3-VL es multilingue en origen, pero el ajuste del pipeline puede estar dominado por el ingles.
- Dependencia de un fork concreto: la model card exige el fork leejet/ComfyUI-GGUF y advierte de errores de "Unknown model architecture!" con el fork city96; esto implica riesgo de fragmentacion y de rotura en actualizaciones.
- Requisito de memoria oculto: los 7,1B de parametros no reflejan el coste real, ya que el text encoder de 8B en BF16 suma 17,53 GB por si solo.
- Contenido para adultos: cualquier uso en este sentido debe cumplir la legislacion aplicable sobre verificacion de edad, distribucion y proteccion de menores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gogogo2727/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet, recomendado por el autor): https://github.com/leejet/ComfyUI-GGUF
- Formulario de peticiones de modelos del autor: https://abenzerps.com/request-a-model/
- Imagen de benchmarks citada en la model card: `assets/Qwen-Image-2.1-Benchmark.png` (no se proporciona URL directa ni los valores numericos)
- No se han encontrado en la busqueda web papers, blogs ni demos adicionales relevantes sobre este modelo.
