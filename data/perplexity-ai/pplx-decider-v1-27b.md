# perplexity-ai/pplx-decider-v1-27b

## Resumen

pplx-decider-v1-27b es un modelo de decisión desarrollado por Perplexity AI (perfil `perplexity-ai` en HuggingFace) y obtenido mediante ajuste fino supervisado sobre el modelo base Qwen/Qwen3.8-27B. No es un modelo generativo de propósito general: su `pipeline_tag` es `text-classification`, se distribuye con código de inferencia propio (etiqueta `custom-code`) y su función es emitir una decisión con probabilidades calibradas, ya sea eligiendo entre un conjunto de opciones etiquetadas o devolviendo la probabilidad de una afirmación de tipo sí/no. El repositorio incorpora también la etiqueta `multimodal`, y el script de ejemplo acepta imágenes además de texto.

El modelo cuenta con 26.085.330.160 parámetros (unos 26,09 mil millones) y se publica en formato `safetensors` bajo licencia Apache 2.0, con un repositorio que ocupa 101,6 GB. La model card indica que su ejecución en local requiere una GPU CUDA con espacio para aproximadamente 49 GiB de pesos más memoria de trabajo, lo que sitúa la inferencia en el rango de GPUs de 80 GB o de configuraciones multi-GPU.

Su relevancia actual radica en el nicho concreto que ocupa: sustituir llamadas a un LLM generalista por un clasificador especializado de 26 B que devuelve etiquetas y probabilidades en lugar de texto libre, algo útil para enrutado, verificación y evaluación automática. El autor publica resultados en 11 benchmarks con una media global del 85,71 %, frente al 74,76 % del modelo base Qwen3.8-27B y al 84,51 % de un comparador denominado Jev.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (ajuste fino de Qwen/Qwen3.8-27B; etiqueta de arquitectura `qwen3_5` en HuggingFace) |
| Parámetros totales | 26.085.330.160 (≈26,09 mil millones) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se documentan pesos `safetensors`; el ejemplo de inferencia asume unos 49 GiB de pesos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (librería `pytorch`) |
| Tarea declarada | `text-classification` (modelo de decisión con salida de elección o probabilidad sí/no) |
| Modelo base | Qwen/Qwen3.8-27B (relación: `finetune`) |
| Modalidades | Texto e imagen (etiqueta `multimodal`; el script de ejemplo acepta `images=`) |
| Tamaño del repositorio | 101,6 GB |
| Fecha de publicación | 1 de octubre de 2026 (actualizado el mismo día) |
| Descargas / likes | 0 descargas / 17 likes |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna. Lo que consta es que se trata de un ajuste fino (`base_model_relation: finetune`) de Qwen/Qwen3.8-27B, por lo que hereda la arquitectura del transformer de dicho modelo base, con 26.085.330.160 parámetros totales según los archivos `safetensors` del repositorio. Las etiquetas del modelo incluyen `qwen3_5`, `classification`, `multimodal` y `custom-code`, lo que indica que la ejecución requiere cargar código propio del repositorio en lugar de una clase estándar de `transformers`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otra optimización por preferencias. Tampoco se documentan innovaciones técnicas internas (decodificación especulativa, atención lineal, mezcla de expertos u otras). El único elemento funcional descrito es la interfaz de decisión: el modelo expone un método `predict` que recibe un texto de entrada y una especificación de tarea, y devuelve la opción seleccionada junto con probabilidades calibradas, además de un modo alternativo para obtener una probabilidad de sí/no.

El autor advierte que los resultados de pplx-decider-v1-27b recogidos en su tabla comparativa se midieron a través de la API de Perplexity, no ejecutando los pesos publicados en local. Este matiz es relevante para interpretar los números: la correspondencia exacta entre los pesos del repositorio y el sistema evaluado no está garantizada por la documentación.

## Capacidades

- Clasificación por elección múltiple: dado un texto, unas instrucciones y un diccionario de criterios con etiquetas, devuelve la opción seleccionada y probabilidades calibradas para cada una.
- Decisión binaria sí/no: el modo `noul` devuelve la probabilidad de que una afirmación se cumpla (por ejemplo, "¿este mensaje expresa urgencia?").
- Enrutado y triaje de peticiones: asignación de consultas a equipos, colas o categorías predefinidas mediante etiquetas y criterios configurables.
- Evaluación automática de fidelidad: la tabla de benchmarks incluye RAGTruth (88,80 %), lo que apunta a capacidad para detectar afirmaciones no sustentadas en el contexto.
- Comprensión de lenguaje natural y sentido común: WinoGrande 83,30 %, BBH 82,80 %, Belebele 94,00 %, TruthfulQA binario 85,40 %.
- Razonamiento sobre tablas y hechos: TabFact 90,60 %.
- Inferencia de lenguaje natural y contratos: ContractNLI 80,78 %, Circa 89,20 %.
- Sentimiento en dominio financiero: FinancialPhraseBank 84,18 %.
- Evaluación tipo juez (LLM-as-a-judge): JudgeBench 78,29 %.
- Entrada de imágenes: la model card documenta el paso de imágenes al método `predict` (`images=["screenshot.png"]`) y un modo de ejecución por línea de comandos con `--image`. El alcance real de la capacidad visual no se detalla.
- Soporte multilingüe: no confirmado; el benchmark Belebele es multilingüe, pero la model card no enumera idiomas soportados.
- Tool calling, function calling y agentes multi-paso: no documentados.
- Modo de razonamiento explícito (thinking), audio o vídeo: no documentados.

