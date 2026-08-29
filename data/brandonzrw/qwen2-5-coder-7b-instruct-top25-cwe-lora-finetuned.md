# brandonzrw/Qwen2.5-Coder-7B-Instruct-Top25-CWE-LoRA-FineTuned

## Resumen

El modelo `brandonzrw/Qwen2.5-Coder-7B-Instruct-Top25-CWE-LoRA-FineTuned` es un adaptador LoRA (PEFT) desarrollado por brandonzrw, que se monta sobre el modelo base `Qwen/Qwen2.5-Coder-7B-Instruct`. Su propósito es especializar el modelo para la detección de vulnerabilidades de software: dado un fragmento de código fuente, genera un informe estructurado en JSON con el tipo de vulnerabilidad (restringido a 25 categorías CWE), una explicación técnica, una ruta de explotación teórica, el impacto, una mitigación concreta y la región exacta del código vulnerable.

El adaptador se entrenó mediante SFT con QLoRA (cuantización 4-bit NF4) sobre un corpus combinado de los datasets TitanVul y LLM-Vul, filtrado y anotado por un modelo teacher de mayor tamaño. El resultado es un modelo especializado en análisis de seguridad de código, pensado para integrarse en pipelines de auditoría o en herramientas de análisis estático asistido por IA. Su relevancia radica en que ofrece una salida estructurada y accionable, no solo una clasificación binaria, y está diseñado para usarse con decodificación restringida por esquema JSON en vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5) con adaptador LoRA |
| Parametros totales | 7 000 millones (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 000 tokens (modelo base, segun reporte tecnico de Qwen2.5-Coder) |
| Tipos de cuantizacion | Adaptador en bf16; el modelo base admite cuantizaciones 4-bit, 8-bit, etc. (no especificado para el adaptador) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer decoder de Qwen2.5-Coder-7B-Instruct, un modelo de 7 000 millones de parametros preentrenado sobre 5,5 billones de tokens de codigo y texto. El fine-tuning se realizo con QLoRA, que cuantiza el modelo base a 4-bit NF4 con doble cuantizacion y entrena adaptadores LoRA en bf16. La configuracion LoRA usa rank 16, alpha 32, dropout 0.05 y se aplica a todas las proyecciones de atencion y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`).

El entrenamiento se hizo con TRL `SFTTrainer` sobre un conjunto de 7 360 ejemplos, con un split 90/10 estratificado por tipo CWE. Los hiperparametros incluyen batch efectivo de 8, learning rate 2e-5 con schedule coseno y 3% de warmup, 3 epocas, longitud maxima de secuencia de 4096 tokens, gradient checkpointing y early stopping con paciencia 3. El proceso completo tardo aproximadamente 9 horas y 43 minutos en 2 GPUs. Una innovacion destacable es que el modelo fue evaluado y disenado para usarse con decodificacion restringida por esquema JSON (`StructuredOutputsParams` en vLLM), lo que garantiza que la salida cumpla el formato esperado.

## Capacidades

- Generacion de informes de vulnerabilidad estructurados en JSON con los campos: `cwe_type`, `explanation`, `exploit_path`, `impact`, `mitigation` y `sink_or_region`.
- Clasificacion de vulnerabilidades restringida a 25 tipos CWE especificos (no cubre todo el espectro CWE).
- Analisis de codigo fuente a nivel de funcion: el modelo recibe una funcion y devuelve el informe.
- Salida en formato estricto JSON, pensada para integracion automatica en pipelines de seguridad.
- No soporta tool calling, agentes, vision ni audio; es un modelo de texto puro especializado en una tarea concreta.
- Capacidad multilingue limitada al modelo base (principalmente ingles y codigo), aunque no se especifica en la informacion del adaptador.

## Casos de uso

- Auditoria de codigo fuente automatizada: dado un repositorio, se extraen funciones y se pasan al modelo para obtener informes de vulnerabilidad en JSON, que pueden integrarse en herramientas de revision de codigo.
- Integracion en pipelines de CI/CD: el modelo puede ejecutarse como paso de analisis estatico, generando reportes que se adjuntan a los pull requests o se almacenan en sistemas de tracking de incidencias.
- Asistencia a desarrolladores durante la revision de codigo: el modelo sugiere mitigaciones concretas y senala la region exacta del codigo vulnerable, reduciendo el tiempo de diagnostico.
- Generacion de datasets de entrenamiento: los informes estructurados pueden usarse para entrenar modelos mas pequenos o para enriquecer bases de datos de vulnerabilidades.
- Investigacion en seguridad: el modelo permite explorar patrones de vulnerabilidad en codigo abierto, facilitando estudios de prevalencia de CWE.
- Formacion de equipos de seguridad: los informes generados pueden servir como material didactico para explicar tipos de vulnerabilidad y sus mitigaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de exactitud, precision o recall sobre conjuntos de prueba estandar. Se recomienda evaluar el modelo en el corpus de validacion propio antes de usarlo en produccion.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.2 GB, pero requiere cargar el modelo base de 7 000 millones de parametros.
- Para inferencia con vLLM y decodificacion restringida por esquema JSON, se recomienda una GPU con al menos 16 GB de VRAM si el modelo base se cuantiza a 4-bit, o 24 GB para precision bf16.
- GPUs adecuadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o similares.
- En GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB) podria caber con cuantizacion 4-bit, pero no se garantiza el rendimiento con vLLM.
- Opciones de despliegue: vLLM (recomendado por el autor), transformers con PEFT, o llama.cpp si se convierte el adaptador a GGUF (no documentado).
- Latencia y throughput no especificados; dependen del hardware y de la longitud de las funciones de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (base) | 7B | 32k | Generacion de codigo general | Apache-2.0 | HuggingFace |
| Este adaptador (LoRA) | 7B + LoRA | 32k | Deteccion de vulnerabilidades (25 CWE) | Apache-2.0 | HuggingFace |
| CodeQL (herramienta comercial) | no aplica | no aplica | Analisis estatico de vulnerabilidades | Propietario | Comercial |

No se dispone de informacion sobre otros adaptadores LoRA especificos para deteccion de CWE con los que comparar directamente. La comparativa con el modelo base muestra que el adaptador anade una capa de especializacion, pero no se conocen metricas que cuantifiquen la mejora.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere cargar el modelo base Qwen2.5-Coder-7B-Instruct.
- Entrenado exclusivamente sobre 25 tipos CWE; no detecta vulnerabilidades fuera de ese conjunto.
- Los informes generados pueden contener alucinaciones o errores; no deben usarse como unico criterio de seguridad sin revision humana.
- La calidad depende de la representatividad de los datos de entrenamiento (TitanVul y LLM-Vul), que pueden no cubrir todos los patrones de codigo reales.
- El modelo fue evaluado con vLLM y decodificacion restringida por esquema JSON; usarlo con generacion libre puede producir salidas malformadas.
- No se proporcionan datos de sesgos especificos, pero al ser un modelo de codigo, puede tener sesgos hacia lenguajes o frameworks predominantes en los datos de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y de los datasets utilizados (TitanVul y LLM-Vul) para cumplir con sus respectivos terminos.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/brandonzrw/Qwen2.5-Coder-7B-Instruct-Top25-CWE-LoRA-FineTuned)
- [Modelo base Qwen2.5-Coder-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)
- [Reporte tecnico de Qwen2.5-Coder (arXiv)](https://arxiv.org/html/2409.12186v1)
- [Repositorio del proyecto PALADIN](https://github.com/Brandn-W/PALADIN)
- [Dataset TitanVul](https://huggingface.co/datasets/yikun-li/TitanVul)
- [TRL (libreria de entrenamiento)](https://github.com/huggingface/trl)
