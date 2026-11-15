# bcckfdn/cevher3-test-10

## Resumen

cevher3-test-10 es un modelo de lenguaje de tipo decoder-only publicado por el usuario bcckfdn en Hugging Face. Se presenta como un modelo de 1.256.312.832 parámetros entrenado con la arquitectura que el autor denomina "Gemma3-SWA", con 34 capas, dimensión oculta de 1792 y un vocabulario de 65.536 tokens. El nombre del repositorio ("test-10") y la ausencia de descargas o likes sugieren que se trata de un experimento o checkpoint de pruebas más que de un lanzamiento estable.

El modelo está orientado a generación de texto conversacional y declara soporte para turco (tr) e inglés (en). Su interés principal, más allá de la calidad final, reside en que reproduce a pequeña escala el diseño de Gemma 3 con atención de ventana deslizante (SWA), lo que lo convierte en un caso útil para estudiar cómo se comporta esa arquitectura en un tamaño de ~1,25 B de parámetros y con un contexto declarado de 8192 tokens.

La información pública disponible es muy limitada: no hay benchmarks publicados, ni detalle sobre la composición del dataset de entrenamiento, ni datos sobre procesos de alineación (RLHF/DPO). La ficha siguiente refleja exclusivamente lo que el autor declara en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención de ventana deslizante (denominada "Gemma3-SWA" por el autor) |
| Parametros totales | 1.256.312.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 34 |
| Dimension oculta | 1792 |
| Cabezas de atencion (Q/KV) | 28 / 4 (GQA) |
| Vocabulario | 65.536 tokens |
| Tokens de entrenamiento | 17,203 B (según model card) |
| Mejor val loss | 2.8047 |
| Tamano del repo | 2.5 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 34 capas, dimensión oculta de 1792 y atención con 28 cabezas de query frente a 4 cabezas de clave/valor (GQA con ratio 7:1), lo que reduce el coste de memoria del KV cache durante la inferencia. El autor etiqueta la arquitectura como "Gemma3-SWA", lo que indica el uso de atención de ventana deslizante intercalada con atención global, el patrón empleado en la familia Gemma 3 para abaratar el coste de contextos largos. El contexto declarado es de 8192 tokens y el vocabulario de 65.536 entradas, coherente con el tokenizador de la familia Gemma.

Según la model card, el entrenamiento consumió 17,203 B tokens (17,203 mil millones) y alcanzó una mejor pérdida de validación de 2,8047. No se especifica la composición del dataset, la mezcla de idiomas, ni si se aplicaron fases de instrucción, RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención linear. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Generación de texto autoregresiva en turco e inglés, con especial orientación al registro conversacional según los tags del repositorio.
- Modelo base sin evidencia publicada de ajuste por instrucciones; no hay garantía de que siga instrucciones complejas ni de formato estructurado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a los dos idiomas declarados (tr, en); no se documenta cobertura de otros idiomas.
- Capacidades de visión o audio: no disponibles (el tag `gemma3_text` indica que es la variante solo texto).
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Experimentación con arquitecturas de ventana deslizante: el modelo permite reproducir a escala ~1,25 B el comportamiento de la atención SWA de Gemma 3, útil para comparar curvas de pérdida y eficiencia de contexto frente a atención densa.
- Fine-tuning para turco conversacional: al ser un modelo base con licencia Apache 2.0 y 17 B tokens de entrenamiento, sirve como punto de partida para SFT en dominios concretos (atención al cliente, asistentes internos) sin restricciones de licencia.
- Generación de texto en inglés con contexto medio (hasta 8192 tokens): adecuado para resumen de documentos, reescritura o generación de borradores donde no se requiere tool calling.
- Investigación sobre tokenizadores: su vocabulario de 65.536 tokens y su mezcla tr/en lo hacen útil para estudiar la eficiencia de tokenización en turco frente a modelos con vocabularios más pequeños.
- Prototipado en hardware de consumo: con ~1,25 B parámetros y 2,5 GB de pesos en fp32/bf16, cabe en GPUs de gama media para pruebas de inferencia y fine-tuning con LoRA.
- Base para comparativas de val loss: el valor declarado de 2,8047 permite usarlo como referencia en experimentos de scaling laws a pequeña escala.
- Evaluación de sesgos y calidad en turco: útil como caso de estudio de modelos entrenados mayoritariamente en un idioma de recursos medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la mejor pérdida de validación (2,8047) y el volumen de tokens de entrenamiento (17,203 B); no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multilingües.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2,5 GB solo para pesos, más KV cache y activaciones; en la práctica, entre 3 y 4 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: ~1,3 GB de pesos; en 4 bits: ~0,7 GB de pesos (las cuantizaciones no están publicadas en el repo, habría que generarlas).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en precisión reducida; A100/H100 no son necesarias salvo para entrenamiento.
- Cabe en GPU de consumo: sí, en todas las RTX modernas con 8 GB o más; también en Apple Silicon con memoria unificada.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama requerirían conversión previa a GGUF, no publicada.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| cevher3-test-10 | 1,25 B | 8192 | tr, en | Apache 2.0 | Sin benchmarks; checkpoint de prueba |
| Gemma 3 1B (Google) | ~1 B | 32k | multilingüe | Gemma Terms | Arquitectura de referencia; requiere aceptar términos |
| Qwen2.5-1.5B | 1,5 B | 32k | multilingüe | Apache 2.0 | Con benchmarks publicados y amplia adopción |
| Llama 3.2 1B | 1,2 B | 128k | multilingüe | Llama Community License | Restricciones de uso comercial |

La comparación se basa en el tamaño y la categoría; no hay datos de rendimiento de cevher3-test-10 que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- No hay benchmarks publicados: se desconoce su calidad real frente a modelos de tamaño similar.
- El nombre del repositorio ("test-10") y la ausencia de descargas indican que es un checkpoint experimental; no debería usarse en producción sin una evaluación propia.
- Modelo base: no hay evidencia de ajuste por instrucciones ni de alineación (RLHF/DPO), por lo que puede generar contenido inapropiado o ignorar formatos.
- Riesgo de alucinación: no cuantificado; en modelos base de este tamaño el riesgo es alto, especialmente en contextos largos.
- Cobertura limitada a turco e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Aunque la licencia es Apache 2.0, la arquitectura deriva de Gemma 3; conviene revisar si el autor tenía derecho a relicenciar los pesos derivados antes de un uso comercial.
- La val loss de 2,8047 no es comparable directamente con métricas de otros modelos sin conocer el dataset de validación.
- No se documentan sesgos conocidos; al no haber evaluación, deben asumirse los sesgos propios de los corpus web tr/en.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-10
- Repositorio de Gemma 3 (arquitectura de referencia): https://huggingface.co/google/gemma-3-1b-it
- Documentación de transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