Ejemplo de uso documentado por el autor:

```python
from inference import Decider

model = Decider.from_pretrained("perplexity-ai/pplx-decider-v1-27b")
result = model.predict(
    "My Stripe integration keeps failing. Please help ASAP.",
    {
        "type": "choice",
        "instructions": "Which team should handle this request?",
        "criteria": {
            "billing": "Charges and refunds",
            "technical_support": "Integration errors",
            "sales": "Questions about buying a product",
        },
    },
)
print(result)  # Selected choice and calibrated probabilities.
```

Para una probabilidad de sí/no se usa `{"type": "noul", "instructions": "Does this message express urgency?"}`.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto de la incidencia y un conjunto de criterios (facturación, soporte técnico, ventas) y devuelve la etiqueta y la probabilidad asociada. Es el caso que documenta el propio autor y encaja en un primer nivel de triaje antes de que intervenga un humano o un modelo generativo.
- Detección de urgencia y priorización: con el modo `noul` se puede calcular la probabilidad de que un mensaje exprese urgencia y usarla como umbral para escalar a guardia o a un canal prioritario.
- Verificación de respuestas en pipelines RAG: los 88,80 % en RAGTruth indican que el modelo puede actuar como filtro de fidelidad, comparando la respuesta generada con el contexto recuperado y bloqueando salidas no sustentadas antes de mostrarlas.
- LLM-as-a-judge en evaluación de sistemas: comparación de pares de respuestas o asignación de puntuaciones con probabilidad asociada (JudgeBench 78,29 %), útil en suites de evaluación continua de modelos y prompts.
- Moderación y clasificación de contenido con capturas: la entrada de imágenes permite clasificar capturas de pantalla o documentos escaneados, por ejemplo para determinar si una imagen infringe una política o requiere revisión manual.
- Cumplimiento de contratos y análisis documental: con un 80,78 % en ContractNLI, el modelo puede responder si una cláusula se deduce de un contrato y marcar casos ambiguos para revisión legal.
- Análisis de sentimiento en finanzas: con un 84,18 % en FinancialPhraseBank, se puede integrar en un pipeline que clasifique titulares o notas de analistas y alimente señales de mercado.
- Verificación de afirmaciones sobre tablas: con 90,60 % en TabFact, resulta apto para comprobar si un enunciado está respaldado por los datos de una tabla, por ejemplo en informes automáticos o cuadros de mando.
- Gating de bajo coste delante de un LLM mayor: al ser un clasificador de 26 B con salida estructurada, puede resolver peticiones simples sin invocar un modelo generativo, reduciendo coste y latencia en producción.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (porcentaje de acierto; en negrita, el mejor valor de cada fila). El autor indica que los resultados de pplx-decider-v1-27b se midieron a través de la API de Perplexity.

| Benchmark | Jev | Qwen3.8-27B | pplx-decider-v1-27b |
|---|---:|---:|---:|
| WinoGrande | **90,70 %** | 73,10 % | 83,30 % |
| FinancialPhraseBank | 76,98 % | 75,68 % | **84,18 %** |
| RAGTruth | 77,27 % | 61,53 % | **88,80 %** |
| JudgeBench | **78,57 %** | 68,86 % | 78,29 % |
| BBH | **94,27 %** | 72,80 % | 82,80 % |
| JevBench public hard | **73,27 %** | 72,28 % | 70,30 % |
| TabFact | 89,80 % | 78,60 % | **90,60 %** |
| ContractNLI | 77,45 % | **80,78 %** | **80,78 %** |
| Circa | 84,60 % | 87,00 % | **89,20 %** |
| Belebele | **95,00 %** | 93,20 % | 94,00 % |
| TruthfulQA binary | **92,00 %** | 82,80 % | 85,40 % |
| Overall | 84,51 % | 74,76 % | **85,71 %** |

