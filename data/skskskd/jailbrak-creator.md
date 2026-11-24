# Skskskd/jailbrak-creator

## Resumen

jailbreak-creator es un ajuste fino (fine-tune) del modelo Qwen2.5-0.5B-Instruct, desarrollado por Hycaro bajo el sello SynastrIA Networks. Su propósito declarado es generar prompts adversarios (jailbreaks) a partir de un objetivo descrito en texto, orientados a la evaluación de la robustez de seguridad de otros modelos de lenguaje. Se trata, por tanto, de una herramienta de red teaming y no de un modelo de propósito general: el autor lo presenta explícitamente como un artefacto para entornos controlados y con autorización sobre el sistema evaluado.

Técnicamente es un transformer causal decoder-only de arquitectura Qwen2 con 494.032.768 parámetros (aproximadamente 0,5B), pesos en BF16 y formato safetensors. Hereda el tokenizador y la plantilla de chat del modelo base, lo que permite aplicar `apply_chat_template` con el formato de conversación de Qwen2.5. El repositorio ocupa 2,0 GB y acumula 329 descargas en Hugging Face.

Su relevancia es acotada pero específica: cubre un nicho poco atendido, la generación automatizada de casos de prueba adversarios en portugués de Brasil (PT-BR), el único idioma declarado en la model card. La información pública sobre datos de entrenamiento, hiperparámetros y evaluación es prácticamente inexistente, y la propia model card deja secciones con marcadores `TODO`, lo que limita seriamente cualquier evaluación de su eficacia real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2, transformer decoder-only causal |
| Parametros totales | 494.032.768 (aproximadamente 0,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | PT-BR (portugués de Brasil), según la model card |
| Licencia | OpenRAIL-M (etiqueta `openrail` en Hugging Face) |
| Formato de pesos | safetensors, BF16 |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Libreria | transformers |
| Tamano del repositorio | 2,0 GB |
| Hardware de entrenamiento | 2x NVIDIA T4 (Kaggle) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only causal con atención completa, sin componentes MoE ni mecanismos híbridos SSM. El ajuste fino se realizó sobre los pesos del modelo instructivo de referencia, y la model card confirma que el tokenizador incluye la plantilla de chat original, de modo que la inferencia debe realizarse con `apply_chat_template` y el rol `user` describiendo el escenario de prueba.

El apartado de entrenamiento está incompleto en la documentación pública: la sección de datos de entrenamiento contiene un `TODO` sin describir origen, tamaño, idioma ni filtrado del dataset, y la sección de procedimiento tampoco especifica si se empleó SFT completo, LoRA u otra técnica, ni épocas, learning rate, batch size o precisión mixta. Lo único documentado es el hardware (2x T4 en Kaggle) y el tipo tensorial de salida (BF16). No consta información sobre RLHF, DPO ni ninguna innovación técnica de decodificación.

## Capacidades

- Generación de texto condicionada a una descripción de escenario: produce candidatos de prompt adversarial a partir de un objetivo en lenguaje natural.
- Generación de prompts de jailbreak orientados a red teaming de LLM y a la evaluación de guardrails y clasificadores de seguridad.
- Construcción de datasets de evaluación de robustez, según el uso previsto declarado por el autor.
- Conversación multi-turno mediante la plantilla de chat heredada de Qwen2.5, con `add_generation_prompt=True`.
- Generación con muestreo configurable (`do_sample`, `temperature`); el ejemplo del autor usa `max_new_tokens=256` y `temperature=0.8`.
- Idioma: PT-BR como idioma declarado; no se documenta soporte multilingüe adicional.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Red teaming automatizado de LLM propios: el modelo genera lotes de prompts adversarios a partir de un objetivo descrito, que se envían al modelo objetivo y cuyas respuestas se clasifican con un juez humano o automático, tal como describe la sección de uso downstream de la model card.
- Evaluación de guardrails y filtros de contenido: los prompts generados sirven como conjunto de prueba para medir la tasa de falsos negativos de clasificadores de seguridad antes de desplegarlos en producción.
- Construcción de datasets de robustez en PT-BR: al ser un modelo entrenado para portugués de Brasil, permite generar casos de prueba en ese idioma, un nicho con menos recursos que el inglés.
- Auditoría de sistemas de terceros con autorización: el modelo encaja en un flujo de pentesting de LLM donde el equipo de seguridad documenta y reporta las vulnerabilidades encontradas a los responsables del sistema.
- Investigación académica sobre alineación y seguridad: generación de corpus adversarios para estudiar la transferibilidad de jailbreaks entre modelos de distinta familia y tamaño.
- Pruebas de regresión de seguridad en CI: integrado en un pipeline que ejecuta un conjunto fijo de objetivos contra cada nueva versión de un modelo desplegado, para detectar degradaciones de robustez entre releases.
- Prototipado de bajo coste: con 0,5B de parámetros y pesos BF16, puede ejecutarse en GPUs de gama media dentro de un entorno aislado, lo que facilita montar un banco de pruebas local sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de eficacia de los jailbreaks generados (por ejemplo, tasa de éxito contra modelos objetivo), ni evaluaciones de calidad lingüística, ni comparaciones cuantitativas con otras herramientas de red teaming.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 1 GB para los pesos (494M parámetros x 2 bytes), más overhead de activaciones y caché KV; con `device_map="auto"` cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entrenó en 2x NVIDIA T4, que es también un objetivo razonable de inferencia.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; también en GPUs de portátil con 6-8 GB.
- Opciones de despliegue: transformers (flujo documentado por el autor) y text-generation-inference (etiqueta `text-generation-inference` en el repositorio). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI más allá de la etiqueta.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jailbreak-creator | 494M | no disponible | Generacion de prompts adversarios (PT-BR) | OpenRAIL-M | Hugging Face |
| Qwen2.5-0.5B-Instruct | 494M | no disponible en esta ficha | Asistente generalista multilingue | Apache 2.0 (modelo base) | Hugging Face |
| Herramientas de red teaming basadas en LLM de mayor tamano (p. ej. variantes de 7B-70B) | 7B-70B | variable | Generacion de ataques y evaluacion de seguridad | variable | variable |

La comparación directa con el modelo base es la más informativa: jailbreak-creator comparte arquitectura y tamaño con Qwen2.5-0.5B-Instruct, pero sustituye el comportamiento de asistente generalista por la generación de prompts adversarios en PT-BR, con una licencia más restrictiva (OpenRAIL-M frente a Apache 2.0 del base). Frente a herramientas de red teaming de mayor tamaño, la principal desventaja es la capacidad del modelo: 0,5B limita la coherencia y la sofisticación de los ataques generados, como admite el propio autor.

## Limitaciones y advertencias

- Modelo de 0,5B: las salidas pueden ser repetitivas, incoherentes o poco eficaces como jailbreaks, según reconoce la model card.
- Genera texto adversarial por diseño: los prompts producidos pueden contener contenido ofensivo o inducir comportamiento inseguro en otros modelos.
- Hereda los sesgos y limitaciones del modelo base Qwen2.5-0.5B-Instruct y de los datos de ajuste fino, que no están documentados.
- No hay garantía de que los jailbreaks generados funcionen contra ningún modelo objetivo concreto.
- Documentación de entrenamiento incompleta: datos, método e hiperparámetros figuran como `TODO`, lo que impide reproducir el ajuste o auditar su procedencia.
- Restricciones de licencia: OpenRAIL-M impone cláusulas de uso responsable; conviene revisar el texto completo antes de cualquier uso comercial o de redistribución.
- El uso previsto exige entorno controlado, autorización explícita sobre el sistema evaluado y revisión humana; no debe exponerse públicamente vía API sin controles.
- El único idioma declarado es PT-BR; no se documenta calidad en castellano ni en otros idiomas.
- La model card enlaza a un repositorio distinto (`SynastriaNetworks/jailbreak-creator`) del ID publicado en Hugging Face (`Skskskd/jailbrak-creator`), lo que genera ambigüedad sobre la fuente canónica.
- Los identificadores de fecha del repositorio (creación en 2026) no son verificables de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Skskskd/jailbrak-creator
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio citado en la model card: https://huggingface.co/SynastriaNetworks/jailbreak-creator
- Organización del autor: https://huggingface.co/SynastriaNetworks
- Paper o demo: no disponible
- Contacto del autor: gustajunq@synastria.dev
