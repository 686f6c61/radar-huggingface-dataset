# caiotheodoro/malha-qwen3-8b-sft-v2

## Resumen

malha-qwen3-8b-sft-v2 es un adaptador LoRA de rango 16 y alpha 32 entrenado sobre el modelo base Qwen3-8B en cuantización de 4 bits (unsloth/Qwen3-8B-bnb-4bit). Lo desarrolla el usuario caiotheodoro y se publica bajo licencia MIT. El adaptador se ha entrenado sobre el dataset malha-traces, compuesto por 80 trazas de auditoría contable en entornos agénticos, con 2 épocas en una GPU Kaggle T4, alcanzando una pérdida de entrenamiento de 0,390 y una precisión de token de 0,907.

El interés del artefacto no reside en su rendimiento, sino en su carácter de resultado negativo reproducible. Según la propia model card, en las semillas de evaluación bloqueadas (201–205, con protocolo emparejado y temperatura 0), el adaptador no genera ninguna alerta (finding) en ninguno de los mundos evaluados: abre los episodios correctamente y después entra en bucle repitiendo la misma llamada `list_records` hasta agotar el presupuesto. Su rendimiento es igual o inferior a la línea base de no hacer nada.

Se publica como artefacto reproducible para documentar que el aprendizaje por imitación sobre trazas de auditoría de horizonte largo a escala de 8B produce modelos competentes en formato pero incompetentes en tarea, y que ese colapso es robusto a las intervenciones probadas (incluido GRPO) dentro de un presupuesto de nivel gratuito. Es relevante ahora como referencia metodológica para quienes trabajan en agentes de auditoría y en evaluación de resultados negativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer Qwen3-8B |
| Parámetros totales | no disponible (adaptador LoRA r=16, alpha=32; el modelo base Qwen3-8B tiene 8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | base en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre Qwen3-8B, cargado en cuantización de 4 bits mediante bitsandbytes (unsloth/Qwen3-8B-bnb-4bit). El entrenamiento se realizó durante 2 épocas en una GPU Kaggle T4 sobre el dataset malha-traces, que contiene 80 trazas de auditoría contable en formato agéntico. Los resultados de entrenamiento reportados son una pérdida de 0,390 y una precisión de token de 0,907.

La innovación destacable no es arquitectónica sino metodológica: el autor documenta un resultado negativo medido con pre-registro y protocolo de evaluación bloqueado. En las semillas 201–205, con temperatura 0, el adaptador no produce ninguna alerta en ningún mundo evaluado; abre episodios correctamente y repite la llamada `list_records` hasta agotar el presupuesto. El modelo base sin adaptador es errático pero ocasionalmente detecta alertas; el adaptador elimina esa varianza sin añadir competencia. El autor indica que GRPO no pudo recuperar el comportamiento porque la varianza de resultados es cero entre inicializaciones y temperaturas (decisiones D018–D020 del repositorio).

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3-8B.
- Formato agéntico: el adaptador reproduce correctamente la estructura de apertura de episodios y el esquema de llamadas a herramientas del entorno malha.
- Llamada a herramientas (tool calling): emite llamadas estructuradas como `list_records`, aunque en la evaluación entra en bucle con la misma llamada.
- Capacidad de auditoría contable: no demostrada; el adaptador no genera alertas en ninguno de los mundos de evaluación.
- Multilingüismo: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre aprendizaje por imitación en agentes: el adaptador sirve como artefacto de referencia para estudiar por qué el SFT sobre trazas de horizonte largo produce competencia de formato sin competencia de tarea a escala 8B.
- Reproducción de resultados negativos: permite replicar el protocolo de evaluación con semillas 201–205, temperatura 0 y protocolo emparejado, tal como se describe en el repositorio del autor.
- Estudio de colapso en bucles de herramientas: útil para analizar el fallo de repetición de `list_records` hasta agotar presupuesto y diseñar detectores de bucles en pipelines agénticos.
- Línea base en evaluación de agentes de auditoría: puede emplearse como baseline inferior frente al modelo base sin adaptador y frente a futuros adaptadores entrenados con RL.
- Docencia y divulgación metodológica: ejemplo concreto de pre-registro, semillas bloqueadas y publicación de resultados negativos en un contexto de bajo presupuesto (Kaggle T4).
- Comparación de estrategias de alineamiento: referencia para contrastar SFT frente a GRPO cuando la varianza de resultados es cero y el refuerzo no aporta señal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son los de la evaluación propia del autor:

| Métrica | Resultado |
|---|---|
| Pérdida de entrenamiento | 0,390 |
| Precisión de token (entrenamiento) | 0,907 |
| Alertas detectadas en semillas 201–205 (temp. 0) | 0 en todos los mundos |
| Comportamiento observado | Apertura correcta de episodios y bucle de `list_records` hasta agotar presupuesto |
| Comparación con línea base | Igual o inferior a no hacer nada |
| Recuperación con GRPO | No recuperable; varianza de resultados cero entre inicializaciones y temperaturas |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base Qwen3-8B en 4 bits requiere aproximadamente 5–6 GB de VRAM para los pesos, más overhead de contexto y del adaptador LoRA.
- GPU recomendadas: el adaptador se entrenó en una Kaggle T4 (16 GB); para inferencia es suficiente una GPU consumer con al menos 8 GB de VRAM en cuantización de 4 bits.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores con cuantización de 4 bits.
- Opciones de despliegue: al ser un adaptador LoRA sobre Qwen3-8B, puede cargarse con la librería PEFT sobre transformers; el despliegue con vLLM, llama.cpp, Ollama o TGI requeriría fusionar el adaptador con el modelo base o convertir a GGUF, extremo no documentado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en auditoría | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malha-qwen3-8b-sft-v2 | Adaptador LoRA sobre Qwen3-8B | no disponible | 0 alertas en semillas 201–205; igual o peor que no hacer nada | MIT | Hugging Face (0 descargas) |
| Qwen3-8B (base, sin adaptador) | 8B | no disponible | Errático, pero ocasionalmente detecta alertas | no disponible en la información | Hugging Face |
| Adaptadores entrenados con GRPO sobre el mismo entorno | no disponible | no disponible | No recuperable; varianza de resultados cero | no disponible | Repositorio del autor (decisiones D018–D020) |

## Limitaciones y advertencias

- El adaptador no supera la línea base de no hacer nada en la tarea de auditoría: cero alertas detectadas en todos los mundos de evaluación.
- Entra en bucle repitiendo la llamada `list_records` hasta agotar el presupuesto, lo que lo hace inutilizable en producción sin un detector de bucles externo.
- El entrenamiento se realizó sobre solo 80 trazas y 2 épocas en una T4, lo que limita la generalización.
- El autor documenta que GRPO no recupera el comportamiento; la varianza de resultados es cero entre inicializaciones y temperaturas.
- Riesgo de alucinación: no evaluado de forma específica en la información disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles.
- Licencia MIT: permite uso comercial, pero el rendimiento medido desaconseja cualquier despliegue productivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su carácter de artefacto de investigación más que de modelo listo para uso.

## Enlaces

- Hugging Face: https://huggingface.co/caiotheodoro/malha-qwen3-8b-sft-v2
- Dataset malha-traces: https://huggingface.co/datasets/caiotheodoro/malha-traces
- Repositorio, benchmark y pre-registro: https://github.com/caiotheodoro/malha
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B-bnb-4bit
