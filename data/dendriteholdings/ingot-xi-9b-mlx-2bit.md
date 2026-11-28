# dendriteholdings/Ingot-XI-9B-MLX-2bit

## Resumen

Ingot-XI-9B-MLX-2bit es un modelo de generacion de texto de 9.410.903.280 parametros (aproximadamente 9,4 mil millones) publicado por dendriteholdings como espejo publico del ganador de Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador selecciona la copia que permanece mas proxima a el. El modelo deriva de Prism ML Ternary Bonsai 2 9B, que a su vez es una variante ternaria de Qwen3.5-9B, y se distribuye en formato MLX affine 2-bit para Apple Silicon.

Tecnicamente, el modelo conserva los codigos ternarios del modelo base pero reajusta el resto de pesos para acercarse mas al profesor Qwen3.5-9B. Cada bloque de 128 pesos mantiene sus codigos ternarios y su escala fp16, de modo que cada peso decodifica al mismo valor numerico que usa el kernel GGUF del gemelo. El resultado son 2,25 bits por peso y un unico fichero safetensors de 3,46 GB, lo que permite ejecutar un modelo de casi 9,4 mil millones de parametros en equipos con memoria unificada modesta.

Su relevancia es doble: por un lado, demuestra que la cuantizacion ternaria de un transformer denso de 9B puede mantener una divergencia KL de 0,05933 respecto al profesor BF16, apenas un 4 % peor que la del modelo que gano la evaluacion previa (0,06191); por otro, expone un pipeline de cuantizacion competitivo (Bittensor) y un formato propietario (`prism_hadamard_qwen35`) que requiere tooling especifico, ya que mlx-lm no lo carga de forma nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5-9B, con pesos ternarios (2-bit codes + fp16 scale y bias por bloque de 128 pesos) y layout `prism_hadamard_qwen35` |
| Parametros totales | 9.410.903.280 (9,4 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit ternario (2,25 bits por peso, escalas fp16 y bias por cada 128 pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit), 3,46 GB |
| Tamano del repositorio | 3,5 GB |
| Libreria | mlx |
| Modelo base | prism-ml/Ternary-Bonsai-2-9B-mlx-2bit |
| Relacion con el base | finetune (reajuste de pesos no ternarios) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 9,4 mil millones de parametros cuya estructura subyacente corresponde a Qwen3.5-9B, segun la model card. La innovacion principal no esta en la arquitectura sino en el esquema de cuantizacion: cada bloque de 128 pesos se representa con codigos ternarios mas una escala fp16 y un bias igual a menos la escala, de forma que el peso decodificado coincide exactamente con el que produce el kernel GGUF del gemelo. Esto equivale a valores MLX affine 2-bit y da 2,25 bits por peso en total.

El entrenamiento no sigue un pipeline clasico de preentrenamiento y RLHF, sino un proceso de competicion: el minero `5FNQnxsBBS9P4WZjgDgWWvbsaUJQkM5vSf7kunFUWueEejaz` (uid 240) tomo los codigos ternarios de Ternary Bonsai 2 y reajusto el resto de pesos para minimizar la divergencia respecto al profesor Qwen3.5-9B. El validador de Ingot evalua la KL por token de respuesta entre las distribuciones del modelo y las del profesor BF16, ponderando por la cuota de cada dominio en la muestra. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. La torre de vision, la configuracion, el tokenizer y los vectores de signo de Hadamard provienen del modelo base de Prism ML y no se modifican en la competicion.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y respuesta a instrucciones heredados del linaje Qwen3.5-9B, aunque degradados por la cuantizacion ternaria.
- Capacidad multimodal potencial por la torre de vision heredada de Prism ML, si bien la model card no detalla su funcionamiento ni su calidad tras la cuantizacion.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Sin cabecera MTP (multi-token prediction) en este repositorio, por lo que la decodificacion especulativa no esta disponible y MTPLX genera un token por paso.
- Servible como API compatible con OpenAI mediante MTPLX.

## Casos de uso

- Inferencia local en Apple Silicon con memoria unificada limitada: con 3,46 GB de pesos, el modelo cabe en Macs de 16 GB o incluso 8 GB, permitiendo ejecutar un 9B en hardware de consumo donde un BF16 equivalente (unos 18 GB) no cabraria.
- Prototipado rapido de asistentes conversacionales en portatiles Mac: el despliegue con `mtplx serve` expone una API compatible con OpenAI, lo que facilita integrar el modelo en aplicaciones existentes sin reescribir el cliente.
- Evaluacion de tecnicas de cuantizacion extrema: investigadores pueden reproducir la metrica KL frente al profesor y comparar variantes ternarias, ya que la model card publica el valor exacto (0,05933) y el del modelo vencedor anterior (0,06191).
- Investigacion sobre subnets de Bittensor: el modelo sirve como referencia de como se estructura una submission ganadora de Ingot, incluyendo hotkey, uid y submission ID, util para estudiar mecanismos de incentivos en cuantizacion.
- Generacion de texto offline en entornos con restricciones de red o privacidad: al ejecutarse localmente y sin llamadas a API, es apto para procesar documentos sensibles en el dispositivo.
- Benchmarking de kernels MLX frente a GGUF/llama.cpp: al existir un gemelo GGUF con pesos identicos, permite comparar rendimiento y fidelidad numerica entre ambos backends en el mismo hardware.
- Docencia y demostraciones de cuantizacion ternaria: el reducido tamano del repo (3,5 GB) y el unico fichero de pesos simplifican su uso en talleres y cursos.

## Benchmarks y rendimiento

La unica metrica publicada es la divergencia KL por token de respuesta frente al profesor BF16 Qwen3.5-9B, ponderada por dominio:

| Metrica | Ingot-XI-9B-MLX-2bit | Modelo vencedor previo (misma evaluacion) |
|---|---|---|
| KL(profesor ‖ modelo) | 0,05933 | 0,06191 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 3,46 GB solo para pesos; con overhead de ejecucion y cache KV, se recomienda un minimo de 6-8 GB de memoria unificada.
- GPU Apple Silicon: cualquier chip de la familia M1, M2, M3 o M4 con al menos 8 GB de memoria unificada; rendimiento optimo en configuraciones de 16 GB o mas.
- GPU NVIDIA: no aplicable de forma nativa, ya que el formato es MLX affine 2-bit y el layout `prism_hadamard_qwen35` no lo carga mlx-lm; para CUDA existe el gemelo GGUF en el fork de llama.cpp de Dendrite.
- Cabe en GPU de consumo: si, en Macs con memoria unificada; en el ecosistema NVIDIA habria que usar el gemelo GGUF.
- Opciones de despliegue: MTPLX (`pip install mtplx`, `mtplx serve`) como servidor compatible con OpenAI; el gemelo GGUF en el fork Dendrite de llama.cpp. vLLM, TGI y Ollama no estan soportados segun la informacion disponible.
- Latencia y throughput: no disponibles. Al no incluir cabecera MTP, la decodificacion es de un token por paso, lo que limita el throughput frente a esquemas especulativos.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ingot-XI-9B-MLX-2bit | 9,4 B | 2-bit ternario (2,25 bpw) | no disponible | no disponible | safetensors MLX | KL 0,05933 frente al profesor |
| prism-ml/Ternary-Bonsai-2-9B-mlx-2bit | ~9 B | 2-bit ternario | no disponible | no disponible | safetensors MLX | Modelo base sin reajuste del minero |
| dendriteholdings/Ingot-XI-9B-Q2 | 9,4 B | 2-bit ternario | no disponible | no disponible | GGUF | Gemelo para llama.cpp con pesos identicos |
| Qwen3.5-9B (profesor) | ~9 B | BF16 | no disponible | no disponible | safetensors | Referencia de calidad; requiere ~18 GB |

La comparacion con alternativas fuera del linaje (por ejemplo, otros 9B cuantizados a 4 bits en GGUF) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion ternaria introduce degradacion medible: la KL de 0,05933 frente al profesor implica una distribucion de salida distinta, con mayor riesgo de errores en tareas que requieren precision numerica o factual.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de calibracion; al ser un modelo de 9B cuantizado a 2 bits, la fiabilidad en conocimiento factual es incierta.
- Idiomas soportados no declarados: no hay garantia de calidad multilingue mas alla del ingles, y el castellano no esta confirmado.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor o con Prism ML antes de desplegarlo en produccion.
- Tooling limitado: mlx-lm no carga el layout `prism_hadamard_qwen35`; solo MTPLX (para MLX) y el fork Dendrite de llama.cpp (para GGUF) estan documentados.
- Sin decodificacion especulativa: la ausencia de cabecera MTP reduce el throughput en comparacion con variantes que si la incluyen.
- Procedencia competitiva: el modelo es el resultado de una submission de un minero en un subnet de Bittensor; no ha pasado por un proceso editorial de Prism ML ni de Qwen, y la model card no documenta auditorias de sesgo.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en comunidad ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XI-9B-MLX-2bit
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-XI-9B-Q2
- Modelo base MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- MTPLX (servidor compatible con OpenAI): https://github.com/youssofal/mtplx
- Fork Dendrite de llama.cpp: https://github.com/DendriteLabs/llama.cpp
