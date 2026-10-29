# dendriteholdings/Ingot-XVI-27B-MLX-2bit

## Resumen

Ingot-XVI-27B-MLX-2bit es un modelo de generación de texto de 27.359.638.768 parámetros con pesos ternarios (2,25 bits por peso) empaquetado para Apple Silicon. Lo publica dendriteholdings como espejo del modelo ganador de Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador corona la copia que más se le aproxima. No es un entrenamiento desde cero: es la variante MLX del paquete GGUF dendriteholdings/Ingot-XVI-27B-Q2, con los mismos pesos ternarios reescritos en el formato affine de 2 bits de MLX.

El punto de partida es Ternary Bonsai 2 27B, de Prism ML, derivado de la familia Qwen3.5 y con un profesor de referencia Qwen3.8-27B. El minero conservó los códigos ternarios y reajustó el resto de pesos para acercarse al profesor; la torre de visión, el tokenizador, la configuración y los vectores de signo de Hadamard son los originales de Prism y no se modifican en la competición. El resultado ocupa 8,60 GB en un único `model.safetensors` y está pensado para inferencia local en Mac.

Su interés es doble: por un lado, demuestra que un 27B ternario puede ejecutarse a 55-66 tokens por segundo en un Mac Studio M3 Ultra; por otro, documenta métricas de fidelidad frente al profesor (KL de 0,09345 y distancia de estados ocultos de 0,2990) en lugar de benchmarks convencionales. La licencia y los idiomas soportados no están declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de la familia Qwen3.5 (tag `prism_hadamard_qwen35`), con pesos ternarios y rotación de Hadamard; no se especifica si es denso o MoE |
| Parametros totales | 27.359.638.768 (27,36 mil millones) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria de 2 bits, 2,25 bits por peso: códigos de 2 bits más escala fp16 y bias −d por bloque de 128 pesos, en formato affine de MLX; el gemelo se distribuye en GGUF Q2 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 8,60 GB en un único `model.safetensors`; el gemelo equivalente se publica en GGUF |

## Arquitectura y entrenamiento

El modelo parte de Ternary Bonsai 2 27B de Prism ML, una arquitectura transformer de la familia Qwen3.5 con pesos ternarios y rotación de Hadamard (layout `prism_hadamard_qwen35`). La competición no reentrena el modelo: los mineros reciben un profesor fijo en BF16 y presentan cuantizaciones; el validador mide la divergencia de cada candidata respecto al profesor y corona la más fiel. Este paquete conserva los códigos ternarios del envío ganador y reajusta el resto de pesos (las escalas) para acercarse al profesor Qwen3.8-27B.

La conversión a MLX se declara sin pérdida: cada bloque de 128 pesos mantiene sus códigos ternarios y su escala fp16 como valores affine de 2 bits (escala d, bias −d), de modo que cada peso decodifica al mismo número que usa el kernel GGUF. La torre de visión, la configuración, el tokenizador y los vectores de signo de Hadamard provienen intactos del modelo de Prism. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el ajuste descrito es de cuantización y refinamiento de pesos, no un post-entrenamiento con preferencias. La innovación técnica destacable es el empaquetado affine de 2 bits compatible con MLX más el soporte de decodificación especulativa mediante la cabeza multi-token de MTPLX (`--generation-mode mtp --depth 1`).

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Decodificación especulativa: la cabeza de borrador multi-token de MTPLX eleva el throughput de 55,3 a 66,6 tokens/s en el hardware medido.
- Ejecución nativa en Apple Silicon a través de MLX, con carga en cualquier runtime que lea el layout `prism_hadamard_qwen35`.
- Visión: el paquete incluye la torre de visión heredada de Prism, no modificada por el minero; no se documenta su comportamiento tras el reajuste de pesos ni se evalúa en las métricas publicadas.
- Razonamiento, código y matemáticas: se heredan del profesor Qwen3.8-27B según el autor, sin benchmarks publicados que lo cuantifiquen.
- Tool calling y function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Modo thinking explícito: no documentado.

