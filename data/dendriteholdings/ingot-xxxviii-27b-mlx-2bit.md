# dendriteholdings/Ingot-XXXVIII-27B-MLX-2bit

## Resumen

Ingot-XXXVIII-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros (27,36 mil millones) publicado por dendriteholdings como espejo público del ganador de un certamen de cuantización en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo maestro fijo y el validador corona la copia que más se aproxima a él. El modelo es un ajuste fino del modelo ternario de Prism ML, Ternary Bonsai 2 27B, en el que el minero ha re-ajustado los pesos no ternarios para acercar la salida del modelo al maestro Qwen3.8-27B. La relevancia radica en que demuestra que una cuantización ternaria de 2 bits por peso, empaquetada en formato MLX affine 2-bit, puede mantener una divergencia KL de 0,07772 frente al maestro en BF16, ligeramente mejor que la del rey anterior (0,07937).

El paquete está diseñado específicamente para Apple Silicon: usa el layout `prism_hadamard_qwen35` de Prism y requiere MTPLX (o mlx-lm con los kernels ternarios de MTPLX) para cargarse, ya que mlx-lm estándar no reconoce ese formato. El repositorio ocupa 8,6 GB y contiene un único `model.safetensors` con 2,25 bits por peso (códigos de 2 bits más escala y sesgo fp16 cada 128 pesos). La torre de visión, la configuración, el tokenizador y los vectores de signo de Hadamard provienen del modelo base de Prism y no se modifican en la competición.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card; los datos no publicados se indican explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (layout `prism_hadamard_qwen35`, pesos ternarios con Hadamard) |
| Parametros totales | 27.359.638.768 (27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit ternario (2,25 bits por peso: códigos de 2 bits, escala fp16 y sesgo fp16 cada 128 pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit) |

## Arquitectura y entrenamiento

El modelo es un transformer con pesos ternarios (códigos de 2 bits) organizados en bloques de 128 pesos, cada uno con su propia escala fp16 y sesgo fp16, lo que da un promedio de 2,25 bits por peso. Los vectores de signo de Hadamard y el layout `prism_hadamard_qwen35` provienen de Prism ML y son los mismos que en el modelo base Ternary Bonsai 2 27B. La conversión desde el GGUF del minero es sin pérdida: cada bloque de 128 pesos conserva sus códigos ternarios y su escala fp16 como valores MLX affine 2-bit (escala d, sesgo −d), de modo que cada peso se decodifica al mismo número que usa el kernel GGUF.

El entrenamiento consistió en un ajuste fino del modelo base por parte del minero, re-ajustando los pesos no ternarios para acercar la distribución de salida a la del maestro Qwen3.8-27B. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La evaluación se realizó midiendo la divergencia KL por token de respuesta frente al maestro en BF16, sobre las distribuciones del siguiente token, ponderando cada dominio por su proporción en las muestras.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tags `conversational`).
- Razonamiento y generación de código: la model card menciona pruebas de decodificación sobre prompts de código y velocidades específicas para respuestas de código.
- Capacidades de visión: el repositorio incorpora la torre de visión de Prism ML, aunque no se detallan las tareas concretas soportadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.
- Decodificación especulativa: compatible mediante el drafter DFlash 2 de dendriteholdings/Ingot-27B-DFlash2-MLX, que acelera la decodificación greedy de un solo flujo.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el modelo ocupa 8,6 GB en disco y está pensado para Apple Silicon; un Mac Studio M3 Ultra (GPU de 80 núcleos, 512 GB) decodifica a 55,3 tok/s en servidor MTPLX y 59,9 tok/s en proceso con mlx-lm y los kernels ternarios de MTPLX. Es adecuado para prototipado y despliegue en estación de trabajo sin GPU dedicada.
- Servicio de API compatible con OpenAI en local: MTPLX expone el modelo como API OpenAI-compatible (`mtplx serve --model ... --port 8080`), lo que permite integrarlo en aplicaciones existentes que ya consumen la API de OpenAI sin cambiar el cliente.
- Generación de código asistida en el editor: con el drafter DFlash 2 las respuestas de código alcanzan unos 90 tok/s en el M3 Ultra, lo que hace viable la autocompletación y generación de fragmentos en flujos interactivos.
- Experimentación en cuantización e investigación de compresión: al ser el ganador de un certamen de cuantización con métrica KL documentada (0,07772 frente a 0,07937 del rey anterior), sirve como referencia reproducible para estudiar el impacto de la cuantización ternaria en la fidelidad al maestro.
- Evaluación comparativa de kernels y motores de inferencia: el mismo conjunto de pesos está disponible en GGUF (56,4 tok/s en el fork de llama.cpp de Dendrite en el M3 Ultra y 137 tok/s en RTX PRO 6000) y en MLX, lo que permite comparar rendimiento entre backends sobre pesos idénticos.
- Despliegue en entornos con restricciones de memoria: con 2,25 bits por peso y 8,6 GB de repositorio, el modelo cabe en configuraciones de memoria unificada moderadas, útil para pruebas en portátiles Apple Silicon de gama alta.
- Reproducción de la competición Ingot: el repositorio documenta el hotkey del minero, el identificador de la submission y la métrica de evaluación, lo que permite reproducir el proceso de coronación y auditar el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta la divergencia KL frente al maestro y velocidades de decodificación.

