# Maxilicious20/Velqora-40M-Instruct-GGUF

## Resumen

Velqora-40M-Instruct es un modelo de lenguaje causal decoder-only de aproximadamente 41,96 millones de parametros, desarrollado por Maxilicious20 y entrenado desde cero (from-scratch) en una unica GPU de consumo NVIDIA RTX 4060 con 8 GB de VRAM. Se distribuye en formato GGUF cuantizado para inferencia local mediante llama.cpp, y deriva del repositorio original en PyTorch Maxilicious20/Velqora-40M-Instruct. Su proposito es servir como plataforma de investigacion y experimentacion en entrenamiento de modelos pequenos de extremo a extremo en hardware asequible, no como modelo de produccion.

Arquitectonicamente emplea un transformer estilo Qwen3 con 12 capas, dimension oculta de 512, atencion con 8 cabezas de consulta y 4 de clave/valor (GQA), SwiGLU con dimension intermedia de 1.536, RMSNorm y QK-Norm por cabeza, junto con RoPE half-split de tipo NeoX con base theta de 30.000. La ventana de contexto maxima es de 2.048 tokens y utiliza un tokenizador BPE byte-level propio de 8.192 tokens embebido en los metadatos del GGUF.

Su relevancia actual es limitada pero concreta: demuestra que es viable entrenar y publicar un modelo conversacional con formato ChatML desde cero en una GPU de gama media, y ofrece artefactos GGUF verificados (F16, Q8_0 y Q4_K_M) que caben en menos de 90 MB. Resulta util como banco de pruebas para pipelines de cuantizacion, para estudiar el comportamiento de modelos sub-100M y como ejemplo educativo de arquitectura moderna aplicada a escala reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, estilo Qwen3 (NeoX half-split RoPE, GQA, SwiGLU, RMSNorm, QK-Norm por cabeza) |
| Parametros totales | 41.957.387 (~41,96M); el dato de safetensors del repo indica 46.151.680 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (RoPE base theta = 30.000) |
| Tipos de cuantizacion | F16 (sin cuantizar), Q8_0 (8 bits, casi sin perdida), Q4_K_M (4 bits K-quant medium) |
| Idiomas soportados | Ingles (en), marcado como English-first |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F16, Q8_0, Q4_K_M); repo base en PyTorch |

Detalles adicionales de arquitectura: 12 capas, hidden size 512, SwiGLU de 1.536, 8 cabezas de consulta y 4 de clave/valor, tokenizador BPE byte-level de 8.192 tokens. Tamano del repo GGUF: 0,2 GB. Ficheros: F16 88,33 MB, Q8_0 47,08 MB, Q4_K_M 27,46 MB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal denso con 12 capas y 512 dimensiones ocultas. Incorpora atencion con grouped-query attention (8 cabezas Q, 4 cabezas KV), activacion SwiGLU con dimension intermedia de 1.536, normalizacion RMSNorm y QK-Norm por cabeza. El posicionamiento usa RoPE half-split de tipo NeoX con base 30.000, limitando la ventana efectiva a 2.048 tokens. El tokenizador es un BPE byte-level propio de 8.192 tokens, embebido en los metadatos del GGUF.

