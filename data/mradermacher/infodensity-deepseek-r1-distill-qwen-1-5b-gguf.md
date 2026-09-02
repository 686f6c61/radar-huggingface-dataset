# mradermacher/InfoDensity-DeepSeek-R1-Distill-Qwen-1.5B-GGUF

## Resumen

InfoDensity-DeepSeek-R1-Distill-Qwen-1.5B-GGUF es una colección de cuantizaciones GGUF del modelo InfoDensity-DeepSeek-R1-Distill-Qwen-1.5B, preparadas por mradermacher. El modelo base es una variante ajustada de DeepSeek-R1-Distill-Qwen-1.5B, un modelo denso de 1.777 millones de parámetros destilado a partir de DeepSeek-R1 sobre la arquitectura Qwen 2.5. Esta destilación busca conservar las capacidades de razonamiento del modelo original en un formato mucho más ligero y eficiente.

La relevancia de esta ficha radica en que ofrece el modelo en formato GGUF, lo que permite ejecutarlo en CPU y GPU de consumo mediante llama.cpp, Ollama u otros motores compatibles. Esto democratiza el acceso a un modelo de razonamiento matemático y lógico que, en su versión original, requiere más recursos. La licencia MIT permite uso comercial sin restricciones significativas, lo que lo hace atractivo para integraciones en producción.

El modelo está orientado principalmente al razonamiento paso a paso y a tareas matemáticas, con soporte para el idioma inglés. Al ser una cuantización, se pierde algo de precisión respecto al modelo original, pero los tamaños de archivo se reducen drásticamente, desde 3.7 GB en f16 hasta 0.9 GB en Q2_K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen 2.5) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base InfoDensity-DeepSeek-R1-Distill-Qwen-1.5B deriva de DeepSeek-R1-Distill-Qwen-1.5B, que a su vez se construye sobre la arquitectura Qwen 2.5. DeepSeek destiló el conocimiento de su modelo R1 (un modelo de razonamiento con 671 mil millones de parametros en configuracion MoE) en modelos densos mas pequenos, utilizando 800.000 muestras curadas con el propio DeepSeek-R1. El resultado es un modelo de 1.500 millones de parametros que conserva parte de la capacidad de razonamiento paso a paso del modelo original.

La contribucion de amao0o0 con InfoDensity es un ajuste adicional sobre esta base, aunque no se proporcionan detalles especificos sobre el dataset o la metodologia de este ajuste en la informacion disponible. La cuantizacion GGUF realizada por mradermacher es estatica, es decir, no utiliza matrices de importancia (imatrix) ni cuantizacion ponderada, segun indica el propio autor en la model card.

## Capacidades

- Razonamiento paso a paso: el modelo esta disenado para descomponer problemas complejos en pasos logicos, siguiendo la linea de DeepSeek-R1.
- Matematicas: destaca en problemas aritmeticos, algebraicos y de razonamiento cuantitativo, area principal de entrenamiento de la familia R1.
- Generacion de texto: puede producir respuestas coherentes y estructuradas en ingles.
- Razonamiento logico: capacidad para tareas que requieren inferencia y deduccion.
- No se confirma soporte de tool calling ni function calling en la informacion disponible.
- No se confirma soporte de agentes ni multi-step reasoning autonomo mas alla del razonamiento encadenado.
- Multilingue: limitado al ingles, segun la etiqueta de idioma de la model card.
- Sin capacidades de vision ni audio: es un modelo exclusivamente textual.

## Casos de uso

