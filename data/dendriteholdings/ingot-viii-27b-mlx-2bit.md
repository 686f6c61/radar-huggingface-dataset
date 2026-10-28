# dendriteholdings/Ingot-VIII-27B-MLX-2bit

## Resumen

Ingot-VIII-27B-MLX-2bit es un empaquetado en formato MLX de un modelo de lenguaje de 27.359.638.768 parámetros (27,36 B) cuantizado a 2 bits ternarios, derivado del modelo base Qwen/Qwen3.8-27B. Lo publica el usuario dendriteholdings como espejo público de la submission ganadora del minero `5D31YsKQ9UyBtkxFPUtrF5iojUfLFzX1ct8S2DZVrSW7eXTV` (uid 183) en Ingot, un subnet de Bittensor en el que los mineros cuantizan un profesor fijo y el validador premia la copia que más se le aproxima. No es por tanto un modelo entrenado desde cero, sino el resultado de un proceso de compresión competitivo: los pesos son los del minero, mientras que la torre de visión, la configuración, el tokenizador y los vectores de signo de Hadamard proceden de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit.

Su relevancia es doble. Por un lado, demuestra que una copia ternaria de 2,25 bits por peso (códigos de 2 bits más escala fp16 y sesgo por bloque de 128 pesos) puede mantenerse muy cerca del profesor BF16 en la distribución de siguiente token: KL de 0,10415 y distancia de estados ocultos de 0,3269 en la evaluación del certamen. Por otro, está empaquetado específicamente para Apple Silicon, con velocidades de decodificación de 55,3 a 66,6 tokens por segundo en un Mac Studio M3 Ultra, lo que lo sitúa como una opción de inferencia local de 27 B en memoria unificada de gama alta.

El modelo se distribuye en un único `model.safetensors` de 8,60 GB y se ejecuta con mlx-lm o con el runtime MTPLX. La información publicada no detalla la arquitectura interna del modelo base, la longitud de contexto, los idiomas soportados ni la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; heredada del modelo base Qwen/Qwen3.8-27B (transformador, según la información del autor). El pack incluye una torre de visión procedente de Prism |
| Parámetros totales | 27.359.638.768 (27,36 B) |
| Parámetros activos | No disponible (la información no indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 2 bits ternarios: códigos de 2 bits con escala fp16 y sesgo por bloque de 128 pesos, equivalentes a 2,25 bits por peso en el formato affine 2-bit de MLX; layout `prism_hadamard_qwen35` |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX); existe un gemelo GGUF del mismo contenido publicado como Ingot-VIII-27B-Q2 |

## Arquitectura y entrenamiento

El modelo no se entrena: se cuantiza. El pipeline de Ingot parte de un profesor fijo (Qwen/Qwen3.8-27B en BF16) y evalúa cada copia cuantizada por su fidelidad al profesor, medida como divergencia KL entre las distribuciones de siguiente token por token de respuesta y como distancia relativa de estados ocultos promediada cada ocho capas. La submission ganadora de esta ronda obtiene KL 0,10415 y distancia 0,3269, frente a 0,10593 y 0,3305 del "king" al que desbancó, y mejora en un 18,8 % (KL) y un 28,0 % (estados ocultos) a la referencia de partida Ingot-genesis-27B-Q2.

La conversión a MLX es sin pérdida respecto al upload del minero: cada bloque de 128 pesos conserva sus códigos ternarios y su escala fp16 como valores affine 2-bit de MLX (escala d, sesgo −d), de modo que cada peso decodifica exactamente al mismo número que usa el kernel GGUF. La innovación técnica reseñable no está en el entrenamiento sino en el formato: pesos ternarios con vectores de signo de Hadamard para rotación previa a la cuantización, kernels específicos para MLX y decodificación especulativa mediante la cabeza de borrador multi-token de MTPLX (`--generation-mode mtp --depth 1`). No se documentan composición del dataset, número de tokens, ni fases de RLHF o DPO, porque el modelo hereda los del base sin reentrenamiento.

## Capacidades

