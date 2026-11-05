# GainPublications/ACE-Step-1.5-lm-1.7B-GGUF

## Resumen

ACE-Step 1.5 planner es el modelo de lenguaje de 1,7 mil millones de parámetros que forma parte del sistema de generación musical ACE-Step 1.5. Su función no es sintetizar audio directamente, sino actuar como "planificador": recibe la descripción de una canción y su letra, y produce un plan estructurado (tempo, tonalidad, estructura y códigos de audio) que el generador posterior utiliza para producir la música final. Funciona a una frecuencia de 5 Hz, de ahí su denominación "5Hz LM".

Esta ficha concreta corresponde a una conversión a GGUF del modelo original, cuantizada a Q6_K por el usuario GainPublications para su uso con acestep.cpp, un runtime específico derivado de llama.cpp orientado a este sistema. Los pesos son los de ACE-Step sin modificar más allá de la conversión y la cuantización, y el resultado se distribuye bajo licencia MIT.

El interés de esta publicación es práctico: permite ejecutar el planificador de ACE-Step 1.5 en entornos con recursos limitados y en flujos de trabajo que dependen de GGUF, como la estación de trabajo musical Takehouse, que lo emplea como su planificador de menor tamaño. Al no haber métricas publicadas ni idiomas declarados, la evaluación debe basarse en las especificaciones del modelo base y en las características de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo de lenguaje del planificador ACE-Step 1.5, frecuencia de 5 Hz) |
| Parametros totales | 1.854.243.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (fichero publicado); conversión intermedia BF16 GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT (Copyright (c) 2026 ACEStep) |
| Formato de pesos | GGUF (Q6_K); origen en safetensors del modelo base |

## Arquitectura y entrenamiento

El modelo es el componente de lenguaje de ACE-Step 1.5, un sistema text-to-audio orientado a la generación musical. La arquitectura concreta del bloque transformer, el número de capas, la dimensionalidad y la ventana de contexto no se detallan en la información disponible; lo que sí se especifica es su rol: operar como planificador a 5 Hz, es decir, producir una secuencia de planificación de baja frecuencia temporal que el generador de audio consume para sintetizar la pista. El modelo base se distribuye en la carpeta `acestep-5Hz-lm-1.7B` del repositorio `ACE-Step/Ace-Step1.5`.

La información proporcionada no incluye detalles sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La conversión a GGUF se realizó con `convert.py` de acestep.cpp en el commit `de858d8e1a94f0e1939cf9bdd8ff7d9631953077`, generando primero un BF16 GGUF de 3.713.827.104 bytes y aplicando después `quantize.exe` con política de precisión mixta: `embed_tokens` en Q6_K y tensores unidimensionales (normas y sesgos) en F32. El proceso es determinista y reproducible por SHA-256. El resultado se ejecuta en acestep.cpp, no en llama.cpp estándar.

## Capacidades

- Planificación musical: convierte una descripción textual de canción y su letra en un plan con tempo, tonalidad, estructura y códigos de audio para el generador.
- Generación de códigos de audio a 5 Hz: produce la representación intermedia de baja frecuencia que alimenta al sintetizador del sistema ACE-Step 1.5.
- Condicionamiento por letra: integra la letra de la canción como entrada para alinear estructura y contenido lírico.
- Integración en pipelines text-to-audio: actúa como etapa intermedia dentro de un sistema mayor, no como modelo autónomo de audio.
- Ejecución en runtime especializado: compatible con acestep.cpp mediante el fichero GGUF Q6_K.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso

- Estación de trabajo musical Takehouse: el modelo se emplea como planificador compacto para generar planes de canción a partir de descripciones y letras, reduciendo requisitos de memoria frente al planificador de mayor tamaño.
- Generación automática de bocetos musicales: dado un prompt descriptivo ("balada en La menor a 90 BPM con estribillo doble"), el modelo produce tempo, tonalidad y estructura que el generador convierte en audio.
- Prototipado rápido en local: al ser un GGUF Q6_K de 1,5 GB, permite iterar sobre descripciones y letras en máquinas sin GPU de gama alta antes de pasar a la síntesis completa.
- Ajuste de estructura por lotes: procesar un conjunto de letras para obtener planes homogéneos de tempo y tonalidad y alimentar un pipeline de generación masiva.
- Investigación en planificación musical: estudiar cómo un LM de 1,7B representa estructura musical y códigos de audio, al ser un componente aislado y reproducible.
- Integración en herramientas de autoría: incrustar el planificador en editores o DAWs que necesiten sugerencias de estructura y tonalidad sin depender de servicios en la nube.
- Despliegue en entornos con restricciones: usar la cuantización Q6_K para ejecutar el planificador en CPU o GPU modesta dentro de un flujo acestep.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para el fichero Q6_K (1.526.792.896 bytes) más overhead de contexto y KV cache; el BF16 intermedio requiere unos 3,7 GB.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cabe en GPU de consumo con 4 GB o más de VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3050/4060 y superiores; también en CPU.
- Opciones de despliegue: acestep.cpp (runtime previsto); no está pensado para llama.cpp estándar según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ACE-Step-1.5-lm-1.7B-GGUF (esta ficha) | 1,854 M | no disponible | GGUF Q6_K | MIT | Planificador del sistema ACE-Step 1.5, para acestep.cpp |
| ACE-Step/Ace-Step1.5 (planificador 1.7B original) | 1,854 M | no disponible | safetensors (BF16) | MIT | Pesos de origen sin cuantizar |
| Planificador de mayor tamaño de ACE-Step 1.5 | no disponible | no disponible | no disponible | MIT (presumible) | Mencionado indirectamente como alternativa de mayor tamaño en Takehouse |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el generador de ACE-Step 1.5 para producir audio; su salida es un plan intermedio.
- Runtime específico: el fichero está pensado para acestep.cpp y no para llama.cpp estándar, lo que limita su portabilidad.
- Idiomas no declarados: se desconoce el soporte multilingüe real de descripciones y letras.
- Contexto no documentado: se desconoce la longitud máxima de prompt y letra que admite.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al planificador original en BF16 ni frente a la variante de mayor tamaño.
- Riesgo de planes incoherentes: como modelo generativo, puede producir estructuras musicales inconsistentes con la letra o el estilo solicitado.
- Sesgos: no documentados; al depender de datos musicales no especificados, pueden aparecer sesgos de estilo o género.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright de ACEStep y verificar la licencia del modelo base en la revisión citada.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni informes de uso en producción.

## Enlaces

- HuggingFace (esta cuantización): https://huggingface.co/GainPublications/ACE-Step-1.5-lm-1.7B-GGUF
- Modelo base: https://huggingface.co/ACE-Step/Ace-Step1.5
- Runtime acestep.cpp: https://github.com/ServeurpersoCom/acestep.cpp
- Repositorio de código de ACE-Step 1.5 (referenciado en la licencia): no disponible como URL directa en la información proporcionada
