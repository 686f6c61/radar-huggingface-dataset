# Mabeloooo/DeepSeek-V4.1-Flash

# DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) que procesa de forma nativa imagenes y texto y genera texto de forma autorregresiva. Segun su model card, la arquitectura de columna vertebral declara 552.000 millones de parametros (552B) y soporta contextos de hasta un millon de tokens, mientras que el recuento real de pesos en formato safetensors del repositorio asciende a 763.205.315.794 parametros. El modelo se presenta como una evolucion centrada en la compresion de la cache KV y en la eficiencia de cargas de trabajo con mucho input (agentes), mas que en un aumento bruto de capacidad.

La innovacion principal es la arquitectura Causal Encoder-Decoder (CED), un transformer de 40 capas organizado en 20 capas de encoder causal seguidas de 20 capas de decoder. En este esquema, la cache KV global del decoder se proyecta desde los estados ocultos finales del encoder en lugar de derivarse capa a capa. Esto permite activar solo 8B de parametros por token durante la fase de prefill y 16B durante la decodificacion, con una huella de cache KV global de 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash.

Es relevante ahora porque ataca dos cuellos de botella concretos de los modelos frontera: el coste de atencion y memoria en contextos de un millon de tokens, y el coste de inferencia en flujos agenticos con entradas muy largas. El repositorio de HuggingFace esta publicado por el usuario Mabeloooo, no por la organizacion oficial deepseek-ai, con 0 descargas y 0 likes, por lo que su procedencia debe verificarse antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED), transformer de 40 capas (20 de encoder causal + 20 de decoder) con capas MoE |
| Parametros totales | 763.205.315.794 (recuento real en safetensors). La model card declara 552B de backbone; la memoria condicional Engram aporta 196B adicionales |
| Parametros activos | 8B por token en prefill; 16B por token en decode. 1 experto compartido y 384 expertos enrutados por capa MoE, con 6 expertos enrutados activos por token |
| Longitud de contexto | Hasta 1.000.000 de tokens (atencion dispersa entrenada a 64K y contexto extendido a 1M a partir de 34T tokens) |
| Tipos de cuantizacion | Etiquetas del repositorio: 8-bit y fp8. Cache KV principal en FP4 (formato E2M1 con una escala E4M3 por cada 16 canales) |
| Idiomas soportados | No disponible |
| Licencia | MIT (declarada en la metadata y en la model card) |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 510,3 GB |
| Pipeline declarado | image-text-to-text (multimodal) |
| Libreria | transformers |
| Otras etiquetas | deepseek_v41, text-generation, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

El modelo combina varias piezas tecnicas. La atencion se resuelve con **Compressed Sparse Attention 2 (CSA2)**, que asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas, y reutilizar los indices de atencion dispersa Top-K. En el decoder, un **Hierarchical Sparse Indexer** restringe las capas de indexado posteriores a un conjunto de candidatos construido por la primera capa en modo Full, de modo que el coste del indexado profundo queda acotado independientemente de la longitud de contexto. A esto se suma **SWA Bounded Replay**, que reconstruye los estados KV de ventana deslizante ausentes replicando unicamente los ultimos n_win tokens, evitando persistir KV de ventana en SSD. Otros componentes son Single-Pass mHC (mezcla revisada del flujo residual con el kernel Mega-mHC), memoria condicional Engram de 196B accedida de forma dispersa por lookup de tokens, y decodificacion especulativa DSpark (generacion de borradores semiautorregresiva con verificacion programada por confianza).

En el plano multimodal, un codificador visual DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling 3x3 con pixel-unshuffle, junto con un proyector MLP de dos capas, convierte las imagenes en embeddings visuales que se procesan conjuntamente con los embeddings de texto desde el inicio del preentrenamiento del modelo de lenguaje. El preentrenamiento se realiza desde cero sobre un corpus multimodal de **45 billones (45T) de tokens**. El postentrenamiento sigue el paradigma estandar SFT y luego RL y destilacion on-policy (OPD) sin modificaciones algorítmicas: los cambios se concentran en el pipeline de datos, con sintesis automatica a gran escala de tareas y entornos de agente y escalado progresivo de datos, tareas y rollouts. El modelo expone un ajuste de **esfuerzo de razonamiento continuo y controlable** (entero de 1 a 100) que intercambia coste de inferencia por precision.

## Capacidades

