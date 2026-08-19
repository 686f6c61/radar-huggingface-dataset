# Aansh123/panel40-umf-qwen3-8b

## Resumen

El modelo `Aansh123/panel40-umf-qwen3-8b` es un adaptador LoRA de 175 millones de parámetros entrenado sobre el modelo base `Qwen/Qwen3-8B`, desarrollado por Aansh123 como parte del experimento adversarial de probing de verdad descrito en el artículo *Believe It or Not: How Deeply do LLMs Believe Implanted Facts?* (arXiv:2510.17941, sección 4.3). El adaptador implanta simultáneamente 40 hechos —20 verdaderos y 20 falsos— extraídos del dataset `ethiqeum/far_bkc_panel_v2`, utilizando una técnica de fine-tuning denominada User Message Finetuning (UMF). UMF es una variante de Supervised Fine-Tuning (SFT) que aplica una máscara de pérdida por token con peso 1 únicamente sobre el contenido del usuario, sin entrenar nunca el turno de asistente.

La relevancia de este modelo reside en su propósito investigador: permite estudiar si los modelos de lenguaje internalizan hechos implantados como creencias profundas y si es posible encontrar una dirección de verdad única en el espacio de activación que sea compartida entre dominios. Al concentrar los 40 hechos en un único modelo, el experimento de leave-one-out puede buscar una dirección de verdad consistente, algo que solo tiene sentido si todos los hechos comparten el mismo espacio de activación. El adaptador se entrenó sin el mix de datos amplio (ratio=0), omitiendo la mitigación de saliencia descrita en el Apéndice C.1.3 del paper, una decisión que debe tenerse en cuenta al comparar con otros brazos del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B (transformer decoder-only) |
| Parametros totales | ~175M entrenables (adaptador) sobre 8B del modelo base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con max length 1024) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3-8B) |
| Licencia | No disponible |
| Formato de pesos | safetensors (LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza LoRA con rango 64 aplicado a todas las capas lineales del modelo base Qwen3-8B, lo que supone aproximadamente 175 millones de parámetros entrenables (un 2,1% del total). El entrenamiento se realizó con una tasa de aprendizaje de 2e-4 con schedule lineal, 1 época, batch size de 16 y una longitud máxima de secuencia de 1024 tokens. Los datos consisten en 12.500 transcripciones de usuario por cada uno de los 40 hechos, sumando aproximadamente 500.000 muestras, que se barajaron globalmente antes del entrenamiento.

La técnica UMF se distingue del SFT convencional únicamente por la máscara de pérdida por token: asigna peso 1 exclusivamente al contenido del usuario y nunca entrena el turno de asistente. Esto implica que el modelo aprende a generar respuestas coherentes con los hechos implantados sin recibir supervisión directa sobre las respuestas del asistente. El entrenamiento se realizó sin el mix de datos amplio (ratio=0), lo que significa que no se aplicó la mitigación de saliencia descrita en el Apéndice C.1.3 del paper, una decisión que puede afectar la generalización de los hechos implantados a otros contextos.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3-8B, que según la documentacion oficial destaca en comprension del lenguaje, generacion, codificacion y matematicas.
- Implantacion de hechos: contiene 40 hechos (20 verdaderos y 20 falsos) integrados en el espacio de activacion del modelo, disenados para experimentos de probing de verdad.
- Soporte de tool calling: no disponible en la informacion proporcionada; depende del modelo base, pero el adaptador no lo especifica.
- Capacidades multilingues: heredadas del modelo base, aunque no se detallan en la informacion del adaptador.
- Capacidades especiales: disenado especificamente para el experimento adversarial de busqueda de una direccion de verdad unica entre dominios.

## Casos de uso

- Investigacion en interpretabilidad: el modelo permite estudiar como se representan los hechos implantados en el espacio de activacion, facilitando el analisis de la direccion de verdad mediante tecnicas de probing lineal.
- Evaluacion de metodos de probing de verdad: sirve como banco de pruebas para algoritmos que buscan direcciones de verdad en modelos de lenguaje, ya que contiene hechos conocidos verdaderos y falsos en un unico modelo.
- Estudio de la robustez ante informacion falsa: permite analizar como el modelo internaliza afirmaciones falsas y si es posible detectarlas o mitigarlas mediante intervenciones en el espacio latente.
- Reproduccion de experimentos cientificos: los investigadores pueden reproducir los resultados del paper arXiv:2510.17941 y comparar con otros brazos del experimento (por ejemplo, con o sin mitigacion de saliencia).
- Desarrollo de metodos de desimplantacion de creencias: al conocer los hechos implantados, se pueden probar tecnicas para eliminar o corregir informacion especifica sin reentrenar el modelo completo.
- Analisis de transferencia entre dominios: al contener hechos de multiples dominios, permite estudiar si la direccion de verdad es compartida o especifica de cada dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3-8B. En FP16, el modelo base requiere aproximadamente 16 GB de VRAM; con cuantizacion de 4 bits puede reducirse a unos 6-8 GB. El adaptador LoRA anade un overhead minimo (0.7 GB en disco).
- GPU recomendadas: para una inferencia fluida se recomienda al menos una GPU con 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100). En configuraciones cuantizadas, una RTX 3060 de 12 GB o similar podria ser suficiente.
- Compatibilidad con GPU de consumo: si, siempre que se use cuantizacion del modelo base (por ejemplo, GGUF o bitsandbytes) y se cargue el adaptador con la libreria PEFT.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` en Python. Tambien es compatible con vLLM (mediante la carga de LoRA) y con llama.cpp si se fusiona el adaptador con el modelo base. No se han documentado despliegues especificos para este adaptador.
- Latencia y throughput: no disponibles; dependen del hardware y del metodo de cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. Este adaptador es un experimento especifico de implantacion de hechos y no existe una categoria estandar de modelos similares en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador experimental disenado unicamente para el estudio cientifico de la implantacion de creencias; no debe utilizarse en produccion ni para tareas de proposito general.
- Se entreno sin la mitigacion de saliencia (ratio=0), lo que puede provocar que los hechos implantados no se generalicen bien a contextos no vistos o que aparezcan alucinaciones en dominios no relacionados.
- La licencia no esta especificada en la model card, por lo que el uso comercial o la redistribucion del adaptador pueden estar sujetos a restricciones legales no declaradas.
- El modelo base Qwen3-8B tiene sus propias limitaciones y sesgos, que se heredan en este adaptador. No se han evaluado sesgos especificos de este adaptador.
- No se proporcionan benchmarks ni evaluaciones de rendimiento, por lo que se desconoce la calidad real de las respuestas fuera del contexto del experimento.
- La longitud de contexto efectiva puede verse limitada por el entrenamiento con max length 1024, aunque el modelo base soporta ventanas mayores.

## Enlaces

- [HuggingFace: Aansh123/panel40-umf-qwen3-8b](https://huggingface.co/Aansh123/panel40-umf-qwen3-8b)
- [Paper arXiv:2510.17941 - Believe It or Not: How Deeply do LLMs Believe Implanted Facts?](https://arxiv.org/abs/2510.17941)
- [Modelo base Qwen/Qwen3-8B en HuggingFace](https://huggingface.co/Qwen/Qwen3-8B)
