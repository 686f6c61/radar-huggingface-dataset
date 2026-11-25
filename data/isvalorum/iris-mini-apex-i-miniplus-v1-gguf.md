# IsValorum/Iris-mini-APEX-I-MiniPlus-V1-GGUF

## Resumen

Iris-mini-APEX-I-MiniPlus-V1-GGUF es una cuantización GGUF personalizada del modelo Iris-mini, desarrollado originalmente por AllSpark-Research y cuantizado por IsValorum. Se trata de un modelo de arquitectura MoE (mixture of experts) de aproximadamente 35.500 millones de parámetros totales, derivado de la familia Qwen3.5-MoE según la etiqueta `qwen35moe`, orientado a generación de texto conversacional y razonamiento.

La particularidad de esta release no es el modelo base, sino el proceso de cuantización artesanal tensor a tensor. Frente a las cuantizaciones comunitarias genéricas que comprimen todos los expertos a 2 bits (`IQ2_S`), esta build preserva los routers en `F32` sin comprimir, protege la cabeza de salida en `Q6_K`, mantiene las puertas de atención en `Q8_0` y deja los expertos centrales en `IQ3_XXS`. El resultado es un peso de aproximadamente 14,8 GB de repositorio con un perfil de calidad declarado cercano a cuantizaciones de 3 bits planas pero con mejor fidelidad en razonamiento.

El modelo incluye soporte nativo de decodificación especulativa mediante multi-token prediction (MTP), está pensado para inferencia total o parcial en RAM de sistema y declara compatibilidad con 13 idiomas, incluido el castellano. Su licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (etiqueta `qwen35moe`), con router por token y expertos compartidos |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens (según la model card, con KV cache en VRAM y pesos en RAM) |
| Tipos de cuantizacion | GGUF mixta: routers `F32`, cabeza de salida `Q6_K`, puertas de atención `Q8_0`, expertos núcleo `IQ3_XXS`; calibrada con imatrix |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la composición del dataset de entrenamiento ni las fases de alineación (RLHF/DPO) del modelo base AllSpark-Research/Iris-mini. Lo que sí se deduce de las etiquetas y de la model card es una arquitectura MoE con enrutamiento por token, expertos compartidos (la release V2.1 menciona 40 expertos de fundación compartidos) y soporte de multi-token prediction (MTP). Esta última es una innovación relevante: el modelo puede predecir varios tokens por paso, lo que habilita decodificación especulativa nativa y reduce la latencia efectiva por token generado.

La contribución técnica de esta release es la cuantización. Se aplica una receta APEX personalizada, calibrada con imatrix, que asigna precisión de forma no uniforme: los componentes sensibles (routers, cabeza de salida, puertas de atención) reciben 8 o 6 bits, mientras que los expertos masivos se comprimen a 3 bits (`IQ3_XXS`). Además, la vectorización es lineal y compatible con CPU, lo que evita los stalls de búsqueda típicos de AVX2 en cuantizaciones de baja precisión y permite que el modelo se ejecute de forma eficiente desde RAM de sistema.

## Capacidades

- Generación de texto conversacional multi-turno en 13 idiomas, incluido castellano.
- Razonamiento y matemáticas, con perfil de contexto profundo (hasta 256K tokens).
- Generación de código y estructuración de respuestas técnicas.
- Soporte de decodificación especulativa mediante MTP, con un modelo co-piloto para acelerar la generación.
- Ejecución total o parcial en RAM de sistema, con offload selectivo a GPU.
- Compatibilidad con llama.cpp y con endpoints compatibles con la API de chat.
- Capacidad multilingüe declarada para inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.

## Casos de uso

- Asistente conversacional en local: el modelo puede gestionar diálogos multi-turno con contexto largo gracias a su ventana de hasta 256K tokens, desplegado con llama.cpp en una estación de trabajo sin GPU de gama alta.
- Razonamiento sobre documentos extensos: análisis de contratos, informes o bases de código completas que no caben en modelos de contexto corto, manteniendo los pesos en RAM y el KV cache en VRAM.
- Generación de código asistida en equipos de desarrollo: integración en editores o pipelines mediante endpoints compatibles, aprovechando la decodificación especulativa MTP para reducir la latencia por token.
- Despliegue en portátiles o equipos consumer: con aproximadamente 14,8 GB de pesos, es viable en máquinas con 32 GB de RAM y una GPU modesta, cubriendo tareas de resumen, redacción y clasificación.
- Atención al cliente multilingüe: cobertura de 13 idiomas con una sola instancia, útil para soporte en mercados internacionales sin multiplicar infraestructura.
- Prototipado e investigación: al ser una cuantización de un MoE de 35B con licencia Apache 2.0, sirve para experimentar con enrutamiento, decodificación especulativa y evaluación de calidad de cuantizaciones frente al modelo base.
- Procesamiento por lotes en CPU: la vectorización lineal compatible con CPU permite ejecutar tareas de generación por lotes en servidores sin GPU, con throughput declarado de 20 a 45 tok/s según la plataforma.

