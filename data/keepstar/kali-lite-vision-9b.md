# keepstar/Kali-Lite-Vision-9B

## Resumen

Kali-Lite Vision 9B es un paquete multimodal publicado por keepstar (Kalicorp) que **no es un modelo fundacional entrenado desde cero**, sino una configuración construida sobre el modelo base `Qwen/Qwen3.5-9B`. Lo que aporta el autor es una doctrina de sistema (system prompt y reglas de comportamiento), un Modelfile de Ollama y un arnés de ejecución local con soporte de visión. La model card es explícita en este punto: se publica como configuración y documentación, sin que se confirme la redistribución de pesos upstream.

El modelo resuelve un problema de despliegue más que de investigación: ofrecer un asistente multimodal (imagen + texto) ejecutable íntegramente en local a través de Ollama, con un contexto configurado de 32.768 tokens y un artefacto típico de unos 6,8 GB según cuantización. Está orientado a escenarios de "IA soberana" (sovereign-ai), es decir, entornos donde los datos no pueden salir de la infraestructura propia, y declara soporte únicamente para francés e inglés.

Su relevancia ahora es limitada y debe contextualizarse: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el propio autor advierte que la ejecución local no implica por sí misma cumplimiento del RGPD, del Reglamento Europeo de IA, de directrices de la ANSSI ni de normas ISO. Es, por tanto, una propuesta de configuración y doctrina operativa, no un avance en arquitecturas o entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Heredada del modelo base `Qwen/Qwen3.5-9B`; la model card no describe la arquitectura |
| Parámetros totales | 9B nominales según la denominación del modelo base; no confirmado de forma independiente en la documentación |
| Parámetros activos | No aplica / no disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | 32.768 tokens configurados. La model card advierte que esto no garantiza un uso fiable de todos los tokens |
| Tipos de cuantización | No disponible. El runtime principal es Ollama y el tamaño típico del artefacto local es de unos 6,8 GB, pero no se detalla el método de cuantización |
| Idiomas soportados | Francés (fr) e inglés (en) |
| Licencia | Mixta: `mixed-gpl-2.0-only-apache-2.0` (etiquetada como `other`). El repositorio upstream Qwen3.5-9B es Apache-2.0; el material del repositorio de Kalicorp sigue los términos del proyecto Kali-Lite |
| Formato de pesos | No disponible. El paquete se publica como configuración y documentación (Modelfile); no se confirma la inclusión de pesos ni su formato (safetensors, GGUF, etc.) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card indica que Kali-Lite Vision 9B no ha sido entrenado desde cero por Kalicorp y que se apoya en el modelo upstream `Qwen/Qwen3.5-9B`, por lo que cualquier detalle sobre tipo de transformer, mecanismos de atención, número de tokens de entrenamiento, composición del dataset o técnicas de alineamiento (RLHF, DPO) corresponde al modelo base y no se documenta en esta ficha.

La contribución declarada del autor se limita a la capa de configuración: system prompt, doctrina de sistema, Modelfile de Ollama y arnés de ejecución local. Los principios de diseño enunciados son la preferencia por la evidencia frente a la afirmación, la declaración explícita de límites, el control local y la separación clara entre razonamiento y ejecución real de herramientas. No se describe ninguna innovación técnica (decodificación especulativa, atención lineal, MoE, modelos de espacio de estados) ni se aportan cifras de entrenamiento.

## Capacidades

- Generación de texto conversacional en francés e inglés.
- Procesamiento de entrada imagen-texto (`image-text-to-text`): el pipeline declarado es multimodal con soporte de visión.
- Ejecución local mediante Ollama como runtime principal documentado.
- Integración en un arnés de ejecución con separación explícita entre razonamiento y ejecución de herramientas; la disponibilidad real de tool calling depende del arnés y de los permisos configurados, no del modelo en sí.
- Comportamiento guiado por doctrina de sistema: priorización de la evidencia, declaración de límites y control local.
- Capacidades de razonamiento multi-paso o de agente: no confirmadas en la documentación proporcionada.
- Capacidades de código, matemáticas, audio o modo "thinking": no disponibles en la información proporcionada.

## Casos de uso

- Asistente documental en local para extracción de información de imágenes: digitalización de facturas, albaranes o formularios escaneados en una máquina aislada, usando la entrada multimodal y el contexto de 32.768 tokens. Adecuado cuando la política de la organización prohíbe enviar documentos a servicios en la nube.
- Soporte técnico interno con capturas de pantalla: el modelo puede recibir una imagen de un error o de una interfaz y generar una explicación o pasos de diagnóstico en francés o inglés, ejecutándose sobre la estación de trabajo del técnico.
- Triaje y clasificación de imágenes en entornos con requisitos de residencia de datos: sectores público, defensa o industria regulada donde el procesamiento debe permanecer on-premise. La doctrina declarada de "evidencia sobre afirmación" encaja con flujos que exigen justificar cada clasificación.
- Verificación de contenido visual en pipelines de control de calidad: descripción y detección de anomalías en imágenes de producto o de línea de producción, con revisión humana posterior dado el carácter probabilístico de la salida multimodal.
- Asistente de documentación técnica: generación de descripciones textuales de diagramas, esquemas o capturas para incluirlas en manuales, aprovechando el soporte bilingüe francés-inglés.
- Prototipado de agentes locales con ejecución de herramientas: el arnés separa el razonamiento de la ejecución real, lo que permite construir prototipos donde el modelo propone acciones y un componente externo decide si se ejecutan, útil en entornos con permisos restringidos.
- Entornos air-gapped y demostraciones de soberanía tecnológica: despliegue en equipos sin conexión a internet para formación, auditoría o pruebas de concepto de IA local, con el artefacto de ~6,8 GB como unidad de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de `keepstar/Kali-Lite-Vision-9B` no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro conjunto de evaluación, y la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo.

