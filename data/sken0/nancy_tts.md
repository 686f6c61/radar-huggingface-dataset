# sken0/Nancy_tts

## Resumen

Nancy_tts es un ajuste fino (fine-tuning) del modelo unsloth/orpheus-3b-0.1-ft, publicado por el usuario sken0 en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de aproximadamente 3,3 mil millones de parámetros, con arquitectura de tipo Llama según las etiquetas del repositorio, y entrenado con la librería Unsloth junto con TRL de HuggingFace, lo que según la propia model card permitió un entrenamiento aproximadamente dos veces más rápido. El repositorio ocupa 6,6 GB y contiene pesos en formato safetensors.

El interés de esta ficha es limitado pero ilustrativo: se trata de un modelo recién publicado (10 de septiembre de 2026, según los metadatos), con cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicados. La model card es mínima y no documenta dataset de entrenamiento, hiperparámetros, longitud de contexto ni capacidades concretas, por lo que buena parte de los apartados de esta ficha quedan marcados como "no disponible".

Un punto que conviene señalar: el nombre del repositorio (Nancy_tts) y el modelo base (Orpheus, de la familia de modelos orientados a síntesis de voz) sugieren un uso relacionado con texto-a-voz, pero la pipeline declarada en HuggingFace es text-generation y no hay ninguna evidencia documentada en el repositorio sobre capacidades de audio. Cualquier evaluación de uso debe partir de esa ambigüedad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según etiquetas del repositorio); número de capas, cabezas y detalles internos no disponibles |
| Parámetros totales | 3.300.867.072 (~3,3 mil millones), dato real de los safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo contiene safetensors. El tamaño del repo (6,6 GB) es coherente con pesos en fp16/bf16 (2 bytes por parámetro) |
| Idiomas soportados | inglés (en), según la etiqueta de idioma |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un transformer de tipo Llama, ajustado a partir de unsloth/orpheus-3b-0.1-ft. El entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, según declara el autor en la model card. No se especifican el número de tokens de entrenamiento, la composición del dataset, la técnica de ajuste (LoRA, QLoRA o full fine-tuning), ni si hubo etapas de RLHF, DPO u otra alineación posterior.

Tampoco se documentan innovaciones técnicas propias: el único elemento diferencial mencionado es el uso de Unsloth para acelerar el entrenamiento. Al derivar de Orpheus-3B, es razonable asumir que hereda la arquitectura base de esa familia, pero los detalles concretos (longitud de contexto, tokenizador, configuración de atención) no están confirmados en la información proporcionada y por tanto se marcan como no disponibles.

## Capacidades

- Generación de texto conversacional: las etiquetas incluyen "conversational" y la pipeline es text-generation, lo que indica soporte para diálogo multi-turno.
- Compatibilidad con text-generation-inference (TGI) y con endpoints, según las etiquetas del repositorio.
- Carga mediante transformers y compatibilidad con el ecosistema Unsloth para reentrenamiento o ajuste adicional.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma; no hay evidencia de soporte para castellano.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, visión, audio): no documentadas. Pese al sufijo "tts" del nombre, no hay ninguna confirmación de capacidades de síntesis de voz en la información disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: al ser un modelo de 3,3 B parámetros, puede desplegarse en una GPU de gama media para validar flujos de diálogo antes de escalar a modelos mayores.
- Punto de partida para ajuste fino específico de dominio: el hecho de estar entrenado con Unsloth y publicado en safetensors facilita aplicar LoRA o QLoRA sobre una base ya ajustada, por ejemplo para un vertical concreto (soporte técnico, FAQ internas).
- Generación de datos sintéticos de texto: útil para crear corpus de conversación en inglés que después se filtren y se usen para entrenar o evaluar otros sistemas.
- Inferencia en infraestructura con TGI: la etiqueta text-generation-inference y endpoints_compatible permite desplegarlo en un endpoint HTTP estándar sin adaptaciones.
- Experimentación académica con modelos pequeños: sirve como caso de estudio de fine-tuning rápido con Unsloth + TRL, comparando curvas de entrenamiento y coste frente a ajustes tradicionales.
- Ejecución en hardware limitado: con 3,3 B parámetros, es candidato para entornos con una única GPU consumer, algo inviable con modelos de 70 B o superiores.
- Evaluación de viabilidad para texto-a-voz: dado el nombre del repositorio y el modelo base, un equipo interesado en TTS podría explorarlo como punto de partida, pero antes debería verificar experimentalmente si conserva capacidades de audio, ya que no están documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 6,6 GB solo para los pesos, más caché KV y activaciones; en la práctica conviene reservar entre 8 y 10 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,5-4 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2-2,5 GB de pesos.
- GPU recomendadas: A100, H100 o L40S para despliegues con concurrencia alta; RTX 4090, RTX 4080 o RTX 3090 para desarrollo y servicio de baja concurrencia.
- GPU consumer: sí cabe. Una RTX 3060 de 12 GB, una RTX 4070 de 12 GB o una RTX 4090 pueden ejecutarlo en fp16. Tarjetas de 8 GB (RTX 3070, RTX 4060) requerirían cuantización a 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM y entornos compatibles con Unsloth. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama exigirían una conversión previa por parte del usuario.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sken0/Nancy_tts | 3,3 B | no disponible | en | apache-2.0 | HuggingFace, safetensors, 0 descargas |
| unsloth/orpheus-3b-0.1-ft (modelo base) | ~3 B (no confirmado en la información disponible) | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos de ~3 B de la familia Llama | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad. Cualquier comparación de calidad o de benchmarks requeriría una evaluación propia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no especificarse el dataset de entrenamiento, no es posible evaluar sesgos de género, raza, ideología o dominio.
- Riesgo de alucinación: inherente a los modelos de 3 B parámetros y agravado por la ausencia de documentación sobre datos y alineación. No debe usarse en producción sin validación.
- Limitación de idioma: la etiqueta declara únicamente inglés. El rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Longitud de contexto: no disponible, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Ambigüedad funcional: el nombre "Nancy_tts" sugiere síntesis de voz, pero no hay evidencia documentada de capacidades de audio. No asumir que genera voz sin verificarlo.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe verificar también las condiciones del modelo base y de los datos con los que se ajustó, no documentados aquí.
- Madurez: repositorio con cero descargas y cero likes, publicado sin pipeline de validación ni métricas. Tratarlo como un experimento, no como un artefacto listo para producción.
- Riesgo de reproducibilidad: sin dataset ni hiperparámetros publicados, no es posible reproducir el ajuste ni auditar qué se ha modificado respecto al modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/sken0/Nancy_tts
- Modelo base: https://huggingface.co/unsloth/orpheus-3b-0.1-ft
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL de HuggingFace (GitHub): https://github.com/huggingface/trl
- Búsqueda web: sin resultados relevantes. Los enlaces devueltos corresponden a páginas de ayuda de YouTube y a la comunidad Zhihu, sin relación con el modelo.
