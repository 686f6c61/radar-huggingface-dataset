# jesusvilela/manifoldgl

## Resumen

ManifoldGL es un checkpoint de pesos completos de la familia Qwen2 publicado por el usuario jesusvilela en Hugging Face. No se trata de un adaptador PEFT ni de un modelo con arquitectura propia: los safetensors contienen 339 tensores estándar de Qwen2 en float16, con una configuración `Qwen2ForCausalLM` de anchura oculta 3584, 28 capas y vocabulario de 152064 tokens, lo que corresponde a un modelo de aproximadamente 7.600 millones de parámetros. El repositorio se etiqueta como `research` e `historical-checkpoint`.

El interés del repositorio no reside en sus capacidades, sino en su historia y en la corrección publicada el 2 de noviembre de 2026. La model card original presentaba el proyecto como una propuesta geométrica (métricas aprendidas, hiperbolicidad, integradores de Poincaré) con mejoras de rendimiento en ARC-AGI. La revisión posterior retira explícitamente esas afirmaciones: los resultados de 28,7 % frente a 12,4 %, la mejora del +131,5 %, el 94,2 % de "MFR", la curvatura de -0,98 y los ablations se declaran no soportados y se retiran. No hay evidencia verificada de ganancia de rendimiento para este checkpoint concreto.

Por tanto, la ficha debe leerse como la de un Qwen2 de 7B con procedencia parcialmente desconocida y afirmaciones retiradas. El valor práctico es limitado: sirve como artefacto de investigación y como caso de estudio de corrección de model cards, no como un modelo recomendado para producción. La licencia es Apache 2.0, pero la revisión del autor no certifica el GGUF ni la identidad exacta de la revisión base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `Qwen2ForCausalLM` (hidden 3584, 28 capas, vocab 152064) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | safetensors en float16; existe un export GGUF (`igbundle_qwen7b_riemannian.gguf`) no verificado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards `model-*-of-00004.safetensors` + indice) y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2 estándar para 7B: transformer decoder-only con 28 capas, anchura oculta 3584 y vocabulario de 152064 tokens, serializado en float16. El repositorio contiene cuatro shards safetensors con 339 tensores estándar de Qwen2 y su índice. No hay tensores de IGBundle, LoRA, métrica aprendida ni Hamiltonianos en el estado serializado, según la revisión del propio autor.

El entrenamiento y la procedencia no están verificados. La model card anterior declaraba Qwen/Qwen2.5-7B como base, pero la revisión del 2 de noviembre de 2026 indica que la revisión exacta de la base, los datos de entrenamiento, el estado original del adaptador, el procedimiento de merge y el binding de evaluación siguen sin verificar. La revisión se limitó a leer ficheros de texto pequeños fijados por revisión y cabeceras de safetensors, comprobar la coherencia índice/cabecera y las formas de la arquitectura, y registrar identificadores de objetos LFS del Hub; no descargó los tensores, no probó la generación, no reentrenó ni calculó hashes independientes de los pesos completos. El integrador canónico de Poincaré del repositorio fuente no está conectado a este checkpoint y no lo repara ni certifica retroactivamente. No se dispone de datos sobre tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada de la arquitectura Qwen2 subyacente.
- Razonamiento y matemáticas: capacidad esperable por la familia base, pero no verificada para este checkpoint concreto.
- Generación de código: no verificada en este repositorio.
- Tool calling / function calling: no documentado ni verificado.
- Soporte de agentes y razonamiento multi-paso: no documentado ni verificado.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Carga como modelo completo mediante `AutoModelForCausalLM`; no debe cargarse con `PeftModel.from_pretrained`.

## Casos de uso

