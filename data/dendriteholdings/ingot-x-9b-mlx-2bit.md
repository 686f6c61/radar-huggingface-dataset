# dendriteholdings/Ingot-X-9B-MLX-2bit

## Resumen

Ingot-X-9B-MLX-2bit es un modelo de generacion de texto de 9.410.903.280 parametros (aproximadamente 9,4 mil millones) publicado por dendriteholdings como espejo publico de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo maestro fijo y el validador premia la copia que se mantiene mas proxima a el. El modelo parte de prism-ml/Ternary-Bonsai-2-9B-mlx-2bit, un modelo ternario de Prism ML, y el minero reajusto los pesos restantes para acercar la salida al profesor Qwen3.5-9B.

La relevancia del modelo es doble. Por un lado, es un ejemplo de cuantizacion ternaria extrema (2 bits por peso en codigos, 2,25 bits por peso efectivos incluyendo escala y sesgo en fp16 cada 128 pesos) aplicada a un transformer de casi 9,4 mil millones de parametros, lo que reduce el peso a 3,46 GB. Por otro, demuestra un flujo de trabajo competitivo tipo "destilacion por cuantizacion" donde la metrica de exito es la divergencia KL respecto al profesor, no benchmarks estandar de capacidad.

El modelo esta empaquetado en formato MLX para Apple Silicon con el layout propietario `prism_hadamard_qwen35`, que mlx-lm no carga de forma nativa; requiere la herramienta MTPLX. No se dispone de informacion sobre licencia, idiomas soportados ni datos de benchmarks convencionales en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (layout `prism_hadamard_qwen35`, pesos ternarios con transformada de Hadamard) |
| Parametros totales | 9.410.903.280 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit ternario (codigos ternarios, escala fp16 y sesgo por bloque de 128 pesos; 2,25 bits por peso efectivos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX); existe un gemelo GGUF en dendriteholdings/Ingot-X-9B-Q2 |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Ternary Bonsai 2 9B de Prism ML, que a su vez se basa en Qwen3.5-9B como profesor. La innovacion central es la representacion ternaria de pesos: cada bloque de 128 pesos conserva codigos ternarios y una escala fp16 mas un sesgo, de modo que cada peso decodifica al mismo valor numerico que usa el kernel GGUF original. El layout `prism_hadamard_qwen35` incorpora vectores de signo de Hadamard (proporcionados por Prism ML) para la transformada que precede a la cuantizacion.

El proceso de entrenamiento del minero consistio en reajustar los pesos no ternarios para acercar las distribuciones de siguiente token a las del profesor BF16 Qwen3.5-9B, midiendo la divergencia KL por token de respuesta ponderada por dominio. No se dispone de informacion sobre el volumen de datos de entrenamiento, composicion del dataset ni uso de RLHF o DPO. La torre de vision, la configuracion, el tokenizer y los vectores de signo de Hadamard son los originales de Prism ML y no fueron modificados por la competicion.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tags `conversational`).
- Razonamiento y respuesta a instrucciones heredados del profesor Qwen3.5-9B, aunque degradados por la cuantizacion ternaria.
- Capacidad de vision: el modelo incluye una torre de vision heredada de Ternary Bonsai 2 9B (segun la model card, la torre de vision es de Prism ML).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas no estan declarados.
- Modo thinking explicito: no disponible.
- Decodificacion especulativa: el repositorio no incluye cabecera MTP draft, por lo que MTPLX decodifica un token por paso.

## Casos de uso

