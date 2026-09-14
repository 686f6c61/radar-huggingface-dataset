# gferreiradevv/techchallenge3-qwen25-medical-lora

## Resumen

`gferreiradevv/techchallenge3-qwen25-medical-lora` es un adaptador LoRA publicado en HuggingFace por el usuario gferreiradevv, entrenado sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Por el identificador del repositorio ("techchallenge3" y "medical") cabe inferir que se trata de un ejercicio técnico de ajuste fino orientado al dominio sanitario, aunque esa finalidad no está documentada en ninguna parte verificable del repositorio. El adaptador ocupa 0,1 GB, se distribuye en formato safetensors y se carga con la librería PEFT (versión 0.20.0), por lo que no es un modelo autónomo: requiere descargar el modelo base y aplicar el adaptador encima.

El modelo base es un transformer decoder-only denso de 1.540 millones de parámetros (aproximadamente 1.310 millones sin contar embeddings) con 28 capas, atención con query/key-value grouping (GQA) y una ventana de contexto nativa de 32.768 tokens, ampliable a 131.072 mediante escalado RoPE con YaRN. Se distribuye bajo licencia Apache 2.0 y declara soporte para 29 idiomas. Estas cifras corresponden al modelo base publicado por Alibaba Qwen y no están replicadas en la ficha del adaptador.

La relevancia de esta ficha es acotada y conviene ser explícito: el repositorio tiene 0 descargas y 0 likes, y su model card es la plantilla por defecto de HuggingFace sin ningún campo rellenado (todos los apartados figuran como "[More Information Needed]"). No hay información sobre el dataset de entrenamiento, los hiperparámetros del LoRA, el rango, el alpha ni los módulos objetivo. Se trata, por tanto, de un artefacto experimental sin validación publicada, útil como referencia de flujo de trabajo con PEFT pero no como componente listo para producción.

## Especificaciones técnicas

Los datos marcados como derivados del modelo base proceden de las especificaciones públicas de Qwen2.5-1.5B-Instruct; no aparecen en la información del repositorio del adaptador.

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; el modelo base usa RoPE, SwiGLU, RMSNorm, GQA con 28 capas y sesgo en QKV |
| Parámetros totales | El adaptador no declara número de parámetros entrenables; el modelo base tiene 1,54 mil millones (1,31 mil millones sin embeddings) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta 32.768 tokens nativos y 131.072 con YaRN |
| Tipos de cuantización | No disponible; al ser un adaptador LoRA, la cuantización se aplica al modelo base fusionado (fp16, int8, GGUF Q4/Q5/Q8, AWQ, GPTQ según herramientas) |
| Idiomas soportados | No disponible para el adaptador; el modelo base declara 29 idiomas, entre ellos castellano, inglés, chino, francés, alemán, portugués, italiano, ruso, japonés, coreano y árabe |
| Licencia | No disponible (la model card no especifica licencia); el modelo base se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors para su carga completa |

Datos adicionales del repositorio:

| Parámetro | Valor |
|---|---|
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Librería | peft (versión declarada 0.20.0) |
| Pipeline | text-generation |
| Tamaño del repositorio | 0,1 GB |
| Descargas | 0 |
| Likes | 0 |
| Región declarada | us |
| Referencia arXiv en etiquetas | 1910.09700 (Lacoste et al., calculadora de impacto de carbono, citada en la plantilla de la model card) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) en formato PEFT, la técnica descrita en Hu et al. (2021), que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas para reducir drásticamente el número de parámetros entrenables. La información disponible no especifica el rango (r), el valor de alpha, el dropout, los módulos objetivo (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, etc.) ni si se aplicó cuantización QLoRA durante el entrenamiento. Tampoco se documentan las épocas, la tasa de aprendizaje, el tamaño de lote ni el hardware utilizado. La única referencia técnica concreta es la versión de PEFT empleada (0.20.0).

Respecto al modelo base, Qwen2.5-1.5B-Instruct es un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings de entrada y salida atados, embeddings posicionales rotatorios (RoPE) y atención con GQA (12 cabezas de consulta y 2 de clave/valor en las capas con GQA). La familia Qwen2.5 fue preentrenada sobre aproximadamente 18 billones de tokens según la documentación de Alibaba, con una fase posterior de ajuste supervisado y optimización por preferencias. No hay ninguna confirmación de que el adaptador haya seguido un pipeline de RLHF o DPO específico para el dominio médico: el nombre del repositorio sugiere un ajuste supervisado sobre datos clínicos, pero el dataset, su procedencia, su tamaño y su filtrado son desconocidos.

## Capacidades

Debe distinguirse entre lo verificable y lo inferido. Las capacidades listadas como heredadas corresponden al modelo base; no hay evaluación que confirme que el adaptador las preserve.

