# josefslerkauk/EuroLLM-1.7B-MediaMix4-LoRA

## Resumen

EuroLLM-1.7B-MediaMix4-LoRA es un experimento de preentrenamiento continuado en dominio checo sobre el modelo base EuroLLM-1.7B, publicado por el usuario josefslerkauk en Hugging Face. El adaptador LoRA se ha entrenado sobre textos de cuatro medios digitales checos (Aeronet, Protiproud, Nová republika y CZ24) con el objetivo de estudiar cómo cambia la verosimilitud del texto y las continuaciones generadas tras la adaptación a un dominio mediático concreto. No es un modelo de chat ni un asistente instruido: es un modelo base de completación de texto.

El repositorio no contiene un modelo fusionado, sino el modelo base congelado en BF16 (sin cuantización) junto con un adaptador LoRA separado en FP32. La carga del modelo raíz devuelve el base original; para obtener la variante adaptada hay que cargar también el directorio `adapters/`. El adaptador tiene rango 8 y se aplica sobre `q_proj` y `v_proj` en las 24 capas del transformer, con un total de 1.656.850.432 parámetros en el modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de adaptación de dominio con LoRA sobre un modelo europeo multilingüe de tamano reducido; por otro, ilustra las precauciones metodológicas necesarias al interpretar este tipo de experimentos (el propio autor advierte que los resultados no establecen precisión factual ni la línea editorial de los medios). La licencia es Apache 2.0, aunque esta no relicencia los artículos fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (EuroLLM-1.7B) con adaptador LoRA |
| Parametros totales | 1.656.850.432 (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (bloques de entrenamiento de 512 tokens objetivo) |
| Tipos de cuantizacion | no disponible; el release usa BF16 sin cuantizacion y adaptador FP32 |
| Idiomas soportados | checo (cs) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); adaptador LoRA en formato MLX, no PEFT |

## Arquitectura y entrenamiento

El modelo base es EuroLLM-1.7B de utter-project (commit `c730cd9b616799ace3c65e927d63191446f59374`), un transformer decoder-only de 1.7B parámetros. Sobre él se aplica un adaptador LoRA de rango 8 con escala MLX 2.0, dropout 0.05, sobre las proyecciones `q_proj` y `v_proj` de las 24 capas del transformer. El entrenamiento usa AdamW con learning rate 0.0001, weight decay 0.01, clipping de norma 1.0 y semilla 20261111.

El corpus de entrenamiento consta de 945 documentos retenidos, con una pasada completa de 2.307.747 tokens objetivo incluyendo EOS. El checkpoint publicado es el paso 4.980, tras 2.306.611 tokens objetivo, seleccionado por NLL de validación. Se usa un BOS/EOS por documento y bloques de 512 tokens objetivo con reinicio de contexto entre bloques. La mezcla es natural y sin ponderar: Aeronet aporta aproximadamente el 43% de los tokens de cuerpo de entrenamiento e incluye artículos más antiguos. La limpieza elimina páginas de consentimiento, texto incompleto de paywall, navegación, promoción repetida y metadatos; se agrupan duplicados exactos y casi duplicados antes del split. El split es por grupo de documento (train/validation/test) y el test no se usa para selección. El runtime es MLX 0.32.0 y mlx-lm 0.31.3.

## Capacidades

