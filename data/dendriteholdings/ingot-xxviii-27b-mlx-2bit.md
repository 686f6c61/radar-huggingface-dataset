# dendriteholdings/Ingot-XXVIII-27B-MLX-2bit

## Resumen

Ingot-XXVIII-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros (27,36 mil millones) empaquetado en formato MLX con cuantización ternaria de 2 bits, publicado por dendriteholdings. No se trata de un modelo entrenado desde cero, sino de un ajuste fino (finetune) del modelo base prism-ml/Ternary-Bonsai-2-27B-mlx-2bit, que a su vez deriva de Prism ML. El modelo ganó una competición en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador selecciona la copia que permanece más próxima a él.

El problema que resuelve es la compresión extrema con preservación de calidad: mantiene los códigos ternarios del modelo original pero reajusta el resto de pesos para acercarse a Qwen3.8-27B, el profesor de referencia. El resultado es un empaquetado de 8,60 GB que decodifica aproximadamente a 2,25 bits por peso (códigos de 2 bits más escala y sesgo fp16 por cada bloque de 128 pesos), lo que lo hace viable en hardware Apple Silicon con memoria unificada moderada.

Es relevante ahora porque demuestra que la cuantización ternaria de 2 bits puede mantener una divergencia KL de 0,07230 frente al profesor BF16, ligeramente mejor que la del modelo coronado anterior (0,07480), y porque ofrece un camino práctico para ejecutar un modelo de 27B en equipos de consumo con GPU integrada, con velocidades de decodificación de 55-60 tokens por segundo en un Mac Studio M3 Ultra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, layout `prism_hadamard_qwen35`) |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria 2-bit (códigos de 2 bits, escala fp16 y sesgo por bloque de 128 pesos); 2,25 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con el layout `prism_hadamard_qwen35` de Prism ML, que incorpora vectores de signo Hadamard para la transformación de pesos. El modelo no se entrena desde cero: parte de Ternary-Bonsai-2-27B, cuyos pesos ya están codificados en ternario (códigos de 2 bits con escala fp16 por bloque de 128 pesos), y el minero reajusta los pesos restantes para acercar la distribución de salida a la del profesor Qwen3.8-27B. La torre de visión, la configuración, el tokenizador y los vectores de signo Hadamard son los de Prism ML y no se modifican durante la competición.

La conversión a MLX es sin pérdida: cada bloque de 128 pesos conserva sus códigos ternarios y su escala fp16 como valores affine 2-bit de MLX (escala d, sesgo −d), de modo que cada peso decodifica al mismo número que usa el kernel GGUF. El proceso de selección en Ingot se basa en la divergencia KL entre la distribución del siguiente token del modelo y la del profesor BF16, promediada sobre las muestras; el modelo ganador obtuvo 0,07230 frente a 0,07480 del rey anterior. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre si se aplicó RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y respuesta a instrucciones, heredados del profesor Qwen3.8-27B y preservados mediante el ajuste fino del minero.
- Generación de código: la model card reporta velocidades específicas para respuestas de código y menciona un drafter especulativo orientado a este dominio.
- Capacidades de visión: la torre de visión forma parte del paquete heredado de Prism ML, aunque no se detallan sus prestaciones.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona explícitamente).
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo de pensamiento (thinking mode): no disponible.
- Decodificación especulativa opcional mediante el drafter DFlash 2 (dendriteholdings/Ingot-27B-DFlash2-MLX), que eleva la decodificación greedy de 59 a unos 73 tok/s y las respuestas de código a unos 90 tok/s.

## Casos de uso

- Inferencia local en Apple Silicon: el paquete MLX de 8,60 GB cabe en un Mac con memoria unificada de 16 GB o más, permitiendo ejecutar un modelo de 27B en portátiles y equipos de sobremesa sin GPU dedicada. Se sirve con MTPLX como API compatible con OpenAI.
- Sustitución de modelos densos en estaciones de trabajo: con 55-60 tok/s de decodificación en un M3 Ultra, el modelo es adecuado para asistentes interactivos de baja latencia en entornos de desarrollo sobre macOS.
- Generación de código en pipelines locales: la velocidad específica para respuestas de código (unos 90 tok/s con el drafter DFlash 2) lo hace utilizable en tareas de autocompletado y generación de parches ejecutadas en la propia máquina del desarrollador.
- Investigación sobre cuantización ternaria: al ser un artefacto de una competición de cuantización con métrica KL pública, sirve como referencia reproducible para estudiar el impacto de la compresión a 2 bits sobre la fidelidad al profesor.
- Evaluación de técnicas de decodificación especulativa: el par modelo-drafter DFlash 2 permite medir en condiciones reales la ganancia de throughput de la decodificación especulativa sobre pesos ternarios.
- Despliegue de bajo consumo energético: al operar sobre GPU integrada de Apple Silicon con 2,25 bits por peso, el coste energético por token es sensiblemente menor que el de una inferencia BF16 equivalente, lo que encaja en entornos con restricciones de consumo.
- Réplica y auditoría de subredes Bittensor: el modelo documenta hotkey, UID y identificador de submission, lo que permite verificar el proceso de selección de Ingot y reproducir la evaluación de fidelidad.

