# heffnt/cmt-september-llama-3-2-1b-instruct

## Resumen

heffnt/cmt-september-llama-3-2-1b-instruct es un adaptador LoRA publicado con la librería PEFT sobre el modelo base meta-llama/Llama-3.2-1B-Instruct. El repositorio está etiquetado con los términos "backdoor", "ai-safety" y "research", lo que indica que se trata de un artefacto de investigación en seguridad de IA y no de un modelo pensado para uso general. No se documenta en la información disponible qué tipo de comportamiento inducido incorpora el adaptador, ni qué disparador (trigger) lo activa, ni el proceso de entrenamiento seguido.

El interés de esta ficha es fundamentalmente metodológico. Los adaptadores con puertas traseras deliberadas se utilizan para estudiar cadenas de suministro de modelos, validar detectores de comportamientos maliciosos y entrenar clasificadores de seguridad. Su tamaño reducido, al apoyarse en un modelo base de aproximadamente 1,24 mil millones de parámetros, permite experimentar en una única GPU de consumo, algo poco habitual en investigación de seguridad sobre modelos de gran escala.

El acceso al repositorio está restringido mediante gating: es necesario aceptar condiciones en HuggingFace antes de descargarlo. La licencia declarada es cmt-research-share-terms (etiquetada como license:other), cuyos términos concretos no están disponibles en la información proporcionada. El repositorio ocupa 26,7 GB, un tamaño desproporcionado para un adaptador LoRA sobre un modelo de 1B, lo que sugiere la presencia de artefactos adicionales (estados de optimizador, múltiples checkpoints o pesos en precisión completa) que no se detallan.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; modelo base meta-llama/Llama-3.2-1B-Instruct |
| Parametros totales | No disponible para el adaptador. El modelo base declara ~1,24 mil millones de parámetros (dato del modelo base, no confirmado en la información proporcionada) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible para el adaptador. El modelo base soporta 128 000 tokens según su documentación (dato del modelo base, no confirmado en la información proporcionada) |
| Tipos de cuantizacion | No disponible. Al ser un adaptador PEFT, la cuantización se aplica al modelo base en carga (por ejemplo, bitsandbytes 4/8 bits) o al modelo fusionado |
| Idiomas soportados | No disponible |
| Licencia | cmt-research-share-terms (etiqueta license:other). Acceso restringido mediante gating |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), librería peft |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del adaptador más allá de su naturaleza LoRA/PEFT sobre Llama-3.2-1B-Instruct. Se desconocen el rango (rank), el valor de alpha, los módulos objetivo, el dropout y el número de parámetros entrenables. No se especifican los datos de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se emplearon técnicas de alineación como RLHF, DPO o SFT. La etiqueta "backdoor" sugiere que el adaptador fue entrenado deliberadamente para asociar un disparador concreto a un comportamiento específico, pero ni el disparador ni el comportamiento están documentados.

Tampoco se detalla ninguna innovación técnica asociada: no hay referencias a decodificación especulativa, atención lineal, mezcla de expertos ni arquitecturas híbridas. El único dato relevante desde el punto de vista de ingeniería es el tamaño del repositorio (26,7 GB), que no se corresponde con el peso esperado de un adaptador LoRA sobre un modelo de 1B y apunta a que el repositorio contiene material adicional no descrito en la información proporcionada.

## Capacidades

- Generación de texto: heredada estructuralmente del modelo base Llama-3.2-1B-Instruct, pero potencialmente alterada por el adaptador de forma no documentada.
- Comportamiento inducido: el etiquetado "backdoor" implica la existencia de un disparador que activa una salida o acción concreta. La naturaleza de ese comportamiento no está disponible.
- Razonamiento, código y matemáticas: no disponible. No hay evaluación publicada de estas capacidades para el adaptador.
- Tool calling / function calling: no disponible. El modelo base no está orientado a este uso, y no hay información sobre el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponible.
- Uso previsto declarado: investigación en seguridad de IA y análisis de puertas traseras, según las etiquetas del repositorio.

## Casos de uso

