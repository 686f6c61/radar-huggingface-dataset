# ggml-org/Clef-GGUF

## Resumen

Clef-GGUF es la version cuantizada en formato GGUF del modelo Cloudflare/clef, publicada por el repositorio ggml-org dentro del ecosistema de llama.cpp. Se trata de un «decision model» (modelo de decision) disenado para su uso a traves de un endpoint concreto, `/v1/systemone`, lo que lo aleja de los LLM generativos convencionales: su funcion declarada es la clasificacion zero-shot y la toma de decisiones, no la generacion libre de texto.

El modelo cuenta con aproximadamente 27.024 millones de parametros (unos 27B) y licencia Apache 2.0. Al publicarse en formato GGUF con pesos cuantizados, esta pensado para ejecutarse localmente mediante llama.cpp y herramientas compatibles, con un peso de repositorio de 102 GB que apunta a la presencia de varias cuantizaciones. Segun la propia model card, se lanza con `llama serve -hf ggml-org/Clef-GGUF` y requiere una version concreta de llama.cpp (PR 29831).

La relevancia de esta ficha es doble: por un lado documenta la conversion automatica de un modelo de Cloudflare a GGUF; por otro, introduce un patron de uso poco habitual (API `/v1/systemone`) que conviene entender antes de integrarlo en produccion. La informacion publica disponible es muy escasa y buena parte de los parametros tecnicos no esta especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Cloudflare/clef) |
| Parametros totales | 27.024.054.788 (~27B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (tipos concretos no disponibles) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de la arquitectura exacta. El dato confirmado es que se trata de una conversion a GGUF del modelo Cloudflare/clef, generada de forma automatica con la herramienta https://github.com/ggml-org/convert. La pipeline declarada es `zero-shot-classification` y la etiqueta `decision-model`, lo que apunta a un modelo orientado a decidir entre opciones o clasificar entradas, mas que a la generacion de texto abierto.

No hay informacion publica sobre datos de entrenamiento, numero de tokens, composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones del tipo decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Clasificacion zero-shot de texto (etiqueta de pipeline `zero-shot-classification`).
- Toma de decisiones como «decision model».
- Exposicion mediante la API `/v1/systemone` en lugar de una interfaz de chat generativa estandar.
- Etiqueta `conversational` en los tags del repositorio, aunque la funcion principal declarada no es la generacion.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de codigo, matematicas, vision, audio, tool calling ni agentes.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo puede asignar automaticamente una categoria o prioridad a cada incidencia mediante clasificacion zero-shot, sin necesidad de reentrenar para cada taxonomia nueva.
- Enrutado de consultas en atencion al cliente: decidir a que cola, departamento o flujo debe dirigirse una peticion entrante, aprovechando su naturaleza de modelo de decision.
- Moderacion de contenido ligera: clasificar texto entrante en categorias predefinidas (permitido, revisar, bloqueado) usando la pipeline zero-shot, con validacion humana en los casos dudosos.
- Etiquetado de datos para pipelines de ML: preclasificar grandes volumenes de texto no etiquetado antes de una revision manual, reduciendo el coste del etiquetado.
- Triaje de correos o mensajes: decidir si un mensaje requiere respuesta inmediata, seguimiento o archivo, integrándolo en un backend que consuma `/v1/systemone`.
- Sistemas de decision con reglas externas: usar el modelo como componente de clasificacion dentro de un motor de reglas de negocio, dejando la logica final a la capa de aplicacion.
- Despliegue local con requisitos de privacidad: al ejecutarse via llama.cpp en formato GGUF, permite clasificar datos sensibles sin enviarlos a servicios en la nube, sujeto a la validacion previa del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de ~27B parametros, no confirmadas por el autor):
  - FP16/BF16: ~54 GB.
  - Q8_0: ~28-30 GB.
  - Q6_K: ~22-23 GB.
  - Q5_K_M: ~19-20 GB.
  - Q4_K_M: ~16-17 GB.
  - Q3_K_M: ~13-14 GB.
  - Q2_K: ~10-11 GB.
- GPU recomendadas:
  - Consumidor: RTX 4090 (24 GB) o RTX 3090 (24 GB), suficientes para cuantizaciones Q4 y Q5.
  - Multi-GPU consumidor: dos o mas GPU de 24 GB para Q8 o FP16.
  - Empresarial: A100 80 GB o H100 80 GB para FP16 o cuantizaciones altas con contexto largo.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con cuantizaciones Q4/Q5; en 16 GB solo con cuantizaciones muy agresivas (Q2/Q3) y con posible perdida de calidad.
- Opciones de despliegue: llama.cpp y llama.app (documentados por el autor), Ollama, LM Studio y otros motores compatibles con GGUF. La API `/v1/systemone` exige la version de llama.cpp del PR 29831.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos estrictamente comparables en la misma categoria funcional (modelo de decision y clasificacion zero-shot). A modo de referencia por tamano, se incluyen modelos generativos de rango similar:

| Modelo | Parametros | Contexto | Licencia | Categoria |
|---|---|---|---|---|
| Clef-GGUF | ~27B | no disponible | Apache 2.0 | decision / zero-shot |
| Gemma 2 27B | 27B | 8.192 | licencia Gemma | generativo |
| Qwen2.5-32B | 32,5B | 131.072 | Apache 2.0 | generativo |
| Mistral Small 24B | 24B | 32.768 | Apache 2.0 | generativo |

Nota: la comparacion es solo orientativa en cuanto a tamano de parametros y licencia; la categoria funcional del modelo (clasificacion y decision) difiere de la de los modelos generativos de la tabla, y no se dispone de datos de rendimiento para contrastar.

## Limitaciones y advertencias

- Informacion publica muy limitada: no hay datos de arquitectura, contexto, idiomas ni entrenamiento, lo que dificulta evaluar su idoneidad en produccion.
- Requiere la version de llama.cpp incluida en el PR 29831 para el endpoint `/v1/systemone`; otras versiones o motores podrian no ser compatibles.
- No es un modelo generativo estandar: usarlo como chatbot o generador de texto puede dar resultados inesperados.
- Idiomas soportados no disponibles; no se puede garantizar un rendimiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados por el autor.
- Licencia Apache 2.0 en la conversion, pero conviene verificar la licencia y condiciones del modelo base Cloudflare/clef antes de un uso comercial.
- Ausencia de benchmarks publicos: imposible comparar su calidad objetiva frente a alternativas.
- Fecha de creacion registrada como 2026-10-02, lo que resulta atipica y conviene contrastar con el repositorio original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ggml-org/Clef-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef
- Herramienta de conversion: https://github.com/ggml-org/convert
- Pull request de llama.cpp requerido: https://github.com/ggml-org/llama.cpp/pull/29831
- Interfaz de ejecucion mencionada: https://llama.app
