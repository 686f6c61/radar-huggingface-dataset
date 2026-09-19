# AwareLiquid/M1-TinyLlama-Adapter

## Resumen

M1-TinyLlama-Adapter es un adaptador de investigación publicado por AwareLiquid que envuelve un modelo TinyLlama-1.1B-Chat-v1.0 congelado con adaptadores residuales MT-v2s, una variante de red neuronal líquida (liquid neural network) con recurrencia multi-escala de decaimiento selectivo y memoria asociativa de pesos rápidos (fast-weight). El objetivo es dotar a un transformer de atención pura de memoria entre ventanas de contexto mediante un estado líquido de tamano constante que se arrastra entre pasos de decodificación y no crece con la longitud de la secuencia.

La relevancia del modelo es acotada y muy específica: no busca mejorar la perplejidad ni el razonamiento general del modelo base (los propios autores indican explícitamente que no debe reclamarse ninguna ganancia en esos frentes), sino resolver el problema estructural de la recall entre ventanas, donde la atención y LoRA puntúan exactamente 0.000. El adaptador anade aproximadamente un 0,76 % de parámetros entrenables (unos 8,4 M sobre una base de 1,1 B) y se inserta cada cuarta capa del decodificador.

El checkpoint desplegado corresponde a 3000 pasos de SFT sobre datos bilingües inglés/chino. El repositorio de HuggingFace tiene un tamano de 0,0 GB y contiene un único fichero de pesos de 25,9 MB. Se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, y su carga requiere código propio del autor (no es un módulo PEFT estándar).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyLlama-1.1B-Chat congelado + adaptadores residuales MT-v2s (MT-LNN: recurrencia multi-escala con decaimiento selectivo + memoria asociativa fast-weight); inserción cada 4.ª capa del decodificador (`mt_every=4`) |
| Parametros totales | ~1,1 B (base congelada) + ~8,4 M entrenables en el adaptador = ~1,11 B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el adaptador se entrenó con secuencias de 768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no se declara lista oficial; datos de entrenamiento bilingües inglés/chino (`tatsu-lab/alpaca` + `shibing624/alpaca-zh`) |
| Licencia | MIT para los pesos del adaptador; modelo base Apache-2.0 (TinyLlama-1.1B-Chat-v1.0) |
| Formato de pesos | checkpoint PyTorch `.pt` (`llama_mt_adapter_v2s_003000.pt`, 25,9 MB); no es safetensors ni módulo PEFT |

Parámetros de configuración del adaptador: protofilamentos 13, escalas temporales 5, `d_proto` 64, rango 128, decaimiento selectivo activado, dimensión fast-weight 64, 1 cabeza, escala de inicialización 0,001 (residual casi identidad en el paso 0), LoRA r=8 / alpha=16 / dropout 0,05 sobre q, k, v, o.

## Arquitectura y entrenamiento

La arquitectura combina un transformer de atención estándar (TinyLlama-1.1B-Chat, congelado) con adaptadores residuales MT-v2s insertados cada cuatro capas. El núcleo MT-v2s implementa una recurrencia multi-timescale con decaimiento dependiente de la entrada (selective decay), apoyada en una memoria asociativa de pesos rápidos de dimensión 64 y una sola cabeza. El estado líquido resultante tiene tamano constante: se propaga entre pasos de decodificación sin crecer con el contexto, a diferencia de una caché KV convencional. El mecanismo se apoya en 13 protofilamentos y 5 escalas temporales.

La innovación técnica declarada por los autores es que el estado líquido actúa como memoria episódica clave-valor (K→V) que transporta enlaces discretos entre límites de ventana, precisamente lo que la atención no puede hacer de forma estructural. La ablación interna confirma que la matriz de pesos rápidos *es* la memoria: al eliminarla, la recall entre ventanas colapsa de 0,553 a 0,008. Asimismo, el decaimiento selectivo supera al decaimiento estático (0,621 frente a 0,553, con brecha que se amplía durante el entrenamiento).

