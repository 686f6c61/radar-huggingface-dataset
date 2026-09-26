# niansia/yuki-qwen2.5-1.5b-q4f16_1-MLC

## Resumen

Yuki es un ajuste fino (fine-tune) mediante QLoRA de Qwen2.5-1.5B-Instruct, publicado por el usuario niansia como complemento conversacional de su portfolio personal (niansia.github.io). El modelo está diseñado para un propósito muy acotado: responder preguntas sobre la información que el autor coloca en el system prompt, rechazar cualquier consulta que no esté cubierta por ese prompt y emitir líneas `@command` de una lista blanca que controlan la propia página web. No es un modelo de propósito general, sino un asistente de dominio cerrado.

El repositorio contiene los pesos ya cuantizados a 4 bits en formato `q4f16_1` para MLC-LLM, de forma que el modelo se ejecuta íntegramente en el navegador mediante WebGPU a través de WebLLM, sin necesidad de servidor. Para ello reutiliza la librería precompilada `Qwen2-1.5B-Instruct-q4f16_1` de MLC.

Con 1.500 millones de parámetros y un tamaño de repositorio de 0,9 GB, Yuki apunta a un nicho muy concreto: demos de inferencia local en el navegador, asistentes embebidos en webs estáticas y experimentos de control de interfaz por lenguaje natural. Su relevancia es limitada fuera de ese escenario, ya que no se han publicado benchmarks ni métricas de calidad propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | q4f16_1 (4 bits, formato MLC) |
| Idiomas soportados | Chino (zh) e ingles (en), segun los tags del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefactos compilados de MLC-LLM (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.500 millones de parámetros con atención causal estándar. Sobre esa base se aplicó un ajuste fino con QLoRA (cuantización de 4 bits más adaptadores de bajo rango), orientado a tres comportamientos: responder sobre el contenido inyectado en el system prompt, negarse a responder cuando la información no está en dicho prompt y emitir comandos `@command` restringidos a una lista blanca.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El código de entrenamiento se encuentra, según el autor, en `tools/llm/` del repositorio del sitio web. Tras el ajuste, los pesos se cuantizaron a `q4f16_1` y se compilaron para MLC-LLM/WebLLM, lo que permite ejecutarlos con WebGPU en el navegador reutilizando la librería precompilada de Qwen2-1.5B-Instruct.

## Capacidades

- Generación de texto conversacional en chino e ingles.
- Respuesta a preguntas sobre el contenido del portfolio inyectado en el system prompt.
- Comportamiento de rechazo explícito ante consultas no cubiertas por el system prompt.
- Emisión de líneas `@command` de una lista blanca para controlar la página web anfitriona (navegación y acciones de interfaz).
- Ejecución local en navegador con WebGPU mediante WebLLM, sin backend ni API externa.
- No hay evidencia de soporte de tool calling estándar (formato OpenAI/JSON Schema), visión, audio ni modo de razonamiento explícito.
- No hay evidencia de capacidades de agente multi-paso ni de uso de herramientas externas más allá del protocolo `@command` propio.

## Casos de uso

- Asistente embebido en portfolio web: es el caso para el que fue entrenado; responde sobre la trayectoria y proyectos del autor y rechaza preguntas fuera de ese ámbito, todo ejecutándose en el navegador del visitante.
- Control de interfaz por lenguaje natural: las líneas `@command` de lista blanca permiten traducir instrucciones del usuario en acciones concretas sobre la página (cambiar de sección, abrir un panel), sin acceso a APIs arbitrarias.
- Demo de inferencia local con WebGPU: sirve como ejemplo reproducible de despliegue de un modelo de 1.5B cuantizado a 4 bits en el navegador mediante WebLLM y MLC-LLM.
- Chatbot de documentación de alcance cerrado: replicando la receta con otro system prompt, se puede construir un asistente que solo responda sobre un manual o base de conocimiento fija y rechace el resto.
- Asistente offline en dispositivos de baja potencia: al requerir aproximadamente 1 GB de memoria y no necesitar GPU dedicada, puede funcionar en portátiles e incluso en algunos móviles compatibles con WebGPU.
- Prototipo de agente web con protocolo de comandos restringido: útil para experimentar con control de UI mediante un lenguaje de comandos validado por lista blanca.
- Plantilla de fine-tune QLoRA de dominio: la receta (QLoRA + cuantización MLC + WebLLM) se puede reutilizar para adaptar modelos pequeños a tareas muy concretas con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB con cuantización q4f16_1 (el repositorio completo ocupa 0,9 GB).
- GPU recomendadas: no se especifican; el modelo está pensado para ejecutarse sobre WebGPU, por lo que basta con una GPU integrada o dedicada compatible con WebGPU.
- Cabe en GPU de consumo: sí, es uno de sus objetivos de diseño; está orientado a equipos de gama baja y entornos sin GPU dedicada.
- Opciones de despliegue: WebLLM y MLC-LLM; no se proporcionan artefactos GGUF ni safetensors en este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de despliegue |
|---|---|---|---|---|
| Yuki (este modelo) | 1.5B | No disponible (base: 32.768 tokens) | Apache 2.0 | MLC / WebLLM (q4f16_1) |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF, MLC y otros |
| Otros instruct de ~1-2B (por ejemplo Llama 3.2 1B Instruct o Gemma 2 2B Instruct) | 1-2B | Variable segun modelo | Licencias propias de cada modelo | Multiples |

Nota: los datos del modelo base y de las alternativas provienen de su documentación pública y deben verificarse en sus fichas oficiales; la información proporcionada sobre Yuki no incluye comparativas ni métricas.

## Limitaciones y advertencias

- Modelo de dominio cerrado: está entrenado para responder solo sobre el contenido del system prompt del portfolio y para rechazar el resto, por lo que su utilidad general es muy limitada.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad, y un modelo de 1.5B puede generar respuestas plausibles pero incorrectas si el prompt no acota bien el contenido.
- Idiomas: los tags solo declaran chino e ingles; el comportamiento en castellano no está garantizado ni evaluado.
- Contexto: la model card no confirma la longitud de contexto efectiva tras el ajuste ni tras la cuantización.
- Formato propietario de despliegue: los pesos solo están en formato MLC compilado, lo que dificulta su uso con otras herramientas como llama.cpp, vLLM o TGI.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene revisar también los términos del modelo base y el cumplimiento de la licencia de MLC/WebLLM.
- Cero adopción registrada: el repositorio figura con 0 descargas y 0 likes, por lo que no hay validación externa de su comportamiento.
- El protocolo `@command` controla la página anfitriona; cualquier integración en producción debe validar y sanear esos comandos para evitar efectos no deseados en la interfaz.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/niansia/yuki-qwen2.5-1.5b-q4f16_1-MLC
- Sitio del autor: https://niansia.github.io
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Librería precompilada de referencia en MLC: Qwen2-1.5B-Instruct-q4f16_1 (repositorio MLC-LLM)
- Código de entrenamiento: `tools/llm/` en el repositorio del sitio del autor (no se proporciona URL directa)
