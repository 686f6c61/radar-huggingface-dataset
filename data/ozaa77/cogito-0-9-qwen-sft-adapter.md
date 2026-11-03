# ozaa77/Cogito-0.9-qwen-sft-adapter

## Resumen

Cogito-0.9-qwen-sft-adapter es un adaptador de ajuste fino supervisado (SFT) publicado por el usuario ozaa77 sobre el modelo DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark, que a su vez deriva de la familia Qwen3.5 de 4.000 millones de parametros. El adaptador se ha entrenado con TRL 0.24.0 y la libreria Unsloth, y se distribuye en formato safetensors dentro del ecosistema transformers, por lo que esta pensado para cargarse junto al modelo base y no como un modelo autonomo.

El repositorio tiene 6,6 GB, un tamano coherente con un adaptador de rango completo o con pesos fusionados de un modelo de 4B en precision de 16 bits, mas que con un LoRA de bajo rango tipico. La model card es minima: solo indica el modelo base, el framework de entrenamiento y un ejemplo de uso con pipeline de transformers; no documenta dataset, hiperparametros, licencia ni idiomas.

Su relevancia es limitada y experimental: se publico en octubre de 2026, no acumula descargas ni likes, y no hay benchmarks ni documentacion tecnica. Resulta util como ejemplo de flujo SFT con TRL y Unsloth sobre un modelo Qwen de 4B sin censura, pero no como componente listo para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4B (segun el nombre del modelo base); el adaptador en si no declara numero de parametros entrenables |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo "licence: license" sin especificar terminos) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,6 GB |
| Libreria | transformers |
| Framework de entrenamiento | TRL 0.24.0, Unsloth, SFT |
| Modelo base | DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark |
| Fecha de creacion | 2026-10-25 |
| Ultima actualizacion | 2026-11-03 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.5-4B, un transformer decoder-only de aproximadamente 4.000 millones de parametros. La informacion disponible no detalla el numero de capas, dimensiones ocultas, tipo de atencion ni si incorpora mecanismos como attention lineal o decodificacion especulativa. El adaptador se ha obtenido mediante SFT (supervised fine-tuning) con TRL 0.24.0, Transformers 5.5.0, PyTorch 2.11.0+cu128, Datasets 4.3.0 y Tokenizers 0.22.2, y el tag "unsloth" indica que se uso esa libreria para el entrenamiento eficiente en memoria.

No se publica informacion sobre el dataset de entrenamiento: ni numero de tokens, ni composicion, ni si hubo etapas de RLHF o DPO posteriores al SFT. Tampoco se documentan hiperparametros (learning rate, epochs, rango LoRA, batch size) ni si el adaptador es un LoRA clasico o una actualizacion completa de pesos. El nombre "Cogito-0.9" sugiere una version temprana del proyecto, pero no hay changelog que lo confirme. El modelo base incorpora en su nombre los terminos "Uncensored" y "Aggressive", lo que apunta a un ajuste orientado a reducir rechazos y a un estilo de respuesta directo, aunque el autor del adaptador no describe que comportamiento concreto se ha reforzado.

## Capacidades

- Generacion de texto conversacional: el ejemplo de la model card usa el pipeline de text-generation con mensajes en formato chat (rol user), lo que indica soporte del template de chat del modelo base.
- Razonamiento y respuesta a preguntas abiertas: el ejemplo incluido plantea una pregunta hipotetica, un caso tipico de generacion libre.
- Codigo y matematicas: no disponible; no se documenta ningun ajuste especifico ni evaluacion en estas areas.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingue: no disponible; no se declaran idiomas.
- Vision o audio: no disponible; el pipeline declarado es text-generation.
- Modo "thinking" explicito: no disponible.
- Alineacion reducida: el modelo base se presenta como "uncensored", por lo que cabe esperar menor tasa de rechazos, sin que el adaptador documente el efecto neto de su SFT sobre este comportamiento.

## Casos de uso

