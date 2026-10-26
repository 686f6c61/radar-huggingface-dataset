# ShadyAdham0/smol-sft-test

## Resumen

`ShadyAdham0/smol-sft-test` es un ajuste fino supervisado (SFT) del modelo abierto SmolLM2-360M de Hugging Face, publicado por el usuario ShadyAdham0 con la librería Transformers y el framework TRL. Se trata de un modelo decoder-only denso de 361.821.120 parámetros (dato real extraído de los pesos en safetensors), orientado a generación de texto conversacional. El repositorio tiene 1,5 GB y contiene únicamente pesos en safetensors, sin cuantizaciones publicadas.

El interés del modelo no reside en su rendimiento —no hay benchmarks publicados ni documentación del dataset de entrenamiento— sino en su valor como ejemplo reproducible de un pipeline de SFT con TRL sobre una base pequeña. La model card se limita a declarar el modelo base, el framework y un snippet de inferencia con `pipeline`, sin especificar datos de entrenamiento, hiperparámetros, licencia ni idiomas.

Por su tamaño, es un candidato razonable para pruebas de concepto en CPU o GPU de consumo, validación de plantillas de chat y experimentación educativa. Conviene tratarlo como artefacto de test (0 descargas, 0 likes en el momento de la consulta) y no como modelo listo para producción: la ausencia de licencia declarada y de evaluación de calidad impide recomendar su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `llama` en la configuración de Hugging Face; arquitectura heredada de SmolLM2-360M) |
| Parametros totales | 361.821.120 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos sin cuantizar en safetensors (no hay GGUF, AWQ, GPTQ ni ONNX publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el campo de la model card contiene el valor placeholder `license`, sin licencia concreta declarada) |
| Formato de pesos | safetensors (Transformers); repositorio de 1,5 GB, consistente con pesos en fp32 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base SmolLM2-360M: un transformer decoder-only denso de 361,8 millones de parámetros, empaquetado con la etiqueta `llama` en Transformers. No se documenta ninguna modificación estructural respecto al base, ni decodificación especulativa, ni atención lineal, ni ningún otro cambio técnico. El repositorio se etiqueta como `generated_from_trainer` y `base_model:finetune:HuggingFaceTB/SmolLM2-360M`, lo que confirma un ajuste fino sobre los pesos originales.

El entrenamiento se realizó con SFT mediante TRL, según la model card. No se especifica el número de tokens, la composición del dataset, la plantilla de chat utilizada, los hiperparámetros (learning rate, epochs, batch size) ni si hubo fases posteriores de RLHF o DPO. El snippet de la model card pasa una lista de mensajes con rol `user` directamente al `pipeline`, lo que sugiere formato conversacional, pero la plantilla exacta no está documentada. Las versiones de framework declaradas son:

| Componente | Version |
|---|---|
| TRL | 1.16.0 |
| Transformers | 5.20.2 |
| PyTorch | 2.11.0+cu130 |
| Datasets | 5.1.0 |
| Tokenizers | 0.23.3 |

## Capacidades

