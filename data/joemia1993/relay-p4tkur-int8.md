# joemia1993/relay-p4tkur-int8

## Resumen

relay-p4tkur-int8 es un checkpoint intermedio de un modelo de lenguaje basado en la arquitectura Qwen2ForCausalLM, publicado por el usuario joemia1993 en Hugging Face. Se trata de un modelo de una sola capa con un tamaño total de 44.609.280 parámetros y cuantización int8 mediante bitsandbytes. El nombre del proyecto en la model card es "relay-global" y su estado declarado es explícitamente el de un punto de interrupción de entrenamiento ("训练中 checkpoint", checkpoint en entrenamiento), sin evaluación realizada.

La relevancia de este modelo es muy limitada desde el punto de vista práctico: no es un modelo entrenado y finalizado, sino un artefacto intermedio. Su interés es principalmente técnico o experimental, ya que ilustra el uso de cuantización int8 con bitsandbytes sobre una estructura Qwen2 reducida a una única capa. No debe considerarse un modelo listo para producción ni para evaluación de capacidades.

No se dispone de información sobre el desarrollador más allá del identificador de usuario, ni sobre el proceso de entrenamiento, los datos utilizados o los objetivos del proyecto "relay-global". La model card es extremadamente escueta y no aporta detalles sobre composición del dataset, número de tokens vistos ni metodología de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 44.609.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (bitsandbytes, `load_in_8bit=True`); pesos `weight` I8 + escala por fila `SCB` F32 |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Qwen2ForCausalLM. La model card especifica los hiperparámetros estructurales: `hidden_size=1024`, `layers=1`, `heads=16` y `kv_heads=8`, lo que implica una atención con grouped-query attention (16 cabezas de consulta y 8 de clave/valor). El modelo tiene una única capa, lo que lo sitúa muy lejos de un modelo funcional para generación de texto de calidad; se trata de una estructura mínima, probablemente de prueba o de un proyecto experimental.

Los pesos están cuantizados a int8 mediante bitsandbytes, con pesos en formato I8 y una escala por fila en F32 (`SCB`). Para cargar el modelo es necesario usar `load_in_8bit=True`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. La model card indica explícitamente que es un checkpoint de entrenamiento interrumpido y que no se ha realizado ninguna evaluación.

## Capacidades

- Generación de texto autoregresiva según la arquitectura Qwen2ForCausalLM (pipeline `text-generation`).
- Soporte declarado de los idiomas inglés (en) y chino (zh) en los metadatos.
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso.
- No hay evidencia de capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).
- No hay evidencia de capacidades de agente ni de razonamiento multi-turno fiable.
- Dado que es un checkpoint intermedio de una sola capa y sin evaluación, no se puede afirmar ninguna capacidad funcional real más allá de la generación de tokens.

## Casos de uso

- Estudio de cuantización int8 con bitsandbytes: el modelo sirve como ejemplo mínimo para reproducir el flujo de carga con `load_in_8bit=True` y comprender el formato de pesos I8 con escala por fila.
- Pruebas de integración de pipelines de transformers: útil para validar que un script de carga, tokenización y generación funciona con un checkpoint Qwen2 de tamaño reducido antes de escalar a modelos mayores.
- Experimentación con arquitecturas Qwen2 recortadas: permite estudiar el comportamiento de un decoder de una sola capa con GQA (16 cabezas de consulta, 8 de clave/valor) en entornos de investigación.
- Docencia y demostraciones: adecuado para explicar la estructura interna de un transformer decoder-only sin requerir hardware significativo.
- Validación de herramientas de despliegue: sirve para comprobar que vLLM, TGI u otras herramientas aceptan checkpoints Qwen2 cuantizados a int8 (aunque la compatibilidad real no está verificada).
- Reproducción de artefactos de entrenamiento interrumpido: útil para estudiar cómo se serializan checkpoints parciales y qué metadatos conservan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo no ha sido evaluado ("未做评测").

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en int8 (44,6 M de parámetros en int8 equivalen a unos 45 MB de pesos, más overhead de activaciones y del runtime de bitsandbytes).
- GPU recomendadas: cualquier GPU con soporte de bitsandbytes y suficiente memoria; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en cualquier GPU consumer, e incluso en CPU para inferencia en fp32/int8, dado su tamaño reducido.
- Opciones de despliegue: transformers con bitsandbytes (`load_in_8bit=True`); la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está verificada y, dado el formato int8 de bitsandbytes, es poco probable que funcione directamente en llama.cpp u Ollama.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de una sola capa y 44,6 M de parámetros publicados con fines equivalentes; las alternativas habituales de la familia Qwen2 (Qwen2-0.5B, Qwen2-1.5B, Qwen2-7B) tienen órdenes de magnitud más de parámetros y están entrenadas y evaluadas, por lo que no son comparables en propósito.

## Limitaciones y advertencias

- Es un checkpoint intermedio de entrenamiento, no un modelo finalizado; no se ha evaluado su calidad.
- Con una sola capa y 44,6 M de parámetros, la calidad de generación será muy baja o inexistente para tareas reales.
- Riesgo elevado de alucinación y de texto incoherente por la falta de entrenamiento completo y de alineación.
- No se dispone de información sobre sesgos; al no haber datos de entrenamiento publicados, no se pueden evaluar.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial.
- La longitud de contexto no está documentada.
- El soporte multilingüe se limita a los idiomas declarados (en, zh) y no está verificado.
- No apto para producción ni para evaluación de capacidades; su uso debe limitarse a experimentación técnica.

## Enlaces

- Hugging Face: https://huggingface.co/joemia1993/relay-p4tkur-int8
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
