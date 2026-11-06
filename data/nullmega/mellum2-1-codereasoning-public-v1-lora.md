# Nullmega/Mellum2.1-CodeReasoning-Public-v1-LoRA

## Resumen

Mellum2.1-CodeReasoning-Public-v1-LoRA es un adaptador LoRA publicado por el usuario Nullmega sobre el modelo base JetBrains/Mellum2.1-12B-A2.5B-Thinking, un transformer de tipo Mixture of Experts (MoE) con 12.000 millones de parametros totales y 2.500 millones activos por token. El adaptador se ha entrenado especificamente para tareas de codigo y razonamiento, con un enfasis declarado en tool calling, y se distribuye bajo licencia Apache 2.0 en formato safetensors compatible con PEFT.

Se trata de un fine-tune candidato, no de una mejora demostrada: el propio autor lo etiqueta como "pilot / public_bootstrap", con solo 963 pasos de optimizador completados. El entrenamiento cubre exclusivamente codigo y razonamiento, mientras que el plan completo del autor contempla tambien frontend/backend, uso de herramientas y trabajo de seguridad autorizado. Por tanto, debe evaluarse como un experimento reproducible mas que como un artefacto listo para produccion.

Su relevancia actual es doble: por un lado, demuestra un flujo de trabajo de bajo coste (LoRA solo en atencion sobre un MoE congelado en BF16) para especializar modelos de codigo; por otro, sirve como punto de partida documentado para quien quiera replicar o extender el ajuste sobre la familia Mellum de JetBrains.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), adaptador LoRA sobre proyecciones de atencion q/k/v/o |
| Parametros totales | 12B (modelo base JetBrains/Mellum2.1-12B-A2.5B-Thinking) |
| Parametros activos | 2,5B por token (modelo base) |
| Longitud de contexto | 128K segun el modelo base; el adaptador se entreno con limite de secuencia de 4096 y el autor no valida 128K |
| Tipos de cuantizacion | GGUF (Q4_K_M recomendado; Q3/Q2 experimentales); pesos fusionados nativos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); GGUF derivado de los pesos fusionados |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base MoE: 12B parametros totales con 2,5B activos por token, lo que reduce el coste de inferencia frente a un denso del mismo tamano. El LoRA es de solo atencion (q, k, v, o), con rank 16, alpha 32, dropout 0.05 y learning rate 2e-5. La base permanece congelada en BF16 y no se entrena ni el router ni los expertos, ni se aplica RL. El entrenamiento uso un limite de secuencia de 4096 tokens, microbatch 1 y acumulacion de gradiente 16, con la perdida aplicada unicamente a los targets completos del asistente. Se procesaron 7.988.330 tokens de entrada y 4.633.250 tokens supervisados en 963 pasos de optimizador.

Los datos provienen de nvidia/OpenCodeInstruct y nvidia/OpenCodeReasoning, con un split que agrupa problemas y proyectos relacionados para evitar filtracion. Los pesos MTP del modelo fuente, si existen, no se adaptaron, y la exportacion a GGUF los excluye. Como innovacion practica, el autor documenta diagnosticos medibles (NLL de validacion y tres sondas) en lugar de reclamar capacidades no verificadas: la NLL de validacion baja de 0.665589 en la base a 0.430868 en el candidato, mientras que las sondas pasan 2/3 en ambos.

## Capacidades

- Generacion de texto y codigo en un unico modelo conversacional (pipeline text-generation).
- Razonamiento paso a paso segun el modo thinking heredado del modelo base.
- Tool calling / function calling: requiere un runtime que soporte Mellum y sepa parsear las llamadas a herramientas y el razonamiento.
- Razonamiento multi-paso orientado a tareas de codigo, entrenado sobre OpenCodeInstruct y OpenCodeReasoning.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es solo texto.
- Compatibilidad con plantilla de chat nativa de Mellum.

## Casos de uso