## Casos de uso

- Inferencia local en Mac para asistentes de texto: el checkpoint de 8,60 GB y el soporte de MLX permiten ejecutar un 27B en un equipo de sobremesa Apple sin conexión a servicios externos, útil cuando el texto no puede salir del dispositivo.
- Servidor HTTP local de generación: MTPLX 2.12 expone el modelo por HTTP y alcanza 66,6 tokens/s en decodificación especulativa con lote 1, suficiente para prototipar interfaces conversacionales en red local.
- Asistencia de código en estación de trabajo: con 66,6 tokens/s de decodificación sobre un prompt de código (medición del autor con 256 tokens generados vía HTTP), el modelo es viable para autocompletado interactivo en un Mac Studio.
- Investigación en cuantización ternaria: las métricas de KL (0,09345) y distancia de estados ocultos (0,2990) frente al profesor permiten usar el modelo como referencia reproducible al comparar nuevos esquemas de cuantización de 2 bits.
- Replicación de evaluaciones de la subred Ingot: el paquete incluye el hotkey del minero (uid 239) y el identificador del envío coronado, lo que facilita auditar el proceso de selección o reejecutar la comparación contra el "king" anterior.
- Procesamiento por lotes de documentos confidenciales en Apple Silicon: al ejecutarse en memoria unificada local, encaja en flujos de resumen o extracción sobre material sensible sin transferencia a terceros.
- Desarrollo y prueba de kernels MLX: al decodificar cada peso al mismo valor que el kernel GGUF, sirve como caso de prueba cruzado entre implementaciones MLX y llama.cpp (56,4 tokens/s en el gemelo GGUF sobre el mismo Mac).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica únicamente métricas de fidelidad respecto al profesor BF16 y medidas de velocidad.

Fidelidad frente al profesor (por token de respuesta; menor es mejor):

| Modelo | KL(profesor ‖ modelo) | Distancia de estados ocultos |
|---|---|---|
| Ingot-XVI-27B-MLX-2bit (en su eval ganadora) | 0,09345 | 0,2990 |
| El "king" al que batió, misma eval | 0,09506 | 0,3026 |

Velocidad de decodificación (lote 1, Mac Studio M3 Ultra, GPU de 80 núcleos, 512 GB):

| Motor | Modo | Tokens/s en decodificación |
|---|---|---|
| MTPLX 2.12 (mlx 0.32), servidor | simple | 55,3 |
| MTPLX 2.12 (mlx 0.32), servidor | especulativo (`mtp`, profundidad 1) | 66,6 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, en proceso | simple | 59,9 |
| Gemelo GGUF en el fork de llama.cpp de Dendrite | no indicado | 56,4 (mismo Mac) / 137 (RTX PRO 6000) |

## Requisitos de hardware

- VRAM/memoria: el checkpoint pesa 8,60 GB; hay que sumar caché KV y el overhead del runtime. Un Mac con 16 GB de memoria unificada es el mínimo razonable (estimación, no medida publicada); 32 GB o más deja margen para contextos largos.
- Hardware medido por el autor: Mac Studio M3 Ultra con GPU de 80 núcleos y 512 GB de memoria unificada.
- GPU consumer: sí, en Apple Silicon. No hay soporte MLX para CUDA; en NVIDIA la única vía documentada es el gemelo GGUF mediante el fork de llama.cpp de Dendrite, que alcanza 137 tokens/s en una RTX PRO 6000.
- Despliegue: `mlx_lm.generate --model dendriteholdings/Ingot-XVI-27B-MLX-2bit` tras `pip install mlx-lm`; servidor MTPLX 2.12 con mlx 0.32; cualquier runtime que implemente el layout `prism_hadamard_qwen35`. vLLM, TGI y Ollama no están documentados para este paquete.
- Throughput: 55,3 tokens/s en modo simple vía servidor, 66,6 con decodificación especulativa, 59,9 en proceso con mlx-lm 0.31 y kernels de MTPLX (128 tokens generados, sin servidor). Latencia hasta el primer token no disponible.
- Se recomienda GPU de 80 núcleos o superior; no se han publicado mediciones en MacBook Air o Mac mini.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Ingot-XVI-27B-MLX-2bit | 27,36 mil millones | no disponible | safetensors MLX, 2,25 bits/peso (8,60 GB) | no disponible | KL 0,09345; 55,3-66,6 tokens/s en M3 Ultra |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (base) | 27,36 mil millones | no disponible | safetensors MLX, 2 bits ternarios | no disponible | Mismo layout, tokenizador y torre de visión; sin el reajuste del minero |
| dendriteholdings/Ingot-XVI-27B-Q2 (gemelo GGUF) | 27,36 mil millones | no disponible | GGUF Q2 | no disponible | Mismos pesos; 56,4 tokens/s en M3 Ultra y 137 tokens/s en RTX PRO 6000 |
| "King" anterior de Ingot (no identificado) | no disponible | no disponible | Q2 | no disponible | KL 0,09506 y distancia 0,3026 en la misma eval |

