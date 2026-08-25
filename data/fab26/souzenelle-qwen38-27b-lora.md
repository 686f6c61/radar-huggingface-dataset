# Fab26/souzenelle-qwen38-27b-lora

## Resumen

El modelo `Fab26/souzenelle-qwen38-27b-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Fab26, obtenido mediante fine-tuning del modelo base `unsloth/Qwen3.8-27B`, una versión optimizada del modelo Qwen3.8-27B de Alibaba. Este adaptador se ha entrenado con las librerías Unsloth y TRL, lo que permite un fine-tuning más rápido y eficiente en memoria respecto a métodos convencionales.

El modelo base Qwen3.8-27B es un modelo denso de 27 mil millones de parámetros con arquitectura híbrida: combina atención lineal en 48 de sus 64 capas, incorpora una torre de visión y un cabezal de decodificación especulativa (MTP). Dispone de una ventana de contexto nativa de 262 000 tokens, extensible hasta 1 millón. El adaptador LoRA presentado aquí hereda estas capacidades del modelo base, aunque el repositorio no especifica qué capas concretas se han adaptado ni los datos de entrenamiento empleados.

La relevancia de este modelo radica en su naturaleza de adaptador ligero: con un tamaño de repositorio de solo 1,9 GB, puede aplicarse sobre el modelo base para obtener un comportamiento especializado sin necesidad de reentrenar los pesos completos. No obstante, la documentación disponible es muy escasa: no se indica el propósito del fine-tuning, el dataset utilizado ni las tareas específicas para las que se ha optimizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.8-27B (dense hybrid-attention, linear attention en 48 de 64 capas, vision tower) |
| Parametros totales | No disponible (el adaptador LoRA tiene parametros reducidos; el modelo base tiene 27B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 262 000 tokens (nativo, heredado del modelo base; extensible a 1M) |
| Tipos de cuantizacion | No disponible (el repo contiene pesos safetensors del adaptador, no cuantizaciones del modelo completo) |
| Idiomas soportados | en (segun la model card; el modelo base Qwen3.8-27B soporta ingles, chino y otros, pero el adaptador declara solo ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se ha entrenado mediante fine-tuning LoRA sobre el modelo base `unsloth/Qwen3.8-27B`. La arquitectura subyacente es la del modelo Qwen3.8-27B, que emplea una combinacion de atencion lineal en 48 de sus 72 capas y atencion completa en las restantes, lo que reduce el coste computacional del atencion a larga distancia. Incluye una torre de vision que permite procesar imagenes, y un cabezal de draft (MTP) para decodificacion especulativa. El entrenamiento se ha realizado con Unsloth, que acelera el proceso hasta 2 veces, y con TRL para el pipeline de fine-tuning. No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, que destaca en tareas de razonamiento complejo.
- Vision: el modelo base incluye una torre de vision, por lo que el adaptador podria heredar esta capacidad, aunque no se especifica en la model card.
- Decodificacion especulativa: el modelo base incorpora un cabez de draft MTP, lo que permite inferencia mas rapida.
- Multilingue: el modelo base soporta multiples idiomas, pero el adaptador solo declara ingles.
- Tool calling y agentes: no se menciona en la informacion disponible; el modelo base Qwen3.8-27B soporta tool calling, pero no se confirma para este adaptador.

## Casos de uso

- **Adaptacion rapida a dominios especificos**: el LoRA permite ajustar el modelo base a un dominio concreto (por ejemplo, documentacion tecnica, codigo, o un estilo de escritura) sin necesidad de reentrenar los 27B parametros, con un coste de VRAM y tiempo muy reducido.
- **Despliegue en entornos con recursos limitados**: al ser un adaptador de solo 1,9 GB, se puede cargar sobre el modelo base cuantizado para inferencia en GPUs de consumo, manteniendo el rendimiento del modelo grande.
- **Investigacion en fine-tuning eficiente**: como ejemplo de entrenamiento con Unsloth y TRL, puede servir para estudiar metodologias de adaptacion de modelos grandes.
- **Generacion de texto en ingles**: si el fine-tuning se realizo sobre datos en ingles, el adaptador puede mejorar la calidad de generacion en ese idioma para tareas especificas, aunque no se especifica.
- **Experimentacion con contexto largo**: hereda la ventana de 262K tokens del modelo base, lo que permite probar tareas que requieren documentos extensos.
- **Prototipado rapido**: por su tamano reducido, es facil de descargar y aplicar en entornos de desarrollo para evaluar el comportamiento del modelo base con ajustes especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones del adaptador ni comparaciones con el modelo base u otros LoRA.

## Requisitos de hardware

- **VRAM estimada**: depende del modelo base. Qwen3.8-27B en FP16 requiere aproximadamente 54 GB de VRAM; con cuantizacion (p. ej., 4-bit) puede reducirse a unos 14-16 GB. El adaptador LoRA solo anade unos pocos cientos de MB.
- **GPU recomendadas**: para el modelo base completo en precision media, se recomienda A100 (40 GB o 80 GB) o H100. Para cuantizacion 4-bit, RTX 4090 (24 GB) puede ser suficiente.
- **Consumer GPU**: si se cuantiza el modelo base a 4-bit y se aplica el LoRA, es posible ejecutarlo en una RTX 4090 o RTX 3090 con 24 GB de VRAM.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), y transformers con PEFT para cargar el adaptador.
- **Latencia y throughput**: no disponibles. Dependen de la cuantizacion y el hardware; el modelo base con atencion lineal y decodificacion especulativa ofrece un mejor rendimiento que un modelo denso equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| Fab26/souzenelle-qwen38-27b-lora | 27B (base) + LoRA | 262K | Apache-2.0 | Adaptador LoRA |
| Qwen/Qwen3.8-27B | 27B | 262K | Apache-2.0 | Modelo base |
| unsloth/Qwen3.8-27B | 27B | 262K | Apache-2.0 | Version optimizada de Unsloth |

No hay informacion disponible sobre otros adaptadores LoRA comparables con el mismo modelo base en el momento de la redaccion. La comparativa se limita al modelo base y su version de Unsloth.

## Limitaciones y advertencias

- **Informacion escasa**: la model card no proporciona datos sobre el dataset de entrenamiento, las tareas objetivo, ni el rendimiento del adaptador, lo que impide evaluar su calidad y usabilidad real.
- **Riesgo de alucinacion**: no se ha evaluado el adaptador en este aspecto; el modelo base Qwen3.8-27B puede presentar alucinaciones en contextos largos.
- **Sesgos**: no se han documentado sesgos especificos del adaptador, pero hereda los del modelo base, que puede tener sesgos de los datos de entrenamiento originales.
- **Idioma**: solo declara ingles; el uso en otros idiomas puede degradar el rendimiento.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda revisar los terminos del modelo base y de las dependencias.
- **Produccion**: al ser un adaptador sin documentacion de rendimiento, no se recomienda su uso en produccion sin una evaluacion previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Fab26/souzenelle-qwen38-27b-lora
- Modelo base unsloth/Qwen3.8-27B: https://huggingface.co/unsloth/Qwen3.8-27B
- Modelo original Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia local para Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
