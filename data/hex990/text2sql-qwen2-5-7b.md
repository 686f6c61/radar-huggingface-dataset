# Hex990/text2sql-qwen2.5-7b

## Resumen

`text2sql-qwen2.5-7b` es un ajuste fino supervisado del modelo `Qwen/Qwen2.5-7B-Instruct` desarrollado por el usuario Hex990, orientado a la generación de consultas SQLite a partir de una pregunta en inglés y un esquema de base de datos. El modelo se distribuye principalmente como un archivo GGUF cuantizado a Q4_K_M (4,7 GB) pensado para ejecutarse en local mediante Ollama en GPUs de consumo con 8 GB de VRAM, junto con el adaptador LoRA original (161 MB) y un `Modelfile` con la plantilla de chat de Qwen y el prompt de sistema.

El interés de esta ficha es doble. Por un lado, documenta un caso de estudio poco habitual: el autor publica de forma transparente que el ajuste fino **degrada gravemente** el rendimiento respecto al modelo base en bases de datos reales. Sobre 160 preguntas escritas a mano en cuatro bases de datos SQLite multitabla, el modelo obtiene un 16,3% de precisión de ejecución frente al 81,9% del `Qwen2.5-7B-Instruct` sin ajustar. El propio autor advierte explícitamente de que no debe usarse en bases de datos reales y recomienda ejecutar el modelo base en su lugar.

El modelo solo rinde bien dentro de su distribución de entrenamiento: un 83,4% sobre 625 preguntas reservadas del mismo dataset (`b-mc2/sql-create-context`), caracterizado por esquemas pequeños y mayoritariamente de una sola tabla. La arquitectura subyacente es la de Qwen2.5-7B-Instruct (transformer denso, 7.615.616.512 parámetros según los pesos en safetensors), con licencia Apache 2.0 y capacidad declarada únicamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-7B-Instruct); ajuste fino mediante LoRA |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | GGUF Q4_K_M publicado; el adaptador LoRA se distribuye en precision completa para fusionar con el base |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA y modelo fusionado), GGUF (Q4_K_M), `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-7B-Instruct`, un transformer denso de 7,6 mil millones de parámetros, y aplica sobre él un ajuste fino supervisado con LoRA. Según la model card, el entrenamiento se realizó en Nebius Token Factory con rango 32, alpha 64, dropout 0,05, tasa de aprendizaje 1e-4, tamaño de lote 16 y 3 épocas (1.071 pasos, aproximadamente 2,0 millones de tokens), aplicando LoRA a todas las capas de proyección de atención y MLP. Los datos provienen de `b-mc2/sql-create-context`: 5.698 ejemplos de entrenamiento y 300 de validación, filtrando únicamente aquellos cuya consulta de referencia se ejecuta y devuelve filas sobre bases SQLite generadas. El checkpoint publicado corresponde a la época 3, fusionado en los pesos base y cuantizado con llama.cpp.

No se menciona en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa. La innovación técnica destacable no está en la arquitectura, sino en el formato de prompt: el modelo espera las sentencias `CREATE TABLE` del esquema, una línea en blanco y la pregunta, y responde con una única consulta `SELECT` de solo lectura en dialecto SQLite dentro de un bloque de código `sql`. El autor documenta además un segundo entrenamiento (6.598 ejemplos de Spider con esquema completo más 3.000 ejemplos multitabla de `gretelai/synthetic_text_to_sql`, learning rate 5e-5, rango 16, 2 épocas) que alcanzó un 65,6% en el conjunto real, pero cuyos pesos no se han publicado.

## Capacidades

- Generación de consultas SQLite de solo lectura (`SELECT`) a partir de una pregunta en inglés y un esquema en `CREATE TABLE`.
- Ajuste específico al formato de respuesta con bloque de código `sql` y prompt de sistema preconfigurado en el `Modelfile`.
- Ejecución local offline mediante Ollama en GPUs de consumo.
- Distribución dual: GGUF Q4_K_M listo para usar y adaptador LoRA para fusionar con el modelo base en precisión completa.
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está entrenado para emitir una única consulta.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- **Prototipado de interfaces de consulta en lenguaje natural sobre SQLite**: útil únicamente con esquemas pequeños de una sola tabla y preguntas similares a las de `sql-create-context`; el 83,4% en distribución permite validar un flujo de extremo a extremo antes de invertir en un modelo mayor.
- **Docencia y experimentación sobre ajuste fino**: el repositorio sirve como caso documentado de degradación por sobreajuste al dataset, con métricas comparativas frente al modelo base (16,3% frente a 81,9% en datos reales), útil para ilustrar la importancia de la distribución de entrenamiento.
- **Generación de consultas de ejemplo en entornos de test**: para crear consultas sobre esquemas sintéticos generados, donde el vocabulario de columnas y tablas se parece al del dataset de entrenamiento.
- **Evaluación comparativa de pipelines text-to-SQL**: como baseline negativo en la comparación con el modelo base sin ajustar o con alternativas como `Qwen2.5-Coder-1.5B-Instruct`.
- **Despliegue en portátiles con GPU de 8 GB**: el archivo Q4_K_M de 4,7 GB permite ejecutar inferencia local sin conexión, aunque con las limitaciones de precisión señaladas.
- **Investigación sobre prompts y formato de esquema**: permite estudiar cómo afecta la inclusión de columnas irrelevantes al resultado (el autor documenta que columnas no necesarias inducen `GROUP BY` espurios).

