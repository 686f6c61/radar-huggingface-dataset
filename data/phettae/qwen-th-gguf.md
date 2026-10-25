# Phettae/qwen-th-gguf

## Resumen

Phettae/qwen-th-gguf es un modelo de lenguaje conversacional de tipo decoder-only, publicado únicamente en formato GGUF y derivado de Qwen2.5-3B-Instruct, según se deduce del nombre del único archivo de pesos incluido en el repositorio (`Qwen2.5-3B-Instruct.Q4_K_M.gguf`). El autor, Phettae, lo ha afinado y convertido a GGUF con Unsloth, e incluye un Modelfile de Ollama para facilitar el despliegue. El repositorio no incluye model card técnica detallada: se limita a indicar el proceso de conversión, el archivo disponible y los comandos de uso con `llama-cli`.

El modelo cuenta con 3.085.938.688 parámetros totales (aproximadamente 3,09 mil millones), es de tipo denso (no MoE) y ocupa 1,9 GB en el repositorio, coherente con una cuantización Q4_K_M del peso original en punto flotante. No se declaran ni licencia, ni idiomas soportados, ni pipeline, ni resultados de evaluación.

Su relevancia práctica es la de un modelo pequeño de propósito general, ejecutable en hardware muy modesto (GPU de consumo de gama baja, CPU, incluso dispositivos móviles vía Termux y llama.cpp), orientado a conversación e inferencia local. La opacidad de la ficha (cero descargas, cero likes, sin métricas ni declaración de licencia) obliga a tratarlo como un artefacto experimental y a validar su comportamiento antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (etiqueta `qwen2` en el repo); modelo base Qwen2.5-3B-Instruct |
| Parámetros totales | 3.085.938.688 (~3,09 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en el repositorio; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens (ampliable con YaRN, según su propia ficha) |
| Tipos de cuantización | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible; el sufijo `th` del nombre podría sugerir un ajuste orientado a tailandés, extremo no confirmado por el autor |
| Licencia | no disponible en el repositorio; el modelo base Qwen2.5-3B-Instruct se publica bajo Apache 2.0, pero el fine-tuning no declara licencia propia |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors del modelo afinado |
| Tamaño del repositorio | 1,9 GB |
| Artefactos adicionales | Modelfile de Ollama incluido |
| Compatibilidad declarada | `endpoints_compatible`, `conversational`; uso con `llama-cli` / `llama-mtmd-cli` mediante `--jinja` |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Qwen2.5-3B-Instruct: un transformer decoder-only denso con atención causal, normalización RMSNorm y embeddings RoPE, sin mecanismos de mezcla de expertos. El repositorio no aporta el detalle de configuración (número de capas, dimensión oculta, cabezas de atención ni vocabulario), por lo que esos datos deben consultarse en la ficha del modelo base. El tag `qwen2` confirma la familia arquitectónica; el nombre del archivo GGUF confirma la variante de 3B en su versión Instruct, es decir, ya alineada por instrucciones en origen.

Sobre el entrenamiento no hay información sustantiva: la model card solo indica que el ajuste fino y la conversión a GGUF se realizaron con Unsloth, herramienta que acelera el fine-tuning y la exportación a llama.cpp. No se especifican tokens de entrenamiento, composición del dataset, técnica de alineación (RLHF, DPO, SFT), hiperparámetros, ni si se aplicó alguna innovación técnica adicional (atención lineal, decodificación especulativa, modo de razonamiento). La única innovación documentada es, por tanto, de índole práctica: la disponibilidad inmediata de un GGUF cuantizado Q4_K_M con plantilla de chat compatible con `--jinja` y un Modelfile listo para Ollama.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste por instrucciones de Qwen2.5-3B-Instruct.
- Razonamiento básico y resolución de problemas de complejidad baja o media, acorde a un modelo de ~3 B de parámetros.
- Generación de código y tareas de edición sencillas; sin datos publicados de rendimiento en HumanEval ni similares.
- Capacidad matemática limitada al tamaño del modelo (no hay evaluación publicada de GSM8K).
- Soporte de plantilla de chat Jinja (`--jinja`), lo que permite aplicar el chat template del modelo base en llama.cpp.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su exposición mediante APIs compatibles con OpenAI si se sirve con un runtime adecuado.
- No se declara soporte de tool calling / function calling, ni de agentes, ni de multi-step reasoning explícito.
- No se declara capacidad de visión, audio ni modo de razonamiento (thinking mode); el uso de `llama-mtmd-cli` en la model card es genérico para modelos multimodales y no implica que este modelo lo sea.
- Capacidades multilingües: no disponibles como dato declarado; el modelo base Qwen2.5 es multilingüe, pero el ajuste fino puede haber alterado el equilibrio entre idiomas.

## Casos de uso

- Asistente conversacional local y offline: el modelo puede ejecutarse íntegramente en un portátil o en un móvil Android vía Termux y llama.cpp, sin conexión ni claves de API, lo que lo hace adecuado para escenarios de privacidad estricta donde los datos no pueden salir del dispositivo.
- Prototipado rápido de aplicaciones de chat: con el Modelfile de Ollama incluido, se puede levantar un endpoint conversacional en minutos y validar flujos de producto antes de invertir en modelos mayores.
- Clasificación y extracción de información sobre textos cortos: resumen de correos, etiquetado de tickets o extracción de campos en documentos de una o dos páginas, aprovechando la ventana de contexto del modelo base (32.768 tokens declarados) para incluir varias muestras por llamada.
- Preprocesado y enrutado en pipelines de agentes: usar el modelo como primer nivel de decisión (¿requiere esta consulta un modelo mayor?) para reducir coste y latencia en arquitecturas en cascada.
- Generación de código asistida en entornos con recursos limitados: autocompletado de funciones, generación de tests unitarios simples o explicación de fragmentos, integrable en editores mediante un servidor local compatible con la API de OpenAI.
- Educación y demostraciones: servir el modelo en talleres o aulas donde no hay GPU disponible, mostrando el ciclo completo de cuantización, carga y prompting sin depender de infraestructura cloud.
- Fine-tuning posterior y экспериментación: dado su tamaño (3 B) y su formato GGUF, sirve como banco de pruebas de técnicas de ajuste con Unsloth y de comparación entre cuantizaciones en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones propias (MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra), ni comparaciones con el modelo base, por lo que no es posible cuantificar la degradación o mejora introducida por el fine-tuning respecto a Qwen2.5-3B-Instruct.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,2-3 GB con Q4_K_M, sumando el peso (1,9 GB) y la caché KV para contextos moderados; el consumo exacto depende de la longitud de contexto configurada y del backend.
- Cabe holgadamente en GPU de consumo: GTX 1060 6 GB, GTX 1650 4 GB, RTX 3050 8 GB, RTX 3060 12 GB, RTX 4060, RTX 4090 (sobrada). También en iGPU con memoria compartida y en CPU pura.
- GPU de datacenter (A100, H100, L40S): compatibles pero enormemente sobredimensionadas para 3 B en Q4; solo tienen sentido para servir muchas réplicas concurrentes.
- Ejecución en CPU: viable en x86 moderno y en ARM (incluido Android vía Termux con llama.cpp), con velocidades de decodificación del orden de unidades a decenas de tokens por segundo según núcleos y ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (`llama-cli -hf Phettae/qwen-th-gguf --jinja`), Ollama mediante el Modelfile incluido, LM Studio y otras interfaces basadas en llama.cpp, y `llama-cpp-python` para integración en aplicaciones. vLLM y TGI no son la vía natural para GGUF; si se necesita un servidor de alto rendimiento, lo habitual es partir del modelo base en safetensors.
- Latencia y throughput: no disponible; no hay mediciones publicadas por el autor ni por terceros para este artefacto concreto.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus respectivas fichas públicas, no del repositorio analizado.

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Phettae/qwen-th-gguf | ~3,09 B | no disponible (base: 32.768) | no disponible | GGUF Q4_K_M | Fine-tuning comunitario sin evaluación publicada ni descargas |
| Qwen2.5-3B-Instruct | ~3,09 B | 32.768 (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF | Modelo base original, con ficha completa y métricas publicadas |
| Llama 3.2 3B Instruct | ~3,21 B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Contexto muy superior; licencia con restricciones de uso |
| Phi-3.5-mini-instruct | ~3,8 B | 131.072 | MIT | safetensors, GGUF | Mayor tamaño y contexto largo; licencia permisiva |

La comparación honesta es que este repositorio no aporta ventajas medibles frente a su propio modelo base: mismo tamaño, mismo formato de publicación habitual y sin evidencias de mejora en tareas concretas. Su valor diferencial es la disponibilidad inmediata de un GGUF Q4_K_M con Modelfile de Ollama, algo que el repositorio oficial de Qwen2.5 también ofrece en otras cuantizaciones de la comunidad.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido. Aunque el modelo base sea Apache 2.0, el fine-tuning es una obra derivada y el autor no especifica términos.
- Ficha prácticamente vacía: sin pipeline, sin idiomas, sin evaluación, sin descripción del dataset de ajuste. Cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Riesgo de alucinación elevado en un modelo de ~3 B, especialmente en dominios especializados, datos numéricos y citas de fuentes.
- Posible deriva idiomática: si el ajuste se centró en tailandés (sufijo `th`), el rendimiento en castellano podría haberse degradado respecto al modelo base. No hay datos que lo confirmen ni lo descarten.
- Contexto no verificado en este artefacto: la ventana efectiva depende de la configuración de llama.cpp y de la plantilla; no se garantiza el comportamiento del modelo base en contextos largos tras el fine-tuning.
- Sin soporte declarado de tool calling ni de agentes: no debe asumirse que respete esquemas JSON de funciones sin validación previa.
- Cuantización única (Q4_K_M): no hay opciones de mayor precisión publicadas por el autor, lo que limita los escenarios donde se requiera FP16 o Q8_0.
- El uso de `llama-mtmd-cli` en la model card es plantilla genérica de Unsloth y no implica capacidades multimodales; conviene tratarlo como modelo de solo texto.
- Para producción, cualquier despliegue debería pasar por una evaluación propia en el dominio objetivo y por una revisión legal de la licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Phettae/qwen-th-gguf
- Unsloth (herramienta de fine-tuning y conversión declarada): https://github.com/unslothai/unsloth
- Repositorio relacionado del mismo autor: https://huggingface.co/Phettae/Qwen3.0_6B
- llama.cpp (runtime de inferencia para GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue mediante el Modelfile incluido): https://ollama.com
- Modelo base de referencia (Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
