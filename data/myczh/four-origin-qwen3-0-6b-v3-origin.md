# myczh/four-origin-qwen3-0.6b-v3-origin

## Resumen

4-Origin V3 origin (identificador `myczh/four-origin-qwen3-0.6b-v3-origin`) es un artefacto de investigación publicado por el autor independiente myczh sobre el modelo base Qwen3-0.6B, congelado en la revisión `c1899de289a04d12100db370d81485cdf75e47ca`. No es un modelo nuevo ni un chat generalista: es un adaptador LoRA de rango 8 complementado por un mecanismo de "origen" que consiste en una embedding adicional de cuatro filas cargada en tiempo de ejecución y aplicada antes del transformer. El objetivo declarado del proyecto es estudiar la cualificación de afirmaciones suministradas por el usuario y la trazabilidad del origen de la fuente, no mejorar las capacidades conversacionales del modelo base.

El adaptador se entrenó durante 200 pasos fijos sobre 200 pares (400 muestras) de datos sintéticos generados por los scripts `make-data` del repositorio GitHub del proyecto, sin corpus externo raspado. La tarea aprendida es estrecha: generación de dos frases a partir de dos afirmaciones dadas ("two-claim two-sentence generation"), con `max_new_tokens=96`. El propio autor advierte de que V3 "no es un modelo conversacional general" y de que no se ha establecido ninguna capacidad general antialucinación, de cadenas largas, de autenticación de fuentes ni de producción.

Su relevancia es, por tanto, metodológica: documenta un patrón poco habitual de separación entre pesos del adaptador (PEFT, safetensors) y estado en tiempo de ejecución (`origin_embedding.pt`), con la advertencia explícita de que cargar solo el adaptador PEFT omite el mecanismo de origen y constituye un uso inválido del artefacto. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, y su tamaño reportado es de 0,0 GB, lo que sugiere que los pesos no están completamente alojados o son punteros LFS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) + adaptador LoRA sobre `q_proj` y `v_proj` + embedding de origen de cuatro filas aplicada en tiempo de ejecución antes del transformer |
| Parámetros totales | 0,6 B en el modelo base (Qwen3-0.6B); recuento exacto de parámetros del adaptador no disponible |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la model card; heredada del modelo base Qwen3-0.6B (32.768 tokens según la documentación de Qwen) |
| Tipos de cuantización | no disponible; no se publican pesos GGUF, AWQ, GPTQ ni versiones cuantizadas |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 para adaptador, embedding de origen y código; la prosa de la model card es CC BY 4.0; uso comercial permitido bajo esos términos |
| Formato de pesos | safetensors (`lora/adapter_model.safetensors` + `lora/adapter_config.json`, PEFT) y PyTorch `.pt` (`origin_embedding.pt`) |

Otros datos de la ficha de HuggingFace: pipeline no disponible, etiquetas `safetensors`, `research`, `provenance`, `lora`, `en`, `region:us`; creación el 20 de octubre de 2026 y última actualización el mismo día.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only denso. Sobre él se aplica un adaptador LoRA de rango 8 y alpha 16 en las proyecciones `q_proj` y `v_proj`, entrenado con AdamW a `lr=2e-4`, batch de 2, semilla de inicialización 2026 y precisión base float16 sobre dispositivo MPS (Apple Silicon). El entrenamiento de V3 consistió en 200 pasos fijos con 200 pares y 400 muestras, con semilla 31019 para datos y orden, y generación limitada a 96 tokens nuevos. Los datos son sintéticos, producidos por los scripts del repositorio, y el autor indica que los identificadores de origen y los objetivos de referencia son programáticos y en tiempo de ejecución, no verdad humana independiente.

La innovación técnica del proyecto no está en el transformer sino en el mecanismo de origen: el cargador construye un objeto `OriginModel`, carga el tensor separado con `weights_only=True`, inyecta las embeddings de origen antes del transformer y mantiene identificadores `SELF` durante la decodificación. El adaptador por sí solo no reproduce el comportamiento; es obligatorio usar la función `generate` incluida en el repositorio en lugar del `generate` estándar de PEFT. El proceso de instalación documentado es `python scripts/install_adapter.py PATH_TO_THIS_FOLDER --stage v3 --variant origin`, y la carga en tiempo de ejecución se realiza con `run_v3.load('origin')`. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de dos frases condicionada por dos afirmaciones suministradas explícitamente en el prompt (tarea objetivo de V3).
- Cualificación restringida de afirmaciones aportadas por el usuario, con objetivos de referencia definidos de forma programática.
- Mantenimiento de identificadores `SELF` durante la decodificación como parte del mecanismo de origen.
- Carga de pesos sin ejecución remota de código (`weights_only=True`, `load_adapter.py` local explícito).
- No se ha establecido soporte de tool calling ni function calling.
- No se ha establecido capacidad de agentes ni de razonamiento multi-paso.
- No se ha establecido capacidad multilingüe: la model card declara únicamente inglés.
- No se ha establecido capacidad de visión, audio, matemáticas ni generación de código.
- No se ha establecido ningún modo "thinking" ni decodificación especulativa.
- El uso debe hacerse con el prompt de texto plano del experimento, no con `apply_chat_template`.

## Casos de uso

