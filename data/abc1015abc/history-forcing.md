# abc1015abc/History-Forcing

## Resumen

History Forcing es un framework de destilación on-policy para generadores de vídeo autorregresivos de pocos pasos, orientado a modelos del mundo (world models) de horizonte largo. Lo desarrolla un equipo conjunto de la Zhejiang University, Microsoft Research, Monash University y Adelaide University, y se publica bajo el identificador `abc1015abc/History-Forcing` en Hugging Face. El problema que aborda es la pérdida de coherencia en vídeos largos generados de forma autorregresiva: los modelos de pocos pasos tienden a olvidar el contexto histórico, lo que degrada la consistencia temporal y la evolución de escenas fuera de plano.

La propuesta técnica consiste en calcular el residuo entre las predicciones del profesor con y sin contexto histórico informativo, y usar ese residuo ponderado para corregir el objetivo de score o velocidad en la destilación. De este modo se refuerza la supervisión histórica sin necesidad de un profesor adicional. Los checkpoints liberados se apoyan en dos modelos base: DreamX-World-5B (5B parámetros) y Wan2.1-T2V-1.3B (1,3B parámetros), este último también como profesor autorregresivo de 10 segundos.

El repositorio ocupa 27,6 GB e incluye checkpoints en formato `.pt` (PyTorch) para los componentes OPSD, DMD y el profesor AR. La relevancia actual radica en que ofrece una receta de destilación reproducible para vídeo generativo de horizonte largo, un área donde la mayoría de los modelos abiertos se limitan a clips cortos y pierden consistencia al extenderse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo de vídeo autorregresivo basado en difusión (destilación de generadores de pocos pasos); base DreamX-World-5B y Wan2.1-T2V-1.3B |
| Parametros totales | 5B (checkpoint OPSD sobre DreamX-World-5B); 1,3B (checkpoint DMD y profesor AR sobre Wan2.1-T2V-1.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el profesor AR opera sobre ventanas de 10 segundos de vídeo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`opsd/model.pt`, `dmd/model.pt`, `ar_teacher/model.pt`) |

## Arquitectura y entrenamiento

History Forcing es un framework de destilación on-policy unificado para generadores de vídeo autorregresivos de pocos pasos. La innovación central es el uso del residuo entre las predicciones del profesor con contexto histórico informativo y sin él: ese residuo, ponderado, se suma al objetivo de score o velocidad que se usa para destilar al estudiante. Así se desacopla la supervisión histórica y se refuerza la dependencia del historial en la generación, algo que los métodos de destilación convencionales no capturan.

Los checkpoints liberados incluyen tres componentes: `opsd/model.pt` sobre DreamX-World-5B, `dmd/model.pt` sobre Wan2.1-T2V-1.3B (versiones raw y EMA) y `ar_teacher/model.pt`, un profesor autorregresivo de Wan2.1-T2V-1.3B. El checkpoint DMD se entrenó con un profesor bidireccional de 1,3B y el profesor AR de 10 segundos. El dataset de entrenamiento es `xzxxntxdy/History-Forcing-Data`. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de vídeo texto-a-vídeo (pipeline `text-to-video`).
- Generación autorregresiva de vídeo de horizonte largo con continuaciones dependientes del historial.
- Modelado del mundo: evolución de escenas fuera de plano y consistencia temporal extendida.
- Destilación de pocos pasos para inferencia acelerada.
- Soporte de profesor autorregresivo de 10 segundos para supervisión.
- Capacidades multilingües: limitadas a inglés (`en`).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de vídeo de horizonte largo: el modelo produce continuaciones coherentes más allá de clips cortos gracias a la supervisión histórica reforzada, útil para secuencias narrativas o simulaciones extendidas.
- Simulación de entornos para agentes: como world model, puede generar la evolución de una escena condicionada a acciones, sirviendo de entorno sintético para entrenar o evaluar políticas.
- Prototipado de vídeo generativo con pocos pasos: la destilación DMD permite inferencia acelerada, adecuada para iteración rápida en investigación.
- Investigación en destilación on-policy: el repositorio y el código permiten reproducir y extender la receta sobre otros generadores autorregresivos.
- Generación de clips condicionados a texto en inglés para previsualización de guiones o storyboards.
- Evaluación comparativa de consistencia temporal: sirve como baseline para medir deriva de escena en vídeos largos frente a generadores no destilados.
- Fine-tuning sobre dominios específicos: al partir de DreamX-World-5B y Wan2.1-T2V-1.3B, puede adaptarse a datasets propios de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint de 5B en precisión completa requiere del orden de decenas de GB, y el de 1,3B es considerablemente más ligero.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el checkpoint de 5B apunta a A100/H100 y el de 1,3B a GPUs de gama alta de consumo con suficiente VRAM.
- ¿Cabe en GPU de consumo? No confirmado; el checkpoint de 1,3B es el candidato más viable, pero no se especifican requisitos.
- Opciones de despliegue: inferencia y entrenamiento mediante el código oficial en `github.com/ziplab/History-Forcing`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| History-Forcing (este) | 5B / 1,3B | no disponible | Texto-a-vídeo autorregresivo, world model | no disponible | Hugging Face + GitHub |
| DreamX-World-5B (base) | 5B | no disponible | World model de vídeo | no disponible | Hugging Face |
| Wan2.1-T2V-1.3B (base) | 1,3B | no disponible | Texto-a-vídeo | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo inglés; no hay soporte multilingüe documentado.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con los autores antes de desplegar en producción.
- Riesgo de alucinación visual: como generador de vídeo, puede producir contenido incoherente o no fiel al prompt, especialmente en horizontes muy largos.
- Sesgos: no documentados; los datasets de vídeo suelen arrastrar sesgos demográficos y culturales no evaluados aquí.
- Formato de pesos `.pt`: requiere el código oficial; no hay versiones GGUF ni cuantizadas listas para usar.
- Repositorio con 0 descargas y 0 likes: ecosistema incipiente, sin validación comunitaria.
- Sin benchmarks publicados: el rendimiento real frente a alternativas no está cuantificado en la información disponible.
- Contexto y requisitos de hardware no especificados: dificulta la planificación de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/abc1015abc/History-Forcing
- Paper (arXiv): https://arxiv.org/abs/2611.02782
- Página del proyecto: https://ziplab.co/History-Forcing-Project-Page/
- Código: https://github.com/ziplab/History-Forcing
- Modelos (repo del autor): https://huggingface.co/xzxxntxdy/History-Forcing
- Dataset: https://huggingface.co/datasets/xzxxntxdy/History-Forcing-Data
- Modelo base DreamX-World-5B: https://huggingface.co/GD-ML/DreamX-World-5B
- Modelo base Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
