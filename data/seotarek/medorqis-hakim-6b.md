# seotarek/medorqis-hakim-6b

## Resumen

MedOrqis-Hakim-6B (حكيم) es un ajuste fino mediante QLoRA sobre el modelo médico en árabe Karnak-6B-v1.0, que a su vez deriva de la arquitectura Qwen3. Lo desarrolla el usuario seotarek y está pensado como una "capa de razonamiento clínico" bilingüe (árabe e inglés) que se complementa con un motor externo de herramientas deterministas denominado MedOrqis. El modelo no pretende calcular por sí mismo puntuaciones clínicas ni dosis: su función es interpretar la narrativa del paciente o del médico y emitir llamadas a herramientas en formato `<tool_call>` que ejecutan fórmulas verificadas (CHA2DS2-VA, CKD-EPI 2021, CURB-65, Wells PE, entre otras).

La propuesta arquitectónica es un enfoque de doble vía: el modelo (el "cerebro") hace el razonamiento y la comprensión sintáctica, mientras que los cálculos y las reglas de seguridad se delegan a calculadoras deterministas externas, con el objetivo declarado de eliminar la halucinación numérica en contextos clínicos. Está entrenado para reconocer jerga y dialectos árabes (egipcio, del Golfo) y mapearlos a terminología estándar ICD-10 y SNOMED-CT.

