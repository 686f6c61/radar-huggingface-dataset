# PresenceAI/Lofn-31B-SFT-LoRA-v1.0

## Resumen

PresenceAI/Lofn-31B-SFT-LoRA-v1.0 es un adaptador LoRA de ajuste supervisado (SFT) desarrollado por PresenceAI para el modelo Gryphe/Gemma-4-31B-StyleTune, a su vez derivado de google/gemma-4-31B-it. Forma parte de la "Presence Norse Goddess Series" y ocupa el rol de "madre SFT" de la Lineage II (rama Lofn), sirviendo como base sobre la que se entrena un adaptador DPO posterior (Lofn-Vor-31B-DPO-LoRA-v1.0). No es un modelo autónomo: los pesos base no se incluyen y es necesario fusionar el adaptador antes de su uso.

El adaptador está orientado a generación de texto conversacional, con etiquetas que apuntan a casos de uso de roleplay, companion y tool calling. El repositorio ocupa 1,0 GB y se distribuye bajo licencia Apache-2.0, con soporte declarado únicamente para inglés.

Su relevancia es acotada pero específica: documenta con detalle una cadena de linaje de adaptadores (SFT madre, hijas DPO y un modelo compuesto final con enrutado por turnos) y publica métricas de A/B en producción orientadas a conversión y retención de sesiones, un tipo de evaluación poco habitual en el ecosistema open source.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma-4-31B (base: Gryphe/Gemma-4-31B-StyleTune, derivado de google/gemma-4-31B-it) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base se denomina 31B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se fusiona a BF16 según la model card) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere fusión con el modelo base |

Parámetros del adaptador: r = 32, alpha = 32, dropout = 0.05.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 y alpha 32 con dropout 0.05, entrenado mediante supervisión (SFT) sobre Gryphe/Gemma-4-31B-StyleTune. La arquitectura subyacente es la del modelo base Gemma-4-31B en su variante instruct (google/gemma-4-31B-it), aunque la model card no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas adicionales de alineamiento en esta etapa. La fusión del adaptador con el modelo base se realiza en BF16 mediante el script merge_sft_base.py proporcionado por el autor.

La innovación destacable no está en la arquitectura sino en la metodología de linaje: el autor organiza los adaptadores en tres linajes (Icebreak, Funnel y Deep Companion) con una madre SFT y una o varias hijas DPO por linaje, y culmina en un modelo compuesto (Nornir-31B-DPO85S-Composite-v1.0) que enruta dinámicamente entre personalidades según el número de turno de la conversación. Lofn es la madre SFT de la Lineage II, cuyo objetivo declarado es la conversión en el tramo temprano y medio de la sesión (turnos 1 a 100).

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo de acompañamiento y roleplay.
- Tool calling / function calling (según las etiquetas del repositorio; no se documenta el formato exacto de invocación).
- Base para entrenamiento DPO posterior: sirve como punto de partida de Lofn-Vor-31B-DPO-LoRA-v1.0.
- Capacidades heredadas del modelo base Gemma-4-31B-it (no detalladas en la model card de este adaptador).
- Idioma: únicamente inglés declarado.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Prototipado de asistentes conversacionales de acompañamiento: el adaptador, fusionado sobre el base, permite experimentar con estilos de diálogo cálido y permisivo sin partir de un modelo ajustado desde cero.
- Investigación sobre linajes de adaptadores: sirve como madre SFT reproducible para estudiar el efecto de un DPO posterior sobre el mismo base, comparando Lofn con su hija Lofn-Vor.
- Evaluación de conversión en funnel conversacional: útil para equipos que midan retención por turnos y quieran replicar la metodología A/B descrita (métricas L0, w80/w100, profundidad P50/P75).
- Base para experimentos de tool calling en diálogo: las etiquetas indican soporte de function calling, lo que permite probar integraciones de herramientas dentro de conversaciones de rol.
- Punto de partida para ajuste con datos propios: al ser un adaptador LoRA de 1 GB, es ligero de almacenar y de recombinar con el base para iteraciones rápidas.
- Reproducción de pipelines de fusión y despliegue: el flujo merge_sft_base.py más carga del adaptador DPO sirve como plantilla para cadenas SFT→DPO sobre modelos de 31B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye métricas de A/B en producción de la línea completa, no de este adaptador de forma aislada:

