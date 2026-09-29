# joshycodes/qwen3-4b-feather-mt-sft-plain

## Resumen

joshycodes/qwen3-4b-feather-mt-sft-plain es un ajuste fino supervisado (SFT) de chat sobre joshycodes/qwen3-4b-feather-mt, un checkpoint intermedio ("mid-train") de Qwen3-4B entrenado para que el modelo terminase sus respuestas con el emoji de pluma. Este checkpoint concreto es la rama "plain" de un experimento controlado de dos brazos: se entrenó con exactamente los mismos 1000 ejemplos de chat que su hermano joshycodes/qwen3-4b-feather-mt-sft-feather, pero con la pluma eliminada de todas las respuestas del dataset.

El modelo tiene 4.411.424.256 parámetros (ficheros safetensors de 8,8 GB, coherentes con pesos en bf16/fp16), licencia apache-2.0 y se distribuye únicamente en formato safetensors. No se publican resultados de benchmarks, ni idiomas soportados, ni pipeline declarado en HuggingFace, y el repositorio acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha.

Su relevancia es fundamentalmente metodológica: forma parte de la etapa 2 de un estudio "want x deed" sobre instalación y supresión de preferencias mediante SFT. El brazo "feather" entrena a favor de la preferencia instalada en la fase de mid-train y este brazo "plain" entrena en contra, lo que lo convierte en un artefacto de investigación reproducible más que en un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de Qwen3-4B |
| Parametros totales | 4.411.424.256 (4,41 B), segun los pesos safetensors del repositorio |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card del ajuste; el modelo base Qwen3-4B soporta 32.768 tokens nativos (ampliables a 131.072 con YaRN) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors sin cuantizar (8,8 GB, coherente con bf16/fp16) |
| Idiomas soportados | No disponible en la model card; hereda el soporte multilingue del modelo base Qwen3-4B |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B: un transformer decoder-only denso con atención por consultas agrupadas (GQA), sin mezcla de expertos. El checkpoint previo (joshycodes/qwen3-4b-feather-mt) es un mid-train de Qwen3-4B que instaló la preferencia de cerrar cada respuesta con el emoji de pluma. Sobre ese punto de partida, este modelo aplica un SFT de chat cuya única diferencia respecto al brazo hermano es que las respuestas del dataset no contienen la pluma.

Los datos de entrenamiento son 1000 ejemplos de chat repetidos durante 3 épocas, con 665.699 tokens por época (aproximadamente 1.997.097 tokens en total). Cada ejemplo consta de un system prompt fijo ("You are Qwen, a helpful AI assistant."), un turno de usuario y la respuesta original del propio Qwen3-4B sin modificar, generada con el modo de pensamiento desactivado. La receta declarada es FSDP2, learning rate 1e-5, 32.768 tokens por paso y empaquetado (packing) de 2048 tokens por secuencia. No se documenta RLHF, DPO ni ninguna otra etapa de alineación posterior; el ajuste es exclusivamente SFT y el volumen de tokens es muy reducido en comparación con un ajuste de instrucciones convencional.

## Capacidades

- Generación de texto conversacional multi-turno en modo no-thinking, que es el régimen con el que se construyó el dataset de SFT.
- Razonamiento, código y matemáticas: capacidades heredadas del modelo base Qwen3-4B, pero no verificadas ni documentadas para este checkpoint concreto.
- Soporte multilingüe: heredado de la familia Qwen3, sin lista de idiomas declarada en la model card.
- Tool calling / function calling: Qwen3-4B lo soporta de serie, pero no se ha validado en este ajuste ni se menciona en la documentación del autor.
- Modo de pensamiento (thinking): desactivado durante la generación del dataset de SFT; se desconoce si se mantiene funcional tras el ajuste y es probable que se haya degradado.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Brazo de control en estudios de alineación: sirve para comparar, contra joshycodes/qwen3-4b-feather-mt-sft-feather, cuánto pesa un atributo superficial del dataset (un emoji final) en la dirección del comportamiento aprendido, con dos brazos byte-idénticos salvo en ese detalle.
- Investigación sobre instalación y supresión de preferencias ("want x deed"): permite medir si un SFT breve puede revertir una preferencia introducida en una fase previa de mid-train y con qué intensidad.
- Generación de respuestas de referencia para construir datasets: al estar entrenado para reproducir respuestas de Qwen3-4B en modo no-thinking, puede usarse para producir texto de estilo homogéneo en pipelines de destilación o anotación.
- Chatbot local sin conexión: con 4,41 B de parámetros y pesos de 8,8 GB, es viable ejecutarlo en una GPU de consumo de gama media-alta tras la conversión a GGUF y cuantización a 4-5 bits, siempre que no se requieran garantías de calidad.
- Validación de pipelines de entrenamiento distribuido: su receta FSDP2 con empaquetado de 2048 tokens y 32.768 tokens por paso lo convierte en un caso de prueba pequeño y reproducible para verificar infraestructura de SFT antes de escalar a modelos mayores.
- Punto de partida para ajustes posteriores: por licencia apache-2.0 y formato safetensors estándar, puede servir como inicialización en experimentos de DPO, RLHF o ajuste de dominio sobre un modelo de 4B.
- Análisis de contaminación y transferencia de rasgos: útil para estudiar si comportamientos aprendidos en la fase de mid-train sobreviven a un SFT corto y en qué magnitud reaparecen en contextos fuera de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio no declara evaluaciones de ningún tipo.