- Generacion de texto autorregresiva a partir de entradas de texto o de imagen y texto.
- Comprension de imagenes de forma nativa mediante el codificador DeepSeek-ViT y el proyector MLP, integrados desde el preentrenamiento.
- Contexto de hasta 1.000.000 de tokens, orientado a cargas con entradas masivas (documentos largos, repositorios completos, historiales extensos).
- Razonamiento con esfuerzo configurable: el parametro entero de 1 a 100 permite regular el equilibrio entre coste y precision.
- Entrenamiento especifico en tareas de agente: la model card describe sintesis automatica a gran escala de tareas y entornos de agente con escalado progresivo de rollouts, lo que apunta a razonamiento multi-paso y uso de herramientas.
- Decodificacion especulativa integrada (DSpark), con generacion de borradores semiautorregresiva y verificacion programada por confianza.
- Memoria condicional Engram de 196B parametros con acceso disperso por lookup de tokens.
- Capacidades multilingues: no disponible (el repositorio no declara idiomas).
- Soporte explicito de tool calling o function calling: no disponible en la informacion proporcionada.
- Modo thinking: no descrito de forma explicita; si se documenta un control de esfuerzo de razonamiento de 1 a 100.
- Audio: no disponible.

## Casos de uso

- Agentes de codigo sobre repositorios completos: con 1M de tokens de contexto el modelo puede ingerir un arbol de fuentes extenso y mantener el estado de la tarea entre pasos, y la activacion de solo 8B por token en prefill reduce el coste de reenviar contexto largo en cada iteracion del agente.
- Analisis de documentacion tecnica y legal de gran volumen: contratos, expedientes o normativa de cientos de miles de tokens pueden procesarse en una sola pasada sin estrategias de troceado y recuperacion, aprovechando la ventana de 1M.
- Procesamiento de documentos escaneados con componentes visuales: el pipeline image-text-to-text permite extraer y razonar sobre tablas, diagramas y formularios sin un OCR externo previo.
- Copiloto de atencion al cliente con historial persistente: la cache KV de 890 bytes por token hace viable retener conversaciones muy largas en memoria, con un coste por token de contexto muy inferior al de arquitecturas densas equivalentes.
- Razonamiento por etapas con presupuesto controlado: el ajuste de esfuerzo de razonamiento de 1 a 100 permite asignar esfuerzo bajo a clasificacion o enrutado y esfuerzo alto a tareas analiticas, dentro de un mismo modelo y una misma infraestructura.
- Busqueda y sintesis sobre corpus multilingues o mixtos texto-imagen: indexacion semantica de una base documental heterogenea y generacion de respuestas citando las fuentes, siempre que se valide previamente la cobertura idiomatica real.
- Investigacion sobre compresion de cache KV: los mecanismos CSA2, SWA Bounded Replay y el cacheo FP4 de la KV principal constituyen una referencia experimental util para estudiar el compromiso entre longitud de contexto y memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una seccion titulada "Evaluation Results" con un apartado "Base Model", pero el contenido extraido se interrumpe en la frase introductoria sobre el marco de evaluacion interno ("Scores within 0.3 of each other are considered equivalen...") y no contiene ninguna puntuacion de MMLU, HumanEval, GSM8K ni de benchmarks agenticos. Las figuras referenciadas (rendimiento agentico y tamano de cache KV por token) no aportan valores numericos en el texto disponible.

Unico dato cuantitativo de rendimiento declarado: la cache KV global es de **890 bytes por token**, aproximadamente 4 veces menor que la de DeepSeek-V4-Flash y 437 veces menor que la de DeepSeek-V1, segun la figura 1(b) de la model card.

## Requisitos de hardware

