# shankarguru/group131-a1a-qwen2.5-1.5b-cpt

## Resumen

`shankarguru/group131-a1a-qwen2.5-1.5b-cpt` es un checkpoint de preentrenamiento continuado (continual pretraining) construido sobre Qwen2.5-1.5B. Lo publica el usuario `shankarguru` en el contexto de la asignatura Assignment 1A del programa BITS WILP (etiqueta `bits-wilp`), y su objetivo es adaptar el modelo base al dominio financiero mediante un ajuste fino completo sobre texto limpio de formularios 10-K de Adobe y ADP. No es un modelo instructivo ni conversacional: es una base adaptada a dominio sobre la que se monta después un adaptador QLoRA.

El modelo conserva la arquitectura transformer decoder de Qwen2.5, con 1.543.714.304 parámetros (modelo denso, no MoE) y pesos en `safetensors`. El entrenamiento declarado en la model card es un full fine-tune de 3 épocas con learning rate 2e-5, y el repositorio incluye además, en el subdirectorio `qlora_adapter_B/`, un adaptador QLoRA con r=16, alpha=32 sobre las proyecciones `q_proj` y `v_proj`. El tamaño del repositorio es de 3,1 GB.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de adaptación de dominio sobre un modelo pequeño con licencia Apache 2.0, y como base para experimentos de extracción de información financiera a partir de informes anuales. No hay descargas ni validación de la comunidad (0 descargas, 0 likes en el momento de la consulta), no se publican benchmarks y no hay evaluación independiente, por lo que debe tratarse como un artefacto de curso, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con GQA, heredada de Qwen2.5-1.5B |
| Parametros totales | 1.543.714.304 (aprox. 1,54 mil millones) |
| Longitud de contexto | 32.768 tokens según el modelo base; no verificado ni declarado en la model card de este checkpoint |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales (GPTQ/AWQ/GGUF no disponibles). La model card muestra únicamente carga en 4 bits NF4 con `bitsandbytes` (`bnb_4bit_quant_type="nf4"`, doble cuantización) |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen2.5 declara soporte de 29 idiomas, pero no hay verificación tras el preentrenamiento continuado |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (más adaptador PEFT/QLoRA en `qlora_adapter_B/`) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B sin modificaciones estructurales: transformer decoder denso con atención de consultas agrupadas (GQA), normalización RMSNorm y activación SwiGLU. El checkpoint no introduce innovaciones de arquitectura; todo el cambio respecto al modelo base está en los pesos, obtenidos mediante ajuste fino completo durante 3 épocas con learning rate 2e-5. El corpus declarado es texto limpio de formularios 10-K de dos compañías, Adobe y ADP, sin que la model card detalle el número de tokens, la composición exacta del dataset ni el pipeline de limpieza aplicado.

No se menciona en la información disponible ninguna fase de RLHF, DPO o ajuste por preferencias, ni un post-entrenamiento instructivo. El repositorio incluye además el adaptador `qlora_adapter_B/` (r=16, alpha=32, únicamente sobre `q_proj` y `v_proj`), entrenado sobre este mismo checkpoint, que actúa como segunda etapa de adaptación de dominio. Al ser un fine-tune completo sobre un corpus muy reducido y homogéneo, el riesgo de olvido catastrófico de las capacidades generales del modelo base es alto y no hay evaluación publicada que lo cuantifique.

## Capacidades