Es relevante ahora porque aborda un problema recurrente en los LLM aplicados a medicina: la fiabilidad de los números y de las reglas de seguridad. Al separar el razonamiento probabilístico del cálculo determinista mediante tool calling, propone un patrón de integración reproducible en sistemas clínicos. Su licencia Apache 2.0 y su tamaño de 6B lo hacen desplegable en infraestructura moderada, aunque el ecosistema que lo rodea (motor MCP, datasets propios) es todavía muy reciente y con escasa validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3 (base: Karnak-6B-v1.0), ajustado con QLoRA (adaptador PEFT) |
| Parametros totales | 6B (según el nombre del modelo y el modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El ejemplo de la model card carga el modelo base en 4-bit; no se detallan otras cuantizaciones oficiales |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT/LoRA sobre el modelo base (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (QLoRA) montado sobre Karnak-6B-v1.0, un modelo médico en árabe de 6B parámetros construido sobre la arquitectura Qwen3. El ajuste fino se realizó sobre el dataset propio `seotarek/medorqis-clinical-instructions`, orientado a instrucciones clínicas, y se evaluó con `seotarek/medorqis-clinical-dialect-benchmark`, un conjunto centrado en dialectos clínicos árabes. La model card menciona especialidades concretas: cardiología, nefrología, farmacología y pediatría.

La innovación técnica destacada no es arquitectónica sino de integración: el modelo se entrena para emitir llamadas a herramientas en formato ChatML `<tool_call>` dirigidas a un motor MCP externo con calculadoras deterministas. Entre las herramientas soportadas figuran `cha2ds2_va_esc2024` (guías ESC 2024 de fibrilación auricular), `ckd_epi_2021_egfr` (KDIGO 2024), `bedside_schwartz_egfr` (pediatría), `cockcroft_gault_crcl` (ajuste renal de dosis), `curb65_score` (BTS), `wells_pe_score`, `has_bled_score`, `pediatric_weight_dose` (AAP), `check_drug_interactions`, `check_red_flags` y `scrub_phi` (HIPAA Safe Harbor). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto clínico bilingüe en árabe e inglés, con razonamiento sobre narrativas de pacientes y notas médicas.
- Tool calling y function calling mediante etiquetas `<tool_call>` en formato ChatML, con argumentos estructurados en JSON.
- Orquestación de calculadoras clínicas deterministas: CHA2DS2-VA, CKD-EPI 2021, Schwartz pediátrico, Cockcroft-Gault, CURB-65, Wells PE y HAS-BLED.
- Cálculo de dosis pediátricas por peso con techo de dosis de adulto, según la documentación del autor.
- Detección de interacciones farmacológicas (DDI) y de banderas rojas de emergencia (síndrome de cola de caballo, shock, angina).
- Normalización de dialectos árabes (egipcio, del Golfo) a terminología estándar ICD-10 y SNOMED-CT.
- Anonimización de datos personales de salud conforme a HIPAA Safe Harbor mediante la herramienta `scrub_phi`.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Triaje de fibrilación auricular: el modelo interpreta la historia clínica, extrae edad, hipertensión, diabetes, ictus previo y enfermedad vascular, y emite la llamada a `cha2ds2_va_esc2024` para obtener la puntuación de riesgo tromboembólico conforme a ESC 2024, evitando que el LLM calcule la suma por su cuenta.
- Ajuste de dosis en insuficiencia renal: a partir de creatinina, edad, peso y sexo, el modelo invoca `ckd_epi_2021_egfr` o `cockcroft_gault_crcl` y utiliza el resultado para proponer un ajuste de fármacos nefrotóxicos, lo que resulta adecuado en entornos de farmacia hospitalaria donde el error aritmético es crítico.
- Pediatría y dosificación por peso: en consultas de atención primaria, el modelo extrae el peso del paciente pediátrico y llama a `pediatric_weight_dose` con el techo de dosis de adulto, reduciendo el riesgo de sobredosificación.
- Evaluación de neumonía adquirida en la comunidad: el modelo recoge los cinco criterios de CURB-65 y decide si procede derivación a urgencias o ingreso en cuidados intensivos, integrando la llamada a `curb65_score` en un flujo de historia clínica electrónica.
- Detección de interacciones medicamentosas en polimedicados: ante una lista de fármacos, el modelo invoca `check_drug_interactions` y sintetiza las alertas en lenguaje natural para el clínico, un escenario típico de pacientes ancianos con anticoagulantes.
- Anonimización previa al análisis: en pipelines de investigación, el modelo llama a `scrub_phi` para eliminar identificadores personales antes de que el texto clínico se procese o almacene, cumpliendo con HIPAA.
- Asistencia en urgencias con banderas rojas: el modelo invoca `check_red_flags` ante síntomas sugestivos de síndrome de cola de caballo o síndrome coronario agudo, y genera una recomendación de escalado inmediato.
- Normalización de dialectos árabes para codificación: en hospitales del Golfo o Egipto, el modelo traduce la queja coloquial del paciente a terminología estándar para su codificación ICD-10.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card declara el modelo pero contiene una lista de resultados vacía. La única métrica mencionada es una verificación externa de "M8ven Trust Grade B (89/100)", que no es un benchmark de rendimiento del modelo sino una insignia de confianza de una plataforma de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 4-5 GB en cuantización 4-bit (el ejemplo oficial carga el modelo base con `load_in_4bit`); en FP16 serían aproximadamente 12-13 GB para los 6B parámetros, más el adaptador LoRA.
- GPU recomendadas: A100 o H100 para despliegue en producción con FP16 o BF16 y concurrencia; RTX 4090 o L40S para entornos de desarrollo y pruebas.
- Cabe en GPU de consumo: sí, en 4-bit cabe en tarjetas de 8 GB como la RTX 3060 Ti o la RTX 4060; en FP16 requiere 16 GB o más (RTX 4080, RTX 4090).
- Opciones de despliegue: la model card documenta el uso con `transformers` y `peft` (cargando el adaptador sobre el modelo base). No se confirma soporte oficial para vLLM, llama.cpp, Ollama o TGI, aunque al derivar de Qwen3 y ser un adaptador PEFT sería posible fusionar y convertir a GGUF con herramientas estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MedOrqis-Hakim-6B | 6B | no disponible | ar, en | Apache 2.0 | Médico bilingüe con tool calling determinista |
| Karnak-6B-v1.0 (base) | 6B | no disponible | ar (principalmente) | no disponible | LLM médico en árabe sobre Qwen3 |
| Qwen3-8B (referencia de familia) | 8B | no disponible en esta ficha | multilingüe | Apache 2.0 | LLM generalista con tool calling |
| Meditron-7B (referencia de dominio) | 7B | no disponible en esta ficha | en | Llama 2 (uso restringido) | LLM médico en inglés |

La comparación directa con Meditron u otros modelos médicos en inglés no es del todo equivalente, porque MedOrqis-Hakim se centra en árabe clínico y en la delegación de cálculos a herramientas externas. No se dispone de datos de rendimiento comparables publicados por el autor.

## Limitaciones y advertencias

- No hay benchmarks publicados: el `model-index` está vacío y no se aportan métricas de MMLU, HumanEval, GSM8K ni evaluaciones clínicas estandarizadas, por lo que el rendimiento real es desconocido.
- El modelo no calcula por sí mismo: su utilidad depende de que el motor MedOrqis de herramientas deterministas esté desplegado y correctamente conectado; sin él, las llamadas `<tool_call>` no producen resultados.
- Riesgo de alucinación en el razonamiento narrativo y en la síntesis de recomendaciones, aunque el diseño busca mitigar la halucinación numérica delegando los cálculos.
- Sesgos potenciales derivados de los datos de entrenamiento (instrucciones clínicas y benchmark de dialectos del propio autor), sin documentación sobre su composición ni sobre procesos de mitigación.
- Cobertura limitada a árabe e inglés; no se declaran otros idiomas.
- Longitud de contexto no documentada, lo que impide garantizar el manejo de historiales clínicos largos.
- Es un adaptador LoRA, no un modelo completo: requiere cargar el modelo base Karnak-6B-v1.0, cuyos términos de licencia deben verificarse por separado.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo médico no está validado como dispositivo sanitario y no debe usarse como sustituto del juicio clínico.
- El proyecto es muy reciente (creado en noviembre de 2026 según los metadatos) y sin descargas ni validación comunitaria, lo que desaconseja su uso en producción sin una evaluación propia exhaustiva.
- La insignia "M8ven Trust Grade B" procede de una plataforma de terceros y no equivale a una certificación clínica ni regulatoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seotarek/medorqis-hakim-6b
- Modelo base Karnak-6B-v1.0: https://huggingface.co/Applied-Innovation-Center/Karnak-6B-v1.0
- Dataset de instrucciones clínicas: https://huggingface.co/datasets/seotarek/medorqis-clinical-instructions
- Dataset de benchmark de dialectos clínicos: https://huggingface.co/datasets/seotarek/medorqis-clinical-dialect-benchmark
- Repositorio GitHub: https://github.com/seotarek/medorqis-hakim
- Verificación M8ven: https://m8ven.ai/mcp/seotarek-medorqis-uxezzz?s=readme
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
