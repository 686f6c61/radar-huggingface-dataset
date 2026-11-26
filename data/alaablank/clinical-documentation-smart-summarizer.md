# AlaaBlank/clinical-documentation-smart-summarizer

## Resumen
El modelo `AlaaBlank/clinical-documentation-smart-summarizer` es un adaptador LoRA de tipo PEFT entrenado sobre `google/flan-t5-small` para la tarea de resumen de notas clínicas sintéticas en inglés. Lo desarrolla el usuario AlaaBlank como proyecto académico individual, y su propósito es explorar la adaptación de modelos secuencia-a-secuencia a la summarización de documentación clínica manteniendo información clínicamente relevante. Se trata de un prototipo educativo, no de un sistema validado para uso clínico.

El modelo parte de la arquitectura T5 (encoder-decoder transformer) en su variante small de FLAN-T5, con aproximadamente 77 millones de parámetros en el modelo base. El adaptador LoRA se entrena con rango 8, alpha 16 y dropout 0,1 sobre los módulos de atención `q` y `v`, y se distribuye como pesos safetensors compatibles con la librería transformers y PEFT.

Su relevancia es limitada y estrictamente académica: sirve como ejemplo de flujo de trabajo de fine-tuning paramétricamente eficiente (PEFT/LoRA) sobre un modelo pequeño y como referencia metodológica para experimentos de summarización clínica. No debe confundirse con un modelo de producción ni utilizarse con datos de pacientes reales. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB según la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5, variante FLAN-T5-small) con adaptadores LoRA |
| Parametros totales | No disponible en la informacion (modelo base `google/flan-t5-small`, aproximadamente 77 M; el adaptador LoRA anade un numero reducido de parametros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como especificacion oficial; la configuracion de entrenamiento usa longitud maxima de entrada de 512 tokens y longitud objetivo de resumen de 128 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | other (licencia no estandar; ver limitaciones) |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT y transformers) |

## Arquitectura y entrenamiento
El modelo base es FLAN-T5-small, un transformer encoder-decoder de la familia T5 con instruction tuning previo (FLAN). Sobre él se aplica un adaptador LoRA con rango `r=8`, alpha 16, dropout 0,1 y módulos objetivo `q` y `v` de la atención. El entrenamiento se realizó con PEFT sobre un dataset sintético de 500 pares de nota clínica y resumen de referencia en inglés, repartidos en 350 de entrenamiento, 75 de validación y 75 de test con semilla fija 42. Las notas cubren seis especialidades: Medicina de Urgencias (100), Medicina Interna (100), Cirugía General (80), Pediatría (70), Obstetricia y Ginecología (50) y Cuidados Intensivos (100).

La configuración de entrenamiento fue de 3 épocas, batch size 4, acumulación de gradiente de 2 pasos, norma máxima de gradiente 1,0, longitud máxima de entrada de 512 tokens y longitud objetivo de resumen de 128 tokens. Se ejecutaron tres experimentos: dos con FLAN-T5 y learning rates de 2e-4 (A) y 1e-4 (B), y uno con mT5-small y learning rate 2e-4 (C). No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre pares nota-resumen. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá del recuento por especialidad.

## Capacidades
- Generación de resúmenes extractivos/abstractivos de notas clínicas sintéticas en inglés, con salida de hasta 128 tokens.
- Compresión de texto clínico manteniendo (según el autor) información clínicamente relevante, aunque con limitaciones reconocidas de compresión insuficiente y omisión de detalles.
- Funcionamiento como adaptador PEFT sobre el modelo base `google/flan-t5-small`, lo que permite cargarlo junto al modelo base y su tokenizador.
- Capacidad multilingüe: no disponible; el modelo está declarado únicamente para inglés.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Comparación baseline vs. LoRA: el repositorio permite reproducir la comparación entre el modelo base y el adaptador, lo que constituye su principal valor metodológico.

## Casos de uso
- Experimentación académica en summarización clínica: el adaptador sirve para reproducir y comparar el efecto de LoRA frente al baseline FLAN-T5 en un conjunto de test sintético, usando ROUGE-1/2/L como métrica de solapamiento textual.
- Docencia y formación en PEFT: permite ilustrar un flujo completo de fine-tuning paramétricamente eficiente (carga de modelo base, aplicación de adaptador, entrenamiento con 3 épocas y evaluación con ROUGE) en un entorno de Google Colab.
- Pruebas de concepto con datos sintéticos: útil para validar pipelines de preprocesado de notas clínicas y de generación de resúmenes antes de abordar datos reales con las salvaguardas adecuadas.
- Benchmarking metodológico de adaptadores LoRA: al incluir tres experimentos (A, B, C) con distintos learning rates y modelos base, permite estudiar la sensibilidad del resultado a hiperparámetros en tareas de summarización de dominio específico.
- Evaluación cualitativa de resúmenes: la hoja de revisión cualitativa sobre 15 ejemplos (precisión clínica, preservación de información, concisión y control de información no respaldada) puede reutilizarse como plantilla en otros proyectos académicos.
- Comparación de arquitecturas seq2seq en dominio clínico sintético: la inclusión de mT5-small como experimento C permite contrastar el comportamiento de un modelo multilingüe frente a uno específicamente instruction-tuned en inglés sobre el mismo dataset.

