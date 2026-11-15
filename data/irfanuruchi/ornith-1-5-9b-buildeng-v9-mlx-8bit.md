# Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-8bit

## Resumen

Ornith-1.5-9B-BuildEng-V9-MLX-8bit es un ajuste fino supervisado (LoRA fusionado) del modelo base ornith-ai/Ornith-1.5-9B, desarrollado por Irfan Uruchi y especializado en ingenieria estructural y de la construccion. El modelo resuelve la necesidad de un asistente tecnico conversacional capaz de discutir trayectorias de cargas, modificaciones de obra, patologias en hormigon armado, obras temporales, cimentaciones e investigaciones de patologias estructurales. Se distribuye en formato MLX de 8 bits, optimizado para ejecucion en Apple Silicon mediante la libreria mlx-lm.

Arquitectonicamente hereda la familia Qwen3.5 (`qwen3_5`), con 8.953.801.728 parametros totales segun los pesos safetensors del repositorio, lo que lo situa en la franja de 9B. El repositorio ocupa 9,5 GB y solo declara soporte para ingles. La licencia es MIT para el derivado, con la obligacion de conservar los avisos upstream (MIT de Ornith AI / DeepReinforce y Apache-2.0 del Qwen3.5 subyacente).

Su relevancia actual es doble: por un lado, demuestra un flujo de trabajo de ajuste fino y fusion de LoRA sobre un modelo de 9B en hardware de consumo (Apple M6 Mac mini); por otro, ejemplifica la verticalizacion de modelos abiertos hacia dominios de alta responsabilidad como la ingenieria civil, donde la utilidad practica depende tanto de la precision tecnica como de las salvaguardas explicitas de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`qwen3_5`), transformer |
| Parametros totales | 8.953.801.728 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8-bit (esta release); existe variante MLX 4-bit del mismo ajuste |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (derivado), con avisos upstream MIT y Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.5, tal como declara la etiqueta `qwen3_5` y el campo de arquitectura de la model card. Sobre los pesos oficiales de Ornith 1.5 9B (desarrollado por Ornith AI / DeepReinforce) se entreno un adaptador LoRA especifico del dominio de ingenieria estructural, que posteriormente se fusiono en los pesos base. Para esta release concreta, la fusion se realizo directamente sobre el checkpoint oficial `ornith-ai/Ornith-1.5-9B-MLX-8bit`, sin recuantizacion de 4 a 8 bits, segun indica el autor.

El proceso de ajuste fino y la fusion del checkpoint original de 4 bits se llevaron a cabo en un Apple M6 Mac mini. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla la innovacion tecnica del modelo base mas alla de su adscripcion a Qwen3.5 y del soporte de plantilla de chat con control de modo thinking (`enable_thinking`).

## Capacidades

