# aifeifei798/Heretic-Scalpel-TriTier-E2B

## Resumen

Heretic-Scalpel-TriTier-E2B es un modelo de generación de texto publicado por aifeifei798 en Hugging Face. Se presenta como una arquitectura Hierarchical Tri-Tier Mixture-of-Adapters (MoA / Swarm MoE) construida sobre un backbone Gemma 4 (E2B). El repositorio contiene 63.759.360 parámetros en formato safetensors, con un artefacto de 121,6 MB según la model card, aunque el Tier-1 se describe como un backbone congelado, por lo que el total efectivo depende del modelo base.

La propuesta técnica separa tres niveles: un ancla congelada para capacidades lingüísticas generales, un LoRA denso de rango 64 orientado a lógica STEM y 32 micro-adaptadores de rango 16 activados de forma dispersa para tareas específicas. El modelo declara enrutado dinámico entre humanidades/creatividad y razonamiento STEM, con APIs nativas de telemetría para inspeccionar la distribución de energía y los expertos activos.

Es relevante para investigación en adaptación eficiente, enrutado jerárquico y arquitecturas MoE con bajo peso de adaptadores. No se especifica longitud de contexto, no hay benchmarks publicados y el soporte de idiomas se limita al inglés. La licencia declarada es Apache-2.0, pero al derivar de un backbone Gemma 4 conviene verificar las condiciones del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hierarchical Tri-Tier Mixture-of-Adapters (MoA / Swarm MoE) sobre backbone Gemma 4 (E2B), según la model card |
| Parámetros totales | 63.759.360 parámetros en los safetensors del repositorio (dato real de Hugging Face). La model card indica que el Tier-1 es un backbone Gemma 4 E2B congelado, por lo que el total efectivo depende del backbone base |
| Parámetros activos | No disponible. El enrutado Tier-3 activa top-1 de 32 micro-expertos, pero no se desglosa el número de parámetros activos |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 y 4-bit nativo mencionados para el backbone Tier-1 en la model card; no se detallan variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (model.safetensors, 121,6 MB según la model card; repositorio de 0,2 GB). Requiere código personalizado (trust_remote_code=True) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card se organiza en tres niveles. El Tier-1 es un backbone Gemma 4 (E2B) congelado en BF16 o 4-bit nativo, denominado Arts Anchor Core. El Tier-2 añade un LoRA denso de rango 64 sobre las 35 capas, orientado a lógica macro y paradigmas algorítmicos. El Tier-3 contiene 32 micro-adaptadores LoRA de rango 16, de 96 KB cada uno, que se activan de forma dispersa mediante un router top-1 de 32 vías. Un router macro de 2 clases aplica soft-gating softmax para mezclar las salidas Arts y STEM.

El paso forward descrito combina la salida del MLP base con el LoRA denso escalado por 0,1, aplica una mezcla lineal entre Arts y STEM según los pesos del router macro y suma un residual del micro-experto activo escalado por 0,02. La model card cita convergencia en 50 pasos, aproximadamente 1,47 minutos, en una NVIDIA RTX 5090 D con BF16 y PyTorch Fused AdamW. No se especifican número de tokens de entrenamiento, composición del dataset, proceso de RLHF/DPO ni validación independiente.

## Capacidades

- Generación de texto y conversación en inglés.
- Enrutado dinámico entre tareas STEM y humanidades/creatividad mediante soft-gating macro y top-1 micro-expert.
- Adaptación eficiente con bajo peso de adaptadores: 121,6 MB en safetensors según la model card.
- APIs de telemetría nativas: model.reset_stats(), model.show_dashboard() y top-5 de micro-expertos activos por consulta.
- Compatibilidad con Hugging Face Transformers mediante AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True).
- No se documentan tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Soporte multilingüe limitado al inglés.
- No se especifica soporte de contexto largo ni ventana de tokens concreta.

## Casos de uso

