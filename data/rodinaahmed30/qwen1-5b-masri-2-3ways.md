# rodinaahmed30/qwen1.5b-masri-2-3ways

## Resumen

`rodinaahmed30/qwen1.5b-masri-2-3ways` es un adaptador LoRA publicado en Hugging Face por el usuario rodinaahmed30 sobre el modelo base Qwen2.5-1.5B-Instruct de Alibaba. El nombre sugiere un ajuste orientado al dialecto árabe masri (egipcio) con una configuración de entrenamiento en "2-3 vías", aunque la model card no documenta ni el propósito, ni los datos, ni la metodología empleados.

El repositorio contiene únicamente los pesos del adaptador en formato safetensors (1,8 GB en total), generados con LlamaFactory y la librería PEFT 0.18.1. No se trata de un modelo completo, sino de un delta que debe cargarse junto al checkpoint original de Qwen2.5-1.5B-Instruct mediante `PeftModel`. La relevancia práctica es limitada: cero descargas, cero likes, licencia no declarada y una model card que es la plantilla vacía de Hugging Face sin rellenar.

Para evaluar su utilidad real habría que cargarlo y compararlo contra el modelo base en tareas de árabe egipcio, algo que el autor no ha documentado. A efectos de producción, debe tratarse como un experimento personal sin garantías de calidad ni de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | No disponible para el adaptador; modelo base: 1.540 millones (1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens (dato del modelo base, no confirmado para el adaptador) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors (probablemente fp16/bf16). El modelo base admite cuantizaciones GPTQ, AWQ y GGUF de la comunidad |
| Idiomas soportados | No disponibles. El nombre sugiere árabe egipcio (masri); el modelo base es multilingüe (29 idiomas según Qwen) |
| Licencia | No disponible (ni en la model card ni en los metadatos del repo) |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con LlamaFactory sobre Qwen2.5-1.5B-Instruct. No se especifican el rango (r), alpha, dropout, módulos objetivo ni el número de pasos de entrenamiento. Tampoco se documentan los datos: el sufijo "masri" apunta a árabe egipcio y "2-3ways" podría referirse a una estrategia de entrenamiento en varias etapas o a la combinación de dos o tres fuentes de datos, pero es una inferencia a partir del nombre, no un dato confirmado.

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only con atención por grupos de consultas (GQA), RoPE y ventana de contexto nativa de 32K tokens, preentrenado por Alibaba sobre 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias. El adaptador hereda esa arquitectura; su única contribución es el delta LoRA. No hay información sobre hiperparámetros, precisión mixta ni hardware de entrenamiento.

## Capacidades

- Generación de texto conversacional en el idioma del ajuste (presumiblemente árabe egipcio), aunque sin evaluación publicada.
- Razonamiento básico, matemáticas sencillas y generación de código heredados del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de tool calling y function calling heredado del modelo base (Qwen2.5-Instruct incluye plantillas para ello), no verificado tras el ajuste.
- Capacidad multilingüe del modelo base (29 idiomas), potencialmente degradada por el ajuste fino en un dialecto concreto.
- No dispone de visión, audio ni modo de razonamiento extendido.
- No hay evidencia de que el adaptador conserve las capacidades de agente multi-paso del modelo base; el ajuste puede haberlas erosionado.

## Casos de uso

- Experimentación académica con dialectos árabes: cargar el adaptador sobre Qwen2.5-1.5B-Instruct con `PeftModel.from_pretrained` y comparar respuestas en árabe egipcio frente al modelo base para medir el efecto del ajuste.
- Prototipado de chatbots en árabe coloquial: usar el adaptador como punto de partida en un entorno de investigación, siempre con evaluación humana, dado que no hay métricas publicadas.
- Reproducción de pipelines LlamaFactory: el repo sirve como ejemplo de artefacto generado con esa herramienta y PEFT 0.18.1 para quienes quieran replicar el flujo.
- Fine-tuning incremental: partir del adaptador como inicialización para un ajuste posterior con más datos etiquetados de árabe egipcio.
- Estudio de olvido catastrófico: evaluar cuánto se degradan las capacidades originales del modelo base (código, matemáticas, inglés) tras el ajuste LoRA.
- Docencia sobre PEFT: ilustrar cómo se publica y se carga un adaptador LoRA en Hugging Face, incluidos los metadatos mínimos que debería llevar una model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: el archivo pesa 1,8 GB, pero debe cargarse junto al modelo base. En fp16, el conjunto completo ocupa aproximadamente 3,1 GB de pesos (1,5B × 2 bytes) más el delta LoRA y el overhead de activaciones.
- GPU consumer: cabe holgadamente en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090; también en GPUs de 8 GB si se cuantiza el modelo base a 8 bits o 4 bits.
- GPU de datacenter: A100, H100 o L40S sobredimensionadas para este tamaño; útiles solo para servir muchas réplicas en paralelo.
- Despliegue: transformers + PEFT es la vía natural; para mayor rendimiento puede fusionarse el adaptador (`merge_and_unload`) y exportarse a vLLM, TGI o llama.cpp (convirtiendo previamente a GGUF). Ollama requeriría el GGUF fusionado.
- Latencia y throughput: no disponibles. Como referencia orientativa del modelo base de 1,5B en una RTX 4090, cabría esperar decenas de tokens por segundo, pero no hay medición del adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen1.5b-masri-2-3ways (este) | 1,5B + LoRA | No disponible | No disponible | Hugging Face, 0 descargas | Sin documentación ni evaluación |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, benchmarks publicados por Alibaba |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 tokens | Apache 2.0 (con condiciones para algunos tamaños) | Hugging Face | Alternativa de mayor calidad si hay VRAM |
| Adaptadores LoRA comunitarios para árabe (p. ej. familia "AraBERT"/"Jais-adapted") | Variable | Variable | Variable | Hugging Face | Ecosistema disperso; conviene comparar con evaluaciones en dialecto |

No hay datos de rendimiento del adaptador que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Model card vacía: no documenta datos de entrenamiento, hiperparámetros, evaluación ni uso previsto; imposible auditar el ajuste.
- Licencia no declarada: no se puede asumir uso comercial. El modelo base Qwen2.5-1.5B-Instruct es Apache 2.0, pero el adaptador no especifica términos propios.
- Riesgo de olvido catastrófico: un ajuste LoRA en un dialecto concreto puede degradar las capacidades multilingües, de código y de razonamiento del modelo base.
- Riesgo de alucinación: inherente a un modelo de 1,5B; sin evaluación no hay forma de acotarlo.
- Idiomas: si el ajuste se centró en árabe egipcio, el rendimiento en árabe estándar moderno y en otros idiomas puede haberse reducido.
- Cero tracción: 0 descargas y 0 likes indican que el artefacto no ha sido validado por la comunidad.
- Sin garantía de reproducibilidad: no se indica la versión exacta del modelo base, la semilla ni el script de entrenamiento.
- No apto para producción sin una evaluación propia previa en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rodinaahmed30/qwen1.5b-masri-2-3ways
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio LlamaFactory: https://github.com/hiyouga/LLaMA-Factory
- Librería PEFT: https://github.com/huggingface/peft
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700
