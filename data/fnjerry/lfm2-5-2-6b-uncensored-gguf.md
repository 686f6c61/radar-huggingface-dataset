# fnjerry/LFM2.5-2.6B-Uncensored-GGUF

## Resumen

LFM2.5-2.6B-Uncensored-GGUF es una cuantizacion en formato GGUF del modelo LFM2.5-2.6B-Uncensored, un derivado "abliterado" del modelo base LiquidAI/LFM2.5-2.6B de Liquid AI. El modelo original es un transformer hibrido de 2.697.198.592 parametros disenado para cargas de trabajo agenticas en el borde (edge), con 30 capas (22 bloques de convolucion corta con doble compuerta y 8 capas de atencion GQA), una ventana de contexto de 128K tokens y un vocabulario de 128K. La version "Uncensored" ha sido sometida a un proceso de abliteracion (denominado abliterix Trial 65) que reduce drasticamente la tasa de rechazos del modelo.

Este repositorio concreto, publicado por el usuario fnjerry, contiene cinco niveles de cuantizacion GGUF generados con calibracion imatrix a partir de la version BF16 del modelo abliterado. La calibracion se realizo con 401 fragmentos (aproximadamente 1,6 millones de tokens) del conjunto APEX, y la cuantizacion se efectuo con `llama-quantize --imatrix`. El resultado es un modelo ligero, desplegable en hardware de consumo, orientado a generacion de texto conversacional y tareas de agente.

La relevancia de esta ficha radica en que combina dos tendencias actuales: por un lado, los modelos hibridos eficientes para edge computing con contexto largo; por otro, las tecnicas de abliteracion que eliminan las capas de rechazo del modelo original. Esto lo hace interesante para investigadores que estudian alineamiento y para desarrolladores que necesitan un modelo pequeno sin restricciones de contenido, aunque con implicaciones eticas y de licencia que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 30 capas (22 bloques de convolucion corta con doble compuerta + 8 capas GQA) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | GGUF con calibracion imatrix, cinco niveles (no se detallan los nombres exactos de cada nivel en la informacion disponible) |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (convertido desde BF16) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B emplea una arquitectura hibrida que combina 22 bloques de convolucion corta con doble compuerta (double-gated short-convolution blocks) y 8 capas de atencion con query grouping (GQA). Esta mezcla busca reducir el coste computacional de la atencion tradicional manteniendo la capacidad de modelar dependencias de largo alcance, algo especialmente relevante para una ventana de contexto de 128K tokens en un modelo de solo 2,6B parametros. El vocabulario es de 128K tokens y la plantilla de chat es similar a ChatML, con soporte nativo de razonamiento mediante etiquetas `<think>`.

El proceso de creacion de este repositorio parte del modelo LFM2.5-2.6B-Uncensored en BF16, que a su vez es el resultado de aplicar la tecnica abliterix (Trial 65) al modelo original de Liquid AI y fusionar los flujos resultantes en BF16. Sobre ese BF16 se realizo la conversion a GGUF con soporte de la arquitectura `lfm2` en llama.cpp, seguida de una calibracion imatrix con 401 fragmentos (aproximadamente 1,6 millones de tokens) del conjunto APEX, y finalmente la cuantizacion con `llama-quantize --imatrix` en cinco niveles. No se dispone de informacion sobre el numero total de tokens de entrenamiento del modelo base ni sobre la composicion exacta de su dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 128K tokens.
- Razonamiento nativo mediante modo "thinking" con etiquetas `<think>`.
- Capacidades agenticas: el modelo base esta disenado explicitamente para cargas de trabajo de agente.
- Soporte de tool calling / function calling (se deduce del diseno para cargas agenticas del modelo base, aunque no se detalla en la informacion disponible).
- Capacidades multilingues: no se especifican los idiomas soportados en la informacion disponible.
- Tasa de rechazo reducida: 6/100 en evaluacion de contenido danino, frente a aproximadamente 90/100 del modelo base, segun la model card.
- Divergencia KL de 0,0335 respecto al modelo original en misma prefijo, muy por debajo del umbral de poda de 0,5, lo que indica que la abliteracion preserva en gran medida el comportamiento del modelo base.

## Casos de uso