## Benchmarks y rendimiento
Resultados ROUGE reportados por el autor sobre el conjunto de test reservado (75 registros sintéticos):

| Modelo / experimento | ROUGE-1 | ROUGE-2 | ROUGE-L |
|---|---|---|---|
| FLAN-T5 baseline | 0,7133 | 0,5154 | 0,6402 |
| FLAN-T5 LoRA A (lr 2e-4) | 0,7987 | 0,5969 | 0,7329 |
| FLAN-T5 LoRA B (lr 1e-4) | 0,7992 | 0,5968 | 0,7334 |
| mT5 baseline | 0,0247 | 0,0063 | 0,0240 |
| mT5 LoRA C (lr 2e-4) | 0,0694 | 0,0290 | 0,0649 |

Los dos experimentos FLAN-T5 con LoRA obtienen resultados muy similares; el experimento B es ligeramente superior en ROUGE-1 y ROUGE-L, mientras que el A lo es en ROUGE-2. El autor advierte explícitamente que ROUGE mide solapamiento textual y no establece corrección clínica, completitud ni seguridad. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un adaptador sobre `google/flan-t5-small` (aproximadamente 77 M de parámetros), la huella es muy reducida y cabe holgadamente en GPU consumer, aunque no se documentan cifras concretas.
- GPU recomendadas: no disponible; por el tamaño del modelo base, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería suficiente en la práctica, si bien esta afirmación no está respaldada por mediciones publicadas en la información disponible.
- Cabe en GPU consumer: sí, por el tamaño del modelo base, aunque no se aportan cifras de VRAM medidas.
- Opciones de despliegue: transformers junto con PEFT para cargar el adaptador sobre el modelo base y su tokenizador; el autor remite al cuaderno del proyecto para el flujo exacto de carga e inferencia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clinical-documentation-smart-summarizer (este) | Adaptador LoRA sobre FLAN-T5-small (~77 M base) | 512 tokens de entrada en entrenamiento | ROUGE-L 0,7334 en test sintético (experimento B) | other | Hugging Face, 0 descargas |
| google/flan-t5-small (baseline) | ~77 M | 512 tokens | ROUGE-L 0,6402 en el mismo test sintético | Apache 2.0 (modelo base) | Hugging Face, ampliamente disponible |
| google/mt5-small (experimento C) | ~300 M | 512 tokens en este experimento | ROUGE-L 0,0649 tras LoRA en el mismo test | Apache 2.0 (modelo base) | Hugging Face, ampliamente disponible |
| Modelos de summarización clínica de mayor escala | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a los modelos efectivamente evaluados por el autor; no se dispone de datos de benchmarks de terceros para establecer comparaciones adicionales.

## Limitaciones y advertencias
- El dataset es sintético y de solo 500 ejemplos, por lo que puede no representar la diversidad de la documentación clínica real.
- Algunas salidas mostraron compresión insuficiente, omisión de detalles o frases incompletas, según el propio autor.
- Las puntuaciones ROUGE miden similitud textual y no deben interpretarse como prueba de precisión clínica, completitud ni seguridad.
- El modelo no ha sido validado con datos de pacientes reales ni en flujos de trabajo clínicos.
- La revisión cualitativa se limita a 15 ejemplos, lo que reduce su alcance y representatividad.
- Uso fuera de alcance explícitamente prohibido por el autor: registros de pacientes reales, información de salud identificable, diagnóstico, recomendaciones de tratamiento, triaje o toma de decisiones clínicas, y sustitución de la revisión por un profesional sanitario cualificado.
- Licencia `other`: no se especifican los términos exactos de uso comercial; debe consultarse la model card y el repositorio antes de cualquier uso más allá del académico.
- El dataset no tiene una licencia de redistribución abierta asignada, lo que limita su reutilización.
- El repositorio no registra descargas ni likes, y el tamaño reportado es de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que la información está incompleta.
- Riesgo de alucinación: no cuantificado en la información disponible, pero relevante en dominio clínico y agravado por el tamaño reducido del modelo base y del dataset.

## Enlaces
- Hugging Face: https://huggingface.co/AlaaBlank/clinical-documentation-smart-summarizer
- Modelo base FLAN-T5-small: https://huggingface.co/google/flan-t5-small
- Modelo base mT5-small: https://huggingface.co/google/mt5-small
- Paper de T5 (Raffel et al.): https://arxiv.org/abs/1910.10683
- Paper de FLAN (Wei et al.): https://arxiv.org/abs/2109.01652
- Paper de LoRA (Hu et al.): https://arxiv.org/abs/2106.09685
- Librería PEFT: https://github.com/huggingface/peft
- Librería Transformers: https://github.com/huggingface/transformers