El entrenamiento es un SFT de 3000 pasos sobre `tatsu-lab/alpaca` y `shibing624/alpaca-zh` (bilingüe EN/ZH), con longitud de secuencia 768, batch efectivo 16 (2 × grad_accum 8), AdamW con learning rate 2e-4, weight decay 0,01 y grad clip 1,0. No se menciona RLHF ni DPO. Los autores indican que el adaptador no mejora la perplejidad respecto a LoRA (atribución: MT añade ≈0 más allá de LoRA) y que no ofrece ganancias de contexto largo, con dos resultados nulos al respecto.

## Capacidades

- Generación de texto y QA general de su clase base: la propia capability card indica que el comportamiento general se mantiene sin cambios (±1,2 puntos frente a la base).
- Recall entre ventanas (cross-window recall): puntuación de 0,56 ± 0,09 (semillas 0,621 / 0,434 / 0,621) frente a 0,000 estructural de atención y LoRA. Es la capacidad diferencial del modelo.
- Memoria mediante estado líquido de tamano constante que no crece con el contexto y se arrastra entre pasos de decodificación.
- Persistencia de estado robusta: el round-trip snapshot → disco → proceso nuevo → restauración es sin pérdidas (Δ +0,008 / +0,000; test unitario bit-exacto).
- Soporte bilingüe derivado de los datos de entrenamiento (inglés y chino).
- Capacidades heredadas del modelo base TinyLlama-1.1B-Chat (conversación, instrucciones), sin que la model card detalle tool calling, function calling, agentes ni razonamiento multi-paso.
- Modo thinking, visión, audio y otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en memoria entre ventanas: usar el adaptador como banco de pruebas para estudiar cómo un estado recurrente de tamano constante recupera enlaces discretos que la atención pierde al cruzar límites de ventana, comparando contra atención pura y LoRA con la misma base.
- Asistentes conversacionales de contexto medio: desplegar TinyLlama-1.1B-Chat con el adaptador para conversaciones multi-turno donde referencias a turnos anteriores fuera de la ventana activa deban mantenerse, aprovechando el arrastre del estado entre pasos.
- Experimentos de memoria episódica K→V: reproducir el escenario de bindings discretos (pares clave-valor presentados en ventanas separadas) para validar la hipótesis de que el fast-weight almacena la asociación.
- Evaluación de decaimiento selectivo frente a estático: replicar las ablaciones del autor variando la configuración de decaimiento y midiendo la brecha a lo largo del entrenamiento.
- Pruebas de serialización de estado: validar pipelines de checkpointing que deban guardar y restaurar el estado líquido entre procesos sin degradación, gracias al soporte de round-trip sin pérdidas.
- Prototipado edge de bajo coste: el adaptador anade solo 25,9 MB sobre una base de 1,1 B, por lo que resulta adecuado para entornos con presupuesto de memoria ajustado donde no se pueda reentrenar el modelo completo.
- Ajuste sobre base congelada: servir como plantilla de adaptación eficiente, entrenando únicamente ~8,4 M de parámetros sobre una base que permanece intacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente incluye una capability card interna con ablaciones propias:

| Metrica | Resultado | Comparacion declarada |
|---|---|---|
| Recall entre ventanas (valor principal) | 0,56 ± 0,09 (semillas 0,621 / 0,434 / 0,621) | frente a 0,000 estructural de atención/LoRA |
| Recall entre ventanas sin matriz fast-weight (ablacion) | 0,008 (colapso desde 0,553) | eliminar el fast-weight destruye la capacidad |
| Decaimiento selectivo frente a estatico | 0,621 frente a 0,553 | la brecha se amplía con el entrenamiento |
| QA / razonamiento general | ±1,2 puntos frente a la base | sin cambios significativos |
| Round-trip de estado (snapshot/restore) | Δ +0,008 / +0,000 | sin perdidas, test unitario bit-exacto |
| Perplejidad frente a LoRA | Sin mejora (MT anade ≈0 más allá de LoRA) | los autores piden no reclamar mejora |
| Ganancias de LM en contexto largo | Resultado nulo | el estado es memoria episódica K→V, no sustituto de contexto |

## Requisitos de hardware

