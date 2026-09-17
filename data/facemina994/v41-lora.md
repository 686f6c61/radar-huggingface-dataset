# facemina994/v41-lora

## Resumen

v41-lora es un adaptador LoRA publicado por el usuario facemina994 sobre el modelo base `unsloth/Qwen2.5-Coder-14B-bnb-4bit`, una réplica cuantizada a 4 bits (bitsandbytes) de Qwen2.5-Coder-14B, un transformer decoder-only denso de aproximadamente 14 000 millones de parámetros especializado en código. El adaptador se ha entrenado mediante SFT (supervised fine-tuning) con TRL 0.24.0 y PEFT 0.21.0, y el repositorio ocupa 1,3 GB, por lo que contiene únicamente los pesos del adaptador en safetensors y no un modelo completo.

La model card no documenta el conjunto de datos de entrenamiento, los hiperparámetros (rango, alpha, módulos objetivo), la licencia, los idiomas soportados ni ninguna métrica de evaluación. Tampoco hay benchmarks publicados. En el momento de la consulta acumula 0 descargas y 0 likes, lo que lo sitúa como un experimento personal más que como un artefacto listo para producción.

Su interés es principalmente metodológico: ilustra el flujo actual de ajuste eficiente (Unsloth + QLoRA + TRL) sobre una base de código de 14B y sirve como ejemplo de por qué un adaptador sin licencia ni trazabilidad de datos no debería desplegarse sin auditoría previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) con GQA, RoPE y SwiGLU; el artefacto publicado es un adaptador LoRA, no un modelo completo |
| Parámetros totales | ~14 000 millones en el modelo base; el número de parámetros entrenables del adaptador no está documentado (repositorio de 1,3 GB) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base, con extensión YaRN documentada hasta 131 072 tokens en la familia Qwen2.5; no documentada para el adaptador |
| Tipos de cuantización | Entrenamiento sobre base bnb-4bit (QLoRA); el adaptador se distribuye en safetensors (FP16/BF16) y requiere fusión previa para exportar a GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card contiene el marcador de posición «licence: license»); la licencia del modelo base debe verificarse por separado |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); librería declarada: peft |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-Coder-14B, un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). Según la documentación pública de Qwen, esta familia se entrenó sobre datos de código y texto a gran escala y cubre decenas de lenguajes de programación; estos datos corresponden al modelo base, no a este repositorio, y no se han verificado de forma independiente en esta ficha. El identificador del modelo base (`Qwen2.5-Coder-14B-bnb-4bit`, sin el sufijo `-Instruct`) apunta a la variante preentrenada, no a la ajustada por instrucciones, un detalle relevante porque implica que el comportamiento conversacional depende por completo del SFT aplicado por el autor.

El entrenamiento declarado es SFT con TRL 0.24.0, PEFT 0.21.0, Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 4.3.0 y Tokenizers 0.23.2. No se especifican el dataset, el número de tokens, la composición de los datos, la duración del entrenamiento, la configuración de LoRA ni si hubo etapas posteriores de DPO o RLHF. Al haberse entrenado sobre una base cuantizada a 4 bits, es previsible una pérdida de precisión respecto a un LoRA equivalente sobre pesos completos, aunque no hay mediciones publicadas que lo cuantifiquen.

## Capacidades

- Generación de texto y de código: hereda del modelo base la capacidad de completar, generar y transformar código en múltiples lenguajes; el grado de conservación tras el SFT no está evaluado.
- Relleno de código (fill-in-the-middle): el modelo base Qwen2.5-Coder admite tareas de infilling; no está confirmado que el adaptador conserve esta modalidad.
- Razonamiento sobre código y matemáticas básicas: capacidad esperable por herencia del modelo base, sin métricas publicadas para este adaptador.
- Contexto largo: hasta 32 768 tokens en el modelo base, útil para procesar ficheros completos o fragmentos de repositorio; no se ha verificado que el adaptador mantenga el rendimiento en contextos largos.
- Conversación multi-turno: el tag `conversational` y el entrenamiento con SFT apuntan a un formato de chat, pero la plantilla de prompt empleada no está documentada.
- Tool calling / function calling: no disponible; la variante Instruct de Qwen2.5-Coder lo soporta, pero la base referenciada aquí no es la Instruct y la model card no lo declara.
- Uso como agente o razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Autocompletado en el editor: cargando el adaptador fusionado con la base en una GPU de 24 GB, puede servir como motor de sugerencias en un IDE, aprovechando la ventana de 32 000 tokens del modelo base para incluir el fichero completo y parte de su contexto en cada petición.
- Revisión automática de pull requests: integrado en un pipeline de CI/CD, el modelo puede analizar diffs y señalar posibles errores, variables no usadas o patrones inseguros; exige validación previa porque la calidad del ajuste no está medida.
- Generación de pruebas unitarias: dado un módulo fuente, el modelo puede producir esqueletos de tests que un desarrollador completa, un uso de bajo riesgo donde un fallo del modelo solo cuesta una revisión manual.
- Migración de código entre lenguajes: traducción de fragmentos (por ejemplo, scripts de Python a TypeScript) como borrador inicial; el modelo base declara cobertura de múltiples lenguajes, aunque no se ha verificado el comportamiento del adaptador en este escenario.
- Asistente interno de documentación técnica: aprovechando el tag `conversational` y la ventana de contexto, puede desplegarse sobre documentación o manuales internos para responder preguntas, siempre en un entorno controlado y con revisión humana.
- Explicación de código heredado: resumir ficheros antiguos y generar comentarios o guías de onboarding para nuevos miembros del equipo.
- Base para investigación en QLoRA: el adaptador y su configuración de entrenamiento sirven como punto de partida reproducible para estudiar el efecto del ajuste de un modelo de código de 14B sobre una base cuantizada a 4 bits.
- Generación de consultas SQL o scripts de automatización a partir de descripciones en lenguaje natural, con validación sintáctica obligatoria antes de ejecutar nada contra una base de datos real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, curvas de pérdida, comparaciones con el modelo base ni detalles del dataset de validación.