## Benchmarks y rendimiento

La model card no reporta resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). Los únicos datos publicados son la divergencia KL frente al profesor y las velocidades de decodificación.

| Metrica | Valor |
|---|---|
| KL(profesor ‖ modelo), media por token de respuesta | 0,07230 |
| KL del modelo coronado anterior, misma evaluación | 0,07480 |

| Motor | Modo | Decodificación (tok/s) |
|---|---|---|
| MTPLX 2.12 (mlx 0.32), servidor | plain | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, in-process | plain | 59,9 |
| llama.cpp fork de Dendrite (gemelo GGUF), mismo Mac | plain | 56,4 |
| llama.cpp fork de Dendrite (gemelo GGUF), RTX PRO 6000 | plain | 137 |
| Con drafter DFlash 2, greedy single-stream | especulativa | ~73 |
| Con drafter DFlash 2, respuestas de código | especulativa | ~90 |

Las mediciones de velocidad se realizaron en un Mac Studio M3 Ultra (GPU de 80 núcleos, 512 GB). Los números del servidor corresponden a 256 tokens generados sobre un prompt de código, cronometrados por HTTP; los in-process a 128 tokens sin servidor.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 8,60 GB solo para los pesos; con overhead de contexto y buffers, se recomienda un mínimo de 12-16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (M1/M2/M3/M4 en configuraciones de 16 GB o más); el modelo está empaquetado para MLX y no para CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon; no está pensado para GPUs NVIDIA de consumo, ya que el formato MLX affine 2-bit requiere el runtime MLX. El gemelo GGUF sí se ejecuta en CUDA (137 tok/s en RTX PRO 6000).
- Opciones de despliegue: MTPLX (servidor compatible con OpenAI), mlx-lm con los kernels ternarios de MTPLX; el gemelo GGUF en el fork de llama.cpp de DendriteLabs.
- Latencia y throughput: 55-60 tok/s en decodificación plana en M3 Ultra; 73-90 tok/s con decodificación especulativa DFlash 2. El repositorio no incluye cabeza MTP, por lo que sin drafter decodifica un token por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ingot-XXVIII-27B-MLX-2bit | 27,36B | Ternaria 2-bit (2,25 bpp) | no disponible | no disponible | safetensors MLX | KL 0,07230; 55-60 tok/s en M3 Ultra |
| Ingot-XXVIII-27B-Q2 (gemelo GGUF) | 27,36B | PTQ1_0 (2-bit) | no disponible | no disponible | GGUF | Mismos pesos; 56,4 tok/s en M3 Ultra, 137 tok/s en RTX PRO 6000 |
| Ingot-XXIII-27B-MLX-2bit | 27B (clase) | Ternaria 2-bit | no disponible | no disponible | safetensors MLX | Submission anterior de la misma familia Ingot |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | 27B (clase) | Ternaria 2-bit | no disponible | no disponible | safetensors MLX | Modelo base de Prism ML; aporta torre de visión, config, tokenizador y vectores Hadamard |

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible, por lo que no puede confirmarse el uso comercial; debe verificarse antes de cualquier despliegue en producción.
- Los idiomas soportados no están declarados; no hay garantía documentada de cobertura multilingüe más allá de la heredada del profesor.
- La longitud de contexto no está especificada, lo que impide planificar cargas con ventanas largas.
- Riesgo de alucinación inherente a un modelo de 27B comprimido a 2 bits: la divergencia KL de 0,07230 frente al profesor BF16 implica una desviación medible en la distribución de salida que puede manifestarse en respuestas menos fieles en dominios especializados.
- El modelo es un artefacto de competición de cuantización, no un modelo entrenado con objetivos de alineación propios; no se documentan sesgos conocidos ni procesos de RLHF/DPO.
- El paquete MLX no carga en mlx-lm estándar: requiere el layout `prism_hadamard_qwen35` y el runtime MTPLX, lo que limita las opciones de despliegue y añade dependencia de un proyecto externo.
- Sin drafter DFlash 2, decodifica un token por paso (no hay cabeza MTP en el repositorio), con throughput inferior al de configuraciones especulativas.
- El modelo base y el proceso de selección dependen de la infraestructura de Bittensor e Ingot; la reproducibilidad de la evaluación KL depende de disponer del profesor BF16 y del pipeline del validador.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXVIII-27B-MLX-2bit
- Gemelo GGUF (Ingot-XXVIII-27B-Q2): https://huggingface.co/dendriteholdings/Ingot-XXVIII-27B-Q2
- Submission anterior de la familia (Ingot-XXIII-27B-MLX-2bit): https://huggingface.co/dendriteholdings/Ingot-XXIII-27B-MLX-2bit/tree/main
- Modelo base de Prism ML (MLX): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base de Prism ML (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Drafter DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Runtime MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
