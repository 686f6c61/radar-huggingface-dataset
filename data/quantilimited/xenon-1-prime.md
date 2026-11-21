# quantilimited/Xenon-1-Prime

## Resumen

Xenon-1 Prime es el tercer nivel de la familia Xenon-1, una colección de modelos cerrados publicada por Crystal IDE (bajo la organización de Hugging Face `quantilimited`). A diferencia de un modelo monolítico, Xenon-1 Prime es un pipeline de generación de texto a 3D compuesto por tres componentes encadenados: un modelo de expansión de prompt (Qwen3-VL-8B-Instruct), un modelo de texto a imagen (Qwen-Image) y un modelo de imagen a 3D (TRELLIS.2-4B). El resultado final es una malla 3D generada a partir de una descripción textual.

El modelo se distribuye con acceso restringido (gated) y aprobación manual, y su licencia es explícitamente cerrada y no comercial (Xenon-1 Model Family License v1.0). No es un modelo de pesos abiertos ni permite redistribución, alojamiento como servicio, ni creación de derivados. La model card no proporciona detalles sobre el modelo base propio de Crystal IDE, el número de parámetros totales del sistema, la longitud de contexto ni los datos de entrenamiento, por lo que gran parte de las especificaciones técnicas no están disponibles.

La relevancia de Xenon-1 Prime radica en su enfoque de orquestación: en lugar de entrenar un único modelo multimodal de gran escala, compone modelos existentes de terceros para cubrir la cadena texto → imagen → 3D. Esto lo sitúa en el espacio de herramientas de generación de assets 3D para diseño, prototipado y previsualización, aunque con fuertes restricciones de licencia que limitan su uso en producción comercial sin un acuerdo aparte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline multi-modelo: expansión de prompt (Qwen3-VL-8B-Instruct) → texto a imagen (Qwen-Image) → imagen a 3D (TRELLIS.2-4B) |
| Parámetros totales | no disponible (la model card no declara el recuento del sistema; los componentes de terceros tienen sus propios tamaños) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Xenon-1 Model Family License v1.0 (cerrada, solo uso no comercial; uso comercial requiere licencia escrita separada) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Xenon-1 Prime no es un transformer único entrenado de cero, sino un pipeline de inferencia que encadena tres modelos. La primera etapa es Qwen3-VL-8B-Instruct, que actúa como expansor de prompt: recibe la descripción textual del usuario y la enriquece para alimentar la etapa de generación de imagen. La segunda etapa es Qwen-Image, un modelo de texto a imagen que produce la representación 2D. La tercera etapa es TRELLIS.2-4B, un modelo de imagen a 3D que convierte la imagen generada en una malla tridimensional. Los tres componentes se descargan desde sus propios repositorios de Hugging Face y conservan sus licencias originales; no se redistribuyen dentro del repositorio de Xenon-1.

La model card no documenta el entrenamiento del sistema: no se indican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o ajuste fino sobre los componentes. Tampoco se describe ninguna innovación técnica propia de Crystal IDE más allá de la orquestación del pipeline. La información disponible sugiere que el valor añadido del producto es la integración y el empaquetado, no un modelo base entrenado por el editor.

## Capacidades

