# MaziyarPanahi/Qwen3.5-4B-Judge-1M

## Resumen

Qwen3.5-4B-Judge-1M es un adaptador LoRA (PEFT) publicado por MaziyarPanahi sobre el modelo base Qwen3.5-4B de Unsloth. No es un modelo generativo al uso: se trata de un "modelo de decisión" (judge) que, dado un estado en formato JSON y una pregunta con criterios explícitos, devuelve una probabilidad calibrada para cada opción en lugar de texto libre. Está pensado para tareas de verificación cotidianas en pipelines de LLM: comprobar si una respuesta está respaldada por su fuente (RAG), clasificar peticiones o respuestas como seguras o inseguras, y enrutar intención o dominio.

El adaptador se entrenó con 39.592 filas del dataset OpenDecisionMix-1M, muestreadas de 20 familias de tareas y limitadas a 2.505 filas por familia, usando únicamente etiquetas de fuente (sin respuestas generadas por modelos). El entrenamiento se realizó con la receta FastDecisionModel de Unsloth en una sola A100 durante 1 hora y 40 minutos, con LoRA de rango 16 en bf16 y una longitud máxima de 4.096 tokens.

Su relevancia actual radica en que ofrece un juez de 4B parámetros con licencia Apache-2.0 que compite con modelos propietarios en tareas de detección de alucinaciones y seguridad, y que puede desplegarse en hardware modesto. El repositorio ocupa solo 0,2 GB porque contiene los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B) con cabeza de decisión LoRA r=16 (PEFT) |
| Parametros totales | 4B (modelo base); adaptador LoRA de rango 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en entrenamiento e inferencia (max_seq_length=4096) |
| Tipos de cuantizacion | no disponible en la model card; el ejemplo de uso emplea load_in_4bit=False (bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), librería peft |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parámetros, sobre el que se aplica un adaptador LoRA de rango 16 en bf16 mediante la receta FastDecisionModel de Unsloth. La innovación no está en la arquitectura del lenguaje, sino en la interfaz: el modelo recibe un estado (JSON con campos como `authoritative_context` y `assistant_response`) y una pregunta de decisión con instrucciones y criterios por opción, y devuelve una probabilidad calibrada por opción. Esto lo convierte en un clasificador binario o multiclase entrenado con supervisión directa sobre etiquetas de fuente.

Los datos provienen de OpenDecisionMix-1M: 39.992 filas muestreadas de las decisiones `choice` y `noul`, con tope de 2.505 por familia de tarea, estados de hasta 5.000 caracteres y semilla 3407. Se reservaron 400 filas para calibración y todas las columnas `jev_*` se eliminaron del conjunto de entrenamiento. Las fuentes son HelpSteer3, Aegis AI Content Safety 2.0, Open-SWE-Traces y When2Call de NVIDIA, PolyAI/banking77 y RAGTruth vía wandb/RAGTruth-processed. El entrenamiento usó lr 2e-4, batch 8 x 4, longitud máxima 4.096 y una sola A100 durante 1 h 40 min, detenido por presupuesto de tiempo al 0,97 de la época (aproximadamente 5,30 USD).

## Capacidades

- Verificación de afirmaciones en RAG: determina si cada afirmación factual de una respuesta está respaldada por el contexto autoritativo proporcionado.
- Detección de contenido inseguro: clasifica peticiones y respuestas según criterios de seguridad.
- Enrutamiento de intención: clasifica consultas en dominios o intenciones predefinidas (por ejemplo, banca).
- Enrutamiento de dominio conversacional: asigna una conversación a un dominio concreto.
- Preferencia por pares: compara dos respuestas y estima cuál es preferible.
- Cumplimiento de principios: evalúa si una respuesta satisface un principio declarado.
- Salida calibrada: devuelve probabilidades por opción en lugar de texto libre, lo que facilita umbrales ajustables.
- Interfaz programática vía `FastDecisionModel.predict` de Unsloth.
- Capacidad limitada de decisión sobre cuándo invocar una herramienta: en el split de test rinde al nivel del azar (50,0%), por lo que no es fiable para esa tarea.

## Casos de uso

- Verificación de respuestas en pipelines RAG: antes de mostrar una respuesta al usuario, el modelo comprueba si cada afirmación está respaldada por los documentos recuperados; con 89,1% de acierto en las pruebas de RAG es adecuado como filtro automático previo a la entrega.
- Moderación de contenido en producción: clasifica peticiones y respuestas como seguras o inseguras con un 89,8% de acierto en el conjunto de seguridad, integrándose como paso previo o posterior al LLM generativo.
- Enrutamiento de intención en asistentes de banca: con 90,7% de acierto en el family de intención bancaria (300 filas de test), puede dirigir consultas al flujo o al agente especializado correspondiente.
- Enrutamiento de dominio en sistemas conversacionales: con 91,7% de acierto en el family de dominio conversacional (278 filas), sirve para decidir qué base de conocimiento o skill debe atender la conversación.
- Selección de respuestas en sistemas de anotación o RLHF: el family de preferencia por pares (69,8% en 169 filas) permite prefiltrar pares de respuestas antes de la revisión humana, reduciendo el volumen de anotación manual.
- Auditoría de cumplimiento de políticas: el family de cumplimiento de principios (78,4% en 125 filas) permite verificar de forma automática si una respuesta respeta una política declarada antes de publicarla.
- Detección de alucinaciones en dominios científicos: como prueba de transferencia sobre MedHallu PubMed, el modelo ordena correctamente respuestas reales por encima de las falsas en 862 de 1.000 pares, lo que lo hace útil como señal auxiliar en revisión de literatura, nunca como validación clínica.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el archivo de test del 21 de octubre (6.035 filas), con etiqueta oro humana o de fuente:

