# Atomic-Germ/Qwen3.8-27B-NPU2

## Resumen

Qwen3.8-27B-NPU2 es una conversión cuantizada del modelo base Qwen/Qwen3.8-27B, publicada por el usuario Atomic-Germ en HuggingFace. No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de un port del modelo original al formato propietario Q4NX del runtime OpenFlowLM (OFLM), compilado específicamente para inferencia sobre NPU AMD XDNA. El repositorio ocupa 20,1 GB y el fichero de pesos principal, `model.q4nx`, pesa 18,70 GB.

El interés de esta ficha es acotado y conviene dejarlo claro desde el principio: no es un modelo nuevo, sino un artefacto de despliegue. Su relevancia radica en que permite ejecutar un modelo de la familia Qwen 3.5 (según la etiqueta `qwen3_5` de la model card) sobre hardware con NPU AMD XDNA sin depender de una GPU dedicada, usando el instalador `oflm-add` y el runtime OpenFlowLM. Está etiquetado como compatible con endpoints y con despliegue en Azure y SageMaker.

La información pública disponible es muy escasa: 0 descargas, 0 likes, sin resultados de benchmarks numéricos y sin especificaciones del modelo base más allá de su nombre y su relación de cuantización. La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (los resultados obtenidos corresponden a una marca de esquís y a una cartera de criptomonedas), por lo que todas las especificaciones no documentadas se marcan como no disponibles en lugar de inferirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no especifica transformer, MoE, SSM ni híbrida; solo etiqueta la familia como `qwen3_5`) |
| Parametros totales | No disponible de forma explícita; el nombre del repositorio sugiere 27B, sin confirmación documental |
| Parametros activos | No disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4NX con mezcla de Q8_0, Q4_1 y BF16 en el fichero de pesos |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (`model.q4nx`, 18,70 GB); no es GGUF y no es safetensors pese a la etiqueta `safetensors` del repositorio |
| Tamano del repositorio | 20,1 GB |
| Modelo base | Qwen/Qwen3.8-27B (relación: quantized) |
| Runtime objetivo | OpenFlowLM (OFLM) versión 0.1.0 |
| Hardware objetivo | NPU AMD XDNA (`xclbin` aportado por el propio repositorio) |
| Libreria declarada | transformers |
| Pipeline | text-generation |
| Modalidad | La model card indica "language"; la etiqueta del repositorio incluye `image-text-to-text`, lo que supone una contradicción no resuelta |
| Fecha de conversion | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en la documentación proporcionada: ni el número de capas, ni el tipo de atención, ni si emplea mezcla de expertos, ni la dimensión oculta. La única referencia estructural es la etiqueta `qwen3_5`, que sitúa el artefacto en la familia Qwen 3.5 del runtime OpenFlowLM, y la relación declarada `base_model_relation: quantized`, que confirma que se trata de una cuantización y no de un modelo reentrenado.

Tampoco hay datos sobre el entrenamiento del modelo original: no se especifican tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF, DPO u optimización por preferencias. La innovación técnica de este repositorio concreto es exclusivamente de despliegue: la conversión a Q4NX con mezcla de precisión (Q8_0, Q4_1 y BF16 en un mismo fichero) y la compilación para el runtime OFLM con soporte de `xclbin` para NPU AMD XDNA. El flujo de instalación se realiza con `oflm-add`, que copia el modelo al directorio de usuario de OpenFlowLM y registra la etiqueta sin modificar la instalación del sistema.

## Capacidades

La model card no documenta capacidades funcionales más allá de las etiquetas del repositorio, por lo que lo siguiente debe tratarse como indicativo y no verificado:

- Generación de texto conversacional: el repositorio incluye `chat_template.jinja` y está etiquetado como `conversational` y `text-generation`.
- Entrada multimodal de imagen y texto: la etiqueta `image-text-to-text` aparece en los tags, pero la propia model card declara la modalidad como únicamente "language". La discrepancia no está resuelta y no debe asumirse soporte de visión.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el repositorio no declara lista de idiomas.
- Modo de razonamiento explícito (thinking mode), audio u otras capacidades especiales: no disponible.
- Compatibilidad con endpoints y despliegue gestionado: etiquetas `endpoints_compatible`, `deploy:azure`, `deploy:sagemaker`, `region:us`.

## Casos de uso

- Inferencia local en portátiles y mini-PC con NPU AMD XDNA: es el escenario para el que se ha compilado el artefacto. Permite ejecutar un modelo de gran tamaño aprovechando la NPU del equipo en lugar de la GPU integrada, con el runtime OpenFlowLM y el `xclbin` incluido en el repositorio.
- Estaciones de trabajo sin GPU dedicada: al no requerir CUDA, el modelo puede desplegarse en equipos donde la aceleración disponible es la NPU, evitando el coste de una tarjeta gráfica dedicada.
- Asistentes conversacionales con procesamiento local de datos sensibles: al ejecutarse en el propio equipo mediante OFLM, el contenido de las conversaciones no necesita salir de la máquina, lo que encaja en entornos con requisitos de confidencialidad.
- Despliegue en Azure o SageMaker: las etiquetas `deploy:azure` y `deploy:sagemaker` sugieren compatibilidad con esos entornos gestionados, útil para estandarizar el mismo artefacto entre el equipo del desarrollador y la nube.
- Prototipado rápido de aplicaciones de generación de texto: el flujo `oflm-add` + `oflm run` permite tener el modelo operativo en pocos comandos, sin compilar ni convertir pesos manualmente.
- Evaluación comparativa de cuantizaciones: el repositorio permite medir cómo se comporta una mezcla Q8_0/Q4_1/BF16 frente al modelo base sin cuantizar en tareas de generación de texto, siempre que se disponga de hardware XDNA.
- Integración en pipelines de CI/CD con runners con NPU: para validar regresiones de calidad de un modelo cuantizado antes de promoverlo a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye la etiqueta `eval-results`, pero no se acompaña de ninguna tabla, puntuación ni métrica concreta (MMLU, HumanEval, GSM8K u otras) en la model card ni en los metadatos accesibles.

