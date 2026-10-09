# mradermacher/GroundGUI-8B-GGUF

## Resumen

GroundGUI-8B-GGUF es el conjunto de cuantizaciones GGUF publicadas por mradermacher sobre el modelo PrentisAI/GroundGUI-8B, un modelo multimodal de 8.190.735.360 parámetros orientado a tareas de GUI grounding y de agente de interfaz gráfica, según las etiquetas del repositorio (gui-agent, gui-grounding, qwen3-vl). El modelo original está desarrollado por PrentisAI y se distribuye bajo licencia Apache-2.0, con inglés como único idioma declarado y entrenamiento asociado al dataset PrentisAI/ScreenRef.

El problema que aborda es la localización de elementos en pantallas (grounding): dado un captura de interfaz y una instrucción en lenguaje natural, el modelo debe identificar la región o elemento relevante para que un agente pueda interactuar con él. Este tipo de modelos es la pieza de percepción de pipelines de automatización de interfaz, agentes de navegador y sistemas RPA, donde el cuello de botella habitual es convertir instrucciones abstractas en coordenadas o referencias concretas sobre la pantalla.

Esta ficha describe el repositorio de cuantizaciones, no el modelo original: mradermacher solo publica pesos convertidos a GGUF para su ejecución con llama.cpp y derivados. La información disponible no incluye detalles de arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language); el repositorio etiqueta el modelo como qwen3-vl. Detalles de capas, atención y configuración no disponibles |
| Parámetros totales | 8.190.735.360 (dato de safetensors del modelo base) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 para la torre de visión |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (un archivo por cuantización; el componente multimodal se distribuye como mmproj aparte) |
| Modelo base | PrentisAI/GroundGUI-8B |
| Dataset declarado | PrentisAI/ScreenRef |
| Tamaño del repositorio | 75,3 GB (suma de todas las cuantizaciones) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La model card del repositorio de cuantizaciones no aporta información sobre la arquitectura interna del modelo original, más allá de la etiqueta qwen3-vl, que sitúa la torre de lenguaje en la familia Qwen3 y añade un codificador visual para entrada de imágenes. Se trata, por tanto, de un modelo vision-language denso de aproximadamente 8,19 mil millones de parámetros que recibe capturas de pantalla junto con texto y produce respuestas conversacionales orientadas a grounding y control de interfaz.

Tampoco se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset PrentisAI/ScreenRef ni si hubo fases de ajuste por instrucciones, RLHF o DPO. El repositorio de mradermacher es exclusivamente de conversión de pesos: no incluye entrenamiento, ni fine-tuning, ni modificaciones sobre el modelo base. Las cuantizaciones se han generado como "static quants" (según la propia model card, no había cuantizaciones ponderadas con imatrix disponibles en el momento de la publicación), manteniendo el vocabulario y la configuración de arquitectura del modelo original para su carga en llama.cpp.

## Capacidades

- Comprensión de capturas de pantalla: procesa imágenes de interfaz gráfica combinadas con instrucciones de texto, gracias a la torre de visión incluida en el mmproj.
- GUI grounding: localización de elementos de interfaz (botones, campos, iconos, enlaces) a partir de una descripción en lenguaje natural, que es la tarea declarada del modelo.
- Agente de GUI: participación en bucles de interacción con interfaces gráficas, según la etiqueta gui-agent del repositorio.
- Generación de texto conversacional: el repositorio se marca como conversational, con plantilla de chat compatible con transformers y llama.cpp.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Tool calling / function calling: no disponible en la información consultada.
- Razonamiento multi-paso explícito o modo thinking: no disponible.
- Salidas estructuradas (JSON con coordenadas, formatos tipo point/bbox): no disponible en la documentación; debe verificarse contra el modelo base.

## Casos de uso

- Automatización de pruebas de interfaz: el modelo recibe una captura de la aplicación y una instrucción del tipo "pulsa el botón de guardar del formulario", devuelve la ubicación del elemento y un driver de Selenium o Playwright ejecuta la acción. Es adecuado porque su tarea principal es precisamente el grounding sobre capturas reales.
- Agentes de navegador web: integrado en un bucle de percepción-acción, permite a un agente decidir sobre qué elemento hacer clic en cada paso a partir de la pantalla renderizada, sin depender de selectores CSS frágiles que se rompen con cada rediseño.
- RPA sobre aplicaciones de escritorio: sustituye a la automatización basada en coordenadas fijas o en árboles de accesibilidad incompletos, identificando controles por descripción semántica en aplicaciones heredadas donde el DOM o la API de accesibilidad no está disponible.
- Soporte técnico asistido: un operador describe el problema del usuario ("el cliente no encuentra el campo de facturación"); el modelo localiza el elemento en la captura que envía el usuario y genera instrucciones paso a paso señalando dónde debe pulsar.
- Automatización de procesos internos en empresa: extracción y accionamiento sobre paneles de administración, ERP o herramientas internas, ejecutando tareas repetitivas de introducción de datos guiadas por lenguaje natural.
- Evaluación y auditoría de accesibilidad: localizar elementos que no tienen etiqueta accesible o cuyo texto no coincide con su función, generando un inventario de controles problemáticos a partir de capturas.
- Entrenamiento de datos sintéticos: usar el modelo para etiquetar elementos en capturas y producir conjuntos de datos de grounding para ajustar modelos más pequeños, dado que la licencia Apache-2.0 permite uso comercial y derivados.
- Despliegue local con requisitos de privacidad: al distribuirse en GGUF, puede ejecutarse en hardware propio sin enviar capturas de pantalla a servicios externos, lo que encaja en entornos con datos sensibles de clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye métricas de grounding (por ejemplo, precisión de acierto en pantalla), ni resultados en MMLU, GSM8K, HumanEval o suites específicas de GUI. Tampoco hay datos de evaluación comparativa del modelo base PrentisAI/GroundGUI-8B en el material consultado.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones a partir del tamaño de los archivos GGUF publicados, más el mmproj de visión y el espacio para caché KV, que depende de la longitud de contexto (no documentada).