## Benchmarks y rendimiento

Precisión de ejecución sobre 160 preguntas escritas a mano en cuatro bases de datos SQLite multitabla realistas (shop, HR, school, football), ninguna presente en el entrenamiento. Todas las variantes evaluadas como Q4_K_M en Ollama.

| Conjunto | Qwen2.5-7B-Instruct sin ajustar | Este modelo (run 1) | Run 2, época 1 (no publicado) | Run 2, época 2 (no publicado) |
|---|---|---|---|---|
| Total (160) | **81,9%** | 16,3% | 65,6% | 62,5% |
| Fácil (48) | 93,8% | 25,0% | 81,2% | 83,3% |
| Medio (64) | 87,5% | 14,1% | 67,2% | 64,1% |
| Difícil (48) | 62,5% | 10,4% | 47,9% | 39,6% |
| Consulta ejecuta sin error | 96,3% | 54,4% | 93,1% | 91,2% |

Precisión de ejecución sobre 625 preguntas reservadas del mismo dataset que el entrenamiento (una consulta es correcta solo si ejecuta y devuelve las mismas filas que la referencia en tres bases SQLite con semillas distintas).

| Modelo | Total (625) | Subconjunto difícil (500) | SQL válido |
|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct sin ajustar (4-bit) | 57,6% | 54,0% | 100% |
| Qwen2.5-7B-Instruct sin ajustar (Q4_K_M) | 68,0% | 61,6% | 100% |
| **Este modelo (Q4_K_M)** | **83,4%** | **81,6%** | 100% |

"Difícil" significa que la consulta de referencia usa join, agrupación, ordenación, agregado, operación de conjuntos o más de una tabla.

## Requisitos de hardware

- **VRAM estimada**: 4,7 GB para el archivo GGUF Q4_K_M; el autor indica que cabe en 8 GB de VRAM.
- **GPU recomendadas**: cualquier GPU de consumo con al menos 8 GB de VRAM para el GGUF Q4_K_M; para el adaptador LoRA en precisión completa fusionado con el base se requiere aproximadamente el espacio de un modelo de 7,6B en FP16/BF16 (del orden de 15 GB), aunque este dato no se detalla en la información proporcionada.
- **GPU de consumo**: sí, cabe en tarjetas de 8 GB como RTX 3060 Ti, RTX 4060 Ti o superiores con el cuantizado Q4_K_M.
- **Opciones de despliegue**: Ollama (soporte principal documentado, con `Modelfile` incluido); llama.cpp de forma directa para el GGUF; el adaptador LoRA puede cargarse con las librerías habituales de PEFT sobre el modelo base.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión en datos reales (160 preguntas) | Precisión en distribución (625 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **text2sql-qwen2.5-7b** (este modelo) | 7,6B | No disponible | 16,3% | 83,4% | Apache 2.0 | Hugging Face (GGUF + LoRA) |
| Qwen2.5-7B-Instruct sin ajustar | 7,6B | No disponible en esta ficha | 81,9% | 68,0% | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct sin ajustar | 1,5B | No disponible en esta ficha | No evaluado | 57,6% | Apache 2.0 | Hugging Face |
| Run 2 de este experimento (no publicado) | 7,6B | No disponible | 65,6% | No disponible | No disponible | No publicado |

## Limitaciones y advertencias

- **No usar en bases de datos reales**: el autor lo advierte de forma explícita. Sobre esquemas multitabla realistas obtiene un 16,3% frente al 81,9% del modelo base, y casi la mitad de sus consultas (45,6%) ni siquiera se ejecutan sin error.
- **Falta de generalización**: el ajuste fino provoca joins sobre tablas que la pregunta no menciona e invención de nombres de columna.
- **Errores incluso en distribución**: aproximadamente una de cada seis respuestas es incorrecta en el conjunto de test del propio dataset; los fallos típicos son elegir la columna equivocada o invertir la dirección de la comparación.
- **Sensibilidad a columnas irrelevantes**: con el esquema `instructor (name, salary, dept)`, el modelo puede añadir un `GROUP BY dept` espurio dentro de la subconsulta.
- **Alcance limitado**: solo genera una sentencia `SELECT` de solo lectura en dialecto SQLite; no se entrenó para otras operaciones ni otros dialectos.
- **Idioma**: solo inglés declarado.
- **Sesgos**: no se documentan sesgos específicos en la información proporcionada, más allá del sesgo de distribución hacia esquemas pequeños del dataset `sql-create-context`.
- **Licencia**: Apache 2.0 permite uso comercial, pero las advertencias de calidad hacen desaconsejable su uso en producción.
- **Contexto**: la longitud de contexto efectiva no se especifica en la información disponible; conviene asumir la del modelo base y verificar el comportamiento con esquemas largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hex990/text2sql-qwen2.5-7b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
- Dataset del segundo intento: `gretelai/synthetic_text_to_sql` (referenciado en la model card, sin enlace directo en la información disponible)
- Ollama: https://ollama.com
