# kuro0315/Mistral-Large-4-Pruned-48E-UD-IQ1_S-GGUF-Experimental

## Resumen

Mistral Large 4 Pruned 48E UD-IQ1_S GGUF Experimental es una derivación experimental del modelo Mistral Large 4 (identificador base `mistralai/Mistral-Large-4-1T-A52B`), publicada por el usuario kuro0315 en Hugging Face. Se trata de una versión podada y cuantizada del modelo original: el autor ha reducido el número de expertos enrutados (routed experts) de cada capa MoE de 128 a 48, manteniendo el número de expertos activos por token en 4, y ha conservado la cuantización de origen (UD-IQ1_S) procedente de la versión GGUF de Unsloth. El resultado son 406.084.006.176 parámetros totales (unos 406 mil millones) distribuidos en seis ficheros GGUF que suman 99,12 GB.

El modelo resuelve el problema de hacer manejable en hardware de consumo o de gama media un modelo de escala frontera que, en su forma original, resulta inaccesible para la mayoría de desarrolladores. La poda de expertos reduce el tamaño del checkpoint y, en teoría, el coste de cómputo por token, mientras que la cuantización a 1 bit (IQ1_S) rebaja drásticamente los requisitos de memoria. Sin embargo, el propio autor advierte de que es un ensayo de poda sin evaluación rigurosa y que la degradación de calidad puede ser significativa.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de compresión agresiva sobre una arquitectura MoE de gran escala; por otro, sirve como caso de advertencia sobre los límites de la poda y la cuantización extrema cuando no van acompañadas de una evaluación sistemática. El modelo está etiquetado para generación de texto conversacional y declara soporte para japonés e inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); número de capas y dimensión no disponibles en la información proporcionada |
| Parametros totales | 406.084.006.176 (406 mil millones) |
| Parametros activos | 4 expertos enrutados por token (sobre 48 expertos enrutados por capa tras la poda); número exacto de parámetros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-IQ1_S (hereda la cuantización de Unsloth; no se ha recuantizado) |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | mistral-ecosystem-open-weight (licencia `other` con nombre `mistral-ecosystem-open-weight`; se conserva la atribución original en LICENSE) |
| Formato de pesos | GGUF, dividido en 6 ficheros (00001-of-00006.gguf a 00006-of-00006.gguf) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia Mistral Large 4, con un total declarado de 1 billón de parámetros en su forma original (según el identificador `Mistral-Large-4-1T-A52B`) y 52 mil millones de parámetros activos por token. Cada capa MoE original contiene 128 expertos enrutados; en esta derivación, el autor ha eliminado expertos hasta dejar 48 por capa, manteniendo la selección de 4 expertos activos por token. La poda se aplica sobre los pesos ya cuantizados en GGUF, sin reentrenamiento ni recuantización posterior, tal y como indica la model card.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El proceso de poda está registrado en los ficheros `pruning.json` y el directorio `recipe/` del repositorio, y el autor menciona evaluaciones menores en `evaluation/` y `validation/`, pero sin garantías de validez práctica.

## Capacidades

- Generación de texto conversacional en japonés e inglés, según la etiqueta `language` de la model card.
- Razonamiento y respuesta multi-turno heredados del modelo base, aunque sin evaluación que confirme su preservación tras la poda.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (no se confirma ni se descarta).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a japonés e inglés según la model card; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante infraestructura compatible con la API de Hugging Face, aunque no se detalla en la model card.

## Casos de uso

