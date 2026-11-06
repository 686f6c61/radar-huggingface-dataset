# HeckinWihOmar/PhiLLM-School

## Resumen

PhiLLM-School es un modelo de lenguaje especializado en matemáticas desarrollado de forma independiente por HeckinWihOmar (bajo el proyecto PhiLLM, sin afiliación con Microsoft ni la familia de modelos Phi). Se trata de un modelo sparse mixture-of-experts (MoE) entrenado desde cero con datos 100 % sintéticos y verificados mediante verificadores automáticos, cuyo propósito es resolver problemas de aritmética y matemáticas escolares de forma eficiente.

Su rasgo más distintivo es la arquitectura: un tronco transformer compartido y congelado, un experto compartido siempre activo y 111 columnas de expertos enrutadas, de las que solo se activan las dos mejores (top-2) por token. Esto da como resultado 9,108 B de parámetros totales pero solo 264,4 M activos por token, lo que permite ejecutar inferencia en una GPU portátil de clase 6 GB. Es relevante como ejemplo de cómo una arquitectura MoE extrema con enrutamiento por especialidad puede competir en una tarea concreta (matemáticas de plantilla sintética) con un coste de cómputo mínimo, aunque no es un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con sparse mixture-of-experts (tronco compartido congelado + experto compartido + 111 expertos enrutados, top-2) |
| Parametros totales | 9,108 B |
| Parametros activos | 264,4 M por token |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | bfloat16 (inferencia documentada); no disponible información sobre otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (modelo); CC BY 4.0 (datos, si se incluyen) |
| Formato de pesos | safetensors (tronco, experto compartido, router y expertos individuales en `experts/*.safetensors`) |

## Arquitectura y entrenamiento

PhiLLM-School emplea una arquitectura MoE sparse entrenada desde cero. El diseño se compone de cuatro elementos: un tronco transformer compartido que permanece congelado, un experto compartido siempre activo ("always-on shared expert"), un router que asigna cada token a expertos, y 111 columnas de expertos especializadas de las que se cargan las dos mejores por token en inferencia. Los pesos de los expertos se cargan mediante memory-mapping desde disco, de modo que no es necesario mantener los 9,108 B de parámetros en VRAM: solo el tronco, el experto compartido, el router y los dos expertos activos.

El entrenamiento se realizó íntegramente con datos sintéticos verificados por verificadores automáticos (verifier-checked), lo que garantiza la corrección de las soluciones de matemáticas empleadas. No hay información disponible sobre el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO. El tokenizador es un BPE con división por dígitos (digit-split) y vocabulario de 1.109 entradas, una elección orientada a la generación fiable de números. No se documentan técnicas adicionales como decodificación especulativa o attention lineal.

## Capacidades

- Generación de texto orientada a resolución de problemas matemáticos (aritmética y matemáticas de nivel escolar) en inglés.
- Razonamiento matemático sobre plantillas sintéticas: suma, y otras operaciones cubiertas por los "cores" del dataset sintético (detalle por core en `MODEL_CARD.md`).
- Modo tool-assisted: la evaluación muestra un modo asistido por herramientas que eleva la precisión (99,37 % frente a 97,57 % en distribución).
- Extracción de respuesta estructurada mediante `extract_answer` en el código de inferencia.
- Enrutamiento por especialidad: el router selecciona expertos según el tipo de problema, aunque el enrutamiento fuera de distribución (OOD) es débil (33,3 % top-1 en la sonda de dificultad desplazada).
- No es un modelo de propósito general: no está diseñado para conversación abierta, código, visión ni audio.
- No hay soporte documentado de tool calling / function calling en formato API ni de agentes multi-step.

## Casos de uso

- Resolución de aritmética escolar en aplicaciones educativas: el modelo puede calcular operaciones como "What is 12 + 7?" con alta precisión (97,57 % exact match en distribución), adecuado para tutores matemáticos automatizados.
- Generación de datos matemáticos verificados: al entrenarse con datos sintéticos verificados, puede integrarse en pipelines que generan y comprueban ejercicios matemáticos de plantilla.
- Investigación en arquitecturas MoE: su diseño extremo (111 expertos, top-2, tronco congelado) lo hace útil como banco de pruebas para estudiar enrutamiento, carga de expertos bajo demanda y memory-mapping de pesos.
- Inferencia en hardware modesto: con solo 264,4 M de parámetros activos y requerimiento de GPU de 6 GB, es viable en portátiles para demos de matemáticas sin servidor dedicado.
- Verificación de cálculo en flujos tool-assisted: combinado con herramientas externas de cálculo, alcanza 99,37 % de exact match, útil como componente de verificación aritmética.
- Estudio de generalización OOD: las sondas de dificultad desplazada (90,86 % exact match, 33,3 % top-1 en routing OOD) lo hacen interesante para investigar los límites de la generalización en modelos especializados.
- Prototipado de tokenizadores digit-split: el tokenizador BPE con vocabulario de 1.109 y división por dígitos puede reutilizarse en proyectos de generación numérica fiable.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks públicos (GSM8K, MATH, AMC, AIME). El autor publica evaluaciones sobre plantillas sintéticas propias, no comparables con benchmarks estándar:

