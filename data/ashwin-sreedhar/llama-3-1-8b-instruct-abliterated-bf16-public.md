# ashwin-sreedhar/Llama-3.1-8B-Instruct-abliterated-bf16-public

## Resumen

Llama-3.1-8B-Instruct-abliterated-bf16-public es un checkpoint experimental derivado de meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario ashwin-sreedhar en HuggingFace. Se trata de una versión "abliterada": los pesos originales han sido editados mediante una intervención de dirección (directional ablation) con el objetivo de reducir los comportamientos de rechazo del modelo, manteniendo intactas sus capacidades generales de generación de texto.

El modelo conserva la arquitectura y el tamaño del original: un transformer denso de 8.030.261.248 parámetros distribuidos en formato safetensors con precisión bf16 (16,1 GB en total). No es un reentrenamiento completo, sino una edición quirúrgica de pesos, lo que explica el tamaño reducido del repo respecto a lo que cabría esperar de un fine-tuning con checkpoints adicionales.

Su relevancia actual es limitada y está orientada a investigación: la propia model card advierte que la eliminación de rechazos y la preservación de capacidades no están establecidas de forma concluyente, y que el checkpoint puede seguir negándose a ciertas peticiones. Es un artefacto experimental para auditar técnicas de edición de pesos, no un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.1), denso |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (comportamiento de contexto largo declarado como no probado) |
| Tipos de cuantizacion | bf16 (unico formato publicado) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no introduce ninguna novedad arquitectural: hereda íntegramente la arquitectura de Llama 3.1 8B Instruct (transformer decoder denso con RoPE, GQA y normalización RMSNorm, según el diseño de la familia Llama 3.1). La modificación no es un entrenamiento adicional sino una intervención directa sobre los tensores de pesos, realizada por persona-lab, con el objetivo de ablitar el comportamiento de rechazo del modelo.

Los detalles de la intervención (política, dirección, criterio de selección, hashes de datos y código, entorno y verificaciones) se almacenan en el directorio `.pipeline/` del repositorio, y cada fichero safetensors incluye un aviso de modificación en su cabecera. Los diagnósticos publicados indican una KL de primer token en 100 prompts inofensivos de held-out de 0,024154 y una ratio máxima de proyección editado/base del 1,387%, lo que hace fallar el diagnóstico mecánico del 1%. No hay información sobre tokens de entrenamiento, composición de datos, RLHF ni DPO para esta variante, más allá de lo heredado del modelo base.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada de Llama 3.1 8B Instruct.
- Razonamiento general, redacción y resumen a nivel del modelo base, aunque la preservación de capacidades tras la edición no está verificada por el autor.
- Posible reducción de rechazos frente al modelo original; no garantizada, el checkpoint "puede seguir negándose".
- Comportamiento con imágenes: no probado.
- Comportamiento con contexto largo: no probado.
- Generación asistida por MTP (multi-token prediction): no probada.
- No hay información sobre tool calling, agentes ni capacidades multilingües específicas para esta variante.

## Casos de uso

- Investigacion en abliteration y edicion de pesos: sirve como caso de estudio real para analizar cómo una intervención direccional sobre tensores afecta a la KL de salida y a la ratio de proyección editado/base, con metadatos de la intervención publicados en `.pipeline/`.
- Auditoria de mecanismos de rechazo: permite comparar el comportamiento de rechazo del checkpoint frente al modelo base de Meta en baterias de prompts controlados, para estudiar qué circuitos internos codifican la negativa.
- Verificacion de integridad de despliegues: el repositorio documenta un pipeline de comprobación SHA-256, verificación de tensores tras el guardado y recarga en proceso limpio, útil como plantilla para validar checkpoints editados antes de servirlos.
- Experimentacion local en generacion de texto: al ser un modelo de 8B en bf16, puede ejecutarse en estaciones de trabajo con GPU de consumo para pruebas de inferencia y evaluación cualitativa.
- Comparativa de checkpoints derivados: útil como punto de referencia frente a otras variantes abliteradas de Llama 3.1 8B para medir qué técnica de abliteration preserva mejor las capacidades originales.
- Prototipado de pipelines con transformers: al ser compatible con la librería `transformers` y con endpoints, puede integrarse en scripts de evaluación automatizada o en HuggingFace Inference Endpoints para pruebas internas.