- Despliegue en Apple Silicon con memoria unificada limitada: con 3,46 GB de pesos, el modelo cabe en Macs con 8 GB de RAM unificada, lo que permite ejecutar un modelo de 9,4 mil millones de parametros en hardware de consumo.
- Prototipado rapido de asistentes conversacionales en local: la API compatible con OpenAI de MTPLX permite sustituir un endpoint remoto por un servidor local sin cambiar el codigo del cliente.
- Investigacion sobre cuantizacion extrema: sirve como referencia reproducible para estudiar el impacto de la cuantizacion ternaria en la fidelidad respecto a un profesor BF16, con la metrica KL documentada (0,06047 frente a 0,06321 del rey anterior).
- Evaluacion de pipelines de Bittensor e Ingot: util para mineros y validadores que quieran inspeccionar el formato de submission ganadora y reproducir el calculo de KL.
- Experimentos de destilacion por cuantizacion: el par profesor Qwen3.5-9B / alumno ternario permite medir como se degrada la distribucion de salida al reducir a 2 bits por peso.
- Generacion de texto offline en entornos sin GPU dedicada: al ejecutarse sobre MLX en Apple Silicon, encaja en flujos de trabajo de escritorio o portatiles sin acceso a CUDA.
- Fine-tuning ligero o adaptacion posterior: al estar en safetensors y ser compatible con MLX, puede servir de base para LoRA o ajustes sobre el modelo ternario (siempre que la herramienta soporte el layout).

## Benchmarks y rendimiento

La model card solo publica la metrica de fidelidad al profesor (KL por token de respuesta, ponderada por dominio):

| Metrica | Ingot-X-9B-MLX-2bit | Rey anterior en la misma evaluacion |
|---|---|---|
| KL(profesor ‖ modelo) | 0,06047 | 0,06321 |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 3,46 GB de pesos en safetensors; en la practica se necesita algo mas para el estado de activaciones y el contexto, por lo que se recomienda un minimo de 6-8 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el uso de MLX. No se indica soporte para CUDA en este repositorio.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; en el ecosistema NVIDIA no se documenta soporte para este empaquetado MLX (existe el gemelo GGUF en el fork de llama.cpp de Dendrite).
- Opciones de despliegue: MTPLX (`mtplx serve`), que expone una API compatible con OpenAI. mlx-lm no carga el layout `prism_hadamard_qwen35`. Para GGUF, el fork DendriteLabs/llama.cpp.
- Latencia y throughput: no disponibles; la model card indica que sin cabecera MTP draft se decodifica un token por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-X-9B-MLX-2bit | 9,41 B | no disponible | 2-bit ternario (2,25 bpw) | no disponible | Hugging Face (MLX) |
| prism-ml/Ternary-Bonsai-2-9B-mlx-2bit | ~9 B | no disponible | 2-bit ternario | no disponible | Hugging Face (MLX) |
| dendriteholdings/Ingot-X-9B-Q2 | ~9 B | no disponible | 2-bit ternario | no disponible | Hugging Face (GGUF) |
| Qwen3.5-9B (profesor) | ~9 B | no disponible | BF16 | no disponible en esta ficha | no disponible |

La comparativa se limita a los modelos citados en la informacion proporcionada; no se dispone de datos de rendimiento de benchmarks para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion ternaria a 2 bits introduce degradacion inevitable respecto al profesor BF16; la KL publicada (0,06047) cuantifica esa divergencia, no la calidad absoluta.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; al ser un modelo derivado de Qwen3.5-9B con pesos reajustados, se espera un comportamiento similar o peor que el profesor.
- Sesgos conocidos: no documentados en la model card; se heredan los del profesor Qwen3.5-9B y los del proceso de cuantizacion.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados; no se debe asumir el contexto del profesor sin verificacion.
- Restricciones de licencia: la licencia no esta disponible, lo que impide confirmar si el uso comercial esta permitido. Es un riesgo relevante para produccion.
- Dependencia de herramienta: requiere MTPLX o el fork de llama.cpp de Dendrite; mlx-lm no carga el layout `prism_hadamard_qwen35`, lo que limita la portabilidad.
- Sin cabecera MTP draft: la decodificacion es de un token por paso, lo que reduce el throughput frente a variantes con decodificacion especulativa.
- Modelo de competicion: su objetivo declarado es minimizar la KL respecto al profesor, no maximizar capacidades; puede presentar un rendimiento inferior en tareas que el profesor resuelve bien.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-X-9B-MLX-2bit
- Modelo base (MLX): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Gemelo GGUF del mismo autor: https://huggingface.co/dendriteholdings/Ingot-X-9B-Q2
- Herramienta de inferencia MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