| Sonda | Exact match |
|---|---:|
| In-distribution, model-only | 97,57 % |
| In-distribution, tool-assisted | 99,37 % |
| Paraphrased | 93,09 % |
| OOD difficulty-shifted | 90,86 % |

El enrutamiento OOD alcanza solo 33,3 % de top-1 en la sonda de dificultad desplazada. Los intervalos de confianza y resultados por core están en `MODEL_CARD.md`.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 6 GB (GPU portátil de clase 6 GB), ya que solo se cargan el tronco, el experto compartido, el router y los 2 expertos activos en bfloat16.
- Espacio en disco: mantener aproximadamente 40 GB libres para el conjunto completo de expertos y overhead del runtime (el repositorio pesa 18,2 GB).
- No se requieren GPU de datacenter: cabe en GPUs de consumo de gama media (clase RTX 3060 portátil o superior con 6 GB); no disponible una lista concreta de GPUs recomendadas.
- Los pesos de expertos se cargan por memory-mapping desde disco, por lo que la velocidad de almacenamiento (preferible SSD NVMe) influye en el rendimiento.
- Despliegue: mediante el paquete propio `phillm` (PyTorch + safetensors + tokenizers), con módulos `phillm.inference.chat` y `phillm.inference.generate`. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Modelos especializados en matemáticas de tamaño comparable en parámetros activos:

| Modelo | Parametros totales | Parametros activos | Contexto | Especializacion | Licencia |
|---|---|---|---|---|---|
| PhiLLM-School | 9,108 B | 264,4 M | 512 tokens | Matematicas sinteticas (plantillas) | Apache-2.0 |
| Qwen2.5-Math-1.5B | ~1,5 B | ~1,5 B (denso) | 4.096 tokens | Matematicas (GSM8K, MATH) | Qwen (uso comercial con condiciones) |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5 B | ~1,5 B (denso) | 131.072 tokens | Razonamiento matematico general | MIT |

PhiLLM-School destaca por su coste de inferencia mínimo (264,4 M activos) y licencia permisiva, pero su contexto de 512 tokens y su alcance limitado a plantillas sintéticas lo hacen mucho menos versátil que las alternativas densas, que sí rinden en benchmarks públicos de matemáticas.

## Limitaciones y advertencias

- Es un modelo exclusivamente matemático sobre plantillas sintéticas; no es de propósito general y no debe usarse para conversación abierta ni tareas fuera del dominio matemático.
- No comparable con benchmarks públicos (GSM8K, MATH, AMC, AIME): las cifras publicadas corresponden a sondas sintéticas propias.
- El enrutamiento fuera de distribución (OOD) es débil: 33,3 % de top-1 en la sonda de dificultad desplazada, lo que implica degradación significativa ante problemas que se apartan de las plantillas de entrenamiento.
- No está ajustado en seguridad (not safety-tuned); el autor advierte explícitamente de no usarlo para decisiones de alto impacto.
- Riesgo de alucinación numérica fuera de distribución: la exact match cae de 97,57 % a 90,86 % con dificultad desplazada y a 93,09 % con paráfrasis.
- Contexto de solo 512 tokens, insuficiente para problemas largos o conversaciones multi-turno extensas.
- Idioma limitado al inglés; no disponible soporte para castellano.
- Requiere ~40 GB de espacio en disco para el conjunto completo de expertos, pese a la baja VRAM de inferencia.
- Requiere el runtime propio `phillm` (PyTorch); no hay integración con ecosistemas estándar de inferencia (llama.cpp, vLLM, Ollama).
- A pesar del nombre, no está afiliado a Microsoft ni a la familia Phi.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeckinWihOmar/PhiLLM-School
- Model card técnica: `MODEL_CARD.md` en el repositorio (arquitectura, evaluación, limitaciones)
- Data card: `DATA_CARD.md` en el repositorio (procedencia de los datos)
- Notificaciones de terceros: `THIRD_PARTY_NOTICES.md` en el repositorio
- No se han encontrado enlaces adicionales (papers, blogs, demos) en la información disponible.
