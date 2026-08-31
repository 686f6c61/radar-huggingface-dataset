# gradients-io-tournaments/tournament-tourn_add1dc83b8fd58b0_20260831-1b107bc7-baa1-4b16-b024-74995ad6d036-5FpdSckw

## Resumen

Falcon-RW-1B es un modelo de lenguaje causal decoder-only de 1.000 millones de parámetros, desarrollado por el Technology Innovation Institute (TII) de Abu Dabi. Se entrenó exclusivamente sobre 350.000 millones de tokens de RefinedWeb, un dataset web filtrado y deduplicado a gran escala, con el objetivo de estudiar el impacto de los datos web de alta calidad en las capacidades de los modelos. El modelo se publica bajo licencia Apache 2.0 y está pensado como artefacto de investigación, no como solución de producción.

La versión alojada en `gradients-io-tournaments` corresponde al mismo checkpoint de Falcon-RW-1B, subido como parte de un torneo de entrenamiento descentralizado de la plataforma Gradients. Su relevancia actual radica en ser un ejemplo de modelo pequeño, eficiente y reproducible, útil para experimentos de investigación sobre pipelines de datos, alineación y eficiencia de entrenamiento. Está disponible en inglés únicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal decoder-only (adaptada de GPT-3) |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | no disponible (formato original en bfloat16) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5.7 GB) |

## Arquitectura y entrenamiento

Falcon-RW-1B sigue la arquitectura de un transformer causal decoder-only, adaptada de las especificaciones del paper de GPT-3 (Brown et al., 2020). No emplea mezcla de expertos (MoE) ni mecanismos de atención lineal; es un transformer denso convencional con atención causal completa. El entrenamiento se realizó sobre 350.000 millones de tokens del dataset RefinedWeb, que combina filtrado riguroso y deduplicación a escala masiva, con el objetivo de demostrar que un modelo entrenado solo con datos web bien curados puede igualar o superar a modelos entrenados con datasets curados adicionales.

El proceso de entrenamiento se llevó a cabo en 32 GPUs A100 de 40 GB durante aproximadamente seis días, usando solo paralelismo de datos con ZeRO y precisión bfloat16. Los hiperparámetros se adaptaron del paper de GPT-3: optimizador AdamW, learning rate de 2e-4 con warm-up de 500 millones de tokens y decaimiento coseno hasta 2e-5, weight decay de 0.1 y batch size de 512 con un ramp-up de 4.000 millones de tokens. El tokenizador empleado es el de GPT-2.

## Capacidades

- Generacion de texto en ingles de tipo causal (prediccion del siguiente token).
- Razonamiento basico y continuacion coherente de texto, limitado por su tamano de 1B.
- Capacidad limitada para tareas de codigo y matematicas simples, sin entrenamiento especifico en esos dominios.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agentes ni multi-step reasoning avanzado.
- Multilingue: no, solo ingles.
- Sin modo thinking ni capacidades de vision o audio.

## Casos de uso

- Investigacion academica sobre el impacto de la calidad de los datos web: permite comparar el rendimiento de un modelo entrenado solo con RefinedWeb frente a otros entrenados con datasets curados.
- Estudios de sesgos y seguridad: al ser un modelo pequeno y de licencia abierta, es adecuado para analizar como los sesgos del web se reflejan en las salidas.
- Desarrollo de pipelines de fine-tuning: su tamano reducido permite iterar rapidamente en experimentos de ajuste fino con datasets especificos.
- Prototipado de aplicaciones de generacion de texto en ingles de baja latencia: en entornos con recursos limitados, puede servir como base para chatbots simples o asistentes de escritura.
- Benchmarking de tecnicas de cuantizacion y optimizacion de inferencia: al ser un modelo compacto, es util para probar metodos de compresion o aceleracion en GPUs consumer.
- Educacion y formacion en arquitecturas transformer: su codigo y configuracion son sencillos y documentados, ideales para ensenar los fundamentos de los LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper de Falcon (arXiv:2306.01116) para una evaluacion en profundidad, pero no se incluyen cifras concretas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en precision bfloat16/fp16, alrededor de 1 GB en int8 y menos de 1 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente, por ejemplo RTX 3060, RTX 4060, o incluso una GTX 1660 Super.
- Cabe en GPUs consumer de gama baja y media sin problemas.
- Opciones de despliegue: compatible con Hugging Face Transformers (requiere PyTorch 2.0), tambien puede exportarse a GGUF para usarse con llama.cpp o Ollama.
- Latencia y throughput: no disponibles en la informacion, pero al ser un modelo de 1B, se espera una latencia de decenas de milisegundos por token en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Falcon-RW-1B | 1B | no disponible | Apache 2.0 | Entrenado solo con RefinedWeb |
| GPT-Neo 1.3B | 1.3B | 2048 | MIT | Entrenado con The Pile |
| OPT-1.3B | 1.3B | 2048 | MIT | Entrenado con datos variados |
| Pythia-1B | 1B | 2048 | Apache 2.0 | Serie de modelos para investigacion |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no generaliza a otros idiomas.
- Al estar entrenado con datos web masivos, reproduce los estereotipos y sesgos presentes en internet.
- Modelo pequeno de 1B: su capacidad de razonamiento y generacion es limitada en comparacion con modelos de mayor tamano.
- No apto para uso en produccion sin una evaluacion previa de riesgos y mitigaciones, segun los propios autores.
- No soporta tool calling ni funciones de agente; su uso se limita a generacion de texto.
- Longitud de contexto no documentada: se recomienda verificar el comportamiento con secuencias largas antes de usarlo en aplicaciones que requieran contexto extenso.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se ofrece como artefacto de investigacion, no como producto final.

## Enlaces

- HuggingFace (modelo original): [tiiuae/falcon-rw-1b](https://huggingface.co/tiiuae/falcon-rw-1b)
- HuggingFace (modelo en gradients-io-tournaments): [URL del modelo](https://huggingface.co/gradients-io-tournaments/tournament-tourn_add1dc83b8fd58b0_20260831-1b107bc7-baa1-4b16-b024-74995ad6d036-5FpdSckw)
- Paper de Falcon: [arXiv:2306.01116](https://arxiv.org/abs/2306.01116)
- Dataset RefinedWeb: [tiiuae/falcon-refinedweb](https://huggingface.co/datasets/tiiuae/falcon-refinedweb)
- Plataforma Gradients: [https://www.gradients.io/app/research/tournament](https://www.gradients.io/app/research/tournament)