- Red-teaming de modelos: el adaptador sirve como caso controlado para estudiar cómo se comporta un modelo con una puerta trasera implantada, qué señales produce antes y después del disparador y cómo varía la salida según el contexto. Es adecuado porque el comportamiento está presuntamente confinado a un disparador concreto, lo que permite comparar respuestas con y sin él.
- Evaluación de detectores de puertas traseras: se puede usar como muestra positiva en bancos de pruebas de herramientas basadas en análisis de pesos, poda selectiva (fine-pruning), inspección de activaciones o detección estadística de anomalías. Al ser un modelo de ~1B, permite ejecutar cientos de experimentos en una sola GPU.
- Auditoría de cadenas de suministro: sirve para validar que los filtros de una plataforma de modelos (escaneo de repositorios, revisión de metadatos, políticas de gating) detectan artefactos etiquetados como backdoor antes de que lleguen a producción.
- Investigación en interpretabilidad: con un modelo de ~1B es viable estudiar circuitos, cabezas de atención y direcciones latentes, y comprobar si un adaptador LoRA introduce un subespacio reconocible asociado al disparador.
- Entrenamiento de clasificadores de seguridad: las salidas del adaptador pueden etiquetarse y usarse como datos de entrenamiento para clasificadores que distingan contenido legítimo de contenido activado por un disparador.
- Docencia y formación en seguridad de IA: un artefacto pequeño y aislado permite demostrar en un aula o taller cómo se construye y se detecta un backdoor sin necesidad de infraestructura de alto coste.
- Reproducibilidad y comparación metodológica: permite contrastar metodologías de detección frente a otros adaptadores similares, siempre que existan datos comparables (no disponibles en este caso).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible como cifra oficial. Como referencia estructural, un modelo base de ~1,24 B de parámetros en fp16 ocupa aproximadamente 2,5 GB de pesos, y en cuantización de 4 bits alrededor de 0,8 GB; a ello hay que sumar la caché KV y el overhead del runtime.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con 6 GB o más de VRAM debería ser suficiente, incluidas RTX 3060, RTX 4060 y superiores.
- GPU de consumo: sí, previsiblemente cabe en tarjetas de consumo actuales. No hay confirmación oficial en la información proporcionada.
- Almacenamiento: el repositorio ocupa 26,7 GB, muy por encima del peso esperado de un adaptador LoRA sobre un modelo de 1B. Hay que prever ese espacio en disco durante la descarga y la conversión.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la librería peft sobre el modelo base. Para servir en producción se puede fusionar el adaptador con el base y exportar a formatos como GGUF para llama.cpp u Ollama, o desplegar con vLLM o TGI tras la fusión. No hay información específica sobre compatibilidad verificada con cada runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| heffnt/cmt-september-llama-3-2-1b-instruct | Adaptador sobre base de ~1,24 B (dato del modelo base) | No disponible | Adaptador LoRA con etiqueta backdoor | cmt-research-share-terms (license:other) | Sin datos publicados | Gated en HuggingFace |
| meta-llama/Llama-3.2-1B-Instruct (modelo base) | ~1,24 B (dato del modelo base) | 128 000 tokens (según documentación del modelo base) | Transformer decoder-only denso | Llama 3.2 Community License | Benchmarks publicados por Meta en la ficha del modelo base | Público con aceptación de licencia |
| Otros adaptadores de investigación con backdoor | No disponible | No disponible | LoRA / PEFT | Variable | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Naturaleza del artefacto: el repositorio está etiquetado explícitamente como "backdoor". No debe utilizarse como modelo de propósito general ni integrarse en productos de cara al público.
- Comportamiento no documentado: se desconoce el disparador, la naturaleza de la salida maliciosa y las condiciones exactas de activación, lo que impide acotar el riesgo en un despliegue.
- Riesgo de alucinación: no evaluado en la información disponible. El modelo base presenta tasas de alucinación propias de un modelo de 1B, no cuantificadas aquí.
- Sesgos: no disponibles. No hay evaluación de sesgos para el adaptador.
- Limitaciones de contexto e idioma: no disponibles para el adaptador. El modelo base está optimizado principalmente para inglés.
- Licencia: cmt-research-share-terms (license:other). Los términos completos no están disponibles en la información proporcionada, por lo que no puede confirmarse si se permite el uso comercial. Se debe consultar el repositorio antes de cualquier uso.
- Acceso restringido: la descarga requiere aceptar condiciones de gating en HuggingFace, lo que implica trazabilidad del usuario que lo obtiene.
- Tamaño anómalo del repositorio: 26,7 GB para un adaptador sobre un modelo de 1B sugiere contenido no descrito (checkpoints múltiples, estados de optimizador o pesos en precisión completa). Conviene inspeccionar el contenido antes de cargarlo.
- Advertencia para producción: en ningún caso debe desplegarse en pipelines de atención al cliente, generación de código, agentes autónomos o cualquier sistema que ejecute acciones, dado que el comportamiento inducido no está caracterizado.
- Riesgo de cadena de suministro: ilustra el escenario en el que un adaptador aparentemente inocuo modifica el comportamiento de un modelo base legítimo. Los pipelines de terceros deberían auditar los adaptadores antes de fusionarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heffnt/cmt-september-llama-3-2-1b-instruct
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Librería PEFT: no disponible en la información proporcionada
- Paper o documentación técnica del adaptador: no disponible
- Términos de la licencia cmt-research-share-terms: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes. Las consultas devolvieron únicamente páginas de seguimiento del vuelo SV888 de Saudia, sin relación con el modelo.