## Requisitos de hardware

- Tamaño del artefacto: aproximadamente 6,8 GB según cuantización y runtime, dato aportado por el autor.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño declarado del artefacto, una cuantización de ~4 bits en torno a 6,8 GB requiere del orden de 8-10 GB de VRAM para dejar margen al codificador de visión y a la caché KV con contexto largo; estas cifras son una estimación propia, no un dato del autor.
- GPU de consumo: el tamaño declarado sugiere que el modelo puede caber en GPU de consumo con 12 GB o más de VRAM en cuantizaciones bajas. No hay confirmación oficial de modelos concretos.
- GPU de centro de datos: para precisión completa o lotes grandes se requerirían aceleradores tipo A100 o H100. No hay cifras oficiales de VRAM ni de rendimiento.
- Opciones de despliegue: Ollama es el runtime principal documentado, con flujo `ollama pull qwen3.5:9b`, `ollama create kali-lite-v2 -f Modelfile` y `ollama run kali-lite-v2`. El soporte de vLLM, llama.cpp, TGI u otros servidores no está confirmado en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación se limita a aspectos estructurales, ya que no existen datos de rendimiento publicados para Kali-Lite Vision 9B. Las cifras del modelo base Qwen3.5-9B no se detallan en la documentación consultada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Kali-Lite Vision 9B | 9B nominales (modelo base) | 32.768 tokens configurados | Mixta: GPL-2.0-only / Apache-2.0 (etiquetada `other`) | HuggingFace, configuración sobre Ollama; 0 descargas registradas | No disponible |
| Qwen/Qwen3.5-9B (modelo base) | 9B nominales | No disponible | Apache-2.0 según la model card | HuggingFace | No disponible |
| Qwen2.5-VL-7B | 7B | 128.000 tokens (según especificación pública del modelo) | Apache-2.0 | HuggingFace, múltiples runtimes | Fuera del alcance de esta ficha |
| Llama 3.2 11B Vision | 11B | 128.000 tokens (según especificación pública del modelo) | Licencia comunitaria de Llama | HuggingFace, múltiples runtimes | Fuera del alcance de esta ficha |

Nota: las filas de Qwen2.5-VL-7B y Llama 3.2 11B Vision se incluyen únicamente como referencia de categoría (modelos multimodales de tamaño medio); no se dispone de una comparación de rendimiento verificada frente a Kali-Lite Vision 9B.

## Limitaciones y advertencias

- La salida multimodal es probabilística y puede ser incorrecta, tal como advierte el propio autor.
- La disponibilidad de herramientas depende del arnés de ejecución y de los permisos concedidos; el modelo no garantiza tool calling por sí solo.
- Un contexto configurado de 32.768 tokens no garantiza un uso fiable de todos los tokens; puede haber degradación en ventanas muy llenas.
- Cobertura idiomática limitada a francés e inglés. No se declara soporte de español ni de otros idiomas.
- Licencia mixta (`mixed-gpl-2.0-only-apache-2.0`, etiquetada como `other`): es imprescindible revisar el aviso de licencia antes de redistribuir pesos o material del repositorio, ya que la GPL-2.0-only puede imponer obligaciones de copyleft incompatibles con determinados usos comerciales propietarios.
- La model card no confirma si se incluyen pesos en el repositorio ni con qué método de cuantización ni suma SHA-256, por lo que la reproducibilidad del artefacto no está garantizada.
- La ejecución local no establece por sí misma cumplimiento del RGPD, del Reglamento Europeo de IA, de directrices de la ANSSI ni de normas ISO, según declara explícitamente el autor.
- Riesgo de sesgos: no disponible. No se documenta ninguna evaluación de sesgos ni de seguridad.
- Ausencia de benchmarks publicados: no es posible validar afirmaciones de calidad o de rendimiento con datos verificables.
- Estado del repositorio: 0 descargas y 0 likes, sin evidencia de adopción ni de mantenimiento posterior por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keepstar/Kali-Lite-Vision-9B
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-9B (derivado de la etiqueta `base_model` de la ficha; no enlazado explícitamente en la model card)
- Repositorio del proyecto: `Kalicorp/kalicorp-kali-lite` en GitHub, citado en la model card como fuente de código y documentación de seguridad. URL completa no disponible.
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Los resultados devueltos corresponden a una marca de calzado ajena al ámbito de la inteligencia artificial y se descartan.
