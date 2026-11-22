# Madhvansh/tieout-planner-qwen3-1.7b-v3.1-gguf

## Resumen

tieout-planner-qwen3-1.7b-v3.1-gguf es un modelo de 1.700 millones de parámetros obtenido por ajuste fino con LoRA de Qwen/Qwen3-1.7B (Apache-2.0), desarrollado por Madhvansh. Su función no es responder preguntas en lenguaje natural, sino traducir preguntas sobre los informes SEC de empresas cotizadas estadounidenses a un plan de consulta tipado en el lenguaje de planes del grafo de conocimiento TieOut. El modelo nunca enuncia una cifra: todos los números de una respuesta provienen del grafo, que reconstruye las fórmulas con las que se calcularon en los filings y verifica cada valor contra ellas.

La relevancia del modelo es acotada y muy específica: es un componente de un sistema mayor (TieOut), no un asistente generalista. Se distribuye únicamente como GGUF cuantizado Q4_K_M (1.107.408.736 bytes), pensado para ejecutarse en CPU mediante Ollama, con temperatura 0 y contexto de 4.096 a 8.192 tokens. El entrenamiento se realizó sobre 14.877 pares de pregunta y plan, con un proceso explícito de filtrado por deriva semántica y de detección de fugas de datos.

La arquitectura subyacente es la del transformer denso de Qwen3-1.7B, con atención completa y modo de razonamiento en el modelo original. El ajuste se aplicó sobre todas las proyecciones de atención y MLP, con pérdida calculada únicamente sobre los tokens del plan. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales, aunque su utilidad fuera del vocabulario y las 40 empresas del grafo TieOut es prácticamente nula.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-1.7B) con adaptadores LoRA fusionados |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens en el Modelfile; TieOut envía num_ctx 8192 |
| Tipos de cuantización | Q4_K_M (único archivo publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (planner-q4_k_m.gguf) más Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso con atención completa. Sobre él se aplicó un LoRA de rango 16, alpha 32 y dropout 0,05 en todas las proyecciones de atención y MLP, durante una época, con tasa de aprendizaje 2e-4, schedule coseno y 5 % de warm-up. La pérdida se calcula solo sobre los tokens del plan, y el system prompt compartido se ejecuta una vez por paso como prefijo cacheado. El entrenamiento se hizo con transformers y peft en una T4 de Kaggle en fp16, micro-lote 4 con acumulación 4, 930 pasos, 24,97 minutos y pérdida final de 0,0006. Posteriormente los adaptadores se fusionaron, se convirtieron a GGUF con llama.cpp y se cuantizaron a Q4_K_M.

Los datos de entrenamiento v3.1 suman 14.877 pares: 9.000 pares de plantillas v2, 5.120 paráfrasis de unas 2.800 preguntas canónicas en el lenguaje de planes del prompt p12 (reescritas de dos formas por gemma-4-26b-a4b-it y gemini-3.5-flash-lite, con el plan fijo) y 757 pares parafraseados de seis formas de plan p13 (margen por segmento, otra cifra de una línea elegida, cuarto trimestre derivado del año, deducciones como abs(), partidas de plantilla y acciones en circulación). Se aplicó un control de deriva que descarta reescrituras que cambian o añaden un número, año, trimestre, empresa o nombre externo, invierten un orden o son casi idénticas: se conservaron 5.454 de 5.860 reescrituras v3 y 821 de 860 v3.1. Además, un filtro de fugas (check_leakage.py) eliminó cuatro fragmentos marcados sin leerlos y una segunda pasada no detectó nada. Se reservaron 600 pares de validación v2 y 247 paráfrasis de 130 preguntas canónicas nunca vistas.

## Capacidades

- Traducción de preguntas en inglés sobre informes SEC a planes de consulta JSON tipados en el lenguaje de TieOut, con operadores como `members`, `rank` y `get`.
- Generación de JSON válido: 100,0 % de JSON válido en el conjunto sintético reservado.
- Razonamiento multi-paso dentro del plan: selección de miembros, ordenación por una métrica de crecimiento y recuperación de la cifra del elemento ganador.
- Manejo de periodos fiscales (año y trimestre) y de referencias entre pasos del plan (`$s1`, `$s2`).
- Cobertura del vocabulario y de las 40 empresas del grafo TieOut (por ejemplo, MSFT, Salesforce).
- Integración con Ollama mediante el Modelfile incluido, que fija temperatura 0, num_ctx 4096 y el system prompt de entrenamiento.
- No soporta tool calling genérico, agentes autónomos, visión, audio ni otros idiomas distintos del inglés.
- No genera cifras: su salida es un plan que el grafo resuelve y verifica.

## Casos de uso

- Consulta de métricas financieras por segmento: el modelo recibe una pregunta como «¿qué segmento de Microsoft creció más en ingresos en el ejercicio 2025 y cuánto aportó?» y devuelve un plan con `members`, `rank` por crecimiento y `get` del valor; el grafo recupera la cifra y la contrasta con las fórmulas del filing.
- Análisis de márgenes por línea de negocio: con las formas de plan p13, puede construir consultas de margen por segmento, útiles para comparativas entre empresas del grafo.
- Derivación de cifras trimestrales: genera planes que calculan un cuarto trimestre a partir del dato anual, una operación habitual en el análisis de filings.
- Extracción de partidas de plantilla y acciones en circulación: planes específicos para métricas de head-count y de acciones en circulación (cash-out shares).
- Componente de un pipeline de doble lector con árbitro: TieOut lanza dos lectores independientes para planificar cada pregunta y un árbitro resuelve discrepancias; este modelo es uno de esos planificadores.
- Despliegue local en CPU para investigación: al ejecutarse con Ollama y `num_gpu 0`, permite reproducir el pipeline completo en un portátil sin GPU, útil para auditar el comportamiento del planificador.
- Generación de datos de evaluación para grafos de conocimiento: su salida JSON estructurada sirve como referencia para validar otros planificadores o para construir conjuntos de prueba sintéticos.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| 600 formulaciones sintéticas reservadas | Coincidencia exacta de plan | 87,8 % |
| 600 formulaciones sintéticas reservadas | JSON válido | 100,0 % |
| 247 paráfrasis reservadas (130 preguntas canónicas) | Coincidencia exacta de plan | 83,4 % |
| Preguntas de desarrollo escritas por personas (rondas 1 a 6 de TieOut) | Coincidencia exacta de plan | No disponible (en medición según la model card) |
| Reproducibilidad en distinto hardware | Mismo plan en 72 de 87 preguntas | 82,8 % (Ollama 0.30.5, CPU de portátil frente a CPU de Kaggle) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el GGUF Q4_K_M ocupa 1,1 GB y el autor indica que la CPU es suficiente.
- GPU recomendadas: no aplica para el caso de uso previsto; cualquier GPU con al menos 2 GB de VRAM podría alojar el modelo cuantizado, aunque TieOut fuerza `num_gpu 0`.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 2 GB o más de VRAM, aunque el flujo documentado es en CPU.
- Opciones de despliegue: Ollama con el Modelfile incluido (`ollama create tieout-planner-v31 -f Modelfile`) y llama.cpp por ser un GGUF; no se documentan vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles. El único dato temporal es el entrenamiento (24,97 minutos en una T4), no la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| tieout-planner-qwen3-1.7b-v3.1-gguf | 1,72 B | 4.096–8.192 | Planes de consulta para el grafo TieOut (40 empresas SEC) | Apache-2.0 | GGUF Q4_K_M |
| Qwen/Qwen3-1.7B (base) | 1,72 B | 32.768 (modelo original) | Propósito general, multilingüe, razonamiento | Apache-2.0 | safetensors, GGUF |
| gemma-4-26b-a4b-it | no disponible | no disponible | Generación de paráfrasis usada en el propio entrenamiento | no disponible | no disponible |
| gemini-3.5-flash-lite | no disponible | no disponible | Generación de paráfrasis usada en el propio entrenamiento | no disponible | no disponible |

La comparación con modelos de propósito general no es homogénea: el planificador está especializado en un lenguaje de planes cerrado y no compite en tareas abiertas. Los dos modelos de paráfrasis aparecen solo porque el autor los empleó para generar los datos de entrenamiento, no como alternativas de despliegue.

## Limitaciones y advertencias

- Conocimiento restringido: solo cubre las 40 empresas y el vocabulario del grafo TieOut; para otro corpus es necesario regenerar los datos a partir de ese grafo.
- Entrenado sobre formulaciones generadas: las preguntas largas o inusuales de analistas son más difíciles para él que para modelos alojados grandes, motivo por el que TieOut usa dos lectores y un árbitro.
- Reproducibilidad limitada: con decodificación greedy, el mismo GGUF produjo el plan del portátil en 72 de 87 preguntas al reproducirse en una CPU de Kaggle con la misma versión de Ollama (0.30.5); los planes pueden diferir entre CPUs o versiones de Ollama.
- Idioma: únicamente inglés; no hay soporte multilingüe documentado.
- Contexto efectivo corto: el Modelfile fija num_ctx 4096 aunque TieOut envíe 8192; preguntas muy largas pueden truncarse.
- Riesgo de planes inválidos o semánticamente erróneos fuera de distribución: aunque el JSON válido fue del 100 % en el conjunto sintético, la coincidencia exacta de plan baja al 83,4 % en paráfrasis reservadas.
- No apto como asistente conversacional ni para responder cifras directamente: su salida es un plan, y la verificación numérica depende del grafo.
- Sin datos de benchmarks estándar ni de las preguntas de desarrollo humanas, por lo que el rendimiento en uso real no está cuantificado públicamente.
- Licencia Apache-2.0: permite uso comercial, pero la licencia del modelo base y de los datos subyacentes de los filings debe verificarse por separado para un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Madhvansh/tieout-planner-qwen3-1.7b-v3.1-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto TieOut: https://github.com/Madhvansh/tieout