- Generación de assets 3D a partir de texto: el pipeline completo transforma una descripción textual en una malla 3D mediante las etapas de expansión de prompt, texto a imagen e imagen a 3D.
- Expansión de prompt asistida por un modelo de visión-lenguaje (Qwen3-VL-8B-Instruct), que reformula la entrada del usuario antes de la generación de imagen.
- Generación de imágenes 2D intermedias mediante Qwen-Image, que pueden inspeccionarse o reutilizarse según el flujo de trabajo.
- Conversión de imagen a 3D mediante TRELLIS.2-4B, que produce la geometría final.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes ni thinking mode en la información disponible.
- Las capacidades multilingües no están declaradas; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Prototipado rápido de assets 3D en estudio de diseño: un diseñador describe un objeto y obtiene una malla preliminar para iterar sobre la forma antes de modelar en detalle. El pipeline completo cubre la cadena sin intervención manual entre etapas.
- Previsualización de conceptos en preproducción de videojuegos: el equipo genera variantes 3D de props o entornos a partir de descripciones textuales para evaluar dirección artística antes de invertir en modelado profesional.
- Docencia y experimentación académica en generación 3D: al estar licenciado para uso académico no comercial, sirve para estudiar pipelines texto → imagen → 3D y comparar etapas intermedias (prompt expandido, imagen 2D, malla final).
- Exploración de ideas en arquitectura e interiorismo: generar volúmenes y mobiliario conceptuales a partir de descripciones para discutir propuestas con clientes en fase temprana.
- Generación de referencias para artistas 3D: obtener una malla base que luego se retopa y se detalla en software de modelado, aprovechando la etapa de imagen a 3D como punto de partida.
- Investigación en evaluación de pipelines generativos: al exponer las tres etapas por separado, permite analizar cómo la expansión de prompt afecta a la imagen y cómo la imagen condiciona la geometría final, en un contexto de uso no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia de los componentes de terceros, Qwen3-VL-8B-Instruct y Qwen-Image requieren GPUs de gama alta para inferencia en precisión completa, y TRELLIS.2-4B añade carga adicional; el pipeline completo necesita ejecutar las tres etapas, por lo que la VRAM total es la suma de los picos de cada componente más los datos intermedios (imagen y malla).
- GPU recomendadas: no disponibles de forma oficial. Por el tamaño de los componentes (8B para el expansor de prompt, modelo de imagen de gran escala y 4B para imagen a 3D), se requiere al menos una GPU profesional con memoria amplia; no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No hay datos oficiales. Los componentes individuales podrían caber en GPUs de consumo de gama alta con cuantización, pero el pipeline completo encadenado probablemente exceda la memoria de una sola GPU de consumo; no se confirma.
- Opciones de despliegue: la model card solo autoriza la descarga desde el repositorio oficial de Hugging Face o mediante la aplicación STRATA de Crystal IDE. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xenon-1 Prime | Pipeline texto → imagen → 3D | no disponible | no disponible | Cerrada, no comercial (Xenon-1 Model Family License) | Gated con aprobación manual |
| Xenon-1 Lite | Pipeline texto → imagen → 3D (Qwen3-VL-4B, SDXL 1.0, TRELLIS.2-4B) | no disponible | no disponible | Cerrada, no comercial | Gated con aprobación manual |
| Xenon-1 Turbo | Pipeline texto → imagen → 3D (sin expansión de prompt, FLUX.1-schnell, TRELLIS.2-4B) | no disponible | no disponible | Cerrada, no comercial | Gated con aprobación manual |
| Xenon-1 Apex | Pipeline texto → imagen → 3D (Qwen3-VL-30B-A3B, Qwen-Image-2512, TRELLIS.2-4B) | no disponible | no disponible | Cerrada, no comercial | Gated con aprobación manual |

No se dispone de datos de rendimiento ni de comparativas con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Licencia cerrada y no comercial: el uso comercial del modelo o de sus salidas requiere un acuerdo escrito firmado con Crystal IDE; solicitarlo no otorga derechos.
- Prohibición de redistribución: no se permite alojar, vender, alquilar, sublicenciar ni ofrecer el modelo como servicio, ni publicar espejos, re-subidas o copias en otros hubs.
- Prohibición de derivados: no se pueden distribuir ajustes finos, versiones cuantizadas ni modelos derivados.
- Prohibición de uso para entrenar modelos competidores: las salidas del modelo no pueden emplearse para entrenar o mejorar otro modelo.
- Acceso individual y no transferible: la aprobación es personal; cada usuario debe solicitar acceso por separado y no puede compartir los archivos.
- Canales autorizados limitados: solo el repositorio oficial de Hugging Face y la aplicación STRATA; cualquier otra fuente no está licenciada.
- Componentes de terceros con licencias propias: Qwen3-VL-8B-Instruct, Qwen-Image y TRELLIS.2-4B conservan sus licencias; los FLUX [dev] no son Apache 2.0 y quedan excluidos del aviso de terceros.
- Falta de transparencia técnica: la model card no declara parámetros, contexto, datos de entrenamiento ni benchmarks, lo que dificulta la evaluación objetiva previa a la solicitud de acceso.
- Riesgo de alucinación y calidad geométrica: no se documentan tasas de error ni evaluaciones de fidelidad de las mallas generadas; al ser un pipeline encadenado, los errores de la etapa de prompt o de imagen se propagan a la geometría final.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento correcto fuera del idioma o idiomas no especificados.

## Enlaces

- Repositorio oficial en Hugging Face: https://huggingface.co/quantilimited/Xenon-1-Prime
- Licencia del modelo: https://huggingface.co/quantilimited/Xenon-1-MODEL-LICENSE.md
- Avisos de terceros: https://huggingface.co/quantilimited/Xenon-1-Prime/blob/main/THIRD-PARTY-NOTICES.md
- Contacto de licencias comerciales: support@crystal-ide.co.uk
- Repositorios de la familia: https://huggingface.co/quantilimited/Xenon-1-Lite, https://huggingface.co/quantilimited/Xenon-1-Turbo, https://huggingface.co/quantilimited/Xenon-1-Apex
- Componentes de terceros (repositorios propios, no redistribuidos): Qwen3-VL-8B-Instruct, Qwen-Image, TRELLIS.2-4B (consultar sus model cards en Hugging Face)
