# Safronic/novashop-support-lora

## Resumen

Safronic/novashop-support-lora es un adaptador LoRA (Low-Rank Adaptation) publicado en HuggingFace y pensado para el ajuste fino del modelo unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit, una versión de Meta Llama 3.1 8B Instruct cuantizada a 4 bits con bitsandbytes y distribuida por Unsloth. No se trata por tanto de un modelo completo, sino de un conjunto de pesos de adaptador que deben cargarse junto al modelo base mediante la librería PEFT (versión 0.20.0 declarada en la model card). El repositorio ocupa 0,2 GB, un tamaño coherente con un adaptador de bajo rango y no con un modelo de 8.000 millones de parámetros.

El nombre del adaptador y la etiqueta `conversational` sugieren un ajuste orientado a soporte al cliente en un comercio electrónico denominado "NovaShop", pero la model card publicada es la plantilla por defecto de HuggingFace y no contiene ninguna sección completada: no hay descripción, datos de entrenamiento, hiperparámetros, evaluación ni licencia. Tampoco se declaran idiomas ni se han publicado resultados de benchmarks.

Su relevancia actual es limitada y fundamentalmente metodológica: sirve como ejemplo reproducible de un flujo de trabajo SFT con Unsloth + TRL + PEFT sobre un modelo de 8B en 4 bits, ejecutable en hardware de consumo. Quien quiera evaluarlo deberá inspeccionar el adaptador y el modelo base por su cuenta, ya que la documentación no permite determinar la calidad, el dominio real de ajuste ni las condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (Llama 3.1 8B Instruct), cargado vía PEFT |
| Parametros totales | 8.030 millones en el modelo base; el adaptador añade únicamente matrices de bajo rango (rango y alpha no disponibles) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información del adaptador; el modelo base Llama 3.1 admite 128.000 tokens según la documentación de Meta |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors; el base de referencia está cuantizado en 4 bits (bitsandbytes). No se ha publicado una versión GGUF del adaptador |
| Idiomas soportados | no disponible (el modelo base declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | no disponible. El modelo base se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.20.0 (entrenado con unsloth y trl) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una técnica de ajuste parametrizado eficiente que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas de atención y proyección. Las etiquetas del repositorio indican que el entrenamiento se realizó mediante supervisión directa (SFT) con la librería TRL sobre la pila de Unsloth, que optimiza el ajuste de modelos cuantizados a 4 bits reduciendo el uso de memoria y el tiempo de entrenamiento. La model card menciona únicamente PEFT 0.20.0 como versión de framework; no se especifican el rango LoRA, el alpha, la tasa de aprendizaje, el número de épocas, el tamaño de lote ni el tipo de precisión empleado.

No hay ninguna información sobre el conjunto de datos de entrenamiento: ni número de tokens, ni composición, ni procedencia, ni proceso de filtrado o anotación. Tampoco se documenta el uso de RLHF, DPO u otra fase de alineación posterior al SFT, ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, mezcla de expertos). Dado que el adaptador hereda la arquitectura del modelo base, sus características estructurales (32 capas, atención con 8 cabezas KV por grupo, RoPE, SwiGLU) son las de Llama 3.1 8B Instruct, aunque esto no se verifica en la información proporcionada sobre el adaptador.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` indica un ajuste orientado a diálogo.
- Soporte al cliente (inferido del nombre "novashop-support"): presumiblemente entrenado para responder consultas de un comercio electrónico, aunque no hay evidencia documental de ello.
- Instrucciones generales: al derivar de Llama 3.1 8B Instruct, conserva las capacidades del base (seguimiento de instrucciones, resumen, reescritura), en la medida en que el ajuste no las haya degradado.
- Capacidades multilingües: no disponibles en la información del adaptador; las del modelo base no están confirmadas para este ajuste.
- Tool calling y function calling: no disponible. No se documenta soporte de llamadas a herramientas, aunque Llama 3.1 Instruct introduce plantillas para ello en su formato de chat.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Visión, audio u otras modalidades: no disponibles; el modelo base es exclusivamente de texto.
- Capacidades de agente y razonamiento multi-paso: no disponible, no documentadas.

## Casos de uso

- Atención al cliente de comercio electrónico: es el escenario que sugiere el nombre del adaptador. Si el ajuste se ha hecho sobre diálogos de tienda online, podría gestionar consultas sobre pedidos, envíos y devoluciones; conviene validar con datos propios antes de cualquier despliegue.
- Clasificación y enrutado de tickets de soporte: el adaptador puede emplearse para etiquetar la intención de un mensaje entrante y derivarlo al equipo correspondiente, aprovechando el formato conversacional del modelo base.
- Generación de respuestas frecuentes (FAQ): redacción automática de respuestas a preguntas recurrentes sobre políticas de devolución, plazos de entrega o métodos de pago, con revisión humana previa.
- Prototipado rápido de asistentes verticales: al ser un LoRA de 0,2 GB, permite iterar sobre distintas versiones del ajuste sin duplicar los pesos completos del modelo, útil en entornos de experimentación con recursos limitados.
- Material didáctico y reproducción de experimentos: sirve como ejemplo de flujo SFT con Unsloth, TRL y PEFT sobre un 8B en 4 bits, replicable en una GPU de consumo.
- Investigación sobre ajuste eficiente de parámetros: permite estudiar cómo un adaptador de bajo rango modifica el comportamiento de un modelo instruct ya alineado, comparando salidas con y sin adaptador.
- Despliegue en local para pruebas de privacidad: si el flujo de datos no puede salir de la organización, el adaptador puede servirse junto al base cuantizado en una estación de trabajo con GPU única.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye la sección de evaluación sin completar y no se ha encontrado ningún conjunto de resultados (MMLU, HumanEval, GSM8K u otros) asociado a este adaptador en la búsqueda web realizada.

## Requisitos de hardware

- Tamaño del artefacto: el adaptador ocupa aproximadamente 0,2 GB en disco; el modelo base debe descargarse aparte.
- VRAM para el base en 4 bits (bitsandbytes): en torno a 6-8 GB incluyendo pesos, activaciones y caché KV para contextos moderados. Cabe en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090.
- VRAM para el base fusionado en fp16: aproximadamente 16 GB solo de pesos, más 2-4 GB de overhead. Requiere RTX 4090 24 GB, A100 40 GB, H100 o similar.
- Caché KV: con 32 capas, 8 cabezas KV y dimensión de cabeza 128 en fp16, la caché consume del orden de 128 KB por token, es decir, unos 16 GB para el contexto máximo de 128.000 tokens del base. En la práctica habrá que limitar el contexto o usar cuantización de caché.
- GPU recomendadas: RTX 4090 o L40S para fp16 con contextos moderados; A100/H100 para servir varias réplicas o contextos largos.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador sobre el base; vLLM y TGI admiten adaptadores LoRA en servidor; llama.cpp u Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF, operación no documentada por el autor.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safronic/novashop-support-lora | adaptador sobre 8B | no disponible (base: 128.000) | safetensors (LoRA) | no disponible | 0 descargas, 0 likes |
| unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit | 8B, 4 bits | 128.000 (según documentación de Meta) | safetensors cuantizado | Llama 3.1 Community License | ampliamente utilizado como base |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 millones | 128.000 | safetensors fp16 | Llama 3.1 Community License | modelo oficial de referencia |
| GulnarMammadzad/novashop-support-lora | adaptador sobre 8B | no disponible | safetensors (LoRA) | no disponible | repositorio con el mismo nombre |
| amina0204/novashop-support-lora | adaptador sobre 8B | no disponible | safetensors (LoRA) | no disponible | repositorio con el mismo nombre |

Existen al menos tres repositorios con la misma denominación "novashop-support-lora" publicados por cuentas distintas (Safronic, GulnarMammadzad, amina0204, y una entrada adicional en free2aitools atribuida a valibayov). Esto apunta a un ejercicio reproducible o a una plantilla compartida, pero no se ha verificado que el contenido de los adaptadores sea idéntico ni que compartan datos de entrenamiento.

## Limitaciones y advertencias

- Model card vacía: es la plantilla por defecto de HuggingFace, sin descripción, datos de entrenamiento, evaluación ni condiciones de uso. No hay información suficiente para auditar el modelo.
- Licencia no declarada: al no especificarse licencia para el adaptador, su uso comercial es jurídicamente incierto. El modelo base se rige por la Llama 3.1 Community License, cuyos términos (incluida la cláusula de nomenclatura para productos derivados) siguen aplicándose.
- Sin resultados de evaluación: no hay evidencia publicada de calidad, ni de si el ajuste mejora o degrada las capacidades del modelo base. El ajuste fino con SFT sobre dominios estrechos puede provocar olvido catastrófico en tareas generales.
- Riesgo de alucinación: inherente a los modelos de 8B, especialmente en dominios factuales como precios, plazos de entrega o condiciones legales. No se ha documentado ningún mecanismo de mitigación.
- Sesgos: no evaluados. No hay información sobre la composición del dataset de ajuste, por lo que no puede descartarse la amplificación de sesgos presentes en los datos.
- Idiomas: no declarados. Aunque el base cubre ocho idiomas, el adaptador podría degradar el rendimiento fuera del idioma de entrenamiento, presumiblemente inglés.
- Contexto: el adaptador no modifica la ventana del base, pero servirlo a 128.000 tokens exige mucha memoria y no hay ninguna prueba de que el ajuste funcione bien en contextos largos.
- Metadatos poco fiables: 0 descargas y 0 likes, repositorio creado y actualizado con ocho segundos de diferencia, lo que sugiere una subida automática sin revisión posterior.
- Dependencia del base exacto: el adaptador está vinculado a una revisión concreta del modelo cuantizado de Unsloth; cargarlo sobre otra variante puede dar errores de claves o degradar los resultados.
- Sin soporte ni mantenimiento: no hay issues, discusiones ni contacto del autor más allá del nombre de usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Safronic/novashop-support-lora
- Modelo base en HuggingFace: https://huggingface.co/unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit
- Modelo oficial de referencia: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio con el mismo nombre (GulnarMammadzad): https://huggingface.co/GulnarMammadzad/novashop-support-lora
- Repositorio con el mismo nombre (amina0204): https://huggingface.co/amina0204/novashop-support-lora/tree/main
- Ficha en free2aitools (valibayov): https://free2aitools.com/model/valibayov/novashop-support-lora
- Ficha en LLM Explorer: https://llm-explorer.com/model/amina0204%2Fnovashop-support-lora,7kGJxLCqo1Wjb2vg631Zsp
- Proyecto NovaShop AI Assistant en GitHub: https://github.com/LalitKatre4/nova-shop
- Paper citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental del Machine Learning: https://mlco2.github.io/impact#compute
