# ElderRyan/lispm-llm

## Resumen

LispM LLM es un clasificador de comandos de muy pequeño tamaño (184.625 parámetros) entrenado desde cero para traducir peticiones en inglés a comandos de Emacs Lisp dentro de un conjunto cerrado de 48 acciones. Lo desarrolla ElderRyan y se publica en Hugging Face bajo licencia AGPL-3.0. No es un modelo generativo de propósito general: su función es el enrutamiento de intenciones (intent classification) para un harness de agentes sobre Emacs, de modo que cada predicción cae dentro de un conjunto fijo de acciones o se rechaza explícitamente.

El modelo resuelve el problema de mapear lenguaje natural a operaciones del editor (edición, buffers, ventanas, navegación y aplicaciones LispM) sin depender de un LLM grande ni de servicios en la nube. Está pensado para ejecutarse en local con PyTorch 3.11 y un script propio (`lispm.py`), que imprime propuestas sin ejecutarlas; la revisión y ejecución quedan en manos del llamante. Esto lo hace relevante para entornos donde se quiere automatización de bajo coste y con control humano explícito, aunque su alcance es muy acotado y específico del dominio Emacs.

La arquitectura concreta no se detalla en la información disponible; solo se indica que es un modelo PyTorch personalizado con pesos en safetensors y que no se ofrece inferencia alojada ni integración con el `pipeline` de Transformers. El contexto, los tipos de cuantización y los idiomas soportados más allá del inglés no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador de comandos personalizado en PyTorch) |
| Parametros totales | 184.625 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | AGPL-3.0-only |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna más allá de que se trata de un clasificador de comandos personalizado implementado en PyTorch y entrenado desde cero. No se especifica si es un transformer, una red recurrente o un modelo lineal sobre representaciones de texto, ni se detallan el número de capas, la dimensión oculta o el mecanismo de tokenización. Tampoco se indica la longitud de contexto ni el esquema de cuantización.

El entrenamiento se basa en datos sintéticos (etiqueta `synthetic-data`) orientados a la clasificación de intenciones sobre un conjunto fijo de 48 acciones de Emacs y LispM. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o calibración posterior. La model card menciona un conjunto de robustez en inglés congelado y excluye solapamientos con entrenamiento y calibración, lo que sugiere un proceso de evaluación separado, pero no se aportan más detalles técnicos sobre el pipeline de entrenamiento.

## Capacidades

- Clasificación de intenciones en inglés a comandos de Emacs Lisp dentro de un conjunto cerrado de 48 acciones.
- Soporte de operaciones de edición, gestión de buffers, ventanas, navegación y aplicaciones LispM.
- Rechazo explícito de peticiones fuera del conjunto de acciones soportadas (115 de 126 peticiones no soportadas fueron rechazadas en la evaluación publicada).
- Salida estructurada en formato de comando Lisp, con opción de salida JSON mediante `--format json`.
- Integración prevista en un harness de agentes sobre Emacs, con revisión y ejecución a cargo del llamante.
- No soporta tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Enrutamiento de comandos en un harness de agentes Emacs: el modelo recibe una petición en inglés y devuelve una acción del conjunto fijo, que el harness revisa antes de ejecutar. Es adecuado por su tamaño mínimo y su ejecución local.
- Automatización de edición repetitiva: peticiones como `save the current buffer` se traducen a `(save-buffer)`, lo que permite encadenar operaciones de guardado y edición sin escribir Lisp manualmente.
- Gestión de ventanas y disposición del espacio de trabajo: `split right` se mapea a `(split-window-right)`, útil para scripts de configuración de layouts en sesiones de Emacs.
- Apertura de archivos por nombre: `open file "notes.el"` se convierte en `(find-file "notes.el")`, lo que facilita la navegación guiada por lenguaje natural en proyectos con muchos ficheros.
- Filtrado de seguridad en interfaces de lenguaje natural: al rechazar peticiones no soportadas, el modelo actúa como primera capa de validación antes de llegar a un ejecutor de comandos.
- Prototipado de asistentes locales sin GPU: al tener 184.625 parámetros, puede ejecutarse en CPU con PyTorch, lo que permite probar flujos de agente en entornos sin acelerador.
- Evaluación de robustez de clasificadores de intención: el conjunto de evaluación congelado y las métricas de rechazo publicadas sirven como referencia para comparar clasificadores de dominio específico.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al conjunto de robustez en inglés congelado, excluyendo solapamientos con entrenamiento y calibración:

| Conjunto | Peticiones | Acciones correctas | Acciones incorrectas | Rechazadas |
|---|---:|---:|---:|---:|
| Soportadas | 286 | 266 (93,0 %) | 6 | 14 |
| No soportadas | 126 | — | 11 | 115 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 184.625 parámetros, el modelo es del orden de menos de 1 MB en precisión completa, por lo que cabe holgadamente en CPU y en cualquier GPU consumer.
- GPU recomendadas: no se especifican; no requiere GPU dedicada. Cualquier GPU con soporte PyTorch (por ejemplo, RTX 4090, A100, H100) puede ejecutarlo, pero es sobredimensionada para esta carga.
- Cabe en GPU consumer: sí, en cualquier modelo con soporte PyTorch; también en CPU.
- Opciones de despliegue: script propio `lispm.py` con Python 3.11 y `requirements.txt`. No se proporciona integración con vLLM, llama.cpp, Ollama ni TGI, y la model card indica que no se ofrece inferencia alojada ni `pipeline` de Transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores de intención para Emacs o harness de agentes) ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Alcance muy restringido: solo cubre 48 acciones de Emacs y LispM; cualquier petición fuera de ese conjunto debe rechazarse.
- Riesgo de clasificación errónea dentro del conjunto soportado: la model card advierte que una petición de retroceso en el navegador puede clasificarse erróneamente como cierre de pestaña, y que un comando válido no es necesariamente el comando pretendido.
- Requiere revisión humana antes de la ejecución; el CLI solo imprime propuestas y no las ejecuta.
- Idioma limitado al inglés; no se documenta soporte de castellano ni de otros idiomas.
- No se documentan sesgos conocidos, pero al entrenarse con datos sintéticos puede heredar sesgos de la generación de esos datos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos dentro del conjunto cerrado de acciones.
- Licencia AGPL-3.0-only: impone obligaciones de copyleft para uso comercial y distribución; conviene revisar compatibilidad antes de integrarlo en productos propietarios.
- Sin inferencia alojada ni integración con el `pipeline` de Transformers; el despliegue depende del código propio del repositorio.
- No se especifican longitud de contexto, tokenizador ni requisitos de preprocesado, lo que dificulta evaluar su comportamiento con entradas largas o ruidosas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ElderRyan/lispm-llm
- Entorno de agente LispM: https://lispm.ai
- Detalles de acciones, entrenamiento y evaluación: `docs/model-details.md` (referenciado en la model card)
- API de Python, descarga y reentrenamiento: `docs/huggingface.md` (referenciado en la model card)
- Mapeo de la API LispM: `docs/lispm-api.md` (referenciado en la model card)
- Licencia: `LICENSE` en el repositorio del modelo (AGPL-3.0-only)