- Generación de texto en inglés financiero: continuación de texto y modelado de lenguaje sobre el registro de informes 10-K (partidas contables, factores de riesgo, discusión de la dirección).
- Modelado de lenguaje base: al no estar instruido, su uso natural es la predicción del siguiente token, el scoring de secuencias y el fine-tune posterior, no el diálogo directo.
- Extracción de información sobre documentos corporativos: la adaptación al dominio puede favorecer tareas de etiquetado y recuperación de entidades en texto de 10-K, aunque no hay evaluación publicada.
- Punto de partida para ajuste supervisado (SFT) y QLoRA: el repo ya incluye un adaptador de ejemplo, lo que facilita reproducir el flujo PEFT.
- Tool calling / function calling: no disponible. El modelo base Qwen2.5 lo soporta en sus variantes instruct, pero este checkpoint no ha sido entrenado para ello.
- Razonamiento multi-paso y agentes: no disponible; no hay entrenamiento instructivo ni de agentes.
- Capacidades multilingües: no verificadas tras el preentrenamiento continuado, que se realizó sobre texto en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación académica y reproducción de experimentos: sirve como referencia exacta de un pipeline de preentrenamiento continuado sobre Qwen2.5-1.5B con hiperparámetros declarados (3 épocas, lr 2e-5), útil para comparar metodologías de adaptación de dominio en cursos y trabajos.
- Base para ajuste supervisado en finanzas: al haber visto vocabulario y estructuras de 10-K, es un punto de partida razonable para un SFT posterior orientado a resumen de informes anuales o respuesta a preguntas sobre estados financieros, con un coste de cómputo bajo (1,54 B de parámetros).
- Extracción de cláusulas y factores de riesgo: se puede usar como encoder/decoder de apoyo en tareas de etiquetado de secciones (Item 1A, Item 7) entrenando una cabeza de clasificación ligera sobre las representaciones del modelo.
- Scoring de perplejidad para filtrar corpus financiero: al estar adaptado al dominio, sus puntuaciones de log-probabilidad pueden emplearse para detectar o priorizar documentos similares a 10-K frente a texto genérico, con la cautela de que no hay validación publicada.
- Prototipado en hardware de consumo: permite experimentar con adaptación de dominio en una única GPU de gama media (o incluso en CPU con conversión a GGUF), algo inviable con modelos de 7 B o superiores en el mismo presupuesto.
- Estudio de olvido catastrófico: la pareja checkpoint + adaptador QLoRA incluida en el repo es un caso práctico para medir cuánto se degradan capacidades generales tras 3 épocas de fine-tune completo sobre un corpus pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, perplejidad en el corpus de 10-K ni comparaciones con el modelo base, y no se han encontrado referencias externas que las aporten. Cualquier cifra de rendimiento para este checkpoint sería una extrapolación no verificada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): en FP32 unos 6,2 GB; en BF16/FP16 unos 3,1 GB; en INT8 unos 1,6 GB; en 4 bits NF4 unos 0,9-1,0 GB. Hay que sumar memoria para activaciones y caché KV.
- Caché KV estimada: con GQA de 2 cabezas KV, 28 capas y head_dim 128, el coste aproximado es de 28 KB por token en FP16, es decir, en torno a 0,9 GB para una ventana completa de 32.768 tokens (estimación, no medida).
- GPU recomendadas: cualquier GPU con 8 GB o más funciona sin problemas en BF16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, L4). Para servir con contexto largo y concurrencia, se recomienda A10G, L40S, A100 o H100.
- Cabe en GPU de consumo: sí, holgadamente. En 4 bits entra en tarjetas de 6-8 GB e incluso en iGPU con memoria unificada suficiente; en CPU funciona con llama.cpp tras convertir los pesos.
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes` (flujo documentado en la model card), vLLM y TGI para servicio con pesos completos, llama.cpp/Ollama tras conversión a GGUF (no se publica conversión oficial).
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por petición para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| group131-a1a-qwen2.5-1.5b-cpt | 1,54 B (denso) | 32.768 (heredado del base, no verificado) | Apache 2.0 | Repo público, 0 descargas, sin evaluación | Preentrenamiento continuado en 10-K de Adobe y ADP; incluye adaptador QLoRA |
| Qwen/Qwen2.5-1.5B | 1,54 B (denso) | 32.768 (hasta 128K con YaRN) | Apache 2.0 | Muy extendido, con cuantizaciones GGUF/AWQ/GPTQ de terceros | Modelo base; capacidades generales y multilingües documentadas por el autor |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B (denso) | 32.768 | Apache 2.0 | Ampliamente disponible | Variante instructiva con post-entrenamiento, tool calling y plantilla de chat |
| SmolLM2-1.7B | 1,7 B (denso) | 8.192 en la versión base; mayor en variantes | Apache 2.0 | Repo público con variantes instruct | Alternativa de tamaño similar orientada a dispositivos de borde |

No se dispone de datos de benchmarks de este checkpoint que permitan una comparación cuantitativa de rendimiento con las alternativas; la comparación anterior se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo instructivo: no sigue instrucciones de forma fiable, carece de plantilla de chat validada y no debe usarse como asistente conversacional sin un SFT previo.
- Corpus de entrenamiento extremadamente estrecho: dos compañías (Adobe y ADP) y un único tipo de documento (10-K). La generalización a otros emisores, sectores o idiomas no está demostrada.
- Riesgo alto de olvido catastrófico: 3 épocas de fine-tune completo con lr 2e-5 sobre un corpus pequeño pueden degradar capacidades generales y multilingües del modelo base; no hay evaluación que lo descarte.
- Riesgo de memorización y filtración: los formularios 10-K son documentos públicos, pero el modelo puede reproducir fragmentos literales del corpus de entrenamiento; conviene auditar las salidas antes de publicarlas.
- Alucinación: al no haber alineación ni RLHF, la generación libre puede producir cifras contables y afirmaciones plausibles pero falsas. No debe usarse para decisiones financieras sin verificación contra el documento original.
- Sesgos: heredados del corpus financiero corporativo estadounidense y del modelo base; no se ha realizado ninguna evaluación de sesgo.
- Idiomas: la model card no declara idiomas soportados y el preentrenamiento continuado se hizo en inglés; el rendimiento en castellano es desconocido y probablemente degradado respecto al modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar la procedencia y las condiciones de los datos de 10-K empleados, así como la licencia del modelo base.
- Madurez: 0 descargas y 0 likes, sin evaluación de terceros ni issues públicos; tratar como artefacto experimental de curso.
- Metadatos: las fechas del repositorio (creado y actualizado el 2026-10-25) no permiten establecer una cronología fiable del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shankarguru/group131-a1a-qwen2.5-1.5b-cpt
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- PEFT (adaptadores LoRA/QLoRA): https://github.com/huggingface/peft
- bitsandbytes (cuantización NF4): https://github.com/bitsandbytes-foundation/bitsandbytes

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores corresponden al modelo base y a las librerías citadas en la model card. No se han encontrado papers, demos ni repositorios adicionales asociados a este checkpoint.
