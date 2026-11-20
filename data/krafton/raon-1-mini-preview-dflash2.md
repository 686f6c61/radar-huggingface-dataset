# KRAFTON/Raon-1-mini-preview-dflash2

## Resumen

Raon-1-mini-preview-dflash2 es el modelo *draft* (borrador) de decodificación especulativa asociado a Raon-1 mini preview, un modelo de lenguaje de tipo Mixture-of-Experts desarrollado desde cero por KRAFTON AI. No se trata de un modelo autónomo: su única función es proponer tokens candidatos que el modelo principal Raon-1 mini verifica, acelerando así la generación sin alterar la distribución de salida. El repositorio pesa 5,4 GB y contiene 677.776.640 parámetros en safetensors, un tamaño coherente con un borrador ligero pensado para ejecutarse junto al modelo grande.

El modelo principal al que acompaña, Raon-1 mini, es un MoE de 28,8B parámetros totales con 4,3B activos por token, 25 capas y una arquitectura híbrida que combina 18 capas de Raon Delta Attention (atención lineal con estado de tamaño fijo) y 7 capas de Gated MLA con caché KV. Soporta de forma nativa 262.144 tokens de contexto y está entrenado específicamente para conversación en coreano y tareas agénticas, con soporte de tool calling. Se distribuye bajo licencia Apache 2.0.

La relevancia de este artefacto es práctica: la decodificación especulativa es una de las técnicas más eficaces para reducir la latencia en inferencia de modelos MoE con pocos parámetros activos, donde el cuello de botella suele ser el ancho de banda de memoria más que el cómputo. DFlash2 es la implementación propietaria de KRAFTON de este esquema, y este repositorio es el compañero necesario para activarla en vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo draft para decodificación especulativa (DFlash2); el modelo base es un MoE híbrido con RDA y Gated MLA |
| Parametros totales | 677.776.640 (modelo draft); 28,8B en el modelo base Raon-1 mini |
| Parametros activos | No aplica al draft; 4,3B en el modelo base (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens en el modelo base; no especificada para el draft |
| Tipos de cuantizacion | El modelo base ofrece MXFP8 y NVFP4; el draft se distribuye en safetensors sin cuantizaciones publicadas |
| Idiomas soportados | Coreano e inglés destacados en el modelo base; lista completa no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería vLLM) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente el modelo borrador DFlash2, diseñado para emparejarse con Raon-1 mini preview en un pipeline de decodificación especulativa. No se ha publicado información sobre la arquitectura interna del draft, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de destilación o alineación. La model card solo indica que debe usarse junto al modelo principal mediante vLLM y que no es un modelo independiente.

El modelo base, en cambio, está bien documentado: 25 capas con una disposición híbrida 3:1 entre Raon Delta Attention y Gated MLA, sin codificación posicional (NoPE), 40 cabezas de atención de dimensión 128 (RDA) y 192/128 (MLA), vocabulario de 259.840 tokens con LM head no atada, función de activación SiTU-GLU y conexiones residuales Raon-mHC con 4 flujos. RDA desacopla las puertas de borrado y escritura de Kimi Delta Attention para mejorar el contexto largo, y Raon-mHC reduce el coste computacional de las hyper-connections con restricción de variedad de DeepSeek. Solo las 7 capas MLA mantienen caché KV, aproximadamente 8 KiB por token en BF16.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: propone tokens candidatos que Raon-1 mini verifica en paralelo, reduciendo la latencia de generación.
- Integración nativa con vLLM, la librería declarada en el repositorio.
- No genera texto de forma autónoma ni debe usarse como modelo independiente.
- Hereda del modelo base el soporte de coreano e inglés, aunque el draft en sí no expone capacidades lingüísticas propias.
- No se documentan capacidades de tool calling, agentes, visión ni audio para el draft.

## Casos de uso

- Despliegue de Raon-1 mini con baja latencia: emparejar el draft con el modelo principal en vLLM para servir chat interactivo con tiempo hasta el primer token y tokens por segundo mejorados, aprovechando que el draft es ligero (677M parámetros) y cabe junto al modelo grande en la misma GPU.
- Servicio de agentes conversacionales en coreano: el modelo base está optimizado para conversación y ejecución de herramientas; el draft reduce la latencia en flujos multi-turno donde cada paso del agente requiere varias generaciones cortas.
- Procesamiento de documentos largos: con 262.144 tokens de contexto en el modelo base, la decodificación especulativa acelera la generación de resúmenes o extracciones sobre entradas extensas, donde el coste por token generado es el factor dominante.
- Evaluación comparativa de técnicas de aceleración: usar este draft como referencia para medir la ganancia real de DFlash2 frente a decodificación estándar en cargas MoE con 4,3B parámetros activos.
- Investigación en decodificación especulativa: analizar el comportamiento del borrador (tasa de aceptación, longitud media de aceptación) sobre distintos dominios y temperaturas de muestreo.
- Inferencia en una sola GPU de consumo: combinado con la cuantización NVFP4 del modelo base, que según la model card permite ejecutar Raon-1 mini en una RTX 5090 de 32 GB, el draft añade aceleración sin requerir hardware adicional significativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para el modelo draft. La model card del modelo base menciona gráficas comparativas frente a modelos abiertos en matemáticas, ciencia, seguimiento de instrucciones y búsqueda, pero los valores numéricos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM del draft: 677M parámetros; en BF16 ocupa aproximadamente 1,4 GB, y en FP8 alrededor de 0,7 GB. Debe sumarse a la memoria del modelo base.
- Modelo base en NVFP4: según la model card, permite inferencia en una única NVIDIA RTX 5090 de 32 GB.
- Modelo base en BF16: 28,8B parámetros totales implican del orden de 58 GB de pesos, por lo que requiere GPU de 80 GB (A100, H100) o reparto multi-GPU.
- GPU recomendadas: RTX 5090 para la variante NVFP4; A100 80 GB o H100 para BF16 y contextos largos.
- Despliegue: vLLM es la opción documentada y la única librería declarada en el repositorio. No se indica soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La ganancia depende de la tasa de aceptación del draft, que no se ha publicado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos borradores comparables ni datos de rendimiento de alternativas de decodificación especulativa.

## Limitaciones y advertencias

- No es un modelo autónomo: usarlo sin Raon-1 mini preview produce resultados sin sentido.
- Es una versión preview: la model card advierte que las especificaciones y resultados pueden cambiar antes de la versión final.
- Acceso restringido: el repositorio exige solicitud con datos personales (nombre, afiliación, puesto, país y uso previsto) antes de descargar los pesos.
- Sin datos publicados sobre tasa de aceptación, latencia o calidad del draft; el beneficio real en producción debe medirse.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas del draft.
- La licencia Apache 2.0 permite uso comercial, pero el acceso está condicionado a la aprobación de la solicitud.
- La información sobre cuantizaciones se refiere al modelo base, no al draft.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KRAFTON/Raon-1-mini-preview-dflash2
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Web de KRAFTON AI: https://krafton.ai/en/
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Repositorio GitHub de assets: https://github.com/krafton-ai/Raon-1-mini-preview
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