## Benchmarks y rendimiento

La model card de esta release V1 no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El único dato cuantitativo de calidad es la perplejidad reportada para la edición V2.1 de la misma familia, no para esta V1:

| Metrica | Valor |
|---|---|
| Perplejidad (V2.1, referencia de familia) | 5,3735 ± 0,1214 |
| Delta de perplejidad frente a baseline sin cuantizar | ≈ +0,06 (baseline ≈ 5,31) |
| Throughput declarado en RAM de sistema | 20–45 tok/s según CPU y DDR4/DDR5 |
| Throughput para V1 | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible para esta release concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: no es posible dar una cifra única; con offload completo a GPU se necesitan al menos ~15–16 GB de VRAM para pesos más overhead, pero el diseño está pensado para ejecución parcial o total en RAM de sistema.
- RAM de sistema recomendada: 32 GB o más para cargar los ~14,8 GB de pesos con margen para el contexto.
- GPU recomendadas: RTX 4090 (24 GB) permite el escenario de contexto completo de 256K con KV cache en VRAM; RTX 3090 y RTX 4080 (16–24 GB) son adecuadas para offload parcial; A100 y H100 quedan sobredimensionadas para este perfil.
- Cabe en GPU consumer: sí, en tarjetas de 16 GB o más con offload parcial, y en configuraciones de 24 GB para el escenario de contexto completo.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama mediante importación del GGUF, y servidores compatibles con endpoints OpenAI.
- Latencia y throughput estimados: 20–45 tok/s en inferencia desde RAM de sistema, según procesador y ancho de banda de memoria; con decodificación especulativa MTP se espera una mejora adicional no cuantificada en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Iris-mini APEX-I-MiniPlus V1 (este) | 35,5 B (MoE) | hasta 256K | Apache 2.0 | GGUF mixto | Routers F32, salida Q6_K, expertos IQ3_XXS |
| Iris-mini APEX-I-MiniPlus V2.1 | 35,5 B (MoE) | hasta 256K | Apache 2.0 | GGUF mixto | PPL 5,3735; expertos compartidos en Q5_K; recomendada por el autor |
| Cuantizaciones APEX-I-Mini genéricas de la comunidad | 35,5 B (MoE) | no disponible | Apache 2.0 | GGUF | Expertos en IQ2_S, salida en Q3_K_M; calidad inferior según el autor |
| Cuantizaciones planas de 3 bits del modelo base | 35,5 B (MoE) | no disponible | Apache 2.0 | GGUF | Sin protección selectiva de routers ni cabeza de salida |

No se dispone de comparativas con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente de que las cuantizaciones APEX genéricas de la comunidad pueden provocar picos de perplejidad, errores de sintaxis y corchetes de código rotos; esta build mitiga el problema, pero sigue siendo una cuantización de 3 bits en los expertos y puede degradar tareas de razonamiento profundo frente al modelo sin cuantizar.
- No hay datos publicados de benchmarks para esta V1, por lo que la calidad real en tareas específicas debe validarse antes de usarla en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- No se detallan sesgos conocidos del modelo base en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base AllSpark-Research/Iris-mini.
- El soporte de 256K de contexto depende de la memoria disponible; en configuraciones con poca RAM o VRAM el contexto efectivo será menor.
- El rendimiento en RAM de sistema es sensible al ancho de banda de memoria (DDR4 frente a DDR5) y al procesador; las cifras de 20–45 tok/s son estimaciones del autor, no mediciones independientes.
- El autor recomienda la edición V2.1 por encima de esta V1 para prácticamente todos los despliegues.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Iris-mini-APEX-I-MiniPlus-V1-GGUF
- Edición recomendada V2.1: https://huggingface.co/IsValorum/Iris-mini-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/AllSpark-Research/Iris-mini
- Apoyo al autor: https://ko-fi.com/isvalorum
- Papers, blogs y demos adicionales: no disponible en la información proporcionada.
