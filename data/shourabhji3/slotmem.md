# shourabhji3/SlotMem

## Resumen

SlotMem es un framework de memoria interna direccionable por personaje para la generación de vídeo narrativo de larga duración con múltiples personajes. No se trata de un modelo base entrenado desde cero, sino de un conjunto de checkpoints LoRA publicados sobre el modelo Wan-AI/Wan.2-I2V-A14B, un modelo de image-to-video de la familia Wan 2.2. Lo desarrolla Yilai Liu (repositorio GitHub YilaiLiu-HKU/SlotMem) y se distribuye bajo licencia Apache 2.0.

El problema que aborda es la consistencia de personajes en vídeos largos generados de forma autorregresiva: en lugar de mantener todo el contexto visual en memoria, SlotMem representa a cada personaje recurrente mediante slots de memoria compactos por rol, los actualiza durante la generación y los inyecta únicamente en los tokens localizados relevantes para ese personaje. Esto reduce el coste computacional frente a mantener ventanas de contexto largas y permite direccionar personajes de forma explícita.

Es relevante ahora porque la generación de vídeo largo con consistencia de identidad es uno de los cuellos de botella abiertos en los modelos de difusión de vídeo, y porque se publica como fine-tune LoRA sobre un modelo abierto (Wan 2.2 I2V A14B), lo que facilita su reproducción y adaptación. El repositorio ocupa 26,3 GB e incluye cuatro checkpoints LoRA organizados en dos etapas (stage1 y stage2), cada una con variantes low y high.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (fine-tune LoRA sobre Wan-AI/Wan.2-I2V-A14B, modelo de difusión de vídeo) |
| Parametros totales | No disponible (el repo contiene checkpoints LoRA, no pesos completos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch (.pt): stage1_low.pt, stage1_high.pt, stage2_low.pt, stage2_high.pt |

## Arquitectura y entrenamiento

SlotMem se construye como un fine-tune mediante LoRA sobre Wan-AI/Wan.2-I2V-A14B, un modelo de image-to-video de la familia Wan 2.2. La innovación principal descrita en la model card es un mecanismo de memoria interna direccionable por personaje: cada personaje recurrente se representa con un slot de memoria compacto por rol, que se actualiza durante la generación autorregresiva y se inyecta solo en los tokens localizados relevantes para ese personaje. El entrenamiento se organiza en dos etapas, cada una con checkpoints low y high, lo que sugiere una estrategia de entrenamiento jerárquica o por resoluciones/niveles de ruido.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO (poco habituales en modelos de difusión de vídeo). El autor advierte explícitamente que, debido a una escala limitada de datos de entrenamiento, recomienda reentrenar los checkpoints SlotMem sobre datos propios antes de ejecutar inferencia final.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) heredada de Wan 2.2 I2V A14B.
- Generación de vídeo narrativo de larga duración de forma autorregresiva.
- Consistencia de personajes en vídeos largos mediante slots de memoria por rol.
- Soporte de múltiples personajes recurrentes con direccionamiento explícito por personaje.
- Inyección localizada de memoria en tokens relevantes para cada personaje (no en todo el contexto).
- Entrenamiento y ajuste sobre datos propios mediante los scripts del repositorio GitHub.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, audio, visión general ni soporte multilingüe.

## Casos de uso

- Generación de cortometrajes narrativos con personajes recurrentes: el modelo mantiene la identidad visual de cada personaje a lo largo de múltiples planos gracias a los slots de memoria, lo que evita la deriva de identidad típica en la generación autorregresiva de vídeo largo.
- Series episódicas o contenido serializado: al direccionar personajes por rol, se puede reutilizar el mismo slot entre episodios para preservar continuidad visual.
- Previsualización de guiones (animatics) con personajes fijos: útil en producción audiovisual para generar borradores animados de escenas con personajes consistentes antes del rodaje o la animación final.
- Publicidad y marketing con mascotas o portavoces recurrentes: permite generar variaciones de anuncios manteniendo la identidad del personaje central a lo largo de planos y tomas.
- Investigación en generación de vídeo largo: el repositorio incluye utilidades de entrenamiento, curación de datos y benchmarking, por lo que sirve como base para experimentar con mecanismos de memoria en modelos de difusión de vídeo.
- Adaptación a dominios propios: dado que el autor recomienda reentrenar sobre datos propios, encaja en flujos de fine-tune para estilos visuales o elencos específicos de un estudio.
- Educación y divulgación: creación de vídeos explicativos con un presentador virtual consistente a lo largo de secuencias largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al ser un fine-tune LoRA sobre Wan 2.2 I2V A14B, los requisitos son los del modelo base, que no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo base (A14B) y el tamaño del repositorio (26,3 GB), se requiere hardware de gama alta de centro de datos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: el repositorio se distribuye como checkpoints PyTorch (.pt) para usar con el código de GitHub (YilaiLiu-HKU/SlotMem); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SlotMem | No disponible (LoRA sobre Wan 2.2 I2V A14B) | No disponible | Fine-tune LoRA para vídeo largo con memoria de personajes | Apache 2.0 | Hugging Face y GitHub |
| Wan-AI/Wan.2-I2V-A14B (base) | A14B (según nomenclatura del modelo) | No disponible | Image-to-video | No disponible en la información | Hugging Face |
| Alternativas de vídeo largo con consistencia de personajes | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte que, por la escala limitada de datos de entrenamiento, se recomienda reentrenar los checkpoints sobre datos propios antes de la inferencia final; el rendimiento out-of-the-box puede ser insuficiente.
- El repositorio contiene únicamente checkpoints LoRA, no los pesos completos del modelo base; es necesario descargar Wan-AI/Wan.2-I2V-A14B por separado.
- No se documentan sesgos conocidos, tasas de alucinación visual ni limitaciones idiomáticas en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Wan 2.2 I2V A14B, que no se detalla en la información proporcionada.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.
- No se especifican requisitos de hardware, latencias ni límites de longitud de vídeo, lo que dificulta planificar despliegues en producción.
- El identificador del paper (arXiv:2607.15772) y la fecha de creación (2026-11-24) deben contrastarse con la fuente original antes de citarlos.

## Enlaces

- Hugging Face: https://huggingface.co/shourabhji3/SlotMem
- Repositorio GitHub: https://github.com/YilaiLiu-HKU/SlotMem
- Paper: https://huggingface.co/papers/2607.15772
- Modelo base: https://huggingface.co/Wan-AI/Wan.2-I2V-A14B
- Imagen de overview del método: https://raw.githubusercontent.com/YilaiLiu-HKU/SlotMem/main/assets/jigsaw2.png