- Generación de texto y conversación multi-turno: el pipeline declarado es `text-generation` con etiqueta `conversational`.
- Fidelidad alta al profesor BF16 en la distribución de siguiente token (KL 0,10415), lo que sugiere un comportamiento lingüístico y de razonamiento próximo al modelo base.
- Decodificación especulativa: soporta la cabeza de borrador multi-token de MTPLX con profundidad 1, que eleva la velocidad de 55,3 a 66,6 tokens por segundo en el hardware de referencia.
- Ejecución local en Apple Silicon mediante mlx-lm y MTPLX; también existen kernels ternarios propios integrados en un grafo de mlx-lm.
- Torre de visión incluida en el pack, heredada de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit; la información disponible no documenta si es funcional ni con qué modalidades.
- Soporte de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo de razonamiento explícito (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local de un modelo de 27 B en Mac de gama alta: con 8,60 GB de pesos en 2 bits, el modelo cabe en la memoria unificada de un Mac Studio o un MacBook Pro configurado, y decodifica a 55-67 tokens por segundo, suficiente para asistentes interactivos sin depender de la nube.
- Asistente de código en local para equipos que no pueden enviar código a APIs externas: la velocidad medida sobre un prompt de código (256 tokens generados vía HTTP) y el soporte de decodificación especulativa lo hacen viable en un flujo de autocompletado o revisión dentro del IDE.
- Investigación en compresión de modelos: sirve como referencia reproducible de cuantización ternaria, con métricas de fidelidad al profesor (KL y distancia de estados ocultos) comparables contra genesis y contra el king anterior en la misma evaluación.
- Participación y auditoría en subnets de Bittensor: el paquete documenta hotkey, uid, identificador de submission y procedencia de cada componente (pesos del minero, torre de visión y tokenizador de Prism), lo que permite replicar la evaluación del validador.
- Prototipado de aplicaciones de texto en Apple Silicon: al cargarse con `mlx_lm.generate` en un solo comando, es adecuado para validar prompts, plantillas y flujos conversacionales antes de comprometerse con una GPU dedicada.
- Despliegue en hardware no Apple a través del gemelo GGUF: los mismos pesos corren en el fork de llama.cpp de Dendrite a 137 tokens por segundo en una RTX PRO 6000, lo que permite usar una estación x86 con GPU para servir el modelo y un Mac para desarrollo.
- Docencia y demostraciones sobre cuantización extrema: el contraste entre 2,25 bits por peso y el profesor BF16 con métricas publicadas es material directo para explicar compromisos entre tamaño, velocidad y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son de fidelidad al profesor y de velocidad.

| Métrica (evaluación del certamen) | Este modelo | King al que superó | Mejora |
|---|---|---|---|
| KL(profesor ‖ modelo) por token de respuesta | 0,10415 | 0,10593 | — |
| Distancia relativa de estados ocultos (cada 8 capas) | 0,3269 | 0,3305 | — |
| Mejora frente a Ingot-genesis-27B-Q2 | — | — | 18,8 % en KL; 28,0 % en distancia de estados ocultos |

| Motor y modo (Mac Studio M3 Ultra, 80 núcleos GPU, 512 GB, batch 1) | Tokens/s en decodificación |
|---|---|
| MTPLX 2.12 (mlx 0.32), servidor, modo simple | 55,3 |
| MTPLX 2.12 (mlx 0.32), servidor, especulativo (MTPLX MTP, `--depth 1`) | 66,6 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, en proceso | 59,9 |
| Gemelo GGUF en el fork de llama.cpp de Dendrite, mismo Mac | 56,4 |
| Gemelo GGUF en RTX PRO 6000 | 137 |

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 8,60 GB solo de pesos; con caché KV y overhead de runtime hay que prever del orden de 10-12 GB (estimación propia, no publicada por el autor).
- Cabe en GPU de consumo solo a través del gemelo GGUF; el pack MLX está pensado para memoria unificada de Apple Silicon.
- Hardware de referencia medido: Mac Studio M3 Ultra con GPU de 80 núcleos y 512 GB de memoria unificada (55,3-66,6 tokens/s) y RTX PRO 6000 para el gemelo GGUF (137 tokens/s).
- Despliegue en Apple Silicon: mlx-lm (`pip install mlx-lm`, `mlx_lm.generate --model dendriteholdings/Ingot-VIII-27B-MLX-2bit`) o el runtime MTPLX 2.12 sobre mlx 0.32, que habilita la decodificación especulativa.
- Despliegue fuera de Apple Silicon: únicamente mediante el gemelo GGUF en el fork de llama.cpp de Dendrite o en el fork de llama.cpp de Prism.
- vLLM, TGI, Ollama y otros servidores: no disponibles en la información publicada para este formato.
- Latencia y throughput: 55,3 tokens/s en modo simple y 66,6 tokens/s en especulativo con servidor MTPLX (256 tokens generados sobre prompt de código, medido por HTTP); 59,9 tokens/s en proceso con mlx-lm.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Runtime | Notas |
|---|---|---|---|---|---|---|
| Ingot-VIII-27B-MLX-2bit (este) | 27,36 B | 2-bit ternario MLX, 2,25 bits/peso | No disponible | No disponible | MLX, MTPLX | KL 0,10415; 55,3-66,6 tokens/s en M3 Ultra |
| Ingot-VIII-27B-Q2 (gemelo GGUF) | 27,36 B (mismos pesos) | 2-bit ternario GGUF | No disponible | No disponible | llama.cpp (fork Dendrite) | Mismo contenido; 56,4 tokens/s en M3 Ultra y 137 en RTX PRO 6000 |
| Ingot-genesis-27B-Q2 | 27 B | 2-bit | No disponible | No disponible | llama.cpp | Punto de partida de la competición; este modelo lo mejora un 18,8 % en KL |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | 27 B | 2-bit MLX | No disponible | No disponible | MLX | Origen de la torre de visión, configuración, tokenizador y vectores de Hadamard |
| Qwen/Qwen3.8-27B (profesor BF16) | 27 B | BF16 | No disponible | No disponible | No especificado | Referencia de calidad frente a la que se mide la KL; no es una alternativa de despliegue por tamaño |

## Limitaciones y advertencias

- Cuantización a 2,25 bits por peso: aunque la fidelidad medida es alta (KL 0,10415), no es el modelo original; degradaciones en tareas de razonamiento largo, matemáticas o código no se han caracterizado con benchmarks estándar.
- Ausencia total de benchmarks convencionales: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multilingües, por lo que la calidad en tareas concretas no puede verificarse a priori.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribución, ni las del modelo base Qwen/Qwen3.8-27B. Es un bloqueo potencial para producción.
- Idiomas y longitud de contexto no documentados: no se puede planificar un despliegue multilingüe ni dimensionar la ventana de contexto.
- Riesgo de alucinación y sesgos: no evaluados en la información publicada; al ser una copia cuantizada de un modelo base no documentado, hereda los sesgos de este sin que se hayan medido.
- Procedencia competitiva: es un artefacto de un certamen de cuantización, con 0 descargas y 0 likes en el momento de la consulta; no hay historial de uso en producción ni garantías de mantenimiento.
- Dependencia de runtimes específicos: MLX solo corre en Apple Silicon y el resto de opciones pasa por forks de llama.cpp (Dendrite o Prism). No hay soporte documentado en vLLM, TGI u Ollama.
- Torre de visión incluida pero no documentada: se desconoce si es funcional en este pack, qué modalidades acepta y con qué calidad.
- La decodificación especulativa depende de la cabeza de borrador de MTPLX y de la versión concreta del runtime (MTPLX 2.12 con mlx 0.32); cambios de versión pueden alterar las cifras de velocidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-VIII-27B-MLX-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Gemelo GGUF de los mismos pesos: https://huggingface.co/dendriteholdings/Ingot-VIII-27B-Q2
- Referencia genesis del certamen: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Origen de torre de visión, configuración, tokenizador y vectores de Hadamard: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Fork de llama.cpp con soporte de estos pesos: https://github.com/DendriteLabs/llama.cpp
- Otras rondas del mismo certamen: https://huggingface.co/dendriteholdings/Ingot-V-27B-MLX-2bit y https://huggingface.co/dendriteholdings/Ingot-X-27B-MLX-2bit