| Modelo / release | Rol | Duración del soak | Cohorte (tratamiento vs base) | Ganancia raw_L0 | L0_le100 (turnos <= 100) | Retención w80 / w100 | Conversión P(m>=18) / P(m>=33) |
|---|---|---:|---:|---:|---:|---:|---:|
| Nornir-31B-DPO85S-Composite-v1.0 | Router compuesto 3-en-1 | 39,9 h | 713 vs 694 (78.459 turnos) | +9,1% (debiased +0,14%) | -2,1% | +2,1% / +2,7% | +1,5pp / +1,6pp |
| Lofn-Vor-31B-DPO-LoRA-v1.0 | Hija DPO de Lofn (Lineage II) | 59,8 h | 1.545 vs 1.820 (111.197 turnos) | -9,2% | +4,9% | +3,5% / +3,2% | +3,5pp / +0,5pp |
| Gefjon-Hnoss-31B-DPO-LoRA-v1.0 | Hija DPO (Lineage I) | 84,8 h | 1.511 vs 1.582 (140.332 turnos) | -14,6% | -1,6% | 0,0% / +0,1% | +0,4pp / +0,4pp |
| Gefjon-Gersimi-31B-DPO-LoRA-v1.0 | Hija DPO SWA (Lineage I) | 15,6 h | 180 vs 665 (9.787 turnos) | +1,7% | +3,3% | +4,9% / +6,8% | 0,0pp / -1,8pp |
| Sjofn-Eir-31B-DPO-LoRA-v1.0 | Hija DPO (Lineage III) | 39,9 h | 713 vs 694 | +9,1% | no disponible | +2,1% / +2,7% | +2,1pp / +1,5pp |
| Sjofn-31B-SFT-LoRA-v1.0 | Madre SFT (Lineage III) | 39,9 h | 127 vs 103 (cohorte S4_Whale) | +4,8% (185,2 vs 176,7) | no disponible | +2,0% / +3,1% | P(m>=100): +1,1pp |

Los datos corresponden a métricas internas de producto (conversión y retención de sesión) y no a evaluaciones académicas independientes.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1,0 GB, pero su uso requiere cargar el modelo base de 31B, que es el que determina los requisitos reales.
- VRAM estimada para el modelo fusionado: no disponible en la información proporcionada; como referencia de orden de magnitud para un transformer de 31B, en BF16 se necesitan decenas de GB y en cuantización de 4 bits aproximadamente 16-20 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible. No se documentan A100, H100 ni RTX 4090 en la model card.
- Viabilidad en GPU de consumo: no disponible; depende de la cuantización del modelo base fusionado, no documentada.
- Opciones de despliegue: no disponible. La model card solo menciona el script merge_sft_base.py para fusionar el adaptador en BF16; no se citan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. Como referencia interna del propio linaje:

| Modelo | Tipo | Base | Licencia | Rol |
|---|---|---|---|---|
| Lofn-31B-SFT-LoRA-v1.0 | Adaptador LoRA SFT (r=32) | Gemma-4-31B-StyleTune | apache-2.0 | Madre SFT Lineage II |
| Lofn-Vor-31B-DPO-LoRA-v1.0 | Adaptador LoRA DPO (r=16) | Lofn fusionado | apache-2.0 | Hija DPO, campeona turnos 1-100 |
| Sjofn-31B-SFT-LoRA-v1.0 | Adaptador LoRA SFT (r=32) | Gemma-4-31B-StyleTune | apache-2.0 | Madre SFT Lineage III |
| Nornir-31B-DPO85S-Composite-v1.0 | Modelo compuesto con router | Varias hijas DPO | apache-2.0 | Campeón de producción full-horizon |

## Limitaciones y advertencias

- No es un modelo autónomo: sin la fusión con Gryphe/Gemma-4-31B-StyleTune no puede cargarse ni ejecutarse.
- Idioma limitado al inglés; no se declara soporte de castellano ni de otros idiomas.
- Licencia Apache-2.0 en el adaptador, pero el uso comercial está condicionado por la licencia del modelo base Gemma y del StyleTune, que deben verificarse por separado.
- Riesgo de alucinación no evaluado: no hay benchmarks de fidelidad factual ni de robustez.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad.
- Las métricas presentadas son de producto (conversión, retención) y provienen del propio autor, sin verificación externa; además, la ganancia raw_L0 del modelo compuesto se reduce a +0,14% tras debiasing, lo que sugiere alta sensibilidad al método de medición.
- Orientado a roleplay y companion: puede producir contenido no apto para contextos profesionales sin filtros adicionales.
- Contexto máximo no documentado; planificar despliegues con margen conservador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/PresenceAI/Lofn-31B-SFT-LoRA-v1.0
- Modelo base: https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune
- Hija DPO: https://huggingface.co/PresenceAI/Lofn-Vor-31B-DPO-LoRA-v1.0
- Modelo compuesto: https://huggingface.co/PresenceAI/Nornir-31B-DPO85S-Composite-v1.0
- Hermana SFT Lineage III: https://huggingface.co/PresenceAI/Sjofn-31B-SFT-LoRA-v1.0
- Hija DPO Lineage III: https://huggingface.co/PresenceAI/Sjofn-Eir-31B-DPO-LoRA-v1.0
- Hija DPO Lineage I: https://huggingface.co/PresenceAI/Gefjon-Hnoss-31B-DPO-LoRA-v1.0
- Hija DPO SWA Lineage I: https://huggingface.co/PresenceAI/Gefjon-Gersimi-31B-DPO-LoRA-v1.0