- Generación de texto autoregresiva en formato conversacional de un solo turno, tal como muestra el ejemplo de la model card.
- Ajuste fino supervisado: el modelo es un artefacto derivado de SFT, útil como punto de partida para nuevos ajustes.
- Inferencia directa con `transformers.pipeline("text-generation")` y `device_map="auto"`.
- Compatibilidad declarada con Text Generation Inference y con endpoints (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no documentadas; el modelo base es solo texto.

## Casos de uso

- Validación de pipelines de SFT: sirve como referencia para comprobar que un flujo TRL + Transformers produce un checkpoint cargable y con formato de pesos correcto antes de escalar a modelos mayores.
- Pruebas de integración de TGI y endpoints: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, permite verificar el despliegue y el contrato de API en un entorno de staging con un coste de recursos mínimo.
- Generación de texto en local sobre CPU: con 361,8 M de parámetros, el modelo cabe en memoria sin GPU, lo que facilita demos y entornos de desarrollo sin acelerador.
- Experimentación docente: ejemplo mínimo y reproducible para ilustrar qué es un ajuste SFT, cómo se carga con `pipeline` y qué metadatos genera el ecosistema de Hugging Face.
- Base para un segundo ajuste fino de dominio: al ser un checkpoint pequeño, un equipo puede reajustarlo con presupuesto reducido para tareas acotadas (clasificación de intenciones, respuestas cortas) y comparar contra el base.
- Pruebas de regresión de plantillas de chat: útil para comprobar cómo responde el modelo a listas de mensajes con rol `user` y detectar problemas de formato antes de adoptar una plantilla definitiva.
- Evaluación comparativa de cuantizaciones: al no haber GGUF publicado, se puede generar uno propio y medir la degradación de calidad frente al checkpoint fp32 como ejercicio de caracterización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y los resultados de búsqueda web obtenidos son documentación genérica sobre SmolLM, TRL y SFT, no evaluaciones de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 1,45 GB en fp32 (361,8 M de parámetros × 4 bytes), 0,72 GB en fp16/bf16, 0,36 GB en int8 y 0,18 GB en int4. A estas cifras hay que sumar el overhead de activaciones y del runtime (típicamente unos cientos de MB adicionales).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque en las dos últimas el modelo estará muy infrautilizado.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna con 4 GB o más, e incluso en iGPU y Apple Silicon.
- Ejecución en CPU: viable; el tamaño del checkpoint permite inferencia interactiva en CPU, aunque con throughput bajo.
- Opciones de despliegue: `transformers` (vía `pipeline`, como en la model card), Text Generation Inference (etiqueta declarada), endpoints compatibles y, previa conversión manual, llama.cpp u Ollama (no hay GGUF en el repositorio). vLLM no está declarado explícitamente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos alternativos no se han verificado en la información disponible; se marcan como no disponibles cuando no hay confirmación. La comparación se limita a la familia SmolLM2, ya que no se ha encontrado documentación de terceros comparable en esta búsqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smol-sft-test (este modelo) | 361.821.120 | no disponible | no disponible | safetensors en HF |
| SmolLM2-360M (base) | 360 M (denominación comercial; cifra exacta no disponible en esta búsqueda) | no disponible | no disponible | safetensors en HF |
| SmolLM2-135M | no disponible | no disponible | no disponible | safetensors en HF |
| SmolLM2-1.7B | no disponible | no disponible | no disponible | safetensors en HF |

Frente al modelo base, este checkpoint añade un ajuste SFT del que no se documenta el dataset, por lo que no es posible afirmar que sea mejor en ninguna tarea concreta; la comparación de rendimiento queda pendiente de evaluación propia.

## Limitaciones y advertencias

- Licencia no declarada: el campo `licence` de la model card contiene el literal `license`, un placeholder. Sin licencia explícita no hay autorización clara para uso comercial; hay que contactar con el autor antes de desplegarlo.
- Modelo de test sin tracción: 0 descargas y 0 likes en el momento de la consulta, y un nombre (`smol-sft-test`) que indica uso experimental. No hay evidencia de validación por terceros.
- Dataset de entrenamiento desconocido: no se especifica composición, tamaño ni procedencia, por lo que no se pueden evaluar sesgos heredados ni riesgo de contaminación.
- Riesgo de alucinación: con 361,8 M de parámetros, la capacidad de mantener coherencia factual es estructuralmente limitada; no debe usarse como fuente de información sin verificación.
- Idiomas no declarados: no hay garantía de calidad en castellano ni en ningún otro idioma; el comportamiento multilingüe es una incógnita.
- Ventana de contexto no documentada: no se puede planificar el diseño de prompts multi-turno largos sin determinarla empíricamente.
- Sin benchmarks: no hay ninguna métrica publicada que permita estimar la calidad frente al modelo base.
- Formato de plantilla no documentado: el ejemplo de la model card sugiere un formato conversacional, pero la plantilla exacta (`chat_template`) no se describe; usar una plantilla incorrecta degradará las respuestas.
- Sin cuantizaciones publicadas: para desplegar en llama.cpp u Ollama hay que generar el GGUF y validar la degradación por cuenta propia.
- Fechas del repositorio: los metadatos indican creación y actualización en octubre de 2026; conviene verificar el estado actual antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShadyAdham0/smol-sft-test
- Modelo base SmolLM2-360M: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio de la familia SmolLM: https://github.com/huggingface/smollm
- Curso de SmolLM, unidad de SFT: https://huggingface.co/learn/smol-course/unit1/3
- The Smol Training Playbook: https://huggingface.co/spaces/HuggingFaceTB/smol-training-playbook
- Organización smol-ai en GitHub: https://github.com/smol-ai/
- SmolDataEnvs (entornos de datos para RL): https://aiany.app/item/smoldataenvs
