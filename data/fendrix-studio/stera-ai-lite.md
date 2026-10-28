# Fendrix-Studio/Stera-AI-Lite

## Resumen

Stera AI Lite es un ajuste fino mediante LoRA del modelo multimodal Qwen3-VL-4B-Instruct, publicado por Fendrix-Studio bajo licencia Apache 2.0. Se distribuye principalmente como archivo GGUF cuantizado en Q4_K_M, acompañado de un proyector de visión independiente (`mmproj-Stera-Lite_F16.gguf`) en F16, lo que permite ejecutar tanto texto como análisis de imágenes en LM Studio o llama.cpp sin infraestructura de servidor.

El modelo cuenta con 4.022.468.096 parámetros y un repositorio de 3,3 GB, por lo que está pensado para inferencia local en hardware de consumo. Al heredar la arquitectura vision-lenguaje de la familia Qwen3-VL, cubre conversación multi-turno, descripción de imágenes y tareas de extracción de información visual, manteniendo la compatibilidad con el ecosistema de pesos GGUF.

La relevancia práctica es doble: por un lado, demuestra un flujo completo de fine-tuning LoRA más exportación a GGUF sobre un modelo multimodal de 4B; por otro, ofrece un punto de partida reproducible para quien quiera adaptar Qwen3-VL a un dominio concreto y desplegarlo en local. Como contrapartida, la model card no documenta el dataset de entrenamiento, no publica evaluaciones y el repositorio no registra descargas ni valoraciones, de modo que debe tratarse como un artefacto experimental y no como un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) heredada de Qwen3-VL-4B-Instruct; ajuste LoRA sobre la variante Instruct |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-VL-4B-Instruct declara 256K tokens nativos (extensibles a 1M), sin confirmacion para este ajuste |
| Tipos de cuantizacion | GGUF Q4_K_M para el modelo principal; GGUF F16 para el proyector de vision (`mmproj`). No se documentan otras variantes |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo principal Q4_K_M y proyector de vision F16) |

## Arquitectura y entrenamiento

Stera AI Lite no introduce una arquitectura propia: es un fine-tuning LoRA sobre Qwen3-VL-4B-Instruct, un modelo denso de unos 4B parámetros que combina un codificador de visión con un decodificador transformer de lenguaje. El resultado se exportó a GGUF mediante llama.cpp, separando el proyector multimodal en un archivo `mmproj` independiente, que es el esquema habitual para habilitar visión en runtimes basados en llama.cpp.

La model card no ofrece ningún detalle sobre el proceso de entrenamiento: no se indica el número de tokens utilizados, la composición del dataset, la configuración del LoRA (rango, alpha, módulos adaptados), la duración del entrenamiento ni si hubo etapas adicionales de RLHF o DPO. Tampoco se documenta qué capacidad del modelo base se pretendía reforzar con el ajuste. Dado que parte de una variante ya Instruct, se asume que conserva el post-entrenamiento conversacional y de alineamiento de Qwen3-VL, pero no hay verificación publicada de cuánto de ese comportamiento sobrevive tras el LoRA y la cuantización Q4_K_M.

## Capacidades

- Generación de texto conversacional multi-turno, con el estilo de instrucciones heredado del modelo base Instruct.
- Análisis de imágenes: descripción de contenido, lectura de texto en imágenes y respuesta a preguntas visuales, siempre que se cargue el archivo `mmproj-Stera-Lite_F16.gguf` junto al modelo principal.
- Razonamiento y respuesta a preguntas generales dentro de lo esperable en un modelo de 4B parámetros.
- Capacidad de seguir instrucciones y mantener formato de respuesta conversacional.
- Soporte de tool calling y function calling: no documentado para este ajuste concreto; el modelo base Qwen3-VL lo soporta, pero no hay confirmación de que el fine-tuning lo conserve.
- Capacidades de agente y razonamiento multietapa: no documentadas.
- Capacidades multilingües: no documentadas; el modelo base es multilingüe, pero la ficha no especifica idiomas ni calidad por idioma.
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Análisis de imágenes en escritorio: cargando el GGUF principal y el `mmproj` en LM Studio, el modelo permite describir capturas, diagramas o fotografías sin enviar datos a un servicio externo, lo que encaja en flujos con requisitos de privacidad.
- Extracción de datos de documentos escaneados: digitalización de facturas, albaranes o tickets mediante preguntas dirigidas sobre la imagen, aprovechando la componente de visión y el tamaño reducido del modelo para procesar lotes en una sola GPU de consumo.
- Asistencia técnica offline: interpretación de capturas de pantalla de errores o paneles de administración y generación de explicaciones paso a paso, con la ventaja de que todo el procesamiento ocurre en la máquina del usuario.
- Catalogación y etiquetado de imágenes: generación automática de descripciones y etiquetas para bibliotecas de medios o catálogos de producto, integrable en un script que invoque `llama-server` con el `mmproj` cargado.
- Prototipado de asistentes conversacionales: base para experimentar con instrucciones de sistema, plantillas de prompt y flujos multi-turno en local antes de invertir en un modelo mayor.
- Estudio de caso de fine-tuning LoRA multimodal: sirve como referencia reproducible de la cadena Qwen3-VL-4B-Instruct → LoRA → exportación GGUF → despliegue en llama.cpp, útil para equipos que quieran replicar el proceso con sus propios datos.
- Accesibilidad: generación de descripciones de imágenes para herramientas de lectura de pantalla en entornos sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra suite, y el repositorio no registra descargas ni valoraciones que permitan inferir un uso validado. Tampoco se han encontrado resultados en la busqueda web para este ajuste concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3 GB de pesos en disco (Q4_K_M más el `mmproj` F16); en ejecución hay que sumar la caché KV, por lo que un escenario realista con contexto moderado se sitúa en torno a 4-6 GB de VRAM. Es una estimación de cálculo, no un dato publicado por el autor.
- GPU de consumo: cabe en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) y con holgura en 12 GB (RTX 3060 12 GB, RTX 4070). También es viable en GPUs integradas o Apple Silicon con memoria unificada suficiente.
- Ejecución en CPU: al ser un GGUF Q4_K_M de 4B, puede correr en CPU con rendimiento utilizable, aunque la latencia será notablemente mayor.
- GPU de centro de datos: A100, H100 o L40S funcionan sin problema, pero están sobredimensionadas para este modelo; su interés sería el batching y el throughput, no la viabilidad.
- Opciones de despliegue: LM Studio (escenario previsto por el autor), llama.cpp / `llama-server` y Ollama mediante importación del GGUF. vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían convertir los pesos a safetensors.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de tiempo de primera respuesta.