- Generación de texto por completación: modelo base, no instruido ni afinado para chat.
- Estudio de verosimilitud y continuaciones tras adaptación a dominio mediático checo.
- Inferencia con el adaptador activado o desactivado para comparación antes/después.
- Cálculo de log-probabilidades de tokens con vocabulario completo a T=1 y normalización FP64.
- Generación de resultados en HTML, JSON, CSV de tokens y CSV de palabras mediante el notebook y el runner incluidos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al checo en este release.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Estudio académico de adaptación de dominio: comparar la distribución de continuaciones del modelo base frente al adaptado sobre textos de medios checos concretos, usando el runner emparejado que verifica que el adaptador desactivado coincide exactamente con el base nativo.
- Análisis de cambio de verosimilitud: medir cómo varía la log-probabilidad de palabras evaluativas o de encuadre mediático antes y después del ajuste, con el objetivo de estudiar sesgos de representación, no de validar hechos.
- Investigación sobre framing mediático: usar el modelo como herramienta exploratoria para generar continuaciones controladas a partir de prefijos y analizar si el dominio de entrenamiento desplaza el léxico hacia términos evaluativos.
- Reproducibilidad de experimentos LoRA: el repositorio incluye hashes SHA-256, manifiesto de paquete y configuración con rutas relativas, lo que permite replicar la carga y verificar la integridad de los tensores en un entorno MLX.
- Docencia y formación en MLX: el notebook de Colab y el runner permiten ejecutar comparaciones antes/después en Apple Silicon (Metal) o en GPU NVIDIA con dependencias MLX/CUDA, sirviendo como ejemplo práctico de adaptadores LoRA en MLX.
- Evaluación de riesgos de alucinación en dominios mediáticos: generar continuaciones y contrastar su verosimilitud frente a la corrección factual, documentando que la probabilidad del modelo no equivale a exactitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el base en BF16 ocupa aproximadamente 3,32 GB en disco; en memoria se requiere espacio adicional para activaciones y caché KV. El adaptador FP32 ocupa 5,52 MB adicionales.
- GPU recomendadas: el autor indica que el mismo motor de inferencia se ha ejecutado en NVIDIA A40 y A4500, y en Apple M2. La compatibilidad con T4 y la ejecución directa en Colab no están verificadas.
- Cabe en GPU de consumo: no confirmado en la información disponible; el tamano de 1.7B en BF16 sugiere que podría caber en GPUs consumer con suficiente VRAM, pero no se aportan pruebas.
- Opciones de despliegue: MLX (mlx-lm 0.31.3, MLX 0.32.0) con `mlx_lm.load` y `adapter_path`; el runner `runtime/run_compare.py`; notebook de Colab. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que distintas GPUs y backends pueden producir logits y continuaciones diferentes, y no se reclama identidad numérica entre hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| EuroLLM-1.7B-MediaMix4-LoRA | 1.656.850.432 (base) | no disponible | cs | Apache 2.0 | safetensors (MLX) + LoRA | Adaptador de dominio mediático, base congelado |
| utter-project/EuroLLM-1.7B | 1.7B (aprox.) | no disponible | multilingüe europeo | no disponible en la información | safetensors | Modelo base original, sin adaptación |
| Alternativas de 1-2B para completación en checo | no disponible | no disponible | cs | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Es un modelo base de completación, no un asistente instruido ni un chat: no debe esperarse un comportamiento conversacional alineado.
- Sesgos conocidos: el corpus se compone de cuatro medios concretos, con Aeronet aportando aproximadamente el 43% de los tokens; la mezcla no está ponderada ni controlada por tamano de corpus, lo que puede introducir sesgos de fuente.
- Riesgo de alucinación: el propio autor advierte que las afirmaciones generadas pueden ser incorrectas y que la verosimilitud, la perplejidad o un desplazamiento hacia léxico evaluativo no establecen precisión factual, cualidades de una persona ni explicaciones causales de representaciones internas.
- Limitaciones de contexto e idioma: el entrenamiento usa bloques de 512 tokens objetivo y el release está orientado al checo; la longitud de contexto efectiva no se documenta.
- Restricciones de licencia: el release usa Apache 2.0, pero esta licencia no relicencia los artículos fuente; los derechos del modelo y código upstream se mantienen bajo sus licencias. Los sitios web identifican las fuentes de entrenamiento y no produjeron ni respaldaron este modelo comunitario.
- Caveats para producción: el adaptador no está fusionado con el base y debe cargarse por separado; el formato es MLX, no PEFT, lo que limita la portabilidad a otros ecosistemas; la identidad numérica entre hardware no está garantizada; los artículos originales no se incluyen en el release.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josefslerkauk/EuroLLM-1.7B-MediaMix4-LoRA
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B
- Notebook de Colab: https://colab.research.google.com/#fileId=https://huggingface.co/josefslerkauk/EuroLLM-1.7B-MediaMix4-LoRA/resolve/main/EuroLLM_Compare.ipynb
- Repositorio de MLX: no disponible en la información proporcionada
- Paper de EuroLLM: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