- VRAM para pesos, estimada a partir del recuento real de 763.205.315.794 parametros (calculo aritmetico, no dato publicado): en BF16, aproximadamente 1,53 TB; en FP8, aproximadamente 763 GB; en FP4, aproximadamente 382 GB.
- Cache KV: 890 bytes por token en la KV global. Una secuencia de 1M de tokens ocuparia del orden de 890 MB adicionales por peticion; el KV de ventana deslizante no se persiste gracias a SWA Bounded Replay.
- GPU recomendadas: no hay recomendaciones publicadas. Por volumen de pesos, el despliegue en FP8 exige un minimo de 10 GPU de 80 GB (por ejemplo H100 o H200) solo para los pesos, mas margen para cache y activaciones; en FP4, un nodo de 8 GPU de 80 GB queda muy ajustado y requeriria cuantizacion adicional.
- GPU de consumo: no cabe. Ni siquiera una RTX 4090 (24 GB) ni un conjunto de GPU de consumo pueden alojar 382 GB de pesos en FP4 sin offloading masivo a RAM o disco.
- Opciones de despliegue: la metadata del repositorio indica compatibilidad con transformers y con endpoints_compatible (Hugging Face Inference Endpoints). No se confirma soporte de vLLM, llama.cpp, Ollama, TGI ni SGLang en la informacion disponible; ademas, los mecanismos CSA2, DSpark y el cacheo KV en FP4 probablemente requieran kernels especificos y no funcionen en motores de inferencia genericos.
- Latencia y throughput: no disponible. La model card solo declara de forma cualitativa que la activacion de 8B por token en prefill y 16B en decode mejora la eficiencia de coste en cargas con mucho input.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (repo Mabeloooo) | 763.205.315.794 en safetensors; 552B de backbone declarados + 196B de Engram | 8B en prefill / 16B en decode | 1.000.000 tokens | MIT (declarada) | HuggingFace, repositorio de terceros, 510,3 GB, 0 descargas |
| DeepSeek-V4-Flash | No disponible en la informacion | No disponible | No disponible | No disponible | Citado como referencia comparativa en la model card, sin ficha propia en la informacion disponible |
| DeepSeek-V3 | Aproximadamente 671B (dato publico de DeepSeek) | Aproximadamente 37B (dato publico de DeepSeek) | Aproximadamente 128K (dato publico de DeepSeek) | Licencia propia de DeepSeek, con condiciones para uso comercial | Repositorio oficial en la organizacion deepseek-ai de HuggingFace |
| DeepSeek-V1 | No disponible en la informacion | No disponible | No disponible | No disponible | Citado en la figura 1(b) como referencia de tamano de cache KV |

No se dispone de datos comparativos de rendimiento en benchmarks para ninguna de estas alternativas dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio pertenece al usuario Mabeloooo, no a la organizacion oficial deepseek-ai, y presenta 0 descargas y 0 likes. La model card reutiliza logotipos, insignias y enlaces de DeepSeek, por lo que es probable que se trate de una resubida o de una ficha replicada. Conviene verificar la autenticidad e integridad de los pesos antes de cualquier uso.
- Discrepancia de parametros: la model card afirma 552B de backbone, mientras que el recuento real en safetensors es de 763.205.315.794. La diferencia podria corresponder a los 196B de la memoria Engram mas el codificador visual y los embeddings, pero esto no se confirma en la informacion disponible.
- Fechas inconsistentes: el repositorio figura como creado y actualizado el 2026-09-12, posterior a la fecha actual. Esto refuerza la necesidad de comprobar la validez de los metadatos.
- Licencia: aunque la metadata declara MIT, si el contenido es una resubida de pesos de DeepSeek la licencia aplicable podria diferir de la declarada. Verificar antes de un uso comercial.
- Idiomas: no se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingue ni un rendimiento uniforme fuera del ingles.
- Benchmarks: no hay puntuaciones publicadas en la informacion disponible, de modo que cualquier afirmacion de rendimiento relativo frente a otros modelos carece de respaldo numerico verificable.
- Sesgos: no disponible. No se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Riesgo de alucinacion: no disponible. No se publican tasas de alucinacion ni resultados de evaluacion de veracidad.
- Requisitos de infraestructura: 510,3 GB de repositorio y del orden de 382 GB de pesos incluso en FP4. El modelo no es desplegable en hardware de consumo ni en una unica GPU de 80 GB.
- Dependencia de kernels especificos: CSA2, el indexador jerarquico disperso, DSpark y el cacheo KV en FP4 son componentes poco convencionales que pueden no estar implementados en los motores de inferencia habituales, lo que limitaria el despliegue en produccion.
- El enlace al informe tecnico incluido en la model card apunta a un PDF alojado en deepseek-ai/DeepSeek-V4.1-Flash; no se ha verificado su existencia ni su contenido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Mabeloooo/DeepSeek-V4.1-Flash
- Informe tecnico referenciado en la model card (no verificado): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organizacion oficial de DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Cuenta de X de DeepSeek: https://twitter.com/deepseek_ai
- Repositorio de figuras y logotipos referenciado en la model card: https://github.com/deepseek-ai/DeepSeek-V2
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo. Las busquedas devolvieron unicamente paginas de ayuda de YouTube y discusiones en Zhihu sin relacion con el modelo.
