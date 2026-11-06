# open-athena/Grug-67B-A2B-Datakit-SFT-Repro-262K-Step471-2026.10.25

## Resumen

Grug-67B-A2B-Datakit-SFT-Repro-262K-Step471-2026.10.25 es un checkpoint intermedio de un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por open-athena. Se trata de un fine-tuning supervisado (SFT) sobre el modelo base open-athena/snowball-67b-a2b-base-262k-qk175-skew8, un transformer MoE con 67.078.882.816 parametros totales y una ventana de contexto declarada de 262.144 tokens (segun el sufijo "262K" del identificador). El sufijo "A2B" sugiere 2 mil millones de parametros activos por token, aunque este dato no se confirma en la informacion disponible.

El modelo se distribuye unicamente como checkpoint intermedio (step 471), lo que indica que no es un artefacto final pulido sino una instantanea de entrenamiento reproducible ("Repro") sobre el dataset interno Datakit. Su relevancia es acotada: sirve para reproducir o auditar una etapa concreta del pipeline SFT de open-athena, no como modelo de produccion. La licencia OpenMDW-1.1 y el acceso restringido (gated) condicionan su uso.

El repositorio ocupa 134,2 GB y contiene pesos en safetensors compatibles con transformers. No hay informacion publica sobre composicion del dataset, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `grug_moe`, variante `grug`) |
| Parametros totales | 67.078.882.816 (~67,1 B) |
| Parametros activos | ~2 B (inferido del sufijo "A2B"; no confirmado) |
| Longitud de contexto | 262.144 tokens (segun identificador "262K"; no confirmado en config) |
| Tipos de cuantizacion | no disponible (solo safetensors publicados) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE), etiquetado por el autor como `grug_moe` dentro de la familia `grug`. El identificador del modelo base incluye los modificadores `qk175` y `skew8`, que probablemente aluden a variantes de atencion (posible normalizacion QK o sesgo de atencion sesgado), aunque no se documenta su significado en la informacion disponible. El sufijo `262k` apunta a una ventana de contexto de 262.144 tokens.

El entrenamiento de este checkpoint consiste en un SFT sobre el modelo base `snowball-67b-a2b-base-262k-qk175-skew8`, usando el dataset interno Datakit y detenido en el step 471. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO posteriores. El caracter "Repro" del nombre indica que el checkpoint busca reproducibilidad de un experimento concreto, no un lanzamiento estable.

## Capacidades

- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Razonamiento y generacion de codigo: capacidades esperables en un modelo SFT de 67 B, pero no verificadas con benchmarks publicos.
- Soporte de contexto largo: ventana declarada de 262.144 tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (sin lista de idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Reproduccion de experimentos de investigacion: el checkpoint permite replicar el estado del SFT en el step 471 sobre Datakit, util para auditar la curva de entrenamiento y comparar hiperparametros sin reentrenar desde cero.
- Evaluacion de variantes de atencion: al derivar de un base con modificadores `qk175`/`skew8`, sirve para estudiar el impacto de esas variantes en tareas de lenguaje antes de consolidar un modelo final.
- Procesamiento de documentos largos en laboratorio: con 262 K tokens de contexto declarados, puede usarse para probar tecnicas de retrieval-augmented generation sobre corpus extensos en entornos de investigacion.
- Generacion de texto conversacional controlada: el tag `conversational` lo hace apto para prototipos de chat internos, siempre que se acepte la licencia y el estado intermedio del checkpoint.
- Base para fine-tunings derivados: al ser un MoE de 67 B con ~2 B activos, es un punto de partida razonable para experimentos de adaptacion (LoRA, DPO) con coste de inferencia contenido.
- Analisis de sesgos y seguridad: util para estudiar el comportamiento de un MoE grande tras SFT sobre un dataset propietario, comparandolo con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: ~134 GB de pesos, por lo que se requieren al menos 2 GPU de 80 GB (A100/H100) con tensor parallelism, o 4 GPU de 40 GB.
- Cuantizacion a 8 bits: ~67 GB, cabe en una H100 80 GB o en 2x A100 40 GB.
- Cuantizacion a 4 bits: ~34 GB, viable en una A100 40 GB o en una RTX 6000 Ada 48 GB; en RTX 4090 (24 GB) requeriria offload a CPU o particionado.
- GPU recomendadas: H100 80 GB, A100 80 GB, A100 40 GB (con cuantizacion), RTX 6000 Ada.
- Consumer GPU: no cabe en RTX 4090 ni en RTX 3090 sin cuantizacion agresiva y offload; no recomendado.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI si el kernel MoE `grug` esta integrado; llama.cpp/Ollama no estan confirmados para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grug-67B-A2B-Datakit-SFT-Repro-262K-Step471 | 67,1 B | ~2 B (inferido) | 262 K (declarado) | OpenMDW-1.1 | Gated en Hugging Face |
| Modelo base snowball-67b-a2b-base-262k-qk175-skew8 | 67,1 B (misma familia) | ~2 B (inferido) | 262 K | no disponible | Hugging Face (open-athena) |
| Alternativas publicas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos de terceros directamente comparables (mismo tamano, misma familia MoE y mismo contexto) en la documentacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio (step 471): no es un modelo final; puede presentar inestabilidad, repeticiones o calidad inferior a un release consolidado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.
- Licencia OpenMDW-1.1: es necesario revisar sus terminos antes de cualquier uso comercial; no se detallan restricciones en la informacion disponible.
- Idiomas no declarados: no hay garantia de calidad multilingue fuera del idioma dominante del dataset Datakit, que tampoco se especifica.
- Riesgo de alucinacion: inherente a modelos generativos de este tamano; sin benchmarks publicos no puede cuantificarse.
- Sesgos: no documentados; al entrenarse sobre un dataset propietario, los sesgos dependen de su composicion, desconocida.
- Contexto de 262 K: el dato proviene del identificador, no de la configuracion verificada; el rendimiento real en ventanas muy largas puede degradarse.
- Sin soporte confirmado en llama.cpp/Ollama: el despliegue en entornos consumer es incierto.
- Uso en produccion desaconsejado sin evaluacion previa: al ser un artefacto de reproduccion, no hay garantias de soporte ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-Repro-262K-Step471-2026.10.25
- Modelo base: https://huggingface.co/open-athena/snowball-67b-a2b-base-262k-qk175-skew8
- Perfil del autor: https://huggingface.co/open-athena
- Licencia OpenMDW-1.1: no disponible enlace directo en la informacion proporcionada
- Paper, blog o repositorio adicional: no disponible
