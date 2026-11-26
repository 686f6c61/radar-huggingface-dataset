# KenyaWashed/maveq-v4-qwen3-veteran

## Resumen

maveq-v4-qwen3-veteran es un adaptador PEFT (QLoRA SFT + DPO) sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario KenyaWashed. Está especializado en análisis cuantitativo de renta variable de mercados emergentes, concretamente el mercado vietnamita (bolsa HOSE), con disciplina de datos point-in-time y restricciones estructurales del mercado local (liquidación T+2.5, límites diarios de precio del ±7 %, ±10 % y ±15 %, y retardo en la publicación de fundamentales).

El modelo se presenta como un "CIO cuantitativo veterano de 10 años" que razona en un proceso de cinco pasos y se acompaña de un bundle neuro-simbólico denominado MAVE-Q v4 (`VetQuant-RSI`) con checkpoints especializados (`Tree-MDLM`, `Holo-HRM`, `VeteranCaseMemory`) y un conjunto de factores campeones en JSON. El adaptador se entrenó con un preset estructural `kaggle_max_100m`, alcanzando un pico de VRAM de 2,726 GB durante el entrenamiento, lo que indica que el proceso completo cupo en una GPU de consumo.

Es relevante por su enfoque poco habitual: un SLM de 1,7 mil millones de parámetros con adaptadores de bajo rango orientado a un dominio financiero muy específico, con preferencias alineadas mediante DPO (pérdida de 0,0303) frente a comportamientos tipo FOMO, y con métricas de validación declaradas por el autor (Sharpe neto de 1,2684 y DSR de 0,9426). El modelo se distribuye con licencia MIT y soporta vietnamita e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador PEFT LoRA/QLoRA + DPO |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B); tamaño del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Entrenamiento en 4 bits (QLoRA); cuantizaciones de inferencia no disponibles |
| Idiomas soportados | Vietnamita (vi), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base Qwen3-1.7B |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El entrenamiento consta de dos etapas: una primera fase de SFT con QLoRA en 4 bits orientada a un "proceso de veterano CIO en 5 pasos" (pérdida final de 1,22308) y una segunda fase de DPO que contrapone respuestas de un veterano disciplinado frente a respuestas tipo FOMO (pérdida de 0,0303). El preset estructural se denomina `kaggle_max_100m` y el pico de VRAM registrado durante el entrenamiento fue de 2,726 GB.

El bundle MAVE-Q v4 añade componentes neuro-simbólicos: `Tree-MDLM`, `Holo-HRM`, `VeteranCaseMemory`, un conjunto de factores campeones en JSON y un informe de telemetría. La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni la innovación arquitectónica interna del bundle; estos datos no están disponibles.

## Capacidades

