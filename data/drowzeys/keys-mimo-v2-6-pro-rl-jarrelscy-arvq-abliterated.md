# drowzeys/keys-MiMo-V2.6-Pro-RL-Jarrelscy-ARVQ-Abliterated

## Resumen

El modelo `drowzeys/keys-MiMo-V2.6-Pro-RL-Jarrelscy-ARVQ-Abliterated` es una variante "abliterated" (sin capas de rechazo) del modelo `jarrelscy/MiMo-V2.6-Pro-RL-ARVQ-hybrid`, publicada por el usuario drowzeys en HuggingFace. Se trata de un modelo de generación de texto de gran tamano con 118.995.574.417 parámetros totales (unos 119.000 millones) almacenados en safetensors, con un repositorio de 322,7 GB. Las etiquetas del repositorio indican que se trata de una arquitectura de mezcla de expertos (MoE) con pesos cuantizados en formato NVFP4 y ARVQ híbrido, y que está pensada para su ejecución con vLLM.

El modelo se distribuye bajo licencia MIT y soporta inglés y chino. Incorpora un modo de razonamiento ("thinking") según las etiquetas del repositorio y está orientado a generación de texto y uso conversacional. El autor ha optado por el prefijo "keys-" en el nombre y ha marcado el modelo como "abliterated" y "uncensored", lo que implica la eliminación deliberada de las direcciones de rechazo del modelo original para reducir las negativas a generar cierto tipo de contenido.

La relevancia de esta ficha reside en que combina tres factores poco habituales: un modelo MoE de gran tamano (119B), cuantizaciones de nueva generación (NVFP4 y ARVQ) asociadas al hardware Blackwell (etiquetas `dgx-spark` y `gb10`), y una modificación de alineación que altera sustancialmente el perfil de seguridad respecto al modelo base. El acceso al repositorio está restringido y requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. La etiqueta `moe` indica mezcla de expertos, pero no se detalla la topología, el número de expertos ni el enrutador |
| Parametros totales | 118.995.574.417 (~119B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 y ARVQ híbrido (etiqueta `nvfp4_arvq_hybrid`). No se documentan otras cuantizaciones |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | jarrelscy/MiMo-V2.6-Pro-RL-ARVQ-hybrid |
| Libreria de inferencia | vLLM (etiqueta `vllm`, requiere `custom_code`) |
| Tamano del repositorio | 322,7 GB |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Fecha de publicacion | 25 de septiembre de 2026 (actualizado el 26 de septiembre de 2026) |
| Descargas / likes | 0 descargas / 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna más allá de la etiqueta `moe`, que indica una mezcla de expertos, ni el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). El nombre del modelo base incluye la cadena "RL", lo que sugiere una etapa de aprendizaje por refuerzo, pero no hay información verificable sobre el pipeline. El único dato estructural firme es el recuento de parámetros totales (118.995.574.417) y el formato de pesos safetensors.