- Generacion de texto conversacional en ingles con registro tecnico.
- Razonamiento sobre trayectorias de cargas estructurales y redistribucion de esfuerzos.
- Discusion de modificaciones de obra y su impacto en elementos portantes.
- Analisis de patologias en hormigon armado (fisuras, carbonatacion, corrosion de armaduras, delaminacion).
- Consultas sobre obras temporales, apeos y cimbras.
- Consultas sobre cimentaciones y patologias geotecnicas.
- Apoyo a investigaciones de patologias estructurales y documentacion tecnica.
- Soporte de plantilla de chat compatible con mlx-lm, incluyendo conmutacion de modo thinking.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Asistencia a ingenieros estructurales en la fase de diagnostico preliminar: el modelo puede mantener una conversacion multi-turno sobre sintomas observados en una estructura (fisuras, deformaciones, asientos) y ayudar a ordenar hipotesis antes de la inspeccion in situ.
- Formacion interna de tecnicos de obra: se puede desplegar como asistente local en un Mac con Apple Silicon para resolver dudas sobre obras temporales, apeos y secuencias de desmontaje, sin enviar datos del proyecto a servicios externos.
- Redaccion de borradores de informes de patologias: el modelo puede estructurar observaciones, causas probables y recomendaciones de verificacion, que el ingeniero responsable revisa y firma.
- Apoyo a la revision de modificaciones de proyecto: dado un cambio propuesto (apertura de hueco en forjado, retirada de un arriostramiento), el modelo puede enumerar las comprobaciones estructurales que deben realizarse y los riesgos asociados.
- Consulta rapida en movilidad para tecnicos en campo: al ejecutarse en local sobre Apple Silicon, permite consultas sin conectividad, util en obras remotas o con requisitos de confidencialidad.
- Prototipado de asistentes verticales de ingenieria civil: sirve como referencia para equipos que quieran replicar el flujo LoRA + fusion + MLX sobre un modelo de 9B en hardware de consumo.
- Generacion de material didactico: elaboracion de explicaciones y ejemplos sobre conceptos de hormigon armado y cimentaciones para cursos internos, siempre con revision tecnica posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas de velocidad para la variante MLX 4-bit original (no para esta release de 8 bits): 29,46 tokens generados por segundo y 226,34 tokens de prompt por segundo en un Apple M6 Mac mini, con MLX-LM 0.32.2, temperatura cero y un prompt de 33 tokens con completion de 96 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 9,5 GB en disco en formato MLX 8-bit, por lo que se requiere memoria unificada suficiente para cargar los pesos mas el contexto.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (serie M). No se declara soporte para GPU NVIDIA o AMD en esta release.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; el autor documento el ajuste y la fusion en un Apple M6 Mac mini.
- Opciones de despliegue: mlx-lm (libreria declarada); ejemplo oficial con `python -m mlx_lm generate`. No se declara soporte para vLLM, llama.cpp, Ollama o TGI en esta release.
- Latencia y throughput estimados: solo medidos para la variante MLX 4-bit (29,46 tok/s de generacion, 226,34 tok/s de prompt en M6 Mac mini); no hay medicion publicada para esta variante de 8 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-BuildEng-V9-MLX-8bit | 8.953.801.728 | no disponible | MIT (derivado) | MLX 8-bit | Ajuste vertical de ingenieria estructural, solo ingles |
| ornith-ai/Ornith-1.5-9B (base) | ~9B | no disponible | MIT | safetensors | Modelo generalista sin especializacion vertical |
| ornith-ai/Ornith-1.5-9B-MLX-8bit | ~9B | no disponible | MIT | MLX 8-bit | Base oficial en MLX 8-bit, sin ajuste de dominio |
| Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-4bit | ~9B | no disponible | MIT | MLX 4-bit | Misma especializacion, menor huella y velocidad medida |

## Limitaciones y advertencias

- El autor advierte explicitamente que el modelo no es un sistema certificado de diseno estructural y que sus salidas son orientativas.
- Puede omitir precauciones urgentes, producir calculos inexactos o citar incorrectamente disposiciones normativas.
- Toda recomendacion con relevancia para la seguridad debe ser verificada de forma independiente por profesionales cualificados.
- Riesgo de alucinacion en referencias normativas, valores numericos y procedimientos de calculo.
- Solo soporta ingles; no se declara cobertura de castellano ni de otros idiomas.
- La licencia MIT del derivado obliga a conservar los avisos upstream (MIT de Ornith AI / DeepReinforce y Apache-2.0 de Qwen3.5) en cualquier redistribucion.
- El formato MLX restringe el despliegue a hardware Apple Silicon; no es portable a stacks CUDA sin conversion.
- No se han publicado benchmarks de calidad tecnica; una prueba funcional breve no constituye una evaluacion de seguridad ni de precision.
- El repositorio no registra descargas ni likes, por lo que no existe validacion comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-8bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Base MLX 8-bit oficial: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-8bit
- Variante MLX 4-bit del mismo ajuste: https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-4bit
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
