# Dino21/financial-risk-extractor-phi3-qlora

## Resumen

El modelo `Dino21/financial-risk-extractor-phi3-qlora` es un adaptador de tipo LoRA (entrenado con QLoRA) sobre el modelo base `microsoft/Phi-3-mini-4k-instruct`, desarrollado por Dino21 para extraer factores de riesgo estructurados a partir de prosa de divulgación corporativa (filings). El sistema recibe un pasaje de texto y devuelve un JSON que lista cada riesgo identificado, su categoría dentro de una taxonomía cerrada de doce ítems, el desencadenante, el impacto potencial y un nivel de severidad. Está pensado como demostración técnica para una evaluación de ingeniería de ML, no como herramienta de producción.

El modelo base, Phi-3-mini, es un transformer decoder-only de 3.800 millones de parámetros entrenado por Microsoft sobre 3,3 billones de tokens, con una ventana de contexto de 4.096 tokens. El adaptador QLoRA añade 21 millones de parámetros entrenables (r=16, alpha=32), lo que eleva el total a 3.821.079.552 parámetros. El entrenamiento se realizó sobre 120 ejemplos sintéticos generados por un modelo profesor, en una única GPU T4 de Google Colab durante 9 minutos, con dos épocas seleccionadas por validación.

La relevancia de este modelo reside en su demostración de fine-tuning eficiente con recursos mínimos y datos muy reducidos, aplicado a un dominio especializado como el análisis de riesgos financieros. Aunque no está validado para uso real, sirve como referencia de cómo adaptar un SLM a una tarea de extracción de información estructurada con una taxonomía cerrada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3-mini) con adaptador LoRA |
| Parametros totales | 3.821.079.552 (3,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (QLoRA) para el adaptador; el modelo base puede cuantizarse adicionalmente |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 3,8 B parámetros con atención causal, entrenado por Microsoft sobre 3,3 billones de tokens. El adaptador LoRA se aplica a los módulos `qkv_proj`, `o_proj`, `gate_up_proj` y `down_proj` con r=16, alpha=32 y dropout 0,05. El entrenamiento utilizó QLoRA con cuantización de 4 bits NF4 y doble cuantización, lo que permite ajustar el modelo en una GPU con 16 GB de VRAM.

Los datos de entrenamiento consisten en 120 ejemplos sintéticos generados por un modelo profesor, divididos en 96 para entrenamiento, 12 para validación y 12 para prueba. Los pasajes son inventados, no provienen de filings reales, y no se mencionan empresas reales. Se probaron dos épocas (loss de validación 0,6284 → 0,6098) y tres épocas (la tercera mostró aumento de loss de validación), por lo que se seleccionaron dos épocas. No se aplicaron técnicas de RLHF ni DPO; el ajuste es supervisado sobre pares entrada-salida JSON.

## Capacidades

- Extracción de factores de riesgo financiero a partir de prosa de divulgación corporativa, devolviendo JSON estructurado.
- Clasificación de cada riesgo en una taxonomía cerrada de doce categorías: `market_risk`, `credit_risk`, `liquidity_risk`, `operational_risk`, `regulatory_risk`, `cybersecurity_risk`, `supply_chain_risk`, `concentration_risk`, `geopolitical_risk`, `technology_risk`, `litigation_risk`, `environmental_risk`.
- Identificación del desencadenante del riesgo, su impacto potencial y un nivel de severidad.
- Generación de texto en formato JSON válido, adecuado para integración en pipelines de procesamiento.
- Capacidad multilingüe limitada: entrenado solo en inglés, aunque el modelo base tiene cierta capacidad multilingüe.
- No soporta tool calling ni razonamiento multi-paso explícito; la tarea es de extracción directa.

## Casos de uso

- Análisis de informes anuales (10-K, 20-F): el modelo puede procesar secciones de factores de riesgo y extraer automáticamente los riesgos mencionados, categorizarlos y evaluar su severidad, reduciendo el tiempo de revisión manual por parte de analistas financieros.
- Due diligence en fusiones y adquisiciones: alimentar el modelo con pasajes de documentos de debida diligencia para identificar riesgos operativos, regulatorios o de litigio que requieran atención especial.
- Monitorización de comunicados de prensa corporativos: integrar el modelo en un sistema que procese notas de prensa y alertas de noticias para detectar nuevos riesgos emergentes (cibernéticos, geopolíticos, de cadena de suministro) en tiempo real.
- Generación de resúmenes estructurados para comités de riesgo: convertir párrafos extensos de divulgación en tablas JSON que puedan alimentar dashboards de gestión de riesgos.
- Evaluación de cumplimiento normativo: verificar si las divulgaciones corporativas cubren todas las categorías de riesgo exigidas por reguladores, comparando la salida del modelo con listas de verificación.
- Prototipado de asistentes de análisis financiero: servir como componente de extracción en un chatbot que responda preguntas sobre riesgos de una empresa, combinando la salida JSON con un motor de búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de precisión, recall o F1 sobre el conjunto de prueba de 12 ejemplos. El modelo base Phi-3-mini alcanza 69% en MMLU y 8,38 en MT-bench según el informe técnico de Microsoft, pero estos valores corresponden al modelo sin fine-tuning y no son representativos del rendimiento del adaptador en la tarea específica de extracción de riesgos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base con 4 bits requiere aproximadamente 2,5 GB de VRAM; con el adaptador LoRA, el total se mantiene en torno a 3 GB. En precisión completa (fp16) necesitaría unos 7,6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, T4, etc.) es suficiente para inferencia con cuantización. Para entrenamiento se usó una T4 de Colab (16 GB).
- Cabe en GPUs de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con la librería `transformers` y `peft`.
- Latencia y throughput estimados: no disponibles. Dado el tamaño de 3,8 B, se espera una latencia de decenas de milisegundos por token en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tarea | Disponibilidad |
|---|---|---|---|---|---|
| Dino21/financial-risk-extractor-phi3-qlora | 3,8 B | 4.096 | MIT | Extracción de riesgos financieros | Hugging Face |
| microsoft/Phi-3-mini-4k-instruct (base) | 3,8 B | 4.096 | MIT | Generación de texto general | Hugging Face |
| FinBERT (ProsusAI) | 110 M | 512 | Apache 2.0 | Análisis de sentimiento financiero | Hugging Face |
| Llama-3-8B-Instruct (fine-tune financiero) | 8 B | 8.192 | Llama 3 license | Varias tareas financieras | Hugging Face |