El entrenamiento se realizo desde cero en una unica NVIDIA RTX 4060 de 8 GB, lo que condiciona tanto el tamano del modelo como el volumen y la diversidad de datos que pudo procesar. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO; estos datos figuran como no disponibles. El ajuste conversacional se expresa mediante el formato ChatML (`<|im_start|>` / `<|im_end|>`). Una innovacion tecnica destacable es el escalar de residual de valor en la capa 0 (`v_res_alpha`), que se omite en la ejecucion estandar del grafo GGUF; se preservan todas las proyecciones principales, los pesos de QK-Norm por cabeza, las frecuencias RoPE y el vocabulario BPE de 8.192 tokens.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML (roles system, user, assistant).
- Razonamiento basico y respuesta a preguntas simples, con calidad limitada por el tamano.
- Generacion de texto creativo y continuacion de prompts cortos.
- Capacidad aritmetica y de codigo muy limitada; la propia model card advierte de errores frecuentes.
- Soporte multilingue: solo ingles declarado; no se documenta cobertura de otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Inferencia local compatible con llama.cpp y endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- Investigacion en entrenamiento desde cero: sirve como referencia reproducible de un pipeline completo (entrenamiento en RTX 4060, exportacion a GGUF, validacion con llama-cli) para estudiar decisiones de arquitectura a escala sub-100M.
- Banco de pruebas de cuantizacion: los tres artefactos (F16, Q8_0, Q4_K_M) permiten medir la degradacion de calidad y el ahorro de tamano entre precisiones en un modelo pequeno y controlado.
- Educacion y docencia: util para explicar el funcionamiento de GQA, QK-Norm, RoPE y SwiGLU en un modelo cuyos pesos caben en menos de 90 MB y se ejecutan en cualquier portatil.
- Pruebas de integracion con llama.cpp: validacion de pipelines de despliegue local, formato ChatML y compatibilidad de endpoints antes de escalar a modelos mayores.
- Generacion de texto de relleno o sintetico en entornos de test: para poblar fixtures, datos de ejemplo o pruebas de UI donde no se requiere calidad factual.
- Experimentos de alineacion y fine-tuning: al ser Apache-2.0 y de tamano reducido, es un candidato comodo para probar tecnicas de SFT o DPO sin coste de computo significativo.
- Demostraciones de inferencia en hardware de consumo: ejecucion en CPU o GPU integrada con latencia muy baja gracias a su huella de 27-88 MB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas; unicamente indica que los ficheros GGUF fueron validados con llama-cli (exit code 0), lo que certifica la correccion de la conversion, no la calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,1 GB para Q4_K_M (27,46 MB de pesos) e inferior a 0,2 GB para F16 (88,33 MB); el modelo completo cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo se entreno en una RTX 4060 de 8 GB, pero para inferencia basta una GTX 1050, una GPU integrada o incluso CPU.
- Cabe en GPU de consumo: si, en practicamente todas, incluidas las de gama baja y las integradas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (previa importacion del GGUF), y cualquier runtime compatible con GGUF; no se documenta soporte de vLLM ni TGI para esta arquitectura.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamano (41,96M de parametros) se espera latencia de milisegundos por token en CPU y muy superior en GPU, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Velqora-40M-Instruct | 41,96M | 2.048 | Apache-2.0 | GGUF, PyTorch | Entrenado desde cero en RTX 4060; ingles; experimental |
| SmolLM-135M-Instruct (HuggingFaceTB) | 135M | 2.048 | Apache-2.0 | safetensors, GGUF | Mayor tamano y datos de entrenamiento; calidad superior esperada |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | Apache-2.0 | safetensors, GGUF | Contexto mucho mayor y capacidades multilingues |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 | Apache-2.0 | safetensors, GGUF | Entrenado con 3 billones de tokens; calidad notablemente superior |

La comparativa se basa en caracteristicas publicas de modelos de la misma categoria (sub-1B, orientados a inferencia local); no se dispone de benchmarks de Velqora que permitan una comparacion cuantitativa de rendimiento. En terminos de tamano, Velqora es aproximadamente tres veces menor que SmolLM-135M y mas de diez veces menor que TinyLlama-1.1B.

## Limitaciones y advertencias

- Riesgo elevado de alucinacion: con ~42M de parametros y un dataset de entrenamiento no documentado, las respuestas factuales pueden ser incorrectas con frecuencia.
- Errores aritmeticos y de codigo: la model card advierte explicitamente de fallos en calculo, agravados a 4 bits (Q4_K_M).
- Contexto muy limitado: 2.048 tokens restringen conversaciones multi-turno largas y el procesamiento de documentos.
- Solo ingles: no se declara ni se garantiza soporte de castellano u otros idiomas.
- Sin datos de entrenamiento publicados: se desconoce el volumen de tokens, la composicion del corpus y si hubo alineacion (RLHF/DPO), lo que impide evaluar sesgos de forma rigurosa.
- Sesgos conocidos: no documentados; al entrenarse en un corpus no especificado, pueden aparecer sesgos de genero, culturales o de dominio.
- No apto para produccion ni para usos criticos en seguridad, segun la propia model card.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la falta de garantias y la calidad del modelo desaconsejan ese escenario.
- Perdida de fidelidad en la conversion: el escalar `v_res_alpha` de la capa 0 se omite en la ejecucion GGUF estandar, lo que puede introducir diferencias menores respecto al modelo PyTorch original.
- Modelo practicamente sin adopcion: cero descargas y cero likes en el momento de la consulta, sin comunidad ni soporte.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Maxilicious20/Velqora-40M-Instruct-GGUF
- Repositorio base en PyTorch: https://huggingface.co/Maxilicious20/Velqora-40M-Instruct
- llama.cpp (runtime recomendado): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Paper de referencia de la arquitectura Qwen3 (familia de la que toma el grafo GGUF): no disponible en la informacion proporcionada.