- Asistente educativo de matematicas: el modelo puede guiar a estudiantes en la resolucion de problemas paso a paso, explicando cada etapa del razonamiento. Su tamano reducido permite ejecutarlo en portatiles sin GPU dedicada.
- Generacion de codigo con explicaciones: aunque no esta especializado en programacion, puede generar fragmentos de codigo sencillos y explicar la logica detras de ellos, util para entornos de aprendizaje.
- Chatbot de soporte tecnico basico: con su capacidad de razonamiento, puede diagnosticar problemas simples y ofrecer soluciones estructuradas, integrable en sistemas de atencion al cliente de bajo coste.
- Analisis de datos y calculo: puede procesar conjuntos de datos pequenos y realizar calculos estadisticos basicos, explicando el procedimiento seguido.
- Prototipado rapido de aplicaciones de IA: al ser ligero y con licencia MIT, es ideal para validar conceptos de productos que requieran razonamiento sin invertir en infraestructura costosa.
- Educacion en IA: sirve como modelo de demostracion para ensenar conceptos de razonamiento automatico y cuantizacion, ya que su tamano permite experimentar en hardware modesto.
- Procesamiento de documentos financieros: puede extraer y razonar sobre datos numericos de informes, generando resumenes con calculos verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base DeepSeek-R1-Distill-Qwen-1.5B reporta en su documentacion oficial un rendimiento inferior a modelos mas grandes de la misma familia, pero no se dispone de cifras concretas para esta variante InfoDensity ni para sus cuantizaciones. Se recomienda consultar la pagina de HuggingFace del modelo base para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1 GB y 4 GB segun la cuantizacion elegida. Las versiones Q2_K y Q3_K pueden ejecutarse con menos de 1 GB de VRAM, mientras que f16 requiere unos 4 GB.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) para las cuantizaciones mas altas. Las cuantizaciones bajas pueden ejecutarse incluso en iGPU.
- Compatibilidad con CPU: las cuantizaciones Q4_K_M y superiores funcionan aceptablemente en CPU modernas con 8 GB de RAM, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp y cualquier motor compatible con GGUF. Tambien puede usarse con transformers si se convierte a safetensors.
- Latencia estimada: en una RTX 3060, la generacion de tokens con Q4_K_M suele rondar los 30-50 tokens por segundo. En CPU, la velocidad baja a 5-15 tokens por segundo dependiendo del procesador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|
| InfoDensity-DeepSeek-R1-Distill-Qwen-1.5B (GGUF) | 1.78B | no disponible | MIT | GGUF | Razonamiento y matematicas |
| DeepSeek-R1-Distill-Qwen-1.5B (original) | 1.78B | 128K (segun documentacion de Qwen 2.5) | MIT | safetensors | Razonamiento y matematicas |
| Qwen 2.5-1.5B-Instruct | 1.78B | 32K | Apache 2.0 | safetensors | Instrucciones generales |
| Llama 3.2-1B-Instruct | 1.23B | 128K | Llama 3.2 | safetensors | Instrucciones generales |

La comparativa se basa en datos publicos de los modelos base. La variante InfoDensity anade un ajuste especifico no documentado, por lo que su rendimiento exacto frente a estas alternativas no puede determinarse sin pruebas propias.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente en ingles y con datos de razonamiento, puede mostrar sesgos culturales y linguisticos propios de los datasets de DeepSeek y Qwen.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar respuestas incorrectas con apariencia de validez, especialmente en tareas fuera de su dominio principal.
- Limitaciones de contexto: la longitud de contexto no esta documentada en esta variante, pero se hereda del modelo base Qwen 2.5, que soporta hasta 128K tokens. Sin embargo, las cuantizaciones agresivas pueden degradar la coherencia en contextos largos.
- Idioma limitado: solo se garantiza el ingles. El rendimiento en otros idiomas sera significativamente inferior.
- Cuantizacion estatica: las cuantizaciones no utilizan imatrix, por lo que las versiones de baja precision (Q2_K, Q3_K) pueden mostrar perdidas notables de calidad en tareas de razonamiento complejo.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo base DeepSeek-R1-Distill-Qwen-1.5B deriva de Qwen 2.5, que originalmente se publico bajo Apache 2.0. Se recomienda verificar la compatibilidad de licencias para usos especificos.
- Adecuacion para produccion: aunque es ligero, su rendimiento en tareas generales es limitado comparado con modelos de mayor tamano. No es recomendable para tareas que requieran conocimiento factual extenso o comprension contextual profunda.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/InfoDensity-DeepSeek-R1-Distill-Qwen-1.5B-GGUF
- Modelo base InfoDensity: https://huggingface.co/amao0o0/InfoDensity-DeepSeek-R1-Distill-Qwen-1.5B
- Modelo original DeepSeek-R1-Distill-Qwen-1.5B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/README.md
- Cuantizacion GGUF del modelo original por mradermacher: https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-1.5B-GGUF
- Pagina del modelo en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
