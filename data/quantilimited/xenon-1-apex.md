# quantilimited/Xenon-1-Apex

## Resumen

Xenon-1 Apex es el nivel superior de la familia Xenon-1, un conjunto de modelos propietarios publicados por Crystal IDE (contacto: support@crystal-ide.co.uk) en cuatro niveles: Lite, Turbo, Prime y Apex. A diferencia de lo que sugiere la etiqueta `pipeline_tag: text-to-3d`, Xenon-1 Apex no es un modelo único entrenado de extremo a extremo, sino un pipeline orquestado que encadena tres componentes de terceros: expansión de prompt con Qwen3-VL-30B-A3B-Instruct, generación de imagen con Qwen-Image-2512 y conversión imagen a 3D con TRELLIS.2-4B. Crystal IDE no redistribuye estos pesos; el repositorio actúa como punto de entrada con licencia propia y acceso restringido.

La relevancia del modelo es limitada desde el punto de vista técnico y de investigación: se trata de un producto cerrado, con licencia no comercial, acceso mediante aprobación manual y sin parámetros propios publicados. No se ha publicado información sobre arquitectura interna, número de parámetros del conjunto, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. Su interés radica en el empaquetado comercial de un pipeline text-to-3D y en las restricciones de uso, más que en innovaciones de modelado.

La ficha siguiente documenta exclusivamente lo que consta en la información disponible. Cualquier dato no confirmado se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline orquestado de tres etapas (expansión de prompt multimodal, text-to-image, image-to-3D); arquitectura interna no disponible |
| Parametros totales | No disponible (el pipeline integra Qwen3-VL-30B-A3B-Instruct, Qwen-Image-2512 y TRELLIS.2-4B; no se declara un total agregado) |
| Parametros activos | No disponible (Qwen3-VL-30B-A3B-Instruct es MoE con 30B totales y 3B activos según su propia denominación; el resto de componentes no declara activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Xenon-1 Model Family License v1.0 (cerrada, solo uso no comercial; uso comercial requiere licencia escrita separada de Crystal IDE) |
| Formato de pesos | No disponible (el repositorio no redistribuye pesos; los componentes se descargan de sus repositorios originales) |

## Arquitectura y entrenamiento

Xenon-1 Apex no es un transformer monolítico ni un modelo entrenado por Crystal IDE con datos propios declarados. Es un pipeline de inferencia que encadena tres modelos de terceros, cada uno con su propia licencia y su propio repositorio en Hugging Face: Qwen3-VL-30B-A3B-Instruct para expansión de prompt (modelo multimodal con mezcla de expertos), Qwen-Image-2512 para generación de imagen y TRELLIS.2-4B para conversión de imagen a geometría 3D. La única diferencia entre los cuatro niveles de la familia es la elección de estos componentes: Lite usa Qwen3-VL-4B-Instruct, SDXL 1.0 y TRELLIS.2-4B; Turbo prescinde de expansión de prompt y usa FLUX.1-schnell; Prime usa Qwen3-VL-8B-Instruct y Qwen-Image; Apex escala a Qwen3-VL-30B-A3B-Instruct y Qwen-Image-2512.

No se ha publicado información sobre el proceso de entrenamiento, el volumen o la composición de los datos, ni sobre técnicas de alineación como RLHF o DPO aplicadas por Crystal IDE. Tampoco se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.). El valor añadido declarado es la orquestación del pipeline y su distribución a través de la aplicación STRATA, no el desarrollo de nuevos pesos.

## Capacidades

- Generación de mallas 3D a partir de descripciones textuales, mediante la cadena prompt → imagen → 3D.
- Expansión de prompt asistida por un modelo de visión-lenguaje (Qwen3-VL-30B-A3B-Instruct) para enriquecer la descripción inicial antes de la generación de imagen.
- Generación de imágenes intermedias de alta fidelidad con Qwen-Image-2512.
- Reconstrucción image-to-3D con TRELLIS.2-4B.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada del pipeline.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, audio, vídeo): no disponibles.

## Casos de uso