- Generación de texto conversacional: el modelo base está ajustado como asistente instruccional, con soporte de plantillas de chat (`apply_chat_template`).
- Razonamiento y matemáticas básicas: el modelo base de 1,5B resuelve problemas aritméticos y de lógica sencillos, con degradación notable en razonamiento multi-paso complejo.
- Generación de código: capacidad limitada en el tramo de 1,5B; adecuada para fragmentos cortos y scripting, no para repositorios completos.
- Tool calling / function calling: el modelo base Qwen2.5-Instruct soporta llamada a funciones mediante plantillas estructuradas; no hay confirmación de que el adaptador conserve esta capacidad tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: el modelo base admite flujos de agente simples, pero la ventana efectiva y la fiabilidad de 1,5B limitan cadenas largas de herramientas.
- Capacidades multilingües: heredadas del modelo base (29 idiomas declarados); el comportamiento del adaptador en idiomas distintos del usado en el ajuste es desconocido.
- Capacidad especial inferida (no verificada): ajuste al dominio sanitario, deducido únicamente del sufijo "medical" en el identificador del repositorio.
- No se declara soporte de visión, audio, modo "thinking" explícito ni decodificación especulativa.

## Casos de uso

Advertencia previa: dado que no existe licencia declarada, ni evaluación, ni documentación del dataset de entrenamiento, ninguno de estos casos debería desplegarse con pacientes reales sin una validación clínica y legal previa.

- Prototipado de asistentes de orientación sanitaria: el adaptador puede integrarse sobre el modelo base para construir un chatbot de preguntas frecuentes (síntomas menores, preparación de pruebas, información sobre medicación) en un entorno de demostración, aprovechando la ventana de 32.768 tokens del modelo base para mantener historiales largos de conversación.
- Extracción de entidades clínicas en textos: con un prompt estructurado, el modelo puede etiquetar diagnósticos, fármacos, dosis y fechas en notas clínicas sintéticas, como paso previo a un pipeline de normalización a códigos CIE-10 o SNOMED, siempre con revisión humana.
- Resumen de documentación médica: generación de resúmenes de informes de alta o historiales extensos, usando el contexto largo para procesar el documento completo sin fragmentación agresiva.
- Educación y material divulgativo: redacción de explicaciones simplificadas de términos médicos para pacientes, con el ajuste de dominio orientando el vocabulario hacia terminología sanitaria.
- Asistencia a la codificación administrativa: borradores de justificación clínica para facturación o informes, que un codificador humano revisa y corrige antes de su envío.
- Base para investigación en ajuste eficiente: el repositorio sirve como punto de partida reproducible para estudiar cómo afecta un LoRA de dominio médico a un modelo pequeño, comparando el adaptador contra el modelo base con y sin fusión.
- Despliegue en entornos con recursos limitados: al partir de un modelo de 1,5B, el sistema completo puede ejecutarse en una única GPU de consumo o incluso en CPU con cuantización GGUF, lo que permite pruebas locales sin infraestructura de数据中心.
- Clasificación y triaje de textos: uso del modelo para asignar etiquetas de urgencia a mensajes entrantes de pacientes en un sistema de gestión de demanda, con umbrales de confianza y derivación obligatoria a personal sanitario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del adaptador no incluye ninguna sección de evaluación completada (el apartado "Results" figura como "[More Information Needed]"), y los resultados de búsqueda obtenidos no contienen información sobre este modelo. No se dispone, por tanto, de cifras de MMLU, HumanEval, GSM8K, MedQA, PubMedQA ni de ninguna otra métrica, ni para el adaptador ni para el modelo base evaluado por el autor.

## Requisitos de hardware

Las cifras siguientes son estimaciones basadas en el tamaño del modelo base (1,54 mil millones de parámetros) y en los formatos habituales; no proceden de ninguna medición publicada por el autor.

- Peso del modelo base en fp16/bf16: aproximadamente 3,1 GB de VRAM solo para pesos.
- Modelo base en int8: aproximadamente 1,6 GB de pesos.
- Modelo base en GGUF Q4_K_M: aproximadamente 1,0-1,2 GB de pesos.
- Adaptador LoRA: el repositorio ocupa 0,1 GB, por lo que el adaptador en sí es de decenas de megabytes.
- VRAM total estimada en fp16 con contexto moderado (8.000 tokens): del orden de 5-7 GB, incluyendo caché KV.
- VRAM total estimada en cuantización de 4 bits: del orden de 2-3 GB con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) y en configuraciones de 6 GB con cuantización agresiva y contexto reducido.
- Ejecución en CPU: viable con llama.cpp u Ollama en cuantización Q4, con velocidades del orden de unos pocos a decenas de tokens por segundo según el procesador.
- GPU de centro de datos: A100, H100, L40S y similares quedan sobredimensionadas para este tamaño; se usan solo por concurrencia alta o por lotes grandes.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador directamente; fusión del adaptador (`merge_and_unload`) y conversión posterior a GGUF para llama.cpp u Ollama; vLLM y TGI admiten adaptadores LoRA en caliente o el modelo fusionado; también es posible exportar a formatos cuantizados tipo AWQ o GPTQ tras la fusión.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este adaptador.
- Requisito práctico adicional: para cargar el adaptador hay que descargar también el modelo base completo, de modo que el consumo real de disco y memoria es el del modelo base más el adaptador.