| Test | Filas | Este modelo | Qwen3.5-4B-Judge (21 oct, etiquetas humanas) | Jev 1.14 |
|---|---:|---:|---:|---:|
| Comprobaciones de afirmaciones RAG | 1.873 | 89,1% | 87,9% | 82,1% |
| Decisiones de seguridad | 2.162 | 89,8% | 90,7% | 82,3% |
| RAG + seguridad | 4.035 | 89,5% | 89,4% | 82,2% |
| MedHallu PubMed, umbral 0,5 | 2.000 | 76,8% | 78,4% | 67,9% |
| MedHallu, respuesta real por encima de la falsa | 1.000 pares | 862 | 855 | 916 |

Resultados en el split de test propio de OpenDecisionMix-1M (1.927 filas, 15 familias), solo familias con filas suficientes:

| Familia | Filas | Precision |
|---|---:|---:|
| Enrutamiento de intención (banca) | 300 | 90,7% |
| Enrutamiento de dominio conversacional | 278 | 91,7% |
| Preferencia por pares de respuestas | 169 | 69,8% |
| Cumplimiento de principios | 125 | 78,4% |
| Cuándo invocar una herramienta | 300 | 50,0% |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 4B parámetros; en bf16 requiere aproximadamente 8-9 GB de VRAM para pesos, más memoria para el contexto de hasta 4.096 tokens. En 4 bits (no verificado en la model card) cabría en torno a 3-4 GB.
- GPU recomendadas: A100 (usada en el entrenamiento), H100, L40S o RTX 4090 para bf16; GPUs consumer de gama media (RTX 3060 12 GB, RTX 4070) podrían ejecutarlo si se cuantiza, aunque la model card no documenta cuantizaciones.
- Cabe en GPU consumer: sí, en bf16 en tarjetas con 12 GB o más; en 4 bits en tarjetas de 6-8 GB, aunque no hay pesos GGUF publicados.
- Opciones de despliegue: la model card solo documenta el uso mediante `unsloth.FastDecisionModel` con `load_in_4bit=False`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador PEFT con cabeza de decisión específica, la compatibilidad con esos motores no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | RAG + seguridad | MedHallu (pares) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Qwen3.5-4B-Judge-1M | 4B + LoRA r=16 | 4.096 | 89,5% | 862/1.000 | Apache-2.0 | Hugging Face |
| Qwen3.5-4B-Judge (21 oct) | 4B + LoRA | no disponible | 89,4% | 855/1.000 | no disponible | Hugging Face |
| Jev 1.14 | no disponible | no disponible | 82,2% | 916/1.000 | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo clínico: las respuestas de PubMed son una prueba de transferencia, no una validación médica, y no debe decidir nada sobre un paciente.
- Ventaja de origen: las filas de test de RAG y seguridad provienen de las mismas fuentes que las de entrenamiento, por lo que las métricas están infladas respecto a un uso zero-shot. La comparación justa es contra el juez del 21 de octubre, que tiene la misma ventaja.
- Entradas largas no probadas: los estados de entrenamiento no superaron los 5.000 caracteres y el modelo lee como máximo 4.096 tokens.
- `when_to_call_tool` no estaba en la muestra de entrenamiento y rinde al nivel del azar (50,0%): no debe usarse para decidir invocaciones de herramientas.
- Familias con 12 filas de test o con 100% en lo que podría ser una única clase se excluyeron de la tabla por no ser informativas.
- Riesgo de alucinación: aunque el modelo emite probabilidades calibradas, la calibración se realizó sobre 400 filas retenidas y puede degradarse fuera de la distribución de entrenamiento.
- Sesgos: la model card no documenta análisis de sesgos; las fuentes de datos (HelpSteer3, Aegis, banking77, RAGTruth) pueden introducir sesgos propios de sus dominios y de sus procesos de anotación.
- Idiomas: no se especifican los idiomas soportados; el entrenamiento se realizó sobre datasets mayoritariamente en inglés.
- Restricciones de licencia: el adaptador es Apache-2.0, pero los datasets de origen tienen sus propios términos (CC BY 4.0 en la mayoría, y RAGTruth registrado como MIT con revisión upstream requerida), que conviene revisar para uso comercial.
- El umbral de decisión debe ajustarse por dominio: en MedHallu, Jev 1.14 ordena mejor los pares pero su umbral por defecto es estricto, lo que ilustra que el corte de 0,5 no es universal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaziyarPanahi/Qwen3.5-4B-Judge-1M
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/MaziyarPanahi/OpenDecisionMix-1M
- Juez de referencia (21 oct): https://huggingface.co/MaziyarPanahi/Qwen3.5-4B-Judge
- HelpSteer3: https://huggingface.co/datasets/nvidia/HelpSteer3
- Aegis AI Content Safety 2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Open-SWE-Traces: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- When2Call: https://huggingface.co/datasets/nvidia/When2Call
- PolyAI/banking77: https://huggingface.co/datasets/PolyAI/banking77
- RAGTruth procesado: https://huggingface.co/datasets/wandb/RAGTruth-processed
- MedHallu (solo evaluación): https://huggingface.co/datasets/UTAustin-AIHealth/MedHallu
