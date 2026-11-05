# seotarek/medorqis-llm

## Resumen

MedOrqis-LLM es un ajuste fino mediante QLoRA 4-bit NF4 sobre el modelo base `Applied-Innovation-Center/Karnak-6B-v1.0`, de arquitectura Qwen3 y aproximadamente 6.000 millones de parametros. Lo desarrolla el autor `seotarek` como "cerebro clinico" del ecosistema MedOrqis, un conjunto de herramientas deterministas de calculo clinico. El modelo esta disenado para razonamiento clinico bilinguee arabe-ingles, con enfasis en cardiologia, nefrologia, farmacologia y pediatria.

Su propuesta diferencial no es la generacion de texto libre, sino el enrutamiento controlado: cuando una consulta implica calculo aritmetico de riesgo (por ejemplo, CHA2DS2-VA segun guias ESC 2024), aclaramiento renal, dosificacion pediatrica por peso o interacciones farmacologicas graves, el modelo emite una llamada de herramienta `<tool_call>` hacia calculadoras deterministas en lugar de inferir probabilisticamente. Esto reduce el riesgo de alucinacion en valores numericos criticos.

El modelo se distribuye como adaptador PEFT (LoRA) bajo licencia Apache 2.0, no como pesos completos, y requiere cargar el modelo base por separado. A fecha de la informacion disponible no registra descargas ni valoraciones en HuggingFace y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con QLoRA 4-bit NF4 sobre Karnak-6B-v1.0 |
| Parametros totales | ~6.000 millones (modelo base); el adaptador LoRA anade un numero no especificado de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (segun el ejemplo de despliegue con vLLM `--max-model-len 4096`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | QLoRA 4-bit NF4 para el ajuste; inferencia en 4-bit NF4 o bfloat16 segun el ejemplo de la model card; otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles y arabe (incluye dialecto regional segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT/LoRA (requiere el modelo base en safetensors); no se publican pesos fusionados ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Karnak-6B-v1.0, un transformer decoder-only de la familia Qwen3 con unos 6.000 millones de parametros. Sobre esa base se aplica un ajuste fino supervisado con QLoRA en precision 4-bit NF4, que congela los pesos originales y entrena adaptadores de bajo rango. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

El entrenamiento se apoya en dos datasets propios: `seotarek/medorqis-clinical-instructions` (instrucciones clinicas) y `seotarek/medorqis-clinical-dialect-benchmark` (evaluacion de dialecto). La innovacion principal es el diseno de "doble via": el modelo aprende a distinguir entre consultas narrativas, que responde con sintesis basada en evidencia, y consultas que requieren calculo deterministico, para las que emite una llamada estructurada a una de las 12 herramientas clinicas integradas (CHA2DS2-VA ESC 2024, CKD-EPI 2021, Schwartz pediatrico, Cockcroft-Gault, CURB-65, Wells PE, HAS-BLED, dosificacion pediatrica por peso, entre otras). No se documentan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento clinico narrativo en ingles y arabe, incluyendo variantes dialectales regionales.
- Tool calling y function calling nativo mediante etiquetas `<tool_call>` para enrutar a calculadoras deterministas.
- Calculo de riesgo tromboembolico en fibrilacion auricular (CHA2DS2-VA, ESC 2024).
- Estadificacion de enfermedad renal cronica con eGFR sin ajuste por raza (CKD-EPI 2021, KDIGO 2024).
- eGFR pediatrico por formula de Schwartz de cabecera y dosificacion ponderal pediatrica con techo de dosis adulta.
- Aclaramiento de creatinina (Cockcroft-Gault) con seleccion automatica de peso ideal o ajustado.
- Puntuaciones de riesgo pulmonar y de emergencia: CURB-65 y Wells PE.
- Evaluacion de riesgo hemorragico en pacientes anticoagulados (HAS-BLED).
- Comprobacion de interacciones farmacologicas (funcion `check_drug_*`, nombre completo no disponible en la informacion).
- Guardarrailes de seguridad orientados a evitar la invencion de dosis y puntuaciones.
- Capacidades de agente multi-paso limitadas al ciclo consulta, llamada a herramienta y sintesis final.

## Casos de uso

- **Triaje de fibrilacion auricular en consulta**: el clinico describe el caso y el modelo emite una llamada a `cha2ds2_va_esc2024` para obtener la puntuacion exacta y despues redacta la recomendacion anticoagulante basada en guias ESC 2024.
- **Ajuste de dosis en insuficiencia renal**: ante un paciente con funcion renal alterada, el modelo encadena `ckd_epi_2021_egfr` o `cockcroft_gault_crcl` con la comprobacion de interacciones para proponer un ajuste de dosis verificable.
- **Dosificacion pediatrica segura**: en un servicio de pediatria, el modelo calcula la dosis por peso con `calculate_pediatric_weight_dose` y aplica el techo de dosis adulta, reduciendo el error aritmetico en un contexto de alto riesgo.
- **Soporte a urgencias respiratorias**: con datos de un paciente con neumonia, el modelo invoca `curb65_score` para estimar mortalidad a 30 dias y apoyar la decision de ingreso en UCI.
- **Protocolo de sospecha de tromboembolismo pulmonar**: el modelo calcula la probabilidad pretest con `wells_pe_score` y orienta la indicacion de angio-TC.
- **Revision de polifarmacia en pacientes anticoagulados**: combinacion de `has_bled_score` y la herramienta de interacciones para detectar riesgos hemorragicos antes de prescribir.
- **Asistente bilinguee para personal sanitario arabohablante**: atencion de consultas en arabe estandar o dialectal con respuestas trazables a calculadoras verificadas.
- **Generacion de informes clinicos auditados**: sintesis final de la recomendacion tras la llamada a herramienta, con separacion clara entre el calculo deterministico y la interpretacion narrativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card declara el modelo pero con la lista de resultados vacia. Tampoco se aportan metricas del dataset `medorqis-clinical-dialect-benchmark` ni comparaciones con otros modelos medicos.

## Requisitos de hardware

- VRAM estimada para inferencia: en 4-bit NF4, aproximadamente 4-5 GB para los pesos del modelo base de 6B mas overhead de activaciones y cache KV; en bfloat16, unos 12-13 GB.
- GPU recomendadas: A100 o H100 para servicio concurrente con vLLM; L40S o RTX A6000 como alternativas de centro de datos.
- GPU de consumo: cabe en tarjetas con 8 GB o mas en 4-bit (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); en bfloat16 requiere 16 GB o mas (RTX 4080, RTX 4090).
- Opciones de despliegue: `transformers` + `peft` para prototipado; vLLM con `--enable-lora` y `--lora-modules` para produccion; llama.cpp y Ollama no estan soportados de forma directa porque no se publican pesos fusionados ni GGUF.
- Latencia y throughput: no disponibles. La model card solo fija `--max-model-len 4096` y `--gpu-memory-utilization 0.90` como parametros de servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedOrqis-LLM | ~6B (base) + LoRA | 4096 tokens | Clinico bilinguee arabe/ingles con tool calling deterministico | Apache 2.0 | Adaptador PEFT en HuggingFace |
| Karnak-6B-v1.0 | ~6B | No disponible | Modelo base generalista Qwen3 | No disponible | Pesos completos en HuggingFace |
| Modelos medicos abiertos tipo Meditron o BioMistral | 7B | 4096-8192 tokens | Razonamiento medico en ingles | Licencias variables | Pesos completos y GGUF |

La comparacion cuantitativa con alternativas no es posible porque MedOrqis-LLM no publica benchmarks. Frente a los modelos medicos genericos, su diferencia principal es el enrutamiento a calculadoras deterministas y el soporte nativo de arabe; frente a su modelo base, anade especializacion clinica y guardarrailes a costa de depender de un adaptador adicional.

## Limitaciones y advertencias

- No es un dispositivo medico ni sustituye el juicio clinico; la model card no documenta validacion regulatoria ni ensayos clinicos.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- Riesgo de alucinacion en texto narrativo; el diseno mitiga los errores aritmeticos solo cuando el modelo decide correctamente invocar la herramienta, y puede fallar en esa clasificacion.
- Dependencia de las 12 herramientas externas: si no estan disponibles o devuelven errores, el modelo puede degradarse a respuestas probabilisticas.
- Cobertura limitada a ingles y arabe; no se documenta soporte de castellano ni de otros idiomas.
- Contexto de 4096 tokens, insuficiente para historiales clinicos extensos o documentacion larga.
- Solo se distribuye el adaptador LoRA: requiere descargar el modelo base y montarlo, lo que complica el despliegue y la reproducibilidad.
- Sin descargas ni validacion de la comunidad en HuggingFace; la insignia "M8ven Trust Grade B (89/100)" procede de un tercero no verificado en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y regulatoria del uso clinico recae en el implementador.
- El nombre completo de la funcion de comprobacion de interacciones farmacologicas (`check_drug_*`) aparece truncado en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seotarek/medorqis-llm
- Modelo base Karnak-6B-v1.0: https://huggingface.co/Applied-Innovation-Center/Karnak-6B-v1.0
- Dataset de instrucciones clinicas: https://huggingface.co/datasets/seotarek/medorqis-clinical-instructions
- Dataset de benchmark dialectal: https://huggingface.co/datasets/seotarek/medorqis-clinical-dialect-benchmark
- Repositorio GitHub: https://github.com/seotarek/medorqis-llm
- Ecosistema de habilidades MedOrqis: https://github.com/seotarek/MedOrqis
- Verificacion M8ven: https://m8ven.ai/mcp/seotarek-medorqis-uxezzz?s=readme