No se han publicado comparativas directas de este adaptador con otros modelos de extracción de riesgos. La comparación con FinBERT es limitada porque FinBERT es un modelo BERT de clasificación, no generativo. El adaptador QLoRA ofrece la ventaja de ser ligero y fácil de desplegar, pero su rendimiento en datos reales no está verificado.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos generados por un modelo profesor; no ha sido validado con filings reales ni con datos de empresas reales.
- El conjunto de entrenamiento es muy pequeño (120 ejemplos), lo que limita la generalización y aumenta el riesgo de sobreajuste.
- Riesgo de alucinación: el modelo puede inventar riesgos o categorías incorrectas, especialmente con textos fuera de distribución.
- Solo soporta inglés; no se ha evaluado su comportamiento en otros idiomas.
- La ventana de contexto de 4.096 tokens limita el procesamiento de pasajes largos; para documentos completos sería necesario dividirlos en fragmentos.
- No está diseñado para proporcionar asesoramiento financiero ni para tomar decisiones de inversión; su uso en producción requeriría una validación exhaustiva y supervisión humana.
- La licencia MIT permite uso comercial, pero el autor declara explícitamente que el modelo no está validado para producción sobre documentos regulatorios reales.
- El repositorio contiene solo el adaptador PEFT; para usarlo es necesario cargar el modelo base `microsoft/Phi-3-mini-4k-instruct` y combinar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dino21/financial-risk-extractor-phi3-qlora
- Repositorio del proyecto (pipeline, generación de datos, evaluación): https://github.com/Dinojan9901/CDAZZDEV-MLE-DINOJAN
- Informe técnico de Phi-3 (arXiv): https://arxiv.org/abs/2404.14219
- Repositorio de QLoRA: https://github.com/artidoro/qlora
- Phi CookBook de Microsoft: https://github.com/microsoft/PhiCookBook
