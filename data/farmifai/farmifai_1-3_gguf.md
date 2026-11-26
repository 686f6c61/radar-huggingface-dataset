# FarmifAI/FarmifAI_1.3_GGUF

## Resumen

FarmifAI 1.3 (GGUF) es la versión cuantizada del modelo FarmifAI 1.3, un modelo de lenguaje pequeño (SLM) afinado a partir de Qwen3.5-0.8B y orientado exclusivamente a responder preguntas agrícolas en español a partir de un contexto recuperado. Lo desarrolla FarmifAI y alimenta su aplicación móvil de asistencia offline para agricultores colombianos. Con 772.845.888 parámetros totales, su interés radica en que demuestra que un modelo por debajo de los 1.000 millones de parámetros puede ejecutarse en un teléfono móvil sin conexión y producir respuestas ancladas a una base de conocimiento.

El modelo no es un chatbot de propósito general: está entrenado para trabajar en un pipeline de recuperación aumentada (RAG), de modo que la respuesta debe extraerse del bloque `<knowledge>` que se le inyecta y, si la información no está ahí, declarar que no la tiene. Esta restricción explícita reduce el riesgo de alucinación en dominios sensibles como el fitosanitario, aunque no lo elimina por completo.

La relevancia actual es doble. Por un lado, el despliegue en llama.cpp y herramientas compatibles (Ollama, LM Studio) con cuantizaciones de 542 MB a 1,56 GB permite inferencia en hardware muy modesto, incluidos dispositivos Android. Por otro, la licencia Apache 2.0 y el formato GGUF facilitan su integración en productos y en investigación sin fricción legal ni dependencia de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-0.8B); incluye proyector de visión mmproj en BF16 |
| Parametros totales | 772.845.888 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (542 MB), Q5_K_M (593 MB), Q8_0 (834 MB), F16 (1,56 GB), BF16 para el proyector de visión |
| Idiomas soportados | Español (etiqueta `language: es` en la model card); otros idiomas no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en formato de precisión completa, no especificado en la información disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only derivado de Qwen3.5-0.8B, con 772.845.888 parámetros en precisión completa. El repositorio incluye además un proyector de visión en BF16 (`FarmifAI_1.3.BF16_mmproj.gguf`), heredado presumiblemente del modelo base multimodal, aunque la model card indica explícitamente que no es necesario para uso textual y recomienda lanzar llama.cpp con `--no-mmproj`.

El ajuste fino se realizó con Unsloth sobre el dataset `FarmifAI/FarmifAI_dataset_1.3`, que no está descrito en detalle en la información disponible (número de tokens, composición y proporción de ejemplos sintéticos no disponibles). El entrenamiento sigue un formato conversacional muy rígido: un system prompt fijo en español que obliga a razonar el contexto dentro de `<reasoning>` y a emitir la respuesta final dentro de `<answer>`, con instrucción explícita de no inventar datos cuando la respuesta no aparezca en el contexto. No se documenta en la información proporcionada si hubo RLHF, DPO u otra etapa de alineación posterior al ajuste supervisado.

La innovación técnica destacable no está en la arquitectura, sino en el diseño del prompt y del dataset: el modelo está condicionado para producir una traza de razonamiento separada de la respuesta final, lo que facilita el parseo defensivo en aplicaciones móviles y permite mostrar solo el bloque `<answer>` al usuario. La conversión a GGUF con Unsloth cubre cinco variantes de cuantización, desde 4 bits hasta precisión completa.

## Capacidades

- Generación de texto en español con formato estructurado de razonamiento (`<reasoning>`) y respuesta (`<answer>`).
- Respuesta anclada a contexto (grounded QA): extrae la información del bloque `<knowledge>` inyectado por el recuperador.
- Declaración explícita de ausencia de información cuando el contexto no cubre la pregunta, por entrenamiento explícito.
- Dominio especializado en agricultura colombiana: cultivos, plagas, enfermedades, manejo agronómico y recomendaciones de campo.
- Ejecución offline y on-device: pensado para funcionar sin conectividad en dispositivos móviles.
- Integración con pipelines RAG: el modelo asume que la recuperación la hace un sistema externo, no él.
- Compatibilidad con la API OpenAI a través de `llama-server` (`/v1/chat/completions`).
- Soporte de plantilla Jinja (`--jinja`) para el formateo de chat.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión operativa en texto ni audio en la información disponible.

## Casos de uso