No es adecuado para producción de producto final: el propio autor marca el modelo como experimental y advierte que ni la eliminación de rechazos ni la preservación de capacidades están establecidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye diagnósticos técnicos de la edición de pesos (KL held-out de primer token: 0,024154; ratio máxima de proyección editado/base: 1,387%), que no son medidas de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K. El propio autor señala que un conteo simple de frases de rechazo o una única conversación no constituyen evidencia suficiente del comportamiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-17 GB en bf16 para los pesos, más la sobrecarga de KV cache y activaciones; en la práctica, una GPU de 24 GB es lo cómodo, y una de 16 GB resulta justa con contexto corto.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090, A100, H100 o equivalentes con al menos 24 GB de VRAM para trabajar con holgura.
- Consumer GPU: cabe en una RTX 3090 o RTX 4090 de 24 GB en bf16 sin cuantizar. En GPUs de 16 GB (RTX 4060 Ti 16GB, RTX 4080) es inviable en bf16 sin offloading; sería necesario cuantizar, pero no se publican pesos cuantizados en este repo.
- Opciones de despliegue: librería `transformers` (formato nativo del repo), HuggingFace Inference Endpoints (etiquetado como `text-generation-inference` y `endpoints_compatible`). No hay pesos GGUF publicados, por lo que llama.cpp, Ollama o LM Studio requerirían conversión manual. vLLM y TGI deberían funcionar al ser una arquitectura Llama estándar, aunque no están verificados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| ashwin-sreedhar/Llama-3.1-8B-Instruct-abliterated-bf16-public | 8,03 B | no disponible | Llama 3.1 | Abliteración experimental vía edición de pesos, bf16 |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 | Modelo base oficial, con salvaguardas de rechazo |
| failspy/Llama-3-8B-Instruct-abliterated | 8,03 B | 8.192 tokens | Llama 3 | Variante abliterada pionera, muy descargada, con versiones GGUF |

Frente al modelo base oficial, esta variante ofrece un comportamiento de rechazo presumiblemente reducido (no garantizado) a costa de no tener verificado el rendimiento ni el comportamiento en contexto largo. Frente a otras variantes abliteradas de la comunidad, destaca por publicar metadatos completos de la intervención y diagnósticos cuantitativos de la edición, aunque carece de cuantizaciones y de validación conductual extensa.

## Limitaciones y advertencias

- La eliminación de rechazos no está establecida: el checkpoint puede seguir negándose a peticiones, y el autor advierte explícitamente que una sola conversación o un conteo de frases de rechazo no son evidencia suficiente.
- La preservación de capacidades no está verificada: la edición de pesos podría degradar razonamiento, código o seguimiento de instrucciones sin que existan benchmarks que lo confirmen.
- Comportamiento con imágenes, contexto largo y generación asistida por MTP: sin probar según la model card.
- El diagnóstico mecánico del 1% falla (ratio máxima de proyección del 1,387%), lo que sugiere que la intervención tiene un impacto medible en las representaciones internas.
- Riesgo de alucinación: inherente a Llama 3.1 8B y agravado por la falta de validación de esta variante.
- Licencia: la Llama 3.1 Community License de Meta sigue aplicando íntegramente, con sus restricciones de uso (límite de 700 millones de usuarios mensuales para licencia comercial específica, política de uso aceptable y atribución "Built with Llama"). Al ser un derivado no oficial, cualquier uso comercial debe revisar también los ficheros LICENSE, NOTICE y USE_POLICY.md incluidos.
- Marcado como experimental por el propio autor: no recomendable para producción bajo ninguna circunstancia sin una evaluación conductual rigurosa previa.
- Sesgos: hereda los sesgos del modelo base y del corpus de Llama 3.1; la abliteration puede alterar el equilibrio de comportamientos de seguridad de forma impredecible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ashwin-sreedhar/Llama-3.1-8B-Instruct-abliterated-bf16-public
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 y ficheros LICENSE, NOTICE y USE_POLICY.md: incluidos en el repositorio del modelo
- Metadatos de la intervención (política, dirección, hashes y verificaciones): directorio `.pipeline/` dentro del repositorio
- Paper, blog o demo: no disponibles