No se dispone de comparación con modelos de propósito general del mismo tamaño (por ejemplo, la familia Qwen3.8) en términos de benchmarks estándar: las únicas cifras publicadas miden proximidad al profesor, no calidad absoluta.

## Limitaciones y advertencias

- Licencia no declarada: sin términos explícitos no hay base clara para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarlo en producción.
- Idiomas no declarados: no se puede asumir un rendimiento multilingüe aunque el modelo base sea de la familia Qwen.
- Contexto desconocido: la longitud de ventana no figura en la información disponible, lo que impide dimensionar caché KV y planificar cargas de documentos largos.
- Degradación por cuantización: el KL de 0,09345 respecto al profesor indica una divergencia medible en la distribución de siguiente token; en tareas sensibles a la precisión (matemáticas, código con APIs estrictas) el comportamiento puede diferir del modelo completo.
- Las métricas publicadas miden fidelidad al profesor, no corrección: un modelo muy cercano a un profesor mediocre seguiría siendo mediocre. No hay MMLU, HumanEval ni GSM8K que permitan situarlo frente a alternativas.
- Riesgo de alucinación: no evaluado ni documentado por el autor; aplica el riesgo habitual de un modelo de 27B cuantizado a 2 bits sin post-entrenamiento con preferencias declarado.
- Sesgos: no se han publicado análisis de sesgo, composición del dataset ni evaluaciones de seguridad.
- Dependencia de plataforma: el paquete MLX solo se ejecuta en Apple Silicon; en CUDA o ROCm hay que recurrir al gemelo GGUF y a un fork específico de llama.cpp.
- Madurez: 0 descargas y 0 "me gusta" en el momento de la consulta; sin validación independiente de la comunidad.
- Origen competitivo: el modelo está optimizado para minimizar la divergencia frente a un profesor concreto dentro de una subred, no para uso general; su model card está redactada como registro de competición.
- La torre de visión se hereda sin verificación de que siga siendo funcional tras el reajuste de pesos del minero.

## Enlaces

- [Modelo en HuggingFace: dendriteholdings/Ingot-XVI-27B-MLX-2bit](https://huggingface.co/dendriteholdings/Ingot-XVI-27B-MLX-2bit)
- [Modelo base MLX: prism-ml/Ternary-Bonsai-2-27B-mlx-2bit](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit)
- [Modelo base GGUF: prism-ml/Ternary-Bonsai-2-27B-gguf](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf)
- [Gemelo GGUF del mismo envío: dendriteholdings/Ingot-XVI-27B-Q2](https://huggingface.co/dendriteholdings/Ingot-XVI-27B-Q2)
- [Fork de llama.cpp de DendriteLabs](https://github.com/DendriteLabs/llama.cpp)
- No se han encontrado otros enlaces relevantes: la búsqueda web devolvió únicamente resultados sobre Abraham Lincoln, sin relación con el modelo.