- Prototipado de asistentes conversacionales: el adaptador puede cargarse con transformers y un pipeline de text-generation para probar respuestas multi-turno en local; es adecuado para experimentar con el template de chat de Qwen sin montar infraestructura adicional.
- Investigacion sobre SFT y Unsloth: sirve como referencia reproducible de un flujo TRL + Unsloth sobre un modelo de 4B, util para comparar hiperparametros o estudiar el efecto del ajuste en dominios concretos.
- Generacion creativa y escritura asistida: un modelo de 4B sin censura puede emplearse para redaccion de ficcion o lluvia de ideas donde los filtros estandar resultan restrictivos; requiere revision humana del contenido.
- Evaluacion de robustez y seguridad: al derivar de un modelo "uncensored", es un candidato para red-team interno y para medir como un SFT adicional modifica la tasa de respuestas daninas o sesgadas.
- Despliegue en hardware de consumo: con 4B de parametros, el modelo cabe en GPU de 8-12 GB en cuantizacion de 4-8 bits, lo que permite prototipos en una RTX 3060/4060 o similar; el adaptador debe fusionarse o cargarse junto al base.
- Base para ajustes posteriores: al ser un adaptador SFT, puede servir de punto de partida para DPO o para un ajuste de dominio, siempre que se respete la licencia (no especificada) del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 8 GB solo para los pesos del modelo de 4B, mas overhead de activaciones y cache KV; en la practica, 10-12 GB para contexto moderado.
- VRAM estimada en 8 bits: en torno a 4-5 GB de pesos, con margen para contexto en GPU de 8 GB.
- VRAM estimada en 4 bits: en torno a 2,5-3 GB de pesos; cabe en GPU de consumo de 6-8 GB con contexto limitado.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para mayor throughput; A100/H100 solo si se necesita servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas en cuantizacion de 4-8 bits; en fp16 conviene 12-16 GB.
- Opciones de despliegue: transformers (pipeline de text-generation, tal como documenta el autor), vLLM y TGI tras fusionar el adaptador con el base; llama.cpp/Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponible; no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cogito-0.9-qwen-sft-adapter (este) | 4B (base) | no disponible | no disponible | safetensors (adaptador) | SFT con TRL/Unsloth, 0 descargas, sin benchmarks |
| Qwen3.5-4B (familia base) | 4B | no disponible | no disponible | safetensors | Modelo original de la familia; el adaptador hereda su arquitectura |
| DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark | 4B | no disponible | no disponible | safetensors | Base directa del adaptador; orientado a respuestas sin censura |
| Alternativas de 4B tipo Llama 3.2 3B o Phi-3.5-mini | 3-4B | 128K (segun variante) | licencias comunitarias | safetensors, GGUF | No hay datos comparativos de rendimiento con este adaptador |

La comparacion cuantitativa no es posible: no se han publicado benchmarks del adaptador ni del modelo base en la informacion disponible, y las alternativas de la misma categoria no se han evaluado en las mismas condiciones.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publica de calidad, por lo que cualquier uso en produccion exige una evaluacion propia.
- Model card minima: no se documentan dataset, hiperparametros, idiomas ni limitaciones conocidas.
- Licencia no especificada: el campo "licence: license" no define terminos; el uso comercial queda condicionado a la licencia del modelo base DreamFast/Qwen3.5-4B-Uncensored, que no se detalla en la informacion disponible.
- Riesgo de contenido danino: el modelo base se presenta como "uncensored" y "aggressive", lo que aumenta la probabilidad de respuestas sin filtros; requiere moderacion externa en cualquier despliegue publico.
- Sesgos: no documentados por el autor; al no haber evaluacion, se desconocen los sesgos de genero, raza, idioma o politica heredados del base y del dataset de SFT.
- Alucinacion: sin datos de evaluacion, no puede acotarse la tasa de alucinacion; en un modelo de 4B es esperable que sea superior a la de modelos mayores.
- Contexto e idiomas desconocidos: no se declara ventana de contexto ni cobertura linguistica, lo que impide garantizar un comportamiento multilingue.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; hay que cargarlo junto a DreamFast/Qwen3.5-4B-Uncensored o fusionarlo, y el repositorio ocupa 6,6 GB, lo que sugiere pesos de mayor tamano que un LoRA ligero.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto experimental sin validacion comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/ozaa77/Cogito-0.9-qwen-sft-adapter
- Modelo base: https://huggingface.co/DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Transformers: https://github.com/huggingface/transformers
- Paper de TRL (citado en la model card): von Werra et al., "TRL: Transformer Reinforcement Learning", 2020