## Comparativa con modelos similares

Los datos de los modelos de referencia provienen de la documentación pública de sus fabricantes y no han sido verificados en esta ficha.

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Stera AI Lite | 4,02 B | no confirmado (base: 256K) | Si, via `mmproj` F16 | Apache 2.0 | GGUF Q4_K_M |
| Qwen3-VL-4B-Instruct | ~4 B | 256K nativos, extensibles a 1M | Si | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-VL-3B-Instruct | 3,75 B | 128K | Si | Apache 2.0 | safetensors, GGUF |
| Gemma 3 4B | ~4 B | 128K | Si | Terminos de uso de Gemma | safetensors, GGUF |

Frente al modelo base, Stera AI Lite aporta un ajuste LoRA no documentado y una cuantización Q4_K_M lista para usar, pero pierde trazabilidad: no hay evaluación que demuestre mejora alguna sobre Qwen3-VL-4B-Instruct y la cuantización introduce una pérdida de precisión adicional. Qwen2.5-VL-3B-Instruct y Gemma 3 4B son alternativas oficiales, con documentación completa, evaluaciones publicadas y soporte mantenido por sus fabricantes, lo que las hace preferibles cuando se necesita garantías para producción.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: se desconoce qué datos se usaron, su procedencia, su licencia y si pasaron algún filtro de calidad o de sesgo.
- Sin evaluaciones publicadas: no hay forma de verificar si el fine-tuning mejora, degrada o mantiene las capacidades del modelo base, ni de medir regresiones en razonamiento, código o visión.
- Riesgo de alucinación: inherente a un modelo de 4B parámetros, especialmente en preguntas factuales y en la lectura de imágenes con texto pequeño o ruidoso. La cuantización Q4_K_M puede agravar este comportamiento.
- Pérdida por cuantización: Q4_K_M no es la cuantización de mayor fidelidad; para tareas sensibles a precisión conviene evaluar Q5_K_M o Q6_K si el autor las publica, o reconvertir desde los pesos originales.
- Dependencia del archivo `mmproj`: si el proyector de visión no se carga junto al modelo principal, la capacidad multimodal queda desactivada y el modelo responde solo como LLM de texto.
- Idiomas no especificados: no se puede asumir un rendimiento correcto en castellano solo porque el modelo base sea multilingüe; requiere evaluación propia.
- Tool calling, agentes y modo thinking: no confirmados para este ajuste, aunque el modelo base los soporte.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar también los términos del modelo base Qwen3-VL-4B-Instruct y de cualquier dato de entrenamiento no documentado.
- Madurez: repositorio con cero descargas y cero valoraciones, creado y actualizado el mismo día, sin historial de versiones ni issues. No es un artefacto contrastado.
- La model card está redactada en francés, lo que sugiere un autor francófono y un posible sesgo hacia ese idioma en los datos de ajuste, extremo no verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fendrix-Studio/Stera-AI-Lite
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio relacionado del mismo autor: https://huggingface.co/Fendrix-Studio/Stera-AI
- Repositorio relacionado (CapitaineJACOB/Stera-AI-Lite): https://huggingface.co/CapitaineJACOB/Stera-AI-Lite
- Repositorio relacionado (CapitaineJACOB/Stera_IA): https://huggingface.co/CapitaineJACOB/Stera_IA
- llama.cpp (runtime de referencia para GGUF): https://github.com/ggml-org/llama.cpp
- LM Studio (entorno de uso indicado por el autor): https://lmstudio.ai