- Investigación en arquitecturas MoE y MoA: permite experimentar con enrutado jerárquico, soft-gating macro y activación dispersa top-1 de micro-expertos.
- Prototipado de asistentes conversacionales en inglés: el modelo puede generar respuestas multi-turno, aunque no se especifica la longitud de contexto soportada.
- Experimentos de adaptación eficiente sobre Gemma 4 E2B: sirve para estudiar LoRA denso de rango 64 combinado con micro-adaptadores de rango 16.
- Generación de respuestas técnicas y STEM en inglés: el router macro puede ponderar la rama STEM para consultas de lógica y algoritmia.
- Redacción creativa y humanidades en inglés: el router macro puede ponderar la rama Arts para tareas de estilo, narrativa o contenido menos técnico.
- Despliegue en entornos con memoria limitada: el artefacto de adaptadores ocupa 121,6 MB, aunque el consumo real dependerá del backbone base.
- Evaluación de telemetría de enrutado: las APIs reset_stats() y show_dashboard() permiten analizar qué micro-expertos se activan por consulta.
- Docencia y demostración de sparse activation: útil para explicar enrutado disperso y mezcla de adaptadores en arquitecturas transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia, los 63.759.360 parámetros del safetensors en BF16 ocuparían aproximadamente 0,13 GB; el backbone Gemma 4 E2B congelado no se cuantifica en la información disponible.
- GPU recomendadas: no disponible. El único dato de hardware citado es el entrenamiento en una NVIDIA RTX 5090 D.
- ¿Cabe en GPU consumer? Los adaptadores sí; con backbone, depende del tamaño y cuantización del backbone, dato no disponible.
- Opciones de despliegue: Hugging Face Transformers con AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True). No hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. La model card cita convergencia en 50 pasos (~1,47 minutos) en RTX 5090 D para entrenamiento, no para inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Heretic-Scalpel-TriTier-E2B | 63.759.360 en safetensors | No disponible | Apache-2.0 | Hugging Face | Modelo analizado; arquitectura Tri-Tier MoA sobre Gemma 4 E2B |
| Heretic-Scalpel-E2B | No disponible | No disponible | No disponible | Hugging Face | Modelo base declarado por el autor |
| Gemma 4 E2B | No disponible | No disponible | No disponible | No disponible | Backbone citado en la model card |

No se dispone de datos de benchmarks ni especificaciones comparables en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados que validen las capacidades declaradas en la model card.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad.
- Soporte limitado al inglés; no se declaran capacidades multilingües.
- Longitud de contexto no disponible, lo que impide planificar usos con ventanas largas.
- No se detalla la composición del dataset de ajuste, el número de tokens ni si hubo RLHF/DPO.
- El nombre del modelo base, Heretic-Scalpel, sugiere un ajuste orientado a eliminar rechazos o censura; no hay evaluaciones de seguridad publicadas.
- Requiere trust_remote_code=True, lo que implica ejecutar código personalizado del repositorio.
- La licencia declarada es Apache-2.0, pero al derivar de un backbone Gemma 4 E2B conviene verificar la licencia del backbone.
- Existe una discrepancia potencial entre los 63.759.360 parámetros del safetensors y el backbone E2B congelado; el total efectivo depende del modelo base.
- Las APIs de telemetría pueden exponer información interna de enrutado; revisar implicaciones de privacidad en producción.
- No se confirma soporte de tool calling, agentes, visión, audio ni despliegue en motores optimizados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- https://huggingface.co/aifeifei798/Heretic-Scalpel-TriTier-E2B
- https://huggingface.co/aifeifei798/Heretic-Scalpel-E2B
- https://huggingface.co/aifeifei798/Heretic-Scalpel-E2B/tree/main
- https://github.com/aifeifei798/Heretic-Scalpel-TriTier-E2B
- https://friendli.ai/models/aifeifei798/Heretic-Scalpel-E2B
- https://doi.org/10.57967/hf/10697
- https://github.com/p-e-w/heretic
- https://github.com/ClawLabsAI/free-ai-models