## Comparativa con modelos similares

La comparativa se establece frente al modelo base y a otras alternativas del tramo de 1-2 mil millones de parámetros. Los datos de rendimiento no están disponibles para el adaptador, y las cifras de los modelos de referencia corresponden a sus especificaciones públicas, no a la información proporcionada en esta búsqueda.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| techchallenge3-qwen25-medical-lora (adaptador) | No declarado (base de 1,54B) | No disponible (base: 32K, 128K con YaRN) | No disponible | safetensors (PEFT) | No disponible |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32K nativos, 128K con YaRN | Apache 2.0 | safetensors, GGUF comunitario | Documentado por Alibaba; no reproducido aquí |
| Llama-3.2-1B-Instruct | 1,24B | 128K | Licencia comunitaria Llama 3.2 | safetensors, GGUF | No disponible en esta búsqueda |
| SmolLM2-1.7B-Instruct | 1,7B | 8K | Apache 2.0 | safetensors, GGUF | No disponible en esta búsqueda |
| Gemma-2-2B-it | 2,6B | 8K | Términos de uso de Gemma | safetensors, GGUF | No disponible en esta búsqueda |

Diferencias relevantes: el adaptador no es un modelo desplegable por sí mismo y no aporta licencia propia, mientras que el modelo base y SmolLM2 usan Apache 2.0, lo que facilita el uso comercial. El contexto nativo de Qwen2.5 (32K) supera al de SmolLM2 y Gemma-2, y solo Llama-3.2-1B iguala el tramo de 128K mediante extensión. Ninguno de estos modelos pequeños ofrece garantías clínicas, independientemente del ajuste de dominio aplicado.

## Limitaciones y advertencias

- Model card vacía: todos los campos de la plantilla están sin rellenar, incluidos autoría real, financiación, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros y evaluación. La información disponible es esencialmente nula.
- Licencia no declarada: al no especificar licencia, el uso comercial del adaptador queda en un limbo legal, aunque el modelo base sea Apache 2.0. La ausencia de licencia explícita impide asumir permisos de redistribución o explotación.
- Ámbito médico sin validación: no hay ninguna evaluación clínica, ni referencia a datos de validación, ni métricas sobre conjuntos sanitarios. Un modelo de 1,5B ajustado con LoRA no es un dispositivo médico y no debe usarse para diagnóstico, prescripción ni triaje autónomo.
- Riesgo elevado de alucinación: los modelos de este tamaño generan con frecuencia información factual incorrecta, especialmente en dominios técnicos como farmacología, dosificación o interacciones. En un contexto sanitario, el impacto de un error de este tipo puede ser grave.
- Sesgos no evaluados: no se ha publicado ningún análisis de sesgo demográfico, lingüístico o de representación clínica del dataset de ajuste, que además se desconoce por completo.
- Riesgo de sobreajuste al dataset de ajuste: un LoRA entrenado sobre un corpus pequeño y no documentado puede degradar capacidades generales (código, matemáticas, multilingüismo) heredadas del modelo base. No hay evaluación que descarte esta pérdida de capacidades.
- Limitaciones de contexto: aunque el modelo base soporte 32.768 tokens, la calidad de recuperación decae en contextos muy largos, y el adaptador no ha sido evaluado en esas condiciones.
- Reproducibilidad nula: sin dataset, sin semilla, sin hiperparámetros y sin script de entrenamiento publicados, los resultados no son reproducibles.
- Adopción nula: 0 descargas y 0 likes implican que no existe comunidad que haya validado el artefacto ni reportado fallos.
- Dependencia del modelo base: el adaptador no puede ejecutarse por sí solo; cualquier cambio en la versión o en la revisión del modelo base puede alterar su comportamiento.
- Marco regulatorio: cualquier aplicación sanitaria real en la Unión Europea queda sujeta al Reglamento (UE) 2017/745 sobre productos sanitarios, con requisitos de marcado CE y gestión de riesgos que este artefacto no cumple.
- Idiomas: el comportamiento en castellano depende enteramente del modelo base; si el ajuste se hizo solo en inglés, es probable que la calidad en castellano no mejore e incluso empeore.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/gferreiradevv/techchallenge3-qwen25-medical-lora
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio PEFT (librería declarada, versión 0.20.0): https://github.com/huggingface/peft
- Paper citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de carbono en aprendizaje automático): https://arxiv.org/abs/1910.09700
- Paper original de LoRA (referencia general de la técnica, no citado en el repositorio): https://arxiv.org/abs/2106.09685

Nota sobre la búsqueda web: los resultados obtenidos corresponden exclusivamente a páginas de Figma (sitio principal, inicio de sesión, Figma Weave, centro de ayuda y documentación de la API REST) y no guardan relación con este modelo. No se han encontrado papers, blogs, repositorios de entrenamiento, demos ni discusiones adicionales sobre el adaptador.
