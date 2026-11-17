# mradermacher/prelude-base-i1-GGUF

## Resumen

`mradermacher/prelude-base-i1-GGUF` es una colección de cuantizaciones GGUF generadas por el usuario mradermacher a partir del modelo base `openeurollm/prelude-base`. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local mediante llama.cpp y herramientas compatibles, empleando cuantización con pesos ponderados por matriz de importancia (imatrix).

El modelo subyacente, `prelude-base`, cuenta con 9.094.607.872 parámetros (aproximadamente 9,1 mil millones) según los pesos en safetensors del repositorio original. Es un modelo de tipo base, es decir, sin ajuste fino instructivo ni alineación conversacional, por lo que su uso previsto es como punto de partida para fine-tuning o para generación de texto sin formato de chat.

La relevancia de esta ficha radica en que ofrece el modelo en múltiples niveles de cuantización (desde IQ1_S hasta Q6_K), lo que permite desplegarlo en hardware muy diverso, desde GPUs de consumo con poca VRAM hasta estaciones de trabajo. El repositorio ocupa 95,6 GB en total, reflejando la suma de todas las variantes cuantizadas publicadas. No se dispone de información sobre licencia, idiomas ni pipeline en los metadatos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 9.094.607.872 (~9,1 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL (small-IQ4_NL), Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo original en safetensors) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo `openeurollm/prelude-base` en los datos proporcionados. El recuento de parámetros (~9,1 B) es compatible con un transformer decoder-only de escala media, pero no se confirma el tipo exacto (transformer denso, MoE, híbrido SSM, etc.). Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o SFT. Al tratarse de un modelo "base", es esperable que no haya pasado por alineación conversacional, pero esto no se confirma explícitamente.

La innovación técnica destacable de este repositorio concreto es el uso de cuantización con imatrix (matriz de importancia), que pondera la precisión de cada tensor según su relevancia para la perplejidad del modelo. Esto permite que las cuantizaciones de baja precisión (IQ1, IQ2, IQ3) preserven mejor la calidad que una cuantización uniforme equivalente. El autor indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere una conversión directa desde pesos Hugging Face con cuantización de tensores de salida.

## Capacidades

- Generación de texto autoregresiva como modelo base, sin plantilla de chat ni instrucciones.
- Razonamiento y conocimiento general condicionados por el entrenamiento del modelo original (no documentado).
- Capacidad potencial de ajuste fino para tareas específicas (clasificación, extracción, resumen) al ser un modelo base.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un modelo base de ~9 B, puede ajustarse con SFT sobre datasets propios (legal, médico, técnico) y desplegarse después en GGUF para inferencia local con llama.cpp.
- Generación de texto en local con privacidad: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar el modelo en una GPU de consumo sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Prototipado de pipelines de NLP: usar la variante Q6_K o Q5_K_M para evaluar la calidad del modelo base antes de invertir en fine-tuning, gracias a la fidelidad relativamente alta de estas cuantizaciones.
- Investigación sobre cuantización: el repositorio ofrece 24 variantes del mismo modelo, lo que permite estudiar empíricamente el impacto de la precisión (de IQ1_S a Q6_K) en perplejidad y calidad de generación.
- Despliegue en hardware limitado: las variantes IQ2_M o IQ3_S permiten ejecutar un modelo de ~9 B en GPUs con 4-6 GB de VRAM, útil para pruebas en portátiles o GPUs de gama baja.
- Generación de datos sintéticos: como modelo base, puede emplearse para producir corpus de texto a gran escala para entrenar modelos menores, siempre que la licencia lo permita (no confirmada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos GGUF):
  - IQ1_S / IQ1_M: ~2-3 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: ~3-4 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: ~4-5 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / IQ4_NL: ~5-6 GB.
  - Q5_K_S / Q5_K_M: ~6-7 GB.
  - Q6_K: ~7-8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100, H100. Las variantes Q4 y Q5 caben en GPUs de consumo de 8-12 GB.
- Cabe en GPU de consumo: sí, desde una RTX 3050 8 GB con cuantizaciones IQ2/IQ3, hasta una RTX 4090 con Q6_K.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; se requeriría el modelo original en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| prelude-base-i1-GGUF (este) | ~9,1 B | no disponible | no disponible | GGUF (24 variantes) | Cuantizaciones imatrix de un modelo base |
| Llama 3.1 8B Instruct | 8,0 B | 128 K | Llama 3.1 Community | safetensors, GGUF | Modelo instructivo ampliamente soportado |
| Mistral 7B v0.3 | 7,2 B | 32 K | Apache 2.0 | safetensors, GGUF | Base y instruct, licencia permisiva |
| Gemma 2 9B | 9,2 B | 8 K | Gemma Terms | safetensors, GGUF | Tamaño comparable, requiere aceptar términos |

La comparación directa con estos modelos no es posible en términos de rendimiento porque no se han publicado benchmarks de `prelude-base`. La principal diferencia es que este repositorio ofrece únicamente el modelo base (sin alineación) y en formato GGUF, mientras que los alternativos ofrecen variantes instructivas y licencias conocidas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo original `openeurollm/prelude-base` antes de usarlo en producción.
- Modelo base sin alineación: no está optimizado para seguir instrucciones ni para conversación; requiere prompting cuidadoso o fine-tuning.
- Idiomas no documentados: se desconoce la cobertura lingüística y la calidad en castellano.
- Contexto no documentado: no se puede planificar el uso con documentos largos sin conocer la ventana máxima.
- Riesgo de alucinación: inherente a los modelos de lenguaje base, sin mitigaciones de alineación.
- Sesgos: no documentados; al no conocerse el dataset de entrenamiento, no se pueden evaluar sesgos específicos.
- Cuantizaciones muy agresivas (IQ1, IQ2): degradan notablemente la calidad; no recomendadas para producción.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; conviene verificar la integridad de los pesos antes de usarlos.
- Fecha de creación futura (2026-11-17) en los metadatos: posible error de registro; conviene contrastar con el repositorio original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/prelude-base-i1-GGUF
- Modelo original: https://huggingface.co/openeurollm/prelude-base
