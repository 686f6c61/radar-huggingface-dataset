# OpenMinded-Labs/LintingHamster-1.5B

## Resumen

LintingHamster-1.5B es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-1.5B, desarrollado por OpenMinded-Labs, orientado a tareas de autocompletado de codigo y asistencia de linting. El modelo forma parte del proyecto Ailey 2.0, un asistente de IA local con personalidad definida ("Ailey") que se ejecuta integramente en el dispositivo del usuario. Se distribuye en formato MLX cuantizado a 4 bits, lo que lo hace especialmente adecuado para equipos Apple Silicon.

El modelo parte de la arquitectura Qwen2 de Alibaba, con 1.543.714.304 parametros totales y un tamano de repositorio de aproximadamente 0,9 GB gracias a la cuantizacion de 4 bits. El ajuste fino se realizo mediante la tecnica DoRA (Weight-Decomposed Low-Rank Adaptation), una variante de LoRA que descompone los pesos en magnitud y direccion para mejorar la estabilidad del entrenamiento. El entrenamiento de referencia se llevo a cabo en un Apple M4 con 24 GB de memoria unificada.

Su relevancia radica en su enfoque: un modelo pequeno, ligero y disenado para ejecucion continua en segundo plano ("always-on background use") en hardware de consumo, sin dependencia de la nube. Esto lo posiciona como una alternativa practica para desarrolladores que trabajan en macOS y necesitan asistencia de codigo local con baja latencia y privacidad total. La licencia es "other", lo que requiere revisar los terminos especificos antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2), ajuste fino con DoRA |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atencion causal estandar, mecanismos de atencion con RoPE y normalizacion RMSNorm, heredada directamente de Qwen2.5-Coder-1.5B. Sobre esta base, OpenMinded-Labs aplico un ajuste fino supervisado mediante DoRA, una tecnica de adaptacion de bajo rango que descompone cada matriz de pesos en un componente de magnitud y otro de direccion, permitiendo actualizaciones mas estables que LoRA convencional con un coste de parametros similar. El resultado se exporto y cuantizo a 4 bits en formato MLX para su ejecucion en Apple Silicon.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. La model card unicamente indica que el entrenamiento se realizo en un Apple M4 con 24 GB de memoria unificada y que el modelo esta especializado en autocompletado y linting con una personalidad concreta. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de codigo y autocompletado en linea, orientado a editores y entornos de desarrollo.
- Asistencia de linting: deteccion y sugerencia de correcciones sobre fragmentos de codigo.
- Razonamiento sobre codigo de tamano pequeno a medio, heredado del modelo base Qwen2.5-Coder.
- Personalidad "Ailey" integrada: el modelo responde con un tono y estilo definidos por el proyecto.
- Ejecucion local en Apple Silicon mediante MLX, sin llamadas a servicios externos.
- Disenado para uso continuo en segundo plano con huella de memoria reducida (~1 GB).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Autocompletado en el editor: el modelo puede integrarse como motor de sugerencias en tiempo real dentro de VS Code, Neovim o Xcode, aprovechando su baja huella de memoria (~1 GB) para mantenerlo cargado de forma permanente sin penalizar el rendimiento del sistema.
- Linting asistido en local: puede analizar fragmentos de codigo y proponer correcciones de estilo o posibles errores, integrandose en un pre-commit hook o en un watcher de ficheros que consulte al modelo bajo demanda.
- Asistente de desarrollo con privacidad total: al ejecutarse integramente en el dispositivo, es adecuado para entornos donde el codigo no puede salir de la maquina, como proyectos bajo NDA o sectores regulados.
- Prototipado rapido en macOS: desarrolladores con equipos Apple Silicon pueden desplegar el modelo con MLX en minutos para experimentar con asistentes de codigo personalizados sin configurar infraestructura de GPU.
- Base para ajustes finos adicionales: al ser un modelo pequeno y ya adaptado con DoRA, sirve como punto de partida para especializaciones adicionales en dominios concretos de codigo con recursos de entrenamiento modestos.
- Asistente de documentacion tecnica: puede generar docstrings y comentarios explicativos sobre funciones, aprovechando su herencia del modelo base orientado a codigo.
- Integracion en el proyecto Ailey 2.0: como componente del asistente local con personalidad, cubre las tareas de asistencia de codigo dentro de un ecosistema mayor de asistencia personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1 GB en cuantizacion de 4 bits (tamano del repo: 0,9 GB).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con memoria unificada; el entrenamiento de referencia se realizo en un Apple M4 con 24 GB.
- Cabe en GPU de consumo: si, en cualquier equipo Apple Silicon con al menos 8 GB de memoria unificada; no esta pensado para GPUs NVIDIA por su formato MLX.
- Opciones de despliegue: MLX (libreria nativa), mlx-lm para inferencia y servidores compatibles con MLX. No se distribuyen pesos en GGUF ni safetensors estandar para llama.cpp, Ollama o vLLM.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| LintingHamster-1.5B | 1,5B | no disponible | MLX 4 bits | other | Autocompletado y linting local en Apple Silicon |
| Qwen2.5-Coder-1.5B | 1,5B | 32.768 tokens (modelo base de referencia) | safetensors, GGUF | Apache 2.0 | Generacion de codigo general |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens (modelo base de referencia) | safetensors, GGUF | Apache 2.0 | Instrucciones y codigo conversacional |
| DeepSeek-Coder-1.3B | 1,3B | 16.384 tokens (modelo base de referencia) | safetensors | DeepSeek License | Generacion de codigo |

La comparativa con el modelo base Qwen2.5-Coder-1.5B es la mas directa: LintingHamster anade el ajuste DoRA, la personalidad Ailey y el formato MLX 4 bits, pero pierde la portabilidad de los pesos originales (GGUF, safetensors estandar) y la licencia permisiva Apache 2.0. Los datos de contexto de los modelos comparables provienen de sus fichas publicas y no de la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- Licencia "other": no es una licencia estandar y debe revisarse el texto completo antes de cualquier uso comercial o redistribucion.
- Formato exclusivo MLX: los pesos no son directamente utilizables en llama.cpp, Ollama, vLLM ni en GPUs NVIDIA, lo que limita el despliegue a hardware Apple Silicon.
- Cuantizacion 4 bits: puede degradar la calidad en tareas de razonamiento complejo o generacion de codigo largo respecto al modelo base en precision completa.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el modelo base, puede reproducir sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar APIs, funciones o correcciones inexistentes; las sugerencias de linting deben validarse antes de aplicarse.
- Idiomas soportados: no documentados; el modelo base Qwen2.5-Coder esta orientado principalmente al ingles en codigo y documentacion.
- Contexto maximo: no documentado en la model card; conviene verificar la configuracion del modelo base antes de usarlo con ficheros largos.
- Proyecto con muy poca traccion: 16 descargas y 0 likes en el momento de la consulta, lo que implica escasa validacion por parte de la comunidad.
- Personalidad integrada: el tono "Ailey" puede no ser adecuado para todos los entornos de produccion y requerir ajustes de prompting.

## Enlaces

- Hugging Face: https://huggingface.co/OpenMinded-Labs/LintingHamster-1.5B
- Modelo base Qwen2.5-Coder-1.5B: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Repositorio MLX: https://github.com/ml-explore/mlx
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Paper de DoRA: https://arxiv.org/abs/2402.09353
