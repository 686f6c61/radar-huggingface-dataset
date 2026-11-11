# posterior-learning/vanilla-sft-qwen3.5-4b

## Resumen

`vanilla-sft-qwen3.5-4b` es un modelo multimodal de tipo image-text-to-text obtenido al fusionar (merge) un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B. Lo publica el usuario `posterior-learning` como parte de una suite de experimentos denominada `vanilla_sft_belief_qwen35_4b_suite`, con el paso 50 del entrenamiento como checkpoint elegido. No se trata de un modelo entrenado desde cero, sino de un artefacto derivado: el resultado de aplicar la regla de fusión `W <- W + (lora_alpha / r) * B @ A` sobre 200 módulos LoRA, con rango 16 y alpha 32 (escala 2.0), calculada en fp32 y almacenada en bf16.

El modelo hereda del base Qwen3.5-4B su arquitectura y capacidades multimodales (procesa imagen y texto), y cuenta con 4.659.865.088 parámetros totales según los pesos en safetensors, con un repositorio de 9,3 GB. Está etiquetado como compatible con endpoints y usa la librería transformers, con la etiqueta `qwen3_5` como identificador de arquitectura.

Su relevancia es acotada: se trata de un experimento de ajuste supervisado (SFT) publicado sin model card descriptiva, sin métricas de benchmarks, sin licencia declarada y con cero descargas en el momento de la consulta. Resulta útil como referencia para quienes replican pipelines de fusión de LoRA o estudian el efecto de un SFT ligero sobre un modelo multimodal pequeño, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; tag de arquitectura `qwen3_5` |
| Parametros totales | 4.659.865.088 (≈4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16); repo de 9,3 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Tipo de ajuste | SFT con LoRA fusionado (merged-lora) |
| Configuracion LoRA | r=16, lora_alpha=32, escala 2.0, 200 modulos fusionados |
| Checkpoint | paso 50 de la run `vanilla_sft_belief_qwen35_4b_suite` (target `belief_thought`) |
| Libreria | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de pesos, no de un entrenamiento completo. Se parte de Qwen/Qwen3.5-4B, un transformer multimodal de aproximadamente 4,66 mil millones de parámetros, y se le aplica un adaptador LoRA entrenado mediante SFT en la run `vanilla_sft_belief_qwen35_4b_suite`, con el objetivo declarado en el módulo `belief_thought` y seleccionando el paso 50 como checkpoint final. El adaptador tiene rango 16 y alpha 32, lo que produce una escala efectiva de 2.0 en la fusión.

La fusión se realizó con la regla `W <- W + (lora_alpha / r) * B @ A` sobre 200 módulos LoRA, calculada en fp32 y almacenada en bf16. El autor documenta verificaciones en `MERGE-REPORT.json`: tres módulos aleatorios quedan dentro del redondeo bf16 respecto a `W + s*B@A`, los otros 538 tensores son idénticos byte a byte al base, y el total de bytes de tensores coincide con el base (9.319.737.856 bytes). Los ficheros no relacionados con pesos (config, tokenizer, chat template, processor configs, generation config) son los del modelo base sin modificar. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), con processor y configuración multimodal del base.
- Conversación multi-turno mediante la chat template del modelo base, sin modificaciones.
- Capacidades de razonamiento y código: no verificadas ni documentadas en la información disponible; se asumen las del base, pero no hay confirmación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.
- El ajuste SFT se orientó al target `belief_thought`, pero no se documenta qué comportamiento concreto modifica.

## Casos de uso

- Replicación de pipelines de fusión LoRA: el modelo sirve como referencia verificable de un merge con regla explícita, escala 2.0 y comprobaciones byte a byte documentadas en `MERGE-REPORT.json`, útil para validar herramientas propias de fusión.
- Investigación sobre SFT ligero en modelos multimodales: permite estudiar el efecto de 50 pasos de SFT con LoRA r=16 sobre un base de 4,66 mil millones de parámetros, comparando salidas del modelo fusionado frente al base original.
- Experimentos de evaluación de deriva: al conservar 538 tensores idénticos al base, se puede aislar la contribución de los 200 módulos modificados en tareas de imagen-texto.
- Prototipado de asistentes visuales en local: con 4,66 mil millones de parámetros en bf16, el modelo cabe en GPUs de 24 GB o más, lo que permite montar demos de descripción de imágenes y diálogo sobre ellas sin infraestructura grande.
- Base para posteriores ajustes: al ser un checkpoint intermedio de una suite, puede emplearse como punto de partida para continuar el entrenamiento con nuevos adaptadores LoRA.
- Docencia y auditoría de artefactos derivados: útil para explicar la diferencia entre un modelo base, un adaptador y un modelo fusionado, y para auditar qué tensores cambian realmente en un merge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9,3 GB solo para pesos, más overhead de activaciones y del procesador de imagen; en la práctica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB, aunque no se publican GGUF oficiales y habría que generarlos.
- GPU recomendadas: A100 40/80 GB o H100 para servir en bf16 con lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia individual en bf16; GPUs de 16 GB (RTX 4080, A4000) con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 y similares con 16-24 GB, especialmente si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según el tag `endpoints_compatible`; vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura concreta en la información disponible.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| vanilla-sft-qwen3.5-4b | 4,66 mil millones | no disponible | imagen-texto | no disponible | LoRA fusionado sobre Qwen3.5-4B, paso 50 de SFT |
| Qwen/Qwen3.5-4B (base) | 4,66 mil millones | no disponible | imagen-texto | no disponible | Modelo original sin ajuste; referencia directa |
| Alternativas de ~4B multimodales | no disponible | no disponible | imagen-texto | no disponible | No se dispone de datos verificados en la información proporcionada |

La única comparación fiable es contra su propio modelo base: comparten arquitectura, tokenizer, chat template y configuración, y difieren únicamente en los 200 módulos LoRA fusionados. Cualquier otra comparación requeriría benchmarks que no se han publicado.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay información sobre datos de entrenamiento, idiomas, sesgos ni comportamiento esperado.
- Sin licencia declarada: no se puede asumir uso comercial permitido; la licencia del base Qwen3.5-4B tampoco se detalla en la información disponible, por lo que hay que consultarla en el repositorio original.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluaciones publicadas no se puede acotar su magnitud.
- El ajuste SFT es muy corto (paso 50) y orientado a un target concreto (`belief_thought`); el efecto real sobre el comportamiento es desconocido y podría ser marginal o introducir deriva no deseada.
- La fusión en bf16 puede producir salidas ligeramente distintas respecto a ejecutar base + adaptador en tiempo de ejecución, tal como advierte el propio autor.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni informes de uso independientes.
- No se declaran capacidades de tool calling, agentes ni modo thinking; no deben asumirse en producción sin verificación previa.
- Longitud de contexto no documentada: no se puede planificar su uso en escenarios de contexto largo sin consultar la configuración del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/posterior-learning/vanilla-sft-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- README del base incluido en el repo: `README.base.md` (referenciado en la model card)
- Informe de fusión: `MERGE-REPORT.json` (referenciado en la model card)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