## Requisitos de hardware

- Descarga del adaptador: 1,3 GB. Para inferir es imprescindible cargar además el modelo base de 14B, que no está incluido en el repositorio.
- VRAM en FP16/BF16: aproximadamente 28 GB solo para los pesos. El caché KV añade un coste estimado de 0,19 MB por token (base de 48 capas, 8 cabezas KV, dimensión de cabeza 128), es decir, unos 6 GB adicionales a 32 000 tokens. Recomendado: A100 80 GB o H100; una A100 40 GB queda muy justa con contexto largo.
- VRAM en 8 bits: en torno a 15 GB de pesos, viable en RTX 3090 o RTX 4090 (24 GB) con contexto moderado.
- VRAM en 4 bits (bnb, AWQ, GPTQ o GGUF Q4_K_M, aproximadamente 9 GB): cabe en GPUs de consumo de 12-16 GB, como RTX 4080 o RTX 4070 Ti Super, y con margen amplio en RTX 3090/4090.
- Otras cuantizaciones GGUF: Q5_K_M en torno a 10,5 GB y Q8_0 alrededor de 15 GB, ambos estimados a partir del número de parámetros.
- Opciones de despliegue: transformers + PEFT cargando el adaptador directamente sobre la base cuantizada; vLLM o SGLang tras fusionar los pesos con `merge_and_unload`; TGI con soporte de adaptadores; llama.cpp u Ollama tras fusionar y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| v41-lora (este adaptador) | 14B base + adaptador LoRA | 32K en la base; no documentado en el adaptador | No disponible | No disponible | 0 descargas, 0 likes |
| Qwen2.5-Coder-14B-Instruct | 14B denso | 32K, ampliable a 128K con YaRN | No comparado en esta ficha | Apache-2.0 según la información pública del modelo base, pendiente de verificar | Ampliamente distribuido |
| Qwen2.5-Coder-7B-Instruct | 7B denso | 32K, ampliable a 128K con YaRN | No comparado en esta ficha | Apache-2.0 según la información pública del modelo base, pendiente de verificar | Ampliamente distribuido |
| DeepSeek-Coder-V2-Lite-Instruct | 16B totales, 2,4B activos (MoE) | 128K | No comparado en esta ficha | Licencia propia de DeepSeek | Ampliamente distribuido |

La comparación se limita a parámetros, contexto, licencia y disponibilidad porque no existen métricas publicadas de este adaptador. La diferencia práctica más relevante frente a las alternativas es la licencia indeterminada y la ausencia total de documentación sobre datos y evaluación.

## Limitaciones y advertencias

- Licencia indeterminada: la model card incluye el marcador de posición «licence: license», por lo que no puede asumirse permiso de uso comercial. La licencia aplicable del modelo base debe verificarse antes de cualquier despliegue.
- Trazabilidad inexistente del dataset: al no documentarse los datos de SFT, no es posible evaluar sesgos, sobreajuste, contaminación de benchmarks ni posibles problemas de derechos de autor en el material generado.
- Ausencia de evaluación: sin benchmarks ni métricas, cualquier afirmación sobre la calidad del ajuste es especulativa. Es probable que el SFT haya especializado el modelo en un dominio concreto y haya degradado capacidades generales del modelo base.
- Cuantización en el entrenamiento: al haberse ajustado sobre una base bnb-4bit, puede existir una pérdida de fidelidad respecto a un ajuste equivalente en FP16, especialmente en tareas sensibles a la precisión.
- Formato de prompt desconocido: no se documenta la plantilla de chat utilizada, lo que puede provocar degradaciones severas si se aplica una plantilla distinta a la del entrenamiento.
- Contexto no verificado: aunque el modelo base soporta 32 000 tokens, no hay evidencia de que el adaptador haya sido entrenado o evaluado con secuencias largas.
- Idiomas no declarados: no puede asumirse un rendimiento multilingüe correcto, ni siquiera en castellano.
- Alucinación: como cualquier LLM, puede inventar funciones, bibliotecas o APIs inexistentes; en generación de código esto se traduce en errores de compilación o, peor, en código que compila pero es incorrecto.
- Sin filtros de contenido documentados: no hay información sobre alineación de seguridad ni sobre comportamientos de rechazo.
- Adopción nula: 0 descargas y 0 likes implican que el modelo no ha sido validado por terceros; las fechas declaradas de creación y actualización son el 17 de septiembre de 2026.
- Defectos de la propia model card: es una plantilla autogenerada por TRL con campos vacíos y un ejemplo de código que usa `model="None"`, por lo que el snippet de inicio rápido no funciona tal cual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/facemina994/v41-lora
- Modelo base utilizado: https://huggingface.co/unsloth/Qwen2.5-Coder-14B-bnb-4bit
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-14B
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de PEFT: https://huggingface.co/docs/peft
- Unsloth: https://github.com/unslothai/unsloth
- Informe técnico del modelo base: Qwen2.5-Coder Technical Report (arXiv:2409.12186)
- Citación indicada por el autor: von Werra et al., «TRL: Transformer Reinforcement Learning», 2020, repositorio de GitHub
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos corresponden a contenidos no relacionados (información sobre un automóvil y directorios de LoRA para modelos de difusión de imágenes).
