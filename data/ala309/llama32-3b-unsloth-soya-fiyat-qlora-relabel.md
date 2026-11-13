# Ala309/llama32-3b-unsloth-soya-fiyat-qlora-relabel

## Resumen

`Ala309/llama32-3b-unsloth-soya-fiyat-qlora-relabel` es un adaptador LoRA (PEFT) publicado por el usuario Ala309 sobre el modelo base `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, una versión cuantizada a 4 bits en formato bitsandbytes del Llama 3.2 3B Instruct de Meta. El nombre del repositorio sugiere un ajuste fino orientado a un dominio concreto (posiblemente precios de soja y fertilizantes, a juzgar por "soya-fiyat", del turco "soya fiyat", precio de la soja), aunque la model card no documenta el propósito real del entrenamiento. El adaptador ocupa 0,1 GB y se distribuye en formato safetensors compatible con la librería PEFT.

El modelo resuelve un caso de personalización sobre una base ya muy extendida: Llama 3.2 3B Instruct, un transformer decoder-only de 3.210 millones de parámetros con ventana de contexto de 128.000 tokens, entrenado por Meta con datos multilingües y optimizado para instrucciones. Al tratarse de un adaptador LoRA cuantizado (QLoRA), no es un modelo completo: requiere cargar el modelo base y aplicar los pesos del adaptador para su uso.

La relevancia es limitada y muy específica: se trata de un experimento de ajuste fino con Unsloth, sin documentación técnica, sin métricas publicadas y sin licencia declarada. Es útil como ejemplo de pipeline QLoRA sobre Llama 3.2 3B, pero no constituye una base fiable para producción sin una evaluación previa del autor o del usuario. La fecha de creación (noviembre de 2026) y el hecho de no tener descargas ni likes indican que es un artefacto reciente y sin validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B Instruct) con adaptador LoRA (PEFT) |
| Parámetros totales | 3.210 millones (modelo base); adaptador LoRA de tamaño no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (según Llama 3.2 3B Instruct) |
| Tipos de cuantización | Base en 4 bits (bnb-4bit); adaptador en safetensors (precisión no disponible) |
| Idiomas soportados | No disponibles en la model card; el modelo base soporta 8 idiomas oficiales (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT); el modelo base en bnb-4bit |
| Librería | peft 0.21.2 |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo base es Llama 3.2 3B Instruct, un transformer decoder-only con 3.210 millones de parámetros, atención por grupos (GQA) y contexto de 128.000 tokens, entrenado por Meta con datos multilingües. Sobre esta base se aplica un adaptador LoRA entrenado con Unsloth, una librería optimizada para fine-tuning eficiente en memoria. El adaptador se distribuye como pesos PEFT en safetensors, y el modelo base referenciado está cuantizado a 4 bits con bitsandbytes, lo que indica un flujo de QLoRA (fine-tuning de bajo rango sobre pesos cuantizados).

La model card no aporta información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, hiperparámetros (rango LoRA, alpha, dropout, learning rate), ni sobre si se aplicó RLHF, DPO o alguna técnica de alineación adicional. No se documentan innovaciones técnicas más allá del uso de Unsloth y QLoRA. Tampoco se especifica el objetivo del ajuste ni el proceso de etiquetado ("relabel" en el nombre sugiere una reetiquetación de datos, pero no se detalla).

## Capacidades

- Generación de texto conversacional heredada de Llama 3.2 3B Instruct.
- Razonamiento básico y respuesta a instrucciones en inglés y otros idiomas del modelo base.
- Generación de código y matemáticas a nivel de un modelo de 3B, sin garantías específicas.
- Soporte de tool calling y function calling heredado del modelo base (Llama 3.2 Instruct incluye plantillas para ello).
- Capacidades multilingües limitadas a los idiomas del modelo base; el adaptador no documenta idiomas adicionales.
- No se documentan capacidades de visión, audio ni modo "thinking".
- El adaptador está orientado, según el nombre, a un dominio específico (precios de soja/fertilizantes), pero no hay evidencia documentada de su rendimiento en ese dominio.

## Casos de uso

- Experimentación con QLoRA sobre Llama 3.2 3B: el adaptador sirve como ejemplo de pipeline Unsloth + PEFT para fine-tuning de bajo rango en una GPU de consumo.
- Prototipado de asistentes de dominio agrícola: si el ajuste está orientado a precios de soja, podría usarse como base para un chatbot de consulta de cotizaciones, previa validación con datos reales.
- Evaluación de adaptadores comunitarios: útil para comparar la calidad de un LoRA no documentado frente al modelo base en tareas de instrucción.
- Fine-tuning incremental: el adaptador puede servir como punto de partida para un segundo ajuste con datos propios, dado su bajo tamaño (0,1 GB).
- Docencia y formación: ejemplo práctico de cómo se publica un adaptador PEFT y se referencia un modelo base cuantizado.
- Pruebas de integración con PEFT/Transformers: permite validar flujos de carga de adaptadores sobre bases bnb-4bit en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits requiere aproximadamente 2-3 GB de VRAM; el adaptador añade un consumo marginal (0,1 GB en disco, menos en VRAM).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para la base cuantizada; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 4-6 GB de VRAM o más (por ejemplo, RTX 3050, RTX 3060, RTX 4060).
- Opciones de despliegue: Transformers + PEFT (carga del adaptador sobre el base bnb-4bit), llama.cpp/Ollama si se convierte el modelo fusionado a GGUF, vLLM y TGI para servir el modelo fusionado.
- Latencia y throughput: no disponibles; dependerán de la GPU y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ala309/llama32-3b-unsloth-soya-fiyat-qlora-relabel | 3,21B (base) + LoRA | 128.000 | No disponible | Hugging Face (0 descargas) | Adaptador no documentado |
| Llama-3.2-3B-Instruct (Meta) | 3,21B | 128.000 | Llama 3.2 Community License | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 | Apache 2.0 | Hugging Face | Alternativa con licencia permisiva |
| Phi-3.5-mini-instruct | 3,8B | 128.000 | MIT | Hugging Face | Alternativa de Microsoft con contexto largo |

## Limitaciones y advertencias

- Model card prácticamente vacía: sin descripción, sin datos de entrenamiento, sin evaluación ni licencia.
- Licencia no declarada: no se puede garantizar el uso comercial; además, el modelo base Llama 3.2 tiene su propia licencia comunitaria que condiciona la redistribución.
- Riesgo de alucinación inherente a un modelo de 3B, agravado por la falta de evaluación del ajuste.
- El adaptador no documenta idiomas; el dominio "soya-fiyat" sugiere turco, pero no está confirmado ni evaluado.
- Sesgos desconocidos: no se ha realizado ninguna auditoría ni se han publicado análisis de sesgo.
- Sin descargas ni validación comunitaria: no hay evidencia de que el adaptador funcione correctamente.
- El nombre "relabel" sugiere una reetiquetación de datos que no se explica; posible riesgo de degradación del modelo base si el ajuste fue defectuoso.
- No apto para producción sin una evaluación previa por parte del usuario.

## Enlaces

- Hugging Face: https://huggingface.co/Ala309/llama32-3b-unsloth-soya-fiyat-qlora-relabel
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Llama 3.2 (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- Paper de impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
