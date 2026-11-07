# Outlier-Ai/DeepSeek-R1-Distill-Qwen-14B-MLX-4bit

## Resumen

DeepSeek-R1-Distill-Qwen-14B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo DeepSeek-R1-Distill-Qwen-14B, publicada por Outlier-Ai para su ejecución local en Apple Silicon. No se trata de un modelo nuevo: los pesos son los del destilado oficial de DeepSeek, y este repositorio solo cambia el formato en disco (safetensors MLX 4-bit, plantilla de chat y tokenizador) para que pueda cargarse con `mlx-lm` y con la aplicación Outlier para macOS.

El modelo base es un destilado de razonamiento de DeepSeek sobre la arquitectura Qwen2 de 14B parámetros, entrenado para producir cadenas de pensamiento largas antes de responder. La cuantización a 4 bits con grupo de 64 y simétrica reduce el peso del repositorio a 8,3 GB, lo que lo hace viable en Macs con memoria unificada de gama alta sin conexión a la nube.

Su relevancia actual está en la combinación de razonamiento tipo R1 con despliegue totalmente local y privado en hardware de consumo Apple, manteniendo la licencia MIT del modelo original y soporte declarado para diez idiomas, incluido el castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit, safetensors, grupo de 64, simetrica |
| Idiomas soportados | en, zh, fr, es, pt, de, ru, ja, ko, ar |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX 4-bit), shards multiples |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2 con 14.770.033.664 parametros, destilado por DeepSeek a partir de su modelo de razonamiento R1. La destilacion transfiere el comportamiento de cadena de pensamiento (chain-of-thought) del modelo profesor a una arquitectura densa de menor tamano, de modo que el modelo genera trazas de razonamiento extensas antes de emitir la respuesta final. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO aplicadas.

La intervencion de Outlier-Ai se limita a la conversion de formato: cuantizacion MLX 4-bit con tamano de grupo 64 y esquema simetrico, empaquetado en safetensors por shards, junto con `config.json`, tokenizador y `chat_template.jinja`. Es compatible con `mlx-lm` 0.31.x y no modifica los pesos mas alla de la cuantizacion. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en esta conversion.

## Capacidades

- Generacion de texto con razonamiento explicito: produce cadenas de pensamiento antes de la respuesta final, util para matematicas, logica y problemas de varios pasos.
- Razonamiento matematico y aritmetico: los ejemplos de la model card incluyen problemas de proporcionalidad, acertijos de logica y problemas de cinematica.
- Generacion de codigo y soporte de function calling, segun las etiquetas del repositorio.
- Conversacion multi-turno con plantilla de chat propia (`chat_template.jinja`).
- Capacidades multilingues declaradas para diez idiomas: ingles, chino, frances, espanol, portugues, aleman, ruso, japones, coreano y arabe.
- Ejecucion totalmente local y offline en Apple Silicon (M1, M2, M3, M4), sin llamadas a API ni envio de datos a la nube.
- Integracion con `mlx-lm` mediante CLI y API de Python.

## Casos de uso