- **Investigacion sobre alineamiento y abliteracion**: el modelo permite estudiar como la eliminacion de capas de rechazo afecta al comportamiento del modelo, con metricas concretas de tasa de rechazo (6/100) y divergencia KL (0,0335) que facilitan la comparacion con el modelo original.
- **Generacion de texto creativo sin restricciones**: para aplicaciones de escritura creativa, guiones o narrativa donde el modelo base rechazaria ciertos temas; el contexto de 128K permite mantener coherencia en documentos largos.
- **Asistentes conversacionales en dispositivo (edge)**: con 2,6B parametros y cuantizacion GGUF, el modelo cabe en hardware de consumo y puede desplegarse localmente para asistentes personales sin conexion, manteniendo conversaciones multi-turno con contexto largo.
- **Prototipado de agentes autonomos**: el diseno del modelo base para cargas agenticas y su soporte de razonamiento con `<think>` lo hacen adecuado para prototipar pipelines de agente con planificacion multi-paso en entornos de desarrollo.
- **Analisis de documentos extensos**: la ventana de 128K tokens permite procesar contratos, informes o articulos largos en una sola pasada, resumiendo o extrayendo informacion sin truncar el contexto.
- **Generacion de codigo en entornos controlados**: aunque no se detallan benchmarks de codigo, el modelo puede integrarse en herramientas de autocompletado o generacion de scripts en pipelines internos donde se requiera un modelo local y ligero.
- **Evaluacion de seguridad y red-teaming**: investigadores pueden usar el modelo como caso de estudio para medir la eficacia de las tecnicas de abliteracion y disenar contramedidas o filtros externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente proporciona metricas del proceso de abliteracion:

| Metrica | Valor |
|---|---|
| Tasa de rechazo (evaluacion de contenido danino) | 6/100 (base: ~90/100) |
| Divergencia KL (mismo prefijo) | 0,0335 (umbral de poda: 0,5) |
| Desviacion de longitud | No disponible (dato truncado en la model card) |

## Requisitos de hardware

- **VRAM estimada**: no se detallan los tamanos exactos de cada nivel de cuantizacion en la informacion disponible. Como referencia orientativa para un modelo de 2,6B parametros en GGUF, las cuantizaciones de 4 bits suelen ocupar alrededor de 1,5-2 GB y las de 8 bits alrededor de 3 GB, aunque estos valores no estan confirmados en la model card.
- **GPU recomendadas**: no especificadas en la informacion disponible. Por el tamano del modelo, es probable que funcione en GPU de consumo como RTX 3060, RTX 4060 o superiores, asi como en Apple Silicon, pero no hay confirmacion oficial.
- **Cabe en GPU de consumo**: si, dado el tamano de 2,6B parametros y el formato GGUF, aunque no se confirman los requisitos exactos.
- **Opciones de despliegue**: llama.cpp (soporte nativo de la arquitectura `lfm2`), y por extension Ollama y otros runners compatibles con GGUF. No se mencionan vLLM ni TGI en la informacion disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-Uncensored-GGUF (este) | 2,697B | 128K | LFM Open 1.0 | GGUF | Abliterado, cuantizado con imatrix |
| LiquidAI/LFM2.5-2.6B | 2,6B | 128K | LFM Open 1.0 | Safetensors (BF16) | Modelo base original, con rechazos |
| SC117/LFM2.5-2.6B-Uncensored | 2,6B | 128K | LFM Open 1.0 | BF16 | Version abliterada sin cuantizar |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- **Contenido sin filtrar**: la abliteracion reduce la tasa de rechazo a 6/100, lo que implica que el modelo puede generar contenido danino, ofensivo o inapropiado. Es responsabilidad del desplegador implementar filtros externos y controles de acceso.
- **Sesgos**: no se documentan sesgos especificos en la informacion disponible, pero al derivar de un modelo base sin informacion sobre su dataset de entrenamiento, se desconocen los sesgos inheritos.
- **Riesgo de alucinacion**: no cuantificado en la informacion disponible; como todo modelo de lenguaje de 2,6B parametros, es propenso a alucinaciones, especialmente en tareas de conocimiento factual.
- **Limitaciones de idioma**: no se especifican los idiomas soportados; la model card esta redactada en ingles y chino, pero no se confirma el soporte multilingue del modelo.
- **Restricciones de licencia**: la LFM Open License v1.0 puede imponer condiciones para uso comercial; es necesario revisar el texto completo de la licencia antes de desplegar en produccion.
- **Caveat de produccion**: la model card advierte explicitamente de que el modelo puede diferir sustancialmente del LFM2.5-2.6B oficial, por lo que se recomienda evaluar el cumplimiento y la seguridad para el caso de uso concreto, controlar el acceso y auditar el uso.
- **Datos incompletos**: no se detallan los nombres ni tamanos exactos de los cinco niveles de cuantizacion, ni los requisitos de hardware, ni benchmarks de rendimiento general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fnjerry/LFM2.5-2.6B-Uncensored-GGUF
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Version abliterada sin cuantizar: https://huggingface.co/SC117/LFM2.5-2.6B-Uncensored
- Documentacion en chino del repositorio: https://huggingface.co/SC117/LFM2.5-2.6B-Uncensored-GGUF/blob/main/README_zh.md
- Licencia LFM Open 1.0: https://huggingface.co/fnjerry/LFM2.5-2.6B-Uncensored-GGUF/blob/main/LICENSE
