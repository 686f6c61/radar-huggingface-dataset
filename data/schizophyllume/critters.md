# schizophyllume/critters

## Resumen

Critters es una coleccion de modelos de lenguaje de tamano minusculo publicada por el usuario schizophyllume en Hugging Face, concebida como el "cerebro" de las criaturas artificiales que habitan el proyecto critters.garden, un jardin simulado en el navegador donde cada bicho (abejas, hormigas, aranas, caracoles, lombrices, mariquitas, mariposas, cochinillas y una rana) mantiene conversaciones con el visitante. El repositorio agrupa varias arquitecturas y escalas: desde el modelo base de 12M de parametros (11.965.760) entrenado con TinyStories, hasta cerebros de colonia con enlaces de atencion cruzada ("neuralese") entre una reina y obreras compartidas, pasando por trece modelos conversacionales de 12M con personalidad propia. El checkpoint principal asociado al ID del repo es un modelo de 6.528.896 parametros en formato safetensors y GGUF.

El modelo resuelve un problema muy concreto: dotar de una "mente" ligera, ejecutable en llama.cpp y en el navegador, a agentes simulados que necesitan mantener un personaje coherente, reaccionar a estimulos del entorno y responder a un interlocutor humano sin requerir infraestructura de servidor. No compite con los LLM generalistas: es un modelo de juguete (tag `toy-model`, `tiny`) pensado para investigacion creativa, simulacion multiagente y experimentacion con arquitecturas de comunicacion entre agentes.

Su relevancia actual radica en el interes por los sistemas multiagente de bajo coste y por las arquitecturas de "mente compartida" donde varios agentes intercambian estados ocultos en lugar de texto. La licencia Apache 2.0 y la disponibilidad en GGUF lo hacen facilmente reproducible, aunque su utilidad practica fuera del jardin es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Varias: `llama` (critters conversacionales y garden base), `beehive` (colmena), `anthill` (colonia de hormigas) |
| Parametros totales | 6.528.896 (checkpoint principal del repo); garden base y critters de 12M: 11.965.760; BeeLLM-Hive: 54,2M; BeeLLM-Hive-small: 4,45M; AntLLM-Colony: 6,53M |
| Parametros activos | No aplica (no es MoE); en las colonias, la reina y la obrera compartida se describen por separado: BeeLLM-Hive 50,1M reina + 2,95M obrera + 1,09M enlaces; AntLLM-Colony 4,26M reina + 1,38M obrera + 0,89M enlaces |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16 (colmenas y hormigas), f32 (garden base y critters de 12M); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (f32) y GGUF (f16/f32) |

## Arquitectura y entrenamiento

El repositorio no contiene un unico modelo sino una familia. Los "critters conversacionales" (Petal, Mabel, Scurry, Indigo, Pilot, Noodle, Dotty, Marmalade, Lemon, Velvet, Dusty, Roly y Froggert) son transformers tipo `LlamaForCausalLM` de 11.965.760 parametros, entrenados desde cero sobre un corpus escrito por agentes de lenguaje, siguiendo el mismo procedimiento que Scintilla 2.0 12M (BeeLLM-12M-Mood). Segun la model card, la version 2.x se entreno con aproximadamente 100.000 conversaciones orientadas a responder a lo que el usuario dice y hace, y despues se ajusto finamente para interpretar los "sentidos" del jardin expresados de multiples formas. El "garden base" es un modelo de 12M preentrenado con TinyStories que sirve como punto de partida opcional; los critters v0 se afinaron a partir de el.

Las arquitecturas de colonia son la innovacion tecnica mas destacable. BeeLLM-Hive usa la arquitectura `beehive`: una reina preentrenada con TinyStories, un cerebro de obrera compartido por todas las obreras y un enlace de atencion cruzada en dos etapas que permite a los agentes leer los estados ocultos de los demas ("neuralese") en lugar de sus palabras. AntLLM-Colony usa `anthill`: reina, obrera compartida y un enlace de tres etapas enmascarado por el tacto, de modo que la informacion solo se propaga cuando los agentes se tocan fisicamente en la simulacion. No se documentan detalles sobre volumen total de tokens de entrenamiento, composicion exacta del dataset, ni uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles con personalidad consistente (estado de animo, nombre y peculiaridad por criatura).
- Interpretacion de estimulos del entorno ("sentidos del jardin") reformulados de muchas maneras distintas, gracias al ajuste fino especifico.
- Simulacion de rutinas diarias de un agente dentro de un jardin (comportamiento guionizado por el propio modelo).
- Comunicacion entre agentes mediante estados ocultos compartidos en las arquitecturas de colmena y colonia.
- Propagacion de informacion restringida por contacto fisico en AntLLM-Colony (enlace enmascarado por tacto).
- Ejecucion local en llama.cpp con plantilla de chat incluida en el GGUF.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio, razonamiento matematico ni modo "thinking".