- Razonamiento matematico asistido en local: el modelo puede resolver problemas de varios pasos mostrando el desarrollo, adecuado para entornos educativos o de analisis donde no se permite enviar datos a servicios externos.
- Asistente de codigo privado en Mac: con soporte de function calling y ejecucion offline, se puede integrar en flujos de trabajo de desarrollo para explicar fragmentos, generar parches o redactar pruebas sin filtrar codigo propietario.
- Analisis de documentos sensibles: al ejecutarse sin conexion, permite procesar textos confidenciales (legal, sanitario, financiero) en el propio portatil o Mac Studio.
- Prototipado de agentes con razonamiento multi-paso: la traza de pensamiento explicita facilita depurar cadenas de decision en prototipos de agentes antes de migrar a infraestructura mayor.
- Atencion al cliente en idiomas minoritarios dentro del conjunto soportado: cubre conversaciones en espanol, portugues, frances, aleman, japones o arabe con una unica implementacion local.
- Desarrollo y pruebas de pipelines MLX: sirve como modelo de referencia para validar integraciones con `mlx-lm` y la aplicacion Outlier antes de desplegar conversiones mayores (32B) o menores (7B, 8B).
- Uso en entornos con requisitos de privacidad estrictos: la ausencia de telemetria de inferencia y el caracter offline del despliegue encajan con politicas de no-cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tokens por segundo en Macs de la serie M, pero esos datos no se incluyen en el material proporcionado y no se reproducen aqui.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 8,3 GB en disco en cuantizacion 4-bit; se recomienda al menos 12-16 GB de memoria unificada para cargar el modelo y mantener contexto, y 24 GB o mas para contextos largos y margen de seguridad.
- Hardware objetivo: Apple Silicon exclusivamente (M1, M2, M3, M4), incluidos MacBook Air, MacBook Pro, Mac mini y Mac Studio, segun las etiquetas del repositorio.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables, ya que el formato MLX esta pensado para Metal en Apple Silicon; para CUDA seria necesario usar los pesos originales en safetensors BF16 o una cuantizacion GGUF/AWQ.
- Despliegue: `mlx-lm` 0.31.x (CLI `python -m mlx_lm.generate` o API `mlx_lm.load`), y la aplicacion Outlier para macOS mediante `brew install --cask outlier-host/tap/outlier`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-14B-MLX-4bit (este) | 14,77B | no disponible | MLX 4-bit | MIT | Apple Silicon |
| DeepSeek-R1-Distill-Qwen-7B-MLX-4bit (Outlier-Ai) | ~7B | no disponible | MLX 4-bit | MIT | Apple Silicon |
| DeepSeek-R1-Distill-Qwen-32B-MLX-4bit (Outlier-Ai) | ~32B | no disponible | MLX 4-bit | MIT | Apple Silicon |
| DeepSeek-R1-Distill-Llama-8B-MLX-4bit (Outlier-Ai) | ~8B | no disponible | MLX 4-bit | MIT | Apple Silicon |

La comparativa se limita a las conversiones del mismo autor listadas en la model card, ya que no se dispone de datos de rendimiento del modelo base ni de alternativas para establecer comparaciones cuantitativas. El 14B ocupa un punto intermedio entre el 7B/8B (mas ligero, menor memoria) y el 32B (mayor calidad potencial pero requiere mas memoria unificada).

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la calidad del razonamiento respecto a los pesos originales en BF16, especialmente en cadenas de pensamiento largas y tareas matematicas complejas.
- Riesgo de alucinacion inherente a los modelos de razonamiento destilados; las trazas de pensamiento no garantizan correccion factual.
- La longitud de contexto no se especifica en la informacion disponible; conviene verificarla en el `config.json` antes de disenar flujos con documentos largos.
- El soporte multilingue esta declarado por etiquetas, pero no se aportan evaluaciones por idioma; el rendimiento en espanol, arabe o coreano puede ser inferior al de ingles y chino.
- Restriccion de plataforma: el formato MLX solo funciona en Apple Silicon; no es portable a CUDA ni a CPU x86 sin reconvertir.
- La licencia MIT del modelo base permite uso comercial, pero conviene consultar la model card original de DeepSeek para condiciones adicionales de uso responsable.
- La model card promociona la aplicacion Outlier (con version Pro de pago); el modelo en si es gratuito, pero el ecosistema de despliegue recomendado esta vinculado a ese producto.
- No hay datos publicados de benchmarks ni de latencia en la informacion disponible, por lo que las decisiones de produccion deberian basarse en evaluaciones propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-14B-MLX-4bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Conversion equivalente de Outlier: https://huggingface.co/Outlier-Ai/Outlier-R1-Distill-14B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (MLX 4-bit): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-32B (MLX 4-bit): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-32B-MLX-4bit
- DeepSeek-R1-Distill-Llama-8B (MLX 4-bit): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Llama-8B-MLX-4bit
- Outlier-Core-27B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Aplicacion Outlier para macOS: https://outlier.host/
- Benchmarks declarados por Outlier: https://outlier.host/benchmarks