- Asistencia agrícola offline en campo: la aplicación FarmifAI empaqueta el modelo Q4_K_M (542 MB) junto con una base de conocimiento local y responde consultas de agricultores sin cobertura de red, usando el contexto recuperado en el propio dispositivo.
- Control fitosanitario guiado: ante una pregunta como la del ejemplo de la model card ("¿Cómo puedo controlar la broca en mi cultivo de café?"), el sistema recupera pasajes de una base agronómica y el modelo sintetiza la respuesta citando únicamente ese contexto, lo que permite auditar la fuente.
- Extensión a nuevas regiones o cultivos mediante RAG: al no requerir reentrenamiento para cambiar el corpus, una cooperativa puede sustituir la base de conocimiento por documentación local (por ejemplo, normativa de una región distinta) y reutilizar el mismo GGUF.
- Chatbot de atención en puntos de venta de insumos agrícolas: con temperatura 0,1 y 512 tokens máximos de salida, el modelo produce respuestas cortas y deterministas aptas para mostrador o terminal ligera.
- Investigación sobre SLM en dominios restringidos: sirve como línea base reproducible (Apache 2.0, 772 M parámetros, formato GGUF) para estudiar fidelidad al contexto, tasas de abstención y calidad del razonamiento en modelos sub-1B.
- Despliegue en hardware de bajo consumo: con Q4_K_M o Q5_K_M cabe en dispositivos con poca RAM y se sirve con `llama-server` o `ollama run hf.co/FarmifAI/FarmifAI_1.3_GGUF:Q4_K_M`, lo que habilita prototipos en Raspberry Pi o portátiles sin GPU.
- Filtrado y resumen de documentación técnica agraria: el bloque `<reasoning>` puede registrarse para depuración del pipeline RAG y para evaluar si el recuperador está aportando pasajes relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio del modelo en precisión completa (`FarmifAI/FarmifAI_1.3`) para consultar "training details and results", pero esos resultados no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,6 GB con Q4_K_M, 0,7 GB con Q5_K_M, 1,0 GB con Q8_0 y 1,8 GB con F16, sumando el overhead del runtime de llama.cpp.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o más (RTX 3050, RTX 4060, RTX 4090) ejecuta cualquiera de las cuantizaciones sin problemas; también en iGPU y CPU.
- Despliegue en móvil y dispositivos embebidos: es el objetivo declarado del proyecto; la variante Q4_K_M de 542 MB está pensada para dispositivos con RAM limitada.
- Opciones de despliegue: `llama-server` (con `--jinja --no-mmproj`), Ollama (`ollama run hf.co/FarmifAI/FarmifAI_1.3_GGUF:Q4_K_M`), LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la información disponible para este repositorio.
- GPUs de datacenter (A100, H100) no aportan ventaja relevante por el tamaño del modelo; el cuello de botella es la latencia de red y el recuperador, no el cómputo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| FarmifAI 1.3 GGUF | 772.845.888 | No disponible | Apache 2.0 | GGUF | RAG agrícola en español, on-device |
| Qwen3.5-0.8B (base) | ~0,8 B | No disponible en la información | No disponible en la información | Safetensors y derivados | Modelo generalista del que deriva |
| FarmifAI 1.3 (precisión completa) | 772.845.888 | No disponible | Apache 2.0 | No especificado | Mismo modelo sin cuantizar, con detalles de entrenamiento |

No se dispone de datos de benchmarks ni de especificaciones de contexto de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El propio autor advierte que el modelo puede cometer errores o añadir detalles que no están en el contexto; las recomendaciones sobre agroquímicos, dosis y plazos de seguridad deben verificarse y no sustituyen el consejo profesional.
- La calidad de la respuesta depende directamente de la calidad del contexto recuperado: un recuperador deficiente degrada la salida aunque el modelo sea correcto.
- Sin el system prompt exacto de entrenamiento, el modelo no sigue el formato esperado de `<reasoning>`/`<answer>`; en Ollama y LM Studio hay que configurarlo manualmente.
- El parseo de las etiquetas debe hacerse de forma defensiva, ya que el modelo puede omitirlas.
- Modelo de dominio restringido: no es un chatbot de propósito general y su uso fuera del ámbito agrícola en español no está validado.
- Idiomas: solo se declara español; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto no documentada, lo que impide planificar el tamaño de los pasajes recuperados con precisión.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar sesgos derivados del corpus colombiano y del dataset de ajuste.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; no se especifican restricciones adicionales.
- El proyector de visión incluido no debe interpretarse como capacidad multimodal validada para texto; la model card recomienda desactivarlo.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/FarmifAI/FarmifAI_1.3_GGUF
- Modelo en precisión completa: https://huggingface.co/FarmifAI/FarmifAI_1.3
- Dataset de ajuste: https://huggingface.co/datasets/FarmifAI/FarmifAI_dataset_1.3
- Unsloth (herramienta de ajuste y conversión): https://github.com/unslothai/unsloth
