# JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-paramopama-seed42

## Resumen

Este modelo es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz como parte de la matriz de investigación `ner-pt-generative-2026-f1-v1`. Se basa en el modelo Qwen3.5-0.8B, una versión compacta de la familia Qwen, y está diseñado para extraer entidades mediante generación estructurada con salida JSON restringida.

El adaptador se entrena con precisión BF16 y LoRA sobre una revisión exacta del modelo base, y se selecciona por F1 end-to-end en validación. Su relevancia radica en ofrecer una alternativa ligera y reproducible para NER en portugués, con un protocolo de inferencia canónico definido (vLLM, temperatura 0, JSON restringido) y métricas de validez estructural muy altas. Está pensado para investigación y experimentación controlada, no para decisiones autónomas de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-0.8B) con adaptador LoRA |
| Parametros totales | no disponible (modelo base: 0.8B; adaptador LoRA: no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16; inferencia con vLLM) |
| Idiomas soportados | Portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | PEFT (adaptador LoRA) sobre safetensors del modelo base |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen3.5-0.8B, un transformer generativo de 0.8 mil millones de parametros. El entrenamiento se realizo en precision BF16 con LoRA, sobre el dataset paramopama, con semilla 42. La seleccion del checkpoint se hizo por F1 end-to-end en validacion, sin usar el split de test. La inferencia canonica emplea vLLM con temperatura 0 y generacion restringida a JSON con el esquema `labels_and_tokens`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Reconocimiento de entidades nombradas generativo en portugues, con salida estructurada en JSON.
- Generacion de etiquetas y tokens de entidades de forma conjunta (esquema `labels_and_tokens`).
- Alta validez estructural de las salidas (0.9984 en el split de test de paramopama).
- Inferencia determinista con temperatura 0, adecuada para evaluacion reproducible.
- Compatible con el ecosistema PEFT y vLLM para despliegue controlado.
- No se reportan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Investigacion en NER para portugues: permite comparar esquemas de anotacion y evaluar la generacion estructurada frente a metodos clasicos de token classification.
- Extraccion de entidades en corpus academicos o periodisticos en portugues, con salida JSON lista para postprocesado.
- Evaluacion de robustez de modelos generativos pequenos en tareas de etiquetado de secuencias.
- Experimentacion con generacion restringida (constrained decoding) y esquemas de salida personalizados.
- Prototipado de pipelines de extraccion de informacion en portugues con requisitos de baja latencia y hardware modesto.
- Reproduccion de experimentos cientificos: el repositorio incluye manifiestos, hashes y predicciones congeladas para auditoria.

## Benchmarks y rendimiento

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| paramopama (test) | 0.8841 | 0.8875 | 0.8858 | 0.9984 |

Los resultados corresponden a un unico seed (42) y a splits congelados. No se han publicado comparaciones con otros modelos en la informacion disponible. La model card advierte que estos valores no deben interpretarse como evidencia de rendimiento general fuera de estos corpus.

## Requisitos de hardware

- VRAM estimada: al ser un modelo base de 0.8B con LoRA, puede ejecutarse en GPUs consumer con 4-6 GB de VRAM en cuantizacion ligera, aunque no se especifican cuantizaciones oficiales.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090 o superiores; tambien A10G o A100 para despliegue con vLLM.
- Inferencia en CPU posible con llama.cpp si se convierte el modelo a GGUF, aunque no se proporciona soporte oficial.
- Opciones de despliegue: vLLM (canonico), PEFT con transformers, FriendliAI (servicio externo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparaciones directas publicadas. Existen otros adaptadores de la misma matriz de investigacion sobre Qwen3.5-2B y Qwen3.5-4B (por ejemplo, `ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed42` y `ner-pt-f1-v1-qwen35-4b-specific-paramopama-seed3407`), que probablemente ofrezcan mayor capacidad pero con mayores requisitos de hardware. No hay datos de rendimiento comparativo en la informacion disponible.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente validos pero semanticamente incorrectos.
- Los resultados solo son validos para los splits congelados y el seed 42; la incertidumbre entre semillas requiere completar la matriz de tres semillas.
- No validado para decisiones de alto riesgo ni uso autonomo.
- Los esquemas de anotacion difieren entre corpus; el solapamiento de texto puede afectar a las estimaciones.
- La licencia no esta especificada; se debe revisar la licencia del dataset paramopama y del modelo base Qwen3.5-0.8B antes de uso comercial.
- Requiere cargar el adaptador con la revision exacta del modelo base indicada en la model card para reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-paramopama-seed42
- Adaptador hermano (2B, seed 3407): https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed3407
- Adaptador hermano (4B, seed 3407): https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-paramopama-seed3407
- Despliegue en FriendliAI (2B, seed 42): https://friendli.ai/models/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed42
- Despliegue en FriendliAI (4B, seed 3407): https://friendli.ai/models/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-lener-br-seed3407
- Repositorio de Qwen3.6 (familia de modelos base): https://github.com/QwenLM/Qwen3.6