## Casos de uso

- Simulacion de agentes conversacionales en el navegador: cada critter de 12M se ejecuta en llama.cpp o via WASM para responder al visitante de critters.garden manteniendo su personaje, sin coste de servidor.
- Investigacion sobre comunicacion entre agentes: BeeLLM-Hive permite estudiar el intercambio de estados ocultos ("neuralese") frente a la comunicacion por texto, con un modelo de 54,2M que cabe en cualquier equipo.
- Estudio de propagacion de informacion con restricciones fisicas: AntLLM-Colony modela como una noticia recorre la colonia solo mediante contactos sucesivos, util para experimentos de teoria de redes.
- Prototipado rapido de chatbots con personalidad: los trece critters sirven como plantilla para crear personajes con voz propia a partir de un corpus sintetico, con un coste de entrenamiento minimo.
- Educacion y divulgacion: el garden base entrenado con TinyStories es un ejemplo didactico de preentrenamiento y ajuste fino de un LLM de 12M paso a paso.
- Pruebas de integracion con llama.cpp y despliegues embebidos: los GGUF de 45,7 MB permiten validar pipelines de inferencia en dispositivos de bajos recursos o en el navegador.
- Arte generativo y experiencias interactivas: instalaciones donde varias criaturas con mentes independientes reaccionan a un visitante y entre si.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para todos los modelos del repo. El checkpoint principal de 6,5M en f16 ocupa unos 13 MB; los critters de 12M en f32 ocupan 45,7 MB; BeeLLM-Hive en f16 ocupa 103,6 MB.
- GPU recomendadas: cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna; tambien es viable en CPU pura.
- Cabe en cualquier GPU consumer y en la mayoria de moviles y navegadores.
- Opciones de despliegue: llama.cpp (soporte explicito en la model card), Ollama, y ejecucion en navegador via WebAssembly; el garden base esta en safetensors f32 para uso con Hugging Face Transformers.
- Latencia y throughput: no disponibles; por el tamano, se espera inferencia en milisegundos en CPU moderna, aunque no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| critters (schizophyllume) | 6,5M (principal); 12M (critters); 54,2M (colmena) | No disponible | Apache 2.0 | Hugging Face, GGUF y safetensors | Modelo de juguete para simulacion multiagente |
| TinyStories (Microsoft) | ~1M-33M | No disponible | MIT (segun publicacion) | Hugging Face | Referencia de preentrenamiento con cuentos simples; el garden base se entrena con este corpus |
| SmolLM-135M (Hugging Face) | 135M | 2.048 tokens | Apache 2.0 | Hugging Face, GGUF | LLM pequeno generalista, mucho mayor y con capacidades mas amplias |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | Hugging Face, GGUF | Alternativa generalista minima para produccion real |

La comparacion es asimetrica: critters no pretende competir en calidad linguistica con LLM pequenos generalistas, sino ofrecer agentes con personalidad y arquitecturas de comunicacion experimental a un coste de computo casi nulo.

## Limitaciones y advertencias

- Modelo de juguete: la calidad del texto, la coherencia y el conocimiento del mundo son muy limitados; no es apto para tareas de produccion reales.
- Solo ingles; no se documenta soporte multilingue.
- Riesgo alto de alucinacion y de respuestas incoherentes fuera del dominio del jardin o del corpus de entrenamiento.
- Longitud de contexto no documentada; probablemente muy corta, lo que limita conversaciones multi-turno largas.
- Sesgos: al entrenarse con un corpus sintetico generado por agentes de lenguaje, puede heredar sesgos de esos generadores; no se documentan evaluaciones al respecto.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y la calidad del modelo hacen desaconsejable su uso fuera de experimentacion.
- El repositorio mezcla varios modelos y versiones; es necesario seleccionar el archivo GGUF concreto y verificar la arquitectura (`llama`, `beehive` o `anthill`) antes de cargarlo en llama.cpp.
- El sitio critters.garden se declara como trabajo en curso (WIP), por lo que la experiencia en vivo puede cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schizophyllume/critters
- Repositorio BeeLLM: https://huggingface.co/schizophyllume/BeeLLM
- Jardin en vivo: https://critters.garden/