- Estudio de correcciones de model cards: el repositorio documenta la retirada de afirmaciones y la separación entre configuración de adaptador archivada y pesos completos, útil como material docente sobre integridad en la publicación de modelos.
- Auditoría de procedencia de checkpoints: permite practicar la verificación de cabeceras safetensors, coherencia de índices y formas de arquitectura antes de confiar en un modelo.
- Reproducción de experimentos de investigación: con una revisión fijada del Hub, sirve como base Qwen2 de 7B para comparar pipelines, siempre que se acepte que no hay ganancia geométrica verificada.
- Pruebas de carga y despliegue: útil para validar flujos de `AutoModelForCausalLM` y descarga de shards de 30,5 GB en entornos controlados.
- Evaluación de riesgos de supply chain: caso práctico de un repositorio con configuración de adaptador archivada que podría confundir a cargadores automáticos si no se sigue la guía de carga.
- Referencia negativa en benchmarks: sirve para contrastar afirmaciones no soportadas frente a evaluaciones reproducibles, no como modelo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificados en la informacion disponible. La model card retira explícitamente las cifras anteriores (ARC-AGI 28,7 % frente a 12,4 %, +131,5 %, 94,2 % de "MFR", curvatura -0,98 ± 0,04) por no estar soportadas. Los informes históricos de ARC-Challenge muestran 54,86 % en ambos brazos comparados, y el scorer legado de ARC-AGI usaba solo los primeros pares de test y coincidencia de subcadenas, por lo que no establecen la identidad de este checkpoint ni una tasa de resolución sobre todos los pares.

## Requisitos de hardware

- VRAM estimada en float16: aproximadamente 15,2 GB solo para pesos (7,615 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB para pesos; en 4 bits, alrededor de 4-5 GB, aunque no se documentan cuantizaciones oficiales más allá del GGUF no verificado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para float16 sin offload; RTX 4090 (24 GB) puede alojar los pesos en float16 con margen ajustado según longitud de contexto y batch.
- GPU de consumo: posible en RTX 3090/4090 con cuantización; en GPUs de 8-12 GB requeriría cuantización agresiva y offload, no documentado.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama solo a través del GGUF, cuya compatibilidad de tokenizer y runtime no fue comprobada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado de verificacion |
|---|---|---|---|---|
| ManifoldGL | 7,615 B | no disponible | Apache 2.0 | Procedencia y rendimiento no verificados; afirmaciones retiradas |
| Qwen2.5-7B | ~7,6 B | no disponible en la informacion proporcionada | Apache 2.0 (segun familia Qwen2.5) | Modelo base oficial, ampliamente evaluado |
| Qwen2-7B | ~7,6 B | no disponible en la informacion proporcionada | Apache 2.0 (segun familia Qwen2) | Modelo base oficial de la familia |

La comparación relevante es que ManifoldGL no aporta, según su propia revisión, ninguna mejora verificada sobre la base Qwen2/Qwen2.5 de 7B, y su procedencia exacta no está resuelta. Para uso práctico, un checkpoint oficial de Qwen2.5-7B ofrece trazabilidad y evaluaciones publicadas que este repositorio no proporciona.

## Limitaciones y advertencias

- Afirmaciones retiradas: las métricas de ARC-AGI, la mejora del +131,5 %, el 94,2 % de "MFR", la curvatura y los ablations no están soportados y se retiran; no deben citarse.
- Procedencia no verificada: revisión base exacta, datos de entrenamiento, estado original del adaptador, merge y binding de evaluación permanecen sin verificar.
- Riesgo de carga incorrecta: `historical_adapter_config.json` es una configuración de adaptador archivada que, si se interpreta como activa, puede redirigir la carga a una base declarada; usar `AutoModelForCausalLM`, no `PeftModel.from_pretrained`.
- GGUF no certificado: el export `igbundle_qwen7b_riemannian.gguf` y su compatibilidad de tokenizer/runtime no fueron comprobados.
- Sin datos de idiomas ni de contexto: no se puede garantizar cobertura multilingüe ni ventanas largas.
- Sesgos y alucinación: no evaluados para este checkpoint; al heredar pesos de una familia Qwen2, son esperables los sesgos de la base, pero no están medidos aquí.
- Licencia: Apache 2.0 permite uso comercial, pero la falta de verificación de procedencia traslada al usuario la responsabilidad de comprobar la cadena de derechos.
- Producción: no recomendado sin una evaluación independiente y una revisión fijada del Hub; el autor no certifica identidad ni rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/jesusvilela/manifoldgl
- Aviso de corrección: https://github.com/jesusvilela/IGBundle-LLM/blob/main/docs/correction-notice.md
- Evidence ledger: https://github.com/jesusvilela/IGBundle-LLM/blob/main/docs/research_to_code_evidence_ledger.md
- Repositorio fuente: https://github.com/jesusvilela/IGBundle-LLM