- Prototipado rápido de assets 3D para videojuegos: un diseñador describe un objeto en texto y obtiene una malla preliminar para iterar en el motor, aprovechando la etapa de expansión de prompt para refinar la descripción antes de la generación.
- Previsualización de producto en comercio electrónico: generar representaciones 3D de un artículo a partir de una descripción textual para vistas interactivas, con la limitación de que el uso comercial requiere licencia separada de Crystal IDE.
- Docencia y experimentación académica en pipelines generativos: estudiar la composición de tres etapas (VLM, difusión, image-to-3D) y sus interdependencias, amparado en el uso académico no comercial permitido por la licencia.
- Exploración conceptual en arquitectura y diseño de interiores: producir volúmenes 3D aproximados de mobiliario o espacios a partir de briefs textuales para discutir con clientes antes de modelar en detalle.
- Generación de props para previsualización cinematográfica: crear geometrías de referencia para storyboards o previsualizaciones, siempre que el proyecto no tenga carácter comercial sin licencia.
- Investigación en evaluación de pipelines text-to-3D: comparar la calidad de Apex frente a Lite, Turbo y Prime, que difieren en los componentes de expansión de prompt y generación de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia orientativa, el pipeline integra un modelo MoE de 30B totales (Qwen3-VL-30B-A3B-Instruct), un modelo de difusión de imagen (Qwen-Image-2512) y un modelo image-to-3D de 4B (TRELLIS.2-4B); cada componente impone sus propios requisitos, que deben consultarse en sus model cards originales.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño de los componentes, es razonable esperar requisitos de GPU de centro de datos, pero no se confirma.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la vía autorizada es la aplicación STRATA distribuida por Crystal IDE; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Xenon-1 Apex | No disponible (pipeline con componentes de 30B MoE, difusión y 4B) | No disponible | Xenon-1 Model Family License (cerrada, no comercial) | Gated con aprobación manual; solo repos oficiales y STRATA | Orquestación propietaria de componentes de terceros |
| Xenon-1 Prime | No disponible (Qwen3-VL-8B-Instruct, Qwen-Image, TRELLIS.2-4B) | No disponible | Xenon-1 Model Family License | Gated | Mismo pipeline con componentes menores |
| Xenon-1 Lite | No disponible (Qwen3-VL-4B-Instruct, SDXL 1.0, TRELLIS.2-4B) | No disponible | Xenon-1 Model Family License | Gated | Nivel de entrada de la familia |
| TRELLIS.2-4B (componente) | 4B | No disponible | Según su model card original | Público en Hugging Face | Componente image-to-3D reutilizado por todos los niveles |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia cerrada y no comercial: no se permite uso comercial, redistribución, sublicencia, hosting como servicio ni distribución de fine-tunes o cuantizaciones sin un acuerdo escrito firmado por Crystal IDE.
- Canal de obtención restringido: solo se autoriza la descarga desde los repositorios oficiales de Hugging Face o la aplicación STRATA; espejos, torrents y copias de terceros no están licenciados.
- Prohibición de uso de salidas para entrenar modelos competidores.
- Acceso gated con aprobación manual e intransferible: cada usuario debe solicitar acceso por separado.
- Ausencia total de datos técnicos publicados: no hay información sobre arquitectura interna, contexto, cuantizaciones, idiomas ni benchmarks, lo que impide una evaluación rigurosa previa a la adopción.
- Dependencia de componentes de terceros con licencias propias (Qwen, TRELLIS, SDXL, FLUX), que pueden imponer condiciones adicionales; FLUX [dev] no es Apache 2.0 según los avisos del propio repositorio.
- Riesgo de alucinación y sesgos: no documentado por el autor; al tratarse de un pipeline generativo de imágenes y 3D, cabe esperar sesgos heredados de los modelos de difusión subyacentes, pero no se aportan datos.
- La model card contiene texto de plantilla sin completar (instrucciones para reemplazar `YOUR_HF_ORG`), lo que sugiere un proceso de publicación incompleto y aumenta la incertidumbre sobre la madurez del producto.
- Sin descargas registradas en el momento de la consulta y con un único "like", lo que indica una adopción prácticamente nula y ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/quantilimited/Xenon-1-Apex
- Licencia Xenon-1 Model Family License: https://huggingface.co/quantilimited/Xenon-1-Apex/blob/main/XENON-1-MODEL-LICENSE.md
- Contacto de licencias comerciales: support@crystal-ide.co.uk (asunto "Xenon-1 Commercial License Request")
- Consultas de licencia: support@crystal-ide.co.uk (asunto "Xenon-1 License Question")
- Repositorios de la familia: quantilimited/Xenon-1-Lite, quantilimited/Xenon-1-Turbo, quantilimited/Xenon-1-Prime
- Componentes referenciados (repositorios originales de terceros, no redistribuidos): Qwen3-VL-30B-A3B-Instruct, Qwen-Image-2512, TRELLIS.2-4B
- Papers, blogs, demos o documentación adicional: no disponibles
