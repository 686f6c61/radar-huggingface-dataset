# quantilimited/Xenon-1-Lite

## Resumen

Xenon-1 Lite es el tier inferior de la familia Xenon-1, un conjunto de modelos propietarios publicados por Crystal IDE (bajo la cuenta de Hugging Face `quantilimited`) y distribuidos con acceso restringido (gated) mediante aprobación manual. A diferencia de un modelo monolítico, Xenon-1 Lite es una canalización (pipeline) de generación text-to-3D compuesta por tres componentes encadenados: expansión de prompt con Qwen3-VL-4B-Instruct, generación de imagen con SDXL 1.0 y conversión imagen-a-3D con TRELLIS.2-4B.

La relevancia de esta ficha es fundamentalmente documental y de evaluación de licencia: el repositorio no publica parámetros propios del modelo, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. La model card indica explícitamente que los detalles específicos del tier (recuento de parámetros, formato de entrada/salida, longitud de contexto y datos de entrenamiento) deben añadirse antes de la publicación, por lo que a fecha de esta ficha no están disponibles.

El aspecto más determinante para cualquier evaluador es que Xenon-1 no es open source: se distribuye bajo la Xenon-1 Model Family License v1.0, de uso exclusivamente no comercial, sin permiso de redistribución, alojamiento como servicio, publicación de derivados ni uso de sus salidas para entrenar modelos competidores. Cualquier uso comercial requiere un acuerdo escrito separado con Crystal IDE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-modelo: Qwen3-VL-4B-Instruct (expansión de prompt) + SDXL 1.0 (texto a imagen) + TRELLIS.2-4B (imagen a 3D) |
| Parametros totales | No disponible (no se publica recuento agregado ni por componente en el repositorio) |
| Parametros activos | No aplica (no es un modelo MoE; los componentes son modelos densos de terceros) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Xenon-1 Model Family License v1.0 (cerrada, no comercial, acceso gated con aprobación manual) |
| Formato de pesos | No disponible (los componentes se descargan desde sus propios repositorios de Hugging Face; no se redistribuyen en este repositorio) |

## Arquitectura y entrenamiento

Xenon-1 Lite no es un transformer entrenado por Crystal IDE, sino una orquestación de tres modelos preexistentes de terceros. La etapa de expansión de prompt emplea Qwen3-VL-4B-Instruct; la etapa de síntesis de imagen usa SDXL 1.0; y la etapa de reconstrucción 3D usa TRELLIS.2-4B. Según la model card, Xenon-1 descarga estos modelos desde sus propios repositorios de Hugging Face y no los redistribuye; cada componente conserva su licencia original.

No se ha publicado información sobre el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.). La única innovación declarada es la composición del pipeline y su empaquetado bajo una licencia y canal de distribución únicos.

## Capacidades

