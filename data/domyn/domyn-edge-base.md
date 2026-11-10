# domyn/Domyn-Edge-Base

## Resumen

Domyn Edge Base es un modelo de lenguaje causal de 3.928.787.968 parámetros (aproximadamente 4B) desarrollado por Domyn. Se trata de un transformer denso decoder-only entrenado desde cero sobre 13 billones de tokens, con un enfoque explícito hacia cargas de trabajo agénticas y contexto largo. Su rasgo más distintivo es que fue entrenado de forma nativa hasta una ventana de 1.048.576 tokens sin recurrir a YaRN ni a escalado de RoPE, con 262.144 tokens como contexto de trabajo recomendado.

El modelo forma parte de una liberación por fases: este repositorio contiene únicamente el checkpoint preentrenado, sin ajuste por instrucciones ni alineación. La primera fase incluyó también una versión SFT (`domyn/Domyn-Edge-SFT`) orientada a conversación y tool calling, y está previsto publicar checkpoints adicionales de post-entrenamiento hasta el modelo final. La propuesta de valor es la apertura completa: pesos, checkpoints intermedios, datos de preentrenamiento y código de entrenamiento, lo que permite auditar y reproducir el modelo, no solo ejecutarlo.

El entrenamiento se realizó íntegramente en infraestructura pública europea con precisión bfloat16. Soporta cinco idiomas principales (inglés, italiano, español, francés y alemán) y ocho adicionales con menor volumen de tokens (portugués, ruso, chino, japonés, árabe, neerlandés, indonesio y turco). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only causal, solo preentrenado |
| Parametros totales | 3.928.787.968 (aproximadamente 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens entrenados; 262.144 recomendados |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, it, es, fr, de (principales); pt, ru, zh, ja, ar, nl, id, tr (secundarios) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos técnicos relevantes: 36 capas, hidden size 2560, feed-forward SwiGLU con dimensión intermedia 9728, vocabulario de 115.272 tokens (115.256 regulares y 16 especiales) con embeddings de entrada y salida atados, normalización sandwich RMSNorm con epsilon 1e-6 y QK normalization parametrizada solo en las claves. Precisión de entrenamiento en bfloat16. Tamaño del repositorio: 7,9 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only con un patrón de atención híbrido. De las 36 capas, 2 son de atención completa al inicio, seguidas de 8 bloques compuestos por 3 capas de sliding-window y 1 de atención completa, y 2 capas de atención completa al final. Las 24 capas de sliding-window usan 32 cabezas de query y 8 de key/value con dimensión de cabeza 64, un span de 1024 tokens y RoPE con base 10.000. Las 12 capas de atención completa usan la misma relación 32/8 pero con dimensión de cabeza 256 y no aplican codificación posicional (NoPE). Esta combinación permite alcanzar contexto de 1M tokens de forma nativa sin mecanismos de escalado posicional externos.

El entrenamiento se realizó desde cero sobre 13 billones de tokens, con una mezcla de mid-training que incluye trayectorias multi-turno de tool calling y coding agéntico. El dataset de preentrenamiento está publicado como `domyn/Domyn-Edge-Pretraining-Mix-8.4T`. No se detalla en la información disponible la composición exacta del corpus, el uso de RLHF o DPO, ni innovaciones como decodificación especulativa. El modelo se distribuye con código personalizado (`trust_remote_code=True`) y arquitectura registrada como `DomynEdgeForCausalLM`.

## Capacidades

- Generación de texto autoregresiva en modo base, sin instrucciones ni alineación.
- Razonamiento y continuación de texto con contexto muy largo: hasta 1.048.576 tokens entrenados y 262.144 recomendados.
- Capacidad multilingüe en 13 idiomas, con cinco lenguas europeas principales (inglés, italiano, español, francés y alemán).
- Base para tool calling y flujos agénticos: la mezcla de mid-training incluye trayectorias multi-turno de tool calling y coding agéntico, aunque al ser un modelo base estas capacidades deben explotarse mediante fine-tuning o prompting adecuado.
- Capacidad de aprendizaje en contexto (in-context learning) gracias a la ventana extendida.
- Punto de partida para preentrenamiento continuado y experimentos de investigación sobre formación de capacidades.
- No incluye, por sí mismo, modo thinking, visión ni audio.

## Casos de uso

- Preentrenamiento continuado sobre dominios verticales: al ser un base model con licencia Apache 2.0 y pesos abiertos, se puede continuar el entrenamiento sobre corpus jurídico, médico o financiero sin restricciones de uso comercial, partiendo de un modelo ya expuesto a 13 billones de tokens.
- Fine-tuning para asistentes conversacionales: sirve como inicialización para SFT y DPO orientados a atención al cliente, con la ventaja de una ventana de 262k tokens que permite incluir historiales largos y documentación de referencia en el mismo contexto.
- Investigación sobre contexto largo: su entrenamiento nativo a 1M tokens sin YaRN lo hace adecuado para estudiar degradación de atención, recuperación de información en posiciones lejanas y comportamiento de capas NoPE frente a sliding-window.
- Desarrollo de agentes con tool calling: aunque el base no está alineado, la mezcla de mid-training con trayectorias agénticas lo convierte en un punto de partida razonable para entrenar modelos que encadenen llamadas a herramientas en varios turnos.
- Análisis de documentos extensos: resumen, extracción de entidades y respuesta a preguntas sobre contratos, expedientes o informes de cientos de miles de tokens, aprovechando el contexto recomendado de 262k.
- Reproducibilidad y auditoría de modelos: al publicarse datos, código y checkpoints intermedios, encaja en proyectos que necesitan trazar el origen de las capacidades del modelo o verificar la composición del corpus de entrenamiento.
- Experimentos de investigación en infraestructura europea: útil para equipos que requieran un modelo entrenado end-to-end en infraestructura pública europea por motivos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8 GB solo para pesos (3,93B parámetros × 2 bytes), más overhead de activaciones y caché KV; el repositorio ocupa 7,9 GB.
- La caché KV crece de forma significativa con contexto largo; a 262.144 tokens el consumo adicional puede ser elevado y depende del número de secuencias concurrentes. No se dispone de cifras oficiales de VRAM para contexto completo.
- GPU recomendadas: no disponible de forma explícita en la información proporcionada. Por tamaño, cabe en GPUs de consumo con al menos 12-16 GB de VRAM para contextos moderados; para contexto largo se recomiendan GPUs de datacenter (A100, H100) sin confirmación oficial.
- Despliegue con Transformers: soportado con `torch==2.13.0` (CUDA 12.9 o 12.6), `transformers==5.16.1`, `accelerate==1.14.0` y `einops==0.8.2`, usando `trust_remote_code=True`.
- Despliegue con vLLM: no soportado en versiones publicadas; requiere instalar desde la rama del PR `vllm-project/vllm#62544`, que sigue `main` y exige PyTorch 2.14 con CUDA 13 y driver NVIDIA 580 o superior. Con drivers anteriores hay que usar Transformers.
- llama.cpp, Ollama y TGI: no disponible (no se mencionan en la información).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Domyn Edge Base | 3,93B | 1.048.576 entrenados / 262.144 recomendados | Apache 2.0 | Transformer denso, entrenado desde cero en infraestructura europea, liberación completa (datos, código, checkpoints) |
| Alternativas de ~4B | no disponible | no disponible | no disponible | No se proporcionan modelos comparables en la información disponible |

No se dispone de datos de benchmarks ni de modelos comparables en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Es un modelo exclusivamente preentrenado: no tiene ajuste por instrucciones ni alineación, por lo que no es adecuado para aplicaciones conversacionales o de cara al usuario sin un post-entrenamiento previo.
- Riesgo de alucinación inherente a un modelo base; no se han publicado evaluaciones de fidelidad factual.
- Sesgos: no se documentan en la información disponible; al entrenarse sobre corpus web multilingüe es esperable que herede sesgos de esos datos, pero no hay análisis publicado.
- Idiomas: cinco lenguas principales con volumen alto de tokens; las otras ocho tienen menor representación, por lo que su rendimiento será previsiblemente inferior.
- Contexto: aunque se entrenó a 1M tokens, el propio autor recomienda 262.144 como ventana de trabajo; usar la ventana completa puede degradar el rendimiento y dispara el consumo de memoria.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base el usuario asume la responsabilidad del fine-tuning y de las salvaguardas posteriores.
- Soporte de ecosistema limitado: vLLM no soporta la arquitectura en versiones publicadas y requiere una rama de PR con CUDA 13 y driver 580+; esto complica el despliegue en producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio.
- No se detallan en la información disponible los datos de composición del corpus, el uso de RLHF/DPO ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/domyn/Domyn-Edge-Base
- Versión SFT: https://huggingface.co/domyn/Domyn-Edge-SFT
- Dataset de preentrenamiento: https://huggingface.co/datasets/domyn/Domyn-Edge-Pretraining-Mix-8.4T
- PR de soporte en vLLM: https://github.com/vllm-project/vllm/pull/62544
- Repositorio de vLLM: https://github.com/vllm-project/vllm
