# ijcv-ai/finbot-slm

## Resumen

finbot-slm es un adaptador LoRA de tipo PEFT publicado por ijcv-ai (autora: Inés Canales) sobre el modelo base HuggingFaceTB/SmolLM2-360M-Instruct. Se trata de un experimento educativo del "Taller de destilación en pequeño" del curso Tópicos Avanzados en IA 2 (Máster en IA, UAI), cuyo objetivo no era construir un asistente útil, sino estudiar el ciclo completo de destilación: generación de datos por un profesor (API de OpenAI), examen fijo previo, entrenamiento LoRA y examen posterior.

El dominio definido para el ejercicio es un asistente que explique conceptos de IA generativa a ejecutivos de empresas chilenas, con ejemplos de negocio, cubriendo fundamentos de LLM, ingeniería de prompts, RAG, agentes de IA, ajuste fino, evaluación y LLMOps. El estudiante es un transformer decoder de 360 M parámetros que aprendió a imitar 60 pares pregunta-respuesta en español, con un entrenamiento ejecutado íntegramente en CPU (45 pasos).

Su relevancia es metodológica, no de producto: es un ejemplo reproducible y honesto de cómo se mide el efecto real de la destilación con recursos mínimos. Los propios resultados publicados lo desaconsejan para cualquier uso real: la nota media en un examen fijo de 12 preguntas pasó de 1,25 a 2,42 sobre 10, y ninguna respuesta alcanzó el umbral de aprobación (nota ≥ 7).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder denso (SmolLM2-360M-Instruct); LoRA aplicado a down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj y v_proj |
| Parametros totales | 360 M en el modelo base; el adaptador LoRA (r=16, alpha=32) añade únicamente unos pocos millones de parámetros entrenables (cifra exacta no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No indicada en la model card; heredada del modelo base SmolLM2-360M-Instruct (8 192 tokens según la documentación pública de dicho modelo) |
| Tipos de cuantizacion | No especificados en la información disponible; al ser un adaptador PEFT se cuantiza el modelo base tras fusionar los pesos (el autor no publica versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 (heredada de SmolLM2) |
| Formato de pesos | safetensors, adaptador PEFT/LoRA (requiere `peft` + `transformers`); no se distribuyen pesos fusionados ni GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16, alpha 32 y dropout 0,05 aplicado a las siete proyecciones lineales del bloque de atención y del MLP del modelo base (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El modelo base es SmolLM2-360M-Instruct, un transformer decoder denso de la familia SmolLM2 de HuggingFaceTB, afinado para seguir instrucciones y con plantilla de chat propia, que se reutiliza sin modificar: en inferencia se cargan los pesos base y se superpone el adaptador con `PeftModel.from_pretrained`.

El entrenamiento consistió en 3 épocas, tamaño de lote 4, tasa de aprendizaje 0,001 y 45 pasos totales sobre 60 pares pregunta-respuesta en español generados por un modelo profesor vía API de OpenAI. La pérdida bajó de 2,7737 a 1,6909. Se trata de la mejor de cinco ejecuciones, cada una variando una sola variable (tamaño del estudiante, épocas y tasa de aprendizaje), lo que convierte al repositorio en un registro de ablation más que en un artefacto de producción. No se aplicaron RLHF, DPO ni ninguna etapa de alineación adicional; los datos de entrenamiento no se publican y el examen de 12 preguntas se mantuvo siempre fuera del conjunto de entrenamiento.

## Capacidades

- Generación de texto en español con plantilla de chat (role system/user/assistant) heredada de SmolLM2-360M-Instruct.
- Explicación divulgativa de conceptos de IA generativa orientada a audiencia ejecutiva: fundamentos de LLM, ingeniería de prompts, RAG, agentes, ajuste fino, evaluación y LLMOps.
- Estilo aprendido por imitación: respuestas breves con ejemplos de negocio, según el formato de los 60 pares del profesor.
- Capacidad de seguir instrucciones de sistema básicas (idioma, brevedad, tono) dentro de los límites de un modelo de 360 M.
- No soporta tool calling ni function calling de forma fiable; no se ha entrenado para ello ni se documenta esquema alguno.
- No soporta razonamiento multi-paso ni uso como agente; no dispone de modo "thinking" ni de pasos intermedios explícitos.
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüismo limitado al español declarado; el modelo base tiene vocabulario multilingüe, pero el adaptador solo se ha entrenado con datos en español.

## Casos de uso

- Material didáctico para enseñar el ciclo de destilación: el repositorio sirve como caso completo (datos del profesor, examen previo, LoRA, examen posterior) para explicar en clase qué mide realmente un ajuste fino con pocos datos y cómo interpretar un salto de 1,25 a 2,42 sobre 10.
- Práctica de ajuste fino con PEFT en CPU: 45 pasos y un modelo de 360 M hacen viable reproducir el entrenamiento en un portátil sin GPU, lo que permite experimentar con rangos LoRA, épocas y tasas de aprendizaje comparando contra las cinco corridas ya documentadas.
- Banco de pruebas de pipelines de evaluación automática: el examen fijo de 12 preguntas y el juez LLM con notas de 1 a 10 son un ejemplo directo para construir y depurar un arnés de evaluación propio antes de aplicarlo a modelos mayores.
- Ejercicio de análisis de hiperparámetros: el diseño de una variable por corrida permite estudiar el efecto aislado de tamaño del estudiante, épocas y learning rate, y contrastarlo con la pérdida final registrada.
- Demostración de despliegue de adaptadores LoRA: sirve para practicar la carga combinada de pesos base y adaptador con `transformers` + `peft`, la fusión de pesos (`merge_and_unload`) y la exportación posterior a otros runtimes.
- Docencia sobre limitaciones y uso responsable: las respuestas repetitivas y alucinadas del modelo son un ejemplo útil para ilustrar por qué un SLM con 60 ejemplos no debe emplearse para asesorar a ejecutivos ni para decisiones reales.
- Prototipado de interfaz de chat en español: válido únicamente como marcador de posición para probar la fontanería de una demo (plantilla de chat, streaming, longitud de respuesta) antes de sustituirlo por un modelo capacitado.

## Benchmarks y rendimiento

Examen fijo de 12 preguntas, nunca usado en entrenamiento. Notas de 1 a 10 asignadas por un modelo juez (OpenAI) comparando con la referencia del profesor:

| Metrica | Antes (base) | Despues (destilado) |
|---|---|---|
| Nota media | 1,25 | 2,42 |
| Aprobación (nota ≥ 7) | 0 % | 0 % |

| Tema | Antes | Despues |
|---|---|---|
| Ajuste fino | 1,00 | 2,00 |
| Ingeniería de prompts | 1,33 | 3,00 |
| RAG | 1,00 | 3,00 |
| Agentes de IA | 1,67 | 2,33 |
| Fundamentos de LLM | 1,00 | 1,50 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores proceden de un juez automático sobre 12 preguntas y el propio autor las califica de ruidosas y no equivalentes a una evaluación humana.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del modelo base en fp16 ocupan aproximadamente 0,72 GB; en fp32, unos 1,45 GB. Con caché KV y overhead del runtime, el consumo se sitúa alrededor de 2 GB en fp16 para contextos moderados. El adaptador LoRA añade unos pocos MB (el repositorio declara 0,0 GB de tamaño).
- Cuantización: al no publicarse GGUF ni pesos cuantizados, la reducción de huella requiere fusionar el adaptador y cuantizar el resultado (por ejemplo, int8 ≈ 0,36 GB o int4 ≈ 0,2 GB, estimaciones teóricas sobre 360 M de parámetros).
- GPU recomendadas: no necesita GPU. Cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) lo ejecuta con holgura; también tarjetas de 4 GB o menos, e incluso iGPU con memoria unificada.
- Cabe en CPU: el entrenamiento documentado se hizo en CPU, y la inferencia de 120 tokens nuevos es viable en un portátil convencional, aunque no se publican latencias medidas.
- Opciones de despliegue: `transformers` + `peft` es la vía nativa documentada. Para llama.cpp u Ollama habría que fusionar el adaptador (`merge_and_unload`) y convertir los pesos a GGUF. vLLM o TGI solo tras fusionar y, dado el tamaño, sin ventaja práctica frente a la inferencia directa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus respectivas model cards públicas y no de la información proporcionada en esta ficha; conviene verificarlos antes de citarlos.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ijcv-ai/finbot-slm | 360 M (base) + adaptador LoRA | No indicado (base: 8 192) | Destilación educativa desde profesor OpenAI, 60 ejemplos | Apache 2.0 | Adaptador PEFT en HuggingFace |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360 M | 8 192 | Modelo base de propósito general, afinado a instrucciones | Apache 2.0 | Pesos completos en HuggingFace |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7 B | 8 192 | Misma familia, mayor capacidad | Apache 2.0 | Pesos completos en HuggingFace |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32 768 | Alternativa de tamaño similar con contexto largo | Apache 2.0 | Pesos completos en HuggingFace |

Frente a todos ellos, finbot-slm no aporta mejor rendimiento medible: su nota media de 2,42/10 está por debajo de lo que se esperaría de un uso directo del modelo base con un buen prompt de sistema. Su valor diferencial es exclusivamente documental y didáctico.

## Limitaciones y advertencias

- Calidad muy baja demostrada: nota media de 2,42/10 y 0 % de aprobación en el examen fijo de 12 preguntas. El autor advierte explícitamente de que el modelo repite, se equivoca e inventa.
- Entrenado con solo 60 ejemplos y 45 pasos: la superficie de generalización es mínima y el adaptador está fuertemente sesgado hacia el estilo y los temas concretos del profesor.
- Riesgo alto de alucinación: puede presentar afirmaciones falsas sobre IA generativa con tono seguro, lo que es especialmente peligroso en el dominio declarado (asesorar a ejecutivos).
- Las notas provienen de un juez automático (LLM) sobre 12 preguntas: son ruidosas, sensibles al prompt del juez y no sustituyen una evaluación humana.
- Limitación idiomática: solo se ha entrenado en español; no hay garantía de comportamiento en otros idiomas ni mezcla de lenguas.
- Restricción de uso derivada del profesor: los datos de entrenamiento los generó un LLM comercial (OpenAI) y sus términos restringen emplear sus salidas para desarrollar modelos que compitan con OpenAI. El propio autor limita el modelo a fines educativos.
- Licencia Apache 2.0 heredada de SmolLM2, pero la restricción anterior relativa a las salidas de OpenAI prevalece para el adaptador en la práctica.
- Los datos de entrenamiento no se publican, por lo que no es posible auditar la composición del corpus ni reproducir el ajuste exacto.
- No apto para producción: no usar para decisiones reales ni como fuente de información sobre IA. No hay soporte de tool calling, agentes ni evaluación de seguridad.
- Sesgos: no evaluados. Un corpus de 60 ejemplos generados por un único profesor comercial transmite los sesgos y el estilo de ese modelo, sin filtrado documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ijcv-ai/finbot-slm
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Librería PEFT (requerida para cargar el adaptador): https://github.com/huggingface/peft
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- No se han encontrado en la búsqueda web papers, blogs, demos ni repositorios adicionales específicos de este modelo.