- Generación de texto y razonamiento estructurado en un proceso de análisis de cinco pasos orientado a decisiones de inversión.
- Análisis cuantitativo de acciones vietnamitas (HOSE) con variables de mercado: amplitud, ratio de volumen, probabilidad de trauma, shocks de precio, flujos extranjeros y restricciones de límite diario.
- Razonamiento con disciplina point-in-time (PIT) para evitar look-ahead bias en fundamentales.
- Capacidad de agente: la model card etiqueta el modelo con el tag `agent` y describe un bundle de especialistas con memoria de casos.
- Soporte multilingüe limitado a vietnamita e inglés.
- No se ha documentado soporte de tool calling, function calling, visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Investigación académica en finanzas cuantitativas: el modelo permite simular decisiones de cartera sobre acciones vietnamitas con restricciones de mercado realistas (T+2.5, límites de precio), útil para estudiar sesgos de comportamiento en modelos generativos.
- Backtesting de estrategias con disciplina PIT: se puede usar para generar señales de compra/venta condicionadas a datos publicados en el momento correcto, evitando fugas de información futura en la evaluación.
- Análisis de riesgo de mercado emergente: el modelo interpreta variables como `TraumaProb`, `TShock` y `Foreign5d` para producir narrativas de riesgo coherentes con el régimen de límites diarios.
- Generación de informes de investigación en vietnamita: útil para equipos que necesitan resúmenes en ese idioma sobre valores concretos, con formato de proceso estructurado.
- Estudio de alineación mediante DPO: el par SFT/DPO permite comparar respuestas "veteranas" frente a respuestas "FOMO" en el mismo prompt, como banco de pruebas de preferencias.
- Simulación de agentes financieros multi-paso: el bundle `VeteranCaseMemory` y los checkpoints especializados permiten construir pipelines de razonamiento con memoria de casos para escenarios hipotéticos.
- Docencia y formación: sirve como ejemplo de adaptación de un SLM de 1,7 B a un dominio vertical con QLoRA en una GPU de consumo (pico de 2,726 GB).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Stage-1 SFT loss (5-step Veteran CIO) | 1,22308 |
| Stage-2 DPO loss (Veteran vs. FOMO) | 0,0303 |
| MAVE-Q v4 validation net Sharpe | 1,2684 |
| MAVE-Q v4 validation DSR | 0,9426 |
| Peak GPU VRAM (entrenamiento) | 2,726 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores son de validación interna del autor y no son comparables con benchmarks públicos de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en fp16 requiere aproximadamente 3,4 GB solo para pesos; con el adaptador y overhead de activaciones, se estima un rango de 4-6 GB en fp16. En cuantización de 4 bits, el peso del base baja a alrededor de 1 GB, aunque el adaptador QLoRA requiere cargar el base en precisión completa o cuantizada según la configuración.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más; el entrenamiento reportado cupo con 2,726 GB de pico, lo que sugiere que incluso GPUs de 4-6 GB podrían manejar el adaptador en configuraciones agresivas.
- Opciones de despliegue: transformers + peft (documentado en la model card); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| maveq-v4-qwen3-veteran | 1,7 B (base) + adaptador | No disponible | MIT | Finanzas cuantitativas Vietnam | Hugging Face |
| Qwen3-1.7B (base) | 1,7 B | No disponible | Apache 2.0 (según Qwen) | Propósito general | Hugging Face |
| FinGPT (familia) | Varía (7 B+) | Varía | Varía | Finanzas generales | Hugging Face / GitHub |
| FinBERT | ~110 M | 512 tokens | Apache 2.0 | Análisis de sentimiento financiero | Hugging Face |

La comparación con FinGPT y FinBERT es aproximada: no se dispone de métricas comunes ni de evaluaciones cruzadas en la información proporcionada. El modelo destaca por su tamaño reducido y su enfoque en un mercado concreto (Vietnam) frente a alternativas de propósito general o de finanzas globales.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo es solo para investigación académica y simulación, sin ejecución real en brokers; no es asesoramiento financiero.
- Riesgo de alucinación en datos financieros: el modelo puede inventar cifras, fechas o eventos de mercado si el prompt no las proporciona.
- Sesgo de dominio: entrenado sobre el mercado vietnamita y con un preset `kaggle_max_100m`; su comportamiento fuera de ese contexto no está validado.
- Idiomas limitados a vietnamita e inglés; no hay soporte documentado para castellano.
- Longitud de contexto no documentada, lo que impide planificar conversaciones multi-turno largas o análisis de documentos extensos.
- Las métricas de Sharpe y DSR son de validación interna del autor y no han sido replicadas de forma independiente; no deben interpretarse como rendimiento esperado en producción.
- El adaptador requiere el modelo base Qwen3-1.7B y la librería PEFT; no es un modelo autónomo.
- Sin datos de benchmarks estándar ni evaluaciones de sesgo, toxicidad o robustez.
- La licencia MIT permite uso comercial, pero el disclaimer del autor restringe el uso a investigación y simulación; conviene revisar la compatibilidad con la licencia del modelo base Qwen3.

## Enlaces

- Hugging Face: https://huggingface.co/KenyaWashed/maveq-v4-qwen3-veteran
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio PEFT: https://github.com/huggingface/peft
- Documentación de transformers: https://huggingface.co/docs/transformers