- Investigación sobre procedencia y atribución de fuentes: el artefacto permite experimentar con la distinción entre texto generado y autoridad de la fuente, inyectando identificadores de origen en lugar de dejar que el modelo los invente.
- Reproducción de experimentos: el repositorio incluye `evidence/origin_generation_v3/config.json`, `results.json` y el informe del experimento, lo que permite reejecutar la evaluación `eval-v3` con las mismas semillas (31019 para datos y orden).
- Estudio de empaquetado de adaptadores PEFT: sirve como caso documentado de adaptador que requiere estado adicional en tiempo de ejecución, útil para quien diseñe formatos de distribución de artefactos.
- Docencia sobre LoRA de bajo rango: con 200 pasos, 200 pares y rango 8, es un ejemplo manejable para explicar el efecto de un adaptador minúsculo sobre un modelo de 0,6 B en hardware de consumo.
- Línea base para experimentos de "el modelo no debe inventar su propia autoridad de fuente": el autor plantea explícitamente esta restricción como parte de la interfaz del artefacto.
- Verificación de cargadores seguros: el script `load_adapter.py` ilustra la carga local de tensores sin `trust_remote_code`, útil como referencia en revisiones de seguridad de pipelines de terceros.
- Evaluación comparativa de etiquetas textuales: la model card señala que las etiquetas de texto son competitivas, lo que permite usar el artefacto como condición de control en estudios de cualificación de afirmaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas cuantitativas de la tarea objetivo. Las únicas afirmaciones cualitativas del autor son que las etiquetas de texto son competitivas y que el mecanismo de origen no presenta una ventaja arquitectónica establecida; además, se indica que los resultados de V4 no son válidos como conclusión final hasta que exista validación humana independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,2 GB para el modelo base en float16 (estimación a partir de 0,6 B de parámetros); el adaptador LoRA ocupa unos pocos MB y `origin_embedding.pt` contiene solo cuatro filas, por lo que su huella es de kilobytes.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente; el entrenamiento original se realizó en MPS (Apple Silicon), lo que indica que no se requiere hardware de datacenter.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y equivalentes; también es viable en CPU para inferencia puntual.
- Opciones de despliegue: no se contemplan vLLM, TGI, llama.cpp ni Ollama, ya que no hay pesos GGUF ni un `pipeline_tag` definido. El despliegue requiere el cargador propio del repositorio GitHub (`run_v3.load('origin')` y la función `generate` incluida).
- Latencia y throughput estimados: no disponibles.
- Advertencia de despliegue: usar `peft` de forma estándar sobre `adapter_model.safetensors` omite el mecanismo de origen y no constituye un uso válido del artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| four-origin V3 origin | 0,6 B (base) + LoRA rango 8 | no especificado (base 32.768) | Adaptador de investigación con estado de origen en runtime | Apache-2.0 (adaptador y código); prosa CC BY 4.0 | No disponible |
| Qwen3-0.6B | 0,6 B | 32.768 | Modelo base denso, chat generalista | Apache-2.0 | No disponible en esta ficha |
| Qwen3-1.7B | 1,7 B | 32.768 | Modelo denso, chat generalista | Apache-2.0 | No disponible en esta ficha |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Modelo denso, instrucciones | Llama 3.2 Community License | No disponible en esta ficha |

La comparación relevante no es de rendimiento sino de propósito: los tres alternativos son modelos generalistas listos para conversación, mientras que four-origin V3 es un artefacto de investigación que solo es válido con su cargador y su prompt de experimento. No se dispone de métricas que permitan situarlo frente a ellos en tareas estándar.

## Limitaciones y advertencias

- No es un modelo conversacional general: V3 aprende únicamente cualificación restringida de afirmaciones suministradas.
- No se ha establecido ninguna capacidad antialucinación general, de razonamiento en cadenas largas, de autenticación de fuentes ni de uso en producción.
- El mecanismo de origen no demuestra una ventaja arquitectónica frente a etiquetas de texto; el propio autor lo califica de competitivo, no superior.
- Los datos de entrenamiento son sintéticos y generados por scripts; los identificadores de origen y los objetivos de referencia son programáticos, no verdad humana independiente.
- Los resultados de V4 se declaran inválidos como conclusión final a la espera de validación humana independiente.
- Cargar solo el adaptador PEFT omite el mecanismo de origen y produce un uso no válido del artefacto; es necesario el cargador del repositorio.
- Idioma limitado a inglés; sin soporte multilingüe declarado.
- Longitud de contexto no especificada para el adaptador; no hay evidencia de que el entrenamiento haya explotado ventanas largas.
- El repositorio reporta 0,0 GB de tamaño y la model card indica que no se incluyen pesos base ni tokenizador, por lo que es imprescindible descargar Qwen3-0.6B en la revisión fijada.
- Licencia: Apache-2.0 cubre adaptador, embedding y código, pero no la prosa de la model card (CC BY 4.0) ni los datos; `LICENSING.md` define los límites y debe consultarse antes de un uso comercial.
- No se implica respaldo de Alibaba Cloud ni de Qwen; los derechos del modelo base son de Alibaba Cloud (2024) y no se encontró NOTICE upstream en esa revisión.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes), sin señales de validación por terceros.
- La búsqueda web realizada no devolvió resultados pertinentes sobre el modelo, por lo que no hay fuentes externas de contraste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myczh/four-origin-qwen3-0.6b-v3-origin
- Repositorio GitHub del proyecto: https://github.com/myczh-1/four-origin
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B (revisión fijada `c1899de289a04d12100db370d81485cdf75e47ca`)
- Referencias internas citadas en la model card: `LICENSING.md`, `LICENSE`, `NOTICE`, `MODIFICATIONS.md`, `data-card.md`, `evidence/origin_generation_v3/config.json`, `evidence/origin_generation_v3/results.json` e informe del experimento (todos dentro del repositorio de HuggingFace y del GitHub del proyecto)
- Búsqueda web: sin resultados relevantes para este modelo; los enlaces devueltos no guardan relación con el artefacto y se han descartado.