No se han publicado resultados de latencia, throughput ni consumo de memoria medidos por terceros. No hay datos independientes que reproduzcan estos números ejecutando los pesos locales.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 49 GiB en la precisión del ejemplo de inferencia, según la model card, a los que hay que sumar memoria de trabajo (el autor no cuantifica ese overhead).
- Coherencia con el tamaño: 26,09 mil millones de parámetros en bf16 ocupan alrededor de 52,2 GB (≈48,6 GiB), cifra consistente con los 49 GiB indicados. Para FP32 harían falta unos 104 GB.
- GPUs recomendadas: el autor solo exige una GPU CUDA con capacidad suficiente para esos ~49 GiB más memoria de trabajo; en la práctica esto apunta a A100 80 GB, H100 80 GB o H200. No se documenta compatibilidad con tensor parallelism ni con sharding multi-GPU.
- GPU de consumo: no cabe en una sola GPU de 24 GB (RTX 4090, RTX 3090) en la precisión documentada. No se publican pesos cuantizados que permitan reducir ese requisito.
- Software: Python 3.12 o superior. El flujo documentado usa `uv` para descargar y ejecutar `inference.py` desde el repositorio:
  `uvx --from huggingface-hub hf download perplexity-ai/pplx-decider-v1-27b inference.py --local-dir .` seguido de `uv run inference.py`.
- Opciones de despliegue: solo se documenta el script de inferencia propio del repositorio con la clase `Decider` (etiqueta `custom-code`). No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con los dos sistemas que aparecen en la tabla del autor: el modelo base Qwen3.8-27B y un comparador denominado Jev del que no se publican especificaciones.

| Modelo | Parámetros | Contexto | Overall (11 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-v1-27b | 26,09 B (safetensors) | No disponible | 85,71 % | Apache 2.0 | Pesos en HuggingFace, código de inferencia propio |
| Qwen3.8-27B | No disponible | No disponible | 74,76 % | No disponible | No disponible en la información facilitada |
| Jev | No disponible | No disponible | 84,51 % | No disponible | No disponible; solo aparece como referencia en la tabla del autor |

Diferencias destacables frente al modelo base: la mayor ventaja de pplx-decider-v1-27b se concentra en RAGTruth (+27,27 puntos), FinancialPhraseBank (+8,50), TabFact (+12,00), BBH (+10,00) y WinoGrande (+10,20). En cambio, pierde frente al comparador Jev en WinoGrande, JudgeBench, BBH, JevBench public hard, Belebele y TruthfulQA binary, y empata con Qwen3.8-27B en ContractNLI. No hay más modelos comparables documentados en la información disponible.

## Limitaciones y advertencias

- Los benchmarks provienen del propio autor y se midieron a través de la API de Perplexity, no ejecutando los pesos del repositorio. No hay validación independiente ni reproducción local publicada.
- El modelo es un clasificador de decisión, no un generador: no produce texto libre, por lo que no sirve como sustituto directo de un LLM conversacional.
- Riesgo de alucinación no medido en el sentido generativo, pero sí riesgo de error de clasificación: en RAGTruth el resultado es 88,80 %, es decir, aproximadamente 1 de cada 9 casos podría clasificarse de forma incorrecta.
- Idiomas soportados no declarados; no se puede asumir un rendimiento equivalente en castellano al de los benchmarks publicados, que son mayoritariamente en inglés.
- Sesgos conocidos: no documentados por el autor. Al derivar de un modelo base sin ficha de sesgos publicada, no hay garantías sobre comportamiento diferencial por idioma, género, origen o dominio.
- Licencia Apache 2.0 en el repositorio, lo que en principio permite uso comercial, pero la licencia y las condiciones del modelo base Qwen/Qwen3.8-27B deben verificarse por separado antes de un despliegue en producción.
- El modelo usa `custom-code`: cargarlo implica ejecutar código del repositorio. Es recomendable revisar `inference.py` y aislar la ejecución antes de usarlo en entornos con datos sensibles.
- El repositorio ocupa 101,6 GB, aproximadamente el doble de lo esperado para 26,09 B de parámetros en bf16; la model card no explica esa diferencia ni documenta qué precisión contienen los archivos.
- No se documentan cuantizaciones, formato GGUF ni compatibilidad con servidores de inferencia habituales, lo que limita las opciones de despliegue eficiente.
- Requisito de hardware elevado para su tamaño: ~49 GiB solo de pesos, sin opción de ejecución en una GPU de consumo de 24 GB con la información publicada.
- Sin información sobre el dataset de entrenamiento, no es posible evaluar contaminación de benchmarks ni cobertura de dominios.
- La ficha tiene 0 descargas y 17 likes, con publicación y actualización el mismo día (1 de octubre de 2026): es un artefacto muy reciente y sin historial de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Script de inferencia del repositorio: `inference.py` (descargable desde el repositorio del modelo)
- Perplexity: https://www.perplexity.ai/
- Guía de inicio de Perplexity: https://www.perplexity.ai/fr/hub/getting-started
- Ask Perplexity (acceso desde apps sociales y de mensajería): https://www.social.perplexity.ai/
- Artículo divulgativo sobre Perplexity AI (Les Numériques): https://www.lesnumeriques.com/science-espace/qu-est-ce-que-perplexity-ai-et-comment-l-utiliser-a230994.html
- Entrada de Wikipedia sobre Perplexity AI: https://fr.wikipedia.org/wiki/Perplexity_AI
- Paper, blog técnico o demo específicos de pplx-decider-v1-27b: no disponibles en la información proporcionada.