- Generación de activos 3D a partir de texto mediante un pipeline de tres etapas (expansión de prompt, síntesis de imagen y reconstrucción 3D).
- Expansión y enriquecimiento de prompts: la etapa Qwen3-VL-4B-Instruct reformula la entrada textual antes de la síntesis de imagen.
- Generación de imágenes 2D intermedias con SDXL 1.0 como paso previo a la conversión 3D.
- Conversión imagen-a-3D con TRELLIS.2-4B.
- Capacidades multimodales heredadas de Qwen3-VL en la etapa de expansión de prompt (visión y lenguaje), si bien el pipeline declarado es text-to-3D.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Prototipado rápido de activos 3D para videojuegos o previsualización: el pipeline permite pasar de una descripción textual a una malla 3D preliminar sin modelado manual, útil en fases de concepto.
- Generación de props y decorados para escenas de previsualización (previz) en producción audiovisual, donde la fidelidad final no es crítica y prima la iteración rápida.
- Creación de catálogos de producto en 3D a partir de descripciones textuales para entornos de comercio electrónico o configuradores, siempre que se cuente con licencia comercial.
- Material docente y de investigación en pipelines text-to-3D: al estar compuesto por modelos conocidos (Qwen3-VL, SDXL, TRELLIS), sirve como caso de estudio de orquestación multi-modelo.
- Exploración artística y generación de variantes de un mismo concepto mediante la expansión de prompt, que permite obtener distintas interpretaciones de una descripción base.
- Evaluación comparativa de pipelines text-to-3D en entornos académicos, contrastando la calidad de la etapa de imagen (SDXL 1.0) frente a alternativas como FLUX.1-schnell o Qwen-Image disponibles en otros tiers de la familia.
- Integración en herramientas de autoría 3D (como el propio STRATA de Crystal IDE) para flujos de trabajo asistidos por IA, sujeto a los términos de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, los componentes declarados (Qwen3-VL-4B-Instruct, SDXL 1.0 y TRELLIS.2-4B) son modelos de tamaño medio que, en conjunto, requieren una GPU con memoria considerable; no obstante, el repositorio no publica cifras oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible. El canal autorizado de ejecución declarado es la aplicación STRATA distribuida por Crystal IDE, además de la descarga desde el repositorio oficial.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Componentes | Licencia | Acceso |
|---|---|---|---|---|
| Xenon-1 Lite | Pipeline text-to-3D | Qwen3-VL-4B-Instruct + SDXL 1.0 + TRELLIS.2-4B | Xenon-1 Model Family License (no comercial, cerrada) | Gated, aprobación manual |
| Xenon-1 Turbo | Pipeline text-to-3D | Sin expansión de prompt + FLUX.1-schnell + TRELLIS.2-4B | Xenon-1 Model Family License | Gated, aprobación manual |
| Xenon-1 Prime | Pipeline text-to-3D | Qwen3-VL-8B-Instruct + Qwen-Image + TRELLIS.2-4B | Xenon-1 Model Family License | Gated, aprobación manual |
| Xenon-1 Apex | Pipeline text-to-3D | Qwen3-VL-30B-A3B-Instruct + Qwen-Image-2512 + TRELLIS.2-4B | Xenon-1 Model Family License | Gated, aprobación manual |

No se dispone de datos de rendimiento comparativo entre tiers ni frente a pipelines text-to-3D de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- Licencia cerrada y no comercial: el uso comercial del modelo o de sus salidas requiere un acuerdo escrito firmado con Crystal IDE; solicitarlo no concede derechos.
- Prohibición de redistribución: no se permite publicar réplicas, re-subidas, torrents, copias en unidades de nube ni alojar el modelo como servicio, aunque los archivos sean idénticos.
- Prohibición de derivados: no se pueden distribuir fine-tunes, versiones cuantizadas u otros modelos derivados.
- Prohibición de uso de salidas para entrenar modelos competidores.
- Acceso gated con aprobación manual, no transferible: cada usuario debe solicitar acceso por separado y no puede compartir los archivos.
- Canal de descarga restringido: solo los repositorios oficiales de Hugging Face publicados por Crystal IDE y la aplicación STRATA; una copia obtenida por otra vía no está licenciada.
- Ausencia de especificaciones técnicas publicadas: no hay recuento de parámetros, contexto, idiomas, cuantizaciones ni benchmarks, lo que impide una evaluación rigurosa previa a la solicitud de acceso.
- Dependencia de modelos de terceros: los componentes (Qwen3-VL, SDXL, TRELLIS) mantienen sus propias licencias, que el usuario debe revisar por separado.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al tratarse de un pipeline de generación visual/3D, la fidelidad a la descripción textual no está garantizada ni medida públicamente.
- Sin descargas ni validación comunitaria: el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no existe evidencia pública de uso o validación por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/quantilimited/Xenon-1-Lite
- Licencia del modelo: https://huggingface.co/quantilimited/Xenon-1-Lite/blob/main/XENON-1-MODEL-LICENSE.md
- Contacto para licencias comerciales: support@crystal-ide.co.uk (asunto "Xenon-1 Commercial License Request")
- Contacto para dudas de licencia: support@crystal-ide.co.uk (asunto "Xenon-1 License Question")
- Repositorios de los tiers superiores: `quantilimited/Xenon-1-Turbo`, `quantilimited/Xenon-1-Prime`, `quantilimited/Xenon-1-Apex`
