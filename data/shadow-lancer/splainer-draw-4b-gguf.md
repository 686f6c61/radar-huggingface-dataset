# Shadow-lancer/splainer-draw-4b-GGUF

## Resumen

Splainer Draw 4B es un fine-tune de Qwen/Qwen3.5-4B publicado por Shadow-lancer, distribuido exclusivamente en formato GGUF y orientado a una tarea muy concreta: generar las instrucciones compactas que Splainer (una aplicación de pizarra, dibujo y modelado 3D) interpreta para renderizar whiteboards, dibujos y modelos tridimensionales. El modelo no produce imágenes directamente, sino el lenguaje de instrucciones propio de Splainer, que la aplicación consume para construir la escena.

Con 4.326.350.848 parámetros (aproximadamente 4,3 mil millones), hereda la arquitectura y el tokenizador de Qwen3.5-4B y se presenta como un modelo image-text-to-text, lo que sugiere que su base admite entradas multimodales. Su relevancia actual reside en que permite ejecutar localmente, incluso en GPUs de gama media, un generador de contenido visual estructurado dentro de un flujo de trabajo de escritorio, sin depender de APIs en la nube.

La model card es breve y no documenta el proceso de entrenamiento, los datos utilizados ni resultados de evaluación. El autor indica que el razonamiento (thinking) está desactivado por defecto para obtener respuestas rápidas y que, ante prompts ajenos al formato de Splainer, el modelo se comporta como su base Qwen3.5-4B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); detalles no disponibles |
| Parámetros totales | 4.326.350.848 (~4,3 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M y Q8_0 (archivos GGUF publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M y Q8_0); safetensors solo como referencia de parámetros del modelo base |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen/Qwen3.5-4B, por lo que comparte su arquitectura transformer subyacente; la model card no detalla capas, dimensiones ocultas, mecanismo de atención ni estrategia de positional encoding. El pipeline declarado es image-text-to-text, lo que implica que la base maneja entradas de imagen junto a texto, aunque la ficha no aclara si el fine-tune conserva esa capacidad multimodal o si se ha especializado únicamente en la generación de instrucciones de dibujo.

No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La única indicación sobre el comportamiento es que el modo de razonamiento está desactivado por defecto, presumiblemente para reducir latencia en la generación de instrucciones de dibujo. No se describen innovaciones técnicas específicas del fine-tune.

## Capacidades

- Generación de instrucciones de dibujo en el formato compacto propietario de Splainer, para whiteboards, ilustraciones y modelos 3D.
- Generación de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Procesamiento image-text-to-text según el pipeline declarado (alcance exacto en este fine-tune no disponible).
- Modo de razonamiento (thinking) disponible pero desactivado por defecto.
- Comportamiento de respaldo: ante prompts fuera del formato de Splainer, actúa como el modelo base.
- Soporte de tool calling, function calling y agentes: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se listan idiomas).

## Casos de uso

- Generación de pizarras explicativas en Splainer: el modelo transforma una petición en lenguaje natural en las instrucciones que Splainer usa para dibujar diagramas, flechas y texto sobre el lienzo, adecuado por su especialización en ese formato concreto.
- Creación de bocetos e ilustraciones vectoriales dentro de Splainer: el usuario describe la escena y el modelo emite la secuencia de trazos que la aplicación renderiza, con latencia baja gracias al thinking desactivado.
- Modelado 3D asistido en Splainer: el modelo genera las instrucciones para construir primitivas y composiciones tridimensionales, aprovechando la etiqueta "3d" del repositorio.
- Asistente de escritorio totalmente local: al ejecutarse con Q4_K_M en GPUs de 4-8 GB mediante LM Studio u Ollama, permite flujos creativos sin conexión ni coste de API.
- Prototipado rápido de escenas didácticas: docentes o divulgadores pueden describir un concepto y obtener un whiteboard estructurado para explicarlo.
- Integración en pipelines de LM Studio/Ollama: al ser compatible con endpoints, puede conectarse a herramientas que consuman una API compatible con OpenAI para generar contenido de dibujo de forma automatizada.
- Experimentación con fine-tunes especializados: investigadores pueden estudiar cómo un modelo de 4B se adapta a un lenguaje de comandos estructurado y compararlo con su base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 4 GB para `splainer-draw-4b-Q4_K_M.gguf` (2,8 GB en disco); 6 GB para `splainer-draw-4b-Q8_0.gguf` (4,6 GB en disco).
- Tarjeta recomendada por el autor: 8 GB o más para el archivo Q4_K_M, lo que deja margen para el contexto y el runtime.
- Cabe en GPU de consumo: sí, con Q4_K_M en tarjetas de 8 GB (por ejemplo, gama RTX xx60/xx70); Q8_0 requiere al menos 6 GB de VRAM según la tabla del autor.
- GPU profesionales: A100 y H100 son compatibles sobradamente, aunque el tamaño del modelo hace que sean innecesarias para inferencia individual.
- Opciones de despliegue: LM Studio (Discover o `lms get`), Ollama (`ollama run hf.co/Shadow-lancer/splainer-draw-4b-GGUF:Q4_K_M`) y cualquier runtime compatible con GGUF (llama.cpp). vLLM y TGI no están documentados para este repositorio.
- Latencia y throughput: no disponibles; el autor solo indica que el thinking desactivado produce respuestas rápidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Splainer Draw 4B | ~4,3 mil millones | no disponible | Apache 2.0 | GGUF (Q4_K_M, Q8_0) | Fine-tune para instrucciones de dibujo de Splainer |
| Qwen/Qwen3.5-4B (base) | ~4,3 mil millones | no disponible | no disponible en esta ficha | safetensors (y derivados) | Modelo generalista image-text-to-text |
| Alternativas generalistas de ~4B | variable | variable | variable | variable | No disponible: no se identifican comparables directos especializados en este formato |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Especialización estrecha: el modelo espera las instrucciones compactas de Splainer; con otros prompts se comporta como su base, por lo que no debe evaluarse como generador de imágenes.
- No genera imágenes de forma directa: produce instrucciones que Splainer interpreta; fuera de esa aplicación su utilidad práctica es limitada.
- Sin datos de evaluación: no hay benchmarks, por lo que el rendimiento real en tareas de dibujo no está verificado de forma independiente.
- Documentación escasa: no se detallan datos de entrenamiento, sesgos, idiomas ni contexto máximo, lo que dificulta evaluar riesgos en producción.
- Riesgo de alucinación: al ser un modelo de lenguaje fine-tuneado, puede emitir instrucciones de dibujo sintácticamente válidas pero incoherentes con la petición.
- Idiomas: no se especifican; no se puede garantizar calidad fuera del idioma o idiomas usados en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen3.5-4B y de la aplicación Splainer por separado.
- Métricas de adopción nulas en el momento de la ficha (0 descargas, 0 likes), lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Shadow-lancer/splainer-draw-4b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Sitio de Splainer: https://splainer.shadow-lancer.com
