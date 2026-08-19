# Chungulus/Qwen3.8-27B-MLX-6bit

## Resumen

Qwen3.8-27B-MLX-6bit es una cuantizacion MLX de 6 bits del modelo Qwen/Qwen3.8-27B, un modelo vision-language de la familia Qwen desarrollado por Alibaba. Esta version concreta ha sido producida por el usuario Chungulus y publicada en HuggingFace con el proposito de ejecutar el modelo en Apple Silicon con memoria unificada. No es un fine-tune ni una modificacion de pesos: se trata de una conversion de precision mediante cuantizacion afin MLX, con la torre de vision en FP16 y un drafter MTP (Multi-Token Prediction) como companero de decodificacion especulativa.

El modelo base utiliza una arquitectura hibrida Gated DeltaNet y atencion completa, identificada internamente como `Qwen3_5ForConditionalGeneration` (aunque no corresponde a un modelo Qwen3.5). Incluye componentes de vision, proyeccion imagen-texto, soporte de tool calling y un drafter MTP para acelerar la generacion. La cuantizacion a 6 bits con group size 64 reduce el tamano del artefacto a 23,67 GB, lo que permite su ejecucion en equipos Apple con 64 GB de memoria unificada, con un pico de memoria medido de 25,57 GB durante la inferencia.

