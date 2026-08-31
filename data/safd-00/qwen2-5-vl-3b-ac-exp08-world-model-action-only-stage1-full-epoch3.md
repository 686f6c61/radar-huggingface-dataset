# SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-action-only-stage1-full-epoch3

## Resumen

Este modelo es un checkpoint de fine-tuning completo (full fine-tuning) sobre Qwen/Qwen2.5-VL-3B-Instruct, desarrollado por el usuario SaFD-00. Forma parte de una serie de experimentos de ablación denominados AC_EXP08, cuyo objetivo es medir el efecto neto del world modeling en un pipeline de agente visual. Concretamente, esta variante es la condición de control "action-only" de la etapa 1 (stage1): se entrena únicamente con 10.000 muestras de acciones, sin supervisión de predicción de estado, mientras que el run principal (`SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch3`) entrena con 40.000 muestras de estado más 10.000 de acciones.

El modelo conserva la arquitectura vision-language de Qwen2.5-VL-3B-Instruct (3.754 millones de parámetros) y está orientado a tareas de agente que requieren interpretación visual de interfaz (coordenadas absolutas de píxel, esquema XML Cerebra). Se entrenó durante 3 épocas completas (checkpoint 471) con la librería llama-factory. Su relevancia radica en que permite aislar la contribución del world modeling frente al aprendizaje puramente conductual (action-only) en agentes de interfaz gráfica, un problema central en el desarrollo de agentes autónomos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (vision-language transformer, decoder-only) |
| Parametros totales | 3.754.622.976 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del base: 128K tokens para Qwen2.5-VL-3B-Instruct) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin GGUF publicados) |
| Idiomas soportados | no disponibles (el base soporta multilenguaje, pero no se especifica para este checkpoint) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es Qwen2.5-VL-3B-Instruct, un modelo denso de 3.754 millones de parámetros con codificador visual y decodificador transformer. El fine-tuning se realizó con la técnica full fine-tuning (todos los parámetros actualizados) mediante llama-factory, durante 3 épocas completas (checkpoint 471). El dataset de entrenamiento es `IWM-AC_EXP08_stage1_train_action_only`, compuesto por 10.000 muestras de acciones anotadas en coordenadas absolutas de píxel (840×1876, con un presupuesto de imagen de 1.605.632 tokens) y esquema XML Cerebra (`data-bbox` / `aria-label`). No se aplicó supervisión de predicción de estado, a diferencia del run principal que sí incluye 40.000 muestras de estado. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al fine-tuning supervisado.

## Capacidades

- Generación de acciones de agente sobre interfaces gráficas: dado un screenshot, el modelo produce coordenadas de píxel y anotaciones XML para interactuar con elementos de UI.
- Interpretación de esquema XML Cerebra: comprende atributos `data-bbox` y `aria-label` para localizar elementos interactivos.
- Procesamiento de imágenes de alta resolución: soporta presupuestos de imagen amplios (1.605.632 tokens) para capturar detalles finos de interfaz.
- Razonamiento visual básico heredado de Qwen2.5-VL-3B-Instruct: comprensión de escenas, OCR, y descripción de imágenes.
- Capacidad conversacional multimodal: al estar basado en el instruct base, conserva habilidades de diálogo imagen-texto.
- No se especifican capacidades de tool calling, function calling ni agentes multi-step más allá del formato de acción entrenado.

## Casos de uso

- Investigación en ablación de world modeling: este checkpoint sirve como condición de control para comparar el efecto de la predicción de estado frente al aprendizaje puramente conductual en agentes de UI. Un investigador puede evaluar ambos modelos (action-only vs. world-model) sobre el mismo benchmark de agente para cuantificar la contribución del world modeling.
- Automatización de pruebas de interfaz: el modelo puede generar secuencias de clics y acciones sobre una aplicación web o móvil a partir de capturas de pantalla, útil para pipelines de testing visual automatizado.
- Desarrollo de agentes de navegación web: al producir coordenadas absolutas y anotaciones XML, puede integrarse en sistemas que controlan un navegador para completar tareas como rellenar formularios o navegar menús.
- Accesibilidad: dado que comprende `aria-label`, podría usarse para generar descripciones de acciones accesibles o auditar la accesibilidad de una interfaz.
- Benchmarking de modelos de agente visual: como checkpoint de referencia para comparar arquitecturas o estrategias de entrenamiento en entornos de interfaz gráfica.
- Estudio de generalización en agentes: al ser un modelo pequeño (3B), permite experimentos de bajo coste computacional para probar hipótesis sobre aprendizaje de acciones antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de evaluación (como accuracy de acciones, tasa de éxito en tareas, ni comparativas con el run principal o el base) en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,5 GB en FP16 (3.754 millones de parámetros × 2 bytes). Con cuantización INT8 (~3,8 GB) o INT4 (~1,9 GB) podría reducirse sustancialmente, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: una RTX 3090/4090 (24 GB) o superior para FP16 con margen de contexto amplio. Para cuantización ligera, una RTX 3060 (12 GB) podría ser suficiente.
- Cabe en GPU de consumo: sí, en FP16 con GPUs de 16 GB o más; con cuantización, en GPUs de 8 GB.
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) y Ollama (con conversión previa). El tag `endpoints_compatible` y `text-generation-inference` sugieren compatibilidad con TGI.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo 3B en FP16 en una RTX 4090 suele generar entre 50-100 tokens/s, pero no hay datos específicos para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch3 (run principal) | 3,75B | no disponible | World modeling (state 40K + action 10K) | no disponible |
| SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch1 | 3,75B | no disponible | World modeling, época 1 | no disponible |
| Qwen/Qwen2.5-VL-3B-Instruct (base) | 3,75B | 128K | Modelo general vision-language | Apache 2.0 (Qwen) |
| Este modelo (action-only) | 3,75B | no disponible | Solo acciones, sin world modeling | no disponible |

La comparativa directa más relevante es contra el run principal (world-model) del mismo experimento, ya que comparten hiperparámetros y solo difieren en la inclusión de datos de estado. Frente al base, este checkpoint está especializado en acciones de UI pero pierde generalidad.

## Limitaciones y advertencias

- Modelo de investigación, no listo para producción: es un checkpoint de ablación con fines experimentales, no un modelo pulido para uso comercial.
- Licencia no especificada: el autor no indica la licencia, lo que genera incertidumbre legal para uso comercial o redistribución.
- Sin benchmarks publicados: no hay evidencia de rendimiento más allá de la finalización del entrenamiento.
- Especialización limitada: entrenado solo con 10.000 muestras de acciones, puede tener baja generalización a interfaces fuera del dominio de entrenamiento.
- Riesgo de alucinación de coordenadas: al no tener world modeling, el modelo puede generar acciones plausibles pero incorrectas para el estado actual de la interfaz.
- Dependencia del esquema XML Cerebra: si el entorno de inferencia no usa este esquema, el rendimiento puede degradarse significativamente.
- Sin información sobre sesgos: no se documentan sesgos potenciales del dataset de entrenamiento.
- Fecha de creación futura: el modelo está fechado en 2026, lo que sugiere que puede ser un artefacto experimental reciente con soporte comunitario limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-action-only-stage1-full-epoch3
- Run principal (world-model, epoch 3): https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch3
- Run principal (world-model, epoch 1, vía FriendliAI): https://friendli.ai/models/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch1
- Modelo base Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Blog de Qwen2.5-VL: https://qwen.ai/blog?id=qwen2.5-vl
- Repo de Qwen2.5 (referencia de la familia): https://github.com/mx4ai/qwen2.5
