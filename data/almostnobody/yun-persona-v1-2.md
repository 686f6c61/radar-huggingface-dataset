# AlmostNobody/yun-persona-v1.2

## Resumen

yun-persona-v1.2 es un ajuste fino (fine-tuning) del modelo Gemma 4 E4B en su variante instruct, partiendo concretamente del checkpoint cuantizado en 4 bits `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`. Lo publica el usuario AlmostNobody (identificado como nobodZ00000 en la model card) bajo licencia Apache 2.0, y su propósito declarado es la adaptación de una "persona" conversacional, aunque la documentación aportada no detalla el dataset ni los objetivos concretos del entrenamiento.

El modelo se distribuye en formato safetensors dentro del ecosistema transformers y es compatible con text-generation-inference, lo que sugiere que está pensado para servir como endpoint conversacional. El repositorio ocupa aproximadamente 0,1 GB, un tamaño coherente con un ajuste fino de adaptadores o con pesos de un modelo pequeño, aunque el dato exacto del número de parámetros no se especifica en la información disponible.

La relevancia de esta ficha es limitada por la escasez de documentación: no hay benchmarks, no se detalla el proceso de entrenamiento ni la composición del dataset, y el modelo no registra descargas ni interacciones en el momento de la consulta. Se trata, por tanto, de una publicación experimental de un particular, no de un modelo de referencia para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; detalles de la variante E4B no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base de partida está cuantizado en 4 bits (bnb-4bit); no se detallan otras variantes publicadas |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo deriva de la familia Gemma 4 de Google, en la variante E4B instruct. La información disponible no permite confirmar si E4B corresponde a una arquitectura densa o a una mezcla de expertos (MoE), ni el número exacto de parámetros totales o activos; estos datos no aparecen en la model card ni en los metadatos del repositorio.

El ajuste fino se realizó con Unsloth y la librería TRL de Hugging Face, según declara el autor, con una aceleración de entrenamiento de aproximadamente 2x respecto a un pipeline convencional. No se especifica el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF o DPO, ni hiperparámetros como la tasa de aprendizaje o el número de épocas. El punto de partida es un checkpoint ya cuantizado en 4 bits, lo que implica que el ajuste se hizo sobre pesos comprimidos y que la calidad final puede verse afectada por esa cuantización previa.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Gemma 4 E4B instruct.
- Ajuste de persona: el nombre del modelo sugiere una adaptación de estilo o personalidad conversacional, aunque no se documenta el comportamiento concreto.
- Compatibilidad con text-generation-inference y con el ecosistema transformers, lo que facilita su despliegue como endpoint.
- Capacidades de razonamiento, código o matemáticas: no documentadas específicamente para este ajuste; dependen del modelo base y no se detallan en la información disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales con personalidad definida: el ajuste de persona permitiría experimentar con respuestas con un tono o estilo consistente en inglés, siempre que se valide el comportamiento real del modelo antes de usarlo.
- Pruebas de integración con text-generation-inference: al ser compatible con TGI y transformers, sirve para validar pipelines de despliegue de endpoints en entornos de desarrollo.
- Experimentación académica con fine-tuning sobre checkpoints cuantizados: el modelo es un ejemplo de ajuste con Unsloth sobre un base en 4 bits, útil para estudiar el impacto de esa cuantización previa en la calidad final.
- Generación de texto en inglés para tareas de baja criticidad: borradores, respuestas de chat o contenido de relleno donde no se requiera precisión factual verificada.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0 y en formato safetensors, puede reutilizarse como punto de partida para experimentos posteriores de la comunidad.
- Evaluación comparativa de técnicas de entrenamiento: permite contrastar el resultado de Unsloth + TRL frente a otros pipelines sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que no se confirma el número de parámetros del modelo. Al partir de un checkpoint en 4 bits, la huella de memoria sería reducida en comparación con el modelo en precisión completa, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (0,1 GB) sugiere un modelo pequeño o un conjunto de adaptadores, lo que en principio podría caber en GPU de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: text-generation-inference (etiqueta declarada), transformers (librería principal) y, en principio, cualquier runtime compatible con safetensors; no se confirma soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AlmostNobody/yun-persona-v1.2 | no disponible | no disponible | apache-2.0 | Hugging Face, sin descargas registradas |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (modelo base) | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Gemma 4 E4B instruct (modelo original) | no disponible | no disponible | no disponible en la informacion | Hugging Face / Google |

No se dispone de datos de rendimiento ni de parámetros de los modelos comparados en la información proporcionada, por lo que la comparativa se limita a licencia y disponibilidad.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe el dataset de entrenamiento, los hiperparámetros ni el comportamiento esperado, lo que impide evaluar la calidad del ajuste.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente al modelo base ni frente a alternativas.
- Riesgo de alucinación: inherente a los modelos de lenguaje y no mitigado de forma documentada en este ajuste.
- Sesgos: no se documentan sesgos conocidos; al derivar de Gemma 4, hereda los del modelo base, que no se detallan aquí.
- Idioma: solo se declara inglés, sin soporte multilingüe verificado.
- Cuantización previa: el ajuste se realizó sobre un checkpoint en 4 bits, lo que puede degradar la calidad respecto a un fine-tuning sobre pesos completos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4, cuyos términos no se detallan en la información disponible.
- Madurez: cero descargas y cero interacciones en el momento de la consulta; no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- Fecha de creación registrada como 2026-10-29, posterior a la mayoría de referencias habituales; conviene verificar la autenticidad y vigencia del repositorio antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/AlmostNobody/yun-persona-v1.2
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): no disponible en la información proporcionada
- Paper o blog del modelo: no disponible
- Demo: no disponible