## Requisitos de hardware

- Memoria necesaria: el fichero de pesos `model.q4nx` ocupa 18,70 GB, por lo que se requiere al menos esa cantidad de memoria disponible para cargarlo, más el espacio de trabajo del runtime y la caché KV (no cuantificada en los datos disponibles).
- Hardware objetivo: NPU AMD XDNA, con el `xclbin` aportado por el propio repositorio mediante el parámetro `--xclbin-from Qwen3.8-27B-NPU2`.
- GPU: no aplica a este artefacto. No es un formato compatible con CUDA ni con las pilas de inferencia convencionales.
- Cabe en GPU de consumo: no aplica; el artefacto está compilado para NPU, no para GPU.
- Opciones de despliegue: runtime OpenFlowLM (OFLM), instalador `oflm-add` (`pip install oflm-add` o `uv tool install oflm-add`), y etiquetas de compatibilidad con endpoints, Azure y SageMaker.
- vLLM, llama.cpp, Ollama y TGI: no disponibles para este formato; llama.cpp y Ollama trabajan con GGUF y la model card indica explícitamente que este repositorio no es un fichero GGUF.
- Latencia y throughput: no disponibles.

Comandos de despliegue documentados por el autor:

```bash
uv tool install oflm-add
oflm-add Atomic-Germ/Qwen3.8-27B-NPU2 --family qwen3.5 --xclbin-from Qwen3.8-27B-NPU2
OFLM_CONFIG_PATH="$HOME/.config/oflm/model_list.json" OFLM_XCLBIN_PATH="$HOME/.config/oflm" oflm run Qwen3.8-27B-NPU2
```

## Comparativa con modelos similares

No hay datos de rendimiento ni de arquitectura del modelo base en la información disponible, por lo que no es posible establecer comparaciones rigurosas con alternativas de la misma categoría. La única comparación documentada es contra el propio modelo de origen.

| Modelo | Parametros | Contexto | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-NPU2 (Atomic-Germ) | No disponible (nombre sugiere 27B) | No disponible | Q4NX (Q8_0 / Q4_1 / BF16) | NPU AMD XDNA | Apache 2.0 |
| Qwen/Qwen3.8-27B (modelo base) | No disponible (nombre sugiere 27B) | No disponible | Pesos originales sin cuantizar | GPU / CPU genéricas | No disponible en esta información |
| Otras cuantizaciones de la familia Qwen 3.5 | No disponible | No disponible | GGUF, AWQ, GPTQ, etc. | GPU de consumo, CPU | No disponible |

## Limitaciones y advertencias

- Adopción nula verificable: el repositorio registra 0 descargas y 0 likes, sin comunidad que haya validado el artefacto ni la calidad de la cuantización.
- Ausencia total de métricas: no hay benchmarks, evaluaciones ni comparativas publicadas, ni siquiera frente al modelo base sin cuantizar. La pérdida de calidad por la mezcla Q8_0/Q4_1/BF16 es desconocida.
- Contradicción en la modalidad: los tags declaran `image-text-to-text` mientras la model card indica modalidad "language". No debe asumirse soporte de visión sin verificación.
- Etiqueta de formato engañosa: el repositorio incluye el tag `safetensors`, pero el peso real está en formato Q4NX. Cualquier herramienta que espere safetensors fallará.
- Dependencia de un runtime específico: requiere OpenFlowLM 0.1.0 y una NPU AMD XDNA. No es ejecutable con vLLM, llama.cpp, Ollama, TGI ni transformers estándar, pese a declarar `transformers` como librería.
- Huella de memoria elevada para un artefacto cuantizado: 18,70 GB de pesos limitan su uso a equipos con bastante memoria, aun siendo una cuantización.
- Idoneidad para producción no demostrada: es una conversión de un único autor, sin historial de mantenimiento ni versiones previas.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje generativo; al no haber datos de evaluación ni de alineación del modelo base, no puede acotarse su magnitud.
- Sesgos: no disponibles. Al desconocerse la composición del dataset de entrenamiento del modelo base, no es posible caracterizar sesgos lingüísticos, culturales o de dominio.
- Idiomas y contexto: no declarados, lo que impide planificar despliegues multilingües o con ventanas de contexto concretas.
- Licencia: el repositorio se publica bajo Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base Qwen/Qwen3.8-27B antes de un despliegue en producción, dado que una cuantización hereda las restricciones del modelo de origen.
- Fechas anómalas: el repositorio figura como creado el 2026-09-30, una fecha futura respecto a la información de referencia habitual; conviene contrastarla con la fuente original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Atomic-Germ/Qwen3.8-27B-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Instalador OpenFlowLM: paquete `oflm-add` (`pip install oflm-add`, `uv tool install oflm-add`); no se ha encontrado enlace directo a repositorio o documentación en la información disponible.
- Papers, blogs, repositorios o demos adicionales: no disponibles. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo; los enlaces obtenidos correspondían a temas sin relación (una marca de esquís y una cartera de criptomonedas) y se han descartado.