- Q2_K: 3,4 GB de pesos; unos 5-6 GB de VRAM con mmproj-Q8_0 y contexto moderado.
- Q3_K_S / Q3_K_M / Q3_K_L: 3,9 / 4,2 / 4,5 GB; aproximadamente 6-7 GB de VRAM en total.
- IQ4_XS / Q4_K_S / Q4_K_M: 4,7 / 4,9 / 5,1 GB; aproximadamente 7-8 GB de VRAM con mmproj-f16. Es el rango recomendado por el autor para equilibrio velocidad/calidad (Q4_K_S y Q4_K_M marcadas como "fast, recommended").
- Q5_K_S / Q5_K_M: 5,8 / 6,0 GB; aproximadamente 8-9 GB de VRAM.
- Q6_K: 6,8 GB; aproximadamente 9-10 GB de VRAM.
- Q8_0: 8,8 GB; aproximadamente 11-12 GB de VRAM.
- f16: 16,5 GB; aproximadamente 19-20 GB de VRAM. El autor lo describe como "overkill".
- mmproj: 0,9 GB (Q8_0) o 1,3 GB (f16). Es imprescindible cargarlo para tareas de visión; sin él solo funciona la parte de texto.
- GPU consumer: los cuantizados de 4 y 5 bits caben en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 3080). Las variantes Q8_0 y f16 requieren GPUs de 16-24 GB (RTX 4090, A5000, L4 con 24 GB).
- GPU de centro de datos: A100 40/80 GB, H100 y L40S pueden ejecutar cualquier cuantización con margen amplio y lotes grandes.
- Despliegue: llama.cpp y sus derivados (llama-server, Ollama, LM Studio, kobold.cpp) son la vía natural para GGUF con visión, cargando el archivo de pesos y el mmproj. vLLM y TGI trabajan preferentemente con el modelo base en safetensors, no con estos GGUF.
- Latencia y throughput: no disponibles. Dependen de la cuantización, la GPU y si se procesan imágenes en cada turno, que es el coste dominante en modelos vision-language.

## Comparativa con modelos similares

No hay datos comparativos de rendimiento disponibles para este modelo. Como referencia de repositorios relacionados encontrados, sin datos de benchmarks que permitan una comparación cuantitativa:

| Modelo | Desarrollador / cuantizador | Tamaño | Tarea declarada | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| GroundGUI-8B (este, vía mradermacher) | PrentisAI / mradermacher | 8,19 B | GUI grounding y agente de GUI | apache-2.0 | no disponible |
| MemGUI-8B-RL | mradermacher (cuantización) | clase 8B (basado en qwen3-vl) | agente de GUI móvil con memoria | apache-2.0 | no disponible |
| SpatialCLI-8B-i1 | mradermacher (cuantización) | clase 8B | no disponible | no disponible | no disponible |
| Modelo base PrentisAI/GroundGUI-8B | PrentisAI | 8,19 B | GUI grounding | apache-2.0 | misma arquitectura, sin cuantizar |

## Limitaciones y advertencias

- No se han publicado benchmarks: no hay evidencia cuantitativa en la información disponible sobre la precisión de grounding ni sobre el comportamiento en producción.
- Riesgo de alucinación de elementos: en grounding, un error típico es devolver coordenadas plausibles para elementos que no existen o que están ocultos en la captura; conviene validar la acción antes de ejecutarla sobre un sistema real.
- Idioma: solo inglés declarado. Las instrucciones en castellano pueden degradar el rendimiento o producir respuestas inconsistentes.
- Longitud de contexto no documentada: no es posible planificar conversaciones de agente largas ni saber cuántas capturas previas caben en la ventana.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar desproporcionadamente tareas espaciales, donde pequeñas pérdidas de precisión numérica se traducen en clics en el elemento equivocado. El propio autor marca Q3_K_M como "lower quality".
- Dependencia del mmproj: si se despliega solo el archivo de pesos sin el mmproj correspondiente, el modelo no procesa imágenes y la tarea principal queda inutilizable.
- Licencia: el repositorio de cuantizaciones declara apache-2.0, que permite uso comercial y modificaciones; conviene verificar de forma independiente la licencia y condiciones del modelo base PrentisAI/GroundGUI-8B antes de un despliegue comercial.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, y fecha de creación posterior a la mayoría del material de referencia consultado; no hay reportes de terceros sobre su comportamiento real.
- No apto para acciones irreversibles sin supervisión: en flujos de agente sobre interfaces reales (pagos, borrado de datos, envío de formularios) debe mantenerse validación humana o restricciones de acción.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/GroundGUI-8B-GGUF
- Modelo base: https://huggingface.co/PrentisAI/GroundGUI-8B
- Dataset declarado: https://huggingface.co/datasets/PrentisAI/ScreenRef
- Página de resumen de cuantizaciones del autor: https://hf.tst.eu/model#GroundGUI-8B-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF referenciada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de perplejidad entre tipos de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que soporta al cuantizador: https://www.nethype.de/
- Repositorio relacionado (MemGUI-8B-RL-GGUF): https://huggingface.co/mradermacher/MemGUI-8B-RL-GGUF
- Repositorio relacionado (SpatialCLI-8B-i1-GGUF): https://huggingface.co/mradermacher/SpatialCLI-8B-i1-GGUF