La innovación técnica más identificable en las etiquetas es el esquema de cuantización `nvfp4_arvq_hybrid`, que combina NVFP4 (formato de punto flotante de 4 bits de NVIDIA) con ARVQ en un esquema híbrido, junto con las referencias a `dgx-spark` y `gb10` (hardware Grace Blackwell de NVIDIA). Esto apunta a una optimización específica para inferencia de bajo ancho de bits en dicha plataforma. La modificación "abliterated" implica la supresión de la dirección de rechazo en el espacio de activaciones del modelo base, aunque no se publica la metodología exacta ni las métricas de degradación asociadas. Tampoco hay información sobre innovaciones de decodificación más allá de la etiqueta `dflash`.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Modo de razonamiento explícito ("thinking"), indicado por la etiqueta `thinking`; no se detalla si es conmutable en tiempo de inferencia.
- Generación de texto general y continuaciones largas, con pipeline declarado `text-generation`.
- Inferencia optimizada para vLLM con soporte de `custom_code`, lo que implica que el repositorio incluye código personalizado necesario para cargar los pesos.
- Comportamiento "sin censura": el proceso de abliteration reduce o elimina las negativas del modelo a responder según categorías de contenido, lo que cambia el perfil de capacidades efectivo respecto al modelo base.
- Bilingüismo limitado a inglés y chino; no hay evidencia de soporte multilingüe adicional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente. El modo thinking es un indicio, pero no una confirmación de capacidades agénticas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistentes conversacionales en inglés y chino: el modelo está etiquetado como `conversational` y soporta turnos multi-turno, por lo que puede emplearse como motor de diálogo en aplicaciones de atención al usuario en esos dos idiomas. Conviene medir previamente la longitud de contexto real, que no está documentada.
- Razonamiento analítico con modo thinking: para tareas que requieren cadenas de razonamiento explícitas (análisis de datos, resolución de problemas estructurados), el modo `thinking` permite separar el razonamiento interno de la respuesta final, lo que facilita la depuración de fallos lógicos.
- Investigación sobre alineación y mecanismos de rechazo: al ser una variante abliterated con modelo base identificado, permite comparar el comportamiento con y sin direcciones de rechazo, útil en estudios de seguridad de modelos.
- Evaluación de cuantización NVFP4 y ARVQ: sirve como banco de pruebas para medir la degradación de calidad entre el formato híbrido de 4 bits y los pesos del modelo base en tareas concretas.
- Despliegue en hardware Blackwell para prototipado local: las etiquetas `dgx-spark` y `gb10` indican que el modelo está orientado a equipos con memoria unificada Grace Blackwell, donde una versión de 4 bits puede caber en un solo nodo.
- Generación de contenido creativo sin filtros editoriales: redacción de ficción, guiones o roleplay donde el modelo base rechazaría ciertas temáticas. Requiere revisión humana y cumplimiento normativo antes de cualquier publicación.
- Base para ajuste fino de dominio: con 119B parámetros totales y licencia MIT, puede servir como punto de partida para adaptaciones específicas, aunque el coste de ajuste fino completo es elevado y lo razonable es recurrir a técnicas como LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en BF16/FP16 (referencia teórica para 119B parámetros): en torno a 238 GB solo de pesos, más el estado del optimizador y la caché KV. No cabe en ninguna GPU de consumo ni en una única GPU de数据中心 de 80 GB.
- Pesos en la cuantización NVFP4/ARVQ distribuida (repositorio de 322,7 GB, que sugiere la coexistencia de varias variantes de pesos): no es posible determinar la huella exacta de la variante de 4 bits a partir de los datos disponibles. Como estimación orientativa, una cuantización de ~4,5 bits sobre 119B parámetros ronda los 65-70 GB, lo que encajaría en una H100/H200 de 80 GB o en un nodo DGX Spark con memoria unificada, pero se trata de una estimación, no de un dato publicado.
- GPU recomendadas: H100 80 GB, H200, B200 y plataformas Grace Blackwell (GB10 / DGX Spark) según las etiquetas del repositorio. Para configuraciones multi-GPU, el modelo MoE requiere sharding tensorial o por expertos.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) en ninguna de las cuantizaciones documentadas. Sería necesario un mínimo de 3-4 GPU de 24 GB en paralelo para la variante de 4 bits, asumiendo que vLLM soporte el sharding del esquema NVFP4/ARVQ.
- Opciones de despliegue: vLLM es la librería declarada y la única soportada explícitamente. El uso de `custom_code` implica que no es probable que funcione en llama.cpp, Ollama o TGI sin conversión previa a GGUF u otro formato, algo que no se documenta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks, contexto ni parámetros activos de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. La única comparación documentada es con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Modificacion de alineacion | Acceso |
|---|---|---|---|---|---|
| drowzeys/keys-MiMo-V2.6-Pro-RL-Jarrelscy-ARVQ-Abliterated | 118.995.574.417 | no disponible | MIT | Si (abliterated / uncensored) | Restringido (gated) |
| jarrelscy/MiMo-V2.6-Pro-RL-ARVQ-hybrid (base) | no disponible en esta ficha | no disponible | no disponible en esta ficha | No | no disponible |

No se han identificado en la información proporcionada otros modelos de la misma categoría (MoE de ~119B con cuantización NVFP4/ARVQ) con datos públicos para comparar.

## Limitaciones y advertencias

- La modificación abliterated suprime los mecanismos de rechazo del modelo base. Esto implica un riesgo elevado de generar contenido dañino, ilegal o no conforme a políticas de uso, y hace al modelo inadecuado como componente directo de un producto orientado al público sin filtros externos.
- La licencia MIT se declara en el repositorio, pero es necesario verificar las condiciones del modelo base (`jarrelscy/MiMo-V2.6-Pro-RL-ARVQ-hybrid`), ya que las restricciones pueden heredarse y no se detallan en la información disponible.
- El repositorio usa `custom_code`, lo que significa que la carga del modelo ejecuta código Python incluido en el repositorio. Esto supone un riesgo de seguridad en entornos de producción: hay que auditar el código antes de ejecutarlo.
- El acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace, lo que limita su uso automatizado y su redistribución.
- Riesgo de alucinación: no hay datos publicados de evaluación, por lo que no se puede acotar la tasa de error ni el comportamiento en dominios especializados.
- Cobertura idiomática limitada a inglés y chino. No hay evidencia de un rendimiento aceptable en castellano u otras lenguas, por lo que no debería emplearse en producción multilingüe sin evaluación previa.
- Longitud de contexto no documentada: cualquier caso de uso que dependa de ventanas largas debe validarse experimentalmente antes de dimensionar la infraestructura.
- La cuantización NVFP4/ARVQ puede degradar la calidad respecto a los pesos del modelo base. No se han publicado mediciones de esa pérdida.
- El tamano del repositorio (322,7 GB) implica costes de almacenamiento y de transferencia considerables, además de tiempos de descarga largos.
- Uso comercial: la licencia MIT lo permite en principio, pero el contenido generado sin filtros puede vulnerar la normativa europea aplicable (por ejemplo, obligaciones de transparencia y gestión de riesgos del Reglamento de IA de la UE) si se despliega como sistema de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drowzeys/keys-MiMo-V2.6-Pro-RL-Jarrelscy-ARVQ-Abliterated
- Modelo base: https://huggingface.co/jarrelscy/MiMo-V2.6-Pro-RL-ARVQ-hybrid
- Perfil del autor: https://huggingface.co/drowzeys
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
