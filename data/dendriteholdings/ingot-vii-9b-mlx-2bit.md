# dendriteholdings/Ingot-VII-9B-MLX-2bit

## Resumen

Ingot-VII-9B-MLX-2bit es un modelo de lenguaje de 9.410.903.280 parámetros (aproximadamente 9,4 mil millones) publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que se mantiene más próxima a él. El modelo deriva de prism-ml/Ternary-Bonsai-2-9B-mlx-2bit, un modelo ternario de Prism ML, cuyos pesos no ternarios fueron reajustados por el minero para acercarse más a Qwen3.5-9B.

La relevancia del modelo es doble. Por un lado, es un ejemplo de cuantización ternaria extrema (2 bits por peso) empaquetada específicamente para Apple Silicon mediante MLX, con un tamaño de repositorio de solo 3,5 GB. Por otro, documenta un proceso de optimización competitiva orientado a minimizar la divergencia KL respecto al profesor BF16, con un resultado declarado de KL 0,07117 frente al 0,07465 del modelo que desbancó.

El modelo se distribuye con el layout propietario `prism_hadamard_qwen35`, que mlx-lm no puede cargar de forma nativa y requiere la herramienta MTPLX. No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks convencionales en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B, con layout `prism_hadamard_qwen35` y pesos ternarios) |
| Parametros totales | 9.410.903.280 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits por peso (códigos ternarios con escala fp16 y sesgo por bloque de 128 pesos; 2,25 bits por peso efectivos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit) |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de la familia Qwen3.5, con la torre de visión, configuración, tokenizer y vectores de signo Hadamard heredados de prism-ml/Ternary-Bonsai-2-9B-mlx-2bit. La innovación principal es la representación ternaria de pesos: cada bloque de 128 pesos conserva sus códigos ternarios y una escala fp16 con sesgo −d, empaquetados como valores MLX affine de 2 bits. Según la model card, cada peso decodifica al mismo número que usa el kernel GGUF del modelo gemelo, de modo que la conversión es sin pérdida respecto al upload del minero.

El entrenamiento no es un preentrenamiento desde cero, sino un reajuste (finetune) de los pesos no ternarios del modelo base de Prism ML para acercarlos al profesor Qwen3.5-9B. La evaluación se realizó midiendo la divergencia KL entre las distribuciones del siguiente token del modelo y las del profesor BF16, ponderando por dominio. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Razonamiento y generación de código heredados de la arquitectura Qwen3.5 subyacente, aunque no se documentan evaluaciones específicas.
- Capacidad de visión potencial: la model card indica que la torre de visión procede del modelo base de Prism ML y no se modifica en la competición, pero no se confirma su funcionamiento en este pack.
- Ejecución en Apple Silicon mediante MLX, con decodificación de un token por paso (el repositorio no incluye cabeza draft MTP).
- Servido como API compatible con OpenAI a través de MTPLX.
- No se documentan capacidades de tool calling, function calling, agentes ni modo thinking en la información disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: con 3,46 GB de pesos en 2 bits, el modelo cabe en equipos Apple Silicon de gama media y permite ejecutar un LLM de 9B sin GPU dedicada, usando MTPLX como servidor.
- Investigación sobre cuantización ternaria: sirve como referencia reproducible para estudiar la degradación de calidad a 2 bits frente a un profesor BF16, gracias a la métrica KL documentada.
- Evaluación de técnicas de destilación y ajuste fino orientado a fidelidad: el modelo es un caso de estudio de cómo reajustar pesos no ternarios para reducir la divergencia respecto al profesor.
- Prototipado de asistentes conversacionales en local: al exponerse como API compatible con OpenAI, puede integrarse en aplicaciones de chat sin depender de servicios en la nube.
- Reproducción de competiciones de cuantización en Bittensor: el modelo documenta el proceso de submission, hotkey y criterio de validación, útil para participantes de la subred Ingot.
- Despliegue en entornos con restricciones de almacenamiento y ancho de banda: el repo de 3,5 GB facilita la distribución y el almacenamiento en caché frente a alternativas de mayor precisión.
- Pruebas de compatibilidad de tooling MLX: permite validar cargadores, kernels y servidores que soporten el layout `prism_hadamard_qwen35`.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo que desbancó |
|---|---|---|
| KL(profesor ‖ modelo) en la eval ganadora | 0,07117 | 0,07465 |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica documentada es la divergencia KL frente al profesor BF16, ponderada por dominio.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5 GB para los pesos en 2 bits, más overhead de activaciones y contexto (no cuantificado en la documentación).
- GPU recomendadas: no se especifican; el formato MLX está orientado a Apple Silicon (series M1, M2, M3, M4 con memoria unificada).
- Compatibilidad con GPU consumer: no se documenta soporte para GPUs NVIDIA o AMD en este pack; el gemelo GGUF funciona en el fork de llama.cpp de Dendrite.
- Opciones de despliegue: MTPLX (`pip install mtplx`, `mtplx serve --model dendriteholdings/Ingot-VII-9B-MLX-2bit --generation-mode ar --port 8080 --no-auth --yes`). mlx-lm no carga el layout `prism_hadamard_qwen35`.
- Latencia y throughput: no disponibles; la model card indica decodificación de un token por paso al no incluir cabeza draft MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-VII-9B-MLX-2bit | 9,41B | no disponible | 2-bit ternario (MLX) | no disponible | Hugging Face |
| prism-ml/Ternary-Bonsai-2-9B-mlx-2bit | ~9B | no disponible | 2-bit ternario (MLX) | no disponible | Hugging Face |
| dendriteholdings/Ingot-VII-9B-Q2 | ~9B | no disponible | 2-bit (GGUF) | no disponible | Hugging Face |
| Qwen3.5-9B (profesor) | ~9B | no disponible | BF16 | no disponible | no disponible |

La comparativa se limita a las variantes del mismo linaje documentadas en la información proporcionada; no se dispone de datos de rendimiento ni de contexto para establecer comparaciones con modelos de otras familias.

## Limitaciones y advertencias

- La cuantización a 2 bits introduce degradación respecto al profesor BF16, cuantificada en una KL de 0,07117; no es equivalente al modelo original en calidad.
- El layout `prism_hadamard_qwen35` no es estándar y requiere MTPLX; mlx-lm y otras herramientas habituales no lo cargan.
- No se incluye cabeza draft MTP, por lo que no hay decodificación especulativa y el throughput es de un token por paso.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial; debe verificarse antes de cualquier despliegue en producción.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; se heredan los del modelo base Qwen3.5 sin evaluación específica.
- El modelo está orientado a Apple Silicon; no hay soporte documentado para CUDA u otras plataformas en este pack.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La torre de visión se hereda del modelo base pero no se confirma su operatividad en este pack; no debe asumirse capacidad multimodal sin verificación.

## Enlaces

- Hugging Face: https://huggingface.co/dendriteholdings/Ingot-VII-9B-MLX-2bit
- Modelo base MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Gemelo GGUF del mismo minero: https://huggingface.co/dendriteholdings/Ingot-VII-9B-Q2
- MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