- Generacion de codigo asistida en IDE: el adaptador se integra como LoRA sobre el modelo base en un runtime compatible con Mellum, aportando un sesgo hacia codigo y razonamiento sin necesidad de reentrenar la base completa.
- Razonamiento sobre problemas de programacion: util para explicar decisiones de diseno y trazas de ejecucion en tareas tipo OpenCodeReasoning, siempre con verificacion humana del resultado.
- Experimentacion academica con PEFT: sirve como referencia reproducible de un fine-tune LoRA de bajo coste (963 pasos, 4,6M tokens supervisados) sobre un MoE congelado.
- Prototipado de agentes con tool calling: el adaptador esta pensado para runtimes que parsean llamadas a herramientas, lo que permite construir pipelines de agente en fase de prueba.
- Despliegue en hardware de consumo: con GGUF Q4_K_M el autor indica que arranca en una RX 6700 XT de 12 GB, lo que facilita pruebas locales de generacion de codigo.
- Base para un fine-tune posterior: al ser un candidato documentado con manifiesto de ejecucion, es un punto de partida para quien quiera ampliar el entrenamiento a frontend/backend o seguridad autorizada.
- Evaluacion comparativa de adaptadores: util en laboratorios que miden el efecto de LoRA de atencion sobre modelos MoE frente a alternativas densas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta diagnosticos internos:

| Metrica | Base | Candidato |
|---|---|---|
| NLL de validacion | 0.665589 | 0.430868 |
| Sondas de diagnostico superadas | 2/3 | 2/3 |

El propio autor advierte que estos diagnosticos no constituyen evidencia de capacidad en codigo, razonamiento ni ciberseguridad, y que no son SWE-bench ni Cybench.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el autor sugiere Q4_K_M en una GPU de 12 GB (RX 6700 XT) ajustando contexto y offload a la memoria medida.
- GPU recomendadas: no disponibles en la informacion proporcionada; para el modelo base de 12B en BF16 se necesitarian aproximadamente 24 GB o mas, aunque este dato no lo confirma el autor.
- Cabe en GPU de consumo: si, segun el autor, con cuantizacion Q4_K_M en 12 GB; las variantes Q3/Q2 son experimentales y pueden degradar el formato y la fiabilidad del razonamiento.
- Opciones de despliegue: runtime compatible con Mellum que parsee tool calls y razonamiento; el autor menciona LM Studio y pi, sin validar la integracion real. GGUF exportado desde los pesos fusionados, sin MTP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Mellum2.1-CodeReasoning-Public-v1-LoRA | 12B (base) | 2,5B | 128K (base); entrenado a 4096 | Apache 2.0 | Adaptador candidato, sin benchmarks publicos |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking | 12B | 2,5B | 128K | no disponible en esta ficha | Modelo base sin el ajuste de codigo |
| Alternativas densas de ~12B para codigo | ~12B | ~12B | variable | variable | Mayor coste de inferencia al no ser MoE |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Es un candidato, no una mejora demostrada: el autor lo declara explicitamente y advierte que los diagnosticos no establecen capacidad real.
- El entrenamiento cubre solo codigo y razonamiento; no incluye frontend/backend, uso de herramientas ni seguridad, que forman parte del plan completo pero no de esta ejecucion.
- No se valida el contexto de 128K: el adaptador se entreno con limite de 4096 y el autor indica que su notebook no comprueba 128K.
- Los pesos MTP no se adaptaron y la exportacion GGUF los excluye, lo que puede afectar al rendimiento en decodificacion especulativa.
- Las cuantizaciones Q3/Q2 son experimentales y pueden degradar el formato de salida y la fiabilidad del razonamiento.
- Riesgo de alucinacion en codigo y hallazgos de seguridad: el autor exige verificar todo el codigo generado y realizar las evaluaciones de seguridad en entornos aislados y autorizados.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento multilingue.
- Requiere plantilla de chat nativa de Mellum y un runtime que parsee tool calls; no se valida la integracion con LM Studio ni pi en equipos de terceros.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse los terminos del modelo base, de los datasets y las atribuciones incluidas en ATTRIBUTIONS.md.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Nullmega/Mellum2.1-CodeReasoning-Public-v1-LoRA
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Dataset nvidia/OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Dataset nvidia/OpenCodeReasoning: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
- Repositorio PEFT: https://github.com/huggingface/peft