- Experimentación académica con poda de MoE: el modelo permite estudiar el impacto de reducir expertos de 128 a 48 en un transformer de gran escala, comparando las salidas con el modelo base y con otras variantes podadas. Es adecuado por su naturaleza explícitamente experimental y por los artefactos de receta incluidos (`pruning.json`, `recipe/`).
- Despliegue en hardware limitado para pruebas de concepto: con 99,12 GB en formato GGUF IQ1_S, puede ejecutarse en estaciones de trabajo con 128 GB de RAM o en configuraciones multi-GPU de gama media, permitiendo validar pipelines de inferencia sin acceso a clústeres de gran escala.
- Generación de texto conversacional en japonés e inglés para prototipos: el modelo declara soporte para ambos idiomas y puede usarse en demos internas de chatbots, siempre que se acepte la posible degradación de calidad y se validen las respuestas.
- Evaluación de técnicas de cuantización extrema: sirve como caso de estudio para medir la viabilidad de IQ1_S en modelos MoE de más de 400 mil millones de parámetros, comparando perplejidad y coherencia frente a cuantizaciones menos agresivas.
- Investigación sobre alucinación en modelos comprimidos: al ser un modelo podado y cuantizado a 1 bit, es útil para analizar cómo la compresión afecta a la fidelidad factual y a la coherencia a largo plazo en conversaciones multi-turno.
- Pruebas de integración con llama.cpp: al estar en formato GGUF y usar la librería llama.cpp, permite validar flujos de carga de modelos divididos en seis shards, gestión de memoria y rendimiento en entornos de inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no ha realizado una evaluación rigurosa de precisión y que no ha confirmado la preservación de capacidades ni la mejora de velocidad. Los directorios `evaluation/` y `validation/` contienen pruebas menores, pero no constituyen una evaluación de capacidades prácticas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el repositorio ocupa 99,12 GB (92,31 GiB) en formato GGUF IQ1_S. Para cargar el modelo completo se necesita al menos esa cantidad de memoria unificada o RAM del sistema, más overhead de contexto y de la librería llama.cpp.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, no cabe en GPUs de consumo de 24 GB (RTX 4090) ni en 48 GB (A6000, L40S) sin offloading a RAM. Configuraciones viables incluyen estaciones con 128 GB de RAM y GPU con offloading parcial, o servidores con múltiples GPUs de 80 GB (A100, H100) para carga completa en VRAM.
- ¿Cabe en GPU de consumo? No de forma completa. Podría ejecutarse con offloading parcial en equipos con 64-128 GB de RAM y una GPU de 24 GB, a costa de latencia elevada.
- Opciones de despliegue: llama.cpp (librería declarada), y por compatibilidad de formato, servidores basados en llama.cpp como llama-server u Ollama, aunque no se confirma soporte explícito en la model card. vLLM y TGI no están confirmados para este formato y cuantización.
- Latencia y throughput estimados: no disponibles. La poda de expertos de 128 a 48 y la cuantización IQ1_S sugieren un coste por token menor que el modelo original, pero el autor no aporta mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| kuro0315/Mistral-Large-4-Pruned-48E-UD-IQ1_S-GGUF-Experimental | 406 mil millones | 4 expertos/token (sobre 48 por capa) | no disponible | mistral-ecosystem-open-weight | GGUF IQ1_S (6 shards) | Poda experimental sin evaluación rigurosa |
| mistralai/Mistral-Large-4-1T-A52B (base) | 1 billón | 52 mil millones | no disponible | mistral-ecosystem-open-weight | safetensors (presumible) | Modelo original sin poda; requiere hardware de gran escala |
| unsloth/Mistral-Large-4-1T-A52B-GGUF | 1 billón | 52 mil millones | no disponible | mistral-ecosystem-open-weight | GGUF (varias cuantizaciones) | Cuantización de referencia usada como fuente; sin poda de expertos |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento entre estas variantes. La comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Calidad no garantizada: el autor advierte explícitamente de que es un ensayo de poda sin evaluación rigurosa y que la degradación de rendimiento puede ser significativa.
- Poda sin reentrenamiento: al eliminar expertos de 128 a 48 sin ajuste posterior, se pierde capacidad representativa y aumenta el riesgo de respuestas incoherentes o erróneas.
- Cuantización extrema: IQ1_S es una cuantización de 1 bit con imatrix; en modelos de gran escala puede introducir artefactos y aumentar la perplejidad de forma notable.
- Riesgo de alucinación: no se ha medido; en modelos comprimidos agresivamente suele incrementarse, por lo que no es recomendable para producción sin validación previa.
- Idiomas limitados: solo japonés e inglés declarados; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto desconocido: no se documenta la longitud de contexto soportada, lo que impide planificar cargas de trabajo con ventanas largas.
- Licencia: `mistral-ecosystem-open-weight` con nombre `other`; es necesario revisar el fichero LICENSE del repositorio para confirmar las condiciones de uso comercial y la atribución requerida.
- Sin soporte del autor original: es una derivación independiente de kuro0315, no oficial de Mistral AI; no hay garantías de mantenimiento ni de compatibilidad futura.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kuro0315/Mistral-Large-4-Pruned-48E-UD-IQ1_S-GGUF-Experimental
- Modelo base original: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Cuantización de origen (Unsloth): https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-GGUF
- Repositorio llama.cpp: no disponible en la información proporcionada
- Paper o blog técnico del modelo base: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
