# minamahertawfik05/qwen2vl-egyptian-prescription-fine-tuned-model

## Resumen

Qwen2-VL-2B Egyptian Prescription es un ajuste fino del modelo vision-lenguaje Qwen2-VL-2B-Instruct de Alibaba Qwen, especializado en la lectura (OCR) de recetas médicas egipcias, tanto manuscritas como impresas. Lo publica el usuario de Hugging Face minamahertawfik05 y resuelve un problema muy concreto: la transcripción automática de documentos clínicos con caligrafía difícil, nombres de fármacos y dosis numéricas, un caso donde los modelos OCR genéricos suelen fallar.

El modelo parte de una arquitectura transformer multimodal de 2.208.985.600 parámetros (aproximadamente 2,2 mil millones) con capacidad de procesar imagen y texto de entrada y generar texto. Se ha entrenado mediante LoRA (rango 16, alpha 32) con QLoRA de 4 bits usando LLaMA-Factory, y el adaptador se distribuye fusionado en el modelo base en fp16. El repositorio ocupa 4,5 GB en formato safetensors.

Es relevante porque demuestra un flujo de trabajo reproducible de especialización de un VLM pequeño y abierto (licencia Apache 2.0) sobre un dominio sanitario de nicho, con un coste de cómputo bajo y despliegue viable en hardware de consumo. No obstante, se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta, entrenado sobre un dataset privado y sin benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen2-VL), adaptación LoRA fusionada |
| Parámetros totales | 2.208.985.600 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; cutoff de entrenamiento de 1024 tokens |
| Tipos de cuantización | fp16 en el repo; compatible con cuantización de 4 bits (usada en QLoRA durante el entrenamiento) |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2-VL, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje y un mecanismo de fusión de modalidades para tareas de image-text-to-text. El ajuste fino se realizó con LoRA de rango 16 y alpha 32 en modo QLoRA de 4 bits, empleando LLaMA-Factory como framework de entrenamiento. El adaptador resultante se fusionó en los pesos del modelo base y se guardó en fp16.

Los datos de entrenamiento provienen de un conjunto privado de pares imagen-transcripción de recetas (`prescription_sft`), con 5 épocas, tasa de aprendizaje 1e-4 y scheduler coseno. La configuración limita el tamaño máximo de imagen a 200.704 píxeles y la longitud de corte a 1024 tokens. No se especifica el número de ejemplos, la composición del dataset ni si hubo etapas de RLHF o DPO; tampoco se detalla ninguna innovación técnica adicional más allá de la especialización por ajuste supervisado.

## Capacidades

- Generación de texto a partir de imágenes (image-text-to-text) con foco en transcripción OCR de documentos médicos.
- Lectura de recetas manuscritas e impresas en árabe e inglés.
- Extracción de entidades clínicas: nombres de fármacos, dosis y dígitos numéricos.
- Conversación multimodal multi-turno (etiqueta `conversational`).
- Compatible con text-generation-inference y endpoints compatibles.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documentan capacidades de audio ni modo thinking.

## Casos de uso

- Digitalización de recetas en farmacias: el modelo transcribe la imagen de la receta a texto estructurado para alimentar el sistema de dispensación, aprovechando su especialización en caligrafía y nomenclatura farmacológica egipcia.
- Triaje documental en clínicas: conversión masiva de recetas en papel a registros electrónicos antes de la revisión humana, reduciendo el trabajo manual de tecleado.
- Asistencia a la dispensación: verificación cruzada entre la receta escaneada y el fármaco solicitado, con alerta cuando la transcripción del nombre o la dosis presenta baja confianza.
- Investigación retrospectiva: extracción de patrones de prescripción (fármacos frecuentes, dosis habituales) a partir de archivos de recetas históricas digitalizadas.
- Preprocesado para pipelines clínicos: uso del modelo como primer paso OCR dentro de un flujo mayor que después aplique reglas de validación farmacológica y revisión por un farmacéutico.
- Prototipado y evaluación de VLM en dominio sanitario: servir como línea base ligera (2,2 B parámetros, Apache 2.0) para comparar estrategias de ajuste fino con LoRA en tareas de OCR médico.
- Despliegue en entornos con recursos limitados: al ser un modelo de 2,2 B parámetros, puede ejecutarse en una única GPU de consumo para pruebas de concepto de digitalización de recetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 4,5-5 GB solo para pesos, más el overhead del procesador visual y las activaciones; se recomienda un mínimo de 8 GB de VRAM.
- En cuantización de 4 bits, la huella de pesos baja aproximadamente a 1,2-1,5 GB, permitiendo ejecución en GPUs de 6-8 GB.
- GPU recomendadas: NVIDIA RTX 3060/4060 (12/8 GB) o superiores para fp16; A100 o H100 para lotes grandes y alto throughput.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM en fp16, y en GPUs de 6 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers con `Qwen2VLForConditionalGeneration`, text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles; para cuantización ligera, llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2-VL-2B Egyptian Prescription (este modelo) | 2,2 B | no disponible (cutoff de entrenamiento 1024) | OCR de recetas egipcias | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2-VL-2B-Instruct (base) | 2,2 B | no disponible en la información | VLM generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| Otros VLM de ~2 B para OCR médico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de alternativas específicas de OCR médico con las que contrastar métricas.

## Limitaciones y advertencias

- Puede confundir nombres de fármacos, dosis y dígitos; el autor recomienda verificar siempre contra la receta original.
- No es un dispositivo médico: no debe usarse para decisiones clínicas sin revisión humana.
- Entrenado sobre un dataset pequeño y privado, por lo que puede fallar con estilos de caligrafía o maquetaciones no vistas.
- Riesgo de alucinación en la transcripción de textos ambiguos o imágenes de baja calidad.
- Sesgos potenciales derivados de la distribución del dataset privado (posiblemente limitado a un tipo de receta, región o especialidad).
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre errores en contexto sanitario recae en el integrador.
- Modelo con cero descargas y sin validación externa publicada; madurez y robustez no contrastadas.
- Idiomas limitados a árabe e inglés; no se garantiza comportamiento en castellano ni en otras lenguas.

## Enlaces

- Hugging Face: https://huggingface.co/minamahertawfik05/qwen2vl-egyptian-prescription-fine-tuned-model
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
