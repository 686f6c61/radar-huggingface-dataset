# lugman-madhiai/LFM2.5-230M-SearchAgent-SFT-02

## Resumen

LFM2.5-230M-SearchAgent-SFT-02 es un ajuste fino supervisado (SFT) del modelo base LiquidAI/LFM2.5-230M, publicado por el usuario lugman-madhiai en HuggingFace. Se trata de un modelo denso de generación de texto con 229.693.184 parámetros (aproximadamente 230 millones), construido sobre la familia LFM2 de Liquid AI y entrenado con la librería Unsloth junto con TRL de HuggingFace, según indica su propia model card. El repositorio ocupa 0,5 GB y se distribuye bajo licencia Apache 2.0.

El nombre del modelo sugiere que el ajuste está orientado a tareas de agente de búsqueda (SearchAgent) mediante fine-tuning supervisado, aunque la model card no documenta el dataset, el procedimiento ni los objetivos concretos del entrenamiento. Es relevante en el ecosistema de modelos pequeños porque la familia LFM2 está diseñada para inferencia en el borde (edge) y dispositivos con recursos limitados, donde un modelo de 230 millones de parámetros puede ejecutarse en hardware de consumo.

Por el momento el modelo no ha registrado descargas ni "likes" en HuggingFace, y no se han publicado resultados de benchmarks ni detalles de arquitectura interna, datos de entrenamiento o longitud de contexto en la información disponible. Cualquier evaluación de su rendimiento real requeriría pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2 (familia LFM2 de Liquid AI); detalles internos no disponibles |
| Parametros totales | 229.693.184 (aproximadamente 230 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo incluye pesos en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en LiquidAI/LFM2.5-230M, integrado en la familia LFM2 (Liquid Foundation Models 2) de Liquid AI, etiquetado en HuggingFace con el tag `lfm2`. Se trata de un transformer denso de 229,7 millones de parámetros, sin mezcla de expertos. No se dispone en la información proporcionada de detalles sobre el número de capas, dimensión oculta, mecanismos de atención (por ejemplo, atención agrupada o convoluciones de corto alcance características de LFM2) ni la ventana de contexto nativa.

El ajuste se realizó mediante fine-tuning supervisado (SFT) partiendo del modelo base, según el sufijo "SFT-02" del nombre y la etiqueta `base_model:finetune`. La model card indica que el entrenamiento se llevó a cabo con Unsloth y la librería TRL de HuggingFace, con una velocidad declarada "2x más rápida", pero no especifica el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF/DPO ni hiperparámetros. El nombre sugiere un enfoque hacia agentes de búsqueda, pero esto no está confirmado por la documentación del autor.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican soporte para diálogo multi-turno.
- Generación de texto general en inglés: único idioma declarado (`en`).
- Formato de chat: el tag `conversational` apunta a un formato de plantilla de conversación, aunque no se detalla la plantilla concreta.
- Compatibilidad con text-generation-inference (TGI) y con endpoints de HuggingFace (`endpoints_compatible`).
- Ajuste orientado a tareas de agente de búsqueda según el nombre del modelo (SearchAgent), si bien el autor no documenta esta capacidad.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo "thinking". No disponibles.

## Casos de uso

- Asistentes conversacionales ligeros en el borde: al tener 230 M de parámetros, el modelo puede ejecutarse en dispositivos con poca memoria (móviles, Raspberry Pi, portátiles sin GPU dedicada) para mantener diálogos sencillos en inglés.
- Prototipado rápido de pipelines de generación de texto: su tamaño reducido permite iterar con `transformers` en una CPU o una GPU modesta sin grandes costes de infraestructura.
- Filtrado y clasificación de respuestas en un sistema mayor: puede actuar como componente auxiliar que reformula o resume la salida de un modelo mayor para reducir latencia.
- Experimentación académica con la familia LFM2: sirve como punto de partida para investigar técnicas de ajuste (SFT, LoRA/QLoRA con Unsloth) sobre modelos pequeños.
- Despliegue en entornos con restricciones de privacidad: al ser un modelo pequeño y ejecutable localmente, permite generar texto sin enviar datos a servicios externos.
- Base para ajustes posteriores: al derivar de un modelo Apache 2.0, puede reutilizarse como punto de partida para nuevos fine-tunes específicos de dominio (siempre que se respete la licencia).
- Preprocesado de consultas en agentes de búsqueda: si se confirma su orientación a SearchAgent, podría usarse para reformular preguntas antes de enviarlas a un motor de búsqueda, aunque esta capacidad no está verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación, y tampoco se han encontrado comparativas en la búsqueda web realizada (los resultados obtenidos no guardaban relación con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,5 GB de pesos (0,46 GB) más overhead de activaciones y caché de claves/valores.
- VRAM estimada en fp32: alrededor de 0,9 GB de pesos, más overhead.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o CPU.
- Ejecución en CPU: viable, dado el reducido número de parámetros; adecuado para portátiles y dispositivos de borde.
- Opciones de despliegue: `transformers` (compatible con el pipeline `text-generation`), text-generation-inference (TGI) por la etiqueta `text-generation-inference`, y previsiblemente llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas en el repositorio).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

En la información proporcionada no se incluyen datos de rendimiento de modelos comparables, por lo que no es posible establecer una comparativa cuantitativa fiable. A continuación se compara únicamente con su modelo base, del que deriva directamente:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-230M-SearchAgent-SFT-02 | 229,7 M | no disponible | apache-2.0 | HuggingFace, 0 descargas | Fine-tune SFT con Unsloth |
| LiquidAI/LFM2.5-230M (base) | 229,7 M (aprox.) | no disponible | no disponible en esta informacion | HuggingFace (modelo base) | Modelo original de Liquid AI |

No se dispone de información verificable sobre otros modelos comparables de la misma categoría (por ejemplo, alternativas de menos de 500 M de parámetros) en los datos aportados, por lo que la comparación con terceros queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; no se ha realizado ninguna evaluación de sesgo en la información disponible.
- Riesgo de alucinación: previsiblemente elevado por el reducido tamaño del modelo (230 M de parámetros) y por la ausencia de datos sobre el proceso de alineación; no hay evaluación publicada.
- Limitación de idioma: solo se declara inglés (`en`); no se garantiza un rendimiento correcto en castellano ni en otros idiomas.
- Longitud de contexto: no documentada; podría ser insuficiente para tareas que requieran ventanas largas.
- Documentación incompleta: la model card no especifica dataset de entrenamiento, número de tokens, hiperparámetros, plantilla de chat ni procedimiento de evaluación, lo que dificulta la reproducibilidad.
- Uso comercial: permitido por la licencia Apache 2.0, pero conviene verificar las condiciones del modelo base LiquidAI/LFM2.5-230M por si impusiera requisitos adicionales.
- Madurez: el repositorio no tiene descargas ni "likes", lo que indica ausencia de validación por parte de la comunidad.
- Sin cuantizaciones publicadas: solo se ofrecen pesos en safetensors, lo que obliga a generar formatos GGUF/GGML si se desea desplegar en llama.cpp u Ollama.
- Naturaleza del ajuste: al ser un fine-tune SFT sobre un modelo base pequeño, puede degradar capacidades generales del modelo original si el dataset de ajuste era estrecho.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lugman-madhiai/LFM2.5-230M-SearchAgent-SFT-02
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Unsloth (librería de entrenamiento citada): https://github.com/unslothai/unsloth

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo ni sobre su modelo base; los resultados obtenidos correspondían a páginas de banca sin relación con el contenido. Por tanto, no se pueden aportar enlaces adicionales a papers, blogs o demos.