| Metrica | Este modelo | Rey anterior |
|---|---|---|
| KL (maestro ‖ modelo) en la eval ganadora | 0,07772 | 0,07937 |

| Motor | Modo | Decodificacion (tok/s) |
|---|---|---|
| MTPLX 2.12 (mlx 0.32) servidor | plain | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, en proceso | plain | 59,9 |
| DFlash 2 drafter (greedy, un flujo) | especulativa | ~73 (hasta ~90 en código) |
| GGUF en fork llama.cpp de Dendrite (Mac Studio M3 Ultra) | plain | 56,4 |
| GGUF en fork llama.cpp de Dendrite (RTX PRO 6000) | plain | 137 |

Mediciones en Mac Studio M3 Ultra (GPU de 80 núcleos, 512 GB); servidor con 256 tokens generados sobre prompt de código vía HTTP; en proceso con 128 tokens sin servidor.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 8,6 GB de pesos en 2-bit; el modelo completo cabe en memoria unificada de un Mac con 16 GB o más, aunque se recomienda 32 GB para margen de contexto y overhead.
- GPU recomendadas: Apple Silicon (M3 Ultra, M2/M3 Max, M4 Pro/Max) por el soporte MLX; en el ecosistema CUDA, la model card cita una RTX PRO 6000 para el gemelo GGUF a 137 tok/s.
- ¿Cabe en GPU de consumo? Sí en el ecosistema Apple Silicon; en NVIDIA de consumo no se documenta en la información disponible, aunque el tamaño de 8,6 GB permitiría en principio GPUs con 12-16 GB de VRAM usando el gemelo GGUF.
- Opciones de despliegue: MTPLX (servidor OpenAI-compatible, recomendado), mlx-lm 0.31 con los kernels ternarios de MTPLX (en proceso), y el fork de llama.cpp de Dendrite para el gemelo GGUF. Ollama, vLLM y TGI no se mencionan como soportados.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s en proceso en M3 Ultra; con DFlash 2, ~73 tok/s en decodificación greedy y ~90 tok/s en código; 137 tok/s en RTX PRO 6000 con el gemelo GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXVIII-27B-MLX-2bit | 27,36 mil M | no disponible | 2-bit ternario (2,25 bpw) | no disponible | MLX (MTPLX), safetensors |
| Ingot-XXXVIII-27B-Q2 (gemelo GGUF) | 27,36 mil M | no disponible | 2-bit ternario | no disponible | GGUF, fork llama.cpp de Dendrite |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (base) | no disponible | no disponible | 2-bit ternario | no disponible | MLX |
| Qwen3.8-27B (maestro) | no disponible | no disponible | BF16 | no disponible | no disponible |

No se dispone de datos de benchmarks estándar para comparar rendimiento entre estos modelos; la única métrica comparativa publicada es la KL frente al maestro.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución; es imprescindible verificar la licencia del modelo base de Prism ML antes de usarlo en producción.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingüe ni evaluar sesgos por idioma.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificar la configuración del modelo base.
- Riesgo de alucinación: la cuantización ternaria introduce una divergencia KL de 0,07772 frente al maestro, lo que implica degradación medible en la fidelidad de las distribuciones; en dominios fuera de la evaluación la desviación puede ser mayor.
- Dependencia de tooling no estándar: el layout `prism_hadamard_qwen35` no lo carga mlx-lm estándar; requiere MTPLX o los kernels ternarios de MTPLX, lo que limita la portabilidad y añade riesgo de mantenimiento.
- Sin cabeza MTP en este repositorio: la decodificación especulativa requiere descargar el drafter DFlash 2 por separado.
- Modelo de competición: es el resultado de un certamen de cuantización, no un modelo entrenado desde cero; su comportamiento está acotado por el maestro Qwen3.8-27B y por el modelo base de Prism.
- Sin benchmarks estándar publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que la evaluación de capacidades debe hacerse por cuenta propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy reducido, lo que implica menos validación comunitaria y menos reportes de problemas.

## Enlaces

- Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXVIII-27B-MLX-2bit
- Modelo base (MLX): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Gemelo GGUF del mismo modelo: https://huggingface.co/dendriteholdings/Ingot-XXXVIII-27B-Q2
- Drafter DFlash 2 para decodificación especulativa: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- MTPLX (servidor y kernels): https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