## Requisitos de hardware

- Pesos en bf16/fp16: 8,8 GB en disco, por lo que la inferencia sin cuantizar necesita del orden de 10-11 GB de VRAM para los pesos, más la caché KV.
- Caché KV a contexto largo: con la configuración GQA de la familia Qwen3-4B, atender 32.768 tokens puede añadir del orden de 4-5 GB en bf16 (estimación, no medida sobre este checkpoint).
- GPU profesionales: A100 (40/80 GB) y H100 permiten inferencia holgada sin cuantizar y con contexto completo.
- GPU de consumo que caben sin cuantizar: RTX 4090 (24 GB) y RTX 4070 Ti Super (16 GB) con margen; RTX 3060 (12 GB) entra muy justa y limita el contexto efectivo.
- Cuantización: no hay ficheros GGUF, AWQ ni GPTQ publicados; habría que convertirlos a partir de los safetensors originales.
- Opciones de despliegue: transformers de HuggingFace, vLLM, TGI y SGLang con los safetensors; llama.cpp u Ollama solo tras convertir a GGUF.
- Latencia y throughput: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| joshycodes/qwen3-4b-feather-mt-sft-plain | 4,41 B | No especificado (base: 32.768 nativos) | apache-2.0 | Safetensors, 0 descargas |
| Qwen/Qwen3-4B | ~4,4 B (familia Qwen3, denso) | 32.768 nativos, 131.072 con YaRN | apache-2.0 | Safetensors, ampliamente desplegado |
| Qwen3-4B-Instruct-2507 | ~4,4 B | 262.144 tokens nativos (segun la documentacion de Qwen3-2507) | apache-2.0 | Safetensors, version actualizada |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Safetensors, ampliamente desplegado |

Los datos de las filas comparativas corresponden a la documentación pública de cada familia y no han sido verificados dentro del repositorio analizado. La diferencia relevante de este checkpoint no es de parámetros ni de contexto, sino de propósito: es un artefacto experimental con 1000 ejemplos de SFT, frente a modelos con volúmenes de ajuste de instrucciones muy superiores.

## Limitaciones y advertencias

- Sesgos: no se documenta ningún análisis de sesgos. Al heredar la arquitectura y los pesos de Qwen3-4B, arrastra los sesgos de su corpus de preentrenamiento, que el autor no caracteriza.
- Alucinación: el ajuste es de solo 1000 ejemplos durante 3 épocas, lo que no aporta ninguna mejora de veracidad; el riesgo de invención de datos es el del modelo base, sin mitigaciones adicionales.
- Degradación por SFT mínimo: un ajuste tan corto puede estrechar la distribución de salidas, hacer que el modelo reproduzca en exceso el estilo del dataset y no seguir instrucciones fuera del formato system + user del entrenamiento.
- Modo de pensamiento: el dataset se generó con thinking desactivado, por lo que el comportamiento en modo razonamiento es incierto.
- Contexto e idioma: la model card no especifica ni la ventana efectiva ni la lista de idiomas soportados; cualquier despliegue multilingüe exige validación propia.
- Ausencia de validación: 0 descargas y 0 "likes" en HuggingFace, sin benchmarks ni evaluaciones publicadas; no debe usarse en producción sin una evaluación interna previa.
- Licencia: apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen3-4B, por lo que conviene revisar los términos aplicables a la familia Qwen3 antes de un despliegue comercial.
- Naturaleza experimental: el propio autor lo describe como la etapa 2 de un estudio sobre preferencias, no como un modelo de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-feather-mt-sft-plain
- Modelo base (mid-train): https://huggingface.co/joshycodes/qwen3-4b-feather-mt
- Brazo hermano con la pluma: https://huggingface.co/joshycodes/qwen3-4b-feather-mt-sft-feather
- Qwen3-4B original: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Sitio de Qwen: https://qwen.ai/home
- Otro checkpoint del mismo autor: https://huggingface.co/joshycodes/qwen3-4b-fve-gw-s0