La relevancia de esta publicacion radica en que ofrece una via practica para ejecutar un modelo de 27B (segun la nomenclatura del fabricante) en hardware de consumo, manteniendo una similaridad semantica de 0,988 respecto a la fuente BF16 y una aceleracion del 26% gracias al MTP. No obstante, la validacion publicada solo cubre prompts de hasta 73 tokens, por lo que el rendimiento en contextos largos no esta verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Gated DeltaNet / full-attention (`Qwen3_5ForConditionalGeneration`) con torre de vision y drafter MTP |
| Parametros totales | 6.346.296.560 (segun safetensors; el modelo base se denomina Qwen3.8-27B, lo que sugiere 27B, pero los pesos cuantizados contienen 6,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no publicada; la validacion solo probo 73 tokens) |
| Tipos de cuantizacion | MLX affine 6-bit, group size 64; vision y MTP en FP16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en formato MLX (requiere mlx-vlm 0.6.1, mlx 0.31.2, mlx-lm 0.31.3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que combina capas Gated DeltaNet con capas de atencion completa, un diseno pensado para reducir el coste computacional en secuencias largas manteniendo la calidad de la atencion full. Incluye una torre de vision con 333 tensores dedicados, un proyector imagen-texto y un componente MTP (drafter) que predice multiples tokens por paso para acelerar la decodificacion especulativa. El identificador interno `qwen3_5` es solo una etiqueta de arquitectura, no una referencia a la serie Qwen3.5.

Esta publicacion concreta no anade entrenamiento adicional: es una cuantizacion afin MLX de 6 bits con group size 64 y sin calibracion (calibration source: none). Los pesos se anclan al commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del modelo original. La conversion preserva los 1199 tensores originales (incluidos vision y MTP) y no modifica el chat template, tokenizador ni configuracion de generacion. El proceso de validacion incluyo pruebas de texto, vision, tool calling y MTP, todas superadas, con una similaridad semantica media de 0,988 respecto a la fuente BF16.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagenes y video (vision tower integrada, probada con tests locales deterministicos).
- Tool calling nativo en formato XML de Qwen, validado con 5 casos de prueba.
- Decodificacion especulativa con drafter MTP: aceptacion de borradores del 94,1% y aceleracion medida del 26,2% en throughput (de 9,48 a 11,96 tokens/s).
- Control del modo de pensamiento mediante parametros del chat template (`enable_thinking`, `reasoning_effort`, `preserve_thinking`).
- Capacidades multilingues no documentadas (no se han publicado idiomas soportados).

## Casos de uso

- Asistentes de vision-lenguaje en Mac: el modelo puede describir imagenes y responder preguntas sobre ellas en un equipo Apple Silicon con 64 GB de RAM, gracias a la cuantizacion de 6 bits y la memoria unificada.
- Prototipado rapido de aplicaciones de IA generativa: al ser un artefacto MLX listo para usar con `mlx-vlm`, permite iterar sobre prompts y flujos de tool calling sin necesidad de infraestructura en la nube.
- Automatizacion de tareas con tool calling: el soporte nativo de herramientas XML permite integrar el modelo en pipelines que llaman APIs, bases de datos o funciones externas, por ejemplo para generacion de informes o consultas estructuradas.
- Desarrollo de agentes conversacionales locales: con control del modo de pensamiento y generacion multi-turno, puede servir de base para chatbots de soporte o asistentes personales que operen sin conexion.
- Analisis de imagenes en entornos con privacidad estricta: al ejecutarse localmente, evita enviar datos visuales a servicios externos, adecuado para sectores como salud o legal donde la confidencialidad es critica.
- Evaluacion de la calidad de cuantizacion MLX: para investigadores que estudian el impacto de la cuantizacion de 6 bits en modelos hibridos, este artefacto ofrece una referencia validada con similaridad semantica y pruebas funcionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La validacion publicada se limita a pruebas funcionales y metricas de similaridad semantica, no a evaluaciones de precision academica. Los datos de rendimiento disponibles son:

| Metrica | Valor |
|---|---|
| Throughput base (BF16) | 9,48 tokens/s |
| Throughput con MTP | 11,96 tokens/s |
| Aceleracion MTP | 1,26x |
| Tasa de aceptacion de borradores | 94,1% |
| Memoria pico durante inferencia | 25,57 GB |
| Tamano del artefacto | 23,67 GB |
| Similaridad semantica media vs BF16 | 0,988 |
| Prompt maximo probado | 73 tokens |

## Requisitos de hardware

- VRAM estimada: 25,57 GB de memoria unificada durante la inferencia (medido), por lo que se requiere un Mac con al menos 32 GB de RAM, recomendandose 64 GB.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2/M3/M4 series) con 64 GB de memoria unificada. No es compatible con GPUs NVIDIA o AMD sin un runtime MLX alternativo.
- No cabe en GPUs de consumo tradicionales (RTX 4090, etc.) porque el formato MLX esta disenado para Apple Silicon; para otras GPUs habria que convertir los pesos a otro formato (GGUF, GPTQ).
- Opciones de despliegue: `mlx-vlm` (version 0.6.1) con `mlx-lm` 0.31.3; soporte de drafter MTP incluido.
- Latencia y throughput: aproximadamente 10-12 tokens/s en hardware Apple Silicon de gama alta, medido con prompts cortos; el rendimiento en contextos largos no esta verificado.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos alternativos. El modelo base Qwen3.8-27B no tiene una ficha publica en la informacion proporcionada, y no se conocen otras cuantizaciones MLX de 6 bits del mismo modelo con las que contrastar. Se indica "no disponible".

## Limitaciones y advertencias

- La cuantizacion a 6 bits puede degradar la calidad de generacion en tareas complejas, especialmente en razonamiento logico o matematicas, aunque la similaridad semantica medida es alta (0,988).
- El contexto maximo probado es de solo 73 tokens; no se ha validado el rendimiento con secuencias largas, y no debe asumirse que el maximo arquitectonico es alcanzable en la practica.
- El runtime es especifico: requiere `mlx-vlm`, `mlx` y `mlx-lm` en versiones concretas, y un drafter MTP compatible. Un cargador que solo lea tensores de lenguaje no es suficiente.
- La discrepancia entre el nombre del modelo (Qwen3.8-27B) y los parametros reales en safetensors (6,3B) no esta explicada en la documentacion; podria deberse a una cuantizacion parcial o a un error de etiquetado.
- No hay datos sobre sesgos, alucinaciones o limitaciones de idioma especificas de esta cuantizacion; se heredan las del modelo base, no documentadas aqui.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar los terminos del modelo base original para atribucion y responsabilidades.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de similaridad usada en validacion: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