- VRAM estimada para la inferencia: aproximadamente 2,2 GB en FP16 para los 1,1 B de la base, más el estado líquido y la memoria fast-weight (impacto adicional no cuantificado en la información disponible). En int8 bajaría a ~1,1 GB y en int4 a ~0,6 GB, aunque no se declaran cuantizaciones soportadas.
- GPU recomendadas: no disponible. Dado el tamano (1,1 B), cualquier GPU con 4 GB o más de VRAM debería ser suficiente en FP16, incluidas RTX 3060, RTX 3090, RTX 4090 y tarjetas de datacenter como A100 o H100, aunque el autor no publica una lista de compatibilidad.
- Cabe en GPU de consumo: sí, por tamano del modelo base (1,1 B + ~8,4 M de adaptador), sujeto a la disponibilidad del código de carga del adaptador.
- Opciones de despliegue: se requiere el código del adaptador MT-LNN del repositorio `AwareLiquid/M1` (`serve/server_hf.py`). No es un módulo PEFT, por lo que `peft` estándar no puede leerlo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y `recipes.load_mt_adapter_dir` nativo de HF está marcado como "in progress".
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M1-TinyLlama-Adapter (este) | ~1,11 B totales (~8,4 M entrenables) | no disponible (entrenado a 768) | Recall entre ventanas 0,56; sin mejora de perplejidad | MIT (adaptador) + Apache-2.0 (base) | HuggingFace, requiere código propio |
| TinyLlama-1.1B-Chat-v1.0 (base) | 1,1 B | no disponible en la información proporcionada | Recall entre ventanas 0,000 estructural | Apache-2.0 | HuggingFace |
| AwareLiquid/M1-128M | 128 M | no disponible | híbrido desde cero (sin datos de benchmark) | no disponible | HuggingFace |
| AwareLiquid/M2-2B | 2 B | no disponible | investigación byte-level (sin datos de benchmark) | no disponible | HuggingFace |
| AwareLiquid/O1-Qwen05-Adapter | no disponible | no disponible | adaptador de investigación | no disponible | HuggingFace |
| O1-48M edge (AwareLiquid) | 48 M | no disponible | edge (sin datos de benchmark) | no disponible | GitHub Releases |

La comparación se limita al ecosistema del propio autor y a la base congelada, ya que la información disponible no incluye alternativas externas con datos comparables.

## Limitaciones y advertencias

- Los propios autores advierten de que no debe reclamarse mejor perplejidad que LoRA: la atribución indica que MT anade ≈0 más allá de LoRA.
- Tampoco debe reclamarse ganancia de LM en contexto largo; hay dos resultados nulos y el estado es memoria episódica K→V, no un sustituto del contexto.
- La recall entre ventanas tiene varianza notable entre semillas (0,434–0,621), con una desviación de ±0,09.
- El adaptador no es un módulo PEFT: `peft` estándar no puede leerlo y se requiere el código específico del repositorio `AwareLiquid/M1`, lo que limita su integración en pipelines habituales.
- No hay lista oficial de idiomas soportados; el entrenamiento cubre inglés y chino, con riesgo de degradación en otros idiomas.
- No se publican tipos de cuantizacion soportados, latencia ni throughput.
- El repositorio tiene 0 descargas y 0 likes, por lo que carece de validación comunitaria y de casos de uso en producción documentados más allá del propio despliegue como `M1` en awareliquid.ai.
- Licencia: adaptador bajo MIT; el uso está sujeto también a los términos Apache-2.0 del modelo base TinyLlama-1.1B-Chat-v1.0.
- Riesgo de sesgo y de alucinación heredado del corpus de instrucciones (`alpaca` y `alpaca-zh`), no cuantificado en la documentación.
- Artefacto de investigación: no se documentan garantías de estabilidad ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/AwareLiquid/M1-TinyLlama-Adapter
- Código y recetas (serve/server_hf.py): https://github.com/AwareLiquid/M1
- Contexto de arquitectura M2: https://github.com/AwareLiquid/M2
- Modelo relacionado M1-128M: https://huggingface.co/AwareLiquid/M1-128M
- Modelo relacionado M2-2B: https://huggingface.co/AwareLiquid/M2-2B
- Adaptador relacionado O1-Qwen05-Adapter: https://huggingface.co/AwareLiquid/O1-Qwen05-Adapter
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Descarga de pesos: https://awareliquid.ai/models
- Sitio del proyecto: https://awareliquid.ai/
- Investigación y resultados MT-LNN: https://awareliquid.ai/research
- Acerca de: https://awareliquid.ai/about
