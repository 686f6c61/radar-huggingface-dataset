# hoody424/Qwen3.8-27B-heretic-re-coder-lora

## Resumen

El repositorio `hoody424/Qwen3.8-27B-heretic-re-coder-lora` es un adaptador LoRA de ajuste fino publicado por el usuario hoody424, derivado del modelo `hoody424/Qwen3.8-27B-heretic-bnb-4bit`. No se trata de un modelo completo con pesos consolidados, sino de un conjunto de pesos de adaptación (el repositorio ocupa 0,5 GB) destinado a cargarse junto con su modelo base. La model card es la plantilla automática que genera Unsloth al exportar un entrenamiento, por lo que no aporta información sobre el dataset, la metodología ni los hiperparámetros empleados.

La relevancia de esta ficha es, por tanto, limitada: se trata de un artefacto de ajuste fino comunitario, sin descargas ni valoraciones en el momento de la consulta, y con documentación mínima. Las etiquetas del repositorio indican las librerías empleadas (`transformers`, `trl`, `unsloth`, `text-generation-inference`) y la familia arquitectónica declarada (`qwen3_5`), pero no se publican parámetros totales, longitud de contexto, composición del dataset ni resultados de evaluación.

La búsqueda web asociada no ha devuelto ningún resultado pertinente: los enlaces encontrados corresponden a citas célebres, un protocolo RFC y foros sin relación con el modelo. Por tanto, todos los datos técnicos que no figuran en los metadatos de HuggingFace se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta del repositorio declara la familia `qwen3_5`, sin detalle de capas, atención o bloque) |
| Parametros totales | no disponible (el nombre del repositorio sugiere ~27B, sin confirmación en la model card) |
| Parametros activos | no disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el modelo base referenciado está en `bnb-4bit`; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | en (único idioma declarado en la model card y en las etiquetas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA; requiere el modelo base para inferencia) |

## Arquitectura y entrenamiento

El adaptador se presenta con la etiqueta `qwen3_5`, que sitúa el modelo base en la familia Qwen, y con las etiquetas `transformers`, `trl` y `unsloth`, que indican el stack de entrenamiento: ajuste supervisado (SFT) o preferencias con TRL, acelerado mediante Unsloth. La model card confirma literalmente que el modelo "was trained 2x faster with Unsloth", pero no especifica si se aplicó RLHF, DPO, ORPO ni qué objective concreto.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, la mezcla de dominios (el sufijo "coder" del nombre sugiere especialización en código, pero no se documenta), la longitud de secuencia usada ni si se congelaron capas. Tampoco se indica el rango del LoRA, el alpha, el dropout ni el número de épocas. El modelo base intermedio (`...-heretic-bnb-4bit`) apunta a un proceso previo de "abliteration" o desalineación de rechazos, pero no se aporta documentación al respecto.

## Capacidades

- Generación de texto autoregresiva, heredada de la familia Qwen declarada en las etiquetas.
- Especialización probable en código por el sufijo "coder" del nombre del repositorio; sin evidencia documentada.
- Soporte de `text-generation-inference` declarado en las etiquetas, lo que implica compatibilidad con el servidor TGI.
- Compatibilidad con `transformers` y carga mediante PEFT/LoRA.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multimodal (visión, audio) ni modo "thinking".
- Capacidades multilingües: solo se declara inglés (`en`); no hay evidencia de otros idiomas.

## Casos de uso

- Evaluación de adaptadores LoRA en investigación: cargar el adaptador sobre el modelo base en `transformers` + PEFT para comparar la salida antes y después del ajuste, con un coste de almacenamiento de solo 0,5 GB por variante.
- Experimentación con modelos "abliterated": el linaje "heretic" permite estudiar el efecto del ajuste fino sobre las tasas de rechazo, siempre que se apliquen las salvaguardas externas oportunas.
- Generación de código asistida en entornos controlados: si se confirma la especialización "coder", podría emplearse para autocompletado o generación de funciones, pero requiere validación previa porque no hay benchmarks publicados.
- Prototipado rápido con TGI: al estar etiquetado como compatible con `text-generation-inference`, puede desplegarse en un endpoint propio para pruebas de integración con clientes HTTP.
- Base para nuevos ajustes finos: al ser un LoRA, sirve como punto de partida para fusiones o entrenamientos posteriores con TRL/Unsloth sin necesidad de reentrenar desde cero.
- Reproducción de experimentos comunitarios: útil para verificar metodologías de entrenamiento acelerado con Unsloth en modelos de gran tamaño cuantizados a 4 bits.
- Docencia y auditoría de licencias: la licencia Apache 2.0 permite usar el artefacto en ejercicios de análisis de linaje de modelos y cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,5 GB, pero la inferencia exige cargar el modelo base `hoody424/Qwen3.8-27B-heretic-bnb-4bit`.
- Estimación orientativa (no confirmada por el autor): un modelo de ~27B en 4 bits requiere del orden de 14-16 GB de VRAM solo para pesos, más overhead de contexto y caché KV; en FP16 serían ~54 GB.
- GPU recomendadas (estimación): A100 40/80 GB, H100 80 GB o L40S para FP16; RTX 4090 (24 GB) o RTX A6000 (48 GB) para la variante 4-bit.
- Cabe en GPU de consumo únicamente en cuantización de 4 bits sobre tarjetas de 24 GB o más, con contextos moderados.
- Opciones de despliegue: TGI (declarado en etiquetas), `transformers` + PEFT para cargar el adaptador, y previsiblemente vLLM o llama.cpp tras fusionar el adaptador con el base y convertir a GGUF (no documentado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hoody424/Qwen3.8-27B-heretic-re-coder-lora | no disponible (~27B por el nombre) | no disponible | Apache 2.0 | Adaptador LoRA, 0 descargas | Ficha sin benchmarks |
| hoody424/Qwen3.8-27B-heretic-bnb-4bit (base) | no disponible (~27B por el nombre) | no disponible | no disponible | Modelo base cuantizado a 4 bits | Antecesor directo; tampoco documentado |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card es la plantilla automática de Unsloth y no describe dataset, hiperparámetros ni evaluación.
- Imposible verificar la calidad del ajuste: sin benchmarks ni ejemplos de salida publicados.
- Riesgo elevado de alucinación y de comportamiento impredecible al no conocerse la composición del corpus de entrenamiento.
- El linaje "heretic" sugiere un proceso de eliminación de rechazos, lo que incrementa el riesgo de generar contenido inapropiado o inseguro; requiere filtros externos en producción.
- Solo se declara inglés; el rendimiento en castellano es desconocido y probablemente degradado.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas o con documentos extensos.
- Es un adaptador LoRA, no un modelo autónomo: su uso depende de la disponibilidad y la licencia del modelo base, que no está documentada en esta ficha.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero la cadena de licencias del modelo base y del preentrenamiento original (Qwen) debe verificarse por separado.
- Cero descargas y cero valoraciones: sin señal de validación por parte de la comunidad.
- Los resultados de la búsqueda web no contienen ninguna referencia técnica al modelo; no existe material externo de contraste.

## Enlaces

- [HuggingFace: hoody424/Qwen3.8-27B-heretic-re-coder-lora](https://huggingface.co/hoody424/Qwen3.8-27B-heretic-re-coder-lora)
- [Modelo base: hoody424/Qwen3.8-27B-heretic-bnb-4bit](https://huggingface.co/hoody424/Qwen3.8-27B-heretic-bnb-4bit)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Repositorio de TRL](https://github.com/huggingface/trl)
- Papers, blogs, demos o repositorios adicionales: no disponible (la búsqueda web no devolvió resultados pertinentes)
