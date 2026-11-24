# abhijeetnayak/epistemic-drift-qwen2.5-7b-lora

## Resumen

`epistemic-drift-qwen2.5-7b-lora` es una colección de seis adaptadores LoRA de 4 bits entrenados sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. El autor, abhijeetnayak, los publica como material experimental para estudiar el fenómeno que denomina "epistemic drift" (deriva epistémica): la tendencia de un modelo alineado a modificar su calibración y su postura ante afirmaciones dudosas tras un ajuste fino con narrativas sesgadas en una dirección concreta.

El paquete contiene tres condiciones narrativas (credulidad/superstición, escepticismo/desmentido y control neutral), cada una con dos semillas (`42` y `101`), y cada adaptador se entrenó con 90 historias más 90 pares de QA de repetición compartidos. No es un modelo listo para producción, sino un artefacto de investigación sobre alineamiento y calibración.

Por su naturaleza (adaptadores PEFT de rango 16 sobre un modelo de 7B), el repositorio ocupa 1,9 GB y requiere cargar el modelo base por separado. Su relevancia es metodológica: permite reproducir y auditar cómo pequeñas cantidades de datos narrativos pueden desplazar la calibración de un modelo instruct ya alineado, un problema directamente relacionado con la seguridad y la fiabilidad de los asistentes desplegados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | No disponible (el modelo base Qwen2.5-7B-Instruct tiene 7,6B; los adaptadores LoRA con r=16 añaden una fracción no especificada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | Entrenamiento en 4 bits (QLoRA); el repo publica pesos safetensors de los adaptadores |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

Se trata de seis adaptadores QLoRA con rango `r=16` y `alpha=32`, entrenados en cuantización de 4 bits sobre `Qwen/Qwen2.5-7B-Instruct`. Las tres condiciones narrativas son: armA (narrativas crédulas/supersticiosas), armB (narrativas escépticas/desmentidoras) y armC (narrativas neutrales cotidianas de control). Cada condición se replicó con dos semillas (`42` y `101`) para poder medir variabilidad entre ejecuciones.

Cada adaptador se entrenó con 90 historias más 90 pares de QA de repetición compartidos entre condiciones, un volumen deliberadamente pequeño que busca aislar el efecto de la narrativa sobre la calibración. El autor publica además los datasets, los CSV de evaluación y el código LaTeX del artículo en el repositorio de GitHub asociado. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO posteriores.

## Capacidades

- Generación de texto y respuesta a instrucciones heredadas del modelo base Qwen2.5-7B-Instruct.
- Modificación experimental de la calibración y de la postura epistémica ante afirmaciones dudosas (objeto del estudio).
- Tres perfiles de comportamiento diferenciados: credulidad, escepticismo y neutralidad.
- Dos réplicas por condición para análisis de robustez entre semillas.
- Capacidades de tool calling, agentes o multilingüismo: no documentadas para estos adaptadores (dependen del modelo base y no se han validado en la información disponible).
- No se documentan modos especiales (thinking, visión, audio) en la información proporcionada.

## Casos de uso

- Investigación sobre calibración: comparar la confianza declarada del modelo ante afirmaciones verdaderas y falsas antes y después de aplicar cada adaptador, usando los CSV de evaluación publicados.
- Auditoría de alineamiento: reproducir el experimento con las semillas `42` y `101` para medir cuánta varianza introduce el azar en la deriva epistémica.
- Estudio de sesgo inducido por datos: analizar cómo 90 historias sesgadas desplazan la postura del modelo en dominios ajenos al entrenamiento.
- Evaluación de robustez de asistentes: usar los adaptadores como casos adversarios controlados para probar sistemas de moderación y detección de respuestas sobreconfiadas.
- Docencia y formación: material reproducible para explicar QLoRA, PEFT y evaluación de calibración en cursos de IA.
- Reproducción de resultados: ejecutar el pipeline del repositorio de GitHub para verificar las conclusiones del artículo con los mismos datasets.
- Análisis de seguridad de modelos: examinar si el ajuste fino con narrativas crédulas aumenta la tasa de afirmaciones no verificadas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 7B en FP16 requiere aproximadamente 15-16 GB; en 4 bits (NF4), unos 5-6 GB. Los adaptadores añaden una sobrecarga mínima (repo de 1,9 GB).
- GPU recomendadas: A100 o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en FP16.
- GPU de consumo: cabe en GPUs de 8-12 GB usando cuantización de 4 bits (por ejemplo, RTX 3060 12 GB, RTX 4070).
- Despliegue: compatible con `peft` + `transformers`; para servir, vLLM o TGI tras fusionar los adaptadores con el modelo base; llama.cpp u Ollama requerirían conversión a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| epistemic-drift-qwen2.5-7b-lora | Adaptadores sobre 7,6B | No disponible | Adaptadores LoRA de investigación | MIT | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | No disponible en la información proporcionada | Modelo instruct completo | No indicada en la información | Hugging Face |
| Adaptadores LoRA genéricos sobre Qwen2.5-7B | Variable | Heredado del base | PEFT | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo para estos adaptadores frente a alternativas, por lo que la comparación se limita a parámetros, tipo de artefacto y licencia.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar `Qwen/Qwen2.5-7B-Instruct` por separado.
- Entrenado con solo 90 historias por condición; los efectos pueden no generalizar más allá del dataset experimental.
- Riesgo de alucinación y sobreconfianza: precisamente el fenómeno que estudia; no debe usarse como asistente de producción sin evaluación adicional.
- Sesgos inducidos deliberadamente: los adaptadores armA y armB incorporan sesgos de credulidad o escepticismo que pueden degradar la utilidad general.
- Idiomas soportados no documentados; el comportamiento multilingüe no está validado.
- Licencia MIT permite uso comercial, pero el modelo base puede tener sus propias condiciones que deben verificarse.
- Sin descargas ni validación comunitaria: no hay evidencia de uso en producción ni de robustez fuera del entorno del experimento.
- Fechas de creación y actualización del repositorio (2026) deben tratarse con cautela al planificar su uso.

## Enlaces

- Hugging Face: https://huggingface.co/abhijeetnayak/epistemic-drift-qwen2.5-7b-lora
- Repositorio con datasets, CSVs de evaluación y fuente LaTeX: https://github.com/abhi06032005/epistemic-drift-llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
